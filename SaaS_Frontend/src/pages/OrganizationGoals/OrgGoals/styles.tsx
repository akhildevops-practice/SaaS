import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  // root: {
  //   borderRadius: theme.typography.pxToRem(10),
  //   backgroundColor: "#FFFFFF",
  //   minHeight: "20vh",
  //   width: "100%",
  // },
  root: {
    width: "100%",
    // maxHeight: "100%",
    maxHeight: "calc(80vh - 12vh)",
    overflowY: "auto",
    overflowX: "hidden",
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
  title: {
    padding: theme.typography.pxToRem(10),
    fontSize: theme.typography.pxToRem(20),
    color: theme.palette.primary.main,
  },
  chipStyle: {
    backgroundColor: "#F7F7FF !important",
    borderRadius: `${theme.typography.pxToRem(5)} !important`,
    minWidth: `${theme.typography.pxToRem(200)} !important`,
    margin: `${theme.typography.pxToRem(20)} !important`,
    padding: `${theme.typography.pxToRem(20)} !important`,
  },
  tableSection: {
    display: "flex",
    justifyContent: "center",
  },
  table: {
    width: "100%",
    // paddingTop: theme.typography.pxToRem(30),
    paddingBottom: theme.typography.pxToRem(30),
    fontSize: "14px !important",
    // padding: "20px",
  },
  displaySection: {
    padding: theme.typography.pxToRem(20),
    backgroundColor: "#F7F7FF",
  },
  loader: {
    display: "flex",
    justifyContent: "center",
  },
  paper: {
    position: "absolute",
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  fabButton: {
    backgroundColor: theme.palette.primary.light,
    color: "#fff",
    margin: "0 5px",
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    },
  },

  buttonStyle: {
    backgroundColor: "#003059",
    color: "white !important",
    marginRight: "1%",
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    },
  },
  dialogBtnSection: {
    [theme.breakpoints.down("sm")]: {
      marginTop: theme.typography.pxToRem(40),
    },
  },
  imgContainer: {
    display: "flex",
    justifyContent: "center",
  },
  emptyDataText: {
    fontSize: theme.typography.pxToRem(14),
    color: theme.palette.primary.main,
  },
}));

export default useStyles;
