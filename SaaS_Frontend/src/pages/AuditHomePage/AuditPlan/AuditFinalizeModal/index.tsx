import axios from "apis/axios.global";
import AuditFinaliseDateModal from "components/AuditPlanForm3/AuditFinaliseDateModal";
import { useSnackbar } from "notistack";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import getAppUrl from "utils/getAppUrl";
import getSessionStorage from "utils/getSessionStorage";

type props = {
  isEdit?: boolean;
  auditPlanData: any;
  setOpenAuditFinalize: any;
  openAuditFinalize?: any;
  mode?: any;
};
const AuditFinalizeModal = ({
  isEdit = false,
  auditPlanData,
  openAuditFinalize,
  setOpenAuditFinalize,
  mode,
}: props) => {
  const [auditFinaliseDateModal, setAuditFinaliseDateModal] = useState({
    open: true,
    data: {},
    mode: mode === "edit" ? "edit" : "create",
  });
  const userDetails = getSessionStorage();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const realmName = getAppUrl();

  const [dataLoading, setDataLoading] = useState<any>(false);

  const [currentRowId, setCurrentRowId] = useState<any>("");
  const [formData, setFormData] = useState<any>({
    unitHead: [
      {
        name: "",
      },
    ],
    auditors: [
      {
        name: "",
      },
    ],
  });
  const [finalisedDateObject, setFinalisedDateObject] = useState<any>(
    auditPlanData?.auditPlanUnitData
  );
  const [finalisedDateRange, setFinalisedDateRange] = useState<any>({
    fromDate: null,
    toDate: null,
  });
  const [unitHead, setUnitHead] = useState({
    name: { id: "", username: "", email: "", avatar: "" },
    location: "",
    role: "Head",
    accepted: "WAITING",
  });

  const [imscoordinator, setImsCoordinator] = useState({
    name: { id: "", username: "", email: "", avatar: "" },
    location: "",
    role: "IMSC",
    accepted: "WAITING",
  });
  const [auditorsRows, setAuditorsRows] = useState<any>([
    {
      name: { id: "", username: "", email: "", avatar: "" },
      location: "",
      role: "AUDITOR",
      accepted: "WAITING",
    },
  ]);
  const [otherUsers, setOtherUsers] = useState([]);
  const [usersSelectionGridRows, setUsersSelectionGridRows] = useState<any>([
    unitHead,
    imscoordinator,
    ...otherUsers,
  ]);

  const [userAcceptFlag, setUserAcceptFlag] = useState<any>([]);
  const [comments, setComments] = useState<any>([]);
  const [planDetails, setPlanDetails] = useState<any>({
    auditPlanId: auditPlanData?.auditPlanId,
    unitId: auditPlanData?.unitId,
    unitName: auditPlanData?.unitName,
    rowMonths: auditPlanData?.rowMonths,
    format: auditPlanData?.format,
  });
  const [teamLeadId, setTeamLeadId] = useState<any>(null);
  const [selectedAuditPeriod, setSelectedAuditPeriod] = useState<any>("");
  const [allAuditPlanUnitWise, setAllAuditPlanUnitWise] = useState<any>([]);
  const [commentText, setCommentText] = useState<any>("");


  const toggleAuditFinaliseDateModal = () => {
    setOpenAuditFinalize(!openAuditFinalize);
  };

  const handleUpdateJustAccepetedFlag = async (
    data: any,
    id: any,
    mailUsers: any
  ) => {
    try {
      // console.log("checkauditnew in handleUpdateJustAccepetedFlag", id);
      const { plannedBy, fromDate, toDate, ...newData } = data;
      let finalData = {
        ...newData,
      };

      // console.log("checkauditnew userAccepte Flag --->", userAcceptFlag);

      // if (!!userAcceptFlag?.length) {
      // console.log("checkauditnew useAcceptegflag", userAcceptFlag);

      if (haveAllUsersAccepted(data)) {
        finalData = {
          ...finalData,
          isDraft: false,
        };
      }
      // }

      const res = await axios.patch(
        `/api/auditPlan/updateAuditPlanUnitwise/${id}`,
        finalData
      );
      if (res.status === 200 || res.status === 201) {
        // console.log("checkaudit audit plan updated successfully", res);
        setOpenAuditFinalize(!openAuditFinalize);
        getAllFinalizedDatesForAuditPlan();
        enqueueSnackbar("Successully Updated Finalised Date!", {
          variant: "success",
          autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
        });
        navigate("/audit");
        if (userAcceptFlag?.length) {
          sendConfirmationMail(mailUsers, {
            auditPlanId: auditPlanData?.auditPlanId,
            auditplanunitwiseId: id,
          });
        }
      } else {
        enqueueSnackbar("Error in Updating Finalised Date!", {
          variant: "error",
          autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
        });
        // console.log("checkaudit error in creating audit plan unit wise", res);
      }
    } catch (error) {
      enqueueSnackbar("Error in Updating Finalised Date!", {
        variant: "error",
        autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
      });
      // console.log("checkaudit error in creating audit plan unit wise", error);
    }
  };

  const sendConfirmationMail = async (data: any, queryData: any) => {
    try {
      // console.log("checkaudit in sendMail data", data);
      let url;
      if (process.env.REACT_APP_REDIRECT_URL?.includes("adityabirla.com")) {
        url = `${process.env.REACT_APP_REDIRECT_URL}/audit/auditplan/auditplanform/${queryData.auditPlanId}?auditplanunitwiseId=${queryData.auditplanunitwiseId}`;
      } else {
        url = `${realmName}.${process.env.REACT_APP_REDIRECT_URL}/audit/auditplan/auditplanform/${queryData.auditPlanId}?auditplanunitwiseId=${queryData.auditplanunitwiseId}`;
      }
      const body = {
        mailUsers: [...data],
        user: userAcceptFlag[0],
        url: url,
      };
      const res = await axios.post(`/api/auditPlan/sendConfirmationMail`, body);
      if (res.status === 200 || res.status === 201) {
        // console.log("checkaudit Mail Has Been Sent Succesffully");
        enqueueSnackbar("Mail Has Been Sent Successfully!", {
          variant: "success",
          autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
        });
      } else {
        enqueueSnackbar("Error in Sending Mail!", {
          variant: "error",
          autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
        });
        // console.log("checkaudit error in creating audit plan unit wise", res);
      }
    } catch (error) {
      enqueueSnackbar("Error in Sending Mail!", {
        variant: "error",
        autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
      });
      // console.log("checkaudit error in creating audit plan unit wise", error);
    }
  };

  const getAllFinalizedDatesForAuditPlan = async () => {
    try {
      setDataLoading(true);
      // console.log("checkaudit auditPlainId", auditPlanData?.auditPlanId);

      const res = await axios.get(
        `/api/auditPlan/getAllAuditPlanFinalizedDatesById/${auditPlanData?.auditPlanId}`
      );
      // console.log("checkaudit getalluit wise called", res.data);

      if (res.status === 200 || res.status === 201) {
        setDataLoading(false);
        setAllAuditPlanUnitWise(res.data);
        // enqueueSnackbar("Fetched All Finalised Dates Successfully!", {
        //   variant: "success",
        //   autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
        // });
      } else {
        setDataLoading(false);
        enqueueSnackbar("Error in Fetching All Finalised Dates!", {
          variant: "error",
          autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
        });
        // console.log("checkaudit error in getting audit unit wise", res);
      }
    } catch (error) {
      setDataLoading(false);
      enqueueSnackbar("Error in Fetching All Finalised Dates!", {
        variant: "error",
        autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
      });
      // console.log("checkaudit error in getting audit unit wise");
    }
  };

  const haveAllUsersAccepted = (data: any) => {
    const { unitHead, imsCoordinator, auditors, otherUsers } = data;

    if (
      unitHead.accepted !== "ACCEPTED" ||
      imsCoordinator.accepted !== "ACCEPTED"
    ) {
      return false;
    }

    for (const auditor of auditors) {
      if (auditor.accepted !== "ACCEPTED") {
        return false;
      }
    }

    for (const user of otherUsers) {
      if (user.accepted !== "ACCEPTED") {
        return false;
      }
    }

    return true;
  };

  const sendMailAfterUpdate = async (data: any, queryData: any) => {
    try {
      // console.log("checkaudit in sendMail data", data);
      let url;
      if (process.env.REACT_APP_REDIRECT_URL?.includes("adityabirla.com")) {
        url = `${process.env.REACT_APP_REDIRECT_URL}/audit/auditplan/auditplanform/${queryData.auditPlanId}?auditplanunitwiseId=${queryData.auditplanunitwiseId}`;
      } else {
        url = `${realmName}.${process.env.REACT_APP_REDIRECT_URL}/audit/auditplan/auditplanform/${queryData.auditPlanId}?auditplanunitwiseId=${queryData.auditplanunitwiseId}`;
      }
      const body = {
        mailUsers: [...data],
        url: url,
        auditPlanUnitWiseData: queryData?.auditPlanUnitWiseData,
        isFinalise: queryData?.isFinalise,
      };
      const res = await axios.post(`/api/auditPlan/sendMailAfterUpdate`, body);
      if (res.status === 200 || res.status === 201) {
        // console.log("checkaudit Mail Has Been Sent Succesffully");
        enqueueSnackbar("Mail Has Been Sent Successfully!", {
          variant: "success",
          autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
        });
      } else {
        enqueueSnackbar("Error in Sending Mail!", {
          variant: "error",
          autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
        });
        // console.log("checkaudit error in creating audit plan unit wise", res);
      }
    } catch (error) {
      enqueueSnackbar("Error in Sending Mail!", {
        variant: "error",
        autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
      });
      // console.log("checkaudit error in creating audit plan unit wise", error);
    }
  };
  const handleSaveAsDraft = async (
    data: any,
    id = "",
    isInform: any = false,
    mailUsers: any = [],
    isFinalise: any = false
  ) => {
    try {
      if (id) {
        //update the existing finalised unitwiseaudit plan, mails wont be send
        const { plannedBy, ...newData } = data;
        const res = await axios.patch(
          `/api/auditPlan/updateAuditPlanUnitwise/${id}`,
          { ...newData, isDraft: true }
        );
        if (res.status === 200 || res.status === 201) {
          // console.log("checkaudit audit plan updated successfully", res);
          setOpenAuditFinalize(!openAuditFinalize);
          getAllFinalizedDatesForAuditPlan();
          enqueueSnackbar("Successully Updated Finalised Date!", {
            variant: "success",
            autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
          });
          if (!!isInform && mailUsers?.length) {
            if (userAcceptFlag?.length) {
              sendConfirmationMail(mailUsers, {
                auditPlanId: auditPlanData?.auditPlanId,
                auditplanunitwiseId: id,
              });
            } else if (!!isInform && mailUsers?.length) {
              sendMailAfterUpdate(mailUsers, {
                auditPlanId: auditPlanData?.auditPlanId,
                auditplanunitwiseId: res.data?._id,
                auditPlanUnitWiseData: res?.data,
              });
            }
          }
        }
      } else {
        //create the finalied plan in draft mode, mails wont be send
        const res = await axios.post("/api/auditPlan/addUnitWiseAuditPlan", {
          ...data,
          isDraft: true,
        });

        if (res.status === 200 || res.status === 201) {
          setOpenAuditFinalize(!openAuditFinalize);
          getAllFinalizedDatesForAuditPlan();
          if (isInform && mailUsers?.length) {
            if (userAcceptFlag?.length) {
              sendConfirmationMail(mailUsers, {
                auditPlanId: auditPlanData?.auditPlanId,
                auditplanunitwiseId: id,
              });
            } else if (!!isInform && mailUsers?.length) {
              sendMail(mailUsers, {
                auditPlanId: auditPlanData?.auditPlanId,
                auditplanunitwiseId: res.data?._id,
                auditPlanUnitWiseData: res?.data,
                isFinalise: isFinalise,
              });
            }
          }
          enqueueSnackbar("Sucessfully Created Finalised Date!", {
            variant: "success",
            autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
          });
        } else {
          // console.log("checkaudit error in creating audit plan unit wise", res);
          enqueueSnackbar("Error in Creating Finalised Date!", {
            variant: "error",
            autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
          });
        }
      }
    } catch (error) {
      console.log(
        "error in handleSave as draft for adding finalised date",
        error
      );
    }
  };

  const sendMail = async (data: any, queryData: any) => {
    try {
      // console.log("checkaudit in sendMail data", data);
      let url;
      if (process.env.REACT_APP_REDIRECT_URL?.includes("adityabirla.com")) {
        url = `${process.env.REACT_APP_REDIRECT_URL}/audit/auditplan/auditplanform/${queryData.auditPlanId}?auditplanunitwiseId=${queryData.auditplanunitwiseId}`;
      } else {
        url = `${realmName}.${process.env.REACT_APP_REDIRECT_URL}/audit/auditplan/auditplanform/${queryData.auditPlanId}?auditplanunitwiseId=${queryData.auditplanunitwiseId}`;
      }
      const body = {
        mailUsers: [...data],
        url: url,
        auditPlanUnitWiseData: queryData?.auditPlanUnitWiseData,
        isFinalise: queryData?.isFinalise,
      };
      const res = await axios.post(
        `/api/auditPlan/sendMailForAcceptance`,
        body
      );
      if (res.status === 200 || res.status === 201) {
        // console.log("checkaudit Mail Has Been Sent Succesffully");
        enqueueSnackbar("Mail Has Been Sent Successfully!", {
          variant: "success",
          autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
        });
      } else {
        enqueueSnackbar("Error in Sending Mail!", {
          variant: "error",
          autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
        });
        // console.log("checkaudit error in creating audit plan unit wise", res);
      }
    } catch (error) {
      enqueueSnackbar("Error in Sending Mail!", {
        variant: "error",
        autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
      });
      // console.log("checkaudit error in creating audit plan unit wise", error);
    }
  };

  const handleCreateAuditUnitWise = async (
    data: any,
    mailUsers: any,
    isFinalise: any = false,
    isInform: any = false
  ) => {
    if (isFinalise) {
      if (
        // !data?.unitHead?.id ||
        !data?.imsCoordinator?.id ||
        !data?.auditors.length
      ) {
        enqueueSnackbar(
          `Atleast One UnitHead, IMSC and Auditor is Required to Finalise the Date!`,
          {
            variant: "warning",
          }
        );
        return;
      }
    }

    try {
      let finalData = {
        ...data,
      };
      if (isFinalise) {
        finalData = {
          ...data,
          isDraft: false,
        };
      } else {
        finalData = {
          ...data,
          isDraft: true,
        };
      }
      const res = await axios.post(
        "/api/auditPlan/addUnitWiseAuditPlan",
        finalData
      );

      if (res.status === 200 || res.status === 201) {
        setOpenAuditFinalize(!openAuditFinalize);
        getAllFinalizedDatesForAuditPlan();
        enqueueSnackbar("Sucessfully Created Finalised Date!", {
          variant: "success",
          autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
        });
        if (isInform && mailUsers?.length) {
          sendMail(mailUsers, {
            auditPlanId: auditPlanData?.auditPlanId,
            auditplanunitwiseId: res.data?._id,
            auditPlanUnitWiseData: res.data,
            isFinalise: isFinalise,
          });
        }
      } else {
        // console.log("checkaudit error in creating audit plan unit wise", res);
        enqueueSnackbar("Error in Creating Finalised Date!", {
          variant: "error",
          autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
        });
      }
    } catch (error) {
      enqueueSnackbar("Error in Creating Finalised Date!", {
        variant: "error",
        autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
      });
      // console.log("checkaudit error in creating audit plan unit wise", error);
    }
  };

  const handleUpdateAuditUnitWise = async (
    data: any,
    id: any,
    mailUsers: any,
    isFinalise: any = false,
    isInform: any = false,
    isDraft: any = false
  ) => {
    if (isFinalise) {
      if (
        // !data?.unitHead?.id ||
        !data?.imsCoordinator?.id ||
        !data?.auditors.length
      ) {
        enqueueSnackbar(
          `Atleast One UnitHead, IMSC and Auditor is Required to Finalise the Date!`,
          {
            variant: "warning",
          }
        );
        return;
      }
    }
    try {
      // console.log("checkaudit in handleUpdateAuditUnitWise", data);
      const { plannedBy, ...newData } = data;
      let finalData = {
        ...newData,
      };
      if (isFinalise) {
        finalData = {
          ...finalData,
          isDraft: false,
        };
      } else {
        finalData = {
          ...finalData,
          isDraft: isDraft,
        };
      }
      const res = await axios.patch(
        `/api/auditPlan/updateAuditPlanUnitwise/${id}`,
        finalData
      );
      if (res.status === 200 || res.status === 201) {
        // console.log("checkaudit audit plan updated successfully", res);
        setOpenAuditFinalize(!openAuditFinalize);
        getAllFinalizedDatesForAuditPlan();
        enqueueSnackbar("Successully Updated Finalised Date!", {
          variant: "success",
          autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
        });
        if (userAcceptFlag?.length) {
          sendConfirmationMail(mailUsers, {
            auditPlanId: auditPlanData?.auditPlanId,
            auditplanunitwiseId: id,
          });
        } else if (!!isInform && mailUsers?.length) {
          sendMailAfterUpdate(mailUsers, {
            auditPlanId: auditPlanData?.auditPlanId,
            auditplanunitwiseId: res.data?._id,
            auditPlanUnitWiseData: res?.data,
            isFinalise: isFinalise,
          });
        }
      } else {
        enqueueSnackbar("Error in Updating Finalised Date!", {
          variant: "error",
          autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
        });
        // console.log("checkaudit error in creating audit plan unit wise", res);
      }
    } catch (error) {
      enqueueSnackbar("Error in Updating Finalised Date!", {
        variant: "error",
        autoHideDuration: 2000, // 2000 milliseconds or 2 seconds
      });
      // console.log("checkaudit error in creating audit plan unit wise", error);
    }
  };

  const closeCreateAuditFinaliseModal = (
    isDraft: any = false,
    isFinalise: any = false,
    isInform: any = false,
    justUpdateAcceptedFlag: any = false
  ) => {
    const unitHead = usersSelectionGridRows.find(
      (user: any) => user.role === "Head"
    );
    // .map((item: any) => ({ id: item.name.id, accepted: item.accepted }));
    const imsCoordinator = usersSelectionGridRows.find(
      (user: any) => user.role === "IMSC"
    );

    let otherUsersArray = [];
    if (usersSelectionGridRows?.length > 2) {
      //add all the users in otherUsersArray whose index in usersSelections is greateer than 1
      otherUsersArray = usersSelectionGridRows.slice(2).map((user: any) => ({
        id: user.name.id,
        accepted: user.accepted,
      }));
    }
    // console.log("checkaudit otherUsersArray ==>", otherUsersArray);

    // .map((item: any) => ({ id: item.name.id, accepted: item.accepted }));
    const auditors = auditorsRows
      .filter((user: any) => user.name && user.name.id)
      .map((user: any) => ({
        id: user.name.id,
        accepted: user.accepted,
      }));

    // Update finalisedDates state
    const updatedFinalisedDates: any = {
      fromDate: finalisedDateRange.fromDate,
      toDate: finalisedDateRange.toDate,
      unitHead: unitHead
        ? { id: unitHead.name.id, accepted: unitHead.accepted }
        : {},
      imsCoordinator: imsCoordinator
        ? { id: imsCoordinator.name.id, accepted: imsCoordinator.accepted }
        : {},
      auditors: auditors,
      organizationId: sessionStorage.getItem("orgId"),
      auditPlanEntitywiseId:
        auditFinaliseDateModal?.mode === "create"
          ? auditPlanData?.auditPlanEntityWiseId
          : finalisedDateObject.auditPlanEntitywiseId,

      comments: comments,
      plannedBy: userDetails?.id,
      unitId: planDetails?.unitId,
      auditPlanId: planDetails?.auditPlanId,
      otherUsers: otherUsersArray,
      teamLeadId: teamLeadId,
      auditPeriod: selectedAuditPeriod,
    };

    // if (otherUsersArray?.length) {
    //   updatedFinalisedDates = {
    //     ...updatedFinalisedDates,
    //     otherUsers: otherUsersArray,
    //   };
    // }

    const mailUsers = [];
    auditorsRows?.map((user: any) => {
      // if (user.accepted === "WAITING") {
      mailUsers.push({
        email: user?.name?.email,
        username: user?.name?.username,
      });
      // }
    });
    // if (unitHead.accepted === "WAITING") {
    mailUsers?.push({
      email: unitHead?.name?.email,
      username: unitHead?.name?.username,
    });
    // }
    // if (imscoordinator.accepted === "WAITING") {
    mailUsers?.push({
      email: imscoordinator?.name?.email,
      username: imscoordinator?.name?.username,
    });
    // }
    if (!!otherUsers && otherUsers.length > 0) {
      otherUsers?.map((user: any) => {
        // if (user.accepted === "WAITING") {
        mailUsers.push({
          email: user?.name?.email,
          username: user?.name?.username,
        });
        // }
      });
    }

    // console.log("checkaudit1 mailusers", mailUsers);
    // console.log("checkaudit1 auditorsRows", auditorsRows);
    // console.log("checkaudit1 unitHead ", unitHead);
    // console.log("checkaudit1 imscoordinator ", imscoordinator);
    // console.log("checkaudit1 ");

    if (justUpdateAcceptedFlag) {
      handleUpdateJustAccepetedFlag(
        updatedFinalisedDates,
        finalisedDateObject?._id,
        mailUsers
      );
    }
    if (!!isDraft && !justUpdateAcceptedFlag) {
      console.log(
        "checkaudit10 inside isDraft====>",
        isDraft,
        isFinalise,
        isInform,
        justUpdateAcceptedFlag
      );

      //save as draft
      if (auditFinaliseDateModal.mode === "create") {
        handleSaveAsDraft(
          updatedFinalisedDates,
          "",
          isInform,
          mailUsers,
          isFinalise
        );
      } else {
        handleSaveAsDraft(
          updatedFinalisedDates,
          finalisedDateObject?._id,
          isInform,
          mailUsers,
          isFinalise
        );
      }
    } else {
      //submit and infor , send mails
      if (!justUpdateAcceptedFlag) {
        if (auditFinaliseDateModal.mode === "create") {
          handleCreateAuditUnitWise(
            updatedFinalisedDates,
            mailUsers,
            isFinalise,
            isInform
          );
        } else {
          handleUpdateAuditUnitWise(
            updatedFinalisedDates,
            finalisedDateObject?._id,
            mailUsers,
            isFinalise,
            isInform,
            isDraft
          );
        }
      }
    }

    // setFinalisedDates([updatedFinalisedDates]);
  };
  return (
    <div>
      <AuditFinaliseDateModal
        auditFinaliseDateModal={auditFinaliseDateModal}
        toggleFinaliseDateModal={toggleAuditFinaliseDateModal}
        auditPlanData={auditPlanData}
        formData={formData}
        setFormData={setFormData}
        currentRowId={auditPlanData?.auditPlanEntityWiseId}
        // onFinaliseDateUpdate={handleFinalisedDateUpdate}
        finalisedDateObject={finalisedDateObject}
        setFinalisedDateObject={setFinalisedDateObject}
        finalisedDateRange={finalisedDateRange}
        setFinalisedDateRange={setFinalisedDateRange}
        closeCreateAuditFinaliseModal={closeCreateAuditFinaliseModal}
        usersSelectionGridRows={usersSelectionGridRows}
        setUsersSelectionGridRows={setUsersSelectionGridRows}
        auditorsRows={auditorsRows}
        setAuditorsRows={setAuditorsRows}
        unitHead={unitHead}
        setUnitHead={setUnitHead}
        imscoordinator={imscoordinator}
        setImsCoordinator={setImsCoordinator}
        otherUsers={otherUsers}
        setOtherUsers={setOtherUsers}
        comments={comments}
        setComments={setComments}
        commentText={commentText}
        setCommentText={setCommentText}
        sendMail={sendMail}
        auditPlanId={auditPlanData?.auditPlanId || ""}
        planDetails={planDetails}
        setUserAcceptFlag={setUserAcceptFlag}
        teamLeadId={teamLeadId}
        setTeamLeadId={setTeamLeadId}
        selectedAuditPeriod={selectedAuditPeriod}
        setSelectedAuditPeriod={setSelectedAuditPeriod}
      />
    </div>
  );
};

export default AuditFinalizeModal;
