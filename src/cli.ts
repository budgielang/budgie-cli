import * as program from "commander";

import { ILogger } from "./logger";
import { main } from "./main";
import { printCliVersions } from "./version";

const cli = async (logger: ILogger) => {
    const command = program
        .option("-l, --language [language]", "language to convert to")
        .option("-v, --version", "output the CLI and GLS version numbers")
        .parse(process.argv);

    if (command.hasOwnProperty("version")) {
        await printCliVersions(logger);
        return;
    }

    const files = program.args as string[];

    if (files.length === 0) {
        command.help();
        return;
    }

    const exitCode = await main({
        files,
        languageName: program.language as string,
        logger: console,
    });

    process.exitCode = exitCode;
};

cli(console).catch((error) => {
    // tslint:disable-next-line:no-console
    console.log(`Error in gls-cli: ${error}`);
});
