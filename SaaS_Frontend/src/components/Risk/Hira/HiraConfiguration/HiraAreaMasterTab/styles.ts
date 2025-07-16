import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  form: {
    padding: theme.typography.pxToRem(20),
    borderRadius: theme.typography.pxToRem(10),
    backgroundColor: "#FFFFFF",
    minHeight: "100%",
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
  selectLabel: {
    fontSize: theme.typography.pxToRem(16),
    fontWeight: "bold",
    marginBottom: theme.spacing(1),
    color: "#4C5862",
    textAlign: "left",
  },
  antSelect: {
    width: 200, // Adjust width as needed
    // Additional styling if needed
  },
  emptyTableImg: {
    display: "flex",
    justifyContent: "center",
  },
  emptyDataText: {
    fontSize: theme.typography.pxToRem(14),
    color: theme.palette.primary.main,
  },
  formItem: {
    margin: 0, // Adjust margin as needed
    // Additional styling for Form.Item if needed
  },
  tableHeader: {
    "& .MuiTableCell-head": {
      padding: "4px 8px 3px 10px",
      whiteSpace: "nowrap",
      backgroundColor: "#E8F3F9 !important", // Set your desired background color
      color: "#003566 !important",
      textAlign: "left",
      borderBottom: "1px solid #003059",
    },
  },
  paper: {
    width: "100%",
    // borderRadius: 7,
    overflow: "hidden",
    marginBottom: theme.spacing(2),
    // boxShadow: "0px 0px 10px rgba(0,0,0,0.2)", // Box shadow for the table
  },
  table: {
    minWidth: 750,
    border: "1px solid #e0e0e0", // Border for the table
    borderRadius: 7, // Rounded corners for the table
    "& .MuiTableCell-body": {
      textAlign: "left", // Left-aligned columns
      borderBottom: "1px solid #f0f0f0",
    },
  },
  NavDivider: {
    height: "1.4em",
    background: "gainsboro",
  },
  root: {
    width: "100%",
    // maxHeight: "100%",
    maxHeight: "90vh",
    overflowX: "hidden",
    overflowY: "auto",
    "&::-webkit-scrollbar": {
      width: "8px",
      height: "10px",
      backgroundColor: "#e5e4e2",
    },
    "&::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "grey",
    },
    paddingTop: theme.typography.pxToRem(20),
  },
  formTextPadding: {
    paddingBottom: theme.typography.pxToRem(10),
    fontSize: theme.typography.pxToRem(14),
    color: "#4C5862",
  },
  labelContainer: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "baseline",
  },
  tableLabel: {
    fontSize: theme.typography.pxToRem(20),
    fontWeight: 600,
    // marginBottom: theme.spacing(2),
    color: "#003566 !important",
    textAlign: "left",
  },
  buttonColor: {
    // marginBottom: theme.spacing(2),
    textAlign: "left",
    
    marginRight: 16,
    paddingLeft: 12,
    paddingRight: 12,
    fontSize: theme.typography.pxToRem(13),
    backgroundColor: theme.textColor.white,
    borderRadius: theme.typography.pxToRem(5),
    borderColor: theme.palette.primary.light,
    color: theme.palette.primary.light,
    [theme.breakpoints.up("sm")]: {
      paddingLeft: 18,
      paddingRight: 18,
      fontSize: theme.typography.pxToRem(13),
    },
    "&:hover": {
      backgroundColor: theme.palette.primary.light,
      color: theme.textColor.white,
    },
  },
  selectFormControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  formBox: {
    width: "100%",
    paddingBottom: theme.typography.pxToRem(25),
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
  pagination: {
    position: "fixed",
    bottom: "3px",
    right: "0",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "inherit",
    padding: theme.spacing(1),
  },
}));

export default useStyles;
