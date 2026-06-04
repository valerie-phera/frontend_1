import { useState, useLayoutEffect, useCallback } from "react";
import {
    findScrollableAncestor,
    getDeviceFrameScale,
    getPopoverHorizontalBounds,
    isPopoverAnchorVisible,
} from "../utils/scrollAncestor";

const VIEWPORT_PADDING_PX = 16;
const POPOVER_LAYOUT_MAX_PX = 215;
const POPOVER_LAYOUT_MIN_PX = 180;
const POPOVER_ARROW_INSET_PX = 14;

export function computeAnchoredPopoverStyle({
    anchorEl,
    boundsEl,
    popoverEl,
    viewportPadding = VIEWPORT_PADDING_PX,
}) {
    if (!(anchorEl instanceof HTMLElement)) return null;

    const boundsFromEl = boundsEl instanceof HTMLElement ? boundsEl : anchorEl;
    const rect = anchorEl.getBoundingClientRect();
    const frameScale = getDeviceFrameScale(anchorEl);
    const { minX, maxX } = getPopoverHorizontalBounds(
        boundsFromEl,
        viewportPadding,
    );
    const availableWidth = Math.max(0, maxX - minX);
    const layoutMaxWidth =
        frameScale > 0 ? availableWidth / frameScale : availableWidth;
    const popoverLayoutWidth =
        popoverEl?.offsetWidth ??
        Math.min(
            POPOVER_LAYOUT_MAX_PX,
            Math.max(POPOVER_LAYOUT_MIN_PX, layoutMaxWidth),
        );
    const layoutHalfWidth = popoverLayoutWidth / 2;
    const visualHalfWidth = layoutHalfWidth * frameScale;

    const anchorCenterX = rect.left + rect.width / 2;
    const minCenterX = minX + visualHalfWidth;
    const maxCenterX = maxX - visualHalfWidth;
    const left =
        maxCenterX >= minCenterX
            ? Math.max(minCenterX, Math.min(maxCenterX, anchorCenterX))
            : (minX + maxX) / 2;

    const viewportArrowOffset = anchorCenterX - left;
    const maxLayoutArrowOffset = Math.max(0, layoutHalfWidth - POPOVER_ARROW_INSET_PX);
    const layoutArrowOffset =
        frameScale > 0 ? viewportArrowOffset / frameScale : viewportArrowOffset;
    const arrowOffset = Math.max(
        -maxLayoutArrowOffset,
        Math.min(maxLayoutArrowOffset, layoutArrowOffset),
    );

    const scroller = findScrollableAncestor(boundsFromEl);
    const visible = isPopoverAnchorVisible(
        anchorEl,
        boundsFromEl,
        scroller,
        popoverEl,
    );

    return {
        top: rect.top,
        left,
        maxWidth: layoutMaxWidth > 0 ? layoutMaxWidth : undefined,
        arrowOffset,
        frameScale,
        visible,
    };
}

export function useAnchoredPopoverStyle(open, getAnchorEl, getBoundsEl, popoverRef) {
    const [style, setStyle] = useState(null);

    const update = useCallback(() => {
        const anchorEl = getAnchorEl();
        if (!anchorEl) return;

        setStyle(
            computeAnchoredPopoverStyle({
                anchorEl,
                boundsEl: getBoundsEl(),
                popoverEl: popoverRef.current,
            }),
        );
    }, [getAnchorEl, getBoundsEl, popoverRef]);

    useLayoutEffect(() => {
        if (!open) {
            setStyle(null);
            return undefined;
        }

        update();
        const rafId = window.requestAnimationFrame(update);

        window.addEventListener("resize", update);
        window.visualViewport?.addEventListener("resize", update);

        return () => {
            window.cancelAnimationFrame(rafId);
            window.removeEventListener("resize", update);
            window.visualViewport?.removeEventListener("resize", update);
        };
    }, [open, update]);

    return style;
}
