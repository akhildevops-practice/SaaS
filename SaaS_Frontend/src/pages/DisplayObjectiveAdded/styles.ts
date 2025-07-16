import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    borderRadius: theme.typography.pxToRem(10),
    backgroundColor: "#FFFFFF",
    minHeight: "20vh",
    width: "100%",
  },
  title: {
    padding: theme.typography.pxToRem(10),
    fontSize: theme.typography.pxToRem(20),
    color: theme.palette.primary.main,
  },
  chipStyle: {
    backgroundColor: "#F7F7FF !important",
    borderRadius: `${theme.typography.pxToRem(5)} !important`,
    minWidth: `${theme.typography.pxToRem(200)} !important`,
    margin: `${theme.typography.pxToRem(20)} !important`,
    padding: `${theme.typography.pxToRem(20)} !important`,
  },
  tableSection: {
    display: "flex",
    justifyContent: "center",
  },
  table: {
    width: "97%",
    paddingTop: theme.typography.pxToRem(30),
    paddingBottom: theme.typography.pxToRem(30),
  },
  imgContainer: {
    display: "flex",
    justifyContent: "center",
  },
  emptyDataText: {
    fontSize: theme.typography.pxToRem(14),
    color: theme.palette.primary.main,
  },
}));

export default useStyles;
