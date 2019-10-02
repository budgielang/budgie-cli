import { Language } from "general-language-syntax";

import { IFileSystem } from "../fileSystem";
import { ILogger } from "../logger";
import { printActionsPrefix, printActionsSummary } from "../utils/printing";

import { createLanguageMetadataFiles } from "./metadata";

export interface IPostprocessDependencies {
    fileSystem: IFileSystem;
    languages: ReadonlyArray<Language>;
    logger: ILogger;
    project?: string;
}

export const postprocess = async (dependencies: IPostprocessDependencies): Promise<void> => {
    if (dependencies.project === undefined) {
        return;
    }

    dependencies.logger.log();
    printActionsPrefix(dependencies.logger, dependencies.languages, "Postprocessing", "language");

    await createLanguageMetadataFiles(dependencies);

    printActionsSummary(dependencies.logger, "Postprocessing");
};
