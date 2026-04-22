import { Routes, Route } from "react-router-dom";
import AppLayout from "./Layout/AppLayout";

import ScrollToTop from "./ScrollToTop/ScrollToTop";
import HomePageTest from "../pages/HomePageTest/HomePageTest";
import PrivacyAndConsentPage from "../pages/PrivacyAndConsentPage/PrivacyAndConsentPage";
import HowItWorksPage from "../pages/HowItWorksPage/HowItWorksPage";

import ResultPageTest from "../pages/ResultPageTest/ResultPageTest";
import AddDetailsBasicPage from "../pages/AddDetailsBasicPage/AddDetailsBasicPage";
import HormonalHealthPage from "../pages/HormonalHealthPage/HormonalHealthPage";
import SymptomsPage from "../pages/SymptomsPage/SymptomsPage";

import HormoneTherapyPage from "../pages/HormoneTherapyPage/HormoneTherapyPage";
import FertilityJourneyPage from "../pages/FertilityJourneyPage/FertilityJourneyPage";
import BirthControlPage from "../pages/BirthControlPage/BirthControlPage";

import NextStepsHormoneTherapyPage from "../pages/NextStepsPage/NextStepsHormoneTherapyPage/NextStepsHormoneTherapyPage";
import NextStepsFertilityTreatmentPage from "../pages/NextStepsPage/NextStepsFertilityTreatmentPage/NextStepsFertilityTreatmentPage";
import NextStepsBirthControlPage from "../pages/NextStepsPage/NextStepsBirthControlPage/NextStepsBirthControlPage";
import NextStepsBirthControlHormoneTherapyPage from "../pages/NextStepsPage/NextStepsBirthControlHormoneTherapyPage/NextStepsBirthControlHormoneTherapyPage";
import NextStepsFertilityTreatmentHormoneTherapyPage from "../pages/NextStepsPage/NextStepsFertilityTreatmentHormoneTherapyPage/NextStepsFertilityTreatmentHormoneTherapyPage";

import AnalyzingData from "../pages/AnalyzingData/AnalyzingData";
import TestCompletePage from "../pages/TestCompletePage/TestCompletePage";

import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";
import ResultWithDetailsPage from "../pages/ResultWithDetailsPage/ResultWithDetailsPage";

import "../shared/styles/style.css";

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<AppLayout><HomePageTest /></AppLayout>} />
        <Route path="/privacy-and-consent" element={<AppLayout><PrivacyAndConsentPage /></AppLayout>} />
        <Route path="/how-it-works" element={<AppLayout><HowItWorksPage /></AppLayout>} />

        <Route path="/result" element={<AppLayout><ResultPageTest /></AppLayout>} />

        <Route path="/add-details/basic" element={<AppLayout><AddDetailsBasicPage /></AppLayout>} />
        <Route path="/add-details/hormonal-health" element={<AppLayout><HormonalHealthPage /></AppLayout>} />
        <Route path="/add-details/symptoms" element={<AppLayout><SymptomsPage /></AppLayout>} />

        <Route path="/add-details/paths/hormone-therapy" element={<AppLayout><HormoneTherapyPage /></AppLayout>} />
        <Route path="/add-details/paths/fertility-journey" element={<AppLayout><FertilityJourneyPage /></AppLayout>} />
        <Route path="/add-details/paths/birth-control" element={<AppLayout><BirthControlPage /></AppLayout>} />

        <Route path="/add-details/next-steps/hormone-therapy" element={<AppLayout><NextStepsHormoneTherapyPage /></AppLayout>} />
        <Route path="/add-details/next-steps/fertility-treatment" element={<AppLayout><NextStepsFertilityTreatmentPage /></AppLayout>} />
        <Route path="/add-details/next-steps/birth-control" element={<AppLayout><NextStepsBirthControlPage /></AppLayout>} />
        <Route path="/add-details/next-steps/birth-control-hormone-therapy" element={<AppLayout><NextStepsBirthControlHormoneTherapyPage /></AppLayout>} />
        <Route path="/add-details/next-steps/birth-control-fertility-treatment" element={<AppLayout><NextStepsFertilityTreatmentHormoneTherapyPage /></AppLayout>} />

        <Route path="/analyzing-data" element={<AppLayout><AnalyzingData /></AppLayout>} />
        <Route path="/test-complete" element={<AppLayout><TestCompletePage /></AppLayout>} />

        <Route path="/result-with-details" element={<AppLayout><ResultWithDetailsPage /></AppLayout>} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}

export default App






