import styles from "./BottomBlock.module.css";

const BottomBlock = ({ children }) => {
    return (
        <>
            <div className={styles.bottomBlock} data-page-sticky-footer>
                <div className={styles.bottomBlockInner}>
                    {children}
                </div>
            </div>
        </>
    )
};

export default BottomBlock;