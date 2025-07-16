import { makeStyles, createStyles } from "@material-ui/core";
import IncementArrow from "../../../assets/scrollBar/incrementArrow.svg";
import DecrementArrow from "../../../assets/scrollBar/decrementArrow.svg";

export const useStyles = makeStyles((theme) =>
  createStyles({
    rootContainer: {
      padding: "10px 10px",
      maxWidth: "100vw",
      minheight: "100vh",
      position: "relative",
      overflowX: "hidden",
    },
    emptyTableImg: {
      display: "flex",
      justifyContent: "center",
    },
    emptyDataText: {
      fontSize: theme.typography.pxToRem(14),
      color: theme.palette.primary.main,
    },
    topContainer: {
      marginTop: "60px",
      background: "#F7F7FF",
      borderRadius: "10px",
      margin: 0,
      padding: 10,
      overflowX: "auto",
      overflowY: "hidden",
      whiteSpace: "nowrap",
      "&::-webkit-scrollbar": {
        width: "0.2em",
        height: "0.7em",
      },
      "&::-webkit-scrollbar-track": {
        // backgroundColor: "#F1F1F1 !important"
      },
      "&::-webkit-scrollbar-thumb": {
        backgroundColor: "#6E7DAB !important",
        borderRadius: "12px",
      },
      "&::-webkit-scrollbar-button:horizontal:decrement": {
        backgroundImage: `url(${DecrementArrow})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      },
      "&::-webkit-scrollbar-button:horizontal:increment": {
        backgroundImage: `url(${IncementArrow})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      },

      "&::-webkit-scrollbar-button:vertical:decrement": {
        backgroundImage: `url(${DecrementArrow})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      },
      "&::-webkit-scrollbar-button:vertical:increment": {
        backgroundImage: `url(${IncementArrow})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      },
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
    chartSection: {
      height: "auto",
      margin: "10px",
      display: "block",
      [theme.breakpoints.up("sm")]: {
        width: "400px",
        display: "inline-block",
        verticalAlign: "top",
        height: "350px",
      },
    },
    scrollableContainer: {
      overflow: "auto",
      whiteSpace: "nowrap",
    },
    scrollableItem: {
      width: "400px",
      height: "400px",
      background: "red",
      margin: "1rem",
      display: "inline-block",
    },

    popularTagsContainer: {
      width: "100%",
      height: "100%",
      left: "46px",
      top: "145px",
      background: "#FFFFFF",
      borderRadius: "10px",
      overflowY: "scroll",
      overflowX: "hidden",
      [theme.breakpoints.down("sm")]: {
        height: theme.typography.pxToRem(340),
      },
      "&::-webkit-scrollbar": {
        width: "0.4em",
        height: "0.7em",
      },
      "&::-webkit-scrollbar-track": {
        // backgroundColor: "#F1F1F1 !important"
      },
      "&::-webkit-scrollbar-thumb": {
        backgroundColor: "#6E7DAB !important",
        borderRadius: "12px",
      },
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
