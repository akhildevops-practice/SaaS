import { Button, Grid, TextField } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import React, { useState } from "react";
import useStyles from "./styles";
import CustomButton from "../CustomButton";
import { useSnackbar } from "notistack";

type Props = {
  isEdit?: any;
  initVal: any;
  rerender?: any;
  handleDiscard: any;
  handleSubmit: any;
  isLoading: any;
};

function LocAdminForm({
  initVal,
  isEdit = false,
  handleDiscard,
  handleSubmit,
  isLoading,
  rerender,
}: Props) {
  const classes = useStyles();
  const [values, setValues] = useState(initVal);
  const { enqueueSnackbar } = useSnackbar();

  const handleChange = (e: any) => {
    setValues({
      ...values,
      [e.target.name]: e.target.value,
    });
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
              <strong>First Name*</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <TextField
                fullWidth
                // label='First Name'
                name="firstName"
                value={values.firstName}
                variant="outlined"
                onChange={handleChange}
                size="small"
                required
                inputProps={{
                  "data-testid": "first-name",
                }}
              />
            </Grid>
            <Grid item sm={12} md={4} className={classes.formTextPadding}>
              <strong>Last Name*</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <TextField
                fullWidth
                // label='Last Name'
                name="lastName"
                value={values.lastName}
                variant="outlined"
                onChange={handleChange}
                inputProps={{
                  "data-testid": "last-name",
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
              <strong>Username*</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <TextField
                fullWidth
                // label='Username'
                name="username"
                value={values.username}
                variant="outlined"
                onChange={handleChange}
                size="small"
                inputProps={{
                  "data-testid": "user-name",
                }}
                required
                disabled={isEdit}
              />
            </Grid>
            <Grid item sm={12} md={4} className={classes.formTextPadding}>
              <strong>Email Address*</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <TextField
                fullWidth
                // label='Email'
                name="email"
                value={values.email}
                variant="outlined"
                onChange={handleChange}
                inputProps={{
                  "data-testid": "email",
                }}
                size="small"
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
                <CustomButton
                  text="Save"
                  handleClick={() => {
                    handleSubmit(values);
                  }}
                />
              </>
            ) : (
              <>
                <Button className={classes.discardBtn} onClick={handleDiscard}>
                  Discard
                </Button>
                <CustomButton
                  text="Add"
                  handleClick={() => {
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
                />
              </>
            )}
          </>
        )}
      </div>
    </form>
  );
}

export default LocAdminForm;
