import { Language } from "general-language-syntax";

import { ConversionStatus, IFailedConversionResult, ISuccessfulConversionResult } from "../converters/converter";
import { GlsConverter } from "../converters/glsConverter";
import { IFileSystem } from "../fileSystem";
import { ILogger } from "../logger";
import { queueAsyncActions } from "../utils/asyncQueue";
import { printActionsPrefix, printActionsSummary } from "../utils/printing";
import { convertFile } from "./convertFile";

/**
 * Options to convert a set of files.
 */
export interface IRunDependencies {
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
     * Reads and writes files.
     */
    fileSystem: IFileSystem;

    /**
     * File paths requested to be converted.
     */
    glsFilePaths: ReadonlySet<string>;

    /**
     * Languages to output to.
     */
    languages: ReadonlyArray<Language>;

    /**
     * Logs information on significant events.
     */
    logger: ILogger;

    /**
     * Namespace before path names, such as "Gls", if not "".
     */
    outputNamespace?: string;

    /**
     * TypeScript configuration project file path, if provided.
     */
    typescriptConfig?: string;
}

/**
 * Results from converting a set of files.
 */
export interface IConversionResults {
    /**
     * Whether the results succeeded.
     */
    status: ConversionStatus;
}

/**
 * Converts a set of files.
 *
 * @param dependencies   Injected dependencies for converting files.
 * @returns Promise for converting the files.
 */
export const convertFiles = async (dependencies: IRunDependencies): Promise<IConversionResults> => {
    const failures: IFailedConversionResult[] = [];
    const successes: ISuccessfulConversionResult[] = [];
    const glsConverters = dependencies.languages.map((language) => new GlsConverter({
        fileSystem: dependencies.fileSystem,
        language,
    }));

    dependencies.logger.log();
    printActionsPrefix(dependencies.logger, dependencies.glsFilePaths, "Converting", "file");

    await queueAsyncActions(
        Array.from(dependencies.glsFilePaths).map((fileName) => async () => {
            const result = await convertFile(dependencies, glsConverters, fileName);

            failures.push(...result.failures);
            successes.push(...result.successes);
        }),
    );

    printActionsSummary(dependencies.logger, "Conversions", failures);

    return {
        status: failures.length === 0
            ? ConversionStatus.Succeeded
            : ConversionStatus.Failed,
    };
}
