import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  table: {
    backgroundColor: "#FFFFFF",
    borderRadius: "9px",
    width: "100%",
    "& thead th": {
      padding: "4px 15px",
      borderBottom: "1px solid #003059",
      backgroundColor: "#E8F3F9",
      color: "#00224E",
      zIndex: 0,
      fontWeight: "bold",
      fontSize: theme.typography.pxToRem(14),
    },
  },
  tableHeaderColor: {
    color: theme.palette.primary.main,
    fontWeight: "bold",
  },
  tableRow: {
    // "&:nth-of-type(odd)": {
    //   backgroundColor: "#F4F7F9",
    // },
  },
  tableCell: {
    fontSize: theme.typography.pxToRem(14),
    padding: "4px 15px",
    height: theme.typography.pxToRem(10),
    // borderBottom: "1px solid rgba(104, 104, 104, 0.1);",
    // borderRight: "1px solid rgba(104, 104, 104, 0.1);",
  },

  tableCellWithoutAction: {
    fontSize: theme.typography.pxToRem(12),
    paddingLeft: theme.spacing(2), //removing for testing
    paddingRight: theme.spacing(2),
    height: theme.typography.pxToRem(10),
    borderBottom: "1px solid rgba(104, 104, 104, 0.1);",
    borderRight: "1px solid rgba(104, 104, 104, 0.1);",
  },
  root: {
    padding: 0,
  },
}));

export default useStyles;
