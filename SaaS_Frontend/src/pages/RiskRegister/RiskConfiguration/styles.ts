import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  fabButton: {
    fontSize: theme.typography.pxToRem(12),
    backgroundColor: theme.palette.primary.light,
    color: "#fff",
    margin: "0 5px",
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    },
  },
  loader: {
    display: "flex",
    justifyContent: "center",
  },
  imgContainer: {
    display: "flex",
    justifyContent: "center",
  },
  emptyDataText: {
    fontSize: theme.typography.pxToRem(14),
    color: theme.palette.primary.main,
  },
  tableContainer: {
    width: "100%",
    paddingTop: theme.typography.pxToRem(20),
    "& .MuiTableHead-root th": {
      padding: "10px 15px"
    },
    "& .MuiTableBody-root .MuiTableRow-root .MuiTableCell-root td": {
      padding: "10px 15px"
    }
  },
}));

export default useStyles;
