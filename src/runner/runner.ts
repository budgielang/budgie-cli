import chalk from "chalk";
import { EOL } from "os";

import { ConversionStatus, IFailedConversionResult, ISuccessfulConversionResult } from "../converter";
import { FileCoordinator } from "../fileCoordinator";
import { IFileSystem } from "../files";
import { ILogger } from "../logger";
import { queueAsyncActions } from "../utils/asyncQueue";
import { indent } from "../utils/text";

/**
 * Options to convert a set of files.
 */
export interface IRunOptions {
    /**
     * Cache of contents of file paths to convert, keyed by unique file name.
     *
     * @remarks This may be added to by converters as they need more files.
     */
    existingFileContents: Map<string, string>;

    /**
     * Base or root directory to ignore from the beginning of file paths, such as "src/", if not "".
     */
    baseDirectory?: string;

    /**
     * Namespace before path names, such as "Gls", if not "".
     */
    outputNamespace?: string;

    /**
     * File paths requested to be converted.
     */
    requestedFiles: ReadonlySet<string>;

    /**
     * TypeScript configuration project file path, if provided.
     */
    typescriptConfig?: string;
}

/**
 * Conversion results for a single file.
 */
interface IFileRunResults {
    /**
     * Language conversions that failed.
     */
    failures: IFailedConversionResult[];

    /**
     * Language conversions that succeeded.
     */
    successes: ISuccessfulConversionResult[];
}

/**
 * Dependencies to initialize an instance of the Runner class.
 */
export interface IRunnerDependencies {
    /**
     * Coordinates converting files to each target language's outputs.
     */
    coordinators: FileCoordinator[];

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
     * @returns Promise for converting the files.
     */
    public async run(options: IRunOptions): Promise<void> {
        const failures: IFailedConversionResult[] = [];
        const successes: ISuccessfulConversionResult[] = [];

        this.dependencies.logger.log(`Starting conversion on ${options.requestedFiles.size} files...`);

        await queueAsyncActions(
            Array.from(options.requestedFiles).map((fileName) => async () => {
                const result = await this.runOnFile(fileName, options);

                failures.push(...result.failures);
                successes.push(...result.successes);
            }),
        );

        const output = [
            chalk.italic("Ran"),
            chalk.bold(`${failures.length + successes.length}`),
            chalk.italic("conversions across"),
            chalk.bold(`${options.requestedFiles.size}`),
            chalk.italic(`file${options.requestedFiles.size === 1 ? "" : "s"}.`),
        ];

        if (successes.length !== 0) {
            if (failures.length === 0) {
                output.push(chalk.bold.green("Success!"));
            } else {
                output.push(chalk.bold.green(`${successes.length} successes.`));
            }
        }

        if (failures.length !== 0) {
            output.push(
                chalk.bold.red(`${failures.length} failures.`),
                ...failures.map((failure) => chalk.red(`\n    ${failure.sourcePath} ${chalk.grey("->")} ${failure.outputPath}`)),
            );
        }

        this.dependencies.logger.log(output.join(" "));
    }

    /**
     * Converts a file.
     *
     * @param filePath   Path to the file.
     * @param options   Options for converting files.
     * @returns Promise for results from converting the file.
     */
    private readonly runOnFile = async (filePath: string, options: IRunOptions): Promise<IFileRunResults> => {
        this.dependencies.logger.log(chalk.grey("Converting"), `${filePath}${chalk.grey("...")}`);

        const results = await Promise.all(
            this.dependencies.coordinators.map(async (coordinator) => coordinator.convertFile(filePath, options)),
        );
        const failures: IFailedConversionResult[] = [];
        const successes: ISuccessfulConversionResult[] = [];

        for (const result of results) {
            if (result.status === ConversionStatus.Failed) {
                failures.push(result);
                this.dependencies.logger.error(
                    chalk.grey.italic("Failed converting"),
                    [
                        chalk.red.bold(filePath),
                        chalk.grey.italic(":"),
                        EOL,
                        indent(chalk.italic.red(result.error.stack === undefined ? result.error.message : result.error.stack)),
                    ].join(""),
                );
            } else {
                successes.push(result);
                this.dependencies.logger.log(
                    chalk.italic.grey("Converted"),
                    chalk.bold.green(filePath),
                    chalk.italic.grey("to"),
                    chalk.bold.green(result.outputPath),
                );
            }
        }

        return { failures, successes };
    };
}
