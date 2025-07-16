import type { RouteObject } from "react-router";
import CaraHomePage from "pages/CARA";
import CaraDetails from "pages/CARA/caraDetails";
// import DeviationSetting from "pages/CARA/Settings";
import KPIIntegration from "pages/CARA/KPIIntegration";
import CaraFormStepper from "components/CaraFormStepper";
import SettingsMainPage from "pages/CARA/SettingsMainPage";
import SettingsTab from "pages/CARA/SettingsTab";
import CapaReportModal from "components/CapaReportModal";

type CustomeRouteObject = {
  protected?: boolean;
} & RouteObject;

export const caraRoutes: CustomeRouteObject[] = [
  {
    path: "/cara",
    element: <CaraHomePage />,
  },
  {
    path: "/caraForm",
    element: <CaraFormStepper />,
  },
  {
    path: "/caraactionitemview",
    element: <CaraHomePage />,
  },
  {
    path: "/cara/fullformview",
    element: <CaraDetails />,
  },
  {
    path: "/cara/caraForm/:id",
    element: <CaraFormStepper />,
  },
  {
    path: "/cara/settings",

    element: <SettingsMainPage />,
  },
  {
    path: "/cara/settings/KPI",
    element: <KPIIntegration />,
  },
  {
    path: "/cara/caraReport",
    element: <CapaReportModal />,
  },
];

export default caraRoutes;
