import chalk from "chalk";
import { Language, LanguagesBag } from "general-language-syntax";

import { ExitCode } from "./codes";
import { convertFiles } from "./conversions/convertFiles";
import { ConversionStatus } from "./converters/converter";
import { createConvertersBag } from "./converters/convertersBag";
import { IFileSystem } from "./fileSystem";
import { ILogger } from "./logger";
import { IGlsProjectMetadata } from "./postprocessing/metadata";
import { postprocess } from "./postprocessing/postprocess";
import { preprocessFiles } from "./preprocessing/preprocessFiles";
import { queueAsyncActions } from "./utils/asyncQueue";

/**
 * Dependencies to set up and run a runner.
 */
export interface IMainDependencies {
    /**
     * Base or root directory to ignore from the beginning of file paths, such as "src/", if not "".
     */
    baseDirectory?: string;

    /**
     * Unique file paths to convert.
     */
    filePaths: ReadonlySet<string>;

    /**
     * Reads and writes files.
     */
    fileSystem: IFileSystem;

    /**
     * Names of output language(s) to convert to.
     */
    languageNames?: ReadonlyArray<string>;

    /**
     * Logs information on significant events.
     */
    logger: ILogger;

    /**
     * Namespace before path names, such as "Gls", if not "".
     */
    namespace?: string;

    /**
     * GLS configuration project, if provided.
     */
    project?: string;

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
        Array.from(filePaths).map((filePath: string) => async () => {
            map.set(filePath, await fileSystem.readFile(filePath));
        }),
    );

    return map;
};

const getProjectMetadata = async (project: string | undefined, fileSystem: IFileSystem) => {
    if (project === undefined) {
        return undefined;
    }

    try {
        return JSON.parse(await fileSystem.readFile(project)) as IGlsProjectMetadata;
    } catch (error) {
        return error;
    }
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
            dependencies.logger.log(`    ${languageName}`);
        }
    };

    const getLanguagesFromNames = (languageNames: ReadonlyArray<string> | undefined): Language[] | undefined => {
        const languagesBag = new LanguagesBag();
        const supportedLanguageNames = languagesBag.getLanguageNames();

        if (languageNames === undefined || languageNames.length === 0) {
            dependencies.logger.error("You must provide a -l/--language.");
            printAvailableLanguages(supportedLanguageNames);
            return undefined;
        }

        const languages = [];

        for (const languageName of languageNames) {
            if (languageNames.indexOf(languageName) === -1) {
                dependencies.logger.error(`Unknown language name: '${chalk.bold(languageName)}'.`);
                printAvailableLanguages(languageNames);
                return undefined;
            }

            languages.push(languagesBag.getLanguageByName(languageName));
        }

        return languages;
    };

    const run = async (): Promise<ExitCode> => {
        // 0a: Retrieve corresponding GLS languages for -l/--language
        const languages = getLanguagesFromNames(dependencies.languageNames);
        if (languages === undefined) {
            return ExitCode.Error;
        }

        // 0b: Read project metadata if a GLS project file is provided
        const metadata = await getProjectMetadata(dependencies.project, dependencies.fileSystem);
        if (metadata instanceof Error) {
            return ExitCode.Error;
        }

        // 0c: Create language preprocessor converters per known language type
        const existingFileContents = await readFilesFromSystem(dependencies.filePaths, dependencies.fileSystem);
        const convertersBag = createConvertersBag({
            baseDirectory: dependencies.baseDirectory,
            existingFileContents,
            fileSystem: dependencies.fileSystem,
            logger: dependencies.logger,
            metadata,
            outputNamespace: dependencies.namespace,
            typescriptConfig: dependencies.typescriptConfig,
        });

        // 1: Preprocess any known language types, such as .ts, to .gls files
        const preprocessResult = await preprocessFiles({
            convertersBag,
            filePaths: dependencies.filePaths,
            fileSystem: dependencies.fileSystem,
            languages,
            logger: dependencies.logger,
        });

        if (preprocessResult.status === ConversionStatus.Failed) {
            return ExitCode.Error;
        }

        // 2: Convert all .gls files to the output language
        const conversionResults = await convertFiles({
            baseDirectory: dependencies.baseDirectory,
            existingFileContents,
            fileSystem: dependencies.fileSystem,
            glsFilePaths: preprocessResult.glsFilePaths,
            languages,
            logger: dependencies.logger,
            outputNamespace: dependencies.namespace,
            typescriptConfig: dependencies.typescriptConfig,
        });

        if (conversionResults.status === ConversionStatus.Failed) {
            return ExitCode.Error;
        }

        // 3: Create project metadata files (and soon exports)
        await postprocess({
            fileSystem: dependencies.fileSystem,
            languages,
            logger: dependencies.logger,
            project: dependencies.project,
        });

        return ExitCode.Ok;
    };

    try {
        return await run();
    } catch (error) {
        dependencies.logger.error(error.stack);
        return ExitCode.Error;
    }
};

export type IMain = typeof main;
