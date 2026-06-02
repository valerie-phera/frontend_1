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

  const appRoot = document.getElementById("root");
  if (appRoot instanceof HTMLElement) {
    const { overflowY } = window.getComputedStyle(appRoot);
    if (
      (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") &&
      appRoot.scrollHeight > appRoot.clientHeight + 1
    ) {
      return appRoot;
    }
  }

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

const DEFAULT_CLEARANCE_TOP = 8;
const DEFAULT_CLEARANCE_BOTTOM = 12;
const MIN_SCROLL_DELTA_PX = 2;
const DEFAULT_SCROLL_DURATION_MS = 520;
const SCROLL_START_DELAY_MS = 72;

/** Same feel as accordion transitions: cubic-bezier(0.4, 0, 0.2, 1). */
function easeStandard(t) {
  const clamped = Math.max(0, Math.min(1, t));
  const inv = 1 - clamped;
  return 1 - inv * inv * inv;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function clampScrollTop(scroller, value) {
  const maxScroll = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
  return Math.max(0, Math.min(maxScroll, value));
}

function measureScrollport(el, scroller, clearanceTop, clearanceBottom) {
  const scrollerRect = scroller.getBoundingClientRect();
  const clipTop = scrollerRect.top + clearanceTop;
  const clipBottom = getScrollportClipBottom(scroller, el) - clearanceBottom;
  const elRect = el.getBoundingClientRect();
  const available = clipBottom - clipTop;

  return { clipTop, clipBottom, elRect, available };
}

function computeTargetScrollTop(el, scroller, clearanceTop, clearanceBottom) {
  const { clipTop, clipBottom, elRect, available } = measureScrollport(
    el,
    scroller,
    clearanceTop,
    clearanceBottom
  );

  const fullyVisible =
    elRect.top >= clipTop && elRect.bottom <= clipBottom;

  if (fullyVisible) return null;

  const currentScroll = scroller.scrollTop;
  let scrollDelta = 0;

  if (elRect.height > available) {
    scrollDelta = elRect.top - clipTop;
  } else if (elRect.bottom > clipBottom) {
    scrollDelta = elRect.bottom - clipBottom;
    const projectedTop = elRect.top - scrollDelta;
    if (projectedTop < clipTop) {
      scrollDelta = elRect.top - clipTop;
    }
  } else if (elRect.top < clipTop) {
    scrollDelta = elRect.top - clipTop;
  }

  if (Math.abs(scrollDelta) < MIN_SCROLL_DELTA_PX) return null;

  return clampScrollTop(scroller, currentScroll + scrollDelta);
}

function animateScrollTop(
  scroller,
  targetScrollTop,
  durationMs,
  isCancelled = () => false
) {
  const startScrollTop = scroller.scrollTop;
  const delta = targetScrollTop - startScrollTop;

  if (Math.abs(delta) < MIN_SCROLL_DELTA_PX) {
    return Promise.resolve();
  }

  if (prefersReducedMotion() || durationMs <= 0) {
    scroller.scrollTop = targetScrollTop;
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const startTime = performance.now();
    let frameId = 0;

    const tick = (now) => {
      if (isCancelled()) {
        resolve();
        return;
      }

      const progress = Math.min((now - startTime) / durationMs, 1);
      scroller.scrollTop = startScrollTop + delta * easeStandard(progress);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      } else {
        scroller.scrollTop = targetScrollTop;
        resolve();
      }
    };

    frameId = window.requestAnimationFrame(tick);
  });
}

/**
 * Scroll so an opened accordion/card is fully visible inside the scrollport
 * (accounts for sticky footer and mobile keyboard).
 * @returns {() => void} cancel pending scroll / animation
 */
export function scrollOpenedSectionIntoView(
  el,
  {
    clearanceTop = DEFAULT_CLEARANCE_TOP,
    clearanceBottom = DEFAULT_CLEARANCE_BOTTOM,
    durationMs = DEFAULT_SCROLL_DURATION_MS,
    startDelayMs = SCROLL_START_DELAY_MS,
  } = {}
) {
  let cancelled = false;
  let timerId = 0;

  const cancel = () => {
    cancelled = true;
    window.clearTimeout(timerId);
  };

  if (!(el instanceof Element)) return cancel;

  const scroller = findScrollableAncestor(el);
  if (!scroller) return cancel;

  const runScroll = () => {
    if (cancelled) return;

    const targetScrollTop = computeTargetScrollTop(
      el,
      scroller,
      clearanceTop,
      clearanceBottom
    );

    if (targetScrollTop == null) return;

    animateScrollTop(
      scroller,
      targetScrollTop,
      durationMs,
      () => cancelled
    );
  };

  if (startDelayMs <= 0 || prefersReducedMotion()) {
    runScroll();
    return cancel;
  }

  timerId = window.setTimeout(runScroll, startDelayMs);
  return cancel;
}
