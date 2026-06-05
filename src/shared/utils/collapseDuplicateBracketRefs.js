/**
 * Collapses adjacent duplicate numeric citation refs
 * (e.g. `[3][3]`, `[3], [3]`, `[3] [3]` → `[3]`).
 * Does not alter multi-ref brackets like `[1, 2]`.
 * @param {unknown} text
 * @returns {string}
 */
export function collapseDuplicateBracketRefs(text) {
    return String(text ?? "")
        .replace(/(\[\d+\])(?:(?:\s*,\s*|\s*)\1)+/g, "$1")
        // Drop orphan comma left after dedup (e.g. `[1], [1],` → `[1],` → `[1]`).
        .replace(/(\[\d+\])\s*,(?!\s*\[\d+\])/g, "$1");
}
