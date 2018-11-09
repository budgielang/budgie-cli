import { expect } from "chai";
import { LanguagesBag } from "general-language-syntax";
import "mocha";
import { EOL } from "os";

import { createRunner } from "../lib/runner/runnerFactory";
import { IMockFiles, mockFileSystem } from "./mocks/fileSystem";
import { stubLogger } from "./stubs";

describe("Runner", () => {
    const createTestRunner = (languageNames: string[] = ["C#"], files: IMockFiles = {}) => {
        const fileSystem = mockFileSystem(files);
        const languages = languageNames.map((languageName) => new LanguagesBag().getLanguageByName(languageName));
        const logger = stubLogger();
        const runner = createRunner({ fileSystem, languages, logger });

        return { runner, fileSystem, languages, logger };
    };

    const stubTsconfigFileName = "tsconfig.json";

    describe("run", () => {
        it("converts a GLS file to C#", async () => {
            // Arrange
            const inputFilePath = "File.gls";
            const inputFileContents = "comment line : Hello world!";
            const { fileSystem, runner } = createTestRunner(["C#"], {
                [inputFilePath]: inputFileContents,
                [stubTsconfigFileName]: "{}",
            });

            // Act
            await runner.run({
                existingFileContents: new Map([[inputFilePath, inputFileContents]]),
                requestedFiles: new Set([inputFilePath]),
                typescriptConfig: stubTsconfigFileName,
            });

            // Assert
            expect(fileSystem.files).to.contain({
                "File.cs": "// Hello world!",
            });
        });

        it("converts a GLS file to multiple languages", async () => {
            // Arrange
            const inputFilePath = "File.gls";
            const inputFileContents = "comment line : Hello world!";
            const { fileSystem, runner } = createTestRunner(["C#", "Python"], {
                [inputFilePath]: inputFileContents,
                [stubTsconfigFileName]: "{}",
            });

            // Act
            await runner.run({
                existingFileContents: new Map([[inputFilePath, inputFileContents]]),
                requestedFiles: new Set([inputFilePath]),
                typescriptConfig: stubTsconfigFileName,
            });

            // Assert
            expect(fileSystem.files).to.contain({
                "File.cs": "// Hello world!",
                "File.py": "# Hello world!",
            });
        });

        it("converts a TypeScript file to C#", async () => {
            // Arrange
            const inputFilePath = "Sample/File.ts";
            const inputFileContents = 'console.log("Hello world!");';
            const { fileSystem, runner } = createTestRunner(["C#"], {
                [inputFilePath]: inputFileContents,
                [stubTsconfigFileName]: "{}",
            });

            // Act
            await runner.run({
                existingFileContents: new Map([[inputFilePath, inputFileContents]]),
                requestedFiles: new Set([inputFilePath]),
                typescriptConfig: stubTsconfigFileName,
            });

            // Assert
            expect(fileSystem.files).to.contain({
                "Sample/File.cs": ["using System;", "", "namespace Sample", "{", '    Console.WriteLine("Hello world!");', "}"].join(EOL),
                "Sample/File.gls": ["file start : Sample File", '    print : ("Hello world!")', "file end"].join(EOL),
            });
        });
    });
});
