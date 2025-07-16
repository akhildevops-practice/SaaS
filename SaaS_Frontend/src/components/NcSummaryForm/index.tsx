import React, { useState } from "react";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import CommentsSection from "../CommentsSection";
import {
  Fab,
  Drawer,
  Input,
  DialogContent,
  DialogContentText,
  DialogActions,
  Dialog,
  useMediaQuery,
  useTheme,
  Modal,
  RadioGroup,
  Radio,
  FormControlLabel,
} from "@material-ui/core";
import { useParams } from "react-router-dom";
import {
  auditCreationForm,
  auditeeSectionData,
  mobileView,
  ncsForm,
} from "../../recoil/atom";
import {
  useStyles,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "./styles";
import {
  acceptNc,
  buttonStatus,
  closeNc,
  conversionNc,
  getNcDetail,
  postNcsComment,
  rejectNc,
} from "../../apis/ncSummaryApi";
import { useRecoilState } from "recoil";
import moment from "moment";
import AutoComplete from "../AutoComplete";
import { API_LINK } from "../../config";
import { useSnackbar } from "notistack";
import checkRole from "../../utils/checkRoles";
import CustomButtonGroup from "../CustomButtonGroup";
import {
  addAttachment,
  checkIsAuditor,
  checkRatePermissions,
  deleteAttachment,
} from "../../apis/auditApi";
import getUserId from "../../utils/getUserId";
import axios from "../../apis/axios.global";
import CustomTable from "../CustomTable";
import FormStepper from "../FormStepper";
import BackButton from "../BackButton";
import { Tabs, Button, Tag, Form, UploadProps, Upload } from "antd";
import { ReactComponent as WorkFlowIcon } from "../../assets/icons/WorkFlowHistory.svg";
import { MdExpandMore, MdKeyboardArrowLeft, MdMoreVert, MdInbox, MdDelete, MdChevronLeft } from "react-icons/md";
import getSessionStorage from "utils/getSessionStorage";
import getAppUrl from "utils/getAppUrl";
const { Dragger } = Upload;

type Props = {
  modalId?: string;
  setUpdateModelVisible?: (isVisible: boolean) => void;
  setRerender?: (isVisible: boolean) => void;
  isInbox?: boolean;
};

const headers = ["Action", "Date", "By", "Comment"];
const fields = ["action", "date", "by", "comment"];

export default function NcSummaryForm({
  modalId,
  setUpdateModelVisible,
  setRerender,
  isInbox,
}: Props) {
  const matches = useMediaQuery("(min-width:786px)");
  const [open, setOpen] = React.useState(false);
  const [number, setNumber] = React.useState(0);
  const [openDrawer, setOpenDrawer] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const { id } = useParams();
  const [formData, setFormData] = useRecoilState(ncsForm);
  const [findingTypes, setFindingTypes] = React.useState([]);
  const [modalShow, setModalShow] = React.useState(false);
  const [modalComment, setModalComment] = React.useState(false);
  const [auditorData, setAuditorData] = React.useState({
    date: "",
    comment: "",
    verficationDate: "",
    verficationAction: "",
  });

  const [closureOwnerRule, setClosureOwnerRule] = React.useState(true);
  const [closureData, setClosureData] = React.useState({
    closureRemarks: "",
    closureDate: "",
    auditRequired: "No",
  });
  const [auditeeData, setAuditeeData] = useRecoilState(auditeeSectionData);
  const [roleUnder, setRoleUnder] = React.useState("");
  const { enqueueSnackbar } = useSnackbar();
  const [isAuditee, setIsAuditee] = React.useState(false);
  const [auditDate, setAuditDate] = React.useState<any>();
  const [correctiveActionDate, setCorrectiveActionDate] = React.useState<any>();
  const [isAuditor, setIsAuditor] = React.useState(false);
  const [ncStatus, setNcStatus] = React.useState<string>("");
  const [closedStatus, setClosedStatus] = React.useState<any>(false);
  const [hasAuditeeAccepted, setHasAuditeeAccepted] =
    React.useState<boolean>(false);
  const [hasAuditeeRejected, setHasAuditeeRejected] =
    React.useState<boolean>(false);
  const [hasAuditorAccepted, setHasAuditorAccepted] =
    React.useState<boolean>(false);
  const [hasAuditorVerified, setHasAuditorVerified] =
    React.useState<boolean>(false);
  const [roleStatus, setRoleStatus] = React.useState<boolean>(false);
  const [buttonOptions, setButtonOptions] = React.useState<any>([]);
  const navigate = useNavigate();
  const isMR = checkRole("MR");
  const isOrgAdmin = checkRole("ORG-ADMIN");
  const userId = getUserId();
  const theme = useTheme();
  const [date, setDate] = React.useState();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [mobView, setMobView] = useRecoilState<boolean>(mobileView);
  const location: any = useLocation();
  const [activeTab, setActiveTab] = useState("1");
  const [auditeeSectionactiveTab, setAuditeeSectionActiveTab] = useState("1");
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [optionSelected, setOptionSelected] = useState("");
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  // const [isSectionVisible, setIsSectionVisible] = useState(true);
  const [isPopoverOpen, setPopoverOpen] = useState<boolean>(false);
  const [fileList, setFileList] = useState<any>([]);
  const [template, setTemplate] = useRecoilState<any>(auditCreationForm);
  const [Docurls, setDocUrls] = useState<any>([]);
  const [closureOwner, setClosureOwner] = useState<any>("");
  const userInfo = getSessionStorage();
  const realmName = getAppUrl();
  const loggedInUser = JSON.parse(sessionStorage.getItem("userDetails") as any);

  // const [tabPosition, setTabPosition] = useState<TabPosition>("left");
  // const toggleSection = () => {
  //   setIsSectionVisible(!isSectionVisible);
  // };

  // for mobile tab select design

  const [selectedValue, setSelectedValue] = useState(0);
  // console.log("selectedValue", selectedValue);
  const handleDataChange = (e: any) => {
    setSelectedValue(e.target.value);
  };

  const handleTabChange = (key: any) => {
    setActiveTab(key);
  };

  const handleTabChangeAuditeeSection = (key: any) => {
    setAuditeeSectionActiveTab(key);
  };

  const fectchFindingTypes = async () => {
    const result = await axios.get(
      `/api/audit-settings/getFindingsForAuditTypeAndFilterType/${
        formData.auditTypeId
      }/${encodeURIComponent(formData.type)}`
    );
    setFindingTypes(result.data);
  };
  /**
   * @method handleOpen
   * @description Function to open the dialog box
   * @returns nothing
   */
  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  /**
   * @method handleClose
   * @description Function to close the dialog box
   * @returns nothing
   */
  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  /**
   * @method cancelNc
   * @description Function to cancel NC when the user is MR
   * @returns nothing
   */
  const cancelNc = () => {
    closeNc(id || modalId!, { userId: userId })
      .then((response: any) => {
        if (setUpdateModelVisible) {
          setUpdateModelVisible(false);
          setTemplate([]);
        }
        if (setRerender) {
          setRerender(true);
        }
        navigate("/audit", { state: { redirectToTab: "List of Findings" } });
        enqueueSnackbar("Successfully cancelled NC", {
          variant: "success",
        });
      })
      .catch((error: any) => {
        // console.log("error -", { error });
        enqueueSnackbar("Something went wrong!", { variant: "error" });
      });
  };
  /**
   * @method convertToObservation
   * @description Function to convert NC to Observation
   * @returns nothing
   */
  const convertToObservation = () => {
    let copyData = JSON.parse(JSON.stringify(auditeeData));
    copyData.userId = userId;
    copyData.type = selectedOption;
    conversionNc(id || modalId!, copyData)
      .then((response: any) => {
        if (setUpdateModelVisible) {
          setUpdateModelVisible(false);
        }
        if (setRerender) {
          setRerender(true);
        }
        navigate("/audit", { state: { redirectToTab: "List of Findings" } });

        enqueueSnackbar("Successfully converted NC to observation", {
          variant: "success",
        });
      })
      .catch((error: any) => {
        // console.log("error -", { error });
        enqueueSnackbar("Something went wrong!", { variant: "error" });
      });
  };

  /**
   * @method onDrawerOpen
   * @description Function to open the drawer in the mobile view
   * @returns nothing
   */
  const onDrawerOpen = () => {
    setOpen(true);
  };
  /**
   * @method onDrawerClose
   * @description Function to close the drawer in the mobile view
   * @returns nothing
   */
  const onDrawerClose = () => {
    setOpen(false);
  };

  /**
   * @method parseData
   * @description Function to parse data for displaying inside the form
   * @param data any
   * @returns nothing
   */
  const parseData = (data: any) => {
    setAuditDate(data?.audit?.createdAt);
    setCorrectiveActionDate(data?.correctiveAction?.date);
    setClosedStatus(data?.status === "CLOSED" ? true : false);
    setHasAuditeeAccepted(data?.auditeeAccepted);
    setHasAuditeeRejected(data?.auditeeRejected);
    setHasAuditorAccepted(data?.auditorAccepted);

    setDate(data?.audit?.createdAt);
    const formattedData = {
      auditName: data?.audit?.auditName,
      auditDateTime: moment(data?.audit?.createdAt).format("DD/MM/YYYY LT"),
      auditType: data?.audit?.auditType?.auditType,
      auditTypeId: data?.audit?.auditType?._id,
      auditNumber: data?.audit?.auditNumber,
      auditee: data?.audit?.auditees,
      auditor: data?.audit?.auditors,
      entity: data?.audit?.auditedEntity?.entityName,
      location: data?.audit?.auditedEntity?.location.locationName,
      findingData: data.findings,
      ncDate: moment(data?.createdAt).format("DD/MM/YYYY"),
      ncNumber: data?.id,
      type: data.type,
      status: data?.status,
      auditorSection: data.findings.auditorVerification,
      auditReportId: data?.audit?._id,
      closureBy: data.findings.closureBy,
      closureSection: data.findings.closure,
      corrective: data.findings.correctiveAction,
      clauseAffected:
        data?.clause.length > 0 && data?.clause[0]?.clauseName
          ? `${data?.clause[0]?.clauseName}, ${data?.clause[0]?.clauseNumber}`
          : "",
      ncDetails: data?.comment,
      documentProof: data?.document ? (
        <a
          href={`${API_LINK}${data?.document}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {data?.document?.split("/")[2]}
        </a>
      ) : "No image found",
      
      mrComments:
        data?.ncComments.length > 0
          ? data.ncComments.map((comment: any) => {
              return {
                commentText: comment?.comment,
                date: moment(comment?.createdAt).format("DD/MM/YYYY LT"),
                postedOn: moment(comment?.createdAt).format("DD/MM/YYYY LT"),
                commentBy:
                  comment?.user.firstname + " " + comment?.user.lastname,
                border: false,
                emptyBackground: true,
              };
            })
          : [
              {
                commentText: "No comments were found!",
                date: "",
                postedOn: "",
                commentBy: "",
                border: false,
                emptyBackground: true,
              },
            ],
      closureDate: data?.closureDate
        ? moment(data?.closureDate).format("DD/MM/YYYY")
        : "",
      reviewDate:
        data.reviewDate && data.reviewDate !== ""
          ? moment(data.reviewDate).format("YYYY-MM-DD")
          : "",
      caDate:
        data.caDate && data.caDate !== ""
          ? moment(data.caDate).format("DD/MM/YYYY")
          : "",
      workflowHistory: data?.workflowHistory.map((workflow: any) => {
        return {
          date: moment(workflow.createdAt).format("DD/MM/YYYY"),
          by: workflow?.user?.firstname + " " + workflow?.user?.lastname,
          action: workflow?.action,
          id: workflow?._id,
          comment: workflow?.comment || "",
        };
      }),
    };

    setAuditeeData((prev: any) => {
      return {
        ...prev,
        date: data?.correctiveAction?.date
          ? moment(data?.correctiveAction?.date).format("YYYY-MM-DD")
          : "",
        targetDate: data?.correctiveAction?.targetDate
          ? moment(data?.correctiveAction?.targetDate).format("YYYY-MM-DD")
          : "",
        documentName: data?.correctiveAction?.documentName,
        proofDocument: data?.correctiveAction?.proofDocument,
        actualDate: data?.correctiveAction?.actualDate
          ? moment(data?.correctiveAction?.actualDate).format("YYYY-MM-DD")
          : "",
        actualTargetDate: data?.correctiveAction?.actualTargetDate
          ? moment(data?.correctiveAction?.actualTargetDate).format(
              "YYYY-MM-DD"
            )
          : "",
        actualCorrection: data?.correctiveAction?.actualCorrection,
        actualComment: data?.correctiveAction?.actualComment,
        imageName: data?.correctiveAction?.imageName,
        imageLink: data?.correctiveAction?.imageLink,
        comment: data?.correctiveAction?.comment,
        isDraft: data?.correctiveAction?.isDraft ?? true,
        correction: data?.correctiveAction?.correction,
        whyAnalysis: data?.correctiveAction?.whyAnalysis
          ? data?.correctiveAction?.whyAnalysis
          : "",
      };
    });

    setAuditorData({
      ...auditorData,
      date: data?.auditorReview?.date
        ? moment(data?.auditorReview?.date).format("YYYY-MM-DD")
        : "",
      comment: data?.auditorReview?.comment,
      verficationAction: data?.auditorReview?.verficationAction,
      verficationDate: data?.auditorReview?.verficationDate
        ? moment(data?.auditorReview?.verficationDate).format("YYYY-MM-DD")
        : "",
    });

    setClosureData({
      ...closureData,
      closureRemarks: data?.closureRemarks,
      auditRequired: data.auditRequired || "No",
      closureDate: data?.closureDate
        ? moment(data?.closureDate).format("DD/MM/YYYY")
        : "",
    });

    checkAuditee(data?.audit?._id, data?.currentlyUnder);
    checkAuditor(data?.audit?._id, data?.currentlyUnder);
    setNcStatus(data?.status);
    setFormData(formattedData as any);
  };

  /**
   * @method getNcDetailsById
   * @description Function to fetch NC/Observation details via its designated id
   * @param id string
   * @returns nothing
   *
   *
   *
   *
   */

  const getNcDetailById = (id: string) => {
    getNcDetail(id)
      .then((res: any) => {
        parseData(res?.data);
        setClosureOwner(res?.data.audit?.auditType?.VerificationOwner);
        setLoading(false);
      })
      .catch((error) => {
        // console.error(error.message);
        setLoading(false);
      });
  };

  /**
   * @method checkAuditee
   * @description Function to check if the user is an auditee
   */
  const checkAuditee = (id: string, role: string) => {
    checkRatePermissions(id, {
      userId: userId,
    }).then((response: any) => {
      setIsAuditee(response?.data);
    });
  };

  /**
   * @method checkAuditor
   * @description Function to check if the user is an auditor
   */
  const checkAuditor = (id: string, role: string) => {
    checkIsAuditor(id, {
      userId: userId,
    }).then((response: any) => {
      setIsAuditor(response?.data);
    });
  };

  /**
   * @method submitComment
   * @description Function to post a comment in the List of Findings form
   * @param comment string
   * @returns nothing
   */
  const submitComment = (comment: string) => {
    postNcsComment(id || modalId!, comment)
      .then((res) => {
        enqueueSnackbar("Comment Added successfully", {
          variant: "success",
        });
        setFormData({
          ...formData,
          mrComments: [
            ...formData.mrComments,
            {
              commentText: res.data.comment,
              date: moment(res.data.createdAt).format("DD/MM/YYYY LT"),
              postedOn: moment(res.data.createdAt).format("DD/MM/YYYY LT"),
              commentBy: res.data.user.firstname + " " + res.data.user.lastname,
              border: false,
              emptyBackground: true,
            },
          ],
        });
      })
      .catch((error: Error) => {
        enqueueSnackbar(error.message, {
          variant: "error",
        });
      });
  };

  /**
   * @method handleImageUpload
   * @description Function to handle image upload
   * @param e {any}
   * @returns nothing
   */
  const handleImageUpload = (e: any) => {
    let formData = new FormData();
    formData.append("file", e.target.files[0]);
    let copyData = JSON.parse(JSON.stringify(auditeeData));

    addAttachment(
      formData,
      realmName,
      loggedInUser?.location?.locationName
    ).then((response: any) => {
      setAuditeeData((prev: any) => {
        copyData.proofDocument = response?.data?.path;
        copyData.documentName = response?.data?.name;
        copyData.imageLink = response?.data?.path;
        copyData.imageName = response?.data?.name;
        return copyData;
      });
    });
  };

  /**
   * @method auditorChangeHandler
   * @description Function to handler changes in the auditor fields
   * @param event {any}
   * @returns nothing
   */
  const auditorChangeHandler = (event: any) => {
    setAuditorData({
      ...auditorData,
      [event.target.name]: event.target.value,
    });
  };

  /**
   * @method auditorChangeHandler
   * @description Function to handler changes in the auditor fields
   * @param event {any}
   * @returns nothing
   */
  const closureChangeHandler = (event: any) => {
    setClosureData({
      ...closureData,
      [event.target.name]: event.target.value,
    });
  };

  /**
   * @method auditeeChangeHandler
   * @description Function to handle changes in the auditee fields
   * @param e {any}
   * @returns nothing
   */
  const auditeeChangeHandler = (e: any) => {
    setAuditeeData({
      ...auditeeData,
      [e.target.name]: e.target.value,
    });
  };

  /**
   * @method clearFile
   * @description Function to clear a file
   * @returns nothing
   */
  const clearFile = () => {
    let copyData = JSON.parse(JSON.stringify(auditeeData));
    deleteAttachment({
      path: auditeeData?.imageLink,
    }).then((response: any) => {
      if (response?.data?.status === 200) {
        setAuditeeData((prev: any) => {
          copyData.proofDocument = "";
          copyData.documentName = "";
          copyData.imageLink = "";
          copyData.imageName = "";
          return copyData;
        });
      }
    });
  };

  /**
   * @method getButtonStatus
   * @description Function to get button accesiblity status and hide or view button
   * @param id {string}
   * @param userId {string}
   * @returns nothing
   */
  const getButtonStatus = async (id: string, userId: any) => {
    if (userId === null) {
      const userInfo = await axios.get("/api/user/getUserInfo");
      buttonStatus(id, userInfo?.data?.id, formData.type).then(
        (response: any) => {
          setRoleStatus(response?.data?.status);
          setButtonOptions(response?.data?.options);
          if (response?.data?.options?.includes("Close NC")) {
            setClosureOwnerRule(false);
          }
        }
      );
    } else {
      buttonStatus(id, userId, formData.type).then((response: any) => {
        setRoleStatus(response?.data?.status);
        setButtonOptions(response?.data?.options);
        if (response?.data?.options?.includes("Close NC")) {
          setClosureOwnerRule(false);
        }
      });
    }
  };

  React.useEffect(() => {
    getNcDetailById(id || modalId!);
    getButtonStatus(id || modalId!, userId);
    // fectchFindingTypes()
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const openMessageModal = () => {
    setMessageModalOpen(true);
  };

  const closeMessageModal = () => {
    setMessageModalOpen(false);
  };

  const openWorkflowModal = () => {
    setWorkflowModalOpen(true);
  };

  const closeWorkflowModal = () => {
    setWorkflowModalOpen(false);
  };

  const uploadAuditReportAttachmentsOld = async (files: any) => {
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
      setDocUrls(response?.data);
      setAuditeeData({
        ...auditeeData,
        proofDocument: response?.data,
      });
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
          "Your Organization has exceeded the licensed attachments - Please reach ProcessRidge to activate additional licenses. Audit will be saved without attachment"
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
   * @method handleSubmit
   * @description Function to submit auditee/auditor form data
   * @param option {string}
   * @returns nothing
   */

  const handleSubmit = async (option: string, status = false) => {
    let copyData = JSON.parse(JSON.stringify(auditeeData));
    let auditorCopyData = JSON.parse(JSON.stringify(auditorData));
    let closureCopyData = JSON.parse(JSON.stringify(closureData));
    auditorCopyData.userId = userId;
    let targetDate;
    let auditDate;
    let data;
    switch (option) {
      case "ACCEPT":
        copyData.statusDetail = true;
        copyData.userId = userId;
        targetDate = moment(copyData.targetDate).format("YYYY-MM-DD");
        auditDate = moment(date).format("YYYY-MM-DD");
        data = { ...copyData, ...formData };
        // if (!copyData.correction) {
        //   enqueueSnackbar(`Correction field should not empty`, {
        //     variant: "error",
        //   });
        //   return;
        // }

        isAuditee &&
          acceptNc(id || modalId!, copyData, false)
            .then((response: any) => {
              if (setUpdateModelVisible) {
                setUpdateModelVisible(false);
                setTemplate([]);
              }
              if (setRerender) {
                setRerender(true);
              }
              if (isInbox === true) {
                navigate("/Inbox");
              } else {
                navigate("/audit", {
                  state: { redirectToTab: "List of Findings" },
                });
              }
              enqueueSnackbar("Successfully accepted NC", {
                variant: "success",
              });
            })
            .catch((error: any) => {
              enqueueSnackbar("Something went wrong!", {
                variant: "error",
              });
            });
        break;
      case "Accept OFI":
        copyData.statusDetail = true;
        copyData.userId = userId;
        targetDate = moment(copyData.targetDate).format("YYYY-MM-DD");
        auditDate = moment(date).format("YYYY-MM-DD");
        data = { ...copyData, ...formData };
        // if (!copyData.correction) {
        //   enqueueSnackbar(`Correction field should not empty`, {
        //     variant: "error",
        //   });
        //   return;
        // }

        isAuditee &&
          acceptNc(id || modalId!, copyData, false)
            .then((response: any) => {
              if (setUpdateModelVisible) {
                setUpdateModelVisible(false);
                setTemplate([]);
              }
              if (setRerender) {
                setRerender(true);
              }
              if (isInbox === true) {
                navigate("/Inbox");
              }
              navigate("/audit", {
                state: { redirectToTab: "List of Findings" },
              });
              enqueueSnackbar("Successfully accepted NC", {
                variant: "success",
              });
            })
            .catch((error: any) => {
              enqueueSnackbar("Something went wrong!", {
                variant: "error",
              });
            });
        break;

      case "Accept OBS":
        copyData.statusDetail = true;
        copyData.userId = userId;
        targetDate = moment(copyData.targetDate).format("YYYY-MM-DD");
        auditDate = moment(date).format("YYYY-MM-DD");
        data = { ...copyData, ...formData };
        // if (!copyData.correction) {
        //   enqueueSnackbar(`Correction field should not empty`, {
        //     variant: "error",
        //   });
        //   return;
        // }

        isAuditee &&
          acceptNc(id || modalId!, copyData, false)
            .then((response: any) => {
              if (setUpdateModelVisible) {
                setUpdateModelVisible(false);
                setTemplate([]);
              }
              if (setRerender) {
                setRerender(true);
              }
              if (isInbox === true) {
                navigate("/Inbox");
              }
              navigate("/audit", {
                state: { redirectToTab: "List of Findings" },
              });
              enqueueSnackbar("Successfully accepted NC", {
                variant: "success",
              });
            })
            .catch((error: any) => {
              enqueueSnackbar("Something went wrong!", {
                variant: "error",
              });
            });
        break;
      case "Submit to Auditor":
        copyData.isDraft = false;
        copyData.userId = userId;

        let uploadAttachement =
          auditeeData?.proofDocument?.length > 0
            ? await uploadAuditReportAttachments(auditeeData?.proofDocument)
            : [];
        // if (!!template?.files && template?.files?.length > 0) {
        //   uploadAttachement = await uploadAuditReportAttachments(
        //     template?.files
        //   );
        // }
        // if (!!uploadAttachement?.isFileUploaded) {
        setFormData({
          ...formData,
          ...template,
          proofDocument: uploadAttachement,
        });

        copyData.proofDocument = uploadAttachement;

        if (auditeeData?.proofDocument.length === 0 && !status) {
          setModalShow(true);
          return;
        }
        if (!copyData.correction) {
          enqueueSnackbar(`Correction field should not empty`, {
            variant: "error",
          });
          return;
        }

        if (!auditeeData?.actualCorrection) {
          enqueueSnackbar(`Actual Correction field should not empty`, {
            variant: "error",
          });
          return;
        }

        if (!auditeeData?.targetDate) {
          enqueueSnackbar(`Planned Date Of Correction field should not empty`, {
            variant: "error",
          });
          return;
        }

        if (!auditeeData?.actualTargetDate) {
          enqueueSnackbar(`Actual Date Of Correction field should not empty`, {
            variant: "error",
          });
          return;
        }
        if (formData.corrective) {
          if (!moment(targetDate).isSameOrAfter(auditDate)) {
            enqueueSnackbar(
              `Probable Date of Completion should be greater than ${formData.auditDateTime}`,
              {
                variant: "error",
              }
            );
            return;
          }
        }
        if (!auditeeData?.whyAnalysis) {
          enqueueSnackbar(`Why Analysis should not empty`, {
            variant: "error",
          });
          return;
        }

        // if (isAuditee && (!auditeeData.comment || !auditeeData.date)) {
        //   enqueueSnackbar("You need to fill up the required details.", {
        //     variant: "error",
        //   });
        //   return;
        // }

        // } else {
        //   setFormData({ ...formData, ...template });
        // }
        if (isAuditee) {
          acceptNc(id || modalId!, copyData, false)
            .then((response: any) => {
              if (setUpdateModelVisible) {
                setUpdateModelVisible(false);
                setTemplate([]);
              }
              if (setRerender) {
                setRerender(true);
              }
              if (isInbox === true) {
                navigate("/Inbox");
              } else {
                navigate("/audit", {
                  state: { redirectToTab: "List of Findings" },
                });
              }
              enqueueSnackbar("Successfully accepted NC", {
                variant: "success",
              });
            })
            .catch((error: any) => {
              enqueueSnackbar("Something went wrong!", {
                variant: "error",
              });
            });
        } else {
          acceptNc(id || modalId!, copyData, false)
            .then((response: any) => {
              if (setUpdateModelVisible) {
                setUpdateModelVisible(false);
              }
              if (setRerender) {
                setRerender(true);
              }
              if (isInbox === true) {
                navigate("/Inbox");
              } else {
                navigate("/audit", {
                  state: { redirectToTab: "List of Findings" },
                });
              }
              enqueueSnackbar("Successfully accepted NC", {
                variant: "success",
              });
            })
            .catch((error: any) => {
              enqueueSnackbar("Something went wrong!", {
                variant: "error",
              });
            });
        }

        // isAuditor &&
        //   acceptNc(id!, auditorCopyData)
        //     .then((response: any) => {
        //       navigate("/audit", { state: { redirectToTab: "List of Findings" } });
        //       enqueueSnackbar("Successfully accepted NC", {
        //         variant: "success",
        //       });
        //     })
        //     .catch((error: any) => {
        //       enqueueSnackbar("Something went wrong!", {
        //         variant: "error",
        //       });
        //     });

        break;

      case "Close OFI":
        copyData.isDraft = false;
        copyData.userId = userId;
        if (!copyData.correction) {
          enqueueSnackbar(`Correction field should not empty`, {
            variant: "error",
          });
          return;
        }
        if (!copyData.whyAnalysis) {
          enqueueSnackbar(`Why1 Analysis Should Not Be Empty`, {
            variant: "error",
          });
          return;
        }
        if (isAuditee && (!auditeeData.comment || !auditeeData.date)) {
          enqueueSnackbar("You need to fill up the required details.", {
            variant: "error",
          });
          return;
        }
        isAuditee &&
          acceptNc(id || modalId!, copyData, false)
            .then((response: any) => {
              if (setUpdateModelVisible) {
                setUpdateModelVisible(false);
              }
              if (setRerender) {
                setRerender(true);
              }
              if (isInbox === true) {
                navigate("/Inbox");
              } else {
                navigate("/audit", {
                  state: { redirectToTab: "List of Findings" },
                });
              }
              enqueueSnackbar("Successfully accepted NC", {
                variant: "success",
              });
            })
            .catch((error: any) => {
              enqueueSnackbar("Something went wrong!", {
                variant: "error",
              });
            });
        // isAuditor &&
        //   acceptNc(id!, auditorCopyData)
        //     .then((response: any) => {
        //       navigate("/audit", { state: { redirectToTab: "List of Findings" } });
        //       enqueueSnackbar("Successfully accepted NC", {
        //         variant: "success",
        //       });
        //     })
        //     .catch((error: any) => {
        //       enqueueSnackbar("Something went wrong!", {
        //         variant: "error",
        //       });
        //     });
        // isMR &&
        //   acceptNc(id!, copyData)
        //     .then((response: any) => {
        //       navigate("/audit", { state: { redirectToTab: "List of Findings" } });
        //       enqueueSnackbar("Successfully accepted NC", {
        //         variant: "success",
        //       });
        //     })
        //     .catch((error: any) => {
        //       enqueueSnackbar("Something went wrong!", {
        //         variant: "error",
        //       });
        //     });
        break;

      case "Close OBS":
        copyData.isDraft = false;
        copyData.userId = userId;
        if (!copyData.correction) {
          enqueueSnackbar(`Correction field should not empty`, {
            variant: "error",
          });
          return;
        }
        if (!copyData.whyAnalysis) {
          enqueueSnackbar(`Why1 Analysis Should Not Be Empty`, {
            variant: "error",
          });
          return;
        }
        if (isAuditee && (!auditeeData.comment || !auditeeData.date)) {
          enqueueSnackbar("You need to fill up the required details.", {
            variant: "error",
          });
          return;
        }
        isAuditee &&
          acceptNc(id || modalId!, copyData, false)
            .then((response: any) => {
              if (setUpdateModelVisible) {
                setUpdateModelVisible(false);
                setTemplate([]);
              }
              if (setRerender) {
                setRerender(true);
              }
              if (isInbox === true) {
                navigate("/Inbox");
              } else {
                navigate("/audit", {
                  state: { redirectToTab: "List of Findings" },
                });
              }
              enqueueSnackbar("Successfully accepted NC", {
                variant: "success",
              });
            })
            .catch((error: any) => {
              enqueueSnackbar("Something went wrong!", {
                variant: "error",
              });
            });
        // isAuditor &&
        //   acceptNc(id!, auditorCopyData)
        //     .then((response: any) => {
        //       navigate("/audit", { state: { redirectToTab: "List of Findings" } });
        //       enqueueSnackbar("Successfully accepted NC", {
        //         variant: "success",
        //       });
        //     })
        //     .catch((error: any) => {
        //       enqueueSnackbar("Something went wrong!", {
        //         variant: "error",
        //       });
        //     });
        // isMR &&
        //   acceptNc(id!, copyData)
        //     .then((response: any) => {
        //       navigate("/audit", { state: { redirectToTab: "List of Findings" } });
        //       enqueueSnackbar("Successfully accepted NC", {
        //         variant: "success",
        //       });
        //     })
        //     .catch((error: any) => {
        //       enqueueSnackbar("Something went wrong!", {
        //         variant: "error",
        //       });
        //     });
        break;
      case "Accept & Close":
        copyData.isDraft = false;
        copyData.userId = userId;
        data = { ...copyData, ...closureData };
        isMR &&
          acceptNc(id || modalId!, data, false)
            .then((response: any) => {
              if (setUpdateModelVisible) {
                setUpdateModelVisible(false);
              }
              if (setRerender) {
                setRerender(true);
              }
              if (isInbox === true) {
                navigate("/Inbox");
              } else {
                navigate("/audit", {
                  state: { redirectToTab: "List of Findings" },
                });
              }
              enqueueSnackbar("Successfully accepted NC", {
                variant: "success",
              });
            })
            .catch((error: any) => {
              enqueueSnackbar("Something went wrong!", {
                variant: "error",
              });
            });
        isOrgAdmin &&
          acceptNc(id || modalId!, data, false)
            .then((response: any) => {
              if (setUpdateModelVisible) {
                setUpdateModelVisible(false);
              }
              if (setRerender) {
                setRerender(true);
              }
              if (isInbox === true) {
                navigate("/Inbox");
              } else {
                navigate("/audit", {
                  state: { redirectToTab: "List of Findings" },
                });
              }
              enqueueSnackbar("Successfully accepted NC", {
                variant: "success",
              });
            })
            .catch((error: any) => {
              enqueueSnackbar("Something went wrong!", {
                variant: "error",
              });
            });
        break;
      case "Accept":
        copyData.isDraft = false;
        copyData.userId = userId;
        if (
          isAuditor &&
          (auditorData.comment === "" || auditorData.date === "")
        ) {
          enqueueSnackbar("You need to fill up the required details.", {
            variant: "error",
          });
          return;
        }
        if (isAuditee) {
          acceptNc(id || modalId!, copyData, false)
            .then((response: any) => {
              if (setUpdateModelVisible) {
                setUpdateModelVisible(false);
              }
              if (setRerender) {
                setRerender(true);
              }
              if (isInbox === true) {
                navigate("/Inbox");
              } else {
                navigate("/audit", {
                  state: { redirectToTab: "List of Findings" },
                });
              }
              enqueueSnackbar("Successfully accepted NC", {
                variant: "success",
              });
            })
            .catch((error: any) => {
              enqueueSnackbar("Something went wrong!", {
                variant: "error",
              });
            });
        } else if (isAuditor) {
          acceptNc(id || modalId!, auditorCopyData, false)
            .then((response: any) => {
              if (setUpdateModelVisible) {
                setUpdateModelVisible(false);
              }
              if (setRerender) {
                setRerender(true);
              }
              if (isInbox === true) {
                navigate("/Inbox");
              } else {
                navigate("/audit", {
                  state: { redirectToTab: "List of Findings" },
                });
              }
              enqueueSnackbar("Successfully accepted NC", {
                variant: "success",
              });
            })
            .catch((error: any) => {
              enqueueSnackbar("Something went wrong!", {
                variant: "error",
              });
            });
        } else {
          acceptNc(id || modalId!, copyData, false)
            .then((response: any) => {
              if (setUpdateModelVisible) {
                setUpdateModelVisible(false);
              }
              if (setRerender) {
                setRerender(true);
              }
              if (isInbox === true) {
                navigate("/Inbox");
              } else {
                navigate("/audit", {
                  state: { redirectToTab: "List of Findings" },
                });
              }
              enqueueSnackbar("Successfully accepted NC", {
                variant: "success",
              });
            })
            .catch((error: any) => {
              enqueueSnackbar("Something went wrong!", {
                variant: "error",
              });
            });
        }

        break;

      case "Verify":
        copyData.isDraft = false;
        copyData.userId = userId;
        if (
          isAuditor &&
          (auditorData.verficationAction === "" ||
            auditorData.verficationDate === "")
        ) {
          enqueueSnackbar("You need to fill up the required details.", {
            variant: "error",
          });
          return;
        }
        if (isAuditor) {
          acceptNc(id || modalId!, auditorCopyData, false)
            .then((response: any) => {
              if (setUpdateModelVisible) {
                setUpdateModelVisible(false);
              }
              if (setRerender) {
                setRerender(true);
              }
              if (isInbox === true) {
                navigate("/Inbox");
              } else {
                navigate("/audit", {
                  state: { redirectToTab: "List of Findings" },
                });
              }
              enqueueSnackbar("Successfully Verified NC", {
                variant: "success",
              });
            })
            .catch((error: any) => {
              enqueueSnackbar("Something went wrong!", {
                variant: "error",
              });
            });
        } else {
          acceptNc(id || modalId!, copyData, false)
            .then((response: any) => {
              if (setUpdateModelVisible) {
                setUpdateModelVisible(false);
              }
              if (setRerender) {
                setRerender(true);
              }
              if (isInbox === true) {
                navigate("/Inbox");
              } else {
                navigate("/audit", {
                  state: { redirectToTab: "List of Findings" },
                });
              }
              enqueueSnackbar("Successfully accepted NC", {
                variant: "success",
              });
            })
            .catch((error: any) => {
              enqueueSnackbar("Something went wrong!", {
                variant: "error",
              });
            });
        }

        break;

      case "Send Back to Auditee":
        auditorCopyData.isDraft = true;
        auditorCopyData.userId = userId;
        auditorCopyData.sendBackComment = formData.sendBackComment;
        if (!status) {
          setModalComment(true);
          return;
        }
        if (isAuditor) {
          acceptNc(id || modalId!, auditorCopyData, false)
            .then((response: any) => {
              if (setUpdateModelVisible) {
                setUpdateModelVisible(false);
              }
              if (setRerender) {
                setRerender(true);
              }
              if (isInbox === true) {
                navigate("/Inbox");
              } else {
                navigate("/audit", {
                  state: { redirectToTab: "List of Findings" },
                });
              }
              enqueueSnackbar("Successfully Verified NC", {
                variant: "success",
              });
            })
            .catch((error: any) => {
              enqueueSnackbar("Something went wrong!", {
                variant: "error",
              });
            });
        } else {
          acceptNc(id || modalId!, copyData, false)
            .then((response: any) => {
              if (setUpdateModelVisible) {
                setUpdateModelVisible(false);
              }
              if (setRerender) {
                setRerender(true);
              }
              if (isInbox === true) {
                navigate("/Inbox");
              } else {
                navigate("/audit", {
                  state: { redirectToTab: "List of Findings" },
                });
              }
              enqueueSnackbar("Successfully accepted NC", {
                variant: "success",
              });
            })
            .catch((error: any) => {
              enqueueSnackbar("Something went wrong!", {
                variant: "error",
              });
            });
        }

        break;
      case "Reject NC":
        copyData.userId = userId;
        isAuditee &&
          rejectNc(id || modalId!, copyData)
            .then((response: any) => {
              if (setUpdateModelVisible) {
                setUpdateModelVisible(false);
              }
              if (setRerender) {
                setRerender(true);
              }
              if (isInbox === true) {
                navigate("/Inbox");
              } else {
                navigate("/audit", {
                  state: { redirectToTab: "List of Findings" },
                });
              }
              enqueueSnackbar("Successfully rejected NC", {
                variant: "success",
              });
            })
            .catch((error: any) => console.log("error - ", error));
        isAuditor &&
          rejectNc(id || modalId!, auditorCopyData)
            .then((response: any) => {
              // console.log("response reject auditor ", response?.data);
            })
            .catch((error: any) => {
              // console.log("error - ", error);
              enqueueSnackbar("Something went wrong!", {
                variant: "error",
              });
            });
        // isMR && handleDialogOpen();
        break;
      case "Reject":
        copyData.userId = userId;
        isAuditee &&
          rejectNc(id || modalId!, copyData)
            .then((response: any) => {
              if (setUpdateModelVisible) {
                setUpdateModelVisible(false);
              }
              if (setRerender) {
                setRerender(true);
              }
              if (isInbox === true) {
                navigate("/Inbox");
              } else {
                navigate("/audit", {
                  state: { redirectToTab: "List of Findings" },
                });
              }
              enqueueSnackbar("Successfully rejected NC", {
                variant: "success",
              });
            })
            .catch((error: any) => {
              // console.log("error - ", error);
              enqueueSnackbar("Something went wrong!", {
                variant: "error",
              });
            });
        isAuditor &&
          rejectNc(id || modalId!, copyData)
            .then((response: any) => {
              if (setUpdateModelVisible) {
                setUpdateModelVisible(false);
              }
              if (setRerender) {
                setRerender(true);
              }
              if (isInbox === true) {
                navigate("/Inbox");
              } else {
                navigate("/audit", {
                  state: { redirectToTab: "List of Findings" },
                });
              }
              enqueueSnackbar("Successfully rejected NC", {
                variant: "success",
              });
            })
            .catch((error: any) => {
              // console.log("error - ", error);
              enqueueSnackbar("Something went wrong!", {
                variant: "error",
              });
            });
        // isMR && handleDialogOpen();
        break;

      case "Change Audit Type":
        fectchFindingTypes();
        handleDialogOpen();
        break;
      case "Close NC":
        // (isMR || isOrgAdmin) &&
        if (!closureData?.closureRemarks) {
          enqueueSnackbar(`Closure Remarks should not empty`, {
            variant: "error",
          });
          return;
        }

        if (!closureData?.closureDate) {
          enqueueSnackbar(`Closure Date should not empty`, {
            variant: "error",
          });
          return;
        }
        closeNc(id || modalId!, {
          userId: userId,
          ...auditorData,
          ...closureData,
          ...auditeeData,
        })
          .then((response: any) => {
            if (setUpdateModelVisible) {
              setUpdateModelVisible(false);
            }
            if (setRerender) {
              setRerender(true);
            }
            if (isInbox === true) {
              navigate("/Inbox");
            } else {
              navigate("/audit", {
                state: { redirectToTab: "List of Findings" },
              });
            }
            enqueueSnackbar("Successfully closed Findings", {
              variant: "success",
            });
          })
          .catch((error: any) => {
            // console.log("error - ", error);
            enqueueSnackbar("Something went wrong!", {
              variant: "error",
            });
          });
        break;

      case "Save":
        let copyAuditeeData = JSON.parse(JSON.stringify(auditeeData));
        copyAuditeeData.isDraft = false;
        copyAuditeeData.userId = userId;
        let copyAuditorData = JSON.parse(JSON.stringify(auditorData));
        copyAuditorData.isDraft = false;
        copyAuditorData.userId = userId;
        if (isAuditee) {
          acceptNc(id || modalId!, copyAuditeeData, true)
            .then((response: any) => {
              if (setUpdateModelVisible) {
                setUpdateModelVisible(false);
              }
              if (setRerender) {
                setRerender(true);
              }
              if (isInbox === true) {
                navigate("/Inbox");
              } else {
                navigate("/audit", {
                  state: { redirectToTab: "List of Findings" },
                });
              }
              enqueueSnackbar("Successfully saved ", {
                variant: "success",
              });
            })
            .catch((error: any) => {
              // console.log("error - ", error);
              enqueueSnackbar("Something went wrong!", {
                variant: "error",
              });
            });
        } else if (isAuditor) {
          acceptNc(id || modalId!, copyAuditorData, true)
            .then((response: any) => {
              if (setUpdateModelVisible) {
                setUpdateModelVisible(false);
              }
              if (setRerender) {
                setRerender(true);
              }
              if (isInbox === true) {
                navigate("/Inbox");
              } else {
                navigate("/audit", {
                  state: { redirectToTab: "List of Findings" },
                });
              }
              enqueueSnackbar("Successfully saved as draft", {
                variant: "success",
              });
            })
            .catch((error: any) => {
              // console.log("error - ", error);
              enqueueSnackbar("Something went wrong!", {
                variant: "error",
              });
            });
        }

        break;

      default:
        // console.log("No options found!");
        break;
    }
  };

  const uploadProps: UploadProps = {
    multiple: true,
    beforeUpload: () => false,
    fileList: template?.files || [],
    onRemove: (file) => {
      const updatedFileList = template.files.filter(
        (item: any) => item.uid !== file.uid
      );
      setAuditeeData((prevTemplate: any) => ({
        ...prevTemplate,
        proofDocuments: updatedFileList,
      }));
    },
    onChange({ file, fileList }) {
      if (
        file.status !== "uploading" &&
        file.status !== "removed" &&
        file.status !== "error"
      ) {
        setAuditeeData((prevTemplate: any) => ({
          ...prevTemplate,
          proofDocument: fileList,
        }));
      }
    },
  };

  // console.log(
  //   "test bcases",
  //   closureOwnerRule
  //     ? id ||
  //         hasAuditeeAccepted ||
  //         hasAuditeeRejected ||
  //         (!isAuditee && !auditeeData.isDraft) ||
  //         isMR ||
  //         closedStatus
  //     : false,
  //   "id",
  //   id,
  //   "hasAuditeeAccepted",
  //   hasAuditeeAccepted,
  //   "hasAuditeeRejected",
  //   hasAuditeeRejected,
  //   "(!isAuditee && !auditeeData.isDraft) ",
  //   !isAuditee && !auditeeData.isDraft,
  //   "closedStatus",
  //   closedStatus
  // );
  const auditeeSectionsFinal = [
    {
      label: "Planned",
      key: 1,
      display: true,
      children: (
        <div>
          <Grid container spacing={2}>
            <Grid item container xs={4} sm={4} md={4}>
              <Grid
                item
                xs={10}
                sm={10}
                md={10}
                className={classes.formTextPadding}
              >
                <strong>
                  <span className={classes.asterisk}>*</span>{" "}
                </strong>
                <strong>
                  <span className={classes.label}>
                    Planned Date Of Correction:
                  </span>
                </strong>
              </Grid>
              <Grid item xs={6} sm={6} md={6}>
                <TextField
                  disabled={
                    closureOwnerRule
                      ? id ||
                        hasAuditeeAccepted ||
                        hasAuditeeRejected ||
                        (!isAuditee && !auditeeData.isDraft) ||
                        // isMR ||
                        closedStatus
                      : false
                  }
                  variant="outlined"
                  name="targetDate"
                  type="date"
                  fullWidth
                  size="small"
                  value={auditeeData?.targetDate}
                  onChange={auditeeChangeHandler}
                  inputProps={{
                    style: {
                      fontSize: "14px", // Set the desired font size here
                    },

                    min: moment(auditDate).format("YYYY-MM-DD"),
                  }}
                />
              </Grid>
            </Grid>
            <Grid item container xs={12} sm={12} md={8} spacing={1}>
              <Grid
                item
                xs={10}
                sm={10}
                md={10}
                className={classes.formTextPadding}
              >
                <strong>
                  <span className={classes.label}>Planned Correction:</span>
                </strong>
              </Grid>
              <Grid item xs={10} sm={10} md={10}>
                <TextField
                  disabled={
                    closureOwnerRule
                      ? id ||
                        hasAuditeeAccepted ||
                        hasAuditeeRejected ||
                        (!isAuditee && !auditeeData.isDraft) ||
                        // isMR ||
                        closedStatus
                      : false
                  }
                  variant="outlined"
                  name="correction"
                  value={auditeeData?.correction}
                  fullWidth
                  size="small"
                  multiline
                  minRows={2}
                  onChange={auditeeChangeHandler}
                />
              </Grid>
            </Grid>

            {formData.corrective && (
              <Grid item container xs={4} sm={4} md={4}>
                <Grid
                  item
                  xs={10}
                  sm={10}
                  md={10}
                  className={classes.formTextPadding}
                >
                  <strong>
                    <span className={classes.asterisk}>*</span>{" "}
                  </strong>
                  <strong>
                    {" "}
                    <span className={classes.label}>
                      Planned Date Of Corrective Action:
                    </span>
                  </strong>
                </Grid>
                <Grid item xs={6} sm={6} md={6}>
                  <TextField
                    disabled={
                      closureOwnerRule
                        ? id ||
                          hasAuditeeAccepted ||
                          hasAuditeeRejected ||
                          (!isAuditee && !auditeeData.isDraft) ||
                          // isMR ||
                          closedStatus
                        : false
                    }
                    style={{ fontSize: "14px" }}
                    variant="outlined"
                    name="date"
                    type="date"
                    fullWidth
                    size="small"
                    value={auditeeData?.date}
                    onChange={auditeeChangeHandler}
                    inputProps={{
                      style: {
                        fontSize: "14px", // Set the desired font size here
                      },
                      min: moment(auditDate).format("YYYY-MM-DD"),
                    }}
                  />
                </Grid>
              </Grid>
            )}
            {formData.corrective ? (
              <Grid item container xs={12} sm={12} md={8} spacing={1}>
                <Grid
                  item
                  xs={10}
                  sm={10}
                  md={10}
                  className={classes.formTextPadding}
                >
                  <strong>
                    <span className={classes.label}>
                      Planned Corrective Action:
                    </span>
                  </strong>
                </Grid>
                <Grid item xs={10} sm={10} md={10}>
                  <TextField
                    disabled={
                      closureOwnerRule
                        ? id ||
                          hasAuditeeAccepted ||
                          hasAuditeeRejected ||
                          (!isAuditee && !auditeeData.isDraft) ||
                          // isMR ||
                          closedStatus ||
                          !closureOwnerRule
                        : false
                    }
                    variant="outlined"
                    name="comment"
                    value={auditeeData?.comment}
                    fullWidth
                    size="small"
                    multiline
                    minRows={2}
                    onChange={auditeeChangeHandler}
                  />
                </Grid>
              </Grid>
            ) : (
              ""
            )}

            {/* <Grid item xs={12} sm={12} md={1}></Grid>
              <Grid item container xs={4} sm={4} md={4}></Grid> */}
          </Grid>
        </div>
      ),
    },
    {
      label: "Actual",
      key: 2,
      display: true,
      children: (
        <div>
          <Grid container spacing={2}>
            <Grid item container xs={4} sm={4} md={4}>
              <Grid
                item
                xs={10}
                sm={10}
                md={10}
                className={classes.formTextPadding}
              >
                <strong>
                  <span className={classes.asterisk}>*</span>{" "}
                </strong>
                <strong>
                  <span className={classes.label}>
                    Actual Date Of Correction:
                  </span>
                </strong>
              </Grid>
              <Grid item xs={6} sm={6} md={6}>
                <TextField
                  disabled={
                    closureOwnerRule
                      ? id ||
                        hasAuditeeAccepted ||
                        hasAuditeeRejected ||
                        (!isAuditee && !auditeeData.isDraft) ||
                        // isMR ||
                        closedStatus
                      : false
                  }
                  variant="outlined"
                  name="actualTargetDate"
                  type="date"
                  fullWidth
                  size="small"
                  value={auditeeData?.actualTargetDate}
                  onChange={auditeeChangeHandler}
                  inputProps={{
                    style: {
                      fontSize: "14px", // Set the desired font size here
                    },

                    max: moment(new Date()).format("YYYY-MM-DD"),
                  }}
                />
              </Grid>
            </Grid>
            <Grid item container xs={12} sm={12} md={8} spacing={1}>
              <Grid
                item
                xs={10}
                sm={10}
                md={10}
                className={classes.formTextPadding}
              >
                <strong>
                  <span className={classes.label}>Actual Correction:</span>
                </strong>
              </Grid>
              <Grid item xs={10} sm={10} md={10}>
                <TextField
                  disabled={
                    closureOwnerRule
                      ? id ||
                        hasAuditeeAccepted ||
                        hasAuditeeRejected ||
                        (!isAuditee && !auditeeData.isDraft) ||
                        // isMR ||
                        closedStatus
                      : false
                  }
                  variant="outlined"
                  name="actualCorrection"
                  value={auditeeData?.actualCorrection}
                  fullWidth
                  size="small"
                  multiline
                  minRows={2}
                  onChange={auditeeChangeHandler}
                />
              </Grid>
            </Grid>

            {formData.corrective && (
              <Grid item container xs={4} sm={4} md={4}>
                <Grid
                  item
                  xs={10}
                  sm={10}
                  md={10}
                  className={classes.formTextPadding}
                >
                  <strong>
                    <span className={classes.asterisk}>*</span>{" "}
                  </strong>
                  <strong>
                    {" "}
                    <span className={classes.label}>
                      Actual Date Of Corrective Action :
                    </span>
                  </strong>
                </Grid>
                <Grid item xs={6} sm={6} md={6}>
                  <TextField
                    disabled={
                      closureOwnerRule
                        ? id ||
                          hasAuditeeAccepted ||
                          hasAuditeeRejected ||
                          (!isAuditee && !auditeeData.isDraft) ||
                          // isMR ||
                          closedStatus
                        : false
                    }
                    style={{ fontSize: "14px" }}
                    variant="outlined"
                    name="actualDate"
                    type="date"
                    fullWidth
                    size="small"
                    value={auditeeData?.actualDate}
                    onChange={auditeeChangeHandler}
                    inputProps={{
                      style: {
                        fontSize: "14px", // Set the desired font size here
                      },
                      max: moment(new Date()).format("YYYY-MM-DD"),
                    }}
                  />
                </Grid>
              </Grid>
            )}
            {formData.corrective ? (
              <Grid item container xs={12} sm={12} md={8} spacing={1}>
                <Grid
                  item
                  xs={10}
                  sm={10}
                  md={10}
                  className={classes.formTextPadding}
                >
                  <strong>
                    <span className={classes.label}>
                      Actual Corrective Action:
                    </span>
                  </strong>
                </Grid>
                <Grid item xs={10} sm={10} md={10}>
                  <TextField
                    disabled={
                      closureOwnerRule
                        ? id ||
                          hasAuditeeAccepted ||
                          hasAuditeeRejected ||
                          (!isAuditee && !auditeeData.isDraft) ||
                          // isMR ||
                          closedStatus ||
                          !closureOwnerRule
                        : false
                    }
                    variant="outlined"
                    name="actualComment"
                    value={auditeeData?.actualComment}
                    fullWidth
                    size="small"
                    multiline
                    minRows={2}
                    onChange={auditeeChangeHandler}
                  />
                </Grid>
              </Grid>
            ) : (
              ""
            )}

            {/* <Grid item xs={12} sm={12} md={1}></Grid>
              <Grid item container xs={4} sm={4} md={4}></Grid> */}
          </Grid>
        </div>
      ),
    },
  ];

  const viewObjectStorageDoc = async (link: any) => {
    const response = await axios.post(`${API_LINK}/api/documents/viewerOBJ`, {
      documentLink: link,
    });
    return response.data;
  };

  const handleLinkClick = async (item: any) => {
    const finalLink =
      process.env.REACT_APP_IS_OBJECT_STORAGE === "false"
        ? item?.url
        : await viewObjectStorageDoc(item?.url);
    const anchor = document.createElement("a");
    anchor.href = finalLink || "#";
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.click();
    // Your custom logic for link click goes here
    // event.preventDefault();
  };

  const handleDeleteFile = async (uid: string) => {
    // console.log("check response in deleting file", response);
    // if (response.status === 200 || response.status === 201) {
    const updatedFileList = auditeeData.proofDocument.filter(
      (item: any) => item.uid !== uid
    );
    setAuditeeData((prevTemplate: any) => ({
      ...prevTemplate,
      proofDocument: updatedFileList,
    }));
    // }
  };
  const tabs = [
    {
      label: "Auditee Section",
      key: 1,
      display: true,
      children: (
        <div>
          <section className={classes.form__section1}>
            <div className={classes.button__group}></div>
            <Tabs
              activeKey={auditeeSectionactiveTab}
              type="card"
              onChange={handleTabChangeAuditeeSection} // This will handle the tab changes
              animated={{ inkBar: true, tabPane: true }}
              style={{ marginLeft: "10px" }}
            >
              {auditeeSectionsFinal
                .filter((tab) => tab.display === true) // Filter out the Auditor Section tab if formData.auditorSection is false
                .map((tab) => (
                  <Tabs.TabPane key={tab.key} tab={tab.label}>
                    {tab.children}
                  </Tabs.TabPane>
                ))}
            </Tabs>
          </section>
          <section className={classes.form__section1}>
            <Grid container>
              <Grid item container xs={12} sm={12} md={4}>
                <Grid
                  item
                  xs={10}
                  sm={10}
                  md={10}
                  className={classes.formTextPadding}
                >
                  <strong>Evidence Attachment:</strong>
                </Grid>
                <Grid item xs={10} sm={10} md={11}>
                  <Form.Item name="uploader" style={{ display: "none" }}>
                    <Input
                      disabled={
                        closureOwnerRule
                          ? id ||
                            hasAuditeeAccepted ||
                            hasAuditeeRejected ||
                            (!isAuditee && !auditeeData.isDraft) ||
                            // isMR ||
                            closedStatus
                          : false
                      }
                    />
                  </Form.Item>
                  <Dragger
                    name="files"
                    {...uploadProps}
                    showUploadList={false}
                    fileList={auditeeData.proofDocument}
                    multiple
                  >
                    <div style={{ textAlign: "center" }}>
                      <MdInbox style={{ fontSize: "36px" }} />
                      <p className="ant-upload-text">
                        Click or drag files here to upload
                      </p>
                    </div>
                  </Dragger>
                  {!!auditeeData?.proofDocument &&
                    !!auditeeData?.proofDocument?.length && (
                      <div>
                        <Typography
                          variant="body2"
                          style={{ marginTop: "16px", marginBottom: "8px" }}
                        >
                          Uploaded Files:
                        </Typography>
                        {auditeeData?.proofDocument?.map(
                          (item: any, index: number) => (
                            <div
                              key={index}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                marginBottom: "8px",
                              }}
                            >
                              <Typography
                                className={classes.filename}
                                onClick={() => handleLinkClick(item)}
                              >
                                {item?.name}
                              </Typography>
                              <div
                                style={{
                                  cursor: "pointer",
                                  marginRight: "8px",
                                }}
                                onClick={() => handleDeleteFile(item.uid)}
                              >
                                <MdDelete style={{ fontSize: "18px" }} />
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  {/* <div className={classes.button__container}>
                    <label htmlFor="contained-button-file">
                      <input
                        disabled={
                          hasAuditeeAccepted ||
                          hasAuditeeRejected ||
                          (!isAuditee && !auditeeData.isDraft) ||
                          isMR
                        }
                        accept="image/*"
                        id="contained-button-file"
                        multiple
                        type="file"
                        hidden
                        onChange={handleImageUpload}
                      />
                      <Button
                        disabled={
                          hasAuditeeAccepted ||
                          hasAuditeeRejected ||
                          (!isAuditee && !auditeeData.isDraft) ||
                          isMR ||
                          closedStatus
                        }
                        size="small"
                        className={classes.attachButton}
                      >
                        Attach
                      </Button>
                    </label>
                    {auditeeData?.proofDocument && (
                      <>
                        <Typography className={classes.filename}>
                          <a
                            href={`${API_LINK}${auditeeData?.proofDocument}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {auditeeData?.documentName}
                          </a>
                          {auditeeData?.documentName}
                        </Typography>

                        <IconButton onClick={clearFile}>
                          <img src={CrossIcon} alt="" />
                        </IconButton>
                      </>
                    )}
                  </div> */}
                </Grid>
              </Grid>
              <Grid
                item
                container
                xs={10}
                sm={10}
                md={7}
                style={{ paddingLeft: "15px" }}
              >
                <Typography
                  // align="left"
                  // variant="h6"
                  // gutterBottom
                  style={{
                    // paddingBottom: "20px",

                    fontSize: "15px",
                    fontWeight: "bold",
                    color: "#003566",
                  }}
                >
                  {/* Root Cause Analysis:
                   */}

                  <strong>
                    <span className={classes.asterisk}>*</span>{" "}
                  </strong>
                  <strong>
                    {" "}
                    <span className={classes.label}>Root Cause Analysis:</span>
                  </strong>
                </Typography>

                <TextField
                  disabled={
                    closureOwnerRule
                      ? id ||
                        hasAuditeeAccepted ||
                        hasAuditeeRejected ||
                        (!isAuditee && !auditeeData.isDraft) ||
                        // isMR ||
                        closedStatus
                      : false
                  }
                  variant="outlined"
                  name="whyAnalysis"
                  value={auditeeData?.whyAnalysis}
                  fullWidth
                  size="small"
                  multiline
                  minRows={2}
                  onChange={auditeeChangeHandler}
                />
                {/* </Grid> */}
              </Grid>
            </Grid>
          </section>
          <div>
            <section className={classes.form__section}>
              <Dialog
                fullScreen={fullScreen}
                open={dialogOpen}
                onClose={handleDialogClose}
                aria-labelledby="responsive-dialog-title"
              >
                <DialogContent>
                  <DialogContentText>
                    Would you like to create an observation?
                  </DialogContentText>
                  <RadioGroup
                    aria-label="observation-option"
                    name="observationOption"
                    value={selectedOption}
                    onChange={(e) => {
                      setSelectedOption(e.target.value);
                    }}
                  >
                    {findingTypes.map((value: any) => (
                      <FormControlLabel
                        value={value.findingType}
                        control={<Radio />}
                        label={value.findingType}
                      />
                    ))}
                  </RadioGroup>
                </DialogContent>
                <DialogActions>
                  <Button
                    autoFocus
                    onClick={() => {
                      if (selectedOption === "no") {
                        cancelNc();
                      } else {
                        // Handle other logic for 'No' option
                      }
                      handleDialogClose();
                    }}
                    color="primary"
                  >
                    No
                  </Button>
                  <Button
                    onClick={() => {
                      if (selectedOption !== "") {
                        convertToObservation();
                      } else {
                        // Handle other logic for 'Yes' option
                      }
                      handleDialogClose();
                    }}
                    color="primary"
                    autoFocus
                  >
                    Yes
                  </Button>
                </DialogActions>
              </Dialog>
              <Grid container spacing={2}>
                {/* Review Date */}

                {/* <Grid item container xs={8} sm={8} md={8}>
                  <Grid
                    item
                    xs={10}
                    sm={10}
                    md={10}
                    className={classes.formTextPadding}
                  >
                    <strong>
                      <span className={classes.asterisk}>*</span>{" "}
                    </strong>
                    <strong>
                      {" "}
                      <span className={classes.label}>
                        Verification/Effectiveness Review Comment:
                      </span>
                    </strong>
                  </Grid>
                  <Grid item xs={10} sm={10} md={10}>
                    <TextField
                      disabled={
                        closureOwnerRule
                          ? id ||
                            hasAuditorAccepted ||
                            !isAuditor ||
                            closedStatus
                          : false
                      }
                      variant="outlined"
                      value={auditorData?.verficationAction}
                      fullWidth
                      size="small"
                      multiline
                      minRows={2}
                      name="verficationAction"
                      onChange={auditorChangeHandler}
                    />
                  </Grid>
                </Grid>
                <Grid item container xs={12} sm={12} md={4} spacing={1}>
                  <Grid
                    item
                    xs={10}
                    sm={10}
                    md={10}
                    className={classes.formTextPadding}
                  >
                    <strong>
                      <span className={classes.asterisk}>*</span>{" "}
                    </strong>
                    <strong>
                      {" "}
                      <span className={classes.label}>Verification Date:</span>
                    </strong>
                  </Grid>
                  <Grid item xs={6} sm={6} md={6}>
                    <TextField
                      type="date"
                      disabled={
                        closureOwnerRule
                          ? id ||
                            hasAuditorAccepted ||
                            !isAuditor ||
                            closedStatus
                          : false
                      }
                      name="verficationDate"
                      variant="outlined"
                      fullWidth
                      size="small"
                      value={auditorData?.verficationDate}
                      inputProps={{
                        style: {
                          fontSize: "14px", // Set the desired font size here
                        },

                        min: moment(correctiveActionDate).format("YYYY-MM-DD"),
                      }}
                      onChange={auditorChangeHandler}
                    />
                  </Grid>
                </Grid> */}
                {/* <Grid item xs={12} sm={12} md={1}></Grid> */}

                {/* Comments/Action taken* */}
                {/* <Grid item container xs={8} sm={8} md={8}>
                <Grids
                  item
                  xs={10}
                  sm={10}
                  md={10}
                  className={classes.formTextPadding}
                >
                  <strong>
                    <span className={classes.label}>
                      Effectiveness Review Comments:
                    </span>
                  </strong>
                </Grid>
                <Grid item xs={10} sm={10} md={10}>
                  <TextField
                    disabled={hasAuditorAccepted || !isAuditor || closedStatus}
                    variant="outlined"
                    value={auditorData?.comment}
                    fullWidth
                    size="small"
                    multiline
                    minRows={2}
                    name="comment"
                    onChange={auditorChangeHandler}
                  />
                </Grid>
              </Grid>

              <Grid item container xs={12} sm={12} md={4} spacing={1}>
                <Grid
                  item
                  xs={10}
                  sm={10}
                  md={10}
                  className={classes.formTextPadding}
                >
                  <strong>
                    {" "}
                    <span className={classes.label}>
                      Effectiveness Review Date:
                    </span>
                  </strong>
                </Grid>
                <Grid item xs={6} sm={6} md={6}>
                  <TextField
                    type="date"
                    disabled={hasAuditorAccepted || !isAuditor || closedStatus}
                    name="date"
                    variant="outlined"
                    fullWidth
                    size="small"
                    value={auditorData?.date}
                    inputProps={{
                      style: {
                        fontSize: "14px", // Set the desired font size here
                      },

                      min: moment(correctiveActionDate).format("YYYY-MM-DD"),
                    }}
                    onChange={auditorChangeHandler}
                  />
                </Grid>
              </Grid> */}
              </Grid>
            </section>
          </div>
        </div>
      ),
    },
    {
      label: "Auditor Section",
      key: 2,
      display: formData.auditorSection === true ? true : false,
      children: formData.auditorSection === true && (
        <div>
          <section className={classes.form__section}>
            <Dialog
              fullScreen={fullScreen}
              open={dialogOpen}
              onClose={handleDialogClose}
              aria-labelledby="responsive-dialog-title"
            >
              <DialogContent>
                <DialogContentText>
                  Would you like to create an observation?
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button
                  autoFocus
                  onClick={() => {
                    cancelNc();
                    handleDialogClose();
                  }}
                  color="primary"
                >
                  No
                </Button>
                <Button
                  onClick={() => {
                    convertToObservation();
                    handleDialogClose();
                  }}
                  color="primary"
                  autoFocus
                >
                  Yes
                </Button>
              </DialogActions>
            </Dialog>
            <Grid container spacing={2}>
              {/* Review Date */}

              <Grid item container xs={8} sm={8} md={8}>
                <Grid
                  item
                  xs={10}
                  sm={10}
                  md={10}
                  className={classes.formTextPadding}
                >
                  <strong>
                    <span className={classes.asterisk}>*</span>{" "}
                  </strong>
                  <strong>
                    {" "}
                    <span className={classes.label}>
                      Verification/Effectiveness Review Comment:
                    </span>
                  </strong>
                </Grid>
                <Grid item xs={10} sm={10} md={10}>
                  <TextField
                    disabled={
                      closureOwnerRule
                        ? id || hasAuditorAccepted || !isAuditor || closedStatus
                        : false
                    }
                    variant="outlined"
                    value={auditorData?.verficationAction}
                    fullWidth
                    size="small"
                    multiline
                    minRows={2}
                    name="verficationAction"
                    onChange={auditorChangeHandler}
                  />
                </Grid>
              </Grid>
              <Grid item container xs={12} sm={12} md={4} spacing={1}>
                <Grid
                  item
                  xs={10}
                  sm={10}
                  md={10}
                  className={classes.formTextPadding}
                >
                  <strong>
                    <span className={classes.asterisk}>*</span>{" "}
                  </strong>
                  <strong>
                    {" "}
                    <span className={classes.label}>Verification Date:</span>
                  </strong>
                </Grid>
                <Grid item xs={6} sm={6} md={6}>
                  <TextField
                    type="date"
                    disabled={
                      closureOwnerRule
                        ? id || hasAuditorAccepted || !isAuditor || closedStatus
                        : false
                    }
                    name="verficationDate"
                    variant="outlined"
                    fullWidth
                    size="small"
                    value={auditorData?.verficationDate}
                    inputProps={{
                      style: {
                        fontSize: "14px", // Set the desired font size here
                      },

                      max: moment(new Date()).format("YYYY-MM-DD"),
                    }}
                    onChange={auditorChangeHandler}
                  />
                </Grid>
              </Grid>
              {/* <Grid item xs={12} sm={12} md={1}></Grid> */}

              {/* Comments/Action taken* */}
              {/* <Grid item container xs={8} sm={8} md={8}>
                <Grid
                  item
                  xs={10}
                  sm={10}
                  md={10}
                  className={classes.formTextPadding}
                >
                  <strong>
                    <span className={classes.label}>
                      Effectiveness Review Comments:
                    </span>
                  </strong>
                </Grid>
                <Grid item xs={10} sm={10} md={10}>
                  <TextField
                    disabled={hasAuditorAccepted || !isAuditor || closedStatus}
                    variant="outlined"
                    value={auditorData?.comment}
                    fullWidth
                    size="small"
                    multiline
                    minRows={2}
                    name="comment"
                    onChange={auditorChangeHandler}
                  />
                </Grid>
              </Grid>

              <Grid item container xs={12} sm={12} md={4} spacing={1}>
                <Grid
                  item
                  xs={10}
                  sm={10}
                  md={10}
                  className={classes.formTextPadding}
                >
                  <strong>
                    {" "}
                    <span className={classes.label}>
                      Effectiveness Review Date:
                    </span>
                  </strong>
                </Grid>
                <Grid item xs={6} sm={6} md={6}>
                  <TextField
                    type="date"
                    disabled={hasAuditorAccepted || !isAuditor || closedStatus}
                    name="date"
                    variant="outlined"
                    fullWidth
                    size="small"
                    value={auditorData?.date}
                    inputProps={{
                      style: {
                        fontSize: "14px", // Set the desired font size here
                      },

                      min: moment(correctiveActionDate).format("YYYY-MM-DD"),
                    }}
                    onChange={auditorChangeHandler}
                  />
                </Grid>
              </Grid> */}
            </Grid>
          </section>
        </div>
      ),
    },
    {
      label: "Closure",
      key: 3,
      display: formData.closureBy !== "None" ? true : false,
      children: formData.closureBy !== "None" && (
        <div>
          <section className={classes.form__section}>
            <Grid container spacing={2}>
              {/* Review Date */}
              <Grid item container xs={8} sm={8} md={8}>
                <Grid
                  item
                  xs={10}
                  sm={10}
                  md={10}
                  className={classes.formTextPadding}
                >
                  <strong>
                    <span className={classes.asterisk}>*</span>{" "}
                  </strong>
                  <strong>
                    {" "}
                    <span className={classes.label}>Closure Remarks:</span>
                  </strong>
                </Grid>
                <Grid item xs={10} sm={10} md={10}>
                  <TextField
                    disabled={
                      closureOwnerRule
                        ? id !== undefined ||
                          ncStatus !== "VERIFIED" ||
                          (closureOwner === "MCOE" && !isOrgAdmin) ||
                          (closureOwner === "IMSC" && !isMR)
                        : false
                    }
                    variant="outlined"
                    value={closureData?.closureRemarks}
                    fullWidth
                    size="small"
                    multiline
                    minRows={2}
                    name="closureRemarks"
                    onChange={closureChangeHandler}
                  />
                </Grid>
              </Grid>
              <Grid item container xs={12} sm={12} md={4} spacing={1}>
                <Grid
                  item
                  xs={10}
                  sm={10}
                  md={10}
                  className={classes.formTextPadding}
                >
                  <strong>
                    <span className={classes.asterisk}>*</span>{" "}
                  </strong>
                  <strong>
                    {" "}
                    <span className={classes.label}>Date of Closure:</span>
                  </strong>
                </Grid>
                <Grid item xs={6} sm={6} md={6}>
                  <TextField
                    type="date"
                    disabled={
                      closureOwnerRule
                        ? id !== undefined ||
                          ncStatus !== "VERIFIED" ||
                          (closureOwner === "MCOE" && !isOrgAdmin) ||
                          (closureOwner === "IMSC" && !isMR)
                        : false
                    }
                    name="closureDate"
                    variant="outlined"
                    fullWidth
                    size="small"
                    value={closureData?.closureDate}
                    inputProps={{
                      style: {
                        fontSize: "14px", // Set the desired font size here
                      },

                      min: moment(correctiveActionDate).format("YYYY-MM-DD"),
                    }}
                    onChange={closureChangeHandler}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item container xs={12} sm={12} md={4} spacing={1}>
                <Grid
                  item
                  xs={10}
                  sm={10}
                  md={10}
                  className={classes.formTextPadding}
                >
                  <strong>
                    <span className={classes.label}>
                      Follow up Audit Required:
                    </span>
                  </strong>
                </Grid>
                <Grid item xs={6} sm={6} md={6}>
                  <RadioGroup
                    aria-label="auditRequired"
                    name="auditRequired"
                    value={closureData?.auditRequired}
                    onChange={closureChangeHandler}
                  >
                    <FormControlLabel
                      value="Yes"
                      control={<Radio />}
                      label="Yes"
                      disabled={
                        closureOwnerRule
                          ? id !== undefined ||
                            ncStatus !== "VERIFIED" ||
                            (closureOwner === "MCOE" && !isOrgAdmin) ||
                            (closureOwner === "IMSC" && !isMR)
                          : false
                      }
                    />
                    <FormControlLabel
                      value="No"
                      control={<Radio />}
                      label="No"
                      disabled={
                        closureOwnerRule
                          ? id !== undefined ||
                            ncStatus !== "VERIFIED" ||
                            (closureOwner === "MCOE" && !isOrgAdmin) ||
                            (closureOwner === "IMSC" && !isMR)
                          : false
                      }
                    />
                  </RadioGroup>
                </Grid>
              </Grid>
            </Grid>
          </section>
        </div>
      ),
    },
  ];

  // console.log("formData", formData);

  const steps =
    formData.status === "NA"
      ? [`${formData.type} Details`]
      : //   ?
        [
          `${formData.type} Details`,
          "Auditee Section",
          "Auditor Section",
          "Closure",
        ];
  // : formData.type === "OFI"
  // ? [" OFI Details ", "Auditee Section"]
  // : [" OBS Details ", "Auditee Section"];
  const forms = [
    {
      form: (
        <>
          <div className={classes.scroll}>
            {/* {isSectionVisible && ( */}
            {id && (
              <section className={classes.form__section}>
                <Grid
                  container
                  spacing={2}
                  style={{
                    display: "flex",
                    flexDirection: matches ? "row" : "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {/* Audit Name */}
                  <Grid
                    item
                    container
                    xs={matches ? 4 : 12}
                    sm={matches ? 4 : 12}
                    md={matches ? 4 : 12}
                  >
                    <Grid
                      item
                      xs={10}
                      sm={10}
                      md={10}
                      className={classes.formTextPadding}
                    >
                      <strong>
                        <span className={classes.label}>Audit Name:</span>
                      </strong>
                    </Grid>
                    <Grid item xs={10} sm={10} md={10}>
                      <TextField
                        variant="outlined"
                        fullWidth
                        size="small"
                        value={formData.auditName as string}
                        disabled
                        className={classes.textField}
                      />
                    </Grid>
                    {/* </div> */}
                  </Grid>
                  {/* <Grid item xs={12} sm={12} md={1}></Grid> */}

                  {/*  Audit Date & Time* */}
                  <Grid
                    item
                    container
                    xs={matches ? 4 : 12}
                    sm={matches ? 4 : 12}
                    md={matches ? 4 : 12}
                  >
                    <Grid
                      item
                      xs={10}
                      sm={10}
                      md={10}
                      className={classes.formTextPadding}
                    >
                      <strong>
                        <span className={classes.label}>
                          Audit Date & Time:
                        </span>
                      </strong>
                    </Grid>
                    <Grid item xs={10} sm={10} md={10}>
                      <TextField
                        variant="outlined"
                        fullWidth
                        size="small"
                        value={formData.auditDateTime}
                        disabled
                        className={classes.textField}
                      />
                    </Grid>
                    {/* </div> */}
                  </Grid>

                  {/* NC Date* */}
                  <Grid
                    item
                    container
                    xs={matches ? 4 : 12}
                    sm={matches ? 4 : 12}
                    md={matches ? 4 : 12}
                  >
                    <Grid
                      item
                      xs={10}
                      sm={10}
                      md={10}
                      className={classes.formTextPadding}
                    >
                      <strong>
                        <span className={classes.label}>Findings Date:</span>
                      </strong>
                    </Grid>
                    <Grid item xs={10} sm={10} md={10}>
                      <TextField
                        variant="outlined"
                        fullWidth
                        size="small"
                        value={formData.ncDate}
                        disabled
                        className={classes.textField}
                      />
                    </Grid>
                    {/* </div> */}
                  </Grid>

                  {/* Audit Type* */}
                  <Grid
                    item
                    container
                    xs={matches ? 4 : 12}
                    sm={matches ? 4 : 12}
                    md={matches ? 4 : 12}
                  >
                    {/*   */}
                    <Grid
                      item
                      xs={10}
                      sm={10}
                      md={10}
                      className={classes.formTextPadding}
                    >
                      <strong>
                        <span className={classes.label}>Audit Type:</span>
                      </strong>
                    </Grid>
                    <Grid item xs={10} sm={10} md={10}>
                      <TextField
                        variant="outlined"
                        fullWidth
                        size="small"
                        value={formData.auditType}
                        disabled
                        className={classes.textField}
                      />
                    </Grid>
                    {/* </div> */}
                  </Grid>
                  {/* <Grid item xs={12} sm={12} md={1}></Grid> */}

                  {/* Audit No.* */}
                  <Grid
                    item
                    container
                    xs={matches ? 4 : 12}
                    sm={matches ? 4 : 12}
                    md={matches ? 4 : 12}
                  >
                    <Grid
                      item
                      xs={10}
                      sm={10}
                      md={10}
                      className={classes.formTextPadding}
                    >
                      <strong>
                        <span className={classes.label}>Audit No:</span>
                      </strong>
                    </Grid>
                    <Grid item xs={10} sm={10} md={10}>
                      <TextField
                        variant="outlined"
                        fullWidth
                        size="small"
                        value={formData.auditNumber}
                        disabled
                        className={classes.textField}
                      />
                    </Grid>
                  </Grid>

                  {/* NC Number* */}
                  {/* <Grid item container xs={4} sm={4} md={4}>
              <Grid
                item
                xs={10}
                sm={10}
                md={10}
                className={classes.formTextPadding}
              >
                <strong>
                  <span className={classes.asterisk}>*</span>{" "}
                </strong>
                <strong>
                  {" "}
                  <span className={classes.label}>NC Number:</span>
                </strong>
              </Grid>
              <Grid item xs={10} sm={10} md={10}>
                <TextField
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={formData.ncNumber}
                  disabled
                />
              </Grid>
            </Grid> */}

                  {/* Auditee(s)* */}
                  <Grid
                    item
                    container
                    xs={matches ? 4 : 12}
                    sm={matches ? 4 : 12}
                    md={matches ? 4 : 12}
                  >
                    <Grid
                      item
                      xs={10}
                      sm={10}
                      md={10}
                      className={classes.formTextPadding}
                    >
                      <strong>
                        <span className={classes.label}>Auditee(s):</span>
                      </strong>
                    </Grid>
                    <Grid item xs={10} sm={10} md={10}>
                      <AutoComplete
                        suggestionList={[
                          {
                            firstname: "Mridul",
                          },
                        ]}
                        name="Auditee"
                        keyName="auditee"
                        disabled={true}
                        labelKey="email"
                        formData={formData}
                        setFormData={setFormData}
                        getSuggestionList={() => console.log("get suggestions")}
                        defaultValue={formData.auditee}
                      />
                    </Grid>
                  </Grid>

                  {/* Auditor(s)* */}
                  <Grid
                    item
                    container
                    xs={matches ? 4 : 12}
                    sm={matches ? 4 : 12}
                    md={matches ? 4 : 12}
                  >
                    <Grid
                      item
                      xs={10}
                      sm={10}
                      md={10}
                      className={classes.formTextPadding}
                    >
                      <strong>
                        <span className={classes.label}>Auditor(s):</span>
                      </strong>
                    </Grid>
                    <Grid item xs={10} sm={10} md={10}>
                      <AutoComplete
                        suggestionList={[
                          {
                            firstname: "Mridul",
                          },
                        ]}
                        name="Auditors"
                        keyName="auditor"
                        disabled={true}
                        labelKey="email"
                        formData={formData}
                        setFormData={setFormData}
                        getSuggestionList={() => console.log("get suggestions")}
                        defaultValue={formData.auditor}
                      />
                    </Grid>
                  </Grid>

                  {/* Clause Affected* */}
                  <Grid
                    item
                    container
                    xs={matches ? 4 : 12}
                    sm={matches ? 4 : 12}
                    md={matches ? 4 : 12}
                  >
                    <Grid
                      item
                      xs={10}
                      sm={10}
                      md={10}
                      className={classes.formTextPadding}
                    >
                      <strong>
                        <span className={classes.label}>Clause Affected:</span>
                      </strong>
                    </Grid>
                    <Grid item xs={10} sm={10} md={10}>
                      <TextField
                        variant="outlined"
                        fullWidth
                        size="small"
                        value={formData.clauseAffected || ""}
                        disabled
                        className={classes.textField}
                      />
                    </Grid>
                  </Grid>

                  {/* Entity* */}
                  <Grid
                    item
                    container
                    xs={matches ? 4 : 12}
                    sm={matches ? 4 : 12}
                    md={matches ? 4 : 12}
                  >
                    <Grid
                      item
                      xs={10}
                      sm={10}
                      md={10}
                      className={classes.formTextPadding}
                    >
                      <strong>
                        <span className={classes.label}>Entity:</span>
                      </strong>
                    </Grid>
                    <Grid item xs={10} sm={10} md={10}>
                      <TextField
                        variant="outlined"
                        fullWidth
                        size="small"
                        value={formData.entity}
                        disabled
                        className={classes.textField}
                      />
                    </Grid>
                  </Grid>
                  {/* <Grid item xs={12} sm={12} md={1}></Grid> */}

                  {/* Location* */}
                  <Grid
                    item
                    container
                    xs={matches ? 4 : 12}
                    sm={matches ? 4 : 12}
                    md={matches ? 4 : 12}
                  >
                    <Grid
                      item
                      xs={10}
                      sm={10}
                      md={10}
                      className={classes.formTextPadding}
                    >
                      <strong>
                        <span className={classes.label}>Location:</span>
                      </strong>
                    </Grid>
                    <Grid item xs={10} sm={10} md={10}>
                      <TextField
                        variant="outlined"
                        fullWidth
                        size="small"
                        value={formData.location}
                        disabled
                        className={classes.textField}
                      />
                    </Grid>
                  </Grid>

                  {/* <Grid item xs={12} sm={12} md={1}></Grid>

            <Grid item xs={12} sm={12} md={1}></Grid> */}

                  {/* Document/Proof* */}
                  <Grid
                    item
                    container
                    xs={matches ? 4 : 12}
                    sm={matches ? 4 : 12}
                    md={matches ? 4 : 12}
                  >
                    <Grid
                      item
                      xs={10}
                      sm={10}
                      md={10}
                      className={classes.formTextPadding}
                    >
                      <strong>
                        <span className={classes.label}>Document/Proof:</span>
                      </strong>
                    </Grid>
                    <Grid
                      item
                      xs={10}
                      sm={10}
                      md={10}
                      style={{ margin: "auto" }}
                    >
                      {formData?.documentProof !== "" ? (
                        <Typography className={classes.docProof}>
                          {formData?.documentProof}
                        </Typography>
                      ) : (
                        <Typography color="textSecondary" variant="caption">
                          No Document/Proof found!
                        </Typography>
                      )}
                    </Grid>
                  </Grid>

                  <Grid
                    item
                    container
                    xs={matches ? 4 : 12}
                    sm={matches ? 4 : 12}
                    md={matches ? 4 : 12}
                  >
                    <Grid
                      item
                      xs={10}
                      sm={10}
                      md={10}
                      className={classes.formTextPadding}
                    >
                      <strong>
                        <span className={classes.label}>
                          Associated Audit Report:
                        </span>
                      </strong>
                    </Grid>
                    <Grid
                      item
                      xs={10}
                      sm={10}
                      md={10}
                      // style={{ margin: "auto" }}
                    >
                      {/* <a
                style={{ textDecoration: "underline" }}
                onClick={() => {
                  const url = `/audit/auditreport/newaudit/${formData?.auditReportId}`;
                  window.open(url, "_blank");
                }}
              >
                {formData.auditName}
              </a> */}
                      <Link
                        to={`/audit/auditreport/newaudit/${
                          formData?.auditReportId
                        }/${true}`}
                        state={{
                          edit: isOrgAdmin || isMR,
                          id: formData?.auditReportId,
                          read: true,
                        }}
                        style={{ textDecoration: "underline", color: "blue" }}
                        target="_blank" // Add target="_blank" to open in a new tab
                        rel="noopener noreferrer" // Add rel="noopener noreferrer" for security reasons
                        // style={{ color: "black" }}
                      >
                        {formData.auditName ?? "-"}
                      </Link>
                    </Grid>
                  </Grid>

                  {/* NC Details* */}
                  <Grid
                    item
                    container
                    xs={matches ? 12 : 11}
                    sm={matches ? 12 : 11}
                    md={matches ? 12 : 11}
                  >
                    <Grid
                      item
                      xs={10}
                      sm={10}
                      md={10}
                      className={classes.formTextPadding}
                    >
                      <strong>
                        <span className={classes.label}>Findings Details:</span>
                      </strong>
                    </Grid>
                    <Grid
                      item
                      xs={11}
                      sm={11}
                      md={11}
                      style={{ minWidth: "95%" }}
                    >
                      <TextField
                        variant="outlined"
                        fullWidth
                        size="small"
                        multiline
                        minRows={4}
                        value={formData.ncDetails}
                        disabled
                        className={classes.textField}
                      />
                    </Grid>
                  </Grid>
                  {/* <Grid item xs={12} sm={12} md={1}></Grid> */}
                </Grid>
              </section>
            )}
            ,
          </div>
        </>
      ),
    },
    {
      form: (
        <div className={classes.scroll}>
          <section className={classes.form__section1}>
            <div className={classes.button__group}></div>
            <Grid
              container
              spacing={2}
              style={{
                display: "flex",
                flexDirection: matches ? "row" : "column",
              }}
            >
              <Grid
                item
                xs={matches ? 4 : 10}
                sm={matches ? 4 : 10}
                md={matches ? 4 : 10}
              >
                <Grid
                  item
                  xs={10}
                  sm={10}
                  md={10}
                  className={classes.formTextPadding}
                >
                  <strong>
                    <span className={classes.asterisk}>*</span>{" "}
                  </strong>
                  <strong>
                    <span className={classes.label}>
                      Planned Date Of Correction:
                    </span>
                  </strong>
                </Grid>
                <Grid
                  item
                  xs={matches ? 6 : 12}
                  sm={matches ? 6 : 12}
                  md={matches ? 6 : 12}
                >
                  <TextField
                    disabled={
                      closureOwnerRule
                        ? id ||
                          hasAuditeeAccepted ||
                          hasAuditeeRejected ||
                          (!isAuditee && !auditeeData.isDraft) ||
                          isMR ||
                          closedStatus
                        : false
                    }
                    variant="outlined"
                    name="targetDate"
                    type="date"
                    fullWidth
                    size="small"
                    value={auditeeData?.targetDate}
                    onChange={auditeeChangeHandler}
                    className={classes.textField}
                    inputProps={{
                      style: {
                        fontSize: "14px", // Set the desired font size here
                      },

                      min: moment(auditDate).format("YYYY-MM-DD"),
                    }}
                  />
                </Grid>
              </Grid>
              <Grid
                item
                container
                xs={matches ? 12 : 10}
                sm={matches ? 12 : 10}
                md={matches ? 8 : 10}
                spacing={1}
              >
                <Grid
                  item
                  xs={matches ? 10 : 12}
                  sm={matches ? 10 : 12}
                  md={matches ? 10 : 12}
                  className={classes.formTextPadding}
                >
                  <strong>
                    <span className={classes.label}>Planned Correction:</span>
                  </strong>
                </Grid>
                <Grid
                  item
                  xs={matches ? 10 : 12}
                  sm={matches ? 10 : 12}
                  md={matches ? 10 : 12}
                >
                  <TextField
                    disabled={
                      closureOwnerRule
                        ? id ||
                          hasAuditeeAccepted ||
                          hasAuditeeRejected ||
                          (!isAuditee && !auditeeData.isDraft) ||
                          isMR ||
                          closedStatus
                        : false
                    }
                    variant="outlined"
                    name="correction"
                    value={auditeeData?.correction}
                    fullWidth
                    size="small"
                    multiline
                    minRows={2}
                    onChange={auditeeChangeHandler}
                    className={classes.textField}
                  />
                </Grid>
              </Grid>

              {formData.corrective && (
                <Grid
                  item
                  container
                  xs={matches ? 4 : 10}
                  sm={matches ? 4 : 10}
                  md={matches ? 4 : 10}
                >
                  <Grid
                    item
                    xs={matches ? 10 : 12}
                    sm={matches ? 10 : 12}
                    md={matches ? 10 : 12}
                    className={classes.formTextPadding}
                  >
                    <strong>
                      <span className={classes.asterisk}>*</span>{" "}
                    </strong>
                    <strong>
                      {" "}
                      <span className={classes.label}>
                        Planned Date Of Corrective Action:
                      </span>
                    </strong>
                  </Grid>
                  <Grid
                    item
                    xs={matches ? 6 : 12}
                    sm={matches ? 6 : 12}
                    md={matches ? 6 : 12}
                  >
                    <TextField
                      disabled={
                        closureOwnerRule
                          ? id ||
                            hasAuditeeAccepted ||
                            hasAuditeeRejected ||
                            (!isAuditee && !auditeeData.isDraft) ||
                            isMR ||
                            closedStatus
                          : false
                      }
                      style={{ fontSize: "14px" }}
                      variant="outlined"
                      name="date"
                      type="date"
                      fullWidth
                      size="small"
                      value={auditeeData?.date}
                      onChange={auditeeChangeHandler}
                      inputProps={{
                        style: {
                          fontSize: "14px", // Set the desired font size here
                        },
                        min: moment(auditDate).format("YYYY-MM-DD"),
                      }}
                      className={classes.textField}
                    />
                  </Grid>
                </Grid>
              )}
              {formData.corrective ? (
                <Grid
                  item
                  container
                  xs={matches ? 12 : 10}
                  sm={matches ? 12 : 10}
                  md={matches ? 8 : 10}
                  spacing={1}
                >
                  <Grid
                    item
                    xs={matches ? 10 : 12}
                    sm={matches ? 10 : 12}
                    md={matches ? 10 : 12}
                    className={classes.formTextPadding}
                  >
                    <strong>
                      <span className={classes.label}>
                        Planned Corrective Action:
                      </span>
                    </strong>
                  </Grid>
                  <Grid
                    item
                    xs={matches ? 10 : 12}
                    sm={matches ? 10 : 12}
                    md={matches ? 10 : 12}
                  >
                    <TextField
                      disabled={
                        closureOwnerRule
                          ? id ||
                            hasAuditeeAccepted ||
                            hasAuditeeRejected ||
                            (!isAuditee && !auditeeData.isDraft) ||
                            isMR ||
                            closedStatus ||
                            !closureOwnerRule
                          : false
                      }
                      variant="outlined"
                      name="comment"
                      value={auditeeData?.comment}
                      fullWidth
                      size="small"
                      multiline
                      minRows={2}
                      onChange={auditeeChangeHandler}
                      className={classes.textField}
                    />
                  </Grid>
                </Grid>
              ) : (
                ""
              )}
              <Grid
                item
                container
                xs={matches ? 4 : 10}
                sm={matches ? 4 : 10}
                md={matches ? 4 : 10}
              >
                <Grid
                  item
                  xs={matches ? 10 : 12}
                  sm={matches ? 10 : 12}
                  md={matches ? 10 : 12}
                  className={classes.formTextPadding}
                >
                  <strong>
                    <span className={classes.asterisk}>*</span>{" "}
                  </strong>
                  <strong>
                    <span className={classes.label}>
                      Actual Date Of Correction:
                    </span>
                  </strong>
                </Grid>
                <Grid
                  item
                  xs={matches ? 6 : 12}
                  sm={matches ? 6 : 12}
                  md={matches ? 6 : 12}
                >
                  <TextField
                    disabled={
                      closureOwnerRule
                        ? id ||
                          hasAuditeeAccepted ||
                          hasAuditeeRejected ||
                          (!isAuditee && !auditeeData.isDraft) ||
                          isMR ||
                          closedStatus
                        : false
                    }
                    variant="outlined"
                    name="actualTargetDate"
                    type="date"
                    fullWidth
                    size="small"
                    value={auditeeData?.actualTargetDate}
                    onChange={auditeeChangeHandler}
                    inputProps={{
                      style: {
                        fontSize: "14px", // Set the desired font size here
                      },

                      max: moment(new Date()).format("YYYY-MM-DD"),
                    }}
                    className={classes.textField}
                  />
                </Grid>
              </Grid>
              <Grid
                item
                container
                xs={matches ? 12 : 10}
                sm={matches ? 12 : 10}
                md={matches ? 8 : 12}
                spacing={1}
              >
                <Grid
                  item
                  xs={matches ? 10 : 12}
                  sm={matches ? 10 : 12}
                  md={matches ? 10 : 12}
                  className={classes.formTextPadding}
                >
                  <strong>
                    <span className={classes.label}>Actual Correction:</span>
                  </strong>
                </Grid>
                <Grid
                  item
                  xs={matches ? 10 : 12}
                  sm={matches ? 10 : 12}
                  md={matches ? 10 : 12}
                >
                  <TextField
                    disabled={
                      closureOwnerRule
                        ? id ||
                          hasAuditeeAccepted ||
                          hasAuditeeRejected ||
                          (!isAuditee && !auditeeData.isDraft) ||
                          isMR ||
                          closedStatus
                        : false
                    }
                    variant="outlined"
                    name="actualCorrection"
                    value={auditeeData?.actualCorrection}
                    fullWidth
                    size="small"
                    multiline
                    minRows={2}
                    onChange={auditeeChangeHandler}
                    className={classes.textField}
                  />
                </Grid>
              </Grid>

              {formData.corrective && (
                <Grid
                  item
                  container
                  xs={matches ? 4 : 10}
                  sm={matches ? 4 : 10}
                  md={matches ? 4 : 10}
                >
                  <Grid
                    item
                    xs={matches ? 10 : 12}
                    sm={matches ? 10 : 12}
                    md={matches ? 10 : 12}
                    className={classes.formTextPadding}
                  >
                    <strong>
                      <span className={classes.asterisk}>*</span>{" "}
                    </strong>
                    <strong>
                      {" "}
                      <span className={classes.label}>
                        Actual Date Of Corrective Action :
                      </span>
                    </strong>
                  </Grid>
                  <Grid
                    item
                    xs={matches ? 6 : 12}
                    sm={matches ? 6 : 12}
                    md={matches ? 6 : 12}
                  >
                    <TextField
                      disabled={
                        closureOwnerRule
                          ? id ||
                            hasAuditeeAccepted ||
                            hasAuditeeRejected ||
                            (!isAuditee && !auditeeData.isDraft) ||
                            isMR ||
                            closedStatus
                          : false
                      }
                      style={{ fontSize: "14px" }}
                      variant="outlined"
                      name="actualDate"
                      type="date"
                      fullWidth
                      size="small"
                      value={auditeeData?.actualDate}
                      onChange={auditeeChangeHandler}
                      inputProps={{
                        style: {
                          fontSize: "14px", // Set the desired font size here
                        },
                        max: moment(new Date()).format("YYYY-MM-DD"),
                      }}
                      className={classes.textField}
                    />
                  </Grid>
                </Grid>
              )}
              {formData.corrective ? (
                <Grid
                  item
                  container
                  xs={matches ? 12 : 10}
                  sm={matches ? 12 : 10}
                  md={matches ? 8 : 10}
                  spacing={1}
                >
                  <Grid
                    item
                    xs={matches ? 10 : 12}
                    sm={matches ? 10 : 12}
                    md={matches ? 10 : 12}
                    className={classes.formTextPadding}
                  >
                    <strong>
                      <span className={classes.label}>
                        Actual Corrective Action:
                      </span>
                    </strong>
                  </Grid>
                  <Grid
                    item
                    xs={matches ? 10 : 12}
                    sm={matches ? 10 : 12}
                    md={matches ? 10 : 12}
                  >
                    <TextField
                      disabled={
                        closureOwnerRule
                          ? id ||
                            hasAuditeeAccepted ||
                            hasAuditeeRejected ||
                            (!isAuditee && !auditeeData.isDraft) ||
                            isMR ||
                            closedStatus ||
                            !closureOwnerRule
                          : false
                      }
                      variant="outlined"
                      name="actualComment"
                      value={auditeeData?.actualComment}
                      fullWidth
                      size="small"
                      multiline
                      minRows={2}
                      onChange={auditeeChangeHandler}
                      className={classes.textField}
                    />
                  </Grid>
                </Grid>
              ) : (
                ""
              )}
              {/* <Grid item xs={12} sm={12} md={1}></Grid>
              <Grid item container xs={4} sm={4} md={4}></Grid> */}
            </Grid>
          </section>
          <section className={classes.form__section1}>
            <Grid container>
              <Grid
                item
                container
                xs={matches ? 12 : 10}
                sm={matches ? 12 : 10}
                md={matches ? 4 : 10}
              >
                <Grid
                  item
                  xs={matches ? 10 : 10}
                  sm={matches ? 10 : 10}
                  md={matches ? 10 : 10}
                  className={classes.formTextPadding}
                >
                  <strong>Evidence Attachment:</strong>
                </Grid>
                <Grid
                  item
                  xs={matches ? 10 : 12}
                  sm={matches ? 10 : 12}
                  md={matches ? 10 : 12}
                >
                  <Form.Item name="uploader" style={{ display: "none" }}>
                    <Input
                      disabled={
                        id ||
                        hasAuditeeAccepted ||
                        hasAuditeeRejected ||
                        (!isAuditee && !auditeeData.isDraft) ||
                        isMR ||
                        closedStatus
                      }
                    />
                  </Form.Item>
                  <Dragger name="files" {...uploadProps}>
                    <div style={{ textAlign: "center" }}>
                      <MdInbox style={{ fontSize: "36px" }} />
                      <p className="ant-upload-text">
                        Click or drag files here to upload
                      </p>
                    </div>
                  </Dragger>
                  {!!auditeeData?.proofDocument &&
                    !!auditeeData?.proofDocument?.length && (
                      <div>
                        <Typography
                          variant="body2"
                          style={{ marginTop: "16px", marginBottom: "8px" }}
                        >
                          Uploaded Files:
                        </Typography>
                        {auditeeData?.proofDocument?.map(
                          (item: any, index: number) => (
                            <div
                              key={index}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                marginBottom: "8px",
                              }}
                            >
                              <Typography
                                className={classes.filename}
                                onClick={() => handleLinkClick(item)}
                              >
                                {item?.name}
                              </Typography>
                            </div>
                          )
                        )}
                      </div>
                    )}
                </Grid>
              </Grid>
              <Grid
                item
                container
                xs={matches ? 12 : 10}
                sm={matches ? 12 : 10}
                md={matches ? 8 : 10}
                style={{}}
              >
                <Typography
                  // align="left"
                  // variant="h6"
                  // gutterBottom
                  style={{
                    // paddingBottom: "20px",

                    fontSize: "15px",
                    fontWeight: "bold",
                    color: "#003566",
                  }}
                >
                  <strong>
                    <span className={classes.asterisk}>*</span>{" "}
                  </strong>
                  <strong>
                    {" "}
                    <span className={classes.label}>Root Cause Analysis:</span>
                  </strong>
                </Typography>
                <Grid
                  item
                  xs={matches ? 10 : 12}
                  sm={matches ? 10 : 12}
                  md={matches ? 10 : 12}
                >
                  <TextField
                    disabled={
                      id ||
                      hasAuditeeAccepted ||
                      hasAuditeeRejected ||
                      (!isAuditee && !auditeeData.isDraft) ||
                      isMR ||
                      closedStatus
                    }
                    variant="outlined"
                    name="whyAnalysis"
                    value={auditeeData?.whyAnalysis}
                    fullWidth
                    size="small"
                    multiline
                    minRows={2}
                    onChange={auditeeChangeHandler}
                    className={classes.textField}
                  />
                </Grid>
              </Grid>
            </Grid>
          </section>
        </div>
      ),
    },
    {
      form: (
        <div>
          <section className={classes.form__section}>
            <Dialog
              fullScreen={fullScreen}
              open={dialogOpen}
              onClose={handleDialogClose}
              aria-labelledby="responsive-dialog-title"
            >
              <DialogContent>
                <DialogContentText>
                  Would you like to create an observation?
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button
                  autoFocus
                  onClick={() => {
                    cancelNc();
                    handleDialogClose();
                  }}
                  color="primary"
                >
                  No
                </Button>
                <Button
                  onClick={() => {
                    convertToObservation();
                    handleDialogClose();
                  }}
                  color="primary"
                  autoFocus
                >
                  Yes
                </Button>
              </DialogActions>
            </Dialog>
            <Grid container spacing={2}>
              {/* Review Date */}

              <Grid
                item
                container
                xs={matches ? 8 : 10}
                sm={matches ? 8 : 10}
                md={matches ? 8 : 10}
              >
                <Grid
                  item
                  xs={matches ? 10 : 12}
                  sm={matches ? 10 : 12}
                  md={matches ? 10 : 12}
                  className={classes.formTextPadding}
                >
                  <strong>
                    <span className={classes.asterisk}>*</span>{" "}
                  </strong>
                  <strong>
                    {" "}
                    <span className={classes.label}>
                      Verification/Effectiveness Review Comment:
                    </span>
                  </strong>
                </Grid>
                <Grid
                  item
                  xs={matches ? 10 : 12}
                  sm={matches ? 10 : 12}
                  md={matches ? 10 : 12}
                >
                  <TextField
                    disabled={
                      id || hasAuditorAccepted || !isAuditor || closedStatus
                    }
                    variant="outlined"
                    value={auditorData?.verficationAction}
                    fullWidth
                    size="small"
                    multiline
                    minRows={2}
                    name="verficationAction"
                    onChange={auditorChangeHandler}
                    className={classes.textField}
                  />
                </Grid>
              </Grid>
              <Grid
                item
                container
                xs={matches ? 12 : 10}
                sm={matches ? 12 : 10}
                md={matches ? 4 : 10}
                spacing={1}
              >
                <Grid
                  item
                  xs={matches ? 10 : 12}
                  sm={matches ? 10 : 12}
                  md={matches ? 10 : 12}
                  className={classes.formTextPadding}
                >
                  <strong>
                    <span className={classes.asterisk}>*</span>{" "}
                  </strong>
                  <strong>
                    {" "}
                    <span className={classes.label}>Verification Date:</span>
                  </strong>
                </Grid>
                <Grid
                  item
                  xs={matches ? 6 : 12}
                  sm={matches ? 6 : 12}
                  md={matches ? 6 : 12}
                >
                  <TextField
                    type="date"
                    disabled={
                      id || hasAuditorAccepted || !isAuditor || closedStatus
                    }
                    name="verficationDate"
                    variant="outlined"
                    fullWidth
                    size="small"
                    value={auditorData?.verficationDate}
                    inputProps={{
                      style: {
                        fontSize: "14px", // Set the desired font size here
                      },

                      max: moment(new Date()).format("YYYY-MM-DD"),
                    }}
                    onChange={auditorChangeHandler}
                    className={classes.textField}
                  />
                </Grid>
              </Grid>
              {/* <Grid item xs={12} sm={12} md={1}></Grid> */}

              {/* Comments/Action taken* */}
              {/* <Grid item container xs={8} sm={8} md={8}>
                <Grid
                  item
                  xs={10}
                  sm={10}
                  md={10}
                  className={classes.formTextPadding}
                >
                  <strong>
                    <span className={classes.label}>
                      Effectiveness Review Comments:
                    </span>
                  </strong>
                </Grid>
                <Grid item xs={10} sm={10} md={10}>
                  <TextField
                    disabled={hasAuditorAccepted || !isAuditor || closedStatus}
                    variant="outlined"
                    value={auditorData?.comment}
                    fullWidth
                    size="small"
                    multiline
                    minRows={2}
                    name="comment"
                    onChange={auditorChangeHandler}
                  />
                </Grid>
              </Grid>

              <Grid item container xs={12} sm={12} md={4} spacing={1}>
                <Grid
                  item
                  xs={10}
                  sm={10}
                  md={10}
                  className={classes.formTextPadding}
                >
                  <strong>
                    {" "}
                    <span className={classes.label}>
                      Effectiveness Review Date:
                    </span>
                  </strong>
                </Grid>
                <Grid item xs={6} sm={6} md={6}>
                  <TextField
                    type="date"
                    disabled={hasAuditorAccepted || !isAuditor || closedStatus}
                    name="date"
                    variant="outlined"
                    fullWidth
                    size="small"
                    value={auditorData?.date}
                    inputProps={{
                      style: {
                        fontSize: "14px", // Set the desired font size here
                      },

                      min: moment(correctiveActionDate).format("YYYY-MM-DD"),
                    }}
                    onChange={auditorChangeHandler}
                  />
                </Grid>
              </Grid> */}
            </Grid>
          </section>
        </div>
      ),
    },
    {
      form: (
        <div>
          <section className={classes.form__section}>
            <Grid container spacing={2}>
              {/* Review Date */}
              <Grid
                item
                container
                xs={matches ? 8 : 10}
                sm={matches ? 8 : 10}
                md={matches ? 8 : 10}
              >
                <Grid
                  item
                  xs={matches ? 10 : 12}
                  sm={matches ? 10 : 12}
                  md={matches ? 10 : 12}
                  className={classes.formTextPadding}
                >
                  <strong>
                    <span className={classes.asterisk}>*</span>{" "}
                  </strong>
                  <strong>
                    {" "}
                    <span className={classes.label}>Closure Remarks:</span>
                  </strong>
                </Grid>
                <Grid
                  item
                  xs={matches ? 10 : 12}
                  sm={matches ? 10 : 12}
                  md={matches ? 10 : 12}
                >
                  <TextField
                    disabled={
                      id !== undefined ||
                      ncStatus !== "VERIFIED" ||
                      (closureOwner === "MCOE" && !isOrgAdmin) ||
                      (closureOwner === "IMSC" && !isMR)
                    }
                    variant="outlined"
                    value={closureData?.closureRemarks}
                    fullWidth
                    size="small"
                    multiline
                    minRows={2}
                    name="closureRemarks"
                    onChange={closureChangeHandler}
                    className={classes.textField}
                  />
                </Grid>
              </Grid>
              <Grid
                item
                container
                xs={matches ? 12 : 10}
                sm={matches ? 12 : 10}
                md={matches ? 4 : 10}
                spacing={1}
              >
                <Grid
                  item
                  xs={matches ? 10 : 12}
                  sm={matches ? 10 : 12}
                  md={matches ? 10 : 12}
                  className={classes.formTextPadding}
                >
                  <strong>
                    <span className={classes.asterisk}>*</span>{" "}
                  </strong>
                  <strong>
                    {" "}
                    <span className={classes.label}>Date of Closure:</span>
                  </strong>
                </Grid>
                <Grid
                  item
                  xs={matches ? 6 : 12}
                  sm={matches ? 6 : 12}
                  md={matches ? 6 : 12}
                >
                  <TextField
                    // type="date"
                    disabled={
                      id !== undefined ||
                      ncStatus !== "VERIFIED" ||
                      (closureOwner === "MCOE" && !isOrgAdmin) ||
                      (closureOwner === "IMSC" && !isMR)
                    }
                    name="closureDate"
                    variant="outlined"
                    fullWidth
                    size="small"
                    value={closureData?.closureDate}
                    className={classes.textField}
                    // inputProps={{
                    //   style: {
                    //     fontSize: "14px", // Set the desired font size here
                    //   },

                    //   min: moment(correctiveActionDate).format("YYYY-MM-DD"),
                    // }}
                    // onChange={closureChangeHandler}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item container xs={12} sm={12} md={4} spacing={1}>
                <Grid
                  item
                  xs={10}
                  sm={10}
                  md={10}
                  className={classes.formTextPadding}
                >
                  <strong>
                    <span className={classes.label}>
                      Follow up Audit Required:
                    </span>
                  </strong>
                </Grid>
                <Grid item xs={6} sm={6} md={6}>
                  <RadioGroup
                    aria-label="auditRequired"
                    name="auditRequired"
                    value={closureData?.auditRequired}
                    onChange={closureChangeHandler}
                  >
                    <FormControlLabel
                      value="Yes"
                      control={<Radio />}
                      label="Yes"
                      disabled={
                        closureOwnerRule
                          ? id !== undefined ||
                            ncStatus !== "VERIFIED" ||
                            (closureOwner === "MCOE" && !isOrgAdmin) ||
                            (closureOwner === "IMSC" && !isMR)
                          : false
                      }
                    />
                    <FormControlLabel
                      value="No"
                      control={<Radio />}
                      label="No"
                      disabled={
                        closureOwnerRule
                          ? id !== undefined ||
                            ncStatus !== "VERIFIED" ||
                            (closureOwner === "MCOE" && !isOrgAdmin) ||
                            (closureOwner === "IMSC" && !isMR)
                          : false
                      }
                    />
                  </RadioGroup>
                </Grid>
              </Grid>
            </Grid>
          </section>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div>
        <div
          style={{
            position: "fixed",
            top: "30%",
            right: "0.1%",
            paddingRight: "0.3rem",
            minHeight: "30%",
            backgroundColor: "transparent",
            zIndex: 1000,
          }}
        >
          {/* <Fab
            variant="extended"
            size="small"
            style={{
              position: "absolute",
              top: "20%",
              left: "-3rem",
              backgroundColor: "#0E497A",
              borderTopRightRadius: "0",
              borderBottomRightRadius: "0",
            }}
            onClick={openMessageModal}
          >
            <MessageIcon style={{ marginRight: "8px" }} />
          </Fab> */}
          <Fab
            size="small"
            variant="extended"
            style={{
              position: "absolute",
              top: "38%",
              left: "-3rem",
              backgroundColor: "#0E497A",
              borderTopRightRadius: "0",
              borderBottomRightRadius: "0",
            }}
            onClick={openWorkflowModal}
          >
            <WorkFlowIcon style={{ marginRight: "8px" }} />
          </Fab>
        </div>

        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "flex-end",
            marginTop: "30vh", // Adjust the value as needed
            marginRight: "1vh",
          }}
          open={workflowModalOpen}
          onClose={closeWorkflowModal}
        >
          <>
            <div>
              <Accordion defaultExpanded>
                <AccordionSummary
                  expandIcon={<MdExpandMore style={{ color: "white" }} />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  Workflow History
                </AccordionSummary>
                <AccordionDetails>
                  {formData?.workflowHistory.length > 0 ? (
                    <CustomTable
                      header={headers}
                      fields={fields}
                      data={formData.workflowHistory}
                      isAction={false}
                      actions={[]}
                    />
                  ) : (
                    <Typography
                      variant="body2"
                      gutterBottom
                      color="textSecondary"
                    >
                      No workflow history found
                    </Typography>
                  )}
                </AccordionDetails>
              </Accordion>
            </div>
          </>
        </Modal>
      </div>

      <div>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12} md={12}>
            {!id && !modalId && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  marginBottom: matches ? "0px" : "5px",
                }}
              >
                <Button
                  data-testid="single-form-wrapper-button"
                  onClick={() => {
                    navigate("/audit", {
                      state: { redirectToTab: "List of Findings" },
                    });
                  }}
                  style={{
                    backgroundColor: "transparent",
                    border: "transparent",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <MdChevronLeft fontSize="small" />
                  Back
                </Button>
              </div>
            )}

            {modalId && (
              <div className={classes.button__group}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    style={{
                      padding: "10px 10px 0 3rem",
                      color: "#003566",
                      // borderRight: "1.5px solid #000",
                    }}
                  >
                    <strong>{`${formData.type} Details`}</strong>
                  </Typography>

                  <div
                    style={{
                      color: "#003566",
                      fontSize: "14px",
                      fontWeight: "bold",
                      paddingLeft: "0.5rem", // Adjust the padding to your needs
                      borderLeft: "1.5px solid #000", // Add a right border instead of using Divider
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {/* NC No: &nbsp; */}
                    <span
                      className={classes.statusText}
                      style={{ color: "#999898", fontWeight: "normal" }}
                    >
                      {formData?.ncNumber}
                    </span>
                  </div>
                </div>
                <Box
                  display="flex"
                  justifyContent="flex-end"
                  alignItems="center"
                  gridGap={10}
                >
                  <Typography className={classes.statusContainer}>
                    {mobView ? (
                      <>
                        {ncStatus === "OPEN" ? (
                          <div
                            style={{
                              width: "15px",
                              height: "15px",
                              borderRadius: "50%",
                              backgroundColor: "#ffba00",
                              margin: "1px",
                            }}
                          ></div>
                        ) : ncStatus === "CLOSED" ? (
                          <div
                            style={{
                              width: "15px",
                              height: "15px",
                              borderRadius: "50%",
                              backgroundColor: "#D62DB1",
                              margin: "1px",
                            }}
                          ></div>
                        ) : ncStatus === "IN_PROGRESS" ? (
                          <div
                            style={{
                              width: "15px",
                              height: "15px",
                              borderRadius: "50%",
                              backgroundColor: "yellow",
                              margin: "1px",
                            }}
                          ></div>
                        ) : ncStatus === "CANCELLED" ? (
                          <div
                            style={{
                              width: "15px",
                              height: "15px",
                              borderRadius: "50%",
                              backgroundColor: "grey",
                              margin: "1px",
                            }}
                          ></div>
                        ) : (
                          ""
                        )}
                      </>
                    ) : (
                      <div
                        style={{
                          display: "flex", // Adding flex display to the container to enable horizontal layout
                          alignItems: "center",
                          paddingLeft: "0.5rem", // Align items vertically in the center

                          color: "#003566",
                          fontSize: "14px",
                          fontWeight: "bold",
                        }}
                      >
                        {/* Status: &nbsp; */}
                        <Tag
                          style={{
                            backgroundColor:
                              ncStatus === "OPEN"
                                ? "#ffba00"
                                : ncStatus === "CLOSED"
                                ? "#D62DB1"
                                : ncStatus === "AUDITORREVIEW"
                                ? "#003566"
                                : ncStatus === "ACCEPTED"
                                ? "#7cbf3f"
                                : ncStatus === "REJECTED"
                                ? "#c75c71"
                                : ncStatus === "VERIFIED"
                                ? "#77DD77"
                                : "#7cbf3f", // Default color if none of the conditions match
                            color: "white",
                            fontWeight: "normal",
                            width: "89px",
                            padding: "5px 0px",
                            alignItems: "center",
                            borderRadius: "10px",
                            textAlign: "center",
                            justifyContent: "center",
                          }}
                        >
                          {ncStatus}
                        </Tag>
                      </div>
                    )}
                  </Typography>
                  {modalId && buttonOptions.includes("Save") && (
                    // <div
                    //   className={classes.button__group}
                    //   style={{ paddingRight: "2.5rem" }}
                    // >
                    <Button
                      style={{ color: "#967DAB", backgroundColor: "#E8F3F9" }}
                      onClick={() => {
                        handleSubmit("Save");
                      }}
                    >
                      Save
                    </Button>
                    // </div>
                  )}
                  {modalId && (
                    <div
                      className={classes.button__group}
                      style={{ paddingRight: "2.5rem" }}
                    >
                      <CustomButtonGroup
                        options={buttonOptions.filter(
                          (value: any) => value !== "Save"
                        )}
                        handleSubmit={handleSubmit}
                        disable={formData.auditorSection === false && isAuditor}
                        disableBtnFor={
                          ncStatus === "CLOSED"
                            ? [
                                "Accept",
                                "Close NC",
                                "Reject",
                                "Save as draft",
                                "Accept NC",
                                "Reject NC",
                              ]
                            : roleStatus
                            ? []
                            : [
                                "Accept",
                                "Close NC",
                                "Reject",
                                "Save as draft",
                                "Accept NC",
                                "Reject NC",
                              ]
                        }
                      />
                    </div>
                  )}
                  <Dialog
                    fullScreen={fullScreen}
                    open={modalShow}
                    onClose={handleDialogClose}
                    aria-labelledby="responsive-dialog-title"
                  >
                    <DialogContent>
                      <DialogContentText>
                        Do you want to submit without evidence attachment?
                      </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                      <Button
                        autoFocus
                        onClick={() => {
                          setModalShow(false);
                        }}
                        color="primary"
                      >
                        No
                      </Button>
                      <Button
                        onClick={() => {
                          handleSubmit("Submit to Auditor", true);
                        }}
                        color="primary"
                        autoFocus
                      >
                        Yes
                      </Button>
                    </DialogActions>
                  </Dialog>

                  <Dialog
                    fullScreen={fullScreen}
                    open={modalComment}
                    onClose={handleDialogClose}
                    aria-labelledby="responsive-dialog-title"
                  >
                    <DialogContent>
                      <DialogContentText>
                        Enter Reason to Send Back To Auditee
                      </DialogContentText>
                      {/* <TextField
                        autoFocus
                        margin="dense"
                        id="comment"
                        label=""
                        type="text"
                        fullWidth
                        
                        value={formData.sendBackComment}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            sendBackComment: e.target.value,
                          })
                        }
                      /> */}
                      <TextField
                        autoFocus
                        margin="dense"
                        id="comment"
                        label="Comment"
                        type="text"
                        fullWidth
                        multiline
                        variant="outlined"
                        rows={4}
                        value={formData.sendBackComment}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            sendBackComment: e.target.value,
                          })
                        }
                      />
                    </DialogContent>
                    <DialogActions>
                      <Button
                        onClick={() => {
                          setModalComment(false);
                        }}
                        color="primary"
                      >
                        No
                      </Button>
                      {formData.sendBackComment !== "" &&
                        formData.sendBackComment !== undefined && (
                          <Button
                            onClick={() => {
                              handleSubmit("Send Back to Auditee", true);
                            }}
                            color="primary"
                          >
                            Yes
                          </Button>
                        )}
                    </DialogActions>
                  </Dialog>
                </Box>
              </div>
            )}
            {/* <div style={{ padding: "0 40px" }}>
              <Divider style={{ marginBottom: 0 }} />
            </div> */}
            {/* List of Findings form */}
            {/* <div
              style={{
                backgroundColor: "#EFEFEF",
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-end",
                alignItems: "center",
                margin: "2px 40px",
              }}
            >
              <button
                onClick={toggleSection}
                style={{
                  backgroundColor: "transparent",
                  border: "transparent",
                  display: "flex", // Add display flex to the button
                  alignItems: "center", // Align items vertically
                }}
              >
                <span
                  style={{
                    marginRight: "7px",
                  }}
                >
                  {isSectionVisible ? "Hide Details" : "Show Details"}
                </span>
                <ExpandIcon
                  className={classes.docNavIconStyle}
                  style={{
                    width: "21px",
                    height: "21px",
                  }}
                />
              </button>
            </div> */}

            <div className={classes.scroll}>
              {/* {isSectionVisible && ( */}
              {!id && !modalId && (
                <section className={classes.form__section}>
                  <Grid container spacing={2}>
                    {/* Audit Name */}
                    <Grid item container xs={4} sm={4} md={4}>
                      <Grid
                        item
                        xs={10}
                        sm={10}
                        md={10}
                        className={classes.formTextPadding}
                      >
                        <strong>
                          <span className={classes.label}>Audit Name:</span>
                        </strong>
                      </Grid>
                      <Grid item xs={10} sm={10} md={10}>
                        <TextField
                          variant="outlined"
                          fullWidth
                          size="small"
                          value={formData.auditName as string}
                          disabled
                        />
                      </Grid>
                      {/* </div> */}
                    </Grid>
                    {/* <Grid item xs={12} sm={12} md={1}></Grid> */}

                    {/*  Audit Date & Time* */}
                    <Grid item container xs={4} sm={4} md={4}>
                      <Grid
                        item
                        xs={10}
                        sm={10}
                        md={10}
                        className={classes.formTextPadding}
                      >
                        <strong>
                          <span className={classes.label}>
                            Audit Date & Time:
                          </span>
                        </strong>
                      </Grid>
                      <Grid item xs={10} sm={10} md={10}>
                        <TextField
                          variant="outlined"
                          fullWidth
                          size="small"
                          value={formData.auditDateTime}
                          disabled
                        />
                      </Grid>
                      {/* </div> */}
                    </Grid>

                    {/* NC Date* */}
                    <Grid item container xs={4} sm={4} md={4}>
                      <Grid
                        item
                        xs={10}
                        sm={10}
                        md={10}
                        className={classes.formTextPadding}
                      >
                        <strong>
                          <span className={classes.label}>NC Date:</span>
                        </strong>
                      </Grid>
                      <Grid item xs={10} sm={10} md={10}>
                        <TextField
                          variant="outlined"
                          fullWidth
                          size="small"
                          value={formData.ncDate}
                          disabled
                        />
                      </Grid>
                      {/* </div> */}
                    </Grid>

                    {/* Audit Type* */}
                    <Grid item container xs={4} sm={4} md={4}>
                      {/*   */}
                      <Grid
                        item
                        xs={10}
                        sm={10}
                        md={10}
                        className={classes.formTextPadding}
                      >
                        <strong>
                          <span className={classes.label}>Audit Type:</span>
                        </strong>
                      </Grid>
                      <Grid item xs={10} sm={10} md={10}>
                        <TextField
                          variant="outlined"
                          fullWidth
                          size="small"
                          value={formData.auditType}
                          disabled
                        />
                      </Grid>
                      {/* </div> */}
                    </Grid>
                    {/* <Grid item xs={12} sm={12} md={1}></Grid> */}

                    {/* Audit No.* */}
                    <Grid item container xs={4} sm={4} md={4}>
                      <Grid
                        item
                        xs={10}
                        sm={10}
                        md={10}
                        className={classes.formTextPadding}
                      >
                        <strong>
                          <span className={classes.label}>Audit No:</span>
                        </strong>
                      </Grid>
                      <Grid item xs={10} sm={10} md={10}>
                        <TextField
                          variant="outlined"
                          fullWidth
                          size="small"
                          value={formData.auditNumber}
                          disabled
                        />
                      </Grid>
                    </Grid>

                    {/* NC Number* */}
                    {/* <Grid item container xs={4} sm={4} md={4}>
                    <Grid
                      item
                      xs={10}
                      sm={10}
                      md={10}
                      className={classes.formTextPadding}
                    >
                      <strong>
                        <span className={classes.asterisk}>*</span>{" "}
                      </strong>
                      <strong>
                        {" "}
                        <span className={classes.label}>NC Number:</span>
                      </strong>
                    </Grid>
                    <Grid item xs={10} sm={10} md={10}>
                      <TextField
                        variant="outlined"
                        fullWidth
                        size="small"
                        value={formData.ncNumber}
                        disabled
                      />
                    </Grid>
                  </Grid> */}

                    {/* Auditee(s)* */}
                    <Grid item container xs={4} sm={4} md={4}>
                      <Grid
                        item
                        xs={10}
                        sm={10}
                        md={10}
                        className={classes.formTextPadding}
                      >
                        <strong>
                          <span className={classes.label}>Auditee(s):</span>
                        </strong>
                      </Grid>
                      <Grid item xs={10} sm={10} md={10}>
                        <AutoComplete
                          suggestionList={[
                            {
                              firstname: "Mridul",
                            },
                          ]}
                          name="Auditee"
                          keyName="auditee"
                          disabled={true}
                          labelKey="email"
                          formData={formData}
                          setFormData={setFormData}
                          getSuggestionList={() =>
                            // console.log("get suggestions")
                            {}
                          }
                          defaultValue={formData.auditee}
                        />
                      </Grid>
                    </Grid>

                    {/* Auditor(s)* */}
                    <Grid item container xs={4} sm={4} md={4}>
                      <Grid
                        item
                        xs={10}
                        sm={10}
                        md={10}
                        className={classes.formTextPadding}
                      >
                        <strong>
                          <span className={classes.label}>Auditor(s):</span>
                        </strong>
                      </Grid>
                      <Grid item xs={10} sm={10} md={10}>
                        <AutoComplete
                          suggestionList={[
                            {
                              firstname: "Mridul",
                            },
                          ]}
                          name="Auditors"
                          keyName="auditor"
                          disabled={true}
                          labelKey="email"
                          formData={formData}
                          setFormData={setFormData}
                          getSuggestionList={() =>
                            // console.log("get suggestions")
                            {}
                          }
                          defaultValue={formData.auditor}
                        />
                      </Grid>
                    </Grid>

                    {/* Clause Affected* */}
                    <Grid item container xs={4} sm={4} md={4}>
                      <Grid
                        item
                        xs={10}
                        sm={10}
                        md={10}
                        className={classes.formTextPadding}
                      >
                        <strong>
                          <span className={classes.label}>
                            Clause Affected:
                          </span>
                        </strong>
                      </Grid>
                      <Grid item xs={10} sm={10} md={10}>
                        <TextField
                          variant="outlined"
                          fullWidth
                          size="small"
                          value={formData.clauseAffected || ""}
                          disabled
                        />
                      </Grid>
                    </Grid>

                    {/* Entity* */}
                    <Grid item container xs={4} sm={4} md={4}>
                      <Grid
                        item
                        xs={10}
                        sm={10}
                        md={10}
                        className={classes.formTextPadding}
                      >
                        <strong>
                          <span className={classes.label}>Entity:</span>
                        </strong>
                      </Grid>
                      <Grid item xs={10} sm={10} md={10}>
                        <TextField
                          variant="outlined"
                          fullWidth
                          size="small"
                          value={formData.entity}
                          disabled
                        />
                      </Grid>
                    </Grid>
                    {/* <Grid item xs={12} sm={12} md={1}></Grid> */}

                    {/* Location* */}
                    <Grid item container xs={4} sm={4} md={4}>
                      <Grid
                        item
                        xs={10}
                        sm={10}
                        md={10}
                        className={classes.formTextPadding}
                      >
                        <strong>
                          <span className={classes.label}>Location:</span>
                        </strong>
                      </Grid>
                      <Grid item xs={10} sm={10} md={10}>
                        <TextField
                          variant="outlined"
                          fullWidth
                          size="small"
                          value={formData.location}
                          disabled
                        />
                      </Grid>
                    </Grid>

                    {/* <Grid item xs={12} sm={12} md={1}></Grid>

                  <Grid item xs={12} sm={12} md={1}></Grid> */}

                    {/* Document/Proof* */}
                    <Grid item container xs={4} sm={4} md={4}>
                      <Grid
                        item
                        xs={10}
                        sm={10}
                        md={10}
                        className={classes.formTextPadding}
                      >
                        <strong>
                          <span className={classes.label}>Document/Proof:</span>
                        </strong>
                      </Grid>
                      <Grid
                        item
                        xs={10}
                        sm={10}
                        md={10}
                        style={{ margin: "auto" }}
                      >
                        {formData?.documentProof !== "" ? (
                          <Typography className={classes.docProof}>
                            {formData?.documentProof}
                          </Typography>
                        ) : (
                          <Typography color="textSecondary" variant="caption">
                            No Document/Proof found!
                          </Typography>
                        )}
                      </Grid>
                    </Grid>

                    {/* NC Details* */}
                    <Grid item container xs={12} sm={12} md={12}>
                      <Grid
                        item
                        xs={10}
                        sm={10}
                        md={10}
                        className={classes.formTextPadding}
                      >
                        <strong>
                          <span
                            className={classes.label}
                          >{`${formData.type} Details:`}</span>
                        </strong>
                      </Grid>
                      <Grid
                        item
                        xs={11}
                        sm={11}
                        md={11}
                        style={{ minWidth: "95%" }}
                      >
                        <TextField
                          variant="outlined"
                          fullWidth
                          size="small"
                          multiline
                          minRows={4}
                          value={formData.ncDetails}
                          disabled
                        />
                      </Grid>
                    </Grid>
                    {/* <Grid item xs={12} sm={12} md={1}></Grid> */}
                  </Grid>
                </section>
              )}
              {/* )} */}

              {/* Tab Section */}

              {modalId && (
                <>
                  <div
                    style={{
                      backgroundColor: "#ffffff",
                      padding: "20px",
                      border: "none",
                    }}
                    className={classes.tabsWrapper}
                  >
                    <Tabs
                      activeKey={activeTab}
                      type="card"
                      onChange={handleTabChange} // This will handle the tab changes
                      animated={{ inkBar: true, tabPane: true }}
                      style={{ marginLeft: "10px" }}
                      tabPosition={"left"}
                    >
                      {/* {formData.auditorSection === true?tabs.map((tab) => (
                        <Tabs.TabPane key={tab.key} tab={tab.label}>
                          {tab.children}
                        </Tabs.TabPane>
                      ))} */}

                      {/* {tabs.map((tab) => (
                        <Tabs.TabPane key={tab.key} tab={tab.label}>
                          {tab.children}
                        </Tabs.TabPane>
                      ))} */}
                      {tabs
                        .filter((tab) => tab.display === true) // Filter out the Auditor Section tab if formData.auditorSection is false
                        .map((tab) => (
                          <Tabs.TabPane key={tab.key} tab={tab.label}>
                            {tab.children}
                          </Tabs.TabPane>
                        ))}
                    </Tabs>
                  </div>
                </>
              )}
            </div>
            {/* Tab Section */}
          </Grid>

          {/* Right hand Grid */}
          {/* <Grid
              item
              xs={12}
              sm={12}
              md={4}
              className={classes.right__section}
            >
              <Accordion defaultExpanded>
                <AccordionSummary
                  expandIcon={<MdExpandMore style={{ color: "white" }} />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  MR Comments
                </AccordionSummary>
                <AccordionDetails>
                  <CommentsSection
                    handleCommentSubmit={submitComment}
                    data={formData.mrComments}
                    disableAddComment={!isMR}
                  />
                </AccordionDetails>
              </Accordion>

              <Box py={2}>
                <Typography variant="body2" gutterBottom>
                  Date of Closure
                </Typography>
                <TextField
                  variant="outlined"
                  fullWidth
                  size="small"
                  disabled
                  value={formData.closureDate}
                />
              </Box>

              <Accordion defaultExpanded>
                <AccordionSummary
                  expandIcon={<MdExpandMore style={{ color: "white" }} />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  Workflow History
                </AccordionSummary>
                <AccordionDetails>
                  {formData?.workflowHistory.length > 0 ? (
                    <CustomTable
                      header={headers}
                      fields={fields}
                      data={formData.workflowHistory}
                      isAction={false}
                      actions={[]}
                    />
                  ) : (
                    <Typography
                      variant="body2"
                      gutterBottom
                      color="textSecondary"
                    >
                      No workflow history found
                    </Typography>
                  )}
                </AccordionDetails>
              </Accordion>
            </Grid> */}
        </Grid>

        {/* Drawer section for mobile view */}
        <div className={classes.fab__container}>
          <Fab
            color="primary"
            aria-label="add"
            size="small"
            onClick={onDrawerOpen}
            className={classes.fab}
          >
            <MdMoreVert />
          </Fab>
        </div>
        <Drawer anchor="right" open={open} onClose={onDrawerClose}>
          <Box display="flex" alignItems="center" px={1} pt={2}>
            <IconButton onClick={onDrawerClose}>
              <MdKeyboardArrowLeft />
            </IconButton>
            <Typography variant="h6" color="primary">
              Comments
            </Typography>
          </Box>
          <div className={classes.side__drawer}>
            <Accordion defaultExpanded>
              <AccordionSummary
                expandIcon={<MdExpandMore style={{ color: "white" }} />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                MR Comments
              </AccordionSummary>
              <AccordionDetails>
                <CommentsSection
                  data={formData.mrComments}
                  handleCommentSubmit={submitComment}
                />
              </AccordionDetails>
            </Accordion>

            <Box py={2}>
              <Typography variant="body2" gutterBottom>
                Date of Closure
              </Typography>
              <TextField variant="outlined" fullWidth size="small" disabled />
            </Box>

            <Accordion defaultExpanded>
              <AccordionSummary
                expandIcon={<MdExpandMore style={{ color: "white" }} />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                Workflow History
              </AccordionSummary>
              <AccordionDetails>
                {formData?.workflowHistory.length > 0 ? (
                  <CustomTable
                    header={headers}
                    fields={fields}
                    data={formData.workflowHistory}
                    isAction={false}
                    actions={[]}
                  />
                ) : (
                  <Typography
                    variant="body2"
                    gutterBottom
                    color="textSecondary"
                  >
                    No workflow history found
                  </Typography>
                )}
              </AccordionDetails>
            </Accordion>
          </div>
        </Drawer>
      </div>

      {id && (
        <FormStepper
          steps={steps}
          forms={forms}
          withIcon
          nosubmitButton
          // label="List of Findings"
          activeStep={activeStep}
          setActiveStep={setActiveStep}
          handleNext={() =>
            setActiveStep((prevActiveStep) => prevActiveStep + 1)
          }
          handleBack={() =>
            setActiveStep((prevActiveStep) => prevActiveStep - 1)
          }
          handleFinalSubmit={() => {
            // navigate("/audit", { state: { redirectToTab: "List of Findings" } });
            navigate("/audit", {
              state: { redirectToTab: "List of Findings" },
            });
          }}
          backBtn={
            <BackButton
              parentPageLink={
                location?.state?.redirectLink
                  ? location?.state?.redirectLink
                  : "/audit"
              }
              redirectToTab="List of Findings"
            />
          }
        />
      )}

      {/* {matches ? (
        ""
      ) : (
        <div>
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
                    backgroundColor: selectedValue === 0 ? "#3576BA" : "white",
                    textAlign: "center",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    color: selectedValue === 0 ? "white" : "black",
                  }}
                >
                  {" "}
                  {formData.type} Details
                </div>
              </MenuItem>
              <MenuItem value={1}>
                {" "}
                <div
                  style={{
                    backgroundColor: selectedValue === 1 ? "#3576BA" : "white",
                    textAlign: "center",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    color: selectedValue === 1 ? "white" : "black",
                  }}
                >
                  Auditee Section
                </div>
              </MenuItem>
              <MenuItem value={2}>
                <div
                  style={{
                    backgroundColor: selectedValue === 2 ? "#3576BA" : "white",
                    textAlign: "center",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    color: selectedValue === 2 ? "white" : "black",
                  }}
                >
                  Auditor Section
                </div>
              </MenuItem>
              <MenuItem value={3}>
                <div
                  style={{
                    backgroundColor: selectedValue === 3 ? "#3576BA" : "white",
                    textAlign: "center",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    color: selectedValue === 3 ? "white" : "black",
                  }}
                >
                  Closure
                </div>
              </MenuItem>
            </Select>
          </FormControl>
        </div>
      )} */}
    </div>
  );
}