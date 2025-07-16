import { makeStyles, createStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      display: "flex",
      flexDirection: "column",
      gap: theme.spacing(2),
      [theme.breakpoints.up("sm")]: {
        flexDirection: "row",
        alignItems: "center",
      },
    },
    text: {
      width: "150px",
      color: "#003566",
      fontSize: "14px",
      fontFamily: "poppinsregular, sans-serif !important",
      fontWeight: "bold",
    },
    textField: {
      fontSize: theme.auditFont.medium,
      "& .MuiInputBase-root": {
        height: "42px",
      },
    },
  })
);
