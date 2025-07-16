import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    modal: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    paper: {
      backgroundColor: theme.palette.background.paper,
      boxShadow: theme.shadows[5],
      borderRadius: 10,
      padding: theme.spacing(2, 4, 3),
      maxWidth: theme.typography.pxToRem(500),
      outline: "none",
    },
    button: {
      float: "right",
    },
  })
);
