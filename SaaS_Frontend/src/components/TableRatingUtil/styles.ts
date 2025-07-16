import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  chipStyle: {
    backgroundColor: theme.palette.primary.light,
    color: "#FFFFFF",
    marginLeft: theme.typography.pxToRem(10),
    borderRadius: theme.typography.pxToRem(50),
    paddingLeft: theme.typography.pxToRem(6),
    paddingRight: theme.typography.pxToRem(6),
    paddingTop: theme.typography.pxToRem(4),
    paddingBottom: theme.typography.pxToRem(4),
    cursor: "pointer",
  },
  text: {
    fontSize: theme.typography.pxToRem(13),
    marginTop: theme.typography.pxToRem(3),
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    fontWeight: 400,
    fontFamily: "Ibm Plex Sans",
    color: "rgba(0, 0, 0, 0.87)",
  },
  ratingText: {
    fontSize: theme.typography.pxToRem(13),
    color: theme.palette.primary.light,
  },
}));

export default useStyles;
