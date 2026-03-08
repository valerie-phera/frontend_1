import Main from "../../components/Main/Main";

import styles from "./HomePage.module.css";

const HomePage = () => {

  return (
    <>
      <div className={styles.wrapHomePage}>
        <Main />
        <footer className={styles.footer}>
          <p>pHera • Empowering vaginal health through accessible testing</p>
        </footer>
      </div>
    </>
  );
};

export default HomePage;