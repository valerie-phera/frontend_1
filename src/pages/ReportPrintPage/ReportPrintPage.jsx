import { Link, useLocation } from "react-router-dom";
import { REPORT_PRINT_MOCK_STATE } from "./reportPrintMockState";
import ReportPrintDocument from "./ReportPrintDocument";
import styles from "./ReportPrintPage.module.css";

const ReportPrintPage = () => {
  const { state } = useLocation();
  const data = state?.phValue != null ? state : REPORT_PRINT_MOCK_STATE;

  const handlePrint = () => window.print();

  return (
    <div className={styles.screenWrap}>
      <div className={styles.toolbar}>
        <span>Print layout — Figma Result_pdf_A4 (pages 1–3)</span>
        <button type="button" onClick={handlePrint}>
          Print / Save as PDF
        </button>
        <Link to="/result-with-details">App</Link>
      </div>

      <ReportPrintDocument data={data} />
    </div>
  );
};

export default ReportPrintPage;
