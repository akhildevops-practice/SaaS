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
    filterButtonContainer: {
      [theme.breakpoints.down("xs")]: {
        position: "fixed",
        bottom: theme.typography.pxToRem(50),
        right: theme.typography.pxToRem(20),
      },
    },
    root: {
      width: "100%",
      maxHeight: "100%",
      // maxHeight: "calc(80vh - 12vh)",
      overflowY: "auto",
      "&::-webkit-scrollbar": {
        width: "8px",
        height: "10px",
        backgroundColor: "#e5e4e2",
      },
      "&::-webkit-scrollbar-thumb": {
        borderRadius: "10px",
        backgroundColor: "grey",
      },
      paddingTop: theme.typography.pxToRem(0),
    },
    table: {
      backgroundColor: "#FFFFFF",
      borderRadius: "9px",
      width: "100%",
      "& thead th": {
        padding: theme.spacing(1),
        backgroundColor: "#F7F7FF",
        color: theme.palette.primary.main,
        zIndex: 0,
      },
    },
    tableHeaderColor: {
      color: theme.palette.primary.main,
    },

    tableFooter: {
      backgroundColor: "#F7F7FF",
      padding: "10px",
    },

    tableCell: {
      fontSize: theme.typography.pxToRem(13),
      padding: theme.spacing(1.5), //removing for testing
      height: theme.typography.pxToRem(10),
      borderBottom: "1px solid rgba(104, 104, 104, 0.1);",
      borderRight: "1px solid rgba(104, 104, 104, 0.1);",
      borderLeft: "1px solid rgba(104, 104, 104, 0.1);",
    },
    tableCellWithoutAction: {
      fontSize: theme.typography.pxToRem(12),
      padding: theme.spacing(2),
      height: theme.typography.pxToRem(10),
      borderBottom: "1px solid rgba(104, 104, 104, 0.1);",
      borderRight: "1px solid rgba(104, 104, 104, 0.1);",
      borderLeft: "1px solid rgba(104, 104, 104, 0.1);",
    },
    topSection: {
      flexGrow: 1,
      paddingTop: 20,
    },
    gridStyle: {
      textAlign: "center",
      color: theme.palette.text.secondary,
    },
    formControl: {
      width: "90%",
    },
    dateInput: {
      fontFamily: theme.typography.fontFamily,
      fontSize: "0.7vw",
      height: "4px",
    },
    arrowStyle: {
      justifyContent: "center",
      height: "100%",
      fontStretch: "true",
    },
    displayButton: {
      marginRight: "10px",
      minWidth: "30px",
      height: "40px",
      borderRadius: "50%",
      fontWeight: 600,
    },
    formTextPadding: {
      padding: theme.typography.pxToRem(10),
      fontSize: theme.typography.pxToRem(13),
    },
    container: {
      width: "100%",
      maxWidth: "100%",
      overflowX: "scroll",
      overflowY: "hidden",

      "&::-webkit-scrollbar": {
        height: 5, // Set the width of the scrollbar
      },

      "&::-webkit-scrollbar-thumb": {
        backgroundColor: "#003059", // Set the color of the scrollbar thumb
        borderRadius: 6, // Optional: Round the corners of the thumb
      },

      "&::-webkit-scrollbar-track": {
        backgroundColor: theme.palette.background.paper, // Set the color of the scrollbar track
      },
    },
    select: {
      // backgroundColor: "white",
      // color: "black",
      backgroundColor: "#EEEEEE", // Change background color
      // color: "white",
      color: "black",
      border: "1px solid black",
      borderRadius: "20px",
      fontSize: "14px",
      fontWeight: 600,
      "&.selected": {
        // backgroundColor: "black", // Change background color
        // color: "white",
        // borderRadius: "20px", // Change border radius
        // border: "none",
      },
    },
    textField: {
      fontSize: "14px",
      fontWeight: 600,
      "& .MuiOutlinedInput-root": {
        backgroundColor: "#EEEEEE",
        borderRadius: "20px",
        color: "black",
        fontSize: "14px",
        fontWeight: 600,
        border: "1px solid black",
      },
      "& .MuiOutlinedInput-notchedOutline": {
        borderRadius: "20px",
      },
      "& .MuiSvgIcon-root": {
        color: "black", // Change icon color
      },
    },
    textField2: {
      fontSize: "14px",
      fontWeight: 600,
      "& .MuiOutlinedInput-root": {
        backgroundColor: "white",
        borderRadius: "20px",
        color: "black",
        border: "1px solid  black",
        fontSize: "14px",
        fontWeight: 600,
      },
      "& .MuiOutlinedInput-notchedOutline": {
        borderRadius: "20px",
      },
      "& .MuiSvgIcon-root": {
        color: "black", // Change icon color
      },
    },
    selectedDateInput: {
      fontFamily: theme.typography.fontFamily,
      fontSize: "0.7vw",
      height: "4px",
      "& .MuiOutlinedInput-root": {
        borderRadius: "20px",
        backgroundColor: "#EEEEEE",
        color: "black !important",
        border: "1px solid black",

        // "& input[type='date']::-webkit-calendar-picker-indicator": {
        //   filter: "invert(1)",
        // },
        // "& input[type='date']::-webkit-inner-spin-button": {
        //   filter: "invert(1)",
        // },
        // "& input[type='date']::-webkit-clear-button": {
        //   filter: "invert(1)",
        // },
      },
      "& .MuiOutlinedInput-notchedOutline": {
        borderRadius: "20px",
      },
    },
    arrowButton: {
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      zIndex: 1,
      fontSize: "24px",
      backgroundColor: "rgba(255, 255, 255, 0.5)",
      borderRadius: "50%",
      cursor: "pointer",
    },
    prevArrow: {
      left: "0px",
    },
    nextArrow: {
      right: "0px",
    },
    carousel: {
      "&.alice-carousel__dots": {},
    },
  })
);
