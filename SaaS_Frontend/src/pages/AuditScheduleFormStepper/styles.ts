import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    maxHeight: "100%",
    // maxHeight: "calc(80vh - 12vh)", // Adjust the max-height value as needed
    overflowY: "auto",
    "&::-webkit-scrollbar": {
      width: "8px",
      height: "10px", // Adjust the height value as needed
      backgroundColor: "#e5e4e2",
    },
    "&::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "grey",
    },
    paddingTop: theme.typography.pxToRem(20),
  },
  tabsWrapper: {
    "& .ant-tabs-tab": {
      backgroundColor: "#E3E8F9 !important",
      color: "black !important",
    },
    "& .ant-tabs-tab-active": {
      backgroundColor: "#003566 !important",
    },
    "& .ant-tabs-tab-active div": {
      color: "white !important",
      fontWeight: "500",
    },
  },
  previousButton: {
    fontSize: 14,
    fontWeight: 400,
    color: "#003566",
    background: "transparent",
    border: "1px solid #003566",
    marginRight: 8,
    "&:hover": {
      color: "white !important",
      background: "#003566 !important",
      border: "1px solid #003566 !important",
    },
  },
  colorFilledButton: {
    fontSize: 14,
    fontWeight: 400,
    color: "white",
    background: "#003566",
    border: "none",
    "&:hover": {
      color: "white !important",
      background: "#003566 !important",
    },
  },
  formTextPadding: {
    paddingBottom: theme.typography.pxToRem(10),
    fontSize: theme.typography.pxToRem(14),
    color: "#003566",
    verticalAlign: "middle",
    fontWeight: "bold",
  },
  formBox: {
    width: "100%",
    paddingBottom: theme.typography.pxToRem(25),
  },
  submitBtn: {
    backgroundColor: "#0E497A",
    color: "#FFFFFF",
    width: theme.typography.pxToRem(87),
    height: theme.typography.pxToRem(38),
    marginLeft: theme.typography.pxToRem(10),
    "&:hover": {
      backgroundColor: "#0E497A",
      color: "#FFFFFF",
    },
  },
  formControl: {
    minWidth: "100%",
  },
}));

export default useStyles;
