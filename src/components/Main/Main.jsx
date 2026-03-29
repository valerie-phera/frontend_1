import { useNavigate } from "react-router-dom";

import qr from "../../assets/icons/qr.svg";
import privacy from "../../assets/icons/privacy.svg";
import insights from "../../assets/icons/insights.svg";

import styles from "./Main.module.css";

const Main = () => {
    const navigate = useNavigate();

    const handleTryDemo = () => {
        // navigate("/camera-view");
        navigate("/begin-test");
    };

    return (
        <>
            <main>
                <div className={styles.heading}>
                    <h1 className={styles.title}>Vaginal Health, <span>Simplified</span></h1>
                    <p className={styles.subtitle}>Quick, private pH testing right from your phone. No lab visits, no waiting.</p>
                    <div className={styles.wrapBtn}>
                        <button className={styles.btn} onClick={handleTryDemo}>Try Demo</button>
                    </div>
                </div>
                <div className={styles.info}>
                    <div className={styles.block}>
                        <div className={styles.blockItem}>
                            <div className={styles.iconWrap}>
                                <div className={styles.icon}>
                                    <img src={qr} alt="qr-code" />
                                </div>
                            </div>
                            <h4>Instant Results</h4>
                            <p>Scan the QR code on your test kit and get results in seconds using your phone camera.</p>
                        </div>
                        <div className={styles.blockItem}>
                            <div className={styles.iconWrap}>
                                <div className={styles.icon}>
                                    <img src={privacy} alt="privacy" />
                                </div>
                            </div>
                            <h4>Privacy First</h4>
                            <p>All processing happens on your device. No images are uploaded or stored anywhere.</p>
                        </div>
                        <div className={styles.blockItem}>
                            <div className={styles.iconWrap}>
                                <div className={styles.icon}>
                                    <img src={insights} alt="insights" />
                                </div>
                            </div>
                            <h4>Personalized Insights</h4>
                            <p>Optional context helps tailor guidance to your unique situation and life stage.</p>
                        </div>
                    </div>
                </div>
                <div className={styles.description}>
                    <h3>How pHera testing works</h3>
                    <div className={styles.list}>
                        <div className={styles.item}>
                            <div className={styles.number}><span>1</span></div>
                            <div>
                                <h4>Scan your kit</h4>
                                <p>Scan the QR code on your pHera box to start the test. This helps us identify your kit and guide you through the process.</p>
                            </div>
                        </div>
                        <div className={styles.item}>
                            <div className={styles.number}><span>2</span></div>
                            <div>
                                <h4>Allow camera access</h4>
                                <p>Give pHera one-time access to your camera, so it can scan your test-strip. pHera doesn’t take or save any photos - it checks the colors in real time to give you to give you a pH reading and simple context. </p>
                            </div>
                        </div>
                        <div className={styles.item}>
                            <div className={styles.number}><span>3</span></div>
                            <div>
                                <h4>Get Your Results</h4>
                                <p>After you scan your strip, we’ll process the color and show your pH result within seconds — along with a clear explanation.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
};

export default Main;

