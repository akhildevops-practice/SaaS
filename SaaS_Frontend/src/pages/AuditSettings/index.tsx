import { ReactComponent as AllDocIcon } from "../../assets/documentControl/All-Doc.svg";
import { makeStyles, Theme } from "@material-ui/core/styles";
import ModuleNavigation from "../../components/Navigation/ModuleNavigation";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuditType from "../AuditType";
import Template from "../Template";
import AuditorProfile from "../AuditorProfile";
import Proficiency from "pages/Proficiency";
import { Tooltip, Tour, TourProps } from "antd";
import { MdTouchApp } from "react-icons/md";
import ImapactTable from "pages/Impact";
// import {SharedDataContext} from "../AuditHomePage"

const useStyles = makeStyles<Theme>((theme: Theme) => ({
  docNavIconStyle: {
    width: "21.88px",
    height: "21px",
    paddingRight: "6px",
    cursor: "pointer",
  },
}));
const AuditSettings = ({}: any) => {
  // const sharedData = useContext(SharedDataContext) as { propA: any, propB: any };
  // const { propA, propB } = sharedData;

  const [currentModuleName, setCurrentModuleName] = useState("Unit Management");
  const [acitveTab, setActiveTab] = useState<any>("1");
  const classes = useStyles();
  const location = useLocation();
  const navigate = useNavigate();

  const [openTourForSettings, setOpenTourForSettings] =
    useState<boolean>(false);

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

  const refForSettings1 = useRef(null);
  const refForSettings2 = useRef(null);
  const refForSettings3 = useRef(null);
  const refForSettings4 = useRef(null);
  const refForSettings5 = useRef(null);
  const refForSettings6 = useRef(null);

  const stepsForSettings: TourProps["steps"] = [
    {
      title: "Audit Types",
      description:
        "MCOE’s can create Audit Types applicable for the organization including who can plan, schedule the audits and the kind of findings that can be created by Auditors for this Audit Type",

      target: () => (refForSettings1.current ? refForSettings1.current : null),
    },
    {
      title: "Audit Checklist",
      description:
        "This is a repository of the Audit checklist used for Audits. These  checklists can be selected  while scheduling audits and generating audit reports.",
      target: () => (refForSettings2.current ? refForSettings2.current : null),
    },
    {
      title: "Proficiencies",
      description:
        " Master List of Proficiencies that can be used in Auditpr Profile. These proficiencies can be used as a search criteria to select Auditors during Audit Planning and Scheduling ",
      target: () => refForSettings3.current,
    },
    {
      title: "Auditor Profile",
      description:
        " This view lists all the auditors in the organization. Use column filters to view Auditors by Unit, System Expertise and Proficiencies. Certification shows a list of certificates obtained by the Auditor",
      target: () => refForSettings4.current,
    },
  ];

  const tabs = [
    {
      key: "1",
      name: (
        <div
          ref={refForSettings1}
          style={{ display: "flex", alignItems: "center" }}
        >
          <AllDocIcon
            style={{
              fill: acitveTab === "1" ? "white" : "",
            }}
            className={classes.docNavIconStyle}
          />
          Audit Types
        </div>
      ),
      children: <AuditType />,
      moduleHeader: "Audit Type Management",
    },
    {
      key: "2",
      name: (
        <div
          ref={refForSettings2}
          style={{ display: "flex", alignItems: "center" }}
        >
          <AllDocIcon
            style={{
              fill: acitveTab === "2" ? "white" : "",
            }}
            className={classes.docNavIconStyle}
          />
          Audit Checklist
        </div>
      ),
      children: <Template />,
      moduleHeader: "Audit CheckList Management",
    },
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
    {
      key: "4",
      name: (
        <div
          ref={refForSettings3}
          style={{ display: "flex", alignItems: "center" }}
        >
          <AllDocIcon
            style={{
              fill: acitveTab === "4" ? "white" : "",
            }}
            className={classes.docNavIconStyle}
          />
          Proficiencies
        </div>
      ),
      children: <Proficiency />,
      moduleHeader: "Proficiency Management",
    },
    {
      key: "5",
      name: (
        <div
          ref={refForSettings4}
          style={{ display: "flex", alignItems: "center" }}
        >
          <AllDocIcon
            style={{
              fill: acitveTab === "5" ? "white" : "",
            }}
            className={classes.docNavIconStyle}
          />
          Auditor Profile
        </div>
      ),
      children: <AuditorProfile />,
      moduleHeader: "Auditor Profile Management",
    },
    {
      key: "6",
      name: (
        <div
          ref={refForSettings4}
          style={{ display: "flex", alignItems: "center" }}
        >
          <AllDocIcon
            style={{
              fill: acitveTab === "6" ? "white" : "",
            }}
            className={classes.docNavIconStyle}
          />
          Impact
        </div>
      ),
      children: <ImapactTable />,
      moduleHeader: "Impact",
    },
  ];

  // const createHandler = () => {
  //   if(acitveTab === "1"){
  //     navigate("/auditTypeForm");
  //   } else if(acitveTab === "2"){
  //     navigate("/audit/auditchecklist/create");
  //   }
  //   // else if(acitveTab === "3"){
  //   //   navigate("/focusarea/create");
  //   // } else if(acitveTab === "4"){
  //   //   navigate("/proficiency/create");
  //   // } else if(acitveTab === "5"){
  //   //   navigate("/auditorprofile/create");
  //   // }
  // }

  return (
    <>
      <div style={{ padding: "0px 16px 16px 16px" }}>
        <ModuleNavigation
          tabs={tabs}
          activeTab={acitveTab}
          setActiveTab={setActiveTab}
          currentModuleName={currentModuleName}
          setCurrentModuleName={setCurrentModuleName}
          createHandler={false}
          mainModuleName={"Audit Settings"}
        />
        {/* <ModuleHeader moduleName={"Audit Settings"} createHandler={createHandler} /> */}
      </div>
      <Tooltip title="Help Tour!" color="blue">
        <div style={{ position: "fixed", top: "77px", right: "30px" }}>
          {" "}
          <MdTouchApp
            style={{ cursor: "pointer", fontSize: "20px" }}
            onClick={() => {
              setOpenTourForSettings(true);
            }}
          />
        </div>
      </Tooltip>

      <Tour
        open={openTourForSettings}
        onClose={() => setOpenTourForSettings(false)}
        steps={stepsForSettings}
      />
    </>
  );
};

export default AuditSettings;
