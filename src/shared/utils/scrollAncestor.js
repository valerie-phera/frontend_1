/** First ancestor that actually scrolls (same idea as ScrollToTop). */
export function findScrollableAncestor(startEl) {
  let node = startEl instanceof Element ? startEl : null;
  let overflowHost = null;

  while (node && node !== document.documentElement) {
    if (node instanceof HTMLElement) {
      const { overflowY } = window.getComputedStyle(node);
      const isScrollHost =
        overflowY === "auto" ||
        overflowY === "scroll" ||
        overflowY === "overlay";

      if (isScrollHost) {
        if (node.scrollHeight > node.clientHeight + 1) {
          return node;
        }
        overflowHost ??= node;
      }
    }
    node = node.parentElement;
  }

  if (overflowHost) return overflowHost;

  const body = document.body;
  if (body instanceof HTMLElement) {
    const { overflowY } = window.getComputedStyle(body);
    if (
      (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") &&
      body.scrollHeight > body.clientHeight + 1
    ) {
      return body;
    }
  }

  const root = document.scrollingElement;
  return root instanceof HTMLElement ? root : null;
}

const STICKY_FOOTER_SELECTOR = "[data-page-sticky-footer]";

/** Bottom of the visible scrollport (sticky footer + mobile keyboard). */
export function getScrollportClipBottom(scroller, fromEl) {
  const scrollerRect = scroller.getBoundingClientRect();
  let clipBottom = scrollerRect.bottom;

  const pageRoot =
    (fromEl instanceof Element && fromEl.closest("[data-scroll-container]")) ||
    scroller;

  if (pageRoot instanceof HTMLElement) {
    const footer = pageRoot.querySelector(STICKY_FOOTER_SELECTOR);
    if (footer instanceof HTMLElement) {
      const footerRect = footer.getBoundingClientRect();
      if (footerRect.top < clipBottom) {
        clipBottom = footerRect.top;
      }
    }
  }

  const vv = window.visualViewport;
  if (vv && vv.height < window.innerHeight * 0.88) {
    clipBottom = Math.min(clipBottom, vv.offsetTop + vv.height);
  }

  return clipBottom;
}
