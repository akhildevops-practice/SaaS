import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

export const useStyles = (matches: any) =>
  makeStyles((theme: Theme) =>
    createStyles({
      root: {
        width: "100%",
        padding: matches ? "20px 40px 20px 40px" : "0 5px 20px 5px",
        borderRadius: theme.typography.pxToRem(10),
        backgroundColor: "#FFFFFF",
      },
      container: {
        maxHeight: 350,
      },
      topText: {
        // margin: theme.typography.pxToRem(10),
        marginBottom: theme.typography.pxToRem(20),
        // paddingTop: "20px",
      },
      labelContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      },
      rangePickerStyle: {
        "& .ant-picker-input > input:disabled": {
          color: "black !important",
          // background : "white !important",
          opacity: 1,
        },
      },
      label: {
        // fontSize: theme.typography.pxToRem(14),
        fontWeight: 600,
        color: "#003566",
        alignItems: "center",
      },
      formControl: {
        minWidth: "100%",
      },
      auditYear: {
        marginLeft: theme.typography.pxToRem(7),
        fontWeight: 600,
        color: "#003566",
        alignItems: "center",
      },
      paper: {
        width: "100%",
        borderRadius: 7,
        overflow: "hidden",

        // marginBottom: theme.spacing(2),
      },
      searchContainer: {
        marginTop: "25px",
        maxWidth: "100vw",
      },
      table: {
        minWidth: 750,
      },
      visuallyHidden: {
        border: 0,
        clip: "rect(0 0 0 0)",
        height: 1,
        margin: -1,
        overflow: "hidden",
        padding: 0,
        position: "absolute",
        top: 20,
        width: 1,
      },
      buttonColor: {
        marginRight: 16,
        paddingLeft: 12,
        paddingRight: 12,
        fontSize: theme.typography.pxToRem(13),
        backgroundColor: theme.textColor.white,
        borderRadius: theme.typography.pxToRem(5),
        borderColor: theme.palette.primary.light,
        color: theme.palette.primary.light,
        [theme.breakpoints.up("sm")]: {
          paddingLeft: 18,
          paddingRight: 18,
          fontSize: theme.typography.pxToRem(13),
        },
        "&:hover": {
          backgroundColor: theme.palette.primary.light,
          color: theme.textColor.white,
        },
      },
      // checkboxContainer: {
      //   position: "relative",
      // },
      lightBorderCheckbox: {
        border: "1px solid lightgray", // Lightened border color
      },
      normalBorderCheckbox: {
        border: "1px solid black", // Normal border color
      },
      // checkboxContainer: {
      //   position: "relative",
      //   "&:hover $hiddenCheckbox": {
      //     display: "none",
      //   },
      //   "&:hover $visibleCheckbox": {
      //     display: "inline-block",
      //   },
      // },
      // hiddenCheckbox: {
      //   display: "inline-block",
      //   position: "absolute",
      //   top: 0,
      //   left: 0,
      //   zIndex: 1,
      //   opacity: 0, // Hide the checkbox without using display: none to keep the hover event active
      // },
      // visibleCheckbox: {
      //   display: "none",
      // },
      // visibleCheckboxChecked: {
      //   // Additional style when the checkbox is checked
      //   display: "inline-block",
      // },
      dateInput: {
        marginLeft: theme.spacing(1.1),
        marginRight: theme.spacing(1.1),
        fontFamily: theme.typography.fontFamily,
        padding: theme.typography.pxToRem(10),
        border: "1px solid #bbb",
        borderRadius: 8,
        outline: "none",

        "&:hover": {
          border: "1px solid black",
        },

        "&:focus": {
          border: `2px solid ${theme.palette.primary.main}`,
        },
      },
    })
  );
