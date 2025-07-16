import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  Fab,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@material-ui/core";
import GraphComponent from "../../../components/GraphComponent";
import ReloadIcon from "../../../assets/icons/Reload.svg";
import { MdFilterList } from 'react-icons/md';
import FilterDrawer from "../../../components/FilterDrawer";
import SearchBar from "../../../components/SearchBar";
import CustomTable from "../../../components/CustomTable";
import {
  Alignment,
  Axis,
  ChartType,
  filterFields,
  Position,
} from "../../../utils/enums";
import SimplePaginationController from "../../../components/SimplePaginationController";
import PopularTags from "../../../components/PopularTags";
import DatePicker from "../../../components/DatePicker";
import { useStyles } from "./styles";
import axios from "../../../apis/axios.global";
import getAppUrl from "../../../utils/getAppUrl";
import { currentOrg } from "../../../recoil/atom";
import { useSetRecoilState } from "recoil";
import checkRole from "../../../utils/checkRoles";
import { MdSearch } from 'react-icons/md';
import { Autocomplete } from "@material-ui/lab";
import { getAllLocation } from "../../../apis/locationApi";
import { getAllEntities } from "../../../apis/entityApi";
import { getSystemTypes } from "../../../apis/systemApi";
import {
  fetchFinancialyear,
  getNcGraphData,
  ncTableSearch,
} from "../../../apis/dashboardApi";
import { getNcSummary } from "../../../apis/ncSummaryApi";
import MultiUserDisplay from "../../../components/MultiUserDisplay";
import { Link } from "react-router-dom";
import moment from "moment";
import EmptyTableImg from "../../../assets/EmptyTableImg.svg";

const Colors = ["#1E88E5", "#E15770", "#FF6B17", "#FFE48A"];
const colors = [
  "#1E88E5",
  "#FFBC34",
  "rgba(192, 192, 192, 1)",
  "rgba(225, 87, 112, 1)",
  "rgba(81, 89, 98, 1)",
  "rgba(225, 87, 112, 1)",
];

const pieColors = [
  "#0E0A42",
  "#FFE48A",
  "#006064",
  "#00ACC1",
  "#1E88E5",
  "#515962",
  "#64FFDA",
  "#C0C0C0",
  "#E15770",
  "#FF6B17",
  "#FFBC34",
];

const tableHeaders = [
  "Type",
  "NC No.",
  "System Name",
  "Clause No.",
  "Auditor",
  "Auditee",
  "NC Status",
  "Open Date",
  "Closed Date",
  "Entity",
  "Location",
];

const tableFields = [
  "type",
  "ncNo",
  "systemName",
  "clauseNumber",
  "auditor",
  "auditee",
  "ncStatus",
  "openDate",
  "closeDate",
  "entity",
  "location",
];

type Props = {};

/**
 * @type GraphState
 * @description Interface for storing chart and entity table data
 */
type GraphState = {
  ncObsType: any;
  ncType: any;
  ncAgeAnalysis: any;
  topClauses: any;
  entityData: any;
};

/**
 * @description Functional component which generates the dashboard layout
 * @returns a react node
 */
function Dashboard({}: Props) {
  const classes = useStyles();
  const isAdmin = checkRole("admin");
  const [count, setCount] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [locationListing, setLocationListing] = useState([]);
  const [entityListing, setEntityListing] = useState([]);
  const [auditListing, setAuditListing] = useState([]);
  const [tableData, setTableData] = useState<any>([]);
  const [docTypeData, setDocTypeData] = useState<any>();
  const [docStatusData, setDocStatusData] = useState<any>();
  const [tags, setTags] = useState<any>([]);
  const [accessData, setAccessData] = useState<any>();
  const [userId, setUserId] = useState<string>();
  const [skip, setSkip] = useState<any>(0);
  const [limit, setLimit] = useState<any>(25);
  const [userLocation, setUserLocation] = useState<any>();
  const [graphState, setGraphState] = useState<GraphState>();
  const [orgId, setOrgId] = useState<any>();
  const [financialYear, setFinancialYear] = useState<any>();
  const [myDept, setMyDept] = useState(true);
  const [searchPlaceholder, setSearchPlaceholder] = useState<any>({
    location: "",
    financialYear: "",
    entity: "",
    auditType: "",
    from: "",
    to: "",
    clause: "",
  });
  const [searchValues, setSearch] = useState<any>({
    location: "",
    financialYear: "",
    entity: "",
    auditType: "",
    from: "",
    to: "",
    clause: "",
    documentStartDate: "",
    documentEndDate: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [tableLoader, setTableLoader] = useState(false);
  const [discard, setDiscard] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const setOrgName = useSetRecoilState(currentOrg);
  const realmName = getAppUrl();
  const isOrgAdmin = checkRole("ORG-ADMIN");
  const isMR = checkRole("MR");
  const isLocationAdmin = checkRole("LOCATION-ADMIN");
  const [searchQuery, setSearchQuery] = useState<any>({
    searchQuery: "",
  });
  const [filterCount, setFilterCount] = useState<any>();
  const [chartParams, setChartParams] = useState<any>({
    type: "",
    status: "",
    from: "",
    to: "",
  });
  const [graphId, setGraphId] = useState({
    ncObsType: [] as object[],
    ncType: {
      location: [] as object[],
      // system: [] as object[],
    },
  });

  /**
   * @method handleChangePage
   * @description Function to handle page changes via the pagination controller
   * @param page {any}
   * @returns nothing
   */
  const handleChangePage = (page: any) => {
    setPage(page);
    setSkip((page - 1) * limit);
    getTableData((page - 1) * limit);
  };

  /**
   * @method handleTableSearch
   * @description Function to perform table search via the search field and change the data displayed on the table accordingly
   * @returns nothing
   */
  const handleTableSearch = () => {
    setTableLoader(true);
    setSkip(0);
    ncTableSearch(searchQuery?.searchQuery, orgId, 0, limit)
      .then((response: any) => {
        const parsedData = dataParser(response?.data?.nc);
        setTableData(parsedData);
        setCount(response?.data?.count);
        setTableLoader(false);
      })
      .catch((error: any) => {
        console.log("error response - ", error);
        setTableLoader(false);
      });
  };

  /**
   * @method handleSearchChange
   * @description Function to handle search field changes
   * @param e {any}
   * @returns nothing
   */
  const handleSearchChange = (e: any) => {
    e.preventDefault();
    setSearchQuery({
      ...searchQuery,
      [e.target.name]: e.target.value,
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
      setSearch({
        ...searchValues,
        from: new Date(`${e.target.value}`).toISOString(),
        documentStartDate: `${e.target.value}`,
      });
    } else {
      setSearch({
        ...searchValues,
        to: moment(new Date(`${e.target.value}`))
          .add(1, "days")
          .toISOString(),
        documentEndDate: `${e.target.value}`,
      });
    }
  };

  /**
   * @method handleApply
   * @description Function to apply all the filters from the filter drawer and perform a data fetch request
   */
  const handleApply = () => {
    fetchChartWithFilters();
    getNcSummary(
      financialYear,
      myDept,
      0,
      limit,
      searchValues.location ?? "",
      searchValues.auditType,
      searchValues.auditor,
      "",
      searchValues.from,
      searchValues.to,
      "",
      "",
      "",
      "",
      searchValues.entity,
      searchValues.financialYear
    )
      .then((response: any) => {
        const parsedData = dataParser(response?.data?.nc);
        setTableData(parsedData);
        setIsLoading(false);
        setCount(response?.data?.count);
        setPage(1);
      })
      .catch((error) => {
        console.log("error message - ", error);
        setIsLoading(false);
      });
  };

  /**
   * @method fetchEntityListing
   * @description Function to fetch entity listing
   * @returns nothing
   */
  const fetchEntityListing = () => {
    getAllEntities().then((response: any) => {
      const parsedEntity = parseEntity(response?.data);
      setEntityListing(parsedEntity);
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
   * @method parseEntity
   * @description Function to parse entity
   * @param data {any}
   * @returns an array of entity types
   */
  const parseEntity = (data: any) => {
    const entityTypes: any = [];
    data?.map((item: any) => {
      entityTypes.push({
        name: item?.entityName,
        value: item?.id,
      });
    });
    return entityTypes;
  };

  /**
   * @method parseAuditTypes
   * @description Function to parse audit types
   * @param data {any}
   * @returns nothing
   */
  const parseAuditTypes = (data: any) => {
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
   * @method fetchAllLocation
   * @description Function to fetch all location
   * @returns a list of location
   */
  const fetchAllLocation = () => {
    getAllLocation(realmName).then((response: any) => {
      const parsedResponse = parseLocation(response?.data);
      setLocationListing(parsedResponse);
    });
  };

  /**
   * @method getAuditTypes
   * @description Function to fetch all system types
   * @param realm {string}
   * @returns nothing
   */
  const getAuditTypes = (realm: string) => {
    getSystemTypes(realm).then((response: any) => {
      const parsedAuditTypes = parseAuditTypes(response?.data);
      setAuditListing(parsedAuditTypes);
    });
  };

  /**
   * @method fetchAllDocuments
   * @description Function to fetch all documents
   * @returns nothing
   */
  const fetchAllDocuments = () => {};

  /**
   * @method handleChartDataClick
   * @description Function to perform a data fetch request when any of the chart sections is clicked (including the tables)
   * @param data {any}
   * @returns nothing
   */
  const handleChartDataClick = (data: any) => {
    setSkip(0);
    setTableLoader(true);
    if (data.chartType === ChartType.PIE) {
      getNcSummary(
        financialYear,
        myDept,
        0,
        limit,
        userLocation ?? "",
        searchValues.auditType,
        "",
        "",
        searchValues.from,
        searchValues.to,
        "",
        "",
        data.value,
        "",
        searchValues.entity,
        searchValues.financialYear
      )
        .then((response: any) => {
          setChartParams((prev: any) => {
            return {
              ...prev,
              type: data.value,
              status: "",
            };
          });
          const parsedData = dataParser(response?.data?.nc);
          setTableData(parsedData);
          setCount(response?.data?.count);
          setPage(1);
          setTableLoader(false);
        })
        .catch((error) => {
          console.log("error message - ", error);
          setTableLoader(false);
        });
    } else {
      setChartParams((prev: any) => {
        return {
          ...prev,
          status: data?.value?.toUpperCase(),
          type: "NC",
        };
      });

      //Sections for NC Age analysis
      if (data.location === "<15") {
        getNcSummary(
          financialYear,
          myDept,
          0,
          limit,
          userLocation ?? "",
          searchValues.auditType,
          "",
          "",
          moment().subtract(15, "days").toISOString() || "",
          moment().toISOString() || "",
          "",
          "",
          "NC",
          data.value.toUpperCase(),
          searchValues.entity,
          searchValues.financialYear
        )
          .then((response: any) => {
            setSearch((prev: any) => {
              return {
                ...prev,
                from: moment().subtract(15, "days").toISOString(),
                to: moment().toISOString(),
              };
            });
            const parsedData = dataParser(response?.data?.nc);
            setTableData(parsedData);
            setPage(1);
            setCount(response?.data?.count);
            setTableLoader(false);
          })
          .catch((error) => {
            console.log("error message - ", error);
            setTableLoader(false);
          });
        return;
      }
      if (data.location === "<30") {
        setSearch((prev: any) => {
          return {
            ...prev,
            from: moment().subtract(30, "days").toISOString(),
            to: moment().subtract(15, "days").toISOString(),
          };
        });
        getNcSummary(
          financialYear,
          myDept,
          0,
          limit,
          userLocation ?? "",
          "",
          "",
          "",
          moment().subtract(30, "days").toISOString() || "",
          moment().subtract(15, "days").toISOString() || "",
          "",
          "",
          "NC",
          data.value.toUpperCase()
        )
          .then((response: any) => {
            const parsedData = dataParser(response?.data?.nc);

            setTableData(parsedData);
            setPage(1);
            setCount(response?.data?.count);
            setTableLoader(false);
          })
          .catch((error) => {
            setTableLoader(false);
          });
        return;
      }
      if (data.location === "<60") {
        setSearch((prev: any) => {
          return {
            ...prev,
            from: moment().subtract(60, "days").toISOString(),
            to: moment().subtract(30, "days").toISOString(),
          };
        });
        getNcSummary(
          financialYear,
          myDept,
          0,
          limit,
          userLocation ?? "",
          "",
          "",
          "",
          moment().subtract(60, "days").toISOString() || "",
          moment().subtract(30, "days").toISOString() || "",
          "",
          "",
          "NC",
          data.value.toUpperCase()
        )
          .then((response: any) => {
            const parsedData = dataParser(response?.data?.nc);
            setTableData(parsedData);
            setPage(1);
            setCount(response?.data?.count);
            setTableLoader(false);
          })
          .catch((error) => {
            setTableLoader(false);
          });
        return;
      }
      if (data.location === ">60") {
        setSearch((prev: any) => {
          return {
            ...prev,
            from: "",
            to: moment().subtract(60, "days").toISOString(),
          };
        });
        getNcSummary(
          financialYear,
          myDept,
          0,
          limit,
          userLocation ?? "",
          searchValues.auditType,
          "",
          "",
          "",
          moment().subtract(60, "days").toISOString() || "",
          "",
          "",
          "NC",
          data.value.toUpperCase()
        )
          .then((response: any) => {
            const parsedData = dataParser(response?.data?.nc);
            setTableData(parsedData);
            setPage(1);
            setCount(response?.data?.count);
            setTableLoader(false);
          })
          .catch((error) => {
            console.log("error message - ", error);
            setTableLoader(false);
          });
        return;
      }

      //Section for NC Type chart
      const location: any = graphId?.ncType?.location?.filter(
        (item: any) => item?.label === data?.location
      )[0];
      getNcSummary(
        financialYear,
        myDept,
        0,
        limit,
        location?.id ?? "",
        searchValues.auditType,
        "",
        "",
        searchValues.from,
        searchValues.to,
        "",
        "",
        "NC",
        data.value.toUpperCase(),
        searchValues.entity,
        searchValues.financialYear
      )
        .then((response: any) => {
          const parsedData = dataParser(response?.data?.nc);
          setTableData(parsedData);
          setPage(1);
          setTableLoader(false);
          setCount(response?.data?.count);
        })
        .catch((error) => {
          console.log("error message - ", error);
          setTableLoader(false);
        });
    }
  };

  /**
   * @method handleDiscard
   * @description Function to clear all the existing filters and re-fetch the default table and charts data
   * @returns nothing
   */
  const handleDiscard = () => {
    setDiscard(!discard);
    setSearch({
      location: "",
      financialYear: "",
      entity: "",
      auditType: "",
      from: "",
      to: "",
    });
    setChartParams({
      type: "",
      status: "",
      from: "",
      to: "",
    });
    setSearchPlaceholder({
      location: "",
      financialYear: "",
      entity: "",
      auditType: "",
      from: "",
      to: "",
      clause: "",
    });
    getTableData(0, limit);
  };

  /**
   * @method handleClickDiscard
   * @description Function which is invoked when the cross button of the search field is clicked that is located on top of the table
   * @returns nothing
   */
  const handleClickDiscard = () => {
    setSearchQuery({
      ...searchQuery,
      searchQuery: "",
    });
    getTableData(skip, limit);
  };

  /**
   * @method tagsClickHandler
   * @description Function to fetch data when a popular tag is clicked
   * @param value {string}
   * @returns nothing
   */
  const tagsClickHandler = (value: string) => {
    setIsLoading(true);
    setSearch({
      ...searchValues,
      clause: value,
    });
    getNcSummary(
      financialYear,
      myDept,
      0,
      limit,
      "",
      "",
      "",
      "",
      "",
      "",
      value,
      ""
    )
      .then((response: any) => {
        const parsedData = dataParser(response?.data?.nc);
        setTableData(parsedData);
        setCount(response?.data?.count);
        setPage(1);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log("error message - ", error);
        setIsLoading(false);
      });
  };

  /**
   * @method getOrgName
   * @description Function to fetch the organization name and store it inside a state
   * @returns nothing
   */
  const getOrgName = async () => {
    try {
      const res = await axios.get(`api/organization/${realmName}`);
      setOrgName(res.data.organizationName);
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * @method parseChart
   * @description Function to parse chart data
   * @param graphData {any}
   * @param chartType {string}
   * @returns nothing
   */
  const parseChart = (graphData: any, chartType: string) => {
    if (chartType === "pie") {
      return {
        labels: graphData?.data?.labels,
        datasets: [
          {
            data: graphData?.data?.dataset,
            backgroundColor: colors,
          },
        ],
      };
    } else if (chartType === "bar") {
      if (typeof graphData?.data?.labels?.[0] === "object") {
        setGraphId((prev: any) => {
          return {
            ...prev,
            ncType: {
              location: [...graphData?.data?.labels],
            },
          };
        });
      }
      return {
        labels:
          typeof graphData?.data?.labels?.[0] === "object"
            ? graphData?.data?.labels?.map((label: any) => label?.label)
            : graphData?.data?.labels,
        datasets: graphData?.data?.datasets?.map((item: any, index: number) => {
          return {
            ...item,
            backgroundColor: index % 2 === 0 ? "#FFBC34" : "#5EE51E",
          };
        }),
      };
    } else if (chartType === "tag") {
      return {
        labels: graphData?.data?.data?.labels,
        count: graphData?.data?.totalCount,
      };
    }
  };

  /**
   * @method parseTopClauses
   * @description Function to parse all the data which will be displayed on the top clauses section
   * @param data {any}
   * @returns array of objects containing the labelled data
   */
  const parseTopClauses = (data: any) => {
    return data?.data?.labels;
  };

  /**
   * @method fetchChartWithFilters
   * @description Fetch all the chart data when filters are used
   * @returns nothing
   */
  const fetchChartWithFilters = async () => {
    setIsLoading(true);
    const userInfo = await axios.get("/api/user/getUserInfo");
    const { organizationId: organization, id } = userInfo?.data;

    const responses: any = await Promise.all([
      getNcGraphData(
        organization,
        filterFields.NC_OBS_TYPE,
        searchValues.location ?? "",
        searchValues.financialYear,
        "",
        searchValues.entity,
        searchValues.auditType,
        searchValues.to,
        searchValues.from
      ),
      getNcGraphData(
        organization,
        filterFields.NC_TYPE,
        searchValues.location ?? "",
        searchValues.financialYear,
        "",
        searchValues.entity,
        searchValues.auditType,
        searchValues.to,
        searchValues.from
      ),
      getNcGraphData(
        organization,
        filterFields.NC_AGE_ANALYSIS,
        searchValues.location ?? "",
        searchValues.financialYear,
        "",
        searchValues.entity,
        searchValues.auditType,
        searchValues.to,
        searchValues.from
      ),
      getNcGraphData(
        organization,
        filterFields.TOP_CLAUSES,
        searchValues.location ?? "",
        searchValues.financialYear,
        "",
        searchValues.entity,
        searchValues.auditType,
        searchValues.to,
        searchValues.from
      ),
      getNcGraphData(
        organization,
        filterFields.ENTITY_TABLE,
        searchValues.location ?? "",
        searchValues.financialYear,
        "",
        searchValues.entity,
        searchValues.auditType,
        searchValues.to,
        searchValues.from
      ),
    ]);

    const ncObsType = parseChart(responses[0], "pie");
    const ncType = parseChart(responses[1], "bar");
    const ncAgeAnalysis = parseChart(responses[2], "bar");
    const topClauses = parseTopClauses(responses[3]);
    const entityTable = responses[4]?.data;

    setGraphState({
      ncObsType: ncObsType!,
      ncType: ncType!,
      ncAgeAnalysis: ncAgeAnalysis!,
      topClauses: topClauses!,
      entityData: entityTable!,
    });

    setIsLoading(false);
  };

  /**
   * @method getData
   * @description Function get chart data and display them
   * @returns nothing
   */
  const getData = async () => {
    try {
      const userInfo = await axios.get("/api/user/getUserInfo");
      const {
        organizationId: organization,
        locationId: location,
        id,
      } = userInfo?.data;

      setOrgId(organization);
      setUserLocation(location);

      setSearch((prev: any) => {
        return {
          ...prev,
          location: location,
        };
      });
      setUserId(id);

      const responses: any = await Promise.all([
        getNcGraphData(organization, filterFields.NC_OBS_TYPE, location ?? ""),
        getNcGraphData(organization, filterFields.NC_TYPE, location ?? ""),
        getNcGraphData(
          organization,
          filterFields.NC_AGE_ANALYSIS,
          location ?? ""
        ),
        getNcGraphData(organization, filterFields.TOP_CLAUSES, location ?? ""),
        getNcGraphData(organization, filterFields.ENTITY_TABLE, location ?? ""),
      ]);

      const ncObsType = parseChart(responses[0], "pie");
      const ncType = parseChart(responses[1], "bar");
      const ncAgeAnalysis = parseChart(responses[2], "bar");
      const topClauses = parseTopClauses(responses[3]);
      const entityTable = responses[4]?.data;

      setGraphState({
        ncObsType: ncObsType!,
        ncType: ncType!,
        ncAgeAnalysis: ncAgeAnalysis!,
        topClauses: topClauses!,
        entityData: entityTable!,
      });
    } catch (error: any) {
      console.log("error message - ", { error });
    }
  };

  /**
   * @method dataParser
   * @description Function to parse data and display it inside the table
   * @param data {any}
   * @returns the parsed table data
   */
  const dataParser: any = (data: any) => {
    return data?.map((nc: any) => {
      return {
        type: nc?.type ?? "-",
        ncNo: nc?.isAccessible ? (
          <Tooltip title="Click to see NC/OBS" placement="right">
            <Link
              to={
                nc?.type === "NC"
                  ? `/audit/nc/${nc?._id}`
                  : `/audit/obs/${nc?._id}`
              }
              state={{
                edit: false,
                id: nc._id,
                read: true,
                redirectLink: "/dashboard/nc",
              }}
              style={{ textDecoration: "underline", color: "black" }}
            >
              {nc?.id ?? "-"}
            </Link>
          </Tooltip>
        ) : (
          nc?.id
        ),
        systemName: nc?.audit?.system?.name ?? "-",
        clauseNumber: nc?.clause?.[0]?.clauseNumber ?? "-",
        auditor: <MultiUserDisplay name="email" data={nc?.audit?.auditors} />,
        auditee: <MultiUserDisplay name="email" data={nc?.audit?.auditees} />,
        ncStatus: nc?.status ?? "-",
        openDate: nc?.date ? moment(nc?.date).format("DD-MM-YYYY") : "-",
        closeDate: nc?.closureDate
          ? moment(nc?.closureDate).format("DD-MM-YYYY")
          : "-",
        entity: nc?.audit?.auditedEntity?.entityName ?? "-",
        location: nc?.audit?.location?.locationName ?? "-",
      };
    });
  };

  /**
   * @method getTableData
   * @description Function to fetch table data
   * @param skipPage {any}
   * @param entryLimit {any}
   * @returns nothing
   */
  const getTableData = async (
    skipPage: any = skip,
    entryLimit: any = limit
  ) => {
    setTableLoader(true);

    const userInfo = await axios.get("/api/user/getUserInfo");
    const {
      organizationId: organization,
      locationId: location,
      id,
    } = userInfo?.data;

    getNcSummary(
      skipPage,
      entryLimit,
      searchValues.location !== ""
        ? searchValues.location
        : userLocation
        ? userLocation
        : location ?? "", // searchValues.location,
      searchValues.auditType,
      "",
      "",
      searchValues.from,
      searchValues.to,
      searchValues.clause,
      "",
      chartParams?.type !== "" ? chartParams?.type : "",
      chartParams?.status !== "" ? chartParams?.status : "",
      searchValues.entity,
      searchValues.financialYear
    )
      .then((response: any) => {
        const parsedData = dataParser(response?.data?.nc);
        setTableData(parsedData);
        setCount(response?.data?.count);
        setTableLoader(false);
      })
      .catch((error) => {
        console.log("error message - ", error);
        setTableLoader(false);
      });
  };

  /**
   * @method getUserLocation
   * @description Function to fetch user location
   * @returns nothing
   */
  const getUserLocation = async () => {
    const userInfo = await axios.get("/api/user/getUserInfo");
    const {
      organizationId: organization,
      locationId: location,
      id,
    } = userInfo?.data;
    setUserLocation(location);
    getFinancialYear(organization);
  };

  /**
   * @method getFinancialYear
   * @description Function to get financial year listing
   * @param organization {any}
   * @returns nothing
   */
  const getFinancialYear = (organization: any) => {
    fetchFinancialyear(organization).then((response: any) => {
      setFinancialYear(response?.data);
    });
  };

  /**
   * @method entityClickHandler
   * @description Function to handle entity click handler
   * @param data {any}
   * @param type {"NC" | "Observation"}
   * @returns nothing
   */
  function entityClickHandler(data: any, type: "NC" | "Observation") {
    const auditedentity = data.id;

    setTableLoader(true);
    getNcSummary(
      financialYear,
      myDept,
      0,
      limit,
      searchValues.location ?? "",
      searchValues.auditType,
      searchValues.auditor,
      "",
      searchValues.from,
      searchValues.to,
      "",
      "",
      type,
      "",
      auditedentity,
      searchValues.financialYear,
      ""
    )
      .then((response: any) => {
        const parsedData = dataParser(response?.data?.nc);
        setTableData(parsedData);
        setTableLoader(false);
        setCount(response?.data?.count);
        setPage(1);
      })
      .catch((error) => {
        console.log("error message - ", error);
        setTableLoader(false);
      });
  }

  useEffect(() => {
    if (!isAdmin) {
      getUserLocation();
      getOrgName();
      fetchAllLocation();
      fetchEntityListing();
      getAuditTypes(realmName);
      getData();
      getTableData();
    }
  }, [discard]);

  /**
   * @method reloadData
   * @description Function to reload data and reset all filters
   * @returns nothing
   */
  const reloadData = () => {
    getOrgName();
    fetchAllLocation();
    fetchEntityListing();
    getAuditTypes(realmName);
    getData();
    getTableData();
    handleDiscard();
  };

  return (
    <div className={classes.rootContainer}>
      <FilterDrawer
        resultText={count ? `Showing ${count} Result(s)` : `No Results Found`}
        open={filterOpen}
        setOpen={setFilterOpen}
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
            setSearch({
              ...searchValues,
              location: value?.value,
            });
            setSearchPlaceholder({
              ...searchPlaceholder,
              location: value?.name,
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
              placeholder={`${
                searchPlaceholder?.location !== ""
                  ? searchPlaceholder?.location
                  : "By Location"
              }`}
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
          options={financialYear}
          size="small"
          onChange={(e: any, value: any) => {
            setSearch({
              ...searchValues,
              financialYear: value?.year,
            });
            setSearchPlaceholder({
              ...searchPlaceholder,
              financialYear: value?.year,
            });
          }}
          getOptionLabel={(option: any) => option?.year}
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
              placeholder={`${
                searchPlaceholder?.financialYear !== ""
                  ? searchPlaceholder?.financialYear
                  : "By Financial Year"
              }`}
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
          options={entityListing}
          size="small"
          onChange={(e: any, value: any) => {
            setSearch({
              ...searchValues,
              entity: value?.value,
            });
            setSearchPlaceholder({
              ...searchPlaceholder,
              entity: value?.name,
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
              placeholder={`${
                searchPlaceholder?.entity !== ""
                  ? searchPlaceholder?.entity
                  : "By Entity"
              }`}
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
          options={auditListing}
          size="small"
          onChange={(e: any, value: any) => {
            setSearch({
              ...searchValues,
              auditType: value?.value,
            });
            setSearchPlaceholder({
              ...searchPlaceholder,
              auditType: value?.name,
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
              placeholder={`${
                searchPlaceholder?.auditType !== ""
                  ? searchPlaceholder?.auditType
                  : "By Audit Type"
              }`}
              variant="outlined"
              size="small"
            />
          )}
        />
        <div style={{ height: "10px" }} />
        <div>
          <DatePicker
            dateFields={handleDateChange}
            searchValues={searchValues}
          />
        </div>
      </FilterDrawer>
      <Box display="flex" alignItems="center" justifyContent="flex-end">
        <IconButton onClick={reloadData}>
          <img src={ReloadIcon} alt="reload" width={18} />
        </IconButton>

        <Box className={classes.filterButtonContainer}>
          <Tooltip title="Filter">
            <Fab
              size="medium"
              className={classes.fabButton}
              onClick={() => setFilterOpen(true)}
            >
              <MdFilterList />
            </Fab>
          </Tooltip>
        </Box>
      </Box>

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
            <article className={classes.topContainer}>
              <section className={classes.chartSection}>
                {graphState?.ncObsType ? (
                  <GraphComponent
                    chartType={ChartType.PIE}
                    displayTitle={true}
                    title="NC/OBS Type"
                    legendsAlignment={Alignment.START}
                    legendsPosition={Position.BOTTOM}
                    isStacked={false}
                    chartData={graphState?.ncObsType}
                    handleChartDataClick={handleChartDataClick}
                    searchTitle="documentType"
                  />
                ) : (
                  <div className={classes.noDataContainer}>No data found</div>
                )}
              </section>
              <section className={classes.chartSection}>
                {graphState?.ncType ? (
                  <GraphComponent
                    chartType={ChartType.BAR}
                    axis={Axis.VERTICAL}
                    displayTitle={true}
                    title="NC Type"
                    legendsAlignment={Alignment.START}
                    legendsPosition={Position.BOTTOM}
                    isStacked={true}
                    chartData={graphState?.ncType}
                    handleChartDataClick={handleChartDataClick}
                    searchTitle="documentStatus"
                  />
                ) : (
                  <div className={classes.noDataContainer}>No data found</div>
                )}
              </section>

              <section className={classes.chartSection}>
                {graphState?.ncAgeAnalysis ? (
                  <GraphComponent
                    chartType={ChartType.BAR}
                    axis={Axis.HORIZONTAL}
                    displayTitle={true}
                    title="NC Age Analysis"
                    legendsAlignment={Alignment.START}
                    legendsPosition={Position.BOTTOM}
                    isStacked={false}
                    chartData={graphState?.ncAgeAnalysis}
                    handleChartDataClick={handleChartDataClick}
                    searchTitle="documentStatus"
                  />
                ) : (
                  <div className={classes.noDataContainer}>No data found</div>
                )}
              </section>

              <section className={classes.chartSection}>
                <PopularTags
                  header="Top 5 clauses"
                  centerTag="Clauses"
                  clickHandler={tagsClickHandler}
                  tags={graphState?.topClauses ?? []}
                  totalDocs={graphState?.topClauses?.length}
                  alternateStyling={true}
                />
              </section>

              <section className={classes.chartSection}>
                <div className={classes.popularTagsContainer}>
                  <br />
                  <div style={{ width: "100%", textAlign: "center" }}>
                    <strong>Entity</strong>
                  </div>
                  <br />
                  <br />
                  <TableContainer
                    component={Paper}
                    style={{ width: "80%", margin: "auto" }}
                    elevation={0}
                    variant="outlined"
                  >
                    <Table style={{ overflow: "hidden" }}>
                      <TableHead>
                        <TableRow
                          style={{
                            height: "50px",
                            backgroundColor: "#f7f7ff",
                            borderRadius: "12px",
                          }}
                        >
                          <TableCell>
                            <Typography
                              variant="body2"
                              style={{ padding: "5px" }}
                            >
                              Entity Name
                            </Typography>
                          </TableCell>
                          <TableCell style={{ padding: "5px" }}>
                            <Typography variant="body2">No. of NC</Typography>
                          </TableCell>
                          <TableCell style={{ padding: "5px" }}>
                            <Typography variant="body2">Observation</Typography>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {graphState?.entityData?.map((item: any) => (
                          <>
                            <TableRow
                              style={{
                                textAlign: "center",
                                height: "50px",
                                backgroundColor: "#ffffff",
                              }}
                            >
                              <TableCell
                                style={{
                                  padding: "5px",
                                  borderRight: "1px solid #e5e5e5",
                                  borderBottom: "1px solid #e5e5e5",
                                }}
                              >
                                {item?.label}
                              </TableCell>
                              <TableCell
                                style={{
                                  padding: "5px",
                                  borderRight: "1px solid #e5e5e5",
                                  borderBottom: "1px solid #e5e5e5",
                                }}
                              >
                                <Button
                                  onClick={() => entityClickHandler(item, "NC")}
                                >
                                  <u>{item?.ncCount}</u>
                                </Button>
                              </TableCell>
                              <TableCell
                                style={{
                                  padding: "5px",
                                  borderRight: "1px solid #e5e5e5",
                                  borderBottom: "1px solid #e5e5e5",
                                }}
                              >
                                <Button
                                  onClick={() =>
                                    entityClickHandler(item, "Observation")
                                  }
                                >
                                  <u>{item?.obsCount}</u>
                                </Button>
                              </TableCell>
                            </TableRow>
                          </>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </div>
              </section>
            </article>

            {/* Table  */}
            <Grid
              container
              justifyContent="flex-end"
              className={classes.searchContainer}
            >
              <SearchBar
                placeholder="Search"
                name="searchQuery"
                values={searchQuery}
                handleChange={handleSearchChange}
                handleApply={handleTableSearch}
                endAdornment={true}
                handleClickDiscard={handleClickDiscard}
              />
            </Grid>
            {tableLoader ? (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <CircularProgress />
              </div>
            ) : tableData.length > 0 ? (
              <Grid container className={classes.bottomContainer}>
                <CustomTable
                  header={tableHeaders}
                  fields={tableFields}
                  data={tableData}
                  isAction={false}
                />
                <SimplePaginationController
                  count={count}
                  page={page}
                  rowsPerPage={limit}
                  handleChangePage={handleChangePage}
                />
              </Grid>
            ) : (
              <>
                <div className={classes.emptyTableImg}>
                  <img
                    src={EmptyTableImg}
                    alt="No Data Found"
                    height="auto"
                    width="500px"
                  />
                </div>
                <Typography align="center" className={classes.emptyDataText}>
                  No data found.
                </Typography>
              </>
            )}
          </>
        )}
      </>
    </div>
  );
}

export default Dashboard;
