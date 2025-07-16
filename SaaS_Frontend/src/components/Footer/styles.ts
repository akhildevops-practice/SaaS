import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    bottom: 0,
    left: "60px",
    position: "relative",
    // display: 'flex',
    minHeight: theme.typography.pxToRem(46),
    // justifyContent: 'space-between',
    backgroundColor: "#fff",
  },
  mobileView: {
    display: "flex",
    justifyContent: "center",
  },
  text1: {
    fontSize: theme.typography.pxToRem(12),
    paddingTop: theme.typography.pxToRem(15),
    paddingLeft: theme.typography.pxToRem(27),
  },
  text2: {
    fontSize: theme.typography.pxToRem(12),
    paddingTop: theme.typography.pxToRem(15),
    display: "flex",
    justifyContent: "flex-end",
  },
  text2Mobile: {
    fontSize: theme.typography.pxToRem(12),
    paddingTop: theme.typography.pxToRem(5),
    paddingBottom: theme.typography.pxToRem(10),
  },
}));

export default useStyles;
