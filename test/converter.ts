import { expect } from "chai";
import { LanguagesBag } from "general-language-syntax";
import "mocha";

import { Converter } from "../lib/converter";
import { stubFileSystem, stubLogger } from "./stubs";

describe("Converter", () => {
    const stubConverter = (languageName: string = "TypeScript") => {
        const fileSystem = stubFileSystem();
        const language = new LanguagesBag().getLanguage(languageName);
        const logger = stubLogger();
        const converter = new Converter({ fileSystem, language, logger });

        return { converter, fileSystem, language, logger };
    };

    describe("convertFilePath", () => {
        it("replaces the language extension in a file path with '.gls'", () => {
            // Arrange
            const { converter } = stubConverter();
            const filePath = "file.gls";

            // Act
            const actualPath = converter.convertFilePath(filePath);

            // Assert
            expect(actualPath).to.be.equal("file.ts");
        });

        it("appends the language extension in a file path without '.gls'", () => {
            // Arrange
            const { converter } = stubConverter();
            const filePath = "file.gls";

            // Act
            const actualPath = converter.convertFilePath(filePath);

            // Assert
            expect(actualPath).to.be.equal("file.ts");
        });
    });
});
