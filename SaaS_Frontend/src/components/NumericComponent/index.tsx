import { TextField, Slider } from "@material-ui/core";
import { useState } from "react";
import { InputHandlerType } from "../../utils/enums/index";
import { useStyles } from "./styles";

type Props = {
  inputHandlerType: InputHandlerType;
  data?: any;
  handler: (e: any) => void;
  disabled?: boolean;
  value?: any;
  min?:number;
  max?:number;
};

/**
 * @method NumericComponent
 * @param inputHandlerType {InputHandlerType}
 * @param data {any}
 * @param handler {function}
 * @param disabled {boolean}
 * @returns a react node
 */
const NumericComponent = ({
  inputHandlerType,
  data,
  handler,
  disabled,
  value = "",
  min,
  max
}: Props) => {
  const classes = useStyles();
  const [numPlayers, setNumPlayers] = useState([4, 6]);
  const [textValue, setTextValue] = useState(value === "" ? 0 : value);

  /**
   * @method handleChange
   * @description Function to handle changes on the numeric component
   * @param e {any}
   * @param value {any}
   * @param value
   */
  const handleChange = (e: any) => {
    setTextValue(e.target.value);
  };

  return (
    <>
      {inputHandlerType === InputHandlerType.SLIDER ? (
        <>
          <Slider
            defaultValue={parseInt(textValue)}
            id="slider"
            name="slider"
            min={min}
            max={max}
            aria-labelledby="discrete-slider"
            valueLabelDisplay="auto"
            onChange={handler}
            disabled={disabled}
            className={classes.slider}
          />
        </>
      ) : (
        <TextField
          fullWidth
          type="number"
          minRows={1}
          name="numericText"
          variant="outlined"
          onChange={handleChange}
          onBlur={handler}
          value={textValue}
          size="small"
          required
          inputProps={{
            "data-testid": "numeric-text-component",
          }}
          disabled={disabled}
        />
      )}
    </>
  );
};

export default NumericComponent;
