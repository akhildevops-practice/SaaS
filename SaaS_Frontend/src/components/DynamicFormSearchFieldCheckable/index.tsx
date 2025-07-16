import {
  InputAdornment,
  Grid,
  IconButton,
  Tooltip,
  TextField,
} from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import React, { useEffect } from "react";
import { MdAdd } from 'react-icons/md';
import { MdDelete } from 'react-icons/md';
import useStyles from "./styles";
import { MdSearch } from 'react-icons/md';
import { MdCheckCircleOutline } from 'react-icons/md';
import { MdCheckCircle } from 'react-icons/md';
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
  verticalLabel?: string;
  checkedFields?: any;
  setCheckedFields?: any;
};

/**
 * This component is responsible for the Dynamic Search Textfields in forms, It handles the adding and deletion of the textFields which supports autocomplete
 *
 */
function DynamicFormSearchFieldCheckable({
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
  verticalLabel,
  checkedFields,
  setCheckedFields,
}: Props) {
  const classes = useStyles();

  // Toggle the checked status of a field
  // Toggle the checked status of a field
  const toggleChecked = (index: number) => {
    const auditor = data[name][index];
    if (
      checkedFields.some(
        (checkedAuditor: any) => checkedAuditor.id === auditor[keyName].id
      )
    ) {
      // If auditor is already checked, remove them
      setCheckedFields((prevState: any) =>
        prevState.filter(
          (checkedAuditor: any) => checkedAuditor.id !== auditor[keyName].id
        )
      );
    } else {
      // Otherwise, add them to the checked list
      setCheckedFields((prevState: any) => [...prevState, auditor[keyName]]);
    }
  };

  useEffect(() => {
    setCheckedFields(new Array(data[name]?.length).fill(false));
  }, [data, name]);

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
      {verticalLabel && (
        <Grid item xs={2} md={2}>
          <div
            style={{
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: "10px",
            }}
          >
            {verticalLabel}
          </div>
        </Grid>
      )}

      {data[name]?.map((val: any, i: number) => (
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
              onChange={(e: any, value: any) => {
                handleSearchChange(
                  value?.name ?? value?.documentName,
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
                    InputProps={{
                      ...params.InputProps,
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
            {data[name]?.length > 1 && (
              <Tooltip title="Mark as completed">
                <IconButton
                  disabled={disabled}
                  data-testid="field-check-button"
                  onClick={() => toggleChecked(i)}
                >
                  {checkedFields.some(
                    (checkedAuditor: any) =>
                      checkedAuditor.id === val[keyName].id
                  ) ? (
                    <MdCheckCircle fontSize="small" color="primary" />
                  ) : (
                    <MdCheckCircleOutline fontSize="small" color="primary" />
                  )}
                </IconButton>
              </Tooltip>
            )}
            {i === data?.[name]?.length - 1 && (
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

export default DynamicFormSearchFieldCheckable;
