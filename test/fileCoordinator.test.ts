import { expect } from "chai";
import { LanguagesBag } from "general-language-syntax";
import "mocha";
import { EOL } from "os";

import { ConversionStatus } from "../lib/converter";
import { createFileCoordinator } from "../lib/fileCoordinatorFactory";
import { IMockFiles, mockFileSystem } from "./mocks/fileSystem";
import { stubLogger } from "./stubs";

describe("FileCoordinator", () => {
    const createTestCoordinator = (languageName: string = "C#", files: IMockFiles = {}) => {
        const fileSystem = mockFileSystem(files);
        const language = new LanguagesBag().getLanguageByName(languageName);
        const logger = stubLogger();
        const coordinator = createFileCoordinator({ fileSystem, language, logger });

        return { coordinator, fileSystem, language, logger };
    };

    const stubTsconfigFileName = "tsconfig.json";

    describe("convertFile", () => {
        it("converts a GLS file to C#", async () => {
            // Arrange
            const inputFilePath = "file.gls";
            const inputFileContents = "comment line : Hello world!";
            const outputFilePath = "file.cs";
            const { coordinator, fileSystem } = createTestCoordinator("C#", {
                [inputFilePath]: inputFileContents,
                [stubTsconfigFileName]: "{}",
            });

            // Act
            const result = await coordinator.convertFile(inputFilePath, {
                existingFileContents: new Map([[inputFilePath, inputFileContents]]),
                requestedFiles: new Set([inputFilePath]),
                typescriptConfig: stubTsconfigFileName,
            });

            // Assert
            expect(result).to.be.deep.equal({
                outputPath: outputFilePath,
                sourcePath: "file.gls",
                status: ConversionStatus.Succeeded,
            });
            expect(fileSystem.files[outputFilePath]).to.be.equal("// Hello world!");
        });

        it("converts a TypeScript file to C#", async () => {
            // Arrange
            const inputFilePath = "file.ts";
            const inputFileContents = 'console.log("Hello world!");';
            const outputFilePath = "file.cs";
            const { coordinator, fileSystem } = createTestCoordinator("C#", {
                [inputFilePath]: inputFileContents,
                [stubTsconfigFileName]: "{}",
            });

            // Act
            const result = await coordinator.convertFile(inputFilePath, {
                existingFileContents: new Map([[inputFilePath, inputFileContents]]),
                requestedFiles: new Set([inputFilePath]),
                typescriptConfig: stubTsconfigFileName,
            });

            // Assert
            expect(result).to.be.deep.equal({
                outputPath: outputFilePath,
                sourcePath: "file.gls",
                status: ConversionStatus.Succeeded,
            });
            expect(fileSystem.files[outputFilePath]).to.be.equal(["using System;", "", 'Console.WriteLine("Hello world!");'].join(EOL));
        });
    });
});
