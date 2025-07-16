import { makeStyles, createStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) =>
  createStyles({
    backButton: {
      color: theme.palette.primary.light,
    },
    draftButton: {
      background: theme.palette.primary.light,
      color: theme.palette.primary.contrastText,
    },
    formContainer: {
      background: "grey",
    },
    childrenContainer: {
      margin: "20px 0",
      backgroundColor: "#F7F7FF",
      borderRadius: "10px",
      padding: 13,
    },
    fabBtn: {
      position: "fixed",
      bottom: 50,
      right: 50,
      backgroundColor: theme.palette.primary.light,
      color: "#fff",
      "&:hover": {
        backgroundColor: theme.palette.primary.light,
      },
    },
  })
);
