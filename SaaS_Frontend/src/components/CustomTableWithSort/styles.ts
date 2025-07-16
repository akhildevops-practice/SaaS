import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  table: {
    backgroundColor: "#FFFFFF",
    borderRadius: "9px",
    minWidth: 750,
    "& thead th": {
      padding: "4px",
      backgroundColor: "#E8F3F9",
      color: theme.palette.primary.main,
      borderBottom : "1px solid #003059",
      zIndex: 0,
      // borderRight: "1px solid rgba(104, 104, 104, 0.1);",
    },
  },
  tableHeaderColor: {
    color: theme.palette.primary.main,
    backgroundColor: "#E8F3F9",
    fontWeight: 600,
  },
  tableCell: {
    fontSize: theme.typography.pxToRem(12),
    padding: theme.spacing(2),
    height: theme.typography.pxToRem(10),
    borderBottom: "1px solid #f0f0f0",
    // borderBottom: "1px solid rgba(104, 104, 104, 0.1);",
    // borderRight: "1px solid rgba(104, 104, 104, 0.1);",
  },
}));

export default useStyles;
