import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: theme.typography.pxToRem(10),
    marginBottom: theme.typography.pxToRem(20),
  },
  discardBtn: {
    color: theme.palette.primary.light,
    border: `1px solid ${theme.palette.primary.light}`,
    width: theme.typography.pxToRem(87),
    height: theme.typography.pxToRem(34),
  },
  submitBtn: {
    backgroundColor: theme.palette.primary.light,
    color: "#fff",
    width: theme.typography.pxToRem(87),
    height: theme.typography.pxToRem(34),
    marginLeft: theme.typography.pxToRem(10),
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    },
  },
  buttonGroup: {
    display: "inline",
    marginLeft: "1rem",
  },
  formContainer: {
    borderRadius: theme.typography.pxToRem(10),
  },
  formContainerMobileView: {
    paddingTop: theme.typography.pxToRem(20),
  },
  btnHide: {
    visibility: "hidden",
  },
}));
