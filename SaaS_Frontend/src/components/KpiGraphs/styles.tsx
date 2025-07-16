import { makeStyles, createStyles } from "@material-ui/core";

export const useStyles = (matches: any) =>
  makeStyles((theme) =>
    createStyles({
      rootContainer: {
        padding: "10px 10px",
        maxWidth: "100vw",
        minheight: "100vh",
        position: "relative",
        overflowX: "hidden",
      },
      inactiveText: {
        color: "red",
        fontStyle: "italic",
      },
      optionRoot: {
        display: "flex",
        alignItems: "center",
      },
      inactiveOption: {
        color: "gray",
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
        minWidth: "100%",
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
        marginRight: matches ? "10px" : "5px",
        minWidth: "30px",
        height: "40px",
        borderRadius: "50%",
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
      maincontainer: {
        // border: "1px solid #909090",
        // borderRadius: "5px",
        width: matches ? "170px" : "120px",
        padding: "0px 10px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      },
      text: {
        fontSize: "12px",
        fontWeight: 600,
        margin: "0px 0px",
        padding: "5px 0px",
        color: "#4d4d4d",
      },
      number: {
        fontSize: matches ? "20px" : "14px",
        fontWeight: 600,
        padding: "0px 0px 3px 0px ",
        margin: "0px 0px",
        // border: "1px solid #909090",
        borderRadius: matches ? "50%" : "5px",
        width: "100px",
        height: matches ? "100px" : "40px",
        textAlign: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#DF5353",
        color: "white",
      },
      select: {
        // backgroundColor: "white",
        // color: "black",
        backgroundColor: "white", // Change background color
        // color: "white",
        color: "black",
        border: "1px solid black",
        borderRadius: "5px",
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
          backgroundColor: "white",
          borderRadius: "5px",
          color: "black",
          fontSize: "14px",
          fontWeight: 600,
          border: "1px solid black",
        },
        "& .MuiOutlinedInput-notchedOutline": {
          borderRadius: "5px",
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
          borderRadius: "5px",
          color: "black",
          border: "1px solid  black",
          fontSize: "14px",
          fontWeight: 600,
        },
        "& .MuiOutlinedInput-notchedOutline": {
          borderRadius: "5px",
        },
        "& .MuiSvgIcon-root": {
          color: "black", // Change icon color
        },
      },
      selectedDateInputIntial: {
        fontFamily: theme.typography.fontFamily,
        fontSize: "0.7vw",
        height: "4px",
        "& .MuiOutlinedInput-root": {
          borderRadius: "5px",
          backgroundColor: "white",
          color: "black",
          border: "2px solid 865F7F",
        },
        "& .MuiOutlinedInput-notchedOutline": {
          borderRadius: "5px",
        },
        "& .MuiSvgIcon-root": {
          color: "black !important", // Change icon color
        },
      },
      selectedDateInput: {
        width: "200px",
        fontFamily: theme.typography.fontFamily,
        fontSize: "0.7vw",
        // height: "4px",
        "& .MuiOutlinedInput-root": {
          borderRadius: "5px",
          backgroundColor: "white",
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
          borderRadius: "5px",
        },
      },
      selectedDateInput2: {
        width: "200px",
        fontFamily: theme.typography.fontFamily,
        fontSize: "0.7vw",
        // height: "4px",
        fontWeight: 600,
        "& .MuiOutlinedInput-root": {
          borderRadius: "5px",
          backgroundColor: "white",
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
          // "&:hover .MuiOutlinedInput-notchedOutline": {
          //   borderColor: "black",
          //   border: "none",
          //   cursor: "pointer", // Remove hover border color
          // },
        },
        "& .MuiOutlinedInput-notchedOutline": {
          borderRadius: "5px",
        },
      },
    })
  );
