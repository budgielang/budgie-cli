import chalk from "chalk";
import { IFailedConversionResult } from "../converters/converter";
import { ILogger } from "../logger";

export const printActionsPrefix = (
    logger: ILogger,
    targets: ReadonlyArray<unknown> | ReadonlySet<unknown>,
    descriptor: string,
    targetType: string,
) => {
    const size = targets instanceof Set
        ? targets.size
        : (targets as ReadonlyArray<unknown>).length;

    logger.log([
        `${descriptor} `,
        size,
        ` ${targetType}`,
        size === 1
            ? ""
            : "s",
        "..."
    ].join(""));
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
