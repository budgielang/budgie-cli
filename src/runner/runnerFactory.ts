import { Language } from "general-language-syntax";

import { createFileCoordinator } from "../fileCoordinatorFactory";
import { IFileSystem } from "../files";
import { ILogger } from "../logger";
import { Runner } from "./runner";

export interface ICreateRunnerDependencies {
    fileSystem: IFileSystem;
    languages: Language[];
    logger: ILogger;
}

export const createRunner = (dependencies: ICreateRunnerDependencies) =>
    new Runner({
        coordinators: dependencies.languages.map((language) =>
            createFileCoordinator({
                fileSystem: dependencies.fileSystem,
                language,
                logger: dependencies.logger,
            }),
        ),
        fileSystem: dependencies.fileSystem,
        logger: dependencies.logger,
    });
