import { memo } from "react";
import Radio from "../../Radio/Radio";
import { toggleValue } from "../../../shared/utils/toggleValue";
import InfoTooltip from "../../InfoTooltip/InfoTooltip";
import styles from "./BirthControl.module.css";

const options = {
    general: [
        "Stopped birth control in the last 3 months",
        "Morning after-pill / emergency contraception in the last 7 days",
        "Neither",
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

    return (
        <div className={styles.wrap}>
            <InfoTooltip title="Recent changes" showArrow={false} />
            <div className={styles.list}>{sections}</div>
        </div>
    );
};

export default memo(BirthControl);
