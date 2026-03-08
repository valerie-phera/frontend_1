import { memo, useState, useRef, useEffect } from "react";
import Radio from "../../Radio/Radio";
import { toggleValue } from "../../../shared/utils/toggleValue";
import InfoTooltip from "../../InfoTooltip/InfoTooltip";
import styles from "./BirthControl.module.css";

const options = {
    general: [
        "No birth control or hormonal birth control",
        "Stopped birth control in the last 3 months",
        "Morning after-pill / emergency contraception in the last 7 days",
    ],
    pill: ["Combined pill", "Progestin-only pill"],
    iud: ["Hormonal IUD", "Copper IUD"],
    otherHormonalMethods: ["Contraceptive implant", "Contraceptive injection", "Vaginal ring", "Patch"],
    permanentMethods: ["Tubal ligation"],
};

const sectionTitles = {
    general: "",
    pill: "Pill",
    iud: "IUD",
    otherHormonalMethods: "Other hormonal methods",
    permanentMethods: "Permanent methods",
};

const BirthControl = ({ birthControl, setBirthControl }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapRef = useRef(null);

    const handleChange = (section, value) => {
        setBirthControl(prev => ({
            ...prev,
            [section]: toggleValue(prev[section], value)
        }));
    };

    const sections = Object.entries(options).map(([section, items]) => (
        <div key={section} className={styles.section}>
            {sectionTitles[section] && <h4 className={styles.heading}>{sectionTitles[section]}:</h4>}
            {items.map(item => (
                <Radio
                    key={item}
                    name={`birthControl-${section}`}
                    value={item}
                    label={item}
                    checked={birthControl[section] === item}
                    onClick={() => handleChange(section, item)}
                />
            ))}
        </div>
    ));

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
            <InfoTooltip title="Birth control" onToggle={(e) => {
                e.stopPropagation();
                setIsOpen(v => !v);
            }} onToggleArrow={isOpen}></InfoTooltip>
            <div className={`${styles.list} ${!isOpen ? styles.collapsed : ""}`} onClick={(e) => e.stopPropagation()}>
                {sections}
            </div>
        </div>
    );
};

export default memo(BirthControl);



