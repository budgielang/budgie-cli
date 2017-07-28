import { ConversionContext, Language } from "general-language-syntax";

import { IFileSystem } from "./files";
import { ILogger } from "./logger";

export enum ConversionStatus {
    Failed,
    Succeeded,
}

export interface IFailedConversionResult {
    error: Error;
    status: ConversionStatus.Failed;
}

export interface ISuccessfulConversionResult {
    lines: string[];
    status: ConversionStatus.Succeeded;
}

export type IConversionResult = IFailedConversionResult | ISuccessfulConversionResult;

export interface IConverterDependencies {
    fileSystem: IFileSystem;
    language: Language;
    logger: ILogger;
}

/**
 * Converts GLS files to their language outputs.
 */
export interface IConverter {
    /**
     * Transforms a GLS file to its language output.
     *
     * @param filePath   GLS file path.
     * @returns The file's language output.
     */
    convertFile(filePath: string): Promise<IConversionResult>;

    /**
     * Transforms a GLS file path to its output equivalent.
     *
     * @param filePath   GLS file path.
     * @param extension   Extension to replace with.
     * @returns The file's equivalent with the extension.
     */
    convertFilePath(filePath: string): string;
}

/**
 * Converts GLS files to their language outputs.
 */
export class Converter implements IConverter {
    /**
     * Driving context to use a parse GLS into language outputs.
     */
    private readonly context: ConversionContext;

    /**
     * Dependencies used for initialization.
     */
    private readonly dependencies: IConverterDependencies;

    /**
     * Initializes a new instance of the Converter class.
     *
     * @param dependencies   Dependencies used for initialization.
     */
    public constructor(dependencies: IConverterDependencies) {
        this.context = new ConversionContext(dependencies.language);
        this.dependencies = dependencies;
    }

    /**
     * Transforms a GLS file to its language output.
     *
     * @param filePath   GLS file path.
     * @returns The file's language output.
     */
    public async convertFile(filePath: string): Promise<IConversionResult> {
        try {
            return {
                lines: this.context.convert(
                    (await this.dependencies.fileSystem.readFile(filePath))
                        .split(/\r\n|\r|\n/g)),
                status: ConversionStatus.Succeeded,
            };
        } catch (error) {
            return {
                error,
                status: ConversionStatus.Failed,
            };
        }
    }

    /**
     * Transforms a GLS file path to its output equivalent.
     *
     * @param filePath   GLS file path.
     * @param extension   Extension to replace with.
     * @returns The file's equivalent with the extension.
     */
    public convertFilePath(filePath: string): string {
        const extension = this.context.getLanguage().properties.general.extension;

        return filePath.substring(filePath.length - ".gls".length) === ".gls"
            ? `${filePath.substring(0, filePath.length - ".gls".length)}${extension}`
            : `${filePath}${extension}`;
    }
}
