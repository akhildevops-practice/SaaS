import { makeStyles } from "@material-ui/core/styles";
import { AiOutlineDashboard, AiOutlineFileText } from "react-icons/ai";
import { MdOutlineLibraryBooks } from "react-icons/md";

const userDetails = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
const tabOptions = [
  {
    key: "Forms Library",
    label: "Forms Library",
    icon: <MdOutlineLibraryBooks />,
  },
  { key: "Reports", label: "Reports", icon: <AiOutlineFileText /> },
  // { key: "Dashboards", label: "Dashboards", icon: <AiOutlineDashboard /> },
  ...(userDetails?.organization?.realmName === "beml"
    ? [
        {
          key: "View",
          label: "View",
          icon: <AiOutlineDashboard />,
        },
      ]
    : []),
];

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

const SideNavbar = ({
  activeTab,
  setActiveTab,
  collapseLevel,
}: //   isSettingsAccess,
//   onSettingsClick,
any) => {
  const classes = useStyles();

  //   const filteredTabs = tabOptions.filter(
  //     (tab) => tab.key !== "settings" || isSettingsAccess
  //   );

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

export default SideNavbar;
