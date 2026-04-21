import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../../components/Button/Button";
import Container from "../../components/Container/Container";
import BottomBlock from "../../components/BottomBlock/BottomBlock";

import UsersIcon from "../../assets/icons/UsersIcon";
import ClockIcon from "../../assets/icons/ClockIcon";
import StackIcon from "../../assets/icons/StackIcon";
import EditIcon from "../../assets/icons/EditIcon";

import styles from "./HowItWorksPage.module.css";

const HowItWorksPage = () => {
    const navigate = useNavigate();
    return (
        <>
            <div className={styles.content}>
                <Container>
                    <div className={styles.wrapper}>
                        <h1 className={styles.heading}>How this works</h1>
                        <p className={styles.info}>A few things we want you to know before you start.</p>
                        <div className={styles.elements}>
                            <div className={styles.item}>
                                <div className={styles.headerWrap}>
                                    <div className={styles.headerIcon}><UsersIcon /></div>
                                    <div className={styles.headerText}>Completely anonymous</div>
                                </div>
                                <div className={styles.textWrap}>
                                    <div className={styles.text}>You can use this service without an account. We do not collect or store information that directly identifies you.</div>
                                </div>
                                <div className={styles.line}></div>
                            </div>
                            <div className={styles.item}>
                                <div className={styles.headerWrap}>
                                    <div className={styles.headerIcon}><ClockIcon /></div>
                                    <div className={styles.headerText}>Session data is temporary</div>
                                </div>
                                <div className={styles.textWrap}>
                                    <div className={styles.text}>Without an account, your session data is not stored between sessions and is not used to identify you across visits.</div>
                                </div>
                                <div className={styles.line}></div>
                            </div>
                            <div className={styles.item}>
                                <div className={styles.headerWrap}>
                                    <div className={styles.headerIcon}><StackIcon /></div>
                                    <div className={styles.headerText}>Personalized health insights</div>
                                </div>
                                <div className={styles.textWrap}>
                                    <div className={styles.text}>Insights are generated with the help of AI based on published scientific research and your inputs. They are for informational purposes only and do not constitute medical advice.</div>
                                </div>
                                <div className={styles.line}></div>
                            </div>
                            <div className={styles.item}>
                                <div className={styles.headerWrap}>
                                    <div className={styles.headerIcon}><EditIcon /></div>
                                    <div className={styles.headerText}>You choose what to share</div>
                                </div>
                                <div className={styles.textWrap}>
                                    <div className={styles.text}>All additional inputs are optional. They are used only to improve the relevance of your results. Please avoid sharing names, contact details, or addresses.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
                <BottomBlock>
                    <Button onClick={() => navigate("/result")}>Continue</Button>
                    <div className={styles.bottomText}><p>We respect your privacy. Only you can save and see your results. </p> </div>
                </BottomBlock>
            </div>
        </>
    )
};

export default HowItWorksPage