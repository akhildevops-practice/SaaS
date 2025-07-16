import type { RouteObject } from "react-router";
import { Navigate } from "react-router-dom";

import KeyAgenda from "../pages/KeyAgenda";

import CalendarView from "pages/MRM/CalendarView";
import MrmSettings from "pages/MRM/MrmSettings";
import MrmMeetingDetailsDoc from "pages/MRM/MrmMeetingDetailDoc";
import MrmMeetingDetailsEditDoc from "pages/MRM/MrmMeetingDetailEditDoc";
import MRM from "pages/MRM/indexNew";

export const mrmRoutes: RouteObject[] = [
  {
    path: "/mrm",
    element: <Navigate replace to="/mrm/mrm" />,
  },
  {
    path: "/mrm/keyagenda",
    element: <KeyAgenda />,
  },
  {
    path: "/mrm/mrm",
    element: <MRM />,
  },

  {
    path: "/mrm/calendar",
    element: <CalendarView />,
  },

  {
    path: "/mrm/MrmSettings",
    element: <MrmSettings />,
  },
  {
    path: "/mrm/mrmmeetingdetailsdoc",
    element: <MrmMeetingDetailsDoc />,
  },
  {
    path: "/mrm/mrmmeetingdetailseditdoc",
    element: <MrmMeetingDetailsEditDoc />,
  },
  {
    path: "/mrm/scheduleView",
    element: <MRM />,
  },
];

export default mrmRoutes;
