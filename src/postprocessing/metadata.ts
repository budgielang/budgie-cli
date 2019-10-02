import chalk from "chalk";
import { CaseStyleConverterBag, NameSplitter } from "general-language-syntax";

import { insertIntoTemplate } from "../utils/templates";

import { IPostprocessDependencies } from "./postprocess";

export interface IGlsProjectMetadata {
    /**
     * Name of the overall project author.
     */
    author: string;

    /**
     * Friendly sentence describing the project.
     */
    description: string;

    /**
     * Contact email for the project.
     */
    email: string;

    /**
     * Shorthand name for the license type.
     */
    license: string;

    /**
     * Package.Upper.Case name of the project.
     */
    name: string;

    /**
     * Source control system storing file history.
     */
    repositoryType: string;

    /**
     * Website where the project is hosted.
     */
    url: string;

    /**
     * Major.Minor.Patch semantic version.
     */
    version: string;
}

export const createLanguageMetadataFiles = async (dependencies: IPostprocessDependencies) => {
    const metadataRaw = JSON.parse(await dependencies.fileSystem.readFile("gls.json")) as IGlsProjectMetadata & { [i: string]: string };
    const caseStyleConverter = new CaseStyleConverterBag();
    const nameSplitter = new NameSplitter();

    for (const language of dependencies.languages) {
        const nameNative = caseStyleConverter.convertToCase(language.projects.nameFormat, nameSplitter.split(metadataRaw.name));
        const metadata = {
            ...metadataRaw,
            name: nameNative,
        };

        for (const metadataFileNameRaw in language.projects.metadataFiles) {
            if (!{}.hasOwnProperty.call(language.projects.metadataFiles, metadataFileNameRaw)) {
                continue;
            }

            const fileName = insertIntoTemplate(metadataFileNameRaw, metadata);
            const fileContents = insertIntoTemplate(language.projects.metadataFiles[metadataFileNameRaw].join("\n"), metadata);

            await dependencies.fileSystem.writeFile(fileName, fileContents);
            dependencies.logger.log([language.general.name, chalk.grey(": Created "), chalk.green(fileName)].join(""));
        }
    }
};
