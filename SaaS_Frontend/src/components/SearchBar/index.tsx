import React from "react";
import Paper from "@material-ui/core/Paper";
import SearchIcon from "../../assets/SearchIcon.svg";
import { IconButton, TextField, useMediaQuery } from "@material-ui/core";
import InputAdornment from "@material-ui/core/InputAdornment";
import useStyles from "./styles";
import { MdClose } from "react-icons/md";
import { AiOutlineSend } from "react-icons/ai";

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
  const matches = useMediaQuery("(min-width:786px)");
  const smallScreen = useMediaQuery("(min-width:450px)");
  return (
    <>
      {/* <Paper
        style={{
          width: smallScreen ? "285px" : "95%",
          // height: "40px",
          float: "right",
          // margin: "11px",
          borderRadius: "20px",
          border: "1px solid #dadada",
          margin: "0px 10px 0px 0px ",
          padding: "5px 12px 5px 0px",
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
        value={values[name]}
        placeholder={placeholder}
        onChange={handleChange}
        inputProps={{
          "data-testid": "search-field",
        }}
        style={{
          margin: "0px 0px",
          border: "1px solid #dadada",
          borderRadius: "20px",
          padding: "5px 12px 5px 0px ",
          width: "320px",
        }}
        InputProps={{
          disableUnderline: true,
          startAdornment: (
            <InputAdornment position="start" className={classes.iconButton}>
              <img src={SearchIcon} alt="search" style={{ color: "black" }} />
            </InputAdornment>
          ),
          endAdornment: (
            <>
              {endAdornment && (
                <>
                  {values[name] && (
                    <InputAdornment position="end">
                      <MdClose
                        fontSize="small"
                        onClick={handleClickDiscard}
                        style={{ cursor: "pointer", color: "black" }}
                      />
                    </InputAdornment>
                  )}
                  <InputAdornment position="end">
                    <AiOutlineSend
                      size={18}
                      onClick={handleApply}
                      style={{ cursor: "pointer" }}
                    />
                  </InputAdornment>
                </>
              )}
            </>
          ),
        }}
      />
      {/* </Paper> */}
    </>
  );
}

export default SearchBar;
