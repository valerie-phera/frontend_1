import { useNavigate } from "react-router-dom";
import { useState } from "react";
import BottomBlock from "../../components/BottomBlock/BottomBlock";
import Button from "../../components/Button/Button";
import Container from "../../components/Container/Container";

import styles from "./BeginTestPage.module.css";

const MIN_PH = 4;
const MAX_PH = 7;
const STEP = 0.05;

const formatDate = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = String(now.getFullYear()).slice(-2);
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${day}.${month}.${year} | ${hours}:${minutes} ${ampm}`;
};

const clampPh = (raw) => {
    const n = parseFloat(String(raw).replace(",", "."));
    if (Number.isNaN(n)) return null;
    let v = Math.min(MAX_PH, Math.max(MIN_PH, n));
    const steps = Math.round((v - MIN_PH) / STEP);
    v = MIN_PH + steps * STEP;
    return Number(v.toFixed(2));
};

/**
 * Только цифры — режим «как на телефоне»: 556 → 5.56 (первая цифра, точка, ещё до двух цифр).
 * Есть точка или запятая — ввод как набран (Backspace на 7.00 не сбрасывает значение).
 */
const sanitizePhInput = (raw) => {
    const s = String(raw ?? "");
    if (/^\d*$/.test(s)) {
        if (s.length === 0) return "";
        if (s.length === 1) return s;
        if (s.length === 2) return `${s[0]}.${s[1]}`;
        let num = parseFloat(`${s[0]}.${s.slice(1, 3)}`);
        if (Number.isNaN(num)) return s.slice(0, 3);
        num = Math.min(MAX_PH, Math.max(MIN_PH, num));
        return num.toFixed(2);
    }

    let v = s.replace(",", ".");
    v = v.replace(/[^\d.]/g, "");
    const parts = v.split(".");
    if (parts.length === 1) return parts[0];
    const intPart = parts[0];
    const frac = parts.slice(1).join("").slice(0, 2);
    return frac.length > 0 ? `${intPart}.${frac}` : `${intPart}.`;
};

const BeginTestPage = () => {
    const navigate = useNavigate();
    const [phInput, setPhInput] = useState("");

    const handleGetResult = () => {
        const phValue = clampPh(phInput);
        if (phValue === null) {
            alert("Please enter a valid pH value between 4 and 7.");
            return;
        }
        navigate("/result-without-details", {
            state: {
                result: {
                    phValue,
                    date: formatDate(),
                },
            },
        });
    };

    const handlePhBlur = () => {
        const v = clampPh(phInput);
        if (v !== null) setPhInput(v.toFixed(2));
    };

    return (
        <>
            <div className={styles.content}>
                <Container>
                    <div className={styles.containerInner}>
                        <div className={styles.title}>Enter the pH value for the test</div>
                        <div className={styles.wrapInput}>
                            <input
                                id="begin-test-ph"
                                className={styles.phInput}
                                type="text"
                                inputMode="decimal"
                                min={MIN_PH}
                                max={MAX_PH}
                                step={STEP}
                                value={phInput}
                                onChange={(e) => setPhInput(sanitizePhInput(e.target.value))}
                                onBlur={handlePhBlur}
                                placeholder="pH value (4.00 – 7.00)"
                            />
                        </div>
                    </div>
                </Container>
                <BottomBlock>
                    <Button onClick={handleGetResult}>
                        Get the result
                    </Button>
                </BottomBlock>
            </div>
        </>
    )
};

export default BeginTestPage;