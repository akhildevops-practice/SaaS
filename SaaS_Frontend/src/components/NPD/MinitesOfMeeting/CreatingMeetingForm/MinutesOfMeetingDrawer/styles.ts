import { makeStyles, Theme } from "@material-ui/core/styles";
// export interface StyleProps {
//   detailsDrawer: string;
// }

const useStyles = makeStyles((theme: Theme) => ({
   header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 1em',
    borderBottom: '1px solid #ddd',
    backgroundColor: '#f5f5f5',
    height: '50px',
    // add other styles...
  },
  descriptionLabelStyle : {
    "& .ant-descriptions-item-label": {
      color: "#003566 !important",
      fontWeight: "bold",
      letterSpacing: "0.8px",
      // Add any other styles you want to apply to the label inside Descriptions.Item
    },
    "& .ant-form-item .ant-form-item-label > label": {
      color: "#003566",
      fontWeight: "bold",
      letterSpacing: "0.8px",
      backgroundColor:"#F1F8E9",
      // Add any other styles you want to apply to the label inside Form.Item
    },
    "& .ant-input-lg": {
      border: "1px solid #dadada",
    },
    "&.ant-descriptions .ant-descriptions-view" :{
      width: "100%",
      borderTopLeftRadius:"0px",
      borderTopRightRadius:"0px",
      borderBottomRightRadius:"0px",
      borderBottomLeftRadius:"0px",
      /* border-radius: 8px; */
  }
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
      padding: "5px 7px",
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
  nextButton: {
    backgroundColor: "#0E497A",
    color: "#FFFFFF",
    width: "auto",
    height: theme.typography.pxToRem(38),
    marginLeft: theme.typography.pxToRem(10),
    minHeight: "32px",
    "&:hover": {
      backgroundColor: "#0E497A",
      color: "#FFFFFF",
    },
    display: "flex",
    justifyContent:"space-between",
    gap: "5px",
    alignItems: "center",
  },
  docDetailsDrawer: {
    "& .ant-drawer-header": {
      backgroundColor: "aliceblue",
      textAlign: "center",
      padding: "10px 20px",
      borderBottom: "none",
    },
    "& .ant-drawer .ant-drawer-body":{
        padding:"14px",
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
}));

export default useStyles;