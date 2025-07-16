import { useEffect, useState } from "react";
import { Box, Fab, CircularProgress, Grid, Tooltip } from "@material-ui/core";
import { MdFilterList } from 'react-icons/md';
import GraphComponent from "../../components/GraphComponent";
import FilterDrawer from "../../components/FilterDrawer";
import SearchBar from "../../components/SearchBar";
import CustomTable from "../../components/CustomTable";
import { Alignment, Axis, ChartType, Position } from "../../utils/enums";
import SimplePaginationController from "../../components/SimplePaginationController";
import PopularTags from "../../components/PopularTags";
import DatePicker from "../../components/DatePicker";
import { useStyles } from "./styles";
import axios from "../../apis/axios.global";
import formatQuery from "../../utils/formatQuery";
import getAppUrl from "../../utils/getAppUrl";
import { currentOrg, tab } from "../../recoil/atom";
import { useRecoilState, useSetRecoilState } from "recoil";
import checkRole from "../../utils/checkRoles";
import { REDIRECT_URL } from "../../config";

const Colors = ["#1E88E5", "#E15770", "#FF6B17", "#FFE48A"];

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
  "Document Number",
  "Document Name",
  "Document Type",
  "Version",
  "Document Status",
  "Entity",
  "Location",
];

const tableFields = [
  "docNumber",
  "docName",
  "docType",
  "version",
  "docStatus",
  "department",
  "location",
];

type Props = {};

/**
 * @description Functional component which generates the dashboard layout
 * @returns a react node
 */
function Dashboard({}: Props) {
  const classes = useStyles();
  const [count, setCount] = useState<number>();
  const [page, setPage] = useState(1);
  const [tableData, setTableData] = useState<any>([]);
  const [docTypeData, setDocTypeData] = useState<any>();
  const [docStatusData, setDocStatusData] = useState<any>();
  const [tags, setTags] = useState<any>([]);
  const [accessData, setAccessData] = useState<any>();
  const [activeTab, setActiveTab] = useRecoilState<any>(tab);
  const [searchValues, setSearch] = useState<any>({
    locationName: "",
    departmentName: "",
    creator: "",
    searchQuery: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [tableLoader, setTableLoader] = useState(false);
  const [discard, setDiscard] = useState(false);
  const setOrgName = useSetRecoilState(currentOrg);
  const realmName = getAppUrl();
  const isOrgAdmin = checkRole("ORG-ADMIN");
  const [filterCount, setFilterCount] = useState<any>();
  const [filterOpen, setFilterOpen] = useState<boolean>(false);

  /**
   * @description Function to handle page changes via the pagination controller
   * @param page {any}
   * @returns nothing
   */

  const handleChangePage = (page: any) => {
    setPage(page);
    const url = formatQuery(
      `/api/dashboard/`,
      { ...searchValues, page: page, limit: 25 },
      [
        "location",
        "department",
        "creator",
        "page",
        "limit",
        "documentStartDate",
        "documentEndDate",
        "searchQuery",
        "documentStatus[]",
        "documentType",
        "readAccess",
      ]
    );
    fetchDefaultData(url);
  };

  const handleSearchChange = (e: any) => {
    e.preventDefault();
    setSearch({
      ...searchValues,
      [e.target.name]: e.target.value,
    });
  };

  const handleApply = () => {
    if (searchValues.searchQuery) {
      const url = formatQuery(
        `/api/dashboard/`,
        { ...searchValues, page: page, limit: 25 },
        [
          "location",
          "department",
          "creator",
          "page",
          "limit",
          "documentStartDate",
          "documentEndDate",
          "searchQuery",
          "documentStatus[]",
          "documentType",
          "readAccess",
        ]
      );
      fetchDefaultData(url);
    } else {
      const url = formatQuery(
        `/api/dashboard/`,
        { ...searchValues, page: page, limit: 25 },
        [
          "location",
          "department",
          "creator",
          "page",
          "limit",
          "documentStartDate",
          "documentEndDate",
          "documentStatus[]",
          "documentType",
          "readAccess",
        ]
      );
      const docStatusUrl = formatQuery(
        `api/dashboard/chart`,
        { ...searchValues, filterField: "documentStatus" },
        [
          "location",
          "department",
          "creator",
          "documentStartDate",
          "documentEndDate",
          "filterField",
        ]
      );
      const docTypeUrl = formatQuery(
        `api/dashboard/chart`,
        { ...searchValues, filterField: "documentType" },
        [
          "location",
          "department",
          "creator",
          "documentStartDate",
          "documentEndDate",
          "filterField",
        ]
      );
      const docAccessUrl = formatQuery(
        `api/dashboard/chart`,
        { ...searchValues, filterField: "documentAccess" },
        [
          "location",
          "department",
          "creator",
          "documentStartDate",
          "documentEndDate",
          "filterField",
        ]
      );

      const tagsUrl = formatQuery(
        `api/dashboard/chart`,
        { ...searchValues, filterField: "tags" },
        [
          "location",
          "department",
          "creator",
          "documentStartDate",
          "documentEndDate",
          "filterField",
        ]
      );
      fetchDefaultData(url);
      fetchDocTypeData(docTypeUrl);
      fetchDocStatusData(docStatusUrl);
      fetchDocAccessData(docAccessUrl);
      fetchDocTags(tagsUrl);
    }
  };

  const handleChartDataClick = (data: any) => {
    const url = formatQuery(
      `/api/dashboard/`,
      {
        ...searchValues,
        [data.searchTitle]: data.value === "AMENDED" ? "AMMEND" : data.value,
        page: page,
        limit: 25,
      },
      [
        "location",
        "department",
        "creator",
        "page",
        "limit",
        "documentStartDate",
        "documentEndDate",
        "searchQuery",
        "documentStatus[]",
        "documentType",
        "readAccess",
      ]
    );
    fetchDefaultData(url);
  };
  const handleDiscard = () => {
    setDiscard(!discard);
    setSearch({
      location: "",
      department: "",
      creator: "",
      documentStartDate: "",
      documentEndDate: "",
      searchQuery: "",
      documentStatus: "",
      documentType: "",
      readAccess: "",
    });
  };

  const handleClickDiscard = () => {
    const url = formatQuery(
      `/api/dashboard/`,
      { ...searchValues, searchQuery: "", page: page, limit: 25 },
      [
        "location",
        "department",
        "creator",
        "page",
        "limit",
        "documentStartDate",
        "documentEndDate",
        "searchQuery",
        "documentStatus[]",
        "documentType",
        "readAccess",
      ]
    );
    setSearch({
      ...searchValues,
      searchQuery: "",
    });
    fetchDefaultData(url);
  };

  const fetchDefaultData = async (url: any) => {
    try {
      setTableLoader(true);
      const result = await axios.get(url);
      const arr: any[] = [];
      setFilterCount(result?.data?.data_length);
      result?.data?.data?.map((item: any, key: any) => {
        arr.push({
          docNumber: (
            <div className={classes.shortenText}>{item?.documentNumbering}</div>
          ),
          docName:
            item?.isCreator || item?.access?.access ? (
              <a
                href={`http://${realmName}.${REDIRECT_URL}/processdocuments/processdocument/viewprocessdocument/${item?.id}`}
                target="_blank"
                rel="noreferrer"
                className={classes.clickableField}
              >
                {item?.documentName}
              </a>
            ) : (
              item?.documentName
            ),
          docType: item?.documentType,
          version: item?.version,
          docStatus:
            item?.status === "IN_REVIEW"
              ? "For Review"
              : item?.status === "IN_APPROVAL"
              ? "For Approval"
              : item?.status === "AMMEND"
              ? "Amended"
              : item?.status === "DRAFT"
              ? "Draft"
              : item?.status === "PUBLISHED"
              ? "Published"
              : item?.status === "APPROVED"
              ? "Approved"
              : item.status === "REVIEW_COMPLETE"
              ? "Review Completed"
              : "N/A",
          department: item?.department,
          location: item?.location,
        });
      });
      setTableData(arr);
      setTableLoader(false);
    } catch (err) {
      console.log("error", err);
      setTableLoader(false);
    }
  };

  const fetchDocTypeData = async (url: any) => {
    try {
      setIsLoading(true);
      const res = await axios.get(url);
      setDocTypeData({
        labels: res.data.data.labels,
        datasets: [
          {
            data: res.data.data.datasets.map((item: any) => {
              return item.data;
            }),
            backgroundColor: pieColors,
          },
        ],
      });
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const fetchDocStatusData = async (url: any) => {
    try {
      setIsLoading(true);
      const res = await axios.get(url);
      setDocStatusData({
        labels: res.data.data.labels,
        datasets: res.data.data.datasets.map((item: any, index: any) => {
          return {
            ...item,
            backgroundColor: Colors[index],
          };
        }),
      });
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const fetchDocAccessData = async (url: any) => {
    try {
      setIsLoading(true);
      const res = await axios.get(url);
      setAccessData({
        labels: res.data.data.labels,
        datasets: res.data.data.datasets.map((item: any, index: any) => {
          return {
            ...item,
            backgroundColor: Colors[index],
          };
        }),
      });
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const fetchDocTags = async (url: any) => {
    try {
      setIsLoading(true);
      const res = await axios.get(url);
      setCount(res.data.total);
      setTags(res?.data?.data?.labels);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const getOrgName = async () => {
    try {
      const res = await axios.get(`api/organization/${realmName}`);
      setOrgName(res.data.organizationName);
    } catch (err) {
      console.error(err);
    }
  };

  const [isFirstRender, setFirstRender] = useState(true);

  useEffect(() => {
    setActiveTab("dashboard");
    if (!isOrgAdmin) {
      (async () => {
        try {
          const { data }: any = await axios.get(`api/user/getUserInfo`);
          setSearch({
            ...searchValues,
            location: isFirstRender ? data.location.locationName : "",
          });

          if (isFirstRender && !searchValues.location) {
            setFirstRender(false);
          }

          const url = formatQuery(
            `/api/dashboard/`,
            {
              ...searchValues,
              location: isFirstRender ? data.location.locationName : "",
              page: page,
              limit: 25,
            },
            [
              "location",
              "department",
              "creator",
              "page",
              "limit",
              "startDate",
              "endDate",
              "searchQuery",
            ]
          );
          fetchDocTypeData(
            `api/dashboard/chart?filterField=documentType&location=${
              isFirstRender ? data.location.locationName : ""
            }`
          );
          fetchDocStatusData(
            `api/dashboard/chart?filterField=documentState&location=${
              isFirstRender ? data.location.locationName : ""
            }`
          );
          fetchDocAccessData(
            `api/dashboard/chart?filterField=documentAccess&location=${
              isFirstRender ? data.location.locationName : ""
            }`
          );
          fetchDocTags(
            `api/dashboard/chart?filterField=tags&location=${
              isFirstRender ? data.location.locationName : ""
            }`
          );
          fetchDefaultData(url);
        } catch (err) {
          console.error(err);
        }
      })();
    } else {
      const url = formatQuery(
        `/api/dashboard/`,
        { ...searchValues, page: page, limit: 25 },
        [
          "location",
          "department",
          "creator",
          "page",
          "limit",
          "startDate",
          "endDate",
          "searchQuery",
        ]
      );
      fetchDocTypeData(`api/dashboard/chart?filterField=documentType`);
      fetchDocStatusData(`api/dashboard/chart?filterField=documentState`);
      fetchDocAccessData(`api/dashboard/chart?filterField=documentAccess`);
      fetchDocTags(`api/dashboard/chart?filterField=tags`);
      fetchDefaultData(url);
    }
    getOrgName();
  }, [discard]);

  return (
    <div className={classes.rootContainer}>
      <FilterDrawer
        resultText={
          filterCount ? `Showing ${filterCount} Result(s)` : `No Results Found`
        }
        open={filterOpen}
        setOpen={setFilterOpen}
        handleApply={handleApply}
        handleDiscard={handleDiscard}
      >
        <SearchBar
          placeholder="By Location Name"
          name="location"
          handleChange={handleSearchChange}
          values={searchValues}
          handleApply={handleApply}
        />
        <SearchBar
          placeholder="By Entity Name"
          name="department"
          handleChange={handleSearchChange}
          values={searchValues}
          handleApply={handleApply}
        />
        <SearchBar
          placeholder="By Creator(Name)"
          name="creator"
          handleChange={handleSearchChange}
          values={searchValues}
          handleApply={handleApply}
        />
        <div>
          <DatePicker
            dateFields={handleSearchChange}
            searchValues={searchValues}
          />
        </div>
      </FilterDrawer>

      <Box display="flex" alignItems="center" justifyContent="flex-end">
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
                {docTypeData ? (
                  <GraphComponent
                    chartType={ChartType.PIE}
                    displayTitle={true}
                    title="Document Type"
                    legendsAlignment={Alignment.START}
                    legendsPosition={Position.BOTTOM}
                    isStacked={false}
                    chartData={docTypeData}
                    handleChartDataClick={handleChartDataClick}
                    searchTitle="documentType"
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
                {docStatusData ? (
                  <GraphComponent
                    chartType={ChartType.BAR}
                    axis={Axis.VERTICAL}
                    displayTitle={true}
                    title="Document Status"
                    legendsAlignment={Alignment.START}
                    legendsPosition={Position.BOTTOM}
                    isStacked={true}
                    chartData={docStatusData}
                    handleChartDataClick={handleChartDataClick}
                    searchTitle="documentStatus"
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
                {accessData ? (
                  <GraphComponent
                    chartType={ChartType.BAR}
                    axis={Axis.HORIZONTAL}
                    displayTitle={true}
                    title="Document Access"
                    legendsAlignment={Alignment.CENTER}
                    legendsPosition={Position.BOTTOM}
                    isStacked={true}
                    chartData={accessData}
                    handleChartDataClick={handleChartDataClick}
                    searchTitle="readAccess"
                  />
                ) : (
                  <div className={classes.noDataContainer}>No Data Found</div>
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
                <PopularTags tags={tags} totalDocs={count} />
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
                values={searchValues}
                handleChange={handleSearchChange}
                handleApply={handleApply}
                endAdornment={true}
                handleClickDiscard={handleClickDiscard}
              />
            </Grid>
            {tableLoader ? (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <CircularProgress />
              </div>
            ) : (
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
                  rowsPerPage={25}
                  handleChangePage={handleChangePage}
                />
              </Grid>
            )}
          </>
        )}
      </>
    </div>
  );
}

export default Dashboard;
