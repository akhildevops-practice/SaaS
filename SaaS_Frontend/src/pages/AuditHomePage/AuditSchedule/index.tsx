import { useState, useEffect, useRef } from "react";
import {
  Grid,
  Tooltip,
  Typography,
  Box,
  TextField,
  IconButton,
  FormControl,
  Paper,
} from "@material-ui/core";
import { MdAssessment } from 'react-icons/md';
import ConfirmDialog from "components/ConfirmDialog";
import { MdAdd } from 'react-icons/md';
import { useSnackbar } from "notistack";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "apis/axios.global";
import checkRoles from "utils/checkRoles";
import { roles } from "utils/enums";
import SearchBar from "components/SearchBar";
import AuditScheduleCalendar from "components/ReusableCalendar/AuditScheduleCalendar";
import {
  Autocomplete,
} from "@material-ui/lab";
import { useRecoilState, useRecoilValue } from "recoil";
import FullCalendar from "@fullcalendar/react";
import { getSystemTypes } from "apis/systemApi";
import { useMediaQuery } from "@material-ui/core";

import {
  currentLocation,
  currentAuditYear,
  mobileView,
  auditScheduleFormType,
  currentAuditPlanYear,
} from "recoil/atom";
import getAppUrl from "utils/getAppUrl";
import { getAllAuditors, getAuditForPdf } from "apis/auditApi";
import { getAllLocation } from "apis/locationApi";
import YearComponent from "components/Yearcomponent";
import getYearFormat from "utils/getYearFormat";
import getYearinYYYYformat from "utils/getYearinYYYYformat";
import useStyles from "./styles";
import type { ColumnsType } from "antd/es/table";
import getSessionStorage from "utils/getSessionStorage";
import { ReactComponent as CustomDeleteICon } from "assets/documentControl/Delete.svg";
import { ReactComponent as CustomEditICon } from "assets/documentControl/Edit.svg";
import { Button, Pagination, PaginationProps, Table, Tag } from "antd";
import { MdOutlinePermContactCalendar } from 'react-icons/md';
import { MdFiberManualRecord } from 'react-icons/md';
import formatDateTime from "utils/formatDateTime";
import printJS from "print-js";
import { MdOutlinePictureAsPdf } from 'react-icons/md';
import MultiUserDisplay from "components/MultiUserDisplay";
import { Progress } from "antd";
import { MdOutlineAddBox } from 'react-icons/md';
import { MdPermContactCalendar } from "react-icons/md";
type Props = {
  view?: any; //compulsory to show / hide calendar
  setView?: any;
  refelemetForSchedule2?: any;
  refelemetForSchedule3?: any;
  refelemetForSchedule4?: any;
  refelemetForSchedule5?: any;
  refelemetForSchedule6?: any;
  refelemetForSchedule7?: any;
  refelemetForSchedule8?: any;
  refelemetForSchedule9?: any;
  refelemetForSchedule10?: any;
  mode?: boolean;
  selectCalenderview?: any;
  selectListview?: any;
};
const showTotal: PaginationProps["showTotal"] = (total: any) =>
  `Total ${total} items`;
function AuditSchedule({
  view = false,
  setView,
  refelemetForSchedule2,
  refelemetForSchedule3,
  refelemetForSchedule4,
  refelemetForSchedule5,
  refelemetForSchedule6,
  refelemetForSchedule7,
  refelemetForSchedule8,
  refelemetForSchedule9,
  refelemetForSchedule10,
  mode,
  selectCalenderview,
  selectListview,
}: Props) {
  const userDetails = getSessionStorage();
  const isOrgAdmin = checkRoles(roles.ORGADMIN);

  const [allAuditScheduleDetails, setAllAuditScheduleDetails] = useState<any[]>(
    []
  );
  const [auditPlanYear, setAuditPlanYear] =
    useRecoilState<any>(currentAuditPlanYear);
  const [data, setData] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [scheduleFormType, setScheduleFormType] = useRecoilState(
    auditScheduleFormType
  );
  // const [view, setView] = useState(false);
  const calendar = useRef<InstanceType<typeof FullCalendar>>(null);
  const [locationNames, setLocationNames] = useState<Location[]>([]);
  const [auditTypes, setAuditTypes] = useState<any>([]);
  const [currentYear, setCurrentYear] = useState<any>();
  const [deleteSchedule, setDeleteSchedule] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);
  const mobileViewState = useRecoilValue(mobileView);
  const [filterOpen, setFilterOpen] = useState(false);
  const [calendarData, setCalendarData] = useState<any>([]);
  const [auditYear, setAuditYear] = useRecoilState<any>(currentAuditYear);
  const [openAudit, setOpenAudit] = useState(false);
  const [auditTypeListing, setAuditTypeListing] = useState([]);
  const [systemListing, setSystemListing] = useState([]);
  const [auditorListing, setAuditorListing] = useState([]);
  const [locationListing, setLocationListing] = useState([]);
  const [auditPlanIdFromPlan, setAuditPlanIdFromPlan] = useState<any>("");
  // const [selectAuditType, setSelectAuditType] = useState<any>();
  const [auditTypeOptions, setAuditTypeOptions] = useState([]);
  const [loaderForSchdeuleDrawer, setLoaderForSchdeuleDrawer] = useState(false);
  // const [selectLocation, setSelectLocation] = useState<any>();
  const [monthSelected, setMonthSelect] = useState<any>();
  const [auditScheduleIdFromLocation, setAuditScheduleIdFromLocation] =
    useState<any>("");
  const [formModeForCalendarDrawer, setFormModeForCalendarDrawer] =
    useState<any>(null);
  const [page, setPage] = useState<any>(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [count, setCount] = useState<number>(0);
  const matches = useMediaQuery("(min-width:786px)");
  const [progress, setProgress] = useState(10);
  const [progressModel, setProgressModel] = useState(false);
  const [numDots, setNumDots] = useState(2);
  // const [selectSystem, setSelectSystem] = useState<any>([]);
  const [systemOptions, setSystemOptions] = useState<any>([]);
  const [secSystemOptions, setSecSystemOptions] = useState<any>([]);
  const [secSystemSelected, setSecSystemSelected] = useState<any>([]);
  const [optionsMonth, setOptionsMonth] = useState<any>([]);
  const [boardDatas, setBoardData] = useState<any>([
    { label: "Schedule", data: [] },
    {
      label: "Completed",
      color: "#FF8000",
      data: [],
    },
    { label: "OverDue", data: [], color: "#808080" },
  ]);
  const [pageLoading, setPageLoading] = useState(true);
  const [calendarDataLoading, setCalendarDataLoading] = useState(false);
  const [logo, setLogo] = useState<any>(null);
  const getLogo = async () => {
    const response = await axios.get(`/api/location/getLogo`);
    setLogo(response.data);
  };

  const tableHtmlFormat = `<table>
    <tr>
      <th>%NUMBER%</th>
      <th colspan="5">%TITLE%</th>
    </tr>
    <tr>
      <th width="4%">Sr.No</th>
      <th width="48%">Findings Details</th>
      <th width="24%">Clause Number</th>
      <th width="24%">Reference</th>
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
        HINDALCO INDUSTRIES LIMITED<br /> 
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

  const [calendarModalInfo, setCalendarModalInfo] = useState<any>({
    open: false,
    data: {},
    mode: "create",
    calendarFor: "AuditSchedule",
  });
  const realmName = getAppUrl();
  const [searchQuery, setsearchQuery] = useState<any>({
    searchQuery: "",
  });
  const [selectedLocation, setSelectedLocation] = useState<any>({
    id: userDetails?.location.id,
    locationName: userDetails?.location.locationName,
  });
  const [selectedAuditType, setSelectedAuditType] = useState<any>({
    id: "All",
    auditType: "All",
  });
  const [searchValue, setSearchValue] = useState<any>({
    auditYear: auditYear ?? "",
    location: "",
    auditType: "",
    systemName: "",
    auditor: "",
  });

  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const location = useLocation();
  const isMR = checkRoles(roles.MR);
  const isAuditor = checkRoles(roles.AUDITOR);
  const isLocationAdmin = checkRoles(roles.LOCATIONADMIN);
  const classes = useStyles();

  //console.log("selectedLocation", selectedLocation);

  const nameConstruct = (data: any) => {
    if (data?.hasOwnProperty("documentNumbering")) {
      return data?.documentNumbering;
    } else if (data?.hasOwnProperty("type")) {
      return data?.name;
    } else if (data?.jobTitle) {
      return data?.jobTitle;
    }
  };
  // useEffect(() => {
  //     setSelectedLocation([
  //       {
  //         id: userDetails?.location?.id,
  //         locationName: userDetails?.location?.locationName,
  //       },
  //     ]);
  // }, [locationNames]);

  useEffect(() => {
    getLogo();
    setPageLoading(true);
    getyear();
    if (!!currentYear && !!selectedAuditType) {
      // console.log("checkauditnew if condition called");

      getCalendarData(searchValue);
    }
    // setOpenAudit(true);
    // getCalendarData(searchValue);
    getAuditors(realmName);
    getAllLocations();
    getLocationNames();
    getAuditTypes();
    getAllSystemTypes(realmName);
    fetchAuditType();
    // fetchSystem();
  }, []);

  useEffect(() => {
    fetchSystem();
  }, [selectedLocation]);
  useEffect(() => {
    fetchSystems();
  }, [selectedLocation]);
  useEffect(() => {
    // console.log("checkaudit location in audit schedule-->", location);
    if (
      !!location.state &&
      !!location.state?.auditPlanId &&
      !!location.state?.openCalendar &&
      !!location.state?.formMode
    ) {
      setAuditPlanIdFromPlan(location.state?.auditPlanId);
      setAuditScheduleIdFromLocation(null);
      setFormModeForCalendarDrawer(location.state?.formMode);
      setView(true);
      setLoaderForSchdeuleDrawer(true);
    }

    if (
      !!location.state &&
      !!location.state?.openCalendar &&
      !!location.state?.auditScheduleId &&
      !!location.state?.formMode
    ) {
      setAuditScheduleIdFromLocation(location.state?.auditScheduleId);

      setFormModeForCalendarDrawer(location.state?.formMode);
      setView(true);
      setLoaderForSchdeuleDrawer(true);
    }
    if (
      !!location.state &&
      !!location.state?.openCalendar &&
      !!location.state?.formMode
    ) {
      setFormModeForCalendarDrawer(location.state?.formMode);
      setView(true);
      setLoaderForSchdeuleDrawer(true);
    }
  }, [location.state]);

  // useEffect(() => {
  //   console.log("checkauditnew pageloading-->", pageLoading);
  // }, [pageLoading]);

  useEffect(() => {
    // getAllAuditScheduleDetails(currentYear);
    if (allAuditScheduleDetails) {
      const val = allAuditScheduleDetails?.map((obj) => {
        const systemNames = obj?.systemMaster?.map(
          (system: any) => system.name
        );
        return {
          id: obj.id,
          systemName: <MultiUserDisplay data={obj?.systemMaster} name="name" />,
          systemMaster: obj?.systemMaster,
          roleName: obj.roleName,
          entityTypeName: obj.entityTypeName,
          auditYear: obj.auditYear,
          auditScheduleName: obj.auditScheduleName,
          auditTypeName: obj.auditTypeName,
          auditPeriod: obj.auditPeriod,
          auditStatus: obj?.auditStatus,
          isDraft: obj?.isDraft,
          location: obj?.location,
        };
      });
      setData(val);
    }
  }, [allAuditScheduleDetails]);

  useEffect(() => {
    // getAllAuditScheduleDetails(currentYear);

    // if (
    //   (selectedAuditType !== undefined &&
    //     selectedLocation !== undefined &&
    //     secSystemSelected !== undefined) ||
    //   secSystemSelected.length > 0
    // ){
    if (!pageLoading) {
      setAuditPlanYear(currentYear);

      getCalendarData(searchValue);
      if (openAudit) {
        // getCalendarData(searchValue);
        getMyAuditScheduleDetails();
        // getCalendarData(searchValue);
      } else {
        handleClickDiscard();
      }
    }
    // }
  }, [
    currentYear,
    selectedLocation,
    openAudit,
    selectedAuditType,
    auditTypes,
    secSystemSelected,
  ]);

  useEffect(() => {
    // if (
    //   secSystemOptions !== undefined &&
    //   selectedLocation?.id !== undefined &&
    //   selectedAuditType?.id
    // ) {
    fetchMonthNames();
    // }
  }, [secSystemSelected, selectedLocation, selectedAuditType, openAudit]);

  const handleLinkClick = (record: any) => {
    setScheduleFormType("adhoc-edit");
    navigate(`/audit/auditschedule/auditscheduleform/schedule/${record.id}`);
  };

  const fetchAuditType = async () => {
    const res: any = await axios.get(`/api/auditPlan/getAllAuditType`);
    const data = res?.data?.map((value: any) => {
      return { id: value?._id, value: value?.auditType };
    });
    setAuditTypeOptions(data);
  };

  const fetchMonthNames = async () => {
    const systemParsed: any = secSystemSelected
      .map((value: any) => {
        return `system[]=${value.id}`;
      })
      .join("&");
    const res: any = await axios.get(
      `/api/auditSchedule/getMonthdata?${systemParsed}&location=${selectedLocation?.id}&auditType=${selectedAuditType?.id}&year=${currentYear}&myAudit=${openAudit}`
    );

    if (res?.data.includes("All")) {
      setSelectedMonth("All");
      setMonthSelect("All");
    } else if (res?.data?.length === 0) {
      setSelectedMonth("");
      setMonthSelect("");
    }
    setOptionsMonth([...new Set(res.data)]);
  };
  const fetchSystem = async () => {
    const res = await axios.get(
      `/api/auditPlan/getAllSystemsData/${selectedLocation?.id}`
    );
    setSystemOptions(res?.data);
  };

  const fetchSystems = async () => {
    const res = await axios.get(
      `/api/auditPlan/getAllSystemsData/${selectedLocation?.id}`
    );
    setSecSystemOptions(res?.data);
  };
  const columns: ColumnsType<any> = [
    {
      title: "Audit Schedule Title",
      dataIndex: "auditScheduleName",
      render: (_, record, index) => {
        return (
          // <div
          //   style={{
          //     textDecorationLine: "underline",
          //     cursor: "pointer",
          //   }}
          // >
          //   <div onClick={() => handleLinkClick(record)}>
          //     {record.auditScheduleName}
          //   </div>
          // </div>
          <div>
            <div
              style={{ position: "relative", display: "inline-block" }}
              onClick={() => handleLinkClick(record)}
              ref={refelemetForSchedule7}
            >
              <span
                style={{
                  textDecorationLine: "underline",
                  cursor: "pointer",
                }}
              >
                {record.auditScheduleName}
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
      // render: (_, record) => {
      //   const auditTypeName = record.auditTypeName;
      //   console.log("record", record);
      //   return (
      //     <div
      //       style={{
      //         textDecorationLine: "underline",
      //         cursor: "pointer",
      //       }}
      //     >
      //       <div onClick={() => handleLinkClick(record)}>{auditTypeName}</div>
      //     </div>
      //   );
      // },
      onFilter: (value: any, record: any) => {
        console.log("value:", value); // Log the entire record
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
        allAuditScheduleDetails?.forEach((item: any) => {
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
                  // setFilteredValues(selectedKeys);
                  console.log("Selected Values:", selectedKeys);
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
      title: "System",
      dataIndex: "systemName",
      onFilter: (value: any, record: any) => {
        return record.systemMaster.some((system: any) => system.name === value);
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
        allAuditScheduleDetails?.forEach((item: any) => {
          item.systemMaster.forEach((system: any) => {
            uniqueNames.add(system.name);
          });
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
                  // setFilteredValues(selectedKeys);
                  console.log("Selected Values:", selectedKeys);
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
    //   dataIndex: "roleName",
    // },
    {
      title: "Audit Scope",
      dataIndex: "entityTypeName",
    },

    {
      title: "Audit Period",
      dataIndex: "auditPeriod",
    },
    // {
    //   title: "Audit Report Status",
    //   dataIndex: "auditStatus",
    // },
  ];

  const myAuditColumns: ColumnsType<any> = [
    {
      title: "Audit Schedule Title",
      dataIndex: "auditScheduleName",
      render: (_, record, index) => {
        return (
          // <div
          //   style={{
          //     textDecorationLine: "underline",
          //     cursor: "pointer",
          //   }}
          // >
          //   <div onClick={() => handleLinkClick(record)}>
          //     {record.auditScheduleName}
          //   </div>
          // </div>
          <div>
            <div
              style={{ position: "relative", display: "inline-block" }}
              onClick={() => {
                const data = {
                  id: record?.auditScheduleDetails?._id,
                };
                handleLinkClick(data);
              }}
            >
              <span
                style={{
                  textDecorationLine: "underline",
                  cursor: "pointer",
                }}
              >
                {record.auditScheduleDetails?.auditScheduleName}
              </span>
              {record.auditScheduleDetails?.isDraft &&
                record.auditScheduleDetails?.isDraft && ( // Only show Draft label for the first row
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
      dataIndex: "auditType",
      // render: (_, record) => {
      //   const auditTypeName = record.auditTypeName;
      //   console.log("record", record);
      //   return (
      //     <div
      //       style={{
      //         textDecorationLine: "underline",
      //         cursor: "pointer",
      //       }}
      //     >
      //       <div onClick={() => handleLinkClick(record)}>{auditTypeName}</div>
      //     </div>
      //   );
      // },
      onFilter: (value: any, record: any) => {
        console.log("value:", record); // Log the entire record
        return record.auditType === value;
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
        calendarData?.forEach((item: any) => {
          const name = item.auditType;
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
                  // setFilteredValues(selectedKeys);
                  console.log("Selected Values:", selectedKeys);
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
    //   title: "System",
    //   dataIndex: "systemMaster",
    //   onFilter: (value: any, record: any) => {
    //     return record.systemMaster?.some(
    //       (system: any) => system.name === value
    //     );
    //   },
    //   filterDropdown: ({
    //     setSelectedKeys,
    //     selectedKeys,
    //     confirm,
    //     clearFilters,
    //   }: any) => {
    //     // Create a set to store unique names
    //     const uniqueNames = new Set();

    //     // Iterate through allAuditPlanDetails and add unique names to the set
    //     calendarData?.forEach((item: any) => {
    //       item.systemMaster?.forEach((system: any) => {
    //         uniqueNames.add(system.name);
    //       });
    //     });

    //     // Convert the set back to an array for rendering
    //     const uniqueNamesArray = Array.from(uniqueNames);

    //     return (
    //       <div style={{ padding: 8 }}>
    //         {uniqueNamesArray.map((name: any) => (
    //           <div key={name}>
    //             <label>
    //               <input
    //                 type="checkbox"
    //                 onChange={(e) => {
    //                   const value = e.target.value;
    //                   if (e.target.checked) {
    //                     setSelectedKeys([...selectedKeys, value]);
    //                   } else {
    //                     setSelectedKeys(
    //                       selectedKeys.filter((key: any) => key !== value)
    //                     );
    //                   }
    //                 }}
    //                 value={name}
    //                 checked={selectedKeys.includes(name)} // Check if the checkbox should be checked
    //               />
    //               {name}
    //             </label>
    //           </div>
    //         ))}
    //         <div style={{ marginTop: 8 }}>
    //           <Button
    //             type="primary"
    //             onClick={() => {
    //               confirm();
    //               // setFilteredValues(selectedKeys);
    //               console.log("Selected Values:", selectedKeys);
    //             }}
    //             style={{ marginRight: 8 }}
    //           >
    //             Filter
    //           </Button>
    //           {/* <Button onClick={() => {}}>Reset</Button>{" "} */}
    //           {/* Add a reset button */}
    //         </div>
    //       </div>
    //     );
    //   },
    // },
    {
      title: "Corp Func/Unit",
      render: (_, record) => {
        return record?.locationName;
      },
    },
    {
      title: "Dept",
      render: (_, record) => {
        return record?.entityName;
      },
    },
    {
      title: "Auditees",
      dataIndex: "myauditees",
      render: (_: any, record: any) => (
        <div
          style={{
            width: 100,
          }}
        >
          <div
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {record?.myauditees?.map((owner: any, index: number) => {
              console.log("record:", record); // Add this line to log username
              return <div key={index}>{owner?.username}</div>;
            })}
          </div>
        </div>
      ),
    },
    {
      title: "Auditors",
      dataIndex: "myauditors",
      render: (_: any, record: any) => (
        <div
          style={{
            width: 100,
          }}
        >
          <div
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {record?.myauditors?.map((owner: any, index: number) => {
              console.log("record:", record); // Add this line to log username
              return <div key={index}>{owner?.username}</div>;
            })}
          </div>
        </div>
      ),
    },
    {
      title: "Scheduled By",
      // dataIndex: "createdBy",
      render: (_, record) => {
        const scheduledBy = record?.auditScheduleDetails?.createdBy;

        return scheduledBy;
      },
    },
    {
      title: "Schedule Status",
      dataIndex: "auditPeriod",
      render: (_, record) => {
        const status = record?.auditScheduleDetails?.isDraft
          ? "DRAFT"
          : "PUBLISHED";
        return status;
      },
    },

    {
      title: "Audit Period",
      // dataIndex: "auditPeriod",
      render: (_, record) => {
        return record?.auditScheduleDetails?.auditPeriod;
      },
    },
    // {
    //   title: "Audit Report Status",
    //   dataIndex: "auditStatus",
    // },
  ];

  columns.push({
    title: "Action",
    key: "action",
    width: 200,
    render: (_: any, record: any, index) => {
      // console.log("checkaudit10 check condtiion ", !isOrgAdmin && !!record?.isDraft && record?.location === userDetails?.location?.id);
      // console.log("checkaudit10 check isDraft", record?.isDraft);
      // console.log("checkaudit10 check location", record?.location);

      if (index === 0) {
        return (
          <>
            {isOrgAdmin && (
              <IconButton
                onClick={() => {
                  handleEditSchedule(record);
                }}
                style={{ padding: "10px" }}
              >
                <div ref={refelemetForSchedule9}>
                  <CustomEditICon width={20} height={20} />
                </div>
              </IconButton>
            )}
            {!isOrgAdmin &&
              !!record?.isDraft &&
              record?.location === userDetails?.location?.id && (
                <IconButton
                  onClick={() => {
                    handleLinkClick(record);
                  }}
                  style={{ padding: "10px" }}
                >
                  <div ref={refelemetForSchedule9}>
                    <CustomEditICon width={20} height={20} />
                  </div>
                </IconButton>
              )}
            {isOrgAdmin && (
              <IconButton
                onClick={() => {
                  handleOpen(record);
                }}
                style={{ padding: "10px" }}
              >
                <div ref={refelemetForSchedule10}>
                  <CustomDeleteICon width={20} height={20} />
                </div>
              </IconButton>
            )}

            <IconButton
              onClick={() => {
                handleGetAllAuditReports(record);
              }}
              style={{ padding: "10px" }}
            >
              <div ref={refelemetForSchedule8}>
                <MdOutlinePictureAsPdf
                  width={20}
                  height={20}
                  style={{ color: "rgba(0, 0, 0, 0.6)" }}
                />
              </div>
            </IconButton>
          </>
        );
      }
      return (
        <>
          {isOrgAdmin && (
            <IconButton
              onClick={() => {
                handleEditSchedule(record);
              }}
              style={{ padding: "10px" }}
            >
              <div>
                <CustomEditICon width={20} height={20} />
              </div>
            </IconButton>
          )}
          {!isOrgAdmin &&
            !!record?.isDraft &&
            record?.location === userDetails?.location?.id && (
              <IconButton
                onClick={() => {
                  handleLinkClick(record);
                }}
                style={{ padding: "10px" }}
              >
                <div ref={refelemetForSchedule9}>
                  <CustomEditICon width={20} height={20} />
                </div>
              </IconButton>
            )}
          {isOrgAdmin && (
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
          )}

          <IconButton
            onClick={() => {
              handleGetAllAuditReports(record);
            }}
            style={{ padding: "10px" }}
          >
            <div>
              <MdOutlinePictureAsPdf
                width={20}
                height={20}
                style={{ color: "rgba(0, 0, 0, 0.6)" }}
              />
            </div>
          </IconButton>
        </>
      );
    },
  });
  myAuditColumns.push({
    title: "Action",
    key: "action",
    width: 200,
    render: (_: any, record: any, index) => {
      // console.log("checkaudit10 check condtiion ", !isOrgAdmin && !!record?.isDraft && record?.location === userDetails?.location?.id);
      // console.log("checkaudit10 check isDraft", record?.isDraft);
      // console.log("checkaudit10 check location", record?.location);

      if (index === 0) {
        return (
          <>
            {isOrgAdmin && (
              <IconButton
                onClick={() => {
                  const data = {
                    id: record?.auditScheduleDetails?._id,
                  };
                  handleEditSchedule(data);
                }}
                style={{ padding: "10px" }}
              >
                <div ref={refelemetForSchedule9}>
                  <CustomEditICon width={20} height={20} />
                </div>
              </IconButton>
            )}
            {!isOrgAdmin &&
              !!record?.auditScheduleDetails?.isDraft &&
              record?.auditScheduleDetails?.location ===
                userDetails?.location?.id && (
                <IconButton
                  onClick={() => {
                    const data = {
                      id: record?.auditScheduleDetails?._id,
                    };
                    handleLinkClick(data);
                  }}
                  style={{ padding: "10px" }}
                >
                  <div ref={refelemetForSchedule9}>
                    <CustomEditICon width={20} height={20} />
                  </div>
                </IconButton>
              )}
            {isOrgAdmin && (
              <IconButton
                onClick={() => {
                  const data = {
                    id: record?.auditScheduleDetails?._id,
                  };
                  handleOpen(data);
                }}
                style={{ padding: "10px" }}
              >
                <div ref={refelemetForSchedule10}>
                  <CustomDeleteICon width={20} height={20} />
                </div>
              </IconButton>
            )}

            <IconButton
              onClick={() => {
                const data = {
                  id: record?.auditScheduleDetails?._id,
                };
                handleGetAllAuditReports(data);
              }}
              style={{ padding: "10px" }}
            >
              <div ref={refelemetForSchedule8}>
                <MdOutlinePictureAsPdf
                  width={20}
                  height={20}
                  style={{ color: "rgba(0, 0, 0, 0.6)" }}
                />
              </div>
            </IconButton>

            {/* for auditor to create report from table */}

            {record.auditor?.includes(userDetails.id) &&
              !record?.auditScheduleDetails?.isDraft && (
                <IconButton
                  onClick={() => {
                    console.log("dateExcceds", record?.dateExcceds);
                    if (record?.dateExcceds) {
                      enqueueSnackbar(
                        `Cannot create Audit Report as Audit  Schedule date has passed beyond 30 days
                      `,
                        {
                          variant: "error",
                        }
                      );
                    } else {
                      const data = {
                        id: record?.auditScheduleDetails?._id,
                      };
                      navigate("/audit/auditreport/newaudit", {
                        state: {
                          auditScheduleId: record.auditScheduleId,
                          entityName: record?.entityName,
                          disableFields: true,
                          auditScheduleName:
                            record?.auditScheduleDetails?.auditScheduleName,
                        },
                      });
                    }
                  }}
                  style={{ padding: "10px" }}
                >
                  <div>
                    <Tooltip title="Create Audit Report">
                      <MdAdd
                        width={20}
                        height={20}
                        style={{ color: "rgba(0, 0, 0, 0.6)" }}
                      />
                    </Tooltip>
                  </div>
                </IconButton>
              )}
          </>
        );
      }
      return (
        <>
          {isOrgAdmin && (
            <IconButton
              onClick={() => {
                const data = {
                  id: record?.auditScheduleDetails?._id,
                };
                handleEditSchedule(data);
              }}
              style={{ padding: "10px" }}
            >
              <div>
                <CustomEditICon width={20} height={20} />
              </div>
            </IconButton>
          )}
          {!isOrgAdmin &&
            !!record?.auditScheduleDetails?.isDraft &&
            record?.auditScheduleDetails?.location ===
              userDetails?.location?.id && (
              <IconButton
                onClick={() => {
                  const data = {
                    id: record?.auditScheduleDetails?._id,
                  };
                  handleLinkClick(data);
                }}
                style={{ padding: "10px" }}
              >
                <div ref={refelemetForSchedule9}>
                  <CustomEditICon width={20} height={20} />
                </div>
              </IconButton>
            )}
          {isOrgAdmin && (
            <IconButton
              onClick={() => {
                const data = {
                  id: record?.auditScheduleDetails?._id,
                };
                handleOpen(data);
              }}
              style={{ padding: "10px" }}
            >
              <div>
                <CustomDeleteICon width={20} height={20} />
              </div>
            </IconButton>
          )}

          <IconButton
            onClick={() => {
              const data = {
                id: record?.auditScheduleDetails?._id,
              };
              handleGetAllAuditReports(data);
            }}
            style={{ padding: "10px" }}
          >
            <div>
              <MdOutlinePictureAsPdf
                width={20}
                height={20}
                style={{ color: "rgba(0, 0, 0, 0.6)" }}
              />
            </div>
          </IconButton>

          {/* for auditor to create report from table */}

          {record.auditor?.includes(userDetails.id) &&
            !record?.auditScheduleDetails?.isDraft && (
              <IconButton
                onClick={() => {
                  if (record?.dateExcceds) {
                    enqueueSnackbar(
                      `Cannot create Audit Report as Audit  Schedule date has passed beyond 30 days`,
                      {
                        variant: "error",
                      }
                    );
                  } else {
                    const data = {
                      id: record?.auditScheduleDetails?._id,
                    };
                    navigate("/audit/auditreport/newaudit", {
                      state: {
                        auditScheduleId: record.auditScheduleId,
                        entityName: record?.entityName,
                        disableFields: true,
                        auditScheduleName:
                          record?.auditScheduleDetails?.auditScheduleName,
                      },
                    });
                  }
                }}
                style={{ padding: "10px" }}
              >
                <div>
                  <Tooltip title="Create Audit Report">
                    <MdAdd
                      width={20}
                      height={20}
                      style={{ color: "rgba(0, 0, 0, 0.6)" }}
                    />
                  </Tooltip>
                </div>
              </IconButton>
            )}
        </>
      );
    },
  });
  const getyear = async () => {
    setPageLoading(true);
    const currentyear = await getYearFormat(new Date().getFullYear());
    setCurrentYear(currentyear);
    setPageLoading(false);
    return currentyear;
  };
  // console.log("currentyear in auditschedule", currentYear);

  const allOption = { id: "All", locationName: "All" };

  // const handleChangeList = (event: any, values: any) => {
  //   if (values.length !== 0) {
  //     //   if (values.find((option: any) => option.id === "All")) {
  //     //     setSelectedLocation([allOption]);
  //     //   } else {
  //     //     setSelectedLocation(
  //     //       values.filter((option: any) => option.id !== "All")
  //     //     );
  //     //   }
  //     setSelectedLocation(values);
  //     getAllAuditScheduleDetails(currentYear);
  //   } else {
  //     setSelectedLocation([]);
  //     setAllAuditScheduleDetails([]);
  //   }
  // };
  const defaultOption = { id: "all", auditType: "all" };
  const handleChangeAuditTypeList = (event: any, values: any) => {
    // const auditTypes = values.map((item: any) => item.auditType);\
    // console.log("value in handle chage", values);
    if (values === null) {
      setSelectedAuditType(defaultOption);
    }
    setSelectedAuditType(values);
    setSelected(!!values);
  };

  const handleSearchChangeNew = (e: any) => {
    e.preventDefault();
    setsearchQuery({
      ...searchValue,
      [e.target.name]: e.target.value,
    });
  };

  const getAllLocations = () => {
    setPageLoading(true);
    getAllLocation(realmName).then((response: any) => {
      setLocationListing(parseLocation(response?.data));
      setPageLoading(false);
    });
  };
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
  const getCalendarData = async (searchValue: any) => {
    setCalendarDataLoading(true);
    const { auditYear, location, auditType, systemName, auditor } = searchValue;
    let url;
    setCalendarData([]);
    const audittype = selectedAuditType?.id ? selectedAuditType?.id : "all";

    if (openAudit) {
      url = `api/auditSchedule/getMyAuditCalendardata?auditYear=${auditYear}&locationId=${location}&systemTypeId=${auditType}&systemMasterId=${systemName}&auditor=${auditor}&auditType=${audittype}`;
    } else {
      url = `api/auditSchedule/getAuditScheduleEntityWiseCalendardata?auditYear=${auditYear}&locationId=${location}&systemTypeId=${auditType}&systemMasterId=${systemName}&auditor=${auditor}&auditType=${audittype}`;
    }

    await axios.get(url).then((response: any) => {
      //process the result
      // Determine the role of the current user (auditor/auditee)
      setCalendarData([]);
      if (response.data) {
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
  };
  const refreshCalendarData = () => {
    getCalendarData(searchValue);
  };

  const boardData = async () => {
    try {
      const systemParsed: any = secSystemSelected
        .map((value: any) => {
          return `system[]=${value.id}`;
        })
        .join("&");
      const res = await axios.get(
        `/api/auditSchedule/getBoardData?auditType=${selectedAuditType.id}&location=${selectedLocation.id}&${systemParsed}&year=${currentYear}&auditPeriod=${monthSelected}&myAudit=${openAudit}`
      );
      setBoardData(res?.data);
    } catch (err) {}
  };
  // console.log("calendara data", calendarData);
  const getAllSystemTypes = (realm: string) => {
    setPageLoading(true);
    getSystemTypes(realmName)
      .then((response: any) => {
        setAuditTypeListing(parseAuditType(response?.data));
        setPageLoading(false);
      })
      .catch((error: any) => console.log("error response - ", error));
  };
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
  // const calendarStylesDesktop: any = {
  //   position: "absolute",
  //   top: 140,
  //   right: 150,
  //   border: "1px solid #6e7dab",
  // };
  // const calendarStylesMobile: any = {
  //   position: "absolute",
  //   top: 117,
  //   right: 90,
  //   border: "1px solid #6e7dab",
  // };
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
  const getAuditors = (realm: string) => {
    setPageLoading(true);
    getAllAuditors(realm).then((response: any) => {
      setAuditorListing(parseAuditors(response?.data));
      setPageLoading(false);
    });
  };
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
  // const getAllSubSystemTypes = (id: string) => {
  //   getSystems(id).then((response: any) => {
  //     setSystemListing(parseSystemType(response?.data));
  //   });
  // };

  // const handleApply = () => {
  //   setIsLoading(true);
  //   getCalendarData(searchValue)
  //     .then((res: any) => {
  //       res?.data?.map((item: any) => {
  //         setCalendarData((prev: any) => [
  //           ...prev,
  //           {
  //             id: item?.id,
  //             title: item?.entityName ?? "-",
  //             start: item?.time ?? "-",
  //             allDay: false,
  //             className: "audit-entry",
  //             textColor: "#000000",
  //             url: `/audit/auditschedule/auditscheduleform/schedule/${item.id}`,
  //             locationName: item?.locationName,
  //           },
  //         ]);
  //       });
  //     })
  //     .catch((err) =>
  //       enqueueSnackbar(err.message, {
  //         variant: "error",
  //       })
  //     )
  //     .finally(() => {
  //       setIsLoading(false);
  //     });
  // };
  const getAllAuditScheduleDetails = async (year: any) => {
    setIsLoading(true);
    const systemData = secSystemSelected
      ?.map((value: any) => {
        return `&system[]=${value?.id}`;
      })
      .join("");
    await axios(
      `api/auditSchedule/getAllAuditschedule/${
        selectedLocation?.id
      }/${currentYear}/${
        selectedAuditType?.id ? selectedAuditType?.id : "all"
      }?page=${1}&limit=${10}${systemData}`
    )
      .then((res) => {
        setCount(res?.data?.count);
        setAllAuditScheduleDetails(res?.data?.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });
    // }
  };

  // console.log("allAuditScheduleDetails", allAuditScheduleDetails);
  const getMyAuditScheduleDetails = async () => {
    setIsLoading(true);
    const audittype = selectedAuditType?.id ? selectedAuditType?.id : "all";
    if (selectedAuditType?.id) {
      await axios(
        `api/auditSchedule/getMyAuditCalendardata?auditYear=${auditYear}&locationId=${location}&systemTypeId=${audittype}&auditType=${audittype}`
      )
        .then((res) => {
          // console.log("result from my scheudle", res?.data);
          if (res?.data) {
            setAllAuditScheduleDetails(res?.data);
          }
          setIsLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setIsLoading(false);
        });
    }
  };

  const handleTableSearch = async () => {
    setPage(1);
    setRowsPerPage(10);
    const systemData = secSystemSelected
      ?.map((value: any) => {
        return `&system[]=${value?.id}`;
      })
      .join("");
    await axios(
      `api/auditSchedule/getAllAuditschedule/${
        selectedLocation?.id
      }/${currentYear}/${
        selectedAuditType.id ? selectedAuditType.id : "all"
      }?page=${1}&limit=${10}&search=${searchQuery?.searchQuery}${systemData}`
    )
      .then((res) => {
        setAllAuditScheduleDetails(res?.data?.data);
        setCount(res.data.count);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  };
  const handleClickDiscard = () => {
    setsearchQuery({ searchQuery: "" });

    // setOpenAudit(false);
    setIsLoading(true);
    getAllAuditScheduleDetails(currentYear);
  };

  const getLocationNames = async () => {
    setIsLoading(true);
    setPageLoading(true);
    try {
      setIsLoading(true);
      const res = await axios.get(
        `api/location/getLocationsForOrg/${realmName}`
      );

      setLocationNames([...res.data]);
      setIsLoading(false);
      setPageLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };
  const getAuditTypes = async () => {
    setIsLoading(true);
    setPageLoading(true);
    try {
      setIsLoading(true);
      const res = await axios.get(`/api/audit-settings/getAllAuditTypes`);

      setAuditTypes(res.data);
      setIsLoading(false);
      setPageLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };
  // console.log("getallaudittypes", auditTypes);
  const openNewSchedule = () => {
    navigate("/audit/auditschedule/auditscheduleform");
  };

  const handleEditSchedule = (data: any) => {
    console.log("checkaudit inside handleEdit Schedile");

    setScheduleFormType("adhoc-edit");
    navigate(`/audit/auditschedule/auditscheduleform/schedule/${data.id}`);
  };

  const handleDelete = async () => {
    setOpen(false);

    await axios
      .delete(`api/auditSchedule/auditScheduleDelete/${deleteSchedule.id}`)
      .then(() =>
        enqueueSnackbar(`Operation Successfull`, { variant: "success" })
      )
      .catch((err) => {
        enqueueSnackbar(`Could not delete record`, {
          variant: "error",
        });
        console.error(err);
      });
    getAllAuditScheduleDetails(currentYear);
  };

  const handleOpen = (val: any) => {
    setOpen(true);
    setDeleteSchedule(val);
  };

  const toggleCalendarModal = (data: any = {}) => {
    setCalendarModalInfo({
      ...calendarModalInfo,
      open: !calendarModalInfo.open,
      data: data,
      dataLoaded: data?.id ? true : false,
    });
  };

  const handleGetAllAuditReports = async (val: any) => {
    setProgress(10);
    setProgressModel(true);
    let consolidated = "";
    const getAllAuditReports = await axios.get(
      `/api/audits/getAllAuditReports/${val.id}`
    );
    const allIds = getAllAuditReports.data.map(
      (item: { _id: any }) => item._id
    );
    for (let i = 0; i < allIds.length; i++) {
      const tempalte = await getAuditData(allIds[i]);
      consolidated += tempalte;
      if (i < allIds.length - 1) {
        consolidated += '<div style="page-break-before: always;"></div>';
      }
    }
    if (consolidated.trim() !== "") {
      printJS({
        type: "raw-html",
        printable: consolidated,
      });
    } else {
      enqueueSnackbar(`No Audit Report for this Audit Schedule`, {
        variant: "error",
      });
    }
    setProgress(100);
  };

  const progressTimer = () => {
    if (progress < 90) {
      setTimeout(() => {
        setProgress((prevProgress) => prevProgress + 10);
      }, 2500);
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
    if (
      selectedAuditType !== undefined &&
      selectedLocation !== undefined &&
      secSystemSelected !== undefined &&
      monthSelected !== undefined
    ) {
      boardData();
    }
    // `/api/auditSchedule/getBoardData?auditType=${selectAuditType.id}&location=${selectLocation.id}&${systemParsed}&year=${currentYear}&auditPeriod=${monthSelected}`
  }, [
    selectedAuditType,
    selectedLocation,
    secSystemSelected,
    currentYear,
    monthSelected,
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNumDots((prevNumDots) => (prevNumDots === 4 ? 2 : prevNumDots + 1));
    }, 500);

    if (!progressModel) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [progressModel]);

  const getAuditData = async (id: string) => {
    const htmlData = await getAuditForPdf(id).then(async (response: any) => {
      const formattedDateTime = formatDateTime(response.data.date).split(
        "T"
      )[0];
      const uniqueFindingsObject: Record<string, any[]> = {};
      let count = 0;

      response?.data?.sections?.forEach((section: any) => {
        section?.sections.forEach((sections: any) => {
          sections?.fieldset.forEach((field: any) => {
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
        auditedEntity: response.data.auditedEntity.entityName,
        auditees: response.data.auditees,
        findings: uniqueFindingsObject,
        comment: response?.data?.comment || "",
        draft: response.data.isDraft,
      };

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
                      const ncRef = nc.reference
                        ?.map((ref: any) => nameConstruct(ref))
                        .join(", ");
                      const ncHtml = `
                        <tr key={index}>
                          <td>${index + 1})</td>
                          <td>${nc.comment ? nc.comment : "N/A"}</td>
                          <td>${nc?.clause ? nc?.clause?.clauseName : ""}</td>
                          <td>${ncRef ? ncRef : ""}</td>
                        </tr>
                        <tr key={index}>
                          <th colspan="1"></th>
                          <th colspan="3" style="text-align: left;">
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
                                      .endsWith(".jpg")
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
                                      .endsWith(".jpg")
                                  ) {
                                    return `<img src="${attachment.url}" alt="Description of the image" width="356" height="200" style="margin-right: 40px;">`;
                                  }
                                })
                                .join("");
                            }
                            return `
                            <tr key={index}>
                              <td colspan="1"></td>
                              <td colspan="3" style="text-align: left;">
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
                              <td colspan="3" style="text-align: left;">
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
        endHtmlFormat.replace("%COMMENT%", pdfData?.comment ?? "-");

      return fillTemplate;
    });
    return htmlData;
  };
  const handlePagination = async (pagein: any, rowerperpage: any) => {
    setIsLoading(true);
    setPage(pagein);
    setRowsPerPage(rowerperpage);

    const year = await getYearinYYYYformat(currentYear);
    const systemData = secSystemSelected
      ?.map((value: any) => {
        return `&system[]=${value?.id}`;
      })
      .join("");
    await axios(
      `api/auditSchedule/getAllAuditschedule/${
        selectedLocation?.id
      }/${currentYear}/${
        selectedAuditType.id ? selectedAuditType.id : "all"
      }?page=${pagein}&limit=${rowerperpage}&search=${
        searchQuery?.searchQuery
      }${systemData}`
    )
      .then((res) => {
        setCount(res?.data?.count);
        // console.log("response in getall", res);
        setAllAuditScheduleDetails(res?.data?.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  };

  // const initialData = () => {
  //   const labelData = ["Completed", "Scheduled", "OverDue"];

  // };

  const [selected, setSelected] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState(false);

  const [selectedCard, setSelectedCard] = useState(false);
  const [selectedUnitCard, setSelectedUnitCard] = useState(false);

  // months

  // const optionsMonth = [optionsMonth]; // This should come from your API
  const [selectedMonth, setSelectedMonth] = useState("");

  const handleMonthClick = (month: any) => {
    setSelectedMonth(month);
    setMonthSelect(month);
  };

  const months = [
    { name: "All", value: "All" },
    { name: "Jan", value: "January" },
    { name: "Feb", value: "February" },
    { name: "Mar", value: "March" },
    { name: "Apr", value: "April" },
    { name: "May", value: "May" },
    { name: "Jun", value: "June" },
    { name: "Jul", value: "July" },
    { name: "Aug", value: "August" },
    { name: "Sep", value: "September" },
    { name: "Oct", value: "October" },
    { name: "Nov", value: "November" },
    { name: "Dec", value: "December" },
  ];

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
  return (
    // {isLoading?():()}

    <div>
      <div
        className={matches ? (!view ? classes.root : "") : classes.mobileView}
        style={{ paddingTop: matches ? "1.25rem" : "0px" }}
      >
        <ConfirmDialog
          open={open}
          handleClose={() => setOpen(false)}
          handleDelete={handleDelete}
        />
        <Box
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: matches ? "nowrap" : "wrap",
            // margin:"0px"
          }}
        >
          <Grid
            container
            alignItems="center"
            spacing={2}
            style={{ margin: "0px" }}
          >
            <Grid item xs={6} md={3}>
              <div className={classes.locSearchBox}>
                <FormControl variant="outlined" size="small" fullWidth>
                  <div
                    className={classes.locSearchBox}
                    ref={refelemetForSchedule2}
                  >
                    <Autocomplete
                      id="audittype-autocomplete"
                      className={classes.inputRootOverride} // Add this class here
                      options={
                        Array.isArray(auditTypes)
                          ? [{ id: "All", auditType: "All" }, ...auditTypes]
                          : [{ id: "All", auditType: "All" }]
                      }
                      getOptionLabel={(option) => option.auditType || ""}
                      getOptionSelected={(option, value) =>
                        option?.id === value?.id
                      }
                      value={selectedAuditType}
                      onChange={handleChangeAuditTypeList}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          size="small"
                          // label="AuditType"
                          placeholder="Audit Type"
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
            </Grid>
            <Grid item xs={6} md={3}>
              <div className={classes.locSearchBox}>
                <FormControl variant="outlined" size="small" fullWidth>
                  <div
                    className={classes.locSearchBox}
                    ref={refelemetForSchedule2}
                  >
                    <Autocomplete
                      // multiple
                      id="location-autocomplete"
                      className={classes.inputRootOverride} // Add this class here
                      options={
                        // [...locationNames]
                        Array.isArray(locationNames)
                          ? [allOption, ...locationNames]
                          : [allOption]
                      }
                      getOptionLabel={(option) => option.locationName || ""}
                      getOptionSelected={(option, value) =>
                        option.id === value.id
                      }
                      value={selectedLocation}
                      onChange={(e, value) => {
                        setSelectedLocation(value);
                        setPage(1);
                        setRowsPerPage(10);
                        setSelectedUnit(!!value);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          size="small"
                          // label="Corp Func/Unit"
                          placeholder="Corp Func/Unit"
                          fullWidth
                          className={
                            selectedUnit
                              ? classes.textField
                              : classes.textField2
                          }
                        />
                      )}
                    />
                  </div>
                </FormControl>
              </div>
            </Grid>
            <Grid item xs={6} md={3}>
              <div className={classes.locSearchBox}>
                <FormControl variant="outlined" size="small" fullWidth>
                  <div
                    className={classes.locSearchBox}
                    ref={refelemetForSchedule2}
                  >
                    <Autocomplete
                      multiple
                      limitTags={1}
                      id="location-autocomplete"
                      className={classes.inputRootOverride}
                      options={secSystemOptions}
                      getOptionLabel={(option: any) => option.name || ""}
                      getOptionSelected={(option: any, value) =>
                        option.id === value.id
                      }
                      value={secSystemSelected}
                      onChange={(e, value) => {
                        setSecSystemSelected(value);
                        setSelectedSystem(!!value);
                      }}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <div
                            key={option.id}
                            className={`${classes.tagContainer} ${
                              index > 0 ? classes.hiddenTags : ""
                            }`}
                          >
                            <div className={classes.tag}>{option.name}</div>
                          </div>
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          size="small"
                          // label="System"
                          placeholder={
                            secSystemSelected.length === 0 ? "System" : ""
                          }
                          fullWidth
                          className={
                            secSystemSelected.length === 0
                              ? classes.textField2
                              : classes.textField
                          }
                        />
                      )}
                    />
                  </div>
                </FormControl>
              </div>
            </Grid>
            <div ref={refelemetForSchedule6}>
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
                    <MdFiberManualRecord
                      style={{ color: "#e6ffe6", fontSize: "small" }}
                    />{" "}
                    Auditee
                    <MdFiberManualRecord
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
                    <MdPermContactCalendar
                      style={{
                        color: "rgb(53, 118, 186)",
                        height: "31px",
                        width: "30px",
                      }}
                    />
                  ) : (
                    <MdOutlinePermContactCalendar
                      style={{
                        color: "#444",
                        height: "31px",
                        width: "30px",
                      }}
                    />
                  )}
                </IconButton>
              </Tooltip>
            </div>
            {/* <Grid
              item
              xs={6}
              md={3}
              style={{ padding: matches ? "8px" : "0px" }}
            > */}
            <div ref={refelemetForSchedule3}>
              <YearComponent
                currentYear={currentYear}
                setCurrentYear={setCurrentYear}
              />
            </div>
            {/* </Grid> */}
          </Grid>

          <Box display="flex" alignItems="center" marginLeft={2}>
            {/* {mode && ( */}

            {matches && !view && mode && (
              <SearchBar
                placeholder="Search"
                name="searchQuery"
                values={searchQuery}
                handleChange={handleSearchChangeNew}
                handleApply={handleTableSearch}
                endAdornment={true}
                handleClickDiscard={() => {
                  handleClickDiscard();
                  setSearchValue({
                    searchQuery: "",
                  });
                }}
              />
            )}
          </Box>
        </Box>
        {mode === false ? (
          <>
            <div
              // className={classes.locSearchBoxNew}
              style={{ paddingLeft: "16px" }}
            >
              <FormControl variant="outlined" size="small" fullWidth>
                <div
                  style={{
                    marginTop: "15px",
                    display: "flex",
                    justifyContent: "space-evenly",
                    gap: "10px",
                    alignItems: "center",
                    width: "70%",
                    // backgroundColor: "red",
                  }}
                >
                  {months.map(({ name, value }) => {
                    let className = classes.month;
                    if (optionsMonth.includes(value)) {
                      className = classes.monthSelectedFromAPI;
                    }
                    if (selectedMonth === value) {
                      className = classes.monthClicked;
                    }
                    return (
                      <p
                        key={name}
                        className={className}
                        onClick={() => handleMonthClick(value)}
                      >
                        {name}
                      </p>
                    );
                  })}
                </div>
              </FormControl>
            </div>
            <div className={classes.boardContainer}>
              {boardDatas.map((value: any, column: any) => (
                <Paper
                  elevation={0}
                  className={classes.column}
                  key={value?.lable}
                  style={{
                    backgroundColor: "#F2F2F2",
                    // backgroundColor: "red",
                    width: "335px",
                  }}
                >
                  <Typography variant="h6" className={classes.columnName}>
                    {value.label}
                  </Typography>
                  <hr
                    style={{
                      height: "3px",
                      backgroundColor: "black",
                      margin: "8px 15px 15px 15px",
                    }}
                  />

                  {value?.data?.map((item: any) => (
                    <div
                      className={classes.taskContainer}
                      style={{ padding: "15px" }}
                    >
                      <div
                        className={classes.header}
                        style={{
                          backgroundColor: `${
                            value.label === "Completed"
                              ? "#d98cb3"
                              : value.label === "OverDue"
                              ? "#ff8080"
                              : item.auditor.includes(userDetails.id) &&
                                item.created === false
                              ? "#8CD9B3"
                              : "#9FBFDF"
                          }`,
                          padding: "5px 5px",
                        }}
                      >
                        <Typography variant="h6" className={classes.title}>
                          {item?.name}
                        </Typography>
                        {/* {task?.auditorCheck && ( */}
                        <div className={classes.rightEnd}>
                          {item.auditor.includes(userDetails.id) &&
                          item.created === false ? (
                            <Tooltip title={"Create Audit Report"}>
                              <IconButton
                                onClick={() => {
                                  navigate("/audit/auditreport/newaudit", {
                                    state: {
                                      auditScheduleId: item.auditScheduleId,
                                      entityName: item?.name,
                                      disableFields: true,
                                      auditScheduleName:
                                        item?.auditScheduleDatas
                                          ?.auditScheduleName,
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
                        {/* {task.scheduleAccess && ( */}
                        {/* )} */}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          margin: "0px 0px",
                          padding: "5px 0px",
                          // display: "flex",
                        }}
                      >
                        <div
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
                            Auditor :{" "}
                          </p>
                          <p
                            style={{
                              margin: "2px 5px",
                            }}
                          >
                            {item?.auditorData}
                          </p>
                        </div>

                        <div
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
                            Auditee :{" "}
                          </p>
                          <p
                            style={{
                              margin: "2px 5px",
                            }}
                          >
                            {item?.auditeeData}
                          </p>
                        </div>
                        <div
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
                            Schedule Date :{" "}
                          </p>
                          <p
                            style={{
                              margin: "2px 5px",
                            }}
                          >
                            {" "}
                            {formatDate(item?.time)}
                          </p>
                        </div>
                        <div
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
                            {item?.systems}
                          </p>
                        </div>
                        {item?.hasOwnProperty("auditReportId") && (
                          <div
                            style={{
                              fontSize: "12px",
                              margin: "0px 0px",
                              // display: "flex",
                              justifyContent: "center", // Center horizontally
                              alignItems: "center", // Center vertically
                            }}
                          >
                            <Tooltip title="Click To View Audit Report">
                              <Button
                                // className={classes.actionButton}
                                // type="primary"
                                shape="round"
                                icon={
                                  <MdAssessment
                                    style={{ verticalAlign: "middle" }}
                                  />
                                } // Align icon to middle
                                size={"middle"}
                                style={{
                                  margin: "2px 5px",
                                }}
                                onClick={() =>
                                  window.open(
                                    `/audit/auditreport/newaudit/${item?.auditReportId}`,
                                    "_blank"
                                  )
                                }
                              >
                                {/* <span style={{ verticalAlign: "middle" }}>
                                Click To View Audit Report
                              </span> */}
                              </Button>
                            </Tooltip>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </Paper>
              ))}
            </div>
          </>
        ) : (
          <>
            {" "}
            {selectCalenderview === true ? (
              <>
                <div
                  // className={classes.auditReportCalendarWrapper}
                  style={{
                    width: "100%",
                    // height: "600px",
                    // overflow: "auto",
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
                    setLoaderForSchdeuleDrawer={setLoaderForSchdeuleDrawer}
                    auditScheduleIdFromLocation={auditScheduleIdFromLocation}
                    formModeForCalendarDrawer={formModeForCalendarDrawer}
                    setFormModeForCalendarDrawer={setFormModeForCalendarDrawer}
                  />
                  {/* {calendarData && calendarData?.length === 0 && (
                <AuditScheduleCalendarModal
                  calendarData={calendarData}
                  calendarModalInfo={calendarModalInfo}
                  toggleCalendarModal={toggleCalendarModal}
                  refreshCalendarData={refreshCalendarData}
                />
              )} */}
                </div>
              </>
            ) : (
              <div></div>
            )}
            {selectListview === true ? (
              <>
                <Table
                  dataSource={openAudit ? calendarData : data}
                  pagination={{ position: [] }}
                  columns={openAudit ? myAuditColumns : columns}
                  className={classes.tableContainer}
                />{" "}
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
                {/* <div className={classes.imgContainer}>
                  <img src={EmptyTableImg} alt="No Data" width="300px" />
                </div>
                <Typography align="center" className={classes.emptyDataText}>
                  Let’s begin by adding a schedule
                </Typography> */}
              </>
            )}
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
          </>
        )}
      </div>
    </div>
  );
}

export default AuditSchedule;
