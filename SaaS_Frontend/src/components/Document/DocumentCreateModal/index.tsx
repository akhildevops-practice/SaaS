import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  makeStyles,
  Divider,
  Select,
  MenuItem,
  FormControl,
  Input,
  ListItemText,
  IconButton,
  Box,
} from "@material-ui/core";
import axios from "apis/axios.global";
import { MdCheck, MdClose, MdInsertDriveFile } from "react-icons/md";
import CustomMultiSelect from "components/ReusableComponents/CustomMultiSelect";
import { message, Space } from "antd";
import getAppUrl from "utils/getAppUrl";
import SignatureComponent from "components/ReusableComponents/SignatureComponent";

const useStyles = makeStyles((theme) => ({
  cardSelected: {
    border: `2px solid ${theme.palette.primary.main}`,
    backgroundColor: theme.palette.action.selected,
  },
  summaryContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "2px 0",
  },

  label: {
    fontWeight: 600,
    flex: "0 0 100px", // fixed width for labels
    color: "black",
    fontSize: "12px",
  },

  value: {
    flex: 1,
    color: "#000",
    fontSize: "12px",
  },

  checkIcon: {
    color: "green",
    minWidth: "24px",
  },
  uploadContainer: {
    border: "2px dashed #ccc",
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(4),
    textAlign: "center",
    cursor: "pointer",
    "&:hover": {
      borderColor: theme.palette.primary.main,
    },
  },
  formControl: {
    width: "100%",
    marginBottom: theme.spacing(2),
  },
  select: {
    boxSizing: "border-box", // Ensures that padding and border are included in the element's total width and height
    margin: 0,
    padding: "8px 12px", // You can adjust padding based on your design
    color: "rgba(0, 0, 0, 0.88)", // Text color
    fontSize: "14px",
    lineHeight: "1.5714285714285714", // Same as Ant Design's line-height
    listStyle: "none",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'", // Same font stack as Ant Design
    position: "relative",
    display: "inline-block",
    cursor: "pointer",
    border: "1px solid #ccc", // Border style
    borderRadius: "4px", // Rounded corners for the border
    "&:focus": {
      borderColor: "#3f51b5", // Focus border color
    },
  },
  hiddenInput: {
    display: "none",
  },
  summaryItem: {
    marginBottom: theme.spacing(1),
  },
}));

message.config({
  top: 80,
  duration: 3,
  maxCount: 3,
});

type Props = {
  open: boolean;
  onClose?: any;
  reloadTableDataAfterSubmit?: any;
  setIsTableDataLoading?: any;
};

export default function DocumentCreationWizard({
  open = false,
  onClose,
  reloadTableDataAfterSubmit,
  setIsTableDataLoading,
}: Props) {
  const classes = useStyles();
  const realmName = getAppUrl();
  const [currentStep, setCurrentStep] = useState(0);
  const [docTypes, setDocTypes] = useState<any>([]);
  const [fullDocTypes, setFullDocTypes] = useState<any>([]);
  const [systems, setSystems] = useState<any>([]);
  const [documentType, setDocumentType] = useState<any>();
  const [selectedDocType, setSelectedDocType] = useState<any>();
  const [isoSystem, setIsoSystem] = useState<any>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const userDetail = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const [workflowExists, setworkFlowExists] = useState<boolean>(false);
  const [reviewers, setReviewers] = useState<any>([]);
  const [approvers, setApprovers] = useState<any>([]);
  const [selectedReviewers, setSelectedReviewers] = useState<any>([]);
  const [selectedApprovers, setSelectedApprovers] = useState<any>([]);
  const steps = ["Document Type", "Systems", "Description", "Upload File"];
  const [locationOption, setLocationOption] = useState<any[]>([]);
  const [userOptions, setUserOptions] = useState<any[]>([]);
  const [entityOption, setEntityOption] = useState<any[]>([]);
  const [distributionType, setDistributionType] = useState("");
  const [distributionListIds, setDistributionListIds] = useState<any>([]);
  const [readAccessType, setReadAccessType] = useState("");
  const [readAccessListIds, setReadAccessListIds] = useState<any>([]);
  const distributeAccessOptionsList = [
    "None",
    "All Users",
    "All in Units(S)",
    "All in Entities",
    "Selected Users",
    "Respective Entity",
    "Respective Unit",
  ];
  const readAccessOptionsList = [
    "All Users",
    "All in Units",
    "All in Entities",
    "Selected Users",
  ];
  const [signModalOpen, setSignModalOpen] = useState<Boolean>(false);
  const digiSignCommentRef = useRef("");
  const [digiSignComment, setDigiSignComment] = useState<any>();
  const [signatureHandler, setSignatureHandler] = useState<() => void>(
    () => () => {}
  );
  const [allUsersLocations, setAllUsersLocations] = useState<any[]>([]);
  const [allUsersDept, setAllUsersDept] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);

  useEffect(() => {
    if (open) {
      getCreatorsLocation();
    } else {
      resetForm();
    }
  }, [open]);

  useEffect(() => {
    if (selectedLocation) {
      getCreatorsDepartments();
    }
  }, [selectedLocation]);

  useEffect(() => {
    if (selectedEntity) {
      getDocTypes();
    }
  }, [selectedEntity]);

  useEffect(() => {
    if (!!selectedDocType) {
      getReviewers();
      getApprovers();
      getUserOptions();
      getLocationOptions();
      getDepartmentOptions();
    }
  }, [selectedDocType]);
  const getDocTypes = async () => {
    try {
      const res = await axios.get(
        `/api/doctype/getUserAccessibleDoctypes/${selectedEntity}`
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
        onClose();
      }
    } catch (error: any) {
      setDocTypes([]);
    }
  };
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
        setReviewers(userOptions);
      }
    } catch (error) {
      setReviewers([]);
    }
  };
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
        setApprovers(userOptions);
      }
    } catch (error) {
      setApprovers([]);
    }
  };

  // const handleDeptUserChange = (value: any, stageIndex: any) => {
  //   const updatedWorkflow = [
  //     ...fullDocTypes.find((item: any) => item.id === documentType)
  //       .workflowDetails.workflow,
  //   ];
  //   updatedWorkflow[stageIndex].ownerSettings.selectedUsers = value;

  //   setFullDocTypes([
  //     {
  //       ...fullDocTypes.find((item: any) => item.id === documentType),
  //       workflowDetails: {
  //         ...fullDocTypes.find((item: any) => item.id === documentType)
  //           .workflowDetails,
  //         workflow: updatedWorkflow,
  //       },
  //     },
  //   ]);
  // };

  const handleWorkflowUserChange = (
    value: any,
    ifUserSelect: boolean,
    stageIndex: number,
    groupIndex: number,
    conditionIndex: number
  ) => {
    const fullDocCopy = [...fullDocTypes];
    const docIndex = fullDocCopy.findIndex((item) => item.id === documentType);

    if (docIndex === -1) return;

    const workflow = fullDocCopy[docIndex].workflowDetails.workflow;

    if (ifUserSelect) {
      workflow[stageIndex].ownerSettings[groupIndex][
        conditionIndex
      ].actualSelectedUsers = value;
    } else {
      workflow[stageIndex].ownerSettings[groupIndex][
        conditionIndex
      ].selectedUsers = value;
    }

    setFullDocTypes(fullDocCopy);
  };

  const cleanWorkflowDetails = (workflowDetails: any) => {
    const workflow = workflowDetails?.workflow?.map((stage: any) => {
      const cleanedOwnerSettings = stage.ownerSettings.map((group: any[]) =>
        group.map((condition: any) => {
          const { userList, ...rest } = condition;

          if (
            condition.type === "Named Users" ||
            condition.type === "PIC Of" ||
            condition.type === "Manager Of" ||
            condition.type === "Head Of"
          ) {
            return {
              ...rest,
              selectedUsers: condition.selectedUsers?.map(
                (user: any) => user.id
              ),
            };
          }

          return rest; // Dept User with userList removed
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

  const getLocationOptions = async () => {
    try {
      const res = await axios.get(
        `/api/location/getAllLocations/${userDetail.organizationId}`
      );
      const ops = res.data.map((obj: any) => ({
        value: obj.id,
        label: obj.locationName,
        id: obj.id,
        locationName: obj.locationName,
      }));
      setLocationOption(ops);
    } catch (err) {
      console.error("Error fetching location options:", err);
    }
  };

  const getUserOptions = async () => {
    try {
      const res = await axios(
        `/api/user/doctype/filterusers/${userDetail?.organization?.realmName}/all`
      );
      const ops = res.data.map((obj: any) => ({
        value: obj.id,
        label: obj.firstname + " " + obj.lastname,
        userId: obj.id,
        firstname: obj.firstname,
        lastname: obj.lastname,
        name: obj.username,
        fullname: obj.firstname + " " + obj.lastname,
        avatar: obj.avatar,
        email: obj.email,
      }));
      setUserOptions(ops);
    } catch (err) {
      console.error("Error fetching user options:", err);
    }
  };

  const getDepartmentOptions = async () => {
    try {
      const res = await axios(`/api/entity`);
      const ops = res.data.map((obj: any) => ({
        value: obj.id,
        label: obj.entityName,
        id: obj.id,
        name: obj.entityName,
        entityTypeId: obj.entityTypeId,
      }));
      setEntityOption(ops);
    } catch (err) {
      console.error("Error fetching entity options:", err);
    }
  };

  const getCreatorsLocation = async () => {
    try {
      if (userDetail.userType === "globalRoles") {
        const res = await axios(`/api/user/getGlobalUsersLocations`);
        setAllUsersLocations(res.data);
      } else {
        setAllUsersLocations([
          {
            id: userDetail.location.id,
            locationName: userDetail.location.locationName,
            locationId: userDetail.location.locationId,
          },
        ]);
        setSelectedLocation(userDetail.locationId);
      }
    } catch (err) {
      console.error("Error fetching entity options:", err);
    }
  };

  const getCreatorsDepartments = async () => {
    try {
      if (userDetail.userType === "globalRoles") {
        const res = await axios(
          `/api/entity/getEntityByLocationId/${selectedLocation}`
        );
        setAllUsersDept(res.data);
      } else {
        const res = await axios(`/api/entity/getCreatorsDepartments`);
        setAllUsersDept(res.data);
        setSelectedEntity(userDetail.entityId);
      }
    } catch (err) {
      console.error("Error fetching entity options:", err);
    }
  };
  //handlers
  const handleChangeReviewers = (selectedValues: string | string[]) => {
    const valuesArray =
      typeof selectedValues === "string"
        ? selectedValues.split(",")
        : selectedValues;

    // Now set the selected reviewers
    setSelectedReviewers(valuesArray);
  };
  const handleChangeApprovers = (selectedValues: string | string[]) => {
    const valuesArray =
      typeof selectedValues === "string"
        ? selectedValues.split(",")
        : selectedValues;
    setSelectedApprovers(valuesArray);
  };

  const handleDoctypeChange = (selectedDoctypeId: string) => {
    const selectedDoctype: any = fullDocTypes.find(
      (doc: any) => doc.id === selectedDoctypeId
    );
    setSelectedDocType(selectedDoctype);
    if (selectedDoctype) {
      const mappedSystems = (selectedDoctype.applicableSystems || []).map(
        (system: any) => ({
          id: system.id,
          name: system.name,
        })
      );
      setSystems(mappedSystems);
      const distListRaw = selectedDoctype.distributionListUsers;

      let parsedDistList = [];
      if (
        selectedDoctype.distributionList === "Respective Unit" &&
        selectedLocation
      ) {
        parsedDistList = [selectedLocation];
      } else if (
        selectedDoctype.distributionList === "Respective Entity" &&
        selectedEntity
      ) {
        parsedDistList = [selectedEntity];
      } else if (Array.isArray(distListRaw)) {
        parsedDistList = distListRaw;
      } else if (typeof distListRaw === "string") {
        parsedDistList = [distListRaw];
      }

      setDistributionListIds(parsedDistList);

      const readList = selectedDoctype.readAccessList || [];
      // Filter out "All" unless needed
      // const cleanedReadIds = readList.filter((id: string) => id !== "All");
      setDistributionType(selectedDoctype.distributionList);
      setReadAccessType(selectedDoctype?.readAccessType);
      setReadAccessListIds(readList);
    } else {
      setSystems([]);
    }
  };
  const handleDistributionChange = (event: any) => {
    const selectedValue = event.target.value;
    setDistributionType(selectedValue);

    if (selectedValue === "Respective Unit" && selectedLocation) {
      setDistributionListIds([selectedLocation]);
    } else if (selectedValue === "Respective Entity" && selectedEntity) {
      setDistributionListIds([selectedEntity]);
    } else if (selectedValue === "All Users") {
      setDistributionListIds(["All"]);
    } else {
      setDistributionListIds([]); // Clear for others
    }
  };

  const handleReadAccessChange = (event: any) => {
    setReadAccessType(event.target.value);
    setReadAccessListIds([]);
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };
  const handleDistributionUserChange = (selectedValues: any) => {
    const valuesArray =
      typeof selectedValues === "string"
        ? selectedValues.split(",")
        : selectedValues;

    let values = valuesArray.filter((val: string) => val !== "All");

    setDistributionListIds(values);
  };
  const handleReadAccessUserChange = (selectedValues: any) => {
    const valuesArray =
      typeof selectedValues === "string"
        ? selectedValues.split(",")
        : selectedValues;

    let values = valuesArray.filter((val: string) => val !== "All");

    setReadAccessListIds(values);
  };
  const visibleSteps = React.useMemo(() => {
    const base = ["Description", "Document Type", "Systems", "Upload File"];

    const includeWorkFlow =
      !selectedDocType?.workflowId || selectedDocType.workflowId === "default";
    // base.push("Systems", "Description", "Upload File");
    if (selectedDocType) {
      if (includeWorkFlow) {
        base.push("WorkFlow");
        setworkFlowExists(true);
      }
    }

    return base;
  }, [selectedDocType]);

  const handleNext = () => {
    if (currentStep < visibleSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const validateForm = (action: string) => {
    const errors: string[] = [];

    // Basic validations for all actions
    if (!title?.trim()) {
      errors.push("Document Title is required");
    }
    if (!documentType) {
      errors.push("Document Type is required");
    }
    if (!description?.trim()) {
      errors.push("Description is required");
    }
    if (!isoSystem || isoSystem.length === 0) {
      errors.push("At least one system is required");
    }

    // Additional validations for non-draft actions
    if (action !== "DRAFT") {
      if (!file) {
        errors.push("File attachment is required");
      }

      const workflowDetails = fullDocTypes.find(
        (item: any) => item.id === documentType
      ).workflowDetails;

      if (workflowDetails === "default" && action !== "DRAFT") {
        if (selectedReviewers.length === 0) {
          errors.push("At least one reviewer is required");
        }
        if (selectedApprovers.length === 0) {
          errors.push("At least one approver is required");
        }
      }
    }

    return errors;
  };

  const handleDocumentAction = async (url: string, state: string) => {
    try {
      setIsSubmitting(true);
      setIsTableDataLoading(true);

      const distributionList: any = {
        type: distributionType,
        ids: distributionListIds,
      };
      const readAccess: any = {
        type: readAccessType,
        ids: readAccessListIds,
      };

      const formData = new FormData();
      const trimmedTitle = title.trim();
      const trimmedDescription = description.trim();

      formData.append("doctypeId", selectedDocType?.id);
      formData.append("documentName", trimmedTitle);
      formData.append("reasonOfCreation", trimmedDescription);
      formData.append("documentState", state);
      formData.append("createdAt", new Date().toISOString());
      formData.append("createdBy", userDetail?.id);
      formData.append("organizationId", userDetail?.organizationId);
      formData.append("locationId", selectedLocation);
      formData.append("entityId", selectedEntity);
      formData.append(
        "locationName",
        allUsersLocations.find((item: any) => item.id === selectedLocation)
          .locationName
      );
      formData.append("realmName", userDetail?.organization?.realmName);

      if (file) formData.append("file", file);

      formData.append("distributionList", JSON.stringify(distributionList));
      formData.append("readAccess", JSON.stringify(readAccess));

      isoSystem.forEach((system: any) => {
        formData.append("system[]", system);
      });

      const workflowDetails = fullDocTypes.find(
        (item: any) => item.id === documentType
      ).workflowDetails;

      if (workflowDetails !== "default" && workflowDetails !== "none") {
        const cleanedWorkflowDetails = cleanWorkflowDetails(workflowDetails);
        formData.append(
          "workflowDetails",
          JSON.stringify(cleanedWorkflowDetails)
        );
      }

      if (userDetail?.organization?.digitalSignature) {
        formData.append("digiSignComment", digiSignCommentRef.current);
      }
      const res = await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      state === "PUBLISHED"
        ? message.success("Document published successfully!")
        : message.success("Document Sent For Review Successfully!");
      setDigiSignComment(null);
      setIsSubmitting(false);
      setIsTableDataLoading(false);
      setIsComplete(true);
      reloadTableDataAfterSubmit();

      setTimeout(() => {
        resetForm();
        if (onClose) onClose();
      }, 2000);
    } catch (error) {
      console.error("Publish failed", error);
      state === "PUBLISHED"
        ? message.error("Failed to publish document.")
        : message.error("Failed to send for review.");
      setIsSubmitting(false);
      setIsTableDataLoading(false);
    }
  };

  const handleSendForReview = async () => {
    try {
      const validationErrors = validateForm("IN_REVIEW");
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

      // setIsSubmitting(true);
      setIsTableDataLoading(true);
      const formData = new FormData();
      const trimmedTitle = title.trim();
      const trimmedDescription = description.trim();
      const distributionList: any = {
        type: distributionType,
        ids: distributionListIds,
      };
      const readAccess: any = {
        type: readAccessType,
        ids: readAccessListIds,
      };

      formData.append("doctypeId", selectedDocType?.id);
      formData.append("documentName", trimmedTitle);
      formData.append("createdBy", userDetail?.id);
      formData.append("organizationId", userDetail?.organizationId);
      formData.append("locationId", selectedLocation);
      formData.append(
        "locationName",
        allUsersLocations.find((item: any) => item.id === selectedLocation)
          .locationName
      );
      formData.append("realmName", userDetail?.organization?.realmName);
      formData.append("reasonOfCreation", trimmedDescription);
      isoSystem.forEach((system: any) => {
        formData.append("system[]", system);
      });

      formData.append("entityId", selectedEntity);
      formData.append("documentState", "IN_REVIEW");
      formData.append("distributionList", JSON.stringify(distributionList));
      formData.append("readAccess", JSON.stringify(readAccess));
      selectedReviewers.forEach((reviewer: any) => {
        formData.append("reviewers[]", reviewer); // Use array-style syntax to keep it as an array
      });
      selectedApprovers.forEach((approver: any) => {
        formData.append("approvers[]", approver); // Use array-style syntax
      });

      !!file && formData.append("file", file);

      // const workflowDetails = fullDocTypes.find(
      //   (item: any) => item.id === documentType
      // ).workflowDetails;

      // if (workflowDetails !== "default" && workflowDetails !== "none") {
      //   const workflow = workflowDetails?.workflow?.map((item: any) => {
      //     if (
      //       item.ownerSettings.type === "Named Users" ||
      //       item.ownerSettings.type === "Dept PIC" ||
      //       item.ownerSettings.type === "Dept Manager"
      //     ) {
      //       const selectedUsers = item.ownerSettings.selectedUsers?.map(
      //         (user: any) => user.id
      //       );
      //       return {
      //         ...item,
      //         ownerSettings: {
      //           ...item.ownerSettings,
      //           selectedUsers: selectedUsers,
      //         },
      //       };
      //     }
      //     if (item.ownerSettings.type === "Dept User") {
      //       const { userList, ...rest } = item.ownerSettings;
      //       return {
      //         ...item,
      //         ownerSettings: rest,
      //       };
      //     }
      //   });

      //   formData.append(
      //     "workflowDetails",
      //     JSON.stringify({
      //       ...workflowDetails,
      //       workflow: workflow,
      //     })
      //   );
      // }
      if (userDetail?.organization?.digitalSignature) {
        formData.append("digiSignComment", digiSignCommentRef.current);
      }
      await axios.post(`/api/documents/createDocWithInReviewState`, formData);
      message.success("Action completed successfully!");
      setDigiSignComment(null);
      setIsComplete(true);
      setIsTableDataLoading(false);
      reloadTableDataAfterSubmit();
      onClose();
    } catch (error) {
      console.error("Update failed", error);
      message.error("Failed to update document.");
    } finally {
      setIsTableDataLoading(false);
    }
  };

  const handleAmmend = () => {
    const validationErrors = validateForm("PUBLISHED");
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

    handleDocumentAction(
      `/api/documents/createDocWithPublishedState`,
      "PUBLISHED"
    );
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm("DRAFT");
    if (validationErrors.length > 0) {
      message.error(
        <span>
          {validationErrors?.map((err, idx) => (
            <span key={idx}>
              {err}
              <br />
            </span>
          ))}
        </span>
      );
      return;
    }
    setIsSubmitting(true);
    setIsTableDataLoading(true);
    const distributionList: any = {
      type: distributionType,
      ids: distributionListIds,
    };
    const readAccess: any = {
      type: readAccessType,
      ids: readAccessListIds,
    };
    // Simulate API
    // await new Promise((resolve) => setTimeout(resolve, 1500));
    const formData = new FormData();
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    formData.append("doctypeId", selectedDocType?.id);
    formData?.append(
      "issueNumber",
      selectedDocType?.initialVersion ? selectedDocType?.initialVersion : "001"
    );
    formData.append("documentName", trimmedTitle);
    formData.append("createdAt", new Date().toISOString());
    formData.append("createdBy", userDetail?.id);
    formData.append("organizationId", userDetail?.organizationId);
    formData.append(
      "locationName",
      allUsersLocations.find((item: any) => item.id === selectedLocation)
        .locationName
    );
    formData.append("realmName", userDetail?.organization?.realmName);
    !!file && formData.append("file", file);
    formData.append("reasonOfCreation", trimmedDescription);

    formData.append("locationId", selectedLocation);
    formData.append("entityId", selectedEntity);
    formData.append("documentState", "DRAFT");
    formData.append("distributionList", JSON.stringify(distributionList));
    formData.append("readAccess", JSON.stringify(readAccess));
    selectedReviewers.forEach((reviewer: any) => {
      formData.append("reviewers[]", reviewer); // Use array-style syntax to keep it as an array
    });

    const workflowDetails = fullDocTypes.find(
      (item: any) => item.id === documentType
    ).workflowDetails;

    if (workflowDetails !== "default" && workflowDetails !== "none") {
      const cleanedWorkflowDetails = cleanWorkflowDetails(workflowDetails);
      formData.append(
        "workflowDetails",
        JSON.stringify(cleanedWorkflowDetails)
      );
    }
    // Append each approver as a separate entry
    selectedApprovers.forEach((approver: any) => {
      formData.append("approvers[]", approver); // Use array-style syntax
    });
    isoSystem.forEach((system: any) => {
      formData.append("system[]", system);
    });

    const res = await axios.post(
      `/api/documents?realm=${
        userDetail?.organization?.realmName
      }&locationName=${
        allUsersLocations.find((item: any) => item.id === selectedLocation)
          .locationId
      }`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    setIsSubmitting(false);
    setIsComplete(true);
    setIsTableDataLoading(false);
    reloadTableDataAfterSubmit();
    setTimeout(() => {
      resetForm();
      if (onClose) onClose();
    }, 2000);
  };

  const handleFirstStageSubmitCustomWorkflow = async (stage: any) => {
    const validationErrors = validateForm(stage);
    if (validationErrors.length > 0) {
      message.error(
        <span>
          {validationErrors?.map((err, idx) => (
            <span key={idx}>
              {err}
              <br />
            </span>
          ))}
        </span>
      );
      return;
    }
    const distributionList: any = {
      type: distributionType,
      ids: distributionListIds,
    };
    const readAccess: any = {
      type: readAccessType,
      ids: readAccessListIds,
    };
    // Simulate API
    // await new Promise((resolve) => setTimeout(resolve, 1500));
    const formData = new FormData();
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    formData.append("doctypeId", selectedDocType?.id);
    formData?.append(
      "issueNumber",
      selectedDocType?.initialVersion ? selectedDocType?.initialVersion : "001"
    );
    formData.append("documentName", trimmedTitle);
    formData.append("createdAt", new Date().toISOString());
    formData.append("createdBy", userDetail?.id);
    formData.append("organizationId", userDetail?.organizationId);
    formData.append(
      "locationName",
      allUsersLocations.find((item: any) => item.id === selectedLocation)
        .locationName
    );
    formData.append("realmName", userDetail?.organization?.realmName);
    !!file && formData.append("file", file);
    formData.append("reasonOfCreation", trimmedDescription);

    formData.append("locationId", selectedLocation);
    formData.append("entityId", selectedEntity);
    formData.append("documentState", stage);
    formData.append("distributionList", JSON.stringify(distributionList));
    formData.append("readAccess", JSON.stringify(readAccess));
    selectedReviewers.forEach((reviewer: any) => {
      formData.append("reviewers[]", reviewer); // Use array-style syntax to keep it as an array
    });

    const workflowDetails = fullDocTypes.find(
      (item: any) => item.id === documentType
    ).workflowDetails;

    if (workflowDetails !== "default" && workflowDetails !== "none") {
      const cleanedWorkflowDetails = cleanWorkflowDetails(workflowDetails);
      const allUsersSelectedForWorkflow =
        cleanedWorkflowDetails?.workflow?.every((item: any) =>
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
      formData.append(
        "workflowDetails",
        JSON.stringify(cleanedWorkflowDetails)
      );
    }
    // Append each approver as a separate entry
    selectedApprovers.forEach((approver: any) => {
      formData.append("approvers[]", approver); // Use array-style syntax
    });
    isoSystem.forEach((system: any) => {
      formData.append("system[]", system);
    });

    setIsSubmitting(true);
    setIsTableDataLoading(true);

    const res = await axios.post(
      `/api/documents?realm=${
        userDetail?.organization?.realmName
      }&locationName=${
        allUsersLocations.find((item: any) => item.id === selectedLocation)
          .locationId
      }`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    setIsSubmitting(false);
    setIsComplete(true);
    setIsTableDataLoading(false);
    reloadTableDataAfterSubmit();
    setTimeout(() => {
      resetForm();
      if (onClose) onClose();
    }, 2000);
  };

  const resetForm = () => {
    setCurrentStep(0);
    setDocumentType("");
    setIsoSystem([]);
    setDescription("");
    setReviewers([]);
    setApprovers([]);
    setTitle("");
    setDistributionListIds([]);
    setDistributionType("");
    setReadAccessListIds([]);
    setReadAccessType("");
    setFile(null);
    setIsComplete(false);
    setSelectedApprovers([]);
    setSelectedReviewers([]);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return !!documentType;
      case 1:
        return !!isoSystem;
      case 2:
        return !!description;
      case 3:
        return !!file;
      default:
        return false;
    }
  };

  const onclose = () => {
    setSignModalOpen(false);
  };

  const setComment = (val: string) => {
    digiSignCommentRef.current = val;
    setDigiSignComment(val);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      PaperProps={{
        style: {
          width: "80%",
          height: "90vh",
          position: "relative",
        },
      }}
    >
      <DialogTitle
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {isComplete
          ? "Document Created Successfully"
          : `Create Document - Step ${currentStep + 1} of ${
              visibleSteps?.length
            }`}
        <IconButton
          onClick={onClose}
          size="small"
          style={{
            position: "absolute",
            right: 8,
            top: 8,
          }}
        >
          <MdClose
            style={{ height: "30px", width: "30px", color: "#0E0A42" }}
          />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {isComplete ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <CircularProgress style={{ color: "green", marginBottom: 16 }} />
            <Typography variant="h6" gutterBottom>
              Document Created!
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Your document has been uploaded successfully.
            </Typography>
          </div>
        ) : (
          <>
            {/* <Stepper activeStep={currentStep} alternativeLabel>
              {steps?.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}

            </Stepper> */}
            <Stepper activeStep={currentStep} alternativeLabel>
              {visibleSteps?.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <div style={{ marginTop: 24 }}>
              {/* Step content */}
              {currentStep === 1 && (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Select Document Type
                  </Typography>

                  {docTypes?.map((type: any) => (
                    <Card
                      key={type.id}
                      className={
                        documentType === type.id ? classes.cardSelected : ""
                      }
                      style={{ marginBottom: 12, position: "relative" }}
                    >
                      <CardActionArea
                        onClick={() => {
                          setDocumentType(type.id);
                          handleDoctypeChange(type.id);
                        }}
                      >
                        <CardContent
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <MdInsertDriveFile size={24} color="#555" />
                            <Typography>{type.name}</Typography>
                          </div>

                          {/* Right: Checkmark */}
                          {documentType === type.id && (
                            <MdCheck
                              style={{ color: "green", fontSize: "20px" }}
                            />
                          )}
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  ))}
                </>
              )}

              {currentStep === 2 && (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Select System
                  </Typography>
                  {systems?.map((system: any) => (
                    <Card
                      key={system.id}
                      className={
                        isoSystem === system.id ? classes.cardSelected : ""
                      }
                      style={{ marginBottom: 12 }}
                    >
                      <CardActionArea
                        onClick={() => {
                          setIsoSystem(
                            (prev: any) =>
                              prev.includes(system.id)
                                ? prev.filter((id: any) => id !== system.id) // Remove if already selected
                                : [...prev, system.id] // Add if not selected
                          );
                        }}
                      >
                        <CardContent
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography>{system.name}</Typography>
                          {isoSystem.includes(system.id) && (
                            <MdCheck
                              style={{ color: "green", fontSize: "20px" }}
                            />
                          )}
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  ))}
                </>
              )}

              {currentStep === 0 && (
                <>
                  <Box display="flex">
                    <Box flex={1} paddingRight={2}>
                      <Typography variant="subtitle1" gutterBottom>
                        Unit
                      </Typography>
                      <Select
                        className={classes.select}
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
                        className={classes.select}
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

                  <Typography variant="subtitle1" gutterBottom>
                    Document Title
                  </Typography>
                  <TextField
                    // label="Document Title"
                    fullWidth
                    multiline
                    rows={2}
                    value={title}
                    onChange={(e: any) => setTitle(e.target.value)}
                    variant="outlined"
                    style={{ paddingBottom: "10px" }}
                  />

                  <Divider></Divider>
                  <Typography variant="subtitle1" gutterBottom>
                    Reason For Creation
                  </Typography>
                  <TextField
                    // label="Reason for Creation"
                    fullWidth
                    multiline
                    rows={5}
                    value={description}
                    onChange={(e: any) => setDescription(e.target.value)}
                    variant="outlined"
                  />
                  {/* <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    style={{ marginTop: 16 }}
                  >
                    Save
                  </Button> */}
                </>
              )}

              {currentStep === 3 && (
                <div>
                  <input
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                    className={classes.hiddenInput}
                    id="file-upload"
                    type="file"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="file-upload">
                    <div className={classes.uploadContainer}>
                      <Typography variant="body1" gutterBottom>
                        {file ? file.name : "Click to upload your file"}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Supported formats: PDF, Word, Excel, PowerPoint, Text
                      </Typography>
                    </div>
                  </label>

                  {file && (
                    <div style={{ marginTop: 24 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Document Summary:
                      </Typography>

                      <div className={classes.summaryContainer}>
                        <div className={classes.summaryRow}>
                          <div className={classes.label}>Type:</div>
                          <div className={classes.value}>
                            {selectedDocType?.name}
                          </div>
                        </div>

                        <div className={classes.summaryRow}>
                          <div className={classes.label}>System:</div>
                          <div className={classes.value}>
                            {isoSystem
                              ?.map((id: any) => {
                                const system = systems.find(
                                  (s: any) => s.id === id
                                );
                                return system ? system.name : "";
                              })
                              .filter(Boolean)
                              .join(", ")}
                          </div>
                        </div>

                        <div className={classes.summaryRow}>
                          <div className={classes.label}>Description:</div>
                          <div className={classes.value}>{description}</div>
                        </div>

                        <div className={classes.summaryRow}>
                          <div className={classes.label}>Unit:</div>
                          <div className={classes.value}>
                            {
                              allUsersLocations.find(
                                (item: any) => item.id === selectedLocation
                              ).locationName
                            }
                          </div>
                        </div>

                        <div className={classes.summaryRow}>
                          <div className={classes.label}>Entity:</div>
                          <div className={classes.value}>
                            {
                              allUsersDept.find(
                                (item: any) => item.id === selectedEntity
                              ).entityName
                            }
                          </div>
                        </div>

                        <div className={classes.summaryRow}>
                          <div className={classes.label}>File:</div>
                          <div className={classes.value}>{file.name}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    style={{ marginTop: 16 }}
                  >
                    Save
                  </Button> */}
                  {!workflowExists && currentStep === 3 && (
                    <Button
                      variant="contained"
                      onClick={handleSubmit}
                      style={{ marginTop: 24 }}
                    >
                      Create Document
                    </Button>
                  )}
                </div>
              )}
              {currentStep === 4 && (
                <>
                  {fullDocTypes.find((item: any) => item.id === documentType)
                    .workflowDetails === "default" &&
                  fullDocTypes.find((item: any) => item.id === documentType)
                    ?.workflowDetails !== "none" ? (
                    <>
                      <CustomMultiSelect
                        label="Reviewers"
                        placeholder="Select Reviewers"
                        options={reviewers}
                        selectedValues={selectedReviewers}
                        onChange={handleChangeReviewers}
                      />

                      <CustomMultiSelect
                        label="Approvers"
                        placeholder="Select Approvers"
                        options={approvers}
                        selectedValues={selectedApprovers}
                        onChange={handleChangeApprovers}
                      />
                    </>
                  ) : (
                    <>
                      <div style={{ padding: "20px" }}>
                        {fullDocTypes
                          .find((item: any) => item.id === documentType)
                          .workflowDetails?.workflow?.map(
                            (stage: any, stageIndex: number) => {
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

                                  <Space
                                    direction="vertical"
                                    style={{ width: "100%" }}
                                  >
                                    {stage.ownerSettings?.map(
                                      (
                                        conditionGroup: any[],
                                        groupIndex: number
                                      ) => (
                                        <div
                                          key={groupIndex}
                                          style={{ paddingLeft: 12 }}
                                        >
                                          <strong>
                                            Group {groupIndex + 1} (OR)
                                          </strong>
                                          {conditionGroup.map(
                                            (
                                              condition: any,
                                              condIndex: number
                                            ) => (
                                              <div
                                                key={condIndex}
                                                style={{ paddingLeft: 12 }}
                                              >
                                                {/* <span>
                                                  Condition {condIndex + 1}{" "}
                                                  (AND)
                                                </span> */}
                                                {(condition.type ===
                                                  "Named Users" ||
                                                  condition.type === "PIC Of" ||
                                                  condition.type ===
                                                    "Manager Of" ||
                                                  condition.type ===
                                                    "Head Of") &&
                                                  (condition.ifUserSelect ? (
                                                    <CustomMultiSelect
                                                      label={condition.type}
                                                      placeholder={
                                                        condition.type
                                                      }
                                                      options={
                                                        condition.selectedUsers
                                                      }
                                                      selectedValues={
                                                        condition.actualSelectedUsers
                                                      }
                                                      onChange={(val) =>
                                                        handleWorkflowUserChange(
                                                          val,
                                                          condition.ifUserSelect,
                                                          stageIndex,
                                                          groupIndex,
                                                          condIndex
                                                        )
                                                      }
                                                    />
                                                  ) : (
                                                    <CustomMultiSelect
                                                      label={condition.type}
                                                      placeholder={
                                                        condition.type
                                                      }
                                                      options={
                                                        condition.selectedUsers
                                                      }
                                                      selectedValues={
                                                        condition.selectedUsers
                                                      }
                                                      disabled={true}
                                                    />
                                                  ))}

                                                {condition.type ===
                                                  "User Of" && (
                                                  <CustomMultiSelect
                                                    label={condition.type}
                                                    placeholder={condition.type}
                                                    selectedValues={
                                                      condition.selectedUsers
                                                    }
                                                    options={condition.userList}
                                                    onChange={(val) =>
                                                      handleWorkflowUserChange(
                                                        val,
                                                        condition.ifUserSelect,
                                                        stageIndex,
                                                        groupIndex,
                                                        condIndex
                                                      )
                                                    }
                                                  />
                                                )}

                                                {condition.type ===
                                                  "Global Role Of" && (
                                                  <CustomMultiSelect
                                                    label={condition.type}
                                                    placeholder={condition.type}
                                                    selectedValues={
                                                      condition.selectedUsers
                                                    }
                                                    options={condition.userList}
                                                    onChange={(val) =>
                                                      handleWorkflowUserChange(
                                                        val,
                                                        condition.ifUserSelect,
                                                        stageIndex,
                                                        groupIndex,
                                                        condIndex
                                                      )
                                                    }
                                                  />
                                                )}
                                              </div>
                                            )
                                          )}
                                        </div>
                                      )
                                    )}
                                  </Space>
                                </div>
                              );
                            }
                          )}
                      </div>
                    </>
                  )}

                  <Typography variant="subtitle1" gutterBottom>
                    Distribution Type
                  </Typography>
                  <FormControl
                    fullWidth
                    required
                    className={classes.formControl}
                  >
                    <Select
                      value={distributionType}
                      displayEmpty
                      onChange={handleDistributionChange}
                      className={classes.select}
                      renderValue={(selected) => {
                        if (!selected) return <em>Select Distribution Type</em>;
                        return <span>{selected as string}</span>;
                      }}
                    >
                      <MenuItem value="" disabled>
                        Select Distribution Type
                      </MenuItem>
                      {distributeAccessOptionsList?.map((item, i) => (
                        <MenuItem
                          key={i}
                          value={item}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span>{item}</span>
                          {distributionType === item && (
                            <MdCheck style={{ color: "green", fontSize: 20 }} />
                          )}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Conditional inputs for distributionListIds based on distributionType */}
                  {distributionType === "All Users" && (
                    <>
                      <Typography variant="subtitle1" gutterBottom>
                        Distribution Users
                      </Typography>
                      <FormControl
                        fullWidth
                        required
                        className={classes.formControl}
                      >
                        <Select
                          multiple
                          value={["All"]}
                          className={classes.select}
                          disabled
                          renderValue={(selected: any) => selected.join(", ")}
                          input={<Input />}
                        >
                          <MenuItem value="All">All</MenuItem>
                        </Select>
                      </FormControl>
                    </>
                  )}
                  {distributionType === "All in Units(S)" && (
                    <>
                      <Typography variant="subtitle1" gutterBottom>
                        Select Allowed Units
                      </Typography>
                      <FormControl
                        fullWidth
                        required
                        className={classes.formControl}
                      >
                        <Select
                          multiple
                          value={distributionListIds}
                          className={classes.select}
                          onChange={(e) => {
                            let selectedValues: any = e.target.value;

                            selectedValues = selectedValues.filter(
                              (val: string) => val !== "All"
                            );

                            setDistributionListIds(selectedValues);
                          }}
                          renderValue={(selected: any) =>
                            locationOption
                              .filter((opt) => selected.includes(opt.value))
                              .map((opt) => opt.label)
                              .join(", ")
                          }
                        >
                          {locationOption?.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </>
                  )}

                  {distributionType === "All in Entities" && (
                    <>
                      <Typography variant="subtitle1" gutterBottom>
                        Select Allowed Entities
                      </Typography>
                      <FormControl
                        fullWidth
                        required
                        className={classes.formControl}
                      >
                        <Select
                          multiple
                          className={classes.select}
                          value={distributionListIds}
                          onChange={(e) => {
                            let selectedValues: any = e.target.value;

                            selectedValues = selectedValues.filter(
                              (val: string) => val !== "All"
                            );

                            setDistributionListIds(selectedValues);
                          }}
                          renderValue={(selected: any) =>
                            entityOption
                              .filter((opt) => selected.includes(opt.value))
                              .map((opt) => opt.label)
                              .join(", ")
                          }
                        >
                          {entityOption?.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </>
                  )}

                  {distributionType === "Selected Users" && (
                    <>
                      <Typography variant="subtitle1" gutterBottom>
                        Select Allowed Users
                      </Typography>
                      <FormControl
                        fullWidth
                        required
                        className={classes.formControl}
                      >
                        <CustomMultiSelect
                          label="Select Users"
                          placeholder="Select Users"
                          options={userOptions}
                          selectedValues={distributionListIds}
                          onChange={handleDistributionUserChange}
                        ></CustomMultiSelect>
                      </FormControl>
                    </>
                  )}

                  {distributionType === "Respective Unit" && (
                    <>
                      <Typography variant="subtitle1" gutterBottom>
                        Select Respective Unit
                      </Typography>
                      <FormControl fullWidth className={classes.formControl}>
                        <Select
                          value={distributionListIds}
                          className={classes.select}
                          disabled
                          renderValue={(selected: any) =>
                            locationOption
                              .filter((opt) => selected.includes(opt.value))
                              .map((opt) => opt.label)
                              .join(", ")
                          }
                        >
                          {locationOption.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </>
                  )}

                  {distributionType === "Respective Entity" && (
                    <>
                      <Typography variant="subtitle1" gutterBottom>
                        Select Respective Entity
                      </Typography>
                      <FormControl
                        fullWidth
                        required
                        className={classes.formControl}
                      >
                        <Select
                          value={distributionListIds}
                          className={classes.select}
                          disabled
                          renderValue={(selected: any) =>
                            entityOption
                              .filter((opt) => selected.includes(opt.value))
                              .map((opt) => opt.label)
                              .join(", ")
                          }
                        >
                          {entityOption.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </>
                  )}
                  <Typography variant="subtitle1" gutterBottom>
                    Read Access Settings
                  </Typography>
                  <FormControl
                    fullWidth
                    required
                    className={classes.formControl}
                  >
                    <Select
                      value={readAccessType}
                      displayEmpty
                      renderValue={(selected) => {
                        if (!selected) return <em>Select Distribution Type</em>;
                        return <span>{selected as string}</span>;
                      }}
                      onChange={handleReadAccessChange}
                      className={classes.select}
                    >
                      <MenuItem value="" disabled>
                        Select Access Type
                      </MenuItem>
                      {/* {readAccessOptionsList.map((item, i) => (
                        <MenuItem key={i} value={item}>
                          {item}
                        </MenuItem>
                      ))} */}
                      {readAccessOptionsList?.map((item, i) => (
                        <MenuItem
                          key={i}
                          value={item}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span>{item}</span>
                          {readAccessType === item && (
                            <MdCheck style={{ color: "green", fontSize: 20 }} />
                          )}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {readAccessType === "All Users" && (
                    <>
                      <Typography variant="subtitle1" gutterBottom>
                        Allowed Users
                      </Typography>
                      <FormControl
                        fullWidth
                        required
                        className={classes.formControl}
                      >
                        <Select
                          multiple
                          value={["All"]}
                          className={classes.select}
                          disabled
                          renderValue={(selected: any) => selected.join(", ")}
                          input={<Input />}
                        >
                          <MenuItem value="All">All</MenuItem>
                        </Select>
                      </FormControl>
                    </>
                  )}
                  {readAccessType === "All in Units" && (
                    <>
                      <Typography variant="subtitle1" gutterBottom>
                        Select Allowed Units
                      </Typography>
                      <FormControl
                        fullWidth
                        required
                        className={classes.formControl}
                      >
                        <Select
                          multiple
                          value={readAccessListIds}
                          className={classes.select}
                          onChange={(e) => {
                            let selectedValues: any = e.target.value;

                            selectedValues = selectedValues.filter(
                              (val: string) => val !== "All"
                            );

                            setReadAccessListIds(selectedValues);
                          }}
                          renderValue={(selected: any) =>
                            locationOption
                              .filter((opt) => selected.includes(opt.value))
                              .map((opt) => opt.label)
                              .join(", ")
                          }
                        >
                          {locationOption?.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </>
                  )}

                  {readAccessType === "All in Entities" && (
                    <>
                      <Typography variant="subtitle1" gutterBottom>
                        Select Allowed Entities
                      </Typography>
                      <FormControl
                        fullWidth
                        required
                        className={classes.formControl}
                      >
                        <Select
                          multiple
                          className={classes.select}
                          value={readAccessListIds}
                          onChange={(e) => {
                            let selectedValues: any = e.target.value;

                            selectedValues = selectedValues.filter(
                              (val: string) => val !== "All"
                            );

                            setReadAccessListIds(selectedValues);
                          }}
                          renderValue={(selected: any) =>
                            entityOption
                              .filter((opt) => selected.includes(opt.value))
                              .map((opt) => opt.label)
                              .join(", ")
                          }
                        >
                          {entityOption?.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </>
                  )}

                  {readAccessType === "Selected Users" && (
                    <>
                      <Typography variant="subtitle1" gutterBottom>
                        Select Allowed Users
                      </Typography>
                      <FormControl
                        fullWidth
                        required
                        className={classes.formControl}
                      >
                        {/* <Select
                          multiple
                          value={readAccessListIds}
                          className={classes.select}
                          onChange={(e) => {
                            let selectedValues: any = e.target.value;

                            selectedValues = selectedValues.filter(
                              (val: string) => val !== "All"
                            );

                            setReadAccessListIds(selectedValues);
                          }}
                          renderValue={(selected: any) =>
                            userOptions
                              .filter((opt) => selected.includes(opt.value))
                              .map((opt) => opt.label)
                              .join(", ")
                          }
                        >
                          {userOptions?.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </MenuItem>
                          ))}
                        </Select> */}
                        <CustomMultiSelect
                          label="Select Users"
                          placeholder="Select Users"
                          options={userOptions}
                          selectedValues={readAccessListIds}
                          onChange={handleReadAccessUserChange}
                        />
                      </FormControl>
                    </>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </DialogContent>

      {!isComplete && (
        <DialogActions
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          {/* LEFT SIDE: Cancel or Back */}
          <div style={{ display: "flex", gap: 8 }}>
            {currentStep > 0 ? (
              <Button
                onClick={() => setCurrentStep((prev: any) => prev - 1)}
                variant="outlined"
              >
                Back
              </Button>
            ) : (
              <Button onClick={onClose} variant="outlined">
                Cancel
              </Button>
            )}
          </div>

          {/* RIGHT SIDE: Save / Publish / Next */}
          <div style={{ display: "flex", gap: 8 }}>
            {currentStep === visibleSteps.length - 1 ? (
              <>
                {selectedDocType?.workflowDetails === "none" ? (
                  <>
                    <Button
                      onClick={handleSubmit}
                      color="primary"
                      variant="contained"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? <CircularProgress size={20} /> : "Save"}
                    </Button>
                    <Button
                      //onClick={handleAmmend}
                      onClick={() => {
                        if (userDetail?.organization?.digitalSignature) {
                          setSignatureHandler(() => handleAmmend);
                          setSignModalOpen(true);
                        } else {
                          handleAmmend();
                        }
                      }}
                      color="primary"
                      variant="contained"
                    >
                      Publish
                    </Button>
                  </>
                ) : selectedDocType?.workflowDetails === "default" ? (
                  <>
                    <Button
                      onClick={handleSubmit}
                      color="primary"
                      variant="contained"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? <CircularProgress size={20} /> : "Save"}
                    </Button>
                    <Button
                      onClick={() => {
                        if (userDetail?.organization?.digitalSignature) {
                          setSignatureHandler(() => handleSendForReview);
                          setSignModalOpen(true);
                        } else {
                          handleSendForReview();
                        }
                      }}
                      //onClick={handleSendForReview}
                      color="primary"
                      variant="contained"
                    >
                      Send for Review
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => {
                        if (userDetail?.organization?.digitalSignature) {
                          setSignatureHandler(
                            () => () =>
                              handleFirstStageSubmitCustomWorkflow(
                                selectedDocType?.workflowDetails.workflow[0]
                                  .stage
                              )
                          );
                          setSignModalOpen(true);
                        } else {
                          handleFirstStageSubmitCustomWorkflow(
                            selectedDocType?.workflowDetails.workflow[0].stage
                          );
                        }
                      }}
                      color="primary"
                      variant="contained"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <CircularProgress size={20} />
                      ) : (
                        "Send For " +
                        selectedDocType?.workflowDetails.workflow[0].stage
                      )}
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      color="primary"
                      variant="contained"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? <CircularProgress size={20} /> : "Save"}
                    </Button>
                    {/* <Button
                      onClick={() => {
                        setSignatureHandler(() => handleSendForReview);
                        setSignModalOpen(true);
                      }}
                      //onClick={handleSendForReview}
                      color="primary"
                      variant="contained"
                    >
                      Send for Review
                    </Button> */}
                  </>
                )}
              </>
            ) : (
              <Button
                onClick={() => setCurrentStep((prev: any) => prev + 1)}
                color="primary"
                variant="contained"
              >
                Next
              </Button>
            )}
          </div>
        </DialogActions>
      )}
      <SignatureComponent
        userData={userDetail}
        action={null}
        onClose={onclose}
        open={signModalOpen}
        handleMarkDone={signatureHandler}
        comment={digiSignComment}
        setComment={setComment}
      ></SignatureComponent>
    </Dialog>
  );
}
