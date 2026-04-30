import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header/Header";
import BurgerMenu from "./BurgerMenu/BurgerMenu";
import styles from "./AppLayout.module.css";

const AppLayout = ({
    headerVariant = "guest",
    children,
    showBack = false,
    onBack
}) => {
    const [isMenuOpen, setMenuOpen] = useState(false);
    const location = useLocation();

    // Avoid remount flicker when switching between result ↔ completion on desktop.
    // These routes render the same "phone" content (ResultWithDetailsPage) and only change layout chrome.
    const pageKey = useMemo(() => {
        const p = location.pathname;
        if (p === "/result-with-details" || p === "/test-complete") return "result-flow";
        return p;
    }, [location.pathname]);

    return (
        <>
            <Header
                variant={headerVariant}
                isMenuOpen={isMenuOpen}
                onBurgerClick={() => setMenuOpen(true)}
                showBack={showBack}
                onBack={onBack}
            />

            {headerVariant === "auth" && (
                <BurgerMenu
                    isMenuOpen={isMenuOpen}
                    onClose={() => setMenuOpen(false)}
                />
            )}

            {/* wrapper for animation */}
            <main key={pageKey} className={styles.page}>
                {children}
            </main>
        </>
    );
};

export default AppLayout;
