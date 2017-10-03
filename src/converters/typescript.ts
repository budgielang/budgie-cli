import { EOL } from "os";
import { createTransformer, UnsupportedComplaint } from "ts-gls";

import { ConversionStatus, IConversionResult, IConverter } from "../converter";
import { IFileSystem } from "../files";
import { replaceFileExtension } from "../utils";
import { glsExtension } from "./gls";

/**
 * Dependencies to initialize a new instance of the TypeScriptConverter class.
 */
export interface ITypeScriptConverterDependencies {
    /**
     * Reads and writes files.
     */
    fileSystem: IFileSystem;
}

export const tsExtension = ".ts";

/**
 * Converts TypeScript files to their GLS outputs.
 */
export class TypeScriptConverter implements IConverter {
    /**
     * Dependencies used for initialization.
     */
    private readonly dependencies: ITypeScriptConverterDependencies;

    /**
     * Initializes a new instance of the TypeScriptConverter class.
     *
     * @param dependencies   Dependencies used for initialization.
     */
    public constructor(dependencies: ITypeScriptConverterDependencies) {
        this.dependencies = dependencies;
    }

    /**
     * Converts a TypeScript file to its GLS output.
     *
     * @param filePath   Original GLS file path.
     * @returns The file's GLS output.
     */
    public async convertFile(filePath: string): Promise<IConversionResult> {
        const fileContents = await this.dependencies.fileSystem.readFile(filePath);
        const transformer = createTransformer();

        // Todo: use a source file + type checker
        const converted = transformer.transformText(fileContents);
        if (converted instanceof UnsupportedComplaint) {
            return {
                error: new Error(converted.toString()),
                status: ConversionStatus.Failed,
            };
        }

        const outputPath = replaceFileExtension(filePath, tsExtension, glsExtension);
        await this.dependencies.fileSystem.writeFile(outputPath, converted.join(EOL));

        return {
            outputPath,
            status: ConversionStatus.Succeeded,
        };
    }
}
