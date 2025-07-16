import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
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
    width: "60%",
    paddingBottom: theme.typography.pxToRem(25),
  },
  discardBtn: {
    fontSize: theme.typography.pxToRem(13),
    color: "#0E497A",
    backgroundColor: "#F1F8FD",
  },
  buttonSection: {
    display: "flex",
    justifyContent: "flex-end",
    paddingTop: theme.typography.pxToRem(10),
  },
}));

export default useStyles;
