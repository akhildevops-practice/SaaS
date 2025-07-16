import { makeStyles, createStyles } from "@material-ui/core";

export const useStyles = makeStyles(() =>
  createStyles({
    header: {
      fontWeight: "bold",
      textAlign: "center",
      fontSize: "18px",
    },
    notificationWrapper: {
      paddingTop: "30px",
      height: "80vh",
      overflow: "scroll",
      overflowX: "hidden",
      paddingRight: "5px",
      marginRight: "-15px",
    },
    sectionHeader: {
      paddingLeft: "20px",
      paddingTop: "10px",
    },
    noNotificationsText: {
      fontSize: "18px",
      letterSpacing: "1px",
    },
    cancelButton: {},
    hideScroll: {
      overflow: "hidden",
    },
  })
);
