import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  tabsWrapper: {
    "& .ant-tabs .ant-tabs-tab": {
      padding: "12px 9px",
      backgroundColor: "#F3F6F8",
      color: "#0E497A",
      fontSize: "14px",
      fontWeight: 600,
      letterSpacing: "0.8px",
    },
    "& .ant-tabs-tab-active": {
      padding: "12px 9px",
      backgroundColor: "#006EAD !important",
      color: "#fff !important",
      fontSize: "14px",
      fontWeight: 600,
      letterSpacing: "0.8px",
    },
    "& .ant-tabs-tab-active div": {
      color: "white !important",
      fontWeight: 600,
      fontSize: "14px",
      letterSpacing: "0.8px",
    },
    "& .ant-tabs .ant-tabs-tab+.ant-tabs-tab": {
      margin: "0 0 0 25px",
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
