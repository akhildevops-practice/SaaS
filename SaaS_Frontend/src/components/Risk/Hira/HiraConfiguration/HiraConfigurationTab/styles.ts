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
    // margin : "20px 0px 0px 10px" ,
    height: "80vh", // Adjust the max-height value as needed
    overflowY: "auto",
  },
  formTextPadding: {
    padding: theme.typography.pxToRem(6),
    // fontSize: theme.typography.pxToRem(13),
  },
  formBox: {
    width: "100%",
    paddingBottom: theme.typography.pxToRem(10),
  },
  formLabel: {
    fontWeight: "bold",
    fontSize: theme.typography.pxToRem(16),
    padding: theme.spacing(1, 0),
  },
}));

export default useStyles;
