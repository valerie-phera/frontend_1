import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Button from "../../components/Button/Button";
import Container from "../../components/Container/Container";
import BottomBlock from "../../components/BottomBlock/BottomBlock";

import ShieldIcon from "../../assets/icons/ShieldIcon";
import DesctopIcon from "../../assets/icons/DesctopIcon";
import ChartIcon from "../../assets/icons/ChartIcon";

import styles from "./PrivacyAndConsentPage.module.css";

const CONSENT_STORAGE_KEY = "phera_privacy_and_consent";

const PrivacyAndConsentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const persistConsent = (nextCore, nextAnalytics) => {
        try {
            sessionStorage.setItem(
                CONSENT_STORAGE_KEY,
                JSON.stringify({ isCoreConsent: Boolean(nextCore), isAnalyticsConsent: Boolean(nextAnalytics) })
            );
        } catch {
            // ignore
        }
    };

    const readStoredConsent = () => {
        try {
            // Fresh navigation from start page should always reset consents.
            const st0 = location?.state;
            if (st0 && typeof st0 === "object" && st0.resetConsent) {
                try {
                    sessionStorage.removeItem(CONSENT_STORAGE_KEY);
                } catch {
                    // ignore
                }
                return { isCoreConsent: false, isAnalyticsConsent: false };
            }

            // 1) Prefer history state (works reliably for in-app navigation + Back/Forward)
            const st = location?.state;
            if (st && typeof st === "object" && typeof st.isCoreConsent !== "undefined") {
                return {
                    isCoreConsent: Boolean(st.isCoreConsent),
                    isAnalyticsConsent: Boolean(st.isAnalyticsConsent),
                };
            }

            // 2) Fallback to sessionStorage (helps when returning from external privacy policy site)
            const raw = sessionStorage.getItem(CONSENT_STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : null;
            if (!parsed || typeof parsed !== "object") {
                return { isCoreConsent: false, isAnalyticsConsent: false };
            }
            return {
                isCoreConsent: Boolean(parsed.isCoreConsent),
                isAnalyticsConsent: Boolean(parsed.isAnalyticsConsent),
            };
        } catch {
            return { isCoreConsent: false, isAnalyticsConsent: false };
        }
    };

    const initial = useMemo(() => readStoredConsent(), []); // only on mount
    const [isCoreConsent, setIsCoreConsent] = useState(initial.isCoreConsent);
    const [isAnalyticsConsent, setIsAnalyticsConsent] = useState(initial.isAnalyticsConsent);

    const coreConsentId = useMemo(() => "privacy-core-consent", []);
    const analyticsConsentId = useMemo(() => "privacy-analytics-consent", []);

    // Make resetConsent one-shot: remove it from history state after initial mount.
    useEffect(() => {
        const st = location?.state;
        if (st && typeof st === "object" && st.resetConsent) {
            const { resetConsent, ...rest } = st;
            navigate(".", { replace: true, state: rest });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleContinue = () => {
        if (!isCoreConsent) return;
        // Ensure the latest consent is persisted before navigation.
        persistConsent(isCoreConsent, isAnalyticsConsent);
        navigate("/how-it-works", { state: { isCoreConsent, isAnalyticsConsent } });
    };

    // Keep the current /privacy-and-consent history entry updated so Back restores instantly.
    useEffect(() => {
        navigate(".", {
            replace: true,
            // Overwrite to avoid re-introducing one-shot flags like `resetConsent`.
            state: { isCoreConsent, isAnalyticsConsent },
        });
    }, [isCoreConsent, isAnalyticsConsent]);

    // Still persist on change (safety net), but primary persistence happens synchronously in handlers.
    useEffect(() => {
        persistConsent(isCoreConsent, isAnalyticsConsent);
    }, [isCoreConsent, isAnalyticsConsent]);

    return (
        <>
            <div className={styles.content}>
                <Container>
                    <div className={styles.wrapper}>
                        <h1 className={styles.heading}>Privacy & Consent</h1>
                        <p className={styles.info}>Please review how we use your information.</p>
                        <div className={styles.elements}>
                            <div className={styles.item}>
                                <div className={styles.headerWrap}>
                                    <div className={styles.headerIcon}><ShieldIcon /></div>
                                    <div className={styles.headerText}>1. Core Consent (Required)*</div>
                                </div>
                                <label className={`${styles.textWrap} ${styles.checkBlock}`} htmlFor={coreConsentId}>
                                    <div className={styles.input}>
                                        <input
                                            id={coreConsentId}
                                            type="checkbox"
                                            checked={isCoreConsent}
                                            onChange={(e) => {
                                                const next = e.target.checked;
                                                setIsCoreConsent(next);
                                                persistConsent(next, isAnalyticsConsent);
                                            }}
                                        />
                                    </div>
                                    <p className={styles.text}>I agree to the processing of my health-related data (such as pH value and any information I choose to provide) to generate personalised, evidence-based health insights.</p>
                                </label>
                                <div className={styles.line}></div>
                            </div>
                            <div className={styles.item}>
                                <div className={styles.headerWrap}>
                                    <div className={styles.headerIcon}><DesctopIcon /></div>
                                    <div className={styles.headerText}>2. Technical Processing (Required)*</div>
                                </div>
                                <div className={styles.textWrap}>
                                    <p className={`${styles.text} ${styles.narrow}`}>
                                        We use limited technical data (timestamps and system logs) to ensure the service works correctly and securely. This data is not used to identify you.
                                    </p>
                                </div>
                                <div className={styles.textGray}>Automatically applied - no action needed.</div>
                                <div className={styles.line}></div>
                            </div>
                            <div className={styles.item}>
                                <div className={styles.headerWrap}>
                                    <div className={styles.headerIcon}><ChartIcon /></div>
                                    <div className={styles.headerText}>3. Analytics (Optional)</div>
                                </div>
                                <label className={`${styles.textWrap} ${styles.checkBlock} ${styles.checkBlockStill}`} htmlFor={analyticsConsentId}>
                                    <div className={styles.input}>
                                        <input
                                            id={analyticsConsentId}
                                            type="checkbox"
                                            checked={isAnalyticsConsent}
                                            onChange={(e) => {
                                                const next = e.target.checked;
                                                setIsAnalyticsConsent(next);
                                                persistConsent(isCoreConsent, next);
                                            }}
                                        />
                                    </div>
                                    <p className={styles.text}>I agree to the use of my anonymised data to improve the service</p>
                                </label>
                            </div>
                        </div>
                        <div className={styles.privPolicy}>
                            Read our full{" "}
                            <a
                                href="https://phera.digital/privacy-policy/"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                privacy policy
                            </a>
                        </div>
                    </div>
                </Container>
                <BottomBlock>
                    <Button onClick={handleContinue} disabled={!isCoreConsent}>Continue</Button>
                    <div className={styles.bottomText}><p>You can withdraw optional consent at any time in Settings.</p> </div>
                </BottomBlock>
            </div>
        </>
    )
};

export default PrivacyAndConsentPage