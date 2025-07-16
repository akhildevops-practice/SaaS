//react
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ReactComponent as SignificantIcon } from "assets/icons/significantIcon.svg";

//moment
import moment from "moment";

//antd
import {
  // Table,
  Row,
  Col,
  Space,
  Tooltip,
  Button,
  DatePicker,
  Form,
  Pagination,
  Typography,
  Tour,
  Popover as AntdPopover,
  Descriptions,
  Skeleton,
  message
} from "antd";
import type { TourProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { PaginationProps } from "antd";
import { MdCheckCircle } from 'react-icons/md';
//material-ui icons
//<--kebab menu icons -->
import { MdChat } from 'react-icons/md';
import { MdHistory } from 'react-icons/md';
import { MdPeople } from 'react-icons/md';
//<--table icons
import { MdKeyboardArrowDown } from 'react-icons/md';
import { MdChevronRight } from 'react-icons/md';

//saved icon <-- filter icon -->
import { ReactComponent as ExpandIcon } from "assets/icons/row-expand.svg";

//thirdparty libs
import { useSnackbar } from "notistack";

//utils
import getSessionStorage from "utils/getSessionStorage";
import axios from "apis/axios.global";

//assets
import { MdChevronLeft } from 'react-icons/md';
//styles
import useStyles from "./style";
import "./new.css";

//components
import HiraWorkflowModal from "components/Risk/Hira/HiraRegisterReview/HiraWorkflowModal";
import HiraWorkflowCommentsDrawer from "components/Risk/Hira/HiraRegisterReview/HiraWorkflowCommentsDrawer";
import HiraWorkflowHistoryDrawer from "components/Risk/Hira/HiraRegisterReview/HiraWorkflowHistoryDrawer";
import { Box, CircularProgress, IconButton, Paper, TableBody, TableCell, TableHead, Popover, TableContainer, TableRow, Table } from "@material-ui/core";
import RiskScoreModal from "components/Risk/Hira/HiraRegister/RiskScoreModal";
import { MdLibraryBooks } from 'react-icons/md';
import HiraHistoryDrawerForAllView from "components/Risk/Hira/HiraRegister/HiraHistoryDrawerForAllView";
import { MdEdit } from 'react-icons/md';
import { riskConfig } from "schemas/riskConfigSchema";
import RiskStepsViewTable from "./RiskStepsViewTable";

const showTotal: PaginationProps["showTotal"] = (total) =>
  `Total ${total} items`;

const { RangePicker } = DatePicker;
const HiraRegisterReviewPage = () => {
  const userDetails = getSessionStorage();
  const orgId = sessionStorage.getItem("orgId");
  const params = useParams<any>();
  const navigate = useNavigate();
  const location = useLocation();
  const [tableData, setTableData] = useState<any[]>([]);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(false);

  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [mitigationModal, setMitigationModal] = useState<any>({
    open: false,
    mode: "create",
    data: {},
  });
  const [formType, setFormType] = useState<string>("create");
  const [riskId, setRiskId] = useState<any>("");

  const [hoveredRow, setHoveredRow] = useState(null);
  const [statusFilter, setStatusFilter] = useState<any>([]);
  const [dateFilter, setDateFilter] = useState<any>("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [options, setOptions] = useState<any>({
    categoryOptions: [],
    entityOptions: [],
    locationOptions: [],
    userOptions: [],
    riskSourceOptions: [],
  });
  const [existingRiskConfig, setExistingRiskConfig] = useState<any>(null);

  const [search, setSearch] = useState("");
  const [dateForm] = Form.useForm();
  const [iconColor, setIconColor] = useState("#380036");
  // const params = useParams();

  const [jobTitleOptions, setJobTitleOptions] = useState<any>([]);
  const [selectedJobTitle, setSelectedJobTitle] = useState<any>(null);

  const [postMitigation, setPostMitigation] = useState<any>([]);
  const [postScore, setPostScore] = useState<any>(0);


  const [activeTab, setActiveTab] = useState<any>("1");
  const [tableDataForReport, setTableDataForReport] = useState<any[]>([]);

  // const [hiraConsolidatedStatus, setHiraConsolidatedStatus] =
  //   useState<any>("open");
  const [hiraInWorkflow, setHiraInWorkflow] = useState<any>(null);
  const [hiraInWorkflowIds, setHiraInWorkflowIds] = useState<any>([]);

  const [hiraWorkflowModal, setHiraWorkflowModal] = useState<any>({
    open: false,
    data: null,
    status: hiraInWorkflow?.status,
  });

  const [hiraStatus, setHiraStatus] = useState<any>("open");

  const [hiraWorkflowCommentsDrawer, setHiraWorkflowCommentsDrawer] =
    useState<any>({
      open: false,
      data: {},
    });

  const [hiraWorkflowHistoryDrawer, setHiraWorkflowHistoryDrawer] =
    useState<any>({
      open: false,
      data: {},
    });

  const [
    consolidatedWorkflowHistoryDrawer,
    setConsolidatedWorkflowHistoryDrawer,
  ] = useState<any>({
    open: false,
    data: {},
  });

  const [anchorEl, setAnchorEl] = useState(null);
  const openPopover = Boolean(anchorEl);
  const [anchorElDate, setAnchorElDate] = useState(null);

  const [riskScoreModal, setRiskScoreModal] = useState<any>({
    open: false,
    data: {},
  });

  const [levelColor, setLevelColor] = useState<any>("yellow");
  const [riskScore, setRiskScore] = useState<any>(0);
  const [selectedCell, setSelectedCell] = useState<any>(null);

  const [isHiraRejected, setIsHiraRejected] = useState<boolean>(false);

  const [tourOpenForWorkflow, setTourOpenForWorkflow] =
    useState<boolean>(false);
  const [isStartButtonClickedOnTour, setIsStartButtonClickedOnTour] =
    useState<boolean>(false);

  const [currentStepForWorkflow, setCurrentStepForWorkflow] = useState<any>(0);

  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  // const ref1 = useRef<any>(null);
  const refStartReviewButton = useRef<any>(null);
  const refWorkflowForm = useRef<any>(null);
  
  const [isHeaderDataLoading, setIsHeaderDataLoading] = useState<boolean>(false);
  const [hiraHeaderFormData, setHiraHeaderFormData] = useState<any>(null);
  const [sectionOptions, setSectionOptions] = useState<any>([]);
  const [areaOptions, setAreaOptions] = useState<any>([]);
  const [locationWiseUsers, setLocationWiseUsers] = useState<any>([]);

  const [appliedFilters, setAppliedFilters] = useState<any>({});
  const [rows, setRows] = useState<any[]>([]);




  useEffect(() => {
    if (params && params?.hiraId && location?.state?.hiraLocationId && location?.state?.hiraEntityId) {
      setIsPageLoading(true);
      // console.log("checkr8 hiraid in useeffect review page", params);
      if(location?.state?.filters) {
        setAppliedFilters(location?.state?.filters);
      }
      const fetchAllData = async () => {
        try {
          // Call all API functions in parallel
          const [existingRiskConfigParam, areaOptionsParam, sectionOptionsParam, locationWithUsersParam, hazardTypeOptions, categoryOptions] = await Promise.all([
            fetchHiraConfig(),
            getAllAreaMaster(location?.state?.hiraLocationId),
            getSectionOptions(location?.state?.hiraEntityId),
            fetchUsersByLocation(),
            getHazardTypeOptions(),
            getCategoryOptions()
          ]);
          // console.log("checkrisk7 existingRiskConfigParam in useeffect review page", existingRiskConfigParam);
          
          getHiraWithSteps(params?.hiraId, 1, 10, existingRiskConfigParam, areaOptionsParam, sectionOptionsParam, locationWithUsersParam);
        } catch (error) {
          console.error("Error fetching data", error);
        } finally {
          setIsPageLoading(false); // To stop the loading spinner after all calls complete
        }
      };
  
      fetchAllData();
    } else {
      //this block gets calld when page is visited just by url ,like from email
      if(params?.hiraId && params?.categoryId){
        setIsPageLoading(true);
        // console.log("checkr8 hiraid in useeffect just hiraId review page", params);
        
        const fetchAllData = async () => {
          try {
            const [existingRiskConfigParam, locationWithUsersParam, hazardTypeOptions, categoryOptions] = await Promise.all([
              fetchHiraConfig(),
              fetchUsersByLocation(),
              getHazardTypeOptions(),
              getCategoryOptions()
            ]);
            // Call all API functions in parallel
              getHiraWithStepsAndLoadSectionArea(params?.hiraId, 1, 10, existingRiskConfigParam, locationWithUsersParam);
          
          } catch (error) {
            console.error("Error fetching data", error);
          } finally {
            setIsPageLoading(false); // To stop the loading spinner after all calls complete
          }
        };
  
        fetchAllData();
      }
      
    }
  }, [params, location]);

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



  const handleConsolidatedCloseWorkflowHistoryDrawer = () => {
    setConsolidatedWorkflowHistoryDrawer({
      ...consolidatedWorkflowHistoryDrawer,
      open: !consolidatedWorkflowHistoryDrawer.open,
      data: null,
    });
  };



  const handleEditMitigation = (record: any, parentRecord: any) => {
    const updatedData = tableData.map((item) => {
      const childMatch = item.children?.some(
        (child: any) => child._id === record.id
      );
      if (item.id === record.id || childMatch) {
        return { ...item, highlight: true };
      } else {
        return { ...item, highlight: false };
      }
    });
    setTableData(updatedData);
    // console.log(
    //   "checkrisk record in handleEditMitigation parent Record",
    //   parentRecord
    // );

    setMitigationModal({
      ...mitigationModal,
      data: {
        ...record,
        parentRecord: parentRecord,
      },
      open: !mitigationModal.open,
      mode: "edit",
    });
  };

  const getComparisonFunction = (operator: string) => {
    switch (operator) {
      case "<=":
        return (score: any, threshold: any) => score <= threshold;
      case "<":
        return (score: any, threshold: any) => score < threshold;
      case ">":
        return (score: any, threshold: any) => score > threshold;
      case ">=":
        return (score: any, threshold: any) => score >= threshold;
      default:
        return () => false;
    }
  };

  const determineColor = (score: number, riskConfig: any[]): string => {
    for (const config of riskConfig) {
      const [operator, threshold] = config.riskLevel.split("-");
      const compare = getComparisonFunction(operator);
      if (compare(score, Number(threshold))) {
        return config.riskIndicator.split("-")[1]; // Extracting color from the "Risk-label"
      }
    }
    return "white"; // Return a default color if none match
  };

  const columns: any = [
    {
      title: "S.No",
      dataIndex: "sNo",
      key: "sNo",
      editable: true,
      align: "center",
      width: "50px", // You can adjust the width as needed
      render: (text: any, record: any, index: number) => (
        <div
          style={{
            verticalAlign: "top", // Align text to the top
            // display: "block", // Make the content behave like a block element
          }}
        >
          {record?.subStepNo !== "" && parseFloat(record?.subStepNo) > 1.1 ? (
            <></>
          ) : (
            text
          )}
        </div>
      ),
    },

    {
      title: "Basic Step of Job",
      dataIndex: "jobBasicStep",
      key: "jobBasicStep",
      width: 250,
      editable: true,
      inputType: "text",
      render: (text: any, record: any) => {
        // console.log("checkrisk record -->", record);

        let displayText = text;
        let isTruncated = false;

        if (text && text.length > 30) {
          displayText = text.substring(0, 30) + "...";
          isTruncated = true;
        }
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {isTruncated ? (
              <>
                {record?.subStepNo !== "" &&
                parseFloat(record?.subStepNo) > 1.1 ? (
                  <></>
                ) : (
                  <>
                    <Tooltip title={text}>
                      <span>{displayText}</span>
                    </Tooltip>
                  </>
                )}
              </>
            ) : (
              <>
                {record?.subStepNo !== "" &&
                parseFloat(record?.subStepNo) > 1.1 ? (
                  <></>
                ) : (
                  <>
                    <span>{displayText}</span>
                  </>
                )}
              </>
            )}
          </div>
        );
      },
    },
    {
      title: (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {" "}
          {/* <Tooltip title="Significant Criteria!" color="blue"> */}
          <AntdPopover
            content={
              <div>
                <p
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    // border: "1px solid #efefef",
                    padding: "4px",
                  }}
                >
                  Significant Criteria - (P * S) is greater than or equal to 8
                </p>
              </div>
            }
            trigger="click"
            // open={true}
            // onOpenChange={(visible) => setTourPopoverVisible(visible)}
          >
            <div style={{ marginRight: "20px" }}>
              <IconButton aria-label="help">
                <SignificantIcon />
              </IconButton>
            </div>
          </AntdPopover>
          {/* </Tooltip> */}
        </div>
      ),
      dataIndex: "significant",
      key: "significant",
      align: "center",
      editable: false, // This is computed field, not directly editable
      render: (_: any, record: any) => {
        if (!record.type) {
          // console.log("checkrisk s/ns record in significant", record);

          return record?.preProbability * record?.preSeverity >= 8 ? (
            <MdCheckCircle style={{ fill: "#ED2939" }} />
          ) : (
            ""
          );
        }
      },
    },
    {
      title: "Risk Type",
      dataIndex: "hazardTypeId",
      key: "hazardTypeId",
      // width: 300,
      editable: true,
      render: (_: any, record: any) => record?.hazardName || "N/A",
    },
    {
      title: "Hazard Description",
      dataIndex: "hazardDescription",
      // width: 400,
      key: "hazardDescription",
      editable: true,
      render: (_: any, record: any) => record?.hazardDescription || "N/A",
    },
    {
      title: "Impact",
      dataIndex: "impactText",
      // width: 400,
      key: "impactText",
      editable: true,
      render: (_: any, record: any) => record?.impactText || "N/A",
    },
    {
      title: "Existing Control Measure",
      dataIndex: "existingControl",
      key: "existingControl",
      editable: true,
      render: (_: any, record: any) => (
        <div style={{ whiteSpace: "pre-wrap" }}>
          {" "}
          {!record.type && record.existingControl}{" "}
        </div>
      ),
    },
    {
      title: "P",
      dataIndex: "preProbability",
      key: "preProbability",
      editable: true,
      align: "center",
      render: (_: any, record: any) => !record.type && record.preProbability,
    },
    {
      title: "S",
      dataIndex: "preSeverity",
      key: "preSeverity",
      align: "center",
      editable: true,
      render: (_: any, record: any) => !record.type && record.preSeverity,
    },
    {
      title: "P*S (Base Risk)",
      dataIndex: "preMitigationScore",
      key: "preMitigationScore",
      align: "center",
      editable: false, // This is computed field, not directly editable
      // render: (_: any, record: any) =>
      //   !record.type && (record?.preSeverity * record?.preProbability || "N/A"),
      render: (_: any, record: any) => {
        const score = record?.preSeverity * record?.preProbability || "N/A";
        return !record.type ? (
          <Tooltip title="Click For Risk Heatmap">
            <Typography.Link
              onClick={() => toggleScoreModal(record, "pre")}
              style={{ textDecoration: "underline" }}
            >
              {score}
            </Typography.Link>
          </Tooltip>
        ) : (
          "N/A"
        );
      },
    },

    {
      title: "Additional Control Measure",
      dataIndex: "additionalControlMeasure",
      key: "additionalControlMeasure",
      editable: true,
      render: (_: any, record: any) => (
        <div style={{ whiteSpace: "pre-wrap" }}>
          {" "}
          {!record.type && record.additionalControlMeasure}{" "}
        </div>
      ),
    },
    {
      title: "Responsible Person",
      dataIndex: "responsiblePerson",
      key: "responsiblePerson",
      editable: true,
      render: (_: any, record: any) => (
        <div style={{ whiteSpace: "pre-wrap", verticalAlign: "top" }}>
          {" "}
          {(!record.type && record?.responsiblePersonName) || ""}
        </div>
      ),
    },
    {
      title: "Implementation Status",
      dataIndex: "implementationStatus",
      key: "implementationStatus",
      editable: true,
      render: (_: any, record: any) => (
        <div style={{ whiteSpace: "pre-wrap" }}>
          {" "}
          {!record.type && record.implementationStatus}{" "}
        </div>
      ),
    },
    {
      title: "P",
      dataIndex: "postProbability",
      key: "postProbability",
      editable: true,
      align: "center",
      render: (_: any, record: any) => !record.type && record.postProbability,
    },
    {
      title: "S",
      dataIndex: "postSeverity",
      key: "postSeverity",
      editable: true,
      align: "center",
      render: (_: any, record: any) => !record.type && record.postSeverity,
    },
    {
      title: "P*S (Residual Risk)",
      dataIndex: "postMitigationScore",
      key: "postMitigationScore",
      editable: false, // This is computed field, not directly editable
      align: "center",
      render: (_: any, record: any) => {
        const score = record?.postSeverity * record?.postProbability || "N/A";
        return !record.type ? (
          <Typography.Link
            onClick={() => toggleScoreModal(record, "post")}
            style={{ textDecoration: "underline" }}
          >
            {score}
          </Typography.Link>
        ) : (
          "N/A"
        );
      },
    },
  ];

  const handleEdit = (record: any) => {
    const updatedData = tableData.map((item) => {
      const childMatch = item.children?.some(
        (child: any) => child._id === record
      );
      if (item.id === record || childMatch) {
        // console.log("in if");

        return { ...item, highlight: true };
      } else {
        return { ...item, highlight: false };
      }
    });
    // console.log("updated datea", updatedData);

    setTableData(updatedData);
    setRiskId(record);
    setFormType("edit");
    setAddModalOpen(true);
  };
  const rowClassName = (record: any) => {
    return record.highlight ? "highlighted-row" : "";
  };

  const constructLabelWithDescription = (arr: any[] = []) =>
    arr.map((item) => ({
      value: item._id,
      label: item.description
        ? `${item.label} - ${item.description}`
        : item.label,
    }));

  const fetchHiraConfig = async () => {
    try {
      const res = await axios.get(
        `/api/riskconfig/getconfigbyid/${params?.categoryId}`
      );
      if (res.status === 200 || res.status === 201) {
        if (!!res.data?.data) {
          const data = res.data?.data;
          // console.log("checkrisk7 data in fetchHiraConfig", data);

          const configData = {
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
          };
          // console.log("checkrisk7 configData in fetchHiraConfig", configData);
          setExistingRiskConfig({...configData});
          // console.log("checkrisk4 fetchHiraConfig gets called", existingRiskConfig);
          return configData;
        } else {
          setExistingRiskConfig(null);
          return null;
        }
      }
    } catch (error) {
      console.log("errror in fetch config", error);
      throw error;
    }
  };


  const getAllAreaMaster = async (locationId: any) => {
    try {
      const res = await axios.get(
        `api/riskconfig/getAllAreaMaster?locationId=${locationId}&orgId=${userDetails?.organizationId}&master=true`
      );
      // console.log("checkrisk res in getHazardTypeOptions", res);
      if (res.status === 200) {
        if (res?.data && !!res?.data?.data?.length) {
          const hazardTypeOptions = res?.data?.data?.map((hazard: any) => ({
            label: hazard.name,
            value: hazard._id,
          }));
          setAreaOptions(hazardTypeOptions);
          return hazardTypeOptions;
        } else {
          enqueueSnackbar("No Area Master found for HIRA config", {
            variant: "warning",
          });
          setAreaOptions([]);
          return []

         
        }
      } else {
        setAreaOptions([]);

        enqueueSnackbar("Something went wrong while fetching Area Master", {
          variant: "error",
        });
        enqueueSnackbar("No Area Master found for HIRA config", {
          variant: "warning",
        });
      }
    } catch (error) {
      enqueueSnackbar("Something went wrong while fetching Area Master", {
        variant: "error",
      });
      throw error
      // console.log("checkrisk error in getHiraTypesOptions ", error);
    }
  };

  const getSectionOptions = async (entityId: any) => {
    try {
      const res = await axios.get(
        `api/business/getAllSectionsForEntity/${entityId}`
      );

      // console.log("checkrisk res in getHazardTypeOptions", res);
      if (res.status === 200) {
        if (res?.data && !!res?.data?.length) {
          const sectionOptions = res?.data?.map((item: any) => ({
            label: item.name,
            value: item.id,
          }));
          setSectionOptions(sectionOptions);
          return sectionOptions;
        } else {
          setSectionOptions([]);
          // enqueueSnackbar("No Sections found for selected Dept/Vertical", {
          //   variant: "warning",
          // });
          return []
        }
      } else {
        setSectionOptions([]);
        enqueueSnackbar("Something went wrong while fetching Sections", {
          variant: "error",
        });
        return []
      }
    } catch (error) {
      enqueueSnackbar("Something went wrong while fetching Sections", {
        variant: "error",
      });
      throw error
      // console.log("checkrisk error in getHiraTypesOptions ", error);
    }
  };


  const fetchUsersByLocation = async () => {
    const locationId = userDetails.locationId || "";
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
            // label: user.email,
            email: user.email,
            id: user.id,
            label: user.firstname + " " + user.lastname,
            // label : user.firstname + " " + user.lastname,
            // // name : user.firstname + " " + user.lastname,
            // value : user.id,
          }));
          setLocationWiseUsers(userOptions);
          setOptions((prev:any)=> ({...prev, userOptions: userOptions}))
          return userOptions
          // setIsLoading(false);
        } else {
          setLocationWiseUsers([]);
          return []
          // setIsLoading(false);
        }
      } else {
        setLocationWiseUsers([]);
        return []
        // setIsLoading(false);
      }
    } catch (error) {
      throw error
      // setIsLoading(false);
      // console.log("errror in fetching users based on location", error);
    }
  };


  const getHiraWithSteps = async (hiraId : any, page:any=1, pageSize:any=10, existingRiskConfigParam:any, areaOptionsParam:any, secitonOptionsParam:any, locationWithUsersParam:any) => {
    try {
      setIsHeaderDataLoading(true);
      let query:any = `/api/riskregister/risk/getRiskWithSteps/${hiraId}?`;
      if(page && pageSize){
        query += `&page=${page}&pageSize=${pageSize}`;
      }
      const res = await axios.get(query);
      if(res?.status === 200) {
        if(res?.data?.steps && res?.data?.steps?.length) {
          const hiraDetails = res?.data?.hira;

          // Find users by matching ids
          const matchedUsers = locationWithUsersParam.filter((user:any) => hiraDetails?.assesmentTeam.includes(user.id));

          // Extract first and last names and join them with commas
          const userNames = matchedUsers.map((user:any) => `${user.firstname} ${user.lastname}`).join(", ");
          

          // console.log("checkrisk4 matchedUsers", matchedUsers);
          // console.log("checkrisk4 userNames", userNames);
          
          
          
          const hiraHeaderData = {
            ...hiraDetails,
            jobTitle: hiraDetails?.jobTitle,
            areaName: areaOptionsParam?.find((area:any)=> area?.value === hiraDetails?.area)?.label,
            sectionName: secitonOptionsParam?.find((section:any)=> section?.value === hiraDetails?.section)?.label,
            riskTypeName: existingRiskConfigParam?.riskType?.find((risk:any)=> risk?._id === hiraDetails?.riskType)?.name,
            conditionName: existingRiskConfigParam?.condition?.find((cond:any)=> cond?._id === hiraDetails?.condition)?.name,
            assesmentTeamUsers: userNames,
            additionalAssesmentTeam: hiraDetails?.additionalAssesmentTeam
          }
          // console.log("checkrisk4 hiraHeaderData", hiraHeaderData);
          
          setHiraHeaderFormData({
            ...hiraHeaderData,
          });
         
          setTableData([
            ...res?.data?.steps.map((step: any) => {
              const rd = step.riskDetails || {};
              return {
                // keep everything else
                ...step,
                id: step._id,
      
                // pull these out of the nested object:
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
      
                // leave riskDetails intact in case you need it elsewhere
              };
            }),
          ]);
          setRows(res?.data?.steps);
          setPagination((prev) => ({ ...prev, total: res?.data?.stepsCount }));
          setIsPageLoading(false);
          setIsHeaderDataLoading(false);
        }
      }
    }  catch (error:any) {
      setIsHeaderDataLoading(false);
      setIsPageLoading(false);
      if (error?.response) {
        if(error.response.status === 404){
          enqueueSnackbar("HIRA Not Found!", {
            variant: "error",
          });
          navigate("/risk/riskregister/HIRA");
        }
      } else {
        // Something else happened while making the request
        console.log("Error message:", error.message);
        enqueueSnackbar("Something went wrong while fetching HIRA", {
          variant: "error",
        })
        navigate("/risk/riskregister/HIRA");
      }
      console.log("Error config:", error.config);
    }
  }

  const getHiraWithStepsAndLoadSectionArea = async (hiraId : any, page:any=1, pageSize:any=10, existingRiskConfigParam:any, locationWithUsersParam:any) => {
    try {
      setIsHeaderDataLoading(true);
      let query:any = `/api/riskregister/hira/getHiraWithSteps/${hiraId}?`;
      if(page && pageSize){
        query += `&page=${page}&pageSize=${pageSize}`;
      }
      const res = await axios.get(query);
      if(res?.status === 200) {
        if(res?.data?.steps && res?.data?.steps?.length) {
          const hiraDetails = res?.data?.hira;

          // Find users by matching ids
          const matchedUsers = locationWithUsersParam.filter((user:any) => hiraDetails?.assesmentTeam.includes(user.id));

          // Extract first and last names and join them with commas
          const userNames = matchedUsers.map((user:any) => `${user.firstname} ${user.lastname}`).join(", ");
          

          // console.log("checkrisk4 matchedUsers", matchedUsers);
          // console.log("checkrisk4 userNames", userNames);
          const [areaOptionsParam, sectionOptionsParam] = await Promise.all([
            getAllAreaMaster(hiraDetails?.locationId),
            getSectionOptions(hiraDetails?.entityId)
          ])
          
          
          const hiraHeaderData = {
            ...hiraDetails,
            jobTitle: hiraDetails?.jobTitle,
            areaName: areaOptionsParam?.find((area:any)=> area?.value === hiraDetails?.area)?.label,
            sectionName: sectionOptionsParam?.find((section:any)=> section?.value === hiraDetails?.section)?.label,
            riskTypeName: existingRiskConfigParam?.riskType?.find((risk:any)=> risk?._id === hiraDetails?.riskType)?.name,
            conditionName: existingRiskConfigParam?.condition?.find((cond:any)=> cond?._id === hiraDetails?.condition)?.name,
            assesmentTeamUsers: userNames,
            additionalAssesmentTeam: hiraDetails?.additionalAssesmentTeam
          }
          // console.log("checkrisk4 hiraHeaderData", hiraHeaderData);
          
          setHiraHeaderFormData({
            ...hiraHeaderData,
          });
         
          const stepsData = res?.data?.steps?.map((obj:any)=> ({
            ...obj,
            id : obj?._id,
            key : obj?._id,
            sNo : obj?.sNo,
            subStepNo : obj?.subStepNo,
            isOldEntry: true,
            highlight: false,
            hazardName : obj?.hazardTypeDetails?.name,
            responsiblePersonName : obj?.responsiblePerson ? obj?.responsiblePersonDetails?.firstname + " " + obj?.responsiblePersonDetails?.lastname : ""
          }))
          setTableData([...stepsData]);
          setPagination((prev) => ({ ...prev, total: res?.data?.stepsCount }));
          setIsPageLoading(false);
          setIsHeaderDataLoading(false);
        }
      }
    }  catch (error:any) {
      setIsHeaderDataLoading(false);
      setIsPageLoading(false);
      if (error?.response) {
        if(error.response.status === 404){
          enqueueSnackbar("HIRA Not Found!", {
            variant: "error",
          });
          navigate("/risk/riskregister/HIRA");
        }
      } else {
        // Something else happened while making the request
        console.log("Error message:", error.message);
        enqueueSnackbar("Something went wrong while fetching HIRA", {
          variant: "error",
        })
        navigate("/risk/riskregister/HIRA");
      }
      console.log("Error config:", error.config);
    }
  }


  const handleChangePageNew = (page: number, pageSize: number) => {
    // console.log("checkrisk page", page, pageSize);
    setPagination((prev) => ({ ...prev, current: page, pageSize: pageSize }));
    getHiraWithSteps(
      params?.hiraId,
      page,
      pageSize,
      existingRiskConfig,
      areaOptions,
      sectionOptions,
      locationWiseUsers,
    );
  };

  let filteredColumns = columns;
  const newJobBasicStepColumn: ColumnsType<any> = [
    {
      title: "Basic Step of Job",
      dataIndex: "jobBasicStep",
      key: "jobBasicStep",
      width: 200,
      render: (text, record: any) => {
        if (record.type) {
          // console.log("checkrisk hira columns recored", record);

          const parent = tableData.find((parentRecord) =>
            parentRecord.children?.some(
              (child: any) => child._id === record._id
            )
          );

          // console.log("checkrisk hira columns parent", parent);

          const color = determineColor(
            record.lastScore,
            existingRiskConfig?.riskIndicatorData
          );
          // If the current row has children, return text without the expand icon
          return (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  textDecorationLine: "underline",
                  cursor: "pointer",
                }}
                onClick={() => handleEditMitigation(record, parent)}
              >
                <span style={{ textTransform: "capitalize" }}>
                  {record?.jobTitle}
                </span>
                {!!record?.lastScore && (
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      backgroundColor: color,
                      marginLeft: "5px",
                    }}
                  />
                )}
              </div>
              {hoveredRow === record.id && (
                <div
                  style={{
                    paddingRight: "10px",
                    color: "#636363",
                    cursor: "pointer",
                    textTransform: "capitalize",
                  }}
                  onClick={() => handleEditMitigation(record, parent)}
                >
                  <ExpandIcon /> <span>Open</span>
                </div>
              )}
            </div>
          );
        }
        // Otherwise, return text with the expand icon
        return (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div
              onClick={() => handleEdit(record.id)}
              style={{
                textDecorationLine: "underline",
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {text}
            </div>
            {hoveredRow === record.id && (
              <div
                style={{
                  paddingRight: "10px",
                  color: "#636363",
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
                onClick={() => handleEdit(record.id)}
              >
                <ExpandIcon /> <span>Open</span>
              </div>
            )}
          </div>
        );
      },

      sorter: (a, b) => a.jobTitle.length - b.jobTitle.length,
      sortDirections: ["descend", "ascend"],
    },
  ];
  filteredColumns = columns.filter(
    (column: any) => column.key !== "jobTitle" && column.key !== "jobBasicStep"
  );
  filteredColumns = [...newJobBasicStepColumn, ...filteredColumns];

  const handleClickWorkflow = () => {
    if (
      hiraHeaderFormData?.workflowStatus === "DRAFT" ||
      hiraHeaderFormData?.workflowStatus === "APPROVED" ||
      hiraHeaderFormData?.workflowStatus === "IN_REVIEW" ||
      hiraHeaderFormData?.workflowStatus === "IN_APPROVAL" ||
      hiraHeaderFormData?.workflowStatus === "REJECTED"
    ) {
      const status =
        hiraHeaderFormData?.workflowStatus === "REJECTED"
          ? "STARTREVIEW"
          : hiraHeaderFormData?.workflowStatus === "APPROVED"
          ? "DRAFT"
          : hiraHeaderFormData?.workflowStatus;
      setHiraWorkflowModal({
        ...hiraWorkflowModal,
        open: true,
        status: status,
        data: {
          category : hiraHeaderFormData?.categoryId,
          jobTitle: hiraHeaderFormData?.jobTitle,
          hiraId: hiraHeaderFormData?._id,
          entityName: hiraHeaderFormData?.entityDetails?.entityName,
          entityId: hiraHeaderFormData?.entityId,
          locationId: hiraHeaderFormData?.locationId,
          locationName: hiraHeaderFormData?.locationDetails?.locationName,
          isRevision:
            hiraHeaderFormData?.prefixSuffix &&
            (hiraHeaderFormData?.workflowStatus === "DRAFT" ||
              hiraHeaderFormData?.workflowStatus === "APPROVED")
              ? true
              : false,
        },
      });
    } else {
      enqueueSnackbar(
        "Workflow can be initiated only for DRAFT, IN REVIEW, IN APPROVAL or REJECTED HIRA",
        {
          variant: "warning",
        }
      );
    }
  };

  const handleRejectHira = () => {
    console.log("checkrisk handlereject hira called");
    setHiraWorkflowModal({
      ...hiraWorkflowModal,
      open: true,
      status: "REJECTED",
      data: {
        jobTitle: hiraHeaderFormData?.jobTitle,
        hiraId : hiraHeaderFormData?._id,
        entityName: hiraHeaderFormData?.entityDetails?.entityName,
        entityId: hiraHeaderFormData?.entityId,
        locationId: hiraHeaderFormData?.locationId,
        locationName: hiraHeaderFormData?.locationDetails?.locationName,
      }
    });
  };

  const handleSendForReview = () => {
    // setCurrentStepForWorkflow(currentStepForWorkflow + 1);
    console.log(
      "checkrisk handleSendForReview called hiraInworkflow",
      hiraInWorkflow
    );
    setTourOpenForWorkflow(false);

    //handle logic to send all the risk belonging to selectedJoBTitle and send that for review
    const allHiraIds = tableData?.map((hira: any) => hira?.id);
    const hiraHeaderData = tableData[0];
    console.log("checkrisknew hira header data", hiraHeaderData);

    // console.log("checkrisk all hira ids", allHiraIds);
    setHiraInWorkflowIds(allHiraIds);
    setHiraStatus("open");
    setHiraWorkflowModal({
      ...hiraWorkflowModal,
      open: true,
      status: "open",
      data: {
        hiraIds: allHiraIds,
        jobTitle: selectedJobTitle,
        entityName: hiraHeaderData?.entity,
        entityId: hiraHeaderData?.entityId,
        locationId: hiraHeaderData?.locationId,
        locationName: hiraHeaderData?.locationName,
      },
      isRevision: location?.state?.isRevision,
      // isOnTour: tourOpenForWorkflow ? true : false,
    });
  };

  const handleSendForReviewForRejectedHira = () => {
    console.log(
      "checkrisk handleSendForReviewForRejectedHira called hiraInworkflow",
      hiraInWorkflow
    );

    //handle logic to send all the risk belonging to selectedJoBTitle and send that for review
    const allHiraIds = tableData?.map((hira: any) => hira?.id);
    const hiraHeaderData = tableData[0];
    // console.log("checkrisk all hira ids", allHiraIds);
    setHiraInWorkflowIds(allHiraIds);
    setHiraStatus("STARTREVIEW");
    setHiraWorkflowModal({
      ...hiraWorkflowModal,
      open: true,
      status: "STARTREVIEW",
      data: {
        hiraIds: allHiraIds,
        jobTitle: selectedJobTitle,
        ...hiraInWorkflow,
        entityName: hiraHeaderData?.entity,
        entityId: hiraHeaderData?.entityId,
        locationId: hiraHeaderData?.locationId,
        locationName: hiraHeaderData?.locationName,
      },
      hiraInWorkflow: hiraInWorkflow,
    });
  };

  const handleFinishReview = () => {
    console.log("checkrisk handleFinishReview called");

    //handle logic to send all the risk belonging to selectedJoBTitle and send that for review
    const allHiraIds = tableData?.map((hira: any) => hira?.id);
    const hiraHeaderData = tableData[0];
    // console.log("checkrisk all hira ids", allHiraIds);
    setHiraInWorkflowIds(allHiraIds);
    setHiraStatus("IN_REVIEW");
    setHiraWorkflowModal({
      ...hiraWorkflowModal,
      open: true,
      status: "IN_REVIEW",
      data: {
        hiraIds: allHiraIds,
        jobTitle: selectedJobTitle,
        entityName: hiraHeaderData?.entity,
        entityId: hiraHeaderData?.entityId,
        locationId: hiraHeaderData?.locationId,
        locationName: hiraHeaderData?.locationName,
      },
      hiraInWorkflow: hiraInWorkflow,
    });
  };

  const handleFinishApproval = () => {
    //handle logic to send all the risk belonging to selectedJoBTitle and send that for review
    console.log("checkrisknew tabledata-->", tableData[0]);
    const responsiblePersonIdArray = tableData
      ?.map((item: any) => item?.responsiblePerson)
      ?.filter((item: any) => !!item);
    console.log("checkrisknew idarray>", responsiblePersonIdArray);
    const hiraHeaderData = tableData[0];
    const allHiraIds = tableData?.map((hira: any) => hira?.id);
    // console.log("checkrisk all hira ids", allHiraIds);
    setHiraInWorkflowIds(allHiraIds);
    setHiraStatus("IN_APPROVAL");
    setHiraWorkflowModal({
      ...hiraWorkflowModal,
      open: true,
      status: "IN_APPROVAL",
      data: {
        hiraIds: allHiraIds,
        jobTitle: selectedJobTitle,
        responsiblePersonIdArray: responsiblePersonIdArray,
        entityName: hiraHeaderData?.entity,
        entityId: hiraHeaderData?.entityId,
        locationId: hiraHeaderData?.locationId,
        locationName: hiraHeaderData?.locationName,
      },
      hiraInWorkflow: hiraInWorkflow,
    });
  };



  const checkIfLoggedInUserCanReview = () => {
    const ongoingWorkflowDetails = hiraHeaderFormData?.workflow
      ?.find((w: any) => w.cycleNumber === hiraHeaderFormData?.currentVersion + 1);
  
    // if it's not an array, fall back to empty
    const reviewers = Array.isArray(ongoingWorkflowDetails?.reviewers)
      ? ongoingWorkflowDetails.reviewers
      : [];
  
    // safely check each entry for an id
    return reviewers.some((r: any) => r?.id === userDetails?.id);
  };
  
  const checkIfLoggedInUserCanApprove = () => {
    const ongoingWorkflowDetails = hiraHeaderFormData?.workflow
      ?.find((w: any) => w.cycleNumber === hiraHeaderFormData?.currentVersion + 1);
  
    const approvers = Array.isArray(ongoingWorkflowDetails?.approvers)
      ? ongoingWorkflowDetails.approvers
      : [];
  
    return approvers.some((a: any) => a?.id === userDetails?.id);
  };
  
  
  const showSendBackForEditButton = () => {
    if(hiraHeaderFormData?._id) {
      if(hiraHeaderFormData?.workflowStatus === "IN_REVIEW" && checkIfLoggedInUserCanReview()) return true
      else if(hiraHeaderFormData?.workflowStatus === "IN_APPROVAL" &&checkIfLoggedInUserCanApprove()) return true;
      else return false
    } 
    return false
  }

  const getOptionsForColumn = (
    columnKey: string,
    fallbackOptions: { value: any; label: string }[] = []
  ) => {
    if (!existingRiskConfig) return fallbackOptions;

    switch (columnKey) {
      case "riskType":
        return existingRiskConfig.riskTypeOptions || [];
      case "riskCondition":
        return existingRiskConfig.riskConditionOptions || [];
      case "impactType":
        return existingRiskConfig.impactTypeOptions || [];
      case "currentControl":
        return existingRiskConfig.currentControlOptions || [];
      case "riskSource":
        return options?.riskSourceOptions || [];
      case "responsiblePerson":
        return options?.userOptions || [];
      default:
        return fallbackOptions;
    }
  };


  const renderCellContent = (row: any, col: any) => {
    const { key: fieldKey, inputType, options = [] } = col;


 
      // Display mode
      let display = row[fieldKey];
      if (inputType === "select") {
        const selectOptions = getOptionsForColumn(fieldKey, options);
        const found = selectOptions.find(
          (opt: any) => opt.value === row[fieldKey]
        );
        display = found ? found.label : "";
      }
      return <span>{display != null ? display : ""}</span>;


  };

  const handleEditHira = () => {
    // console.log("checkrisk3  hira header data", hiraHeaderData?.entityId, hiraHeaderData?.jobTitle);
    // const encodedJobTitle = encodeURIComponent(hiraHeaderData?.jobTitle);
    navigate(`/risk/riskregister/HIRA/${hiraHeaderFormData?._id}`, 
    //   {
    //   state: {
    //     entityId: hiraHeaderData?.entityId,
    //     jobTitle: hiraHeaderData?.jobTitle,
    //   },
    // }
  );
    // navigate(`/risk/riskregister/HIRA/${encodedJobTitle}/${hiraHeaderData?.entityId}`);
  }

  const toggleCommentsDrawer = () => {
    setHiraWorkflowCommentsDrawer({
      ...hiraWorkflowCommentsDrawer,
      open: !hiraWorkflowCommentsDrawer.open,
      data: null,
    });
  };

  const toggleWorkflowHistoryDrawer = () => {
    setHiraWorkflowHistoryDrawer({
      ...hiraWorkflowHistoryDrawer,
      open: !hiraWorkflowHistoryDrawer.open,
      data: null,
    });
  };

  const handleWorkflowPeopleClick = (event: any) => {
    setAnchorEl(event.target);
    // setAnchorElDate(event.target);
  };

  const toggleScoreModal = (record: any, isPreOrPost = "") => {
    if (isPreOrPost === "pre") {
      setSelectedCell([record?.preProbability - 1, record?.preSeverity - 1]);
    } else {
      setSelectedCell([record?.postProbability - 1, record?.postSeverity - 1]);
    }
    console.log("checkrisk record in togle score modal--->", record);

    setRiskScoreModal({
      ...riskScoreModal,
      open: !riskScoreModal.open,
      mode: "view",
    });
  };

  const getReviewedByDetails = () => {
    const latestOngoingWorkflow = hiraHeaderFormData?.workflow?.slice(hiraHeaderFormData?.workflow?.length -1)[0]
    // console.log("checkrisknew in getReviewedby details revision pge", latestOngoingWorkflow);
    
    if(latestOngoingWorkflow) {
      return {
        reviewedBy : latestOngoingWorkflow?.reviewedByUser?.firstname + " " + latestOngoingWorkflow?.reviewedByUserDetails?.lastname,
        reviewedOn :moment(latestOngoingWorkflow?.reviewedOn).format("DD/MM/YYYY HH:mm"),
        reviewers : latestOngoingWorkflow?.reviewers?.map((reviewer:any)=> reviewer?.firstname + " " + reviewer?.lastname).join(", ")
      }
    } else return {reviewedBy : "N/A", reviewedOn : "N/A"}
  }

  const getApprovedByDetails = () => {
    // console.log("checkrisk7 in getAPprovedby details revision pge hiraHeaderFormData", hiraHeaderFormData);
    
    const latestOngoingWorkflow = hiraHeaderFormData?.workflow?.slice(hiraHeaderFormData?.workflow?.length -1)[0]
    // console.log("checkrisk7 in getAPprovedby details revision pge", latestOngoingWorkflow);
    
    if(latestOngoingWorkflow) {
      return {
        approvedBy : latestOngoingWorkflow?.approvedByUser?.firstname + " " + latestOngoingWorkflow?.approvedByUserDetails?.lastname,
        approvedOn :moment(latestOngoingWorkflow?.approvedOn).format("DD/MM/YYYY HH:mm"),
        approvers : latestOngoingWorkflow?.approvers?.map((approver:any)=> approver?.firstname + " " + approver?.lastname).join(", ")
      }
    } else return {approvedBy : "N/A", approvedOn : "N/A"}
  }


  // console.log("checkrisknew getreviewedbydetails getapprovedbydetails", getReviewedByDetails(), getApprovedByDetails());
  

  return (
    <>
      {isPageLoading ? (
        <Box
          marginY="auto"
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="40vh"
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Space
            direction="vertical"
            size="small"
            style={{ display: "flex", marginTop: "20px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  params.riskcategory === "HIRA"
                    ? "space-between"
                    : "space-between",
                marginBottom: "20px",
              }}
            >
              <div style={{ display: "flex", gap: "15px" }}>
                {hiraHeaderFormData?._id &&
                  (hiraHeaderFormData?.workflowStatus === "DRAFT" ||
                    hiraHeaderFormData?.workflowStatus === "REJECTED" ||
                    hiraHeaderFormData?.workflowStatus === "APPROVED") && (
                    <Button
                      style={{
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: "#003566",
                        color: "white",
                      }}
                      onClick={handleClickWorkflow}
                    >
                      Send For Review
                    </Button>
                  )}
                {/* {selectedJobTitle !== null &&
                  selectedJobTitle !== "All" &&
                  isHiraRejected && (
                    <Button
                      style={{
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: "#003566",
                        color: "white",
                      }}
                      onClick={handleSendForReviewForRejectedHira}
                    >
                      Send For Review
                    </Button>
                  )} */}
                {hiraHeaderFormData?._id &&
                  hiraHeaderFormData?.workflowStatus === "IN_REVIEW" &&
                  checkIfLoggedInUserCanReview() && (
                    <>
                      <Button
                        style={{
                          display: "flex",
                          alignItems: "center",
                          backgroundColor: "#003566",
                          color: "white",
                        }}
                        onClick={handleClickWorkflow}
                      >
                        Complete Review
                      </Button>
                    </>
                  )}

                {hiraHeaderFormData?._id &&
                  hiraHeaderFormData?.workflowStatus === "IN_APPROVAL" &&
                  checkIfLoggedInUserCanApprove() && (
                    <>
                      <Button
                        style={{
                          display: "flex",
                          alignItems: "center",
                          backgroundColor: "#003566",
                          color: "white",
                        }}
                        onClick={handleClickWorkflow}
                      >
                        Approve
                      </Button>
                    </>
                  )}
                {showSendBackForEditButton() && (
                  <Button
                    style={{
                      display: "flex",
                      alignItems: "center",
                      backgroundColor: "#003566",
                      color: "white",
                    }}
                    onClick={() => {
                      console.log("checkrisk handlereject hira called");
                      handleRejectHira();
                    }}
                  >
                    Send Back For Edit
                  </Button>
                )}

                <Button
                  data-testid="single-form-wrapper-button"
                  onClick={() => handleEditHira()}
                  style={{
                    marginLeft: "15px",
                    justifyContent: "center",
                    backgroundColor: "#003566",
                    alignItems: "center",
                    color: "white",
                    display: "flex",
                  }}
                >
                  <MdEdit
                    style={{
                      width: "20px",
                      height: "20px",
                      marginRight: "3px",
                    }}
                  />
                  Edit {existingRiskConfig?.primaryClassification}
                </Button>

                {params?.hiraId && (
                  <Tooltip title="View Workflow Comments">
                    <MdChat
                      className={classes.commentsIcon}
                      onClick={() => {
                        const latestOngoingWorkflow =
                          hiraHeaderFormData?.workflow?.slice(
                            hiraHeaderFormData?.workflow?.length - 1
                          )[0];
                        setHiraWorkflowCommentsDrawer({
                          open: true,
                          data: latestOngoingWorkflow,
                        });
                      }}
                    />
                  </Tooltip>
                )}
                {params?.hiraId && (
                  <Tooltip title="Workflow History">
                    <MdHistory
                      className={classes.historyIcon}
                      onClick={() =>
                        setHiraWorkflowHistoryDrawer({
                          open: true,
                          data: hiraHeaderFormData,
                          cycleToFind: hiraHeaderFormData?.currentVersion + 1,
                        })
                      }
                    />
                  </Tooltip>
                )}

                {params?.hiraId && (
                  <Tooltip title="Version History">
                    <MdLibraryBooks
                      className={classes.historyIcon}
                      onClick={() => {
                        setConsolidatedWorkflowHistoryDrawer({
                          data: {
                            jobTitle: hiraHeaderFormData?.jobTitle,
                            workflow: hiraHeaderFormData?.workflow,
                            hiraId: hiraHeaderFormData?._id,
                          },
                          open: true,
                        });
                      }}
                    />
                  </Tooltip>
                )}

                {params?.hiraId && (
                  <Tooltip title="Workflow People">
                    <IconButton
                      style={{
                        backgroundColor: "#F5F5F5",
                        borderRadius: "5px",
                        padding: 5,
                        marginLeft: "5px",
                      }}
                      onClick={(event: any) => handleWorkflowPeopleClick(event)}
                    >
                      <MdPeople />
                    </IconButton>
                  </Tooltip>
                )}
                <Popover
                  open={openPopover}
                  anchorEl={anchorEl}
                  onClose={() => setAnchorEl(null)}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                  }}
                  transformOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                  }}
                  // style={{
                  //   top: "112px",
                  //   left: "158px",
                  // }}
                >
                  <div
                    style={{
                      padding: "20px",
                    }}
                  >
                    <b>Reviewers :</b> {getReviewedByDetails()?.reviewers}
                    <br />
                    <b>Approvers :</b> {getApprovedByDetails()?.approvers}
                  </div>
                </Popover>

                <Button
                  data-testid="single-form-wrapper-button"
                  onClick={() => navigate(`/risk/riskregister/HIRA`)}
                  style={{
                    marginLeft: "15px",
                    justifyContent: "center",
                    alignItems: "center",
                    display: "flex",
                  }}
                >
                  <MdChevronLeft fontSize="small" />
                  Back
                </Button>
              </div>
            </div>
            <Row gutter={[16, 16]}>
              {isHeaderDataLoading ? (
                <Col span={24}>
                  <Skeleton active />
                </Col>
              ) : (
                <Col span={24}>
                  <Descriptions
                    bordered
                    size="small"
                    column={{
                      xxl: 3,
                      xl: 3,
                      lg: 2,
                      md: 2,
                      sm: 1,
                      xs: 1,
                    }}
                    className={classes.descriptionItemStyle}
                  >
                    <Descriptions.Item label="Job Title : ">
                      <Typography>
                        {hiraHeaderFormData?.jobTitle || "N/A"}
                      </Typography>
                    </Descriptions.Item>

                    <Descriptions.Item label="Assessment Team: ">
                      <Typography>
                        {hiraHeaderFormData?.assesmentTeamUsers || "N/A"}
                      </Typography>
                    </Descriptions.Item>
                    <Descriptions.Item label="Corp Func/Unit: ">
                      <Typography>
                        {hiraHeaderFormData?.locationDetails?.locationName ||
                          "N/A"}
                      </Typography>
                    </Descriptions.Item>
                    <Descriptions.Item label="Entity: ">
                      <Typography>
                        {hiraHeaderFormData?.entityDetails?.entityName || "N/A"}
                      </Typography>
                    </Descriptions.Item>
                    <Descriptions.Item label="Additional Assessment Team: ">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography>
                          {hiraHeaderFormData?.additionalAssesmentTeam || "N/A"}
                        </Typography>
                      </div>
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              )}
            </Row>

            <Row>
              <Col span={24}>
                <div className={classes.tableContainer} id="table1">
                  {/* Table */}
                  {!!tableData?.length && (
                    <RiskStepsViewTable
                      data={tableData}
                      existingRiskConfig={existingRiskConfig}
                      options={{
                        riskSourceOptions: options.riskSourceOptions,
                        userOptions: options.userOptions,
                      }}
                    />
                  )}
                </div>
                <div className={classes.pagination}>
                  <Pagination
                    size="small"
                    current={pagination?.current}
                    pageSize={pagination?.pageSize}
                    total={pagination?.total}
                    showTotal={showTotal}
                    showSizeChanger
                    showQuickJumper
                    onChange={(page, pageSize) => {
                      handleChangePageNew(page, pageSize);
                    }}
                  />
                </div>
              </Col>
            </Row>
          </Space>
          {!!riskScoreModal.open && (
            <>
              <RiskScoreModal
                preMitigationScoreModal={riskScoreModal}
                toggleScoreModal={toggleScoreModal}
                existingRiskConfig={existingRiskConfig}
                preMitigation={[]}
                // setPreMitigation={setPreMitigation}
                preScore={riskScore}
                setPreScore={setRiskScore}
                levelColor={levelColor}
                setLevelColor={setLevelColor}
                // scoreData={scoreData}
                // setScoreData={setScoreData}
                // score={score}
                // setScore={setScore}
                // isPreOrPost={isPreOrPost}
                // setIsPreOrPost={setIsPreOrPost}
                selectedCell={selectedCell}
                setSelectedCell={setSelectedCell}
              />
            </>
          )}
          {consolidatedWorkflowHistoryDrawer?.open && (
            <HiraHistoryDrawerForAllView
              consolidatedWorkflowHistoryDrawer={
                consolidatedWorkflowHistoryDrawer
              }
              handleConsolidatedCloseWorkflowHistoryDrawer={
                handleConsolidatedCloseWorkflowHistoryDrawer
              }
              riskConfig={existingRiskConfig}
            />
          )}

          <div>
            {!!hiraWorkflowModal.open && (
              <HiraWorkflowModal
                reviewModal={hiraWorkflowModal}
                setReviewModal={setHiraWorkflowModal}
                hiraStatus={hiraStatus}
                selectedJobTitle={selectedJobTitle}
                appliedFilters={appliedFilters}
                // refWorkflowForm={refWorkflowForm}
              />
            )}
          </div>

          <div>
            {!!hiraWorkflowCommentsDrawer.open && (
              <HiraWorkflowCommentsDrawer
                commentDrawer={hiraWorkflowCommentsDrawer}
                setCommentDrawer={setHiraWorkflowCommentsDrawer}
                toggleCommentsDrawer={toggleCommentsDrawer}
                riskConfig={existingRiskConfig}
              />
            )}
          </div>

          <div>
            {!!hiraWorkflowHistoryDrawer.open && (
              <HiraWorkflowHistoryDrawer
                workflowHistoryDrawer={hiraWorkflowHistoryDrawer}
                handleCloseWorkflowHistoryDrawer={toggleWorkflowHistoryDrawer}
                riskConfig={existingRiskConfig}
              />
            )}
          </div>
        </>
      )}
    </>
  );
};

export default HiraRegisterReviewPage;
