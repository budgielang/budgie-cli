import * as commander from "commander";

import { ExitCode } from "../codes";
import { FileSystem, IFileSystem } from "../fileSystem";
import { ILogger, parseVerbosity, wrapLoggerForVerbosity } from "../logger";
import { IMain, main } from "../main";
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
     * Base or root directory to ignore from the beginning of file paths, such as "src/", if not "".
     */
    baseDirectory?: string;

    /**
     * File glob(s) to exclude.
     */
    exclude?: string | ReadonlyArray<string>;

    /**
     * Output language(s) to convert to.
     */
    language?: string | ReadonlyArray<string>;

    /**
     * Budgie configuration project, if provided.
     */
    project?: string;

    /**
     * Namespace before path names, such as "Budgie", if not "".
     */
    namespace?: string;

    /**
     * TypeScript configuration project, if provided.
     */
    tsconfig?: string;

    /**
     * Minimum importance level of logs to print.
     */
    verbosity?: string;

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
        .option("-b, --base-directory [base-directory]", "base directory to ignore from the beginning of file paths")
        .option("-e, --exclude [exclude...]", "file glob(s) to exclude")
        .option("-l, --language [language...]", "language(s) to convert to")
        .option("-l, --project [project]", "budgie.json project metadata file")
        .option("-n, --namespace [namespace]", "namespace before output path names")
        .option("-t, --tsconfig [tsconfig]", "(TypeScript only) configuration project")
        .option("-v, --verbosity [verbosity]", `Minimum logged verbosity level: "error" (default) or "log"`)
        .option("-V, --version", "output the CLI and Budgie version numbers")
        .on("--help", (): void => {
            logger.log();
            logger.log("  Basic Budgie conversion:");
            logger.log();
            logger.log("    $ budgie --language Python file.bg");
            logger.log();
            logger.log("  Converting a TypeScript project to Budgie, then to Python and Ruby:");
            logger.log();
            logger.log("    $ budgie --language Python --language Ruby --tsconfig ./tsconfig ./*.ts");
            logger.log();
            logger.log("  Converting a TypeScript project to Budgie, then to C#, replacing the 'src' path with 'Budgie':");
            logger.log();
            logger.log("    $ budgie --base-directory src/ --language C# --namespace Budgie --tsconfig ./tsconfig ./**/*.ts");
            logger.log();
        })
        .parse(argv as string[]) as IParsedArguments;

    if ({}.hasOwnProperty.call(command, "version")) {
        await printCliVersions(logger);
        return ExitCode.Ok;
    }

    if (command.args.length === 0) {
        command.help();
        return ExitCode.Ok;
    }

    const [includes, excludes] = await Promise.all([globber(command.args), getExcludes(command.exclude, globber)]);

    const filePaths = new Set(includes);
    for (const exclude of excludes) {
        filePaths.delete(exclude);
    }

    const languageNames = command.language !== undefined && typeof command.language === "string" ? [command.language] : command.language;

    const project = command.project === "false" ? undefined : command.project === undefined ? "budgie.json" : command.project;

    const verbosity = parseVerbosity(command.verbosity);
    if (verbosity === undefined) {
        logger.error(`Unknown verbosity requested: '${command.verbosity}'.`);
        return ExitCode.Error;
    }

    return mainExecutor({
        baseDirectory: command.baseDirectory,
        filePaths,
        fileSystem,
        languageNames,
        logger: wrapLoggerForVerbosity(logger, verbosity),
        namespace: command.namespace,
        project,
        typescriptConfig: command.tsconfig,
    });
};
