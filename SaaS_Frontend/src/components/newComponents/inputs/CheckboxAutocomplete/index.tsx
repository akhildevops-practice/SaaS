import Autocomplete from "@material-ui/lab/Autocomplete";
import {
  TextField,
  Box,
  IconButton,
  Tooltip,
  InputAdornment,
} from "@material-ui/core";
import { MdCheckBox } from 'react-icons/md';
import { MdIndeterminateCheckBox } from 'react-icons/md';
import { useState } from "react";

type Props = {
  name: string;
  label?: string;
  value: any[];
  options: { value: any; label: string }[];
  handleChange: (name: string, newValue: any[]) => void;
  handleSelectAll: (name: string, options: any[]) => void;
  handleSelectNone: (name: string) => void;
  helperText?: string;
  errorMessage?: string;
  required?: boolean;
  disabled?: boolean;
  [x: string]: any; // optional ...props for mui Autocomplete component
};

// Initialise your state to empty array []

function CheckboxAutocomplete({
  name,
  label,
  value,
  options,
  handleChange,
  handleSelectAll,
  handleSelectNone,
  helperText = "",
  errorMessage = "",
  required = false,
  disabled = false,
  ...props
}: Props) {
  const [initalValue, setInitalValue] = useState<any>([
    { value: "All", label: "All" },
  ]);
  return (
    <Box display="flex" alignItems="flex-start" justifyContent="center">
      <Autocomplete
        fullWidth
        multiple
        disableCloseOnSelect
        options={options}
        disabled={disabled}
        getOptionLabel={(option) => option.label}
        filterSelectedOptions
        value={options.length > 0 ? [options[0]] : []}
        onChange={(e, val) => {
          handleChange(
            name,
            val.map((obj) => obj.value)
          );
        }}
        renderInput={(params) => (
          <>
            <TextField
              variant="outlined"
              label={label}
              required={required}
              helperText={errorMessage ? errorMessage : helperText}
              error={!!errorMessage}
              {...params}
              InputProps={{
                ...params.InputProps,
                endAdornment: {
                  // @ts-ignore
                  ...params.InputProps.endAdornment,
                  props: {
                    // @ts-ignore
                    ...params.InputProps.endAdornment.props,
                    children: [
                      null,
                      <InputAdornment
                        key="checkbox"
                        position="end"
                        style={{ position: "absolute", top: 13, right: -7 }}
                      >
                        {options.length - value.length < options.length / 2 ? (
                          <Tooltip title="Select none">
                            <IconButton onClick={() => handleSelectNone(name)}>
                              <MdIndeterminateCheckBox
                                style={{ fontSize: 31 }}
                                color="primary"
                              />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Select all">
                            <IconButton
                              onClick={() => handleSelectAll(name, options)}
                            >
                              <MdCheckBox
                                style={{ fontSize: 31 }}
                                color="primary"
                              />
                            </IconButton>
                          </Tooltip>
                        )}
                      </InputAdornment>,
                    ],
                  },
                },
              }}
            />
          </>
        )}
        {...props}
      />
    </Box>
  );
}

export default CheckboxAutocomplete;
