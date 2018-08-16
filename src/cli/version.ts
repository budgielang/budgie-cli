import chalk from "chalk";
import * as fs from "mz/fs";
import * as path from "path";

import { ILogger } from "../logger";

interface IPackageInfo {
    version: string;
}

const getPackageVersion = async (filePath: string): Promise<string> => {
    const rawText = (await fs.readFile(filePath)).toString();
    const packageInfo: IPackageInfo = JSON.parse(rawText);

    return packageInfo.version;
};

const logVersion = (logger: ILogger, alias: string, version: string): void => {
    logger.log(`${chalk.bold(alias)} version: ${chalk.bold.green(version)}`);
};

export const printCliVersions = async (logger: ILogger): Promise<void> => {
    const [cliVersion, glsVersion, tsGlsVersion, tsVersion] = await Promise.all([
        getPackageVersion(path.join(__dirname, "../../package.json")),
        getPackageVersion(
            require.resolve("general-language-syntax")
                .replace(path.normalize("lib/index.js"), "package.json")),
        getPackageVersion(
            require.resolve("ts-gls")
                .replace(path.normalize("src/index.js"), "package.json")),
        getPackageVersion(
            require.resolve("typescript")
                .replace(path.normalize("lib/typescript.js"), "package.json")),
    ]);

    logVersion(logger, "CLI", cliVersion);
    logVersion(logger, "GLS", glsVersion);
    logVersion(logger, "TS-GLS", tsGlsVersion);
    logVersion(logger, "TypeScript", tsVersion);
};
