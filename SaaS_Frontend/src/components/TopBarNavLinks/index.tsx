import React, { useEffect, useState, useMemo } from "react";
import DashboardIcon from "../../assets/sidebarIcons/DashBoardWhite.svg";
import DocIcon from "../../assets/sidebarIcons/DocWhite.svg";
import MasterIcon from "../../assets/sidebarIcons/MasterWhite.svg";
import SettingsIcon from "../../assets/sidebarIcons/SettingsWhite.svg";
import AuditIcon from "../../assets/sidebarIcons/AuditWhite.svg";
import NavLinks from "../Navlinks";
import useStyles from "./styles";
import { Grid } from "@material-ui/core";
import ExpandingSubList from "../ExpandingSubList";
import { tab } from "../../recoil/atom";
import { useLocation } from "react-router-dom";
import getAppUrl from "../../utils/getAppUrl";
import { useRecoilState } from "recoil";
import axios from "../../apis/axios.global";
import { modules } from "../../utils/enums";
import { ReactComponent as InboxIcon } from "../../assets/documentControl/Inbox.svg";
import CaraDetails from "pages/CARA/caraDetails";

type Props = {
  open: boolean;
  setOpen: any;
};

const icons: {
  [key: string]: any;
} = {
  Dashboard: <img src={DashboardIcon} alt="Dashboard" />,
  "Process Documents": <img src={DocIcon} alt="process documents" />,
  Master: <img src={MasterIcon} alt="Master" />,
  Settings: <img src={SettingsIcon} alt="Settings" />,
  Audit: <img src={AuditIcon} alt="Audit" />,
  "Organization Goals": <img src={AuditIcon} alt="Audit" />,
  Inbox: (
    <InboxIcon
      style={{
        color: "white",
        width: "20.8px",
        height: "20.9px",
      }}
    />
  ),
};

const topList = ["Dashboard", "Master", "Settings", "Inbox"];

const processDocIcons = {
  "Document Type": <img src={DocIcon} alt="notifications" />,
  "Process Document": <img src={DocIcon} alt="notifications" />,
};

const processDocList = ["Document Type", "Process Document"];

const masterIcons = {
  Location: <img src={DocIcon} alt="notifications" />,
  Entity: <img src={DocIcon} alt="entity" />,
  User: <img src={DocIcon} alt="notifications" />,
  System: <img src={DocIcon} alt="system master" />,
  Unit: <img src={DocIcon} alt="system master" />,
};

const masterList = ["Unit", "Roles", "Department", "User", "System", "UOM"];

const auditIcons = {
  "Audit Plan": <img src={DocIcon} alt="notifications" />,
  "Audit Schedule": <img src={DocIcon} alt="notifications" />,
  "Audit Report": <img src={DocIcon} alt="notifications" />,
  "List of Findings": <img src={DocIcon} alt="notifications" />,
  "Audit Checklist": <img src={DocIcon} alt="notifications" />,
};

const objectiveIcons = {
  "Organization Goals": <img src={DocIcon} alt="notifications" />,
  "Organization Objective": <img src={DocIcon} alt="notifications" />,
  KRA: <img src={DocIcon} alt="notifications" />,
};

const auditList = [
  "Audit Plan",
  "Audit Schedule",
  "Audit Report",
  "List of Findings",
  "Audit Checklist",
];

const objectiveList = ["Organization Goals", "Objective"];

const kpiIcons = {
  "KPI Definition": <img src={DocIcon} alt="notifications" />,
  "Report Design": <img src={DocIcon} alt="notifications" />,
};

const kpiList = ["KPI Definitions", "Report Templates", "Reports"];

const riskList = ["Risk Configuration", "Risk Register"];
const riskIcons = {
  "Risk Configuration": <img src={DocIcon} alt="risk config" />,
  "Risk Register": <img src={DocIcon} alt="risk register" />,
};

const MrmList = ["Meeting Type", "MRM"];
const MrmIcons = {
  "Meeting Type": <img src={DocIcon} alt="key agenda" />,
  MRM: <img src={DocIcon} alt="mrm" />,
};
/**
 * This component handles the Navigation Links for the Desktop view.
 * Icons, Names, Sub Nav Menu are all set here
 *
 */

function TopBarNavLinks({ open, setOpen }: Props) {
  // create a recoil state for active tab
  const [activeTab, setActiveTab] = useRecoilState<any>(tab);
  const [activeModules, setActiveModules] = useState<string[]>([]);

  const realmName = getAppUrl();
  const classes = useStyles();

  const { pathname } = useLocation();

  const dashboardIcons = {
    KPI: <img src={DocIcon} alt="notifications" />,
    KRA: <img src={DocIcon} alt="notifications" />,
    "Document Dashboard": <img src={DocIcon} alt="notifications" />,
    Audit: <img src={DocIcon} alt="notifications" />,
    NC: <img src={DocIcon} alt="notifications" />,
  };

  const dashboardList = useMemo(() => {
    const temp: string[] = [];

    if (activeModules.includes(modules.KPI)) temp.push(...["KPI", "KRA"]);
    // if (activeModules.includes(modules.KRA)) temp.push("KRA");
    if (activeModules.includes(modules.DOCUMENTS))
      temp.push("Document Dashboard");

    if (activeModules.includes(modules.AUDIT)) temp.push(...["Audit", "NC"]);

    // if (activeModules.includes(modules.KPI))

    // if (activeModules.includes(modules.OBJECTIVES))

    // if (activeModules.includes(modules.RISK))

    return temp;
  }, [activeModules]);

  useEffect(() => {
    getActiveModules();
  }, []);

  useEffect(() => {
    if (pathname.includes("/master")) {
      setActiveTab("master");
    } else if (pathname.includes("/dashboard")) {
      setActiveTab("dashboard");
    } else if (
      pathname.includes("/audit") &&
      !pathname.includes("/dashboard") &&
      activeModules.includes(modules.AUDIT)
    ) {
      setActiveTab("audit");
    } else if (
      pathname.includes("/objective") &&
      activeModules.includes(modules.OBJECTIVES)
    ) {
      setActiveTab("objective");
    } else if (
      pathname.includes("/processdocuments") &&
      activeModules.includes(modules.DOCUMENTS)
    ) {
      setActiveTab("processdocuments");
    } else if (
      pathname.includes("/kpi") &&
      activeModules.includes(modules.KPI)
    ) {
      setActiveTab("kpi");
    } else if (
      pathname.includes("/risk") &&
      activeModules.includes(modules.RISK)
    ) {
      setActiveTab("risk");
    } else if (
      pathname.includes("/mrm") &&
      activeModules.includes(modules.MRM)
    ) {
      setActiveTab("mrm");
    } else if (
      pathname.includes("/cara") &&
      activeModules.includes(modules.CAPA)
    ) {
      setActiveTab("cara");
    } else {
      setActiveTab("");
    }
  }, [pathname, activeModules]);

  const getActiveModules = async () => {
    await axios(`/api/organization/getAllActiveModules/${realmName}`)
      .then((res) => setActiveModules([...res.data.activeModules, "MRM"]))
      .catch((err) => console.error(err));
  };

  return (
    <div className={classes.root}>
      {activeTab === "processdocuments" && open && (
        <ExpandingSubList
          data={processDocList}
          title={activeTab}
          icon={icons[activeTab]}
          key={activeTab}
          childIcons={processDocIcons}
        />
      )}
      {activeTab === "master" && open && (
        <ExpandingSubList
          data={masterList}
          title={activeTab}
          icon={icons[activeTab]}
          key={activeTab}
          childIcons={masterIcons}
        />
      )}
      {activeTab === "audit" && open && (
        <ExpandingSubList
          data={auditList}
          title={activeTab}
          icon={icons[activeTab]}
          key={activeTab}
          childIcons={auditIcons}
        />
      )}
      {activeTab === "objective" && open && (
        <ExpandingSubList
          data={objectiveList}
          title={activeTab}
          icon={icons[activeTab]}
          key={activeTab}
          childIcons={objectiveIcons}
        />
      )}
      {activeTab === "dashboard" && open && (
        <ExpandingSubList
          data={dashboardList}
          title={activeTab}
          icon={icons[activeTab]}
          key={activeTab}
          childIcons={dashboardIcons}
        />
      )}
      {activeTab === "kpi" && open && (
        <ExpandingSubList
          data={kpiList}
          title={activeTab}
          icon={icons[activeTab]}
          key={activeTab}
          childIcons={kpiIcons}
        />
      )}
      {activeTab === "risk" && open && (
        <ExpandingSubList
          data={riskList}
          title={activeTab}
          icon={icons[activeTab]}
          key={activeTab}
          childIcons={riskIcons}
        />
      )}
      {activeTab === "mrm" && open && (
        <ExpandingSubList
          data={MrmList}
          title={activeTab}
          icon={icons[activeTab]}
          key={activeTab}
          childIcons={MrmIcons}
        />
      )}
      {activeTab === "cara" && open && (
        <ExpandingSubList
          data={CaraDetails}
          title={activeTab}
          icon={icons[activeTab]}
          key={activeTab}
          childIcons={MrmIcons}
        />
      )}
      {topList.map((text: string) => {
        if (text === "Inbox") {
          return (
            <Grid
              item
              xs={4}
              key={text}
              style={{ position: "absolute", right: 197, top: 17 }}
            >
              <NavLinks
                text={text}
                icon={icons[text]}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                setOpen={setOpen}
              />
            </Grid>
          );
        }
        return (
          <Grid
            item
            xs={6}
            key={text}
            style={{
              // background: "rgb(73,100,142)",

              padding: "7px",
              borderRadius: "15px",
              marginRight: "12px",
            }}
          >
            <NavLinks
              text={text}
              icon={icons[text]}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              setOpen={setOpen}
            />
          </Grid>
        );
      })}
    </div>
  );
}

export default React.memo(TopBarNavLinks);
