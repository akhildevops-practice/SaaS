import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { processDocFormData } from "recoil/atom";
// import { List, ListItem, ListItemText } from '@material-ui/core';
import { MdClear } from "react-icons/md";
import { MdCheck } from "react-icons/md";
//material-ui
import {
  Tooltip,
  useMediaQuery,
  CircularProgress,
  Menu,
  MenuItem,
  Popover as MPopover,
  List,
  ListItemText,
  ListItem,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  TextareaAutosize,
  Box,
} from "@material-ui/core";
import { MdPeople } from "react-icons/md";
import { MdHistory } from "react-icons/md";
import { MdChat } from "react-icons/md";
import { MdOutlineExpandMore } from "react-icons/md";
import { MdVisibility } from "react-icons/md";
import { MdCompare } from "react-icons/md";
import { MdCompareArrows } from "react-icons/md";
import IconButton from "@material-ui/core/IconButton";
// import Draggable from 'react-draggable';
import Typography from "@material-ui/core/Typography";
// import IconButton from '@material-ui/core/IconButton';
import { MdExpandMore } from "react-icons/md";
import Collapse from "@material-ui/core/Collapse";
//antd
import {
  Button,
  Drawer,
  Modal,
  Space,
  Spin,
  Tag,
  Table,
  Form,
  Select,
  message,
} from "antd";

//utils
import axios from "apis/axios.global";
import getAppUrl from "utils/getAppUrl";

//components
import HistoryTopDrawer from "components/Document/DocumentTable/DocumentViewDrawer/HistoryTopDrawer";
import CommentsDrawer from "components/Document/DocumentTable/DocumentViewDrawer/CommentsDrawer";
import DocumentViewer from "components/Document/DocumentTable/DocumentViewDrawer/DocumentViewer";
import InfoTopDrawer from "components/Document/DocumentTable/DocumentViewDrawer/InfoTopDrawer";
import DocWorkflowTopDrawer from "components/Document/DocumentTable/DocumentViewDrawer/DocWorkflowTopDrawer";

//assets
import DocInfoIconImageSvg from "assets/documentControl/Info.svg";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import ExpandIconImageSvg from "assets/documentControl/expand1.svg";
import { ReactComponent as StarIcon } from "assets/documentControl/Star.svg";
import { ReactComponent as StarFilledIcon } from "assets/documentControl/Star-Filled.svg";
import { ReactComponent as StarSvg } from "assets/icons/StarSvg.svg";

// import StarSvg from "assets/icons/StarSvg.svg"
import { ReactComponent as CloseIcon } from "assets/documentControl/Close.svg";

import { MdGetApp } from "react-icons/md";
import { ACEOFFIX_URL, API_LINK } from "config";
//styles
import useStyles from "./style";

//thirdparty libs
import { useSnackbar } from "notistack";
import saveAs from "file-saver";
import TextArea from "antd/es/input/TextArea";
import getSessionStorage from "utils/getSessionStorage";
import checkRoles from "utils/checkRoles";
import checkRole from "utils/checkRoles";
import { makeStyles } from "@material-ui/core/styles";
import SelectionPopover from "./SelectionPopover";
import ClauseSelectionModal from "./ClauseSelectionModal";
// Import the functions to control loader
import { ImDownload } from "react-icons/im";

//viewer icons
import { FaRegEdit } from "react-icons/fa";
import { FaRegComments } from "react-icons/fa";
import { MdFileDownload } from "react-icons/md";
import { GiStarShuriken } from "react-icons/gi";
import { IoPeople } from "react-icons/io5";
import { LuHistory } from "react-icons/lu";
import { FaInfoCircle } from "react-icons/fa";
import { FaRegStar } from "react-icons/fa6";
import { FaStar } from "react-icons/fa6";
const DocStateIdentifier: any = {
  "Send for Edit": "SEND_FOR_EDIT",
  "Review Complete": "IN_APPROVAL",
  Approve: "PUBLISHED",
  Publish: "PUBLISHED",
  "Send for Review": "IN_REVIEW",
  "Save as Draft": "DRAFT",
  Amend: "AMMEND",
  "Send for Approval": "IN_APPROVAL",
  Save: "Save",
  Retire: "Retire",
  "Review Retire": "Review Complete",
  "Approve Retire": "Approve Complete",
  discard: "discard",
  Revert: "Revert",
};

type Props = {
  docViewDrawer: any;
  setDocViewDrawer: any;
  toggleDocViewDrawer: any;
  handleFetchDocuments: any;
  activeModules?: any;
};
const useStyles1 = makeStyles({
  iconSize: {
    width: "24px",
    height: "24px",
  },
  app: {
    textAlign: "center",
    marginTop: 20,
    whiteSpace: "pre-wrap",
    wordWrap: "break-word",
    height: "400px", // Fixed height of the modal content area
    overflowY: "auto",
  },
  questionBlock: {
    margin: "20px auto",
    padding: 20,
    border: "1px solid darkslategrey",
    borderRadius: 8,
    maxWidth: 600,
  },
  formControl: {
    marginBottom: 15,
  },
  resultsContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    backgroundColor: "#efefef",
    border: "2px solid #000",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", // Simple shadow for aesthetic depth
    padding: "20px",
    height: "400px", // Fixed height of the modal content area
    overflowY: "auto",
  },
  questionResultBlock: {
    marginBottom: "10px",
  },
  dialogPaper: {
    minHeight: "60vh",
    minWidth: "28vw",
    maxWidth: "22vw",
    // backgroundColor: "#6699CC",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    // padding: "8px",
    borderRadius: "80px",
    // backgroundColor: "#efefef",
    marginBottom: "8px",
    backgroundColor: "white",
    height: "34px",
  },
  sectionContent: {
    padding: "8px",
    marginLeft: "10px",
    color: "black",
  },
  searchIcon: {
    position: "absolute",
    cursor: "pointer",
  },
  tooltip: {
    position: "absolute",
    zIndex: 9999,
  },
  summaryModal: {
    "& .ant-modal-content": {
      padding: "10px !important",
      minHeight: "530px !important",
      height: "100% !important",
    },
    "& .ant-modal-close": {
      top: "2px !important",
      insetInlineEnd: "8px !important",
    },
    "& .ant-modal-body": {
      marginRight: "20px !important",
      padding: "10px !important",
      minHeight: "530px !important",
      height: "100% !important",
    },
  },
  modalContent: {
    wordWrap: "break-word",
    height: "520px",
    overflowY: "auto",
    padding: "16px",
  },
  tableContainer: {
    marginBottom: "24px",
  },
  tableHeader: {
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
  },
  tableCell: {
    padding: "8px",
    borderBottom: "1px solid #ddd",
  },
  closeButton: {
    fontSize: "24px",
    cursor: "pointer",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "510px",
  },
  sourceBox: {
    marginBottom: "16px",
    padding: "12px",
    border: "1px solid #f0f0f0",
    borderRadius: "8px",
    backgroundColor: "#fafafa",
  },
  jobTitleContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

const checkIfLoggedInUserCanReview = (docData: any, userId: any) => {
  if (!docData?.reviewers || !userId) return false;
  return docData.reviewers.includes(userId);
};

const checkIfLoggedInUserCanApprove = (docData: any, userId: any) => {
  if (!docData?.approvers || !userId) return false;
  return docData.approvers.includes(userId);
};

const checkIfLoggedInUserHasCreateAccess = (docData: any, userId: any) => {
  return true;
};
function trimText(text: string) {
  return text?.length ? text?.trim() : "";
}

const DocumentViewDrawer = ({
  docViewDrawer,
  setDocViewDrawer,
  toggleDocViewDrawer,
  handleFetchDocuments,
  activeModules = [],
}: Props) => {
  const isSmallScreen = useMediaQuery("(max-width:600px)");
  const userDetails = getSessionStorage();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  let realmName = getAppUrl();
  const classes = useStyles();
  const classes1 = useStyles1();
  // const { socket } = React.useContext<any>(SocketContext);
  const location = useLocation();
  const [formData, setFormData] = useRecoilState(processDocFormData);
  const [peopleDrawer, setPeopleDrawer] = useState<any>({
    open: false,
    data: {},
  });
  const [editTrue, setEditTrue] = useState(true);
  const [isLoading, setIsLoading] = useState<any>(false);
  const [infoDrawer, setInfoDrawer] = useState<any>({
    open: false,
    data: {},
  });
  const [openModalForComment, setopenModalForComment] = useState(false);
  const matches = useMediaQuery("(min-width:786px)");
  const [historyDrawer, setHistoryDrawer] = useState<any>({
    open: false,
    data: {},
  });
  const [commentDrawer, setCommentDrawer] = useState<any>({
    open: false,
    data: {},
  });
  const [commnetValue, setCommentValue] = useState("");

  const [buttonOptions, setButtonOptions] = useState<any>([]);
  const [renderedFrom, setRenderedFrom] = useState<string>("");
  const [commentsLoader, setCommentsLoader] = useState(false);
  const [comments, setComments] = React.useState<any>([]);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const loggedInUser = JSON.parse(sessionStorage.getItem("userDetails") as any);
  const [anchorEl, setAnchorEl] = useState(null);
  // const [downloadAccess, setDownloadAccess] = useState<boolean>(false);
  const currentUser = getSessionStorage();
  const supportedfiles = ["docx", "doc", "xlsx", "xls", "ppt", "pptx"];
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryText, setSummaryText] = useState<any>("");
  const [progress, setProgress] = useState(0);
  const [botPopover, setBotPopover] = useState<any>(null);

  const [botModal, setBotModal] = useState<any>(false);
  const [questions, setQuestions] = useState<any>([]);
  const [answers, setAnswers] = useState<any>({});
  const [isMcqLoading, setIsMcqLoading] = useState<any>(false);
  const [mcqModal, setMcqModal] = useState<any>(false);
  const [isSubmitted, setIsSubmitted] = useState<any>(false);
  const [resultsModalOpen, setResultsModalOpen] = useState<any>(false);
  const [isResultLoading, setIsResultLoading] = useState<any>(false);

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState<any>(false);

  const [isAiMetaDataModalOpen, setIsAiMetaDataModalOpen] =
    useState<any>(false);
  const [aiMetaData, setAiMetaData] = useState<any>([]);
  const [drawingMetaData, setDrawingMetaData] = useState<any>({});
  const [riskAnalylsis, setRiskAnalysis] = useState<any>("");
  const [riskAnalysisModal, setRiskAnalysisModal] = useState<any>(false);
  const [isRiskAnalysisLoading, setIsRiskAnalysisLoading] =
    useState<any>(false);
  const [docFormat, setDocFormat] = useState<any>("");
  const [riskAnalysisText, setRiskAnalysisText] = useState<any>("");
  const [isMetaDataLoading, setIsMetaDataLoading] = useState<any>(false);
  const [expanded, setExpanded] = React.useState<any>({});
  const [showSearchIcon, setShowSearchIcon] = useState<any>(false);
  const [searchIconPosition, setSearchIconPosition] = useState<any>({
    top: 0,
    left: 0,
  });
  const [selectedText, setSelectedText] = useState<any>("");
  const [showTooltip, setShowTooltip] = useState<any>(false);
  const [tooltipPosition, setTooltipPosition] = useState<any>({
    top: 0,
    left: 0,
  });
  const contentRef = useRef<any>();
  const [anchorElAi, setAnchorElAi] = useState<any>(null);
  const [topic, setTopic] = useState<any>(""); // State to hold the value of the textarea

  const [target, setTarget] = useState<HTMLElement>();
  const [clauseResult, setClauseResult] = useState<any>("");
  const [clauseModal, setClauseModal] = useState<any>(false);

  //for clause selection modal
  const [selectedRows, setSelectedRows] = useState<any>([]);
  const [clauseSelectionModal, setClauseSelectionModal] = useState<any>(false);
  const [clauseTableData, setClauseTableData] = useState<any>([]);
  const [clauseCompareLoading, setClauseCompareLoading] = useState<any>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [categoryOptions, setCategoryOptions] = useState<any>([]);
  const [form] = Form.useForm();

  const [workflowHistoryTableData, setWorkflowHistoryTableData] = useState<any>(
    []
  );
  const [attachmentHistoryTableData, setAttachmentHistoryTableData] = useState<
    any[]
  >([]);

  const ref = useCallback((el: any) => {
    if (el != null) {
      setTarget(el);
    } else {
      setTarget(undefined);
    }
  }, []);

  // useEffect(()=>{
  //   console.log("docViewDrawer", docViewDrawer);

  // },[docViewDrawer])

  // useEffect(()=>{console.log("checkdoc3 aiMetadata statate", aiMetaData);
  // },[aiMetaData])

  // useEffect(()=>{console.log("checkdoc3 summaryText statate", summaryText);
  // },[summaryText])

  useEffect(() => {
    // showLoader(); // Show the loader when the component mounts
    // setTimeout(() => {
    //   hideLoader(); // Hide the loader after 3 seconds
    // }, 2000);
    // console.log("check docViewDrawer", docViewDrawer);
    if (!docViewDrawer?.data?.hasReadAccess) {
      if (!docViewDrawer?.data?.hasCreateAccess) {
        message.error("You do not have access to read this document");
        toggleDocViewDrawer();
        return;
      }
    }
    getDocData();
    getDocWorkflowHistory();
    getCategoryOptions();
    getAttachmentHistory();
    // !docViewDrawer?.data?.isVersion && getUserOptions();
    getComments();
    if (location.pathname.toLowerCase().includes("/processdocuments/viewdoc")) {
      setRenderedFrom("process");
    }
  }, [docViewDrawer?.data?._id]);

  // useEffect(()=>{
  //   console.log("activeModules", activeModules);

  // },[activeModules])

  // useEffect(() => {
  //   console.log("checkai drawingMetaData", drawingMetaData);
  // }, [drawingMetaData]);

  // useEffect(() => {
  //   documentDownloadAccess();
  // }, [formData]);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setIsAiMetaDataModalOpen(false);
  };

  const statusMap: any = {
    Approved: { backgroundColor: "#7cbf3f", text: "Approved", color: "white" },
    IN_REVIEW: {
      backgroundColor: "#F2BB00",
      color: "white",
      text: "In Review",
    },
    "Review Complete": {
      backgroundColor: "#F2BB00",
      text: "Review Complete",
      color: "white",
    },
    IN_APPROVAL: {
      backgroundColor: "#FB8500",
      color: "white",
      text: "In Approval",
    },
    AMMEND: { backgroundColor: "#D62DB1", text: "Amend", color: "yellow" },
    PUBLISHED: {
      backgroundColor: "#7CBF3F",
      color: "white",
      text: "Published",
    },
    DRAFT: { backgroundColor: "#0075A4", color: "white", text: "Draft" },
    SEND_FOR_EDIT: {
      backgroundColor: "#0075A4",
      text: "Sent For Edit",
      color: "white",
    },
    "Retire - In Review": { color: "#0075A4", text: "Retire Review" },
    "Retire - In Approval": { color: "#FB8500", text: "Retire Approval" },
    OBSOLETE: { color: "white", text: "Obsolete", backgroundColor: "darkblue" },
  };

  const getCategoryOptions = async () => {
    try {
      const res = await axios.get(
        `/api/riskconfig/getallcategorynames/${userDetails?.organizationId}`
      );

      if (res.status === 200 || res.status === 201) {
        // console.log("checkrisk res in getAllDepartments", res);
        if (res?.data?.data && !!res.data.data.length) {
          setCategoryOptions(
            res?.data?.data?.map((item: any) => ({
              ...item,
              value: item._id,
              label: item.riskCategory,
            }))
          );
          setSelectedCategory(res?.data?.data[0]?._id || null);
          form.setFieldsValue({ category: res?.data?.data[0]?._id });
        } else {
          setCategoryOptions([]);
          // enqueueSnackbar("No Categories Found", {
          //   variant: "warning",
          // });
        }
      } else {
        // setJobTitleOptions([]);
        enqueueSnackbar("Error in fetching getallcategorynames", {
          variant: "error",
        });
      }
    } catch (error) {
      // console.log("checkrisk error in fetching all job title", error);
    }
  };

  const togglePeopleDrawer = (data: any = {}) => {
    setPeopleDrawer({
      ...peopleDrawer,
      open: !peopleDrawer.open,
      data: { ...data },
    });
  };
  // console.log("inside documentviewdrawer")
  const getDocData = async () => {
    try {
      setIsLoading(true);
      let res: any;
      if (docViewDrawer?.data?.isVersion) {
        res = await axios.get(
          `/api/documents/getSingleDocument/${docViewDrawer?.data?._id}?versionId=${docViewDrawer.data.version}&version=true`
        );
      } else {
        res = await axios.get(
          `/api/documents/getSingleDocument/${docViewDrawer?.data?._id}?versionId=${docViewDrawer.data.version}`
        );
      }
      // console.log("res in doc view darawer", res);

      // const res = await axios.get(
      //   `/api/documents/getSingleDocument/${docViewDrawer?.data?.id}?versionId=${docViewDrawer.data.version}`
      // );
      getAiMetaData(docViewDrawer?.data?._id, res?.data?.documentLink);

      //extract the format from the document link, like .pdf .docx
      const format = res?.data?.documentLink.split(".").pop();
      setDocFormat(format);

      const isFav = res?.data?.favoriteFor?.includes(loggedInUser?.id);
      setIsFavorite(isFav);
      // getTags({ documentLink: res?.data?.documentLink });
      setFormData({
        ...res.data,
        id: res?.data?._id,
        locationName: res?.data?.creatorLocation?.locationName,
        entityName: res?.data?.creatorEntity?.entityName,
        docType: res?.data?.doctype?.documentTypeName,
        cuurentVersion: res?.data?.currentVersion,
        issueNumber: res?.data?.issueNumber,
        approvers: res?.data?.approvers,
        reviewers: res?.data?.reviewers,
        isVersion: res?.data?.isVersion,
        downloadAccess: res?.data?.downloadAccess,
        status: res?.data?.documentState,
        sectionName: res?.data?.sectionName,
        systemNames: res?.data?.doctype?.applicable_systems?.filter(
          (item: any) => res?.data?.system.includes(item?.id)
        ),

        // attachmentHistory: res.data?.attachmentHistory?.map((item: any) => ({
        //   updatedBy: item?.updatedBy,
        //   attachment: item?.attachment,
        //   updatedAt: item?.updatedAt,
        // })),

        // DocumentWorkFlowHistory: res?.data?.DocumentWorkFlowHistory?.map(
        //   (item: any) => ({
        //     ...item,
        //     actionName:
        //       item.actionName === "IN_REVIEW"
        //         ? "For Review"
        //         : item.actionName === "IN_APPROVAL"
        //         ? "For Approval"
        //         : item.actionName === "AMMEND"
        //         ? "Amend"
        //         : item.actionName === "DRAFT"
        //         ? "Draft"
        //         : item.actionName === "APPROVED"
        //         ? "Approved"
        //         : item.actionName === "PUBLISHED"
        //         ? "Published"
        //         : item.actionName === "REVIEW_COMPLETE"
        //         ? "Review Complete"
        //         : item.actionName === "SEND_FOR_EDIT"
        //         ? "Send For Edit"
        //         : item.actionName === "RETIRE_INREVIEW"
        //         ? "Retire In Review"
        //         : item.actionName === "RETIRE_INAPPROVE"
        //         ? "Retire In Approve"
        //         : item.actionName === "RETIRE"
        //         ? "Retire"
        //         : "N/A",
        //     createdAt: new Date(item?.createdAt).toDateString(),
        //   })
        // ),
        // DocumentVersions: res?.data?.DocumentVersions.map((item: any) => ({
        //   ...item,
        //   issueNumber: item?.issueNumber,
        //   versionName: item?.versionName,
        //   approvedDate: new Date(item?.updatedAt).toDateString(),
        //   versionLink: (
        //     <div
        //       onClick={() => {
        //         openVersionDoc(item.id);
        //       }}
        //       style={{ textDecoration: "underline", cursor: "pointer" }}
        //     >
        //       Link
        //     </div>
        //   ),
        // })),
      });
      // setDownloadAccess(res?.data?.downloadAccess)
      if (res.status === 200 || res.status === 201) {
        setIsLoading(false);
      }
    } catch (err) {
      // console.log("err inside 2", err);
      enqueueSnackbar(`Could not get Data, Check your internet connection`, {
        variant: "error",
      });
      setIsLoading(false);
    }
  };

  const getDocWorkflowHistory = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(
        `/api/documents/getdocworkflowhistory/${docViewDrawer?.data?._id}`
      );
      if (res.status === 200 || res.status === 201) {
        setIsLoading(false);
        setWorkflowHistoryTableData(res?.data);
      } else {
        setIsLoading(false);
        setWorkflowHistoryTableData([]);
      }
    } catch (err) {
      setIsLoading(false);
      setWorkflowHistoryTableData([]);
      enqueueSnackbar(`Could not get Data, Check your internet connection`, {
        variant: "error",
      });
    }
  };

  const isItemInDisableBtnFor = (disableBtnFor: any, item: any) => {
    return disableBtnFor.includes(item);
  };
  function isUserInApprovers(loggedInUser: any, approvers: any) {
    return approvers.some(
      (approver: any) => approver.email === loggedInUser.email
    );
  }

  const handleFavorite = async (docData: any) => {
    try {
      const res = await axios.patch(
        `/api/documents/markDocumentAsFavorite/${docData.id}/${loggedInUser.id}`
      );
      if (res.status === 200 || res.status === 201) {
        message.success("Document marked as favorite");
        setIsFavorite(!isFavorite);
      }
    } catch (error) {
      message.error("Error in marking as favorite");
    }
  };

  const handleRemoveFavorite = async (docData: any) => {
    try {
      const res = await axios.patch(
        `/api/documents/removeDocumentFromFavorites/${docData.id}/${loggedInUser.id}`
      );
      if (res.status === 200 || res.status === 201) {
        message.success("Document Removed From Favorites");
        setIsFavorite(!isFavorite);
      }
    } catch (error) {
      message.error("Error in Removing from Favorites");
    }
  };

  const handleCommentSubmit = async (value: string) => {
    setCommentsLoader(true);
    if (value) {
      try {
        const res = await axios.post("/api/documents/createDocumentComment", {
          documentId: docViewDrawer?.data._id,
          commentText: value,
          organizationId: userDetails?.organizationId,
          commentBy: loggedInUser?.id,
        });
        enqueueSnackbar(`Comment Added Successfully`, { variant: "success" });
        setCommentValue(""); // Clear input on success
        getComments(); // Refresh list
      } catch (err: any) {
        enqueueSnackbar(`Request Failed, Code: ${err.response?.status}`, {
          variant: "error",
        });
      } finally {
        setCommentsLoader(false);
      }
    } else {
      enqueueSnackbar(`Enter a comment`, { variant: "warning" });
      setCommentsLoader(false);
    }
  };

  const getComments = async () => {
    setCommentsLoader(true);
    try {
      const res = await axios.get(
        `/api/documents/getDocumentComments/${docViewDrawer?.data._id}`
      );
      setComments(res.data); // res.data already includes userDetails
    } catch (err) {
      enqueueSnackbar(
        `Could not get Comments, Check your internet connection`,
        { variant: "error" }
      );
    } finally {
      setCommentsLoader(false);
    }
  };

  const getAttachmentHistory = async () => {
    try {
      const res = await axios.get(
        `/api/documents/getAttachmentHistory/${docViewDrawer?.data._id}`
      );
      setAttachmentHistoryTableData(res.data);
    } catch (err) {
      enqueueSnackbar("Failed to load attachment history", {
        variant: "error",
      });
    }
  };

  const openVersionDoc = (id: any) => {
    navigate(
      `/processdocuments/processdocument/viewprocessdocument/${id}?version=true`
    );
  };

  const handleSubmit = async (option: string, submit = false) => {
    try {
      if (
        (DocStateIdentifier[option] === "IN_REVIEW" &&
          formData.reviewers?.length === 0) ||
        !formData?.documentLink
      ) {
        enqueueSnackbar("please edit this document and fill reqired field");
        return;
      }

      if (DocStateIdentifier[option] === "SEND_FOR_EDIT" && !submit) {
        setopenModalForComment(true);
        return;
      }
      setIsLoading(true);
      const res = await axios.post(
        `/api/documents/setStatus/${docViewDrawer?.data?.id}?status=${DocStateIdentifier[option]}`
      );

      //this sends mail and notification -- bug fix future
      // socket?.emit("documentUpdated", {
      //   data: { id: docViewDrawer?.data?.id },
      //   currentUser: `${loggedInUser.id}`,
      // });

      //Reload Inbox list if request is from path /inbox else navigate to /processdocument
      if (renderedFrom === "inbox") {
        // reloadList(true);
      } else {
        navigate("/processdocuments/processdocument");
      }
      if (res.status === 200 || res.status === 201) {
        toggleDocViewDrawer();
        handleFetchDocuments();
        setIsLoading(false);
        enqueueSnackbar(`${option} Successful`, { variant: "success" });
      }
    } catch (err: any) {
      enqueueSnackbar(`Request Failed ${err.response.status}`, {
        variant: "error",
      });
    }
  };

  const toggleInfoDrawer = (data: any = {}) => {
    setInfoDrawer({
      ...infoDrawer,
      open: !infoDrawer.open,
      data: { ...data },
    });
  };

  const toggleHistoryDrawer = (data: any = {}) => {
    const selectedDocData = docViewDrawer?.data;
    setHistoryDrawer({
      ...historyDrawer,
      open: !historyDrawer.open,
      data: { ...selectedDocData },
    });
  };
  const toggleCommentsDrawer = (data: any = {}) => {
    setCommentDrawer({
      ...commentDrawer,
      open: !commentDrawer.open,
      data: { ...data },
    });
  };

  const onMenuClick = (item: any) => {
    handleSubmit(item);
  };

  // const downloadDocument = () => {
  //   const url =
  //     `${process.env.REACT_APP_API_URL}/proxy/pdf?url=` +
  //     encodeURIComponent(formData.documentLink);
  //   fetch(url)
  //     .then((response) => response.blob())
  //     .then((blob) => {
  //       saveAs(blob, formData.documentName + "." + formData.documentLink.split(".").pop());
  //     })
  //     .catch((error) => console.error("Error fetching document:", error));
  // };

  const downloadDocument = async () => {
    if (process.env.REACT_APP_IS_OBJECT_STORAGE === "true") {
      const documentLink = formData.documentLink;
      const response = await axios.post(
        `${API_LINK}/api/documents/documentOBJ`,
        { documentLink }
      );
      const buffer = response.data;
      const uint8Array = new Uint8Array(buffer.data);
      const blob = new Blob([uint8Array], { type: "application/octet-stream" });
      saveAs(blob, formData.documentName + "." + documentLink.split(".").pop());
    } else {
      const url =
        `${process.env.REACT_APP_API_URL}/proxy/pdf?url=` +
        encodeURIComponent(formData.documentLink);
      fetch(url)
        .then((response) => response.blob())
        .then((blob) => {
          saveAs(
            blob,
            formData.documentName + "." + formData.documentLink.split(".").pop()
          );
        })
        .catch((error) => console.error("Error fetching document:", error));
    }
  };

  // const documentDownloadAccess = async () => {
  //   try {
  //     const isOrgAdmin = checkRoles("ORG-ADMIN");
  //     const isMr =
  //       checkRole("MR") && currentUser.locationId === formData.locationId;
  //     const isCreator = formData?.creators?.some(
  //       (item: any) => item.id === currentUser?.id
  //     );
  //     const isReviewer = formData?.reviewers?.some(
  //       (item: any) => item.id === currentUser?.id
  //     );
  //     const isApprover = formData?.approvers?.some(
  //       (item: any) => item.id === currentUser?.id
  //     );
  //     const deptHead = await axios.get(
  //       `${API_LINK}/api/entity/getEntityHead/byEntityId/${formData?.entityId}`
  //     );
  //     const isDeptHead = Array.isArray(deptHead?.data)
  //       ? deptHead?.data.some((item: any) => item.id === currentUser?.id)
  //       : false;

  //     const functionSpoc = await axios.get(
  //       `${API_LINK}/api/entity/getFunctionByLocation/${formData?.locationId}`
  //     );
  //     const isFunctionSpoc = Array.isArray(functionSpoc?.data)
  //       ? functionSpoc?.data?.some((item: any) =>
  //           item.functionSpoc.includes(currentUser?.id)
  //         )
  //       : false;

  //     if (
  //       isOrgAdmin ||
  //       isMr ||
  //       isCreator ||
  //       isReviewer ||
  //       isApprover ||
  //       isDeptHead ||
  //       isFunctionSpoc
  //     ) {
  //       setDownloadAccess(true);
  //     } else {
  //       setDownloadAccess(false);
  //     }
  //   } catch {
  //     setDownloadAccess(false);
  //   }
  // };

  const openAceoffix = async (formData: any) => {
    let requiredDetails = {};
    let response = { data: formData.documentLink };
    if (process.env.REACT_APP_IS_OBJECT_STORAGE === "true") {
      response = await axios.post(`${API_LINK}/api/documents/viewerOBJ`, {
        documentLink: formData.documentLink,
      });
    }

    if (
      formData?.documentState === "DRAFT" ||
      formData?.documentState === "IN_REVIEW"
    ) {
      requiredDetails = {
        documentLink: response.data,
        title: formData.documentName,
        //  headerAndFooter: false,

        location: "test data",
        system: "test data",
        issueNo: formData.issueNumber,
        revisionNo: formData.currentVersion,
        createdBy:
          formData?.createdByDetails?.firstname +
          " " +
          formData?.createdByDetails?.lastname,
        createdAt: await formatDate(formData.createdAt),
        status: formData.documentState,
        downloadAccess: false,
        organizationId: formData.organizationId,
      };
    }
    if (formData?.documentState === "IN_APPROVAL") {
      requiredDetails = {
        documentLink: response.data,
        // headerAndFooter: false,

        title: formData.documentName,
        documentNo: formData.documentNumbering,
        location: "test data",
        system: "test data",
        issueNo: formData.issueNumber,
        revisionNo: formData.currentVersion,
        createdBy:
          formData?.createdByDetails?.firstname +
          " " +
          formData?.createdByDetails?.lastname,
        createdAt: await formatDate(formData.createdAt),
        reviewedBy:
          formData.reviewers[0].firstname +
          " " +
          formData.reviewers[0].lastname,
        reviewedAt: await formatDate(formData.reviewers[0].updatedAt),
        status: formData.documentState,
        downloadAccess: false,
        organizationId: formData.organizationId,
      };
    }
    if (
      formData?.documentState === "PUBLISHED" ||
      formData?.documentState === "OBSOLETE"
    ) {
      requiredDetails = {
        documentLink: response.data,
        // headerAndFooter: false,

        title: formData.documentName,
        documentNo: formData.documentNumbering,
        location: "test data",
        system: "test data",
        issueNo: formData.issueNumber,
        revisionNo: formData.currentVersion,
        effectiveDate: await formatDate(formData.approvedDate),
        createdBy:
          formData?.createdByDetails?.firstname +
          " " +
          formData?.createdByDetails?.lastname,
        createdAt: await formatDate(formData?.createdAt),
        reviewedBy:
          formData?.reviewers[0]?.firstname +
          " " +
          formData?.reviewers[0]?.lastname,
        reviewedAt: await formatDate(formData?.reviewers[0]?.updatedAt),
        approvedBy:
          formData?.approvers[0]?.firstname +
          " " +
          formData?.approvers[0]?.lastname,
        approvedAt: await formatDate(formData.approvedDate),
        status: formData.documentState,
        downloadAccess: false,
        organizationId: formData.organizationId,
      };
    }
    const formDataJSON = JSON.stringify(requiredDetails);
    const encodedFormData = encodeURIComponent(formDataJSON);
    window.AceBrowser.openWindowModeless(
      ACEOFFIX_URL + "/view?formData=" + encodedFormData,
      "width=1200px;height=800px;"
    );
    // window.AceBrowser.openWindowModeless(
    //   "http://localhost:8082/view?formData=" + encodedFormData,
    //   "width=1200px;height=800px;"
    // );
  };

  const openAceoffixWithoutHeaderAndFooter = async (formData: any) => {
    let response = { data: formData.documentLink };
    if (process.env.REACT_APP_IS_OBJECT_STORAGE === "true") {
      response = await axios.post(`${API_LINK}/api/documents/viewerOBJ`, {
        documentLink: formData.documentLink,
      });
    }
    let requiredDetails = {
      documentLink: response.data,
      headerAndFooter: false,
      downloadAccess: formData.downloadAccess,
      status: formData.documentState,
      title: formData.documentName,
    };
    const formDataJSON = JSON.stringify(requiredDetails);
    const encodedFormData = encodeURIComponent(formDataJSON);
    window.AceBrowser.openWindowModeless(
      ACEOFFIX_URL + "/view?formData=" + encodedFormData,
      "width=1200px;height=800px;"
    );
    // window.AceBrowser.openWindowModeless(
    //   "http://localhost:8082/view?formData=" + encodedFormData,
    //   "width=1200px;height=800px;"
    // );
  };

  const compareAceoffix = async (formData: any) => {
    let requiredDetails = {};
    let responsePrev: any = "";
    let responseCurr: any = "";

    if (process.env.REACT_APP_IS_OBJECT_STORAGE === "true") {
      responsePrev = await axios.post(`${API_LINK}/api/documents/viewerOBJ`, {
        documentLink:
          formData.DocumentVersions[formData.DocumentVersions?.length - 1]
            .documentLink,
      });
      responseCurr = await axios.post(`${API_LINK}/api/documents/viewerOBJ`, {
        documentLink: formData.documentLink,
      });
    } else {
      responsePrev = {
        data: formData.DocumentVersions[formData.DocumentVersions?.length - 1]
          .documentLink,
      };
      responseCurr = { data: formData.documentLink };
    }

    requiredDetails = {
      previousDocument: responsePrev.data,
      currentDocument: responseCurr.data,
    };
    const formDataJSON = JSON.stringify(requiredDetails);
    const encodedFormData = encodeURIComponent(formDataJSON);
    window.AceBrowser.openWindowModeless(
      process.env.REACT_APP_API_URL +
        "/aceoffix/compare?formData=" +
        encodedFormData,
      "width=1200px;height=800px;"
    );
  };

  const compareInterAceoffix = async (formData: any) => {
    let requiredDetails = {};
    let responsePrev: any = "";
    let responseCurr: any = "";
    if (formData.documentState === "IN_APPROVAL") {
      if (process.env.REACT_APP_IS_OBJECT_STORAGE === "true") {
        responsePrev = await axios.post(`${API_LINK}/api/documents/viewerOBJ`, {
          documentLink: formData.versionInfo.find(
            (item: any) => item.type === "CREATOR"
          ).documentLink,
        });
        responseCurr = await axios.post(`${API_LINK}/api/documents/viewerOBJ`, {
          documentLink: formData.versionInfo.find(
            (item: any) => item.type === "REVIEWER"
          ).documentLink,
        });
      } else {
        responsePrev = {
          data: formData.versionInfo.find(
            (item: any) => item.type === "CREATOR"
          ).documentLink,
        };
        responseCurr = {
          data: formData.versionInfo.find(
            (item: any) => item.type === "REVIEWER"
          ).documentLink,
        };
      }
    }
    if (formData.documentState === "PUBLISHED") {
      if (process.env.REACT_APP_IS_OBJECT_STORAGE === "true") {
        responsePrev = await axios.post(`${API_LINK}/api/documents/viewerOBJ`, {
          documentLink: formData.versionInfo.find(
            (item: any) => item.type === "REVIEWER"
          ).documentLink,
        });
        responseCurr = await axios.post(`${API_LINK}/api/documents/viewerOBJ`, {
          documentLink: formData.versionInfo.find(
            (item: any) => item.type === "APPROVER"
          ).documentLink,
        });
      } else {
        responsePrev = {
          data: formData.versionInfo.find(
            (item: any) => item.type === "REVIEWER"
          ).documentLink,
        };
        responseCurr = {
          data: formData.versionInfo.find(
            (item: any) => item.type === "APPROVER"
          ).documentLink,
        };
      }
    }
    requiredDetails = {
      previousDocument: responsePrev.data,
      currentDocument: responseCurr.data,
    };
    //   previousDocument: responsePrev.data,
    //   currentDocument: responseCurr.data,
    // };
    const formDataJSON = JSON.stringify(requiredDetails);
    const encodedFormData = encodeURIComponent(formDataJSON);
    window.AceBrowser.openWindowModeless(
      process.env.REACT_APP_API_URL +
        "/aceoffix/compare?formData=" +
        encodedFormData,
      "width=1200px;height=800px;"
    );
  };

  const createTemplate = async (formData: any) => {
    formData = {
      ...formData,
      documentName: topic + " - Template",
      documentState: "DRAFT",
      topic: topic,
      realmName: realmName,
    };

    const { _id, createdAt, updatedAt, ...cleanFormData } = formData;

    const enrichedFormData = {
      ...cleanFormData,
      documentName: topic + " - Template",
      documentState: "DRAFT",
      topic: topic,
      realmName: realmName,
    };

    enqueueSnackbar(
      "Template is being created, please check `My Documents` section after a while!",
      { variant: "info" }
    );
    toggleDocViewDrawer();
    // console.log("checkai py url", process.env.REACT_APP_PY_URL);

    const res = await axios.post(
      `${process.env.REACT_APP_PY_URL}/pyapi/template?realm=${realmName}&orgId=${userDetails?.organizationId}&locationName=${formData.locationName}`,
      enrichedFormData
    );
    if (res.status === 200 || res.status === 201) {
      enqueueSnackbar(
        `Template iscreated succesffuly with name ${
          formData.documentName + " - Template"
        } under My Documents Section`,
        {
          variant: "success",
        }
      );
    }
  };

  const getCaseInsensitiveKey = (obj: any, key: string) => {
    if (!obj || typeof obj !== "object") return undefined;
    const foundKey = Object.keys(obj).find(
      (k) => k.toLowerCase() === key.toLowerCase()
    );
    return foundKey ? obj[foundKey] : undefined;
  };

  const getAiMetaData = async (docId: any, docLink: any) => {
    // console.log("checkdoc docId", docId);

    setIsMetaDataLoading(true);
    try {
      const response = await axios.get(`api/documents/getAiMetaData/${docId}`);
      // console.log("checkdoc response tags", response.data);

      if (response.status === 200 || response.status === 201) {
        // console.log("checkdoc3 docLink--->", docLink);

        if (docLink?.endsWith(".pdf") || docLink?.endsWith(".docx")) {
          // console.log("checkdoc3 response data in if ---->", response.data[0]);
          // console.log("checkdoc3 summaryText ---->", response.data[0]?.docSummary);

          setAiMetaData(response?.data[0]?.metadata);
          setDrawingMetaData({});
          setQuestions(response?.data[0]?.docMCQ);
          setSummaryText(response?.data[0]?.docSummary);
          setRiskAnalysis(response?.data[0]?.riskAnalysis);
        } else {
          // console.log("checkdoc3 response data in else ---->", response.data[0]);

          setAiMetaData({});
          setDrawingMetaData({
            ...response?.data[0],
            metadataDrawing: JSON.parse(response?.data[0]?.metadataDrawing),
          });
        }
        setIsMetaDataLoading(false);
      } else {
        setAiMetaData([]);
        setIsMetaDataLoading(false);
      }
    } catch (error) {
      setIsMetaDataLoading(false);
      // console.log("error", error);
    }
  };

  // console.log("checkai drawingMetadaat", drawingMetaData)

  const handleClickBot = (event: any) => {
    setBotPopover(event.currentTarget);
  };

  const handleCloseBot = () => {
    setBotPopover(null);
  };

  const handleOpenBotModal = (formdata: any) => {
    // console.log("checkdoc3 aiMetaData summarytext---->", summaryText);

    if (summaryText !== "" && !!summaryText) {
      handleCloseBot();
      setBotModal(true);
    } else {
      generateSummary(formdata);
      handleCloseBot();
      setBotModal(true);
    }
  };

  const handleOpenSummaryModalForDrawings = (formdata: any) => {
    // console.log("checkdoc3 summamry ---->", drawingMetaData);

    handleCloseBot();
    setBotModal(true);
  };

  const handleCloseBotModal = () => {
    setBotModal(false);
  };

  const handleOpenMcqModal = (formdata: any) => {
    if (!!questions && !!questions?.length) {
      handleCloseBot();
      setMcqModal(true);
    } else {
      generateQuiz(formdata);
      handleCloseBot();
      setMcqModal(true);
    }
  };

  const handleCloseMcqModal = () => {
    setMcqModal(false);
  };
  const handleToggle = (section: any) => {
    setExpanded((prev: any) => ({ ...prev, [section]: !prev[section] }));
  };

  // const handleMouseUp = (event: any) => {
  //   // console.log("checkdoc mouseup", event);
  //   const selection: any = window.getSelection();
  //   // console.log("checkdoc selection", selection);

  //   const text: any = selection.toString().trim();
  //   console.log("checkdoc text", text);

  //   if (text && selection.rangeCount > 0) {
  //     const range = selection.getRangeAt(0).getBoundingClientRect();
  //     const contentRect = contentRef.current.getBoundingClientRect();
  //     setAnchorElAi({
  //       top: range.top - contentRect.top + window.scrollY - 25,
  //       left: range.left - contentRect.left + window.scrollX + range.width / 2,
  //     });
  //     setSelectedText(text);
  //   } else {
  //     setAnchorElAi(null);
  //   }
  // };
  const handleMouseUp = () => {
    //console.log("checkdoc handle mouse up called-->", window?.getSelection()?.toString());

    const text = window?.getSelection()?.toString()?.trim();
    if (text) {
      setSelectedText(text); // Store the selected text in state
      //console.log("Selected Text:", text); // Debug: log selected text
    }
  };

  const handleSearchClick = () => {
    //console.log("search cllicked handlesearchclicked");

    //console.log("Selected text inside handle search:", selectedText);
    setAnchorElAi(null);
    navigate("/semanticSearch", {
      state: { selectedText: selectedText },
    });
    // setShowTooltip(false);
  };

  // useEffect(() => {
  //   document.addEventListener("mouseup", handleMouseUp);
  //   return () => {
  //     document.removeEventListener("mouseup", handleMouseUp);
  //   };
  // }, []);

  // useEffect(() => {
  //   console.log("checkai doc format", docFormat);
  //   console.log("checkai risk analysis", riskAnalylsis);

  // },[riskAnalylsis])

  const handleQuizSubmit = () => {
    // First, close the MCQ modal
    setMcqModal(false);
    setResultsModalOpen(true);
  };

  const calculateScore = () => {
    return questions?.reduce((score: any, question: any) => {
      if (answers[question.question] === question.correct_answer) {
        return score + 1;
      }
      return score;
    }, 0);
  };

  const allAnswered = questions?.length === Object.keys(answers)?.length;

  const id = botPopover ? "simple-popover" : undefined;

  const handleOptionChange = (question: any, option: any) => {
    setAnswers((prev: any) => ({ ...prev, [question]: option }));
  };

  // const generateSummary = async (formData: any) => {
  //   console.log("checkdoc formdata", formData);
  //   setIsSummaryLoading(true);
  //   try {
  //     const response = await axios.get(
  //       `http://localhost:5001/pyapi/summary/${formData.id}`
  //     );
  //     if (response.status === 200 || response.status === 201) {
  //       console.log("checkdoc response", response.data);
  //       setSummaryText(response?.data?.summary);
  //       setIsSummaryLoading(false);
  //     }
  //   } catch (error) {
  //     setIsSummaryLoading(false);
  //     console.log("error", error);
  //   }
  // };

  const generateSummary = async (formData: any) => {
    //console.log("checkdoc formdata", formData);
    //console.log("checkdoc py url", process.env.REACT_APP_PY_URL);

    setIsSummaryLoading(true);
    setProgress(0);

    const timer = setInterval(() => {
      setProgress((prevProgress) =>
        prevProgress >= 100 ? 100 : prevProgress + 8
      );
    }, 4800); // 4800ms * 12.5 = 60000ms = 1 minute
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_PY_URL}/pyapi/summary`,
        {
          documentLink: formData?.documentLink,
          orgId: userDetails?.organizationId,
        }
      );
      if (response.status === 200 || response.status === 201) {
        //console.log("checkdoc response summary", response.data);
        setSummaryText(response?.data?.summary);
        setProgress(100);
        setIsSummaryLoading(false);
        clearInterval(timer);
      }
    } catch (error) {
      setIsSummaryLoading(false);
      clearInterval(timer);
      //console.log("error", error);
    }
  };

  // const getAllCategories = async () => {
  //   try {
  //     const res = await axios.get(
  //       `/api/riskconfig/getallcategorynames/${userDetails?.organizationId}`
  //     );

  //     if (res.status === 200 || res.status === 201) {
  //       // console.log("checkrisk res in getAllDepartments", res);
  //       if (res?.data?.data && !!res.data.data.length) {
  //         return res?.data?.data?.map((item: any) => ({
  //           categoryId: item._id,
  //           categoryName: item.riskCategory,
  //           titleLabel : item.titleLabel,
  //           basicStepLabel : item.basicStepLabel,
  //         }));
  //       } else {
  //         enqueueSnackbar("No Categories Found", {
  //           variant: "warning",
  //         });
  //         return [];
  //       }
  //     } else {
  //       enqueueSnackbar("Error in fetching getallcategorynames", {
  //         variant: "error",
  //       });
  //       return [];
  //     }
  //   } catch (error) {
  //     enqueueSnackbar("Error in getting risk categories", { variant: "error" });
  //   }
  // };

  const generateRiskAnalysis = async () => {
    setIsRiskAnalysisLoading(true);
    const riskCategories = categoryOptions?.map((item: any) => ({
      categoryId: item._id,
      categoryName: item.riskCategory,
      titleLabel: item.titleLabel,
      basicStepLabel: item.basicStepLabel,
    }));
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_PY_URL}/pyapi/risk_analysis`,
        {
          query: riskAnalylsis,
          riskCategories: riskCategories,
          orgId: userDetails?.organizationId,
        }
      );
      if (response.status === 200 || response.status === 201) {
        // console.log("checkai response risk anaylusie", response.data);
        setIsRiskAnalysisLoading(false);
        setRiskAnalysisText(response?.data);
      }
    } catch (error) {
      setIsRiskAnalysisLoading(false);
      // console.log("error", error);
    }
  };

  // useEffect(() => {
  //   console.log("checkdoc1 selectedRows", selectedRows);
  // }, [selectedRows]);

  const getAllClausesByOrgId = async () => {
    try {
      const response = await axios.get(
        `/api/systems/getAllClausesByOrgId/${userDetails?.organizationId}`
      );
      // console.log("checkdoc1 response", response.data);
      if (response?.status === 200) {
        if (response?.data?.length) {
          setClauseTableData(response?.data);
          setClauseSelectionModal(true);
        } else {
          setClauseTableData([]);
          enqueueSnackbar("No clauses found", { variant: "info" });
        }
      }
    } catch (error) {
      // console.log("eror in getting all clauses", error);
    }
  };

  const identifyClauses = async () => {
    setClauseSelectionModal(false);
    setClauseModal(true);
    setClauseCompareLoading(true);
    const clauseData = selectedRows?.map((item: any) => ({
      clauseNumber: item.number,
      clauseText: item.name,
      clauseDescription: item.description,
    }));
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_PY_URL}/pyapi/clauses`,
        {
          documentLink: formData?.documentLink,
          clauses: clauseData,
        }
      );
      if (response.status === 200 || response.status === 201) {
        // console.log("checkdoc1 response c;aise compare", response.data);
        setClauseResult(response?.data?.response);
        navigate("/processdocuments/docviewer", {
          state: {
            documentLink: formData?.documentLink,
            clauseCompareResult: response?.data?.response,
          },
        });
        setClauseModal(true);
        setClauseCompareLoading(false);
      } else {
        setClauseCompareLoading(false);
      }
    } catch (error) {
      // setIsSummaryLoading(false);
      // clearInterval(timer);
      // console.log("error", error);
    }
  };

  const getAgreementSummary = async () => {
    setClauseSelectionModal(false);
    setClauseModal(true);
    setClauseCompareLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_PY_URL}/pyapi/clause-summary`,
        {
          docId: formData?.id,
        }
      );
      if (response.status === 200 || response.status === 201) {
        // console.log("checkdoc2 agreeement response", response);
        if (response?.data?.response === null) {
          enqueueSnackbar("Agreement Summary Not Yet Ready!", {
            variant: "info",
          });
          setClauseModal(false);
          setClauseCompareLoading(false);
        } else {
          setClauseResult(response?.data?.response);
          navigate("/processdocuments/docviewer", {
            state: {
              documentLink: formData?.documentLink,
              clauseCompareResult: response?.data?.response,
            },
          });
          setClauseModal(false);
          setClauseCompareLoading(false);
        }
      } else {
        setClauseCompareLoading(false);
      }
    } catch (error) {
      // setIsSummaryLoading(false);
      // clearInterval(timer);
      // console.log("error", error);
    }
  };

  const generateQuiz = async (formData: any) => {
    // console.log("checkdoc formdata", formData);
    setIsMcqLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_PY_URL}/pyapi/mcq`,
        {
          documentLink: formData?.documentLink,
          orgId: userDetails?.organizationId,
        }
      );
      if (response.status === 200 || response.status === 201) {
        // console.log("checkdoc response mcq", response.data);
        setQuestions(response?.data?.mcq);
        setIsMcqLoading(false);
      }
    } catch (error) {
      setIsMcqLoading(false);
      // console.log("error", error);
    }
  };

  const CircularProgressWithLabel = (props: any) => {
    return (
      <Box position="relative" display="inline-flex">
        <CircularProgress variant="determinate" {...props} />
        <Box
          top={0}
          left={0}
          bottom={0}
          right={0}
          position="absolute"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Typography variant="caption" component="div" color="textSecondary">
            {`${Math.round(props.value)}%`}
          </Typography>
        </Box>
      </Box>
    );
  };

  const formatKey = (key: any) => {
    const specialLabels: any = {
      hira: "Hazards",
      aspect: "Environment Impact",
    };

    // Return special label if key matches, otherwise convert to Proper Case
    return (
      specialLabels[key] ||
      key
        .split(" ")
        .map((word: any) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    );
  };

  const formatDate = async (isoString: string) => {
    const date = new Date(isoString);

    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // getUTCMonth() is zero-based
    const year = date.getUTCFullYear();

    return `${day}-${month}-${year}`;
  };

  const renderTag = (status: any) => {
    const statusInfo = statusMap[status];

    if (statusInfo) {
      return (
        <Tag
          style={{
            backgroundColor: statusInfo.backgroundColor,
            height: "30px",
            alignContent: "center",
          }}
          color={statusInfo.color}
          key={status}
          // className={classes?.statusTag}
        >
          {statusInfo.text}
        </Tag>
      );
    }

    return status;
  };

  const actionItemsForDocs = [
    {
      text: "Show Summary",
      onClick: (formData: any) => handleOpenBotModal(formData),
    },
    {
      text: "Use this as Template",
      onClick: () => {
        handleCloseBot();
        setIsTemplateModalOpen(true);
      },
    },
    {
      text: "Launch Quiz",
      onClick: (formData: any) => handleOpenMcqModal(formData),
    },
    {
      text: "Show AI Extracted Metadata",
      onClick: () => {
        setIsAiMetaDataModalOpen(true);
        handleCloseBot();
      },
    },
    {
      text: "Risk Analysis",
      onClick: () => {
        generateRiskAnalysis();
        handleCloseBot();
        setRiskAnalysisModal(true);
      },
    },
    // {
    //   text: "Clause Comparison",
    //   onClick: () => {
    //     getAllClausesByOrgId();
    //     handleCloseBot();
    //   },
    // },
    // {
    //   text: "Agreement Summary",
    //   onClick: () => {
    //     getAgreementSummary();
    //     handleCloseBot();
    //   },
    // },
  ];

  const actionItemsForDrawings = [
    {
      text: "Show Summary",
      onClick: (formData: any) => handleOpenSummaryModalForDrawings(formData),
    },
    {
      text: "Show AI Extracted Metadata",
      onClick: () => {
        setIsAiMetaDataModalOpen(true);
        handleCloseBot();
      },
    },
  ];

  const formatKeyForDrawingMetaData = (key: any) => {
    return key.replace(/_/g, " "); // Simple formatter for keys
  };

  const renderSection = (title: any, content: any) => {
    return (
      <div key={title}>
        {/* Section Header */}
        <div
          className={classes1.sectionHeader}
          onClick={() => handleToggle(title)}
          style={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            padding: "8px 10px",
            borderBottom: "1px solid #ddd", // Underline for the section header
            backgroundColor: "transparent", // No background color
            justifyContent: "flex-start",
          }}
        >
          <Typography
            variant="h6"
            style={{
              fontSize: "1rem",
              fontWeight: "600",
              textDecoration: "underline",
              marginRight: "8px",
            }}
          >
            {formatKeyForDrawingMetaData(title)}
          </Typography>
          <MdExpandMore
            style={{
              transform: expanded[title] ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s",
              marginRight: "8px",
            }}
          />
        </div>

        {/* Section Content */}
        <Collapse in={expanded[title]} timeout="auto" unmountOnExit>
          <div
            className={classes1.sectionContent}
            style={{ padding: "8px 12px" }}
          >
            {title === "Bill of Materials" && content ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: content,
                }}
              />
            ) : Array.isArray(content) ? (
              // Display each item in an array
              content.map((item, index) => (
                <Typography
                  key={index}
                  variant="body1"
                  style={{ display: "block", padding: "4px 0" }}
                >
                  {item}
                </Typography>
              ))
            ) : content && typeof content === "object" ? (
              // Display each key-value pair in an object
              Object.entries(content).map(([key, value], index) => (
                <Typography
                  key={index}
                  variant="body1"
                  style={{ display: "block", padding: "4px 0" }}
                >
                  {`${formatKeyForDrawingMetaData(key)}: ${value}`}
                </Typography>
              ))
            ) : (
              // If content is a string or empty
              <Typography
                variant="body1"
                style={{ display: "block", padding: "4px 0" }}
              >
                {content || "No data available"}
              </Typography>
            )}
          </div>
        </Collapse>
      </div>
    );
  };

  // Handle row selection
  const onSelectChange = (newSelectedRowKeys: any) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const handleCreateHira = async () => {
    try {
      if (!selectedRowKeys?.length) {
        enqueueSnackbar("Please select at least one row to create HIRA", {
          variant: "warning",
        });
        return;
      }
      setIsRiskAnalysisLoading(true);
      // console.log("Selected row keys:", selectedRowKeys);

      // Extracting the first HIRA only
      const firstHira = riskAnalysisText?.data?.suggestedHiras[0];

      if (!firstHira) {
        enqueueSnackbar("No HIRA data found!", { variant: "warning" });
        return;
      }

      // Extract only the selected steps
      const selectedSteps: any[] = [];
      let matchedHira: any = null;

      riskAnalysisText?.data?.suggestedHiras?.forEach((hira: any) => {
        hira.steps.forEach((step: any, index: number) => {
          const key = `${hira.jobTitle}-${index}`;
          if (selectedRowKeys.includes(key)) {
            // Only set matchedHira once (e.g., if you only want to create one HIRA at a time)
            if (!matchedHira) matchedHira = hira;

            selectedSteps.push({
              sNo: index + 1,
              jobBasicStep: step?.basicStepOfJob,
              hazardDescription: step?.hazardDescription,
              impactText: step?.impactText,
              existingControl: step?.existingControlMeasure,
              additionalControlMeasure: step?.additionalControlMeasure || "",
              responsiblePerson: step?.responsiblePerson || "",
              implementationStatus: step?.implementationStatus || "",
              preSeverity: step?.preSeverity || 0,
              preProbability: step?.preProbability || 0,
              postSeverity: step?.postSeverity || 0,
              postProbability: step?.postProbability || 0,
              preMitigationScore:
                (step?.preProbability || 1) * (step?.preSeverity || 1),
              postMitigationScore:
                (step?.postProbability || 1) * (step?.postSeverity || 1),
            });
          }
        });
      });

      if (!selectedSteps?.length || !matchedHira) {
        enqueueSnackbar("No valid steps found for the selected rows!", {
          variant: "warning",
        });
        return;
      }

      const hiraData = {
        jobTitle: trimText(matchedHira?.jobTitle) || "",
        organizationId: userDetails?.organizationId || "",
        locationId: userDetails?.location?.id || "",
        entityId: userDetails?.entity?.id,
        categoryId: selectedCategory,
        section: "",
        area: "",
        riskType: "",
        condition: "",
        assesmentTeam: [],
        additionalAssesmentTeam: "",
        createdBy: userDetails?.id || "",
      };

      // console.log("Creating HIRA with data:", hiraData);
      // console.log("Selected Steps:", selectedSteps);

      // setIsSubmitting(true);

      const response = await axios.post(
        `/api/riskregister/hira/createHiraWithMultipleSteps`,
        {
          hira: hiraData,
          steps: selectedSteps,
        }
      );

      if (response.status === 200 || response.status === 201) {
        // setIsSubmitting(false);\
        setSelectedRowKeys([]);
        setIsRiskAnalysisLoading(false);
        enqueueSnackbar("HIRA created successfully!", { variant: "success" });
        // navigate(`/risk/riskregister/HIRA/${response?.data[0]?._id}`);
      }
    } catch (error: any) {
      setIsRiskAnalysisLoading(false);

      // setIsSubmitting(false);
      // console.error("Error creating HIRA:", error);
      enqueueSnackbar(error?.response?.data?.message || "An error occurred", {
        variant: "error",
      });
    }
  };

  const handleDocumentAction = async (url: string, documentState?: string) => {
    try {
      setIsLoading(true);
      const formDataPayload = new FormData();
      if (documentState) formDataPayload.append("documentState", documentState);

      formDataPayload.append("realmName", realmName);
      formDataPayload.append(
        "locationName",
        userDetails?.location?.locationName
      );
      formDataPayload.append("updatedBy", userDetails?.id);
      formDataPayload.append("organizationId", userDetails?.organizationId);

      // Debug
      // for (let [key, val] of formDataPayload.entries()) {
      //   console.log(`${key}:`, val);
      // }

      await axios.patch(url, formDataPayload);
      message.success("Action completed successfully!");
      toggleDocViewDrawer();
      handleFetchDocuments();
      setIsLoading(false);
    } catch (error) {
      console.error("Update failed", error);
      message.error("Failed to update document.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendForEdit = () => {
    handleDocumentAction(
      `/api/documents/updateDocumentForSendForEdit/${formData.id}`,
      "Sent_For_Edit"
    );
  };
  const handleSendForReview = () => {
    if (!formData?.reviewers || formData.reviewers.length === 0) {
      message.error("At least one reviewer is required to send for review.");
      return;
    }
    handleDocumentAction(
      `/api/documents/updateDocumentForReview/${formData.id}`,
      "IN_REVIEW"
    );
  };

  const handleSendForApproval = () => {
    if (!formData?.approvers || formData.approvers.length === 0) {
      message.error("At least one approver is required to send for approval.");
      return;
    }
    handleDocumentAction(
      `/api/documents/updateDocumentForApproval/${formData.id}`,
      "IN_APPROVAL"
    );
  };

  const handleApprove = () =>
    handleDocumentAction(
      `/api/documents/updateDocumentForPublishedState/${formData.id}`,
      "PUBLISHED"
    );

  const handleAmmend = () =>
    handleDocumentAction(
      `/api/documents/updateDocumentForPublishedState/${formData.id}`,
      "PUBLISHED"
    );

  const renderWorkflowButton = () => {
    const userId = userDetails?.id;
    const state = formData?.documentState;

    if (!formData || !userId) return null;

    const canReview = checkIfLoggedInUserCanReview(formData, userId);
    const canApprove = checkIfLoggedInUserCanApprove(formData, userId);
    const hasCreateAccess = checkIfLoggedInUserHasCreateAccess(
      formData,
      userId
    );

    if (state === "DRAFT") {
      return (
        <Button type="default" onClick={handleSendForReview}>
          Send For Review
        </Button>
      );
    }

    if (state === "IN_REVIEW" && canReview) {
      return (
        <Button type="default" onClick={handleSendForApproval}>
          Complete Review
        </Button>
      );
    }

    if (state === "IN_APPROVAL" && canApprove) {
      return (
        <Button type="default" onClick={handleApprove}>
          Approve
        </Button>
      );
    }

    // if (state === "PUBLISHED" && (canApprove || canReview || hasCreateAccess)) {
    //   return (
    //     <Button type="default" onClick={handleAmmend}>
    //       Amend
    //     </Button>
    //   );
    // }

    return null;
  };

  return (
    <div>
      <div>
        <Drawer
          placement="right"
          open={docViewDrawer.open}
          closable={true}
          onClose={toggleDocViewDrawer}
          className={classes.drawer}
          maskClosable={false}
          closeIcon={
            <img
              src={CloseIconImageSvg}
              alt="close-drawer"
              style={{
                width: "30px",
                height: "30px",
                cursor: "pointer",
                // margin: matches ? "12px" : "0px",
                padding: "0px",
              }}
            />
          }
          width={isSmallScreen ? "90%" : "72%"}
          extra={
            <div style={{ display: "flex", gap: 8 }}>
              {renderWorkflowButton()}
              {(formData?.documentState === "IN_REVIEW" ||
                formData?.documentState === "IN_APPROVAL") && (
                <Button type="default" onClick={handleSendForEdit}>
                  Send For Edit
                </Button>
              )}
            </div>
          }
        >
          <div style={{ display: "flex", height: "100%" }}>
            {/* Left Icon Bar */}
            <div
              style={{
                width: "52px",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "baseline",
                backgroundColor: "#eff8ff",
                borderRight: "1px solid #ddd",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "70%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-around",
                  alignItems: "center",
                  gap: "22px",
                  padding: "0px 4px",
                  // backgroundColor: "#eff8ff",
                  // borderRight: "1px solid #ddd",
                }}
              >
                <Tooltip title="View Document">
                  <FaRegEdit
                    onClick={() => openAceoffixWithoutHeaderAndFooter(formData)}
                    size={23.5}
                    color="rgb(0, 48, 89)"
                    style={{ marginTop: "10px", cursor: "pointer" }}
                  />
                </Tooltip>

                {isFavorite ? (
                  <Tooltip title="Remove From Favorites">
                    <FaStar
                      onClick={() => handleRemoveFavorite(formData)}
                      size={23.5}
                      color="rgb(0, 48, 89)"
                      style={{ marginTop: "10px", cursor: "pointer" }}
                    />
                  </Tooltip>
                ) : (
                  <Tooltip title="Mark As Favorite">
                    <FaRegStar
                      onClick={() => handleFavorite(formData)}
                      size={23.5}
                      color="rgb(0, 48, 89)"
                      style={{ marginTop: "10px", cursor: "pointer" }}
                    />
                  </Tooltip>
                )}

                <Tooltip title="Comments">
                  <FaRegComments
                    onClick={toggleCommentsDrawer}
                    size={23.5}
                    color="rgb(0, 48, 89)"
                    style={{ cursor: "pointer" }}
                  />
                </Tooltip>

                {formData?.downloadAccess && (
                  <Tooltip title="Download Document">
                    <MdFileDownload
                      onClick={downloadDocument}
                      size={23.5}
                      color="rgb(0, 48, 89)"
                      style={{ cursor: "pointer" }}
                    />
                  </Tooltip>
                )}
                {activeModules?.includes("AI_FEATURES") && (
                  <Tooltip title="AI Features">
                    <GiStarShuriken
                      onClick={handleClickBot}
                      size={23.5}
                      color="#ff6600"
                      style={{ cursor: "pointer" }}
                    />
                  </Tooltip>
                )}

                <Tooltip title="People">
                  <IoPeople
                    onClick={togglePeopleDrawer}
                    size={23.5}
                    color="rgb(0, 48, 89)"
                    style={{ cursor: "pointer" }}
                  />
                </Tooltip>

                <Tooltip title="History">
                  <LuHistory
                    onClick={toggleHistoryDrawer}
                    size={23.5}
                    color="rgb(0, 48, 89)"
                    style={{ cursor: "pointer" }}
                  />
                </Tooltip>

                <Tooltip title="Doc Info">
                  <FaInfoCircle
                    onClick={toggleInfoDrawer}
                    size={23.5}
                    color="rgb(0, 48, 89)"
                    style={{ cursor: "pointer" }}
                  />
                </Tooltip>
              </div>
            </div>
            {/* <div style={{ flex: 1, paddingLeft: 16 }}> */}
            <Modal
              open={botModal}
              onCancel={handleCloseBotModal}
              footer={null} // No footer
              closeIcon={
                <CloseIcon style={{ width: "32px", height: "32px" }} />
              }
              className={classes1.summaryModal}
              centered // Ensures the modal is centered
              style={{
                top: 20, // Adjust this value as needed to position the modal
                width: "600px", // Fixed width of the modal
              }}
              width={600}
            >
              {isSummaryLoading ? (
                // <Spin tip="Generating Summary..." />
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="510px"
                >
                  <CircularProgressWithLabel value={progress} />
                </Box>
              ) : (
                <>
                  {formData?.documentLink?.endsWith(".pdf") ||
                  formData?.documentLink?.endsWith(".docx") ? (
                    <div
                      style={{
                        // whiteSpace: "pre-wrap",s
                        wordWrap: "break-word",
                        height: "520px", // Fixed height of the modal content area
                        overflowY: "auto",
                      }}
                      dangerouslySetInnerHTML={{ __html: summaryText }}
                    />
                  ) : (
                    <div
                      style={{
                        // whiteSpace: "pre-wrap",s
                        wordWrap: "break-word",
                        height: "220px", // Fixed height of the modal content area
                        overflowY: "auto",
                      }}
                      // dangerouslySetInnerHTML={{ __html: summaryText }}
                    >
                      {drawingMetaData?.drawingSummary}
                    </div>
                  )}
                </>
              )}
            </Modal>

            <Modal
              open={clauseModal}
              onCancel={() => setClauseModal(false)}
              footer={null} // No footer
              closeIcon={
                <CloseIcon style={{ width: "32px", height: "32px" }} />
              }
              className={classes1.summaryModal}
              centered // Ensures the modal is centered
              style={{
                top: 20, // Adjust this value as needed to position the modal
                width: "600px", // Fixed width of the modal
              }}
              width={600}
            >
              {clauseCompareLoading ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="510px"
                >
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <div
                    style={{
                      whiteSpace: "break-spaces",
                      height: "520px", // Fixed height of the modal content area
                      overflowY: "auto",
                    }}
                    dangerouslySetInnerHTML={{ __html: clauseResult }}
                  />
                </>
              )}
            </Modal>
            {isTemplateModalOpen && (
              <Modal
                open={isTemplateModalOpen}
                onCancel={() => setIsTemplateModalOpen(false)}
                footer={null} // No footer
                closeIcon={
                  <CloseIcon style={{ width: "32px", height: "32px" }} />
                }
                className={classes.templateModal}
                centered // Ensures the modal is centered
                style={{
                  top: 20, // Adjust this value as needed to position the modal
                  width: "400px", // Fixed width of the modal
                }}
                width={600} // Fixed width of the modal
                bodyStyle={{
                  padding: "20px", // Adds padding inside the modal content area
                }}
              >
                <>
                  <div style={{ marginBottom: "20px" }}>
                    <label htmlFor="topicTextArea">
                      Enter topic to generate new document:
                    </label>
                    <TextareaAutosize
                      id="topicTextArea"
                      minRows={3}
                      style={{ width: "100%" }}
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <Button
                      // variant="contained"
                      color="primary"
                      onClick={() => createTemplate(formData)}
                    >
                      Submit
                    </Button>
                  </div>
                </>
              </Modal>
            )}

            {!!mcqModal && (
              <Modal
                open={mcqModal}
                onCancel={handleCloseMcqModal}
                destroyOnClose
                key="modal1"
                footer={null} // No footer
                closeIcon={
                  <CloseIcon style={{ width: "32px", height: "32px" }} />
                }
                className={classes.botModal}
                centered // Ensures the modal is centered
                style={{
                  top: 20, // Adjust this value as needed to position the modal
                  width: "600px", // Fixed width of the modal
                }}
                width={600} // Fixed width of the modal
                bodyStyle={{
                  padding: "20px", // Adds padding inside the modal content area
                }}
              >
                {isMcqLoading ? (
                  <Spin tip="Generating MCQ..." />
                ) : (
                  <>
                    <h4>MCQ</h4>
                    <div className={classes1.app}>
                      {questions?.map((q: any, index: any) => (
                        <div key={index} className={classes1.questionBlock}>
                          <FormControl
                            component="fieldset"
                            className={classes1.formControl}
                          >
                            <FormLabel component="legend">
                              {q.question}
                            </FormLabel>
                            <RadioGroup
                              name={q.question}
                              value={answers[q.question] || ""}
                              onChange={(e) =>
                                handleOptionChange(q.question, e.target.value)
                              }
                            >
                              {q.options.map((option: any) => (
                                <FormControlLabel
                                  key={option}
                                  value={option}
                                  control={<Radio />}
                                  label={option}
                                />
                              ))}
                            </RadioGroup>
                          </FormControl>
                        </div>
                      ))}
                    </div>
                    <Button
                      color="primary"
                      onClick={() => {
                        handleQuizSubmit();
                      }}
                      disabled={!allAnswered}
                    >
                      Submit
                    </Button>
                  </>
                )}
              </Modal>
            )}

            {isResultLoading && (
              <div
                style={{
                  position: "fixed",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <CircularProgress />
              </div>
            )}

            {!!resultsModalOpen && (
              <Modal
                open={resultsModalOpen}
                closeIcon={
                  <CloseIcon style={{ width: "32px", height: "32px" }} />
                }
                onCancel={() => setResultsModalOpen(false)}
                destroyOnClose
                key="modal2"
                className={classes.botModal}
                footer={null} // No footer
                centered // Ensures the modal is centered
                style={{
                  top: 20, // Adjust this value as needed to position the modal
                  width: "600px", // Fixed width of the modal
                }}
                width={600} // Fixed width of the modal
                bodyStyle={{
                  padding: "20px", // Adds padding inside the modal content area
                }}
              >
                <div className={classes1.resultsContainer}>
                  <h2>
                    Your Score: {calculateScore()} / {questions?.length}
                  </h2>
                  {questions?.map((question: any, index: any) => (
                    <div key={index} className={classes1.questionBlock}>
                      <FormControl
                        component="fieldset"
                        className={classes1.formControl}
                      >
                        <FormLabel
                          component="legend"
                          style={{ color: "black !important" }}
                        >
                          {question.question}
                        </FormLabel>
                        <RadioGroup
                          name={question.question}
                          value={answers[question.question]}
                        >
                          {question.options.map((option: any) => (
                            <FormControlLabel
                              key={option}
                              value={option}
                              control={<Radio />}
                              label={
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    color: "black !important",
                                  }}
                                >
                                  {option}
                                  {answers[question.question] === option &&
                                    (answers[question.question] ===
                                    question.correct_answer ? (
                                      <MdCheck
                                        style={{
                                          color: "green",
                                          marginLeft: "5px",
                                        }}
                                      />
                                    ) : (
                                      <MdClear
                                        style={{
                                          color: "red",
                                          marginLeft: "5px",
                                        }}
                                      />
                                    ))}
                                  {answers[question.question] !==
                                    question.correct_answer &&
                                    option === question.correct_answer && (
                                      <MdCheck
                                        style={{
                                          color: "green",
                                          marginLeft: "5px",
                                        }}
                                      />
                                    )}
                                </div>
                              }
                              disabled
                            />
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </div>
                  ))}
                </div>
              </Modal>
            )}

            {!!clauseSelectionModal && (
              <ClauseSelectionModal
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                clauseSelectionModal={clauseSelectionModal}
                setClauseSelectionModal={setClauseSelectionModal}
                clauseTableData={clauseTableData}
                identifyClauses={identifyClauses}
              />
            )}
            <SelectionPopover
              target={target}
              handleSearch={handleSearchClick}
            />

            <MPopover
              id={id}
              open={Boolean(botPopover)}
              anchorEl={botPopover}
              onClose={handleCloseBot}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
            >
              {formData?.documentLink?.endsWith(".pdf") ||
              formData?.documentLink?.endsWith(".docx") ? (
                <List component="nav" aria-label="secondary mailbox folders">
                  {actionItemsForDocs.map((item: any, index: any) => (
                    <ListItem
                      button
                      className={classes.hoverStyle}
                      onClick={() => item.onClick(formData)}
                      key={index}
                    >
                      <ListItemText primary={item.text} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <List component="nav" aria-label="secondary mailbox folders">
                  {actionItemsForDrawings.map((item: any, index: any) => (
                    <ListItem
                      button
                      className={classes.hoverStyle}
                      onClick={() => item.onClick(formData)}
                      key={index}
                    >
                      <ListItemText primary={item.text} />
                    </ListItem>
                  ))}
                </List>
              )}
            </MPopover>

            {/* <p style={{ whiteSpace: "pre-line" }}>
                {!!docViewDrawer && docViewDrawer?.data?.documentName}
              </p>
              <div>{renderTag(formData.documentState)}</div> */}
            {/* </div> */}
            <>
              <div
                style={{
                  display: "flex", // Flexbox for horizontal layout
                  justifyContent: "space-between",
                  alignItems: "start", // Align items at the top
                  width: "100%",
                }}
              >
                {/* AI Metadata Panel on the left side */}
                {!!aiMetaData && isAiMetaDataModalOpen && (
                  <div
                    style={{
                      width: "30%", // Allocate 30% width for the AI Metadata panel
                      padding: "10px",
                      borderRight: "1px solid aliceblue", // Optional: Add border between metadata and document
                      overflowY: "auto",
                      maxHeight: "100vh", // Ensure it doesn't exceed viewport height
                    }}
                    className={classes1.dialogPaper} // Apply the modal's paper class if it contains common styling
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography
                        variant="h5"
                        style={{
                          color: "black",
                          padding: "5px 24px !important",
                        }}
                      >
                        AI Metadata
                      </Typography>
                      {/* Cross button for closing AI Metadata */}
                      <IconButton
                        onClick={() => setIsAiMetaDataModalOpen(false)}
                        style={{
                          width: "50px",
                          height: "36px",
                        }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </div>

                    {formData?.documentLink?.endsWith(".pdf") ||
                    formData?.documentLink?.endsWith(".docx") ? (
                      <>
                        {Object.keys(aiMetaData)
                          .filter(
                            (section) =>
                              aiMetaData[section] !== "None" &&
                              aiMetaData[section] !== ""
                          )
                          .map((section, index) => (
                            <div key={section}>
                              <div
                                className={classes1.sectionHeader}
                                onClick={() => handleToggle(section)}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "flex-start",
                                  cursor: "pointer",
                                  padding: "8px 10px",
                                  borderBottom: "1px solid #ddd", // Underline for the section header
                                  backgroundColor: "transparent", // No background color
                                }}
                              >
                                <Typography
                                  variant="h6"
                                  style={{
                                    fontSize: "1rem",
                                    fontWeight: "600",
                                    textDecoration: "underline ",
                                  }}
                                >
                                  {formatKey(section)}
                                </Typography>
                                <MdExpandMore
                                  style={{
                                    transform: expanded[section]
                                      ? "rotate(180deg)"
                                      : "rotate(0deg)",
                                    transition: "transform 0.3s",
                                    marginRight: "8px",
                                  }}
                                />
                              </div>
                              <Collapse
                                in={expanded[section]}
                                timeout="auto"
                                unmountOnExit
                              >
                                <div
                                  className={classes1.sectionContent}
                                  style={{ padding: "8px 12px" }}
                                  ref={ref}
                                  onMouseUp={handleMouseUp}
                                >
                                  {aiMetaData[section]
                                    .split(",")
                                    .map((item: any, index: any) => (
                                      <Typography
                                        key={index}
                                        variant="body1"
                                        style={{
                                          display: "block",
                                          padding: "4px 0",
                                        }}
                                      >
                                        {item.trim()}
                                      </Typography>
                                    ))}
                                </div>
                              </Collapse>
                            </div>
                          ))}
                      </>
                    ) : (
                      <>
                        {renderSection("Title", [
                          getCaseInsensitiveKey(
                            drawingMetaData?.metadataDrawing,
                            "Title"
                          ),
                        ])}
                        {renderSection("Summary", [
                          getCaseInsensitiveKey(
                            drawingMetaData?.metadataDrawing,
                            "Summary"
                          ),
                        ])}
                        {renderSection(
                          "Metadata",
                          getCaseInsensitiveKey(
                            drawingMetaData?.metadataDrawing,
                            "Metadata"
                          )
                        )}
                        {renderSection(
                          "Bill of Materials",
                          getCaseInsensitiveKey(
                            drawingMetaData?.metadataDrawing,
                            "Bill of Materials"
                          )
                        )}
                        {renderSection(
                          "Identified Features",
                          getCaseInsensitiveKey(
                            drawingMetaData?.metadataDrawing,
                            "Identified Features"
                          )
                        )}
                        {renderSection(
                          "Dimensions",
                          getCaseInsensitiveKey(
                            drawingMetaData?.metadataDrawing,
                            "Dimensions"
                          )
                        )}
                        {renderSection(
                          "Additional Features",
                          getCaseInsensitiveKey(
                            drawingMetaData?.metadataDrawing,
                            "Additional Features"
                          )
                        )}
                        {renderSection(
                          "Sub-Parts",
                          getCaseInsensitiveKey(
                            drawingMetaData?.metadataDrawing,
                            "Sub-Parts"
                          )
                        )}
                      </>
                    )}
                  </div>
                )}

                {isAiMetaDataModalOpen ? (
                  <div
                    style={{
                      width: aiMetaData ? "70%" : "100%",
                      padding: "10px",
                    }}
                  >
                    {isLoading ? (
                      <div
                        style={{ display: "flex", justifyContent: "center" }}
                      >
                        <CircularProgress />
                      </div>
                    ) : (
                      <DocumentViewer
                        fileLink={!!formData && formData?.documentLink}
                      />
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      width: "100%",
                    }}
                  >
                    {isLoading ? (
                      <div
                        style={{ display: "flex", justifyContent: "center" }}
                      >
                        <CircularProgress />
                      </div>
                    ) : (
                      <DocumentViewer
                        fileLink={!!formData && formData?.documentLink}
                      />
                    )}
                  </div>
                )}
              </div>
            </>
          </div>

          <div>
            {!!infoDrawer.open && (
              <InfoTopDrawer
                infoDrawer={infoDrawer}
                setInfoDrawer={setInfoDrawer}
                toggleInfoDrawer={toggleInfoDrawer}
                formData={!!formData && formData}
              />
            )}
          </div>
          <div>
            {!!historyDrawer.open && (
              <HistoryTopDrawer
                historyDrawer={historyDrawer}
                setHistoryDrawer={setHistoryDrawer}
                toggleHistoryDrawer={toggleHistoryDrawer}
                formData={formData}
                workflowHistoryTableData={workflowHistoryTableData}
                attachmentHistoryTableData={attachmentHistoryTableData}
              />
            )}
          </div>
          <div>
            {!!commentDrawer.open && (
              <CommentsDrawer
                commentDrawer={commentDrawer}
                setCommentDrawer={setCommentDrawer}
                toggleCommentsDrawer={toggleCommentsDrawer}
                formData={formData}
                handleCommentSubmit={handleCommentSubmit}
                commentData={comments}
                commentsLoader={commentsLoader}
                matches={matches}
              />
            )}
          </div>
          <div>
            {!!peopleDrawer.open && (
              <DocWorkflowTopDrawer
                peopleDrawer={peopleDrawer}
                setPeopleDrawer={setPeopleDrawer}
                togglePeopleDrawer={togglePeopleDrawer}
                docData={!!formData && formData}
              />
            )}
          </div>
        </Drawer>
      </div>
      <div>
        <Modal
          title={
            <>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "2px",
                }}
              >
                Enter Reason to Send for Edit ?
              </div>
              <div style={{ paddingTop: "10px" }}>
                <TextArea
                  rows={4}
                  onChange={(e) => {
                    setCommentValue(e.target.value);
                  }}
                  value={commnetValue}
                ></TextArea>
              </div>
            </>
          }
          // icon={<ErrorIcon />}
          open={openModalForComment}
          onOk={() => {}}
          onCancel={() => {
            // setOpenModal(false);
            setopenModalForComment(false);
          }}
          footer={[
            <Button
              key="submit"
              type="primary"
              style={{ backgroundColor: "#003059" }}
              onClick={() => {
                setopenModalForComment(false);
              }}
            >
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              style={{ backgroundColor: "#003059" }}
              onClick={async () => {
                await handleCommentSubmit(commnetValue);
                await handleSubmit("Send for Edit", true);
              }}
            >
              Submit
            </Button>,
          ]}
          // okText="Yes"
          okType="danger"
          // cancelText="No"
        />
      </div>
      <Modal
        open={riskAnalysisModal}
        onCancel={() => setRiskAnalysisModal(false)}
        footer={null}
        closeIcon={<CloseIcon style={{ fontSize: "24px" }} />}
        centered
        style={{
          top: 20,
          // width: "60%",
        }}
        width={"66%"}
      >
        {isRiskAnalysisLoading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "510px",
            }}
          >
            <Spin size="large" />
          </div>
        ) : riskAnalysisText?.data?.message ? (
          <div style={{ height: "520px", overflowY: "auto", padding: "16px" }}>
            <Form form={form}>
              <Form.Item
                name="category"
                style={{ marginBottom: "16px" }}
                rules={[
                  {
                    required: true,
                    message: "Please Select Risk Category!",
                  },
                ]}
              >
                <Select
                  placeholder="Select Category"
                  allowClear
                  style={{ width: "100%" }}
                  options={categoryOptions}
                  size="large"
                  listHeight={200}
                  value={selectedCategory} // Bind selected value
                  onChange={(value) => {
                    // console.log("Selected Category:", value);
                    setSelectedCategory(value);
                  }}
                />
              </Form.Item>
            </Form>
            <h3 style={{ fontWeight: "bold", marginBottom: "16px" }}>
              Suggested Risks
            </h3>
            {riskAnalysisText?.data?.suggestedHiras
              ?.filter(
                (hira: any) =>
                  hira.category.toLowerCase() ===
                  (
                    categoryOptions.find(
                      (cat: any) => cat._id === selectedCategory
                    )?.riskCategory || ""
                  ).toLowerCase()
              )

              ?.map((hira: any, hiraIndex: any) => {
                const tableData = hira.steps.map((step: any, index: any) => ({
                  key: `${hira.jobTitle}-${index}`,
                  basicStepOfJob: step.basicStepOfJob,
                  existingControlMeasure: step.existingControlMeasure,
                  hazardDescription: step.hazardDescription,
                  impactText: step.impactText,
                }));

                return (
                  <div key={hiraIndex} style={{ marginBottom: "24px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <h4 style={{ fontWeight: "bold", marginBottom: "8px" }}>
                        {hira.jobTitle}
                      </h4>
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => handleCreateHira()}
                      >
                        Add
                      </Button>
                    </div>
                    <Table
                      rowSelection={rowSelection}
                      columns={[
                        {
                          title: "Basic Step of Job",
                          dataIndex: "basicStepOfJob",
                          key: "basicStepOfJob",
                        },
                        {
                          title: "Existing Control Measure",
                          dataIndex: "existingControlMeasure",
                          key: "existingControlMeasure",
                        },
                        {
                          title: "Hazard Description",
                          dataIndex: "hazardDescription",
                          key: "hazardDescription",
                        },
                        {
                          title: "Impact",
                          dataIndex: "impactText",
                          key: "impactText",
                        },
                      ]}
                      dataSource={tableData}
                      pagination={false}
                      bordered
                    />
                  </div>
                );
              })}
          </div>
        ) : (
          <div style={{ height: "520px", overflowY: "auto", padding: "16px" }}>
            {/* Display the Answer */}
            {riskAnalysisText?.data?.answer && (
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ fontWeight: "bold", marginBottom: "8px" }}>
                  Analysis Summary:
                </h3>
                <div
                  style={{
                    backgroundColor: "#f9f9f9",
                    padding: "12px",
                    borderRadius: "8px",
                    whiteSpace: "pre-wrap",
                    lineHeight: "1.6",
                    fontSize: "14px",
                    border: "1px solid #ddd",
                  }}
                >
                  {riskAnalysisText.data.answer}
                </div>
              </div>
            )}

            {/* Display Unique HIRAs */}
            {riskAnalysisText?.data?.uniqueHiras?.length > 0 && (
              <div>
                <h3 style={{ fontWeight: "bold", marginBottom: "8px" }}>
                  Relevant HIRAs:
                </h3>
                <Table
                  columns={[
                    {
                      title: "Job Title",
                      dataIndex: "jobTitle",
                      key: "jobTitle",
                      render: (text, record) => (
                        <span
                          style={{
                            color: "#1890ff",
                            textDecoration: "underline",
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            window.open(
                              `/risk/riskregister/HIRA/${record.hiraId}`,
                              "_blank"
                            )
                          }
                        >
                          {text}
                        </span>
                      ),
                    },
                  ]}
                  dataSource={riskAnalysisText?.data?.uniqueHiras?.map(
                    (hira: any) => ({
                      key: hira.hiraId,
                      jobTitle: hira.jobTitle,
                      hiraId: hira.hiraId,
                    })
                  )}
                  pagination={false}
                  bordered
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DocumentViewDrawer;
