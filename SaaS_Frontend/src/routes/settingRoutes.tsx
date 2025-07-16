import type { RouteObject } from "react-router";

import Settings from "../pages/Settings";
import NewOrganization from "../pages/MasterHomePage/NewOrganization";

type CustomeRouteObject = {
  protected? : boolean,
} & RouteObject

export const settingsRoutes: CustomeRouteObject[] = [
  {
    path: "/settings",
    protected : true,
    element: <Settings />,
  },
  {
    path: "/settings/neworganization",
    protected : true,
    element: <NewOrganization />,
  },
  {
    path: "/settings/neworganization/:name",
    protected : true,
    element: <NewOrganization />,
  },
];

export default settingsRoutes;
