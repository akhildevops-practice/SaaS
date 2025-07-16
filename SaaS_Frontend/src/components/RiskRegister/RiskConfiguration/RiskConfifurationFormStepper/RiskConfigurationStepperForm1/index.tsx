
//mui
import { Grid, TextField } from "@material-ui/core";
//utils
import { RiskConfigSchema } from "schemas/riskConfigSchema";
import checkRoles from "utils/checkRoles";

//styles
import useStyles from "./styles";

//components
import DynamicFormFields from "components/DynamicFormFields";


interface Props {
  riskConfigData: RiskConfigSchema;
  setRiskConfigData: (data: RiskConfigSchema) => void;
  edit?: boolean;
}

const RiskConfigurationStepperForm1 = ({ riskConfigData, setRiskConfigData }: Props) => {
  // const [inputValue, setInputValue] = useState<any>("");
  const classes = useStyles();
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isMR = checkRoles("MR");
  const canEdit = isOrgAdmin || isMR;
  // const options = ["N/A"];

  const handleChange = (e: any) => {
    if (e.target.name === "category") {
      setRiskConfigData({
        ...riskConfigData,
        category: e.target.value,
      });
    }
  };

  return (
    <div style={{height : "64vh", overflowY : "auto"}}>
    <form autoComplete="off" className={classes.form}>
      <Grid container>
        <Grid item xs={12} md={6}>
          <Grid container>
            <Grid
              item
              sm={12}
              md={4}
              className={classes.formTextPadding}
              style={{ marginBottom: "48px" }}
            >
              <strong>Risk Category*</strong>
            </Grid>
            <Grid item sm={12} md={6} className={classes.formBox}>
              <TextField
                fullWidth
                minRows={1}
                multiline
                style={{ width: "89%" }}
                name="category"
                value={riskConfigData.category || ""}
                variant="outlined"
                onChange={handleChange}
                size="small"
                disabled={!canEdit}
              />
            </Grid>
            <Grid item sm={12} md={4} className={classes.formTextPadding}>
              <strong>Condition/Priority*</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <DynamicFormFields
                data={riskConfigData}
                setData={setRiskConfigData}
                name="condition"
                keyName="name"
                canEdit={canEdit}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item sm={12} md={6}>
          <Grid container>
            <Grid item sm={12} md={4} className={classes.formTextPadding}>
              <strong>Risk Type*</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <DynamicFormFields
                data={riskConfigData}
                setData={setRiskConfigData}
                name="riskType"
                keyName="name"
                canEdit={canEdit}
              />
            </Grid>
            <Grid item sm={12} md={4} className={classes.formTextPadding}>
              <strong>Impact Type</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <DynamicFormFields
                data={riskConfigData}
                setData={setRiskConfigData}
                name="impactType"
                keyName="name"
                canEdit={canEdit}
              />
              {/* <Autocomplete
                freeSolo
                options={options}
                disableClearable
                getOptionLabel={(option) => option}
                inputValue={inputValue}
                onInputChange={handleInputChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Enter text or select N/A"
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                  />
                )}
                onChange={handleSelectOption}
                value={inputValue}
                defaultValue={["N/A"]}
              /> */}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </form>
    </div>
  );
};

export default RiskConfigurationStepperForm1;
