import { EOL } from "os";
import { createTransformer, Transformer } from "ts-gls";
import * as ts from "typescript";

import { ConversionStatus, IConversionResult, IConverter } from "../../converter";
import { IFileSystem } from "../../files";
import { IRunOptions } from "../../runner";
import { replaceFileExtension } from "../../utils/extensions";
import { glsExtension } from "../gls";

/**
 * Dependencies to initialize a new instance of the TypeScriptConverter class.
 */
export interface ITypeScriptConverterDependencies {
    /**
     * Options for the TypeScript compiler.
     */
    compilerOptions: ts.CompilerOptions;

    /**
     * Reads and writes files.
     */
    fileSystem: IFileSystem;
}

/**
 * Extension for TypeScript files.
 */
export const tsExtension = ".ts";

const createSourceFilesMap = (options: IRunOptions) => {
    const map = new Map<string, ts.SourceFile>();

    options.files.forEach((fileContents, fileName) => {
        map.set(fileName, ts.createSourceFile(fileName, fileContents, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS));
    });

    return map;
};

/**
 * Converts TypeScript files to their GLS outputs.
 */
export class TypeScriptConverter implements IConverter {
    /**
     * Dependencies used for initialization.
     */
    private readonly dependencies: ITypeScriptConverterDependencies;

    /**
     * TypeScript source files, keyed by unique file path.
     */
    private readonly sourceFiles: Map<string, ts.SourceFile>;

    /**
     * Transforms TypeScript to GLS.
     */
    private readonly transformer: Transformer;

    /**
     * Initializes a new instance of the TypeScriptConverter class.
     *
     * @param dependencies   Dependencies used for initialization.
     * @param options   Options for converting files.
     */
    public constructor(dependencies: ITypeScriptConverterDependencies, options: IRunOptions) {
        this.dependencies = dependencies;
        this.sourceFiles = createSourceFilesMap(options);
        this.transformer = createTransformer({
            compilerOptions: {
                noLib: true,
            },
            sourceFiles: Array.from(this.sourceFiles.values()),
        });
    }

    /**
     * Converts a TypeScript file to its GLS output.
     *
     * @param filePath   Original GLS file path.
     * @returns The file's GLS output.
     */
    public async convertFile(filePath: string): Promise<IConversionResult> {
        const sourceFile = this.sourceFiles.get(filePath);
        if (sourceFile === undefined) {
            throw new Error(`Unknown source file: '${filePath}'.`);
        }

        let converted: string[];

        try {
            converted = this.transformer.transformSourceFile(sourceFile);
        } catch (error) {
            return {
                error,
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
