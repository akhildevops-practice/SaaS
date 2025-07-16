import {
  Avatar,
  Badge,
  Button,
  Checkbox,
  Descriptions,
  Divider,
  Form,
  Input,
  Modal,
  Pagination,
  PaginationProps,
  Popconfirm,
  Popover,
  Radio,
  Row,
  Select,
  Tag,
  Upload,
  UploadProps,
} from "antd";
import React, { useEffect, useState } from "react";
import useStyles from "./styles";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Collapse,
  IconButton,
  Menu,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Theme,
  Tooltip,
  createStyles,
  debounce,
  makeStyles,
  withStyles,
  Button as MuiButton,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@material-ui/core";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  LabelList,
} from "recharts";
import {
  createRiskActionPlans,
  deleteRiskActionPlans,
  getAllDelayedItemItemsAll,
  getAllNPDListDrop,
  getAllRiskPredictionItems,
  getByIdDelayedItemItemsAll,
  getByIdDiscussionItemItemsAll,
  getByIdGanttData,
  getByIDGanttDataById,
  getByIdRiskItemItemsAll,
  getByIdRiskPredictionItemsHistory,
  getChartDataByNpd,
  updateRiskActionPlans,
  updateRiskPredictionItems,
} from "apis/npdApi";
import MultiUserDisplay from "components/MultiUserDisplay";
import TextArea from "antd/es/input/TextArea";
import { Autocomplete } from "@material-ui/lab";
import { getAllUsersApi } from "apis/npdApi";
import { generateUniqueId } from "utils/uniqueIdGenerator";
import { getUserInfo } from "apis/socketApi";
import {
  MdGpsFixed,
  MdClose,
  MdUpdate,
  MdAttachment,
  MdUpload,
  MdOutlineListAlt,
  MdCheckCircle,
  MdCheckBox,
  MdAddCircle,
  MdInfo,
  MdRemoveCircleOutline,
  MdExpandMore,
  MdSend,
} from "react-icons/md";
import {
  AiOutlineFund,
  AiOutlineSnippets,
  AiOutlineFilter,
  AiFillFilter,
} from "react-icons/ai";
import axios from "apis/axios.global";
import { API_LINK } from "config";
import getAppUrl from "utils/getAppUrl";
import { useSnackbar } from "notistack";
import EditImgIcon from "assets/documentControl/Edit.svg";
import DeleteImgIcon from "assets/documentControl/Delete.svg";
var typeAheadValue: string;
var typeAheadType: string;

const useStylesDate = makeStyles((theme) => ({
  dateInput: {
    border: "1px solid #bbb",
    paddingLeft: "5px",
    paddingRight: "5px",
    borderRadius: "5px",
    "& .MuiInput-underline:before": {
      borderBottom: "none", // Remove the bottom border
    },
    "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
      borderBottom: "none", // Remove the hover border
    },
    "& .MuiInput-underline:after": {
      borderBottom: "none", // Remove the focus border
    },
  },
  autoCompleteStyles: {
    "&.css-jw1jwv-MuiAutocomplete-root .MuiOutlinedInput-root": {
      padding: "2px",
    },
    "&.css-1y8r37a-MuiAutocomplete-root .MuiOutlinedInput-root": {
      padding: "2px",
    },
  },
  root: {
    "& .MuiInput-underline:before": {
      borderBottom: "none", // Remove the bottom border
    },
    "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
      borderBottom: "none", // Remove the hover border
    },
    "& .MuiInput-underline:after": {
      borderBottom: "none", // Remove the focus border
    },
    "&.ant-select-single.ant-select-show-arrow .ant-select-selection-item": {
      color: "black",
    },
    "&.css-19qh8xo-MuiInputBase-input-MuiOutlinedInput-input.Mui-disabled": {
      opacity: "1",
      color: "black",
    },
    "&.css-jw1jwv-MuiAutocomplete-root .MuiOutlinedInput-root": {
      padding: "2px",
    },
  },
  summaryRoot: {
    display: "flex",
    padding: "0px 16px",
    minHeight: 30,

    fontSize: "17px",
    "& .MuiAccordionSummary-content": {
      margin: 0,
    },
    "&.MuiAccordionSummary-content .Mui-expanded": {
      margin: "5px 0px",
      minHeight: "10px",
    },
    "&.MuiButtonBase-root .MuiAccordionSummary-root .Mui-expanded": {
      minHeight: "10px",
    },
    "&.MuiAccordionSummary-root": {
      minHeight: "30px",
    },
  },
  headingRoot: {
    minHeight: 30,
    "&.MuiAccordionSummary-content .Mui-expanded": {
      margin: "10px 0px",
      minHeight: "30px",
    },
    "&.MuiAccordionSummary-root.Mui-expanded": {
      minHeight: "30px",
      margin: "10px 0px",
    },
  },
}));

const RiskIndex = () => {
  const classes = useStyles();
  const ClassesDate = useStylesDate();
  const uniqueId = generateUniqueId(22);
  const realmName = getAppUrl();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [openModel, setOpenModel] = useState(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const [expandedRows, setExpandedRows] = useState<any>({});
  const [getAllUserData, setGetAllUserData] = useState<any>([]);
  const [statusProgressData, setStatusProgressData] = useState<any>([]);
  const [openStatus, setOpenStatus] = useState(false);
  const [userInfo, setUserInfo] = useState<any>();
  const [statusEditStatus, setStatusEditStatus] = useState(false);
  const [statusEditId, setStatusEditId] = useState("");
  const [editActionItemStatus, setEditActionItemStatus] = useState(false);
  const [editActionItemId, setEditActionItemId] = useState<any>("");
  const [riskListModel, setRiskListModel] = useState(false);
  const [riskListData, setRiskListData] = useState<any>([]);
  const [npdList, setNpdList] = useState<any>([]);
  const [selectedNpdId, setSelectedNpdId] = useState<any>("");
  const [chartData, setChartData] = useState<any>([]);
  const [skip, setSkip] = useState<any>(1);
  const [limit, setLimit] = useState<any>(10);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [historySkip, setHistorySkip] = useState<any>(1);
  const [historyLimit, setHistoryLimit] = useState<any>(10);
  const [historyTotalCount, setHistoryTotalCount] = useState<number>(0);
  const [historyItemId, setHistoryItemId] = useState<any>("");
  const [openStatusRisk, setOpenStatusRisk] = useState(false);
  const [riskData, setRiskData] = useState<any>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasMounted, setHasMounted] = useState(false);

  const [typeFilterAnchorEl1, setTypeFilterAnchorEl1] =
    React.useState<null | HTMLElement>(null);
  const [filterColumnType, setFilterColumnType] = useState(false);
  const typeFilterOptions = ["operational", "timeLine"];
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<any[]>([]);
  const [typeFilterModel, setTypeFilterModel] = useState(false);

  const [impactFilterAnchorEl1, setImpactFilterAnchorEl1] =
    React.useState<null | HTMLElement>(null);
  const [filterColumnImpact, setFilterColumnImpact] = useState(false);
  const [impactFilterOptions, setImpactFilterOptions] = useState<any>([]);
  const [selectedImpactFilter, setSelectedImpactFilter] = useState<any[]>([]);
  const [impactFilterModel, setImpactFilterModel] = useState(false);

  const [riskPredictionFilterAnchorEl1, setRiskPredictionFilterAnchorEl1] =
    React.useState<null | HTMLElement>(null);
  const [filterColumnRiskPrediction, setFilterColumnRiskPrediction] =
    useState(false);
  const [riskPredictionFilterOptions, setRiskPredictionFilterOptions] =
    useState<any>([]);
  const [selectedRiskPredictionFilter, setSelectedRiskPredictionFilter] =
    useState<any[]>([]);
  const [riskPredictionFilterModel, setRiskPredictionFilterModel] =
    useState(false);

  const [statusFilterAnchorEl1, setStatusFilterAnchorEl1] =
    React.useState<null | HTMLElement>(null);
  const [filterColumnStatus, setFilterColumnStatus] = useState(false);
  const statusFilterOptions = ["Open", "Close"];
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<any[]>([]);
  const [statusFilterModel, setStatusFilterModel] = useState(false);

  const closeModelStatusRisk = () => {
    setOpenStatusRisk(false);
  };
  const openModelStatusRisk = (data: any) => {
    setOpenStatusRisk(true);
    setRiskData(data?.riskHistory);
  };

  const openRiskModel = (ele: any) => {
    let payload = {
      skip: historySkip,
      limit: historyLimit,
    };
    getByIdRiskPredictionItemsHistory(ele?.itemId, payload).then(
      (response: any) => {
        if (response?.status === 200 || response?.status === 201) {
          setHistoryItemId(ele?.itemId);
          setRiskListData(response?.data?.data);
          setHistoryTotalCount(response?.data?.count);
          setRiskListModel(true);
        }
      }
    );
  };

  const closeRiskModel = () => {
    setRiskListModel(false);
  };

  useEffect(() => {
    paginationHandlerByAction();
  }, [historySkip, historyLimit]);

  const paginationHandlerByAction = () => {
    let payload = {
      skip: historySkip,
      limit: historyLimit,
    };
    getByIdRiskPredictionItemsHistory(historyItemId, payload).then(
      (response: any) => {
        if (response?.status === 200 || response?.status === 201) {
          setRiskListData(response?.data?.data);
          setHistoryTotalCount(response?.data?.count);
        }
      }
    );
  };

  const openModelHandler = () => {
    if (selectedNpdId === "") {
      enqueueSnackbar(`Please Select NPD`, {
        variant: "error",
      });
    } else {
      getChartDataByNpd(selectedNpdId).then((response: any) => {
        const dataFinal = response?.data.map((ele: any) => {
          let data = {
            subject: ele.dept?.join(""),
            A: ele.riskScore,
            B: ele.riskScore,
            fullMark: 5,
          };
          return data;
        });
        setChartData(dataFinal);
      });
      setOpenModel(true);
    }
  };

  const closeModelHandler = () => {
    setOpenModel(false);
  };

  const closeModelStatus = () => {
    setOpenStatus(false);
  };

  useEffect(() => {
    try {
      getUserInfo()
        .then((response: any) => {
          setUserInfo(response.data);
        })
        .catch((e: any) => console.log(e));
    } catch (err) {
      console.log("err", err);
    }
  }, []);

  useEffect(() => {
    getAllDataRisk();
    dropDownValueNpdList();
    getNpdConfigDtls();
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted && selectedTypeFilter.length === 0 && !typeFilterModel) {
      getAllDataRisk();
    }
  }, [selectedTypeFilter]);

  useEffect(() => {
    if (hasMounted && selectedImpactFilter.length === 0 && !impactFilterModel) {
      getAllDataRisk();
    }
  }, [selectedImpactFilter]);

  useEffect(() => {
    if (
      hasMounted &&
      selectedRiskPredictionFilter.length === 0 &&
      !riskPredictionFilterModel
    ) {
      getAllDataRisk();
    }
  }, [selectedRiskPredictionFilter]);

  useEffect(() => {
    if (hasMounted && selectedStatusFilter.length === 0 && !statusFilterModel) {
      getAllDataRisk();
    }
  }, [selectedStatusFilter]);

  useEffect(() => {
    getAllDataRisk();
  }, [skip, limit, searchTerm]);

  const dropDownValueNpdList = () => {
    getAllNPDListDrop()?.then((response: any) => {
      setNpdList(response?.data);
    });
  };

  const handlePaginationAction = (page: any, pageSize: any) => {
    setSkip(page);
    setLimit(pageSize);
    // getActionPoints();
  };

  const showTotalAction: PaginationProps["showTotal"] = (total) =>
    `Total ${total} items`;

  const handlePaginationHistory = (page: any, pageSize: any) => {
    setHistorySkip(page);
    setHistoryLimit(pageSize);
    // getActionPoints();
  };

  const showTotalHistory: PaginationProps["showTotal"] = (total) =>
    `Total ${total} items`;

  const getAllDataRisk = () => {
    try {
      let payload = {
        skip: skip,
        limit: limit,
        searchTerm: searchTerm,
        typeFilter: selectedTypeFilter,
        impactFilter: selectedImpactFilter,
        riskPredictionFilter: selectedRiskPredictionFilter,
        statusFilter: selectedStatusFilter,
      };
      getAllRiskPredictionItems(payload).then(async (response) => {
        const initialData = response?.data?.data || [];
        setTotalCount(response?.data?.count);
        const fullData = await Promise.all(
          initialData.map(async (item: any) => {
            let responseData: any;
            if (item.itemType === "discussionItem") {
              responseData = await getByIdDiscussionItemItemsAll(item?.itemId);
            } else {
              responseData = await getAllDelayedItemItemsAll(item?.itemId);
            }

            return {
              ...item,
              actionPlans: responseData?.data || [],
            };
          })
        );
        setTableData(fullData);
      });
    } catch (err) {
      console.log("err", err);
    }
  };

  const getOptionLabel = (option: any) => {
    // Log the option for debugging
    // Check if option exists and has an email property
    if (option && option.email) {
      // Return the email property as the label
      return option.email;
    } else {
      // Return an empty string as fallback
      return "";
    }
  };

  const handleTextChange = (e: any) => {
    getSuggestionList(e.target.value, "normal");
  };

  const getSuggestionList = (value: any, type: string) => {
    typeAheadValue = value;
    typeAheadType = type;
    debouncedSearch();
  };

  const debouncedSearch = debounce(() => {
    getAllUsersInformation(typeAheadValue, typeAheadType);
  }, 400);

  const getAllUsersInformation = (value: string, type: string) => {
    try {
      getAllUsersApi().then((response: any) => {
        setGetAllUserData(response?.data);
      });
    } catch (e) {
      console.log("error", e);
    }
  };

  const openModelStatus = (data: any, ele: any) => {
    setOpenStatus(true);
    if (data?.statusProgressData?.length !== 0) {
      setStatusProgressData(data?.statusProgressData);
    }
    const update = tableData?.map((item: any) => {
      if (item._id === ele._id) {
        let updateAction = ele?.actionPlans?.map((itd: any) => {
          if (itd.id === data?.id) {
            if (itd?.statusProgressData?.length === 0) {
              let dataItem = {
                id: uniqueId,
                description: "",
                date: "",
                updatedBy: userInfo,
                status: "",
                attachments: [],
                npdId: data?.npdId,
                disItemId: data?.discussionItemId,
                momId: data?.momId,
                actionPlanId: data?._id,
                buttonStatus: false,
                addButtonStatus: false,
              };
              let updatePlans = [dataItem, ...itd?.statusProgressData];
              setStatusProgressData(updatePlans);
              return {
                ...itd,
                statusProgressData: updatePlans,
              };
            }
          }
          return itd;
        });
        return {
          ...item,
          actionPlans: updateAction,
        };
      }
      return item;
    });
    setTableData(update);
  };

  const toggleRow = (rowId: any) => {
    setExpandedRows((prevState: any) => ({
      ...prevState,
      [rowId]: !prevState[rowId],
    }));
  };

  const addValuesActionPlansHandler = (
    data: any,
    item: any,
    name: any,
    value: any
  ) => {
    const update = tableData?.map((ele: any) => {
      if (ele._id === data._id) {
        let dataUpdate = ele.actionPlans.map((itd: any) => {
          if (itd._id === item._id) {
            return {
              ...itd,
              [name]: value,
            };
          }
          return itd;
        });
        return {
          ...ele,
          actionPlans: dataUpdate,
        };
      }
      return ele;
    });
    setTableData(update);
  };

  const valuesAddOnStatusHandler = (data: any, name: any, value: any) => {
    const update = statusProgressData?.map((ele: any) => {
      if (ele.id === data.id) {
        return {
          ...ele,
          [name]: value,
        };
      }
      return ele;
    });
    setStatusProgressData(update);
  };

  const uploadFilepropsPPAP = (data: any, name: any): UploadProps => ({
    action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
    multiple: true,
    beforeUpload: () => false,
    async onChange(info) {
      const { fileList } = info;
      const newFormData = new FormData();
      fileList.forEach((file: any) => {
        newFormData.append("files", file.originFileObj, file.name);
      });
      let result = await axios.post(
        API_LINK + `/api/pcr/addAttachMents?realm=${realmName}`,
        newFormData
      );
      if (result.status === 200 || result.status === 201) {
        const update = statusProgressData?.map((ele: any) => {
          if (ele.id === data.id) {
            return {
              ...ele,
              attachments: result?.data,
            };
          }
          return ele;
        });
        setStatusProgressData(update);
        enqueueSnackbar("Files Uploaded successfully", {
          variant: "success",
        });
        info.fileList = [];
      }
    },
  });

  const submitValuesOnStatusUpdate = (data: any) => {
    const update = statusProgressData?.map((ele: any) => {
      if (ele.id === data.id) {
        return {
          ...ele,
          buttonStatus: true,
          addButtonStatus: true,
        };
      }
      return ele;
    });
    setStatusProgressData(update);
  };

  const editValuesUpdateOnStatus = (data: any) => {
    setStatusEditStatus(false);
    setStatusEditId("");
    const update = statusProgressData?.map((ele: any) => {
      if (ele.id === data.id) {
        return {
          ...ele,
          buttonStatus: true,
        };
      }
      return ele;
    });
    setStatusProgressData(update);
  };

  const editValuesOnStatus = (data: any) => {
    setStatusEditStatus(true);
    setStatusEditId(data.id);
    const update = statusProgressData?.map((ele: any) => {
      if (ele.id === data.id) {
        return {
          ...ele,
          buttonStatus: false,
        };
      }
      return ele;
    });
    setStatusProgressData(update);
  };

  const deleteValuesOnStatus = (data: any) => {
    const update = statusProgressData?.map((ele: any) => ele.id !== data.id);
    setStatusProgressData(update);
  };

  const addMoreStatusItemHandler = (data: any) => {
    let dataItem = {
      id: uniqueId,
      description: "",
      date: "",
      updatedBy: userInfo,
      status: false,
      attachments: [],
      npdId: data?.npdId,
      riskItemId: data?.riskItemId,
      momId: data?.momId,
      actionPlanId: data?.actionPlanId,
      buttonStatus: false,
      addButtonStatus: false,
    };
    setStatusProgressData([dataItem, ...statusProgressData]);
  };

  const [itemDetails, setItemDetails] = useState<any>("");
  const [timeLineData, setTimeLineData] = useState<any>();
  const [modelView, setModelView] = useState(false);
  const [buttonValue, setButtonValue] = useState(0);
  let dayDifference;

  const handlerOpenModel = () => {
    setModelView(true);
  };

  const handlerCloseModel = () => {
    setModelView(false);
  };

  const viewItemInfoModel = (data: any) => {
    if (data.riskType === "operational") {
      setItemDetails(data);
      handlerOpenModel();
    } else {
      setItemDetails(data);
      getByIDGanttDataById(data?.delayedItemGanttId).then((response: any) => {
        setTimeLineData(response?.data);
        handlerOpenModel();
        const planStartDate = Date.parse(
          response?.data?.EndDate?.split("T")[0]
        );
        const planEndDate = Date.parse(
          response?.data?.StartDate?.split("T")[0]
        );
        const timeDifference = planStartDate - planEndDate;
        dayDifference = Math?.ceil(timeDifference / (1000 * 3600 * 24));
      });
    }
  };

  const stringToColor = (str: any) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = `#${((hash >> 24) & 0xff).toString(16).padStart(2, "0")}${(
      (hash >> 16) &
      0xff
    )
      .toString(16)
      .padStart(2, "0")}${((hash >> 8) & 0xff).toString(16).padStart(2, "0")}${(
      hash & 0xff
    )
      .toString(16)
      .padStart(2, "0")}`.slice(0, 7);
    return color;
  };

  const handleChange = (event: any) => {
    setSearchTerm(event.target.value);
  };

  const getNpdConfigDtls = async () => {
    const result = await axios.get("/api/configuration");
    setImpactFilterOptions(result.data[0].impactArea.flat());
    setRiskPredictionFilterOptions(
      result.data[0].riskConfig.flat().map((item: any) => item.riskScoring)
    );
  };

  const handleTypeFilter = (event: React.MouseEvent<HTMLElement>) => {
    setTypeFilterAnchorEl1(event.currentTarget);
    setTypeFilterModel(!typeFilterModel);
  };

  const handleImpactFilter = (event: React.MouseEvent<HTMLElement>) => {
    setImpactFilterAnchorEl1(event.currentTarget);
    setImpactFilterModel(!impactFilterModel);
  };

  const handleRiskPredictionFilter = (event: React.MouseEvent<HTMLElement>) => {
    setRiskPredictionFilterAnchorEl1(event.currentTarget);
    setRiskPredictionFilterModel(!riskPredictionFilterModel);
  };

  const handleStatusFilter = (event: React.MouseEvent<HTMLElement>) => {
    setStatusFilterAnchorEl1(event.currentTarget);
    setStatusFilterModel(!statusFilterModel);
  };

  return (
    <div>
      {/* <NavbarIndex /> */}
      <div className={classes.divMainContainer}>
        {/* <div>
          <Button
            className={classes.backButton}
            onClick={() => {
              navigate("/NPDNavbar");
            }}
          >
            Exit
          </Button>
        </div> */}
        <div className={classes.selectorTitleDiv}>
          <div className={classes.subSelectorDiv}>
            <strong>NPD :</strong>
            <Select
              value={selectedNpdId}
              placeholder="Select Risk"
              style={{ width: "200px", color: "black" }}
              // size="large"
              onChange={(e: any) => {
                setSelectedNpdId(e);
              }}
              options={npdList}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "end",
              width: "100%",
              marginRight: "20px",
            }}
          >
            <Input
              placeholder="Search Risk"
              style={{ width: "250px", paddingRight: "20px" }}
              value={searchTerm}
              onChange={handleChange}
              // onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        <div>
          <Button
            style={{ backgroundColor: "#00224E", color: "#fff" }}
            onClick={() => {
              openModelHandler();
            }}
          >
            Generate Chart
          </Button>
        </div>
      </div>
      <div>
        <div style={{ paddingTop: "20px" }}>
          <Paper>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead
                  style={{
                    backgroundColor: "#E8F3F9",
                    color: "#00224E",
                  }}
                >
                  <TableRow>
                    <TableCell
                      style={{
                        color: "#00224E",
                        fontWeight: "bold",
                        padding: "5px",
                        fontSize: "13px",
                      }}
                      align="center"
                    ></TableCell>
                    <TableCell
                      style={{
                        color: "#00224E",
                        fontWeight: "bold",
                        padding: "5px",
                        fontSize: "13px",
                      }}
                      align="center"
                    >
                      S.No.
                    </TableCell>
                    <TableCell
                      style={{
                        color: "#00224E",
                        fontWeight: "bold",
                        padding: "5px",
                        fontSize: "13px",
                      }}
                      align="center"
                    >
                      Type
                      <IconButton
                        style={{ padding: "0px", margin: "0px" }}
                        onClick={(e: any) => {
                          handleTypeFilter(e);
                          setFilterColumnType(!filterColumnType);
                        }}
                      >
                        {selectedTypeFilter?.length === 0 ? (
                          <AiOutlineFilter
                            style={{
                              fontSize: "19px",
                              cursor: "pointer",
                              marginLeft: "10px",
                              paddingTop: "2px",
                            }}
                          />
                        ) : (
                          <AiFillFilter
                            style={{
                              fontSize: "19px",
                              cursor: "pointer",
                              marginLeft: "10px",
                              paddingTop: "2px",
                            }}
                          />
                        )}
                        <Menu
                          anchorEl={typeFilterAnchorEl1}
                          open={filterColumnType}
                          anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "left",
                          }}
                          transformOrigin={{
                            vertical: "top",
                            horizontal: "left",
                          }}
                        >
                          {typeFilterOptions?.map((item: any) => (
                            <Box
                              key={item}
                              style={{
                                padding: "0px 10px",
                                fontSize: "12px",
                                display: "flex",
                                gap: "7px",
                              }}
                            >
                              <Checkbox
                                checked={selectedTypeFilter?.includes(item)}
                                onClick={(event) => event.stopPropagation()}
                                onChange={() => {
                                  const value = item;
                                  if (selectedTypeFilter?.includes(value)) {
                                    setSelectedTypeFilter(
                                      selectedTypeFilter.filter(
                                        (key: any) => key !== value
                                      )
                                    );
                                  } else {
                                    setSelectedTypeFilter([
                                      ...selectedTypeFilter,
                                      value,
                                    ]);
                                  }
                                }}
                              />
                              {item}
                            </Box>
                          ))}
                          <Box
                            style={{
                              display: "flex",
                              gap: "5px",
                              marginTop: "5px",
                              paddingLeft: "5px",
                              paddingRight: "5px",
                            }}
                          >
                            <Button
                              style={{
                                color: "#fff",
                                backgroundColor: "#003566",
                              }}
                              onClick={() => {
                                getAllDataRisk();
                              }}
                            >
                              Apply
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedTypeFilter([]);
                              }}
                            >
                              Reset
                            </Button>
                          </Box>
                        </Menu>
                      </IconButton>
                    </TableCell>
                    <TableCell
                      style={{
                        color: "#00224E",
                        fontWeight: "bold",
                        padding: "5px",
                        fontSize: "13px",
                      }}
                      align="center"
                    >
                      NPD
                    </TableCell>
                    <TableCell
                      style={{
                        color: "#00224E",
                        fontWeight: "bold",
                        padding: "5px",
                        fontSize: "13px",
                      }}
                      align="center"
                    >
                      Issue
                    </TableCell>
                    <TableCell
                      style={{
                        color: "#00224E",
                        fontWeight: "bold",
                        padding: "5px",
                        fontSize: "13px",
                      }}
                      align="center"
                    >
                      Impact
                      <IconButton
                        style={{ padding: "0px", margin: "0px" }}
                        onClick={(e: any) => {
                          handleImpactFilter(e);
                          setFilterColumnImpact(!filterColumnImpact);
                        }}
                      >
                        {selectedImpactFilter?.length === 0 ? (
                          <AiOutlineFilter
                            style={{
                              fontSize: "19px",
                              cursor: "pointer",
                              marginLeft: "10px",
                              paddingTop: "2px",
                            }}
                          />
                        ) : (
                          <AiFillFilter
                            style={{
                              fontSize: "19px",
                              cursor: "pointer",
                              marginLeft: "10px",
                              paddingTop: "2px",
                            }}
                          />
                        )}
                        <Menu
                          anchorEl={impactFilterAnchorEl1}
                          open={filterColumnImpact}
                          anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "left",
                          }}
                          transformOrigin={{
                            vertical: "top",
                            horizontal: "left",
                          }}
                        >
                          {impactFilterOptions?.map((item: any) => (
                            <Box
                              key={item}
                              style={{
                                padding: "0px 10px",
                                fontSize: "12px",
                                display: "flex",
                                gap: "7px",
                              }}
                            >
                              <Checkbox
                                checked={selectedImpactFilter?.includes(item)}
                                onClick={(event) => event.stopPropagation()}
                                onChange={() => {
                                  const value = item;
                                  if (selectedImpactFilter?.includes(value)) {
                                    setSelectedImpactFilter(
                                      selectedImpactFilter.filter(
                                        (key: any) => key !== value
                                      )
                                    );
                                  } else {
                                    setSelectedImpactFilter([
                                      ...selectedImpactFilter,
                                      value,
                                    ]);
                                  }
                                }}
                              />
                              {item}
                            </Box>
                          ))}
                          <Box
                            style={{
                              display: "flex",
                              gap: "5px",
                              marginTop: "5px",
                              paddingLeft: "5px",
                              paddingRight: "5px",
                            }}
                          >
                            <Button
                              style={{
                                color: "#fff",
                                backgroundColor: "#003566",
                              }}
                              onClick={() => {
                                getAllDataRisk();
                              }}
                            >
                              Apply
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedImpactFilter([]);
                              }}
                            >
                              Reset
                            </Button>
                          </Box>
                        </Menu>
                      </IconButton>
                    </TableCell>
                    <TableCell
                      align="center"
                      style={{
                        color: "#00224E",
                        fontWeight: "bold",
                        padding: "5px",
                        fontSize: "13px",
                        maxWidth: "100px",
                        minWidth: "100px",
                      }}
                    >
                      Risk Prediction
                      <IconButton
                        style={{ padding: "0px", margin: "0px" }}
                        onClick={(e: any) => {
                          handleRiskPredictionFilter(e);
                          setFilterColumnRiskPrediction(
                            !filterColumnRiskPrediction
                          );
                        }}
                      >
                        {selectedRiskPredictionFilter?.length === 0 ? (
                          <AiOutlineFilter
                            style={{
                              fontSize: "19px",
                              cursor: "pointer",
                              marginLeft: "10px",
                              paddingTop: "2px",
                            }}
                          />
                        ) : (
                          <AiFillFilter
                            style={{
                              fontSize: "19px",
                              cursor: "pointer",
                              marginLeft: "10px",
                              paddingTop: "2px",
                            }}
                          />
                        )}
                        <Menu
                          anchorEl={riskPredictionFilterAnchorEl1}
                          open={filterColumnRiskPrediction}
                          anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "left",
                          }}
                          transformOrigin={{
                            vertical: "top",
                            horizontal: "left",
                          }}
                        >
                          {riskPredictionFilterOptions?.map((item: any) => (
                            <Box
                              key={item}
                              style={{
                                padding: "0px 10px",
                                fontSize: "12px",
                                display: "flex",
                                gap: "7px",
                              }}
                            >
                              <Checkbox
                                checked={selectedRiskPredictionFilter?.includes(
                                  item
                                )}
                                onClick={(event) => event.stopPropagation()}
                                onChange={() => {
                                  const value = item;
                                  if (
                                    selectedRiskPredictionFilter?.includes(
                                      value
                                    )
                                  ) {
                                    setSelectedRiskPredictionFilter(
                                      selectedRiskPredictionFilter.filter(
                                        (key: any) => key !== value
                                      )
                                    );
                                  } else {
                                    setSelectedRiskPredictionFilter([
                                      ...selectedRiskPredictionFilter,
                                      value,
                                    ]);
                                  }
                                }}
                              />
                              {item}
                            </Box>
                          ))}
                          <Box
                            style={{
                              display: "flex",
                              gap: "5px",
                              marginTop: "5px",
                              paddingLeft: "5px",
                              paddingRight: "5px",
                            }}
                          >
                            <Button
                              style={{
                                color: "#fff",
                                backgroundColor: "#003566",
                              }}
                              onClick={() => {
                                getAllDataRisk();
                              }}
                            >
                              Apply
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedRiskPredictionFilter([]);
                              }}
                            >
                              Reset
                            </Button>
                          </Box>
                        </Menu>
                      </IconButton>
                    </TableCell>
                    <TableCell
                      style={{
                        color: "#00224E",
                        fontWeight: "bold",
                        padding: "5px",
                        fontSize: "13px",
                      }}
                      align="center"
                    >
                      PIC
                    </TableCell>
                    <TableCell
                      style={{
                        color: "#00224E",
                        fontWeight: "bold",
                        padding: "5px",
                        fontSize: "13px",
                      }}
                      align="center"
                    >
                      Target Date
                    </TableCell>
                    <TableCell
                      style={{
                        color: "#00224E",
                        fontWeight: "bold",
                        padding: "5px",
                        fontSize: "13px",
                      }}
                      align="center"
                    >
                      Status
                      <IconButton
                        style={{ padding: "0px", margin: "0px" }}
                        onClick={(e: any) => {
                          handleStatusFilter(e);
                          setFilterColumnStatus(!filterColumnStatus);
                        }}
                      >
                        {selectedStatusFilter?.length === 0 ? (
                          <AiOutlineFilter
                            style={{
                              fontSize: "19px",
                              cursor: "pointer",
                              marginLeft: "10px",
                              paddingTop: "2px",
                            }}
                          />
                        ) : (
                          <AiFillFilter
                            style={{
                              fontSize: "19px",
                              cursor: "pointer",
                              marginLeft: "10px",
                              paddingTop: "2px",
                            }}
                          />
                        )}
                        <Menu
                          anchorEl={statusFilterAnchorEl1}
                          open={filterColumnStatus}
                          anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "left",
                          }}
                          transformOrigin={{
                            vertical: "top",
                            horizontal: "left",
                          }}
                        >
                          {statusFilterOptions?.map((item: any) => (
                            <Box
                              key={item}
                              style={{
                                padding: "0px 10px",
                                fontSize: "12px",
                                display: "flex",
                                gap: "7px",
                              }}
                            >
                              <Checkbox
                                checked={selectedStatusFilter?.includes(item)}
                                onClick={(event) => event.stopPropagation()}
                                onChange={() => {
                                  const value = item;
                                  if (selectedStatusFilter?.includes(value)) {
                                    setSelectedStatusFilter(
                                      selectedStatusFilter.filter(
                                        (key: any) => key !== value
                                      )
                                    );
                                  } else {
                                    setSelectedStatusFilter([
                                      ...selectedStatusFilter,
                                      value,
                                    ]);
                                  }
                                }}
                              />
                              {item}
                            </Box>
                          ))}
                          <Box
                            style={{
                              display: "flex",
                              gap: "5px",
                              marginTop: "5px",
                              paddingLeft: "5px",
                              paddingRight: "5px",
                            }}
                          >
                            <Button
                              style={{
                                color: "#fff",
                                backgroundColor: "#003566",
                              }}
                              onClick={() => {
                                getAllDataRisk();
                              }}
                            >
                              Apply
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedStatusFilter([]);
                              }}
                            >
                              Reset
                            </Button>
                          </Box>
                        </Menu>
                      </IconButton>
                    </TableCell>
                    <TableCell
                      style={{
                        color: "#00224E",
                        fontWeight: "bold",
                        padding: "5px",
                        fontSize: "13px",
                      }}
                      align="center"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tableData?.map((item: any, index: any) => {
                    const isRowExpanded = expandedRows[item._id];
                    return (
                      <>
                        <TableRow>
                          <TableCell
                            align="center"
                            style={{
                              padding: "5px",
                              fontSize: "12px",
                              borderRight: "1px solid rgba(104, 104, 104, 0.1)",
                              borderBottom:
                                "1px solid rgba(104, 104, 104, 0.1)",
                              height: "32px",
                              width: "30px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                gap: "5px",
                                alignItems: "center",
                              }}
                              key={item._id}
                            >
                              {item?.actionPlans?.length === 0 ? (
                                <div style={{ width: "24px" }}>{""}</div>
                              ) : (
                                <IconButton
                                  aria-label="expand row"
                                  size="small"
                                  onClick={() => toggleRow(item._id)}
                                >
                                  {isRowExpanded ? (
                                    <MdRemoveCircleOutline
                                      style={{
                                        fontSize: "18px",
                                        color: "#0E497A",
                                        backgroundColor: "#F8F9F9",
                                        borderRadius: "50%",
                                      }}
                                    />
                                  ) : (
                                    // <Badge
                                    //   count={item?.subtask?.length}
                                    //   size="small"
                                    // >
                                    <MdAddCircle
                                      style={{
                                        fontSize: "18px",
                                        color: "#0E497A",
                                        backgroundColor: "#F8F9F9",
                                        borderRadius: "50%",
                                      }}
                                    />
                                    // </Badge>
                                  )}
                                </IconButton>
                              )}

                              {/* {item?.dptData?.entityName} */}
                            </div>
                          </TableCell>
                          <TableCell
                            style={{
                              padding: "5px",
                              borderRight: "1px solid rgba(104, 104, 104, 0.1)",
                              borderBottom:
                                "1px solid rgba(104, 104, 104, 0.1)",
                              fontSize: "12px",
                            }}
                            align="center"
                          >
                            {index + 1}
                          </TableCell>
                          <TableCell
                            style={{
                              padding: "5px",
                              borderRight: "1px solid rgba(104, 104, 104, 0.1)",
                              borderBottom:
                                "1px solid rgba(104, 104, 104, 0.1)",
                              fontSize: "12px",
                            }}
                            align="center"
                          >
                            {item?.riskType}
                          </TableCell>
                          <TableCell
                            style={{
                              padding: "5px",
                              borderRight: "1px solid rgba(104, 104, 104, 0.1)",
                              borderBottom:
                                "1px solid rgba(104, 104, 104, 0.1)",
                              fontSize: "12px",
                            }}
                            align="center"
                          >
                            {item?.npdData}
                          </TableCell>
                          <TableCell
                            style={{
                              padding: "5px",
                              borderRight: "1px solid rgba(104, 104, 104, 0.1)",
                              borderBottom:
                                "1px solid rgba(104, 104, 104, 0.1)",
                              height: "32px",
                              maxWidth: "250px",
                              minWidth: "250px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              textDecoration: "underLine",
                              cursor: "pointer",
                              color: "blue",
                              fontSize: "12px",
                            }}
                            // align="center"
                            onClick={() => {
                              viewItemInfoModel(item);
                            }}
                          >
                            {item?.itemName}
                          </TableCell>
                          <TableCell
                            style={{
                              padding: "5px",
                              borderRight: "1px solid rgba(104, 104, 104, 0.1)",
                              borderBottom:
                                "1px solid rgba(104, 104, 104, 0.1)",
                              fontSize: "12px",
                            }}
                            align="center"
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <MultiUserDisplay
                                data={item?.impact}
                                name={"username"}
                              />
                            </div>
                          </TableCell>
                          <TableCell
                            style={{
                              padding: "5px",
                              borderRight: "1px solid rgba(104, 104, 104, 0.1)",
                              borderBottom:
                                "1px solid rgba(104, 104, 104, 0.1)",
                              fontSize: "12px",
                              textDecoration: "underLine",
                              cursor: "pointer",
                              color: "blue",
                            }}
                            align="center"
                            onClick={() => {
                              openModelStatusRisk(item);
                            }}
                          >
                            {item.riskPrediction}
                          </TableCell>
                          <TableCell
                            style={{
                              padding: "5px",
                              borderRight: "1px solid rgba(104, 104, 104, 0.1)",
                              borderBottom:
                                "1px solid rgba(104, 104, 104, 0.1)",
                              fontSize: "12px",
                            }}
                            align="center"
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <MultiUserDisplay
                                data={item?.pic?.map(
                                  (ele: any) => ele.username
                                )}
                                name={"username"}
                              />
                            </div>
                          </TableCell>
                          <TableCell
                            style={{
                              padding: "5px",
                              borderRight: "1px solid rgba(104, 104, 104, 0.1)",
                              borderBottom:
                                "1px solid rgba(104, 104, 104, 0.1)",
                              fontSize: "12px",
                            }}
                            align="center"
                          >
                            {item.targetDate}
                          </TableCell>
                          <TableCell
                            style={{
                              padding: "5px",
                              borderRight: "1px solid rgba(104, 104, 104, 0.1)",
                              borderBottom:
                                "1px solid rgba(104, 104, 104, 0.1)",
                              // fontSize:"12px"
                            }}
                            align="center"
                          >
                            <Tag
                              style={{ width: "auto" }}
                              color={
                                item?.status === "Open"
                                  ? "red"
                                  : item.status === "Close"
                                  ? "green"
                                  : ""
                              }
                            >
                              {item?.status}
                            </Tag>
                          </TableCell>
                          <TableCell
                            style={{
                              padding: "5px",
                              borderRight: "1px solid rgba(104, 104, 104, 0.1)",
                              borderBottom:
                                "1px solid rgba(104, 104, 104, 0.1)",
                            }}
                            align="center"
                          >
                            <IconButton
                              style={{ padding: "0px", margin: "0px" }}
                              onClick={() => {
                                openRiskModel(item);
                              }}
                            >
                              <MdGpsFixed />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell
                            style={{
                              paddingBottom: 0,
                              paddingTop: 0,
                            }}
                            colSpan={7}
                          >
                            <Collapse
                              in={isRowExpanded}
                              timeout="auto"
                              unmountOnExit
                            >
                              <Box margin={1} marginLeft={5}>
                                <TableContainer
                                  component={Paper}
                                  variant="outlined"
                                  style={{ width: "900px" }}
                                >
                                  <Table>
                                    <TableHead
                                      style={{
                                        backgroundColor: "#E8F3F9",
                                        color: "#00224E",
                                      }}
                                    >
                                      <TableRow>
                                        <TableCell
                                          style={{
                                            color: "#00224E",
                                            fontWeight: "bold",
                                            padding: "5px",
                                            fontSize: "13px",
                                          }}
                                          align="center"
                                        >
                                          Action Plan
                                        </TableCell>
                                        <TableCell
                                          style={{
                                            color: "#00224E",
                                            fontWeight: "bold",
                                            padding: "5px",
                                            fontSize: "13px",
                                          }}
                                          align="center"
                                        >
                                          PIC
                                        </TableCell>
                                        <TableCell
                                          style={{
                                            color: "#00224E",
                                            fontWeight: "bold",
                                            padding: "5px",
                                            fontSize: "13px",
                                            width: "90px",
                                          }}
                                          align="center"
                                        >
                                          Target Date
                                        </TableCell>

                                        <TableCell
                                          style={{
                                            color: "#00224E",
                                            fontWeight: "bold",
                                            padding: "5px",
                                            fontSize: "13px",
                                          }}
                                          align="center"
                                        >
                                          Status
                                        </TableCell>
                                        <TableCell
                                          style={{
                                            color: "#00224E",
                                            fontWeight: "bold",
                                            padding: "5px",
                                            fontSize: "13px",
                                          }}
                                          align="center"
                                        >
                                          Actions
                                        </TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {item?.actionPlans?.map(
                                        (itd: any, index: any) => {
                                          return (
                                            <TableRow>
                                              <TableCell
                                                style={{
                                                  padding: "5px",
                                                  borderRight:
                                                    "1px solid rgba(104, 104, 104, 0.1)",
                                                  borderBottom:
                                                    "1px solid rgba(104, 104, 104, 0.1)",
                                                }}
                                              >
                                                {/* <TextArea
                                                  rows={1}
                                                  maxLength={500000}
                                                  value={itd.actionPlanName}
                                                  placeholder="Enter Action Plan"
                                                  style={{
                                                    width: "100%",
                                                    color: "black",
                                                  }}
                                                  onChange={(e: any) => {
                                                    addValuesActionPlansHandler(
                                                      item,
                                                      itd,
                                                      "actionPlanName",
                                                      e.target.value
                                                    );
                                                  }}
                                                  disabled={itd.buttonStatus}
                                                /> */}
                                                {itd.actionPlanName}
                                              </TableCell>
                                              <TableCell
                                                style={{
                                                  padding: "5px",
                                                  borderRight:
                                                    "1px solid rgba(104, 104, 104, 0.1)",
                                                  borderBottom:
                                                    "1px solid rgba(104, 104, 104, 0.1)",
                                                }}
                                                align="center"
                                              >
                                                {/* <Autocomplete
                                                  multiple={false}
                                                  size="small"
                                                  id="tags-outlined"
                                                  options={getAllUserData}
                                                  className={
                                                    ClassesDate.autoCompleteStyles
                                                  }
                                                  style={{
                                                    width: "150px",
                                                  }}
                                                  getOptionLabel={
                                                    getOptionLabel
                                                  }
                                                  value={itd.pic}
                                                  filterSelectedOptions
                                                  disabled={itd.buttonStatus}
                                                  onChange={(e, value: any) => {
                                                    addValuesActionPlansHandler(
                                                      item,
                                                      itd,
                                                      "pic",
                                                      value
                                                    );
                                                  }}
                                                  renderInput={(params) => (
                                                    <TextField
                                                      {...params}
                                                      variant="outlined"
                                                      placeholder="Select Approver"
                                                      size="small"
                                                      onChange={
                                                        handleTextChange
                                                      }
                                                      InputLabelProps={{
                                                        shrink: false,
                                                      }}
                                                    />
                                                  )}
                                                /> */}
                                                {itd.pic?.username}
                                              </TableCell>
                                              <TableCell
                                                style={{
                                                  padding: "5px",
                                                  borderRight:
                                                    "1px solid rgba(104, 104, 104, 0.1)",
                                                  borderBottom:
                                                    "1px solid rgba(104, 104, 104, 0.1)",
                                                }}
                                                align="center"
                                              >
                                                {/* <TextField
                                                  style={{
                                                    width: "100px",
                                                    height: "33px",
                                                  }}
                                                  className={
                                                    ClassesDate.dateInput
                                                  }
                                                  id="plan"
                                                  type="date"
                                                  value={itd?.targetDate}
                                                  onChange={(e: any) => {
                                                    addValuesActionPlansHandler(
                                                      item,
                                                      itd,
                                                      "targetDate",
                                                      e.target.value
                                                    );
                                                  }}
                                                  InputLabelProps={{
                                                    shrink: true,
                                                  }}
                                                  //   inputProps={{
                                                  //     max: `${
                                                  //       planApprovalData?.filter(
                                                  //         (data: any) =>
                                                  //           data?.id === item?.projectId
                                                  //       )[0]?.plan
                                                  //     }`,
                                                  //   }}
                                                  disabled={itd.buttonStatus}
                                                /> */}
                                                {itd?.targetDate}
                                              </TableCell>
                                              <TableCell
                                                style={{
                                                  padding: "5px",
                                                  borderRight:
                                                    "1px solid rgba(104, 104, 104, 0.1)",
                                                  borderBottom:
                                                    "1px solid rgba(104, 104, 104, 0.1)",
                                                }}
                                                align="center"
                                              >
                                                {/* <Select
                                                  placeholder="Select Status"
                                                  style={{
                                                    width: "100%",
                                                    color: "black",
                                                    border:
                                                    itd.status === ""
                                                        ? ""
                                                        : itd.status === "Open"
                                                        ? "2px solid red"
                                                        : "2px solid green",
                                                    borderRadius: "6px",
                                                  }}
                                                  // size="large"
                                                  value={itd.status}
                                                  onChange={(e) => {
                                                    addValuesActionPlansHandler(
                                                      item,
                                                      itd,
                                                      "status",
                                                      e
                                                    );
                                                  }}
                                                  options={[
                                                    {
                                                      value: "Open",
                                                      label: "Open",
                                                    },
                                                    {
                                                      value: "Close",
                                                      label: "Close",
                                                    },
                                                  ]}
                                                  disabled={itd.buttonStatus}
                                                /> */}
                                                <Tag
                                                  style={{ width: "auto" }}
                                                  color={
                                                    item?.status === "Open"
                                                      ? "red"
                                                      : item?.status === "Close"
                                                      ? "green"
                                                      : ""
                                                  }
                                                >
                                                  {item?.status}
                                                </Tag>
                                              </TableCell>
                                              <TableCell
                                                style={{
                                                  padding: "10px 0px 0px 0px",
                                                  display: "flex",
                                                  gap: "7px",
                                                  alignItems: "center",
                                                  borderRight:
                                                    "1px solid rgba(104, 104, 104, 0.1)",
                                                  borderBottom:
                                                    "1px solid rgba(104, 104, 104, 0.1)",
                                                }}
                                                align="center"
                                              >
                                                <Tooltip title="Status Updation">
                                                  <IconButton
                                                    style={{
                                                      margin: "0px",
                                                      padding: "0px",
                                                    }}
                                                    onClick={() => {
                                                      openModelStatus(
                                                        item,
                                                        itd
                                                      );
                                                    }}
                                                  >
                                                    <MdUpdate />
                                                  </IconButton>
                                                </Tooltip>
                                                {/* {itd.addButtonStatus ===
                                                false ? (
                                                  <>
                                                    {itd?.statusProgressData
                                                      ?.length === 0 ? (
                                                      <>
                                                        <Tooltip title="Status Updation">
                                                          <IconButton
                                                            style={{
                                                              margin: "0px",
                                                              padding: "0px",
                                                            }}
                                                            onClick={() => {
                                                              openModelStatus(
                                                                item,
                                                                itd
                                                              );
                                                            }}
                                                          >
                                                            <MdUpdate />
                                                          </IconButton>
                                                        </Tooltip>
                                                      </>
                                                    ) : (
                                                      <IconButton
                                                        style={{
                                                          padding: "0px",
                                                          margin: "0px",
                                                        }}
                                                        onClick={() => {
                                                          submitActionPlanHandler(
                                                            item,
                                                            itd
                                                          );
                                                        }}
                                                      >
                                                        <MdCheckCircle />
                                                      </IconButton>
                                                    )}
                                                  </>
                                                ) : (
                                                  <Row
                                                    style={{
                                                      display: "flex",
                                                      gap: "3px",
                                                    }}
                                                  >
                                                    {editActionItemStatus ===
                                                      true &&
                                                      itd._id ===
                                                      editActionItemId ? (
                                                      <IconButton
                                                        style={{
                                                          padding: "0px",
                                                          margin: "0px",
                                                        }}
                                                        onClick={() => {
                                                          editUpdateValuesActionPlanHandler(
                                                            item,
                                                            itd
                                                          );
                                                        }}
                                                      >
                                                        <MdCheckBox />
                                                      </IconButton>
                                                    ) : (
                                                      <IconButton
                                                        style={{
                                                          padding: "0px",
                                                          margin: "0px",
                                                        }}
                                                        onClick={() => {
                                                          editValuesActionPlanHandler(
                                                            item,
                                                            itd
                                                          );
                                                        }}
                                                      >
                                                        <img
                                                          src={EditIcon}
                                                          style={{
                                                            width: "17px",
                                                            height: "17px",
                                                          }}
                                                        />
                                                      </IconButton>
                                                    )}
                                                  
                                                    <Popconfirm
                                                      placement="top"
                                                      title={
                                                        "Are you sure to delete Data"
                                                      }
                                                      onConfirm={() => {
                                                        deleteActionPlanHandler(
                                                          item,
                                                          itd
                                                        );
                                                      }}
                                                      okText="Yes"
                                                      cancelText="No"
                                                    >
                                                      <IconButton
                                                        style={{
                                                          padding: "0px",
                                                          margin: "0px",
                                                        }}
                                                        // onClick={() => {

                                                        // }}
                                                      >
                                                        <img
                                                          src={DeleteIcon}
                                                          style={{
                                                            width: "17px",
                                                            height: "17px",
                                                          }}
                                                        />
                                                      </IconButton>
                                                    </Popconfirm>

                                                    {index === 0 ? (
                                                      <IconButton
                                                        style={{
                                                          padding: "0px",
                                                          margin: "0px",
                                                        }}
                                                        onClick={() => {
                                                          addActionItemDiscussionHandler(
                                                            item
                                                          );
                                                        }}
                                                      >
                                                        <MdAddCircle />
                                                      </IconButton>
                                                    ) : (
                                                      ""
                                                    )}
                                                  </Row>
                                                )} */}
                                              </TableCell>
                                            </TableRow>
                                          );
                                        }
                                      )}
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </div>
        <div className={classes.pagination}>
          <Pagination
            size="small"
            current={skip}
            pageSize={limit}
            total={totalCount}
            showTotal={showTotalAction}
            showSizeChanger
            showQuickJumper
            onChange={(page, pageSize) => {
              handlePaginationAction(page, pageSize);
            }}
          />
        </div>
      </div>
      <div>
        <Modal
          title={"Risk Information"}
          open={openModel}
          onCancel={closeModelHandler}
          footer={null}
          width="500px"
          closeIcon={
            <MdClose
              style={{
                color: "#fff",
                backgroundColor: "#0E497A",
                borderRadius: "3px",
              }}
            />
          }
        >
          <div>
            <RadarChart
              cx="50%"
              cy="50%"
              outerRadius={100}
              width={450}
              height={300}
              data={chartData}
              style={{ color: "black" }}
            >
              <PolarGrid stroke="black" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "black" }} />
              {/* <PolarRadiusAxis tick={{ fill: "black" }} domain={[0, 6]} /> */}
              <Radar
                name="Risk Score"
                dataKey="A"
                stroke="#fcaab0"
                fill="#fcaab0"
                fillOpacity={0.8}
              >
                <LabelList
                  dataKey="A"
                  position="inside"
                  style={{ fill: "#03554f", fontSize: "12px" }}
                />
              </Radar>
              <LabelList dataKey="A" position="top" style={{ fill: "black" }} />
              <Legend />
            </RadarChart>
          </div>
        </Modal>
        <Modal
          title={"Activity description"}
          open={openStatus}
          onCancel={closeModelStatus}
          footer={null}
          width="900px"
          closeIcon={
            <MdClose
              style={{
                color: "#fff",
                backgroundColor: "#0E497A",
                borderRadius: "3px",
              }}
            />
          }
        >
          <div>
            <Paper>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead
                    style={{
                      backgroundColor: "#E8F3F9",
                      color: "#00224E",
                    }}
                  >
                    <TableRow>
                      <TableCell
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                        }}
                      >
                        Status Description
                      </TableCell>
                      <TableCell
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                        }}
                      >
                        Date
                      </TableCell>
                      <TableCell
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                          width: "140px",
                        }}
                      >
                        Updated By
                      </TableCell>
                      <TableCell
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                        }}
                      >
                        Attachments
                      </TableCell>
                      <TableCell
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                          width: "160px",
                        }}
                      >
                        Status
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {statusProgressData?.map((ele: any, index: any) => {
                      return (
                        <TableRow>
                          <TableCell style={{ padding: "5px" }}>
                            <TextArea
                              rows={1}
                              placeholder="Description"
                              value={ele.description}
                              maxLength={8000}
                              style={{ width: "100%", color: "black" }}
                              onChange={(e) => {
                                valuesAddOnStatusHandler(
                                  ele,
                                  "description",
                                  e.target.value
                                );
                              }}
                              disabled={ele.buttonStatus}
                            />
                          </TableCell>
                          <TableCell style={{ padding: "5px" }}>
                            <TextField
                              style={{
                                width: "100px",
                                height: "33px",
                              }}
                              className={ClassesDate.dateInput}
                              id="plan"
                              type="date"
                              value={ele?.date}
                              onChange={(e: any) => {
                                valuesAddOnStatusHandler(
                                  ele,
                                  "date",
                                  e.target.value
                                );
                              }}
                              InputLabelProps={{
                                shrink: true,
                              }}
                              disabled={ele.buttonStatus}
                            />
                          </TableCell>
                          <TableCell style={{ padding: "5px" }}>
                            <Input
                              value={ele?.updatedBy?.username}
                              disabled
                              style={{ width: "80%" }}
                            />
                          </TableCell>
                          <TableCell style={{ padding: "5px" }}>
                            <Row
                              style={{
                                display: "flex",
                                gap: "5px",
                                alignItems: "center",
                              }}
                            >
                              <Upload
                                {...uploadFilepropsPPAP(ele, "Design")}
                                className={classes.uploadSection}
                                id={ele.id}
                                disabled={ele.buttonStatus}
                                showUploadList={false}
                              >
                                <Button
                                  icon={<MdUpload />}
                                  disabled={ele.buttonStatus}
                                >
                                  Upload
                                </Button>
                              </Upload>
                              <Popover
                                content={
                                  <div>
                                    {ele?.attachments?.map(
                                      (ele: any, index: any) => {
                                        return (
                                          <div
                                            style={{
                                              display: "flex",
                                              gap: "10px",
                                            }}
                                          >
                                            <MdAttachment
                                              style={{
                                                color: "#003566",
                                                fontSize: "18px",
                                              }}
                                            />
                                            <a
                                              href={ele?.documentLink}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                            >
                                              {ele.fileName}
                                            </a>
                                            <Popconfirm
                                              placement="top"
                                              title={
                                                "Are you sure to delete Data"
                                              }
                                              onConfirm={() => {
                                                // fileDeleteHandler(
                                                //   index,
                                                //   item.id,
                                                //   "Design"
                                                // );
                                              }}
                                              okText="Yes"
                                              cancelText="No"
                                            >
                                              <IconButton
                                                style={{
                                                  margin: "0",
                                                  padding: "0px",
                                                }}
                                              >
                                                <img
                                                  src={DeleteImgIcon}
                                                  style={{
                                                    height: "16px",
                                                    width: "16px",
                                                  }}
                                                />
                                              </IconButton>
                                            </Popconfirm>
                                          </div>
                                        );
                                      }
                                    )}
                                  </div>
                                }
                                title={null}
                              >
                                <Badge
                                  count={ele?.attachments?.length}
                                  size="small"
                                >
                                  <MdOutlineListAlt
                                    style={{
                                      color: "#003566",
                                      cursor: "pointer",
                                    }}
                                  />
                                </Badge>
                              </Popover>
                            </Row>
                          </TableCell>
                          <TableCell style={{ padding: "5px" }}>
                            <Row style={{ display: "flex", gap: "10px" }}>
                              <Select
                                value={ele?.status}
                                placeholder="Select Status"
                                style={{ width: "50%", color: "black" }}
                                // size="large"
                                onChange={(e: any) => {
                                  valuesAddOnStatusHandler(ele, "status", e);
                                }}
                                options={[
                                  { value: "Open", label: "Open" },
                                  { value: "Close", label: "Close" },
                                ]}
                                disabled={ele.buttonStatus}
                              />
                              <Row style={{ display: "flex", gap: "5px" }}>
                                {ele.addButtonStatus === false ? (
                                  <IconButton
                                    style={{
                                      padding: "0px",
                                      margin: "0px",
                                    }}
                                    onClick={() => {
                                      submitValuesOnStatusUpdate(ele);
                                    }}
                                  >
                                    <MdCheckCircle />
                                  </IconButton>
                                ) : (
                                  <Row
                                    style={{
                                      display: "flex",
                                      gap: "3px",
                                    }}
                                  >
                                    {statusEditStatus === true &&
                                    ele.id === statusEditId ? (
                                      <IconButton
                                        style={{
                                          padding: "0px",
                                          margin: "0px",
                                        }}
                                        onClick={() => {
                                          editValuesUpdateOnStatus(ele);
                                        }}
                                      >
                                        <MdCheckBox />
                                      </IconButton>
                                    ) : (
                                      <IconButton
                                        style={{
                                          padding: "0px",
                                          margin: "0px",
                                        }}
                                        onClick={() => {
                                          editValuesOnStatus(ele);
                                        }}
                                      >
                                        <img
                                          src={EditImgIcon}
                                          style={{
                                            width: "17px",
                                            height: "17px",
                                          }}
                                        />
                                      </IconButton>
                                    )}

                                    <IconButton
                                      style={{
                                        padding: "0px",
                                        margin: "0px",
                                      }}
                                      onClick={() => {
                                        deleteValuesOnStatus(ele);
                                      }}
                                    >
                                      <img
                                        src={DeleteImgIcon}
                                        style={{
                                          width: "17px",
                                          height: "17px",
                                        }}
                                      />
                                    </IconButton>
                                    {index === 0 ? (
                                      <IconButton
                                        style={{
                                          padding: "0px",
                                          margin: "0px",
                                        }}
                                        onClick={() => {
                                          addMoreStatusItemHandler(ele);
                                        }}
                                      >
                                        <MdAddCircle />
                                      </IconButton>
                                    ) : (
                                      ""
                                    )}
                                  </Row>
                                )}
                              </Row>
                            </Row>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </div>
        </Modal>
        <Modal
          title={"Risk Activity History"}
          open={riskListModel}
          onCancel={closeRiskModel}
          footer={null}
          width="auto"
          closeIcon={
            <MdClose
              style={{
                color: "#fff",
                backgroundColor: "#0E497A",
                borderRadius: "3px",
              }}
            />
          }
        >
          <div>
            <Paper>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead
                    style={{
                      backgroundColor: "#E8F3F9",
                      color: "#00224E",
                    }}
                  >
                    <TableRow>
                      {/* <TableCell
                      style={{
                        color: "#00224E",
                        fontWeight: "bold",
                        padding: "5px",
                        fontSize: "13px",
                      }}
                      align="center"
                    >
                        </TableCell> */}
                      <TableCell
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                        }}
                        align="center"
                      >
                        S.No.
                      </TableCell>
                      <TableCell
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                        }}
                        align="center"
                      >
                        Type
                      </TableCell>
                      <TableCell
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                        }}
                        align="center"
                      >
                        NPD
                      </TableCell>
                      <TableCell
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                        }}
                        align="center"
                      >
                        Issue
                      </TableCell>
                      <TableCell
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                        }}
                        align="center"
                      >
                        Impact
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                          maxWidth: "100px",
                          minWidth: "100px",
                        }}
                      >
                        Risk Prediction
                      </TableCell>
                      <TableCell
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                        }}
                        align="center"
                      >
                        PIC
                      </TableCell>
                      <TableCell
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                        }}
                        align="center"
                      >
                        Updated Date
                      </TableCell>
                      <TableCell
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                        }}
                        align="center"
                      >
                        Status
                      </TableCell>
                      {/* <TableCell
                      style={{
                        color: "#00224E",
                        fontWeight: "bold",
                        padding: "5px",
                        fontSize: "13px",
                      }}
                      align="center"
                    >
                      Actions
                    </TableCell> */}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {riskListData?.map((item: any, index: any) => {
                      return (
                        <TableRow>
                          {/* <TableCell
                                      align="center"
                                      style={{
                                        padding: "5px",
                                        fontSize: "12px",
                                        borderRight:
                                          "1px solid rgba(104, 104, 104, 0.1)",
                                        borderBottom:
                                          "1px solid rgba(104, 104, 104, 0.1)",
                                        height: "32px",
                                        width:"30px"
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: "flex",
                                          flexDirection: "row",
                                          gap: "5px",
                                          alignItems: "center",
                                        }}
                                        key={item._id}
                                      >
                                        {item?.actionPlans?.length === 0 ? (
                                          <div style={{ width: "24px" }}>
                                            {""}
                                          </div>
                                        ) : (
                                          <IconButton
                                            aria-label="expand row"
                                            size="small"
                                            onClick={() =>
                                              toggleRow(item._id)
                                            }
                                          >
                                            {isRowExpanded ? (
                                              <MdRemoveCircleOutline
                                                style={{
                                                  fontSize: "18px",
                                                  color: "#0E497A",
                                                  backgroundColor:
                                                    "#F8F9F9",
                                                  borderRadius: "50%",
                                                }}
                                              />
                                            ) : (
                                              <Badge
                                                count={item?.subtask?.length}
                                                size="small"
                                              >
                                              <MdAddCircle
                                                style={{
                                                  fontSize: "18px",
                                                  color: "#0E497A",
                                                  backgroundColor:
                                                    "#F8F9F9",
                                                  borderRadius: "50%",
                                                }}
                                              />
                                               </Badge>
                                            )}
                                          </IconButton>
                                        )}
                                      
                                        {item?.dptData?.entityName}
                                      </div>
                    </TableCell> */}
                          <TableCell
                            style={{
                              padding: "5px",
                              borderRight: "1px solid rgba(104, 104, 104, 0.1)",
                              borderBottom:
                                "1px solid rgba(104, 104, 104, 0.1)",
                              fontSize: "12px",
                            }}
                            align="center"
                          >
                            {index + 1}
                          </TableCell>
                          <TableCell
                            style={{
                              padding: "5px",
                              borderRight: "1px solid rgba(104, 104, 104, 0.1)",
                              borderBottom:
                                "1px solid rgba(104, 104, 104, 0.1)",
                              fontSize: "12px",
                            }}
                            align="center"
                          >
                            {item?.riskType}
                          </TableCell>
                          <TableCell
                            style={{
                              padding: "5px",
                              borderRight: "1px solid rgba(104, 104, 104, 0.1)",
                              borderBottom:
                                "1px solid rgba(104, 104, 104, 0.1)",
                              fontSize: "12px",
                            }}
                            align="center"
                          >
                            {item?.npdData}
                          </TableCell>
                          <TableCell
                            style={{
                              padding: "5px",
                              borderRight: "1px solid rgba(104, 104, 104, 0.1)",
                              borderBottom:
                                "1px solid rgba(104, 104, 104, 0.1)",
                              height: "32px",
                              maxWidth: "250px",
                              minWidth: "250px", // Set a limit for the width
                              overflow: "hidden", // Hide the overflowed content
                              textOverflow: "ellipsis", // Show three dots when content overflows
                              whiteSpace: "nowrap",
                              textDecoration: "underLine",
                              cursor: "pointer",
                              color: "blue",
                              fontSize: "12px",
                            }}
                            // align="center"
                          >
                            {item?.itemName}
                          </TableCell>
                          <TableCell
                            style={{
                              padding: "5px",
                              borderRight: "1px solid rgba(104, 104, 104, 0.1)",
                              borderBottom:
                                "1px solid rgba(104, 104, 104, 0.1)",
                              fontSize: "12px",
                            }}
                            align="center"
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <MultiUserDisplay
                                data={item?.impact}
                                name={"username"}
                              />
                            </div>
                          </TableCell>
                          <TableCell
                            style={{
                              padding: "5px",
                              borderRight: "1px solid rgba(104, 104, 104, 0.1)",
                              borderBottom:
                                "1px solid rgba(104, 104, 104, 0.1)",
                              fontSize: "12px",
                            }}
                            align="center"
                          >
                            {item.riskPrediction}
                          </TableCell>
                          <TableCell
                            style={{
                              padding: "5px",
                              borderRight: "1px solid rgba(104, 104, 104, 0.1)",
                              borderBottom:
                                "1px solid rgba(104, 104, 104, 0.1)",
                              fontSize: "12px",
                            }}
                            align="center"
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <MultiUserDisplay
                                data={item?.pic?.map(
                                  (ele: any) => ele.username
                                )}
                                name={"username"}
                              />
                            </div>
                          </TableCell>
                          <TableCell
                            style={{
                              padding: "5px",
                              borderRight: "1px solid rgba(104, 104, 104, 0.1)",
                              borderBottom:
                                "1px solid rgba(104, 104, 104, 0.1)",
                              fontSize: "12px",
                            }}
                            align="center"
                          >
                            {new Date(item?.riskCreatedDate)
                              .toLocaleDateString("en-GB")
                              .replace(/\//g, "-")}
                          </TableCell>
                          <TableCell
                            style={{
                              padding: "5px",
                              borderRight: "1px solid rgba(104, 104, 104, 0.1)",
                              borderBottom:
                                "1px solid rgba(104, 104, 104, 0.1)",
                              // fontSize:"12px"
                            }}
                            align="center"
                          >
                            <Tag
                              style={{ width: "auto" }}
                              color={
                                item?.status === "Open"
                                  ? "red"
                                  : item?.status === "Close"
                                  ? "green"
                                  : ""
                              }
                            >
                              {item?.status}
                            </Tag>
                          </TableCell>
                          {/* <TableCell
                        style={{
                          padding: "5px",
                          borderRight: "1px solid rgba(104, 104, 104, 0.1)",
                          borderBottom:
                            "1px solid rgba(104, 104, 104, 0.1)",
                        }}
                        align="center"
                      >
                        <IconButton
                          style={{ padding: "0px", margin: "0px" }}
                        >
                          <MdGpsFixed />
                        </IconButton>
                      </TableCell> */}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </div>
          <div className={classes.pagination}>
            <Pagination
              size="small"
              current={historyLimit}
              pageSize={historyLimit}
              total={historyTotalCount}
              showTotal={showTotalHistory}
              showSizeChanger
              showQuickJumper
              onChange={(page, pageSize) => {
                handlePaginationHistory(page, pageSize);
              }}
            />
          </div>
        </Modal>
        <Modal
          title={"Item Description"}
          open={modelView}
          onCancel={handlerCloseModel}
          footer={null}
          width="900px"
          closeIcon={
            <MdClose
              style={{
                color: "#fff",
                backgroundColor: "#0E497A",
                borderRadius: "3px",
              }}
            />
          }
        >
          <div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              {/* <strong>Item Description</strong> */}
              <span>{itemDetails?.itemNameDescription}</span>
            </div>
            {itemDetails?.riskType === "operational" ? (
              ""
            ) : (
              <>
                <div
                  style={{
                    paddingTop: "10px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", gap: "20px" }}>
                    <Button
                      icon={<AiOutlineSnippets />}
                      onClick={() => {
                        setButtonValue(0);
                      }}
                      className={
                        buttonValue === 0
                          ? classes.buttonContainerActive
                          : classes.buttonContainer
                      }
                    >
                      Basic Info
                    </Button>
                    <Button
                      icon={<AiOutlineFund />}
                      onClick={() => {
                        setButtonValue(3);
                      }}
                      className={
                        buttonValue === 3
                          ? classes.buttonContainerActive
                          : classes.buttonContainer
                      }
                    >
                      Status/Progress
                    </Button>
                    {timeLineData?.type === "activity" ? (
                      <Button
                        icon={<AiOutlineFund />}
                        onClick={() => {
                          setButtonValue(4);
                        }}
                        className={
                          buttonValue === 4
                            ? classes.buttonContainerActive
                            : classes.buttonContainer
                        }
                      >
                        Evidence
                      </Button>
                    ) : (
                      ""
                    )}
                    <Button
                      icon={<AiOutlineFund />}
                      onClick={() => {
                        setButtonValue(5);
                      }}
                      className={
                        buttonValue === 5
                          ? classes.buttonContainerActive
                          : classes.buttonContainer
                      }
                    >
                      Remarks
                    </Button>
                    {/* {timeLineData?.type === "activity" ||
              timeLineData?.type === "sub activity" ? (
                <Button
                  icon={<DiffOutlined />}
                  onClick={() => {
                    setButtonValue(1);
                  }}
                  className={
                    buttonValue === 1
                      ? classes.buttonContainerActive
                      : classes.buttonContainer
                  }
                >
                  Parent Task
                </Button>
              ) : (
                ""
              )} */}
                    {/* <Button
                icon={<AiOutlineFund />}
                onClick={() => {
                  setButtonValue(6);
                }}
                className={
                  buttonValue === 6
                    ? classes.buttonContainerActive
                    : classes.buttonContainer
                }
              >
                Audit Trail
              </Button> */}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "end",
                    }}
                  >
                    <Tag
                      style={{ width: "auto", padding: "5px" }}
                      color={
                        timeLineData?.Priority === "Normal"
                          ? "#FAE42C"
                          : timeLineData?.Priority === "High"
                          ? "#F61745"
                          : "#00FF7F"
                      }
                    >
                      {timeLineData?.Priority}
                    </Tag>
                  </div>
                </div>
                <Divider style={{ margin: "0px 0px", color: "#00224E" }} />
                <div>
                  {buttonValue === 0 ? (
                    <div style={{ paddingTop: "10px" }}>
                      <div
                        style={{
                          padding: "10px 10px",
                          backgroundColor: "#F7F7FF",
                          borderRadius: "8px",
                        }}
                      >
                        <div
                          style={{
                            backgroundColor: "#fff",
                            borderRadius: "0px",
                          }}
                          className={classes.descriptionLabelStyle}
                        >
                          <Form layout="vertical">
                            <Descriptions
                              bordered
                              size="small"
                              style={{ width: "832px" }}
                              column={{
                                xxl: 2, // or any other number of columns you want for xxl screens
                                xl: 2, // or any other number of columns you want for xl screens
                                lg: 2, // or any other number of columns you want for lg screens
                                md: 1, // or any other number of columns you want for md screens
                                sm: 2, // or any other number of columns you want for sm screens
                                xs: 2, // or any other number of columns you want for xs screens
                              }}
                            >
                              <Descriptions.Item span={12} label="Type :">
                                <Form.Item
                                  // name="type"
                                  rules={[
                                    {
                                      required: true,
                                      message: "Type",
                                    },
                                  ]}
                                  style={{ marginBottom: 0 }}
                                >
                                  <div style={{ display: "flex" }}>
                                    <Radio.Group
                                      onChange={(e: any) => {
                                        //   addDataHandler("type", e.target.value);
                                      }}
                                      value={timeLineData?.type}
                                      disabled
                                      style={{ display: "flex" }}
                                    >
                                      {/* <Radio value={"npd"}>NPD</Radio>*/}
                                      {/* {titleModel === "Edit" ? (
                                  <Radio value={"department"}>Department</Radio>
                                ) : (
                                  ""
                                )} */}
                                      <Radio value={"activity"}>Activity</Radio>
                                      <Radio value={"sub activity"}>
                                        Sub Activity
                                      </Radio>
                                    </Radio.Group>
                                  </div>{" "}
                                </Form.Item>
                              </Descriptions.Item>
                              <Descriptions.Item
                                span={12}
                                label={
                                  timeLineData?.type === "department"
                                    ? "Department :"
                                    : "Activity Name :"
                                }
                              >
                                <Form.Item
                                  // name="type"
                                  rules={[
                                    {
                                      required: true,
                                      message: "Type",
                                    },
                                  ]}
                                  style={{ marginBottom: 0 }}
                                >
                                  <Input
                                    value={timeLineData?.TaskName}
                                    onChange={(e: any) => {
                                      // addDataHandler("name", e.target.value);
                                    }}
                                    disabled
                                  />
                                </Form.Item>
                              </Descriptions.Item>
                              <Descriptions.Item label="Plan StartDate :">
                                <Form.Item
                                  // name="date"
                                  rules={[
                                    {
                                      required: true,
                                      message: "planStartDate",
                                    },
                                  ]}
                                  style={{ marginBottom: 0 }}
                                >
                                  <TextField
                                    style={{ width: "220px", height: "30px" }}
                                    className={ClassesDate.dateInput}
                                    id="planStartDate"
                                    type="date"
                                    value={
                                      timeLineData?.StartDate?.split("T")[0]
                                    }
                                    onChange={(e: any) => {
                                      // addDataHandler("planStartDate", e.target.value);
                                    }}
                                    InputLabelProps={{
                                      shrink: true,
                                    }}
                                    disabled
                                  />
                                </Form.Item>
                              </Descriptions.Item>
                              <Descriptions.Item label="Plan EndDate :">
                                <Form.Item
                                  // name="type"
                                  rules={[
                                    {
                                      required: true,
                                      message: "planEndDate",
                                    },
                                  ]}
                                  style={{ marginBottom: 0 }}
                                >
                                  <TextField
                                    style={{ width: "220px", height: "30px" }}
                                    className={ClassesDate.dateInput}
                                    id="planEndDate"
                                    type="date"
                                    value={timeLineData?.EndDate?.split("T")[0]}
                                    onChange={(e: any) => {
                                      // addDataHandler("planEndDate", e.target.value);
                                    }}
                                    InputLabelProps={{
                                      shrink: true,
                                    }}
                                    disabled
                                  />
                                </Form.Item>
                              </Descriptions.Item>
                              <Descriptions.Item label="Duration :">
                                <Form.Item
                                  // name="type"
                                  rules={[
                                    {
                                      required: true,
                                      message: "Type",
                                    },
                                  ]}
                                  style={{ marginBottom: 0 }}
                                >
                                  <Input
                                    value={dayDifference}
                                    onChange={(e: any) => {
                                      // addDataHandler("duration", e.target.value);
                                    }}
                                    type="Number"
                                    disabled
                                  />
                                </Form.Item>
                              </Descriptions.Item>
                              <Descriptions.Item label="Priority :">
                                <Form.Item
                                  // name="type"
                                  rules={[
                                    {
                                      required: true,
                                      message: "Type",
                                    },
                                  ]}
                                  style={{ marginBottom: 0 }}
                                >
                                  <Select
                                    placeholder="Select Priority"
                                    style={{ width: "100%", color: "black" }}
                                    size="large"
                                    value={timeLineData?.Priority}
                                    onChange={(e: any) => {
                                      //   addDataHandler("priority", e);
                                    }}
                                    options={[
                                      { value: "Normal", label: "Normal" },
                                      { value: "High", label: "High" },
                                    ]}
                                  />
                                </Form.Item>
                              </Descriptions.Item>
                            </Descriptions>
                          </Form>
                        </div>
                      </div>
                    </div>
                  ) : // : buttonValue === 1 ? (
                  //   <div style={{ paddingTop: "10px" }}>
                  //     <div
                  //       style={{
                  //         padding: "10px 10px",
                  //         backgroundColor: "#F7F7FF",
                  //         borderRadius: "8px",
                  //         marginTop: "0px",
                  //       }}
                  //     >
                  //       <div
                  //         style={{ backgroundColor: "#fff", borderRadius: "0px" }}
                  //         className={classes.tableContainer}
                  //       >
                  //         <TableContainer component={Paper} variant="outlined">
                  //           <Table>
                  //             <TableHead
                  //               style={{
                  //                 backgroundColor: "#E8F3F9",
                  //                 color: "#00224E",
                  //                 // width: "500px",
                  //                 // height: "50px",
                  //               }}
                  //             >
                  //               <TableRow>
                  //                 <TableCell
                  //                   style={{
                  //                     color: "#00224E",
                  //                     fontWeight: "bold",
                  //                     padding: "5px",
                  //                     fontSize: "13px",
                  //                     width: "30px",
                  //                   }}
                  //                 >
                  //                   RowId
                  //                 </TableCell>
                  //                 <TableCell
                  //                   style={{
                  //                     color: "#00224E",
                  //                     fontWeight: "bold",
                  //                     padding: "5px",
                  //                     fontSize: "13px",
                  //                     width: "160px",
                  //                   }}
                  //                 >
                  //                   Department/Activity
                  //                 </TableCell>
                  //                 <TableCell
                  //                   style={{
                  //                     color: "#00224E",
                  //                     fontWeight: "bold",
                  //                     padding: "5px",
                  //                     fontSize: "13px",
                  //                     width: "90px",
                  //                   }}
                  //                 >
                  //                   Status
                  //                 </TableCell>
                  //                 <TableCell
                  //                   style={{
                  //                     color: "#00224E",
                  //                     fontWeight: "bold",
                  //                     padding: "5px",
                  //                     fontSize: "13px",
                  //                     width: "80px",
                  //                   }}
                  //                 >
                  //                   Duration
                  //                 </TableCell>
                  //                 <TableCell
                  //                   style={{
                  //                     color: "#00224E",
                  //                     fontWeight: "bold",
                  //                     padding: "5px",
                  //                     fontSize: "13px",
                  //                     width: "80px",
                  //                   }}
                  //                 >
                  //                   Plan Startdate
                  //                 </TableCell>
                  //                 <TableCell
                  //                   style={{
                  //                     color: "#00224E",
                  //                     fontWeight: "bold",
                  //                     padding: "5px",
                  //                     fontSize: "13px",
                  //                     width: "100px",
                  //                   }}
                  //                 >
                  //                   Plan Enddate
                  //                 </TableCell>
                  //               </TableRow>
                  //             </TableHead>
                  //             <TableBody>
                  //               {/* {tableDependencyData?.map((item: any, i: any) => {
                  //                 return ( */}
                  //               <TableRow>
                  //                 <TableCell style={{ padding: "5px" }}>
                  //                   <Input
                  //                     // value={filterByParentId[0]?.TaskId}
                  //                     disabled
                  //                     style={{ width: "100%" }}
                  //                   />
                  //                 </TableCell>
                  //                 <TableCell style={{ padding: "5px" }}>
                  //                   <Input
                  //                     // value={filterByParentId[0]?.TaskName}
                  //                     disabled
                  //                   />
                  //                 </TableCell>
                  //                 <TableCell style={{ padding: "5px" }}>
                  //                   <Input
                  //                     // value={filterByParentId[0]?.Status}
                  //                     disabled
                  //                   />
                  //                 </TableCell>
                  //                 <TableCell style={{ padding: "5px" }}>
                  //                   <Input
                  //                     // value={filterByParentId[0]?.Duration}
                  //                     disabled
                  //                   />
                  //                 </TableCell>
                  //                 <TableCell style={{ padding: "5px" }}>
                  //                   <Input
                  //                     // value={filterByParentId[0]?.StartDate}
                  //                     disabled
                  //                   />
                  //                 </TableCell>
                  //                 <TableCell style={{ padding: "5px" }}>
                  //                   <Row
                  //                     style={{
                  //                       display: "flex",
                  //                       gap: "8px",
                  //                       flexDirection: "row",
                  //                     }}
                  //                   >
                  //                     <Input
                  //                     //   value={filterByParentId[0]?.EndDate}
                  //                       disabled
                  //                       style={{ width: "98px" }}
                  //                     />
                  //                     {/* <Row
                  //                           style={{
                  //                             display: "grid",
                  //                             // paddingTop: "15px",
                  //                             alignItems: "center",
                  //                             justifyContent: "center",
                  //                           }}
                  //                         >
                  //                           <IconButton style={{ padding: "0px" }}>
                  //                             <Row style={{ display: "flex" }}>
                  //                               <IconButton
                  //                                 style={{ padding: "0px" }}
                  //                               >
                  //                                 {i ===
                  //                                 tableDependencyData?.length - 1 ? (
                  //                                   <MdAddCircle
                  //                                     style={{
                  //                                       color: "#0E497A",
                  //                                       fontSize: "21px",
                  //                                     }}
                  //                                     // onClick={finalApprovalAddHandler}
                  //                                   />
                  //                                 ) : (
                  //                                   <DeleteIcon
                  //                                     style={{ fontSize: "21px" }}
                  //                                     // onClick={() => {
                  //                                     //   finalApprovalDeleteHandler(item);
                  //                                     // }}
                  //                                   />
                  //                                 )}
                  //                               </IconButton>
                  //                             </Row>
                  //                           </IconButton>
                  //                         </Row> */}
                  //                   </Row>
                  //                 </TableCell>
                  //               </TableRow>
                  //               {/* );
                  //               })} */}
                  //             </TableBody>
                  //           </Table>
                  //         </TableContainer>
                  //       </div>
                  //     </div>
                  //   </div>
                  // )
                  buttonValue === 2 ? (
                    <div style={{ paddingTop: "10px" }}>
                      <div
                        style={{
                          padding: "10px 10px",
                          backgroundColor: "#F7F7FF",
                          borderRadius: "8px",
                        }}
                      >
                        <div
                          style={{
                            backgroundColor: "#fff",
                            borderRadius: "0px",
                          }}
                          className={classes.descriptionLabelStyle}
                        >
                          <Form layout="vertical">
                            <Descriptions
                              bordered
                              size="small"
                              style={{ width: "832px" }}
                              column={{
                                xxl: 2, // or any other number of columns you want for xxl screens
                                xl: 2, // or any other number of columns you want for xl screens
                                lg: 2, // or any other number of columns you want for lg screens
                                md: 1, // or any other number of columns you want for md screens
                                sm: 2, // or any other number of columns you want for sm screens
                                xs: 2, // or any other number of columns you want for xs screens
                              }}
                            >
                              <Descriptions.Item label="Department Owner :">
                                <Form.Item
                                  // name="type"
                                  rules={[
                                    {
                                      required: true,
                                      message: "Type",
                                    },
                                  ]}
                                  style={{ marginBottom: 0 }}
                                >
                                  <Autocomplete
                                    multiple={true}
                                    size="medium"
                                    id="tags-outlined"
                                    options={getAllUserData}
                                    style={{
                                      width: "250px",
                                      paddingTop: "1px",
                                      paddingBottom: "1px",
                                    }}
                                    getOptionLabel={getOptionLabel}
                                    value={timeLineData?.owner}
                                    filterSelectedOptions
                                    onChange={(e: any, value: any) => {
                                      // addDataHandler("owner", value);
                                    }}
                                    renderInput={(params: any) => (
                                      <TextField
                                        {...params}
                                        variant="outlined"
                                        placeholder="Select User"
                                        size="small"
                                        onChange={handleTextChange}
                                        InputLabelProps={{ shrink: false }}
                                      />
                                    )}
                                  />
                                </Form.Item>
                              </Descriptions.Item>
                            </Descriptions>
                          </Form>
                        </div>
                      </div>
                    </div>
                  ) : buttonValue === 3 ? (
                    <div>
                      <div style={{ paddingTop: "10px" }}>
                        <div
                          style={{
                            padding: "10px 10px",
                            backgroundColor: "#F7F7FF",
                            borderRadius: "8px",
                          }}
                        >
                          <div
                            style={{
                              backgroundColor: "#fff",
                              borderRadius: "0px",
                            }}
                            className={classes.descriptionLabelStyle}
                          >
                            <Form layout="vertical">
                              <Descriptions
                                bordered
                                size="small"
                                style={{ width: "832px" }}
                                column={{
                                  xxl: 2, // or any other number of columns you want for xxl screens
                                  xl: 2, // or any other number of columns you want for xl screens
                                  lg: 2, // or any other number of columns you want for lg screens
                                  md: 1, // or any other number of columns you want for md screens
                                  sm: 2, // or any other number of columns you want for sm screens
                                  xs: 2, // or any other number of columns you want for xs screens
                                }}
                              >
                                <Descriptions.Item label="Status :">
                                  <Form.Item
                                    // name="type"
                                    rules={[
                                      {
                                        required: true,
                                        message: "Type",
                                      },
                                    ]}
                                    style={{ marginBottom: 0 }}
                                  >
                                    <Select
                                      placeholder="Select Status"
                                      style={{ width: "100%", color: "black" }}
                                      // size="large"
                                      value={timeLineData?.Status}
                                      onChange={(e: any) => {
                                        //   addDataHandler("status", e);
                                      }}
                                      options={[
                                        {
                                          value: "In Progress",
                                          label: "In Progress",
                                        },
                                        { value: "On Hold", label: "On Hold" },
                                        {
                                          value: "Completed",
                                          label: "Completed",
                                        },
                                      ]}
                                      disabled
                                    />
                                  </Form.Item>
                                </Descriptions.Item>
                                <Descriptions.Item label="Percentage of Progress :">
                                  <Form.Item
                                    // name="type"
                                    rules={[
                                      {
                                        required: true,
                                        message: "Type",
                                      },
                                    ]}
                                    style={{ marginBottom: 0 }}
                                  >
                                    <Input
                                      value={timeLineData?.Progress}
                                      type="Number"
                                      onChange={(e: any) => {
                                        //   addDataHandler("progress", e.target.value);
                                      }}
                                      disabled
                                    />
                                  </Form.Item>
                                </Descriptions.Item>
                                <Descriptions.Item label="Actual StartDate :">
                                  <Form.Item
                                    // name="type"
                                    rules={[
                                      {
                                        required: true,
                                        message: "actualStartDate",
                                      },
                                    ]}
                                    style={{ marginBottom: 0 }}
                                  >
                                    <TextField
                                      style={{ width: "200px", height: "30px" }}
                                      className={ClassesDate.dateInput}
                                      id="BaselineStartDate"
                                      type="date"
                                      value={
                                        timeLineData?.BaselineStartDate?.split(
                                          "T"
                                        )[0]
                                      }
                                      onChange={(e: any) => {
                                        //   addDataHandler(
                                        //     "BaselineStartDate",
                                        //     e.target.value
                                        //   );
                                      }}
                                      InputLabelProps={{
                                        shrink: true,
                                      }}
                                      disabled
                                    />
                                  </Form.Item>
                                </Descriptions.Item>
                                <Descriptions.Item
                                  label={
                                    timeLineData?.Progress === 100
                                      ? "Actual EndDate"
                                      : "Date of Updation :"
                                  }
                                >
                                  <Form.Item
                                    // name="type"
                                    rules={[
                                      {
                                        required: true,
                                        message: "actualEndDate",
                                      },
                                    ]}
                                    style={{ marginBottom: 0 }}
                                  >
                                    <TextField
                                      style={{ width: "200px", height: "30px" }}
                                      className={ClassesDate.dateInput}
                                      id="BaselineEndDate"
                                      type="date"
                                      value={
                                        timeLineData?.BaselineEndDate?.split(
                                          "T"
                                        )[0]
                                      }
                                      onChange={(e: any) => {
                                        //   addDataHandler(
                                        //     "BaselineEndDate",
                                        //     e.target.value
                                        //   );
                                      }}
                                      InputLabelProps={{
                                        shrink: true,
                                      }}
                                      // inputProps={{
                                      //   max: `${todayDate}`,
                                      // }}
                                      disabled
                                    />
                                  </Form.Item>
                                </Descriptions.Item>
                                {/* <Descriptions.Item label="Priority :">
                            <Form.Item
                              // name="type"
                              rules={[
                                {
                                  required: true,
                                  message: "Type",
                                },
                              ]}
                              style={{ marginBottom: 0 }}
                            >
                              <Select
                                placeholder="Select Priority"
                                style={{ width: "100%", color: "black" }}
                                size="large"
                                value={formData.priority}
                                onChange={(e: any) => {
                                  addDataHandler("priority", e);
                                }}
                                options={[
                                  { value: "Normal", label: "Normal" },
                                  { value: "High", label: "High" },
                                ]}
                              />
                            </Form.Item>
                          </Descriptions.Item> */}
                                {/* <Descriptions.Item label="Actual StartDate :">
                            <Form.Item
                              // name="type"
                              rules={[
                                {
                                  required: true,
                                  message: "actualStartDate",
                                },
                              ]}
                              style={{ marginBottom: 0 }}
                            >
                              <TextField
                                style={{ width: "220px", height: "30px" }}
                                className={ClassesDate.dateInput}
                                id="BaselineStartDate"
                                type="date"
                                value={formData.BaselineStartDate}
                                onChange={(e: any) => {
                                  addDataHandler(
                                    "BaselineStartDate",
                                    e.target.value
                                  );
                                }}
                                InputLabelProps={{
                                  shrink: true,
                                }}
                              />
                            </Form.Item>
                          </Descriptions.Item>
                          <Descriptions.Item label="Actual EndDate :">
                            <Form.Item
                              // name="type"
                              rules={[
                                {
                                  required: true,
                                  message: "actualEndDate",
                                },
                              ]}
                              style={{ marginBottom: 0 }}
                            >
                              <TextField
                                style={{ width: "220px", height: "30px" }}
                                className={ClassesDate.dateInput}
                                id="BaselineEndDate"
                                type="date"
                                value={formData.BaselineEndDate}
                                onChange={(e: any) => {
                                  addDataHandler(
                                    "BaselineEndDate",
                                    e.target.value
                                  );
                                }}
                                InputLabelProps={{
                                  shrink: true,
                                }}
                              />
                            </Form.Item>
                          </Descriptions.Item> */}
                              </Descriptions>
                            </Form>
                          </div>
                          {/* {titleModel === 'Edit' ?  */}
                          <div style={{ marginTop: "10px" }}>
                            <Accordion className={ClassesDate.headingRoot}>
                              <AccordionSummary
                                expandIcon={
                                  <MdExpandMore style={{ padding: "3px" }} />
                                }
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                                className={ClassesDate.summaryRoot}
                                style={{ margin: "0px", height: "10px" }}
                              >
                                Progress Updation History
                              </AccordionSummary>
                              <AccordionDetails
                                className={ClassesDate.headingRoot}
                              >
                                <div
                                  style={{
                                    backgroundColor: "#fff",
                                    borderRadius: "0px",
                                    width: "100%",
                                  }}
                                  className={classes.tableContainer}
                                >
                                  <TableContainer
                                    component={Paper}
                                    variant="outlined"
                                  >
                                    <Table>
                                      <TableHead
                                        style={{
                                          backgroundColor: "#E8F3F9",
                                          color: "#00224E",
                                          // width: "500px",
                                          // height: "50px",
                                        }}
                                      >
                                        <TableRow>
                                          {/* <TableCell
                                style={{
                                  color: "#00224E",
                                  fontWeight: "bold",
                                  padding: "5px",
                                  fontSize: "13px",
                                  width: "40px",
                                }}
                              >
                                P V
                              </TableCell> */}
                                          <TableCell
                                            style={{
                                              color: "#00224E",
                                              fontWeight: "bold",
                                              padding: "5px",
                                              fontSize: "13px",
                                              width: "300px",
                                            }}
                                          >
                                            Status Update
                                          </TableCell>
                                          <TableCell
                                            style={{
                                              color: "#00224E",
                                              fontWeight: "bold",
                                              padding: "5px",
                                              fontSize: "13px",
                                              width: "120px",
                                            }}
                                          >
                                            Updation Date
                                          </TableCell>
                                          <TableCell
                                            style={{
                                              color: "#00224E",
                                              fontWeight: "bold",
                                              padding: "5px",
                                              fontSize: "13px",
                                              width: "100px",
                                            }}
                                          >
                                            Progress
                                          </TableCell>

                                          <TableCell
                                            style={{
                                              color: "#00224E",
                                              fontWeight: "bold",
                                              padding: "5px",
                                              fontSize: "13px",
                                              width: "170px",
                                              display: "flex",
                                              justifyContent: "space-between",
                                              alignItems: "center",
                                            }}
                                          >
                                            Status
                                            {/* {progressUpdate?.length === 0 ? 
                               <Button style={{backgroundColor:"#00224E", color:"#fff", height:"20px"}} onClick={()=>{addMoreProgressData();}}>Add</Button> : ""
                               } */}
                                          </TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {timeLineData?.progressData?.map(
                                          (ele: any, index: any) => {
                                            return (
                                              <TableRow>
                                                <TableCell
                                                  style={{ padding: "5px" }}
                                                >
                                                  <TextArea
                                                    rows={1}
                                                    placeholder="Enter Comments"
                                                    value={ele.progressComment}
                                                    maxLength={5000}
                                                    style={{
                                                      width: "100%",
                                                      color: "black",
                                                    }}
                                                    onChange={(e: any) => {
                                                      // addValuesProgressTable(ele, 'progressComment' , e.target.value)
                                                    }}
                                                    disabled={ele.buttonStatus}
                                                  />
                                                </TableCell>
                                                <TableCell
                                                  style={{ padding: "5px" }}
                                                >
                                                  <TextField
                                                    style={{
                                                      width: "95%",
                                                      height: "30px",
                                                    }}
                                                    className={
                                                      ClassesDate.dateInput
                                                    }
                                                    id="BaselineEndDate"
                                                    type="date"
                                                    value={ele.updatedDate}
                                                    onChange={(e) => {
                                                      //   addValuesProgressTable(ele, 'updatedDate' , e.target.value)
                                                    }}
                                                    InputLabelProps={{
                                                      shrink: true,
                                                    }}
                                                    disabled={ele.buttonStatus}
                                                  />
                                                </TableCell>
                                                <TableCell
                                                  style={{ padding: "5px" }}
                                                >
                                                  <Input
                                                    value={ele.taskProgress}
                                                    onChange={(e) => {
                                                      //   addValuesProgressTable(ele, 'taskProgress' , e.target.value)
                                                    }}
                                                    type="Number"
                                                    style={{
                                                      width: "100%",
                                                      color: "black",
                                                    }}
                                                    disabled={ele.buttonStatus}
                                                  />
                                                </TableCell>
                                                <TableCell
                                                  style={{ padding: "5px" }}
                                                >
                                                  <Row
                                                    style={{
                                                      display: "flex",
                                                      gap: "15px",
                                                    }}
                                                  >
                                                    <Select
                                                      placeholder="Select Status"
                                                      style={{
                                                        width: "150px",
                                                        color: "black",
                                                      }}
                                                      value={ele.status}
                                                      onChange={(e) => {
                                                        //   addValuesProgressTable(ele, 'status' , e)
                                                      }}
                                                      options={[
                                                        {
                                                          value: "In Progress",
                                                          label: "In Progress",
                                                        },
                                                        {
                                                          value: "On Hold",
                                                          label: "On Hold",
                                                        },
                                                        {
                                                          value: "Completed",
                                                          label: "Completed",
                                                        },
                                                      ]}
                                                      disabled={
                                                        ele.buttonStatus
                                                      }
                                                    />
                                                    <Row></Row>
                                                  </Row>
                                                </TableCell>
                                              </TableRow>
                                            );
                                          }
                                        )}
                                      </TableBody>
                                    </Table>
                                  </TableContainer>
                                </div>
                              </AccordionDetails>
                            </Accordion>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : buttonValue === 4 ? (
                    <div>
                      <div style={{ paddingTop: "10px" }}>
                        <div
                          style={{
                            padding: "10px 10px",
                            backgroundColor: "#F7F7FF",
                            borderRadius: "8px",
                            marginTop: "0px",
                          }}
                        >
                          <div
                            style={{
                              backgroundColor: "#fff",
                              borderRadius: "0px",
                            }}
                            className={classes.tableContainer}
                          >
                            <TableContainer
                              component={Paper}
                              variant="outlined"
                            >
                              <Table>
                                <TableHead
                                  style={{
                                    backgroundColor: "#E8F3F9",
                                    color: "#00224E",
                                    // width: "500px",
                                    // height: "50px",
                                  }}
                                >
                                  <TableRow>
                                    {/* <TableCell
                                style={{
                                  color: "#00224E",
                                  fontWeight: "bold",
                                  padding: "5px",
                                  fontSize: "13px",
                                  width: "60px",
                                }}
                              >
                                Sl No.
                              </TableCell> */}
                                    <TableCell
                                      style={{
                                        color: "#00224E",
                                        fontWeight: "bold",
                                        padding: "5px",
                                        fontSize: "13px",
                                        width: "200px",
                                      }}
                                    >
                                      Evidence
                                    </TableCell>
                                    <TableCell
                                      style={{
                                        color: "#00224E",
                                        fontWeight: "bold",
                                        padding: "5px",
                                        fontSize: "13px",
                                        width: "110px",
                                      }}
                                    >
                                      Attachments
                                    </TableCell>
                                    <TableCell
                                      style={{
                                        color: "#00224E",
                                        fontWeight: "bold",
                                        padding: "5px",
                                        fontSize: "13px",
                                        width: "90px",
                                      }}
                                    >
                                      Approve/Reject
                                    </TableCell>
                                    <TableCell
                                      style={{
                                        color: "#00224E",
                                        fontWeight: "bold",
                                        padding: "5px",
                                        fontSize: "13px",
                                        width: "180px",
                                      }}
                                    >
                                      Remarks
                                    </TableCell>
                                    <TableCell
                                      style={{
                                        color: "#00224E",
                                        fontWeight: "bold",
                                        padding: "5px",
                                        fontSize: "13px",
                                        width: "60px",
                                      }}
                                    >
                                      Action
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {timeLineData?.evidence?.map(
                                    (item: any, i: any) => {
                                      return (
                                        <TableRow key={item.id}>
                                          <TableCell style={{ padding: "5px" }}>
                                            <Input
                                              value={item.evidenceName}
                                              placeholder="Evidence"
                                              disabled
                                            />
                                          </TableCell>
                                          <TableCell style={{ padding: "5px" }}>
                                            <Row
                                              style={{
                                                display: "flex",
                                                gap: "5px",
                                                alignItems: "center",
                                              }}
                                            >
                                              <Upload
                                                // {...uploadFilepropsEvdUpDate(item)}
                                                className={
                                                  classes.uploadSection
                                                }
                                                id={item.id}
                                                disabled={item.buttonStatus}
                                                showUploadList={false}
                                              >
                                                <Button icon={<MdUpload />}>
                                                  Upload
                                                </Button>
                                              </Upload>
                                              <Popover
                                                content={
                                                  <div>
                                                    {item?.evidenceAttachment?.map(
                                                      (
                                                        ele: any,
                                                        index: any
                                                      ) => {
                                                        return (
                                                          <div
                                                            style={{
                                                              display: "flex",
                                                              gap: "10px",
                                                            }}
                                                          >
                                                            <MdAttachment
                                                              style={{
                                                                color:
                                                                  "#003566",
                                                                fontSize:
                                                                  "18px",
                                                              }}
                                                            />
                                                            <a
                                                              href={
                                                                ele?.documentLink
                                                              }
                                                              target="_blank"
                                                              rel="noopener noreferrer"
                                                            >
                                                              {ele.fileName}
                                                            </a>
                                                            <Popconfirm
                                                              placement="top"
                                                              title={
                                                                "Are you sure to delete Data"
                                                              }
                                                              onConfirm={() => {
                                                                // fileDeleteHandler(
                                                                //   index,
                                                                //   item.id,
                                                                //   "Pe"
                                                                // );
                                                              }}
                                                              okText="Yes"
                                                              cancelText="No"
                                                            >
                                                              <IconButton
                                                                style={{
                                                                  margin: "0",
                                                                  padding:
                                                                    "0px",
                                                                }}
                                                              >
                                                                {/* <DeleteIcon
                                                          style={{
                                                            color: "#FC5B73",
                                                            fontSize: "15px",
                                                          }}
                                                        /> */}
                                                              </IconButton>
                                                            </Popconfirm>
                                                          </div>
                                                        );
                                                      }
                                                    )}
                                                  </div>
                                                }
                                                title={null}
                                              >
                                                <Badge
                                                  count={
                                                    item?.evidenceAttachment
                                                      ?.length
                                                  }
                                                  size="small"
                                                >
                                                  <MdOutlineListAlt
                                                    style={{
                                                      color: "#003566",
                                                      cursor: "pointer",
                                                    }}
                                                  />
                                                </Badge>
                                              </Popover>
                                            </Row>
                                          </TableCell>
                                          <TableCell
                                            style={{ padding: "5px" }}
                                          ></TableCell>
                                          <TableCell style={{ padding: "5px" }}>
                                            <Accordion
                                              className={
                                                ClassesDate.headingRoot
                                              }
                                            >
                                              <AccordionSummary
                                                expandIcon={
                                                  <MdExpandMore
                                                    style={{ padding: "3px" }}
                                                  />
                                                }
                                                aria-controls="panel1a-content"
                                                id="panel1a-header"
                                                className={
                                                  ClassesDate.summaryRoot
                                                }
                                                style={{
                                                  margin: "0px",
                                                  height: "10px",
                                                }}
                                              >
                                                View/Add Remarks
                                              </AccordionSummary>
                                              <AccordionDetails
                                                className={
                                                  ClassesDate.headingRoot
                                                }
                                              >
                                                <div
                                                  style={{
                                                    display: "grid",
                                                    gap: "5px",
                                                  }}
                                                >
                                                  {timeLineData?.remarks?.map(
                                                    (dd: any, index: any) => {
                                                      const color =
                                                        stringToColor(dd?.user);
                                                      return (
                                                        <div
                                                          style={{
                                                            display: "flex",
                                                            gap: "10px",
                                                            alignItems:
                                                              "center",
                                                          }}
                                                          key={dd.id}
                                                        >
                                                          <div
                                                            style={{
                                                              width: "40px",
                                                              height: "40px",
                                                            }}
                                                          >
                                                            <Tooltip
                                                              title={dd?.user}
                                                            >
                                                              <Avatar
                                                                size="large"
                                                                style={{
                                                                  backgroundColor:
                                                                    color,
                                                                  color:
                                                                    "#fde3cf",
                                                                  verticalAlign:
                                                                    "middle",
                                                                }}
                                                                src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                                                              >
                                                                {dd?.user &&
                                                                  dd?.user
                                                                    ?.charAt(0)
                                                                    ?.toUpperCase()}
                                                              </Avatar>
                                                            </Tooltip>
                                                          </div>
                                                          <div
                                                            style={{
                                                              display: "grid",
                                                              gap: "4px",
                                                            }}
                                                          >
                                                            <div
                                                              style={{
                                                                backgroundColor:
                                                                  "#F2F4F4",
                                                                color: "black",
                                                                height: "auto",
                                                                borderRadius:
                                                                  "5px",
                                                                display: "flex",
                                                                justifyContent:
                                                                  "center",
                                                                alignItems:
                                                                  "center",
                                                              }}
                                                            >
                                                              <span
                                                                style={{
                                                                  padding:
                                                                    "4px",
                                                                  textAlign:
                                                                    "center",
                                                                }}
                                                              >
                                                                {dd.remarks}
                                                              </span>
                                                            </div>
                                                            {dd.attachment?.map(
                                                              (ele: any) => {
                                                                return (
                                                                  <div
                                                                    style={{
                                                                      display:
                                                                        "flex",
                                                                      gap: "10px",
                                                                    }}
                                                                  >
                                                                    <MdAttachment
                                                                      style={{
                                                                        color:
                                                                          "#003566",
                                                                        fontSize:
                                                                          "18px",
                                                                      }}
                                                                    />
                                                                    <a
                                                                      href={
                                                                        ele?.documentLink
                                                                      }
                                                                      target="_blank"
                                                                      rel="noopener noreferrer"
                                                                    >
                                                                      {
                                                                        ele.fileName
                                                                      }
                                                                    </a>
                                                                  </div>
                                                                );
                                                              }
                                                            )}
                                                          </div>
                                                        </div>
                                                      );
                                                    }
                                                  )}
                                                  <div
                                                    style={{
                                                      display: "flex",
                                                      gap: "10px",
                                                      paddingTop: "10px",
                                                    }}
                                                  >
                                                    <TextArea
                                                      rows={1}
                                                      placeholder="Enter Remarks"
                                                      //   value={addMessage.remarks}
                                                      maxLength={5000}
                                                      style={{
                                                        width: "140px",
                                                        color: "black",
                                                      }}
                                                      onChange={(e: any) => {
                                                        // readMsgHandler(e.target.value);
                                                      }}
                                                    />
                                                    <Upload
                                                      //   {...uploadFileProps()}
                                                      className={
                                                        classes.uploadSection
                                                      }
                                                      id={"1"}
                                                      showUploadList={false}
                                                    >
                                                      <IconButton
                                                        style={{
                                                          margin: "0pa",
                                                          padding: "5px",
                                                        }}
                                                      >
                                                        <MdAttachment
                                                          style={{
                                                            color: "#00224E",
                                                            fontSize: "20px",
                                                          }}
                                                        />{" "}
                                                      </IconButton>
                                                    </Upload>

                                                    <IconButton
                                                      style={{
                                                        margin: "0pa",
                                                        padding: "5px",
                                                      }}
                                                      onClick={() => {
                                                        // addSubmitMsgHandler();
                                                      }}
                                                    >
                                                      <MdSend
                                                        style={{
                                                          color: "#00224E",
                                                          fontSize: "20px",
                                                        }}
                                                      />
                                                    </IconButton>
                                                  </div>
                                                </div>
                                              </AccordionDetails>
                                            </Accordion>
                                          </TableCell>
                                          <TableCell style={{ padding: "5px" }}>
                                            <Row
                                              style={{
                                                display: "grid",
                                                // paddingTop: "15px",
                                                alignItems: "center",
                                                justifyContent: "center",
                                              }}
                                            ></Row>
                                          </TableCell>
                                        </TableRow>
                                      );
                                    }
                                  )}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : buttonValue === 5 ? (
                    <div>
                      <div style={{ paddingTop: "10px" }}>
                        <div
                          style={{
                            padding: "10px 10px",
                            backgroundColor: "#F7F7FF",
                            borderRadius: "8px",
                          }}
                        >
                          <Accordion className={ClassesDate.headingRoot}>
                            <AccordionSummary
                              expandIcon={
                                <MdExpandMore style={{ padding: "3px" }} />
                              }
                              aria-controls="panel1a-content"
                              id="panel1a-header"
                              className={ClassesDate.summaryRoot}
                              style={{ margin: "0px", height: "10px" }}
                            >
                              View/Add Remarks
                            </AccordionSummary>
                            <AccordionDetails
                              className={ClassesDate.headingRoot}
                            >
                              <div style={{ display: "grid", gap: "5px" }}>
                                {timeLineData?.remarks?.map(
                                  (dd: any, index: any) => {
                                    const color = stringToColor(dd?.user);
                                    return (
                                      <div
                                        style={{
                                          display: "flex",
                                          gap: "10px",
                                          alignItems: "center",
                                        }}
                                        key={dd.id}
                                      >
                                        <div
                                          style={{
                                            width: "40px",
                                            height: "40px",
                                          }}
                                        >
                                          <Tooltip title={dd?.user}>
                                            <Avatar
                                              size="large"
                                              style={{
                                                backgroundColor: color,
                                                color: "#fde3cf",
                                                verticalAlign: "middle",
                                              }}
                                            >
                                              {dd?.user &&
                                                dd?.user
                                                  ?.charAt(0)
                                                  ?.toUpperCase()}
                                            </Avatar>
                                          </Tooltip>
                                        </div>
                                        <div
                                          style={{
                                            display: "grid",
                                            gap: "4px",
                                          }}
                                        >
                                          <div
                                            style={{
                                              backgroundColor: "#F2F4F4",
                                              color: "black",
                                              height: "auto",
                                              borderRadius: "5px",
                                              display: "flex",
                                              justifyContent: "center",
                                              alignItems: "center",
                                            }}
                                          >
                                            <span
                                              style={{
                                                padding: "4px",
                                                textAlign: "center",
                                              }}
                                            >
                                              {dd.remarks}
                                            </span>
                                          </div>
                                          {dd.attachment?.map((ele: any) => {
                                            return (
                                              <div
                                                style={{
                                                  display: "flex",
                                                  gap: "10px",
                                                }}
                                              >
                                                <MdAttachment
                                                  style={{
                                                    color: "#003566",
                                                    fontSize: "18px",
                                                  }}
                                                />
                                                <a
                                                  href={ele?.documentLink}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                >
                                                  {ele.fileName}
                                                </a>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            </AccordionDetails>
                          </Accordion>
                        </div>
                      </div>
                    </div>
                  ) : buttonValue === 6 ? (
                    <>Audit Trail</>
                  ) : (
                    ""
                  )}
                </div>
              </>
            )}
          </div>
        </Modal>
        <Modal
          title={"Risk History"}
          open={openStatusRisk}
          onCancel={closeModelStatusRisk}
          footer={null}
          width="900px"
          closeIcon={
            <MdClose
              style={{
                color: "#fff",
                backgroundColor: "#0E497A",
                borderRadius: "3px",
              }}
            />
          }
        >
          <div>
            <Paper>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead
                    style={{
                      backgroundColor: "#E8F3F9",
                      color: "#00224E",
                    }}
                  >
                    <TableRow>
                      {/* <TableCell
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                          width:"100px"
                        }}
                        align="center"
                      >
                        Current Score
                      </TableCell> */}
                      <TableCell
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                          width: "100px",
                        }}
                        align="center"
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          New Score
                          <Popover
                            content={
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "3px",
                                }}
                              >
                                <span>1-Delay/Issue;No Action</span>
                                <span>
                                  2-Delay/Issue;Action and impact available
                                </span>
                                <span>
                                  3-Delay/Issue;Action available no impact
                                </span>
                                <span>
                                  4--Activities in progress with minors issues
                                </span>
                                <span>
                                  5-All Activities are as per plan; no issues
                                </span>
                              </div>
                            }
                            title={null}
                          >
                            <MdInfo style={{ color: "red" }} />
                          </Popover>
                        </div>
                      </TableCell>
                      <TableCell
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                          width: "500px",
                        }}
                        align="center"
                      >
                        Reason
                      </TableCell>
                      <TableCell
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                          // width:"300px"
                        }}
                        align="center"
                      >
                        Updated By
                      </TableCell>
                      <TableCell
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                          // width:"300px"
                        }}
                        align="center"
                      >
                        Updated On
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {riskData &&
                      riskData?.map((ele: any, index: any) => {
                        return (
                          <TableRow>
                            {/* <TableCell style={{
                              padding: "5px",
                              borderRight: "1px solid rgba(104, 104, 104, 0.1)",
                              borderBottom:
                                "1px solid rgba(104, 104, 104, 0.1)",
                              fontSize: "12px",
                            }}
                            align="center">
                            {ele.currentScore}
                          </TableCell> */}
                            <TableCell
                              style={{
                                padding: "5px",
                                borderRight:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                borderBottom:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                fontSize: "12px",
                              }}
                              align="center"
                            >
                              {ele.newScore}
                            </TableCell>
                            <TableCell
                              style={{
                                padding: "5px",
                                borderRight:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                borderBottom:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                fontSize: "12px",
                              }}
                              // align="center"
                            >
                              {ele.reason}
                            </TableCell>
                            <TableCell
                              style={{
                                padding: "5px",
                                borderRight:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                borderBottom:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                fontSize: "12px",
                              }}
                              align="center"
                            >
                              {ele?.cratedBy}
                            </TableCell>
                            <TableCell
                              style={{
                                padding: "5px",
                                borderRight:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                borderBottom:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                fontSize: "12px",
                              }}
                              align="center"
                            >
                              {ele?.createdOn}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default RiskIndex;
