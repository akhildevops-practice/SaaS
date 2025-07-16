import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    "& input::placeholder": {
      fontSize: theme.typography.pxToRem(14),
    },
    marginBottom: theme.typography.pxToRem(8),
  },
  input: {
    width: "100%",
  },
  resize: { fontSize: theme.typography.pxToRem(14) },
  iconButton: {
    paddingLeft: "1rem",
    color: "black",
  },
}));

export default useStyles;
