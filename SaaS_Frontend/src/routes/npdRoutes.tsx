import ActionPlan from "components/NPD/ActionPlan/Index";
import NPDDashboardIndex from "components/NPD/Dashboard";
import GanttIndex from "components/NPD/GanttChart/Index";
import NPDMainIndex from "components/NPD/Index";
import MinutesOfMeeting from "components/NPD/MinitesOfMeeting";
import MeetingCreatingIndex from "components/NPD/MinitesOfMeeting/CreatingMeetingForm/Index";
import NPDAndContent from "components/NPD/NavAndContext";
import NavbarIndex from "components/NPD/NavbarHeader/Index";
import NPDdepartmentForm from "components/NPD/NPDSettings/NPDdeparmentForm";
import NPDSettingsHomePage from "components/NPD/NPDSettings/NPDSettingsHomePage";
import NPDSettingsTab2 from "components/NPD/NPDSettings/NPDSettingsTab2";
import NPDSteeperIndex from "components/NPD/NPDSteeper/Index";
import RiskIndex from "components/NPD/Risk/Index";
import SVARGantt from "components/NPD/SVARGantt";
import { RouteObject } from "react-router-dom";

type CustomeRouteObject = {
  protected?: boolean;
} & RouteObject;
export const npdRoutes: CustomeRouteObject[] = [
  {
    path: "NPD Home",
    element: <NPDMainIndex />,
  },
  {
   path :"NPDNavbar" ,
   element : <NavbarIndex />
  },
  {
    path: "NPDSteeper",
    element: <NPDSteeperIndex />,
  },
  {
    path: "NPDSteeper/:id",
    element: <NPDSteeperIndex />,
  },
  {
    path: "GanttIndex",
    element: <SVARGantt />,
  },
  {
    path: "NPDdepartmentForm",
    element: <NPDdepartmentForm />,
  },
  {
    path: "NPDdepartmentForm/:id",
    element: <NPDdepartmentForm />,
  },
  {
    path: "GanttIndex/:id",
    element: <SVARGantt />,
  },

  {
    path: "NPDSettingsHomePage",
    element: <NPDSettingsHomePage />,
  },
  {
    path: "NPDTab2",
    element: <NPDSettingsTab2 />,
  },
  {
    path: "MinutesOfMeeting",
    element: <MinutesOfMeeting />,
  },

  {
    path: "MeetingCreatingIndex",
    element: <MeetingCreatingIndex />,
  },
  {
    path: "MeetingCreatingIndex/:id",
    element: <MeetingCreatingIndex />,
  },
  {
    path: "NPDTab2",
    element: <NPDSettingsTab2 />,
  },
  {
    path: "NPDDashBoard",
    element: <NPDDashboardIndex />,
  },
  {
    path: "ActionPlan",
    element: <ActionPlan />,
  },

  {
    path: "Risk",
    element: <RiskIndex />,
  },
  {
    path :"NPD",
    element : <NPDAndContent />
  }
];
export default npdRoutes;
