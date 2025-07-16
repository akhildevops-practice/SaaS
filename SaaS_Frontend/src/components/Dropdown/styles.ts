import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  fabButton: {
    position: "absolute",
    top: 137,
    right: 30,
    backgroundColor: theme.palette.primary.light,
    color: "#fff",

    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    },
  },
  menu: {
    minWidth: "150px",
  },
}));

export default useStyles;
