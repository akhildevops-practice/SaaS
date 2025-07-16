import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { ReactComponent as AllDocIcon } from "assets/documentControl/All-Doc.svg";
import { ReactComponent as OrgSettingsIcon } from "assets/moduleIcons/module-setting.svg";

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
    marginTop: "4.2px",
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
    textAlign: "center",
    wordBreak: "break-word",
    lineHeight: "1.2",
  },
}));

const RiskSideNav = ({
  activeTab,
  setActiveTab,
  collapseLevel,
  isSettingsAccess,
  onSettingsClick,
  categoryOptions = [],
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapseLevel: number;
  isSettingsAccess?: any;
  onSettingsClick?: () => void;
  categoryOptions?: any[];
}) => {
  const classes = useStyles();

  // Create tab options from categories
  const categoryTabs = categoryOptions.map((category: any) => ({
    key: category.value,
    label: category.label || category.riskCategory,
    icon: <AllDocIcon style={{ width: 22, height: 22 }} />,
  }));

  // Add settings tab if user has access
  const tabOptions = [
    ...categoryTabs,
    ...(isSettingsAccess ? [{
      key: "settings",
      label: "Settings",
      icon: <OrgSettingsIcon style={{ width: 22, height: 22 }} />,
    }] : [])
  ];

  const isCollapsed = collapseLevel === 1;
  const isHidden = collapseLevel === 2;

  return (
    <div
      className={`${classes.sidebar} ${isCollapsed ? classes.collapsed : ""} ${
        isHidden ? classes.hidden : ""
      }`}
    >
      <div className={classes.menuItems}>
        {tabOptions.map((tab) => (
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

export default RiskSideNav;
