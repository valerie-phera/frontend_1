// import { useState, useEffect, useRef } from "react";
// import { useNavigate, useLocation } from "react-router-dom";

// import BottomBlock from "../../components/BottomBlock/BottomBlock";
// import Button from "../../components/Button/Button";
// import Container from "../../components/Container/Container";

// import ArrowDownGrey from "../../assets/icons/ArrowDownGrey";
// import EditNotesGrey from "../../assets/icons/EditNotesGrey";
// import DownloadIcon from "../../assets/icons/DownloadIcon";
// import ShareIcon from "../../assets/icons/ShareIcon";
// import ScaleMarker from "../../assets/icons/ScaleMarker";
// import PhBadge from "../../components/PhBadge/PhBadge";

// import { getInterpretation } from "../../shared/utils/getInterpretation";
// import useDetailsFromState from "../../hooks/useDetailsFromState";
// import useExportResults from "../../hooks/useExportResults";
// import useImportJson from "../../hooks/useImportJson";

// import styles from "./ResultWithDetailsPage.module.css";

// const ResultWithDetailsPage = () => {
//     const navigate = useNavigate();
//     const [isOpen, setIsOpen] = useState(true);
//     const { state } = useLocation();
//     const phValue = state?.phValue;
//     const phLevel = state?.phLevel;
//     const timestamp = state?.timestamp;
//     const interpretation = getInterpretation(phLevel, Number(phValue).toFixed(2));
//     const currentRecommendations = state?.recommendations;
//     const { handleExport } = useExportResults();
//     const contentRef = useRef(null);

//     const handleImportedData = (data) => {
//         console.log("📥 Импортировано:", data);
//     };

//     const { fileInputRef, handleImportClick, handleFileUpload } = useImportJson(handleImportedData);

//     useEffect(() => {
//         if (phValue === undefined || phValue === null) {
//             navigate("/result-without-details");
//         }
//     }, [state, navigate]);

//     const detailOptions = useDetailsFromState(state);
//     const detailsList = detailOptions.map((item) => (
//         <div key={item} className={styles.item}>{item}</div>
//     ));

//     const minPh = 4.0;
//     const maxPh = 7.0;

//     const markerPos = Math.min(100, Math.max(0, ((Number(phValue) - minPh) / (maxPh - minPh)) * 100));

//     const cleaned = Array.isArray(currentRecommendations)
//         ? currentRecommendations.join("\n\n")
//         : (currentRecommendations || "")
//             .replace(/\[\d+(?:\s*,\s*\d+)*\]/g, "")
//             .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

//     const paragraphs = cleaned      //converts text with paragraphs into an array of individual paragraphs
//         .split(/\n\s*\n/)  // by double line break
//         .map(p => p.trim())
//         .filter(Boolean);

//     const onExportClick = () => {
//         handleExport({
//             phValue,
//             phLevel,
//             timestamp,
//             interpretation,
//             detailOptions,
//             recommendations: paragraphs
//         });
//     };

//     useEffect(() => {
//         if (contentRef.current) {
//             contentRef.current.style.maxHeight = `${contentRef.current.scrollHeight}px`;
//         }
//     }, []);

//     return (
//         <>
//             <div className={styles.content} data-scroll-container>
//                 <Container>
//                     <div className={styles.containerInner}>
//                         <h1 className={styles.title}>Your pH result</h1>
//                         <div className={styles.visualBlock}>
//                             <div className={styles.visualBlockTop}>
//                                 <PhBadge level={phLevel} />
//                                 <div className={styles.actions}>
//                                     <div className={styles.actionsInner} onClick={handleImportClick}><DownloadIcon /></div>
//                                     <div className={styles.actionsInner} onClick={onExportClick}><ShareIcon /></div>
//                                 </div>
//                             </div>
//                             <div className={styles.num}>{Number(phValue).toFixed(2)}</div>
//                             <div className={styles.date}>{timestamp}</div>
//                             <div className={styles.scale}>
//                                 <div className={styles.scalePart1}></div>
//                                 <div className={styles.scalePart2}></div>
//                                 <div className={styles.scalePart3}></div>
//                                 <div className={styles.scalePart4}></div>
//                                 <div className={styles.scalePart5}></div>
//                                 <ScaleMarker className={styles.scaleMarker} style={{ left: `${markerPos}%` }} />
//                             </div>
//                             <div className={styles.meaning}>
//                                 <p>Normal</p>
//                                 <p>Elevated</p>
//                             </div>
//                         </div>
//                         <div className={styles.infoBlock}>
//                             <p className={styles.textResult}>{interpretation}</p>
//                             <div className={styles.details}>
//                                 <div className={styles.wrapHeading}>
//                                     <h4 className={styles.heading}>Details for this result</h4>
//                                     <button
//                                         className={styles.editBtn}
//                                         onClick={() => navigate("/add-details", { state })}
//                                         aria-label="Edit details"
//                                     >
//                                         <EditNotesGrey />
//                                     </button>
//                                 </div>
//                                 <div className={styles.wrapDetailslList}>
//                                     {detailsList}
//                                 </div>
//                             </div>
//                             <div className={styles.recommendations}>
//                                 <div className={styles.wrapHeading} onClick={() => setIsOpen(!isOpen)}>
//                                     <h3 className={styles.heading}>Recommendations</h3>
//                                     <span className={`${styles.arrow} ${!isOpen ? styles.arrowOpen : ""}`}>
//                                         <ArrowDownGrey />
//                                     </span>
//                                 </div>
//                                 <div
//                                     ref={contentRef}
//                                     className={styles.wrapText}
//                                     style={{
//                                         maxHeight: isOpen ? contentRef.current?.scrollHeight : 0,
//                                         opacity: isOpen ? 1 : 0,
//                                         overflow: "hidden",
//                                         transition: "max-height 0.35s ease, opacity 0.35s ease"
//                                     }}
//                                 >
//                                     {paragraphs.map((rec, index) => (
//                                         <div key={index} className={styles.text}>
//                                             <div className={styles.point}></div>
//                                             <p
//                                                 className={styles.innerText}
//                                                 dangerouslySetInnerHTML={{ __html: rec }}
//                                             />
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </Container>
//                 <BottomBlock>
//                     <Button onClick={onExportClick}>Export results</Button>
//                     <Button onClick={handleImportClick}>Import results</Button>
//                     <input
//                         type="file"
//                         accept="application/json"
//                         style={{ display: "none" }}
//                         ref={fileInputRef}
//                         onChange={handleFileUpload}
//                     />
//                 </BottomBlock>
//             </div>
//         </>
//     )
// };

// export default ResultWithDetailsPage;


import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import BottomBlock from "../../components/BottomBlock/BottomBlock";
import Button from "../../components/Button/Button";
import Container from "../../components/Container/Container";

import ArrowDownGrey from "../../assets/icons/ArrowDownGrey";
import EditNotesGrey from "../../assets/icons/EditNotesGrey";
import DownloadIcon from "../../assets/icons/DownloadIcon";
import ShareIcon from "../../assets/icons/ShareIcon";
import ScaleMarker from "../../assets/icons/ScaleMarker";
import PhBadge from "../../components/PhBadge/PhBadge";

import { getInterpretationParts } from "../../shared/utils/getInterpretation";
import useDetailsFromState from "../../hooks/useDetailsFromState";
import useExportResults from "../../hooks/useExportResults";
import useImportJson from "../../hooks/useImportJson";

import styles from "./ResultWithDetailsPage.module.css";

const ResultWithDetailsPage = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(true);
    const { state } = useLocation();
    const phValue = state?.phValue;
    const phLevel = state?.phLevel;
    const timestamp = state?.timestamp;
    const { lead: interpretationLead, suffix: interpretationSuffix } = getInterpretationParts(
        phLevel,
        Number(phValue).toFixed(2)
    );
    const interpretation = `${interpretationLead}${interpretationSuffix}`;
    const currentRecommendations = state?.recommendations;
    const rawCitations = state?.citations ?? [];
    const { handleExport } = useExportResults();
    const contentRef = useRef(null);

    const handleImportedData = (data) => {
        console.log("📥 Импортировано:", data);
    };

    const { fileInputRef, handleImportClick, handleFileUpload } = useImportJson(handleImportedData);

    useEffect(() => {
        if (phValue === undefined || phValue === null) {
            navigate("/result-without-details");
        }
    }, [state, navigate]);

    const detailOptions = useDetailsFromState(state);
    const detailsList = detailOptions.map((item) => (
        <div key={item} className={styles.item}>{item}</div>
    ));

    const minPh = 4.0;
    const maxPh = 7.0;

    const markerPos = Math.min(100, Math.max(0, ((Number(phValue) - minPh) / (maxPh - minPh)) * 100));

    const cleaned = Array.isArray(currentRecommendations)
        ? currentRecommendations.join("\n\n")
        : (currentRecommendations || "")
            .replace(/\[\d+(?:\s*,\s*\d+)*\]/g, "")
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    const paragraphs = cleaned      //converts text with paragraphs into an array of individual paragraphs
        .split(/\n\s*\n/)  // by double line break
        .map(p => p.trim())
        .filter(Boolean);

    const citations = Array.isArray(rawCitations)
        ? rawCitations
            .map((c) => {
                if (!c || typeof c !== "object") return null;
                const title = c.title;
                const text = c.relevant_section;
                if (!title && !text) return null;
                return {
                    title: title == null ? "" : String(title),
                    text: text == null ? "" : String(text),
                };
            })
            .filter(Boolean)
        : [];

    const onExportClick = () => {
        handleExport({
            phValue,
            phLevel,
            timestamp,
            interpretation,
            detailOptions,
            recommendations: paragraphs
        });
    };

    return (
        <>
            <div className={styles.content} data-scroll-container>
                <Container>
                    <div className={styles.containerInner}>
                        <h1 className={styles.title}>Your pH result</h1>
                        <div className={styles.visualBlock}>
                            <div className={styles.visualBlockTop}>
                                <PhBadge level={phLevel} />
                                <div className={styles.actions}>
                                    <div className={styles.actionsInner} onClick={handleImportClick}><DownloadIcon /></div>
                                    <div className={styles.actionsInner} onClick={onExportClick}><ShareIcon /></div>
                                </div>
                            </div>
                            <div className={styles.num}>{Number(phValue).toFixed(2)}</div>
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
                        <div className={styles.infoBlock}>
                            <p className={styles.textResult}>
                                <strong>{interpretationLead}</strong>
                                {interpretationSuffix}
                            </p>
                            <div className={styles.details}>
                                <div className={styles.wrapHeading}>
                                    <h4 className={styles.heading}>Details for this result</h4>
                                    <button
                                        className={styles.editBtn}
                                        onClick={() => navigate("/add-details", { state })}
                                        aria-label="Edit details"
                                    >
                                        <EditNotesGrey />
                                    </button>
                                </div>
                                <div className={styles.wrapDetailslList}>
                                    {detailsList}
                                </div>
                            </div>
                            <div className={styles.recommendations}>
                                <div className={styles.wrapHeading} onClick={() => setIsOpen(!isOpen)}>
                                    <h3 className={styles.heading}>Recommendations</h3>
                                    <span className={`${styles.arrow} ${!isOpen ? styles.arrowOpen : ""}`}>
                                        <ArrowDownGrey />
                                    </span>
                                </div>
                                <div
                                    ref={contentRef}
                                    className={styles.wrapText}
                                    style={{
                                        maxHeight: isOpen ? 5000 : 0,
                                        opacity: isOpen ? 1 : 0,
                                        overflow: "hidden",
                                        transition: "max-height 0.35s ease, opacity 0.35s ease"
                                    }}
                                >
                                    {paragraphs.map((rec, index) => (
                                        <div key={index} className={styles.text}>
                                            <div className={styles.point}></div>
                                            <p
                                                className={styles.innerText}
                                                dangerouslySetInnerHTML={{ __html: rec }}
                                            />
                                        </div>
                                    ))}

                                    {citations.length > 0 && (
                                        <div className={styles.quotesBlock}>
                                            {citations.map((q, index) => (
                                                <div key={index} className={styles.quoteItem}>
                                                    <p className={styles.quoteText}>
                                                        {q.title ? (
                                                            <>
                                                                <span className={styles.quoteTitle}>{q.title}</span>
                                                                <span className={styles.quoteDash}> — </span>
                                                            </>
                                                        ) : null}
                                                        <span>{q.text}</span>
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
                <BottomBlock>
                    <Button onClick={onExportClick}>Export results</Button>
                    <Button onClick={handleImportClick}>Import results</Button>
                    <input
                        type="file"
                        accept="application/json"
                        style={{ display: "none" }}
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                    />
                </BottomBlock>
            </div>
        </>
    )
};

export default ResultWithDetailsPage;