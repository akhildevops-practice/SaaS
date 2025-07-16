import { useEffect, useMemo, useState } from "react";
import DashboardIcon from "../../assets/sidebarIcons/DashBoardWhite.svg";
import DocIcon from "../../assets/sidebarIcons/DocWhite.svg";
import MasterIcon from "../../assets/sidebarIcons/MasterWhite.svg";
import SettingsIcon from "../../assets/sidebarIcons/SettingsWhite.svg";
import AuditTemplateIcon from "../../assets/sidebarIcons/AuditTemplateIcon.svg";
import AuditReportIcon from "../../assets/sidebarIcons/AuditReportIcon.svg";
import NcSummaryIcon from "../../assets/sidebarIcons/NcSummaryIcon.svg";
import LogoutIcon from "../../assets/sidebarIcons/LogoutWhite.svg";
import NotiIcon from "../../assets/sidebarIcons/NotiWhite.svg";
import UserMasterIcon from "../../assets/sidebarIcons/UserMasterIcon.svg";
import LocationIcon from "../../assets/sidebarIcons/LocationIcon.svg";
import ProcessDoc from "../../assets/sidebarIcons/ProcessDoc.svg";
import AuditIcon from "../../assets/sidebarIcons/AuditWhite.svg";
import SystemIcon from "../../assets/sidebarIcons/System.svg";
import ProcessRidge from "../../assets/sidebarIcons/ProcessRidge.svg";
import NCDashboard from "../../assets/sidebarIcons/NCDashboard.svg";
import AuditDashboard from "../../assets/sidebarIcons/AuditDashboard.svg";
import List from "@material-ui/core/List";
import Badge from "@material-ui/core/Badge";
import NavLink from "../Navlinks";
import ExpandingSubListMobile from "../ExpandingSubListMobile";
import { notificationData } from "../../recoil/atom";
import { useRecoilValue } from "recoil";
import { useStyles } from "./styles";
import axios from "../../apis/axios.global";
import { modules } from "../../utils/enums";
import getAppUrl from "../../utils/getAppUrl";

type Props = {
  handleDrawerClose: () => void;
  handleLogout: any;
};

const iconsInActive: {
  [key: string]: any;
} = {
  Dashboard: <img src={DashboardIcon} alt="process documents" />,
  Audit: <img src={AuditIcon} alt="audit" />,
  "Process Documents": <img src={DocIcon} alt="process documents" />,
  KPI: <img src={DocIcon} alt="process documents" />,
  Objective: <img src={DocIcon} alt="objective" />,
  Master: <img src={MasterIcon} alt="master" />,
  Notification: <img src={NotiIcon} alt="notifications" />,
  Inbox: <img src={DocIcon} alt="inbox" />,
  Settings: <img src={SettingsIcon} alt="settings" />,
  Logout: <img src={LogoutIcon} alt="logout" />,
  Risk: <img src={DocIcon} alt="risk" />,
  MRM: <img src={DocIcon} alt="mrm" />,
};

const dashboardIcons = {
  "Document Dashboard": <img src={ProcessRidge} alt="Document Dashboard" />,
  Audit: <img src={AuditDashboard} alt="Audit" />,
  NC: <img src={NCDashboard} alt="NC" />,
};

const auditIcons = {
  "Audit Plan": <img src={AuditReportIcon} width="18px" alt="audit report" />,
  "Audit Schedule": (
    <img src={AuditReportIcon} width="18px" alt="audit report" />
  ),
  "Audit Report": <img src={AuditReportIcon} width="18px" alt="audit report" />,
  "List of Findings": (
    <img src={NcSummaryIcon} width="18px" alt="List of Findings" />
  ),
  "Audit Checklist": (
    <img src={AuditTemplateIcon} width="18px" alt="audit checklist" />
  ),
};

const auditList = [
  "Audit Plan",
  "Audit Schedule",
  "Audit Report",
  "List of Findings",
  "Audit Checklist",
];

const processDocIcons = {
  "Document Type": <img src={DocIcon} alt="document type" />,
  "Process Document": <img src={ProcessDoc} alt="process document" />,
};

const processDocList = ["Document Type", "Process Document"];

const kpiIcons = {
  "KPI Definitions": <img src={DocIcon} alt="kpi definitions" />,
  "Report Templates": <img src={ProcessDoc} alt="report templates" />,
  Reports: <img src={ProcessDoc} alt="reports" />,
};

const kpiList = ["KPI Definitions", "KPI Report Templates", "KPI Entry"];

const objectiveIcons = {
  "Organization Goals": <img src={DocIcon} alt="organization goals" />,
  Objective: <img src={ProcessDoc} alt="objective" />,
};
const objectiveList = ["Organization Goals", "Objective"];

const masterIcons = {
  Location: <img src={LocationIcon} alt="location" />,
  Entity: <img src={DocIcon} alt="Entity" />,
  User: <img src={UserMasterIcon} alt="user" />,
  System: <img src={SystemIcon} width="18px" alt="system master" />, // Icon needs to be changed later
  Unit: <img src={SystemIcon} width="18px" alt="unit master" />, // Icon needs to be changed later
};

const masterList = ["Location", "Roles", "Entity", "User", "System", "Unit"];

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
 * This component handles the Navigation Links for the mobile view.
 * Icons, Names, Sub Nav Menu are all set here
 *
 */

function MobileTopBarNavLinks({ handleDrawerClose, handleLogout }: Props) {
  const [activeModules, setActiveModules] = useState<string[]>([]);
  const notificationCount = useRecoilValue(notificationData);
  const classes = useStyles();

  const realmName = getAppUrl();

  const sideList = useMemo(() => {
    let temp: string[] = ["Dashboard"];

    if (activeModules.includes(modules.AUDIT)) temp = [...temp, "Audit"];
    if (activeModules.includes(modules.DOCUMENTS))
      temp = [...temp, "Process Documents"];
    if (activeModules.includes(modules.KPI)) temp = [...temp, "KPI"];
    if (activeModules.includes(modules.OBJECTIVES))
      temp = [...temp, "Objective"];
    if (activeModules.includes(modules.RISK)) temp = [...temp, "Risk"];
    if (activeModules.includes(modules.MRM)) temp = [...temp, "MRM"];
    if (activeModules.includes(modules.MRM)) temp = [...temp, "CARA"];

    temp.push("Master");
    temp.push("Notification");
    temp.push("Inbox");
    temp.push("Settings");
    temp.push("Logout");

    return temp;
  }, [activeModules]);

  const dashboardList = useMemo(() => {
    let temp = ["Document Dashboard"];

    if (activeModules.includes(modules.AUDIT)) temp = [...temp, "Audit", "NC"];

    return temp;
  }, [activeModules]);

  useEffect(() => {
    getActiveModules();
  }, []);

  const getActiveModules = async () => {
    await axios(`/api/organization/getAllActiveModules/${realmName}`)
      .then((res) => {
        setActiveModules([...res.data.activeModules, "MRM"]);
      })
      .catch((err) => console.error(err));
  };

  return (
    <List>
      {sideList.map((text: string) => {
        if (text === "Dashboard") {
          return (
            <ExpandingSubListMobile
              data={dashboardList}
              title={text}
              icon={iconsInActive[text]}
              key={text}
              childIcons={dashboardIcons}
              handleDrawerClose={handleDrawerClose}
            />
          );
        }
        if (text === "Audit") {
          return (
            <ExpandingSubListMobile
              data={auditList}
              title={text}
              icon={iconsInActive[text]}
              key={text}
              childIcons={auditIcons}
              handleDrawerClose={handleDrawerClose}
            />
          );
        }
        if (text === "Process Documents") {
          return (
            <ExpandingSubListMobile
              data={processDocList}
              title={text}
              icon={iconsInActive[text]}
              key={text}
              childIcons={processDocIcons}
              handleDrawerClose={handleDrawerClose}
            />
          );
        }
        if (text === "KPI") {
          return (
            <ExpandingSubListMobile
              data={kpiList}
              title={text}
              icon={iconsInActive[text]}
              key={text}
              childIcons={kpiIcons}
              handleDrawerClose={handleDrawerClose}
            />
          );
        }
        if (text === "Objective") {
          return (
            <ExpandingSubListMobile
              data={objectiveList}
              title={text}
              icon={iconsInActive[text]}
              key={text}
              childIcons={objectiveIcons}
              handleDrawerClose={handleDrawerClose}
            />
          );
        }
        if (text === "Risk") {
          return (
            <ExpandingSubListMobile
              data={riskList}
              title={text}
              icon={iconsInActive[text]}
              key={text}
              childIcons={riskIcons}
              handleDrawerClose={handleDrawerClose}
            />
          );
        }
        if (text === "MRM") {
          return (
            <ExpandingSubListMobile
              data={MrmList}
              title={text}
              icon={iconsInActive[text]}
              key={text}
              childIcons={MrmIcons}
              handleDrawerClose={handleDrawerClose}
            />
          );
        }
        if (text === "Master") {
          return (
            <ExpandingSubListMobile
              data={masterList}
              title={text}
              icon={iconsInActive[text]}
              key={text}
              childIcons={masterIcons}
              handleDrawerClose={handleDrawerClose}
            />
          );
        }
        if (text === "Notification") {
          return (
            <NavLink
              text={text}
              icon={
                <Badge
                  badgeContent={notificationCount?.unreadCount}
                  color="secondary"
                  className={classes.badge}
                >
                  {iconsInActive[text]}
                </Badge>
              }
              key={text}
              mobile={true}
              handleDrawerClose={handleDrawerClose}
            />
          );
        }
        if (text === "Inbox") {
          return (
            <NavLink
              text={text}
              icon={iconsInActive[text]}
              key={text}
              mobile={true}
              handleDrawerClose={handleDrawerClose}
            />
          );
        }
        if (text === "Logout") {
          return (
            <NavLink
              text={text}
              icon={iconsInActive[text]}
              key={text}
              mobile={true}
              handleDrawerClose={handleDrawerClose}
              handleLogout={handleLogout}
            />
          );
        }

        return (
          <NavLink
            text={text}
            icon={iconsInActive[text]}
            key={text}
            mobile={true}
            handleDrawerClose={handleDrawerClose}
          />
        );
      })}
    </List>
  );
}

export default MobileTopBarNavLinks;
