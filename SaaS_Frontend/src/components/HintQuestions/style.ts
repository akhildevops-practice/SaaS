import { makeStyles, withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import { InputBase } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  label: {
    fontSize: theme.auditFont.medium,
    minWidth: "150px",
    paddingRight: theme.spacing(2),
    paddingTop: "10px",
  },
  text: {
    fontSize: theme.auditFont.medium,
  },
  scoreContainer: {
    border: "1px solid #08ae2d",
    padding: "0px 10px",
    borderRadius: "5px",
  },
  select: {
    width: 80,
    height: 42,
    backgroundColor: "#F8F8F8",
    "& :focus": {
      backgroundColor: theme.palette.background.paper,
    },
  },
}));

export default useStyles;

export const NumberTextField = withStyles({
  root: {
    width: 70,
    height: 42,
    "& .MuiFormHelperText-root.Mui-error": {
      position: "absolute",
      width: "max-content",
      top: "50px",
      left: "-15px",
    },
  },
})(TextField);

export const ScoreTextField = withStyles({
  root: {
    width: 70,
    height: 42,
  },
})(InputBase);
