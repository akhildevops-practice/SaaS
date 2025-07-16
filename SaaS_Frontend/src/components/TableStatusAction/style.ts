import { createStyles, makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "10px",
    },
    tableCell: {
      fontSize: theme.typography.pxToRem(12),
    },
    popover: {
      width: "100%",
      backgroundColor: "#F7F7FF",
      padding: "10px",
      display: "flex",
      flexDirection: "column",
    },
    popover__button: {
      justifyContent: "flex-start",
      color: theme.palette.primary.light,
      minWidth: "100%",
    },
  })
);

export default useStyles;
