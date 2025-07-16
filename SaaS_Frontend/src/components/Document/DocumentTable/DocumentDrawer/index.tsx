//react, react-router, recoil
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useRecoilState } from "recoil";
import { processDocFormData, drawerData, referencesData } from "recoil/atom";

//antd
import { Button, Drawer, Modal, Space, Tabs } from "antd";

//material-ui
import {
  CircularProgress,
  Tooltip,
  useMediaQuery,
  Menu,
  MenuItem,
} from "@material-ui/core";
import { MdOutlineExpandMore } from 'react-icons/md';
import { MdPeople } from 'react-icons/md';

//utils
import getAppUrl from "utils/getAppUrl";
import toFormData from "utils/toFormData";
import axios from "apis/axios.global";
import getSessionStorage from "utils/getSessionStorage";

//assets
import { ReactComponent as StarIcon } from "assets/documentControl/Star.svg";
import { ReactComponent as StarFilledIcon } from "assets/documentControl/Star-Filled.svg";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import DocInfoIconImageSvg from "assets/documentControl/Info.svg";
import ExpandIconImageSvg from "assets/documentControl/expand1.svg";

//components
import ExpandedDrawerView from "components/Document/DocumentTable/DocumentDrawer/ExpandedDrawerView";

import DocInfoTab from "components/Document/DocumentTable/DocumentDrawer/DocInfoTab";
import WorkFlowTab from "components/Document/DocumentTable/DocumentDrawer/WorkflowTab";
import CommonReferencesTab from "components/CommonReferencesComponents/CommonReferencesTab";

import DocDetailsTopDrawer from "components/Document/DocumentTable/DocumentDrawer/DocDetailsTopDrawer";
import DocWorkflowTopDrawer from "components/Document/DocumentTable/DocumentDrawer/DocWorkflowTopDrawer";
import { showLoader, hideLoader } from "components/GlobalLoader/loaderState"; // Import the functions to control loader
//thirdparty libs
import { useSnackbar } from "notistack";

//styles
import useStyles from "./style";
import "./new.css";
import TextArea from "antd/es/input/TextArea";

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
  // Revert: "Revert",
};

type Props = {
  drawer?: any;
  setDrawer?: any;
  handleFetchDocuments?: any;
  deletedId?: any;
  // reloadGraphs?: any;
};

const DocumentDrawer = ({
  drawer,
  setDrawer,
  handleFetchDocuments,
  deletedId,
}: // reloadGraphs,
Props) => {
  const [activeTabKey, setActiveTabKey] = useState<any>(1);
  const [detailsDrawer, setDetailsDrawer] = useState<any>(false);
  const [auditTrailDrawer, setAuditTrailDrawer] = useState<any>({
    open: false,
    data: {},
  });
  const [refData, setRefData] = useRecoilState(referencesData);

  const [peopleDrawer, setPeopleDrawer] = useState<any>({
    open: false,
    data: {},
  });
  const [spin, setSpin] = useState(false);
  const isSmallScreen = useMediaQuery("(max-width:600px)");
  const realmName = getAppUrl();
  const navigate = useNavigate();
  const location = useLocation();
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  // const { socket } = useContext<any>(SocketContext);

  const [formData, setFormData] = useRecoilState(processDocFormData);
  const [drawerDataState, setDrawerDataState] = useRecoilState(drawerData);
  const loggedInUser = JSON.parse(sessionStorage.getItem("userDetails") as any);
  const [docForm, setDocForm] = useState<any>();
  const [workFlowForm, setWorkFlowForm] = useState<any>();
  const [uploadFileError, setUploadFileError] = useState<any>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<any>([]);
  const [disableFormFields, setDisableFormFields] = useState<any>(false);
  const [selectedReviewerFormData, setSelectedReviewerFormData] = useState<any>(
    []
  );
  const [drawerSize, setDrawerSize] = useState<boolean>(false);

  const [commnetValue, setCommentValue] = useState("");
  // const [retireComment,setRetireComment] = useState("")
  const [selectedApproverFormData, setSelectedApproverFormData] = useState<any>(
    []
  );

  const [allowAmmend, setAllowAmmend] = useState(false);
  const [editTrue, setEditTrue] = useState(true);
  const [favorite, setFavorite] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState(false);
  const [openModalForComment, setopenModalForComment] = useState(false);
  const [retireModal, setRetireModal] = useState(false);
  const [revertModal, setRevertModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState("");
  const [typeOfDoc, setTypeOfDoc] = useState<any>(""); //will be either Agreement or SOP
  const [isSubmitting, setIsSubmitting] = useState<any>(false);

  const [refsData] = useRecoilState(referencesData);

  const userDetails = getSessionStorage();
  const orgId = sessionStorage.getItem("orgId");

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const onMenuClick = (e: any) => {
    handleSubmitForm(e);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDocFormCreated = (form: any) => {
    setDocForm(form);
  };
  const handleWorkFlowFormCreated = (form: any) => {
    setWorkFlowForm(form);
  };

  const isItemInDisableBtnFor = (disableBtnFor: any, item: any) => {
    return disableBtnFor.includes(item);
  };

  useEffect(() => {
    if (!location.pathname.includes("fullformview")) {
      // console.log("in current location, setting items");

      setDrawerDataState({
        ...drawerDataState,
        items: items,
      });
    }
    // if (items && items.length) {
    //   setDummyItems([...items]);
    // }
    // console.log("items in useeffect", items);
  }, [items]);

  // useEffect(() => {
  //   console.log("checkdocument active tab key", activeTabKey);
  // },[activeTabKey])

  useEffect(() => {
    if (deletedId || drawer?.mode === "edit") {
      // console.log("drawer opened in edit mode", drawer);
      setDrawerDataState({
        ...drawerDataState,
        id: deletedId ? deletedId : drawer?.data?.id,
        formMode: "edit",
      });
      // console.log("drawer in documentTable",drawer.toggle)
      getDocData();
    } else if (drawer?.mode === "create") {
      // console.log("checkdoc drawer opened in create mode", drawer);
      const defaultButtonOptions = ["Save as Draft", "Send for Review"];
      const newItems = defaultButtonOptions?.map((item: any, index: any) => ({
        key: (index + 1).toString(),
        label: item,
      }));
      // const NewmenuItems = defaultButtonOptions.map((item: any, index: any) => (
      //   <MenuItem key={index + 1} onClick={() => handleMenuClick(item)}>
      //     {item}
      //   </MenuItem>
      // ));
      // setItems([...NewmenuItems]);
      setItems([...defaultButtonOptions]);
      // testItems = NewmenuItems;
      // console.log("new menu items in useeffect", NewmenuItems);
      // setItems([...newItems]);
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
    deletedId
      ? setDisableFormFields(true)
      : setDisableFormFields(
          isUserInApprovers(loggedInUser, selectedApproverFormData)
        );
  }, [loggedInUser, selectedApproverFormData]);

  const getFavorite = async () => {
    const docId = location.pathname.includes("fullformview")
      ? formData?.id
      : drawer?.data.id;
    await axios(`api/favorites/checkFavorite/${loggedInUser.id}/${docId}`)
      .then((res) => setFavorite(res.data))
      .catch((err) => console.error(err));
  };

  const handleFavorite = async () => {
    const docId = location.pathname.includes("fullformview")
      ? formData?.id
      : drawer?.data.id;
    await axios
      .put(`api/favorites/updateFavorite/${loggedInUser.id}`, {
        targetObjectId: docId,
      })
      .then((res) => {
        // console.log(res);
        getFavorite();
      })
      .catch((err) => console.error(err));
  };

  const handleCommentSubmit = async (value: string) => {
    if (value) {
      try {
        const res = await axios.post("/api/documents/createComment", {
          documentId: location.pathname.includes("fullformview")
            ? formData?.id
            : drawer?.data.id,
          commentText: value,
        });

        enqueueSnackbar(`Comment Added Successfully`, { variant: "success" });
        setEditTrue(false);
        setopenModalForComment(false);
        await handleSubmitForm("Send for Edit", true);
      } catch (err: any) {
        enqueueSnackbar(`Request Failed, Code: ${err.response.status}`, {
          variant: "success",
        });
      }
    } else {
      enqueueSnackbar(`Enter a comment`, { variant: "warning" });
    }
  };

  const getTypeOfDocument = async (docLink: any) => {
    console.log("checkdoc docLink", docLink);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_PY_URL}/pyapi/getdoctype`,
        {
          documentLink: docLink,
        }
      );
      console.log("checkdoc response getdoctype", response.data);

      if (response.status === 200 || response.status === 201) {
        const type: any = response?.data?.docType;
        setTypeOfDoc(type);
        return type;
      } else {
        return "";
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const getAgreementSummary = async (docId: any, docLink: any) => {
    // setClauseSelectionModal(false);
    // setClauseModal(true);
    // setClauseCompareLoading(true);
    showLoader("Loading Agreement Summary..."); // Show the loader when the function is called
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_PY_URL}/pyapi/agreement-summary`,
        {
          docId: docId,
          documentLink: docLink,
          organizationId: orgId,
        }
      );
      if (response.status === 200 || response.status === 201) {
        console.log("checkdoc2 agreeement response", response);
        hideLoader(); // Hide the loader when the function is called
        // setClauseResult(response?.data?.response);
        // navigate("/processdocuments/docviewer", {
        //   state : {
        //     documentLink : formData?.documentLink,
        //     clauseCompareResult: response?.data?.response
        //   }
        // })
        // setClauseModal(false);
        // setClauseCompareLoading(false)
      } else {
        // setClauseCompareLoading(false);
      }
    } catch (error) {
      // setIsSummaryLoading(false);
      // clearInterval(timer);
      console.log("error", error);
    }
  };

  const getStatusOfDoc = async () => {
    console.log("checkdoc getstatus of doc called");
  };

  const handleSubmitForm = async (option: string, submit = false) => {
    try {
      const { locationName } = formData;
      let formattedReferences: any = [];
      let form;

      if (refsData && refsData.length > 0) {
        formattedReferences = refsData.map((ref: any) => ({
          refId: ref.refId,
          organizationId: orgId,
          type: ref.type,
          name: ref.name,
          comments: ref.comments,
          createdBy: userDetails.firstName + " " + userDetails.lastName,
          updatedBy: null,
          link: ref.link,
        }));
      }
      if (
        process.env.REACT_APP_IS_ACEOFFIX === "true" &&
        formData?.documentLinkNew
      ) {
        const url =
          process.env.REACT_APP_API_URL +
          "/Temp/editTemp/" +
          formData.documentLinkNew.split("/").pop();
        let response: any;
        try {
          response = await fetch(url, {
            cache: "no-store",
          });
        } catch (error) {}
        if (response?.ok) {
          form = toFormData({
            ...formData,
            documentState: DocStateIdentifier[option],
            realmName: realmName,
            refsData: formattedReferences,
            system: [
              {
                id: "64d47b4ea5a0d9846d69fd8c",
              },
            ],
            aceoffixUrl:
              process.env.REACT_APP_API_URL +
              `/Temp/editTemp/${formData.documentLinkNew.split("/").pop()}`,
          });
        } else {
          form = toFormData({
            ...formData,
            documentState: DocStateIdentifier[option],
            realmName: realmName,
            refsData: formattedReferences,
            system: [
              {
                id: "64d47b4ea5a0d9846d69fd8c",
              },
            ],
          });
        }
      } else {
        form = toFormData({
          ...formData,
          documentState: DocStateIdentifier[option],
          realmName: realmName,
          refsData: formattedReferences,
          system: [
            {
              id: "64d47b4ea5a0d9846d69fd8c",
            },
          ],
        });
      }
      await docForm.validateFields();

      setUploadFileError(false);
      // console.log(selectedReviewerFormData, selectedApproverFormData);
      const IsApproverSelected = location.pathname.includes("fullformview")
        ? formData.approvers
        : selectedApproverFormData;

      const IsReviewerSelected = location.pathname.includes("fullformview")
        ? formData.reviewers
        : selectedReviewerFormData;

      // console.log("isapproverSelected", IsApproverSelected);
      // console.log("isRevewerSelected", IsReviewerSelected);
      // console.log(
      //   "selectedAppprover, selectedRever",
      //   selectedApproverFormData,
      //   selectedReviewerFormData
      // );

      if (DocStateIdentifier[option] === "Retire" && !submit) {
        setRetireModal(true);
        return;
      }
      if (
        (!formData.approvers ||
          !formData.approvers.length ||
          !formData.reviewers ||
          !formData.reviewers.length) &&
        (DocStateIdentifier[option] === "IN_REVIEW" ||
          DocStateIdentifier[option] === "IN_APPROVAL" ||
          option === "Retire")
      ) {
        // console.log(
        //   "checkdoc no reviewre and approvers found and option is not draft"
        // );
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
          if (
            formData.file === "" &&
            DocStateIdentifier[option] === "IN_REVIEW"
          ) {
            enqueueSnackbar(`Please Attach The File`, {
              variant: "warning",
            });
            return;
          }
          setSpin(true);
          setIsSubmitting(true);
          const res = await axios.post(
            `api/documents?realm=${realmName}&locationName=${locationName}`,
            form
          );
          if (res.status === 200 || res.status === 201) {
            setSpin(false);
            console.log("checkdoc2 res====>>", res);

            //getAgreementSummary only if file format is pdf or docx
            if (
              res?.data?.document?.documentLink.endsWith(".pdf") ||
              res?.data?.document?.documentLink.endsWith(".docx")
            ) {
              const typeOfDoc = await getTypeOfDocument(
                res?.data?.document?.documentLink
              );
              setIsSubmitting(false);
              if (typeOfDoc === "Agreement") {
                console.log("checkdoc2 type of doc", typeOfDoc);
                getAgreementSummary(
                  res?.data?.document?.id,
                  res?.data?.document?.documentLink
                );
                getStatusOfDoc();
              }
            }
            if (DocStateIdentifier[option] === "DRAFT") {
              // socket?.emit("documentCreated", {
              //   data: res.data,
              //   currentUser: `${loggedInUser.id}`,
              // });
            }
            if (drawer) {
              handleCloseModal();
              handleFetchDocuments();
              // reloadGraphs();
            }
            if (location.pathname.includes("fullformview")) {
              navigate("/processdocuments/processdocument");
            }
            enqueueSnackbar(`Document ${option} Successfully`, {
              variant: "success",
            });
          }
        } catch (err: any) {
          setSpin(false);
          if (err.response.status === 409) {
            enqueueSnackbar(`Document Name Already Exists`, {
              variant: "error",
            });
          } else if (err.response.status === 404) {
            alert(
              `Your Organization has exceeded the licensed attachments - Please reach ProcessRidge to activate additional licenses`
            );
            setIsLoading(false);
            if (!!drawer) {
              handleCloseModal();
              handleFetchDocuments();
              // reloadGraphs();
            }
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
        if (!formData?.reasonOfCreation) {
          enqueueSnackbar(`Enter Reason of Creation/Amendment`, {
            variant: "warning",
          });
          return;
        }
        if (DocStateIdentifier[option] === "IN_REVIEW") {
          const switchOverData = formData.documentLink
            ? false
            : formData.file
            ? false
            : true;
          if (
            formData.reviewers.length === 0 ||
            formData.approvers.length === 0 ||
            switchOverData
          ) {
            enqueueSnackbar(`Please Attach The File`, {
              variant: "warning",
            });
            return;
          }
        }

        if (option === "Revert" && !submit) {
          setRevertModal(true);
          return;
        }

        if (
          formData.file === "" &&
          DocStateIdentifier[option] === "AMMEND" &&
          !submit
        ) {
          setOpenModal(true);
          enqueueSnackbar(`Please Attach The File`, {
            variant: "warning",
          });
          return;
        }
        if (DocStateIdentifier[option] === "SEND_FOR_EDIT" && !submit) {
          setopenModalForComment(true);
          // enqueueSnackbar(`Please Attach The File`, {
          //   variant: "warning",
          // });
          return;
        }
        const docId = location.pathname.includes("fullformview")
          ? formData?.id
          : drawer?.data.id;
        // console.log("inside edit", docId);
        try {
          setIsLoading(true);
          const res = await axios.patch(
            `api/documents/${docId}?realm=${realmName}&locationName=${locationName}`,
            form
          );
          if (res.status === 200 || res.status === 201) {
            setIsLoading(false);
            enqueueSnackbar(`Document ${option} Successfully`, {
              variant: "success",
            });
            // socket?.emit("documentUpdated", {
            //   data: res.data,
            //   currentUser: `${loggedInUser.id}`,
            // });
            if (location.pathname.includes("/processdocuments/viewdoc/")) {
              window.location.reload();
            }
            if (drawer) {
              handleCloseModal();
              handleFetchDocuments();
              // reloadGraphs();
            }
            if (location.pathname.includes("fullformview")) {
              navigate("/processdocuments/processdocument");
            }
          }
        } catch (err: any) {
          // console.log("error in catch of patch request-->", err);

          setIsLoading(false);
          enqueueSnackbar(`Request Failed ${err.response.status}`, {
            variant: "error",
          });
        }
      } else {
        //drawer opened unexpectedly
        return;
      }
    } catch (error: any) {
      // console.log("error in submitting form", error);
      if (
        error?.errorFields?.some((field: any) => field.name[0] === "uploader")
      ) {
        setUploadFileError(true); // Set error state if validation failed for uploader
      }
    }
  };

  const inlineEdit = async () => {
    if (
      formData.documentLinkNew.endsWith(".docx") ||
      formData.documentLinkNew.endsWith(".doc") ||
      formData.documentLinkNew.endsWith(".xlsx") ||
      formData.documentLinkNew.endsWith(".xls") ||
      formData.documentLinkNew.endsWith(".pptx") ||
      formData.documentLinkNew.endsWith(".ppt")
    ) {
      let response = { data: formData.documentLinkNew };

      const url =
        process.env.REACT_APP_API_URL +
        "/Temp/editTemp/" +
        formData.documentLinkNew.split("/").pop();
      const res = await fetch(url, {
        cache: "no-store",
      });
      if (!res.ok) {
        if (process.env.REACT_APP_IS_OBJECT_STORAGE === "true") {
          response = await axios.post(`api/documents/viewerOBJ`, {
            documentLink: formData.documentLinkNew,
          });
        }
      }

      const requiredDetails = {
        documentLink: response.data,
        status: formData.documentState,
        downloadAccess: true,
      };
      const formDataJSON = JSON.stringify(requiredDetails);
      const encodedFormData = encodeURIComponent(formDataJSON);
      window.AceBrowser.openWindowModeless(
        process.env.REACT_APP_API_URL +
          "/aceoffix/word?formData=" +
          encodedFormData,
        "width=1200px;height=800px;"
      );
    }
  };

  const getData = async () => {
    try {
      const res = await axios.get(
        "/api/doctype/documents/getDoctypeCreatorDetails"
      );

      // let workFlowData = await axios.get("/api/roles/workFlowDistribution");
      setFormData({
        ...formData,
        documentName: "",
        reasonOfCreation: "",
        description: "",
        tags: [],
        systems: [],
        doctypeName: undefined,
        reviewers: undefined,
        approvers: undefined,
        file: "",
        locationName: res?.data?.userLocation?.locationName,
        entityName: res?.data?.userDepartment?.entityName,
        locationId: res?.data?.userLocation?.id,
        entityId: res?.data?.userDepartment?.id,
        docTypes: res?.data?.doctypes,
        distributionList: undefined,
        readAccess: undefined,
        // distributionList :  res.data.doctypes?.[0]?.distributionList,
        // readAccess : res.data.doctypes?.[0]?.readAccess,
        // reviewers: workFlowData?.data?.reviewer,
        // approvers: workFlowData?.data?.approver,
      });
    } catch (err) {
      enqueueSnackbar(`You are not a Creator in any Document Type`, {
        variant: "error",
      });
      handleCloseModal();
    }
  };

  function isUserInApprovers(loggedInUser: any, approvers: any) {
    return approvers?.some(
      (approver: any) => approver.email === loggedInUser.email
    );
  }

  const getDocTypeOptions = async () => {
    try {
      const res = await axios.get(
        "/api/doctype/documents/getDoctypeCreatorDetails"
      );
      return res?.data?.doctypes;
    } catch (err) {}
  };

  const getDocData = async () => {
    // console.log("checkdoc getDocData gets called", drawer);
    try {
      const docTypeOptions = await getDocTypeOptions();
      setIsLoading(true);
      const res: any = await axios.get(
        `api/documents/getSingleDocument/${
          deletedId ? deletedId : drawer?.data?.id
        }`
      );
      if (process.env.REACT_APP_IS_ACEOFFIX === "true") {
        const url =
          process.env.REACT_APP_API_URL +
          "/Temp/editTemp/" +
          res?.data.documentLinkNew.split("/").pop();
        try {
          const response = await fetch(url, {
            cache: "no-store",
          });
          if (response.ok) {
            await fetch(
              `${process.env.REACT_APP_API_URL}/aceoffix/delete?filePath=${
                "editTemp/" + res?.data.documentLinkNew.split("/").pop()
              }`
            );
          }
        } catch (error) {}
      }
      const buttonOptionsResponse = await axios.get(
        `/api/documents/checkUserPermissions/${
          deletedId ? deletedId : drawer?.data?.id
        }`
      );

      const filteredOptions = buttonOptionsResponse?.data?.filter(
        (option: string) => {
          return (
            process.env.REACT_APP_IS_ACEOFFIX === "true" ||
            option !== "Inline Edit"
          );
        }
      );

      const disableBtnFor = ["In Review", "In Approval"];
      const newItems = filteredOptions.map((option: any, index: any) => {
        const disabled =
          isItemInDisableBtnFor(disableBtnFor, option) ||
          isUserInApprovers(loggedInUser, formData?.approvers);
        return { key: (index + 1).toString(), label: option, disabled };
      });
      const tempNewItems = newItems.map((item: any) => item.label);

      const NewmenuItems = tempNewItems.map((item: any, index: any) => (
        <MenuItem key={index + 1} onClick={() => onMenuClick(item)}>
          {item}
        </MenuItem>
      ));
      // console.log("new menu items in check user permissions", NewmenuItems);
      setItems([...tempNewItems]);

      setFormData({
        ...formData,
        ...res.data,
        systems: res.data.system,
        doctypeName: res.data.docType,
        docsClassification: res.data.doctype.document_classification,
        locationName: res.data.creatorLocation.locationName,
        entityName: res.data.creatorEntity.entityName,
        locationId: res.data.creatorLocation.id,
        entityId: res.data.creatorEntity.id,
        docTypes: docTypeOptions,
        readAccess: res.data.readAccess,
        referenceDocuments: res.data.ReferenceDocuments,
        readAccessUsers: res.data.readAccessUsers,
        issueNumber: res.data.issueNumber,
        reviewers: res?.data?.reviewers || [],
        approvers: res?.data?.approvers || [],
        section: res?.data?.section,
        sectionName: res?.data?.sectionName,
        status: res?.data?.documentState,
        downloadAccess:res?.data?.downloadAccess
        // sectionName: res?.data?.section || "",
        //sectionName: res?.data?.sectionValue?.name,
      });
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
      enqueueSnackbar(`Could not get Data, Check your internet connection`, {
        variant: "error",
      });
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setDrawer({
      ...drawer,
      open: !drawer.open,
      data: {},
    });
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

  // const ActionsDropdownComponent = ({items, onMenuClick}) => {
  //   return (
  //     <Dropdown menu={{ items, onClick: onMenuClick }}>
  //       <Button style={{ display: "flex", alignItems: "center" }}>
  //         <span>Actions</span>

  //         <MdOutlineExpandMore />
  //       </Button>
  //     </Dropdown>
  //   );
  // };
  const allowtoAmmend = async () => {
    setOpenModal(false);
    await setAllowAmmend(true);
    handleSubmitForm("Amend", true);
  };
  const tabs = [
    {
      label: "Doc Info",
      key: 1,
      children: (
        <DocInfoTab
          drawer={drawer}
          setDrawer={setDrawer}
          handleDocFormCreated={handleDocFormCreated}
          uploadFileError={uploadFileError}
          setUploadFileError={setUploadFileError}
          disableFormFields={disableFormFields}
          isEdit={drawer?.mode === "create" ? false : true}
          activeTabKey={activeTabKey}
        />
      ),
    },
    {
      label: "Workflow",
      key: 2,
      children: (
        <WorkFlowTab
          drawer={drawer}
          setDrawer={setDrawer}
          handleDocFormCreated={handleDocFormCreated}
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
        />
      ),
    },
    {
      label: "References",
      key: 3,
      children: (
        <CommonReferencesTab
          drawer={drawer}
          disableFormFields={disableFormFields}
        />
      ),
    },
  ];

  return (
    <div>
      {location.pathname.includes("fullformview") ? (
        <ExpandedDrawerView
          drawer={drawer}
          setDrawer={setDrawer}
          activeTabKey={activeTabKey}
          onTabsChange={onTabsChange}
          handleDocFormCreated={handleDocFormCreated}
          uploadFileError={uploadFileError}
          setUploadFileError={setUploadFileError}
          disableFormFields={disableFormFields}
          workFlowForm={workFlowForm}
          setWorkFlowForm={setWorkFlowForm}
          handleWorkFlowFormCreated={handleWorkFlowFormCreated}
          // isWorkflowValid={isWorkflowValid}
          // setIsWorkflowValid={setIsWorkflowValid}
          selectedReviewerFormData={selectedReviewerFormData}
          setSelectedReviewerFormData={setSelectedReviewerFormData}
          selectedApproverFormData={selectedApproverFormData}
          setSelectedApproverFormData={setSelectedApproverFormData}
          handleSubmit={handleSubmitForm}
          items={items}
          onMenuClick={onMenuClick}
          isUserInApprovers={isUserInApprovers}
        />
      ) : deletedId ? (
        <div>
          {isLoading || isSubmitting ? (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </div>
          ) : (
            <>
              <div className={classes.tabsWrapper}>
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
              <div>
                {!!detailsDrawer && (
                  <DocDetailsTopDrawer
                    detailsDrawer={detailsDrawer}
                    setDetailsDrawer={setDetailsDrawer}
                    formData={formData}
                    toggleDetailsDrawer={toggleDetailsDrawer}
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
                  <DocWorkflowTopDrawer
                    peopleDrawer={peopleDrawer}
                    setPeopleDrawer={setPeopleDrawer}
                    togglePeopleDrawer={togglePeopleDrawer}
                    docData={!!formData && formData}
                  />
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className={classes.drawer}>
          <Drawer
            title={drawer?.mode === "create" ? "Add Document" : "Edit Document"}
            placement="right"
            open={drawer?.open}
            closeIcon={
              <img
                src={CloseIconImageSvg}
                alt="close-drawer"
                style={{ width: "36px", height: "38px", cursor: "pointer" }}
              />
            }
            // closable={false}
            onClose={handleCloseModal}
            maskClosable={false}
            className={classes.drawer}
            // width={}
            // width={isSmallScreen ? "85%" : "45%"}
            // width={"45%"}
            width={drawerSize ? "100%" : "45%"}
            style={{ transform: "none !important" }}
            extra={
              <div style={{ display: "flex" }}>
                {drawer?.mode === "edit" && (
                  <>
                    {favorite ? (
                      <Tooltip title="Remove favorite">
                        <StarFilledIcon
                          onClick={handleFavorite}
                          className={classes.starIcon}
                        />
                      </Tooltip>
                    ) : (
                      <Tooltip title="Add favorite">
                        <StarIcon
                          onClick={handleFavorite}
                          className={classes.starIcon}
                        />
                      </Tooltip>
                    )}
                  </>
                )}
                <Tooltip title="View Creator,Reviewer(S) and Approver(S)">
                  {/* <AuditTrailIcon
                    style={{ marginRight: "8px", cursor: "pointer" }}
                    onClick={toggleAuditTrailDrawer}
                  /> */}
                  {/* <img
                    src={AuditTrailImageSvg}
                    alt="audit-trail"
                    onClick={togglePeopleDrawer}
                    className={classes.auditTrailIcon}
                  /> */}
                  <MdPeople
                    onClick={togglePeopleDrawer}
                    className={classes.auditTrailIcon}
                  ></MdPeople>
                </Tooltip>

                {/* <Tooltip title="View Audit Trail"> </Tooltip> */}
                {/* <AuditTrailIcon
                    style={{ marginRight: "8px", cursor: "pointer" }}
                    onClick={toggleAuditTrailDrawer}
                  /> */}
                {/* <img
                    src={AuditTrailImageSvg}
                    alt="audit-trail"
                    onClick={toggleAuditTrailDrawer}
                    className={classes.auditTrailIcon}
                  /> */}

                <Tooltip title="View Doc Details">
                  <img
                    src={DocInfoIconImageSvg}
                    alt="doc-info"
                    onClick={toggleDetailsDrawer}
                    className={classes.docInfoIcon}
                  />
                </Tooltip>
                <Tooltip title={drawerSize ? "Shrink Form" : "Expand Form"}>
                  <img
                    src={ExpandIconImageSvg}
                    alt="expand=form"
                    // onClick={() => navigate(`/processdocuments/fullformview`)}
                    onClick={() => setDrawerSize(!drawerSize)}
                    className={classes.expandIcon}
                  />
                </Tooltip>
                {/* <Tooltip title="Expand Form">
                  <img
                    src={ExpandIconImageSvg}
                    alt="expand=form"
                    onClick={() => navigate(`/processdocuments/fullformview`)}
                    className={classes.expandIcon}
                  />
                </Tooltip> */}
                <Space>
                  {/* <Button >Cancel</Button> */}
                  {isLoading ? (
                    <CircularProgress style={{ marginLeft: "10px" }} />
                  ) : (
                    <Button
                      onClick={handleClick}
                      style={{ display: "flex", alignItems: "center" }}
                      disabled={items?.length === 0}
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
                  )}
                  {!isLoading && (
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
                            onClick={() => {
                              if (item === "Inline Edit") {
                                inlineEdit();
                              } else {
                                onMenuClick(item);
                              }
                            }}
                            disabled={
                              item === "In Approval" || item === "In Review"
                            }
                          >
                            {item}
                          </MenuItem>
                        ))}
                    </Menu>
                  )}

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
            {/* <img src={AuditTrailImageSvg} alt="mysvf" width={50} height={50} /> */}
            {isLoading || isSubmitting ? (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <CircularProgress />
              </div>
            ) : (
              <>
                <div className={classes.tabsWrapper}>
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
                <div>
                  {!!detailsDrawer && (
                    <DocDetailsTopDrawer
                      detailsDrawer={detailsDrawer}
                      setDetailsDrawer={setDetailsDrawer}
                      formData={formData}
                      toggleDetailsDrawer={toggleDetailsDrawer}
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
                    <DocWorkflowTopDrawer
                      peopleDrawer={peopleDrawer}
                      setPeopleDrawer={setPeopleDrawer}
                      togglePeopleDrawer={togglePeopleDrawer}
                      docData={!!formData && formData}
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
            <div
              style={{
                display: "block", // Change from "inline-flex" to "block"
                alignItems: "center",
                padding: "2px",
              }}
            >
              <p>
                New version of Document will be available in My Documents for
                further action
              </p>
              <p>Do you want to continue amending with the same attachment?</p>
            </div>
          }
          // icon={<ErrorIcon />}
          open={openModal}
          onOk={() => allowtoAmmend()}
          onCancel={() => {
            setOpenModal(false);
          }}
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
          open={openModalForComment}
          onOk={() => allowtoAmmend()}
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
              onClick={() => {
                handleCommentSubmit(commnetValue);
                setEditTrue(false);
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
        {/* retireComment,setRetireCommen */}
        <Modal
          width={`50%`}
          title={
            <>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "2px",
                }}
              >
                This document and all its prior versions will be retired
              </div>
              <div style={{ paddingTop: "10px" }}>
                <TextArea
                  rows={4}
                  onChange={(e) => {
                    setFormData({ ...formData, retireComment: e.target.value });
                  }}
                  value={formData?.retireComment ?? ""}
                ></TextArea>
              </div>
              <WorkFlowTab
                drawer={drawer}
                setDrawer={setDrawer}
                handleDocFormCreated={handleDocFormCreated}
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
                showReaders={false}
              />
            </>
          }
          // icon={<ErrorIcon />}
          open={retireModal}
          onOk={() => {}}
          onCancel={() => {
            // setOpenModal(false);
            setRetireModal(false);
          }}
          footer={[
            <Button
              key="submit"
              type="primary"
              style={{ backgroundColor: "#003059" }}
              onClick={() => {
                setRetireModal(false);
              }}
            >
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              style={{ backgroundColor: "#003059" }}
              onClick={() => {
                handleSubmitForm("Retire", true);
                setRetireModal(false);
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
        {/* retireComment,setRetireCommen */}
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
                This Document Will Revert From Retire
              </div>
              <div style={{ paddingTop: "10px" }}>
                <TextArea
                  rows={4}
                  onChange={(e) => {
                    setFormData({ ...formData, revertComment: e.target.value });
                  }}
                  value={formData?.revertComment ?? ""}
                ></TextArea>
              </div>
            </>
          }
          // icon={<ErrorIcon />}
          open={revertModal}
          onOk={() => {}}
          onCancel={() => {
            // setOpenModal(false);
            setRevertModal(false);
          }}
          footer={[
            <Button
              key="submit"
              type="primary"
              style={{ backgroundColor: "#003059" }}
              onClick={() => {
                setRevertModal(false);
              }}
            >
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              style={{ backgroundColor: "#003059" }}
              onClick={() => {
                handleSubmitForm("Revert", true);
                setRetireModal(false);
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
    </div>
  );
};

export default DocumentDrawer;
