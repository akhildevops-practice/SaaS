import {
  FormControl,
  Grid,
  MenuItem,
  Select,
  TextField,
} from "@material-ui/core";
import { IKpiReportSchema } from "../../../schemas/kpiReportSchema";
import getAppUrl from "../../../utils/getAppUrl";
import useStyles from "./styles";

type Props = {
  reportValues: IKpiReportSchema;
  businessUnitOptions: { value: string; label: string }[];
  entityOptions: { value: string; label: string }[];
};

function KpiReportForm2({
  reportValues,
  businessUnitOptions,
  entityOptions,
}: Props) {
  const classes = useStyles();
  const realmName = getAppUrl();

  return (
    <form autoComplete="off" className={classes.form}>
      <Grid
        container
        alignItems="center"
        justifyContent="flex-start"
        spacing={2}
      >
        <Grid item xs={4} md={2} className={classes.formTextPadding}>
          <strong>Organisation</strong>
        </Grid>
        <Grid item xs={8} md={10}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            name="orgName"
            value={realmName}
            disabled
          />
        </Grid>

        <Grid item xs={4} md={2} className={classes.formTextPadding}>
          <strong>Business Unit</strong>
        </Grid>
        <Grid item xs={8} md={4}>
          <FormControl
            className={classes.formControl}
            variant="outlined"
            size="small"
          >
            <Select
              disabled
              name="businessUnitFieldName"
              value={reportValues.businessUnitFieldName}
            >
              {businessUnitOptions.map((bu: any) => (
                <MenuItem key={bu.value} value={bu.value}>
                  {bu.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={4} md={2} className={classes.formTextPadding}>
          <strong>Entity</strong>
        </Grid>
        <Grid item xs={8} md={4}>
          <FormControl
            className={classes.formControl}
            variant="outlined"
            size="small"
          >
            <Select
              disabled
              name="entityFieldName"
              value={reportValues.entityFieldName}
            >
              {entityOptions.map((en: any) => (
                <MenuItem key={en.value} value={en.value}>
                  {en.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </form>
  );
}

export default KpiReportForm2;
