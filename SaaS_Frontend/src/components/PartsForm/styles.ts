import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  form: {
    padding: theme.typography.pxToRem(20),
    borderRadius: theme.typography.pxToRem(10),
    backgroundColor: "#FFFFFF",
    minHeight: "40vh",
  },
  formTextPadding: {
    padding: theme.typography.pxToRem(14),
    fontSize: theme.typography.pxToRem(13),
  },
  formBox: {
    width: "100%",
    paddingBottom: theme.typography.pxToRem(25),
  },
  discardBtn: {
    fontSize: theme.typography.pxToRem(13),
    color: theme.palette.primary.light,
    marginRight: theme.typography.pxToRem(20),
  },
  buttonSection: {
    display: "flex",
    justifyContent: "flex-end",
    paddingTop: 20,
  },
  formControl: {
    minWidth: "100%",
  },
}));

export default useStyles;
