import * as glob from "glob";

import { IFileCoordinatorDependencies } from "../../fileCoordinator";
import { IFileSystem } from "../../files";
import { IRunOptions } from "../../runner/runner";
import { ITsconfigOptions, TypeScriptConverter } from "./converter";

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
 * @param options   Options for converting files.
 * @returns Promise for a TypeScript converter or creation error.
 * @remarks This will add to the existing file cache any tsconfig-included files.
 */
export const createTypeScriptConverter = async (dependencies: IFileCoordinatorDependencies, options: IRunOptions) => {
    const { typescriptConfig } = options;
    if (typescriptConfig === undefined) {
        return new Error("No TypeScript configuration file provided (--tsconfig).");
    }

    let optionsRaw: string;
    let optionsParsed: ITsconfigOptions;

    try {
        optionsRaw = await dependencies.fileSystem.readFile(typescriptConfig);
    } catch (error) {
        dependencies.logger.error(`Could not read '${typescriptConfig}'.`);
        throw error;
    }

    try {
        optionsParsed = {
            compilerOptions: {},
            include: [],
            ...JSON.parse(optionsRaw) as Partial<ITsconfigOptions>,
        };
    } catch (error) {
        dependencies.logger.error(`Could not parse '${typescriptConfig}'.`);
        throw error;
    }

    await populateFilesCacheForTsconfig(options.existingFileContents, dependencies.fileSystem, optionsParsed);

    return new TypeScriptConverter(
        {
            fileSystem: dependencies.fileSystem,
            tsconfigOptions: optionsParsed,
        },
        options);
};
