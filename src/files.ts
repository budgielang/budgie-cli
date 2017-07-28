import { readFile, writeFile } from "mz/fs";

export type IReadFile = (filePath: string) => Promise<string>;

export type IWriteFile = (filePath: string, contents: string) => Promise<void>;

export interface IFileSystem {
    readFile: IReadFile;
    writeFile: IWriteFile;
}

export class FileSystem implements IFileSystem {
    public async readFile(filePath: string) {
        return (await readFile(filePath)).toString();
    }

    public async writeFile(filePath: string, contents: string) {
        await writeFile(filePath, contents);
    }
}
