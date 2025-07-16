import {
  createStyles,
  makeStyles,
  Theme,
} from "@material-ui/core/styles";

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",

    },
    iconButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    inputBox: {
      display: "flex",
      alignItems: "center",
      marginTop: "auto",
      padding: theme.spacing(2),
    },
    input: {
      flexGrow: 1,
      marginRight: theme.spacing(2),
    },
    smallColumn: {
      width: '100px', // Adjust this value as needed
    },
    actionColumn: {
      width: '50px', // Adjust this value as needed
    },
    labelContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
    },
    tableLabel: {
      fontSize: theme.typography.pxToRem(20),
      fontWeight: 600,
      marginBottom: theme.spacing(2),
      color: "#003566 !important",
      textAlign: 'left',
    },
    topText: {
      margin: theme.typography.pxToRem(10),
      marginBottom: theme.typography.pxToRem(20),
    },
    tableHeader: {
      "& .MuiTableCell-head": {
        padding: "4px 8px 3px 10px",
        whiteSpace: "nowrap",
        backgroundColor: "#E8F3F9 !important", // Set your desired background color
        color: "#003566 !important",
        textAlign: "left",
      },
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
    label: {
      fontSize: theme.typography.pxToRem(14),
      fontWeight: 600,
    },
    auditYear: {
      marginLeft: theme.typography.pxToRem(7),
    },
    paper: {
      width: "100%",
      borderRadius: 7,
      overflow: "hidden",
      marginBottom: theme.spacing(2),
      marginRight : "10px",
      boxShadow: "0px 0px 10px rgba(0,0,0,0.2)", // Box shadow for the table
    },
    table: {
      minWidth: 750,
      border: "1px solid #e0e0e0", // Border for the table
      borderRadius: 7, // Rounded corners for the table
      "& .MuiTableCell-body": {
        textAlign: "left", // Left-aligned columns
      },
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
    formTextPadding: {
      paddingBottom: theme.typography.pxToRem(10),
      fontSize: theme.typography.pxToRem(14),
      color: "#003566",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      marginBottom: "10px", 
    },
    formBox: {
      width: "60%",
      paddingBottom: theme.typography.pxToRem(25),
    },
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
