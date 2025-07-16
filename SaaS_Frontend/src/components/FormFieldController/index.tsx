import React from "react";
import { useStyles } from "./styles";
import Typography from "@material-ui/core/Typography";

type props = {
  label: string;
  children: React.ReactNode;
};

export default function FormFieldController({ label, children }: props) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Typography className={classes.text}>{label}</Typography>

      {children}
    </div>
  );
}
