import { memo } from "react";
import Radio from "../../Radio/Radio";
import InfoTooltip from "../../InfoTooltip/InfoTooltip";
import { toggleValue } from "../../../shared/utils/toggleValue";
import styles from "./HormoneTherapy.module.css";

const radioOptions = ["Estrogen only", "Estrogen + progestin"];
const listOptions = ["Testosterone", "Estrogen blocker", "Puberty blocker"];

const HormoneTherapy = ({ hormoneTherapy, setHormoneTherapy, variant = "full" }) => {
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

    const radioSection = (
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
    );

    if (variant === "radiosOnly") {
        return (
            <div className={styles.wrap}>
                <div className={styles.wrapList}>{radioSection}</div>
            </div>
        );
    }

    return (
        <div className={styles.wrap}>
            <InfoTooltip title="Hormone therapy" showArrow={false} />

            <div className={styles.wrapList}>
                {radioSection}

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
