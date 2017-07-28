import * as chalk from "chalk";
import { EOL } from "os";

import { ConversionStatus, IConverter } from "./converter";
import { IFileSystem } from "./files";
import { ILogger } from "./logger";

export interface IOptions {
    files: string[];
}

export interface IRunnerDependencies {
    converter: IConverter;
    fileSystem: IFileSystem;
    logger: ILogger;
}

export class Runner {
    private readonly dependencies: IRunnerDependencies;

    public constructor(dependencies: IRunnerDependencies) {
        this.dependencies = dependencies;
    }

    public async run(options: IOptions) {
        const results = await Promise.all(
            options.files.map(
                (fileName) => this.runOnFile(fileName)));
    }

    private runOnFile = async (filePath: string) => {
        this.dependencies.logger.log(
            chalk.grey("Converting"),
            `${filePath}${chalk.grey("...")}`);

        const result = await this.dependencies.converter.convertFile(filePath);

        if (result.status === ConversionStatus.Failed) {
            this.dependencies.logger.error(
                chalk.italic.red("Failed converting"),
                chalk.red.bold(filePath),
                chalk.red(result.error.message));
            return;
        }

        const outputPath = this.dependencies.converter.convertFilePath(filePath);

        this.dependencies.fileSystem.writeFile(outputPath, result.lines.join(EOL));

        this.dependencies.logger.error(
            chalk.italic("Converted"),
            chalk.bold(filePath),
            chalk.italic("to"),
            chalk.bold.green(outputPath));
    }
}
