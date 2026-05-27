import { useNavigate } from "react-router-dom";
import homePageImg from "../../assets/images/homePageImg.webp";

import Button from "../../components/Button/Button";
import Container from "../../components/Container/Container";
import ImageWrapper from "../../components/ImageWrapper/ImageWrapper";
import BottomBlock from "../../components/BottomBlock/BottomBlock";

import ShieldIcon from "../../assets/icons/ShieldIcon";
import ClockIcon from "../../assets/icons/ClockIcon";
import StarsIcon from "../../assets/icons/StarsIcon";
import EditIcon from "../../assets/icons/EditIcon";

import styles from "./HomePageTest.module.css";

const HomePageTest = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className={styles.content}>
        <Container>
          <div className={styles.section}>
            <div className={styles.topImage}>
              <ImageWrapper src={homePageImg} alt="Home page" />
            </div>

            <div className={styles.textBlock}>
              <h1 className={styles.heading}>Before we begin</h1>
              <p className={styles.subheading}>
                A few things we want you to know before you start.
              </p>
            </div>

            <div className={styles.card}>
              <div className={styles.cardRow}>
                <div className={styles.icon}>
                  <ShieldIcon />
                </div>
                <div className={styles.rowText}>
                  <div className={styles.rowTitle}>Completely anonymous</div>
                  <div className={styles.rowBody}>
                    You can use this service without an account. We do not collect
                    or store information that identifies you.
                  </div>
                </div>
              </div>

              <div className={styles.cardRow}>
                <div className={styles.icon}>
                  <ClockIcon />
                </div>
                <div className={styles.rowText}>
                  <div className={styles.rowTitle}>Session data is temporary</div>
                  <div className={styles.rowBody}>
                    Without an account, your session data is not stored between
                    sessions and is not used to identify you across visits.
                  </div>
                </div>
              </div>

              <div className={styles.cardRow}>
                <div className={styles.icon}>
                  <StarsIcon />
                </div>
                <div className={styles.rowText}>
                  <div className={styles.rowTitle}>Personalized health insights</div>
                  <div className={styles.rowBody}>
                    Insights are generated with the help of AI based on published
                    scientific research and your inputs. They are for informational
                    purposes only and do not constitute medical advice.
                  </div>
                </div>
              </div>

              <div className={styles.cardRowLast}>
                <div className={styles.icon}>
                  <EditIcon />
                </div>
                <div className={styles.rowText}>
                  <div className={styles.rowTitle}>You choose what to share</div>
                  <div className={styles.rowBody}>
                    All additional inputs are optional. They are used only to improve
                    the relevance of your results. Please avoid sharing names, contact
                    details, or addresses.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>

        <BottomBlock>
          <div className={styles.btnsBlock}>
            <Button onClick={() => navigate("/privacy-and-consent")}>Continue</Button>
            <div className={styles.bottomText}>
              <p>We respect your privacy. Only you can save and see your results. </p>
            </div>
          </div>
        </BottomBlock>
      </div>
    </>
  );
};

export default HomePageTest