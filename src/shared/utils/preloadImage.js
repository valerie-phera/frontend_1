const preloaded = new Set();

/** Warm browser cache for a bundled image URL (safe to call repeatedly). */
export function preloadImage(src) {
    if (!src || preloaded.has(src)) return;
    preloaded.add(src);
    const img = new Image();
    img.decoding = "async";
    img.src = src;
}

export function preloadImages(sources) {
    sources.forEach(preloadImage);
}
