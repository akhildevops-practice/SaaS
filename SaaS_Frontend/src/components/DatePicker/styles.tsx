import { makeStyles, createStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) =>
  createStyles({
    containerField: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "8px",
    },
    dateField: {
      border: "none",
      borderRadius: "5px",
      padding: "13px 10px",
      fontSize: theme.typography.pxToRem(14),
      fontFamily: theme.typography.fontFamily,
    },
    dateSpaceText: {
      padding: "0 10px",
      fontSize: theme.typography.pxToRem(13),
      color: "inherit",
      margin: "auto",
      [theme.breakpoints.down("xs")]: {
        display: "none",
      },
    },
  })
);
