import * as glob from "glob";

export { IOptions as IGlobOptions } from "glob";

export const globAsync = async (pattern: string, options: glob.IOptions = {}): Promise<string[]> =>
    new Promise<string[]>((resolve, reject) => {
        glob(pattern, options, (error: Error | null, matches: string[]) => {
            // tslint:disable-next-line:no-null-keyword
            if (error !== null) {
                reject(error);
                return;
            }

            resolve(matches);
        });
    });

export const globAllAsync = async (patterns: string[], options: glob.IOptions = {}) =>
    (await Promise
        .all(patterns.map(async (pattern: string) => globAsync(pattern, options))))
        .reduce((allResults: string[], nextResults: string[]) => allResults.concat(nextResults), []);

export type IGlobAsync = typeof globAsync;

export type IGlobAllAsync = typeof globAllAsync;
