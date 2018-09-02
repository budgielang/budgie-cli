/**
 * Retrieves a file's extension.
 *
 * @param filePath   Original file path.
 * @returns Extension from the file, including preceding period.
 */
export const getFileExtension = (filePath: string) => filePath.substring(filePath.lastIndexOf("."));

/**
 * Replaces a file's extension.
 *
 * @param filePath   Original file path.
 * @param oldExtension   Original file extension.
 * @param newExtension   Extension to replace the old extension.
 * @returns The file's equivalent with the new extension.
 */
export const replaceFileExtension = (filePath: string, oldExtension: string, newExtension: string): string =>
    filePath.substring(filePath.length - oldExtension.length) === oldExtension
        ? `${filePath.substring(0, filePath.length - oldExtension.length)}${newExtension}`
        : `${filePath}${newExtension}`;
