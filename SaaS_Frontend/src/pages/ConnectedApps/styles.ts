import { Theme } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";

export const useStyles = makeStyles((theme: Theme) => ({
  fabButton: {
    backgroundColor: theme.palette.primary.light,
    color: "#fff",
    margin: "0 5px",
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    },
  },
  colHead: {
    background: "#E8F3F9",
    color: "Black",
    fontWeight: "bold",

    // fontSize: "1.1rem",
    padding: "20px 20px 20px 0",
  },
  cell: {
    padding: "20px 20px 20px 0",
  },
  dataRow: {
    borderRadius: 5,
    transition: "all 0.1s ease-out",
    "&:hover": {
      boxShadow: "0 1px 5px 0px #0003",
      cursor: "pointer",
      transform: "scale(1.01)",
    },
  },
  imgContainer: {
    display: "flex",
    justifyContent: "center",
  },
  emptyDataText: {
    fontSize: theme.typography.pxToRem(14),
    color: theme.palette.primary.main,
  },
}));
