import { makeStyles, createStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) =>
  createStyles({
    formHeader: {
      padding: "clamp(1rem, 70px, 2rem)",
      borderRadius: "10px",
      backgroundColor: theme.backgroundColor.paper,
      marginBottom: 20,
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      rowGap: "1.5rem",
      columnGap: "3rem",
      [theme.breakpoints.down("sm")]: {
        gridTemplateColumns: "1fr",
      },
    },
    formTextPadding: {
      padding: theme.typography.pxToRem(14),
      fontSize: theme.typography.pxToRem(13),
    },
    formBox: {
      width: "100%",
      paddingBottom: theme.typography.pxToRem(25),
    },
    rootone: {
      width: "100%",
      maxHeight: "100%",
      // maxHeight: "calc(80vh - 12vh)", // Adjust the max-height value as needed
      overflowY: "auto",
      "&::-webkit-scrollbar": {
        width: "8px",
        height: "10px", // Adjust the height value as needed
        backgroundColor: "#e5e4e2",
      },
      "&::-webkit-scrollbar-thumb": {
        borderRadius: "10px",
        backgroundColor: "grey",
      },
      paddingTop: theme.typography.pxToRem(20),
    },

    labelField: {
      fontSize: theme.auditFont.medium,
    },
    root: {
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
  })
);
