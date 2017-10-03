import { readFile, writeFile } from "mz/fs";

/**
 * Reads and writes files.
 */
export interface IFileSystem {
    /**
     * Reads a file.
     *
     * @param filePath   Path to the file.
     * @returns A Promise for the contents of the file.
     */
    readFile(filePath: string): Promise<string>;

    /**
     * Writes a file.
     *
     * @param filePath   Path to the file.
     * @param contents   New contents for the file.
     * @returns A Promise for writing to the file.
     */
    writeFile(filePath: string, contents: string): Promise<void>;
}

/**
 * Reads and writes files.
 */
export class FileSystem implements IFileSystem {
    /**
     * Reads a file.
     *
     * @param filePath   Path to the file.
     * @returns A Promise for the contents of the file.
     */
    public async readFile(filePath: string) {
        return (await readFile(filePath)).toString();
    }

    /**
     * Writes a file.
     *
     * @param filePath   Path to the file.
     * @param contents   New contents for the file.
     * @returns A Promise for writing to the file.
     */
    public async writeFile(filePath: string, contents: string) {
        await writeFile(filePath, contents);
    }
}
