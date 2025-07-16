import { useEffect, useRef, useState } from "react";
import {
  Modal,
  Tabs,
  Form,
  Input,
  Button,
  Upload,
  message,
  Card,
  Spin,
  Space,
} from "antd";

import { MdCheckCircleOutline } from "react-icons/md";
import { makeStyles } from "@material-ui/core/styles";
import { RiInbox2Fill } from "react-icons/ri";

import CustomMultiSelect from "components/ReusableComponents/CustomMultiSelect";
import axios from "apis/axios.global";
import {
  CardActionArea,
  CardContent,
  Typography,
  MenuItem,
  Select,
  TextField,
  Box,
} from "@material-ui/core";
import clsx from "clsx";
import { Select as AntSelect } from "antd";
import getAppUrl from "utils/getAppUrl";
import getSessionStorage from "utils/getSessionStorage";
import SignatureComponent from "components/ReusableComponents/SignatureComponent";

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Dragger } = Upload;

const checkIfLoggedInUserCanReview = (docData: any, userId: any) => {
  if (!docData?.reviewers || !userId) return false;
  return docData.reviewers.includes(userId);
};

const checkIfLoggedInUserCanApprove = (docData: any, userId: any) => {
  if (!docData?.approvers || !userId) return false;
  return docData.approvers.includes(userId);
};

const checkIfLoggedInUserHasCreateAccess = (docData: any, userDetails: any) => {
  const accessType = docData?.docTypeDetails?.docCreateAccess;
  const accessIds = docData?.docTypeDetails?.docCreateAccessIds || [];

  // console.log("checkdoc8 accessType", accessType);

  // console.log("checkdoc8 accessIds", accessIds);
  const userId = userDetails?.id;
  const userEntityId = userDetails?.entityId ?? userDetails?.entity?.id;
  const userLocationId = userDetails?.locationId || userDetails?.location?.id;

  if (accessType === "All Users") {
    return true;
  }

  if (accessType === "Selected Users") {
    return accessIds.includes(userId);
  }

  if (accessType === "All in Entities") {
    // console.log("checkdoc8 userEntityId", userEntityId);
    // console.log("checkdoc8 accessIds", accessIds);
    // console.log("checkdoc8 inside all in entities", accessIds?.includes(userEntityId));

    if (userDetails.userType === "globalRoles") {
      const responsibleLocation = userDetails.additionalUnits.map(
        (item: any) => item.id
      );
      return responsibleLocation.includes(docData.locationId);
    }
    return accessIds.includes(userEntityId);
  }

  if (accessType === "All in Units") {
    if (userDetails.userType === "globalRoles") {
      const responsibleLocation = userDetails.additionalUnits.map(
        (item: any) => item.id
      );
      return responsibleLocation.includes(docData.locationId);
    }
    return accessIds.includes(userLocationId);
  }
  if (["PIC", "Head"].includes(accessType)) {
    // For both PIC and Head, accessIds hold selected entityIds
    return accessIds.includes(userEntityId);
  }

  return false;
};

const useStyles = makeStyles(() => ({
  systemCard: {
    marginBottom: 12,
    borderRadius: 6,
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    height: "50px",
    display: "flex",
    alignItems: "center",
    textAlign: "center",
    fontSize: 12,
    "& .ant-card-body": {
      width: "100% !important",
    },
  },
  cardSelected: {
    border: "2px solid rgb(0, 48, 89)",
    "& .ant-card .ant-card-body": {
      width: "100% !important",
    },
  },
  uploadInput: {
    display: "none",
  },
  uploadContainer: {
    border: "1px dashed #aaa",
    borderRadius: 6,
    padding: 16,
    cursor: "pointer",
    textAlign: "center",
  },
  wrapper: {
    backgroundColor: "#f4f4f5",
    borderRadius: 6,
    padding: "2px 3px",
    margin: "19px 0.4px 22px 0",
    width: "fit-content",
  },
  tabBarStyle: {
    display: "flex",
    gap: "8px",
  },
  tabItem: {
    width: "132px",
    height: "36px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "2px",
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    fontWeight: 500,
    fontSize: "14px",
  },
  customTabWrapper: {
    backgroundColor: "#f4f4f5",
    borderRadius: 6,
    padding: "2px 3px",
    margin: "19px 0.4px 22px 0",
    display: "flex",
    gap: "6px",
    width: "fit-content",
  },
  customTab: {
    width: "132px",
    height: "36px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "2px",
    fontWeight: 500,
    fontSize: "14px",
    backgroundColor: "#f4f4f5",
    cursor: "pointer",
    transition: "all 0.2s ease-in-out",
  },
  activeTab: {
    backgroundColor: "#fff",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
}));

const showValidationErrors = (errors: string[]) => {
  message.error(
    <span>
      {errors.map((err, idx) => (
        <span key={idx}>
          {err}
          <br />
        </span>
      ))}
    </span>
  );
};

const extractOriginalFilename = (filename: string) => {
  const lastDoubleUnderscoreIndex = filename.lastIndexOf("__");
  const extension = filename.slice(filename.lastIndexOf("."));
  if (lastDoubleUnderscoreIndex !== -1) {
    return filename.slice(0, lastDoubleUnderscoreIndex) + extension;
  }
  return filename; // fallback if __ not found
};

type Props = {
  editModal: any;
  handleModalClose: any;
  reloadTableDataAfterSubmit?: any;
};

const DocumentEditModal = ({
  editModal = false,
  handleModalClose,
  reloadTableDataAfterSubmit,
}: Props) => {
  const classes = useStyles();
  const realmName = getAppUrl();
  const userDetails = getSessionStorage();
  const tabList = ["Details", "Systems", "Files", "Workflow"];
  const [activeTab, setActiveTab] = useState("Details");
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<any>({
    documentTitle: "",
    documentType: "Lorem Ipsum",
    description: "",
    selectedSystem: [],
    file: null,
    reviewers: [],
    approvers: [],
    workflowId: "",
  });
  const [file, setFile] = useState<any>(null);
  const [docTypes, setDocTypes] = useState<any>([]);
  const [fullDocTypes, setFullDocTypes] = useState<any>([]);
  const [selectedDocType, setSelectedDocType] = useState<any>();
  const [documentType, setDocumentType] = useState<any>();
  const [docData, setDocData] = useState<any>(null);
  const [reviewerOptions, setReviewerOptions] = useState<any>([]);
  const [approverOptions, setApproverOptions] = useState<any>([]);
  const [systemOptions, setSystemOptions] = useState<any>([]);
  const [showAmendConfirmModal, setShowAmendConfirmModal] =
    useState<any>(false);
  const [signModalOpen, setSignModalOpen] = useState<Boolean>(false);
  const digiSignCommentRef = useRef("");
  const [digiSignComment, setDigiSignComment] = useState<any>("");
  const [signatureHandler, setSignatureHandler] = useState<() => void>(
    () => () => {}
  );
  const [customWorkflowEditAccess, setCustomWorkflowEditAccess] =
    useState(false);

  const [allUsersLocations, setAllUsersLocations] = useState<any[]>([]);
  const [allUsersDept, setAllUsersDept] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        await Promise.all([
          getReviewers(),
          getApprovers(),
          getDocumentDetails(editModal?.id),
          getDocTypes(),
        ]);
      } catch (err) {
        // console.error("Error loading modal data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!!editModal?.open && editModal?.id) {
      fetchAll();
    }
  }, [editModal]);

  // useEffect(() => {
  //   console.log("docData", docData);
  // }, [docData]);

  // useEffect(() => {
  //   console.log("formData", formData);
  // }, [formData]);

  // useEffect(() => {
  //   console.log("file useEffect", file);
  // }, [file]);

  const getReviewers = async () => {
    try {
      const res = await axios.get(`/api/roles/workFlowDistributionReviewer`);
      if (res?.data) {
        const userOptions = res.data.map((user: any) => ({
          userId: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          value: user.id,
          label: user.firstname + " " + user.lastname,
          email: user.email,
          id: user.id,
          fullname: user.firstname + " " + user.lastname,
          avatar: user.avatar,
          entityName: user?.entity?.entityName,
        }));
        setReviewerOptions(userOptions);
      }
    } catch (error) {
      setReviewerOptions([]);
    }
  };
  // console.log("reviewers", reviewers);
  const getApprovers = async () => {
    try {
      const res = await axios.get(`/api/roles/workFlowDistributionApprover`);
      if (res?.data) {
        const userOptions = res.data.map((user: any) => ({
          userId: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          value: user.id,
          label: user.email,
          email: user.email,
          id: user.id,
          fullname: user.firstname + " " + user.lastname,
          avatar: user.avatar,
          entityName: user?.entity?.entityName,
        }));
        setApproverOptions(userOptions);
      }
    } catch (error) {
      setApproverOptions([]);
    }
  };
  const handleDoctypeChange = (selectedDoctypeId: string) => {
    const selectedDoctype: any = fullDocTypes.find(
      (doc: any) => doc.id === selectedDoctypeId
    );
    setSelectedDocType(selectedDoctypeId);
    const workflowDetails = fullDocTypes.find(
      (item: any) => item.id === selectedDoctypeId
    ).workflowDetails;
    setFormData({
      ...formData,
      doctypeId: selectedDoctypeId,
      workflowDetails: workflowDetails,
      selectedSystem: [],
      system: [],
    });
    if (selectedDoctype) {
      const mappedSystems = (selectedDoctype.applicableSystems || []).map(
        (system: any) => ({
          id: system.id,
          name: system.name,
        })
      );
      setSystemOptions(mappedSystems);
    } else {
      setSystemOptions([]);
    }
  };
  // console.log("editmodal", editModal);
  const getDocumentDetails = async (docId: any = "") => {
    try {
      const res = await axios.get(`/api/documents/getSingleDocument/${docId}`);
      if (res?.data) {
        const doc = res.data;
        setDocData({
          ...doc,
        });
        const workflowDetails = doc.workflowDetails
          ? { data: doc.workflowDetails }
          : doc.docTypeDetails.workflowId === "default"
          ? { data: "default" }
          : await axios.get(
              `/api/global-workflow/getGlobalWorkflowForTranscation/${doc.docTypeDetails.workflowId}`
            );
        setSelectedDocType(doc?.docTypeDetails?.id);
        setFormData({
          documentTitle: doc?.documentName || "",
          documentType: doc?.docTypeDetails?.documentTypeName || "",
          doctypeId: doc?.docTypeDetails?.id,
          description: doc?.reasonOfCreation || "",
          selectedSystem: doc?.system || [],
          documentState: doc?.documentState,
          reviewers: doc?.reviewers || [],
          approvers: doc?.approvers || [],
          workflowDetails: workflowDetails.data,
        });
        if (
          doc.documentState !== "DRAFT" &&
          doc.documentState !== "PUBLISHED" &&
          doc.workflowDetails !== "default" &&
          doc.workflowDetails !== "none"
        ) {
          const currentStageIndex = doc.workflowDetails.workflow.findIndex(
            (item: any) => item.stage === doc.documentState
          );
          if (doc.workflowDetails.workflow[currentStageIndex]?.edit) {
            setCustomWorkflowEditAccess(false);
          } else {
            setCustomWorkflowEditAccess(true);
          }
        }
        const rawFileName = doc?.documentLink?.split("/")?.pop();
        const originalName = extractOriginalFilename(rawFileName || "");

        if (doc?.documentLink) {
          const rawFileName = doc?.documentLink?.split("/")?.pop();
          const originalName = extractOriginalFilename(rawFileName || "");

          setFile({
            uid: "-1",
            name: originalName,
            status: "done",
            url: doc?.documentLink,
            originalRawName: rawFileName,
          });
        } else {
          setFile(null); // Ensure no file is set if documentLink is empty
        }

        // Set system options using docTypeDetails if present
        if (doc?.docTypeDetails?.applicable_systems) {
          const mapped = doc.docTypeDetails.applicable_systems.map(
            (sys: any) => ({
              id: sys._id,
              name: sys.name,
            })
          );
          setSystemOptions(mapped);
        }
        setSelectedLocation(doc.locationId);
        setSelectedEntity(doc.entityId);
        if (doc.documentState === "DRAFT") {
          if (userDetails.userType === "globalRoles") {
            const resLocation = await axios(
              `/api/user/getGlobalUsersLocations`
            );
            setAllUsersLocations(resLocation.data);
            const resEntity = await axios(
              `/api/entity/getEntityByLocationId/${doc.locationId}`
            );
            setAllUsersDept(resEntity.data);
          } else {
            const locationDetails = doc.locationDetails.find(
              (item: any) => item.id === doc.locationId
            );
            setAllUsersLocations([
              {
                id: locationDetails.id,
                locationName: locationDetails.locationName,
              },
            ]);
            const resEntity = await axios(`/api/entity/getCreatorsDepartments`);
            setAllUsersDept(resEntity.data);
          }
        } else {
          const locationDetails = doc.locationDetails.find(
            (item: any) => item.id === doc.locationId
          );
          setAllUsersLocations([
            {
              id: locationDetails.id,
              locationName: locationDetails.locationName,
            },
          ]);
          const entityDetails = doc.entityDetails.find(
            (item: any) => item.id === doc.entityId
          );
          setAllUsersDept([
            {
              id: entityDetails.id,
              entityName: entityDetails.entityName,
            },
          ]);
        }
      }
    } catch (error) {
      message.error("Failed to fetch document details");
      console.error("getDocumentDetails error", error);
    }
  };
  // console.log("selecteddcotype", selectedDocType);
  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSystemToggle = (systemId: string) => {
    // console.log("systemId", systemId);
    setFormData((prev: any) => {
      const alreadySelected = prev.selectedSystem.includes(systemId);
      // console.log("alreadySelected", alreadySelected);

      return {
        ...prev,
        selectedSystem: alreadySelected
          ? prev.selectedSystem.filter((id: string) => id !== systemId)
          : [...prev.selectedSystem, systemId],
      };
    });
  };

  const handleFileUpload = (file: any) => {
    handleChange("file", file);
    return false; // Prevent default upload
  };

  const validateForm = (action: string) => {
    const errors: string[] = [];

    // Basic validations for all actions
    if (!formData.documentTitle?.trim()) {
      errors.push("Document Title is required");
    }
    if (!formData.documentType?.trim()) {
      errors.push("Document Type is required");
    }
    if (!formData.description?.trim()) {
      errors.push("Description is required");
    }
    if (!formData.selectedSystem || formData.selectedSystem.length === 0) {
      errors.push("At least one system is required");
    }

    // Additional validations for non-draft actions
    if (action !== "draft") {
      if (!file) {
        errors.push("File attachment is required");
      }

      if (formData.workflowDetails === "default") {
        if (formData.reviewers.length === 0) {
          errors.push("At least one reviewer is required");
        }
        if (formData.approvers.length === 0) {
          errors.push("At least one approver is required");
        }
      }
    }

    return errors;
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
              condition.type === "Head Of" ||
              condition.type === "User Of" ||
              condition.type === "Global Role Of"
            ) {
              return {
                ...rest,
                selectedUsers: selectedUsers.map((user: any) =>
                  typeof user === "object" && user !== null ? user.id : user
                ),
              };
            }

            // For "User Of" or other types
            return {
              ...rest,
              selectedUsers: selectedUsers.map((user: any) => user), // remove this map if you want full user objects
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
      const validationErrors = validateForm(documentState || "draft");
      if (validationErrors.length > 0) {
        message.error(
          <span>
            {validationErrors.map((err, idx) => (
              <span key={idx}>
                {err}
                <br />
              </span>
            ))}
          </span>
        );

        return;
      }

      setLoading(true);
      const formDataPayload = new FormData();

      const trimmedTitle = formData.documentTitle?.trim() || "";
      const trimmedDescription = formData.description?.trim() || "";

      formDataPayload.append("documentName", trimmedTitle);
      formDataPayload.append("reasonOfCreation", trimmedDescription);
      formData.selectedSystem.forEach((id: string) => {
        formDataPayload.append("system", id);
      });

      if (documentState) formDataPayload.append("documentState", documentState);

      formDataPayload.append("realmName", realmName);
      // formDataPayload.append(
      //   "locationName",
      //   userDetails?.location?.locationName
      // );
      formDataPayload.append("locationId", selectedLocation);
      formDataPayload.append("entityId", selectedEntity);
      formDataPayload.append(
        "locationName",
        allUsersLocations.find((item: any) => item.id === selectedLocation)
          .locationName
      );
      formDataPayload.append("updatedBy", userDetails?.id);
      formDataPayload.append("organizationId", userDetails?.organizationId);
      formDataPayload.append("doctypeId", formData?.doctypeId);

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
                      (condition.ifUserSelect
                        ? condition.actualSelectedUsers.some(
                            (user: any) => user === userDetails.id
                          )
                        : condition.type === "User Of" ||
                          condition.type === "Global Role Of"
                        ? condition.selectedUsers.some(
                            (user: any) => user === userDetails.id
                          )
                        : condition.selectedUsers.some(
                            (user: any) => user.id === userDetails.id
                          ))
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
        const allUsersSelectedForWorkflow = workflow?.workflow?.every(
          (item: any) =>
            item?.ownerSettings.every((owner: any) =>
              owner.every((user: any) => {
                if (user?.ifUserSelect) {
                  return user?.actualSelectedUsers?.length > 0;
                } else {
                  return user?.selectedUsers?.length > 0;
                }
              })
            )
        );
        if (!allUsersSelectedForWorkflow) {
          message.error("Select Users for Workflow");
          return;
        }

        formDataPayload.append("workflowDetails", JSON.stringify(workflow));
        if (previousState) {
          formDataPayload.append("previousState", previousState);
        }
      }
      if (userDetails?.organization?.digitalSignature) {
        formDataPayload.append("digiSignComment", digiSignCommentRef.current);
      }
      await axios.patch(url, formDataPayload);
      message.success("Action completed successfully!");
      setDigiSignComment(null);
      reloadTableDataAfterSubmit();
      handleModalClose();
    } catch (error) {
      console.error("Update failed", error);
      message.error("Failed to update document.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    const validationErrors = validateForm("draft");
    if (validationErrors.length > 0) {
      showValidationErrors(validationErrors);
      return;
    }
    handleDocumentAction(`/api/documents/updateDocInDraftMode/${editModal.id}`);
  };

  const handleSendForReview = () => {
    const validationErrors = validateForm("review");
    if (validationErrors.length > 0) {
      showValidationErrors(validationErrors);
      return;
    }
    handleDocumentAction(
      `/api/documents/updateDocumentForReview/${editModal.id}`,
      "IN_REVIEW"
    );
  };

  const handleSendForApproval = () => {
    const validationErrors = validateForm("approval");
    if (validationErrors.length > 0) {
      showValidationErrors(validationErrors);
      return;
    }
    handleDocumentAction(
      `/api/documents/updateDocumentForApproval/${editModal.id}`,
      "IN_APPROVAL"
    );
  };

  const handleApprove = () => {
    const validationErrors = validateForm("approve");
    if (validationErrors.length > 0) {
      showValidationErrors(validationErrors);
      return;
    }
    handleDocumentAction(
      `/api/documents/updateDocumentForPublishedState/${editModal.id}`,
      "PUBLISHED"
    );
  };

  const handleSendForEdit = () => {
    const validationErrors = validateForm("edit");
    if (validationErrors.length > 0) {
      showValidationErrors(validationErrors);
      return;
    }
    handleDocumentAction(
      `/api/documents/updateDocumentForSendForEdit/${editModal.id}`,
      "Sent_For_Edit"
    );
  };

  const handleAmend = () => {
    const validationErrors = validateForm("amend");
    if (validationErrors.length > 0) {
      showValidationErrors(validationErrors);
      return;
    }
    handleDocumentAction(
      `/api/documents/updateDocumentForAmend/${editModal.id}`,
      "PUBLISHED"
    );
  };

  const handleCustomWorkflowAmmend = (stage: any) => {
    const validationErrors = validateForm("amend");
    if (validationErrors.length > 0) {
      showValidationErrors(validationErrors);
      return;
    }
    handleDocumentAction(
      `/api/documents/updateDocumentForAmend/${editModal.id}`,
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

    setFormData((prev: any) => ({
      ...prev,
      [field]: valuesArray,
    }));
  };

  const handleCustomWorkflow = (status: any, currentStatus?: any) => {
    const validationErrors = validateForm("workflow");
    if (validationErrors.length > 0) {
      showValidationErrors(validationErrors);
      return;
    }
    handleDocumentAction(
      `/api/documents/updateDocumentForCustomWorkflow/${editModal.id}`,
      status,
      currentStatus
    );
  };

  const uploadProps = {
    name: "file",
    multiple: false,
    showUploadList: true,
    beforeUpload: (newFile: any) => {
      setFile(newFile);
      return false;
    },
    fileList: file ? [file] : [],
    onRemove: () => setFile(null),
  };

  const renderWorkflowButton = () => {
    const userId = userDetails?.id;
    const state = docData?.documentState;
    // console.log("state", state);

    if (!docData || !userId) return null;

    if (docData.workflowDetails === "default") {
      const canReview = checkIfLoggedInUserCanReview(docData, userId);
      const canApprove = checkIfLoggedInUserCanApprove(docData, userId);
      const hasCreateAccess = checkIfLoggedInUserHasCreateAccess(
        docData,
        userDetails
      );

      if (state === "DRAFT" || state === "Sent_For_Edit") {
        return (
          <Button
            type="default"
            onClick={() => {
              if (userDetails?.organization?.digitalSignature) {
                setSignatureHandler(() => handleSendForReview);
                setSignModalOpen(true);
              } else {
                handleSendForReview();
              }
            }}
          >
            Send For Review
          </Button>
        );
      }

      if (state === "IN_REVIEW" && canReview) {
        return (
          <Button
            type="default"
            onClick={() => {
              if (userDetails?.organization?.digitalSignature) {
                setSignatureHandler(() => handleSendForApproval);
                setSignModalOpen(true);
              } else {
                handleSendForApproval();
              }
            }}
          >
            Review Complete
          </Button>
        );
      }

      if (state === "IN_APPROVAL" && canApprove) {
        return (
          <Button
            type="default"
            //onClick={handleApprove}
            onClick={() => {
              if (userDetails?.organization?.digitalSignature) {
                setSignatureHandler(() => handleApprove);
                setSignModalOpen(true);
              } else {
                handleApprove();
              }
            }}
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
          <Button type="default" onClick={() => setShowAmendConfirmModal(true)}>
            Amend
          </Button>
        );
      }
    } else {
      const workflow = docData.workflowDetails.workflow;
      const currentStageIndex = workflow.findIndex(
        (item: any) => item.stage === state
      );
      const isCreator = docData.createdBy === userId;

      const hasAccessToStage = (index: number) => {
        const stage = workflow[index];
        if (!Array.isArray(stage?.ownerSettings)) return false;

        return stage.ownerSettings.some(
          (group: any) =>
            Array.isArray(group) &&
            group.some(
              (condition) =>
                condition.status === "pending" &&
                (condition.ifUserSelect
                  ? (condition.actualSelectedUsers || []).some(
                      (user: any) => user === userId
                    )
                  : (condition.selectedUsers || []).some(
                      (user: any) => user.id === userId
                    ))
            )
        );
      };

      if (state === "DRAFT" && isCreator) {
        return (
          <Button
            type="default"
            onClick={() => {
              if (userDetails?.organization?.digitalSignature) {
                setSignatureHandler(() => () => handleCustomWorkflow("DRAFT"));
                setSignModalOpen(true);
              } else {
                handleCustomWorkflow("DRAFT");
              }
            }}
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
                onClick={() => {
                  if (userDetails?.organization?.digitalSignature) {
                    setSignatureHandler(
                      () => () =>
                        handleCustomWorkflow(
                          currentStage.stage,
                          currentStage.stage
                        )
                    );
                    setSignModalOpen(true);
                  } else {
                    handleCustomWorkflow(
                      currentStage.stage,
                      currentStage.stage
                    );
                  }
                }}
              >
                Complete {currentStage.stage}
              </Button>

              {currentStage.sendForEdit && (
                <Button
                  type="default"
                  onClick={() => {
                    if (userDetails?.organization?.digitalSignature) {
                      setSignatureHandler(
                        () => () =>
                          handleCustomWorkflow(
                            "Send For Edit",
                            currentStage.stage
                          )
                      );
                      setSignModalOpen(true);
                    } else {
                      handleCustomWorkflow("Send For Edit", currentStage.stage);
                    }
                  }}
                >
                  Send For Edit
                </Button>
              )}
            </>
          );
        }
      }

      // Amend case (invalid workflow stage but user is creator)
      if (currentStageIndex === -1 && isCreator) {
        return (
          <Button
            type="default"
            onClick={() => {
              if (userDetails?.organization?.digitalSignature) {
                setSignatureHandler(
                  () => () => handleCustomWorkflowAmmend(state)
                );
                setSignModalOpen(true);
              } else {
                handleCustomWorkflowAmmend(state);
              }
            }}
          >
            Amend
          </Button>
        );
      }
    }
    return null;
  };

  const handleWorkflowUserChange = (
    value: any,
    ifUserSelect: boolean,
    stageIndex: number,
    groupIndex: number,
    condIndex: number
  ) => {
    const updatedWorkflow = [...formData.workflowDetails.workflow];

    // Clone the nested structure safely
    const updatedOwnerSettings = updatedWorkflow[stageIndex].ownerSettings.map(
      (group: any[], gIndex: number) => {
        if (gIndex !== groupIndex) return group;

        return group.map((condition: any, cIndex: number) => {
          if (cIndex !== condIndex) return condition;

          return ifUserSelect
            ? { ...condition, actualSelectedUsers: value }
            : {
                ...condition,
                selectedUsers: value,
              };
        });
      }
    );

    updatedWorkflow[stageIndex].ownerSettings = updatedOwnerSettings;

    setFormData({
      ...formData,
      workflowDetails: {
        ...formData.workflowDetails,
        workflow: updatedWorkflow,
      },
    });
  };
  const getDocTypes = async () => {
    try {
      const res = await axios.get(
        `/api/doctype/getUserAccessibleDoctypes/${editModal?.entityId}`
      );
      if (res?.data?.data?.length) {
        setFullDocTypes(res.data.data);
        const mappedDocuments = res?.data?.data?.map((doc: any) => ({
          id: doc?.id,
          name: doc?.name,
        }));
        setDocTypes(mappedDocuments);
      } else {
        setDocTypes([]);
        setFullDocTypes([]);
        message.warning(
          "You don't have access to create document in any document type!",
          3
        );
      }
    } catch (error: any) {
      setDocTypes([]);
    }
  };
  // console.log("dddddddd ", docData, selectedDocType);

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case "Details":
        return (
          <>
            <Box display="flex">
              <Box flex={1} paddingRight={2}>
                <Typography variant="subtitle1" gutterBottom>
                  Unit
                </Typography>
                <Select
                  value={selectedLocation}
                  fullWidth
                  onChange={(e) => {
                    let selectedValues: any = e.target.value;
                    setSelectedLocation(selectedValues);
                  }}
                >
                  {allUsersLocations?.map((loc) => (
                    <MenuItem key={loc.id} value={loc.id}>
                      {loc.locationName}
                    </MenuItem>
                  ))}
                </Select>
              </Box>

              <Box flex={1}>
                <Typography variant="subtitle1" gutterBottom>
                  Entity
                </Typography>
                <Select
                  value={selectedEntity}
                  fullWidth
                  onChange={(e) => {
                    let selectedValues: any = e.target.value;
                    setSelectedEntity(selectedValues);
                  }}
                >
                  {allUsersDept?.map((opt) => (
                    <MenuItem key={opt.id} value={opt.id}>
                      {opt.entityName}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
            </Box>
            <Form layout="vertical" form={form}>
              <Form.Item
                label="Document Title"
                required
                rules={[
                  { required: true, message: "Please enter document title" },
                ]}
              >
                <Input
                  placeholder="Enter document title"
                  value={formData.documentTitle}
                  onChange={(e) =>
                    handleChange("documentTitle", e.target.value)
                  }
                  disabled={
                    formData.workflowDetails !== "default" &&
                    formData.workflowDetails !== "none"
                      ? customWorkflowEditAccess
                      : false
                  }
                />
              </Form.Item>
              <Form.Item
                label="Document Type"
                required
                rules={[
                  { required: true, message: "Document type is required" },
                ]}
              >
                {formData.documentState === "DRAFT" ? (
                  <AntSelect
                    value={selectedDocType}
                    onChange={(value) => {
                      // setFormData((prev: any) => ({
                      //   ...prev,
                      //   doctypeId: value,
                      // }));
                      // setSelectedDocType(value);
                      handleDoctypeChange(value);
                    }}
                    placeholder="Select document type"
                  >
                    {docTypes.map((type: any) => (
                      <AntSelect.Option key={type.id} value={type.id}>
                        {type.name}
                      </AntSelect.Option>
                    ))}
                  </AntSelect>
                ) : (
                  <Input value={formData.documentType} disabled />
                )}
              </Form.Item>
              <Form.Item
                label="Description"
                required
                rules={[
                  { required: true, message: "Please enter description" },
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="Enter document description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  disabled={
                    formData.workflowDetails !== "default" &&
                    formData.workflowDetails !== "none"
                      ? customWorkflowEditAccess
                      : false
                  }
                />
              </Form.Item>
            </Form>
          </>
        );

      case "Systems":
        return (
          <>
            <Typography variant="subtitle1" gutterBottom>
              <span style={{ color: "red", marginRight: 4 }}>*</span>
              Select System
            </Typography>
            {systemOptions.map((system: any) => (
              <Card
                key={system.id}
                className={clsx(
                  classes.systemCard,
                  formData.selectedSystem.includes(system.id) &&
                    classes.cardSelected
                )}
                style={{ width: "100%" }}
              >
                <CardActionArea
                  onClick={() => handleSystemToggle(system.id)}
                  style={{ width: "100%", height: "100%" }}
                  disabled={
                    formData.workflowDetails !== "default" &&
                    formData.workflowDetails !== "none"
                      ? customWorkflowEditAccess
                      : false
                  }
                >
                  <CardContent
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      height: "100%",
                      width: "100%",
                    }}
                  >
                    <Typography>{system.name}</Typography>
                    {formData.selectedSystem.includes(system.id) && (
                      <MdCheckCircleOutline
                        style={{ color: "green", fontSize: "20px" }}
                      />
                    )}
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </>
        );

      case "Files":
        return (
          <Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <RiInbox2Fill />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
          </Dragger>
        );

      case "Workflow":
        return (
          <>
            {formData.workflowDetails === "default" ? (
              <>
                <CustomMultiSelect
                  label="Reviewers"
                  placeholder="Select Reviewers"
                  options={reviewerOptions}
                  selectedValues={formData.reviewers}
                  onChange={(val) => handleChangeWorkflow("reviewers", val)}
                />

                <CustomMultiSelect
                  label="Approvers"
                  placeholder="Select Approvers"
                  options={approverOptions}
                  selectedValues={formData.approvers}
                  onChange={(val) => handleChangeWorkflow("approvers", val)}
                />
              </>
            ) : (
              <>
                <div>
                  {formData?.workflowDetails.workflow.map(
                    (stage: any, stageIndex: any) => {
                      return (
                        <div
                          key={stageIndex}
                          style={{
                            marginBottom: "10px",
                            paddingLeft: "10px",
                          }}
                        >
                          <h4>
                            {stage.stage}
                            {" : "}
                            <span
                              style={{
                                color:
                                  stage.status === "complete"
                                    ? "green"
                                    : "orange",
                              }}
                            >
                              {stage.status === "complete"
                                ? "Complete"
                                : "Pending"}
                            </span>
                          </h4>

                          {stage.ownerSettings?.map(
                            (group: any[], groupIndex: number) => (
                              <div
                                key={groupIndex}
                                style={{
                                  margin: "10px 0",
                                  borderLeft: "2px dashed #ccc",
                                  paddingLeft: "10px",
                                }}
                              >
                                <p
                                  style={{
                                    fontStyle: "italic",
                                    color: "#888",
                                  }}
                                >
                                  Group {groupIndex + 1}
                                </p>
                                <Space
                                  direction="vertical"
                                  style={{ width: "100%" }}
                                >
                                  {group.map(
                                    (condition: any, condIndex: number) => {
                                      const isFixedType =
                                        condition.type === "Named Users" ||
                                        condition.type === "PIC Of" ||
                                        condition.type === "Manager Of" ||
                                        condition.type === "Head Of";

                                      const isUserOf =
                                        condition.type === "User Of";

                                      const isGlobalRoleOf =
                                        condition.type === "Global Role Of";

                                      const ifUserSelect =
                                        condition.ifUserSelect;

                                      const typeStatusColor =
                                        condition.status === "complete"
                                          ? "green"
                                          : "orange";
                                      const typeStatusText =
                                        condition.status === "complete"
                                          ? "Complete"
                                          : "Pending";

                                      return (
                                        <div key={condIndex}>
                                          <CustomMultiSelect
                                            label={
                                              <>
                                                {condition.type}{" "}
                                                <span
                                                  style={{
                                                    color: typeStatusColor,
                                                  }}
                                                >
                                                  ({typeStatusText})
                                                </span>
                                              </>
                                            }
                                            placeholder={condition.type}
                                            options={
                                              condition.type === "User Of" ||
                                              condition.type ===
                                                "Global Role Of"
                                                ? condition.userList
                                                : condition.selectedUsers
                                            }
                                            selectedValues={
                                              ifUserSelect
                                                ? condition.actualSelectedUsers
                                                : condition.selectedUsers
                                            }
                                            onChange={
                                              isUserOf ||
                                              isGlobalRoleOf ||
                                              ifUserSelect
                                                ? (val) =>
                                                    handleWorkflowUserChange(
                                                      val,
                                                      condition.ifUserSelect,
                                                      stageIndex,
                                                      groupIndex,
                                                      condIndex
                                                    )
                                                : undefined
                                            }
                                            disabled={
                                              isFixedType && !ifUserSelect
                                                ? true
                                                : formData.workflowDetails !==
                                                    "default" &&
                                                  formData.workflowDetails !==
                                                    "none"
                                                ? customWorkflowEditAccess
                                                : false
                                            }
                                          />
                                        </div>
                                      );
                                    }
                                  )}
                                </Space>
                              </div>
                            )
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              </>
            )}
          </>
        );

      default:
        return null;
    }
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
            setActiveTab("Files");
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
          // onClick={() => {
          //   setShowAmendConfirmModal(false);
          //   handleAmend();
          // }}
          onClick={() => {
            setShowAmendConfirmModal(false);
            if (userDetails?.organization?.digitalSignature) {
              setSignatureHandler(() => handleAmend);
              setSignModalOpen(true);
            } else {
              handleAmend();
            }
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
  // console.log("formData", formData);
  const renderFooterButtons = () => {
    const userId = userDetails?.id;
    const canReview = checkIfLoggedInUserCanReview(docData, userId);
    const canApprove = checkIfLoggedInUserCanApprove(docData, userId);

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 16,
        }}
      >
        <div>
          {/* <Button onClick={handleModalClose}>Cancel</Button> */}
          {(docData?.documentState === "IN_REVIEW" && canReview) ||
            (docData?.documentState === "IN_APPROVAL" && canApprove && (
              <Button
                type="default"
                // onClick={handleSendForEdit}
                onClick={() => {
                  if (userDetails?.organization?.digitalSignature) {
                    setSignatureHandler(() => handleSendForEdit);
                    setSignModalOpen(true);
                  } else {
                    handleSendForEdit();
                  }
                }}
                style={{ marginLeft: 4 }}
              >
                Send For Edit
              </Button>
            ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {renderWorkflowButton()}
          <Button
            type="primary"
            style={{
              backgroundColor: "rgb(0, 48, 89)",
              borderColor: "rgb(0, 48, 89)",
            }}
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </div>
    );
  };

  const onclose = () => {
    setSignModalOpen(false);
  };

  const setComment = (val: string) => {
    digiSignCommentRef.current = val;
    setDigiSignComment(val);
  };

  return (
    <>
      <Modal
        title="Edit Document"
        open={editModal?.open}
        onCancel={() => handleModalClose()}
        footer={null}
        width={600}
      >
        {/* Tab Header */}
        <div className={classes.customTabWrapper}>
          {tabList.map((tab) => (
            <div
              key={tab}
              className={clsx(classes.customTab, {
                [classes.activeTab]: activeTab === tab,
              })}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: "24px", textAlign: "center" }}>
            <Spin size="default" tip="Loading.." />
          </div>
        ) : (
          <>
            {renderActiveTabContent()}
            {renderFooterButtons()}
            {showAmendConfirmModal && renderAmendConfirmModal()}
          </>
        )}
      </Modal>
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
};

export default DocumentEditModal;
