import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  loader: {
    height: "60vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  topSectionLeft: {
    width: "40%",
    [theme.breakpoints.down("sm")]: {
      width: "60%",
    },
    display: "flex",
    justifyContent: "space-even",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.typography.pxToRem(20),
    paddingTop: "10px",
  },
  docTypeForm: {
    "& :where(.ant-form-vertical) .ant-form-item-label": {
      padding: "0px !important",
    },
  },
  wrapper: {
    backgroundColor: "#f4f4f5",
    borderRadius: 6,
    padding: "2px 3px",
    margin: "19px 0.4px 22px 0",
    width: "fit-content",
  },
  tabBarStyle: {
    display: "flex",
    gap: "8px",
  },
  tabItem: {
    width: "132px",
    height: "36px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "2px",
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    fontWeight: 500,
    fontSize: "14px",
  },
  customTabWrapper: {
    backgroundColor: "#f4f4f5",
    borderRadius: 6,
    padding: "2px 3px",
    margin: "19px 0.4px 22px 0",
    display: "flex",
    gap: "6px",
    width: "fit-content",
  },
  customTab: {
    width: "180px",
    height: "36px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "2px",
    fontWeight: 500,
    fontSize: "14px",
    backgroundColor: "#f4f4f5",
    cursor: "pointer",
    transition: "all 0.2s ease-in-out",
  },
  activeTab: {
    backgroundColor: "#fff",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
}));

export default useStyles;
