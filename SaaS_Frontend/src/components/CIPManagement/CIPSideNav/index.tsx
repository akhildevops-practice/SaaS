import { makeStyles } from "@material-ui/core/styles";
import { ReactComponent as CIPIcon } from "assets/appsIcon/cip.svg";
import { MdOutlineSettings } from "react-icons/md";

const tabOptions = [
  { key: "Cip Management", label: "CIP Management", icon: <CIPIcon /> },
  { key: "Settings", label: "Settings", icon: <MdOutlineSettings /> },
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
    marginTop: "4px",
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

const CIPSideNav = ({
  activeTab,
  setActiveTab,
  collapseLevel,
  isSettingsAccess,
}: any) => {
  const classes = useStyles();

  const filteredTabs = tabOptions.filter(
    (tab) => tab.key !== "Settings" || isSettingsAccess
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
            onClick={() => setActiveTab(tab.key)}
          >
            <div className={classes.icon}>{tab.icon}</div>
            {!isCollapsed && <div className={classes.label}>{tab.label}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CIPSideNav;
