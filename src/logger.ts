/**
 * Logs information on significant events.
 */
export type ILogger = Readonly<Pick<typeof console, "error" | "log" | "warn">>;
