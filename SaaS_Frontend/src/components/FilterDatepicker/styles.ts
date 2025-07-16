import { makeStyles, createStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) =>
  createStyles({
    containerField: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      // margin: "5px",
    },
    dateInput: {
      fontFamily: theme.typography.fontFamily,

      fontColor: "#A2A2A2",
      // padding: theme.typography.pxToRem(30),
      padding: "9px 0px 9px 0px",
      backgroundColor: "transparent",
      // marginLeft: "5px",
      border: "1px solid #bbb",
      minWidth: "100%",
      borderRadius: 5,
      outline: "none",

      "&:hover": {
        border: "1px solid black",
      },

      "&:focus": {
        border: `2px solid ${theme.palette.primary.main}`,
      },
    },
    dateSpaceText: {
      padding: "0 0 5px",
      minWidth: "80%",
      // marginLeft: "2px",
      fontSize: theme.typography.pxToRem(14),

      color: "inherit",
      margin: "auto",
      [theme.breakpoints.down("xs")]: {
        display: "none",
      },
    },
  })
);
