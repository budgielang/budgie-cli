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
    const [budgieVersion, cliVersion, tsBudgieVersion, tsVersion] = await Promise.all([
        getPackageVersion(path.join(__dirname, "../../package.json")),
        getPackageVersion(require.resolve("budgie").replace(path.normalize("lib/index.js"), "package.json")),
        getPackageVersion(require.resolve("ts-budgie").replace(path.normalize("src/index.js"), "package.json")),
        getPackageVersion(require.resolve("typescript").replace(path.normalize("lib/typescript.js"), "package.json")),
    ]);

    logVersion(logger, "budgie-cli", cliVersion);
    logVersion(logger, "budgie", budgieVersion);
    logVersion(logger, "ts-budgie", tsBudgieVersion);
    logVersion(logger, "typescript", tsVersion);
};
