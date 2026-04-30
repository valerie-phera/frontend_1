import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Frame from "../../../assets/images/Frame.jsx";
import logo from "../../../assets/logo.svg";
import TryAgainIcon from "../../../assets/icons/TryAgainIcon";
import styles from "./DeviceFrame.module.css";
import StatusBar from "./StatusBar.jsx";

const DeviceFrameContext = createContext({
  isDesktop: false,
  isDesktopCompletionLayout: false,
  triggerDesktopCompletion: () => {},
});

export const useDeviceFrame = () => useContext(DeviceFrameContext);

const RESULT_STATE_KEY = "phera_result_state";

const DeviceFrame = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia?.("(min-width: 768px)")?.matches ?? false
  );

  // Completion state lives in history (location.state._desktopCompletion).
  // This way the browser back button automatically deactivates it:
  //   history: [..., /result-with-details, /result-with-details(_completion)]
  //   Back → pops to /result-with-details without _completion → animation reverses.
  // New: completion is a real route on both mobile + desktop: `/test-complete`.
  // Keep legacy `_desktopCompletion` support so older navigation paths still work.
  const isDesktopCompletionLayout =
    isDesktop && (location.pathname === "/test-complete" || location?.state?._desktopCompletion === true);

  // Push a new history entry with the completion flag so Back works.
  const triggerDesktopCompletion = useCallback(() => {
    const { _desktopCompletion: _removed, ...rest } = location.state ?? {};
    // Persist latest results so `/test-complete` can be refreshed / resized safely.
    try { sessionStorage.setItem(RESULT_STATE_KEY, JSON.stringify(rest ?? null)); } catch { /* ignore */ }
    navigate("/test-complete", { state: rest });
  }, [navigate, location.state]);

  // Keep refs for fresh values inside resize effects (avoid stale closures).
  const prevIsDesktopRef = useRef(isDesktop);
  const locationRef = useRef(location);
  useEffect(() => { locationRef.current = location; }, [location]);

  useEffect(() => {
    const mql = window.matchMedia?.("(min-width: 768px)");
    if (!mql) return;

    const onChange = (e) => setIsDesktop(e.matches);
    setIsDesktop(mql.matches);

    mql.addEventListener?.("change", onChange);
    mql.addListener?.(onChange);
    return () => {
      mql.removeEventListener?.("change", onChange);
      mql.removeListener?.(onChange);
    };
  }, []);

  // Resize transition: desktop ↔ mobile
  useEffect(() => {
    const prev = prevIsDesktopRef.current;
    prevIsDesktopRef.current = isDesktop;

    if (prev === isDesktop) return; // no change (includes first-render call)

    if (!isDesktop) {
      // desktop → mobile: no special routing needed (both use `/test-complete` now)
      return;
    }

    // mobile → desktop: no special routing needed (desktop can stay on `/test-complete`)
  }, [isDesktop]);

  // No guard redirect anymore: `/test-complete` is valid on desktop too.

  const ctx = useMemo(
    () => ({ isDesktop, isDesktopCompletionLayout, triggerDesktopCompletion }),
    [isDesktop, isDesktopCompletionLayout, triggerDesktopCompletion]
  );

  return (
    <DeviceFrameContext.Provider value={ctx}>
      <div
        className={`${styles.viewport} ${isDesktopCompletionLayout ? styles.viewportCompletion : ""}`}
      >
        {/* <header className={styles.extensionHeader} aria-hidden={!isDesktop}>
          <div className={styles.extensionHeaderInner}>
            <Link to="/" className={styles.extensionHeaderLogoLink} aria-label="pHera Home">
              <img className={styles.extensionHeaderLogo} src={logo} alt="pHera" draggable={false} />
            </Link>

            <nav className={styles.extensionHeaderNav} aria-label="Primary">
              <a className={styles.extensionHeaderNavLink} href="#" onClick={(e) => e.preventDefault()}>
                Home
              </a>
              <a className={styles.extensionHeaderNavLink} href="#" onClick={(e) => e.preventDefault()}>
                About
              </a>
              <a className={styles.extensionHeaderNavLink} href="#" onClick={(e) => e.preventDefault()}>
                Contact
              </a>
            </nav>

            <a className={styles.extensionHeaderCta} href="#" onClick={(e) => e.preventDefault()}>
              Try Demo
            </a>
          </div>
        </header> */}

        <div className={styles.desktopStage}>
          <div className={styles.desktopStageFit}>
            <div className={styles.desktopStageSceneInner}>
              <div className={styles.bgCircleFill} aria-hidden="true" />
              <svg
                className={styles.bgCircleOutline}
                width="829"
                height="829"
                viewBox="0 0 829 829"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <circle
                  cx="414.5"
                  cy="414.5"
                  r="413"
                  stroke="rgba(96, 130, 95, 0.35)"
                  strokeWidth="1"
                  strokeDasharray="530 50"
                />
              </svg>

              <div className={styles.phoneWrap}>
                <div className={styles.shell} aria-hidden="true">
                  <Frame className={styles.frame} />
                </div>

                <div className={styles.screen}>
                  <StatusBar />
                  <div className={styles.screenContent}>{children}</div>
                </div>
              </div>

              <aside
                className={styles.rightPanel}
                aria-hidden={!isDesktopCompletionLayout}
              >
                <div className={styles.rightPanelInner}>
                  <div className={styles.rightTextBlock}>
                    <h2 className={styles.rightHeading}>
                      Thanks for trying{" "}
                      <span className={styles.rightHeadingP}>p</span>
                      <span className={styles.rightHeadingH}>H</span>
                      era demo!
                    </h2>
                    <p className={styles.rightText}>
                      We're building the full product - and your input helps us make it better for everyone.
                    </p>
                  </div>

                  <button
                    type="button"
                    className={styles.rightTryAgainBtn}
                    onClick={() => navigate("/result")}
                  >
                    <span>Try again</span>
                    <span className={styles.rightTryAgainIcon} aria-hidden="true">
                      <TryAgainIcon />
                    </span>
                  </button>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </DeviceFrameContext.Provider>
  );
};

export default DeviceFrame;
