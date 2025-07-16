import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  chipStyle: {
    // backgroundColor: theme.palette.primary.light,
    backgroundColor: "#0075A4",
    width: "28px",
    height: "28px",
    color: "#FFFFFF",
    marginLeft: theme.typography.pxToRem(10),
    borderRadius: theme.typography.pxToRem(50),
    paddingLeft: theme.typography.pxToRem(8),
    paddingRight: theme.typography.pxToRem(6),
    paddingTop: theme.typography.pxToRem(6),
    paddingBottom: theme.typography.pxToRem(4),
    cursor: "pointer",
    fontSize: "10px",
  },
  text: {
    color: theme.palette.primary.main,
    fontSize: theme.typography.pxToRem(14),
    marginTop: theme.typography.pxToRem(3),
  },
}));

export default useStyles;
