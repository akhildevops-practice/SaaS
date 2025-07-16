//react, react-router, recoil
import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useRecoilState, useRecoilValue, useResetRecoilState } from "recoil";
import {
  benefitData,
  auditCreationForm,
  cipFormData,
  drawerData,
  orgFormData,
  referencesData,
  cipTableDataState,
} from "recoil/atom";

//antd
import { Button, Drawer, Modal, Space, Tabs, Tour, TourProps } from "antd";

//material-ui
import {
  CircularProgress,
  Tooltip,
  useMediaQuery,
  Menu,
  MenuItem,
  IconButton,
  FormControl,
  InputLabel,
  Select,
} from "@material-ui/core";
import { MdPeople, MdChat, MdOutlineExpandMore } from "react-icons/md";
//utils
import getAppUrl from "utils/getAppUrl";
import axios from "apis/axios.global";
import getSessionStorage from "utils/getSessionStorage";


import CloseIconImageSvg from "assets/documentControl/Close.svg";
import DocInfoIconImageSvg from "assets/documentControl/Info.svg";
import ExpandIconImageSvg from "assets/documentControl/expand1.svg";

//thirdparty libs
import { useSnackbar } from "notistack";

//styles
import useStyles from "./style";
import "./new.css";
import CIPDetailsTopDrawer from "./CIPDetailsTopDrawer";
import CipDetailsTab from "./CipDetailsTab";
import checkRole from "utils/checkRoles";
import { API_LINK } from "config";
import StakeHolders from "./StakeHolders";
import CIPWorkflowTopDrawer from "./CIPWorkflowTopDrawer";
import TextArea from "antd/es/input/TextArea";
import CommentsDrawer from "./CommentsDrawer";
import getYearFormat from "utils/getYearFormat";
import CommonReferencesTab from "components/CommonReferencesComponents/CommonReferencesTab";

import BenifitAnalysis from "./BenifitAnalysis";

const CIPStateIdentifier: any = {
  "Send For Edit": "IN_EDIT",
  "Review Complete": "REVIEW_INPROGRESS",
  "Send For Review": "IN_REVIEW",
  "Save As Draft": "DRAFT",
  "Send For Approval": "IN_APPROVAL",
  "Send for Verification": "IN_VERIFICATION",
  Save: "SAVE",
  Approve: "APPROVAL_INPROGRESS",
  Closed: "CLOSED",
  Cancel: "CANCEL",
  Amend: "AMMEND",
  "Drop CIP": "DROP CIP",
};

type Props = {
  drawer?: any;
  setDrawer?: any;
  handleFetchCips?: any;
  deletedId?: any;
  isGraphSectionVisible?: any;
  readOnly?: any;
  setReadOnly?: any;
  handleCloseDrawer?: any;
  source?: any;
  getCipResponse?: any;
  // reloadGraphs?: any;
};

const CIPDrawer = ({
  drawer,
  setDrawer,
  handleFetchCips,
  deletedId,
  isGraphSectionVisible,
  readOnly,
  setReadOnly,
  handleCloseDrawer,
  source,
  getCipResponse,
}: // reloadGraphs,
Props) => {
  const [activeTabKey, setActiveTabKey] = useState<any>(1);
  const [detailsDrawer, setDetailsDrawer] = useState<any>(false);
  const [auditTrailDrawer, setAuditTrailDrawer] = useState<any>({
    open: false,
    data: {},
  });
  const [peopleDrawer, setPeopleDrawer] = useState<any>({
    open: false,
    data: {},
  });
  const [commentDrawer, setCommentDrawer] = useState<any>({
    open: false,
    data: {},
  });
  const realmName = getAppUrl();
  const navigate = useNavigate();
  const location = useLocation();
  const matches = useMediaQuery("(min-width:786px)");
  const classes = useStyles({
    isGraphSectionVisible: isGraphSectionVisible,
  });
  const { enqueueSnackbar } = useSnackbar();
  const orgData = useRecoilValue(orgFormData);
  // const { socket } = useContext<any>(SocketContext);

  const [formData, setFormData] = useRecoilState(cipFormData);
  const ResetFormData = useResetRecoilState(cipFormData);
  const [drawerDataState, setDrawerDataState] = useRecoilState(drawerData);
  const loggedInUser = JSON.parse(sessionStorage.getItem("userDetails") as any);
  const [cipForm, setCipForm] = useState<any>();
  const [workFlowForm, setWorkFlowForm] = useState<any>();
  const [uploadFileError, setUploadFileError] = useState<any>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<any>([]);
  const [disableFormFields, setDisableFormFields] = useState<any>(false);
  const [selectedReviewerFormData, setSelectedReviewerFormData] = useState<any>(
    []
  );
  const [selectedApproverFormData, setSelectedApproverFormData] = useState<any>(
    []
  );
  const [benefits, setBenefits] = useRecoilState(benefitData);
  const [template, setTemplate] = useRecoilState<any>(auditCreationForm);

  const [openModal, setOpenModal] = useState(false);
  const [noActItm, setNoActItem] = useState(false);
  const [urls, setUrls] = useState([]);
  const isOrgAdmin = checkRole("ORG-ADMIN");
  const [cancelWindow, setCancelWindow] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState("");
  const [refsData] = useRecoilState(referencesData);
  const [drawerSize, setDrawerSize] = useState<boolean>(false);
  const userDetails = getSessionStorage();
  const orgId = sessionStorage.getItem("orgId");
  const [commnetValue, setCommentValue] = useState("");
  const [openModalForComment, setopenModalForComment] = useState(false);
  const [openModalForDrop, setopenModalForDrop] = useState(false);
  const [openModalForEditComment, setopenModalForEditComment] = useState(false);
  const [commentsLoader, setCommentsLoader] = useState(false);
  const [comments, setComments] = useState<any>([]);
  const [currentYear, setCurrentYear] = useState<any>();
  const [tableData, setTableData] = useRecoilState(cipTableDataState);
  const [refreshChild, setRefreshChild] = useState(false);
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const [imgUrl, setImgUrl] = useState<any>();

  const onMenuClick = (e: any) => {
    if (CIPStateIdentifier[e] === "CANCEL") {
      setopenModalForComment(true);
    } else if (CIPStateIdentifier[e] === "IN_EDIT") {
      setopenModalForEditComment(true);
    } else if (CIPStateIdentifier[e] === "DROP CIP") {
      setopenModalForDrop(true);
    } else {
      handleSubmitForm(e);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCipFormCreated = (form: any) => {
    setCipForm(form);
  };
  const handleWorkFlowFormCreated = (form: any) => {
    setWorkFlowForm(form);
  };

  const isItemInDisableBtnFor = (disableBtnFor: any, item: any) => {
    return disableBtnFor.includes(item);
  };

  const organizationId =
    sessionStorage.getItem("orgId") !== null &&
    sessionStorage.getItem("orgId") !== "null"
      ? sessionStorage.getItem("orgId")
      : (orgData && orgData.organizationId) ||
        (orgData && orgData.id) ||
        undefined;

  const userInfo = JSON.parse(sessionStorage.getItem("userDetails") as string);
  const [avatar, setAvatar] = useState<any>(userInfo?.avatar);

  useEffect(() => {
    getYear();
  }, []);
  useEffect(() => {
    if (!location.pathname.includes("fullformview")) {
      setDrawerDataState({
        ...drawerDataState,
        items: items,
      });
    }
  }, [items]);

  useEffect(() => {
    if (deletedId || drawer?.mode === "edit") {
      setDrawerDataState({
        ...drawerDataState,
        id: deletedId ? deletedId : drawer?.data?.id,
        formMode: "edit",
      });

      !drawer?.toggle && getCIPData();
    } else if (drawer?.mode === "create") {
      const defaultButtonOptions = ["Save As Draft", "Send For Review"];
      const newItems = defaultButtonOptions?.map((item: any, index: any) => ({
        key: (index + 1).toString(),
        label: item,
      }));
      setItems([...defaultButtonOptions]);
      setDrawerDataState({
        ...drawerDataState,
        items: [...defaultButtonOptions],
        id: null,
        formMode: "create",
      });
      !drawer?.toggle && getData();
    }
  }, [deletedId, drawer?.open]);

  useEffect(() => {
    formData.status === "Cancel" || deletedId || readOnly === true
      ? setDisableFormFields(true)
      : setDisableFormFields(false);
  }, [loggedInUser, selectedApproverFormData]);

  const uploadAttachments = async (files: any) => {
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

      setUrls(response?.data);
      setFormData({
        ...formData,
        attachments: response?.data,
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
  // useEffect(() => {
  //   console.log("drawer from inbox", drawer);
  // }, [drawer.open]);
  const getReviewStatus = (option: string) => {
    let result: any[] = [...formData.reviewers];
    formData.reviewers.map((obj: any, index: any) => {
      if (userInfo.id === obj.id) {
        const updatedReviewers = [...formData.reviewers];
        updatedReviewers[index] = {
          ...updatedReviewers[index],
          reviewStatus: "complete",
        };
        result = updatedReviewers;
      }
    });
    return result;
  };
  useEffect(() => {
    const fetchImgUrl = async () => {
      try {
        if (process.env.REACT_APP_IS_OBJECT_STORAGE === "false") {
          // Use the direct URL when object storage is disabled
          // console.log("url", `${process.env.REACT_APP_API_URL}/${avatar}`);
          setImgUrl(`${process.env.REACT_APP_API_URL}/${avatar}`);
        } else {
          // Fetch the URL from object storage when enabled
          const url = await viewObjectStorageDoc(avatar);
          setImgUrl(url);
        }
      } catch (error) {
        console.error("Error fetching image URL:", error);
        // Handle error as needed (e.g., set a default URL or show an error message)
        setImgUrl(""); // Or set a fallback URL
      }
    };

    fetchImgUrl();
  }, [avatar]);
  const viewObjectStorageDoc = async (link: any) => {
    const response = await axios.post(`${API_LINK}/api/documents/viewerOBJ`, {
      documentLink: link,
    });
    return response.data;
  };
  const getApproveStatus = (option: string) => {
    let result: any[] = [...formData.approvers];
    formData.approvers.map((obj: any, index: any) => {
      if (userInfo.id === obj.id) {
        const updatedApprovers = [...formData.approvers];
        updatedApprovers[index] = {
          ...updatedApprovers[index],
          approveStatus: "complete",
        };
        result = updatedApprovers;
      }
    });
    return result;
  };

  useEffect(() => {
    if (noActItm) {
      handleSubmitForm("Save");
    }
  }, [noActItm]);
  const uploadData = async (files: any) => {
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

    const id = "CIP";
    let res: any;
    let comdinedData;
    try {
      if (newData.length > 0) {
        res = await axios.post(
          `${API_LINK}/api/mrm/objectStore/${id}?realm=${realmName}&locationName=${loggedInUser?.location?.locationName}`,
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
          "Your Organization has exceeded the licensed attachments - Please reach ProcessRidge to activate additional licenses. CIP will be saved without attachment"
        );
      } else {
        console.error("Error uploading data:", error);
        alert("An error occurred while uploading files. Please try again.");
      }
      return null;
    }
    return comdinedData;
  };
  const handleSubmitForm = async (option: string, submit = false) => {
    try {
      let uploadedData =
        formData?.files?.length > 0 ? await uploadData(formData?.files) : [];

      setFormData({
        ...formData,
        files: uploadedData,
        createdBy: { id: userInfo?.id, name: userInfo?.username },
        organizationId: organizationId,
      });
      await cipForm.validateFields();

      setUploadFileError(false);

      if (
        (!formData.approvers ||
          !formData.approvers.length ||
          !formData.reviewers ||
          !formData.reviewers.length) &&
        (CIPStateIdentifier[option] === "IN_REVIEW" ||
          CIPStateIdentifier[option] === "IN_APPROVAL")
      ) {
        if (formData.reviewers.length === 0) {
          enqueueSnackbar(`Please Select Reviewers`, {
            variant: "warning",
          });
        }

        if (formData.approvers.length === 0) {
          enqueueSnackbar(`Please Select Approvers`, {
            variant: "warning",
          });
        }

        return;
      }

      if (drawer?.mode === "create" || drawerDataState?.formMode === "create") {
        try {
          let formattedReferences: any = [];
          if (refsData && refsData.length > 0) {
            formattedReferences = refsData.map((ref: any) => ({
              refId: ref.refId,
              organizationId: orgId,
              type: ref.type,
              name: ref.name,
              comments: ref.comments,
              createdBy: userInfo.firstName + " " + userInfo.lastName,
              updatedBy: null,
              link: ref.link,
            }));
          }
          // let uploadedData =
          //   formData?.files?.length > 0
          //     ? await uploadData(formData?.files)
          //     : [];
          const res = await axios.post(`/api/cip/`, {
            ...formData,
            // files: uploadedData || [],
            createdBy: {
              id: userInfo?.id,
              name: userInfo.firstname + " " + userInfo.lastname,
              avatar: userInfo?.avatar,
            },
            location: {
              id: userInfo?.locationId,
              name: userInfo?.location?.locationName,
            },
            entity: userInfo.entity,
            year: currentYear,
            organizationId: organizationId,
            tangibleBenefits: tableData,
            refsData: formattedReferences,
            deleted: false,
            status:
              CIPStateIdentifier[option] === "DRAFT" ? "Draft" : "InReview",
          });
          if (res.status === 200 || res.status === 201) {
            if (!!drawer) {
              handleCloseModal();
              handleFetchCips();
            }
            if (res.data === "DuplicateTitle") {
              enqueueSnackbar(`CIP Name Already Exists`, {
                variant: "error",
              });
            } else {
              enqueueSnackbar(`CIP ${option} Successfully`, {
                variant: "success",
              });
            }
          }
        } catch (err: any) {
          if (err.response.status === 409) {
            enqueueSnackbar(`CIP Name Already Exists`, {
              variant: "error",
            });
          } else {
            enqueueSnackbar(`Request Failed, Code: ${err.response.status}`, {
              variant: "error",
            });
          }
          setIsLoading(false);
        }
      } else if (
        drawer?.mode === "edit" ||
        drawerDataState?.formMode === "edit" ||
        deletedId
      ) {
        try {
          let formattedReferences: any = [];

          if (refsData && refsData.length > 0) {
            formattedReferences = refsData.map((ref: any) => ({
              refId: ref.refId,
              organizationId: orgId,
              type: ref.type,
              name: ref.name,
              comments: ref.comments,
              createdBy: userInfo.firstName + " " + userInfo.lastName,
              updatedBy: null,
              link: ref.link,
            }));
          }

          let updatedStatus;
          let reviewStatus = [...formData.reviewers];
          let approveStatus = [...formData.approvers];

          if (CIPStateIdentifier[option] === "REVIEW_INPROGRESS") {
            reviewStatus = getReviewStatus(option);
          }
          if (CIPStateIdentifier[option] === "APPROVAL_INPROGRESS") {
            approveStatus = getApproveStatus(option);
          }

          if (
            option === "Save" &&
            formData.status === "Approved" &&
            formData.actionItems.length === 0 &&
            noActItm === false
          ) {
            setOpenModal(true);
          } else {
            if (
              CIPStateIdentifier[option] === "IN_VERIFICATION" &&
              !(formData.tangibleBenefits.length > 0)
            ) {
              enqueueSnackbar(`Please Add Verifiers`, {
                variant: "warning",
              });
              return;
            }
            setNoActItem(false);
            const res = await axios.put(`api/cip/${formData.id}`, {
              ...formData,
              status:
                CIPStateIdentifier[option] === "DRAFT"
                  ? "Draft"
                  : CIPStateIdentifier[option] === "IN_REVIEW" ||
                    CIPStateIdentifier[option] === "REVIEW_INPROGRESS"
                  ? "InReview"
                  : CIPStateIdentifier[option] === "IN_EDIT"
                  ? "Edit"
                  : CIPStateIdentifier[option] === "CANCEL"
                  ? "Cancel"
                  : CIPStateIdentifier[option] === "IN_VERIFICATION"
                  ? "InVerification"
                  : CIPStateIdentifier[option] === "DROP CIP"
                  ? "Dropped"
                  : CIPStateIdentifier[option] === "SAVE"
                  ? formData.status
                  : "InApproval",
              reviewers: reviewStatus,
              approvers: approveStatus,
              refsData: formattedReferences,
              // refsData: [...formData?.refsData, ...formattedReferences],
              tangibleBenefits: tableData || formData.tangibleBenefits,
            });
            if (res.status === 200 || res.status === 201) {
              setIsLoading(false);
              enqueueSnackbar(`CIP ${option} Successfully`, {
                variant: "success",
              });
              if (!!drawer) {
                if (source === "Inbox") {
                  handleCloseDrawer();
                } else {
                  handleCloseModal();
                  // setTemplate([]);
                  // setBenefits([])
                  handleFetchCips();
                  // reloadGraphs();
                }
              }
            }
          }
        } catch (err: any) {
          setIsLoading(false);
          enqueueSnackbar(`Request Failed ${err.response.status}`, {
            variant: "error",
          });
        }
      } else {
        return;
      }
    } catch (error: any) {
      if (
        error?.errorFields?.some((field: any) => field.name[0] === "uploader")
      ) {
        setUploadFileError(true);
      }
    }
  };
  const getData = async () => {
    setFormData({
      ...formData,
      title: "",
      targetDate: "",
      cipCategoryId: "",
      cipTeamId: "",
      cipTypeId: "",
      justification: "",
      cost: 0,
      tangibleBenefits: [],
      attachments: [],
      actionItems: [],
      status: "Save",
      year: "",
      location: "",
      createdBy: "",
      reviewers: [],
      approvers: [],
      refsData: [],
      cancellation: "",
      organizationId: "",
      files: [],
    });
    // } catch (err) {
    //   // enqueueSnackbar(`You are not a Creator in any Document Type`, {
    //   //   variant: "error",
    //   // });
    //   // handleCloseModal();
    // }
  };

  function isUserInApprovers(loggedInUser: any, approvers: any) {
    return approvers?.some(
      (approver: any) => approver.email === loggedInUser.email
    );
  }

  const getCIPData = async () => {
    function formatDate(inputDate: any) {
      if (inputDate != null) {
        const date = new Date(inputDate);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${year}-${month}-${day}`;
      }
      return "";
    }
    try {
      setIsLoading(true);
      const id = source === "Inbox" ? drawer?.data?._id : drawer?.data?.id;
      const res = await axios.get(
        `/api/cip/getCIPById/${deletedId ? deletedId : id}`
      );
      const buttonOptionsResponse = await axios.get(
        `api/cip/getActionButton/${deletedId ? deletedId : id}`
      );

      const disableBtnFor = ["In Review", "In Approval"];
      const newItems = buttonOptionsResponse?.data?.map(
        (option: any, index: any) => {
          const disabled =
            isItemInDisableBtnFor(disableBtnFor, option) ||
            isUserInApprovers(loggedInUser, formData?.approvers);
          return { key: (index + 1).toString(), label: option, disabled };
        }
      );
      const tempNewItems = newItems.map((item: any) => item.label);

      const NewmenuItems = tempNewItems.map((item: any, index: any) => (
        <MenuItem key={index + 1} onClick={() => onMenuClick(item)}>
          {item}
        </MenuItem>
      ));
      setItems([...tempNewItems]);
      setBenefits(res.data.tangibleBenefits);
      setTableData(res.data.tangibleBenefits);
      setFormData({
        id: res.data._id,
        title: res.data.title,
        targetDate: formatDate(res.data.targetDate),
        cipCategoryId: res.data.cipCategoryId,
        cipTeamId: res.data.cipTeamId,
        cipTypeId: res.data.cipTypeId,
        justification: res.data.justification,
        cost: res.data.cost,
        tangibleBenefits: res.data.tangibleBenefits,
        cipOrigin: res.data.cipOrigin,
        location: res.data.location,
        entity: res.data.entity,
        attachments: res.data.attachments,
        actionItems: res.data.actionItems,
        year: res.data.year,
        files: res.data.files,
        createdBy: res.data.createdBy,
        status: res.data.status,
        reviewers: res.data.reviewers || [],
        approvers: res.data.approvers || [],
        refsData: res.data.refsData,
        cancellation: res.data.cancellation,
        organizationId: res.data.organizationId,
        createdAt: res.data.createdAt,
        updatedAt: res.data.updatedAt,
        plannedStartDate: res.data.plannedStartDate,
        plannedEndDate: res.data.plannedEndDate,
        actualStartDate: res.data.actualStartDate,
        actualEndDate: res.data.actualEndDate,
        projectMembers: res.data.projectMembers,
        otherMembers: res.data.otherMembers,
        buttonStatusInDates:
          res.data.status === "DRAFT"
            ? false
            : res.data.status === "IN_REVIEW" ||
              res.data.status === "REVIEW_INPROGRESS"
            ? false
            : res.data.status === "IN_EDIT"
            ? false
            : res.data.status === "CANCEL"
            ? false
            : res.data.status === "SAVE"
            ? false
            : res.data.status === "Approved"
            ? true
            : res.data.status === "Complete"
            ? true
            : res.data.status === "InVerification"
            ? true
            : res.data.status === "InProgress"
            ? true
            : res.data.status === "Closed"
            ? true
            : false,

        cancellationButtonStatus:
          res.data.status === "DRAFT"
            ? false
            : res.data.status === "IN_REVIEW" ||
              res.data.status === "REVIEW_INPROGRESS"
            ? false
            : res.data.status === "IN_EDIT"
            ? false
            : res.data.status === "CANCEL"
            ? true
            : res.data.status === "SAVE"
            ? false
            : res.data.status === "Approved"
            ? false
            : formData.status === "Save"
            ? false
            : false,
      });
      setAvatar(res.data.createdBy?.avatar);
      setSelectedReviewerFormData([
        ...(res?.data?.reviewers?.map((item: any) => ({
          ...item,
          label: item.email,
          value: item.id,
        })) || []),
      ]);
      setSelectedApproverFormData([
        ...(res?.data?.approvers?.map((item: any) => ({
          ...item,
          label: item.email,
          value: item.id,
        })) || []),
      ]);

      setIsLoading(false);
    } catch (err) {
      console.error(err);
      // enqueueSnackbar(`Could not get Data, Check your internet connection`, {
      //   variant: "error",
      // });
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setDrawer({
      ...drawer,
      open: !drawer.open,
      data: {},
      status: refreshChild,
    });
    setTemplate([]);
    setBenefits([]);
    setReadOnly(false);
    ResetFormData();
    setTableData([]);
  };

  const toggleAuditTrailDrawer = (data: any = {}) => {
    setAuditTrailDrawer({
      ...auditTrailDrawer,
      open: !auditTrailDrawer.open,
      data: { ...data },
    });
  };
  const togglePeopleDrawer = (data: any = {}) => {
    setPeopleDrawer({
      ...peopleDrawer,
      open: !peopleDrawer.open,
      data: { ...data },
    });
  };

  const toggleDetailsDrawer = (data: any = {}) => {
    setDetailsDrawer({
      ...detailsDrawer,
      open: !detailsDrawer.open,
      data: { ...data },
    });
  };

  const onTabsChange = (key: string) => {
    setActiveTabKey(key);
  };

  const refForcipForm1 = useRef(null);
  const refForcipForm2 = useRef(null);
  const refForcipForm3 = useRef(null);
  const refForcipForm4 = useRef(null);
  const refForcipForm5 = useRef(null);
  const refForcipForm6 = useRef(null);
  const refForcipForm7 = useRef(null);
  const refForcipForm8 = useRef(null);
  const refForcipForm9 = useRef(null);
  const refForcipForm10 = useRef(null);
  const refForcipForm11 = useRef(null);
  const refForcipForm12 = useRef(null);
  const refForcipForm13 = useRef(null);
  const refForcipForm14 = useRef(null);
  const refForcipForm15 = useRef(null);
  const refForcipForm16 = useRef(null);
  const refForcipForm17 = useRef(null);
  const refForcipForm18 = useRef(null);

  const refForcipForm19 = useRef(null);
  const refForcipForm20 = useRef(null);
  const refForcipForm21 = useRef(null);
  const refForcipForm22 = useRef(null);
  const refForcipForm23 = useRef(null);
  const refForcipForm24 = useRef(null);
  const refForcipForm25 = useRef(null);

  const tabs = [
    {
      label: <div ref={refForcipForm1}>CIP Details</div>,
      key: 1,
      children: (
        <CipDetailsTab
          drawer={drawer}
          setDrawer={setDrawer}
          handleCipFormCreated={handleCipFormCreated}
          uploadFileError={uploadFileError}
          setUploadFileError={setUploadFileError}
          disableFormFields={disableFormFields}
          isEdit={drawer?.mode === "create" ? false : true}
          activeTabKey={activeTabKey}
          template={template}
          setTemplate={setTemplate}
          benefits={benefits}
          setBenefits={setBenefits}
          refForcipForm2={refForcipForm2}
          refForcipForm3={refForcipForm3}
          refForcipForm4={refForcipForm4}
          refForcipForm5={refForcipForm5}
          refForcipForm6={refForcipForm6}
          refForcipForm7={refForcipForm7}
        />
      ),
    },
    {
      label: <div ref={refForcipForm8}>Benefit Analysis</div>,
      key: 2,
      children: (
        <BenifitAnalysis
          disableFormFields={disableFormFields}
          setRefreshChild={setRefreshChild}
          refForcipForm9={refForcipForm9}
          refForcipForm10={refForcipForm10}
          refForcipForm11={refForcipForm11}
          refForcipForm12={refForcipForm12}
          refForcipForm13={refForcipForm13}
          refForcipForm14={refForcipForm14}
          refForcipForm15={refForcipForm15}
          refForcipForm16={refForcipForm16}
          refForcipForm17={refForcipForm17}
        />
      ),
    },
    {
      label: <div ref={refForcipForm18}>Stake holders</div>,
      key: 3,
      children: (
        <StakeHolders
          drawer={drawer}
          setDrawer={setDrawer}
          handleCipFormCreated={handleCipFormCreated}
          workFlowForm={workFlowForm}
          setWorkFlowForm={setWorkFlowForm}
          handleWorkFlowFormCreated={handleWorkFlowFormCreated}
          // isWorkflowValid={isWorkflowValid}
          // setIsWorkflowValid={setIsWorkflowValid}
          disableFormFields={disableFormFields}
          selectedReviewerFormData={selectedReviewerFormData}
          setSelectedReviewerFormData={setSelectedReviewerFormData}
          selectedApproverFormData={selectedApproverFormData}
          setSelectedApproverFormData={setSelectedApproverFormData}
          isEdit={drawer?.mode === "create" ? false : true}
          refForcipForm19={refForcipForm19}
          refForcipForm20={refForcipForm20}
          refForcipForm21={refForcipForm21}
          refForcipForm22={refForcipForm22}
        />
      ),
    },
    {
      label: <div ref={refForcipForm23}>References</div>,
      key: 4,
      children: (
        <CommonReferencesTab
          drawer={drawer}
          disableFormFields={disableFormFields}
          refForcipForm24={refForcipForm24}
        />
      ),
    },
  ];
  const initials =
    drawer?.mode === "create"
      ? userInfo.firstname
          ?.split(" ")
          ?.map((name: any) => name[0])
          ?.slice(0, 2)
          ?.join("")
      : formData?.createdBy?.name
          ?.split(" ")
          ?.map((name: any) => name[0])
          ?.slice(0, 2)
          ?.join("");
  const dept =
    drawer?.mode === "create"
      ? userInfo.entity?.entityName
      : formData?.entity?.entityName
          ?.split(" ")
          ?.map((name: any) => name[0])
          ?.slice(0, 2)
          ?.join("");
  const toggleCommentsDrawer = (data: any = {}) => {
    setCommentDrawer({
      ...commentDrawer,
      open: !commentDrawer.open,
      data: { ...data },
    });
    getComments();
  };

  const handleCommentSubmit = async (value: string) => {
    setCommentsLoader(true);
    if (value) {
      try {
        let res = await axios.post("/api/cip/createCIPDocumentComments", {
          cipId: formData?.id,
          userId: userInfo.id,
          commentBy: userInfo.firstname + " " + userInfo.lastname,
          commentText: value,
        });
        setCommentsLoader(false);
        enqueueSnackbar(`Comment Added Successfully`, { variant: "success" });
        getComments();
      } catch (err: any) {
        enqueueSnackbar(`Request Failed, Code: ${err.response.status}`, {
          variant: "success",
        });
        setCommentsLoader(false);
      }
      setCommentValue("");
    } else {
      enqueueSnackbar(`Enter a comment`, { variant: "warning" });
    }
  };

  const getComments = async () => {
    setCommentsLoader(true);
    try {
      let res: any = await axios.get(
        `/api/cip/getCIPDocumentCommentsById/${formData?.id}`
      );
      setComments(res.data);
      setCommentsLoader(false);
    } catch (err) {
      enqueueSnackbar(
        `Could not get Comments, Check your internet connection`,
        { variant: "error" }
      );
      setCommentsLoader(false);
    }
  };

  const getStatusColor = (status: any) => {
    switch (status) {
      case "Approved":
        return "#7cbf3f";
      case "Cancel":
        return "#FF0000";
      case "InReview":
        return "#F2BB00";
      case "Review Complete":
        return "#F2BB00";
      case "InApproval":
        return "#FB8500";
      case "Approved":
        return "#7CBF3F";
      case "Draft":
        return "#0075A4";
      case "Edit":
        return "#0075A4";
      case "InVerification":
        return "#007579";
      case "Complete":
        return "#7cbf3f";
      case "Closed":
        return "#FF0000";
      case "InProgress":
        return "#7DCEA0";
      case "Save":
        return "#F2BB00";
      default:
        return "";
    }
  };

  const getYear = async () => {
    const currentyear = await getYearFormat(new Date().getFullYear());
    setCurrentYear(currentyear);
  };

  //help tour

  const [openTourForCipForm, setOpenTourForCipForm] = useState<boolean>(false);

  const stepsForCipForm: TourProps["steps"] = [
    {
      title: "CIP Details",
      description: "",

      target: () => refForcipForm1.current,
    },
    {
      title: "CIP Title",
      description: " ",
      target: () => refForcipForm2.current,
    },
    {
      title: "CIP Category",
      description: "",
      target: () => refForcipForm3.current,
    },
    {
      title: "CIP Methodology",
      description: "",

      target: () => refForcipForm4.current,
    },
    {
      title: "CIP Origin:",
      description: "",

      target: () => refForcipForm5.current,
    },
    {
      title: "Planned Start Date",
      description: " ",
      target: () => refForcipForm6.current,
    },
    {
      title: "Planned End Date:",
      description: "",
      target: () => refForcipForm7.current,
    },
    {
      title: "Benefit Analysis",
      description: "",

      target: () => refForcipForm8.current,
    },

    {
      title: "Justification & Intangible Benefits",
      description: " ",
      target: () => refForcipForm9.current,
    },

    {
      title: "Project Cost",
      description: "",
      target: () => refForcipForm10.current,
    },
    {
      title: "Add Button",
      description: " ",
      target: () => refForcipForm11.current,
    },

    {
      title: "Benefit Area",
      description: "",
      target: () => refForcipForm12.current,
    },
    {
      title: "Benefit Type",
      description: "",

      target: () => refForcipForm13.current,
    },

    {
      title: "Metric",
      description: " ",
      target: () => refForcipForm14.current,
    },

    {
      title: "UOM",
      description: "",
      target: () => refForcipForm15.current,
    },
    {
      title: "Select Verifier",
      description: " ",
      target: () => refForcipForm16.current,
    },

    {
      title: "Submit Button",
      description: "",
      target: () => refForcipForm17.current,
    },

    {
      title: "Stake holders",
      description: "",
      target: () => refForcipForm18.current,
    },
    {
      title: "Project Leader(s)/Reviewer(s)",
      description: "",

      target: () => refForcipForm19.current,
    },

    {
      title: "Project Champion(s)/Approver(s)",
      description: " ",
      target: () => refForcipForm20.current,
    },

    {
      title: "Project Members",
      description: "",
      target: () => refForcipForm21.current,
    },
    {
      title: "Other Project Members",
      description: " ",
      target: () => refForcipForm22.current,
    },

    {
      title: "References",
      description: "",
      target: () => refForcipForm23.current,
    },

    {
      title: "Search",
      description: " ",
      target: () => refForcipForm24.current,
    },

    {
      title: "Actions",
      description: "",
      target: () => refForcipForm25.current,
    },
  ];

  // for mobile tab select design

  const [selectedValue, setSelectedValue] = useState("Details");
  // console.log("selectedValue", selectedValue);
  const handleDataChange = (e: any) => {
    setSelectedValue(e.target.value);
  };

  return (
    <div>
      {deletedId ? (
        <div>
          {isLoading ? (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </div>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "row" }}>
                <div
                  className={classes.tabsWrapper}
                  style={{ minWidth: "60%" }}
                >
                  <Tabs
                    defaultActiveKey="1"
                    onChange={(key) => {
                      onTabsChange(key);
                    }}
                    activeKey={activeTabKey}
                    type="card"
                    items={tabs as any}
                    animated={{ inkBar: true, tabPane: true }}
                  />
                </div>

                <div style={{ paddingBottom: "50px" }}>
                  {/* <Avatar src={`${API_LINK}/${userInfo.avatar}`} alt="profile">
                    {initials / dept}
                  </Avatar> */}
                  <img
                    src={imgUrl}
                    alt="hello"
                    width="35px"
                    height="35px"
                    style={{ borderRadius: "20px" }}
                  />
                </div>
              </div>
              <div>
                {!!detailsDrawer && (
                  <CIPDetailsTopDrawer
                    detailsDrawer={detailsDrawer}
                    setDetailsDrawer={setDetailsDrawer}
                    formData={formData}
                    toggleDetailsDrawer={toggleDetailsDrawer}
                    currentYear={currentYear}
                  />
                )}
              </div>
              {/* <div>
                  {!!auditTrailDrawer.open && (
                    <AuditTrailDrawer
                      auditTrailDrawer={auditTrailDrawer}
                      setAuditTrailDrawer={setAuditTrailDrawer}
                      toggleAuditTrailDrawer={toggleAuditTrailDrawer}
                    />
                  )}
                </div> */}
              <div>
                {!!peopleDrawer.open && (
                  <CIPWorkflowTopDrawer
                    peopleDrawer={peopleDrawer}
                    setPeopleDrawer={setPeopleDrawer}
                    togglePeopleDrawer={togglePeopleDrawer}
                    formData={!!formData && formData}
                  />
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className={classes.drawer}>
          <Drawer
            title={
              matches
                ? drawer?.mode === "create"
                  ? "Add CIP"
                  : "Edit CIP"
                : ""
            }
            placement="right"
            open={drawer?.open}
            maskClosable={false}
            closeIcon={
              <img
                src={CloseIconImageSvg}
                alt="close-drawer"
                style={{ width: "36px", height: "38px", cursor: "pointer" }}
              />
            }
            // closable={false}
            onClose={source === "Inbox" ? handleCloseDrawer : handleCloseModal}
            className={classes.drawer}
            // width={}
            // width={isSmallScreen ? "85%" : "45%"}
            width={matches ? (drawerSize ? "100%" : "55%") : "90%"}
            style={{ transform: "none !important" }}
            extra={
              <div style={{ display: "flex", alignItems: "center" }}>
                {/* <div
                  style={{
                    display: "flex",
                    marginTop: "5px",
                    marginRight: "30px",
                  }}
                >
                  <Tooltip title="Help Tours!">
                    <TouchAppIcon
                      style={{ cursor: "pointer", color: "#0E497A" }}
                      onClick={() => {
                        setOpenTourForCipForm(true);
                      }}
                    />
                  </Tooltip>
                </div> */}

                {/* {matches ? ( */}
                <div style={{ paddingRight: matches ? "8px" : "5px" }}>
                  {tabs.length > 1 && (
                    <span
                      style={{
                        display: "inline-block",
                        // marginBottom: "10px",
                        backgroundColor: getStatusColor(formData?.status),
                        textAlign: "center",
                        width: matches ? "105px" : "60px",
                        fontSize: matches ? "16px" : " 12px",
                        padding: "5px 0px",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: "5px",
                        color: "white",
                        marginRight: matches ? "30px" : "0px",
                      }}
                    >
                      {formData?.status}
                    </span>
                  )}
                </div>
                {/* ) : (
                  ""
                )} */}
                <Tooltip title="View Creator, Reviewer(S) and Approver(S)">
                  <MdPeople
                    onClick={togglePeopleDrawer}
                    className={classes.auditTrailIcon}
                    style={{ marginRight: matches ? "30px" : "3px" }}
                  ></MdPeople>
                </Tooltip>

                <Tooltip title="Add/View Comments">
                  <IconButton
                    style={{ padding: 0, margin: 0 }}
                    disabled={drawer?.mode === "create"}
                  >
                    <MdChat
                      className={classes.commentsIcon}
                      onClick={toggleCommentsDrawer}
                      style={{ marginRight: matches ? "30px" : "3px" }}
                    />
                  </IconButton>
                </Tooltip>

                <Tooltip title="View CIP Details">
                  <img
                    src={DocInfoIconImageSvg}
                    alt="doc-info"
                    onClick={toggleDetailsDrawer}
                    className={classes.docInfoIcon}
                    style={{ marginRight: matches ? "30px" : "3px" }}
                  />
                </Tooltip>
                {matches ? (
                  <Tooltip title={drawerSize ? "Shrink Form" : "Expand Form"}>
                    <img
                      src={ExpandIconImageSvg}
                      alt="expand=form"
                      // onClick={() => navigate(`/processdocuments/fullformview`)}
                      onClick={() => setDrawerSize(!drawerSize)}
                      className={classes.expandIcon}
                    />
                  </Tooltip>
                ) : (
                  ""
                )}
                <Space>
                  {/* <Button >Cancel</Button> */}
                  <Button
                    onClick={handleClick}
                    style={{ display: "flex", alignItems: "center" }}
                    disabled={
                      items?.length === 0 || formData.status === "Cancel"
                    }
                    ref={refForcipForm25}
                  >
                    <span style={{ fontWeight: "bold" }}>
                      {selectedItem || "Actions"}
                    </span>
                    <MdOutlineExpandMore
                      style={{
                        fill: `${items?.length === 0 ? "gray" : "#0e497a"}`,
                      }}
                    />
                  </Button>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                  >
                    {items &&
                      items.length > 0 &&
                      items?.map((item: any, index: any) => (
                        <MenuItem
                          key={index + 1}
                          onClick={() => onMenuClick(item)}
                          // disabled={
                          //   item === "In Approval" || item === "In Review"
                          // }
                        >
                          {item}
                        </MenuItem>
                      ))}
                  </Menu>

                  {/* <Dropdown menu={{ items, onClick: onMenuClick }}>
                    <Button style={{ display: "flex", alignItems: "center" }}>
                      <span>Actions</span>

                      <MdOutlineExpandMore />
                    </Button>
                  </Dropdown> */}
                </Space>
              </div>
            }
          >
            {/* {matches ? (
              ""
            ) : (
              <div
                style={{
                  display: "flex",
                  justifyContent: "end",
                  width: "100%",
                  marginBottom: "10px",
                }}
              >
                {tabs.length > 1 && (
                  <span
                    style={{
                      display: "inline-block",
                      // marginBottom: "10px",
                      backgroundColor: getStatusColor(formData?.status),
                      textAlign: "center",
                      width: matches ? "105px" : "60px",
                      fontSize: matches ? "16px" : " 12px",
                      padding: "5px 0px",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: "5px",
                      color: "white",
                      marginRight: matches ? "30px" : "0px",
                    }}
                  >
                    {formData?.status}
                  </span>
                )}
              </div>
            )} */}
            {isLoading ? (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <CircularProgress />
              </div>
            ) : (
              <>
                <div
                  className={classes.tabsWrapper}
                  style={{ position: "relative" }}
                >
                  {matches ? (
                    <Tabs
                      defaultActiveKey="1"
                      onChange={(key) => {
                        onTabsChange(key);
                      }}
                      activeKey={activeTabKey}
                      type="card"
                      items={tabs as any}
                      animated={{ inkBar: true, tabPane: true }}
                    />
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
                          <MenuItem value={"Details"}>
                            <div
                              style={{
                                backgroundColor:
                                  selectedValue === "Details"
                                    ? "#3576BA"
                                    : "white",
                                textAlign: "center",
                                padding: "5px 10px",
                                borderRadius: "5px",
                                color:
                                  selectedValue === "Details"
                                    ? "white"
                                    : "black",
                              }}
                            >
                              {" "}
                              CIP Details
                            </div>
                          </MenuItem>
                          <MenuItem value={"Analyse"}>
                            {" "}
                            <div
                              style={{
                                backgroundColor:
                                  selectedValue === "Analyse"
                                    ? "#3576BA"
                                    : "white",
                                textAlign: "center",
                                padding: "5px 10px",
                                borderRadius: "5px",
                                color:
                                  selectedValue === "Analyse"
                                    ? "white"
                                    : "black",
                              }}
                            >
                              Benefit Analysis
                            </div>
                          </MenuItem>
                          <MenuItem value={"Stake"}>
                            <div
                              style={{
                                backgroundColor:
                                  selectedValue === "Stake"
                                    ? "#3576BA"
                                    : "white",
                                textAlign: "center",
                                padding: "5px 10px",
                                borderRadius: "5px",
                                color:
                                  selectedValue === "Stake" ? "white" : "black",
                              }}
                            >
                              Stake holders
                            </div>
                          </MenuItem>
                          <MenuItem value={"Reference"}>
                            <div
                              style={{
                                backgroundColor:
                                  selectedValue === "Reference"
                                    ? "#3576BA"
                                    : "white",
                                textAlign: "center",
                                padding: "5px 10px",
                                borderRadius: "5px",
                                color:
                                  selectedValue === "Reference"
                                    ? "white"
                                    : "black",
                              }}
                            >
                              References
                            </div>
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </div>
                  )}

                  {matches ? (
                    ""
                  ) : (
                    <div>
                      {selectedValue === "Details" ? (
                        <div style={{ marginTop: "20px" }}>
                          {" "}
                          <CipDetailsTab
                            drawer={drawer}
                            setDrawer={setDrawer}
                            handleCipFormCreated={handleCipFormCreated}
                            uploadFileError={uploadFileError}
                            setUploadFileError={setUploadFileError}
                            disableFormFields={disableFormFields}
                            isEdit={drawer?.mode === "create" ? false : true}
                            activeTabKey={activeTabKey}
                            template={template}
                            setTemplate={setTemplate}
                            benefits={benefits}
                            setBenefits={setBenefits}
                            refForcipForm2={refForcipForm2}
                            refForcipForm3={refForcipForm3}
                            refForcipForm4={refForcipForm4}
                            refForcipForm5={refForcipForm5}
                            refForcipForm6={refForcipForm6}
                            refForcipForm7={refForcipForm7}
                          />
                        </div>
                      ) : (
                        ""
                      )}

                      {selectedValue === "Analyse" ? (
                        <div style={{ marginTop: "20px" }}>
                          <BenifitAnalysis
                            disableFormFields={disableFormFields}
                            setRefreshChild={setRefreshChild}
                            refForcipForm9={refForcipForm9}
                            refForcipForm10={refForcipForm10}
                            refForcipForm11={refForcipForm11}
                            refForcipForm12={refForcipForm12}
                            refForcipForm13={refForcipForm13}
                            refForcipForm14={refForcipForm14}
                            refForcipForm15={refForcipForm15}
                            refForcipForm16={refForcipForm16}
                            refForcipForm17={refForcipForm17}
                          />
                        </div>
                      ) : (
                        ""
                      )}

                      {selectedValue === "Stake" ? (
                        <div style={{ marginTop: "20px" }}>
                          {" "}
                          <StakeHolders
                            drawer={drawer}
                            setDrawer={setDrawer}
                            handleCipFormCreated={handleCipFormCreated}
                            workFlowForm={workFlowForm}
                            setWorkFlowForm={setWorkFlowForm}
                            handleWorkFlowFormCreated={
                              handleWorkFlowFormCreated
                            }
                            // isWorkflowValid={isWorkflowValid}
                            // setIsWorkflowValid={setIsWorkflowValid}
                            disableFormFields={disableFormFields}
                            selectedReviewerFormData={selectedReviewerFormData}
                            setSelectedReviewerFormData={
                              setSelectedReviewerFormData
                            }
                            selectedApproverFormData={selectedApproverFormData}
                            setSelectedApproverFormData={
                              setSelectedApproverFormData
                            }
                            isEdit={drawer?.mode === "create" ? false : true}
                            refForcipForm19={refForcipForm19}
                            refForcipForm20={refForcipForm20}
                            refForcipForm21={refForcipForm21}
                            refForcipForm22={refForcipForm22}
                          />
                        </div>
                      ) : (
                        ""
                      )}

                      {selectedValue === "Reference" ? (
                        <div style={{ marginTop: "20px" }}>
                          {" "}
                          <CommonReferencesTab
                            drawer={drawer}
                            disableFormFields={disableFormFields}
                            refForcipForm24={refForcipForm24}
                          />
                        </div>
                      ) : (
                        ""
                      )}
                    </div>
                  )}

                  {matches ? (
                    <div>
                      <div
                        style={{
                          position: "absolute",
                          top: "2px",
                          right: "10px",
                          display: "flex",
                          flexDirection: "row",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "40px",
                            width: "130px",
                            gap: "8px",
                          }}
                        >
                          <div
                            style={{ marginTop: "4px", paddingBottom: "10px" }}
                          >
                            {/* <Avatar
                              src={`${API_LINK}/${
                                drawer?.mode === "create"
                                  ? userInfo.avatar
                                  : formData?.createdBy?.avatar
                              }`}
                              alt="profile"
                            >
                              {initials}
                            </Avatar> */}
                            <img
                              src={imgUrl}
                              alt="hello"
                              width="35px"
                              height="35px"
                              style={{ borderRadius: "20px" }}
                            />
                          </div>
                          <div style={{ fontSize: "12px" }}>
                            <p style={{ margin: "0" }}>
                              {drawer?.mode === "create"
                                ? userInfo.username
                                : formData?.createdBy?.name}
                            </p>
                            <p style={{ margin: "0" }}>
                              {drawer?.mode === "create"
                                ? userInfo.entity?.entityName
                                : formData?.entity?.entityName}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                </div>

                <div>
                  {!!detailsDrawer && (
                    <CIPDetailsTopDrawer
                      detailsDrawer={detailsDrawer}
                      setDetailsDrawer={setDetailsDrawer}
                      formData={formData}
                      toggleDetailsDrawer={toggleDetailsDrawer}
                      currentYear={currentYear}
                    />
                  )}
                </div>
                {/* <div>
                  {!!auditTrailDrawer.open && (
                    <AuditTrailDrawer
                      auditTrailDrawer={auditTrailDrawer}
                      setAuditTrailDrawer={setAuditTrailDrawer}
                      toggleAuditTrailDrawer={toggleAuditTrailDrawer}
                    />
                  )}
                </div> */}
                <div>
                  {!!peopleDrawer.open && (
                    <CIPWorkflowTopDrawer
                      peopleDrawer={peopleDrawer}
                      setPeopleDrawer={setPeopleDrawer}
                      togglePeopleDrawer={togglePeopleDrawer}
                      formData={!!formData && formData}
                    />
                  )}
                </div>
              </>
            )}
          </Drawer>
        </div>
      )}

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
                Enter Reason for Cancellation ?
              </div>
              <div style={{ paddingTop: "10px" }}>
                <TextArea
                  rows={4}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      cancellation: e.target.value,
                    });
                  }}
                  value={formData?.cancellation}
                ></TextArea>
              </div>
            </>
          }
          // icon={<ErrorIcon />}
          open={openModalForComment}
          onOk={() => {}}
          onCancel={() => {
            setopenModalForComment(false);
          }}
          footer={[
            <Button
              key="submit"
              type="primary"
              style={{ backgroundColor: "#003059" }}
              onClick={() => {
                setopenModalForComment(false);
                //handleSubmitForm(formData?.status);
              }}
            >
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              style={{ backgroundColor: "#003059" }}
              onClick={() => {
                if (formData?.cancellation) {
                  handleSubmitForm("Cancel");
                } else {
                  enqueueSnackbar(`Please Enter Reason for Cancellation`, {
                    variant: "warning",
                  });
                }
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
                Enter Reason for Drop ?
              </div>
              <div style={{ paddingTop: "10px" }}>
                <TextArea
                  rows={1}
                  autoSize={{ minRows: 3, maxRows: 6 }}
                  placeholder="Enter Dropped Reasons"
                  size="large"
                  name="dropReason"
                  onChange={(e: any) => {
                    setFormData({
                      ...formData,
                      dropReason: e.target.value,
                    });
                  }}
                  value={formData?.dropReason}
                />
              </div>
            </>
          }
          // icon={<ErrorIcon />}
          open={openModalForDrop}
          onOk={() => {}}
          onCancel={() => {
            setopenModalForDrop(false);
          }}
          footer={[
            <Button
              key="submit"
              type="primary"
              style={{ backgroundColor: "#003059" }}
              onClick={() => {
                setopenModalForDrop(false);
                //handleSubmitForm(formData?.status);
              }}
            >
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              style={{ backgroundColor: "#003059" }}
              onClick={() => {
                if (formData?.dropReason) {
                  handleSubmitForm("Drop CIP");
                } else {
                  enqueueSnackbar(`Please Enter Reason for Drop`, {
                    variant: "warning",
                  });
                }
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
                Enter Reason for Send for Edit ?
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
          open={openModalForEditComment}
          onOk={() => {}}
          onCancel={() => {
            setopenModalForEditComment(false);
          }}
          footer={[
            <Button
              key="submit"
              type="primary"
              style={{ backgroundColor: "#003059" }}
              onClick={() => {
                setopenModalForEditComment(false);
                //handleSubmitForm(formData?.status);
              }}
            >
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              style={{ backgroundColor: "#003059" }}
              onClick={() => {
                if (commnetValue) {
                  handleCommentSubmit("Reason For Edit : " + commnetValue);
                  handleSubmitForm("Send For Edit");
                  setopenModalForEditComment(false);
                } else {
                  handleCommentSubmit(commnetValue);
                }
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
      <div>
        <Modal
          title={
            <div
              style={{
                display: "block", // Change from "inline-flex" to "block"
                alignItems: "center",
                padding: "2px",
              }}
            >
              <p>No Action Items available for this CIP.</p>
              <p>
                You will{" "}
                <span
                  style={{
                    color: "red",
                    fontWeight: "bold",
                    textDecoration: "underline",
                    fontSize: "1.2em",
                  }}
                >
                  NOT
                </span>{" "}
                be able to add Action Items if you proceed.
              </p>
              <p>Do you want to proceed?</p>
            </div>
          }
          // icon={<ErrorIcon />}
          open={openModal}
          onOk={() => {
            setNoActItem(true);
            setOpenModal(false);
          }}
          onCancel={() => {
            setOpenModal(false);
          }}
          // okText="Yes"
          okType="danger"
          // cancelText="No"
        />
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
          />
        )}
      </div>

      <Tour
        open={openTourForCipForm}
        onClose={() => setOpenTourForCipForm(false)}
        steps={stepsForCipForm}
      />
    </div>
  );
};

export default CIPDrawer;