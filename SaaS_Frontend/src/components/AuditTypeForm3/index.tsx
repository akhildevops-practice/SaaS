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

const AuditTypeForm3 = ({ handleChange, formData, selectedData }: Props) => {
  const classes = useStyles();
  return (
    <form
      data-testid="audit-system-form"
      autoComplete="off"
      className={classes.form}
    >
      <Grid container justifyContent="space-between" spacing={2}>
        <Grid item sm={12} md={6}>
          <Grid
            container
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Grid item sm={12} md={4} className={classes.formTextPadding}>
              <strong>Auditee Reminder :</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <TextField
                fullWidth
                name="AuditeeReminder"
                variant="outlined"
                placeholder="Enter Number Of Days To Remind Auditee"
                size="small"
                type="number"
                value={formData.AuditeeReminder}
                onChange={handleChange}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">Days</InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item sm={12} md={4} className={classes.formTextPadding}>
              <strong>Escalation to MCOE:</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <TextField
                fullWidth
                name="EscalationtoMCOE"
                variant="outlined"
                placeholder="Enter Number Of Days For MCOE Escalation"
                size="small"
                type="number"
                value={formData.EscalationtoMCOE}
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
              alignContent: "start",
            }}
          >
            <Grid item sm={12} md={5} className={classes.formTextPadding}>
              <strong>Escalation to Department Head :</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <TextField
                fullWidth
                name="EscalationtoDepartmentHead"
                variant="outlined"
                placeholder="Enter Number Of Days for Department Head Escalation"
                size="small"
                type="number"
                value={formData.EscalationtoDepartmentHead}
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
      </Grid>
    </form>
  );
};

export default AuditTypeForm3;
