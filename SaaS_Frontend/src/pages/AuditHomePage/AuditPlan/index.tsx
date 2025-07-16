import { useState, useEffect, useRef } from "react";
import {
  Box,
  Fab,
  Typography,
  Tooltip,
  Grid,
  CircularProgress,
  FormControl,
  TextField,
  IconButton,
  useMediaQuery,
  Paper,
  Button as MuiButton,
  Avatar,
  Icon,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogActions,
  MenuItem,
  Menu,
} from "@material-ui/core";
import CustomTable2 from "components/newComponents/CustomTable2";
import ConfirmDialog from "components/ConfirmDialog";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import axios from "apis/axios.global";
import checkRoles from "utils/checkRoles";
import { roles } from "utils/enums";
import { makeStyles } from "@material-ui/core/styles";
import EmptyTableImg from "assets/EmptyTableImg.svg";
import SearchBar from "components/SearchBar";
import MultiUserDisplay from "components/MultiUserDisplay";
import AuditPlanForm3 from "components/AuditPlanForm3";
import { BsPerson } from "react-icons/bs";
import { PiStarFourFill } from "react-icons/pi";

// "UpdateOutlinedIcon": "MdUpdate",
import {
  MdUpdate,
  MdOutlineClose,
  MdOutlineEdit,
  MdListAlt,
  MdOutlineAddBox,
  MdOutlineDelete,
  MdAdd,
  MdFormatListBulleted,
  MdOutlineCancel,
  MdAssessment,
  MdOutlineCalendarToday,
  MdOutlineEventAvailable,
  MdVisibility,
  MdOutlinePermContactCalendar,
  MdOutlineCheckCircle,
  MdPermContactCalendar,
  MdDateRange,
  MdDashboard,
  MdAccessTime,
} from "react-icons/md";
import { HiOutlineDocumentAdd } from "react-icons/hi";

import {
  Badge,
  Button,
  Col,
  ConfigProvider,
  DatePicker,
  Divider,
  Input,
  Modal,
  Pagination,
  Popover,
  Row,
  Segmented,
  Select,
  Switch,
  Table,
  Tabs,
  Tag,
} from "antd";
import { ReactComponent as ConfigIcon } from "assets/documentControl/configuration.svg";
import YearComponent from "components/Yearcomponent";
import { auditPlanSchema } from "schemas/auditPlanSchema";
import getYearFormat from "utils/getYearFormat";
import getYearinYYYYformat from "utils/getYearinYYYYformat";
import { Autocomplete } from "@material-ui/lab";
import { getAllLocation } from "apis/locationApi";
import getAppUrl from "utils/getAppUrl";
import {
  currentAuditYear,
  currentLocation,
  auditScheduleFormType,
  currentAuditPlanYear,
  avatarUrl,
  auditSchedule,
} from "recoil/atom";
import { useRecoilState, useResetRecoilState } from "recoil";
import type { PaginationProps } from "antd";
import getSessionStorage from "utils/getSessionStorage";
import { ReactComponent as CustomDeleteICon } from "assets/documentControl/DeleteBlackColor.svg";
import { ReactComponent as CustomEditICon } from "assets/documentControl/Edit.svg";
import type { ColumnsType } from "antd/es/table";

import AuditPeriodModal from "./AuditPeriodModal";
import {
  DragDropContext,
  Draggable,
  Droppable,
  OnDragEndResponder,
} from "react-beautiful-dnd";
import AuditScheduleFormStepper from "pages/AuditScheduleFormStepper";
import AliceCarousel from "react-alice-carousel";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import { drop, uniqueId, update } from "lodash";
import { AnyObject } from "yup/lib/types";
import dayjs from "dayjs";
import AuditFinalizeModal from "./AuditFinalizeModal";
import TabPane from "antd/es/tabs/TabPane";
import moment from "moment";
import AuditScheduleCalendar from "components/ReusableCalendar/AuditScheduleCalendar";
import { CalendarView } from "kalend";
import ConsolidatedTable from "pages/InformationTable/ConsolidatedTable";
import { theme } from "theme";
import { ReactComponent as FilterIcon } from "assets/documentControl/Filter.svg";
// import AddBoxOutlinedIcon from "@material-ui/icons/AddBoxOutlined";
import AuditPlanAll from "./AuditPlanAll";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { LuCalendar, LuTag } from "react-icons/lu";
import { RiDeleteBin7Line } from "react-icons/ri";
import { FiPlusCircle } from "react-icons/fi";
import SecondaryButton from "components/ReusableComponents/SecondaryButton";
import { IoMdInformationCircleOutline } from "react-icons/io";

// import "react-alice-carousel/lib/alice-carousel.css";

import AuditAssistantModal from "./AuditAssistantModal";
import { showLoader, hideLoader } from "components/GlobalLoader/loaderState"; // Import loader control functions
import { getAllAuditorsNew } from "apis/auditApi";
import { GiStarShuriken } from "react-icons/gi";
const useStyles = makeStyles((theme) => ({
  fabButton: {
    backgroundColor: theme.palette.primary.light,
    color: "#fff",
    margin: "0 5px",
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    },
  },
  taskTag: {
    display: "inline-block",
    backgroundColor: "#E0F7FA", // Light cyan background
    color: "#000", // Black text
    padding: "5px 10px",
    borderRadius: "15px", // Rounded corners for tag-like appearance
    fontSize: "15px",
    fontWeight: 600,
    margin: "5px",
    cursor: "pointer",
    textDecoration: "none", // Ensures no underline
    "&:hover": {
      backgroundColor: "#B2EBF2", // Slightly darker cyan on hover
    },
  },
  newContainer: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  createButton: {
    backgroundColor: "#001f4d", // deep navy blue
    color: "#fff",
    border: "none",
    padding: "8px 20px",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    gap: 8,
    height: 40,
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "#001f4d",
    },
  },
  createIcon: {
    fontSize: 20,
    backgroundColor: "#fff",
    color: "#002f6c",
    borderRadius: "50%",
    padding: 2,
  },
  createText: {
    fontSize: 14,
    fontWeight: 600,
    fontFamily: "Poppins",
  },
  buttonBase: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "4px 16px",
    borderRadius: 6,
    backgroundColor: "white",
    fontFamily: "Poppins",
    fontSize: 14,
    cursor: "pointer",
    lineHeight: "normal",
    border: "2px solid #003059",
    color: "#003059",
  },
  adhocButton: {
    color: "#003059",
    border: "2px solid #003059",
  },
  auditButton: {
    color: "#003059",
    border: "2px solid #003059",
    padding: "4px 16px",
    borderRadius: 6,
  },
  auditButtonActive: {
    color: "#fff",
    backgroundColor: "#3476ba",
    border: "2px solid #3476ba",
    padding: "4px 16px",
    borderRadius: 6,
  },
  deleteButton: {
    color: "#e60000",
    border: "1px solid #e60000",
  },
  icon: {
    fontSize: 18,
  },
  text: {
    fontSize: 14,
    fontWeight: 600,
  },

  segmentBox: {
    width: "416px",
    height: "36px",
    flexGrow: 0,
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "36px",
    padding: "0",
  },
  taskTitle: {
    fontSize: "15px",
    fontWeight: 600,
    margin: "5px",
    cursor: "pointer",
  },
  segmentedItem: {
    border: "2px solid #ededed",
    backgroundColor: "#ffffff",

    "&.ant-segmented .ant-segmented-item-selected": {
      backgroundColor: "#3576ba !important", // Selected color
      color: "white !important", // Change text color when selected
    },
  },
  rollingRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#E0F7FA", // Light cyan background for the entire row
    padding: "10px 15px",
    borderRadius: "10px",
    margin: "10px 0",
    boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
    fontSize: "14px",
  },

  rightEnd: {
    marginLeft: "auto", // Ensures the div is pushed to the right
  },
  imgContainer: {
    display: "flex",
    justifyContent: "center",
  },
  emptyDataText: {
    fontSize: theme.typography.pxToRem(14),
    color: theme.palette.primary.main,
  },

  closeButton: {
    marginTop: 20,
    padding: "10px 20px",
    fontSize: 16,
    backgroundColor: "red",
    color: "white",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
  },
  pagination: {
    position: "fixed",
    bottom: "3px",
    right: "0",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "inherit",
    padding: theme.spacing(1),
  },
  searchContainer: {
    maxWidth: "100vw",
    height: "30px",
    // marginBottom: "25px",
  },
  docNavInnerFlexBox: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: "6px 4px",
    "& .ant-input": {
      background: "#E8F3F9 !important",
    },
  },
  divderRightSide: {
    top: "0.1em",
    height: "1.5em",
    background: "gainsboro",
  },
  docNavIconStyle: {
    width: "21.88px",
    height: "21px",
    paddingRight: "6px",
    cursor: "pointer",
  },
  tableContainer: {
    // Table Header Styles
    // "& .ant-table-thead > tr > th": {
    //   backgroundColor: "#E8F3F9", // Set the table header background color to yellow
    // },
    "& .ant-table-thead .ant-table-cell": {
      // backgroundColor: ({ headerBgColor }) => headerBgColor,
      // color: ({ tableColor }) => tableColor,
      backgroundColor: "#E8F3F9",
      borderBottom: "1px solid #003059",
      padding: "4px 12px",
      // fontFamily: "Poppins !important",
      color: "#00224E",
    },
    // Table Body Styles
    "& .ant-table-tbody > tr > td": {
      // border: "0.5px solid #E6E8EA", // Add a border around each table body cell
      padding: "2px 12px", // Adjust the padding as needed
      height: "35px", // Set the height of the table cells
    },
    // "& tr.ant-table-row:nth-child(odd)": {
    //   backgroundColor: "#F5F5F5", // Odd row color
    // },
    // "& tr.ant-table-row:nth-child(even)": {
    //   backgroundColor: "#FFFFFF", // Even row color
    // },
  },
  root: (props: any) => {
    return {
      width: props === 2 ? "100%" : "97%",
      padding: "40px 16px 16px 16px",
      overflowX: "auto",
      whiteSpace: "nowrap",
    };
  },
  iconGroup: {
    // marginLeft: "auto",
    display: "flex",
    justifyContent: "center",
    width: "fit-content",
    height: "fit-content",
    // alignItems: "center",
  },
  datePickersContainer: {
    display: "flex",
    justifyContent: "space-between",
    padding: "5px",
  },
  boardContainer: {
    // padding: theme.spacing(2), // Add padding around the Kanban board
    display: "flex",
    // overflowX: "auto",
    backgroundColor: "#ffffff",
    width: "100%",
    justifyContent: "center",
  },
  // #ffffff
  // #F9F6F7
  column: {
    // padding: theme.spacing(1),
    width: "21vw",
    // width:"70px",
    backgroundColor: "#fafafa",
    borderRadius: "6px",
    // marginRight: theme.spacing(1),
    paddingBottom: "4px",
    margin: "0px 0px",
  },
  columnName: {
    // marginBottom: theme.spacing(1),
    fontSize: "20px",
    // textAlign: "center",
    fontFamily: "'Poppins', sans-serif",
    fontWeight: "bold",
    padding: "0px",
    margin: "0px",
  },
  auditorNew: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#3F51B5",
    // whiteSpace: "nowrap", // Prevent text from wrapping
    overflow: "hidden",
    // textOverflow: "ellipsis", // Show ellipsis if text overflows
    // maxWidth: "120px", // Set a max width to handle varying text length
  },
  auditeeNew: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#FF5722",
    // whiteSpace: "nowrap", // Prevent text from wrapping
    overflow: "hidden",
    // textOverflow: "ellipsis", // Show ellipsis if text overflows
    // maxWidth: "120px", // Set a max width to handle varying text length
  },

  taskContainer: {
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 4px 4px 0 rgba(0, 0, 0, 0.25)",
    margin: "8px 16px 16px 16px",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    alignItems: "center",
    // marginBottom: theme.spacing(1),
  },
  title: {
    // marginRight: theme.spacing(1),
    // fontWeight: "bold",
    fontSize: "15px",
    paddingLeft: "4px",
    display: "inline-block",
    // textAlign: "center",
    fontFamily: "'Poppins', sans-serif",
    flexGrow: 0,
  },
  description: {
    marginBottom: theme.spacing(1),
  },
  info: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  avatar: {
    marginRight: theme.spacing(1),
  },
  tableContainerScrollable: {
    marginBottom: "20px", // Adjust the value as needed
    maxHeight: "calc(76vh - 20vh)", // Adjust the max-height value as needed
    overflowY: "auto",
    "&::-webkit-scrollbar": {
      width: "8px",
      height: "10px", // Adjust the height value as needed
      backgroundColor: "#e5e4e2",
    },
    "&::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "grey",
    },
  },
  locSearchBox: {
    width: "100%",
    [theme.breakpoints.down("sm")]: {
      marginTop: theme.typography.pxToRem(10),
    },
    "& .MuiOutlinedInput-root": {
      borderRadius: "4px",
    },
    padding: "4px",
  },

  locSearchBoxNew: {
    width: "100%",
    [theme.breakpoints.down("sm")]: {
      marginTop: theme.typography.pxToRem(10),
    },
    // "& .MuiOutlinedInput-root": {
    //   borderRadius: "16px",
    // },
  },
  addButton: {
    border: "none",
    // position: "absolute",
    // top: theme.spacing(1),
    // right: theme.spacing(1),
  },
  // Add this to override the styles
  inputRootOverride: {
    border: "1px solid black",
    borderRadius: "5px",
    '& .MuiAutocomplete-inputRoot[class*="MuiOutlinedInput-root"][class*="MuiOutlinedInput-marginDense"]':
      {
        // padding: "3px 0px 1px 3px !important",
      },
  },
  textField: {
    fontSize: "14px",
    fontWeight: 600,
    "& .MuiOutlinedInput-root": {
      backgroundColor: "white",

      // borderRadius: "20px",
      // color: "black",
      fontSize: "14px",
      // fontWeight: 600,
      // border: "1px solid black",
    },
    // "& .MuiOutlinedInput-notchedOutline": {
    //   borderRadius: "20px",
    // },
    "& .MuiSvgIcon-root": {
      color: "black", // Change icon color
    },
  },
  textField2: {
    fontSize: "14px",
    fontWeight: 600,
    "& .MuiOutlinedInput-root": {
      backgroundColor: "white",
      // borderRadius: "20px",
      // color: "black",
      // border: "1px solid  black",
      fontSize: "14px",
      // fontWeight: 600,
    },
    // "& .MuiOutlinedInput-notchedOutline": {
    //   borderRadius: "20px",
    // },
    "& .MuiSvgIcon-root": {
      color: "black", // Change icon color
    },
  },
  tag: {
    display: "inline-block",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "100px", // Adjust the max-width as needed
  },
  tagContainer: {
    display: "flex",
    flexDirection: "row",
  },
  hiddenTags: {
    display: "none",
  },
  disabledRangePicker: {
    "& .ant-picker-input > input[disabled]": {
      color: "black", // Set text color to black
      fontSize: "12px",
    },
    "& .ant-picker-suffix": {
      color: "black !important", // Ensure icon color is black
    },
    "& .ant-picker-disabled": {
      // borderColor: "black", // Set border color to black
      // borderWidth: "1px",
      // borderStyle: "solid",
      border: "1px solid black",
    },
    "& .ant-picker-disabled .ant-picker-input input": {
      color: "black", // Ensure input text color is black when disabled
    },
    "& .ant-picker-disabled .ant-picker-suffix": {
      color: "black !important", // Ensure icon color is black when disabled
    },
  },
  name: {
    color: "#000",
    fontWeight: 500,
    marginRight: "20px",
  },
  auditor: {
    color: "#000",
    fontWeight: 400,
    marginRight: "20px",
  },
  auditee: {
    color: "#000",
    fontWeight: 400,
    marginRight: "20px",
  },
  time: {
    color: "#000",
    fontWeight: 400,
    marginRight: "20px",
  },
  addIcon: {
    color: "#9C27B0", // Purple color for the add icon
  },
}));

const useStyles2 = makeStyles(() => ({
  dropdownLabel: {
    fontSize: "14px",
    color: "#000",
    minWidth: "40px",
    fontFamily: "Poppins",
  },
  compactAutocomplete: {
    width: "18vw",
    "& .MuiOutlinedInput-root": {
      // height: "30px",
      fontSize: "14px",
      fontFamily: "Poppins",
    },
    "& input": {
      padding: "4px 8px !important",
    },
  },
  filledInput: {
    "& .MuiOutlinedInput-input": {
      color: "#000",
    },
  },
  placeholderInput: {
    "& .MuiOutlinedInput-input": {
      color: "black",
    },
  },
}));

// interface AuditPlanProps {
//   ref2: React.Ref<HTMLDivElement>;
//   ref3: React.Ref<HTMLDivElement>;
// }
type Props = {
  refelemet2?: any;
  refelemet3?: any;
  refelemet4?: any;
  refelemet5?: any;
  refelemet6?: any;
  refelemet7?: any;
  mode?: boolean;
  collapseLevel?: any;
};

const showTotal: PaginationProps["showTotal"] = (total: any) =>
  `Total ${total} items`;
const Audit = ({
  refelemet2,
  refelemet3,
  refelemet4,
  refelemet5,
  refelemet6,
  refelemet7,
  mode,
  collapseLevel,
}: Props) => {
  // const { ref2, ref3, ...otherProps } = props;
  const { Option } = Select;
  const { RangePicker } = DatePicker;
  const userDetails:any= getSessionStorage();
  const [allAuditPlanDetails, setAllAuditPlanDetails] = useState<any[]>([]);
  const [currentYear, setCurrentYear] = useState<any>();
  const [data, setData] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [deletePlan, setDeletePlan] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setsearchQuery] = useState<any>({
    searchQuery: "",
  });

  const [currentMonthForBoard, setCurrentMonthForBoard] = useState<any>();
  const [openModal, setOpenModel] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<any>("");
  const [auditPlanIds, setAuditPlanIds] = useState([]);
  const resetAuditSchedule = useResetRecoilState(auditSchedule);
  const [disabledButton, setDisabledButton] = useState(false);
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [calendarData, setCalendarData] = useState<any>([]);
  const [openAudit, setOpenAudit] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [create, setCreate] = useState(false);
  const [createSchedule, setCreateSchedule] = useState(false);
  const [currentStateNew, setCurrentStateNew] = useState("Planned"); // Initial state
  const [entityDataNew, setEntityDataNew] = useState([]);
  const [isReadOnly, setIsReadOnly] = useState<any>(false);
  const [scope, setScope] = useState("");
  const allOptionNew: any = { id: "All", value: "All", scope: {} };
  const [selectCalenderview, setCalenderView] = useState(false);
  const [selectedEntityData, setSelectedEntityData] = useState("");
  const [modalMode, setModelMode] = useState("create");
  const [openAuditFinalize, setOpenAuditFinalize] = useState<any>(false);
  const [entityData, setEntityData] = useState<any>({});
  const [editEntityData, setEditEntityData] = useState<any>({});
  const [editEntityModal, setEditEntityModal] = useState(false);
  const [myAuditShow, setMyAuditShow] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [locationNo, setLocationNo] = useState("");
  const isMR = checkRoles(roles.MR);
  const isOrgAdmin = checkRoles(roles.ORGADMIN);
  const isLocationAdmin = checkRoles(roles.LOCATIONADMIN);
  const [plandIdAll, setPlanIdAll] = useState<any>(null);
  const [auditorData, setAuditorData] = useState([]);
  const [auditeeData, setAuditeedata] = useState<any>([]);
  const [template, setTemplate] = useState<any>([]);
  const [selectTemplate, setSelectTemplate] = useState<any>([]);
  const isAuditor = checkRoles(roles.AUDITOR);
  const classes = useStyles(collapseLevel);
  const newClasses = useStyles2();
  const allOption = { id: "All", locationName: "All" };
  const [selectedLocation, setSelectedLocation] = useState<any>({
    id: userDetails?.location?.id,
    locationName: userDetails?.location?.locationName,
  });
  const [calendarModalInfo, setCalendarModalInfo] = useState<any>({
    open: false,
    data: {},
    mode: "create",
    calendarFor: "AuditSchedule",
  });
  const [errMessage, setErrMessage] = useState("");
  const [errModal, setErrModal] = useState(false);
  const [errEditMessage, setEditErrMessage] = useState("");
  const [errEditModal, setEditErrModal] = useState(false);
  const [auditPlanId, setAuditPlanId] = useState("");
  const [removedList, setRemovedList] = useState<any>([]);
  const [loaderForSchdeuleDrawer, setLoaderForSchdeuleDrawer] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const buttonOpen = Boolean(anchorEl);

  const [unitDisableData, setUnitDisableData] = useState(false);
  const [planId, setPlanId] = useState<any>("");
  const [dropData, setDropData] = useState<any>([]);
  // const [selectAuditType, setSelectAuditType] = useState<any>();
  const [selectTableAuditType, setSelectTableAuditType] = useState<any>({});
  const [auditTypeOptions, setAuditTypeOptions] = useState<any>([]);
  // const [selectSystem, setSelectSystem] = useState<any>([]);
  const [selectTableSystem, setSelectTableSystem] = useState<any>([]);
  const [systemOptions, setSystemOptions] = useState<any>([]);
  const [optionData, setOptionData] = useState<any>([]);
  const [locationOption, setLocationOption] = useState([]);
  // const [selectLocation, setSelectLocation] = useState<any>();
  const [auditYear, setAuditYear] = useRecoilState<any>(currentAuditYear);
  const [auditPlanYear, setAuditPlanYear] =
    useRecoilState<any>(currentAuditPlanYear);
  const [searchValue, setSearchValue] = useState<any>({
    auditYear: auditYear ?? "",
    location: "",
    auditType: "",
    systemName: "",
    auditor: "",
  });
  const [isOpen, setIsOpen] = useState(false);

  const matches = useMediaQuery("(min-width:786px)");
  const [locationNames, setLocationNames] = useState<Location[]>([]);
  const [auditPlanData, setAuditPlanData] = useState<any>();
  const realmName = getAppUrl();
  const [selectAdd, setSelectAdd] = useState<any>([]);
  const [locationListing, setLocationListing] = useState([]);
  const [readMode, setReadMode] = useState<boolean>(false);
  const [filteredValues, setFilteredValues] = useState([]);
  const [page, setPage] = useState<any>(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [count, setCount] = useState<number>(0);
  const [auditPlanDataNew, setAuditPlanDataNew] = useState(auditPlanSchema);
  const [auditTypes, setAuditTypes] = useState<any[]>([]);
  const handleLinkClick = (record: any) => {
    navigate(`/audit/auditplan/auditplanform/${record.id}/view`);
  };

  const [isSecondVisible, setIsSecondVisible] = useState(false);
  const [selectedAuditType, setSelectedAuditType] = useState<any>({
    id: "",
    auditType: "",
  });
  const [formModeForCalendarDrawer, setFormModeForCalendarDrawer] =
    useState<any>(null);
  const carouselRef = useRef<any>(null);
  const [task, setTask] = useState<any>();
  const [hoveredColumn, setHoveredColumn] = useState(null);
  const [scheduleFormType, setScheduleFormType] = useRecoilState(
    auditScheduleFormType
  );
  const [auditPeriodModal, setAuditPeriodModal] = useState<any>({
    open: false,
    data: null,
  });
  const [auditPlanIdFromPlan, setAuditPlanIdFromPlan] = useState<any>("");
  const [boardDatas, setBoardData] = useState<any>([
    { label: "Planned", data: [] },
    {
      label: "Scheduled",
      color: "#FF8000",
      data: [],
    },
    { label: "Completed", data: [], color: "#808080" },
  ]);
  const [viewerMode, setViewerMode] = useState(false);
  const [viewerModeAll, setViewerModelAll] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEntityModal, setIsEntityModal] = useState(false);
  const [editScheduleModal, setEditScheduleModal] = useState(false);
  const [finalisedAuditorTourOpen, setFinalisedAuditorTourOpen] =
    useState<any>(false);
  const [calendarDataLoading, setCalendarDataLoading] = useState(false);
  const [auditScheduleIdFromLocation, setAuditScheduleIdFromLocation] =
    useState<any>("");
  //get auditTypes
  const [reportOpen, setReportOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuAnchorRef, setMenuAnchorRef] = useState<HTMLButtonElement | null>(
    null
  ); // Only if you need it

  //states for audit ai features
  const [openAssistantModal, setOpenAssistantModal] = useState<any>(false);
  const [auditScopePromptText, setAuditScopePromptText] = useState<any>("");
  const [dataForChecklistGeneration, setDataForChecklistGeneration] =
    useState<any>({});

  const [assistantFormData, setAssistantFormData] = useState<any>({
    auditScopePromptText: "",
    auditDateRange: "",
    auditDuration: "",
  });
  const [auditDateRange, setAuditDateTime] = useState<any>();
  const [auditTimePeriod, setAuditTimePeriod] = useState<any>();
  const [currentStep, setCurrentStep] = useState<any>(0);
  // const [auditPlanIds, setAuditPlanIds] = useState([]);

  const [auditScopeSubmitLoader, setAuditScopeSubmitLoader] =
    useState<any>(false);

  useEffect(() => {
    if (myAuditShow === true) handlePagination(1, 10);
  }, [myAuditShow]);

  useEffect(() => {
    if (selectCalenderview === true) {
      getAuditType();
    }
  }, [selectCalenderview]);

  const handleButtonOpen = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleButtonClose = () => {
    setAnchorEl(null);
  };

  const getAuditType = async () => {
    try {
      let res = await axios.get(`/api/audit-settings/getAllAuditTypes`);
      setAuditTypes(res.data);
    } catch (err) {
      // console.error(err);
    }
  };

  useEffect(() => {
    getHeaderData();
  }, []);

  useEffect(() => {
    setCurrentMonthForBoard(new Date().getMonth());
  }, []);
  // months[currentMonthForBoard]
  useEffect(() => {
    if (!!currentMonthForBoard) {
      getAllData();
    }
  }, [currentMonthForBoard]);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const getHeaderData = () => {
    getYearFormat(new Date().getFullYear()).then((response: any) => {
      setAuditYear(response);
    });
  };

  const getCalendarData = async (searchValue: any, openAuditNew = false) => {
    setCalendarDataLoading(true);
    const { auditYear, location, auditType, systemName, auditor } = searchValue;
    let url;
    setCalendarData([]);
    if (openAuditNew === true) {
      url = `api/auditSchedule/getMyAuditCalendardata?auditYear=${auditYear}&locationId=${location}&systemTypeId=${auditType}&systemMasterId=${systemName}&auditor=${auditor}&auditType=${selectTableAuditType?.id}`;
    } else {
      url = `api/auditSchedule/getAuditScheduleEntityWiseCalendardata?auditYear=${auditYear}&locationId=${location}&systemTypeId=${auditType}&systemMasterId=${systemName}&auditor=${auditor}&auditType=${selectTableAuditType?.id}`;
    }
    if (!viewerModeAll) {
      getAllData();
    } else {
      await axios.get(url).then((response: any) => {
        //process the result
        // Determine the role of the current user (auditor/auditee)
        setCalendarData([]);
        if (!!response.data) {
          response?.data?.map((item: any) => {
            let color: any;
            if (item.auditor?.includes(userDetails?.id)) {
              color = "skyblue";
            } else if (item.auditee?.includes(userDetails?.id)) {
              color = "#e6ffe6";
            } else color = "yellow";
            setCalendarData((prev: any) => [
              ...prev,
              {
                id: item.id,
                title: item.entityName ?? "-",
                start: item.time ?? "-",
                allDay: false,
                className: "audit-entry-new",
                textColor: "#000000",
                color: color,
                entityName: item?.entityName,
                url: `/audit/auditschedule/auditscheduleform/schedule/${item.id}`,
                auditor: item.auditor,
                auditee: item.auditee,
                locationName: item?.locationName,
                auditType: item?.auditType,
                auditScheduleId: item?.auditScheduleId,
                auditId: item?.auditId,
                auditReportCreated: item?.auditReport,
                responsibility: item?.responsibility,
                auditScheduleDetails: item?.auditScheduleDetails,
                myauditors: item?.myauditors,
                myauditees: item?.myauditees,
                systemMaster: item?.systemMaster,
                dateExcceds: item?.dateExcceds,
              },
            ]);
          });
          setCount(response?.data?.length);
        }
        setCalendarDataLoading(false);
      });
    }
  };
  const columns: ColumnsType<any> = [
    {
      title: "Audit Name",
      dataIndex: "auditName",
      render: (_, record, index) => {
        return (
          <div ref={refelemet4}>
            <div
              style={{ position: "relative", display: "inline-block" }}
              onClick={() => handleLinkClick(record)}
            >
              <span
                style={{
                  textDecorationLine: "underline",
                  cursor: "pointer",
                }}
              >
                {record.auditName}
              </span>
              {record.isDraft &&
                record.isDraft && ( // Only show Draft label for the first row
                  <Tag
                    color="orange"
                    style={{
                      position: "absolute",
                      top: "-20px",
                      right: "-20px",
                      height: "20px",
                      lineHeight: "20px",
                    }}
                  >
                    Draft
                  </Tag>
                )}
            </div>
          </div>
        );
      },
    },
    {
      title: "Audit Type",
      dataIndex: "auditTypeName",
      onFilter: (value: any, record: any) => {
        return record.auditTypeName === value;
      },
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: any) => {
        // Create a set to store unique names
        const uniqueNames = new Set();

        // Iterate through allAuditPlanDetails and add unique names to the set
        allAuditPlanDetails?.forEach((item: any) => {
          const name = item.auditTypeName;
          uniqueNames.add(name);
        });

        // Convert the set back to an array for rendering
        const uniqueNamesArray = Array.from(uniqueNames);

        return (
          <div style={{ padding: 8 }}>
            {uniqueNamesArray.map((name: any) => (
              <div key={name}>
                <label>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setSelectedKeys([...selectedKeys, value]);
                      } else {
                        setSelectedKeys(
                          selectedKeys.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={name}
                    checked={selectedKeys.includes(name)} // Check if the checkbox should be checked
                  />
                  {name}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                type="primary"
                onClick={() => {
                  confirm();
                  setFilteredValues(selectedKeys);
                }}
                style={{ marginRight: 8 }}
              >
                Filter
              </Button>
              {/* <Button onClick={() => {}}>Reset</Button>{" "} */}
              {/* Add a reset button */}
            </div>
          </div>
        );
      },
    },
    {
      title: "System Name",
      dataIndex: "systemName",

      onFilter: (value: any, record: any) => {
        const hasMatchingSystem = record?.system?.some(
          (sys: any) => sys.name === value
        );

        return hasMatchingSystem;
      },
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: any) => {
        // Create a set to store unique system names
        const uniqueSystemNames = new Set();

        // Iterate through all records and add unique system names to the set
        allAuditPlanDetails?.forEach((item: any) => {
          item.systemMaster.forEach((sys: any) => {
            const name = sys.name;
            uniqueSystemNames.add(name);
          });
        });

        // Convert the set back to an array for rendering
        const uniqueSystemNamesArray = Array.from(uniqueSystemNames);

        return (
          <div style={{ padding: 8 }}>
            {uniqueSystemNamesArray.map((name: any) => (
              <div key={name}>
                <label>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setSelectedKeys([...selectedKeys, value]);
                      } else {
                        setSelectedKeys(
                          selectedKeys.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={name}
                    checked={selectedKeys.includes(name)} // Check if the checkbox should be checked
                  />
                  {name}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                type="primary"
                onClick={() => {
                  confirm();
                  setFilteredValues(selectedKeys);
                }}
                style={{ marginRight: 8 }}
              >
                Filter
              </Button>
              {/* <Button onClick={() => {}}>Reset</Button>{" "} */}
              {/* Add a reset button */}
            </div>
          </div>
        );
      },
    },

    // {
    //   title: "Responsibility",
    //   dataIndex: "roleId",
    // },
    {
      title: "Audit Scope",
      dataIndex: "entityTypeName",
    },
    {
      title: "Corp Func/Unit",
      dataIndex: "locationName",
    },

    // {
    //   title: "Action",
    //   key: "action",
    //   width: 200,
    //   render: (_: any, record: any) => (
    //     <>
    //       <IconButton
    //         onClick={() => {
    //           handleEditPlan(record);
    //         }}
    //         style={{ padding: "10px" }}
    //       >
    //         <CustomEditICon width={20} height={20} />
    //       </IconButton>
    //       <IconButton
    //         onClick={() => {
    //           handleEditSchedule(record);
    //         }}
    //         style={{ padding: "10px" }}
    //       >
    //         <ListAltIcon width={20} height={20} />
    //       </IconButton>
    //       <IconButton
    //         onClick={() => {
    //           handleOpen(record);
    //         }}
    //         style={{ padding: "10px" }}
    //       >
    //         <CustomDeleteICon width={20} height={20} />
    //       </IconButton>
    //     </>
    //   ),
    // },
  ];

  if (true) {
    columns.push({
      title: "Action",
      key: "action",
      width: 200,
      render: (_: any, record: any, index) => {
        if (index === 0) {
          return (
            <>
              {record.editAccess && (
                <Tooltip title={"Edit Audit Plan"}>
                  <IconButton
                    onClick={() => {
                      handleEditPlan(record);
                    }}
                    style={{ padding: "10px" }}
                  >
                    <div ref={refelemet5}>
                      <CustomEditICon width={20} height={20} />
                    </div>
                  </IconButton>
                </Tooltip>
              )}
              {record.whoCanSchedule && (
                <Tooltip title={"Create Audit Schedule"}>
                  <IconButton
                    onClick={() => {
                      handleEditSchedule(record);
                    }}
                    style={{ padding: "10px" }}
                  >
                    <div ref={refelemet6}>
                      <MdListAlt width={20} height={20} />
                    </div>
                  </IconButton>
                </Tooltip>
              )}
              {/* {
                <Tooltip title={"View Finalised Dates"}>
                  <IconButton
                    onClick={() => {
                      setAuditPeriodModal({
                        ...auditPeriodModaFl,
                        open: true,
                        data: record,
                      });
                    }}
                    style={{ padding: "10px" }}
                  >
                    <DateRangeIcon width={20} height={20} />
                  </IconButton>
                </Tooltip>
              } */}
              {record?.auditorCheck && (
                <Tooltip title={"View Finalised Dates"}>
                  <IconButton
                    onClick={() => {
                      setAuditPeriodModal({
                        ...auditPeriodModal,
                        open: true,
                        data: record,
                      });
                    }}
                    style={{ padding: "10px" }}
                  >
                    <MdDateRange width={20} height={20} />
                  </IconButton>
                </Tooltip>
              )}
              {isOrgAdmin && (
                <Tooltip title={"Delete Audit Plan"}>
                  <IconButton
                    onClick={() => {
                      handleOpen(record);
                    }}
                    style={{ padding: "10px" }}
                  >
                    <div ref={refelemet7}>
                      <CustomDeleteICon width={20} height={20} />
                    </div>
                  </IconButton>
                </Tooltip>
              )}
            </>
          );
        }
        return (
          <>
            {record.editAccess && (
              <Tooltip title={"Edit Audit Plan"}>
                <IconButton
                  onClick={() => {
                    handleEditPlan(record);
                  }}
                  style={{ padding: "10px" }}
                >
                  <div>
                    <CustomEditICon width={20} height={20} />
                  </div>
                </IconButton>
              </Tooltip>
            )}
            {record.whoCanSchedule && (
              <Tooltip title={"Create Audit Schedule"}>
                <IconButton
                  onClick={() => {
                    handleEditSchedule(record);
                  }}
                  style={{ padding: "10px" }}
                >
                  <div>
                    <MdListAlt width={20} height={20} />
                  </div>
                </IconButton>
              </Tooltip>
            )}
            {record?.auditorCheck && (
              <Tooltip title={"View Finalised Dates"}>
                <IconButton
                  onClick={() => {
                    setAuditPeriodModal({
                      ...auditPeriodModal,
                      open: true,
                      data: record,
                    });
                  }}
                  style={{ padding: "10px" }}
                >
                  <MdDateRange width={20} height={20} />
                </IconButton>
              </Tooltip>
            )}
            {/* <IconButton
                onClick={() => {
                  handleOpenScheduleCalendarMode(record);
                }}
                style={{ padding: "10px" }}
              >
                <ListAltIcon width={20} height={20} />
              </IconButton> */}
            {isOrgAdmin && (
              <Tooltip title={"Delete Audit Plan"}>
                <IconButton
                  onClick={() => {
                    handleOpen(record);
                  }}
                  style={{ padding: "10px" }}
                >
                  <div>
                    <CustomDeleteICon width={20} height={20} />
                  </div>
                </IconButton>
              </Tooltip>
            )}
          </>
        );
      },
    });
  }

  useEffect(() => {
    // setCurrentYear(currentyear);

    if (!!currentYear) {
      getAllAuditPlanDetails(currentYear);
    }
    fetchAuditType();
    getAllLocations();
    getLocationNames();
    getyear();
    getAuditType();
    // fetchSystem();
  }, []);

  // useEffect(() => {
  //   fetchSystem();
  // }, [selectedLocation, unitDisableData]);

  useEffect(() => {
    fetchSystemNew();
  }, [selectedLocation]);
  useEffect(() => {
    // if (
    //   // selectLocation !== undefined &&
    //   selectTableSystem !== undefined &&
    //   selectTableSystem?.length > 0 &&
    //   selectTableAuditType !== undefined
    // ) {
    if (
      !mode &&
      selectTableAuditType?.id !== undefined &&
      openAuditFinalize === false &&
      !!currentYear
    ) {
      getDataForDrops(currentStateNew);
    }
    canUserCreateAuditSchedule();
    canUserCreateAUditPlan();

    // } else {
    //   setDropData([]);
    //   setOptionData([]);
    // }
  }, [
    selectedLocation,
    selectTableSystem,
    selectTableAuditType,
    currentYear,
    openAudit,
    openAuditFinalize,
    // myAuditShow,
  ]);

  useEffect(() => {
    if (!isOrgAdmin) {
      setSelectedLocation({
        id: userDetails?.location?.id,
        locationName: userDetails?.location?.locationName,
      });
    }
  }, [locationNames]);

  useEffect(() => {
    if (!!currentYear && mode) {
      getAllAuditPlanDetails(currentYear);
      setAuditPlanYear(currentYear);
    }
    getCalendarData(searchValue, openAudit);
  }, [currentYear, selectTableAuditType, selectTableSystem]);

  const handleModalData = () => {
    setIsModalVisible(true);
  };

  const canUserCreateAuditSchedule = async () => {
    const isloggedUserCreate = await axios.get(
      `/api/auditPlan/isLoggedinUsercreateAuditScheduleByAuditTypeId/${selectTableAuditType?.id}`
    );
    setCreateSchedule(isloggedUserCreate?.data);
  };

  const canUserCreateAUditPlan = async () => {
    const isloggedUserCreate = await axios.get(
      `/api/auditPlan/isLoggedinUsercreateAuditPlanByAuditTypeId/${selectTableAuditType?.id}`
    );
    setCreate(isloggedUserCreate?.data);
  };

  const editScheduleDataForAll = async (task: any) => {
    setEditEntityData({
      title: task?.name,
      auditee:
        task?.auditScheduleData[0]?.auditScheduleEntityData?.auditee || [],
      auditor:
        task?.auditScheduleData[0]?.auditScheduleEntityData?.auditor || [],
      time: task?.auditScheduleData[0]?.auditScheduleEntityData?.time,
      id: task?.auditScheduleData[0]?.auditScheduleEntityData?._id,
      template:
        task?.auditScheduleData[0]?.auditScheduleEntityData?.auditTemplates ||
        [],
    });
    addEntityOptions(task);
    setEditEntityModal(true);
  };

  const getDataForDrops = async (value = "Planned") => {
    setDropData([]);
    setAuditPlanIds([]);
    if (value !== "All") {
      const systemParsed: any = selectTableSystem
        .map((value: any) => {
          return `system[]=${value.id}`;
        })
        .join("&");
      const res: any = await axios.get(
        `/api/auditPlan/getDetailsForDragAndDrop?location=${selectedLocation?.id}&${systemParsed}&year=${currentYear}&type=${selectTableAuditType?.id}&myAudit=${openAudit}&status=${value}&scope=${selectTableAuditType?.scope?.id}`
      );
      setDropData(res?.data?.data || []);
      setAuditPlanIds(res?.data?.id || []);
    } else {
      getAllData();
    }

    const resOptionData: any = await axios.get(
      `/api/auditPlan/getOptionsForDragAndDrop/${selectTableAuditType?.id}?loc=${selectedLocation?.id}`
    );
    // let option1Ids = new Set(
    //   res?.data?.map((item: any) => item.entityId)
    // );
    // Filter option2 to remove items with ids that exist in option1
    // let filteredOption2 = resOptionData.data.filter(
    //   (item: any) => !option1Ids.has(item.id)
    // );
    const optionDatafiltered = resOptionData?.data?.filter(
      (value: any) => value.access === true
    );
    setOptionData(optionDatafiltered || []);
  };

  const getyear = async () => {
    const currentyear = await getYearFormat(new Date().getFullYear());
    setCurrentYear(currentyear);
    setAuditPlanYear(currentyear);
  };

  useEffect(() => {
    const val = allAuditPlanDetails.map((obj) => {
      const systemNames = obj?.systemMaster?.map((system: any) => system.name);
      return {
        id: obj.id,
        systemType: obj.systemTypeName,
        roleId: obj.roleId,
        entityTypeName: obj.entityTypeName,
        auditYear: obj.auditYear,
        auditName: obj.auditName,
        auditTypeName: obj.auditTypeName,
        systemName: <MultiUserDisplay name="name" data={obj?.systemMaster} />,
        locationName: obj.locationName,
        editAccess: obj.editAccess,
        system: obj.systemMaster,
        isDraft: obj?.isDraft,
        whoCanSchedule: obj.whoCanSchedule,
        auditorCheck: obj?.auditorCheck,
      };
    });
    setData(val);
  }, [allAuditPlanDetails]);

  const fetchAuditType = async () => {
    const res: any = await axios.get(`/api/auditPlan/getAllAuditType`);
    const data: any = res?.data?.map((value: any) => {
      return {
        id: value?._id,
        value: value?.auditType,
        scope: JSON.parse(value?.scope),
        planType: value?.planType,
        responsibility: value?.responsibility,
        system: value?.system,
      };
    });
    setSelectTableAuditType({ ...data[0] });
    setAuditTypeOptions([...data]);
  };

  // const fetchSystem = async () => {
  //   const res = await axios.get(
  //     `/api/auditPlan/getAllSystemsData/${
  //       !unitDisableData ? selectedLocation?.id : null
  //     }`
  //   );
  //   setSystemOptions(res?.data);
  // };

  const fetchSystemNew = async () => {
    const res = await axios.get(
      `/api/auditPlan/getAllSystemsData/${selectedLocation?.id}`
    );
    setSystemOptions(res?.data);
  };

  const handlePagination = async (
    pagein: any,
    pageSizein: any = rowsPerPage
  ) => {
    await setPage(pagein);
    await setRowsPerPage(pageSizein);

    const systemData = selectTableSystem
      ?.map((value: any) => {
        return `systemNew[]=${value?.id}`;
      })
      .join("&");
    // getAllAuditPlanDetails(currentYear);
    await axios(
      `/api/auditPlan/getAllAuditPlan/${currentYear}/${selectedLocation?.id}?page=${pagein}&limit=${pageSizein}&search=${searchQuery?.searchQuery}&myAudit=${myAuditShow}&secAuditType=${selectTableAuditType?.id}&${systemData}`
    )
      .then((res) => {
        setAllAuditPlanDetails(res.data.data);
        setCount(res.data.count);
        setIsLoading(false);
      })
      .catch((err) => {
        // console.error(err);
        setIsLoading(false);
      });
  };

  const getAllLocations = () => {
    getAllLocation(realmName).then((response: any) => {
      setLocationListing(parseLocation(response?.data));
    });
  };

  const getLocationNames = async () => {
    setIsLoading(true);
    try {
      setIsLoading(true);
      const res = await axios.get(
        `api/location/getLocationsForOrg/${realmName}`
      );

      setLocationNames(res.data);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const parseLocation = (data: any) => {
    let systemTypes: any = [];
    data?.map((item: any) => {
      systemTypes.push({
        name: item?.locationName,
        value: item?.id,
      });

      if (item.locationName === currentLocation) {
        setSearchValue((prev: any) => {
          return { ...prev, location: item.id };
        });
      }
    });
    return systemTypes;
  };

  const handleChangePageNew: any = (page: any, pageSize: any = rowsPerPage) => {
    setPage(page);
    setRowsPerPage(pageSize);
  };
  const handleSearchChange = (e: any) => {
    e.preventDefault();
    setsearchQuery({
      ...searchQuery,
      [e.target.name]: e.target.value,
    });
  };
  // getAllAuditPlanDetails API
  const getAllAuditPlanDetails = async (year: any) => {
    setIsLoading(true);

    const systemData = selectTableSystem
      ?.map((value: any) => {
        return `systemNew[]=${value?.id}`;
      })
      .join("&");
    if (selectedLocation?.id) {
      await axios(
        `/api/auditPlan/getAllAuditPlan/${currentYear}/${selectedLocation?.id}?page=${page}&limit=${rowsPerPage}&myAudit=${myAuditShow}&secAuditType=${selectTableAuditType?.id}&${systemData}`
      )
        .then((res) => {
          setAllAuditPlanDetails(res.data.data);
          setCount(res.data.count);
          setIsLoading(false);
        })
        .catch((err) => {
          // console.error(err);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
      setAllAuditPlanDetails([]);
    }
  };

  const handleTableSearch = async () => {
    setPage(1);
    setRowsPerPage(10);

    const systemData = selectTableSystem
      ?.map((value: any) => {
        return `systemNew[]=${value?.id}`;
      })
      .join("&");
    await axios(
      `/api/auditPlan/getAllAuditPlan/${currentYear}/${
        selectedLocation?.id
      }?page=${1}&limit=${10}&search=${
        searchQuery?.searchQuery
      }&myAudit=${myAuditShow}&secAuditType=${
        selectTableAuditType?.id
      }&${systemData}`
    )
      .then((res) => {
        setAllAuditPlanDetails(res.data.data);
        setIsLoading(false);
      })
      .catch((err) => {
        // console.error(err);
        setIsLoading(false);
      });
  };

  const handleClickDiscard = async () => {
    setIsLoading(true);
    setsearchQuery({ searchQuery: "" });
    getAllAuditPlanDetails(currentYear);
    setIsLoading(false);
  };
  const openNewPlan = () => {
    navigate("/audit/auditplan/auditplanform");
  };

  const handleEditPlan = (data: any) => {
    navigate(`/audit/auditplan/auditplanform/${data.id}`);
  };

  const handleEditSchedule = (data: any) => {
    //set the schedule form type to planSchedule-create and navigate to the schedule form
    setScheduleFormType("planSchedule-create");
    navigate(`/audit/auditschedule/auditscheduleform/plan/${data.id}`);
  };

  const handleOpenScheduleCalendarMode = (data: any) => {
    navigate(`/audit`, {
      state: {
        openCalendar: true,
        auditPlanId: data.id,
        redirectToTab: "AUDIT SCHEDULE",
      },
    });
  };

  const handleDelete = async () => {
    setOpen(false);

    await axios
      .delete(`/api/auditPlan/deleteAuditPlanById/${deletePlan.id}`)
      .then(() =>
        enqueueSnackbar(`Operation Successfull`, { variant: "success" })
      )
      .catch((err) => {
        enqueueSnackbar(`Could not delete record`, {
          variant: "error",
        });
        // console.error(err);
      });
    getAllAuditPlanDetails(currentYear);
  };

  const handleOpen = (val: any) => {
    setOpen(true);
    setDeletePlan(val);
  };

  const handleChangeList = (event: any, values: any) => {
    setPage(1);
    setViewerMode(false);

    setRowsPerPage(10);
    setSelectedLocation(values);
    setSelectedUnit(!!values);
  };

  useEffect(() => {
    getAllAuditPlanDetails(currentYear);
  }, [selectedLocation]);

  // useEffect(() => {
  //   getDataForDrops();
  // }, [currentStateNew]);

  const formatDate = (date: any) => {
    const d = new Date(date);
    let day: any = d.getDate();
    let month: any = d.getMonth() + 1; // Months are zero-indexed
    const year = d.getFullYear();

    // Add leading zero if day or month is less than 10
    if (day < 10) {
      day = "0" + day;
    }
    if (month < 10) {
      month = "0" + month;
    }

    return `${day}-${month}-${year}`;
  };

  const getAllAuditScheduleDetails = async () => {
    setIsLoading(true);
    const encodedLocation = encodeURIComponent(
      JSON.stringify(selectedLocation)
    );
    await axios(
      `api/auditSchedule/getAllAuditschedule/${encodedLocation}/${currentYear}`
    )
      .then((res) => {
        // setAllAuditScheduleDetails(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        // console.error(err);
        setIsLoading(false);
      });
  };

  const confirmDelete = async () => {
    try {
      const response = await axios.delete(
        `/api/auditSchedule/deleteAuditScheduleById/${selectedTaskId}`
      );
      enqueueSnackbar("Successfully deleted audit schedule entity data.", {
        variant: "success",
      });
      setIsDeleteModalOpen(false);
      setSelectedTaskId("");
      getDataForDrops(currentStateNew);
    } catch (error) {
      enqueueSnackbar("Something went wrong.", { variant: "error" });
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedTaskId("");
    }
  };

  const handleFinalizeMode = async (data: any) => {
    const res = await axios.get(
      `/api/auditPlan/getAuditPlanSingle/${data?.auditPlanId}`
    );

    const finalData = {
      rowId: data?.auditPlanEntityWiseId,
      auditPlanId: data?.auditPlanId,
      unitId: data?.unitData === "Unit" ? data.id : selectedLocation.id,
      rowMonths: data?.months,
      unitName:
        data?.unitData === "Unit" ? data.name : selectedLocation?.locationName,
      format: data?.format,
      ...data,
    };
    const dataFor = {
      auditName: res.data.auditName,
      year: res.data.auditYear,
      status: res.data.status,
      isDraft: res.data.isDraft,
      location: {
        id: res.data.locationId,
        locationName: res.data.location,
      },
      checkOn: false,
      locationId: res.data.locationId,
      createdBy: res.data.createdBy,
      auditTypeName: res.data.auditTypeName,
      // createdOn: convertDate(res.data.createdAt),
      auditType: res.data.auditType,
      planType: res.data.planType,
      // lastModified: convertDate(res.data.updatedAt),
      systemType: res.data.systemTypeId,
      systemName:
        res.data.locationId === ""
          ? res.data.systemMaster
          : res.data.systemMaster.map((value: any) => value._id),
      prefixSuffix: res.data.prefixSuffix,
      scope: {
        id: res.data.entityTypeId,
        name: res.data.entityType,
      },
      // scope: res.data,
      // role: res.data,
      auditPlanId: res.data.id,
      role: res.data.roleId,
      auditorCheck: res.data.auditorCheck,
      comments: res.data.comments,
      AuditPlanEntitywise: res.data.auditPlanEntityWise.map((obj: any) => ({
        id: obj.id,
        entityId: obj.entityId,
        name: obj.entityName,
        months: obj.auditSchedule,
        auditors: obj.auditors,
        auditPlanId: obj.auditPlanId,
        deleted: obj.deleted,
      })),
    };
    navigate(`/audit/auditplan/auditplanform/${data?.auditPlanId}`, {
      state: { ...finalData, fromAuditPlanView: true, auditPlanData: dataFor },
    });
  };
  const initialBoard = Array.from({ length: 12 }, (_, index) => {
    // const monthName =new Date(0, monthIndex - 1).toLocaleString("en-US", {
    //   month: "long",
    // });
    const monthName =
      userDetails.organization.fiscalYearQuarters === "April - Mar"
        ? [
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
            "January",
            "February",
            "March",
          ]
        : [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ];
    const data: any = {
      id: `column-${monthName[index]}`,
      title: monthName[index],
      taskIds: dropData
        ?.map((value: any) => {
          if (value?.auditschedule?.includes(monthName[index])) {
            if (
              (currentStateNew === "Planned" || currentStateNew === "All") &&
              value?.type === "Planned"
            ) {
              const findData = value?.auditUnitReport?.find(
                (item: any) => item?.monthName === monthName[index]
              );
              const entityData = findData?.auditScheduleEntityWiseDataNew?.map(
                (item: any) => {
                  return {
                    id: item?.entityId,
                    editAccess: value?.editAccess,
                    auditPlanId: value?.auditPlanId,
                    auditorCheck: value?.auditorCheck,
                    systems: value?.systems,
                    scheduleAccess: value?.scheduleAccess,
                    unitData: value?.unitData,
                    months: value?.months,
                    auditPlanData: value?.auditPlanData,
                    format: value?.format,
                    unitId: value?.unitId,
                    createdBy: value?.createdBy,
                    isAuditReportCreated: item?.auditReportCreated,
                    type: findData?.type,
                    createdAt: value?.createdAt,
                    auditTypeName: value?.auditTypeName,
                    scheduleId: item?.auditScheduleDataId,
                    auditPlanUnitData: value?.auditPlanUnitData?.filter(
                      (item: any) => item?.auditPeriod == monthName[index]
                    ),
                    // auditReportFind
                    auditorReportId: findData?.auditReportFind,
                    isUserAbleToCreateReport:
                      findData?.isUserAbleToCreateReport,
                    auditeeId: item?.auditee?.map(
                      (auditeeDatas: any) => auditeeDatas?.id
                    ),
                    auditorId: item?.auditor?.map(
                      (auditorDatas: any) => auditorDatas?.id
                    ),
                    auditee: item?.auditee,
                    auditor: item?.auditor,
                    time: formatDate(item?.time) || "",
                    auditPlanEntityWiseId: value?.auditPlanEntityWiseId,
                    createdMonth: value?.createdMonth,
                    isScheduleCreated: true,
                    scheduleEntityId: item?._id || "",
                    name: item?.entityName || "",
                    title: item?.entityName || "", // Placeholder, replace with actual data
                  };
                }
              );
              // value?.unitChecker
              return {
                id: value.entityId,
                editAccess: value?.editAccess,
                auditPlanId: value?.auditPlanId,
                auditorCheck: value?.auditorCheck,
                systems: value?.systems,
                scheduleAccess: value?.scheduleAccess,
                unitData: value?.unitData,
                months: value?.months,
                auditPlanData: value?.auditPlanData,
                format: value?.format,
                unitId: value?.unitId,
                createdBy: value?.createdBy,
                isAuditReportCreated: findData?.auditReportCreated,
                type: findData?.type,
                entityData,
                createdAt: value?.createdAt,
                auditTypeName: value?.auditTypeName,
                scheduleId: findData?.auditScheduleDataId,
                auditTemplates: value?.auditTemplates,

                auditPlanUnitData: value?.auditPlanUnitData?.filter(
                  (item: any) => item?.auditPeriod == monthName[index]
                ),
                // auditReportFind
                auditorReportId: findData?.auditReportFind,
                isUserAbleToCreateReport: findData?.isUserAbleToCreateReport,
                auditeeId: findData?.auditee?.map(
                  (auditeeDatas: any) => auditeeDatas?.id
                ),
                auditorId: findData?.auditor?.map(
                  (auditorDatas: any) => auditorDatas?.id
                ),
                auditee: findData?.auditee
                  ?.map((auditeeData: any) => {
                    return auditeeData?.username;
                  })
                  .join(","),
                auditor: findData?.auditor
                  ?.map((auditorData: any) => {
                    return auditorData?.username;
                  })
                  .join(","),
                time: formatDate(findData?.time) || "",
                auditPlanEntityWiseId: value?.auditPlanEntityWiseId,
                createdMonth: value?.createdMonth,
                auditScheduleEntityId: value?._id,

                isScheduleCreated:
                  value?.createdMonth?.includes(monthName[index]) &&
                  findData?.scheduleCreated,
                name: value?.name || "",
                title: value?.name || "", // Placeholder, replace with actual data
              };
            }
            if (currentStateNew !== "Planned") {
              return {
                id: value.entityId,
                editAccess: false,
                auditPlanId: value?.auditPlanId,
                auditorCheck: value?.auditorCheck,
                systems: value?.systems,
                scheduleAccessEdit: value?.scheduleAccess,
                scheduleAccess: false,
                auditTypeName: value?.auditTypeData?.auditType,
                unitData: value?.unitData,
                months: value?.auditschedule,
                auditPlanData: value?.auditPlanData,
                format: value?.format,
                auditTemplates: value?.auditTemplates,

                auditScheduleEntityId: value?._id,
                unitId: value?.unitId,
                createdBy: value?.createdBy,
                isAuditReportCreated:
                  value?.lable === "Completed" ? true : false,
                type: "dept",
                entityData,
                createdAt: value?.createdAt,
                // auditTypeName: value?.auditTypeName,
                scheduleId: value?.auditScheduleId,

                auditPlanUnitData: value?.auditPlanUnitData?.filter(
                  (item: any) => item?.auditPeriod == monthName[index]
                ),
                // auditReportFind
                auditorReportId: value?.auditReportId,
                isUserAbleToCreateReport: value?.auditor?.includes(
                  userDetails?.id
                ),
                auditeeId: value?.auditee,
                auditorId: value?.auditor,
                auditee: value?.auditeeData,
                auditor: value?.auditorData,
                time: formatDate(value?.time) || "",
                scheduleTime: value?.time,
                auditPlanEntityWiseId: value?.auditPlanEntityWiseId,
                createdMonth: value?.createdMonth,
                isScheduleCreated: true,
                name: value?.name || "",
                title: value?.name || "", // Placeholder, replace with actual data
              };
            }
          }
          return null;
        })
        .filter((item: any) => {
          if (openAudit == false) {
            if (currentStateNew === "Scheduled") {
              if (
                item?.isScheduleCreated === true &&
                item?.isAuditReportCreated === false
              ) {
                return item;
              }
            } else if (currentStateNew === "Completed") {
              if (
                item?.isScheduleCreated === true &&
                item?.isAuditReportCreated === true
              ) {
                return item;
              }
            } else if (currentStateNew === "Planned") {
              if (
                item?.isScheduleCreated === false &&
                item?.isAuditReportCreated === false &&
                currentStateNew === "Planned"
                // && item?.type !=="unit"
              ) {
                return item;
              } else if (currentStateNew !== "Planned") {
                return item;
              }
            } else {
              return item;
            }
          } else {
            if (
              item?.auditeeId?.includes(userDetails?.id) ||
              item?.auditorId?.includes(userDetails?.id)
            ) {
              return item;
            }
          }
        })
        .filter((task: any) => task !== null),
    };
    return data;
  });
  const currentMonth = dayjs().format("MMMM"); // Get the current month as a string (e.g., "September")
  const currentMonthIndex = initialBoard.findIndex(
    (column: any) => column.title === currentMonth
  );

  const [activeIndex, setActiveIndex] = useState(currentMonthIndex);
  const onDragEnd: OnDragEndResponder = (result: any, provided: any) => {
    const { source, destination } = result;

    // Check if the destination is not null
    if (!destination) return;

    // If the task was dropped in the same column
    if (source.droppableId === destination.droppableId) {
      const column = initialBoard.find((col) => col.id === source.droppableId);
      if (!column) return;

      // Create a new array of taskIds for the column
      const newTaskIds = Array.from(column.taskIds);
      // Remove the taskId from its previous position
      const [removed] = newTaskIds.splice(source.index, 1);
      // Insert the taskId into its new position
      newTaskIds.splice(destination.index, 0, removed);

      // Update the column's taskIds with the new array
      column.taskIds = newTaskIds;

      // Return the updated columns
      return { columns: [...initialBoard] };
    }

    // If the task was dropped in a different column
    const sourceColumn = initialBoard.find(
      (col) => col.id === source.droppableId
    );
    const destinationColumn = initialBoard.find(
      (col) => col.id === destination.droppableId
    );

    if (!sourceColumn || !destinationColumn) return;

    // Create new arrays of taskIds for the source and destination columns
    const newSourceTaskIds = Array.from(sourceColumn.taskIds);
    const newDestinationTaskIds = Array.from(destinationColumn.taskIds);

    // Remove the taskId from the source column
    const [removed] = newSourceTaskIds.splice(source.index, 1);
    // Insert the taskId into the destination column
    newDestinationTaskIds.splice(destination.index, 0, removed);

    // Update the taskIds for the source and destination columns
    sourceColumn.taskIds = newSourceTaskIds;
    destinationColumn.taskIds = newDestinationTaskIds;

    // Return the updated columns
    return { columns: [...initialBoard] };
  };

  const onSlideChanged = (e: any) => {
    setActiveIndex(e.item); // Update the current index when the carousel changes
  };
  const handleCreateDropData = async (
    index: any,
    taskData: any,
    status: Boolean
  ) => {
    const monthNames =
      userDetails.organization.fiscalYearQuarters === "April - Mar"
        ? [
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
            "January",
            "February",
            "March",
          ]
        : [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ];
    if (status === true) {
      const auditPlanId: any = dropData[0]?.auditPlanId;
      let data;

      if (auditPlanId === undefined || auditPlanId === null) {
        data = {
          index: monthNames[index],
          auditPlanentityId: selectAdd?.map((value: any) => value?.id),
          auditPlanId: auditPlanId,
          location: selectedLocation?.id,
          currentYear,
          auditType: selectTableAuditType,
          system: selectTableSystem,
        };
      } else {
        data = {
          index: monthNames[index],
          auditPlanentityId: selectAdd?.map((value: any) => value?.id),
          auditPlanId: auditPlanId,
        };
      }

      const updateData = await axios.patch(
        `/api/auditPlan/updateDataofDropDown/${
          auditPlanId === undefined || auditPlanId === null ? "create" : status
        }`,
        data
      );
    } else {
      const auditPlanId: any = taskData.auditPlanId;
      const data = {
        index: monthNames[index],
        auditPlanentityId: taskData.id,
        auditPlanId: auditPlanId,
      };

      const updateData = await axios.patch(
        `/api/auditPlan/updateDataofDropDown/${status}`,
        data
      );
    }

    getDataForDrops(currentStateNew);
    setSelectAdd([]);
  };

  const createAuditScheduleForAll = (data: any) => {
    addEntityOptions(data);
    setTask(data);
    setIsEntityModal(true);
  };
  const addEntityOptions = async (task: any) => {
    // try {
    setSelectedEntityData(task?.name || "");
    // console.log("task data", task);
    const systemData = task?.auditPlanData?.systemMasterId
      .map((value: any) => {
        return `&system[]=${value}`;
      })
      .join("");
    // setAuditTypeSystem(task?.auditPlanData?.systemMasterId);
    if (
      selectTableAuditType?.id !== undefined &&
      selectedLocation?.id !== undefined
    ) {
      const auditorDataNew: any = await axios.get(
        `/api/auditSchedule/getAuditors?auditType=${selectTableAuditType?.id}&location=${selectedLocation?.id}${systemData}&dept=${task.id}`
      );
      const auditeeData: any = await axios.get(
        `/api/auditSchedule/getAuditeeByDepartment/${userDetails?.organizationId}/${task.id}`
      );

      const entityHead: any = auditeeData?.data?.entityHead?.map(
        (value: any) => {
          return { id: value.id, label: value?.email };
        }
      );
      const parsedAuditeeData: any = auditeeData?.data?.users?.map(
        (value: any) => {
          return {
            id: value?.id,
            label: `${value?.firstname} ${value?.lastname}`,
          };
        }
      );
      const parsedAuditorData = auditorDataNew?.data?.map((value: any) => {
        return {
          id: value.id,
          label: `${value?.firstname} ${value?.lastname}`,
          avatarUrl: value.avatar,
        };
      });
      setAuditorData(parsedAuditorData);
      const entityHeadIds = auditeeData?.data?.entityHead?.map(
        (value: any) => value?.id
      );
      const resData: any = await axios(
        `/api/auditSchedule/auditScheduleTemplate`
      ); // templates API here
      // .then((res) => {

      const data1 = resData?.data?.map((obj: any) => ({
        id: obj?._id,
        label: obj?.title,
      }));
      if (data1.length > 0) {
        setTemplate(data1);
      }
      // });
      const data = entityHeadIds?.length > 0 ? entityHeadIds : [];
      const parsedAuditeeeData =
        parsedAuditeeData?.length > 0 ? parsedAuditeeData : [];
      const entityHeads = entityHead?.length > 0 ? entityHead : [];
      setEntityData({ ...entityData, auditee: [...data] });

      let auditeeDataAll = [...parsedAuditeeeData, ...entityHeads];
      let auditorId = auditorData.map((value: any) => value.id);
      auditeeDataAll = auditeeDataAll.filter(
        (item) => !auditorId.includes(item.id)
      );
      setAuditeedata(auditeeDataAll);
    }
    // } catch (err) {}
  };
  //console.log("id planId", planId);

  const getAllData = async () => {
    try {
      const res: any = await axios.get(
        `/api/auditPlan/getDetailsForDragAndDropForAll?location=${selectedLocation?.id}&year=${currentYear}&type=${selectTableAuditType?.id}&myAudit=${openAudit}&scope=${selectTableAuditType?.scope?.id}&month=${months[currentMonthForBoard]}`
      );
      setBoardData(res?.data?.data);
      setPlanIdAll(res?.data?.auditPlanId || null);
    } catch (err) {}
  };
  const handleScheduleData = async (status = false) => {
    try {
      const updateData = {
        entityId: task.id,
        location: selectedLocation?.id,
        year: currentYear,
        system: task?.auditPlanData?.systemMasterId || [],
        auditor: entityData?.auditor || [],
        auditee: entityData?.auditee || [],
        auditPlanId: task?.auditPlanId,
        date: entityData?.time,
        status: status,
        checklist: entityData?.template,
        monthName: task?.monthName,
        auditType: selectTableAuditType?.id,
      };

      if (
        updateData?.date !== undefined &&
        updateData?.auditor.length > 0 &&
        updateData?.auditee.length > 0 &&
        updateData?.location !== undefined
      ) {
        await axios.patch(`/api/auditSchedule/dropAndAuditPlan`, updateData);

        enqueueSnackbar("Audit schedule updated successfully!", {
          variant: "success",
        });

        setIsEntityModal(false);
        setEntityData({});
        if (currentStateNew === "All") {
          getAllData();
        } else {
          getDataForDrops(currentStateNew);
        }
      } else {
        enqueueSnackbar("Please select all required fields before saving.", {
          variant: "warning",
        });
      }
    } catch (err: any) {
      let errMsg = "Failed to update audit schedule.";
      if (err?.response?.data?.error) {
        errMsg = err.response.data.error;
      } else if (err?.response?.data?.message) {
        errMsg = err.response.data.message;
      } else if (err?.message) {
        errMsg = err.message;
      }

      if (errMsg.includes("Auditor/Auditee conflict")) {
        setErrModal(true); // Open the modal
        setErrMessage(errMsg);
      } else {
        enqueueSnackbar(errMsg, { variant: "error" });
      }
    }
  };

  const responsive = {
    0: { items: 1 },
    600: { items: 2 },
    1024: { items: 4 },
  };

  const refreshCalendarData = () => {
    getCalendarData(searchValue);
  };

  const convertDate = (date: string) => {
    const d = new Date(date);

    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const currentDate = moment();
  const initialiseEntities = async () => {
    try {
      let endpoint = "";
      let mapData = (data: any) => [];

      if (selectTableAuditType.useFunctionsForPlanning === true) {
        // Fetch function-based data

        endpoint = `/api/auditPlan/getFunction/${selectTableAuditType.scope.id}`;
        mapData = (data) =>
          data.map((obj: any) => ({
            entityId: obj.id,
            name: obj.name,
            months:
              selectTableAuditType.planType === "Month"
                ? new Array(12).fill(false)
                : [currentDate],
            auditors: [],
          }));
      } else if (
        selectTableAuditType.scope.name === "Unit" ||
        selectTableAuditType.scope.name === "Corporate Function"
      ) {
        // Fetch location-based data for Unit or Corporate Function
        const scopeType =
          selectTableAuditType.scope.name === "Unit" ? "Unit" : "Function";
        endpoint = `/api/auditPlan/getLocationForAuditPlan/${scopeType}`;
        mapData = (data) =>
          data.map((obj: any) => ({
            entityId: obj.id,
            name: obj.locationName,
            months:
              selectTableAuditType.planType === "Month"
                ? new Array(12).fill(false)
                : [currentDate],
            auditors: [],
          }));
      } else {
        // Fetch other entities
        endpoint = `/api/auditPlan/getEntity/${selectedLocation?.id}/${selectTableAuditType.scope.id}`;
        mapData = (data) =>
          data.map((obj: any) => ({
            entityId: obj.id,
            name: obj.entityName,
            months:
              selectTableAuditType.planType === "Month"
                ? new Array(12).fill(false)
                : [],
            auditors: [],
          }));
      }
      // Fetch data and update state
      const response = await axios(endpoint);
      setAuditPlanDataNew((prev) => ({
        ...prev,
        AuditPlanEntitywise: mapData(response.data),
      }));
    } catch (error) {
      // console.error("Error fetching audit plan data:", error);
    }
  };

  const getAuditPlanDetailsById = async () => {
    // console.log("hello world", auditPlanData);
    // const auditPlanId = "66e1165abbf6b29a075c0f5d";
    // const auditPlanIdData = dropData
    //   .map((item: any) => item?.auditPlanId)
    //   .filter((value: any) => value !== undefined);

    const readAccess = optionData
      .map((item: any) => item.access)
      .filter((value: any) => value !== undefined);

    setIsReadOnly(readAccess?.includes(true) ? true : false);

    setAuditPlanId(auditPlanIds[0]);
    if (!auditPlanIds[0]) {
      const isloggedUserCreate = await axios.get(
        `/api/auditPlan/isLoggedinUsercreateAuditPlanByAuditTypeId/${selectTableAuditType?.id}`
      );
      setCreate(isloggedUserCreate?.data);
      if (isloggedUserCreate?.data == false) {
        enqueueSnackbar(`You Cannot create For This Audit Type`, {
          variant: "error",
        });
        return;
      } else {
        initialiseEntities();
      }
    } else {
      setEditMode(true);
      await axios(`/api/auditPlan/getAuditPlanSingle/${auditPlanIds[0]}`)
        .then((res: any) => {
          setScope(res.data.entityType);
          const data = res.data.auditPlanEntityWise
            .filter((obj: any) => obj.deleted)
            .map((obj: any) => ({
              id: obj.id,
              entityId: obj.entityId,
              name: obj.entityName,
              months: obj.auditSchedule,
              deleted: obj.deleted,
            }));
          setRemovedList(data);
          setAuditPlanDataNew({
            auditName: res.data.auditName,
            year: res.data.auditYear,
            status: res.data.status,
            isDraft: res.data.isDraft,
            location: {
              id: res.data.locationId,
              locationName: res.data.location,
            },
            checkOn: false,
            locationId: res.data.locationId,
            createdBy: res.data.createdBy,
            auditTypeName: res.data.auditTypeName,
            createdOn: convertDate(res.data.createdAt),
            auditType: res.data.auditType,
            planType: res.data.planType,
            lastModified: convertDate(res.data.updatedAt),
            systemType: res.data.systemTypeId,
            systemName:
              res.data.locationId === ""
                ? res.data.systemMaster
                : res.data.systemMaster.map((value: any) => value._id),
            prefixSuffix: res.data.prefixSuffix,
            scope: {
              id: res.data.entityTypeId,
              name: res.data.entityType,
            },
            // scope: res.data,
            // role: res.data,
            auditPlanId: res.data.id,
            role: res.data.roleId,
            useFunctionsForPlanning: res?.data?.useFunctionsForPlanning,
            auditorCheck: res.data.auditorCheck,
            comments: res.data.comments,
            AuditPlanEntitywise: res.data.auditPlanEntityWise.map(
              (obj: any) => ({
                id: obj.id,
                entityId: obj.entityId,
                name: obj.entityName,
                months: obj.auditSchedule,
                auditors: obj.auditors,
                auditPlanId: obj.auditPlanId,
                deleted: obj.deleted,
              })
            ),
          });
        })
        .catch((err) => {});
    }
  };

  const getAuditPlanDetailsForAll = async () => {
    // console.log("hello world", auditPlanData);
    // const auditPlanId = "66e1165abbf6b29a075c0f5d";
    // const auditPlanIdData = dropData
    //   .map((item: any) => item?.auditPlanId)
    //   .filter((value: any) => value !== undefined);

    const readAccess = optionData
      .map((item: any) => item.access)
      .filter((value: any) => value !== undefined);

    setIsReadOnly(readAccess?.includes(true) ? true : false);

    setAuditPlanId(plandIdAll);
    if (!plandIdAll) {
      const isloggedUserCreate = await axios.get(
        `/api/auditPlan/isLoggedinUsercreateAuditPlanByAuditTypeId/${selectTableAuditType?.id}`
      );
      setCreate(isloggedUserCreate?.data);
      if (isloggedUserCreate?.data == false) {
        enqueueSnackbar(`You Cannot create For This Audit Type`, {
          variant: "error",
        });
        return;
      } else {
        initialiseEntities();
      }
    } else {
      setEditMode(true);
      await axios(`/api/auditPlan/getAuditPlanSingle/${plandIdAll}`)
        .then((res: any) => {
          setScope(res.data.entityType);
          const data = res.data.auditPlanEntityWise
            .filter((obj: any) => obj.deleted)
            .map((obj: any) => ({
              id: obj.id,
              entityId: obj.entityId,
              name: obj.entityName,
              months: obj.auditSchedule,
              deleted: obj.deleted,
            }));
          setRemovedList(data);
          setAuditPlanDataNew({
            auditName: res.data.auditName,
            year: res.data.auditYear,
            status: res.data.status,
            isDraft: res.data.isDraft,
            location: {
              id: res.data.locationId,
              locationName: res.data.location,
            },
            checkOn: false,
            locationId: res.data.locationId,
            createdBy: res.data.createdBy,
            auditTypeName: res.data.auditTypeName,
            createdOn: convertDate(res.data.createdAt),
            auditType: res.data.auditType,
            planType: res.data.planType,
            lastModified: convertDate(res.data.updatedAt),
            systemType: res.data.systemTypeId,
            systemName:
              res.data.locationId === ""
                ? res.data.systemMaster
                : res.data.systemMaster.map((value: any) => value._id),
            prefixSuffix: res.data.prefixSuffix,
            scope: {
              id: res.data.entityTypeId,
              name: res.data.entityType,
            },
            // scope: res.data,
            // role: res.data,
            auditPlanId: res.data.id,
            role: res.data.roleId,
            useFunctionsForPlanning: res?.data?.useFunctionsForPlanning,
            auditorCheck: res.data.auditorCheck,
            comments: res.data.comments,
            AuditPlanEntitywise: res.data.auditPlanEntityWise.map(
              (obj: any) => ({
                id: obj.id,
                entityId: obj.entityId,
                name: obj.entityName,
                months: obj.auditSchedule,
                auditors: obj.auditors,
                auditPlanId: obj.auditPlanId,
                deleted: obj.deleted,
              })
            ),
          });
        })
        .catch((err) => {});
    }
  };

  const handleUpdate = async (status = true) => {
    if (status === false) {
      const test = [];

      for (let value of auditPlanDataNew?.AuditPlanEntitywise) {
        if (value.months.includes(true) === true) {
          test.push(true);
        }
      }

      if (test?.length === 0) {
        enqueueSnackbar(`Select Month`, {
          variant: "error",
        });
        return;
      }
    }
    try {
      setIsLoading(true);

      const systems = auditPlanDataNew?.systemName?.map(
        (item: any) => item.id || item._id
      );
      const temp = {
        auditName: auditPlanDataNew.auditName,
        auditYear: auditPlanDataNew.year,
        status: auditPlanDataNew.status,
        publishedOnDate: auditPlanDataNew.createdOn,
        systemTypeId: auditPlanDataNew.systemType,
        entityTypeId: auditPlanDataNew.scope.id,
        comments: auditPlanDataNew.comments,
        auditType: auditPlanDataNew.auditType,
        isDraft: status,
        location: isOrgAdmin
          ? auditPlanDataNew.locationId
          : auditPlanDataNew.location.id,
        systemMasterId:
          auditPlanDataNew?.location?.id === "" ||
          auditPlanDataNew?.locationId === ""
            ? systems
            : auditPlanDataNew.systemName,
        scope: auditPlanDataNew.scope,
        auditorCheck: auditPlanDataNew.auditorCheck,
        // auditors: auditPlanDataNew.auditors,
        role: auditPlanDataNew.role,
        roleId: auditPlanDataNew.role,
        AuditPlanEntitywise: auditPlanDataNew.AuditPlanEntitywise.map(
          (obj: any) => ({
            id: obj.id,
            entityId: obj.entityId,
            months: obj.months,
            auditors: obj.auditors,
          })
        ),
      };
      setDisabledButton(true);
      const res = await axios.put(
        `/api/auditPlan/updateAuditPlan/${auditPlanId}`,
        temp
      );
      if (status !== true) {
        setDisabledButton(false);

        if (res.status === 201 || res.status === 200) {
          try {
            const mail = await axios.post(
              `/api/auditPlan/sendMailForHead/${auditPlanId}`
            );
          } catch (error) {}
        }
      }
      setDisabledButton(false);
      setIsLoading(false);
      enqueueSnackbar(`successfully updated`, {
        variant: "success",
      });
      if (currentStateNew !== "All") {
        getDataForDrops(currentStateNew);
        setViewerMode(!viewerMode);
      } else {
        setViewerModelAll(!viewerModeAll);
      }
    } catch (err) {
      setDisabledButton(false);

      setIsLoading(false);
      enqueueSnackbar(`Error Occured while creating audit plan`, {
        variant: "error",
      });
    }
  };

  const handleCreate = async () => {
    try {
      const temp = {
        auditName: `${selectTableAuditType.value}-${auditYear}`,
        auditYear: auditYear,
        status: "active",
        isDraft: true,
        publishedOnDate: new Date(),
        createdBy: userDetails.username,
        updatedBy: userDetails.username,
        entityTypeId: selectTableAuditType.scope.id,
        comments: "",
        // location: data.hasOwnProperty('location') ? data.location : '',
        location: userDetails?.locationId,
        auditType: selectTableAuditType.id,
        organizationId: userDetails.organizationId,
        systemMasterId: selectTableAuditType.system || [],
        roleId: selectTableAuditType?.responsibility,
        // location: isOrgAdmin
        //   ? auditPlanDataNew.location
        //   : auditPlanDataNew.location.id,

        scope: selectTableAuditType.scope,
        // auditorCheck: auditPlanDataNew.auditorCheck,
        AuditPlanEntitywise: auditPlanDataNew.AuditPlanEntitywise.map(
          (obj: any) => ({
            entityId: obj.entityId,
            months: obj.months,
            auditors: obj.auditors,
            deleted: obj.deleted,
            // deleted :true,
          })
        ),
        // Use the transformedValue here
      };
      setDisabledButton(true);

      const res = await axios.post(`/api/auditPlan/createAuditPlan`, temp);
      setIsLoading(false);
      if (res.status === 200 || res.status === 201) {
        setDisabledButton(false);

        enqueueSnackbar(`successfully created`, {
          variant: "success",
        });
        if (currentStateNew !== "All") {
          getDataForDrops(currentStateNew);
          setViewerMode(!viewerMode);
        } else {
          setViewerModelAll(!viewerModeAll);
        }

        // if (!auditPlanData.auditorCheck) {
        // } else {
        // setFinalisedAuditorTourOpen(true);
        // }
      }
      setDisabledButton(false);
    } catch (err) {
      setDisabledButton(false);
    }
  };
  const closeOverlay = () => {
    setIsOpen(false);
  };
  const validateEntityData = (data: any) => {
    const errors = [];

    if (!data.title || typeof data.title !== "string") {
      errors.push("Invalid or missing 'title'");
    }

    if (
      !Array.isArray(data.auditee) ||
      !data.auditee?.every((id: any) => typeof id === "string")
    ) {
      errors.push("Invalid or missing 'auditee' (should be array of strings)");
    }

    if (
      !Array.isArray(data.auditor) ||
      !data.auditor.every((id: any) => typeof id === "string")
    ) {
      errors.push("Invalid or missing 'auditor' (should be array of strings)");
    }

    if (!data.time || isNaN(Date.parse(data.time))) {
      errors.push("Invalid or missing 'time'");
    }

    if (
      !Array.isArray(data.template) ||
      !data.template.every((id: any) => typeof id === "string")
    ) {
      errors.push("Invalid or missing 'template' (should be array of strings)");
    }

    if (data.auditee.length === 0) {
      errors.push("Auditee cannot be empty");
    }

    if (data.auditor.length === 0) {
      errors.push("Auditor cannot be empty");
    }

    const common = data.auditee.filter((id: any) => data.auditor.includes(id));
    if (common.length > 0) {
      errors.push("Auditee and Auditor cannot have overlapping users.");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  };
  const updateEntityData = async (status = false) => {
    const isValid = validateEntityData(editEntityData);

    if (!isValid.valid) {
      enqueueSnackbar(`Validation failed: ${isValid.errors.join(", ")}`, {
        variant: "error",
      });
      return;
    }
    try {
      const res = await axios.put(
        `/api/auditSchedule/updateAuditScheduleEntityData/${editEntityData.id}`,
        {
          auditee: editEntityData.auditee,
          auditor: editEntityData.auditor,
          time: editEntityData.time,
          status,
          auditTemplates: editEntityData?.template,
          comments: editEntityData?.comment,
        }
      );
      if (res.status === 200 || res.status === 201) {
        enqueueSnackbar("Successfully Updates", { variant: "success" });
        setEditEntityData({});
        setEditEntityModal(false);
        if (currentStateNew === "All") {
          getAllData();
        } else {
          getDataForDrops(currentStateNew);
        }
      }
    } catch (err: any) {
      let errMsg = "Failed to update audit schedule.";
      if (err?.response?.data?.error) {
        errMsg = err.response.data.error;
      } else if (err?.response?.data?.message) {
        errMsg = err.response.data.message;
      } else if (err?.message) {
        errMsg = err.message;
      }

      if (errMsg.includes("Auditor/Auditee conflict")) {
        setEditErrMessage(errMsg); // <== set the dynamic error text
        setEditErrModal(true); // open modal
      } else {
        enqueueSnackbar(errMsg, { variant: "error" });
      }
    }
  };
  const getVisibleMonthRange = () => {
    const start = initialBoard[activeIndex]?.title;
    const end =
      initialBoard[activeIndex + 3] && initialBoard.length > activeIndex + 3
        ? initialBoard[activeIndex + 3].title
        : initialBoard[initialBoard.length - 1]?.title;
    return `${start} - ${end}`;
  };
  const items = initialBoard.map((column: any, columnIndex) => (
    <Paper
      elevation={0}
      className={classes.column}
      key={column.id}
      // onMouseEnter={() => setHoveredColumn(column.id)}
      // onMouseLeave={() => setHoveredColumn(null)}
    >
      <div style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            height: "70px",
            padding: "0px 20px",
            backgroundColor: "white",
            border: "1px solid #ededed",
            borderRadius: "6px",
            boxShadow: "0 2px 2px 0 rgba(0, 0, 0, 0.25",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Typography variant="h4" className={classes.columnName}>
              {column.title}
            </Typography>

            {currentStateNew === "Planned" && userDetails?.organization?.activeModules?.includes('AI_FEATURES') &&
               (
                <IconButton
                  onClick={() => handleAssitantClick(column)}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "0px",
                    marginRight: "5px",
                  }}
                >
                  <GiStarShuriken
                    style={{ fontSize: "22px", color: "#ff6600" }}
                  />
                </IconButton>
              )}
          </div>

          <div style={{ display: "flex" }}>
            {/* <div>
              {

                selectTableAuditType !== undefined &&
                  (column?.taskIds
                    .map((item: any) => item.id)
                    .includes(userDetails.locationId) ||
                    isOrgAdmin) &&
                  column?.taskIds.length > 0 && (
                    <Tooltip title="Create Audit Schedule">
                      <IconButton
                        onClick={() => {
                          setPlanId(column?.taskIds[0]?.auditPlanId || "");
                          setScheduleFormType("planSchedule-create");
                          handleModalData();
                        }}
                        style={{
                          color: "black",
                          padding: "0px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <div
                          ref={refelemet6}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <ListAltIcon width={20} height={20} />
                        </div>
                      </IconButton>
                    </Tooltip>
                  )
              }
            </div> */}
            <div>
              {optionData
                ?.map((value: any) => value?.access)
                .every((item: any) => item === true) &&
                currentStateNew === "Planned" &&
                create && (
                  <Tooltip title="Add to Plan">
                    <IconButton
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "0px",
                      }}
                      onClick={() => setHoveredColumn(column.id)}
                    >
                      <FiPlusCircle
                        style={{ cursor: "pointer", color: "#003059" }}
                      />
                    </IconButton>
                  </Tooltip>
                )}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{ display: "flex", padding: "0px 5px", alignItems: "center" }}
      >
        {hoveredColumn === column.id && (
          <>
            {
              // column.taskIds
              //   .map((value: any) => value.editAccess)
              //   .every((value: any) => value === true) && (
              <Autocomplete
                limitTags={2}
                id="location-autocomplete"
                className={classes.inputRootOverride}
                multiple={true}
                options={optionData}
                getOptionLabel={(option) => option.name || ""}
                getOptionSelected={(option, value) => option.id === value.id}
                value={selectAdd}
                onChange={(e, value) => setSelectAdd(value)}
                style={{ width: "215px", padding: "10px" }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    size="small"
                    label="Add"
                    fullWidth
                    style={{ backgroundColor: "white" }}
                  />
                )}
              />
              // )
            }
            {selectAdd?.length > 0 && (
              <IconButton
                onClick={() => {
                  handleCreateDropData(columnIndex, {}, true);
                  setHoveredColumn(null);
                }}
                style={{
                  backgroundColor: "#F2F2F2",
                  padding: "4px", // Decrease padding
                  marginLeft: "5px",
                }}
                size="small" // Make IconButton itself smaller
              >
                <MdOutlineCheckCircle size={20} /> {/* Reduce icon size */}
              </IconButton>
            )}{" "}
            <IconButton
              onClick={() => {
                setHoveredColumn(null);
              }}
              style={{
                padding: "4px", // Decrease padding
                marginLeft: "5px",
              }}
              size="small"
            >
              <MdOutlineCancel
                size={20}
                style={{
                  color: "grey",
                  cursor: "pointer",
                }}
              />
            </IconButton>
          </>
        )}
      </div>

      <Droppable droppableId={column.id}>
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {column.taskIds.map((task: any, taskIndex: any) => (
              <Draggable draggableId={task.id} index={taskIndex} key={task.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={classes.taskContainer}
                  >
                    {/* <div
                      className={classes.header}
                      style={{
                        backgroundColor: `${
                          task.isAuditReportCreated && task.isScheduleCreated
                            ? "#d98cb3"
                            : task.isScheduleCreated
                            ? "#8cd9b3"
                            : "#9fbfdf"
                        }`,
                        color: "black",
                        padding: "3px 7px",
                        borderRadius: "3px",
                      }}
                    >
                      <Typography
                        variant="h6"
                        className={classes.title}
                        style={{ fontWeight: 600 }}
                      >
                        {task.isAuditReportCreated && task.isScheduleCreated
                          ? "Completed"
                          : task.isScheduleCreated
                          ? "Scheduled"
                          : "Planned"}
                      </Typography>
                      <div className={classes.rightEnd}>
                        {task?.isUserAbleToCreateReport &&
                        task?.isScheduleCreated === true &&
                        task?.isAuditReportCreated === false ? (
                          <Tooltip title={"Create Audit Report"}>
                            <IconButton
                              onClick={() => {
                                navigate("/audit/auditreport/newaudit", {
                                  state: {
                                    auditScheduleId: task.scheduleId,
                                    entityName: task.title,
                                    disableFields: true,
                                    auditScheduleName: "",
                                  },
                                });
                              }}
                              style={{
                                padding: "10px",
                                border: "2px",
                                // backgroundColor: "#042e54",
                                // color: "white",
                                borderRadius: "20%",
                              }}
                            >
                              <MdOutlineAddBox width={20} height={20} />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          ""
                        )}
                      </div>
                    </div> */}

                    <div
                      style={{
                        height: "10px",
                        width: "100%",
                        borderTopRightRadius: "8px",
                        borderTopLeftRadius: "8px",
                        backgroundColor: `${
                          task.isAuditReportCreated && task.isScheduleCreated
                            ? "#16a34a66"
                            : task.isScheduleCreated
                            ? "#d9770666"
                            : "#0369a14c"
                        }`,
                      }}
                    ></div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "16px 16px 8px 16px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        {task.type === "dept" ? (
                          <p
                            style={{
                              fontSize: "16px",
                              fontWeight: 500,
                              margin: "0px",
                              color: "#09090b",
                            }}
                          >
                            {task.title}
                          </p>
                        ) : (
                          <Badge count={task?.entityData?.length || 0}>
                            <span
                              className={classes.taskTag}
                              onClick={() => {
                                setEntityDataNew(task?.entityData || []);
                                setIsOpen(true);
                              }}
                            >
                              {task.title}
                            </span>
                          </Badge>
                        )}
                        {task?.isScheduleCreated === true &&
                          task?.isAuditReportCreated === false &&
                          task?.type === "dept" && (
                            <Popover
                              overlayInnerStyle={{
                                width: 300,
                                backgroundColor: "#000000c0",
                                color: "white",
                              }}
                              content={
                                <>
                                  <div
                                    style={{
                                      fontSize: "12px",
                                      margin: "0px 0px",
                                      display: "flex",
                                      justifyContent: "space-between",
                                      flex: 1,
                                    }}
                                  >
                                    <p
                                      style={{
                                        fontSize: "14px",
                                        fontWeight: 500,
                                        flex: 1,
                                        color: "white",
                                        margin: "0px 0px",
                                        display: "flex",
                                        gap: "5px",
                                        alignItems: "center",
                                      }}
                                    >
                                      <LuTag />
                                      Audit Type :{" "}
                                    </p>
                                    <p
                                      style={{
                                        fontSize: "14px",
                                        fontWeight: 500,
                                        flex: 1,
                                        color: " white",
                                        margin: "0px 0px",
                                      }}
                                    >
                                      {" "}
                                      {task?.auditTypeName || ""}
                                    </p>
                                  </div>

                                  <div
                                    style={{
                                      fontSize: "12px",
                                      margin: "0px 0px",
                                      display: "flex",
                                      justifyContent: "space-between",
                                      flex: 1,
                                    }}
                                  >
                                    <p
                                      style={{
                                        fontSize: "14px",
                                        fontWeight: 500,
                                        flex: 1,
                                        color: "white",
                                        margin: "0px 0px",
                                        display: "flex",
                                        gap: "5px",
                                        alignItems: "center",
                                      }}
                                    >
                                      <BsPerson />
                                      Created By :{" "}
                                    </p>
                                    <p
                                      style={{
                                        fontSize: "14px",
                                        fontWeight: 500,
                                        flex: 1,
                                        color: "white",
                                        margin: "0px 0px",
                                      }}
                                    >
                                      {" "}
                                      {task?.createdBy}
                                    </p>
                                  </div>

                                  <div
                                    style={{
                                      fontSize: "12px",
                                      margin: "0px 0px",
                                      display: "flex",
                                      flex: 1,
                                      justifyContent: "space-between",
                                    }}
                                  >
                                    <p
                                      style={{
                                        fontSize: "14px",
                                        fontWeight: 500,
                                        flex: 1,
                                        color: "white",
                                        margin: "0px 0px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "5px",
                                      }}
                                    >
                                      <LuCalendar />
                                      Created On :{" "}
                                    </p>
                                    <p
                                      style={{
                                        fontSize: "14px",
                                        fontWeight: 500,
                                        flex: 1,
                                        color: " white",
                                        margin: "0px 0px",
                                      }}
                                    >
                                      {" "}
                                      {formatDate(task?.createdAt)}
                                    </p>
                                  </div>
                                </>
                              }
                              trigger="click"
                            >
                              <IoMdInformationCircleOutline
                                style={{
                                  marginLeft: 8,
                                  color: "#000000d9",
                                  cursor: "pointer",
                                  fontSize: "18px",
                                }}
                              />
                            </Popover>
                          )}
                      </div>

                      <div className={classes.iconGroup} style={{ margin: "" }}>
                        {task?.auditorCheck &&
                        !task?.auditPlanUnitData[0]?.hasOwnProperty(
                          "auditPeriod"
                        ) ? (
                          <Tooltip title="Finalize Dates">
                            <IconButton
                              onClick={() => {
                                // handleFinalizeMode(task);
                                setModelMode("create");
                                setAuditPlanData({
                                  ...task?.auditPlanData,
                                  auditPlanUnitData: task?.auditPlanUnitData,
                                  unitName: task?.name,
                                  auditTypeName: task?.auditTypeName,
                                  unitId: task?.unitId,
                                  auditPlanId: task?.auditPlanId,
                                  rowMonths: task?.months,
                                  format: task?.format,
                                  auditPlanEntityWiseId:
                                    task?.auditPlanEntityWiseId,
                                  systemName:
                                    task?.auditPlanData?.systemMasterId,
                                });
                                setOpenAuditFinalize(true);
                              }}
                              style={{
                                color: "black",
                                padding: "0px",
                              }}
                            >
                              <MdDateRange
                                width={10}
                                height={10}
                                viewBox="0 0 30 30"
                                style={{
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          ""
                        )}

                        {task.scheduleAccess &&
                          !task.isScheduleCreated &&
                          task.unitData !== "Unit" &&
                          task?.unitData !== "corpFunction" && (
                            <Tooltip title="Create Audit Schedule">
                              <IconButton
                                onClick={() => {
                                  setTask({
                                    ...task,
                                    monthName: column?.title,
                                  });
                                  setEntityData({});
                                  addEntityOptions(task);
                                  setIsEntityModal(true);
                                }}
                                style={{
                                  color: "black",
                                  padding: "0px",
                                }}
                              >
                                <div ref={refelemet6}>
                                  <MdListAlt
                                    width={15}
                                    height={15}
                                    viewBox="0 0 30 30"
                                    style={{
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                    }}
                                  />
                                </div>
                              </IconButton>
                            </Tooltip>
                          )}
                        {!task?.isScheduleCreated &&
                          create &&
                          selectTableAuditType?.scope?.id !== "Unit" && (
                            <IconButton
                              onClick={() =>
                                handleCreateDropData(columnIndex, task, false)
                              }
                              style={{
                                color: "black",
                                padding: "0px 3px 4px 0px",
                              }}
                            >
                              <RiDeleteBin7Line
                                style={{
                                  color: "#f74c4cd9",
                                  fontSize: "18px",
                                  border: "1px",
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              />
                            </IconButton>
                          )}

                        {task?.isUserAbleToCreateReport &&
                        task?.isScheduleCreated === true &&
                        task?.isAuditReportCreated === false ? (
                          <Tooltip title={"Create Audit Report"}>
                            <IconButton
                              onClick={() => {
                                navigate("/audit/auditreport/newaudit", {
                                  state: {
                                    auditScheduleId: task.scheduleId,
                                    entityName: task.title,
                                    disableFields: true,
                                    auditScheduleName: "",
                                  },
                                });
                              }}
                              style={{
                                border: "2px",
                                borderRadius: "20%",
                                padding: "0px 0px",
                                margin: "0px 4px 0px 0px",
                                color: "#000000d9",
                              }}
                            >
                              <MdOutlineAddBox style={{ fontSize: "20px" }} />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          ""
                        )}

                        {task.hasOwnProperty("scheduleId") &&
                          task.scheduleId !== "" &&
                          task.isScheduleCreated && (
                            <div
                              style={{
                                fontSize: "12px",
                                margin: "0px 0px",
                                display: "flex",
                              }}
                            >
                              <Tooltip title={`Click to View Audit Schedule`}>
                                <IconButton
                                  onClick={() => {
                                    if (task.isScheduleCreated) {
                                      window.open(
                                        `/audit/auditschedule/auditscheduleform/schedule/${task?.scheduleId}`,
                                        "_blank"
                                      );
                                    }
                                  }}
                                  style={{
                                    border: "2px",
                                    borderRadius: "20%",
                                    padding: "0px 0px",
                                    margin: "0px 4px 0px 0px",
                                    color: "#000000d9",
                                  }}
                                >
                                  <MdOutlineEventAvailable
                                    style={{ fontSize: "18px" }}
                                  />
                                </IconButton>
                              </Tooltip>

                              {task.isAuditReportCreated && (
                                <Tooltip title={`Click to View Audit Report`}>
                                  <IconButton
                                    onClick={() => {
                                      if (task.isAuditReportCreated) {
                                        window.open(
                                          `/audit/auditreport/newaudit/${task?.auditorReportId}`,
                                          "_blank"
                                        );
                                      }
                                    }}
                                    style={{
                                      border: "2px",
                                      borderRadius: "20%",
                                      padding: "0px 0px",
                                      margin: "0px 4px 0px 0px",
                                      color: "#000000d9",
                                    }}
                                  >
                                    {" "}
                                    <MdAssessment
                                      style={{ fontSize: "18px" }}
                                    />
                                  </IconButton>
                                </Tooltip>
                              )}

                              {task.isAuditReportCreated === false &&
                                createSchedule && (
                                  <Tooltip
                                    title={`Click to Edit Audit Schedule Entity Wise Data`}
                                  >
                                    <IconButton
                                      onClick={() => {
                                        setEditEntityData({
                                          title: task.title,
                                          auditee: task?.auditeeId || [],
                                          auditor: task?.auditorId || [],
                                          time: task?.scheduleTime,
                                          id: task?.auditScheduleEntityId,
                                          template: task?.auditTemplates || [],
                                        });
                                        addEntityOptions(task);
                                        setEditEntityModal(true);
                                      }}
                                      style={{
                                        border: "2px",
                                        borderRadius: "20%",
                                        padding: "0px 0px",
                                        margin: "0px 4px 0px 0px",
                                        color: "#000000d9",
                                      }}
                                    >
                                      {" "}
                                      <MdOutlineEdit
                                        style={{ fontSize: "18px" }}
                                      />
                                    </IconButton>
                                  </Tooltip>
                                )}

                              {task.isAuditReportCreated === false &&
                                createSchedule && (
                                  <Tooltip
                                    title={`Click to Delete Audit Schedule Entity Wise Data`}
                                  >
                                    <IconButton
                                      onClick={() => {
                                        setSelectedTaskId(
                                          task?.auditScheduleEntityId
                                        );
                                        setIsDeleteModalOpen(true);
                                      }}
                                      style={{
                                        border: "2px",
                                        borderRadius: "20%",
                                        padding: "0px 0px",
                                        margin: "0px 0px 0px 0px",
                                        color: "#000000d9",
                                      }}
                                    >
                                      <RiDeleteBin7Line
                                        style={{
                                          color: "#f74c4cd9",
                                          fontSize: "18px",
                                        }}
                                      />
                                    </IconButton>
                                  </Tooltip>
                                )}
                            </div>
                          )}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "0px 16px 16px 16px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      {task?.isScheduleCreated === true &&
                      task?.isAuditReportCreated === false &&
                      task?.type === "dept" ? null : (
                        <>
                          {" "}
                          <div
                            style={{
                              fontSize: "12px",
                              margin: "0px 0px",
                              display: "flex",
                              justifyContent: "space-between",
                              flex: 1,
                            }}
                          >
                            <p
                              style={{
                                fontSize: "14px",
                                fontWeight: 500,
                                flex: 1,
                                color: "#4b5563",
                                margin: "0px 0px",
                                display: "flex",
                                gap: "5px",
                                alignItems: "center",
                              }}
                            >
                              <LuTag />
                              Audit Type :{" "}
                            </p>
                            <p
                              style={{
                                fontSize: "14px",
                                fontWeight: 500,
                                flex: 1,
                                color: " #09090b",
                                margin: "0px 0px",
                              }}
                            >
                              {" "}
                              {task?.auditTypeName || ""}
                            </p>
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              margin: "0px 0px",
                              display: "flex",
                              justifyContent: "space-between",
                              flex: 1,
                            }}
                          >
                            <p
                              style={{
                                fontSize: "14px",
                                fontWeight: 500,
                                flex: 1,
                                color: "#4b5563",
                                margin: "0px 0px",
                                display: "flex",
                                gap: "5px",
                                alignItems: "center",
                              }}
                            >
                              <BsPerson />
                              Created By :{" "}
                            </p>
                            <p
                              style={{
                                fontSize: "14px",
                                fontWeight: 500,
                                flex: 1,
                                color: " #09090b",
                                margin: "0px 0px",
                              }}
                            >
                              {" "}
                              {task?.createdBy}
                            </p>
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              margin: "0px 0px",
                              display: "flex",
                              flex: 1,
                              justifyContent: "space-between",
                            }}
                          >
                            <p
                              style={{
                                fontSize: "14px",
                                fontWeight: 500,
                                flex: 1,
                                color: "#4b5563",
                                margin: "0px 0px",
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                              }}
                            >
                              <LuCalendar />
                              Created On :{" "}
                            </p>
                            <p
                              style={{
                                fontSize: "14px",
                                fontWeight: 500,
                                flex: 1,
                                color: " #09090b",
                                margin: "0px 0px",
                              }}
                            >
                              {" "}
                              {formatDate(task?.createdAt)}
                            </p>
                          </div>
                        </>
                      )}

                      {task?.isScheduleCreated === true &&
                        task?.isAuditReportCreated === false &&
                        task?.type === "dept" && (
                          <div
                            style={{
                              fontSize: "12px",
                              margin: "0px 0px",
                              display: "flex",
                              flex: 1,
                              justifyContent: "space-between",
                            }}
                          >
                            <p
                              style={{
                                fontSize: "14px",
                                fontWeight: 500,
                                flex: 1,
                                color: "#4b5563",
                                margin: "0px 0px",
                                display: "flex",
                                gap: "5px",
                                alignItems: "center",
                              }}
                            >
                              <BsPerson />
                              Auditor :{" "}
                            </p>
                            <p
                              style={{
                                fontSize: "14px",
                                fontWeight: 500,
                                flex: 1,
                                color: " #09090b",
                                margin: "0px 0px",
                              }}
                            >
                              {" "}
                              {task?.auditor}
                            </p>
                          </div>
                        )}

                      {task?.isScheduleCreated === true &&
                        task?.isAuditReportCreated === false &&
                        task?.type === "dept" && (
                          <div
                            style={{
                              fontSize: "12px",
                              margin: "0px 0px",
                              display: "flex",
                              flex: 1,
                              justifyContent: "space-between",
                            }}
                          >
                            <p
                              style={{
                                fontSize: "14px",
                                fontWeight: 500,
                                flex: 1,
                                color: "#4b5563",
                                margin: "0px 0px",
                                display: "flex",
                                gap: "5px",
                                alignItems: "center",
                              }}
                            >
                              <BsPerson />
                              Auditee :{" "}
                            </p>
                            <p
                              style={{
                                fontSize: "14px",
                                fontWeight: 500,
                                flex: 1,
                                color: " #09090b",
                                margin: "0px 0px",
                              }}
                            >
                              {" "}
                              {task?.auditee}
                            </p>
                          </div>
                        )}

                      {task?.isScheduleCreated === true &&
                        task?.isAuditReportCreated === false &&
                        task?.type === "dept" && (
                          <div
                            style={{
                              fontSize: "12px",
                              margin: "0px 0px",
                              display: "flex",
                              flex: 1,
                              justifyContent: "space-between",
                            }}
                          >
                            <p
                              style={{
                                fontSize: "14px",
                                fontWeight: 500,
                                flex: 1,
                                color: "#4b5563",
                                margin: "0px 0px",
                                display: "flex",
                                gap: "5px",
                                alignItems: "center",
                              }}
                            >
                              <MdAccessTime />
                              Scheduled:{" "}
                            </p>
                            <p
                              style={{
                                fontSize: "14px",
                                fontWeight: 500,
                                flex: 1,
                                color: " #09090b",
                                margin: "0px 0px",
                              }}
                            >
                              {" "}
                              {task?.time || ""}
                            </p>
                          </div>
                        )}

                      {/* <div
                          style={{
                            fontSize: "12px",
                            margin: "0px 0px",
                            display: "flex",
                          }}
                        >
                          <p
                            style={{
                              margin: "2px 5px",
                              fontWeight: 600,
                            }}
                          >
                            System :{" "}
                          </p>
                          <p
                            style={{
                              margin: "2px 5px",
                            }}
                          >
                            {" "}
                            {task?.systems}
                          </p>
                        </div> */}
                    </div>

                    {task?.auditPlanUnitData ? (
                      <div>
                        {/* !!finalisedDateRange?.fromDate
                            ? dayjs(finalisedDateRange?.fromDate)
                            : null, */}
                        {task?.auditPlanUnitData?.map((item: any) => (
                          <div className={classes.datePickersContainer}>
                            <RangePicker
                              className={classes.disabledRangePicker}
                              // value=[{task?.auditPlanUnitData?.fromDate},]
                              format="DD-MM-YYYY"
                              disabled={true}
                              value={[
                                !!item?.fromDate ? dayjs(item?.fromDate) : null,
                                !!item?.toDate ? dayjs(item?.toDate) : null,
                              ]}
                              style={{
                                border: "1px solid black",
                                width: "220px",
                              }}
                              // toDate={task?.auditPlanUnitData?.fromDate?.toDate}
                            />
                            <IconButton
                              onClick={() => {
                                setModelMode("edit");
                                setAuditPlanData({
                                  ...task?.auditPlanData,
                                  auditPlanUnitData: item,
                                  unitName: task?.name,
                                  auditTypeName: task?.auditTypeName,
                                  unitId: task?.unitId,
                                  auditPlanId: task?.auditPlanId,
                                  rowMonths: task?.months,
                                  format: task?.format,
                                  auditPlanEntityWiseId:
                                    task?.auditPlanEntityWiseId,

                                  systemName:
                                    task?.auditPlanData?.systemMasterId,
                                });
                                setOpenAuditFinalize(true);
                              }}
                              style={{
                                color: "black",
                                padding: "0px",
                              }}
                            >
                              <Tooltip title="View Finalised Dates">
                                <MdVisibility width={15} height={15} />
                              </Tooltip>
                            </IconButton>
                          </div>
                        ))}
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </Paper>
  ));

  const [selected, setSelected] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState(false);
  const [currentState, setCurrentState] = useState("off"); // 'on', 'off', 'auto'
  const [selectedCard, setSelectedCard] = useState(false);
  const [selectedUnitCard, setSelectedUnitCard] = useState(false);

  const toggleCalendarModal = (data: any = {}) => {
    setCalendarModalInfo({
      ...calendarModalInfo,
      open: !calendarModalInfo.open,
      data: data,
      dataLoaded: data?.id ? true : false,
    });
  };
  const handleChange = (key: any) => {
    // initialBoard()
    setOpenAudit(false);
    getDataForDrops(key);
    setCurrentStateNew(key);
  };

  // mobile view filter moda.

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  function addEndTime(audits: any = []) {
    return audits.map((audit: any) => {
      // Calculate endTime by adding the duration (in hours) to the scheduledTime
      const startTime = new Date(audit.scheduledTime);
      const endTime = new Date(
        startTime.getTime() + audit.duration * 60 * 60 * 1000
      );

      // Helper function to format date to "YYYY-MM-DDTHH:mm" format
      const formatToLocalString = (date: any) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      // Add the calculated endTime to the audit object
      return {
        ...audit,
        endTime: formatToLocalString(endTime), // Use the same format as scheduledTime
      };
    });
  }

  const getAuditeeListByDept = async (entityIdArray: any) => {
    try {
      const res = await axios.post(`/api/auditPlan/getAuditeeByEntities`, {
        entityIdArray: entityIdArray,
      });
      // console.log("Response for auditee list by dept", res);
      return res?.data;
    } catch (error) {
      // console.log("Error fetching auditee list by dept", error);
    }
  };

  const generateChecklistByAuditScope = async (auditScheduleData: any) => {
    const payloadData = {
      data: dataForChecklistGeneration?.map((item: any) => ({
        ...item,
        audit_scope: assistantFormData?.auditScopePromptText,
        location_name: userDetails?.location?.locationName,
        org_id: userDetails?.organizationId,
        created_by: userDetails?.id,
      })),
      scheduleData: {
        ...auditScheduleData,
        auditScope: assistantFormData?.auditScopePromptText,
      },
    };
    // console.log("payloadData", payloadData);

    const res = await axios.post(
      `${process.env.REACT_APP_PY_URL}/pyapi/generate_checklist`,
      {
        ...payloadData,
      }
    );
    showLoader("Checklists are being genereted...");

    if (res?.status == 200 || res?.status === 201) {
      //You can view status in Documents>Settings>Job Summary
      setAuditScopeSubmitLoader(false);
      hideLoader();
      setOpenAssistantModal(false);
    }
  };

  const nextStep = () => {
    // generateChecklistByAuditScope()
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const toggleAssistantModal = () => {
    setOpenAssistantModal(!openAssistantModal);
  };

  const getExistingCalendarData = async (auditObj: {
    auditType: string;
    auditYear: string;
  }) => {
    const url = `api/auditSchedule/getAuditSchseduleEntityWiseCalendardata?auditYear=${auditObj?.auditYear}&locationId=&systemTypeId=&systemMasterId=&auditor=&auditType=${auditObj?.auditType}`;
    try {
      const res: any = await axios.get(url);

      return res.data;
    } catch (error) {
      // console.error("Error fetching calendar data:", error);
      return [];
    }
  };

  const formatTime = (date: Date) => {
    return date.toISOString().slice(0, 16); // Extract YYYY-MM-DDTHH:mm
  };

  const constructAuditPlanData = (auditeeList: any, auditorList: any) => {
    const auditPlanData = dataForChecklistGeneration?.map((planObj: any) => {
      const auditee = auditeeList.find(
        (auditeeObj: any) => auditeeObj?.entityId === planObj?.entity_id
      );
      const auditors = auditorList.find(
        (auditorObj: any) => auditorObj?.entityId === planObj?.entity_id
      );
      return {
        ...planObj,
        entity_id: planObj?.entity_id,
        entity_name: planObj?.entity_name,
        month: planObj?.month,
        audit_type_name: planObj?.audit_type_name,
        auditors: auditors?.auditors,
        auditee: auditee?.auditees,
      };
    });
    return auditPlanData;
  };
  const scheduleAudits = (
    auditPlans: any,
    auditData: any,
    existingCalendarData: any,
    isSaturdayWorking: boolean
  ) => {
    const { auditDateRange, auditDuration } = auditData;

    // Helper function to parse dd-mm-yyyy format to a Date object
    const parseDateFromDDMMYYYY = (dateString: string) => {
      const [day, month, year] = dateString.split("-").map(Number);
      return new Date(year, month - 1, day); // month is 0-based in JS
    };

    // Helper function to format date to `YYYY-MM-DDTHH:mm` in local time
    const formatToLocalISODateTime = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const addHours = (date: Date, hours: number) =>
      new Date(date.getTime() + hours * 60 * 60 * 1000);
    const addDays = (date: Date, days: number) =>
      new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

    const workingHoursStart = 9; // 9 AM
    const workingHoursEnd = 18; // 6 PM
    const holidays = ["2025-01-26"]; // Example holidays (Republic Day)

    const isHoliday = (date: Date) => {
      const dateString = date.toISOString().split("T")[0];
      return holidays.includes(dateString);
    };

    const isWorkingDay = (date: Date) => {
      const dayOfWeek = date.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
      if (dayOfWeek === 0 || (!isSaturdayWorking && dayOfWeek === 6)) {
        return false; // Exclude Sunday and Saturday (if not working)
      }
      return true;
    };

    const isWithinWorkingHours = (date: Date, duration: number) => {
      const startHour = date.getHours();
      const endHour = addHours(date, duration).getHours();
      const sameDay = date.getDate() === addHours(date, duration).getDate();

      return (
        startHour >= workingHoursStart &&
        endHour <= workingHoursEnd &&
        sameDay && // Ensure the audit doesn't span to the next day
        isWorkingDay(date) &&
        !isHoliday(date)
      );
    };

    const isTimeConflict = (
      startTime: Date,
      endTime: Date,
      calendarEntry: any
    ) => {
      const entryStart = new Date(calendarEntry.time || calendarEntry.start);
      const entryDuration = calendarEntry.duration || 1; // Default to 1 hour if duration is not provided
      const entryEnd = addHours(entryStart, entryDuration);
      return startTime < entryEnd && endTime > entryStart;
    };

    const findFreeTimeInRange = (
      auditors: any,
      auditees: any,
      calendar: any,
      rangeStart: Date,
      rangeEnd: Date,
      duration: number,
      gap: number // Added gap parameter
    ) => {
      let currentTime = new Date(rangeStart);

      while (currentTime <= rangeEnd) {
        // Check if within working hours
        if (!isWithinWorkingHours(currentTime, duration + gap)) {
          currentTime = addHours(currentTime, 1);
          continue;
        }

        const currentEndTime = addHours(currentTime, duration);
        const isAvailable = calendar.every((entry: any) => {
          const hasAuditorConflict = auditors.some((auditor: any) =>
            entry.auditor.includes(auditor)
          );
          const hasAuditeeConflict = auditees.some((auditee: any) =>
            entry.auditee.includes(auditee)
          );
          return (
            !(hasAuditorConflict || hasAuditeeConflict) ||
            !isTimeConflict(currentTime, currentEndTime, entry)
          );
        });

        if (isAvailable) {
          return currentTime; // Found a free time slot
        }

        // Increment time by 1 hour
        currentTime = addHours(currentTime, 1);

        // Reset to next day if past working hours
        if (currentTime.getHours() >= workingHoursEnd) {
          currentTime = new Date(
            currentTime.setHours(workingHoursStart, 0, 0, 0)
          );
          currentTime = addDays(currentTime, 1);
        }
      }

      return null; // No free time found
    };

    const auditorStatuses: any = {}; // Track usage of auditors (P0, P1, etc.)
    const scheduledAudits: any = [];
    const [rangeStart, rangeEnd] = auditDateRange.map(parseDateFromDDMMYYYY);

    auditPlans.forEach((plan: any) => {
      const { auditors, auditee, entity_name, month, entity_id } = plan;

      // Extract IDs from auditor and auditee objects
      const auditorIds = auditors.map((auditor: any) => auditor.id);
      const auditeeIds = auditee.map((auditee: any) => auditee.id);

      // Initialize auditor statuses
      auditorIds.forEach((auditor: any) => {
        if (!auditorStatuses[auditor]) {
          auditorStatuses[auditor] = 0; // Set status to P0 initially
        }
      });

      // Filter available auditors by usage status
      let availableAuditors: any = auditorIds.filter(
        (auditor: any) => auditorStatuses[auditor] === 0
      );

      if (availableAuditors.length === 0) {
        // If no P0 auditors, increment the status
        const minStatus = Math.min(
          ...(Object.values(auditorStatuses) as number[])
        );
        availableAuditors = auditorIds.filter(
          (auditor: any) => auditorStatuses[auditor] === minStatus
        );
      }

      // Find free time within the date range
      const scheduledTime = findFreeTimeInRange(
        availableAuditors,
        auditeeIds,
        existingCalendarData,
        rangeStart,
        rangeEnd,
        auditDuration,
        1 // Added 1-hour gap
      );

      if (scheduledTime) {
        scheduledAudits.push({
          entityName: entity_name,
          entityId: entity_id,
          month,
          scheduledTime: formatToLocalISODateTime(scheduledTime), // Local time format
          duration: auditDuration,
          auditors: availableAuditors,
          auditee: auditeeIds,
        });

        existingCalendarData.push({
          start: scheduledTime.toISOString(),
          duration: auditDuration,
          auditor: availableAuditors,
          auditee: auditeeIds,
        });

        // Update auditor statuses
        availableAuditors.forEach((auditor: any) => {
          auditorStatuses[auditor] += 1;
        });

        // Add gap between audits
        existingCalendarData.push({
          start: addHours(scheduledTime, auditDuration).toISOString(),
          duration: 1, // Add 1-hour gap
          auditor: availableAuditors,
          auditee: auditeeIds,
          gap: true, // Mark it as a gap
        });
      } else {
        // console.log(
        //   `No available time slot for ${entity_name} within the date range.`
        // );
      }
    });

    return scheduledAudits;
  };

  const constructScheduleData = (
    auditPlanData: any,
    auditData: any,
    calendarEntries: any
  ) => {
    // console.log("audit plan data in constuctScheduleDat", auditPlanData);

    const scheduleName = `${auditPlanData[0]?.audit_type_name} - Generated Audit Schedule For - ${auditPlanData[0]?.month}`;
    const data = {
      auditYear: auditYear,
      auditPeriod: auditPlanData[0]?.month,
      auditScheduleName: scheduleName,
      auditNumber: auditPlanData[0]?.auditPlanId,
      auditScheduleNumber: "",
      status: "active",
      createdBy: userDetails?.id,
      roleId: auditPlanData[0]?.roleId,
      auditType: auditPlanData[0]?.audit_type_id,
      entityTypeId: auditPlanData[0]?.entityTypeId,
      auditPlanId: auditPlanData[0]?.auditPlanId,
      locationId: auditPlanData[0]?.location,
      systemMasterId: auditPlanData[0]?.systems_arr,
      selectedFunction: [],
      isDraft: true,
      auditTemplates: [],
      useFunctionsForPlanning: false,
      auditScheduleEntityWise: calendarEntries?.map((item: any) => ({
        entityId: item?.entityId,
        time: item?.scheduledTime,
        auditor: item?.auditors,
        auditee: item?.auditee,
        comments: "",
        endTime: item?.endTime,
        duration: item?.duration,
        auditTemplates: [],
      })),
      userId: userDetails?.id,
    };

    return data;
  };

  const handleCreateSchedule = async (
    auditPlanData: any,
    auditData: any,
    calendarEntries: any
  ) => {
    try {
      const scheduleData = constructScheduleData(
        auditPlanData,
        auditData,
        calendarEntries
      );
      // console.log("schedule to be created --->", scheduleData);
      generateChecklistByAuditScope(scheduleData);
      // const res = await axios.post(
      //   `api/auditSchedule/createAuditSchedule`,
      //   scheduleData
      // );
      // if(res?.status === 200 || res?.status === 201) {
      //   enqueueSnackbar("Schedule Created As Draft Successufully with dummy checklist", {
      //     variant : "info"
      //   })
      // }
    } catch (error) {}
  };

  const handleSubmit = async () => {
    setAuditScopeSubmitLoader(true);
    const deptAuditeeList = await getAuditeeListByDept(
      dataForChecklistGeneration?.map((item: any) => item?.entity_id)
    );

    const payloadObjectForAudiorList = dataForChecklistGeneration?.map(
      (item: any) => ({
        ...item,
        auditType: item?.audit_type_id,
        location: item?.location,
        system: item?.systems_arr,
        auditedEntity: item?.entity_id,
      })
    );

    const deptAuditorList = await Promise.all(
      payloadObjectForAudiorList.map((payload: any) =>
        getAllAuditorsNew(payload).then((res: any) => ({
          entityId: payload.auditedEntity, // Include `entityId` from the payload
          auditors: res.data || [], // Extract `data` from the response
        }))
      )
    );

    const auditPlanData = constructAuditPlanData(
      deptAuditeeList,
      deptAuditorList
    );
    // console.log("Audit Plan Data", auditPlanData);

    const auditData = {
      auditDateRange: assistantFormData?.auditDateRange,
      auditDuration: assistantFormData?.auditDuration,
    };
    // console.log("Audit Data", auditData);
    const existingCalendarData = await getExistingCalendarData({
      auditType: dataForChecklistGeneration[0]?.audit_type_id,
      auditYear: auditYear,
    });
    // console.log("Calendar Data", existingCalendarData);
    const newCalData = [...existingCalendarData];
    const results = scheduleAudits(auditPlanData, auditData, newCalData, false);
    // console.log("Results for schedule audits", results);
    const updatedResults = addEndTime(results);
    // console.log("Updated Results", updatedResults);
    handleCreateSchedule(auditPlanData, auditData, updatedResults);
    // setOpenAssistantModal(false);
  };

  const handleAssitantClick = (columnData: any) => {
    // console.log("column data", columnData);
    const plannedDepartment = columnData?.taskIds?.filter(
      (item: any) => !item?.isScheduleCreated
    );
    // console.log("plannedDepartment", plannedDepartment);

    const entityList = plannedDepartment?.map((item: any) => ({
      entity_id: item?.id,
      entity_name: item?.name,
      month: columnData?.title,
      audit_type_name: item?.auditTypeName,
      audit_type_id: item?.auditPlanData?.auditType,
      systems_arr: item?.auditPlanData?.systemMasterId,
      location: item?.auditPlanData?.location,
      auditPlanId: item?.auditPlanId,
      roleId: item?.auditPlanData?.roleId,
      entityTypeId: item?.auditPlanData?.entityTypeId,
    }));

    setDataForChecklistGeneration(entityList);
    setOpenAssistantModal(true);
  };
  return (
    <>
      <div className={classes.root}>
        <ConfirmDialog
          open={open}
          handleClose={() => setOpen(false)}
          handleDelete={handleDelete}
        />
        {openAssistantModal && (
          <AuditAssistantModal
            openAssistantModal={openAssistantModal}
            toggleAssistantModal={toggleAssistantModal}
            assistantFormData={assistantFormData}
            setAssistantFormData={setAssistantFormData}
            currentStep={currentStep}
            nextStep={nextStep}
            prevStep={prevStep}
            handleSubmit={handleSubmit}
            submitLoader={auditScopeSubmitLoader}
          />
        )}
        <div>
          {" "}
          {!viewerMode && selectCalenderview !== true && (
            <div
              style={{
                marginLeft: "auto",
                paddingRight: matches ? "10px" : "0px",
                paddingTop: "24px",
              }}
            >
              {/* Pushes Segmented to the right */}
              <Segmented
                style={{
                  // backgroundColor: "#ffffff",
                  borderRadius: "5px",
                  // border: "2px solid #000000",
                  fontSize: matches ? "14px" : "12px",
                  padding: "2px",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                }}
                defaultValue="Scheduled"
                value={currentStateNew}
                options={["All", "Planned", "Scheduled", "Completed"]}
                onChange={handleChange}
                className={classes.segmentedItem}
              />
            </div>
          )}
        </div>
        <Box
          className={classes.searchContainer}
          style={{ marginTop: matches ? "10px" : "20px" }}
        >
          <div
            style={{
              display: matches ? "flex" : "grid",
              justifyContent: "space-between",
              alignItems: "center",
              gap: matches ? "10px" : "10px",
              paddingTop: "5px",
              paddingLeft: "10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "5px" }}
              >
                <div className={newClasses.dropdownLabel}>Type : </div>
                <FormControl variant="outlined" size="small" fullWidth>
                  <div style={{}} ref={refelemet2}>
                    <Autocomplete
                      id="type-autocomplete"
                      className={newClasses.compactAutocomplete}
                      options={auditTypeOptions}
                      getOptionLabel={(option: any) => option.value || ""}
                      getOptionSelected={(option: any, value) =>
                        option.id === value.id
                      }
                      value={selectTableAuditType}
                      onChange={(e: any, value: any) => {
                        setViewerMode(false);
                        setSelectTableAuditType(value);
                        setSelected(!!value);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          size="small"
                          placeholder="Select type"
                          fullWidth
                          className={
                            selected
                              ? newClasses.filledInput
                              : newClasses.placeholderInput
                          }
                        />
                      )}
                    />
                  </div>
                </FormControl>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginLeft: "10px",
                }}
              >
                <div className={newClasses.dropdownLabel}>Unit : </div>
                <FormControl variant="outlined" size="small" fullWidth>
                  <div style={{}} ref={refelemet2}>
                    <Autocomplete
                      id="unit-autocomplete"
                      className={newClasses.compactAutocomplete}
                      options={
                        Array.isArray(locationNames)
                          ? [allOption, ...locationNames]
                          : [allOption]
                      }
                      getOptionLabel={(option) => option.locationName || ""}
                      getOptionSelected={(option, value) =>
                        option.id === value.id
                      }
                      value={selectedLocation}
                      onChange={handleChangeList}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          size="small"
                          placeholder="Select unit"
                          fullWidth
                          className={
                            selectedUnit
                              ? newClasses.filledInput
                              : newClasses.placeholderInput
                          }
                        />
                      )}
                    />
                  </div>
                </FormControl>
              </div>
              <div ref={refelemet3}>
                <YearComponent
                  currentYear={currentYear}
                  setCurrentYear={setCurrentYear}
                />
              </div>
            </div>

            {mode === true && (
              <>
                <IconButton
                  onClick={() => {
                    setMyAuditShow(!myAuditShow);
                  }}
                >
                  <Tooltip title={"Created By Me"}>
                    {!myAuditShow ? (
                      <MdOutlinePermContactCalendar
                        style={{
                          color: "#444",
                          height: "31px",
                          width: "30px",
                        }}
                      />
                    ) : (
                      <MdPermContactCalendar
                        style={{
                          color: "rgb(53, 118, 186)",
                          height: "31px",
                          width: "30px",
                        }}
                      />
                    )}
                  </Tooltip>
                </IconButton>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <SearchBar
                    placeholder="Search"
                    name="searchQuery"
                    values={searchQuery}
                    handleChange={handleSearchChange}
                    handleApply={handleTableSearch}
                    endAdornment={true}
                    handleClickDiscard={handleClickDiscard}
                  />
                </div>
              </>
            )}
          </div>
        </Box>

        <div
          style={{
            margin: matches ? "10px 0px 2px 0px" : "10px 0px 2px 0px",
            position: "relative",
            top: viewerMode ? -45 : 0,
          }}
        >
          <div
            style={{
              width: "100%",
              padding: currentStateNew !== "All" ? "20px 0px" : "5px 0px",
              display: "flex",
              justifyContent: !viewerMode ? "space-between" : "end", // Space between button and segmented
              alignItems: "center",
            }}
          >
            {mode === false &&
              !viewerMode &&
              selectCalenderview !== true &&
              currentStateNew !== "All" && (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "0px" }}
                >
                  {" "}
                  <Button
                    onClick={() => carouselRef.current.slidePrev()}
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      border: "2px solid white",
                      backgroundColor: "white",
                      // border: "1px solid black",
                    }}
                  >
                    <FaChevronLeft style={{ fontSize: "17px" }} />
                  </Button>
                  <Typography style={{ fontWeight: "bold", fontSize: "16px" }}>
                    {getVisibleMonthRange()}
                  </Typography>
                  <Button
                    onClick={() => carouselRef.current.slideNext()}
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      border: "2px solid white",
                      backgroundColor: "white",
                    }}
                  >
                    <FaChevronRight style={{ fontSize: "17px" }} />
                  </Button>
                </div>
              )}
            <div style={{ display: "flex" }}>
              {currentStateNew !== "All" && !viewerMode && (
                <button
                  style={{
                    borderRadius: "6px",
                    backgroundColor: "White",
                    cursor: "pointer",
                    marginTop: "0px",
                    display: "flex", // Flexbox to align items
                    alignItems: "center", // Vertically align icon and text
                    gap: 10,
                    padding: "4px 16px",
                    border: "2px solid #003059",
                    color: "#003059",
                    marginRight: "10px", // Add space between this and next button
                  }}
                  onClick={() => {
                    // setViewerMode(!viewerMode);
                    // getAuditPlanDetailsById();
                    navigate("/auditHomePage");
                  }}
                >
                  Audit Report
                </button>
              )}
              {/* Button aligned to the left */}
              {selectTableAuditType !== undefined &&
                selectTableAuditType?.id !== "All" &&
                (selectedLocation?.id !== "All" ||
                  selectTableAuditType?.scope?.id === "Unit") &&
                currentStateNew === "Planned" && (
                  <button
                    style={{
                      borderRadius: "6px",
                      backgroundColor: "White",
                      cursor: "pointer",
                      marginTop: "0px",
                      display: "flex", // Flexbox to align items
                      alignItems: "center", // Vertically align icon and text
                      gap: 10,
                      padding: "4px 16px",
                      border: "2px solid #003059",
                      color: "#003059",
                    }}
                    onClick={() => {
                      setViewerMode(!viewerMode);
                      getAuditPlanDetailsById();
                    }}
                  >
                    {viewerMode ? (
                      <>
                        <MdDashboard style={{ fontSize: "16px" }} />{" "}
                        {/* Adjust icon size */}
                        <span style={{ fontSize: "14px", fontWeight: "500" }}>
                          Board View
                        </span>
                      </>
                    ) : (
                      <>
                        <MdFormatListBulleted style={{ fontSize: "16px" }} />
                        <span style={{ fontSize: "14px", fontWeight: "500" }}>
                          Yearly Audit Plan
                        </span>
                      </>
                    )}
                  </button>
                )}

              {currentStateNew === "Scheduled" && (
                <div
                  style={{
                    display: "flex", // Flex container
                    alignItems: "center", // Align items vertically
                    gap: "4px", // Add spacing between buttons
                  }}
                >
                  {/* Create Ad Hoc Schedule Button */}

                  {createSchedule === true && createSchedule === true && (
                    <button
                      style={{
                        borderRadius: "6px",
                        backgroundColor: "white",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "4px 16px",
                        border: "2px solid #003059",
                        color: "#003059",
                      }}
                      onClick={() => {
                        setReportOpen(true);
                        setScheduleFormType("adhoc-create");
                      }}
                    >
                      <FiPlusCircle style={{ fontSize: "16px" }} />
                      <span
                        style={{
                          fontSize: matches ? "14px" : "12px",
                          fontWeight: "500",
                        }}
                      >
                        Adhoc Schedule
                      </span>
                    </button>
                  )}

                  {/* My Audit Button */}
                  <button
                    style={{
                      backgroundColor: openAudit ? "#3476BA" : "white",
                      color: openAudit ? "white" : "#003059",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "4px 16px",
                      border: openAudit
                        ? "2px solid #3476BA"
                        : "2px solid #003059",
                      borderRadius: "6px",
                    }}
                    onClick={() => {
                      setOpenAudit(!openAudit);
                      getCalendarData(searchValue, !openAudit);
                    }}
                  >
                    {openAudit ? (
                      <MdPermContactCalendar style={{ fontSize: "16px" }} />
                    ) : (
                      <MdOutlinePermContactCalendar
                        style={{ fontSize: "16px" }}
                      />
                    )}
                    <span
                      style={{
                        fontSize: matches ? "14px" : "12px",
                        fontWeight: "500",
                      }}
                    >
                      My Audit
                    </span>
                  </button>

                  {/* Calendar or Board View Button */}
                  <button
                    style={{
                      backgroundColor: "white",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "4px 16px",
                      border: "2px solid #003059",
                      color: "#003059",
                      borderRadius: "6px",
                    }}
                    onClick={() => {
                      setCalenderView(!selectCalenderview);
                      if (!selectCalenderview) {
                        getCalendarData(searchValue, false);
                      }
                    }}
                  >
                    {selectCalenderview ? (
                      <MdDashboard style={{ fontSize: "16px" }} />
                    ) : (
                      <MdOutlineCalendarToday style={{ fontSize: "16px" }} />
                    )}
                    <span
                      style={{
                        fontSize: matches ? "14px" : "12px",
                        fontWeight: "500",
                      }}
                    >
                      {selectCalenderview ? "Board View" : "Calendar View"}
                    </span>
                  </button>
                </div>
              )}
              {currentStateNew === "Planned" &&
                dropData?.length > 0 &&
                viewerMode === false &&
                createSchedule === true && (
                  <div>
                    <button
                      // title="Create Audit Schedule"
                      onClick={() => {
                        setPlanId(dropData[0]?.auditPlanId || "");
                        setScheduleFormType("planSchedule-create");
                        handleModalData();
                        // setIsSecondVisible(true);
                      }}
                      style={{
                        borderRadius: "6px",
                        backgroundColor: "white",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "4px 16px",
                        border: "2px solid #003059",
                        color: "#003059",
                        marginLeft: "10px",
                      }}
                    >
                      {/* Create Schedule
                       */}

                      <FiPlusCircle style={{ fontSize: "16px" }} />
                      <span style={{ fontSize: "14px", fontWeight: "500" }}>
                        Schedule Audit
                      </span>
                      {/* <AddIcon /> */}
                    </button>
                  </div>
                )}
              {/* Tabs centered */}

              {mode === false &&
              viewerMode &&
              // createSchedule === true &&
              (create === true || editMode === true) ? (
                <button
                  onClick={() => {
                    if (editMode === true) {
                      handleUpdate();
                    } else {
                      handleCreate();
                    }
                  }}
                  disabled={disabledButton}
                  style={{
                    backgroundColor: "white",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "4px 16px",
                    border: "2px solid #003059",
                    color: "#003059",
                    borderRadius: "6px",
                    marginLeft: "10px",
                  }}
                >
                  {editMode ? (
                    <>
                      <MdUpdate style={{ fontSize: "20px" }} />
                      <span style={{ fontSize: "14px", fontWeight: "500" }}>
                        Update
                      </span>
                    </>
                  ) : (
                    "Submit"
                  )}
                </button>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>

        {matches === false &&
        (currentStateNew === "Completed" || currentStateNew === "All") ? (
          <div style={{ marginTop: "30px" }}></div>
        ) : (
          ""
        )}
        {mode === false ? (
          <>
            {!viewerMode ? (
              <>
                <div
                  style={{
                    position: "relative",
                    display: "flex",
                    justifyContent: "center",
                    padding: "0px 0px",
                    // width: "100vw",
                  }}
                >
                  <div
                    className={classes.boardContainer}
                    style={{
                      position: "relative",
                      padding: "0px",
                      marginRight: "0px",
                      borderRadius: "3px",
                      width: currentStateNew === "All" ? "100%" : "",
                      justifyContent: "center",
                    }}
                  >
                    {!selectCalenderview ? (
                      currentStateNew !== "All" ? (
                        <DragDropContext onDragEnd={onDragEnd}>
                          <AliceCarousel
                            mouseTracking
                            items={items}
                            responsive={responsive}
                            controlsStrategy="alternate"
                            autoPlay={false}
                            infinite={false}
                            disableButtonsControls={true}
                            activeIndex={activeIndex}
                            onSlideChanged={onSlideChanged}
                            ref={carouselRef}
                            renderDotsItem={() => null}
                          />
                        </DragDropContext>
                      ) : (
                        <div style={{ paddingTop: "5px", width: "100vw" }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              width: "100%",
                              padding: "0px 5px",
                            }}
                          >
                            {/* Left side: Month navigation */}
                            {/* {!viewerModeAll ? ( */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <button
                                onClick={() =>
                                  setCurrentMonthForBoard(
                                    currentMonthForBoard - 1
                                  )
                                }
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  padding: 0,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <FaChevronLeft style={{ fontSize: "16px" }} />
                              </button>

                              <Typography
                                style={{ fontWeight: "bold", fontSize: "16px" }}
                              >
                                {months[currentMonthForBoard]}
                              </Typography>

                              <button
                                onClick={() =>
                                  setCurrentMonthForBoard(
                                    currentMonthForBoard + 1
                                  )
                                }
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  padding: 0,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <FaChevronRight style={{ fontSize: "16px" }} />
                              </button>
                            </div>

                            {/* ):""} */}

                            {/* Right side: Your additional buttons */}

                            <div className={classes.newContainer}>
                              {/* {!viewerModeAll && ( */}
                              <button
                                className={`${classes.buttonBase} ${
                                  openAudit
                                    ? classes.auditButtonActive
                                    : classes.auditButton
                                }`}
                                style={{
                                  visibility: viewerModeAll
                                    ? "hidden"
                                    : "visible",
                                }}
                                onClick={() => {
                                  setOpenAudit(!openAudit);
                                  getCalendarData(searchValue, !openAudit);
                                }}
                              >
                                {openAudit ? (
                                  <MdPermContactCalendar
                                    style={{ fontSize: "16px" }}
                                  />
                                ) : (
                                  <MdOutlinePermContactCalendar
                                    style={{ fontSize: "16px" }}
                                  />
                                )}
                                My Audit
                              </button>

                              {/* )} */}

                              {/* {currentStateNew !=="All" && ( */}
                              <button
                                style={{
                                  borderRadius: "6px",
                                  backgroundColor: "White",
                                  cursor: "pointer",
                                  marginTop: "0px",
                                  display: "flex", // Flexbox to align items
                                  alignItems: "center", // Vertically align icon and text
                                  gap: 10,
                                  padding: "4px 16px",
                                  border: "2px solid #003059",
                                  color: "#003059",
                                  marginRight: "10px", // Add space between this and next button
                                }}
                                onClick={() => {
                                  // setViewerMode(!viewerMode);
                                  // getAuditPlanDetailsById();
                                  navigate("/auditHomePage");
                                }}
                              >
                                Audit Report
                              </button>

                              <button
                                className={`${classes.buttonBase} ${classes.adhocButton}`}
                                onClick={() => {
                                  setViewerModelAll(!viewerModeAll);

                                  getAuditPlanDetailsForAll();
                                }}
                              >
                                {/* <MdFormatListBulleted
                                  className={classes.icon}
                                />
                                <span className={classes.text}>
                                  Yearly Audit Plan
                                </span> */}
                                {viewerModeAll ? (
                                  <>
                                    <MdDashboard style={{ fontSize: "20px" }} />{" "}
                                    {/* Adjust icon size */}
                                    <span
                                      style={{
                                        fontSize: "14px",
                                        fontWeight: "500",
                                      }}
                                    >
                                      Board View
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <MdFormatListBulleted
                                      style={{ fontSize: "16px" }}
                                    />
                                    <span
                                      style={{
                                        fontSize: "14px",
                                        fontWeight: "500",
                                      }}
                                    >
                                      Yearly Audit Plan
                                    </span>
                                  </>
                                )}
                              </button>

                              <>
                                <div style={{ position: "relative" }}>
                                  <Button
                                    ref={
                                      viewerModeAll
                                        ? null
                                        : (ref: any) =>
                                            ref && setMenuAnchorRef(ref)
                                    }
                                    onClick={(e) => {
                                      setMenuAnchorEl(
                                        e.currentTarget as HTMLElement
                                      );
                                      setIsMenuOpen(true);
                                    }}
                                    style={{
                                      display: viewerModeAll ? "none" : "flex",
                                      backgroundColor: "rgb(0, 48, 89)",
                                      color: "#fff",
                                      padding: "6px 16px",
                                      borderRadius: "6px",
                                      fontWeight: 600,
                                      textTransform: "none",
                                      alignItems: "center",
                                      gap: 8,
                                    }}
                                    onMouseOver={(e) => {
                                      e.currentTarget.style.backgroundColor =
                                        "#001f4d";
                                    }}
                                    onMouseOut={(e) => {
                                      e.currentTarget.style.backgroundColor =
                                        "#002f6c";
                                    }}
                                  >
                                    <FiPlusCircle />
                                    Create
                                  </Button>

                                  {/* Viewer Mode Button */}
                                  <Button
                                    onClick={() => {
                                      if (editMode === true) {
                                        handleUpdate();
                                      } else {
                                        handleCreate();
                                      }
                                    }}
                                    style={{
                                      display: viewerModeAll ? "flex" : "none",
                                      backgroundColor: "#fff",
                                      color: "#002f6c",
                                      padding: "6px 16px",
                                      borderRadius: "8px",
                                      fontWeight: 600,
                                      textTransform: "none",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      gap: 8,
                                      border: "1px solid #002f6c", // subtle outline
                                      boxShadow:
                                        "0 2px 4px rgba(0, 0, 0, 0.05)",
                                      cursor: "pointer",
                                    }}
                                    onMouseOver={(e) => {
                                      e.currentTarget.style.backgroundColor =
                                        "#f0f4fa";
                                    }}
                                    onMouseOut={(e) => {
                                      e.currentTarget.style.backgroundColor =
                                        "#fff";
                                    }}
                                  >
                                    {editMode ? (
                                      <>
                                        <MdUpdate style={{ fontSize: 20 }} />
                                        <span
                                          style={{
                                            fontSize: 14,
                                            fontWeight: 500,
                                          }}
                                        >
                                          Update
                                        </span>
                                      </>
                                    ) : (
                                      <span
                                        style={{
                                          fontSize: 14,
                                          fontWeight: 500,
                                        }}
                                      >
                                        Submit
                                      </span>
                                    )}
                                  </Button>
                                </div>

                                <Menu
                                  anchorEl={menuAnchorEl}
                                  open={isMenuOpen}
                                  onClose={() => setIsMenuOpen(false)}
                                  anchorOrigin={{
                                    vertical: "bottom",
                                    horizontal: "right",
                                  }}
                                  transformOrigin={{
                                    vertical: "top",
                                    horizontal: "right",
                                  }}
                                  PaperProps={{
                                    style: {
                                      borderRadius: "8px",
                                      boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                                    },
                                  }}
                                >
                                  <MenuItem
                                    onClick={() => {
                                      setIsMenuOpen(false);
                                      setReportOpen(true);
                                      setScheduleFormType("adhoc-create");
                                    }}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 8,
                                    }}
                                  >
                                    <MdAdd
                                      fontSize={18}
                                      style={{ color: "#002f6c" }}
                                    />
                                    Adhoc Schedule
                                  </MenuItem>
                                  <MenuItem
                                    onClick={() => setIsMenuOpen(false)}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 8,
                                    }}
                                  >
                                    <HiOutlineDocumentAdd
                                      fontSize={18}
                                      style={{ color: "#002f6c" }}
                                    />
                                    Schedule Audit
                                  </MenuItem>
                                </Menu>
                              </>
                            </div>
                          </div>

                          {!viewerModeAll ? (
                            <AuditPlanAll
                              boardDatas={boardDatas}
                              monthName={months[currentMonthForBoard]}
                              getAllData={getAllData}
                              createAuditScheduleForAll={
                                createAuditScheduleForAll
                              }
                              createSchedule={createSchedule}
                              editScheduleDataForAll={editScheduleDataForAll}
                            />
                          ) : (
                            <AuditPlanForm3
                              handleSubmit={handleUpdate}
                              // handleNe={handleNext}
                              auditPlanData={auditPlanDataNew}
                              removedList={removedList}
                              setRemovedList={setRemovedList}
                              setAuditPlanData={setAuditPlanDataNew}
                              getAuditPlanDetailsById={getAuditPlanDetailsById}
                              isEdit={true}
                              disabledForDeletedModal={false}
                              isReadOnly={!isReadOnly}
                              finalisedAuditorTourOpen={
                                finalisedAuditorTourOpen
                              }
                              setFinalisedAuditorTourOpen={
                                setFinalisedAuditorTourOpen
                              }
                              // refForForAuditPlanForm5={refForForAuditPlanForm5}
                              // refForForAuditPlanForm6={refForForAuditPlanForm6}
                              // refForForAuditPlanForm7={refForForAuditPlanForm7}
                            />
                          )}
                        </div>
                      )
                    ) : (
                      <div
                        style={{
                          width: "100%",
                        }}
                      >
                        <AuditScheduleCalendar
                          events={calendarData}
                          toggleCalendarModal={toggleCalendarModal}
                          calendarModalInfo={calendarModalInfo}
                          calendarFor="AuditSchedule"
                          auditTypes={auditTypes}
                          setAuditTypes={setAuditTypes}
                          locationNames={locationNames}
                          currentYear={currentYear}
                          refreshCalendarData={refreshCalendarData}
                          auditPlanIdFromPlan={auditPlanIdFromPlan}
                          loaderForSchdeuleDrawer={loaderForSchdeuleDrawer}
                          setLoaderForSchdeuleDrawer={
                            setLoaderForSchdeuleDrawer
                          }
                          auditScheduleIdFromLocation={
                            auditScheduleIdFromLocation
                          }
                          formModeForCalendarDrawer={formModeForCalendarDrawer}
                          setFormModeForCalendarDrawer={
                            setFormModeForCalendarDrawer
                          }
                          selectedAuditType={selectTableAuditType}
                          selectedLocation={selectedLocation}
                          createSchedule={createSchedule}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div style={{ marginTop: "-40px" }}>
                {/* <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  {create === true || editMode === true ? (
                    <button
                      onClick={() => {
                        if (editMode === true) {
                          handleUpdate();
                        } else {
                          handleCreate();
                        }
                      }}
                      style={{
                        padding: "10px 20px 4px 20px",
                        // cursor: "pointer",
                        borderRadius: "5px",
                        // position: "relative", // this is needed for the pseudo-element arrow
                        backgroundColor: "rgb(0, 48, 89)", // conditional background color
                        color: "white",
                      }}
                    >
                      Submit
                    </button>
                  ) : (
                    ""
                  )}
                </div> */}
                <AuditPlanForm3
                  handleSubmit={handleUpdate}
                  // handleNe={handleNext}
                  auditPlanData={auditPlanDataNew}
                  removedList={removedList}
                  setRemovedList={setRemovedList}
                  setAuditPlanData={setAuditPlanDataNew}
                  getAuditPlanDetailsById={getAuditPlanDetailsById}
                  isEdit={true}
                  disabledForDeletedModal={false}
                  isReadOnly={!isReadOnly}
                  finalisedAuditorTourOpen={finalisedAuditorTourOpen}
                  setFinalisedAuditorTourOpen={setFinalisedAuditorTourOpen}
                  // refForForAuditPlanForm5={refForForAuditPlanForm5}
                  // refForForAuditPlanForm6={refForForAuditPlanForm6}
                  // refForForAuditPlanForm7={refForForAuditPlanForm7}
                />
              </div>
            )}
          </>
        ) : (
          <>
            {isLoading ? (
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
                {auditPeriodModal?.open && (
                  <AuditPeriodModal
                    auditPeriodModal={auditPeriodModal}
                    setAuditPeriodModal={setAuditPeriodModal}
                  />
                )}

                {data && data?.length !== 0 ? (
                  <>
                    <div className={classes.tableContainerScrollable}>
                      <Table
                        dataSource={data}
                        // pagination={{ position: [] }}
                        pagination={false}
                        columns={columns}
                        className={classes.tableContainer}
                      />
                    </div>
                    <div className={classes.pagination}>
                      <Pagination
                        size="small"
                        current={page}
                        pageSize={rowsPerPage}
                        total={count}
                        showTotal={showTotal}
                        showSizeChanger
                        showQuickJumper
                        onChange={(page: any, pageSize: any) => {
                          handlePagination(page, pageSize);
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className={classes.imgContainer}>
                      <img src={EmptyTableImg} alt="No Data" width="300px" />
                    </div>
                    <Typography
                      align="center"
                      className={classes.emptyDataText}
                    >
                      Let’s begin by adding a plan
                    </Typography>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
      <Modal
        title="Audit Schedule"
        visible={isModalVisible}
        width={1170}
        footer={null}
        onCancel={() => {
          setScheduleFormType("none");
          resetAuditSchedule();
          setIsModalVisible(false);
          // navigate("/audit", { state: { redirectToTab: "AUDIT PLAN" } });
        }}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{ width: "36px", height: "38px", cursor: "pointer" }}
          />
        }
      >
        <AuditScheduleFormStepper
          dataFrom={planId}
          dataId={"plan"}
          modalWindow={true}
          auditType={selectTableAuditType}
          locationId={selectedLocation}
          setIsModalVisible={setIsModalVisible}
          isModalVisible={isModalVisible}
          generator={() => {
            return uniqueId();
          }}
          assistantFormData={assistantFormData}
          dataForChecklistGeneration={dataForChecklistGeneration}
        />
      </Modal>

      <Modal
        title="Audit Schedule"
        visible={isSecondVisible}
        width={1300}
        footer={null}
        onCancel={() => {
          setScheduleFormType("none");
          resetAuditSchedule();
          setIsSecondVisible(false);
        }}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{ width: "36px", height: "38px", cursor: "pointer" }}
          />
        }
      >
        <AuditScheduleFormStepper
          dataFrom={undefined}
          dataId={"adhoc-create"}
          modalWindow={true}
          auditType={selectTableAuditType}
          locationId={selectedLocation}
          setIsModalVisible={setIsSecondVisible}
          isModalVisible={isSecondVisible}
          generator={() => {
            return uniqueId();
          }}
          assistantFormData={assistantFormData}
          dataForChecklistGeneration={dataForChecklistGeneration}
        />
      </Modal>

      <Modal
        title={`Schedule Audit for ${selectedEntityData}`}
        visible={isEntityModal}
        onOk={() => {
          handleScheduleData();
        }}
        onCancel={() => {
          getDataForDrops(currentStateNew);
          setIsEntityModal(false);
        }}
        width={600}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{ width: "36px", height: "38px", cursor: "pointer" }}
          />
        }
      >
        <Row gutter={16}>
          <Col span={12}>
            {/* <TextField
              fullWidth
              type="datetime-local"
              name="time"
              value={
                entityData?.time
                  ? new Date(entityData?.time).toISOString().slice(0, 16)
                  : ""
              }
              variant="outlined"
              onChange={(e) => {
                const newTime = e.target.value; // Get the datetime-local value
                setEntityData({ ...entityData, time: newTime }); // Store as string (or convert to Date if needed)
              }}
              size="small"
              required
            /> */}
            <DatePicker
              showTime
              value={entityData?.time ? dayjs(entityData.time) : null}
              onChange={(value) => {
                const newTime = value ? value.toDate() : null; // Format as datetime-local string
                setEntityData({ ...entityData, time: newTime });
              }}
              format="DD-MM-YYYY hh:mm A"
              style={{ width: "100%" }}
              placeholder="Select date and time"
            />
          </Col>
          <Col span={12}>
            <Select
              mode="multiple"
              placeholder="Select Auditors"
              onChange={(value) => {
                setEntityData({ ...entityData, auditor: value });
              }}
              value={entityData?.auditor || []}
              style={{ width: "100%" }}
              optionFilterProp="label"
              filterOption={(input: any, option: any) =>
                option?.label?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {auditorData.map((auditor: any) => (
                <Option
                  key={auditor.id}
                  value={auditor.id}
                  label={auditor.label}
                >
                  {auditor.label}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={12}>
            <Select
              mode="multiple"
              placeholder="Select Auditee"
              onChange={(value) => {
                setEntityData({ ...entityData, auditee: value });
              }}
              value={entityData?.auditee || []}
              style={{ width: "100%" }}
              optionFilterProp="label"
              filterOption={(input: any, option: any) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {auditeeData.map((auditee: any) => (
                <Option
                  key={auditee.id}
                  value={auditee.id}
                  label={auditee.label}
                >
                  {auditee.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={12}>
            <Select
              mode="multiple"
              placeholder="Select CheckList"
              onChange={(value) => {
                setEntityData({ ...entityData, template: value });
              }}
              value={entityData?.template || []}
              style={{ width: "100%" }}
            >
              {template.map((templateData: any) => (
                <Option key={templateData.value} value={templateData.id}>
                  {templateData.label}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Modal>

      {/* Edit Modal for Audit Schedule  */}
      <Modal
        title={`Edit Schedule Audit for ${editEntityData?.title || ""}`}
        visible={editEntityModal}
        onOk={() => {
          updateEntityData();
        }}
        onCancel={() => {
          getDataForDrops(currentStateNew);
          setEditEntityModal(false);
        }}
        width={550}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{ width: "36px", height: "38px", cursor: "pointer" }}
          />
        }
      >
        <Row gutter={[16, 16]}>
          <Col span={12}>
            {/* <TextField
              fullWidth
              type="datetime-local"
              name="time"
              label="Schedule Time"
              value={
                editEntityData?.time
                  ? new Date(editEntityData?.time).toISOString().slice(0, 16)
                  : ""
              }
              variant="outlined"
              onChange={(e) => {
                const newTime = new Date(e.target.value); // Convert back to Date object
                setEditEntityData({ ...editEntityData, time: newTime });
              }}
              size="small"
              required
            /> */}

            <DatePicker
              showTime
              value={editEntityData?.time ? dayjs(editEntityData.time) : null}
              onChange={(value) => {
                const newTime = value ? value.toDate() : null; // Convert dayjs to JS Date
                setEditEntityData({ ...editEntityData, time: newTime });
              }}
              format="DD-MM-YYYY hh:mm A"
              style={{ width: "100%" }}
              placeholder="Select date and time"
            />
          </Col>
          {/* {JSON.stringify(editEntityData)} */}
          <Col span={12}>
            <Select
              mode="multiple"
              placeholder="Select Auditors"
              onChange={(value) => {
                setEditEntityData({ ...editEntityData, auditor: value });
              }}
              value={editEntityData?.auditor || []}
              style={{ width: "100%" }}
              optionFilterProp="label"
              filterOption={(input, option: any) =>
                option?.label?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {auditorData.map((auditor: any) => (
                <Option
                  key={auditor.id}
                  value={auditor.id}
                  label={auditor.label}
                >
                  {auditor.label}
                </Option>
              ))}
            </Select>
          </Col>

          <Col span={12}>
            <Select
              mode="multiple"
              placeholder="Select Auditee"
              onChange={(value) => {
                setEditEntityData({ ...editEntityData, auditee: value });
              }}
              value={editEntityData?.auditee || []}
              style={{ width: "100%" }}
              optionFilterProp="label"
              filterOption={(input, option: any) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {auditeeData.map((auditee: any) => (
                <Option
                  key={auditee.id}
                  value={auditee.id}
                  label={auditee.label}
                >
                  {auditee.label}
                </Option>
              ))}
            </Select>
          </Col>

          <Col span={12}>
            <Select
              mode="multiple"
              placeholder="Select Checklist"
              onChange={(value) => {
                setEditEntityData({ ...editEntityData, template: value });
              }}
              value={editEntityData?.template || []}
              style={{ width: "100%" }}
            >
              {template.map((templateData: any) => (
                <Option key={templateData.id} value={templateData.id}>
                  {templateData.label}
                </Option>
              ))}
            </Select>
          </Col>

          {/* New Comment Field */}
          <Col span={24}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Comments"
              variant="outlined"
              value={editEntityData?.comment || ""}
              onChange={(e) =>
                setEditEntityData({
                  ...editEntityData,
                  comment: e.target.value,
                })
              }
              size="small"
            />
          </Col>
        </Row>
      </Modal>

      <div>
        {openAuditFinalize && (
          // <AuditFinaliseDateModal
          //   auditPlanData={auditPlanData}

          // ></AuditFinaliseDateModal>
          <AuditFinalizeModal
            auditPlanData={auditPlanData}
            mode={modalMode}
            setOpenAuditFinalize={setOpenAuditFinalize}
            openAuditFinalize={openAuditFinalize}
            isEdit={true}
          ></AuditFinalizeModal>
        )}
        {entityDataNew?.length > 0 && (
          <Modal
            title="Department By Unit Data"
            visible={isOpen}
            onCancel={() => {
              setIsOpen(false);
            }}
            width={750}
            footer={null}
          >
            <div>
              {isOpen === true && entityDataNew?.length > 0 && (
                <div>
                  {entityDataNew?.map((value: any, index: any) => (
                    <div className={classes.rollingRow}>
                      <span
                        style={{
                          backgroundColor: `${
                            value?.isAuditReportCreated ? "#d98cb3" : "#81C784"
                          }`, // Light green for Scheduled label
                          padding: "5px 10px",
                          borderRadius: "5px",
                          fontWeight: 600,
                          color: "#000",
                          marginRight: "15px",
                          textAlign: "center",
                        }}
                      >
                        {value?.isAuditReportCreated
                          ? "Completed"
                          : "Scheduled"}
                      </span>
                      <span className={classes.name}>{value?.name || ""}</span>
                      <span className={classes.auditorNew}>
                        <MultiUserDisplay
                          data={value.auditor}
                          name="username"
                        ></MultiUserDisplay>
                      </span>
                      <span className={classes.auditeeNew}>
                        <MultiUserDisplay
                          data={value.auditee}
                          name="username"
                        ></MultiUserDisplay>
                      </span>
                      <span className={classes.time}>{value?.time}</span>
                      {value?.auditorId.includes(userDetails?.id) &&
                        value?.isAuditReportCreated == false && (
                          <IconButton
                            className={classes.addIcon}
                            onClick={() => {
                              navigate("/audit/auditreport/newaudit", {
                                state: {
                                  auditScheduleId: value.scheduleId,
                                  entityName: value.title,
                                  disableFields: true,
                                  auditScheduleName: "",
                                },
                              });
                            }}
                          >
                            <MdAdd />
                          </IconButton>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Modal>
        )}

        <Dialog
          fullScreen={fullScreen}
          open={reportOpen}
          onClose={() => {
            setReportOpen(false);
          }}
          aria-labelledby="responsive-dialog-title"
        >
          <DialogContent>
            <DialogContentText>
              You are about to create Ad-hoc Schedule without Plan. Do you want
              to continue?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              autoFocus
              onClick={() => {
                setReportOpen(false);
              }}
              color="primary"
            >
              No
            </Button>
            <Button
              // disabled={!isLocAdmin}
              onClick={() => {
                // handleDiscard();
                // handleReportYes();
                setReportOpen(false);
                setIsSecondVisible(true);
              }}
              color="primary"
              autoFocus
            >
              Yes
            </Button>
          </DialogActions>
        </Dialog>
      </div>

      {matches ? (
        ""
      ) : (
        <div
          style={{
            paddingTop: "3px",
            position: "absolute",
            top: 82,
            right: 30,
          }}
        >
          <FilterIcon
            style={{ width: "24px", height: "24px" }}
            onClick={showModal}
          />
        </div>
      )}

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
        onOk={handleOk}
        onCancel={handleCancel}
        // className={classes.modal}
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
            // border: "1px solid rgba(19, 171, 155, 0.5)",
            // borderRadius: "12px",
            padding: "20px",
            margin: "20px 20px 10px 20px",
          }}
        >
          <div className={classes.locSearchBox}>
            <FormControl variant="outlined" size="small" fullWidth>
              <div style={{ paddingTop: "4px" }} ref={refelemet2}>
                <Autocomplete
                  // multiple
                  id="location-autocomplete"
                  className={classes.inputRootOverride}
                  options={auditTypeOptions}
                  getOptionLabel={(option: any) => option.value || ""}
                  getOptionSelected={(option: any, value) =>
                    option.id === value.id
                  }
                  value={selectTableAuditType}
                  onChange={(e: any, value: any) => {
                    setViewerMode(false);
                    setSelectTableAuditType(value);
                    setSelected(!!value);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      size="small"
                      // label="Audit type"
                      placeholder="Audit type"
                      fullWidth
                      className={
                        selected ? classes.textField : classes.textField2
                      }
                    />
                  )}
                />
              </div>
            </FormControl>
          </div>
          <div className={classes.locSearchBox}>
            <FormControl variant="outlined" size="small" fullWidth>
              <div style={{ paddingTop: "4px" }} ref={refelemet2}>
                <Autocomplete
                  // multiple
                  id="location-autocomplete"
                  className={classes.inputRootOverride}
                  options={
                    Array.isArray(locationNames)
                      ? [allOption, ...locationNames]
                      : [allOption]
                  }
                  getOptionLabel={(option) => option.locationName || ""}
                  getOptionSelected={(option, value) => option.id === value.id}
                  value={selectedLocation}
                  onChange={handleChangeList}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      size="small"
                      // label="Corp Func/Unit"
                      placeholder="Corp Func/Unit"
                      fullWidth
                      className={
                        selectedUnit ? classes.textField : classes.textField2
                      }
                    />
                  )}
                />
              </div>
            </FormControl>
          </div>
          <div ref={refelemet3}>
            <YearComponent
              currentYear={currentYear}
              setCurrentYear={setCurrentYear}
            />
          </div>
        </div>
      </Modal>

      <Modal
        title="Confirm Deletion"
        open={isDeleteModalOpen}
        onOk={() => {
          confirmDelete();
        }}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setSelectedTaskId("");
        }}
        okText="Yes, Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to delete this audit schedule?</p>
      </Modal>
      <Modal
        title="Auditor/Auditee Conflict"
        open={errModal}
        onOk={() => {
          setErrModal(false);
          setErrMessage(""); // clear after close
          // You can add force save logic here if you want
          handleScheduleData(true);
        }}
        onCancel={() => {
          setErrModal(false);
          setErrMessage(""); // clear after close
        }}
        okText="OK"
        cancelText="Cancel"
      >
        <p>{errMessage}</p> {/* dynamically shows the conflict error */}
        <p>Are you sure you want to continue?</p>
      </Modal>

      <Modal
        title="Auditor/Auditee Conflict"
        open={errEditModal}
        onOk={() => {
          setEditErrModal(false);
          setEditErrMessage(""); // clear after close
          // You can add force save logic here if you want
          updateEntityData(true);
        }}
        onCancel={() => {
          setEditErrModal(false);
          setEditErrMessage(""); // clear after close
        }}
        okText="OK"
        cancelText="Cancel"
      >
        <p>{errMessage}</p> {/* dynamically shows the conflict error */}
        <p>Are you sure you want to continue?</p>
      </Modal>
    </>
  );
};

export default Audit;
