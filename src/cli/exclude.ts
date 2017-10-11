import { IOptions } from "glob"; // tslint:disable-line:no-unused-variable

import { IGlobAllAsync } from "../utils/glob";

export const getExcludes = async (excludes: string | string[] | undefined, globber: IGlobAllAsync): Promise<string[]> => {
    if (excludes === undefined) {
        return [];
    }

    if (typeof excludes === "string") {
        return await getExcludes([excludes], globber);
    }

    return await globber(excludes);
};
