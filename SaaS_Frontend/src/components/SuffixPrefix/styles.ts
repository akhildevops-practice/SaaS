import { Theme } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";

export const useStyles = makeStyles((theme: Theme) => ({
  fabButton: {
    backgroundColor: theme.palette.primary.light,
    color: "#fff",
    margin: "0 5px",
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    },
  },
  colHead: {
    background: "#E8F3F9",
    color: "black",

    fontWeight: "bold",
    // fontSize: "1.1rem",
    padding: "5px 0",
  },
  cell: {
    padding: "10px 20px 10px 0",
  },
  dataRow: {
    borderRadius: 5,
    transition: "all 0.1s ease-out",
    "&:hover": {
      boxShadow: "0 1px 5px 0px #0003",
      cursor: "pointer",
      transform: "scale(1.01)",
    },
  },
  imgContainer: {
    display: "flex",
    justifyContent: "center",
  },
  emptyDataText: {
    fontSize: theme.typography.pxToRem(14),
    color: theme.palette.primary.main,
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
  form: {
    padding: theme.typography.pxToRem(20),
    borderRadius: theme.typography.pxToRem(10),
    backgroundColor: "#FFFFFF",
    minHeight: "40vh",
  },
  formTextPadding: {
    color: "#0E0A42",
    padding: theme.typography.pxToRem(14),
    fontSize: theme.typography.pxToRem(13),
  },
  formBox: {
    width: "100%",
    paddingBottom: theme.typography.pxToRem(25),
  },
  discardBtn: {
    fontSize: theme.typography.pxToRem(13),
    color: theme.palette.primary.light,
    marginRight: theme.typography.pxToRem(20),
  },
  buttonSection: {
    display: "flex",
    justifyContent: "flex-end",
    paddingTop: 100,
  },
  formControl: {
    minWidth: "100%",
  },
  formBottomSection: {
    marginTop: theme.typography.pxToRem(20),
  },
  submitButton: {
    background: theme.palette.primary.light,
    marginLeft: 10,
    "&:hover": {
      background: theme.palette.primary.main,
    },
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      margin: 0,
    },
  },
}));
