import { IConverter, IConverterCreator, ICreateConverterDependencies } from "./converter";
import { createTypeScriptConverter } from "./typescript/createTypeScriptConverter";
import { tsExtension } from "./typescript/typescriptConverter";

export const createConvertersBag = (createConverterDependencies: ICreateConverterDependencies) =>
    new ConvertersBag(
        new Map([
            [tsExtension, createTypeScriptConverter],
        ]),
        createConverterDependencies);

export class ConvertersBag {
    private readonly converters = new Map<string, Promise<Error | IConverter | undefined>>();

    public constructor(
        private readonly creators: Map<string, IConverterCreator>,
        private readonly createConverterDependencies: ICreateConverterDependencies,
    ) { }

    public async get(fileExtension: string) {
        let creation = this.converters.get(fileExtension);

        if (creation === undefined) {
            creation = this.startCreation(fileExtension);
            this.converters.set(fileExtension, creation);
        }

        return creation;
    }

    private async startCreation(fileExtension: string) {
        const creator = this.creators.get(fileExtension);

        return creator === undefined
            ? creator
            : creator(this.createConverterDependencies);
    }
}