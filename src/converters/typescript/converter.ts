import { EOL } from "os";
import { basename } from "path";
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

/**
 * Default script target to compile with.
 */
const defaultScriptTarget = ts.ScriptTarget.Latest;

/**
 * Converts TypeScript files to their GLS outputs.
 */
export class TypeScriptConverter implements IConverter {
    /**
     * Dependencies used for initialization.
     */
    private readonly dependencies: ITypeScriptConverterDependencies;

    /**
     * TypeScript program for the conversion run.
     */
    private readonly program: ts.Program;

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
        this.transformer = createTransformer();
        this.program = ts.createProgram(
            Array.from(options.files),
            {
                ...dependencies.compilerOptions,
            });
    }

    /**
     * Converts a TypeScript file to its GLS output.
     *
     * @param filePath   Original GLS file path.
     * @returns The file's GLS output.
     */
    public async convertFile(filePath: string): Promise<IConversionResult> {
        const fileContents = await this.dependencies.fileSystem.readFile(filePath);
        const scriptTarget = this.dependencies.compilerOptions.target === undefined
            ? defaultScriptTarget
            : this.dependencies.compilerOptions.target;

        const sourceFile = ts.createSourceFile(basename(filePath), fileContents, scriptTarget, true);
        let converted: string[];

        try {
            converted = this.transformer.transformSourceFile(sourceFile, this.program.getTypeChecker());
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
