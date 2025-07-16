import { Grid } from "@material-ui/core";
import useStyles from "./styles";
import UserForm1 from "./UserForm1";
import { useRecoilState } from "recoil";
import { userFormData } from "../../../recoil/atom";
import UserForm2 from "./UserForm2";
import { validateUserNames } from "utils/validateInput";
import { useSnackbar } from "notistack";

type Props = {
  locations: any;
  sections: any;
  departments: any;
  businessTypes: any;
  edit: any;
  checkState: any;
  setCheckState: any;
  checkedValues: any;
  disabledForDeletedModal?: boolean;
};

const userType = ["Local"];

function UserForm({
  locations,
  sections,
  departments,
  businessTypes,
  edit,
  disabledForDeletedModal,
  setCheckState,
  checkState,
  checkedValues,
}: Props) {
  const [formData, setFormData] = useRecoilState(userFormData);
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const handleChange = (e: any) => {
    // console.log("e.target", e.target.name);
    if (e.target.name === "status") {
      setFormData({
        ...formData,
        [e.target.name]: e.target.checked,
      });
    } else {
      if (
        e.target.name === "username" ||
        e.target.name === "firstName" ||
        e.target.name === "lastName"
      ) {
        validateUserNames(null, e.target.value, (error?: string) => {
          if (error) {
            enqueueSnackbar(`${error}`, { variant: "error" });
            return;
          } else {
            setFormData({
              ...formData,
              [e.target.name]: e.target.value,
            });
          }
        });
      } else {
        setFormData({
          ...formData,
          [e.target.name]: e.target.value,
        });
      }
    }
  };

  const handleChangeChecked = (event: any) => {
    checkedValues(event);
  };
  // console.log("formdata in USerForm", formData);
  return (
    <form
      data-testid="technical-config-form"
      autoComplete="off"
      className={classes.form}
    >
      <Grid container>
        <Grid item sm={12} md={6}>
          <UserForm1
            formData={formData}
            handleChange={handleChange}
            userType={userType}
            setFormData={setFormData}
            disabledForDeletedModal={disabledForDeletedModal}
          />
        </Grid>
        <Grid item xs={12} md={1}></Grid>
        <Grid item sm={12} md={5}>
          <UserForm2
            formData={formData}
            setFormData={setFormData}
            handleChange={handleChange}
            businessTypes={businessTypes}
            departments={departments}
            locations={locations}
            sections={sections}
            edit={edit}
            disabledForDeletedModal={disabledForDeletedModal}
          />
        </Grid>
        {/* <Grid
          item
          sm={12}
          md={2}
          className={classes.formTextPadding}
          justifyContent="flex-end"
        >
          <strong>Roles*</strong>
        </Grid> */}
        {/* <Grid item xs={12} md={4}>
          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={checkState.MR}
                  onChange={handleChangeChecked}
                  name="MR"
                  color="primary"
                />
              }
              label="MR"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={checkState.AUDITOR}
                  onChange={handleChangeChecked}
                  name="AUDITOR"
                  color="primary"
                />
              }
              label="AUDITOR"
            />
          </FormGroup>
        </Grid> */}
      </Grid>
    </form>
  );
}

export default UserForm;
