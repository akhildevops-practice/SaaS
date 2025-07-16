import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
  box: {
    display: "block",
    position: "fixed",
    top: "49%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    maxHeight: "90vh",
    border: "7px solid white",
    width: "90%",
    background: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    borderRadius: 10,
    outline: "none",
    overflowY: "scroll",

    "&::-webkit-scrollbar": {
      width: 5,
      borderRadius: 50,
    },
    "&::-webkit-scrollbar-track": {
      backgroundColor: "transparent",
      borderRadius: 50,
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "#bbb",
      borderRadius: 50,
      "&:hover": {
        background: "#888",
      },
    },
  },
  header: {
    position: "sticky",
    top: 0,
    margin: "13px 0",
    padding: "7px 0",
    background: "white",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 1,
  },
  title: {
    fontSize: "1.3rem",
    fontWeight: 700,
    color: theme.palette.primary.main,
    paddingLeft: 20,
  },
}));
