import {
  FormControl,
  Grid,
  Select,
  TextField,
  MenuItem,
  CircularProgress,
} from "@material-ui/core";
import useStyles from "./styles";

type Props = {
  isEdit: any;
  disableFormFields: any;
  formData: any;
  setFormData: any;
  isLoading: boolean;
  models: any[];
  entities: any;
};

const locType = ["Department", "Supplier", "Dealer", "Customer"];

function PartsForm({
  isEdit,
  disableFormFields,
  formData,
  setFormData,
  models,
  isLoading,
  entities,
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
                  <strong>Part No.</strong>
                </Grid>
                <Grid item sm={12} md={8} className={classes.formBox}>
                  <TextField
                    fullWidth
                    // label='Client Secret'
                    name="partNo"
                    value={formData.partNo}
                    variant="outlined"
                    onChange={handleChange}
                    size="small"
                  />
                </Grid>

                <Grid item sm={12} md={4} className={classes.formTextPadding}>
                  <strong>Part Name*</strong>
                </Grid>
                <Grid item sm={12} md={8} className={classes.formBox}>
                  <TextField
                    fullWidth
                    // label='Login URL'
                    name="partName"
                    value={formData.partName}
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
                  <strong> Manufacturing Entity*</strong>
                </Grid>
                <Grid item sm={12} md={8} className={classes.formBox}>
                  <FormControl
                    className={classes.formControl}
                    variant="outlined"
                    size="small"
                  >
                    <Select
                      value={formData?.entity?.length ? formData.entity : null}
                      onChange={handleChange}
                      name="entity"
                      data-testid="loc-type"
                      required
                      MenuProps={{
                        anchorOrigin: {
                          vertical: "bottom", // Position the menu below the dropdown box
                          horizontal: "left",
                        },
                        getContentAnchorEl: null, // Prevent content from overlapping
                        PaperProps: {
                          style: {
                            maxHeight: "200px", // Limit the max height of the dropdown menu
                          },
                        },
                      }}
                    >
                      {entities?.map((item: any, i: number) => {
                        return (
                          <MenuItem key={i} value={item.id}>
                            {item.entityName}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={1}></Grid>
            <Grid item sm={12} md={5}>
              <Grid container>
                <Grid item sm={12} md={4} className={classes.formTextPadding}>
                  <strong>Applicable Models*</strong>
                </Grid>
                <Grid item sm={12} md={8} className={classes.formBox}>
                  <FormControl
                    className={classes.formControl}
                    variant="outlined"
                    size="small"
                  >
                    <Select
                      value={formData.models ?? []}
                      onChange={handleChange}
                      name="models"
                      data-testid="business"
                      multiple
                      disabled={disableFormFields}
                      required
                      style={{
                        width: "320px",
                      }}
                      renderValue={(selected: any) => (
                        <div style={{ overflow: "auto", maxHeight: "100px" }}>
                          {" "}
                          {/* Adjust maxHeight as needed */}
                          {models
                            .filter((el: any) => {
                              if (formData?.models?.includes(el.id)) {
                                return el;
                              }
                            })
                            .map((el: any) => el.modelName)
                            .join(",")}
                        </div>
                      )}
                      MenuProps={{
                        anchorOrigin: {
                          vertical: "bottom", // Position the menu below the dropdown box
                          horizontal: "left",
                        },
                        getContentAnchorEl: null, // Prevent content from overlapping
                        PaperProps: {
                          style: {
                            maxHeight: "200px", // Limit the max height of the dropdown menu
                            width: "250px", // Adjust the width as needed
                          },
                        },
                      }}
                    >
                      {models?.map((item: any) => {
                        return (
                          <MenuItem key={item.id} value={item.id}>
                            {item.modelName}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
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

export default PartsForm;
