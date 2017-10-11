import { expect } from "chai";
import "mocha";
import { stub } from "sinon";

import { queueAsyncActions } from "../../lib/utils/asyncQueue";

describe("asyncQueue", () => {
    describe("queueAsyncActions", () => {
        const neverEndingPromise = new Promise<void>(() => {/* ... */});

        // tslint:disable no-unused-expression no-floating-promises
        it("immediately calls the limited number of creators", async () => {
            // Arrange
            const creators = [
                stub().returns(neverEndingPromise),
                stub().returns(neverEndingPromise),
                stub().returns(neverEndingPromise),
            ];

            // Act
            queueAsyncActions(creators, creators.length);
            await Promise.resolve();

            // Assert
            for (const creator of creators) {
                expect(creator).to.have.been.calledOnce;
            }
        });

        it("doesn't immediately call a creator past the limit", async () => {
            // Arrange
            const creators = [
                stub().returns(neverEndingPromise),
                stub().returns(neverEndingPromise),
                stub().returns(neverEndingPromise),
            ];

            // Act
            queueAsyncActions(creators, creators.length - 1);

            // Assert
            expect(creators[creators.length - 1]).to.not.have.been.calledOnce;
        });

        it("calls a next creator when the first creator finishes", async () => {
            // Arrange
            const creators = [
                stub().returns(Promise.resolve()),
                stub().returns(neverEndingPromise),
                stub().returns(neverEndingPromise),
            ];

            // Act
            queueAsyncActions(creators, creators.length - 1);
            await Promise.resolve();

            // Assert
            expect(creators[creators.length - 1]).to.have.been.calledOnce;
        });

        it("calls a second next creator when two have finished", async () => {
            // Arrange
            const creators = [
                stub().returns(Promise.resolve()),
                stub().returns(Promise.resolve()),
                stub().returns(neverEndingPromise),
            ];

            // Act
            queueAsyncActions(creators, creators.length - 2);
            await Promise.resolve();
            await Promise.resolve();

            // Assert
            expect(creators[creators.length - 1]).to.have.been.calledOnce;
        });

        it("resolved when all limited and extra creators finish", async () => {
            // Arrange
            const creators = [
                stub().returns(Promise.resolve()),
                stub().returns(Promise.resolve()),
                stub().returns(Promise.resolve()),
            ];

            // Act
            await queueAsyncActions(creators, creators.length - 1);

            // Assert
            for (const creator of creators) {
                expect(creator).to.have.been.calledOnce;
            }
        });
        // tslint:enable no-unused-expression no-floating-promises
    });
});
