export type IActionCreator = () => Promise<void>;

const defaultParallelLimit = 16;

export const queueAsyncActions = async (creators: IActionCreator[], limit = defaultParallelLimit): Promise<void> => {
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
