const loaded = new Set();
const inflight = new Map();

/** Warm browser cache; resolves when the image has finished loading (or failed). */
export function preloadImage(src) {
    if (!src) return Promise.resolve();
    if (loaded.has(src)) return Promise.resolve();
    if (inflight.has(src)) return inflight.get(src);

    const promise = new Promise((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => {
            loaded.add(src);
            resolve();
        };
        img.onerror = () => resolve();
        img.src = src;
    }).finally(() => {
        inflight.delete(src);
    });

    inflight.set(src, promise);
    return promise;
}

export function isImageCached(src) {
    return Boolean(src && loaded.has(src));
}

export function preloadImages(sources) {
    return Promise.all(sources.map(preloadImage));
}
