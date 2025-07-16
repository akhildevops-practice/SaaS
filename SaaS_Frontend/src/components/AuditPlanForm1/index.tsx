import React, { useEffect, useState } from "react";
import {
  Box,
  FormControl,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@material-ui/core";
import useStyles from "./styles";
import axios from "../../apis/axios.global";
import CustomModal from "components/newComponents/CustomModal";
import checkRoles from "utils/checkRoles";
import { roles } from "utils/enums";
import { debounce } from "lodash";
import AutoComplete from "components/AutoComplete";
import { currentAuditPlanYear } from "recoil/atom";
import { useRecoilState } from "recoil";

type Props = {
  initialiseEntities: any;
  auditPlanData: any;
  locationName: any;
  setLocationNo: any;
  setLocationName: any;
  scope: any;
  setScope: any;
  role: any;
  setrole: any;
  isOrgAdmin: any;
  setAuditPlanData: React.Dispatch<React.SetStateAction<any>>;
  isEdit?: boolean;
  isModalOpen?: boolean;
  disabledForDeletedModal?: boolean;
  selectedAuditPlan?: any;
  setIsModalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  isReadOnly?: boolean;
  refForForAuditPlanForm1?: any;
  refForForAuditPlanForm2?: any;
  refForForAuditPlanForm3?: any;
  refForForAuditPlanForm4?: any;
};

/**
 * This the whole UI structure of the Audit System Form
 *
 * @param {boolean} isEdit This is to check if the form is in EDIT mode
 * @returns Audit System Form
 */

function AuditPlanForm1({
  initialiseEntities,
  auditPlanData,
  setAuditPlanData,
  locationName,
  setLocationNo,
  scope,
  setScope,
  role,
  setrole,
  isOrgAdmin,
  setLocationName,
  disabledForDeletedModal,
  isModalOpen = false,
  setIsModalOpen = () => {},
  isEdit = false,
  isReadOnly = false,
  refForForAuditPlanForm1,
  refForForAuditPlanForm2,
  refForForAuditPlanForm3,
  refForForAuditPlanForm4,
}: Props) {
  const [systems, setSystems] = useState<any[]>([]);
  const [auditPlan, setAuditPlan] = useState<any[]>([]);
  const [searchSystems, setSearchSystems] = useState<any[]>([]);
  const [locationList, setLocationList] = useState<any[]>([]);
  const [auditTypes, setAuditTypes] = useState<any[]>([]);
  const [tempScope, setTempScope] = useState<string>("");
  const [auditTypeName, setAuditTypeName] = useState<string>("");
  const [disableLocation, setDisableLocation] = useState<boolean>(false);
  const [selectedAuditPlan, setSelectedAuditPlan] = useState();
  const [searchValues, setSearch] = useState<any>({ searchQuery: "" });
  const isMR = checkRoles(roles.MR);
  const [auditPlanYear, setAuditPlanYear] =
    useRecoilState<any>(currentAuditPlanYear);

  console.log("isReadOnly", isReadOnly);

  const classes = useStyles();
  useEffect(() => {
    getLocation();
    getLocationOptions();
    getAuditYear();
    getAuditType();
    if (isEdit && auditPlanData.locationId) getSystems();
  }, []);

  let typeAheadValue: string;
  let typeAheadType: string;

  useEffect(() => {
    console.log("hello world test in get duplicate");
    getAuditPlan();
  }, [auditPlanData.auditType]);

  useEffect(() => {
    if (auditPlanData.location) getSystems();

    // if (auditPlanData.auditType) getScopeRoleAndPlanType();
  }, [auditPlanData]);

  useEffect(() => {
    if (selectedAuditPlan) {
      getAuditPlanDetailsById();
    }
  }, [selectedAuditPlan]);

  useEffect(() => {
    if (isEdit && scope === "Unit") {
      setDisableLocation(true);
    }
  }, [scope]);

  // Corporate Function

  // useEffect(() => {
  //   if (isEdit && scope === "Corporate Function") {
  //     setDisableLocation(true);
  //   }
  // }, [scope]);

  useEffect(() => {
    if (isEdit && auditPlanData?.useFunctionsForPlanning === true) {
      setDisableLocation(true);
    }
  }, [auditPlanData]);

  // get audit year
  const getAuditYear = async () => {
    // await axios(`api/auditPlan/getAuditYear`) // audit year API here
    //   .then((res) => {
    // console.log("audityearingetaudityear", res);
    setAuditPlanData((prev: any) => ({
      ...prev,
      auditName: `${
        (!isOrgAdmin ? auditPlanData.location.locationName : "")
      }- ${auditPlanYear}`,
      year: auditPlanYear,
    }));
    // })
  };
  const getAuditPlan = async () => {
    const auditType = auditPlanData?.auditType || "";
    await axios(`api/auditPlan/getAuditPlanSingleByIdAndAuditType/${auditType}`) // audit year API here
      .then((res) => {
        setAuditPlan(res.data);
      })
      .catch((err) => console.error(err));
  };

  const convertDate = (date: string) => {
    const d = new Date(date);

    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };
  const getAuditPlanDetailsById = async () => {
    await axios(`/api/auditPlan/getAuditPlanSingle/${selectedAuditPlan}`)
      .then((res) => {
        setScope(res.data.entityType);
        const data = res.data.auditPlanEntityWise
          // .filter((obj: any) => obj.deleted)
          .map((obj: any) => ({
            id: obj.id,
            entityId: obj.entityId,
            name: obj.entityName,
            months: obj.auditSchedule,
            deleted: obj.deleted,
          }));
        setAuditPlanData({
          // auditName: res.data.auditName,
          // year: res.data.auditYear,
          // status: res.data.status,
          // location: {
          //   id: res.data.locationId,
          //   locationName: res.data.location,
          // },
          // locationId: res.data.locationId,
          // createdBy: res.data.createdBy,
          // auditTypeName: res.data.auditTypeName,
          // createdOn: convertDate(res.data.createdAt),
          // auditType: res.data.auditType,
          // planType: res.data.planType,
          // lastModified: convertDate(res.data.updatedAt),
          // systemType: res.data.systemTypeId,
          // systemName:
          //   res.data.locationId === ""
          //     ? res.data.systemMaster
          //     : res.data.systemMaster.map((value: any) => value._id),
          // prefixSuffix: res.data.prefixSuffix,
          ...auditPlanData,
          scope: {
            id: res.data.entityTypeId,
            name: res.data.entityType,
          },
          // // scope: res.data,
          // // role: res.data,
          auditPlanId: res.data.id,
          // role: res.data.roleId,
          auditorCheck: res.data.auditorCheck,
          // comments: res.data.comments,
          AuditPlanEntitywise: res.data.auditPlanEntityWise
            // .filter((obj: any) => !obj.deleted)
            .map((obj: any) => ({
              id: obj.id,
              entityId: obj.entityId,
              name: obj.entityName,
              months: obj.auditSchedule,
              auditors: obj.auditors,
              auditPlanId: obj.auditPlanId,
            })),
        });
      })
      .catch((err) => console.error(err));
  };
  // get location by user id
  const getLocation = async () => {
    await axios(`api/auditPlan/getLocationByUserID`) // location by user ID API here
      .then((res) => {
        setLocationName(res.data.locationName);
        setAuditPlanData((prev: any) => ({
          ...prev,
          location: disableLocation
            ? ""
            : { id: res.data.id, locationName: res.data.locationName },
          createdBy: res.data.username ?? "",
        }));
      })
      .catch((err) => console.error(err));
  };

  //get all locations
  const getLocationOptions = async () => {
    await axios("/api/kpi-definition/getAllLocations")
      .then((res) => {
        const ops = res.data.map((obj: any) => {
          return {
            id: obj.id,
            locationName: obj.locationName,
            locationNo: obj.locationId,
          };
        });
        setLocationList(ops);
      })
      .catch((err) => console.error(err));
  };

  // const getSystem = async (value: string, type: string) => {
  //   try {
  //     let res = await axios.get(
  //       `/api/documents/filerValue?searchLocation=&searchBusinessType=&searchEntity=&searchSystems=${value}&searchDoctype=&searchUser=`
  //     );
  //     setSearchSystems(res.data.allSystems);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };

  const getSystem = async (value: string, type: string) => {
    try {
      const res = await axios.get(
        `/api/documents/filerValue?searchLocation=&searchBusinessType=&searchEntity=&searchSystems=${value}&searchDoctype=&searchUser=`
      );
      const ops = res.data.allSystems.map((obj: any) => ({
        id: obj._id,
        name: obj.name,
      }));
      setSearchSystems(ops);
    } catch (err) {
      console.log(err);
    }
  };

  const debouncedSearchSystem = debounce(() => {
    getSystem(typeAheadValue, typeAheadType);
  }, 50);

  const getSuggestionListSystem = (value: any, type: string) => {
    typeAheadValue = value;
    typeAheadType = type;
    debouncedSearchSystem();
  };

  const getSystems = async () => {
    const encodedLocation = isOrgAdmin
      ? encodeURIComponent(
          JSON.stringify(
            isEdit ? [auditPlanData.locationId] : [auditPlanData.location]
          )
        )
      : encodeURIComponent(
          JSON.stringify(
            auditPlanData.locationId
              ? auditPlanData.locationId
              : auditPlanData.location.id
          )
        );

    await axios(`/api/systems/displaySystems/${encodedLocation}`)
      .then((res) => {
        setSystems(
          res?.data?.map((obj: any) => ({ id: obj.id, name: obj.name }))
        );
      })
      .catch((err) => console.error(err));
  };

  // // get scope and role by auditType
  // const getScopeRoleAndPlanType = async () => {
  //   await axios(
  //     `api/audit-settings/getAuditTypeById/${auditPlanData.auditType}`
  //   )
  //     .then((res) =>
  //       setScopes(
  //         res.data.map((obj: any) => ({ id: obj._id, name: obj.name }))
  //       )
  //     )
  //     .catch((err) => console.error(err));
  // };

  // get scope and role by auditType
  const getScopeRoleAuditorCheckAndPlanType = async (id: any) => {
    await axios(`api/audit-settings/getAuditTypeById/${id}`) // location by user ID API here
      .then((res) => {
        const parsedScope = JSON.parse(res.data.scope);
        setAuditPlanData((prev: any) => ({
          ...prev,
          scope: parsedScope,
          role: res.data.responsibility,
          planType: res.data.planType,
          // auditName: `${auditPlanData.location.locationName}-${auditTypeName}-${auditPlanData.year}`,
          auditorCheck: res.data.auditorCheck,
        }));
        if (
          parsedScope.name === "Unit" 
          // ||
          // parsedScope.name === "Corporate Function" ||
          // res.data.useFunctionsForPlanning === true
        ) {
          setDisableLocation(true);
          setAuditPlanData((prev: any) => ({
            ...prev,
            location: "",
          }));
        } else {
          setDisableLocation(false);
        }
        // setScope(res.data.name);
        // setrole(res.data.responsibility);
      })
      .catch((err) => console.error(err));
  };

  // // get scopes by location
  // const getScopes = async () => {
  //   await axios(`/api/auditPlan/getEntityByLocation`)
  //     .then((res) => {
  //       setScopes(res.data);
  //     })
  //     .catch((err) => console.error(err));
  // };

  // // get roles
  // const getRoles = async () => {
  //   await axios(`/api/auditPlan/getRoles`) // roles API here
  //     .then((res) => {
  //       setRoles(res.data);
  //     })
  //     .catch((err) => console.error(err));
  // };

  //get auditTypes
  const getAuditType = async () => {
    try {
      const res = await axios.get(
        `/api/audit-settings/getUserPermissionBasedAuditTypes`
      );
      setAuditTypes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e: any) => {
    if (e.target.name === "location" || e.target.name === "locationId") {
      const selectedLocation = locationList.filter(
        (item: any) => item.id === e.target.value
      );
      if (selectedLocation) {
        setAuditPlanData((prev: any) => ({
          ...prev,
          checkOn: false,
          auditName: `${selectedLocation[0].locationName}-${auditTypeName}-Plan-${auditPlanData.year}`,
          [e.target.name]: selectedLocation[0].locationName,
        }));
        setLocationNo(selectedLocation[0].locationNo);
      }
    }
    // if (
    //   !isEdit &&
    //   e.target.name === "auditType" &&
    //   auditPlanData.AuditPlanEntitywise.length > 0
    // ) {
    //   const selectedAuditTypeName = auditTypes.filter(
    //     (value) => value.id === e.target.value
    //   );
    //   setAuditTypeName(selectedAuditTypeName[0].auditType);
    //   if (!selectedAuditPlan) {
    //     initialiseEntities();
    //   }

    //   setTempScope(e.target.value);
    //   setIsModalOpen(true);

    //   return;
    // } else
    if (e.target.name === "auditType") {
      setAuditTypeName("");
      // auditPlanData.systemName
      setAuditPlanData({ ...auditPlanData, systemName: [] });
      const selectedAuditTypeName = auditTypes.filter(
        (value) => value.id === e.target.value
      );
      const selectedLocation = locationList.filter(
        (item: any) => item.id === auditPlanData?.location
      );
      const auditNameText = `${
        isOrgAdmin
          ? selectedLocation[0]?.locationName || ""
          : auditPlanData.location.locationName
      }-${selectedAuditTypeName[0].auditType}-Plan-${auditPlanData.year}`;
      console.log(
        "removeMinus one",
        auditNameText,
        auditPlanData.location.locationName
      );
      const removeMinus = auditNameText.replace(/-/, "");
      console.log("removeMinus", auditNameText);
      setAuditTypeName(selectedAuditTypeName[0].auditType);
      setAuditPlanData((prev: any) => ({
        ...prev,
        auditName: removeMinus,
        [e.target.name]: e.target.value,
      }));
      const data = auditTypes.filter((value) => value.id == e.target.value);
      setAuditPlanData((prev: any) => ({
        ...prev,
        useFunctionsForPlanning: data[0].useFunctionsForPlanning,
      }));
      getScopeRoleAuditorCheckAndPlanType(e.target.value);
    }
    setAuditPlanData((prev: any) => ({
      ...prev,
      // auditName: `${auditPlanData.location.locationName}-${auditTypeName}-${auditPlanData.year}`,
      [e.target.name]: e.target.value,
    }));
  };

  const handleStatusChange = () => {
    setAuditPlanData((prev: any) => ({
      ...prev,
      // auditName: `${auditPlanData.location.locationName}-${auditTypeName}-${auditPlanData.year}`,
      status: prev.status === "active" ? "inactive" : "active",
    }));
  };

  return (
    <>
      {isEdit && (
        <CustomModal
          open={isModalOpen}
          setOpen={setIsModalOpen}
          heading="Existing plan will be deleted"
          text={`An audit plan for the scope 
        
         already exists. If scope is modified, the existing plan will be deleted.`}
          buttons={[
            {
              name: "Continue",
              color: "primary",
              func: () => {
                setAuditPlanData((prev: any) => ({
                  ...prev,
                  scope: tempScope,
                  AuditPlanEntitywise: [],
                }));
              },
            },
          ]}
        />
      )}

      <form
        data-testid="audit-system-form"
        autoComplete="off"
        className={classes.form}
      >
        {auditPlanData.auditorCheck && (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Typography variant="h6" style={{ padding: "2px 0 0 20px" }}>
              {"This plan has Auditor Finalization Option"}
            </Typography>
          </div>
        )}

        <Grid
          container
          alignItems="center"
          justifyContent="space-between"
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
              <Grid item sm={2} md={4} className={classes.formTextPadding}>
                <strong>
                  <span className={classes.label}>Audit Type</span>
                  <span className={classes.asterisk}>*</span>{" "}
                </strong>
              </Grid>
              {isReadOnly ? (
                <Grid item sm={12} md={8} className={classes.formBox}>
                  <FormControl
                    className={classes.formControl}
                    variant="outlined"
                    size="small"
                  >
                    <div ref={refForForAuditPlanForm1}>
                      <TextField
                        fullWidth
                        name="auditName"
                        value={auditPlanData.auditTypeName}
                        // placeholder="Please Enter Audit Name"
                        variant="outlined"
                        size="small"
                        required
                        disabled={isReadOnly}
                        InputLabelProps={{ shrink: false }}
                        inputProps={{
                          "data-testid": "auditName",
                        }}
                        InputProps={{
                          style: {
                            fontSize: "14px",
                            backgroundColor:
                              isReadOnly || disabledForDeletedModal
                                ? "white"
                                : undefined,
                          },
                          classes: { root: classes.textField },
                        }}
                        // className={classes.textField}
                      />
                    </div>
                  </FormControl>
                </Grid>
              ) : (
                <Grid item sm={12} md={8} className={classes.formBox}>
                  <FormControl
                    className={classes.formControl}
                    variant="outlined"
                    size="small"
                  >
                    <Select
                      name="auditType"
                      displayEmpty
                      value={auditPlanData.auditType}
                      onChange={handleChange}
                      data-testid="auditType"
                      disabled={isReadOnly || disabledForDeletedModal}
                      required
                      style={{
                        fontSize: "14px",
                        backgroundColor:
                          isReadOnly || disabledForDeletedModal
                            ? "white"
                            : undefined,
                      }}
                      ref={refForForAuditPlanForm1}
                    >
                      {auditTypes.map((obj) => (
                        <MenuItem key={obj.id} value={obj.id}>
                          {obj.auditType}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              <Grid item sm={2} md={4} className={classes.formTextPadding}>
                <strong>
                  <span className={classes.label}>Location</span>
                  <span className={classes.asterisk}>*</span>{" "}
                </strong>
              </Grid>
              <Grid item sm={12} md={8} className={classes.formBox}>
                {!isOrgAdmin ? (
                  <TextField
                    fullWidth
                    name="location"
                    value={
                      isEdit && !disableLocation
                        ? auditPlanData.location.locationName
                        : disableLocation
                        ? ""
                        : locationName
                    }
                    variant="outlined"
                    size="small"
                    disabled
                    InputLabelProps={{ shrink: false }}
                    inputProps={{
                      maxLength: 25,
                      "data-testid": "location",
                    }}
                    InputProps={{
                      style: {
                        fontSize: "14px",
                        backgroundColor:
                          isReadOnly || disabledForDeletedModal
                            ? "white"
                            : undefined,
                      },
                      classes: { root: classes.textField },
                    }}
                    ref={refForForAuditPlanForm3}
                  />
                ) : (
                  <FormControl
                    className={classes.formControl}
                    variant="outlined"
                    size="small"
                  >
                    <Select
                      value={
                        isEdit
                          ? auditPlanData.locationId
                          : selectedAuditPlan
                          ? auditPlanData.locationId
                          : auditPlanData.location
                      }
                      onChange={handleChange}
                      name={isEdit ? "locationId" : "location"}
                      data-testid="location"
                      required
                      disabled={
                        isReadOnly || disableLocation || disabledForDeletedModal
                      }
                      style={{
                        fontSize: "14px",
                        color: "black",
                        backgroundColor:
                          isReadOnly || disabledForDeletedModal
                            ? "white"
                            : undefined,
                      }}
                      ref={refForForAuditPlanForm3}
                    >
                      {locationList.map((item: any) => (
                        <MenuItem key={item.id} value={item.id}>
                          {item.locationName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Grid>
            </Grid>
          </Grid>

          <Grid item sm={12} md={6}>
            <Grid
              container
              style={{
                display: "flex",
                flexDirection: "column",
                alignContent: "center",
              }}
            >
              <Grid item sm={2} md={4} className={classes.formTextPadding}>
                <strong>
                  <span className={classes.label}>Audit Name</span>
                  <span className={classes.asterisk}>*</span>{" "}
                </strong>
              </Grid>
              <Grid
                item
                sm={12}
                md={8}
                className={classes.formBox}
                // style={{ paddingRight: "50%" }}
              >
                <TextField
                  fullWidth
                  name="auditName"
                  value={auditPlanData.auditName}
                  // placeholder="Please Enter Audit Name"
                  variant="outlined"
                  onChange={handleChange}
                  size="small"
                  required
                  disabled={isReadOnly || disabledForDeletedModal}
                  InputLabelProps={{ shrink: false }}
                  inputProps={{
                    "data-testid": "auditName",
                  }}
                  InputProps={{
                    style: {
                      fontSize: "14px",
                      backgroundColor:
                        isReadOnly || disabledForDeletedModal
                          ? "white"
                          : undefined,
                    },
                    classes: { root: classes.textField },
                  }}
                  ref={refForForAuditPlanForm2}
                />
              </Grid>

              <Grid item sm={12} md={4} className={classes.formTextPadding}>
                <strong>
                  <span className={classes.label}>System Name</span>
                  <span className={classes.asterisk}>*</span>{" "}
                </strong>
              </Grid>
              <Grid item sm={12} md={8} className={classes.formBox}>
                {!disableLocation ? (
                  <FormControl
                    className={classes.formControl}
                    variant="outlined"
                    size="small"
                  >
                    <Select
                      name="systemName"
                      displayEmpty
                      value={auditPlanData.systemName}
                      multiple={true}
                      onChange={handleChange}
                      data-testid="system-name"
                      disabled={isReadOnly || disabledForDeletedModal}
                      required
                      style={{
                        border:
                          isReadOnly || disabledForDeletedModal
                            ? "none"
                            : undefined,
                        backgroundColor:
                          isReadOnly || disabledForDeletedModal
                            ? "white"
                            : undefined,
                        color: "black",
                      }}
                      ref={refForForAuditPlanForm4}
                    >
                      {systems.map((obj) => (
                        <MenuItem key={obj.id} value={obj.id}>
                          {obj.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <Box>
                    <div ref={refForForAuditPlanForm4}>
                      <AutoComplete
                        suggestionList={searchSystems}
                        name={""}
                        keyName={"systemName"}
                        formData={auditPlanData}
                        disabled={isReadOnly || disabledForDeletedModal}
                        setFormData={setAuditPlanData}
                        getSuggestionList={getSuggestionListSystem}
                        labelKey={"name"}
                        multiple={true}
                        defaultValue={auditPlanData.systemName || []}
                      />
                    </div>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Grid>

          {!isEdit && (
            <Grid item sm={12} md={6}>
              <Grid
                container
                style={{
                  display: "flex",
                  flexDirection: "column",
                  // alignContent: "center",
                }}
              >
                <>
                  <Grid item sm={12} md={4} className={classes.formTextPadding}>
                    <strong>
                      <span className={classes.label}>
                        Duplicate From Audit Plan
                      </span>
                      {/* <span className={classes.asterisk}>*</span>{" "} */}
                    </strong>
                  </Grid>
                  <Grid item sm={12} md={8} className={classes.formBox}>
                    {!isEdit ? (
                      <FormControl
                        className={classes.formControl}
                        variant="outlined"
                        size="small"
                      >
                        <Select
                          name="systemName"
                          displayEmpty
                          value={selectedAuditPlan}
                          disabled={isReadOnly}
                          // multiple={true}
                          onChange={(e: any) => {
                            setAuditPlanData({
                              ...auditPlanData,
                              checkOn: true,
                            });
                            setSelectedAuditPlan(e.target.value);
                          }}
                          data-testid="system-name"
                          // disabled={isMR || isOrgAdmin ? false : true}
                          required
                        >
                          {auditPlan.map((obj) => (
                            <MenuItem key={obj._id} value={obj._id}>
                              {obj.auditName}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <Box>
                        <AutoComplete
                          suggestionList={searchSystems}
                          name={""}
                          keyName={"systemName"}
                          formData={auditPlanData}
                          setFormData={setAuditPlanData}
                          getSuggestionList={getSuggestionListSystem}
                          disabled={isReadOnly}
                          labelKey={"name"}
                          multiple={true}
                          defaultValue={auditPlanData.systemName || []}
                        />
                      </Box>
                    )}
                  </Grid>
                </>
              </Grid>
            </Grid>
          )}

          <Grid item sm={12} md={12} style={{ padding: "0 10px 0 10px" }}>
            <Grid
              container
              style={{
                display: "flex",
                flexDirection: "column",

                // backgroundColor: "pink",
                // alignContent: "center",
              }}
            >
              {/* (isMR || isOrgAdmin ? false : true) */}
              <Grid item sm={12} md={4} className={classes.formTextPadding}>
                <strong>Comments</strong>
              </Grid>
              <Grid item sm={12} md={12} className={classes.formBox}>
                <TextField
                  minRows={4}
                  style={{ minWidth: "98%" }}
                  name="comments"
                  multiline
                  maxRows={4}
                  value={auditPlanData.comments}
                  onChange={handleChange}
                  variant="outlined"
                  disabled={isReadOnly || disabledForDeletedModal}
                  size="small"
                  InputLabelProps={{ shrink: false }}
                  InputProps={{
                    style: {
                      fontSize: "14px",
                      color: "black",
                      backgroundColor:
                        isReadOnly || disabledForDeletedModal
                          ? "white"
                          : undefined,
                      border: "none",
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </form>
    </>
  );
}

export default AuditPlanForm1;
