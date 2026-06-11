import { memo } from "react";

import SymptomsChipSection from "../SymptomsChipSection/SymptomsChipSection";

export const SPOTTING_OPTIONS = [
    "Period started",
    "Period just ended",
    "Spotting",
    "Blood may have been present",
];

export const SPOTTING_PERIOD_OPTIONS = [
    "Period started",
    "Period just ended",
];

const Spotting = ({
    selected = [],
    onChange,
    skipped = false,
    disabledItems = [],
    infoSlot = null,
}) => (
    <SymptomsChipSection
        options={SPOTTING_OPTIONS}
        selected={selected}
        onChange={onChange}
        skipped={skipped}
        disabledItems={disabledItems}
        infoSlot={infoSlot}
    />
);

export default memo(Spotting);
