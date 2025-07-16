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
      fontSize: theme.auditFont.medium,
      minWidth: "150px",
    },
    textField: {
      fontSize: theme.auditFont.medium,
      "& .MuiInputBase-root": {
        minHeight: "42px",
      },
    },
    input: {
      fontSize: theme.auditFont.medium,
    },
  })
);
