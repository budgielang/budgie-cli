import chalk from "chalk";
import { EOL } from "os";

import { ConversionStatus, IFailedConversionResult, ISuccessfulConversionResult } from "../converters/converter";
import { GlsConverter } from "../converters/gls";
import { indent } from "../utils/text";
import { IRunDependencies } from "./convertFiles";

/**
 * Conversion results for a single file.
 */
interface IFileRunResults {
    /**
     * Language conversions that failed.
     */
    failures: ReadonlyArray<IFailedConversionResult>;

    /**
     * Language conversions that succeeded.
     */
    successes: ReadonlyArray<ISuccessfulConversionResult>;
}

/**
 * Converts a file.
 *
 * @param dependencies   Injected dependencies for converting files.
 * @param filePath   Path to the file.
 * @returns Promise for results from converting the file.
 */
export const convertFile = async (
    dependencies: IRunDependencies,
    glsConverters: GlsConverter[],
    filePath: string,
): Promise<IFileRunResults> => {
    const results = await Promise.all(
        glsConverters.map(async (glsConveter) => glsConveter.convertFile(filePath)),
    );
    const failures: IFailedConversionResult[] = [];
    const successes: ISuccessfulConversionResult[] = [];

    for (const result of results) {
        if (result.status === ConversionStatus.Failed) {
            failures.push(result);
            dependencies.logger.error(
                chalk.grey.italic("Failed converting"),
                [
                    chalk.red.bold(filePath),
                    chalk.grey.italic(":"),
                    EOL,
                    indent(chalk.italic.red(result.error.stack === undefined ? result.error.message : result.error.stack)),
                ].join(""),
            );
        } else {
            successes.push(result as ISuccessfulConversionResult); // why??
            dependencies.logger.log(
                chalk.italic.grey("Converted"),
                chalk.bold.green(filePath),
                chalk.italic.grey("to"),
                chalk.bold.green(result.outputPath),
            );
        }
    }

    return { failures, successes };
};
