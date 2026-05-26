import { saveAs } from "file-saver";
import JSZip from "jszip";
import { exportReportPdf } from "./exportReportPdf";
import {
    buildPheraReportBasename,
    buildReportPrintState,
} from "../pages/ReportPrintPage/reportPrintUtils";

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

        const baseName = buildPheraReportBasename(reportData.reportId);

        const zip = new JSZip();
        zip.file(`${baseName}.pdf`, pdfBytes);
        zip.file(`${baseName}.json`, jsonText);
        zip.file(`${baseName}.csv`, csvText);

        const zipBlob = await zip.generateAsync({ type: "blob" });
        saveAs(zipBlob, `${baseName}.zip`);
    };

    return { handleExport };
};

export default useExportResults;
