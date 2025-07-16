import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
  root: {
    borderRadius: theme.typography.pxToRem(10),
    backgroundColor: "#FFFFFF",
    minHeight: "20vh",
    width: "100%",
  },
  fixedContainer: {
    position: "fixed",
    bottom: 0,
    left: 0,
    width: "100%",
    height: "60px", // Fixed height
    backgroundColor: "#ffffff", // White background
    display: "none", // Default hidden
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0px -2px 5px rgba(0, 0, 0, 0.1)", // Subtle shadow at the top

    [theme.breakpoints.down("sm")]: {
      display: "flex", // Show only on mobile
    },
  },
  button: {
    backgroundColor: "#002F5F", // Dark blue
    color: "white",
    fontWeight: "bold",
    padding: theme.spacing(1, 3),
    borderRadius: "5px",
    textTransform: "none", // Keep button text normal case
  },
  scroll: {
    width: "100%",
    maxHeight: "70vh", // Adjust the max-height value as needed
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
    overflowX: "hidden",
    paddingTop: theme.typography.pxToRem(20),
  },
  filename: {
    fontSize: theme.typography.pxToRem(12),
    color: theme.palette.primary.light,
    textOverflow: "ellipsis",
    overflow: "hidden",
    width: "160px",
    whiteSpace: "nowrap",
    cursor: "pointer",
    "&:hover": {
      cursor: "pointer", // Change cursor to pointer on hover
    },
  },
  title: {
    padding: theme.typography.pxToRem(20),
    fontSize: theme.typography.pxToRem(16),
    color: theme.palette.primary.main,
  },
  tableSection: {
    display: "flex",
    marginTop: "25px",
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

  fabButton: {
    backgroundColor: theme.palette.primary.light,
    color: "#fff",
    margin: "0 5px",
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    },
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
  ratingButton: {
    marginTop: theme.spacing(4),
    color: theme.palette.primary.light,
    border: `1px solid ${theme.palette.primary.light}`,
    width: theme.typography.pxToRem(117),
    height: theme.typography.pxToRem(38),
  },
  ratingButtonWithArrow: {
    marginTop: theme.spacing(4),
    color: theme.palette.primary.light,
    border: `1px solid ${theme.palette.primary.light}`,
    width: theme.typography.pxToRem(117),
    height: theme.typography.pxToRem(38),
    "&:before": {
      position: "absolute",
      top: "60px",

      width: 20,
      height: 20,
      content: '""',
      background: "white",
      bottom: -23,
      left: "50%",
      transform: "rotate(44deg) translate(-50%, 0)",
    },
  },
  ratingButtonWrapper: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
  },
  popperContainer: {
    padding: theme.spacing(4),
    marginTop: "20px",
    maxWidth: "400px",
    boxShadow: " 0px 13px 23px 0px rgba(50, 50, 50, 0.28)",
  },
  submitButton: {
    margin: "2rem auto 0",
    backgroundColor: theme.palette.primary.light,
    color: "#fff",
    width: theme.typography.pxToRem(87),
    height: theme.typography.pxToRem(38),
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    },
  },
  fieldContainer: {
    marginTop: "5px",
    padding: "0 70px",
    paddingTop: "10px",
  },
}));
