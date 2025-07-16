import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  tabsWrapper: {
    "& .ant-tabs-tab": {
      backgroundColor: "#e3e8f9 !important",
      color: "black !important",
    },
    "& .ant-tabs-tab-btn": {
      letterSpacing: "0.6px",
    },
    "& .ant-tabs-tab-active": {
      backgroundColor: "#003566 !important",
    },
    "& .ant-tabs-tab-active div": {
      color: "white !important",
      fontWeight: "500",
    },
  },
  tabHeader: {
    display: "flex",
    flexWrap: "wrap",
  },
  tab: {
    padding: "8px 8px",
    backgroundColor: "#F3F6F8",
    color: "#0E497A",
    fontSize: "14px",
    fontWeight: 600,
    letterSpacing: "0.8px",
    cursor: "pointer",
    flex: "1 1 20%", // 25% for the first four tabs
    textAlign: "center",
    border: "1px solid #E0E0E0",
    boxSizing: "border-box",
    borderRadius: "5%",
    "&:hover": {
      backgroundColor: "#E0E0E0",
    },
  },
  tabActive: {
    backgroundColor: "#006EAD !important",
    color: "#fff !important",
  },
  tabContent: {
    marginTop: "20px",
  },
}));

export default useStyles;
