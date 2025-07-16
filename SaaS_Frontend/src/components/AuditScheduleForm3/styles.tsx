import {
  createStyles,
  makeStyles,
  Theme,
} from "@material-ui/core/styles";

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "95%",
      padding: "0 40px 20px 40px",
    },
    topText: {
      margin: theme.typography.pxToRem(10),
      marginBottom: theme.typography.pxToRem(20),
    },
    formControl: {
      minWidth: "100%",
    },
    tableHeader: {
      "& .MuiTableCell-head": {
        padding: "15px",
        whiteSpace: "nowrap",
      },
      // "&.MuiTableCell-root MuiTableCell-head WithStyles(ForwardRef(TableCell))-head-217 MuiTableCell-sizeSmall":
      //   {
      //     color: "red",
      //   },
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
      // fontSize: theme.typography.pxToRem(14),
      fontWeight: 600,
      color: "#003566",
    },
    auditYear: {
      marginLeft: theme.typography.pxToRem(7),
    },
    paper: {
      width: "100%",
      borderRadius: 7,
      overflow: "hidden",
      marginBottom: theme.spacing(2),
      boxShadow: "none",
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
    formTextPadding: {
      paddingBottom: theme.typography.pxToRem(10),
      fontSize: theme.typography.pxToRem(14),
      color: "#003566",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
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
    textField: {
      "& .MuiInputBase-root.Mui-disabled": {
        backgroundColor: "white", // Set your desired background color
      },
    },
  })
);
