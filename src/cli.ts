import * as program from "commander";

import { main } from "./main";

const cli = () => {
    const command = program
        .version("0.1.0")
        .option("-l, --language [language]", "language to convert to")
        .parse(process.argv);
    const files = program.args as string[];

    if (files.length === 0) {
        command.help();
        return;
    }

    const runtime = main({
        files,
        languageName: program.language as string,
        logger: console,
    });

    runtime.then((exitCode) => {
        process.exitCode = exitCode;
    });
};

cli();
