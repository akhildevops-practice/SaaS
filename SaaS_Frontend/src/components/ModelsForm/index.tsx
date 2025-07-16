import {
  Grid,
  TextField,
  CircularProgress,
} from "@material-ui/core";
import useStyles from "./styles";

type Props = {
  isEdit: any;
  disableFormFields: any;
  formData: any;
  setFormData: any;
  isLoading: boolean;
};

const locType = ["Department", "Supplier", "Dealer", "Customer"];

function ModelsForm({
  isEdit,
  disableFormFields,
  formData,
  setFormData,
  isLoading,
}: Props) {
  const classes = useStyles();

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </div>
      ) : (
        <form
          data-testid="technical-config-form"
          autoComplete="off"
          className={classes.form}
        >
          <Grid container>
            <Grid item sm={12} md={6}>
              <Grid container>
                <Grid item sm={12} md={4} className={classes.formTextPadding}>
                  <strong>Model Name*</strong>
                </Grid>
                <Grid item sm={12} md={8} className={classes.formBox}>
                  <TextField
                    fullWidth
                    // label='Login URL'
                    name="modelName"
                    value={formData.modelName}
                    inputProps={{
                      "data-testid": "login-url",
                    }}
                    variant="outlined"
                    onChange={handleChange}
                    size="small"
                    disabled={disableFormFields}
                  />
                </Grid>
                <Grid item sm={12} md={4} className={classes.formTextPadding}>
                  <strong>Model No.*</strong>
                </Grid>
                <Grid item sm={12} md={8} className={classes.formBox}>
                  <TextField
                    fullWidth
                    name="modelNo"
                    value={formData.modelNo}
                    variant="outlined"
                    onChange={handleChange}
                    disabled={disableFormFields}
                    size="small"
                    minRows={3}
                  />
                </Grid>
                <Grid item sm={12} md={4} className={classes.formTextPadding}>
                  <strong>Description</strong>
                </Grid>
                <Grid item sm={12} md={8} className={classes.formBox}>
                  <TextField
                    fullWidth
                    name="description"
                    value={formData.description}
                    variant="outlined"
                    onChange={handleChange}
                    disabled={disableFormFields}
                    size="small"
                    minRows={3}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </form>
      )}
    </>
  );
}

export default ModelsForm;
