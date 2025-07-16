//react, reactrouter
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

//antd
import { Tabs, Drawer, Space, Button, Tooltip } from "antd";

//material-ui
import {
  Menu,
  MenuItem,
  useMediaQuery,
  CircularProgress,
} from "@material-ui/core";
import { MdChat } from 'react-icons/md';
import { MdOutlineExpandMore } from 'react-icons/md';

//utils
import axios from "apis/axios.global";
import { API_LINK } from "config";
import getAppUrl from "utils/getAppUrl";
import checkRoles from "utils/checkRoles";
import getSessionStorage from "utils/getSessionStorage";

//styles
import useStyles from "./styles";
import "./drawer.css";

//components
import AttachmetsTab from "components/RiskRegister/RiskDrawer/AttachmentsTab";
import PreMitigationScoreModal from "components/RiskRegister/RiskDrawer/PreMitigationScoreModal";
import CommentsDrawer from "components/RiskRegister/RiskDrawer/CommentsDrawer";
import CreateRiskFormTab from "components/RiskRegister/RiskDrawer/CreateRiskFormTab";
import WorkflowTab from "components/RiskRegister/RiskDrawer/WorkflowTab";
import InfoTopDrawer from "components/RiskRegister/RiskDrawer/InfoTopDrawer";
import CommonReferencesTab from "components/CommonReferencesComponents/CommonReferencesTab";

//thirdparty libraries
import { useSnackbar } from "notistack";
import moment from "moment";

//assets
import DocInfoIconImageSvg from "assets/documentControl/Info.svg";
import CloseIconImageSvg from "assets/documentControl/Close.svg";

type Props = {
  addModalOpen?: any;
  setAddModalOpen?: any;
  fetchRisks?: any;
  riskId?: any;
  formType?: string;
  tableData?: any;
  setTableData?: any;
  existingRiskConfig?: any;
  selectedJobTitle?: any;
  fetchAspImps?: any;
};
const RiskDrawer = ({
  addModalOpen,
  setAddModalOpen,
  fetchRisks,
  riskId,
  formType,
  tableData,
  setTableData,
  existingRiskConfig,
  selectedJobTitle,
  fetchAspImps,
}: Props) => {
  const isLocAdmin = checkRoles("LOCATION-ADMIN");
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isAuditor = checkRoles("AUDITOR");
  const isMR = checkRoles("MR");
  const orgId = sessionStorage.getItem("orgId");
  const params = useParams();
  const userDetails = getSessionStorage();
  const realmName = getAppUrl();
  const [formData, setFormData] = useState<any>({
    // assesmentTeam: [],
  });
  const [activityNew, setActivityNew] = useState("");
  const [riskImpactNew, setRiskImpactNew] = useState("");
  const [identityDateNew, setIdentityDateNew] = useState<any>("");
  const [referencesNew, setReferencesNew] = useState<any>([]);
  const [riskForm, setRiskForm] = useState<any>();
  const [riskRegisterData, setRiskRegisterData] = useState<any>([]);

  const avatarUrl = userDetails.avatar
    ? `${API_LINK}/${userDetails.avatar}`
    : "";

  const [isLoading, setIsLoading] = useState<any>(false);

  const [commentsLoader, setCommentsLoader] = useState(false);
  const [comments, setComments] = useState<any>([]);
  const [commentText, setCommentText] = useState<any>("");

  const [preMitigation, setPreMitigation] = useState<any>([]);
  const [preScore, setPreScore] = useState<any>(0);
  const [postMitigation, setPostMitigation] = useState<any>([]);
  const [postScore, setPostScore] = useState<any>(0);

  const [scoreData, setScoreData] = useState<any>([]);
  const [isPreOrPost, setIsPreOrPost] = useState<any>("");
  const [score, setScore] = useState<any>(0);

  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();
  const isSmallScreen = useMediaQuery("(max-width:600px)");

  const [items, setItems] = useState<any>(["Save As Draft", "Send For Review"]);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedActionItem, setSelectedActionItem] = useState<any>(null);

  // console.log("check formType in risk drawer", riskId, formType);

  const [commentDrawer, setCommentDrawer] = useState<any>({
    open: false,
    mode: formType,
    data: {
      riskId: riskId,
    },
  });

  const [drawer, setDrawer] = useState<any>({
    mode: "create",
    open: addModalOpen,
  });

  const [infoDrawer, setInfoDrawer] = useState<any>({
    open: false,
    data: existingRiskConfig || {},
  });

  const [reviewerOptions, setReviewerOptions] = useState<any>([]);
  const [approverOptions, setApproverOptions] = useState<any>([]);
  const [locationWiseUsers, setLocationWiseUsers] = useState<any>([]);
  const [fileList, setFileList] = useState<any>([]);
  const [existingUploadedFiles, setExistingUploadedFiles] = useState<any>([]);
  const [isDataLoading, SetIsDataLoading] = useState<any>(true);
  const [preMitigationScoreModal, setPreMitigationScoreModal] = useState<any>({
    open: false,
    mode: formType,
    data: {},
  });
  const [levelColor, setLevelColor] = useState<any>("yellow");

  const handleRiskFormCreated = (form: any) => {
    setRiskForm(form);
  };
  const url =
    params.riskcategory === "HIRA" ? "/api/riskregister" : "/api/aspect-impact";
  useEffect(() => {
    // console.log("checkrisk formData in drawer", formData);
    if (selectedJobTitle) {
      const jobTitle = selectedJobTitle === "All" ? "" : selectedJobTitle;
      setFormData({
        ...formData,
        jobTitle: jobTitle,
      });
    } else {
      setFormData({
        ...formData,
        jobTitle: "",
      });
    }
  }, []);

  // useEffect(() => {
  //   console.log("checkrisk score adnd dat", preMitigation, preScore);
  // }, [preMitigation, preScore]);

  useEffect(() => {
    fetchUsersByLocation();
    fetchingReviewerList();
    fetchApproverList();
    console.log("check existingRiskConfig", existingRiskConfig, infoDrawer);
    if (!!riskId && params.riskcategory === "HIRA") {
      fetchRiskById();
    } else {
      loadDatainRiskMatrix();
    }
    if (!!riskId && params.riskcategory === "AspImp") {
      fetchAspImpById();
    } else {
      loadDatainRiskMatrix();
    }
  }, [riskId, addModalOpen]);

  useEffect(() => {
    if (
      !!reviewerOptions?.length &&
      !!approverOptions?.length &&
      !!locationWiseUsers?.length
    ) {
      SetIsDataLoading(false);
    }
  }, [reviewerOptions, approverOptions, locationWiseUsers]);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const onMenuClick = (e: any) => {
    if (params.riskcategory === "HIRA") {
      handleSubmit(e);
    } else {
      handleAspImpSubmit(e);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCommentSubmit = async (commentText: any) => {
    try {
      if (!commentText) return; // if comment text is empty, do nothing

      if (commentDrawer?.mode === "edit") {
        const newComment = {
          name: userDetails.firstname + " " + userDetails.lastname,
          comment: commentText,
          userId: userDetails.id,
          riskId: commentDrawer?.data?.riskId,
        };
        console.log("check in drawer edit mode ->>", newComment);

        postComment(newComment);
        // add the new comment to the comments array
        setComments((prevComments: any) => [
          ...prevComments,
          { ...newComment, avatarUrl: avatarUrl },
        ]);
      } else {
        const newComment = {
          name: userDetails.firstname + " " + userDetails.lastname,
          comment: commentText,
          userId: userDetails.id,
          riskId: "",
        };

        console.log("check in drawer create mode ->>", newComment);
        // postComment(newComment);
        // add the new comment to the comments array
        setComments((prevComments: any) => [
          ...prevComments,
          { ...newComment, avatarUrl: avatarUrl },
        ]);
      }

      setCommentText(""); // clear the input field
    } catch (error) {
      console.log("error in adding comment");
    }
  };

  const postComment = async (newComment: any) => {
    try {
      const res = await axios.post(`${url}/addcomment`, newComment);
      // console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  const postCommentsInBulk = async (comments: any) => {
    try {
      console.log("check comments in postcommentsInBulk --->", comments);

      const res = await axios.post(`${url}/addcommentsbulk`, comments);
    } catch (error) {
      console.log("errror in posting comments in bulk", error);
    }
  };

  const loadDatainRiskMatrix = () => {
    const cumulativeData = existingRiskConfig?.riskCumulative;
    let newPreMitigation = [...preMitigation],
      newPostMitigation = [...postMitigation];

    if (!!cumulativeData && !!cumulativeData.length) {
      newPreMitigation = [...newPreMitigation, ...cumulativeData];
      newPostMitigation = [...newPostMitigation, ...cumulativeData];
      setPreMitigation(newPreMitigation);
      setPostMitigation(newPostMitigation);
    }
  };

  const filterActionItems = (status: any, data: any) => {
    // console.log("checkrisk status in filterActionItems", status);

    if (status === "OPEN") {
      setItems(["Save As Draft", "Send For Review"]);
    } else if (status === "IN REVIEW") {
      // console.log(
      //   "checkrisk in review status userDetails?.id ",
      //   userDetails?.id,
      //   data?.riskReviewers?.id
      // );

      if (userDetails?.id === data?.riskReviewers?.id) {
        setItems(["Send For Edit", "Review Complete"]);
      } else setItems([]);
    } else if (status === "REVIEW COMPLETE") {
      setItems(["Send For Edit", "Send For Approval"]);
    } else if (status === "IN APPROVAL") {
      // console.log(
      //   "checkrisk in approver status userDetails?.id ",
      //   userDetails?.id,
      //   data?.riskApprovers?.id
      // );
      if (userDetails?.id === data?.riskApprovers?.id) {
        setItems(["Send For Edit", "Approve"]);
      } else setItems([]);
    } else if (status === "APPROVED") {
      setItems(["Send For Edit"]);
    }
  };

  const fetchRiskById = async () => {
    try {
      const res = await axios.get(`/api/riskregister/${riskId}`);
      setIsLoading(true);
      SetIsDataLoading(true);
      if (res.status === 200 || res.status === 201) {
        setRiskRegisterData(res.data);

        setFormData({
          ...formData,
          assesmentTeam: res.data.assesmentTeam || [],
          riskReviewers: res.data?.riskReviewers || undefined,
          riskApprovers: res.data?.riskApprovers || undefined,
        });
        if (!!res.data?.attachments && !!res.data?.attachments.length) {
          setExistingUploadedFiles(res?.data?.attachments);
        }

        const data = {
          riskReviewers: res.data?.riskReviewers || undefined,
          riskApprovers: res.data?.riskApprovers || undefined,
        };

        filterActionItems(res.data.status, data);

        //add preMitigation array if premitigation exists otherwise add cumulative data in premitigation
        if (!!res.data.preMitigation && !!res.data.preMitigation.length) {
          setPreMitigation([...res.data.preMitigation]);
          setPreScore(res.data.preMitigationScore);
          // console.log("checkrisk pre score", res.data.preMitigationScore);
        } else {
          const cumulativeData = res.data.riskConfigData?.riskCumulative;
          let newPreMitigation = [...preMitigation];
          if (!!cumulativeData && !!cumulativeData.length) {
            newPreMitigation = [...newPreMitigation, ...cumulativeData];
          }
          setPreMitigation(newPreMitigation);
        }
        //add postmitigation array if postmitigation exists otherwise add cumulative data in postmitigation

        // if (!!res.data.postMitigation && !!res.data.postMitigation.length) {
        //   setPostMitigation([...res.data.postMitigation]);

        //   setPostScore(res.data.postMitigationScore);
        // } else {
        //   const cumulativeData = res.data.riskConfigData?.riskCumulative;
        //   let newPostMitigation = [...postMitigation];
        //   if (!!cumulativeData && !!cumulativeData.length) {
        //     newPostMitigation = [...newPostMitigation, ...cumulativeData];
        //   }
        //   setPostMitigation(newPostMitigation);
        // }
        setIsLoading(false);
        SetIsDataLoading(false);
      } else {
        setIsLoading(false);
        SetIsDataLoading(false);
        enqueueSnackbar("Error in fetching registered risk data", {
          variant: "error",
        });
      }
    } catch (error) {
      console.log("error", error);
    }
  };
  const fetchAspImpById = async () => {
    try {
      const res = await axios.get(`/api/aspect-impact/${riskId}`);
      setIsLoading(true);
      SetIsDataLoading(true);
      if (res.status === 200 || res.status === 201) {
        setRiskRegisterData(res.data);
        // console.log("checkrisk exsisting form data in fetchAspImpById", formData);

        setFormData({
          ...formData,
          activity: res.data.activity,
          assesmentTeam: res.data.assesmentTeam || [],
          riskReviewers: res.data?.riskReviewers || undefined,
          riskApprovers: res.data?.riskApprovers || undefined,
        });
        if (!!res.data?.attachments && !!res.data?.attachments.length) {
          setExistingUploadedFiles(res?.data?.attachments);
        }

        const data = {
          riskReviewers: res.data?.riskReviewers || undefined,
          riskApprovers: res.data?.riskApprovers || undefined,
        };

        filterActionItems(res.data.status, data);

        //add preMitigation array if premitigation exists otherwise add cumulative data in premitigation
        if (!!res.data.preMitigation && !!res.data.preMitigation.length) {
          setPreMitigation([...res.data.preMitigation]);
          setPreScore(res.data.preMitigationScore);
          // console.log("checkrisk pre score", res.data.preMitigationScore);
        } else {
          const cumulativeData = res.data.riskConfigData?.riskCumulative;
          let newPreMitigation = [...preMitigation];
          if (!!cumulativeData && !!cumulativeData.length) {
            newPreMitigation = [...newPreMitigation, ...cumulativeData];
          }
          setPreMitigation(newPreMitigation);
        }
        setIsLoading(false);
        SetIsDataLoading(false);
      } else {
        setIsLoading(false);
        SetIsDataLoading(false);
        enqueueSnackbar("Error in fetching registered risk data", {
          variant: "error",
        });
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const fetchingReviewerList = async () => {
    try {
      // const encodedValue = encodeURIComponent(value);
      const res = await axios.get(`/api/roles/workFlowDistributionReviewer`);
      // console.log("fetch reviwer list", res);

      if (!!res.data && res.data.length > 0) {
        const userOptions = res.data.map((user: any) => ({
          userId: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          value: user.id,
          label: user.email,
          email: user.email,
          id: user.id,
          fullname: user.firstname + " " + user.lastname,
        }));
        setReviewerOptions(userOptions);
        return userOptions;
      } else {
        setReviewerOptions([]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchApproverList = async () => {
    try {
      // const encodedValue = encodeURIComponent(value);
      const res = await axios.get(`/api/roles/workFlowDistributionApprover`);

      if (!!res.data && res.data.length > 0) {
        const userOptions = res.data.map((user: any) => ({
          userId: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          value: user.id,
          label: user.email,
          email: user.email,
          id: user.id,
          fullname: user.firstname + " " + user.lastname,
        }));
        setApproverOptions(userOptions);
        return userOptions;
      } else {
        setApproverOptions([]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchUsersByLocation = async () => {
    const locationId = userDetails.locationId || "";
    try {
      setIsLoading(true);
      const res = await axios.get(`${url}/users/${locationId}`);
      console.log("check res", res);
      if (res.status === 200 || res.status === 201) {
        if (!!res.data && res.data.length > 0) {
          const userOptions = res.data.map((user: any) => ({
            userId: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            value: user.id,
            label: user.email,
            email: user.email,
            id: user.id,
            fullname: user.firstname + " " + user.lastname,
          }));
          setLocationWiseUsers(userOptions);
          setIsLoading(false);
        } else {
          setLocationWiseUsers([]);
          setIsLoading(false);
        }
      } else {
        setLocationWiseUsers([]);
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      console.log("errror in fetching users based on location", error);
    }
  };

  const getPrefixSuffix = async (moduleType: any) => {
    try {
      const response = await axios.get(
        `/api/serial-number/generateSerialNumber?moduleType=${moduleType}&location=${
          isOrgAdmin ? "" : userDetails.location.id
        }&createdBy=${userDetails?.id}&organizationId=${orgId}`
      );

      const generatedValue = response.data;
      console.log("generatedValue", generatedValue);
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
        .join(isOrgAdmin ? "N/A" : LocationId)
        .split("DepartmentId")
        .join(isOrgAdmin ? "MCOE Department" : EntityId);

      // console.log("checkrisk prefixsuffix", transformedValue);

      return transformedValue;
    } catch (error) {}
  };

  const onChange = (key: string) => {
    // console.log(key);
  };

  const clearStates = () => {
    setAddModalOpen(false);
    setActivityNew("");
    setRiskImpactNew("");
    setIdentityDateNew("");
  };

  const handleSubmit = async (actionItem: any = "open") => {
    console.log("check formType", actionItem);

    try {
      let status = "OPEN";

      let allowUser = false;

      let preMitigationMatrixData = {};

      if (actionItem === "Save As Draft") {
        status = "OPEN";
      } else if (actionItem === "Send For Review") {
        status = "IN REVIEW";
      } else if (actionItem === "Review Complete") {
        status = "IN APPROVAL";
      } else if (actionItem === "Send For Edit") {
        status = "OPEN";
      } else if (actionItem === "Send For Approval") {
        status = "IN APPROVAL";
      } else if (actionItem === "Approve") {
        status = "APPROVED";
      }

      if (actionItem === "Review Complete") {
        if (userDetails?.id === formData?.reviewers) {
          allowUser = true;
        } else allowUser = false;
      }

      if (actionItem === "Approve") {
        if (userDetails?.id === formData?.approvers) {
          allowUser = true;
        } else allowUser = false;
      }

      await riskForm.validateFields();

      const prefixSuffix = await getPrefixSuffix("HIRA");
      // console.log("checkrisk prefixSuffix in risk drawer", prefixSuffix);

      if (formData?.existingControl) {
        preMitigationMatrixData = {
          preMitigation: preMitigation,
          preMitigationScore: preScore,
        };
      }

      const riskData = {
        jobTitle: formData.jobTitle,
        area: formData.area || "",
        section: formData.section || "",
        condition: formData.condition || "", //associated hazard
        riskType: formData.riskType || "", //routine/ non routine
        impactType: formData.impactType || "", //impact
        jobBasicStep: formData.jobBasicStep || "",
        existingControl: formData.existingControl || "",

        assesmentTeam:
          !!formData?.assesmentTeam && formData?.assesmentTeam.length > 0
            ? formData?.assesmentTeam.map((item: any) => item.id)
            : [],

        riskReviewers: formData?.riskReviewers
          ? [formData?.riskReviewers?.id]
          : "",
        riskApprovers: formData?.riskApprovers
          ? [formData?.riskApprovers?.id]
          : "",

        location: userDetails?.locationId || "",
        entity: userDetails?.entityId || "",

        status: status,
        riskConfigId: existingRiskConfig?._id || "",
        ...preMitigationMatrixData,

        // activity: activityNew || "", //temproraitl not required
        // description: formData.description || "", // not required
        // riskImpact: riskImpactNew || "",  //not required
        // references: referencesNew || "", //not required
      };
      if (formType === "edit" && riskId) {
        putRisk(riskData);
      } else if (formType === "create") {
        postRisk(riskData);
      }
      console.log("check final risk Data", riskData);
      // Validation was successful, proceed with form submission...
    } catch (error) {
      console.log("in risk handleSubmit error", error);

      // Validation failed, error.message will contain the error message.
    }
  };

  const postRisk = async (riskData: any) => {
    try {
      let attachments = [];

      if (!!fileList && fileList.length > 0) {
        const uploadedFiles: any = await uploadAttachments();

        if (uploadedFiles?.isFileUploaded) {
          attachments = uploadedFiles?.attachments;
        }
      }

      const finalRiskData = {
        ...riskData,
        attachments,
      };

      const response = await axios.post(url, finalRiskData);
      console.log("check response after risk creation", response);
      // setCreatedRiskId(response.data._id);
      const newComments = comments.map((comment: any) => ({
        ...comment,
        riskId: response.data._id,
      }));
      // console.log("check newComments in postRisk", newComments);

      // setComments([...newComments]);
      postCommentsInBulk(newComments);
      if (response.status === 200 || response.status === 201) {
        clearStates();
        enqueueSnackbar("Risk Registered Successfully", {
          variant: "success",
        });

        if (params.riskcategory === "HIRA") {
          fetchRisks("All");
        } else {
          fetchAspImps();
        }
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const putRisk = async (riskData: any) => {
    try {
      let attachments = [];
      console.log("check fileList in put risk", fileList);
      console.log(!!fileList);

      if (!!fileList && fileList.length > 0) {
        const uploadedFiles: any = await uploadAttachments();

        if (uploadedFiles?.isFileUploaded) {
          attachments = uploadedFiles?.attachments;
        }
      }

      if (!!existingUploadedFiles && existingUploadedFiles.length > 0) {
        attachments = [...existingUploadedFiles, ...attachments];
      }

      const finalRiskData = {
        ...riskData,
        attachments,
      };

      // console.log("checkrisk final risk data in put risk", finalRiskData);

      const res = await axios.put(`${url}/${riskId}`, finalRiskData);
      if (res.status === 200 || res.status === 201) {
        clearStates();
        enqueueSnackbar("Risk Updated Successfully", {
          variant: "success",
        });
        if (params.riskcategory === "HIRA") {
          fetchRisks("All");
        } else {
          fetchAspImps();
        }
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleAspImpSubmit = async (actionItem: any = "open") => {
    // console.log("checkrisk asp imp final submit formType", actionItem);

    try {
      let status = "OPEN";

      let allowUser = false;

      let preMitigationMatrixData = {};

      if (actionItem === "Save As Draft") {
        status = "OPEN";
      } else if (actionItem === "Send For Review") {
        status = "IN REVIEW";
      } else if (actionItem === "Review Complete") {
        status = "IN APPROVAL";
      } else if (actionItem === "Send For Edit") {
        status = "OPEN";
      } else if (actionItem === "Send For Approval") {
        status = "IN APPROVAL";
      } else if (actionItem === "Approve") {
        status = "APPROVED";
      }

      if (actionItem === "Review Complete") {
        if (userDetails?.id === formData?.reviewers) {
          allowUser = true;
        } else allowUser = false;
      }

      if (actionItem === "Approve") {
        if (userDetails?.id === formData?.approvers) {
          allowUser = true;
        } else allowUser = false;
      }

      await riskForm.validateFields();

      const prefixSuffix = await getPrefixSuffix("AI");
      // console.log("checkrisk prefixSuffix in asp imp risk drawer", prefixSuffix);

      if (formData?.existingControl) {
        preMitigationMatrixData = {
          preMitigation: preMitigation,
          preMitigationScore: preScore,
        };
      }

      const riskData = {
        jobTitle: formData.jobTitle,
        section: formData.section || "",
        activity: formData.activity || "",

        riskType: formData.riskType || "", // Aspect Type
        specificEnvAspect: formData.specificEnvAspect || "", // Specific Aspect

        impactType: formData.impactType || "", //Enviromental Impact Type
        specificEnvImpact: formData.specificEnvImpact || "", // Specific Impact

        condition: formData.condition || "", //Condition
        assesmentTeam:
          !!formData?.assesmentTeam && formData?.assesmentTeam.length > 0
            ? formData?.assesmentTeam.map((item: any) => item.id)
            : [],

        existingControl: formData.existingControl || "",
        riskReviewers: formData?.riskReviewers
          ? [formData?.riskReviewers?.id]
          : "",
        riskApprovers: formData?.riskApprovers
          ? [formData?.riskApprovers?.id]
          : "",

        location: userDetails?.locationId || "",
        entity: userDetails?.entityId || "",

        status: status,
        riskConfigId: existingRiskConfig?._id || "",
        ...preMitigationMatrixData,
      };
      // console.log("checkrisk in handleaspimpc submit riskId =====", riskId);

      if (formType === "edit" && riskId) {
        putRisk(riskData);
      } else if (formType === "create") {
        postRisk(riskData);
      }
      // console.log("checkrisk final asp imp risk Data", riskData);
      // Validation was successful, proceed with form submission...
    } catch (error) {
      console.log("in risk handleSubmit error", error);

      // Validation failed, error.message will contain the error message.
    }
  };

  const uploadAttachments = async () => {
    try {
      console.log(
        "check existing files an filesList in uploadAttachments",
        existingUploadedFiles,
        fileList
      );

      const newFormData = new FormData();
      const locationName = isOrgAdmin
        ? ""
        : userDetails?.location?.locationName;

      if (!!existingUploadedFiles && existingUploadedFiles.length > 0) {
        const newFiles = fileList.filter((item: any) => !item?.url);
        console.log(
          "check new files if existing files already exist",
          newFiles
        );

        newFiles.forEach((file: any) => {
          newFormData.append("files", file.originFileObj, file.name);
        });
      } else {
        console.log("check fileList in uploadAttachments", fileList);

        fileList.forEach((file: any) => {
          newFormData.append("files", file.originFileObj, file.name);
        });
      }

      const response = await axios.post(
        `${url}/uploadattachement?realm=${realmName}&locationName=${locationName}`,
        newFormData
      );
      if (response?.status === 200 || response?.status === 201) {
        return {
          isFileUploaded: true,
          attachments: response?.data,
        };
      } else {
        return {
          isFileUploaded: false,
          attachments: [],
        };
      }
    } catch (error) {
      console.log("error in uploading attachments", error);
    }
  };

  const handleCloseModal = () => {
    const updatedData = tableData.map((item: any) => ({
      ...item,
      highlight: false,
    }));
    setTableData(updatedData);
    setAddModalOpen(false);
  };

  const toggleInfoDrawer = (data: any = {}) => {
    setInfoDrawer({
      ...infoDrawer,
      open: !infoDrawer.open,
      data: { ...data },
    });
  };

  const toggleCommentsDrawer = (data: any = {}) => {
    console.log("check in toggleCommentsDrawer", data);

    setCommentDrawer({
      ...commentDrawer,
      open: !commentDrawer.open,
      data: { ...data },
    });
  };

  const toggleScoreModal = () => {
    setPreMitigationScoreModal({
      ...preMitigationScoreModal,
      open: !preMitigationScoreModal.open,
    });
  };

  const tabs = [
    {
      label:
        params.riskcategory === "AspImp"
          ? `Asp-Imp Details`
          : `${params.riskcategory} Details`,
      key: 1,
      children: (
        <CreateRiskFormTab
          addModalOpen={addModalOpen}
          setAddModalOpen={setAddModalOpen}
          fetchRisks={fetchRisks}
          fetchAspImps={fetchAspImps}
          riskId={riskId}
          formType={formType}
          formData={formData}
          setFormData={setFormData}
          activityNew={activityNew}
          setActivityNew={setActivityNew}
          setIdentityDateNew={setIdentityDateNew}
          referencesNew={referencesNew}
          setReferencesNew={setReferencesNew}
          handleRiskFormCreated={handleRiskFormCreated}
          existingRiskConfig={existingRiskConfig}
          riskRegisterData={riskRegisterData}
          preMitigation={preMitigation}
          setPreMitigation={setPreMitigation}
          preScore={preScore}
          setPreScore={setPreScore}
          locationWiseUsers={locationWiseUsers}
          scoreData={scoreData}
          setScoreData={setScoreData}
          score={score}
          setScore={setScore}
          isPreOrPost={isPreOrPost}
          setIsPreOrPost={setIsPreOrPost}
        />
      ),
    },
    {
      label: "Workflow",
      key: 2,
      children: (
        <WorkflowTab
          addModalOpen={addModalOpen}
          existingRiskConfig={existingRiskConfig}
          postMitigation={postMitigation}
          setPostMitigation={setPostMitigation}
          postScore={postScore}
          setPostScore={setPostScore}
          reviewerOptions={reviewerOptions}
          approverOptions={approverOptions}
          formData={formData}
          setFormData={setFormData}
          // fetchRisks={fetchRisks}
          // riskId={riskId}
          // formType={formType}
          // formData={formData}
          // setFormData={setFormData}
          // riskImpactNew={riskImpactNew}
          // setRiskImpactNew={setRiskImpactNew}
        />
      ),
    },
    {
      label: "Attachments",
      key: 3,
      children: (
        <AttachmetsTab
          drawer={drawer}
          fileList={fileList}
          setFileList={setFileList}
          existingUploadedFiles={existingUploadedFiles}
        />
        // <ReferencesTab
        //   referencesNew={referencesNew}
        //   setReferencesNew={setReferencesNew}
        //   formData={formData}
        //   setFormData={setFormData}
        // />
      ),
    },
    {
      label: "References",
      key: 4,
      children: (
        <CommonReferencesTab drawer={drawer} />
        // <ReferencesTab
        //   referencesNew={referencesNew}
        //   setReferencesNew={setReferencesNew}
        //   formData={formData}
        //   setFormData={setFormData}
        // />
      ),
    },
  ];

  return (
    <>
      <div className={classes.drawer}>
        <Drawer
          title={[
            <span
              key="title"
              style={
                isSmallScreen ? { fontSize: "13px" } : { fontSize: "16px" }
              }
            >
              {formType === "create"
                ? params.riskcategory === "AspImp"
                  ? `Add Aspect Impact`
                  : `Add ${params.riskcategory}`
                : params.riskcategory === "AspImp"
                ? `Edit Aspect Impact`
                : `Edit ${params.riskcategory}`}
            </span>,
          ]}
          placement="right"
          open={addModalOpen}
          closable={true}
          onClose={handleCloseModal}
          closeIcon={
            <img
              src={CloseIconImageSvg}
              alt="close-drawer"
              style={{ width: "36px", height: "38px", cursor: "pointer" }}
            />
          }
          className={classes.drawer}
          maskClosable={false}
          width={isSmallScreen ? "85%" : "60%"}
          extra={
            <>
              <Space>
                <Tooltip title="View Risk Information">
                  <img
                    src={DocInfoIconImageSvg}
                    alt="doc-info"
                    onClick={toggleInfoDrawer}
                    className={classes.docInfoIcon}
                  />
                </Tooltip>
                <Tooltip title="Add/View Comments">
                  <MdChat
                    className={classes.commentsIcon}
                    onClick={() => toggleCommentsDrawer({ riskId: riskId })}
                  />
                </Tooltip>
                {/* <Button onClick={handleCloseModal}>Cancel</Button> */}
                <Button
                  onClick={handleClick}
                  style={{ display: "flex", alignItems: "center" }}
                  disabled={items?.length === 0}
                >
                  <span style={{ fontWeight: "bold" }}>
                    {selectedActionItem || "Actions"}
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
                        disabled={
                          item === "In Approval" || item === "In Review"
                        }
                      >
                        {item}
                      </MenuItem>
                    ))}
                </Menu>
              </Space>
            </>
          }
        >
          {isLoading && isDataLoading ? (
            <CircularProgress />
          ) : (
            <div className={classes.tabsWrapper}>
              <div
                onClick={toggleScoreModal}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    backgroundColor: "efefef",
                    display: "flex",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "bolder",
                      fontSize: "18px",
                      marginRight: "10px",
                    }}
                  >
                    Score : {!!preScore && preScore > 0 && preScore}
                  </div>
                  {!!preScore && preScore > 0 && (
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        backgroundColor: "yellow",
                      }}
                    ></div>
                  )}
                </div>
              </div>
              <Tabs
                onChange={onChange}
                type="card"
                items={tabs as any}
                animated={{ inkBar: true, tabPane: true }}
                // tabBarStyle={{backgroundColor : "green"}}
              />
            </div>
          )}

          {!!preMitigationScoreModal.open && (
            <>
              <PreMitigationScoreModal
                preMitigationScoreModal={preMitigationScoreModal}
                toggleScoreModal={toggleScoreModal}
                existingRiskConfig={existingRiskConfig}
                preMitigation={preMitigation}
                setPreMitigation={setPreMitigation}
                preScore={preScore}
                setPreScore={setPreScore}
                levelColor={levelColor}
                setLevelColor={setLevelColor}
                scoreData={scoreData}
                setScoreData={setScoreData}
                score={score}
                setScore={setScore}
                isPreOrPost={isPreOrPost}
                setIsPreOrPost={setIsPreOrPost}
              />
            </>
          )}

          {!!infoDrawer.open && (
            <InfoTopDrawer
              infoDrawer={infoDrawer}
              setInfoDrawer={setInfoDrawer}
              toggleInfoDrawer={toggleInfoDrawer}
              riskRegisterData={
                riskId
                  ? {
                      dateCreated: moment(riskRegisterData?.createdAt).format(
                        "DD/MM/YYYY"
                      ),
                    }
                  : null
              }
            />
          )}

          {!!commentDrawer.open && (
            <CommentsDrawer
              commentDrawer={commentDrawer}
              setCommentDrawer={setCommentDrawer}
              toggleCommentsDrawer={toggleCommentsDrawer}
              fetchRisks={fetchRisks}
              comments={comments}
              setComments={setComments}
              commentText={commentText}
              setCommentText={setCommentText}
              handleCommentSubmit={handleCommentSubmit}
            />
          )}
        </Drawer>
      </div>
    </>
  );
};

export default RiskDrawer;
