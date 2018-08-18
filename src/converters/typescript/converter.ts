import { EOL } from "os";
import { createTransformer, Transformer } from "ts-gls";
import * as ts from "typescript";

import { ConversionStatus, IConversionResult, IConverter } from "../../converter";
import { IFileSystem } from "../../files";
import { IRunOptions } from "../../runner/runner";
import { replaceFileExtension } from "../../utils/extensions";
import { defaultValue } from "../../utils/values";
import { glsExtension } from "../gls";

export interface ITsconfigOptions {
    compilerOptions: ts.CompilerOptions;
    exclude?: ReadonlyArray<string>;
    files?: ReadonlyArray<string>;
    include: ReadonlyArray<string>;
}

/**
 * Dependencies to initialize a new instance of the TypeScriptConverter class.
 */
export interface ITypeScriptConverterDependencies {
    /**
     * Reads and writes files.
     */
    fileSystem: IFileSystem;

    /**
     * Options for the TypeScript compiler.
     */
    tsconfigOptions: ITsconfigOptions;
}

/**
 * Extension for TypeScript files.
 */
export const tsExtension = ".ts";

/**
 * Creates TS source files for each file name.
 *
 * @param options   Options for converting files.
 * @param scriptTarget   Specified TypeScript language output target.
 * @returns TypeScript source files, keyed by unique file path.
 */
const createSourceFilesMap = (options: IRunOptions, scriptTarget: ts.ScriptTarget): Map<string, ts.SourceFile> => {
    const map = new Map<string, ts.SourceFile>();

    options.existingFileContents.forEach((fileContents: string, fileName: string) => {
        map.set(fileName, ts.createSourceFile(fileName, fileContents, scriptTarget, true, ts.ScriptKind.TS));
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

        this.sourceFiles = createSourceFilesMap(
            options,
            defaultValue(dependencies.tsconfigOptions.compilerOptions.target, () => ts.ScriptTarget.Latest));
        this.transformer = createTransformer({
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

        let converted: ReadonlyArray<string>;

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
