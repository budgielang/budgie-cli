/**
 * Logs information on significant events.
 */
export type ILogger = Readonly<Pick<typeof console, "error" | "log">>;

/**
 * Importance levels of logs that may be printed.
 */
export enum Verbosity {
    Error = "error",
    Log = "log",
}

export const parseVerbosity = (rawVerbosity: string | undefined): Verbosity | undefined => {
    switch (rawVerbosity) {
        case undefined:
        case "error":
            return Verbosity.Error;

        case "log":
            return Verbosity.Log;

        default:
            return undefined;
    }
};

export const wrapLoggerForVerbosity = (logger: ILogger, verbosity: Verbosity): ILogger =>
    ({
        error: logger.error.bind(logger),
        log: verbosity === Verbosity.Log
            ? logger.log.bind(logger)
            : () => {},
    });
