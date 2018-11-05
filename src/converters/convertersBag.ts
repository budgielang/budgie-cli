import { IConverter, IConverterCreator, ICreateConverterDependencies } from "./converter";
import { createTypeScriptConverter } from "./typescript/createTypeScriptConverter";
import { tsExtension } from "./typescript/typescriptConverter";

/**
 * Creates and caches converters per language extension.
 */
export class ConvertersBag {
    /**
     * Cached creation Promises for converters, keyed by language extension.
     */
    private readonly converters = new Map<string, Promise<Error | IConverter | undefined>>();

    public constructor(
        private readonly creators: Map<string, IConverterCreator>,
        private readonly createConverterDependencies: ICreateConverterDependencies,
    ) { }

    /**
     * Returns a cached converter, creating it as needed.
     * 
     * @param languageExtension   Language extension to create for.
     * @returns Promise for the language's cached creator, if it exists, or an error during creation.
     */
    public async get(languageExtension: string): Promise<Error | IConverter | undefined> {
        let creation = this.converters.get(languageExtension);

        if (creation === undefined) {
            creation = this.startCreation(languageExtension);
            this.converters.set(languageExtension, creation);
        }

        return creation;
    }

    /**
     * Starts creation of a new converter, if the extension is known.
     * 
     * @param languageExtension   Language extension to create for.
     * @returns Promise for the language's creator, or an error during creation. 
     */
    private async startCreation(languageExtension: string) {
        const creator = this.creators.get(languageExtension);

        return creator === undefined
            ? creator
            : creator(this.createConverterDependencies);
    }
}

export const createConvertersBag = (createConverterDependencies: ICreateConverterDependencies) =>
    new ConvertersBag(
        new Map([
            [tsExtension, createTypeScriptConverter],
        ]),
        createConverterDependencies);
