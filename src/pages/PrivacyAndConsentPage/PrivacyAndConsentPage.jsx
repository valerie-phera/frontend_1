import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../../components/Button/Button";
import Container from "../../components/Container/Container";
import BottomBlock from "../../components/BottomBlock/BottomBlock";

import ShieldIcon from "../../assets/icons/ShieldIcon";
import DesctopIcon from "../../assets/icons/DesctopIcon";
import ChartIcon from "../../assets/icons/ChartIcon";

import styles from "./PrivacyAndConsentPage.module.css";

const CONSENT_STORAGE_KEY = "phera_privacy_and_consent";

const PrivacyAndConsentPage = () => {
    const navigate = useNavigate();
    const [isCoreConsent, setIsCoreConsent] = useState(() => {
        try {
            const raw = sessionStorage.getItem(CONSENT_STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : null;
            return Boolean(parsed?.isCoreConsent);
        } catch {
            return false;
        }
    });
    const [isAnalyticsConsent, setIsAnalyticsConsent] = useState(() => {
        try {
            const raw = sessionStorage.getItem(CONSENT_STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : null;
            return Boolean(parsed?.isAnalyticsConsent);
        } catch {
            return false;
        }
    });

    const coreConsentId = useMemo(() => "privacy-core-consent", []);
    const analyticsConsentId = useMemo(() => "privacy-analytics-consent", []);

    const handleContinue = () => {
        if (!isCoreConsent) return;
        navigate("/how-it-works");
    };

    useEffect(() => {
        try {
            sessionStorage.setItem(
                CONSENT_STORAGE_KEY,
                JSON.stringify({ isCoreConsent, isAnalyticsConsent })
            );
        } catch {
            // ignore
        }
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
                                            onChange={(e) => setIsCoreConsent(e.target.checked)}
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
                                            onChange={(e) => setIsAnalyticsConsent(e.target.checked)}
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