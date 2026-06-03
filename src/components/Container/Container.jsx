import styles from "./Container.module.css"

const Container = ({ children, fullWidth = false }) => {
    return (
        <div
            className={`${styles.containerStyle} ${fullWidth ? styles.fullWidth : ""}`}
            data-popover-bounds={fullWidth ? undefined : ""}
        >
            {children}
        </div>
    );
};
export default Container;


