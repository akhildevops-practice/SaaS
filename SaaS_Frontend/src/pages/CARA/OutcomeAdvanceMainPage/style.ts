import { makeStyles, Theme } from "@material-ui/core/styles";
const useStyles = makeStyles<Theme>((theme: Theme) => ({
  mainPageContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    marginTop: "30px",
  },
  tabContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
  },
  tabsWrapper: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    // paddingLeft: "15%",
    "& .ant-tabs-nav": {
      display: "flex",
      justifyContent: "center",
      width: "100%", // Ensures the entire tab nav is centered
    },
    "& .ant-tabs-nav-list": {
      display: "flex",
      justifyContent: "center", // Ensures the tab names are centered
      width: "fit-content", // Makes sure it doesn't stretch
      margin: "0 auto", // Centers the tab list within its container
      gap: "1px", // Adjust spacing between tabs
      border: "1px solid  #cacaca",
      padding: "8px 4px",
      borderRadius: "8px",
    },
    ".ant-tabs-card.ant-tabs-top >.ant-tabs-nav .ant-tabs-tab": {
      borderRadius: "8px 8px",
    },
    "&.ant-tabs-card.ant-tabs-top >.ant-tabs-nav .ant-tabs-tab": {
      borderRadius: "8px 8px 8px 8px",
    },

    "& .ant-tabs-tab": {
      backgroundColor: "white !important",
      color: "black !important",
      padding: "15px 14px",
      borderRadius: "8px",
    },
    "&.ant-tabs .ant-tabs-tab+.ant-tabs-tab": {
      margin: "0px 0px 0px 0px",
    },
    "& .ant-tabs-tab-btn": {
      letterSpacing: "0.8px",
      fontSize: "16px",
      fontWeight: 600,
      fontFamily: "Poppins",
    },
    "& .ant-tabs-tab-active": {
      backgroundColor: "#3576ba !important",
    },
    "& .ant-tabs-tab-active div": {
      color: "white !important",
      fontWeight: "500",
    },
  },
}));

export default useStyles;
