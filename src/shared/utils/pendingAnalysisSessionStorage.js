const KEY = "phera_pending_analysis_v1";

export const writePendingAnalysis = ({ phValue, timestamp, startedAt }) => {
  if (phValue === undefined || phValue === null) return;
  try {
    sessionStorage.setItem(
      KEY,
      JSON.stringify({
        phValue,
        timestamp: timestamp ?? null,
        startedAt: startedAt ?? Date.now(),
      })
    );
  } catch {
    /* ignore quota / private mode */
  }
};

export const readPendingAnalysis = () => {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object") return null;
    if (data.phValue === undefined || data.phValue === null) return null;
    return data;
  } catch {
    return null;
  }
};

export const clearPendingAnalysis = () => {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
};

