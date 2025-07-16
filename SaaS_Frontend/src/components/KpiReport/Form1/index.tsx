import {
  Chip,
  FormControl,
  Grid,
  MenuItem,
  Select,
  TextField,
} from "@material-ui/core";
import useStyles from "./styles";
import { Autocomplete } from "@material-ui/lab";
import { IKpiReportSchema } from "../../../schemas/kpiReportSchema";

type Props = {
  reportValues: IKpiReportSchema;
  locationOptions: { value: string; label: string }[];
  sourceOptions: { value: string; label: string }[];
  userOptions: { value: string; label: string }[];
  reportReaderOptions: { value: string; label: string }[];
  readerLevelOptions: any;
  entityOptions: any;
  currentYear: any;
  read: any;
};

const frequencyOptions = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

function KpiReportForm1({
  reportValues,
  locationOptions,
  sourceOptions,
  userOptions,
  reportReaderOptions,
  readerLevelOptions,
  entityOptions,
  currentYear,
  read,
}: Props) {
  const classes = useStyles();
  console.log("reportvalues", reportValues.entityFieldName, entityOptions);
  return (
    <form autoComplete="off" className={classes.form}>
      <Grid
        container
        alignItems="center"
        justifyContent="flex-start"
        spacing={1}
      >
        <Grid item sm={12} md={6}>
          <Grid
            container
            style={{
              display: "flex",
              flexDirection: "column",
              paddingLeft: "100px",
              //alignContent: "center",
            }}
          >
            <Grid item xs={2} md={4} className={classes.formTextPadding}>
              <strong>Location *</strong>
            </Grid>
            <Grid item xs={12} sm={8}>
              <FormControl
                className={classes.formControl}
                variant="outlined"
                size="small"
                required
              >
                <Select
                  disabled
                  name="location"
                  label="Location"
                  value={reportValues.location}
                  className={classes.disabledMuiSelect}
                  // disabled={read}
                >
                  {locationOptions.map((obj) => (
                    <MenuItem key={obj.value} value={obj.value}>
                      {obj.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={2} md={4} className={classes.formTextPadding}>
              <strong>Report name *</strong>
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                disabled
                fullWidth
                variant="outlined"
                size="small"
                name="kpiReportTemplateName"
                value={reportValues.kpiReportInstanceName}
                className={classes.disabledTextField}
              />
            </Grid>
            <Grid item xs={2} md={4} className={classes.formTextPadding}>
              <strong>Readers level *</strong>
            </Grid>
            <Grid item xs={12} sm={8}>
              <FormControl
                className={classes.formControl}
                variant="outlined"
                size="small"
              >
                <Select
                  disabled
                  name="readersLevel"
                  value={reportValues.readersLevel}
                  className={classes.disabledMuiSelect}
                >
                  <MenuItem value={readerLevelOptions.ALL_ORG}>
                    {readerLevelOptions.ALL_ORG}
                  </MenuItem>
                  <MenuItem value={readerLevelOptions.LOC_LEV}>
                    {readerLevelOptions.LOC_LEV}
                  </MenuItem>
                  <MenuItem value={readerLevelOptions.ENT_LEV}>
                    {readerLevelOptions.ENT_LEV}
                  </MenuItem>
                  <MenuItem value={readerLevelOptions.USR_LEV}>
                    {readerLevelOptions.USR_LEV}
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={2} md={4} className={classes.formTextPadding}>
              <strong>Email recipients *</strong>
            </Grid>
            <Grid item xs={12} sm={8}>
              <Autocomplete
                disabled
                multiple
                filterSelectedOptions
                disableCloseOnSelect
                size="small"
                getOptionLabel={(option) => option.label}
                options={userOptions}
                value={userOptions.filter((obj: any) =>
                  reportValues.emailRecipients.includes(obj.value)
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option: any, index: any) => {
                    return (
                      <Chip
                        key={index}
                        size="small"
                        label={option.label}
                        {...getTagProps({ index })}
                      />
                    );
                  })
                }
                renderInput={(params: any) => (
                  <TextField {...params} variant="outlined" />
                )}
              />
            </Grid>
            <Grid item xs={2} md={4} className={classes.formTextPadding}>
              <strong>Entity</strong>
            </Grid>
            <Grid item xs={12} sm={8}>
              <FormControl
                className={classes.formControl}
                variant="outlined"
                size="small"
              >
                <Select
                  disabled
                  name="entityFieldName"
                  value={reportValues.entityFieldName}
                  className={classes.disabledMuiSelect}
                >
                  {entityOptions?.map((en: any) => (
                    <MenuItem key={en.value} value={en.value}>
                      {en.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Grid>
        <Grid item sm={12} md={6}>
          <Grid
            container
            style={{
              display: "flex",
              flexDirection: "column",
              paddingLeft: "20px",
              // alignContent: "center",
            }}
          >
            <Grid item xs={2} md={4} className={classes.formTextPadding}>
              <strong>Source*</strong>
            </Grid>
            <Grid item xs={12} sm={8}>
              <Autocomplete
                disabled
                multiple
                filterSelectedOptions
                disableCloseOnSelect
                size="small"
                getOptionLabel={(option) => option.label}
                options={sourceOptions}
                value={sourceOptions.filter((obj: any) =>
                  reportValues.sources.includes(obj.value)
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option: any, index: any) => {
                    return (
                      <Chip
                        key={index}
                        size="small"
                        label={option.label}
                        {...getTagProps({ index })}
                      />
                    );
                  })
                }
                renderInput={(params: any) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Sources"
                    required
                  />
                )}
              />
            </Grid>

            <Grid item xs={2} md={4} className={classes.formTextPadding}>
              <strong>Report frequency *</strong>
            </Grid>

            <Grid item xs={12} sm={8}>
              <TextField
                disabled
                fullWidth
                variant="outlined"
                size="small"
                name="reportFrequency"
                value={reportValues.reportFrequency}
                className={classes.disabledTextField}
              />
            </Grid>
            <Grid item xs={2} md={4} className={classes.formTextPadding}>
              <strong>Report readers *</strong>
            </Grid>
            <Grid item xs={12} sm={8}>
              <Autocomplete
                disabled
                multiple
                filterSelectedOptions
                disableCloseOnSelect
                size="small"
                getOptionLabel={(option: any) => option.label}
                options={reportReaderOptions}
                value={reportReaderOptions.filter((obj: any) =>
                  reportValues.reportReaders.includes(obj.value)
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option: any, index: number) => {
                    return (
                      <Chip
                        key={index}
                        size="small"
                        label={option.label}
                        {...getTagProps({ index })}
                      />
                    );
                  })
                }
                renderInput={(params: any) => (
                  <TextField {...params} variant="outlined" />
                )}
              />
            </Grid>

            <Grid item xs={2} md={4} className={classes.formTextPadding}>
              <strong>Report editors *</strong>
            </Grid>
            <Grid item xs={12} sm={8}>
              <Autocomplete
                disabled
                multiple
                filterSelectedOptions
                disableCloseOnSelect
                size="small"
                getOptionLabel={(option) => option.label}
                options={userOptions}
                value={userOptions.filter((obj: any) =>
                  reportValues.reportEditors.includes(obj.value)
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option: any, index: any) => {
                    return (
                      <Chip
                        key={index}
                        size="small"
                        label={option.label}
                        {...getTagProps({ index })}
                      />
                    );
                  })
                }
                renderInput={(params: any) => (
                  <TextField {...params} variant="outlined" />
                )}
              />
            </Grid>
          </Grid>
          <Grid item xs={2} md={4} className={classes.formTextPadding}>
            <strong>Schedule</strong>
          </Grid>
          <Grid item xs={12} sm={8}>
            <TextField
              disabled
              fullWidth
              variant="outlined"
              size="small"
              name="schedule"
              value={reportValues.schedule}
              className={classes.disabledTextField}
            />
          </Grid>
        </Grid>
      </Grid>
    </form>
  );
}

export default KpiReportForm1;
