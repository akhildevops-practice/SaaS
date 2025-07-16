import {
  Avatar,
  Chip,
  TextField,
} from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import React, { useState } from "react";
import {
  makeStyles,
  createMuiTheme,
  ThemeProvider,
} from "@material-ui/core/styles";
import { API_LINK } from "config";
const useStyles = makeStyles((theme) => ({
  autocomplete: {
    "& .MuiOutlinedInput-input": {
      fontSize: "14px",
      backgroundColor: "blue",
    },
  },
}));

const theme = createMuiTheme({
  typography: {
    fontSize: 12,
  },
  overrides: {
    MuiOutlinedInput: {
      input: {
        fontSize: 14,
      },
    },
  },
});

type Props = {
  suggestionList: any;
  name: any;
  keyName: any;
  formData: any;
  setFormData: any;
  handleChangeFromForm?: any;
  getSuggestionList?: any;
  defaultValue: any;
  multiple?: boolean;
  type?: string;
  showLabel?: boolean;
  freesolo?: boolean;
  labelKey?: string;
  secondaryLabel?: string;
  disabled?: any;
  fetchSecondarySuggestions?: any;
  showAvatar?: any;
};

function AutoComplete({
  suggestionList,
  name,
  formData,
  setFormData,
  keyName,
  handleChangeFromForm,
  getSuggestionList,
  defaultValue,
  multiple = true,
  type = "normal",
  showLabel,
  labelKey = "email",
  showAvatar = true,
  secondaryLabel,
  disabled = false,
  freesolo = false,
  fetchSecondarySuggestions,
}: Props) {
  const [hoveredUserId, setHoveredUserId] = useState(null); // Change the state name and default value
  const [previewUser, setPreviewUser] = useState(null);
  const [isPopUpOpen, setIsPopUpOpen] = useState(false);
  const handleChange = (e: any, value: any) => {
    if (keyName === "auditorName") {
      setFormData({
        ...formData,
        unit: value,
        [keyName]: value,
      });
    }
    if (
      (keyName === "locationId" ||
        keyName === "location" ||
        keyName === "locationName") &&
      Array.isArray(value)
    ) {
      const allOption = { id: "All", locationName: "All" };
      if (value?.find((option: any) => option?.id === "All")) {
        setFormData({ ...formData, [keyName]: [allOption] });
      } else {
        setFormData({
          ...formData,
          [keyName]: value.filter((option: any) => option?.id !== "All"),
        });
      }
    } else {
      setFormData({
        ...formData,
        [keyName]: value,
      });
    }

    fetchSecondarySuggestions?.();
  };
  const handleTextChange = (e: any) => {
    getSuggestionList(e.target.value, type);
  };
  const classes = useStyles();

  const openPopUp = () => {
    setIsPopUpOpen(true);
  };
  return (
    suggestionList && (
      <ThemeProvider theme={theme}>
        <div style={{ position: "relative" }}>
          <Autocomplete
            freeSolo={freesolo}
            key={formData[keyName]}
            multiple={multiple}
            options={suggestionList}
            onChange={
              handleChangeFromForm ? handleChangeFromForm : handleChange
            }
            getOptionLabel={(option: any) =>{
              return secondaryLabel
              ? `${option[labelKey]} ${option[secondaryLabel]}`
              : option[labelKey]
            }
              
            }
            getOptionSelected={(option, value) => option.id === value.id}
            limitTags={2}
            size="small"
            value={formData[keyName]}
            defaultValue={defaultValue}
            disabled={disabled}
            classes={{ paper: classes.autocomplete }}
            filterSelectedOptions
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label={name}
                placeholder={name}
                onChange={handleTextChange}
                size="small"
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const initials = option.name
                  ?.split(" ")
                  ?.map((name: any) => name[0])
                  ?.slice(0, 2)
                  ?.join("");
                return (
                  <div
                    key={index}
                    // onMouseEnter={() => {
                    //   setHoveredUserId(option.id);
                    // }}
                  >
                    <Chip
                      avatar={
                        option.avatar !== undefined ? (
                          <Avatar
                            src={`${API_LINK}/${option.avatar}`}
                            alt="profile"
                          >
                            {initials}
                          </Avatar>
                        ) : (
                          <Avatar alt="profile">{initials}</Avatar>
                        )
                      }
                      label={option[labelKey]}
                      {...getTagProps({ index })}
                    />
                  </div>
                );
              })
            }
            renderOption={(option) => {
              const initials = option.name
                ?.split(" ")
                ?.map((name: any) => name[0])
                ?.slice(0, 2)
                ?.join("");
              console.log(
                "optionsLabelKey",
                option,
                labelKey,
                option[labelKey]
              );
              return (
                <div
                // onMouseEnter={() => {
                //   setHoveredUserId(option.id);
                // }}
                // onMouseLeave={() => {
                //   setHoveredUserId(null);
                // }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                      marginLeft: "5%",
                    }}
                  >
                    {/* {option.avatar && (
                      <Avatar
                        src={`${API_LINK}/${option.avatar}`}
                        alt="profile"
                      >
                        {initials}
                      </Avatar>
                    )} */}
                  {showAvatar ? (option.avatar && option.avatar !== undefined ? ( // Check if option.avatar is defined
                      <Avatar
                        src={`${API_LINK}/${option.avatar}`} // Render the src if option.avatar has a value
                        alt="profile"
                      >
                        {initials}
                      </Avatar>
                    ) : (
                      // option.avatar &&
                      <Avatar alt="profile">{initials}</Avatar>
                    )):""}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",

                        minWidth: "100%",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "14px",
                          minWidth: "100%",
                          paddingLeft: "5%",
                        }}
                      >
                        {option[labelKey]}
                      </div>
                      <div style={{ fontSize: "10px" }}>{option.email}</div>
                    </div>
                  </div>
                </div>
              );
            }}
          />
          {/* <div
            onMouseEnter={() => {
            }}
            onMouseLeave={() => {
              setHoveredUserId(null);
            }}
          >
            {hoveredUserId && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  zIndex: 5000,
                }}
              >
                <UserPreview
                  record={suggestionList.find(
                    (user: any) => user.id === hoveredUserId
                  )}
                  onOpenPopUp={openPopUp}
                />
              </div>
            )}
          </div> */}
        </div>
        {/* {isPopUpOpen && <PopUpWindow />} */}
      </ThemeProvider>
    )
  );
}

export default AutoComplete;
