import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
  scroll: {
    width: "100%",
    maxHeight: "100%",
    // maxHeight: "calc(80vh - 12vh)", // Adjust the max-height value as needed
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
  root: {
    borderRadius: theme.typography.pxToRem(10),
    backgroundColor: "#FFFFFF",
    minHeight: "20vh",
    width: "100%",
  },
  title: {
    padding: theme.typography.pxToRem(20),
    fontSize: theme.typography.pxToRem(16),
    color: theme.palette.primary.main,
  },
  tableSection: {
    display: "flex",
    justifyContent: "center",
  },
  table: {
    width: "97%",
    paddingBottom: theme.typography.pxToRem(20),
  },
  form: {
    padding: theme.typography.pxToRem(20),
    borderRadius: theme.typography.pxToRem(10),
    backgroundColor: "#FFFFFF",
    minHeight: "40vh",
  },
  formTextPadding: {
    padding: theme.typography.pxToRem(14),
    fontSize: theme.typography.pxToRem(13),
  },
  formBox: {
    width: "100%",
    paddingBottom: theme.typography.pxToRem(25),
  },
  discardBtn: {
    fontSize: theme.typography.pxToRem(13),
    color: theme.palette.primary.light,
    marginRight: theme.typography.pxToRem(20),
  },
  buttonSection: {
    display: "flex",
    justifyContent: "flex-end",
    paddingTop: 100,
  },
  formControl: {
    minWidth: "100%",
  },
  displaySection: {
    paddingTop: theme.typography.pxToRem(20),
  },
  loader: {
    display: "flex",
    justifyContent: "center",
  },
}));
