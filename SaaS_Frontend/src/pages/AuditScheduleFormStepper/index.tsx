import { useState, useEffect, useRef } from "react";
import CircularProgress from "@material-ui/core/CircularProgress";
import AuditScheduleForm1 from "../../components/AuditScheduleForm1";
import AuditScheduleForm2 from "../../components/AuditScheduleForm2";
import AuditScheduleForm3 from "../../components/AuditScheduleForm3";

import {
  auditSchedule,
  orgFormData,
  auditScheduleFormType,
  currentAuditPlanYear,
} from "../../recoil/atom";
import { useRecoilState, useRecoilValue, useResetRecoilState } from "recoil";
import { auditScheduleSchema } from "../../schemas/auditScheduleSchema";
import { useSnackbar } from "notistack";
import { useNavigate, useParams } from "react-router-dom";
import useStyles from "./styles";

import axios from "../../apis/axios.global";
import moment from "moment";
import {
  Button,
  Divider,
  Modal,
  Popover,
  Tour,
  TourProps,
  Tabs,
  Input,
  Typography as andtTypography,
} from "antd";
import SingleFormWrapper from "containers/SingleFormWrapper";
import checkRoles from "utils/checkRoles";
import { roles } from "utils/enums";
import { MdOutlineInfo, MdOpenInNew } from  "react-icons/md";
import {
  IconButton,
  Typography,
  Button as MatButton,
  FormControl,
  TextField,
} from "@material-ui/core";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import getAppUrl from "utils/getAppUrl";
import getSessionStorage from "utils/getSessionStorage";
import CommonReferencesTab from "components/CommonReferencesComponents/CommonReferencesTab";
import { Grid } from "@material-ui/core";
import FormStepper from "../../components/FormStepper";
import React from "react";
import BackButton from "../../components/BackButton";
import { Autocomplete } from "@material-ui/lab";
const { TabPane } = Tabs;
const { TextArea } = Input;

type Props = {
  dataFrom?: string;
  dataId?: string;
  modalWindow?: boolean;
  locationId?: any;
  auditType?: any;
  setIsModalVisible?: any;
  isModalVisible?: any;
  generator?: any;
  assistantFormData?: any;
  dataForChecklistGeneration?: any;
};

/**
 *
 * The new audit schedule page is required to create a new audit schedule and edit it.
 */

function AuditScheduleFormStepper({
  dataFrom,
  dataId = "",
  modalWindow = false,
  setIsModalVisible,
  isModalVisible,
  auditType,
  locationId,
  generator,
  assistantFormData,
  dataForChecklistGeneration,
}: Props) {
  // const [auditScheduleData, setAuditScheduleData] =
  //   useState(auditScheduleSchema);

  const [auditScheduleData, setAuditScheduleData] =
    useRecoilState(auditSchedule);

  const resetAuditSchedule = useResetRecoilState(auditSchedule);

  const [scheduleFormType, setScheduleFormType] = useRecoilState(
    auditScheduleFormType
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  let { from: paramFrom, id: paramId } = useParams();
  let isEdit: any;
  const userInfo = JSON.parse(sessionStorage.getItem("userDetails") as string);
  const isOrgAdmin = checkRoles(roles.ORGADMIN);
  const [locationNo, setLocationNo] = useState("");
  const [DataforDate, setDataForDate] = useState<any>([]);
  const [date, setDate] = useState<any>([]);
  const [removedList, setRemovedList] = useState<any>([]);
  const orgData = useRecoilValue(orgFormData);
  const [entityTypeData, setEntityTypeData] = useState();

  //states for dropdown values
  const [systemTypes, setSystemTypes] = useState<any[]>([]);
  const [systems, setSystems] = useState<any[]>([]);
  //const [clauses, setClauses] = useState<any[]>([]);
  const [locationNames, setLocationNames] = useState<any>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [auditTypes, setAuditTypes] = useState<any[]>([]);
  const [functionList, setFunctionList] = useState<any[]>([]);
  const [selectedFunction, setSelectedFunction] = useState<any[]>([]);

  const [dropdownEntities, setDropdownEntities] = useState<any[]>([]);
  const [auditPlanEntityWiseId, setAuditPlanEntityWiseId] = useState<any>("");

  const [conflicts, setConflicts] = useState<any>([]);
  const [isDuplicateClicked, setIsDuplicateClicked] = useState<any>(false);
  const [conflictMessage, setConflictMessage] = useState<any>("");
  const [conflictModalOpen, setConflictModalOpen] = useState<any>(false);
  const [isScheduleInDraft, setIsScheduleInDraft] = useState<any>(false);
  const [lockScheduleModalOpen, setLockScheduleModalOpen] =
    useState<any>(false);
  const [editableRowIds, setEditableRowIds] = useState<any>([]);
  const [auditPlanYear, setAuditPlanYear] =
    useRecoilState<any>(currentAuditPlanYear);
  //this state is used when scope = department, and plan type is month,
  //so to later fetch finalised auditors, this entityWiseId is necessarry
  const [entityIdToEntityWiseIdMapping, setEntityIdToEntityWiseIdMapping] =
    useState<any>([]);

  const [auditPlanEntityIdLookupArray, setAuditPlanEntityIdLookupArray] =
    useState<any>(null);

  //below state is for audit period field, if  plant type is month, it can contain dates or months
  //if finaliseddates exist is true, it means audit period should rendere dates, if false it will render months
  const [isFinaliseDatesExist, setIsFinaliseDatesExist] = useState<any>(false);

  //below state is for team lead, so each finalised date (audit period) may or may not have teamLead,
  //if teamLead exists in that period, and that period is selected, disable SUbmit button for `whoCanSchedule`,
  // and in Edit mode, check if logged in user is team Lead, allow him to edit the schedule
  const [teamLeadId, setTeamLeadId] = useState<any>(null);
  const [teamLeadInfoModal, setTeamLeadInfoModal] = useState<any>({
    open: false,
  });
  const [
    disableAuditorsAndChecklistField,
    setDisableAuditorsAndChecklistField,
  ] = useState<any>(false);

  //disable schedule to save, submit from other unit's imscs
  const [disableEditScheduleForOtherUnit, setDisableEditScheduleForOtherUnit] =
    useState<any>(false);

  const [scheduleCreationLoader, setScheduleCreationLoader] =
    useState<any>(false);
  const [drawer, setDrawer] = useState<any>({
    mode: "create",
    open: false,
  });
  const [activeStep, setActiveStep] = React.useState(0);
  const userDetails = getSessionStorage();

  const realmName = getAppUrl();
  const organizationId =
    sessionStorage.getItem("orgId") !== null &&
    sessionStorage.getItem("orgId") !== "null"
      ? sessionStorage.getItem("orgId")
      : (orgData && orgData.organizationId) ||
        (orgData && orgData.id) ||
        undefined;

  const id = paramId || dataFrom;

  const from = paramFrom || dataId;
  if (id) {
    if (from === "plan") {
      isEdit = false;
    } else {
      isEdit = true;
    }
  }

  useEffect(() => {
    if (dataForChecklistGeneration?.length) {
      setAuditScheduleData((prev: any) => ({
        ...prev,
        AuditScheduleEntitywise: dataForChecklistGeneration?.map(
          (obj: any) => ({
            entityId: obj?.entity_id,
            name: obj?.entity_name,
            time: null,
            auditors: [],
            auditees: [],
            comments: "",
            auditPeriod: obj?.month,
          })
        ),
      }));
    }
  }, [isModalVisible]);

  useEffect(() => {
    // console.log("checkaudit inside useEffect[auditPeriod]", auditScheduleData);

    setTeamLeadId(null);
    if (
      !!auditScheduleData.auditPeriod &&
      auditScheduleData?.auditPeriod !== "" &&
      auditScheduleData?.AuditScheduleEntitywise?.length &&
      !isEdit
    ) {
      // console.log("checkaudit inside main if condtion");

      enqueueSnackbar(`Audit Period is Changed, Form is Reset`, {
        variant: "info",
        autoHideDuration: 2500,
      });
      setAuditScheduleData((prev: any) => ({
        ...prev,
        AuditScheduleEntitywise: [],
      }));
      setTeamLeadId(null);
      setDisableAuditorsAndChecklistField(false);
      setDropdownEntities([]);

      //newly added code to make immediated audit period change and load departmeent in dept dropdown
      if ((auditScheduleData?.scope?.name as any) === "Unit") {
        // console.log("checkaudit inside if scope unit");

        if (auditScheduleData?.auditPeriod.includes("-")) {
          // console.log("checkaudit inside if scope unit if audit period -");

          getEntityListingForDateRange();
        } else {
          // console.log("checkaudit inside if scope unit else audit perod - ");

          getEntityListingForMonthType();
        }
      } else if (
        (auditScheduleData?.scope?.name as any) === "Corporate Function"
      ) {
        // console.log(
        //   "checkaudit inside scope name corp fnction else if of scope unit "
        // );

        if (auditScheduleData?.auditPeriod.includes("-")) {
          // console.log(
          //   "checkaudit inside scope name corp fnction audit period -  inside if"
          // );

          getEntityListingForDateRange();
        } else {
          // console.log(
          //   "checkaudit inside scope name corp fnction audit peroid - else "
          // );

          getEntityListingForMonthType();
        }
      } else if (auditScheduleData?.scope?.name as any) {
        // console.log("checkaudit inside just scope exsting  i");

        if (auditScheduleData?.auditPeriod.includes("-")) {
          // console.log("checkaudit inside just scope exsting  if if ");

          getEntityListingForDateRange();
        } else {
          // console.log("checkaudit inside just scope exsting  if else");

          getEntityListingForMonthType();
        }
      }
    } else {
      // console.log("checkaudit inside main else");

      if (auditScheduleData?.planType === "Date Range" && !isEdit) {
        // console.log("checkaudit inside plan date rangr and not edit");

        if (
          auditScheduleData.auditPeriod !== ""
          //  &&
          // auditScheduleData.scope.id !== "Unit"
        ) {
          // console.log("checkaudit inside plan date rangr and not edi if if");

          // getAuditPlanDetailsEntityWiseById();
          getEntityListingForDateRange();
        } else {
          // console.log("checkaudit inside plan date rangr and not edi if else");

          getAuditPlanDetailsUnitWiseById();
        }
      } else {
        // console.log("checkaudit inside plan date rangr and not edi else");

        if (!isEdit) {
          // console.log("checkaudit inside not edie else part of date range");

          // console.log("checkaudit inside else if draft--->", auditScheduleData);

          if ((auditScheduleData?.scope?.name as any) === "Unit") {
            // console.log("checkaudit inside else part of date range scope unit");

            if (isFinaliseDatesExist) {
              // console.log(
              //   "checkaudit inside else part of date range scope unit if"
              // );

              getEntityListingForDateRange();
            } else {
              // console.log(
              //   "checkaudit inside else part of date range scope unit else"
              // );

              // if (auditScheduleData?.isDraft) {
              getEntityListingForMonthType();
              // }
            }
          } else if (
            (auditScheduleData?.scope?.name as any) === "Corporate Function"
          ) {
            // console.log("checkaudit inside last corp");

            if (auditScheduleData?.auditPeriod.includes("-")) {
              // console.log("checkaudit inside last corp if ");

              getEntityListingForDateRange();
            } else {
              // console.log("checkaudit inside last corp else");

              getEntityListingForMonthType();
            }
          } else if (auditScheduleData?.scope?.name as any) {
            // console.log("checkaudit inside last copr scope");

            if (auditScheduleData?.auditPeriod.includes("-")) {
              // console.log("checkaudit inside last corpt scoep");

              getEntityListingForDateRange();
            } else {
              // console.log("checkaudit inside");

              // if (auditScheduleData?.isDraft) {
              getEntityListingForMonthType();
              // }
            }
          }
        }
      }
    }
  }, [auditScheduleData.auditPeriod]);

  useEffect(() => {
    if (auditScheduleData?.selectedFunction?.length > 0) {
      // getAuditPeriodForMonthPlanType()
      getAuditPeriodForMonthPlanType(
        auditScheduleData?.scope?.name,
        auditScheduleData?.location?.id || ""
      );
      getEntityListingForMonthType();
    }
  }, [auditScheduleData?.selectedFunction]);

  useEffect(() => {
    if (
      (!isEdit &&
        from === "plan" &&
        date?.length &&
        auditScheduleData?.auditPeriod) ||
      (isEdit &&
        date?.length &&
        auditScheduleData?.auditPeriod &&
        auditScheduleData?.isDraft)
    ) {
      const [selectedStartDate, selectedEndDate] =
        auditScheduleData?.auditPeriod?.split(" - ");

      const selectedAuditPeriod = date?.find(
        (item: any) =>
          item?.startDate === selectedStartDate &&
          item?.endDate === selectedEndDate
      );

      if (selectedAuditPeriod?.teamLeadId) {
        setTeamLeadId(selectedAuditPeriod?.teamLeadId);
        setDisableEditScheduleForOtherUnit(false);
        //when in edit mode and is draft, check if logged in user is teamLead othere disable all the fields
        // if (
        //   isEdit &&
        //   date?.length &&
        //   auditScheduleData?.auditPeriod &&
        //   auditScheduleData?.isDraft
        // ) {
        //   if (selectedAuditPeriod?.teamLeadId !== userDetails?.id) {
        //     setIsScheduleInDraft(false);
        //   }
        // }
      }
    }
  }, [date, auditScheduleData?.auditPeriod]);

  useEffect(() => {
    if (
      !!teamLeadId &&
      auditScheduleData?.AuditScheduleEntitywise?.length === 1 &&
      !isEdit
    ) {
      //the selected audit period has a team lead, and a department has been added,
      //so just throw a popup msg saying , Team lead is available, Auditors and
      // Audit Checklist will be added by team lead
      setTeamLeadInfoModal({ open: true });
      setDisableAuditorsAndChecklistField(true);
      setAuditScheduleData((prev: any) => ({
        ...prev,
        auditTemplates: [],
      }));
    }

    if (
      !!teamLeadId &&
      auditScheduleData?.AuditScheduleEntitywise?.length &&
      !!isEdit &&
      auditScheduleData?.isDraft
    ) {
      if (teamLeadId === userDetails?.id) {
        setIsScheduleInDraft(true);
        setDisableEditScheduleForOtherUnit(false);
        setDisableAuditorsAndChecklistField(false);
      }
    }
  }, [teamLeadId, auditScheduleData?.AuditScheduleEntitywise?.length]);

  useEffect(() => {
    // console.log(
    //   "checkaudit inside mounting called auditSchedule Data",
    //   auditScheduleData
    // );
    // auditType,
    // locationId

    return () => {
      setScheduleFormType("none");
      setAuditScheduleData(auditScheduleSchema);
    };
  }, []);
  useEffect(() => {
    // console.log("checkaudit1 [auditScheduleData.location] useEffect called");
    // console.log("checkaudit1 scheduleFormType --->", scheduleFormType);

    if (
      auditScheduleData?.location?.id !== "" &&
      auditScheduleData?.location?.id !== undefined
    ) {
      // console.log(
      //   "checkaudit1 [auditScheduleData.location] useEffect called inside if"
      // );

      let scope = entityTypeData;
      if (!scope && !!isEdit && !!auditScheduleData?.scope?.name) {
        scope = auditScheduleData?.scope?.name;
      }

      getAuditPeriodForMonthPlanType(
        scope,
        auditScheduleData?.location?.id || ""
      );
    }
  }, [auditScheduleData.location]);
  useEffect(() => {
    //below flow when adhoc schedule is created
    // if (!!scheduleFormType && scheduleFormType === "adhoc-create") {
    getSystemTypes();
    getLocation();
    getLocationNames();
    getAuditYear();
    getSystems();
    getTemplates();
    getAuditType();
    getFunctionList();

    // }
  }, [from, id, generator]);
  useEffect(() => {
    if (scheduleFormType === "adhoc-create") {
      // console.log(
      //   "checkaudit inside useEffect[adhoc-create] auditScheduleData",
      //   auditScheduleData
      // );

      if (!!dropdownEntities && dropdownEntities.length) {
        // console.log(
        //   "checkaudit inside useEffect[adhoc-create] dropdownEntities",
        //   dropdownEntities
        // );

        enqueueSnackbar(`Audit Type is Changed, Form is Reset`, {
          variant: "info",
          autoHideDuration: 2500,
        });
        setAuditScheduleData((prev: any) => ({
          ...prev,
          AuditScheduleEntitywise: [],
        }));
        setDropdownEntities([]);
      }
      if (!!auditScheduleData?.auditType && !!auditScheduleData?.scope?.id) {
        // console.log(
        //   "checkaudit inside useEffect[auditScheduleData?.auditType] auditScheduleData",
        //   auditScheduleData?.auditType
        // );
        initialiseEntities();
      }
    }
    // else if (!!isEdit && !!auditScheduleData?.isDraft) {
    //   console.log("checkaudit inside useEffect[adhoc-edit] auditScheduleData", auditScheduleData);

    //   enqueueSnackbar(`Audit Type is Changed, Form is Reset`, {
    //     variant: "info",
    //     autoHideDuration: 2500,
    //   });
    //   setAuditScheduleData((prev: any) => ({
    //     ...prev,
    //     AuditScheduleEntitywise: [],
    //   }));
    //   setDropdownEntities([]);
    //   if (!!auditScheduleData?.auditType && !!auditScheduleData?.scope?.id) {
    //     initialiseEntities();
    //   }
    // }
  }, [auditScheduleData?.auditType, auditScheduleData?.scope?.id]);
  useEffect(() => {
    // console.log(
    //   "checkaudit inside useeffect form, id --> scheduleFormType",
    //   scheduleFormType
    // );
    // if (!from && !id) {
    //   setAuditScheduleData((prev: any) => ({
    //     ...prev,
    //     auditType: "",
    //     auditScheduleName: `No Plan - Audit Schedule for - ${auditScheduleData?.scope?.name}`,
    //   }));
    // }
    if (from === "plan") {
      // console.log("test data is passede");
      // setAuditScheduleData((prev: any) => ({
      //   ...prev,
      //   auditScheduleName: `${auditScheduleData?.auditName} - Audit Schedule for - ${auditScheduleData?.scope?.name}`,
      // }));
      getAuditPlanDetailsById();
    } else if (from === "schedule") {
      // console.log("new test condition id", id);
      getAuditScheduleDetailsById();
    }
    // console.log("test data is passede1");
  }, [from, id, generator]);

  useEffect(() => {
    getSystems();
  }, [auditScheduleData.location]);

  const getAuditYear = async () => {
    // await axios(`api/auditPlan/getAuditYear`) // audit year API here
    //   .then((res) => {
    setAuditScheduleData((prev: any) => ({
      ...prev,
      year: auditPlanYear,
    }));
    // })
    // .catch((err) => console.error(err));
  };

  const getAuditType = async () => {
    try {
      let res = await axios.get(
        `/api/audit-settings/getUserPermissionBasedAuditTypesSchedule`
      );
      setAuditTypes(res.data);
    } catch (err) {
      // console.error(err);
    }
  };
  const getTemplates = async () => {
    await axios(`/api/auditSchedule/auditScheduleTemplate`) // templates API here
      .then((res) => {
        setTemplates(
          res.data.map((obj: any) => ({ value: obj._id, label: obj.title }))
        );
      })
      .catch((err) => {});
  };
  const getLocationNames = async () => {
    try {
      const res = await axios.get(
        `api/location/getLocationsForOrg/${realmName}`
      );

      setLocationNames(res.data);
    } catch (error) {}
  };
  // get location by user id
  const getLocation = async () => {
    await axios(`api/auditPlan/getLocationByUserID`) // location by user ID API here
      .then((res) => {
        // if (locationId !== undefined) {
        //   console.log("next test new 4")

        //   setAuditScheduleData({
        //     ...auditScheduleData,
        //     location: { id: locationId?.id, locationName: locationId.locationName },
        //   });
        // }
        setAuditScheduleData((prev: any) => ({
          ...prev,
          location: { id: res.data.id, locationName: res.data.locationName },
          createdBy: res.data.username ?? "",
        }));

        if (auditType !== undefined) {
          setAuditScheduleData({
            ...auditScheduleData,
            auditType: auditType?.id,
            scope: auditType?.scope,
            location: { id: res.data.id, locationName: res.data.locationName },
            createdBy: res.data.username ?? "",
            systemName: auditType?.system,
            systems: auditType?.system.length
              ? systems
                  .filter((item: any) => auditType?.system.includes(item.id))
                  .map((value: any) => ({
                    item: {
                      id: value.id,
                      name: value.name,
                    },
                  }))
              : [{ item: {} }],
          });
        }
      })
      .catch((err) => {});
  };

  // get system types by organisation
  const getSystemTypes = async () => {
    await axios(`api/auditPlan/getAllSystemsByOrganisation`)
      .then((res) => setSystemTypes(res.data))
      .catch((err) => {});
  };

  // get systems by system type
  const getSystems = async () => {
    // console.log("auditScheduleData.location.id", auditScheduleData.location.id);
    const encodedSystems = encodeURIComponent(
      JSON.stringify([auditScheduleData?.location?.id])
    );
    await axios(`/api/systems/displaySystems/${encodedSystems}`)
      .then((res) =>
        setSystems(res.data.map((obj: any) => ({ id: obj.id, name: obj.name })))
      )
      .catch((err) => {});
  };

  const abstractDate = (date: string) => {
    const d = new Date(date);

    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const validateSheduleForAtleastOneDept = () => {
    if (auditScheduleData.AuditScheduleEntitywise.length < 1) {
      return false;
    } else return true;
  };

  const validateAuditScheduleForm3 = () => {
    let flag = false;

    auditScheduleData.AuditScheduleEntitywise.filter(
      (obj: any) => !obj.deleted
    ).forEach((obj) => {
      if (!obj.time || !obj.auditors.length || !obj.auditees.length)
        flag = true;
    });

    return !flag;
  };

  // get Entities by location and entity type
  const initialiseEntities = async (tableEntites: any = []) => {
    await axios(
      `/api/auditPlan/getEntity/${auditScheduleData.location.id}/${auditScheduleData.scope.id}`
    )
      .then((res) => {
        // console.log(
        //   "checkaudit inside intialiseEntities create mode",
        //   res.data
        // );
        if (!isEdit && auditScheduleData.auditName !== "No Plan") {
          setDropdownEntities(res.data);
        }
      })
      .catch((err) => {});
  };

  const initialiseEntitiesForEditMode = async (
    tableEntites: any = [],
    locationId: any,
    scopeId: any
  ) => {
    if (!!locationId && !!scopeId) {
      await axios(`/api/auditPlan/getEntity/${locationId}/${scopeId}`)
        .then((res) => {
          if (scheduleFormType === "adhoc-edit") {
            const filteredEntities = res.data.filter(
              (resEntity: any) =>
                !tableEntites.some(
                  (tableEntity: any) => tableEntity.entityId === resEntity.id
                )
            );

            // console.log("checkaudit tableEntites --->", tableEntites);
            // console.log("checkaudit Filtered entities for dropdown: ", filteredEntities);

            // Set dropdownEntities to filteredEntities
            setDropdownEntities(filteredEntities);
          }
          // if (
          //   auditScheduleData.auditName !== "No Plan" &&
          //   !!isEdit &&
          //   tableEntites?.length > 0
          // ) {
          //   const filteredEntities = dropdownEntities.filter(
          //     (resEntity: any) =>
          //       !tableEntites.some(
          //         (tableEntity: any) => tableEntity.entityId === resEntity.id
          //       )
          //   );
          //   setDropdownEntities([...filteredEntities]);
          // }
        })
        .catch((err) => {});
    }
  };

  // get plan details if from is plan
  const getAuditPlanDetailsById = async () => {
    await axios(`/api/auditPlan/getAuditPlanData/${id}`)
      .then((res) => {
        // console.log("new test condition url", id);
        setDataForDate(res.data.auditPlanEntityWise);
        if (res.data.planType === "Date Range") {
          getDateRangesByAuditPlanId();
        }

        setEntityTypeData(res.data.entityType || "");
        if (res.data.planType === "Month") {
          getAuditPeriodForMonthPlanType(
            res.data.entityType,
            res.data.locationId
          );
        }

        const data = res.data.auditPlanEntityWise
          // .filter((obj: any) => obj.deleted)
          .map((obj: any) => ({
            id: obj.id,
            entityId: obj.entityId,
            name: obj.entityName,
            months: obj.auditSchedule,
            deleted: obj.deleted,
          }));
        setRemovedList(data);
        setAuditScheduleData({
          createdBy: res.data.createdBy,
          auditType: res.data.auditType,
          auditName: res.data.auditName,
          auditNumber: res.data.id,
          useFunctionsForPlanning: res.data.useFunctionsForPlanning,
          createdOn: abstractDate(res.data.createdAt),
          systemType: res.data.systemTypeId,
          auditPeriod: "",
          planType: res.data.planType,
          auditScheduleName: `${res.data.auditName} - Audit Schedule for - ${auditScheduleData?.scope?.name}`,
          // systemName: res.data.systemMasterId,
          systemName: res.data.systemMaster.map((value: any) => value._id),
          systems: res?.data?.systemMaster.map((value: any) => ({
            item: {
              id: value._id,
              name: value.name,
            },
          })) || [{ item: {} }],
          clause_refs: res?.data?.clause_refs || [],
          sop_refs: res?.data?.sop_refs || [],
          hira_refs: res?.data?.hira_refs || [],
          capa_refs: res?.data?.capa_refs || [],
          scheduleNumber: "",
          year: res.data.auditYear,
          prefixSuffix: res.data.prefixSuffix,
          location: {
            id: res.data.locationId,
            locationName: res.data.location,
          },
          planNumber: res.data.id,
          scope: {
            id: res.data.entityTypeId,
            name: res.data.entityType,
          },
          role: res.data.roleId,
          minDate: null,
          maxDate: null,
          template: null,
          AuditScheduleEntitywise: [],
          isDraft: res.data.isDraft,
          // AuditScheduleEntitywise: res.data.auditPlanEntityWise
          //   .map(
          //     (obj: {
          //       id: string;
          //       entityId: string;
          //       entityName: string;
          //       auditors: any;
          //       monthNames: any;
          //       combinedData: any;
          //     }) => ({
          //       id: obj.id,
          //       entityId: obj.entityId,
          //       name: obj.entityName,
          //       combinedData: obj?.combinedData,
          //       monthNames: obj?.monthNames,
          //       time: null,
          //       auditors: obj?.auditors,
          //       auditees: [],
          //       comments: "",
          //     })
          //   ),
        });

        // if (res.data.planType === "Date Range") {
        //   let data = res.data.auditPlanEntityWise.flatMap((entity: any) =>
        //     entity.auditSchedule.map((schedule: any) => schedule)
        //   );
        //   if (data && data.length) {

        //     setDate(data);
        //   } else {
        //     setDate([]);
        //     enqueueSnackbar(
        //       `No Audit Periods found for this Audit Plan, Can't Schedule`,
        //       {
        //         variant: "error",
        //         autoHideDuration: 2500,
        //       }
        //     );
        //   }
        // }
        // if (res.data.planType === "Month") {
        //   const uniqueMonthNames = res.data.auditPlanEntityWise.reduce(
        //     (acc: any, item: any) => {
        //       item.monthNames.forEach((monthName: any) => acc.add(monthName));
        //       return acc;
        //     },
        //     new Set()
        //   );

        //   if (uniqueMonthNames.size === 0) {
        //     // Set Date to an empty array or to some default value
        //     setDate([]); // or setDate(defaultValue);
        //     enqueueSnackbar(
        //       `No Audit Periods found for this Audit Plan, Can't Schedule`,
        //       {
        //         variant: "error",
        //         autoHideDuration: 2500,
        //       }
        //     );
        //   } else {
        //     const uniqueMonthNamesArrayWithIds = Array.from(
        //       uniqueMonthNames
        //     ).map((monthName, index) => ({
        //       id: index,
        //       month: monthName,
        //     }));

        //     setDate(uniqueMonthNamesArrayWithIds);
        //   }
        // }
      })
      .catch((err) => {});
  };

  const getAuditPlanDetailsEntityWiseById = async () => {
    await axios(
      `/api/auditPlan/getAuditPlanEntityWiseData/${id}/?month=${auditScheduleData.auditPeriod}`
    )
      .then((res) => {
        // setDataForDate(res.data.auditPlanEntityWise);
        setAuditScheduleData((prev: any) => ({
          ...prev,
          AuditScheduleEntitywise: res.data.auditPlanEntityWise.map(
            (obj: {
              id: string;
              entityId: string;
              entityName: string;
              auditors: any;
              monthNames: any;
            }) => ({
              entityId: obj.entityId,
              name: obj.entityName,
              monthNames: obj?.monthNames,
              time: null,
              auditors: obj?.auditors,
              auditees: [],
              comments: "",
            })
          ),
        }));
      })
      .catch((err) => {});
  };

  const getEntityListingForDateRange = async () => {
    //here id is auditPlan Id
    let auditPlanId = from === "plan" ? id : auditScheduleData.planNumber;
    let scope: any = auditScheduleData?.scope?.name;
    // console.log(
    //   "checkaudit inside getEntitlisting for date range",
    //   auditPlanId
    // );
    // console.log("checkaudit inside getEntitlisting for scope", scope);
    // console.log(
    //   "checkaudit inside getEntityListing auditScejedle data",
    //   auditScheduleData
    // );
    // console.log(
    //   "checkaudit inside getEntitlisting auditplan entity wise id ",
    //   auditPlanEntityWiseId
    // );

    if (
      !scope ||
      !auditScheduleData?.auditPeriod ||
      !auditPlanId ||
      !auditPlanEntityWiseId
    )
      return;

    await axios(
      `/api/auditPlan/getEntityListingForDateRange/${auditPlanId}?dateRange=${auditScheduleData.auditPeriod}&scope=${scope}&locationId=${auditScheduleData?.location?.id}&auditPlanEntityWiseId=${auditPlanEntityWiseId}&orgId=${organizationId}`
    )
      .then((res) => {
        if (!scope) return;
        // console.log("checkaudit res in getEntityListingForDateRange", res);
        if (res.status === 200) {
          if (res?.data?.data && res?.data?.data?.length) {
            setDropdownEntities(res?.data?.data);
            if (scope === "Unit") {
              setAuditPlanEntityWiseId(res?.data?.auditPlanEntityWiseId);
            }
            if (scope) {
              setEntityIdToEntityWiseIdMapping(
                res?.data?.entityToEntityWiseMapping
              );
            }
          } else {
            setDropdownEntities([]);
            setAuditPlanEntityWiseId("");
            setEntityIdToEntityWiseIdMapping([]);
            enqueueSnackbar(`${res.data.message}`, {
              variant: "error",
            });
          }
        } else {
          setDropdownEntities([]);
          setAuditPlanEntityWiseId("");
          setEntityIdToEntityWiseIdMapping([]);
          enqueueSnackbar(
            `Error Occured while fetching departments for selected month`,
            {
              variant: "error",
            }
          );
        }
      })
      .catch((err) => {});
  };

  const getDateRangesByAuditPlanId = async () => {
    await axios(
      `/api/auditPlan/getDateRangesByAuditPlanId/${id}?locationId=${userDetails?.location?.id}`
    )
      .then((res) => {
        // console.log("checkaudit res in getDateRangesByAuditPlanId", res);
        // let data = res.data?.data?.flatMap((entity: any) =>
        //   entity.auditSchedules.map((schedule: any) => schedule)
        // );
        // console.log("checkaudit date data", data);

        if (res.data?.data && res?.data?.data?.length) {
          setDate(
            res.data?.data?.map((obj: any, index: number) => ({
              ...obj,
              id: `auditPlanId-${index + 1}`,
            }))
          );
        }
        // setDataForDate(res.data.auditPlanEntityWise);
        // setAuditScheduleData((prev: any) => ({
        //   ...prev,
        //   AuditScheduleEntitywise: res.data.auditPlanEntityWise.map(
        //     (obj: {
        //       id: string;
        //       entityId: string;
        //       entityName: string;
        //       auditors: any;
        //       monthNames: any;
        //     }) => ({
        //       entityId: obj.entityId,
        //       name: obj.entityName,
        //       monthNames: obj?.monthNames,
        //       time: null,
        //       auditors: obj?.auditors,
        //       auditees: [],
        //       comments: "",
        //     })
        //   ),
        // }));
      })
      .catch((err) => {});
  };

  const getAuditPeriodForMonthPlanType = async (
    scope: any = "",
    locationId: any = ""
  ) => {
    try {
      // console.log("checkaudit inside getAuditPeriodForMonthPlanType");
      if (!scope || !locationId) return;

      let auditPlanId = from === "plan" ? id : auditScheduleData.planNumber;
      // let scope: any = auditScheduleData?.scope?.name || "";
      // console.log(
      //   "checkaudit inside getAuditPeriodForMonthPlanType auditPlanId scope",
      //   auditPlanId,
      //   scope,
      //   locationId
      // );

      // if(!auditScheduleData?.auditPeriod) return;
      // if(!auditPlanId) return;
      let queryUrl = `/api/auditPlan/getAuditPeriodForMonthPlanType/${auditPlanId}?scope=${scope}&locationId=${locationId}&orgId=${userDetails?.organizationId}`;

      let selectedMapFunctions = [];
      if (auditScheduleData?.selectedFunction?.length > 0) {
        selectedMapFunctions = auditScheduleData?.selectedFunction
          .map((value: any) => `selectedFunction[]=${value}`)
          .join("&");
        queryUrl = queryUrl + `&${selectedMapFunctions}`;
      }

      const res = await axios.get(queryUrl);
      // console.log("checkaudit api called res", res);

      if (res.status === 200 && scope === "Unit") {
        // console.log("checkaudit res in getAuditPeriodForMonthPlanType", res);
        if (!!res.data?.isFinaliseDatesExist) {
          if (res.data?.data && res?.data?.data?.length) {
            // const auditPeriods = res.data?.data?.map(
            //   (obj: any, index: number) => ({
            //     ...obj,
            //   })
            // );

            const datas = res?.data?.data.flatMap(
              (value: any) => value?.months
            );
            setDate([...new Set(datas)]);
            setAuditPlanEntityWiseId(res?.data?.auditPlanEntityWiseId);
            setIsFinaliseDatesExist(res?.data?.isFinaliseDatesExist);
          } else {
            enqueueSnackbar(
              `No Audit Periods found for this Audit Plan, Can't Schedule`,
              {
                variant: "error",
                autoHideDuration: 2500,
              }
            );
            resetAuditSchedule();

            setIsModalVisible(false);
            // navigate("/audit", { state: { redirectToTab: "AUDIT SCHEDULE" } });
          }
        } else {
          if (res.data?.data && res?.data?.data?.length) {
            const auditPeriods = res.data?.data;

            setDate(auditPeriods);
            setAuditPlanEntityWiseId(res?.data?.auditPlanEntityWiseId);
            setIsFinaliseDatesExist(res?.data?.isFinaliseDatesExist);
          } else {
            enqueueSnackbar(
              `No Audit Periods found for this Audit Plan, Can't Schedule`,
              {
                variant: "error",
                autoHideDuration: 2500,
              }
            );
            resetAuditSchedule();
            setIsModalVisible(false);

            // navigate("/audit", { state: { redirectToTab: "AUDIT SCHEDULE" } });
          }
        }
      } else if (res.status === 200 && scope === "Corporate Function") {
        if (!!res.data?.isFinaliseDatesExist) {
          if (res.data?.data && res?.data?.data?.length) {
            const datas = res?.data?.data.flatMap(
              (value: any) => value?.months
            );
            setDate([...new Set(datas)]);
            // console.log("checkaudit  auditPeriods scope === Corporate Function", auditPeriods);

            setAuditPlanEntityWiseId(res?.data?.auditPlanEntityWiseId);
            setIsFinaliseDatesExist(res?.data?.isFinaliseDatesExist);
          } else {
            enqueueSnackbar(
              `No Audit Periods found for this Audit Plan, Can't Schedule`,
              {
                variant: "error",
                autoHideDuration: 2500,
              }
            );
            resetAuditSchedule();
            setIsModalVisible(false);

            // navigate("/audit", { state: { redirectToTab: "AUDIT SCHEDULE" } });
          }
        } else {
          if (res.data?.data && res?.data?.data?.length) {
            const auditPeriods = res.data?.data;

            setDate(auditPeriods);
            setAuditPlanEntityWiseId(res?.data?.auditPlanEntityWiseId);
            setIsFinaliseDatesExist(res?.data?.isFinaliseDatesExist);
          } else {
            enqueueSnackbar(
              `No Audit Periods found for this Audit Plan, Can't Schedule`,
              {
                variant: "error",
                autoHideDuration: 2500,
              }
            );
            resetAuditSchedule();
            setIsModalVisible(false);

            // navigate("/audit", { state: { redirectToTab: "AUDIT SCHEDULE" } });
          }
        }
      } else {
        if (res.data?.data && res?.data?.data?.auditPeriodArray.length) {
          setDate(
            res?.data?.data?.auditPeriodArray.map(
              (name: any, index: number) => ({
                id: index,
                name: name,
              })
            )
          );
          setAuditPlanEntityIdLookupArray(
            res?.data?.data?.auditPlanEntityIdLookupArray
          );
        } else {
          enqueueSnackbar(
            `No Audit Periods found for this Audit Plan, Can't Schedule`,
            {
              variant: "error",
              autoHideDuration: 2500,
            }
          );
          resetAuditSchedule();
          setIsModalVisible(false);

          // navigate("/audit", { state: { redirectToTab: "AUDIT SCHEDULE" } });
        }
      }
    } catch (error) {
      // console.log("checkaudit error in getAuditPeriodForMonthPlanType", error);
    }
  };

  const getAuditPlanDetailsUnitWiseById = async () => {
    // console.log(
    //   "checkaudit inside getAuditPlanDetailsUnitWiseById",
    //   id,
    //   auditScheduleData.auditPeriod
    // );

    if (!!id && !!auditScheduleData.auditPeriod) {
      await axios(
        `/api/auditPlan/getUnitWiseData/${id}/?date=${auditScheduleData.auditPeriod}`
      )
        .then((res) => {
          // setDataForDate(res.data.auditPlanEntityWise);
          setAuditScheduleData((prev: any) => ({
            ...prev,
            AuditScheduleEntitywise: res.data.auditPlanEntityWise.map(
              (obj: {
                id: string;
                entityId: string;
                entityName: string;
                auditors: any;
                monthNames: any;
              }) => ({
                entityId: obj.entityId,
                name: obj.entityName,
                monthNames: obj?.monthNames,
                time: null,
                auditors: obj?.auditors,
                auditees: [],
                comments: "",
              })
            ),
          }));
        })
        .catch((err) => {});
    }
  };

  const getFunctionList = async () => {
    try {
      const res = await axios.get(`/api/auditSchedule/getFunctionForUser`);
      setFunctionList(res.data);
    } catch (e) {}
  };

  const getEntityListingForMonthType = async () => {
    try {
      //here id is auditPlan Id
      let auditPlanId = from === "plan" ? id : auditScheduleData.planNumber;
      if (
        !!id &&
        !!auditScheduleData.auditPeriod &&
        !!auditScheduleData?.location?.id
      ) {
        let scope: any = auditScheduleData?.scope?.name;

        let selectedMapFunctions;
        if (auditScheduleData?.selectedFunction?.length > 0) {
          selectedMapFunctions = auditScheduleData?.selectedFunction
            .map((value: any) => `selectedFunction[]=${value}`)
            .join("&");
        }

        if (!scope) return;
        const res = await axios.get(
          `/api/auditPlan/getEntityListingForMonthType/${auditPlanId}?month=${auditScheduleData.auditPeriod}&scope=${auditScheduleData?.scope?.name}&locationId=${auditScheduleData?.location?.id}&orgId=${organizationId}&${selectedMapFunctions}`
        );
        // console.log(
        //   "checkaudit res in getAuditPlanDetailsUnitWiseForMonthType",
        //   res
        // );
        if (res.status === 200) {
          // if (res?.data?.functionData && res?.data?.functionData?.length) {
          //   setFunctionList(res?.data?.functionData);
          // } else {
          if (res?.data?.data && res?.data?.data?.length) {
            setDropdownEntities(res?.data?.data);
            if (scope === "Unit") {
              setAuditPlanEntityWiseId(res?.data?.auditPlanEntityWiseId);
            }

            if (scope) {
              setEntityIdToEntityWiseIdMapping(
                res?.data?.entityToEntityWiseMapping
              );
            }
          } else {
            setDropdownEntities([]);
            setAuditPlanEntityWiseId("");
            setEntityIdToEntityWiseIdMapping([]);
            enqueueSnackbar(`${res.data.message}`, {
              variant: "info",
            });
          }
          // }
        } else {
          setDropdownEntities([]);
          setAuditPlanEntityWiseId("");
          setEntityIdToEntityWiseIdMapping([]);
          enqueueSnackbar(
            `Error Occured while fetching departments for selected month`,
            {
              variant: "error",
            }
          );
        }
      }
    } catch (error) {
      setDropdownEntities([]);
      setAuditPlanEntityWiseId("");
      setEntityIdToEntityWiseIdMapping([]);
      // console.log("error in getAuditPlanDetailsUnitWiseForMonthType", error);
      enqueueSnackbar(
        `Error Occured while fetching departments for selected month`,
        {
          variant: "error",
        }
      );
    }
  };

  const getEntityListingForMonthTypeForEditMode = async (
    tableEntries: any = [],
    auditScheduleData: any = {}
  ) => {
    try {
      //here id is auditPlan Id
      let auditPlanId = from === "plan" ? id : auditScheduleData.planNumber;
      if (
        !!id &&
        !!auditScheduleData.auditPeriod &&
        !!auditScheduleData?.location?.id
      ) {
        let scope: any = auditScheduleData?.scope?.name;

        if (!scope) return;
        let selectedMapFunctions;
        if (auditScheduleData?.selectedFunction?.length > 0) {
          selectedMapFunctions = auditScheduleData?.selectedFunction
            ?.map((value: any) => `selectedFunction[]=${value}`)
            .join("&");
        }
        const res = await axios.get(
          `/api/auditPlan/getEntityListingForMonthType/${auditPlanId}?month=${auditScheduleData.auditPeriod}&scope=${auditScheduleData?.scope?.name}&locationId=${auditScheduleData?.location?.id}&orgId=${organizationId}&${selectedMapFunctions}`
        );
        // console.log(
        //   "checkaudit res in getAuditPlanDetailsUnitWiseForMonthType",
        //   res
        // );
        // console.log("checkaudit getEntityListingForMonthTypeForEditMode tableEntries, res.data.data", tableEntries, res.data.data);

        if (res.status === 200) {
          if (res?.data?.data && res?.data?.data?.length) {
            const filteredEntities = res?.data?.data.filter(
              (entity: any) =>
                !tableEntries.some(
                  (schedule: any) => schedule.entityId === entity.id
                )
            );
            setDropdownEntities(filteredEntities);
            if (scope === "Unit") {
              setAuditPlanEntityWiseId(res?.data?.auditPlanEntityWiseId);
            }

            if (scope) {
              setEntityIdToEntityWiseIdMapping(
                res?.data?.entityToEntityWiseMapping
              );
            }
          } else {
            setDropdownEntities([]);
            setAuditPlanEntityWiseId("");
            setEntityIdToEntityWiseIdMapping([]);
            enqueueSnackbar(`${res.data.message}`, {
              variant: "info",
            });
          }
        } else {
          setDropdownEntities([]);
          setAuditPlanEntityWiseId("");
          setEntityIdToEntityWiseIdMapping([]);
          enqueueSnackbar(
            `Error Occured while fetching departments for selected month`,
            {
              variant: "error",
            }
          );
        }
      }
    } catch (error) {
      setDropdownEntities([]);
      setAuditPlanEntityWiseId("");
      setEntityIdToEntityWiseIdMapping([]);
      // console.log("error in getAuditPlanDetailsUnitWiseForMonthType", error);
      enqueueSnackbar(
        `Error Occured while fetching departments for selected month`,
        {
          variant: "error",
        }
      );
    }
  };

  // get schedule details if from is schedule
  const getAuditScheduleDetailsById = async () => {
    // console.log("hello world test now", id, realmName);
    setScheduleFormType("adhoc-edit");
    await axios(`/api/auditSchedule/getAuditScheduleById/${id}/${realmName}`)
      .then((res: any) => {
        // var date = moment(res?.date ?? new Date());
        setRemovedList(
          res.data.auditScheduleEntityWise
            .filter((obj: any) => obj.deleted)
            .map((obj: any) => ({
              id: obj.id,
              entityId: obj.entityId,
              name: obj.entityName,
              time: obj.time,
              auditors: obj.auditor,
              auditees: obj.auditee,
              monthNames: obj?.monthNames,
              combinedDate: obj?.combinedDate,
              comments: obj.comments,
              areas: obj.areas,
              auditTemplate: obj.auditTemplateId,
              deleted: obj.deleted,
            }))
        );
        let data: any = {
          auditScheduleName: res.data.auditScheduleName,
          auditName: res.data.auditName,
          createdBy: res.data.createdBy,
          auditNumber: res.data.auditNumber,
          auditType: res.data.auditType,
          // auditPeriod: res?.data?.auditPeriod,
          selectedFunction: res?.data?.selectedFunction || [],
          // period: res.data.period,
          planType: res.data.planType,
          createdOn: abstractDate(res.data.createdAt),
          prefixSuffix: res.data.prefixSuffix,
          systemType: res.data.systemTypeId,
          auditTypeName: res?.data?.auditTypeName || "",

          useFunctionsForPlanning: res?.data?.useFunctionsForPlanning,
          // systemName: res.data.systemMasterId,
          systemName: res.data.systemMaster.map((value: any) => value._id),
          systems: res?.data?.systemMaster.map((value: any) => ({
            item: {
              id: value._id,
              name: value.name,
            },
          })) || [{ item: {} }],
          clause_refs: res?.data?.clause_refs || [],
          sop_refs: res?.data?.sop_refs || [],
          hira_refs: res?.data?.hira_refs || [],
          capa_refs: res?.data?.capa_refs || [],
          auditScope: res?.data?.auditScope,
          scheduleNumber: res.data.auditScheduleNumber,
          year: res.data.auditYear,
          location: {
            id: res.data.locationId,
            locationName: res.data.location,
          },
          planNumber: res.data.auditPlanId,
          scope: {
            id: res.data.entityTypeId,
            name: res.data.entityType,
          },
          role: res.data.roleId,
          isDraft: res.data?.isDraft,
          minDate: res.data.auditPeriod[0],
          maxDate: res.data.auditPeriod[1],
          template: res.data.auditTemplateId,
          auditTemplates: res.data?.auditTemplates || [],
          AuditScheduleEntitywise: res.data.auditScheduleEntityWise
            // .filter((item: any) => !item.deleted)
            .map((obj: any) => ({
              id: obj.id,
              entityId: obj.entityId,
              name: obj.entityName,
              time: obj.time,
              auditors: obj.auditor,
              auditees: obj.auditee,
              monthNames: obj?.monthNames,
              combinedDate: obj?.combinedDate,
              comments: obj.comments,
              areas: obj.areas,
              auditTemplate: obj.auditTemplateId,
              auditTemplates: obj?.auditTemplates || [],
              deleted: obj.deleted,
            })),
        };

        if (!!res?.data?.auditScheduleEntityWise?.length) {
          data = {
            ...data,
            auditPeriod: res?.data?.auditPeriod,
          };
        }
        setAuditScheduleData(data);
        setIsScheduleInDraft(res.data?.isDraft);
        // console.log("checkaudit from --->", auditScheduleData);
        if (res?.data && res?.data?.isAiGenerated) {
          if (
            res?.data?.completion_status.hira === true ||
            res?.data?.completion_status.sop === true
          ) {
            setScheduleCreationLoader(false);
          } else {
            setScheduleCreationLoader(true);
          }
        } else {
          setScheduleCreationLoader(false);
        }

        if (
          scheduleFormType === "adhoc-edit" &&
          res.data.auditPlanId === "No plan"
        ) {
          // console.log(
          //   "checkaudit inside getAuditScheduleDetailsById adhoc-edit"
          // );

          initialiseEntitiesForEditMode(
            res.data.auditScheduleEntityWise,
            res.data.locationId,
            res.data.entityTypeId
          );
        } else if (res.data.auditPlanId !== "No plan") {
          if (res.data.isDraft) {
            if (res.data?.auditPeriod.includes("-")) {
              //this doesnt has to be done, once schedule has been created with whatever depts, it can be anymore added in edit mode
              // enqueueSnackbar(``)
            } else {
              getEntityListingForMonthTypeForEditMode(
                res.data.auditScheduleEntityWise,
                data
              );
            }
          }
        }

        if (userDetails?.location?.id !== res?.data?.locationId) {
          setDisableEditScheduleForOtherUnit(true);
          setIsScheduleInDraft(false);
        }
      })
      .catch((err) => {});
  };

  function checkForTimeConflicts(auditScheduleEntities: any) {
    let conflicts: any = [];

    // Function to parse date-time string into Date object
    const parseDateTime = (dateTimeStr: any) => new Date(dateTimeStr);

    // Function to add 30 minutes to a Date object
    const addHalfHour = (date: any) => new Date(date.getTime() + 30 * 60000);

    for (let i = 0; i < auditScheduleEntities.length; i++) {
      const entityA = auditScheduleEntities[i];
      const startTimeA = parseDateTime(entityA.time);
      const endTimeA = addHalfHour(startTimeA);

      for (let j = 0; j < auditScheduleEntities.length; j++) {
        if (i !== j) {
          const entityB = auditScheduleEntities[j];
          const startTimeB = parseDateTime(entityB.time);
          const endTimeB = addHalfHour(startTimeB);

          const isTimeOverlapping =
            startTimeA < endTimeB && endTimeA > startTimeB;

          // Check conflicts between auditors and auditees across all entities
          entityA.auditors.forEach((auditorA: any) => {
            entityB.auditors.forEach((auditorB: any) => {
              if (auditorA.id === auditorB.id && isTimeOverlapping) {
                addConflict(
                  "Auditor-Auditor Conflict",
                  auditorA,
                  entityA,
                  entityB,
                  startTimeA,
                  endTimeA,
                  startTimeB,
                  endTimeB
                );
              }
            });

            entityB.auditees.forEach((auditeeB: any) => {
              if (auditorA.id === auditeeB.id && isTimeOverlapping) {
                addConflict(
                  "Auditor-Auditee Conflict",
                  auditorA,
                  entityA,
                  entityB,
                  startTimeA,
                  endTimeA,
                  startTimeB,
                  endTimeB
                );
              }
            });
          });
        }
      }
    }

    setConflicts(conflicts);

    const hasAuditorAuditeeConflict = conflicts.some(
      (conflict: any) => conflict.conflictType === "Auditor-Auditee Conflict"
    );
    const hasAuditorAuditorConflict = conflicts.some(
      (conflict: any) => conflict.conflictType === "Auditor-Auditor Conflict"
    );

    const usersSet = new Set();
    conflicts.forEach((conflict: any) => {
      conflict.personIdArray.forEach((id: string) => usersSet.add(id));
    });

    const usersIdArray: any = Array.from(usersSet);

    const personNamesArray = usersIdArray
      ?.map((userId: any) => {
        for (const entity of auditScheduleData.AuditScheduleEntitywise) {
          const user: any = entity.auditors.find(
            (auditor: any) => auditor?.id === userId
          );
          if (user) {
            return user?.firstname + " " + user?.lastname;
          }
        }
        return null; // Return null or a placeholder if the user is not found
      })
      .filter((name: any) => name !== null); // Filter out any null values

    // console.log("checkaudit personNamesArray", personNamesArray);

    // //get usernames from auditScheduleEntityWise array of objects by matching id from usersIdArray
    // console.log("checkaudit usersIdArray", usersIdArray);
    // console.log(
    //   "checkaudit auditScheduleEntities",
    //   auditScheduleData?.AuditScheduleEntitywise
    // );

    let conflictMessage;

    if (hasAuditorAuditeeConflict && hasAuditorAuditorConflict) {
      conflictMessage = (
        <span>
          <b>Auditor-Auditee</b> and <b>Auditor-Auditor</b> conflict found with
          users <b>{personNamesArray?.join(",") || "N/A"}</b> in the same time
          span of 30 minutes.
        </span>
      );
    } else if (hasAuditorAuditeeConflict) {
      conflictMessage = (
        <span>
          <b>Auditor-Auditee</b> conflict found with users{" "}
          <b> {personNamesArray?.join(",") || "N/A"}</b> in the same time span
          of 30 minutes.
        </span>
      );
    } else if (hasAuditorAuditorConflict) {
      conflictMessage = (
        <span>
          <b>Auditor-Auditor</b> conflict found with users{" "}
          <b>{personNamesArray?.join(",") || "N/A"}</b> in the same time span of
          30 minutes.
        </span>
      );
    }

    // Set the message in the state
    setConflictMessage(conflictMessage);
    return conflicts;

    function addConflict(
      type: any,
      person: any,
      entityA: any,
      entityB: any,
      startTimeA: any,
      endTimeA: any,
      startTimeB: any,
      endTimeB: any
    ) {
      conflicts.push({
        conflictType: type,
        personIdArray: [person.id],
        entityIdArray: [entityA.entityId, entityB.entityId],
        personName: `${person.firstname} ${person.lastname}`,
        entityA: entityA.entityName,
        entityB: entityB.entityName,
        startTimeA: startTimeA.toISOString(),
        endTimeA: endTimeA.toISOString(),
        startTimeB: startTimeB.toISOString(),
        endTimeB: endTimeB.toISOString(),
      });
    }
  }

  const handleSubmitCheckConflicts = (type: any = "") => {
    // console.log("checkaudit inside handleSubmitCheckConflicts auditScheduleData", auditScheduleData);
    // console.log("checkaudit inside handleSubmitCheckConflicts validateSheduleForAtleastOneDept", validateSheduleForAtleastOneDept());

    try {
      if (!validateSheduleForAtleastOneDept()) {
        enqueueSnackbar(`Please Schedule Atleast One Department`, {
          variant: "error",
        });
        return;
      }
      // console.log("checkaudit teamLeadId in handleSubmit Check conlicfts",  teamLeadId);

      if (teamLeadId && !validateAuditScheduleForm3()) {
        if (userDetails?.id !== teamLeadId) {
          enqueueSnackbar(
            "Team Lead is found, Auditors And Checklist Has to Be Finalised By Team Lead",
            {
              variant: "warning",
              autoHideDuration: 3000,
            }
          );
          return;
        } else {
          enqueueSnackbar(
            "Please Fill All the Details Including Auditors And Checklist",
            {
              variant: "warning",
              autoHideDuration: 3000,
            }
          );
          return;
        }
      }

      if (auditScheduleData.auditScheduleName && validateAuditScheduleForm3()) {
        const conflicts = checkForTimeConflicts(
          auditScheduleData?.AuditScheduleEntitywise
        );

        if (!!conflicts && !!conflicts?.length) {
          // const uniqueEntityIds = getUniqueEntityIds(conflicts);
          // if(uniqueEntityIds && uniqueEntityIds.length){
          //   setEditableRowIds(uniqueEntityIds);
          // }
          setConflictModalOpen(true);
          return; // Stop further execution until user responds to modal
        } else {
          // console.log("checkaudit open modal");

          setLockScheduleModalOpen(true);
          return;
        }
      } else {
        enqueueSnackbar(`Please fill all required fields`, {
          variant: "error",
        });
      }
      return;
    } catch (error) {
      enqueueSnackbar(`Error Occured while checking conflicts`, {
        variant: "error",
      });
    }
  };

  // post API here
  const handleCreate = async (type: any = "") => {
    if (!validateSheduleForAtleastOneDept()) {
      enqueueSnackbar(`Please Schedule Atleast One Department`, {
        variant: "error",
      });
      return;
    }

    const hasOverlap = auditScheduleData.AuditScheduleEntitywise?.some(
      (item) => {
        const auditorIds =
          item?.auditors?.map((auditor: any) => auditor?.id) || [];
        const auditeeIds =
          item?.auditees?.map((auditee: any) => auditee?.id) || [];

        // Check for any overlapping user ID
        return auditorIds.some((id) => auditeeIds.includes(id));
      }
    );

    if (hasOverlap) {
      // console.error("Auditee and Auditor cannot have overlapping users.");
      enqueueSnackbar(`Auditee and Auditor cannot have overlapping users.`, {
        variant: "error",
      });
      // Or return true / throw error etc., depending on your flow
      return;
    }
    // console.log("checkaudit teamlead id in handlecreate", teamLeadId);

    if (auditScheduleData.auditScheduleName && validateAuditScheduleForm3()) {
      const response = await axios.get(
        `/api/serial-number/generateSerialNumber?moduleType=Audit Schedule&location=${auditScheduleData.location.id}&createdBy=${userInfo?.id}&organizationId=${organizationId}`
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
      const transformedValue = generatedValue
        .split("MM")
        .join(currentMonth)
        .split("YY")
        .join(currentYear)
        .split("LocationId")
        .join(isOrgAdmin ? locationNo : LocationId)
        .split("DepartmentId")
        .join(isOrgAdmin ? "MCOE Department" : EntityId);

      const sop_refs = Object.values(
        auditScheduleData.sop_refs.reduce((acc: any, { id, entityId }: any) => {
          if (!acc[entityId]) {
            acc[entityId] = { entityId, reference_ids: [] };
          }
          acc[entityId].reference_ids.push(id);
          return acc;
        }, {} as Record<string, { entityId: string; reference_ids: string[] }>)
      );

      const hira_refs = Object.values(
        auditScheduleData.hira_refs.reduce(
          (acc: any, { _id, entityId }: any) => {
            if (!acc[entityId]) {
              acc[entityId] = { entityId, reference_ids: [] };
            }
            acc[entityId].reference_ids.push(_id);
            return acc;
          },
          {} as Record<string, { entityId: string; reference_ids: string[] }>
        )
      );

      const capa_refs = Object.values(
        auditScheduleData.capa_refs.reduce(
          (acc: any, { _id, entityId }: any) => {
            if (!acc[entityId]) {
              acc[entityId] = { entityId, reference_ids: [] };
            }
            acc[entityId].reference_ids.push(_id);
            return acc;
          },
          {} as Record<string, { entityId: string; reference_ids: string[] }>
        )
      );
      const temp = {
        // auditPeriod: [auditScheduleData.minDate, auditScheduleData.maxDate],
        // period: date,
        auditYear: auditPlanYear,
        auditPeriod: auditScheduleData.auditPeriod,
        auditScheduleName:
          type == "duplicate"
            ? `${auditScheduleData.auditScheduleName} copy`
            : auditScheduleData.auditScheduleName,
        auditNumber: auditScheduleData.auditNumber,
        auditScheduleNumber: auditScheduleData.scheduleNumber,
        status: "active",
        createdBy: auditScheduleData.createdBy,
        auditTemplateId: auditScheduleData.template,
        roleId: auditScheduleData.role,
        auditType: auditScheduleData.auditType,
        entityTypeId: auditScheduleData.scope.id,
        auditPlanId: auditScheduleData.planNumber,
        isDraft: false,
        locationId: auditScheduleData.location.id,
        systemTypeId: auditScheduleData.systemType,
        systemMasterId: auditScheduleData.systemName,
        clause_refs: auditScheduleData.clause_refs.map((item: any) => item._id),
        prefixSuffix: transformedValue,
        selectedFunction: auditScheduleData.selectedFunction || [],
        auditTemplates: auditScheduleData.auditTemplates || [],
        useFunctionsForPlanning: auditScheduleData.useFunctionsForPlanning,
        auditScheduleEntityWise: auditScheduleData.AuditScheduleEntitywise
          // .filter((obj: any) => !obj.deleted)
          .map((obj: any) => ({
            entityId: obj.entityId,
            time: obj.time,
            auditor: Array.isArray(obj.auditors)
              ? obj.auditors
                  .filter((id: any) => id !== null && id !== undefined)
                  .map((a: any) => (a?.id ? a?.id : a))
              : [],
            auditee: Array.isArray(obj.auditees)
              ? obj.auditees
                  .filter((id: any) => id !== null && id !== undefined)
                  .map((a: any) => (a?.id ? a?.id : a))
              : [],
            comments: obj.comments,
            // monthNames: obj?.monthNames,
            auditTemplate: obj.auditTemplate,
            auditTemplates: obj.auditTemplates || [],
            areas: obj.areas,
          })),
        sop_refs: sop_refs,
        hira_refs: hira_refs,
        capa_refs: capa_refs,
        auditScope: auditScheduleData.auditScope,
      };

      setIsLoading(false);
      try {
        let res = await axios.post(
          `api/auditSchedule/createAuditSchedule`,
          temp
        );

        if (res.status === 200 || res.status === 201) {
          setIsLoading(false);
          if (!!type && type == "duplicate") {
            navigate(`/audit`);
            enqueueSnackbar(`Audit Schedule Duplicated Successfully!`, {
              variant: "success",
            });
          } else {
            enqueueSnackbar(`successfully created`, {
              variant: "success",
            });
            // if (res.data._id) {
            //   localStorage.setItem("auditSchId",res.data._id)
            //   const protocol = process.env.REACT_APP_API_URL?.split(":")[0]
            //   const redirectUri = protocol + "://" + process.env.REACT_APP_REDIRECT_URL + "/calRedirect"
            //   const msCalDtls = await axios.get(`/api/connected-apps/getConnectedAppByName?name=${process.env.REACT_APP_MS_CALENDAR}`)
            //   const url = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?"+
            //                     `scope=${msCalDtls.data.description}` +
            //                     "&response_type=code" +
            //                     "&response_mode=query" +
            //                     "&state=calendarTest" +
            //                     `&redirect_uri=${redirectUri}`+
            //                     `&client_id=${msCalDtls.data.clientId}`
            //   window.location.href = url;
            // }
            if (!modalWindow) {
              navigate("/audit");
            } else {
              navigate(`/audit`);
              setIsModalVisible(false);
            }
          }
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        // console.log("error ");
        setIsLoading(false);
        // if (res.status === 404) {
        //   enqueueSnackbar(`Error Occured while sending mail`, {
        //     variant: "error",
        //   });
        // }
        enqueueSnackbar(`Error Occured while creating audit Schedule`, {
          variant: "error",
        });
      }
    } else {
      enqueueSnackbar(`Please fill all required fields`, {
        variant: "error",
      });
      setIsLoading(false);
    }
  };

  const handleSaveAsDraftForDuplicate = async () => {
    setIsLoading(true);

    const hasOverlap = auditScheduleData.AuditScheduleEntitywise?.some(
      (item) => {
        const auditorIds =
          item?.auditors?.map((auditor: any) => auditor?.id) || [];
        const auditeeIds =
          item?.auditees?.map((auditee: any) => auditee?.id) || [];

        // Check for any overlapping user ID
        return auditorIds.some((id) => auditeeIds.includes(id));
      }
    );

    if (hasOverlap) {
      // console.error("Auditee and Auditor cannot have overlapping users.");
      enqueueSnackbar(`Auditee and Auditor cannot have overlapping users.`, {
        variant: "error",
      });
      // Or return true / throw error etc., depending on your flow
      return;
    }
    if (auditScheduleData.auditScheduleName && validateAuditScheduleForm3()) {
      const sop_refs = Object.values(
        auditScheduleData.sop_refs.reduce((acc: any, { id, entityId }: any) => {
          if (!acc[entityId]) {
            acc[entityId] = { entityId, reference_ids: [] };
          }
          acc[entityId].reference_ids.push(id);
          return acc;
        }, {} as Record<string, { entityId: string; reference_ids: string[] }>)
      );

      const hira_refs = Object.values(
        auditScheduleData.hira_refs.reduce(
          (acc: any, { _id, entityId }: any) => {
            if (!acc[entityId]) {
              acc[entityId] = { entityId, reference_ids: [] };
            }
            acc[entityId].reference_ids.push(_id);
            return acc;
          },
          {} as Record<string, { entityId: string; reference_ids: string[] }>
        )
      );

      const capa_refs = Object.values(
        auditScheduleData.capa_refs.reduce(
          (acc: any, { _id, entityId }: any) => {
            if (!acc[entityId]) {
              acc[entityId] = { entityId, reference_ids: [] };
            }
            acc[entityId].reference_ids.push(_id);
            return acc;
          },
          {} as Record<string, { entityId: string; reference_ids: string[] }>
        )
      );

      const temp = {
        // auditPeriod: [auditScheduleData.minDate, auditScheduleData.maxDate],
        // period: date,
        auditYear: auditPlanYear,
        auditPeriod: auditScheduleData.auditPeriod,
        auditScheduleName: `${auditScheduleData.auditScheduleName} copy`,
        auditNumber: auditScheduleData.auditNumber,
        auditScheduleNumber: auditScheduleData.scheduleNumber,
        status: "active",
        createdBy: auditScheduleData.createdBy,
        auditTemplateId: auditScheduleData.template,
        roleId: auditScheduleData.role,
        auditType: auditScheduleData.auditType,
        entityTypeId: auditScheduleData.scope.id,
        auditPlanId: auditScheduleData.planNumber,
        isDraft: true,
        locationId: auditScheduleData.location.id,
        systemTypeId: auditScheduleData.systemType,
        systemMasterId: auditScheduleData.systemName,
        clause_refs: auditScheduleData.clause_refs.map((item: any) => item._id),
        useFunctionsForPlanning: auditScheduleData.useFunctionsForPlanning,
        auditTemplates: auditScheduleData.auditTemplates || [],
        auditScheduleEntityWise: auditScheduleData.AuditScheduleEntitywise
          // .filter((obj: any) => !obj.deleted)
          .map((obj: any) => ({
            entityId: obj.entityId,
            time: obj.time,
            auditor: Array.isArray(obj.auditors)
              ? obj.auditors
                  .filter((id: any) => id !== null && id !== undefined)
                  .map((a: any) => (a?.id ? a?.id : a))
              : [],
            auditee: Array.isArray(obj.auditees)
              ? obj.auditees
                  .filter((id: any) => id !== null && id !== undefined)
                  .map((a: any) => (a?.id ? a?.id : a))
              : [],
            comments: obj.comments,
            // monthNames: obj?.monthNames,
            auditTemplate: obj.auditTemplate,
            auditTemplates: obj.auditTemplates || [],
            areas: obj.areas,
          })),
        sop_refs: sop_refs,
        hira_refs: hira_refs,
        capa_refs: capa_refs,
        auditScope: auditScheduleData.auditScope,
      };
      setIsScheduleInDraft(true);

      setIsLoading(false);

      try {
        let res = await axios.post(
          `api/auditSchedule/createAuditSchedule`,
          temp
        );
        if (res.status === 200 || res.status === 201) {
          setIsLoading(false);
          navigate(
            `/audit/auditschedule/auditscheduleform/schedule/${res.data._id}`
          );
          enqueueSnackbar(`Audit Schedule Duplicated Successfully!`, {
            variant: "success",
          });
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        setIsLoading(false);
        enqueueSnackbar(`Error Occured while creating audit Schedule`, {
          variant: "error",
        });
      }
    } else {
      enqueueSnackbar(`Please fill all required fields`, {
        variant: "error",
      });
      setIsLoading(false);
    }
  };

  const handleUpdate = async (isDraft: any = false) => {
    if (!validateSheduleForAtleastOneDept() && !isDraft) {
      enqueueSnackbar(`Please Schedule Atleast One Department`, {
        variant: "error",
      });
      return;
    }
    if (auditScheduleData.auditScheduleName && validateAuditScheduleForm3()) {
      setIsLoading(true);
      const sop_refs = Object.values(
        auditScheduleData.sop_refs.reduce((acc: any, { id, entityId }: any) => {
          if (!acc[entityId]) {
            acc[entityId] = { entityId, reference_ids: [] };
          }
          acc[entityId].reference_ids.push(id);
          return acc;
        }, {} as Record<string, { entityId: string; reference_ids: string[] }>)
      );

      const hira_refs = Object.values(
        auditScheduleData.hira_refs.reduce(
          (acc: any, { _id, entityId }: any) => {
            if (!acc[entityId]) {
              acc[entityId] = { entityId, reference_ids: [] };
            }
            acc[entityId].reference_ids.push(_id);
            return acc;
          },
          {} as Record<string, { entityId: string; reference_ids: string[] }>
        )
      );

      const capa_refs = Object.values(
        auditScheduleData.capa_refs.reduce(
          (acc: any, { _id, entityId }: any) => {
            if (!acc[entityId]) {
              acc[entityId] = { entityId, reference_ids: [] };
            }
            acc[entityId].reference_ids.push(_id);
            return acc;
          },
          {} as Record<string, { entityId: string; reference_ids: string[] }>
        )
      );
      const temp = {
        // auditPeriod: [auditScheduleData.minDate, auditScheduleData.maxDate],
        // period: date,
        auditPeriod: auditScheduleData.auditPeriod,
        auditYear: auditScheduleData.year,
        auditNumber: auditScheduleData.auditNumber,
        auditScheduleName: auditScheduleData.auditScheduleName,
        auditScheduleNumber: auditScheduleData.scheduleNumber,
        status: "active",
        selectedFunction: auditScheduleData.selectedFunction,

        createdBy: auditScheduleData.createdBy,
        auditTemplateId: auditScheduleData.template,
        roleId: auditScheduleData.role,
        isDraft: isDraft,
        auditTemplates: auditScheduleData.auditTemplates || [],
        // entityTypeId: JSON.parse(auditScheduleData.scope).id,
        auditPlanId: auditScheduleData.planNumber,
        locationId: auditScheduleData.location.id,
        systemTypeId: auditScheduleData.systemType,
        systemMasterId: auditScheduleData.systemName,
        clause_refs: auditScheduleData.clause_refs.map((item: any) => item._id),
        useFunctionsForPlanning: auditScheduleData.useFunctionsForPlanning,
        auditScheduleEntityWise: auditScheduleData.AuditScheduleEntitywise
          // .filter((obj: any) => !obj.deleted)
          .map((obj) => ({
            id: obj.id,
            entityId: obj.entityId,
            time: obj.time,
            auditor: obj.auditors,
            auditee: obj.auditees,
            comments: obj.comments,
            auditTemplate: obj.auditTemplate,
            auditTemplates: obj.auditTemplates || [],
            // deleted: true,
          })),
        sop_refs: sop_refs,
        hira_refs: hira_refs,
        capa_refs: capa_refs,
        auditScope: auditScheduleData.auditScope,
      };

      try {
        let res = await axios.put(
          `/api/auditSchedule/updateAuditSchedule/${id}`,
          temp
        );
        if (res.status === 200 || res.status === 201) {
          try {
            await axios.put(`/api/auditSchedule/sendMailForHead/${id}`);
            // if (id && !isDraft) {
            //   localStorage.setItem("auditSchId",id)
            //   const protocol = process.env.REACT_APP_API_URL?.split(":")[0]
            //   const redirectUri = protocol + "://" + process.env.REACT_APP_REDIRECT_URL + "/calRedirect"
            //   const msCalDtls = await axios.get(`/api/connected-apps/getConnectedAppByName?name=${process.env.REACT_APP_MS_CALENDAR}`)
            //   const url = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?"+
            //                     `scope=${msCalDtls.data.description}` +
            //                     "&response_type=code" +
            //                     "&response_mode=query" +
            //                     "&state=calendarTest" +
            //                     `&redirect_uri=${redirectUri}`+
            //                     `&client_id=${msCalDtls.data.clientId}`
            //   window.location.href = url;
            // }
          } catch (error) {
            enqueueSnackbar(`Error occured while sending mail`, {
              variant: "error",
            });
          }
        }
        setIsLoading(false);
        enqueueSnackbar(`successfully updated`, {
          variant: "success",
        });
        if (!modalWindow) {
          navigate("/audit");
        } else {
          navigate("/audit");
          setIsModalVisible(false);
        }
      } catch (err) {
        setIsLoading(false);
        enqueueSnackbar(`Error Occured while creating audit Schedule`, {
          variant: "error",
        });
      }
    } else {
      enqueueSnackbar(`Please fill all required fields`, {
        variant: "error",
      });
    }
  };

  const sendMailToTeamLead = async (
    auditScheduleData: any,
    scheduleId: any,
    isUpdate: any = false
  ) => {
    try {
      let url;
      if (process.env.REACT_APP_REDIRECT_URL?.includes("adityabirla.com")) {
        url = `${process.env.REACT_APP_REDIRECT_URL}/audit/auditschedule/auditscheduleform/schedule/${scheduleId}`;
      } else {
        url = `${realmName}.${process.env.REACT_APP_REDIRECT_URL}/audit/auditschedule/auditscheduleform/schedule/${scheduleId}`;
      }
      const scheduleDetails = {
        finalisedDate: auditScheduleData?.auditPeriod,
        locationId: auditScheduleData?.locationId,
      };
      const bodyData = {
        teamLeadId,
        user: userDetails,
        scheduleDetails,
        url,
        isUpdate: isUpdate,
      };
      const res = await axios.post(
        `/api/auditSchedule/sendMailToTeamLead`,
        bodyData
      );
      if (res?.status === 200 || res?.status === 201) {
        enqueueSnackbar(
          `Mail Has Been Sent To Team Lead to Finalise Auditors & Checklist!`,
          {
            variant: "success",
            autoHideDuration: 2500,
          }
        );
      }
      try {
        const payload = {
          teamLeadId,
          auditScheduleId: scheduleId,
        };
        const result = await axios.post(
          `/api/auditSchedule/createTeamLeadEntry`,
          payload
        );
      } catch (error) {
        // console.log("error writing into teamleadschema");
      }
    } catch (error) {
      // console.log("checkaudit6 error in sendmail toteam lead", error);
    }
  };

  const handleSaveAsDraft = async (type: any = "") => {
    if (!validateSheduleForAtleastOneDept()) {
      enqueueSnackbar(`Please Schedule Atleast One Department`, {
        variant: "error",
      });
      return;
    }
    // setIsLoading(true);

    const hasOverlap = auditScheduleData.AuditScheduleEntitywise?.some(
      (item) => {
        const auditorIds =
          item?.auditors?.map((auditor: any) => auditor?.id) || [];
        const auditeeIds =
          item?.auditees?.map((auditee: any) => auditee?.id) || [];

        // Check for any overlapping user ID
        return auditorIds.some((id) => auditeeIds.includes(id));
      }
    );

    if (hasOverlap) {
      // console.error("Auditee and Auditor cannot have overlapping users.");
      enqueueSnackbar(`Auditee and Auditor cannot have overlapping users.`, {
        variant: "error",
      });
      // Or return true / throw error etc., depending on your flow
      return;
    }

    if (auditScheduleData.auditScheduleName) {
      const sop_refs = Object.values(
        auditScheduleData.sop_refs.reduce((acc: any, { id, entityId }: any) => {
          if (!acc[entityId]) {
            acc[entityId] = { entityId, reference_ids: [] };
          }
          acc[entityId].reference_ids.push(id);
          return acc;
        }, {} as Record<string, { entityId: string; reference_ids: string[] }>)
      );

      const hira_refs = Object.values(
        auditScheduleData.hira_refs.reduce(
          (acc: any, { _id, entityId }: any) => {
            if (!acc[entityId]) {
              acc[entityId] = { entityId, reference_ids: [] };
            }
            acc[entityId].reference_ids.push(_id);
            return acc;
          },
          {} as Record<string, { entityId: string; reference_ids: string[] }>
        )
      );

      const capa_refs = Object.values(
        auditScheduleData.capa_refs.reduce(
          (acc: any, { _id, entityId }: any) => {
            if (!acc[entityId]) {
              acc[entityId] = { entityId, reference_ids: [] };
            }
            acc[entityId].reference_ids.push(_id);
            return acc;
          },
          {} as Record<string, { entityId: string; reference_ids: string[] }>
        )
      );

      const temp = {
        // auditPeriod: [auditScheduleData.minDate, auditScheduleData.maxDate],
        // period: date,
        auditYear: auditPlanYear,
        auditPeriod: auditScheduleData.auditPeriod,
        auditScheduleName:
          type == "duplicate"
            ? `${auditScheduleData.auditScheduleName} copy`
            : auditScheduleData.auditScheduleName,
        auditNumber: auditScheduleData.auditNumber,
        auditScheduleNumber: auditScheduleData.scheduleNumber,
        status: "active",
        createdBy: auditScheduleData.createdBy,
        auditTemplateId: auditScheduleData.template,
        roleId: auditScheduleData.role,
        auditType: auditScheduleData.auditType,
        entityTypeId: auditScheduleData.scope.id,
        auditPlanId: auditScheduleData.planNumber,

        locationId: auditScheduleData.location.id,
        systemTypeId: auditScheduleData.systemType,
        systemMasterId: auditScheduleData.systemName,
        clause_refs: auditScheduleData.clause_refs.map((item: any) => item._id),
        selectedFunction: auditScheduleData?.selectedFunction || [],
        isDraft: true,
        auditTemplates: auditScheduleData.auditTemplates || [],
        useFunctionsForPlanning: auditScheduleData.useFunctionsForPlanning,
        // prefixSuffix: transformedValue,
        auditScheduleEntityWise: auditScheduleData.AuditScheduleEntitywise
          // .filter((obj: any) => !obj.deleted)
          .map((obj: any) => ({
            entityId: obj.entityId,
            time: obj.time,
            auditor: Array.isArray(obj.auditors)
              ? obj.auditors
                  .filter((id: any) => id !== null && id !== undefined)
                  .map((a: any) => (a?.id ? a?.id : a))
              : [],
            auditee: Array.isArray(obj.auditees)
              ? obj.auditees
                  .filter((id: any) => id !== null && id !== undefined)
                  .map((a: any) => (a?.id ? a?.id : a))
              : [],
            comments: obj.comments,
            // monthNames: obj?.monthNames,
            auditTemplate: obj.auditTemplate,
            auditTemplates: obj.auditTemplates || [],
            areas: obj.areas,
          })),
        sop_refs: sop_refs,
        hira_refs: hira_refs,
        capa_refs: capa_refs,
        auditScope: auditScheduleData.auditScope,
      };
      setIsScheduleInDraft(true);

      setIsLoading(false);

      if (!!id && from === "schedule") {
        try {
          let res = await axios.put(
            `/api/auditSchedule/updateAuditSchedule/${id}`,
            temp
          );
          setIsLoading(false);
          enqueueSnackbar(`successfully saved as draft`, {
            variant: "success",
          });

          if (!!teamLeadId) {
            sendMailToTeamLead(temp, id, true);
          }
          if (!modalWindow) {
            navigate("/audit");
          } else {
            navigate("/audit");
            setIsModalVisible(false);
          }
        } catch (err) {
          setIsLoading(false);
          enqueueSnackbar(`Error Occured while creating audit Schedule`, {
            variant: "error",
          });
        }
      } else {
        try {
          let res = await axios.post(
            `api/auditSchedule/createAuditSchedule`,
            temp
          );
          if (res.status === 200 || res.status === 201) {
            setIsLoading(false);

            if (!!teamLeadId) {
              sendMailToTeamLead(temp, res?.data?._id, false);
            }
            if (!!type && type == "duplicate") {
              navigate(
                `/audit/auditschedule/auditscheduleform/schedule/${res.data._id}`
              );
              enqueueSnackbar(`Audit Schedule Duplicated Successfully!`, {
                variant: "success",
              });
            } else {
              enqueueSnackbar(`successfully Saved As Draft`, {
                variant: "success",
              });
              if (!modalWindow) {
                navigate("/audit");
              } else {
                navigate("/audit");
                setIsModalVisible(false);
              }
            }
          } else {
            setIsLoading(false);
          }
        } catch (err) {
          setIsLoading(false);
          enqueueSnackbar(`Error Occured while creating audit Schedule`, {
            variant: "error",
          });
        }
      }
    } else {
      enqueueSnackbar(`Please fill all required fields`, {
        variant: "error",
      });
      setIsLoading(false);
    }
  };

  //below new update function just update schedule details and not schedule entity wise data
  const handleUpdateOnlyScheduleDetails = async (isDraft: any = false) => {
    if (auditScheduleData.auditScheduleName && validateAuditScheduleForm3()) {
      // setIsLoading(true);
      const sop_refs = Object.values(
        auditScheduleData.sop_refs.reduce((acc: any, { id, entityId }: any) => {
          if (!acc[entityId]) {
            acc[entityId] = { entityId, reference_ids: [] };
          }
          acc[entityId].reference_ids.push(id);
          return acc;
        }, {} as Record<string, { entityId: string; reference_ids: string[] }>)
      );

      const hira_refs = Object.values(
        auditScheduleData.hira_refs.reduce(
          (acc: any, { _id, entityId }: any) => {
            if (!acc[entityId]) {
              acc[entityId] = { entityId, reference_ids: [] };
            }
            acc[entityId].reference_ids.push(_id);
            return acc;
          },
          {} as Record<string, { entityId: string; reference_ids: string[] }>
        )
      );

      const capa_refs = Object.values(
        auditScheduleData.capa_refs.reduce(
          (acc: any, { _id, entityId }: any) => {
            if (!acc[entityId]) {
              acc[entityId] = { entityId, reference_ids: [] };
            }
            acc[entityId].reference_ids.push(_id);
            return acc;
          },
          {} as Record<string, { entityId: string; reference_ids: string[] }>
        )
      );
      const temp = {
        // auditPeriod: [auditScheduleData.minDate, auditScheduleData.maxDate],
        // period: date,
        auditPeriod: auditScheduleData.auditPeriod,
        auditYear: auditScheduleData.year,
        auditNumber: auditScheduleData.auditNumber,
        auditScheduleName: auditScheduleData.auditScheduleName,
        auditScheduleNumber: auditScheduleData.scheduleNumber,
        status: "active",
        createdBy: auditScheduleData.createdBy,
        auditTemplateId: auditScheduleData.template,
        roleId: auditScheduleData.role,
        // entityTypeId: JSON.parse(auditScheduleData.scope).id,
        auditPlanId: auditScheduleData.planNumber,
        locationId: auditScheduleData.location.id,
        systemTypeId: auditScheduleData.systemType,
        systemMasterId: auditScheduleData.systemName,
        clause_refs: auditScheduleData.clause_refs.map((item: any) => item._id),
        isDraft: isDraft,
        auditTemplates: auditScheduleData.auditTemplates || [],
        useFunctionsForPlanning: auditScheduleData.useFunctionsForPlanning,
        sop_refs: sop_refs,
        hira_refs: hira_refs,
        capa_refs: capa_refs,
        auditScope: auditScheduleData.auditScope,
      };

      try {
        let res = await axios.put(
          `/api/auditSchedule/updateAuditScheduleDetails/${id}`,
          temp
        );

        if (res.status === 200 || res.status === 201) {
          try {
            await axios.post(`/api/auditSchedule/sendMailForHead/${id}`);
            // if (id && !isDraft) {
            //   localStorage.setItem("auditSchId",id)
            //   const protocol = process.env.REACT_APP_API_URL?.split(":")[0]
            //   const redirectUri = protocol + "://" + process.env.REACT_APP_REDIRECT_URL + "/calRedirect"
            //   const msCalDtls = await axios.get(`/api/connected-apps/getConnectedAppByName?name=${process.env.REACT_APP_MS_CALENDAR}`)
            //   const url = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?"+
            //                     `scope=${msCalDtls.data.description}` +
            //                     "&response_type=code" +
            //                     "&response_mode=query" +
            //                     "&state=calendarTest" +
            //                     `&redirect_uri=${redirectUri}`+
            //                     `&client_id=${msCalDtls.data.clientId}`
            //   window.location.href = url;
            // }
          } catch (error) {
            enqueueSnackbar(`Error occured while sending mail`, {
              variant: "error",
            });
          }
        }
        setIsLoading(false);
        enqueueSnackbar(`successfully updated`, {
          variant: "success",
        });
        if (!modalWindow) {
          navigate("/audit");
        } else {
          navigate("/audit");
          setIsModalVisible(false);
        }
      } catch (err) {
        setIsLoading(false);
        enqueueSnackbar(`Error Occured while updating audit Schedule`, {
          variant: "error",
        });
      }
    } else {
      enqueueSnackbar(`Please fill all required fields`, {
        variant: "error",
      });
    }
  };

  const [isPopoverOpen, setPopoverOpen] = useState<boolean>(false);

  const handlePopoverOpenChange = (open: any) => {
    setPopoverOpen(open);
  };

  const closePopover = (open: any) => {
    setPopoverOpen(false);
  };

  // help tour guide

  const [openTourForScheduleForm1, setOpenTourForScheduleForm1] =
    useState<boolean>(false);

  const refForForAuditScheduleForm1 = useRef(null);
  const refForForAuditScheduleForm2 = useRef(null);
  const refForForAuditScheduleForm3 = useRef(null);
  const refForForAuditScheduleForm4 = useRef(null);
  const refForForAuditScheduleForm5 = useRef(null);
  const refForForAuditScheduleForm6 = useRef(null);
  const refForForAuditScheduleForm7 = useRef(null);
  const refForForAuditScheduleForm8 = useRef(null);
  const refForForAuditScheduleForm9 = useRef(null);
  const refForForAuditScheduleForm10 = useRef(null);
  const refForForAuditScheduleForm11 = useRef(null);
  const refForForAuditScheduleForm12 = useRef(null);
  const refForForAuditScheduleForm13 = useRef(null);
  const refForForAuditScheduleForm14 = useRef(null);
  const refForForAuditScheduleForm15 = useRef(null);
  const refForForAuditScheduleForm16 = useRef(null);
  // const refForForAuditScheduleForm10 = useRef(null);

  const stepsForScheduleForm1: TourProps["steps"] = [
    {
      title: "Audit Type",
      description: "All the created MRM plan for your unit can be viewed here",

      target: () =>
        refForForAuditScheduleForm1.current
          ? refForForAuditScheduleForm1.current
          : null,
    },

    {
      title: "Audit Name",
      description:
        "By default, your unit’s MRM Plan displayed for general user and MCOE can select any unit to view MRM plan",
      target: () => refForForAuditScheduleForm2.current,
    },
    {
      title: "Location",
      description:
        "Select the systems to view the list of MRM plans associated with the selected system",
      target: () => refForForAuditScheduleForm3.current,
    },
    {
      title: "System Name",
      description:
        "By default , this view will show the MRM plans created in the current year . Click on this link < to see prior year plans. Use > to move back to the current year",

      target: () =>
        refForForAuditScheduleForm4.current
          ? refForForAuditScheduleForm4.current
          : null,
    },
    {
      title: "Grid",
      description:
        "Select Months for which audit is to be planned by using the checkbox.",
      target: () => refForForAuditScheduleForm5.current,
    },
    {
      title: "icon",
      description:
        "- Remove entries from the plan . Re-add them when required by selecting from the dropdown and selecting + ",
      target: () =>
        refForForAuditScheduleForm6.current
          ? refForForAuditScheduleForm6.current
          : null,
    },
    {
      title: "Kebab Menu",
      description:
        "Use the (Kebab Menu Image) to select /repeat selection for all months.Duplicate the current row selection to all other rows . Clear Rows to clear selections and reselect choices. Where Audit Types require coordination of dates prior to a planned month,  Finalize Auditor Option is displayed  in the menu. Use the option to select auditors, inform unit coordinators and have the stakeholders accept the dates for audit",

      target: () =>
        refForForAuditScheduleForm7.current
          ? refForForAuditScheduleForm7.current
          : null,
    },
    {
      title: "Duplicate",
      description:
        "Select a prior audit plan to duplicate . This would eliminate the need to enter information from scratch . All of the selected entities and months from the selected audit plan are copied below in the grid ",
      target: () => refForForAuditScheduleForm8.current,
    },
    {
      title: "Draft",
      description: " Click on Draft to save unfinished entries ",
      target: () => refForForAuditScheduleForm9.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForForAuditScheduleForm10.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForForAuditScheduleForm11.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForForAuditScheduleForm12.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForForAuditScheduleForm13.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForForAuditScheduleForm14.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForForAuditScheduleForm15.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForForAuditScheduleForm16.current,
    },
  ];

  // useEffect(() => {
  //   if (auditScheduleData.systems) {
  //     const sysId = auditScheduleData.systems.map((item: any) => item.item.id);
  //     getAllClauses(sysId).then((res: any) => {
  //       if (res?.data) {
  //         setClauses(res.data);
  //       }
  //     });
  //     setAuditScheduleData({
  //       ...auditScheduleData,
  //       systemName: sysId,
  //     });
  //   }
  // }, [auditScheduleData.systems]);

  const handleAuditScopeChange = (e: any) => {
    setAuditScheduleData({
      ...auditScheduleData,
      auditScope: e.target.value,
    });
  };

  const handlePreviewTemplate = (templateId: any) => () => {
    navigate(`/audit/auditchecklist/create`, {
      state: {
        edit: false,
        id: templateId,
        preview: true,
      },
    });
  };

  const handleFinalSubmit = () => {
    setIsDuplicateClicked(false);
    handleSubmitCheckConflicts();
  };

  const steps = ["Audit Information", "Audit Scope", "Audit Schedule"];

  const forms = [
    {
      form: (
        <>
          <div>
            <Popover
              content={
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0 30px 0 20px",
                    }}
                  >
                    <div>
                      <h3 style={{ margin: 0, fontWeight: "5rem" }}>
                        Information
                      </h3>
                    </div>

                    <div>
                      <IconButton
                        onClick={closePopover}
                        style={{ margin: 0, padding: 0 }}
                      >
                        <img
                          src={CloseIconImageSvg}
                          alt="close-drawer"
                          style={{
                            width: "36px",
                            height: "38px",
                            cursor: "pointer",
                          }}
                        />
                      </IconButton>
                    </div>
                  </div>

                  <Divider
                    style={{
                      margin: "0 0 10px 0",
                      border: "1px Solid #aaaaaa",
                    }}
                  />

                  <AuditScheduleForm2
                    auditScheduleData={auditScheduleData}
                    setAuditScheduleData={setAuditScheduleData}
                    isModalOpen={isModalOpen}
                    setIsModalOpen={setIsModalOpen}
                    isEdit={isEdit}
                  />
                </div>
              } // Replace with your popover content
              title=""
              open={isPopoverOpen} // Use 'open' instead of 'visible'
              onOpenChange={handlePopoverOpenChange} // Use 'onOpenChange'
              trigger="click"
              overlayStyle={{
                // display: "flex",
                // justifyContent: "center",
                // alignItems: "flex-start",
                width: "60%",
                padding: "3%",
              }}
              // arrow={{ pointAtCenter: true }}
              style={{ maxWidth: "100% !important" }}
            ></Popover>
          </div>
          {scheduleCreationLoader ? (
            <div>Schedule is Being Generated..!</div>
          ) : (
            ""
          )}
          <div className={classes.root}>
            <SingleFormWrapper
              parentPageLink="/audit"
              backBtn={false}
              disableFormFunction={true}
              // redirectToTab="AUDIT SCHEDULE"
              label={
                <div
                  style={{
                    // width: "80vw",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    Audit Schedule {auditScheduleData?.prefixSuffix} for{" "}
                    {auditScheduleData.year}
                    <MdOutlineInfo
                      style={{
                        marginLeft: "8px",
                        paddingTop: "5px",
                      }}
                      onClick={() => setPopoverOpen(!isPopoverOpen)}
                    />
                  </div>
                  {/* <div
              // style={{ position: "fixed", top: "77px", right: "120px" }}
              >
                <TouchAppIcon
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                  setOpenTourForScheduleForm1(true);
                  }}
                />
              </div> */}
                </div>
              }
              handleSaveAsDraft={handleSaveAsDraft}
              isScheduleInDraft={isScheduleInDraft}
              isEdit={isEdit}
              moduleName="Audit Schedule"
            >
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
                  <div
                    style={{
                      backgroundColor: "#ffffff",
                      padding: "20px",
                    }}
                    className={classes.tabsWrapper}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      {isEdit &&
                        isScheduleInDraft &&
                        teamLeadId &&
                        userDetails?.id !== teamLeadId && (
                          <Typography
                            variant="h6"
                            style={{ padding: "2px 0 0 20px" }}
                          >
                            This Schedule is pending with Team Lead, Team Lead
                            Only Can Finalise Auditors & Checklist!
                          </Typography>
                        )}
                    </div>
                    <AuditScheduleForm1
                      auditScheduleData={auditScheduleData}
                      setAuditScheduleData={setAuditScheduleData}
                      setLocationNo={setLocationNo}
                      isEdit={isEdit}
                      systemTypes={systemTypes}
                      systems={systems}
                      locationNames={locationNames}
                      templates={templates}
                      auditTypes={auditTypes}
                      functionList={functionList}
                      isScheduleInDraft={isScheduleInDraft}
                      disableAuditorsAndChecklistField={
                        disableAuditorsAndChecklistField
                      }
                      disableEditScheduleForOtherUnit={
                        disableEditScheduleForOtherUnit
                      }
                      teamLeadId={teamLeadId}
                      refForForAuditScheduleForm1={refForForAuditScheduleForm1}
                      refForForAuditScheduleForm2={refForForAuditScheduleForm2}
                      refForForAuditScheduleForm3={refForForAuditScheduleForm3}
                      refForForAuditScheduleForm4={refForForAuditScheduleForm4}
                      refForForAuditScheduleForm5={refForForAuditScheduleForm5}
                      refForForAuditScheduleForm6={refForForAuditScheduleForm6}
                    />
                    {/* <Divider
                        style={{
                          margin: 0,
                          padding: 0,
                          border: "1px solid #F7F6F6",
                        }}
                      /> */}
                    {/* Team Lead Info Modal */}
                    <Modal
                      title="Information"
                      centered
                      open={teamLeadInfoModal?.open}
                      onCancel={() => {
                        setTeamLeadInfoModal({ open: false });
                      }}
                      width={800}
                      footer={[
                        <Button
                          key="ok"
                          onClick={() => {
                            setTeamLeadInfoModal({ open: false });
                          }}
                        >
                          Ok
                        </Button>,
                      ]}
                    >
                      Team Lead is Available for this Finalised Date, Auditors
                      and Audit Checklist will be further added by Team Lead.
                      Please Continue adding rest of the details and Save the
                      Schedule As Draft.
                    </Modal>
                    <Divider style={{ marginTop: "20px" }} />
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "end",
                      }}
                    >
                      {isEdit &&
                        auditScheduleData?.planNumber === "No plan" && (
                          <Button
                            size="middle"
                            type="primary"
                            onClick={() => {
                              handleSaveAsDraftForDuplicate();
                            }}
                            disabled={!isScheduleInDraft}
                            style={{ marginRight: "10px" }}
                            className={classes.colorFilledButton}
                          >
                            Duplicate
                          </Button>
                        )}

                      {/* <Button
                          size="middle"
                          type="primary"
                          // onClick={isEdit ? handleUpdate : handleCreate}
                          onClick={() => {
                            setIsDuplicateClicked(false);
                            handleSubmitCheckConflicts();
                          }}
                          className={classes.colorFilledButton}
                          disabled={
                            (isEdit && !isScheduleInDraft) ||
                            disableAuditorsAndChecklistField
                          }
                          ref={refForForAuditScheduleForm16}
                        >
                          Submit
                        </Button> */}
                    </div>
                  </div>
                </>
              )}
            </SingleFormWrapper>
          </div>
          <Tour
            open={openTourForScheduleForm1}
            onClose={() => setOpenTourForScheduleForm1(false)}
            steps={stepsForScheduleForm1}
          />
        </>
      ),
    },
    {
      form: (
        <>
          <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <div style={{ marginBottom: "20px" }}>
              <span className={classes.formTextPadding}>Audit Scope</span>
              <TextArea
                rows={4}
                placeholder="Enter audit scope here..."
                style={{
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  marginTop: "10px",
                }}
                disabled={false}
                onChange={handleAuditScopeChange}
                value={auditScheduleData.auditScope}
              />
            </div>
            <Grid container spacing={2}>
              {/* Audited Requirements */}
              <Grid item xs={12} md={6} className={classes.formBox}>
                <Grid item sm={2} md={4} className={classes.formTextPadding}>
                  <strong>Select Audit Checklist</strong>
                </Grid>
                <Grid item sm={12} md={8} className={classes.formBox}>
                  <FormControl
                    className={classes.formControl}
                    variant="outlined"
                    size="small"
                  >
                    <div ref={refForForAuditScheduleForm5}>
                      <Autocomplete
                        multiple
                        id="select-audit-checklist"
                        options={templates}
                        getOptionLabel={(op) => op.label}
                        value={
                          auditScheduleData?.auditTemplates?.map(
                            (templateId: any) =>
                              templates.find(
                                (t: any) => t.value === templateId
                              ) || {}
                          ) || []
                        }
                        onChange={(e, newValues) => {
                          setAuditScheduleData((prev: any) => ({
                            ...prev,
                            auditTemplates: newValues?.map((nv) => nv.value),
                          }));
                        }}
                        // disabled={
                        //   (isEdit && !isScheduleInDraft) ||
                        //   disableAuditorsAndChecklistField ||
                        //   (isEdit &&
                        //     (isScheduleInDraft || auditScheduleData?.isDraft) &&
                        //     teamLeadId !== userDetails?.id)
                        // }
                        renderTags={(selectedOptions, getTagProps) =>
                          selectedOptions.map((option, index) => (
                            <div
                              key={option.value}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                margin: "2px",
                                padding: "4px 8px",
                                background: "#f0f0f0",
                                borderRadius: "4px",
                              }}
                              {...getTagProps({ index })}
                            >
                              <span>{option.label}</span>
                              <Button
                                type="text"
                                icon={<MdOpenInNew />}
                                onClick={handlePreviewTemplate(option.value)}
                              />
                              {/* <a
                            href={`/audit-template/${option.value}`} // Replace with your dynamic URL logic
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ marginLeft: "8px", color: "#007bff" }}
                          >
                           <MdOpenInNew  style={{width : "25px", height: "25px"}}/>
                          </a> */}
                            </div>
                          ))
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="outlined"
                            size="small"
                            required
                          />
                        )}
                      />
                    </div>
                  </FormControl>
                </Grid>
                {/* <strong>Systems</strong>
                <DynamicFormSearchField
                  data={auditScheduleData}
                  setData={setAuditScheduleData}
                  name="systems"
                  keyName="item"
                  suggestions={systems || []}
                  suggestionLabel="name"
                /> */}
              </Grid>

              {/* Audited Documents */}
              {/* <Grid item xs={12} md={6}>
                <strong>Clauses</strong>
                <DynamicFormSearchField
                  data={auditScheduleData}
                  setData={setAuditScheduleData}
                  name="clauses"
                  keyName="item"
                  suggestions={clauses || []}
                  suggestionLabel="name"
                />
              </Grid> */}
            </Grid>
          </div>
          <Tabs defaultActiveKey="1" tabPosition={"left"}>
            <TabPane tab="Clauses" key="1">
              <CommonReferencesTab
                clauseSearch={true}
                drawer={drawer}
                onlyClauseRef={true}
                clause_refs={auditScheduleData.clause_refs}
                auditScheduleData={auditScheduleData}
                setAuditScheduleData={setAuditScheduleData}
                systems={auditScheduleData.systemName}
              />
            </TabPane>
            <TabPane tab="Documents" key="2">
              <CommonReferencesTab
                drawer={drawer}
                onlySopRef={true}
                sop_refs={auditScheduleData.sop_refs}
                auditScheduleData={auditScheduleData}
                setAuditScheduleData={setAuditScheduleData}
              />
            </TabPane>
            <TabPane tab="HIRA" key="3">
              <CommonReferencesTab
                drawer={drawer}
                onlyHiraRef={true}
                hira_refs={auditScheduleData.hira_refs}
                auditScheduleData={auditScheduleData}
                setAuditScheduleData={setAuditScheduleData}
              />
            </TabPane>
            <TabPane tab="CAPA" key="4">
              <CommonReferencesTab
                drawer={drawer}
                onlyCapaRef={true}
                capa_refs={auditScheduleData.capa_refs}
                auditScheduleData={auditScheduleData}
                setAuditScheduleData={setAuditScheduleData}
              />
            </TabPane>
          </Tabs>
        </>
      ),
    },
    {
      form: (
        <>
          <AuditScheduleForm3
            handleSubmit={
              isEdit
                ? from === "plan"
                  ? handleCreate
                  : handleUpdate
                : handleCreate
            }
            auditScheduleData={auditScheduleData}
            removedList={removedList}
            setRemovedList={setRemovedList}
            setAuditScheduleData={setAuditScheduleData}
            getAuditScheduleDetailsById={getAuditScheduleDetailsById}
            getAuditPlanDetailsById={getAuditPlanDetailsById}
            isEdit={isEdit}
            functionList={functionList}
            selectedFunction={selectedFunction}
            setSelectedFunction={setSelectedFunction}
            dataForDate={DataforDate}
            date={date}
            setDate={setDate}
            dropdownEntities={dropdownEntities}
            setDropdownEntities={setDropdownEntities}
            templates={templates}
            auditPlanEntityWiseId={auditPlanEntityWiseId}
            setAuditPlanEntityWiseId={setAuditPlanEntityWiseId}
            entityIdToEntityWiseIdMapping={entityIdToEntityWiseIdMapping}
            setEntityIdToEntityWiseIdMapping={setEntityIdToEntityWiseIdMapping}
            conflicts={conflicts}
            isScheduleInDraft={isScheduleInDraft}
            editableRowIds={editableRowIds}
            setEditableRowIds={setEditableRowIds}
            isFinaliseDatesExist={isFinaliseDatesExist}
            auditPlanEntityIdLookupArray={auditPlanEntityIdLookupArray}
            disableAuditorsAndChecklistField={disableAuditorsAndChecklistField}
            teamLeadId={teamLeadId}
            disableEditScheduleForOtherUnit={disableEditScheduleForOtherUnit}
            refForForAuditScheduleForm7={refForForAuditScheduleForm7}
            refForForAuditScheduleForm8={refForForAuditScheduleForm8}
            refForForAuditScheduleForm9={refForForAuditScheduleForm9}
            refForForAuditScheduleForm10={refForForAuditScheduleForm10}
            refForForAuditScheduleForm11={refForForAuditScheduleForm11}
            refForForAuditScheduleForm12={refForForAuditScheduleForm12}
            refForForAuditScheduleForm13={refForForAuditScheduleForm13}
            refForForAuditScheduleForm14={refForForAuditScheduleForm14}
            refForForAuditScheduleForm15={refForForAuditScheduleForm15}
            // refForForAuditScheduleForm16={ refForForAuditScheduleForm16}
            // refForForAuditScheduleForm5={ refForForAuditScheduleForm5}
            // refForForAuditScheduleForm6={ refForForAuditScheduleForm6}

            // conflictColorMap={colorMap}
          />
          {/* conflict modal */}
          <Modal
            title="Warning! Conflicts Found!"
            centered
            open={conflictModalOpen}
            onCancel={() => {
              setConflictModalOpen(false);
            }}
            width={400}
            footer={[
              <Button
                key="ok"
                type="default"
                // danger
                onClick={() => {
                  setConflictModalOpen(false);
                  setLockScheduleModalOpen(true);
                  if (!!isDuplicateClicked) {
                    handleCreate("duplicate");
                  } else {
                    handleCreate();
                  }
                }}
              >
                Yes
              </Button>,
              <Button
                key="cancel"
                type="primary"
                onClick={() => {
                  setConflictModalOpen(false);
                }}
              >
                No
              </Button>,
            ]}
          >
            {conflictMessage} <br />
            Are You Sure to Submit?
          </Modal>
          {/* confirmation Lock Schedule Modal */}
          <Modal
            title="Lock Schedule?"
            centered
            open={lockScheduleModalOpen}
            onCancel={() => {
              setLockScheduleModalOpen(false);
            }}
            width={800}
            closeIcon={
              <img
                src={CloseIconImageSvg}
                alt="close-drawer"
                style={{
                  width: "36px",
                  height: "38px",
                  cursor: "pointer",
                }}
              />
            }
            footer={[
              <Button
                key="cancel"
                onClick={() => {
                  setLockScheduleModalOpen(false);
                }}
              >
                No
              </Button>,
              <Button
                key="ok"
                type="default"
                onClick={() => {
                  setLockScheduleModalOpen(false);
                  setIsScheduleInDraft(false);
                  if (isEdit && !!isDuplicateClicked) {
                    handleCreate("duplicate");
                  } else if (isEdit && !isDuplicateClicked) {
                    handleUpdateOnlyScheduleDetails(false);
                  } else {
                    if (!!isDuplicateClicked) {
                      handleCreate("duplicate");
                    } else {
                      handleCreate();
                    }
                  }
                }}
              >
                Yes
              </Button>,
            ]}
          >
            Are you sure to Finalise & Lock the Schedule?
          </Modal>
        </>
      ),
    },
  ];

  return (
    <FormStepper
      steps={steps}
      forms={forms}
      activeStep={activeStep}
      setActiveStep={setActiveStep}
      isAuditSchedule={true}
      isScheduleInDraft={isScheduleInDraft}
      isScheduleInEdit={isEdit}
      handleNext={() => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      }}
      handleBack={() => {
        if (activeStep === 0) {
          return;
        } else {
          setActiveStep((prevActiveStep) => prevActiveStep - 1);
        }
      }}
      handleDraftSubmit={handleSaveAsDraft}
      handleFinalSubmit={handleFinalSubmit}
      backBtn={!isOrgAdmin ? <BackButton parentPageLink="/master" /> : null}
    />
  );
}

export default AuditScheduleFormStepper;