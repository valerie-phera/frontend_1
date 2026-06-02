import { memo } from "react";

import { FORM_DETAIL_OPTIONS } from "../../../shared/constants/formDetailOptions";
import SymptomsChipSection from "../SymptomsChipSection/SymptomsChipSection";

export const VAGINAL_PRODUCT_OPTIONS = [
    "Intimate wash",
    "Douche",
    "Boric acid",
    "Scented soap near the vulva",
    "Lubricant",
    "Vaginal deodorant",
    "Spermicide",
    "Vaginal probiotic",
    "Vaginal moisturizer",
    "Vaginal medication / suppository",
];

/** @deprecated Use FORM_DETAIL_OPTIONS from shared/constants instead */
export const VAGINAL_PRODUCT_DETAIL_OPTIONS = FORM_DETAIL_OPTIONS;

const VaginalProducts = ({
    selected = [],
    onChange,
    skipped = false,
    infoSlot = null,
}) => (
    <SymptomsChipSection
        options={VAGINAL_PRODUCT_OPTIONS}
        selected={selected}
        onChange={onChange}
        skipped={skipped}
        infoSlot={infoSlot}
    />
);

export default memo(VaginalProducts);
