import * as chalk from "chalk";
import * as fs from "mz/fs";
import * as path from "path";

import { ILogger } from "./logger";

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
    const [cliVersion, glsVersion] = await Promise.all([
        getPackageVersion(path.join(__dirname, "../package.json")),
        getPackageVersion(path.join(__dirname, "../node_modules/general-language-syntax/package.json")),
    ]);

    logVersion(logger, "CLI", cliVersion);
    logVersion(logger, "GLS", glsVersion);
};
