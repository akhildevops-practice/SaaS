import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  form: {
    padding: theme.typography.pxToRem(20),
    borderRadius: theme.typography.pxToRem(10),
    backgroundColor: "#FFFFFF",
    minHeight: "100%",
  },
  formTextPadding: {
    paddingBottom: theme.typography.pxToRem(16),
    fontSize: theme.typography.pxToRem(14),
    color: "#003566",
    paddingTop: theme.typography.pxToRem(16),
  },
  formControl: {
    minWidth: "100%",
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  cron: {
    display: "flex",
    // minWidth: "100%",
    alignItems: "center",
    // paddingBottom: theme.typography.pxToRem(14),
    fontSize: theme.typography.pxToRem(14),
    color: "#003566",
    // paddingTop: theme.typography.pxToRem(14),
  },
}));

export default useStyles;
