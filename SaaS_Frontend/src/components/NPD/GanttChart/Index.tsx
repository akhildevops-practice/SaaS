import React, { useEffect, useRef, useState } from "react";
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
  PaginationProps,
  Popconfirm,
  Popover,
  Radio,
  Row,
  Select,
  Tag,
  Tooltip,
  Typography,
  Upload,
  UploadProps,
} from "antd";
import {
  Box,
  Collapse,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  debounce,
  makeStyles,
} from "@material-ui/core";
import { MdClose } from 'react-icons/md';
import {
  GanttComponent,
  DayMarkers,
  Inject,
  Edit,
  Selection,
  Toolbar,
  ColumnsDirective,
  ColumnDirective,
  EventMarkersDirective,
  EventMarkerDirective,
  ColumnMenu,
  Filter,
  Sort,
  Resize,
  ExcelExport,
  PdfExport,
  EditSettingsModel,
  ContextMenu,
  PdfExportProperties,
  TimelineSettingsModel,
  RowDD,
  VirtualScroll,
} from "@syncfusion/ej2-react-gantt";
// import { Search } from "@syncfusion/ej2-react-grids";
import {
  DropDownList,
} from "@syncfusion/ej2-react-dropdowns";
import Dragger from "antd/es/upload/Dragger";
import { MdInbox } from 'react-icons/md';
import { MdClear } from 'react-icons/md';


import useStyles from "./styles";

import {
  AiOutlineFullscreenExit,
  AiOutlineDiff,
  AiOutlineFund,
  AiOutlineSnippets,
} from "react-icons/ai";
import { FiUpload } from "react-icons/fi";
import { MdAddCircle } from 'react-icons/md';
import { MdDelete } from 'react-icons/md';
import { MdOutlineCheckCircle } from 'react-icons/md';
import EditImgIcon from "../../../assets/documentControl/Edit.svg";
import DeleteImgIcon from "../../../assets/documentControl/Delete.svg";

import { API_LINK } from "config";
import { useSnackbar } from "notistack";
import getAppUrl from "utils/getAppUrl";
import { MdAttachment } from 'react-icons/md';
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import { generateUniqueId } from "utils/uniqueIdGenerator";
import { getUserInfo } from "apis/socketApi";
import TextArea from "antd/es/input/TextArea";
import { MdSend } from 'react-icons/md';
import { MdOutlineListAlt } from 'react-icons/md';
import { MdHighlightOff } from 'react-icons/md';
import moment from "moment";
import "./Index.css";
import { MdAddCircleOutline } from 'react-icons/md';
import { MdPictureAsPdf } from 'react-icons/md';
import { MdFileCopy } from 'react-icons/md';
import { MdZoomOutMap } from 'react-icons/md';
import { useNavigate, useParams } from "react-router-dom";
import { ExcelExportProperties } from "@syncfusion/ej2-grids";
import { MdVisibility } from 'react-icons/md';
import { Autocomplete } from "@material-ui/lab";
// import {
//   getAllInspectionAllSuppliers,
//   getAllInspectionDepartment,
//   getAllUsersApi,
// } from "apis/inspection";
import { getAllUsersApi } from "apis/npdApi";
import { MdExpandMore } from 'react-icons/md';
import { MdExpandLess } from 'react-icons/md';
import { MdControlPoint } from 'react-icons/md';
import { MdLibraryAdd } from 'react-icons/md';
import {
  createNpdGanttChart,
  createNpdManyGanttChart,
  deleteGanttChartData,
  getAllNPDListDrop,
  getByIdGanttData,
  getByIdGanttNpdDptData,
  getByNpdId,
  updateManyGanttChartPic,
  updateTaskGanttTask,
} from "apis/npdApi";
import { MdFolder } from 'react-icons/md';
import { MdCheckBox } from 'react-icons/md';
import { useRecoilState } from "recoil";
import { npdFormData } from "recoil/atom";
import axios from "apis/axios.global";
import { getAllEntities } from "apis/entityApi";

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
    "&.MuiInputBase-root MuiOutlinedInput-root MuiAutocomplete-inputRoot MuiInputBase-fullWidth MuiInputBase-formControl MuiInputBase-adornedStart MuiOutlinedInput-adornedStart MuiInputBase-adornedEnd MuiOutlinedInput-adornedEnd MuiInputBase-marginDense MuiOutlinedInput-marginDense":
      {
        padding: "0px",
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
  selectEmpty: {
    padding: "0px",
    "& .MuiSelect-root MuiSelect-select MuiSelect-selectMenu MuiInputBase-input MuiInput-input":
      {
        padding: "0px",
      },
  },
  dateData: {
    width: "100%",
    "&.ant-select-single.ant-select-show-arrow .ant-select-selection-item": {
      color: "black",
    },
    "&.css-19qh8xo-MuiInputBase-input-MuiOutlinedInput-input.Mui-disabled": {
      opacity: "1",
      color: "black",
      webkitTextFillColor: "black",
    },
  },
}));

let typeAheadValue: string;
let typeAheadType: string;

const GanttIndex = () => {
  let theme: any;
  let CurrentTheme: any;
  let statusStyleColor: any;
  let priorityStyle: any;
  let priorityContentStyle: any;
  let statusContentstyleColor: any;
  let display: any;
  let padding: any;
  let gap: any;
  let width: any;
  let height: any;
  let background: any;
  let borderRadius: any;
  let color: any;
  let fontStyle: any;
  let fontWeight: any;
  let fontSize: any;
  let lineHeight: any;
  let textAlign: any;
  let backgroundColor: any;
  let backgroundPri: any;
  let pad: any;
  const editingResources: any = [];

  const uniqueId = generateUniqueId(22);
  const ClassesDate = useStylesDate();
  const navigate = useNavigate();
  const todayDate = new Date().toISOString().split("T")[0];
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [timelineMode, setTimelineMode] = useState<any>("Week");
  const [viewMode, setViewMode] = useState<any>("Default");
  const [uploadModel, setUploadModel] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [filterValue, setFilterValue] = useState<any>("All");
  const [filterUserValue, setFilterUserValue] = useState<any>("All");
  const [ganttInstance, setGanttInstance] = useState<any>();
  const [openModel, setOpenModel] = useState(false);
  const [buttonValue, setButtonValue] = useState(0);
  const [titleModel, setTitleModel] = useState<any>("Add");
  const [buttonStatus, setButtonStatus] = useState(false);
  const [editId, setEditId] = useState<any>("");
  const realmName = getAppUrl();
  const [userInfo, setUserInfo] = useState<any>();
  const [editTaskData, setEditTaskData] = useState<any>();
  const [isDepartment, setIsDepartment] = useState(false);
  const [getAllUserData, setGetAllUserData] = useState<any>([]);
  const [activeUserEntityId, setActiveUserEntityId] = useState<any>("");
  const [allDepartment, setAllDepartment] = useState<any[]>([]);
  const [selectedNpd, setSelectedNpd] = useState<any>();
  const [npdFilterData, setNpdFilterData] = useState<any[]>([]);
  const [evidenceModel, setEvidenceModel] = useState(false);
  const [disable, setDisable] = useState(false);
  const [saveDisable, setSaveDisable] = useState(false);
  const [anchorEl, setAnchorEl] = useState(false);
  const [selectedData, setSelectedData] = useState<any>();
  const [departmentList, setDepartmentList] = useState<any[]>([]);
  const [overAllData, setOverAllData] = useState<any[]>([]);
  const [userList, setUserList] = useState<any[]>([]);
  const [evdTaskData, setEvdTaskData] = useState<any>();
  const [departmentDataTable, setDepartmentDataTable] = useState<any>([]);
  const [mainTaskStatus, setMainTaskStatus] = useState(false);
  const [mainTaskId, setMainTaskId] = useState<any>("");
  const [evidenceTaskStatus, setEvidenceTaskStatus] = useState(false);
  const [evidenceTaskId, setEvidenceTaskId] = useState<any>("");
  const [subTaskStatus, setSubTaskStatus] = useState(false);
  const [subTaskId, setSubTaskId] = useState<any>("");
  const [npdValueFull, setNpdValueFull] = useState<any>();
  const { enqueueSnackbar } = useSnackbar();
  const [parentEdit, setParentEdit] = useState<boolean>(false);
  const [parentOptions, setParentOptions] = useState<any>([]);
  const [departmentAddForm, setDepartmentAddForm] = useState<any>({
    id: uniqueId,
    department: {},
    pic: [],
    stakeHolder: {},
  });
  const [evidenceUpDateData, setEvidenceUpDateData] = useState<any[]>([
    {
      id: uniqueId,
      evidenceName: "",
      evidenceAttachment: [],
      remarks: [],
      accept: false,
      reject: false,
      addButtonStatus: true,
      buttonStatus: true,
    },
  ]);
  const [evdEditStatus, setEvdEditStatus] = useState(false);
  const [evdEditId, setEvdEditId] = useState<any>("");
  const [tableDependencyData, setTableDependencyData] = useState<any[]>([]);
  const userDetail = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentArgs, setCurrentArgs] = useState<any>(null);
  const [readMode, setReadMode] = useState<boolean>(false);
  const [pa, setPa] = useState<any>([]); //project admins
  const [evidenceData, setEvidenceData] = useState<any[]>([
    {
      id: "1",
      evidenceName: "",
      evidenceAttachment: [],
      addButtonStatus: false,
      buttonStatus: false,
    },
  ]);
  const dataList: { [key: string]: Object }[] = [
    { ID: "Default", Text: "Default" },
    { ID: "Grid", Text: "Grid" },
    { ID: "Chart", Text: "Chart" },
  ];
  const [sortData, setSortData] = useState<[]>([]);
  const [remarksData, setRemarksData] = useState<any>([]);
  const [addMessage, setAddMessage] = useState<any>({
    id: uniqueId,
    user: userInfo?.username,
    remarks: "",
    attachment: [],
  });
  const [ganttData, setGanttData] = useState<[]>([]);
  const [expandedRows, setExpandedRows] = useState<any>({});
  const [addDeptData, setAddDeptData] = useState<any>([]);
  const [freezeButtonStatus, setFreezeButtonStatus] = useState<any>();

  const { Option } = Select;
  const taskFields: any = {
    id: "TaskId",
    name: "TaskName",
    startDate: "StartDate",
    endDate: "EndDate",
    duration: "Duration",
    progress: "Progress",
    dependency: "Predecessor",
    parentID: "ParentId",
    resourceInfo: "Assignee",
    baselineStartDate: "BaselineStartDate",
    baselineEndDate: "BaselineEndDate",
    timelog: "TimeLog",
    indicators: "Indicators",
    work: "Work",
    status: "Status",
    priority: "Priority",
    component: "Component",
    // child: "subtasks",
    milestone: "isMileStone",
    isDraggable: "isDraggable",
    hasChildMapping: "isParent",
  };

  const splitterSettings: any = {
    position: "42%",
  };

  const gridLines: any = "Both";
  const [progressUpdate, setProgressUpdate] = useState<any>([]);
  const { id } = useParams();
  const [custOptins, setCustOptions] = useState<any>([]);
  const [allSuppliers, setAllSuppliers] = useState<any[]>([]);
  const [formDataNpd, setFormDataNpd] = useRecoilState(npdFormData);
  const [stakeHolderDropList, setStakeHolderDropList] = useState<any[]>([]);
  const [getByNpdData, setGetByNpdData] = useState<any>();
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [formData, setFormData] = useState<any>({
    type: "department",
    name: "",
    planStartDate: "",
    planEndDate: "",
    BaselineStartDate: "",
    BaselineEndDate: "",
    duration: "",
    owner: [],
    dependency: [],
    status: "",
    progress: "",
    evidence: [],
    remarks: [],
    priority: "",
    stakeHolder: "",
    deptId: "",
    isMileStone: false,
    paStatus: false,
    stakeHolderName: "",
    planFreeze: false,
  });
  const [stakeHolderModal, setStakeHolderModal] = useState(false);
  const [entityForm, setEntityForm] = useState<any>({
    id: "",
    entityType: "",
    entityTypeData: {},
    entityList: "",
    entityListData: {},
  });
  const [allDataList, setAllDataList] = useState<any[]>([]);
  const [entityListData, setEntityListData] = useState<any>([]);
  const orgName = getAppUrl();
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState<any>();
  const [pageLimit, setPageLimit] = useState<any>(20);
  const [editButtonStatusProgress, setEditButtonStatusProgress] =
    useState(false);
  const [editProgressEditId, setEditProgressEditId] = useState("");

  const showTotalType: PaginationProps["showTotal"] = (total: any) =>
    `Total ${total} items`;

  const handlePaginationType = (page: any, pageSize: any) => {
    setPage(page);
    setPageLimit(pageSize);
  };
  const openStakeHolderModal = () => {
    if (
      npdValueFull === "" ||
      npdValueFull === undefined ||
      npdValueFull === null
    ) {
      enqueueSnackbar(`Please Select NPD`, {
        variant: "error",
      });
    } else {
      setStakeHolderModal(true);
    }
  };
  const closeStakeHolderModal = () => {
    setStakeHolderModal(false);
  };

  useEffect(() => {
    onChangeFilterData(id);
    buttonStatusFreeze(id);
  }, [id !== undefined]);

  useEffect(() => {
    if (npdValueFull !== undefined && npdValueFull !== "undefined") {
      handleFetchData(npdValueFull);
      getProjectAdmins();
    } else {
      setFormDataNpd({
        projectType: "",
        projectName: "",
        customer: [],
        sopDate: "",
        sopQuantity: "",
        escNumber: "",
        escRank: "",
        justification: "",
        meetingDate: "",
        partDetails: [
          {
            model: "",
            partName: "",
            densoPartNo: "",
            customer: "",
            date: "",
            orderNo: "",
            qty: "",
            remarks: "",
            productType: "",
          },
        ],
        departmentData: [
          {
            id: "66cc61a60d82c135b28021996",
            category: userDetail.organization?.realmName,
            stakeHolderName: userDetail.organization?.realmName,
            stakeHolderId:
              "66cc61a60d82c135b7c" + userDetail.organization?.realmName,
            departments: [
              {
                id: "cls9wubp10000ro7k567p4nm1",
                department: userDetail.organization?.realmName,
                pic: [],
                npdConfigId: "",
              },
            ],
            isSelected: false,
          },
        ],
        attachFiles: [{ key: Date.now(), name: "", files: [] }],
        createdBy: "",
        updatedBy: "",
        isDraft: true,
        planFreeze: false,
      });
    }
  }, [npdValueFull]);

  useEffect(() => {
    getDataByPagination(data);
  }, [page, data]);

  console.log("page", page);

  const getDataByPagination = async (data: any) => {
    const includeParents = (tasks: any[]) => {
      const taskMap = new Map(tasks?.map((task) => [task?.TaskId, task]));
      const finalTasks = new Set(tasks);
      tasks?.forEach((task) => {
        let currentParentId = task?.ParentId;
        while (currentParentId && !taskMap?.has(currentParentId)) {
          const parentTask = data?.find(
            (t: any) => t?.TaskId === currentParentId
          );
          if (parentTask) {
            finalTasks.add(parentTask);
            currentParentId = parentTask.ParentId;
          } else {
            break;
          }
        }
      });
      return Array.from(finalTasks);
    };
    let paginatedResults: any;
    if (pageLimit !== "0") {
      const startIndex = (page - 1) * Number(pageLimit);
      const endIndex = Math?.min(startIndex + Number(pageLimit), data?.length);
      const paginated = data?.slice(startIndex, endIndex);
      paginatedResults = await includeParents(paginated); // Include parents
    } else {
      paginatedResults = data;
    }
    setGanttData(paginatedResults);
  };

  const handleFetchData = async (id: any) => {
    try {
      const result = await axios.get(`api/npd/${id}`);
      setFormDataNpd(result.data);
      getProjectAdmins();
    } catch {}
  };

  useEffect(() => {
    if (progressUpdate?.length === 0) {
      const dataProgress = {
        id: uniqueId,
        updatedDate: "",
        taskProgress: "",
        status: "",
        progressComment: "",
        buttonStatus: false,
        addHandlerButtonStatus: false,
      };
      setProgressUpdate([dataProgress, ...progressUpdate]);
      getProjectAdmins();
    }
  }, []);

  useEffect(() => {
    getCustomerOptions();
    getAllSuppliers();
    getListDataEntity();
  }, []);

  useEffect(() => {
    getAllUsersInformation("", "");
    // getAllDataGanttView();
    dropDownValueNpdList();
    // dropNpdDptList();
  }, []);

  const getListDataEntity = async () => {
    const result = await axios.get(
      `api/entity/getEntityTypes/byOrg/${orgName}`
    );
    const updateList = result?.data
      ?.filter((itd: any) => itd?.name !== "Department")
      ?.filter((itd: any) => itd?.name !== "Dealer")
      ?.map((ele: any) => {
        const data = {
          value: ele?.id,
          label: ele?.name,
        };
        return data;
      });
    setEntityListData(updateList);
  };

  const getAllSuppliers = () => {
    try {
      getAllUsersApi().then((response: any) => {
        setAllSuppliers(response?.data);
      });
    } catch (e) {
      console.log("error", e);
      // enqueueSnackbar(`${e}`, {
      //   variant: "error",
      // });
    }
  };
  //function to get drop down options for changing the parent task
  const getNPDParentOptions = async (npdid: any) => {
    try {
      const result = await axios.get(`/api/npd/getNPDDptList/${npdid}`);
      if (result?.data) {
        setParentOptions(result?.data);
      }
    } catch (error) {
      setParentOptions([]);
    }
  };

  const getCustomerOptions = async () => {
    const result = await axios.get(`/api/configuration/getAllCustomer`);
    const finalResult = result?.data?.map((value: any) => ({
      value: value?.id,
      label: value?.entityName,
    }));
    setCustOptions(finalResult);
  };

  const getProjectAdmins = async () => {
    const result = await axios.get(`/api/configuration`);
    // console.log("result", result);
    // console.log("result?.data in reg npd nav bar", result.data);
    if (result?.data[0]?.pmUserData) {
      setPa(result?.data[0]?.pmUserData);
    }
  };

  // const suppliersOption = allSuppliers
  //   ?.map((item: any) => {
  //     let data = {
  //       value: item.id,
  //       label: item.entityName,
  //     };
  //     return data;
  //   })
  //   .sort((a, b) => a.label?.localeCompare(b.label));
  // console.log("disabled value", disable);
  // const ganttRef = useRef(null);

  const evidenceModelOpen = (data: any) => {
    setEvdTaskData(data);
    // console.log("data", data);
    // data?.picId.includes(userDetail.id) ? setDisable(false) : setDisable(true);
    data?.picId.includes(userDetail.id) || data?.pm?.includes(userDetail?.id)
      ? setSaveDisable(false)
      : setSaveDisable(true);
    if (
      data?.evidence?.map((ele: any) => ele.accept)?.includes(true) ||
      data?.evidence?.map((ele: any) => ele.reject)?.includes(true)
    ) {
      const EvdData = data?.evidence?.map((ele: any) => {
        const dataSub = {
          id: ele.id,
          evidenceName: ele.evidenceName,
          evidenceAttachment: ele.evidenceAttachment,
          remarks: ele.remarks,
          accept: ele.accept,
          reject: ele.reject,
          addButtonStatus: true,
          buttonStatus: true,
        };
        return dataSub;
      });
      setEvidenceUpDateData(EvdData);
      setEvidenceModel(true);
    } else {
      const EvdData = data?.evidence?.map((ele: any) => {
        const dataSub = {
          id: ele.id,
          evidenceName: ele.evidenceName,
          evidenceAttachment: [],
          remarks: [],
          accept: false,
          reject: false,
          addButtonStatus: true,
          buttonStatus: true,
        };
        return dataSub;
      });
      setEvidenceUpDateData(EvdData);
      setEvidenceModel(true);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      getProjectAdmins();
      const baselineBars = document.querySelectorAll(".e-baseline-bar");
      baselineBars.forEach((baselineBar: any) => {
        const parentRow = baselineBar.closest(".e-chart-row-cell");
        if (parentRow) {
          const taskbarContainer = parentRow.querySelector(
            ".e-taskbar-main-container"
          );
          if (taskbarContainer) {
            const rowUniqueId = taskbarContainer.getAttribute("rowuniqueid");
            const progressPercentage =
              data.find((item: any) => item.TaskId === rowUniqueId)?.Progress ||
              0;
            baselineBar.innerHTML = "";
            const progressBar = document.createElement("div");
            progressBar.className = "baseline-progress";
            progressBar.style.width = `${100}%`;
            const label = document.createElement("div");
            label.className = "progress-label";
            label.innerText = `${progressPercentage}%`;
            progressBar.appendChild(label);
            baselineBar.appendChild(progressBar);
          } else {
            console.log("No Taskbar Container found for this baseline bar.");
          }
        } else {
          console.log("No parent row found for this baseline bar.");
        }
      });
    }, 10);
    return () => clearTimeout(timeoutId);
  }, [data]);

  const BaseLineUpdater = (data: any) => {
    const baselineBars = document.querySelectorAll(".e-baseline-bar");
    baselineBars.forEach((baselineBar: any) => {
      const parentRow = baselineBar.closest(".e-chart-row-cell");
      if (parentRow) {
        const taskbarContainer = parentRow.querySelector(
          ".e-taskbar-main-container"
        );
        if (taskbarContainer) {
          const rowUniqueId = taskbarContainer.getAttribute("rowuniqueid");
          const progressPercentage =
            data.find((item: any) => item.TaskId === rowUniqueId)?.Progress ||
            0;
          baselineBar.innerHTML = "";
          const progressBar = document.createElement("div");
          progressBar.className = "baseline-progress";
          progressBar.style.width = `${100}%`;
          const label = document.createElement("div");
          label.className = "progress-label";
          label.innerText = `${progressPercentage}%`;
          progressBar.appendChild(label);
          baselineBar.appendChild(progressBar);
        } else {
          console.log("No Taskbar Container found for this baseline bar.");
        }
      } else {
        console.log("No parent row found for this baseline bar.");
      }
    });
  };

  const evidenceModelClose = () => {
    setEvidenceModel(false);
    setEvidenceUpDateData([]);
  };

  useEffect(() => {
    getAllUsersInformation("", "");
    getProjectAdmins();
    // getAllDataGanttView();
    dropDownValueNpdList();
    // dropNpdDptList();
  }, []);

  useEffect(() => {
    // onChangeFilterData(id);
    getProjectAdmins();
  }, [id]);

  const dropDownValueNpdList = () => {
    getAllNPDListDrop()?.then((response: any) => {
      setNpdFilterData(response?.data);
    });
  };

  const getOptionLabel: any = (option: any) => {
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
        response?.data?.map((ele: any) => {
          editingResources.push({
            resourceId: ele?.id,
            resourceName: ele?.username,
          });
        });

        if (activeUserEntityId !== "") {
          const userFilterData = response?.data.filter(
            (item: any) => item.entityId === activeUserEntityId
          );
          setGetAllUserData(userFilterData);
        } else {
          setGetAllUserData(response?.data);
        }
      });
    } catch (e) {
      console.log("error", e);
    }
  };

  const departmentOption = allDepartment
    // ?.filter(
    //   (ele: any) => !data?.map((item: any) => item?.dptId).includes(ele.id)
    // )
    ?.map((item: any) => {
      const data = {
        value: item.id,
        label: item.entityName,
      };
      return data;
    });

  const onSearch = (value: string) => {
    console.log("search:", value);
  };

  const filterOption: any = (
    input: string,
    option?: { label: string; value: string }
  ) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  const openDptModel = () => {
    if (
      npdValueFull === "" ||
      npdValueFull === undefined ||
      npdValueFull === null
    ) {
      enqueueSnackbar(`Please Select NPD`, {
        variant: "error",
      });
    } else {
      setIsDepartment(true);
      getByNpdId(npdValueFull?.value).then((response: any) => {
        setGetByNpdData(response?.data);
        const mapData = data
          ?.filter((ele: any) => ele?.type === "Category")
          ?.map((ele: any) => ({
            value: ele?.stakeHolderId,
            label: ele?.stakeHolderName,
          }));
        setStakeHolderDropList(mapData);
      });
    }
  };

  const closeDptModel = () => {
    setIsDepartment(false);
  };

  const openModelHandler = () => {
    setOpenModel(true);
    setButtonValue(0);
  };
  const closeModelHandler: any = () => {
    setOpenModel(false);
    setFormData({});
    setProgressUpdate([]);
  };

  const openModelUploadHandler = () => {
    setUploadModel(true);
  };
  const closeModelUploadHandler = () => {
    setUploadModel(false);
  };
  const classes = useStyles();
  const ganttRef = useRef(null);

  const ownerList: any = [];

  useEffect(() => {
    getAllDepartment();
    getProjectAdmins();
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

  const getAllDepartment = () => {
    try {
      getAllEntities().then((response: any) => {
        setAllDepartment(response?.data);
      });
    } catch (e) {
      console.log("error", e);
      enqueueSnackbar(`${e}`, {
        variant: "error",
      });
    }
  };

  const change = (args: any): any => {
    const gantt = (document.getElementsByClassName("e-gantt")[0] as any)
      .ej2_instances[0];
    if (args.value == "Grid") {
      setViewMode("Grid");
      // BaseLineUpdater(data);
      gantt.setSplitterPosition("100%", "position");
    } else if (args.value == "Chart") {
      setViewMode("Chart");
      // BaseLineUpdater(data);
      gantt.setSplitterPosition("0%", "position");
    } else {
      gantt.setSplitterPosition("57%", "position");
      // BaseLineUpdater(data);
    }
  };

  const timelineSettings: TimelineSettingsModel = {
    timelineViewMode: timelineMode,
    timelineUnitSize: 33,
    // showTooltip: true,
    //   topTier: {
    //     unit: "Month",
    //     format: "MMM dd, y"
    // },
    // bottomTier: {
    //     unit: "Week",
    //     templateDate:(date:any) => {
    //         let presentDate = new Date(
    //             date.getFullYear(),
    //             date.getMonth(),
    //             date.getDate()
    //         );
    //         var start = new Date(presentDate.getFullYear(), 0, 0);
    //         var diff = Number(presentDate) - Number(start);
    //         var oneDay = 1000 * 60 * 60 * 24;
    //         var day = Math.floor(diff / oneDay);
    //         return day;
    //     }
    //   }
  };

  const labelSettings: any = {
    taskLabel: "${Progress}%",
  };

  // const eventMarkerDay1: Date = new Date("04/04/2024");
  // const eventMarkerDay2: Date = new Date("06/30/2024");
  // const eventMarkerDay3: Date = new Date("09/29/2024");

  const statustemplate = (props: any): any => {
    if (!props || !props.taskData || !props.taskData.Status) {
      return null;
    }
    const sts = Status(props?.taskData?.Status);
    const stsCon = StatusContent(props?.taskData?.Status);
    if (props?.taskData?.Status) {
      return (
        <div className="columnTemplate">
          <div
            style={{
              display: `${sts.display}`,
              padding: `${sts.padding}`,
              gap: `${sts.gap}`,
              width: `${sts.width}`,
              height: `${sts.height}`,
              background: `${sts.background}`,
              borderRadius: `${sts.borderRadius}`,
            }}
          >
            <span
              style={{
                width: `${stsCon.width}`,
                height: `${stsCon.height}`,
                fontStyle: `${stsCon.fontStyle}`,
                fontWeight: `${stsCon.fontWeight}`,
                fontSize: `${stsCon.fontSize}`,
                lineHeight: `${stsCon.lineHeight}`,
                borderRadius: `${stsCon.borderRadius}`,
                color: `${stsCon.color}`,
                padding: `${stsCon.pad}`,
              }}
            >
              {props?.taskData?.Status}
            </span>
          </div>
        </div>
      );
    }
  };

  const prioritytemplate = (props: any): any => {
    if (!props || !props.taskData || !props.taskData.Priority) {
      return null;
    }
    const pri = Priority(props.taskData.Priority);
    const priCon = PriorityContent(props.taskData.Priority);
    if (props.taskData.Priority) {
      return (
        <div className="columnTemplate1">
          <div
            style={{
              display: `${pri.display}`,
              padding: `${pri.padding}`,
              gap: `${pri.gap}`,
              width: `${pri.width}`,
              height: `${pri.height}`,
              background: `${pri.backgroundPri}`,
              borderRadius: `${pri.borderRadius}`,
            }}
          >
            <span
              style={{
                width: `${priCon.width}`,
                height: `${priCon.height}`,
                fontStyle: `${priCon.fontStyle}`,
                fontWeight: `${priCon.fontWeight}`,
                fontSize: `${priCon.fontSize}`,
                lineHeight: `${priCon.lineHeight}`,
                color: `${priCon.color}`,
              }}
            >
              {props.taskData.Priority}
            </span>
          </div>
        </div>
      );
    }
  };

  const columnTemplate = (props: any, index: any) => {
    if (props?.taskData) {
      return (
        <div style={{ display: "flex", gap: "5px" }} key={index}>
          {props?.taskData?.Assignee?.map((item: any) => (
            <span key={index}>{item?.username || ""},</span>
          ))}
        </div>
      );
    } else {
      return "";
    }
  };

  const load = async (): Promise<void> => {
    const themeCollection: any = [
      "bootstrap5",
      "bootstrap",
      "bootstrap4",
      "fluent",
      "fabric",
      "fusionnew",
      "material3",
      "material",
      "highcontrast",
      "tailwind",
    ];
    const cls: any = document.body.className.split(" ");
    theme =
      cls.indexOf("bootstrap5") > 0
        ? "bootstrap5"
        : cls.indexOf("bootstrap") > 0
        ? "bootstrap"
        : cls.indexOf("tailwind") > 0
        ? "tailwind"
        : cls.indexOf("fluent") > 0
        ? "fluent"
        : cls.indexOf("fabric") > 0
        ? "fabric"
        : cls.indexOf("material3") > 0
        ? "material3"
        : cls.indexOf("bootstrap4") > 0
        ? "bootstrap4"
        : cls.indexOf("material") > 0
        ? "material"
        : cls.indexOf("fusionnew") > 0
        ? "fusionnew"
        : cls.indexOf("highcontrast") > 0
        ? "highcontrast"
        : "";
    const check: any = themeCollection.indexOf(theme);
    if (check >= 0) {
      CurrentTheme = true;
    } else {
      CurrentTheme = false;
    }
    // await BaseLineUpdater(data);
  };

  const Status = (status: any): any => {
    switch (status) {
      case "In Progress":
        statusStyleColor = CurrentTheme ? "yellow" : "#fef67b";
        display = "flex";
        padding = "1px 12px";
        gap = "10px";
        width = "96px";
        height = "24px";
        borderRadius = "04px";
        background = statusStyleColor;
        // border= '1px solid #FBF16F'
        break;
      case "Open":
        background = "red";
        color = "white";
        borderRadius = "04px";
        padding = "6px";
        break;
      case "On Hold":
        statusStyleColor = CurrentTheme ? "#000" : "#FB856F";
        display = "flex";
        padding = "1px 12px";
        gap = "10px";
        width = "78px";
        height = "24px";
        borderRadius = "4px";
        background = statusStyleColor;
        break;
      case "Completed":
        statusStyleColor = CurrentTheme ? "green" : "#c3fab3";
        display = "flex";
        padding = "1px 12px";
        gap = "10px";
        width = "98px";
        height = "24px";
        borderRadius = "4px";
        background = statusStyleColor;
        break;
      case "High":
        statusStyleColor = CurrentTheme ? "#000" : "#FB6F85";
        display = "flex";
        padding = "1px 12px";
        gap = "10px";
        width = "55px";
        height = "24px";
        borderRadius = "4px";
        background = statusStyleColor;
        break;
      case "Delayed":
        statusStyleColor = CurrentTheme ? "red" : "#fab3b7";
        display = "flex";
        padding = "1px 12px";
        gap = "10px";
        width = "96px";
        height = "24px";
        borderRadius = "4px";
        background = statusStyleColor;
        break;
    }
    return {
      display: display,
      padding: padding,
      gap: gap,
      width: width,
      height: height,
      borderRadius: borderRadius,
      background: background,
      color: color,
    };
  };

  const StatusContent = (status: any): any => {
    switch (status) {
      case "In Progress":
        statusContentstyleColor = CurrentTheme ? "#fef67b" : "#000";
        width = "72px";
        height = "22px";
        fontStyle = "normal";
        fontWeight = "500";
        fontSize = "12px";
        lineHeight = "20px";
        textAlign = "center";
        color = statusContentstyleColor;
        break;
      case "Open":
        backgroundColor = "red";
        color = "white";
        borderRadius = "15px";
        pad = "6px";
        break;
      case "On Hold":
        statusContentstyleColor = CurrentTheme ? "#FF4500" : "#000";
        width = "54px";
        height = "22px";
        fontStyle = "normal";
        fontWeight = "500";
        fontSize = "12px";
        lineHeight = "20px";
        textAlign = "center";
        color = statusContentstyleColor;
        break;
      case "Completed":
        statusContentstyleColor = CurrentTheme ? "#c3fab3" : "green";
        width = "74px";
        height = "22px";
        fontStyle = "normal";
        fontWeight = "500";
        fontSize = "12px";
        lineHeight = "20px";
        textAlign = "center";
        color = statusContentstyleColor;
        break;
      case "High":
        statusContentstyleColor = CurrentTheme ? "#FF0000" : "#000";
        width = "31px";
        height = "22px";
        fontStyle = "normal";
        fontWeight = "500";
        fontSize = "14px";
        lineHeight = "20px";
        textAlign = "center";
        color = statusContentstyleColor;
        break;
      case "Delayed":
        statusContentstyleColor = CurrentTheme ? "#fab3b7" : "red";
        width = "75px";
        height = "22px";
        fontStyle = "normal";
        fontWeight = "500";
        fontSize = "14px";
        lineHeight = "20px";
        textAlign = "center";
        color = statusContentstyleColor;
        break;
    }
    return {
      width: width,
      height: height,
      fontStyle: fontStyle,
      fontWeight: fontWeight,
      fontSize: fontSize,
      lineHeight: lineHeight,
      textAlign: textAlign,
      color: color,
      backgroundColor: backgroundColor,
      borderRadius: borderRadius,
      pad: pad,
    };
  };

  const Priority = (priority: any): any => {
    switch (priority) {
      case "Low":
        priorityStyle = CurrentTheme ? "#FFF6D1" : "#4078F9";
        display = "flex";
        padding = "1px 12px";
        gap = "10px";
        width = "52px";
        fontSize = "12px";
        color = "#fff";
        height = "24px";
        borderRadius = "24px";
        backgroundPri = priorityStyle;
        break;
      case "Normal":
        priorityStyle = CurrentTheme ? "#F5DFFF" : "#FCB717";
        display = "flex";
        padding = "1px 12px";
        gap = "10px";
        fontSize = "12px";
        color = "#fff";
        width = "73px";
        height = "24px";
        borderRadius = "24px";
        backgroundPri = priorityStyle;
        break;
      case "Critical":
        priorityStyle = CurrentTheme ? "#FFEBE9" : "#FC173A";
        display = "flex";
        padding = "1px 12px";
        gap = "10px";
        fontSize = "12px";
        color = "#fff";
        width = "72px";
        height = "24px";
        borderRadius = "24px";
        backgroundPri = priorityStyle;
        break;
      case "High":
        priorityStyle = CurrentTheme ? "#FFEBE9" : "#FD3B59";
        display = "flex";
        padding = "1px 12px";
        gap = "10px";
        fontSize = "12px";
        color = "#fff";
        width = "55px";
        height = "24px";
        borderRadius = "24px";
        backgroundPri = priorityStyle;
        break;
    }
    return {
      display: display,
      padding: padding,
      gap: gap,
      width: width,
      color: color,
      fontSize: fontSize,
      height: height,
      borderRadius: borderRadius,
      backgroundPri: backgroundPri,
    };
  };

  const PriorityContent = (priority: any): any => {
    switch (priority) {
      case "Low":
        priorityContentStyle = CurrentTheme ? "#70722B" : "#FDFF88";
        width = "28px";
        height = "22px";
        fontStyle = "normal";
        fontWeight = "500";
        fontSize = "12px";
        lineHeight = "20px";
        textAlign = "center";
        color = priorityContentStyle;
        break;
      case "Normal":
        priorityContentStyle = CurrentTheme ? "#7100A6" : "#E3A9FF";
        width = "49px";
        height = "22px";
        fontStyle = "normal";
        fontWeight = "500";
        fontSize = "12px";
        lineHeight = "20px";
        textAlign = "center";
        color = priorityContentStyle;
        break;
      case "Critical":
        priorityContentStyle = CurrentTheme ? "#FF3740" : "#FFB5B8";
        width = "48px";
        height = "22px";
        fontStyle = "normal";
        fontWeight = "500";
        fontSize = "12px";
        lineHeight = "20px";
        textAlign = "center";
        color = priorityContentStyle;
        break;
      case "High":
        priorityContentStyle = CurrentTheme ? "#FF3740" : "#FFB5B8";
        width = "31px";
        height = "22px";
        fontStyle = "normal";
        fontWeight = "500";
        fontSize = "12px";
        lineHeight = "20px";
        textAlign = "center";
        color = priorityContentStyle;
        break;
    }
    return {
      width: width,
      height: height,
      fontStyle: fontStyle,
      fontWeight: fontWeight,
      fontSize: fontSize,
      lineHeight: lineHeight,
      textAlign: textAlign,
      color: color,
    };
  };

  const template: any = columnTemplate.bind(this);
  const statusTemplate: any = statustemplate.bind(this);
  const priorityTemplate: any = prioritytemplate.bind(this);

  const modes: { [key: string]: Object }[] = [
    { ID: "Week", Text: "Week" },
    { ID: "Month", Text: "Month" },
    { ID: "Year", Text: "Year" },
  ];

  const timeLineMode = (args: any) => {
    if (args.value === "Week") {
      setTimelineMode("Week");
      // BaseLineUpdater(data);
    } else if (args.value === "Month") {
      setTimelineMode("Month");
      // BaseLineUpdater(data);
    } else if (args.value === "Year") {
      setTimelineMode("Year");
      // BaseLineUpdater(data);
    }
  };

  const departmentOnChange = (sel: any) => {
    const mode = sel.value.toString();
    setFilterValue(sel.value.toString());
    const filterBy = overAllData?.filter(
      (item: any) => item.dptId === sel?.itemData?.value?.toString()
    );

    const filterByData = overAllData?.filter(
      (item: any) => item.TaskName === sel.value.toString()
    );
    const filterByNpd = overAllData?.filter((item: any) =>
      filterByData?.map((ele: any) => ele.Component).includes(item.TaskName)
    );
    const finalDataFilter = filterBy.concat(filterByNpd);

    setData(finalDataFilter);
    if (sel.value.toString() === "All") {
      setData(overAllData);
    } else {
      setData(finalDataFilter);
    }
  };

  const ownerOnChange = (sel: any) => {
    setFilterUserValue(sel.value.toString());
    const filterBy = overAllData?.filter((item: any) =>
      item.picId
        ?.map((ele: any) => ele)
        ?.includes(sel?.itemData?.value?.toString())
    );
    const filterByData = overAllData?.filter((item: any) =>
      item.Assignee?.map((ele: any) => ele.id).includes(
        sel?.itemData?.value?.toString()
      )
    );
    const filterByNpd = overAllData?.filter((item: any) =>
      filterByData?.map((ele: any) => ele.Component).includes(item.TaskName)
    );
    const finalDataFilter = filterBy.concat(filterByNpd);
    setData(finalDataFilter);
    if (sel.value.toString() === "All") {
      setData(overAllData);
    } else {
      setData(finalDataFilter);
    }
  };

  const toolbarOptions: any = [
    // "Update",
    // "Delete",
    // "Cancel",
    // "Indent",
    // "Outdent",
    //  {
    //   text: "Pdf",
    //   id: "Pdf",
    //   prefixIcon: "e-pdf",
    //   tooltipText: "PdfExport",
    // },
    // "ExpandAll",
    // "CollapseAll",
    {
      text: "ExpandAll",
      id: "ExpandAll",
      template: () => (
        <Button
          icon={<MdZoomOutMap />}
          style={{ backgroundColor: "#EAFAF1", color: "blue" }}
        ></Button>
      ),
      tooltipText: "ExpandAll",
    },
    {
      text: "CollapseAll",
      id: "CollapseAll",
      template: () => (
        <Button
          icon={<AiOutlineFullscreenExit style={{ fontSize: "30px" }} />}
          style={{ backgroundColor: "#EAFAF1", color: "blue" }}
        ></Button>
      ),
      tooltipText: "CollapseAll",
    },
    "Search",
    {
      text: "Excel Export",
      id: "ExcelExport",
      template: () => (
        <Button
          icon={<MdFileCopy />}
          style={{ backgroundColor: "#EAFAF1", color: "green" }}
        ></Button>
      ),
      tooltipText: "Export to Excel",
    },
    {
      text: "PDF Export",
      id: "PdfExport",
      template: () => (
        <Button
          style={{ backgroundColor: "#EAFAF1", color: "red", height: "30px" }}
          icon={<MdPictureAsPdf />}
        ></Button>
      ),
      tooltipText: "Export to PDF",
    },
    {
      type: "Input",
      align: "Right",
      id: "modes",
      tooltipText: "Select View",
      template: new DropDownList({
        dataSource: departmentList,
        width: "150px",
        placeholder: "Department",
        value: filterValue,
        change: departmentOnChange,
        fields: { text: "Text", value: "ID" },
      }),
    },
    {
      type: "Input",
      align: "Right",
      id: "modes",
      tooltipText: "Select View",
      template: new DropDownList({
        dataSource: userList,
        width: "150px",
        placeholder: "Owner",
        value: filterUserValue,
        change: ownerOnChange,
        fields: { text: "Text", value: "ID" },
      }),
    },
    {
      type: "Input",
      align: "Right",
      tooltipText: "Change View",
      template: new DropDownList({
        dataSource: dataList,
        width: "85px",
        placeholder: "View",
        value: viewMode,
        change: change,
        fields: { text: "Text", value: "ID" },
      }),
    },
    {
      type: "Input",
      align: "Right",
      id: "modes",
      tooltipText: "Select View",
      template: new DropDownList({
        dataSource: modes,
        width: "85px",
        placeholder: "Select",
        value: timelineMode,
        change: timeLineMode,
        fields: { text: "Text", value: "ID" },
      }),
    },
  ];

  const fields = { text: "item", value: "id" };

  const editSettings: EditSettingsModel = {
    // allowAdding: true,
    allowEditing: false,
    // allowDeleting: true,
    allowTaskbarEditing: true,
    // showDeleteConfirmDialog: true,
    // mode: "Dialog",
  };

  const uploadFileprops: UploadProps = {
    action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
    multiple: true,
    beforeUpload: () => false,
    onChange({ file, fileList }) {
      setFileList(fileList);
      // setFormData({ ...formData, attachFiles: fileList });
    },
  };

  const clearFile = async (data: any) => {
    try {
      if (data && data?.uid) {
        setFileList((previousFiles) =>
          previousFiles?.filter((item: any) => item.uid !== data.uid)
        );
        //  console.log("filelist after update", fileList);
        // setFormData((prevFormData: any) => ({
        //   ...prevFormData,
        //   attachments: prevFormData?.attachments?.filter(
        //     (item: any) => item.uid !== data.uid
        //   ),
        // }));

        // Assuming data.uid is a valid identifier for your file
        // let result = await axios.post(`${API_LINK}/api/mrm/attachment/delete`, {
        //   path: data.uid,
        // });
        // return result;
      }
    } catch (error) {
      return error;
    }
  };

  const evidenceApplicableAttach = (props: any) => {
    if (props?.taskData?.type === "activity") {
      return (
        <div
          style={{
            display: "flex",
            gap: "6px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* {props.taskData.picId &&
            props.taskData.picId.includes(userDetail.id) && ( */}
          <IconButton
            style={{ margin: "0", height: "30px" }}
            onClick={() => {
              evidenceModelOpen(props?.taskData);
            }}
          >
            <MdFolder
              style={{
                fontSize: "20px",
                color:
                  props?.taskData?.evidence?.filter(
                    (ele: any) => ele?.evidenceAttachment?.length > 0
                  )?.length === 0
                    ? "black"
                    : props?.taskData?.evidence?.filter(
                        (ele: any) => ele?.evidenceAttachment?.length > 0
                      )?.length === props?.taskData?.evidence?.length
                    ? "green"
                    : "#F1C40F",
              }}
            />
          </IconButton>

          <div>
            <span>
              {
                props?.taskData?.evidence?.filter(
                  (ele: any) => ele?.evidenceAttachment?.length > 0
                )?.length
              }
              /{props?.taskData?.evidence?.length} Docs
            </span>
          </div>
        </div>
      );
    } else {
      return "";
    }
  };

  const handleToolbarClick = async (props: any) => {
    console.log("props.taskData ==>", props.taskData);
    openModelHandler();
    setTitleModel("Add");
    handleClose();
    const usersData = await axios.get(API_LINK + `/api/user/getAllUser`);
    const filterBy = usersData?.data?.filter((ele: any) =>
      props?.taskData?.picId?.includes(ele?.id)
    );
    setFormData({
      ...formData,
      deptId: props.taskData?.dptId,
      owner: filterBy,
      stakeHolder: props.taskData?.stakeHolderName,
      type:
        props.taskData?.type === "activity"
          ? "sub activity"
          : props.taskData?.type === "department"
          ? "activity"
          : props.taskData?.type === "sub activity"
          ? "sub activity"
          : "",
    });
  };

  const deleteDataHandler = (props: any) => {
    deleteGanttChartData(props?.taskData?._id).then((response: any) => {
      if (response.status === 200 || response.status === 201) {
        onChangeFilterData(props?.taskData?.npdId);
        setSelectedNpd(props?.taskData?.npdId);
        handleClose();
        enqueueSnackbar(`Deleted successfully!`, {
          variant: "success",
        });
      }
    });
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>, data: any) => {
    setSelectedData(data);
    setAnchorEl(true);
  };

  const handleClose = () => {
    setAnchorEl(false);
  };
  // console.log(
  //   "pa.some((item: any) => item.id === userDetail.id",
  //   pa.some((item: any) => item.id === userDetail.id)
  // );
  const taskNameTemplates = (props: any) => {
    const baselineBars = document.querySelectorAll(".e-baseline-bar");
    data.forEach((item: any) => {
      baselineBars.forEach((progressBar, index) => {
        progressBar.setAttribute("data-key", `${item.TaskId}`);
      });
    });
    return (
      <div
        className={
          props?.taskData?.type === "npd"
            ? "span-taskName-bar-div-npd"
            : "span-taskName-bar-div"
        }
      >
        <span
          style={{
            color:
              props?.taskData?.type === "npd"
                ? "#fb2e2b"
                : props?.taskData?.type === "department"
                ? "#2b40fb"
                : "black",
            width: "200px",
            cursor: "pointer",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {props?.taskData?.type === "Category" ? (
            <>
              {props?.taskData?.TaskName ===
              userDetail?.organization?.realmName ? (
                <>{props?.taskData?.TaskName}</>
              ) : (
                <>
                  {props?.taskData?.TaskName}-({props?.taskData?.category})
                </>
              )}
            </>
          ) : (
            <> {props?.taskData?.TaskName}</>
          )}
        </span>
        <div className="icon-container">
          <div style={{ display: "flex", gap: "5px" }}>
            {(props.taskData?.pm?.includes(userDetail.id) ||
              // props.taskData?.type === "activity" ||
              // props.taskData?.type === "department" &&
              props.taskData?.picId?.includes(userDetail?.id)) && (
              <div>
                <Tooltip
                  title={
                    props.taskData?.type === "activity"
                      ? "Add SubActivity"
                      : props.taskData?.type === "department"
                      ? "Add Activity"
                      : ""
                  }
                >
                  <IconButton
                    style={{ padding: "0px", margin: "0px" }}
                    onClick={() => {
                      handleToolbarClick(props);
                    }}
                  >
                    <MdAddCircleOutline
                      style={{ fontSize: "15px", color: "navyBlue" }}
                    />
                  </IconButton>
                </Tooltip>
              </div>
            )}

            {props.taskData?.pm?.includes(userDetail?.id) ||
            props.taskData?.picId?.includes(userDetail?.id) ? (
              <IconButton
                style={{ padding: "0px", margin: "0px" }}
                onClick={() => handleRowClick(props)} // Reusing handleRowClick for editing
              >
                <img
                  src={EditImgIcon}
                  alt="icon"
                  style={{ width: "15px", height: "15px" }}
                />
              </IconButton>
            ) : (
              <span
                style={{ cursor: "pointer" }}
                onClick={() => handleRowClick(props)}
              >
                <Tooltip title="Click to view Details">
                  <MdVisibility />
                </Tooltip>
              </span>
            )}

            {props.taskData?.pm?.includes(userDetail.id) && (
              // ||
              //   (props.taskData?.type === "sub activity" &&
              //     props?.taskData?.picId?.includes(userDetail?.id))
              <Popconfirm
                placement="top"
                title={"Are you sure to delete Data"}
                onConfirm={() => {
                  deleteDataHandler(props);
                }}
                okText="Yes"
                cancelText="No"
              >
                <IconButton
                  style={{ padding: "0px", margin: "0px" }}
                  //  onClick={() => {
                  //    deleteDataHandler(props);
                  //  }}
                >
                  <img
                    src={DeleteImgIcon}
                    alt="icon"
                    style={{ width: "15px", height: "16px" }}
                  />
                </IconButton>
              </Popconfirm>
            )}
          </div>
        </div>
      </div>
    );
  };

  const eventMarkerDay = new Date(todayDate);

  const actionComplete = (args: any) => {
    if (args.requestType === "openAddDialog") {
      openModelHandler();
    } else if (args.requestType === "openEditDialog") {
      openModelHandler();
    }
  };

  const addDataHandler = (name: any, value: any) => {
    if (name === "isMileStone") {
      setFormData({
        ...formData,
        [name]: value,
        planStartDate: todayDate,
        planEndDate: todayDate,
      });
    } else if (name === "planStartDate") {
      if (formData?.isMileStone === true) {
        setFormData({
          ...formData,
          planStartDate: value,
          planEndDate: value,
        });
      } else {
        setFormData({
          ...formData,
          [name]: value,
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const filterByParentId = data?.filter(
    (item: any) => item?.TaskId === selectedData?.taskData?.ParentId
  );

  const uploadFilepropsPPAP = (data: any): UploadProps => ({
    action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
    multiple: true,
    beforeUpload: () => false,
    async onChange({ file, fileList }) {
      const newFormData = new FormData();
      fileList.forEach((file: any) => {
        newFormData.append("files", file.originFileObj, file.name);
      });
      const result = await axios.post(
        API_LINK + `/api/pcr/addAttachMents?realm=${realmName}`,
        newFormData
      );
      if (result.status === 200 || result.status === 201) {
        const update = evidenceData?.map((item: any) => {
          if (item.id === data.id) {
            return {
              ...item,
              evidenceAttachment: [...item.files, result?.data]?.flat(),
            };
          }
          return item;
        });
        setEvidenceData(update);
        enqueueSnackbar("Files Uploaded successfully", {
          variant: "success",
        });
      }
    },
  });

  const uploadFileProps = (): UploadProps => ({
    action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
    multiple: true,
    beforeUpload: () => false,
    async onChange({ file, fileList }) {
      const newFormData = new FormData();
      fileList.forEach((file: any) => {
        newFormData.append("files", file.originFileObj, file.name);
      });
      const result = await axios.post(
        API_LINK +
          `/api/configuration/addMultipleAttachments?realm=${realmName}`,
        newFormData
      );
      if (result.status === 200 || result.status === 201) {
        setAddMessage({
          ...addMessage,
          attachment: [...addMessage?.attachment, result?.data]?.flat(),
        });
        enqueueSnackbar("Files Uploaded successfully", {
          variant: "success",
        });
      }
    },
  });

  const readMsgHandler = (e: any) => {
    setAddMessage({
      ...addMessage,
      remarks: e,
      user: userInfo?.username,
    });
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

  const addSubmitMsgHandler = (type: any, data: any) => {
    setAddMessage({});
    if (type === "evidence") {
      const updateData = evidenceUpDateData?.map((ele: any) => {
        if (ele?.id === data?.id) {
          return {
            ...ele,
            remarks: [...ele?.remarks, addMessage],
          };
        }
        return ele;
      });
      setEvidenceUpDateData(updateData);
    } else {
      setRemarksData([...remarksData, addMessage]);
      setFormData({
        ...formData,
        remarks: [...formData?.remarks, addMessage],
      });
    }
  };

  const [dataEditTask, setDataEditTask] = useState<any>();

  const parentTaskLength = data?.filter(
    (ele: any) => ele?.ParentId === editTaskData?.TaskId
  );

  console.log("parentTaskLength", parentTaskLength);
  const handleRowClick = async (props: any) => {
    if (
      props?.taskData?.type === "Category" ||
      props?.taskData?.type === "department"
    ) {
      setReadMode(true);
    } else if (
      props?.taskData?.type === "activity" ||
      (props?.taskData?.type === "sub activity" &&
        parentTaskLength?.length > 0 &&
        props?.taskData?.pm?.includes(userDetail?.id)) ||
      props?.taskData?.picId?.includes(userDetail?.id)
    ) {
      setReadMode(true);
    } else if (props?.taskData?.pm?.includes(userDetail?.id)) {
      setReadMode(false);
    } else {
      setReadMode(true);
    }
    props?.taskData?.picId?.includes(userDetail?.id)
      ? setDisable(false)
      : setDisable(true);
    // props?.taskData?.picId.includes(userDetail?.id) ||
    // props?.taskData?.pm?.includes(userDetail?.id)
    //   ? setSaveDisable(false)
    //   : setSaveDisable(true);
    if (props?.taskData) {
      openModelHandler();
      setTitleModel("Edit");
      setButtonValue(0);
      handleClose();
      setDataEditTask(props?.taskData);
      setProgressUpdate(props?.taskData?.progressData || []);
      const usersData = await axios.get(API_LINK + `/api/user/getAllUser`);
      const filterBy = usersData?.data?.filter((ele: any) =>
        props?.taskData?.picId?.includes(ele?.id)
      );
      setFormData({
        parentStatus: parentTaskLength?.length > 0 ? true : false,
        paStatus: props?.taskData?.paStatus,
        type: props?.taskData?.type,
        name: props?.taskData?.TaskName,
        isMileStone: props?.taskData?.isMileStone,
        planStartDate: await dateConvert(props?.taskData?.StartDate),
        planEndDate: await dateConvert(props?.taskData?.EndDate),
        BaselineStartDate:
          props?.taskData?.BaselineStartDate === null
            ? ""
            : await dateConvert(props?.taskData?.BaselineStartDate),
        BaselineEndDate:
          props?.taskData?.BaselineEndDate === null
            ? ""
            : await dateConvert(props?.taskData?.BaselineEndDate),
        duration: props?.taskData?.Duration,
        owner: filterBy,
        dependency: props?.taskData?.ParentId,
        status: props?.taskData?.Status,
        progress: props?.taskData?.Progress,
        evidence: props?.taskData?.evidence,
        remarks: props?.taskData?.remarks,
        priority: props?.taskData?.Priority,
        stakeHolder: props?.taskData?.stakeHolderName,
        deptId: props?.taskData?.dptId,
        planFreeze: props?.taskData?.planFreeze,
      });
      setRemarksData(props?.taskData?.remarks);
      if (props?.taskData?.evidence?.length !== 0) {
        setEvidenceData(props?.taskData?.evidence);
      }
    }
    if (
      props?.taskData?.evidence
        ?.map((ele: any) => ele.accept)
        ?.includes(true) ||
      props?.taskData?.evidence?.map((ele: any) => ele.reject)?.includes(true)
    ) {
      const EvdData = props?.taskData?.evidence?.map((ele: any) => {
        const dataSub = {
          id: ele.id,
          evidenceName: ele.evidenceName,
          evidenceAttachment: ele.evidenceAttachment,
          remarks: ele.remarks,
          accept: ele.accept,
          reject: ele.reject,
          addButtonStatus: true,
          buttonStatus: true,
        };
        return dataSub;
      });
      setEvidenceUpDateData(EvdData);
    } else {
      const EvdData = props?.taskData?.evidence?.map((ele: any) => {
        const dataSub = {
          id: ele.id,
          evidenceName: ele?.evidenceName,
          evidenceAttachment: [],
          remarks: [],
          accept: false,
          reject: false,
          addButtonStatus: true,
          buttonStatus: true,
        };
        return dataSub;
      });
      setEvidenceUpDateData(EvdData);
    }
  };

  const planStartDate = Date.parse(formData?.planEndDate);
  const planEndDate = Date.parse(formData?.planStartDate);
  const timeDifference = planStartDate - planEndDate;
  const dayDifference = Math?.ceil(timeDifference / (1000 * 3600 * 24));

  const dateConvert = async (dateString: any) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const closeModelRow = () => {
    closeModelHandler();
  };

  const barClickingHandler = (args: any) => {
    if (args.item.id === "PdfExport") {
      const exportProperties: PdfExportProperties = {
        fileName: "new.pdf",
      };
      ganttInstance.pdfExport(exportProperties);
    }
    if (args.item.id === "ExcelExport") {
      const excelExportProperties: ExcelExportProperties = {
        dataSource: data,
      };
      ganttInstance.excelExport(excelExportProperties);
    }
    if (args.item.id === "ExpandAll") {
      ganttInstance?.expandAll();
    }
    if (args.item.id === "CollapseAll") {
      ganttInstance?.collapseAll();
    }
    console.log("args", args);
    // if(args.item.id === "Add"){
    //  if(selectedData === undefined){
    //   enqueueSnackbar(`Please Select Task and Add`, {
    //     variant: "error",
    //   });
    //  }else{
    //   handleToolbarClick(selectedData);
    //  }
    // }
    // if(args.item.id === "Delete"){
    //   if(selectedData === undefined){
    //     enqueueSnackbar(`Please Select Task and Delete`, {
    //       variant: "error",
    //     });
    //    }else{
    //     deleteDataHandler(selectedData);
    //    }
    // }
  };

  const handleRowSelecting = (args: any) => {
    setEditTaskData(args?.data?.taskData);
    setSelectedData(args?.data);
    // rowIconsShower(args?.data);
    // const workingDays = ganttInstance.current.workWeek;
    const workingDays = ganttInstance?.editModule;
    console.log("Working Days:", args, workingDays);
  };

  const rowDragStartHelper = (args: any) => {
    const isDraggable = args?.data?.[0]?.taskData?.isDraggable;
    if (isDraggable === false) {
      args.cancel = true;
    } else {
    }
  };

  const rowDragIconRender = (args: any) => {
    const isDraggable = args?.data?.taskData?.isDraggable;
    if (isDraggable === false) {
      const dragIcon = args.row.querySelector(".e-icon-rowdragicon");
      if (dragIcon) {
        dragIcon.style.display = "none";
      }
    }
    const baselineBars = document.querySelectorAll(".e-baseline-bar");
    baselineBars.forEach((baselineBar: any) => {
      const parentRow = baselineBar.closest(".e-chart-row-cell");
      if (parentRow) {
        const taskbarContainer = parentRow.querySelector(
          ".e-taskbar-main-container"
        );
        if (taskbarContainer) {
          const rowUniqueId = taskbarContainer.getAttribute("rowuniqueid");
          const progressPercentage =
            data.find((item) => item.TaskId === rowUniqueId)?.Progress || 0;
          baselineBar.innerHTML = "";
          const progressBar = document.createElement("div");
          progressBar.className = "baseline-progress";
          progressBar.style.width = `${100}%`;
          const label = document.createElement("div");
          label.className = "progress-label";
          label.innerText = `${progressPercentage}%`;
          progressBar.appendChild(label);
          baselineBar.appendChild(progressBar);
        } else {
          console.log("No Taskbar Container found for this baseline bar.");
        }
      }
    });
  };

  const updateEvdValuesByChart = (data: any) => {
    setEvdEditStatus(false);
    setEvdEditId("");
    const updateData = evidenceUpDateData?.map((item: any) => {
      if (item.id === data.id) {
        return {
          ...item,
          addButtonStatus: true,
          buttonStatus: true,
        };
      }
      return item;
    });
    setEvidenceUpDateData(updateData);
  };

  const addEvdMoreAddHoc = () => {
    const data = {
      id: uniqueId,
      evidenceName: "",
      evidenceAttachment: [],
      remarks: [],
      accept: false,
      reject: false,
      addButtonStatus: true,
      buttonStatus: false,
    };
    setEvidenceUpDateData([...evidenceUpDateData, data]);
    setEvdEditStatus(true);
    setEvdEditId(data.id);
  };

  const updateEditEvdValues = (data: any) => {
    setEvdEditStatus(true);
    setEvdEditId(data.id);
    const updateData = evidenceUpDateData?.map((item: any) => {
      if (item.id === data.id) {
        return {
          ...item,
          buttonStatus: false,
        };
      }
      return item;
    });
    setEvidenceUpDateData(updateData);
  };

  const deleteEditEvdValues = (data: any) => {
    const updateData = evidenceUpDateData?.filter(
      (item: any) => item.id !== data.id
    );
    setEvidenceUpDateData(updateData);
  };

  const addEditEvdValues = (data: any) => {
    const updateData = evidenceUpDateData?.map((item: any) => {
      if (item.id === data.id) {
        return {
          ...item,
          buttonStatus: true,
        };
      }
      return item;
    });
    setEvidenceUpDateData(updateData);
  };
  const uploadFilepropsEvdUpDate = (data: any): UploadProps => ({
    action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
    multiple: true,
    beforeUpload: () => false,
    async onChange({ file, fileList }) {
      const newFormData = new FormData();
      fileList.forEach((file: any) => {
        newFormData.append("files", file.originFileObj, file.name);
      });
      const result = await axios.post(
        API_LINK +
          `/api/configuration/addMultipleAttachments?realm=${realmName}`,
        newFormData
      );
      if (result.status === 200 || result.status === 201) {
        const update = evidenceUpDateData?.map((item: any) => {
          if (item.id === data.id) {
            return {
              ...item,
              evidenceAttachment: [
                ...item.evidenceAttachment,
                result?.data,
              ]?.flat(),
            };
          }
          return item;
        });
        setEvidenceUpDateData(update);
        enqueueSnackbar("Files Uploaded successfully", {
          variant: "success",
        });
      }
    },
  });

  const updateEvdUpDateAccept = (data: any, name: any, value: any) => {
    const updateData = evidenceUpDateData?.map((item: any) => {
      if (item.id === data.id) {
        return {
          ...item,
          [name]: value,
          buttonStatus: false,
        };
      }
      return item;
    });
    setEvidenceUpDateData(updateData);
  };

  const submitHandlerDept = () => {
    const findByCategory = getByNpdData?.departmentData?.find(
      (ele: any) => ele?.id === departmentAddForm?.stakeHolder?.value
    );
    const payload = {
      ...departmentAddForm,
      departmentData: departmentDataTable,
      npdId: npdValueFull?.value,
      npdName: npdValueFull?.label,
      category: findByCategory?.category,
    };
    createNpdManyGanttChart(payload).then((response: any) => {
      if (response.status === 200 || response.status === 201) {
        enqueueSnackbar(`Data Added SuccessFully`, {
          variant: "success",
        });
        closeDptModel();
        setDepartmentAddForm({});
        setDepartmentDataTable([]);
        onChangeFilterData(npdValueFull?.value);
        // getAllDataGanttView();
      }
    });
  };

  // console.log("evidenceData",evidenceData, evidenceUpDateData)
  const findingChildTaskData = data?.filter(
    (ele: any) => ele?.TaskId === dataEditTask?.ParentId
  );

  const addTaskData = async (titleModel: any) => {
    const dataPayloadActivity = {
      BaselineStartDate: formData.BaselineStartDate,
      BaselineEndDate: formData.BaselineEndDate,
      Status: formData.status,
      EndDate: formData.planEndDate,
      type: formData.type,
    };
    const statusActivity = await handlerGanttTaskStatus(dataPayloadActivity);
    // if(statusActivity){
    if (titleModel === "Add") {
      if (pa?.map((ele: any) => ele?.id)?.includes(userInfo?.id)) {
        if (formData.type === "activity") {
          if (
            formData?.name === "" ||
            formData?.name === undefined ||
            formData?.name === null
          ) {
            enqueueSnackbar("Please Enter Task Name", {
              variant: "error",
            });
          } else if (
            formData.owner?.length === 0 ||
            formData.owner === undefined ||
            formData.owner === null
          ) {
            enqueueSnackbar("Please Select Owner", {
              variant: "error",
            });
          } else if (
            formData.planStartDate === "" ||
            formData.planStartDate === undefined ||
            formData.planStartDate === null
          ) {
            enqueueSnackbar("Please Select Plan Start Date", {
              variant: "error",
            });
          } else if (
            formData.planEndDate === "" ||
            formData.planEndDate === undefined ||
            formData.planEndDate === null
          ) {
            enqueueSnackbar("Please Select Plan End Date", {
              variant: "error",
            });
          } else if (
            formData.priority === "" ||
            formData.priority === undefined ||
            formData.priority === null
          ) {
            enqueueSnackbar("Please Select Priority", {
              variant: "error",
            });
          }
          // else if(formData.isMileStone === true && new Date(formData.planStartDate) !== new Date(formData.planEndDate)){
          //   enqueueSnackbar("Please Select MileStone Start Date and End Date Same Date", {
          //     variant: "error",
          //   });
          // }
          else {
            const pms = pa.map((item: any) => item.id);
            const data = {
              TaskId: `${uniqueId}-${selectedData?.taskData?.npdId}-${selectedData?.taskData?.stakeHolderId}`,
              pm: pms,
              TaskName: formData.name,
              StartDate: formData.planStartDate,
              EndDate: formData.planEndDate,
              TimeLog: dayDifference,
              Work: 0,
              Progress: formData.progress,
              Status: formData.status,
              ParentId: selectedData?.taskData?.TaskId,
              Priority: formData.priority,
              Component: selectedData?.taskData?.TaskName,
              type: formData.type,
              npdId: selectedData?.taskData?.npdId,
              dptId: selectedData?.taskData?.dptId,
              picId: selectedData?.taskData?.picId,
              category: selectedData?.taskData?.category,
              stakeHolderId: selectedData?.taskData?.stakeHolderId,
              stakeHolderName: selectedData?.taskData?.stakeHolderName,
              BaselineStartDate: formData.BaselineStartDate,
              BaselineEndDate: formData.BaselineEndDate,
              isSelection: "false",
              evidence: evidenceData,
              remarks: remarksData,
              progressData: progressUpdate,
              isMileStone: formData.isMileStone,
              isDraggable: true,
            };
            createNpdGanttChart(data).then((response: any) => {
              if (response.status === 200 || response.status === 201) {
                enqueueSnackbar(`Data Updated SuccessFully`, {
                  variant: "success",
                });
                // getAllDataGanttView();
                const dataPayload = {
                  ...data,
                  StartDate: formData.planStartDate
                    ? new Date(formData.planStartDate)
                    : null,
                  EndDate: formData.planEndDate
                    ? new Date(formData.planEndDate)
                    : null,
                  BaselineStartDate: formData.BaselineStartDate
                    ? new Date(formData.BaselineStartDate)
                    : null,
                  BaselineEndDate: formData.BaselineEndDate
                    ? new Date(formData.BaselineEndDate)
                    : null,
                  Status: statusActivity,
                  Progress: Number(formData.progress),
                };
                ganttInstance?.editModule?.addRecord(
                  dataPayload,
                  "Below",
                  selectedData?.taskData?.TaskId,
                  true
                );
                ganttInstance.dataSource = [
                  ...ganttInstance?.dataSource,
                  dataPayload,
                ];
                ganttInstance?.selectRow(selectedData?.taskData?.TaskId);
                // ganttInstance.refresh();
                // onChangeFilterData(selectedData?.taskData?.npdId);
                buttonStatusFreeze(selectedData?.taskData?.npdId);
                // setNpdValueFull(selectedData?.taskData?.npdId);
                setSelectedNpd(selectedData?.taskData?.npdId);
                setProgressUpdate([]);
                closeModelRow();
                setFormData({});
                setRemarksData([]);
                setEvidenceData([]);
              }
            });
          }
        } else if (formData.type === "sub activity") {
          if (
            formData?.name === "" ||
            formData?.name === undefined ||
            formData?.name === null
          ) {
            enqueueSnackbar("Please Enter Task Name", {
              variant: "error",
            });
          } else if (
            formData.owner?.length === 0 ||
            formData.owner === undefined ||
            formData.owner === null
          ) {
            enqueueSnackbar("Please Select Owner", {
              variant: "error",
            });
          } else if (
            formData.planStartDate === "" ||
            formData.planStartDate === undefined ||
            formData.planStartDate === null
          ) {
            enqueueSnackbar("Please Select Plan Start Date", {
              variant: "error",
            });
          } else if (
            formData.planEndDate === "" ||
            formData.planEndDate === undefined ||
            formData.planEndDate === null
          ) {
            enqueueSnackbar("Please Select Plan End Date", {
              variant: "error",
            });
          } else if (
            formData.priority === "" ||
            formData.priority === undefined ||
            formData.priority === null
          ) {
            enqueueSnackbar("Please Select Priority", {
              variant: "error",
            });
          }
          // else if(formData.isMileStone === true && new Date(formData.planStartDate) !== new Date(formData.planEndDate)){
          //   enqueueSnackbar("Please Select MileStone Start Date and End Date Same Date", {
          //     variant: "error",
          //   });
          // }
          else {
            const pms = pa.map((item: any) => item.id);
            const data = {
              TaskId: `${uniqueId}-${selectedData?.taskData?.npdId}-${selectedData?.taskData?.stakeHolderId}`,
              pm: pms,
              TaskName: formData.name,
              StartDate: formData.planStartDate,
              EndDate: formData.planEndDate,
              TimeLog: dayDifference,
              Work: 0,
              Progress: formData.progress,
              Status: formData.status,
              ParentId: selectedData?.taskData?.TaskId,
              Priority: formData.priority,
              Component: selectedData?.taskData?.TaskName,
              type: formData.type,
              npdId: selectedData?.taskData?.npdId,
              dptId: selectedData?.taskData?.dptId,
              picId: selectedData?.taskData?.picId,
              category: selectedData?.taskData?.category,
              stakeHolderId: selectedData?.taskData?.stakeHolderId,
              stakeHolderName: selectedData?.taskData?.stakeHolderName,
              BaselineStartDate: formData.BaselineStartDate,
              BaselineEndDate: formData.BaselineEndDate,
              isSelection: "false",
              evidence: evidenceData,
              remarks: remarksData,
              progressData: progressUpdate,
              isMileStone: formData.isMileStone,
              isDraggable: true,
            };
            createNpdGanttChart(data).then((response: any) => {
              if (response.status === 200 || response.status === 201) {
                enqueueSnackbar(`Data Updated SuccessFully`, {
                  variant: "success",
                });
                // getAllDataGanttView();
                const dataPayload = {
                  ...data,
                  StartDate: formData.planStartDate
                    ? new Date(formData.planStartDate)
                    : null,
                  EndDate: formData.planEndDate
                    ? new Date(formData.planEndDate)
                    : null,
                  BaselineStartDate: formData.BaselineStartDate
                    ? new Date(formData.BaselineStartDate)
                    : null,
                  BaselineEndDate: formData.BaselineEndDate
                    ? new Date(formData.BaselineEndDate)
                    : null,
                  Status: statusActivity,
                  Progress: Number(formData.progress),
                };
                ganttInstance?.editModule?.addRecord(
                  dataPayload,
                  "Below",
                  selectedData?.taskData?.TaskId,
                  true
                );
                ganttInstance.dataSource = [
                  ...ganttInstance?.dataSource,
                  dataPayload,
                ];
                ganttInstance?.selectRow(selectedData?.taskData?.TaskId);
                // onChangeFilterData(selectedData?.taskData?.npdId);
                buttonStatusFreeze(selectedData?.taskData?.npdId);
                // setNpdValueFull(selectedData?.taskData?.npdId);
                setSelectedNpd(selectedData?.taskData?.npdId);
                setProgressUpdate([]);
                closeModelRow();
                setFormData({});
                setRemarksData([]);
                setEvidenceData([]);
              }
            });
          }
        }
      } else if (
        formData.owner?.map((ele: any) => ele?.id)?.includes(userInfo?.id)
      ) {
        if (formData.type === "activity") {
          if (
            formData?.name === "" ||
            formData?.name === undefined ||
            formData?.name === null
          ) {
            enqueueSnackbar("Please Enter Task Name", {
              variant: "error",
            });
          } else if (
            formData.owner?.length === 0 ||
            formData.owner === undefined ||
            formData.owner === null
          ) {
            enqueueSnackbar("Please Select Owner", {
              variant: "error",
            });
          } else if (
            formData.planStartDate === "" ||
            formData.planStartDate === undefined ||
            formData.planStartDate === null
          ) {
            enqueueSnackbar("Please Select Plan Start Date", {
              variant: "error",
            });
          } else if (
            formData.planEndDate === "" ||
            formData.planEndDate === undefined ||
            formData.planEndDate === null
          ) {
            enqueueSnackbar("Please Select Plan End Date", {
              variant: "error",
            });
          } else if (
            formData.priority === "" ||
            formData.priority === undefined ||
            formData.priority === null
          ) {
            enqueueSnackbar("Please Select Priority", {
              variant: "error",
            });
          }
          // else if(formData.isMileStone === true && new Date(formData.planStartDate) !== new Date(formData.planEndDate)){
          //   enqueueSnackbar("Please Select MileStone Start Date and End Date Same Date", {
          //     variant: "error",
          //   });
          // }
          else {
            const pms = pa.map((item: any) => item.id);
            const data = {
              TaskId: `${uniqueId}-${selectedData?.taskData?.npdId}-${selectedData?.taskData?.stakeHolderId}`,
              pm: pms,
              TaskName: formData.name,
              StartDate: formData.planStartDate,
              EndDate: formData.planEndDate,
              TimeLog: dayDifference,
              Work: 0,
              Progress: formData.progress,
              Status: formData.status,
              ParentId: selectedData?.taskData?.TaskId,
              Priority: formData.priority,
              Component: selectedData?.taskData?.TaskName,
              type: formData.type,
              npdId: selectedData?.taskData?.npdId,
              dptId: selectedData?.taskData?.dptId,
              picId: selectedData?.taskData?.picId,
              category: selectedData?.taskData?.category,
              stakeHolderId: selectedData?.taskData?.stakeHolderId,
              stakeHolderName: selectedData?.taskData?.stakeHolderName,
              BaselineStartDate: formData.BaselineStartDate,
              BaselineEndDate: formData.BaselineEndDate,
              isSelection: "false",
              evidence: evidenceData,
              remarks: remarksData,
              progressData: progressUpdate,
              isMileStone: formData.isMileStone,
              isDraggable: true,
            };
            createNpdGanttChart(data).then((response: any) => {
              if (response.status === 200 || response.status === 201) {
                enqueueSnackbar(`Data Updated SuccessFully`, {
                  variant: "success",
                });
                // getAllDataGanttView();
                const dataPayload = {
                  ...data,
                  StartDate: formData.planStartDate
                    ? new Date(formData.planStartDate)
                    : null,
                  EndDate: formData.planEndDate
                    ? new Date(formData.planEndDate)
                    : null,
                  BaselineStartDate: formData.BaselineStartDate
                    ? new Date(formData.BaselineStartDate)
                    : null,
                  BaselineEndDate: formData.BaselineEndDate
                    ? new Date(formData.BaselineEndDate)
                    : null,
                  Status: statusActivity,
                  Progress: Number(formData.progress),
                };
                ganttInstance?.editModule?.addRecord(
                  dataPayload,
                  "Below",
                  selectedData?.taskData?.TaskId,
                  true
                );
                ganttInstance.dataSource = [
                  ...ganttInstance?.dataSource,
                  dataPayload,
                ];
                ganttInstance?.selectRow(selectedData?.taskData?.TaskId);
                // ganttInstance.refresh();
                // onChangeFilterData(selectedData?.taskData?.npdId);
                buttonStatusFreeze(selectedData?.taskData?.npdId);
                // setNpdValueFull(selectedData?.taskData?.npdId);
                setSelectedNpd(selectedData?.taskData?.npdId);
                setProgressUpdate([]);
                closeModelRow();
                setFormData({});
                setRemarksData([]);
                setEvidenceData([]);
              }
            });
          }
        } else if (formData.type === "sub activity") {
          if (
            formData?.name === "" ||
            formData?.name === undefined ||
            formData?.name === null
          ) {
            enqueueSnackbar("Please Enter Task Name", {
              variant: "error",
            });
          } else if (
            formData.owner?.length === 0 ||
            formData.owner === undefined ||
            formData.owner === null
          ) {
            enqueueSnackbar("Please Select Owner", {
              variant: "error",
            });
          } else if (
            formData.planStartDate === "" ||
            formData.planStartDate === undefined ||
            formData.planStartDate === null
          ) {
            enqueueSnackbar("Please Select Plan Start Date", {
              variant: "error",
            });
          } else if (
            formData.planEndDate === "" ||
            formData.planEndDate === undefined ||
            formData.planEndDate === null
          ) {
            enqueueSnackbar("Please Select Plan End Date", {
              variant: "error",
            });
          } else if (
            formData.priority === "" ||
            formData.priority === undefined ||
            formData.priority === null
          ) {
            enqueueSnackbar("Please Select Priority", {
              variant: "error",
            });
          }
          // else if(formData.isMileStone === true && new Date(formData.planStartDate) !== new Date(formData.planEndDate)){
          //   enqueueSnackbar("Please Select MileStone Start Date and End Date Same Date", {
          //     variant: "error",
          //   });
          // }
          else {
            const pms = pa.map((item: any) => item.id);
            const data = {
              TaskId: `${uniqueId}-${selectedData?.taskData?.npdId}-${selectedData?.taskData?.stakeHolderId}`,
              pm: pms,
              TaskName: formData.name,
              StartDate: formData.planStartDate,
              EndDate: formData.planEndDate,
              TimeLog: dayDifference,
              Work: 0,
              Progress: formData.progress,
              Status: formData.status,
              ParentId: selectedData?.taskData?.TaskId,
              Priority: formData.priority,
              Component: selectedData?.taskData?.TaskName,
              type: formData.type,
              npdId: selectedData?.taskData?.npdId,
              dptId: selectedData?.taskData?.dptId,
              picId: selectedData?.taskData?.picId,
              category: selectedData?.taskData?.category,
              stakeHolderId: selectedData?.taskData?.stakeHolderId,
              stakeHolderName: selectedData?.taskData?.stakeHolderName,
              BaselineStartDate: formData.BaselineStartDate,
              BaselineEndDate: formData.BaselineEndDate,
              isSelection: "false",
              evidence: evidenceData,
              remarks: remarksData,
              progressData: progressUpdate,
              isMileStone: formData.isMileStone,
              isDraggable: true,
            };
            createNpdGanttChart(data).then((response: any) => {
              if (response.status === 200 || response.status === 201) {
                enqueueSnackbar(`Data Updated SuccessFully`, {
                  variant: "success",
                });
                // getAllDataGanttView();
                const dataPayload = {
                  ...data,
                  StartDate: formData.planStartDate
                    ? new Date(formData.planStartDate)
                    : null,
                  EndDate: formData.planEndDate
                    ? new Date(formData.planEndDate)
                    : null,
                  BaselineStartDate: formData.BaselineStartDate
                    ? new Date(formData.BaselineStartDate)
                    : null,
                  BaselineEndDate: formData.BaselineEndDate
                    ? new Date(formData.BaselineEndDate)
                    : null,
                  Status: statusActivity,
                  Progress: Number(formData.progress),
                };
                ganttInstance?.editModule?.addRecord(
                  dataPayload,
                  "Below",
                  selectedData?.taskData?.TaskId,
                  true
                );
                ganttInstance.dataSource = [
                  ...ganttInstance?.dataSource,
                  dataPayload,
                ];
                ganttInstance?.selectRow(selectedData?.taskData?.TaskId);
                // onChangeFilterData(selectedData?.taskData?.npdId);
                buttonStatusFreeze(selectedData?.taskData?.npdId);
                // setNpdValueFull(selectedData?.taskData?.npdId);
                setSelectedNpd(selectedData?.taskData?.npdId);
                setProgressUpdate([]);
                closeModelRow();
                setFormData({});
                setRemarksData([]);
                setEvidenceData([]);
              }
            });
          }
        }
      }
    } else {
      if (formData?.type === "department") {
        const payload = {
          StartDate: formData.planStartDate,
          EndDate: formData.planEndDate,
          TimeLog: dayDifference,
          Work: "0",
          Assignee: formData.owner,
          Progress: formData.progress,
          Status: formData.status,
          ParentId: dataEditTask?.ParentId,
          Priority: formData.priority,
          Component: dataEditTask?.Component,
          type: formData.type,
          BaselineStartDate: formData.BaselineStartDate,
          BaselineEndDate: formData.BaselineEndDate,
          isSelection: "false",
          // evidence: evidenceData,
          remarks: formData?.remarks,
          progressData: progressUpdate,
          isMileStone: formData.isMileStone,
        };
        updateTaskGanttTask(dataEditTask?._id, payload).then(
          (response: any) => {
            if (response.status === 200 || response.status === 201) {
              const picIds: string[] =
                formData?.owner
                  ?.map((ele: any) => ele?.id)
                  .filter((id: any) => id !== null && id !== undefined)
                  .map(String) || [];

              const payLoadData = {
                dptId: selectedData?.taskData?.dptId,
                picId: picIds,
              };
              updateManyGanttChartPic(payLoadData).then((response: any) => {
                if (response.status === 200 || response.status === 201) {
                  enqueueSnackbar(`Data Updated SuccessFully`, {
                    variant: "success",
                  });
                  // updateManyTaskGanttTask(dataEditTask?._id, payload).then((response:any)=>{
                  // })
                  closeModelRow();
                  setFormData({});
                  setRemarksData([]);
                  setEvidenceData([]);
                  // getAllDataGanttView();
                  onChangeFilterData(selectedData?.taskData?.npdId);
                  buttonStatusFreeze(selectedData?.taskData?.npdId);
                  // setNpdValueFull(selectedData?.taskData?.npdId)
                  setSelectedNpd(selectedData?.taskData?.npdId);
                  setProgressUpdate([]);
                }
              });
            }
          }
        );
      } else if (formData?.type === "activity") {
        if (findingChildTaskData?.length === 0) {
          if (
            pa?.map((ele: any) => ele?.id)?.includes(userInfo?.id) &&
            formData.owner?.map((ele: any) => ele?.id)?.includes(userInfo?.id)
          ) {
            if (
              formData?.name === "" ||
              formData?.name === undefined ||
              formData?.name === null
            ) {
              enqueueSnackbar("Please Enter Task Name", {
                variant: "error",
              });
            } else if (
              formData.owner?.length === 0 ||
              formData.owner === undefined ||
              formData.owner === null
            ) {
              enqueueSnackbar("Please Select Owner", {
                variant: "error",
              });
            } else if (
              formData.planStartDate === "" ||
              formData.planStartDate === undefined ||
              formData.planStartDate === null
            ) {
              enqueueSnackbar("Please Select Plan Start Date", {
                variant: "error",
              });
            } else if (
              formData.planEndDate === "" ||
              formData.planEndDate === undefined ||
              formData.planEndDate === null
            ) {
              enqueueSnackbar("Please Select Plan End Date", {
                variant: "error",
              });
            } else if (
              formData.priority === "" ||
              formData.priority === undefined ||
              formData.priority === null
            ) {
              enqueueSnackbar("Please Select Priority", {
                variant: "error",
              });
            } else if (
              formData.BaselineStartDate === "" ||
              formData.BaselineStartDate === undefined ||
              formData.BaselineStartDate === null
            ) {
              enqueueSnackbar("Please Select Task Start Date", {
                variant: "error",
              });
            } else if (
              progressUpdate[progressUpdate?.length - 1]?.progressComment === ""
            ) {
              enqueueSnackbar(
                "Please Enter Progress Updation History Status Update",
                {
                  variant: "error",
                }
              );
            } else if (
              progressUpdate[progressUpdate?.length - 1]?.updatedDate === ""
            ) {
              enqueueSnackbar(
                "Please Enter Progress Updation History Status updated Date",
                {
                  variant: "error",
                }
              );
            } else if (
              progressUpdate[progressUpdate?.length - 1]?.taskProgress === ""
            ) {
              enqueueSnackbar(
                "Please Enter Progress Updation History Status Task Progress",
                {
                  variant: "error",
                }
              );
            } else if (
              progressUpdate[progressUpdate?.length - 1]?.status === ""
            ) {
              enqueueSnackbar(
                "Please Enter Progress Updation History Status ",
                {
                  variant: "error",
                }
              );
            }
          } else {
            const payload = {
              StartDate: formData.planStartDate,
              EndDate: formData.planEndDate,
              TimeLog: dayDifference,
              Work: "0",
              Progress: formData.progress,
              Status: formData.status,
              ParentId: dataEditTask?.ParentId,
              Priority: formData.priority,
              Component: dataEditTask?.Component,
              type: formData.type,
              BaselineStartDate: formData.BaselineStartDate,
              BaselineEndDate: formData.BaselineEndDate,
              isSelection: "false",
              evidence: evidenceUpDateData,
              remarks: formData?.remarks,
              progressData: progressUpdate,
              isMileStone: formData.isMileStone,
            };
            updateTaskGanttTask(dataEditTask?._id, payload).then(
              async (response: any) => {
                if (response.status === 200 || response.status === 201) {
                  // enqueueSnackbar(`Data Updated SuccessFully`, {
                  //   variant: "success",
                  // });
                  const dataPayload = {
                    ...payload,
                    TaskId: dataEditTask?.TaskId,
                    StartDate: formData.planStartDate
                      ? new Date(formData.planStartDate)
                      : null,
                    EndDate: formData.planEndDate
                      ? new Date(formData.planEndDate)
                      : null,
                    BaselineStartDate: formData.BaselineStartDate
                      ? new Date(formData.BaselineStartDate)
                      : null,
                    BaselineEndDate: formData.BaselineEndDate
                      ? new Date(formData.BaselineEndDate)
                      : null,
                    Status: statusActivity,
                    Progress: Number(formData.progress),
                  };
                  ganttInstance?.editModule?.updateRecordByID(dataPayload);
                  ganttInstance?.selectRow(dataEditTask?.TaskId);
                  ganttInstance.dataSource = ganttInstance?.dataSource.map(
                    (task: any) =>
                      task.TaskId === dataEditTask?.TaskId
                        ? { ...task, ...dataPayload }
                        : task
                  );
                  // onChangeFilterData(selectedData?.taskData?.npdId);
                  const updatedParentTask =
                    ganttInstance?.currentViewData?.find(
                      (record: any) =>
                        record?.ganttProperties?.taskId ===
                        response?.data?.ParentId
                    );
                  if (updatedParentTask) {
                    const parentStartDate =
                      updatedParentTask?.taskData?.StartDate;
                    const parentEndDate = updatedParentTask?.taskData?.EndDate;
                    const parentPayload = {
                      StartDate: await convertToISO(parentStartDate),
                      EndDate: await convertToISO(parentEndDate),
                    };
                    updateTaskGanttTask(
                      updatedParentTask?.taskData?._id,
                      parentPayload
                    ).then(async (response: any) => {
                      if (response.status === 200 || response.status === 201) {
                        enqueueSnackbar(`Data Updated SuccessFully`, {
                          variant: "success",
                        });
                        ganttInstance.refresh();
                        buttonStatusFreeze(selectedData?.taskData?.npdId);
                        setSelectedNpd(selectedData?.taskData?.npdId);
                        setProgressUpdate([]);
                        closeModelRow();
                        setFormData({});
                        setRemarksData([]);
                        setEvidenceData([]);
                      }
                    });
                  }
                }
              }
            );
          }
        } else {
          const payload = {
            StartDate: formData.planStartDate,
            EndDate: formData.planEndDate,
            TimeLog: dayDifference,
            Work: "0",
            Progress: formData.progress,
            Status: formData.status,
            ParentId: dataEditTask?.ParentId,
            Priority: formData.priority,
            Component: dataEditTask?.Component,
            type: formData.type,
            BaselineStartDate: formData.BaselineStartDate,
            BaselineEndDate: formData.BaselineEndDate,
            isSelection: "false",
            evidence: evidenceUpDateData,
            remarks: formData?.remarks,
            progressData: progressUpdate,
            isMileStone: formData.isMileStone,
          };
          updateTaskGanttTask(dataEditTask?._id, payload).then(
            (response: any) => {
              if (response.status === 200 || response.status === 201) {
                enqueueSnackbar(`Data Updated SuccessFully`, {
                  variant: "success",
                });
                // getAllDataGanttView();
                const dataPayload = {
                  ...payload,
                  TaskId: dataEditTask?.TaskId,
                  StartDate: formData.planStartDate
                    ? new Date(formData.planStartDate)
                    : null,
                  EndDate: formData.planEndDate
                    ? new Date(formData.planEndDate)
                    : null,
                  BaselineStartDate: formData.BaselineStartDate
                    ? new Date(formData.BaselineStartDate)
                    : null,
                  BaselineEndDate: formData.BaselineEndDate
                    ? new Date(formData.BaselineEndDate)
                    : null,
                  Status: statusActivity,
                  Progress: formData.progress,
                };
                ganttInstance?.editModule?.updateRecordByID(dataPayload);
                ganttInstance?.selectRow(dataEditTask?.TaskId);
                ganttInstance.dataSource = ganttInstance?.dataSource.map(
                  (task: any) =>
                    task.TaskId === dataEditTask?.TaskId
                      ? { ...task, ...dataPayload }
                      : task
                );
                ganttInstance.refresh();
                // onChangeFilterData(selectedData?.taskData?.npdId);
                buttonStatusFreeze(selectedData?.taskData?.npdId);
                setNpdValueFull(selectedData?.taskData?.npdId);
                setSelectedNpd(selectedData?.taskData?.npdId);
                setProgressUpdate([]);
                closeModelRow();
                setFormData({});
                setRemarksData([]);
                setEvidenceData([]);
              }
            }
          );
        }
      } else if (formData?.type === "sub activity") {
        if (
          pa?.map((ele: any) => ele?.id)?.includes(userInfo?.id) &&
          formData.owner?.map((ele: any) => ele?.id)?.includes(userInfo?.id)
        ) {
          if (
            formData?.name === "" ||
            formData?.name === undefined ||
            formData?.name === null
          ) {
            enqueueSnackbar("Please Enter Task Name", {
              variant: "error",
            });
          } else if (
            formData.owner?.length === 0 ||
            formData.owner === undefined ||
            formData.owner === null
          ) {
            enqueueSnackbar("Please Select Owner", {
              variant: "error",
            });
          } else if (
            formData.planStartDate === "" ||
            formData.planStartDate === undefined ||
            formData.planStartDate === null
          ) {
            enqueueSnackbar("Please Select Plan Start Date", {
              variant: "error",
            });
          } else if (
            formData.planEndDate === "" ||
            formData.planEndDate === undefined ||
            formData.planEndDate === null
          ) {
            enqueueSnackbar("Please Select Plan End Date", {
              variant: "error",
            });
          } else if (
            formData.priority === "" ||
            formData.priority === undefined ||
            formData.priority === null
          ) {
            enqueueSnackbar("Please Select Priority", {
              variant: "error",
            });
          }
          // else if(formData.isMileStone === true && new Date(formData.planStartDate) !== new Date(formData.planEndDate)){
          //   enqueueSnackbar("Please Select MileStone Start Date and End Date Same Date", {
          //     variant: "error",
          //   });
          // }
          else if (
            (formData?.paStatus && formData.BaselineStartDate === "") ||
            formData.BaselineStartDate === undefined ||
            formData.BaselineStartDate === null
          ) {
            enqueueSnackbar("Please Select Task Start Date", {
              variant: "error",
            });
          } else if (
            formData?.paStatus &&
            progressUpdate[progressUpdate?.length - 1]?.progressComment === ""
          ) {
            enqueueSnackbar(
              "Please Enter Progress Updation History Status Update",
              {
                variant: "error",
              }
            );
          } else if (
            formData?.paStatus &&
            progressUpdate[progressUpdate?.length - 1]?.updatedDate === ""
          ) {
            enqueueSnackbar(
              "Please Enter Progress Updation History Status updated Date",
              {
                variant: "error",
              }
            );
          } else if (
            formData?.paStatus &&
            progressUpdate[progressUpdate?.length - 1]?.taskProgress === ""
          ) {
            enqueueSnackbar(
              "Please Enter Progress Updation History Status Task Progress",
              {
                variant: "error",
              }
            );
          } else if (
            formData?.paStatus &&
            progressUpdate[progressUpdate?.length - 1]?.status === ""
          ) {
            enqueueSnackbar("Please Enter Progress Updation History Status ", {
              variant: "error",
            });
          } else {
            const payload = {
              StartDate: formData.planStartDate,
              EndDate: formData.planEndDate,
              TimeLog: dayDifference,
              Work: "0",
              Progress: formData.progress,
              Status: formData?.status,
              ParentId: dataEditTask?.ParentId,
              Priority: formData.priority,
              Component: dataEditTask?.Component,
              type: formData.type,
              BaselineStartDate: formData.BaselineStartDate,
              BaselineEndDate: formData.BaselineEndDate,
              isSelection: "false",
              // evidence: evidenceData,
              remarks: formData?.remarks,
              progressData: progressUpdate,
              isMileStone: formData.isMileStone,
            };
            updateTaskGanttTask(dataEditTask?._id, payload).then(
              async (response: any) => {
                if (response.status === 200 || response.status === 201) {
                  // enqueueSnackbar(`Data Updated SuccessFully`, {
                  //   variant: "success",
                  // });
                  const dataPayload = {
                    ...payload,
                    TaskId: dataEditTask?.TaskId,
                    // TaskName:"Jayasimha",
                    StartDate: formData.planStartDate
                      ? new Date(formData.planStartDate)
                      : null,
                    EndDate: formData.planEndDate
                      ? new Date(formData.planEndDate)
                      : null,
                    BaselineStartDate: formData.BaselineStartDate
                      ? new Date(formData.BaselineStartDate)
                      : null,
                    BaselineEndDate: formData.BaselineEndDate
                      ? new Date(formData.BaselineEndDate)
                      : null,
                    Status: statusActivity,
                    Progress: Number(formData?.progress),
                  };
                  ganttInstance?.editModule?.updateRecordByID(dataPayload);
                  ganttInstance?.selectRow(dataEditTask?.TaskId);
                  ganttInstance.dataSource = ganttInstance?.dataSource.map(
                    (task: any) =>
                      task.TaskId === dataEditTask?.TaskId
                        ? { ...task, ...dataPayload }
                        : task
                  );
                  // getAllDataGanttView();
                  // onChangeFilterData(selectedData?.taskData?.npdId);
                  const updatedParentTask =
                    ganttInstance?.currentViewData?.find(
                      (record: any) =>
                        record?.ganttProperties?.taskId ===
                        response?.data?.ParentId
                    );
                  if (updatedParentTask) {
                    const parentStartDate =
                      updatedParentTask?.taskData?.StartDate;
                    const parentEndDate = updatedParentTask?.taskData?.EndDate;
                    const parentPayload = {
                      StartDate: await convertToISO(parentStartDate),
                      EndDate: await convertToISO(parentEndDate),
                    };
                    updateTaskGanttTask(
                      updatedParentTask?.taskData?._id,
                      parentPayload
                    ).then(async (response: any) => {
                      if (response.status === 200 || response.status === 201) {
                        enqueueSnackbar(`Data Updated SuccessFully`, {
                          variant: "success",
                        });
                        ganttInstance.refresh();
                        buttonStatusFreeze(selectedData?.taskData?.npdId);
                        setNpdValueFull(selectedData?.taskData?.npdId);
                        setSelectedNpd(selectedData?.taskData?.npdId);
                        setProgressUpdate([]);
                        closeModelRow();
                        setFormData({});
                        setRemarksData([]);
                        setEvidenceData([]);
                      }
                    });
                  }
                }
              }
            );
          }
        } else if (pa?.map((ele: any) => ele?.id)?.includes(userInfo?.id)) {
          if (
            formData?.name === "" ||
            formData?.name === undefined ||
            formData?.name === null
          ) {
            enqueueSnackbar("Please Enter Task Name", {
              variant: "error",
            });
          } else if (
            formData.owner?.length === 0 ||
            formData.owner === undefined ||
            formData.owner === null
          ) {
            enqueueSnackbar("Please Select Owner", {
              variant: "error",
            });
          } else if (
            formData.planStartDate === "" ||
            formData.planStartDate === undefined ||
            formData.planStartDate === null
          ) {
            enqueueSnackbar("Please Select Plan Start Date", {
              variant: "error",
            });
          } else if (
            formData.planEndDate === "" ||
            formData.planEndDate === undefined ||
            formData.planEndDate === null
          ) {
            enqueueSnackbar("Please Select Plan End Date", {
              variant: "error",
            });
          } else if (
            formData.priority === "" ||
            formData.priority === undefined ||
            formData.priority === null
          ) {
            enqueueSnackbar("Please Select Priority", {
              variant: "error",
            });
          } else {
            const payload = {
              StartDate: formData.planStartDate,
              EndDate: formData.planEndDate,
              TimeLog: dayDifference,
              Work: "0",
              Progress: formData.progress,
              Status: formData.status,
              ParentId: dataEditTask?.ParentId,
              Priority: formData.priority,
              Component: dataEditTask?.Component,
              type: formData.type,
              BaselineStartDate: formData.BaselineStartDate
                ? new Date(formData.BaselineStartDate)
                : null,
              BaselineEndDate: formData.BaselineEndDate
                ? new Date(formData.BaselineEndDate)
                : null,
              isSelection: "false",
              // evidence: evidenceData,
              remarks: formData?.remarks,
              progressData: progressUpdate,
              isMileStone: formData.isMileStone,
            };
            updateTaskGanttTask(dataEditTask?._id, payload).then(
              async (response: any) => {
                if (response?.status === 200 || response?.status === 201) {
                  // enqueueSnackbar(`Data Updated SuccessFully Jaya`, {
                  //   variant: "success",
                  // });
                  // getAllDataGanttView();
                  const dataPayload = {
                    ...payload,
                    TaskId: dataEditTask?.TaskId,
                    StartDate: formData.planStartDate
                      ? new Date(formData.planStartDate)
                      : null,
                    EndDate: formData.planEndDate
                      ? new Date(formData.planEndDate)
                      : null,
                    isMileStone: formData.isMileStone,
                    Priority: formData.priority,
                    isSelection: "false",
                    Status: statusActivity,
                    Progress: Number(formData.progress),
                  };
                  ganttInstance?.editModule?.updateRecordByID(dataPayload);
                  ganttInstance?.selectRow(dataEditTask?.TaskId);
                  ganttInstance.dataSource = ganttInstance?.dataSource?.map(
                    (task: any) =>
                      task?.TaskId === dataEditTask?.TaskId
                        ? { ...task, ...dataPayload }
                        : task
                  );
                  // onChangeFilterData(selectedData?.taskData?.npdId);
                  const updatedParentTask =
                    ganttInstance?.currentViewData?.find(
                      (record: any) =>
                        record?.ganttProperties?.taskId ===
                        response?.data?.ParentId
                    );
                  if (updatedParentTask) {
                    const parentStartDate =
                      updatedParentTask?.taskData?.StartDate;
                    const parentEndDate = updatedParentTask?.taskData?.EndDate;
                    const parentPayload = {
                      StartDate: await convertToISO(parentStartDate),
                      EndDate: await convertToISO(parentEndDate),
                    };
                    updateTaskGanttTask(
                      updatedParentTask?.taskData?._id,
                      parentPayload
                    ).then(async (response: any) => {
                      if (response.status === 200 || response.status === 201) {
                        enqueueSnackbar(`Data Updated SuccessFully`, {
                          variant: "success",
                        });
                        ganttInstance.refresh();
                        ganttInstance.dataBind();
                        buttonStatusFreeze(selectedData?.taskData?.npdId);
                        setNpdValueFull(selectedData?.taskData?.npdId);
                        setSelectedNpd(selectedData?.taskData?.npdId);
                        setProgressUpdate([]);
                        closeModelRow();
                        setFormData({});
                        setRemarksData([]);
                        setEvidenceData([]);
                      }
                    });
                  }
                }
              }
            );
          }
        } else if (
          formData?.owner?.map((ele: any) => ele?.id)?.includes(userInfo?.id)
        ) {
          if (
            (formData?.paStatus && formData.BaselineStartDate === "") ||
            formData.BaselineStartDate === undefined ||
            formData.BaselineStartDate === null
          ) {
            enqueueSnackbar("Please Select  Actual Start Date ", {
              variant: "error",
            });
          } else if (
            formData?.paStatus &&
            progressUpdate[progressUpdate?.length - 1]?.progressComment === ""
          ) {
            enqueueSnackbar(
              "Please Enter Progress Updation History Status Update",
              {
                variant: "error",
              }
            );
          } else if (
            formData?.paStatus &&
            progressUpdate[progressUpdate?.length - 1]?.updatedDate === ""
          ) {
            enqueueSnackbar(
              "Please Enter Progress Updation History Status updated Date",
              {
                variant: "error",
              }
            );
          } else if (
            formData?.paStatus &&
            progressUpdate[progressUpdate?.length - 1]?.taskProgress === ""
          ) {
            enqueueSnackbar(
              "Please Enter Progress Updation History Status Task Progress",
              {
                variant: "error",
              }
            );
          } else if (
            formData?.paStatus &&
            progressUpdate[progressUpdate?.length - 1]?.status === ""
          ) {
            enqueueSnackbar("Please Enter Progress Updation History Status ", {
              variant: "error",
            });
          } else {
            const payload = {
              StartDate: formData.planStartDate,
              EndDate: formData.planEndDate,
              TimeLog: dayDifference,
              Work: "0",
              Progress: formData.progress,
              Status: formData?.status,
              ParentId: dataEditTask?.ParentId,
              Priority: formData.priority,
              Component: dataEditTask?.Component,
              type: formData.type,
              BaselineStartDate: formData.BaselineStartDate,
              BaselineEndDate: formData.BaselineEndDate,
              isSelection: "false",
              // evidence: evidenceData,
              remarks: formData?.remarks,
              progressData: progressUpdate,
              isMileStone: formData.isMileStone,
            };
            updateTaskGanttTask(dataEditTask?._id, payload).then(
              async (response: any) => {
                if (response.status === 200 || response.status === 201) {
                  // enqueueSnackbar(`Data Updated SuccessFully`, {
                  //   variant: "success",
                  // });
                  const dataPayload = {
                    ...payload,
                    TaskId: dataEditTask?.TaskId,
                    BaselineStartDate: formData.BaselineStartDate
                      ? new Date(formData.BaselineStartDate)
                      : null,
                    BaselineEndDate: formData.BaselineEndDate
                      ? new Date(formData.BaselineEndDate)
                      : null,
                    Status: statusActivity,
                    Progress: Number(formData.progress),
                  };
                  console.log("dataPayload", dataPayload);
                  ganttInstance?.editModule?.updateRecordByID(dataPayload);
                  ganttInstance?.selectRow(dataEditTask?.TaskId);
                  ganttInstance.dataSource = ganttInstance?.dataSource.map(
                    (task: any) =>
                      task.TaskId === dataEditTask?.TaskId
                        ? { ...task, ...dataPayload }
                        : task
                  );
                  // onChangeFilterData(selectedData?.taskData?.npdId);
                  // setNpdValueFull(selectedData?.taskData?.npdId);
                  const updatedParentTask =
                    ganttInstance?.currentViewData?.find(
                      (record: any) =>
                        record?.ganttProperties?.taskId ===
                        response?.data?.ParentId
                    );
                  if (updatedParentTask) {
                    const parentStartDate =
                      updatedParentTask?.taskData?.StartDate;
                    const parentEndDate = updatedParentTask?.taskData?.EndDate;
                    const parentPayload = {
                      StartDate: await convertToISO(parentStartDate),
                      EndDate: await convertToISO(parentEndDate),
                    };
                    updateTaskGanttTask(
                      updatedParentTask?.taskData?._id,
                      parentPayload
                    ).then(async (response: any) => {
                      if (response.status === 200 || response.status === 201) {
                        enqueueSnackbar(`Data Updated SuccessFully`, {
                          variant: "success",
                        });
                        ganttInstance.refresh();
                        buttonStatusFreeze(selectedData?.taskData?.npdId);
                        setSelectedNpd(selectedData?.taskData?.npdId);
                        setProgressUpdate([]);
                        closeModelRow();
                        setFormData({});
                        setRemarksData([]);
                        setEvidenceData([]);
                      }
                    });
                  }
                }
              }
            );
          }
        }
      }
      // }
    }
  };

  const handlerGanttTaskStatus = (data: any) => {
    const todayDate = new Date();
    const endDate = new Date(data?.EndDate);
    const baselineStartDate = data?.BaselineStartDate
      ? new Date(data?.BaselineStartDate)
      : null;
    const baselineEndDate = data?.BaselineEndDate
      ? new Date(data?.BaselineEndDate)
      : null;
    let Status = data?.Status;
    if (
      (endDate < todayDate ||
        (baselineStartDate && baselineStartDate > endDate) ||
        (baselineEndDate && baselineEndDate > endDate)) &&
      data.Status !== "Completed" &&
      (data?.type === "sub activity" || data?.type === "activity")
    ) {
      Status = "Delayed";
    }
    return Status;
  };

  const addStakeHolder = () => {
    if (pa?.map((ele: any) => ele?.id)?.includes(userInfo?.id)) {
      if (
        entityForm?.entityType === "" ||
        entityForm?.entityType === undefined ||
        entityForm?.entityType === null
      ) {
        enqueueSnackbar("Please Select Entity Type", {
          variant: "error",
        });
      } else if (
        entityForm?.entityList === "" ||
        entityForm?.entityList === undefined ||
        entityForm?.entityList === null
      ) {
        enqueueSnackbar("Please Select Entities", {
          variant: "error",
        });
      } else {
        const pms = pa.map((item: any) => item.id);
        const payloadData = {
          TaskId: `${entityForm?.entityListData?.value}`,
          TaskName: entityForm?.entityListData?.label,
          StartDate: null,
          EndDate: null,
          TimeLog: 0,
          Work: 0,
          Progress: 0,
          Status: "",
          Priority: "",
          type: "Category",
          category: entityForm?.entityTypeData?.label,
          stakeHolderId: entityForm?.entityListData?.value,
          stakeHolderName: entityForm?.entityListData?.label,
          ParentId: npdValueFull.value,
          Component: npdValueFull.TaskName,
          isSelection: false,
          npdId: npdValueFull.value,
          pm: pms,
          isDraggable: false,
        };
        createNpdGanttChart(payloadData).then((response: any) => {
          if (response.status === 200 || response.status === 201) {
            enqueueSnackbar(`Data Updated SuccessFully`, {
              variant: "success",
            });
            closeStakeHolderModal();
            onChangeFilterData(npdValueFull.value);
            setSelectedNpd(npdValueFull.value);
          }
        });
      }
    } else {
      enqueueSnackbar("Your Not A Project Admin", {
        variant: "error",
      });
    }
  };
  const findByDptInConfig = async (data: any) => {
    try {
      const result = await axios.get(
        API_LINK +
          `/api/npd/getByNpdAndCategoryAndDeptGanttChart/${npdValueFull?.value}/${departmentAddForm?.stakeHolder?.value}/${data?.value}`
      );
      if (result?.data === true) {
        enqueueSnackbar(
          ` This  ${data?.label} Department Already Exits In StakeHolder ${departmentAddForm?.stakeHolder?.label} List`,
          {
            variant: "error",
          }
        );
        setDepartmentAddForm({
          ...departmentAddForm,
          department: {},
        });
      } else {
        getByIdGanttNpdDptData(data.value).then((response: any) => {
          const dataByRes = Object.keys(response?.data)?.length;
          if (dataByRes === 0) {
            if (dataByRes === 0) {
              const payload = {
                id: uniqueId,
                activity: "",
                evidence: [
                  {
                    id: `${uniqueId}-${1}`,
                    evidenceName: "",
                    addButtonStatus: false,
                    buttonStatus: false,
                  },
                ],
                subtask: [],
                addButtonStatus: false,
                buttonStatus: false,
              };
              setDepartmentDataTable([payload]);
              setDepartmentAddForm({
                ...departmentAddForm,
                department: data,
                pic: [],
              });
            }
          } else {
            setDepartmentAddForm({
              ...departmentAddForm,
              pic: response?.data?.pic,
              department: data,
            });
            const updateData = response?.data?.activity?.map((ele: any) => {
              const subActivityData = ele?.subActivity?.map((ite: any) => {
                const SubData = {
                  id: ite.id,
                  taskName: ite.title,
                  addButtonStatus: true,
                  buttonStatus: true,
                };
                return SubData;
              });
              const evdData = ele?.evidence?.map((eles: any) => {
                const evdDataSub = {
                  id: eles.id,
                  evidenceName: eles.title,
                  addButtonStatus: true,
                  buttonStatus: true,
                };
                return evdDataSub;
              });
              const data = {
                id: ele.id,
                activity: ele.activity,
                evidence:
                  evdData?.length > 0
                    ? evdData
                    : [
                        {
                          id: `${uniqueId}-${1}`,
                          evidenceName: "",
                          addButtonStatus: false,
                          buttonStatus: false,
                        },
                      ],
                subtask: subActivityData?.length > 0 ? subActivityData : [],
                addButtonStatus: evdData?.length > 0 ? true : false,
                buttonStatus: evdData?.length > 0 ? true : false,
              };
              return data;
            });
            setDepartmentDataTable(updateData);
          }
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (departmentDataTable?.length === 0) {
      // let data = {
      //   id: uniqueId,
      //   activity: "",
      //   evidence: [
      //     {
      //       id: `${uniqueId}-${1}`,
      //       evidenceName: "",
      //       addButtonStatus: false,
      //       buttonStatus: false,
      //     },
      //   ],
      //   subtask: [],
      //   addButtonStatus: false,
      //   buttonStatus: false,
      // };
      // setDepartmentDataTable([...departmentDataTable, data]);
      getProjectAdmins();
    }
  }, [departmentDataTable]);

  const addMainTaskHandler = () => {
    const data = {
      id: uniqueId,
      activity: "",
      evidence: [
        {
          id: `${uniqueId}-${1}`,
          evidenceName: "",
          addButtonStatus: false,
          buttonStatus: false,
        },
      ],
      subtask: [],
      addButtonStatus: false,
      buttonStatus: false,
    };
    setDepartmentDataTable([...departmentDataTable, data]);
  };

  const mainTaskValuesHandler = (name: any, data: any, value: any) => {
    const update = departmentDataTable?.map((item: any) => {
      if (item.id === data) {
        return {
          ...item,
          [name]: value,
        };
      }
      return item;
    });
    setDepartmentDataTable(update);
  };

  const mainTaskSubmitHandler = (data: any) => {
    if (data.activity === "" || data.activity === undefined) {
      enqueueSnackbar(`PLeses Enter Activity Name`, {
        variant: "error",
      });
    } else if (
      data?.evidence[data?.evidence?.length - 1]?.evidenceName === "" ||
      data?.evidence[data?.evidence?.length - 1]?.evidenceName === undefined
    ) {
      enqueueSnackbar(`PLeses Enter Evidence Name`, {
        variant: "error",
      });
    } else if (data?.subtask?.length == 0) {
      const update = departmentDataTable?.map((item: any) => {
        if (item.id === data.id) {
          return {
            ...item,
            addButtonStatus: true,
            buttonStatus: true,
          };
        }
        return item;
      });
      setDepartmentDataTable(update);
    } else if (
      (data?.subtask?.length !== 0 &&
        data?.subtask[data?.subtask?.length - 1]?.taskName === "") ||
      data?.subtask[data?.subtask?.length - 1]?.taskName === undefined
    ) {
      enqueueSnackbar(`PLeses Enter SubTask  Name`, {
        variant: "error",
      });
    } else {
      const update = departmentDataTable?.map((item: any) => {
        if (item.id === data.id) {
          return {
            ...item,
            addButtonStatus: true,
            buttonStatus: true,
          };
        }
        return item;
      });
      setDepartmentDataTable(update);
    }
  };

  const mainTaskEditHandler = (data: any) => {
    setMainTaskStatus(true);
    setMainTaskId(data.id);
    const update = departmentDataTable?.map((item: any) => {
      if (item.id === data.id) {
        return {
          ...item,
          buttonStatus: false,
        };
      }
      return item;
    });
    setDepartmentDataTable(update);
  };

  const mainTaskUpdateHandler = (data: any) => {
    if (data.activity === "" || data.activity === undefined) {
      enqueueSnackbar(`PLeses Enter Activity Name`, {
        variant: "error",
      });
    } else if (
      data?.evidence[data?.evidence?.length - 1]?.evidenceName === "" ||
      data?.evidence[data?.evidence?.length - 1]?.evidenceName === undefined
    ) {
      enqueueSnackbar(`Please Enter Evidence Name`, {
        variant: "error",
      });
    } else if (data?.subtask?.length === 0) {
      setMainTaskStatus(false);
      setMainTaskId("");
      const update = departmentDataTable?.map((item: any) => {
        if (item.id === data.id) {
          return {
            ...item,
            buttonStatus: true,
          };
        }
        return item;
      });
      setDepartmentDataTable(update);
    } else if (
      data?.subtask[data?.subtask?.length - 1]?.taskName === "" ||
      data?.subtask[data?.subtask?.length - 1]?.taskName === undefined
    ) {
      enqueueSnackbar(`PLeses Enter SubTask  Name`, {
        variant: "error",
      });
    } else {
      setMainTaskStatus(false);
      setMainTaskId("");
      const update = departmentDataTable?.map((item: any) => {
        if (item.id === data.id) {
          return {
            ...item,
            buttonStatus: true,
          };
        }
        return item;
      });
      setDepartmentDataTable(update);
    }
  };

  const mainTaskDeleteHandler = (data: any) => {
    const update = departmentDataTable?.filter((item: any) => item.id !== data);
    setDepartmentDataTable(update);
    enqueueSnackbar(`Deleted successfully!`, {
      variant: "success",
    });
  };

  const evidenceSubTaskHandler = (data: any) => {
    const update = departmentDataTable?.map((item: any) => {
      if (item.id === data) {
        const data = {
          id: uniqueId,
          evidenceName: "",
          addButtonStatus: false,
          buttonStatus: false,
        };
        return {
          ...item,
          evidence: [...item.evidence, data],
        };
      }
      return item;
    });
    setDepartmentDataTable(update);
  };

  const evidenceValueHandler = (name: any, data: any, ele: any, value: any) => {
    const update = departmentDataTable?.map((item: any) => {
      if (item.id === data) {
        const valueAdd = item.evidence?.map((itm: any) => {
          if (itm.id === ele) {
            return {
              ...itm,
              [name]: value,
            };
          }
          return itm;
        });
        return {
          ...item,
          evidence: valueAdd,
        };
      }
      return item;
    });
    setDepartmentDataTable(update);
  };

  const evidenceSubmitHandler = (data: any, ele: any) => {
    if (ele.evidenceName === "" || ele.evidenceName === undefined) {
      enqueueSnackbar(`PLeses Enter Evidence Name`, {
        variant: "error",
      });
    } else {
      const update = departmentDataTable?.map((item: any) => {
        if (item.id === data) {
          const valueAdd = item.evidence?.map((itm: any) => {
            if (itm.id === ele.id) {
              return {
                ...itm,
                addButtonStatus: true,
                buttonStatus: true,
              };
            }
            return itm;
          });
          return {
            ...item,
            evidence: valueAdd,
          };
        }
        return item;
      });
      setDepartmentDataTable(update);
    }
  };

  const evidenceEditHandler = (data: any, ele: any) => {
    setEvidenceTaskStatus(true);
    setEvidenceTaskId(ele.id);
    const update = departmentDataTable?.map((item: any) => {
      if (item.id === data) {
        const valueAdd = item.evidence?.map((itm: any) => {
          if (itm.id === ele.id) {
            return {
              ...itm,
              buttonStatus: false,
            };
          }
          return itm;
        });
        return {
          ...item,
          evidence: valueAdd,
        };
      }
      return item;
    });
    setDepartmentDataTable(update);
  };

  const evidenceUpDateHandler = (data: any, ele: any) => {
    if (ele.evidenceName === "" || ele.evidenceName === undefined) {
      enqueueSnackbar(`PLeses Enter Evidence Name`, {
        variant: "error",
      });
    } else {
      setEvidenceTaskStatus(false);
      setEvidenceTaskId("");
      const update = departmentDataTable?.map((item: any) => {
        if (item.id === data) {
          const valueAdd = item.evidence?.map((itm: any) => {
            if (itm.id === ele.id) {
              return {
                ...itm,
                buttonStatus: true,
              };
            }
            return itm;
          });
          return {
            ...item,
            evidence: valueAdd,
          };
        }
        return item;
      });
      setDepartmentDataTable(update);
    }
  };

  const evidenceDeleteHandler = (data: any, ele: any) => {
    const update = departmentDataTable?.map((item: any) => {
      if (item.id === data) {
        const valueAdd = item.evidence?.filter((itm: any) => itm.id !== ele.id);
        return {
          ...item,
          evidence: valueAdd,
        };
      }
      return item;
    });
    setDepartmentDataTable(update);
  };

  const subTaskAddHandler = (data: any) => {
    const update = departmentDataTable?.map((item: any) => {
      if (item.id === data) {
        const data = {
          id: uniqueId,
          taskName: "",
          addButtonStatus: false,
          buttonStatus: false,
        };
        return {
          ...item,
          subtask: [...item.subtask, data],
        };
      }
      return item;
    });
    setDepartmentDataTable(update);
  };

  const subTaskValueHandler = (name: any, data: any, ele: any, value: any) => {
    const update = departmentDataTable?.map((item: any) => {
      if (item.id === data) {
        const valueAdd = item.subtask?.map((itm: any) => {
          if (itm.id === ele) {
            return {
              ...itm,
              [name]: value,
            };
          }
          return itm;
        });
        return {
          ...item,
          subtask: valueAdd,
        };
      }
      return item;
    });
    setDepartmentDataTable(update);
  };

  const subTaskSubmitHandler = (data: any, els: any) => {
    if (els.taskName === "" || els.taskName === undefined) {
      enqueueSnackbar(`PLeses Enter SubTak Name`, {
        variant: "error",
      });
    } else {
      const update = departmentDataTable?.map((item: any) => {
        if (item.id === data) {
          const valueAdd = item.subtask?.map((itm: any) => {
            if (itm.id === els.id) {
              return {
                ...itm,
                addButtonStatus: true,
                buttonStatus: true,
              };
            }
            return itm;
          });
          return {
            ...item,
            subtask: valueAdd,
          };
        }
        return item;
      });
      setDepartmentDataTable(update);
    }
  };

  const subTaskEditHandler = (data: any, els: any) => {
    setSubTaskStatus(true);
    setSubTaskId(els.id);
    const update = departmentDataTable?.map((item: any) => {
      if (item.id === data) {
        const valueAdd = item.subtask?.map((itm: any) => {
          if (itm.id === els.id) {
            return {
              ...itm,
              buttonStatus: false,
            };
          }
          return itm;
        });
        return {
          ...item,
          subtask: valueAdd,
        };
      }
      return item;
    });
    setDepartmentDataTable(update);
  };

  const subTaskUpdateHandler = (data: any, els: any) => {
    if (els.taskName === "" || els.taskName === undefined) {
      enqueueSnackbar(`PLeses Enter SubTask Name`, {
        variant: "error",
      });
    } else {
      setSubTaskStatus(false);
      setSubTaskId("");
      const update = departmentDataTable?.map((item: any) => {
        if (item.id === data) {
          const valueAdd = item.subtask?.map((itm: any) => {
            if (itm.id === els.id) {
              return {
                ...itm,
                buttonStatus: true,
              };
            }
            return itm;
          });
          return {
            ...item,
            subtask: valueAdd,
          };
        }
        return item;
      });
      setDepartmentDataTable(update);
    }
  };

  const subTaskDeleteHandler = (data: any, els: any) => {
    const update = departmentDataTable?.map((item: any) => {
      if (item.id === data) {
        const valueAdd = item.subtask?.filter((itm: any) => itm.id !== els.id);
        return {
          ...item,
          subtask: valueAdd,
        };
      }
      return item;
    });
    setDepartmentDataTable(update);
  };

  const toggleRow = (rowId: any) => {
    setExpandedRows((prevState: any) => ({
      ...prevState,
      [rowId]: !prevState[rowId],
    }));
  };

  const buttonStatusFreeze = async (data: any) => {
    try {
      const result = await axios.get(
        API_LINK + `/api/npd/freezeButtonStatus/${data?.value || data}`
      );
      setFreezeButtonStatus(result?.data);
    } catch (err) {
      console.log("err", err);
    }
  };

  const onChangeFilterData = async (e: any) => {
    setFilterValue("All");
    setFilterUserValue("All");
    setSelectedNpd(e);
    getProjectAdmins();
    getNPDParentOptions(e);
    const payload = {
      page: page,
      limit: pageLimit,
    };
    await getByIdGanttData(e, payload).then((response: any) => {
      const trasFormData = response?.data?.result?.map((ele: any) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isEndDateValid = ele?.EndDate && typeof ele?.EndDate !== "object";
        const endDate = isEndDateValid ? new Date(ele?.EndDate) : null;
        let status = ele?.Status;
        if (ele?.type === "sub activity" || ele?.type === "activity") {
          // if (!status || status === "In Progress") {
          if (endDate && endDate < today && ele?.Progress < 100) {
            status = "Delayed";
          }
          // }
        }
        const finalData = {
          ...ele,
          StartDate: ele?.StartDate ? new Date(ele?.StartDate) : new Date(),
          EndDate: ele?.EndDate ? new Date(ele?.EndDate) : new Date(),
          BaselineStartDate:
            ele?.BaselineStartDate === null ? "" : ele?.BaselineStartDate,
          BaselineEndDate:
            ele?.BaselineEndDate === null ? "" : ele?.BaselineEndDate,
          // Status: status,
        };
        return finalData;
      });
      setData(trasFormData);
      setTotalCount(response?.data?.count);
      setOverAllData(trasFormData);
      // setGanttData(trasFormData);
      // ganttInstance?.focus();
      const ListData: any = [];
      ListData.push({
        ID: "All",
        Text: "All",
        value: "1",
      });
      response?.data?.data
        ?.filter((item: any) => item.type === "department")
        ?.map((ele: any) => {
          ListData.push({
            ID: ele?.TaskName,
            Text: ele?.TaskName,
            value: ele?.dptId,
          });
        });
      const userListData: any = [];
      userListData.push({
        ID: "All",
        Text: "All",
        value: "1",
      });
      response?.data?.data
        ?.filter((item: any) => item.type === "department")
        ?.map((ele: any) => {
          ele?.Assignee?.map((eles: any) => {
            userListData.push({
              ID: eles?.username,
              Text: eles?.username,
              value: eles?.id,
            });
          });
        });
      const finalUserList = Array.from(
        new Set(userListData.map((item: any) => item.ID))
      ).map((id) => userListData.find((item: any) => item.ID === id));
      setUserList(finalUserList);
      const finalDataSet = Array.from(
        new Set(ListData.map((item: any) => item.ID))
      ).map((id) => ListData.find((item: any) => item.ID === id));
      setDepartmentList(finalDataSet);
    });
  };

  const addDepartmentValues = (e: any, value: any) => {
    if (value?.label === userDetail?.organization?.realmName) {
      const data = {
        id: userDetail?.organization?.realmName,
        category: userDetail?.organization?.realmName,
        stakeHolderName: userDetail?.organization?.realmName,
        stakeHolderId:
          "66cc61a60d82c135b7c" + userDetail?.organization?.realmName,
        departments: [
          {
            id: "cls9wubp10000ro7k567p4nm1",
            department: "",
            pic: [],
            npdConfigId: "",
          },
        ],
        isSelected: false,
      };
      setAddDeptData([...addDeptData, data]);
    } else {
      const payload = {
        id: value?.value,
        category: "Customer",
        stakeHolderName: value?.label,
        stakeHolderId: value?.value,
        departments: [
          { id: uniqueId, department: "", pic: [], npdConfigId: "" },
        ],
        isSelected: false,
      };
      setAddDeptData([...addDeptData, payload]);
    }
  };

  const from = "08:00";
  const to = "17:00";

  const dayWorkingTime: any = [
    { from: "08:00", to: "12:00" }, // Morning session
    { from: "13:00", to: "17:00" }, // Afternoon session
  ];

  const date = new Date();
  const options: any = {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  };
  const indianTime = new Intl.DateTimeFormat("en-IN", options).format(date);

  const TaskbarTemplate = (props: any) => {
    return (
      <div>
        <div
          className="e-gantt-child-taskbar-inner-div e-gantt-child-taskbar"
          style={{ height: "7px", backgroundColor: "#0263f5" }}
        >
          <span className="e-task-label" style={{ height: "7px" }}>
            {`${""}`}
          </span>
        </div>
      </div>
    );
  };

  const addMoreProgressData = () => {
    const dataProgress = {
      id: uniqueId,
      updatedDate: "",
      taskProgress: "",
      status: "",
      progressComment: "",
      addButtonStatus: false,
      addHandlerButtonStatus: false,
    };
    setProgressUpdate([dataProgress, ...progressUpdate]);
  };
  const addValuesProgressTable = (ele: any, name: any, value: any) => {
    if (name === "taskProgress") {
      setFormData({
        ...formData,
        progress: value,
      });
    }
    if (name === "updatedDate") {
      setFormData({
        ...formData,
        BaselineEndDate: value,
      });
    }
    if (name === "status") {
      setFormData({
        ...formData,
        status: value,
      });
    }

    const update = progressUpdate?.map((item: any) => {
      if (item.id === ele.id) {
        return {
          ...item,
          [name]: value,
        };
      }
      return item;
    });
    setProgressUpdate(update);
  };

  const updateProgressValues = (ele: any) => {
    if (ele.progressComment === "") {
      enqueueSnackbar(`Please Enter Progress Version`, {
        variant: "error",
      });
    } else if (ele.updatedDate === "") {
      enqueueSnackbar(`Please  Select Updation Date`, {
        variant: "error",
      });
    } else if (ele.taskProgress === "") {
      enqueueSnackbar(`Please Enter Task Progress`, {
        variant: "error",
      });
    } else if (ele.status === "") {
      enqueueSnackbar(`Please Enter Task Status`, {
        variant: "error",
      });
    } else {
      const update = progressUpdate?.map((item: any) => {
        if (item.id === ele.id) {
          return {
            ...item,
            buttonStatus: true,
            addHandlerButtonStatus: true,
          };
        }
        return item;
      });
      setProgressUpdate(update);
    }
  };

  const updateEditProgressValue = (ele: any) => {
    setEditButtonStatusProgress(true);
    setEditProgressEditId(ele.id);
    const update = progressUpdate?.map((item: any) => {
      if (item.id === ele.id) {
        return {
          ...item,
          buttonStatus: false,
        };
      }
      return item;
    });
    setProgressUpdate(update);
  };
  const updateEditUpdateProgressValue = (ele: any) => {
    setEditButtonStatusProgress(false);
    setEditProgressEditId("");
    if (ele.progressComment === "") {
      enqueueSnackbar(`Please Enter Progress Version`, {
        variant: "error",
      });
    } else if (ele.updatedDate === "") {
      enqueueSnackbar(`Please  Select Updation Date`, {
        variant: "error",
      });
    } else if (ele.taskProgress === "") {
      enqueueSnackbar(`Please Enter Task Progress`, {
        variant: "error",
      });
    } else if (ele.status === "") {
      enqueueSnackbar(`Please Enter Task Status`, {
        variant: "error",
      });
    } else {
      const update = progressUpdate?.map((item: any) => {
        if (item.id === ele.id) {
          return {
            ...item,
            buttonStatus: true,
          };
        }
        return item;
      });
      setProgressUpdate(update);
    }
  };

  // if (!data) return null;

  const handleActionComplete = async (args: any) => {
    // if (args.action === 'rowDrag') {
    if (args?.requestType === "rowDropped") {
      const taskDataBefore = args?.data[0]?.taskData;
      const taskDataDropPosition = args?.dropRecord?.taskData;
      if (taskDataBefore?.type === "activity") {
        const filterByTaskId = data?.filter(
          (ele: any) => ele?.ParentId === taskDataBefore?.TaskId
        );
        const afterTrimTaskId = await replaceLastPartAfterHyphen(
          taskDataBefore?.TaskId,
          taskDataDropPosition.stakeHolderId
        );
        const SubData = {
          TaskId: afterTrimTaskId,
          TaskName: taskDataBefore?.TaskName,
          StartDate: taskDataBefore?.StartDate,
          EndDate: taskDataBefore?.EndDate,
          TimeLog: taskDataBefore?.TimeLog,
          Work: taskDataBefore?.Work,
          Progress: taskDataBefore?.Progress,
          Status: taskDataBefore?.Status,
          ParentId: taskDataDropPosition.ParentId,
          Priority: taskDataBefore?.Priority,
          Component: taskDataDropPosition.Component,
          type: "activity",
          BaselineStartDate: taskDataBefore?.BaselineStartDate,
          BaselineEndDate: taskDataBefore?.BaselineEndDate,
          evidence: taskDataBefore?.evidence,
          isSelection: taskDataBefore?.isSelection,
          remarks: taskDataBefore?.remarks,
          progressData: taskDataBefore?.progressData,
          category: taskDataDropPosition?.category,
          stakeHolderId: taskDataDropPosition?.stakeHolderId,
          stakeHolderName: taskDataDropPosition?.stakeHolderName,
          organizationId: taskDataBefore?.organizationId,
          createdBy: taskDataBefore?.createdBy,
          npdId: taskDataBefore?.npdId,
          dptId: taskDataDropPosition?.dptId,
          picId: taskDataDropPosition?.picId,
          pm: taskDataDropPosition?.pm,
          isDraggable: taskDataBefore?.isDraggable,
        };
        const result = await axios.put(
          `/api/npd/updateSingleGanttTask/${taskDataBefore?._id}`,
          {
            ...SubData,
          }
        );
        if (result?.status === 200 || result?.status === 201) {
          const promises = filterByTaskId?.map(async (ele: any) => {
            const data = {
              TaskId: await replaceLastPartAfterHyphen(
                ele?.TaskId,
                taskDataDropPosition.stakeHolderId
              ),
              TaskName: ele?.TaskName,
              StartDate: ele?.StartDate,
              EndDate: ele?.EndDate,
              TimeLog: ele?.TimeLog,
              Work: ele?.Work,
              Progress: ele?.Progress,
              Status: ele?.Status,
              ParentId: SubData.TaskId,
              Priority: ele?.Priority,
              Component: SubData.TaskName,
              type: "sub activity",
              BaselineStartDate: ele?.BaselineStartDate,
              BaselineEndDate: ele?.BaselineEndDate,
              evidence: ele?.evidence,
              isSelection: ele?.isSelection,
              remarks: ele?.remarks,
              progressData: ele?.progressData,
              category: SubData?.category,
              stakeHolderId: SubData?.stakeHolderId,
              stakeHolderName: SubData?.stakeHolderName,
              organizationId: ele?.organizationId,
              createdBy: ele?.createdBy,
              npdId: ele?.npdId,
              dptId: SubData?.dptId,
              picId: SubData?.picId,
              pm: SubData?.pm,
              isDraggable: ele?.isDraggable,
            };
            return axios.put(`/api/npd/updateSingleGanttTask/${ele?._id}`, {
              ...data,
            });
          });
          try {
            const results = await Promise.all(promises);
            enqueueSnackbar("Updated Successfully", { variant: "success" });
          } catch (error) {
            console.error("Error updating tasks:", error);
            // enqueueSnackbar("Update failed", { variant: "error" });
          }
        }
      } else {
        const afterTrimTaskId = await replaceLastPartAfterHyphen(
          taskDataBefore?.TaskId,
          taskDataDropPosition.stakeHolderId
        );
        const SubData = {
          TaskId: afterTrimTaskId,
          TaskName: taskDataBefore?.TaskName,
          StartDate: taskDataBefore?.StartDate,
          EndDate: taskDataBefore?.EndDate,
          TimeLog: taskDataBefore?.TimeLog,
          Work: taskDataBefore?.Work,
          Progress: taskDataBefore?.Progress,
          Status: taskDataBefore?.Status,
          ParentId: taskDataDropPosition.ParentId,
          Priority: taskDataBefore?.Priority,
          Component: taskDataDropPosition.Component,
          type: "sub activity",
          BaselineStartDate: taskDataBefore?.BaselineStartDate,
          BaselineEndDate: taskDataBefore?.BaselineEndDate,
          evidence: taskDataBefore?.evidence,
          isSelection: taskDataBefore?.isSelection,
          remarks: taskDataBefore?.remarks,
          progressData: taskDataBefore?.progressData,
          category: taskDataDropPosition?.category,
          stakeHolderId: taskDataDropPosition?.stakeHolderId,
          stakeHolderName: taskDataDropPosition?.stakeHolderName,
          organizationId: taskDataBefore?.organizationId,
          createdBy: taskDataBefore?.createdBy,
          npdId: taskDataBefore?.npdId,
          dptId: taskDataDropPosition?.dptId,
          picId: taskDataDropPosition?.picId,
          pm: taskDataDropPosition?.pm,
          isDraggable: taskDataBefore?.isDraggable,
        };
        const result = await axios.put(
          `/api/npd/updateSingleGanttTask/${taskDataBefore?._id}`,
          {
            ...SubData,
          }
        );
        if (result?.status === 200 || result?.status === 201) {
          enqueueSnackbar("Updated Succesfully", {
            variant: "success",
          });
        }
      }
      // }
    }
    // console.log("args?.totalRecords 2", args)
    if (args?.requestType === "scroll" && args?.action === "VerticalScroll") {
      // const nextSkip = page + pageLimit;
      // if (nextSkip < totalCount ) {
      //   setPage((prev) => prev + 1);
      // }
      BaseLineUpdater(ganttInstance?.currentViewData);
    }
  };

  const actionValuesUpdate = async (args: any) => {
    if (args?.requestType === "virtualscroll" && args?.name === "actionBegin") {
      setPage(args?.virtualInfo?.page + 1);
      BaseLineUpdater(ganttInstance?.currentViewData);
    }
  };

  const replaceLastPartAfterHyphen = (str: string, newString: string) => {
    const parts = str.split("-");
    parts[parts.length - 1] = newString;
    return parts.join("-");
  };

  const milestoneTemplate = (props: any) => {
    if (!props.taskData?.isMileStone) return null; // Render nothing if not a milestone
    let milestoneColor = "";
    switch (props.taskData?.category) {
      case "Customer":
        milestoneColor = "red";
        break;
      case "Supplier":
        milestoneColor = "green";
        break;
      case userDetail?.organization?.realmName:
        milestoneColor = "yellow";
        break;
      default:
        milestoneColor = "gray"; // Fallback color
    }
    return (
      <div
        style={{
          width: "14px",
          height: "14px",
          backgroundColor: milestoneColor, // Dynamic color
          transform: "rotate(45deg)", // Diamond shape
          position: "relative",
          border: "1px solid black", // Optional: Border for visibility
        }}
      ></div>
    );
  };

  const loadingIndicator: any = {
    indicatorType: "Spinner",
  };

  const addDepartmentHandlerValue = (e: any, value: any, name: any) => {
    setActiveUserEntityId(e);
    findByDptInConfig(value);
  };

  const freezeAction = async () => {
    try {
      if (
        npdValueFull === "" ||
        npdValueFull === undefined ||
        npdValueFull === null
      ) {
        enqueueSnackbar(`Please Select NPD`, {
          variant: "error",
        });
      } else {
        const result = await axios.get(
          API_LINK +
            `/api/npd/updateManyGanttChartsFreeze/${npdValueFull?.value}`
        );
        if (result?.status === 200 || result?.status === 201) {
          enqueueSnackbar(`${result?.data}`, {
            variant: "success",
          });
        }
      }
    } catch (err) {
      console.log("err", err);
    }
  };

  const handleTaskbarEdited = async (args: any) => {
    console.log("args===>", args);
    const isPmUser = args?.data?.taskData?.pm?.includes(userInfo?.id);
    const isPicUser = args?.data?.taskData?.picId?.includes(userInfo?.id);
    const isAuthorizedUser = isPmUser || isPicUser;
    if (!isAuthorizedUser) {
      args.cancel = true;
      return;
    } else {
      const startDateConvert = await convertToISO(
        args?.data?.taskData?.StartDate
      );
      const endDateConvert = await convertToISO(args?.data?.taskData?.EndDate);
      if (
        args?.data &&
        endDateConvert !== undefined &&
        startDateConvert !== undefined
      ) {
        // Custom handling of date changes
        const payload = {
          StartDate: startDateConvert,
          EndDate: endDateConvert,
        };
        updateTaskGanttTask(args.data?.taskData?._id, payload).then(
          async (response: any) => {
            if (response.status === 200 || response.status === 201) {
              const updatedParentTask = ganttInstance?.currentViewData?.find(
                (record: any) =>
                  record?.ganttProperties?.taskId === response?.data?.ParentId
              );
              if (updatedParentTask) {
                const parentStartDate = updatedParentTask?.taskData?.StartDate;
                const parentEndDate = updatedParentTask?.taskData?.EndDate;
                const parentPayload = {
                  StartDate: await convertToISO(parentStartDate),
                  EndDate: await convertToISO(parentEndDate),
                };
                updateTaskGanttTask(
                  updatedParentTask?.taskData?._id,
                  parentPayload
                ).then(async (response: any) => {
                  if (response.status === 200 || response.status === 201) {
                    enqueueSnackbar(`Data Updated SuccessFully`, {
                      variant: "success",
                    });
                  }
                });
              }
            }
          }
        );
      }
    }
  };

  const convertToISO = (dateString: string) => {
    if (!dateString || isNaN(Date.parse(dateString))) {
      console.error("Invalid date:", dateString);
      return null;
    }
    const localDate = new Date(dateString);
    const utcDate = new Date(
      Date.UTC(
        localDate.getFullYear(),
        localDate.getMonth(),
        localDate.getDate(),
        0,
        0,
        0,
        0
      )
    );

    return utcDate.toISOString();
  };

  const handleTaskBarEditing = (args: any) => {
    const isPmUser = args?.data?.taskData?.pm?.includes(userInfo?.id);
    const isPicUser = args?.data?.taskData?.picId?.includes(userInfo?.id);
    const isAuthorizedUser = isPmUser || isPicUser;
    if (!isAuthorizedUser || args?.data?.taskData?.planFreeze === true) {
      args.cancel = true;
      // enqueueSnackbar(`You are not authorized to edit the taskbar!`, {
      //   variant: "error",
      // });
    }
  };

  //  const  dataSource: DataManager = new DataManager({
  //     url: 'http://localhost:5001/api/npd/getByIdNPDID/67617f6f1b043bf355af7e79',
  //     adaptor: new UrlAdaptor,
  //     crossDomain: true
  //   });
  // console.log("dataSource", dataSource);

  return (
    <div style={{ paddingTop: "20px" }}>
      <div
        style={{
          paddingBottom: "10px",
          display: "flex",
          gap: "10px",
          // justifyContent: "space-between",
        }}
      >
        {" "}
        {/* <div>
          <Button
            onClick={(e: any) => {
              navigate("/NPDNavbar");
            }}
          >
            Back
          </Button>
        </div> */}
        <div style={{ display: "flex", gap: "10px" }}>
          <Select
            placeholder="NPD Title/ Switch NPD"
            value={selectedNpd}
            style={{ width: "400px", color: "black" }}
            size="middle"
            showSearch
            optionFilterProp="children"
            onSearch={onSearch}
            filterOption={filterOption}
            onChange={(e: any, value: any) => {
              addDepartmentValues(e, value);
              onChangeFilterData(e);
              buttonStatusFreeze(value);
              setNpdValueFull(value);
              setSelectedNpd(value);
              setPage(1);
            }}
            options={npdFilterData}
          />
          <Button
            onClick={openStakeHolderModal}
            style={{ backgroundColor: "#00224E", color: "#FFF" }}
          >
            Add StakeHolder
          </Button>
          <Button
            onClick={openDptModel}
            style={{ backgroundColor: "#00224E", color: "#FFF" }}
          >
            Add Department
          </Button>
          {pa?.map((item: any) => item?.id)?.includes(userInfo?.id) &&
          freezeButtonStatus === false ? (
            <Button
              onClick={freezeAction}
              style={{ backgroundColor: "#00224E", color: "#FFF" }}
              disabled={freezeButtonStatus}
            >
              {data?.map((ele: any) => ele?.planFreeze)?.includes(true)
                ? "UnFreeze Plan"
                : "Finalise Plan"}
            </Button>
          ) : (
            ""
          )}
        </div>
        <div>{""}</div>
      </div>
      <div className="control-pane">
        <div className="control-section">
          <GanttComponent
            ref={(gantt) => setGanttInstance(gantt)}
            // ref={ganttRef}
            id="Overview"
            dataSource={data}
            treeColumnIndex={1}
            allowSelection={true}
            allowRowDragAndDrop={true}
            highlightWeekends={true}
            autoCalculateDateScheduling={true}
            workWeek={["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]}
            holidays={[
              { from: "2024-12-25", to: "2024-12-25", label: "Christmas" },
            ]}
            // dayWorkingTime={dayWorkingTime}
            // projectStartDate={new Date('01/02/2024')}
            // projectEndDate={new Date('12/01/2025')}
            actionBegin={actionValuesUpdate}
            load={load.bind(this)}
            taskFields={taskFields}
            timelineSettings={timelineSettings}
            labelSettings={labelSettings}
            splitterSettings={splitterSettings}
            taskbarTemplate={TaskbarTemplate.bind(this)}
            height="590px"
            gridLines={gridLines}
            allowFiltering={true}
            showColumnMenu={true}
            allowPdfExport={true}
            allowExcelExport={true}
            workUnit="Day"
            allowSorting={true}
            // enableContextMenu={true}
            rowHeight={40}
            allowResizing={true}
            toolbar={toolbarOptions}
            toolbarClick={barClickingHandler.bind(this)}
            editSettings={editSettings}
            rowSelecting={handleRowSelecting.bind(this)}
            // timezone={indianTime}
            renderBaseline={true}
            baselineColor={"#ddd"}
            rowDragStartHelper={rowDragStartHelper.bind(this)}
            rowDataBound={rowDragIconRender.bind(this)}
            actionComplete={handleActionComplete.bind(this)}
            milestoneTemplate={milestoneTemplate.bind(this)}
            enableVirtualization={true}
            loadChildOnDemand={true}
            enableVirtualMaskRow={false}
            // enableImmutableMode={true}
            enableTimelineVirtualization={true}
            loadingIndicator={loadingIndicator}
            // queryCellInfo={BaseLineUpdater.bind(this)}
            dataBound={() => BaseLineUpdater(data)}
            // dataStateChange={handleDataStateChange}
            taskbarEditing={handleTaskBarEditing}
            taskbarEdited={handleTaskbarEdited}
          >
            <ColumnsDirective>
              <ColumnDirective
                field="TaskId"
                headerText="Task Id"
                width="180"
                visible={false}
              ></ColumnDirective>
              <ColumnDirective
                field="TaskName"
                headerText="NPD/Department/Activity"
                width="250"
                clipMode="EllipsisWithTooltip"
                template={taskNameTemplates}
              ></ColumnDirective>
              <ColumnDirective
                field="PIC"
                headerText="PIC"
                allowSorting={false}
                width="140"
                template={template}
              ></ColumnDirective>
              <ColumnDirective
                field="Status"
                headerText="Status"
                minWidth="100"
                width="120"
                template={statusTemplate}
              ></ColumnDirective>
              <ColumnDirective
                field="StartDate"
                headerText="Start Date"
                minWidth="80"
                width="100"
                format="dd-MM-yyyy"
                visible={false}
              ></ColumnDirective>
              <ColumnDirective
                field="EndDate"
                headerText="EndDate"
                minWidth="80"
                width="100"
                format="dd-MM-yyyy"
                visible={false}
              ></ColumnDirective>
              <ColumnDirective
                field="BaselineStartDate"
                headerText="Actual StartDate"
                minWidth="80"
                width="100"
                format="dd-MM-yyyy"
                visible={false}
              ></ColumnDirective>
              <ColumnDirective
                field="BaselineEndDate"
                headerText="Actual EndDate"
                minWidth="80"
                width="100"
                format="dd-MM-yyyy"
                visible={false}
              ></ColumnDirective>
              <ColumnDirective
                field="Evidence Attach"
                headerText="Documents"
                minWidth="80"
                width="100"
                template={evidenceApplicableAttach}
              ></ColumnDirective>
            </ColumnsDirective>
            <EventMarkersDirective>
              <EventMarkerDirective
                day={eventMarkerDay}
                cssClass="e-custom-event-marker"
                label="Today"
              ></EventMarkerDirective>
            </EventMarkersDirective>
            <Inject
              services={[
                Edit,
                Selection,
                Toolbar,
                DayMarkers,
                ColumnMenu,
                Filter,
                Sort,
                Resize,
                DayMarkers,
                ExcelExport,
                PdfExport,
                ContextMenu,
                RowDD,
                VirtualScroll,
              ]}
            />
          </GanttComponent>
        </div>
      </div>
      <div></div>
      <Modal
        title={"Upload Files"}
        open={uploadModel}
        onCancel={closeModelUploadHandler}
        closeIcon={
          <MdClose
            style={{
              color: "#fff",
              backgroundColor: "#0E497A",
              borderRadius: "3px",
            }}
          />
        }
        footer={[
          <Button
            key="submit"
            type="primary"
            style={{ backgroundColor: "#003566", color: "#ffff" }}
            // onClick={() => {
            //   updatePcrInformationData("checking");
            // }}
          >
            Submit
          </Button>,
        ]}
        width="400px"
      >
        <>
          <div style={{ display: "grid" }}>
            <strong
              style={{
                color: "#003566",
                fontWeight: "bold",
                letterSpacing: "0.8px",
              }}
            ></strong>
            <Dragger
              accept=".pdf,.png,.jpeg,.jpg,.docx,.bmp,.tif,.tiff,.webp,.xlsx, .ppt"
              name="fileList"
              {...uploadFileprops}
              className={classes.uploadSection}
              showUploadList={false}
              fileList={fileList}
              multiple
              style={{ width: "100%" }}
              // disabled={readModeButton}
            >
              <p className="ant-upload-drag-icon">
                <MdInbox />
              </p>
              <p className="ant-upload-text">
                Click or drag files to this area to upload
              </p>
            </Dragger>
            {uploadLoading ? (
              <div>Please wait while documents get uploaded</div>
            ) : (
              fileList &&
              fileList?.length > 0 &&
              fileList?.map((item: any) => (
                <div
                  style={{
                    display: "flex",
                    marginLeft: "10px",
                    alignItems: "center",
                  }}
                  key={item.uid}
                >
                  <Typography className={classes.filename}>
                    {item?.name}
                  </Typography>

                  <IconButton onClick={() => clearFile(item)}>
                    <MdClear style={{ fontSize: "15px" }} />
                  </IconButton>
                </div>
              ))
            )}
          </div>
        </>
      </Modal>
      <Modal
        title={`${titleModel} Task`}
        open={openModel}
        onCancel={closeModelHandler}
        closeIcon={
          <MdClose
            style={{
              color: "#fff",
              backgroundColor: "#0E497A",
              borderRadius: "3px",
            }}
          />
        }
        footer={[
          !readMode || !disable ? (
            <>
              <Button
                key="submit"
                type="primary"
                style={{ backgroundColor: "#003566", color: "#ffff" }}
                onClick={() => {
                  addTaskData(titleModel);
                }}
              >
                Save
              </Button>
              <Button
                key="cancel"
                type="primary"
                style={{ backgroundColor: "#003566", color: "#ffff" }}
                onClick={closeModelRow}
              >
                Cancel
              </Button>
            </>
          ) : null,
        ]}
        width="1200px"
      >
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
              {/* {formData?.type === "department" ? (
                <Button
                  icon={<FundOutlined />}
                  onClick={() => {
                    setButtonValue(2);
                  }}
                  className={
                    buttonValue === 2
                      ? classes.buttonContainerActive
                      : classes.buttonContainer
                  }
                >
                  Owner
                </Button>
              ) : (
                ""
              )} */}
              {formData?.type === "activity" ||
              formData?.type === "sub activity" ? (
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
              ) : (
                ""
              )}

              {formData?.type === "activity" ? (
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
              {formData?.type === "activity" ||
              formData?.type === "sub activity" ? (
                <Button
                  icon={<AiOutlineDiff />}
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
              )}
              {/* <Button
                icon={<FundOutlined />}
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
                  formData.priority === "Normal"
                    ? "#FAE42C"
                    : formData.priority === "High"
                    ? "#F61745"
                    : "#00FF7F"
                }
              >
                {formData.priority}
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
                    style={{ backgroundColor: "#fff", borderRadius: "0px" }}
                    className={classes.descriptionLabelStyle}
                  >
                    <Form layout="vertical">
                      <Descriptions
                        bordered
                        size="default"
                        style={{ width: "100%" }}
                        column={{
                          xxl: 2, // or any other number of columns you want for xxl screens
                          xl: 2, // or any other number of columns you want for xl screens
                          lg: 2, // or any other number of columns you want for lg screens
                          md: 1, // or any other number of columns you want for md screens
                          sm: 2, // or any other number of columns you want for sm screens
                          xs: 2, // or any other number of columns you want for xs screens
                        }}
                      >
                        <Descriptions.Item
                          span={12}
                          label={
                            <>
                              <strong style={{ color: "red" }}>*</strong> Type :{" "}
                            </>
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
                            <div style={{ display: "flex" }}>
                              <Radio.Group
                                onChange={(e: any) => {
                                  addDataHandler("type", e.target.value);
                                }}
                                value={formData?.type}
                                disabled={titleModel === "Edit" ? true : false}
                                style={{ display: "flex" }}
                              >
                                {/* <Radio value={"npd"}>NPD</Radio>*/}
                                {titleModel === "Edit" ? (
                                  <Radio value={"department"}>Department</Radio>
                                ) : (
                                  ""
                                )}
                                <Radio value={"activity"}>Activity</Radio>
                                <Radio value={"sub activity"}>
                                  Sub Activity
                                </Radio>
                                {/* <Radio value={"milestone"}>
                                  Milestone
                                </Radio> */}
                              </Radio.Group>
                            </div>{" "}
                          </Form.Item>
                        </Descriptions.Item>
                        <Descriptions.Item
                          span={12}
                          label={
                            <>
                              <strong style={{ color: "red" }}>*</strong>{" "}
                              {formData?.type === "department"
                                ? "Department :"
                                : "Activity Name :"}{" "}
                            </>
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
                            <Row
                              style={{
                                display: "flex",
                                gap: "6px",
                                flexDirection: "row",
                              }}
                            >
                              <Input
                                value={formData.name}
                                onChange={(e: any) => {
                                  addDataHandler("name", e.target.value);
                                }}
                                // disabled={titleModel === "Edit" ? true : false}
                                disabled={readMode}
                                style={{ width: "85%" }}
                              />
                              {formData?.type === "department" ||
                              formData?.type === "Category" ? (
                                ""
                              ) : (
                                <Checkbox
                                  name="mileStone"
                                  checked={formData?.isMileStone}
                                  onChange={(e: any) => {
                                    addDataHandler(
                                      "isMileStone",
                                      e.target.checked
                                    );
                                  }}
                                  style={{ color: "black" }}
                                >
                                  Milestone
                                </Checkbox>
                              )}
                            </Row>
                          </Form.Item>
                        </Descriptions.Item>
                        {formData?.isMileStone === true ? (
                          <>
                            <Descriptions.Item
                              span={12}
                              label={
                                <>
                                  <strong style={{ color: "red" }}>*</strong>{" "}
                                  Stake Holder :{" "}
                                </>
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
                                  value={formData?.stakeHolder}
                                  disabled
                                  style={{ color: "black" }}
                                />
                                {/* <Autocomplete
                                  multiple={true}
                                  size="medium"
                                  id="tags-outlined"
                                  options={getAllUserData}
                                  style={{
                                    width: "100%",
                                    paddingTop: "1px",
                                    paddingBottom: "1px",
                                  }}
                                  getOptionLabel={getOptionLabel}
                                  value={formData?.owner}
                                  filterSelectedOptions
                                  onChange={(e, value) => {
                                    addDataHandler("owner", value);
                                  }}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      variant="outlined"
                                      placeholder="Select User"
                                      size="small"
                                      onChange={handleTextChange}
                                      InputLabelProps={{ shrink: false }}
                                    />
                                  )}
                                /> */}
                              </Form.Item>
                            </Descriptions.Item>
                          </>
                        ) : (
                          <>{}</>
                        )}
                        <Descriptions.Item
                          span={12}
                          label={
                            <>
                              <strong style={{ color: "red" }}>*</strong> Owner
                              :{" "}
                            </>
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
                            <Autocomplete
                              multiple={true}
                              size="medium"
                              // id="tags-outlined"
                              // options={getAllUserData?.filter((ele:any)=>ele?.entityId === formData?.deptId)}
                              id="tags-outlined"
                              options={getAllUserData?.filter(
                                (ele: any) => ele?.entityId === formData?.deptId
                              )}
                              style={{
                                width: "100%",
                                paddingTop: "1px",
                                paddingBottom: "1px",
                                color: "black",
                              }}
                              getOptionLabel={getOptionLabel}
                              value={formData?.owner || []}
                              className={ClassesDate?.dateData}
                              disabled={readMode}
                              filterSelectedOptions
                              onChange={(e: any, value: any) => {
                                addDataHandler("owner", value);
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
                        <Descriptions.Item
                          label={
                            <>
                              <strong style={{ color: "red" }}>*</strong> Plan
                              StartDate :{" "}
                            </>
                          }
                        >
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
                              disabled={
                                formData?.planFreese ||
                                formData?.type === "activity" ||
                                formData?.type === "sub activity"
                                  ? formData?.planFreeze &&
                                    pa?.some(
                                      (item: any) => item.id === userDetail?.id
                                    )
                                    ? false
                                    : formData?.planFreeze &&
                                      formData?.owner?.some(
                                        (item: any) =>
                                          item.id === userDetail?.id
                                      )
                                    ? true
                                    : !formData?.owner?.some(
                                        (item: any) =>
                                          item.id === userDetail?.id
                                      ) && readMode
                                  : readMode
                              }
                              value={formData.planStartDate}
                              onChange={(e: any) => {
                                addDataHandler("planStartDate", e.target.value);
                              }}
                              InputLabelProps={{
                                shrink: true,
                              }}
                              // inputProps={{
                              //   min: `${todayDate}`,
                              // }}
                            />
                          </Form.Item>
                        </Descriptions.Item>
                        <Descriptions.Item
                          label={
                            <>
                              <strong style={{ color: "red" }}>*</strong> Plan
                              EndDate :{" "}
                            </>
                          }
                        >
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
                              value={formData.planEndDate}
                              disabled={
                                formData?.planFreese ||
                                formData?.type === "activity" ||
                                formData?.type === "sub activity"
                                  ? formData?.isMileStone
                                    ? true
                                    : formData?.planFreeze &&
                                      pa?.some(
                                        (item: any) =>
                                          item.id === userDetail?.id
                                      )
                                    ? false
                                    : formData?.planFreeze &&
                                      formData?.owner?.some(
                                        (item: any) =>
                                          item.id === userDetail?.id
                                      )
                                    ? true
                                    : !formData?.owner?.some(
                                        (item: any) =>
                                          item.id === userDetail?.id
                                      ) && readMode
                                  : readMode
                              }
                              onChange={(e: any) => {
                                addDataHandler("planEndDate", e.target.value);
                              }}
                              InputLabelProps={{
                                shrink: true,
                              }}
                              inputProps={{
                                min: `${formData.planStartDate}`,
                              }}
                            />
                          </Form.Item>
                        </Descriptions.Item>
                        {/* {mileStoneStatus === false ?   <> */}
                        <Descriptions.Item
                          label={
                            <>
                              <strong style={{ color: "red" }}>*</strong>{" "}
                              Duration :{" "}
                            </>
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
                              value={formData?.duration}
                              disabled
                              onChange={(e: any) => {
                                addDataHandler("duration", e.target.value);
                              }}
                              type="Number"
                            />
                          </Form.Item>
                        </Descriptions.Item>
                        <Descriptions.Item
                          label={
                            <>
                              <strong style={{ color: "red" }}>*</strong>{" "}
                              Priority :{" "}
                            </>
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
                            <Select
                              placeholder="Select Priority"
                              style={{ width: "100%", color: "black" }}
                              size="large"
                              value={formData.priority}
                              disabled={
                                formData?.type === "activity" ||
                                formData?.type === "sub activity"
                                  ? formData?.planFreeze &&
                                    pa?.some(
                                      (item: any) => item.id === userDetail?.id
                                    )
                                    ? false
                                    : formData?.planFreeze &&
                                      formData?.owner?.some(
                                        (item: any) =>
                                          item.id === userDetail?.id
                                      )
                                    ? true
                                    : !formData?.owner?.some(
                                        (item: any) =>
                                          item.id === userDetail?.id
                                      ) && readMode
                                  : readMode
                              }
                              onChange={(e: any) => {
                                addDataHandler("priority", e);
                              }}
                              options={[
                                { value: "Normal", label: "Normal" },
                                { value: "High", label: "High" },
                              ]}
                            />
                          </Form.Item>
                        </Descriptions.Item>
                        {/* </>
                          :<>{''}</>} */}
                        {formData?.type === "activity" &&
                          Number(formData.progress) === 100 &&
                          pa?.some((ele: any) => ele?.id === userInfo?.id) && (
                            <Descriptions.Item
                              label={
                                <>
                                  <strong style={{ color: "red" }}>*</strong>{" "}
                                  Status :{" "}
                                </>
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
                                <Select
                                  placeholder="Select Status"
                                  style={{ width: "100%", color: "black" }}
                                  // size="large"
                                  value={formData.status}
                                  onChange={(e: any) => {
                                    addDataHandler("status", e);
                                  }}
                                  options={[
                                    {
                                      value: "In Progress",
                                      label: "In Progress",
                                    },
                                    // { value: "On Hold", label: "On Hold" },
                                    { value: "Completed", label: "Completed" },
                                  ]}
                                />
                              </Form.Item>
                            </Descriptions.Item>
                          )}
                      </Descriptions>
                    </Form>
                  </div>
                </div>
              </div>
            ) : buttonValue === 1 ? (
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
                    style={{ backgroundColor: "#fff", borderRadius: "0px" }}
                    className={classes.tableContainer}
                  >
                    <TableContainer component={Paper} variant="outlined">
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
                                // width: "30px",
                              }}
                            >
                              RowId
                            </TableCell> */}
                            <TableCell
                              style={{
                                color: "#00224E",
                                fontWeight: "bold",
                                padding: "5px",
                                fontSize: "13px",
                                // width: "160px",
                              }}
                            >
                              Department/Activity
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
                              Status
                            </TableCell>
                            <TableCell
                              style={{
                                color: "#00224E",
                                fontWeight: "bold",
                                padding: "5px",
                                fontSize: "13px",
                                width: "80px",
                              }}
                            >
                              Duration
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
                              Plan Startdate
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
                              Plan Enddate
                            </TableCell>
                            {/* <TableCell
                              style={{
                                color: "#00224E",
                                fontWeight: "bold",
                                padding: "5px",
                                fontSize: "13px",
                                width: "20px",
                              }}
                            >
                              Action
                            </TableCell> */}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {/* {tableDependencyData?.map((item: any, i: any) => {
                            return ( */}
                          <TableRow>
                            {/* <TableCell style={{ padding: "5px" }}>
                              <Input
                                value={filterByParentId[0]?.TaskId}
                                disabled
                                style={{ width: "100%" }}
                              />
                            </TableCell> */}
                            <TableCell style={{ padding: "5px" }}>
                              {/* {parentEdit ? (
                                <Select
                                  value={filterByParentId[0]?.TaskName || ""}
                                  onChange={handleDepartmentChange}
                                  showSearch
                                  style={{ width: "100%" }}
                                  placeholder="Select Task"
                                  optionFilterProp="children"
                                  filterOption={(input, option: any) =>
                                    option?.children
                                      .toLowerCase()
                                      .indexOf(input.toLowerCase()) >= 0
                                  }
                                >
                                  {parentOptions?.map((dept: any) => (
                                    <Option key={dept.id} value={dept.TaskName}>
                                      {dept.TaskName}
                                    </Option>
                                  ))}
                                </Select>
                              ) : ( */}
                              <Input
                                value={filterByParentId[0]?.TaskName}
                                disabled
                                style={{ width: "100%" }}
                              />
                            </TableCell>
                            <TableCell style={{ padding: "5px" }}>
                              <Input
                                value={filterByParentId[0]?.Status}
                                disabled
                              />
                            </TableCell>
                            <TableCell style={{ padding: "5px" }}>
                              <Input
                                value={filterByParentId[0]?.Duration}
                                disabled
                              />
                            </TableCell>
                            <TableCell style={{ padding: "5px" }}>
                              <Input
                                value={moment(
                                  filterByParentId[0]?.StartDate
                                ).format("DD-MM-YYYY")}
                                disabled
                              />
                            </TableCell>
                            <TableCell style={{ padding: "5px" }}>
                              <Row
                                style={{
                                  display: "flex",
                                  gap: "8px",
                                  flexDirection: "row",
                                }}
                              >
                                <Input
                                  value={moment(
                                    filterByParentId[0]?.EndDate
                                  ).format("DD-MM-YYYY")}
                                  disabled
                                  style={{ width: "98px" }}
                                />
                                {/* <Row
                                      style={{
                                        display: "grid",
                                        // paddingTop: "15px",
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}
                                    >
                                      <IconButton style={{ padding: "0px" }}>
                                        <Row style={{ display: "flex" }}>
                                          <IconButton
                                            style={{ padding: "0px" }}
                                          >
                                            {i ===
                                            tableDependencyData?.length - 1 ? (
                                              <MdAddCircle
                                                style={{
                                                  color: "#0E497A",
                                                  fontSize: "21px",
                                                }}
                                                // onClick={finalApprovalAddHandler}
                                              />
                                            ) : (
                                              <MdDelete
                                                style={{ fontSize: "21px" }}
                                                // onClick={() => {
                                                //   finalApprovalDeleteHandler(item);
                                                // }}
                                              />
                                            )}
                                          </IconButton>
                                        </Row>
                                      </IconButton>
                                    </Row> */}
                              </Row>
                            </TableCell>
                          </TableRow>
                          {/* );
                          })} */}
                        </TableBody>
                      </Table>
                    </TableContainer>
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
                      style={{ backgroundColor: "#fff", borderRadius: "0px" }}
                      className={classes.descriptionLabelStyle}
                    >
                      <Form layout="vertical">
                        <Descriptions
                          bordered
                          size="small"
                          style={{ width: "100%" }}
                          column={{
                            xxl: 2, // or any other number of columns you want for xxl screens
                            xl: 2, // or any other number of columns you want for xl screens
                            lg: 2, // or any other number of columns you want for lg screens
                            md: 1, // or any other number of columns you want for md screens
                            sm: 2, // or any other number of columns you want for sm screens
                            xs: 2, // or any other number of columns you want for xs screens
                          }}
                        >
                          <Descriptions.Item
                            label={
                              <>
                                <strong style={{ color: "red" }}>*</strong>{" "}
                                Status :{" "}
                              </>
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
                              <Select
                                placeholder="Select Status"
                                style={{ width: "100%", color: "black" }}
                                // size="large"
                                value={formData.status}
                                onChange={(e: any) => {
                                  addDataHandler("status", e);
                                }}
                                options={[
                                  {
                                    value: "In Progress",
                                    label: "In Progress",
                                  },
                                  // { value: "On Hold", label: "On Hold" },
                                  { value: "Completed", label: "Completed" },
                                ]}
                                disabled
                                // disabled={
                                //   titleModel === "Add"
                                //     ? false
                                //     : selectedData?.taskData?.progressData
                                //         ?.length === 0 && titleModel === "Edit"
                                //     ? false
                                //     : true
                                // }
                              />
                            </Form.Item>
                          </Descriptions.Item>
                          <Descriptions.Item
                            label={
                              <>
                                <strong style={{ color: "red" }}>*</strong>{" "}
                                Percentage of Progress :{" "}
                              </>
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
                                value={formData.progress}
                                type="Number"
                                onChange={(e: any) => {
                                  addDataHandler("progress", e.target.value);
                                }}
                                disabled
                                // disabled={
                                //   titleModel === "Add"
                                //     ? false
                                //     : selectedData?.taskData?.progressData
                                //         ?.length === 0 &&
                                //       (selectedData?.taskData?.picId?.includes(
                                //         userDetail?.id
                                //       ) ||
                                //         selectedData?.taskData?.pm?.includes(
                                //           userDetail?.id
                                //         ))
                                //     ? false
                                //     : true
                                // }
                              />
                            </Form.Item>
                          </Descriptions.Item>
                          <Descriptions.Item
                            label={
                              <>
                                <strong style={{ color: "red" }}>*</strong>{" "}
                                Actual StartDate :{" "}
                              </>
                            }
                          >
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
                                value={formData.BaselineStartDate}
                                disabled={
                                  !selectedData?.taskData?.picId?.includes(
                                    userDetail?.id
                                  )
                                }
                                onChange={(e: any) => {
                                  addDataHandler(
                                    "BaselineStartDate",
                                    e.target.value
                                  );
                                }}
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                inputProps={{
                                  min: `${formData?.planStartDate}`,
                                }}
                              />
                            </Form.Item>
                          </Descriptions.Item>
                          <Descriptions.Item
                            label={
                              <>
                                <strong style={{ color: "red" }}>*</strong>
                                {/* {
                              formData?.progress === 100
                                ? "Actual EndDate"
                                : "Date of Updation :"
                            }{" "} */}
                                Actual EndDate
                              </>
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
                                inputProps={{
                                  max: `${todayDate}`,
                                  min: `${todayDate}`,
                                }}
                                // disabled={
                                //   titleModel === "Add"
                                //     ? false
                                //     : selectedData?.taskData?.progressData
                                //         ?.length === 0 &&
                                //       (!selectedData?.taskData?.picId?.includes(
                                //         userDetail?.id
                                //       ) ||
                                //         selectedData?.taskData?.pm?.includes(
                                //           userDetail?.id
                                //         ))
                                //     ? false
                                //     : true
                                // }
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
                    {titleModel === "Edit" ? (
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
                          <AccordionDetails className={ClassesDate.headingRoot}>
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
                                          width: "600px",
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
                                        Overall Progress
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
                                        {progressUpdate?.length === 0 ? (
                                          <Button
                                            style={{
                                              backgroundColor: "#00224E",
                                              color: "#fff",
                                              height: "20px",
                                            }}
                                            disabled={disable}
                                            onClick={() => {
                                              addMoreProgressData();
                                            }}
                                          >
                                            Add
                                          </Button>
                                        ) : (
                                          ""
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {progressUpdate?.map(
                                      (ele: any, index: any) => {
                                        return (
                                          <TableRow>
                                            {/* <TableCell style={{padding:"5px"}}>
                                      <Input value={ele.progressVersion}  onChange={(e)=>{
                                        addValuesProgressTable(ele, 'progressVersion' , e.target.value)
                                      }} style={{ width: "100%", color: "black" }} disabled={ele.buttonStatus} />
                                    </TableCell> */}
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
                                                  addValuesProgressTable(
                                                    ele,
                                                    "progressComment",
                                                    e.target.value
                                                  );
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
                                                  addValuesProgressTable(
                                                    ele,
                                                    "updatedDate",
                                                    e.target.value
                                                  );
                                                }}
                                                InputLabelProps={{
                                                  shrink: true,
                                                }}
                                                // inputProps={{
                                                //   max: `${todayDate}`,
                                                //   min : `${todayDate}`
                                                // }}
                                                disabled={ele.buttonStatus}
                                              />
                                            </TableCell>
                                            <TableCell
                                              style={{ padding: "5px" }}
                                            >
                                              <Input
                                                value={ele.taskProgress}
                                                onChange={(e) => {
                                                  addValuesProgressTable(
                                                    ele,
                                                    "taskProgress",
                                                    e.target.value
                                                  );
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
                                                  // size="small"
                                                  value={ele.status}
                                                  onChange={(e) => {
                                                    addValuesProgressTable(
                                                      ele,
                                                      "status",
                                                      e
                                                    );
                                                  }}
                                                  options={
                                                    ele?.taskProgress === "100"
                                                      ? [
                                                          {
                                                            value:
                                                              "In Progress",
                                                            label:
                                                              "In Progress",
                                                          },
                                                          {
                                                            value: "Completed",
                                                            label: "Completed",
                                                          },
                                                        ]
                                                      : [
                                                          {
                                                            value:
                                                              "In Progress",
                                                            label:
                                                              "In Progress",
                                                          },
                                                        ]
                                                  }
                                                  disabled={ele.buttonStatus}
                                                />
                                                <Row>
                                                  {ele.addHandlerButtonStatus ===
                                                  false ? (
                                                    <IconButton
                                                      style={{
                                                        padding: "0px",
                                                        margin: "0px",
                                                      }}
                                                      onClick={() => {
                                                        updateProgressValues(
                                                          ele
                                                        );
                                                      }}
                                                    >
                                                      <MdOutlineCheckCircle
                                                        style={{
                                                          color: "#00224E",
                                                          fontSize: "20px",
                                                        }}
                                                      />
                                                    </IconButton>
                                                  ) : (
                                                    <Row
                                                      style={{
                                                        display: "flex",
                                                        gap: "10px",
                                                        alignItems: "center",
                                                      }}
                                                    >
                                                      {index === 0 ? (
                                                        <>
                                                          {editButtonStatusProgress ===
                                                            true &&
                                                          editProgressEditId ===
                                                            ele.id ? (
                                                            <>
                                                              <IconButton
                                                                style={{
                                                                  padding:
                                                                    "0px",
                                                                }}
                                                                onClick={() => {
                                                                  updateEditUpdateProgressValue(
                                                                    ele
                                                                  );
                                                                }}
                                                              >
                                                                <MdCheckBox
                                                                  style={{
                                                                    color:
                                                                      "#0E497A",
                                                                    fontSize:
                                                                      "20px",
                                                                  }}
                                                                />
                                                              </IconButton>
                                                            </>
                                                          ) : (
                                                            <>
                                                              <div
                                                                onClick={() => {
                                                                  updateEditProgressValue(
                                                                    ele
                                                                  );
                                                                }}
                                                                style={{
                                                                  cursor:
                                                                    "pointer",
                                                                }}
                                                              >
                                                                <img
                                                                  src={
                                                                    EditImgIcon
                                                                  }
                                                                  style={{
                                                                    width:
                                                                      "20px",
                                                                    height:
                                                                      "20px",
                                                                  }}
                                                                />
                                                              </div>
                                                            </>
                                                          )}
                                                        </>
                                                      ) : (
                                                        ""
                                                      )}
                                                      {index === 0 &&
                                                      ele.taskProgress < 100 ? (
                                                        <IconButton
                                                          style={{
                                                            padding: "0px",
                                                            margin: "0px",
                                                          }}
                                                          onClick={() => {
                                                            addMoreProgressData();
                                                          }}
                                                        >
                                                          <Tooltip title="Add More Row">
                                                            <MdAddCircle
                                                              style={{
                                                                color:
                                                                  "#0E497A",
                                                                fontSize:
                                                                  "20px",
                                                              }}
                                                            />
                                                          </Tooltip>
                                                        </IconButton>
                                                      ) : (
                                                        <></>
                                                      )}
                                                    </Row>
                                                  )}
                                                </Row>
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
                    ) : (
                      ""
                    )}
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
                      style={{ backgroundColor: "#fff", borderRadius: "0px" }}
                      className={classes.tableContainer}
                    >
                      <TableContainer component={Paper} variant="outlined">
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
                            {evidenceUpDateData?.map((item: any, i: any) => {
                              return (
                                <TableRow key={item.id}>
                                  <TableCell style={{ padding: "5px" }}>
                                    <Input
                                      value={item.evidenceName}
                                      placeholder="Evidence"
                                      onChange={(e: any) => {
                                        updateEvdUpDateAccept(
                                          item,
                                          "evidenceName",
                                          e.target.value
                                        );
                                      }}
                                      disabled={item?.buttonStatus}
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
                                        {...uploadFilepropsEvdUpDate(item)}
                                        className={classes.uploadSection}
                                        id={item.id}
                                        disabled={item.buttonStatus}
                                        showUploadList={false}
                                      >
                                        <Button
                                          disabled={disable}
                                          icon={<FiUpload />}
                                        >
                                          Upload
                                        </Button>
                                      </Upload>
                                      <Popover
                                        content={
                                          <div>
                                            {item?.evidenceAttachment?.map(
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
                                                    {!disable && (
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
                                                            padding: "0px",
                                                          }}
                                                          disabled={disable}
                                                        >
                                                          <MdDelete
                                                            style={{
                                                              color: "#FC5B73",
                                                              fontSize: "15px",
                                                            }}
                                                          />
                                                        </IconButton>
                                                      </Popconfirm>
                                                    )}
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
                                            item?.evidenceAttachment?.length
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
                                  <TableCell style={{ padding: "5px" }}>
                                    <Row
                                      style={{
                                        display: "flex",
                                        gap: "25px",
                                        paddingLeft: "10px",
                                      }}
                                    >
                                      {item?.accept === false &&
                                      item?.reject === false ? (
                                        <>
                                          <IconButton
                                            style={{
                                              margin: "0px",
                                              padding: "0px",
                                            }}
                                            disabled={disable}
                                            onClick={() => {
                                              updateEvdUpDateAccept(
                                                item,
                                                "accept",
                                                true
                                              );
                                            }}
                                          >
                                            <Tooltip title={"Accept"}>
                                              <MdOutlineCheckCircle
                                                style={{
                                                  color: "green",
                                                  fontSize: "20px",
                                                  cursor: "pointer",
                                                }}
                                              />
                                            </Tooltip>
                                          </IconButton>
                                          <IconButton
                                            style={{
                                              margin: "0px",
                                              padding: "0px",
                                            }}
                                            disabled={disable}
                                            onClick={() => {
                                              updateEvdUpDateAccept(
                                                item,
                                                "reject",
                                                true
                                              );
                                            }}
                                          >
                                            <Tooltip title={"Reject"}>
                                              <MdHighlightOff
                                                style={{
                                                  color: "red",
                                                  fontSize: "20px",
                                                  cursor: "pointer",
                                                }}
                                              />
                                            </Tooltip>
                                          </IconButton>
                                        </>
                                      ) : (
                                        <>
                                          {item?.accept === true ? (
                                            <IconButton
                                              style={{
                                                margin: "0px",
                                                padding: "0px",
                                              }}
                                              disabled={disable}
                                              //  onClick={()=>{
                                              //   updateEvdUpDateAccept(data, 'accept', true)
                                              // }}
                                            >
                                              <Tooltip title={"Accept"}>
                                                <MdOutlineCheckCircle
                                                  style={{
                                                    color: "green",
                                                    fontSize: "20px",
                                                    cursor: "pointer",
                                                  }}
                                                />
                                              </Tooltip>
                                            </IconButton>
                                          ) : (
                                            ""
                                          )}
                                          {item?.reject === true ? (
                                            <IconButton
                                              style={{
                                                margin: "0px",
                                                padding: "0px",
                                              }}
                                              disabled={disable}
                                              // onClick={()=>{
                                              //   updateEvdUpDateAccept(data, 'reject', true)
                                              // }}
                                            >
                                              <Tooltip title={"Reject"}>
                                                <MdHighlightOff
                                                  style={{
                                                    color: "red",
                                                    fontSize: "20px",
                                                    cursor: "pointer",
                                                  }}
                                                />
                                              </Tooltip>
                                            </IconButton>
                                          ) : (
                                            ""
                                          )}
                                        </>
                                      )}
                                    </Row>
                                  </TableCell>
                                  <TableCell style={{ padding: "5px" }}>
                                    <Accordion
                                      className={ClassesDate.headingRoot}
                                    >
                                      <AccordionSummary
                                        expandIcon={
                                          <MdExpandMore
                                            style={{ padding: "3px" }}
                                          />
                                        }
                                        aria-controls="panel1a-content"
                                        id="panel1a-header"
                                        className={ClassesDate.summaryRoot}
                                        style={{
                                          margin: "0px",
                                          height: "10px",
                                        }}
                                      >
                                        View/Add Remarks
                                      </AccordionSummary>
                                      <AccordionDetails
                                        className={ClassesDate.headingRoot}
                                      >
                                        <div
                                          style={{
                                            display: "grid",
                                            gap: "5px",
                                          }}
                                        >
                                          {item?.remarks?.map(
                                            (dd: any, index: any) => {
                                              const color = stringToColor(
                                                dd?.user
                                              );
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
                                                          backgroundColor:
                                                            color,
                                                          color: "#fde3cf",
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
                                                        borderRadius: "5px",
                                                        display: "flex",
                                                        justifyContent:
                                                          "center",
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
                                                    {dd.attachment?.map(
                                                      (ele: any) => {
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
                                              value={addMessage.remarks}
                                              maxLength={5000}
                                              style={{
                                                width: "140px",
                                                color: "black",
                                              }}
                                              disabled={disable}
                                              onChange={(e: any) => {
                                                readMsgHandler(e.target.value);
                                              }}
                                            />
                                            <Upload
                                              {...uploadFileProps()}
                                              className={classes.uploadSection}
                                              id={"1"}
                                              showUploadList={false}
                                            >
                                              <IconButton
                                                style={{
                                                  margin: "0pa",
                                                  padding: "5px",
                                                }}
                                                disabled={disable}
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
                                              disabled={disable}
                                              onClick={() => {
                                                addSubmitMsgHandler(
                                                  "evidence",
                                                  item
                                                );
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
                                    >
                                      <Row
                                        style={{
                                          display: "flex",
                                          // paddingTop: "15px",
                                          gap: "5px",
                                          alignItems: "center",
                                          justifyContent: "center",
                                        }}
                                      >
                                        {item.addButtonStatus === false ? (
                                          <IconButton
                                            style={{ padding: "0px" }}
                                            disabled={disable}
                                            onClick={() => {
                                              addEditEvdValues(item);
                                            }}
                                          >
                                            <MdOutlineCheckCircle
                                              style={{
                                                color: "#0E497A",
                                                fontSize: "20px",
                                              }}
                                            />
                                          </IconButton>
                                        ) : (
                                          <div
                                            style={{
                                              display: "flex",
                                              // paddingTop: "15px",
                                              gap: "5px",
                                              alignItems: "center",
                                              // justifyContent: "center",
                                            }}
                                          >
                                            {evdEditStatus === true &&
                                            evdEditId === item.id ? (
                                              <>
                                                <IconButton
                                                  style={{ padding: "0px" }}
                                                  disabled={readMode}
                                                  onClick={() => {
                                                    updateEvdValuesByChart(
                                                      item
                                                    );
                                                  }}
                                                >
                                                  <MdAddCircle
                                                    style={{
                                                      color: "#0E497A",
                                                      fontSize: "20px",
                                                    }}
                                                  />
                                                </IconButton>
                                              </>
                                            ) : (
                                              <>
                                                {!readMode && (
                                                  <div
                                                    onClick={() => {
                                                      updateEditEvdValues(item);
                                                    }}
                                                    style={{
                                                      cursor: "pointer",
                                                    }}
                                                  >
                                                    <img
                                                      src={EditImgIcon}
                                                      style={{
                                                        width: "20px",
                                                        height: "20px",
                                                      }}
                                                    />
                                                  </div>
                                                )}
                                              </>
                                            )}
                                            <Popconfirm
                                              placement="top"
                                              title={
                                                "Are you sure to delete Data"
                                              }
                                              onConfirm={() => {
                                                deleteEditEvdValues(item);
                                              }}
                                              okText="Yes"
                                              cancelText="No"
                                            >
                                              {!readMode && (
                                                <div
                                                  style={{ cursor: "pointer" }}
                                                >
                                                  <img
                                                    src={DeleteImgIcon}
                                                    style={{
                                                      width: "20px",
                                                      height: "20px",
                                                    }}
                                                  />
                                                </div>
                                              )}
                                            </Popconfirm>
                                            {i === 0 ? (
                                              <IconButton
                                                style={{
                                                  margin: "0px",
                                                  padding: "0px",
                                                }}
                                                disabled={readMode}
                                                onClick={() => {
                                                  addEvdMoreAddHoc();
                                                }}
                                              >
                                                <MdAddCircle
                                                  style={{
                                                    color: "#0E497A",
                                                    fontSize: "20px",
                                                  }}
                                                />
                                              </IconButton>
                                            ) : (
                                              ""
                                            )}
                                          </div>
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
                      <AccordionDetails className={ClassesDate.headingRoot}>
                        <div style={{ display: "grid", gap: "5px" }}>
                          {remarksData?.map((dd: any, index: any) => {
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
                                <div style={{ width: "40px", height: "40px" }}>
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
                                        dd?.user?.charAt(0)?.toUpperCase()}
                                    </Avatar>
                                  </Tooltip>
                                </div>
                                <div style={{ display: "grid", gap: "4px" }}>
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
                          })}
                          <div
                            style={{
                              display: "flex",
                              gap: "10px",
                              paddingTop: "10px",
                            }}
                          >
                            <TextArea
                              rows={2}
                              placeholder="Enter Remarks"
                              value={addMessage.remarks}
                              maxLength={5000}
                              disabled={readMode}
                              style={{ width: "400px", color: "black" }}
                              onChange={(e: any) => {
                                readMsgHandler(e.target.value);
                              }}
                            />
                            <Upload
                              {...uploadFileProps()}
                              className={classes.uploadSection}
                              id={"1"}
                              showUploadList={false}
                            >
                              <IconButton
                                style={{ margin: "0pa", padding: "5px" }}
                                disabled={readMode}
                              >
                                <MdAttachment
                                  style={{ color: "#00224E", fontSize: "20px" }}
                                />{" "}
                              </IconButton>
                            </Upload>

                            <IconButton
                              style={{ margin: "0pa", padding: "5px" }}
                              disabled={readMode}
                              onClick={() => {
                                addSubmitMsgHandler("task", "");
                              }}
                            >
                              <MdSend
                                style={{ color: "#00224E", fontSize: "20px" }}
                              />
                            </IconButton>
                          </div>
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
      </Modal>
      <Modal
        title={`Add Department for ${npdValueFull?.label}`}
        open={isDepartment}
        onCancel={closeDptModel}
        closeIcon={
          <MdClose
            style={{
              color: "#fff",
              backgroundColor: "#0E497A",
              borderRadius: "3px",
            }}
          />
        }
        footer={[
          <Button
            key="submit-1"
            type="primary"
            style={{ backgroundColor: "#003566", color: "#ffff" }}
            onClick={() => {
              // addTaskData();
              submitHandlerDept();
            }}
          >
            Save
          </Button>,
          <Button
            type="primary"
            style={{ backgroundColor: "#003566", color: "#ffff" }}
            onClick={closeDptModel}
          >
            Cancel
          </Button>,
        ]}
        width="900px"
      >
        <div>
          <div
            style={{
              padding: "10px 10px",
              backgroundColor: "#F7F7FF",
              borderRadius: "8px",
            }}
          >
            <div
              style={{ backgroundColor: "#fff", borderRadius: "0px" }}
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
                  <Descriptions.Item label="StakeHolder :">
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
                        value={departmentAddForm.stakeHolder}
                        style={{ width: "250px", borderRadius: "1px" }}
                        size="middle"
                        onChange={(e: any, value: any) => {
                          // setActiveUserEntityId(e);
                          // findByDptInConfig(value);
                          setDepartmentAddForm({
                            ...departmentAddForm,
                            stakeHolder: value,
                          });
                        }}
                        // className={classesForm.inputStye}
                        showSearch
                        placeholder="Select  StakeHolder"
                        optionFilterProp="children"
                        onSearch={onSearch}
                        filterOption={filterOption}
                        options={stakeHolderDropList}
                      />
                    </Form.Item>
                  </Descriptions.Item>
                  <Descriptions.Item label="Department :">
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
                        value={departmentAddForm?.department}
                        style={{ width: "250px", borderRadius: "1px" }}
                        size="middle"
                        onChange={(e: any, value: any) => {
                          addDepartmentHandlerValue(e, value, "department");
                        }}
                        // className={classesForm.inputStye}
                        showSearch
                        placeholder="Select  Department"
                        optionFilterProp="children"
                        onSearch={onSearch}
                        filterOption={filterOption}
                        options={departmentOption}
                      />
                    </Form.Item>
                  </Descriptions.Item>
                  <Descriptions.Item span={12} label="PIC :">
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
                          width: "auto",
                          paddingTop: "1px",
                          paddingBottom: "1px",
                        }}
                        getOptionLabel={getOptionLabel}
                        value={departmentAddForm?.pic || []}
                        // isOptionEqualToValue={(option: any, value: any) =>
                        //   option?.id === value?.id
                        // }
                        filterSelectedOptions
                        onChange={(e, value: any) => {
                          setDepartmentAddForm({
                            ...departmentAddForm,
                            pic: value,
                          });
                        }}
                        renderInput={(params) => (
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
            <div style={{ paddingTop: "10px" }}>
              <TableContainer component={Paper} style={{ overflow: "hidden" }}>
                <Table>
                  <TableHead
                    style={{ backgroundColor: "#E8F3F9", color: "#00224E" }}
                  >
                    <TableRow>
                      <TableCell
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                          width: "60px",
                        }}
                      >
                        Sl No.
                      </TableCell>
                      <TableCell
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                          width: "270px",
                        }}
                      >
                        Activity
                      </TableCell>
                      <TableCell
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                          width: "300px",
                        }}
                      >
                        Evidence
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {departmentDataTable?.map((item: any, index: any) => {
                      const isRowExpanded = expandedRows[item.id];
                      return (
                        <>
                          <TableRow>
                            <TableCell style={{ padding: "5px" }}>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "row",
                                  gap: "5px",
                                  alignItems: "center",
                                }}
                                key={item.id}
                              >
                                {item?.subtask?.length === 0 ? (
                                  <div style={{ width: "24px" }}>{""}</div>
                                ) : (
                                  <IconButton
                                    aria-label="expand row"
                                    size="small"
                                    onClick={() => toggleRow(item.id)}
                                  >
                                    {isRowExpanded ? (
                                      <MdExpandMore
                                        style={{
                                          fontSize: "23px",
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
                                      <MdExpandLess
                                        style={{
                                          fontSize: "23px",
                                          color: "#0E497A",
                                          backgroundColor: "#F8F9F9",
                                          borderRadius: "50%",
                                        }}
                                      />
                                      // </Badge>
                                    )}
                                  </IconButton>
                                )}

                                {index + 1}
                              </div>
                            </TableCell>
                            <TableCell style={{ padding: "5px" }}>
                              <Input
                                placeholder="Enter Activity Name"
                                value={item.activity}
                                onChange={(e) => {
                                  mainTaskValuesHandler(
                                    "activity",
                                    item.id,
                                    e.target.value
                                  );
                                }}
                                disabled={item.buttonStatus}
                              />
                            </TableCell>
                            <TableCell style={{ padding: "5px" }}>
                              <Row style={{ display: "flex", gap: "5px" }}>
                                <Accordion
                                  className={ClassesDate.headingRoot}
                                  style={{ width: "310px" }}
                                  key={item.id}
                                >
                                  <AccordionSummary
                                    expandIcon={
                                      <MdExpandMore
                                        style={{ padding: "3px" }}
                                      />
                                    }
                                    aria-controls="panel1a-content"
                                    id="panel1a-header"
                                    className={ClassesDate.summaryRoot}
                                    style={{ margin: "0px", height: "10px" }}
                                  >
                                    Add/View Evidence
                                  </AccordionSummary>
                                  <AccordionDetails
                                    className={ClassesDate.headingRoot}
                                    key={item.id}
                                  >
                                    <div
                                      style={{ display: "grid", gap: "3px" }}
                                    >
                                      {item?.evidence?.map(
                                        (ele: any, inx: any) => {
                                          return (
                                            <div
                                              style={{
                                                display: "flex",
                                                gap: "5px",
                                              }}
                                            >
                                              <Input
                                                placeholder="Enter Evidence"
                                                style={{ width: "230px" }}
                                                value={ele.evidenceName}
                                                onChange={(e) => {
                                                  evidenceValueHandler(
                                                    "evidenceName",
                                                    item.id,
                                                    ele.id,
                                                    e.target.value
                                                  );
                                                }}
                                                disabled={ele.buttonStatus}
                                              />
                                              <Row
                                                style={{
                                                  display: "flex",
                                                  // paddingTop: "15px",
                                                  gap: "5px",
                                                  alignItems: "center",
                                                  justifyContent: "center",
                                                }}
                                              >
                                                {ele.addButtonStatus ===
                                                false ? (
                                                  <>
                                                    <IconButton
                                                      style={{ padding: "0px" }}
                                                      onClick={() => {
                                                        evidenceSubmitHandler(
                                                          item.id,
                                                          ele
                                                        );
                                                      }}
                                                    >
                                                      <MdOutlineCheckCircle
                                                        style={{
                                                          color: "#0E497A",
                                                          fontSize: "20px",
                                                        }}
                                                      />
                                                    </IconButton>
                                                  </>
                                                ) : (
                                                  <div
                                                    style={{
                                                      display: "flex",
                                                      // paddingTop: "15px",
                                                      gap: "5px",
                                                      alignItems: "center",
                                                      // justifyContent: "center",
                                                    }}
                                                  >
                                                    {evidenceTaskStatus ===
                                                      true &&
                                                    evidenceTaskId ===
                                                      ele.id ? (
                                                      <>
                                                        <IconButton
                                                          style={{
                                                            padding: "0px",
                                                          }}
                                                          onClick={() => {
                                                            evidenceUpDateHandler(
                                                              item.id,
                                                              ele
                                                            );
                                                          }}
                                                        >
                                                          <MdAddCircle
                                                            style={{
                                                              color: "#0E497A",
                                                              fontSize: "20px",
                                                            }}
                                                          />
                                                        </IconButton>
                                                      </>
                                                    ) : (
                                                      <>
                                                        <div
                                                          onClick={() => {
                                                            evidenceEditHandler(
                                                              item.id,
                                                              ele
                                                            );
                                                          }}
                                                          style={{
                                                            cursor: "pointer",
                                                          }}
                                                        >
                                                          <img
                                                            src={EditImgIcon}
                                                            style={{
                                                              width: "16px",
                                                              height: "16px",
                                                            }}
                                                          />
                                                        </div>
                                                      </>
                                                    )}
                                                    <Popconfirm
                                                      placement="top"
                                                      title={
                                                        "Are you sure to delete Data"
                                                      }
                                                      onConfirm={() => {
                                                        evidenceDeleteHandler(
                                                          item.id,
                                                          ele
                                                        );
                                                      }}
                                                      okText="Yes"
                                                      cancelText="No"
                                                    >
                                                      <div
                                                        style={{
                                                          cursor: "pointer",
                                                        }}
                                                      >
                                                        <img
                                                          src={DeleteImgIcon}
                                                          style={{
                                                            width: "16px",
                                                            height: "16px",
                                                          }}
                                                        />
                                                      </div>
                                                    </Popconfirm>
                                                    {inx ===
                                                    item?.evidence?.length -
                                                      1 ? (
                                                      <IconButton
                                                        style={{
                                                          padding: "0px",
                                                        }}
                                                        onClick={() => {
                                                          evidenceSubTaskHandler(
                                                            item.id
                                                          );
                                                        }}
                                                      >
                                                        <MdControlPoint
                                                          style={{
                                                            color: "#0E497A",
                                                            fontSize: "16px",
                                                          }}
                                                        />
                                                      </IconButton>
                                                    ) : (
                                                      ""
                                                    )}
                                                  </div>
                                                )}
                                              </Row>
                                            </div>
                                          );
                                        }
                                      )}
                                    </div>
                                  </AccordionDetails>
                                </Accordion>
                                <Row
                                  style={{
                                    display: "flex",
                                    // paddingTop: "15px",
                                    gap: "5px",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  {item.addButtonStatus === false ? (
                                    <>
                                      <IconButton
                                        style={{ padding: "0px" }}
                                        onClick={() => {
                                          mainTaskSubmitHandler(item);
                                        }}
                                      >
                                        <MdOutlineCheckCircle
                                          style={{
                                            color: "#0E497A",
                                            fontSize: "20px",
                                          }}
                                        />
                                      </IconButton>
                                      <IconButton
                                        style={{ padding: "0px" }}
                                        onClick={() => {
                                          subTaskAddHandler(item.id);
                                        }}
                                      >
                                        <Tooltip title="Add SubTask">
                                          <MdLibraryAdd
                                            style={{
                                              color: "#0E497A",
                                              fontSize: "20px",
                                            }}
                                          />
                                        </Tooltip>
                                      </IconButton>
                                    </>
                                  ) : (
                                    <div
                                      style={{
                                        display: "flex",
                                        // paddingTop: "15px",
                                        gap: "5px",
                                        alignItems: "center",
                                        // justifyContent: "center",
                                      }}
                                    >
                                      {mainTaskStatus === true &&
                                      mainTaskId === item.id ? (
                                        <>
                                          <IconButton
                                            style={{ padding: "0px" }}
                                            onClick={() => {
                                              mainTaskUpdateHandler(item);
                                            }}
                                          >
                                            <MdAddCircle
                                              style={{
                                                color: "#0E497A",
                                                fontSize: "20px",
                                              }}
                                            />
                                          </IconButton>
                                        </>
                                      ) : (
                                        <>
                                          <div
                                            onClick={() => {
                                              mainTaskEditHandler(item);
                                            }}
                                            style={{ cursor: "pointer" }}
                                          >
                                            <img
                                              src={EditImgIcon}
                                              style={{
                                                width: "20px",
                                                height: "20px",
                                              }}
                                            />
                                          </div>
                                        </>
                                      )}
                                      <Popconfirm
                                        placement="top"
                                        title={"Are you sure to delete Data"}
                                        onConfirm={() => {
                                          mainTaskDeleteHandler(item.id);
                                        }}
                                        okText="Yes"
                                        cancelText="No"
                                      >
                                        <div style={{ cursor: "pointer" }}>
                                          <img
                                            src={DeleteImgIcon}
                                            style={{
                                              width: "20px",
                                              height: "20px",
                                            }}
                                          />
                                        </div>
                                      </Popconfirm>
                                      {index ===
                                      departmentDataTable?.length - 1 ? (
                                        <IconButton
                                          style={{ padding: "0px" }}
                                          onClick={() => {
                                            addMainTaskHandler();
                                          }}
                                        >
                                          <MdControlPoint
                                            style={{
                                              color: "#0E497A",
                                              fontSize: "20px",
                                            }}
                                          />
                                        </IconButton>
                                      ) : (
                                        ""
                                      )}
                                    </div>
                                  )}
                                </Row>
                              </Row>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell
                              style={{ paddingBottom: 0, paddingTop: 0 }}
                              colSpan={7}
                            >
                              <Collapse
                                in={isRowExpanded}
                                timeout="auto"
                                unmountOnExit
                              >
                                <Box margin={1} marginLeft={9}>
                                  <TableContainer
                                    component={Paper}
                                    style={{ width: "600px" }}
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
                                              width: "40px",
                                            }}
                                          >
                                            Sl No.
                                          </TableCell>
                                          <TableCell
                                            style={{
                                              color: "#00224E",
                                              fontWeight: "bold",
                                              padding: "5px",
                                              fontSize: "13px",
                                              display: "flex",
                                              justifyContent: "space-between",
                                              alignItems: "center",
                                              // width: "250px",
                                            }}
                                          >
                                            Sub Activity
                                          </TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {item?.subtask?.map(
                                          (els: any, i: any) => {
                                            return (
                                              <TableRow>
                                                <TableCell
                                                  style={{
                                                    padding: "5px",
                                                    fontSize: "14px",
                                                  }}
                                                >
                                                  {`${index + 1}.${i + 1}`}
                                                </TableCell>
                                                <TableCell
                                                  style={{ padding: "5px" }}
                                                >
                                                  <Row
                                                    style={{
                                                      display: "flex",
                                                      gap: "5px",
                                                      flexDirection: "row",
                                                    }}
                                                  >
                                                    <Input
                                                      placeholder="Enter SubTask Name"
                                                      value={els.taskName}
                                                      onChange={(e) => {
                                                        subTaskValueHandler(
                                                          "taskName",
                                                          item.id,
                                                          els.id,
                                                          e.target.value
                                                        );
                                                      }}
                                                      style={{ width: "87%" }}
                                                      disabled={
                                                        els.buttonStatus
                                                      }
                                                    />
                                                    <Row
                                                      style={{
                                                        display: "flex",
                                                        // paddingTop: "15px",
                                                        gap: "5px",
                                                        alignItems: "center",
                                                        justifyContent:
                                                          "center",
                                                      }}
                                                    >
                                                      {els.addButtonStatus ===
                                                      false ? (
                                                        <IconButton
                                                          style={{
                                                            padding: "0px",
                                                          }}
                                                          onClick={() => {
                                                            subTaskSubmitHandler(
                                                              item.id,
                                                              els
                                                            );
                                                          }}
                                                        >
                                                          <MdOutlineCheckCircle
                                                            style={{
                                                              color: "#0E497A",
                                                              fontSize: "20px",
                                                            }}
                                                          />
                                                        </IconButton>
                                                      ) : (
                                                        <div
                                                          style={{
                                                            display: "flex",
                                                            // paddingTop: "15px",
                                                            gap: "5px",
                                                            alignItems:
                                                              "center",
                                                            // justifyContent: "center",
                                                          }}
                                                        >
                                                          {subTaskStatus ===
                                                            true &&
                                                          subTaskId ===
                                                            els.id ? (
                                                            <>
                                                              <IconButton
                                                                style={{
                                                                  padding:
                                                                    "0px",
                                                                }}
                                                                onClick={() => {
                                                                  subTaskUpdateHandler(
                                                                    item.id,
                                                                    els
                                                                  );
                                                                }}
                                                              >
                                                                <MdAddCircle
                                                                  style={{
                                                                    color:
                                                                      "#0E497A",
                                                                    fontSize:
                                                                      "20px",
                                                                  }}
                                                                />
                                                              </IconButton>
                                                            </>
                                                          ) : (
                                                            <>
                                                              <div
                                                                onClick={() => {
                                                                  subTaskEditHandler(
                                                                    item.id,
                                                                    els
                                                                  );
                                                                }}
                                                                style={{
                                                                  cursor:
                                                                    "pointer",
                                                                }}
                                                              >
                                                                <img
                                                                  src={
                                                                    EditImgIcon
                                                                  }
                                                                  style={{
                                                                    width:
                                                                      "17px",
                                                                    height:
                                                                      "17px",
                                                                  }}
                                                                />
                                                              </div>
                                                            </>
                                                          )}
                                                          <Popconfirm
                                                            placement="top"
                                                            title={
                                                              "Are you sure to delete Data"
                                                            }
                                                            onConfirm={() => {
                                                              subTaskDeleteHandler(
                                                                item.id,
                                                                els
                                                              );
                                                            }}
                                                            okText="Yes"
                                                            cancelText="No"
                                                          >
                                                            <div
                                                              style={{
                                                                cursor:
                                                                  "pointer",
                                                              }}
                                                            >
                                                              <img
                                                                src={
                                                                  DeleteImgIcon
                                                                }
                                                                style={{
                                                                  width: "17px",
                                                                  height:
                                                                    "17px",
                                                                }}
                                                              />
                                                            </div>
                                                          </Popconfirm>
                                                          {i ===
                                                          item?.subtask
                                                            ?.length -
                                                            1 ? (
                                                            <IconButton
                                                              style={{
                                                                padding: "0px",
                                                              }}
                                                              onClick={() => {
                                                                subTaskAddHandler(
                                                                  item.id
                                                                );
                                                              }}
                                                            >
                                                              <MdControlPoint
                                                                style={{
                                                                  color:
                                                                    "#0E497A",
                                                                  fontSize:
                                                                    "16px",
                                                                }}
                                                              />
                                                            </IconButton>
                                                          ) : (
                                                            ""
                                                          )}
                                                        </div>
                                                      )}
                                                    </Row>
                                                  </Row>
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
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        title={"Evidence"}
        open={evidenceModel}
        onCancel={evidenceModelClose}
        closeIcon={
          <MdClose
            style={{
              color: "#fff",
              backgroundColor: "#0E497A",
              borderRadius: "3px",
            }}
          />
        }
        footer={
          null
          // <>
          //   {!saveDisable && (
          //     <Button
          //       type="primary"
          //       style={{ backgroundColor: "#003566", color: "#ffff" }}
          //       // disabled={disable}
          //       onClick={() => {
          //         submitEvdDataApi();
          //       }}
          //     >
          //       Submit
          //     </Button>
          //   )}
          // </>
        }
        width="900px"
      >
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
                style={{ backgroundColor: "#fff", borderRadius: "0px" }}
                className={classes.tableContainer}
              >
                <TableContainer component={Paper} variant="outlined">
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
                            width: "40px",
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
                            width: "40px",
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
                        {/* <TableCell
                          style={{
                            color: "#00224E",
                            fontWeight: "bold",
                            padding: "5px",
                            fontSize: "13px",
                            width: "60px",
                          }}
                        >
                          Action
                        </TableCell> */}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {evidenceUpDateData?.map((item: any, i: any) => {
                        return (
                          <TableRow key={item.id}>
                            <TableCell
                              style={{
                                padding: "5px",
                                fontSize: "13px",
                                borderRight:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                borderBottom:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                              }}
                            >
                              {/* <Input
                                value=
                                onChange={(e:any)=>{
                                  updateEvdUpDateAccept(
                                    item,
                                    "evidenceName",
                                    e.target.value
                                  );
                                }}
                                placeholder="Evidence"
                                
                              /> */}
                              {item.evidenceName}
                            </TableCell>
                            <TableCell
                              align="center"
                              style={{
                                padding: "5px",
                                borderRight:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                borderBottom:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                              }}
                            >
                              <Popover
                                content={
                                  <div>
                                    {item?.evidenceAttachment?.map(
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
                                            {!saveDisable && (
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
                                                    padding: "0px",
                                                  }}
                                                >
                                                  <MdDelete
                                                    style={{
                                                      color: "#FC5B73",
                                                      fontSize: "15px",
                                                    }}
                                                  />
                                                </IconButton>
                                              </Popconfirm>
                                            )}
                                          </div>
                                        );
                                      }
                                    )}
                                  </div>
                                }
                                title={null}
                              >
                                <Badge
                                  count={item?.evidenceAttachment?.length}
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
                            </TableCell>
                            <TableCell
                              align="center"
                              style={{
                                padding: "5px",
                                borderRight:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                borderBottom:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                              }}
                            >
                              {item?.accept === true ? (
                                <IconButton
                                  style={{
                                    margin: "0px",
                                    padding: "0px",
                                  }}
                                  //  onClick={()=>{
                                  //   updateEvdUpDateAccept(data, 'accept', true)
                                  // }}
                                >
                                  <Tooltip title={"Accept"}>
                                    <MdOutlineCheckCircle
                                      style={{
                                        color: "green",
                                        fontSize: "20px",
                                        cursor: "pointer",
                                      }}
                                    />
                                  </Tooltip>
                                </IconButton>
                              ) : (
                                ""
                              )}
                              {item?.reject === true ? (
                                <IconButton
                                  style={{
                                    margin: "0px",
                                    padding: "0px",
                                  }}
                                  // onClick={()=>{
                                  //   updateEvdUpDateAccept(data, 'reject', true)
                                  // }}
                                >
                                  <Tooltip title={"Reject"}>
                                    <MdHighlightOff
                                      style={{
                                        color: "red",
                                        fontSize: "20px",
                                        cursor: "pointer",
                                      }}
                                    />
                                  </Tooltip>
                                </IconButton>
                              ) : (
                                ""
                              )}
                            </TableCell>
                            <TableCell
                              style={{
                                padding: "5px",
                                borderRight:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                borderBottom:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                              }}
                            >
                              <Accordion className={ClassesDate.headingRoot}>
                                <AccordionSummary
                                  expandIcon={
                                    <MdExpandMore
                                      style={{ padding: "3px" }}
                                    />
                                  }
                                  aria-controls="panel1a-content"
                                  id="panel1a-header"
                                  className={ClassesDate.summaryRoot}
                                  style={{
                                    margin: "0px",
                                    height: "10px",
                                  }}
                                >
                                  View Remarks
                                </AccordionSummary>
                                <AccordionDetails
                                  className={ClassesDate.headingRoot}
                                >
                                  <div
                                    style={{
                                      display: "grid",
                                      gap: "5px",
                                    }}
                                  >
                                    {item?.remarks?.map(
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
                                              {dd.attachment?.map(
                                                (ele: any) => {
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
                                                }
                                              )}
                                            </div>
                                          </div>
                                        );
                                      }
                                    )}
                                    {/* <div
                                      style={{
                                        display: "flex",
                                        gap: "10px",
                                        paddingTop: "10px",
                                      }}
                                    >
                                      <TextArea
                                        rows={1}
                                        placeholder="Enter Remarks"
                                        value={addMessage.remarks}
                                        maxLength={5000}
                                        disabled={readMode}
                                        style={{
                                          width: "140px",
                                          color: "black",
                                        }}
                                        onChange={(e: any) => {
                                          readMsgHandler(e.target.value);
                                        }}
                                      />
                                      <Upload
                                        {...uploadFileProps()}
                                        className={classes.uploadSection}
                                        id={"1"}
                                        showUploadList={false}
                                      >
                                        <IconButton
                                          style={{
                                            margin: "0pa",
                                            padding: "5px",
                                          }}
                                          disabled={readMode}
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
                                        disabled={readMode}
                                        onClick={() => {
                                          addSubmitMsgHandler();
                                        }}
                                      >
                                        <MdSend
                                          style={{
                                            color: "#00224E",
                                            fontSize: "20px",
                                          }}
                                        />
                                      </IconButton>
                                    </div> */}
                                  </div>
                                </AccordionDetails>
                              </Accordion>
                            </TableCell>
                            {/* <TableCell style={{ padding: "5px" }}>
                              <Row
                                style={{
                                  display: "grid",
                                  // paddingTop: "15px",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Row
                                  style={{
                                    display: "flex",
                                    // paddingTop: "15px",
                                    gap: "5px",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  {item?.addButtonStatus === false ? (
                                    <IconButton
                                      style={{ padding: "0px" }}
                                      disabled={readMode}
                                      onClick={() => {
                                        addEditEvdValues(item);
                                      }}
                                    >
                                      <MdOutlineCheckCircle
                                        style={{
                                          color: "#0E497A",
                                          fontSize: "20px",
                                        }}
                                      />
                                    </IconButton>
                                  ) : (
                                    <div
                                      style={{
                                        display: "flex",
                                        // paddingTop: "15px",
                                        gap: "5px",
                                        alignItems: "center",
                                        // justifyContent: "center",
                                      }}
                                    >
                                      {evdEditStatus === true &&
                                      evdEditId === item.id ? (
                                        <>
                                          <IconButton
                                            style={{ padding: "0px" }}
                                            onClick={() => {
                                              updateEvdValuesByChart(item);
                                            }}
                                            disabled={readMode}
                                          >
                                            <MdAddCircle
                                              style={{
                                                color: "#0E497A",
                                                fontSize: "20px",
                                              }}
                                            />
                                          </IconButton>
                                        </>
                                      ) : (
                                        <>
                                          <div
                                            onClick={() => {
                                              updateEditEvdValues(item);
                                            }}
                                            style={{
                                              cursor: "pointer",
                                            }}
                                          >
                                            <img
                                              src={EditImgIcon}
                                              style={{
                                                width: "20px",
                                                height: "20px",
                                              }}
                                            />
                                          </div>
                                        </>
                                      )}
                                      <Popconfirm
                                        placement="top"
                                        title={"Are you sure to delete Data"}
                                        onConfirm={() => {
                                          deleteEditEvdValues(item);
                                        }}
                                        okText="Yes"
                                        cancelText="No"
                                      >
                                        <div style={{ cursor: "pointer" }}>
                                          <img
                                            src={DeleteImgIcon}
                                            style={{
                                              width: "20px",
                                              height: "20px",
                                            }}
                                          />
                                        </div>
                                      </Popconfirm>
                                      {i === 0 ? 
                                            <IconButton
                                              style={{
                                                margin: "0px",
                                                padding: "0px",
                                              }}
                                              disabled={readMode}
                                              onClick={() => {
                                                addEvdMoreAddHoc();
                                              }}
                                            >
                                              <MdAddCircle
                                                style={{
                                                  color: "#0E497A",
                                                  fontSize: "20px",
                                                }}
                                              />
                                            </IconButton> :""}
                                    </div>
                                  )}
                                </Row>
                              </Row>
                            </TableCell> */}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        title={null}
        open={anchorEl}
        onCancel={handleClose}
        closeIcon={false}
        footer={false}
        mask={false}
        style={{ top: "50%", left: 80, margin: 0 }}
        width="170px"
      >
        <div>
          <div style={{ display: "grid", gap: "8px" }}>
            <Button
              onClick={() => {
                handleToolbarClick(selectedData);
              }}
              icon={
                <MdAddCircleOutline
                  style={{ fontSize: "15px", color: "navyBlue" }}
                />
              }
            >
              Add Task
            </Button>
            <Button
              icon={
                <img
                  src={EditImgIcon}
                  alt="icon"
                  style={{ width: "15px", height: "15px" }}
                />
              }
              onClick={() => {
                handleRowClick(selectedData);
              }}
            >
              Edit
            </Button>
            <Button
              icon={
                <img
                  src={DeleteImgIcon}
                  alt="icon"
                  style={{ width: "15px", height: "16px" }}
                />
              }
              onClick={() => {
                deleteDataHandler(selectedData);
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
      <Modal
        title={`Add StakeHolder for ${npdValueFull?.label}`}
        open={stakeHolderModal}
        onCancel={closeStakeHolderModal}
        closeIcon={
          <MdClose
            style={{
              color: "#fff",
              backgroundColor: "#0E497A",
              borderRadius: "3px",
            }}
          />
        }
        footer={
          <>
            <Button
              style={{ backgroundColor: "#003566", color: "#ffff" }}
              onClick={() => {
                addStakeHolder();
              }}
            >
              Submit
            </Button>
          </>
        }
        mask={false}
        // style={{ top: "50%", left: 80, margin: 0 }}
        width="832px"
      >
        <div
          style={{ backgroundColor: "#fff", borderRadius: "0px" }}
          className={classes.descriptionLabelStyle}
        >
          <Form layout="vertical">
            <Descriptions
              bordered
              size="small"
              style={{ width: "800px" }}
              column={{
                xxl: 2, // or any other number of columns you want for xxl screens
                xl: 2, // or any other number of columns you want for xl screens
                lg: 2, // or any other number of columns you want for lg screens
                md: 1, // or any other number of columns you want for md screens
                sm: 2, // or any other number of columns you want for sm screens
                xs: 2, // or any other number of columns you want for xs screens
              }}
            >
              <Descriptions.Item span={12} label="StakeHolder Type:">
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
                    value={
                      entityForm?.entityType ? entityForm.entityType : undefined
                    }
                    style={{ width: "100%", color: "black" }}
                    onChange={(e: any, data: any) => {
                      setEntityForm({
                        ...entityForm,
                        entityType: e,
                        entityTypeData: data,
                        id: uniqueId,
                      });
                      if (data?.label === "Supplier") {
                        const supFilter = allSuppliers?.map((ele: any) => ({
                          value: ele?.id,
                          label: ele?.entityName,
                        }));
                        setAllDataList(supFilter);
                      } else if (data?.label === "Customer") {
                        const cusFilter = custOptins?.map((ele: any) => ({
                          value: ele?.id,
                          label: ele?.entityName,
                        }));
                        setAllDataList(custOptins);
                      } else if (data?.label === "Department") {
                        setAllDataList(allDepartment);
                      }
                    }}
                    showSearch
                    placeholder="Select Entity Type"
                    optionFilterProp="children"
                    onSearch={onSearch}
                    filterOption={filterOption}
                    options={entityListData}
                  />
                </Form.Item>
              </Descriptions.Item>
              <Descriptions.Item span={12} label="StakeHolder Name:">
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
                    // mode="multiple"
                    value={entityForm?.entityList}
                    style={{ width: "100%", color: "black" }}
                    onChange={(e: any, data: any) => {
                      setEntityForm({
                        ...entityForm,
                        entityList: e,
                        entityListData: data,
                      });
                    }}
                    showSearch
                    placeholder="Select Entity"
                    optionFilterProp="children"
                    onSearch={onSearch}
                    filterOption={filterOption}
                    options={allDataList?.filter(
                      (ele: any) =>
                        !stakeHolderDropList
                          ?.map((item: any) => item?.value)
                          ?.includes(ele?.value)
                    )}
                  />
                </Form.Item>
              </Descriptions.Item>
            </Descriptions>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default GanttIndex;
