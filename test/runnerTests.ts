import { expect } from "chai";
import { LanguagesBag } from "general-language-syntax";
import "mocha";
import { EOL } from "os";

import { ConversionStatus } from "../lib/converter";
import { createRunner } from "../lib/runnerFactory";
import { IMockFiles, mockFileSystem } from "./mocks/fileSystem";
import { stubLogger } from "./stubs";

describe("Runner", () => {
    const createTestRunner = (languageName: string = "C#", files: IMockFiles = {}) => {
        const fileSystem = mockFileSystem(files);
        const language = new LanguagesBag().getLanguageByName(languageName);
        const logger = stubLogger();
        const runner = createRunner({ fileSystem, language, logger });

        return { runner, fileSystem, language, logger };
    };

    const stubTsconfigFileName = "tsconfig.json";

    describe("run", () => {
        it("converts a GLS file to C#", async () => {
            // Arrange
            const inputFilePath = "file.gls";
            const outputFilePath = "file.cs";
            const { fileSystem, runner } = createTestRunner(
                "C#",
                {
                    [inputFilePath]: "comment line : Hello world!",
                    [stubTsconfigFileName]: "{}",
                });

            // Act
            const results = await runner.run({
                files: new Set([inputFilePath]),
                typescriptConfig: stubTsconfigFileName,
            });

            // Assert
            const expectedResults = "// Hello world!";
            expect(fileSystem.files[outputFilePath]).to.be.equal(expectedResults);
            expect(results.fileResults).to.be.deep.equal({
                [inputFilePath]: {
                    outputPath: outputFilePath,
                    status: ConversionStatus.Succeeded,
                },
            });
        });

        it("converts a TypeScript file to C#", async () => {
            // Arrange
            const inputFilePath = "file.ts";
            const outputFilePath = "file.cs";
            const { fileSystem, runner } = createTestRunner(
                "C#",
                {
                    [inputFilePath]: 'console.log("Hello world!");',
                    [stubTsconfigFileName]: "{}",
                });

            // Act
            const results = await runner.run({
                files: new Set([inputFilePath]),
                typescriptConfig: stubTsconfigFileName,
            });

            // Assert
            const expectedResults = [
                "using System;",
                "",
                'Console.WriteLine("Hello world!");',
            ].join(EOL);
            expect(fileSystem.files[outputFilePath]).to.be.equal(expectedResults);
            expect(results.fileResults).to.be.deep.equal({
                [inputFilePath]: {
                    outputPath: outputFilePath,
                    status: ConversionStatus.Succeeded,
                },
            });
        });
    });
});
