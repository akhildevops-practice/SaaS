import { makeStyles } from "@material-ui/core/styles";
import { AiOutlineDashboard, AiOutlineFileText } from "react-icons/ai";
import { ReactComponent as DocControlIcon } from "assets/appsIcon/Doc Control.svg";
import { ReactComponent as CIPIcon } from "assets/appsIcon/cip.svg";
import { ReactComponent as HIRAIcon } from "assets/appsIcon/Hira.svg";
import { ReactComponent as AspImpIcon } from "assets/appsIcon/ASP-IMP.svg";
import { ReactComponent as KPIIcon } from "assets/appsIcon/KPI.svg";
import { ReactComponent as DocumentIcon } from "assets/dashboardIcons/Process-Doc_1.svg";
import { ReactComponent as KPIWhiteIcon } from "assets/dashboardIcons/KPI.svg";
import { ReactComponent as HIRAWhiteIcon } from "assets/dashboardIcons/Hira.svg";
import { MdEqualizer, MdSpeed } from "react-icons/md";
import { useEffect, useState } from "react";
import axios from "apis/axios.global";
import getAppUrl from "utils/getAppUrl";
import checkRoles from "utils/checkRoles";
import getSessionStorage from "utils/getSessionStorage";

const useStyles = makeStyles(() => ({
  sidebar: {
    width: 92,
    backgroundColor: "#fff",
    borderRight: "1px solid #e0e0e0",
    height: "90vh",
    display: "flex",
    flexDirection: "column",
    transition: "all 0.3s ease",
    zIndex: 1,
    // marginTop: "5px",
  },
  collapsed: {
    width: 64,
  },
  hidden: {
    width: 0,
    minWidth: 0,
    overflow: "hidden",
    borderRight: "none",
  },

  menuItems: {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  menuItem: {
    textAlign: "center",
    padding: "10px 0",
    cursor: "pointer",
    fontSize: 12,
    color: "#0f172a",
    transition: "background 0.2s",
    width: "100%",
    "&:hover": {
      backgroundColor: "#f0f4f8",
    },
  },
  active: {
    backgroundColor: "#e6f0ff",
    fontWeight: 600,
  },
  icon: {
    fontSize: 24,
    marginBottom: 4,
    color: "#0f172a",
  },
  label: {
    fontSize: 12,
    letterSpacing: "0.45px",
  },
}));

const SideNavbar = ({
  activeTab2,
  setActiveTab2,
  collapseLevel,
}: //   isSettingsAccess,
//   onSettingsClick,
any) => {
  const classes = useStyles();
  const realmName = getAppUrl();
  const userDetails = getSessionStorage();

  const [activeModule, setActiveModule] = useState<any>([]);

  useEffect(() => {
    activeModules();
  }, []);

  const activeModules = async () => {
    const res = await axios(
      `/api/organization/getAllActiveModules/${realmName}`
    );
    let data = [];
    const isOrgAdmin = checkRoles("ORG-ADMIN");
    const isMCOE = checkRoles("ORG-ADMIN") && !!userDetails?.location?.id;

    // if (!!isOrgAdmin || !!isMCOE) {
    //   data = [...res?.data?.activeModules, "User Analytics"];
    // } else {
    //   data = [...res?.data?.activeModules];
    // }
    data = [...res?.data?.activeModules, "User Analytics"];
    setActiveModule([...data]);
  };

  const tabOptions = [
    activeModule.includes("ProcessDocuments") && {
      key: "Document",
      label: "Document",
      icon: <DocControlIcon />,
    },
    activeModule.includes("Audit") && {
      key: "Audit",
      label: "Audit",
      icon: <MdSpeed />,
    },
    activeModule.includes("Risk") && {
      key: "Risk",
      label: "Risk",
      icon: <HIRAIcon />,
    },
    activeModule.includes("CIP") && {
      key: "CIP",
      label: "CIP",
      icon: <CIPIcon />,
    },
    activeModule.includes("CAPA") && {
      key: "CAPA",
      label: "CAPA",
      icon: <CIPIcon />,
    },
    activeModule.includes("Objectives & KPI") && {
      key: "Objective Report",
      label: "Objective Report",
      icon: <KPIIcon />,
    },
    activeModule.includes("Objectives & KPI") && {
      key: "KPI Report",
      label: "KPI Report",
      icon: <KPIIcon />,
    },
    activeModule.includes("User Analytics") && {
      key: "User Analytics",
      label: "User Analytics",
      icon: <MdEqualizer />,
    },
  ].filter(Boolean); // remove `false` or `null` entries

  const isCollapsed = collapseLevel === 1;
  const isHidden = collapseLevel === 2;

  return (
    <div
      className={`${classes.sidebar} ${isCollapsed ? classes.collapsed : ""} ${
        isHidden ? classes.hidden : ""
      }`}
      style={{ zIndex: 110 }}
    >
      <div className={classes.menuItems}>
        {tabOptions.map((tab) => (
          <div
            key={tab.key}
            className={`${classes.menuItem} ${
              activeTab2 === tab.key ? classes.active : ""
            }`}
            onClick={() => setActiveTab2(tab.key)}
          >
            <div className={classes.icon}>{tab.icon}</div>
            {!isCollapsed && <div className={classes.label}>{tab.label}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SideNavbar;
