import { Button, Form, Modal, Select } from "antd";
import moment from "moment";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { Grid } from "@material-ui/core";
import checkRoles from "utils/checkRoles";
import { MdAssessment } from 'react-icons/md';
import { roles } from "utils/enums";
import getSessionStorage from "utils/getSessionStorage";
import axios from "apis/axios.global";
import dayjs from "dayjs";
import { API_LINK } from "config";
import { useSnackbar } from "notistack";
import getAppUrl from "utils/getAppUrl";
import { useRecoilState } from "recoil";
import { auditScheduleFormType } from "recoil/atom";
const { Option } = Select;
const useStyles = makeStyles({
  modalContent: {
    padding: "5px",
    backgroundColor: "#f5f5f5", // Greyish background
  },
  infoRow: {
    marginBottom: "15px",
    padding: "5px",
  },
  label: {
    fontWeight: "bold",
    marginRight: "10px",
  },
  actionButton: {
    marginTop: "18px",
    float: "right",
    backgroundColor: "#006ead",
    color: "white",
    "&:hover": {
      backgroundColor: "#006ead !important",
    },
  },
  modalStyle: {
    "& .ant-modal-content": {
      // height: "60vh", // or any other value you prefer
      overflowY: "auto",
    },
  },
});
type Props = {
  calendarData?: any;
  calendarModalInfo?: any;
  toggleCalendarModal?: any;
  refreshCalendarData?: any;
};
const AuditScheduleCalendarModal = ({
  calendarData,
  calendarModalInfo,
  toggleCalendarModal,
  refreshCalendarData,
}: Props) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const isMR = checkRoles(roles.MR);
  const isAuditor = checkRoles(roles.AUDITOR);
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isLocAdmin = checkRoles("LOC-ADMIN");

  const realmName = getAppUrl();
  const [scheduleForm] = Form.useForm();
  const [hideButton, setHideButton] = useState<any>(false);
  const [auditorNames, setAuditorNames] = useState<string[]>([]);
  const [auditeeNames, setAuditeeNames] = useState<string[]>([]);
  const [isLoggedInUserHaveEditAccess, setIsLoggedInUserHaveEditAccess] =
    useState<boolean>(false);
  const [auditScheduleData, setAuditScheduleData] = useState<any>(null);
  const [auditorsList, setAuditorsList] = useState<any>([]);
  const [auditeeList, setAuditeeList] = useState<any>([]);
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);
  const [isReportExist, setIsReportExist] = useState<boolean>(false);
  const [existingReportId, setExistingReportId] = useState<any>(null);
  const [isReportinDraftMode, setIsReportinDraftMode] = useState<boolean>(true);
  const [selectedAuditors, setSelectedAuditors] = useState([]);
  const [selectedAuditees, setSelectedAuditees] = useState([]);
  const [selectedTime, setSelectedTime] = useState<any>(null);
  const [modifyScheduleLoader, setModifyScheduleLoader] =
    useState<boolean>(false);
  const [scheduleFormType, setScheduleFormType] = useRecoilState(
    auditScheduleFormType
  );
  const userDetails = getSessionStorage();

  // useEffect(() => {
  //   console.log("checkaudit existingReportId", existingReportId);
  //   console.log("checkaudit isReportinDraftMode", isReportinDraftMode);
  // }, [existingReportId, isReportinDraftMode]);

  useEffect(() => {
    // console.log("checkaudit calendar modal info -->", calendarModalInfo);
    if (
      calendarModalInfo?.data?.auditScheduleId &&
      !!calendarModalInfo?.dataLoaded
    ) {
      getAuditScheduleDetailsById();
      checkIfLoggedInUserCanCreateSchedule();
    }

    if (
      calendarModalInfo.data.auditor?.length &&
      calendarModalInfo.data.auditor?.includes(userDetails.id)
    ) {
      // console.log("checkaudit inside if auditor found -->");

      setHideButton(true);
    } else {
      setHideButton(false);
    }
  }, [calendarModalInfo, calendarModalInfo.open, calendarModalInfo?.data]);

  const abstractDate = (date: string) => {
    const d = new Date(date);

    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const handleOpenScheduleFormEditMode = (record: any) => {
    setScheduleFormType("adhoc-edit");
    navigate(
      `/audit/auditschedule/auditscheduleform/schedule/${calendarModalInfo?.data?.auditScheduleId}`
    );
  };

  const getAuditScheduleDetailsById = async () => {
    await axios(
      `/api/auditSchedule/getAuditScheduleById/${calendarModalInfo?.data?.auditScheduleId}/${realmName}`
    )
      .then(async (res) => {
        // console.log("auditPlan data in auditScheudle", res.data);
        // var date = moment(res?.date ?? new Date());
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
            })
          ),
          isDraft : res.data.isDraft
        });
        const matchingEntity = res.data.auditScheduleEntityWise.find(
          (entity: any) => entity.id === calendarModalInfo?.data?.id
        );

        // console.log("checkaudit matchingEntity and auditschedleiD", matchingEntity, calendarModalInfo?.data?.auditScheduleId);

        const isReportCreated: any =
          await checkIfReportAlreadyCreatedForDepartment(
            matchingEntity?.entityId,
            matchingEntity?.auditScheduleId
          );

        if (isReportCreated) {
          setIsReportExist(true);
          setExistingReportId(isReportCreated?.auditReportId);
          setIsReportinDraftMode(isReportCreated?.isDraft);
        } else {
          setIsReportExist(false);
        }

        // console.log("checkaudit matchingEntity", matchingEntity);

        if (matchingEntity) {
          // setSelectedAuditors(matchingEntity.auditor);
          // setSelectedAuditees(matchingEntity.auditee)
          // console.log("checkaudit in if matchingentity", matchingEntity);

          setSelectedTime(matchingEntity.time);
          getAuditorsForLocation(
            res.data.locationId,
            res.data.roleId,
            matchingEntity
          );
          // console.log("checkaudit matchingEntity", matchingEntity);

          getAuditeeList(res.data.entityTypeId, matchingEntity);
          setSelectedAuditors(
            matchingEntity?.auditor?.map((auditor: any) => auditor.id)
          );
          scheduleForm.setFieldsValue({
            auditors: matchingEntity?.auditor?.map(
              (auditor: any) => auditor.id
            ),
          });
          setSelectedAuditees(
            matchingEntity?.auditee.map((auditee: any) => auditee.id)
          );
          // console.log("checkaudit inside get auditee auditScheduleEntityWise", auditScheduleEntityWise);
          setAuditorNames(
            matchingEntity?.auditor?.map(
              (auditor: any) => auditor.firstname + " " + auditor.lastname
            )
          );
          setAuditeeNames(
            matchingEntity?.auditee?.map(
              (auditee: any) => auditee.firstname + " " + auditee.lastname
            )
          );
          scheduleForm.setFieldsValue({
            auditees: matchingEntity?.auditee.map((auditee: any) => auditee.id),
          });
          setIsDataLoaded(true);
        } else {
          setIsDataLoaded(false);
          enqueueSnackbar(
            `No matching entity found,Error in fetching schedule data`,
            { variant: "error" }
          );
          // Handle the case where no matching entity is found
        }
      })
      .catch((err) => console.error(err));
  };

  const getAuditorsForLocation = async (
    locationId: any = "",
    role: any = "",
    auditScheduleEntityWise: any = {}
  ) => {
    // console.log("checkaudit inside getAuditorsForLocation", locationId, role);

    try {
      if (!!locationId && !!role) {
        const res = await axios(
          `api/auditSchedule/getAuditorForLocation/${locationId}/Auditor`
        );
        if (res.status === 200 || res.status === 201) {
          // const allAuditors: any = res.data.map((obj: any) => ({
          //   id: obj.id,
          //   username: obj.username,
          //   email: obj.email,
          //   avatar: `${API_LINK}/${obj.avatar}`,
          // }));
          setAuditorsList(
            res?.data?.map((obj: any) => ({
              id: obj.id,
              username: obj.username,
              email: obj.email,
              avatar: `${API_LINK}/${obj.avatar}`,
            }))
          );
          // setSelectedAuditors(auditScheduleEntityWise?.auditor);
          // scheduleForm.setFieldsValue({
          //   auditors: auditScheduleEntityWise?.auditor,
          // });
          // console.log(
          //   "checkaudit inside getAuditorsForLocation",
          //   getInitialAuditors(allAuditors, auditScheduleEntityWise?.auditor)
          // );
          // const initialAuditors = getInitialAuditors(
          //   allAuditors,
          //   auditScheduleEntityWise?.auditor
          // );
          // setSelectedAuditors(
          //   initialAuditors.map((auditor: any) => auditor.id)
          // );
        } else {
          setAuditorsList([]);
          // console.log("checkaudit error in getAuditorsForLocation", res);
        }
      }
    } catch (error) {
      // console.log("checkaudit errror in getAuditorsForLocation", error);
    }
  };

  const getAuditeeList = async (
    scopeId: any = "",
    auditScheduleEntityWise: any = {}
  ) => {
    try {
      // if () {
      const orgId = sessionStorage.getItem("orgId");
      const res = await axios(
        `/api/auditSchedule/getAuditeeByDepartment/${orgId}/${auditScheduleEntityWise?.entityId}`
      );
      if (res.status === 200 || res.status === 201) {
        const combinedAuditees = [
          ...res?.data?.entityHead,
          ...res?.data?.users,
        ].reduce((uniqueAuditees: any, auditee: any) => {
          if (!uniqueAuditees.find((u: any) => u?.id === auditee?.id)) {
            uniqueAuditees.push(auditee);
          }
          return uniqueAuditees;
        }, []);
        setAuditeeList((prev: any) => [...combinedAuditees]);
        // res?.data?.map((obj: any) => {
        //   if (obj?.data[0]?.entityHead[0] === undefined) {
        //     setAuditeeList((prev: any) => ({
        //       ...prev,
        //      ...obj.data[0].users,

        //       // [obj.entity]: [...obj.data[0].users],
        //       // [obj.entity]: [],
        //     }));
        //   } else {
        //     setAuditeeList((prev: any) => ({
        //       ...prev,

        //         ...obj?.data[0]?.entityHead[0],
        //         ...obj.data[0].users,

        //       // [obj.entity]: [
        //       //   obj?.data[0]?.entityHead[0],
        //       //   ...obj.data[0].users,
        //       // ],
        //     }));
        //   }
        // });
        // setSelectedAuditees(auditScheduleEntityWise?.auditee);
        // // console.log("checkaudit inside get auditee auditScheduleEntityWise", auditScheduleEntityWise);

        // scheduleForm.setFieldsValue({
        //   auditees: auditScheduleEntityWise?.auditee,
        // });
        // const intitalAuditees = getInitialAuditees(
        //   allAuditees[0],
        //   auditScheduleEntityWise?.auditee,
        //   auditScheduleEntityWise?.entityName
        // )?.map((auditee: any) => auditee.id);

        // setSelectedAuditees(
        //   getInitialAuditees(
        //     allAuditees[0],
        //     auditScheduleEntityWise?.auditee,
        //     auditScheduleEntityWise?.entityName
        //   )?.map((auditee: any) => auditee.id)
        // );
      }
      // }
    } catch (error) {
      // console.log("checkaudit error in getAuditeeList", error);
    }
  };

  const handleTimeChange = (value: any) => {
    const formattedTime = value ? value.format("YYYY-MM-DDTHH:mm") : null;
    // console.log("checkaudit inside handleTimeChange", formattedTime);

    setSelectedTime(formattedTime);
  };

  const checkIfReportAlreadyCreatedForDepartment = async (
    entityId: any,
    auditScheduleId: any
  ) => {
    try {
      if (!!entityId && !!auditScheduleId) {
        const res = await axios.get(
          `/api/audits/checkIfReportAlreadyCreatedForDepartment/${auditScheduleId}/${entityId}`
        );
        if (res.status === 200) {
          if (res?.data) {
            enqueueSnackbar(
              `Audit Report Already Created For This Department`,
              {
                variant: "info",
                autoHideDuration: 2500,
              }
            );
            return {
              auditReportId: res?.data?.auditReportId,
              isDraft: res?.data?.isDraft,
            };
          } else return false;
        } else {
          return false;
        }
      }
    } catch (error) {
      enqueueSnackbar(`Error in checking if report already created`, {
        variant: "error",
        autoHideDuration: 2500,
      });
    }
  };

  const handleModifySchedule = async () => {
    setModifyScheduleLoader(true);
    try {
      if (!!selectedTime && !!selectedAuditors && !!selectedAuditees) {
        const entityIndex = auditScheduleData.auditScheduleEntityWise.findIndex(
          (entity: any) => entity.id === calendarModalInfo.data.id
        );
        const updatedAuditScheduleEntityWise = [
          ...auditScheduleData.auditScheduleEntityWise,
        ];
        if (entityIndex !== -1) {
          updatedAuditScheduleEntityWise[entityIndex] = {
            ...updatedAuditScheduleEntityWise[entityIndex],
            time: selectedTime,
            auditor: selectedAuditors,
            auditee: selectedAuditees,
            comments: updatedAuditScheduleEntityWise[entityIndex].comments,
            auditTemplate:
              updatedAuditScheduleEntityWise[entityIndex].auditTemplate,
          };
        }
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
          auditScheduleEntityWise: updatedAuditScheduleEntityWise,
          // auditScheduleEntityWise:
          //   auditScheduleData.auditScheduleEntityWise.map((obj: any) => ({
          //     id: obj.id,
          //     entityId: obj.entityId,
          //     time: selectedTime,
          //     auditor: selectedAuditors,
          //     auditee: selectedAuditees,
          //     comments: obj.comments,
          //     auditTemplate: obj.auditTemplate,
          //   })),
        };
        // console.log("checkaudit temp in handleModifySchedule", temp);

        const response = await axios.put(
          `/api/auditSchedule/updateAuditSchedule/${calendarModalInfo?.data?.auditScheduleId}`,
          temp
        );
        // console.log("checkaudit response in handleModifySchedule", response);
        if (response.status === 200 || response.status === 201) {
          setModifyScheduleLoader(false);
          !!refreshCalendarData && refreshCalendarData();
          toggleCalendarModal();
          enqueueSnackbar("Schedule modified successfully", {
            variant: "success",
          });
        } else {
          setModifyScheduleLoader(false);
          enqueueSnackbar(`Error in modifying schedule, ${response.status} `, {
            variant: "error",
          });

          // console.log("checkaudit error in handleModifySchedule", response);
        }
      } else {
        // console.log("checkaudit incomplete values, cant modify");
        setModifyScheduleLoader(false);
        enqueueSnackbar(`Incomplete form values `, { variant: "error" });
      }
    } catch (error) {
      setModifyScheduleLoader(false);
      enqueueSnackbar(`Incomplete form values, ${error} `, {
        variant: "error",
      });

      // console.log("checkaudit error in handleModifySchedule", error);
    }
  };

  //function that returns true for dates that are before today's date
  const disabledDate = (current: any) => {
    // Can not select days before today
    return current && current < dayjs().startOf("day");
  };

  const checkIfLoggedInUserCanCreateSchedule = async () => {
    try {
      const res = await axios.get(
        "/api/auditPlan/isLoggedinUsercreateAuditPlan"
      );
      if (res.status === 200) {
        if (res.data) {
          setIsLoggedInUserHaveEditAccess(true);
        } else {
          setIsLoggedInUserHaveEditAccess(false);
        }
      } else {
        setIsLoggedInUserHaveEditAccess(false);
        enqueueSnackbar(
          `Error in checking if user can create schedule, ${res.status} `,
          {
            variant: "error",
          }
        );
      }
    } catch (error) {
      setIsLoggedInUserHaveEditAccess(false);
      // console.log(
      //   "checkaudit error in checkIfLoggedInUserCanCreateSchedule",
      //   error
      // );
      enqueueSnackbar(
        `Error in checking if user can create schedule, ${error} `,
        {
          variant: "error",
        }
      );
    }
  };

  console.log("calendar modal info", calendarModalInfo);
  return (
    <Modal
      title="Audit Info"
      centered
      open={calendarModalInfo.open}
      footer={null}
      onCancel={toggleCalendarModal}
      rootClassName={classes.modalStyle}
      width={"700px"}
    >
      {calendarModalInfo?.calendarFor === "AuditSchedule" && !!isDataLoaded ? (
        <>
          <Form form={scheduleForm}>
            <div className={classes.modalContent}>
              <Grid container spacing={2}>
                {/* First Column */}
                <Grid item xs={6}>
                  <div className={classes.infoRow}>
                    <span className={classes.label}>Schedule Title:</span>
                    {auditScheduleData.auditScheduleName}
                  </div>
                  <div className={classes.infoRow}>
                    <span className={classes.label}>Schedule Id:</span>
                    {auditScheduleData.prefixSuffix}
                  </div>
                  <div className={classes.infoRow}>
                  <span className={classes.label}>Start Time:</span>
                  {selectedTime ? moment(selectedTime).format("DD-MM-YYYY HH:mm") : "N/A"}
                </div>
                  {/* <Grid item xs={12}>
                    <Form.Item label="Start Time">
                      <DatePicker
                        showTime={{ format: "HH:mm" }}
                        format="DD-MM-YYYY HH:mm"
                        value={selectedTime ? dayjs(selectedTime) : null}
                        onChange={handleTimeChange}
                        style={{ width: "100%" }}
                        disabled={!isLoggedInUserHaveEditAccess}
                        disabledDate={disabledDate} // Add this line
                      />
                    </Form.Item>
                  </Grid> */}
                  <div className={classes.infoRow}>
                    <span className={classes.label}>Scheduled By:</span>
                    {auditScheduleData.createdBy}
                  </div>
                </Grid>

                {/* Second Column */}
                <Grid item xs={6}>
                  <div className={classes.infoRow}>
                    <span className={classes.label}>Audit Type:</span>
                    {calendarModalInfo?.data?.auditType}
                  </div>
                  <div className={classes.infoRow}>
                    <span className={classes.label}>Location:</span>
                    {calendarModalInfo?.data?.locationName}
                  </div>
                  <div className={classes.infoRow}>
                    <span className={classes.label}>Department:</span>
                    {calendarModalInfo?.data?.title}
                  </div>
                  <div className={classes.infoRow}>
                    <span className={classes.label}>Schedule Status:</span>
                    {auditScheduleData.isDraft ? "DRAFT" : "PUBLISHED"}
                  </div>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <div className={classes.infoRow}>
                  <span className={classes.label}>Auditor(s):</span>

                  {!!auditorNames &&
                    !!auditorNames?.length &&
                    auditorNames?.map((auditor: any) => auditor).join(", ")}
                </div>
                {/* <Form.Item label="Auditors" name="auditors">
                  <Select
                    mode="multiple"
                    placeholder="Select Auditors"
                    value={selectedAuditors}
                    onChange={setSelectedAuditors}
                    style={{ width: "100%" }}
                  >
                    {auditorsList?.map((auditor: any) => (
                      <Option key={auditor.id} value={auditor.id}>
                        {auditor.username}
                      </Option>
                    ))}
                  </Select>
                </Form.Item> */}
              </Grid>

              <Grid item xs={12}>
                <div className={classes.infoRow}>
                  <span className={classes.label}>Auditee(s):</span>
                  {!!auditeeNames &&
                    !!auditeeNames?.length &&
                    auditeeNames?.map((auditee: any) => auditee).join(", ")}
                </div>
                {/* <Form.Item label="Auditees" name="auditees">
                  <Select
                    mode="multiple"
                    placeholder="Select Auditees"
                    value={selectedAuditees}
                    onChange={setSelectedAuditees}
                    style={{ width: "100%" }}
                  >
                    {!!auditScheduleData &&
                      auditeeList?.map((auditee: any) => (
                        <Option key={auditee.id} value={auditee.id}>
                          {auditee.username}
                        </Option>
                      ))}
                  </Select>
                </Form.Item> */}
              </Grid>
              {/* <Grid
                item
                xs={12}
                style={{ display: "flex", justifyContent: "flex-end" }}
              >
                <Button
                  type="primary"
                  size="small"
                  disabled={!isLoggedInUserHaveEditAccess}
                  onClick={handleModifySchedule}
                  loading={modifyScheduleLoader}
                >
                  Update Schedule
                </Button>
              </Grid> */}
            </div>
          </Form>
          {!!hideButton && calendarModalInfo?.data?.id && (
            <Button
              className={classes.actionButton}
              type="primary"
              shape="round"
              icon={<MdAssessment />}
              size={"middle"}
              disabled={auditScheduleData?.isDraft ? true : false}
              // disabled={disableReportButton}
              style={{ display: "flex", float: "left" }}
              onClick={() => {
                if (isReportExist && isReportinDraftMode) {
                  navigate(`/audit/auditreport/newaudit/${existingReportId}`, {
                    state: {
                      edit: true,
                      id: existingReportId,
                      read: false,
                    },
                  });
                } else if (isReportExist && !isReportinDraftMode) {
                  navigate(`/audit/auditreport/newaudit/${existingReportId}`, {
                    state: {
                      edit: isOrgAdmin || isMR || isLocAdmin,
                      id: existingReportId,
                      read: true,
                    },
                  });
                } else {
                  navigate("/audit/auditreport/newaudit", {
                    state: {
                      auditScheduleId: calendarModalInfo?.data?.auditScheduleId,
                      entityName: calendarModalInfo?.data?.entityName,
                      disableFields: true,
                      auditScheduleName: auditScheduleData?.auditScheduleName,
                    },
                  });
                }
              }}
            >
              {isReportExist && isReportinDraftMode && "Edit Audit Report"}
              {isReportExist && !isReportinDraftMode && "View Audit Report"}
              {!isReportExist && "Create Audit Report"}
            </Button>
          )}
          <Button
            className={classes.actionButton}
            type="primary"
            shape="round"
            // icon={<MdEvent />}
            size={"middle"}
            style={{ display: "flex", float: "right" }}
            // onClick={() => navigate(calendarModalInfo?.data?.url)}
            onClick={handleOpenScheduleFormEditMode}
          >
            Open Schedule Form
          </Button>
        </>
      ) : (
        <>
          <div className={classes.modalContent}>
            <div className={classes.infoRow}>
              <span className={classes.label}>Audit Type:</span>
              {calendarModalInfo?.data?.title}
            </div>

            <Button
              className={classes.actionButton}
              type="primary"
              shape="round"
              icon={<MdAssessment />}
              size={"middle"}
              style={{ display: "flex", float: "right" }}
              onClick={() =>
                navigate(
                  `/audit/auditreport/newaudit/${calendarModalInfo?.data.id}`
                )
              }
            >
              View Audit Report
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
};
export default AuditScheduleCalendarModal;
