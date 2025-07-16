import { Checkbox, FormControlLabel } from "@material-ui/core";
import React from "react";
import { useStyles } from "./styles";

type Props = {
  handler: (e: any) => void;
  data?: any;
  disabled?: boolean;
};

/**
 * @method CheckBoxComponent
 * @description Function to generate a checkbox component
 * @param handler {function}
 * @param data {any}
 * @param disabled {boolean}
 * @returns
 */
const CheckBoxComponent = ({ handler, data, disabled }: Props) => {
  const classes = useStyles();
  const [value, setValue] = React.useState<any>({
    yes: data[0].value,
    no: data[1].value,
  });

  return (
    <>
      {data[0].value > 0 && (
        <FormControlLabel
          disabled={disabled}
          control={
            <Checkbox
              checked={data[0].checked}
              name="yes"
              onChange={handler}
              color="primary"
            />
          }
          label={data[0].name}
        />
      )}
      {data[1].value > 0 && (
        <FormControlLabel
          disabled={disabled}
          control={
            <Checkbox
              checked={data[1].checked}
              name="no"
              onChange={handler}
              color="primary"
            />
          }
          label={data[1].name}
        />
      )}
    </>
  );
};

export default CheckBoxComponent;
