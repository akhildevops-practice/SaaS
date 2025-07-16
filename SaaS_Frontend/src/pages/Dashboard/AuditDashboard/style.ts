import { makeStyles, createStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) =>
  createStyles({
    rootContainer: {
      padding: "10px 10px",
      maxWidth: "100vw",
      minheight: "100vh",
      position: "relative",
      overflowX: "hidden",
    },
    topContainer: {
      margin: 0,
      marginTop: "60px",
      minHeight: "400px",
      padding: "10px 0px",
      paddingRight: "10px",
      width: "100%",
      background: "#F7F7FF",
      borderRadius: "10px",
      justifyContent: "center",
    },
    topContainerItem: {
      width: "20px",
    },
    searchContainer: {
      marginTop: "50px",
      marginBottom: "30px",
      maxWidth: "100vw",
    },
    bottomContainer: {
      display: "flex",
      justifyContent: "flex-end",
    },
    noDataContainer: {
      display: "flex",
      justifyContent: "center",
      marginTop: "50%",
    },
    shortenText: {
      width: 250,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    clickableField: {
      cursor: "pointer",
      color: "#000",
    },
    emptyTableImg: {
      display: "flex",
      justifyContent: "center",
    },
    emptyDataText: {
      fontSize: theme.typography.pxToRem(14),
      color: theme.palette.primary.main,
    },
    filterButtonContainer: {
      [theme.breakpoints.down("xs")]: {
        position: "fixed",
        bottom: theme.typography.pxToRem(50),
        right: theme.typography.pxToRem(20),
      },
    },
    fabButton: {
      backgroundColor: theme.palette.primary.light,
      color: "#fff",
      margin: "0 5px",
      "&:hover": {
        backgroundColor: theme.palette.primary.main,
      },
    },
  })
);
