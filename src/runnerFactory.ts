import { Language } from "general-language-syntax";

import { createCoordinator } from "./coordinatorFactory";
import { IFileSystem } from "./files";
import { ILogger } from "./logger";
import { Runner } from "./runner";

export interface ICreateRunnerDependencies {
    fileSystem: IFileSystem;
    language: Language;
    logger: ILogger;
}

export const createRunner = (dependencies: ICreateRunnerDependencies) =>
    new Runner({
        coordinator: createCoordinator(dependencies),
        fileSystem: dependencies.fileSystem,
        logger: dependencies.logger,
    });
