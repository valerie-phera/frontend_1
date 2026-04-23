import { useEffect, useMemo, useState } from "react";
import CameraIcon from "../../../assets/icons/CameraIcon.jsx";
import Indicators from "../../../assets/icons/Indicators.jsx";
import styles from "./DeviceFrame.module.css";

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const StatusBar = () => {
  const [now, setNow] = useState(() => new Date());
  const initial = useMemo(() => formatTime(new Date()), []);

  useEffect(() => {
    const tick = () => setNow(new Date());

    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  const time = formatTime(now) || initial;

  return (
    <div className={styles.statusBar} aria-hidden="true">
      <div className={styles.statusBarLeft}>{time}</div>
      <div className={styles.statusBarCenter}>
        <div className={styles.cameraEye}>
          <CameraIcon />
        </div>
      </div>
      <div className={styles.statusBarRight}>
        <Indicators />
      </div>
    </div>
  );
};

export default StatusBar;

