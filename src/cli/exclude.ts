import { IGlobAllAsync, IGlobOptions } from "../utils/glob";

export { IGlobOptions };

export const getExcludes = async (
    excludes: string | ReadonlyArray<string> | undefined,
    globber: IGlobAllAsync,
): Promise<ReadonlyArray<string>> => {
    if (excludes === undefined) {
        return [];
    }

    if (typeof excludes === "string") {
        return getExcludes([excludes], globber);
    }

    return globber(excludes);
};
