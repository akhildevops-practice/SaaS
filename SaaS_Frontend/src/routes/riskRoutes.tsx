import type { RouteObject } from "react-router";
import RiskConfiguration from "pages/RiskRegister/RiskConfiguration";
import RiskConfigurationFormStepper from "pages/RiskRegister/RiskConfiguration/RiskConfigurationFormStepper";
import HiraConfigurationTabWrapper from "pages/RiskRegister/RiskConfiguration/HiraConfigurationTabWrapper";
import HiraConfigurationPage from "pages/Risk/Hira/HiraConfigurationPage";
import HiraRegisterReviewPage from "pages/Risk/Hira/HiraRegisterReviewPage";
import HiraRegisterPagev2 from "pages/Risk/Hira/HiraRegisterPagev2";
import HiraRevisionHistoryPage from "pages/Risk/Hira/HiraRevisionHistoryPage";
import RiskConfigurationForm from "components/Risk/RiskConfiguration/RiskConfigurationForm";
import RiskRegisterForm from "pages/Risk/RiskRegister/RiskRegisterForm";


export const riskRoutes: RouteObject[] = [
  {
    path: "/risk/riskconfiguration/:riskcategory",
    element: <RiskConfiguration />,
  },
  {
    path: "/risk/riskconfiguration/stepper/:riskcategory",
    element: <RiskConfigurationFormStepper />,
  },
  {
    path: "/risk/riskconfiguration/stepper/HIRA",
    element: <HiraConfigurationTabWrapper />,
  },
  {
    path: "/risk/riskconfiguration/HIRA",
    element: <HiraConfigurationPage />,
  },
  {
    path: "/risk/riskconfiguration/stepper/:riskcategory/:id",
    element: <RiskConfigurationFormStepper />,
  },
  {
    path: "/risk/riskregister/HIRA",
    element: <HiraRegisterPagev2 />,
  },

  {
    path: "/risk/riskregister/HIRA/:hiraId",
    element: <HiraRegisterPagev2 />,
  },
  {
    path: "/risk/riskregister/HIRA/:categoryId/:riskId",
    element: <HiraRegisterPagev2 />,
  },
  {
    path: "/risk/riskregister/form",
    element: <RiskRegisterForm />,
  },
  {
    path: "/risk/riskregister/form/:categoryId/:riskId",
    element: <RiskRegisterForm />,
  },
  {
    path: "/risk/riskregister/HIRA/:jobTitle/:entityId",
    element: <HiraRegisterPagev2 />,
  },
  {
    path: "/risk/riskregister/HIRA/review/:categoryId/:hiraId",
    element: <HiraRegisterReviewPage />,
  },

  {
    path: "/risk/riskregister/HIRA/workflow/:hiraWorkflowId",
    element: <HiraRegisterReviewPage />,
  },

  {
    path: "/risk/riskregister/HIRA/revisionHistory/:categoryId/:hiraId/:cycleNumber",
    element: <HiraRevisionHistoryPage />,
  },

  {
    path: "risk/riskconfiguration/form",
    element : <RiskConfigurationForm />
  },

];

export default riskRoutes;
