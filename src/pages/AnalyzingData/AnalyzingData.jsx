import { useNavigate } from "react-router-dom";
import analyzingDataImg from "../../assets/images/analyzingDataImg.png"

import Container from "../../components/Container/Container";
import ImageWrapper from "../../components/ImageWrapper/ImageWrapper";

import CheckIcon_16 from "../../assets/icons/CheckIcon_16";
import CheckCircle from "../../assets/icons/CheckCircle";

import styles from "./AnalyzingData.module.css";

const AnalyzingData = () => {
    const navigate = useNavigate();

    return (
        <>
            <div className={styles.content}>
                <Container>
                    <div className={styles.imgWrap}>
                        <div className={styles.img}>
                            <ImageWrapper src={analyzingDataImg} alt="Analyzing Data Img" width={243} height={235} />
                        </div>
                    </div>
                    <div className={styles.textBlock}>
                        <div className={styles.greeting}>ANALYZING DATA</div>
                        <h1 className={styles.heading}>Thank you for sharing!</h1>
                        <p className={styles.text}>
                            We're now personalising your result based on your details. This usually takes some time - please stay on this screen while we work.
                        </p>
                    </div>
                    <div className={styles.reviewingBlock}>
                        <div className={styles.reviewingHeadingWrap}>
                            <div className={styles.reviewingHeading}>Reviewing your details...</div>
                            <div className={styles.reviewingValue}>30%</div>
                        </div>
                        <div className={styles.scale}>
                            <div className={styles.greyArea}></div>
                            <div className={styles.greenArea}></div>
                        </div>
                        <ul className={styles.elements}>
                            <li className={styles.item}>
                                <div className={styles.itemIcon}><CheckIcon_16 /></div>
                                <div className={styles.itemTxt}>pH value recorded</div>
                            </li>
                            <li className={styles.item}>
                                <div className={styles.itemIcon}><CheckCircle /></div>
                                <div className={styles.itemTxtProcessing}>Reviewing your details</div>
                            </li>
                            <li className={styles.item}>
                                <div className={styles.itemIconGray}></div>
                                <div className={styles.itemTxtGray}>Matching to research data</div>
                            </li>
                            <li className={styles.item}>
                                <div className={styles.itemIconGray}></div>
                                <div className={styles.itemTxtGray}>Building your tailored report</div>
                            </li>
                        </ul>
                    </div>
                    <div className={styles.bottomText}><p>We respect your privacy. Only you can save and see your results.</p> </div>
                </Container>
            </div>
        </>
    )
};

export default AnalyzingData