import { makeStyles, createStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) =>
  createStyles({
    graphContainer: {
      width: "100%",
      height: "100%",
      [theme.breakpoints.down('sm')]: {
        height:theme.typography.pxToRem(340)
      },
      left: "46px",
      top: "145px",
      background: "#FFFFFF",
      borderRadius: "10px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      margin: "0px 5px",
    },
  })
);
