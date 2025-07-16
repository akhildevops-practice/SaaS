import { makeStyles, createStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) =>
  createStyles({
    ncCard: {
      margin: "0.5rem 0",
      padding: 0,
      borderRadius: "10px",
      background: "white",
      overflow: "hidden",
      boxShadow: theme.shadows[2],
      minWidth: "82%",
      maxWidth: 900,
    },
    cardHeader: {
      backgroundColor: theme.palette.primary.light,
      color: theme.textColor.white,
      padding: "1rem clamp(1rem, 70px, 2rem)",
      minWidth: "82%",
      marginBottom: "1rem",
    },
    cardBody: {
      padding: "1rem clamp(1rem, 70px, 2rem)",
      minWidth: "100%",
      maxWidth: 900,
    },
    successBtn: {
      color: "#08AE2D",
    },
    errorBtn: {
      color: "#C80202",
    },
    buttonGroup: {
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
      gap: "1rem",
    },
    form: {
      padding: theme.typography.pxToRem(20),
      borderRadius: theme.typography.pxToRem(10),
      backgroundColor: "#FFFFFF",
      minHeight: "40vh",
    },
    formTextPadding: {
      padding: theme.typography.pxToRem(14),
      fontSize: theme.typography.pxToRem(13),
    },
    formBox: {
      width: "100%",
      paddingBottom: theme.typography.pxToRem(25),
    },
    discardBtn: {
      fontSize: theme.typography.pxToRem(13),
      color: theme.palette.primary.light,
      marginRight: theme.typography.pxToRem(20),
    },

    formControl: {
      minWidth: "100%",
    },
  })
);

export default useStyles;
