import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import { useEffect, useState } from "react";
import { useStyles } from "./styles";

type TextFieldProps = {
  label: string;
  type: "number" | "text";
  name: string;
  inputRef?: any;
  value?: string | number;
  disabled?: boolean;
  onChange?: (e: any) => void;
  endIcon?: any;
  autoFocus?: boolean;
  debouncedSearch?: (text: string) => void;
  placeholder?: any;
  error?: boolean;
};

/**
 * @method TextFieldComponent
 * @description Function to generate a text field component
 * @param label {string}
 * @param type {number | text}
 * @param name {string}
 * @param inputRef {any}
 * @param value {string | number}
 * @param disabled {boolean}
 * @param onChange {(e: any) => void}
 * @param autoFocus {boolean}
 * @returns
 */
export default function TextFieldComponent({
  label,
  type = "text",
  name,
  value = "",
  inputRef,
  disabled = false,
  onChange,
  endIcon,
  autoFocus = false,
  debouncedSearch,
  placeholder,
  error,
  ...props
}: TextFieldProps) {
  const classes = useStyles();
  const [textValue, setTextValue] = useState(value);

  useEffect(() => {
    if (textValue !== value) {
      setTextValue(value);
    }
  }, [value]);

  /**
   * @method handleChange
   * @description Function to handle changes on the textfield component
   * @param e {any}
   * @returns nothing
   */
  const handleChange = (e: any) => {
    setTextValue(e.target.value);
    debouncedSearch?.(e.target.value);
  };

  return (
    <div className={classes.root}>
      <Typography className={classes.text}>{label}</Typography>
      <TextField
        {...props}
        fullWidth
        variant="outlined"
        type={type}
        name={name}
        inputRef={inputRef}
        disabled={disabled}
        className={classes.textField}
        placeholder={placeholder ? placeholder : "Type here"}
        value={textValue}
        autoFocus={autoFocus}
        onChange={handleChange}
        onKeyDown={(e: any) => {
          e.stopPropagation();
        }}
        onBlur={onChange}
        multiline
        InputProps={{
          endAdornment: textValue !== "" ? endIcon : "",
        }}
        inputProps={{
          style: { fontSize: 16 },
          "data-testid": "textfield-component",
        }}
        error={error}
      />
    </div>
  );
}
