import React, { useEffect, useRef, useState } from "react";
import axios from "../../apis/axios.global";
import { MdSearch } from "react-icons/md";
import {
  AiOutlineFilter,
  AiFillFilter,
  AiOutlinePlusCircle,
  AiOutlineMinusCircle,
  AiOutlineUsergroupAdd,
  AiOutlineSend,
  AiOutlineSearch,
} from "react-icons/ai";
//mui
import {
  Box,
  Grid,
  FormControl,
  MenuItem,
  TextField,
  Paper,
  IconButton,
  InputLabel,
  Select,
  AccordionDetails,
  Accordion,
  AccordionSummary,
} from "@material-ui/core";
import { MdRepeat } from "react-icons/md";
import {
  Table,
  Tag,
  Checkbox,
  Button,
  Pagination,
  Dropdown,
  Tour,
  Tooltip,
  Modal,
  Input,
  Segmented,
  Progress,
  Typography,
} from "antd";
import { ReactComponent as OrgSettingsIcon } from "assets/moduleIcons/module-setting.svg";
import { MdOutlinePermContactCalendar } from "react-icons/md";
import useStyles from "./styles";
import "./tableStyles.css";
import getAppUrl from "../../utils/getAppUrl";
import MrmModal from "./Modal/MrmModal";
import ScheduleDrawer from "./Drawer/ScheduleDrawer";
import { useLocation } from "react-router-dom";
import moment from "moment";
import { Autocomplete } from "@material-ui/lab";
import { useSnackbar } from "notistack";
import { ColumnsType } from "antd/es/table";
import ActionPoint from "./Drawer/ActionPoint";
import { useNavigate } from "react-router-dom";
import ModuleHeader from "components/Navigation/ModuleHeader";
import checkRoles from "../../utils/checkRoles";
import { ReactComponent as MRMLogo } from "../../assets/MRM/mrm.svg";
import { ReactComponent as CreateIcon } from "../../assets/MRM/addIcon.svg";
import { ReactComponent as ActionPointIcon } from "../../assets/MRM/actionPoint.svg";

import { ReactComponent as KeyAgendaIcon } from "../../assets/MRM/keyAgenda.svg";

import { ReactComponent as SelectedTabArrow } from "assets/icons/SelectedTabArrow.svg";
import AddMrmActionPoint from "./Drawer/AddMrmActionPoint";
import EditMrmActionPoint from "./Drawer/EditMrmActionPoint";
import YearComponent from "components/Yearcomponent";
import getYearFormat from "utils/getYearFormat";
import { currentAuditYear } from "recoil/atom";

import CalendarMRM from "./CalendarMRM";
import CalendarModal from "./Modal/CalendarModal";
import { API_LINK } from "config";
import { MdMailOutline } from "react-icons/md";
import { MdOutlinePictureAsPdf } from "react-icons/md";
import { ReactComponent as CustomEditIcon } from "assets/documentControl/Edit.svg";
import { ReactComponent as CustomDeleteICon } from "assets/documentControl/Delete.svg";
import type { PaginationProps, MenuProps } from "antd";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import {
  deleteMeeting,
  getAgendaOwnerMeeting,
  getAllMeeting,
  getMeetingById,
  getMyActionPoints,
  getMyMeeting,
  getParticipantMeeting,
} from "apis/mrmmeetingsApi";
import { ReactComponent as FilterIcon } from "../../assets/documentControl/Filter.svg";

import { MdDescription } from "react-icons/md";
import MrmAddMeetings from "./Drawer/MeetingCreating";
import MrmEditingMeetings from "./Drawer/MeetingEditing";
import { MdAddCircleOutline, MdPermContactCalendar } from "react-icons/md";
import Popconfirm from "antd/lib/popconfirm";

import {
  getActionPointMeetingById,
  getAllActionPointsData,
} from "apis/mrmActionpoint";
import { useRecoilState } from "recoil";
import printJS from "print-js";
import { MdExpandMore } from "react-icons/md";

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import { MdTouchApp } from "react-icons/md";
import type { TourProps } from "antd";
import { RiSidebarFoldLine, RiSidebarUnfoldLine } from "react-icons/ri";
import MRMSideNav from "./Components/MRMSideNav";
import DepartmentSelector from "components/ReusableComponents/DepartmentSelector";
const tabOptions: any = [
  { key: 5, label: "MRM Plan" },
  { key: 0, label: "MRM Schedule" },
  { key: 1, label: "Minutes of Meeting" },
  { key: 2, label: "Action Points" },

  { key: "settings", label: "Settings" },
];
const allOption = { id: "All", locationName: "All" };

export interface IKeyAgenda {
  _id: string;
  meetingName: string;
  meetingdate: any;
  organizer: any;
  attendees: any;
  decision: any;
  agenda: any;
  status: boolean;
}
let addMonthyColumns: any = [];

interface DataItem {
  access: any; // Assuming 'access' property is a string, adjust the type accordingly
  value: {
    status: any; // Assuming 'status' property is a string, adjust the type accordingly
    // Add other properties as needed
  };
  // Add other properties as needed
}

const MRM = () => {
  const classes = useStyles();
  const userDetail = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const [dataSource, setDataSource] = useState<any[]>([]);
  // console.log("dataSource", dataSource);
  if (dataSource?.length > 0) {
  } else {
    // console.log("dataSource is empty");
  }
  const [selectedDept, setSelectedDept] = useState<any>({});
  const [selectedActionDept, setSelectedActionDept] = useState<any>({});
  const [selectedMeetingDept, setSelectedMeetingDept] = useState<any>({});
  const matches = useMediaQuery("(min-width:822px)");
  const smallScreen = useMediaQuery("(min-width:450px)");
  const [openScheduleDrawer, setOpenScheduleDrawer] = useState<boolean>(false);
  // const [scheduleDrawerData, setScheduleDrawerData] = useState<any>({});
  const realmName = getAppUrl();
  const navigate = useNavigate();
  const [mode, setMode] = useState<any>("Create");
  const [openAction, setOpenAction] = useState(false);
  const [openMeeting, setOpenMeeting] = useState(false);
  const [openMeetingAttended, setOpenMeetingAttended] = useState(false);
  const [locationOptions, setLocationOptions] = useState<any[]>([]);

  const [locationNameUnit, setLocationNameUnit] = useState<any>("");
  const [expandDataValues, setExpandDataValues] = useState<any>({});
  const [mrmEditOptions, setMrmEditOptions] = useState<any>("");
  const [actionPointDataSource, setActionPointDataSource] = useState<any[]>([]);
  const [statusMode, setStatusMode] = useState<any>();

  const [openModal, setOpenModal] = useState({
    open: false,
    data: {},
  });
  const locationstate = useLocation();
  const [meetingDataById, setMeetingDataById] = useState<any>();
  const [actionPointsPdfData, setActionPointsPdfData] = useState<any>();
  const [openActionPointDrawer, setOpenActionPointDrawer] = useState({
    open: false,
    data: {},
  });
  const [isFilterOwner, setfilterOwner] = useState<boolean>(false);
  const [isFiltertype, setfilterType] = useState<boolean>(false);
  const [isFilterActionMeetingtype, setfilterActionMeetingType] =
    useState<boolean>(false);
  const [isMeetingFilterOwner, setMeetingfilterOwner] =
    useState<boolean>(false);
  const [isFilterMeetingType, setfilterMeetingType] = useState<boolean>(false);
  const [isActionFilterOwner, setActionfilterOwner] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const [open, setOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<any>({});
  const [currentYear, setCurrentYear] = useState<any>();
  const [dataSourceFilter, setDataSourceFilter] = useState<any[]>([]);
  const [ownerSourceFilter, setOwnerSourceFilter] = useState<any[]>([]);
  const [scheduleData, setScheduleData] = useState<any[]>([]);
  const [openActionPointEditDrawer, setOpenActionPointEditDrawer] = useState({
    open: false,
    data: {},
    checkOwner: false,
  });
  const [filter, setFilter] = useState<string>("");

  const [value, setValue] = useState(matches ? 5 : 0);

  const [searchValue, setSearchValue] = useState<string>("");
  const [searchMeetingValue, setMeetingSearchValue] = useState<string>("");
  const [searchActionPointValue, setActionPointSearchValue] =
    useState<string>("");
  // const [myActionPoint, setMyactionPoint] = useState(false);
  const [addKeyAgenda, setAddKeyAgenda] = useState<boolean>(false);
  const [viewCalendar, setViewCalendar] = useState<boolean>(false);
  const [calendarData, setCalendarData] = useState<any[]>([]);
  const [loadMeeting, setLoadMeeting] = useState(false);
  const [loadActionPoint, setLoadActionPoint] = useState(false);
  const [calendarModalInfo, setCalendarModalInfo] = useState<any>({
    open: false,
    data: {},
    mode: "create",
    calendarFor: "MRM",
  });

  const [pageAction, setPageAction] = useState<any>(1);
  const [unitId, setUnitId] = useState<string>(userDetail?.locationId);
  const [pageLimitAction, setPageLimitAction] = useState<any>(10);
  const [countAction, setCountAction] = useState<number>(0);
  const [pagePlan, setPagePlan] = useState<any>(1);
  const [rowsPerPagePlan, setRowsPerPagePlan] = useState(10);
  const [countPlan, setCountPlan] = useState<number>(0);
  const [page, setPage] = useState<any>(1);

  const [pageLimit, setPageLimit] = useState<any>(10);
  const [countMeeting, setCountMeeting] = useState<number>(0);
  const [meetingsDataApi, setMeetingsDataApi] = useState<any[]>([]);
  const allDeptOption = { id: "All", entityName: "All" };
  // const [meetingObjectData, setMeetingObjectData] = useState<any[]>([]);
  const [checkAccess, setCheckAccess] = useState(false);

  const [deptOptions, setDeptOptions] = useState<any[]>([]);
  const [meetingDeptOptions, setMeetingDeptOptions] = useState<any[]>([]);
  const [actionPointDeptOptions, setActionPointDeptOptions] = useState<any[]>(
    []
  );

  const locationState = useLocation();
  const orgId = sessionStorage.getItem("orgId");
  const { enqueueSnackbar } = useSnackbar();
  const [mrmActionPointAdd, setMrmActionPointAdd] = useState(false);
  const [mrmActionPointEdit, setMrmActionPointEdit] = useState(false);
  const [submitButtonStatus, setSubmitButtonStatus] = useState(false);
  const [mrmActionId, setMrmActionId] = useState<any>();
  const [owner, setOwner] = useState(false);
  const [actionUnitId, setActionUnitId] = useState<string>(
    userDetail?.data?.locationId
  );
  const [meetingUnitId, setMeetingUnitId] = useState<string>(
    userDetail?.data?.locationId
  );
  const [actionEntityId, setActionEntityId] = useState<string>(
    userDetail?.data?.entityId
  );
  const [meetingEntityId, setMeetingEntityId] = useState<string>(
    userDetail?.data?.entityId
  );
  const { Title } = Typography;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [selectedOwner, setSelectedOwner] = useState<any>([]);
  const [selectedType, setSelectedType] = useState<any>([]);
  const [selectedActionMeetingType, setSelectedActionMeetingType] =
    useState<any>([]);
  const [filterList, setFilterList] = useState<any>([]);
  const [selectedMeetingOwner, setSelectedMeetingOwner] = useState<any>([]);
  const [selectedMeetingType, setSelectedMeetingType] = useState<any>([]);
  const [meetingFilterList, setMeetingFilterList] = useState<any>([]);
  const [selectedActionOwner, setSelectedActionOwner] = useState<any>([]);
  const [actionFilterList, setActionFilterList] = useState<any>([]);
  const [currentStateNew, setCurrentStateNew] = useState("All");
  const [collapseLevel, setCollapseLevel] = useState(0);

  const [logo, setLogo] = useState<any>(null);
  const getLogo = async () => {
    try {
      const response = await axios.get(`/api/location/getLogo`);
      setLogo(response.data);
    } catch (error) {}
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleYes = () => {
    setOpen(false);
    handleDrawer(undefined, "Direct");
    setStatusMode("Create");
  };
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [actionItems, setActionItems] = useState([]);
  const [deptId, setDeptId] = useState<string>(userDetail?.entity?.id);

  const showModal = (items: any) => {
    setActionItems(items);
    setIsModalVisible(true);
  };

  const handleActionItemModalOk = () => {
    setIsModalVisible(false);
  };
  const handleSettingsClick = () => {
    navigate("/mrm/MrmSettings");
  };

  const handleActionItemModalCancel = () => {
    setIsModalVisible(false);
  };
  // console.log("LOAD ACTION POINT", loadActionPoint);
  const handlerActionAddOpen = (data: any) => {
    // console.log("data in handle action point", data);
    setMrmActionId(data);
    setMrmActionPointAdd(true);
  };

  const handlerActionAddClose = () => {
    setMrmActionPointAdd(false);
    getDataTableMeetings();
    getActionPoints();
  };

  const [actionRowData, setActionRowData] = useState<any>();

  // const ROWS_PER_PAGE = 10;

  const handlerActionEditOpen = (data: any, Read: any) => {
    // console.log("data for action edit", data);
    getMeetingById(data?.additonalInfo?.meetingId?._id).then(
      (response: any) => {
        if (data?.additionalInfo?.meetingId?._id === response.data._id)
          setDataSourceFilter(response?.data);
        setActionRowData(data);
        setMrmActionPointEdit(true);

        if (Read === "ReadOnly") {
          setReadMode(true);
        } else {
          setReadMode(false);
        }
      }
    );
    // getAllActionPointData();
    getActionPoints();
  };
  const handleDepartment = (event: any, values: any) => {
    //console.log("selected department", values);
    if (values && values?.id) {
      setDeptId(values?.id);
    }
    // const url = `api/cara/getAllCara?orgid=${loggedInUser.organizationId}&currentYear=${currentYear}&locationId=${unitId}&page=${page}&limit=10`;
    // getData(url);
  };
  const getDeptSelectedItem = () => {
    const item = [allDeptOption, ...deptOptions].find((opt: any) => {
      if (opt.id === deptId) return opt;
    });
    return item || {};
  };
  const handleMeetingDepartment = (event: any, values: any) => {
    //console.log("selected department", values);
    if (values && values?.id) {
      setMeetingEntityId(values?.id);
    }
    // const url = `api/cara/getAllCara?orgid=${loggedInUser.organizationId}&currentYear=${currentYear}&locationId=${unitId}&page=${page}&limit=10`;
    // getData(url);
  };
  const getMeetingDeptSelectedItem = () => {
    const item = [allDeptOption, ...meetingDeptOptions].find((opt: any) => {
      if (opt.id === meetingEntityId) return opt;
    });
    return item || {};
  };
  const handleActionDepartment = (event: any, values: any) => {
    //console.log("selected department", values);
    if (values && values?.id) {
      setActionEntityId(values?.id);
    }
    // const url = `api/cara/getAllCara?orgid=${loggedInUser.organizationId}&currentYear=${currentYear}&locationId=${unitId}&page=${page}&limit=10`;
    // getData(url);
  };
  const getActionDeptSelectedItem = () => {
    const item = [allDeptOption, ...actionPointDeptOptions].find((opt: any) => {
      if (opt.id === actionEntityId) return opt;
    });
    return item || {};
  };
  const getActionItem = async (item: any) => {
    try {
      const response = await await axios.get(
        API_LINK + `/api/actionitems/getActionItemById/${item.id}`
      );
      if (response.data) {
        handlerActionEditOpen(response.data, "ReadOnly");
      }
    } catch (error) {
      // console.log("error");
    }
  };

  const handlerActionEditClose = () => {
    setMrmActionPointEdit(false);
    getActionPoints();
    getDataTableMeetings();
  };
  useEffect(() => {
    getLogo();
    getUnits();
    getDepartmentOptions();
    orgdata();
    getyear();
    getKeyAgendaValues(selectedUnit);
  }, []);
  useEffect(() => {
    if (userDetail?.entityId) {
      fetchInitialDepartment(userDetail?.entityId);
    }
  }, [userDetail?.entityId]);
  //console.log("value tab", value);
  useEffect(() => {
    if (currentYear) {
      getLocationOptions();
      getDepartmentOptions();
      getUserInfo();
      fetchFilterList();
      fetchMeetingFilterList();
      fetchActionFilterList();
      // getMRMValues(unitId, "", currentYear, pageMrm, pageLimitMrm);
      //getDataTableMeetings();
      //checkowner();
    }
  }, [currentYear]);
  useEffect(() => {
    if (!!currentYear && value === 2) {
      getActionPoints();
      fetchActionFilterList();
      // getDataTableMeetings();
    }
  }, [
    openAction,
    actionUnitId,
    actionEntityId,
    currentYear,
    isActionFilterOwner,
    loadActionPoint,
    isFilterActionMeetingtype,
    value,
  ]);

  useEffect(() => {
    if (!!currentYear && value === 2) getActionPoints();
  }, [pageAction, pageLimitAction]);
  useEffect(() => {
    getDepartmentOptions();
  }, [unitId]);

  useEffect(() => {
    getDepartmentOptionsForMeetings();
  }, [meetingUnitId]);
  useEffect(() => {
    getDepartmentOptionsForActionPoints();
  }, [actionUnitId]);

  useEffect(() => {
    //console.log("inside useeffect lostate");
    if (locationstate.pathname.includes("/mrm/scheduleview")) {
      const stateData = JSON.parse(
        sessionStorage.getItem("newTabState") || "{}"
      );
      // console.log("stateData", stateData);
      // setOpenScheduleDrawer(true);
      handleDrawer(stateData?.data, stateData?.mode);
    }
  }, [locationstate]);

  useEffect(() => {
    if (loadMeeting === true && !!currentYear && value == 1) {
      // getDataTableMeetingsAll();
      // getMRMValues(
      //   unitId,
      //   deptId,
      //   "mrm",
      //   currentYear,
      //   pageMrm,
      //   pageLimitMrm,
      //   selectedOwner,
      //   selectedType
      // );
      getDataTableMeetings();
    }
  }, [loadMeeting]);

  const handleSideNavClick = (key: any) => {
    if (key === "0") {
      setValue(0);
    } else if (key === "1") {
      setValue(1);
    } else if (key === "2") {
      setValue(2);
    } else if (key === "5") {
      setValue(5);
    } else if (key === "settings") {
      navigate("/mrm/MrmSettings");
    }
  };
  const fetchInitialDepartment = async (id: string) => {
    try {
      const res = await axios.get(`/api/entity/getSelectedEntity/${id}`);
      const entity = res.data;

      setSelectedDept({
        id: entity.id,
        name: entity.entityName,
        type: entity?.entityType?.name,
      });
      setSelectedMeetingDept({
        id: entity.id,
        name: entity.entityName,
        type: entity?.entityType?.name,
      });
      setSelectedActionDept({
        id: entity.id,
        name: entity.entityName,
        type: entity?.entityType?.name,
      });
    } catch (error) {
      console.error("Failed to fetch initial department:", error);
    }
  };
  const getDataTableMeetings = () => {
    // console.log("cuurent state new", currentStateNew);
    const payload: any = {
      unitId:
        meetingUnitId !== undefined ? meetingUnitId : userDetail?.location?.id,
      entityId:
        meetingEntityId !== undefined
          ? meetingEntityId
          : userDetail?.entity?.id,
      orgId: orgId,
      page: page,
      limit: pageLimit,
      currentYear: currentYear,
      selectedMeetingOwner: selectedMeetingOwner ? [selectedMeetingOwner] : [],
      selectedMeetingType: selectedMeetingType ? [selectedMeetingType] : [],
    };
    if (currentStateNew === "All") {
      // console.log("inside all");
      getAllMeeting(payload).then((response: any) => {
        setMeetingsDataApi(response?.data?.res);
        setCountMeeting(response?.data?.count);
        setLoadMeeting(false);
      });
    } else if (currentStateNew === "As Meeting Owner") {
      // console.log("inside my");
      // setOpenMeetingAttended(false);
      getMyMeeting(payload).then((response: any) => {
        setMeetingsDataApi(response?.data?.res);
        setCountMeeting(response?.data?.count);
        setLoadMeeting(false);
      });
    } else if (currentStateNew === "As Participant") {
      // console.log("inside part");
      try {
        // setOpenMeeting(false);
        getParticipantMeeting(payload).then((response: any) => {
          setMeetingsDataApi(response?.data?.res);
          setCountMeeting(response?.data?.count);
          setLoadMeeting(false);
        });
      } catch (error) {}
    } else if (currentStateNew === "As Agenda Owner") {
      // console.log("inside part");
      try {
        // setOpenMeeting(false);
        getAgendaOwnerMeeting(payload).then((response: any) => {
          setMeetingsDataApi(response?.data?.res);
          setCountMeeting(response?.data?.count);
          setLoadMeeting(false);
        });
      } catch (error) {}
    }
  };

  const handlePaginationAction = (page: any, pageSize: any) => {
    setPageAction(page);
    setPageLimitAction(pageSize);
    // getActionPoints();
  };

  const getDepartmentOptions = async () => {
    try {
      if (!!unitId) {
        // console.log("unitId", unitId);
        const result = await axios(
          `/api/cara/getEntitiesForLocation/${unitId}`
        );

        setDeptOptions(result?.data);
      }
    } catch (error) {
      setDeptOptions([]);
      enqueueSnackbar("Error fetching entities", { variant: "error" });
    }
  };
  const getDepartmentOptionsForMeetings = async () => {
    try {
      if (meetingUnitId) {
        // console.log("unitId", unitId);
        const result = await axios(
          `/api/cara/getEntitiesForLocation/${meetingUnitId}`
        );

        setMeetingDeptOptions(result?.data);
      }
    } catch (error) {
      enqueueSnackbar("Error fetching entities", { variant: "error" });
    }
  };
  const getDepartmentOptionsForActionPoints = async () => {
    try {
      if (actionUnitId) {
        // console.log("unitId", unitId);
        const result = await axios(
          `/api/cara/getEntitiesForLocation/${actionUnitId}`
        );

        setActionPointDeptOptions(result?.data);
      }
    } catch (error) {
      enqueueSnackbar("Error fetching entities", { variant: "error" });
    }
  };
  // useEffect(() => {
  //   if (loadActionPoint === true) {
  //     getActionPoints();

  //   }
  // }, [loadActionPoint]);

  // const getAllActionPointData = () => {
  //   const payload = {
  //     orgId: orgId,
  //     page: pageAction,
  //     limit: pageLimitAction,
  //     unitId: actionUnitId,
  //     currentYear: currentYear,
  //   };
  //   getAllActionPointsData(payload)
  //     .then((response: any) => {
  //       if (response.status == 200) {
  //         setActionPointDataSource(response?.data?.result);
  //         setCountAction(response?.data?.count);
  //         // setLoadActionPoint(false);
  //       } else {
  //         enqueueSnackbar("error fetching Action Points");
  //       }
  //     })
  //     .catch((error: any) => {
  //       enqueueSnackbar("error fetching Action Points");
  //     });
  // };
  const getActionPoints = () => {
    const payload = {
      orgId: orgId,
      page: pageAction,
      limit: pageLimitAction,
      unitId: actionUnitId,
      entityId: actionEntityId,
      currentYear: currentYear,
      selectedOwner: selectedActionOwner,
      selectedActionMeetingType: selectedActionMeetingType,
    };
    if (!openAction) {
      getAllActionPointsData(payload)
        .then((response: any) => {
          if (response.status == 200) {
            setActionPointDataSource(response?.data.result);
            setCountAction(response?.data?.count);
            // getDataTableMeetings();
            // setLoadActionPoint(false);
          } else {
            enqueueSnackbar("error fetching Action Points");
          }
        })
        .catch((error: any) => {
          enqueueSnackbar("error fetching Action Points");
        });
    } else {
      getMyActionPoints(payload)
        .then((response: any) => {
          if (response.status == 200) {
            setActionPointDataSource(response?.data?.result);
            setCountAction(response?.data?.count);
            // setLoadActionPoint(false);
          } else {
            enqueueSnackbar("error fetching Action Points");
          }
        })
        .catch((error: any) => {
          enqueueSnackbar("error fetching Action Points");
        });
    }
  };

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [valueById, setValueById] = useState<any>();

  const handleDrawerOpen = (data: any, index: any, Read: any) => {
    // console.log("data in index", data);
    setValueById(data?.value?._id);
    setDrawerOpen(true);
    setAnchorEl(null);
    const filterById = data?.value?._id;
    const filteredObject = calendarData?.find(
      (item) => item?.id === filterById
    );
    setDataSourceFilter(filteredObject);
    setOwnerSourceFilter(data);
    if (Read === "ReadOnly") {
      setReadMode(true);
    } else {
      setReadMode(false);
    }
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    getMRMValues(
      unitId,
      deptId,
      "",
      currentYear,
      pageMrm,
      pageLimitMrm,
      selectedOwner,
      selectedType
    );
  };

  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editDataMeeting, setEditDataMeeting] = useState<any[]>([]);
  const [readMode, setReadMode] = useState(false);

  const handleEditDrawerOpen = (data: any, Read: any) => {
    setEditDataMeeting(data);

    getMeetingById(data?._id).then((response: any) => {
      setDataSourceFilter(response?.data);

      if (response?.data) {
        if (Read === "ReadOnly") {
          setReadMode(true);
        } else {
          setReadMode(false);
        }
        setEditDrawerOpen(true);
        setAnchorEl(null);
      }
    });
  };

  const handleEditDrawerClose = () => {
    setEditDrawerOpen(false);
  };

  useEffect(() => {
    if (locationState?.state && locationState?.state?.action === "Create") {
      handleDrawerOpen(
        locationState?.state?.data,
        locationState?.state?.index,
        "Edit"
      );
      setDataSourceFilter(locationState?.state?.data);
      setValueById(locationState?.state?.id);
      setValue(locationState?.state?.valueId);
    }
    if (locationState?.state && locationState?.state?.action === "Edit") {
      handleEditDrawerOpen(locationState?.state?.data, "Edit");
      setDataSourceFilter(locationState?.state?.data);
      setValueById(locationState?.state?.id);
      setValue(locationState?.state?.valueId);
    }
  }, [locationState]);

  const checkowner = async (id: any) => {
    const checkstatus = await axios.get(
      `/api/mrm/getAllAgendOwnersByMeetingType/${id}`
    );
    // console.log("checkstatusdata", checkstatus.data.access);

    setCheckAccess(checkstatus.data.access);
  };

  const getUserInfo = async () => {
    const userInfo = await axios.get("/api/user/getUserInfo");
    if (userInfo.status === 200 || userInfo.status === 201) {
      if (
        userInfo?.data &&
        userInfo?.data?.locationId &&
        userInfo.data.locationId
      ) {
        // if (!unitId && !actionUnitId) {
        setUnitId(userInfo.data.locationId);
        setDeptId(userInfo.data.entityId);
        getMRMValues(
          userInfo.data.locationId,
          userInfo.data.entityId,
          "",
          currentYear,
          pageMrm,
          pageLimitMrm,
          selectedOwner,
          selectedType
        );
        setActionUnitId(userInfo?.data?.locationId);
        setMeetingUnitId(userInfo?.data?.locationId);
        setMeetingEntityId(userInfo?.data?.entityId);
        setActionEntityId(userInfo?.data?.entityId);
        setSelectedUnit(userInfo.data.locationId);
        getDataTableMeetings();
        // getActionPoints()
        // }
      } else {
        getMRMValues(
          "All",
          "All",
          "",
          currentYear,
          pageMrm,
          pageLimitMrm,
          selectedOwner,
          selectedType
        );
        setUnitId("All");
        setActionUnitId("All");
        setMeetingUnitId("All");
        getDataTableMeetings();
      }
    }
  };

  const showTotalPlan: PaginationProps["showTotal"] = (total) =>
    `Total ${total} items`;

  const handlePaginationPlan = (page: any, pageSize: any = rowsPerPagePlan) => {
    setPagePlan(page);
    setRowsPerPagePlan(pageSize);
    // getAllAuditPlanDetails(currentYear);
  };

  const handleDrawer = (data: any, values: any) => {
    // console.log("inside handle drawer", values);
    setMrmEditOptions(values);
    setScheduleData(data);

    setOpenScheduleDrawer(!openScheduleDrawer);

    if (openScheduleDrawer || expandDataValues?._id) {
      getMRMValues(
        unitId,
        deptId,
        "",
        currentYear,
        pageMrm,
        pageLimitMrm,
        selectedOwner,
        selectedType
      );
    }
    try {
      if (data) {
        // console.log("data", data);
        const newData = {
          unit: data?.value?.unitId,
          decisionPoints: data?.value?.decision,
          system: data?.value?.systemId,
          meetingTitle: data?.value?.meetingName,
          meetingType: data?.value?.meetingType,
          // date: data?.value?.meetingdate,
          period: data?.value?.period,
          organizer: data?.userName,
          meetingDescription: data?.value?.description,
          agendaformeetingType: data?.value?.keyAgendaId,
          dataValue: data?.value?.keyAgendaId,
          // attendees: data?.value?.attendees,
          meetingMOM: data?.value?.notes,
          date: data?.value?.date,
          owners: data?.value?.owner,
          agendaowner: data?.value?.agendaowner,
          startDate: data.value?.date?.startDate,
          endDate: data.value?.date?.endDate,
          _id: data?.value?._id,
          files: data?.value?.files,
          attendees: data?.value?.attendees,
          externalattendees: data?.value?.externalattendees,
          venue: data?.value?.venue,
        };
        setExpandDataValues(newData);
      }
    } catch (error) {
      // console.log("error", error);
    }
  };
  const handleCloseActionPoint = () => {
    setOpenActionPointEditDrawer({
      open: false,
      data: {},
      checkOwner: false,
    });
    setOpenActionPointDrawer({
      open: false,
      data: {},
    });
    // getMRMValues(
    //   unitId,
    //   deptId,
    //   "",
    //   currentYear,
    //   pageMrm,
    //   pageLimitMrm,
    //   selectedOwner,
    //   selectedType
    // );
  };
  const [pageMrm, setPageMrm] = useState<any>(1);
  const [pageLimitMrm, setPageLimitMrm] = useState<any>(10);
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    if (!!currentYear && value === 0) {
      fetchFilterList();
      getMRMValues(
        unitId,
        deptId,
        "mrm",
        currentYear,
        pageMrm,
        pageLimitMrm,
        selectedOwner,
        selectedType
      );
    }
  }, [
    unitId,
    pageMrm,
    pageLimitMrm,
    isFilterOwner,
    deptId,
    openScheduleDrawer,
    isFiltertype,
    value,
  ]);

  const handlePagination = (page: any, pageSize: any) => {
    setPageMrm(page);
    setPageLimitMrm(pageSize);
    // getMRMValues(unitId, "mrm", currentYear, pageMrm, pageLimitMrm);
  };
  // console.log("value of tab", value);
  const showTotal: PaginationProps["showTotal"] = (total) =>
    `Total ${total} items`;

  const showTotalAction: PaginationProps["showTotal"] = (total) =>
    `Total ${total} items`;

  const showTotalMeeting: PaginationProps["showTotal"] = (total) =>
    `Total ${total} items`;

  const getLocationOptions = async () => {
    await axios(`/api/mrm/getLocationsForOrg/${realmName}`)
      .then((res) => {
        setLocationOptions(res.data);
      })
      .catch((err) => console.error(err));
  };

  const handleOpenModal = () => {
    setOpenModal({
      open: true,
      data: {},
    });
  };

  const handleCloseModal = () => {
    setOpenModal({
      open: false,
      data: {},
    });
  };

  const handleMeetingMail = async (id: any) => {
    try {
      const mail = await axios.post(`/api/mrm/sendInvite/${id}`);
      if (mail.status == 201) {
        enqueueSnackbar("Email sent successfuly", { variant: "success" });
      }
    } catch (error) {
      enqueueSnackbar("Error sending email", { variant: "error" });
    }
  };

  const getMRMValues = async (
    unitId: any,
    entityId: any,
    tabValue: string,
    currentYear: any,
    pageMrm: any,
    pageLimitMrm: any,
    selectedOwner: any,
    selectedType: any
  ) => {
    try {
      const newPayload = {
        orgId: orgId,
        locationId: unitId,
        entityId: entityId,
        currentYear: currentYear,
        page: pageMrm,
        limit: pageLimitMrm,
        selectedOwner: selectedOwner,
        selectedType: selectedType,
      };
      const res = await axios.get("/api/mrm/getScheduleDetails", {
        params: newPayload,
      });
      // console.log("res>>>>>>>>>>>>>>>>", res);
      setCount(res?.data?.count);
      if (res.status === 200 || res.status === 201) {
        const data = res.data.newValues;
        for (let i = 0; i < data?.length; i++) {
          const value = data[i];
          value.key = i;
        }

        const actionPointData = [],
          newData = [];
        for (let i = 0; i < data?.length; i++) {
          const value = data[i];

          const actionPoints = value?.value.meetingData;

          newData.push({
            id: value?.value?._id,
            title: value?.value?.meetingName ?? "-",
            start: value?.value?.meetingdate ? value?.value?.meetingdate : "-",
            end: value?.value?.meetingdate ? value?.value?.meetingdate : "-",
            allDay: false,
            className: "audit-entry",
            textColor: "#000000",
            allData: value, // url: `/audit/auditreport/newaudit/${item._id}`,
          });

          for (let j = 0; j < actionPoints?.length; j++) {
            const newValue = actionPoints[j];
            actionPointData.push({
              meetingName: newValue.actionPoint,
              status: newValue.status,

              meetingDate: newValue.meetingDate,
            });
          }
        }
        setCalendarData([...newData]);

        if (tabValue?.length && tabValue === "mrm") {
          setDataSource(data);
        } else if (tabValue === "action") {
          // setActionPointDataSource(actionPointData);
        } else {
          setDataSource(data);
          // setActionPointDataSource(actionPointData);
        }
        // enqueueSnackbar(`Data Fetched Successfully!`, {
        //   variant: "success",
        // });
      }
    } catch (error) {
      // enqueueSnackbar(`!`, {
      //   variant: "error",
      // });
    }
  };

  const handleLocation = (event: any, values: any) => {
    if (values && values?.id) {
      setUnitId(values?.id);
      // getMRMValues(
      //   values?.id,
      //   "mrm",
      //   currentYear,
      //   pageMrm,
      //   pageLimitMrm,
      //   selectedOwner
      // );
      // getDataTableMeetings();
    }
  };

  const handleActionLocation = (event: any, values: any) => {
    if (values && values?.id) {
      setActionUnitId(values?.id);
      setSelectedActionDept(null);
      //getMRMValues(values?.id, "mrm", currentYear, pageMrm, pageLimitMrm);
      // getDataTableMeetings();
      getActionPoints();
    }
  };

  const handleMeetingLocation = (event: any, values: any) => {
    if (values && values?.id) {
      setMeetingUnitId(values?.id);
      setSelectedMeetingDept(null);
      // getMRMValues(values?.id, "mrm", currentYear, pageMrm, pageLimitMrm);
      // getDataTableMeetings();
    }
    if (values?.id === "All") {
      setMeetingEntityId(values?.id);
      setSelectedMeetingDept({ ...{ id: "All", name: "All" }, type: "All" });
    }
  };
  const fetchFilterList = async () => {
    try {
      // console.log("fetchfilterlist called");
      const response = await axios.get(
        `api/mrm/getColumnFilterlistForSchedule?unitId=${unitId}&entityId=${deptId}`
      );

      setFilterList(response?.data);
    } catch (error) {
      // console.log("error", error);
    }
  };

  const fetchMeetingFilterList = async () => {
    try {
      // console.log("fetchfilterlist called");

      const response = await axios.get(
        `api/mrm/getColumnFilterlistForMeeting?unitId=${
          meetingUnitId !== undefined ? meetingUnitId : userDetail.locationId
        }&entityId=${
          meetingEntityId !== undefined ? meetingEntityId : userDetail.entityId
        }`
      );

      setMeetingFilterList(response?.data);
    } catch (error) {
      // console.log("error", error);
    }
  };
  const fetchActionFilterList = async () => {
    try {
      // console.log("fetchfilterlist called");
      const response = await axios.get(
        `api/actionitems/getFilterListForMRM?unitId=${actionUnitId}&entityId=${actionEntityId}`
      );

      setActionFilterList(response?.data);
    } catch (error) {
      // console.log("error", error);
    }
  };

  // const handleEditActionPoint = (values: any) => {
  //   let allOwners: any = [],
  //     checkOwner = false;
  //   if (values?.owner && values.owner?.length) {
  //     for (let k = 0; k < values.owner?.length; k++) {
  //       let ownerValues = values.owner[k];
  //       allOwners.push(ownerValues?.id);
  //     }
  //   }

  //   if (allOwners.includes(userDetail?.id)) {
  //     checkOwner = true;
  //   }
  //   setOpenActionPointEditDrawer({
  //     open: true,
  //     data: values,
  //     checkOwner: checkOwner,
  //   });
  // };

  // const handlerActionPointDelete = (data: any) => {
  //   const dataActionRemove = actionPointDataSource.filter(
  //     (item: any) => item._id !== data._id
  //   );
  //   setActionPointDataSource(dataActionRemove);
  //   deleteActionPoint(data._id).then((response: any) => {
  //     if (response.status === 200) {
  //       enqueueSnackbar(`Deleted Schedule Successfully!`, {
  //         variant: "success",
  //       });
  //     }
  //   });
  // };

  const subColumns: ColumnsType<IKeyAgenda> = [
    {
      title: "Minutes Of Meeting",
      dataIndex: "MeetingTitle",
      width: 300,
      render: (_: any, data: any) => (
        <>
          <div
            style={{ textDecoration: "underline" }}
            onClick={() => {
              handleEditDrawerOpen(data, "ReadOnly");
            }}
          >
            {data?.meetingName}
            {data?.status === "Save As Draft" && (
              <Tooltip title="In Draft">
                <MdDescription
                  style={{
                    verticalAlign: "middle",
                    marginLeft: 5,
                    color: "#3576BA",
                    fontSize: "18px",
                  }}
                />
              </Tooltip>
            )}
          </div>
        </>
      ),
    },
    {
      title: "Meeting Date & Time",
      dataIndex: "MeetingDate",
      width: 150,
      render: (_: any, data: any) => {
        const dateTime = new Date(data?.meetingdate);
        const [datePart, timePart] = data?.meetingdate?.split("T");
        const date = datePart?.split("-").reverse().join("-");
        const time = timePart?.slice(0, 5);
        return (
          <div style={{ display: "flex", gap: "10px" }}>
            <span>{date}</span>
            <span>{time}</span>
          </div>
        );
      },
    },
    {
      title: "Agenda",
      dataIndex: "Agenda",
      width: 150,
      render: (_: any, data: any) => {
        const items: MenuProps["items"] = [];

        const uniqueAgendas = Array.from(
          new Set(data?.agenda?.map((item: any) => item?.agenda))
        ).map((agenda: any) => {
          return data?.agenda?.find((item: any) => item?.agenda === agenda);
        });

        uniqueAgendas.forEach((item: any) => {
          items.push({
            key: item?.id,
            label: item?.agenda,
          });
        });

        return (
          <Dropdown menu={{ items }} overlayClassName={classes.DropDwonScroll}>
            <a onClick={(e) => e.preventDefault()}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  width: "250px",
                  paddingLeft: "5px",
                  paddingRight: "5px",
                  justifyContent: "space-between",
                  height: "30px",
                  backgroundColor: "#F4F6F9",
                  borderRadius: "5px",
                  color: "black",
                }}
              >
                <span
                  style={{
                    width: "180px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {data?.agenda && data?.agenda[0]?.agenda}
                </span>{" "}
                <MdExpandMore style={{ color: "#B2BABB" }} />
              </div>
            </a>
          </Dropdown>
        );
      },
    },

    {
      title: "Action Points",
      dataIndex: "actionItems",
      width: 150,
      render: (_: any, data: any, index: number) => {
        // console.log("Data:", data); // Log the value of data
        return (
          <>
            {/* <span style={{ textAlign: "center" }}> */}
            <Tooltip title="Click to view" arrow placement="rightBottom">
              <div
                onClick={() => showModal(data?.actionItems || [])}
                style={{
                  color: "black",
                  textDecoration: "underline",
                  cursor: "pointer",
                  display: "inline-block",
                }}
              >
                {data?.actionItems?.length > 0 ? data.totalActionItemsCount : 0}
              </div>
            </Tooltip>
            {/* </span> */}
          </>
        );
      },
    },
    {
      title: "Actions",
      dataIndex: "actions",
      width: 100,
      render: (_: any, data: any, index) => {
        // console.log("data in subtable", data);
        return (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "left",
                alignItems: "center", // Change "left" to "center" for vertical alignment
              }}
            >
              {data.status !== "Submit" &&
                (data?.createdBy === userDetail?.id ||
                  isOrgAdmin ||
                  (isMR &&
                    (userDetail.additionalUnits?.length > 0
                      ? userDetail.additionalUnits?.includes(unitId)
                      : unitId === userDetail?.location?.id))) && (
                  <IconButton
                    onClick={() => {
                      handleEditDrawerOpen(data, "Edit");
                    }}
                  >
                    <Tooltip title="Edit MoM" placement="bottom">
                      <div>
                        <CustomEditIcon
                          style={{
                            // marginRight: "2px",
                            fontSize: "15px",
                            height: "20px",
                          }}
                        />
                      </div>
                    </Tooltip>
                  </IconButton>
                )}
              {isOrgAdmin && (
                <Popconfirm
                  placement="top"
                  title={"Are you sure to delete Meeting"}
                  onConfirm={() => {
                    //actionForSchedule(data?.meetingSchedule?._id);

                    handlerMeetingDelete(data?._id);
                  }}
                  okText="Yes"
                  cancelText="No"
                >
                  <Tooltip title="Delete Meeting" placement="bottom">
                    <div ref={refForMeeting6}>
                      <CustomDeleteICon
                        style={{
                          fontSize: "15px",
                          marginRight: "2px",
                          height: "20px",
                        }}
                      />
                    </div>
                  </Tooltip>
                </Popconfirm>
              )}
            </div>
          </>
        );
      },
    },
  ];
  const expandIcon = ({ expanded, onExpand, record }: any) => {
    const icon = expanded ? <AiOutlineMinusCircle /> : <AiOutlinePlusCircle />;
    const match = record.actionItem;
    // console.log("actionitemrecord", record);
    if (match?.length > 0) {
      return <a onClick={(e) => onExpand(record, e)}>{icon}</a>;
    }
    return null;
  };
  const subRowActionColumns: ColumnsType<any> = [
    {
      title: "Agenda",
      render: (_: any, record: any) => {
        return (
          <div
            style={{
              width: "200px",
              whiteSpace: "normal",
              wordWrap: "break-word",
            }}
          >
            <span>{record?.agenda}</span>
          </div>
        );
      },
    },
    {
      title: "Decision",
      render: (_: any, record: any) => {
        return (
          <span
            style={{
              display: "block",
              width: "200px",
              whiteSpace: "normal",
              wordWrap: "break-word",
            }}
          >
            {record?.decision}
          </span>
        );
      },
    },
    {
      title: "Decision Status",
      render: (_: any, record: any) => {
        return (
          <div style={{ flex: 1, paddingRight: "15px" }}>
            <Tag
              style={{
                backgroundColor:
                  record?.status === "Open"
                    ? "#D4E6F1"
                    : record?.status === "In Progress"
                    ? "#99e699"
                    : "#FADBD8",
                color: "black",
              }}
            >
              {record?.status}
            </Tag>
          </div>
        );
      },
    },

    // Row for Action Items
    {
      title: "Action Items",
      dataIndex: "title",
      key: "title",
      render: (_: any, record: any) => (
        <div>
          {/* Table for Action Items */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "1px solid #ddd",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "2px solid #ddd",
                  background: "#F5F5F5",
                }}
              >
                <th style={{ borderRight: "1px solid #ddd", padding: "5px" }}>
                  Action Item
                </th>
                <th style={{ borderRight: "1px solid #ddd", padding: "5px" }}>
                  Responsible Person
                </th>
                <th style={{ borderRight: "1px solid #ddd", padding: "5px" }}>
                  Target Date
                </th>
                <th style={{ borderRight: "1px solid #ddd", padding: "5px" }}>
                  Status
                </th>
                <th style={{ padding: "5px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {record?.actionItems?.map((actionItem: any) => (
                <tr key={actionItem._id}>
                  {/* Action Item Title */}
                  <td
                    style={{ borderRight: "1px solid #ddd", padding: "10px" }}
                  >
                    <Tooltip title={actionItem?.title}>
                      <div
                        style={{
                          textDecorationLine: "underline",
                          cursor: "pointer",
                          whiteSpace: "normal", // Allow wrapping
                          wordWrap: "break-word", // Ensure long words wrap
                        }}
                        onClick={() => {
                          handlerActionEditOpen(actionItem, "ReadOnly");
                        }}
                      >
                        {actionItem?.title}
                      </div>
                    </Tooltip>
                  </td>

                  {/* Owner */}
                  <td
                    style={{ borderRight: "1px solid #ddd", padding: "10px" }}
                  >
                    {actionItem?.owner?.map((owner: any) => (
                      <div key={`${actionItem._id}-${owner.id}`}>
                        {owner?.username}
                      </div>
                    ))}
                  </td>
                  <td
                    style={{ borderRight: "1px solid #ddd", padding: "10px" }}
                  >
                    {actionItem.targetDate}
                  </td>
                  {/* Status */}
                  <td
                    style={{ borderRight: "1px solid #ddd", padding: "10px" }}
                  >
                    <Tag
                      style={{
                        backgroundColor: actionItem?.status
                          ? "#D4E6F1"
                          : "#FADBD8",
                        color: "black",
                      }}
                    >
                      {actionItem?.status ? "Open" : "Closed"}
                    </Tag>
                  </td>

                  {/* Actions (Edit/Delete) */}
                  <td style={{ padding: "10px" }}>
                    {/* Edit Action */}
                    {(isOrgAdmin ||
                      actionItem?.owner?.some(
                        (owner: any) => owner?.id === userDetail?.id
                      ) ||
                      actionItem?.assignedBy === userDetail.id ||
                      (isMR &&
                        (userDetail.additionalUnits?.length > 0
                          ? userDetail.additionalUnits.includes(actionUnitId)
                          : actionUnitId === userDetail.location?.id))) &&
                      actionItem.status && (
                        <IconButton
                          style={{ padding: "0px", marginRight: "5px" }}
                          onClick={() => {
                            handlerActionEditOpen(actionItem, "Edit");
                          }}
                        >
                          <div ref={refForActionPoint6}>
                            <CustomEditIcon
                              style={{
                                marginRight: "2px",
                                fontSize: "15px",
                                height: "20px",
                              }}
                            />
                          </div>
                        </IconButton>
                      )}

                    {/* Delete Action */}
                    {isOrgAdmin && (
                      <IconButton>
                        <Popconfirm
                          placement="top"
                          title={"Are you sure to delete Action Points?"}
                          onConfirm={() => {
                            handleDeleteActionPoint(actionItem);
                          }}
                          okText="Yes"
                          cancelText="No"
                        >
                          <div ref={refForActionPoint7}>
                            <CustomDeleteICon
                              style={{
                                fontSize: "15px",
                                marginRight: "2px",
                                height: "20px",
                              }}
                            />
                          </div>
                        </Popconfirm>
                      </IconButton>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    },
  ];

  // const subRowActionColumns: ColumnsType<any> = [
  //   {
  //     title: "Action Item",
  //     dataIndex: "title",
  //     key: "title",
  //     render: (_: any, record: any) => (
  //       // record.action ? (

  //       <Tooltip title={record?.title}>
  //         <div
  //           style={{
  //             textDecorationLine: "underline",
  //             cursor: "pointer",
  //             width: 130,
  //           }}
  //         >
  //           <div
  //             // className={classes.clickableField}
  //             style={{
  //               whiteSpace: "nowrap",
  //               overflow: "hidden",
  //               textOverflow: "ellipsis",
  //             }}
  //             onClick={() => {
  //               handlerActionEditOpen(record, "ReadOnly");
  //             }}
  //           >
  //             {record?.title}
  //           </div>
  //         </div>
  //       </Tooltip>
  //     ),
  //   },
  //   {
  //     title: "Target Date",
  //     dataIndex: "targetDate",
  //     key: "targetDate",
  //     render: (_: any, record: any) => record.targetDate || "",
  //   },
  //   {
  //     title: "Responsible Person",
  //     dataIndex: "owner",
  //     render: (_: any, record: any) => (
  //       <div
  //         style={{
  //           width: 100,
  //         }}
  //       >
  //         <div
  //           style={{
  //             whiteSpace: "nowrap",
  //             overflow: "hidden",
  //             textOverflow: "ellipsis",
  //           }}
  //         >
  //           {record?.owner?.map((owner: any, index: number) => (
  //             <div key={index}>{owner?.username}</div>
  //           ))}
  //         </div>
  //       </div>
  //     ),
  //   },
  //   {
  //     title: "Status",
  //     dataIndex: "status",
  //     key: "status",
  //     render: (_: any, record: any) => {
  //       if (record?.status === true) {
  //         return (
  //           <Tag
  //             style={{ backgroundColor: "#D4E6F1", color: "black" }}
  //             key={record.status}
  //             // className={classes.statusTag}
  //           >
  //             Open
  //           </Tag>
  //         );
  //       } else {
  //         return (
  //           <Tag
  //             style={{ backgroundColor: "#FADBD8", color: "black" }}
  //             key={record.status}
  //             // className={classes.statusTag}
  //           >
  //             Close
  //           </Tag>
  //         );
  //       }
  //     },
  //   },
  //   {
  //     title: "Actions",
  //     dataIndex: "actions",
  //     width: 80,
  //     render: (_: any, data: any, index: number) => {
  //       if (index === 0) {
  //         return (
  //           <>
  //             <div style={{ display: "flex", alignItems: "left" }}>
  //               {(isOrgAdmin ||
  //                 data?.owner?.some(
  //                   (owner: any) => owner?.id === userDetail?.id
  //                 ) ||
  //                 data?.assignedBy === userDetail.id ||
  //                 (isMR &&
  //                   (userDetail.additionalUnits?.length > 0
  //                     ? userDetail.additionalUnits.includes(actionUnitId)
  //                     : actionUnitId === userDetail.location?.id))) && (
  //                 <IconButton
  //                   style={{ padding: "0px" }}
  //                   onClick={() => {
  //                     // console.log("data for action edit", data);
  //                     handlerActionEditOpen(data, "Edit");
  //                   }}
  //                 >
  //                   <div ref={refForActionPoint6}>
  //                     <CustomEditIcon
  //                       style={{
  //                         marginRight: "2px",
  //                         fontSize: "15px",
  //                         height: "20px",
  //                       }}
  //                     />
  //                   </div>
  //                 </IconButton>
  //               )}

  //               {isOrgAdmin && (
  //                 <IconButton>
  //                   <Popconfirm
  //                     placement="top"
  //                     title={"Are you sure to delete Action Points"}
  //                     onConfirm={() => {
  //                       handleDeleteActionPoint(data);
  //                     }}
  //                     okText="Yes"
  //                     cancelText="No"
  //                     // disabled={showData ? false : true}
  //                   >
  //                     <div ref={refForActionPoint7}>
  //                       <CustomDeleteICon
  //                         style={{
  //                           fontSize: "15px",
  //                           marginRight: "2px",
  //                           height: "20px",
  //                         }}
  //                       />
  //                     </div>
  //                   </Popconfirm>
  //                 </IconButton>
  //               )}
  //             </div>
  //           </>
  //         );
  //       }
  //       return (
  //         <>
  //           <div style={{ display: "flex", alignItems: "left" }}>
  //             {(isOrgAdmin ||
  //               (data?.owner &&
  //                 Array.isArray(data.owner) &&
  //                 data.owner.some(
  //                   (owner: any) => owner?.id === userDetail?.id
  //                 )) ||
  //               data?.assignedBy === userDetail.id ||
  //               (isMR &&
  //                 (userDetail.additionalUnits?.length > 0
  //                   ? userDetail.additionalUnits.includes(actionUnitId)
  //                   : actionUnitId === userDetail.location?.id))) && (
  //               <IconButton
  //                 style={{ padding: "0px" }}
  //                 onClick={() => {
  //                   // console.log("data for action edit", data);
  //                   handlerActionEditOpen(data, "Edit");
  //                 }}
  //               >
  //                 <div>
  //                   <CustomEditIcon
  //                     style={{
  //                       marginRight: "2px",
  //                       fontSize: "15px",
  //                       height: "20px",
  //                     }}
  //                   />
  //                 </div>
  //               </IconButton>
  //             )}

  //             {isOrgAdmin && (
  //               <IconButton>
  //                 <Popconfirm
  //                   placement="top"
  //                   title={"Are you sure to delete Action Points"}
  //                   onConfirm={() => {
  //                     handleDeleteActionPoint(data);
  //                   }}
  //                   okText="Yes"
  //                   cancelText="No"
  //                   // disabled={showData ? false : true}
  //                 >
  //                   <div>
  //                     <CustomDeleteICon
  //                       style={{
  //                         fontSize: "15px",
  //                         marginRight: "2px",
  //                         height: "20px",
  //                       }}
  //                     />
  //                   </div>
  //                 </Popconfirm>
  //               </IconButton>
  //             )}
  //           </div>
  //         </>
  //       );
  //     },
  //   },
  // ];

  const columns: ColumnsType<IKeyAgenda> = [
    {
      title: "MRM Title",
      dataIndex: "value",
      width: 300,
      render: (_: any, data: any, index: number) => {
        if (index === 0) {
          return (
            <>
              <div
                onClick={() => {
                  setMode("Edit");
                  handleDrawer(data, "ReadOnly");
                  setStatusMode("edit");
                }}
                style={{ textDecoration: "underline", display: "flex" }}
              >
                <div ref={refForMRMSchedule4}>{data?.value?.meetingName}</div>

                <div ref={refForMRMSchedule5}>
                  {data?.value?.status === "Save As Draft" && (
                    <Tooltip title="In Draft">
                      <MdDescription
                        style={{
                          verticalAlign: "middle",
                          marginLeft: 5,
                          color: "#3576BA",
                          fontSize: "18px",
                        }}
                      />
                    </Tooltip>
                  )}
                </div>
              </div>
            </>
          );
        }
        return (
          <>
            <div
              onClick={() => {
                setMode("Edit");
                handleDrawer(data, "ReadOnly");
                setStatusMode("edit");
              }}
              style={{ textDecoration: "underline", display: "flex" }}
            >
              <div>{data?.value?.meetingName}</div>

              <div>
                {data?.value?.status === "Save As Draft" && (
                  <Tooltip title="In Draft">
                    <MdDescription
                      style={{
                        verticalAlign: "middle",
                        marginLeft: 5,
                        color: "#3576BA",
                        fontSize: "18px",
                      }}
                    />
                  </Tooltip>
                )}
              </div>
            </div>
          </>
        );
      },
    },

    {
      title: "Scheduled Dates and Time",
      dataIndex: "value",
      width: 150,
      render: (_: any, data: any, index: number) => {
        const dates = data?.value?.date;

        const formattedDates = dates?.map((dateObj: any) => {
          const { date, from, to } = dateObj;
          const formattedDate = date ? moment(date).format("DD/MM/YYYY") : "";
          const formattedFrom = from ? from : "";
          const formattedTo = to ? to : "";
          return `${formattedDate} ${formattedFrom}-${formattedTo}`;
        });

        return (
          <div>
            {formattedDates.map((formattedDate: any, index: any) => (
              <div key={index}>{formattedDate}</div>
            ))}
          </div>
        );
      },
    },
    {
      title: "Meeting Type",
      dataIndex: "meetingType",
      width: 150,
      render: (_: any, record: any) => (
        <div
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {record?.meetingType?.name}
        </div>
      ),
      filterIcon: (filtered: any) =>
        selectedType?.length > 0 ? (
          <AiFillFilter style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <AiOutlineFilter style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }: any) => {
        return (
          //style={{ padding: 8, overflowY: "auto", height: "150px"
          <div style={{ padding: 8, overflowY: "auto", height: "300px" }}>
            {filterList?.meetingTypes?.map((item: any) => (
              <div key={item.id}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setSelectedType([...selectedType, value]);
                      } else {
                        setSelectedType(
                          selectedType.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={item.id}
                    checked={selectedType.includes(item.id)} // Check if the checkbox should be checked
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "5px",
                    }}
                  />
                  {item.name}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                type="primary"
                disabled={selectedType.length === 0}
                onClick={() => {
                  setfilterType(!isFiltertype);
                  // handlePagination(1, 10);
                }}
                style={{
                  marginRight: 8,
                  backgroundColor: "#E8F3F9",
                  color: "black",
                }}
              >
                Apply
              </Button>
              <Button
                onClick={() => {
                  setSelectedType([]);
                  setfilterType(!isFiltertype);
                  confirm();
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        );
      },
    },
    {
      title: "Owner",
      dataIndex: "userName",
      width: 150,
      filterIcon: (filtered: any) =>
        selectedOwner?.length > 0 ? (
          <AiFillFilter style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <AiOutlineFilter style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }: any) => {
        return (
          //style={{ padding: 8, overflowY: "auto", height: "150px"
          <div style={{ padding: 8, overflowY: "auto", height: "300px" }}>
            {filterList?.usernames?.map((item: any) => (
              <div key={item.id}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setSelectedOwner([...selectedOwner, value]);
                      } else {
                        setSelectedOwner(
                          selectedOwner.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={item.id}
                    checked={selectedOwner.includes(item.id)} // Check if the checkbox should be checked
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "5px",
                    }}
                  />
                  {item.username}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                type="primary"
                disabled={selectedOwner.length === 0}
                onClick={() => {
                  setfilterOwner(!isFilterOwner);
                  // handlePagination(1, 10);
                }}
                style={{
                  marginRight: 8,
                  backgroundColor: "#E8F3F9",
                  color: "black",
                }}
              >
                Apply
              </Button>
              <Button
                onClick={() => {
                  setSelectedOwner([]);
                  setfilterOwner(!isFilterOwner);
                  confirm();
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        );
      },
    },
    {
      title: "Agenda Items",
      dataIndex: "value",
      width: 100,
      render: (_: any, data: any, index: number) => {
        const items: MenuProps["items"] = [];
        data?.value?.keyAgendaId?.map((item: any) => {
          items.push({
            key: item?.id,
            label: item?.agenda,
          });
        });
        return (
          <Dropdown menu={{ items }} overlayClassName={classes.DropDwonScroll}>
            <a onClick={(e) => e.preventDefault()}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  width: "200px",
                  paddingLeft: "5px",
                  paddingRight: "5px",
                  justifyContent: "space-between",
                  height: "30px",
                  backgroundColor: "#F4F6F9",
                  borderRadius: "5px",
                  color: "black",
                }}
              >
                <span
                  style={{
                    width: "200px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {data?.value?.keyAgendaId &&
                    data?.value?.keyAgendaId[0]?.agenda}
                </span>
                <MdExpandMore style={{ color: "#B2BABB" }} />
              </div>
            </a>
          </Dropdown>
        );
      },
    },
  ];

  // if (showData) {
  columns.push({
    title: "Action",
    dataIndex: "value",
    width: 50,
    render: (_: any, data: any, index: any) => {
      if (index === 0) {
        return (
          <div style={{ display: "flex", gap: "10px" }}>
            {(data?.value?.organizer === userDetail?.id ||
              data.meetingType?.owner?.some(
                (owner: any) => owner.id === userDetail?.id
              )) &&
              (data?.value?.status === "Schedule and Inform" ||
                data?.value?.status === "Submit") && (
                <IconButton
                  style={{ padding: "0px" }}
                  onClick={() => {
                    handleDrawerOpen(data, index, "Edit");
                  }}
                >
                  <Tooltip title="Create MoM" placement="bottom">
                    <div ref={refForMRMSchedule6}>
                      <CreateIcon
                        style={{ marginRight: "4px", height: "18px" }}
                      />
                    </div>
                  </Tooltip>
                </IconButton>
              )}
            {((data?.value?.status !== "Schedule and Inform" ||
              data?.value?.status === "Submit") &&
              (data?.value?.organizer === userDetail?.id ||
                data.meetingType?.owner?.some(
                  (owner: any) => owner.id === userDetail?.id
                ))) ||
            isOrgAdmin ||
            (isMR &&
              (userDetail.additionalUnits?.length > 0
                ? userDetail.additionalUnits?.includes(unitId)
                : unitId === userDetail?.location?.id)) ? (
              <IconButton
                style={{ padding: "0px" }}
                onClick={() => {
                  //actionForSchedule(data?.value?._id);
                  // console.log("data in handleclick", data);
                  handleDrawer(data, "Edit");
                  setStatusMode("edit");
                }}
              >
                <Tooltip title="Edit Schedule" placement="bottom">
                  <div ref={refForMRMSchedule7}>
                    <CustomEditIcon
                      style={{ marginRight: "4px", height: "19px" }}
                    />
                  </div>
                </Tooltip>
              </IconButton>
            ) : null}

            {isOrgAdmin && (
              <IconButton style={{ padding: "0px" }}>
                <Popconfirm
                  placement="top"
                  title={"Are you sure to delete Schedule Meeting"}
                  onConfirm={() => {
                    handleDeleteSchedule(data);
                  }}
                  okText="Yes"
                  cancelText="No"
                  // disabled={showData ? false : true}
                >
                  <Tooltip title="Delete Schedule" placement="bottom">
                    <div ref={refForMRMSchedule8}>
                      <CustomDeleteICon
                        style={{ marginRight: "4px", height: "19px" }}
                      />
                    </div>
                  </Tooltip>
                </Popconfirm>
              </IconButton>
            )}
          </div>
        );
      }

      return (
        <div style={{ display: "flex", gap: "10px" }}>
          {/* {console.log("data in columns", data)} */}
          {data?.value?.organizer === userDetail?.id &&
            (data?.value?.status === "Schedule and Inform" ||
              data?.value?.status === "Submit") && (
              <IconButton
                style={{ padding: "0px" }}
                onClick={() => {
                  handleDrawerOpen(data, index, "Edit");
                }}
              >
                <Tooltip title="Create MoM" placement="bottom">
                  <CreateIcon style={{ marginRight: "4px", height: "18px" }} />
                </Tooltip>
              </IconButton>
            )}
          {data?.value?.organizer === userDetail?.id ||
          isOrgAdmin ||
          (isMR &&
            (userDetail?.additionalUnits?.length > 0
              ? userDetail.additionalUnits?.includes(unitId)
              : unitId === userDetail?.location?.id) &&
            (data?.value?.status !== "Schedule and Inform" ||
              data?.value?.status === "Submit")) ? (
            <IconButton
              style={{ padding: "0px" }}
              onClick={() => {
                //actionForSchedule(data?.value?._id);
                // console.log("data in handleclick", data);
                handleDrawer(data, "Edit");
                setStatusMode("edit");
              }}
            >
              <Tooltip title="Edit Schedule" placement="bottom">
                <div>
                  <CustomEditIcon
                    style={{ marginRight: "4px", height: "19px" }}
                  />
                </div>
              </Tooltip>
            </IconButton>
          ) : null}

          {isOrgAdmin && (
            <IconButton style={{ padding: "0px" }}>
              <Popconfirm
                placement="top"
                title={"Are you sure to delete Schedule Meeting"}
                onConfirm={() => {
                  handleDeleteSchedule(data);
                }}
                okText="Yes"
                cancelText="No"
                // disabled={showData ? false : true}
              >
                <Tooltip title="Delete Schedule" placement="bottom">
                  <div>
                    <CustomDeleteICon
                      style={{ marginRight: "4px", height: "19px" }}
                    />
                  </div>
                </Tooltip>
              </Popconfirm>
            </IconButton>
          )}
        </div>
      );
    },
  });
  // }

  const actionPointColumns: ColumnsType<IKeyAgenda> = [
    {
      title: "Decision",
      dataIndex: "decision",
      width: 250,
      render: (_: any, data: any, index: number) => (
        <>{data.additionalInfo?.decisionPoint}</>
      ),
    },
    {
      title: "Action Items",
      dataIndex: "actionPoint",
      width: 250,
      render: (_: any, data: any, index: number) => {
        if (index === 0) {
          return (
            <>
              <div
                style={{ textDecoration: "underline" }}
                // onClick={() => handleEditActionPoint(data)}
                onClick={() => {
                  handlerActionEditOpen(data, "ReadOnly");
                }}
                ref={refForActionPoint5}
              >
                {data?.title}
              </div>
            </>
          );
        }
        return (
          <>
            <div
              style={{ textDecoration: "underline" }}
              // onClick={() => handleEditActionPoint(data)}
              onClick={() => {
                handlerActionEditOpen(data, "ReadOnly");
              }}
            >
              {data?.title}
            </div>
          </>
        );
      },
    },
    {
      title: "Meeting Type",
      dataIndex: "meetingType",
      width: 200,
      render: (_: any, data: any, index: number) => (
        <>{data.additionalInfo?.meetingType}</>
      ),
      filterIcon: (filtered: any) =>
        selectedActionMeetingType?.length > 0 ? (
          <AiFillFilter style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <AiOutlineFilter style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }: any) => {
        return (
          //style={{ padding: 8, overflowY: "auto", height: "150px"
          <div style={{ padding: 8, overflowY: "auto", height: "300px" }}>
            {actionFilterList?.meetingType?.map((item: any) => (
              <div key={item._id}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setSelectedActionMeetingType([
                          ...selectedActionMeetingType,
                          value,
                        ]);
                      } else {
                        setSelectedType(
                          selectedActionMeetingType.filter(
                            (key: any) => key !== value
                          )
                        );
                      }
                    }}
                    value={item._id}
                    checked={selectedActionMeetingType.includes(item?._id)} // Check if the checkbox should be checked
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "5px",
                    }}
                  />
                  {item.name}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                type="primary"
                disabled={selectedActionMeetingType.length === 0}
                onClick={() => {
                  setfilterActionMeetingType(!isFilterActionMeetingtype);
                }}
                style={{
                  marginRight: 8,
                  backgroundColor: "#E8F3F9",
                  color: "black",
                }}
              >
                Apply
              </Button>
              <Button
                onClick={() => {
                  setSelectedActionMeetingType([]);
                  setfilterActionMeetingType(!isFilterActionMeetingtype);
                  confirm();
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        );
      },
    },
    {
      title: "MRM Meeting Name",
      dataIndex: "meetingName",
      width: 200,
      render: (_: any, data: any, index: number) => (
        <>{data.additionalInfo?.meetingName}</>
      ),
    },

    {
      title: "Responsible Person",
      dataIndex: "Responsible Person",
      width: 160,
      render: (_: any, data: any, index: number) => (
        <>
          <div>
            {data?.owner &&
              data?.owner?.length &&
              data?.owner?.map((item: any, index: number) => (
                <React.Fragment key={index}>
                  {item?.username || ""}
                  {index < data?.owner?.length - 1 && ", "}
                </React.Fragment>
              ))}
          </div>
        </>
      ),
      filterIcon: (filtered: any) =>
        selectedActionOwner?.length > 0 ? (
          <AiFillFilter style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <AiOutlineFilter style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }: any) => {
        return (
          <div style={{ padding: 8, overflowY: "auto", height: "300px" }}>
            {actionFilterList?.usernames?.map((item: any) => (
              <div key={item.id}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setSelectedActionOwner([...selectedActionOwner, value]);
                      } else {
                        setSelectedActionOwner(
                          selectedActionOwner.filter(
                            (key: any) => key !== value
                          )
                        );
                      }
                    }}
                    value={item.id}
                    checked={selectedActionOwner?.includes(item.id)} // Check if the checkbox should be checked
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "5px",
                    }}
                  />
                  {item.username}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                type="primary"
                disabled={selectedActionOwner.length === 0}
                onClick={() => {
                  setActionfilterOwner(!isActionFilterOwner);
                }}
                style={{
                  marginRight: 8,
                  backgroundColor: "#E8F3F9",
                  color: "black",
                }}
              >
                Apply
              </Button>
              <Button
                onClick={() => {
                  setSelectedActionOwner([]);
                  setActionfilterOwner(!isActionFilterOwner);
                  confirm();
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        );
      },
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      width: 100,
      render: (_: any, data: any, index: number) => (
        <>{moment(data?.createdAt).format("DD-MM-YYYY")}</>
      ),
    },

    {
      title: "Status",
      dataIndex: "status",
      width: 100,
      filters: [
        { text: "Open", value: true },
        { text: "Close", value: false },
      ],
      onFilter: (value, record) => record.status === value,
      render: (_: any, data: any, index: number) => (
        <>
          {/* {data?.value?.actionPointdata && data?.value?.actionPointdata && data.value.actionPointdata.map((item: any) => ( */}

          <Tag
            style={{
              backgroundColor: data?.status ? "#D4E6F1" : "#FADBD8",
              color: "black",
            }}
            key={data?.status}
          >
            {data?.status ? "Open" : "Close"}
          </Tag>
          {/* ))} */}
        </>
      ),
    },
    {
      title: "Target Date",
      dataIndex: "targetDate",
      width: 100,
      render: (_: any, data: any, index: number) => (
        <>{moment(data?.targetDate).format("DD-MM-YYYY")}</>
      ),
    },
    {
      title: "Actions",
      dataIndex: "actions",
      width: 80,
      render: (_: any, data: any, index: number) => {
        if (index === 0) {
          return (
            <>
              <div style={{ display: "flex", alignItems: "left" }}>
                {(isOrgAdmin ||
                  data?.owner?.some(
                    (owner: any) => owner?.id === userDetail?.id
                  ) ||
                  data?.assignedBy === userDetail.id ||
                  (isMR &&
                    (userDetail?.additionalUnits?.length > 0
                      ? userDetail.additionalUnits.includes(actionUnitId)
                      : actionUnitId === userDetail.location.id))) &&
                  data.status && (
                    <IconButton
                      style={{ padding: "0px" }}
                      onClick={() => {
                        // console.log("data for action edit", data);
                        handlerActionEditOpen(data, "Edit");
                      }}
                    >
                      <div ref={refForActionPoint6}>
                        <CustomEditIcon
                          style={{
                            marginRight: "2px",
                            fontSize: "15px",
                            height: "20px",
                          }}
                        />
                      </div>
                    </IconButton>
                  )}

                {isOrgAdmin && (
                  <IconButton>
                    <Popconfirm
                      placement="top"
                      title={"Are you sure to delete Action Points"}
                      onConfirm={() => {
                        handleDeleteActionPoint(data);
                      }}
                      okText="Yes"
                      cancelText="No"
                      // disabled={showData ? false : true}
                    >
                      <div ref={refForActionPoint7}>
                        <CustomDeleteICon
                          style={{
                            fontSize: "15px",
                            marginRight: "2px",
                            height: "20px",
                          }}
                        />
                      </div>
                    </Popconfirm>
                  </IconButton>
                )}
              </div>
            </>
          );
        }
        return (
          <>
            <div style={{ display: "flex", alignItems: "left" }}>
              {(isOrgAdmin ||
                (data?.owner &&
                  Array.isArray(data.owner) &&
                  data.owner.some(
                    (owner: any) => owner?.id === userDetail?.id
                  )) ||
                data?.assignedBy === userDetail.id ||
                (isMR &&
                  (userDetail?.additionalUnits?.length > 0
                    ? userDetail.additionalUnits.includes(actionUnitId)
                    : actionUnitId === userDetail?.location?.id))) &&
                data.status === true && (
                  <IconButton
                    style={{ padding: "0px" }}
                    onClick={() => {
                      // console.log("data for action edit", data);
                      handlerActionEditOpen(data, "Edit");
                    }}
                  >
                    <div>
                      <CustomEditIcon
                        style={{
                          marginRight: "2px",
                          fontSize: "15px",
                          height: "20px",
                        }}
                      />
                    </div>
                  </IconButton>
                )}

              {isOrgAdmin && (
                <IconButton>
                  <Popconfirm
                    placement="top"
                    title={"Are you sure to delete Action Points"}
                    onConfirm={() => {
                      handleDeleteActionPoint(data);
                    }}
                    okText="Yes"
                    cancelText="No"
                    // disabled={showData ? false : true}
                  >
                    <div>
                      <CustomDeleteICon
                        style={{
                          fontSize: "15px",
                          marginRight: "2px",
                          height: "20px",
                        }}
                      />
                    </div>
                  </Popconfirm>
                </IconButton>
              )}
            </div>
          </>
        );
      },
    },
  ];

  const createHandler = (record: any = {}) => {
    if (!value) {
      // handleDrawer(undefined, "Direct");
      // setStatusMode("Create");
      setOpen(true);
    }
    if (value === 6) {
      if (showData) {
        setAddKeyAgenda(true);
      }
    }
  };

  const configHandler = () => {
    navigate("/mrm/keyagenda");
  };

  const filterHandler = () => {
    // navigate("/processdocuments/documenttype");
  };

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
    data: any
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedData({ ...data });
  };

  const handleActionPoint = () => {
    setOpenActionPointDrawer({
      open: true,
      data: selectedData,
    });
    handleCloseMenu();
  };
  const handleDeleteSchedule = async (data: any) => {
    const id = data.value._id;

    try {
      const res = await axios.delete(
        `${API_LINK}/api/mrm/deleteSchedule/${id}`
      );
      if (res.status === 200) {
        enqueueSnackbar(`Deleted Schedule Successfully!`, {
          variant: "success",
        });
      }
      getMRMValues(
        unitId,
        deptId,
        "",
        currentYear,
        pageMrm,
        pageLimitMrm,
        selectedOwner,
        selectedType
      );
    } catch (error) {
      enqueueSnackbar(`Error in deleting!`, {
        variant: "error",
      });
    }
  };
  const handleDeleteActionPoint = async (data: any) => {
    const id = data._id;
    // console.log("data for delete", data);

    try {
      const res = await axios.delete(
        `${API_LINK}/api/actionitems/deleteActionItem/${id}`
      );
      if (res.status === 200) {
        enqueueSnackbar(`Deleted ActionPoint Successfully!`, {
          variant: "success",
        });
      }
      getActionPoints();
    } catch (error) {
      // enqueueSnackbar(`Something went wrong!`, {
      //   variant: "error",
      // });
    }
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleChange = (event: any, newValue: any) => {
    setValue(newValue);
  };

  const getSelectedItem = () => {
    const item = [allOption, ...locationOptions].find((opt: any) => {
      if (opt.id === unitId) return opt;
    });
    return item || {};
  };

  const getSelectedActionItem = () => {
    const item = [allOption, ...locationOptions].find((opt: any) => {
      if (opt.id === actionUnitId) return opt;
    });
    return item || {};
  };
  const getSelectedMeetingItem = () => {
    const item = [allOption, ...locationOptions].find((opt: any) => {
      if (opt.id === meetingUnitId) return opt;
    });
    return item || {};
  };
  const sendInvite = async () => {
    setAnchorEl(null);
    enqueueSnackbar(
      `Your request is saving in background. Once it complete system will notify for same!`,
      {
        variant: "info",
      }
    );
    const res = await axios.post("/api/mrm/sendInvite", selectedData);
    if (res.status === 200 || res.status === 201) {
      enqueueSnackbar(`Invite Send Successfully!`, {
        variant: "success",
      });
    }
  };

  const handleCheck = async (tabValue: string) => {
    if (searchValue) {
      const newPayload = {
        text: searchValue,
        orgId: orgId,
        year: currentYear,
        page: pageMrm,
        limit: pageLimitMrm,
        unitId: unitId,
        entityId: deptId,
      };

      const res = await axios.get("/api/mrm/search", { params: newPayload });
      if (res.status === 200 || res.status === 201) {
        const data = res.data;
        //  console.log("res.data", res.data);
        for (let i = 0; i < data?.length; i++) {
          const value = data[i];
          value.key = i;
        }

        if (tabValue === "mrm") {
          setDataSource(data);
          setCount(data?.length);
        } else {
          // setActionPointDataSource(actionPointDataValue);
        }

        // enqueueSnackbar(`Data Added Successfully!`, {
        //     variant: "success",
        // });
      }
    }
  };

  const handleMeetingSearch = async (searchValue: string) => {
    const newPayload = {
      text: searchValue,
      orgId: orgId,
      page: page,
      limit: pageLimit,
      year: currentYear,
      unitId:
        meetingUnitId !== undefined ? meetingUnitId : userDetail.location.id,
      entityId:
        meetingEntityId !== undefined
          ? meetingEntityId
          : userDetail?.entity?.id,
    };
    try {
      const res = await axios.get("/api/mrm/searchMeetings", {
        params: newPayload,
      });
      setMeetingsDataApi(res?.data?.res);
      setCountMeeting(res?.data?.count);
    } catch (error) {
      // console.log("error", error);
      // enqueueSnackbar(`Meeting search failed!`, {
      //   variant: "error",
      // });
      //return error;
    }
  };
  const handleActionPointSearch = async (searchValue: string) => {
    const newPayload = {
      text: searchValue,
      orgId: orgId,
      locationId: actionUnitId,
      entityId: actionEntityId,
      page: pageAction,
      limit: pageLimitAction,
      year: currentYear,
    };
    try {
      const res = await axios.get("/api/mrm/searchActionPoint", {
        params: newPayload,
      });
      setActionPointDataSource(res?.data?.actionPoints);
      setCountAction(res?.data?.count);
    } catch (error) {
      enqueueSnackbar(`Action Point search failed!`, {
        variant: "error",
      });
      return error;
    }
  };

  const handleSearchChange = (e: any) => {
    e.preventDefault();
    setSearchValue(e.target.value);
    if (
      e.target.value === "" ||
      e.target.value === undefined ||
      e.target.value === null
    ) {
      getMRMValues(
        unitId,
        deptId,
        "",
        currentYear,
        pageMrm,
        pageLimitMrm,
        selectedOwner,
        selectedType
      );
    } else {
      handleCheck("mrm");
    }
    // handleSearchChange(e.target.value);
  };
  const handleMeetingSearchChange = (e: any) => {
    // e.preventDefault();
    setMeetingSearchValue(e.target.value);
    if (
      e.target.value === "" ||
      e.target.value === null ||
      e.target.value === null
    ) {
      getDataTableMeetings();
    } else {
      handleMeetingSearch(e.target.value);
    }
  };
  const handleActionPointSearchChange = (e: any) => {
    e.preventDefault();
    if (
      e.target.value !== "" ||
      e.target.value !== null ||
      e.target.value !== null
    ) {
      setActionPointSearchValue(e.target.value);
      handleActionPointSearch(e.target.value);
    } else {
      getActionPoints();
    }
  };

  const toggleCalendarModal = (data: any = {}) => {
    setCalendarModalInfo({
      ...calendarModalInfo,
      open: !calendarModalInfo.open,
      data: data,
    });
  };

  const handlerMeetingDelete = (id: any) => {
    deleteMeeting(id).then((response: any) => {
      if (response.status === 200) {
        enqueueSnackbar(`Deleted Meeting Successfully!`, {
          variant: "success",
        });
        getDataTableMeetings();
        // getMRMValues(
        //   unitId,
        //   deptId,
        //   "mrm",
        //   currentYear,
        //   pageMrm,
        //   pageLimitMrm,
        //   selectedOwner,
        //   selectedType
        // );
      }
    });
  };

  const actionForSchedule = async (id: any) => {
    try {
      const result = await axios.get(`/api/mrm/getOwnerForSchedule/${id}`);

      setOwner(result?.data);
    } catch (error) {
      enqueueSnackbar("Error fetching the owner for schedule", {
        variant: "error",
      });
    }
  };

  const handleChangeSegment = (key: any) => {
    // initialBoard()
    setOpenMeeting(false);

    setCurrentStateNew(key);
  };
  const meetingsTableHeaders: ColumnsType<IKeyAgenda> = [
    {
      title: "Minutes Of Meeting",
      dataIndex: "MeetingTitle",
      width: 350,
      render: (_: any, data: any, index) => {
        if (index === 0) {
          return (
            <>
              <div
                style={{ textDecoration: "underline" }}
                onClick={() => {
                  handleEditDrawerOpen(data, "ReadOnly");
                }}
                ref={refForMeeting4}
              >
                {data?.meetingName}
                {data?.status === "Save As Draft" && (
                  <Tooltip title="In Draft">
                    <MdDescription
                      style={{
                        verticalAlign: "middle",
                        marginLeft: 5,
                        color: "#3576BA",
                        fontSize: "18px",
                      }}
                    />
                  </Tooltip>
                )}
              </div>
            </>
          );
        }
        return (
          <>
            <div
              style={{ textDecoration: "underline" }}
              onClick={() => {
                handleEditDrawerOpen(data, "ReadOnly");
              }}
            >
              {data?.meetingName}
              {data?.status === "Save As Draft" && (
                <Tooltip title="In Draft">
                  <MdDescription
                    style={{
                      verticalAlign: "middle",
                      marginLeft: 5,
                      color: "#3576BA",
                      fontSize: "18px",
                    }}
                  />
                </Tooltip>
              )}
            </div>
          </>
        );
      },
    },
    {
      title: "Schedule Name",
      dataIndex: "meetingSchedule",
      width: 250,
      render: (_: any, data: any) => (
        <span>{data.meetingSchedule?.meetingName}</span>
      ),
    },
    {
      title: "Meeting Type",
      dataIndex: "meetingType",
      width: 200,
      render: (_: any, data: any) => <span>{data.meetingType?.name}</span>,
      filterIcon: (filtered: any) =>
        selectedMeetingType?.length > 0 ? (
          <AiFillFilter style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <AiOutlineFilter style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }: any) => {
        return (
          //style={{ padding: 8, overflowY: "auto", height: "150px"
          <div style={{ padding: 8, overflowY: "auto", height: "300px" }}>
            {meetingFilterList.meetingTypes?.map((item: any) => (
              <div key={item.id}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setSelectedMeetingType([...selectedMeetingType, value]);
                      } else {
                        setSelectedMeetingType(
                          selectedMeetingType.filter(
                            (key: any) => key !== value
                          )
                        );
                      }
                    }}
                    value={item.id}
                    checked={selectedMeetingType.includes(item.id)} // Check if the checkbox should be checked
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "5px",
                    }}
                  />
                  {item.name}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                type="primary"
                disabled={selectedMeetingType.length === 0}
                onClick={() => {
                  setfilterMeetingType(!isFilterMeetingType);
                  // handlePagination(1, 10);
                }}
                style={{
                  marginRight: 8,
                  backgroundColor: "#E8F3F9",
                  color: "black",
                }}
              >
                Apply
              </Button>
              <Button
                onClick={() => {
                  setSelectedMeetingType([]);
                  setfilterMeetingType(!isFilterMeetingType);
                  confirm();
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        );
      },
    },
    {
      title: "Meeting Date & Time",
      dataIndex: "MeetingDate",
      width: 150,
      render: (_: any, data: any) => {
        // const dateTime = new Date(data?.meetingdate);
        const [datePart, timePart] = data?.meetingdate?.split("T");
        const date = datePart?.split("-").reverse().join("-");
        const time = timePart?.slice(0, 5);
        return (
          <div style={{ display: "flex", gap: "10px" }}>
            <span>{date}</span>
            <span>{time}</span>
          </div>
        );
      },
    },
    {
      title: "Agenda",
      dataIndex: "Agenda",
      width: 150,
      render: (_: any, data: any) => {
        const items: MenuProps["items"] = [];

        // Use a Set to ensure uniqueness based on the 'agenda' field
        const uniqueAgendas = Array.from(
          new Set(data?.agenda?.map((item: any) => item?.agenda))
        ).map((agenda: any) => {
          // Find the corresponding agenda object for each unique agenda value
          return data?.agenda?.find((item: any) => item?.agenda === agenda);
        });

        // Populate the items with unique agenda
        uniqueAgendas.forEach((item: any) => {
          items.push({
            key: item?.id,
            label: item?.agenda,
          });
        });

        return (
          <Dropdown menu={{ items }} overlayClassName={classes.DropDwonScroll}>
            <a onClick={(e) => e.preventDefault()}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  width: "250px",
                  paddingLeft: "5px",
                  paddingRight: "5px",
                  justifyContent: "space-between",
                  height: "30px",
                  backgroundColor: "#F4F6F9",
                  borderRadius: "5px",
                  color: "black",
                }}
              >
                <span
                  style={{
                    width: "180px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {data?.agenda && data?.agenda[0]?.agenda}
                </span>{" "}
                <MdExpandMore style={{ color: "#B2BABB" }} />
              </div>
            </a>
          </Dropdown>
        );
      },
    },
    {
      title: "Attendance",
      dataIndex: "percentage",
      width: 100,
      render: (_: any, data: any) => (
        <>
          <CircleGauge value={data?.percentage} />
        </>
      ),
      // render: (_: any, data: any) => <>{data?.percentage}%</>,
    },
    {
      title: "Meeting Owner",
      dataIndex: "AgendaOwner",
      width: 150,
      render: (_: any, data: any) => <>{data?.createdBy?.username}</>,
      filterIcon: (filtered: any) =>
        selectedMeetingOwner?.length > 0 ? (
          <AiFillFilter style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <AiOutlineFilter style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }: any) => {
        return (
          <div
            style={{
              padding: 8,

              overflowY: "auto",
              height: "300px",
            }}
          >
            {meetingFilterList?.usernames?.map((item: any) => (
              <div key={item.id}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setSelectedMeetingOwner([
                          ...selectedMeetingOwner,
                          value,
                        ]);
                      } else {
                        setSelectedMeetingOwner(
                          selectedMeetingOwner.filter(
                            (key: any) => key !== value
                          )
                        );
                      }
                    }}
                    value={item.id}
                    checked={selectedMeetingOwner.includes(item.id)} // Check if the checkbox should be checked
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "5px",
                    }}
                  />
                  {item.username}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                type="primary"
                disabled={selectedMeetingOwner.length === 0}
                onClick={() => {
                  setMeetingfilterOwner(!isMeetingFilterOwner);
                  handlePaginationMeeting(1, 10);
                  setOpenMeeting(false);
                  setOpenMeetingAttended(false);
                }}
                style={{
                  marginRight: 8,
                  backgroundColor: "#E8F3F9",
                  color: "black",
                }}
              >
                Apply
              </Button>
              <Button
                onClick={() => {
                  setSelectedMeetingOwner([]);
                  setMeetingfilterOwner(!isMeetingFilterOwner);
                  confirm();
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        );
      },
    },
    {
      title: "My Role",
      dataIndex: "roleName",
      width: 150,
      render: (_: any, data: any) => (
        <span>
          <span>{data?.roleName?.join(", ")}</span>
        </span>
      ),
    },
    {
      title: "Actions",
      dataIndex: "actions",
      width: 150, // Reduced width for the action column
      render: (_: any, data: any, index) => {
        const iconStyle = {
          fontSize: "16px", // Reduced icon size
          height: "16px",
          padding: "0",
          // Reduced height for a more compact look
          // margin: "0 4px", // Reduced margin between icons (less gap between icons)
        };

        const flexContainerStyle = {
          display: "inline-flex",
          justifyContent: "flex-start", // Align icons to the left (can adjust if needed)
          alignItems: "center", // Vertical alignment of icons
          // gap: "6px", // Reduced gap between icons
        };

        if (index === 0) {
          return (
            <div style={flexContainerStyle}>
              {data?.status !== "Submit" &&
                (data?.access ||
                  isOrgAdmin ||
                  (isMR && userDetail?.additionalUnits?.length > 0
                    ? userDetail.additionalUnits?.includes(meetingUnitId)
                    : meetingUnitId === userDetail?.location?.id)) && (
                  <IconButton
                    onClick={() => {
                      handleEditDrawerOpen(data, "Edit");
                    }}
                    style={{ padding: "2px" }}
                  >
                    <Tooltip title="Edit MoM" placement="bottom">
                      <div ref={refForMeeting5}>
                        <CustomEditIcon style={iconStyle} />
                      </div>
                    </Tooltip>
                  </IconButton>
                )}

              {data?.status === "Submit" &&
                data?.createdBy?.id === userDetail?.id && (
                  // (data?.access ||
                  //   isOrgAdmin ||
                  //   (isMR && userDetail?.additionalUnits?.length > 0
                  //     ? userDetail.additionalUnits?.includes(meetingUnitId)
                  //     : meetingUnitId === userDetail.location.id))
                  <IconButton
                    onClick={() => {
                      handleMeetingMail(data._id);
                    }}
                    style={{ padding: "2px" }}
                  >
                    <Tooltip title="Send Mail" placement="bottom">
                      <div ref={refForMeeting7}>
                        <MdMailOutline style={iconStyle} />
                      </div>
                    </Tooltip>
                  </IconButton>
                )}

              {data?.status === "Submit" &&
                (data?.access ||
                  isOrgAdmin ||
                  (isMR &&
                    (userDetail.additionalUnits?.length > 0
                      ? userDetail.additionalUnits?.includes(meetingUnitId)
                      : meetingUnitId === userDetail?.location?.id))) && (
                  <IconButton
                    onClick={() => {
                      handlerActionAddOpen(data);
                    }}
                    style={{ padding: "2px" }}
                    ref={refForMeeting8}
                  >
                    <Tooltip title="Add Action Point" placement="bottom">
                      <div ref={refForMeeting8}>
                        <MdAddCircleOutline
                          style={{ fontSize: "20px", marginRight: "2px" }}
                        />
                      </div>
                    </Tooltip>
                  </IconButton>
                )}

              {(data?.access ||
                isOrgAdmin ||
                (isMR &&
                  userDetail?.additionalUnits?.includes(meetingUnitId))) && (
                <IconButton
                  onClick={() => {
                    handleGetMrmReports(data);
                  }}
                  style={{ padding: "2px" }}
                >
                  <Tooltip title="Download Pdf" placement="bottom">
                    <div ref={refForMeeting9}>
                      <MdOutlinePictureAsPdf style={iconStyle} />
                    </div>
                  </Tooltip>
                </IconButton>
              )}
              {isOrgAdmin && (
                <Popconfirm
                  placement="top"
                  title={"Are you sure to delete Meeting"}
                  onConfirm={() => {
                    handlerMeetingDelete(data?._id);
                  }}
                  okText="Yes"
                  cancelText="No"
                >
                  <Tooltip title="Delete Meeting" placement="bottom">
                    <div ref={refForMeeting6}>
                      <CustomDeleteICon
                        style={{
                          // padding: "2px",
                          fontSize: "20px", // Reduced icon size
                          height: "20px",
                        }}
                      />
                    </div>
                  </Tooltip>
                </Popconfirm>
              )}
            </div>
          );
        }

        return (
          <div style={flexContainerStyle}>
            {data?.status !== "Submit" &&
              (data?.access ||
                isOrgAdmin ||
                (isMR && userDetail.additionalUnits?.length > 0
                  ? userDetail.additionalUnits?.includes(meetingUnitId)
                  : userDetail.location?.id === meetingUnitId)) && (
                <IconButton
                  onClick={() => {
                    handleEditDrawerOpen(data, "Edit");
                  }}
                >
                  <Tooltip title="Edit MoM" placement="bottom">
                    <div>
                      <CustomEditIcon style={{ padding: "2px" }} />
                    </div>
                  </Tooltip>
                </IconButton>
              )}

            {isOrgAdmin && (
              <Popconfirm
                placement="top"
                title={"Are you sure to delete Meeting"}
                onConfirm={() => {
                  handlerMeetingDelete(data?._id);
                }}
                okText="Yes"
                cancelText="No"
              >
                <Tooltip title="Delete Meeting" placement="bottom">
                  <div>
                    <CustomDeleteICon
                      style={{
                        // padding: "2px",
                        fontSize: "20px", // Reduced icon size
                        height: "20px",
                      }}
                    />
                  </div>
                </Tooltip>
              </Popconfirm>
            )}

            {data?.status === "Submit" &&
              data?.createdBy?.id === userDetail?.id && (
                // (data?.access ||
                //   isOrgAdmin ||
                //   (isMR && userDetail?.additionalUnits?.length > 0
                //     ? userDetail.additionalUnits?.includes(meetingUnitId)
                //     : meetingUnitId === userDetail?.location?.id))
                <IconButton
                  onClick={() => {
                    handleMeetingMail(data._id);
                  }}
                  ref={refForMeeting7}
                >
                  <Tooltip title="Send Mail" placement="bottom">
                    <div>
                      <MdMailOutline style={iconStyle} />
                    </div>
                  </Tooltip>
                </IconButton>
              )}

            {data?.status === "Submit" &&
              (data?.access ||
                isOrgAdmin ||
                (isMR &&
                  (userDetail.additionalUnits?.length > 0
                    ? userDetail.additionalUnits?.includes(meetingUnitId)
                    : meetingUnitId === userDetail?.location?.id))) && (
                <IconButton
                  onClick={() => {
                    handlerActionAddOpen(data);
                  }}
                  ref={refForMeeting8}
                >
                  <Tooltip title="Add Action Point" placement="bottom">
                    <div>
                      <MdAddCircleOutline
                        style={{ fontSize: "20px", marginRight: "2px" }}
                      />
                    </div>
                  </Tooltip>
                </IconButton>
              )}

            {(data?.access ||
              isOrgAdmin ||
              (isMR &&
                userDetail?.additionalUnits?.includes(meetingUnitId))) && (
              <IconButton
                onClick={() => {
                  handleGetMrmReports(data);
                }}
              >
                <Tooltip title="Download Pdf" placement="bottom">
                  <div>
                    <MdOutlinePictureAsPdf style={iconStyle} />
                  </div>
                </Tooltip>
              </IconButton>
            )}
          </div>
        );
      },
    },
  ];
  const CircleGauge = ({ value }: { value: number }) => (
    // <div
    //   style={{
    //     backgroundColor: "#b3cce6",
    //     borderRadius: "50%",
    //     width: 50,
    //     height: 50,
    //     display: "flex",
    //     alignItems: "center",
    //     justifyContent: "center",
    //   }}
    // >
    <Progress
      type="circle"
      percent={Math.round(value)}
      width={44}
      strokeColor="#ff9966"
      trailColor="#F0F0F0"
      strokeLinecap="round"
      format={(percent) => `${percent}%`}
    />
    // </div>
  );

  const handlePaginationMeeting = (page: any, pageSize: any) => {
    setPage(page);
    setPageLimit(pageSize);
    // getDataTableMeetings();
  };

  // useEffect(() => {
  //   if(!!currentYear){
  //   getDataTableMeetings();
  //   // console.log("useefect1");
  //   }
  // }, [page, pageLimit, isMeetingFilterOwner, openMeeting]);
  useEffect(() => {
    if (!!currentYear && value === 1) {
      getDataTableMeetings();
      fetchMeetingFilterList();
    }
    // console.log("useeffect 2");
  }, [
    meetingUnitId,
    currentStateNew,
    isMeetingFilterOwner,
    isFilterMeetingType,
    page,
    pageLimit,
    meetingEntityId,
    value,
  ]);

  const [dataSourceMrm, setDataSourceMrm] = useState<any[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [units, setUnits] = useState<any[]>([]);
  // const [systemData, setSystemData] = useState<any[]>([]);
  const [selectedSystem, setSelectedSystem] = useState<any[]>([]);
  const [suggestions, setSuggestions] = React.useState([]);
  // const [formData, setFormData] = useRecoilState(documentTypeFormData);
  const [loading, setLoading] = useState<boolean>(false);
  const [settings, setSettings] = useState<string>("");
  const [auditYear, setAuditYear] = useRecoilState<any>(currentAuditYear);
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isMR = checkRoles("MR");

  const unitSystemData = {
    unit: selectedUnit,
    system: selectedSystem,
  };

  const showData = isOrgAdmin || isMR;

  const getyear = async () => {
    const currentyear = await getYearFormat(new Date().getFullYear());
    setCurrentYear(currentyear);
  };
  // const getHeaderData = () => {
  //   getOrganizationData(realmName).then((response: any) => {
  //     setAuditYear(response?.data?.auditYear);
  //   });
  // };

  // const checkOwnerAccess = (id: any) => {
  //   try {
  //     const result = axios.get(`/api/mrm/getAllAgendOwnersByMeetingType/${id}`);
  //   } catch (error) {
  //     return error;
  //   }
  // };
  const monthsColumns = [
    {
      title: "Apr",
      dataIndex: "mrmData",
      key: "mrmData",
      align: "center",
      render: (_: any, data: any, index: any) => {
        return (
          <div style={{ textAlign: "center" }}>
            <Checkbox
              disabled={
                isOrgAdmin ||
                (isMR &&
                  (userDetail?.additionalUnits?.length > 0
                    ? userDetail?.additionalUnits.includes(selectedUnit)
                    : selectedUnit === userDetail?.location?.id) &&
                  data?.unitId !== "All") ||
                data?.owner?.some((owner: any) => owner.id === userDetail.id)
                  ? false
                  : true
              }
              onChange={(event) => handleCheckBox(event, data, index, 0)}
              key="april"
              checked={
                data?.mrmData?.mrmPlanData && data?.mrmData?.mrmPlanData[0]
              }
            />
          </div>
        );
      },
    },
    {
      title: "May",
      dataIndex: "mrmData",
      key: "mrmData",
      align: "center",
      render: (_: any, data: any, index: any) => (
        <div style={{ textAlign: "center" }}>
          <Checkbox
            disabled={
              isOrgAdmin ||
              (isMR &&
                (userDetail?.additionalUnits?.length > 0
                  ? userDetail?.additionalUnits.includes(selectedUnit)
                  : selectedUnit === userDetail?.location?.id) &&
                data?.unitId !== "All") ||
              data?.owner?.some((owner: any) => owner.id === userDetail.id)
                ? false
                : true
            }
            onChange={(event) => handleCheckBox(event, data, index, 1)}
            checked={
              data?.mrmData?.mrmPlanData && data?.mrmData?.mrmPlanData[1]
            }
          />
        </div>
      ),
    },
    {
      title: "June",
      dataIndex: "mrmData",
      key: "mrmData",
      align: "center",
      render: (_: any, data: any, index: any) => (
        <div style={{ textAlign: "center" }}>
          <Checkbox
            disabled={
              isOrgAdmin ||
              (isMR &&
                (userDetail?.additionalUnits?.length > 0
                  ? userDetail?.additionalUnits.includes(selectedUnit)
                  : selectedUnit === userDetail?.location?.id) &&
                data?.unitId !== "All") ||
              data?.owner?.some((owner: any) => owner.id === userDetail.id)
                ? false
                : true
            }
            onChange={(event) => handleCheckBox(event, data, index, 2)}
            checked={
              data?.mrmData?.mrmPlanData && data?.mrmData?.mrmPlanData[2]
            }
          />
        </div>
      ),
    },
    {
      title: "July",
      dataIndex: "mrmData",
      key: "mrmData",
      align: "center",
      render: (_: any, data: any, index: any) => (
        <div style={{ textAlign: "center" }}>
          <Checkbox
            disabled={
              isOrgAdmin ||
              (isMR &&
                (userDetail?.additionalUnits?.length > 0
                  ? userDetail?.additionalUnits.includes(selectedUnit)
                  : selectedUnit === userDetail?.location?.id) &&
                data?.unitId !== "All") ||
              data?.owner?.some((owner: any) => owner.id === userDetail.id)
                ? false
                : true
            }
            onChange={(event) => handleCheckBox(event, data, index, 3)}
            checked={
              data?.mrmData?.mrmPlanData && data?.mrmData?.mrmPlanData[3]
            }
          />
        </div>
      ),
    },
    {
      title: "Aug",
      dataIndex: "mrmData",
      key: "mrmData",
      align: "center",
      render: (_: any, data: any, index: any) => (
        <div style={{ textAlign: "center" }}>
          <Checkbox
            disabled={
              isOrgAdmin ||
              (isMR &&
                (userDetail?.additionalUnits?.length > 0
                  ? userDetail?.additionalUnits.includes(selectedUnit)
                  : selectedUnit === userDetail?.location?.id) &&
                data?.unitId !== "All") ||
              data?.owner?.some((owner: any) => owner.id === userDetail.id)
                ? false
                : true
            }
            onChange={(event) => handleCheckBox(event, data, index, 4)}
            checked={
              data?.mrmData?.mrmPlanData && data?.mrmData?.mrmPlanData[4]
            }
          />
        </div>
      ),
    },
    {
      title: "Sep",
      dataIndex: "mrmData",
      key: "mrmData",
      align: "center",
      render: (_: any, data: any, index: any) => (
        <div style={{ textAlign: "center" }}>
          <Checkbox
            disabled={
              isOrgAdmin ||
              (isMR &&
                (userDetail?.additionalUnits?.length > 0
                  ? userDetail?.additionalUnits.includes(selectedUnit)
                  : selectedUnit === userDetail?.location?.id) &&
                data?.unitId !== "All") ||
              data?.owner?.some((owner: any) => owner.id === userDetail.id)
                ? false
                : true
            }
            onChange={(event) => handleCheckBox(event, data, index, 5)}
            checked={
              data?.mrmData?.mrmPlanData && data?.mrmData?.mrmPlanData[5]
            }
          />
        </div>
      ),
    },
    {
      title: "Oct",
      dataIndex: "mrmData",
      key: "mrmData",
      align: "center",
      render: (_: any, data: any, index: any) => (
        <div style={{ textAlign: "center" }}>
          <Checkbox
            disabled={
              isOrgAdmin ||
              (isMR &&
                (userDetail?.additionalUnits?.length > 0
                  ? userDetail?.additionalUnits.includes(selectedUnit)
                  : selectedUnit === userDetail?.location?.id) &&
                data?.unitId !== "All") ||
              data?.owner?.some((owner: any) => owner.id === userDetail.id)
                ? false
                : true
            }
            onChange={(event) => handleCheckBox(event, data, index, 6)}
            checked={
              data?.mrmData?.mrmPlanData && data?.mrmData?.mrmPlanData[6]
            }
          />
        </div>
      ),
    },
    {
      title: "Nov",
      dataIndex: "mrmData",
      key: "mrmData",
      align: "center",
      render: (_: any, data: any, index: any) => (
        <div style={{ textAlign: "center" }}>
          <Checkbox
            disabled={
              isOrgAdmin ||
              (isMR &&
                (userDetail?.additionalUnits?.length > 0
                  ? userDetail?.additionalUnits.includes(selectedUnit)
                  : selectedUnit === userDetail?.location?.id) &&
                data?.unitId !== "All") ||
              data?.owner?.some((owner: any) => owner.id === userDetail.id)
                ? false
                : true
            }
            onChange={(event) => handleCheckBox(event, data, index, 7)}
            checked={
              data?.mrmData?.mrmPlanData && data?.mrmData?.mrmPlanData[7]
            }
          />
        </div>
      ),
    },
    {
      title: "Dec",
      dataIndex: "mrmData",
      key: "mrmData",
      align: "center",
      render: (_: any, data: any, index: any) => (
        <div style={{ textAlign: "center" }}>
          <Checkbox
            disabled={
              isOrgAdmin ||
              (isMR &&
                (userDetail?.additionalUnits?.length > 0
                  ? userDetail?.additionalUnits.includes(selectedUnit)
                  : selectedUnit === userDetail?.location?.id) &&
                data?.unitId !== "All") ||
              data?.owner?.some((owner: any) => owner.id === userDetail.id)
                ? false
                : true
            }
            onChange={(event) => handleCheckBox(event, data, index, 8)}
            checked={
              data?.mrmData?.mrmPlanData && data?.mrmData?.mrmPlanData[8]
            }
          />
        </div>
      ),
    },
    {
      title: "Jan",
      dataIndex: "mrmData",
      key: "mrmData",
      align: "center",
      render: (_: any, data: any, index: any) => (
        <div style={{ textAlign: "center" }}>
          <Checkbox
            disabled={
              isOrgAdmin ||
              (isMR &&
                (userDetail?.additionalUnits?.length > 0
                  ? userDetail?.additionalUnits.includes(selectedUnit)
                  : selectedUnit === userDetail?.location?.id) &&
                data?.unitId !== "All") ||
              data?.owner?.some((owner: any) => owner.id === userDetail.id)
                ? false
                : true
            }
            onChange={(event) => handleCheckBox(event, data, index, 9)}
            checked={
              data?.mrmData?.mrmPlanData && data?.mrmData?.mrmPlanData[9]
            }
          />
        </div>
      ),
    },
    {
      title: "Feb",
      dataIndex: "mrmData",
      key: "mrmData",
      align: "center",
      render: (_: any, data: any, index: any) => (
        <div style={{ textAlign: "center" }}>
          <Checkbox
            disabled={
              isOrgAdmin ||
              (isMR &&
                (userDetail?.additionalUnits?.length > 0
                  ? userDetail?.additionalUnits.includes(selectedUnit)
                  : selectedUnit === userDetail?.location?.id) &&
                data?.unitId !== "All") ||
              data?.owner?.some((owner: any) => owner.id === userDetail.id)
                ? false
                : true
            }
            onChange={(event) => handleCheckBox(event, data, index, 10)}
            checked={
              data?.mrmData?.mrmPlanData && data?.mrmData?.mrmPlanData[10]
            }
          />
        </div>
      ),
    },
    {
      title: "Mar",
      dataIndex: "mrmData",
      key: "mrmData",
      align: "center",
      render: (_: any, data: any, index: any) => (
        <div style={{ textAlign: "center" }}>
          <Checkbox
            style={{ borderColor: "grey" }}
            disabled={
              (isMR &&
                (userDetail?.additionalUnits?.length > 0
                  ? userDetail?.additionalUnits.includes(selectedUnit)
                  : selectedUnit === userDetail?.location?.id) &&
                data?.unitId !== "All") ||
              data?.owner?.some((owner: any) => owner.id === userDetail.id)
                ? false
                : true || isOrgAdmin
            }
            onChange={(event) => handleCheckBox(event, data, index, 11)}
            checked={
              data?.mrmData?.mrmPlanData && data?.mrmData?.mrmPlanData[11]
            }
          />
        </div>
      ),
    },
  ];

  const columnsMrm = [
    {
      title: "Meeting Type",
      dataIndex: "name",
      key: "name",
      width: 120,
      render: (_: any, data: any, index: any) => (
        // if (index === 0) {
        // return
        <div ref={refForMRMPlan5}>{data?.name}</div>
      ),
      // return <div>{data?.name}</div>;
      // },
    },
    {
      title: "Owners",
      dataIndex: "owner",
      key: "owner",
      width: 100,
      render: (_: any, data: any, index: any) => (
        // if (index === 0) {
        //   return (
        <div ref={refForMRMPlan6}>
          {data?.owner?.map((item: any) => {
            return <div>{item?.username}</div>;
          })}
        </div>
        //   );
        // }
        //   return (
        //     <div>
        //       {data?.owner?.map((item: any) => {
        //         return <div>{item?.username}</div>;
        //       })}
        //     </div>
        //   );
      ),
    },
    {
      title: "Applicable Systems",
      dataIndex: "applicableSystem",
      key: "applicableSystem",
      width: 100,
      render: (_: any, data: any, index: any) => (
        // if (index === 0) {
        //   return (
        <div>
          {data?.applicableSystem?.map((item: any) => {
            return <div>{item?.name}</div>;
          })}
        </div>
        //   );
        // }
        //   return (
        //     <div>
        //       {data?.owner?.map((item: any) => {
        //         return <div>{item?.username}</div>;
        //       })}
        //     </div>
        //   );
      ),
    },
  ];

  const actionsMrm = [
    {
      title: "Action",
      dataIndex: "Action",
      key: "Action",
      width: 100,
      render: (_: any, data: any, index: number) => {
        const buttonStatusAction = data?.mrmData?.mrmPlanData.includes(true);
        // console.log("data in mrm plan", data);
        // if (index === 0) {
        return (
          <>
            {buttonStatusAction && (
              <div style={{ display: "flex", gap: "1px" }}>
                {(isOrgAdmin ||
                  (isMR &&
                    (userDetail?.additionalUnits?.length > 0
                      ? userDetail.additionalUnits?.includes(selectedUnit)
                      : selectedUnit === userDetail.location.id)) ||
                  data?.owner?.some(
                    (owner: any) => owner.id === userDetail.id
                  )) && (
                  <IconButton ref={refForMRMPlan7}>
                    <Tooltip title="Schedule Meeting" placement="bottom">
                      <CreateIcon
                        style={{ height: "18px" }}
                        onClick={() => {
                          handleDrawer(data, "MrmPlan");
                        }}
                      />
                    </Tooltip>
                  </IconButton>
                )}
                {(isOrgAdmin ||
                  (isMR &&
                    userDetail?.additionalUnits.includes(selectedUnit) &&
                    data?.unitId !== "All")) && (
                  <div ref={refForMRMPlan8}>
                    <IconButton>
                      <Tooltip title="Repeat Monthly" placement="bottom">
                        <MdRepeat
                          style={{
                            height: "22px",
                            color: "black",
                          }}
                          onClick={() => handleRepeatIconPress(index)}
                        />
                      </Tooltip>
                    </IconButton>
                  </div>
                )}
              </div>
            )}
          </>
        );
        // }
        // return (
        //   <>
        //     {buttonStatusAction && (
        //       <div style={{ display: "flex", gap: "1px" }}>
        //         {(showData ||
        //           data?.owner?.some(
        //             (owner: any) => owner.id === userDetail.id
        //           )) && (
        //           <div>
        //             <IconButton>
        //               <Tooltip
        //                 title="Create Meeting Schedule"
        //                 placement="bottom"
        //               >
        //                 <CreateIcon
        //                   style={{ height: "18px" }}
        //                   onClick={() => {
        //                     handleDrawer(data, "MrmPlan");
        //                   }}
        //                 />
        //               </Tooltip>
        //             </IconButton>
        //           </div>
        //         )}
        //         {(isOrgAdmin ||
        //           (isMR &&
        //             userDetail.location.id === selectedUnit &&
        //             data?.unitId !== "All")) && (
        //           <div>
        //             <IconButton>
        //               <Tooltip title="Repeat Monthly" placement="bottom">
        //                 <MdRepeat
        //                   style={{
        //                     height: "22px",
        //                     color: "black",
        //                   }}
        //                   onClick={() => handleRepeatIconPress(index)}
        //                 />
        //               </Tooltip>
        //             </IconButton>
        //           </div>
        //         )}
        //       </div>
        //     )}
        //   </>
        // );
      },
    },
  ];
  if (settings && settings.length) {
    if (settings === "Jan - Dec") {
      const newData = monthsColumns.splice(0, 9);
      addMonthyColumns = [
        ...columnsMrm,
        ...monthsColumns,
        ...newData,
        ...actionsMrm,
      ];
    } else {
      addMonthyColumns = [...columnsMrm, ...monthsColumns, ...actionsMrm];
    }
  }

  // const handleTextChange = (e: any) => {
  //   getSuggestionList(e.target.value, "normal");
  // };

  // const getSuggestionList = (value: any, type: string) => {
  //   typeAheadValue = value;
  //   typeAheadType = type;
  //   debouncedSearch();
  // };

  // const debouncedSearch = debounce(() => {
  //   getData(typeAheadValue, typeAheadType);
  // }, 400);

  const getData = async (value: string, type: string) => {
    try {
      const res = await axios.get(
        `api/user/doctype/filterusers/${realmName}/${"allusers"}?email=${value}`
      );
      setSuggestions(res.data);
    } catch (err) {
      // console.log(err);
    }
  };

  const handleChangeParticipants = (data: any, values: any, index: number) => {
    const newData = { ...values };
    if (newData.mrmData) {
      newData.mrmData.participants = [...data];
    }
    const newDataSource = [...dataSource];
    newDataSource[index] = newData;
    setDataSourceMrm(newDataSource);
  };

  useEffect(() => {
    if (!!currentYear && selectedUnit) {
      getKeyAgendaValues(selectedUnit);
    }
  }, [currentYear, selectedUnit, pagePlan, rowsPerPagePlan]);

  const orgdata = async () => {
    const response = await axios.get(`/api/organization/${realmName}`);

    if (response.status === 200 || response.status === 201) {
      setSettings(response?.data?.fiscalYearQuarters);
    }
  };
  // console.log("settings", settings);
  const getUnits = async () => {
    setLoading(true);
    await axios(`/api/mrm/getLocationsForOrg/${realmName}`)
      .then((res) => {
        setUnits(res?.data);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        // console.error(err);
      });
  };
  // console.log("selectedUnit", selectedUnit);
  const getKeyAgendaValues = async (units: any) => {
    try {
      setLoading(true);
      //get api
      // console.log("units inside", units);
      const payload = {
        orgId: orgId,
        unitId: [units.length > 0 ? units : userDetail.locationId],
        // applicationSystemID: [data],
        currentYear: currentYear,
        page: pagePlan,
        limit: rowsPerPagePlan,
      };
      const res = await axios.get("/api/keyagenda/getkeyAgendaMRMByUnit", {
        params: payload,
      });

      if (res.status === 200 || res.status === 201) {
        // console.log("mrmplan data", res.data.result);
        const data = res.data.result;
        const keyAgendaData: any = [];
        data?.map((item: any) => {
          if ("mrmData" in item) {
            keyAgendaData.push(item);
          } else {
            keyAgendaData.push({
              ...item,
              mrmData: {
                participants: [],
                mrmPlanData: [
                  false,
                  false,
                  false,
                  false,
                  false,
                  false,
                  false,
                  false,
                  false,
                  false,
                  false,
                  false,
                ],
              },
            });
          }
        });
        setDataSourceMrm(keyAgendaData);
        setLoading(false);
        setCountPlan(res.data.count);
      }
      // getkeyAgendaMRMByUnit
    } catch (error) {
      // console.log(error);
      setLoading(false);
      // enqueueSnackbar(`!`, {
      //   variant: "error",
      // });
    }
  };

  // const handleCheckBox = (
  //   event: any,
  //   values: any,
  //   index: number,
  //   key: number
  // ) => {
  //   const newObj = { ...values };
  //   if (newObj.mrmData && newObj.mrmData.mrmPlanData) {
  //     newObj.mrmData.mrmPlanData[key] = event?.target?.checked;
  //   }
  //   const newDataSource = [...dataSource];
  //   newDataSource[index] = newObj;
  //   setDataSource(newDataSource);
  // };
  const handleCheckBox = (
    event: any,
    values: any,
    index: number,
    key: number
  ) => {
    setDataSourceMrm((prevDataSource) => {
      const newDataSource = [...prevDataSource];
      const newObj = { ...values };

      if (newObj.mrmData && newObj.mrmData.mrmPlanData) {
        newObj.mrmData.mrmPlanData[key] = event?.target?.checked;
      }

      newDataSource[index] = newObj;
      return newDataSource;
    });
    setSubmitButtonStatus(true);
  };
  const handleRepeatIconPress = (index: any) => {
    setDataSourceMrm((prevDataSource) => {
      const newDataSource = [...prevDataSource];
      const newRow = { ...newDataSource[index] };

      if (newRow.mrmData && newRow.mrmData.mrmPlanData) {
        newRow.mrmData.mrmPlanData = newRow.mrmData.mrmPlanData.map(() => true); // Set all checkboxes to true for this row
      }

      newDataSource[index] = newRow;
      return newDataSource;
    });
    setSubmitButtonStatus(true);
  };

  const handleOk = () => {
    // if (showData) {
    const updateArray: any = [];
    const addArray: any = [];

    const newdataSource = [...dataSourceMrm];
    newdataSource.map((item) => {
      if (item?.mrmData?._id) {
        delete item.mrmData?.keyAgendaId;
        updateArray.push({ ...item.mrmData, fiscalYear: settings });
      } else {
        addArray.push({
          ...item.mrmData,
          keyAgendaId: item?._id,
          unitId: selectedUnit,
          momPlanYear: auditYear,
          organizationId: orgId,
          currentYear: currentYear,
          fiscalYear: settings,
        });
      }
    });

    if (addArray.length) {
      addMRMData(addArray);
    }
    if (updateArray.length) {
      updateMRMData(updateArray);
    }
    // }
    handleCloseModal();
  };

  const addMRMData = async (data: any) => {
    try {
      const res = await axios.post("/api/mrm", data);
      if (res.status === 200 || res.status === 201) {
        enqueueSnackbar(`Data Added Successfully!`, {
          variant: "success",
        });
      }
    } catch (err) {
      // console.log(err);
    }
  };

  const updateMRMData = async (data: any) => {
    try {
      const res = await axios.patch(`/api/mrm`, data);
      if (res.status === 200 || res.status === 201) {
        enqueueSnackbar(`Data Added Successfully!`, {
          variant: "success",
        });
      }
    } catch (err) {
      // console.log(err);
    }
  };

  const handleChangeUnit = (event: React.ChangeEvent<{ value: any }>) => {
    setLocationNameUnit(event.target.value as string);
    setSelectedUnit(event.target.value as string);
    // getKeyAgendaValues(event.target.value);
    // if (selectedSystem && selectedSystem.length) {

    // }
    //  else {
    //   getApplicationSystems(event.target.value);
    // }
  };

  // const handleChangeSystem = (event: any) => {
  //   setSelectedSystem(event.target.value);
  //   // console.log("target value", event.target.value);
  //   // if (selectedSystem && selectedUnit) {
  //   //   getKeyAgendaValues(selectedUnit, selectedSystem);
  //   // }
  // };

  // const getApplicationSystems = async (locationId: any) => {
  //   let encodedSystems = encodeURIComponent(JSON.stringify(locationId));
  //   const { data } = await axios.get(
  //     `api/systems/displaySystemsForGivenLocation/${encodedSystems}`
  //   );
  //   setSystemData([...data]);
  // };

  const handleGetMrmReports = async (val: any) => {
    // console.log("inside handlegetmrmreports");
    getActionPointMeetingById(val?._id).then((response: any) => {
      // console.log("actionpointpdfdata", response.data);
      if (response?.data) {
        setActionPointsPdfData(response?.data);
      } else {
        setActionPointsPdfData([]);
      }
    });

    getMeetingById(val?._id).then((response: any) => {
      setMeetingDataById(response?.data);
    });

    if (meetingDataById && actionPointsPdfData) {
      try {
        const pdfMeetingData = {
          meetingTitle: val?.meetingName,
          meetingDate: val?.meetingdate,
          meetingOwner: val?.createdBy?.username,
          meetingVenue: meetingDataById?.venue,
          participants: val?.participants,
          agenda: val?.agenda,
          externalparticipants: val?.externalparticipants
            ? val?.externalparticipants
            : [],
          minutesOfMeeting: val?.minutesofMeeting,
          status: val?.status === "Save As Draft" ? "DRAFT" : "PUBLISHED",
          actionPointsData: actionPointsPdfData,
        };
        // console.log("action point pdf data", actionPointsPdfData);
        // console.log("action point pdf data", pdfMeetingData);
        const tableRows: any = [];
        pdfMeetingData.agenda?.forEach((agendaItem: any) => {
          // Find corresponding action items for the current agenda item
          // console.log("agendaitem", agendaItem);
          const matchingActionItems: any[] = actionPointsPdfData?.filter(
            (actionItem: any) =>
              actionItem.additionalInfo?.agenda === agendaItem.agenda &&
              actionItem.additionalInfo?.decisionPoint === agendaItem.decision
          );

          // console.log("matchingactionitems", matchingActionItems);
          // If matching action items exist, add them to the table rows
          if (matchingActionItems?.length > 0) {
            matchingActionItems.forEach((actionItem: any) => {
              // Retrieve owner from actionItem
              const owner = actionItem.owner;
              // Construct a table row with agenda, decision, and action item details
              const row = {
                agenda: agendaItem.agenda,
                decisionPoint: agendaItem.decision,
                actionPoint: actionItem.title,
                owner: owner,
                targetDate: actionItem.targetDate,
                status: actionItem.status,
              };
              tableRows.push(row);
            });
          } else {
            // If no matching action items, add a row with only agenda and decision
            // Retrieve owner from pdfMeetingData
            const owner = pdfMeetingData.meetingOwner;
            const row = {
              agenda: agendaItem.agenda,
              decisionPoint: agendaItem.decision,
              actionPoint: "N/A", // or any placeholder you want
              owner: [],
              targetDate: undefined,
              status: undefined,
            };
            tableRows?.push(row);
          }
        });

        const tableHeaderStyle = "color: #003566;";
        const captionstyle = "font-weight:bold;text-align:left";
        const tableBg = "background-color: #D5F5E3;";
        const tableTitles =
          "color: #003566; font-size: 15px !important; font-weight: 900;";
        const headers =
          "text-align: center; margin: auto; font-size: 22px; font-weight: 600; letter-spacing: 0.6px; color: #003566;";
        const consolidated = `<html>
        <head>
          <title>Minutes Of Meeting</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
           <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300&display=swap" rel="stylesheet">
          <style>
            * {
              font-family: 'Poppins', sans-serif;
            }
    
            table {
              border-collapse: collapse;
              width: 100%;
              margin-bottom: 20px;
            }
            td,
            th {
              border: 1px solid black;
              padding: 8px;
              text-align: left;
              font-size: 15px !important;
            },
          </style>
        </head>
        <body>
         <div>
         <table>
         <tr>
           <td style="width: 100px;">
           ${
             logo
               ? `<img src="${logo}" alt="Hindalco Logo" width="100px" height="100px" />`
               : ""
           }
           </td>
           <td colspan="3"  style="${headers}">
             HINDALCO INDUSTRIES LIMITED<br />
             MINUTES OF MEETING
           </td>
         </tr>
         <tr>
           <td colspan="1" style="${tableTitles}>
             <b style="font-size: 15px !important;">  TITLE </b> 
           </td>
           <td colspan="3">${pdfMeetingData?.meetingTitle}</td>
         </tr>
         <tr>
         <td colspan="1" style="${tableTitles}>
           <b style="font-size: 15px !important;">DATE</b>
           </td> <td colspan="1"> ${pdfMeetingData?.meetingDate
             .split("T")[0]
             .split("-")
             .reverse()
             .join("/")}
             </td>
        
         <td colspan="1" style="${tableTitles}>
         <b style="font-size: 15px !important;">MoM Owner </b>
       </td>
      
       <td colspan="1"> ${pdfMeetingData?.meetingOwner}</td>
       
       </tr>
       
       
     <tr>
     <td colspan="1" style="${tableTitles}>
     <b style="font-size: 15px !important;">MoM Status </b>
   </td>
  
   <td colspan="1"> ${pdfMeetingData?.status}</td>
  
   <td colspan="1" style="${tableTitles}>
   <b style="font-size: 15px !important;">MoM Venue </b>
 </td>

 <td colspan="1"> ${pdfMeetingData?.meetingVenue}</td>
 </tr>
     <td colspan="1" style="${tableTitles}>
       <b style="font-size: 15px !important;">Minutes Of Meeting </b>
     </td>
     <td colspan="3"> ${pdfMeetingData?.minutesOfMeeting}</td>
   </tr>

     <tr>
     <td colspan="1" style="${tableTitles}>
       <b style="font-size: 15px !important;"> Internal Attendees </b>
     </td>
     <td colspan="3">
     ${pdfMeetingData?.participants
       .map(
         (participant: any) => `
           
                ${participant.name}
            
        `
       )
       .join(",")}
     </td>
    </tr>
    <tr>
    <td colspan="1" style="${tableTitles}>
      <b style="font-size: 15px !important;"> External Attendees </b>
    </td>
    <td colspan="3">
    ${pdfMeetingData?.externalparticipants
      ?.map(
        (participant: any) => `
    ${participant}
`
      )
      .join(",")}
    </td>
   </tr>
    </table>
  
     <table>
     <caption>Action Points for the Agenda</caption>
     <thead>
      <tr style="${tableBg}">
      <th style="${tableHeaderStyle}">Agenda</th>
      <th style="${tableHeaderStyle}">Decision Point</th>
      <th style="${tableHeaderStyle}">Action Item</th>
      <th style="${tableHeaderStyle}">Action Item Owner</th>
      <th style="${tableHeaderStyle}">Due By</th>
      <th style="${tableHeaderStyle}">Status</th>
      </tr>
      <div>
      </thead>
      <tbody>
      ${tableRows?.map(
        (item: any) => `<tr>
      <td>${item?.agenda}</td>
      <td>${item?.decisionPoint}</td>
      <td>${item?.actionPoint}</td>
      <td>${item?.owner?.map((item: any) => item?.username)}</td>
      <td>
      ${
        item?.targetDate
          ? `${item.targetDate.split("-")[2].split("T")[0]}-${
              item.targetDate.split("-")[1]
            }-${item.targetDate.split("-")[0]}`
          : "N/A"
      }
    </td>
    <td>
      ${item?.status !== undefined ? (item.status ? "Open" : "Closed") : "N/A"}
    </td>
     </tr> `
      )}
      </tbody>
      </div>
   </table>
         </div>
        </body>
      </html>`;
        printJS({
          type: "raw-html",
          printable: consolidated,
        });
      } catch (err) {
        // console.log(err);
      }
    }
  };
  //console.log("meetinunitid", meetingUnitId);

  // help Tours

  const [tourPopoverVisible, setTourPopoverVisible] = useState<boolean>(false);

  const [openTourForMRMPlans, setOpenTourForMRMPlans] =
    useState<boolean>(false);
  const [openTourForMRMSchedule, setOpenTourForMRMSchedule] =
    useState<boolean>(false);
  const [openTourForMeeting, setOpenTourForMeeting] = useState<boolean>(false);
  const [openTourForActionPoint, setOpenTourForActionPoint] =
    useState<boolean>(false);

  const refForMRMPlan1 = useRef(null);
  const refForMRMPlan2 = useRef(null);
  const refForMRMPlan3 = useRef(null);
  const refForMRMPlan4 = useRef(null);
  const refForMRMPlan5 = useRef(null);
  const refForMRMPlan6 = useRef(null);
  const refForMRMPlan7 = useRef(null);
  const refForMRMPlan8 = useRef(null);

  const refForMRMSchedule1 = useRef(null);
  const refForMRMSchedule2 = useRef(null);
  const refForMRMSchedule3 = useRef(null);
  const refForMRMSchedule4 = useRef(null);
  const refForMRMSchedule5 = useRef(null);
  const refForMRMSchedule6 = useRef(null);
  const refForMRMSchedule7 = useRef(null);
  const refForMRMSchedule8 = useRef(null);

  const refForMeeting1 = useRef(null);
  const refForMeeting2 = useRef(null);
  const refForMeeting3 = useRef(null);
  const refForMeeting4 = useRef(null);
  const refForMeeting5 = useRef(null);
  const refForMeeting6 = useRef(null);
  const refForMeeting7 = useRef(null);
  const refForMeeting8 = useRef(null);
  const refForMeeting9 = useRef(null);

  const refForActionPoint1 = useRef(null);
  const refForActionPoint2 = useRef(null);
  const refForActionPoint3 = useRef(null);
  const refForActionPoint4 = useRef(null);
  const refForActionPoint5 = useRef(null);
  const refForActionPoint6 = useRef(null);
  const refForActionPoint7 = useRef(null);
  const refForActionPoint8 = useRef(null);
  const refForActionPoint9 = useRef(null);

  const steps: TourProps["steps"] = [
    {
      title: "MRM Plan",
      description: "All the created MRM plan for your unit can be viewed here",

      target: () => (refForMRMPlan1.current ? refForMRMPlan1.current : null),
    },

    {
      title: "Units",
      description:
        "By default, your unit’s MRM Plan displayed for general user and MCOE can select any unit to view MRM plan",
      target: () => refForMRMPlan2.current,
    },
    {
      title: "System",
      description:
        "Select the systems to view the list of MRM plans associated with the selected system",
      target: () => refForMRMPlan3.current,
    },
    {
      title: "Year",
      description:
        "By default , this view will show the MRM plans created in the current year . Click on this link < to see prior year plans. Use > to move back to the current year",

      target: () => (refForMRMPlan4.current ? refForMRMPlan4.current : null),
    },
    {
      title: "Meeting Type",
      description:
        "All the documents (yet to publish) under workflow can be viewed here ",
      target: () => refForMRMPlan5.current,
    },
    {
      title: "Owners",
      description:
        "All the documents for reference can be viewed here. (Can be created only MCOE)",
      target: () => refForMRMPlan6.current,
    },
    ...(isOrgAdmin || isMR || owner
      ? [
          {
            title: "Create Meeting Schedule",
            description: "Click on add icon to add MRM schedule for a MRM plan",
            target: () => refForMRMPlan7.current,
          },
        ]
      : []),

    ...(isOrgAdmin ||
    (isMR &&
      userDetail?.additionalUnits.includes(selectedUnit) &&
      unitId !== "All")
      ? [
          {
            title: "Repete",
            description: "Click on this icon to repeat the plan monthly",
            target: () => refForMRMPlan8.current,
          },
        ]
      : []),
  ];
  // const acc = dataSource.access;
  // for (let i = 0; i < acc?.length; i++) {
  //   let value = acc[i];
  //   value.key = i;
  // }

  const stepsForSchedule: TourProps["steps"] = [
    {
      title: "MRM Schedule",
      description:
        "All the created MRM schedule for your unit can be viewed here",

      target: () =>
        refForMRMSchedule1.current ? refForMRMSchedule1.current : null,
    },

    {
      title: "Units",
      description:
        "By default, your unit’s MRM Plan displayed for general user and MCOE can select any unit to view MRM plan",
      target: () => refForMRMSchedule2.current,
    },
    {
      title: "Year",
      description:
        "By default , this view will show the MRM plans created in the current year . Click on this link < to see prior year plans. Use > to move back to the current year ",
      target: () => refForMRMSchedule3.current,
    },
    {
      title: "MRM Title",
      description: "Click on the hyperlink to view MRM schedule details ",

      target: () =>
        refForMRMSchedule4.current ? refForMRMSchedule4.current : null,
    },
    // ...(status === "Save As Draft" ? [ {
    //   title: "icon",
    //   description:
    //     "This icon indicates that MRM schedule is in draft ",
    //   target: () => refForMRMSchedule5.current,
    // }]:[]),

    {
      title: "Create MoM",
      description: "Create Minutes for the selected Meeting",
      target: () => refForMRMSchedule6.current,
    },

    ...(isOrgAdmin ||
    (isMR &&
      (userDetail?.additionalUnits?.length > 0
        ? userDetail?.additionalUnits.includes(selectedUnit)
        : selectedUnit === userDetail?.location?.id) &&
      unitId !== "All")
      ? [
          {
            title: "Edit",
            description:
              "Click on edit icon to edit MRM schedule created by you",
            target: () => refForMRMSchedule7.current,
          },
        ]
      : []),

    ...(isOrgAdmin
      ? [
          {
            title: "Delete",
            description:
              "Click on delete icon to delete MRM schedule created by you",
            target: () => refForMRMSchedule8.current,
          },
        ]
      : []),
  ];

  const stepsForMeeting: TourProps["steps"] = [
    {
      title: "Minutes Of Meeting",
      description: "All the added MoMs for your unit are displayed here",

      target: () => (refForMeeting1.current ? refForMeeting1.current : null),
    },

    {
      title: "Units",
      description:
        "Select your unit (by default) and your unit’s MoM can be viewed",
      target: () => refForMeeting2.current,
    },
    {
      title: "Year",
      description:
        "By default , this view will show theMoMs created in the current year . Click on this link < to see prior year MoMs. Use > to move back to the current year ",
      target: () => refForMeeting3.current,
    },
    {
      title: "Minutes Of Meeting",
      description: "MoM information can be viewed by clicking on the hyperlink",

      target: () => (refForMeeting4.current ? refForMeeting4.current : null),
    },
    ...(isOrgAdmin ||
    (isMR &&
      (userDetail?.additionalUnits?.length > 0
        ? userDetail?.additionalUnits.includes(meetingUnitId)
        : meetingUnitId === userDetail?.location?.id) &&
      unitId !== "All")
      ? [
          {
            title: "Edit MoM",
            description: "Click on edit icon to edit MoM created by you",
            target: () => refForMeeting5.current,
          },
        ]
      : []),

    ...(isOrgAdmin
      ? [
          {
            title: "Delete",
            description: "Click on delete icon to delete MoM created by you",
            target: () => refForMeeting6.current,
          },
        ]
      : []),
    ...(isOrgAdmin ||
    (isMR &&
      (userDetail?.additionalUnits?.length > 0
        ? userDetail?.additionalUnits?.includes(meetingUnitId)
        : meetingUnitId === userDetail?.location?.id))
      ? [
          {
            title: "Send Mail",
            description: "Click on this icon to send MoM to the participants",
            target: () => refForMeeting7.current,
          },
        ]
      : []),
    ...(isOrgAdmin ||
    (isMR &&
      (userDetail?.additionalUnits?.length > 0
        ? userDetail?.additionalUnits?.includes(meetingUnitId)
        : meetingUnitId === userDetail?.location?.id))
      ? [
          {
            title: "Add Action Point",
            description: "Click on add icon to add action points",
            target: () => refForMeeting8.current,
          },
        ]
      : []),

    ...(isOrgAdmin ||
    (isMR &&
      (userDetail?.additionalUnits?.length > 0
        ? userDetail.additonalUnits?.includes(meetingUnitId)
        : meetingUnitId === userDetail?.location?.id))
      ? [
          {
            title: "PDF",
            description: "Click on this icon ",
            target: () => refForMeeting9.current,
          },
        ]
      : []),
  ];

  const stepsForActionPoint: TourProps["steps"] = [
    {
      title: "Action Points",
      description:
        "All the added action items for your unit can be viewed here",

      target: () =>
        refForActionPoint1.current ? refForActionPoint1.current : null,
    },

    {
      title: "Units",
      description:
        "Select your unit (by default) and your unit’s action items can be viewed",
      target: () => refForActionPoint2.current,
    },
    {
      title: "Year",
      description:
        "By default , this view will show the action items created in the current year . Click on this link < to see prior year action items. Use > to move back to the current year",
      target: () => refForActionPoint3.current,
    },
    {
      title: "My Action Points Icon",
      description: "Click on this icon to view only your action items",

      target: () =>
        refForActionPoint4.current ? refForActionPoint4.current : null,
    },
    {
      title: "Action Items",
      description: "Click on the hyperlink to view the action items",
      target: () => refForActionPoint5.current,
    },
    {
      title: "Edit",
      description: "Click on edit icon to edit your action items ",
      target: () => refForActionPoint6.current,
    },
    ...(isOrgAdmin
      ? [
          {
            title: "Delete",
            description: "Click on delete icon to delete your action items",
            target: () => refForActionPoint7.current,
          },
        ]
      : []),
  ];

  // for mobile tab select design

  const [selectedValue, setSelectedValue] = useState("Schedule");
  // console.log("selectedValue", selectedValue);
  const handleDataChange = (e: any) => {
    setSelectedValue(e.target.value);
  };

  // mobile view filter moda.

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal2 = () => {
    setIsModalOpen(true);
  };

  const handleOkModal = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div
        className={classes.root}
        style={{
          display: "flex",
          width: "100%",
          height: "100vh",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Sidebar */}
        <MRMSideNav
          value={value}
          setValue={setValue}
          collapseLevel={collapseLevel}
          isSettingsAccess={true}
          onSettingsClick={handleSettingsClick}
        />

        {/* Collapse Button */}
        <div
          style={{
            position: "absolute",
            top: 4,
            left: collapseLevel === 2 ? 0 : collapseLevel === 1 ? 60 : 88,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            gap: "12px",
            paddingLeft: "8px",
            transition: "left 0.3s ease",
          }}
        >
          <div
            style={{
              width: 55,
              height: 55,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            onClick={() => setCollapseLevel((prev) => (prev + 1) % 3)}
          >
            {collapseLevel === 2 ? (
              <RiSidebarUnfoldLine size={24} />
            ) : (
              <RiSidebarFoldLine size={24} />
            )}
          </div>
          <Title level={3} style={{ fontWeight: 600, margin: 0 }}>
            {tabOptions.find((tab: any) => tab.key === value)?.label || ""}
          </Title>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, overflow: "auto", padding: "0px 16px" }}>
          <Box
            sx={{
              width: "100%",
              bgcolor: "background.paper",
              marginTop: matches ? "10px" : "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {matches && (
              <>
                <div style={{ marginLeft: "auto" }}>
                  <ModuleHeader
                    moduleName="Management Review Meeting"
                    createHandler={
                      value === 2 || value === 5 || value === 1
                        ? false
                        : createHandler
                    }
                    configHandler={configHandler}
                    filterHandler={false}
                    showSideNav={true}
                  />
                </div>
              </>
            )}
            {matches ? (
              ""
            ) : (
              <FormControl
                variant="outlined"
                size="small"
                fullWidth
                //  className={classes.formControl}
                style={{
                  width: "220px",
                  marginLeft: "10px",
                  // marginTop: "10px",
                  // display: "flex",
                  // justifyContent: "center",
                }}
              >
                <InputLabel>Menu List</InputLabel>
                <Select
                  label="Menu List"
                  value={selectedValue}
                  onChange={handleDataChange}
                >
                  <MenuItem value={"Schedule"}>
                    <div
                      style={{
                        backgroundColor:
                          selectedValue === "Schedule" ? "#3576BA" : "white",
                        textAlign: "center",
                        padding: "0px 10px",
                        borderRadius: "5px",
                        color: selectedValue === "Schedule" ? "white" : "black",
                      }}
                    >
                      <div
                        onClick={() => {
                          setFilter("mydocuments");
                          setSearchValue("");
                          setValue(0);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "4px 10px",
                          cursor: "pointer",
                          borderRadius: "5px",
                          position: "relative",
                          backgroundColor: value === 0 ? "#3576BA" : "",
                        }}
                        ref={refForMRMSchedule1}
                      >
                        {/* <MRMLogo
                      className={classes.docNavIconStyle}
                      fill={
                        value === 0 || selectedValue === "Schedule"
                          ? "white"
                          : "none"
                      }
                    /> */}
                        <span
                          className={`${classes.docNavText} ${
                            value === 0 ? classes.selectedTab : ""
                          }`}
                          style={{
                            marginLeft: "8px",
                            color:
                              value === 0 || selectedValue === "Schedule"
                                ? "white"
                                : "black",
                          }}
                        >
                          MRM Schedule
                        </span>
                        {value === 0 && (
                          <SelectedTabArrow
                            style={{
                              position: "absolute",
                              bottom: -13,
                              left: "53%",
                              transform: "translateX(-50%)",
                              width: 13,
                              height: 11,
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </MenuItem>
                  <MenuItem value={"Meeting"}>
                    {" "}
                    <div
                      style={{
                        backgroundColor:
                          selectedValue === "Meeting" ? "#3576BA" : "white",
                        textAlign: "center",
                        padding: "0px 10px",
                        borderRadius: "5px",
                        color: selectedValue === "Meeting" ? "white" : "black",
                      }}
                    >
                      <div
                        onClick={() => setValue(1)} // You can add the onClick logic here
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "4px 10px",
                          cursor: "pointer",
                          borderRadius: "5px",
                          position: "relative",
                          backgroundColor: value === 1 ? "#3576BA" : "",
                        }}
                        ref={refForMeeting1}
                      >
                        {/* <KeyAgendaIcon
                      className={classes.docNavIconStyle}
                      stroke={value === 1 ? "white" : ""}
                    /> */}
                        <span
                          className={`${classes.docNavText} ${
                            value === 1 ? classes.selectedTab : ""
                          }`}
                          style={{
                            marginLeft: "5px",
                            color: value === 1 ? "white" : "black",
                          }}
                        >
                          Minutes Of Meeting
                        </span>
                        {value === 1 && (
                          <SelectedTabArrow
                            style={{
                              position: "absolute",
                              bottom: -13,
                              left: "53%",
                              transform: "translateX(-50%)",
                              width: 13,
                              height: 11,
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </MenuItem>
                  <MenuItem value={"Action"}>
                    <div
                      style={{
                        backgroundColor:
                          selectedValue === "Action" ? "#3576BA" : "white",
                        textAlign: "center",
                        padding: "0px 10px",
                        borderRadius: "5px",
                        color: selectedValue === "Action" ? "white" : "black",
                      }}
                    >
                      <div
                        onClick={() => {
                          setFilter("myDistributedDocuments");
                          setSearchValue("");
                          setValue(2);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "4px 10px",
                          cursor: "pointer",
                          borderRadius: "5px",
                          position: "relative",
                          backgroundColor: value === 2 ? "#3576BA" : "",
                        }}
                        ref={refForActionPoint1}
                      >
                        <span
                          className={`${classes.docNavText} ${
                            value === 2 ? classes.selectedTab : ""
                          }`}
                          style={{
                            marginLeft: "5px",
                            color: value === 2 ? "white" : "black",
                          }}
                        >
                          Action Points
                        </span>
                        {value === 2 && (
                          <SelectedTabArrow
                            style={{
                              position: "absolute",
                              bottom: -13,
                              left: "53%",
                              transform: "translateX(-50%)",
                              width: 13,
                              height: 11,
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </MenuItem>
                </Select>
              </FormControl>
            )}
            {matches ? (
              ""
            ) : (
              <div
                style={{
                  marginRight: "10px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {value === 1 ? (
                  <IconButton
                    onClick={() => {
                      setOpenMeeting(!openMeeting);
                    }}
                    style={{ padding: "6px" }}
                  >
                    {openMeeting ? (
                      <MdPermContactCalendar
                        style={{
                          color: "rgb(53, 118, 186)",
                          height: "31px",
                          width: "30px",
                        }}
                      />
                    ) : (
                      <MdOutlinePermContactCalendar
                        style={{ color: "#444", height: "31px", width: "30px" }}
                      />
                    )}
                  </IconButton>
                ) : (
                  ""
                )}

                {value === 2 ? (
                  <IconButton
                    onClick={() => {
                      setOpenAction(!openAction);
                    }}
                  >
                    {openAction ? (
                      <MdPermContactCalendar
                        style={{
                          color: "rgb(53, 118, 186)",
                          height: "31px",
                          width: "30px",
                        }}
                      />
                    ) : (
                      <MdOutlinePermContactCalendar
                        style={{ color: "#444", height: "31px", width: "30px" }}
                      />
                    )}
                  </IconButton>
                ) : (
                  ""
                )}

                <FilterIcon
                  style={{ width: "24px", height: "24px" }}
                  onClick={showModal2}
                />
              </div>
            )}
          </Box>

          <div className={classes.calenderView}>
            {value === 0 && (
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                  // marginTop: "1%",
                  justifyContent: "space-between",
                }}
              >
                {matches ? (
                  <>
                    <Grid item xs={12} md={6}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          gap: "16px",
                        }}
                      >
                        <FormControl
                          variant="outlined"
                          style={{ flex: 1, width: "250px" }}
                        >
                          <div
                            style={{ width: "100%" }}
                            ref={refForMRMSchedule2}
                          >
                            <Autocomplete
                              disablePortal
                              id="combo-box-demo"
                              options={[allOption, ...locationOptions]}
                              onChange={handleLocation}
                              value={getSelectedItem()}
                              getOptionLabel={(option) =>
                                option.locationName || ""
                              }
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  variant="outlined"
                                  size="small"
                                  label="Unit"
                                  fullWidth
                                />
                              )}
                            />
                          </div>
                        </FormControl>
                        <FormControl
                          variant="outlined"
                          style={{ flex: 1, width: "300px" }}
                        >
                          <div style={{ width: "100%" }}>
                            {/* <Autocomplete
                              disablePortal
                              id="combo-box-demo"
                              options={[allDeptOption, ...deptOptions]}
                              onChange={handleDepartment}
                              value={getDeptSelectedItem()}
                              getOptionLabel={(option) =>
                                option.entityName || ""
                              }
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  variant="outlined"
                                  size="small"
                                  label="Entity"
                                  fullWidth
                                />
                              )}
                            /> */}
                            <DepartmentSelector
                              locationId={unitId}
                              selectedDepartment={selectedDept}
                              onSelect={(dept, type) => {
                                setSelectedDept({ ...dept, type }),
                                  setDeptId(dept?.id);
                              }}
                              onClear={() => setSelectedDept(null)}
                            />
                          </div>
                        </FormControl>
                        <div ref={refForMRMSchedule3}>
                          <YearComponent
                            currentYear={currentYear}
                            setCurrentYear={setCurrentYear}
                          />
                        </div>
                      </div>
                    </Grid>
                  </>
                ) : (
                  ""
                )}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "end",
                  }}
                >
                  {/* <Paper
                    style={{
                      width: "285px",
                      // height: "33px",
                      float: "right",
                      margin: "11px",
                      // borderRadius: "20px",
                      border: "1px solid #dadada",
                      overflow: "hidden",
                    }}
                    component="form"
                    data-testid="search-field-container"
                    elevation={0}
                    variant="outlined"
                    className={classes.root}
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleCheck("mrm");
                    }}
                  > */}
                  <Input
                    size="small"
                    style={{
                      // marginRight: "20px",
                      borderRadius: 50,
                      padding: "8px 12px",
                      border: "2px solid #d1d5db",
                      width: 320,
                    }}
                    allowClear
                    value={searchValue}
                    placeholder="Search Schedule"
                    onChange={handleSearchChange}
                    prefix={<AiOutlineSearch size={18} />}
                    suffix={
                      <AiOutlineSend
                        size={18}
                        onClick={() => handleSearchChange}
                      />
                    }
                  />
                  {/* </Paper> */}
                </div>
              </div>
            )}
          </div>

          <Modal
            title={
              <div
                style={{
                  backgroundColor: "#E8F3F9",
                  padding: "8px",
                  borderTopLeftRadius: "8px",
                  borderTopRightRadius: "8px",
                }}
              >
                Filter By
              </div>
            }
            open={isModalOpen}
            onOk={handleOkModal}
            onCancel={handleCancel}
            className={classes.modal}
            footer={null}
            closeIcon={
              <img
                src={CloseIconImageSvg}
                alt="close-drawer"
                style={{
                  width: "30px",
                  height: "30px",
                  cursor: "pointer",
                  padding: "0px",
                  marginTop: "-12px",
                }}
              />
            }
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: "20px",
                // marginTop: "20px",
                border: "1px solid rgba(19, 171, 155, 0.5)",
                borderRadius: "12px",
                padding: "20px",
                margin: "20px 20px 10px 20px",
              }}
              // className={classes.SearchBox}
            >
              <FormControl variant="outlined">
                <div style={{ width: "240px" }}>
                  <Autocomplete
                    disablePortal
                    id="combo-box-demo"
                    options={[allOption, ...locationOptions]}
                    onChange={handleLocation}
                    value={getSelectedItem()}
                    getOptionLabel={(option) => option.locationName || ""}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        size="small"
                        label="Unit"
                        fullWidth
                      />
                    )}
                  />
                </div>
              </FormControl>
              <FormControl
                variant="outlined"
                style={{ flex: 1, width: "300px" }}
              >
                <div style={{ width: "100%" }}>
                  <Autocomplete
                    disablePortal
                    id="combo-box-demo"
                    options={[allDeptOption, ...meetingDeptOptions]}
                    onChange={handleDepartment}
                    value={getDeptSelectedItem()}
                    getOptionLabel={(option) => option.entityName || ""}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        size="small"
                        label="Entity"
                        fullWidth
                      />
                    )}
                  />
                </div>
              </FormControl>
              <div
                style={{
                  width: "240px",
                  display: "flex",
                  justifyContent: "start",
                  padding: "0px",
                  margin: "0px",
                }}
              >
                <YearComponent
                  currentYear={currentYear}
                  setCurrentYear={setCurrentYear}
                />
              </div>
            </div>
          </Modal>

          {!value && !viewCalendar && (
            <div className={matches ? classes.tableContainer : ""}>
              {matches ? (
                <Table
                  className={classes.documentTable}
                  rowClassName={() => "editable-row"}
                  bordered
                  dataSource={dataSource}
                  columns={columns}
                  pagination={false}
                  expandable={{
                    rowExpandable: (record) => record?.meetingData?.length,
                    expandedRowRender: (record) =>
                      record.meetingData && record.meetingData.length > 0 ? (
                        <Table
                          className={classes.subTableContainer}
                          style={{ width: 800 }}
                          columns={subColumns}
                          bordered
                          dataSource={record.meetingData}
                          pagination={false}
                        />
                      ) : null,
                    expandIcon: ({ expanded, onExpand, record }) =>
                      record.meetingData && record.meetingData.length > 0 ? (
                        expanded ? (
                          <AiOutlineMinusCircle
                            style={{ color: "#1777FF", fontSize: "12px" }}
                            onClick={(e: any) => onExpand(record, e)}
                          />
                        ) : (
                          <AiOutlinePlusCircle
                            style={{ color: "#1777FF", fontSize: "12px" }}
                            onClick={(e: any) => onExpand(record, e)}
                          />
                        )
                      ) : null,
                  }}
                />
              ) : (
                <>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "space-evenly",
                      marginBottom: "30px",
                      // height: "100vh",
                      // overflowY: "scroll",
                    }}
                  >
                    {dataSource?.map((data: any) => (
                      <div
                        style={{
                          border: "1px solid black",
                          borderRadius: "5px",
                          padding: "5px",
                          margin: "10px",
                          width: smallScreen ? "45%" : "100%",
                        }}
                      >
                        <p
                          onClick={() => {
                            setMode("Edit");
                            handleDrawer(data, "ReadOnly");
                            setStatusMode("edit");
                          }}
                          style={{
                            padding: "3px 10px",
                            backgroundColor: "#9FBFDF",
                            borderRadius: "2px",
                            cursor: "pointer",
                          }}
                        >
                          {data?.value?.meetingName}
                        </p>
                        <p>Owner : {data?.userName || ""}</p>
                        <p>
                          Scheduled Dates and Time :
                          <div>
                            {data?.value?.date &&
                              data?.value?.date.map(
                                (dateObj: any, index: any) => {
                                  const { date, from, to } = dateObj;
                                  const formattedDate = date
                                    ? moment(date).format("DD/MM/YYYY")
                                    : "";
                                  const formattedFrom = from ? from : "";
                                  const formattedTo = to ? to : "";
                                  return (
                                    <div key={index}>
                                      {`${formattedDate} ${formattedFrom}-${formattedTo}`}
                                    </div>
                                  );
                                }
                              )}
                          </div>
                        </p>
                        {data?.meetingData.length > 0 ? (
                          <Accordion className={classes.headingRoot}>
                            <AccordionSummary
                              expandIcon={
                                <MdExpandMore style={{ padding: "3px" }} />
                              }
                              aria-controls="panel1a-content"
                              id="panel1a-header"
                              className={classes.summaryRoot}
                              style={{ margin: "0px", height: "10px" }}
                            >
                              Action Items
                            </AccordionSummary>
                            <AccordionDetails
                              className={classes.headingRoot}
                              style={{
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              {data?.meetingData?.map((datas: any) => (
                                <div>
                                  <p
                                    onClick={() => {
                                      handleEditDrawerOpen(datas, "ReadOnly");
                                    }}
                                    style={{
                                      textDecorationLine: "underline",
                                      cursor: "pointer",
                                      margin: "5px 3px",
                                    }}
                                  >
                                    {datas?.meetingName}
                                  </p>
                                </div>
                              ))}
                            </AccordionDetails>
                          </Accordion>
                        ) : (
                          ""
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className={classes.pagination}>
                <Pagination
                  size="small"
                  current={pageMrm}
                  pageSize={pageLimitMrm}
                  total={count}
                  showTotal={showTotal}
                  showSizeChanger
                  showQuickJumper
                  onChange={(page, pageSize) => {
                    handlePagination(page, pageSize);
                  }}
                />
              </div>
            </div>
          )}

          {value === 2 && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                  marginTop: "30px",
                }}
              >
                {matches ? (
                  <>
                    <Grid item xs={12} md={6}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          gap: "16px",
                        }}
                      >
                        <FormControl
                          variant="outlined"
                          size="small"
                          style={{ flex: 1, width: "300px" }}
                        >
                          <div
                            className={classes.locSearchBox}
                            ref={refForActionPoint2}
                          >
                            <Autocomplete
                              disablePortal
                              id="combo-box-demo"
                              options={[allOption, ...locationOptions]}
                              onChange={handleActionLocation}
                              value={getSelectedActionItem()}
                              getOptionLabel={(option) =>
                                option.locationName || ""
                              }
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  variant="outlined"
                                  size="small"
                                  label="Unit"
                                  fullWidth
                                />
                              )}
                            />
                          </div>
                        </FormControl>
                        <FormControl
                          variant="outlined"
                          style={{ flex: 1, width: "300px" }}
                        >
                          <div style={{ width: "100%" }}>
                            {/* <Autocomplete
                              disablePortal
                              id="combo-box-demo"
                              options={[
                                allDeptOption,
                                ...actionPointDeptOptions,
                              ]}
                              onChange={handleActionDepartment}
                              value={getActionDeptSelectedItem()}
                              getOptionLabel={(option) =>
                                option.entityName || ""
                              }
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  variant="outlined"
                                  size="small"
                                  label="Entity"
                                  fullWidth
                                />
                              )}
                            /> */}
                            <DepartmentSelector
                              locationId={actionUnitId}
                              selectedDepartment={selectedActionDept}
                              onSelect={(dept, type) => {
                                setSelectedActionDept({ ...dept, type }),
                                  setActionEntityId(dept?.id);
                              }}
                              onClear={() => setSelectedActionDept(null)}
                            />
                          </div>
                        </FormControl>
                        <div ref={refForActionPoint3}>
                          <YearComponent
                            currentYear={currentYear}
                            setCurrentYear={setCurrentYear}
                          />
                        </div>
                      </div>
                    </Grid>
                  </>
                ) : (
                  ""
                )}

                <div
                  className={classes.root}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "end",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "end",
                      marginRight: "10px",
                    }}
                    ref={refForActionPoint4}
                  >
                    {matches ? (
                      <div style={{ padding: "0px" }}>
                        <Tooltip title="My Action Items">
                          <Button
                            onClick={() => {
                              setOpenAction(!openAction);
                            }}
                            //  ref={refForcapa5}
                            style={{
                              padding: "5px 10px",
                              backgroundColor: openAction
                                ? "rgb(53, 118, 186)"
                                : "#f5f5f5",
                              color: openAction ? "white" : "#444",
                              border: "1px solid #ccc",
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                            }}
                          >
                            <AiOutlineUsergroupAdd />
                            My Action Items
                          </Button>
                        </Tooltip>
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                  {/* <Paper
                    style={{
                      width: "285px",
                      // height: "33px",
                      float: "right",
                      margin: "11px",
                      // borderRadius: "20px",
                      border: "1px solid #dadada",
                      overflow: "hidden",
                    }}
                    component="form"
                    data-testid="search-field-container"
                    elevation={0}
                    variant="outlined"
                    className={classes.root}
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleActionPointSearch(searchActionPointValue);
                    }}
                  > */}
                  <Tooltip title="Search on agenda,decison,meeting name,target date as DD/MM/YYYY">
                    <Input
                      size="small"
                      style={{
                        marginRight: "0px",
                        borderRadius: 50,
                        padding: "8px 12px",
                        border: "2px solid #d1d5db",
                        width: 320,
                      }}
                      allowClear
                      value={searchActionPointValue}
                      placeholder="Search Action points"
                      onChange={
                        // Check if the input has been cleared
                        handleActionPointSearchChange
                      }
                      prefix={<AiOutlineSearch size={18} />}
                      suffix={
                        <AiOutlineSend
                          size={18}
                          onClick={() => handleActionPointSearchChange}
                        />
                      }
                    />
                  </Tooltip>
                  {/* </Paper> */}
                </div>
              </div>
              <div className={matches ? classes.tableContainer : ""}>
                {matches ? (
                  <Table
                    className={classes.documentTable}
                    rowClassName={() => "editable-row"}
                    bordered
                    dataSource={actionPointDataSource}
                    columns={actionPointColumns}
                    pagination={false}
                  />
                ) : (
                  <>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "space-evenly",
                        marginBottom: "30px",
                        // height: "100vh",
                        // overflowY: "scroll",
                      }}
                    >
                      {actionPointDataSource?.map((data: any) => (
                        <div
                          style={{
                            border: "1px solid black",
                            borderRadius: "5px",
                            padding: "5px",
                            margin: "10px",
                            width: smallScreen ? "45%" : "100%",
                          }}
                        >
                          <p
                            onClick={() => {
                              handlerActionEditOpen(data, "ReadOnly");
                            }}
                            style={{
                              padding: "3px 10px",
                              backgroundColor: "#9FBFDF",
                              borderRadius: "2px",
                              cursor: "pointer",
                            }}
                          >
                            {data?.title}
                          </p>
                          <p>
                            MRM Meeting Name :{" "}
                            {data.additionalInfo?.meetingName}
                          </p>
                          <p>
                            Responsible Person :
                            <div>
                              {data?.owner &&
                                data?.owner?.length &&
                                data?.owner?.map((item: any, index: number) => (
                                  <React.Fragment key={index}>
                                    {item?.username || ""}
                                    {index < data?.owner?.length - 1 && ", "}
                                  </React.Fragment>
                                ))}
                            </div>
                          </p>
                          <p>Status : {data?.status ? "Open" : "Close"} </p>
                          <p>
                            Due Date :{" "}
                            <>{moment(data?.targetDate).format("DD-MM-YYYY")}</>{" "}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
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
            </div>
          )}

          {value === 5 && matches && (
            <div style={{ marginTop: "20px" }}>
              <div
                style={{
                  display: "flex",
                  paddingTop: "10px",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex" }}>
                  <div ref={refForMRMPlan2}>
                    <FormControl
                      variant="outlined"
                      className={classes.formControl}
                      size="small"
                    >
                      <InputLabel id="demo-simple-select-outlined-label">
                        Units
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-outlined-label"
                        id="demo-simple-select-outlined"
                        value={selectedUnit}
                        onChange={handleChangeUnit}
                        label="Unit"
                        style={{ width: "250px" }}
                      >
                        {units &&
                          units.length &&
                          units.map((data: any) => {
                            return (
                              <MenuItem value={data?.id} key={data?.id}>
                                {data?.locationName}
                              </MenuItem>
                            );
                          })}
                      </Select>
                    </FormControl>
                  </div>

                  <div
                    style={{ display: "flex", justifyContent: "center" }}
                  ></div>
                </div>

                {submitButtonStatus && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      paddingRight: "20px",
                      paddingTop: "10px",
                    }}
                  >
                    <Button
                      style={{
                        backgroundColor: "rgb(0, 48, 89)",
                        color: "#fff",
                      }}
                      onClick={() => {
                        handleOk();
                      }}
                    >
                      Submit
                    </Button>
                  </div>
                )}
              </div>
              <div style={{ height: "100%", overflowY: "scroll" }}>
                <div
                  className={classes.tableContainer}
                  style={{ paddingBottom: "40px" }}
                >
                  <Table
                    bordered
                    dataSource={dataSourceMrm}
                    columns={addMonthyColumns}
                    pagination={false}
                    className={classes.documentTable}
                    rowClassName={() => "editable-row"}
                  />
                </div>
                <div className={classes.pagination}>
                  <Pagination
                    size="small"
                    current={pagePlan}
                    pageSize={rowsPerPagePlan}
                    total={countPlan}
                    showTotal={showTotalPlan}
                    showSizeChanger
                    showQuickJumper
                    onChange={(page, pageSize) => {
                      handlePaginationPlan(page, pageSize);
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {openModal?.open && (
            <MrmModal
              openModal={openModal}
              handleCloseModal={handleCloseModal}
            />
          )}
          {openScheduleDrawer && (
            <ScheduleDrawer
              openScheduleDrawer={openScheduleDrawer}
              setOpenScheduleDrawer={setOpenScheduleDrawer}
              expandDataValues={expandDataValues}
              handleDrawer={handleDrawer}
              mode={mode}
              mrm={true}
              scheduleData={scheduleData}
              unitSystemData={unitSystemData}
              mrmEditOptions={mrmEditOptions}
              status={statusMode}
              setStatusMode={setStatusMode}
              setValue={setValue}
            />
          )}
          {openActionPointDrawer.open && (
            <ActionPoint
              openActionPointDrawer={openActionPointDrawer}
              setOpenActionPointDrawer={setOpenActionPointDrawer}
              handleCloseActionPoint={handleCloseActionPoint}
            />
          )}

          {openActionPointEditDrawer?.open && (
            // <EditActionPoint
            //   openActionPointEditDrawer={openActionPointEditDrawer}
            //   setOpenActionPointEditDrawer={setOpenActionPointEditDrawer}
            //   handleCloseActionPoint={handleCloseActionPoint}
            // />
            <></>
          )}

          {viewCalendar && !value && (
            <div className={classes.tableContainer}>
              <CalendarMRM
                events={calendarData}
                toggleCalendarModal={toggleCalendarModal}
                calendarFor="MRM"
              />
              <CalendarModal
                calendarData={calendarData}
                calendarModalInfo={calendarModalInfo}
                toggleCalendarModal={toggleCalendarModal}
              />
            </div>
          )}
          {value === 1 && (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                  marginTop: "30px",
                }}
              >
                {matches ? (
                  <>
                    <Grid item xs={12} md={6}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          gap: "16px",
                        }}
                      >
                        <FormControl
                          variant="outlined"
                          size="small"
                          style={{ flex: 1, width: "300px" }}
                        >
                          <div style={{ width: "100%" }} ref={refForMeeting2}>
                            <Autocomplete
                              disablePortal
                              id="combo-box-demo"
                              options={[allOption, ...locationOptions]}
                              onChange={handleMeetingLocation}
                              value={getSelectedMeetingItem()}
                              getOptionLabel={(option) =>
                                option.locationName || ""
                              }
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  variant="outlined"
                                  size="small"
                                  label="Unit"
                                  fullWidth
                                />
                              )}
                            />
                          </div>
                        </FormControl>
                        <FormControl
                          variant="outlined"
                          style={{ flex: 1, width: "300px" }}
                        >
                          <div style={{ width: "100%" }}>
                            {/* <Autocomplete
                              disablePortal
                              id="combo-box-demo"
                              options={[allDeptOption, ...meetingDeptOptions]}
                              onChange={handleMeetingDepartment}
                              value={getMeetingDeptSelectedItem()}
                              getOptionLabel={(option) =>
                                option.entityName || ""
                              }
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  variant="outlined"
                                  size="small"
                                  label="Entity"
                                  fullWidth
                                />
                              )}
                            /> */}
                            <DepartmentSelector
                              locationId={meetingUnitId}
                              selectedDepartment={selectedMeetingDept}
                              onSelect={(dept, type) => {
                                setSelectedMeetingDept({ ...dept, type }),
                                  setMeetingEntityId(dept?.id);
                              }}
                              onClear={() => setSelectedMeetingDept(null)}
                            />
                          </div>
                        </FormControl>
                        <div ref={refForMeeting3}>
                          <YearComponent
                            currentYear={currentYear}
                            setCurrentYear={setCurrentYear}
                          />
                        </div>
                      </div>
                    </Grid>
                    {/* <Grid item xs={6} md={3}> */}

                    {/* </Grid> */}
                  </>
                ) : (
                  ""
                )}

                <div
                  className={classes.root}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "end",
                  }}
                >
                  <div
                    style={{
                      marginLeft: "auto",
                      paddingRight: matches ? "10px" : "0px",
                    }}
                  >
                    {/* Pushes Segmented to the right */}
                    <Segmented
                      style={{
                        backgroundColor: "#ffffff",
                        borderRadius: 8,
                        border: "2px solid black",
                        fontSize: matches ? "12px" : "8px",
                        color: "black",
                        // width: "200px",
                      }} // Add blue border here
                      defaultValue="All"
                      value={currentStateNew}
                      options={[
                        "As Meeting Owner",
                        "As Participant",
                        "As Agenda Owner",
                        "All",
                      ]}
                      onChange={handleChangeSegment}
                      className={classes.segmentedItem}
                    />
                  </div>
                  {/* {matches ? (
                <Tooltip title="My Meetings">
                  <IconButton
                    onClick={() => {
                      setOpenMeeting(!openMeeting);
                    }}
                  >
                    {/* {openMeeting ? (
                      <MdPermContactCalendar
                        style={{
                          color: "rgb(53, 118, 186)",
                          height: "31px",
                          width: "30px",
                        }}
                      />
                    ) : (
                      <MdOutlinePermContactCalendar
                        style={{ color: "#444", height: "31px", width: "30px" }}
                      />
                    )} */}
                  {/* <MdPermContactCalendar
                      style={{
                        height: "31px",
                        width: "30px",
                        color: openMeeting ? "#1677ff" : "black",
                      }}
                    />
                    <Typography
                      variant="body2"
                      style={{
                        marginLeft: "4px", // Reduced space between icon and text
                        color: "black", // Text color is black
                      }}
                    >
                      My Meetings
                    </Typography>
                  </IconButton>
                </Tooltip>
              ) : (
                ""
              )} */}
                  {/* {matches ? (
                <Tooltip title="Meetings as participant">
                  <IconButton
                    onClick={() => {
                      setOpenMeetingAttended(!openMeetingAttended);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <MdPermContactCalendar
                      style={{
                        height: "31px",
                        width: "30px",
                        color: openMeetingAttended ? "#1677ff" : "black",
                      }}
                    />
                    <Typography
                      variant="body2"
                      style={{
                        marginLeft: "4px", // Reduced space between icon and text
                        color: "black", // Text color is black
                      }}
                    >
                      Other Meetings
                    </Typography>
                  </IconButton>
                </Tooltip>
              ) : (
                ""
              )} */}

                  {/* <Paper
                    style={{
                      width: "285px",
                      // height: "33px",
                      float: "right",
                      margin: "11px",
                      // borderRadius: "20px",
                      border: "1px solid #dadada",
                      overflow: "hidden",
                    }}
                    component="form"
                    data-testid="search-field-container"
                    elevation={0}
                    variant="outlined"
                    className={classes.root}
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleMeetingSearch(searchMeetingValue);
                    }}
                  > */}
                  {/* <TextField
                 
                  name={"search"}
                  value={searchMeetingValue}
                  placeholder={"Search"}
                  onChange={handleMeetingSearchChange}
                  inputProps={{
                    "data-testid": "search-field",
                  }}
                  InputProps={{
                    disableUnderline: true,
                    startAdornment: (
                      <InputAdornment
                        position="start"
                        className={classes.iconButton}
                      >
                        <img src={MdSearch} alt="search" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <>
                        {searchMeetingValue && (
                          <InputAdornment position="end">
                            <IconButton onClick={handleClickDiscard}>
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        )}
                      </>
                    ),
                  }}
                /> */}
                  <Input
                    size="small"
                    style={{
                      marginRight: "0px",
                      borderRadius: 50,
                      padding: "8px 12px",
                      border: "2px solid #d1d5db",
                      width: 270,
                    }}
                    allowClear
                    value={searchMeetingValue}
                    placeholder="Search Meeting"
                    onChange={
                      // Check if the input has been cleared
                      handleMeetingSearchChange
                    }
                    prefix={<AiOutlineSearch size={18} />}
                    suffix={
                      <AiOutlineSend
                        size={18}
                        onClick={() => handleMeetingSearchChange}
                      />
                    }
                  />
                  {/* </Paper> */}
                </div>
              </div>
              <div className={matches ? classes.tableContainer : ""}>
                {matches ? (
                  <Table
                    className={classes.documentTable}
                    rowClassName={() => "editable-row"}
                    bordered
                    dataSource={meetingsDataApi}
                    columns={meetingsTableHeaders}
                    pagination={false}
                    expandable={{
                      rowExpandable: (record) => record?.actionItem,
                      expandedRowRender: (record: any) => (
                        <Table
                          className={classes.actionSubTableContainer}
                          style={{ width: 1400 }}
                          columns={subRowActionColumns}
                          bordered
                          dataSource={record.actionItem}
                          pagination={false}
                        />
                      ),
                      expandIcon: ({
                        expanded,
                        onExpand,
                        record,
                      }: {
                        expanded: any;
                        onExpand: any;
                        record: any;
                      }) =>
                        record.actionItem && record.actionItem.length > 0 ? ( // Only show expand icon if there is data
                          expanded ? (
                            <AiOutlineMinusCircle
                              style={{ color: "#1777FF", fontSize: "12px" }}
                              onClick={(e) => onExpand(record, e)}
                            />
                          ) : (
                            <AiOutlinePlusCircle
                              style={{ color: "#1777FF", fontSize: "12px" }}
                              onClick={(e) => onExpand(record, e)}
                            />
                          )
                        ) : null,
                      // rowKey: (record:any) => record?._id, // Use a unique identifier for each row
                    }}
                    rowKey={(record: any) => record?._id}
                  />
                ) : (
                  <>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "space-evenly",
                        marginBottom: "30px",
                      }}
                    >
                      {meetingsDataApi?.map((data, index) => {
                        const dateTime = new Date(data?.meetingdate);
                        const [datePart, timePart] =
                          data?.meetingdate?.split("T");
                        const date = datePart?.split("-").reverse().join("-");
                        const time = timePart?.slice(0, 5);

                        return (
                          <div
                            key={index}
                            style={{
                              border: "1px solid black",
                              borderRadius: "5px",
                              padding: "5px",
                              margin: "10px",
                              width: smallScreen ? "45%" : "100%",
                            }}
                          >
                            <p
                              onClick={() => {
                                handleEditDrawerOpen(data, "ReadOnly");
                              }}
                              style={{
                                padding: "3px 10px",
                                backgroundColor: "#9FBFDF",
                                borderRadius: "2px",
                                cursor: "pointer",
                              }}
                            >
                              {data?.meetingName}
                            </p>
                            <p>
                              Schedule Name:{" "}
                              {data?.meetingSchedule?.meetingName}
                            </p>
                            <p>
                              Meeting Date & Time:
                              <div style={{ display: "flex", gap: "10px" }}>
                                <span>{date}</span>
                                <span>{time}</span>
                              </div>
                            </p>
                            <p>Meeting Owner: {data?.createdBy?.username}</p>
                            {data?.actionItem.length > 0 ? (
                              <Accordion className={classes.headingRoot}>
                                <AccordionSummary
                                  expandIcon={
                                    <MdExpandMore style={{ padding: "3px" }} />
                                  }
                                  aria-controls="panel1a-content"
                                  id="panel1a-header"
                                  className={classes.summaryRoot}
                                  style={{ margin: "0px", height: "10px" }}
                                >
                                  Action Items
                                </AccordionSummary>
                                <AccordionDetails
                                  className={classes.headingRoot}
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                  }}
                                >
                                  {data?.actionItem?.map((datas: any) => (
                                    <div>
                                      <p
                                        onClick={() => {
                                          handlerActionEditOpen(
                                            datas,
                                            "ReadOnly"
                                          );
                                        }}
                                        style={{
                                          textDecorationLine: "underline",
                                          cursor: "pointer",
                                          margin: "5px 3px",
                                        }}
                                      >
                                        {datas?.title}
                                      </p>
                                    </div>
                                  ))}
                                </AccordionDetails>
                              </Accordion>
                            ) : (
                              ""
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                <div className={classes.pagination}>
                  <Pagination
                    size="small"
                    current={page}
                    pageSize={pageLimit}
                    total={countMeeting}
                    showTotal={showTotalMeeting}
                    showSizeChanger
                    showQuickJumper
                    onChange={(page, pageSize) => {
                      handlePaginationMeeting(page, pageSize);
                    }}
                  />
                </div>
              </div>
            </>
          )}

          {matches ? (
            <div style={{ position: "fixed", top: "72px", right: "130px" }}>
              <Tooltip title="Help Tours!" color="blue">
                <MdTouchApp
                  style={{ cursor: "pointer", width: "28px", height: "28px" }}
                  onClick={() => {
                    value === 5 ? (
                      setOpenTourForMRMPlans(true)
                    ) : value === 0 ? (
                      setOpenTourForMRMSchedule(true)
                    ) : value === 1 ? (
                      setOpenTourForMeeting(true)
                    ) : value === 2 ? (
                      setOpenTourForActionPoint(true)
                    ) : (
                      <></>
                    );
                  }}
                />
              </Tooltip>
            </div>
          ) : (
            ""
          )}

          <Dialog
            fullScreen={fullScreen}
            open={open}
            onClose={handleClose}
            aria-labelledby="responsive-dialog-title"
          >
            <DialogContent>
              <DialogContentText>
                You are about to create Ad-hoc Meeting schedule without MRM
                Plan. Do you want to continue?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button autoFocus onClick={handleClose} color="primary">
                No
              </Button>
              <Button
                // disabled={!isLocAdmin}
                onClick={() => {
                  // handleDiscard();
                  handleYes();
                }}
                color="primary"
                autoFocus
              >
                Yes
              </Button>
            </DialogActions>
          </Dialog>

          <div>
            <MrmAddMeetings
              open={drawerOpen}
              setDrawerOpen={setDrawerOpen}
              onClose={handleDrawerClose}
              dataSourceFilter={dataSourceFilter}
              valueById={valueById}
              year={currentYear}
              meeting={true}
              setLoadMeeting={setLoadMeeting}
              openScheduleDrawer={openScheduleDrawer}
              setOpenScheduleDrawer={setOpenScheduleDrawer}
              handleDrawer={handleDrawer}
            />
            <MrmEditingMeetings
              open={editDrawerOpen}
              onClose={handleEditDrawerClose}
              dataSourceFilter={dataSourceFilter && dataSourceFilter}
              editDataMeeting={editDataMeeting && editDataMeeting}
              ownerSourceFilter={ownerSourceFilter && ownerSourceFilter}
              valueById={valueById}
              year={currentYear}
              readMode={readMode}
              meeting={true}
              setLoadMeeting={setLoadMeeting}
              handleDrawer={handleDrawer}
              // openScheduleDrawer={openScheduleDrawer}
              setOpenScheduleDrawer={setOpenScheduleDrawer}
              setMode={setMode}
              setStatusMode={setStatusMode}
            />

            <AddMrmActionPoint
              open={mrmActionPointAdd}
              onClose={handlerActionAddClose}
              addNew={true}
              dataSourceFilter={mrmActionId && mrmActionId}
              setAgendaData={undefined}
              agendaData={undefined}
              setFormData={undefined}
              formData={undefined}
              year={currentYear}
              setLoadActionPoint={setLoadActionPoint}
              setMrmActionPointAdd={setMrmActionPointAdd}
            />
            <EditMrmActionPoint
              open={mrmActionPointEdit}
              onClose={handlerActionEditClose}
              addNew={true}
              dataSourceFilter={mrmActionId && mrmActionId}
              setAgendaData={undefined}
              agendaData={undefined}
              setFormData={undefined}
              formData={undefined}
              actionRowData={actionRowData}
              year={currentYear}
              valueById={undefined}
              data={undefined}
              readMode={readMode}
              setLoadActionPoint={setLoadActionPoint}
              handleEditDrawerOpen={handleEditDrawerOpen}
              setMrmActionPointAdd={setMrmActionPointAdd}
            />
          </div>
          <Dialog
            fullScreen={fullScreen}
            open={open}
            onClose={handleClose}
            aria-labelledby="responsive-dialog-title"
          >
            <DialogContent>
              <DialogContentText>
                You are about to create Ad-hoc Meeting schedule without MRM
                Plan. Do you want to continue?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button autoFocus onClick={handleClose} color="primary">
                No
              </Button>
              <Button
                // disabled={!isLocAdmin}
                onClick={() => {
                  // handleDiscard();
                  handleYes();
                }}
                color="primary"
                autoFocus
              >
                Yes
              </Button>
            </DialogActions>
          </Dialog>

          <Modal
            title="Action Items"
            visible={isModalVisible}
            onOk={handleOk}
            onCancel={handleActionItemModalCancel}
            footer={false}
            width={"600px"}
            closeIcon={
              <img
                src={CloseIconImageSvg}
                alt="close-drawer"
                style={{ width: "36px", height: "38px", cursor: "pointer" }}
              />
            }
          >
            <ol>
              {/* {console.log("actionITems", actionItems)} */}
              {actionItems.map((item: any, index: any) => (
                <li
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  {/* Name Column */}
                  <Tooltip title={item?.name}>
                    <div
                      style={{
                        textDecorationLine: "underline",
                        cursor: "pointer",
                        width: 130,
                      }}
                    >
                      <div
                        style={{
                          textDecorationLine: "underline",
                          cursor: "pointer",
                          width: 400,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        onClick={() => {
                          // handlerActionEditOpen(item, "ReadOnly");
                          getActionItem(item);
                        }}
                      >
                        {item?.name}
                      </div>
                    </div>
                  </Tooltip>

                  {/* Status Column */}
                  <div
                    style={{
                      width: 100,
                      textAlign: "left",
                    }}
                  >
                    <Tag
                      style={{
                        backgroundColor: item?.status ? "#D4E6F1" : "#FADBD8",
                        color: "black",
                      }}
                      key={item?.status}
                    >
                      {item?.status ? "Open" : "Close"}
                    </Tag>
                  </div>
                </li>
              ))}
            </ol>
          </Modal>
          <Tour
            open={openTourForMRMPlans}
            onClose={() => setOpenTourForMRMPlans(false)}
            steps={steps}
          />

          <Tour
            open={openTourForMRMSchedule}
            onClose={() => setOpenTourForMRMSchedule(false)}
            steps={stepsForSchedule}
          />

          <Tour
            open={openTourForMeeting}
            onClose={() => setOpenTourForMeeting(false)}
            steps={stepsForMeeting}
          />
          <Tour
            open={openTourForActionPoint}
            onClose={() => setOpenTourForActionPoint(false)}
            steps={stepsForActionPoint}
          />
        </div>
      </div>
    </>
  );
};
export default MRM;
