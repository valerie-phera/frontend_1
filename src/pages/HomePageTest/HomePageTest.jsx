import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import homeImg from "../../assets/images/homeImg.png"

import Button from "../../components/Button/Button";
import Container from "../../components/Container/Container";
import ImageWrapper from "../../components/ImageWrapper/ImageWrapper";
import BottomBlock from "../../components/BottomBlock/BottomBlock";

import styles from "./HomePageTest.module.css";

const HomePageTest = () => {
    const navigate = useNavigate();
    const [isConfirmed, setIsConfirmed] = useState(false);

    const checkboxId = useMemo(() => "home-age-confirm", []);

    const handleContinue = () => {
        if (!isConfirmed) return;
        navigate("/privacy-and-consent");
    };

    return (
        <>
            <div className={styles.content}>
                <Container>
                    <div className={styles.imgWrap}>
                        <div className={styles.img}>
                            <ImageWrapper src={homeImg} alt="Home page img" width={243} height={249} />
                        </div>
                    </div>
                    <div className={styles.textBlock}>
                        <div className={styles.greeting}>PRIVACY & SECURITY</div>
                        <h1 className={styles.heading}>Before we begin</h1>
                        <p className={styles.text}>
                            This service processes health-related information and is intended only for users aged 18 and over.
                        </p>
                        <label className={styles.checkBlock} htmlFor={checkboxId}>
                            <div className={styles.input}>
                                <input
                                    id={checkboxId}
                                    type="checkbox"
                                    checked={isConfirmed}
                                    onChange={(e) => setIsConfirmed(e.target.checked)}
                                />
                            </div>
                            <div className={styles.checkBlockText}>I confirm that I am <span>at least 18 years old.</span></div>
                        </label>
                        <div className={styles.infoBox}>
                            <div className={styles.infoItem}>
                                <div className={styles.infoPunkt}></div>
                                <div className={styles.infoText}>By continuing you agree to pHera processing your health data as described in the next screen.</div>
                            </div>
                            <div className={styles.infoItem}>
                                <div className={styles.infoPunkt}></div>
                                <div className={styles.infoText}>You may use this service anonymously. No account is required.</div>
                            </div>
                        </div>
                    </div>
                </Container>
                <BottomBlock>
                    <div className={styles.btnsBlock}>
                        <Button onClick={handleContinue} disabled={!isConfirmed}>
                            Continue
                        </Button>
                        <div className={styles.bottomText}><p>You must confirm your age before proceeding.</p> </div>
                    </div>
                </BottomBlock>
            </div>
        </>
    )
};

export default HomePageTest