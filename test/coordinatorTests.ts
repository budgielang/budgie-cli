import { expect } from "chai";
import { LanguagesBag } from "general-language-syntax";
import "mocha";
import { EOL } from "os";

import { ConversionStatus } from "../lib/converter";
import { createCoordinator } from "../lib/coordinatorFactory";
import { IRunOptions } from "../lib/runner";
import { IMockFiles, mockFileSystem } from "./mocks/fileSystem";
import { stubLogger } from "./stubs";

describe("Coordinator", () => {
    const createTestCoordinator = (languageName: string = "C#", files: IMockFiles = {}) => {
        const fileSystem = mockFileSystem(files);
        const language = new LanguagesBag().getLanguageByName(languageName);
        const logger = stubLogger();
        const coordinator = createCoordinator({ fileSystem, language, logger });

        return { coordinator, fileSystem, language, logger };
    };

    const stubTsconfigFileName = "tsconfig.json";

    const stubOptions = (inputFilePath: string): IRunOptions => ({
        files: new Set([inputFilePath]),
        typescriptConfig: stubTsconfigFileName,
    });

    describe("convertFile", () => {
        it("converts a GLS file to C#", async () => {
            // Arrange
            const inputFilePath = "file.gls";
            const outputFilePath = "file.cs";
            const { coordinator, fileSystem } = createTestCoordinator(
                "C#",
                {
                    [inputFilePath]: "comment line : Hello world!",
                    [stubTsconfigFileName]: "{}",
                });

            // Act
            const result = await coordinator.convertFile(inputFilePath, stubOptions(inputFilePath));

            // Assert
            expect(result).to.be.deep.equal({
                outputPath: outputFilePath,
                status: ConversionStatus.Succeeded,
            });
            expect(fileSystem.files[outputFilePath]).to.be.equal("// Hello world!");
        });

        it("converts a TypeScript file to C#", async () => {
            // Arrange
            const inputFilePath = "file.ts";
            const outputFilePath = "file.cs";
            const { coordinator, fileSystem } = createTestCoordinator(
                "C#",
                {
                    [inputFilePath]: 'console.log("Hello world!");',
                    [stubTsconfigFileName]: "{}",
                });

            // Act
            const result = await coordinator.convertFile(inputFilePath, stubOptions(inputFilePath));

            // Assert
            expect(result).to.be.deep.equal({
                outputPath: outputFilePath,
                status: ConversionStatus.Succeeded,
            });
            expect(fileSystem.files[outputFilePath]).to.be.equal([
                "using System;",
                "",
                'Console.WriteLine("Hello world!");',
            ].join(EOL));
        });
    });
});
