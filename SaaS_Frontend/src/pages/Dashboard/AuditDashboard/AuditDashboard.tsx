import { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  Fab,
  TextField,
  Tooltip,
  Typography,
} from "@material-ui/core";
import {
  Alignment,
  Axis,
  ChartType,
  filterFields,
  Position,
  roles,
} from "../../../utils/enums";
import ReloadIcon from "../../../assets/icons/Reload.svg";
import { useStyles } from "./style";
import GraphComponent from "../../../components/GraphComponent";
import FilterDrawer from "../../../components/FilterDrawer";
import { MdFilterList } from 'react-icons/md';
import SearchBar from "../../../components/SearchBar";
import CustomTable from "../../../components/CustomTable";
import SimplePaginationController from "../../../components/SimplePaginationController";
import DatePicker from "../../../components/DatePicker";
import PopularTags from "../../../components/PopularTags";
import {
  fetchGraphData,
  fetchTableData,
  tableSearch,
} from "../../../apis/auditDashboard";
import axios from "../../../apis/axios.global";
import { useSnackbar } from "notistack";
import MultiUserDisplay from "../../../components/MultiUserDisplay";
import moment from "moment";
import { Link } from "react-router-dom";
import { Autocomplete } from "@material-ui/lab";
import { MdSearch } from 'react-icons/md';
import { getSystemTypes } from "../../../apis/systemApi";
import { getAllEntities } from "../../../apis/entityApi";
import { getAllLocation } from "../../../apis/locationApi";
import getAppUrl from "../../../utils/getAppUrl";
import checkRole from "../../../utils/checkRoles";
import EmptyTableImg from "../../../assets/EmptyTableImg.svg";
import { fetchFinancialyear } from "../../../apis/dashboardApi";

const colors = [
  "rgba(255, 188, 52, 1)",
  "rgba(30, 136, 229, 1)",
  "rgba(192, 192, 192, 1)",
  "rgba(225, 87, 112, 1)",
  "rgba(81, 89, 98, 1)",
  "rgba(225, 87, 112, 1)",
];

const tableHeaders = [
  "Audit Type",
  "System Name",
  "Audit No.",
  "Auditor",
  "Auditee",
  "Audit Date",
  "Business Unit",
  "Location",
];

const tableFields = [
  "auditType",
  "systemName",
  "auditNo",
  "auditor",
  "auditee",
  "auditDate",
  "businessUnit",
  "location",
];

type Tag = {
  labels: string[];
  count: string;
};

type GraphState = {
  auditType: object;
  systemName: object;
  tag: Tag;
};

const initialFilterValues = {
  location: "",
  financialYear: "",
  businessUnit: "",
  entityType: "",
  auditType: "",
  auditedDocuments: "",
  to: "",
  from: "",
  documentStartDate: "",
  documentEndDate: "",
};

function AuditDashboard() {
  const classes = useStyles();
  const limit = 25;
  const [count, setCount] = useState<number>();
  const [locationListing, setLocationListing] = useState([]);
  const [entityListing, setEntityListing] = useState([]);
  const [auditListing, setAuditListing] = useState([]);
  const [page, setPage] = useState(1);
  const [orgId, setOrgId] = useState<any>();
  const [rowsSkip, setRowsSkip] = useState(0);
  const [tableData, setTableData] = useState<any>([]);
  const [graphState, setGraphState] = useState<GraphState>();
  const [financialYear, setFinancialYear] = useState<any>();
  const [fetchGraph, setFetchGraph] = useState<boolean>(true);
  const [filterOpen, setFilterOpen] = useState(false);

  const isAdmin = checkRole("admin");
  const [initialState, setInitialState] = useState({
    location: "",
    auditType: "",
    system: "",
    limit: "10",
    skip: "0",
    auditedDocuments: "",
  });
  const [searchValues, setSearchValues] = useState<any>({
    location: "",
    financialYear: "",
    businessUnit: "",
    entityType: "",
    auditType: "",
    to: "",
    from: "",
    limit: limit,
    skip: 0,
    system: "",
    auditedDocuments: "",
  });
  const [searchPlaceholder, setSearchPlaceholder] = useState<any>({
    location: "",
    financialYear: "",
    businessUnit: "",
    entityType: "",
    auditType: "",
    to: "",
    from: "",
    limit: limit,
    skip: 0,
    system: "",
    auditedDocuments: "",
  });
  const [filterValues, setFilterValues] = useState(initialFilterValues);
  const [graphId, setGraphId] = useState({
    auditType: [] as object[],
    systemName: {
      location: [] as object[],
      system: [] as object[],
    },
  });
  const [userId, setUserId] = useState<string>();
  const [searchQuery, setSearchQuery] = useState<any>({
    searchQuery: "",
  });
  const [tableLoader, setTableLoader] = useState(false);
  const [filterCount, setFilterCount] = useState<any>();
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const realmName = getAppUrl();

  /**
   * @method handleChangePage
   * @description Function to change table page
   * @param page {any}
   * @returns nothing
   */
  const handleChangePage = (page: any) => {
    const skip = (page - 1) * limit;
    setSearchValues((prev: any) => {
      return { ...prev, skip };
    });
    setPage(page);
    setRowsSkip(page);
  };

  /**
   * @method handleSearchChange
   * @description Function to handle search field changes
   * @param e {any}
   * @returns nothing
   */
  const handleSearchChange = (e: any) => {
    setSearchQuery({
      [e.target.name]: e.target.value,
    });
  };

  /**
   * @method handleApply
   * @description Function to apply filters and invoke a call for re-fetching table data
   * @returns nothing
   */
  const handleApply = () => {
    setSearchValues((prev: any) => {
      return {
        ...prev,
        ...filterValues,
      };
    });
    setFetchGraph(!fetchGraph);
  };

  /**
   * @method fetchGraphWithFilters
   * @description Function to fetch data when filters are active and list them out on the charts as well as the table
   * @returns nothing
   */
  const fetchGraphWithFilters = async () => {
    const {
      location,
      financialYear,
      businessUnit,
      entityType,
      auditType,
      to,
      from,
      limit,
      skip,
      system,
      auditedDocuments,
    } = searchValues;

    const userInfo = await axios.get("/api/user/getUserInfo");
    const {
      organizationId: organization,
      locationId: userLocation,
      id,
    } = userInfo?.data;

    const responses = await Promise.all([
      fetchGraphData(
        organization,
        filterFields.AUDIT_TYPE,
        location !== "" ? location : userLocation ?? "",
        financialYear,
        "",
        entityType,
        auditType,
        to,
        from
      ),
      fetchGraphData(
        organization,
        filterFields.SYSTEM,
        location !== "" ? location : userLocation ?? "",
        financialYear,
        "",
        entityType,
        auditType,
        to,
        from
      ),
      fetchGraphData(
        organization,
        filterFields.AUDITED_DOCUMENTS,
        location !== "" ? location : userLocation ?? "",
        financialYear,
        "",
        entityType,
        auditType,
        to,
        from
      ),
    ]);

    const auditTypeState = graphDataParser(responses[0], "pie");
    const systemNameState = graphDataParser(responses[1], "bar");
    const tagState = graphDataParser(responses[2], "tag") as Tag;

    setGraphState({
      auditType: auditTypeState!,
      systemName: systemNameState!,
      tag: tagState!,
    });
  };

  /**
   * @method handleTableSearch
   * @description Function to re-fetch table data when a search is performed above the table
   * @returns nothing
   */
  const handleTableSearch = () => {
    setTableLoader(true);
    tableSearch(searchQuery.searchQuery, orgId, 0, limit)
      .then((response: any) => {
        const parsedData = tableDataParser(response);
        setTableData(parsedData);
        setTableLoader(false);
        setPage(1);
        setCount(response?.data?.count);
      })
      .catch((error: any) => {
        console.log("search query error -", error);
        setTableLoader(false);
      });
  };

  const isMR = checkRole(roles.MR);
  const isOrgAdmin = checkRole(roles.ORGADMIN);
  const isLocationAdmin = checkRole(roles.LOCATIONADMIN);

  /**
   * @method handleChartDataClick
   * @description Function to handle chart data click
   * @param data {any}
   * @returns nothing
   */
  const handleChartDataClick = (data: any) => {
    if (data.chartType === ChartType.PIE) {
      const auditType: any = graphId?.auditType?.filter(
        (item: any) => item?.label === data?.value
      )[0];

      setPage(1);
      setSearchValues((prev: any) => {
        return {
          ...prev,
          skip: 0,
          auditType: auditType?.id,
          location: initialState.location,
          system: initialState.system,
          auditedDocuments: initialState.auditedDocuments,
        };
      });
    } else {
      const locations: any = graphId?.systemName?.location?.filter(
        (item: any) => item?.label === data?.location
      )[0];
      const systemname: any = graphId?.systemName?.system?.filter(
        (item: any) => item?.label === data?.value
      )[0];
      setPage(1);
      setSearchValues((prev: any) => {
        return {
          ...prev,
          skip: 0,
          location: locations?.id,
          system: systemname?.id ?? "",
          auditedDocuments: initialState.auditedDocuments,
          auditType: initialState.auditType,
        };
      });
    }
  };

  /**
   * @method handleClickDiscard
   * @description Function to re-fetch data when the cross icon is clicked on the table searchbar
   * @returns nothing
   */
  const handleClickDiscard = () => {
    setSearchQuery({
      ...searchQuery,
      searchQuery: "",
    });
    getTableData();
  };

  /**
   * @method handleDiscard
   * @description Function to discard all the filters and re-fetch the table data as well as the charts data
   * @returns nothing
   *
   */
  const handleDiscard = () => {
    setFilterValues(initialFilterValues);
    setSearchValues(initialState);
    setSearchPlaceholder({
      location: "",
      financialYear: "",
      businessUnit: "",
      entityType: "",
      auditType: "",
      to: "",
      from: "",
      limit: limit,
      skip: 0,
      system: "",
      auditedDocuments: "",
    });
    setFetchGraph(!fetchGraph);
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
   * @method getData
   * @description Function to fetch all the chart data
   * @returns nothing
   */
  const getData = async () => {
    try {
      setIsLoading(true);

      const userInfo = await axios.get("/api/user/getUserInfo");
      const {
        organizationId: organization,
        locationId: location,
        id,
      } = userInfo?.data;

      setOrgId(organization);
      setUserId(id);
      getFinancialYear(organization);

      if (userInfo.status !== 200) {
        enqueueSnackbar("User Not Found", {
          variant: "error",
        });
        return;
      }

      setInitialState((prev) => {
        return {
          ...prev,
          location: location ?? "",
        };
      });

      const responses = await Promise.all([
        fetchGraphData(organization, filterFields.AUDIT_TYPE, location ?? ""),
        fetchGraphData(organization, filterFields.SYSTEM, location ?? ""),
        fetchGraphData(
          organization,
          filterFields.AUDITED_DOCUMENTS,
          location ?? ""
        ),
        getTableData(),
      ]);

      setSearchValues((prev: any) => {
        return {
          ...prev,
          location: location ?? "",
        };
      });

      const auditTypeState = graphDataParser(responses[0], "pie");
      const systemNameState = graphDataParser(responses[1], "bar");
      const tagState = graphDataParser(responses[2], "tag") as Tag;

      setGraphState({
        auditType: auditTypeState!,
        systemName: systemNameState!,
        tag: tagState!,
      });

      setIsLoading(false);
    } catch (error: any) {
      enqueueSnackbar("Something is wrong " + error, {
        variant: "error",
      });
    }
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
   * @method tagsClickHandler
   * @description Function to perform a fetch request when a tag is clicked
   * @param tagId {string}
   * @returns nothing
   */
  const tagsClickHandler = (tagId: string) => {
    setPage(1);
    setSearchValues({
      ...searchValues,
      auditType: "",
      skip: 0,
      system: "",
      auditedDocuments: tagId,
    });
  };

  /**
   * @method graphDataParser
   * @param graphData {any}
   * @param chartType {string}
   * @returns nothing
   */
  function graphDataParser(graphData: any, chartType: string) {
    if (chartType === "pie") {
      setGraphId({
        ...graphId,
        auditType: graphData?.data?.data?.labels,
      });

      return {
        labels: graphData.data.data.labels.map((item: any) => item.label),
        datasets: [
          {
            data: graphData.data.data.datasets,
            backgroundColor: colors,
          },
        ],
      };
    } else if (chartType === "bar") {
      setGraphId((prev: any) => {
        return {
          ...prev,
          systemName: {
            system: [...graphData.data.data.datasets],
            location: [...graphData.data.data.labels],
          },
        };
      });

      return {
        labels: graphData.data.data.labels.map((label: any) => label.label),
        datasets: graphData.data.data.datasets.map(
          (item: any, index: number) => {
            return { ...item, backgroundColor: colors[index] };
          }
        ),
      };
    } else if (chartType === "tag") {
      return {
        labels: graphData.data.data.labels,
        count: graphData.data.totalCount,
      } as Tag;
    }
  }

  /**
   * @method tableDataParser
   * @description Function to parse data for displaying it into the table
   * @param tableData {any}
   * @returns
   */
  function tableDataParser(tableData: any) {
    return tableData?.data?.audits.map((item: any) => {
      return {
        auditType: item?.auditType?.name ?? "-",
        systemName: item?.system?.name ?? "-",
        auditNo: item?.isAccessible ? (
          <Tooltip title="Click to see audit" placement="right">
            <Link
              to={`/audit/auditreport/newaudit/${item?._id}`}
              state={{
                edit: false,
                id: item._id,
                read: true,
                redirectLink: "/dashboard/audit",
              }}
            >
              {item.auditNumber}
            </Link>
          </Tooltip>
        ) : (
          item?.auditNumber
        ),
        auditor: <MultiUserDisplay name="email" data={item?.auditors} />,
        auditee: <MultiUserDisplay name="email" data={item?.auditees} />,
        auditDate: moment(item?.date).format("DD/MM/YYYY"),
        businessUnit: item?.businessUnit?.name ?? "-",
        location: item?.location?.locationName ?? "-",
      };
    });
  }

  /**
   * @method getTableData
   * @description Function to fetch table data and display it
   * @returns nothing
   */
  const getTableData = async () => {
    const {
      location,
      financialYear,
      businessUnit,
      entityType,
      auditType,
      to,
      from,
      limit,
      skip,
      system,
      auditedDocuments,
    } = searchValues;

    const userInfo = await axios.get("/api/user/getUserInfo");
    const {
      organizationId: organization,
      locationId: userLocation,
      id,
    } = userInfo?.data;

    setTableLoader(true);
    try {
      const res: any = await fetchTableData(
        location !== "" ? location : userLocation ?? "",
        financialYear,
        businessUnit,
        entityType,
        auditType,
        to,
        from,
        limit,
        skip,
        system,
        auditedDocuments
      );
      const table = tableDataParser(res);
      setTableData(table);
      setTableLoader(false);
      setCount(res?.data?.count);
    } catch (error: any) {
      setTableLoader(false);
      console.log("error - ", error);
    }
  };

  /**
   * @method handleDateChange
   * @description Function to handle data changes when the date field changes
   * @param e any
   * @returns nothing
   */
  const handleDateChange = (e: any) => {
    if (e.target.name === "documentStartDate") {
      setFilterValues({
        ...filterValues,
        from: new Date(`${e.target.value}`).toISOString(),
        documentStartDate: `${e.target.value}`,
      });
    } else {
      setFilterValues({
        ...filterValues,
        to: moment(new Date(`${e.target.value}`))
          .add(1, "days")
          .toISOString() || "",
        documentEndDate: `${e.target.value}`,
      });
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      getData();
      fetchAllLocation();
      fetchEntityListing();
      getAuditTypes(realmName);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      getTableData();
    }
  }, [searchValues]);

  useEffect(() => {
    fetchGraphWithFilters();
  }, [fetchGraph]);

  /**
   * @method reloadData
   * @description Function to reset all the filters and re-fetch the default data
   * @returns nothing
   */
  const reloadData = () => {
    setFilterValues(initialFilterValues);
    setSearchValues(initialState);
    setSearchPlaceholder({
      location: "",
      financialYear: "",
      businessUnit: "",
      entityType: "",
      auditType: "",
      to: "",
      from: "",
      limit: limit,
      skip: 0,
      system: "",
      auditedDocuments: "",
    });
    setFetchGraph(!fetchGraph);
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
            setFilterValues({
              ...filterValues,
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
            setFilterValues({
              ...filterValues,
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
            setFilterValues({
              ...filterValues,
              entityType: value?.value,
            });
            setSearchPlaceholder({
              ...searchPlaceholder,
              entityType: value?.name,
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
                searchPlaceholder?.entityType !== ""
                  ? searchPlaceholder?.entityType
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
            setFilterValues({
              ...filterValues,
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
            searchValues={filterValues}
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
            <Grid container spacing={3} className={classes.topContainer}>
              <Grid
                item
                xs={12}
                sm={12}
                md={6}
                lg={3}
                className={classes.topContainerItem}
              >
                {graphState?.auditType ? (
                  <GraphComponent
                    chartType={ChartType.PIE}
                    displayTitle={false}
                    title="Audit Type"
                    legendsAlignment={Alignment.START}
                    legendsPosition={Position.BOTTOM}
                    isStacked={false}
                    chartData={graphState.auditType}
                    handleChartDataClick={handleChartDataClick}
                    searchTitle="auditType"
                  />
                ) : (
                  <div className={classes.noDataContainer}>No data found</div>
                )}
              </Grid>
              <Grid
                item
                xs={12}
                sm={12}
                md={6}
                lg={3}
                className={classes.topContainerItem}
              >
                {graphState?.systemName ? (
                  <GraphComponent
                    chartType={ChartType.BAR}
                    axis={Axis.VERTICAL}
                    displayTitle={true}
                    title="System Name"
                    legendsAlignment={Alignment.START}
                    legendsPosition={Position.BOTTOM}
                    isStacked={true}
                    chartData={graphState.systemName}
                    handleChartDataClick={handleChartDataClick}
                    searchTitle="systemName"
                  />
                ) : (
                  <div className={classes.noDataContainer}>No Data found</div>
                )}
              </Grid>

              <Grid
                item
                xs={12}
                sm={12}
                md={6}
                lg={3}
                className={classes.topContainerItem}
              >
                {graphState?.tag ? (
                  <PopularTags
                    header="Top 5 Audited Processes"
                    centerTag="Documents Audited"
                    clickHandler={tagsClickHandler}
                    tags={graphState?.tag?.labels ?? []}
                    totalDocs={graphState?.tag?.count}
                  />
                ) : (
                  <div className={classes.noDataContainer}>No Data found</div>
                )}
              </Grid>
            </Grid>
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

export default AuditDashboard;
