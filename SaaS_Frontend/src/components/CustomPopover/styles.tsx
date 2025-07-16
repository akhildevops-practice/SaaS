import { makeStyles, createStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      width: "auto",
    },
    typography: {
      padding: theme.spacing(2),
    },
    paper: {
      width: `${theme.typography.pxToRem(400)}`,
      height: "80vh",
      borderRadius: "12px",
      boxShadow: "0px 4px 30px rgba(0, 0, 0, 0.1)",
    },
    cancelButton: {
      position: "absolute",
      bottom: 10,
      left: "50%",
      transform: "translate(-50%, 0)",
      "&:hover": {
        background: "transparent",
      },
      "&:before": {
        position: "absolute",
        content: '""',
        top: 0,
        background: "rgba(0, 0, 0, 0.1)",
        height: 1,
        width: 350,
      },
    },
    divider: {
      margin: "0px 20px",
      marginBottom: "20px",
    },
    tabsContainer: {
      paddingTop: "10px",
      marginLeft: 0,
      marginRight: 0,
    },
    hideScroll: {
      overflow: "hidden",
    },
    notificationWrapper: {
      paddingTop: "20px",
      height: "70vh",
      overflow: "scroll",
      overflowX: "hidden",
      paddingRight: "5px",
      marginRight: "-20px",
    },

    labelMargin: {
      width: "100%",
      paddingTop: "2px",
      textAlign: "center",
    },
    buttonContainer: {
      "&:before": {
        position: "absolute",
        width: 20,
        height: 20,
        content: '""',
        background: "white",
        bottom: -23,
        left: "50%",
        transform: "rotate(44deg) translate(-50%, 0)",
      },
    },
  })
);
