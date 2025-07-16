import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  tabsAndInfoWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  userInfo: {
    display: "flex",
    alignItems: "center",
  },
  drawer: {
    "& .ant-drawer-right>.ant-drawer-content-wrapper": {
      transform: "translateX(-4px) !important",
      width: "400px !important",
      // transform : ({detailsDrawer}) => detailsDrawer ? "translateX(0px) !important" : "none"
    },
    "& .ant-drawer-wrapper-body": {
      // backgroundColor : "#F0F8FF !important"
    },
    "& .ant-drawer-header": {
      backgroundColor: "#e8f3f9",
      borderBottom: "1px solid rgb(0,0,0,0.20)",
      padding: "10px 7px",
      "& .ant-drawer-header-title .anticon anticon-close": {
        color: "white",
      },
      "& .ant-btn-default": {
        backgroundColor: "#e8f3f9",
        borderColor: "#0e497a",
        "& svg": {
          color: "#0e497a",
        },
      },
    },
  },
  tabsWrapper: {
    overflowY: "scroll",
    overflowX: "hidden",
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
