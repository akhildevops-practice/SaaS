import type { RouteObject } from "react-router";

// import KpiDefinition from "../pages/KpiHomePage/KpiReport/KpiDefinition";
// import KpiReportTemplate from "../pages/KpiHomePage/KpiReport/KpiReportTemplate";
// import KpiReport from "../pages/KpiHomePage/KpiReport";
// import KpiReportTemplateStepper from "../pages/KpiHomePage/KpiReport/KpiReportTemplateStepper";
// import KpiReportStepper from "../pages/KpiHomePage/KpiReport/KpiReportStepper";
import KpiDefinition from "pages/KpiHomePage/KpiDefinition";
import KpiReportTemplate from "pages/KpiHomePage/KpiReportTemplate";
import KpiReport from "pages/KpiHomePage/KpiReport";
import KpiReportTemplateStepper from "pages/KpiHomePage/KpiReportTemplateStepper";
import KpiReportStepper from "pages/KpiHomePage/KpiReportStepper";
import KpiHomePage from "pages/KpiHomePage";
import KpiSettings from "pages/KpiHomePage/KpiSettings";
import AdhocReport from "components/KpiReport/AdhocReport";
export const kpiRoutes: RouteObject[] = [
  {
    path: "/kpi",
    element: <KpiHomePage />,
  },
  {
    path: "/kpi/Settings",
    element: <KpiSettings />,
  },
  {
    path: "/kpi/kpidefinitions",
    element: <KpiDefinition />,
  },
  {
    path: "/kpi/reporttemplates",
    element: <KpiReportTemplate />,
  },
  {
    path: "/kpi/reporttemplates/templateform",
    element: <KpiReportTemplateStepper />,
  },
  {
    path: "/kpi/reporttemplates/templateform/:id",
    element: <KpiReportTemplateStepper />,
  },
  {
    path: "/kpi/reports",
    element: <KpiReport />,
  },
  {
    path: "/kpi/reports/reportform",
    element: <KpiReportStepper />,
  },
  {
    path: "/kpi/reports/reportform/:id",
    element: <KpiReportStepper />,
  },
  {
    path: "/kpi/reports/generatereportfromtemplate/:id",
    element: <KpiReportStepper />,
  },
  {
    path: "/kpi/reports/adhocreport",
    element: <AdhocReport />,
  },
  {
    path: "/kpi/reports/adhocreport/:id",
    element: <AdhocReport />,
  },
];

export default kpiRoutes;
