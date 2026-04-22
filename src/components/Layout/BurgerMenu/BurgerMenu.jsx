import { useNavigate } from "react-router-dom";
import ArrowRightBlack from "../../../assets/icons/ArrowRightBlack";
import styles from "./BurgerMenu.module.css";

const BurgerMenu = ({ isMenuOpen, onClose }) => {
    const navigate = useNavigate();
    if (!isMenuOpen) return null;

    const goTo = (path) => {
        navigate(path);
        onClose();
    };

    return (
        <div className={`${styles.overlay} ${isMenuOpen ? styles.open : ""}`} onClick={onClose}>
            <ul onClick={(e) => e.stopPropagation()}>
                <li className={styles.item}>
                    <button type="button" className={styles.itemBtn} onClick={() => goTo("/home/complete")}>
                        <span>Home</span>
                        <ArrowRightBlack />
                    </button>
                </li>
                <li className={styles.item}>
                    <button type="button" className={styles.itemBtn} onClick={() => goTo("/test-history")}>
                        <span>Test history</span>
                        <ArrowRightBlack />
                    </button>
                </li>
                <li className={styles.item}>
                    <button type="button" className={styles.itemBtn} onClick={() => goTo("/health-library")}>
                        <span>Health library</span>
                        <ArrowRightBlack />
                    </button>
                </li>
                <li className={styles.item}>
                    <button type="button" className={styles.itemBtn} onClick={() => goTo("/trend-preview")}>
                        <span>Trend preview</span>
                        <ArrowRightBlack />
                    </button>
                </li>
                <li className={styles.item}>
                    <button type="button" className={styles.itemBtn} onClick={() => goTo("/profile")}>
                        <span>Profile</span>
                        <ArrowRightBlack />
                    </button>
                </li>
            </ul>
        </div>
    );
};

export default BurgerMenu