import { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import { momentLocalizer } from "react-big-calendar";
import moment from "moment";
import FilterDrawer from "components/FilterDrawer";
import SearchBar from "components/SearchBar";
import MultiUserDisplay from "components/MultiUserDisplay";
import { AiOutlineFilter, AiFillFilter, AiOutlineAudit } from "react-icons/ai";
import { FaUserGroup } from "react-icons/fa6";
import getYearFormat from "utils/getYearFormat";
import {
  Box,
  InputAdornment,
  TextField,
  Tooltip,
  Grid,
  FormControl,
  useMediaQuery,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogActions,
  useTheme,
  Fab,
} from "@material-ui/core";
import {
  fetchAuditReportTableData,
  getCalendarEntries,
  sortData,
  searchAuditTableData,
  myAudit,
  getAudit,
  getAuditForPdf,
} from "apis/auditApi";
import { useNavigate } from "react-router";
import { getSystems, getSystemTypes, getSystemWithTypes } from "apis/systemApi";
import getAppUrl from "utils/getAppUrl";
import TableNcUtil from "components/TableNcUtil";
import { getOrganizationData } from "apis/orgApi";
import { getAllAuditors } from "apis/auditApi";
import { getAllLocation, getLocationById } from "apis/locationApi";
import { MdOutlinePictureAsPdf } from "react-icons/md";
import {
  currentLocation,
  currentAuditYear,
  mobileView,
  auditFormData,
  auditCreationForm,
} from "recoil/atom";
import { useRecoilState, useRecoilValue, useResetRecoilState } from "recoil";
import checkRole from "utils/checkRoles";
import { useSnackbar } from "notistack";
import { MdSearch } from "react-icons/md";
import { Autocomplete } from "@material-ui/lab";
import { CircularProgress } from "@material-ui/core";
import { Link } from "react-router-dom";
import { makeStyles, createStyles } from "@material-ui/core";
import "./styles.css";
import AuditScheduleCalendarModal from "components/AuditScheduleCalendarModal";
import AuditReportCalendar from "components/ReusableCalendar/AuditReportCalendar";
import YearComponent from "components/Yearcomponent";
import axios from "apis/axios.global";
import getSessionStorage from "utils/getSessionStorage";
import formatDateTime from "utils/formatDateTime";
import printJS from "print-js";
//logo
import { ReactComponent as FilterIcon } from "assets/documentControl/Filter.svg";
import RadarChartComponent from "components/RadarChart";
import * as htmlToImage from "html-to-image";
import { Button, Modal, Pagination, PaginationProps, Table, Tag } from "antd";
import { ColumnsType } from "antd/es/table";
import { formatDashboardQuery } from "utils/formatDashboardQuery";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import { Progress } from "antd";
import { FaPlus } from "react-icons/fa";

export const useStyles = (matches: any) =>
  makeStyles((theme) =>
    createStyles({
      filterButton: {
        position: "absolute",
        top: 137,
        right: 90,
        backgroundColor: theme.palette.primary.light,
        color: "#fff",

        "&:hover": {
          backgroundColor: theme.palette.primary.main,
        },
        [theme.breakpoints.down("sm")]: {
          position: "fixed",
          top: "auto",
          bottom: 50,
          right: 20,
          zIndex: 1,
        },
      },

      tableContainer: {
        marginTop: "15px",
        // Table Header Styles
        "& .ant-table-thead .ant-table-cell": {
          // backgroundColor: ({ headerBgColor }) => headerBgColor,
          // color: ({ tableColor }) => tableColor,
          backgroundColor: "#E8F3F9",
          borderBottom: "1px solid #003059",
          // fontFamily: "Poppins !important",
          color: "#00224E",
        },

        // Table Body Styles
        "& .ant-table-tbody > tr > td": {
          borderBottom: "1px solid #f0f0f0",
          // border: "0.5px solid #E6E8EA", // Add a border around each table body cell
          padding: "2px", // Adjust the padding as needed
          height: "50px", // Set the height of the table cells
        },
        // "& tr.ant-table-row:nth-child(odd)": {
        //   backgroundColor: "#F5F5F5", // Odd row color
        // },
        // "& tr.ant-table-row:nth-child(even)": {
        //   backgroundColor: "#FFFFFF", // Even row color
        // },
      },
      fab: {
        position: "fixed",
        bottom: "30px", // Center vertically
        right: 5, // Keep it on the right side
        transform: "translateY(-50%)", // Adjust for exact centering
        backgroundColor: "rgb(53, 118, 186)",
        color: "#fff",
        "&:hover": {
          backgroundColor: "rgb(53, 118, 186)",
        },
        display: "none", // Hide by default
        "@media (max-width: 768px)": {
          display: "flex", // Show only on mobile
        },
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
      customArrow: {
        color: "black",
      },
      customPopper: {
        zIndex: 1500, // Adjust zIndex as needed
      },
      customTooltip: {
        backgroundColor: "white",
        color: "black",
      },
      searchContainer: {
        // marginTop: "25px",
        // marginBottom: "25px",
        maxWidth: "100vw",
      },
      locSearchBox: {
        width: "100%",
        [theme.breakpoints.down("sm")]: {
          marginTop: theme.typography.pxToRem(10),
        },
        "& .MuiOutlinedInput-root": {
          // borderRadius: "16px",
        },
      },
      auditReportCalendarWrapper: {
        width: "100%",
        height: "240px",
        overflow: "auto",
        [theme.breakpoints.up("sm")]: {
          height: "65vh",
        },
        [theme.breakpoints.up("lg")]: {
          height: "70vh",
        },
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

      root: {
        width: "100%",
        maxHeight: matches ? "calc(76vh - 12vh)" : "75vh",
        paddingTop: "40px",
        overflowY: "auto",
        overflowX: "hidden",
        "&::-webkit-scrollbar": {
          width: "8px",
          height: "10px", // Adjust the height value as needed
          backgroundColor: "#e5e4e2",
        },
        "&::-webkit-scrollbar-thumb": {
          borderRadius: "10px",
          backgroundColor: "grey",
        },
        // paddingTop: theme.typography.pxToRem(40),
      },
      textField: {
        fontSize: "14px",
        fontWeight: 600,
        "& .MuiOutlinedInput-root": {
          backgroundColor: "White",
          // borderRadius: "20px",
          // color: "black",
          fontSize: "14px",
          // fontWeight: 600,
          // border: "1px solid black",
        },
        "& .MuiOutlinedInput-notchedOutline": {
          // borderRadius: "20px",
        },
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
        "& .MuiOutlinedInput-notchedOutline": {
          // borderRadius: "20px",
        },
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
    })
  );

/**
 * @description Headers which will used as column title for the particular table which is being used in the audit report section
 */
const headers = [
  {
    title: "Audit Name",
    field: "auditName",
    sortable: true,
  },
  {
    title: "Audit No.",
    field: "auditNumber",
    sortable: false,
  },
  {
    title: "Location",
    field: "location",
    sortable: false,
  },
  {
    title: "System",
    field: "system",
    sortable: false,
  },
  {
    title: "Audited Dept/Vertical",
    field: "auditedEntity",
    sortable: true,
  },
  {
    title: "Auditors",
    field: "auditors",
    sortable: false,
  },
  {
    title: "Auditees",
    field: "auditees",
    sortable: false,
  },
  {
    title: "Audit Date",
    field: "date",
    sortable: true,
  },
  {
    title: "NC's",
    field: "nc",
    sortable: false,
  },
];

/**
 * @description Field key which is being used to display the table entries in the audit report table
 */
const fields = [
  "auditName",
  "auditNumber",
  "location",
  "system",
  "auditedEntity",
  "auditors",
  "auditees",
  "date",
  "nc",
];

/**
 * @method AuditReport
 * @description Functional component which renders the whole audit report page
 * @returns a react functinal component
 *
 *
 */
type Props = {
  refelemetForReport2?: any;
  refelemetForReport3?: any;
  refelemetForReport4?: any;
  refelemetForReport5?: any;
  refelemetForReport6?: any;
  refelemetForReport7?: any;
  refelemetForReport8?: any;
};

const AuditReport = ({
  refelemetForReport2,
  refelemetForReport3,
  refelemetForReport4,
  refelemetForReport5,
  refelemetForReport6,
  refelemetForReport7,
  refelemetForReport8,
}: Props) => {
  const matches = useMediaQuery("(min-width:822px)");
  const smallScreen = useMediaQuery("(min-width:450px)");
  const isAuditReport = true;
  const userDetails = getSessionStorage();
  const [view, setView] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [screenWidth, setScreenWidth] = useState<number>(1900);
  const calendar = useRef<InstanceType<typeof FullCalendar>>(null);
  const [calendarData, setCalendarData] = useState<any>([]);
  const [dropdownOptions, setDropdownOptions] = useState<any>([]);
  const [currentYear, setCurrentYear] = useState<any>();
  const [count, setCount] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [skip, setSkip] = useState<any>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(25); //set to 25 later
  const [auditYear, setAuditYear] = useRecoilState<any>(currentAuditYear);
  const [location, setLocation] = useRecoilState<any>(currentLocation);
  const [locationListing, setLocationListing] = useState([]);
  const [auditTypeListing, setAuditTypeListing] = useState([]);
  const [systemListing, setSystemListing] = useState([]);
  const [auditorListing, setAuditorListing] = useState([]);
  const [tableData, setTableData] = useState<any>([]);
  const [auditListForAccess, setAuditListForAccess] = useState<any>([]);
  const [openAudit, setOpenAudit] = useState(false);
  const mobileViewState = useRecoilValue(mobileView);
  const [filterList, setFilterList] = useState<any>([]);
  const [selectedAuditor, setselectedAuditor] = useState<any>([]);
  const [isFilterAuditor, setfilterAuditor] = useState<boolean>(false);
  const [selectedAuditee, setselectedAuditee] = useState<any>([]);
  const [isFilterAuditee, setfilterAuditee] = useState<boolean>(false);

  const [selectedStatus, setselectedStatus] = useState<any>([]);
  const [isFilterStatus, setfilterStatus] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [searchQuery, setsearchQuery] = useState<any>({
    searchQuery: "",
  });
  const [selectedDept, setselectedDept] = useState<any>([]);
  const [isFilterDept, setfilterDept] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<any>({
    auditYear: auditYear ?? "",
    location: "",
    auditType: "",
    systemName: "",
    auditor: "",
    auditedEntity: "",
  });
  const [filterOpen, setFilterOpen] = useState(false);
  const [calendarModalInfo, setCalendarModalInfo] = useState<any>({
    open: false,
    data: {},
    mode: "create",
    calendarFor: "AuditReport",
  });
  const [myDept, setMyDept] = useState(false);
  const localizer = momentLocalizer(moment);
  const navigate = useNavigate();
  const realmName = getAppUrl();
  const isAdmin = checkRole("admin");
  const isOrgAdmin = checkRole("ORG-ADMIN");
  const isMR = checkRole("MR");
  const isLocAdmin = checkRole("LOC-ADMIN");
  const isAuditor = checkRole("AUDITOR");
  const resetForm = useResetRecoilState(auditFormData);
  const resetChecklist = useResetRecoilState(auditCreationForm);
  const { enqueueSnackbar } = useSnackbar();
  const [locationNames, setLocationNames] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any>([
    { id: "All", locationName: "All" },
  ]);

  const [auditPdfData, setAuditPdfData] = useState<any>(null);

  const classes = useStyles(matches)();
  const allOption = { id: "All", locationName: "All" };
  const [isPdfDataLoaded, setIsPdfDataLoaded] = useState<any>(false);
  const graphRef = useRef(null);
  const [radarData, setRadarData] = useState<any>(null);
  const [graphVisible, setGraphVisible] = useState(true);
  const [progress, setProgress] = useState(10);
  const [progressModel, setProgressModel] = useState(false);
  const [numDots, setNumDots] = useState(2);
  const [auditTypes, setAuditTypes] = useState<any>([]);
  const [selectedAuditType, setSelectedAuditType] = useState<any>({
    id: "All",
    auditType: "All",
  });
  const [reportOpen, setReportOpen] = useState(false);
  const handleReportClose = () => {
    setReportOpen(false);
  };
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [logo, setLogo] = useState<any>(null);
  const getLogo = async () => {
    const response = await axios.get(`/api/location/getLogo`);
    setLogo(response.data);
  };

  const nameConstruct = (data: any) => {
    if (data?.hasOwnProperty("documentNumbering")) {
      return data?.documentNumbering;
    } else if (data?.hasOwnProperty("type")) {
      return data?.name;
    } else if (data?.jobTitle) {
      return data?.jobTitle;
    }
  };

  const tableHtmlFormat = `<table>
    <tr>
      <th>%NUMBER%</th>
      <th colspan="5">%TITLE%</th>
    </tr>
    <tr>
      <th width="4%">Sr.No</th>
      <th width="20%">Checkpoint</th>
      <th width="41%">Findings Details</th>
      <th width="15%">Clause Number</th>
      <th width="10%">Impact</th>
      <th width="10%">Current Status ${new Date().toLocaleDateString(
        "en-GB"
      )}</th>
    </tr>
    %CONTENT%
   </table>`;

  const reportHtmlFormatG = `
  <div>
  <style>
    * {
  font-family: "poppinsregular", sans-serif !important;
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
        }
        
  </style>

  <table>
    <tr>
    <td style="width : 100px;">
    ${
      logo
        ? `<img src="${logo}" alt="Hindalco Logo" width="100px" height="100px" />`
        : ""
    }
</td>
      <td colspan="3" style="text-align : center; margin : auto; font-size : 22px; font-weight : 600; letter-spacing : 0.6px">
        ${realmName.toUpperCase()}<br /> 
        INTERNAL AUDIT REPORT
      
      </td>
    </tr>
    <tr>
      <td colspan="2">
       
        <b> AUDITOR(s): </b> 
         %AUDITORS%
       
      </td>
      <td colspan="2">
    
        <b> AUDITTEE: </b>   %AUDITEE% 
      </td>
    </tr>
    <tr>
      <td colspan="4">
    
        <b> Corp. Function/SBU/ Unit/Department Audited: </b>   %LOCATION/ENTITY% 
      </td>
    </tr>
    <tr>
      <td colspan="3">
     
        <b> Audit Name : </b>  %AUDITNAME%
      </td>

      <td colspan="1">
      
        <b> Audit No. : </b>   %AUDITNUMBER% 
      </td>
    </tr>

    <tr>
      <td colspan="2">
     
        <b> Audit Date : </b>  %DATE%
      </td>

      <td colspan="2">
     
      <b> Status : </b> %STATUS%
      </td>

      
    </tr>
  </table>`;

  const endHtmlFormat = `<table>
    <tr>
      <td> <b>Audit Report Comments</b></td>
    </tr>
    <tr>
      <td colspan="4">
        %COMMENT%
      </td>
    </tr>
  </table>
  </div>`;

  const scorecardHeadingFormat = `<style>
    * {
        font-family: "poppinsregular", sans-serif !important;
      }
    table {
        border-collapse: collapse;
        width: 100%;
    }
    
    td,
    th {
        border: 1px solid black;
        padding : 2px
    }  
  </style>
  <table style="background-color:orange; height:100px; width:100%">
    <tbody>
      <tr>
      <td style="width : 100px;">
      ${
        logo
          ? `<img src="${logo}" alt="Hindalco Logo" width="100px" height="100px" />`
          : ""
      }
      </td>
        <td style="text-align:center; width:100%"><strong><span style="font-size:20px">%AUDITREPORT%</span></strong></td>
      </tr>
    </tbody>
  </table>

  <p>&nbsp;</p>

  <table style="width:60%">
    <tbody>
      <tr>
        <td style="background-color:orange; width:20%"><strong>Plant</strong></td>
        <td style="width:40%">%PLANT%</td>
      </tr>
      <tr>
        <td style="background-color:orange; width:20%"><strong>Sub-Plant / Vertical</strong></td>
        <td style="width:40%">%SUBPLANT%</td>
      </tr>
      <tr>
        <td style="background-color:orange; width:20%"><strong>Assessment Done By</strong></td>
        <td style="width:40%">%ASSESSMENT%</td>
      </tr>
    </tbody>
  </table>

  <p>&nbsp;</p>`;

  const sorcecardOverallFormat = `<table style="width:50%">
    <tbody>
      <tr>
        <td style="background-color:orange; width:35%"><strong>Overall MSEF Score</strong></td>
        <td style="text-align:center; width:15%">%OVERALLSCORE%</td>
      </tr>`;

  const scorecardChartFormat = `
  </tbody>
  </table>
  <div style="page-break-before: always;"></div>
  <div style="background-color: orange; width: 50%; padding: 10px;">
    <strong>Radar Chart &gt;&gt;</strong>
  </div>

  <img src="%IMAGE%" alt="Radar Chart Image" width="80%" height="670px"/>
  <div style="page-break-before: always;"></div>
  `;

  const scorecardDetailsFormat = `<table style="width:50%">
    <tbody>
      <tr>
        <td><strong>Detailed Scorecard &gt;&gt;</strong></td>
      </tr>
    </tbody>
  </table>

  <p>&nbsp;</p>

  <table style="width:100%">
    <tbody>
      <tr>
        <th scope="col" style="width: 10%">&nbsp;</th>`;

  /**
   * @method changePage
   * @description Function to change the page on the pagination controller
   * @param pageNumber {number}
   * @returns nothing
   */
  const columnfilterurl: any = formatDashboardQuery(
    `/api/dashboard`,
    {
      selectedDepartment: selectedDept,
      selectedAuditee: selectedAuditee,
      SelectedAuditor: selectedAuditor,
      // selectedAudit: selectedAudit,
      selectedStatus,
      // selectedType,
      // selectedSystem,
    },
    true
  );
  const changePage = (pageNumber: number, pageSizeNumber: number) => {
    setRowsPerPage(pageSizeNumber);
    const encodedLocation = encodeURIComponent(
      JSON.stringify(selectedLocation)
    );
    fetchAuditReportTableData(
      selectedAuditType?.id,
      currentYear,
      myDept,
      rowsPerPage * (pageNumber - 1),
      pageSizeNumber,
      selectedAuditee,
      selectedAuditor,
      encodedLocation
    )
      .then((response: any) => {
        setTableData(parseData(response?.data?.audits));
        setIsLoading(false);
      })
      .catch((error: any) => setIsLoading(false));
    setPage(pageNumber);
  };
  /**
   * @method handleSearchChange
   * @description Function to handle search field value changes inside the filter drawer container
   * @param e {any}
   * @returns nothing
   */
  const handleSearchChange = (e: any) => {
    e.preventDefault();
    setSearchValue({
      ...searchValue,
      [e.target.name]: e.target.value,
    });
  };
  // const myDeptChange = () => {
  //   console.log("mydept", myDept);
  //   if (myDept) {
  //     setSearchValue({
  //       ...searchValue,
  //       auditedEntity: userDetails?.entityId,
  //     });
  //   } else {
  //     setSearchValue({
  //       ...searchValue,
  //       auditedEntity: "",
  //     });
  //   }
  // };
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

  const handleSearchChangeNew = (e: any) => {
    e.preventDefault();
    setsearchQuery({
      ...searchQuery,
      [e.target.name]: e.target.value,
    });
  };

  const [selected, setSelected] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(false);

  const handleChangeList = (event: any, values: any) => {
    if (values.find((option: any) => option.id === "All")) {
      setSelectedLocation([allOption]);
    } else {
      setSelectedLocation(values.filter((option: any) => option.id !== "All"));
    }
    setSelectedUnit(!!values);
  };
  const fetchFilterList = async () => {
    try {
      const response = await axios.get(`/api/audits/nc/getFilterList`);

      setFilterList(response?.data);
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleReportYes = () => {
    navigate("/audit/auditreport/newaudit");
  };

  /**
   * @method handleMenuItemClick
   * @description Function which is called when a menu option is clicked
   * @returns nothing
   */
  const handleMenuItemClick = (title: string, id: string, subId: string) => {
    navigate("/audit/auditreport/newaudit", {
      state: {
        systemDetails: {
          name: title,
          id: id,
          subId: subId,
        },
        read: false,
      },
    });
  };

  const handleToggle = () => {
    setMyDept((prevState) => !prevState);
    // Perform any additional actions here
  };
  const showTotal: PaginationProps["showTotal"] = (total: any) =>
    `Total ${total} items`;
  /**
   *
   * @method handleSubmit
   * @description Function which is invoked when the new audit button is clicked (Redirects the user to the audit creation form stepper)
   * @returns nothing
   */
  const handleSubmit = () => {
    navigate("/audit/auditreport/newaudit");
  };

  const parseSubData = (data: any) => {
    return data?.map((item: any) => {
      return {
        name: item.firstname + " " + item.lastname,
      };
    });
  };

  /**
   * @method parseData
   * @description Function to parse all the table data which was fetched from the server
   * @param data {any}
   * @returns a segregated json object containing the table data
   */
  const parseData = (data: any) => {
    return data?.map((item: any) => {
      return {
        id: item?._id,
        auditName: (
          <Tooltip title="Click to see audit" placement="right">
            <Link
              to={`/audit/auditreport/newaudit/${item?._id}`}
              state={{
                edit: isOrgAdmin || isMR || isLocAdmin,
                id: item._id,
                read: true,
              }}
              style={{ color: "black" }}
            >
              {item?.auditName ?? "-"}
            </Link>
          </Tooltip>
        ),
        auditedEntity: item?.auditedEntity?.entityName ?? "-",
        auditNumber: item?.auditNumber ?? "-",
        auditTypeId: item?.auditTypeId,
        location: item?.location?.locationName ?? "-",
        system: item?.system ?? [],
        auditors: item?.auditors,
        isDraft: item?.isDraft,
        //  (
        //   <TableRatingUtil
        //     data={parseSubData(item?.auditors)}
        //     name="name"
        //     currentRating={item?.rating}
        //     overallRating={item?.overallRating}
        //     disable={!isMR!}
        //   />
        // ),
        auditees: item?.auditees,
        //  (
        //   <MultiUserDisplay name="name" data={parseSubData(item?.auditees)} />
        // ),
        date: new Date(item?.date).toLocaleDateString() ?? "-",
        nc: (
          <TableNcUtil
            count={item?.ncCount}
            isDraft={item?.isDraft}
            auditTypeId={item?.auditTypeId}
            id={item._id}
            auditorName={item.auditors}
            auditLocation={item.location}
          />
        ),
      };
    });
  };

  /**
   * @method getCalendarData
   * @description Function to get calendar data for listing them out on the calendar
   * @returns nothing
   */
  const getCalendarData = () => {
    getCalendarEntries().then((response: any) => {
      //process the result
      response?.data?.map((item: any) => {
        //console.log("item value in audit report", item);
        let color: any;
        if (item.auditors?.includes(userDetails?.id)) {
          color = "skyblue";
        } else if (item.auditees?.includes(userDetails?.id)) {
          color = "#e6ffe6";
        } else color = "yellow";
        setCalendarData((prev: any) => [
          ...prev,
          {
            id: item._id,
            title: item.auditName ?? "-",
            start: item.date ?? "-",
            allDay: false,
            className: "audit-entry",
            textColor: "#000000",
            color: color,
            url: `/audit/auditreport/newaudit/${item._id}`,
          },
        ]);
      });
    });
  };
  const getyear = async () => {
    const currentyear = await getYearFormat(new Date().getFullYear());
    setCurrentYear(currentyear);
  };
  /**
   * @method parseSystemListing
   * @description Function to parse system listing
   * @return nothing
   */
  const parseSystemListing = (data: any) => {
    const parsedData = data?.map((parentItem: any) => {
      const subSystems: any = [];
      if (parentItem.systems.length > 0) {
        parentItem.systems.map((item: any) => {
          subSystems.push({
            id: parentItem.id,
            subId: item._id,
            title: item.name,
          });
        });
      }
      return subSystems.length > 0
        ? {
            id: parentItem.id,
            title: parentItem.name,
            submenu: subSystems,
          }
        : {
            id: parentItem.id,
            title: parentItem.name,
          };
    });
    return parsedData?.filter((item: any) => item?.submenu);
  };

  /**
   * @method getSystemListing
   * @description Function to list system names with system types
   * @returns nothing
   */
  const getSystemListing = () => {
    getSystemWithTypes(realmName).then((response: any) => {
      const parsedSystems = parseSystemListing(response?.data);
      setDropdownOptions(parsedSystems);
    });
  };

  /**
   * @method getHeaderData
   * @description Function to get header data
   * @returns nothing
   */
  const getHeaderData = () => {
    getOrganizationData(realmName).then((response: any) => {
      setAuditYear(response?.data?.auditYear);
    });
    getAllAuditors(realmName).then((response: any) => {
      getLocationById(response?.data?.locationId).then((locresponse: any) => {
        setLocation(locresponse?.data?.locationName);
      });
    });
  };

  /**
   * @method handleDiscard
   * @description Function to remove all the filter text present in the fields
   * @returns nothing
   */
  const handleDiscard = () => {
    const encodedLocation = encodeURIComponent(
      JSON.stringify(selectedLocation)
    );
    setOpenAudit(false);
    setIsLoading(true);
    setSearchValue({
      auditYear: "",
      location: "",
      auditType: "",
      systemName: "",
      auditor: "",
      auditedEntity: "",
    });
    setsearchQuery({
      searchQuery: "",
    });
    if (!currentYear) return;
    fetchAuditReportTableData(
      selectedAuditType?.id,
      currentYear,
      myDept,
      skip,
      25,
      columnfilterurl,
      "",
      encodedLocation,
      "",
      "",
      ""
    )
      .then((res: any) => {
        //console.log("checkaudit res.data-->", res.data);

        const data = parseData(res?.data?.audits);
        setCount(res?.data.count);
        setTableData(data);
      })
      .catch((err) =>
        enqueueSnackbar(err.message, {
          variant: "error",
        })
      )
      .finally(() => {
        setIsLoading(false);
      });
  };

  /**
   * @method handleApply
   * @description Function to perform a network call for filtering the table data
   * @returns nothing
   */
  const handleApply = () => {
    setIsLoading(true);
    fetchAuditReportTableData(
      selectedAuditType?.id,

      skip,
      myDept,
      25,
      searchValue.auditYear,
      searchValue.location,
      searchValue.auditType,
      searchValue.systemName,
      searchValue.auditor,
      searchValue.auditedEntity,
      currentYear
    )
      .then((res: any) => {
        const data = parseData(res?.data?.audits);
        setCount(res?.data.count);
        setTableData(data);
      })
      .catch((err) =>
        enqueueSnackbar(err.message, {
          variant: "error",
        })
      )
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleTableSearch = () => {
    setIsLoading(true);
    searchAuditTableData(searchQuery?.searchQuery, skip, 25)
      .then((res: any) => {
        const data = parseData(res?.data?.audits);
        setCount(res?.data.count);
        setTableData(data);
      })
      .catch((err) =>
        enqueueSnackbar(err.message, {
          variant: "error",
        })
      )
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleMyAudit = () => {
    setIsLoading(true);

    myAudit(skip, 25)
      .then((res: any) => {
        const data = parseData(res?.data?.audits);
        setCount(res?.data.count);
        setTableData(data);
      })
      .catch((err) =>
        enqueueSnackbar(err.message, {
          variant: "error",
        })
      )
      .finally(() => {
        setIsLoading(false);
      });
  };

  /**
   * @method getTableData
   * @description Function to fetch table data
   * @returns nothing
   */
  const getTableData = () => {
    setIsLoading(true);
    const encodedLocation = encodeURIComponent(
      JSON.stringify(selectedLocation)
    );
    if (!currentYear) return;
    if (myDept) {
      setSearchValue((prev: any) => {
        return { ...prev, auditedEntity: userDetails?.entityId };
      });
    }

    fetchAuditReportTableData(
      selectedAuditType?.id,

      currentYear,
      myDept,
      0,
      25,
      columnfilterurl,
      "",
      encodedLocation,
      searchValue.auditedEntity
    )
      .then((response: any) => {
        setTableData(parseData(response?.data?.audits));
        setCount(response?.data?.count);
        setAuditListForAccess(response?.data?.audits?.auditors);
        setIsLoading(false);
      })
      .catch((error: any) => setIsLoading(false));
  };

  /**
   * @method sortTable
   * @description Function to sort table data when the arrow head is clicked
   * @param field {string}
   * @param order {string}
   */
  const sortTable = (field: string, order: string) => {
    setTableData([]);
    sortData(
      skip,
      25,
      `${field}:${order}`,
      searchValue.auditYear,
      searchValue.location,
      searchValue.auditType,
      searchValue.systemName,
      searchValue.auditor
    )
      .then((response: any) => {
        setTableData(parseData(response?.data?.audits));
      })
      .catch((error: any) => {});
  };

  /**
   * @method parseLocation
   * @description Function to print system types
   * @param data {any}
   * @returns an array of system types
   */
  const parseLocation = (data: any) => {
    const systemTypes: any = [];
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

  /**
   * @method parseAuditType
   * @description Function to parse audit type for listing it out on the typeahead filter
   * @param data {any}
   * @returns nothing
   */
  const parseAuditType = (data: any) => {
    const auditTypes: any = [];
    data?.map((item: any) => {
      auditTypes.push({
        name: item?.name,
        value: item?.id,
      });
    });
    return auditTypes;
  };

  /**
   * @method parseSystemTypes
   * @description Function to parse system types for listing it out on the typeahead filter
   * @param data {any}
   * @returns nothing
   */
  const parseSystemType = (data: any) => {
    const systemTypes: any = [];
    data?.map((item: any) => {
      systemTypes.push({
        name: item?.name,
        value: item?._id,
      });
    });
    return systemTypes;
  };

  /**
   * @method parseAuditors
   * @description Function to parse auditors for listing it out on the typeahead filter
   * @param data {any}
   * @returns nothing
   */
  const parseAuditors = (data: any) => {
    const auditors: any = [];
    data?.map((item: any) => {
      auditors.push({
        name: `${item?.firstname} ${item?.lastname}`,
        value: item?.id,
      });
    });
    return auditors;
  };

  /**
   * @method getAllLocation
   * @description Function to fetch all location entries for listing them out on the location filter
   * @returns nothing
   */
  const getAllLocations = () => {
    getAllLocation(realmName).then((response: any) => {
      setLocationListing(parseLocation(response?.data));
    });
  };

  /**
   * @method getAllSystemTypes
   * @description Function to fetch all system types
   * @param realm {string}
   * @returns nothing
   */
  const getAllSystemTypes = (realm: string) => {
    getSystemTypes(realmName)
      .then((response: any) => {
        setAuditTypeListing(parseAuditType(response?.data));
      })
      .catch((error: any) => console.log("error response - ", error));
  };

  /**
   * @method getAuditors
   * @description Function to get all auditors
   * @param realm {string}
   * @returns nothing
   */
  const getAuditors = (realm: string) => {
    getAllAuditors(realm).then((response: any) => {
      setAuditorListing(parseAuditors(response?.data));
    });
  };

  /**
   * @method getAllSubSystemTypes
   * @description Function to fetch all sub system types
   * @param id {string}
   * @returns nothing
   */
  const getAllSubSystemTypes = (id: string) => {
    getSystems(id).then((response: any) => {
      setSystemListing(parseSystemType(response?.data));
    });
  };

  useEffect(() => {
    getLogo();
    setScreenWidth(window.screen.width);
    fetchFilterList();
    getAuditType();
    if (!isAdmin) {
      //console.log("inside useeffect");
      resetForm();
      resetChecklist();
      // fetchFilterList();
      getCalendarData();
      getSystemListing();
      getHeaderData();
      getyear();
      if (!!currentYear && !!selectedAuditee && !!selectedAuditor) {
        getTableData();
      }
      getAllLocations();
      getLocationNames();

      getAllSystemTypes(realmName);
      getAuditors(realmName);
      getyear();
    }
  }, []);

  useEffect(() => {
    if (!isOrgAdmin) {
      setSelectedLocation([
        {
          id: userDetails?.location?.id,
          locationName: userDetails?.location?.locationName,
        },
      ]);
    }
  }, [locationNames]);

  useEffect(() => {
    if (!!currentYear && selectedLocation.length !== 0) {
      getTableData();
    }
  }, [
    currentYear,
    selectedLocation,
    isFilterAuditee,
    isFilterDept,
    isFilterAuditor,
    isFilterStatus,
    myDept,
    selectedAuditType,
  ]);

  useEffect(() => {
    if (openAudit) {
      handleMyAudit();
    } else {
      getTableData();
      // handleDiscard();
    }
  }, [openAudit]);

  const calendarStylesDesktop: any = {
    position: "absolute",
    top: 140,
    right: 150,
    border: "1px solid #6e7dab",
  };
  const calendarStylesMobile: any = {
    position: "absolute",
    top: 140,
    right: 90,
    border: "1px solid #6e7dab",
  };

  const toggleCalendarModal = (data: any = {}) => {
    // console.log("check data in toggle ", data);

    setCalendarModalInfo({
      ...calendarModalInfo,
      open: !calendarModalInfo.open,
      data: data,
    });
  };

  const progressTimer = () => {
    if (progress < 90) {
      setTimeout(() => {
        setProgress((prevProgress) => prevProgress + 10);
      }, 1500);
    }
    if (progress === 100) {
      setTimeout(() => {
        setProgressModel(false);
      }, 5000);
    }
  };

  useEffect(() => {
    if (progressModel) {
      progressTimer();
    }
  }, [progress, progressModel]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNumDots((prevNumDots) => (prevNumDots === 4 ? 2 : prevNumDots + 1));
    }, 500);

    if (!progressModel) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [progressModel]);

  const getAuditType = async () => {
    try {
      const allAuditType = { id: "All", auditType: "All" };

      const res = await axios.get(`/api/audit-settings/getAllAuditTypes`);

      setAuditTypes([allAuditType, ...res.data]);
    } catch (err) {
      console.error(err);
    }
  };

  const getAuditData = (id: string) => {
    getAuditForPdf(id).then(async (response: any) => {
      const allFindings = await axios.get(
        `api/audits/getAllNcStatusByAuditId/${id}`
      );
      // const parsedData = dataParser(data?.data?.nc);
      const formattedDateTime = formatDateTime(response?.data?.date).split(
        "T"
      )[0];
      // console.log("check response in get audit data", response.data.urls);
      const uniqueFindingsObject: Record<string, any[]> = {};
      let count = 0;

      response?.data?.sections?.forEach((section: any) => {
        section?.sections?.forEach((sections: any) => {
          sections?.fieldset?.forEach((field: any) => {
            const ncItem = allFindings.data.find(
              (item: any) => item.sectionFindingId === field.ncId
            );
            // Update field.nc.status if a match is found
            if (ncItem) {
              field.nc = field.nc || {}; // Ensure field.nc is not undefined
              field.nc.status = ncItem.status;
              field.nc.checkpoint = field.title;
            }
            const fieldType = field?.nc?.type;
            if (fieldType) {
              if (!uniqueFindingsObject[fieldType]) {
                uniqueFindingsObject[fieldType] = [];
              }
              uniqueFindingsObject[fieldType].push(field.nc);
            }
          });
        });
      });

      const pdfData = {
        auditType: response.data.auditType,
        system: response.data.system,
        auditors: response.data.auditors,
        location: response.data.location.locationName,
        auditNumber: response.data.auditNumber,
        auditYear: response.data.auditYear,
        auditName: response.data.auditName,
        date: formattedDateTime,
        draft: response.data.isDraft,
        auditedEntity: response?.data?.auditedEntity?.entityName || "",
        auditees: response?.data?.auditees,
        findings: uniqueFindingsObject,
        comment: response?.data?.comment || "",
      };

      setAuditPdfData({
        auditType: response.data.auditType,
        system: response.data.system,
        auditors: response.data.auditors,
        location: response.data.location.locationName,
        auditNumber: response.data.auditNumber,
        auditYear: response.data.auditYear,
        auditName: response.data.auditName,
        draft: response.data.isDraft,
        date: formattedDateTime,
        auditedEntity: response?.data?.auditedEntity?.entityName || "",
        auditees: response?.data?.auditees,
        findings: uniqueFindingsObject,
      });
      //console.log("PDF DATA ", pdfData);

      setIsPdfDataLoaded(true);

      let fillTemplate = reportHtmlFormatG
        .replace(
          "%AUDITORS%",
          pdfData?.auditors
            ?.map((item: any) => item.firstname + " " + item.lastname)
            .join(", ") ?? "-"
        )
        .replace(
          "%AUDITEE%",
          pdfData?.auditees
            ?.map((item: any) => item.firstname + " " + item.lastname)
            .join(", ") ?? "-"
        )
        .replace(
          "%LOCATION/ENTITY%",
          pdfData?.location + " / " + pdfData?.auditedEntity
        )
        .replace("%STATUS%", pdfData?.draft === true ? "Draft" : "Published")
        .replace("%AUDITNUMBER%", pdfData?.auditNumber)
        .replace(
          "%DATE%",
          pdfData?.date.split("-")[2] +
            "-" +
            pdfData?.date.split("-")[1] +
            "-" +
            pdfData?.date.split("-")[0]
        )
        .replace("%AUDITNAME%", pdfData?.auditName);

      Object.entries(pdfData.findings).forEach(([type, fields]) => {
        console.log("fields ", fields);
        fillTemplate =
          fillTemplate +
          tableHtmlFormat
            .replace("%NUMBER%", (++count).toString())
            .replace("%TITLE%", type)
            .replace(
              "%CONTENT%",
              fields && fields.length
                ? fields
                    .map((nc: any, index: any) => {
                      const ncRef = nc.impact
                        ?.map((ref: any) => ref)
                        .join(", ");
                      const ncHtml = `
                      <tr key={index}>
                        <td>${index + 1}) 
      ${
        nc.highPriority
          ? `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="red">
          <path d="M12 2L1 21h22L12 2zm0 3.3L20.5 19h-17L12 5.3zM11 10h2v5h-2v-5zm0 6h2v2h-2v-2z"/>
        </svg>`
          : ""
      }
    </td>
    <td>${nc.checkpoint ? nc.checkpoint : "N/A"}</td>
                        <td>${nc.comment ? nc.comment : "N/A"}</td>
                        <td>${nc?.clause ? nc?.clause?.clauseName : ""}</td>
                        <td>${ncRef ? ncRef : ""}</td>
                        <td>${nc?.status ? nc?.status : ""}</td>
                      </tr>
                      <tr key={index}>
                        <th colspan="1"></th>
                        <th colspan="5" style="text-align: left;">
                          Evidence
                        </th>
                      </tr>
                      `;
                      let imageHtml = "";
                      const evidenceHtml = nc.evidence
                        ?.map((item: any) => {
                          const attFileName: any[] = [];
                          if (item.attachment && item.attachment.length > 0) {
                            if (
                              process.env.REACT_APP_IS_OBJECT_STORAGE === "true"
                            ) {
                              imageHtml = item.attachment
                                ?.map((attachment: any) => {
                                  attFileName.push(attachment.name);
                                  if (
                                    attachment.obsUrl
                                      .toLowerCase()
                                      .endsWith(".png") ||
                                    attachment.obsUrl
                                      .toLowerCase()
                                      .endsWith(".jpg") ||
                                    attachment.obsUrl
                                      .toLowerCase()
                                      .endsWith(".jpeg")
                                  ) {
                                    return `<img src="${attachment.obsUrl}" alt="Description of the image" width="356" height="200" style="margin-right: 40px; margin-bottom: 5px;">`;
                                  }
                                })
                                .join("");
                            } else {
                              imageHtml = item.attachment
                                ?.map((attachment: any) => {
                                  attFileName.push(attachment.name);
                                  if (
                                    attachment.url
                                      .toLowerCase()
                                      .endsWith(".png") ||
                                    attachment.url
                                      .toLowerCase()
                                      .endsWith(".jpg") ||
                                    attachment.url
                                      .toLowerCase()
                                      .endsWith(".jpeg")
                                  ) {
                                    return `<img src="${attachment.url}" alt="Description of the image" width="356" height="200" style="margin-right: 40px;">`;
                                  }
                                })
                                .join("");
                            }
                            return `
                          <tr key={index}>
                            <td colspan="1"></td>
                            <td colspan="5" style="text-align: left;">
                              ${item.text}<br><br>
                              <strong>Attached Files:</strong> ${attFileName.join(
                                ",  "
                              )}<br>
                              ${imageHtml}
                            </td>
                          </tr>
                        `;
                          } else {
                            return `
                          <tr key={index}>
                            <td colspan="1"></td>
                            <td colspan="5" style="text-align: left;">
                              ${item.text}
                            </td>
                          </tr>
                        `;
                          }
                        })
                        .join("");
                      return ncHtml + (evidenceHtml ? evidenceHtml : "");
                    })
                    .join("")
                : `
                    <tr style="background-color: #ffa07a; text-align: center;" >
                      <td colspan="4" style="margin: auto;"> No Data Found  </td>
                    </tr>
                    `
            );
      });

      fillTemplate =
        fillTemplate +
        endHtmlFormat.replace("%COMMENT%", pdfData?.comment ?? "-") +
        `<br>
        <span><b>Report Generated On : ${new Date().toLocaleDateString(
          "en-GB"
        )}</b></span>`;

      printJS({
        type: "raw-html",
        printable: fillTemplate,
      });
      setProgress(100);
    });
  };

  const getAuditChecklistData = (id: string) => {
    setRadarData([]);
    setGraphVisible(true);
    getAudit(id).then(async (response: any) => {
      const uniqueSectionTitles = [
        ...new Set(
          response.data.sections.flatMap((auditChecklist: any) =>
            auditChecklist.sections.map((section: any) => section.title)
          )
        ),
      ];

      const auditChecklistList = response.data.sections.map(
        (auditChecklist: any) => {
          const sections = auditChecklist.sections.map((section: any) => ({
            title: section.title,
            totalScore: section.totalScore,
            obtainedScore: section.obtainedScore,
          }));

          const totalAuditChecklistScore = auditChecklist.sections.reduce(
            (total: any, section: any) => total + section.totalScore,
            0
          );

          const obtainedAuditChecklistScore = auditChecklist.sections.reduce(
            (total: any, section: any) => total + section.obtainedScore,
            0
          );

          return {
            auditCheckList: auditChecklist.title,
            totalAuditChecklistScore: totalAuditChecklistScore,
            obtainedAuditChecklistScore: obtainedAuditChecklistScore,
            sections: sections,
          };
        }
      );
      setRadarData(auditChecklistList);

      const allTotalSectionScore: any = [];

      response.data.sections.forEach((auditChecklist: any) => {
        auditChecklist.sections.forEach((section: any) => {
          const existingSection = allTotalSectionScore.find(
            (item: any) => item.sectionTitle === section.title
          );

          if (existingSection) {
            existingSection.allMaxSectionScore += section.totalScore;
            existingSection.allObtainedSectionScore += section.obtainedScore;
          } else {
            allTotalSectionScore.push({
              sectionTitle: section.title,
              allMaxSectionScore: section.totalScore,
              allObtainedSectionScore: section.obtainedScore,
            });
          }
        });
      });

      let totalObtainedChecklistScore = 0;
      let totalMaxChecklistScore = 0;

      auditChecklistList.forEach((item: any) => {
        totalObtainedChecklistScore += item.obtainedAuditChecklistScore;
        totalMaxChecklistScore += item.totalAuditChecklistScore;
      });

      const pdfData = {
        auditName: response.data.auditName,
        plant: response.data.organization.organizationName,
        subPlant: response.data.location.locationName,
        assessmentBy:
          response.data.auditees[0].firstname +
          " " +
          response.data.auditees[0].lastname,
        overallScore:
          (
            (totalObtainedChecklistScore / totalMaxChecklistScore) *
            100
          ).toFixed(2) + "%",
        sections: uniqueSectionTitles,
        auditChecklistList: auditChecklistList,
        totalSectionScore: allTotalSectionScore,
      };

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const finalTemplate = await getAuditChecklistTemplate(pdfData);
      printJS({
        type: "raw-html",
        printable: finalTemplate,
      });
    });
  };
  const handleButtonClick = (option: any) => {
    // If the same button is clicked again, deselect it
    if (selectedOption === option) {
      setSelectedOption("");
      // Reset relevant state variables
      setMyDept(false);
      setOpenAudit(false);
    } else {
      // Otherwise, select the button and update state variables accordingly
      setSelectedOption(option);
      if (option === "My Dept/Vertical") {
        setMyDept(true);
        setOpenAudit(false);
      } else if (option === "My Loc") {
        setMyDept(false);
        setOpenAudit(false);
      } else if (option === "My Audits") {
        setOpenAudit(true);
      }
    }
  };

  const getAuditChecklistTemplate = async (pdfData: any) => {
    const element = document.getElementById("graphRef");
    const imageData = await htmlToImage.toPng(element!);
    setGraphVisible(false);
    let fillTemplate = scorecardHeadingFormat
      .replace("%AUDITREPORT%", pdfData?.auditName)
      .replace("%PLANT%", pdfData?.plant)
      .replace("%SUBPLANT%", pdfData?.subPlant)
      .replace("%ASSESSMENT%", pdfData?.assessmentBy);

    fillTemplate =
      fillTemplate +
      sorcecardOverallFormat.replace("%OVERALLSCORE%", pdfData?.overallScore);

    fillTemplate =
      fillTemplate +
      pdfData?.totalSectionScore
        .map(
          (item: any) =>
            `<tr>
        <td style="background-color:orange"><strong>${
          item.sectionTitle
        } Score</strong></td>
        <td style="text-align:center">${(
          (item.allObtainedSectionScore / item.allMaxSectionScore) *
          100
        ).toFixed(2)}%</td>
      </tr>`
        )
        .join("");

    fillTemplate =
      fillTemplate + scorecardChartFormat.replace("%IMAGE%", imageData);

    fillTemplate = fillTemplate + scorecardDetailsFormat;

    fillTemplate =
      fillTemplate +
      pdfData?.totalSectionScore
        .map(
          (item: any) =>
            `
        <th scope="col" style="text-align: center">${item.sectionTitle}</th>
        <th scope="col" style="text-align: center">${item.sectionTitle}</th>
      `
        )
        .join("") +
      `
      <th scope="col" style="text-align: center">Total</th>
      <th scope="col" style="text-align: center">Total</th>
      <th scope="col" style="text-align: center">Total</th>
    </tr>
    <tr>
      <td style="">${pdfData?.auditName} Sub-process</td>
    ` +
      pdfData?.totalSectionScore
        .map(
          (item: any) =>
            `
        <td style="text-align:center">Max Score (${item.sectionTitle})</td>
        <td style="text-align:center">Obtained Score (${item.sectionTitle})</td>
      `
        )
        .join("") +
      `
      <td style="text-align:center">Max Score (Overall)</td>
      <td style="text-align:center">Obtained Score (Overall)</td>
      <td style="text-align:center">%Score</td>
    </tr>
    `;

    fillTemplate =
      fillTemplate +
      pdfData?.auditChecklistList
        .map(
          (item: any) =>
            `
      <tr>
      <td style="">${item.auditCheckList}&nbsp;</td>
      ` +
            pdfData?.sections
              .map((section: any) => {
                const sectionDetails = item.sections.find(
                  (s: any) => s.title === section
                );
                if (sectionDetails) {
                  return `
            <td style="text-align:center">${sectionDetails.totalScore}</td>
            <td style="text-align:center">${sectionDetails.obtainedScore}</td>
          `;
                } else {
                  return `
            <td style="text-align:center">0</td>
            <td style="text-align:center">0</td>
          `;
                }
              })
              .join("") +
            ` 
          <td style="text-align:center">${item.totalAuditChecklistScore}</td>
          <td style="text-align:center">${item.obtainedAuditChecklistScore}</td>
          <td style="text-align:center">${(
            (item.obtainedAuditChecklistScore / item.totalAuditChecklistScore) *
            100
          ).toFixed(2)}%</td>
        </tr>
      `
        )
        .join("");

    fillTemplate =
      fillTemplate +
      `
      <tr>
        <td style="">Total</td>
    ` +
      pdfData?.totalSectionScore
        .map(
          (item: any) =>
            `
      <td style="text-align:center">${item.allMaxSectionScore}</td>
      <td style="text-align:center">${item.allObtainedSectionScore}</td>
      `
        )
        .join("");

    let totalTotalAuditScore = 0;
    let totalObtainedAuditScore = 0;

    pdfData?.auditChecklistList.forEach((item: any) => {
      totalTotalAuditScore += item.totalAuditChecklistScore;
      totalObtainedAuditScore += item.obtainedAuditChecklistScore;
    });

    fillTemplate =
      fillTemplate +
      `
      <td style="text-align:center">${totalTotalAuditScore}</td>
      <td style="text-align:center">${totalObtainedAuditScore}</td>
      <td style="text-align:center">${(
        (totalObtainedAuditScore / totalTotalAuditScore) *
        100
      ).toFixed(2)}%</td>
    </tr>
    `;
    fillTemplate =
      fillTemplate +
      `
      <tr>
      <td style="">&nbsp;</td>
    ` +
      pdfData?.totalSectionScore
        .map(
          (item: any) =>
            `
      <td style="text-align:center"></td>
      <td style="text-align:center">${(
        (item.allObtainedSectionScore / item.allMaxSectionScore) *
        100
      ).toFixed(2)}%</td>
      `
        )
        .join("") +
      `
          <td style="text-align:center">&nbsp;</td>
          <td style="text-align:center">&nbsp;</td>
          <td style="text-align:center">&nbsp;</td>
        </tr>
      </tbody>
    </table>

    <p>&nbsp;</p>
    `;
    return fillTemplate;
  };
  const handleClickPdfOpen = (val: any) => {
    setProgress(10);
    setProgressModel(true);
    getAuditData(val.id);
  };

  const handleAuditChecklistOpen = (val: any) => {
    getAuditChecklistData(val.id);
  };

  useEffect(() => {}, [auditPdfData]);
  const columns: ColumnsType<any> = [
    {
      title: "Audit Name",
      dataIndex: "auditName",
      width: 200,
      render: (_, record, index) => {
        if (index === 0) {
          return (
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                ref={refelemetForReport6}
                style={{
                  paddingRight: "10px",
                  color: "#636363",
                }}
                onClick={() => {
                  handleClickPdfOpen(record);
                }}
              >
                <MdOutlinePictureAsPdf
                  style={{
                    color: "rgba(0, 0, 0, 0.6)",
                    width: "20px",
                    height: "18px",
                    cursor: "pointer",
                  }}
                />
              </div>
              {/* <div
                ref={refelemetForReport7}
                style={{
                  paddingRight: "10px",
                  color: "#636363",
                }}
                onClick={() => handleAuditChecklistOpen(record)}
              >
                <AssessmentOutlinedIcon
                  style={{
                    color: "rgba(0, 0, 0, 0.6)",
                    width: "20px",
                    height: "18px",
                    cursor: "pointer",
                  }}
                />
              </div> */}
              {/* <div
                ref={refelemetForReport5}
                style={{
                  textDecorationLine: "underline",
                  cursor: "pointer",
                }}
              >
                {record.auditName}
              </div> */}
              <div
                style={{ position: "relative", display: "inline-block" }}
                ref={refelemetForReport5}
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
        }
        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                paddingRight: "10px",
                color: "#636363",
              }}
              onClick={() => {
                handleClickPdfOpen(record);
              }}
            >
              <MdOutlinePictureAsPdf
                style={{
                  color: "rgba(0, 0, 0, 0.6)",
                  width: "20px",
                  height: "18px",
                  cursor: "pointer",
                }}
              />
            </div>
            {/* <div
              style={{
                paddingRight: "10px",
                color: "#636363",
              }}
              onClick={() => handleAuditChecklistOpen(record)}
            >
              <AssessmentOutlinedIcon
                style={{
                  color: "rgba(0, 0, 0, 0.6)",
                  width: "20px",
                  height: "18px",
                  cursor: "pointer",
                }}
              />
            </div> */}
            <div
              style={{
                textDecorationLine: "underline",
                cursor: "pointer",
              }}
            >
              {record.auditName}
            </div>
          </div>
        );
      },
    },
    {
      title: "Audit Number",
      dataIndex: "auditNumber",

      // onFilter: (value: any, record: any) => {
      //   console.log("value:", value); // Log the entire record
      //   return record.auditTypeName === value;
      // },
      // filterDropdown: ({
      //   setSelectedKeys,
      //   selectedKeys,
      //   confirm,
      //   clearFilters,
      // }: any) => {
      //   // Create a set to store unique names
      //   const uniqueNames = new Set();

      //   // Iterate through allAuditPlanDetails and add unique names to the set
      //   allAuditScheduleDetails?.forEach((item: any) => {
      //     const name = item.auditTypeName;
      //     uniqueNames.add(name);
      //   });

      //   // Convert the set back to an array for rendering
      //   const uniqueNamesArray = Array.from(uniqueNames);

      //   return (
      //     <div style={{ padding: 8 }}>
      //       {uniqueNamesArray.map((name: any) => (
      //         <div key={name}>
      //           <label>
      //             <input
      //               type="checkbox"
      //               onChange={(e) => {
      //                 const value = e.target.value;
      //                 if (e.target.checked) {
      //                   setSelectedKeys([...selectedKeys, value]);
      //                 } else {
      //                   setSelectedKeys(
      //                     selectedKeys.filter((key: any) => key !== value)
      //                   );
      //                 }
      //               }}
      //               value={name}
      //               checked={selectedKeys.includes(name)} // Check if the checkbox should be checked
      //             />
      //             {name}
      //           </label>
      //         </div>
      //       ))}
      //       <div style={{ marginTop: 8 }}>
      //         <Button
      //           type="primary"
      //           onClick={() => {
      //             confirm();
      //             // setFilteredValues(selectedKeys);
      //             console.log("Selected Values:", selectedKeys);
      //           }}
      //           style={{ marginRight: 8 }}
      //         >
      //           Filter
      //         </Button>
      //         {/* <Button onClick={() => {}}>Reset</Button>{" "} */}
      //         {/* Add a reset button */}
      //       </div>
      //     </div>
      //   );
      // },
    },
    {
      title: "Corp Func/Unit",
      dataIndex: "location",
    },
    {
      title: "System",
      dataIndex: "system",
      render: (_, record) => {
        return <MultiUserDisplay data={record?.system || []} name="name" />;
      },
    },
    {
      title: "Audited Dept/Vertical",
      dataIndex: "auditedEntity",
      filterIcon: (filtered: any) =>
        selectedDept?.length > 0 ? (
          <AiFillFilter style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <AiOutlineFilter style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }: any) => {
        return (
          <div style={{ padding: 8, overflowY: "scroll" }}>
            {filterList?.deptData?.map((item: any) => (
              <div key={item.id}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setselectedDept([...selectedDept, value]);
                      } else {
                        setselectedDept(
                          selectedDept.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={item.id}
                    checked={selectedDept.includes(item.id)} // Check if the checkbox should be checked
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "5px",
                    }}
                  />
                  {item.entityName}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                // type="primary"
                disabled={selectedDept.length === 0}
                onClick={() => {
                  setfilterDept(!isFilterDept);
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
                  setselectedDept([]);
                  setfilterDept(!isFilterDept);
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
      title: "Status",
      dataIndex: "isDraft",
      render: (_: any, record: any) =>
        record?.isDraft ? "Draft" : "Published",
      filterIcon: (filtered: any) =>
        selectedStatus?.length > 0 ? (
          <AiFillFilter style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <AiOutlineFilter style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }: any) => {
        return (
          <div style={{ padding: 8, overflowY: "scroll", height: "200px" }}>
            {["Draft", "Published"]?.map((item: any) => (
              <div key={item.id}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setselectedStatus([...selectedStatus, value]);
                      } else {
                        setselectedStatus(
                          selectedStatus.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={item}
                    checked={selectedStatus.includes(item)} // Check if the checkbox should be checked
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "5px",
                    }}
                  />
                  {item}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                type="primary"
                disabled={selectedStatus.length === 0}
                onClick={() => {
                  setfilterAuditee(!isFilterStatus);
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
                  setselectedStatus([]);
                  setfilterStatus(!isFilterStatus);
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
      title: "Auditee",
      dataIndex: "auditees",
      key: "auditees",
      render: (_, record: any) => (
        <MultiUserDisplay data={record?.auditees} name="username" />
      ),
      filterIcon: (filtered: any) =>
        selectedAuditee?.length > 0 ? (
          <AiFillFilter style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <AiOutlineFilter style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }: any) => {
        return (
          <div style={{ padding: 8, overflowY: "scroll", height: "200px" }}>
            {filterList?.auditee?.map((item: any) => (
              <div key={item.id}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setselectedAuditee([...selectedAuditee, value]);
                      } else {
                        setselectedAuditee(
                          selectedAuditee.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={item.id}
                    checked={selectedAuditee.includes(item.id)} // Check if the checkbox should be checked
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
                disabled={selectedAuditee.length === 0}
                onClick={() => {
                  setfilterAuditee(!isFilterAuditee);
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
                  setselectedAuditee([]);
                  setfilterAuditee(!isFilterAuditee);
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
      title: "Auditor",
      dataIndex: "auditors",
      key: "auditors",
      render: (_, record: any) => {
        return <MultiUserDisplay data={record?.auditors} name="username" />;
      },
      filterIcon: (filtered: any) =>
        selectedAuditor?.length > 0 ? (
          <AiFillFilter style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <AiOutlineFilter style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }: any) => {
        return (
          <div style={{ padding: 8, overflowY: "scroll", height: "200px" }}>
            {filterList?.auditor?.map((item: any) => (
              <div key={item.id}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setselectedAuditor([...selectedAuditor, value]);
                      } else {
                        setselectedAuditor(
                          selectedAuditor.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={item.id}
                    checked={selectedAuditor.includes(item.id)} // Check if the checkbox should be checked
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
                disabled={selectedAuditor.length === 0}
                onClick={() => {
                  setfilterAuditor(!isFilterAuditor);
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
                  setselectedAuditor([]);
                  setfilterAuditor(!isFilterAuditor);
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
      title: "Date",
      dataIndex: "date",
    },
    {
      title: "Findings",
      dataIndex: "nc",
    },
  ];

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

  return (
    <>
      <div
        className={!view ? classes.root : ""}
        style={{ padding: "60px 16px" }}
      >
        <FilterDrawer
          resultText={`No Results Found`}
          open={filterOpen}
          setOpen={setFilterOpen}
          handleApply={handleApply}
          handleDiscard={handleDiscard}
        >
          <SearchBar
            placeholder="By Audit Year"
            name="auditYear"
            handleChange={handleSearchChange}
            values={searchValue}
            handleApply={() => console.log("handle apply")}
          />
          <div>
            <Autocomplete
              style={{
                background: "white",
                borderRadius: "6px",
                outline: "none",
              }}
              disabled={false}
              fullWidth
              id="combo-box-demo"
              options={auditTypeListing}
              size="small"
              onChange={(e: any, value: any) => {
                setSearchValue({
                  ...searchValue,
                  auditType: value?.value,
                });
                getAllSubSystemTypes(value?.value);
              }}
              getOptionLabel={(option: any) => option?.name}
              renderInput={(params: any) => (
                <TextField
                  {...params}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <MdSearch style={{ fontSize: 18, paddingLeft: 5 }} />
                      </InputAdornment>
                    ),
                  }}
                  placeholder="Select Audit Type"
                  variant="outlined"
                  size="small"
                />
              )}
            />
          </div>

          <div style={{ height: "10px" }} />
          <Autocomplete
            style={{
              background: "white",
              borderRadius: "6px",
              outline: "none",
            }}
            disabled={false}
            fullWidth
            id="combo-box-demo"
            options={systemListing}
            size="small"
            onChange={(e: any, value: any) => {
              setSearchValue({
                ...searchValue,
                systemName: value?.value,
              });
            }}
            getOptionLabel={(option: any) => option?.name}
            renderInput={(params: any) => (
              <TextField
                {...params}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <MdSearch style={{ fontSize: 18, paddingLeft: 5 }} />
                    </InputAdornment>
                  ),
                }}
                placeholder="Select System"
                variant="outlined"
                size="small"
              />
            )}
          />
          <div style={{ height: "10px" }} />
          <Autocomplete
            style={{
              background: "white",
              borderRadius: "6px",
              outline: "none",
            }}
            disabled={false}
            fullWidth
            id="combo-box-demo"
            options={auditorListing}
            size="small"
            onChange={(e: any, value: any) => {
              setSearchValue({
                ...searchValue,
                auditor: value?.value,
              });
            }}
            getOptionLabel={(option: any) => option?.name}
            renderInput={(params: any) => (
              <TextField
                {...params}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <MdSearch style={{ fontSize: 18, paddingLeft: 5 }} />
                    </InputAdornment>
                  ),
                }}
                placeholder="Select Auditor"
                variant="outlined"
                size="small"
              />
            )}
          />
          <div style={{ height: "10px" }} />

          <Autocomplete
            style={{
              background: "white",
              borderRadius: "6px",
              outline: "none",
            }}
            disabled={false}
            fullWidth
            id="combo-box-demo"
            options={locationListing}
            size="small"
            onChange={(e: any, value: any) => {
              setSearchValue({
                ...searchValue,
                location: value?.value,
              });
            }}
            getOptionLabel={(option: any) => option?.name}
            renderInput={(params: any) => (
              <TextField
                {...params}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <MdSearch style={{ fontSize: 18, paddingLeft: 5 }} />
                    </InputAdornment>
                  ),
                }}
                placeholder="Select location"
                variant="outlined"
                size="small"
              />
            )}
          />

          <div style={{ height: "10px" }} />
        </FilterDrawer>

        {/* <AuditReportWrapper
          parentPageLink="/master/department"
          handleSubmit={handleSubmit}
          dropdownOptions={dropdownOptions}
          handleMenuItemClick={handleMenuItemClick}
          location={location}
          auditYear={auditYear}
        > */}
        <Grid item xs={12}>
          <Box className={classes.searchContainer}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              {/* Left Side */}
              {matches ? (
                <>
                  <Grid container alignItems="center">
                    {/* Location Box */}{" "}
                    <Grid item xs={6} md={4}>
                      <div
                        className={classes.locSearchBox}
                        ref={refelemetForReport2}
                      >
                        <FormControl variant="outlined" size="small" fullWidth>
                          <Autocomplete
                            multiple
                            limitTags={1}
                            id="location-autocomplete"
                            className={classes.inputRootOverride} // Add this class here
                            options={
                              Array.isArray(locationNames)
                                ? [allOption, ...locationNames]
                                : [allOption]
                            }
                            getOptionLabel={(option) =>
                              option.locationName || ""
                            }
                            getOptionSelected={(option, value) =>
                              option.id === value.id
                            }
                            value={selectedLocation}
                            onChange={handleChangeList}
                            renderTags={(value, getTagProps) =>
                              value.map((option, index) => (
                                <div
                                  key={option.id}
                                  className={`${classes.tagContainer} ${
                                    index > 0 ? classes.hiddenTags : ""
                                  }`}
                                >
                                  <div className={classes.tag}>
                                    {option.locationName}
                                  </div>
                                </div>
                              ))
                            }
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                onClick={() => setSelectedLocation([])}
                                variant="outlined"
                                size="small"
                                // label="Corp Func/Unit"
                                placeholder={
                                  selectedLocation.length === 0
                                    ? "Corp Func/Unit"
                                    : ""
                                }
                                fullWidth
                                className={
                                  selectedUnit
                                    ? classes.textField
                                    : classes.textField2
                                }
                              />
                            )}
                          />
                        </FormControl>
                      </div>
                    </Grid>
                    <Grid item xs={6} md={4} style={{ marginLeft: "20px" }}>
                      <div
                        className={classes.locSearchBox}
                        ref={refelemetForReport2}
                      >
                        <FormControl variant="outlined" size="small" fullWidth>
                          <Autocomplete
                            // multiple
                            id="location-autocomplete"
                            className={classes.inputRootOverride} // Add this class here
                            options={auditTypes}
                            getOptionLabel={(option) => option.auditType || ""}
                            getOptionSelected={(option, value) =>
                              option.id === value.id
                            }
                            value={selectedAuditType}
                            onChange={(e, value) => {
                              setSelectedAuditType(value);
                              setSelected(!!value);
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="outlined"
                                size="small"
                                // label="Audit Type"
                                placeholder="Audit Type "
                                fullWidth
                                className={
                                  selected
                                    ? classes.textField
                                    : classes.textField2
                                }
                              />
                            )}
                          />
                        </FormControl>
                      </div>
                    </Grid>
                    {/* Year Component */}
                    <Grid item xs={6} md={3}>
                      <div ref={refelemetForReport3}>
                        <YearComponent
                          currentYear={currentYear}
                          setCurrentYear={setCurrentYear}
                        />
                      </div>
                    </Grid>{" "}
                  </Grid>
                </>
              ) : (
                " "
              )}
              {/* Right Side */}

              <Grid
                container
                alignItems="center"
                justifyContent={matches ? "flex-end" : "center"}
                spacing={1}
                style={{
                  flexDirection: matches ? "row" : "column",
                  gap: matches ? "0px" : "5px",
                }}
              >
                {/* Button Group */}
                <Grid
                  item
                  style={{ display: "flex" }}
                  ref={refelemetForReport4}
                >
                  <Button
                    style={{
                      backgroundColor:
                        selectedOption === "My Dept/Vertical" ? "#003059" : "",
                      color:
                        selectedOption === "My Dept/Vertical"
                          ? "white"
                          : "black",
                      marginRight: "8px",
                    }}
                    onClick={() => handleButtonClick("My Dept/Vertical")}
                  >
                    <FaUserGroup style={{ marginRight: "4px" }} />
                    My Dept/Vertical
                  </Button>

                  <Button
                    style={{
                      backgroundColor:
                        selectedOption === "My Audits" ? "#003059" : "",
                      color: selectedOption === "My Audits" ? "white" : "black",
                    }}
                    onClick={() => handleButtonClick("My Audits")}
                  >
                    <AiOutlineAudit style={{ marginRight: "4px" }} />
                    My Audits
                  </Button>
                </Grid>

                {/* Search Bar */}
                <Grid item>
                  <SearchBar
                    placeholder="Search"
                    name="searchQuery"
                    values={searchQuery}
                    handleChange={handleSearchChangeNew}
                    handleApply={handleTableSearch}
                    endAdornment={true}
                    handleClickDiscard={handleDiscard}
                  />
                </Grid>
              </Grid>

              {/* <div ref={refelemetForReport4}>
                  <Tooltip
                    classes={{
                      tooltip: classes.customTooltip,
                      arrow: classes.customArrow,
                      popper: classes.customPopper,
                    }}
                    title={
                      <Typography
                        //variant="body2"
                        color="textSecondary"
                        component="div"
                        paragraph
                        style={{
                          backgroundColor: "white",
                          border: "1px solid black", // Add border style
                          color: "black",
                          margin: "0", // Remove margin
                          padding: "8px",
                        }}
                      >
                        My Audits
                        <br />
                        <FiberManualRecordIcon
                          style={{ color: "#e6ffe6", fontSize: "small" }}
                        />{" "}
                        Auditee
                        <FiberManualRecordIcon
                          style={{ color: "skyblue", fontSize: "small" }}
                        />{" "}
                        Auditor
                      </Typography>
                    }
                    style={{
                      backgroundColor: "white",
                      background: "none",

                      color: "black",
                      boxShadow: "white",
                    }}
                  >
                    <IconButton
                      onClick={() => {
                        setOpenAudit(!openAudit);
                      }}
                    >
                      {openAudit ? (
                        <PermContactCalendar
                          style={{
                            color: "rgb(53, 118, 186)",
                            height: "31px",
                            width: "30px",
                          }}
                        />
                      ) : (
                        <PermContactCalendarOutlinedIcon
                          style={{
                            color: "#444",
                            height: "31px",
                            width: "30px",
                          }}
                        />
                      )}
                    </IconButton>
                  </Tooltip>
                </div> */}
            </Box>
          </Box>
        </Grid>

        {matches ? (
          ""
        ) : (
          <>
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
            <Fab
              className={classes.fab}
              aria-label="add"
              onClick={() => {
                setReportOpen(true);
              }}
            >
              <FaPlus size={20} />
            </Fab>
          </>
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
            <div className={classes.locSearchBox} ref={refelemetForReport2}>
              <FormControl variant="outlined" size="small" fullWidth>
                <Autocomplete
                  multiple
                  limitTags={1}
                  id="location-autocomplete"
                  className={classes.inputRootOverride} // Add this class here
                  options={
                    Array.isArray(locationNames)
                      ? [allOption, ...locationNames]
                      : [allOption]
                  }
                  getOptionLabel={(option) => option.locationName || ""}
                  getOptionSelected={(option, value) => option.id === value.id}
                  value={selectedLocation}
                  onChange={handleChangeList}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <div
                        key={option.id}
                        className={`${classes.tagContainer} ${
                          index > 0 ? classes.hiddenTags : ""
                        }`}
                      >
                        <div className={classes.tag}>{option.locationName}</div>
                      </div>
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      onClick={() => setSelectedLocation([])}
                      size="small"
                      // label="Corp Func/Unit"
                      placeholder={
                        selectedLocation.length === 0 ? "Corp Func/Unit" : ""
                      }
                      fullWidth
                      className={
                        selectedUnit ? classes.textField : classes.textField2
                      }
                    />
                  )}
                />
              </FormControl>
            </div>
            <div className={classes.locSearchBox} ref={refelemetForReport2}>
              <FormControl variant="outlined" size="small" fullWidth>
                <Autocomplete
                  // multiple
                  id="location-autocomplete"
                  className={classes.inputRootOverride} // Add this class here
                  options={auditTypes}
                  getOptionLabel={(option) => option.auditType || ""}
                  getOptionSelected={(option, value) => option.id === value.id}
                  value={selectedAuditType}
                  onChange={(e, value) => {
                    setSelectedAuditType(value);
                    setSelected(!!value);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      size="small"
                      // label="Audit Type"
                      placeholder="Audit Type New"
                      fullWidth
                      className={
                        selected ? classes.textField : classes.textField2
                      }
                    />
                  )}
                />
              </FormControl>
            </div>
            <div ref={refelemetForReport3}>
              <YearComponent
                currentYear={currentYear}
                setCurrentYear={setCurrentYear}
              />
            </div>
          </div>
        </Modal>

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
        ) : view ? (
          <>
            <div
              className={classes.auditReportCalendarWrapper}
              // style={{ width: "100%", height: "280px", overflow: "auto" }}
            >
              <AuditReportCalendar
                events={calendarData}
                toggleCalendarModal={toggleCalendarModal}
                calendarFor="AuditReport"
              />
              <AuditScheduleCalendarModal
                calendarData={calendarData}
                calendarModalInfo={calendarModalInfo}
                toggleCalendarModal={toggleCalendarModal}
              />
            </div>
          </>
        ) : (
          <>
            {matches ? (
              <Table
                dataSource={tableData}
                pagination={{ position: [] }}
                columns={columns}
                className={classes.tableContainer}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-evenly",
                  width: "100%",
                  // height: "100vh",
                  overflowY: "scroll",
                  marginBottom: "40px",
                }}
              >
                {tableData?.map(
                  (record: any) => (
                    console.log("data table", record),
                    (
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
                          //  onClick={() => {
                          //   handleClickPdfOpen(record);
                          // }}
                          style={{
                            padding: "3px 10px",
                            backgroundColor: "#9FBFDF",
                            borderRadius: "2px",
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          {record?.auditName}
                          {record?.nc}
                        </p>

                        <p>Audit Number : {record?.auditNumber}</p>
                        <p>Audited Dept/Vertical : {record?.auditedEntity}</p>
                        <p>
                          Auditor:{" "}
                          {record?.auditors
                            .map((data: any) => data?.username)
                            .filter((username: any) => username) // To handle any undefined or null usernames
                            .join(", ")}
                        </p>
                        <p>Date :{record.date}</p>
                      </div>
                    )
                  )
                )}
              </div>
            )}

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
                  changePage(page, pageSize);
                }}
              />
            </div>
            {/* <CustomTableWithSort
              headers={headers}
              fields={fields}
              data={tableData}
              sortFunction={sortTable}
              isAuditReport={true}
              handleClickPdfOpen={handleClickPdfOpen}
              isAuditChecklistReport={true}
              handleAuditChecklistOpen={handleAuditChecklistOpen}
            />
            <SimplePaginationController
              count={count}
              page={page}
              rowsPerPage={rowsPerPage}
              handleChangePage={changePage}
            /> */}
            <div
              ref={graphRef}
              id="graphRef"
              style={{ display: graphVisible ? "block" : "none" }}
            >
              {radarData && <RadarChartComponent auditList={radarData} />}
            </div>
          </>
        )}
        {/* </AuditReportWrapper> */}
        {progressModel && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
              }}
            >
              <Progress type="circle" percent={progress} size={80} />
              {progress === 100 || progress === 110 ? (
                <span style={{ display: "block", marginTop: "10px" }}>
                  <strong>Done</strong>
                </span>
              ) : (
                <span
                  style={{
                    display: "block",
                    marginTop: "10px",
                    width: "200px",
                    textAlign: "center",
                  }}
                >
                  <strong>
                    Generating Report Please Wait
                    {Array(numDots).fill(".").join("")}
                  </strong>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
      <Dialog
        open={reportOpen}
        onClose={handleReportClose}
        aria-labelledby="responsive-dialog-title"
        maxWidth={false}
        PaperProps={{
          style: {
            width: "300px",
            height: "150px",
            maxWidth: "none",
            margin: "auto",
            padding: "16px",
            borderRadius: "16px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          },
        }}
      >
        <DialogContent style={{ padding: 0, flex: 1 }}>
          <DialogContentText>
            You are about to create Ad-hoc report without Schedule. Do you want
            to continue?
          </DialogContentText>
        </DialogContent>

        <DialogActions style={{ padding: "8px" }}>
          <Button autoFocus onClick={handleReportClose} color="primary">
            No
          </Button>
          <Button onClick={handleReportYes} color="primary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AuditReport;
