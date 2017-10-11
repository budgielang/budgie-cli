import * as program from "commander";

import { ILogger } from "./logger";
import { main } from "./main";
import { globAllAsync } from "./utils/glob";
import { printCliVersions } from "./version";

interface ICliProgram {
    args: string[];
    language?: string;
    tsconfig?: string;
    help(): void;
}

const cli = async (logger: ILogger) => {
    const command = program
        .usage("[options] <file ...> --language [language]")
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
        .parse(process.argv) as ICliProgram;

    if (command.hasOwnProperty("version")) {
        await printCliVersions(logger);
        return;
    }

    if (command.args.length === 0) {
        command.help();
        return;
    }

    const files = await globAllAsync(command.args);

    const exitCode = await main({
        files,
        languageName: command.language as string,
        logger: console,
        typescriptConfig: command.tsconfig,
    });

    process.exitCode = exitCode;
};

cli(console).catch((error) => {
    // tslint:disable-next-line:no-console
    console.log(`Error in gls-cli: ${error}`);
});
