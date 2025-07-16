import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  form: {
    padding: theme.typography.pxToRem(10),
    borderRadius: theme.typography.pxToRem(10),
    paddingTop: theme.typography.pxToRem(20),
    backgroundColor: "#FFFFFF",
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
    paddingTop: 100,
  },
  formControl: {
    minWidth: "100%",
  },
  roleSelectFormControl: {
    width: 240,
  },
}));

export default useStyles;
