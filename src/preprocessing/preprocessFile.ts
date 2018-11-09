import { ConversionStatus, IConversionResult } from "../converters/converter";
import { getFileExtension } from "../utils/extensions";
import { printActionResult } from "../utils/printing";
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

    printActionResult(dependencies.logger, filePath, "Preprocessed", "preprocessing", result);

    return result;
};
