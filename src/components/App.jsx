import { Routes, Route, useNavigate } from "react-router-dom";
import AppLayout from "./Layout/AppLayout";

import ScrollToTop from "./ScrollToTop/ScrollToTop";
import HomePage from "../pages/HomePage/HomePage";
import HomePageTest from "../pages/HomePageTest/HomePageTest";
import ResultPageTest from "../pages/ResultPageTest/ResultPageTest";
import AddDetailsBasicPage from "../pages/AddDetailsBasicPage/AddDetailsBasicPage";
import HormonalHealthPage from "../pages/HormonalHealthPage/HormonalHealthPage";
import SymptomsPage from "../pages/SymptomsPage/SymptomsPage";
import HormoneTherapyPage from "../pages/HormoneTherapyPage/HormoneTherapyPage";
import FertilityJourneyPage from "../pages/FertilityJourneyPage/FertilityJourneyPage";
import BirthControlPage from "../pages/BirthControlPage/BirthControlPage";
import NextStepsPage from "../pages/NextStepsPage/NextStepsPage";

import BeginTestPage from "../pages/BeginTestPage/BeginTestPage";
import CameraViewPage from "../pages/CameraViewPage/CameraViewPage";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";
import ResultWithoutDetailsPage from "../pages/ResultWithoutDetailsPage/ResultWithoutDetailsPage";
import AddDetailsPage from "../pages/AddDetailsPage/AddDetailsPage";
import ResultWithDetailsPage from "../pages/ResultWithDetailsPage/ResultWithDetailsPage";
import SignUpPage from "../pages/SignUpPage/SignUpPage";
import StartPage from "../pages/StartPage/StartPage";
import RegistrationStepPassword from "../pages/RegistrationStepPassword/RegistrationStepPassword";
import RegistrationStepName from "../pages/RegistrationStepName/RegistrationStepName";
import RegistrationStepEmail from "../pages/RegistrationStepEmail/RegistrationStepEmail";
import EmailConfirmationPage from "../pages/EmailConfirmationPage/EmailConfirmationPage";
import LoginPage from "../pages/LoginPage/LoginPage";
import HomeCompletePage from "../pages/HomeCompletePage/HomeCompletePage";
import HomeTestedPage from "../pages/HomeTestedPage/HomeTestedPage";
import HomeStartPage from "../pages/HomeStartPage/HomeStartPage";
import TestsHistoryPage from "../pages/TestsHistoryPage/TestsHistoryPage";
import TestsHistoryEmptyPage from "../pages/TestsHistoryEmptyPage/TestsHistoryEmptyPage";
import HealthLibrary from "../pages/HealthLibrary/HealthLibrary";
import ArticlesPage from "../pages/ArticlesPage/ArticlesPage";
import SubscriptionPage from "../pages/SubscriptionPage/SubscriptionPage";
import PaymentPage from "../pages/PaymentPage/PaymentPage";
import ProfilePage from "../pages/ProfilePage/ProfilePage";
import TrendPreviewPage from "../pages/TrendPreviewPage/TrendPreviewPage";
import TrendPreviewNoResultsPage from "../pages/TrendPreviewNoResultsPage/TrendPreviewNoResultsPage";

import "../shared/styles/style.css";

function App() {
  const navigate = useNavigate();

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* <Route path="/" element={<HomePage />} /> */}
        <Route path="/" element={<AppLayout><HomePageTest /></AppLayout>} />
        <Route path="/result" element={<AppLayout><ResultPageTest /></AppLayout>} />
        <Route path="/add-details/basic" element={<AppLayout><AddDetailsBasicPage /></AppLayout>} />
        <Route path="/add-details/hormonal-health" element={<AppLayout><HormonalHealthPage /></AppLayout>} />
        {/* <Route path="/hormonal-health" element={<AppLayout><HormonalHealthPage /></AppLayout>} /> */}
        <Route path="/add-details/symptoms" element={<AppLayout><SymptomsPage /></AppLayout>} />
        <Route path="/add-details/paths/hormone-therapy" element={<AppLayout><HormoneTherapyPage /></AppLayout>} />
        <Route path="/add-details/paths/fertility-journey" element={<AppLayout><FertilityJourneyPage /></AppLayout>} />
        <Route path="/add-details/paths/birth-control" element={<AppLayout><BirthControlPage /></AppLayout>} />
        <Route path="/add-details/next-steps" element={<AppLayout><NextStepsPage /></AppLayout>} />

        <Route path="/begin-test" element={<AppLayout><BeginTestPage /></AppLayout>} />
        <Route path="/camera-view" element={<CameraViewPage />} />
        <Route path="/result-without-details" element={<AppLayout><ResultWithoutDetailsPage /></AppLayout>} />
        <Route path="/add-details" element={<AppLayout><AddDetailsPage /></AppLayout>} />
        <Route path="/result-with-details" element={<AppLayout><ResultWithDetailsPage /></AppLayout>} />
        <Route path="/signup" element={<AppLayout showBack onBack={() => navigate("/result-with-details")}><SignUpPage /></AppLayout>} />
        <Route path="/start" element={<AppLayout showBack onBack={() => navigate("https://phera.digital/")}><StartPage /></AppLayout>} />
        <Route path="/registration/username" element={<AppLayout><RegistrationStepName /></AppLayout>} />
        <Route path="/registration/email" element={<AppLayout><RegistrationStepEmail /></AppLayout>} />
        <Route path="/registration/password" element={<AppLayout><RegistrationStepPassword /></AppLayout>} />
        <Route path="/confirm-email" element={<AppLayout><EmailConfirmationPage /></AppLayout>} />
        <Route path="/login" element={<AppLayout><LoginPage /></AppLayout>} />
        <Route path="/home/complete" element={<AppLayout headerVariant="auth"><HomeCompletePage /></AppLayout>} />
        <Route path="/home/tested" element={<AppLayout headerVariant="auth"><HomeTestedPage /></AppLayout>} />
        <Route path="/home/start" element={<AppLayout headerVariant="auth"><HomeStartPage /></AppLayout>} />
        <Route path="/test-history" element={<AppLayout headerVariant="auth"><TestsHistoryPage /></AppLayout>} />
        <Route path="/test-history-empty" element={<AppLayout headerVariant="auth"><TestsHistoryEmptyPage /></AppLayout>} />
        <Route path="/health-library" element={<AppLayout headerVariant="auth"><HealthLibrary /></AppLayout>} />
        <Route path="/articles" element={<AppLayout headerVariant="auth"><ArticlesPage /></AppLayout>} />
        <Route path="/profile" element={<AppLayout headerVariant="auth"><ProfilePage /></AppLayout>} />
        <Route path="/trend-preview" element={<AppLayout headerVariant="auth"><TrendPreviewPage /></AppLayout>} />
        <Route path="/trend-preview/no-tests" element={<AppLayout headerVariant="auth"><TrendPreviewNoResultsPage /></AppLayout>} />
        <Route path="/subscription" element={<AppLayout showBack onBack={() => navigate("/health-library")}><SubscriptionPage /></AppLayout>} />
        <Route path="/payment" element={<AppLayout headerVariant="auth"><PaymentPage /></AppLayout>} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}

export default App






