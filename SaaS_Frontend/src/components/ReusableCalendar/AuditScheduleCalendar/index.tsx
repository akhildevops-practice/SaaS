import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import moment from "moment";
import "moment-timezone";
import "react-big-calendar/lib/css/react-big-calendar.css";
import UpcomingEventsModal from "components/ReusableCalendar/UpcomingEventsModal";
import "./styles.css";
import DraggableScheduleDrawer from "./DraggableScheduleDrawer";
import checkRoles from "utils/checkRoles";
import getAppUrl from "utils/getAppUrl";
import axios from "apis/axios.global";
import { useSnackbar } from "notistack";
import { API_LINK } from "config";
import getSessionStorage from "utils/getSessionStorage";
import "moment/locale/en-gb"; // Import the English (Great Britain) locale
import { CircularProgress } from "@material-ui/core";
import { useRecoilState } from "recoil";
import { auditSchedule, auditScheduleFormType } from "recoil/atom";
import AuditScheduleCalendarModal from "components/AuditScheduleCalendarModal";

type stringOrDate = string | Date;
moment.tz.setDefault("Asia/Kolkata");
// const localizer = momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(Calendar as any);
// moment.locale("en-GB");
const localizer = momentLocalizer(moment);
moment.locale("en-gb");
type Props = {
  events?: any;
  toggleCalendarModal?: any;
  calendarFor?: string;
  auditTypes?: any;
  setAuditTypes?: any;
  locationNames?: any;
  currentYear?: any;
  refreshCalendarData?: any;
  auditPlanIdFromPlan?: any;
  loaderForSchdeuleDrawer?: any;
  setLoaderForSchdeuleDrawer?: any;
  auditScheduleIdFromLocation?: any;
  formModeForCalendarDrawer?: any;
  setFormModeForCalendarDrawer?: any;
  selectedAuditType?: any;
  selectedLocation?: any;
  calendarModalInfo?: any;
  calendarDataLoading?: any;
  createSchedule?: any;
};

const colors = [
  "hotpink", //default kalend color
  "orange", //light orange - tomato
  "dodgerblue", //dodgerblue
  "orchid", //orchid
  "lightseagreen", //sea green
  "sandybrown", //brown
  "bisque", //bisque
];

const styles = {
  clickableCell: {
    cursor: "pointer", // Change cursor to pointer
    height: "100%",
    width: "100%",
    transition: "background-color 0.2s ease", // Smooth hover effect
  },
  hoveredCell: {
    backgroundColor: "#f0f0f0", // Light gray background on hover
  },
};

const AuditScheduleCalendar = ({
  events = [],
  toggleCalendarModal,
  calendarFor = "",
  auditTypes = [],
  setAuditTypes,
  locationNames = [],
  currentYear = new Date().getFullYear(),
  refreshCalendarData,
  auditPlanIdFromPlan = "",
  loaderForSchdeuleDrawer = false,
  setLoaderForSchdeuleDrawer,
  auditScheduleIdFromLocation = "",
  formModeForCalendarDrawer = null,
  setFormModeForCalendarDrawer,
  calendarModalInfo,
  selectedAuditType,
  selectedLocation,
  calendarDataLoading = false,
  createSchedule,
}: Props) => {
  const minTime = new Date();
  minTime.setHours(9, 0, 0);

  const [showEventsModal, setShowEventsModal] = useState<any>(false);
  const [calendarEvents, setCalendarEvents] = useState<any>([]);

  const [currentView, setCurrentView] = useState("month");
  const [eventsData, setEventsData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [auditScheduleData, setAuditScheduleData] = useState<any>({});
  const [showDraggableModal, setShowDraggableModal] = useState<any>(false);
  const [draggedEvent, setDraggedEvent] = useState<any>(null);
  const [systems, setSystems] = useState<any[]>([]);
  const [scheduleFormData, setScheduleFormData] = useState<any>(null);

  const [entityListing, setEntityListing] = useState<any>([]);
  const [auditorsList, setAuditorsList] = useState<any>([]);
  const [auditeeList, setAuditeeList] = useState<any>([]);
  const [templateListing, setTemplateListing] = useState<any>([]);
  const [draggableEntities, setDraggableEntities] = useState<any>([]);
  const [commentText, setCommentText] = useState<any>("");
  const [createdAuditScheduleId, setCreatedAuditScheduleId] = useState<any>("");
  const [auditPlanDetails, setAuditPlanDetails] = useState<any>(null);
  const [formDataLoaderForAuditPlan, setFormDataLoaderForAuditPlan] =
    useState<any>(false);

  const [initialDataFromSchedule, setInitialDataFromSchedule] =
    useState<any>(null);
  const [auditData] = useRecoilState(auditSchedule);
  const [scheduleFormType, setScheduleFormType] = useRecoilState(
    auditScheduleFormType
  );
  const [dataFromAuditScheduleLoaded, setDataFromAuditScheduleLoaded] =
    useState<any>(false);
  // const [unitNames, setLocationNames] = useState<any>([]);
  // const [templates, setTemplates] = useState<any[]>([]);

  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const realmName = getAppUrl();
  const { enqueueSnackbar } = useSnackbar();
  const userDetails = getSessionStorage();

  const [isModalDataLoaded, setIsModalDataLoaded] = useState<any>(false);

  console.log("data new", selectedAuditType, selectedLocation, createSchedule);
  useEffect(() => {
    setLoaderForSchdeuleDrawer(false);
    getSystems();
    getTemplates();
    if (!!auditPlanIdFromPlan && scheduleFormType === "scheduleplan-create") {
      initialiseFormDataFromAuditSchedule();
      setFormDataLoaderForAuditPlan(true);
      getAuditPlanDetailsById();
      getAuditorsForLocation(auditData?.location?.id);
      getAuditeeList(auditData?.scope?.id, auditData?.location?.id);

      setShowDraggableModal(true);
    }
    if (!!auditScheduleIdFromLocation && scheduleFormType === "adhoc-edit") {
      // console.log("checkaudit recoil data--->", auditData);
      initialiseFormDataFromAuditSchedule();
      setShowDraggableModal(true);
      getAuditorsForLocation(auditData?.location?.id);
      getAuditeeList(auditData?.scope?.id, auditData?.location?.id);
      // initialiseDepartmentListingForEditMode();
      setDataFromAuditScheduleLoaded(true);
    }

    if (!!scheduleFormType && scheduleFormType === "adhoc-create") {
      // console.log("checkaudit inside calendar adhoc create");

      initialiseFormDataFromAuditSchedule();
      getAuditorsForLocation(auditData?.location?.id);
      getAuditeeList(auditData?.scope?.id, auditData?.location?.id);
      setDataFromAuditScheduleLoaded(true);

      setShowDraggableModal(true);
    }
  }, [scheduleFormType]);

  // useEffect(() => {
  //   console.log(
  //     "checkaudit inside useEffect[auditScheduleIdFromPlan]",
  //     auditPlanIdFromPlan
  //   );
  // }, [auditPlanIdFromPlan]);

  useEffect(() => {
    console.log(
      "checkauditnew events in reusable calendar useEffect[events] length and loading",
      events?.length,
      calendarDataLoading
    );
    if (!calendarDataLoading) {
      const formatEvents = events.map((event: any) =>
        convertScheduleDataToEvent(event)
      );

      const uniqueData = formatEvents?.filter(
        (function (seenIds) {
          return function (entry: any) {
            if (seenIds.has(entry.id)) {
              return false;
            } else {
              seenIds.add(entry.id);
              return true;
            }
          };
        })(new Set())
      );

      setCalendarEvents(uniqueData);
      setEventsData(uniqueData);
      console.log(
        "checkauditnew uniqueData in reusable calendar useEffect[events]",
        uniqueData?.length
      );
    }
  }, [events, calendarDataLoading]);

  useEffect(() => {
    if (!!calendarEvents && calendarEvents.length > 0) {
      setIsModalDataLoaded(true);
    }
  }, [calendarEvents]);

  // useEffect(() => {
  //   console.log(
  //     "checkaudit inside useEffect[auditScheduleData]",
  //     auditScheduleData
  //   );
  // }, [auditScheduleData]);

  // useEffect(() => {
  //   console.log(
  //     "checkaudit inside useEffect[entityListing]",
  //     entityListing
  //   );
  // }, [entityListing]);

  // useEffect(() => {
  //   console.log(
  //     "checkaudit inside useEffect[draggableEntities]",
  //     draggableEntities
  //   );
  // }, [draggableEntities]);

  useEffect(() => {
    // console.log(
    //   "checkaudit inside useEffect[scheduleFormData]",
    //   scheduleFormData
    // );
    if (!dataFromAuditScheduleLoaded && !initialDataFromSchedule) {
      if (!!scheduleFormData?.location && !dataFromAuditScheduleLoaded) {
        getSystems();
      }
    }
  }, [scheduleFormData?.location]);

  // useEffect(() => {
  //   console.log(
  //     "checkaudit inside useEffect[auditPlanDetails]",
  //     auditPlanDetails
  //   );
  // }, [auditPlanDetails]);

  useEffect(() => {
    // console.log(
    //   "checkaudit inside useEffect[scheduleFormData]",
    //   scheduleFormData
    // );

    //below only execiutes if no auditPlanId, no auditScheduleId
    if (!auditPlanIdFromPlan && !auditScheduleIdFromLocation) {
      if (scheduleFormData?.auditType) {
        const selectedAuditType = auditTypes.find(
          (auditType: any) => auditType.id === scheduleFormData?.auditType
        );
        // console.log(
        //   "checkaudit inside useEffect[selectedAuditType]",
        //   selectedAuditType
        // );
        const scope = JSON.parse(selectedAuditType?.scope);
        const role = selectedAuditType?.responsibility;
        // console.log("checkaudit inside useEffect[scopeId]", scope?.id);

        if (!!scheduleFormData?.location && !!scope?.id) {
          const selectedLocation = locationNames.find(
            (location: any) =>
              location.locationName === scheduleFormData?.location
          );

          getEntitiesByAuditType(scope?.id, selectedLocation?.id);

          getAuditorsForLocation(selectedLocation?.id, role);
          getAuditeeList(scope?.id, selectedLocation?.id);
        }
      }
    }
  }, [scheduleFormData?.auditType, scheduleFormData?.location]);

  const abstractDate = (date: string) => {
    const d = new Date(date);

    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  // useEffect(() => {
  //   console.log("checkaudit inside useEffect[auditeeList]", auditeeList);
  // }, [auditeeList]);

  const getAuditScheduleDetailsById = async () => {
    try {
      const res = await axios.get(
        `/api/auditSchedule/getAuditScheduleById/${auditScheduleIdFromLocation}/${realmName}`
      );
      if (res.status === 200 || res.status === 201) {
        setAuditScheduleData({
          auditScheduleName: res.data.auditScheduleName,
          auditName: res.data.auditName,
          createdBy: res.data.createdBy,
          auditNumber: res.data.auditNumber,
          auditType: res.data.auditType,
          auditPeriod: res.data.auditPeriod,
          // period: res.data.period,
          planType: res.data.planType,
          createdOn: abstractDate(res.data.createdAt),
          prefixSuffix: res.data.prefixSuffix,
          systemType: res.data.systemTypeId,
          // systemName: res.data.systemMasterId,
          systemName: res.data.systemMaster.map((value: any) => value._id),
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

          minDate: res.data.auditPeriod[0],
          maxDate: res.data.auditPeriod[1],
          template: res.data.auditTemplateId,
          auditScheduleEntityWise: res.data.auditScheduleEntityWise.map(
            (obj: any) => ({
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
            })
          ),
        });
        setEntityListing(
          res.data.auditScheduleEntityWise
            .filter((obj: any) => !obj.deleted)
            .map((obj: any) => ({
              id: obj.entityId,

              entityName: obj.entityName,
            }))
        );
        setDraggableEntities(
          res.data.auditScheduleEntityWise
            .filter((obj: any) => !obj.deleted)
            .map((obj: any) => ({
              id: obj.entityId,
              entityId: obj.entityId,
              entityName: obj.entityName,
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
      }
    } catch (error) {
      // console.log("checkaudit error in getAuditScheduleDetailsById", error);
    }
  };

  const getAuditPlanDetailsById = async () => {
    try {
      if (auditPlanIdFromPlan) {
        const res = await axios(
          `/api/auditPlan/getAuditPlanData/${auditPlanIdFromPlan}`
        );
        setAuditPlanDetails({
          createdBy: res.data.createdBy,
          auditType: res.data.auditType,
          auditName: res.data.auditName,
          auditNumber: res.data.id,
          createdOn: abstractDate(res.data.createdAt),
          systemType: res.data.systemTypeId,
          auditPeriod: "",
          planType: res.data.planType,
          auditScheduleName: "",
          // systemName: res.data.systemMasterId,
          system: res.data.systemMaster.map((value: any) => ({
            id: value._id,
            name: value.name,
          })),
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
          // AuditScheduleEntitywise:
          auditScheduleEntityWise: res.data.auditPlanEntityWise.map(
            (obj: {
              id: string;
              entityId: string;
              entityName: string;
              auditors: any;
              monthNames: any;
              combinedData: any;
            }) => ({
              entityId: obj.entityId,
              name: obj.entityName,
              combinedData: obj?.combinedData,
              monthNames: obj?.monthNames,
              time: null,
              auditors: obj?.auditors,
              auditees: [],
              comments: "",
            })
          ),
        });
      } else {
        // console.log(
        //   "checkaudit error in getAuditPlanDetailsById, auditPlanIdFromPlan not found"
        // );
        enqueueSnackbar(
          `Error in Fetching Audit Plan Details, auditPlanId not found!`,
          {
            variant: "error",
          }
        );
      }
    } catch (error) {
      // console.log("checkaudit error in getAuditPlanDetailsById", error);
      enqueueSnackbar(`Error in Fetching Audit Plan Details ${error}`, {
        variant: "error",
      });
    }
  };

  const getSystems = async () => {
    try {
      const encodedSystems = encodeURIComponent(
        JSON.stringify([scheduleFormData?.location])
      );
      const res = await axios(`/api/systems/displaySystems/${encodedSystems}`);

      setSystems(res.data.map((obj: any) => ({ id: obj.id, name: obj.name })));
    } catch (error) {
      // console.log("checkaudit error in getSystems", error);
    }
  };

  //api to fetch checklist tempalates for checklist dropdown
  const getTemplates = async () => {
    await axios(`/api/auditSchedule/auditScheduleTemplate`) // templates API here
      .then((res) => {
        setTemplateListing(
          res.data.map((obj: any) => ({
            ...obj,
            value: obj._id,
            label: obj.title,
          }))
        );
      })
      .catch((err) => console.error(err));
  };

  const getEntitiesByAuditType = async (
    scopeId: any = "",
    locationId: any = ""
  ) => {
    try {
      if (!!scopeId && !!locationId) {
        const res = await axios(
          `/api/auditPlan/getEntity/${locationId}/${scopeId}`
        );
        if (res.status === 200 || res.status === 201) {
          if (!!res.data && res.data.length > 0) {
            setEntityListing(
              res.data.map((obj: any) => ({ ...obj, title: obj.entityName }))
            );
            setDraggableEntities(
              res.data.map((obj: any) => ({ ...obj, title: obj.entityName }))
            );
            setAuditScheduleData((prev: any) => ({
              ...prev,
              auditScheduleEntityWise: res.data.map(
                (obj: { id: string; entityName: string }) => ({
                  entityId: obj.id,
                  name: obj.entityName,
                  time: null,
                  auditor: [],
                  auditee: [],
                  comments: "",
                })
              ),
            }));
          }
        } else {
          setEntityListing([]);
          // console.log("checkaudit error in getEntitiesByAuditType", res);
        }
      }
    } catch (error) {
      // console.log("checkaudit error in getEntitiesByAuditType", error);
    }
  };

  const getAuditorsForLocation = async (
    locationId: any = "",
    role: any = ""
  ) => {
    // console.log("checkaudit inside getAuditorsForLocation", locationId, role);

    try {
      if (locationId) {
        const res = await axios(
          `api/auditSchedule/getAuditorForLocation/${locationId}/Auditor`
        );
        if (res.status === 200 || res.status === 201) {
          setAuditorsList(
            res.data.map((obj: any) => ({
              id: obj.id,
              username: obj.username,
              email: obj.email,
              avatar: `${API_LINK}/${obj.avatar}`,
            }))
          );
        } else {
          setAuditorsList([]);
          // console.log("checkaudit error in getAuditorsForLocation", res);
        }
      }
    } catch (error) {
      // console.log("checkaudit errror in getAuditorsForLocation", error);
    }
  };

  const getAuditeeList = async (scopeId: any = "", locationId: any = "") => {
    try {
      if (!!scopeId && scopeId !== "Unit") {
        const res = await axios(
          `api/auditSchedule/getAuditeeByEntity/${scopeId}/null`
        );
        if (res.status === 200 || res.status === 201) {
          console.log(
            "checkaudit res in getAuditeeList res.data?.data[0]",
            res.data
          );

          res.data.map((obj: any) => {
            if (obj?.data[0]?.entityHead[0] === undefined) {
              setAuditeeList((prev: any) => ({
                ...prev,
                // [obj.entity]: [...obj.data[0].users],
                [obj.entity]: [],
              }));
            } else {
              setAuditeeList((prev: any) => ({
                ...prev,
                [obj.entity]: [
                  obj?.data[0]?.entityHead[0],
                  // ...obj.data[0].users,
                ],
              }));
            }
          });
        }
      }
    } catch (error) {
      // console.log("checkaudit error in getAuditeeList", error);
    }
  };

  const initialiseFormDataFromAuditSchedule = () => {
    // console.log("checkaudit inside initialiseFormDataFromAuditSchedule", auditData);

    setInitialDataFromSchedule({
      ...auditData,
    });
  };

  const initialiseDepartmentListingForEditMode = () => {
    // console.log("checkaudit inside initialiseDepartmentListingForEditMode");

    setEntityListing(
      auditData.AuditScheduleEntitywise.filter((obj: any) => obj.deleted).map(
        (obj: any) => ({
          id: obj.entityId,

          entityName: obj.name,
        })
      )
    );
    setDraggableEntities(
      auditData.AuditScheduleEntitywise.filter((obj: any) => obj.deleted).map(
        (obj: any) => ({
          id: obj.entityId,
          entityId: obj.entityId,
          entityName: obj.name,
          time: obj.time,
          auditors: obj.auditor,
          auditees: obj.auditee,
          monthNames: obj?.monthNames,
          combinedDate: obj?.combinedDate,
          comments: obj.comments,
          areas: obj.areas,
          auditTemplate: obj.auditTemplateId,
          deleted: obj.deleted,
        })
      )
    );
  };

  const convertScheduleDataToEvent = (data: any) => {
    const startAt = moment(data?.start).toDate(); // Convert to Date object using moment
    const endAt = moment(data?.start).add(30, "minutes").toDate(); // Convert to Date object using momen

    return {
      ...data,
      id: data.id,
      summary: data.title,
      title: data.title,
      start: startAt,
      end: endAt,
      color: data.color,
    };
  };

  const eventStyleGetter = (
    event: any,
    start: any,
    end: any,
    isSelected: any
  ) => {
    // console.log("check in eventStyleGetter", event, start, end, isSelected);

    const backgroundColor = event.color || "#f0f0f0"; // use event color or default to gray

    const style = {
      backgroundColor: backgroundColor,
      borderRadius: "0px",
      opacity: 0.8,
      color: "black",
      border: "0px",
      display: "block",
    };
    return {
      style: style,
    };
  };

  const handleViewChange = (view: any) => {
    setCurrentView(view);
  };

  const removeEntityFromListing = (entityId: any) => {
    const updatedEntityListing = draggableEntities.filter(
      (entity: any) => entity.id !== entityId
    );
    setDraggableEntities(updatedEntityListing);
  };
  const reformatDate = (dateString: any) => {
    // Parse the date string
    const date = moment(dateString);

    // Format the date in the desired format (YYYY-MM-DDTHH:mm)
    return date.format("YYYY-MM-DDTHH:mm");
  };

  const handleDragStart = (eventData: any) => {
    setDraggedEvent(eventData);
  };

  const onEventDrop = async ({
    event,
    start,
    end,
    isAllDay,
  }: {
    event: any;
    start: stringOrDate;
    end: stringOrDate;
    isAllDay: boolean;
  }) => {
    // console.log("checkaudit inside onEventDrop");
    // console.log(
    //   "checkaudit start end allDay event",
    //   start,
    //   end,
    //   isAllDay,
    //   event
    // );
    const today = moment().startOf("day");
    if (moment(start).isBefore(today)) {
      enqueueSnackbar("Cannot add events to past dates", { variant: "error" });
      return;
    }

    const date = new Date(start);

    // Format the date to the desired output
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const day = String(date.getUTCDate()).padStart(2, "0");
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");

    // Combine parts to match the desired format
    const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;
    if (createSchedule && !event?.auditReportCreated) {
      const res = await axios.get(
        `/api/auditSchedule/updateAuditEntityByCalendarData?date=${formattedDate}&id=${event?.id}`
      );
      if (res.status === 200) {
        enqueueSnackbar(`SucessFully changed Date and Time`, {
          variant: "success",
        });
      } else {
        enqueueSnackbar(`Something Went Wrong`, { variant: "error" });
      }
    }

    const updatedEvents = calendarEvents.map((existingEvent: any) => {
      if (existingEvent.id === event.id) {
        return { ...existingEvent, start, end, allDay: isAllDay };
      }
      return existingEvent;
    });

    setCalendarEvents(updatedEvents);
  };

  const onDropFromOutside = ({
    start,
    end,
    allDay,
  }: {
    start: Date | string;
    end: Date | string;
    allDay: boolean;
  }) => {
    // You may need to retrieve the event object differently,
    // depending on how you're triggering the drag-and-drop.
    // const draggedEvent = JSON.parse(
    //   dropInfo.event.dataTransfer.getData("text")
    // );
    // console.log("checkaudit inside onDropFromOutside");
    // console.log("checkaudit start end allDay", start, end, allDay);
    // console.log("checkaudit dragged event", draggedEvent);

    const today = moment().startOf("day");
    if (moment(start).isBefore(today)) {
      enqueueSnackbar("Cannot add events to past dates ", { variant: "error" });
      return;
    }

    if (!draggedEvent) return;

    const newEvent = {
      ...draggedEvent,
      start: new Date(start),
      end: new Date(end),
      allDay,
    };
    removeEntityFromListing(draggedEvent.id);
    setCalendarEvents([...calendarEvents, newEvent]);
    createScheduleData(newEvent);
    setDraggedEvent(null); // Reset the dragged event state
  };

  const getPrefixSuffix = async () => {
    try {
      const selectedLocation = locationNames.find(
        (location: any) => location.locationName === scheduleFormData?.location
      );
      const response = await axios.get(
        `/api/serial-number/generateSerialNumber?moduleType=Audit Schedule&location=${
          selectedLocation?.id
        }&createdBy=${userDetails?.id}&organizationId=${sessionStorage.getItem(
          "orgId"
        )}`
      );
      const generatedValue = response.data;

      // Get the current month and year
      const currentDate = new Date();
      const currentMonth = (currentDate.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      const currentYear = currentDate.getFullYear().toString().slice(-2);
      const LocationId = userDetails?.location?.locationId;
      const EntityId = userDetails?.entity?.entityId;
      // Replace all instances of "MM" with currentMonth
      const transformedValue = generatedValue
        .split("MM")
        .join(currentMonth)
        .split("YY")
        .join(currentYear)
        .split("LocationId")
        .join(isOrgAdmin ? selectedLocation?.id : LocationId)
        .split("DepartmentId")
        .join(isOrgAdmin ? "MCOE Department" : EntityId);

      return transformedValue;
    } catch (error) {
      // console.log("checkaudit error in getPrefixSuffix", error);
    }
  };

  const createScheduleData = async (newEvent: any) => {
    try {
      // console.log("checkaudit inside createSchedule newEvent", newEvent);
      // console.log("checkaudit inside createSchedule auditeeList", auditeeList);

      const selectedAuditType = auditTypes.find(
        (auditType: any) => auditType.id === scheduleFormData?.auditType
      );
      const selectedLocation = locationNames.find(
        (location: any) => location.locationName === scheduleFormData?.location
      );
      const formattedStartTime = reformatDate(newEvent.start);
      const scope = JSON.parse(selectedAuditType?.scope);
      const role = selectedAuditType?.responsibility;

      let auditScheduleEntityWise;

      if (
        !initialiseFormDataFromAuditSchedule &&
        !dataFromAuditScheduleLoaded
      ) {
        auditScheduleEntityWise = auditScheduleData.auditScheduleEntityWise
          .filter((entity: any) => entity.name === newEvent.entityName) // Filter the entities to get only the matching one
          .map((entity: any) => {
            // Update the properties of the filtered entity
            return {
              ...entity,
              time: formattedStartTime,
              auditor: scheduleFormData?.auditors,
              auditee: auditeeList[newEvent.entityName].map(
                (auditee: any) => auditee.id
              ),
              comments: commentText,
              auditTemplate: scheduleFormData?.checklist,
              deleted: false,
            };
          });
      } else {
        auditScheduleEntityWise =
          initialDataFromSchedule.AuditScheduleEntitywise.filter(
            (entity: any) => entity.name === newEvent.entityName
          ) // Filter the entities to get only the matching one
            .map((entity: any) => {
              // Update the properties of the filtered entity
              return {
                ...entity,
                time: formattedStartTime,
                auditor: scheduleFormData?.auditors,
                auditee: auditeeList[newEvent.entityName].map(
                  (auditee: any) => auditee.id
                ),
                comments: commentText,
                auditTemplate: scheduleFormData?.checklist,
                deleted: false,
              };
            });
      }

      let tempSchedule: any = {
        auditYear: currentYear,
        auditPeriod: "",
        auditScheduleName: scheduleFormData?.auditScheduleName,
        auditNumber: "",
        auditScheduleNumber: "",
        status: "active",
        createdBy: userDetails?.username,
        auditTemplateId: scheduleFormData?.checklist,
        roleId: role,
        prefixSuffix: await getPrefixSuffix(),
        auditType: scheduleFormData?.auditType,
        entityTypeId: scope?.id,
        auditPlanId: "No plan",
        locationId: selectedLocation?.id,
        systemTypeId: "",
        systemMasterId: scheduleFormData?.systemName,
        auditScheduleEntityWise: auditScheduleEntityWise,
      };
      if (
        !!createdAuditScheduleId &&
        !dataFromAuditScheduleLoaded &&
        !initialDataFromSchedule
      ) {
        tempSchedule = {
          ...tempSchedule,
          auditScheduleId: createdAuditScheduleId,
        };
      }

      // console.log("checkaudit final temp payload data-->", tempSchedule);
      const date = new Date(tempSchedule?.auditScheduleEntityWise[0]?.time);

      const formattedDate = new Intl.DateTimeFormat("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(date);

      const message = `Audit Scheduled for ${newEvent?.entityName} Successfully at ${formattedDate}`;
      // console.log("checkaudit tempschedule toggle test-->", tempSchedule);
      // console.log("checkaudit inside createAUditScheduleData initialDataFromSchedule--->", initialDataFromSchedule);
      // console.log("checkaudit inside createAUditScheduleData scheduleFormType--->", scheduleFormType);

      if (!!initialDataFromSchedule && scheduleFormType === "adhoc-edit") {
        if (initialDataFromSchedule?.planNumber !== "No plan") {
          tempSchedule.auditPlanId = initialDataFromSchedule?.planNumber;
          handleUpdateSchedule(tempSchedule, message);
        } else {
          handleUpdateSchedule(tempSchedule, message);
        }
      } else if (
        !!initialDataFromSchedule &&
        scheduleFormType === "auditScheduleWithPlan-create"
      ) {
        tempSchedule.auditPlanId = initialDataFromSchedule?.planNumber;
        handleCreateSchedule(tempSchedule, message);
      } else {
        handleCreateSchedule(tempSchedule, message);
      }
    } catch (error) {
      // console.log("checkaudit error in createSchedule", error);
    }
  };

  const handleCreateSchedule = async (tempSchedule: any, message: any = "") => {
    // console.log("1111checkaudit inside handleCreateSchedule", tempSchedule);

    try {
      const res = await axios.post(
        `/api/auditSchedule/createAuditSchedule`,
        tempSchedule
      );
      if (res.status === 200 || res.status === 201) {
        // console.log("checkaudit res in handleCreateSchedule", res);
        enqueueSnackbar(`${message}`, {
          variant: "success",
          autoHideDuration: 3500,
        });
        // setCreatedAuditScheduleId(res.data._id);
        refreshCalendarData && refreshCalendarData();
      } else {
        // console.log("checkaudit error in handleCreateSchedule", res);
        enqueueSnackbar(`Error in Creating Schedule ${res.status}`, {
          variant: "error",
        });
        setCreatedAuditScheduleId("");
      }
    } catch (error) {
      enqueueSnackbar(`Error in Creating Schedule ${error}`, {
        variant: "error",
      });
      setCreatedAuditScheduleId("");
      // console.log("checkaudit error in handleCreateSchedule", error);
    }
  };
  const handleUpdateSchedule = async (tempSchedule: any, message: any = "") => {
    // console.log("checkaudit inside handleUpdateSchedule", tempSchedule);

    try {
      if (auditScheduleIdFromLocation) {
        const res = await axios.put(
          `/api/auditSchedule/updateAuditSchedule/${auditScheduleIdFromLocation}`,
          tempSchedule
        );
        if (res.status === 200 || res.status === 201) {
          // console.log("checkaudit res in handleUpdateSchedule", res);
          enqueueSnackbar(`${message}`, {
            variant: "success",
            autoHideDuration: 3500,
          });
          setCreatedAuditScheduleId(res.data._id);
          refreshCalendarData && refreshCalendarData();
        } else {
          // console.log("checkaudit error in handleUpdateSchedule", res);
          enqueueSnackbar(`Error in Creating Schedule ${res.status}`, {
            variant: "error",
          });
          setCreatedAuditScheduleId("");
        }
      }
    } catch (error) {
      enqueueSnackbar(`Error in Creating Schedule ${error}`, {
        variant: "error",
      });
      setCreatedAuditScheduleId("");
      // console.log("checkaudit error in handleCreateSchedule", error);
    }
  };
  const handleDayClick = (date: Date, event: React.MouseEvent) => {
    event.preventDefault(); // Optional: prevent default behavior
    // console.log('Day cell clicked:');
    // console.log('Date:', date.toDateString());
    // console.log('Time:', date.toTimeString());
    if (!createSchedule) {
      enqueueSnackbar(`You Cannot create Audit Schedule for this AuditType`, {
        variant: "error",
      });
      return;
    }
    const today = moment().startOf("day");
    if (moment(new Date(date)).isBefore(today)) {
      enqueueSnackbar("You Cannot create Audit Schedule for past dates", {
        variant: "error",
      });
      return;
    }
    setShowDraggableModal(true);
    console.log(
      "data new",
      selectedAuditType,
      selectedLocation,
      createSchedule
    );
    console.log("setShowDraggableModal", date);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.backgroundColor = styles.hoveredCell.backgroundColor;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.backgroundColor = ""; // Reset background
  };

  return (
    <>
      {!!auditPlanIdFromPlan && loaderForSchdeuleDrawer ? (
        <CircularProgress />
      ) : (
        <div className="App" style={{ height: "67vh" }}>
          {/* <Button
            style={{ padding: "5px", margin: "5px" }}
            type="primary"
            onClick={() => {
              // setScheduleFormType("adhoc-create");
              // setFormModeForCalendarDrawer("auditSchedule-create");
              setShowDraggableModal(true);
            }}
          >
            Create Schedule
          </Button> */}

          {auditTypes?.length > 0 && locationNames.length > 0 && (
            <DraggableScheduleDrawer
              events={calendarEvents}
              isVisible={showDraggableModal}
              onClose={() => setShowDraggableModal(false)}
              onDragStart={handleDragStart}
              auditTypes={auditTypes}
              setAuditTypes={setAuditTypes}
              locationNames={locationNames}
              systems={systems}
              setSystems={setSystems}
              scheduleFormData={scheduleFormData}
              setScheduleFormData={setScheduleFormData}
              entityListing={entityListing}
              setEntityListing={setEntityListing}
              auditorsList={auditorsList}
              setAuditorsList={setAuditorsList}
              auditeeList={auditeeList}
              setAuditeeList={setAuditeeList}
              templateListing={templateListing}
              setTemplateListing={setTemplateListing}
              draggableEntities={draggableEntities}
              setDraggableEntities={setDraggableEntities}
              commentText={commentText}
              setCommentText={setCommentText}
              auditPlanDetails={auditPlanDetails}
              formDataLoaderForAuditPlan={formDataLoaderForAuditPlan}
              setFormDataLoaderForAuditPlan={setFormDataLoaderForAuditPlan}
              initialDataFromSchedule={initialDataFromSchedule}
              setInitialDataFromSchedule={setInitialDataFromSchedule}
              dataFromAuditScheduleLoaded={dataFromAuditScheduleLoaded}
              selectedAuditTypeNew={selectedAuditType}
              selectedLocationNew={selectedLocation}
              selectedSystemNew={selectedAuditType?.system || []}
            />
          )}

          <DragAndDropCalendar
            localizer={localizer}
            events={calendarEvents}
            onEventDrop={onEventDrop}
            onDropFromOutside={onDropFromOutside}
            defaultDate={new Date()}
            defaultView="month"
            selectable
            onView={handleViewChange}
            onSelectEvent={(data: any) => toggleCalendarModal(data)}
            eventPropGetter={eventStyleGetter}
            showMultiDayTimes
            timeslots={2}
            step={15}
            components={{
              dateCellWrapper: (props: any) => (
                <div
                  onClick={(e) => handleDayClick(props.value, e)}
                  onMouseEnter={handleMouseEnter} // Add hover effect
                  onMouseLeave={handleMouseLeave} // Reset hover effect
                  style={styles.clickableCell}
                >
                  {props.children}
                </div>
              ),
            }}
            min={minTime} // Set the minimum time
            culture="en-GB" // Set the culture prop to 'en-GB'
          />
          {!!showEventsModal && (
            <UpcomingEventsModal
              showEventsModal={showEventsModal}
              setShowEventsModal={setShowEventsModal}
            />
          )}

          {calendarEvents?.length > 0 && !!isModalDataLoaded && (
            <AuditScheduleCalendarModal
              calendarData={calendarEvents}
              calendarModalInfo={calendarModalInfo}
              toggleCalendarModal={toggleCalendarModal}
              refreshCalendarData={refreshCalendarData}
            />
          )}
        </div>
      )}
    </>
  );
};
export default AuditScheduleCalendar;
