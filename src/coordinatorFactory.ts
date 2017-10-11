import { Language } from "general-language-syntax";

import { GlsConverter } from "./converters/gls";
import { createTypeScriptConverter, tsExtension } from "./converters/typescript";
import { Coordinator } from "./coordinator";
import { IFileSystem } from "./files";
import { ILogger } from "./logger";

export interface ICreateCoordinatorDependencies {
    fileSystem: IFileSystem;
    language: Language;
    logger: ILogger;
}

export const createCoordinator = (dependencies: ICreateCoordinatorDependencies) =>
    new Coordinator({
        converter: new GlsConverter({
            fileSystem: dependencies.fileSystem,
            language: dependencies.language,
        }),
        fileSystem: dependencies.fileSystem,
        logger: console,
        preprocessors: new Map([
            [tsExtension, createTypeScriptConverter],
        ]),
    });
