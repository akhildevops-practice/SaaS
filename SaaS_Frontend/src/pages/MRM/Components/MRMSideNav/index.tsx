import { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { ReactComponent as MRMLogo } from "assets/MRM/mrm.svg";

import { ReactComponent as ActionPointIcon } from "assets/MRM/actionPoint.svg";

import { ReactComponent as KeyAgendaIcon } from "assets/MRM/keyAgenda.svg";

import { LuFileUser } from "react-icons/lu";
import { LuFileStack } from "react-icons/lu";
import { TbFileStar } from "react-icons/tb";
import { PiFolderSimpleStarFill } from "react-icons/pi";
import { FaFileCircleCheck } from "react-icons/fa6";
import { LuFileSymlink } from "react-icons/lu";
import { VscReferences } from "react-icons/vsc";
import { TbFileSettings } from "react-icons/tb";
const tabOptions = [
  { key: 5, label: "MRM Plan", icon: <KeyAgendaIcon /> },
  { key: 0, label: "MRM Schedule", icon: <MRMLogo /> },
  { key: 1, label: "Minutes of Meeting", icon: <KeyAgendaIcon /> },
  { key: 2, label: "Action Points", icon: <ActionPointIcon /> },

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
    marginTop: "5px",
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

const MRMSideNav = ({
  value,
  setValue,
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
              value === tab.key ? classes.active : ""
            }`}
            onClick={() =>
              tab.key === "settings" ? onSettingsClick?.() : setValue(tab.key)
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

export default MRMSideNav;
