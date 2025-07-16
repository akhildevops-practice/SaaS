import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@material-ui/core";
import React, { useState } from "react";
import { useSnackbar } from "notistack";
import { useStyles } from "./styles";
import AutoComplete from "../../AutoComplete";
import { systemDetailFormData } from "../../../recoil/atom";
import axios from "../../../apis/axios.global";
import { useRecoilState } from "recoil";
import getAppUrl from "../../../utils/getAppUrl";
import { validateMasterNames } from "utils/validateInput";

type Props = {
  isEdit?: any;
  initVal: any;
  rerender?: any;
  handleDiscard: any;
  handleSubmit: any;
  isLoading: any;
  systemTypes?: any;
  systemNames?: any;
  disabled?: any;
  isAutoCompleteEnabled?: any;
  setAutoCompleteEnabled?: any;
  disabledForDeletedModal?: any;
};

function SystemDetailForm({
  initVal,
  isEdit = false,
  isAutoCompleteEnabled = false,
  setAutoCompleteEnabled = false,
  handleDiscard,
  handleSubmit,
  isLoading,
  rerender,
  systemTypes,
  disabledForDeletedModal,
  disabled = false,
}: Props) {
  const [values, setValues] = useState(initVal);
  const [suggestion, setSuggestion] = useState();
  const [formData, setFormData] = useRecoilState<any>(systemDetailFormData);
  const classes = useStyles();
  const realmName = getAppUrl();
  const [systemNames, setSystemNames] = useState<any>([]);
  const { enqueueSnackbar } = useSnackbar();
  const [selectedSystems, setSelectedSystems] = useState([]);

  const handleAutocompleteChange = (event: any, value: any) => {
    setSelectedSystems(value);
  };
  let typeAheadValue: string;
  let typeAheadType: string;

  /**
   * @method handleChange
   * @param e {any}
   * @returns nothing
   */
  const handleChange = (e: any) => {
    if (e.target.name === "systemName") {
      validateMasterNames(null, e.target.value, (error?: string) => {
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
    // console.log("value - ", formData);
  };

  /**
   * @method getLocations
   * @description Function to fetch all locations
   * @returns nothing
   */
  const getLocations = async () => {
    const res = await axios.get(`api/location/getLocationsForOrg/${realmName}`);
    setSuggestion(res.data);
  };

  React.useEffect(() => {
    getLocations();
    if (!isEdit) {
      handleDiscard();
    }
  }, []);
  const allOption = { id: "All", locationName: "All" };
  React.useEffect(() => {
    if (formData.location.length === 0) {
      setFormData({ ...formData, location: [allOption] });
      fetchSystemNames(["All"]);
    } else {
      const locData = formData?.location?.map((value: any) => value.id);
      fetchSystemNames(locData);
    }
  }, [formData.status]);

  const handleStatusChange = () => {
    setFormData((prevFormData: any) => ({
      ...prevFormData,
      status: !prevFormData.status,
      integratedSystems: [],
    }));
  };

  const fetchSystemNames = async (selectedloc: any) => {
    console.log("");
    try {
      const encodedLoc = encodeURIComponent(JSON.stringify(selectedloc));

      const response = await axios.get(
        `/api/systems/displayAllSystemsForOrg/${encodedLoc}`
        // `/api/systems/displayAllSystemsForOrg/All`
      );
      setSystemNames(response?.data);
    } catch (error) {
      console.log({ error });
      enqueueSnackbar("Something went wrong while fetching system types1!", {
        variant: "error",
      });
    }
  };
  return (
    <form
      data-testid="org-admin-form"
      autoComplete="off"
      className={classes.form}
    >
      <Grid container>
        <Grid item sm={12} md={6}>
          <Grid container>
            <Grid item sm={12} md={4} className={classes.formTextPadding}>
              <strong>System Type*</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <FormControl
                className={classes.formControl}
                variant="outlined"
                size="small"
              >
                <InputLabel>System Type</InputLabel>
                <Select
                  label="System Type"
                  disabled={isEdit || disabledForDeletedModal}
                  value={formData.systemType}
                  onChange={handleChange}
                  name="systemType"
                  data-testid="systemType"
                  required
                >
                  {systemTypes?.map((item: any) => {
                    return (
                      <MenuItem key={item.id} value={item?.id}>
                        {item?.name}
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
                minRows={1}
                multiline
                label="Description"
                disabled={isEdit || disabledForDeletedModal}
                name="description"
                value={formData.description}
                variant="outlined"
                onChange={handleChange}
                inputProps={{
                  "data-testid": "last-name",
                }}
                size="small"
              />
            </Grid>
            {/* <Grid item sm={12} md={4} className={classes.formTextPadding}>
              <strong>Is Integrated System*</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <Switch
                checked={formData.status}
                onChange={handleStatusChange}
                color="primary"
                data-testid="status-switch"
                name="status"
              />
            </Grid> */}
          </Grid>
        </Grid>
        <Grid item xs={12} md={1}></Grid>
        <Grid item sm={12} md={5}>
          <Grid container>
            <Grid item sm={12} md={4} className={classes.formTextPadding}>
              <strong>System Name*</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <TextField
                fullWidth
                label="System Name"
                disabled={isEdit || disabledForDeletedModal}
                name="systemName"
                value={formData.systemName}
                variant="outlined"
                onChange={handleChange}
                size="small"
                inputProps={{
                  "data-testid": "user-name",
                  maxLength: 100,
                }}
                required
              />
            </Grid>
            <Grid item sm={12} md={4} className={classes.formTextPadding}>
              <strong>All Units*</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <AutoComplete
                suggestionList={suggestion ? [allOption, ...suggestion] : []}
                name="Units"
                keyName="location"
                disabled={isEdit || disabledForDeletedModal}
                labelKey="locationName"
                formData={formData}
                setFormData={setFormData}
                getSuggestionList={() => console.log("get suggestion list")}
                defaultValue={formData.location.length ? formData.location : []}
              />
            </Grid>

            {formData.status && (
              <>
                <Grid item sm={12} md={4} className={classes.formTextPadding}>
                  <strong>Integrated Systems*</strong>
                </Grid>
                <Grid item sm={12} md={8} className={classes.formBox}>
                  <AutoComplete
                    suggestionList={systemNames ? systemNames : []}
                    name="Integrated Systems"
                    keyName="integratedSystems"
                    disabled={isEdit || disabledForDeletedModal}
                    labelKey="name"
                    formData={formData}
                    setFormData={setFormData}
                    getSuggestionList={() => console.log("get suggestion list")}
                    defaultValue={
                      formData.integratedSystems.length
                        ? formData.integratedSystems
                        : []
                    }
                  />
                  {formData.integratedSystems.length === 1 && (
                    <FormHelperText style={{ color: "red" }}>
                      Please enter minimum 2 systems
                    </FormHelperText>
                  )}
                </Grid>
              </>
            )}
          </Grid>
        </Grid>
      </Grid>
    </form>
  );
}

export default SystemDetailForm;
