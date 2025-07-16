import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    // paddingTop: theme.typography.pxToRem(30)
  },
  buttonColor: {
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
  form: {
    padding: theme.typography.pxToRem(20),
    borderRadius: theme.typography.pxToRem(10),
    backgroundColor: "#FFFFFF",
    minHeight: "40vh",
  },
  formTextPadding: {
    color: "#0E0A42",
    padding: theme.typography.pxToRem(14),
    fontSize: theme.typography.pxToRem(13),
  },
  formBox: {
    width: "100%",
    paddingBottom: theme.typography.pxToRem(25),
    color: "black",
  },
  discardBtn: {
    fontSize: theme.typography.pxToRem(13),
    color: theme.palette.primary.light,
    marginRight: theme.typography.pxToRem(20),
  },
  buttonSection: {
    display: "flex",
    justifyContent: "flex-end",
    paddingTop: 100,
  },
  formControl: {
    minWidth: "100%",
  },
  formBottomSection: {
    marginTop: theme.typography.pxToRem(20),
  },
  submitButton: {
    background: theme.palette.primary.light,
    marginLeft: 10,
    "&:hover": {
      background: theme.palette.primary.main,
    },
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      margin: 0,
    },
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.typography.pxToRem(20),
    paddingTop: "10px",
  },
  // formTextPadding1: {
  //   // padding: theme.typography.pxToRem(7),
  //   fontSize: theme.typography.pxToRem(13),
  //   textAlign:theme.typography.t
  // },
  // formBox2: {
  //   width: "100%",
  //   paddingBottom: theme.typography.pxToRem(25),
  // },
}));

export default useStyles;
