import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  buttonColor: {
    paddingLeft: 12,
    paddingRight: 12,
    fontSize: theme.typography.pxToRem(13),
    borderRadius: theme.typography.pxToRem(5),
    [theme.breakpoints.up("sm")]: {
      paddingLeft: 18,
      paddingRight: 18,
      fontSize: theme.typography.pxToRem(13),
    },
    backgroundColor: "#0E497A",
    color: "#FFFFFF",
    width: theme.typography.pxToRem(87),
    height: theme.typography.pxToRem(38),
    marginLeft: theme.typography.pxToRem(10),
    "&:hover": {
      backgroundColor: "#0E497A",
      color: "#FFFFFF",
    },
  },
}));

export default useStyles;
