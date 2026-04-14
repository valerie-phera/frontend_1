import { useNavigate } from "react-router-dom";

import BottomBlock from "../../components/BottomBlock/BottomBlock";
import Button from "../../components/Button/Button";
import ButtonReverse from "../../components/ButtonReverse/ButtonReverse";
import Container from "../../components/Container/Container";
import ImageWrapper from "../../components/ImageWrapper/ImageWrapper";

import nextStepImg from "../../assets/images/nextStepImg.png"
import CheckIcon_16 from "../../assets/icons/CheckIcon_16";
import Lock_16 from "../../assets/icons/Lock_16";

import basicStyles from "../AddDetailsBasicPage/AddDetailsBasicPage.module.css";
import styles from "./NextStepsPage.module.css";

const NextStepsPage = () => {
    const navigate = useNavigate();

    return (
        <>
            <div className={styles.content}>
                <Container>
                    <div className={basicStyles.crumbs}>
                        <div className={basicStyles.itemColored}></div>
                        <div className={basicStyles.itemColored}></div>
                        <div className={basicStyles.itemColored}></div>
                        <div className={basicStyles.item}></div>
                    </div>
                    <div className={basicStyles.step}>
                        Step 3 of 4
                    </div>
                    <div className={styles.imgWrap}>
                        <div className={styles.img}>
                            <ImageWrapper src={nextStepImg} alt="Home page img" width={243} height={278} />
                        </div>
                    </div>
                    <div className={styles.textBlock}>
                        <h1 className={styles.heading}>Good start - your basic report is ready</h1>
                        <p className={styles.text}>
                            You can view your result now, or take 1 more step to get a fully personalised interpretation.
                        </p>
                        <div className={styles.infoBlock}>
                            <div className={styles.infoTitle}>Your result already includes:</div>
                            <ul className={styles.elements}>
                                <li className={styles.item}>
                                    <div className={styles.infoIcon}><CheckIcon_16 /></div>
                                    <div className={styles.infoTxt}>pH value</div>
                                </li>
                                <li className={styles.item}>
                                    <div className={styles.infoIcon}><CheckIcon_16 /></div>
                                    <div className={styles.infoTxt}>About you</div>
                                </li>
                                <li className={styles.item}>
                                    <div className={styles.infoIcon}><CheckIcon_16 /></div>
                                    <div className={styles.infoTxt}>Menstrual cycle</div>
                                </li>
                                <li className={styles.item}>
                                    <div className={styles.infoIcon}><CheckIcon_16 /></div>
                                    <div className={styles.infoTxt}>Symptoms</div>
                                </li>
                                <li className={styles.item}>
                                    <div className={styles.infoIcon}><Lock_16 /></div>
                                    <div className={styles.infoTxtGray}>Hormone therapy</div>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <BottomBlock>
                        <Button onClick={() => navigate("/result")}>Add more details</Button>
                        <ButtonReverse>View report now</ButtonReverse>
                        <div className={styles.bottomText}><p>We respect your privacy. Only you can save and see your results.</p> </div>
                    </BottomBlock>
                </Container>
            </div>
        </>
    )
};

export default NextStepsPage