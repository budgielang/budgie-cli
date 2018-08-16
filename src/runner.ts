import chalk from "chalk";
import { EOL } from "os";

import { ConversionStatus, IConversionResult } from "./converter";
import { Coordinator } from "./coordinator";
import { IFileSystem } from "./files";
import { ILogger } from "./logger";
import { queueAsyncActions } from "./utils/asyncQueue";
import { indent } from "./utils/text";

/**
 * Options to convert a set of files.
 */
export interface IRunOptions {
    /**
     * Contents of file paths to convert, keyed by unique file name.
     */
    files: Map<string, string>;

    /**
     * TypeScript configuration project, if provided.
     */
    typescriptConfig?: string;
}

/**
 * Conversion results for a set of files, keyed by file path.
 */
export interface IFileResults {
    [i: string]: IConversionResult;
}

/**
 * Results from converting a set of files.
 */
export interface IRunResults {
    /**
     * Conversion results for the files, keyed by file path.
     */
    fileResults: IFileResults;
}

/**
 * Dependencies to initialize an instance of the Runner class.
 */
export interface IRunnerDependencies {
    /**
     * Coordinates converting files to their language outputs.
     */
    coordinator: Coordinator;

    /**
     * Reads and writes files.
     */
    fileSystem: IFileSystem;

    /**
     * Logs information on significant events.
     */
    logger: ILogger;
}

/**
 * Persistent runner for converting files.
 */
export class Runner {
    /**
     * Dependencies used for initialization.
     */
    private readonly dependencies: IRunnerDependencies;

    /**
     * Initializes a new instance of the Runner class.
     *
     * @param dependencies   Dependencies to be used for initialization.
     */
    public constructor(dependencies: IRunnerDependencies) {
        this.dependencies = dependencies;
    }

    /**
     * Converts a set of files.
     *
     * @param options   Options for converting files.
     * @returns A Promise for converting the files.
     */
    public async run(options: IRunOptions): Promise<IRunResults> {
        const fileResults: IFileResults = {};

        await queueAsyncActions(
            Array.from(options.files)
                .map(([fileName, fileContents]) =>
                    async () => {
                        await this.runOnFile(fileName, options)
                            .then((result: IConversionResult) => {
                                fileResults[fileName] = result;
                            });
                        }));

        this.dependencies.logger.log(
            chalk.italic("Ran on"),
            chalk.bold(`${options.files.size}`),
            chalk.italic(`file${options.files.size === 1 ? "" : "s"}.`));

        return { fileResults };
    }

    /**
     * Converts a file.
     *
     * @param filePath   Path to the file.
     * @param options   Options for converting files.
     * @returns A Promise for converting the file.
     */
    private readonly runOnFile = async (filePath: string, options: IRunOptions) => {
        this.dependencies.logger.log(
            chalk.grey("Converting"),
            `${filePath}${chalk.grey("...")}`);

        const result = await this.dependencies.coordinator.convertFile(filePath, options);

        if (result.status === ConversionStatus.Failed) {
            this.dependencies.logger.error(
                chalk.grey.italic("Failed converting"),
                [
                    chalk.red.bold(filePath),
                    chalk.grey.italic(":"),
                    EOL,
                    indent(chalk.italic.red(result.error.stack === undefined ? result.error.message : result.error.stack)),
                ].join(""));
        } else {
            this.dependencies.logger.log(
                chalk.italic("Converted"),
                chalk.bold(filePath),
                chalk.italic("to"),
                chalk.bold.green(result.outputPath));
        }

        return result;
    }
}
