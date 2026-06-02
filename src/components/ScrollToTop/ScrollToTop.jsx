import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function findFirstScrollableAncestor(el) {
    let node = el;
    while (node && node !== document.documentElement) {
        const hasScrollable =
            node.scrollHeight > node.clientHeight &&
            getComputedStyle(node).overflowY !== "visible";
        if (hasScrollable) return node;
        node = node.parentElement;
    }
    return null;
}

function getAppScrollRoot() {
    const root = document.getElementById("root");
    if (!(root instanceof HTMLElement)) return null;
    const { overflowY } = getComputedStyle(root);
    const scrolls =
        overflowY === "auto" ||
        overflowY === "scroll" ||
        overflowY === "overlay";
    return scrolls ? root : null;
}

function scrollToTop(el) {
    try {
        el.scrollTo?.({ top: 0, left: 0, behavior: "auto" });
    } catch {
        el.scrollTop = 0;
    }
}

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        const t = setTimeout(() => {
            const marked = document.querySelector("[data-scroll-container]");
            if (marked) {
                const scrollable = findFirstScrollableAncestor(marked) || marked;
                scrollToTop(scrollable);
                return;
            }

            const appRoot = getAppScrollRoot();
            if (appRoot) {
                scrollToTop(appRoot);
                return;
            }

            const bodyChildren = Array.from(document.body.children);
            let found = null;
            for (const ch of bodyChildren) {
                if (ch.scrollHeight > ch.clientHeight && getComputedStyle(ch).overflowY !== "visible") {
                    found = ch;
                    break;
                }
            }
            if (found) {
                scrollToTop(found);
                return;
            }

            const sc = document.scrollingElement || document.documentElement;
            scrollToTop(sc);
            window.scrollTo(0, 0);
        }, 0);

        return () => clearTimeout(t);
    }, [pathname]);

    return null;
};

export default ScrollToTop;