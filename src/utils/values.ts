/**
 * Gets a provided value or generates a default.
 *
 * @template TValue   Type of value to provide.
 * @param value   Provided value to use, if available.
 * @param defaultValueCreator   Creates a default value if necessary.
 * @returns Value or generated default.
 */
export const defaultValue = <TValue>(value: TValue | undefined, defaultValueCreator: () => TValue): TValue =>
    value === undefined
        ? defaultValueCreator()
        : value;
