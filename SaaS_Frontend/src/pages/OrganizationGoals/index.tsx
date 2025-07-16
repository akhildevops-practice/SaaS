import { ReactComponent as AllDocIcon } from "assets/documentControl/All-Doc.svg";
import { makeStyles, Theme } from "@material-ui/core/styles";
import ModuleNavigation from "components/Navigation/ModuleNavigation";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ObjectiveGoals from "./OrgGoals";
import ObjectiveTable from "pages/Objectives/ObjectiveTable";
import checkRoles from "utils/checkRoles";
import { roles } from "utils/enums";

const useStyles = makeStyles<Theme>((theme: Theme) => ({
  docNavIconStyle: {
    width: "21.88px",
    height: "21px",
    paddingRight: "6px",
    cursor: "pointer",
  },
}));

const ObjectAndTarget = () => {
  const [currentModuleName, setCurrentModuleName] = useState("Unit Management");
  const [acitveTab, setActiveTab] = useState<any>("2");
  const classes = useStyles();
  const location = useLocation();
  const navigate = useNavigate();
  const isOrgAdmin = checkRoles(roles.ORGADMIN);
  const [drawer, setDrawer] = useState<any>({
    mode: "create",
    open: false,
    clearFields: true,
    toggle: false,
    data: {},
  });

  const createHandler = () => {
    setDrawer({
      ...drawer,
      mode: "create",
      clearFields: true,
      toggle: false,
      open: !drawer.open,
      data: {},
    });
  };

  const tabs = [
    isOrgAdmin && {
      key: "1",
      name: "Objective Category",
      icon: (
        <AllDocIcon
          style={{
            fill: acitveTab === "1" ? "white" : "",
          }}
          className={classes.docNavIconStyle}
        />
      ),
      children: <ObjectiveGoals />,
      moduleHeader: "Objective Category Management",
    },

    {
      key: "2",
      name: "Objectives",
      icon: (
        <AllDocIcon
          style={{
            fill: acitveTab === "2" ? "white" : "",
          }}
          className={classes.docNavIconStyle}
        />
      ),
      children: <ObjectiveTable />,
      moduleHeader: "Organization Objective",
    },
  ];

  return (
    <>
      <div>
        <ModuleNavigation
          tabs={tabs}
          activeTab={acitveTab}
          setActiveTab={setActiveTab}
          currentModuleName={currentModuleName}
          setCurrentModuleName={setCurrentModuleName}
          createHandler={false}
          mainModuleName={"Objective And Goals"}
        />
      </div>
    </>
  );
};

export default ObjectAndTarget;
