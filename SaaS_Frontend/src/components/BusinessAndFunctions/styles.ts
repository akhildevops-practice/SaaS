import { makeStyles } from "@material-ui/core/styles";

 const useStyles = makeStyles((theme) => ({

  form: {
    padding: theme.typography.pxToRem(10),
    borderRadius: theme.typography.pxToRem(10),
    backgroundColor: "#FFFFFF",
    minHeight: "100%",
  },
  tabsWrapper: {
    "& .ant-tabs-tab": {
      backgroundColor: "#e3e8f9 !important",
      color: "black !important",
      // margin: "0 !important",
      borderRadius: "8px",
      border: "1px solid #d9d9d9",
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
    "& .ant-tabs-card.ant-tabs-left >.ant-tabs-nav .ant-tabs-tab":{
      borderRadius: "8px",
      margin:"0px 0px 0px 200px",
      padding:"10px 35px"
     
    },
  },
  formTextPadding: {
    paddingBottom: theme.typography.pxToRem(10),
    paddingTop: theme.typography.pxToRem(10),
    fontSize: theme.typography.pxToRem(14),
    color: "#4C5862",
  },
  formBox: {
    width: "100%",
    paddingBottom: theme.typography.pxToRem(10),
    // paddingTop: theme.typography.pxToRem(10),
  },
  formSelect: {
    width: "100%",
  },
  discardBtn: {
    fontSize: theme.typography.pxToRem(13),
    color: theme.palette.primary.light,
    marginRight: theme.typography.pxToRem(20),
  },
  buttonSection: {
    display: "flex",
    justifyContent: "flex-end",
    paddingTop: theme.typography.pxToRem(60),
  },
  chips: {
    marginLeft: `${theme.typography.pxToRem(10)} !important`,
    marginBottom: `${theme.typography.pxToRem(10)} !important`,
    color: `${theme.textColor.white} !important`,
    backgroundColor: `${theme.palette.primary.light} !important`,
    fontSize: `${theme.typography.pxToRem(12)} !important`,
  },
  deleteIcon: {
    color: `${theme.textColor.white} !important`,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

export const useSystemStyles = makeStyles((theme) => ({

  form: {
    padding: theme.typography.pxToRem(20),
    borderRadius: theme.typography.pxToRem(10),
    backgroundColor: "#FFFFFF",
    minHeight: "100%",
  },
  formTextPadding: {
    paddingBottom: theme.typography.pxToRem(10),
    fontSize: theme.typography.pxToRem(14),
    color: "#4C5862",
  },
  formBox: {
    width: "100%",
    paddingBottom: theme.typography.pxToRem(25),
  },
  formSelect: {
    width: "60%",
  },
  discardBtn: {
    fontSize: theme.typography.pxToRem(13),
    color: theme.palette.primary.light,
    marginRight: theme.typography.pxToRem(20),
  },
  buttonSection: {
    display: "flex",
    justifyContent: "flex-end",
    paddingTop: theme.typography.pxToRem(60),
  },
  chips: {
    marginLeft: `${theme.typography.pxToRem(10)} !important`,
    marginBottom: `${theme.typography.pxToRem(10)} !important`,
    color: `${theme.textColor.white} !important`,
    backgroundColor: `${theme.palette.primary.light} !important`,
    fontSize: `${theme.typography.pxToRem(12)} !important`,
  },
  deleteIcon: {
    color: `${theme.textColor.white} !important`,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
 
}));

export const tabsStyles = makeStyles ((theme=>({
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
})))

export  default  useStyles


