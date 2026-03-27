// import { useRef, useState, useEffect, useMemo } from "react";
// import { useNavigate } from "react-router-dom";
// import Webcam from "react-webcam";
// import styles from "./CameraViewPage.module.css";

// import { useCameraReady } from "../../hooks/useCameraReady";

// const CameraViewPage = () => {
//     const webcamRef = useRef(null);
//     const navigate = useNavigate();

//     const [isProcessing, setIsProcessing] = useState(false);
//     const isReady = useCameraReady(webcamRef);

//     const videoConstraints = useMemo(() => ({
//         facingMode: "environment",
//         width: { ideal: 1920 },
//         height: { ideal: 1080 },
//     }), []);

//     // Stop the camera when exiting
//     useEffect(() => {
//         return () => {
//             const video = webcamRef.current?.video;
//             video?.srcObject?.getTracks().forEach(track => track.stop());
//         };
//     }, []);    

//     const simulatePhAnalysis = () => {
//         const randomStep = (min, max, step) => {
//             const range = max - min;
//             const steps = Math.round(range / step);
//             const randomSteps = Math.floor(Math.random() * (steps + 1));
//             return +(min + randomSteps * step).toFixed(2);
//         };

//         const phValue = randomStep(4.0, 7.0, 0.05);
//         const confidence = randomStep(92, 99, 1);

//         const now = new Date();

//         const day = String(now.getDate()).padStart(2, "0");
//         const month = String(now.getMonth() + 1).padStart(2, "0");
//         const year = String(now.getFullYear()).slice(-2);

//         let hours = now.getHours();
//         const minutes = String(now.getMinutes()).padStart(2, "0");
//         const ampm = hours >= 12 ? "PM" : "AM";
//         hours = hours % 12 || 12;

//         const date = `${day}.${month}.${year} | ${hours}:${minutes} ${ampm}`;

//         return {
//             phValue,
//             confidence,
//             date
//         };
//     };

//     const handleCapture = async () => {
//         if (!webcamRef.current || isProcessing) return;

//         setIsProcessing(true);

//         try {
//             const screenshot = webcamRef.current.getScreenshot({
//                 width: 1920,
//                 height: 1080
//             });

//             if (!screenshot) throw new Error("Screenshot failed");

//             const res = simulatePhAnalysis();

//             setTimeout(() => {
//                 navigate("/result-without-details", { state: { result: res } });
//                 setIsProcessing(false);
//             }, 1000);


//         } catch (err) {
//             alert(`Failed: ${err.message}`);
//         }
//     };

//     const onExit = () => {
//         const video = webcamRef.current?.video;
//         video?.srcObject?.getTracks().forEach(track => track.stop());

//         navigate("/");
//     };

//     return (
//         <div className={styles.cameraContainer}>

//             <Webcam
//                 ref={webcamRef}
//                 audio={false}
//                 screenshotFormat="image/png"
//                 videoConstraints={videoConstraints}
//                 className={`${styles.webcamVideo} ${isReady ? styles.show : ""}`}
//                 onUserMediaError={() => {
//                     alert("Camera error");
//                     onExit();
//                 }}
//                 playsInline
//             />

//             <div className={styles.topControls}>
//                 <button className={styles.exitBtn} onClick={onExit}>X</button>
//             </div>

//             <div className={styles.viewfinder}>
//                 <div className={styles["bottom-left"]}></div>
//                 <div className={styles["bottom-right"]}></div>
//             </div>

//             <div className={styles.hintMessage}>
//                 <p className={styles.hintMessageTitle}>Align the test card in the frame</p>
//             </div>

//             <div className={styles.wrapBtn}>
//                 <button
//                     className={styles.scanBtn}
//                     onClick={handleCapture}
//                     disabled={isProcessing || !isReady}
//                 >
//                     {isProcessing ? "Capturing..." : "Simulate auto-capture"}
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default CameraViewPage;





// ------------------------------------------------------------------------------------


import { useRef, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import styles from "./CameraViewPage.module.css";

import { useCameraReady } from "../../hooks/useCameraReady";
import { analyzePh } from "../../shared/api/images-api";

const CameraViewPage = () => {
    const webcamRef = useRef(null);
    const navigate = useNavigate();

    const [isProcessing, setIsProcessing] = useState(false);
    const isReady = useCameraReady(webcamRef);

    const videoConstraints = useMemo(() => ({
        facingMode: "environment",
        width: { ideal: 1920 },
        height: { ideal: 1080 },
    }), []);

    // Stop the camera when exiting
    useEffect(() => {
        return () => {
            const video = webcamRef.current?.video;
            video?.srcObject?.getTracks().forEach(track => track.stop());
        };
    }, []);    

    const formatDate = () => {
        const now = new Date();

        const day = String(now.getDate()).padStart(2, "0");
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const year = String(now.getFullYear()).slice(-2);

        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;

        const date = `${day}.${month}.${year} | ${hours}:${minutes} ${ampm}`;
        return date;
    };

    const handleCapture = async () => {
        if (!webcamRef.current || isProcessing) return;

        setIsProcessing(true);

        try {
            const screenshot = webcamRef.current.getScreenshot({
                width: 1920,
                height: 1080
            });

            if (!screenshot) throw new Error("Screenshot failed");

            const payload = {
                ph_value: 4.5,
                user_message: "What does my pH mean?",
                age: 28,
                symptoms: {
                    vulva_vagina: ["Itchy"],
                },
            };

            const backendResponse = await analyzePh(payload);
            console.log("Analyze API raw response:", backendResponse);
            const res = {
                ...backendResponse,
                phValue: backendResponse?.phValue ?? backendResponse?.ph_value ?? 0,
                date: formatDate(),
            };
            navigate("/result-without-details", { state: { result: res } });

        } catch (err) {
            alert(`Failed: ${err.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const onExit = () => {
        const video = webcamRef.current?.video;
        video?.srcObject?.getTracks().forEach(track => track.stop());

        navigate("/");
    };

    return (
        <div className={styles.cameraContainer}>

            <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/png"
                videoConstraints={videoConstraints}
                className={`${styles.webcamVideo} ${isReady ? styles.show : ""}`}
                onUserMediaError={() => {
                    alert("Camera error");
                    onExit();
                }}
                playsInline
            />

            <div className={styles.topControls}>
                <button className={styles.exitBtn} onClick={onExit}>X</button>
            </div>

            <div className={styles.viewfinder}>
                <div className={styles["bottom-left"]}></div>
                <div className={styles["bottom-right"]}></div>
            </div>

            <div className={styles.hintMessage}>
                <p className={styles.hintMessageTitle}>Align the test card in the frame</p>
            </div>

            <div className={styles.wrapBtn}>
                <button
                    className={styles.scanBtn}
                    onClick={handleCapture}
                    disabled={isProcessing || !isReady}
                >
                    {isProcessing ? "Analyzing..." : "Capture and analyze"}
                </button>
            </div>
        </div>
    );
};

export default CameraViewPage;
