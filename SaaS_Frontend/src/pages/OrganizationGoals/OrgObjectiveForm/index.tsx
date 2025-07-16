import {
  Button,
  Grid,
  TextField,
} from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import React, { useEffect, useState } from "react";
import useStyles from "./styles";
// import CustomButton from "../CustomButton";
import { useSnackbar } from "notistack";
import { fiscalYearGen } from "../../../utils/fiscalYearGenerator";
import { useRecoilState } from "recoil";
import { objectiveData } from "../../../recoil/atom";

import CustomButton from "components/CustomButton";

type Props = {
  isEdit?: any;
  initVal: any;
  rerender?: any;
  handleDiscard: any;
  handleSubmit: any;
  isLoading: any;
  currentYear?: any;
};

/**
 * This is the Organization Objectives Form UI
 * The same form is used for editing and creating the organitization based on the @param isEdit
 */

function OrgObjectiveForm({
  initVal,
  isEdit = false,
  handleDiscard,
  handleSubmit,
  isLoading,
  rerender,
  currentYear,
}: Props) {
  const [values, setValues] = useState(initVal);
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [financialYear, setFinancialYear] = useState<any>([]);
  const [formData, setFormData] = useRecoilState(objectiveData);
  const validateTitle = (
    rule: any,
    value: string,
    callback: (error?: string) => void
  ) => {
    // Define regex pattern for allowed characters
    const TITLE_REGEX =
      /^[\u0000-\u007F\u0080-\uFFFFa-zA-Z0-9$&*()\-/\.,\?&%!#@€£`'"\~]+$/; // Allows letters, numbers, and specific symbols, but does not include < and >

    // Check for disallowed characters
    const DISALLOWED_CHARS = /[<>]/;

    // Check for more than two consecutive special characters
    const MORE_THAN_TWO_CONSECUTIVE_SPECIAL_CHARS =
      /[\/\-\.\$\€\£\?\&\*\(\)\%\#\!\@\`\'\"\~]{3,}/;

    // Check if the title starts with a special character
    const STARTS_WITH_SPECIAL_CHAR =
      /^[\/\-\.\$\€\£\?\&\*\(\)\%\#\!\@\`\'\"\~]/;

    if (!value || value.trim().length === 0) {
      callback("Text value is required.");
    } else if (DISALLOWED_CHARS.test(value)) {
      callback("Invalid text. Disallowed characters are < and >.");
    } else if (MORE_THAN_TWO_CONSECUTIVE_SPECIAL_CHARS.test(value)) {
      callback(
        "Invalid text. No more than two consecutive special characters are allowed."
      );
    } else if (STARTS_WITH_SPECIAL_CHAR.test(value)) {
      callback("Invalid text. Text should not start with a special character.");
    } else if (!TITLE_REGEX.test(value)) {
      callback(
        "Invalid text. Allowed characters include letters, numbers, commas, /, /, dots, and currency symbols."
      );
    } else {
      callback();
    }
  };
  // const handleChange = (e: any) => {
  //   setFormData({
  //     ...formData,
  //     [e.target.name]: e.target.value,
  //   });
  // };
  const [errors, setErrors] = React.useState({
    ObjectiveCategory: "",
    Description: "",
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Validate the input value using validateString
    const validationError = validateString(value);

    if (validationError) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: validationError,
      }));
      console.error(`Validation error for ${name}: ${validationError}`);
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "", // Clear error if input is valid
      }));
    }
  };

  const validateString = (input: string): string | null => {
    const allowedSpecialChars = "-()&.,!$/\\@_/";
    const isAllowedSpecialChar = (char: string): boolean =>
      allowedSpecialChars.includes(char);

    let consecutiveSpecialCount = 0;

    for (let i = 0; i < input.length; i++) {
      const char = input[i];

      if (/[\p{L}\p{N}\p{M}\s]/u.test(char)) {
        consecutiveSpecialCount = 0;
      } else if (isAllowedSpecialChar(char)) {
        consecutiveSpecialCount++;
        if (consecutiveSpecialCount > 2) {
          return "Special characters cannot appear more than twice consecutively.";
        }
      } else {
        return "Invalid character detected. Only letters, numbers, and specified special characters are allowed.";
      }

      if (i === 0 && isAllowedSpecialChar(char)) {
        return "Special characters are not allowed at the beginning of the input.";
      }
    }

    return null; // Return null if all checks pass
  };

  // console.log("formData", formData);

  useEffect(() => {
    setFinancialYear(fiscalYearGen());
    setValues(initVal);
  }, [initVal, rerender]);

  return (
    <>
      <form
        data-testid="org-admin-form"
        autoComplete="off"
        className={classes.form}
      >
        <Grid item sm={12} md={12}>
          <Grid container>
            <Grid
              item
              md={3}
              className={classes.formTextPadding}
              style={{ paddingLeft: "15px" }}
            >
              <strong>Objective Category*</strong>
            </Grid>
            <Grid item md={8} className={classes.formBox}>
              <TextField
                fullWidth
                label="Objective Category"
                name="ObjectiveCategory"
                value={formData.ObjectiveCategory}
                variant="outlined"
                onChange={handleChange}
                inputProps={{
                  "data-testid": "ObjectiveCategory",
                }}
                size="small"
                required
                error={!!errors.ObjectiveCategory} // Set error prop based on validation
                helperText={errors.ObjectiveCategory} // Display error message
              />
            </Grid>
            <Grid
              item
              sm={12}
              md={3}
              className={classes.formTextPadding}
              style={{ paddingLeft: "15px" }}
            >
              <strong>Description</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                name="Description"
                value={formData.Description}
                variant="outlined"
                onChange={handleChange}
                size="small"
                inputProps={{
                  "data-testid": "Description",
                }}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* <Grid item sm={12} md={5}>
            <Grid container>
              <Grid item sm={12} md={4} className={classes.formTextPadding}>
                <strong>Year*</strong>
              </Grid>
              <Grid item sm={12} md={8} className={classes.formBox}>
                <FormControl
                  variant="outlined"
                  size="small"
                  className={classes.formSelect}
                >
                 
                  <TextField
                    fullWidth
                    name="Year"
                    value={formData.Year ? formData.Year : currentYear}
                    variant="outlined"
                    size="small"
                    disabled
                  />
                </FormControl>
              </Grid>
              <Grid item sm={12} md={4} className={classes.formTextPadding}>
                <strong>Created On</strong>
              </Grid>
              <Grid item sm={12} md={8} className={classes.formBox}>
                <TextField
                  fullWidth
                  label="DD/MM/YYYY"
                  name="createdAt"
                  value={formData.createdAt}
                  variant="outlined"
                  onChange={handleChange}
                  inputProps={{
                    "data-testid": "createdAt",
                  }}
                  size="small"
                  disabled
                />
              </Grid>
            </Grid>
          </Grid> */}

        <div className={classes.buttonSection}>
          {isLoading ? (
            <CircularProgress />
          ) : (
            <>
              {isEdit ? (
                <>
                  <Button
                    className={classes.discardBtn}
                    onClick={handleDiscard}
                  >
                    Discard
                  </Button>

                  <CustomButton
                    text="Save"
                    handleClick={() => {
                      handleSubmit(formData);
                    }}
                  ></CustomButton>
                </>
              ) : (
                <>
                  <Button
                    className={classes.discardBtn}
                    onClick={handleDiscard}
                  >
                    Discard
                  </Button>
                  <CustomButton
                    text="Submit"
                    handleClick={() => {
                      if (formData.ObjectiveCategory.length) {
                        handleSubmit(formData);
                      } else {
                        enqueueSnackbar(`Form Cannot Contain Empty Fields`, {
                          variant: "error",
                        });
                      }
                    }}
                  ></CustomButton>
                </>
              )}
            </>
          )}
        </div>
      </form>
    </>
  );
}

export default OrgObjectiveForm;
