import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import BasicTables from "./pages/Tables/BasicTables";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import RegisterUser from "./pages/Users/RegisterUser";
import AdRegistration from "./pages/CompetitorRegistration/AdRegistration";
import FormOlympiad from "./pages/Olympiad/FormOlympiad";
import { ViewOlympiad } from "./pages/Olympiad/ViewOlympiad";
import ViewAreas from "./pages/Olympiad/ViewAreas";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";


export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route
            element={
              <AppLayout />
              // <ProtectedRoute>
              //   <AppLayout />
              // </ProtectedRoute>
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

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/*Register User*/}
            < Route path="/user-register" element={<RegisterUser />} />
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
