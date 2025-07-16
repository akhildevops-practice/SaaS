import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  backBtn: {
    color: theme.palette.primary.light,
    marginTop: theme.typography.pxToRem(20),
    marginRight: theme.typography.pxToRem(100),
    position: "absolute",
    zIndex: 1,
  },
  backBtnMobile: {
    color: theme.palette.primary.light,
    marginTop: theme.typography.pxToRem(8),
    right: 26,
    position: "absolute",
    zIndex: 1,
  },
}));

export default useStyles;
