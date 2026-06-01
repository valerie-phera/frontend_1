export const stripNoneToken = (arr, token = "None") => {
    const list = Array.isArray(arr) ? arr : [];
    return list.filter((x) => x && x !== token);
};

export const toggleListItem = (prev, value) => {
    const arr = stripNoneToken(prev);
    return arr.includes(value)
        ? arr.filter((x) => x !== value)
        : [...arr, value];
};
