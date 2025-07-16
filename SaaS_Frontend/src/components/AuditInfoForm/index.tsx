import { useEffect, useState, useCallback } from "react";
import {
  Grid,
  TextField,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Box,
} from "@material-ui/core";
import { useSnackbar } from "notistack";
import { useStyles } from "./styles";
import { formStepperError, auditCreationForm } from "../../recoil/atom";
import { debounce } from "lodash";
import { useRecoilState, useSetRecoilState } from "recoil";
import { auditFormData } from "../../recoil/atom";
import getAppUrl from "../../utils/getAppUrl";
import { getUserInfo } from "apis/socketApi";
import {
  getAllAuditors,
  getAuditById,
  isAuditNumberUnique,
} from "../../apis/auditApi";
import { getOrganizationData } from "../../apis/orgApi";
import { currentLocation, currentAuditYear } from "../../recoil/atom";
import { useParams } from "react-router";
import moment from "moment";
import {
  getLocationById,
} from "../../apis/locationApi";
import AutoCompleteNew from "../AutoCompleteNew";
import { getAll } from "apis/systemApi";
import checkRoles from "utils/checkRoles";

/**
 * @types Props
 * @description Used for defining the prop types for AuditInfoForm component
 */
type Props = {
  isEdit?: any;
  initVal?: any;
  rerender?: any;
  handleDiscard?: any;
  handleSubmit?: any;
  isLoading?: any;
  systemTypes?: any;
  auditTypes?: any;
  subSystemTypes?: any;
  disabled?: any;
  locationId?: any;
  location?: any;
};

function AuditInfoForm({
  initVal,
  isEdit = false,
  handleDiscard,
  handleSubmit,
  isLoading,
  rerender,
  locationId,
  systemTypes,
  subSystemTypes,
  auditTypes,
  location,
  disabled = false,
}: Props) {
  const [suggestion, setSuggestion] = useState();
  const [formData, setFormData] = useRecoilState<any>(auditFormData);
  const [auditYear, setAuditYear] = useRecoilState<any>(currentAuditYear);
  const [currentLoc, setCurrentLoc] = useRecoilState<any>(currentLocation);
  // const [currentLoc, setCurrentLoc] = useState<any>(currentLocation);
  const [checklist, setChecklist] = useRecoilState<any>(auditCreationForm);
  const [systems, setSystems] = useState<any>([]);
  const [auditypes, setauditTypes] = useState<any>([]);
  const [auditNoError, setAuditNoError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentDate, setcurrentDate] = useState("");
  const setStepperError = useSetRecoilState<boolean>(formStepperError);
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const classes = useStyles();
  const realmName = getAppUrl();
  const { enqueueSnackbar } = useSnackbar();
  const { id } = useParams();
  const isAuditor = checkRoles("AUDITOR");
  const isMR = checkRoles("MR");

  let typeAheadValue: string;
  let typeAheadType: string;

  // useEffect(() => {
  //   console.log("check formData in audit info form", formData);
  // }, [formData]);

  /**
   * @method handleChange
   * @param e {any}
   * @returns nothing
   */
  const handleChange = (e: any) => {
    // if(e.target.name==="formData?.auditType")
    if (e.target.name === "location") {
      //   console.log("system type", formData?.systemType, e.target.value);
      //   // getAllAuditTypes();
      getSystem();
    }

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  console.log("formdatainaudit", formData);
  /**
   * @method getData
   * @description Function which will be used to fetch data when someone types in the search field
   * @param value {string}
   * @param type {string}
   * @returns nothing
   */
  const getData = async (value: string, type: string) => {};

  /**
   * @method debouncedSearch
   * @description Function to perform a delayed network call
   * @returns nothing
   */
  const debouncedSearch = debounce(() => {
    getData(typeAheadValue, typeAheadType);
  }, 400);

  /**
   * @method getSuggestionList
   * @param value {any}
   * @param type {string}
   * @returns nothing
   */
  const getSuggestionList = (value: any, type: string) => {
    typeAheadValue = value;
    typeAheadType = type;
    debouncedSearch();
  };

  /**
   * @method isAuditNumberUniqueCheck
   * @description Function to check whether the audit number is unique
   * @param number {string}
   * @returns
   */
  const isAuditNumberUniqueCheck = async (number: string) => {
    if (number.length === 0) {
      enqueueSnackbar("Number is empty", {
        variant: "error",
      });
      return;
    }

    try {
      const res: any = await isAuditNumberUnique(number);
      if (res.data.unique) {
        setAuditNoError(false);
        setStepperError(false);
      } else {
        setAuditNoError(true);
        setStepperError(true);
      }
    } catch (error: any) {
      enqueueSnackbar(error.message, {
        variant: "error",
      });
    }
  };

  const debounceFn = useCallback(debounce(isAuditNumberUniqueCheck, 500), []);

  /**
   * @method auditNumberHandler
   * @description Function to check the uniqueness of the audit number handler
   * @param e {any}
   * @returns nothing
   */
  const auditNumberHandler = async (e: any) => {
    setFormData({
      ...formData,
      auditNumber: e.target.value,
    });
    debounceFn(e.target.value);
  };
  const parseSystems = (data: any) => {
    const systemTypes: any = [];
    data?.map((item: any) => {
      systemTypes.push({
        name: item.name,
        id: item._id,
      });
    });
    return systemTypes;
  };

  console.log("parseSystems", parseSystems);

  // const getAllSubSystemTypes = (id: string) => {
  //   console.log("id in subsystems", id);
  //   getSystem().then((response: any) => {
  //     console.log("response for getsystems", response);
  //     //  setSystems(parseSystems(response?.data));
  //   });
  // };
  const getSystem = async () => {
    console.log("insidegetsystem", formData.location);
    const encodedSystems = encodeURIComponent(
      JSON.stringify(formData.location)
    );
    console.log("encode");
    getAll(encodedSystems)
      .then((res: any) =>
        setSystems(res.data.map((obj: any) => ({ id: obj.id, name: obj.name })))
      )
      .catch((err) => console.error(err));
  };
  console.log("systems", systems);
  // const audittypes: any = () => {
  //   getAllAuditTypes().then((response: any) => {
  //     console.log("response for audittypes", response);
  //     setauditTypes(parseauditypes(response?.data));
  //   });
  // };
  /**
   * @method getAuditors
   * @description Function to get all auditors
   * @param realm {string}
   * @returns nothing
   */
  const getAuditors = (realm: string) => {
    getAllAuditors(realm).then((response: any) => {
      setSuggestion(response?.data);
      setLoading(false);
    });
  };

  /**
   * @method setClausesAndDocuments
   * @description Function to parse all clauses and put them inside the recoil state
   * @param formData {any}
   * @returns nothing
   */
  const setClausesAndDocuments = (formData: any) => {
    const parsedClause = formData.auditedClauses.map((clause: any) => {
      return {
        item: clause,
      };
    });
    const parsedDocuments = formData.auditedDocuments.map((doc: any) => {
      return {
        item: doc,
      };
    });

    setFormData((prev: any) => {
      return {
        ...prev,

        auditedClauses: parsedClause,
        auditedDocuments: parsedDocuments,
      };
    });
  };

  useEffect(() => {
    setLoading(true);
    if (id) {
      getAuditById(id)
        .then((res: any) => {
          const date = moment(res?.respond?.date ?? new Date());
          const dateComponent = date.format("YYYY-MM-DD");
          const timeComponent = date.format("HH:mm");
          setClausesAndDocuments(res?.respond);
          const payload = {
            isDraft: res?.respond?.isDraft,
            auditType: res?.respond?.auditType,
            system: res?.respond?.system,
            auditors: res?.respond?.auditors,
            location: res?.respond?.location,
            auditNumber: res?.respond?.auditNumber,
            auditYear: res?.respond?.auditYear,
            auditName: res?.respond?.auditName,
            date: `${dateComponent}T${timeComponent}`,
            auditedEntity: res?.respond?.auditedEntity?.id,
            auditees: res?.respond?.auditees,
            auditedClauses:
              res?.respond?.auditedClauses.length === 0
                ? [{ item: {} }]
                : res?.respond?.auditedClauses,
            auditedDocuments:
              res?.respond?.auditedDocuments.length === 0
                ? [{ item: {} }]
                : res?.respond?.auditedDocuments,
            sections: res?.respond?.sections,
          };
          setChecklist((prev: any) => {
            return {
              ...prev,
              sections: res?.respond?.sections,
            };
          });
          return payload;
        })
        .then((response: any) => {
          setFormData((prev: any) => {
            return { ...prev, ...response };
          });
          setLoading(false);
        });
    }
    getAuditors(realmName);
  }, []);

  /**
   * @method getHeaderData
   * @description Function to get header data
   * @returns nothing
   */
  const getHeaderData = () => {
    getOrganizationData(realmName).then((response: any) => {
      console.log("audityearinaf", response.data.auditYear);
      setAuditYear(response?.data?.auditYear);
      // setFormData({
      //   ...formData,
      //   auditYear: response?.data?.auditYear,
      // });
    });
    getAllAuditors(realmName).then((response: any) => {
      console.log("getallauditors", response.data);

      getLocationById(response?.data[0].locationId).then((locresponse: any) => {
        // setCurrentLoc(locresponse?.data?.locationName);
        if (!isOrgAdmin) {
          setFormData({
            ...formData,
            location: locresponse?.data?.id,
          });
        }
      });
      getSystem();
    });
  };
  const getuserinfo = async () => {
    try {
      const user = await getUserInfo();
      const locationId = user?.data?.location;
      return locationId;
    } catch (error) {
      return error;
    }
  };

  useEffect(() => {
    const date = moment();
    const dateComponent = date.format("YYYY-MM-DD");
    const timeComponent = date.format("HH:mm");
    setcurrentDate(`${dateComponent}T${timeComponent}`);
    // setFormData({
    //   ...formData,
    //   date: `${dateComponent}T${timeComponent}`,
    // });

    getHeaderData();
  }, []);

  useEffect(() => {
    getSystem();
  }, [formData.location]);

  return (
    <>
      {loading ? (
        <Box
          marginY="auto"
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="40vh"
        >
          <CircularProgress />
        </Box>
      ) : (
        <form
          data-testid="org-admin-form"
          autoComplete="off"
          className={classes.form}
        >
          <Grid container>
            {/* Left hand container */}
            <Grid
              item
              container
              sm={2}
              md={6}
              className={classes.mobile__order}
            >
              <Grid item sm={12} md={4} className={classes.formTextPadding}>
                <strong>Audit Type*</strong>
              </Grid>

              <Grid item sm={12} md={8} className={classes.formBox}>
                <FormControl
                  className={classes.formControl}
                  variant="outlined"
                  size="small"
                >
                  <Select
                    value={formData?.auditType}
                    onChange={handleChange}
                    name="auditType"
                    data-testid="audit-type"
                    required
                  >
                    {auditTypes?.map((item: any) => {
                      return (
                        <MenuItem key={item.id} value={item?.id}>
                          {item?.auditType}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
              {/* <Grid item sm={12} md={4} className={classes.formTextPadding}>
                <strong>System Type*</strong>
              </Grid>
              <Grid item sm={12} md={8} className={classes.formBox}>
                <FormControl
                  className={classes.formControl}
                  variant="outlined"
                  size="small"
                >
                  <Select
                    value={formData?.systemType}
                    onChange={handleChange}
                    name="systemType"
                    data-testid="system-type"
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
              </Grid> */}
              <Grid item sm={12} md={4} className={classes.formTextPadding}>
                <strong>Location*</strong>
              </Grid>
              <Grid item sm={12} md={8} className={classes.formBox}>
                <FormControl
                  className={classes.formControl}
                  variant="outlined"
                  size="small"
                >
                  <Select
                    fullWidth
                    disabled={!isOrgAdmin || isMR || isAuditor}
                    name="location"
                    value={formData.location}
                    variant="outlined"
                    onChange={handleChange}
                    inputProps={{
                      "data-testid": "user-name",
                    }}
                    required
                  >
                    {location?.map((item: any) => {
                      return (
                        <MenuItem key={item.id} value={item?.id}>
                          {item?.locationName}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item sm={12} md={4} className={classes.formTextPadding}>
                <strong>System Name*</strong>
              </Grid>
              <Grid item sm={12} md={8} className={classes.formBox}>
                <FormControl
                  className={classes.formControl}
                  variant="outlined"
                  size="small"
                >
                  <Select
                    // disabled={true}
                    value={formData?.system || []}
                    onChange={handleChange}
                    name="system"
                    data-testid="systemName"
                    multiple
                    required
                  >
                    {systems?.map((item: any) => {
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
                <strong>Audit Year*</strong>
              </Grid>
              <Grid item sm={12} md={8} className={classes.formBox}>
                <TextField
                  fullWidth
                  disabled={true}
                  name="auditingYear"
                  value={auditYear}
                  variant="outlined"
                  onChange={handleChange}
                  size="small"
                  inputProps={{
                    "data-testid": "user-name",
                  }}
                  required
                />
              </Grid>
            </Grid>
            {/* Gap container */}
            <Grid item sm={12} md={1}></Grid>
            {/* Right hand container  */}
            <Grid item container xs={12} sm={12} md={5}>
              <Grid item sm={12} md={4} className={classes.formTextPadding}>
                <span>
                  <strong>Auditor(s)*</strong>
                </span>
              </Grid>
              <Grid item sm={12} md={8} className={classes.formBox}>
                <AutoCompleteNew
                  suggestionList={suggestion ? suggestion : []}
                  name="Auditor"
                  keyName="auditors"
                  showAvatar={true}
                  disabled={disabled}
                  labelKey="firstname"
                  secondaryLabel="lastname"
                  formData={formData}
                  setFormData={setFormData}
                  getSuggestionList={() => getSuggestionList}
                  defaultValue={formData.auditors}
                />
              </Grid>

              <Grid item sm={12} md={4} className={classes.formTextPadding}>
                <strong>Date and Time*</strong>
              </Grid>
              <Grid item sm={12} md={8} className={classes.formBox}>
                <TextField
                  fullWidth
                  disabled={disabled}
                  type="datetime-local"
                  name="date"
                  value={formData.date === "" ? currentDate : formData.date}
                  variant="outlined"
                  onChange={handleChange}
                  size="small"
                  inputProps={{
                    min: currentDate,
                  }}
                  required
                />
              </Grid>
              <Grid item sm={12} md={4} className={classes.formTextPadding}>
                <strong>Audit Number*</strong>
              </Grid>
              <Grid item sm={12} md={8} className={classes.formBox}>
                <TextField
                  fullWidth
                  // disabled={disabled}
                  disabled={true}
                  name="auditNumber"
                  value={formData?.auditNumber}
                  variant="outlined"
                  onChange={auditNumberHandler}
                  size="small"
                  inputProps={{
                    "data-testid": "audit-number",
                  }}
                  required
                  error={auditNoError}
                  helperText={auditNoError && "Audit number already exists"}
                />
              </Grid>
              <Grid item sm={12} md={4} className={classes.formTextPadding}>
                <strong>Audit Name*</strong>
              </Grid>
              <Grid item sm={12} md={8} className={classes.formBox}>
                <TextField
                  fullWidth
                  disabled={disabled}
                  name="auditName"
                  value={formData?.auditName}
                  variant="outlined"
                  onChange={handleChange}
                  size="small"
                  inputProps={{
                    "data-testid": "user-name",
                  }}
                  required
                />
              </Grid>
            </Grid>
          </Grid>
        </form>
      )}
    </>
  );
}

export default AuditInfoForm;
