import { makeStyles, createStyles } from "@material-ui/core";

export const useStyles = makeStyles(() =>
  createStyles({
    badge: {
      "& .MuiBadge-badge": {
        right: -5,
        top: -3,
        width: 1,
        height: 20,
      },
    },
  })
);
