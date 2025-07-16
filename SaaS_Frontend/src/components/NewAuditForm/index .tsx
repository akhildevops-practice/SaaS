import BackButton from "../BackButton";
import FormStepper from "../FormStepper";
import Checklist from "../ChecklistForm";
import AuditScopeComponent from "components/AuditScope";
import AuditClosure from "../AuditClosureForm";
import { useEffect, useRef, useState } from "react";
import {
  auditCreationForm,
  auditFormData,
  currentAuditYear,
  orgFormData,
} from "../../recoil/atom";
import { useRecoilState, useRecoilValue } from "recoil";
import { useLocation, useNavigation } from "react-router";
import { getAll, getSystems, getSystemTypes } from "../../apis/systemApi";
import getAppUrl from "../../utils/getAppUrl";
import { getOrganizationData } from "../../apis/orgApi";
import {
  addAuditReportData,
  getAllAuditTypes,
  getAudit,
} from "../../apis/auditApi";
import checkRoles from "../../utils/checkRoles";
import getUserId from "../../utils/getUserId";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  useMediaQuery,
} from "@material-ui/core";
import { mobileView } from "../../recoil/atom";
import { MdSave } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import * as yup from "yup";
import { editAudit } from "../../apis/auditApi";
import moment from "moment";
import { getAllLocations } from "apis/locationApi";
import axios from "apis/axios.global";
import formatDateTime from "utils/formatDateTime";
import getSessionStorage from "utils/getSessionStorage";
import AuditInfoStepperForm from "components/AuditInfoStepperForm";
import getYearFormat from "utils/getYearFormat";
import { API_LINK } from "config";
import { AxiosResponse } from "axios";
import { isValid } from "utils/validateInput";
import { IoIosArrowBack } from "react-icons/io";

type Props = {
  //  refForReportForm12?:any;
};

/**
 * @description Functional component which generates Audit Form with a form stepper
 * @returns react node
 */

const useStyles = makeStyles((theme) => ({
  buttonContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between", 
    width: "100%",
    padding:"6px"
  },
  exitButton: {
    color: theme.palette.primary.main,
    textTransform: "none",
  },
  saveButton: {
    backgroundColor: theme.palette.primary.main,
    color: "#fff",
    textTransform: "none",
    fontSize:"13px",
    padding:"3px 5px",
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  draftButton: {
    backgroundColor: "#e0e0e0",
    color: "#000",
    textTransform: "none",
    fontSize:"13px",
    padding:"3px 5px",
    "&:hover": {
      backgroundColor: "#d6d6d6",
    },
  },
}));

const NewAuditForm = ({}: //  refForReportForm12
Props) => {
  const classes = useStyles();
  const matches = useMediaQuery("(min-width:786px)");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useRecoilState<any>(auditFormData);
  const [checklist, setChecklist] = useRecoilState<any>(auditCreationForm);
  const [activeStep, setActiveStep] = useState(0);
  const currentUserId: any = getUserId();
  const view = useRecoilValue(mobileView);
  const [systemTypes, setSystemTypes] = useState<any>([]);
  const [audittypes, setAuditTypes] = useState<any>([]);
  const [locations, setLocation] = useState<any>([]);
  const [systems, setSystems] = useState<any>([]);
  const realmName = getAppUrl();
  const idParam = useParams();
  const [auditYear, setAuditYear] = useRecoilState<any>(currentAuditYear);
  const location: any = useLocation();
  const [open, setOpen] = useState(false);
  let isLocAdmin = checkRoles("LOCATION-ADMIN");
  let isOrgAdmin = checkRoles("ORG-ADMIN");
  let isAuditor = checkRoles("AUDITOR");
  let isMR = checkRoles("MR");
 

  useEffect(() => {
    getHeaderData();
  }, []);
  const getHeaderData = () => {
    getYearFormat(new Date().getFullYear()).then((response: any) => {
      setAuditYear(response);
    });
  };
  const [
    isAuditReportAttachmentsUploaded,
    setIsAuditReportAttachmentsUploaded,
  ] = useState<boolean>(false);

  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [isDataLoaded, setIsDataLoaded] = useState<any>(false);
  const [isReportDataLoaded, setIsReportDataLoaded] = useState<any>(false);
  const orgData = useRecoilValue(orgFormData);
  const organizationId =
    sessionStorage.getItem("orgId") !== null &&
    sessionStorage.getItem("orgId") !== "null"
      ? sessionStorage.getItem("orgId")
      : (orgData && orgData.organizationId) ||
        (orgData && orgData.id) ||
        undefined;
  const userInfo = getSessionStorage();

  /**
   * @description Validation schema for validating the audit form
   */
  let validationSchema = yup.object().shape({
    auditType: yup.string().required("Audit Info - Type required!"),
    system: yup.array().required("Audit Info - System required!"),
    auditors: yup.array().required("Should contain atleast one auditor"),
    // auditNumber: yup
    //   .string()
    //   .required("Audit Info - Audit number is required!"),
    auditYear: yup.string().required("Audit Info - Audit year is required!"),
    auditName: yup.string().required("Audit Info - Audit name is required!"),
    date: yup.string().required("Audit Info - Date is required!"),
    // auditedEntity: yup
    //   .string()
    //   .required("Audit Scope - Audited entity is required!"),
    // auditees: yup.array().required("Should contain atleast one auditee"),
    // auditedClauses: yup.array().of(
    //   yup.object().shape({
    //     item: yup.object().required("Should contain a clause!"),
    //   })
    // ),
    // auditedDocuments: yup.array().of(
    //   yup.object().shape({
    //     item: yup.object().required("Should contain a clause!").nullable(),
    //   })
    // ),
  });

  /**
   * @description Validation schema for validating the audit form (draft mode)
   */
  let draftValidationSchema = yup.object().shape({
    auditType: yup.string().required("Audit Info - Type required!"),
    system: yup.array().required("Audit Info - System required!"),
    auditors: yup.array().required("Should contain atleast one auditor"),
    // auditNumber: yup
    //   .string()
    //   .required("Audit Info - Audit number is required!"),
    auditYear: yup.string().required("Audit Info - Audit year is required!"),
    auditName: yup.string().required("Audit Info - Audit name is required!"),
    date: yup.string().required("Audit Info - Date is required!"),
  });

  /**
   * @description An array of stepper header tags
   */
  const steps = [
    "Audit Information",
    "Audit Scope",
    "Checklist",
    "Audit Summary",
  ];

  /**
   * @description An array containing the form components which will be used inside the stepper
   */

  const refForReportForm12 = useRef(null);
  const refForReportForm28 = useRef(null);

  const forms = [
    {
      form: (
        <AuditInfoStepperForm
          systemTypes={systemTypes}
          subSystemTypes={systems}
          auditTypes={audittypes}
          location={locations}
          disabledFromProp={location?.state?.read || !formData?.isDraft}
          isEdit={!!idParam.id ? true : false}
          refForReportForm12={refForReportForm12}
        />
      ),
    },
    {
      form: (
        <AuditScopeComponent
          formData={formData}
          setFormData={setFormData}
          disabledFromProp={location?.state?.read || !formData?.isDraft}
        />
      ),
    },
    {
      form: (
        <Checklist disabled={location?.state?.read || !formData?.isDraft} />
      ),
    },
    {
      form: (
        <AuditClosure
          disabled={location?.state?.read || !formData?.isDraft}
          auditTypes={audittypes}
          refForReportForm28={refForReportForm28}
        />
      ),
    },
  ];

  /**
   * @method parseSystemTypes
   * @description Function to print system types
   * @param data {any}
   * @returns an array of system types
   */
  const parseSystemTypes = (data: any) => {
    let systemTypes: any = [];
    data.map((item: any) => {
      systemTypes.push({
        name: item.name,
        id: item.id,
      });
    });
    return systemTypes;
  };

  const parseauditypes = (data: any) => {
    let auditTypes: any = [];
    data?.map((item: any) => {
      auditTypes.push({
        auditType: item.auditType,
        multipleEntityAudit: item?.multipleEntityAudit,
        scope: JSON.parse(item?.scope),
        id: item.id,
      });
    });

    return auditTypes;
  };
  const parselocation = (data: any) => {
    let locations: any = [];
    data?.map((item: any) => {
      locations.push({
        locationName: item.locationName,
        id: item.id,
      });
    });

    return locations;
  };
  /**
   * @method parseSystems
   * @description Function to print system types
   * @param data {any}
   * @returns an array of system types
   */
  const parseSystems = (data: any) => {
    let systemTypes: any = [];
    data.map((item: any) => {
      systemTypes.push({
        name: item.name,
        id: item._id,
      });
    });
    return systemTypes;
  };

  /**
   * @method handleDraftSubmit
   * @description Function to submit form data as draft
   * @returns nothing
   */
  const handleDraftSubmit = async () => {
    if (location?.state?.read || !formData.isDraft) {
      enqueueSnackbar("You cannot update/create audits in read mode!", {
        variant: "error",
      });
      return;
    }
    const checkOverlapById:any = (auditors: any[], auditees: any[]): boolean => {
      const auditorIds = auditors.map(a => a.id);
      const auditeeIds = auditees.map(a => a.id);
    
      return auditorIds.some(id => auditeeIds.includes(id));
    };

    const hasOverlap = checkOverlapById(formData.auditors, formData.auditees);

    if (hasOverlap) {
      // console.error("Auditee and Auditor cannot have overlapping users.");
      enqueueSnackbar(`Auditee and Auditor cannot have overlapping users.`, {
        variant: "error",
      });
      return;
    }
    const validateAuditname = await isValid(formData?.auditName)

    if (validateAuditname.isValid === false) {
      enqueueSnackbar(`Audit Report Name ${validateAuditname?.errorMessage}`, {
        variant: "error",
      });
      return;
    }
    let uploadAttachementResponse = [];
    if (formData?.urls?.length > 0) {
      uploadAttachementResponse = await uploadAuditReportAttachments(
        formData?.urls
      );
    }

    const newFormData = { ...formData, sections: checklist };

    const {
      createdAt,
      updatedAt,
      createdBy,
      publishedDate,
      title,
      files,
      ...rest
    } = newFormData;

    var date = moment();
    var dateComponent = date.format("YYYY-MM-DD");
    var timeComponent = date.format("HH:mm");
    if (rest.date === "")
      rest.date = rest.date = `${dateComponent}T${timeComponent}`;
    rest.isDraft = true;
    rest.urls = uploadAttachementResponse;
    rest.auditYear = auditYear;
    let res: any;
    if (idParam?.id === undefined || idParam?.id === "undefined") {
      const result = await axios.get(
        `/api/audits/ValidateAuditIsUnique?locationId=${formData.location}&auditName=${formData.auditName}`
      );
      if (result.data !== true) {
        enqueueSnackbar("Audit Name Already Exist", {
          variant: "error",
        });
        return;
      }
    }
    draftValidationSchema
      .validate(rest)
      .then(async () => {
        let res: any;

        if (idParam.id) {
          editAudit(idParam.id, rest).then((response: any) => {
            if (response?.data) {
              enqueueSnackbar("Audit Submitted Successfully", {
                variant: "success",
              });
              setFormData(rest);
              navigate("/audit", {
                state: {
                  redirectToTab: "AUDIT REPORT",
                },
              });
            }
          });
        } else {
          res = await addAuditReportData(rest);
          if (!res.success) {
            enqueueSnackbar(res?.message, {
              variant: "error",
            });
            return;
          }
          enqueueSnackbar("Audit Submitted Successfully", {
            variant: "success",
          });
          setFormData(rest);
          navigate("/audit", {
            state: {
              redirectToTab: "AUDIT REPORT",
            },
          });
        }
      })
      .catch((error: any) => {
        // console.log("error is test", error);
        enqueueSnackbar(error.message, { variant: "error" });
      });
  };

  /**
   * @method getOrganizationInformation
   * @description Function to fetch all the required data related to the organization
   * @param realm {string}
   * @returns nothing
   */
  const getOrganizationInformation = (realm: string) => {
    getOrganizationData(realm)
      .then((response: any) => {
        setFormData({
          ...formData,
          auditType: location?.state?.systemDetails?.id ?? "",
          system: location?.state?.systemDetails?.subId ?? "",
          auditYear: response?.data?.auditYear,
        });
        // getAuditors(realmName);
      })
      .catch((error: any) => {
        enqueueSnackbar(error.message, { variant: "error" });
      });
  };

  /**
   * @method parseCurrentAuditor
   * @description Function to parse the data of current auditors
   */
  const parseCurrentAuditor = (id: string, data: any) => {
    data.map((item: any) => {
      if (item.id === id) {
        setFormData((prev: any) => {
          return { ...prev, auditors: [item] };
        });
      }
    });
  };

  /**
   * @method getAuditors
   * @description Function to get all auditors
   * @param realm {string}
   * @returns nothing
   */
  // const getAuditors = (realm: string) => {
  //   getAllAuditors(realm).then((response: any) => {
  //     parseCurrentAuditor(currentUserId, response?.data);
  //   });
  // };

  /**
   * @method getAllSystemTypes
   * @description Function to fetch all system types
   * @param realm {string}
   * @returns nothing
   */
  const getAllSystemTypes = (realm: string) => {
    getSystemTypes(realmName)
      .then((response: any) => {
        setSystemTypes(parseSystemTypes(response?.data));
      })
      .catch((error: any) => {});
  };
  const getauditTypes = () => {
    getAllAuditTypes()
      .then((response: any) => {
        setAuditTypes(parseauditypes(response?.data));
      })
      .catch((error: any) => {});
  };

  const getLocations = () => {
    const id: any = sessionStorage.getItem("orgId");
    getAllLocations(id)
      .then((response: any) => {
        setLocation(parselocation(response?.data));
      })
      .catch((error: any) => {});
  };

  /**
   * @method getAllSubSystemTypes
   * @description Function to fetch all sub system types
   * @param id {string}
   * @returns nothing
   */
  // const getAllSubSystemTypes = (id: string) => {
  //   getSystems(id).then((response: any) => {
  //     setSystems(parseSystems(response?.data));
  //   });
  // };
  const getSystem = async () => {
    const encodedSystems = encodeURIComponent(
      JSON.stringify(formData.location)
    );
    getAll(encodedSystems)
      .then((res: any) =>
        setSystems(res.data.map((obj: any) => ({ id: obj.id, name: obj.name })))
      )
      .catch((err) =>{});
  };

  const uploadAuditReportA = async (files: any) => {
    try {
      const locationName = isOrgAdmin ? "" : userInfo?.location?.locationName;

      const newFormData = new FormData();

      files.forEach((file: any) => {
        newFormData.append("files", file.originFileObj, file.name);
      });

      const response = await axios.post(
        `/api/audits/addAttachMentForAudit?realm=${realmName}&locationName=${locationName}`,
        newFormData
      );
      // console.log("check response of files uploading", response);

      if (response?.status === 200 || response?.status === 201) {
        return {
          isFileUploaded: true,
          urls: response?.data,
        };
      } else {
        return {
          isFileUploaded: false,
          urls: [],
        };
      }
    } catch (error) {}
  };

  const uploadAuditReportAttachments = async (files: any) => {
    const locationName = isOrgAdmin ? "" : userInfo?.location?.locationName;
    let formDataFiles = new FormData();
    let oldData = [];
    let newData = [];

    for (let file of files) {
      if (file?.url) {
        oldData.push(file);
      } else {
        newData.push(file);
      }
    }
    newData.forEach((file: any) => {
      const fileToAdd = file.originFileObj || file;
      // console.log("fileToAdd content:", fileToAdd);
      formDataFiles.append("files", fileToAdd);
    });

    const id = "Audit";
    let res: any;
    let comdinedData;
    try {
      if (newData.length > 0) {
        res = await axios.post(
          `${API_LINK}/api/mrm/objectStore/${id}?realm=${realmName}&locationName=${locationName}`,
          formDataFiles,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            params: {
              id: id,
            },
          }
        );
      }
      if (res?.data?.length > 0) {
        comdinedData = res?.data;
      }

      if (oldData.length > 0) {
        comdinedData = oldData;
      }

      if (oldData?.length > 0 && res?.data?.length > 0) {
        comdinedData = [...res.data, ...oldData];
      }
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        // Custom alert message for 404 error
        alert(
          "Your Organization has exceeded the licensed attachments - Please reach ProcessRidge to activate additional licenses. Record will be saved without attachment"
        );
      } else {
        console.error("Error uploading data:", error);
        alert("An error occurred while uploading files. Please try again.");
      }
      return null;
    }

    return comdinedData;
  };

  /**
   * @method finalSubmit
   * @description Function to submit form data of multistepper form
   * @returns nothing
   * @memberof AuditCreationForm
   */
  const finalSubmit = async () => {
    const validateAuditname = await isValid(formData?.auditName);

    if (validateAuditname.isValid === false) {
      enqueueSnackbar(`Audit Report Name ${validateAuditname?.errorMessage}`, {
        variant: "error",
      });
      return;
    }

    const checkOverlapById:any = (auditors: any[], auditees: any[]): boolean => {
      const auditorIds = auditors.map(a => a.id);
      const auditeeIds = auditees.map(a => a.id);
    
      return auditorIds.some(id => auditeeIds.includes(id));
    };

    const hasOverlap = checkOverlapById(formData.auditors, formData.auditees);

    if (hasOverlap) {
      // console.error("Auditee and Auditor cannot have overlapping users.");
      enqueueSnackbar(`Auditee and Auditor cannot have overlapping users.`, {
        variant: "error",
      });
      // Or return true / throw error etc., depending on your flow
      return;
    }
    handleClose();
    let uploadAttachementResponse, newFormData;
    const checklistCopy = await getObtainedSectionScore();
    if (location?.state?.read || idParam.hasOwnProperty("readonly")) {
      navigate("/audit", {
        state: { redirectToTab: "AUDIT REPORT" },
      });
      return;
    }
    if (!!formData?.urls && formData?.urls.length > 0) {
      uploadAttachementResponse = await uploadAuditReportAttachments(
        formData?.urls
      );
    }
    // if (formData?.auditees?.length === 0) {
    //   enqueueSnackbar("Select Auditees", {
    //     variant: "error",
    //   });
    //   return;
    // }

    if (formData?.auditors?.length === 0) {
      enqueueSnackbar("Select Auditors", {
        variant: "error",
      });
      return;
    }
    if (uploadAttachementResponse?.length > 0) {
      newFormData = {
        ...formData,
        sections: checklistCopy,
        urls: uploadAttachementResponse,
      };
    } else {
      newFormData = { ...formData, sections: checklistCopy };
    }

    if (idParam?.id === undefined || idParam?.id === "undefined") {
      const result = await axios.get(
        `/api/audits/ValidateAuditIsUnique?locationId=${formData.location}&auditName=${formData.auditName}`
      );
      if (result.data !== true) {
        enqueueSnackbar("Audit Name Already Exist", {
          variant: "error",
        });
        return;
      }
    }
    const { createdAt, updatedAt, createdBy, publishedDate, title, ...rest } =
      newFormData;
    var date = moment();
    var dateComponent = date.format("YYYY-MM-DD");
    var timeComponent = date.format("HH:mm");
    if (rest.date === "")
      rest.date = rest.date = `${dateComponent}T${timeComponent}`;
    rest.isDraft = false;
    rest.auditYear = auditYear;
    validationSchema
      .validate(rest)
      .then(async () => {
        let res: any;

        if (idParam.id) {
          if (location?.state?.moveToLast === true) {
            navigate("/audit", {
              state: {
                redirectToTab: "AUDIT REPORT",
              },
            });
          } else {
            res = await editAudit(idParam.id, rest).then(
              async (response: any) => {
                enqueueSnackbar("Audit Submitted Successfully", {
                  variant: "success",
                });
                try {
                  const result = await axios.post(
                    `api/audits/sendMailWithPdfReport/${idParam.id}`
                  );
                  if (result.status === 201) {
                    enqueueSnackbar("Mail Sent Successfully", {
                      variant: "success",
                    });
                  }
                } catch (error) {
                  // console.log("error", error);
                }

                setFormData(rest);
                navigate("/audit", {
                  state: {
                    redirectToTab: "AUDIT REPORT",
                  },
                });
              }
            );
          }
        } else {
          try {
            const response = await axios.get(
              `/api/serial-number/generateSerialNumber?moduleType=Audit Report&location=${formData?.location}&createdBy=${userInfo?.id}&organizationId=${organizationId}`
            );

            const generatedValue = response.data;
            // Get the current month and year
            const currentDate = new Date();
            const currentMonth = (currentDate.getMonth() + 1)
              .toString()
              .padStart(2, "0");
            const currentYear = currentDate.getFullYear().toString().slice(-2);
            const LocationId = userInfo?.location?.locationId;
            const EntityId = userInfo?.entity?.entityId;
            // Replace all instances of "MM" with currentMonth

            res = await addAuditReportData({
              ...rest,
            });
            if (res.message === "Conflict") {
              enqueueSnackbar("Audit Name already exist", {
                variant: "error",
              });
              return;
            } else {
              try {
                const result = await axios.post(
                  `api/audits/sendMailWithPdfReport/${res?.respond?._id}`
                );
                if (result.status === 201) {
                  enqueueSnackbar("Mail Sent Successfully", {
                    variant: "success",
                  });
                } else {
                  enqueueSnackbar("Provide valid email address", {
                    variant: "error",
                  });
                }
              } catch (error) {}
              enqueueSnackbar("Audit Submitted Successfully", {
                variant: "success",
              });
            }

            setFormData(rest);
            navigate("/audit", {
              state: {
                redirectToTab: "AUDIT REPORT",
              },
            });
          } catch (error) {
            setIsLoading(false);

            enqueueSnackbar(`Error Occurred while creating audit plan`, {
              variant: "error",
            });
          }
        }
      })
      .catch((error: any) => {
        enqueueSnackbar(error.message, { variant: "error" });
      });
  };

  const getObtainedSectionScore = async () => {
    const checklistCopy = [...checklist];
    const updatedChecklist = checklistCopy.map((checklistItem: any) => {
      return {
        ...checklistItem,
        sections: checklistItem.sections.map((section: any) => {
          const totalQuestionScore = section.fieldset.reduce(
            (total: any, fieldset: any) => {
              return total + (fieldset.questionScore || 0);
            },
            0
          );

          return {
            ...section,
            obtainedScore: totalQuestionScore,
          };
        }),
      };
    });
    return updatedChecklist;
  };

  /**
   * @method getAuditData
   * @description Function to fetch all the audit information when an audit is opened up using the draft button or nc closure button
   * @param id {string}
   * @returns nothing
   */
  const getAuditData = (id: string) => {
    getAudit(id).then((response: any) => {
      const formattedDateTime = formatDateTime(response?.data?.date);

      setFormData((prevState: any) => ({
        ...prevState,
        auditType: response?.data?.auditType,
        auditTypeId: response?.data?.auditTypeId,
        auditScheduleId: response?.data?.auditScheduleId,
        isDraft: response?.data?.isDraft,
        system: response?.data?.system,
        auditObjective: response?.data?.auditObjective,
        auditors: response?.data?.auditors,
        location: response?.data?.location?.id,
        auditNumber: response?.data?.auditNumber,
        auditYear: response?.data?.auditYear,
        auditName: response?.data?.auditName,
        date: formattedDateTime,
        scheduleDate:
          response?.data?.scheduleDate !== null
            ? formatDateTime(response?.data?.scheduleDate)
            : "",
        auditedEntity: response?.data?.auditedEntity?.id,
        auditees: response?.data?.auditees,
        urls: response?.data?.urls,
        selectedTemplates: response?.data?.selectedTemplates,
        comment: response?.data?.comment,
        // auditTemplate: response.data.auditScheduleEntityWise[0].auditTemplateId,
        auditedClauses: response?.data?.auditedClauses?.length
          ? response.data.auditedClauses
          : [{ item: {} }],
        goodPractices: response?.data?.goodPractices,
        systemDtls: response?.data?.systemDtls?.length
          ? response?.data?.systemDtls
          : [{ item: {} }],
        auditScope: response?.data?.auditScope || "",
        clause_refs: response?.data?.clause_refs?.length
          ? response?.data?.clause_refs
          : [],
        sop_refs: response?.data?.sop_refs || [],
        hira_refs: response?.data?.hira_refs || [],
        capa_refs: response?.data?.capa_refs || [],
      }));
      setChecklist(response?.data?.sections);
      // setChecklist((prevState: any) => [
      //   // {
      //   //   ...prevState,
      //   //   // comment: response.data.comment,
      //   // },

      // ]);
      setIsReportDataLoaded(true);
    });
  };

  const dataforuser = async (name: string) => {
    const { data } = await axios.get(`api/user/getUserInfoByName/${name}`);
    return data;
  };

  const datasergate = async (data: any) => {
    const finalData = [];
    const filterNullData = data.filter((item: any) => item !== null);
    // console.log("check filterNullData", filterNullData);

    for (let value of filterNullData) {
      const data = await dataforuser(value);
      const Data = { ...data };
      finalData.push(Data);
    }
    return finalData;
  };

  useEffect(() => {
    // console.log("check here in new audit form", location.state);

    getAllSystemTypes(realmName);
    getauditTypes();
    getLocations();
    idParam.id && getAuditData(idParam.id);
    // location?.state?.systemDetails?.subId;
    // getAllSubSystemTypes(location?.state?.systemDetails?.id);
    !idParam.id && getOrganizationInformation(realmName);
    getSystem();

    // if(!!location.state && !!location.state.auditId) {
    //   getAuditData(location.state.auditId)
    //   getOrganizationInformation(realmName)
    // }

    if (!!location.state && !!location.state.auditScheduleId) {
      // console.log("check here in location if auditScheduleId Exists");

      getAuditScheduleDetails(location.state.auditScheduleId);
    }
  }, []);

  useEffect(() => {
    if (!!audittypes.length && !!locations.length && !!systemTypes.length) {
      setIsLoading(false);
      setIsDataLoaded(true);
    }
    if (!idParam.id) {
      setIsDataLoaded(true);
      setIsReportDataLoaded(true);
    }
    // if (!!location.state && !!location.state.auditScheduleId) {
    //   console.log("check toggling data report", formData);
    //   setIsReportDataLoaded(true)
    // }
  }, [audittypes, locations, systemTypes, formData]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let getAuditTypeId: AxiosResponse<any, any>;
        if (formData.auditType) {
          getAuditTypeId = await axios.get(
            `/api/audit-settings/getAuditTypeById/${formData.auditType}`
          );
          setFormData((prevFormData: any) => ({
            ...prevFormData,
            auditTypeId: getAuditTypeId.data.auditTypeId,
          }));
        }
      } catch (error) {}
    };
    fetchData();
  }, [formData.auditType]);

  const getAuditScheduleDetails = async (auditScheduleId: string) => {
    try {
      const response = await axios.get(
        `/api/auditSchedule/getAuditScheduleByIdOld/${auditScheduleId}/${realmName}`
      );
      // const getAuditTypeId = await axios.get(`/api/audit-settings/getAuditTypeById/${formData.auditType}`);
      const getAuditTypeId = await axios.get(
        `/api/audit-settings/getAuditTypeById/${response?.data.auditType}`
      );

      // const systemMasterObj = response.data.systemMaster[0];
      // const systemMaster = {
      //   name: systemMasterObj.name,
      //   id: systemMasterObj._id,
      // };
      // console.log("check in getAuditScheduleDetails", [systemMaster]);

      // console.log(" check auditType:", response.data.auditType);
      // console.log(" check system:", [systemMaster]);

      // console.log(" check location:", response.data.locationId);
      // console.log(" check auditNumber:", response.data.auditNumber);
      // console.log(" check auditYear:", response.data.auditYear);

      // console.log(" check auditedClauses:", response.data.systemMaster.clauses);

      // console.log(" check auditScheduleEntityWise:", response.data.auditScheduleEntityWise);
      // console.log("check auditee", response.data.auditScheduleEntityWise[0].auditee);
      // console.log("checkaudit location.state", location?.state);

      let auditorScheudleData;
      let auditeeScheuledata;
      let auditScheudleEntity: any;
      await response.data.auditScheduleEntityWise.map((value: any) => {
        if (value.entityName === location.state.entityName) {
          auditorScheudleData = value.auditor;
          auditScheudleEntity = value.entityId;
        }
      });

      await response.data.auditScheduleEntityWise.map((value: any) => {
        if (value.entityName === location.state.entityName) {
          auditeeScheuledata = value.auditee;
        }
      });

      const auditorData = await datasergate(
        // response.data.auditScheduleEntityWise[0].auditor
        auditorScheudleData
      );
      // console.log("check auditorData", auditorData);
      const auditeeData = await datasergate(
        // response.data.auditScheduleEntityWise[0].auditee
        auditeeScheuledata
      );
      // console.log("check auditeeData", auditeeData);

      setFormData((prevState: any) => ({
        ...prevState,
        auditType: response.data.auditType,
        auditTypeId: getAuditTypeId.data.auditTypeId,
        system: response.data.systemMaster.map((obj: any) => obj?._id),
        systemDtls: response?.data?.systemMaster.length
          ? response?.data?.systemMaster.map((value: any) => ({
              item: {
                id: value._id,
                name: value.name,
              },
            }))
          : [{ item: {} }],
        auditors: auditorData,
        location: response.data.locationId,
        auditNumber: response.data.auditNumber,
        auditYear: response.data.auditYear,
        // auditName: response.data.auditScheduleEntityWise[0].entityName,
        scheduleDate: response.data.auditScheduleEntityWise[0].time,
        auditedEntity: auditScheudleEntity,
        auditScheduleId: response.data.id,
        auditees: auditeeData,
        auditTemplate: response.data.auditScheduleEntityWise[0].auditTemplateId,
        selectedTemplates:
          response.data.auditScheduleEntityWise[0].auditTemplates,
        auditedClauses: response?.data?.clause_refs.length
          ? response?.data?.clause_refs
          : [{ item: {} }],
        auditScope: response?.data?.auditScope || "",
        clause_refs: response?.data?.clause_refs.length
          ? response?.data?.clause_refs
          : [],
        sop_refs: response?.data?.sop_refs || [],
        hira_refs: response?.data?.hira_refs || [],
        capa_refs: response?.data?.capa_refs || [],
      }));
      setIsReportDataLoaded(true);
      // console.log("check in getAuditScheduleDetails", response);
    } catch (error) {}
  };

  // useEffect(() => {
  //   console.log("checkaudit formData in audit report", formData);
  // }, [formData]);

  // useEffect(() => {
  //   console.log("checkaudit audittypes in audit report", audittypes);
  // }, [audittypes]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // for mobile tab select design

  const [selectedValue, setSelectedValue] = useState(0);
  const handleDataChange = (e: any) => {
    setSelectedValue(e.target.value);
    setActiveStep(e.target.value);
  };

  useEffect(() => {
    if (
      Array.isArray(formData.system) &&
      formData.system.length > 0 &&
      formData.system.length !== formData.systemDtls.length
    ) {
      setFormData({
        ...formData,
        systemDtls: systems
          .filter((item: any) => formData.system.includes(item.id))
          .map((value: any) => ({
            item: {
              id: value.id,
              name: value.name,
            },
          })),
        systemList: systems,
      });
    } else {
      setFormData({
        ...formData,
        systemList: systems,
      });
    }
  }, [formData.system, systems]);

  useEffect(() => {
    if (Array.isArray(formData.systemDtls) && formData.systemDtls.length > 0) {
      setFormData({
        ...formData,
        system: formData.systemDtls.map((item: any) => item?.item?.id),
        systemList: systems,
      });
    }
  }, [formData.systemDtls]);

  return (
    <>
      <div data-testid="confirm-dialog">
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle id="alert-dialog-title">
            {"Are you sure you want to Submit and lock the report ?"}
          </DialogTitle>
          <DialogActions>
            <Button
              onClick={handleClose}
              color="primary"
              style={{ fontSize: "10px" }}
            >
              No, Take Me Back
            </Button>
            <Button
              onClick={finalSubmit}
              data-testid="dialog-yes-button"
              variant="contained"
              color="primary"
              autoFocus
              style={{ fontSize: "10px" }}
            >
              Yes I am Sure
            </Button>
          </DialogActions>
        </Dialog>
      </div>
      {isLoading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "10%",
          }}
        >
          <CircularProgress />
        </div>
      ) : (
        <>
          {isDataLoaded && isReportDataLoaded && matches && (
            <FormStepper
              steps={steps}
              forms={forms}
              label="Audit Report"
              activeStep={activeStep}
              setActiveStep={setActiveStep}
              refForReportForm12={refForReportForm12}
              refForReportForm28={refForReportForm28}
              nosubmitButton={location?.state?.read || !formData.isDraft}
              showDraftIcon={formData?.isDraft && !!idParam.id ? true : false}
              handleNext={() =>
                setActiveStep((prevActiveStep) => prevActiveStep + 1)
              }
              handleBack={() =>
                setActiveStep((prevActiveStep) => prevActiveStep - 1)
              }
              handleFinalSubmit={
                location?.state?.read || !formData.isDraft
                  ? finalSubmit
                  : handleOpen
              }
              handleDraftSubmit={handleDraftSubmit}
              backBtn={
                <>
                  {view && (
                    <IconButton
                      onClick={handleDraftSubmit}
                      size="small"
                      style={{
                        marginRight: "15px",
                        backgroundColor: "#6e7dab",
                        padding: "5px",
                        position: "absolute",
                        top: "122px",
                        right: "80px",
                      }}
                    >
                      <MdSave style={{ fontSize: "24px", color: "#ffffff" }} />
                    </IconButton>
                  )}
                  {/* <BackButton
                parentPageLink={
                  location?.state?.redirectLink ?? "/audit/auditreport"
                }
              /> */}
                  <BackButton
                    parentPageLink="/audit"
                    redirectToTab="AUDIT REPORT"
                  />
                </>
              }
              saveBtn={location?.state?.read === true ? false : true}
              moveToStep={location?.state?.moveToLast ?? false}
              targetStep={2}
            />
          )}
        </>
      )}

      {matches ? (
        ""
      ) : (
        <>
          {/* <BackButton parentPageLink="/audit" redirectToTab="AUDIT REPORT" /> */}
          <div style={{ marginTop: "15px", marginRight: "10px" }}>
            <FormControl
              variant="outlined"
              size="small"
              fullWidth
              //  className={classes.formControl}
              style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <InputLabel>Menu List</InputLabel>
              <Select
                label="Menu List"
                value={selectedValue}
                onChange={handleDataChange}
              >
                <MenuItem value={0}>
                  <div
                    style={{
                      backgroundColor:
                        selectedValue === 0 ? "#3576BA" : "white",
                      textAlign: "center",
                      padding: "5px 10px",
                      borderRadius: "5px",
                      color: selectedValue === 0 ? "white" : "black",
                    }}
                  >
                    {" "}
                    Audit Information
                  </div>
                </MenuItem>
                <MenuItem value={1}>
                  {" "}
                  <div
                    style={{
                      backgroundColor:
                        selectedValue === 1 ? "#3576BA" : "white",
                      textAlign: "center",
                      padding: "5px 10px",
                      borderRadius: "5px",
                      color: selectedValue === 1 ? "white" : "black",
                    }}
                  >
                    Audit Scope
                  </div>
                </MenuItem>
                <MenuItem value={2}>
                  {" "}
                  <div
                    style={{
                      backgroundColor:
                        selectedValue === 2 ? "#3576BA" : "white",
                      textAlign: "center",
                      padding: "5px 10px",
                      borderRadius: "5px",
                      color: selectedValue === 2 ? "white" : "black",
                    }}
                  >
                    Checklist
                  </div>
                </MenuItem>
                <MenuItem value={3}>
                  <div
                    style={{
                      backgroundColor:
                        selectedValue === 3 ? "#3576BA" : "white",
                      textAlign: "center",
                      padding: "5px 10px",
                      borderRadius: "5px",
                      color: selectedValue === 3 ? "white" : "black",
                    }}
                  >
                    Audit Summary
                  </div>
                </MenuItem>
              </Select>
            </FormControl>
          </div>
          <div className={classes.buttonContainer}>
            <Button
              className={classes.exitButton}
              startIcon={<IoIosArrowBack />}
              onClick={()=>{
                navigate('/audit')
              }}
            >
              Exit
            </Button>
            <div style={{display:"flex", gap:"4px"}}>
              <Button className={classes.draftButton} disabled={location?.state?.read || !formData.isDraft} onClick={handleDraftSubmit}>Save</Button>
              <Button className={classes.saveButton} disabled={location?.state?.read || !formData.isDraft} onClick={finalSubmit}>Submit</Button>
            </div>
          </div>
        </>
      )}

      {matches ? (
        ""
      ) : (
        <div>
          {selectedValue === 0 ? (
            <div>
              <AuditInfoStepperForm
                systemTypes={systemTypes}
                subSystemTypes={systems}
                auditTypes={audittypes}
                location={locations}
                disabledFromProp={location?.state?.read || !formData?.isDraft}
                isEdit={!!idParam.id ? true : false}
                refForReportForm12={refForReportForm12}
              />
            </div>
          ) : (
            ""
          )}

          {selectedValue === 1 ? (
            <div>
              <AuditScopeComponent />
            </div>
          ) : (
            ""
          )}

          {selectedValue === 2 ? (
            <div>
              <Checklist
                disabled={location?.state?.read || !formData?.isDraft}
              />
            </div>
          ) : (
            ""
          )}

          {selectedValue === 3 ? (
            <div>
              <AuditClosure
                disabled={location?.state?.read || !formData?.isDraft}
                refForReportForm28={refForReportForm28}
              />
            </div>
          ) : (
            ""
          )}
        </div>
      )}
    </>
  );
};

export default NewAuditForm;