import {
  FormControl,
  Grid,
  Select,
  TextField,
  MenuItem,
  debounce,
  Button,
  IconButton,
  OutlinedInput,
  Chip,
  InputLabel,
} from "@material-ui/core";
import { MdCancel } from "react-icons/md";

import React, { useEffect, useState } from "react";
import useStyles from "./styles";
import { useRecoilState } from "recoil";
import { deptFormData } from "../../../recoil/atom";
import checkRoles from "../../../utils/checkRoles";
import AutoComplete from "components/AutoComplete";
import axios from "apis/axios.global";
import { useSnackbar } from "notistack";
import { validateMasterNames } from "utils/validateInput";
import DepartmentSelector from "components/ReusableComponents/DepartmentSelector";
type Props = {
  selectFieldData: any;
  edit: any;
  bu: any;
  departmentHeadList?: any[];
  auditeesList?: any[];
  functions?: any[];
  disableFormFields: any;
  handleSubmit?: any;
  isLoading?: any;
  isCreated?: any;
  deletedId?: boolean;
  entityType?: any;
  entityOptions?: any;
};
interface Section {
  id: number;
  name: string;
  organizationId?: string;
  isSubmitted?: boolean;
  isEdit?: boolean;
  createdBy?: string;
  isFirstSubmit?: boolean;
}
function EntityForm({
  selectFieldData,
  edit,
  bu,
  departmentHeadList,
  auditeesList,
  functions,
  disableFormFields,
  handleSubmit,
  isLoading,
  isCreated,
  deletedId,
  entityType,
  entityOptions,
}: Props) {
  // console.log("checkdept entityOptions", entityOptions);

  const classes = useStyles();
  const [formData, setFormData] = useRecoilState(deptFormData);
  const isLocAdmin = checkRoles("LOCATION-ADMIN");
  const isMr = checkRoles("MR");
  const isOrgAdmin = checkRoles("ORG-ADMIN");

  const [location, setLocation] = React.useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [functionOptions, setFunctionOptions] = useState([]);
  const cachedUserData = JSON.parse(
    sessionStorage.getItem("userDetails") as any
  );
  const [sections, setSections] = useState<Section[]>([]);
  const { enqueueSnackbar } = useSnackbar();
  var typeAheadValue: string;
  var typeAheadType: string;

  useEffect(() => {
    getLocation();
  }, []);
  // console.log("inside usef", entityType);

  // console.log("sekectFieldData", selectFieldData);
  //before dynamic tabs
  // useEffect(() => {
  //   if (!edit && selectFieldData.entityTypes.length === 1) {
  //     setFormData((prevFormData: any) => ({
  //       ...prevFormData,
  //       entityType: selectFieldData.entityTypes[0],
  //       sections: [],
  //     }));
  //   }
  //   if (edit) {
  //     setSections(formData?.sectiondetails);
  //   }
  // }, [edit, selectFieldData.entityTypes]);

  // useEffect(() => {
  //   if (!edit) {
  //     setFormData({
  //       ...formData,
  //       // entityId: formData?.location?.locationId,
  //       entityUserId: "",
  //       sections: [],
  //     });
  //   }
  // }, [formData?.location]);
  // console.log("entityoptions in entityForm", entityOptions, entityType);
  useEffect(() => {
    if (!edit) {
      if (!!entityType) {
        // console.log("inside usef");
        setFormData((prevFormData: any) => ({
          ...prevFormData,
          entityType: entityType,
          sections: [],
        }));
      }
      //  else if (selectFieldData.entityTypes.length === 1 && entityType==undefined) {
      //     setFormData((prevFormData: any) => ({
      //       ...prevFormData,
      //       entityType: selectFieldData.entityTypes[0],
      //       sections: [],
      //     }));
      //   }
    }
    if (edit) {
      setSections(formData?.sectiondetails);
    }
  }, [edit, entityType]);

  useEffect(() => {
    if (!edit && !!entityType) {
      setFormData({
        ...formData,
        // entityId: formData?.location?.locationId,
        entityUserId: "",
        entityType: entityType,
        sections: [],
      });
    }
  }, [formData?.location]);

  // useEffect(() => {
  //   const finalValue = `${formData?.location?.locationId}${formData.entityUserId}`;
  //   if (finalValue.length <= 10) {
  //     setFormData({
  //       ...formData,
  //       entityId: finalValue,
  //     });
  //   }
  // }, [formData.entityUserId]);

  useEffect(() => {
    if (!edit) {
      setFormData({
        ...formData,
        location: cachedUserData.location,
      });
    }
  }, []);

  //   if (formData.location || formData.locationId) {
  //     getUserOptions();

  //   }
  // }, [formData.locationId, formData.location]);

  var typeAheadValue: string;
  var typeAheadType: string;

  // const getSuggestionListLocation = (value: any, type: string) => {
  //   typeAheadValue = value;
  //   typeAheadType = type;
  //   debouncedSearchLocation();
  // };

  // const debouncedSearchLocation = debounce(() => {
  //   getLocation(typeAheadValue, typeAheadType);
  // }, 50);
  console.log("formData in entityform", formData);
  const getLocation = async () => {
    try {
      const res = await axios.get(`/api/user/locationData`);
      if (isMr && !isOrgAdmin) {
        const unitIds = [
          cachedUserData.locationId,
          ...cachedUserData.additionalUnits,
        ];
        const mrLocation = res?.data?.filter((value: any) =>
          unitIds.includes(value?.id)
        );
        setLocation(mrLocation);
      } else {
        setLocation(res.data);
      }
    } catch (err) {
      // console.log(err);
    }
  };

  const handleChange = (e: any, value?: any) => {
    // console.log("e.target", e.target.name);

    // If the name is 'entityName' or 'entityId', validate before updating formData
    if (e.target.name === "entityName" || e.target?.name === "entityId") {
      validateMasterNames(null, e.target.value, (error?: string) => {
        if (error) {
          // Show the error message if validation fails
          enqueueSnackbar(`${error}`, { variant: "error" });
          return; // Stop execution, so formData won't be updated
        } else {
          // If validation passes, update formData
          setFormData((prevFormData: any) => ({
            ...prevFormData,
            [e.target?.name]: e.target.value,
          }));
        }
      });
    } else {
      // For other fields, just update formData without validation
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        [e.target.name]: e.target.value,
      }));
    }
  };

  const getSuggestionListUser = (value: any, type: string) => {
    typeAheadValue = value;
    typeAheadType = type;
    debouncedSearchUser();
  };
  const debouncedSearchUser = debounce(() => {
    getUserOptions(typeAheadValue, typeAheadType);
  }, 50);
  const getUserOptions = async (value: any, type: string) => {
    await axios(
      `/api/documents/filerValue?searchLocation=&searchBusinessType=&searchEntity=&searchSystems=&searchDoctype=&searchUser=${value}`
    )
      .then((res) => {
        setUserOptions(
          res?.data?.allUser?.map((obj: any) => ({
            id: obj.id,
            name: obj.username,
            avatar: obj.avatar,
            email: obj.email,
          }))
        );
      })
      .catch((err) => {});
  };

  const getSuggestionListFunction = (value: any, type: string) => {
    typeAheadValue = value;
    typeAheadType = type;
    debouncedSearchFunction();
  };

  const debouncedSearchFunction = debounce(() => {
    getFunctionOptions(typeAheadValue, typeAheadType);
  }, 50);

  const getFunctionOptions = async (value: any, type: string) => {
    await axios
      .get(`/api/business/filterFunction?searchFunction=${value}`)
      .then((res) => {
        const ops = res?.data?.functions?.map((obj: any) => ({
          id: obj.id,
          name: obj.name,
        }));
        setFunctionOptions(ops);
      })
      .catch((err) => {
        // console.error(err)
      });
  };
  const handleSectionNameChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    sectionId: number
  ) => {
    const updatedSection = sections.map((type) => {
      if (type.id === sectionId) {
        return {
          ...type,
          name: event.target.value,
        };
      }
      return type;
    });

    setSections(updatedSection);
  };
  // change field status either allow to edit or allow to put the field value
  const handleChangeIcon = async (sectionId: number) => {
    const updatedSection = sections.map((type) => {
      if (type.id === sectionId) {
        return {
          ...type,
          isEdit: false,
          isSubmitted: true,
          isFirstSubmit: false,
        };
      }
      return type;
    });

    setSections(updatedSection);
  };
  const handleEditSection = async (sectionId: number, sectionName: string) => {
    const singleSection = {
      name: sectionName,
      updatedBy: cachedUserData?.userName,
    };
    try {
      if (sectionName === "" || sectionName === undefined) {
        enqueueSnackbar(`Section name cannot empty`, { variant: "error" });
        return;
      }
      const response = await axios.put(
        `api/business/updateSectionById/${sectionId}`,
        singleSection
      );

      const updatedSection = sections.map((type) => {
        if (type.id === sectionId) {
          return {
            ...type,
            name: sectionName,
            isEdit: true,
            isSubmitted: false,
            isFirstSubmit: false,
          };
        }
        return type;
      });

      setSections(updatedSection);
    } catch (error) {
      // console.error("Error:", error);
    }
  };
  // console.log("entityTyoe", entityType, formData);
  const handleSectionSubmit = async (sectionName: string) => {
    const data = {
      name: sectionName,
      createdBy: cachedUserData.userName,
      organizationId: cachedUserData.organizationId,
    };
    try {
      if (sectionName === "" || sectionName === undefined) {
        enqueueSnackbar(`Please add a valid section name`, {
          variant: "error",
        });
        return;
      }
      const response = await axios.post(`/api/business/createSection`, data);
      const id = response.data.id;
      const updatedSection = sections?.map((type) => {
        if (type.name === sectionName) {
          return {
            ...type,
            id: id,
            isSubmitted: false,
            isEdit: true,
            isFirstSubmit: false,
          };
        }
        return type;
      });

      setSections(updatedSection);
      const newSectionId = id;
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        sections: [...prevFormData?.sections, newSectionId],
      }));
    } catch (error) {
      // console.error("Error:", error);
    }
  };
  const handleDeleteSection = async (sectionId: number) => {
    try {
      await axios.delete(`/api/business/deleteSectionById/${sectionId}`);
      const updatedBusiness = sections.filter((type) => type.id !== sectionId);
      setSections(updatedBusiness);

      // Update the formData state by removing the deleted id
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        sections: formData?.sections?.filter((id: any) => id !== sectionId),
      }));
    } catch (error) {
      // console.error("Error:", error);
    }
  };
  const handleAddSection = async () => {
    // Create a new business type object
    const newSection: Section = {
      id: sections?.length + 1,
      name: "",
      organizationId: "",
      createdBy: "",
      isSubmitted: true,
      isEdit: false,
      isFirstSubmit: true,
      // isSubmit: true,
    };

    setSections([...sections, newSection]);
  };
  // console.log("entityOptions", formData);
  return (
    <form
      data-testid="technical-config-form"
      autoComplete="off"
      className={classes.form}
    >
      <Grid container>
        <Grid item sm={12} md={6}>
          <Grid container>
            <Grid item sm={12} md={4} className={classes.formTextPadding}>
              <strong>Category*</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              {/* <FormControl
                className={classes.formControl}
                variant="outlined"
                size="small"
              >
                <Select
                  key={Date.now()}
                  data-testid="entity-type"
                  onClick={() => console.log("clicked entity type")}
                  value={
                    edit || deletedId
                      ? selectFieldData.entityTypes.filter(
                          (item: any) => item?.id === formData?.entityType?.id
                        )?.[0]
                      : formData.entityType
                  }
                  onChange={handleChange}
                  name="entityType"
                  required
                  // disabled={
                  //   selectFieldData.entityTypes.length === 1 ||
                  //   disableFormFields ||
                  //   isCreated
                  // }
                  disabled={disableFormFields || isCreated}

                >
                  {selectFieldData?.entityTypes.map((item: any) => {
                    return (
                      <MenuItem
                        key={item}
                        data-testid={`menu-${item.name}`}
                        onClick={() => console.log("clicked menu item")}
                        value={item}
                      >
                        {item.name}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl> */}
              <FormControl
                className={classes.formControl}
                variant="outlined"
                size="small"
              >
                <OutlinedInput
                  value={formData?.entityType?.name}
                  readOnly
                  placeholder={
                    entityType?.name
                      ? entityType?.name
                      : formData?.entityType?.name
                  }
                  data-testid="entity-type-input"
                />
              </FormControl>
            </Grid>
            {/* <Grid item sm={12} md={4} className={classes.formTextPadding}>
              <strong>{
                // ${
                //   edit
                //     ? selectFieldData.entityTypes.filter(
                //         (item: any) => item?.id === formData.entityType?.id
                //       )?.[0]?.name
                //     : formData?.entityType?.name
                //     ? formData.entityType.name
                //     : ""
                // }
                `ID*`
              }</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <TextField
                fullWidth
                name="entityId"
                value={formData.entityId || ""}
                inputProps={{
                  "data-testid": "login-url",
                  maxLength: 9,
                }}
                variant="outlined"
                onChange={handleChange}
                size="small"
                disabled={true}
              />
            </Grid> */}

            <Grid item sm={12} md={4} className={classes.formTextPadding}>
              <strong>{
                // ${
                //   edit
                //     ? selectFieldData.entityTypes.filter(
                //         (item: any) => item?.id === formData.entityType?.id
                //       )?.[0]?.name
                //     : formData?.entityType?.name
                //     ? formData.entityType.name
                //     : ""
                // }
                `ID*`
              }</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <TextField
                fullWidth
                name="entityId"
                value={formData.entityId || ""}
                inputProps={{
                  "data-testid": "login-url",
                  maxLength: 6,
                }}
                variant="outlined"
                onChange={handleChange}
                size="small"
                disabled={disableFormFields || isCreated}
              />
            </Grid>

            <Grid item sm={12} md={4} className={classes.formTextPadding}>
              <strong>Description</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <TextField
                fullWidth
                // label='Realm Name'
                name="description"
                value={formData.description}
                variant="outlined"
                onChange={handleChange}
                size="small"
                disabled={disableFormFields || isCreated}
              />
            </Grid>
            <Grid item sm={12} md={4} className={classes.formTextPadding}>
              <strong>
                {`${
                  edit
                    ? selectFieldData.entityTypes.filter(
                        (item: any) => item?.id === formData?.entityType?.id
                      )?.[0]?.name
                    : formData?.entityType?.name
                    ? formData?.entityType?.name
                    : ""
                } Head`}
              </strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <AutoComplete
                suggestionList={departmentHeadList || userOptions}
                name=""
                keyName="users"
                labelKey="name"
                formData={formData}
                setFormData={setFormData}
                getSuggestionList={getSuggestionListUser}
                defaultValue={formData?.users?.length ? formData?.users : []}
                type="RA"
              />
            </Grid>

            {/* Additional Auditee Fields */}

            <Grid item sm={12} md={4} className={classes.formTextPadding}>
              <strong>Parent</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              {/* <AutoComplete
                suggestionList={entityOptions || []}
                name="Parent"
                keyName="parentId"
                labelKey="entityName"
                formData={formData}
                setFormData={setFormData}
                getSuggestionList={() => {}}
                defaultValue={formData?.parentId || null}
                multiple={false}
                disabled={disableFormFields || isCreated}
                handleChangeFromForm={(e: any, value: any) => {
                  setFormData((prevFormData: any) => ({
                    ...prevFormData,
                    parentId: value,
                  }));
                }}
              /> */}
              <DepartmentSelector
                locationId={
                  formData?.location
                    ? formData?.location?.id
                    : formData?.locationId
                }
                selectedDepartment={
                  formData?.department
                    ? formData?.department
                    : formData?.parentId
                }
                onSelect={(dept, type) =>
                  setFormData({ ...formData, department: { ...dept, type } })
                }
                onClear={() =>
                  setFormData((prev: any) => ({ ...prev, department: null }))
                }
              />
            </Grid>

            {/* <Grid item sm={12} md={4} className={classes.formTextPadding}>
              <strong>Hierarchy</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <FormControl variant="outlined" className={classes.formControl}>
                <InputLabel id="parent-multi-select-label">
                  Hierarchy
                </InputLabel>
                <Select
  labelId="parent-multi-select-label"
  multiple
  value={formData?.hierarchyChain || []}
  onChange={(e) =>
    setFormData({ ...formData, hierarchyChain: e.target.value })
  }
  label="Parent"
  renderValue={(selected:any) => (
    <div className={classes.chips}>
      {selected.map((id:any) => {
        const label = entityOptions.find((opt:any) => opt.id === id)?.entityName || id;
        return (
          <Chip
            key={id}
            label={label}
            onDelete={() =>
              setFormData({
                ...formData,
                hierarchyChain: formData.hierarchyChain.filter((item:any) => item !== id),
              })
            }
            className={classes.chip}
            deleteIcon={<MdCancel />}
          />
        );
      })}
    </div>
  )}
>
  {entityOptions.map((option:any) => (
    <MenuItem key={option.id} value={option.id}>
      {option.entityName}
    </MenuItem>
  ))}
</Select>

              </FormControl>
            </Grid> */}
          </Grid>
        </Grid>
        <Grid item xs={12} md={1}></Grid>
        <Grid item sm={12} md={5}>
          <Grid container>
            <Grid item sm={12} md={4} className={classes.formTextPadding}>
              <strong>{`${
                edit
                  ? selectFieldData.entityTypes.filter(
                      (item: any) => item?.id === formData?.entityType?.id
                    )?.[0]?.name
                  : formData?.entityType?.name
                  ? formData?.entityType?.name
                  : ""
              } Name*`}</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <TextField
                fullWidth
                // label='Realm Name'
                name="entityName"
                value={formData.entityName}
                variant="outlined"
                onChange={handleChange}
                size="small"
                disabled={disableFormFields || isCreated}
                inputProps={{ maxLength: 100 }}
              />
            </Grid>
            <Grid item sm={12} md={4} className={classes.formTextPadding}>
              <strong>Unit*</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              {/* <FormControl
                className={classes.formControl}
                variant="outlined"
                size="small"
              >
                <Select
                  value={edit ? formData.locationId : formData.location}
                  onChange={handleChange}
                  name={edit ? "locationId" : "location"}
                  data-testid="loc"
                  required
                  disabled={isLocAdmin || disableFormFields || isCreated}
                >
                  {selectFieldData?.location.map((item: any) => {
                    return (
                      <MenuItem key={item.id} value={item.id}>
                        {item.locationName}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl> */}
              <AutoComplete
                suggestionList={location}
                name={"Unit"}
                keyName={"locationName"}
                formData={formData}
                showAvatar={false}
                setFormData={setFormData}
                getSuggestionList={() => {}}
                labelKey={"locationName"}
                disabled={disableFormFields}
                defaultValue={
                  edit
                    ? formData?.location
                    : formData?.location?.id
                    ? formData?.location?.id
                    : cachedUserData.location
                  // : cachedUserData.location
                  //  : formData?.locationName
                }
                handleChangeFromForm={(e: any, value: any) => {
                  setFormData((prevFormData: any) => ({
                    ...prevFormData,
                    location: value,
                    locationId: value?.id,
                    users: [],
                    function: {},
                    functionId: {},
                  }));
                }}
                multiple={false}
              />
            </Grid>
            {/* <Grid item sm={12} md={4} className={classes.formTextPadding}>
              <strong>Function</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}> */}
            {/* <FormControl
                className={classes.formControl}
                variant="outlined"
                size="small"
              >
                <Select
                  value={formData.functionId}
                  onChange={handleChange}
                  name="functionId"
                  data-testid="functionsId"
                  required
                  disabled={isLocAdmin || disableFormFields || isCreated}
                >
                  {functions?.map((item: any) => {
                    return (
                      <MenuItem key={item} value={item.funid}>
                        {item.funname}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl> */}
            {/* <AutoComplete
                suggestionList={functions ? functions : []}
                name={"Function"}
                keyName={edit || deletedId ? "function" : "functionId"}
                labelKey="name"
                formData={formData}
                multiple={false}
                setFormData={setFormData}
                disabled={disableFormFields}
                getSuggestionList={getSuggestionListFunction}
                handleChangeFromForm={(e: any, value: any) => {
                  //console.log("valueChangeFunction", value, value?.id);
                  setFormData((prevFormData: any) => ({
                    ...prevFormData,
                    function: value,
                    functionId: edit ? value?.id : value,
                  }));
                }}
                // handleChangeFromForm={handleChange}
                defaultValue={
                  // // edit
                  // //   ? formData.function
                  // //   :
                  // formData?.functionId?.length ?
                  edit || deletedId
                    ? formData.function
                    : formData?.functionId?.length
                    ? formData?.functionId
                    : []
                }
                type="RA"
              />
            </Grid> */}
            {/* Notication List*/}
            <Grid item sm={12} md={4} className={classes.formTextPadding}>
              <strong>Manager</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <AutoComplete
                suggestionList={departmentHeadList || userOptions}
                name=""
                keyName="manager"
                labelKey="name"
                formData={formData}
                setFormData={setFormData}
                getSuggestionList={getSuggestionListUser}
                defaultValue={
                  formData?.notification?.length ? formData?.notification : []
                }
                type="RA"
                multiple={false}
                showAvatar={true}
              />
            </Grid>
            <Grid item sm={12} md={4} className={classes.formTextPadding}>
              <strong>Additional Auditees</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <AutoComplete
                suggestionList={departmentHeadList || userOptions}
                name="additionalAuditee"
                keyName="additionalAuditee"
                labelKey="name"
                formData={formData}
                setFormData={setFormData}
                getSuggestionList={getSuggestionListUser}
                defaultValue={
                  formData?.additionalAuditee?.length
                    ? formData?.additionalAuditee
                    : []
                }
                type="RA"
              />
            </Grid>

            <Grid item sm={12} md={4} className={classes.formTextPadding}>
              <strong>SPOC/PIC</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <AutoComplete
                suggestionList={
                  Array.isArray(departmentHeadList) &&
                  departmentHeadList.length > 0
                    ? departmentHeadList
                    : Array.isArray(userOptions)
                    ? userOptions
                    : []
                }
                name="pic"
                keyName="pic"
                labelKey="name"
                formData={formData}
                setFormData={setFormData}
                getSuggestionList={getSuggestionListUser}
                defaultValue={formData?.pic?.length ? formData?.pic : []}
                type="RA"
              />
            </Grid>
            {/* <Grid item sm={12} md={4} className={classes.formTextPadding}>
              <strong>Section</strong>
            </Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <Button
                variant="contained"
                onClick={handleAddSection}
                style={{
                  color: "#0E497A",
                  backgroundColor: "#ffffff",
                  padding: "3px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "medium",
                  marginTop: "20px",
                }}
                startIcon={<AddIcon />}
              >
                Add Sections
              </Button>
            </Grid>
            <Grid
              item
              sm={12}
              md={4}
              className={classes.formTextPadding}
            ></Grid>
            <Grid item sm={12} md={8} className={classes.formBox}>
              <div>
                {sections?.map((type, typeIndex) => (
                  <div key={type.id}>
                    <Grid container alignItems="center" spacing={2}>
                      <Grid item sm={10} md={10}>
                        <TextField
                          placeholder="Section"
                          variant="outlined"
                          value={type.name}
                          multiline // Enable multiline input
                          rowsMax={5} // Set the maximum number of rows before scrolling
                          disabled={
                            !type.isSubmitted ||
                            (type.isSubmitted && type.isEdit)
                          }
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleSectionNameChange(e, type.id)
                          }
                          className={classes.textField}
                          InputProps={{
                            style: {
                              fontSize: "12px",
                              minHeight: "48px",
                              width: "285px",
                            }, // Set the minimum height
                            endAdornment: (
                              <>
                                {!type.isSubmitted ||
                                (type.isSubmitted && type.isEdit) ? (
                                  <IconButton
                                    onClick={() => handleChangeIcon(type.id)}
                                  >
                                    <EditIcon width={24} height={24} />
                                  </IconButton>
                                ) : (
                                  <IconButton
                                    onClick={() =>
                                      !type.isFirstSubmit
                                        ? handleEditSection(type.id, type.name)
                                        : handleSectionSubmit(type.name)
                                    }
                                  >
                                    <CheckCircleIcon width={24} height={24} />
                                  </IconButton>
                                )}
                              </>
                            ),
                          }}
                          inputProps={{
                            maxLength: 200,
                            style: { fontSize: "14px" },
                            "data-testid": "organization-name",
                          }}
                        />
                      </Grid>
                      <Grid item sm={2} md={2}>
                        <IconButton
                          onClick={() => handleDeleteSection(type.id)}
                        >
                          <CloseIcon width={24} height={24} />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </div>
                ))}
              </div>
            </Grid> */}
          </Grid>
        </Grid>
      </Grid>
    </form>
  );
}

export default EntityForm;
