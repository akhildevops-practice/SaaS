import { useState, useEffect } from "react";
import {
  Box,
  CircularProgress,
  InputAdornment,
  TextField,
  Typography,
  Grid,
  FormControl,
} from "@material-ui/core";
import checkRoles from "utils/checkRoles";
import { roles } from "utils/enums";
import FilterDrawer from "components/FilterDrawer";
import SearchBar from "components/SearchBar";
import DatePicker from "components/DatePicker";
import CustomTableWithSort from "components/CustomTableWithSort";
import useStyles from "../NCSummary/styles";
import { Link, useNavigate } from "react-router-dom";
import SimplePaginationController from "components/SimplePaginationController";
import TableStatusAction from "components/TableStatusAction";
import { deleteNc, getNcSummary } from "apis/ncSummaryApi";
import { ncSummaryObservationType, ncSummarySchema } from "schemas/ncSummary";
import EmptyTableIcon from "assets/EmptyTableImg.svg";
import moment from "moment"; 
import checkRole from "utils/checkRoles";
import { useSnackbar } from "notistack";
import { Autocomplete } from "@material-ui/lab";
import { MdSearch } from 'react-icons/md';
import getAppUrl from "utils/getAppUrl";
import { getAllLocation } from "apis/locationApi";
import { getSystems, getSystemTypes } from "apis/systemApi";
import { getAllAuditors } from "apis/auditApi";
import { getAllClauses, ncTableSearch } from "apis/clauseApi";
import { useResetRecoilState } from "recoil";
import {
  auditeeSectionData,
  ncsForm,
  observationData,
} from "recoil/atom";
import getUserId from "utils/getUserId";
import { getUserInformation } from "apis/userApi";
// import axios from "axios";
import axios from "apis/axios.global";
import React from "react";
import ActionPoint from "../../NCSummary/Drawer/ActionPoint";
import "./tableStyles.css";
import getYearFormat from "utils/getYearFormat";
import YearComponent from "components/Yearcomponent";
import getSessionStorage from "utils/getSessionStorage";
/**
 * @description Headers to be used in the table listing columns
 */

const headers2 = [
  {
    title: "Title",
    field: "title",
    sortable: false,
  },
  {
    title: "NC Number",
    field: "ncNumber",
    sortable: true,
  },
  {
    title: "Department",
    field: "entity",
    sortable: false,
  },

  {
    title: "Created By",
    field: "createdBy",
    sortable: false,
  },

  {
    title: "Status",
    field: "status",
    sortable: true,
  },
];

const ncObsColumns = [
  {
    title: "NC Id",
    dataIndex: "ncObsId",
    key: "ncObsId",
    render: (ncObsId: any) => (
      <Link to={ncObsId.props.to} className="makeStyles-link-216">
        {ncObsId.props.children}
      </Link>
    ),
  },
  {
    title: "NC Date",
    dataIndex: "ncDate",
    key: "ncDate",
  },
  {
    title: "Entity",
    dataIndex: "entity",
    key: "entity",
  },
  {
    title: "Comments",
    dataIndex: "comment",
    key: "comment",
  },
  {
    title: "Audit Name",
    dataIndex: "auditName",
    key: "auditName",
  },
  {
    title: "Clause Number",
    dataIndex: "clauseNo",
    key: "clauseNo",
  },
  {
    title: "Severity",
    dataIndex: "severity",
    key: "severity",
    render: (severity: any) => (
      <span className="makeStyles-red__exclamation-217">
        {severity.props.children}
      </span>
    ),
  },
  {
    title: "System Name",
    dataIndex: "systemName",
    key: "systemName",
  },
  {
    title: "Auditor",
    dataIndex: "auditor",
    key: "auditor",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    // render: (status: any) => <span>{status.props.status}</span>,
  },
];

const subColumns = [
  {
    title: "Title",
    dataIndex: "title",
    key: "title",
  },
  {
    title: "NC Number",
    dataIndex: "ncNumber",
    key: "ncNumber",
  },
  {
    title: "Department",
    dataIndex: "entity",
    key: "entity",
  },
  {
    title: "Assignee",
    dataIndex: "assignee",
    key: "assignee",
    render: (assignee: any) => (
      <span>{assignee?.map((user: any) => user.username).join(", ")}</span>
    ),
  },
  {
    title: "Comments",
    dataIndex: "comments",
    key: "comments",
  },
  // {
  //   title: "Status",
  //   dataIndex: "status",
  //   key: "status",
  //   render: (status: any) => <span>{status.props.status}</span>,
  // },
];

/**
 * @description The key names to insert the data into the table
 */

const fields2 = ["title", "ncNumber", "entity", "createdBy", "status"];

/**
 * @description Functional component which generates the dashboard layout
 * @returns a react node
 */

type Props = {
  refelemetForActionItem2?: any;
  refelemetForActionItem3?: any;
  refelemetForActionItem4?: any;
  refelemetForActionItem5?: any;
  refelemetForActionItem6?: any;
  // refelemetForActionItem7?:any;
};

function ActionItemView({
  refelemetForActionItem2,
  refelemetForActionItem3,
  refelemetForActionItem4,
  refelemetForActionItem5,
  refelemetForActionItem6,
}: Props) {
  const userDetails = getSessionStorage();
  const isOrgAdmin = checkRoles(roles.ORGADMIN);
  const classes = useStyles();
  const [isLoading, setIsLoading] = useState(false);
  const [ncObsData, setNcObsData] = useState<ncSummarySchema[]>();
  const [actionPointData, setActionPointData] = useState<[]>();
  const [count, setCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(25);
  const [locationListing, setLocationListing] = useState<any>([]);
  const [systemListing, setSystemListing] = useState<any>([]);
  const [subSystemListing, setSubSystemListing] = useState<any>([]);
  const [clauses, setClauses] = useState<any>([]);
  const [auditorListing, setAuditorListing] = useState<any>([]);
  const realmName = getAppUrl();
  const resetAuditee = useResetRecoilState(auditeeSectionData);
  const resetObservation = useResetRecoilState(observationData);
  const resetSummary = useResetRecoilState(ncsForm);
  const userId: any = getUserId();
  const [searchValue, setSearchValue] = useState<any>({
    location: "",
    auditType: "",
    systemType: "",
    auditor: "",
    from: "",
    to: "",
    clause: "",
  });
  const [searchQuery, setsearchQuery] = useState<any>({
    searchQuery: "",
  });
  const [filterOpen, setFilterOpen] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const isAdmin = checkRole("admin");
  const isMR = checkRole("MR");
  const [dataid, setDataid] = useState("");
  const [activeTab, setActiveTab] = useState("1");
  const [auditYear, setCurrentYear] = useState<any>(new Date().getFullYear());
  const userInfo = JSON.parse(sessionStorage.getItem("userDetails") as string);
  const handleTabChange = (key: any) => {
    setActiveTab(key);
  };

  const [openActionPointDrawer, setOpenActionPointDrawer] = useState({
    open: false,
    edit: false,
    data: {},
  });
  const [locationNames, setLocationNames] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any>([
    { id: "All", locationName: "All" },
  ]);
  const [currentYear, setCurrentYearForYear] = useState<any>(
    new Date().getFullYear()
  );
  const allOption = { id: "All", locationName: "All" };
  const [myDept, setMyDept] = useState(true);

  const handleChangeList = (event: any, values: any) => {
    if (values.find((option: any) => option.id === "All")) {
      setSelectedLocation([allOption]);
    } else {
      setSelectedLocation(values.filter((option: any) => option.id !== "All"));
    }
  };

  // const handleActionPoint = () => {
  //   setOpenActionPointDrawer({
  //     open: true,
  //     data: {},
  //   });
  //   handleCloseMenu();
  // };
  const handleCloseMenu = () => {
    setAnchorEl(null);
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
  const getyearForYear = async () => {
    const currentyear = await getYearFormat(new Date().getFullYear());
    setCurrentYear(currentyear);
  };
  const handleOpenMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
    data: any
  ) => {
    setAnchorEl(event.currentTarget);
    // setSelectedData({ ...data })
  };

  const isLocAdmin = checkRole("LOCATION-ADMIN");

  /**
   * @method toggleLink
   * @description Function to create a link for enabling the redirection feature upon button click on a table entry
   * @param type {ncSummaryObservationType}
   * @param linkId {string}
   * @param id {string}
   * @returns a link which is used to redirect the user
   */

  const toggleLink = (
    type: ncSummaryObservationType,
    linkId: string,
    id: string
  ) => {
    if (type === "NC") {
      return (
        <Link to={`/audit/nc/${linkId}`} className={classes.link}>
          {id}
        </Link>
      );
    }
    return (
      <Link to={`/audit/obs/${linkId}`} className={classes.link}>
        {id}
      </Link>
    );
  };

  /**
   * @method dataParser
   * @description Function to parse data and display it inside the table
   * @param data {any}
   * @returns the parsed table data
   */

  const handleClickDiscard = () => {
    setIsLoading(true);
    setsearchQuery({
      ...searchQuery,
      searchQuery: "",
    });
    getNcSummary(auditYear, myDept, 0, limit, "", "", "", "", "", "", "")
      .then((response: any) => {
        const parsedData = dataParser(response?.data?.nc);
        setCount(response?.data?.count);
        setPage(1);
        setNcObsData(parsedData);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log("error message - ", error);
        enqueueSnackbar(error.message, {
          variant: "error",
        });
        setIsLoading(false);
      });
  };

  const dataParser: any = (data: any) => {
    return data?.map((nc: any) => {
      const isUserAuditee = nc.audit.auditees.some(
        (auditee: any) => auditee.id === userInfo?.id
      );
      const isUserInAuditedEntity = nc.audit.auditedEntity.users.some(
        (user: any) => user.id === userInfo?.id
      );

      console.log("isUserAuditedEntity", isUserInAuditedEntity);
      return {
        ncObsId: toggleLink(nc.type, nc._id, nc.id),
        comment: nc.comment ?? "-",
        entity: nc.audit.auditedEntity.entityName,
        ncDate: moment(nc.createdAt).format("DD-MM-YYYY"),
        auditName: nc.audit.auditName,
        clauseNo: nc?.clause[0]?.clauseNumber ?? "-",
        severity:
          nc.severity === "Major" ? (
            <>
              Major&nbsp;<span className={classes.red__exclamation}>!</span>
            </>
          ) : (
            nc.severity
          ),
        systemName: nc?.audit?.system?.type?.name,
        auditor: nc?.audit?.auditors[0]?.email,
        status: (
          <TableStatusAction
            status={nc.status}
            handleEdit={() => {
              if (nc.type === "NC") {
                navigate(`/audit/nc/${nc._id}`, { state: { edit: true } });
              } else {
                navigate(`/audit/obs/${nc._id}`, { state: { edit: true } });
              }
            }}
            // Conditionally pass handleActionPoint prop
            {...(isUserAuditee || isUserInAuditedEntity
              ? {
                  handleActionPoint: () => {
                    setDataid(nc._id);
                    setOpenActionPointDrawer({
                      open: true,
                      edit: false,
                      data: {},
                    });
                    handleCloseMenu();
                  },
                }
              : {})}
            handleDelete={() => {
              deleteNc(nc._id)
                .then((response: any) => {
                  enqueueSnackbar("Deleted nc entry successfully!", {
                    variant: "success",
                  });
                  getTableData();
                })
                .catch((error: any) => {
                  console.log("error");
                  enqueueSnackbar("Something went wrong!", {
                    variant: "error",
                  });
                });
            }}
            enableDelete={isMR || isLocAdmin}
          />
        ),
      };
    });
  };
  const getyear = async () => {
    const currentyear = await getYearFormat(new Date().getFullYear());
    setCurrentYearForYear(currentyear);
  };
  /**
   * @method sortTable
   * @description Function to sort table entries when the sort icon is clicked
   * @param field {string}
   * @param order {string}
   * @returns nothing
   */
  const sortTable = (field: string, order: string) => {
    getNcSummary(
      auditYear,
      myDept,
      0,
      limit,
      searchValue.location,
      searchValue.auditType,
      searchValue.auditor,
      searchValue.systemType,
      searchValue.from,
      searchValue.to,
      searchValue.clause,
      `${field}:${order}`
    )
      .then((response: any) => {
        const parsedData = dataParser(response?.data?.nc);
        setNcObsData(parsedData);
        setIsLoading(false);
        setCount(response?.data?.count);
      })
      .catch((error) => {
        console.log("error message - ", error);
        enqueueSnackbar(error.message, {
          variant: "error",
        });
      });
  };

  /**
   * @method getTableData
   * @description Function to fetch table entries from the backend
   * @param locationId {string}
   * @returns nothing
   */
  const getTableData = (locationId: string = "") => {
    const loc: any = locationId === "" ? searchValue.location : locationId;

    getNcSummary(
      auditYear,
      myDept,
      0,
      limit,
      loc,
      searchValue.auditType,
      searchValue.auditor,
      searchValue.systemType,
      searchValue.from,
      searchValue.to,
      searchValue.clause
    )
      .then((response: any) => {
        const parsedData = dataParser(response?.data?.nc);
        setPage(1);
        setNcObsData(parsedData);
        setIsLoading(false);
        setCount(response?.data?.count);
      })
      .catch((error) => {
        console.log("error message - ", error);
        enqueueSnackbar(error.message, {
          variant: "error",
        });
      });
  };

  const getActionPointData = async () => {
    console.log("inside action point");
    try {
      const res = await axios.get("/api/audits/getAllNcAp");

      const data = res.data.map((item: any) => {
        const isUserAssignee = item.assignee.some(
          (item: any) => item.id === userInfo?.id
        );
        console.log("Item", item);

        const isUserEntityHead = item.entityHead === userInfo?.id;

        return {
          id: item.id,
          ncId: item.ncId,
          ncDate: item.ncDate,
          ncNumber: item.ncNumber,
          createdBy: item.createdBy,
          title: item.title,
          organizationId: item.organizationId,
          description: item.description,
          comments: item.comments,
          createdAt: item.createdAt,
          assignee: item.assignee,
          entity: item.entity,
          status:
            isUserAssignee || isUserEntityHead ? (
              <TableStatusAction
                status={item.status}
                handleEdit={() => {
                  setDataid(item.id);
                  setOpenActionPointDrawer({
                    open: true,
                    edit: true,
                    data: {},
                  });
                  handleCloseMenu();
                }}
                handleDelete={async () => {
                  try {
                    await axios.delete(
                      `/api/audits/deleteNcActionPointByID/${item.id}`
                    );
                    enqueueSnackbar("Deleted nc action point successfully!", {
                      variant: "success",
                    });
                    // getTableData();
                    getActionPointData();
                  } catch (error) {
                    console.error(error);
                    enqueueSnackbar("Something went wrong!", {
                      variant: "error",
                    });
                  }
                }}
              />
            ) : (
              item.status
            ),
        };
      });

      setActionPointData(data);
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Error fetching data!", {
        variant: "error",
      });
    }
  };

  const handleTableSearch = async () => {
    setCount(0);
    const userInfo = await axios.get("/api/user/getUserInfo");

    const { organizationId: organization } = userInfo?.data;
    ncTableSearch(searchQuery?.searchQuery, organization, 0, limit)
      .then((response: any) => {
        const parsedData = dataParser(response?.data?.nc);
        setPage(1);
        setNcObsData(parsedData);
        setIsLoading(false);
        setCount(response?.data?.count);
      })
      .catch((error: any) => {
        console.log("error response - ", error);
        setIsLoading(false);
      });
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
    });
    return systemTypes;
  };

  /**
   * @method parseSystemType
   * @description Function to parse audit type for listing it out on the typeahead filter
   * @param data {any}
   * @returns nothing
   */
  const parseSystemType = (data: any) => {
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
   * @method parseSubSystemTypes
   * @description Function to parse system types for listing it out on the typeahead filter
   * @param data {any}
   * @returns nothing
   */
  const parseSubSystemTypes = (data: any) => {
    const systemTypes: any = [];
    data?.map((item: any) => {
      systemTypes.push({
        name: item?.name,
        value: item?._id,
      });
    });
    return systemTypes;
  };

  const handleSearchChange = (e: any) => {
    e.preventDefault();
    setsearchQuery({
      ...searchQuery,
      [e.target.name]: e.target.value,
    });
  };
  /**
   * @method parseClauses
   * @description Function to parse clauses when a sub system type is selected
   * @param data {any}
   * @returns nothing
   */
  const parseClauses = (data: any) => {
    const clauseList: any = [];
    data?.map((item: any) => {
      clauseList.push({
        name: item?.number,
        value: item?._id,
      });
    });
    return clauseList;
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
        setSystemListing(parseSystemType(response?.data));
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
   * @method getClauses
   * @description Function to fetch all clauses when a system type is selected
   * @param id {string}
   * @returns nothing
   */
  const getClauses = (id: string) => {
    getAllClauses(id).then((response: any) => {
      setClauses(parseClauses(response?.data?.clauses));
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
      setSubSystemListing(parseSubSystemTypes(response?.data));
    });
  };

  /**
   * @method handleDateChange
   * @description Function to handle data changes when the date field changes
   * @param e any
   * @returns nothing
   */
  const handleDateChange = (e: any) => {
    if (e.target.name === "documentStartDate") {
      setSearchValue({
        ...searchValue,
        from: new Date(`${e.target.value}`).toISOString(),
      });
    } else {
      setSearchValue({
        ...searchValue,
        to: new Date(`${e.target.value}`).toISOString(),
      });
    }
  };

  /**
   * @method handleApply
   * @description Function to apply filters and refetch table data according to that
   * @returns nothing
   */
  const handleApply = () => {
    setIsLoading(true);
    getNcSummary(
      auditYear,
      myDept,
      0,
      limit,
      searchValue.location ?? "",
      searchValue.auditType,
      searchValue.auditor,
      searchValue.systemType,
      searchValue.from,
      searchValue.to,
      searchValue.clause
    )
      .then((response: any) => {
        const parsedData = dataParser(response?.data?.nc);
        setCount(response?.data?.count);
        setPage(1);
        setNcObsData(parsedData);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log("error message - ", error);
        enqueueSnackbar(error.message, {
          variant: "error",
        });
        setIsLoading(false);
      });
  };

  /**
   * @method changePage
   * @description Function to change the page on the pagination controller
   * @param pageNumber {number}
   * @returns nothing
   */
  const changePage = (pageNumber: number) => {
    getNcSummary(auditYear, myDept, limit * (pageNumber - 1), limit)
      .then((response: any) => {
        const parsedData = dataParser(response?.data?.nc);
        setNcObsData(parsedData);
        setIsLoading(false);
        setPage(pageNumber);
      })
      .catch((error) => {
        console.log("error message - ", error);
        enqueueSnackbar(error.message, {
          variant: "error",
        });
      });
  };

  /**
   * @method handleDiscard
   * @description Function to discard all search values from the filters
   * @returns nothing
   */
  const handleDiscard = () => {
    setIsLoading(true);
    setSearchValue({
      location: "",
      auditType: "",
      systemType: "",
      auditor: "",
      from: "",
      to: "",
      clause: "",
    });
    getNcSummary(auditYear, myDept, 0, limit, "", "", "", "", "", "", "")
      .then((response: any) => {
        const parsedData = dataParser(response?.data?.nc);
        setCount(response?.data?.count);
        setPage(1);
        setNcObsData(parsedData);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log("error message - ", error);
        enqueueSnackbar(error.message, {
          variant: "error",
        });
        setIsLoading(false);
      });
  };

  /**
   * @method getUserData
   * @description Function to get all user information based on id
   * @returns nothing
   */
  const getUserDataBasedOnLocation = (id: string) => {
    getUserInformation(id)
      .then((response: any) => {
        setSearchValue({
          ...searchValue,
          location: response?.data?.locationId,
        });
        return response?.data?.locationId;
      })
      .then((locResponse: any) => {
        getTableData(locResponse ?? "");
        getActionPointData();
      });
  };

  useEffect(() => {
    getLocationNames();
    if (!isAdmin) {
      getyear();
      resetAuditee();
      resetSummary();
      resetObservation();
      getUserDataBasedOnLocation(userId);
      setIsLoading(true);
      getAllLocations();
      getAllSystemTypes(realmName);
      getAuditors(realmName);
      getyear();
      getyearForYear();
    }
  }, []);
  useEffect(() => {
    getyear();

    if (!isOrgAdmin) {
      setSelectedLocation([
        {
          id: userDetails?.location?.id,
          locationName: userDetails?.location?.locationName,
        },
      ]);
    }
  }, [locationNames]);

  console.log("ncobsData", ncObsData, actionPointData);

  // const tabs = [
  //   {
  //     label: "List of Findings",
  //     key: 1,
  //     children: (
  //       <>
  //         <Box className={classes.searchContainer}>
  //           <Box display="flex" alignItems="center" justifyContent="flex-end">
  //             <SearchBar
  //               placeholder="Search"
  //               name="searchQuery"
  //               values={searchQuery}
  //               handleChange={handleSearchChange}
  //               handleApply={handleTableSearch}
  //               endAdornment={true}
  //               handleClickDiscard={handleClickDiscard}
  //             />
  //           </Box>
  //         </Box>
  //         {isLoading ? (
  //           <Box
  //             marginY="auto"
  //             display="flex"
  //             justifyContent="center"
  //             alignItems="center"
  //             height="40vh"
  //           >
  //             <CircularProgress />
  //           </Box>
  //         ) : ncObsData && ncObsData.length > 0 ? (
  //           <div className={classes.topContainer}>
  //             {/* <CustomTableWithSort
  //               headers={headers}
  //               fields={fields}
  //               data={ncObsData}
  //               sortFunction={sortTable}
  //             />
  //             <SimplePaginationController
  //               count={count}
  //               page={page}
  //               rowsPerPage={limit}
  //               handleChangePage={changePage}
  //             /> */}
  //             {/* <div className={classes.root}> */}
  //             <Table
  //               className={classes.tableContainer}
  //               rowClassName={() => "editable-row"}
  //               bordered
  //               dataSource={ncObsData}
  //               columns={ncObsColumns}
  //               pagination={false}
  //               expandable={{
  //                 expandedRowRender: (record: any) => {
  //                   const matchingActionPoints = actionPointData?.filter(
  //                     (ap: any) =>
  //                       ap.ncNumber === record?.ncObsId?.props?.children
  //                   );
  //                   console.log(
  //                     "what is this MRM record",
  //                     record,
  //                     matchingActionPoints
  //                   );
  //                   return (
  //                     <Table
  //                       className={classes.subTableContainer}
  //                       style={{ width: 900, paddingBottom: "20px" }}
  //                       columns={subColumns}
  //                       bordered
  //                       dataSource={matchingActionPoints}
  //                       pagination={false}
  //                     />
  //                   );
  //                 },
  //               }}
  //               // scroll={{ x: 700, }}
  //             />

  //             {/* <Table
  //             // ... other attributes
  //             columns={actionPointColumns}
  //             // ... other attributes
  //           /> */}
  //             {/* </div> */}
  //           </div>
  //         ) : (
  //           <Box
  //             width="100%"
  //             display="flex"
  //             flexDirection="column"
  //             justifyContent="center"
  //             alignItems="center"
  //             pt={4}
  //           >
  //             <img src={EmptyTableIcon} alt="No table found" height={400} />
  //             <Typography variant="body2" color="textSecondary">
  //               No NC/Observation table found.
  //             </Typography>
  //           </Box>
  //         )}
  //       </>
  //     ),
  //   },
  //   {
  //     label: "Action Point",
  //     key: 2,
  //     children: (
  //       <>
  //         {isLoading ? (
  //           <Box
  //             marginY="auto"
  //             display="flex"
  //             justifyContent="center"
  //             alignItems="center"
  //             height="40vh"
  //           >
  //             <CircularProgress />
  //           </Box>
  //         ) : actionPointData && actionPointData.length > 0 ? (
  //           <div className={classes.topContainer}>
  //             <CustomTableWithSort
  //               headers={headers2}
  //               fields={fields2}
  //               data={actionPointData}
  //               sortFunction={sortTable}
  //             />
  //             <SimplePaginationController
  //               count={count}
  //               page={page}
  //               rowsPerPage={limit}
  //               handleChangePage={changePage}
  //             />
  //           </div>
  //         ) : (
  //           <Box
  //             width="100%"
  //             display="flex"
  //             flexDirection="column"
  //             justifyContent="center"
  //             alignItems="center"
  //             pt={4}
  //           >
  //             <img src={EmptyTableIcon} alt="No table found" height={400} />
  //             <Typography variant="body2" color="textSecondary">
  //               No NC/Observation table found.
  //             </Typography>
  //           </Box>
  //         )}
  //       </>
  //     ),
  //   },
  // ];

  return (
    <>
      <div className={classes.root}>
        {openActionPointDrawer.open && (
          <ActionPoint
            openActionPointDrawer={openActionPointDrawer}
            setOpenActionPointDrawer={setOpenActionPointDrawer}
            getActionPointData={getActionPointData}
            dataid={dataid}
          />
        )}
        <div className={classes.rootContainer}>
          <FilterDrawer
            open={filterOpen}
            setOpen={setFilterOpen}
            resultText={
              count ? `Showing ${count} Result(s)` : `No Results Found`
            }
            handleApply={handleApply}
            handleDiscard={handleDiscard}
          >
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
                  placeholder="By Location"
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
              options={systemListing}
              size="small"
              onChange={(e: any, value: any) => {
                getAllSubSystemTypes(value?.value);
                setSearchValue({
                  ...searchValue,
                  auditType: value?.value,
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
                  placeholder="By Audit Type"
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
              options={subSystemListing}
              size="small"
              onChange={(e: any, value: any) => {
                getClauses(value?.value);
                setSearchValue({
                  ...searchValue,
                  systemType: value?.value,
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
                  placeholder="By System Type"
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
                  placeholder="By Auditor"
                  variant="outlined"
                  size="small"
                />
              )}
            />
            <div style={{ height: "10px" }} />

            <DatePicker
              dateFields={handleDateChange}
              searchValues={searchValue}
            />
            <Autocomplete
              style={{
                background: "white",
                borderRadius: "6px",
                outline: "none",
              }}
              disabled={false}
              fullWidth
              id="combo-box-demo"
              options={clauses}
              size="small"
              onChange={(e: any, value: any) => {
                setSearchValue({
                  ...searchValue,
                  clause: value?.value,
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
                  placeholder="By Clause Number"
                  variant="outlined"
                  size="small"
                />
              )}
            />
            <div style={{ height: "10px" }} />
          </FilterDrawer>
          <>
            <Grid item xs={12}>
              <Box className={classes.searchContainer}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  {/* Left Side */}
                  <Grid container alignItems="center">
                    {/* Location Box */}
                    <Grid item xs={6} md={3}>
                      <div
                        className={classes.locSearchBox}
                        ref={refelemetForActionItem2}
                      >
                        <FormControl variant="outlined" size="small" fullWidth>
                          <Autocomplete
                            multiple
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
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="outlined"
                                size="small"
                                label="Location"
                                fullWidth
                              />
                            )}
                          />
                        </FormControl>
                      </div>
                    </Grid>
                    {/* Year Component */}
                    <Grid item xs={6} md={3}>
                      <div ref={refelemetForActionItem3}>
                        <YearComponent
                          currentYear={currentYear}
                          setCurrentYear={setCurrentYearForYear}
                        />
                      </div>
                    </Grid>
                  </Grid>

                  {/* Right Side */}
                  <Box display="flex" alignItems="center">
                    <SearchBar
                      placeholder="Search"
                      name="searchQuery"
                      values={searchQuery}
                      handleChange={handleSearchChange}
                      handleApply={handleTableSearch}
                      endAdornment={true}
                      handleClickDiscard={handleClickDiscard}
                    />
                  </Box>
                </Box>
              </Box>
            </Grid>
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
            ) : actionPointData && actionPointData.length > 0 ? (
              <div className={classes.topContainer}>
                <CustomTableWithSort
                  headers={headers2}
                  fields={fields2}
                  data={actionPointData}
                  sortFunction={sortTable}
                />
                <SimplePaginationController
                  count={count}
                  page={page}
                  rowsPerPage={limit}
                  handleChangePage={changePage}
                />
              </div>
            ) : (
              <Box
                width="100%"
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                pt={4}
              >
                <img src={EmptyTableIcon} alt="No table found" height={400} />
                <Typography variant="body2" color="textSecondary">
                  No NC/Observation table found.
                </Typography>
              </Box>
            )}
          </>
        </div>
      </div>
    </>
  );
}

export default ActionItemView;
