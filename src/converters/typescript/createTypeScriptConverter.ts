import * as glob from "glob";

import { IFileSystem } from "../../fileSystem";
import { IConverter, ICreateConverterDependencies } from "../converter";

import { ITsconfigOptions, TypeScriptConverter } from "./typescriptConverter";

const populateFilesCacheForTsconfig = async (
    existingFileContents: Map<string, string>,
    fileSystem: IFileSystem,
    tsconfigOptions: ITsconfigOptions,
) => {
    for (const includeGlob of tsconfigOptions.include) {
        for (const fileName of glob.sync(includeGlob)) {
            if (!existingFileContents.has(fileName)) {
                existingFileContents.set(fileName, await fileSystem.readFile(fileName));
            }
        }
    }
};

/**
 * Creates a TypeScript converter.
 *
 * @param dependencies   Dependencies to create the converter.
 * @returns Promise for a TypeScript converter, if it could be created.
 * @remarks This will add to the existing file cache any tsconfig-included files.
 */
export const createTypeScriptConverter = async (dependencies: ICreateConverterDependencies): Promise<Error | IConverter> => {
    const { typescriptConfig } = dependencies;
    if (typescriptConfig === undefined) {
        return new Error("No TypeScript configuration file provided (--tsconfig).");
    }

    let optionsRaw: string;
    let optionsParsed: ITsconfigOptions;

    try {
        optionsRaw = await dependencies.fileSystem.readFile(typescriptConfig);
    } catch (error) {
        return new Error(`Could not read '${typescriptConfig}: ${error}'.`);
    }

    try {
        optionsParsed = {
            compilerOptions: {},
            include: [],
            ...(JSON.parse(optionsRaw) as Partial<ITsconfigOptions>),
        };
    } catch (error) {
        return new Error(`Could not parse '${typescriptConfig}: ${error}'.`);
    }

    await populateFilesCacheForTsconfig(dependencies.existingFileContents, dependencies.fileSystem, optionsParsed);

    return new TypeScriptConverter({
        ...dependencies,
        tsconfigOptions: optionsParsed,
    });
};
