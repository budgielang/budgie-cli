import { Language } from "general-language-syntax";
import { IFileSystem } from "../fileSystem";
import { ILogger } from "../logger";
import { printActionsPrefix, printActionsSummary } from "../utils/printing";
import { createLanguageMetadataFiles } from "./metadata";

export interface IPostprocessDependencies {
    glsFiles: unknown;
    fileSystem: IFileSystem;
    languages: ReadonlyArray<Language>;
    logger: ILogger;
}

export const postprocess = async (dependencies: IPostprocessDependencies): Promise<void> => {
    dependencies.logger.log();
    printActionsPrefix(dependencies.logger, dependencies.languages, "Postprocessing", "language");

    await createLanguageMetadataFiles(dependencies);

    printActionsSummary(dependencies.logger, "Postprocessing");
};
