import { ConversionContext, Language } from "general-language-syntax";
import { EOL } from "os";

import { ConversionStatus, IConversionResult, IConverter } from "../converter";
import { IFileSystem } from "../files";
import { replaceFileExtension } from "../utils";

/**
 * Dependencies to initialize a new instance of the GlsConverter class.
 */
export interface IGlsConverterDependencies {
    /**
     * Reads and writes files.
     */
    fileSystem: IFileSystem;

    /**
     * Output GLS language.
     */
    language: Language;
}

/**
 * Extension for GLS files.
 */
export const glsExtension = ".gls";

/**
 * Converts GLS files to their language outputs.
 */
export class GlsConverter implements IConverter {
    /**
     * Driving context to use a parse GLS into language outputs.
     */
    private readonly context: ConversionContext;

    /**
     * Dependencies used for initialization.
     */
    private readonly dependencies: IGlsConverterDependencies;

    /**
     * Initializes a new instance of the GlsConverter class.
     *
     * @param dependencies   Dependencies used for initialization.
     */
    public constructor(dependencies: IGlsConverterDependencies) {
        this.context = new ConversionContext(dependencies.language);
        this.dependencies = dependencies;
    }

    /**
     * Converts a GLS file to its language output.
     *
     * @param filePath   Original GLS file path.
     * @returns The file's language output.
     */
    public async convertFile(filePath: string): Promise<IConversionResult> {
        const newExtension = this.dependencies.language.properties.general.extension;
        const outputPath = replaceFileExtension(filePath, glsExtension, newExtension);

        try {
            const results = this.context.convert(
                (await this.dependencies.fileSystem.readFile(filePath))
                    .split(/\r\n|\r|\n/g));

            await this.dependencies.fileSystem.writeFile(outputPath, results.join(EOL));

            return {
                outputPath,
                status: ConversionStatus.Succeeded,
            };
        } catch (error) {
            return {
                error,
                status: ConversionStatus.Failed,
            };
        }
    }

}
