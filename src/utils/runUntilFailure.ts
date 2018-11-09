import { ExitCode } from "../codes";

/**
 * Executes each operation in series, stopping if one returns an error code.
 * 
 * @param operations   Operations to run in series.
 * @returns Promise for an error code if any errored, or OK code if none did.
 */
export const runUntilFailure = async (operations: (() => Promise<ExitCode | undefined | void>)[]): Promise<ExitCode> => {
    for (const operation of operations) {
        if ((await operation()) === ExitCode.Error) {
            return ExitCode.Error;
        }
    }

    return ExitCode.Ok;
};
