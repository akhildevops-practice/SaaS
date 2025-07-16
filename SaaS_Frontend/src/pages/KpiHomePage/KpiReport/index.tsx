import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  TextField,
  Fab,
  Tooltip,
  IconButton,
  Paper,
  FormControl,
  useMediaQuery,
} from "@material-ui/core";
import {
  AiOutlineFilter,
  AiFillFilter,
  AiOutlineSearch,
  AiOutlineSend,
} from "react-icons/ai";
import { MdDescription } from "react-icons/md";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import axios from "apis/axios.global";
import { makeStyles } from "@material-ui/core/styles";
import { MdSearch } from "react-icons/md";
import { Autocomplete } from "@material-ui/lab";
import getUserId from "utils/getUserId";
import { MdSync } from "react-icons/md";
import { Button, Input, Modal, Pagination, PaginationProps, Table } from "antd";
import { ReactComponent as CustomEditIcon } from "assets/documentControl/Edit.svg";
import getAppUrl from "utils/getAppUrl";
import getYearFormat from "utils/getYearFormat";
import YearComponent from "components/Yearcomponent";
import moment from "moment";
import checkRole from "utils/checkRoles";
import checkRoles from "utils/checkRoles";
import { ReactComponent as FilterIcon } from "assets/documentControl/Filter.svg";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import DepartmentSelector from "components/ReusableComponents/DepartmentSelector";

const useStyles = (matches: any) =>
  makeStyles((theme) => ({
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
    filterButton: {
      borderRadius: 8,
      padding: "6px 12px",
      border: "1px solid #0f172a",
      fontWeight: 500,
      textTransform: "none",
      display: "flex",
      alignItems: "center",
      gap: 6,
      backgroundColor: "#fff",
      color: "#0f172a",
      cursor: "pointer",
    },
    iconButton: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    SearchBox: {
      width: "80%",
      [theme.breakpoints.down("sm")]: {
        // marginTop: theme.typography.pxToRem(10),
      },
      "& .MuiOutlinedInput-root": {
        borderRadius: "16px",
      },
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
        height: "50px", // Set the height of the table cells
      },
      // "& tr.ant-table-row:nth-child(odd)": {
      //   backgroundColor: "#F5F5F5", // Odd row color
      // },
      // "& tr.ant-table-row:nth-child(even)": {
      //   backgroundColor: "#FFFFFF", // Even row color
      // },
    },
    root: {
      width: "100%",
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
    fabButton: {
      backgroundColor: theme.palette.primary.light,
      color: "#fff",
      margin: "0 5px",
      zIndex: 99,

      "&:hover": {
        backgroundColor: theme.palette.primary.main,
      },
    },
    imgContainer: {
      display: "flex",
      justifyContent: "center",
    },
    emptyDataText: {
      fontSize: theme.typography.pxToRem(14),
      color: theme.palette.primary.main,
    },
    syncButton: {
      backgroundColor: theme.palette.primary.light,
      color: "white",
      position: "fixed",
      right: matches ? 50 : 200,
      bottom: matches ? 50 : 3,
      zIndex: 99,

      "&:hover": {
        backgroundColor: theme.palette.primary.main,
      },
    },
    modal2: {
      "&.ant-modal .ant-modal-content": {
        padding: "0px 0px 10px 0px",
      },
    },
  }));

function KpiReport() {
  const [selectedDept, setSelectedDept] = useState<any>({});
  const matches = useMediaQuery("(min-width:822px)");
  const [showFilters, setShowFilters] = useState<any>(false);
  const smallScreen = useMediaQuery("(min-width:450px)");
  const [allReports, setAllReports] = useState<any[]>([]);
  const [data, setData] = useState<any[]>([]);

  const [open, setOpen] = useState(false);
  const [deleteReport, setDeleteReport] = useState<any>();
  const [templateOptions, setTemplateOptions] = useState<any>([]);
  const [finaltemplateOptions, setFinalTemplateOptions] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<{ id: string; username: string }[]>([]);
  const loggedInUser = JSON.parse(sessionStorage.getItem("userDetails") as any);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const classes = useStyles(matches)();
  const userId = getUserId();
  //pagination states
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [count, setCount] = useState<number>(0);
  //filter states
  const [unitId, setUnitId] = useState<string>(loggedInUser?.location?.id);
  const [locationOptions, setLocationOptions] = useState<any[]>([]);
  const [deptId, setDeptId] = useState<string>(loggedInUser?.entity?.id);
  const [deptOptions, setDeptOptions] = useState<any[]>([]);
  const [currentYear, setCurrentYear] = useState<any>();
  const realmName = getAppUrl();
  const [searchValue, setSearchValue] = useState<string>("");
  const allOption = { id: "All", locationName: "All" };
  const allDeptOption = { id: "All", entityName: "All" };
  const [selectedOption, setSelectedOption] = useState<string>("");
  //states for column filter
  const [filterList, setFilterList] = useState<any>([]);
  const [selectedFrequency, setselectedFrequency] = useState<any>([]);
  const [isFilterFrequency, setfilterFrequency] = useState<boolean>(false);
  const [ownersList, setOwnersList] = useState<any>([]);
  const isMr = checkRole("MR");
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  useEffect(() => {
    if (loggedInUser?.entityId) {
      fetchInitialDepartment(loggedInUser.entityId);
    }
  }, [loggedInUser?.entityId]);

  // const cols = [
  //   {
  //     header: "Template name",
  //     accessorKey: "reportName",
  //   },
  //   {
  //     header: "Report name",
  //     accessorKey: "reportName",
  //   },
  //   {
  //     header: "Run by",
  //     accessorKey: "runBy",
  //   },
  //   {
  //     header: "No. of KPIs",
  //     accessorKey: "numberOfKpis",
  //   },
  //   {
  //     header: "Report ID",
  //     accessorKey: "reportId",
  //   },
  //   {
  //     header: "Schedule",
  //     accessorKey: "schedule",
  //   },
  //   {
  //     header: "Shared with",
  //     accessorKey: "sharedWith",
  //   },
  // ];
  const showTotal: PaginationProps["showTotal"] = (total: any) =>
    `Total ${total} items`;
  const handlePagination = (pagevalue: any, size: any) => {
    setPage(pagevalue);
    setLimit(size);
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
    } catch (error) {
      console.error("Failed to fetch initial department:", error);
    }
  };
  const handleSearchChange = (e: any) => {
    e.preventDefault();
    if (
      e.target.value === "" ||
      e.target.value === null ||
      e.target.value === undefined
    ) {
      // getAllReports();
      setSearchValue("");
    } else {
      setSearchValue(e.target.value);
    }
    // console.log("e,target.value", e.target.value);
  };
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  function getMonthName(month: number): string {
    return monthNames[month];
  }
  const [fiscalMonth, setFiscalMonth] = useState<any>();
  const [heads, setHeads] = useState<any[]>([]);
  const quarterNames1 = ["Jan-Mar", "Apr-Jun", "Jul-Sep", "Oct-Dec"];
  const quarterNames2 = ["Apr-Jun", "Jul-Sep", "Oct-Dec", "Jan-Mar"];
  async function getFiscalQuarter(dateFor: any, yearFor: any) {
    const ndate = new Date(dateFor);
    const date: any = ndate.toLocaleDateString("en-GB");
    const kpimonth = ndate.getMonth();
    const year = ndate.getFullYear();
    // let adate = new Date(date).getTime();

    // console.log("date,month,year", date, kpimonth, year);
    const result = await axios.get(
      `/api/kpi-report/computefiscalyearquarters/${yearFor}`
    );
    // console.log("result", result);
    const quarters = result.data;
    // console.log("quarters", quarters);
    let period;
    // console.log('date inside else while writing', date);
    for (let i = 0; i < quarters.length; i++) {
      //  //////////////console.log('inside for');
      // const dateobj = new Date(date);

      const qStartDate = quarters[i].startDate;
      //  console.log('qstartdate', qStartDate);
      ////////////////console.log(quarters[i].endDate);

      const qEndDate = quarters[i].endDate;
      //  console.log('qenddate', qEndDate);

      const d1 = qStartDate.split("/");
      const d2 = qEndDate.split("/");
      const c = date.split("/");

      const from = new Date(+d1[2], +d1[1] - 1, +d1[0]); // using unary plus to convert string to number
      const to = new Date(+d2[2], +d2[1] - 1, +d2[0]);
      const check = new Date(+c[2], +c[1] - 1, +c[0]);
      // console.log("check,from,to", from, to, check);
      if (check >= from && check <= to) {
        period = quarters[i].quarterNumber;
        // console.log('period inside if', period);
      }
    }
    return period;
  }
  const getFiscalMonth = async () => {
    const result = await axios.get(`api/organization/${realmName}`);
    // console.log("result", result?.data, result?.data?.fiscalYearQuarters);
    setFiscalMonth(result?.data?.fiscalYearQuarters);
  };
  function getQuarterName(quarter: number): any {
    if (fiscalMonth === "Jan - Dec") {
      return quarterNames1[quarter - 1];
    } else {
      return quarterNames2[quarter - 1];
    }
  }
  const columns: any = [
    {
      title: "Report Title",
      dataIndex: "reportName",
      width: 150,
      render: (_: any, data: any, index: number) => (
        <>
          <div
            style={{ textDecoration: "underline", cursor: "pointer" }}
            onClick={() => {
              if (data.kpiReportTemplateId) {
                navigate(`/kpi/reports/reportform/${data.id}`, {
                  state: { from: "report" },
                });
              } else {
                navigate(`/kpi/reports/adhocreport/${data.id}`, {
                  state: { from: "adhoc" },
                });
              }
            }}
          >
            {data?.reportStatus === "DRAFT" && (
              <Tooltip title="In Draft">
                <MdDescription
                  style={{
                    verticalAlign: "middle",

                    color: "#339933",
                    fontSize: "20px",
                  }}
                />
              </Tooltip>
            )}
            {data?.reportName}
          </div>
        </>
      ),
    },
    {
      title: "Report Frequency",
      dataIndex: "reportFrequency",
      width: 100,
      render: (_: any, data: any, index: number) => (
        <>
          {/* {console.log("data runby", data)} */}
          <div>
            {data?.reportFrequency
              ? data?.reportFrequency
              : data?.tempdata?.reportFrequency}
          </div>
        </>
      ),
      filterIcon: (filtered: any) =>
        isFilterFrequency ? (
          <AiFillFilter style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <AiOutlineFilter style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }: any) => {
        const uniqueStatusSet = new Set(filterList?.frequency);

        const uniqueStatus = Array.from(uniqueStatusSet);
        return (
          <div
            style={{
              padding: 8,
              maxHeight: 200, // Set the maximum height of the container
              overflowY: "auto", // Enable vertical scrolling
            }}
          >
            {uniqueStatus?.map((item: any) => (
              <div key={item}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setselectedFrequency([...selectedFrequency, value]);
                      } else {
                        setselectedFrequency(
                          selectedFrequency.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={item}
                    checked={selectedFrequency.includes(item)}
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
                disabled={selectedFrequency.length === 0}
                onClick={() => {
                  setfilterFrequency(!isFilterFrequency);
                  handlePagination(1, 10);
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
                  setselectedFrequency([]);
                  // fetchDocuments();
                  setfilterFrequency(!isFilterFrequency);
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
      title: "Report Period",
      // dataIndex: "reportType",
      width: 100,
      render: (_: any, data: any, index: number) => {
        if (
          (data?.runDate && data?.reportFrequency === "Monthly") ||
          data?.reportFrequency === "Daily"
        ) {
          const date = new Date(data?.runDate);
          const month = date?.getMonth();
          // console.log("month", month);
          const name = getMonthName(month);
          return <span>{name}</span>;
        } else if (data.reportFrequency === "Quarterly") {
          const period = data.quarter;
          // console.log("period", period);
          const quarter = getQuarterName(period);
          // console.log("quarter", quarter);
          return <span>{quarter}</span>;
        } else if (data?.reportFrequency === "Half-Yearly") {
          return <span>{data?.semiAnnual ? data?.semiAnnual : ""}</span>;
        }
      },
    },
    {
      title: "Report Type",
      dataIndex: "reportType",
      width: 100,
      render: (_: any, data: any, index: number) => (
        <>
          <div>{data?.tempdata?._id ? "Template" : "Adhoc"}</div>
        </>
      ),
    },
    // {
    //   title: "Report Template",
    //   dataIndex: "templateName",
    //   width: 150,
    //   render: (_: any, data: any, index: number) => (
    //     <>
    //       <div
    //         style={{ textDecoration: "underline", cursor: "pointer" }}
    //         onClick={() => {
    //           // console.log("data in undeline", data);
    //           navigate(
    //             `/kpi/reporttemplates/templateform/${data?.tempdata._id}`,
    //             {
    //               state: { from: "report" },
    //             }
    //           );
    //         }}
    //       >
    //         {data?.tempdata?.kpiReportTemplateName}
    //       </div>
    //     </>
    //   ),
    // },

    {
      title: "Unit",
      dataIndex: "locationId",
      width: 100,
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
            {record?.location?.locationName}
          </div>
        </div>
      ),
    },
    {
      title: "Report Author",
      dataIndex: "runBy",
      width: 100,
      render: (_: any, data: any, index: number) => (
        <>
          {/* {console.log("data runby", data)} */}
          <div>{data?.runBy}</div>
        </>
      ),
    },

    {
      title: "Entity",
      dataIndex: "entity",
      width: 100,
      render: (_: any, record: any) => (
        <>
          <div>{record?.entity?.entityName}</div>
        </>
      ),
    },

    {
      title: "Categories",
      dataIndex: "categories",
      width: 100,
      render: (_: any, record: any) => (
        <>
          {record?.catdata
            .map((category: any) => category.kpiReportCategoryName)
            .join(", ")}
        </>
      ),
    },
    {
      title: "No. of KPIs in Report",
      dataIndex: "noofkpis",
      width: 100,
      render: (_: any, record: any) => (
        <>
          {
            <span style={{ textAlign: "center", paddingLeft: "30px" }}>
              {record?.numberOfKpis}
            </span>
          }
        </>
      ),
    },
    {
      title: "Last Updated",
      dataIndex: "updatedAt",
      width: 100,
      render: (_: any, data: any, index: number) => (
        <>{moment(data?.updatedAt).format("DD-MM-YYYY")}</>
      ),
    },

    {
      title: "Actions",
      dataIndex: "actions",
      width: 50,
      render: (_: any, data: any, index: number) => (
        <>
          {(isOwner ||
            (isMr && loggedInUser.locationId === data.location.id) ||
            isOrgAdmin) && (
            <IconButton
              style={{ padding: "0px" }}
              onClick={() => {
                handleEditReport(data);
              }}
            >
              <Tooltip title="Update Report" placement="bottom">
                <CustomEditIcon
                  style={{
                    marginRight: "2px",
                    fontSize: "15px",
                    height: "20px",
                  }}
                />
              </Tooltip>
            </IconButton>
          )}
        </>
      ),
    },
  ];
  const fetchFilterList = async () => {
    try {
      // console.log("fetchfilterlist called");
      const response = await axios.get(
        `api/kpi-report/getFilterListForReports`
      );
      // console.log("filterresponse", response.data);
      setFilterList(response?.data);
    } catch (error) {
      console.log("error", error);
    }
  };
  useEffect(() => {
    if (loggedInUser?.entityId) {
      fetchInitialDepartment(loggedInUser.entityId);
    }
  }, [loggedInUser?.entityId]);

  useEffect(() => {
    getUsers();
    getyear();
    getFiscalMonth();
    getTemplateOptions();
    getLocationOptions();
    getDepartmentOptions();
    getDHForEntity();
    getKpiOwners();
    if (currentYear) {
      getAllReports();
      fetchFilterList();
    }
  }, []);
  useEffect(() => {
    getDHForEntity();
    getKpiOwners();

    if (!!currentYear && currentYear !== undefined) {
      getTemplateOptions();
      getAllReports();
      fetchFilterList();
    }
  }, [
    page,
    limit,
    unitId,
    deptId,
    currentYear,
    selectedFrequency,
    searchValue,
  ]);
  useEffect(() => {
    getDepartmentOptions();
  }, [unitId]);
  useEffect(() => {
    const fetchAndSetData = async () => {
      const mappedData = await Promise.all(
        allReports?.map(async (obj) => ({
          id: obj.reportid,
          reportName: obj.reportinstaname,
          runBy: obj.runby,
          runDate: obj.runDate,
          reportFrequency: obj.reportFrequency,
          numberOfKpis: obj.noofkpis,
          yearFor: obj.yearFor,
          reportId: obj.reportid,
          schedule: obj.schedule,
          tempdata: obj.tempdata,
          location: obj.location,
          entity: obj.entity,
          catdata: obj.catdata,
          createdAt: obj.createdAt,
          updatedAt: obj.updatedAt,
          reportStatus: obj.reportStatus,
          semiAnnual: obj.semiAnnual ? obj.semiAnnual : "",
          quarter:
            obj.reportFrequency === "Quarterly"
              ? await getFiscalQuarter(obj.runDate, obj.yearFor)
              : "NA",
          sharedWith: users
            .filter((user) => obj.sharedwith?.includes(user.id))
            .map((user) => user.username)
            .join(", "),
        }))
      );
      setData(mappedData);
    };

    fetchAndSetData();
  }, [allReports]);

  // useEffect(() => {
  //   setData(
  //     allReports?.map((obj) => ({
  //       id: obj.reportid,
  //       reportName: obj.reportinstaname,
  //       runBy: obj.runby,
  //       runDate: obj.runDate,
  //       reportFrequency: obj.reportFrequency,
  //       numberOfKpis: obj.noofkpis,
  //       yearFor: obj.yearFor,
  //       reportId: obj.reportid,
  //       schedule: obj.schedule,
  //       tempdata: obj.tempdata,
  //       location: obj.location,
  //       entity: obj.entity,
  //       catdata: obj.catdata,
  //       createdAt: obj.createdAt,
  //       updatedAt: obj.updatedAt,
  //       reportStatus: obj.reportStatus,
  //       quarter:
  //         obj.reportFrequency === "Quarterly"
  //           ? getFiscalQuarter(obj.runDate, obj.yearFor)
  //           : "NA",
  //       sharedWith: users
  //         .filter((user) => obj.sharedwith?.includes(user.id))
  //         .map((user) => user.username)
  //         .join(", "),
  //     }))
  //   );
  // }, [allReports]);
  const getyear = async () => {
    const currentyear = await getYearFormat(new Date().getFullYear());
    setCurrentYear(currentyear);
  };
  const getDepartmentOptions = async () => {
    try {
      if (unitId) {
        // console.log("unitId", unitId);
        const result = await axios(
          `/api/cara/getEntitiesForLocation/${unitId}`
        );

        setDeptOptions(result?.data);
      }
    } catch (error) {
      enqueueSnackbar("Error fetching entities", { variant: "error" });
    }
  };
  const getLocationOptions = async () => {
    await axios(`/api/location/getLocationsForOrg/${realmName}`)
      .then((res) => {
        setLocationOptions(res?.data);
      })
      .catch((err) => console.error(err));
  };
  // console.log("data in reports", data);
  const getAllReports = async () => {
    setIsLoading(true);
    // if (searchValue !== "" && deptId !== undefined && unitId !== undefined) {
    const queryParams: any = {
      orgid: loggedInUser.organizationId,
      currentYear: currentYear,
      unitId: unitId,
      deptId: deptId,
      searchValue: searchValue,
      page: page,
      limit: limit,
    };
    if (selectedFrequency) {
      queryParams.selectedFrequency = selectedFrequency;
    }
    let testurl;
    testurl = `/api/kpi-report/getAllReportInstances`;
    const queryString = Object.keys(queryParams)
      .map((key) => {
        if (Array.isArray(queryParams[key])) {
          // If the value is an array, create multiple key-value pairs
          return queryParams[key]
            .map(
              (value: any) =>
                `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
            )
            .join("&");
        } else {
          // If the value is not an array, create a single key-value pair
          return `${encodeURIComponent(key)}=${encodeURIComponent(
            queryParams[key]
          )}`;
        }
      })
      .join("&");

    testurl += `?${queryString}`;

    // Fetch data from the constructed URL
    const res = await axios.get(testurl);
    // await axios(
    //   `/api/kpi-report/getAllReportInstances?page=${page}&limit=${limit}&unitId=${unitId}&deptId=${deptId}&searchValue=${searchValue}&currentYear=${currentYear}`
    // )
    //   .then((res) => {
    //     // console.log("data from getallreportinstances", data);
    //     setAllReports(res?.data?.data);
    //     setCount(res?.data?.count);
    //   })
    //   .catch((err) => {
    //     console.error(err);
    //   });
    // }
    if (res.data) {
      setAllReports(res.data?.data);
      setCount(res?.data?.count);
    } else {
      setAllReports([]);
    }
    setIsLoading(false);
  };

  const getUsers = async () => {
    await axios(`/api/kpi-report/getAllUsers`)
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => console.error(err));
  };

  const getTemplateOptions = async () => {
    try {
      const res = await axios(`/api/kpi-report/getAllKpiReportTemplates`);
      // console.log("res.data.data", res.data.data);

      // Filter and map the template options
      const filteredTemplateOptions = res.data.data
        .filter((obj: any) => obj.reportEditors?.includes(loggedInUser.id))
        .map((obj: any) => ({
          value: obj.id,
          label: obj.kpiReportTemplateName,
        }));

      // Add additional options
      const additionalOptions = [
        { label: "Daily" },
        { label: "Monthly" },
        { label: "Quarterly" },

        { label: "Half-Yearly" },
        // { label: "Yearly" },
      ];

      // Combine filtered template options with additional options
      const combinedOptions = [
        ...filteredTemplateOptions,
        ...additionalOptions,
      ];

      // Set the state with the combined options
      setTemplateOptions(combinedOptions);
      // console.log("finaltemplateoptions", combinedOptions);
    } catch (err) {
      console.error(err);
    }
  };

  // console.log("templateoptions", templateOptions);
  const handleLocation = (event: any, values: any) => {
    // console.log("selected location", values);
    if (values && values?.id) {
      setUnitId(values?.id);
      setSelectedDept(null);
    }
    if (values?.id === "All") {
      setDeptId(values?.id);
      setSelectedDept({ ...{ id: "All", name: "All" }, type: "All" });
    }
  };
  const getSelectedItem = () => {
    const item = [allOption, ...locationOptions].find((opt: any) => {
      if (opt.id === unitId) return opt;
    });
    // console.log("item", item);

    return item || {};
  };

  const handleEditReport = (data: any) => {
    // console.log("data in edit report", data);
    if (data.kpiReportTemplateId) {
      navigate(`/kpi/reports/reportform/${data.id}`);
    } else {
      navigate(`/kpi/reports/adhocreport/${data.id}`);
    }
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
  const handleClickDiscard = () => {
    setSearchValue("");
    getAllReports();
  };
  const getDHForEntity = async () => {
    if (deptId !== "All") {
      const head = await axios.get(`/api/cara/getDeptHeadForEntity/${deptId}`);
      console.log("head.data", head.data);
      if (head.data.length > 0) {
        setHeads(head.data);
      }
    } else {
      setHeads([]);
    }
  };
  const getKpiOwners = async () => {
    try {
      const result = await axios.get(
        `/api/kpi-definition/getOwners?locationId=${unitId}&entityId=${deptId}`
      );
      // console.log("kpiowners", result.data);
      if (result.data.owner.length > 0) {
        setOwnersList(result.data.owner);
      }
    } catch (error) {
      console.log("couldnt get owners for this location/entity", error);
    }
  };

  const handleRunReport = (newVal: any) => {
    const ownerIds = ownersList.map((owner: any) => owner.id);
    const headIds = heads.map((dh: any) => dh.id);
    console.log("headerIds", headIds);

    const isOwner =
      ownerIds.includes(loggedInUser.id) || headIds.includes(loggedInUser.id);

    // Set selected option
    setSelectedOption(newVal.label);

    // Check if label is one of the specific values
    if (
      newVal.label !== "Daily" &&
      newVal.label !== "Monthly" &&
      newVal.label !== "Quarterly" &&
      newVal.label !== "Half-Yearly" &&
      newVal.label !== "Yearly"
    ) {
      // Navigate to generate report from template
      navigate(`/kpi/reports/generatereportfromtemplate/${newVal?.value}`);
    } else {
      // Only navigate to adhocreport if the user is in the ownersList
      if (
        isOwner ||
        (isMr && loggedInUser.locationId === unitId) ||
        isOrgAdmin
      ) {
        navigate("/kpi/reports/adhocreport", {
          state: {
            selectedOption: newVal?.label,
            currentYear: currentYear,
            entity: deptId,
            location: unitId,
          },
        });
      } else {
        console.log("User is not authorized to access this report.");

        navigate("/unauthorized");
      }
    }
  };
  const ownerIds = ownersList.map((owner: any) => owner.id);

  const isOwner = ownerIds.includes(loggedInUser.id);

  const handleSummary = async () => {
    await axios(`/api/kpi-report/writeToSummary`).catch((err) =>
      console.error(err)
    );
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

  return (
    <>
      {matches ? (
        ""
      ) : (
        <div style={{ position: "relative", bottom: "55px", left: "85%" }}>
          <FilterIcon
            style={{ width: "24px", height: "24px" }}
            onClick={showModal}
          />
        </div>
      )}

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
          <Tooltip title="Sync reports Explicitly">
            <Fab
              size="medium"
              onClick={handleSummary}
              className={classes.syncButton}
            >
              <MdSync />
            </Fab>
          </Tooltip>

          <Grid
            container
            alignItems="flex-end"
            justifyContent="space-between"
          ></Grid>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              padding: "12px 0px",
            }}
          >
            {/* Left Side: Search + Toggle Filters */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  getAllReports();
                }}
              >
                <Input
                  size="small"
                  style={{
                    borderRadius: 50,
                    padding: "8px 12px",
                    border: "2px solid #d1d5db",
                    width: 320,
                  }}
                  allowClear
                  value={searchValue}
                  placeholder="Search Report"
                  onChange={handleSearchChange}
                  prefix={<AiOutlineSearch size={18} />}
                  suffix={<AiOutlineSend size={18} />}
                />
              </form>

              <div
                className={classes.filterButton}
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  border: "1px solid #ccc",
                  padding: "4px 10px",
                  borderRadius: "5px",
                  background: "#f8f8f8",
                }}
              >
                {showFilters ? (
                  <AiFillFilter size={18} />
                ) : (
                  <AiOutlineFilter size={18} />
                )}
                <span style={{ marginLeft: "6px" }}>
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </span>
              </div>
            </div>

            {/* Right Side: Run Report Dropdown */}
            <div style={{ width: 250, height: "60px", overflow: "hidden" }}>
              {/* <Paper style={{ width: 250, height: "60px", overflow: "hidden" }}> */}
              <Autocomplete
                fullWidth
                disableCloseOnSelect
                disableClearable
                size="small"
                getOptionLabel={(option: any) => option.label}
                options={templateOptions}
                value={null}
                onChange={(e, newVal) => handleRunReport(newVal)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Run Report"
                    InputLabelProps={{
                      style: {
                        fontWeight: "bold",
                        fontSize: "1rem",
                        marginBottom: "5px",
                      },
                    }}
                  />
                )}
              />
              {/* </Paper> */}
            </div>
          </div>

          {/* Filter Row */}
          {showFilters && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "20px",
                padding: "12px 24px",
                backgroundColor: "#f9fafb",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                marginBottom: "16px",
                alignItems: "center",
              }}
            >
              {/* Unit/Corp Func */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  width: "290px",
                }}
              >
                <label
                  style={{
                    fontWeight: 500,
                    fontSize: "14px",
                    color: "#374151",
                    width: "75px",
                  }}
                >
                  Unit:
                </label>
                <Autocomplete
                  options={[allOption, ...locationOptions]}
                  getOptionLabel={(option) => option.locationName || ""}
                  value={getSelectedItem()}
                  onChange={handleLocation}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      variant="outlined"
                      fullWidth
                      placeholder="Select Unit"
                    />
                  )}
                  fullWidth
                />
              </div>

              {/* Department */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  width: "290px",
                }}
              >
                <label
                  style={{
                    fontWeight: 500,
                    fontSize: "14px",
                    color: "#374151",
                    width: "92px",
                  }}
                >
                  Entity:
                </label>
                {/* <Autocomplete
                  options={[allDeptOption, ...deptOptions]}
                  getOptionLabel={(option) => option.entityName || ""}
                  value={getDeptSelectedItem()}
                  onChange={handleDepartment}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      variant="outlined"
                      fullWidth
                      placeholder="Select Department"
                    />
                  )}
                  fullWidth
                /> */}
                <DepartmentSelector
                  locationId={unitId}
                  selectedDepartment={selectedDept}
                  onSelect={(dept, type) => {
                    setSelectedDept({ ...dept, type }), setDeptId(dept?.id);
                  }}
                  onClear={() => setSelectedDept(null)}
                />
              </div>

              {/* Year Component */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  width: "220px",
                }}
              >
                <label
                  style={{
                    fontWeight: 500,
                    fontSize: "14px",
                    color: "#374151",
                    width: "45px",
                  }}
                >
                  Year:
                </label>
                <div style={{ flex: 1 }}>
                  <YearComponent
                    currentYear={currentYear}
                    setCurrentYear={setCurrentYear}
                  />
                </div>
              </div>
            </div>
          )}
          {/* </Grid>
          </Grid> */}
          {matches ? (
            <div className={classes.tableContainerScrollable}>
              {data && data?.length !== 0 ? (
                // <CustomTable2
                //   columns={cols}
                //   data={data}
                //   actions={[
                //     {
                //       label: "Edit",
                //       icon: <EditIcon fontSize="small" />,
                //       handler: handleEditReport,
                //     },
                //   ]}
                // />
                <>
                  <Table
                    className={classes.tableContainer}
                    rowClassName={() => "editable-row"}
                    bordered
                    dataSource={data}
                    columns={columns}
                    pagination={false}
                  />
                  <div className={classes.pagination}>
                    <Pagination
                      size="small"
                      current={page}
                      pageSize={limit}
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
                  <Table
                    bordered
                    className={classes.tableContainer}
                    columns={columns}
                    dataSource={[]} // Empty dataSource array
                    pagination={false}
                  />

                  <Typography align="center" className={classes.emptyDataText}>
                    No records found.
                  </Typography>
                </>
              )}
            </div>
          ) : (
            ""
          )}
        </>
      )}

      {/* //table mobile view */}

      {matches ? (
        ""
      ) : (
        <>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-evenly",
              marginBottom: "40px",
            }}
          >
            {data?.map((data: any) => {
              let reportPeriod;

              if (
                (data?.runDate && data?.reportFrequency === "Monthly") ||
                data?.reportFrequency === "Daily"
              ) {
                const date = new Date(data?.runDate);
                const month = date?.getMonth();
                reportPeriod = getMonthName(month);
              } else if (data?.reportFrequency === "Quarterly") {
                const period = data?.quarter;
                reportPeriod = getQuarterName(period);
              } else if (data?.reportFrequency === "Half-Yearly") {
                reportPeriod = data?.semiAnnual ? data?.semiAnnual : "";
              }

              return (
                <div
                  key={data?.id}
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
                      if (data?.kpiReportTemplateId) {
                        navigate(`/kpi/reports/reportform/${data?.id}`, {
                          state: { from: "report" },
                        });
                      } else {
                        navigate(`/kpi/reports/adhocreport/${data?.id}`, {
                          state: { from: "adhoc" },
                        });
                      }
                    }}
                    style={{
                      padding: "3px 10px",
                      backgroundColor: "#9fbfdf",
                      borderRadius: "2px",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    {data?.reportName}
                  </p>
                  <p>
                    Report Period: <span>{reportPeriod}</span>
                  </p>
                  <p>Dept: {data?.entity?.entityName}</p>
                  <p>No. of KPIs in Report: {data?.numberOfKpis}</p>
                  <p>
                    Last Updated: {moment(data?.updatedAt).format("DD-MM-YYYY")}
                  </p>
                </div>
              );
            })}
          </div>
          <div className={classes.pagination}>
            <Pagination
              size="small"
              current={page}
              pageSize={limit}
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
      )}

      {/* // filters for mobile view only */}

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
        className={classes.modal2}
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
          <FormControl variant="outlined" size="small" fullWidth>
            <div style={{ width: "100%" }}>
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
          <FormControl variant="outlined" size="small" fullWidth>
            <div style={{ width: "100%" }}>
              <Autocomplete
                disablePortal
                id="combo-box-demo"
                options={[allDeptOption, ...deptOptions]}
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
          <div style={{}}>
            <YearComponent
              currentYear={currentYear}
              setCurrentYear={setCurrentYear}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}

export default KpiReport;
