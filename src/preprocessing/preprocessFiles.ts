import { Language } from "general-language-syntax";

import { ConversionStatus, IFailedConversionResult } from "../converters/converter";
import { ConvertersBag } from "../converters/convertersBag";
import { IFileSystem } from "../fileSystem";
import { ILogger } from "../logger";
import { printActionsPrefix, printActionsSummary } from "../utils/printing";
import { preprocessFile } from "./preprocessFile";

export interface IPreprocessDependencies {
    convertersBag: ConvertersBag,
    fileSystem: IFileSystem;
    filePaths: ReadonlySet<string>;
    languages: ReadonlyArray<Language>;
    logger: ILogger;
}

export interface IPreprocessResult {
    glsFilePaths: ReadonlySet<string>;
    status: ConversionStatus;

    // TODO: add overall status? tracking? something?
}

export const preprocessFiles = async (dependencies: IPreprocessDependencies): Promise<IPreprocessResult> => {
    printActionsPrefix(dependencies.logger, dependencies.filePaths, "Preprocessing", "file");

    const glsFilePaths = new Set<string>();
    const failures: IFailedConversionResult[] = [];

    for (const filePath of Array.from(dependencies.filePaths)) {
        const conversion = await preprocessFile(dependencies, filePath);

        glsFilePaths.add(conversion.outputPath);

        if (conversion.status === ConversionStatus.Failed) {
            failures.push(conversion);
        }
    }

    printActionsSummary(dependencies.logger, "Preprocessing", failures);

    return {
        glsFilePaths,
        status: failures.length === 0
            ? ConversionStatus.Succeeded
            : ConversionStatus.Failed,
    };
};
