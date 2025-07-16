import React from "react";
import useStyles from "./styles";
import { useRecoilState } from "recoil";
import { orgFormData } from "../../recoil/atom";
import { Grid, TextField } from "@material-ui/core";

type Props = {};

/**
 * This is the whole UI for the Technical Config Form.
 */

function TechnicalConfigForm({}: Props) {
  const [formData, setFormData] = useRecoilState(orgFormData);
  const classes = useStyles();

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form
      data-testid="technical-config-form"
      autoComplete="off"
      className={classes.form}
    >
      <Grid container>
        <Grid item sm={12} md={6}>
          <Grid container>
            <Grid item sm={12} md={4} className={classes.formTextPadding}>
              <strong>Login URL</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <TextField
                fullWidth
                // label='Login URL'
                name="loginUrl"
                value={formData.loginUrl}
                inputProps={{
                  "data-testid": "login-url",
                }}
                variant="outlined"
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid item sm={12} md={4} className={classes.formTextPadding}>
              <strong>Client ID</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <TextField
                fullWidth
                // label='Client ID'
                name="clientID"
                value={formData.clientID}
                variant="outlined"
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid item sm={12} md={4} className={classes.formTextPadding}>
              <strong>Realm Name</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <TextField
                fullWidth
                // label='Realm Name'
                name="organizationName"
                value={formData.realmName}
                variant="outlined"
                onChange={handleChange}
                size="small"
                disabled
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} md={1}></Grid>
        <Grid item sm={12} md={5}>
          <Grid container>
            <Grid item sm={12} md={4} className={classes.formTextPadding}>
              <strong>App URL</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <TextField
                fullWidth
                // label='Logout URL'
                name="logoutUrl"
                value={formData.logoutUrl}
                variant="outlined"
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid item sm={12} md={4} className={classes.formTextPadding}>
              <strong>Client Secret</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <TextField
                fullWidth
                // label='Client Secret'
                name="clientSecret"
                value={formData.clientSecret}
                variant="outlined"
                onChange={handleChange}
                size="small"
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </form>
  );
}

export default TechnicalConfigForm;
