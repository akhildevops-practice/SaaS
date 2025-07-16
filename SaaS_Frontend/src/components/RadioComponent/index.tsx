import {
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  useMediaQuery,
} from "@material-ui/core";
import React from "react";
import { useStyles } from "./styles";

type Props = {
  handler: (e: React.ChangeEvent<{}>) => void;
  data?: any;
  disabled?: boolean;
  initialValue?: any;
};

/**
 * @method RadioComponent
 * @description Function component to generate a radio component
 * @param handler {function}
 * @param data {any}
 * @param disabled {boolean}
 * @returns a react node
 */
const RadioComponent = ({
  handler,
  data,
  disabled,
  initialValue = "",
}: Props) => {
  const classes = useStyles();
  const [value, setValue] = React.useState(initialValue);
  const matches = useMediaQuery("(min-width:786px)");
  
  /**
   * @method handleChange
   * @description Function to handle changes on the radio component
   * @param event {any}
   */
  const handleChange = (event: any) => {
    setValue(event.target.value);
  };

  return (
    <FormControl
      component="fieldset"
      className={classes.radio}
      disabled={disabled}
    >
      <RadioGroup row name="radio" value={value} onChange={handler} style={{display:"flex", flexDirection:matches ?  "row": "column"}}>
        {data.map((item: any) => (
          <FormControlLabel
            value={item.name}
            name="radio"
            control={<Radio color="primary" />}
            label={item.name}
            onChange={handleChange}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
};

export default RadioComponent;
