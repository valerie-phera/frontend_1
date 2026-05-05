import { saveAs } from "file-saver";
import JSZip from "jszip";
import useExportPdf from "./useExportPdf";
import logo_PDF from "../assets/logo_PDF.png";

const useExportResults = () => {
    const { exportPdf } = useExportPdf(logo_PDF);

    // ---- Built-in functions for JSON and CSV ----
    const exportJson = (phValue, phLevel, timestamp, interpretation, detailOptions = [], recommendations = []) => {
        return JSON.stringify(
            {
                phValue,
                phLevel,
                timestamp,
                interpretation,
                details: detailOptions,
                recommendations
            },
            null,
            2
        );
    };

    const exportCsv = (phValue, phLevel, timestamp, interpretation, detailOptions = [], recommendations = []) => {
        const rows = [
            ["Parameter", "Value"],
            ["PH Value", phValue],
            ["PH Level", phLevel],
            ["Timestamp", timestamp],
            ["Interpretation", interpretation],
            ["Details", detailOptions.join(" | ")],
            ["Recommendations", recommendations.join(" | ")]
        ];

        return rows.map(r => r.join(",")).join("\n");
    };
    // -------------------------------------------

    const handleExport = async ({
        phValue,
        phLevel,
        timestamp,
        interpretation,
        detailOptions = [],
        recommendations = [],
        citations = [],
        state = null,
        reportId = null,
    }) => {
        // PDF
        const pdfBytes = await exportPdf({
            phValue,
            phLevel,
            timestamp,
            interpretation,
            detailOptions,
            recommendations,
            citations,
            state,
            reportId,
        });

        // JSON
        const jsonText = exportJson(phValue, phLevel, timestamp, interpretation, detailOptions, recommendations);

        // CSV
        const csvText = exportCsv(phValue, phLevel, timestamp, interpretation, detailOptions, recommendations);

        // ZIP
        const zip = new JSZip();
        // zip.file("ph-report.pdf", pdfBytes);   //temporary !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        zip.file("ph-report.json", jsonText);
        zip.file("ph-report.csv", csvText);

        const zipBlob = await zip.generateAsync({ type: "blob" });
        saveAs(zipBlob, "phera-report.zip");
    };

    return { handleExport };
};

export default useExportResults;