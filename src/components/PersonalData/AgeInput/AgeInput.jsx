import { useState, useEffect } from "react";
import InfoTooltip from "../../InfoTooltip/InfoTooltip";
import AgeIcon from "../../../assets/AddDetailsIcons/AgeIcon";
import styles from "./AgeInput.module.css";
import titleStyles from "../../../shared/styles/titleWithIcon.module.css";

const MAX_AGE = 120;
const MIN_AGE = 18;

const ERROR_TEXT = "Please enter an age between 18-120";

const AgeInput = ({
    age,
    onChange,
    showHeadingError = false,
    showError = false,
}) => {
    const [localAge, setLocalAge] = useState(age ?? "");
    const [error, setError] = useState("");
    const [touched, setTouched] = useState(false);

    useEffect(() => {
        setLocalAge(age ?? "");
    }, [age]);

    const validate = (valueStr) => {
        if (valueStr === "") return "";
        const value = Number(valueStr);
        if (Number.isNaN(value)) return ERROR_TEXT;
        if (value < MIN_AGE || value > MAX_AGE) return ERROR_TEXT;
        return "";
    };

    const handleChange = (e) => {
        const raw = e.target.value;
        setLocalAge(raw);
        // Don't validate while typing; validate on blur / submit.
        setError("");
        onChange(raw === "" ? "" : raw);
    };

    const handleBlur = (e) => {
        setTouched(true);
        setError(validate(e.target.value));
    };

    const showInlineError = (touched && !!error) || showError;
    const inlineErrorText = error || (showError ? ERROR_TEXT : "");

    return (
        <div className={styles.wrap}>
            <InfoTooltip
                title={
                    <span className={titleStyles.titleWithIcon}>
                        <AgeIcon aria-hidden />
                        <span>Age</span>
                    </span>
                }
                showArrow={false}
                showErrorCircle={showHeadingError}
            >
                It is normal for vaginal pH to change with age, because of how hormones work at different life stages. Such shifts can slightly affect natural self-lubrication and odor.
            </InfoTooltip>

            <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                className={`${styles.input} ${
                    showInlineError ? styles.inputError : ""
                }`}
                placeholder="Enter your age"
                value={localAge}
                onChange={handleChange}
                onBlur={handleBlur}
                min={MIN_AGE}
                max={MAX_AGE}
            />

            {showInlineError && inlineErrorText && (
                <p className={styles.warn}>{inlineErrorText}</p>
            )}
        </div>
    );
};

export default AgeInput;