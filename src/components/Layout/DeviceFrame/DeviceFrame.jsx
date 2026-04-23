import Frame from "../../../assets/images/Frame.jsx";
import styles from "./DeviceFrame.module.css";
import StatusBar from "./StatusBar.jsx";

const DeviceFrame = ({ children }) => {
  return (
    <div className={styles.viewport}>
      <div className={styles.shell} aria-hidden="true">
        <Frame className={styles.frame} />
      </div>

      <div className={styles.screen}>
        <StatusBar />
        <div className={styles.screenContent}>{children}</div>
      </div>
    </div>
  );
};

export default DeviceFrame;

