import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  hoverText: {
    fontSize: "0.75rem",
    cursor: "pointer",

    "&:hover": {
      textDecoration: "underline",
    },
  },
  popover: {
    pointerEvents: "none",
  },
  paper: {
    padding: 10,
    borderRadius: 5,
    maxWidth: 300,
    minWidth: 300,
    width: 300,
  },
  imgContainer: {
    width: 50,
    height: 50,
    marginLeft: 7,
    borderRadius: 500,
    overflow: "hidden",
  },
  avatar: {
    color: theme.textColor.primary,
    backgroundColor: "white",
    width: "100%",
    height: "100%",
  },
  bottomInfo: {
    fontSize: "0.7rem",
    marginTop: 10,
    textAlign: "center",
  },
}));

export default useStyles;
