/**
 * Collapses consecutive duplicate numeric citation refs (e.g. `[3][3]` → `[3]`).
 * Does not alter multi-ref brackets like `[1, 2]`.
 * @param {unknown} text
 * @returns {string}
 */
export function collapseDuplicateBracketRefs(text) {
    return String(text ?? "").replace(/(\[\d+\])(?:\1)+/g, "$1");
}
