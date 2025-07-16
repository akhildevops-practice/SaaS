import { makeStyles, createStyles } from "@material-ui/core";
import { theme } from "../../theme";

export const useStyles = makeStyles(() =>
  createStyles({
    popularTagsContainer: {
      width: "100%",
      height: "100%",
      left: "46px",
      top: "145px",
      background: "#FFFFFF",
      borderRadius: "10px",
      // margin: "0px 5px",
      [theme.breakpoints.down("sm")]: {
        height: theme.typography.pxToRem(340),
      },
    },
    headerContainer: {
      //   border: "2px solid red",
      paddingTop: theme.spacing(4),
      width: "100%",
      height: "10%",
      //   marginTop: 0,
      textAlign: "center",
      color: "#0E0A42",
      fontSize: "18px",
    },
    centerTag: {
      //   border: "2px solid blue",
      display: "flex",
      justifyContent: "center",
    },
    bottomContainer: {
      //   border: "2px solid green",
      height: "60%",
      width: "100%",
    },
    documentBox: {
      padding: "0 2em ",
    },
    documentBoxAlternate: {
      display: "grid",
      placeContent: "center",
      // width: "40%",
    },
    textFormation: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: "1em",
      fontWeight: "bold",
      color: "#929DC0",
    },
    textFormationAlternate: {
      display: "flex",
      flexDirection: "column",
      textAlign: "center",
      // marginTop: "1em",
      fontWeight: "bold",
      color: "#929DC0",
    },
    textInsideTags: {
      cursor: "auto",
      "&:hover": {
        color: "#303440",
        cursor: "pointer"
      },
    },
  })
);
