import { Paper, Menu, MenuItem } from "@material-ui/core";
import { useEffect, useRef, useState } from "react";
import { Button } from "antd";
import useStyles from "./styles";
import { useNavigate } from "react-router-dom";
import { MdChevronLeft } from "react-icons/md";
import { useRecoilValue } from "recoil";
import { mobileView } from "../../recoil/atom";
import { IconButton, Tooltip } from "@material-ui/core";
import CustomButtonGroup from "../../components/CustomButtonGroup";
import { useLocation, useParams } from "react-router-dom";
import { ReactComponent as StarIcon } from "assets/documentControl/Star.svg";
import { ReactComponent as StarFilledIcon } from "assets/documentControl/Star-Filled.svg";
import { MdOutlineExpandMore } from "react-icons/md";
import { MdPeople } from "react-icons/md";
import { MdStarBorder } from "react-icons/md";
import PeopleDrawer from "components/Document/CommonDrawerComponents/peopleDrawer";
import { ReactComponent as CustomEditIcon } from "assets/documentControl/Edit.svg";
import { Modal, Button as AntButton, Tag } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useMediaQuery } from "@material-ui/core";
import { MdInfo } from "react-icons/md";
import { MdVisibility } from "react-icons/md";
import checkRoles from "utils/checkRoles";
import checkRole from "utils/checkRoles";
import getSessionStorage from "utils/getSessionStorage";
import axios from "apis/axios.global";
import { API_LINK } from "config";
import { ImDownload } from "react-icons/im";
import getAppUrl from "utils/getAppUrl";
import { FaRegStar, FaStar } from "react-icons/fa";
import { useSnackbar } from "notistack";
import SignatureComponent from "components/ReusableComponents/SignatureComponent";

type Props = {
  parentPageLink: string;
  children: any;
  handleSubmit?: any;
  handleDiscard?: any;
  options?: any;
  docAccessType?: string;
  docState?: string;
  disableBtnFor?: string[];
  favorite: boolean;
  name?: string;
  formData?: any;
  showModel?: boolean;
  handleFavorite?: any;
  handleRemoveFavorite?: any;
  handleEditDocument?: () => void;
  handleCommentSubmit?: any;
  openModalForComment?: any;
  setopenModalForComment?: any;
  handlerButtonStatus?: () => void;
  reloadlist?: any;
};

function ProcessDocFormWrapper({
  children,
  parentPageLink,
  handleSubmit,
  handleDiscard,
  options,
  docAccessType,
  docState,
  disableBtnFor = [],
  favorite,
  formData,
  openModalForComment,
  setopenModalForComment,
  handleFavorite,
  handleRemoveFavorite,
  handleCommentSubmit,
  name,
  handleEditDocument,
  handlerButtonStatus,
  reloadlist,
}: Props) {
  const classes = useStyles();
  const navigate = useNavigate();
  const mobView = useRecoilValue(mobileView);
  // const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [showAmendConfirmModal, setShowAmendConfirmModal] =
    useState<any>(false);
  const [renderedFrom, setRenderedFrom] = useState<string>("");
  const params = useParams();
  const [file, setFile] = useState<any>(null);
  const [commnetValue, setCommentValue] = useState("");
  const [downloadAccess, setDownloadAccess] = useState<boolean>(false);
  const realmName = getAppUrl();
  const userDetails = getSessionStorage();
  const location = useLocation();
  const [signModalOpen, setSignModalOpen] = useState<Boolean>(false);
  const digiSignCommentRef = useRef("");
  const [digiSignComment, setDigiSignComment] = useState<any>("");
  const [signatureHandler, setSignatureHandler] = useState<() => void>(
    () => () => {}
  );
  const { enqueueSnackbar } = useSnackbar();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState("");
  const [peopleDrawer, setPeopleDrawer] = useState<any>({
    open: false,
    data: {},
  });
  const togglePeopleDrawer = (data: any = {}) => {
    setPeopleDrawer({
      ...peopleDrawer,
      open: !peopleDrawer.open,
      data: { ...data },
    });
  };
  // console.log("favorite", favorite);
  const matches = useMediaQuery("(min-width:786px)");
  const currentUser = getSessionStorage();
  // console.log("data in wrapper", options);
  useEffect(() => {
    documentDownloadAccess();
  }, [formData]);
  useEffect(() => {
    if (location.pathname?.toLowerCase().includes("/inbox")) {
      setRenderedFrom("inbox");
    } else if (
      location.pathname
        ?.toLowerCase()
        .includes("/processdocuments/processdocument/viewprocessdocument")
    ) {
      setRenderedFrom("process");
    }
  }, [location, params]);

  const handleActionClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onMenuClick = (e: any) => {
    handleSubmit(e);
  };
  const cleanWorkflowDetails = (workflowDetails: any) => {
    const workflow = workflowDetails?.workflow?.map((stage: any) => {
      // Clean completedBy
      if (Array.isArray(stage.completedBy) && stage.completedBy.length > 0) {
        stage.completedBy = stage.completedBy.map((user: any) => ({
          userId: user.userId,
          completedDate: user.completedDate,
        }));
      }

      // Clean ownerSettings (array of OR-groups with AND conditions)
      const cleanedOwnerSettings = (stage.ownerSettings || []).map(
        (group: any[]) =>
          group.map((condition: any) => {
            const { userList, selectedUsers = [], ...rest } = condition;

            if (
              condition.type === "Named Users" ||
              condition.type === "PIC Of" ||
              condition.type === "Manager Of" ||
              condition.type === "Head Of"
            ) {
              return {
                ...rest,
                selectedUsers: selectedUsers.map((user: any) => user.id),
              };
            }

            // For "User Of" or other types
            return {
              ...rest,
              selectedUsers: selectedUsers.map((user: any) => user.id), // remove this map if you want full user objects
            };
          })
      );

      return {
        ...stage,
        ownerSettings: cleanedOwnerSettings,
      };
    });

    return {
      ...workflowDetails,
      workflow,
    };
  };
  const handleDocumentAction = async (
    url: string,
    documentState?: string,
    previousState?: string
  ) => {
    try {
      const formDataPayload = new FormData();
      // console.log("formdata inside document action", formData);
      const trimmedTitle = formData.documentName?.trim() || "";
      const trimmedDescription = formData.reasonOfCreation?.trim() || "";

      formDataPayload.append("documentName", trimmedTitle);
      formDataPayload.append("reasonOfCreation", trimmedDescription);

      if (documentState) formDataPayload.append("documentState", documentState);

      formDataPayload.append("realmName", realmName);
      // formDataPayload.append(
      //   "locationName",
      //   userDetails?.location?.locationName
      // );
      formDataPayload.append(
        "locationName",
        userDetails?.location?.locationName
          ? userDetails?.location?.locationName
          : userDetails?.additionalUnits?.find(
              (item: any) => item?.id === userDetails?.entity?.locationId
            )?.locationName
      );
      formDataPayload.append("updatedBy", userDetails?.id);
      formDataPayload.append("organizationId", userDetails?.organizationId);

      formData.reviewers.forEach((r: string) =>
        formDataPayload.append("reviewers", r)
      );
      formData.approvers.forEach((a: string) =>
        formDataPayload.append("approvers", a)
      );

      if (file && (file.originFileObj || file instanceof File)) {
        const realFile = file.originFileObj || file;
        // console.log("Appending file:", realFile.name);
        formDataPayload.append("file", realFile);
      }

      // // Debug
      // for (let [key, val] of formDataPayload.entries()) {
      //   console.log(`${key}:`, val);
      // }

      if (
        formData.workflowDetails !== "default" &&
        formData.workflowDetails !== "none"
      ) {
        if (documentState) {
          if (documentState === "DRAFT") {
            formDataPayload.set(
              "documentState",
              formData.workflowDetails.workflow[0].stage
            );
          } else if (documentState === "Send For Edit") {
            formData.workflowDetails.workflow =
              formData.workflowDetails.workflow.map((stage: any) => ({
                ...stage,
                status: "pending",
                completedBy: [],
                ownerSettings: stage.ownerSettings.map((group: any[]) =>
                  group.map((condition: any) => ({
                    ...condition,
                    status: "pending",
                    completedBy: [],
                  }))
                ),
              }));
          } else {
            const currentDateAndTime = new Date();
            const currentStageIndex =
              formData.workflowDetails.workflow.findIndex(
                (item: any) => item.stage === documentState
              );

            if (currentStageIndex !== -1) {
              const stage =
                formData.workflowDetails.workflow[currentStageIndex];

              // Update ownerSettings based on user ID match and condition status
              const updatedOwnerSettings = stage.ownerSettings.map(
                (group: any[]) =>
                  group.map((condition: any) => {
                    if (
                      condition.status === "pending" &&
                      Array.isArray(condition.selectedUsers) &&
                      condition.selectedUsers.some(
                        (user: any) => user.id === userDetails.id
                      )
                    ) {
                      return {
                        ...condition,
                        status: "complete",
                        completedBy: [
                          {
                            userId: userDetails.id,
                            completedDate: currentDateAndTime,
                          },
                        ],
                      };
                    }
                    return condition;
                  })
              );

              // Determine global stage status: if any one group is fully complete
              const anyGroupFullyComplete = updatedOwnerSettings.some(
                (group: any[]) =>
                  group.every(
                    (condition: any) => condition.status === "complete"
                  )
              );

              const stageStatus = anyGroupFullyComplete
                ? "complete"
                : "pending";
              const stageCompletedBy =
                stageStatus === "complete"
                  ? [
                      {
                        userId: userDetails.id,
                        completedDate: currentDateAndTime,
                      },
                    ]
                  : [];

              formData.workflowDetails.workflow[currentStageIndex] = {
                ...stage,
                status: stageStatus,
                completedBy: stageCompletedBy,
                ownerSettings: updatedOwnerSettings,
              };

              if (stageStatus === "complete") {
                const nextStage =
                  formData.workflowDetails.workflow[currentStageIndex + 1];

                if (nextStage) {
                  formDataPayload.set("documentState", nextStage.stage);
                } else {
                  formDataPayload.set("documentState", "PUBLISHED");
                  formDataPayload.append(
                    "approvedDate",
                    currentDateAndTime.toISOString()
                  );
                }
              }
            }
          }
        }
        const workflow = cleanWorkflowDetails(formData.workflowDetails);

        formDataPayload.append("workflowDetails", JSON.stringify(workflow));
        if (previousState) {
          formDataPayload.append("previousState", previousState);
        }
      }
      formDataPayload.append("digiSignComment", digiSignCommentRef.current);

      const res = await axios.patch(url, formDataPayload);
      setDigiSignComment(null);
      if (res.status === 200) {
        enqueueSnackbar("Document updated successfully", {
          variant: "success",
        });
        reloadlist();
      }
    } catch (error) {
      console.error("Update failed", error);
    }
  };
  // console.log("formData", formData);
  const checkIfLoggedInUserCanReview = (docData: any, userId: any) => {
    if (!docData?.reviewers || !userId) return false;
    return docData.reviewers.includes(userId);
  };

  const checkIfLoggedInUserCanApprove = (docData: any, userId: any) => {
    if (!docData?.approvers || !userId) return false;
    return docData.approvers.includes(userId);
  };

  const checkIfLoggedInUserHasCreateAccess = (
    docData: any,
    userDetails: any
  ) => {
    const accessType = docData?.docTypeDetails?.docCreateAccess;
    const accessIds = docData?.docTypeDetails?.docCreateAccessIds || [];

    const userId = userDetails?.id;
    const userEntityId = userDetails?.entityId || userDetails?.entity?.id;
    const userLocationId = userDetails?.locationId || userDetails?.location?.id;

    if (accessType === "All Users") {
      return true;
    }

    if (accessType === "Selected Users") {
      return accessIds.includes(userId);
    }

    if (accessType === "Selected Entity") {
      return accessIds.includes(userEntityId);
    }

    if (accessType === "Selected Unit") {
      return accessIds.includes(userLocationId);
    }

    if (["PIC", "Head"].includes(accessType)) {
      // For both PIC and Head, accessIds hold selected entityIds
      return accessIds.includes(userEntityId);
    }

    return false;
  };
  const handleSave = () => {
    // const validationErrors = validateForm("draft");
    // if (validationErrors.length > 0) {
    //   showValidationErrors(validationErrors);
    //   return;
    // }
    handleDocumentAction(
      `/api/documents/updateDocInDraftMode/${formData?._id}`
    );
  };

  const handleSendForReview = () => {
    // const validationErrors = validateForm("review");
    // if (validationErrors.length > 0) {
    //   showValidationErrors(validationErrors);
    //   return;
    // }
    handleDocumentAction(
      `/api/documents/updateDocumentForReview/${formData?._id}`,
      "IN_REVIEW"
    );
  };

  const handleSendForApproval = () => {
    // const validationErrors = validateForm("approval");
    // if (validationErrors.length > 0) {
    //   showValidationErrors(validationErrors);
    //   return;
    // }
    handleDocumentAction(
      `/api/documents/updateDocumentForApproval/${formData?._id}`,
      "IN_APPROVAL"
    );
  };

  const handleApprove = () => {
    // const validationErrors = validateForm("approve");
    // if (validationErrors.length > 0) {
    //   showValidationErrors(validationErrors);
    //   return;
    // }
    handleDocumentAction(
      `/api/documents/updateDocumentForPublishedState/${formData?._id}`,
      "PUBLISHED"
    );
  };

  const handleSendForEdit = () => {
    // const validationErrors = validateForm("edit");
    // if (validationErrors.length > 0) {
    //   showValidationErrors(validationErrors);
    //   return;
    // }
    handleDocumentAction(
      `/api/documents/updateDocumentForSendForEdit/${formData?._id}`,
      "Sent_For_Edit"
    );
  };

  const handleAmend = () => {
    // const validationErrors = validateForm("amend");
    // if (validationErrors.length > 0) {
    //   showValidationErrors(validationErrors);
    //   return;
    // }
    handleDocumentAction(
      `/api/documents/updateDocumentForAmend/${formData?._id}`,
      "PUBLISHED"
    );
  };

  const handleCustomWorkflowAmmend = (stage: any) => {
    // const validationErrors = validateForm("amend");
    // if (validationErrors.length > 0) {
    //   showValidationErrors(validationErrors);
    //   return;
    // }
    handleDocumentAction(
      `/api/documents/updateDocumentForAmend/${formData?._id}`,
      stage
    );
  };

  const handleChangeWorkflow = (
    field: "reviewers" | "approvers",
    selectedValues: string | string[]
  ) => {
    const valuesArray = Array.isArray(selectedValues)
      ? selectedValues
      : selectedValues.split(",");

    // setFormData((prev: any) => ({
    //   ...prev,
    //   [field]: valuesArray,
    // }));
  };

  const handleCustomWorkflow = (status: any, currentStatus?: any) => {
    // const validationErrors = validateForm("workflow");
    // if (validationErrors.length > 0) {
    //   showValidationErrors(validationErrors);
    //   return;
    // }
    // console.log("formData", formData);
    handleDocumentAction(
      `/api/documents/updateDocumentForCustomWorkflow/${formData?._id}`,
      status,
      currentStatus
    );
  };

  const renderAmendConfirmModal = () => (
    <Modal
      title="Confirm Amend Action"
      open={showAmendConfirmModal}
      onCancel={() => setShowAmendConfirmModal(false)}
      footer={[
        <Button
          key="cancel"
          onClick={() => {
            // setActiveTab("Files")
            setShowAmendConfirmModal(false);
          }}
        >
          Cancel
        </Button>,
        <Button
          key="ok"
          type="primary"
          style={{
            backgroundColor: "rgb(0, 48, 89)",
            borderColor: "rgb(0, 48, 89)",
          }}
          onClick={() => {
            setShowAmendConfirmModal(false);
            handleAmend();
          }}
        >
          Ok
        </Button>,
      ]}
    >
      <div style={{ display: "block", padding: "2px" }}>
        <p>
          New version of Document will be available in My Documents for further
          action
        </p>
        <p>Do you want to continue amending with the same attachment?</p>
      </div>
    </Modal>
  );
  const handleClick = () => {
    // URL to open in the new tab
    const url = "http://localhost:9003/Index.html";

    // Open the URL in a new tab
    window.open(url, "_blank");
  };
  // const statusMap: any = {
  //   Approved: { backgroundColor: "#7cbf3f", text: "Approved", color: "white" },
  //   IN_REVIEW: {
  //     backgroundColor: "#F2BB00",
  //     color: "white",
  //     text: "In Review",
  //   },
  //   "Review Complete": {
  //     backgroundColor: "#F2BB00",
  //     text: "Review Complete",
  //     color: "white",
  //   },
  //   IN_APPROVAL: {
  //     backgroundColor: "#FB8500",
  //     color: "white",
  //     text: "In Approval",
  //   },
  //   AMMEND: { backgroundColor: "#D62DB1", text: "Amend", color: "yellow" },
  //   PUBLISHED: {
  //     backgroundColor: "#7CBF3F",
  //     color: "white",
  //     text: "Published",
  //   },
  //   DRAFT: { backgroundColor: "#0075A4", color: "white", text: "Draft" },
  //   SEND_FOR_EDIT: {
  //     backgroundColor: "#0075A4",
  //     text: "Sent For Edit",
  //     color: "white",
  //   },
  //   "Retire - In Review": { color: "#0075A4", text: "Retire Review" },
  //   "Retire - In Approval": { color: "#FB8500", text: "Retire Approval" },
  //   OBSOLETE: { color: "white", text: "Obsolete", backgroundColor: "darkblue" },
  // };
  // const renderTag = (status: any) => {
  //   const statusInfo = statusMap[status];

  //   if (statusInfo) {
  //     return (
  //       <Tag
  //         style={{ backgroundColor: statusInfo?.backgroundColor }}
  //         color={statusInfo?.color}
  //         key={status}
  //         // className={classes?.statusTag}
  //       >
  //         {statusInfo?.text}
  //       </Tag>
  //     );
  //   }

  //   return status;
  // };
  const setComment = (val: string) => {
    digiSignCommentRef.current = val;
    setDigiSignComment(val);
  };
  const onclose = () => {
    setSignModalOpen(false);
  };
  const openAceoffix = async (formData: any) => {
    let requiredDetails = {};
    let downloadAccess = true;
    const isOrgAdmin = checkRoles("ORG-ADMIN");
    const isMr =
      checkRole("MR") && currentUser.locationId === formData.locationId;
    const isCreator = formData.creators.some(
      (item: any) => item.id === currentUser.id
    );
    const isReviewer = formData.reviewers.some(
      (item: any) => item.id === currentUser.id
    );
    const isApprover = formData.approvers.some(
      (item: any) => item.id === currentUser.id
    );
    let response = { data: formData.documentLinkNew };
    if (process.env.REACT_APP_IS_OBJECT_STORAGE === "true") {
      response = await axios.post(`${API_LINK}/api/documents/viewerOBJ`, {
        documentLink: formData.documentLinkNew,
      });
    }

    if (isOrgAdmin || isMr || isCreator || isReviewer || isApprover) {
      downloadAccess = true;
    }
    if (
      formData?.documentState === "DRAFT" ||
      formData?.documentState === "IN_REVIEW"
    ) {
      requiredDetails = {
        documentLink: response.data,
        title: formData.documentName,
        location: formData.locationName,
        system: formData.systemNames.map((item: any) => item.name).join(", "),
        issueNo: formData.issueNumber,
        revisionNo: formData.currentVersion,
        createdBy:
          formData.creators[0].firstname + " " + formData.creators[0].lastname,
        createdAt: await formatDate(formData.createdAt),
        status: formData.documentState,
        downloadAccess: downloadAccess,
      };
    }
    if (formData?.documentState === "IN_APPROVAL") {
      requiredDetails = {
        documentLink: response.data,
        title: formData.documentName,
        documentNo: formData.documentNumbering,
        location: formData.locationName,
        system: formData.systemNames.map((item: any) => item.name).join(", "),
        issueNo: formData.issueNumber,
        revisionNo: formData.currentVersion,
        createdBy:
          formData.creators[0].firstname + " " + formData.creators[0].lastname,
        createdAt: await formatDate(formData.createdAt),
        reviewedBy:
          formData.reviewers[0].firstname +
          " " +
          formData.reviewers[0].lastname,
        reviewedAt: await formatDate(formData.reviewers[0].updatedAt),
        status: formData.documentState,
        downloadAccess: downloadAccess,
      };
    }
    if (
      formData?.documentState === "PUBLISHED" ||
      formData?.documentState === "OBSOLETE"
    ) {
      requiredDetails = {
        documentLink: response.data,
        title: formData.documentName,
        documentNo: formData.documentNumbering,
        location: formData.locationName,
        system: formData.systemNames.map((item: any) => item.name).join(", "),
        issueNo: formData.issueNumber,
        revisionNo: formData.currentVersion,
        effectiveDate: await formatDate(formData.approvedDate),
        createdBy:
          formData.creators[0].firstname + " " + formData.creators[0].lastname,
        createdAt: await formatDate(formData.createdAt),
        reviewedBy:
          formData.reviewers[0].firstname +
          " " +
          formData.reviewers[0].lastname,
        reviewedAt: await formatDate(formData.reviewers[0].updatedAt),
        approvedBy:
          formData.approvers[0].firstname +
          " " +
          formData.approvers[0].lastname,
        approvedAt: await formatDate(formData.approvedDate),
        status: formData.documentState,
        downloadAccess: downloadAccess,
      };
    }
    const formDataJSON = JSON.stringify(requiredDetails);
    const encodedFormData = encodeURIComponent(formDataJSON);
    window.AceBrowser.openWindowModeless(
      process.env.REACT_APP_API_URL +
        "/aceoffix/view?formData=" +
        encodedFormData,
      "width=1200px;height=800px;"
    );
  };

  const documentDownloadAccess = async () => {
    try {
      const isOrgAdmin = checkRoles("ORG-ADMIN");
      const isMr =
        checkRole("MR") && currentUser.locationId === formData.locationId;
      const isCreator = formData?.creators?.some(
        (item: any) => item.id === currentUser?.id
      );
      const isReviewer = formData?.reviewers?.some(
        (item: any) => item.id === currentUser?.id
      );
      const isApprover = formData?.approvers?.some(
        (item: any) => item.id === currentUser?.id
      );
      const deptHead = await axios.get(
        `${API_LINK}/api/entity/getEntityHead/byEntityId/${formData?.entityId}`
      );
      const isDeptHead = Array.isArray(deptHead?.data)
        ? deptHead?.data.some((item: any) => item.id === currentUser?.id)
        : false;

      const functionSpoc = await axios.get(
        `${API_LINK}/api/entity/getFunctionByLocation/${formData?.locationId}`
      );
      const isFunctionSpoc = Array.isArray(functionSpoc?.data)
        ? functionSpoc?.data?.some((item: any) =>
            item.functionSpoc.includes(currentUser?.id)
          )
        : false;

      if (
        isOrgAdmin ||
        isMr ||
        isCreator ||
        isReviewer ||
        isApprover ||
        isDeptHead ||
        isFunctionSpoc
      ) {
        setDownloadAccess(true);
      } else {
        setDownloadAccess(false);
      }
    } catch {
      setDownloadAccess(false);
    }
  };
  const openAceoffixNew = async (formData: any) => {
    let requiredDetails = {};
    let response = { data: formData.documentLinkNew };
    if (process.env.REACT_APP_IS_OBJECT_STORAGE === "true") {
      response = await axios.post(`${API_LINK}/api/documents/viewerOBJ`, {
        documentLink: formData.documentLinkNew,
      });
    }

    if (
      formData?.documentState === "DRAFT" ||
      formData?.documentState === "IN_REVIEW"
    ) {
      requiredDetails = {
        documentLink: response.data,
        title: formData.documentName,
        location: formData.locationName,
        system: formData.systemNames.map((item: any) => item.name).join(", "),
        issueNo: formData.issueNumber,
        revisionNo: formData.currentVersion,
        createdBy:
          formData.creators[0].firstname + " " + formData.creators[0].lastname,
        createdAt: await formatDate(formData.createdAt),
        status: formData.documentState,
        downloadAccess: downloadAccess,
      };
    }
    if (formData?.documentState === "IN_APPROVAL") {
      requiredDetails = {
        documentLink: response.data,
        title: formData.documentName,
        documentNo: formData.documentNumbering,
        location: formData.locationName,
        system: formData.systemNames.map((item: any) => item.name).join(", "),
        issueNo: formData.issueNumber,
        revisionNo: formData.currentVersion,
        createdBy:
          formData.creators[0].firstname + " " + formData.creators[0].lastname,
        createdAt: await formatDate(formData.createdAt),
        reviewedBy:
          formData.reviewers[0].firstname +
          " " +
          formData.reviewers[0].lastname,
        reviewedAt: await formatDate(formData.reviewers[0].updatedAt),
        status: formData.documentState,
        downloadAccess: downloadAccess,
      };
    }
    if (
      formData?.documentState === "PUBLISHED" ||
      formData?.documentState === "OBSOLETE"
    ) {
      requiredDetails = {
        documentLink: response.data,
        title: formData.documentName,
        documentNo: formData.documentNumbering,
        location: formData.locationName,
        system: formData.systemNames.map((item: any) => item.name).join(", "),
        issueNo: formData.issueNumber,
        revisionNo: formData.currentVersion,
        effectiveDate: await formatDate(formData.approvedDate),
        createdBy:
          formData.creators[0].firstname + " " + formData.creators[0].lastname,
        createdAt: await formatDate(formData.createdAt),
        reviewedBy:
          formData.reviewers[0].firstname +
          " " +
          formData.reviewers[0].lastname,
        reviewedAt: await formatDate(formData.reviewers[0].updatedAt),
        approvedBy:
          formData.approvers[0].firstname +
          " " +
          formData.approvers[0].lastname,
        approvedAt: await formatDate(formData.approvedDate),
        status: formData.documentState,
        downloadAccess: downloadAccess,
      };
    }
    const formDataJSON = JSON.stringify(requiredDetails);
    const encodedFormData = encodeURIComponent(formDataJSON);
    window.AceBrowser.openWindowModeless(
      process.env.REACT_APP_API_URL +
        "/aceoffix/view?formData=" +
        encodedFormData,
      "width=1200px;height=800px;"
    );
    // window.AceBrowser.openWindowModeless(
    //   "http://localhost:8082/view?formData=" + encodedFormData,
    //   "width=1200px;height=800px;"
    // );
  };

  const compareInterAceoffix = async (formData: any) => {
    let requiredDetails = {};
    let responsePrev: any = "";
    let responseCurr: any = "";
    if (formData.documentState === "IN_APPROVAL") {
      responsePrev = await axios.post(`/api/documents/viewerOBJ`, {
        documentLink: formData.versionInfo.find(
          (item: any) => item.type === "CREATOR"
        ).documentLink,
      });
      responseCurr = await axios.post(`/api/documents/viewerOBJ`, {
        documentLink: formData.versionInfo.find(
          (item: any) => item.type === "REVIEWER"
        ).documentLink,
      });
    }
    if (formData.documentState === "PUBLISHED") {
      responsePrev = await axios.post(`/api/documents/viewerOBJ`, {
        documentLink: formData.versionInfo.find(
          (item: any) => item.type === "REVIEWER"
        ).documentLink,
      });
      responseCurr = await axios.post(`/api/documents/viewerOBJ`, {
        documentLink: formData.versionInfo.find(
          (item: any) => item.type === "APPROVER"
        ).documentLink,
      });
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
  const renderWorkflowButton = () => {
    const userId = userDetails?.id;
    const state = formData?.documentState;
    const isDigitalSignatureEnabled =
      userDetails?.organization?.digitalSignature === true;

    if (!formData || !userId) return null;

    const executeWithOptionalSignature = (action: () => void) => {
      // console.log("action ", action);
      if (isDigitalSignatureEnabled) {
        setSignatureHandler(() => action);
        setSignModalOpen(true);
      } else {
        action();
      }
    };

    if (formData?.workflowDetails === "default") {
      const canReview = checkIfLoggedInUserCanReview(formData, userId);
      const canApprove = checkIfLoggedInUserCanApprove(formData, userId);
      const hasCreateAccess = checkIfLoggedInUserHasCreateAccess(
        formData,
        userId
      );

      if (state === "DRAFT" || state === "Sent_For_Edit") {
        return (
          <Button
            type="default"
            onClick={() => executeWithOptionalSignature(handleSendForReview)}
          >
            Send For Review
          </Button>
        );
      }

      if (state === "IN_REVIEW" && canReview) {
        return (
          <Button
            type="default"
            onClick={() => executeWithOptionalSignature(handleSendForApproval)}
          >
            Review Complete
          </Button>
        );
      }

      if (state === "IN_APPROVAL" && canApprove) {
        return (
          <Button
            type="default"
            onClick={() => executeWithOptionalSignature(handleApprove)}
          >
            Approve
          </Button>
        );
      }

      if (
        state === "PUBLISHED" &&
        (canApprove || canReview || hasCreateAccess)
      ) {
        return (
          <Button
            type="default"
            onClick={() =>
              executeWithOptionalSignature(() => setShowAmendConfirmModal(true))
            }
          >
            Amend
          </Button>
        );
      }
    } else {
      const workflow = formData?.workflowDetails.workflow;
      const currentStageIndex = workflow.findIndex(
        (item: any) => item.stage === state
      );
      const isCreator = formData?.createdBy === userId;

      const hasAccessToStage = (index: number) => {
        const stage = workflow[index];
        if (!Array.isArray(stage?.ownerSettings)) return false;

        return stage.ownerSettings.some(
          (group: any) =>
            Array.isArray(group) &&
            group.some(
              (condition) =>
                condition.status === "pending" &&
                (condition.selectedUsers || []).some(
                  (user: any) => user.id === userId
                )
            )
        );
      };

      if (state === "DRAFT" && isCreator) {
        return (
          <Button
            type="default"
            onClick={() =>
              executeWithOptionalSignature(() => handleCustomWorkflow("DRAFT"))
            }
          >
            Send For {workflow[0].stage}
          </Button>
        );
      }

      if (currentStageIndex !== -1) {
        const currentStage = workflow[currentStageIndex];

        if (hasAccessToStage(currentStageIndex)) {
          return (
            <>
              <Button
                type="default"
                onClick={() =>
                  executeWithOptionalSignature(
                    () =>
                      handleDocumentAction(
                        `/api/documents/updateDocumentForCustomWorkflow/${formData?._id}`,

                        currentStage.stage
                      )
                    // handleCustomWorkflow(currentStage.stage)
                  )
                }
              >
                Complete
              </Button>

              {currentStage.sendForEdit && (
                <Button
                  type="default"
                  onClick={() =>
                    executeWithOptionalSignature(() =>
                      handleCustomWorkflow("Send For Edit", currentStage.stage)
                    )
                  }
                >
                  Send For Edit
                </Button>
              )}
            </>
          );
        }
      }

      if (currentStageIndex === -1 && isCreator) {
        return (
          <Button
            type="default"
            onClick={() =>
              executeWithOptionalSignature(() =>
                handleCustomWorkflowAmmend(state)
              )
            }
          >
            Amend
          </Button>
        );
      }
    }

    return null;
  };

  const formatDate = async (isoString: string) => {
    const date = new Date(isoString);

    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // getUTCMonth() is zero-based
    const year = date.getUTCFullYear();

    return `${day}-${month}-${year}`;
  };

  if (mobView) {
    return (
      <Paper elevation={0} className={classes.paper}>
        <div className={classes.headerMobile}>
          {renderedFrom === "inbox" ? (
            <div style={{ marginTop: 15 }}>{name}</div>
          ) : (
            <Button
              data-testid="single-form-wrapper-button"
              onClick={() => {
                navigate(parentPageLink);
              }}
              className={classes.btn}
            >
              <MdChevronLeft fontSize="small" />
              Back
            </Button>
          )}
          {/* <IconButton onClick={handleEditDocument}>
            <Tooltip title="Edit Document">
              <CustomEditIcon
                // onClick={handleFavorite}
                className={classes.starIcon}
                style={{ marginRight: matches ? "30px" : "0px" }}
              />
            </Tooltip>
          </IconButton> */}

          <Tooltip title="View Creator,Reviewer(S) and Approver(S)">
            <MdPeople
              onClick={togglePeopleDrawer}
              className={classes.commentsIcon}
              style={{ marginRight: matches ? "30px" : "0px" }}
            ></MdPeople>
          </Tooltip>

          {favorite ? (
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
          {/* {process.env.REACT_APP_IS_ACEOFFIX === "true" && (
            <IconButton
            // onClick={handleFavorite}
            // style={{
            //   paddingLeft: matches ? "12px" : "6px",
            //   paddingRight: matches ? "12px" : "6px",
            // }}
            >
              {formData?.documentLink &&
                (formData?.documentLink?.toLowerCase().endsWith(".docx") ||
                  formData?.documentLink?.toLowerCase().endsWith(".xlsx") ||
                  formData?.documentLink?.toLowerCase().endsWith(".xls") ||
                  formData?.documentLink?.toLowerCase().endsWith(".ppt") ||
                  formData?.documentLink?.toLowerCase().endsWith(".pptx") ||
                  formData?.documentLink?.toLowerCase().endsWith(".doc")) && (
                  <Tooltip title="Download Controlled Copy">
                    <span>
                      <ImDownload
                        onClick={() => openAceoffixNew(formData)}
                        className={classes.imIcon}
                        style={{ marginRight: matches ? "30px" : "0px" }}
                      />
                    </span>
                  </Tooltip>
                )}
            </IconButton>
          )} */}
          {/* {docState && (
            // <div className={classes.formInfoSectionMobile}>
            //   {`Document State : ${docState}`}
            // </div>
            <div className={classes.formInfoSectionMobile}>
              {renderTag(formData.documentState)}
            </div>
          )} */}
          {docAccessType && (
            <div className={classes.formInfoSectionMobile}>
              {`Document Access : ${docAccessType}`}
            </div>
          )}
        </div>
        <div className={classes.formContainer}>{children}</div>
        <div className={classes.mobViewBtnSection}>
          <CustomButtonGroup
            options={options}
            handleSubmit={handleSubmit}
            disableBtnFor={disableBtnFor}
          />
        </div>
      </Paper>
    );
  }

  return (
    <>
      <Paper elevation={0} className={classes.paper}>
        <div className={classes.header}>
          {renderedFrom === "inbox" ? (
            <>
              {matches ? (
                <div
                  style={{
                    marginTop: 15,
                    paddingLeft: matches ? "10px" : "0px",
                  }}
                >
                  <strong>{name}</strong>
                </div>
              ) : (
                ""
              )}
            </>
          ) : (
            <Button
              data-testid="single-form-wrapper-button"
              onClick={() => {
                navigate(parentPageLink);
              }}
              className={classes.btn}
            >
              <MdChevronLeft fontSize="small" />
              Back
            </Button>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              marginRight: "10px",
              gap: matches ? "0px" : "3px",
            }}
          >
            {matches ? (
              <>
                {/* <IconButton onClick={handleEditDocument}>
                  <Tooltip title="Edit Document">
                    <CustomEditIcon
                      onClick={handleEditDocument}
                      // className={classes.starIcon}
                    />
                  </Tooltip>
                </IconButton> */}
              </>
            ) : (
              <></>
            )}
            <IconButton
              style={{
                paddingLeft: matches ? "12px" : "6px",
                paddingRight: matches ? "12px" : "6px",
              }}
            >
              <Tooltip title="View Creator,Reviewer(S) and Approver(S)">
                <MdPeople
                  onClick={togglePeopleDrawer}
                  className={classes.commentsIcon}
                  style={{ marginRight: matches ? "30px" : "0px" }}
                ></MdPeople>
              </Tooltip>
            </IconButton>
            {/* {process.env.REACT_APP_IS_ACEOFFIX === "true" &&
              (formData?.documentLink?.toLowerCase().endsWith(".docx") ||
                formData?.documentLink?.toLowerCase().endsWith(".xlsx") ||
                formData?.documentLink?.toLowerCase().endsWith(".xls") ||
                formData?.documentLink?.toLowerCase().endsWith(".ppt") ||
                formData?.documentLink?.toLowerCase().endsWith(".pptx") ||
                formData?.documentLink?.toLowerCase().endsWith(".doc")) && (
                <Tooltip title="VIEW DOCUMENT">
                  <MdVisibility
                    onClick={() => openAceoffix(formData)}
                    className={classes.visibilityIcon}
                    style={{
                      fontSize: "30px",
                      color: "#0E497A",
                    }}
                  />
                </Tooltip>
              )} */}
            {/* {(process.env.REACT_APP_IS_ACEOFFIX === "true") && (formData?.documentLink.endsWith(".docx")) && (
              (() => {
                const status = formData?.documentState;
                const creatorDocCode = formData?.versionInfo?.find((item: any) => item.type === "CREATOR")?.docCode;
                const reviewerDocCode = formData?.versionInfo?.find((item: any) => item.type === "REVIEWER")?.docCode;
                const approverDocCode = formData?.versionInfo?.find((item: any) => item.type === "APPROVER")?.docCode;
                if ((status === "IN_APPROVAL" && reviewerDocCode !== creatorDocCode) ||
                  (status === "PUBLISHED" && approverDocCode !== reviewerDocCode)) {
                  return (
                    <Tooltip title="COMPARE">
                      <MdCompareArrows
                        onClick={() => compareInterAceoffix(formData)}
                        className={classes.compareIcon}
                        style={{
                          fontSize: "30px",
                          color: "#0E497A",
                          marginLeft: "10px"
                        }}
                      />
                    </Tooltip>
                  )
                }
              }
              )())} */}
            <IconButton
              onClick={handleFavorite}
              style={{
                paddingLeft: matches ? "12px" : "6px",
                paddingRight: matches ? "12px" : "6px",
              }}
            >
              {favorite ? (
                <Tooltip title="Remove favorite">
                  <StarFilledIcon
                    // onClick={handleFavorite}
                    className={classes.starIcon}
                    style={{ marginRight: matches ? "30px" : "0px" }}
                  />
                </Tooltip>
              ) : (
                <Tooltip title="Add favorite">
                  <MdStarBorder
                    style={{
                      marginRight: matches ? "30px" : "0px",
                      width: "32px",
                      height: "35px",
                      cursor: "pointer",
                    }}
                  />
                </Tooltip>
              )}
            </IconButton>

            {/* {process.env.REACT_APP_IS_ACEOFFIX === "true" && (
              <IconButton
                // onClick={handleFavorite}
                style={{
                  paddingLeft: matches ? "12px" : "6px",
                  paddingRight: matches ? "12px" : "6px",
                }}
              >
                {formData?.documentLink &&
                  (formData?.documentLink?.toLowerCase().endsWith(".docx") ||
                    formData?.documentLink?.toLowerCase().endsWith(".xlsx") ||
                    formData?.documentLink?.toLowerCase().endsWith(".xls") ||
                    formData?.documentLink?.toLowerCase().endsWith(".ppt") ||
                    formData?.documentLink?.toLowerCase().endsWith(".pptx") ||
                    formData?.documentLink?.toLowerCase().endsWith(".doc")) && (
                    <Tooltip title="Download Controlled Copy">
                      <span>
                        <ImDownload
                          onClick={() => openAceoffixNew(formData)}
                          className={classes.imIcon}
                          style={{ marginRight: matches ? "30px" : "0px" }}
                        />
                      </span>
                    </Tooltip>
                  )}
              </IconButton>
            )} */}

            {matches ? (
              <></>
            ) : (
              <>
                <IconButton onClick={handlerButtonStatus}>
                  <MdInfo />
                </IconButton>
              </>
            )}
            {formData?.documentState &&
              (() => {
                const statusMap: Record<
                  string,
                  { label: string; color: string }
                > = {
                  DRAFT: { label: "Draft", color: "#e6f7ff" },
                  IN_REVIEW: { label: "In Review", color: "#d9f7be" },
                  IN_APPROVAL: { label: "In Approval", color: "#fff1b8" },
                  PUBLISHED: { label: "Published", color: "#f6ffed" },
                  Sent_For_Edit: { label: "Sent for Edit", color: "#fff2e8" },
                  OBSOLETE: { label: "Obsolete", color: "#f9f0ff" },
                };

                const { label, color } = statusMap[formData?.documentState] || {
                  label: docState,
                  color: "#f0f0f0", // default color
                };

                return (
                  <div
                    className={classes.formInfoSection}
                    style={{ backgroundColor: color }}
                  >
                    {label}
                  </div>
                );
              })()}

            {/* {docAccessType && (
              <div className={classes.formInfoSection}>
                {`Document Access : ${docAccessType}`}
              </div>
            )} */}
            <div style={{ display: "flex", gap: 8 }}>
              {renderWorkflowButton()}
              {(formData?.documentState === "IN_REVIEW" ||
                formData?.documentState === "IN_APPROVAL") && (
                <Button type="default" onClick={handleSendForEdit}>
                  Send For Edit
                </Button>
              )}
            </div>
            {/* <CustomButtonGroup
            options={options}
            handleSubmit={handleSubmit}
            disableBtnFor={disableBtnFor}
          /> */}
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <div style={{ width: "50%", position: "absolute", top: 0, right: 0 }}>
            {!!peopleDrawer.open && (
              <PeopleDrawer
                peopleDrawer={peopleDrawer}
                setPeopleDrawer={setPeopleDrawer}
                togglePeopleDrawer={togglePeopleDrawer}
                formData={!!formData && formData}
              />
            )}
          </div>
        </div>
        <div className={classes.formContainer}>{children}</div>
      </Paper>
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
          onOk={() => setopenModalForComment(false)}
          onCancel={() => {
            // setOpenModal(false);
            setopenModalForComment(false);
          }}
          footer={[
            <AntButton
              key="submit"
              type="primary"
              style={{ backgroundColor: "#003059" }}
              onClick={() => {
                setopenModalForComment(false);
              }}
            >
              Cancel
            </AntButton>,
            <AntButton
              key="submit"
              type="primary"
              style={{ backgroundColor: "#003059" }}
              onClick={async () => {
                await handleCommentSubmit(commnetValue);
                await handleSubmit("Send for Edit", true);
                // setEditTrue(false);
              }}
            >
              Submit
            </AntButton>,
          ]}
          // okText="Yes"
          okType="danger"
          // cancelText="No"
        />
      </div>
      <div>{showAmendConfirmModal && renderAmendConfirmModal()}</div>

      <SignatureComponent
        userData={userDetails}
        action={null}
        onClose={onclose}
        open={signModalOpen}
        handleMarkDone={signatureHandler}
        comment={digiSignComment}
        setComment={setComment}
      ></SignatureComponent>
    </>
  );
}

export default ProcessDocFormWrapper;
