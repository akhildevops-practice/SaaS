import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
  table: {
    backgroundColor: "#FFFFFF",
    borderRadius: "9px",
    width: "100%",
    "& thead th": {
      padding: theme.spacing(2),
      backgroundColor: "#F7F7FF",
      color: theme.palette.primary.main,
      zIndex: 0,
    },
  },
  actionButtonTableCell: {
    fontSize: theme.typography.pxToRem(12),
    textAlign: "center",
    paddingTop: theme.spacing(0.1),
    paddingBottom: theme.spacing(0.1),
    height: theme.typography.pxToRem(2),
    borderBottom: "1px solid rgba(104, 104, 104, 0.1);",
    borderRight: "1px solid rgba(104, 104, 104, 0.1);",
    wordWrap: "break-word",
    maxWidth: "200px",
  },
  tableHeaderColor: {
    color: theme.palette.primary.main,
  },
  tableCell: {
    fontSize: theme.typography.pxToRem(12),
    paddingTop: theme.spacing(0.1),
    paddingBottom: theme.spacing(0.1),
    paddingLeft: theme.spacing(2), //removing for testing
    paddingRight: theme.spacing(2), //removing for testing
    height: theme.typography.pxToRem(2),
    borderBottom: "1px solid rgba(104, 104, 104, 0.1);",
    borderRight: "1px solid rgba(104, 104, 104, 0.1);",
    wordWrap: "break-word",
    maxWidth: "200px",
  },
  tableCellWithoutAction: {
    fontSize: theme.typography.pxToRem(12),
    height: theme.typography.pxToRem(10),
    borderBottom: "1px solid rgba(104, 104, 104, 0.1);",
    borderRight: "1px solid rgba(104, 104, 104, 0.1);",
  },
  root: {
    padding: 0,
  },
  editField: {
    fontSize: theme.typography.pxToRem(12),
    width: "100%",
    borderBottom: "0.5px solid black",
  },
  addField: {
    width: "100%",
    borderRadius: "6px",
    fontSize: theme.typography.pxToRem(12),
  },
  addFieldButton: {
    display: "flex",
    margin: "auto",
    maxWidth: "100px",
  },
  buttonCell: {
    fontSize: theme.typography.pxToRem(12),
    paddingTop: theme.spacing(0.1),
    paddingBottom: theme.spacing(0.1),
    paddingLeft: theme.spacing(2), //removing for testing
    paddingRight: theme.spacing(2), //removing for testing
    height: theme.typography.pxToRem(2),
    borderBottom: "1px solid rgba(104, 104, 104, 0.1);",
    borderRight: "1px solid rgba(104, 104, 104, 0.1);",
  },
}));
