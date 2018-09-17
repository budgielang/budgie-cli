import chalk from "chalk";
import { EOL } from "os";
import { ConversionStatus, IConversionResult } from "../converters/converter";
import { getFileExtension } from "../utils/extensions";
import { indent } from "../utils/text";
import { IPreprocessDependencies } from "./preprocessFiles";

export const preprocessFile = async (dependencies: IPreprocessDependencies, filePath: string): Promise<IConversionResult> => {
    const fileExtension = getFileExtension(filePath); 
    const converter = await dependencies.convertersBag.get(fileExtension);

    if (converter instanceof Error) {
        return {
            error: converter,
            outputPath: filePath,
            sourcePath: filePath,
            status: ConversionStatus.Failed,
        }
    }

    if (converter === undefined) {
        return {
            outputPath: filePath,
            sourcePath: filePath,
            status: ConversionStatus.Succeeded,
        };
    }

    const result = await converter.convertFile(filePath);

    if (result.status === ConversionStatus.Succeeded) {
        dependencies.logger.log(
            chalk.italic.grey("Preprocessed"),
            chalk.bold.green(filePath),
            chalk.italic.grey("to"),
            chalk.bold.green(result.outputPath),
        );
    } else {
        dependencies.logger.error(
            chalk.grey.italic("Failed converting"),
            [
                chalk.red.bold(filePath),
                chalk.grey.italic(":"),
                EOL,
                indent(chalk.italic.red(result.error.stack === undefined
                        ? result.error.message
                        : result.error.stack)),
            ].join(""),
        );
    }

    return result;
};
