import { makeStyles, createStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) =>
  createStyles({
    rootContainer: {
      marginTop: 20,
      backgroundColor: theme.backgroundColor.paper,
      borderRadius: "10px",
      cursor: "grab",
      "&:active": {
        cursor: "grabbing",
      },
    },
    dragIcon: {
      cursor: "grab",
      pointerEvents: "none",
    },
    questionContainer: {
      // padding: "20px 70px",
      padding: "20px clamp(1rem, 70px, 2rem)",
    },
    labelField: {
      fontSize: theme.auditFont.medium,
    },
    selectContainer: {
      display: "flex",
      flexDirection: "column",
      gap: theme.spacing(2),
      [theme.breakpoints.up("sm")]: {
        flexDirection: "row",
        alignItems: "center",
      },
    },
    text: {
      fontSize: theme.auditFont.medium,
      minWidth: "150px",
    },
    select: {
      minWidth: 250,
      height: 42,
      "& :focus": {
        backgroundColor: theme.palette.background.paper,
      },
    },
  })
);
