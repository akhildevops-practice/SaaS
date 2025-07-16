import { makeStyles, createStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) =>
  createStyles({
    textField: {
      fontSize: theme.auditFont.medium,
      "& .MuiInputBase-root": {
        minHeight: "42px",
      },
    },
  })
);
