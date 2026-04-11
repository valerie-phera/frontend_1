import { useNavigate } from "react-router-dom";
import homeImg from "../../assets/images/homeImg.png"

import Button from "../../components/Button/Button";
import Container from "../../components/Container/Container";
import ImageWrapper from "../../components/ImageWrapper/ImageWrapper";

import styles from "./HomePageTest.module.css";

const HomePageTest = () => {
    const navigate = useNavigate();

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
                        <div className={styles.greeting}>DATA PRIVACY</div>
                        <h1 className={styles.heading}>Your health data is yours.</h1>
                        <p className={styles.text}>
                            We built pHera to be a safe space. Your personal details are completely confidential, encrypted, and protected by European GDPR standards.
                        </p>
                    </div>
                    <div className={styles.btnsBlock}>
                        <Button onClick={() => navigate("/result")}>Continue</Button>
                        <div className={styles.privPolicy}> <a href="#">Privacy policy</a></div>
                        <div className={styles.bottomText}><p>We respect your privacy. Only you can save and see your results.</p> </div>
                    </div>
                </Container>
            </div>
        </>
    )
};

export default HomePageTest