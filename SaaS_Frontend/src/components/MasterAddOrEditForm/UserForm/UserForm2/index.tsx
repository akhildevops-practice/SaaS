import {
  FormControl,
  Grid,
  TextField,
  Switch,
  debounce,
} from "@material-ui/core";
import { Select } from "antd";
import React, { useEffect, useRef, useState } from "react";
import useStyles from "../styles";
import AutoComplete from "components/AutoComplete";
import axios from "apis/axios.global";
import checkRole from "utils/checkRoles";
import { Autocomplete } from "@material-ui/lab";

type Props = {
  businessTypes: any;
  locations: any;
  sections: any;
  departments: any;
  handleChange: any;
  formData: any;
  setFormData?: any;
  edit: any;
  disabledForDeletedModal?: boolean;
};

function UserForm2({
  businessTypes,
  departments,
  locations,
  sections,
  handleChange,
  formData,
  setFormData,
  edit,
  disabledForDeletedModal,
}: Props) {
  const classes = useStyles();
  const { Option } = Select;
  const [location, setLocation] = React.useState<any[]>([]);
  const [depts, setDepts] = useState<any>([]);
  const [roleNames, setRoleNames] = React.useState<any[]>([]);
  const [functionData, setFunctionData] = React.useState<any>([]);
  const [value, setValue] = useState(formData.roleName);
  const inputRef = useRef<any>();
  const userDetails = JSON?.parse(
    sessionStorage.getItem("userDetails") || "{}"
  );

  let typeAheadValue: string;
  let typeAheadType: string;

  const orgAdmin = checkRole("ORG-ADMIN");
  const isMr = checkRole("MR");
  const [inputValue, setInputValue] = useState(""); // State to manage input value

  const timeoutRef = useRef<any>(null); // Ref to store the timeout id

  const handleInputChange = (event: any, newInputValue: any) => {
    // Clear the previous timeout
    clearTimeout(timeoutRef.current);

    // Set a new timeout to update the input value after 500ms
    timeoutRef.current = setTimeout(() => {
      setInputValue(newInputValue);
      handleChange({
        target: { name: "roleName", value: newInputValue },
      });
    }, 50);
  };
  useEffect(() => {
    // Set focus when the component mounts
    if (inputRef?.current) {
      inputRef.current.focus();
    }
  }, []);
  // useEffect(() => {
  //   if (!edit) {
  //     setFormData({
  //       ...formData,
  //       location: userDetails.location,
  //     });
  //   }
  // }, []);

  useEffect(() => {
    getLocation();
    getRoleNamesinTheOrg();
  }, []);

  // console.log("formData", formData, roleNames);
  useEffect(() => {
    if (formData?.userType === "function") getFunctions();
  }, [formData?.userType]);
  useEffect(() => {
    if (formData?.additionalUnits?.length > 0) {
      getEntitiesForLocations(formData?.additionalUnits);
    }
  }, [formData?.additionalUnits]);

  const getLocation = async () => {
    try {
      const res = await axios.get(`/api/user/locationData`);
      if (!orgAdmin && isMr) {
        const unitIds = [
          userDetails.locationId,
          ...userDetails?.additionalUnits,
        ];
        const finalData = res?.data?.filter((item: any) =>
          unitIds.includes(item?.id)
        );
        setLocation(finalData);
      } else {
        setLocation(res.data);
      }
    } catch (err) {
      console.log(err);
    }
  };
  const getSuggestionListDepartment = (value: any, type: string) => {
    typeAheadValue = value;
    typeAheadType = type;
    debouncedSearchDepartment();
  };
  const getRoleNamesinTheOrg = async () => {
    try {
      const result = await axios.get(`/api/roles/getAllRolesInOrg`);
      // console.log("result", result?.data);
      if (result?.data) {
        const mappedNames = result?.data?.map((item: any) => item?.roleName);
        setRoleNames(mappedNames);
      }
    } catch (error) {
      setRoleNames([]);
    }
  };
  // console.log("formData", formData);
  const getEntitiesForLocations = async (value: any) => {
    try {
      const entities = await axios.get(
        `/api/entity/getEntitiesForLocations?location=${
          value ? value : formData?.additionalUnits
        }&organizationId=${userDetails?.organizationId}`
      );
      if (entities?.data) {
        setDepts(entities?.data);
      }
    } catch (error) {
      setDepts([]);
    }
  };
  const debouncedSearchDepartment = debounce(() => {
    getDepartment(typeAheadValue, typeAheadType);
  }, 50);

  const handleChangeNew = (value: any) => {
    if (value === "unit" || value === "function") {
      setFormData({
        ...formData,
        entityId: "",
        entity: {},
        userType: value,
      });
    } else {
      setFormData({ ...formData, userType: value });
    }
  };
  const getDepartment = async (value: string, type: string) => {
    try {
      const res = await axios.get(
        `/api/documents/filerValue?searchLocation=&searchBusinessType=&searchEntity=${value}&searchSystems=&searchDoctype=&searchUser=`
      );
      // setDepartment(res.data.entity);
    } catch (err) {
      console.log(err);
    }
  };
  // console.log("formData", formData);
  const handleUnitChange = (value: any) => {
    // console.log("value", value);
    const updatedAdditionalUnits = value.includes("All") ? ["All"] : value;

    setFormData((prevFormData: any) => ({
      ...prevFormData,
      additionalUnits: updatedAdditionalUnits,
    }));
    getEntitiesForLocations(value);
  };
  const getFunctions = async () => {
    try {
      const res = await axios.get(
        `/api/entity/getFunctionByLocation/${formData.locationId}`
      );
      // setDepartment(res.data.entity);
      setFunctionData(res?.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Grid container>
      <Grid item sm={12} md={4} className={classes.formTextPadding}>
        <strong>Status*</strong>
      </Grid>
      <Grid item sm={12} md={8} className={classes.formBox}>
        <Switch
          checked={formData.status}
          onChange={handleChange}
          color="primary"
          data-testid="status-switch"
          name="status"
          disabled={disabledForDeletedModal}
        />
      </Grid>
      <Grid item sm={12} md={4} className={classes.formTextPadding}>
        <strong>User Type*</strong>
      </Grid>
      <Grid item sm={12} md={8} className={classes.formBox}>
        <FormControl component="fieldset" className={classes.formControl}>
          {/* <RadioGroup
            aria-label="options"
            name="options"
            value={formData?.userType}
            onChange={handleChangeNew}
          >
            <FormControlLabel
              value="department"
              control={<Radio />}
              label="Department / Vertical"
            />
            <FormControlLabel value="unit" control={<Radio />} label="Unit" />
            <FormControlLabel
              value="function"
              control={<Radio />}
              label="Function"
            />

            <FormControlLabel
              value="globalRoles"
              control={<Radio />}
              label="Global Roles"
            />
          </RadioGroup> */}
          <Select
            value={formData?.userType}
            onChange={handleChangeNew}
            placeholder="Select a User Type"
            style={{
              width: "100%",
            }}
          >
            <Option value="department">Department / Vertical</Option>
            <Option value="unit">Unit</Option>
            {/* <Option value="function">Function</Option> */}
            {orgAdmin && <Option value="globalRoles">Global Roles</Option>}
          </Select>
        </FormControl>
      </Grid>
      {formData?.userType !== "globalRoles" ? (
        <>
          <Grid item sm={12} md={4} className={classes.formTextPadding}>
            <strong>Unit*</strong>
          </Grid>
          <Grid item sm={12} md={8} className={classes.formBox}>
            <AutoComplete
              suggestionList={location}
              name={"Unit"}
              keyName={"locationName"}
              formData={formData}
              setFormData={setFormData}
              disabled={disabledForDeletedModal}
              getSuggestionList={() => {}}
              labelKey={"locationName"}
              showAvatar={false}
              defaultValue={formData.location || []}
              handleChangeFromForm={(e: any, value: any) => {
                setFormData((prevFormData: any) => ({
                  ...prevFormData,
                  location: value,
                  locationId: value?.id,
                  entity: {},
                }));
              }}
              multiple={false}
            />
            {/* </FormControl> */}
          </Grid>
        </>
      ) : (
        ""
      )}

      {/* <Grid item sm={12} md={4} className={classes.formTextPadding}>
        <strong>User Type*</strong>
      </Grid>
      <Grid item sm={12} md={8} className={classes.formBox}>
        <FormControl component="fieldset" className={classes.formControl}>
          <RadioGroup
            aria-label="options"
            name="options"
            value={formData?.userType}
            onChange={handleChangeNew}
          >
            <FormControlLabel
              value="function"
              control={<Radio />}
              label="Function"
            />
            <FormControlLabel value="unit" control={<Radio />} label="Unit" />
            <FormControlLabel
              value="department"
              control={<Radio />}
              label="Entity"
            />
            <FormControlLabel
              value="globalRoles"
              control={<Radio />}
              label="Global Roles"
            />
          </RadioGroup>
        </FormControl>
      </Grid> */}
      {/* ---------------- */}
      {formData?.userType === "function" ? (
        <>
          <Grid item sm={12} md={4} className={classes.formTextPadding}>
            <strong>Functions *</strong>
          </Grid>
          <Grid item sm={12} md={8} className={classes.formBox}>
            <AutoComplete
              suggestionList={functionData}
              name={"Function"}
              keyName={"functionId"}
              formData={formData}
              setFormData={setFormData}
              labelKey={"name"}
              defaultValue={formData?.entity}
              multiple={false}
            />
          </Grid>
        </>
      ) : formData?.userType === "department" ? (
        <>
          <Grid item sm={12} md={4} className={classes.formTextPadding}>
            <strong>Entity Name*</strong>
          </Grid>
          <Grid item sm={12} md={8} className={classes.formBox}>
            <AutoComplete
              suggestionList={departments}
              name={"Entity"}
              keyName={"entityName"}
              formData={formData}
              showAvatar={false}
              setFormData={setFormData}
              // disabled={Object?.keys(formData?.location).length === 0 ? true : false}
              disabled={
                disabledForDeletedModal ||
                (formData.location &&
                  Object.keys(formData.location).length === 0)
              }
              getSuggestionList={getSuggestionListDepartment}
              labelKey={"entityName"}
              defaultValue={formData?.entity}
              handleChangeFromForm={(e: any, value: any) => {
                setFormData((prevFormData: any) => ({
                  ...prevFormData,
                  entity: value,
                  entityId: value?.id,
                }));
              }}
              multiple={false}
            />
          </Grid>
        </>
      ) : formData?.userType === "globalRoles" ? (
        <>
          <Grid item sm={12} md={4} className={classes.formTextPadding}>
            <strong>Role*</strong>
          </Grid>
          <Grid item sm={12} md={8} className={classes.formBox}>
            {/* <TextField
              fullWidth
              // label='Login URL'
              name="roleName"
              value={formData.roleName}
              inputProps={{
                "data-testid": "login-url",
              }}
              disabled={disabledForDeletedModal}
              variant="outlined"
              onChange={handleChange}
              size="small"
            /> */}
            <Autocomplete
              value={value}
              onChange={(event, newValue) => {
                setValue(newValue);
                handleChange({ target: { name: "roleName", value: newValue } });
              }}
              inputValue={inputValue}
              onInputChange={handleInputChange} // Use debounced input change handler
              options={roleNames.filter((role) =>
                role.toLowerCase().includes(inputValue?.toLowerCase())
              )}
              freeSolo
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  label="Role Name"
                  name="roleName"
                  variant="outlined"
                  size="small"
                  disabled={disabledForDeletedModal}
                />
              )}
            />
          </Grid>
          <Grid item sm={12} md={4} className={classes.formTextPadding}>
            <strong>Responsible For*</strong>
          </Grid>
          <Grid item sm={12} md={8} className={classes.formBox}>
            <Select
              mode="multiple"
              value={formData.additionalUnits}
              onChange={handleUnitChange}
              placeholder="Select additional units"
              disabled={disabledForDeletedModal}
              allowClear
              showSearch
              optionFilterProp="children"
              style={{ width: "100%" }}
            >
              <Option value="All">All</Option>

              {location.map((item: any) => (
                <Option key={item.id} value={item.id}>
                  {item.locationName}
                </Option>
              ))}
            </Select>
          </Grid>
          <Grid item sm={12} md={4} className={classes.formTextPadding}>
            <strong>Home Department</strong>
          </Grid>
          <Grid item sm={12} md={8} className={classes.formBox}>
            <Select
              value={formData.entityId}
              onChange={(value) => {
                if (value === "All") {
                  setFormData((prev: any) => ({
                    ...prev,
                    entity: "All",
                    entityId: "All",
                  }));
                } else {
                  setFormData((prev: any) => ({
                    ...prev,
                    entity: value,
                    entityId: value,
                  }));
                }
              }}
              placeholder="Select Home Department"
              disabled={disabledForDeletedModal}
              allowClear
              showSearch
              optionFilterProp="children"
              style={{ width: "100%" }}
            >
              <Option value="All">All</Option>

              {depts.map((item: any) => (
                <Option key={item.id} value={item?.id}>
                  {item.entityName}
                </Option>
              ))}
            </Select>

            {/* </FormControl> */}
          </Grid>
        </>
      ) : (
        ""
      )}
      {/* <Grid item sm={12} md={4} className={classes.formTextPadding}>
        <strong>Business Units*</strong>
      </Grid>
      <Grid item sm={12} md={8} className={classes.formBox}>
        <FormControl
          className={classes.formControl}
          variant="outlined"
          size="small"
        >
          <Select
            value={edit ? formData.businessTypeId : formData.businessType}
            onChange={handleChange}
            name={edit ? "businessTypeId" : "businessType"}
            data-testid="businessType"
            required
            disabled={formData.entity === "" ? true : false}
          >
            {businessTypes.map((item: any) => {
              return (
                <MenuItem key={item} value={item.id}>
                  {item.name}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Grid>
      <Grid item sm={12} md={4} className={classes.formTextPadding}>
        <strong>Section*</strong>
      </Grid>
      <Grid item sm={12} md={8} className={classes.formBox}>
        <FormControl
          className={classes.formControl}
          variant="outlined"
          size="small"
        >
          <Select
            value={edit ? formData.sectionId : formData.section}
            onChange={handleChange}
            name={edit ? "sectionId" : "section"}
            data-testid="sections"
            required
          >
            {sections.map((item: any) => {
              return (
                <MenuItem key={item} value={item.sectionId}>
                  {item.name}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Grid> */}
    </Grid>
  );
}

export default UserForm2;
