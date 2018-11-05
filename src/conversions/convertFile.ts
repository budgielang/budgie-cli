import { ConversionStatus, IFailedConversionResult, ISuccessfulConversionResult } from "../converters/converter";
import { GlsConverter } from "../converters/glsConverter";
import { printActionResult } from "../utils/printing";
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
        glsConverters.map(async (glsConverter) => glsConverter.convertFile(filePath)),
    );
    const failures: IFailedConversionResult[] = [];
    const successes: ISuccessfulConversionResult[] = [];

    for (const result of results) {
        printActionResult(dependencies.logger, filePath, "Converted", "converting", result);
        
        if (result.status === ConversionStatus.Failed) {
            failures.push(result);
        } else {
            successes.push(result);
        }
    }

    return { failures, successes };
};
