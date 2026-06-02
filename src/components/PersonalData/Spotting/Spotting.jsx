import { memo } from "react";

import SymptomsChipSection from "../SymptomsChipSection/SymptomsChipSection";

export const SPOTTING_OPTIONS = [
    "Period started",
    "Period just ended",
    "Spotting",
    "Blood may have been present",
];

const Spotting = ({ selected = [], onChange, skipped = false, infoSlot = null }) => (
    <SymptomsChipSection
        options={SPOTTING_OPTIONS}
        selected={selected}
        onChange={onChange}
        skipped={skipped}
        infoSlot={infoSlot}
    />
);

export default memo(Spotting);
