import * as glob from "glob";

export { IOptions as IGlobOptions } from "glob";

export const globAsync = async (pattern: string, options: glob.IOptions = {}): Promise<ReadonlyArray<string>> =>
    new Promise<ReadonlyArray<string>>((resolve, reject) => {
        glob(pattern, options, (error: Error | null, matches: ReadonlyArray<string>) => {
            if (error !== null) {
                reject(error);
                return;
            }

            resolve(matches);
        });
    });

export const globAllAsync = async (patterns: ReadonlyArray<string>, options: glob.IOptions = {}) =>
    (await Promise.all(patterns.map(async (pattern: string) => globAsync(pattern, options)))).reduce(
        (allResults: ReadonlyArray<string>, nextResults: ReadonlyArray<string>) => allResults.concat(nextResults),
        [],
    );

export type IGlobAsync = typeof globAsync;

export type IGlobAllAsync = typeof globAllAsync;
