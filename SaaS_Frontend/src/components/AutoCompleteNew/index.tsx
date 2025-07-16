import { Avatar, ListItemAvatar, ListItemText, MenuItem, TextField } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import React from "react";
import { API_LINK } from "../../config";
import useStyles from "./styles";

type Props = {
  suggestionList: any;
  name: any;
  keyName: any;
  formData: any;
  setFormData: any;
  getSuggestionList: any;
  defaultValue: any;
  multiple?: boolean;
  type?: string;
  showAvatar?: boolean;
  labelKey?: string;
  secondaryLabel?: string;
  disabled?: any;
  fetchSecondarySuggestions?: any;
};

function AutoCompleteNew({
  suggestionList,
  name,
  formData,
  setFormData,
  keyName,
  getSuggestionList,
  defaultValue,
  multiple = true,
  type = "normal",
  showAvatar,
  labelKey = "email",
  secondaryLabel,
  disabled = false,
  fetchSecondarySuggestions,
}: Props) {


  const classes = useStyles();

  const handleChange = (e: any, value: any) => {
    setFormData({
      ...formData,
      [keyName]: value,
    });
    fetchSecondarySuggestions?.();
  };
  const handleTextChange = (e: any) => {
    getSuggestionList(e.target.value, type);
  };

  return (
    suggestionList && (
      <Autocomplete
        key={formData[keyName]}
        multiple={multiple}
        options={suggestionList}
        onChange={(e, value) => handleChange(e, value)}
        getOptionLabel={(option: any) => {return secondaryLabel ? `${option[labelKey]} ${option[secondaryLabel]}` : option[labelKey]}}
        getOptionSelected={(option, value) => option.id === value.id}
        limitTags={2}
        size="small"
        value={formData[keyName]}
        defaultValue={defaultValue}
        disabled={disabled}
        filterSelectedOptions
        renderOption={(option) => {
          if(showAvatar===true){
          return (
            <>
              <div>
                <MenuItem key={option.id}>
                  <ListItemAvatar>
                    <Avatar>
                      <Avatar src={`${API_LINK}/${option.avatar}`} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={option.value}
                    secondary={option.email}
                  />
                </MenuItem>
              </div>
            </>
          );
          }
        }}
        renderInput={(params) => {
          return (
            <TextField
              {...params}
              variant="outlined"
              label={name}
              placeholder={name}
              InputProps={{
                ...params.InputProps,
                classes: { disabled: classes.disabledInput },
              }}
              onChange={handleTextChange}
              size="small"
            />
          );
        }}
      />
    )
  );
}

export default AutoCompleteNew;
