import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  list: {
    width: 300,
    height: "100vh",
    backgroundColor: theme.palette.primary.light,
    color: theme.textColor.white,
    paddingLeft: theme.typography.pxToRem(25),
    paddingRight: theme.typography.pxToRem(25),
    paddingTop: theme.typography.pxToRem(25),
    border: "none",
  },
  content: {
    paddingTop: theme.typography.pxToRem(60),
  },
  root: {
    "& > *": {
      margin: theme.spacing(1),
    },
    display: "flex",
    justifyContent: "flex-end",
    position: "fixed",
    bottom: 30,
    right: 10,
    opacity: 1,
    zIndex: 10,
  },
  extendedIcon: {
    marginRight: theme.spacing(1),
  },
  fabBtn: {
    backgroundColor: theme.palette.primary.light,
    color: "#fff",
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    },
  },
  title: {
    marginTop: theme.typography.pxToRem(6),
    marginLeft: theme.typography.pxToRem(50),
  },
  navTopArea: {
    width: "auto",
    display: "flex",
    justifyContent: "flex-start",
  },
  resultTextStyle: {
    fontSize: 10,
  },
  btnSection: {
    paddingTop: theme.typography.pxToRem(61),
    display: "flex",
    justifyContent: "flex-end",
  },
  applyBtn: {
    backgroundColor: theme.backgroundColor.paper,
    height: theme.typography.pxToRem(34),
    color: theme.palette.primary.light,
    borderRadius: theme.typography.pxToRem(5),
    width: theme.typography.pxToRem(79),
    "&:hover": {
      backgroundColor: theme.textColor.white,
    },
  },
  discardBtn: {
    color: theme.textColor.white,
    marginRight: theme.typography.pxToRem(10),
  },
  filterNormalBtn: {
    backgroundColor: theme.textColor.white,
    color: theme.palette.primary.light,
    border: `1px solid ${theme.palette.primary.light}`,
    borderRadius: theme.typography.pxToRem(5),
    position: "absolute",
    right: theme.typography.pxToRem(180),
    height: theme.typography.pxToRem(36),
    width: theme.typography.pxToRem(99),
    "&:hover": {
      backgroundColor: theme.palette.primary.light,
      color: theme.textColor.white,
    },
  },
}));

export default useStyles;
