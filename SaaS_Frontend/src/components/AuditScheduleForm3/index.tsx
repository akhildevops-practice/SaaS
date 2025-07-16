import { useEffect, useState } from "react";
import { createStyles, withStyles, Theme } from "@material-ui/core/styles";
import { useNavigate, useParams } from "react-router";
import { useStyles } from "./styles";
import checkRole from "../../utils/checkRoles";

import {
  Paper,
  TextField,
  TableRow,
  TableHead,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  Chip,
  Tooltip,
  MenuItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Grid,
  FormControl,
  Select,
  InputLabel,
  Typography,
  IconButton,
  ListItemSecondaryAction,
} from "@material-ui/core/";
import { Autocomplete } from "@material-ui/lab";
import axios from "../../apis/axios.global";
import { useRecoilState } from "recoil";
import { auditScheduleFormType } from "../../recoil/atom";
import moment from "moment";
import { API_LINK } from "../../config";
import { MdCheckCircle, MdEdit, MdStar } from "react-icons/md";
import checkRoles from "../../utils/checkRoles";
import { roles } from "utils/enums";
import { MdOutlineIndeterminateCheckBox } from "react-icons/md";
import { MdOutlineAddBox } from "react-icons/md";
import { useSnackbar } from "notistack";

import { DatePicker, Spin } from "antd";
import getSessionStorage from "utils/getSessionStorage";
import dayjs from "dayjs";
// import {AutoComplete as AutoCompleteNew} from "../AutoComplete";
type Props = {
  handleSubmit: any;
  auditScheduleData: any;
  date: any;
  setDate: any;
  setAuditScheduleData: React.Dispatch<React.SetStateAction<any>>;
  isEdit?: any;
  dataForDate: any;
  removedList?: any;
  setRemovedList?: any;
  getAuditScheduleDetailsById?: any;
  getAuditPlanDetailsById?: any;
  functionList?: any;
  dropdownEntities?: any;
  setDropdownEntities?: any;
  selectedFunction?: any;
  setSelectedFunction?: any;
  templates?: any;

  //prop when audit plan is selected and to fetch auditors need auditPlanEntityWiseId
  auditPlanEntityWiseId?: any;
  setAuditPlanEntityWiseId?: any;

  entityIdToEntityWiseIdMapping?: any;
  setEntityIdToEntityWiseIdMapping?: any;
  conflicts?: any;
  conflictColorMap?: any;
  isScheduleInDraft?: boolean;
  editableRowIds?: any;
  setEditableRowIds?: any;
  isFinaliseDatesExist?: any;
  auditPlanEntityIdLookupArray?: any;
  disableAuditorsAndChecklistField?: any;
  teamLeadId?: any;
  disableEditScheduleForOtherUnit?: any;
  // setAuditPlanEntityIdLookupArray?: any;
  refForForAuditScheduleForm7?: any;
  refForForAuditScheduleForm8?: any;
  refForForAuditScheduleForm9?: any;
  refForForAuditScheduleForm10?: any;
  refForForAuditScheduleForm11?: any;
  refForForAuditScheduleForm12?: any;
  refForForAuditScheduleForm13?: any;
  refForForAuditScheduleForm14?: any;
  refForForAuditScheduleForm15?: any;
  // refForForAuditScheduleForm16?: any;
  // refForForAuditScheduleForm7?:any;
  // refForForAuditScheduleForm7?:any;
};

interface IEntity {
  id?: string;
  entityId: string;
  name: string;
  monthNames: string[];
  time: Date | null;
  auditors: string[];
  auditees: string[];
  comments: string;
  auditTemplate: string;
  areas: string[];
  deleted?: any;
}

interface AuditScheduleProps {
  headCells: string[];
}

/**
 *
 * @param {boolean} isEdit This is to check if the form is in EDIT mode
 * This the whole UI structure of the Audit Schedule Planner
 */

const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    head: {
      backgroundColor: "#E8F3F9",
      color: "#black",
      // textAlign: "center", // Center align the header text
      padding: "50px",
    },
    body: {
      fontSize: 14,
      // textAlign: "center", // Center align the body text
    },
  })
)(TableCell);

const StyledTableRow = withStyles((theme: Theme) =>
  createStyles({
    root: {
      boxShadow: "0px 4px 4px -2px rgba(0, 0, 0, 0.5)",
      borderBottom: "1px solid #F5F5F5",
    },
  })
)(TableRow);
function AuditScheduleHead({ headCells }: AuditScheduleProps) {
  return (
    // <TableHead>
    // <TableRow>
    <>
      {headCells.map((label, index) => {
        return (
          <StyledTableCell
            key={index}
            style={
              index === 0
                ? { fontSize: "1rem", textAlign: "left" }
                : {
                    textAlign: "center",
                  }
            }
          >
            {label}
          </StyledTableCell>
        );
      })}
    </>
    // </TableRow>
    // </TableHead>
  );
}

function AuditScheduleForm3({
  handleSubmit,
  auditScheduleData,
  setAuditScheduleData,
  date,
  setDate,
  isEdit = false,
  dataForDate,
  removedList,
  setRemovedList,
  getAuditScheduleDetailsById,
  getAuditPlanDetailsById,
  functionList,
  dropdownEntities = [],
  setDropdownEntities,
  selectedFunction,
  setSelectedFunction,
  templates = [],

  auditPlanEntityWiseId = "",
  setAuditPlanEntityWiseId,

  entityIdToEntityWiseIdMapping = [],
  setEntityIdToEntityWiseIdMapping,
  conflicts = [],
  conflictColorMap,
  isScheduleInDraft = false,
  editableRowIds = [],
  setEditableRowIds,
  isFinaliseDatesExist = false,
  auditPlanEntityIdLookupArray = null,
  disableAuditorsAndChecklistField = false,
  teamLeadId = null,
  disableEditScheduleForOtherUnit = false,
  refForForAuditScheduleForm7,
  refForForAuditScheduleForm8,
  refForForAuditScheduleForm9,
  refForForAuditScheduleForm10,
  refForForAuditScheduleForm11,
  refForForAuditScheduleForm12,
  refForForAuditScheduleForm13,
  refForForAuditScheduleForm14,
  refForForAuditScheduleForm15,
}: // refForForAuditScheduleForm16,
// setAuditPlanEntityIdLookupArray,

Props) {
  const today = new Date().toISOString().split("T")[0] + "T00:00";
  const { from, id } = useParams();
  const [scheduleFormType, setScheduleFormType] = useRecoilState(
    auditScheduleFormType
  );
  const isMR = checkRoles(roles.MR);
  const isOrgAdmin = checkRoles(roles.ORGADMIN);
  const userDetails = getSessionStorage();
  const orgId = sessionStorage.getItem("orgId");
  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();
  const [auditorList, setAuditorList] = useState<any>([]);
  const [modalEntityData, setModalEntityData] = useState<any>();
  const [currentDate, setcurrentDate] = useState("");
  const navigate = useNavigate();
  const [auditeeLists, setAuditeeLists] = useState<any>([]);
  // const [templates, setTemplate] = useState<any[]>([]);
  const [restoreId, setRestoreId] = useState<any>("");
  // const [removed, setRemoved] = useState<boolean>(false);
  const [editRowId, setEditRowId] = useState(null);
  // const [editableRowIds, setEditableRowIds] = useState<any>([]);

  const [editableRowLoader, setEditableRowLoader] = useState<any>(false);

  const monthOrder = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  // const [date, setDate] = useState<any>([]);

  const isAuditor = checkRole("AUDITOR");
  const headCells = [
    auditScheduleData.scope.id === "Unit"
      ? "Department"
      : auditScheduleData.scope.name,
    "Date & Time",
    "Auditors",
    "Auditees",
    // "Comments",
    "Audit Checklist",
    // "Actions"
    // "",
  ];
  const auditorCells = [
    auditScheduleData.scope.id === "Unit"
      ? "Department"
      : auditScheduleData.scope.name,
    "Date & Time",
    "Auditors",
    "Auditees",
    // "Comments",
    "Audit Checklist",
    // "Actions"

    // "",
  ];

  const [editRows, setEditRows] = useState(
    Array(auditScheduleData.AuditScheduleEntitywise.length).fill(false)
  );
  const sortedDate = (date: any) => {
    const uniqueDatesMap = new Map();
    const uniqueData: any[] = [];
    date.forEach((item: any) => {
      const dateCombination = item.startDate + item.endDate;
      if (!uniqueDatesMap.has(dateCombination)) {
        uniqueDatesMap.set(dateCombination, true);
        uniqueData.push(item);
      }
    });
    return uniqueData;
  };

  // useEffect(() => {
  //   console.log("checkaudit in scheduleform3 auditPlanEntityWiseId useEffect", auditPlanEntityWiseId);
  // }, [auditPlanEntityWiseId]);

  // useEffect(() => {
  //   console.log(
  //     "checkaudit in scheduleform3 auditeeLists useEffect",
  //     auditeeLists
  //   );
  // }, [auditeeLists]);

  // useEffect(() => {
  //   console.log(
  //     "checkaudit in scheduleform3 auditScheduleData useEffect",
  //     auditScheduleData
  //   );
  //   console.log("checkaudit date ----", date);
  // }, [auditScheduleData]);

  // useEffect(() => {
  //   console.log(
  //     "checkaudit in scheduleform3 auditScheduleData useEffect",
  //     auditScheduleData
  //   );
  //   console.log("checkaudit date ----", date);
  //   console.log("checkaudit confition audito period", auditScheduleData.planType === "Date Range"
  //   ? date?.map((obj: any) => (
  //      `date range plan - ${obj.startDate} - ${obj.endDate}`

  //     ))
  //   : auditScheduleData.planType === "Month" &&
  //     auditScheduleData?.scope?.name === "Unit"
  //   ? isFinaliseDatesExist
  //     ? date?.map((obj: any) => (
  //         `month plan unit scope - ${obj.startDate} - ${obj.endDate}`
  //       ))
  //     : date?.map((monthName: any, index: any) => (
  //         `else part month paln unit scope - ${monthName}`
  //       ))
  //   : auditScheduleData.planType === "Month" &&
  //     auditScheduleData?.scope?.name ===
  //       "Corporate Function"
  //   ? isFinaliseDatesExist
  //     ? date?.map((obj: any) => (
  //        `month plan corp func scope - ${obj.startDate} - ${obj.endDate}`
  //       ))
  //     : date?.map((monthName: any, index: any) => (
  //        `else part month plan corp func scope - ${monthName}`
  //       ))
  //   : auditScheduleData.planType === "Month"
  //   ? // &&
  //     //   auditScheduleData?.scope?.name === "Department"
  //     date?.map((obj: any) => (
  //     `last if month plan - ${obj.name}`
  //     ))
  //   : null);

  // }, [auditScheduleData]);

  useEffect(() => {
    // getDateRanges();
    if (modalEntityData) {
      auditScheduleData.AuditScheduleEntitywise.map((en: IEntity) => {
        if (en?.name === modalEntityData?.name) {
          setModalEntityData(en);
        }
      });
    }
  }, [auditScheduleData.AuditScheduleEntitywise]);


   useEffect(() => {
    // getDateRanges();
    if (auditScheduleData.AuditScheduleEntitywise?.length>0) {

      auditScheduleData.AuditScheduleEntitywise.map((en: IEntity,index:any) => {

        // if (en?.name === modalEntityData?.name) {
          fetchAuditeeByDepartment(en.entityId)
          fetchAuditorByDepartment(en.entityId)
          // setModalEntityData(en);
        // }
      });
    }
  }, [auditScheduleData.AuditScheduleEntitywise]);

  const handleChange = (event: any, entity: any) => {
    if (event.target.name === "areas") {
      setAuditScheduleData((prev: any) => ({
        ...prev,
        AuditScheduleEntitywise: prev.AuditScheduleEntitywise.map(
          (en: IEntity) => {
            if (en.name === modalEntityData?.name) {
              let data = [];
              if (en?.areas) {
                data = [...en?.areas, event.target.value];
                // setModalEntityData({ ...en, area: data });
              } else {
                data = [event.target.value];
              }
              // setModalEntityData({ ...en, area: data });
              return { ...en, areas: data };
            } else return en;
          }
        ),
      }));
    } else {
      setAuditScheduleData((prev: any) => ({
        ...prev,
        AuditScheduleEntitywise: prev.AuditScheduleEntitywise.map(
          (en: IEntity) => {
            if (en.name === entity.name) {
              if (event.target.name === "time")
                return { ...en, [event.target.name]: event.target.value };
              else return { ...en, [event.target.name]: event.target.value };
            } else return en;
          }
        ),
      }));
    }
  };

  // const handleChangeLists = (
  //   event: any,
  //   newValue: any[],
  //   list: string,
  //   entity: any
  // ) => {
  //   console.log("checkaudit inside handleChangeLists newValue", newValue);
  //   console.log("checkaudit inside handleChangeLists list", list);
  //   console.log("checkaudit inside handleChangeLists entity", entity);

  //   setAuditScheduleData((prev: any) => ({

  //     ...prev,
  //     AuditScheduleEntitywise: prev.AuditScheduleEntitywise.map(
  //       (o: IEntity) => {
  //         if (o.id === entity.id) {
  //           return {
  //             ...o,
  //             [list]: newValue,
  //           };
  //         }
  //         return o;
  //       }
  //     ),
  //   }));
  // };
  const handleChangeLists = (
    event: any,
    newValue: any[],
    list: string,
    entity: any
  ) => {
    // console.log("checkaudit handleChangeLists - Start");
    // console.log("checkaudit Event: ", event);
    // console.log("checkaudit New Value: ", newValue);
    // console.log("checkaudit List Type: ", list);
    // console.log("checkaudit Entity: ", entity);

    setAuditScheduleData((prev: any) => {
      // console.log("checkaudit Previous State: ", prev);

      const updatedEntities = prev.AuditScheduleEntitywise.map((o: IEntity) => {
        if (o.entityId === entity.entityId) {
          const updatedEntity = {
            ...o,
            [list]: newValue,
          };
          // console.log(
          //   `checkaudit Updating entity with ID ${o.id}: `,
          //   updatedEntity
          // );
          return updatedEntity;
        }
        return o;
      });

      // console.log("checkaudit Updated Entities: ", updatedEntities);

      const newState = {
        ...prev,
        AuditScheduleEntitywise: updatedEntities,
      };

      // console.log("checkaudit New State: ", newState);
      return newState;
    });

    // console.log("checkaudit handleChangeLists - End");
  };

  const handleChangeforTemplate = (
    event: any,
    newValue: any,
    list: string,
    entity: any
  ) => {
    setAuditScheduleData((prev: any) => ({
      ...prev,
      AuditScheduleEntitywise: prev.AuditScheduleEntitywise.map(
        (o: IEntity) => {
          if (o.name === entity.name) return { ...o, [list]: newValue };
          else return o;
        }
      ),
    }));
  };
  // set auditors options
  useEffect(() => {
    const date = moment();
    const dateComponent = date.format("YYYY-MM-DD");
    const timeComponent = date.format("HH:mm");
    setcurrentDate(`${dateComponent}T${timeComponent}`);
  }, [auditScheduleData?.location?.id, auditScheduleData?.role]);

  const maxDateTimeLocal = auditScheduleData.maxDate
    ? `${auditScheduleData.maxDate}T23:59`
    : "";

  // useEffect(() => {
  //   console.log(
  //     "checkaudit in scheduleform3 auditorList useEffect",
  //     auditorList
  //   );
  // }, [auditorList]);

  // useEffect(() => {
  //   console.log(
  //     "checkaudit in scheduleform3 auditScheduleData useEffect",
  //     auditScheduleData
  //   );
  // }, [auditScheduleData]);

  const handleToggleCalendarView = () => {
    // console.log("checkaudit inside toggle", from, id);

    const temp: any = {};
    if (!!from && from === "plan") {
      temp.auditPlanId = id;
      temp.formMode = "auditScheduleWithPlan-create";
    } else if (!!from && from === "schedule") {
      temp.auditScheduleId = id;
      temp.formMode = "auditSchedule-edit";
    } else {
      temp.formMode = "auditScheduleWithoutPlan-create";
    }

    // else {
    //   if (!!id && from === "schedule") {
    //     console.log("checkaudit inside else if  ", id, from);

    //     temp.auditScheduleId = id;
    //     temp.formMode = "auditSchedule-edit";
    //   }
    // }
    navigate(`/audit`, {
      state: {
        openCalendar: true,
        redirectToTab: "AUDIT SCHEDULE",
        ...temp,
      },
    });
  };

  const fetchAuditeeByDepartment = async (entityId: any) => {
    try {
      if (entityId) {
        const res = await axios.get(
          `/api/auditSchedule/getAuditeeByDepartment/${orgId}/${entityId}`
        );
        // console.log("checkaudit inside fetchAuditeeByDepartment", res);

        if (res.status === 200 || res.status === 201) {
          // const combinedAuditees = [
          //   ...res?.data?.entityHead,
          //   ...res?.data?.users,
          // ];

          const combinedAuditees = [
            ...res?.data?.entityHead,
            ...res?.data?.users,
          ].reduce((uniqueAuditees: any, auditee: any) => {
            if (!uniqueAuditees.find((u: any) => u?.id === auditee?.id)) {
              uniqueAuditees.push(auditee);
            }
            return uniqueAuditees;
          }, []);
          // console.log(
          //   "checkaudit inside fetchAuditeeByDepartment combinedAuditess",
          //   combinedAuditees
          // );

          if (combinedAuditees?.length > 0) {
            setAuditeeLists((prev: any) => ({
              ...prev,
              [entityId]: combinedAuditees,
            }));
            return res.data;
          } else {
            return { entityHead: [], users: [] };
          }
        } else {
          return null;
        }
      }
    } catch (error) {
      enqueueSnackbar(`Error in fetching Auditees ${error}`, {
        variant: "error",
      });
    }
  };

  //fetches auditors based on department, auditType, location and system
  const fetchAuditorByDepartment = async (entityId: any) => {
    try {
      // console.log(
      //   "checkaudit inside fetchAuditorByDepartment",
      //   entityId
      // );
      const { systemName, auditType, location } = auditScheduleData;

      // Building the query string for systemName
      const systemsQueryString = systemName
        .map((systemId: any) => `system[]=${systemId}`)
        .join("&");

      const res = await axios.get(
        `/api/auditSchedule/getAuditors?auditType=${auditType}&location=${location?.id}&dept=${entityId}&${systemsQueryString}`
      );

      if (res.status === 200 || res.status === 201) {
        if (res.data && res.data.length > 0) {
          setAuditorList((prev: any) => {
            const existingAuditors = prev[entityId] || [];
            const newAuditors = res?.data || [];

            // console.log("checkaudit Previous auditors for entityId:", entityId, existingAuditors);
            // console.log("checkaudit New auditors to be added:", newAuditors);

            // Create a combined array of existing and new auditors
            const combinedAuditors = [...existingAuditors, ...newAuditors];

            // console.log("checkaudit combined auditors", combinedAuditors);

            // Use a single map to filter out duplicates
            const auditorMap = new Map();
            combinedAuditors.forEach((auditor) => {
              auditorMap.set(auditor.id, auditor);
            });

            // console.log("checkaudit auditor map", auditorMap);

            // Convert the map back to an array
            let filteredAuditors = Array.from(auditorMap.values());

            // console.log("checkaudit filteredAuditors", filteredAuditors);

            if (date[0]?.hasOwnProperty("auditors")) {
              filteredAuditors = filterUnitAudtors(date, filteredAuditors);
              // console.log("checkaudit auditors if ", filteredAuditors);
            }
            // console.log("checkaudit Filtered auditors (no duplicates):", filteredAuditors);

            return {
              ...prev,
              [entityId]: filteredAuditors,
            };
          });
          return res.data;
        } else {
          return [];
        }
      } else {
        return null;
      }
    } catch (error) {
      enqueueSnackbar(`Error in fetching Auditors ${error}`, {
        variant: "error",
      });
    }
  };

  const filterUnitAudtors = (unitData: any, data: any) => {
    // console.log("checkaudit inside fitlerunit auditors function unit data and data-->", unitData, data);

    if (unitData[0].hasOwnProperty("auditors")) {
      const unitAuditors = unitData[0].auditors;
      const data2 = ["ACCEPTED", "WAITING"];

      const filterData = unitAuditors?.filter((value: any) =>
        data2.includes(value.accepted)
      );
      // console.log("checkaudit filter data based on flag", filterData);

      const auditorIds = filterData.map((value: any) => value.id);
      // console.log("checkaudit auditor ids", auditorIds);

      const finalData = data.filter((item: any) =>
        auditorIds.includes(item.id)
      );
      // console.log("checkaudit final data", finalData);

      return finalData;
    }
    return data;
  };

  const validateFields = (entityId: any) => {
    // Validation checks
    const { systemName, auditType, location } = auditScheduleData;
    const fieldsToCheck = [
      { value: auditType, message: "Please select Audit Type" },
      { value: location?.id, message: "Please select Location" },
      {
        value: systemName && systemName.length > 0,
        message: "Please select System Name ",
      },
      { value: entityId, message: "Please select Entity" },
    ];

    for (const field of fieldsToCheck) {
      if (!field.value) {
        return { isValid: false, message: field.message };
      }
    }
    return { isValid: true };
  };

  const handleRemoveScheduleEntityWiseData = async (
    scheduleEntityWiseId: any,
    entityId: any,
    entityName: any
  ) => {
    try {
      if (scheduleEntityWiseId) {
        const response = await axios.delete(
          `/api/auditSchedule/deleteAuditScheduleEntityWise/${scheduleEntityWiseId}`
        );
        if (response.status === 200 || response.status === 201) {
          enqueueSnackbar(`Schedule removed successfully`, {
            variant: "success",
            autoHideDuration: 1500,
          });
          setAuditScheduleData((prev: any) => {
            const updatedEntities = prev.AuditScheduleEntitywise.filter(
              (item: any) => item.entityId !== entityId
            );
            // console.log(
            //   "checkaudit inside handleRemove updatedEntities",
            //   updatedEntities
            // );

            return {
              ...prev,
              AuditScheduleEntitywise: updatedEntities,
            };
          });
          // Add the removed entity back to dropdownEntities
          setDropdownEntities((prev: any) => {
            // Assuming selectedEntity is defined somewhere with the required properties
            const newEntity = {
              id: entityId,
              entityName: entityName,
            };

            // Return the new array with the previous items and the new entity
            return [...prev, newEntity];
          });
        } else {
          enqueueSnackbar(`Unable to remove schedule`, {
            variant: "error",
            autoHideDuration: 2500,
          });
        }
      }
    } catch (error) {
      // console.log(
      //   "checkaudit inside handleRemoveScheduleEntityWiseData error",
      //   error
      // );
      enqueueSnackbar(`Error in removing schedule ${error}`, {
        variant: "error",
        autoHideDuration: 2500,
      });
    }
  };

  const handleRemove = (selectedEntity: any) => {
    // console.log("test 2");

    // Remove the entity from AuditScheduleEntitywise
    if (selectedEntity?.id) {
      handleRemoveScheduleEntityWiseData(
        selectedEntity?.id,
        selectedEntity?.entityId,
        selectedEntity?.name
      );
    } else {
      setAuditScheduleData((prev: any) => {
        const updatedEntities = prev.AuditScheduleEntitywise.filter(
          (item: any) => item.entityId !== selectedEntity.entityId
        );
        // console.log(
        //   "checkaudit inside handleRemove updatedEntities",
        //   updatedEntities
        // );

        return {
          ...prev,
          AuditScheduleEntitywise: updatedEntities,
        };
      });
      // Add the removed entity back to dropdownEntities
      setDropdownEntities((prev: any) => {
        // Assuming selectedEntity is defined somewhere with the required properties
        const newEntity = {
          id: selectedEntity.entityId,
          entityName: selectedEntity.name,
        };

        // Return the new array with the previous items and the new entity
        return [...prev, newEntity];
      });
    }
    // console.log("checkaudit Removing entityId:", selectedEntity.entityId); // Debugging log
  };

  const handleAddEntityToScheduleTable = async (restoreId: any) => {
    // console.log(
    //   "checkaudit inside handleAddEntityToScheduleTable auditScheduleData",
    //   auditScheduleData
    // );
    // console.log("auditScheduleData sampleData", auditScheduleData);
    const validationResponse = validateFields(restoreId);
    if (!validationResponse.isValid) {
      enqueueSnackbar(validationResponse.message, { variant: "warning" });
      return;
    }

    // Find the matching entity from dropdownEntities
    const matchingEntity = dropdownEntities.find(
      (entity: any) => entity.id === restoreId
    );
    let newEntity: any = {};
    // If no matching entity is found, return without doing anything
    if (!matchingEntity) return;

    // Prepare the new entity object to be inserted\

    if (
      !!auditScheduleData?.AuditScheduleEntitywise &&
      !!auditScheduleData?.AuditScheduleEntitywise?.length
    ) {
      const timeOfTheFirstEntity =
        auditScheduleData?.AuditScheduleEntitywise?.[0]?.time;
      // let newTime = moment(timeOfTheFirstEntity).add(30, "minutes");
      newEntity = {
        entityId: restoreId,
        entityName: matchingEntity.entityName,
        name: matchingEntity.entityName,
        time: timeOfTheFirstEntity
          ? moment(timeOfTheFirstEntity).format("YYYY-MM-DDTHH:mm")
          : null,
        auditors: [],
        auditees: [],
        comments: "",
        auditTemplates: auditScheduleData?.auditTemplates || [],
      };
    } else {
      newEntity = {
        entityId: restoreId,
        entityName: matchingEntity.entityName,
        name: matchingEntity.entityName,
        time: null,
        auditors: [],
        auditees: [],
        comments: "",
        auditTemplates: auditScheduleData?.auditTemplates || [],
      };
    }

    const auditeeResponseData = await fetchAuditeeByDepartment(restoreId);
    const auditorResponseData = await fetchAuditorByDepartment(restoreId);

    // console.log(
    //   "checkaudit inside handleAddEntityToScheduleTable auditeeResponseData",
    //   auditeeResponseData
    // );
    // console.log(
    //   "checkaudit inside handleAddEntityToScheduleTable auditorResponseData",
    //   auditorResponseData
    // );
    if (auditorResponseData && auditorResponseData?.length === 0) {
      enqueueSnackbar(`No Auditors found for this department, can't schedule`, {
        variant: "warning",
        autoHideDuration: 3000,
      });
    }
    if (
      auditeeResponseData &&
      auditeeResponseData?.entityHead.length === 0 &&
      auditeeResponseData?.users?.length === 0
    ) {
      enqueueSnackbar(`No Auditee found for this department, can't schedule`, {
        variant: "warning",
        autoHideDuration: 3000,
      });
    }
    if (scheduleFormType === "adhoc-create") {
      const defaultEntityHead = [] as any;
      const updateAuditScheduleData: any = { ...auditScheduleData };

      if (
        auditeeResponseData &&
        (auditeeResponseData?.entityHead.length > 0 ||
          auditeeResponseData?.users?.length > 0) &&
        auditorResponseData &&
        auditorResponseData?.length > 0
      ) {
        // console.log("checkaudit auditors and auditeee exists");

        // defaultEntityHead =
        //   auditeeResponseData.entityHead &&
        //   auditeeResponseData.entityHead.length > 0
        //     ? auditeeResponseData.entityHead[0]?.id
        //     : [];

        // newEntity.auditees = [defaultEntityHead];
        if (
          (!!auditeeResponseData.entityHead &&
            auditeeResponseData.entityHead.length > 0) ||
          (auditeeResponseData?.users && auditeeResponseData.users?.length > 0)
        ) {
          // console.log("checkaudit auditee exists");

          // Check if entity already exists in AuditScheduleEntitywise
          const entityExists =
            updateAuditScheduleData.AuditScheduleEntitywise.some(
              (item: any) => item.entityId === restoreId
            );
          // console.log(
          //   "checkaudit checking if entitExists in entityWise or not",
          //   entityExists
          // );

          // If entity does not exist, add it
          if (!entityExists) {
            updateAuditScheduleData.AuditScheduleEntitywise = [
              ...updateAuditScheduleData.AuditScheduleEntitywise,
              newEntity,
            ];
            // console.log(
            //   "checkaudit inside handleAddEntityToScheduleTable updateAuditScheduleData",
            //   updateAuditScheduleData
            // );

            setAuditScheduleData({ ...updateAuditScheduleData });
          }

          // Remove the added entity from dropdownEntities
          setDropdownEntities((prev: any) =>
            prev.filter((entity: any) => entity.id !== restoreId)
          );
        }

        //add lead auditor logic later
      }
    } else if (scheduleFormType === "adhoc-edit") {
      // console.log(
      //   "checkaudit inside handleAddEntityToScheduleTable adhoc-edit",
      //   restoreId
      // );

      setEditableRowIds((prev: any) => [...prev, restoreId]);
      const defaultEntityHead = [] as any;
      const updateAuditScheduleData: any = { ...auditScheduleData };

      if (
        auditeeResponseData &&
        (auditeeResponseData?.entityHead.length > 0 ||
          auditeeResponseData?.users?.length > 0) &&
        auditorResponseData &&
        auditorResponseData?.length > 0
      ) {
        // console.log("checkaudit auditors and auditeee exists");

        // defaultEntityHead =
        //   auditeeResponseData.entityHead &&
        //   auditeeResponseData.entityHead.length > 0
        //     ? auditeeResponseData.entityHead[0]?.id
        //     : [];

        // newEntity.auditees = defaultEntityHead?.length
        //   ? [defaultEntityHead]
        //   : [];
        if (
          (!!auditeeResponseData.entityHead &&
            auditeeResponseData.entityHead.length > 0) ||
          (auditeeResponseData?.users && auditeeResponseData.users?.length > 0)
        ) {
          // console.log("checkaudit auditee exists");

          // Check if entity already exists in AuditScheduleEntitywise
          const entityExists =
            updateAuditScheduleData.AuditScheduleEntitywise.some(
              (item: any) => item.entityId === restoreId
            );
          // console.log(
          //   "checkaudit checking if entitExists in entityWise or not",
          //   entityExists
          // );

          // If entity does not exist, add it
          if (!entityExists) {
            updateAuditScheduleData.AuditScheduleEntitywise = [
              ...updateAuditScheduleData.AuditScheduleEntitywise,
              newEntity,
            ];
            // console.log(
            //   "checkaudit inside handleAddEntityToScheduleTable updateAuditScheduleData",
            //   updateAuditScheduleData
            // );

            setAuditScheduleData({ ...updateAuditScheduleData });
          }

          // Remove the added entity from dropdownEntities
          setDropdownEntities((prev: any) =>
            prev.filter((entity: any) => entity.id !== restoreId)
          );
        }

        //add lead auditor logic later
      }
    }
  };

  //this below function is used to add entity to schedule table when plan is selected
  const handleAddEntityToScheduleTableWithPlan = async (restoreId: any) => {
    // console.log("checkaudit1 inside handleAddEntityToScheduleTableWithPlan");
    // console.log("auditScheduleData sampleData new", auditScheduleData);

    try {
      if (restoreId) {
        // Find the matching entity from dropdownEntities
        const matchingEntity = dropdownEntities.find(
          (entity: any) => entity.id === restoreId
        );

        // console.log("checkaudit1 matching entities-->", matchingEntity);

        // If no matching entity is found, return without doing anything
        if (!matchingEntity) return;
        const updateAuditScheduleData: any = { ...auditScheduleData };
        let newEntity: any = {};

        // console.log(
        //   "checkaudit1 auditScheduledata in handleAddEntityToScheduleTableWithPlan",
        //   auditScheduleData?.auditPeriod
        // );

        let dateString, startDate;

        if (auditScheduleData?.auditPeriod?.includes("-")) {
          dateString = auditScheduleData?.auditPeriod?.split(" - ")[0];

          // console.log("checkaudit1 datestring===>", dateString);

          startDate = dateString
            ? moment(dateString, "YYYY-MM-DD").format("YYYY-MM-DDT09:00")
            : null;
        } else {
          startDate = null;
        }

        // console.log("checkaudit startDate", startDate); // This will output '2024-01-02'

        if (
          !!auditScheduleData?.AuditScheduleEntitywise &&
          !!auditScheduleData?.AuditScheduleEntitywise?.length
        ) {
          const timeOfTheFirstEntity =
            auditScheduleData?.AuditScheduleEntitywise?.[0]?.time;
          // let newTime = moment(timeOfTheFirstEntity).add(30, "minutes");
          const formattedTime = timeOfTheFirstEntity
            ? moment(timeOfTheFirstEntity).format("YYYY-MM-DDTHH:mm")
            : null;
          // console.log("checkaudit formattedTime", formattedTime);

          newEntity = {
            entityId: restoreId,
            entityName: matchingEntity.entityName,
            name: matchingEntity.entityName,
            time: formattedTime,
            auditors: [],
            auditees: [],
            comments: "",
            // auditTemplates: auditScheduleData?.auditTemplates || [],
          };
        } else {
          newEntity = {
            entityId: restoreId,
            entityName: matchingEntity.entityName,
            name: matchingEntity.entityName,
            time: startDate,
            auditors: [],
            auditees: [],
            comments: "",
            // auditTemplates: auditScheduleData?.auditTemplates || [],
          };
        }

        if (teamLeadId === null) {
          newEntity = {
            ...newEntity,
            auditTemplates: auditScheduleData?.auditTemplates || [],
          };
        }

        // console.log("checkaudit1 newEntity-->", newEntity);

        //to fetch auditors by deparment id and auditSettings rule
        let auditorResponseData;

        const auditeeResponseData = await fetchAuditeeByDepartment(restoreId);

        if (
          auditeeResponseData &&
          auditeeResponseData?.entityHead.length === 0 &&
          auditeeResponseData?.users?.length === 0
        ) {
          enqueueSnackbar(
            `No Auditee found for this department, can't schedule`,
            {
              variant: "warning",
              autoHideDuration: 3000,
            }
          );
        } else {
          //to fetch auditors by audit plan entity wise id
          const isAuditorsExist: any =
            await fetchAuditorsBasedByAuditPlanEntityWiseId(restoreId);
          // console.log("checkaudit1 isAuditorsExist", isAuditorsExist);
          if (isAuditorsExist?.status) {
            // console.log("checkaudit isAuditorsExist", isAuditorsExist);
            newEntity.auditors = isAuditorsExist?.data;
          }

          //pre poulate entity head in auditee column
          if (
            auditeeResponseData &&
            auditeeResponseData?.entityHead.length > 0
          ) {
            // console.log(
            //   "checkaudit entityHead in handleAddEntityToScheduleTableWithPlan",
            //   auditeeResponseData?.entityHead
            // );

            newEntity.auditees = auditeeResponseData?.entityHead;
          }
          // console.log("checkaudit1 newEntity in else{}", newEntity);

          // if (!isAuditorsExist) {
          //auditors doesnt exist in associated audit plan, so fetch auditors by department
          const validationResponse = validateFields(restoreId);
          if (!validationResponse.isValid) {
            enqueueSnackbar(validationResponse.message, {
              variant: "warning",
            });
            return;
          }
          auditorResponseData = await fetchAuditorByDepartment(restoreId);
          if (
            auditorResponseData &&
            auditorResponseData?.length === 0 &&
            !isAuditorsExist?.status
          ) {
            enqueueSnackbar(
              `No Auditors found for this department, can't schedule`,
              {
                variant: "warning",
                autoHideDuration: 3000,
              }
            );
            return;
          } else {
            // console.log("checkaudit1 in last else {} scheduleformtype", scheduleFormType);

            // auditors found in department
            if (scheduleFormType === "planSchedule-create") {
              const defaultEntityHead = [] as any;
              // console.log("checkaudit auditors and auditeee exists");
              // defaultEntityHead =
              //   auditeeResponseData.entityHead &&
              //   auditeeResponseData.entityHead.length > 0
              //     ? auditeeResponseData.entityHead[0]?.id
              //     : [];

              // newEntity.auditees = defaultEntityHead?.length
              //   ? [defaultEntityHead]
              //   : [];

              // Check if entity already exists in AuditScheduleEntitywise
              const entityExists =
                updateAuditScheduleData.AuditScheduleEntitywise.some(
                  (item: any) => item.entityId === restoreId
                );
              // console.log(
              //   "checkaudit checking if entitExists in entityWise or not",
              //   entityExists
              // );

              // If entity does not exist, add it
              if (!entityExists) {
                updateAuditScheduleData.AuditScheduleEntitywise = [
                  ...updateAuditScheduleData.AuditScheduleEntitywise,
                  newEntity,
                ];
                // console.log(
                //   "checkaudit inside handleAddEntityToScheduleTable updateAuditScheduleData",
                //   updateAuditScheduleData
                // );

                setAuditScheduleData({ ...updateAuditScheduleData });
              }
              // console.log("checkaudit existing dropdown entities  in handle add dept with plan", dropdownEntities);
              // console.log(
              //   "checkaudit selected dept", restoreId
              // );

              // Remove the added entity from dropdownEntities
              setDropdownEntities((prev: any) =>
                prev.filter((entity: any) => entity.id !== restoreId)
              );
              return true;
            } else if (
              scheduleFormType === "adhoc-edit" &&
              isEdit &&
              auditScheduleData?.planNumber !== "No plan"
            ) {
              const defaultEntityHead = [] as any;
              setEditableRowIds((prev: any) => [...prev, restoreId]);
              // console.log("checkaudit auditors and auditeee exists");
              // defaultEntityHead =
              //   auditeeResponseData.entityHead &&
              //   auditeeResponseData.entityHead.length > 0
              //     ? auditeeResponseData.entityHead[0]?.id
              //     : [];

              // newEntity.auditees = defaultEntityHead?.length
              //   ? [defaultEntityHead]
              //   : [];
              // console.log("checkaudit1 update audit schedule data", updateAuditScheduleData);

              // Check if entity already exists in AuditScheduleEntitywise
              const entityExists =
                updateAuditScheduleData.AuditScheduleEntitywise.some(
                  (item: any) => item.entityId === restoreId
                );
              // console.log(
              //   "checkaudit checking if entitExists in entityWise or not",
              //   entityExists
              // );

              // If entity does not exist, add it
              if (!entityExists) {
                updateAuditScheduleData.AuditScheduleEntitywise = [
                  ...updateAuditScheduleData.AuditScheduleEntitywise,
                  newEntity,
                ];
                // console.log(
                //   "checkaudit inside handleAddEntityToScheduleTable updateAuditScheduleData",
                //   updateAuditScheduleData
                // );

                setAuditScheduleData({ ...updateAuditScheduleData });
              }

              // Remove the added entity from dropdownEntities
              setDropdownEntities((prev: any) =>
                prev.filter((entity: any) => entity.id !== restoreId)
              );
              return true;
            }
          }
        }
      }
    } catch (error) {
      // console.log(
      //   "checkaudit EROOR inside handleAddEntityToScheduleTableWithPlan",
      //   error
      // );
    }
  };

  const fetchAuditorsBasedByAuditPlanEntityWiseId = async (
    entityId: any = ""
  ) => {
    try {
      const scope = auditScheduleData?.scope?.name;
      let entityWiseId;
      if (scope === "Unit") {
        entityWiseId = auditPlanEntityWiseId;
      } else if (scope === "Department") {
        // console.log(
        //   "checkauditors inside fetchAuditorsBasedByAuditPlanEntityWiseId entityIdToEntityWiseIdMapping",
        //   entityIdToEntityWiseIdMapping
        // );

        entityWiseId = entityIdToEntityWiseIdMapping?.find(
          (item: any) => item?.id === entityId
        )?.auditPlanEntityWiseId;
        // console.log(
        //   "checkaudit inside fetchAuditorsBasedByAuditPlanEntityWiseId entityWiseId",
        //   entityWiseId
        // );
      } else {
      }

      const res = await axios.get(
        `/api/auditPlan/getAuditorsByAuditPlanEntityWiseId/${entityWiseId}`
      );
      // console.log(
      //   "checkaudit res inside fetchAuditorsBasedByAuditPlanEntityWiseId",
      //   res
      // );

      if (res.status === 200) {
        if (!!res?.data?.data && !!res?.data?.data?.length) {
          // setAuditorList((prev) => ({
          //   ...prev,
          //   [entityId]: res?.data?.data, // Set the auditors for this entityId
          // }));
          setAuditorList((prev: any) => {
            const existingAuditors = prev[entityId] || [];
            const newAuditors = res?.data?.data || [];

            // console.log("checkaudit Previous auditors for entityId:", entityId, existingAuditors);
            // console.log("checkaudit New auditors to be added:", newAuditors);

            // Create a combined array of existing and new auditors
            const combinedAuditors = [...existingAuditors, ...newAuditors];

            // Use a single map to filter out duplicates
            const auditorMap = new Map();
            combinedAuditors.forEach((auditor) => {
              auditorMap.set(auditor.id, auditor);
            });

            // Convert the map back to an array
            let filteredAuditors = Array.from(auditorMap.values());

            if (date[0]?.hasOwnProperty("auditors")) {
              filteredAuditors = filterUnitAudtors(date, filteredAuditors);
            }

            // console.log("checkaudit Filtered auditors (no duplicates):", filteredAuditors);

            return {
              ...prev,
              [entityId]: filteredAuditors,
            };
          });
          return {
            status: true,
            data: res?.data?.data,
          };
        } else {
          // setAuditorList([]);
          // enqueueSnackbar(`No Auditors found in Associated Audit Plan!`, {
          //   variant: "info",
          //   autoHideDuration: 3000,
          // });
          return {
            status: false,
            data: [],
          };
        }
      } else {
        enqueueSnackbar(`Unable to fetch Auditors from Associated Audit Plan`, {
          variant: "error",
        });
        return false;
      }

      // console.log("checkaudit ");
    } catch (error) {
      // console.log(
      //   "checkaudit inside fetchAuditorsBasedByAuditPlanEntityWiseId error",
      //   error
      // );
      enqueueSnackbar(
        `Error in fetching Auditors from Associated Audit Plan ${error}`,
        {
          variant: "error",
        }
      );
      return false;
    }
  };

  const fetchAuditorsBasedByAuditPlanEntityWiseIdForEdit = async (
    entityWiseId: any = "",
    entityId: any = ""
  ) => {
    try {
      const res = await axios.get(
        `/api/auditPlan/getAuditorsByAuditPlanEntityWiseId/${entityWiseId}`
      );
      // console.log(
      //   "checkaudit res inside fetchAuditorsBasedByAuditPlanEntityWiseId",
      //   res
      // );

      if (res.status === 200) {
        if (!!res?.data?.data && !!res?.data?.data?.length) {
          // console.log("checkaudit inside fetchAuditorsBasedByAuditPlanEntityWiseIdForEdit auditorList",auditorList);

          setAuditorList((prev: any) => {
            const existingAuditors = prev[entityId] || [];
            const newAuditors = res?.data?.data || [];

            // console.log("checkaudit Previous auditors for entityId:", entityId, existingAuditors);
            // console.log("checkaudit New auditors to be added:", newAuditors);

            // Create a combined array of existing and new auditors
            const combinedAuditors = [...existingAuditors, ...newAuditors];

            // Use a single map to filter out duplicates
            const auditorMap = new Map();
            combinedAuditors.forEach((auditor) => {
              auditorMap.set(auditor.id, auditor);
            });

            // Convert the map back to an array
            let filteredAuditors = Array.from(auditorMap.values());

            if (date[0]?.hasOwnProperty("auditors")) {
              filteredAuditors = filterUnitAudtors(date, filteredAuditors);
            }

            return {
              ...prev,
              [entityId]: filteredAuditors,
            };
          });
          return true;
        } else {
          // setAuditorList([]);
          // enqueueSnackbar(`No Auditors found in Associated Audit Plan!`, {
          //   variant: "info",
          //   autoHideDuration: 3000,
          // });
          return false;
        }
      } else {
        enqueueSnackbar(`Unable to fetch Auditors from Associated Audit Plan`, {
          variant: "error",
        });
        return false;
      }
    } catch (error) {
      // console.log(
      //   "checkaudit inside fetchAuditorsBasedByAuditPlanEntityWiseId error",
      //   error
      // );
      enqueueSnackbar(
        `Error in fetching Auditors from Associated Audit Plan ${error}`,
        {
          variant: "error",
        }
      );
      return false;
    }
  };

  const handleUpdateScheduleEntityWiseData = async (
    scheduleEntityWiseId: any,
    entityId: any
  ) => {
    try {
      const scheduleEntityWiseDataToBeUpdated =
        auditScheduleData.AuditScheduleEntitywise.find(
          (entity: any) => entity?.id === scheduleEntityWiseId
        );
      const updatedEntity = {
        ...scheduleEntityWiseDataToBeUpdated,
        auditor: scheduleEntityWiseDataToBeUpdated?.auditors?.map(
          (auditor: any) => auditor?.id
        ),
        auditee: scheduleEntityWiseDataToBeUpdated?.auditees?.map(
          (auditee: any) => auditee?.id
        ),
      };
      // console.log(
      //   "checkaudit handleUpdateScheduleEntityWiseData inside updatedEntity",
      //   updatedEntity
      // );

      const response = await axios.patch(
        `/api/auditSchedule/updateAuditScheduleEntityWise/${scheduleEntityWiseId}`,
        updatedEntity
      );
      if (response.status === 200 || response.status === 201) {
        setEditableRowLoader(false);
        setEditableRowIds((prev: any) =>
          prev.filter((id: any) => id !== entityId)
        );
        enqueueSnackbar(
          `Schedule for ${updatedEntity?.name} updated successfully`,
          {
            variant: "success",
            autoHideDuration: 1500,
          }
        );
      } else {
        setEditableRowLoader(false);
        setEditableRowIds((prev: any) =>
          prev.filter((id: any) => id !== entityId)
        );
        enqueueSnackbar(
          `Unable to update Schedule for ${updatedEntity?.name}`,
          {
            variant: "error",
            autoHideDuration: 1500,
          }
        );
      }
    } catch (error) {
      setEditableRowLoader(false);
      // console.log(
      //   "checkaudit inside handleUpdateScheduleEntityWiseData error",
      //   error
      // );
      enqueueSnackbar(`Error in updating schedule ${error}`, {
        variant: "error",
        autoHideDuration: 1500,
      });
    }
  };

  const handleCreateScheduleEntityWiseData = async (entityId: any) => {
    try {
      const scheduleEntityWiseDataToBeUpdated =
        auditScheduleData.AuditScheduleEntitywise.find(
          (entity: any) => entity?.entityId === entityId
        );

      // console.log(
      //   "checkaudit in handleCreateScheduleEntityWiseData",
      //   scheduleEntityWiseDataToBeUpdated
      // );

      const updatedEntity = {
        ...scheduleEntityWiseDataToBeUpdated,
        auditScheduleId: id ? id : auditScheduleData?.id,
        auditor: scheduleEntityWiseDataToBeUpdated?.auditors?.map(
          (auditor: any) => auditor?.id
        ),
        auditee: scheduleEntityWiseDataToBeUpdated?.auditees?.map(
          (auditee: any) => auditee?.id
        ),
      };
      // console.log(
      //   "checkaudit handleCreateScheduleEntityWiseData inside updatedEntity",
      //   updatedEntity
      // );
      const response = await axios.post(
        `/api/auditSchedule/createEntryInAuditScheduleEntityWise`,
        updatedEntity
      );
      if (response.status === 200 || response.status === 201) {
        setEditableRowLoader(false);
        setEditableRowIds((prev: any) =>
          prev.filter((id: any) => id !== entityId)
        );
        enqueueSnackbar(
          `Schedule for ${updatedEntity?.name} created successfully`,
          {
            variant: "success",
            autoHideDuration: 1500,
          }
        );
      } else {
        setEditableRowLoader(false);
        setEditableRowIds((prev: any) =>
          prev.filter((id: any) => id !== entityId)
        );
        enqueueSnackbar(
          `Unable to create Schedule for ${updatedEntity?.name}`,
          {
            variant: "error",
            autoHideDuration: 1500,
          }
        );
      }
    } catch (error) {
      // console.log(
      //   "checkaudit inside handleCreateScheduleEntityWiseData error",
      //   error
      // );
    }
  };

  const handleEditClick = async (entityId: any) => {
    setEditableRowLoader(true);
    setEditableRowIds((prev: any) => [...prev, entityId]);
    const validationResponse = validateFields(entityId);
    if (!validationResponse.isValid) {
      enqueueSnackbar(validationResponse.message, { variant: "warning" });
      setEditableRowLoader(false);
      return;
    }

    try {
      const [auditeeResponseData, auditorResponseData] = await Promise.all([
        fetchAuditeeByDepartment(entityId),
        fetchAuditorByDepartment(entityId),
      ]);

      if (auditorResponseData && auditorResponseData?.length === 0) {
        setEditableRowLoader(false);
        enqueueSnackbar(
          `No Auditors found for this department, can't schedule`,
          {
            variant: "warning",
            autoHideDuration: 2500,
          }
        );
      }

      if (auditeeResponseData && auditeeResponseData.length === 0) {
        setEditableRowLoader(false);
        enqueueSnackbar(
          `No Auditee found for this department, can't schedule`,
          {
            variant: "warning",
            autoHideDuration: 2500,
          }
        );
      }

      setEditableRowLoader(false);
    } catch (error) {
      enqueueSnackbar(`Error fetching data: ${error}`, { variant: "error" });
      setEditableRowLoader(false);
    }
  };

  const handleSaveClick = (entityId: any, scheduleEntityWiseId: any) => {
    // Implement saving logic here
    setEditableRowLoader(true);

    if (!scheduleEntityWiseId) {
      handleCreateScheduleEntityWiseData(entityId);
    } else {
      handleUpdateScheduleEntityWiseData(scheduleEntityWiseId, entityId);
    }
  };

  const fetchAuditPlanEntityWiseId = async (entityId: any = "") => {
    try {
      const res = await axios.get(
        `/api/auditPlan/getAuditPlanEntitywiseId/${auditScheduleData?.planNumber}/${entityId}?locationId=${auditScheduleData?.location?.id}&scope=${auditScheduleData?.scope?.name}`
      );
      if (res.status === 200 || res.status === 201) {
        if (!!res?.data && !!res?.data?._id) {
          return res?.data?._id;
        } else {
          return null;
        }
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  };

  const handleEditClickForPlan = async (entityId: any) => {
    setEditableRowLoader(true);
    setEditableRowIds((prev: any) => [...prev, entityId]);
    const validationResponse = validateFields(entityId);
    if (!validationResponse.isValid) {
      enqueueSnackbar(validationResponse.message, { variant: "warning" });
      setEditableRowLoader(false);
      return;
    }

    try {
      const auditPlanEntityWiseId = await fetchAuditPlanEntityWiseId(entityId);
      if (!auditPlanEntityWiseId) {
        enqueueSnackbar("No auditPlanEntityWiseId found for this department", {
          variant: "error",
          autoHideDuration: 2500,
        });
        return;
      } else {
        // console.log("checkaudit inside handleEditClickForPlan auditPlanEntityWiseId", auditPlanEntityWiseId);

        const [
          auditeeResponseData,
          auditorResponseData,
          finalisedAuditorsResponse,
        ] = await Promise.all([
          fetchAuditeeByDepartment(entityId),
          fetchAuditorByDepartment(entityId),
          fetchAuditorsBasedByAuditPlanEntityWiseIdForEdit(
            auditPlanEntityWiseId,
            entityId
          ),
        ]);

        if (
          auditorResponseData &&
          auditorResponseData?.length === 0 &&
          !finalisedAuditorsResponse
        ) {
          setEditableRowLoader(false);
          enqueueSnackbar(
            `No Auditors found for this department, can't schedule`,
            {
              variant: "warning",
              autoHideDuration: 2500,
            }
          );
        }

        if (auditeeResponseData && auditeeResponseData.length === 0) {
          setEditableRowLoader(false);
          enqueueSnackbar(
            `No Auditee found for this department, can't schedule`,
            {
              variant: "warning",
              autoHideDuration: 2500,
            }
          );
        }

        setEditableRowLoader(false);
      }
    } catch (error) {
      enqueueSnackbar(`Error fetching data: ${error}`, { variant: "error" });
      setEditableRowLoader(false);
    }
  };

  const handleSaveClickForPlan = (entityId: any, scheduleEntityWiseId: any) => {
    // Implement saving logic here
    setEditableRowLoader(true);

    if (!scheduleEntityWiseId) {
      handleCreateScheduleEntityWiseData(entityId);
    } else {
      handleUpdateScheduleEntityWiseData(scheduleEntityWiseId, entityId);
    }
  };

  const isRowConflicted = (entityId: any) => {
    return conflicts?.some((conflict: any) =>
      conflict.entityIdArray.includes(entityId)
    );
  };

  // Function to determine the conflicted role in a specific row
  const getConflictedRole = (entityId: any, personId: any) => {
    for (const conflict of conflicts) {
      if (
        conflict.entityIdArray.includes(entityId) &&
        conflict.personIdArray.includes(personId)
      ) {
        // Check if the person is involved as an auditor in a conflict
        if (
          conflict.conflictType === "Auditor-Auditor Conflict" ||
          (conflict.conflictType === "Auditor-Auditee Conflict" &&
            conflict.entityIdArray[0] === entityId)
        ) {
          return "auditor";
        }
        // Check if the person is involved as an auditee in a conflict
        if (
          conflict.conflictType === "Auditor-Auditee Conflict" &&
          conflict.entityIdArray[1] === entityId
        ) {
          return "auditee";
        }
      }
    }
    return null; // No conflict or person not involved in conflict
  };

  // Function to check if a person (auditor or auditee) is involved in a conflict
  const isPersonInConflict = (personId: any) => {
    return conflicts.some((conflict: any) =>
      conflict.personIdArray.includes(personId)
    );
  };

  // console.log("auditorList", auditorList);
  const CustomPaper = (props: any) => {
    return <Paper {...props} style={{ width: 400 }} />;
  };

  const handleChangeforfunction = (e: any) => {
    setAuditScheduleData({
      ...auditScheduleData,
      selectedFunction: e.target.value,
    });
  };

  // console.log("date", date);
  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <Grid
          container
          style={{
            display: "flex",
            alignItems: "center",
            padding: "40px 0 20px 0",
          }}
          spacing={2}
        >
          {/* Audit Period Section */}
          <Grid
            item
            sm={12}
            md={4}
            className={classes.formTextPadding}
            style={{ display: "flex", justifyContent: "flex-start" }}
          >
            <Grid item sm={12} md={7}>
              <></>
              {/* Audit Period Value when in edit mode and plan is selected */}
              {isEdit && auditScheduleData?.auditPeriod ? (
                <>
                  <Typography component="span" className={classes.label}>
                    Audit Period:
                  </Typography>

                  <TextField
                    ref={refForForAuditScheduleForm7}
                    fullWidth
                    name="auditPeriod"
                    value={auditScheduleData.auditPeriod}
                    variant="outlined"
                    disabled
                    size="small"
                    className={classes.textField}
                  />
                </>
              ) : (
                <>
                  {/* Audit Period Select/Input */}
                  {((scheduleFormType != "adhoc-create" &&
                    scheduleFormType !== "adhoc-edit") ||
                    (auditScheduleData?.isDraft && !!isEdit)) && (
                    <FormControl
                      className={classes.formControl}
                      variant="outlined"
                      size="small"
                      fullWidth
                    >
                      <InputLabel id="audit-period-label">
                        Audit Period
                      </InputLabel>
                      <Select
                        ref={refForForAuditScheduleForm7}
                        labelId="audit-period-label"
                        name="auditPeriod"
                        value={auditScheduleData.auditPeriod}
                        onChange={(e: any) => {
                          setAuditScheduleData((prev: any) => ({
                            ...prev,
                            auditPeriod: e.target.value,
                          }));
                        }}
                        data-testid="auditPeriod"
                        required
                        label="Audit Period"
                        disabled={isEdit && !auditScheduleData?.isDraft}
                      >
                        {auditScheduleData.planType === "Date Range"
                          ? date?.map((obj: any) => (
                              <MenuItem
                                key={obj.id}
                                value={`${obj.startDate} - ${obj.endDate}`}
                              >
                                {`${obj.startDate} - ${obj.endDate}`}
                              </MenuItem>
                            ))
                          : auditScheduleData.planType === "Month" &&
                            auditScheduleData?.scope?.name === "Unit"
                          ? isFinaliseDatesExist
                            ? date?.map((obj: any) => (
                                <MenuItem key={obj} value={obj}>
                                  {obj}
                                </MenuItem>
                              ))
                            : date?.map((monthName: any, index: any) => (
                                <MenuItem key={index} value={monthName}>
                                  {monthName}
                                </MenuItem>
                              ))
                          // : auditScheduleData.planType === "Month" &&
                          //   auditScheduleData?.scope?.name ===
                          //     "Corporate Function"
                          // ? isFinaliseDatesExist
                          //   ? date?.map((obj: any) => (
                          //       <MenuItem key={obj} value={obj}>
                          //         {obj}
                          //       </MenuItem>
                          //     ))
                          //   : date?.map((monthName: any, index: any) => (
                          //       <MenuItem key={index} value={monthName}>
                          //         {monthName}
                          //       </MenuItem>
                          //     ))
                          : auditScheduleData.planType === "Month"
                          ? // &&
                            //   auditScheduleData?.scope?.name === "Department"
                            date?.map((obj: any) => (
                              <MenuItem key={obj.id} value={`${obj.name}`}>
                                {`${obj.name}`}
                              </MenuItem>
                            ))
                          : null}
                      </Select>
                    </FormControl>
                  )}
                </>
              )}
            </Grid>
          </Grid>

          {/* Center Button - Calendar View Toggle */}
          <Grid
            item
            sm={12}
            md={4}
            style={{ display: "flex", justifyContent: "center" }}
          >
            {/* <Button
              onClick={handleToggleCalendarView}
              variant="outlined"
              startIcon={<MdEventNote />}
            >
              Switch To Calendar View
            </Button> */}
          </Grid>

          {/* Right Corner - Add Department Section */}
          {dropdownEntities.length > 0 && (
            <Grid
              item
              sm={12}
              md={4}
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  width: "100%",
                }}
              >
                <FormControl
                  className={classes.formControl}
                  variant="outlined"
                  size="small"
                  fullWidth
                >
                  <InputLabel id="add-department-label">
                    Add Department
                  </InputLabel>
                  <Select
                    ref={refForForAuditScheduleForm8}
                    labelId="add-department-label"
                    name="unit"
                    value={restoreId}
                    onChange={(e) => setRestoreId(e.target.value)}
                    data-testid="unit"
                    disabled={false}
                    label="Add Department"
                  >
                    {dropdownEntities.map((item: any) => (
                      <MenuItem
                        // key={!isEdit ? item.entityId : item.id}
                        // value={!isEdit ? item.entityId : item.id}
                        key={item.id}
                        value={item.id}
                      >
                        {item.entityName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
              <div>
                {restoreId !== "" && (
                  <Tooltip title="Restore">
                    <IconButton
                      // disabled={!isScheduleInDraft}
                      onClick={() =>
                        auditScheduleData?.planNumber !== "No plan"
                          ? handleAddEntityToScheduleTableWithPlan(restoreId)
                          : handleAddEntityToScheduleTable(restoreId)
                      }
                    >
                      <div ref={refForForAuditScheduleForm9}>
                        <MdOutlineAddBox />
                      </div>
                    </IconButton>
                  </Tooltip>
                )}
              </div>
            </Grid>
          )}
        </Grid>
        <TableContainer>
          <Table
            className={`${classes.table} ${classes.tableHeader}`}
            size="small"
          >
            <TableHead style={{ textAlign: "center" }}>
              <TableRow>
                <AuditScheduleHead
                  headCells={isAuditor ? auditorCells : headCells}
                />
                {isEdit && (
                  <StyledTableCell style={{ textAlign: "right" }}>
                    Actions
                  </StyledTableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {auditScheduleData.AuditScheduleEntitywise?.map(
                (entity: any, rowIndex: any) => {
                  const conflicted = isRowConflicted(entity.entityId);
                  const conflictStyle = conflicted
                    ? { border: "1px solid red" }
                    : {};
                  const conflictTextStyle = { color: "red" };
                  const isRowEditable = isEdit
                    ? editableRowIds.includes(entity?.entityId)
                    : true;
                  // console.log("checkaudit inside map isRowEditable", isRowEditable);

                  const isEditingThisRow =
                    editableRowIds.includes(entity?.entityId) &&
                    editableRowLoader;

                  // console.log("checkaudit inside map", isRowEditable);
                  // Join usernames for auditors and auditees
                  const auditorUsernames = entity?.auditors
                    ?.map(
                      (auditor: any) =>
                        auditor?.firstname + " " + auditor?.lastname || ""
                    )
                    .join(", ");
                  const auditeeUsernames = entity?.auditees
                    ?.map(
                      (auditee: any) =>
                        auditee?.firstname + " " + auditee?.lastname || ""
                    )
                    .join(", ");

                  if (!entity.deleted) {
                    return (
                      <StyledTableRow key={entity.entityId}>
                        {/* ENTITY COLUMN */}
                        <TableCell
                          style={{
                            display: "flex",
                            alignItems: "center", // Align items vertically in the center
                            flexWrap: "nowrap", // Prevent wrapping of items
                            textAlign: "left",
                            // You can add padding or other styles as needed
                          }}
                        >
                          <Tooltip title="Remove row unit">
                            <IconButton
                              disabled={
                                auditScheduleData?.createdBy !==
                                  userDetails?.username && isEdit
                                  ? true
                                  : !isScheduleInDraft && isEdit
                                  ? true
                                  : false
                              }
                              onClick={() => handleRemove(entity)}
                              style={{
                                paddingRight: "5px", // Adjust space between button and text
                                marginRight: "8px", // Add more space if needed
                              }}
                              ref={refForForAuditScheduleForm10}
                            >
                              <MdOutlineIndeterminateCheckBox />
                            </IconButton>
                          </Tooltip>
                          <p
                            style={{
                              textTransform: "capitalize",
                              margin: 0, // Remove margin to keep text aligned with button
                            }}
                          >
                            {entity.name}
                          </p>
                        </TableCell>
                        {/* TIME COLUMN */}
                        <TableCell
                          style={{
                            width: "280px",
                            padding: "10px",
                            textAlign: "center",
                            // ...conflictStyle,
                          }}
                          // style={conflictStyle}
                        >
                          <div ref={refForForAuditScheduleForm11}>
                            {!isRowEditable ? (
                              <Typography
                                variant="body2"
                                style={conflicted ? conflictTextStyle : {}}
                              >
                                {entity.time
                                  ? moment(entity.time).format(
                                      "DD-MM-YYYY HH:mm"
                                    )
                                  : ""}
                              </Typography>
                            ) : (
                              // <TextField
                              //   // style={{ width: "225px", padding: "10px" }}
                              //   fullWidth
                              //   disabled={!isRowEditable}
                              //   style={{
                              //     ...conflictStyle,
                              //   }}
                              //   type="datetime-local"
                              //   name="time"
                              //   value={entity.time}
                              //   variant="outlined"
                              //   onChange={(e) => handleChange(e, entity)}
                              //   size="small"
                              //   inputProps={{
                              //     min: today, // Use today as the minimum date
                              //     max: maxDateTimeLocal,
                              //   }}
                              //   required
                              // />
                              <DatePicker
                                showTime
                                format="YYYY-MM-DDTHH:mm"
                                disabled={!isRowEditable}
                                value={entity.time ? dayjs(entity.time) : null}
                                onChange={(value) =>
                                  handleChange(
                                    {
                                      target: {
                                        name: "time",
                                        value: value?.toISOString(),
                                      },
                                    },
                                    entity
                                  )
                                }
                                style={{
                                  width: "100%",
                                  ...conflictStyle,
                                }}
                                disabledDate={(current) => {
                                  const today = dayjs().startOf("day");
                                  const max = dayjs(maxDateTimeLocal);
                                  return (
                                    current &&
                                    (current < today || current > max)
                                  );
                                }}
                              />
                            )}
                          </div>
                        </TableCell>
                        {/* AUDITOR COLUMN */}
                        <TableCell
                          style={{
                            // width: "280px", // Adjust as needed
                            // padding: "10px", // Keep consistent with other cells
                            textAlign: "center",
                            // ...auditorConflictStyle,
                          }}
                          ref={refForForAuditScheduleForm12}
                        >
                          {!isRowEditable ? (
                            <div>
                              {entity?.auditors?.map(
                                (auditor: any, index: number) => {
                                  const isInConflict = isPersonInConflict(
                                    auditor.id
                                  );
                                  return (
                                    <Typography
                                      key={index}
                                      variant="body2"
                                      style={
                                        isInConflict ? conflictTextStyle : {}
                                      }
                                    >
                                      {auditor.firstname +
                                        " " +
                                        auditor.lastname}
                                    </Typography>
                                  );
                                }
                              )}
                            </div>
                          ) : (
                            <Autocomplete
                              style={{ width: "225px", padding: "10px" }}
                              multiple
                              PaperComponent={CustomPaper}
                              options={auditorList[entity.entityId] || []}
                              disabled={
                                !isRowEditable ||
                                disableAuditorsAndChecklistField ||
                                (isEdit &&
                                  (isScheduleInDraft ||
                                    auditScheduleData?.isDraft) &&
                                  teamLeadId &&
                                  teamLeadId !== userDetails?.id)
                              }
                              getOptionLabel={(option) => option.username}
                              renderOption={(option) => (
                                <MenuItem key={option?.id}>
                                  <ListItemAvatar>
                                    <Avatar>
                                      <Avatar
                                        src={`${API_LINK}/${option?.avatar}`}
                                      />
                                    </Avatar>
                                  </ListItemAvatar>
                                  <ListItemText
                                    primary={option?.username}
                                    secondary={option?.email}
                                  />
                                  {option?.leadAuditor && (
                                    <ListItemSecondaryAction>
                                      <IconButton edge="end" color="inherit">
                                        <MdStar style={{ color: "gold" }} />
                                      </IconButton>
                                    </ListItemSecondaryAction>
                                  )}
                                </MenuItem>
                              )}
                              onChange={(event, newValue) => {
                                // if (newValue.length <= 2)
                                handleChangeLists(
                                  event,
                                  newValue,
                                  "auditors",
                                  entity
                                );
                              }}
                              filterSelectedOptions
                              value={entity?.auditors?.map((auditor: any) => {
                                return auditorList[entity.entityId]?.find(
                                  (auditorItem: any) =>
                                    auditorItem?.id === auditor?.id
                                );
                              })}
                              size="small"
                              renderTags={(value, getTagProps) =>
                                value.map((option, index) => {
                                  // Add this line to check the value of option
                                  const isInConflict = isPersonInConflict(
                                    option?.id
                                  );
                                  return (
                                    <Chip
                                      key={index}
                                      size="small"
                                      label={option ? option.username : null}
                                      {...getTagProps({ index })}
                                      style={{
                                        backgroundColor: isInConflict
                                          ? "#FAA0A0"
                                          : "#e9e9e9",
                                      }} // Change background color if in conflict
                                      deleteIcon={
                                        option?.leadAuditor && (
                                          <IconButton
                                            edge="end"
                                            color="inherit"
                                          >
                                            <MdStar style={{ color: "gold" }} />
                                          </IconButton>
                                        )
                                      }
                                    />
                                  );
                                })
                              }
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  variant="outlined"
                                  label="Users"
                                  required
                                />
                              )}
                            />
                          )}
                        </TableCell>
                        {/* AUDITEE COLUMN */}
                        <TableCell
                          style={{
                            // width: "280px", // Adjust as needed
                            // padding: "10px", // Keep consistent with other cells
                            textAlign: "center",
                            // ...auditeeConflictStyle,
                          }}
                          ref={refForForAuditScheduleForm13}
                        >
                          {!isRowEditable ? (
                            <div>
                              {entity?.auditees?.map(
                                (auditee: any, index: number) => {
                                  const isInConflict = isPersonInConflict(
                                    auditee.id
                                  );
                                  return (
                                    <Typography
                                      key={index}
                                      variant="body2"
                                      style={
                                        isInConflict ? conflictTextStyle : {}
                                      }
                                    >
                                      {auditee.firstname +
                                        " " +
                                        auditee.lastname}
                                    </Typography>
                                  );
                                }
                              )}
                            </div>
                          ) : (
                            <Autocomplete
                              multiple
                              getOptionSelected={(option, value) =>
                                option?.id === value?.id
                              }
                              style={{ width: "225px" }}
                              disableClearable
                              disabled={!isRowEditable}
                              PaperComponent={CustomPaper}
                              filterSelectedOptions
                              getOptionLabel={(op) => {
                                return op?.username || "";
                              }}
                              renderOption={(option) => (
                                <MenuItem key={option?.id}>
                                  <ListItemAvatar>
                                    <Avatar>
                                      <Avatar
                                        src={`${API_LINK}/${option?.avatar}`}
                                      />
                                    </Avatar>
                                  </ListItemAvatar>
                                  <ListItemText
                                    primary={option?.username}
                                    secondary={option?.email}
                                  />
                                  {option?.leadAuditor && (
                                    <ListItemSecondaryAction>
                                      <IconButton edge="end" color="inherit">
                                        <MdStar style={{ color: "gold" }} />
                                      </IconButton>
                                    </ListItemSecondaryAction>
                                  )}
                                </MenuItem>
                              )}
                              options={auditeeLists[entity.entityId] || []}
                              value={entity?.auditees?.map(
                                (selectedAuditeeObj: any) => {
                                  return auditeeLists[entity.entityId]?.find(
                                    (auditee: any) =>
                                      auditee?.id === selectedAuditeeObj?.id
                                  );
                                }
                              )}
                              onChange={(event, newValue) => {
                                // if (newValue.length <= 2) {
                                handleChangeLists(
                                  event,
                                  newValue,
                                  "auditees",
                                  entity
                                );
                                // }
                              }}
                              size="small"
                              renderTags={(tagValue, getTagProps) =>
                                tagValue.map((username: any, index: number) => {
                                  const isInConflict = isPersonInConflict(
                                    username?.id
                                  );
                                  if (username)
                                    return (
                                      <Chip
                                        key={index}
                                        size="small"
                                        label={username.username}
                                        {...getTagProps({ index })}
                                        style={{
                                          backgroundColor: isInConflict
                                            ? "#FAA0A0"
                                            : "#e9e9e9",
                                        }} // Change background color if in conflict
                                        // disabled={
                                        //   auditeeLists[entity.entityId] &&
                                        //   username.id ===
                                        //     auditeeLists[entity.entityId][0]?.id
                                        // }
                                      />
                                    );
                                })
                              }
                              renderInput={(params: any) => (
                                <TextField
                                  {...params}
                                  variant="outlined"
                                  label="Users"
                                  required
                                />
                              )}
                            />
                          )}
                        </TableCell>
                        {/* COMMENTS COLUMN */}
                        {/* <TableCell
                          style={{
                            // width: "280px", // Adjust as needed
                            // padding: "10px",
                            textAlign: "center",
                          }}
                          ref={refForForAuditScheduleForm14}
                        >
                          {!isRowEditable ? (
                            <Typography variant="body2">
                              {entity.comments || ""}
                            </Typography>
                          ) : (
                            <TextField
                              name="comments"
                              onChange={(e) => handleChange(e, entity)}
                              disabled={!isRowEditable}
                              value={entity.comments}
                              fullWidth
                              variant="outlined"
                              size="small"
                              label="Comments"
                              inputProps={{
                                maxLength: 25,
                                "data-testid": "comments",
                              }}
                            />
                          )}
                        </TableCell> */}
                        {/* TEMPLATE COLUMN */}
                        <TableCell
                          style={{
                            // width: "280px", // Adjust as needed,
                            // padding: "10px",
                            textAlign: "center",
                          }}
                          ref={refForForAuditScheduleForm15}
                        >
                          <Autocomplete
                            multiple
                            options={templates}
                            disabled={
                              !isRowEditable ||
                              disableAuditorsAndChecklistField ||
                              (isEdit &&
                                (isScheduleInDraft ||
                                  auditScheduleData?.isDraft) &&
                                teamLeadId &&
                                teamLeadId !== userDetails?.id)
                            }
                            PaperComponent={CustomPaper}
                            getOptionLabel={(op) => op.label}
                            value={
                              entity?.auditTemplates?.map(
                                (templateId: any) =>
                                  templates?.find(
                                    (t: any) => t?.value === templateId
                                  ) || {}
                              ) || []
                            }
                            onChange={(event, newValues) => {
                              // Update the entity's auditTemplate with the selected template values
                              const updatedEntities =
                                auditScheduleData?.AuditScheduleEntitywise?.map(
                                  (e: any) => {
                                    if (e.entityId === entity.entityId) {
                                      return {
                                        ...e,
                                        auditTemplates: newValues?.map(
                                          (nv) => nv.value
                                        ),
                                      };
                                    }
                                    return e;
                                  }
                                );
                              setAuditScheduleData((prev: any) => ({
                                ...prev,
                                AuditScheduleEntitywise: updatedEntities,
                              }));
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="outlined"
                                // label="Checklist"
                                size="small"
                                required
                              />
                            )}
                          />
                          {/* <Autocomplete
                            options={templates}
                            disabled={!isRowEditable}
                            getOptionLabel={(op: any) => op.label}
                            value={
                              templates.filter(
                                (op: any) => op.value === entity.auditTemplate
                              )[0]
                                ? templates.filter(
                                    (op: any) =>
                                      op.value === entity.auditTemplate
                                  )[0]
                                : null
                            }
                            onChange={(event, newValue) => {
                              handleChangeforTemplate(
                                event,
                                newValue.value,
                                "auditTemplate",
                                entity
                              );
                            }}
                            renderInput={(params) => {
                              return (
                                <TextField
                                  {...params}
                                  variant="outlined"
                                  label="Checklist"
                                  size="small"
                                  required
                                />
                              );
                            }}
                          /> */}
                        </TableCell>
                        {isEdit && (
                          <TableCell
                            style={{
                              // width: "280px",
                              // padding: "10px",
                              textAlign: "right",
                            }}
                          >
                            {isRowEditable ? (
                              <IconButton
                                onClick={() =>
                                  handleSaveClick(entity.entityId, entity.id)
                                }
                              >
                                <MdCheckCircle />
                              </IconButton>
                            ) : (
                              <IconButton
                                onClick={() =>
                                  auditScheduleData?.planNumber !== "No plan"
                                    ? handleEditClickForPlan(entity.entityId)
                                    : handleEditClick(entity.entityId)
                                }
                                disabled={
                                  (isEdit && !isScheduleInDraft) ||
                                  disableEditScheduleForOtherUnit
                                }
                              >
                                <MdEdit />
                              </IconButton>
                            )}
                          </TableCell>
                        )}

                        {isEditingThisRow && (
                          <div
                            style={{
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              zIndex: 1000, // Ensure loader is above other content
                              backgroundColor: "rgba(255, 255, 255, 0.8)", // Semi-transparent white background
                              borderRadius: "10px", // Optional: adds rounded corners to the background
                              padding: "20px", // Spacing around the loader
                              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Optional: adds a subtle shadow for depth
                            }}
                          >
                            <Spin />
                          </div>
                        )}
                      </StyledTableRow>
                    );
                  }
                }
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  );
}

export default AuditScheduleForm3;

/**
 //delete add audit focus tablecell from table
                         <TableCell>
                          <Tooltip title="Add Audit Focus">
                            <Chip
                              // style={{ color: "primary" }}
                              label={
                                entity?.areas?.length > 0 ? (
                                  <MdAssignmentTurnedIn />
                                ) : (
                                  <MdAdd />
                                )
                              }
                              onClick={() => {
                                handleOpenModal(entity, auditScheduleData);
                              }}
                              className="new"
                            />
                          </Tooltip>
                        </TableCell>



                           <div>
                          <Modal
                            open={showModal}
                            aria-labelledby="simple-modal-title"
                            aria-describedby="simple-modal-description"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Box
                              // width={600}
                              maxWidth="500vw"
                              mx="auto"
                              my={4}
                              p={3}
                              style={{ backgroundColor: "#ffffff" }}
                            >
                              <div>
                                <Typography variant="h6">
                                  Add Audit Focus
                                </Typography>
                                <Divider />

                                <form>
                                  <Grid
                                    container
                                    style={{ paddingTop: "30px" }}
                                  >
                                    <Grid container item sm={12} md={6}>
                                      <Grid
                                        item
                                        sm={2}
                                        md={4}
                                        className={classes.formTextPadding}
                                      >
                                        <strong>Select Audit Type*</strong>
                                      </Grid>
                                      <Grid
                                        item
                                        sm={12}
                                        md={8}
                                        className={classes.formBox}
                                      >
                                        <FormControl
                                          fullWidth
                                          variant="outlined"
                                          required
                                          margin="normal"
                                          size="small"
                                        >
                                          <InputLabel htmlFor="Scope">
                                            Audit Focus
                                          </InputLabel>
                                          <Select
                                            label="Audit Focus"
                                            name="focus"
                                            value={selectedFocus}
                                            onChange={handleFocusChange}
                                          >
                                            {auditFocus.map((obj: any) => (
                                              <MenuItem
                                                key={obj.id}
                                                value={obj.id}
                                              >
                                                {obj.auditFocus}
                                              </MenuItem>
                                            ))}
                                          </Select>
                                        </FormControl>
                                      </Grid>
                                    </Grid>

                                    <Grid container item sm={12} md={6}>
                                      <Grid
                                        item
                                        sm={2}
                                        md={4}
                                        className={classes.formTextPadding}
                                      >
                                        <strong>Focus Options*</strong>
                                      </Grid>
                                      <Grid
                                        item
                                        sm={12}
                                        md={8}
                                        className={classes.formBox}
                                      >
                                        <FormControl
                                          fullWidth
                                          variant="outlined"
                                          required
                                          margin="normal"
                                          size="small"
                                        >
                                          <InputLabel htmlFor="Focus Options">
                                            Focus Options
                                          </InputLabel>
                                          <Select
                                            label="Responsibility"
                                            name="areas"
                                            value="inside of mondal"
                                            onChange={(e) => {
                                              handleChange(e, entity);
                                            }}
                                          >
                                            {auditFocusOptions?.map(
                                              (obj: any) => (
                                                <MenuItem
                                                  key={obj.name}
                                                  value={obj.name}
                                                >
                                                  {obj.name}
                                                </MenuItem>
                                              )
                                            )}
                                          </Select>
                                        </FormControl>
                                      </Grid>
                                    </Grid>

                                    <Grid container item sm={12} md={12}>
                                      <Grid
                                        item
                                        sm={2}
                                        md={4}
                                        className={classes.formTextPadding}
                                      >
                                        <strong>Selected Options</strong>
                                      </Grid>
                                      <Grid
                                        item
                                        sm={12}
                                        md={8}
                                        className={classes.formBox}
                                      >
                                        <Paper
                                          style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            flexWrap: "wrap",
                                            listStyle: "none",
                                            padding: "0.5rem",
                                            margin: 0,
                                            minHeight: "80px", // Set the minimum height to display at least 4 rows
                                            width: "60%", // Apply the width style from formBox
                                            paddingBottom: "1.5625rem", // Apply the paddingBottom style from formBox (assuming theme.typography.pxToRem(25) equals to '1.5625rem')
                                          }}
                                          component="ul"
                                        >
                                          {modalEntityData?.areas?.map(
                                            (option: any, index: any) => (
                                              <li key={index}>
                                                <Chip
                                                  label={option}
                                                  onDelete={(e: any) => {
                                                    handleDeleteArea(
                                                      index,
                                                      entity
                                                    );
                                                  }}
                                                />
                                              </li>
                                            )
                                          )}
                                        </Paper>
                                      </Grid>
                                    </Grid>

                               

                                    <Box
                                      width="100%"
                                      display="flex"
                                      justifyContent="center"
                                      pt={2}
                                    >
                                      <Button
                                        className={classes.buttonColor}
                                        variant="outlined"
                                        onClick={() => {
                                          setShowModal(false);
                                        }}
                                      >
                                        Cancel
                                      </Button>

                                      <CustomButton
                                        text="Add"
                                        handleClick={() => {
                                          setShowModal(false);
                                        }}
                                      />
                                    </Box>
                                  </Grid>
                                </form>
                              </div>
                            </Box>
                          </Modal>
                        </div>

 */
