import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import homePageImg from "../../assets/images/homePageImg.webp";

import Button from "../../components/Button/Button";
import Container from "../../components/Container/Container";
import ImageWrapper from "../../components/ImageWrapper/ImageWrapper";
import BottomBlock from "../../components/BottomBlock/BottomBlock";

import SheetIcon from "../../assets/icons/SheetIcon";
import DesctopIcon from "../../assets/icons/DesctopIcon";
import ChartIcon from "../../assets/icons/ChartIcon";
import CheckIcon_9 from "../../assets/icons/CheckIcon_9";

import styles from "./PrivacyAndConsentPage.module.css";

const CONSENT_STORAGE_KEY = "phera_privacy_and_consent";

const PrivacyAndConsentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const persistConsent = (nextCore, nextAnalytics, nextAge) => {
        try {
            sessionStorage.setItem(
                CONSENT_STORAGE_KEY,
                JSON.stringify({
                    isCoreConsent: Boolean(nextCore),
                    isAnalyticsConsent: Boolean(nextAnalytics),
                    isAgeConfirmed: Boolean(nextAge),
                })
            );
        } catch {
            // ignore
        }
    };

    const readStoredConsent = () => {
        try {
            const st0 = location?.state;
            if (st0 && typeof st0 === "object" && st0.resetConsent) {
                try {
                    sessionStorage.removeItem(CONSENT_STORAGE_KEY);
                } catch {
                    // ignore
                }
                return { isCoreConsent: false, isAnalyticsConsent: false, isAgeConfirmed: false };
            }

            const st = location?.state;
            if (st && typeof st === "object" && typeof st.isCoreConsent !== "undefined") {
                return {
                    isCoreConsent: Boolean(st.isCoreConsent),
                    isAnalyticsConsent: Boolean(st.isAnalyticsConsent),
                    isAgeConfirmed: Boolean(st.isAgeConfirmed),
                };
            }

            const raw = sessionStorage.getItem(CONSENT_STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : null;
            if (!parsed || typeof parsed !== "object") {
                return { isCoreConsent: false, isAnalyticsConsent: false, isAgeConfirmed: false };
            }
            return {
                isCoreConsent: Boolean(parsed.isCoreConsent),
                isAnalyticsConsent: Boolean(parsed.isAnalyticsConsent),
                isAgeConfirmed: Boolean(parsed.isAgeConfirmed),
            };
        } catch {
            return { isCoreConsent: false, isAnalyticsConsent: false, isAgeConfirmed: false };
        }
    };

    const initial = useMemo(() => readStoredConsent(), []);
    const [isCoreConsent, setIsCoreConsent] = useState(initial.isCoreConsent);
    const [isAnalyticsConsent, setIsAnalyticsConsent] = useState(initial.isAnalyticsConsent);
    const [isAgeConfirmed, setIsAgeConfirmed] = useState(initial.isAgeConfirmed);

    const coreConsentId = useMemo(() => "privacy-core-consent", []);
    const analyticsConsentId = useMemo(() => "privacy-analytics-consent", []);
    const ageConfirmId = useMemo(() => "privacy-age-confirm", []);

    useEffect(() => {
        const st = location?.state;
        if (st && typeof st === "object" && st.resetConsent) {
            const { resetConsent, ...rest } = st;
            navigate(".", { replace: true, state: rest });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const canContinue = isCoreConsent && isAgeConfirmed;

    const handleContinue = () => {
        if (!canContinue) return;
        persistConsent(isCoreConsent, isAnalyticsConsent, isAgeConfirmed);
        navigate("/result", { state: { isCoreConsent, isAnalyticsConsent, isAgeConfirmed } });
    };

    useEffect(() => {
        navigate(".", {
            replace: true,
            state: { isCoreConsent, isAnalyticsConsent, isAgeConfirmed },
        });
    }, [isCoreConsent, isAnalyticsConsent, isAgeConfirmed]);

    useEffect(() => {
        persistConsent(isCoreConsent, isAnalyticsConsent, isAgeConfirmed);
    }, [isCoreConsent, isAnalyticsConsent, isAgeConfirmed]);

    return (
        <>
            <div className={styles.content}>
                <Container>
                    <div className={styles.section}>
                        <div className={styles.topImage}>
                            <ImageWrapper src={homePageImg} alt="Privacy and consent" />
                        </div>

                        <div className={styles.main}>
                            <div className={styles.titleBlock}>
                                <h1 className={styles.heading}>Privacy & Consent</h1>
                                <p className={styles.subheading}>Anonymous use · No account required</p>
                            </div>
                        </div>

                        <div className={styles.consentFields}>
                            <div className={styles.item}>
                                <div className={styles.headerWrap}>
                                    <div className={styles.headerIcon}><SheetIcon /></div>
                                    <div className={styles.headerText}>1. Core Consent (Required)*</div>
                                </div>
                                <label className={styles.checkRow} htmlFor={coreConsentId}>
                                    <div className={styles.input}>
                                        <input
                                            id={coreConsentId}
                                            type="checkbox"
                                            checked={isCoreConsent}
                                            onChange={(e) => {
                                                const next = e.target.checked;
                                                setIsCoreConsent(next);
                                                persistConsent(next, isAnalyticsConsent, isAgeConfirmed);
                                            }}
                                        />
                                    </div>
                                    <p className={styles.checkText}>
                                        I agree to the processing of my health-related data (such as pH value and any information I choose to provide) to generate personalized, evidence-based health insights.
                                    </p>
                                </label>
                            </div>

                            <div className={styles.item}>
                                <div className={styles.headerWrap}>
                                    <div className={styles.headerIcon}><DesctopIcon /></div>
                                    <div className={styles.headerText}>2. Technical Processing (Required)*</div>
                                </div>
                                <div className={styles.checkRow}>
                                    <div className={styles.checkedIcon} aria-hidden="true">
                                        <CheckIcon_9 />
                                    </div>
                                    <p className={styles.checkText}>
                                        We use limited technical data (timestamps and system logs) to ensure the service works correctly and securely. This data is not used to identify you.
                                    </p>
                                </div>
                                <p className={styles.supportingText}>Automatically applied - no action needed.</p>
                            </div>

                            <div className={styles.itemLast}>
                                <div className={styles.headerWrap}>
                                    <div className={styles.headerIcon}><ChartIcon /></div>
                                    <div className={styles.headerText}>3. Analytics (Optional)</div>
                                </div>
                                <label className={styles.checkRow} htmlFor={analyticsConsentId}>
                                    <div className={styles.input}>
                                        <input
                                            id={analyticsConsentId}
                                            type="checkbox"
                                            checked={isAnalyticsConsent}
                                            onChange={(e) => {
                                                const next = e.target.checked;
                                                setIsAnalyticsConsent(next);
                                                persistConsent(isCoreConsent, next, isAgeConfirmed);
                                            }}
                                        />
                                    </div>
                                    <p className={styles.checkText}>
                                        I agree to the use of my anonymised data to improve the service. No individual profiling is performed.
                                    </p>
                                </label>
                            </div>
                        </div>

                        <div className={styles.divider} />

                        <div className={styles.ageSection}>
                            <p className={styles.ageDisclaimer}>
                                This service processes health-related information and is intended only for users aged 18 and over.
                            </p>
                            <label className={styles.ageCheckRow} htmlFor={ageConfirmId}>
                                <div className={styles.input}>
                                    <input
                                        id={ageConfirmId}
                                        type="checkbox"
                                        checked={isAgeConfirmed}
                                        onChange={(e) => {
                                            const next = e.target.checked;
                                            setIsAgeConfirmed(next);
                                            persistConsent(isCoreConsent, isAnalyticsConsent, next);
                                        }}
                                    />
                                </div>
                                <span className={styles.ageCheckText}>
                                    I confirm that I am <span className={styles.ageHighlight}>at least 18 years old.</span>
                                </span>
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
                </Container>
                <BottomBlock>
                    <Button onClick={handleContinue} disabled={!canContinue}>Continue</Button>
                    <div className={styles.bottomText}><p>Optional analytics consent is not required. You can leave it unselected before continuing.</p> </div>
                </BottomBlock>
            </div>
        </>
    )
};

export default PrivacyAndConsentPage
