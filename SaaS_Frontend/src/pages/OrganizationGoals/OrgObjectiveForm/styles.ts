import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  form: {
    padding: theme.typography.pxToRem(15),
    borderRadius: theme.typography.pxToRem(10),
    backgroundColor: "#FFFFFF",
    minHeight: "100%",
    // margin: theme.typography.pxToRem(20),
    marginTop: theme.typography.pxToRem(0),
    marginBottom: theme.typography.pxToRem(20),
  },
  formTextPadding: {
    color: "#0E0A42",
    padding: theme.typography.pxToRem(14),
    fontSize: theme.typography.pxToRem(13),
  },
  formBox: {
    width: "100%",
    paddingBottom: theme.typography.pxToRem(25),
  },
  discardBtn: {
    marginRight: 16,
    paddingLeft: 12,
    paddingRight: 12,
    fontSize: theme.typography.pxToRem(13),
    backgroundColor: theme.textColor.white,
    borderRadius: theme.typography.pxToRem(5),
    border: `1px Solid ${theme.palette.primary.light}`,
    color: theme.palette.primary.light,
    [theme.breakpoints.up("sm")]: {
      paddingLeft: 18,
      paddingRight: 18,
      fontSize: theme.typography.pxToRem(12),
    },
    "&:hover": {
      backgroundColor: theme.palette.primary.light,
      color: theme.textColor.white,
    },
  },
  buttonSection: {
    display: "flex",
    justifyContent: "center",
    paddingTop: theme.typography.pxToRem(10),
  },
  formSelect: {
    width: "100%",
    // marginLeft: theme.typography.pxToRem(45),
  },
}));

export default useStyles;
