import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  form: {
    padding: theme.typography.pxToRem(20),
    borderRadius: theme.typography.pxToRem(10),
    backgroundColor: "#FFFFFF",
    minHeight: "100%",
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
    paddingTop: theme.typography.pxToRem(60),
  },
  chips: {
    marginLeft: `${theme.typography.pxToRem(10)} !important`,
    marginBottom: `${theme.typography.pxToRem(10)} !important`,
    color: `${theme.textColor.white} !important`,
    backgroundColor: `${theme.palette.primary.light} !important`,
    fontSize: `${theme.typography.pxToRem(12)} !important`,
  },
  deleteIcon: {
    color: `${theme.textColor.white} !important`,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

export default useStyles;
