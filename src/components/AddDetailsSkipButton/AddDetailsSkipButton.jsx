import CheckBold12 from "../../assets/icons/CheckBold12";
import styles from "../../pages/AddDetailsBasicPage/AddDetailsBasicPage.module.css";

const AddDetailsSkipButton = ({ isSkipped, onClick }) => (
    <button
        type="button"
        className={`${styles.skipForNow} ${
            isSkipped ? styles.skipForNowActive : ""
        }`.trim()}
        onClick={onClick}
        aria-pressed={isSkipped}
    >
        {isSkipped && (
            <span className={styles.skipForNowIcon}>
                <CheckBold12 />
            </span>
        )}
        <span className={styles.skipForNowLabel}>
            {isSkipped ? "Skipped for now" : "Skip for now"}
        </span>
    </button>
);

export default AddDetailsSkipButton;
