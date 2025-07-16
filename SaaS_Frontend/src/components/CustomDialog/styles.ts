import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  dialogBorder: {
    // padding: theme.spacing(6),
    border: "15px solid #F7F7FF",
    borderRadius: theme.typography.pxToRem(10),
  },
}));

export default useStyles;
