// style.ts
import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles<Theme>((theme: Theme) => ({
  mainContainer: {
    width: "18.5%",
    height: "100px",
    borderRadius: "8px",
    boxShadow: "-2px 4px 9px 0 rgba(0, 0, 0, 0.25)",
  },
  text: {
    fontSize: "14px",
    fontWeight: "bold",
    padding: "10px 12px",
    margin: "0px 0px",
  },
  number: {
    fontSize: "42px",
    fontWeight: "bold",
    padding: "0px 12px 20px 12px",
    margin: "0px 0px",
  },
}));

export default useStyles;
