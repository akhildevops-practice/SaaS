import React, { useState } from "react";
import { Grid, TextField, CircularProgress, Button } from "@material-ui/core";
import { useStyles } from "./styles";
import { useSnackbar } from "notistack";
import { validateUserNames } from "utils/validateInput";

type Props = {
  isEdit?: any;
  initVal: any;
  rerender?: any;
  handleDiscard: any;
  handleSubmit: any;
  isLoading: any;
};

const ClauseDetailForm = ({
  isEdit,
  initVal,
  rerender,
  handleDiscard,
  handleSubmit,
  isLoading,
}: Props) => {
  const [values, setValues] = useState(initVal);
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  /**
   * @method handleChange
   * @description Function which handle input changes
   * @param e {any}
   * @returns nothing
   */
  const handleChange = (e: any) => {
    console.log("inside", e);
    if (e.target.name === "clauseName" || e.target.name === "clauseNumber") {
      validateUserNames(null, e.target.value, (error?: string) => {
        if (error) {
          enqueueSnackbar(`${error}`, { variant: "error" });
        } else {
          setValues({
            ...values,
            [e.target.name]: e.target.value,
          });
        }
      });
    } else {
      setValues({
        ...values,
        [e.target.name]: e.target.value,
      });
    }
  };

  React.useEffect(() => {
    setValues(initVal);
  }, [initVal, rerender]);

  return (
    <form
      data-testid="org-admin-form"
      autoComplete="off"
      className={classes.form}
    >
      <Grid container>
        <Grid item sm={12} md={6}>
          <Grid container>
            <Grid item sm={12} md={4} className={classes.formTextPadding}>
              <strong>Clause Number*</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <TextField
                fullWidth
                label="Clause Number"
                name="clauseNumber"
                variant="outlined"
                onChange={handleChange}
                size="small"
                required
                inputProps={{
                  "data-testid": "clause-number",
                }}
              />
            </Grid>
            <Grid item sm={12} md={4} className={classes.formTextPadding}>
              <strong>Description</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                variant="outlined"
                onChange={handleChange}
                inputProps={{
                  "data-testid": "clause-description",
                }}
                size="small"
                required
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} md={1}></Grid>
        <Grid item sm={12} md={5}>
          <Grid container>
            <Grid item sm={12} md={4} className={classes.formTextPadding}>
              <strong>Clause Name*</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <TextField
                fullWidth
                label="Clause Name"
                name="clauseName"
                variant="outlined"
                onChange={handleChange}
                size="small"
                inputProps={{
                  "data-testid": "clause-name",
                }}
                required
                disabled={isEdit}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <div className={classes.buttonSection}>
        {isLoading ? (
          <CircularProgress />
        ) : (
          <>
            {" "}
            {isEdit ? (
              <>
                <Button className={classes.discardBtn} onClick={handleDiscard}>
                  Discard
                </Button>
                <Button
                  onClick={() => {
                    handleSubmit(values);
                  }}
                >
                  Save
                </Button>
              </>
            ) : (
              <>
                <Button className={classes.discardBtn} onClick={handleDiscard}>
                  Discard
                </Button>
                <Button
                  onClick={() => {
                    if (
                      values.firstName.length &&
                      values.lastName.length &&
                      values.username.length &&
                      values.email.length
                    ) {
                      handleSubmit(values);
                    } else {
                      enqueueSnackbar(`Form Cannot Contain Empty Fields`, {
                        variant: "error",
                      });
                    }
                  }}
                >
                  Add
                </Button>
              </>
            )}
          </>
        )}
      </div>
    </form>
  );
};

export default ClauseDetailForm;
