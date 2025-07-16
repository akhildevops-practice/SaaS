import React, { useEffect, useRef, useState } from "react";
// import useStyles from "components/AuditPlanForm1/styles";
import {
  Button,
  Col,
  Modal,
  Row,
  Tour,
  TourProps,
  Select as AntdSelect,
} from "antd";
import checkRoles from "utils/checkRoles";
import { roles } from "utils/enums";
import {
  CircularProgress,
  makeStyles,
  useMediaQuery,
} from "@material-ui/core";
import axios from "apis/axios.global";
import IconButton from "@material-ui/core/IconButton";
import getAppUrl from "utils/getAppUrl";
import getSessionStorage from "utils/getSessionStorage";
import { MdComment } from 'react-icons/md';
import CommentsModal from "./CommentsModal";
import { DatePicker } from "antd";
import UsersSelectionsGrid from "./UsersSelectionsGrid";
import AuditorsSelectionGrid from "./AuditorsSelectionGrid";
import { Form } from "antd";
import dayjs from "dayjs";
import draftImage from "assets/icons/draftIcon.png";
import finalisedImage from "assets/images/finalisedImage.png";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import { useSnackbar } from "notistack";
import { MdTouchApp } from 'react-icons/md';

type Props = {
  auditFinaliseDateModal?: any;
  toggleFinaliseDateModal?: any;
  auditPlanData?: any;
  formData?: any;
  setFormData?: any;
  // onFinaliseDateUpdate?: any;
  currentRowId?: any;
  finalisedDateObject?: any;
  setFinalisedDateObject?: any;
  finalisedDateRange?: any;
  setFinalisedDateRange?: any;
  closeCreateAuditFinaliseModal?: any;
  usersSelectionGridRows?: any;
  setUsersSelectionGridRows?: any;
  auditorsRows?: any;
  setAuditorsRows?: any;

  unitHead?: any;
  setUnitHead?: any;
  imscoordinator?: any;
  setImsCoordinator?: any;
  otherUsers?: any;
  setOtherUsers?: any;

  comments?: any;
  setComments?: any;
  commentText?: any;
  setCommentText?: any;

  sendMail?: any;
  auditPlanId?: any;

  planDetails?: any;
  setUserAcceptFlag?: any;
  teamLeadId?: any;
  setTeamLeadId?: any;
  selectedAuditPeriod?: any;
  setSelectedAuditPeriod?: any;
};

const useStyles = (matches: any) =>
  makeStyles((theme) => ({
    infoDrawer: {
      "& .ant-drawer-header": {
        backgroundColor: "aliceblue",
        textAlign: "center",
        padding: "10px 20px",
        borderBottom: "none",
      },
      borderBottomRightRadius: "10px",
      borderBottomLeftRadius: "10px",
    },
    modalContent: {
      "& .ant-modal-body": {
        height: "80vh",
        overflowY: "scroll",
      },
      "& .ant-form-item .ant-form-item-label >label": {
        color: "#003566",
        fontSize: "medium",
        fontWeight: "bold",
        letterSpacing: "0.5px",
      },
    },
    infoContent: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      padding: "10px",
      backgroundColor: "#f5f5f5",
      borderRadius: "10px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
      margin: "10px 0",
      marginRight: "10px",
    },
    infoRow: {
      width: "100%",
      display: "flex",
      flexDirection: matches ? "row" : "column",
      justifyContent: "space-between",
      padding: "10px 0",
      // borderBottom: "1px solid #e0e0e0",
    },
    infoLabel: {
      fontWeight: "bold",
      fontSize: "1rem",
    },
  }));

const AuditFinaliseDateModal = ({
  auditFinaliseDateModal,
  toggleFinaliseDateModal,
  auditPlanData,
  formData,
  setFormData,
  // onFinaliseDateUpdate,
  currentRowId,
  finalisedDateObject,
  setFinalisedDateObject,
  finalisedDateRange,
  setFinalisedDateRange,
  closeCreateAuditFinaliseModal,
  usersSelectionGridRows,
  setUsersSelectionGridRows,
  auditorsRows,
  setAuditorsRows,

  unitHead,
  setUnitHead,
  imscoordinator,
  setImsCoordinator,
  otherUsers,
  setOtherUsers,

  comments,
  setComments,
  commentText,
  setCommentText,

  sendMail,
  auditPlanId,
  planDetails,
  setUserAcceptFlag,
  teamLeadId = null,
  setTeamLeadId,
  selectedAuditPeriod = "",
  setSelectedAuditPeriod,
}: Props) => {
  const matches = useMediaQuery("(min-width:820px)");
  const smallScreen = useMediaQuery("(min-width:470px)");
  const classes = useStyles(matches)();
  const { enqueueSnackbar } = useSnackbar();
  const realmName = getAppUrl();
  const isMR = checkRoles(roles.MR);
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // const [commentText, setCommentText] = useState<any>("");
  // const [comments, setComments] = useState<any>([]);
  const userInfo = getSessionStorage();

  const [commentsModal, setCommentsModal] = useState<any>({
    open: false,
    data: {}, //should have auditPlaunUnitWise something id inorder to show saved comments
  });

  const { RangePicker } = DatePicker;
  const [errors, setErrors] = useState<{ finalisedDateRange?: string }>({});
  const [disableFieldsForOtherUsers, setDisableFieldsForOtherUser] =
    useState<any>(false);
  const [plannedBy, setPlannedBy] = useState<any>(null);

  //isDraft = false means the finalised date is finalised
  const [isDraft, setIsDraft] = useState<any>(false);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);

  const [disableSubmitForOtherUsers, setDisableSubmitForOtherUsers] =
    useState<any>(false);
  const [auditPeriodOptions, setAuditPeriodOptions] = useState<any>([]);

  const validateFields = () => {
    let tempErrors = {};

    if (!finalisedDateRange?.fromDate || !finalisedDateRange?.toDate) {
      tempErrors = {
        ...tempErrors,
        finalisedDateRange: "Please select a valid date range.",
      };
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0; // Returns true if no errors
  };

  useEffect(() => {
    if (auditFinaliseDateModal?.mode === "edit") {
      fetchAuditPlanUnitWiseById();
    }

    const options = getFormattedMonths(planDetails);
    setAuditPeriodOptions(
      options?.map((item: any) => ({ label: item, value: item }))
    );
  }, [auditFinaliseDateModal, planDetails]);

  useEffect(() => {
    console.log(
      "checkauditnew inside auditfinalised modal useffect[auditperiodoptions]",
      auditPeriodOptions
    );
  }, [auditPeriodOptions]);

  // useEffect(()=>{
  //   console.log("checkauditnew auditplandata in finalised modal", auditPlanData);

  // },[auditPlanData])

  // useEffect(() => {
  //   console.log(
  //     "checkaudit [disableSubmitForOtherUsers]",
  //     disableSubmitForOtherUsers
  //   );
  // }, [disableSubmitForOtherUsers]);

  const getFormattedMonths = (planDetails: any) => {
    const monthsJanToDec = [
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

    const monthsAprToMar = [
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
      "January",
      "February",
      "March",
    ];

    const months =
      planDetails?.format === "Jan - Dec" ? monthsJanToDec : monthsAprToMar;
    const formattedMonths: any = [];

    planDetails.rowMonths?.forEach((month: any, index: any) => {
      if (month) {
        formattedMonths.push(months[index]);
      }
    });

    return formattedMonths;
  };

  const doesUserExistWithWaitingStatus = (unitWiseObj: any) => {
    // Check unithead and imscoordinator
    if (
      (unitWiseObj?.unithead?.id === userInfo?.id &&
        unitWiseObj?.unithead?.accepted === "WAITING") ||
      (unitWiseObj?.imscoordinator?.id === userInfo?.id &&
        unitWiseObj?.imscoordinator?.accepted === "WAITING")
    ) {
      return true;
    }

    // Check auditors and otherUsers
    const users = [...unitWiseObj?.auditors, ...unitWiseObj?.otherUsers];
    return users?.some(
      (user: any) => user?.id === userInfo?.id && user?.accepted === "WAITING"
    );
  };

  const IsLoggedInUserNotCreator = (data: any) => {
    // console.log(
    //   "checkaudit1 createdby, userinfo id, conditon",
    //   data.plannedBy,
    //   userInfo.id,
    //   data?.createdBy !== userInfo?.id
    // );

    return data?.plannedBy !== userInfo?.id;
  };

  const formatResponseForUserSelectionGrid = (response: any) => {
    // console.log(
    //   "checkaudit1 response in formatResponseSelectionGrid",
    //   response
    // );

    try {
      const formatUser = (user: any, role: any) => ({
        name: {
          id: user?.id || "",
          username: user?.username || "",
          email: user?.email || "",
          avatar: user?.avatar || "",
          firstname: user?.firstname || "",
          lastname: user?.lastname || "",
        },
        location: user?.location?.locationName, // The API response doesn't provide a direct location field for these users.
        role: role,
        accepted: user?.accepted || "WAITING",
      });

      const unitHeadFormatted = formatUser(response.unithead, "Head");
      // console.log("checkaudit1 unitHeadFormmated--->", unitHeadFormatted);

      const imscoordinatorFormatted = formatUser(
        response.imscoordinator,
        "IMSC"
      );

      // console.log("checkaudit1 imscoordformat", imscoordinatorFormatted);

      const otherUsersFormatted = response.otherUsers.map((user: any) =>
        formatUser(user, "")
      ); // Using an empty string for role as the API doesn't provide it.
      const auditors = response.auditors.map((user: any) =>
        formatUser(user, "AUDITOR")
      );
      // console.log("checkaudit1 auditorsFormat", auditors);

      return {
        unitHead: unitHeadFormatted,
        imscoordinator: imscoordinatorFormatted,
        otherUsers: otherUsersFormatted,
        auditors: auditors,
      };
    } catch (error) {
      console.log("checkaudit1 error in formatResponse--->", error);
    }
  };
  const disabledRangeDate = (current: any) => {
    // Can not select days before today
    return current && current < dayjs().startOf("day");
  };
  const fetchAuditPlanUnitWiseById = async () => {
    try {
      setIsDataLoading(true);
      const res = await axios.get(
        `/api/auditplan/getAuditPlanUnitwiseById/${finalisedDateObject?._id}`
      );
      if (res.status === 200 || res.status === 201) {
        // console.log("checkaudit1 fetchAuditPlanUnitWiseById-->", res.data);

        const formattedData: any = formatResponseForUserSelectionGrid(
          res?.data
        );
        // console.log("checkaudit1 formatted Data--->", formattedData);
        setFinalisedDateObject(res?.data);
        setUnitHead(formattedData?.unitHead);
        setImsCoordinator(formattedData?.imscoordinator);
        setOtherUsers([...formattedData?.otherUsers]);
        setAuditorsRows([...formattedData?.auditors]);
        setFinalisedDateRange({
          fromDate: res?.data?.fromDate,
          toDate: res?.data?.toDate,
        });
        setPlannedBy(res?.data?.plannedBy);
        setComments(res?.data?.comments);
        setIsDraft(res?.data?.isDraft);
        setDisableFieldsForOtherUser(IsLoggedInUserNotCreator(res.data));
        setTeamLeadId(res?.data?.teamLeadId);
        setSelectedAuditPeriod(res?.data?.auditPeriod);
        const result = doesUserExistWithWaitingStatus(res.data);
        // console.log("checkaudit result-->", result);

        setDisableSubmitForOtherUsers(!result);
        setIsDataLoading(false);
      } else {
        setIsDataLoading(false);
        enqueueSnackbar(`Error in Loading Data of this Finalised Data!`, {
          variant: "error",
          autoHideDuration: 1500,
        });
        // console.log(
        //   "checkaudit status not 200 fetchAuditPlanUnitWiseById-->",
        //   res.data
        // );
      }
    } catch (error) {
      enqueueSnackbar(`Error in Loading Data of this Finalised Data!`, {
        variant: "error",
        autoHideDuration: 1500,
      });
      // console.log("checkaudit error in fetchAuditPlanUnitWiseById-->", error);
    }
  };

  const toggleCommentsModal = () => {
    setCommentsModal({
      ...commentsModal,
      open: !commentsModal.open,
    });
  };

  const handleDateChange = (dates: any) => {
    // console.log("checkaudit handleDate Change dates", dates);
    if (!dates) {
      // Handle the case when dates are cleared
      // For example, reset the finalisedDateRange state or perform any other necessary action
      setFinalisedDateRange({ fromDate: null, toDate: null });
    } else {
      const [startDate, endDate] = dates;
      setFinalisedDateRange({
        fromDate: startDate.toDate().toISOString(),
        toDate: endDate.toDate().toISOString(),
      });
    }
  };

  const handleSubmitModal = (
    isDraft: any = false,
    isFinalise: any = false,
    isInform: any = false,
    justUpdateAcceptedFlag: any = false
  ) => {
    // console.log(
    //   "checkaudit10 inside handleSUbmitModal isDraft, isFinalise, isInform, justUpdateAcceptedFlag",
    //   isDraft,
    //   isFinalise,
    //   isInform,
    //   justUpdateAcceptedFlag
    // );
    // console.log(
    //   "checkaudit10 inside handlesubmitmodal validatefields()",
    //   validateFields()
    // );

    if (validateFields()) {
      closeCreateAuditFinaliseModal(
        isDraft,
        isFinalise,
        isInform,
        justUpdateAcceptedFlag
      );
    }
    // if(auditFinaliseDateModal?.mode === "create") {
    //   closeCreateAuditFinaliseModal();

    // } else {

    // }
  };

  const handleResendMail = async () => {
    if (auditFinaliseDateModal?.mode === "edit" && !!auditPlanId) {
      // console.log("checkaudit finalised object-->", finalisedDateObject);
      const mailUsers = [];
      auditorsRows?.map((user: any) => {
        if (user.accepted === "WAITING") {
          mailUsers.push({
            email: user.name.email,
            username: user.name.username,
          });
        }
      });
      if (unitHead.accepted === "WAITING") {
        mailUsers?.push({
          email: unitHead.name.email,
          username: unitHead.name.username,
        });
      }
      if (imscoordinator.accepted === "WAITING") {
        mailUsers?.push({
          email: imscoordinator.name.email,
          username: imscoordinator.name.username,
        });
      }
      if (!!otherUsers && otherUsers.length > 0) {
        otherUsers?.map((user: any) => {
          if (user.accepted === "WAITING") {
            mailUsers.push({
              email: user.name.email,
              username: user.name.username,
            });
          }
        });
      }
      sendMail(mailUsers, {
        auditPlanId: auditPlanId,
        auditplanunitwiseId: finalisedDateObject?._id,
      });
    } else return;
  };

  const combinedData = { ...auditPlanData, ...planDetails };

  //Help Guide tour

  const [openTourForAuditPlanModelFA, setOpenTourForAuditPlanModelFA] =
    useState<boolean>(false);

  const refForAuditPlanModelFA1 = useRef(null);
  const refForAuditPlanModelFA2 = useRef(null);
  const refForAuditPlanModelFA3 = useRef(null);
  const refForAuditPlanModelFA4 = useRef(null);
  const refForAuditPlanModelFA5 = useRef(null);
  const refForAuditPlanModelFA6 = useRef(null);
  const refForAuditPlanModelFA7 = useRef(null);
  const refForAuditPlanModelFA8 = useRef(null);

  const stepsForAuditPlanModel: TourProps["steps"] = [
    {
      title: "Finalized Dates",
      description:
        "Planner selects the proposed audit dates for the unit . Planner can change the proposed dates and inform the participants as required ",

      target: () =>
        refForAuditPlanModelFA1.current
          ? refForAuditPlanModelFA1.current
          : null,
    },

    {
      title: "Add /View Comments",
      description:
        "Planners ,Auditors and other stakeholders can. Update their comments while inviting and accepting or rejecting proposed dates. All of the added comments are seen by the stakeholders included in this form ",
      target: () => refForAuditPlanModelFA2.current,
    },
    {
      title: "Unit Coordinator",
      description:
        "Unit Coordinator and IMS Coordinators can be selected by the planner for information and acceptance . Users will be sent an email , Users can also see the notifcations via application inbox and accept or reject the schedule . Planners can add additional members from unit for information and acceptance",
      target: () => refForAuditPlanModelFA3.current,
    },
    {
      title: "Accepted /Rejected",
      description:
        "All of the selected users will be able to accept or reject the proposed dates ",

      target: () =>
        refForAuditPlanModelFA4.current
          ? refForAuditPlanModelFA4.current
          : null,
    },
    {
      title: "Use Search Filters",
      description:
        "Planners can search for auditors by criteria displayed such as systems, functions and proficiencies. On click of the search button system will run a search on auditors stored in auditor profiles to match the selected criteria and return results . Select the auditors from the returned results .",
      target: () => refForAuditPlanModelFA5.current,
    },
    {
      title: "Add",
      description:
        "This option should be used to add auditors . Auditors displayed in the Name field uses the audit type  and system criteria to fetch the names. Select one auditor per row ",
      target: () =>
        refForAuditPlanModelFA6.current
          ? refForAuditPlanModelFA6.current
          : null,
    },
    {
      title: "Team Lead",
      description:
        " One team lead can be selected for the audit. Selected team lead will be required to select auditor and audit checklist in the audit schedule form.",

      target: () =>
        refForAuditPlanModelFA7.current
          ? refForAuditPlanModelFA7.current
          : null,
    },
  ];

  return (
    <div>
      <Modal
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          ></div>
        }
        centered
        open={auditFinaliseDateModal.open}
        onCancel={toggleFinaliseDateModal}
        onOk={toggleFinaliseDateModal}
        width={matches ? "80%" : "90%"}
        footer={null}
        maskClosable={false}
        className={classes.modalContent}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{ width: "36px", height: "38px", cursor: "pointer" }}
          />
        }
      >
        <div style={{ width: "95%", display: "flex", justifyContent: "end" }}>
          <MdTouchApp
            style={{ cursor: "pointer" }}
            onClick={() => {
              setOpenTourForAuditPlanModelFA(true);
            }}
          />
        </div>
        {isDataLoading ? (
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
            <div className={classes.infoContent}>
              <Row className={classes.infoRow}>
                <Col span={matches ? 6 : 24}>
                  <div className={classes.infoLabel}>Audit Name:</div>{" "}
                  {auditPlanData?.auditName || "N/A"}
                </Col>
                <Col span={matches ? 6 : 24}>
                  <div className={classes.infoLabel}>Audit Type:</div>
                  {auditPlanData?.auditTypeName || "N/A"}
                </Col>
                <Col span={matches ? 6 : 24}>
                  <div className={classes.infoLabel}>Location:</div>{" "}
                  {planDetails?.unitName || "N/A"}
                </Col>
                <Col span={matches ? 4 : 24}>
                  <div className={classes.infoLabel}>Planned By:</div>{" "}
                  {auditPlanData?.createdBy || "N/A"}
                </Col>
                <Col span={2}>
                  {/* <div className={classes.infoLabel}>Status:</div>{" "} */}
                  {isDraft && auditFinaliseDateModal?.mode === "edit" && (
                    <img
                      src={draftImage}
                      style={{
                        width: "100px",
                        height: "42px",
                        marginRight: "5px",
                      }}
                      alt="Draft"
                    />
                  )}
                  {!isDraft && auditFinaliseDateModal?.mode === "edit" && (
                    <img
                      src={finalisedImage}
                      style={{
                        width: "100px",
                        height: "42px",
                        marginRight: "5px",
                      }}
                      alt="finalisedImage"
                    />
                  )}
                </Col>
              </Row>
            </div>
            {isLoading ? (
              <>
                <CircularProgress />
              </>
            ) : (
              <>
                <div
                  style={{
                    marginTop: "15px",
                    display: "flex",
                    flexDirection: matches ? "row" : "column",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Form.Item
                    label="Audit Period"
                    style={{
                      color: "#003566",
                      fontSize: "0.875rem",
                      flex: 1, // This makes sure the Form.Item takes the remaining available space
                      width: "100%",
                      marginRight: matches ? "10px" : "0px", // Adds some spacing between the RangePicker and the button
                    }}
                    labelCol={{ span: matches ? 0 : 24 }} // This moves the label to occupy the entire width
                    wrapperCol={{ span: matches ? 0 : 24 }}
                  >
                    <div
                      style={{
                        width: matches ? "200px" : "97%",
                      }}
                    >
                      <AntdSelect
                        allowClear
                        style={{ width: matches ? "200px" : "100%" }}
                        placeholder="Select Audit Period"
                        value={selectedAuditPeriod}
                        onChange={(value) => setSelectedAuditPeriod(value)}
                        options={auditPeriodOptions}
                      />
                    </div>
                  </Form.Item>
                  <Form.Item
                    label="Finalised Date"
                    style={{
                      color: "#003566",
                      fontSize: "0.875rem",
                      flex: 1, // This makes sure the Form.Item takes the remaining available space
                      marginRight: "10px", // Adds some spacing between the RangePicker and the button
                    }}
                    validateStatus={
                      errors.finalisedDateRange ? "error" : undefined
                    }
                    help={errors.finalisedDateRange || undefined}
                  >
                    <div ref={refForAuditPlanModelFA1}>
                      <RangePicker
                        format="DD-MM-YYYY"
                        value={[
                          finalisedDateRange?.fromDate
                            ? dayjs(finalisedDateRange?.fromDate)
                            : null,
                          finalisedDateRange?.toDate
                            ? dayjs(finalisedDateRange?.toDate)
                            : null,
                        ]}
                        onChange={handleDateChange}
                        disabled={
                          disableFieldsForOtherUsers ||
                          (!isDraft && auditFinaliseDateModal?.mode === "edit")
                        }
                        disabledDate={disabledRangeDate} // Add this line
                      />
                    </div>
                  </Form.Item>

                  {/* {auditFinaliseDateModal?.mode === "edit" &&
                    plannedBy === userInfo?.id && (
                      <IconButton color="primary" onClick={handleResendMail}>
                        <MdMail />
                        <span
                          style={{ marginLeft: "10px", fontSize: "0.875rem" }}
                        >
                          Resend Invites
                        </span>
                      </IconButton>
                    )} */}
                  <div ref={refForAuditPlanModelFA2}>
                    <IconButton color="primary" onClick={toggleCommentsModal}>
                      <MdComment />
                      <span
                        style={{ marginLeft: "10px", fontSize: "0.875rem" }}
                      >
                        Add/View Comments
                      </span>
                    </IconButton>
                  </div>
                </div>

                <div ref={refForAuditPlanModelFA3}>
                  <UsersSelectionsGrid
                    usersSelectionGridRows={usersSelectionGridRows}
                    setUsersSelectionGridRows={setUsersSelectionGridRows}
                    unitHead={unitHead}
                    setUnitHead={setUnitHead}
                    imscoordinator={imscoordinator}
                    setImsCoordinator={setImsCoordinator}
                    otherUsers={otherUsers}
                    setOtherUsers={setOtherUsers}
                    planDetails={planDetails}
                    setUserAcceptFlag={setUserAcceptFlag}
                    disableFieldsForOtherUsers={disableFieldsForOtherUsers}
                    auditPlanUnitWiseId={finalisedDateObject?._id}
                    plannedBy={plannedBy}
                    handleSubmitModal={handleSubmitModal}
                    refForAuditPlanModelFA4={refForAuditPlanModelFA4}
                  />
                </div>

                <br />
                <AuditorsSelectionGrid
                  auditorsRows={auditorsRows}
                  setAuditorsRows={setAuditorsRows}
                  auditPlanData={combinedData}
                  setUserAcceptFlag={setUserAcceptFlag}
                  disableFieldsForOtherUsers={disableFieldsForOtherUsers}
                  teamLeadId={teamLeadId}
                  setTeamLeadId={setTeamLeadId}
                  planDetails={planDetails}
                  auditPlanUnitWiseId={finalisedDateObject?._id}
                  plannedBy={plannedBy}
                  handleSubmitModal={handleSubmitModal}
                  refForAuditPlanModelFA5={refForAuditPlanModelFA5}
                  refForAuditPlanModelFA6={refForAuditPlanModelFA6}
                  refForAuditPlanModelFA7={refForAuditPlanModelFA7}
                />
              </>
            )}

            {auditFinaliseDateModal?.mode !== "edit" && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "20px",
                }}
              >
                <Button
                  type="primary"
                  style={{ marginRight: "10px" }}
                  onClick={() => handleSubmitModal(true, false, false, false)}
                >
                  Save As Draft
                </Button>
                <Button
                  type="primary"
                  style={{ marginRight: "10px" }}
                  onClick={() => handleSubmitModal(true, false, true, false)}
                >
                  Submit & Inform
                </Button>
              </div>
            )}
            {auditFinaliseDateModal?.mode === "edit" && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "20px",
                }}
              >
                {userInfo?.id !== plannedBy && !disableSubmitForOtherUsers && (
                  <Button
                    type="primary"
                    style={{ marginRight: "10px" }}
                    onClick={() => handleSubmitModal(true, false, true, false)}
                  >
                    Submit & Inform
                  </Button>
                )}
                {userInfo?.id === plannedBy && (
                  <>
                    {isDraft && (
                      <>
                        <Button
                          type="primary"
                          style={{ marginRight: "10px" }}
                          onClick={() =>
                            handleSubmitModal(true, false, false, false)
                          }
                        >
                          Save As Draft
                        </Button>
                        <Button
                          type="primary"
                          style={{ marginRight: "10px" }}
                          onClick={() =>
                            handleSubmitModal(true, false, true, false)
                          }
                        >
                          Submit & Inform
                        </Button>
                      </>
                    )}

                    <Button
                      type="primary"
                      style={{ marginRight: "10px" }}
                      onClick={() =>
                        handleSubmitModal(false, true, true, false)
                      }
                    >
                      Finalise & Inform
                    </Button>
                  </>
                )}
              </div>
            )}
            {!!commentsModal.open && (
              <>
                <CommentsModal
                  commentsModal={commentsModal}
                  toggleCommentsModal={toggleCommentsModal}
                  comments={comments}
                  setComments={setComments}
                  commentText={commentText}
                  setCommentText={setCommentText}
                  auditPlanUnitWiseId={finalisedDateObject?._id}
                />
              </>
            )}
          </>
        )}
      </Modal>

      <Tour
        open={openTourForAuditPlanModelFA}
        onClose={() => setOpenTourForAuditPlanModelFA(false)}
        steps={stepsForAuditPlanModel}
      />
    </div>
  );
};

export default AuditFinaliseDateModal;
