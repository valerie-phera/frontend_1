import { useNavigate } from "react-router-dom";
import completePageImg from "../../assets/images/completePageImg.webp"

import Button from "../../components/Button/Button";
import Container from "../../components/Container/Container";
import ImageWrapper from "../../components/ImageWrapper/ImageWrapper";
import TryAgainIcon from "../../assets/icons/TryAgainIcon";

import styles from "./TestCompletePage.module.css";

const TestCompletePage = () => {
    const navigate = useNavigate();

    return (
        <>
            <div className={styles.content}>
                <Container>
                    <div className={styles.imgWrap}>
                        <div className={styles.img}>
                            <ImageWrapper src={completePageImg} alt="Home page img" width={243} height={280} />
                        </div>
                    </div>
                    <div className={styles.textBlock}>
                        <div className={styles.greeting}>Demo complete</div>
                        <h1 className={styles.heading}>Thank you for trying pHera demo!</h1>
                        <p className={styles.text}>
                            We're building the full product and your input helps us make it better for everyone.
                        </p>
                    </div>
                    <div className={styles.btnsBlock}>
                        <Button onClick={() => navigate("/result")} className={styles.btn}>Try again <span><TryAgainIcon /></span></Button>
                        <div className={styles.bottomTextWrap}>
                            <p className={styles.bottomText}>Visit our website to learn more:</p>
                            <p className={styles.bottomText}>
                                <a
                                    href="https://phera.digital/"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    https://phera.digital/
                                </a>
                            </p>
                        </div>
                    </div>
                </Container>
            </div>
        </>
    )
};

export default TestCompletePage
