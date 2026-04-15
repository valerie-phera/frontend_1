const KEY = "phera_active_result_v1";

export const writeActiveResultMeta = ({ phValue, timestamp }) => {
  if (phValue === undefined || phValue === null) return;
  try {
    sessionStorage.setItem(
      KEY,
      JSON.stringify({
        phValue,
        timestamp: timestamp ?? null,
        at: Date.now(),
      })
    );
  } catch {
    /* ignore quota / private mode */
  }
};

export const readActiveResultMeta = () => {
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

