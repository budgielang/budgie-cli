import { IFileSystem } from "../fileSystem";
import { ILogger } from "../logger";
import { IBudgieProjectMetadata } from "../postprocessing/metadata";

/**
 * Status from a conversion attempt.
 */
export enum ConversionStatus {
    /**
     * Failure status.
     */
    Failed,

    /**
     * Success status.
     */
    Succeeded,
}

/**
 * Common attributes for all conversion results.
 */
export interface IConversionResultBase {
    /**
     * Would-be path to the output file, if one should be created.
     */
    outputPath?: string;

    /**
     * Source path to the original file.
     */
    sourcePath: string;
}

/**
 * Result summary from a failed conversion run.
 */
export interface IFailedConversionResult extends IConversionResultBase {
    /**
     * Error causing the failure.
     */
    error: Error;

    /**
     * Failure status.
     */
    status: ConversionStatus.Failed;
}

/**
 * Result summary from a successful conversion run.
 */
export interface ISuccessfulConversionResult extends IConversionResultBase {
    /**
     * Success status.
     */
    status: ConversionStatus.Succeeded;
}

/**
 * Result summary from a conversion run.
 */
export type IConversionResult = IFailedConversionResult | ISuccessfulConversionResult;

/**
 * Converts files to their language outputs.
 */
export interface IConverter {
    /**
     * Converts a file to its language output.
     *
     * @param filePath   Original file path.
     * @returns The file's language output.
     */
    convertFile(filePath: string): Promise<IConversionResult>;
}

/**
 * Dependencies to create a new language converter.
 */
export interface ICreateConverterDependencies {
    /**
     * Base or root directory to ignore from the beginning of file paths, such as "src/", if not "".
     */
    baseDirectory?: string;

    /**
     * Writable cache of contents of file paths, keyed by unique file name.
     *
     * @remarks This may be added to by converters as they need more files.
     */
    existingFileContents: Map<string, string>;

    /**
     * Reads and writes files.
     */
    fileSystem: IFileSystem;

    /**
     * Budgie project schema metadata, if provided.
     */
    metadata?: IBudgieProjectMetadata;

    /**
     * Logs information on significant events.
     */
    logger: ILogger;

    /**
     * Namespace before path names, such as "Budgie", if not "".
     */
    outputNamespace?: string;

    /**
     * TypeScript configuration project file path, if provided.
     */
    typescriptConfig?: string;
}

/**
 * Asynchronously attempts to creates a converter.
 *
 * @param dependencies   Dependencies to create the converter.
 * @returns Promise for a converter or creation error.
 */
export type IConverterCreator = (converterDependencies: ICreateConverterDependencies) => Promise<IConverter | Error>;
