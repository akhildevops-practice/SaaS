import {
  InputAdornment,
  Grid,
  IconButton,
  Tooltip,
  TextField,
} from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import React from "react";
import { MdAdd } from 'react-icons/md';
import { MdDelete } from 'react-icons/md';
import useStyles from "./styles";
import { MdSearch } from 'react-icons/md';

type Props = {
  data?: any;
  name: string;
  setData?: any;
  keyName: string;
  fixedValue?: string;
  isEdit?: boolean;
  suggestions?: any;
  suggestionLabel?: any;
  hideTooltip?: boolean;
  disabled?: boolean;
};

/**
 * This component is responsible for the Dynamic Search Textfields in forms, It handles the adding and deletion of the textFields which supports autocomplete
 *
 */
function DynamicFormSearchField({
  data,
  name,
  setData,
  keyName,
  fixedValue,
  isEdit = false,
  suggestions,
  suggestionLabel,
  hideTooltip = true,
  disabled = false,
}: Props) {
  const classes = useStyles();

  /**
   * @method handleSearchChange
   * @param clauseName {string}
   * @param id {string}
   * @param clauseNumber {string}
   * @param i {number}
   * @returns nothing
   */
  const handleSearchChange = (
    clauseName: string,
    id: string,
    clauseNumber: string,
    i: number
  ) => {
    setData((prev: any) => {
      const currentFieldData = JSON.parse(JSON.stringify(data[name]));
      currentFieldData.splice(i, 1, {
        ...data[name][i],
        [keyName]: {
          name: clauseName,
          id: id,
          number: clauseNumber,
        },
      });
      return { ...prev, [name]: currentFieldData };
    });
  };

  /**
   * @method handleAddFields
   * @description Function to add a new dynamic field component
   * @returns nothing
   */
  const handleAddFields = () => {
    setData((prevState: any) => {
      return { ...prevState, [name]: [...data[name], { [keyName]: "" }] };
    });
  };

  /**
   * @method handleDeleteField
   * @description Function to remove a dynamic field component
   * @param index {number}
   * @returns nothing
   */
  const handleDeleteField = (index: number) => {
    setData((prevState: any) => {
      return {
        ...prevState,
        [name]: [...data[name].filter((item: any, i: number) => i !== index)],
      };
    });
  };
  return (
    <Grid container>
      {data&&data[name]?.map((val: any, i: number) => (
        <React.Fragment key={i}>
          <Grid item xs={12} md={11} className={classes.formBox}>
            <Autocomplete
              disabled={disabled}
              fullWidth
              id="combo-box-demo"
              options={suggestions?.filter((item: any) => {
                return (item?._id || item?.id) !== data?.[name]?.[0]?.item?.id;
              })}
              size="small"
              value={
                suggestions?.find(
                  (item: any) =>
                    (item?._id || item?.id) === data?.[name]?.[i]?.[keyName]?.id
                ) || null
              }
              onChange={(e: any, value: any) => {
                handleSearchChange(
                  value?.name ?? value?.documentName ?? value?.auditType,
                  value?._id ?? value?.id,
                  value?.number ?? "",
                  i
                );
              }}
              getOptionLabel={(option) => option[suggestionLabel]}
              renderInput={(params) => (
                <Tooltip
                  title={
                    !hideTooltip
                      ? `${
                          data?.[name]?.[i]?.[keyName]?.number ??
                          "Please select a clause"
                        }`
                      : ""
                  }
                >
                  <TextField
                    {...params}
                    // className={disabled ? classes.disabledTextField : ""}
                    InputProps={{
                      ...params.InputProps,
                      classes: { disabled: classes.disabledInput },
                      startAdornment: (
                        <InputAdornment position="start">
                          <MdSearch
                            style={{ fontSize: 18, paddingLeft: 5 }}
                          />
                        </InputAdornment>
                      ),
                    }}
                    placeholder={`${
                      (data?.[name]?.[i]?.[keyName]?.name ||
                        data?.[name]?.[i]?.[keyName]?.documentName) ??
                      "Search"
                    }`}
                    variant="outlined"
                    size="small"
                  />
                </Tooltip>
              )}
            />
          </Grid>
          <Grid item xs={2} md={1}>
            {data[name]?.length > 1 &&
              !disabled &&
              !(data?.[name]?.[i]?.[keyName] === fixedValue && isEdit) && (
                <Grid item xs={6} md={2}>
                  <Tooltip title="Remove field">
                    <IconButton
                      disabled={disabled}
                      data-testid="field-delete-button"
                      onClick={() => {
                        handleDeleteField(i);
                      }}
                    >
                      <MdDelete fontSize="small" color="primary" />
                    </IconButton>
                  </Tooltip>
                </Grid>
              )}
            {i === data?.[name]?.length - 1 && !disabled && (
              <Grid item xs={6} md={1}>
                <Tooltip title={`Add a new "${name}" field`}>
                  <IconButton
                    disabled={disabled}
                    style={{ marginLeft: "10px" }}
                    data-testid="field-add-button"
                    onClick={handleAddFields}
                  >
                    <MdAdd fontSize="small" color="primary" />
                  </IconButton>
                </Tooltip>
              </Grid>
            )}
          </Grid>
        </React.Fragment>
      ))}
    </Grid>
  );
}

export default DynamicFormSearchField;
