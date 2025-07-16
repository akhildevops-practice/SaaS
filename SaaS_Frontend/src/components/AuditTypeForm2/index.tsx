import React from "react";
import useStyles from "./styles";
import {
  Grid,
  InputAdornment,
  TextField,
} from "@material-ui/core";
type Props = {
  handleChange: any;
  formData: any;
  selectedData: any;
};

const AuditTypeForm2 = ({ handleChange, formData, selectedData }: Props) => {
  const classes = useStyles();
  return (
    <form
      data-testid="audit-system-form"
      autoComplete="off"
      className={classes.form}
    >
      <Grid
        container
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
      >
        <Grid item sm={12} md={6}>
          <Grid
            container
            style={{
              display: "flex",
              flexDirection: "column",
              // alignContent: "center",
            }}
          >
            <Grid item sm={12} md={5} className={classes.formTextPadding}>
              <strong>Auto Accept NC:</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <TextField
                fullWidth
                name="AutoAcceptNC"
                variant="outlined"
                placeholder="Enter Number Of Days to Auto Accept NC"
                size="small"
                type="number"
                value={formData.AutoAcceptNC}
                onChange={handleChange}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">Days</InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item sm={12} md={5} className={classes.formTextPadding}>
              <strong>Closure Reminder to Dept Head:</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <TextField
                fullWidth
                name="ClosureRemindertoDeptHead"
                variant="outlined"
                placeholder="Enter Number Of Days to Send Closure Reminder"
                size="small"
                type="number"
                value={formData.ClosureRemindertoDeptHead}
                onChange={handleChange}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">Days</InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item sm={12} md={6}>
          <Grid
            container
            style={{
              display: "flex",
              flexDirection: "column",
              // alignContent: "center",
            }}
          >
            <Grid item sm={12} md={5} className={classes.formTextPadding}>
              <strong>Closure Reminder to MCOE:</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <TextField
                fullWidth
                name="ClosureRemindertoMCOE"
                variant="outlined"
                placeholder="Enter Number Of Days to Send Closure Reminder"
                size="small"
                type="number"
                value={formData.ClosureRemindertoMCOE}
                onChange={handleChange}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">Days</InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* <Grid item sm={12} md={5} className={classes.formTextPadding}>
              <strong>Closure Owner:</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <FormControl
                fullWidth
                variant="outlined"
                // margin="normal"
                size="small"
              >
                <InputLabel htmlFor="VerificationOwner">
                  Select Owner
                </InputLabel>
                <Select
                  label=" Select Owner"
                  name="VerificationOwner"
                  value={
                    selectedData?.VerificationOwner ||
                    formData.VerificationOwner ||
                    ""
                  }
                  onChange={handleChange}
                >
                  <MenuItem value="NONE">NONE</MenuItem>
                  <MenuItem value="IMSC">IMSC</MenuItem>
                  <MenuItem value="MCOE">MCOE</MenuItem>
                </Select>
              </FormControl>
            </Grid> */}
          </Grid>
        </Grid>
      </Grid>
    </form>
  );
};

export default AuditTypeForm2;
