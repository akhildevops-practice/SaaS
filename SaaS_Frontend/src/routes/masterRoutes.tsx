import type { RouteObject } from "react-router";

import Location from "../pages/MasterHomePage/Location";
import NewLocation from "../pages/MasterFormWrappers/NewLocation";
import Departments from "../pages/MasterHomePage/Departments";
import NewDepartment from "../pages/MasterFormWrappers/NewDepartment";
import UserMaster from "../pages/MasterHomePage/UserMaster";
import NewUser from "../pages/MasterFormWrappers/NewUser";
import NewUnit from "../pages/MasterFormWrappers/NewUnit";
import SystemMaster from "../pages/MasterHomePage/SystemMaster";
import NewSystem from "../pages/MasterFormWrappers/NewSystem";
import UnitMaster from "../pages/MasterHomePage/UnitMaster";
import MasterRoles from "../pages/MasterHomePage/MasterRoles";
import MasterHomePage from "../pages/MasterHomePage";
import Model from "pages/MasterHomePage/Model";
import NewModel from "pages/NewModel";
import Parts from "pages/MasterHomePage/Parts";
import NewParts from "pages/MasterHomePage/NewParts";
import UserDelegation from "pages/MasterHomePage/UserDelegation";

type CustomeRouteObject = {
  protected? : boolean,
} & RouteObject
export const masterRoutes: CustomeRouteObject[] = [
  {
    path: "/master",
    protected : true,
    element: <MasterHomePage />,
  },
  {
    path: "/master/unit",
    protected : true,
    element: <Location />,
  },
  {
    path: "/master/roles",
    protected : true,
    element: <MasterRoles />,
  },
  {
    path: "/master/unit/newlocation",
    protected : true,
    element: <NewLocation />,
  },
  {
    path: "/master/unit/newlocation/:id",
    protected : true,
    element: <NewLocation />,
  },
  {
    path: "/master/department",
    protected : true,
    element: <Departments type={true} />,
  },
  {
    path: "/master/department/newdepartment",
    protected : true,
    element: <NewDepartment />,
  },
  {
    path: "/master/department/newdepartment/:id",
    protected : true,
    element: <NewDepartment />,
  },
  {
    path: "/master/user",
    protected : true,
    element: <UserMaster type={true}/>,
  },
  {
    path: "/master/user/newuser",
    protected : true,
    element: <NewUser />,
  },
  {
    path: "/master/user/newuser/:id",
    protected : true,
    element: <NewUser />,
  },
  {
    path: "/master/user/userDelegation",
    protected : true,
    element: <UserDelegation />,
  },
  {
    path: "/master/uom",
    protected : true,
    element: <UnitMaster />,
  },
  {
    path: "/master/uom/newunit",
    protected : true,
    element: <NewUnit />,
  },
  {
    path: "/master/uom/newunit/:id",
    protected : true,
    element: <NewUnit />,
  },
  {
    path: "/master/models",
    protected : true,
    element: <Model />,
  },
  {
    path: "/master/models/newmodel",
    protected : true,
    element: <NewModel />,
  },
  {
    path: "/master/models/newmodel/:id",
    protected : true,
    element: <NewModel />,
  },
  {
    path: "/master/parts",
    protected : true,
    element: <Parts />,
  },
  {
    path: "/master/parts/newpart",
    protected : true,
    element: <NewParts />,
  },
  {
    path: "/master/system",
    protected : true,
    element: <SystemMaster />,
  },
  {
    path: "/master/system/create",
    protected : true,
    element: <NewSystem />,
  },
];

export default masterRoutes;
