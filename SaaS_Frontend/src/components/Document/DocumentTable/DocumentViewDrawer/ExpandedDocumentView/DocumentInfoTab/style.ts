import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  labelContainer: {
    display: "flex",
    alignItems: "center",
    marginRight: "16px",
  },
  labelStyle: {
    // paddingRight: "60px",
    width: "200px",
    whiteSpace: "normal",
    color: "black",
  },

  rowStyle: {
    padding: "3px",
  },
  colWrapper: {
    display: "flex",
    alignItems: "center",
  },
  iconWrapper: {
    padding: "2px",
    fill: "gray",
    width: "0.85em",
    height: "0.85em",
  },
  iconStyle: {
    padding: "2px",
    fill: "black",
    width: "1em",
    height: "1em",
  },
}));

export default useStyles;
