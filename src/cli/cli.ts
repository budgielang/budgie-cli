import * as commander from "commander";

import { ILogger } from "../logger";
import { ExitCode, IMain, main } from "../main";
import { globAllAsync, IGlobAllAsync } from "../utils/glob";
import { getExcludes } from "./exclude";
import { printCliVersions } from "./version";

interface ICliProgram {
    args: string[];
    exclude?: string | string[];
    language?: string;
    tsconfig?: string;
    help(): void;
}

export interface ICliDependencies {
    argv: string[];
    globber?: IGlobAllAsync;
    logger?: ILogger;
    main?: IMain;
}

const defaultMember = <T>(member: T | undefined, defaultValue: T): T =>
    member === undefined ? defaultValue : member;

export const cli = async (dependencies: ICliDependencies): Promise<ExitCode> => {
    const { argv } = dependencies;
    const globber = defaultMember(dependencies.globber, globAllAsync);
    const logger = defaultMember(dependencies.logger, console);
    const mainExecutor = defaultMember(dependencies.main, main);

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
        .parse(argv) as ICliProgram;

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

    return await mainExecutor({
        files,
        languageName: command.language as string,
        logger: console,
        typescriptConfig: command.tsconfig,
    });
};
