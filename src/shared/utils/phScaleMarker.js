export const PH_SCALE_MIN = 3.5;
export const PH_SCALE_MAX = 7.0;

export const SCALE_SEGMENT_COLORS = ["#C6C955", "#60866E", "#526338", "#33372D", "#0C1446"];
/** Same stops as Figma pH scale — marker samples must match `.scale` background */
export const SCALE_GRADIENT =
    "linear-gradient(90deg, #C6C955 0%, #526338 25%, #526338 50%, #33372D 75%, #0C1446 100%)";

/** Must match `.scaleMarker` width/height in result page CSS modules */
export const MARKER_PX = 24;
/**
 * Extra inset beyond the visible marker radius.
 * `-2` keeps the 24px circle inside the scale track edges on ResultPageTest.
 */
export const MARKER_HIT_PADDING_PX = -2;
export const MARKER_HIT_HALF_PX = MARKER_PX / 2 + MARKER_HIT_PADDING_PX;

export const clampPhScale = (n, min = PH_SCALE_MIN, max = PH_SCALE_MAX) => {
    const x = Number(n);
    if (Number.isNaN(x)) return min;
    return Math.min(max, Math.max(min, x));
};

const phToTravelT = (ph, min, max) => (clampPhScale(ph, min, max) - min) / (max - min);

/** Marker position + gradient slice aligned with `.scale` */
export const getMarkerLayout = (ph, scaleWidthPx, min = PH_SCALE_MIN, max = PH_SCALE_MAX) => {
    if (scaleWidthPx <= 0) {
        return { leftPercent: 50, bgPosX: 0 };
    }
    const t = phToTravelT(ph, min, max);
    const travelPx = scaleWidthPx - 2 * MARKER_HIT_HALF_PX;
    if (travelPx <= 0) {
        return { leftPercent: 50, bgPosX: 0 };
    }
    const centerPx = MARKER_HIT_HALF_PX + t * travelPx;
    return {
        leftPercent: (centerPx / scaleWidthPx) * 100,
        bgPosX: -(centerPx - MARKER_PX / 2),
    };
};

/** Maps pointer X on the scale track to pH (same inset range as the marker). */
export const clientXToPhScale = (clientX, scaleEl, min = PH_SCALE_MIN, max = PH_SCALE_MAX) => {
    if (!scaleEl) return min;
    const rect = scaleEl.getBoundingClientRect();
    const travelPx = rect.width - 2 * MARKER_HIT_HALF_PX;
    if (travelPx <= 0) return min;
    const x = clientX - rect.left - MARKER_HIT_HALF_PX;
    const t = Math.min(1, Math.max(0, x / travelPx));
    const step = 0.1;
    const raw = min + t * (max - min);
    const rounded = Math.round(raw * 10) / 10;
    return Math.min(max, Math.max(min, rounded));
};
