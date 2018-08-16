import * as ts from "typescript";

import { IConverterDependencies } from "../../coordinator";
import { IRunOptions } from "../../runner";
import { TypeScriptConverter } from "./converter";

/**
 * Asynchronously creates a converter.
 *
 * @param dependencies   Dependencies to create the converter.
 * @param options   Options for converting files.
 * @returns A Promise for a converter or error string.
 */
export const createTypeScriptConverter = async (dependencies: IConverterDependencies, options: IRunOptions) => {
    const { typescriptConfig } = options;
    if (typescriptConfig === undefined) {
        return "No TypeScript configuration file provided (--tsconfig).";
    }

    let optionsRaw: string | undefined;
    let optionsParsed: ts.CompilerOptions | undefined;

    try {
        optionsRaw = await dependencies.fileSystem.readFile(typescriptConfig);
    } catch (error) {
        dependencies.logger.error(`Could not read '${typescriptConfig}'.`);
        throw error;
    }

    try {
        optionsParsed = JSON.parse(optionsRaw) as ts.CompilerOptions;
    } catch (error) {
        dependencies.logger.error(`Could not parse '${typescriptConfig}'.`);
        throw error;
    }

    return new TypeScriptConverter(
        {
            compilerOptions: optionsParsed,
            fileSystem: dependencies.fileSystem,
        },
        options);
};
