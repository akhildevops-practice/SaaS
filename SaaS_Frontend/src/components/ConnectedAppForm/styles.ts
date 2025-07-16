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
    color: "#0E497A",
    backgroundColor: "#F1F8FD",
  },
  buttonSection: {
    display: "flex",
    justifyContent: "flex-end",
    paddingTop: theme.typography.pxToRem(60),
  },
  formControl: {
    minWidth: "100%",
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  deleteButton: {
    background: theme.palette.error.main,
    color: "white",
    marginLeft: 10,
    "&:hover": {
      background: theme.palette.error.light,
    },
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      margin: 0,
    },
  },
  testButton: {
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
}));

export default useStyles;
