import { memo } from "react";

import SymptomsChipSection from "../SymptomsChipSection/SymptomsChipSection";

export const SEX_FLUIDS_OPTIONS = [
    "Sex without a condom / barrier",
    "Sex with a condom / barrier",
    "Semen may have been present",
];

const SexFluids = ({ selected = [], onChange, skipped = false, infoSlot = null }) => (
    <SymptomsChipSection
        options={SEX_FLUIDS_OPTIONS}
        selected={selected}
        onChange={onChange}
        skipped={skipped}
        infoSlot={infoSlot}
    />
);

export default memo(SexFluids);
