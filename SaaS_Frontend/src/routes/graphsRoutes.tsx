import type { RouteObject } from "react-router";
import KpiGraphs from "../components/KpiGraphs";
import KraGraph from "../components/KraGraph";
import GraphsHomePage from "components/GraphsHomePage";

export const reportRoutes: RouteObject[] = [
  {
    path: "/dashboard",
    element: <GraphsHomePage />,
  },
  {
    path: "/dashboard/kpi",
    element: <KpiGraphs />,
  },
  {
    path: "/dashboard/kra",
    element: <KraGraph />,
  },
];

export default reportRoutes;
