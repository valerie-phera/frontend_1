import {
    ETHNIC_OTHER_OPTION,
    ETHNIC_OPTIONS,
} from "../../components/PersonalData/EthnicBackground/EthnicBackground";

const KNOWN_ETHNIC_CHIPS = new Set(ETHNIC_OPTIONS);

const legacyEthnicSessionStorageKey = (phValue, timestamp) =>
    `phera_basic_ethnic_v1_${String(phValue)}_${encodeURIComponent(String(timestamp ?? ""))}`;

const basicFormSessionStorageKey = (phValue, timestamp) =>
    `phera_basic_form_v2_${String(phValue)}_${encodeURIComponent(String(timestamp ?? ""))}`;

const PENDING_INTERCEPT_KEY = "phera_intercept_result_to_basic_v1";
const INTERCEPT_TTL_MS = 25 * 60 * 1000;

const normalizeEthnicFromRoute = (savedBg, savedOtherText) => {
    const arr = Array.isArray(savedBg) ? savedBg : [];
    const savedTrim = String(savedOtherText ?? "").trim().slice(0, 50);

    const unknownCustom = [];
    const knownSet = new Set();

    for (const item of arr) {
        if (!item) continue;
        if (KNOWN_ETHNIC_CHIPS.has(item)) {
            if (item !== ETHNIC_OTHER_OPTION) {
                knownSet.add(item);
            }
        } else {
            unknownCustom.push(item);
        }
    }

    const otherText = savedTrim || String(unknownCustom[0] ?? "").trim().slice(0, 50);

    const chips = ETHNIC_OPTIONS.filter(
        (o) => o !== ETHNIC_OTHER_OPTION && knownSet.has(o)
    );
    if (otherText) {
        chips.push(ETHNIC_OTHER_OPTION);
    }

    return { chips, otherText };
};

export const readBasicFormSnapshot = (phValue, timestamp) => {
    if (phValue === undefined || phValue === null) return null;
    try {
        const v2 = sessionStorage.getItem(
            basicFormSessionStorageKey(phValue, timestamp)
        );
        if (v2) {
            const data = JSON.parse(v2);
            if (data && Array.isArray(data.ethnicBackground)) {
                return data;
            }
        }
        const legacy = sessionStorage.getItem(
            legacyEthnicSessionStorageKey(phValue, timestamp)
        );
        if (legacy) {
            const data = JSON.parse(legacy);
            if (data && Array.isArray(data.ethnicBackground)) {
                return {
                    ethnicBackground: data.ethnicBackground,
                    ethnicOtherText: data.ethnicOtherText ?? "",
                };
            }
        }
        return null;
    } catch {
        return null;
    }
};

export const writeBasicFormSnapshot = (
    phValue,
    timestamp,
    { age, lifeStage, ethnicBackground, ethnicOtherText }
) => {
    if (phValue === undefined || phValue === null) return;
    try {
        sessionStorage.setItem(
            basicFormSessionStorageKey(phValue, timestamp),
            JSON.stringify({
                age,
                lifeStage: Array.isArray(lifeStage) ? lifeStage : [],
                ethnicBackground,
                ethnicOtherText: ethnicOtherText ?? "",
            })
        );
    } catch {
        /* ignore quota / private mode */
    }
};

export const resolveBasicFormState = (routeState) => {
    const snap = readBasicFormSnapshot(
        routeState?.phValue,
        routeState?.timestamp
    );

    const ethnicNorm = snap?.ethnicBackground
        ? normalizeEthnicFromRoute(
              snap.ethnicBackground,
              snap.ethnicOtherText
          )
        : normalizeEthnicFromRoute(
              routeState?.ethnicBackground,
              routeState?.ethnicOtherText
          );

    const age =
        snap && Object.prototype.hasOwnProperty.call(snap, "age")
            ? snap.age
            : (routeState?.age ?? "");
    const lifeStage =
        snap && Array.isArray(snap.lifeStage)
            ? snap.lifeStage
            : routeState?.lifeStage || [];

    return {
        age,
        lifeStage,
        ethnicChips: ethnicNorm.chips,
        ethnicOtherText: ethnicNorm.otherText,
    };
};

/**
 * After saving basic form and opening /result-with-details, some mobile browsers
 * drop /add-details/basic from the history stack. If the user then lands on /result,
 * consume this marker and redirect to /add-details/basic with restored state.
 */
export const markPendingInterceptResultToBasic = ({
    phValue,
    timestamp,
    recommendations,
}) => {
    if (phValue === undefined || phValue === null) return;
    try {
        sessionStorage.setItem(
            PENDING_INTERCEPT_KEY,
            JSON.stringify({
                phValue,
                timestamp,
                recommendations: recommendations ?? [],
                until: Date.now() + INTERCEPT_TTL_MS,
            })
        );
    } catch {
        /* ignore */
    }
};

export const consumePendingInterceptResultToBasic = () => {
    try {
        const raw = sessionStorage.getItem(PENDING_INTERCEPT_KEY);
        if (!raw) return null;
        const meta = JSON.parse(raw);
        if (
            !meta ||
            typeof meta.phValue === "undefined" ||
            meta.until < Date.now()
        ) {
            sessionStorage.removeItem(PENDING_INTERCEPT_KEY);
            return null;
        }
        sessionStorage.removeItem(PENDING_INTERCEPT_KEY);
        return meta;
    } catch {
        sessionStorage.removeItem(PENDING_INTERCEPT_KEY);
        return null;
    }
};
