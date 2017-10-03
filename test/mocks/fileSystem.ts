import { IFileSystem } from "../../lib/files";

export interface IMockFiles {
    [i: string]: string;
}

export interface IMockFileSystem extends IFileSystem {
    readonly files: IMockFiles;
}

export const mockFileSystem = (files: IMockFiles): IMockFileSystem =>
    ({
        files,
        readFile: async (filePath: string) => files[filePath],
        writeFile: async (filePath: string, contents: string) => {
            files[filePath] = contents;
        },
    });
