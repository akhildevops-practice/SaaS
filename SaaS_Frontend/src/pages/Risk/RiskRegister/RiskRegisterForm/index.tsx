import React, { useEffect, useState } from "react";
import {
  Button,
  Select,
  Descriptions,
  Form,
  Tabs,
  Input,
  message,
  Spin,
  Tooltip,
  Modal,
  Space,
  Tag,
  PaginationProps,
  Radio,
} from "antd";
import { Box, makeStyles, Typography, useMediaQuery } from "@material-ui/core";
import { Typography as AntTypography } from "antd";
import {
  MdOutlineArrowBackIos,
  MdOutlineRecommend,
  MdOutlineSend,
} from "react-icons/md";
import axios from "apis/axios.global";
import { useNavigate, useParams } from "react-router-dom";
import getSessionStorage from "utils/getSessionStorage";
import PrimaryButton from "components/ReusableComponents/PrimaryButton";
import SecondaryButton from "components/ReusableComponents/SecondaryButton";
import useStyles from "./style";
import CustomMultiSelect from "components/ReusableComponents/CustomMultiSelect";
import RiskEditableTable from "components/Risk/RiskRegister/RiskRegisterForm/RiskEditableTable";
import moment from "moment";
import HiraConsolidatedWorkflowHistoryDrawer from "components/Risk/Hira/HiraRegister/HiraConsolidatedWorkflowHistoryDrawer";
import RiskScoreModal from "components/Risk/Hira/HiraRegister/RiskScoreModal";
import HiraReferences from "components/Risk/Hira/HiraRegister/HiraReferences";
import DepartmentSelector from "components/ReusableComponents/DepartmentSelector";
const { Title } = AntTypography;

const isNonEmptyArray = (arr: any) => Array.isArray(arr) && arr.length > 0;

const conditionalColumn = (
  key: string,
  label: string,
  inputType: any,
  options: any,
  width: string = "200px"
) => {
  return isNonEmptyArray(options)
    ? { key, label, inputType, options, width }
    : null;
};

const RiskRegisterForm = () => {
  const classes = useStyles();
  const params = useParams();
  const navigate = useNavigate();
  const isCreateMode = params?.riskId === "null" ? true : false;
  // console.log("checkr isCreateMode", isCreateMode);

  const matches = useMediaQuery("(min-width:820px)");
  const userDetails = getSessionStorage();
  const [hiraHeaderForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState("steps");
  const [loading, setLoading] = useState(true); // Loader state
  const [selectedCell, setSelectedCell] = useState<any>(null);
  const [selectedPreCell, setSelectedPreCell] = useState<any>(null);
  const [selectedPostCell, setSelectedPostCell] = useState<any>(null);
  const [riskScoreModal, setRiskScoreModal] = useState<any>({
    open: false,
    data: {},
  });

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  //risk config
  const [riskConfig, setRiskConfig] = useState<any>(null);
  const [
    consolidatedWorkflowHistoryDrawer,
    setConsolidatedWorkflowHistoryDrawer,
  ] = useState<any>({
    open: false,
    data: {},
  });

  const [hiraHeaderFormData, setHiraHeaderFormData] = useState<any>(null);
  const [tableData, setTableData] = useState<any[]>([]);

  const [options, setOptions] = useState<any>({
    categoryOptions: [],
    entityOptions: [],
    locationOptions: [],
    userOptions: [],
    riskSourceOptions: [],
  });
  const [showRequireStepMessage, setShowRequireStepMessage] =
    useState<any>(false);

  const [refershTable, setRefershTable] = useState<any>(false);

  const [referencesDrawer, setReferencesDrawer] = useState<any>({
    open: false,
    mode: "edit",
    data: {
      id: null,
    },
  });

  const [selectedDept, setSelectedDept] = useState<any>(null);

  const headerIsValid =
    !!hiraHeaderFormData?.categoryId &&
    !!hiraHeaderFormData?.jobTitle &&
    Array.isArray(hiraHeaderFormData?.assesmentTeam) &&
    hiraHeaderFormData.assesmentTeam.length > 0;

  useEffect(() => {
    // Always seed the categoryId into the form & state
    hiraHeaderForm.setFieldsValue({ categoryId: params?.categoryId });
    setHiraHeaderFormData((prev: any) => ({
      ...prev,
      categoryId: params?.categoryId,
    }));

    const init = async () => {
      setLoading(true);

      // 1) fetch all your dropdowns & config
      await Promise.all([
        fetchUsersByLocation(),
        getCategoryOptions(),
        fetchHiraConfig(params?.categoryId),
        getHazardTypeOptions(),
        fetchInitialDepartment(userDetails?.entity?.id),
      ]);

      // 2) if edit mode, also load the saved risk + steps
      if (params?.riskId && params?.riskId !== "null") {
        try {
          const { data } = await axios.get(
            `/api/riskregister/risk/getRiskWithSteps/${params.riskId}`,
            {
              params: {
                page: pagination.current,
                limit: pagination.pageSize,
              },
            }
          );
          const { hira, steps, stepsCount } = data;
          await fetchInitialDepartment(hira?.entityId);
          // populate header form
          hiraHeaderForm.setFieldsValue({
            categoryId: hira.categoryId,
            jobTitle: hira.jobTitle,
            assesmentTeam: hira.assesmentTeam,
            additionalAssesmentTeam: hira.additionalAssesmentTeam,
            location: hira.locationId,
            entity: hira.entityId,
          });

          // store in state
          setHiraHeaderFormData(hira);
          setTableData(
            steps.map((step: any) => {
              const rd = step.riskDetails || {};
              return {
                ...step,
                id: step._id,

                // extract all fields needed by the table
                riskType: rd.riskTypeId,
                riskCondition: rd.riskConditionId,
                currentControl: rd.currentControlId,
                impactType: rd.impactType?.id ?? rd.impactType?.text,

                existingRiskRatingId: rd.existingRiskRatingId,
                targetRiskRatingId: rd.targetRiskRatingId,
                existingKeyControlId: rd.existingKeyControlId,
                actualRiskRatingId: rd.actualRiskRatingId,
                currentControlEffectivenessId: rd.currentControlEffectivenessId,
                riskManagementDecisionId: rd.riskManagementDecisionId,

                // if you use these in UI
                // actualLikelihood: step.actualLikelyhood, // check for spelling mismatch
              };
            })
          );
          setPagination((p) => ({ ...p, total: stepsCount }));
        } catch {
          // you can message.error here if you like
        }
      }

      setLoading(false);
    };

    init();
  }, [params?.categoryId, params?.riskId]);

  const fetchInitialDepartment = async (id: string) => {
    try {
      const res = await axios.get(`/api/entity/getSelectedEntity/${id}`);
      const entity = res.data;

      setSelectedDept({
        id: entity.id,
        name: entity.entityName,
        type: entity?.entityType?.name,
      });
    } catch (error) {
      // console.error("Failed to fetch initial department:", error);
    }
  };

  const handleConsolidatedCloseWorkflowHistoryDrawer = () => {
    setConsolidatedWorkflowHistoryDrawer({
      ...consolidatedWorkflowHistoryDrawer,
      open: !consolidatedWorkflowHistoryDrawer.open,
      data: null,
    });
  };

  const showStartReviewButton = () => {
    if (params?.riskId || hiraHeaderFormData?._id) {
      if (
        ((hiraHeaderFormData?.workflowStatus === "DRAFT" &&
          !hiraHeaderFormData?.prefixSuffix) ||
          hiraHeaderFormData?.workflowStatus === "REJECTED") &&
        hiraHeaderFormData?.entityId === userDetails?.entity?.id
      ) {
        return true;
      } else return false;
    }
    return false;
  };

  const showReviseHiraButton = () => {
    if (params?.riskId || hiraHeaderFormData?._id) {
      if (
        ((hiraHeaderFormData?.workflowStatus === "DRAFT" &&
          !!hiraHeaderFormData?.prefixSuffix) ||
          hiraHeaderFormData?.workflowStatus === "APPROVED") &&
        hiraHeaderFormData?.entityId === userDetails?.entity?.id
      ) {
        return true;
      } else return false;
    }
    return false;
  };

  const showGoToWorkflowPageButton = () => {
    if (hiraHeaderFormData?.workflowStatus === "IN_REVIEW") {
      return true;
    } else if (hiraHeaderFormData?.workflowStatus === "IN_APPROVAL") {
      return true;
    } else return false;
  };

  const toggleScoreModal = (record: any, isPreOrPost = "") => {
    if (isPreOrPost === "pre") {
      setSelectedCell([record?.likelihood - 1, record?.impact - 1]);
    } else {
      setSelectedCell([record?.actualLikelihood - 1, record?.actualImpact - 1]);
    }
    setRiskScoreModal({
      ...riskScoreModal,
      open: !riskScoreModal.open,
      mode: isPreOrPost,
      riskId: record?.id,
    });
  };

  const handleOk = (selectedCellParam: any, isPreOrPost = "") => {
    setRiskScoreModal({
      ...riskScoreModal,
      open: !riskScoreModal.open,
    });
  };

  const handleSaveScore = (isPreOrPost: any = "", cell: any = []) => {
    if (isPreOrPost === "pre") {
      setSelectedPreCell(cell);
    } else if (isPreOrPost === "post") {
      setSelectedPostCell(cell);
    }
  };

  const getReviewedByDetails = () => {
    const latestOngoingWorkflow = hiraHeaderFormData?.workflow?.slice(
      hiraHeaderFormData?.workflow?.length - 1
    )[0];
    if (latestOngoingWorkflow?.reviewedBy) {
      return {
        reviewedBy:
          latestOngoingWorkflow?.reviewedByUser?.firstname +
          " " +
          latestOngoingWorkflow?.reviewedByUser?.lastname,
        reviewedOn: moment(latestOngoingWorkflow?.reviewedOn).format(
          "DD/MM/YYYY HH:mm"
        ),
      };
    } else return { reviewedBy: "N/A", reviewedOn: "N/A" };
  };

  const getApprovedByDetails = () => {
    const latestOngoingWorkflow = hiraHeaderFormData?.workflow?.slice(
      hiraHeaderFormData?.workflow?.length - 1
    )[0];
    if (latestOngoingWorkflow?.approvedBy) {
      return {
        approvedBy:
          latestOngoingWorkflow?.approvedByUser?.firstname +
          " " +
          latestOngoingWorkflow?.approvedByUser?.lastname,
        approvedOn: moment(latestOngoingWorkflow?.approvedOn).format(
          "DD/MM/YYYY HH:mm"
        ),
      };
    } else return { approvedBy: "N/A", approvedOn: "N/A" };
  };

  const checkIfUserCanAddReferenceNew = () => {
    if (isCreateMode) {
      return false;
    } else if (!!params?.riskId && params?.riskId !== "null") {
      return true;
    } else return false;
  };

  const handleChangePage = async (page: number, pageSize: number) => {
    // if user just added a row, we’ll jump to the last page
    setPagination({ current: page, pageSize, total: pagination.total });
    // re-fetch steps for this page
    const { data } = await axios.get(
      `/api/riskregister/risk/getRiskWithSteps/${params.riskId}`,
      { params: { page, pageSize } }
    );
    setTableData([
      ...data?.steps.map((step: any) => {
        const rd = step.riskDetails || {};
        return {
          ...step,
          id: step._id,

          // extract all fields needed by the table
          riskType: rd.riskTypeId,
          riskCondition: rd.riskConditionId,
          currentControl: rd.currentControlId,
          impactType: rd.impactType?.id ?? rd.impactType?.text,

          existingRiskRatingId: rd.existingRiskRatingId,
          targetRiskRatingId: rd.targetRiskRatingId,
          existingKeyControlId: rd.existingKeyControlId,
          actualRiskRatingId: rd.actualRiskRatingId,
          currentControlEffectivenessId: rd.currentControlEffectivenessId,
          riskManagementDecisionId: rd.riskManagementDecisionId,

          // if you use these in UI
          // actualLikelihood: step.actualLikelyhood, // check for spelling mismatch
        };
      }),
    ]);
    setRefershTable(!refershTable);
  };
  const constructLabelWithDescription = (arr: any[] = []) =>
    arr.map((item) => ({
      value: item._id,
      label: item.description
        ? `${item.label} - ${item.description}`
        : item.label,
    }));

  const fetchHiraConfig = async (categoryIdParam: any = "") => {
    try {
      const categoryId = categoryIdParam || params?.categoryId;
      const res = await axios.get(
        `/api/riskconfig/getconfigbyid/${categoryId}`
      );

      // console.log("check res", res);
      if (res.status === 200 || res.status === 201) {
        if (res?.data?.data) {
          const data = res?.data?.data;
          setRiskConfig({
            ...data,
            riskIndicatorData:
              data?.riskLevelData.map((item: any) => ({
                ...item,
                color: item.riskIndicator.split("-")[1],
              })) || [],
            riskTypeOptions: data?.riskTypeOptions?.map((riskType: any) => ({
              label: riskType.label,
              value: riskType._id?.toString(),
            })),
            riskConditionOptions: data?.riskConditionOptions?.map(
              (riskType: any) => ({
                label: riskType.label,
                value: riskType._id?.toString(),
              })
            ),
            impactTypeOptions: data?.impactTypeOptions?.map(
              (impactType: any) => ({
                label: impactType.label,
                value: impactType._id?.toString(),
              })
            ),
            currentControlOptions: data?.currentControlOptions?.map(
              (control: any) => ({
                label: control.label,
                value: control._id?.toString(),
              })
            ),
            existingRiskRatingOptions: constructLabelWithDescription(
              data?.existingRiskRatingOptions
            ),

            targetRiskRatingOptions: constructLabelWithDescription(
              data?.targetRiskRatingOptions
            ),

            existingKeyControlOptions: constructLabelWithDescription(
              data?.existingKeyControlOptions
            ),

            actualRiskRatingOptions: constructLabelWithDescription(
              data?.actualRiskRatingOptions
            ),

            currentControlEffectivenessOptions: constructLabelWithDescription(
              data?.currentControlEffectivenessOptions
            ),

            riskManagementDecisionOptions: constructLabelWithDescription(
              data?.riskManagementDecisionOptions
            ),
          });
        } else {
          setRiskConfig(null);
        }
      }
    } catch (error) {
      // console.log("errror in fetch config", error);
    }
  };

  const getHazardTypeOptions = async () => {
    try {
      const res = await axios.get(
        `api/riskconfig/getHiraTypes?locationId=${userDetails?.location?.id}&type=hazard&orgId=${userDetails?.organizationId}&master=true`
      );
      if (res?.data && !!res?.data?.data?.length) {
        const hazardTypeOptions = res?.data?.data?.map((hazard: any) => ({
          label: hazard.name,
          value: hazard._id,
        }));
        setOptions((prev: any) => ({
          ...prev,
          riskSourceOptions: hazardTypeOptions,
        }));
      } else {
        setOptions((prev: any) => ({
          ...prev,
          riskSourceOptions: [],
        }));
        message.warning("No Risk Types found for Risk config");
      }
    } catch (error) {
      message.error("Something went wrong while fetching Risk types");
      // console.log("checkrisk error in getHiraTypesOptions ", error);
    }
  };

  const getCategoryOptions = async () => {
    try {
      const res = await axios.get(
        `/api/riskconfig/getallcategorynames/${userDetails?.organizationId}`
      );

      if (res.status === 200 || res.status === 201) {
        if (res?.data?.data && res.data.data.length > 0) {
          const mappedCategories = res.data.data.map((item: any) => ({
            ...item,
            value: item._id,
            label: item.riskCategory,
          }));

          setOptions({
            ...options,
            categoryOptions: mappedCategories,
          });
          return mappedCategories;
        } else {
          setOptions({
            ...options,
            categoryOptions: [],
          });
          message.error("No Categories Found");
          return [];
        }
      } else {
        setOptions({
          ...options,
          categoryOptions: [],
        });
        message.error("Failed to fetch categories");
        return [];
      }
    } catch (error) {
      setOptions({
        ...options,
        categoryOptions: [],
      });
      message.error("Error in fetching getallcategorynames");
      return [];
    }
  };

  const fetchUsersByLocation = async () => {
    try {
      // setIsLoading(true);
      const res = await axios.get(
        `/api/riskregister/users/${userDetails?.organizationId}`
      );
      // console.log("checkrisk res", res);
      if (res.status === 200 || res.status === 201) {
        if (!!res.data && res.data.length > 0) {
          const userOptions = res.data.map((user: any) => ({
            userId: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            value: user.id,
            label: user.firstname + " " + user.lastname,
            email: user.email,
            id: user.id,
            fullname: user.firstname + " " + user.lastname,
            entityName: user?.entity?.entityName,
            avatar: user?.avatar,
            assignedRoles: user?.assignedRole,
            // label : user.firstname + " " + user.lastname,
            // // name : user.firstname + " " + user.lastname,
            // value : user.id,
          }));
          // console.log("userOptions", userOptions);
          setOptions((prev: any) => ({
            ...prev,
            userOptions: userOptions,
          }));
          // setIsLoading(false);
        } else {
          setOptions((prev: any) => ({
            ...prev,
            userOptions: [],
          }));
          message.error("No Users Found");
          // setIsLoading(false);
        }
      } else {
        setOptions((prev: any) => ({
          ...prev,
          userOptions: [],
        }));
        message.error("Failed to fetch users");
        // setIsLoading(false);
      }
    } catch (error) {
      // setIsLoading(false);
      // console.log("errror in fetching users based on location", error);
    }
  };

  const disableHeaderFields = () => {
    return false;
    // if (!!selectedHiraId || !!hiraRegisterData?._id) {
    //   // console.log("checkrisk6 inside disableHeaderFields id is found");

    //   if (
    //     hiraRegisterData?.workflowStatus === "DRAFT" &&
    //     hiraRegisterData?.entityId === userDetails?.entity?.id
    //   ) {
    //     // console.log("checkrisk6 in disableHeaderFields DRAFT HIRA and logged in user is creator");
    //     return false;
    //   } else if (
    //     hiraRegisterData?.workflowStatus === "APPROVED" &&
    //     hiraRegisterData?.entityId === userDetails?.entity?.id
    //   ) {
    //     return false;
    //   } else {
    //     // console.log("checkrisk6 in disableHeaderFields DRAFT HIRA and logged in user is not creator");

    //     const targetCycleNumber = hiraRegisterData?.currentVersion + 1;
    //     const ongoingWorkflowDetails = hiraRegisterData?.workflow?.find(
    //       (item: any) => item?.cycleNumber === targetCycleNumber
    //     );
    //     // console.log(
    //     //   "checkrisk6 ongoingWorkflowDetails in disableheaderfields",
    //     //   ongoingWorkflowDetails
    //     // );
    //     if (ongoingWorkflowDetails) {
    //       // console.log("checkrisk6 in disableHeaderFields ongoingWorkflowDetails is found");

    //       //check for reviewer
    //       if (
    //         hiraRegisterData?.workflowStatus === "IN_REVIEW" &&
    //         ongoingWorkflowDetails?.reviewers?.includes(userDetails?.id)
    //       ) {
    //         // console.log("checkrisk6 in disableHeaderFields IN_REVIEW HIRA and logged in user is reviewer");
    //         return false;
    //       }
    //       //check for approver
    //       else if (
    //         hiraRegisterData?.workflowStatus === "IN_APPROVAL" &&
    //         ongoingWorkflowDetails?.approvers?.includes(userDetails?.id)
    //       ) {
    //         // console.log("checkrisk6 in disableHeaderFields IN_APPROVAL HIRA and logged in user is approver");
    //         return false;
    //       }
    //       //check for creator in rejected state
    //       else if (
    //         hiraRegisterData?.workflowStatus === "REJECTED" &&
    //         hiraRegisterData?.entityId === userDetails?.entity?.id
    //       ) {
    //         // console.log("checkrisk6 in disableHeaderFields REJECTED HIRA and logged in user is creator");
    //         return false;
    //       } else {
    //         return true;
    //       }
    //     }
    //   }
    // } else if (isNewJob) {
    //   // console.log("checkrisk6 in disableHeaderFields NEW JOB HIRA and logged in user is creator");
    //   return false;
    // } else return true;
  };

  const handleStartReviewNew = () => {
    const hiraId = params?.riskId || hiraHeaderFormData?._id;
    navigate(
      `/risk/riskregister/HIRA/review/${hiraHeaderFormData?.categoryId}/${hiraId}`,
      {
        state: {
          hiraLocationId: hiraHeaderFormData?.locationId,
          hiraEntityId: hiraHeaderFormData?.entityId,
          filters: {
            selectedCategory: params?.categoryId,
            selectedLocation: hiraHeaderFormData?.locationId,
            selectedEntity: hiraHeaderFormData?.entityId,
            selectedArea: "",
            selectedSection: "",
            selectedStatus: "All",
          },
        },
      }
    );
  };

  const handleGoToWorkflowPageClick = () => {
    const hiraId = params?.riskId || hiraHeaderFormData?._id;
    navigate(
      `/risk/riskregister/HIRA/review/${hiraHeaderFormData?.categoryId}/${hiraId}`,
      {
        state: {
          hiraLocationId: hiraHeaderFormData?.locationId,
          hiraEntityId: hiraHeaderFormData?.entityId,
          filters: {
            selectedCategory: params?.categoryId,
            selectedLocation: hiraHeaderFormData?.locationId,
            selectedEntity: hiraHeaderFormData?.entityId,
            selectedArea: "",
            selectedSection: "",
            selectedStatus: "All",
          },
        },
      }
    );
  };

  const getRiskWithSteps = async () => {
    try {
      const res = await axios.get(
        `/api/riskregister/risk/getRiskWithSteps/${params?.riskId}`,
        {
          params: {
            page: pagination?.current,
            limit: pagination?.pageSize,
          },
        }
      );
      const { hira, steps, stepsCount } = res?.data;
      setTableData([
        ...steps.map((step: any) => {
          const rd = step.riskDetails || {};
          return {
            ...step,
            id: step._id,

            // extract all fields needed by the table
            riskType: rd.riskTypeId,
            riskCondition: rd.riskConditionId,
            currentControl: rd.currentControlId,
            impactType: rd.impactType?.id ?? rd.impactType?.text,

            existingRiskRatingId: rd.existingRiskRatingId,
            targetRiskRatingId: rd.targetRiskRatingId,
            existingKeyControlId: rd.existingKeyControlId,
            actualRiskRatingId: rd.actualRiskRatingId,
            currentControlEffectivenessId: rd.currentControlEffectivenessId,
            riskManagementDecisionId: rd.riskManagementDecisionId,

            // if you use these in UI
            // actualLikelihood: step.actualLikelyhood, // check for spelling mismatch
          };
        }),
      ]);
      setRefershTable(!refershTable);
      setPagination((p) => ({ ...p, total: stepsCount }));
    } catch (error) {
      message.error("Something went wrong while fetching risk");
    }
  };

  const handleCreateRisk = async (newRow: any) => {
    // trim all string values
    const trimmedRow = Object.entries(newRow).reduce((acc, [key, val]) => {
      acc[key] = typeof val === "string" ? val.trim() : val;
      return acc;
    }, {} as Record<string, any>);

    const { probabilityWeightage, severityWeightage } = riskConfig;

    const likelihood = Number(trimmedRow.likelihood);
    const impact = Number(trimmedRow.impact);
    const actualLikelihood = Number(trimmedRow.actualLikelihood);
    const actualImpact = Number(trimmedRow.actualImpact);

    const baseScore =
      !isNaN(likelihood) && !isNaN(impact)
        ? likelihood * probabilityWeightage * (impact * severityWeightage)
        : undefined;

    const actualScore =
      !isNaN(actualLikelihood) && !isNaN(actualImpact)
        ? actualLikelihood *
          probabilityWeightage *
          (actualImpact * severityWeightage)
        : undefined;

    const payloadRow = {
      ...trimmedRow,
      ...(baseScore !== undefined && { baseScore }),
      ...(actualScore !== undefined && { actualScore }),
    };
    try {
      const res = await axios.post(
        `/api/riskregister/risk/createRiskWithMultipleSteps`,
        {
          steps: [payloadRow],
          hira: {
            ...hiraHeaderFormData,
            locationId: userDetails?.location?.id,
            entityId: userDetails?.entity?.id,
            organizationId: userDetails?.organizationId,
          },
        }
      );
      // console.log("checkr res", res);
      const newId = res?.data[0]?._id;
      navigate(`/risk/riskregister/form/${params?.categoryId}/${newId}`);
      message.success("Risk created successfully");
    } catch (error) {
      message.error("Something went wrong while creating risk");
    }
  };

  const handleAddRiskStep = async (newRow: any) => {
    const trimmedRow = Object.entries(newRow).reduce((acc, [key, val]) => {
      acc[key] = typeof val === "string" ? val.trim() : val;
      return acc;
    }, {} as Record<string, any>);

    const { probabilityWeightage, severityWeightage } = riskConfig;

    const likelihood = Number(trimmedRow.likelihood);
    const impact = Number(trimmedRow.impact);
    const actualLikelihood = Number(trimmedRow.actualLikelihood);
    const actualImpact = Number(trimmedRow.actualImpact);

    const baseScore =
      !isNaN(likelihood) && !isNaN(impact)
        ? likelihood * probabilityWeightage * (impact * severityWeightage)
        : undefined;

    const actualScore =
      !isNaN(actualLikelihood) && !isNaN(actualImpact)
        ? actualLikelihood *
          probabilityWeightage *
          (actualImpact * severityWeightage)
        : undefined;

    const payloadRow = {
      ...trimmedRow,
      ...(baseScore !== undefined && { baseScore }),
      ...(actualScore !== undefined && { actualScore }),
    };
    try {
      const res = await axios.post(
        `/api/riskregister/risk/addRiskStepToRisk/${params?.riskId}`,
        {
          ...payloadRow,
          locationId: userDetails?.location?.id,
          entityId: userDetails?.entity?.id,
          organizationId: userDetails?.organizationId,
        }
      );

      // re-fetch steps for this page
      const { data } = await axios.get(
        `/api/riskregister/risk/getRiskWithSteps/${params.riskId}`,
        { params: { page: 1, pageSize: 10 } }
      );
      setPagination({ ...pagination, current: 1, total: data?.stepsCount });
      setTableData([
        ...data?.steps.map((step: any) => {
          const rd = step.riskDetails || {};
          return {
            ...step,
            id: step._id,

            // extract all fields needed by the table
            riskType: rd.riskTypeId,
            riskCondition: rd.riskConditionId,
            currentControl: rd.currentControlId,
            impactType: rd.impactType?.id ?? rd.impactType?.text,

            existingRiskRatingId: rd.existingRiskRatingId,
            targetRiskRatingId: rd.targetRiskRatingId,
            existingKeyControlId: rd.existingKeyControlId,
            actualRiskRatingId: rd.actualRiskRatingId,
            currentControlEffectivenessId: rd.currentControlEffectivenessId,
            riskManagementDecisionId: rd.riskManagementDecisionId,

            // if you use these in UI
            // actualLikelihood: step.actualLikelyhood, // check for spelling mismatch
          };
        }),
      ]);
      setRefershTable(!refershTable);
      message.success(
        `${riskConfig?.secondaryClassification} created successfully`
      );
    } catch (error) {
      message.error("Something went wrong while creating risk");
    }
  };

  const handleUpdateRiskStep = async (newRow: any) => {
    try {
      const trimmedRow = Object.entries(newRow).reduce((acc, [key, val]) => {
        acc[key] = typeof val === "string" ? val.trim() : val;
        return acc;
      }, {} as Record<string, any>);

      const { probabilityWeightage, severityWeightage } = riskConfig;

      const likelihood = Number(trimmedRow.likelihood);
      const impact = Number(trimmedRow.impact);
      const actualLikelihood = Number(trimmedRow.actualLikelihood);
      const actualImpact = Number(trimmedRow.actualImpact);

      const baseScore =
        !isNaN(likelihood) && !isNaN(impact)
          ? likelihood * probabilityWeightage * (impact * severityWeightage)
          : undefined;

      const actualScore =
        !isNaN(actualLikelihood) && !isNaN(actualImpact)
          ? actualLikelihood *
            probabilityWeightage *
            (actualImpact * severityWeightage)
          : undefined;

      const payloadRow = {
        ...trimmedRow,
        ...(baseScore !== undefined && { baseScore }),
        ...(actualScore !== undefined && { actualScore }),
      };

      const res = await axios.put(
        `/api/riskregister/risk/updateRiskStep/${newRow?._id}`,
        {
          ...payloadRow,
        }
      );
      // console.log("checkr8 res", res);
      message.success("Risk Updated Successfully");
    } catch (error) {
      message.error("Something went wrong while updating risk");
    }
  };

  const handleCreateRiskWithMultipleSteps = async (allRows: any[]) => {
    const { probabilityWeightage, severityWeightage } = riskConfig;

    // 1) normalize each row
    const steps = allRows.map((row) => {
      // trim all strings
      const trimmed = Object.entries(row).reduce((acc, [key, val]) => {
        acc[key] = typeof val === "string" ? val.trim() : val;
        return acc;
      }, {} as Record<string, any>);

      // coerce to numbers
      const likelihood = Number(trimmed.likelihood);
      const impact = Number(trimmed.impact);
      const actualLikelihood = Number(trimmed.actualLikelihood);
      const actualImpact = Number(trimmed.actualImpact);

      // compute scores if valid
      const baseScore =
        Number.isFinite(likelihood) && Number.isFinite(impact)
          ? likelihood * probabilityWeightage * (impact * severityWeightage)
          : undefined;

      const actualScore =
        Number.isFinite(actualLikelihood) && Number.isFinite(actualImpact)
          ? actualLikelihood *
            probabilityWeightage *
            (actualImpact * severityWeightage)
          : undefined;

      return {
        ...trimmed,
        ...(baseScore !== undefined && { baseScore }),
        ...(actualScore !== undefined && { actualScore }),
      };
    });

    try {
      const res = await axios.post(
        `/api/riskregister/risk/createRiskWithMultipleSteps`,
        {
          steps,
          hira: {
            ...hiraHeaderFormData,
            locationId: userDetails?.location?.id,
            entityId: userDetails?.entity?.id,
            organizationId: userDetails?.organizationId,
          },
        }
      );
      const newId = res?.data[0]?._id;
      navigate(`/risk/riskregister/form/${params?.categoryId}/${newId}`);
      message.success("Risk created successfully");
    } catch (error) {
      console.error(error);
      message.error("Something went wrong while creating risk");
    }
  };

  const handleDeleteRiskStep = async (rowId: string) => {
    try {
      const res = await axios.delete(
        `/api/riskregister/risk/riskStep/${params?.riskId}/${rowId}`
      );

      getRiskWithSteps();
      message.success(
        `${riskConfig?.secondaryClassification} Deleted Successfully`
      );
    } catch (error) {
      message.error("Something went wrong while deleting risk");
    }
  };

  const handleUpdateRiskHeader = async () => {
    try {
      const res = await axios.put(
        `/api/riskregister/risk/updateRiskHeader/${params?.riskId}`,
        {
          ...hiraHeaderFormData,
        }
      );
      // console.log("checkr res", res);
      message.success(
        `${riskConfig?.primaryClassification} Header Updated Successfully`
      );
    } catch (error) {
      message.error("Something went wrong while updating risk");
    }
  };

  const renderRiskHeaderForm = () => {
    return (
      <>
        <div
          style={{ marginBottom: "15px" }}
          className={classes.descriptionLabelStyle}
        >
          <Form
            form={hiraHeaderForm}
            layout="vertical"
            onValuesChange={(changedValues, allValues) => {
              setHiraHeaderFormData({
                ...hiraHeaderFormData,
                ...changedValues,
              });
            }}
          >
            <Descriptions
              bordered
              size="small"
              column={{
                xxl: 3, // or any other number of columns you want for xxl screens
                xl: 3, // or any other number of columns you want for xl screens
                lg: 2, // or any other number of columns you want for lg screens
                md: matches ? 2 : 1, // or any other number of columns you want for md screens
                sm: 1, // or any other number of columns you want for sm screens
                xs: 1, // or any other number of columns you want for xs screens
              }}
              layout={matches ? "horizontal" : "vertical"}
              className={classes.descriptionAssessmentTeam}
            >
              <Descriptions.Item label="Category : ">
                <Form.Item
                  name="categoryId"
                  className={classes.disabledInput}
                  style={{ marginBottom: 0 }}
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
                    options={options.categoryOptions}
                    size="large"
                    disabled
                    listHeight={200}
                  />
                </Form.Item>
              </Descriptions.Item>
              <Descriptions.Item
                label={`${riskConfig?.primaryClassification}*`}
              >
                <Form.Item
                  name="jobTitle"
                  rules={[
                    {
                      required: true,
                      message: `Please Input Your ${riskConfig?.primaryClassification}!`,
                    },
                  ]}
                  className={classes.disabledInput}
                  style={{ marginBottom: 0 }}
                >
                  <Input
                    placeholder={`Enter ${riskConfig?.primaryClassification}`}
                    size="large"
                    disabled={disableHeaderFields()}
                  />
                </Form.Item>
              </Descriptions.Item>
              <Descriptions.Item
                label="Assessment Team*: "
                className={classes.descriptionAssessmentTeam}
              >
                <Form.Item
                  // label="Assesment Team: "
                  className={classes.disabledMultiSelect}
                  name="assesmentTeam"
                  style={{ marginBottom: 0, width: "300px !important" }}
                  rules={[
                    {
                      required: true,
                      message: "Please Select Team!",
                    },
                  ]}
                >
                  <CustomMultiSelect
                    label=""
                    placeholder="Select Team"
                    options={options?.userOptions}
                    selectedValues={hiraHeaderFormData?.assesmentTeam || []}
                    onChange={(val) =>
                      setHiraHeaderFormData((prev: any) => ({
                        ...prev,
                        assesmentTeam: val,
                      }))
                    }
                    disabled={disableHeaderFields()}
                  />
                </Form.Item>
              </Descriptions.Item>
              <Descriptions.Item label="Corp Func/Unit: ">
                <Form.Item
                  className={classes.disabledInput}
                  style={{ marginBottom: 0 }}
                  // name="unit"
                >
                  <Input
                    // placeholder="Enter Area"
                    value={userDetails?.location?.locationName}
                    size="large"
                    disabled={true}
                  />
                </Form.Item>
              </Descriptions.Item>
              <Descriptions.Item label="Entity: ">
                <Form.Item
                  className={classes.disabledInput}
                  style={{ marginBottom: 0 }}
                >
                  {/* <Input
                    value={userDetails?.entity?.entityName}
                    size="large"
                    disabled={true}
                  /> */}
                  <DepartmentSelector
                    locationId={
                      !!params?.riskId
                        ? hiraHeaderFormData?.locationId
                        : userDetails?.location?.id
                    }
                    selectedDepartment={selectedDept}
                    onSelect={(dept, type) => {}}
                    onClear={() => {}}
                    disabled={true}
                  />
                </Form.Item>
              </Descriptions.Item>
              <Descriptions.Item label="Additional Assessment Team: ">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Form.Item
                    style={{ marginBottom: 0, flex: 1 }}
                    name="additionalAssesmentTeam"
                    className={classes.disabledInput}
                  >
                    <Input
                      placeholder="Enter Additional Team Members"
                      size="large"
                      width={"100%"}
                      disabled={disableHeaderFields()}
                    />
                  </Form.Item>
                </div>
              </Descriptions.Item>
              {params?.riskId && params?.riskId !== "null" && (
                <Descriptions.Item span={3} style={{ textAlign: "right" }}>
                  <PrimaryButton
                    buttonText="Update Header"
                    onClick={handleUpdateRiskHeader}
                  />
                </Descriptions.Item>
              )}
            </Descriptions>
          </Form>
        </div>
      </>
    );
  };

  const renderHiraStatusTag = () => {
    if (hiraHeaderFormData?.workflowStatus === "DRAFT") {
      return (
        <Space size={[0, 8]} wrap>
          <Tag className={classes.homePageTagStyle} color="#EEDC82">
            DRAFT
          </Tag>
        </Space>
      );
    } else if (hiraHeaderFormData?.workflowStatus === "IN_REVIEW") {
      return (
        <Space size={[0, 8]} wrap>
          {" "}
          <Tag className={classes.homePageTagStyle} color="#FFAC1C">
            IN REVIEW
          </Tag>
        </Space>
      );
    } else if (hiraHeaderFormData?.workflowStatus === "IN_APPROVAL") {
      return (
        <Space size={[0, 8]} wrap>
          <Tag className={classes.homePageTagStyle} color="#7CB9E8">
            IN APPROVAL
          </Tag>
        </Space>
      );
    } else if (hiraHeaderFormData?.workflowStatus === "APPROVED") {
      return (
        <Space size={[0, 8]} wrap>
          <Tag className={classes.homePageTagStyle} color="#00AB66">
            APPROVED
          </Tag>
        </Space>
      );
    } else if (hiraHeaderFormData?.workflowStatus === "REJECTED") {
      return (
        <Space size={[0, 8]} wrap>
          <Tag className={classes.homePageTagStyle} color="#EE4B2B">
            REJECTED
          </Tag>
        </Space>
      );
    } else {
      return (
        <Space size={[0, 8]} wrap>
          <Tag className={classes.homePageTagStyle} color="crimson">
            N/A
          </Tag>
        </Space>
      );
    }
  };

  const renderRiskActionsButtons = () => {
    return (
      <>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            float: "right",
            justifyContent: "flex-end",
          }}
        >
          <>
            {showStartReviewButton() && (
              <PrimaryButton
                // style={{
                //   display: "flex",
                //   alignItems: "center",
                //   backgroundColor: "#003566",
                //   color: "white",
                // }}
                style={{ marginRight: "5px" }}
                onClick={handleStartReviewNew}
                buttonText="Start Review/Approval"
              />
            )}

            {showReviseHiraButton() && (
              <PrimaryButton
                // style={{
                //   display: "flex",
                //   alignItems: "center",
                //   backgroundColor: "#003566",
                //   color: "white",
                // }}
                buttonText="Revise Risk"
                style={{ marginRight: "5px" }}
                onClick={handleStartReviewNew}
              />
            )}

            {showGoToWorkflowPageButton() && (
              <PrimaryButton
                // style={{
                //   display: "flex",
                //   alignItems: "center",
                //   backgroundColor: "#003566",
                //   color: "white",
                // }}
                style={{ marginRight: "5px" }}
                onClick={handleGoToWorkflowPageClick}
                buttonText="Go To Workflow Page"
              />
            )}
            {/* {activeModules?.includes("AI_FEATURES") && (
                <>
                  {selectedHiraId && (
                    <Button
                      style={{
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: "#003566",
                        color: "white",
                      }}
                      icon={
                        <MdOutlineRecommend
                          style={{ width: "18px", height: "18px" }}
                        />
                      }
                      onClick={handleAddHiraToMilvus}
                      loading={isLoadingForMilvus}
                    >
                      Accept Recommendation
                    </Button>
                  )}
                </>
              )} */}
          </>
        </div>
      </>
    );
  };

  const probabilityOptions = (riskConfig?.probabilityLabels || []).map(
    (lbl: any, i: any) => ({ value: i + 1, label: `${i + 1} – ${lbl}` })
  );
  const severityOptions = (riskConfig?.severityLabels || []).map(
    (lbl: any, i: any) => ({ value: i + 1, label: `${i + 1} – ${lbl}` })
  );

  const dateColumn = (key: string, label: string, width = "240px") => ({
    key,
    label,
    inputType: "date" as const,
    width,
    render: (_: any, record: any) =>
      record[key] ? moment(record[key]).format("DD-MM-YYYY") : null,
  });

  const computedColumns = [
    {
      key: "preMitigationScore",
      label: "L*I",
      inputType: null,
      width: "150px",
      render: (_: any, rec: any) => {
        const p = rec.likelihood;
        const s = rec.impact;
        const pw = +riskConfig.probabilityWeightage;
        const sw = +riskConfig.severityWeightage;
        // first reject any non‐numbers
        if (![p, s, pw, sw].every((x) => Number.isFinite(+x))) {
          return null;
        }
        const score = p * pw * s * sw;
        // if the result is zero, show nothing
        if (score === 0) {
          return null;
        }
        return (
          <Tooltip title="Click For Risk Heatmap">
            <AntTypography.Link onClick={() => toggleScoreModal(rec, "pre")}>
              {score}
            </AntTypography.Link>
          </Tooltip>
        );
      },
    },
    {
      key: "postMitigationScore",
      label: "AL*AI",
      inputType: null,
      width: "150px",
      render: (_: any, rec: any) => {
        const p = rec.actualLikelihood;
        const s = rec.actualImpact;
        const pw = +riskConfig.probabilityWeightage;
        const sw = +riskConfig.severityWeightage;
        if (![p, s, pw, sw].every((x) => Number.isFinite(+x))) {
          return null;
        }
        const score = p * pw * s * sw;
        if (score === 0) {
          return null;
        }
        return (
          <Tooltip title="Click For Risk Heatmap">
            <AntTypography.Link onClick={() => toggleScoreModal(rec, "post")}>
              {score}
            </AntTypography.Link>
          </Tooltip>
        );
      },
    },
  ];

  // now build your flat columns array in the exact order you want:
  const columns: any[] = [
    {
      key: "sNo",
      label: `${riskConfig?.secondaryClassification}. No.`,
      inputType: "number",
      width: "80px",
    },
    dateColumn("regDate", "Risk Date"),

    conditionalColumn(
      "riskSource",
      "Source",
      "select",
      options.riskSourceOptions
    ),
    conditionalColumn(
      "riskType",
      "Type of Risk",
      "select",
      riskConfig?.riskTypeOptions
    ),
    {
      key: "jobBasicStep",
      label: riskConfig?.secondaryClassification,
      inputType: "textarea",
      width: "300px",
    },
    {
      key: "riskDetailedScenario",
      label: "Risk Detailed Scenario",
      inputType: "textarea",
      width: "300px",
    },
    {
      key: "riskOwner",
      label: "Risk Owner",
      inputType: "textarea",
      width: "300px",
    },
    {
      key: "existingControl",
      label: "Existing Controls",
      inputType: "textarea",
      width: "200px",
    },
    conditionalColumn(
      "riskCondition",
      "Risk Condition",
      "select",
      riskConfig?.riskConditionOptions
    ),
    conditionalColumn(
      "impactType",
      "What is Affected?",
      riskConfig?.impactTypeFormat === "dropdown" ? "select" : "text",
      riskConfig?.impactTypeOptions
    ),

    {
      key: "likelihood",
      label: "Likelihood",
      inputType: "select",
      options: probabilityOptions,
      width: "120px",
    },
    {
      key: "impact",
      label: "Impact",
      inputType: "select",
      options: severityOptions,
      width: "120px",
    },

    computedColumns[0],

    ...(riskConfig?.showExistingTargetRiskLevels
      ? [
          conditionalColumn(
            "existingRiskRatingId",
            "Existing Risk Rating",
            "select",
            riskConfig?.existingRiskRatingOptions
          ),
          conditionalColumn(
            "targetRiskRatingId",
            "Target Risk Rating",
            "select",
            riskConfig?.targetRiskRatingOptions
          ),
        ].filter(Boolean)
      : []),

    conditionalColumn(
      "existingKeyControlId",
      "Existing Key Control Effectiveness",
      "select",
      riskConfig?.existingKeyControlOptions
    ),
    conditionalColumn(
      "currentControlEffectivenessId",
      "Current Control Effectiveness",
      "select",
      riskConfig?.currentControlEffectivenessOptions
    ),
    {
      key: "residualRiskAccepted",
      label: "Residual Risk Accepted?",
      inputType: "radio",
      width: "180px",
      options: [
        { value: true, label: "Yes" },
        { value: false, label: "No" },
      ],
    },

    conditionalColumn(
      "riskManagementDecisionId",
      "Risk Management Decision",
      "select",
      riskConfig?.riskManagementDecisionOptions
    ),

    {
      key: "requireRiskTreatment",
      label: "Require Further Risk Treatment?",
      inputType: "radio",
      width: "180px",
      options: [
        { value: true, label: "Yes" },
        { value: false, label: "No" },
      ],
    },

    {
      key: "additionalControlDescription",
      label: "Description of Additional Controls",
      inputType: "textarea",
      width: "250px",
    },

    dateColumn("targetDate", "Target Date"),
    {
      key: "actualLikelihood",
      label: "Actual Likelihood",
      inputType: "select",
      options: probabilityOptions,
      width: "120px",
    },
    {
      key: "actualImpact",
      label: "Actual Impact",
      inputType: "select",
      options: severityOptions,
      width: "120px",
    },
    computedColumns[1],

    conditionalColumn(
      "actualRiskRatingId",
      "Actual Risk Rating",
      "select",
      riskConfig?.actualRiskRatingOptions
    ),

    {
      key: "monitoringDetails",
      label: "Monitoring Details",
      inputType: "textarea",
      width: "250px",
    },
    dateColumn("nextReviewDate", "Next Review Date"),
    // conditionalColumn(
    //   "responsiblePerson",
    //   "Responsibility",
    //   "select",
    //   options.userOptions,
    //   "180px"
    // ),
    {
      key: "responsibility",
      label: "Responsibility",
      inputType: "multiselect",
      width: "200px",
      // We’ll pull the options via getOptionsForColumn
    },

    { key: "action", label: "Action", inputType: null, width: "100px" },
  ].filter(Boolean); // Clean out nulls

  const tabs = [
    {
      key: "steps",
      label: `Risks`,
      content: (
        <RiskEditableTable
          columns={columns}
          initialData={tableData}
          onSaveRow={async (rowId, newRow) => {
            // console.log("checkr8 rowId", newRow);

            // 1) brand‐new risk entirely?
            if (params?.riskId && params?.riskId === "null") {
              return handleCreateRisk(newRow);
            }

            // 2) new step in an existing risk?
            //    temp rows will lack a Mongo _id
            if (params?.riskId && params?.riskId !== "null" && !newRow._id) {
              await handleAddRiskStep(newRow);
              // const newTotal = pagination.total + 1;
              // const lastPage = Math.ceil(newTotal / pagination.pageSize);
              // await handleChangePage(lastPage, pagination.pageSize);
              // setPagination(p => ({ ...p, total: newTotal, current: lastPage }));
              return;
            }

            // 3) updating an existing step
            return handleUpdateRiskStep(newRow);
          }}
          onSaveAllRows={(allRows) => {
            if (params?.riskId && params?.riskId === "null") {
              return handleCreateRiskWithMultipleSteps(allRows);
            }
            // console.log("Saving all rows:", allRows);
            // Batch‐save to server if needed
          }}
          onTableDataChange={(currentRows: any) => {
            setTableData([...currentRows]);
          }}
          onDeleteRow={handleDeleteRiskStep}
          riskConfig={riskConfig}
          options={options}
          isCreateMode={isCreateMode}
          showRequireStepMessage={showRequireStepMessage}
          headerIsValid={headerIsValid}
          setShowRequireStepMessage={setShowRequireStepMessage}
          pagination={pagination}
          setPagination={setPagination}
          handleChangePage={handleChangePage}
          refershTable={refershTable}
        />
      ),
    },
    {
      key: "info",
      label: "Info",
      content: (
        <>
          {params?.riskId && params?.riskId !== "null" && (
            <div>
              <Descriptions
                bordered
                size="small"
                className={classes.descriptionItemStyle}
                column={{
                  xxl: 3,
                  xl: 3,
                  lg: 2,
                  md: 2,
                  sm: 1,
                  xs: 1,
                }}
              >
                <Descriptions.Item
                  label="Created By:"
                  style={{ textTransform: "capitalize" }}
                >
                  {hiraHeaderFormData?.createdByUserDetails?.firstname +
                    " " +
                    hiraHeaderFormData?.createdByUserDetails?.lastname ||
                    "N/A"}{" "}
                </Descriptions.Item>
                <Descriptions.Item
                  label="Reviewed By:"
                  style={{ textTransform: "capitalize" }}
                >
                  {getReviewedByDetails()?.reviewedBy || "N/A"}
                </Descriptions.Item>

                <Descriptions.Item
                  label="Approved By :"
                  style={{ textTransform: "capitalize" }}
                >
                  {getApprovedByDetails()?.approvedBy || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Created On : ">
                  {hiraHeaderFormData?.hiraCreatedAt
                    ? moment(hiraHeaderFormData?.hiraCreatedAt).format(
                        "DD/MM/YYYY HH:mm"
                      )
                    : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Reviewed On : ">
                  {getReviewedByDetails()?.reviewedOn || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Approved On :">
                  {getApprovedByDetails()?.approvedOn || "N/A"}
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}
        </>
      ),
    },
    {
      key: "references",
      label: "References",
      content: (
        <div>
          <HiraReferences
            drawer={referencesDrawer}
            workflowStatus={hiraHeaderFormData?.workflowStatus}
            checkIfUserCanAddReference={checkIfUserCanAddReferenceNew}
            hiraId={hiraHeaderFormData?._id}
          />
        </div>
      ),
    },
    {
      key: "history",
      label: "Revision History",
      content: (
        <>
          <div>
            <HiraConsolidatedWorkflowHistoryDrawer
              consolidatedWorkflowHistoryDrawer={{
                open: true,
                data: hiraHeaderFormData,
              }}
              handleConsolidatedCloseWorkflowHistoryDrawer={
                handleConsolidatedCloseWorkflowHistoryDrawer
              }
              riskConfig={riskConfig}
            />
          </div>
        </>
      ),
    },
  ];

  const renderComponents = () => (
    <>
      {!!riskScoreModal.open && (
        <>
          <RiskScoreModal
            preMitigationScoreModal={riskScoreModal}
            toggleScoreModal={toggleScoreModal}
            existingRiskConfig={riskConfig}
            selectedCell={selectedCell}
            setSelectedCell={setSelectedCell}
            handleOk={handleOk}
            handleSaveScore={handleSaveScore}
            riskScoreModal={riskScoreModal}
          />
        </>
      )}
    </>
  );

  return (
    <div style={{ padding: "16px" }}>
      {/* Category Selection Modal */}
      {/* {renderCategorySelectionModal()} */}
      {/* Header Section */}
      <Box
        className={classes.titleRow}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gridGap: "12px",
        }}
      >
        {/* ----- LEFT: Back + Title ----- */}
        <Box
          className={classes.titleGroup}
          sx={{
            display: "flex",
            // alignItems: "center",
            gridGap: 1,
            alignItems: "self-start",
          }}
        >
          <Box
            className={classes.backLink}
            onClick={() => window.history.back()}
            aria-label="Go back"
            sx={{ display: "flex", alignItems: "center" }}
            style={{ cursor: "pointer" }}
          >
            <MdOutlineArrowBackIos size={18} />
            <Typography component="span" className={classes.backText}>
              Back
            </Typography>
          </Box>
          <Typography component="h1" className={classes.headerTitle}>
            Risk Register
          </Typography>
        </Box>

        {/* ----- RIGHT: Actions + Status ----- */}
        <Box sx={{ display: "flex", alignItems: "center", gridGap: 2 }}>
          {renderRiskActionsButtons()}
          {!isCreateMode && renderHiraStatusTag()}
        </Box>
      </Box>

      {loading ? (
        <>
          {/* Loader For Whole Page */}
          <Spin size="large" />
        </>
      ) : (
        <>
          {/* Risk Header  */}
          {renderRiskHeaderForm()}
          {/* Tabs Section */}
          <div
            className={classes.tabsWrapper}
            style={{
              marginBottom: "10px",
              position: "relative",
              marginTop: matches ? "0px" : "30px",
            }}
          >
            <Tabs
              type="card"
              activeKey={activeTab}
              onChange={(key) => setActiveTab(key)}
              animated={{ inkBar: true, tabPane: true }}
              items={tabs.map((tab) => ({
                key: tab.key,
                label: tab.label,
                children: tab.content,
              }))}
            />
          </div>
          {renderComponents()}
        </>
      )}
    </div>
  );
};

export default RiskRegisterForm;
