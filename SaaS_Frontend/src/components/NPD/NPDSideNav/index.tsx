import { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";

import { LuFileUser } from "react-icons/lu";
import { LuFileStack } from "react-icons/lu";
import { TbFileStar } from "react-icons/tb";
import { PiFolderSimpleStarFill } from "react-icons/pi";
import { FaFileCircleCheck } from "react-icons/fa6";
import { LuFileSymlink } from "react-icons/lu";
import { VscReferences } from "react-icons/vsc";
import { TbFileSettings } from "react-icons/tb";

const tabOptions = [
  { key: "all-npd", label: "All NPD", icon: <LuFileStack /> },
  { key: "gantt-chart", label: "Gantt Chart", icon: <LuFileUser /> },
  { key: "mom", label: "MOM", icon: <PiFolderSimpleStarFill /> },
  { key: "action-items", label: "Action Items", icon: <FaFileCircleCheck /> },
  { key: "risk", label: "Risk", icon: <VscReferences /> },
  // { key: "references", label: "References", icon: <LuFileSymlink /> },
  { key: "settings", label: "Settings", icon: <TbFileSettings /> },
];

const useStyles = makeStyles(() => ({
  sidebar: {
    width: 92,
    backgroundColor: "#fff",
    borderRight: "1px solid #e0e0e0",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    transition: "all 0.3s ease",
    zIndex: 1,
    marginTop: "3.5px",
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
    padding: "12px 0",
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

const NPDSideNav = ({
  activeTab,
  setActiveTab,
  collapseLevel,
  isSettingsAccess,
  onSettingsClick,
}: any) => {
  const classes = useStyles();

  const filteredTabs = tabOptions.filter(
    (tab) => tab.key !== "settings" || isSettingsAccess
  );

  const isCollapsed = collapseLevel === 1;
  const isHidden = collapseLevel === 2;

  return (
    <div
      className={`${classes.sidebar} ${isCollapsed ? classes.collapsed : ""} ${
        isHidden ? classes.hidden : ""
      }`}
    >
      <div className={classes.menuItems}>
        {filteredTabs.map((tab) => (
          <div
            key={tab.key}
            className={`${classes.menuItem} ${
              activeTab === tab.key ? classes.active : ""
            }`}
            onClick={() =>
              tab.key === "settings"
                ? onSettingsClick?.()
                : setActiveTab(tab.key)
            }
          >
            <div className={classes.icon}>{tab.icon}</div>
            {!isCollapsed && <div className={classes.label}>{tab.label}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NPDSideNav;
