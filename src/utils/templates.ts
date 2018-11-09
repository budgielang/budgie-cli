export const insertIntoTemplate = (template: string, insertions: { [i: string]: string }): string => {
    for (const key in insertions) {
        if (!{}.hasOwnProperty.call(insertions, key)) {
            continue;
        }

        template = template.replace(new RegExp(`{${key}}`, "g"), insertions[key]);
    }

    return template;
};
