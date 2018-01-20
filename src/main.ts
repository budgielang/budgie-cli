import chalk from "chalk";
import { Language, LanguagesBag } from "general-language-syntax";

import { FileSystem } from "./files";
import { ILogger } from "./logger";
import { createRunner } from "./runnerFactory";

export enum ExitCode {
    Ok = 0,
    Error = 1,
}

export interface IMainDependencies {
    /**
     * Unique file paths to convert.
     */
    files: Set<string>;

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

export type IMain = (dependencies: IMainDependencies) => Promise<number>;

export const main: IMain = async (dependencies: IMainDependencies): Promise<number> => {
    const printAvailableLanguages = (languageNames: string[]) => {
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
            fileSystem: new FileSystem(),
            language,
            logger: dependencies.logger,
        });

        await runner.run({
            files: dependencies.files,
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
