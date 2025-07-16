import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    height: "100%",
    backgroundColor: "#FFFFFF",
    position: "relative",
  },
  stepperContainer: {
    display: "flex",
    justifyContent: "center",
  },
  stepper: {
    width: "50%",
    [theme.breakpoints.down("sm")]: {
      paddingTop: "80px",
      justifyContent: "center",
    },
  },
  stepperNavNextButton: {
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
  stepperNavBackButton: {
    backgroundColor: "#F1F8FD",
    color: "#0E497A",
    width: theme.typography.pxToRem(87),
    height: theme.typography.pxToRem(38),
  },
  instructions: {
    padding: theme.typography.pxToRem(12),
    marginTop: theme.typography.pxToRem(12),
  },
  buttonSection: {
    position: "absolute",
    zIndex: 0,
    right: theme.typography.pxToRem(25),
    marginTop: theme.typography.pxToRem(18),
    [theme.breakpoints.down("sm")]: {
      right: "10px",
    },
  },

  reveiwAndCloseButtonSection: {
    position: "absolute",
    zIndex: 0,
    right: theme.typography.pxToRem(25),
    marginTop: theme.typography.pxToRem(-25),
  },
  completed: {
    display: "inline-block",
  },
  paper: {
    backgroundColor: "#F7F7FF",
    marginLeft: theme.typography.pxToRem(2),
    padding: theme.typography.pxToRem(20),
    marginTop: theme.typography.pxToRem(2),
    borderRadius: theme.typography.pxToRem(10),
    height: "100%",
  },
  hideStepper: {
    display: "none",
  },
  header: {
    display: "flex",
    alignItems: "center",
    height: 50,
    paddingLeft: theme.spacing(4),
  },
  stepperFont: {
    fontSize: theme.typography.pxToRem(13),
  },
  backBtn: {
    color: theme.palette.primary.light,
    marginTop: theme.typography.pxToRem(20),
    marginRight: theme.typography.pxToRem(100),
    position: "absolute",
    zIndex: 1,
  },
  backBtnMobile: {
    color: theme.palette.primary.light,
    marginTop: theme.typography.pxToRem(8),
    right: 26,
    position: "absolute",
    zIndex: 1,
  },
  spaceDiv: {
    marginTop: theme.typography.pxToRem(26),
  },
  submitBtn: {
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
}));

export default useStyles;
