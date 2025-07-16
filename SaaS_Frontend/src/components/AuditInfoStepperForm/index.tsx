import { useEffect, useState, useCallback, useRef } from "react";
import {
  Grid,
  TextField,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Box,
  useMediaQuery,
  ListSubheader,
  InputLabel,
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
  getAllAuditees,
  getAllAuditorsNew,
  getAuditById,
  isAuditNumberUnique,
} from "apis/auditApi";
import { currentLocation, currentAuditYear } from "../../recoil/atom";
import { useParams } from "react-router";
import moment from "moment";
import { getLocationById } from "../../apis/locationApi";
import AutoCompleteNew from "../AutoCompleteNew";
import { getAll } from "apis/systemApi";
import checkRoles from "utils/checkRoles";
import { getEntityByLocationId } from "apis/entityApi";
import { getAllClauses } from "apis/clauseApi";
import { getAllDocumentsByEntity } from "apis/documentsApi";
import { useLocation } from "react-router-dom";
import getYearFormat from "utils/getYearFormat";
import DepartmentSelector from "components/ReusableComponents/DepartmentSelector";

import { DatePicker, Tour, TourProps } from "antd";
import dayjs from "dayjs";
import GroupedSelect from "components/ReusableComponents/GroupedSelect";

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
  disabledFromProp?: any;
  locationId?: any;
  location?: any;
  refForReportForm12?: any;
};

function AuditInfoStepperForm({
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
  disabledFromProp,
  refForReportForm12,
}: Props) {
  const matches = useMediaQuery("(min-width:786px)");
  const [suggestion, setSuggestion] = useState();
  const [formData, setFormData] = useRecoilState<any>(auditFormData);
  const [auditYear, setAuditYear] = useRecoilState<any>(currentAuditYear);
  const [currentLoc, setCurrentLoc] = useRecoilState<any>(currentLocation);
  // const [currentLoc, setCurrentLoc] = useState<any>(currentLocation);
  const [checklist, setChecklist] = useRecoilState<any>(auditCreationForm);
  const [selectedSingle, setSelectedSingle] = useState<any>(null);

  const [systems, setSystems] = useState<any>([]);
  const [auditypes, setauditTypes] = useState<any>([]);
  const [auditNoError, setAuditNoError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentDate, setcurrentDate] = useState("");
  const [lastDate, setLastDate] = useState("");
  const [auditeeSuggestion, setAuditeeSuggestion] = useState<any>([]);
  const [entHead, setEntHead] = useState<any>();
  const [entitySuggestion, setEntitySuggestion] = useState<any>([]);
  const [clauses, setClauses] = useState<any>([]);
  const [documents, setDocuments] = useState<any>([]);
  const [validationError, setValidationError] = useState({
    auditName: "",
  });
  const [disabled, setDisabled] = useState<any>(false);
  const [auditTypeName, setAuditTypeName] = useState("");
  const [entityTypeOption, setEntityTypeOption] = useState([]);
  const [multipleEntityAudit, setMultipleEntityAudit] = useState(false);
  const [entityName, setEntityName] = useState("");
  const setStepperError = useSetRecoilState<boolean>(formStepperError);
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const classes = useStyles();
  const realmName = getAppUrl();
  const navigationLocation = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const { id } = useParams();
  const isAuditor = checkRoles("AUDITOR");
  const isMR = checkRoles("MR");

  let typeAheadValue: string;
  let typeAheadType: string;

  useEffect(() => {
    if (formData?.location) {
      getEntity();
    }
  }, [formData?.location]);

  useEffect(() => {
    if (
      formData?.location &&
      formData?.system?.length > 0 &&
      formData?.auditType
    ) {
      setStepperError(false);
    } else {
      setStepperError(true);
    }
  }, [formData]);
  useEffect(() => {
    if (navigationLocation?.state?.disableFields) {
      setDisabled(true);
    }
    if (navigationLocation?.state?.read) {
      setDisabled(true);
    }
    if (!formData?.isDraft) {
      setDisabled(true);
    }
    // console.log("location state auditschedulename", navigationLocation?.state);
    if (
      formData?.auditScheduleId !== "No Schedule" &&
      !!id &&
      formData?.isDraft
    ) {
      setDisabled(true);
    }
    if (navigationLocation?.state?.auditScheduleName) {
      // console.log("inside name set");
      setFormData({
        ...formData,
        auditName: `${navigationLocation?.state?.auditScheduleName || ""}-${
          navigationLocation?.state?.entityName || ""
        }`,
      });
    }
  }, [formData?.auditScheduleId, formData?.isDraft, navigationLocation]);

  useEffect(() => {
    if (auditTypeName) {
      setFormData({
        ...formData,
        auditName: `${auditTypeName || ""}-${entityName || ""}`,
      });
    }
    if (entityName) {
      setFormData({
        ...formData,
        auditName: `${auditTypeName || ""}-${entityName || ""}`,
      });
    }
  }, [formData.auditedEntity, formData?.auditType]);

  useEffect(() => {
    getAuditors();
  }, [formData]);

  useEffect(() => {
    auditTypes.map((value: any) => {
      if (value.id === formData?.auditType) {
        setAuditTypeName(value.auditType);
        setMultipleEntityAudit(value?.multipleEntityAudit || false);
      }
    });
  }, [formData?.auditType]);

  useEffect(() => {
    const findData = entitySuggestion.find(
      (ele: any) => ele?.id === formData?.auditedEntity
    );

    setSelectedSingle(findData);
  }, [formData?.auditedEntity, entitySuggestion]);

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

    if (e.target.name === "auditedEntity") {
      // entitySuggestion.map((item: any, i: number) => (
      //   <MenuItem key={item} value={item.id}>
      //     {item.entityName}
      //   </MenuItem>
      // ))
      entitySuggestion.map((value: any) => {
        if (value.id === e.target.value) {
          setEntityName(value.entityName);
        }
      });
    }
    // if (e.target.name === "auditType") {
    //   auditTypes.map((value: any) => {
    //     if (value.id === e.target.value) {
    //       setAuditTypeName(value.auditType);
    //       setMultipleEntityAudit(value?.multipleEntityAudit||false)
    //     }
    //   });
    // }
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  // console.log("formdatainaudit", formData);
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

  /**
   * @method getEntity
   * @description Function to fetch the entity related to that particular user
   * @returns nothing
   */
  const getEntity = () => {
    getEntityByLocationId(formData?.location).then((response: any) => {
      const resolvedData = response?.data?.map((item: any) => ({
        id: item?.id,
        name: item?.entityName,
        entityTypeId: item?.entityTypeId,
        entityTypeName: item?.entityType?.name,
      }));
      const entityTypeData: any = Array.from(
        new Map(
          response?.data.map((ele: any) => [
            ele?.entityType?.id,
            {
              id: ele?.entityType?.id,
              name: ele?.entityType?.name,
            },
          ])
        ).values()
      );
      setEntitySuggestion(resolvedData);
      setEntityTypeOption(entityTypeData || []);
      // setEntitySuggestion(response?.data);
    });
  };

  /**
   * @method findEntityHead - Function to find the entity head
   * @param payload {any}
   * @returns object with entity head
   */
  const findEntityHead = (payload: any[]) => {
    const entityHead = payload?.filter((item: any) => {
      return item.assignedRole?.some((elem: any) => {
        return elem?.role?.roleName == "ENTITY-HEAD";
      });
    });
    return entityHead[0];
  };

  /**
   * @method getAuditees
   * @description Function to get all auditees
   * @returns nothing
   */
  const getAuditees = (id: string) => {
    // console.log(
    //   "check getAuditees called--->", id
    // );

    getAllAuditees(id).then((response: any) => {
      // console.log("check getAudittess--->", response?.data);

      setEntHead(findEntityHead(response?.data));
      setAuditeeSuggestion(response?.data);
    });
  };

  async function fetchAuditees(id: string) {
    const response: any = await getAllAuditees(id);
    const auditees = response?.data;
    setAuditeeSuggestion(auditees);
  }

  const getSystem = async () => {
    // console.log("insidegetsystem", formData.location);
    const encodedSystems = encodeURIComponent(
      JSON.stringify(formData.location)
    );
    // console.log("encode");
    getAll(encodedSystems)
      .then((res: any) =>
        setSystems(
          res?.data?.map((obj: any) => ({ id: obj.id, name: obj.name }))
        )
      )
      .catch((err) => console.error(err));
  };
  // console.log("systems", systems);
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
  const getAuditors = () => {
    getAllAuditorsNew(formData).then((response: any) => {
      setSuggestion(response?.data);
      setLoading(false);
    });
  };

  const formatDateForDatetimeLocal = (isoDateStr: any) => {
    if (!isoDateStr) return ""; // handle null or undefined

    const date = new Date(isoDateStr);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60000);
    return localDate.toISOString().slice(0, 16); // returns 'YYYY-MM-DDTHH:MM'
  };

  /**
   * @method setClausesAndDocuments
   * @description Function to parse all clauses and put them inside the recoil state
   * @param formData {any}
   * @returns nothing
   */
  // const setClausesAndDocuments = (formData: any) => {
  //   let parsedClause = formData.auditedClauses.map((clause: any) => {
  //     return {
  //       item: clause,
  //     };
  //   });
  //   let parsedDocuments = formData.auditedDocuments.map((doc: any) => {
  //     return {
  //       item: doc,
  //     };
  //   });

  //   setFormData((prev: any) => {
  //     return {
  //       ...prev,

  //       auditedClauses: parsedClause,
  //       auditedDocuments: parsedDocuments,
  //     };
  //   });
  // };

  /**
   * @method fetchAllClauses
   * @description Function to fetch all clauses belonging to a particular location
   * @returns nothing
   */
  const fetchAllClauses = () => {
    const data = formData.system;

    getAllClauses(`${data}`).then((response: any) => {
      // Check if response.data is an array before mapping
      if (Array.isArray(response?.data)) {
        const mappedData: any = response.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          number: item.number,
        }));

        const allData: any = { id: "All", name: "All", number: "All" };
        const finalData = [allData, ...mappedData];
        setClauses(finalData);
      } else {
        // Handle the case where response.data is not an array
        // console.error("Unexpected response format:", response);
      }
    });
  };

  /**
   * @method fetchClausesForEdit
   * @description Function to fetch all clauses with particular id
   * @param id {string}
   * @returns nothing
   */
  const fetchClausesForEdit = (id: string) => {
    getAllClauses(id).then((response: any) => {
      setClauses(response?.data?.clauses);
    });
  };

  /**
   * @method fetchAllDocuments
   * @description Function to fetch all documents
   * @returns nothing
   */

  const fetchAllDocuments = () => {
    getAllDocumentsByEntity(formData.auditedEntity).then((response: any) => {
      setDocuments(response?.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (formData.auditedEntity) {
      fetchAuditees(formData.auditedEntity);
      fetchAllDocuments();
    }
  }, [formData.auditedEntity]);

  useEffect(() => {
    if (formData.system) {
      fetchAllClauses();
    }
  }, [formData.system]);

  useEffect(() => {
    setLoading(true);
    // getEntity();
    fetchAllClauses();
    if (id) {
      getAuditById(id)
        .then((res: any) => {
          const date = moment(res?.respond?.date ?? new Date());
          const dateComponent = date.format("YYYY-MM-DD");
          const timeComponent = date.format("HH:mm");
          // setClausesAndDocuments(res?.respond);
          formData.auditedEntity && getAuditees(formData.auditedEntity);
          const payload = {
            isDraft: res?.respond?.isDraft,
            auditType: res?.respond?.auditType,
            system: res?.respond?.system,
            auditors: res?.respond?.auditors,
            location: res?.respond?.location?.id,
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
          const entityId = res?.respond?.auditedEntity?.id;
          fetchAuditees(entityId);
          setChecklist(res?.respond?.sections);
          return payload;
        })
        .then((response: any) => {
          const parsedClause = response?.auditedClauses?.map((clause: any) => {
            return {
              item: clause,
            };
          });
          const parsedDocuments = response?.auditedDocuments?.map(
            (doc: any) => {
              return {
                item: doc,
              };
            }
          );
          setFormData((prev: any) => {
            return {
              ...prev,
              ...response,
              auditedClauses: parsedClause,
              auditedDocuments: parsedDocuments,
            };
          });

          setLoading(false);
        });
    }
  }, []);

  /**
   * @method getHeaderData
   * @description Function to get header data
   * @returns nothing
   */
  const getHeaderData = () => {
    getYearFormat(new Date().getFullYear()).then((response: any) => {
      setAuditYear(response);
    });
    getAllAuditorsNew(formData).then((response: any) => {
      getLocationById(formData?.location).then((locresponse: any) => {
        // setCurrentLoc(locresponse?.data?.locationName);

        if (!isOrgAdmin && !isEdit) {
          setFormData((prev: any) => ({
            ...prev,
            location: locresponse?.data?.id,
          }));
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
    var timeComponent = date.format("HH:mm");
    setcurrentDate(`${dateComponent}T${timeComponent}`);

    const subDate = moment().subtract(1, "days");
    const subDateComponent = subDate.format("YYYY-MM-DD");
    var timeComponent = date.format("HH:mm");
    setLastDate(`${subDateComponent}T${timeComponent}`);
    // setFormData({
    //   ...formData,
    //   date: `${dateComponent}T${timeComponent}`,
    // });

    getHeaderData();
  }, []);

  useEffect(() => {
    getSystem();
  }, [formData.location]);

  const [openTourForReportFormAF1, setOpenTourForReportFormAF1] =
    useState<boolean>(false);

  const refForReportForm1 = useRef(null);
  const refForReportForm2 = useRef(null);
  const refForReportForm3 = useRef(null);
  const refForReportForm4 = useRef(null);
  const refForReportForm5 = useRef(null);
  const refForReportForm6 = useRef(null);
  const refForReportForm7 = useRef(null);
  const refForReportForm8 = useRef(null);
  const refForReportForm9 = useRef(null);
  const refForReportForm10 = useRef(null);
  const refForReportForm11 = useRef(null);
  // const refForReportForm12 = useRef(null);

  function validateInput(value: any, fieldType: any) {
    // Define regex patterns
    const specialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/u;
    const disallowedChars = /[<>]/u;

    // Rule: No starting with special character (non-letter and non-number)
    const startsWithSpecialChar = /^[^\p{L}\p{N}]/u.test(value);

    // Rule: No two consecutive special characters
    const consecutiveSpecialChars =
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{2,}/u.test(value);

    // Rule: Disallow < and >
    const containsDisallowedChars = disallowedChars.test(value);

    // Check rules based on field type
    if (fieldType === "text" || fieldType === "dropdown") {
      if (startsWithSpecialChar) {
        return "The input should not start with a special character or space.";
      }

      if (consecutiveSpecialChars) {
        return "No two consecutive special characters are allowed.";
      }

      if (containsDisallowedChars) {
        return "The characters < and > are not allowed.";
      }

      return true; // Passes validation for text or dropdown fields
    } else if (fieldType === "number") {
      // Rule: Only numbers are allowed
      if (!/^\d+$/u.test(value)) {
        return "Only numeric values are allowed.";
      }

      return true; // Passes validation for number fields
    }

    return "Invalid field type."; // In case an unsupported field type is passed
  }

  const stepsForReportFormAF1: TourProps["steps"] = [
    {
      title: "Audit Type",
      description: "All the created MRM plan for your unit can be viewed here",

      target: () =>
        refForReportForm1.current ? refForReportForm1.current : null,
    },

    {
      title: "Audit Name",
      description:
        "By default, your unit’s MRM Plan displayed for general user and MCOE can select any unit to view MRM plan",
      target: () => refForReportForm2.current,
    },
    {
      title: "Location",
      description:
        "Select the systems to view the list of MRM plans associated with the selected system",
      target: () => refForReportForm3.current,
    },
    {
      title: "System Name",
      description:
        "By default , this view will show the MRM plans created in the current year . Click on this link < to see prior year plans. Use > to move back to the current year",

      target: () =>
        refForReportForm4.current ? refForReportForm4.current : null,
    },
    {
      title: "Grid",
      description:
        "Select Months for which audit is to be planned by using the checkbox.",
      target: () => refForReportForm5.current,
    },
    {
      title: "icon",
      description:
        "- Remove entries from the plan . Re-add them when required by selecting from the dropdown and selecting + ",
      target: () =>
        refForReportForm6.current ? refForReportForm6.current : null,
    },
    {
      title: "Kebab Menu",
      description:
        "Use the (Kebab Menu Image) to select /repeat selection for all months.Duplicate the current row selection to all other rows . Clear Rows to clear selections and reselect choices. Where Audit Types require coordination of dates prior to a planned month,  Finalize Auditor Option is displayed  in the menu. Use the option to select auditors, inform unit coordinators and have the stakeholders accept the dates for audit",

      target: () =>
        refForReportForm7.current ? refForReportForm7.current : null,
    },
    {
      title: "Duplicate",
      description:
        "Select a prior audit plan to duplicate . This would eliminate the need to enter information from scratch . All of the selected entities and months from the selected audit plan are copied below in the grid ",
      target: () => refForReportForm8.current,
    },
    {
      title: "Draft",
      description: " Click on Draft to save unfinished entries ",
      target: () => refForReportForm9.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForReportForm10.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForReportForm11.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForReportForm12.current,
    },
  ];
  const selectedDepartmentObj =
    entitySuggestion.find((d: any) => d.id === formData.auditedEntity) || null;

  const entityTypes = [
    { id: "1", name: "Engineering" },
    { id: "2", name: "Marketing" },
    { id: "3", name: "Sales" },
    { id: "4", name: "HR" },
  ];

  const departments = [
    {
      id: "1",
      name: "Frontend Development",
      entityTypeId: "1",
      entityTypeName: "Engineering",
    },
    {
      id: "2",
      name: "Backend Development",
      entityTypeId: "1",
      entityTypeName: "Engineering",
    },
    {
      id: "3",
      name: "DevOps",
      entityTypeId: "1",
      entityTypeName: "Engineering",
    },
    {
      id: "4",
      name: "Digital Marketing",
      entityTypeId: "2",
      entityTypeName: "Marketing",
    },
    {
      id: "5",
      name: "Content Marketing",
      entityTypeId: "2",
      entityTypeName: "Marketing",
    },
    {
      id: "6",
      name: "Inside Sales",
      entityTypeId: "3",
      entityTypeName: "Sales",
    },
    {
      id: "7",
      name: "Field Sales",
      entityTypeId: "3",
      entityTypeName: "Sales",
    },
    { id: "8", name: "Recruitment", entityTypeId: "4", entityTypeName: "HR" },
    {
      id: "9",
      name: "Employee Relations",
      entityTypeId: "4",
      entityTypeName: "HR",
    },
  ];

  const handleSingleSelect = (id: any, full: any) => {
    if (id === "All") {
      setSelectedSingle(null);
    } else {
      setSelectedSingle(full);
      setFormData({ ...formData, auditedEntity: id });
    }
  };

  const handleSingleClear = () => {
    setSelectedSingle(null);
    setFormData({ ...formData, auditedEntity: null });
  };

  return (
    <>
      {/* <div
              // style={{ position: "fixed", top: "77px", right: "120px" }}
              style={{width:"97%",display:"flex",justifyContent:"end", }}
              >
                <MdTouchApp
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setOpenTourForReportFormAF1(true);
                  }}
                />
              </div> */}
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
        <>
          {matches ? (
            <form
              data-testid="org-admin-form"
              autoComplete="off"
              className={classes.form}
            >
              <Grid
                container
                // className={classes.first_container}
                style={{
                  display: "flex",
                  flexDirection: matches ? "row" : "column",
                }}
              >
                {/* Left hand container */}
                <Grid
                  item
                  container
                  sm={4}
                  md={4}
                  className={classes.mobile__order}
                >
                  <Grid
                    item
                    sm={12}
                    md={10}
                    className={classes.formTextPadding}
                    style={{ marginTop: matches ? "0px" : "15px" }}
                  >
                    <strong className={classes.labelStart}>* </strong>
                    <strong className={classes.label}>Unit</strong>
                  </Grid>
                  <Grid item sm={12} md={10} className={classes.formBox}>
                    <FormControl
                      className={classes.formControl}
                      variant="outlined"
                      size="small"
                      // error={error}
                    >
                      <Select
                        fullWidth
                        disabled={disabled}
                        name="location"
                        value={formData.location}
                        variant="outlined"
                        onChange={handleChange}
                        inputProps={{
                          "data-testid": "user-name",
                        }}
                        required
                        ref={refForReportForm1}
                        style={{ color: "black", backgroundColor: "white" }}
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

                  <Grid
                    item
                    sm={12}
                    md={10}
                    className={classes.formTextPadding}
                    // style={{ paddingTop: "0px", paddingBottom: "0px" }}
                  >
                    <span>
                      <strong className={classes.labelStart}>* </strong>
                      <strong
                        className={classes.label}
                        // style={{ paddingBottom: "0px" }}
                      >
                        System Name
                      </strong>
                    </span>
                  </Grid>
                  <Grid
                    item
                    sm={12}
                    md={10}
                    className={classes.formBox}
                    // style={{ paddingBottom: "20px" }}
                  >
                    <FormControl
                      className={classes.formControl}
                      variant="outlined"
                      size="small"
                    >
                      <Select
                        disabled={disabled}
                        value={formData?.system || []}
                        onChange={handleChange}
                        name="system"
                        data-testid="systemName"
                        multiple
                        required
                        ref={refForReportForm2}
                        style={{
                          color: "black",
                          backgroundColor: "white",
                        }}
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

                  <Grid
                    item
                    sm={12}
                    md={10}
                    className={classes.formTextPadding}
                  >
                    <strong className={classes.labelStart}>* </strong>
                    <strong className={classes.label}>Audit Report Name</strong>
                  </Grid>

                  <Grid item sm={12} md={10} className={classes.formBox}>
                    <TextField
                      fullWidth
                      disabled={disabledFromProp}
                      name="auditName"
                      value={formData?.auditName}
                      variant="outlined"
                      onChange={handleChange}
                      size="small"
                      // style={{
                      //   color: disabledFromProp ? "black" : undefined,
                      //   backgroundColor: "white",
                      // }}
                      className={classes.textfield}
                      inputProps={{
                        "data-testid": "user-name",
                      }}
                      required
                      ref={refForReportForm5}
                    />
                  </Grid>
                  {/* <Grid
                item
                sm={12}
                md={10}
                className={classes.formTextPadding}
                // style={{ paddingTop: "0px", paddingBottom: "0px" }}
              >
                <strong className={classes.labelStart}>* </strong>
                <strong
                  className={classes.label}
                  //  style={{ marginTop: "-7px" }}
                >
                  Audited Requirements
                </strong>
              </Grid>
              <Grid
                item
                sm={12}
                md={10}
                className={classes.formBox}
                // style={{ paddingBottom: "10px" }}
              >
                <div ref={refForReportForm11}>
                  <DynamicFormSearchField
                    data={formData}
                    disabled={disabledFromProp}
                    setData={setFormData}
                    name="auditedClauses"
                    keyName="item"
                    suggestions={clauses || []}
                    suggestionLabel="name"
                    hideTooltip={false}
                  />
                </div>
              </Grid> */}
                </Grid>
                {/* Gap container */}
                {/* <Grid item sm={6} md={1}></Grid> */}
                {/* Middle hand container  */}
                <Grid item container sm={4} md={4}>
                  <Grid
                    item
                    sm={12}
                    md={10}
                    className={classes.formTextPadding}
                  >
                    <strong className={classes.labelStart}>* </strong>
                    <strong className={classes.label}>Audit Type</strong>
                  </Grid>
                  <Grid item sm={12} md={10} className={classes.formBox}>
                    <FormControl
                      className={classes.formControl}
                      variant="outlined"
                      size="small"
                    >
                      <Select
                        value={formData?.auditType}
                        onChange={handleChange}
                        disabled={disabled}
                        name="auditType"
                        data-testid="audit-type"
                        required
                        ref={refForReportForm3}
                        style={{ color: "black", backgroundColor: "white" }}
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
                  <Grid
                    item
                    sm={12}
                    md={10}
                    className={classes.formTextPadding}
                  >
                    <strong className={classes.labelStart}>* </strong>
                    <strong className={classes.label}>Auditor(s)</strong>
                  </Grid>
                  <Grid
                    item
                    sm={12}
                    md={10}
                    className={classes.formBox}
                    // style={{
                    //   paddingTop: "0px",
                    //   marginTop: "-30px",
                    //   paddingBottom: "0px",
                    // }}
                  >
                    <div ref={refForReportForm9}>
                      <AutoCompleteNew
                        suggestionList={suggestion ? suggestion : []}
                        name="Auditor"
                        keyName="auditors"
                        showAvatar={true}
                        disabled={disabledFromProp}
                        labelKey="firstname"
                        secondaryLabel="lastname"
                        formData={formData}
                        setFormData={setFormData}
                        getSuggestionList={() => getSuggestionList}
                        defaultValue={formData.auditors}
                      />
                    </div>

                    {/* <TextField
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
                /> */}
                  </Grid>
                  <Grid
                    item
                    sm={12}
                    md={10}
                    className={classes.formTextPadding}
                  >
                    {/* <strong>Audit Number*</strong> */}
                    <strong className={classes.labelStart}>* </strong>
                    <strong className={classes.label}>Audit Date & Time</strong>
                  </Grid>
                  <Grid item sm={12} md={10} className={classes.formBox}>
                    {/* <TextField
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
                /> */}
                    <TextField
                      fullWidth
                      disabled={disabledFromProp}
                      type="datetime-local"
                      name="date"
                      value={formData.date === "" ? currentDate : formData.date}
                      variant="outlined"
                      onChange={handleChange}
                      size="small"
                      inputProps={{
                        // min: lastDate,
                        max: currentDate,
                      }}
                      required
                      ref={refForReportForm7}
                      className={classes.textfield}
                    />
                  </Grid>

                  {/* <Grid
                item
                sm={12}
                md={10}
                className={classes.formTextPadding}
                // style={{ paddingTop: "0px", paddingBottom: "5px" }}
              >
                <strong
                  className={classes.label}
                  // style={{ paddingTop: "0px", marginTop: "0px" }}
                >
                  Audited Documents
                </strong>
              </Grid>
              <Grid item sm={12} md={10} className={classes.formBox}>
                <div
                  ref={refForReportForm10}
                  //  style={{ marginTop: "0px" }}
                >
                  <DynamicFormSearchField
                    data={formData}
                    disabled={disabledFromProp}
                    setData={setFormData}
                    name="auditedDocuments"
                    keyName="item"
                    suggestions={documents}
                    suggestionLabel="documentName"
                  />
                </div>
              </Grid> */}
                </Grid>

                {/* Right hand container  */}

                <Grid item container sm={4} md={4} style={{ height: "300px" }}>
                  <Grid
                    item
                    sm={12}
                    md={10}
                    className={classes.formTextPadding}
                  >
                    <strong className={classes.labelStart}>* </strong>
                    <strong className={classes.label}>
                      Audited Dept/Vertical
                    </strong>
                  </Grid>
                  <Grid item sm={12} md={10} className={classes.formBox}>
                    {/* <Select
                      style={{
                        height: "40px",
                        color: "black",
                        backgroundColor: "white",
                      }}
                      disabled={disabled || multipleEntityAudit}
                      required
                      fullWidth
                      variant="outlined"
                      name="auditedEntity"
                      value={formData.auditedEntity}
                      onChange={handleChange}
                      ref={refForReportForm4}
                    >
                      {entitySuggestion.map((item: any, i: number) => (
                        <MenuItem key={item} value={item.id}>
                          {item.entityName}
                        </MenuItem>
                      ))}
                    </Select> */}

                    {/* <DepartmentSelector
                      locationId={formData.location}
                      selectedDepartment={selectedSingle}
                      onSelect={(dept, type: any) => {
                        handleSingleSelect(dept, type);
                      }}
                      onClear={() =>
                        setFormData((prev: any) => ({
                          ...prev,
                          auditedEntity: null,
                        }))
                      }
                    /> */}
                    <GroupedSelect
                      entityTypes={entityTypeOption}
                      departmentsByType={entitySuggestion}
                      selectedDepartment={selectedSingle}
                      disabled={disabled || multipleEntityAudit}
                      onSelect={handleSingleSelect}
                      onClear={handleSingleClear}
                      allowSelectAll={false}
                      multiSelect={false}
                      title="Select a Department"
                    />
                  </Grid>
                  <Grid
                    item
                    sm={12}
                    md={10}
                    className={classes.formTextPadding}
                    // style={{ paddingTop: "0px", paddingBottom: "0px" }}
                  >
                    <strong className={classes.labelStart}>* </strong>
                    <strong className={classes.label}>Auditees</strong>
                  </Grid>
                  <Grid item sm={12} md={10} className={classes.formBox}>
                    <div ref={refForReportForm8}>
                      <AutoCompleteNew
                        suggestionList={
                          auditeeSuggestion ? auditeeSuggestion : []
                        }
                        showAvatar={true}
                        name="Auditees"
                        keyName="auditees"
                        labelKey="firstname"
                        secondaryLabel="lastname"
                        disabled={disabledFromProp || multipleEntityAudit}
                        formData={formData}
                        setFormData={setFormData}
                        getSuggestionList={() => console.log("get auditees")}
                        defaultValue={[]}
                      />
                    </div>
                  </Grid>
                  <Grid
                    item
                    sm={12}
                    md={10}
                    className={classes.formTextPadding}
                  >
                    {/* <strong>Audit Number*</strong> */}

                    <strong className={classes.label}>
                      Schedule Date & Time{" "}
                    </strong>
                  </Grid>
                  <Grid item sm={12} md={10} className={classes.formBox}>
                    {/* <TextField
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
                /> */}
                    <TextField
                      fullWidth
                      disabled={true}
                      type="datetime-local"
                      name="date"
                      value={formatDateForDatetimeLocal(formData.scheduleDate)}
                      variant="outlined"
                      onChange={handleChange}
                      size="small"
                      inputProps={{
                        min: currentDate,
                      }}
                      required
                      ref={refForReportForm6}
                      className={classes.textfield}
                    />
                  </Grid>

                  {/* <Grid item sm={12} md={8} className={classes.formTextPadding}>
                <strong></strong>
              </Grid>
              <Grid item sm={12} md={10} className={classes.formBox}></Grid> */}
                </Grid>
              </Grid>
            </form>
          ) : (
            <form
              data-testid="org-admin-form"
              autoComplete="off"
              className={classes.form}
            >
              <div
                // container
                // className={classes.first_container}
                style={
                  {
                    // display: "flex",
                    // flexDirection: matches ? "row" : "column",
                  }
                }
                // direction={matches ? "row" : "column"}
              >
                {/* Gap container */}
                {/* <Grid item sm={6} md={1}></Grid> */}

                {/* Left hand container */}
                <Grid
                  item
                  container
                  sm={4}
                  md={4}
                  className={classes.mobile__order}
                >
                  <Grid
                    item
                    sm={12}
                    md={10}
                    className={classes.formTextPadding}
                    style={{ marginTop: matches ? "0px" : "15px" }}
                  >
                    <strong className={classes.labelStart}>* </strong>
                    <strong className={classes.label}>Unit</strong>
                  </Grid>
                  <Grid item sm={12} md={10} className={classes.formBox}>
                    <FormControl
                      className={classes.formControl}
                      variant="outlined"
                      size="small"
                      // error={error}
                    >
                      <Select
                        fullWidth
                        disabled={disabled}
                        name="location"
                        value={formData.location}
                        variant="outlined"
                        onChange={handleChange}
                        inputProps={{
                          "data-testid": "user-name",
                        }}
                        required
                        ref={refForReportForm1}
                        style={{ color: "black", backgroundColor: "white" }}
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
                  <Grid
                    item
                    sm={12}
                    md={10}
                    className={classes.formTextPadding}
                  >
                    <strong className={classes.labelStart}>* </strong>
                    <strong className={classes.label}>Audit Type</strong>
                  </Grid>
                  <Grid item sm={12} md={10} className={classes.formBox}>
                    <FormControl
                      className={classes.formControl}
                      variant="outlined"
                      size="small"
                    >
                      <Select
                        value={formData?.auditType}
                        onChange={handleChange}
                        disabled={disabled}
                        name="auditType"
                        data-testid="audit-type"
                        required
                        ref={refForReportForm3}
                        style={{ color: "black", backgroundColor: "white" }}
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
                  <Grid
                    item
                    sm={12}
                    md={10}
                    className={classes.formTextPadding}
                  >
                    <strong className={classes.labelStart}>* </strong>
                    <strong className={classes.label}>
                      Audited Dept/Vertical
                    </strong>
                  </Grid>
                  <Grid item sm={12} md={10} className={classes.formBox}>
                    <Select
                      style={{
                        height: "40px",
                        color: "black",
                        backgroundColor: "white",
                      }}
                      disabled={disabled || multipleEntityAudit}
                      required
                      fullWidth
                      variant="outlined"
                      name="auditedEntity"
                      value={formData.auditedEntity}
                      onChange={handleChange}
                      ref={refForReportForm4}
                    >
                      {entitySuggestion.map((item: any, i: number) => (
                        <MenuItem key={item} value={item.id}>
                          {item.entityName}
                        </MenuItem>
                      ))}
                    </Select>
                  </Grid>
                  <Grid
                    item
                    sm={12}
                    md={10}
                    className={classes.formTextPadding}
                    // style={{ paddingTop: "0px", paddingBottom: "0px" }}
                  >
                    <span>
                      <strong className={classes.labelStart}>* </strong>
                      <strong
                        className={classes.label}
                        // style={{ paddingBottom: "0px" }}
                      >
                        System Name
                      </strong>
                    </span>
                  </Grid>
                  <Grid
                    item
                    sm={12}
                    md={10}
                    className={classes.formBox}
                    // style={{ paddingBottom: "20px" }}
                  >
                    <FormControl
                      className={classes.formControl}
                      variant="outlined"
                      size="small"
                    >
                      <Select
                        disabled={disabled}
                        value={formData?.system || []}
                        onChange={handleChange}
                        name="system"
                        data-testid="systemName"
                        multiple
                        required
                        ref={refForReportForm2}
                        style={{
                          color: "black",
                          backgroundColor: "white",
                        }}
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
                  <Grid
                    item
                    sm={12}
                    md={10}
                    className={classes.formTextPadding}
                  >
                    <strong className={classes.labelStart}>* </strong>
                    <strong className={classes.label}>Auditor(s)</strong>
                  </Grid>
                  <Grid
                    item
                    sm={12}
                    md={10}
                    className={classes.formBox}
                    // style={{
                    //   paddingTop: "0px",
                    //   marginTop: "-30px",
                    //   paddingBottom: "0px",
                    // }}
                  >
                    <div ref={refForReportForm9}>
                      <AutoCompleteNew
                        suggestionList={suggestion ? suggestion : []}
                        name="Auditor"
                        keyName="auditors"
                        showAvatar={true}
                        disabled={disabledFromProp}
                        labelKey="firstname"
                        secondaryLabel="lastname"
                        formData={formData}
                        setFormData={setFormData}
                        getSuggestionList={() => getSuggestionList}
                        defaultValue={formData.auditors}
                      />
                    </div>

                    {/* <TextField
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
                      /> */}
                  </Grid>
                  <Grid
                    item
                    sm={12}
                    md={10}
                    className={classes.formTextPadding}
                    // style={{ paddingTop: "0px", paddingBottom: "0px" }}
                  >
                    <strong className={classes.labelStart}>* </strong>
                    <strong className={classes.label}>Auditees</strong>
                  </Grid>
                  <Grid item sm={12} md={10} className={classes.formBox}>
                    <div ref={refForReportForm8}>
                      <AutoCompleteNew
                        suggestionList={
                          auditeeSuggestion ? auditeeSuggestion : []
                        }
                        showAvatar={true}
                        name="Auditees"
                        keyName="auditees"
                        labelKey="firstname"
                        secondaryLabel="lastname"
                        disabled={disabledFromProp || multipleEntityAudit}
                        formData={formData}
                        setFormData={setFormData}
                        getSuggestionList={() => console.log("get auditees")}
                        defaultValue={[]}
                      />
                    </div>
                  </Grid>
                  <Grid
                    item
                    sm={12}
                    md={10}
                    className={classes.formTextPadding}
                  >
                    <strong className={classes.labelStart}>* </strong>
                    <strong className={classes.label}>Audit Report Name</strong>
                  </Grid>
                  <Grid item sm={12} md={10} className={classes.formBox}>
                    <TextField
                      fullWidth
                      disabled={disabledFromProp}
                      name="auditName"
                      value={formData?.auditName}
                      variant="outlined"
                      onChange={handleChange}
                      size="small"
                      // style={{
                      //   color: disabledFromProp ? "black" : undefined,
                      //   backgroundColor: "white",
                      // }}
                      className={classes.textfield}
                      inputProps={{
                        "data-testid": "user-name",
                      }}
                      required
                      ref={refForReportForm5}
                    />
                  </Grid>
                  <Grid
                    item
                    sm={12}
                    md={10}
                    className={classes.formTextPadding}
                  >
                    {/* <strong>Audit Number*</strong> */}
                    <strong className={classes.labelStart}>* </strong>
                    <strong className={classes.label}>Audit Date & Time</strong>
                  </Grid>
                  <Grid item sm={12} md={10} className={classes.formBox}>
                    {/* <TextField
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
                      /> */}
                    <TextField
                      fullWidth
                      disabled={disabledFromProp}
                      type="datetime-local"
                      name="date"
                      value={formData.date === "" ? currentDate : formData.date}
                      variant="outlined"
                      onChange={handleChange}
                      size="small"
                      inputProps={{
                        // min: lastDate,
                        max: currentDate,
                      }}
                      required
                      ref={refForReportForm7}
                      className={classes.textfield}
                    />
                  </Grid>
                  <Grid
                    item
                    sm={12}
                    md={10}
                    className={classes.formTextPadding}
                  >
                    {/* <strong>Audit Number*</strong> */}

                    <strong className={classes.label}>
                      Schedule Date & Time{" "}
                    </strong>
                  </Grid>
                  <Grid item sm={12} md={10} className={classes.formBox}>
                    {/* <TextField
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
                      /> */}
                    <TextField
                      fullWidth
                      disabled={true}
                      type="datetime-local"
                      name="date"
                      value={formatDateForDatetimeLocal(formData.scheduleDate)}
                      variant="outlined"
                      onChange={handleChange}
                      size="small"
                      inputProps={{
                        min: currentDate,
                      }}
                      required
                      ref={refForReportForm6}
                      className={classes.textfield}
                    />
                  </Grid>

                  {/* <Grid
                      item
                      sm={12}
                      md={10}
                      className={classes.formTextPadding}
                      // style={{ paddingTop: "0px", paddingBottom: "0px" }}
                    >
                      <strong className={classes.labelStart}>* </strong>
                      <strong
                        className={classes.label}
                        //  style={{ marginTop: "-7px" }}
                      >
                        Audited Requirements
                      </strong>
                    </Grid>
                    <Grid
                      item
                      sm={12}
                      md={10}
                      className={classes.formBox}
                      // style={{ paddingBottom: "10px" }}
                    >
                      <div ref={refForReportForm11}>
                        <DynamicFormSearchField
                          data={formData}
                          disabled={disabledFromProp}
                          setData={setFormData}
                          name="auditedClauses"
                          keyName="item"
                          suggestions={clauses || []}
                          suggestionLabel="name"
                          hideTooltip={false}
                        />
                      </div>
                    </Grid> */}
                </Grid>

                {/* Right hand container  */}
                {/* <Grid item container sm={4} md={4} style={{ height: "300px" }}>      
                     <Grid item sm={12} md={8} className={classes.formTextPadding}>
                      <strong></strong>
                    </Grid>
                    <Grid item sm={12} md={10} className={classes.formBox}></Grid>
                  </Grid> */}
                {/* Middle hand container  */}
                {/* <Grid item container sm={4} md={4} style={{paddingTop:"25px"}}>
                   <Grid
                      item
                      sm={12}
                      md={10}
                      className={classes.formTextPadding}
                      // style={{ paddingTop: "0px", paddingBottom: "5px" }}
                    >
                      <strong
                        className={classes.label}
                        // style={{ paddingTop: "0px", marginTop: "0px" }}
                      >
                        Audited Documents
                      </strong>
                    </Grid>
                    <Grid item sm={12} md={10} className={classes.formBox}>
                      <div
                        ref={refForReportForm10}
                        //  style={{ marginTop: "0px" }}
                      >
                        <DynamicFormSearchField
                          data={formData}
                          disabled={disabledFromProp}
                          setData={setFormData}
                          name="auditedDocuments"
                          keyName="item"
                          suggestions={documents}
                          suggestionLabel="documentName"
                        />
                      </div>
                    </Grid> 
                  </Grid> */}
              </div>
            </form>
          )}
        </>
      )}

      <Tour
        open={openTourForReportFormAF1}
        onClose={() => setOpenTourForReportFormAF1(false)}
        steps={stepsForReportFormAF1}
      />
    </>
  );
}

export default AuditInfoStepperForm;
