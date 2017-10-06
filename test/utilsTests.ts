import { expect } from "chai";
import "mocha";

import { getFileExtension, replaceFileExtension } from "../lib/utils/extensions";

describe("utils", () => {
    describe("getFileExtension", () => {
        it("gets a .gls extension", () => {
            // Arrange
            const filePath = "file.gls";

            // Act
            const extension = getFileExtension(filePath);

            // Assert
            expect(extension).to.be.equal(".gls");
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
        it("replaces a .gls extension with a .ts extension", () => {
            // Arrange
            const filePath = "file.gls";

            // Act
            const newFilePath = replaceFileExtension(filePath, ".gls", ".ts");

            // Assert
            expect(newFilePath).to.be.equal("file.ts");
        });

        it("replaces a .ts extension with a .gls extension", () => {
            // Arrange
            const filePath = "file.ts";

            // Act
            const newFilePath = replaceFileExtension(filePath, ".ts", ".gls");

            // Assert
            expect(newFilePath).to.be.equal("file.gls");
        });
    });
});
