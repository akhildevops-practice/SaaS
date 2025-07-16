import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  content: {
    paddingTop: theme.typography.pxToRem(60),
  },
  list: {
    width: 300,
    height: "100vh",
    color: theme.textColor.white,
    paddingLeft: theme.typography.pxToRem(10),
    paddingRight: theme.typography.pxToRem(10),
    paddingTop: theme.typography.pxToRem(10),
    border: "1px solid #DCDCDC",
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
    zIndex: 1,
  },
  fabBtn: {
    backgroundColor: theme.palette.primary.light,
    color: "#fff",
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    },
  },
  accordionStyle: {
    padding: theme.typography.pxToRem(8),
  },
}));

export default useStyles;
