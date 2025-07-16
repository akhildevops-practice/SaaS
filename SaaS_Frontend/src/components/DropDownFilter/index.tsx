import React from "react";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { InputAdornment } from "@material-ui/core";
import SearchIcon from "../../assets/SearchIcon.svg";
import useStyles from "./styles";

type Props = {
  optionList: any;
  name: string;
  handleChange: any;
  placeholder: string;
  values: any;
  handleApply: any;
  defaultOption?: boolean;
  defaultOptionPlaceholder?: string;
};

function DropDownFilter({
  values,
  optionList,
  name,
  handleChange,
  placeholder,
  handleApply,
  defaultOption = false,
  defaultOptionPlaceholder,
}: Props) {
  const classes = useStyles();

  return (
    <FormControl size="small" className={classes.root}>
      <Select
        value={values[name] ? values[name] : ""}
        onChange={handleChange}
        name={name}
        className={classes.input}
        disableUnderline
        displayEmpty
        placeholder={placeholder}
        startAdornment={
          <InputAdornment position="start" className={classes.iconButton}>
            <img src={SearchIcon} alt="search" />
          </InputAdornment>
        }
      >
        {!defaultOption ? (
          <MenuItem value="">All</MenuItem>
        ) : (
          <MenuItem value="">{defaultOptionPlaceholder}</MenuItem>
        )}
        {optionList.map((option: any, index: any) => {
          return (
            <MenuItem value={option.value} key={index}>
              {option.name}
            </MenuItem>
          );
        })}
        8
      </Select>
    </FormControl>
  );
}

export default DropDownFilter;
