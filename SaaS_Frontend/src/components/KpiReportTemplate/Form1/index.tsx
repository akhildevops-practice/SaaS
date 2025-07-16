import {
  Chip,
  FormControl,
  Grid,
  MenuItem,
  Select,
  TextField,
} from "@material-ui/core";
import { IKpiReportTemplateSchema } from "../../../schemas/kpiReportTemplateSchema";
import useStyles from "./styles";
import { Autocomplete } from "@material-ui/lab";
import { useState, useReducer, useEffect } from "react";
import { Cron, CronError } from "react-js-cron";
import "react-js-cron/dist/styles.css";

type Props = {
  templateValues: IKpiReportTemplateSchema;
  setTemplateValues: React.Dispatch<
    React.SetStateAction<IKpiReportTemplateSchema>
  >;
  locationOptions: { value: string; label: string }[];
  sourceOptions: { value: string; label: string }[];
  userOptions: { value: string; label: string }[];
  reportReaderOptions: { value: string; label: string }[];
  readerLevelOptions: any;
  entityOptions: any;
  readMode: boolean;
};

const frequencyOptions = {
  // HOURLY: "Hourly",
  // MINUTE: "Minute",
  DAILY: "Daily",
  // WEEKLY: "Weekly",

  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  YEARLY: "Yearly",
};

//year/Month/Week/Day/Hour/Minute
function reducer(state: any, action: any) {
  switch (action.type) {
    case "set_input_value":
      return { ...state, inputValue: action.value };
    case "set_cron_value":
      return { ...state, cronValue: action.value };
    case "set_values":
      return { ...state, cronValue: action.value, inputValue: action.value };
    default:
      throw new Error();
  }
}
function useCronReducer(state: any, action: any) {
  switch (action.type) {
    case "set_input_value":
      return { ...state, inputValue: action.value };
    case "set_cron_value":
      return { ...state, cronValue: action.value };
    case "set_values":
      return { ...state, cronValue: action.value, inputValue: action.value };
    default:
      return state;
  }
}
function KpiReportTemplateForm1({
  templateValues,
  setTemplateValues,
  locationOptions,
  sourceOptions,
  userOptions,
  reportReaderOptions,
  readerLevelOptions,
  entityOptions,
  readMode,
}: Props) {
  const classes = useStyles();
  const defaultValue = "30 5 * * 1,6";
  //   const [values, dispatchValues] = useCronReducer(defaultValue);
  const [error, onError] = useState<CronError>();
  const [values, dispatchValues] = useReducer(useCronReducer, {
    inputValue: defaultValue,
    cronValue: defaultValue,
  });

  const handleChange = (e: any) => {
    setTemplateValues((prev: any) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  useEffect(() => {
    setTemplateValues((prev) => ({
      ...prev,
      schedule: values.inputValue,
    }));
  }, [values]);
  //console.log("value", values.inputValue);
  console.log("settemplate", templateValues);
  return (
    <form autoComplete="off" className={classes.form}>
      <Grid
        container
        alignItems="center"
        justifyContent="flex-start"
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
                  name="location"
                  label="Location"
                  value={templateValues.location}
                  disabled={readMode}
                  onChange={(e) => {
                    handleChange(e);

                    setTemplateValues((prev: any) => ({
                      ...prev,
                      sources: [],
                      entityFieldName: "",
                      businessUnitFieldName: "",
                    }));

                    if (
                      templateValues.readersLevel === readerLevelOptions.ENT_LEV
                    )
                      setTemplateValues((prev: any) => ({
                        ...prev,
                        reportReaders: [],
                      }));
                  }}
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
              <strong>Template name *</strong>
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                name="kpiReportTemplateName"
                value={templateValues.kpiReportTemplateName}
                onChange={handleChange}
                disabled={readMode}
              />
            </Grid>
            <Grid item xs={2} md={4} className={classes.formTextPadding}>
              <strong>Report readers *</strong>
            </Grid>
            <Grid item xs={12} md={8}>
              <Autocomplete
                multiple
                filterSelectedOptions
                disableCloseOnSelect
                size="small"
                getOptionLabel={(option: any) => option.label}
                options={reportReaderOptions}
                value={reportReaderOptions.filter((obj: any) =>
                  templateValues.reportReaders.includes(obj.value)
                )}
                onChange={(event, newValue) => {
                  setTemplateValues((prev: any) => ({
                    ...prev,
                    reportReaders: newValue.map((obj: any) => obj.value),
                  }));
                }}
                disabled={
                  templateValues.readersLevel === readerLevelOptions.ALL_ORG ||
                  readMode
                }
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
            <Grid item xs={12} md={8}>
              <Autocomplete
                multiple
                filterSelectedOptions
                disableCloseOnSelect
                size="small"
                getOptionLabel={(option) => option.label}
                options={userOptions}
                disabled={readMode}
                value={userOptions.filter((obj: any) =>
                  templateValues.reportEditors.includes(obj.value)
                )}
                onChange={(event, newValue) => {
                  setTemplateValues((prev: any) => ({
                    ...prev,
                    reportEditors: newValue.map((obj: any) => obj.value),
                  }));
                }}
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
              <strong>Report Frequency *</strong>
            </Grid>
            <Grid item xs={12} md={8}>
              <FormControl
                className={classes.formControl}
                variant="outlined"
                size="small"
              >
                <Select
                  name="reportFrequency"
                  value={templateValues.reportFrequency}
                  onChange={handleChange}
                  disabled={readMode}
                >
                  {Object.entries(frequencyOptions).map(([key, value]) => (
                    <MenuItem key={key} value={key}>
                      {value}
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
              // alignContent: "center",
            }}
          >
            <Grid item xs={2} md={4} className={classes.formTextPadding}>
              <strong>Source*</strong>
            </Grid>
            <Grid item xs={12} sm={8}>
              <Autocomplete
                multiple
                filterSelectedOptions
                disableCloseOnSelect
                size="small"
                getOptionLabel={(option) => option.label}
                options={sourceOptions}
                disabled={readMode}
                value={sourceOptions.filter((obj: any) =>
                  templateValues.sources.includes(obj.value)
                )}
                onChange={(event, newValue) => {
                  setTemplateValues((prev: any) => ({
                    ...prev,
                    sources: newValue.map((obj: any) => obj.value),
                  }));
                }}
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
              <strong>Readers level *</strong>
            </Grid>
            <Grid item xs={12} md={8}>
              <FormControl
                className={classes.formControl}
                variant="outlined"
                size="small"
              >
                <Select
                  name="readersLevel"
                  value={templateValues.readersLevel}
                  disabled={readMode}
                  onChange={(e) => {
                    handleChange(e);

                    setTemplateValues((prev: any) => ({
                      ...prev,
                      reportReaders: [],
                    }));
                  }}
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
            <Grid item xs={12} md={8}>
              <Autocomplete
                multiple
                filterSelectedOptions
                disableCloseOnSelect
                size="small"
                getOptionLabel={(option) => option.label}
                options={userOptions}
                disabled={readMode}
                value={userOptions.filter((obj: any) =>
                  templateValues.emailRecipients.includes(obj.value)
                )}
                onChange={(event, newValue) => {
                  setTemplateValues((prev: any) => ({
                    ...prev,
                    emailRecipients: newValue.map((obj: any) => obj.value),
                  }));
                }}
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
              <strong>Dept/Vertical *</strong>
            </Grid>
            <Grid item xs={12} md={8}>
              <FormControl
                className={classes.formControl}
                variant="outlined"
                size="small"
              >
                <Select
                  name="entityFieldName"
                  value={templateValues.entityFieldName}
                  onChange={handleChange}
                  disabled={readMode}
                >
                  {entityOptions.map((en: any) => (
                    <MenuItem key={en.value} value={en.value}>
                      {en.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={2} md={4} className={classes.formTextPadding}>
              <strong>Schedule</strong>
            </Grid>

            {/* <Grid item xs={12} md={8}>
              <AntdInput
                value={templateValues?.schedule}
                onChange={(event: any) => {
                  dispatchValues({
                    type: "set_input_value",
                    value: event.target.value,
                  });
                }}
                onBlur={(e) => {
                  dispatchValues({
                    type: "set_cron_value",
                    value: values.inputValue,
                  });
                }}
                onPressEnter={(e) => {
                  dispatchValues({
                    type: "set_cron_value",
                    value: values.inputValue,
                  });
                }}
                style={{ fontSize: 14 }}
              />
            </Grid> */}
            {/* <Grid item xs={12} md={12} className={classes.formTextPadding}> */}
            <Cron
              value={values.cronValue}
              setValue={(newValue: string) => {
                dispatchValues({
                  type: "set_values",
                  value: newValue,
                });
              }}
              onError={onError}
              // style={{ display: "flex" }}
            />
            {/* </Grid> */}
          </Grid>
        </Grid>
      </Grid>
    </form>
  );
}

export default KpiReportTemplateForm1;
