import { IFileCoordinatorDependencies } from "./fileCoordinator";
import { IRunOptions } from "./runner/runner";

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
     * Would-be path to the output file.
     */
    outputPath: string;

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
 * Asynchronously creates a converter.
 *
 * @param dependencies   Dependencies to create the converter.
 * @param options   Options for converting files.
 * @returns Promise for a converter or error.
 */
export type IConverterCreator = (dependencies: IFileCoordinatorDependencies, options: IRunOptions) => Promise<IConverter | Error>;
