import { Language } from "general-language-syntax";

import { GlsConverter } from "./converters/gls";
import { createTypeScriptConverter, tsExtension } from "./converters/typescript";
import { FileCoordinator } from "./fileCoordinator";
import { IFileSystem } from "./files";
import { ILogger } from "./logger";

export interface ICreateFileCoordinatorDependencies {
    fileSystem: IFileSystem;
    language: Language;
    logger: ILogger;
}

export const createFileCoordinator = (dependencies: ICreateFileCoordinatorDependencies) =>
    new FileCoordinator({
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
