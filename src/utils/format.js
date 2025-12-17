export const slugify = (name) => {
    if (typeof name !== 'string') {
        return '';
    }
    return name.toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "");
};