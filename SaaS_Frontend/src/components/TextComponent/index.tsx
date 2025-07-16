import { TextField } from "@material-ui/core";
import { useState } from "react";
import { useStyles } from "./styles";

type Props = {
  handler: (e: any) => void;
  disabled?: boolean;
  value?: any;
};

/**
 * @method TextComponent
 * @description Function to generate a text component
 * @param handler {(e: any) => void}
 * @param disabled {boolean}
 * @returns a react node
 */
const TextComponent = ({ handler, disabled, value = "" }: Props) => {
  const classes = useStyles();
  const [textValue, setTextValue] = useState<any>(value);

  const handleChange = (e: any) => {
    setTextValue(e.target.value);
  };

  return (
    <TextField
      className={classes.textField}
      multiline
      variant="outlined"
      type="text"
      name="text"
      value={textValue}
      onBlur={handler}
      onChange={handleChange}
      fullWidth
      disabled={disabled}
    />
  );
};

export default TextComponent;
