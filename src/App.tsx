import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import AdRegistration from "./pages/UploadContestant/UploadContestant";
import FormOlympiad from "./pages/Olympiad/FormOlympiad";
import { ViewOlympiad } from "./pages/Olympiad/ViewOlympiad";
import ViewAreas from "./pages/Olympiad/ViewAreas";
import GradingContestant from "./pages/Grade/GradingContestant";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import RegisterAcademicManager from "./pages/Users/RegisterAcademicManager";
import RegisterEvaluator from "./pages/Users/RegisterEvaluator";
import MarksStudents from "./pages/Grade/GradingContestant";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route
            element={
              // <AppLayout />
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index path="/" element={<FormOlympiad />} />

            {/* Aministration*/}
            <Route index path="/registration" element={<AdRegistration />} />

            {/* Forms */}

            <Route path="/Olimpiada" element={<FormOlympiad />} />
            <Route path="/VerOlimpiadas" element={<ViewOlympiad />} />

            {/* Prueba Modal */}
            <Route path="/OlimpiadaAreas/:id" element={<ViewAreas />} />

            {/*Register User*/}
            < Route path="/Academic-Manager-register" element={<RegisterAcademicManager />} />
            < Route path="/Evaluator-register" element={<RegisterEvaluator />} />

            <Route path="/calificaciones" element={<GradingContestant />} />
            {/* Calificaciones por area (incluye id de olimpiada) */}
            <Route path="/calificaciones/:idOlympiad/:areaId/:areaName" element={<MarksStudents />} />

          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
