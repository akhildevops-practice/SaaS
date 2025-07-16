import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  paper: {
    backgroundColor: "#FFFFFF",
    marginLeft: theme.typography.pxToRem(2),
    padding: theme.typography.pxToRem(20),
    marginTop: theme.typography.pxToRem(-20),
    height: "100%",
  },
  btn: {
    // marginBottom: theme.typography.pxToRem(10)
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.typography.pxToRem(20),
    paddingTop: "10px",
  },
  discardBtn: {
    // color: theme.palette.primary.light,
    // backgroundColor: "#F7F7FF",
    // border: `1px solid ${theme.palette.primary.light}`,
    // width: theme.typography.pxToRem(87),
    // height: theme.typography.pxToRem(34),
    // marginRight: "1rem",
    backgroundColor: "#F1F8FD",
    color: "#0E497A",
    width: theme.typography.pxToRem(87),
    height: theme.typography.pxToRem(38),
  },
  submitBtn: {
    // backgroundColor: "#E8F3F9",
    // color: theme.palette.primary.main,
    // fontSize: "14px",
    // width: theme.typography.pxToRem(87),
    // height: theme.typography.pxToRem(34),
    // marginLeft: theme.typography.pxToRem(10),
    // "&:hover": {
    //   backgroundColor: "#0E497A",
    //   color: "#fff",
    // },
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
  buttonGroup: {
    // paddingLeft: theme.typography.pxToRem(2)
    display: "inline",
    marginLeft: "1rem",
  },
  formContainer: {
    padding: "0 20px 20px 20px",
    // backgroundColor: "#F7F7FF",
    backgroundColor: "#FFFFFF",
    borderRadius: theme.typography.pxToRem(10),
  },
  btnHide: {
    visibility: "hidden",
  },
}));

export default useStyles;
