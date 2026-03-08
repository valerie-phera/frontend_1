import styles from "./Radio.module.css";

const Radio = ({
    name,
    value,
    checked,
    onClick,
    label,
}) => {
    return (
        <label className={styles.wrap}>
            <input
                type="radio"
                name={name}
                value={value}
                checked={checked}
                onChange={() => {}}  
                onClick={onClick}
                className={styles.input}
            />
            <span className={styles.custom} />
            <span className={styles.label}>{label}</span>
        </label>
    );
};

export default Radio;