import { expect } from "chai";
import "mocha";

import { getFileExtension, replaceFileExtension } from "../../lib/utils/extensions";

describe("extensions", () => {
    describe("getFileExtension", () => {
        it("gets a .bg extension", () => {
            // Arrange
            const filePath = "file.bg";

            // Act
            const extension = getFileExtension(filePath);

            // Assert
            expect(extension).to.be.equal(".bg");
        });

        it("gets a .ts extension", () => {
            // Arrange
            const filePath = "file.ts";

            // Act
            const extension = getFileExtension(filePath);

            // Assert
            expect(extension).to.be.equal(".ts");
        });
    });

    describe("replaceFileExtension", () => {
        it("replaces a .bg extension with a .ts extension", () => {
            // Arrange
            const filePath = "file.bg";

            // Act
            const newFilePath = replaceFileExtension(filePath, ".bg", ".ts");

            // Assert
            expect(newFilePath).to.be.equal("file.ts");
        });

        it("replaces a .ts extension with a .bg extension", () => {
            // Arrange
            const filePath = "file.ts";

            // Act
            const newFilePath = replaceFileExtension(filePath, ".ts", ".bg");

            // Assert
            expect(newFilePath).to.be.equal("file.bg");
        });
    });
});
