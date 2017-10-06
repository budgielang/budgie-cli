/**
 * Indents each line of text with a tab character.
 *
 * @param text   Text to indent.
 * @returns The indented text.
 */
export const indent = (text: string) =>
`    ${text.replace(/\n/g, "\n    ")}`;
