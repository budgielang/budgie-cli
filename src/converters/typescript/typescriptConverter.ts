import { EOL } from "os";
import { createTransformer, Transformer } from "ts-gls";
import * as ts from "typescript";

import { replaceFileExtension } from "../../utils/extensions";
import { defaultValue } from "../../utils/values";
import { ConversionStatus, IConversionResult, IConverter, ICreateConverterDependencies } from "../converter";
import { glsExtension } from "../glsConverter";
import { IUnsupportedComplaint } from "./collectedUnsupportedTransforms";

export interface ITsconfigOptions {
    compilerOptions: ts.CompilerOptions;
    exclude?: ReadonlyArray<string>;
    files?: ReadonlyArray<string>;
    include: ReadonlyArray<string>;
}

/**
 * Extension for TypeScript files.
 */
export const tsExtension = ".ts";

/**
 * Dependencies to initialize a new instance of the TypeScriptConverter class.
 */
export interface ITypeScriptConverterDependencies extends ICreateConverterDependencies {
    /**
     * Options for the TypeScript compiler.
     */
    tsconfigOptions: ITsconfigOptions;
}

/**
 * Creates TS source files for each file name.
 *
 * @param existingFileContents   Writable cache of contents of file paths, keyed by unique file name.
 * @param scriptTarget   Specified TypeScript language output target.
 * @returns TypeScript source files, keyed by unique file path.
 */
const createSourceFilesMap = (existingFileContents: Map<string, string>, scriptTarget: ts.ScriptTarget): Map<string, ts.SourceFile> => {
    const map = new Map<string, ts.SourceFile>();

    existingFileContents.forEach((fileContents: string, fileName: string) => {
        map.set(fileName, ts.createSourceFile(fileName, fileContents, scriptTarget, true, ts.ScriptKind.TS));
    });

    return map;
};

/**
 * @todo Use this once ts-gls supports emitting a summary of unsupported syntax.
 */
export const complainForTransformation = (sourceFile: ts.SourceFile, complaint: IUnsupportedComplaint) => {
    const { text } = sourceFile;
    const { start } = complaint.range;
    const line = text.substring(0, start).split(/\r\n|\r|\n/g).length;

    return `Line ${line + 1}: Unsupported syntax: ${complaint.line.args[0]}`;
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
    public constructor(dependencies: ITypeScriptConverterDependencies) {
        this.dependencies = dependencies;

        this.sourceFiles = createSourceFilesMap(
            dependencies.existingFileContents,
            defaultValue(dependencies.tsconfigOptions.compilerOptions.target, () => ts.ScriptTarget.Latest),
        );
        this.transformer = createTransformer({
            baseDirectory: dependencies.baseDirectory,
            outputNamespace: dependencies.outputNamespace,
            sourceFiles: Array.from(this.sourceFiles.values()),
        });
    }

    /**
     * Converts a TypeScript file to its GLS output.
     *
     * @param sourcePath   Original GLS file path.
     * @returns The file's GLS output.
     */
    public async convertFile(sourcePath: string): Promise<IConversionResult> {
        if (this.dependencies.metadata !== undefined && sourcePath === "src/index.ts") {
            return {
                sourcePath,
                status: ConversionStatus.Succeeded,
            };
        }

        const sourceFile = this.sourceFiles.get(sourcePath);
        if (sourceFile === undefined) {
            throw new Error(`Unknown source file: '${sourcePath}'.`);
        }

        const outputPath = replaceFileExtension(sourcePath, tsExtension, glsExtension);
        let transformationResults: string[];

        try {
            transformationResults = this.transformer.transformSourceFile(sourceFile);
        } catch (error) {
            return {
                error,
                outputPath,
                sourcePath,
                status: ConversionStatus.Failed,
            };
        }

        await this.dependencies.fileSystem.writeFile(outputPath, transformationResults.join(EOL));

        return {
            outputPath,
            sourcePath,
            status: ConversionStatus.Succeeded,
        };
    }
}
