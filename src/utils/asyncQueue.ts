export type IActionCreator = () => Promise<void>;

const defaultParallelLimit = 16;

/**
 * Creates and runs Promises similarly to Promise.all, but with a limit to concurrent operations.
 *
 * @param creators   Creates Promises to be run.
 * @param limit   Limit to concurrent promises to be run.
 * @returns Promise for all operations to have resolved or rejected.
 */
export const queueAsyncActions = async (creators: ReadonlyArray<IActionCreator>, limit = defaultParallelLimit): Promise<void> => {
    await new Promise<void>((resolve, reject) => {
        let nextUp = 0;
        let completed = 0;

        const startNextAction = () => {
            if (nextUp === creators.length) {
                if (completed === creators.length) {
                    resolve();
                }

                return;
            }

            creators[nextUp]()
                .then(() => {
                    completed += 1;
                    startNextAction();
                })
                .catch((error) => {
                    reject(error);
                });

            nextUp += 1;
        };

        for (let i = 0; i < Math.min(creators.length, limit); i += 1) {
            startNextAction();
        }
    });
};
