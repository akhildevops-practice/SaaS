import type { RouteObject } from "react-router";
import KpiGraphs from "../components/KpiGraphs";
import Dashboard from "../pages/Dashboard";
import GraphsHomePage from "components/GraphsHomePage";

export const dashboardRoutes: RouteObject[] = [
  {
    path: "/dashboard",
    element: <GraphsHomePage />,
  },
  {
    path: "/dashboard/kpi",
    element: <KpiGraphs />,
  },
  {
    path: "/dashboard/objective",
    element: <KpiGraphs />,
  },
  {
    path: "/dashboard/documentdashboard",
    element: <Dashboard />,
  },
];

export default dashboardRoutes;
