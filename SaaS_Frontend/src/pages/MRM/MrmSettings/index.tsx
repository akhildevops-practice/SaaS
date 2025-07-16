import { ReactComponent as AllDocIcon } from "../../../assets/documentControl/All-Doc.svg";
import { makeStyles, Theme } from "@material-ui/core/styles";
import ModuleNavigation from "components/Navigation/ModuleNavigation";

import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import MRMKeyAgenda from "../MRMKeyAgenda";
import checkRoles from "utils/checkRoles";
import { Tour, TourProps } from "antd";
import { MdTouchApp } from 'react-icons/md';

const useStyles = makeStyles<Theme>((theme: Theme) => ({
  docNavIconStyle: {
    width: "21.88px",
    height: "21px",
    paddingRight: "6px",
    cursor: "pointer",
  },
}));
const MrmSettings = () => {
  const [currentModuleName, setCurrentModuleName] = useState("Unit Management");
  const [addKeyAgenda, setAddKeyAgenda] = useState<boolean>(false);
  const [acitveTab, setActiveTab] = useState<any>("1");
  const classes = useStyles();
  const location = useLocation();
  const navigate = useNavigate();
  const userDetail = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isMR = checkRoles("MR");
  const showData = isOrgAdmin || isMR;

  useEffect(() => {
    if (location.state) {
      if (location?.state?.redirectToTab === "AUDIT CHECKLIST") {
        setActiveTab("2");
      } else if (location?.state?.redirectToTab === "FOCUS AREAS") {
        setActiveTab("3");
      } else if (location?.state?.redirectToTab === "PROFICIENCIES") {
        setActiveTab("4");
      } else if (location?.state?.redirectToTab === "AUDITOR PROFILE") {
        setActiveTab("5");
      }
    } else {
      setActiveTab("1");
    }
  }, [location]);

  const refForMRMSettings1 = useRef(null);
  const refForMRMSettings2 = useRef(null);
  const refForMRMSettings3 = useRef(null);
  const refForMRMSettings4 = useRef(null);
  const refForMRMSettings5 = useRef(null);
  const refForMRMSettings6 = useRef(null);
  // const refForMRMSettings7 = useRef(null);

  const tabs = [
    {
      key: "1",
      name: (
        <div
          style={{ display: "flex", alignItems: "center" }}
          ref={refForMRMSettings1}
        >
          <AllDocIcon
            style={{
              fill: acitveTab === "1" ? "white" : "",
            }}
            className={classes.docNavIconStyle}
          />
          Meeting Types
        </div>
      ),
      children: (
        <MRMKeyAgenda
          setAddKeyAgenda={setAddKeyAgenda}
          addKeyAgenda={addKeyAgenda}
          refForMRMSettings2={refForMRMSettings2}
          refForMRMSettings3={refForMRMSettings3}
          refForMRMSettings4={refForMRMSettings4}
          refForMRMSettings5={refForMRMSettings5}
          refForMRMSettings6={refForMRMSettings6}
        />
      ),
      moduleHeader: "Meeting Type Management",
    },
    // {
    //   key: "2",
    //   name: "Audit Checklist",
    //   // path: "/master/department",
    //   icon: (
    //     <AllDocIcon
    //       style={{
    //         fill: acitveTab === "2" ? "white" : "",
    //       }}
    //       className={classes.docNavIconStyle}
    //     />
    //   ),
    //   children: <Template />,
    //   moduleHeader: "Audit CheckList Management",
    // },
    // {
    //   key: "3",
    //   name: "Focus Areas",
    //   // path: "/master/user",
    //   icon: (
    //     <AllDocIcon
    //       style={{
    //         fill: acitveTab === "3" ? "white" : "",
    //       }}
    //       className={classes.docNavIconStyle}
    //     />
    //   ),
    //   children: <FocusArea />,
    //   moduleHeader: "Focus Area Management",
    // },
    // {
    //   key: "4",
    //   name: "Proficiencies",
    //   // path: "/master/user",
    //   icon: (
    //     <AllDocIcon
    //       style={{
    //         fill: acitveTab === "4" ? "white" : "",
    //       }}
    //       className={classes.docNavIconStyle}
    //     />
    //   ),
    //   children: <Proficiency />,
    //   moduleHeader: "Proficiency Management",
    // },
    // {
    //   key: "5",
    //   name: "Auditor Profile",
    //   // path: "/master/roles",
    //   icon: (
    //     <AllDocIcon
    //       style={{
    //         fill: acitveTab === "5" ? "white" : "",
    //       }}
    //       className={classes.docNavIconStyle}
    //     />
    //   ),
    //   children: <AuditorProfile />,
    //   moduleHeader: "Auditor Profile Management",
    // },
  ];

  const createHandler = () => {
    if (acitveTab === "1") {
      if (showData) {
        setAddKeyAgenda(true);
      }
    }
  };

  const [openTourForMRMSettings, setOpenTourForMRMSettings] =
    useState<boolean>(false);

  // const refForMRMPlan8 = useRef(null);

  const stepsForMRMSettings: TourProps["steps"] = [
    {
      title: "Meeting Types",
      description:
        "All the created meeting types with meeting owner for a location are listed here",

      target: () =>
        refForMRMSettings1.current ? refForMRMSettings1.current : null,
    },

    {
      title: "Units",
      description:
        "Select a unit for which meeting type has to be created. By default, user can create a meeting type either for all units or his/her unit.",
      target: () => refForMRMSettings2.current,
    },
    {
      title: "Year",
      description:
        "By default , this view will show the meeting type created in the current year . Click on this link < to see prior year meeting type. Use > to move back to the current year",
      target: () => refForMRMSettings3.current,
    },
    {
      title: "Edit",
      description: "Click on edit icon to edit a meeting type",

      target: () =>
        refForMRMSettings4.current ? refForMRMSettings4.current : null,
    },
    {
      title: "Delete",
      description: "Click on delete icon to delete a meeting type",
      target: () => refForMRMSettings5.current,
    },
    {
      title: "Add Agenda",
      description: "Click on " + " icon to add agendas for a meeting type",
      target: () => refForMRMSettings6?.current,
    },
    // {
    //   title: "Edit",
    //   description:
    //     "All the documents (yet to publish) under workflow can be viewed here ",
    //   target: () =>refForMRMSettings7.current,
    // },
    // {
    //   title: "Repete",
    //   description:
    //     "All the documents for reference can be viewed here. (Can be created only MCOE)",
    //   target: () => refForMRMSettings8.current,
    // },
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
          createHandler={showData && createHandler}
          mainModuleName={"Mrm Settings"}
        />
        {/* <ModuleHeader moduleName={"Mrm Settings"} createHandler={createHandler} /> */}
      </div>
      <div style={{ position: "fixed", top: "77px", right: "120px" }}>
        <MdTouchApp
          style={{ cursor: "pointer" }}
          onClick={() => {
            setOpenTourForMRMSettings(true);
          }}
        />
      </div>
      <Tour
        open={openTourForMRMSettings}
        onClose={() => setOpenTourForMRMSettings(false)}
        steps={stepsForMRMSettings}
      />
    </>
  );
};

export default MrmSettings;
