import type { RouteObject } from "react-router";
import AuditPlan from "../pages/AuditHomePage/AuditPlan";
import AuditPlanFormStepper from "../pages/AuditPlanFormStepper";
import AuditReport from "../pages/AuditHomePage/AuditReport";
import AuditSchedule from "../pages/AuditHomePage/AuditSchedule";
import AuditScheduleFormStepper from "../pages/AuditScheduleFormStepper";
import NewAuditTemplate from "../pages/NewAuditTemplate";
import NewAuditForm from "components/NewAuditForm/index ";
import NcSummary from "../pages/AuditHomePage/NCSummary";
import NcObservationForm from "../components/NcObservationForm";
import NcSummaryForm from "../components/NcSummaryForm";
import Template from "../pages/Template";
import AuditDashboard from "../pages/Dashboard/AuditDashboard/AuditDashboard";
import NCDashboard from "../pages/Dashboard/NCDashboard";
import AuditType from "../pages/AuditType";
import AuditSettings from "../pages/AuditSettings";
import FocusArea from "../pages/FocusArea";
import AuditorProfile from "../pages/AuditorProfile";
import AuditHomePage from "pages/AuditHomePage";
import AuditTypeFormStepper from "pages/AuditTypeFormStepper";
import AuditReportHomePage from "pages/AuditReportHomePage";

type CustomeRouteObject = {
  protected?: boolean;
} & RouteObject;

export const auditRoutes: CustomeRouteObject[] = [
  {
    path: "/audit",
    element: <AuditHomePage />,
  },
  {
    path: "/dashboard/audit",
    element: <AuditDashboard />,
  },
  {
    path: "/dashboard/nc",
    element: <NCDashboard />,
  },
  {
    path: "/auditTypeForm",
    element: <AuditTypeFormStepper />,
  },
  { path: "/auditHomePage", element: <AuditReportHomePage /> },
  {
    path: "/audit/auditsettings/auditTypeForm/:id",
    protected: true,
    element: <AuditTypeFormStepper />,
  },
  {
    path: "/audit/auditsettings/auditTypeForm/readMode/:id",
    protected: true,
    element: <AuditTypeFormStepper />,
  },
  {
    path: "/audit/auditplan",
    element: <AuditPlan />,
  },
  {
    path: "/audit/auditplan/auditplanform",
    element: <AuditPlanFormStepper />,
  },
  {
    path: "/audit/auditplan/auditplanform/readonly/:id",
    element: <AuditPlanFormStepper />,
  },
  {
    path: "/audit/auditplan/auditplanform/:id",
    element: <AuditPlanFormStepper />,
  },
  {
    path: "/audit/auditplan/auditplanform/:id/:view",
    element: <AuditPlanFormStepper />,
  },
  {
    path: "/audit/auditschedule",
    element: <AuditSchedule />,
  },
  {
    path: "/audit/auditschedule/auditscheduleform",
    element: <AuditScheduleFormStepper />,
  },
  {
    path: "/audit/auditschedule/auditscheduleform/:from/:id",
    element: <AuditScheduleFormStepper />,
  },
  {
    path: "/audit/auditchecklist/create",
    element: <NewAuditTemplate />,
  },
  {
    path: "/audit/auditreport",
    element: <AuditReport />,
  },
  {
    path: "/audit/auditreport/newaudit",
    element: <NewAuditForm />,
  },
  {
    path: "/audit/auditreport/newaudit/:id",
    element: <NewAuditForm />,
  },
  {
    path: "/audit/auditreport/newaudit/:id/:readonly",
    element: <NewAuditForm />,
  },

  {
    path: "/audit/ncsummary",
    element: <NcSummary />,
  },
  {
    path: "/audit/obs/:id",
    element: <NcObservationForm />,
  },
  {
    path: "/audit/nc/:id",
    element: <NcSummaryForm />,
  },
  {
    path: "/auditsettings",
    protected: true,
    element: <AuditSettings />,
  },
  {
    path: "/auditsettings/auditType",
    element: <AuditType />,
  },
  {
    path: "/auditsettings/auditchecklist",
    element: <Template />,
  },
  {
    path: "/auditsettings/focusarea",
    element: <FocusArea />,
  },
  {
    path: "/auditsettings/auditorprofile",
    element: <AuditorProfile />,
  },
];

export default auditRoutes;
