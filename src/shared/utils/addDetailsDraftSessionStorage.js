const addDetailsDraftKey = (phValue, timestamp) =>
  `phera_add_details_draft_v1_${String(phValue)}_${encodeURIComponent(
    String(timestamp ?? "")
  )}`;

export const readAddDetailsDraft = (phValue, timestamp) => {
  if (phValue === undefined || phValue === null) return null;
  try {
    const raw = sessionStorage.getItem(addDetailsDraftKey(phValue, timestamp));
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data && typeof data === "object" ? data : null;
  } catch {
    return null;
  }
};

export const writeAddDetailsDraft = (phValue, timestamp, patch) => {
  if (phValue === undefined || phValue === null) return;
  try {
    const prev = readAddDetailsDraft(phValue, timestamp) ?? {};
    sessionStorage.setItem(
      addDetailsDraftKey(phValue, timestamp),
      JSON.stringify({ ...prev, ...(patch ?? {}) })
    );
  } catch {
    /* ignore quota / private mode */
  }
};

