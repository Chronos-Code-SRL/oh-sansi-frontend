import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import PublicLayout from "./layout/PublicLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import AdRegistration from "./pages/UploadContestant/UploadContestant";
import FormOlympiad from "./pages/Olympiad/FormOlympiad";
import { ViewOlympiad } from "./pages/Olympiad/ViewOlympiad";
import ViewAreas from "./pages/Olympiad/ViewAreas";
import EditScoreCuts from "./pages/ScoreCuts/EditScoreCuts";

import GradingContestant from "./pages/Grade/GradingContestant";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import RegisterAcademicManager from "./pages/Users/RegisterAcademicManager";
import RegisterEvaluator from "./pages/Users/RegisterEvaluator";
import MarksStudents from "./pages/Grade/GradingContestant";
import FilterElements from "./pages/Filters/FilterElements";
import { SelectOlympiad } from "./pages/Home/SelectOlympiad";
import ApprovePhase from "./pages/ApprovePhase/ApprovePhase";
import MedalsPage from "./pages/Medals/MedalsPage";
import RankedContestantsList from "./pages/Lists/RankedContestatsList";
import AwardedList from "./pages/Lists/AwardedList";
import DisqualifyContestant from "./pages/DisqualifyContestant/DisqualifyContestant";
import AuditPage from "./pages/Lists/AuditPage";

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

            {/*Editar Umbral*/}
            <Route path="/editar-umbral/:idOlympiad/:areaName/:areaId/:phaseName/:phaseId" element={<EditScoreCuts />} />

            {/* SI NADIE RESPONDE POR LA SIGUIENTE LINEA SE ELIMINA */}
            <Route path="/calificaciones" element={<GradingContestant />} />

            {/* Calificaciones por área y fase */}
            <Route
              path="/calificaciones/:idOlympiad/:areaName/:areaId/:phaseName/:phaseId"
              element={<MarksStudents />}
            />
            {/* Medallas */}
            <Route path="/medallero" element={<MedalsPage />} />

            {/* Historial de cambios */}
            <Route path="/historial-cambios" element={<AuditPage />} />

            {/*Filters on list */}
            <Route path="/filtros-de-lista/:olympiadId" element={<FilterElements />} />

            {/*Disqualify Contestant */}
            <Route path="/descalificar-competidor/:idOlympiad/:areaName/:areaId/:phaseName/:phaseId" element={<DisqualifyContestant />} />

            {/*Approve Phase */}
            <Route path="/aprobar-fase/:idOlympiad/:areaName/:areaId/:phaseName/:phaseId" element={<ApprovePhase />} />

            {/*List ranked contestants */}
            <Route path="/lista-competidores-clasificados/:idOlympiad/:areaName/:areaId/:phaseName/:phaseId" element={<RankedContestantsList />} />

            {/*Awarded List contestants */}
            <Route path="/lista-competidores-premiados/:idOlympiad/:areaName/:areaId" element={<AwardedList />} />



          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Public layout with header only (no sidebar) */}
          <Route element={<PublicLayout />}>
            <Route path="/seleccionar-olimpiada" element={<SelectOlympiad />} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </Router>
    </>
  );
}
