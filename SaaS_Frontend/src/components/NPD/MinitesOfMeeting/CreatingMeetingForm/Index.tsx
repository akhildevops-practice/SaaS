import {
  Badge,
  Button,
  Descriptions,
  Form,
  Input,
  Checkbox,
  Select,
  Row,
  Modal,
  UploadProps,
  Upload,
  Popover,
  Popconfirm,
  Tag,
  SelectProps,
  Divider,
  Pagination,
  PaginationProps,
} from "antd";
import React, { useEffect, useState } from "react";
import useStyles from "./styles";
import {
  createActionPlans,
  createDiscussionItem,
  createMinutesOfMeeting,
  createRiskPredictionItems,
  deleteActionPlans,
  deleteDelayedActionPlans,
  deleteDelayedItem,
  deleteDiscussionItem,
  getAllByDelayedDataOpenNpdId,
  getAllByOpenNpdId,
  getAllConfigDptPicUsers,
  getAllDelayedItemItemsAll,
  getAllNPDListDrop,
  getByIdDiscussionItemItemsAll,
  getByIdMinutesOfMeeting,
  getByIdMomItemsAll,
  getByNpdId,
  getByNpdIdDelayedItemsAll,
  updateActionPlans,
  updateDelayedActionPlans,
  updateDelayedItem,
  updateDiscussionItem,
  updateMinutesOfMeeting,
} from "apis/npdApi";
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
  Tooltip,
  debounce,
  makeStyles,
  Button as MuiButton,
  MenuItem,
} from "@material-ui/core";
import {
  MdAddCircle,
  MdCheckCircle,
  MdQueue,
  MdCheckBox,
  MdExpandMore,
  MdRemoveCircleOutline,
  MdAttachment,
  MdClose,
  MdUpdate,
  MdOutlineListAlt,
  MdInfo,
  MdExpandLess
} from "react-icons/md";
import { generateUniqueId } from "utils/uniqueIdGenerator";
import { Autocomplete } from "@material-ui/lab";
import { getAllUsersApi } from "apis/npdApi";
import TextArea from "antd/es/input/TextArea";
import { getUserInfo } from "apis/socketApi";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import {
  MinutesOfMeetingNpdDataState,
  MinutesOfMeetingNpdState,
} from "recoil/atom";
import { useSnackbar } from "notistack";
import axios from "apis/axios.global";
import { API_LINK } from "config";
import getAppUrl from "utils/getAppUrl";
import { UploadOutlined } from "@ant-design/icons";
import MomInfoDrawerIndex from "./MinutesOfMeetingDrawer/Index";
import {
  DiffOutlined,
  FundOutlined,
  FilterOutlined,
  FilterFilled,
} from "@ant-design/icons";
import MultiUserDisplay from "components/MultiUserDisplay";
import moment from "moment";
import MomInfoDelayedItemDrawerIndex from "./MinutesOfMeetingDrawer/delayeditemIndex";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import getSessionStorage from "utils/getSessionStorage";
import EditImgIcon from "assets/documentControl/Edit.svg";
import DeleteImgIcon from "assets/documentControl/Delete.svg";
var typeAheadValue: string;
var typeAheadType: string;

type TagRender = SelectProps["tagRender"];

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

const MeetingCreatingIndex = () => {
  const classes = useStyles();
  const ClassesDate = useStylesDate();
  const navigate = useNavigate();
  const [npdList, setNpdList] = useState<any>([]);
  const [dptList, setDptList] = useState<any>([]);
  const [dptData, setDptData] = useState<any>([]);
  const [editDptItemStatus, setEditDptItemStatus] = useState(false);
  const [editDptItemId, setEditDptItemId] = useState<any>("");
  const uniqueId = generateUniqueId(22);
  const [expandedRows, setExpandedRows] = useState<any>({});
  const [getAllUserData, setGetAllUserData] = useState<any>([]);
  const [editActionItemStatus, setEditActionItemStatus] = useState(false);
  const [editActionItemId, setEditActionItemId] = useState<any>("");
  const [userInfo, setUserInfo] = useState<any>();
  const [momForm, setMomForm] = useRecoilState(MinutesOfMeetingNpdState);
  const [npdListData, setNpdListData] = useRecoilState(
    MinutesOfMeetingNpdDataState
  );
  const [statusProgressData, setStatusProgressData] = useState<any>([]);
  const [delayedStatusProgressData, setDelayedStatusProgressData] =
    useState<any>([]);
  const [statusEditStatus, setStatusEditStatus] = useState(false);
  const [statusEditId, setStatusEditId] = useState("");
  const realmName = getAppUrl();
  const todayDate = new Date().toISOString().split("T")[0];
  const { enqueueSnackbar } = useSnackbar();
  const { id, mode } = useParams();
  const [openStatus, setOpenStatus] = useState(false);
  const [disableStatus, setDisableStatus] = useState(false);
  const [show, setShow] = useState<any>("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [bgColor, setBgColor] = useState("");
  const [getAllUsersDptPic, setGetAllUsersDptPic] = useState<any>([]);
  const [drawerType, setDrawerType] = React.useState<any>(null);
  const [openDrawer, setOpenDrawer] = React.useState<boolean>(false);
  const [buttonValue, setButtonValue] = useState(0);
  const [impactTypes, setImpactTypes] = useState<any>([]);
  const [riskTypes, setRiskTypes] = useState<any>([]);
  const [discussionFormData, setDiscussionFormData] = useState<any>({
    id: "",
    npdId: show,
    selectedDptId: "",
    discussedItem: "",
    discussedItemDescription: "",
    criticality: "",
    impact: [],
    riskPrediction: "",
    status: "",
    report: "",
    dropDptValue: dptList,
    actionPlans: [],
    actionPlansIds: [],
    buttonStatus: false,
    addButtonStatus: false,
    pic: [],
    targetDate: "",
    momId: momForm?.momId,
    npdIds: momForm?.npdIds,
    notes: "",
    riskHistory: [],
  });
  const [fetchAllApiStatus, setFetchAllApiStatus] = useState(false);
  const [delayedItemData, setDelayedItemData] = useState<any>([]);
  const [drawerDelayedType, setDrawerDelayedType] = React.useState<any>(null);
  const [pa, setPa] = useState<any>([]);
  const userDetail = getSessionStorage();
  const location = useLocation();
  const [actionItemData, setActionItemData] = useState<any>();
  const [read, setRead] = useState<any>();
  const [delayedActionItemData, setDelayedActionItemData] = useState<any>();
  const [openDelayedDrawer, setOpenDelayedDrawer] =
    React.useState<boolean>(false);
  const [delayedFormData, setDelayedFormData] = useState<any>({
    id: "",
    npdId: show,
    riskHistory: [],
    selectedDptId: "",
    delayedItem: "",
    delayedItemDescription: "",
    delayedItemId: "",
    delayedItemGanttId: "",
    delayedItemType: "",
    delayedBy: "",
    criticality: "",
    impact: [],
    riskPrediction: "",
    status: "",
    report: "",
    dropDptValue: dptList,
    actionPlans: [],
    actionPlansIds: [],
    buttonStatus: false,
    addButtonStatus: false,
    pic: [],
    targetDate: "",
    momId: momForm?.momId,
    npdIds: momForm?.npdIds,
    notes: "",
  });
  const [fetchAllApiDelayedStatus, setFetchAllApiDelayedStatus] =
    useState(false);
  const [editDelayedActionItemStatus, setEditDelayedActionItemStatus] =
    useState(false);
  const [editDelayedActionItemId, setEditDelayedActionItemId] =
    useState<any>("");
  const [pageAction, setPageAction] = useState<any>(1);
  const [pageLimitAction, setPageLimitAction] = useState<any>(10);
  const [countAction, setCountAction] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(true);
  const [pageDelayed, setPageDelayed] = useState<any>(1);
  const [pageLimitDelayed, setPageLimitDelayed] = useState<any>(10);
  const [countDelayed, setCountDelayed] = useState<number>(0);
  const [hasMounted, setHasMounted] = useState(false);
  const [deptFilterAnchorEl1, setDeptFilterAnchorEl1] =
    React.useState<null | HTMLElement>(null);
  const [filterColumnDept, setFilterColumnDept] = useState(false);
  const [deptFilterOptions, setDeptFilterOptions] = useState<any[]>([]);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<any[]>([]);
  const [deptFilterModel, setDeptFilterModel] = useState(false);

  const [criticalityFilterAnchorEl1, setCriticalityFilterAnchorEl1] =
    React.useState<null | HTMLElement>(null);
  const [filterColumnCriticality, setFilterColumnCriticality] = useState(false);
  const criticalityFilterOptions = ["Normal", "High"];
  const [selectedCriticalityFilter, setSelectedCriticalityFilter] = useState<
    any[]
  >([]);
  const [criticalityFilterModel, setCriticalityFilterModel] = useState(false);

  const [impactFilterAnchorEl1, setImpactFilterAnchorEl1] =
    React.useState<null | HTMLElement>(null);
  const [filterColumnImpact, setFilterColumnImpact] = useState(false);
  const [impactFilterOptions, setImpactFilterOptions] = useState<any[]>([]);
  const [selectedImpactFilter, setSelectedImpactFilter] = useState<any[]>([]);
  const [impactFilterModel, setImpactFilterModel] = useState(false);

  const [statusFilterAnchorEl1, setStatusFilterAnchorEl1] =
    React.useState<null | HTMLElement>(null);
  const [filterColumnStatus, setFilterColumnStatus] = useState(false);
  const statusFilterOptions = ["Open", "Close"];
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<any[]>([]);
  const [statusFilterModel, setStatusFilterModel] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget); // Open the menu
  };

  const handlePaginationAction = (page: any, pageSize: any) => {
    setPageAction(page);
    setPageLimitAction(pageSize);
    // getActionPoints();
  };
  const showTotalAction: PaginationProps["showTotal"] = (total) =>
    `Total ${total} items`;

  const handlePaginationDelayed = (page: any, pageSize: any) => {
    setPageDelayed(page);
    setPageLimitDelayed(pageSize);
    // getActionPoints();
  };

  const showTotalDelayed: PaginationProps["showTotal"] = (total) =>
    `Total ${total} items`;

  const handleClose = () => {
    setAnchorEl(null); // Close the menu
  };

  const openModelStatus = (data: any, ele: any) => {
    setOpenStatus(true);
    data.pic?.id === userDetail.id
      ? setDisableStatus(true)
      : setDisableStatus(false);

    if (data?.statusProgressData?.length !== 0) {
      setStatusProgressData(data?.statusProgressData);
      setActionItemData(data);
    }
    const update = dptData?.map((item: any) => {
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
    setDptData(update);
  };

  const statusProgressUpdateOfDelayedItems = () => {
    const payload = {
      statusProgressData: statusProgressData,
    };
    updateActionPlans(actionItemData?._id, payload).then((response: any) => {
      if (response?.status === 200 || response?.status === 201) {
        setOpenStatus(false);
        getAllMomDataTable(momForm?.momId, show);
      }
    });
  };
  // console.log("status progress data", statusProgressData);
  const openModelDelayedStatus = (data: any, ele: any) => {
    setOpenStatus(true);
    data.pic?.id === userDetail.id
      ? setDisableStatus(true)
      : setDisableStatus(false);
    if (data?.statusProgressData?.length !== 0) {
      setStatusProgressData(data?.statusProgressData);
      setActionItemData(data);
    }
    const update = delayedItemData?.map((item: any) => {
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
    setDelayedItemData(update);
  };

  const closeModelStatus = () => {
    setOpenStatus(false);
  };

  const toggleRow = (rowId: any) => {
    setExpandedRows((prevState: any) => ({
      ...prevState,
      [rowId]: !prevState[rowId],
    }));
  };
  useEffect(() => {
    getProjectAdmins();
    setHasMounted(true);
    dropDownValueNpdList();
    getAllUsersInformation("", "");
    getAllDptUsers();
  }, []);

  useEffect(() => {
    setRead(location.state);
  }, [location.state]);
  useEffect(() => {
    editByDataMinutesOfMeeting(id);
  }, [id, mode === "edit"]);

  useEffect(() => {
    setMomForm({
      meetingName: "",
      meetingOwner: userInfo,
      meetingDateForm: "",
      meetingDateTo: "",
      attendees: [],
      excuses: [],
      description: "",
      npdIds: [],
      npdIdData: [],
      discussionItems: [],
      momId: "",
      presentDpt: [],
      absentDpt: [],
      attachments: [],
    });
  }, [mode === undefined]);

  useEffect(() => {
    if (momForm?.momId === "" || momForm?.momId === undefined) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [momForm?.momId]);

  const editByDataMinutesOfMeeting = (id: any) => {
    getByIdMinutesOfMeeting(id).then((response: any) => {
      setShow(response?.data?.npdIds[0]);
      setMomForm({
        meetingName: response?.data?.meetingName,
        meetingOwner: response?.data?.meetingOwner,
        meetingDateForm: response?.data?.meetingDateForm,
        meetingDateTo: response?.data?.meetingDateTo,
        attendees: response?.data?.attendees,
        excuses: response?.data?.excuses,
        description: response?.data?.description,
        npdIds: response?.data?.npdIds,
        // npdIdData:response?.data?.npdIdData,
        // discussionItems:response?.data?.discussionItems,
        momId: response?.data?._id,
        presentDpt: response?.data?.presentDpt,
        absentDpt: response?.data?.absentDpt,
        attachments: response?.data?.attachments,
      });
      getByNpdId(response?.data?.npdIds[0]).then((response: any) => {
        const dptListFilter = response?.data?.departmentFullData?.map(
          (ele: any) => {
            let data = {
              label: ele.entityName,
              value: ele.id,
            };
            return data;
          }
        );
        setDptList(dptListFilter);
      });
    });
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

  const getAllDptUsers = () => {
    getAllConfigDptPicUsers().then((response: any) => {
      setGetAllUsersDptPic(response?.data);
    });
  };

  useEffect(() => {
    getAllMomDataTable(momForm?.momId, show);
  }, [momForm?.momId]);
  useEffect(() => {
    getAllMomDataTable(momForm?.momId, show);
  }, [pageAction, pageLimitAction, show]);
  useEffect(() => {
    getAllMomDataTable(momForm?.momId, show);
  }, [fetchAllApiStatus === true]);
  useEffect(() => {
    if (hasMounted && selectedDeptFilter.length === 0 && !deptFilterModel) {
      getAllMomDataTable(momForm?.momId, show);
    }
  }, [selectedDeptFilter]);
  useEffect(() => {
    if (
      hasMounted &&
      selectedCriticalityFilter.length === 0 &&
      !criticalityFilterModel
    ) {
      getAllMomDataTable(momForm?.momId, show);
    }
  }, [selectedCriticalityFilter]);
  useEffect(() => {
    if (hasMounted && selectedImpactFilter.length === 0 && !impactFilterModel) {
      getAllMomDataTable(momForm?.momId, show);
    }
  }, [selectedImpactFilter]);
  useEffect(() => {
    if (hasMounted && selectedStatusFilter.length === 0 && !statusFilterModel) {
      getAllMomDataTable(momForm?.momId, show);
    }
  }, [selectedStatusFilter]);

  useEffect(() => {
    getAllDelayedItemsDataTable(show, momForm?.momId);
  }, [show, momForm?.momId]);

  useEffect(() => {
    getAllDelayedItemsDataTable(show, momForm?.momId);
  }, [fetchAllApiDelayedStatus === true]);

  useEffect(() => {
    getAllDelayedItemsDataTable(show, momForm?.momId);
  }, [pageDelayed, pageLimitAction]);

  const dataDptListConfig = getAllUsersDptPic?.map((ele: any) => {
    let data = {
      value: ele?.dptData?.id,
      label: ele?.dptData?.entityName,
    };
    return data;
  });

  const filterByDataDptSelected = getAllUsersDptPic?.filter((ele: any) =>
    momForm?.presentDpt?.includes(ele?.dptData?.id)
  );
  const finalUsersFilterBy = filterByDataDptSelected
    ?.map((ele: any) => ele?.picData?.map((item: any) => item))
    ?.flat();

  const getAllMomDataTable = async (id: any, npdId: any) => {
    try {
      let payload = {
        skip: pageAction,
        limit: pageLimitAction,
        deptFilter: selectedDeptFilter,
        criticalityFilter: selectedCriticalityFilter,
        impactFilter: selectedImpactFilter,
        statusFilter: selectedStatusFilter,
      };
      const response = await getByIdMomItemsAll(id, npdId, payload);
      setCountAction(response?.data?.total);
      const initialData = response?.data?.data || [];
      const fullData = await Promise.all(
        initialData.map(async (item: any) => {
          const responseData = await getByIdDiscussionItemItemsAll(item?._id);
          // console.log("action plan data", responseData?.data);
          return {
            ...item,
            actionPlans: responseData?.data || [],
          };
        })
      );
      setDptData(fullData);
      setFetchAllApiStatus(false);
    } catch (error) {
      console.error("Error fetching MOM data:", error);
    }
  };

  const getAllDelayedItemsDataTable = async (id: any, momId: any) => {
    try {
      let payload = {
        skip: pageDelayed,
        limit: pageLimitDelayed,
      };
      const response = await getByNpdIdDelayedItemsAll(id, momId, payload);
      const initialData = response?.data?.data || [];
      const fullData = await Promise.all(
        initialData.map(async (item: any) => {
          const responseData = await getAllDelayedItemItemsAll(item?._id);
          return {
            ...item,
            actionPlans: responseData?.data || [],
          };
        })
      );
      setDelayedItemData(fullData);
      setFetchAllApiStatus(false);
      setCountDelayed(response?.data?.total);
    } catch (error) {
      console.error("Error fetching MOM data:", error);
    }
  };

  useEffect(() => {
    getConfigData();
  }, []);

  const getConfigData = async () => {
    const data = await axios.get(`/api/configuration`);
    const projectTypeData = data?.data[0]?.riskConfig[0]?.map((value: any) => {
      let data = {
        value: value?.key,
        lable: value?.riskLevel,
      };
      return data;
    });
    setRiskTypes(projectTypeData);
    setImpactFilterOptions(data.data[0].impactArea.flat());
    const rankTypeData = data?.data[0]?.impactArea[0]?.map((value: any) => {
      let data = {
        value: value,
        lable: value,
      };
      return data;
    });
    setImpactTypes(rankTypeData);
  };

  const dropDownValueNpdList = () => {
    getAllNPDListDrop()?.then((response: any) => {
      setNpdList(response?.data);
      const npdDptData = response?.data?.map((ele: any) => {
        let data = {
          npdId: ele.value,
          npdDepartments: [],
        };
        return data;
      });
      setNpdListData(npdDptData);
    });
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

  const submitValuesItemDiscussionHandler = (data: any) => {
    let payload = {
      ...data,
      momId: momForm?.momId,
      createdOn: todayDate,
      buttonStatus: true,
      addButtonStatus: true,
    };
    let dataDiscussionItem: any;
    createDiscussionItem(payload).then((response: any) => {
      if (response?.status === 201 || response?.status === 200) {
        dataDiscussionItem = response?.data;
        let payloadData = {
          npdIds: momForm?.npdIds,
        };
        updateMinutesOfMeeting(momForm.momId, payloadData).then(
          (response: any) => {
            if (response?.status === 201 || response?.status === 200) {
              if (dataDiscussionItem?.criticality === "High") {
                let payloadRisk = {
                  npdId: dataDiscussionItem?.npdId,
                  momId: dataDiscussionItem?.momId,
                  selectedDptId: dataDiscussionItem?.selectedDptId,
                  riskType: "operational",
                  itemId: dataDiscussionItem?._id,
                  itemType: "discussionItem",
                  itemName: dataDiscussionItem?.discussedItem,
                  itemNameDescription:
                    dataDiscussionItem?.discussedItemDescription,
                  criticality: dataDiscussionItem?.criticality,
                  impact: dataDiscussionItem?.impact,
                  riskPrediction: dataDiscussionItem?.riskPrediction,
                  status: dataDiscussionItem?.status,
                  targetDate: dataDiscussionItem?.targetDate,
                  pic: dataDiscussionItem?.pic,
                  report: dataDiscussionItem?.report,
                  riskCreatedDate: todayDate,
                  currentVersion: true,
                };
                createRiskPredictionItems(payloadRisk).then((response: any) => {
                  if (response?.status === 201 || response?.status === 200) {
                    enqueueSnackbar(`Data Saved SuccessFully`, {
                      variant: "success",
                    });
                    getAllMomDataTable(momForm.momId, show);
                  }
                });
              } else {
                enqueueSnackbar(`Data Saved SuccessFully`, {
                  variant: "success",
                });
                getAllMomDataTable(momForm.momId, show);
              }
            }
          }
        );
      }
    });
  };

  const selectNpdChange = (item: any) => {
    setShow(item?.value);
    if (!momForm?.npdIds?.includes(item?.value)) {
      setMomForm({
        ...momForm,
        npdIds: [...momForm?.npdIds, item?.value],
      });
    }
    getAllByOpenNpdId(item?.value, momForm?.momId);
    getAllByDelayedDataOpenNpdId(item?.value, momForm?.momId);
    getAllMomDataTable(momForm?.momId, item?.value);
    getByNpdId(item?.value).then((response: any) => {
      const dptListFilter = response?.data?.departmentFullData?.map(
        (ele: any) => {
          let data = {
            label: ele.entityName,
            value: ele.id,
          };
          return data;
        }
      );
      setDptList(dptListFilter);
      const updateDataByNpd = npdListData?.map((ele: any) => {
        if (ele.npdId === item.value) {
          const updateNpdBy = response?.data?.departmentFullData?.map(
            (ele: any) => {
              let data = {
                dptId: ele.id,
                dptDiscussionItems: [],
              };
              return data;
            }
          );
          return {
            ...ele,
            npdDepartments: updateNpdBy,
          };
        }
        return ele;
      });
      setNpdListData(updateDataByNpd);
    });
    getAllDelayedItemsDataTable(item?.value, momForm?.momId);
  };

  const createHandlerItem = () => {
    if (!dptData?.map((ele: any) => ele?.npdId).includes(show)) {
      setDiscussionFormData({
        id: uniqueId,
        npdId: show,
        selectedDptId: "",
        discussedItem: "",
        discussedItemDescription: "",
        criticality: "",
        impact: [],
        riskHistory: [],
        riskPrediction: "",
        status: "Open",
        report: "",
        dropDptValue: dptList,
        actionPlans: [],
        actionPlansIds: [],
        buttonStatus: false,
        addButtonStatus: false,
        pic: [],
        notes: "",
        targetDate: "",
        momId: momForm?.momId,
        npdIds: momForm?.npdIds,
      });
      if (pa.some((item: any) => item.id === userDetail.id)) {
        setOpenDrawer(true);
        setDrawerType("create");
      }
    }
  };

  const getProjectAdmins = async () => {
    const result = await axios.get(`/api/configuration`);
    if (result?.data[0]?.pmUserData) {
      setPa(result?.data[0]?.pmUserData);
    }
  };

  const editItemDiscussionHandler = (data: any) => {
    // setEditDptItemStatus(true);
    // setEditDptItemId(data._id);
    // console.log("data in edit", data);
    setDiscussionFormData({
      id: data?._id,
      npdId: data?.npdId,
      selectedDptId: data?.selectedDptId,
      discussedItem: data?.discussedItem,
      riskHistory: data?.riskHistory,
      discussedItemDescription: data?.discussedItemDescription,
      criticality: data?.criticality,
      impact: data?.impact,
      riskPrediction: data?.riskPrediction,
      status: data?.status,
      report: data?.report,
      dropDptValue: dptList,
      actionPlans: data?.actionPlans,
      actionPlansIds: data?.actionPlansIds,
      buttonStatus: false,
      addButtonStatus: data?.addButtonStatus,
      pic: data?.pic,
      targetDate: data?.targetDate,
      momId: momForm?.momId,
      npdIds: momForm?.npdIds,
      notes: data?.notes,
    });
    setDrawerType("edit");
    setOpenDrawer(true);
    // const update = dptData?.map((ele: any) => {
    //   if (ele._id === data._id) {
    //     return {
    //       ...ele,
    //       buttonStatus: false,
    //     };
    //   }
    //   return ele;
    // });
    // setDptData(update);
  };

  const editItemDelayedHandler = async (data: any) => {
    // setEditDptItemStatus(true);
    // setEditDptItemId(data._id);
    // const dataNow = await dateConvert(data?.targetDate);
    setDelayedFormData({
      id: data?._id,
      npdId: data?.npdId,
      selectedDptId: data?.selectedDptId,
      delayedItem: data?.delayedItem,
      riskHistory: data?.riskHistory,
      delayedItemDescription: data?.delayedItemDescription,
      delayedItemId: data?.delayedItemId,
      delayedItemType: data?.delayedItemType,
      delayedBy: data?.delayedBy,
      criticality: data?.criticality,
      impact: data?.impact,
      riskPrediction: data?.riskPrediction,
      status: data?.status,
      report: data?.report,
      dropDptValue: dptList,
      actionPlans: data?.actionPlans,
      actionPlansIds: data?.actionPlansIds,
      buttonStatus: false,
      addButtonStatus: data?.addButtonStatus,
      pic: data?.pic,
      targetDate: data?.targetDate,
      momId: momForm?.momId,
      npdIds: momForm?.npdIds,
      notes: data?.notes,
    });
    setDrawerDelayedType("edit");
    setOpenDelayedDrawer(true);
    // const update = dptData?.map((ele: any) => {
    //   if (ele._id === data._id) {
    //     return {
    //       ...ele,
    //       buttonStatus: false,
    //     };
    //   }
    //   return ele;
    // });
    // setDptData(update);
  };

  const dateConvert = (dateNow: any) => {
    const date = new Date(dateNow);
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const yyyy = date.getFullYear();
    const formattedDate = `${dd}-${mm}-${yyyy}`;
    return formattedDate;
  };

  const editItemUpdateDiscussionHandler = (data: any) => {
    setEditDptItemStatus(false);
    setEditDptItemId("");
    let payLoad = {
      ...data,
      buttonStatus: true,
    };
    updateDiscussionItem(data._id, payLoad).then((response: any) => {
      if (response.status === 200 || response.status === 201) {
        const update = dptData?.map((ele: any) => {
          if (ele._id === data._id) {
            return {
              ...ele,
              buttonStatus: true,
            };
          }
          return ele;
        });
        setDptData(update);
        enqueueSnackbar(`Data Updated SuccessFully`, {
          variant: "success",
        });
      }
    });
  };

  const deleteItemDiscussionHandler = (data: any) => {
    deleteDiscussionItem(data._id).then((response: any) => {
      if (response.status === 200 || response.status === 201) {
        enqueueSnackbar(`Data Deleted SuccessFully`, {
          variant: "success",
        });
        const update = dptData?.filter((ele: any) => ele._id !== data._id);
        setDptData(update);
      }
    });
  };

  const deleteItemDelayedHandler = (data: any) => {
    deleteDelayedItem(data._id).then((response: any) => {
      if (response.status === 200 || response.status === 201) {
        enqueueSnackbar(`Data Deleted SuccessFully`, {
          variant: "success",
        });
        const update = dptData?.filter((ele: any) => ele._id !== data._id);
        setDptData(update);
      }
    });
  };

  const addMoreItemDiscussionHandler = (ele: any) => {
    setDiscussionFormData({
      id: uniqueId,
      npdId: ele.npdId,
      selectedDptId: "",
      discussedItem: "",
      discussedItemDescription: "",
      criticality: "",
      impact: [],
      riskHistory: [],
      riskPrediction: "",
      status: "Open",
      report: "",
      dropDptValue: dptList,
      actionPlans: [],
      actionPlansIds: [],
      buttonStatus: false,
      addButtonStatus: false,
      pic: [],
      targetDate: "",
      notes: "",
      momId: momForm?.momId,
      npdIds: momForm?.npdIds,
    });
    // let data = {
    //   id: uniqueId,
    //   npdId: ele.npdId,
    //   //   npdValue: ele.npdValue,
    //   selectedDptId: "",
    //   discussedItem: "",
    //   criticality: "",
    //   impact: [],
    //   riskPrediction: "",
    //   status: "",
    //   report:"",
    //   dropDptValue: dptList,
    //   actionPlans: [],
    //   actionPlansIds: [],
    //   addButtonStatus: false,
    //   buttonStatus: false,
    // };
    // setDptData([data, ...dptData]);
    setOpenDrawer(true);
    setDrawerType("create");
  };

  const readModeDisItem = (data: any) => {
    setDiscussionFormData({
      id: data?._id,
      npdId: data?.npdId,
      selectedDptId: data?.selectedDptId,
      discussedItem: data?.discussedItem,
      discussedItemDescription: data?.discussedItemDescription,
      criticality: data?.criticality,
      impact: data?.impact,
      riskHistory: data?.riskHistory,
      riskPrediction: data?.riskPrediction,
      status: data?.status,
      report: data?.report,
      dropDptValue: dptList,
      actionPlans: data?.actionPlans,
      actionPlansIds: data?.actionPlansIds,
      buttonStatus: true,
      addButtonStatus: data?.addButtonStatus,
      pic: data?.pic,
      targetDate: data?.targetDate,
      momId: momForm?.momId,
      npdIds: momForm?.npdIds,
      notes: data?.notes,
    });
    setOpenDrawer(true);
    setDrawerType("read");
  };

  const readModeDelayedItem = (data: any) => {
    setDelayedFormData({
      id: data?._id,
      npdId: data?.npdId,
      selectedDptId: data?.selectedDptId,
      delayedItem: data?.delayedItem,
      riskHistory: data?.riskHistory,
      delayedItemDescription: data?.delayedItemDescription,
      delayedItemId: data?.delayedItemId,
      delayedItemType: data?.delayedItemType,
      delayedBy: data?.delayedBy,
      criticality: data?.criticality,
      impact: data?.impact,
      riskPrediction: data?.riskPrediction,
      status: data?.status,
      report: data?.report,
      dropDptValue: dptList,
      actionPlans: data?.actionPlans,
      actionPlansIds: data?.actionPlansIds,
      buttonStatus: true,
      addButtonStatus: data?.addButtonStatus,
      pic: data?.pic,
      targetDate: data?.targetDate,
      momId: momForm?.momId,
      npdIds: momForm?.npdIds,
      notes: data?.notes,
    });
    setOpenDelayedDrawer(true);
    setDrawerDelayedType("read");
  };

  const addActionItemDiscussionHandler = (data: any) => {
    const update = dptData?.map((ele: any) => {
      if (ele._id === data._id) {
        let data = {
          id: uniqueId,
          actionPlanName: "",
          pic: "",
          targetDate: "",
          statusUpdate: "",
          dateOfUpdate: "",
          statusProgressData: [],
          status: "",
          buttonStatus: false,
          addButtonStatus: false,
        };
        let dataUpdate = [data, ...ele.actionPlans];
        return {
          ...ele,
          actionPlans: dataUpdate,
        };
      }
      return ele;
    });
    setDptData(update);
  };

  const addActionItemDelayedHandler = (data: any) => {
    const update = delayedItemData?.map((ele: any) => {
      if (ele._id === data._id) {
        let data = {
          id: uniqueId,
          actionPlanName: "",
          pic: "",
          targetDate: "",
          statusUpdate: "",
          dateOfUpdate: "",
          statusProgressData: [],
          status: "",
          buttonStatus: false,
          addButtonStatus: false,
        };
        let dataUpdate = [data, ...ele.actionPlans];
        return {
          ...ele,
          actionPlans: dataUpdate,
        };
      }
      return ele;
    });
    setDelayedItemData(update);
  };

  const valuesAddItemHandler = (data: any, name: any, value: any) => {
    const dataId = data?.id || data?._id;
    if (dataId) {
      if (name === "criticality" && value === "High") {
        const update = dptData?.map((ele: any) => {
          if (ele._id === dataId || ele.id === dataId) {
            return {
              ...ele,
              [name]: value,
              report: "yes",
            };
          }
          return ele;
        });
        setDptData(update);
      } else {
        const update = dptData?.map((ele: any) => {
          if (ele._id === dataId || ele.id === dataId) {
            return {
              ...ele,
              [name]: value,
            };
          }
          return ele;
        });
        setDptData(update);
      }
    }
  };

  const addValuesActionPlansHandler = (
    data: any,
    item: any,
    name: any,
    value: any
  ) => {
    const update = dptData?.map((ele: any) => {
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
    setDptData(update);
  };

  const addValuesDelayedActionPlansHandler = (
    data: any,
    item: any,
    name: any,
    value: any
  ) => {
    const update = delayedItemData?.map((ele: any) => {
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
    setDelayedItemData(update);
  };

  const editValuesDelayedActionPlanHandler = (data: any, item: any) => {
    setEditDelayedActionItemId(item._id);
    setEditDelayedActionItemStatus(true);
    const update = delayedItemData?.map((ele: any) => {
      if (ele._id === data._id) {
        let dataUpdate = ele?.actionPlans?.map((itd: any) => {
          if (itd._id === item._id) {
            return {
              ...itd,
              buttonStatus: false,
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
    setDelayedItemData(update);
  };

  const editUpdateValuesDelayedActionPlanHandler = (data: any, item: any) => {
    setEditDelayedActionItemId("");
    setEditDelayedActionItemStatus(false);
    let payload = {
      ...item,
      buttonStatus: true,
    };
    updateDelayedActionPlans(item._id, payload).then((response: any) => {
      if (response.status === 201 || response.status === 200) {
        const update = delayedItemData?.map((ele: any) => {
          if (ele.id === data.id || ele._id === data._id) {
            let dataUpdate = ele.actionPlans.map((itd: any) => {
              if (itd.id === item.id || itd._id === item._id) {
                return {
                  ...itd,
                  buttonStatus: true,
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
        setDelayedItemData(update);
        enqueueSnackbar(`Data Updated SuccessFully`, {
          variant: "success",
        });
      }
    });
  };

  const editValuesActionPlanHandler = (data: any, item: any) => {
    setEditActionItemId(item._id);
    setEditActionItemStatus(true);
    const update = dptData?.map((ele: any) => {
      if (ele._id === data._id) {
        let dataUpdate = ele?.actionPlans?.map((itd: any) => {
          if (itd._id === item._id) {
            return {
              ...itd,
              buttonStatus: false,
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
    setDptData(update);
  };

  const editUpdateValuesActionPlanHandler = (data: any, item: any) => {
    setEditActionItemId("");
    setEditActionItemStatus(false);
    let payload = {
      ...item,
      buttonStatus: true,
    };
    if (
      payload?.actionPlanName !== "" &&
      payload?.pic !== "" &&
      payload?.targetDate !== "" &&
      payload?.status !== ""
    ) {
      updateActionPlans(item._id, payload).then((response: any) => {
        if (response.status === 201 || response?.status === 200) {
          const update = dptData?.map((ele: any) => {
            if (ele.id === data.id || ele._id === data._id) {
              let dataUpdate = ele.actionPlans.map((itd: any) => {
                if (itd.id === item.id || itd._id === item._id) {
                  return {
                    ...itd,
                    buttonStatus: true,
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
          setDptData(update);
          enqueueSnackbar(`Data Updated SuccessFully`, {
            variant: "success",
          });
        }
      });
    } else {
      enqueueSnackbar("Please fill name,target date, pic, status to Submit", {
        variant: "error",
      });
    }
  };

  const deleteActionPlanHandler = (data: any, item: any) => {
    // console.log("delete called", data, item);
    deleteActionPlans(item._id).then((response: any) => {
      if (response?.status === 200 || response?.status === 201) {
        const update = dptData?.map((ele: any) => {
          if (ele._id === data._id) {
            let dataUpdate = ele.actionPlans.filter(
              (itd: any) => itd._id !== item._id
            );
            return {
              ...ele,
              actionPlans: dataUpdate,
            };
          }
          return ele;
        });
        setDptData(update);
        enqueueSnackbar(`Data Deleted SuccessFully`, {
          variant: "success",
        });
      }
    });
  };

  const deleteDelayedActionPlanHandler = (data: any, item: any) => {
    deleteDelayedActionPlans(item._id).then((response: any) => {
      if (response?.status === 200 || response?.status === 201) {
        const update = delayedItemData?.map((ele: any) => {
          if (ele._id === data._id) {
            let dataUpdate = ele.actionPlans.filter(
              (itd: any) => itd._id !== item._id
            );
            return {
              ...ele,
              actionPlans: dataUpdate,
            };
          }
          return ele;
        });
        setDelayedItemData(update);
        enqueueSnackbar(`Data Deleted SuccessFully`, {
          variant: "success",
        });
      }
    });
  };

  const submitActionPlanHandler = (data: any, item: any) => {
    let payload = {
      ...item,
      statusProgressData: statusProgressData,
      selectedDptId: data?.selectedDptId,
      momId: data?.momId,
      npdId: data?.npdId,
      itemId: data?._id,
      buttonStatus: true,
      addButtonStatus: true,
      type: "discussedItem",
    };
    // console.log("payload", payload);
    if (
      payload?.actionPlanName !== "" &&
      payload?.pic !== "" &&
      payload?.targetDate !== "" &&
      payload?.status !== ""
    ) {
      createActionPlans(payload).then((response: any) => {
        if (response?.status === 200 || response?.status === 201) {
          let payloadByDis;
          if (
            !Array.isArray(data?.actionPlansIds) ||
            data?.actionPlansIds?.length === 0
          ) {
            payloadByDis = {
              actionPlansIds: [response?.data?._id],
            };
          } else {
            payloadByDis = {
              actionPlansIds: [...data?.actionPlansIds, response?.data?._id],
            };
          }
          updateDiscussionItem(data?._id, payloadByDis).then((responseData) => {
            if (responseData?.status === 200 || responseData?.status === 201) {
              const updateListByNpd = npdListData?.map((ele: any) => {
                if (ele.npdId === data.npdId) {
                  const byUpdateData = Array.isArray(ele?.npdDepartments)
                    ? ele.npdDepartments.map((ite: any) => {
                        if (ite.dptId === data.selectedDptId) {
                          const updateIndie = Array.isArray(
                            ite?.dptDiscussionItems
                          )
                            ? ite.dptDiscussionItems.map(
                                (discussionItem: any) => {
                                  if (discussionItem.itemId === item._id) {
                                    const updateActions = Array.isArray(
                                      discussionItem?.itemActionPoints
                                    )
                                      ? [
                                          ...discussionItem.itemActionPoints,
                                          response?.data?._id,
                                        ]
                                      : [response?.data?._id];

                                    return {
                                      ...discussionItem,
                                      itemActionPoints: updateActions,
                                    };
                                  }
                                  return discussionItem;
                                }
                              )
                            : [];

                          return {
                            ...ite,
                            dptDiscussionItems: updateIndie,
                          };
                        }
                        return ite;
                      })
                    : [];

                  return {
                    ...ele,
                    npdDepartments: byUpdateData,
                  };
                }
                return ele;
              });
              setNpdListData(updateListByNpd);
              let payloadData = {
                discussionItems: updateListByNpd,
              };
              updateMinutesOfMeeting(momForm.momId, payloadData).then(
                (response: any) => {
                  if (response?.status === 201 || response?.status === 200) {
                    enqueueSnackbar(`Data Saved SuccessFully`, {
                      variant: "success",
                    });
                    getAllMomDataTable(momForm.momId, show);
                  }
                }
              );
            }
          });
        }
      });
    } else {
      enqueueSnackbar("Please fill name,target date, pic, status to Submit", {
        variant: "error",
      });
    }
  };

  const submitDelayedActionPlanHandler = (data: any, item: any) => {
    let payload = {
      ...item,
      statusProgressData: statusProgressData,
      selectedDptId: data?.selectedDptId,
      momId: data?.momId,
      npdId: data?.npdId,
      itemId: data?._id,
      buttonStatus: true,
      addButtonStatus: true,
      type: "delayedItem",
    };
    createActionPlans(payload).then((response: any) => {
      if (response?.status === 200 || response?.status === 201) {
        let payloadByDis;
        if (
          !Array.isArray(data?.actionPlansIds) ||
          data?.actionPlansIds?.length === 0
        ) {
          payloadByDis = {
            actionPlansIds: [response?.data?._id],
          };
        } else {
          payloadByDis = {
            actionPlansIds: [...data?.actionPlansIds, response?.data?._id],
          };
        }
        updateDelayedItem(data?._id, payloadByDis).then((responseData) => {
          if (responseData?.status === 200 || responseData?.status === 201) {
            const updateListByNpd = npdListData?.map((ele: any) => {
              if (ele.npdId === data.npdId) {
                const byUpdateData = Array.isArray(ele?.npdDepartments)
                  ? ele.npdDepartments.map((ite: any) => {
                      // console.log("item inside update delayed item", ite);
                      if (ite.dptId === data.selectedDptId) {
                        const updateIndie = Array.isArray(
                          ite?.dptDiscussionItems
                        )
                          ? ite.dptDiscussionItems.map(
                              (discussionItem: any) => {
                                if (discussionItem.itemId === item._id) {
                                  const updateActions = Array.isArray(
                                    discussionItem?.itemActionPoints
                                  )
                                    ? [
                                        ...discussionItem.itemActionPoints,
                                        response?.data?._id,
                                      ]
                                    : [response?.data?._id];

                                  return {
                                    ...discussionItem,
                                    itemActionPoints: updateActions,
                                  };
                                }
                                return discussionItem;
                              }
                            )
                          : [];

                        return {
                          ...ite,
                          dptDiscussionItems: updateIndie,
                        };
                      }
                      return ite;
                    })
                  : [];

                return {
                  ...ele,
                  npdDepartments: byUpdateData,
                };
              }
              return ele;
            });
            setNpdListData(updateListByNpd);
            let payloadData = {
              discussionItems: updateListByNpd,
            };
            updateMinutesOfMeeting(momForm.momId, payloadData).then(
              (response: any) => {
                if (response?.status === 201 || response?.status === 200) {
                  enqueueSnackbar(`Data Saved SuccessFully`, {
                    variant: "success",
                  });
                  getAllDelayedItemsDataTable(show, momForm?.momId);
                }
              }
            );
          }
        });
      }
    });
  };

  const addValuesMomHandler = (name: any, values: any) => {
    if (name === "meetingDateForm") {
      setMomForm({
        ...momForm,
        [name]: values,
        meetingDateTo: values,
        npdIds: [],
        npdIdData: [],
        discussionItems: [],
      });
    } else if (name === "meetingName") {
      setMomForm({
        ...momForm,
        [name]: values,
        meetingOwner: userInfo,
      });
    } else if (name === "presentDpt") {
      const filterByDpt = dataDptListConfig?.filter(
        (item: any) => !values.includes(item?.value)
      );
      setMomForm({
        ...momForm,
        presentDpt: values,
        absentDpt: filterByDpt?.map((ele: any) => ele?.value),
      });
    } else if (name === "attendees") {
      const filterExcuses = finalUsersFilterBy
        ?.filter((ele: any) =>
          values?.map((dot: any) => dot?.entityId)?.includes(ele?.entityId)
        )
        ?.flat()
        ?.filter(
          (item: any) => !values?.map((itd: any) => itd?.id)?.includes(item?.id)
        )
        ?.flat();
      setMomForm({
        ...momForm,
        [name]: values,
        excuses: [...filterExcuses],
      });
    } else {
      setMomForm({
        ...momForm,
        [name]: values,
      });
    }
  };

  const submitNextButton = () => {
    let payload = {
      ...momForm,
      //   meetingOwner: userInfo.id,
      createdOn: todayDate,
      status: "Open",
    };
    createMinutesOfMeeting(payload).then((response: any) => {
      if (response?.status === 201 || response?.status === 200) {
        enqueueSnackbar(`Data Saved SuccessFully`, {
          variant: "success",
        });
        setMomForm({
          ...momForm,
          momId: response?.data?._id,
        });
      }
    });
  };

  const submitValuesOnStatusUpdate = (data: any) => {
    // console.log("submit", data, statusProgressData);
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
    // console.log("status u[date", update);
    setStatusProgressData(update);
    // statusProgressUpdate(update);
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
  // console.log("statusProgressData", statusProgressData, actionItemData);
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
    // statusProgressUpdate(update);
  };
  const statusProgressUpdate = () => {
    const payload = {
      statusProgressData: statusProgressData,
    };
    updateActionPlans(actionItemData?._id, payload).then((response: any) => {
      if (response?.status === 200 || response?.status === 201) {
        setOpenStatus(false);
        getAllMomDataTable(momForm?.momId, show);
      }
    });
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
      disItemId: data?.disItemId,
      momId: data?.momId,
      actionPlanId: data?.actionPlanId,
      buttonStatus: false,
      addButtonStatus: false,
    };
    setStatusProgressData([dataItem, ...statusProgressData]);
    // statusProgressUpdate([dataItem, ...statusProgressData]);//added
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

  const uploadFileProps = (): UploadProps => ({
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
        if (Array.isArray(momForm?.attachments)) {
          setMomForm({
            ...momForm,
            attachments: result?.data,
          });
        } else {
          setMomForm({
            ...momForm,
            attachments: result?.data,
          });
        }

        enqueueSnackbar("Files Uploaded successfully", {
          variant: "success",
        });
        info.fileList = [];
      }
    },
  });

  const submitDataMomFinal = () => {
    let payloadData = {
      status: "Open",
    };
    updateMinutesOfMeeting(momForm.momId, payloadData).then((response: any) => {
      if (response?.status === 201 || response?.status === 200) {
        enqueueSnackbar(`Data Saved SuccessFully`, {
          variant: "success",
        });
        // getAllMomDataTable(momForm.momId);
        navigate("/MinutesOfMeeting");
      }
    });
  };

  const tagRender: TagRender = (props: any) => {
    const { label, value, closable, onClose } = props;
    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
    };
    return (
      <Tag
        color={value === "Open" ? "green" : "red"}
        onMouseDown={onPreventMouseDown}
        closable={closable}
        onClose={onClose}
        style={{
          marginInlineEnd: 4,
          color: value === "Open" ? "green" : "red",
        }}
      >
        {label}
      </Tag>
    );
  };

  const handleAccordionToggle = () => {
    // Toggle the accordion state
    setIsOpen((prevOpen) => !prevOpen);
  };

  const handleDeptFilter = (event: React.MouseEvent<HTMLElement>) => {
    setDeptFilterAnchorEl1(event.currentTarget);
    setDeptFilterModel(!deptFilterModel);
  };

  const handleCriticalityFilter = (event: React.MouseEvent<HTMLElement>) => {
    setCriticalityFilterAnchorEl1(event.currentTarget);
    setCriticalityFilterModel(!criticalityFilterModel);
  };

  const handleImpactFilter = (event: React.MouseEvent<HTMLElement>) => {
    setImpactFilterAnchorEl1(event.currentTarget);
    setImpactFilterModel(!impactFilterModel);
  };

  const handleStatusFilter = (event: React.MouseEvent<HTMLElement>) => {
    setStatusFilterAnchorEl1(event.currentTarget);
    setStatusFilterModel(!statusFilterModel);
  };

  return (
    <div>
      <div className={classes.divMainContainer}>
        <Button
          className={classes.backButton}
          onClick={() => {
            navigate("/NPD");
          }}
        >
          Exit
        </Button>
        <strong style={{ fontSize: "18px" }}>Minutes of Meeting</strong>
        <MuiButton variant="contained" onClick={handleClick}>
          Actions
        </MuiButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
        >
          <MenuItem onClick={submitDataMomFinal}>Submit</MenuItem>
          {/* <MenuItem onClick={handleClose}>Publish</MenuItem> */}
        </Menu>
      </div>
      <div style={{ paddingTop: "20px" }}>
        <Accordion
          className={ClassesDate.headingRoot}
          expanded={isOpen}
          onChange={handleAccordionToggle}
        >
          <AccordionSummary
            expandIcon={
              <MdExpandMore
                style={{ padding: "3px", fontSize: "28px", color: "#003566" }}
              />
            }
            aria-controls="panel1a-content"
            id="panel1a-header"
            className={ClassesDate.summaryRoot}
            style={{ margin: "0px", height: "10px" }}
          >
            <strong style={{ fontSize: "15px", color: "#003566" }}>
              Meeting Information
            </strong>
          </AccordionSummary>
          <AccordionDetails className={ClassesDate.headingRoot}>
            <div
              style={{ paddingTop: "20px" }}
              className={classes.descriptionLabelStyle}
            >
              <Form layout="vertical">
                <Descriptions
                  bordered
                  size="middle"
                  column={{
                    xxl: 3, // or any other number of columns you want for xxl screens
                    xl: 3, // or any other number of columns you want for xl screens
                    lg: 3, // or any other number of columns you want for lg screens
                    md: 3, // or any other number of columns you want for md screens
                    sm: 3, // or any other number of columns you want for sm screens
                    xs: 1, // or any other number of columns you want for xs screens
                  }}
                >
                  <Descriptions.Item span={3} label="Meeting Title: ">
                    <Form.Item
                      // name="type"
                      rules={[
                        {
                          required: true,
                          message: "Remarks",
                        },
                      ]}
                      style={{ marginBottom: 0 }}
                    >
                      <Input
                        value={momForm.meetingName}
                        placeholder="Enter Meeting Title"
                        onChange={(e: any) => {
                          addValuesMomHandler("meetingName", e.target.value);
                        }}
                      />
                    </Form.Item>
                  </Descriptions.Item>
                  <Descriptions.Item label="Meeting Owner: ">
                    <Form.Item
                      // name="type"
                      rules={[
                        {
                          required: true,
                          message: "Remarks",
                        },
                      ]}
                      style={{ marginBottom: 0 }}
                    >
                      <Input
                        value={momForm?.meetingOwner?.username}
                        disabled
                        onChange={(e: any) => {
                          addValuesMomHandler("meetingOwner", e.target.value);
                        }}
                      />
                    </Form.Item>
                  </Descriptions.Item>
                  <Descriptions.Item label="Meeting Date From: ">
                    <Form.Item
                      // name="type"
                      rules={[
                        {
                          required: true,
                          message: "Remarks",
                        },
                      ]}
                      style={{ marginBottom: 0 }}
                    >
                      <TextField
                        style={{
                          width: "100%",
                          height: "33px",
                        }}
                        className={ClassesDate.dateInput}
                        id="datetime-local"
                        type="datetime-local"
                        value={momForm?.meetingDateForm}
                        onChange={(e: any) => {
                          addValuesMomHandler(
                            "meetingDateForm",
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
                      />
                    </Form.Item>
                  </Descriptions.Item>
                  <Descriptions.Item label="Meeting Date To: ">
                    <Form.Item
                      // name="type"
                      rules={[
                        {
                          required: true,
                          message: "Remarks",
                        },
                      ]}
                      style={{ marginBottom: 0 }}
                    >
                      <TextField
                        style={{
                          width: "100%",
                          height: "33px",
                        }}
                        className={ClassesDate.dateInput}
                        id="datetime-local"
                        type="datetime-local"
                        value={momForm?.meetingDateTo}
                        onChange={(e: any) => {
                          addValuesMomHandler("meetingDateTo", e.target.value);
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
                      />
                    </Form.Item>
                  </Descriptions.Item>
                  <Descriptions.Item span={1.5} label=" Present Departments: ">
                    <Form.Item
                      // name="type"
                      rules={[
                        {
                          required: true,
                          message: "Remarks",
                        },
                      ]}
                      style={{ marginBottom: 0 }}
                    >
                      <Select
                        value={momForm.presentDpt}
                        mode="multiple"
                        placeholder="Select Present Departments"
                        style={{ width: "100%", color: "black" }}
                        // size="large"
                        onChange={(e: any) => {
                          addValuesMomHandler("presentDpt", e);
                        }}
                        options={dataDptListConfig}
                      />
                    </Form.Item>
                  </Descriptions.Item>
                  <Descriptions.Item span={1.5} label="Absent Departments: ">
                    <Form.Item
                      // name="type"
                      rules={[
                        {
                          required: true,
                          message: "Remarks",
                        },
                      ]}
                      style={{ marginBottom: 0 }}
                    >
                      <Select
                        mode="multiple"
                        value={momForm.absentDpt}
                        placeholder="Select Absent Departments"
                        style={{ width: "100%", color: "black" }}
                        // size="large"
                        onChange={(e: any) => {
                          addValuesMomHandler("absentDpt", e);
                        }}
                        options={dataDptListConfig}
                      />
                    </Form.Item>
                  </Descriptions.Item>
                  <Descriptions.Item span={1.5} label="Attendees: ">
                    <Form.Item
                      // name="type"
                      rules={[
                        {
                          required: true,
                          message: "Remarks",
                        },
                      ]}
                      style={{ marginBottom: 0 }}
                    >
                      <Autocomplete
                        multiple={true}
                        size="small"
                        id="tags-outlined"
                        className={ClassesDate.autoCompleteStyles}
                        options={finalUsersFilterBy}
                        style={{ width: "100%", padding: "0px" }}
                        getOptionLabel={getOptionLabel}
                        value={momForm.attendees || []}
                        filterSelectedOptions
                        onChange={(e, value: any) => {
                          addValuesMomHandler("attendees", value);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="outlined"
                            placeholder="Select Attendees"
                            size="small"
                            onChange={handleTextChange}
                            InputLabelProps={{
                              shrink: false,
                            }}
                          />
                        )}
                      />
                    </Form.Item>
                  </Descriptions.Item>
                  <Descriptions.Item span={1.5} label="Excuses: ">
                    <Form.Item
                      // name="type"
                      rules={[
                        {
                          required: true,
                          message: "Remarks",
                        },
                      ]}
                      style={{ marginBottom: 0 }}
                    >
                      <Autocomplete
                        multiple={true}
                        size="small"
                        id="tags-outlined"
                        className={ClassesDate.autoCompleteStyles}
                        options={finalUsersFilterBy}
                        style={{ width: "100%", padding: "0px" }}
                        getOptionLabel={getOptionLabel}
                        value={momForm.excuses || []}
                        filterSelectedOptions
                        //   disabled={item.buttonStatus}
                        onChange={(e, value: any) => {
                          addValuesMomHandler("excuses", value);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="outlined"
                            placeholder="Select Excuses"
                            size="small"
                            onChange={handleTextChange}
                            InputLabelProps={{
                              shrink: false,
                            }}
                          />
                        )}
                      />
                    </Form.Item>
                  </Descriptions.Item>
                  <Descriptions.Item span={2} label="Description: ">
                    <Form.Item
                      // name="type"
                      rules={[
                        {
                          required: true,
                          message: "Remarks",
                        },
                      ]}
                      style={{ marginBottom: 0 }}
                    >
                      <TextArea
                        rows={1}
                        placeholder="Description"
                        value={momForm.description}
                        maxLength={8000}
                        style={{ width: "100%", color: "black" }}
                        onChange={(e) => {
                          addValuesMomHandler("description", e.target.value);
                        }}
                      />
                    </Form.Item>
                  </Descriptions.Item>
                  <Descriptions.Item span={1} label="Attachments: ">
                    <Form.Item
                      // name="type"
                      rules={[
                        {
                          required: true,
                          message: "Remarks",
                        },
                      ]}
                      style={{ marginBottom: 0 }}
                    >
                      <Row
                        style={{
                          display: "flex",
                          gap: "5px",
                          alignItems: "center",
                        }}
                      >
                        <Upload
                          {...uploadFileProps()}
                          className={classes.uploadSection}
                          id={momForm.meetingName}
                          showUploadList={false}
                        >
                          <Button icon={<UploadOutlined />}>Upload</Button>
                        </Upload>
                        <Popover
                          content={
                            <div>
                              {momForm?.attachments?.map(
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
                                        title={"Are you sure to delete Data"}
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
                                          <img
                                            src={DeleteImgIcon}
                                            style={{
                                              width: "15px",
                                              height: "15px",
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
                            count={momForm?.attachments?.length}
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
                    </Form.Item>
                  </Descriptions.Item>
                </Descriptions>
              </Form>
            </div>
          </AccordionDetails>
        </Accordion>
        {momForm.momId === "" || momForm.momId === undefined ? (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              paddingTop: "10px",
            }}
          >
            <Button
              className={classes.backButton}
              onClick={() => {
                submitNextButton();
              }}
            >
              Save
            </Button>
          </div>
        ) : (
          ""
        )}
      </div>
      <div style={{ paddingTop: "15px" }}>
        {momForm?.momId ? (
          <>
            <div
              style={{ border: "1px solid grey", display: "flex", gap: "5px" }}
            >
              <div
                style={{
                  padding: "5px",
                  borderRight: "1px solid grey",
                  width: "160px",
                  height: "450px",
                  overflowY: "scroll",
                }}
              >
                <div>
                  <div style={{ display: "grid", gap: "5px" }}>
                    {npdList?.map((ele: any) => {
                      return (
                        <div>
                          <div
                            style={{
                              display: "flex",
                              gap: "3px",
                              alignItems: "center",
                            }}
                          >
                            {/* <Badge
                          count={
                            show ? (
                                <MdCheckCircle />
                              ) : (
                                <CancelIcon />
                              )
                          }
                        > */}
                            <Button
                              className={
                                ele.value === show
                                  ? classes.activeButton
                                  : classes.buttonNpd
                              }
                              style={{
                                border: momForm?.npdIds?.includes(ele?.value)
                                  ? "2px solid #f92019"
                                  : "",
                              }}
                              onClick={() => {
                                selectNpdChange(ele);
                              }}
                            >
                              {ele.label}
                            </Button>
                            {/* </Badge> */}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div style={{ padding: "5px", width: "100%" }}>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div style={{ display: "flex", gap: "20px" }}>
                    <Button
                      icon={<DiffOutlined />}
                      onClick={() => {
                        setButtonValue(0);
                      }}
                      className={
                        buttonValue === 0
                          ? classes.buttonContainerActive
                          : classes.buttonContainer
                      }
                    >
                      Discussed Items
                    </Button>
                    <Badge
                      count={
                        delayedItemData?.filter(
                          (item: any) => item?.npdId === show
                        )?.length
                      }
                      size="small"
                    >
                      <Button
                        icon={<FundOutlined />}
                        onClick={() => {
                          setButtonValue(1);
                        }}
                        className={
                          buttonValue === 1
                            ? classes.buttonContainerActive
                            : classes.buttonContainer
                        }
                      >
                        Delayed Items
                      </Button>
                    </Badge>
                  </div>
                  {!dptData?.map((ele: any) => ele?.npdId)?.includes(show) ? (
                    <Button
                      style={{ backgroundColor: "#00224E", color: "#fff" }}
                      onClick={() => {
                        createHandlerItem();
                      }}
                    >
                      Add Discussed Item
                    </Button>
                  ) : (
                    ""
                  )}
                </div>
                <Divider style={{ margin: "0px 0px", color: "#00224E" }} />
                <div>
                  {buttonValue === 0 ? (
                    <div style={{ paddingTop: "10px" }}>
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
                                >
                                  <div style={{display:"flex", justifyContent:"center", alignItems:"center"}}> 
                                  Department
                                  <IconButton
                                    style={{ padding: "0px", margin: "0px" }}
                                    onClick={(e: any) => {
                                      handleDeptFilter(e);
                                      setFilterColumnDept(!filterColumnDept);
                                    }}
                                  >
                                    {selectedDeptFilter?.length === 0 ? (
                                      <FilterOutlined style={{
                                        fontSize: "17px",
                                        cursor: "pointer",
                                        marginLeft: "10px",
                                        paddingTop:"2px"
                                      }}
                                        />
                                    ) : (
                                      <FilterFilled  style={{
                                        fontSize: "17px",
                                        cursor: "pointer",
                                        marginLeft: "10px",
                                        paddingTop:"2px"
                                      }}
                                       />
                                    )}
                                    <Menu
                                      anchorEl={deptFilterAnchorEl1}
                                      open={filterColumnDept}
                                      anchorOrigin={{
                                        vertical: "bottom",
                                        horizontal: "left",
                                      }}
                                      transformOrigin={{
                                        vertical: "top",
                                        horizontal: "left",
                                      }}
                                    >
                                      {dataDptListConfig?.map((item: any) => (
                                        <Box
                                          key={item.value}
                                          style={{
                                            padding: "0px 10px",
                                            fontSize: "12px",
                                            display: "flex",
                                            gap: "7px",
                                          }}
                                        >
                                          <Checkbox
                                            checked={selectedDeptFilter?.includes(
                                              item.value
                                            )}
                                            onClick={(event) =>
                                              event.stopPropagation()
                                            }
                                            onChange={() => {
                                              const value = item.value;
                                              if (
                                                selectedDeptFilter?.includes(
                                                  value
                                                )
                                              ) {
                                                setSelectedDeptFilter(
                                                  selectedDeptFilter.filter(
                                                    (key: any) => key !== value
                                                  )
                                                );
                                              } else {
                                                setSelectedDeptFilter([
                                                  ...selectedDeptFilter,
                                                  value,
                                                ]);
                                              }
                                            }}
                                          />
                                          {item.label}
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
                                            getAllMomDataTable(
                                              momForm?.momId,
                                              show
                                            );
                                          }}
                                        >
                                          Apply
                                        </Button>
                                        <Button
                                          onClick={() => {
                                            setSelectedDeptFilter([]);
                                          }}
                                        >
                                          Reset
                                        </Button>
                                      </Box>
                                    </Menu>
                                  </IconButton>
                                  </div>
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
                                  Discussed items
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
                                  <div style={{display:"flex", justifyContent:"center", alignItems:"center"}}>
                                  Criticality
                                  <IconButton
                                    style={{ padding: "0px", margin: "0px" }}
                                    onClick={(e: any) => {
                                      handleCriticalityFilter(e);
                                      setFilterColumnCriticality(
                                        !filterColumnCriticality
                                      );
                                    }}
                                  >
                                    {selectedCriticalityFilter?.length === 0 ? (
                                      <FilterOutlined style={{
                                        fontSize: "17px",
                                        cursor: "pointer",
                                        marginLeft: "10px",
                                        paddingTop:"2px"
                                      }} />
                                    ) : (
                                      <FilterFilled style={{
                                        fontSize: "17px",
                                        cursor: "pointer",
                                        marginLeft: "10px",
                                        paddingTop:"2px"
                                      }} />
                                    )}
                                    <Menu
                                      anchorEl={criticalityFilterAnchorEl1}
                                      open={filterColumnCriticality}
                                      anchorOrigin={{
                                        vertical: "bottom",
                                        horizontal: "left",
                                      }}
                                      transformOrigin={{
                                        vertical: "top",
                                        horizontal: "left",
                                      }}
                                    >
                                      {criticalityFilterOptions?.map(
                                        (item: any) => (
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
                                              checked={selectedCriticalityFilter?.includes(
                                                item
                                              )}
                                              onClick={(event) =>
                                                event.stopPropagation()
                                              }
                                              onChange={() => {
                                                const value = item;
                                                if (
                                                  selectedCriticalityFilter?.includes(
                                                    value
                                                  )
                                                ) {
                                                  setSelectedCriticalityFilter(
                                                    selectedCriticalityFilter.filter(
                                                      (key: any) =>
                                                        key !== value
                                                    )
                                                  );
                                                } else {
                                                  setSelectedCriticalityFilter([
                                                    ...selectedCriticalityFilter,
                                                    value,
                                                  ]);
                                                }
                                              }}
                                            />
                                            {item}
                                          </Box>
                                        )
                                      )}
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
                                            getAllMomDataTable(
                                              momForm?.momId,
                                              show
                                            );
                                          }}
                                        >
                                          Apply
                                        </Button>
                                        <Button
                                          onClick={() => {
                                            setSelectedCriticalityFilter([]);
                                          }}
                                        >
                                          Reset
                                        </Button>
                                      </Box>
                                    </Menu>
                                  </IconButton>
                                  </div>
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
                                  Report
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
                                  <div style={{display:"flex", justifyContent:"center", alignItems:"center"}}>
                                  Impact
                                  <IconButton
                                    style={{ padding: "0px", margin: "0px" }}
                                    onClick={(e: any) => {
                                      handleImpactFilter(e);
                                      setFilterColumnImpact(
                                        !filterColumnImpact
                                      );
                                    }}
                                  >
                                    {selectedImpactFilter?.length === 0 ? (
                                      <FilterOutlined style={{
                                        fontSize: "17px",
                                        cursor: "pointer",
                                        marginLeft: "10px",
                                        paddingTop:"2px"
                                      }} />
                                    ) : (
                                      <FilterFilled style={{
                                        fontSize: "17px",
                                        cursor: "pointer",
                                        marginLeft: "10px",
                                        paddingTop:"2px"
                                      }} />
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
                                            checked={selectedImpactFilter?.includes(
                                              item
                                            )}
                                            onClick={(event) =>
                                              event.stopPropagation()
                                            }
                                            onChange={() => {
                                              const value = item;
                                              if (
                                                selectedImpactFilter?.includes(
                                                  value
                                                )
                                              ) {
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
                                            getAllMomDataTable(
                                              momForm?.momId,
                                              show
                                            );
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
                                  </div>
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
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    Risk Prediction
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
                                            2-Delay/Issue;Action and impact
                                            available
                                          </span>
                                          <span>
                                            3-Delay/Issue;Action available no
                                            impact
                                          </span>
                                          <span>
                                            4--Activities in progress with
                                            minors issues
                                          </span>
                                          <span>
                                            5-All Activities are as per plan; no
                                            issues
                                          </span>
                                        </div>
                                      }
                                      title={null}
                                    >
                                      <MdInfo style={{ color: "red" ,  fontSize: "18px",}} />
                                    </Popover>
                                  </div>
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
                                  TargetDate
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
                                  {/* <div style={{display:"flex", justifyContent:"center", alignItems:"center"}}> */}
                                  <IconButton
                                    style={{ padding: "0px", margin: "0px" }}
                                    onClick={(e: any) => {
                                      handleStatusFilter(e);
                                      setFilterColumnStatus(
                                        !filterColumnStatus
                                      );
                                    }}
                                  >
                                    {selectedStatusFilter?.length === 0 ? (
                                      <FilterOutlined  style={{
                                        fontSize: "17px",
                                        cursor: "pointer",
                                        marginLeft: "10px",
                                        paddingTop:"2px"
                                      }}
                                        />
                                    ) : (
                                      <FilterFilled style={{
                                        fontSize: "17px",
                                        cursor: "pointer",
                                        marginLeft: "10px",
                                        paddingTop:"2px"
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
                                            checked={selectedStatusFilter?.includes(
                                              item
                                            )}
                                            onClick={(event) =>
                                              event.stopPropagation()
                                            }
                                            onChange={() => {
                                              const value = item;
                                              if (
                                                selectedStatusFilter?.includes(
                                                  value
                                                )
                                              ) {
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
                                            getAllMomDataTable(
                                              momForm?.momId,
                                              show
                                            );
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
                                  {/* </div> */}
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
                              {dptData?.map((ele: any, i: any) => {
                                const isRowExpanded = expandedRows[ele._id];

                                return (
                                  <>
                                    <TableRow>
                                      <TableCell
                                        align="center"
                                        style={{
                                          padding: "5px",
                                          fontSize: "12px",
                                          borderRight:
                                            "1px solid rgba(104, 104, 104, 0.1)",
                                          borderBottom:
                                            "1px solid rgba(104, 104, 104, 0.1)",
                                          height: "32px",
                                        }}
                                      >
                                        <div
                                          style={{
                                            display: "flex",
                                            flexDirection: "row",
                                            gap: "5px",
                                            alignItems: "center",
                                          }}
                                          key={ele._id}
                                        >
                                          {ele?.actionPlans?.length === 0 ? (
                                            <div style={{ width: "24px" }}>
                                              {""}
                                            </div>
                                          ) : (
                                            <IconButton
                                              aria-label="expand row"
                                              size="small"
                                              onClick={() => toggleRow(ele._id)}
                                            >
                                              {isRowExpanded ? (
                                                <MdExpandLess
                                                  style={{
                                                    fontSize: "19px",
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
                                                <MdExpandMore
                                                  style={{
                                                    fontSize: "19px",
                                                    color: "#0E497A",
                                                    backgroundColor: "#F8F9F9",
                                                    borderRadius: "50%",
                                                  }}
                                                />
                                                // </Badge>
                                              )}
                                            </IconButton>
                                          )}
                                          {/* <Select
                                              value={ele.selectedDptId}
                                              placeholder="Select Dpt"
                                              style={{
                                                width: "100%",
                                                color: "black",
                                              }}
                                              onChange={(e: any) => {
                                                valuesAddItemHandler(
                                                  ele,
                                                  "selectedDptId",
                                                  e
                                                );
                                              }}
                                              options={ele?.dropDptValue}
                                              disabled={ele.buttonStatus}
                                            /> */}
                                          {ele?.dptData?.entityName}
                                        </div>
                                      </TableCell>
                                      <TableCell
                                        //   align="center"
                                        style={{
                                          padding: "5px",
                                          fontSize: "12px",
                                          borderRight:
                                            "1px solid rgba(104, 104, 104, 0.1)",
                                          borderBottom:
                                            "1px solid rgba(104, 104, 104, 0.1)",
                                          height: "32px",
                                          maxWidth: "150px",
                                          minWidth: "150px", // Set a limit for the width
                                          overflow: "hidden", // Hide the overflowed content
                                          textOverflow: "ellipsis", // Show three dots when content overflows
                                          whiteSpace: "nowrap",
                                          textDecoration: "underLine",
                                          cursor: "pointer",
                                          color: "blue",
                                        }}
                                        onClick={() => {
                                          readModeDisItem(ele);
                                        }}
                                      >
                                        {/* <TextArea
                                            rows={1}
                                            maxLength={500000}
                                            value={ele.discussedItem}
                                            placeholder="Enter Discussion Item"
                                            style={{
                                              width: "100%",
                                              color: "black",
                                            }}
                                            onChange={(e: any) => {
                                              valuesAddItemHandler(
                                                ele,
                                                "discussedItem",
                                                e.target.value
                                              );
                                            }}
                                            disabled={ele.buttonStatus}
                                          /> */}
                                        {/* <Tooltip title={ele.discussedItem}>
                                          
                                          </Tooltip> */}
                                        {ele.discussedItem}
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        style={{
                                          padding: "5px",
                                          fontSize: "12px",
                                          borderRight:
                                            "1px solid rgba(104, 104, 104, 0.1)",
                                          borderBottom:
                                            "1px solid rgba(104, 104, 104, 0.1)",
                                          height: "32px",
                                        }}
                                      >
                                        {/* <Select
                                            value={ele.criticality}
                                            placeholder="Select Criticality"
                                            style={{
                                              width: "100%",
                                              color: "black",
                                            }}
                                            // size="large"
                                            onChange={(e: any) => {
                                              valuesAddItemHandler(
                                                ele,
                                                "criticality",
                                                e
                                              );
                                            }}
                                            options={[
                                              { value: "High", label: "High" },
                                              {
                                                value: "Normal",
                                                label: "Normal",
                                              },
                                              //   { value: "Medium", label: "Medium" },
                                            ]}
                                            disabled={ele.buttonStatus}
                                          /> */}

                                        <Tag
                                          style={{ width: "auto" }}
                                          color={
                                            ele.criticality === "High"
                                              ? "#fc808a"
                                              : ele.criticality === "Normal"
                                              ? "#5e9c65"
                                              : ""
                                          }
                                        >
                                          {ele.criticality}
                                        </Tag>
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        style={{
                                          padding: "5px",
                                          fontSize: "12px",
                                          borderRight:
                                            "1px solid rgba(104, 104, 104, 0.1)",
                                          borderBottom:
                                            "1px solid rgba(104, 104, 104, 0.1)",
                                          height: "32px",
                                        }}
                                      >
                                        {/* <div style={{ display: "flex" }}>
                                            <Radio.Group
                                              onChange={(e: any) => {
                                                valuesAddItemHandler(
                                                  ele,
                                                  "report",
                                                  e.target.value
                                                );
                                              }}
                                              value={ele?.report}
                                              disabled={ele?.buttonStatus}
                                              style={{ display: "flex" }}
                                            >
                                              <Radio value={"yes"}>Yes</Radio>
                                              <Radio value={"no"}>No</Radio>
                                            </Radio.Group>
                                          </div>{" "} */}
                                        {ele?.report}
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        style={{
                                          padding: "5px",
                                          fontSize: "12px",
                                          borderRight:
                                            "1px solid rgba(104, 104, 104, 0.1)",
                                          borderBottom:
                                            "1px solid rgba(104, 104, 104, 0.1)",
                                          height: "32px",
                                        }}
                                      >
                                        {/* <Select
                                            mode="multiple"
                                            value={ele.impact}
                                            placeholder="Select Impact"
                                            style={{
                                              width: "100%",
                                              color: "black",
                                            }}
                                            // size="large"
                                            onChange={(e: any) => {
                                              valuesAddItemHandler(
                                                ele,
                                                "impact",
                                                e
                                              );
                                            }}
                                            options={impactTypes}
                                            disabled={ele.buttonStatus}
                                          /> */}
                                        {/* {ele.impact} */}
                                        <div
                                          style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                          }}
                                        >
                                          <MultiUserDisplay
                                            data={ele.impact}
                                            name={"username"}
                                          />
                                        </div>
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        style={{
                                          padding: "5px",
                                          fontSize: "12px",
                                          borderRight:
                                            "1px solid rgba(104, 104, 104, 0.1)",
                                          borderBottom:
                                            "1px solid rgba(104, 104, 104, 0.1)",
                                          height: "32px",
                                        }}
                                      >
                                        {/* <Select
                                            value={ele.riskPrediction}
                                            placeholder="Select RiskPrediction"
                                            style={{
                                              width: "100%",
                                              color: "black",
                                            }}
                                            // size="large"
                                            onChange={(e: any) => {
                                              valuesAddItemHandler(
                                                ele,
                                                "riskPrediction",
                                                e
                                              );
                                            }}
                                            options={riskTypes}
                                            disabled={ele.buttonStatus}
                                          /> */}
                                        {ele.riskPrediction}
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        style={{
                                          padding: "5px",
                                          fontSize: "12px",
                                          borderRight:
                                            "1px solid rgba(104, 104, 104, 0.1)",
                                          borderBottom:
                                            "1px solid rgba(104, 104, 104, 0.1)",
                                          height: "32px",
                                        }}
                                      >
                                        {ele.pic
                                          ?.map((item: any) => item.username)
                                          .join(",")}
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        style={{
                                          padding: "5px",
                                          fontSize: "12px",
                                          borderRight:
                                            "1px solid rgba(104, 104, 104, 0.1)",
                                          borderBottom:
                                            "1px solid rgba(104, 104, 104, 0.1)",
                                          height: "32px",
                                        }}
                                      >
                                        {moment(ele.targetDate)?.format(
                                          "DD-MM-YYYY"
                                        )}
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        style={{
                                          padding: "5px",
                                          fontSize: "12px",
                                          borderRight:
                                            "1px solid rgba(104, 104, 104, 0.1)",
                                          borderBottom:
                                            "1px solid rgba(104, 104, 104, 0.1)",
                                          height: "32px",
                                        }}
                                      >
                                        {/* <Select
                                            placeholder="Select Status"
                                            style={{
                                              width: "100%",
                                              border:
                                                ele.status === ""
                                                  ? ""
                                                  : ele.status === "Open"
                                                  ? "2px solid red"
                                                  : "2px solid green",
                                              borderRadius: "6px",
                                            }}
                                            // size="large"
                                            tagRender={tagRender}
                                            value={ele.status}
                                            onChange={(e: any) => {
                                              valuesAddItemHandler(
                                                ele,
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
                                            disabled={ele.buttonStatus}
                                          /> */}
                                        <Tag
                                          style={{ width: "auto" }}
                                          color={
                                            ele.status === "Open"
                                              ? "red"
                                              : ele.status === "Close"
                                              ? "green"
                                              : ""
                                          }
                                        >
                                          {ele.status}
                                        </Tag>
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        style={{
                                          padding: "5px",
                                          fontSize: "12px",
                                          borderRight:
                                            "1px solid rgba(104, 104, 104, 0.1)",
                                          borderBottom:
                                            "1px solid rgba(104, 104, 104, 0.1)",
                                          height: "32px",
                                        }}
                                      >
                                        {ele.addButtonStatus === false ? (
                                          <IconButton
                                            style={{
                                              padding: "0px",
                                              margin: "0px",
                                            }}
                                            onClick={() => {
                                              submitValuesItemDiscussionHandler(
                                                ele
                                              );
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
                                            {pa.some(
                                              (item: any) =>
                                                item.id === userDetail.id
                                            ) &&
                                              ele.currentVersion === true &&
                                              (editDptItemStatus === true &&
                                              ele._id === editDptItemId ? (
                                                <IconButton
                                                  style={{
                                                    padding: "0px",
                                                    margin: "0px",
                                                  }}
                                                  onClick={() => {
                                                    editItemUpdateDiscussionHandler(
                                                      ele
                                                    );
                                                  }}
                                                >
                                                  <MdCheckBox />
                                                </IconButton>
                                              ) : (
                                                <Tooltip title="Edit Discussed Item">
                                                  <IconButton
                                                    style={{
                                                      padding: "0px",
                                                      margin: "0px",
                                                    }}
                                                    onClick={() => {
                                                      editItemDiscussionHandler(
                                                        ele
                                                      );
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
                                                </Tooltip>
                                              ))}

                                            {ele.currentVersion === true &&
                                              pa.some(
                                                (item: any) =>
                                                  item.id === userDetail.id
                                              ) && (
                                                <Popconfirm
                                                  placement="top"
                                                  title={
                                                    "Are you sure to delete Data"
                                                  }
                                                  onConfirm={() => {
                                                    deleteItemDiscussionHandler(
                                                      ele
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
                                                    //   deleteItemDiscussionHandler(ele);
                                                    // }}
                                                  >
                                                    <img
                                                      src={DeleteImgIcon}
                                                      style={{
                                                        width: "17px",
                                                        height: "17px",
                                                      }}
                                                    />
                                                  </IconButton>
                                                </Popconfirm>
                                              )}

                                            {/* {ele?.actionPlans?.length === 0 ? (
                                              <IconButton
                                                style={{
                                                  padding: "0px",
                                                  margin: "0px",
                                                }}
                                                onClick={() => {
                                                  addActionItemDiscussionHandler(
                                                    ele
                                                  );
                                                }}
                                              >
                                                <MdQueue />
                                              </IconButton>
                                            ) : (
                                              ""
                                            
                                            )} */}
                                            {ele?.actionPlans?.length === 0 &&
                                              pa.some(
                                                (item: any) =>
                                                  item.id === userDetail.id
                                              ) &&
                                              ele.currentVersion === true && (
                                                <IconButton
                                                  style={{
                                                    padding: "0px",
                                                    margin: "0px",
                                                  }}
                                                  onClick={() => {
                                                    addActionItemDiscussionHandler(
                                                      ele
                                                    );
                                                  }}
                                                >
                                                  <Tooltip title="Add Action Item">
                                                    <MdQueue style={{fontSize: "18px"}} />
                                                  </Tooltip>
                                                </IconButton>
                                              )}

                                            {i === 0 &&
                                            ele.currentVersion === true &&
                                            pa.some(
                                              (item: any) =>
                                                item.id === userDetail.id
                                            ) ? (
                                              <IconButton
                                                style={{
                                                  padding: "0px",
                                                  margin: "0px",
                                                }}
                                                onClick={() => {
                                                  addMoreItemDiscussionHandler(
                                                    ele
                                                  );
                                                }}
                                              >
                                                <Tooltip title="Add Discussion item">
                                                  <MdAddCircle  style={{fontSize: "18px"}} />
                                                </Tooltip>
                                              </IconButton>
                                            ) : (
                                              ""
                                            )}
                                          </Row>
                                        )}
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
                                              style={{ width: "1000px" }}
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
                                                    >
                                                      Action Plan
                                                    </TableCell>
                                                    <TableCell
                                                      style={{
                                                        color: "#00224E",
                                                        fontWeight: "bold",
                                                        padding: "5px",
                                                        fontSize: "13px",
                                                        width: "150px",
                                                      }}
                                                    >
                                                      PIC
                                                    </TableCell>
                                                    <TableCell
                                                      style={{
                                                        color: "#00224E",
                                                        fontWeight: "bold",
                                                        padding: "5px",
                                                        fontSize: "13px",
                                                        width: "70px",
                                                      }}
                                                    >
                                                      Target Date
                                                    </TableCell>
                                                    {/* <TableCell
                                              style={{
                                                color: "#00224E",
                                                fontWeight: "bold",
                                                padding: "5px",
                                                fontSize: "13px",
                                              }}
                                            >
                                              Status Update
                                            </TableCell> */}
                                                    {/* <TableCell
                                            style={{
                                              color: "#00224E",
                                              fontWeight: "bold",
                                              padding: "5px",
                                              fontSize: "13px",
                                            }}
                                          >
                                            Date of update
                                          </TableCell>*/}
                                                    <TableCell
                                                      style={{
                                                        color: "#00224E",
                                                        fontWeight: "bold",
                                                        padding: "5px",
                                                        fontSize: "13px",
                                                        width: "60px",
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
                                                        width: "100px",
                                                      }}
                                                    >
                                                      Actions
                                                    </TableCell>
                                                  </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                  {ele?.actionPlans?.map(
                                                    (item: any, index: any) => {
                                                      return (
                                                        <TableRow>
                                                          <TableCell
                                                            style={{
                                                              padding: "5px",
                                                            }}
                                                          >
                                                            <TextArea
                                                              rows={1}
                                                              maxLength={500000}
                                                              value={
                                                                item.actionPlanName
                                                              }
                                                              placeholder="Enter Action Plan"
                                                              style={{
                                                                width: "100%",
                                                                color: "black",
                                                              }}
                                                              onChange={(
                                                                e: any
                                                              ) => {
                                                                addValuesActionPlansHandler(
                                                                  ele,
                                                                  item,
                                                                  "actionPlanName",
                                                                  e.target.value
                                                                );
                                                              }}
                                                              disabled={
                                                                item.buttonStatus
                                                              }
                                                            />
                                                          </TableCell>
                                                          <TableCell
                                                            style={{
                                                              padding: "5px",
                                                            }}
                                                          >
                                                            <Autocomplete
                                                              multiple={false}
                                                              size="small"
                                                              id="tags-outlined"
                                                              options={
                                                                getAllUserData
                                                              }
                                                              className={
                                                                ClassesDate.autoCompleteStyles
                                                              }
                                                              style={{
                                                                width: "100%",
                                                              }}
                                                              getOptionLabel={
                                                                getOptionLabel
                                                              }
                                                              value={item.pic}
                                                              filterSelectedOptions
                                                              disabled={
                                                                item.buttonStatus
                                                              }
                                                              onChange={(
                                                                e,
                                                                value: any
                                                              ) => {
                                                                addValuesActionPlansHandler(
                                                                  ele,
                                                                  item,
                                                                  "pic",
                                                                  value
                                                                );
                                                              }}
                                                              renderInput={(
                                                                params
                                                              ) => (
                                                                <TextField
                                                                  {...params}
                                                                  variant="outlined"
                                                                  placeholder="Select Approver"
                                                                  size="small"
                                                                  onChange={
                                                                    handleTextChange
                                                                  }
                                                                  InputLabelProps={{
                                                                    shrink:
                                                                      false,
                                                                  }}
                                                                />
                                                              )}
                                                            />
                                                          </TableCell>
                                                          <TableCell
                                                            style={{
                                                              padding: "5px",
                                                            }}
                                                          >
                                                            <TextField
                                                              style={{
                                                                width: "100px",
                                                                height: "33px",
                                                              }}
                                                              className={
                                                                ClassesDate.dateInput
                                                              }
                                                              id="plan"
                                                              type="date"
                                                              value={
                                                                item?.targetDate
                                                              }
                                                              onChange={(
                                                                e: any
                                                              ) => {
                                                                addValuesActionPlansHandler(
                                                                  ele,
                                                                  item,
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
                                                              disabled={
                                                                item.buttonStatus
                                                              }
                                                            />
                                                          </TableCell>
                                                          {/* <TableCell
                                                    style={{ padding: "5px" }}
                                                    align="center"
                                                  >
                                                    <Input
                                                    value={item.statusUpdate}
                                                    placeholder="Enter Action Plan"
                                                    style={{
                                                      width: "100%",
                                                      color: "black",
                                                    }}
                                                    onChange={(e: any) => {
                                                      addValuesActionPlansHandler(
                                                        ele,
                                                        item,
                                                        "statusUpdate",
                                                        e.target.value
                                                      );
                                                    }}
                                                    disabled={item.buttonStatus}
                                                  />
                                                    
                                                  </TableCell> */}
                                                          {/* <TableCell
                                                  style={{ padding: "5px" }}
                                                >
                                                  <TextField
                                                    style={{
                                                      width: "100px",
                                                      height: "33px",
                                                    }}
                                                    className={
                                                      ClassesDate.dateInput
                                                    }
                                                    id="plan"
                                                    type="date"
                                                    value={item?.dateOfUpdate}
                                                    onChange={(e: any) => {
                                                      addValuesActionPlansHandler(
                                                        ele,
                                                        item,
                                                        "dateOfUpdate",
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
                                                    disabled={item.buttonStatus}
                                                  />
                                                </TableCell>*/}
                                                          <TableCell
                                                            style={{
                                                              padding: "5px",
                                                            }}
                                                          >
                                                            <Select
                                                              placeholder="Select Status"
                                                              style={{
                                                                width: "100px",
                                                                color: "black",
                                                                border:
                                                                  item.status ===
                                                                  ""
                                                                    ? ""
                                                                    : item.status ===
                                                                      "Open"
                                                                    ? "2px solid red"
                                                                    : "2px solid green",
                                                                borderRadius:
                                                                  "6px",
                                                              }}
                                                              // size="large"
                                                              value={
                                                                item.status
                                                              }
                                                              onChange={(e) => {
                                                                addValuesActionPlansHandler(
                                                                  ele,
                                                                  item,
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
                                                                  value:
                                                                    "Close",
                                                                  label:
                                                                    "Close",
                                                                },
                                                              ]}
                                                              disabled={
                                                                item.buttonStatus
                                                              }
                                                            />
                                                            {/* <Switch
                                                        value={item.status}
                                                        size="small"
                                                        onChange={(
                                                          checked: any
                                                        ) => {
                                                          addValuesActionPlansHandler(
                                                            ele,
                                                            item,
                                                            "status",
                                                            checked
                                                          );
                                                        }}
                                                        disabled={
                                                          item.buttonStatus
                                                        }
                                                      /> */}
                                                          </TableCell>

                                                          <TableCell
                                                            style={{
                                                              padding:
                                                                "10px 0px 0px 0px",
                                                              display: "flex",
                                                              gap: "7px",
                                                              alignItems:
                                                                "center",
                                                            }}
                                                          >
                                                            {item.addButtonStatus ===
                                                            false ? (
                                                              <>
                                                                {item?.status ? (
                                                                  <>
                                                                    <IconButton
                                                                      style={{
                                                                        padding:
                                                                          "0px",
                                                                        margin:
                                                                          "0px",
                                                                      }}
                                                                      onClick={() => {
                                                                        submitActionPlanHandler(
                                                                          ele,
                                                                          item
                                                                        );
                                                                      }}
                                                                    >
                                                                      <MdCheckCircle fontSize={"19px"} />
                                                                    </IconButton>
                                                                    {/* <Tooltip title="Status Updation 3505">
                                                                      <IconButton
                                                                        style={{
                                                                          margin:
                                                                            "0px",
                                                                          padding:
                                                                            "0px",
                                                                        }}
                                                                        onClick={() => {
                                                                          openModelStatus(
                                                                            item,
                                                                            ele
                                                                          );
                                                                        }}
                                                                      >
                                                                        <MdUpdate />
                                                                      </IconButton>
                                                                    </Tooltip> */}
                                                                  </>
                                                                ) : (
                                                                  pa.some(
                                                                    (
                                                                      item: any
                                                                    ) =>
                                                                      item.id ===
                                                                      userDetail.id
                                                                  ) &&
                                                                  ele.currentVersion ===
                                                                    true && (
                                                                    // {item.pic?.includes(userDetail?.id) && (
                                                                    <IconButton
                                                                      style={{
                                                                        padding:
                                                                          "0px",
                                                                        margin:
                                                                          "0px",
                                                                      }}
                                                                      onClick={() => {
                                                                        submitActionPlanHandler(
                                                                          ele,
                                                                          item
                                                                        );
                                                                      }}
                                                                    >
                                                                      <MdCheckCircle fontSize={"19px"} />
                                                                    </IconButton>
                                                                  )
                                                                )}
                                                              </>
                                                            ) : (
                                                              <Row
                                                                style={{
                                                                  display:
                                                                    "flex",
                                                                  gap: "3px",
                                                                }}
                                                              >
                                                                {editActionItemStatus ===
                                                                  true &&
                                                                item._id ===
                                                                  editActionItemId &&
                                                                pa.some(
                                                                  (item: any) =>
                                                                    item.id ===
                                                                    userDetail.id
                                                                ) &&
                                                                ele.currentVersion ===
                                                                  true ? (
                                                                  <IconButton
                                                                    style={{
                                                                      padding:
                                                                        "0px",
                                                                      margin:
                                                                        "0px",
                                                                    }}
                                                                    onClick={() => {
                                                                      editUpdateValuesActionPlanHandler(
                                                                        ele,
                                                                        item
                                                                      );
                                                                    }}
                                                                  >
                                                                    <MdCheckBox fontSize={"19px"} />
                                                                  </IconButton>
                                                                ) : (
                                                                  pa.some(
                                                                    (
                                                                      item: any
                                                                    ) =>
                                                                      item?.id ===
                                                                      userDetail.id
                                                                  ) &&
                                                                  ele.currentVersion ===
                                                                    true && (
                                                                    <IconButton
                                                                      style={{
                                                                        padding:
                                                                          "0px",
                                                                        margin:
                                                                          "0px",
                                                                      }}
                                                                      onClick={() => {
                                                                        editValuesActionPlanHandler(
                                                                          ele,
                                                                          item
                                                                        );
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
                                                                    </IconButton>
                                                                  )
                                                                )}
                                                                {(item?.pic
                                                                  ?.id ===
                                                                  userDetail?.id ||
                                                                  pa.some(
                                                                    (
                                                                      item: any
                                                                    ) =>
                                                                      item.id ===
                                                                      userDetail.id
                                                                  )) &&
                                                                  ele.currentVersion ===
                                                                    true && (
                                                                    <Tooltip title="Status Updation">
                                                                      <IconButton
                                                                        style={{
                                                                          margin:
                                                                            "0px",
                                                                          padding:
                                                                            "0px",
                                                                        }}
                                                                        onClick={() => {
                                                                          setActionItemData(
                                                                            item
                                                                          );

                                                                          openModelStatus(
                                                                            item,
                                                                            ele
                                                                          );
                                                                        }}
                                                                      >
                                                                        <MdUpdate fontSize={"19px"} />
                                                                      </IconButton>
                                                                    </Tooltip>
                                                                  )}
                                                                {pa.some(
                                                                  (item: any) =>
                                                                    item.id ===
                                                                    userDetail.id
                                                                ) &&
                                                                  ele.currentVersion ===
                                                                    true && (
                                                                    <Popconfirm
                                                                      placement="top"
                                                                      title={
                                                                        "Are you sure to delete Data"
                                                                      }
                                                                      onConfirm={() => {
                                                                        deleteActionPlanHandler(
                                                                          ele,
                                                                          item
                                                                        );
                                                                      }}
                                                                      okText="Yes"
                                                                      cancelText="No"
                                                                    >
                                                                      <IconButton
                                                                        style={{
                                                                          padding:
                                                                            "0px",
                                                                          margin:
                                                                            "0px",
                                                                        }}
                                                                        // onClick={() => {

                                                                        // }}
                                                                      >
                                                                        <img
                                                                          src={
                                                                            DeleteImgIcon
                                                                          }
                                                                          style={{
                                                                            width:
                                                                              "17px",
                                                                            height:
                                                                              "17px",
                                                                          }}
                                                                        />
                                                                      </IconButton>
                                                                    </Popconfirm>
                                                                  )}

                                                                {index === 0 &&
                                                                pa.some(
                                                                  (item: any) =>
                                                                    item.id ===
                                                                    userDetail.id
                                                                ) &&
                                                                ele.currentVersion ===
                                                                  true ? (
                                                                  <IconButton
                                                                    style={{
                                                                      padding:
                                                                        "0px",
                                                                      margin:
                                                                        "0px",
                                                                    }}
                                                                    onClick={() => {
                                                                      addActionItemDiscussionHandler(
                                                                        ele
                                                                      );
                                                                    }}
                                                                  >
                                                                    <MdAddCircle  fontSize={"19px"}/>
                                                                  </IconButton>
                                                                ) : (
                                                                  ""
                                                                )}
                                                              </Row>
                                                            )}
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
                      <div className={classes.pagination}>
                        <Pagination
                          size="small"
                          current={pageAction}
                          pageSize={pageLimitAction}
                          total={countAction}
                          showTotal={showTotalAction}
                          showSizeChanger
                          showQuickJumper
                          onChange={(page, pageSize) => {
                            handlePaginationAction(page, pageSize);
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div style={{ paddingTop: "10px" }}>
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
                                  align="center"
                                  style={{
                                    color: "#00224E",
                                    fontWeight: "bold",
                                    padding: "5px",
                                    fontSize: "13px",
                                  }}
                                >
                                  Department
                                </TableCell>
                                <TableCell
                                  align="center"
                                  style={{
                                    color: "#00224E",
                                    fontWeight: "bold",
                                    padding: "5px",
                                    fontSize: "13px",
                                  }}
                                >
                                  Activities/Sub-Activities
                                </TableCell>
                                <TableCell
                                  align="center"
                                  style={{
                                    color: "#00224E",
                                    fontWeight: "bold",
                                    padding: "5px",
                                    fontSize: "13px",
                                  }}
                                >
                                  Delay By(Days)
                                </TableCell>
                                {/* <TableCell
                                  align="center"
                                  style={{
                                    color: "#00224E",
                                    fontWeight: "bold",
                                    padding: "5px",
                                    fontSize: "13px",
                                  }}
                                >
                                  Criticality
                                </TableCell>
                                <TableCell
                                  align="center"
                                  style={{
                                    color: "#00224E",
                                    fontWeight: "bold",
                                    padding: "5px",
                                    fontSize: "13px",
                                  }}
                                >
                                  Report
                                </TableCell> */}
                                <TableCell
                                  align="center"
                                  style={{
                                    color: "#00224E",
                                    fontWeight: "bold",
                                    padding: "5px",
                                    fontSize: "13px",
                                  }}
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
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    Risk Prediction
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
                                            2-Delay/Issue;Action and impact
                                            available
                                          </span>
                                          <span>
                                            3-Delay/Issue;Action available no
                                            impact
                                          </span>
                                          <span>
                                            4--Activities in progress with
                                            minors issues
                                          </span>
                                          <span>
                                            5-All Activities are as per plan; no
                                            issues
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
                                  align="center"
                                  style={{
                                    color: "#00224E",
                                    fontWeight: "bold",
                                    padding: "5px",
                                    fontSize: "13px",
                                  }}
                                >
                                  TargetDate
                                </TableCell>
                                <TableCell
                                  align="center"
                                  style={{
                                    color: "#00224E",
                                    fontWeight: "bold",
                                    padding: "5px",
                                    fontSize: "13px",
                                  }}
                                >
                                  Status
                                </TableCell>
                                <TableCell
                                  align="center"
                                  style={{
                                    color: "#00224E",
                                    fontWeight: "bold",
                                    padding: "5px",
                                    fontSize: "13px",
                                  }}
                                >
                                  Actions
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {delayedItemData
                                ?.filter((item: any) => item?.npdId === show)
                                ?.map((ele: any, i: any) => {
                                  const isRowExpanded = expandedRows[ele._id];
                                  return (
                                    <>
                                      <TableRow>
                                        <TableCell
                                          align="center"
                                          style={{
                                            padding: "5px",
                                            fontSize: "12px",
                                            borderRight:
                                              "1px solid rgba(104, 104, 104, 0.1)",
                                            borderBottom:
                                              "1px solid rgba(104, 104, 104, 0.1)",
                                            height: "32px",
                                          }}
                                        >
                                          <div
                                            style={{
                                              display: "flex",
                                              flexDirection: "row",
                                              gap: "5px",
                                              alignItems: "center",
                                            }}
                                            key={ele._id}
                                          >
                                            {ele?.actionPlans?.length === 0 ? (
                                              <div style={{ width: "24px" }}>
                                                {""}
                                              </div>
                                            ) : (
                                              <IconButton
                                                aria-label="expand row"
                                                size="small"
                                                onClick={() =>
                                                  toggleRow(ele._id)
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
                                                  // <Badge
                                                  //   count={item?.subtask?.length}
                                                  //   size="small"
                                                  // >
                                                  <MdAddCircle
                                                    style={{
                                                      fontSize: "17px",
                                                      color: "#0E497A",
                                                      backgroundColor:
                                                        "#F8F9F9",
                                                      borderRadius: "50%",
                                                    }}
                                                  />
                                                  // </Badge>
                                                )}
                                              </IconButton>
                                            )}
                                            {/* <Select
                                              value={ele.selectedDptId}
                                              placeholder="Select Dpt"
                                              style={{
                                                width: "100%",
                                                color: "black",
                                              }}
                                              onChange={(e: any) => {
                                                valuesAddItemHandler(
                                                  ele,
                                                  "selectedDptId",
                                                  e
                                                );
                                              }}
                                              options={ele?.dropDptValue}
                                              disabled={ele.buttonStatus}
                                            /> */}
                                            {ele?.dptData?.entityName}
                                          </div>
                                        </TableCell>
                                        <TableCell
                                          //   align="center"
                                          style={{
                                            padding: "5px",
                                            fontSize: "12px",
                                            borderRight:
                                              "1px solid rgba(104, 104, 104, 0.1)",
                                            borderBottom:
                                              "1px solid rgba(104, 104, 104, 0.1)",
                                            height: "32px",
                                            maxWidth: "150px",
                                            minWidth: "150px", // Set a limit for the width
                                            overflow: "hidden", // Hide the overflowed content
                                            textOverflow: "ellipsis", // Show three dots when content overflows
                                            whiteSpace: "nowrap",
                                            textDecoration: "underLine",
                                            cursor: "pointer",
                                            color: "blue",
                                          }}
                                          onClick={() => {
                                            readModeDelayedItem(ele);
                                          }}
                                        >
                                          {/* <TextArea
                                            rows={1}
                                            maxLength={500000}
                                            value={ele.discussedItem}
                                            placeholder="Enter Discussion Item"
                                            style={{
                                              width: "100%",
                                              color: "black",
                                            }}
                                            onChange={(e: any) => {
                                              valuesAddItemHandler(
                                                ele,
                                                "discussedItem",
                                                e.target.value
                                              );
                                            }}
                                            disabled={ele.buttonStatus}
                                          /> */}
                                          {/* <Tooltip title={ele.discussedItem}>
                                          
                                          </Tooltip> */}
                                          {ele.delayedItem}
                                        </TableCell>
                                        <TableCell
                                          align="center"
                                          style={{
                                            padding: "5px",
                                            fontSize: "12px",
                                            borderRight:
                                              "1px solid rgba(104, 104, 104, 0.1)",
                                            borderBottom:
                                              "1px solid rgba(104, 104, 104, 0.1)",
                                            height: "32px",
                                          }}
                                        >
                                          {(() => {
                                            const today = new Date();
                                            const endDate = new Date(
                                              ele?.delayedBy
                                            );
                                            const diffTime =
                                              today.getTime() -
                                              endDate.getTime();
                                            const daysDifference = Math.ceil(
                                              diffTime / (1000 * 60 * 60 * 24)
                                            );

                                            return `${daysDifference}`;
                                          })()}
                                        </TableCell>
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
                                          }}
                                        >
                                          

                                          <Tag
                                            style={{ width: "auto" }}
                                            color={
                                              ele.criticality === "High"
                                                ? "#fc808a"
                                                : ele.criticality === "Normal"
                                                ? "#5e9c65"
                                                : ""
                                            }
                                          >
                                            {ele.criticality}
                                          </Tag>
                                        </TableCell>
                                        <TableCell
                                          align="center"
                                          style={{
                                            padding: "5px",
                                            fontSize: "12px",
                                            borderRight:
                                              "1px solid rgba(104, 104, 104, 0.1)",
                                            borderBottom:
                                              "1px solid rgba(104, 104, 104, 0.1)",
                                            height: "32px",
                                          }}
                                        >
                                          
                                          {ele?.report}
                                        </TableCell> */}
                                        <TableCell
                                          align="center"
                                          style={{
                                            padding: "5px",
                                            fontSize: "12px",
                                            borderRight:
                                              "1px solid rgba(104, 104, 104, 0.1)",
                                            borderBottom:
                                              "1px solid rgba(104, 104, 104, 0.1)",
                                            height: "32px",
                                          }}
                                        >
                                          {/* <Select
                                            mode="multiple"
                                            value={ele.impact}
                                            placeholder="Select Impact"
                                            style={{
                                              width: "100%",
                                              color: "black",
                                            }}
                                            // size="large"
                                            onChange={(e: any) => {
                                              valuesAddItemHandler(
                                                ele,
                                                "impact",
                                                e
                                              );
                                            }}
                                            options={impactTypes}
                                            disabled={ele.buttonStatus}
                                          /> */}
                                          {/* {ele.impact} */}
                                          <div
                                            style={{
                                              display: "flex",
                                              justifyContent: "center",
                                              alignItems: "center",
                                            }}
                                          >
                                            <MultiUserDisplay
                                              data={ele.impact}
                                              name={"username"}
                                            />
                                          </div>
                                        </TableCell>
                                        <TableCell
                                          align="center"
                                          style={{
                                            padding: "5px",
                                            fontSize: "12px",
                                            borderRight:
                                              "1px solid rgba(104, 104, 104, 0.1)",
                                            borderBottom:
                                              "1px solid rgba(104, 104, 104, 0.1)",
                                            height: "32px",
                                            maxWidth: "100px",
                                            minWidth: "100px",
                                          }}
                                        >
                                          {/* <Select
                                            value={ele.riskPrediction}
                                            placeholder="Select RiskPrediction"
                                            style={{
                                              width: "100%",
                                              color: "black",
                                            }}
                                            // size="large"
                                            onChange={(e: any) => {
                                              valuesAddItemHandler(
                                                ele,
                                                "riskPrediction",
                                                e
                                              );
                                            }}
                                            options={riskTypes}
                                            disabled={ele.buttonStatus}
                                          /> */}
                                          {ele.riskPrediction}
                                        </TableCell>
                                        <TableCell
                                          align="center"
                                          style={{
                                            padding: "5px",
                                            fontSize: "12px",
                                            borderRight:
                                              "1px solid rgba(104, 104, 104, 0.1)",
                                            borderBottom:
                                              "1px solid rgba(104, 104, 104, 0.1)",
                                            height: "32px",
                                          }}
                                        >
                                          {ele?.targetDate}
                                        </TableCell>
                                        <TableCell
                                          align="center"
                                          style={{
                                            padding: "5px",
                                            fontSize: "12px",
                                            borderRight:
                                              "1px solid rgba(104, 104, 104, 0.1)",
                                            borderBottom:
                                              "1px solid rgba(104, 104, 104, 0.1)",
                                            height: "32px",
                                          }}
                                        >
                                          {/* <Select
                                            placeholder="Select Status"
                                            style={{
                                              width: "100%",
                                              border:
                                                ele.status === ""
                                                  ? ""
                                                  : ele.status === "Open"
                                                  ? "2px solid red"
                                                  : "2px solid green",
                                              borderRadius: "6px",
                                            }}
                                            // size="large"
                                            tagRender={tagRender}
                                            value={ele.status}
                                            onChange={(e: any) => {
                                              valuesAddItemHandler(
                                                ele,
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
                                            disabled={ele.buttonStatus}
                                          /> */}
                                          <Tag
                                            style={{ width: "auto" }}
                                            color={
                                              ele.status === "Open"
                                                ? "red"
                                                : ele.status === "Close"
                                                ? "green"
                                                : ""
                                            }
                                          >
                                            {ele.status}
                                          </Tag>
                                        </TableCell>
                                        <TableCell
                                          align="center"
                                          style={{
                                            padding: "5px",
                                            fontSize: "12px",
                                            borderRight:
                                              "1px solid rgba(104, 104, 104, 0.1)",
                                            borderBottom:
                                              "1px solid rgba(104, 104, 104, 0.1)",
                                            height: "32px",
                                          }}
                                        >
                                          {ele.addButtonStatus === false &&
                                          pa.some(
                                            (item: any) =>
                                              item.id === userDetail.id
                                          ) ? (
                                            <IconButton
                                              style={{
                                                padding: "0px",
                                                margin: "0px",
                                              }}
                                              onClick={() => {
                                                submitValuesItemDiscussionHandler(
                                                  ele
                                                );
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
                                              {editDptItemStatus === true &&
                                              pa.some(
                                                (item: any) =>
                                                  item.id === userDetail.id
                                              ) &&
                                              ele._id === editDptItemId ? (
                                                <IconButton
                                                  style={{
                                                    padding: "0px",
                                                    margin: "0px",
                                                  }}
                                                  onClick={() => {
                                                    editItemUpdateDiscussionHandler(
                                                      ele
                                                    );
                                                  }}
                                                >
                                                  <MdCheckBox />
                                                </IconButton>
                                              ) : (
                                                pa.some(
                                                  (item: any) =>
                                                    item.id === userDetail.id
                                                ) && (
                                                  <IconButton
                                                    style={{
                                                      padding: "0px",
                                                      margin: "0px",
                                                    }}
                                                    onClick={() => {
                                                      editItemDelayedHandler(
                                                        ele
                                                      );
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
                                                )
                                              )}
                                              {/* <Popconfirm
                                                placement="top"
                                                title={
                                                  "Are you sure to delete Data"
                                                }
                                                onConfirm={() => {
                                                  deleteItemDelayedHandler(ele);
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
                                                  //   deleteItemDiscussionHandler(ele);
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
                                              </Popconfirm> */}
                                              {ele?.actionPlans?.length === 0 &&
                                              pa.some(
                                                (item: any) =>
                                                  item.id === userDetail.id
                                              ) ? (
                                                <IconButton
                                                  style={{
                                                    padding: "0px",
                                                    margin: "0px",
                                                  }}
                                                  onClick={() => {
                                                    addActionItemDelayedHandler(
                                                      ele
                                                    );
                                                  }}
                                                >
                                                  <MdQueue />
                                                </IconButton>
                                              ) : (
                                                ""
                                              )}
                                              {/* {i === 0 ? (
                                                <IconButton
                                                  style={{
                                                    padding: "0px",
                                                    margin: "0px",
                                                  }}
                                                  onClick={() => {
                                                    addMoreItemDiscussionHandler(
                                                      ele
                                                    );
                                                  }}
                                                >
                                                  <MdAddCircle />
                                                </IconButton>
                                              ) : (
                                                ""
                                              )} */}
                                            </Row>
                                          )}
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
                                                style={{ width: "1000px" }}
                                              >
                                                <Table>
                                                  <TableHead
                                                    style={{
                                                      backgroundColor:
                                                        "#E8F3F9",
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
                                                        Action Plan
                                                      </TableCell>
                                                      <TableCell
                                                        style={{
                                                          color: "#00224E",
                                                          fontWeight: "bold",
                                                          padding: "5px",
                                                          fontSize: "13px",
                                                          width: "150px",
                                                        }}
                                                      >
                                                        PIC
                                                      </TableCell>
                                                      <TableCell
                                                        style={{
                                                          color: "#00224E",
                                                          fontWeight: "bold",
                                                          padding: "5px",
                                                          fontSize: "13px",
                                                          width: "70px",
                                                        }}
                                                      >
                                                        Target Date
                                                      </TableCell>
                                                      {/* <TableCell
                                              style={{
                                                color: "#00224E",
                                                fontWeight: "bold",
                                                padding: "5px",
                                                fontSize: "13px",
                                              }}
                                            >
                                              Status Update
                                            </TableCell> */}
                                                      {/* <TableCell
                                            style={{
                                              color: "#00224E",
                                              fontWeight: "bold",
                                              padding: "5px",
                                              fontSize: "13px",
                                            }}
                                          >
                                            Date of update
                                          </TableCell>*/}
                                                      <TableCell
                                                        style={{
                                                          color: "#00224E",
                                                          fontWeight: "bold",
                                                          padding: "5px",
                                                          fontSize: "13px",
                                                          width: "60px",
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
                                                          width: "90px",
                                                        }}
                                                      >
                                                        Actions
                                                      </TableCell>
                                                    </TableRow>
                                                  </TableHead>
                                                  <TableBody>
                                                    {ele?.actionPlans?.map(
                                                      (
                                                        item: any,
                                                        index: any
                                                      ) => {
                                                        return (
                                                          <TableRow>
                                                            <TableCell
                                                              style={{
                                                                padding: "5px",
                                                              }}
                                                            >
                                                              <TextArea
                                                                rows={1}
                                                                maxLength={
                                                                  500000
                                                                }
                                                                value={
                                                                  item.actionPlanName
                                                                }
                                                                placeholder="Enter Action Plan"
                                                                style={{
                                                                  width: "100%",
                                                                  color:
                                                                    "black",
                                                                }}
                                                                onChange={(
                                                                  e: any
                                                                ) => {
                                                                  addValuesDelayedActionPlansHandler(
                                                                    ele,
                                                                    item,
                                                                    "actionPlanName",
                                                                    e.target
                                                                      .value
                                                                  );
                                                                }}
                                                                disabled={
                                                                  item.buttonStatus
                                                                }
                                                              />
                                                            </TableCell>
                                                            <TableCell
                                                              style={{
                                                                padding: "5px",
                                                              }}
                                                            >
                                                              <Autocomplete
                                                                multiple={false}
                                                                size="small"
                                                                id="tags-outlined"
                                                                options={
                                                                  getAllUserData
                                                                }
                                                                className={
                                                                  ClassesDate.autoCompleteStyles
                                                                }
                                                                style={{
                                                                  width: "100%",
                                                                }}
                                                                getOptionLabel={
                                                                  getOptionLabel
                                                                }
                                                                value={item.pic}
                                                                filterSelectedOptions
                                                                disabled={
                                                                  item.buttonStatus
                                                                }
                                                                onChange={(
                                                                  e,
                                                                  value: any
                                                                ) => {
                                                                  addValuesDelayedActionPlansHandler(
                                                                    ele,
                                                                    item,
                                                                    "pic",
                                                                    value
                                                                  );
                                                                }}
                                                                renderInput={(
                                                                  params
                                                                ) => (
                                                                  <TextField
                                                                    {...params}
                                                                    variant="outlined"
                                                                    placeholder="Select Approver"
                                                                    size="small"
                                                                    onChange={
                                                                      handleTextChange
                                                                    }
                                                                    InputLabelProps={{
                                                                      shrink:
                                                                        false,
                                                                    }}
                                                                  />
                                                                )}
                                                              />
                                                            </TableCell>
                                                            <TableCell
                                                              style={{
                                                                padding: "5px",
                                                              }}
                                                            >
                                                              <TextField
                                                                style={{
                                                                  width:
                                                                    "100px",
                                                                  height:
                                                                    "33px",
                                                                }}
                                                                className={
                                                                  ClassesDate.dateInput
                                                                }
                                                                id="plan"
                                                                type="date"
                                                                value={
                                                                  item?.targetDate
                                                                }
                                                                onChange={(
                                                                  e: any
                                                                ) => {
                                                                  addValuesDelayedActionPlansHandler(
                                                                    ele,
                                                                    item,
                                                                    "targetDate",
                                                                    e.target
                                                                      .value
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
                                                                disabled={
                                                                  item.buttonStatus
                                                                }
                                                              />
                                                            </TableCell>
                                                            {/* <TableCell
                                                    style={{ padding: "5px" }}
                                                    align="center"
                                                  >
                                                    <Input
                                                    value={item.statusUpdate}
                                                    placeholder="Enter Action Plan"
                                                    style={{
                                                      width: "100%",
                                                      color: "black",
                                                    }}
                                                    onChange={(e: any) => {
                                                      addValuesActionPlansHandler(
                                                        ele,
                                                        item,
                                                        "statusUpdate",
                                                        e.target.value
                                                      );
                                                    }}
                                                    disabled={item.buttonStatus}
                                                  />
                                                    
                                                  </TableCell> */}
                                                            {/* <TableCell
                                                  style={{ padding: "5px" }}
                                                >
                                                  <TextField
                                                    style={{
                                                      width: "100px",
                                                      height: "33px",
                                                    }}
                                                    className={
                                                      ClassesDate.dateInput
                                                    }
                                                    id="plan"
                                                    type="date"
                                                    value={item?.dateOfUpdate}
                                                    onChange={(e: any) => {
                                                      addValuesActionPlansHandler(
                                                        ele,
                                                        item,
                                                        "dateOfUpdate",
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
                                                    disabled={item.buttonStatus}
                                                  />
                                                </TableCell>*/}
                                                            <TableCell
                                                              style={{
                                                                padding: "5px",
                                                              }}
                                                            >
                                                              <Select
                                                                placeholder="Select Status"
                                                                style={{
                                                                  width:
                                                                    "100px",
                                                                  color:
                                                                    "black",
                                                                  border:
                                                                    item.status ===
                                                                    ""
                                                                      ? ""
                                                                      : item.status ===
                                                                        "Open"
                                                                      ? "2px solid red"
                                                                      : "2px solid green",
                                                                  borderRadius:
                                                                    "6px",
                                                                }}
                                                                // size="large"
                                                                value={
                                                                  item.status
                                                                }
                                                                onChange={(
                                                                  e
                                                                ) => {
                                                                  addValuesDelayedActionPlansHandler(
                                                                    ele,
                                                                    item,
                                                                    "status",
                                                                    e
                                                                  );
                                                                }}
                                                                options={[
                                                                  {
                                                                    value:
                                                                      "Open",
                                                                    label:
                                                                      "Open",
                                                                  },
                                                                  {
                                                                    value:
                                                                      "Close",
                                                                    label:
                                                                      "Close",
                                                                  },
                                                                ]}
                                                                disabled={
                                                                  item.buttonStatus
                                                                }
                                                              />
                                                              {/* <Switch
                                                        value={item.status}
                                                        size="small"
                                                        onChange={(
                                                          checked: any
                                                        ) => {
                                                          addValuesActionPlansHandler(
                                                            ele,
                                                            item,
                                                            "status",
                                                            checked
                                                          );
                                                        }}
                                                        disabled={
                                                          item.buttonStatus
                                                        }
                                                      /> */}
                                                            </TableCell>
                                                            <TableCell
                                                              style={{
                                                                padding:
                                                                  "10px 0px 0px 0px",
                                                                display: "flex",
                                                                gap: "7px",
                                                                alignItems:
                                                                  "center",
                                                              }}
                                                            >
                                                              {item.addButtonStatus ===
                                                              false ? (
                                                                <>
                                                                  {item?.status ? (
                                                                    <>
                                                                      <IconButton
                                                                        style={{
                                                                          padding:
                                                                            "0px",
                                                                          margin:
                                                                            "0px",
                                                                        }}
                                                                        onClick={() => {
                                                                          submitDelayedActionPlanHandler(
                                                                            ele,
                                                                            item
                                                                          );
                                                                        }}
                                                                      >
                                                                        <MdCheckCircle />
                                                                      </IconButton>
                                                                    </>
                                                                  ) : (
                                                                    pa.some(
                                                                      (
                                                                        item: any
                                                                      ) =>
                                                                        item.id ===
                                                                        userDetail.id
                                                                    ) && (
                                                                      <IconButton
                                                                        style={{
                                                                          padding:
                                                                            "0px",
                                                                          margin:
                                                                            "0px",
                                                                        }}
                                                                        onClick={() => {
                                                                          submitDelayedActionPlanHandler(
                                                                            ele,
                                                                            item
                                                                          );
                                                                        }}
                                                                      >
                                                                        <MdCheckCircle />
                                                                      </IconButton>
                                                                    )
                                                                  )}
                                                                </>
                                                              ) : (
                                                                <Row
                                                                  style={{
                                                                    display:
                                                                      "flex",
                                                                    gap: "3px",
                                                                  }}
                                                                >
                                                                  {editDelayedActionItemStatus ===
                                                                    true &&
                                                                  item._id ===
                                                                    editDelayedActionItemId &&
                                                                  pa.some(
                                                                    (
                                                                      item: any
                                                                    ) =>
                                                                      item.id ===
                                                                      userDetail.id
                                                                  ) ? (
                                                                    <IconButton
                                                                      style={{
                                                                        padding:
                                                                          "0px",
                                                                        margin:
                                                                          "0px",
                                                                      }}
                                                                      onClick={() => {
                                                                        editUpdateValuesDelayedActionPlanHandler(
                                                                          ele,
                                                                          item
                                                                        );
                                                                      }}
                                                                    >
                                                                      <MdCheckBox />
                                                                    </IconButton>
                                                                  ) : (
                                                                    pa.some(
                                                                      (
                                                                        item: any
                                                                      ) =>
                                                                        item.id ===
                                                                        userDetail.id
                                                                    ) && (
                                                                      <IconButton
                                                                        style={{
                                                                          padding:
                                                                            "0px",
                                                                          margin:
                                                                            "0px",
                                                                        }}
                                                                        onClick={() => {
                                                                          editValuesDelayedActionPlanHandler(
                                                                            ele,
                                                                            item
                                                                          );
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
                                                                      </IconButton>
                                                                    )
                                                                  )}

                                                                  {(item.pic
                                                                    ?.id ===
                                                                    userDetail?.id ||
                                                                    pa.some(
                                                                      (
                                                                        item: any
                                                                      ) =>
                                                                        item.id ===
                                                                        userDetail.id
                                                                    )) && (
                                                                    <Tooltip title="Status Updation">
                                                                      <IconButton
                                                                        style={{
                                                                          margin:
                                                                            "0px",
                                                                          padding:
                                                                            "0px",
                                                                        }}
                                                                        onClick={() => {
                                                                          setActionItemData(
                                                                            item
                                                                          );
                                                                          openModelDelayedStatus(
                                                                            item,
                                                                            ele
                                                                          );
                                                                        }}
                                                                      >
                                                                        <MdUpdate />
                                                                      </IconButton>
                                                                    </Tooltip>
                                                                  )}
                                                                  {pa.some(
                                                                    (
                                                                      item: any
                                                                    ) =>
                                                                      item.id ===
                                                                      userDetail.id
                                                                  ) && (
                                                                    <Popconfirm
                                                                      placement="top"
                                                                      title={
                                                                        "Are you sure to delete Data"
                                                                      }
                                                                      onConfirm={() => {
                                                                        deleteDelayedActionPlanHandler(
                                                                          ele,
                                                                          item
                                                                        );
                                                                      }}
                                                                      okText="Yes"
                                                                      cancelText="No"
                                                                    >
                                                                      <IconButton
                                                                        style={{
                                                                          padding:
                                                                            "0px",
                                                                          margin:
                                                                            "0px",
                                                                        }}
                                                                        // onClick={() => {

                                                                        // }}
                                                                      >
                                                                        <img
                                                                          src={
                                                                            DeleteImgIcon
                                                                          }
                                                                          style={{
                                                                            width:
                                                                              "17px",
                                                                            height:
                                                                              "17px",
                                                                          }}
                                                                        />
                                                                      </IconButton>
                                                                    </Popconfirm>
                                                                  )}

                                                                  {index ===
                                                                    0 &&
                                                                  pa.some(
                                                                    (
                                                                      item: any
                                                                    ) =>
                                                                      item.id ===
                                                                      userDetail.id
                                                                  ) ? (
                                                                    <IconButton
                                                                      style={{
                                                                        padding:
                                                                          "0px",
                                                                        margin:
                                                                          "0px",
                                                                      }}
                                                                      onClick={() => {
                                                                        addActionItemDelayedHandler(
                                                                          ele
                                                                        );
                                                                      }}
                                                                    >
                                                                      <MdAddCircle />
                                                                    </IconButton>
                                                                  ) : (
                                                                    ""
                                                                  )}
                                                                </Row>
                                                              )}
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
                      <div className={classes.pagination}>
                        <Pagination
                          size="small"
                          current={pageDelayed}
                          pageSize={pageLimitDelayed}
                          total={countDelayed}
                          showTotal={showTotalDelayed}
                          showSizeChanger
                          showQuickJumper
                          onChange={(page, pageSize) => {
                            handlePaginationDelayed(page, pageSize);
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          ""
        )}
      </div>
      <div>
        {openDrawer && (
          <MomInfoDrawerIndex
            drawer={openDrawer}
            discussionFormData={discussionFormData}
            setDiscussionFormData={setDiscussionFormData}
            setDrawer={setOpenDrawer}
            drawerType={drawerType}
            setFetchAllApiStatus={setFetchAllApiStatus}
          />
        )}
        {openDelayedDrawer && (
          <MomInfoDelayedItemDrawerIndex
            drawer={openDelayedDrawer}
            delayedFormData={delayedFormData}
            setDelayedFormData={setDelayedFormData}
            setDrawer={setOpenDelayedDrawer}
            drawerDelayedType={drawerDelayedType}
            setFetchAllApiDelayedStatus={setFetchAllApiDelayedStatus}
          />
        )}
        <Modal
          title={"Activity description"}
          open={openStatus}
          onCancel={closeModelStatus}
          footer={
            <Button
              onClick={statusProgressUpdate}
              style={{ backgroundColor: "#00224E", color: "white" }}
              disabled={!disableStatus}
            >
              Submit
            </Button>
          }
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
                              disabled={!disableStatus}
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
                              disabled={!disableStatus}
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
                                  icon={<UploadOutlined />}
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
                                                fontSize: "17px",
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
                                                disabled={!disableStatus}
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
                                value={ele.status}
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
                                disabled={!disableStatus}
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
                                    disabled={!disableStatus}
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
                                        disabled={!disableStatus}
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
                                        disabled={!disableStatus}
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
                                      disabled={!disableStatus}
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
                                        disabled={!disableStatus}
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
      </div>
    </div>
  );
};

export default MeetingCreatingIndex;