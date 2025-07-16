import { makeStyles, Theme } from "@material-ui/core/styles";
export interface StyleProps {
  isGraphSectionVisible: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 1em",
    borderBottom: "1px solid #ddd",
    backgroundColor: "#f5f5f5",
    height: "50px",
    // add other styles...
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
  docDetailsDrawer: {
    "& .ant-drawer-header": {
      backgroundColor: "aliceblue",
      textAlign: "center",
      padding: "10px 20px",
      borderBottom: "none",
    },
    // "& .ant-drawer-content": {
    borderBottomRightRadius: "10px",
    borderBottomLeftRadius: "10px",
    // },
  },
  starIcon: {
    color: "#FF0000",
    marginRight: "30px",
    width: "32px",
    height: "35px",
    cursor: "pointer",
  },
  auditTrailIcon: {
    fill: "#0E497A",
    cursor: "pointer",
    width: "35px",
    height: "35px",
    marginRight: "30px",
  },
  docInfoIcon: {
    marginRight: "30px",
    width: "30px",
    height: "35px",
    cursor: "pointer",
  },
  expandIcon: {
    marginRight: "30px",
    width: "22px",
    height: "36px",
    cursor: "pointer",
  },
  commentsIcon: {
    fill: "#0E497A",
    cursor: "pointer",
    width: "28px",
    height: "37px",
    marginRight: "30px",
  },
  "& span.ant-tag": {
    display: "flex",
    width: "89px",
    padding: "5px 0px",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "10px",
    color: "white",
  },
  switch: {
    marginTop: "2%",
  },
  submitBtn: {
    backgroundColor: "#003566 !important",
    height: "36px",
  },
  cancelBtn: {
    height: "36px",
    "&.hover": {
      color: "#003566 !important  ",
    },
  },
  formBox: {
    width: "100%",
    paddingBottom: theme.typography.pxToRem(25),
    fontFamily: "poppins",
    fontSize: theme.typography.pxToRem(11),
  },
  labelStyle: {
    "& .ant-input-lg": {
      border: "1px solid #dadada",
    },
    "& .ant-form-item .ant-form-item-label > label": {
      color: "#003566",
      fontWeight: "bold",
      letterSpacing: "0.8px",
    },
    "& .ant-input-disabled, & .ant-select-disabled, & .ant-select-disabled .ant-select-selector,":
      {
        color: "black !important",
      },
  },
  filename: {
    fontSize: theme.typography.pxToRem(12),
    color: theme.palette.primary.light,
    textOverflow: "ellipsis",
    overflow: "hidden",
    width: "160px",
    whiteSpace: "nowrap",
    cursor: "pointer",
    "&:hover": {
      cursor: "pointer", // Change cursor to pointer on hover
    },
  },
}));

export default useStyles;
