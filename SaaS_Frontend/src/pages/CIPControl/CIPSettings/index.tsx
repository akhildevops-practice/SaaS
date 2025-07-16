import { ReactComponent as AllDocIcon } from "assets/documentControl/All-Doc.svg";
import { makeStyles, Theme } from "@material-ui/core/styles";
import ModuleNavigation from "components/Navigation/ModuleNavigation";
import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CIPCategory from "components/CIPManagement/CIPSettingComponents/CIPCategory";
import CIPType from "components/CIPManagement/CIPSettingComponents/CIPType";
import CIPOrigin from "components/CIPManagement/CIPSettingComponents/CIPOrigin";
import CIPTeams from "components/CIPManagement/CIPSettingComponents/CIPTeam";
import { Tooltip, Tour, TourProps } from "antd";
import { MdTouchApp } from 'react-icons/md';

const useStyles = makeStyles<Theme>((theme: Theme) => ({
  docNavIconStyle: {
    width: "21.88px",
    height: "21px",
    paddingRight: "6px",
    cursor: "pointer",
  },
}));

const CIPSettings = () => {
  const [currentModuleName, setCurrentModuleName] = useState("Unit Management");
  const [acitveTab, setActiveTab] = useState<any>("1");
  const classes = useStyles();
  const location = useLocation();
  const navigate = useNavigate();
  // useEffect(() => {
  //   if (!!location.state) {
  //     if (location?.state?.redirectToTab === "AUDIT CHECKLIST") {
  //       setActiveTab("2");
  //     }
  //   } else {
  //     setActiveTab("1");
  //   }
  // }, [location]);
  const refForcipSettings1 = useRef(null);
  const refForcipSettings2 = useRef(null);
  const refForcipSettings3 = useRef(null);
  // const refForcip4 = useRef(null);
  // const refForcip5 = useRef(null);
  // const refForcip6 = useRef(null);
  // const refForcip7 = useRef(null);
  // const refForcip8 = useRef(null);
  // const refForcip9 = useRef(null);

  const tabs = [
    {
      key: "1",
      name: (
        <div
          style={{ display: "flex", alignItems: "center", gap: "5px" }}
          ref={refForcipSettings1}
        >
          <AllDocIcon
            style={{
              fill: acitveTab === "1" ? "white" : "",
            }}
            className={classes.docNavIconStyle}
          />
          CIP Category
        </div>
      ),

      children: <CIPCategory />,
      moduleHeader: "CIP Category Management",
    },
    {
      key: "2",
      name: (
        <div
          style={{ display: "flex", alignItems: "center", gap: "5px" }}
          ref={refForcipSettings2}
        >
          <AllDocIcon
            style={{
              fill: acitveTab === "2" ? "white" : "",
            }}
            className={classes.docNavIconStyle}
          />
          CIP Methodology
        </div>
      ),

      children: <CIPType />,
      moduleHeader: "CIP Type Management",
    },
    {
      key: "3",
      name: (
        <div
          style={{ display: "flex", alignItems: "center", gap: "5px" }}
          ref={refForcipSettings3}
        >
          <AllDocIcon
            style={{
              fill: acitveTab === "3" ? "white" : "",
            }}
            className={classes.docNavIconStyle}
          />
          CIP Origin
        </div>
      ),
      children: <CIPOrigin />,
      moduleHeader: "CIP Type Management",
    },
    {
      key: "4",
      name: (
        <div
          style={{ display: "flex", alignItems: "center", gap: "5px" }}
          ref={refForcipSettings3}
        >
          <AllDocIcon
            style={{
              fill: acitveTab === "4" ? "white" : "",
            }}
            className={classes.docNavIconStyle}
          />
          GRT Teams
        </div>
      ),
      children: <CIPTeams />,
      moduleHeader: "CIP Teams",
    },
  ];

  const [openTourForCipSettings, setOpenTourForCipSettings] =
    useState<boolean>(false);

  const stepsForCipSettings: TourProps["steps"] = [
    {
      title: "CIP Category",
      description: "",

      target: () => refForcipSettings1.current,
    },
    {
      title: "CIP Methodology",
      description: " ",
      target: () => refForcipSettings2.current,
    },

    {
      title: "CIP Origin",
      description: "",
      target: () => refForcipSettings3.current,
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
          mainModuleName={"CIP Settings"}
        />
      </div>

      <div
        style={{
          position: "fixed",
          top: "78px",
          right: "50px",
          display: "flex",
        }}
      >
        <Tooltip title="Help Tours!" color="blue">
          <MdTouchApp
            style={{ cursor: "pointer" }}
            onClick={() => {
              setOpenTourForCipSettings(true);
            }}
          />
        </Tooltip>
      </div>

      <Tour
        open={openTourForCipSettings}
        onClose={() => setOpenTourForCipSettings(false)}
        steps={stepsForCipSettings}
      />
    </>
  );
};

export default CIPSettings;
