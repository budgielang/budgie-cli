import chalk from "chalk";
import { CaseStyleConverterBag, IGlsProjectMetadata, NameSplitter } from "general-language-syntax";
import { insertIntoTemplate } from "../utils/templates";
import { IPostprocessDependencies } from "./postprocess";

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
        const fileName = insertIntoTemplate(language.projects.fileName, metadata);
        const fileContents = insertIntoTemplate(language.projects.fileFormat.join("\n"), metadata);

        await dependencies.fileSystem.writeFile(fileName, fileContents);
        dependencies.logger.log([
            language.general.name,
            chalk.grey(": Created "),
            chalk.green(fileName),
        ].join(""));
    }
};
