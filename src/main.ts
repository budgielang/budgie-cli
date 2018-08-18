import chalk from "chalk";
import { Language, LanguagesBag } from "general-language-syntax";

import { IFileSystem } from "./files";
import { ILogger } from "./logger";
import { createRunner } from "./runner/runnerFactory";
import { queueAsyncActions } from "./utils/asyncQueue";

export enum ExitCode {
    Ok = 0,
    Error = 1,
}

/**
 * Dependencies to set up and run a runner.
 */
export interface IMainDependencies {
    /**
     * Unique file paths to convert.
     */
    files: ReadonlySet<string>;

    /**
     * Reads and writes files.
     */
    fileSystem: IFileSystem;

    /**
     * Name of the GLS language to convert to.
     */
    languageName?: string;

    /**
     * Logs information on significant events.
     */
    logger: ILogger;

    /**
     * TypeScript configuration project, if provided.
     */
    typescriptConfig?: string;
}

/**
 * Reads a set of file paths into memory.
 *
 * @param filePaths   Unique file paths to read in.
 * @param fileSystem   Reads and writes files.
 * @returns File contents of the files, keyed by file path.
 */
const readFilesFromSystem = async (filePaths: ReadonlySet<string>, fileSystem: IFileSystem) => {
    const map = new Map<string, string>();

    await queueAsyncActions(
        Array.from(filePaths)
            .map((filePath: string) =>
                async () => {
                    map.set(filePath, await fileSystem.readFile(filePath));
                }));

    return map;
};

/**
 * Validates GLS settings, sets up a conversion runner, and runs it.
 *
 * @param dependencies   Dependencies to set up and run a runner.
 */
export const main = async (dependencies: IMainDependencies): Promise<ExitCode> => {
    const printAvailableLanguages = (languageNames: ReadonlyArray<string>) => {
        dependencies.logger.log("Available languages:");

        for (const languageName of languageNames) {
            dependencies.logger.log(`\t${languageName}`);
        }
    };

    const getLanguageFromName = (languageName?: string): Language | undefined => {
        const languagesBag = new LanguagesBag();
        const languageNames = languagesBag.getLanguageNames();

        if (languageName === undefined) {
            dependencies.logger.error("You must provide a -l/--language.");
            printAvailableLanguages(languageNames);
            return undefined;
        }

        if (languageNames.indexOf(languageName) === -1) {
            dependencies.logger.error(`Unknown language name: '${chalk.bold(languageName)}'.`);
            printAvailableLanguages(languageNames);
            return undefined;
        }

        return languagesBag.getLanguageByName(languageName);
    };

    const run = async (): Promise<number> => {
        const language = getLanguageFromName(dependencies.languageName);
        if (language === undefined) {
            return ExitCode.Error;
        }

        const runner = createRunner({
            fileSystem: dependencies.fileSystem,
            language,
            logger: dependencies.logger,
        });

        await runner.run({
            existingFileContents: await readFilesFromSystem(dependencies.files, dependencies.fileSystem),
            requestedFiles: dependencies.files,
            typescriptConfig: dependencies.typescriptConfig,
        });

        return ExitCode.Ok;
    };

    try {
        return await run();
    } catch (error) {
        dependencies.logger.error(error.message);
        return ExitCode.Error;
    }
};

export type IMain = typeof main;
