import { stub } from "sinon";

import { IFileSystem } from "../lib/fileSystem";
import { ILogger } from "../lib/logger";

export const stubFileSystem = (): IFileSystem => ({
    readFile: stub(),
    writeFile: stub(),
});

export const stubLogger = (): ILogger =>
    ({
        error: stub(),
        log: stub(),
    });
