import React, { useState } from "react";
import Paper from "@material-ui/core/Paper";
import SearchIcon from "../../../assets/SearchIcon.svg";
import { IconButton, TextField } from "@material-ui/core";
import InputAdornment from "@material-ui/core/InputAdornment";
import useStyles from "../styles";
import { MdClose } from "react-icons/md";

type Props = {
  handleChange?: any;
  placeholder: string;
  name: string;
  values: any;
  handleApply: any;
  endAdornment?: any;
  handleClickDiscard?: any;
};

/**
 * This is the Search Bar UI
 *
 */

function SearchBar({
  handleChange,
  placeholder,
  name,
  values,
  handleApply,
  endAdornment = false,
  handleClickDiscard,
}: Props) {
  const classes = useStyles();
  const [inputValue, setInputValue] = useState("");
  const [enterPress, setEnterPress] = useState(false);
  const handleKeyPress = (event: any) => {
    if (event.key === "Enter") {
      setEnterPress(true);
      handleChange(event);
    }
  };

  const handleInputChange = (event: any) => {
    setEnterPress(false);
    setInputValue(event.target.value);
  };

  return (
    <>
      {/* <Paper
        style={{
          width: "285px",
          height: "33px",
          float: "right",
          // margin: "11px",
          borderRadius: "20px",
          border: "1px solid #dadada",
        }}
        component="form"
        data-testid="search-field-container"
        elevation={0}
        variant="outlined"
        className={classes.root}
        onSubmit={(e) => {
          e.preventDefault();
          handleApply();
        }}
      > */}
      <TextField
        className={classes.input}
        name={name}
        style={{
          width: "285px",
          borderRadius: "20px",
          border: "1px solid #dadada",
          padding: "3px 0px",
        }}
        value={inputValue}
        placeholder={placeholder}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
        inputProps={{
          "data-testid": "search-field",
        }}
        InputProps={{
          disableUnderline: true,
          startAdornment: (
            <InputAdornment position="start" className={classes.iconButton}>
              <img src={SearchIcon} alt="search" />
            </InputAdornment>
          ),
          endAdornment: (
            <>
              {endAdornment && inputValue && (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => {
                      if (enterPress) {
                        handleClickDiscard();
                      }
                      setInputValue("");
                    }}
                  >
                    <MdClose fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )}
            </>
          ),
          // classes: {
          //   input: classes.resize,
          // },
        }}
      />
      {/* </Paper> */}
    </>
  );
}

export default SearchBar;
