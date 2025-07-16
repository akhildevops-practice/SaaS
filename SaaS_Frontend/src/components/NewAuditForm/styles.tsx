import { makeStyles, createStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => createStyles({
    buttonContainer: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between", 
        width: "100%", 
      },
      exitButton: {
        color: theme.palette.primary.main,
        textTransform: "none",
      },
      saveButton: {
        backgroundColor: theme.palette.primary.main,
        color: "#fff",
        textTransform: "none",
        fontSize:"13px",
        padding:"3px 5px",
        "&:hover": {
          backgroundColor: theme.palette.primary.dark,
        },
      },
      draftButton: {
        backgroundColor: "#e0e0e0",
        color: "#000",
        fontSize:"13px",
        padding:"5px 5px",
        textTransform: "none",
        "&:hover": {
          backgroundColor: "#d6d6d6",
        },
      },
}));
