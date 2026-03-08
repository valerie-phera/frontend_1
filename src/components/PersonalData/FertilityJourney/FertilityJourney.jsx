import { memo, useState, useRef, useEffect } from "react";
import Radio from "../../Radio/Radio";
import InfoTooltip from "../../InfoTooltip/InfoTooltip";
import { toggleValue } from "../../../shared/utils/toggleValue";
import styles from "./FertilityJourney.module.css";

const radioOptions = ["I am pregnant", "I had a baby (last 12 months)", "I am not able to get pregnant", "I am trying to conceive"];
const listOptions = ["Ovulation induction", "Intrauterine insemination (IUI)", "In vitro fertilisation (IVF)", "Egg freezing stimulation", "Luteal progesterone"];

const FertilityJourney = ({ fertilityJourney, setFertilityJourney }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapRef = useRef(null);

    const handleRadioChange = (value) => {
        setFertilityJourney(prev => ({
            ...prev,
            currentStatus: toggleValue(prev.currentStatus, value)
        }));
    };

    const handleListChange = (value) => {
        setFertilityJourney(prev => ({
            ...prev,
            fertilityTreatments: prev.fertilityTreatments.includes(value)
                ? prev.fertilityTreatments.filter(v => v !== value)
                : [...prev.fertilityTreatments, value]
        }));
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        };

        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, []);


    return (
        <div ref={wrapRef} className={styles.wrap} onClick={() => setIsOpen(v => !v)}>
            <InfoTooltip
                title="Fertility journey"
                onToggle={(e) => {
                    e.stopPropagation();
                    setIsOpen(v => !v);
                }}
                onToggleArrow={isOpen}
            />

            <div className={`${styles.wrapList} ${!isOpen ? styles.collapsed : ""}`} onClick={(e) => e.stopPropagation()}>

                {/* RADIO */}
                <div className={styles.section}>
                    <h4 className={styles.heading}>Current status:</h4>
                    {radioOptions.map(item => (
                        <Radio
                            key={item}
                            name="fertility-journey-status"
                            value={item}
                            label={item}
                            checked={fertilityJourney.currentStatus === item}
                            onClick={() => handleRadioChange(item)}
                        />
                    ))}
                </div>

                {/* LIST */}
                <div className={styles.list}>
                    <h4 className={styles.heading}>Fertility treatments (last 3 months)</h4>
                    {listOptions.map(item => {
                        const isActive = fertilityJourney.fertilityTreatments.includes(item);

                        return (
                            <div
                                key={item}
                                className={isActive ? styles.itemSelected : styles.item}
                                onClick={() => handleListChange(item)}
                            >
                                {item}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default memo(FertilityJourney);



