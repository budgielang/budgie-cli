import { Language } from "general-language-syntax";

import { Converter } from "./converter";
import { FileSystem } from "./files";
import { ILogger } from "./logger";
import { Runner } from "./runner";

export interface ICreateRunnerDependencies {
    language: Language;
    logger: ILogger;
}

export const createRunner = (dependencies: ICreateRunnerDependencies) => {
    const fileSystem = new FileSystem();

    return new Runner({
        converter: new Converter({
            fileSystem,
            language: dependencies.language,
            logger: console,
        }),
        fileSystem,
        logger: console,
    });
};
