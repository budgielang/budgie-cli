import { Budgie, Language } from "budgie";
import { EOL } from "os";

import { IFileSystem } from "../fileSystem";
import { replaceFileExtension } from "../utils/extensions";

import { ConversionStatus, IConversionResult, IConverter } from "./converter";

/**
 * Dependencies to initialize a new instance of the BudgieConverter class.
 */
export interface IBudgieConverterDependencies {
    /**
     * Reads and writes files.
     */
    fileSystem: IFileSystem;

    /**
     * Output language.
     */
    language: Language;
}

/**
 * Extension for Budgie files.
 */
export const budgieExtension = ".bg";

/**
 * Converts Budgie files to their language outputs.
 */
export class BudgieConverter implements IConverter {
    /**
     * Dependencies used for initialization.
     */
    private readonly dependencies: IBudgieConverterDependencies;

    /**
     * Driving context to use a parse Budgie into language outputs.
     */
    private readonly budgie: Budgie;

    /**
     * Initializes a new instance of the BudgieConverter class.
     *
     * @param dependencies   Dependencies used for initialization.
     */
    public constructor(dependencies: IBudgieConverterDependencies) {
        this.budgie = new Budgie(dependencies.language.general.name);
        this.dependencies = dependencies;
    }

    /**
     * Converts a Budgie file to its language output.
     *
     * @param sourcePath   Original Budgie file path.
     * @returns The file's language output.
     */
    public async convertFile(sourcePath: string): Promise<IConversionResult> {
        const newExtension = this.dependencies.language.general.extension;
        const outputPath = replaceFileExtension(sourcePath, budgieExtension, newExtension);

        try {
            const results = this.budgie.convert((await this.dependencies.fileSystem.readFile(sourcePath)).split(/\r\n|\r|\n/g));

            await this.dependencies.fileSystem.writeFile(outputPath, results.join(EOL));

            return {
                outputPath,
                sourcePath,
                status: ConversionStatus.Succeeded,
            };
        } catch (error) {
            return {
                error,
                outputPath,
                sourcePath,
                status: ConversionStatus.Failed,
            };
        }
    }
}
