import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  colName: {
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "white",
    paddingTop: 7,
    paddingBottom: 7,
    textAlign: "center",
  },
  row: {
    borderBottom: "1px solid #ddd",
    minWidth: "10px",

    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  bodyCell: {
    fontSize: "0.85rem",
    padding: "11px 7px",
  },
  dataCell: {
    fontSize: "0.85rem",
    padding: 1,
    borderRadius: 1,
    defaultWidth: "20px",
    minWidth: "20%",
    maxWidth: "100%",

    "&:hover": {
      outline: `1px solid ${theme.palette.primary.main}`,
    },
    "&.Mui-focused": {
      outline: `2px solid ${theme.palette.primary.main}`,
    },
  },
  selectCell: {
    borderRadius: 3,
    overflow: "hidden",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 17,
    overflowX: "hidden",
  },
  dateInput: {
    fontFamily: theme.typography.fontFamily,
    padding: theme.typography.pxToRem(10),
    backgroundColor: "transparent",
    border: "1px solid #bbb",
    borderRadius: 5,
    outline: "none",

    "&:hover": {
      border: "1px solid black",
    },

    "&:focus": {
      border: `2px solid ${theme.palette.primary.main}`,
    },
  },
  container: {
    display: "flex",
    flexWrap: "wrap",
  },
}));

export default useStyles;
