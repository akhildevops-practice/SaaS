import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  tableContainer: {
    width: "100%",
    // maxHeight: theme.typography.pxToRem(20)
    paddingTop: theme.typography.pxToRem(20),
  },
  imgContainer: {
    display: "flex",
    justifyContent: "center",
  },
  emptyDataText: {
    fontSize: theme.typography.pxToRem(14),
    color: theme.palette.primary.main,
  },
  loader: {
    display: "flex",
    justifyContent: "center",
  },
  filterButtonContainer: {
    [theme.breakpoints.down("sm")]: {
      position: "fixed",
      bottom: theme.typography.pxToRem(50),
      right: theme.typography.pxToRem(20),
    },
  },
  fabButton: {
    fontSize: theme.typography.pxToRem(12),
    backgroundColor: theme.palette.primary.light,
    color: "#fff",
    margin: "0 5px",
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    },
  },
}));

export default useStyles;
