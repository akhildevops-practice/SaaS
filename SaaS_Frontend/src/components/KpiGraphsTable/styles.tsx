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
    padding: "10px 10px",
    color: "#003059",
    // paddingTop: 7,
    // paddingBottom: 7,
    textAlign: "center",
  },
  row: {
    position: "relative",
    borderBottom: "1px solid #aaa",

    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  bodyCell: {
    fontSize: "0.85rem",
    padding: "10px",
    position: "relative",
    "&:hover $tooltip": {
      visibility: "visible",
      opacity: 1,
    },
  },

  dataCell: {
    fontSize: "0.85rem",
    padding: 700,
    borderRadius: 1,
    minHeight: 0,

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
  tooltip: {
    position: "absolute",
    // zIndex: '1',
    backgroundColor: "#555",
    color: "#fff",
    textAlign: "center",
    borderRadius: "6px",
    padding: "5px",
    minWidth: "100px",
    maxWidth: "300px", // Adjust max width as needed
    pointerEvents: "none", // Ensure tooltip does not block mouse events
    transform: "translate(-50%, 10px)", // Offset from cursor
    visibility: "hidden",
    opacity: "0",
    transition: "opacity 0.3s",
    whiteSpace: "pre-wrap", // Allow multiline content
  },
}));

export default useStyles;
