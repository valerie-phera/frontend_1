import { memo, useState, useRef, useEffect } from "react";
import Radio from "../../Radio/Radio";
import InfoTooltip from "../../InfoTooltip/InfoTooltip";
import { toggleValue } from "../../../shared/utils/toggleValue";
import styles from "./HormoneTherapy.module.css";

const radioOptions = ["Estrogen only", "Estrogen + progestin"];
const listOptions = ["Testosterone", "Estrogen blocker", "Puberty blocker"];

const HormoneTherapy = ({ hormoneTherapy, setHormoneTherapy }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapRef = useRef(null);

    const handleRadioChange = (value) => {
        setHormoneTherapy(prev => ({
            ...prev,
            general: toggleValue(prev.general, value)
        }));
    };

    const handleListChange = (value) => {
        setHormoneTherapy(prev => ({
            ...prev,
            hormoneReplacement: prev.hormoneReplacement.includes(value)
                ? prev.hormoneReplacement.filter(v => v !== value)
                : [...prev.hormoneReplacement, value]
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
                title="Hormone therapy"
                onToggle={(e) => {
                    e.stopPropagation();
                    setIsOpen(v => !v);
                }}
                onToggleArrow={isOpen}
            />

            <div className={`${styles.wrapList} ${!isOpen ? styles.collapsed : ""}`} onClick={(e) => e.stopPropagation()}>

                {/* RADIO */}
                <div className={styles.section}>
                    {radioOptions.map(item => (
                        <Radio
                            key={item}
                            name="hormone-therapy-general"
                            value={item}
                            label={item}
                            checked={hormoneTherapy.general === item}
                            onClick={() => handleRadioChange(item)}
                        />
                    ))}
                </div>

                {/* LIST */}
                <div className={styles.list}>
                    <h4 className={styles.heading}>
                        Hormone replacement therapy (HRT)
                    </h4>

                    {listOptions.map(item => {
                        const isActive = hormoneTherapy.hormoneReplacement.includes(item);

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

export default memo(HormoneTherapy);



