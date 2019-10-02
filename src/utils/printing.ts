import chalk from "chalk";
import { EOL } from "os";

import { ConversionStatus, IConversionResult, IFailedConversionResult } from "../converters/converter";
import { ILogger } from "../logger";

import { indent } from "./text";

export const printActionsPrefix = (
    logger: ILogger,
    targets: ReadonlyArray<unknown> | ReadonlySet<unknown>,
    descriptor: string,
    targetType: string,
) => {
    const size = targets instanceof Set ? targets.size : (targets as ReadonlyArray<unknown>).length;

    logger.log([`${descriptor} `, size, ` ${targetType}`, size === 1 ? "" : "s", "..."].join(""));
};

export const printActionResult = (
    logger: ILogger,
    filePath: string,
    descriptorSucceeded: string,
    descriptorFailed: string,
    result: IConversionResult,
) => {
    if (result.status === ConversionStatus.Succeeded) {
        if (result.outputPath !== undefined) {
            logger.log(
                chalk.italic.grey(descriptorSucceeded),
                chalk.bold.green(filePath),
                chalk.italic.grey("to"),
                chalk.bold.green(result.outputPath),
            );
        }
    } else {
        logger.error(
            chalk.grey.italic(`Failed ${descriptorFailed}`),
            [chalk.red.bold(filePath), chalk.grey.italic(":"), EOL, indent(chalk.italic.red(`${result.error.stack}`))].join(""),
        );
    }
};

export const printActionsSummary = (logger: ILogger, descriptor: string, failures?: IFailedConversionResult[]) => {
    if (failures === undefined || failures.length === 0) {
        logger.log(chalk.green(`${descriptor} complete.`));
    } else {
        logger.log(
            chalk.bold(`${descriptor} failed with ${chalk.bold(`${failures.length}`)} failure${failures.length === 1 ? "" : "s"}.`),
            ...failures.map((failure) => chalk.red(`\n    ${failure.sourcePath} ${chalk.grey("->")} ${failure.outputPath}`)),
        );
    }
};
