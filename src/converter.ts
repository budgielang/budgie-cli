import { IConverterDependencies } from "./coordinator";
import { IRunOptions } from "./runner";

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
 * Result summary from a failed conversion run.
 */
export interface IFailedConversionResult {
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
export interface ISuccessfulConversionResult {
    /**
     * Path to the output file.
     */
    outputPath: string;

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
 * @returns A Promise for a converter or error string.
 */
export type IConverterCreator = (dependencies: IConverterDependencies, options: IRunOptions) => Promise<IConverter | string>;
