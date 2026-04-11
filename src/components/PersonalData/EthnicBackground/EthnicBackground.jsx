import { memo } from "react";

import InfoTooltip from "../../InfoTooltip/InfoTooltip";
import styles from "./EthnicBackground.module.css";

const options = [
  "African / Black",
  "North African",
  "Arab",
  "Middle Eastern",
  "East Asian",
  "South Asian",
  "Southeast Asian",
  "Central Asian / Caucasus",
  "Latin American / Latina / Latinx / Hispanic",
  "Sinti / Roma",
  "White / Caucasian / European",
  "Mixed / Multiple ancestrie",
  "+ Other",
];

const EthnicBackground = ({ ethnicBackground, onChange }) => {
  const list = options.map((item) => {
    const isActive = ethnicBackground.includes(item);

    return (
      <div
        key={item}
        className={isActive ? styles.isemSelected : styles.item}
        onClick={() => onChange(item)}
      >
        {item}
      </div>
    );
  });

  return (
    <div className={styles.wrap}>
      <InfoTooltip title="Ethnic background(s)" showArrow={false}>
        Racial and ethnic backgrounds are linked to natural differences in genetics, immune responses, and care habits. This can shape vaginal flora and therefore its acidity, moisture, and scent. Knowing this helps pHera understand what is normal for your body.
      </InfoTooltip>

      <div className={styles.list}>{list}</div>
    </div>
  );
};

export default memo(EthnicBackground);
