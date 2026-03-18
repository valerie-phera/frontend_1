import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import BottomBlock from "../../components/BottomBlock/BottomBlock";
import Button from "../../components/Button/Button";
import Container from "../../components/Container/Container";
import PhBadge from "../../components/PhBadge/PhBadge";
import DownloadIcon from "../../assets/icons/DownloadIcon";
import ShareIcon from "../../assets/icons/ShareIcon";
import ScaleMarker from "../../assets/icons/ScaleMarker";
import { getInterpretation } from "../../shared/utils/getInterpretation";
import useExportResults from "../../hooks/useExportResults";
import useImportJson from "../../hooks/useImportJson";

import styles from "./ResultWithoutDetailsPage.module.css";

const ResultWithoutDetailsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [resultData, setResultData] = useState(null);
    const { handleExport } = useExportResults();

    const handleImportedData = (data) => {
        console.log("📥 Импортировано:", data);
    };

    const { fileInputRef, handleImportClick, handleFileUpload } = useImportJson(handleImportedData);

    // Retrieve pH result passed from previous page.
    // If no result found (e.g. user reloaded page), redirect back to camera flow.
    useEffect(() => {
        const stateData = location.state?.result;

        if (stateData) {
            setResultData(stateData);
            console.log("📊 Данные результата:", stateData);
        } else {
            console.warn("⚠️ Нет данных результата, перенаправление...");
            navigate("/");
        }
    }, [location, navigate]);

    if (!resultData) {
        return <div>Loading...</div>;
    }

    const getPhLevel = (ph) => {
        if (ph < 4.5) return "Normal";
        if (ph >= 4.5 && ph <= 4.9) return "Slightly Elevated";
        return "Elevated";
    };

    // Extract pH, category and timestamp from backend response
    const phValue = Number((resultData.phValue || 0).toFixed(2));
    const phLevel = getPhLevel(phValue);
    const timestamp = resultData.date || new Date().toISOString();
    const interpretation = getInterpretation(phLevel, phValue.toFixed(2));

    const minPh = 4.0;
    const maxPh = 7.0;

    const markerPos = ((Number(phValue) - minPh) / (maxPh - minPh)) * 100;

    const onExportClick = () => {
        handleExport({
            phValue,
            phLevel,
            timestamp,
            interpretation,
            detailOptions: [],
            recommendations: []
        });
    };

    return (
        <>
            <div className={styles.content}>
                <Container>
                    <div className={styles.containerInner}>
                        <div className={styles.title}>Your pH result</div>
                        <div className={styles.visualBlock}>
                            <div className={styles.visualBlockTop}>
                                <PhBadge level={phLevel} />
                                <div className={styles.actions}>
                                    <div className={styles.actionsInner} onClick={handleImportClick}><DownloadIcon /></div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="application/json"
                                        style={{ display: "none" }}
                                        onChange={handleFileUpload}
                                    />
                                    <div className={styles.actionsInner} onClick={onExportClick}><ShareIcon /></div>
                                </div>
                            </div>
                            <div className={styles.num}>{phValue.toFixed(2)}</div>
                            <div className={styles.date}>{timestamp}</div>
                            <div className={styles.scale}>
                                <div className={styles.scalePart1}></div>
                                <div className={styles.scalePart2}></div>
                                <div className={styles.scalePart3}></div>
                                <div className={styles.scalePart4}></div>
                                <div className={styles.scalePart5}></div>
                                <ScaleMarker className={styles.scaleMarker} style={{ left: `${markerPos}%` }} />
                            </div>
                            <div className={styles.meaning}>
                                <p>Normal</p>
                                <p>Elevated</p>
                            </div>
                        </div>
                        <div className={styles.textBlock}>
                            <p className={styles.textResult}>{interpretation}</p>

                            <div className={styles.advice}>
                                <h3 className={styles.heading}>Personalize results</h3>
                                <p className={styles.text}>Want to understand why your pH looks like this? Add your age group, hormone status, background, and current symptoms to get more tailored insights.</p>
                                <div className={styles.btnTop}>
                                </div>
                                <p className={styles.info}>
                                    Your data stays private and is never shared without your consent
                                </p>
                            </div>
                        </div>
                    </div>
                </Container>
                <BottomBlock>
                    <Button
                        onClick={() =>
                            navigate("/add-details", {
                                state: {
                                    phValue,
                                    phLevel,
                                    timestamp,
                                    interpretation
                                },
                            })
                        }
                    >
                        Add my details
                    </Button>
                </BottomBlock>
            </div>
        </>
    )
};

export default ResultWithoutDetailsPage;