import * as commander from "commander";

import { FileSystem, IFileSystem } from "../files";
import { ILogger } from "../logger";
import { ExitCode, IMain, main } from "../main";
import { globAllAsync, IGlobAllAsync } from "../utils/glob";
import { defaultValue } from "../utils/values";
import { getExcludes } from "./exclude";
import { printCliVersions } from "./version";

/**
 * Dependencies to run the CLI.
 */
export interface ICliDependencies {
    /**
     * Raw argv-style string args from a command-line.
     */
    argv: ReadonlyArray<string>;

    /**
     * System to read and write files, if not an fs-based default.
     */
    fileSystem?: IFileSystem;

    /**
     * Finds file names from glob patterns, if not a glob-based default.
     */
    globber?: IGlobAllAsync;

    /**
     * Logs information, if not the console.
     */
    logger?: ILogger;

    /**
     * Main method to pass parsed arguments into.
     */
    main?: IMain;
}

/**
 * Commander-parsed arguments passed in.
 */
interface IParsedArguments {
    /**
     * Raw args to be used as file globs.
     */
    args: ReadonlyArray<string>;

    /**
     * File glob(s) to exclude.
     */
    exclude?: string | ReadonlyArray<string>;

    /**
     * GLS language to convert to.
     */
    language?: string;

    /**
     * TypeScript configuration project, if provided.
     */
    tsconfig?: string;

    /**
     * Displays help text via the logger.
     */
    help(): void;
}

/**
 * Parses raw string arguments and, if they're valid, calls to a main method.
 *
 * @param dependencies   Raw string arguments and any system dependency overrides.
 * @returns Promise for the result of the main method.
 */
export const cli = async (dependencies: ICliDependencies): Promise<ExitCode> => {
    const { argv } = dependencies;
    const fileSystem = defaultValue(dependencies.fileSystem, () => new FileSystem());
    const globber = defaultValue(dependencies.globber, () => globAllAsync);
    const logger = defaultValue(dependencies.logger, () => console);
    const mainExecutor = defaultValue(dependencies.main, () => main);

    const command = new commander.Command()
        .usage("[options] <file ...> --language [language]")
        .option("-e, --exclude [exclude]", "file glob(s) to exclude")
        .option("-l, --language [language]", "language to convert to")
        .option("-t, --tsconfig [tsconfig]", "(TypeScript only) configuration project")
        .option("-v, --version", "output the CLI and GLS version numbers")
        .on("--help", (): void => {
            logger.log();
            logger.log("  Basic GLS conversion:");
            logger.log();
            logger.log("    $ gls --language Python file.gls");
            logger.log();
            logger.log("  Converting a TypeScript project to GLS, then to Java:");
            logger.log();
            logger.log("    $ gls --language Java --tsconfig ./tsconfig ./src/*.ts");
            logger.log();
        })
        .parse(argv as string[]) as IParsedArguments;

    if (command.hasOwnProperty("version")) {
        await printCliVersions(logger);
        return ExitCode.Ok;
    }

    if (command.args.length === 0) {
        command.help();
        return ExitCode.Ok;
    }

    const [includes, excludes] = await Promise.all([
        globber(command.args),
        getExcludes(command.exclude, globber),
    ]);

    const files = new Set(includes);
    for (const exclude of excludes) {
        files.delete(exclude);
    }

    return mainExecutor({
        fileSystem,
        files,
        languageName: command.language as string,
        logger: console,
        typescriptConfig: command.tsconfig,
    });
};
