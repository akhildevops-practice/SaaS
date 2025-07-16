import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  loader: {
    display: "flex",
    justifyContent: "center",
  },
  tableContainer: {
    width: "100%",
    paddingTop: theme.typography.pxToRem(20),
    "& .MuiTableHead-root th": {
      // padding: "10px 15px",
      backgroundColor: "#F7F7FF",
    },
    // "& .MuiTableBody-root .MuiTableRow-root .MuiTableCell-root td": {
    //   padding: "10px 15px"
    // }
  },
  colName: {
    fontSize: "0.9rem",
    fontWeight: 600,
    padding: 7,
    textAlign: "center",
  },
  row: {
    borderBottom: "1px solid #ddd",

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
    padding: 7,
    borderRadius: 1,
    minHeight: 0,

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

    "&.GET": {
      background: "#478eff",
    },
    "&.POST": {
      background: "#3eb848",
    },
    "&.PATCH": {
      background: "#1ed4b2",
    },
    "&.MANUAL": {
      background: "#aa35e8",
    },
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 17,
    overflowX: "hidden",
  },
}));

export default useStyles;
