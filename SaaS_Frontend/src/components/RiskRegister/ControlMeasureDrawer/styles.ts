import { makeStyles, Theme } from "@material-ui/core/styles";
// import { useMediaQuery } from "@material-ui/core";
// const isSmallScreen = useMediaQuery("(max-width:600px)");
const useStyles = makeStyles((theme: Theme) => ({
  drawerHeader: {
    "& .ant-drawer-wrapper-body": {
      // backgroundColor : "#F0F8FF !important"
    },
    "& .ant-drawer-header": {
      backgroundColor: "#F0F8FF !important",
      padding: "16px 15px",
      [theme.breakpoints.down("xs")]: {
        padding: "16px 7px",
      },
    },
  },
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
}));

export default useStyles;
