import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  loader: {
    display: "flex",
    justifyContent: "center",
  },
  tableContainer: {
    width: "100%",
    paddingTop: theme.typography.pxToRem(10),
    paddingBottom: theme.typography.pxToRem(10),
    paddingLeft: theme.typography.pxToRem(5),
    paddingRight: theme.typography.pxToRem(5),
    "& .MuiTableHead-root th": {
      padding: "10px 15px",
      backgroundColor: "#0E0A42",
      color : "#fff",
    },
    "& .MuiTableBody-root .MuiTableRow-root .MuiTableCell-root td": {
      padding: "10px 15px"
    }
  },
  tableHeader: {
    fontSize: "1rem",
    fontWeight: "bold",
    margin: theme.spacing(1),
  },
  root: {
    width: "100%",
    height: "90vh", // Adjust the max-height value as needed
    overflowY: "auto",
    "&::-webkit-scrollbar": {
      width: "8px",
      height: "10px", // Adjust the height value as needed
      backgroundColor: "#e5e4e2",
    },
    "&::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "grey",
    },
  },
  formTextPadding: {
    padding: theme.typography.pxToRem(6),
    fontSize: theme.typography.pxToRem(13),
  },
  formBox: {
    width: "100%",
    paddingBottom: theme.typography.pxToRem(10),
  },
}));

export default useStyles;
