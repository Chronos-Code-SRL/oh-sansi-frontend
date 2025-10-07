import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import RegisterUser from "./pages/Users/RegisterUser";
import AdRegistration from "./pages/CompetitorRegistration/AdRegistration";
import FormOlympiad from "./pages/Olympiad/FormOlympiad";
import { ViewOlympiad } from "./pages/Olympiad/ViewOlympiad";
import ConfigurationArea from "./pages/Olympiad/ConfigurationArea";
import ViewAreas from "./pages/Olympiad/ViewAreas";


export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />

            {/* Aministration*/}
            <Route index path="/registration" element={<AdRegistration />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

            {/* Forms */}

            <Route path="/Olimpiada" element={<FormOlympiad />} />
            <Route path="/VerOlimpiadas" element={<ViewOlympiad />} />
            <Route path="/ConfiguracionArea/:id" element={<ConfigurationArea />} />
            
            {/* Prueba Modal */}
            <Route path="/OlimpiadaAreas/:id" element={<ViewAreas />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/*Register User*/}
            < Route path="/user-register" element={<RegisterUser />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
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
