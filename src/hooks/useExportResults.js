import { saveAs } from "file-saver";
import JSZip from "jszip";
import { exportReportPdf } from "./exportReportPdf";
import { buildReportPrintState } from "../pages/ReportPrintPage/reportPrintUtils";

const useExportResults = () => {
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

    const handleExport = async ({
        phValue,
        phLevel,
        timestamp,
        interpretation,
        detailOptions = [],
        recommendations = [],
        overviewInsights = null,
        state = null,
        reportId = null,
    }) => {
        const reportData = buildReportPrintState({
            phValue,
            phLevel,
            timestamp,
            interpretation,
            state,
            reportId,
            recommendations,
            overview: overviewInsights ?? state?.overview,
        });

        const pdfBytes = await exportReportPdf(reportData);

        const jsonText = exportJson(phValue, phLevel, timestamp, interpretation, detailOptions, recommendations);
        const csvText = exportCsv(phValue, phLevel, timestamp, interpretation, detailOptions, recommendations);

        const zip = new JSZip();
        zip.file("ph-report.pdf", pdfBytes);
        zip.file("ph-report.json", jsonText);
        zip.file("ph-report.csv", csvText);

        const zipBlob = await zip.generateAsync({ type: "blob" });
        saveAs(zipBlob, "phera-report.zip");
    };

    return { handleExport };
};

export default useExportResults;
