import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  draftButton: {
    backgroundColor: theme.palette.primary.light,
    color: "white",
    marginLeft: 9,
    width: 87,

    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    },

    [theme.breakpoints.down("sm")]: {
      width: 0,
    },
  },
  deleteButton: {
    backgroundColor: theme.palette.error.main,
    color: "white",
    width: 87,

    "&:hover": {
      backgroundColor: theme.palette.error.dark,
    },

    [theme.breakpoints.down("sm")]: {
      width: 0,
    },
  },
  modifiedText: {
    [theme.breakpoints.down("sm")]: {
      fontSize: "0.85rem",
    },
  },
}));

export default useStyles;
