import { useLocation, useNavigate } from "react-router-dom";

import BottomBlock from "../../components/BottomBlock/BottomBlock";
import Button from "../../components/Button/Button";
import ButtonReverse from "../../components/ButtonReverse/ButtonReverse";
import Container from "../../components/Container/Container";
import ImageWrapper from "../../components/ImageWrapper/ImageWrapper";

import nextStepImg from "../../assets/images/nextStepImg.png";
import CheckIcon_16 from "../../assets/icons/CheckIcon_16";
import Lock_16 from "../../assets/icons/Lock_16";

import basicStyles from "../AddDetailsBasicPage/AddDetailsBasicPage.module.css";
import styles from "./NextStepsPage.module.css"

const DEFAULT_LOCKED_ITEMS = ["Hormone therapy"];

const toLockedItems = (value) => {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value === "string" && value.trim()) return [value.trim()];
    return DEFAULT_LOCKED_ITEMS;
};

const toTotalSteps = (value, lockedItemsLength) => {
    const n = Number(value);
    if (Number.isFinite(n) && n >= 4 && n <= 10) return Math.floor(n);
    return lockedItemsLength >= 2 ? 5 : 4;
};

const NextStepsPage = ({ lockedItems: lockedItemsProp, totalSteps: totalStepsProp }) => {
    const navigate = useNavigate();
    const { state } = useLocation();

    const lockedItems = toLockedItems(
        lockedItemsProp ?? state?.lockedItems ?? state?.nextSteps?.lockedItems
    );
    const totalSteps = toTotalSteps(
        totalStepsProp ?? state?.totalSteps ?? state?.nextSteps?.totalSteps,
        lockedItems.length
    );

    const stepsRemaining = Math.max(1, lockedItems.length);
    const moreStepsText = stepsRemaining === 1 ? "1 more step" : `${stepsRemaining} more steps`;

    return (
        <>
            <div className={styles.content}>
                <Container>
                    <div className={basicStyles.crumbs}>
                        <div className={basicStyles.itemColored}></div>
                        <div className={basicStyles.itemColored}></div>
                        <div className={basicStyles.itemColored}></div>
                        {Array.from({ length: Math.max(0, totalSteps - 3) }).map((_, idx) => (
                            <div key={idx} className={basicStyles.item}></div>
                        ))}
                    </div>
                    <div className={basicStyles.step}>Step 3 of {totalSteps}</div>

                    <div className={styles.imgWrap}>
                        <div className={styles.img}>
                            <ImageWrapper
                                src={nextStepImg}
                                alt="Next steps illustration"
                                width={243}
                                height={278}
                            />
                        </div>
                    </div>

                    <div className={styles.textBlock}>
                        <h1 className={styles.heading}>
                            Good start - your basic report is ready
                        </h1>
                        <p className={styles.text}>
                            You can view your result now, or take {moreStepsText} to
                            get a fully personalised interpretation.
                        </p>
                        <div className={styles.infoBlock}>
                            <div className={styles.infoTitle}>
                                Your result already includes:
                            </div>
                            <ul className={styles.elements}>
                                <li className={styles.item}>
                                    <div className={styles.infoIcon}>
                                        <CheckIcon_16 />
                                    </div>
                                    <div className={styles.infoTxt}>pH value</div>
                                </li>
                                <li className={styles.item}>
                                    <div className={styles.infoIcon}>
                                        <CheckIcon_16 />
                                    </div>
                                    <div className={styles.infoTxt}>About you</div>
                                </li>
                                <li className={styles.item}>
                                    <div className={styles.infoIcon}>
                                        <CheckIcon_16 />
                                    </div>
                                    <div className={styles.infoTxt}>
                                        Menstrual cycle
                                    </div>
                                </li>
                                <li className={styles.item}>
                                    <div className={styles.infoIcon}>
                                        <CheckIcon_16 />
                                    </div>
                                    <div className={styles.infoTxt}>Symptoms</div>
                                </li>
                                {lockedItems.map((label) => (
                                    <li key={label} className={styles.item}>
                                        <div className={styles.infoIcon}>
                                            <Lock_16 />
                                        </div>
                                        <div className={styles.infoTxtGray}>{label}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* <BottomBlock>
                        <Button onClick={() => navigate("/result")}>
                            Add more details
                        </Button>
                        <ButtonReverse>View report now</ButtonReverse>
                        <div className={styles.bottomText}>
                            <p>
                                We respect your privacy. Only you can save and see
                                your results.
                            </p>
                        </div>
                    </BottomBlock> */}
                </Container>
                <BottomBlock>
                    <Button onClick={() => navigate("/result")}>
                        Add more details
                    </Button>
                    <ButtonReverse>View report now</ButtonReverse>
                    <div className={styles.bottomText}>
                        <p>
                            We respect your privacy. Only you can save and see
                            your results.
                        </p>
                    </div>
                </BottomBlock>
            </div>
        </>
    );
};

export default NextStepsPage;

