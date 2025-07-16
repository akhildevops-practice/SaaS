import { Navigate } from "react-router-dom";
import type { RouteObject } from "react-router";

import CustomInbox from "pages/CustomInbox";
import NotificationPage from "pages/Notification";
import FallBackPage from "pages/FallbackPage";
import GlobalSearch from "pages/GlobalSearch";
import ReferencesResultPage from "pages/ReferencesResultPage";
import TestPreviewFeature from "pages/TestPreviewFeature";
import Help from "pages/Help";
import UserStats from "../pages/UserStats";
import ReportIssue from "components/ReportIssue";
import CalendarRedirectPage from "pages/CalendarRedirectPage";
import SemanticSearch from "pages/SemanticSearch";
import NoAccessPage from "pages/NoAccessPage";
import CheckSheet from "components/CheckSheet";
import DesignTime from "components/CheckSheet/DesignTime";
import RunTime from "components/CheckSheet/Runtime";
import TestSelect from "pages/TestSelect";
// import Reference from "pages/DocumentControl/Reference";

export const otherRoutes: RouteObject[] = [
  {
    path: "/",
    element: <Navigate replace to="/processdocuments/processdocument" />,
  },
  {
    path: "/preview",
    element: <TestPreviewFeature />,
  },
  {
    path: "/unset",
    element: <FallBackPage />,
  },
  {
    path: "/logout",
    element: <Navigate replace to="/processdocuments/processdocument" />,
  },
  {
    path: "/Inbox",
    element: <CustomInbox />,
  },
  {
    path: "/notification",
    element: <NotificationPage />,
  },
  {
    path: "/globalsearch",
    element: <GlobalSearch />,
  },
  {
    path: "/searchreferences",
    element: <ReferencesResultPage />,
  },
  {
    path: "/Help",
    element: <Help />,
  },
  {
    path: "/stats",
    element: <UserStats />,
  },
  {
    path: "/ReportIssue",
    element: <ReportIssue />,
  },
  {
    path: "/calRedirect",
    element: <CalendarRedirectPage />,
  },

  {
    path: "/noaccess",
    element: <NoAccessPage />,
  },
  {
    path : "/semanticsearch",
    element : <SemanticSearch />,
  },
  {
    path: "/checksheets",
    element: <DesignTime />,
  },
  {
    path: "/checksheets/:urlId",
    element: <DesignTime />,
  },
  {
    path: "/runTimeChecksheets",
    element: <RunTime />,
  },
  {
    path: "/runTimeChecksheets/:urlId",
    element: <RunTime />,
  },
  {
    path: "/checksheet",
    element: <CheckSheet />,
  },
  {
    path: "/testselect",
    element: <TestSelect />,
  },
];

export default otherRoutes;
