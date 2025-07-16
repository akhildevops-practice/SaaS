import { Grid, IconButton, Tooltip, TextField } from "@material-ui/core";
import React, { useState } from "react";
import { MdAdd } from 'react-icons/md';
import { MdDelete } from 'react-icons/md';
import useStyles from "./styles";

type Props = {
  data: any;
  name: string;
  setData: any;
  keyName: string;
  fixedValue?: string;
  isEdit?: boolean;
  disabled: boolean;
};

/**
 * This component is responsible for the Dynamic Textfields in forms, It handles the adding and deletion of the textFields
 *
 */

function DynamicFormFieldsNew({
  data,
  name,
  setData,
  keyName,
  fixedValue,
  disabled,
  isEdit = false,
}: Props) {
  const classes = useStyles();
  const [count, setCount] = useState(0);

  /**
   * @method handleChange
   * @description Function to handle input field value changes and update the recoil state with the latest values
   * @param e {any}
   * @param i {number}
   * @returns nothing
   */
  const handleChange = (e: any, i: number) => {
    setData((prevState: any) => {
      const currentFieldData = JSON.parse(JSON.stringify(data[name]));
      currentFieldData.splice(i, 1, {
        ...data[name][i],
        [keyName]: e.target.value,
      });
      return { ...prevState, [name]: currentFieldData };
    });
  };

  /**
   * @method handleAddFields
   * @description Function to add a new dynamic field component
   * @returns nothing
   */
  const handleAddFields = () => {
    if (count <= 3) {
      setCount(count + 1);
      setData((prevState: any) => {
        return { ...prevState, [name]: [...data[name], { [keyName]: "" }] };
      });
    }
  };

  /**
   * @method handleDeleteField
   * @description Function to remove a dynamic field component
   * @param index {number}
   * @returns nothing
   */
  const handleDeleteField = (index: number) => {
    setData((prevState: any) => {
      setCount(count - 1);
      return {
        ...prevState,
        [name]: [...data[name].filter((item: any, i: number) => i !== index)],
      };
    });
  };

  return (
    <Grid container spacing={2}>
      {data[name]?.map((val: any, i: number) => (
        <React.Fragment key={i}>
          <Grid item container xs={6} sm={6} md={8}>
            <Grid
              item
              xs={12}
              sm={12}
              md={12}
              className={classes.formTextPadding}
            >
              <strong>
                <span className={classes.label}>{`Why ${i + 1}`} :</span>
              </strong>
            </Grid>
            <Grid item xs={12} sm={12} md={12}>
              <TextField
                fullWidth
                name={keyName}
                value={val[keyName]}
                disabled={disabled}
                minRows={2}
                multiline
                variant="outlined"
                onChange={(e) => {
                  handleChange(e, i);
                }}
                size="small"
                inputProps={{
                  "data-testid": "dynamic-form-field",
                }}
              />
            </Grid>
          </Grid>
          {/* <Grid item xs={12} sm={12} md={1}></Grid> */}
          <Grid
            item
            xs={2}
            md={2}
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "25px",
            }}
          >
            <Grid container spacing={4}>
              {data[name].length > 1 &&
                !(data[name][i][keyName] === fixedValue && isEdit) && (
                  <Grid item xs={6} md={1}>
                    <Tooltip title="Remove field">
                      <IconButton
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
              {i === data[name].length - 1 &&
                !(data[name][i][keyName] === "") &&
                count <= 3 && (
                  <Grid item xs={6} md={1}>
                    <Tooltip title={`Add a new "${name}" field`}>
                      <IconButton
                        data-testid="field-add-button"
                        onClick={handleAddFields}
                      >
                        <MdAdd fontSize="small" color="primary" />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                )}
            </Grid>
          </Grid>
        </React.Fragment>
      ))}

      {/* <Grid item container xs={12} sm={12} md={6} spacing={1}>
        <Grid item xs={12} sm={12} md={4}>
          <Typography className={classes.multiline__label}>Why </Typography>
        </Grid>
        <Grid item xs={12} sm={12} md={8}>
          <TextField
            disabled={disabled}
            variant="outlined"
            name="comment"
            value=""
            fullWidth
            size="small"
            multiline
            minRows={4}
            onChange={() => {}}
          />
        </Grid>
      </Grid>
      <Grid item xs={12} sm={12} md={1}></Grid>
      <Grid item container xs={12} sm={12} md={5} spacing={1}>
        <Grid item xs={12} sm={12} md={4}>
          <Typography className={classes.multiline__label}>
            target date of completion*
          </Typography>
        </Grid>
        <Grid item xs={12} sm={12} md={8}>
          <TextField
            disabled={disabled}
            variant="outlined"
            name="date"
            type="date"
            fullWidth
            size="small"
            value=""
            onChange={() => {}}
            // inputProps={{
            //   min: moment(auditDate).format("YYYY-MM-DD"),
            // }}
          />
        </Grid>
      </Grid>
      <Grid item xs={12} sm={12} md={1}></Grid> */}
    </Grid>
  );
}
export default DynamicFormFieldsNew;
