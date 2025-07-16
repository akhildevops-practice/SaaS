import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  toolbarButton: {
    textTransform: "uppercase",
    color: `${theme.palette.primary.main} !important`,
    fontWeight: 600,
  },
  popoverContainer: {
    padding: "3px 13px 13px 13px",
    maxWidth: 350,
  },
  colName: {
    fontSize: "0.9rem",
    fontWeight: 600,
    // backgroundColor: theme.palette.primary.main,
    // color: "white",
  },
  row: {
    position: "relative",

    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  bodyCell: {
    fontSize: "0.85rem",
    // textAlign: "center",
  },
  dataCell: {
    fontSize: "0.85rem",
    padding: 7,
    borderRadius: 2,
    minHeight: 0,
    outline: "1px solid #777",

    "&:hover": {
      outline: `1px solid ${theme.palette.primary.main}`,
    },
    "&.Mui-focused": {
      outline: `2px solid ${theme.palette.primary.main}`,
    },
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "17px 13px 13px 13px",
    overflowX: "hidden",
  },
  resizer: {
    position: "absolute",
    right: -4,
    top: 0,
    height: "100%",
    width: 7,
    background: "#0005",
    opacity: 0,
    cursor: "col-resize",
    userSelect: "none",
    touchAction: "none",

    "&:hover": {
      opacity: 1,
    },

    "&.isResizing": {
      background: theme.palette.primary.main,
      opacity: 1,
    },
  },
}));

export default useStyles;
