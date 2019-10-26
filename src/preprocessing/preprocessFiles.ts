import { Language } from "budgie";

import { ConversionStatus, IFailedConversionResult } from "../converters/converter";
import { ConvertersBag } from "../converters/convertersBag";
import { IFileSystem } from "../fileSystem";
import { ILogger } from "../logger";
import { printActionsSummary } from "../utils/printing";

import { preprocessFile } from "./preprocessFile";

export interface IPreprocessDependencies {
    convertersBag: ConvertersBag;
    fileSystem: IFileSystem;
    filePaths: ReadonlySet<string>;
    languages: ReadonlyArray<Language>;
    logger: ILogger;
}

export interface IPreprocessResults {
    budgieFilePaths: ReadonlySet<string>;
    status: ConversionStatus;
}

const collectFilesToPreprocess = (filePaths: ReadonlySet<string>, languages: ReadonlyArray<Language>) =>
    Array.from(filePaths).filter((filePath: string): boolean => {
        for (const language of languages) {
            if (filePath in language.projects.metadataFiles) {
                return false;
            }
        }

        return true;
    });

export const preprocessFiles = async (dependencies: IPreprocessDependencies): Promise<IPreprocessResults> => {
    dependencies.logger.log("Preprocessing...");

    const budgieFilePaths = new Set<string>();
    const failures: IFailedConversionResult[] = [];

    for (const filePath of collectFilesToPreprocess(dependencies.filePaths, dependencies.languages)) {
        const conversion = await preprocessFile(dependencies, filePath);

        if (conversion.outputPath !== undefined) {
            budgieFilePaths.add(conversion.outputPath);
        }

        if (conversion.status === ConversionStatus.Failed) {
            failures.push(conversion);
        }
    }

    printActionsSummary(dependencies.logger, "Preprocessing", failures);

    return {
        budgieFilePaths,
        status: failures.length === 0 ? ConversionStatus.Succeeded : ConversionStatus.Failed,
    };
};
