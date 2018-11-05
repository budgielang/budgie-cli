import { expect } from "chai";
import "mocha";

import { cli } from "../lib/cli/cli";
import { ExitCode } from "../lib/codes";
import { IMainDependencies } from "../lib/main";
import { stubLogger } from "./stubs";

interface IGlobExpansions {
    [i: string]: ReadonlyArray<string>;
}

describe("CLI", () => {
    const stubGlobber = (globExpansions: IGlobExpansions) => async (patterns: ReadonlyArray<string>) => {
        const results = [];

        for (const pattern of patterns) {
            if (pattern in globExpansions) {
                results.push(...globExpansions[pattern]);
            } else {
                throw new Error(`Unknown glob pattern: '${pattern}'.`);
            }
        }

        return results;
    };

    const stubMainDependencies = (
        extraArgv: ReadonlyArray<string>,
        globExpansions: IGlobExpansions,
        innerMain: (dependencies: IMainDependencies) => void,
    ) => {
        const argv = ["node", "gls-cli", "--language", "Java", ...extraArgv];
        const globber = stubGlobber(globExpansions);
        const logger = stubLogger();
        const main = async (mainArgs: IMainDependencies) => {
            innerMain(mainArgs);
            return ExitCode.Ok;
        };

        return { argv, globber, logger, main };
    };

    describe("version", () => {
        it("doesn't crash and burn", async () => {
            // Arrange
            const dependencies = stubMainDependencies(["--version"], {}, () => {
                /* ... */
            });

            // Act
            await cli(dependencies);
        });
    });

    describe("files", () => {
        it("includes a provided file", async () => {
            // Arrange
            const stubFileName = "file.gls";
            const dependencies = stubMainDependencies(
                [stubFileName],
                {
                    [stubFileName]: [stubFileName],
                },
                (mainArgs: IMainDependencies) => {
                    // Assert
                    const actualFiles = Array.from(mainArgs.filePaths);

                    expect(actualFiles).to.be.deep.equal([stubFileName]);
                },
            );

            // Act
            await cli(dependencies);
        });

        it("expands matches from a globber", async () => {
            // Arrange
            const stubExpander = "*.gls";
            const stubFileNames = ["a.gls", "b.gls"];
            const dependencies = stubMainDependencies(
                [stubExpander],
                {
                    [stubExpander]: stubFileNames,
                },
                (mainArgs: IMainDependencies) => {
                    // Assert
                    const actualFiles = Array.from(mainArgs.filePaths);

                    expect(actualFiles).to.be.deep.equal(stubFileNames);
                },
            );

            // Act
            await cli(dependencies);
        });

        it("removes an exclude from included files", async () => {
            // Arrange
            const stubExpander = "*.gls";
            const stubFileNames = ["a.gls", "b.gls"];
            const dependencies = stubMainDependencies(
                [stubExpander, "--exclude", stubFileNames[0]],
                {
                    [stubFileNames[0]]: [stubFileNames[0]],
                    [stubFileNames[1]]: [stubFileNames[1]],
                    [stubExpander]: stubFileNames,
                },
                (mainArgs: IMainDependencies) => {
                    // Assert
                    const actualFiles = Array.from(mainArgs.filePaths);

                    expect(actualFiles).to.be.deep.equal([stubFileNames[1]]);
                },
            );

            // Act
            await cli(dependencies);
        });
    });
});
