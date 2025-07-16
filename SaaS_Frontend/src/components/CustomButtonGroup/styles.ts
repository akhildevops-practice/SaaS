import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  btnGrp: {
    height: theme.typography.pxToRem(35),
  },
  btn: {
    width: theme.typography.pxToRem(150),
    backgroundColor: "#E8F3F9",
    fontSize: "13px",
    "&:hover": {
      backgroundColor: "#0E0A42",
      color: "#fff",
    },
    color: theme.palette.primary.light,
  },
  btnGrpColors: {
    backgroundColor: "#6E7DAB",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#0E0A42",
    },
  },
}));

export default useStyles;
