import { ConversionStatus, IConversionResult, IConverter, IConverterCreator } from "./converter";
import { IFileSystem } from "./files";
import { ILogger } from "./logger";
import { IRunOptions } from "./runner";
import { getFileExtension } from "./utils/extensions";

/**
 * Dependencies to initialize a new instance of the Converter class.
 */
export interface IConverterDependencies {
    /**
     * Converts files to their language output(s).
     */
    converter: IConverter;

    /**
     * Reads and writes files.
     */
    fileSystem: IFileSystem;

    /**
     * Logs information on significant events.
     */
    logger: ILogger;

    /**
     * Language pre-processors, keyed by their language file extensions.
     */
    preprocessors: Map<string, IConverterCreator>;
}

/**
 * Coordinates converting files to their language outputs.
 */
export class Coordinator {
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
        this.dependencies = dependencies;
    }

    /**
     * Transforms a file to its language output.
     *
     * @param filePath   Original file path.
     * @param options   Options for converting files.
     * @returns A Promise for the file's language output.
     */
    public async convertFile(filePath: string, options: IRunOptions): Promise<IConversionResult> {
        const preprocessResult = await this.preprocessFile(filePath, options);
        if (preprocessResult.status === ConversionStatus.Failed) {
            return preprocessResult;
        }

        return this.dependencies.converter.convertFile(preprocessResult.outputPath);
    }

    /**
     * Runs a preprocessor on a file if its extension supports one.
     *
     * @param filePath   Original file path.
     * @param options   Options for converting files.
     * @returns A Promise for processed path to the file.
     */
    private async preprocessFile(filePath: string, options: IRunOptions): Promise<IConversionResult> {
        const fileExtension = getFileExtension(filePath);
        const preprocessorCreator = this.dependencies.preprocessors.get(fileExtension);
        if (preprocessorCreator === undefined) {
            return {
                outputPath: filePath,
                status: ConversionStatus.Succeeded,
            };
        }

        const preprocessor = await preprocessorCreator(this.dependencies, options);
        if (typeof preprocessor === "string") {
            return {
                error: new Error(preprocessor),
                status: ConversionStatus.Failed,
            };
        }

        return preprocessor.convertFile(filePath);
    }
}
