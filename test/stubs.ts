import { stub } from "sinon";

import { IFileSystem } from "../lib/files";
import { ILogger } from "../lib/logger";

export const stubFileSystem = (): IFileSystem => ({
    readFile: stub(),
    writeFile: stub(),
});

export const stubLogger = (): ILogger => ({
    error: stub(),
    log: stub(),
} as any); // tslint:disable-line no-any
