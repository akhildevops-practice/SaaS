//react
import { useState, useEffect } from "react";

//recoil-atom
import { useRecoilState } from "recoil";
import { moduleNamesAtom, globalSearchClausesResult } from "recoil/atom";

//antd
import { Table, Pagination, Button, Tooltip } from "antd";
import type { PaginationProps } from "antd";

//material-ui
import CircularProgress from "@material-ui/core/CircularProgress";
import {
  AiOutlineFilter,
  AiFillFilter,
} from "react-icons/ai";
import axios from "apis/axios.global";

//styles
import useStyles from "./style";
import getAppUrl from "utils/getAppUrl";
import getSessionStorage from "utils/getSessionStorage";
import { Box, Card, CardContent, Checkbox, Typography, useMediaQuery } from "@material-ui/core";
const showTotal: PaginationProps["showTotal"] = (total) =>
  `Total ${total} items`;


function arrayToQueryString(key: any, array: any) {
  if (array && array.length > 0) {
    return array
      .map((item: any) => `${key}[]=${encodeURIComponent(item)}`)
      .join("&");
  }
  return "";
}


type Props = {
  hiraTableData: any;
  selected?: any;
  setSelected?: any;
  searchValue?: string;
  locationOptions?: any;
  departmentOptions?: any;
  getAllDepartmentsByOrgAndUnitFilter?: any;
};

const HiraTab = ({
  hiraTableData = [],
  selected,
  setSelected,
  searchValue = "",
  locationOptions = [],
  departmentOptions = [],
  getAllDepartmentsByOrgAndUnitFilter,
}: Props) => {
  const [tableData, setTableData] = useState<any[]>([]);
  const [count, setCount] = useState<any>(0);
  const [isLoading, setIsLoading] = useState<any>(false);
  const [page, setPage] = useState<any>(1);
  const [pageSize, setPageSize] = useState<number>(100); // Default page size is 100

  const [moduleNames, setModuleNames] = useRecoilState(moduleNamesAtom);
  const [globalSearchClauses, setGlobalSearchClauses] = useRecoilState<any>(
    globalSearchClausesResult
  );
  const [selectedFilters, setSelectedFilters] = useState<any>([]);
  const [selectedEntityFilters, setSelectedEntityFilters] = useState<any>([]);

  const [filterDropdownVisible, setFilterDropdownVisible] =
    useState<any>(false);
  const [filterSearch, setFilterSearch] = useState<string>("");
  const [entityFilterSearch, setEntityFilterSearch] = useState<string>("");
  const matches = useMediaQuery("(min-width:786px)");
  const realmName = getAppUrl();
  const userDetails = getSessionStorage();
  const classes = useStyles();
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);

  const totalCount =
  moduleNames.find((module) => module.name === "HIRA")?.count || 0;


  useEffect(()=>{
    setSelectedFilters([userDetails.locationId]);
    setSelectedEntityFilters([userDetails?.entity?.id]);
    setCount(totalCount);
  },[searchValue])

  useEffect(() => {
    // console.log("checkrisk hiraTableData in hira tab-->", hiraTableData);
    setTableData(hiraTableData);
  }, [hiraTableData, searchValue]);

  const updateModuleCount = (nameToUpdate:any, newCount:any) => {
    setModuleNames((prevModuleNames) =>
      prevModuleNames.map((module) =>
        module.name === nameToUpdate ? { ...module, count: newCount } : module
      )
    );
  };


  const fetchTableData  = async (page:any = 1, pageSize:any = 100, reset:any=false) => {
    try {
      const queryParams:any = {
        organizationId : sessionStorage.getItem("orgId"),
        searchQuery : searchValue,
        filter : true,
        page, // Current page
        limit: pageSize, // Page size
      }
     
  
     
  
       const queryStringParts:any = [];
       if (reset) {
        const locationQuery = arrayToQueryString("location", [userDetails?.location?.id]);
        queryStringParts.push(locationQuery);
        const entityQuery = arrayToQueryString("entity", [userDetails?.entity?.id]);
        queryStringParts.push(entityQuery);
      } else {
        if (selectedFilters?.length) {
          const locationQuery = arrayToQueryString("location", selectedFilters);
          queryStringParts.push(locationQuery);
        }
        if (selectedEntityFilters?.length) {
          const entityQuery = arrayToQueryString("entity", selectedEntityFilters);
          queryStringParts.push(entityQuery);
        }
      }
       for (const [key, value] of Object.entries(queryParams) as [string, any][]) {
        queryStringParts.push(
          `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
        );
      }
   
  
       const queryString = queryStringParts.join("&");
      const res = await axios.get(`api/globalsearch/getHiraSearchResultWithFilter?${queryString}`);
      if(res?.status === 200) {
        setTableData(res?.data?.data);
        setCount(res?.data?.count);
        updateModuleCount("HIRA", res?.data?.count || 0);

      }
    } catch (error) {
      console.log("error in fetchTable data common ref hira tab-->", error);
      
    }
  }

  const handleApplyFilter = async (reset = false, isLocationApply = false) => {
    if (!reset) {
      getAllDepartmentsByOrgAndUnitFilter(selectedFilters); // Fetch departments based on selected units
    }
    if(isLocationApply){
      setSelectedEntityFilters([]);
    }
    fetchTableData(1, 100, reset);
  };
  
  const handleResetFilter = () => {
    setSelectedFilters([userDetails?.location?.id]);
    setSelectedEntityFilters([userDetails?.entity?.id]);
    setFilterSearch("");
    setEntityFilterSearch("");
    getAllDepartmentsByOrgAndUnitFilter([userDetails?.location?.id]); // Reset departments when clearing unit selection
    handleApplyFilter(true);
  };

   const handlePaginationChange = (pageParam: number, pageSizeParam?: number) => {
    setPage(pageParam);
    setPageSize(pageSizeParam || 100); // Update page size if changed
    fetchTableData(pageParam, pageSizeParam || 100, false);
  };

  const columns = [
    {
      title: "Job Title",
      dataIndex: "jobTitle",
      key: "jobTitle",
      render: (_: any, record: any) => {
        const jobTitle = record?.jobTitle || "";
        let url = "";
    
        if (process.env.REACT_APP_REDIRECT_URL?.includes("adityabirla.com")) {
          url = `https://${realmName}.${process.env.REACT_APP_REDIRECT_URL}/risk/riskregister/HIRA/${record._id}`;
        } else if (
          process.env.REACT_APP_REDIRECT_URL?.includes("localhost") ||
          process.env.REACT_APP_REDIRECT_URL?.includes("goprodle")
        ) {
          url = `http://${realmName}.${process.env.REACT_APP_REDIRECT_URL}/risk/riskregister/HIRA/${record._id}`;
        } else {
          url = `https://${realmName}.${process.env.REACT_APP_REDIRECT_URL}/risk/riskregister/HIRA/${record._id}`;
        }
    
        return (
          <Tooltip title={jobTitle} placement="top">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: "underline",
                color: "inherit",
                cursor: "pointer",
                whiteSpace: "normal",  // Allow text to wrap
                wordWrap: "break-word", // Ensure text wraps properly
                display: "block", // Allows it to take up the full width and expand vertically
              }}
            >
              {jobTitle}
            </a>
          </Tooltip>
        );
      },
    },
    {
      title: "Unit",
      dataIndex: "locationDetails",
      key: "locationDetails",
      render: (_: any, record: any) => record?.locationDetails?.locationName,
      filterIcon: () =>
        selectedFilters.length > 0 ? (
          <AiFillFilter style={{ color: "black" }} />
        ) : (
          <AiOutlineFilter />
        ),
      filterDropdown: ({ confirm }: { confirm: any }) => {
        const allSelected =
          locationOptions.length > 0 &&
          selectedFilters.length === locationOptions.length;
    
        return (
          <div
            style={{ padding: "8px", maxHeight: "300px", overflowY: "auto" }}
          >
            <input
              type="text"
              placeholder="Search Unit"
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              style={{
                width: "80%",
                marginBottom: "8px",
                padding: "8px",
                border: "1px solid #d9d9d9",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => {
                    const updatedFilters = e.target.checked
                      ? locationOptions.map((item: any) => item.id)
                      : [];
                    setSelectedFilters(updatedFilters);
                    getAllDepartmentsByOrgAndUnitFilter(updatedFilters);
                  }}
                  style={{ marginRight: "8px" }}
                />
                Select All
              </label>
              {locationOptions
                .filter((item: any) =>
                  item.locationName
                    .toLowerCase()
                    .includes(filterSearch.toLowerCase())
                )
                .map((item: any) => (
                  <div key={item.id} style={{ marginBottom: "4px" }}>
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedFilters.includes(item.id)}
                        onChange={(e) => {
                          const value = item.id;
                          setSelectedFilters((prev: any) => {
                            const newFilters = e.target.checked
                              ? [...prev, value]
                              : prev.filter((filter: any) => filter !== value);
                            getAllDepartmentsByOrgAndUnitFilter(newFilters);
                            return newFilters;
                          });
                        }}
                        style={{ marginRight: "8px" }}
                      />
                      {item.locationName}
                    </label>
                  </div>
                ))}
            </div>
            <div
              style={{
                marginTop: "8px",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Button
                type="primary"
                onClick={() => {
                  handleApplyFilter(false, true);
                  confirm();
                }}
                disabled={selectedFilters.length === 0}
              >
                Apply
              </Button>
              <Button onClick={handleResetFilter}>Reset</Button>
            </div>
          </div>
        );
      },
    },
    {
      title: "Department",
      dataIndex: "entityDetails",
      key: "entityDetails",
      render: (_: any, record: any) => record?.entityDetails?.entityName,
      filterIcon: () =>
        selectedEntityFilters.length > 0 ? (
          <AiFillFilter style={{ color: "black" }} />
        ) : (
          <AiOutlineFilter />
        ),
      filterDropdown: ({ confirm }: { confirm: any }) => {
        const allSelected =
          departmentOptions.length > 0 &&
          selectedEntityFilters.length === departmentOptions.length;
    
        return (
          <div style={{ padding: "8px", maxHeight: "300px", overflowY: "auto" }}>
            <input
              type="text"
              placeholder="Search Department"
              value={entityFilterSearch}
              onChange={(e) => setEntityFilterSearch(e.target.value)}
              style={{
                width: "80%",
                marginBottom: "8px",
                padding: "8px",
                border: "1px solid #d9d9d9",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => {
                    setSelectedEntityFilters(
                      e.target.checked ? departmentOptions.map((item: any) => item.id) : []
                    );
                  }}
                  style={{ marginRight: "8px" }}
                />
                Select All
              </label>
              {departmentOptions
                .filter((item: any) =>
                  item.entityName.toLowerCase().includes(entityFilterSearch.toLowerCase())
                )
                .map((item: any) => (
                  <div key={item.id} style={{ marginBottom: "4px" }}>
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedEntityFilters.includes(item.id)}
                        onChange={(e) => {
                          const value = item.id;
                          setSelectedEntityFilters((prev: any) =>
                            e.target.checked
                              ? [...prev, value]
                              : prev.filter((filter: any) => filter !== value)
                          );
                        }}
                        style={{ marginRight: "8px" }}
                      />
                      {item.entityName}
                    </label>
                  </div>
                ))}
            </div>
            <div style={{ marginTop: "8px", display: "flex", justifyContent: "space-between" }}>
              <Button type="primary" onClick={() => { handleApplyFilter(); confirm(); }} disabled={selectedEntityFilters.length === 0}>
                Apply
              </Button>
              <Button onClick={handleResetFilter}>Reset</Button>
            </div>
          </div>
        );
      },
    },
    
  ];

  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      let baseUrl = ""
      if(process.env.REACT_APP_REDIRECT_URL?.includes("adityabirla.com")) {
        baseUrl = `https://${process.env.REACT_APP_REDIRECT_URL}/risk/riskregister/HIRA/`
      } else if(process.env.REACT_APP_REDIRECT_URL?.includes("goprodle")) {
       
        baseUrl = `http://${realmName}.${process.env.REACT_APP_REDIRECT_URL}/risk/riskregister/HIRA/`
      } else {
        baseUrl = `https://${realmName}.${process.env.REACT_APP_REDIRECT_URL}/risk/riskregister/HIRA/`
      }
      const formattedSelectedRows = selectedRows.map((row: any) => ({
        ...row,
        type: "HIRA",
        id: row._id,
        refId : row._id,
        name: row.jobTitle,
        comments: "Enter Comments Here...",
        link: `${baseUrl}${row._id}`,
      }));
      const newSelected = [...selected];
      newSelected.push(...formattedSelectedRows);
      setSelected && setSelected(newSelected);
    },
  };

  const handleCardSelection = (ele: any) => {
    let baseUrl = ""
    if(process.env.REACT_APP_REDIRECT_URL?.includes("adityabirla.com")) {
      baseUrl = `https://${process.env.REACT_APP_REDIRECT_URL}/risk/riskregister/HIRA/`
    } else if(process.env.REACT_APP_REDIRECT_URL?.includes("goprodle")) {
     
      baseUrl = `http://${realmName}.${process.env.REACT_APP_REDIRECT_URL}/risk/riskregister/HIRA/`
    } else {
      baseUrl = `https://${realmName}.${process.env.REACT_APP_REDIRECT_URL}/risk/riskregister/HIRA/`
    }
    setSelected((prevSelected:any) => {
      const isAlreadySelected = prevSelected.some((item:any) => item.id === ele._id);
  
      if (isAlreadySelected) {
        // Remove from selection
        return prevSelected.filter((item:any) => item.id !== ele._id);
      } else {
        // Add to selection
        return [
          ...prevSelected,
          {
            ...ele,
            type: "HIRA",
           id: ele._id,
           refId : ele._id,
            name: ele.jobTitle,
            comments: "Enter Comments Here...",
            link: `${baseUrl}${ele._id}`,
          },
        ];
      }
    });
  };

  return (
    <>
      {isLoading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <CircularProgress />
        </div>
      ) : (
        <>
        {matches ? (
          <div
            data-testid="clause-table"
            className={classes.tableContainer}
          >
            <Table
              columns={columns}
              dataSource={tableData}
              pagination={false}
              size="middle"
              rowKey={"_id"}
              rowSelection={{ ...rowSelection }}
              style={{ wordWrap: "break-word", whiteSpace: "normal" }} // Ensures all columns allow text wrapping
            />
             <div className={classes.pagination}>
             <Pagination
                size="small"
                current={page}
                pageSize={pageSize}
                total={count} // Use totalCount from moduleNames
                showTotal={showTotal}
                showSizeChanger
                onChange={handlePaginationChange}
              />
            </div>
          </div>
        ) :(
          <div style={{display:"grid", gap:"10px"}}>
         { tableData?.map((ele: any) => (
            <Card className={classes.card} key={ele?.id}>
              <Box className={classes.CardHeader}>
                <Checkbox
                  // color="primary"
                  checked={selected?.some((item:any) => item?.id === ele?._id)}
                  onChange={() => handleCardSelection(ele)}
                />
                <Typography
                  variant="body1"
                  style={{ fontWeight: 600, fontSize: "14px" }}
                >
                  {ele?.jobTitle}
                </Typography>
              </Box>
              <CardContent className={classes.content}>
                <div className={classes.row}>
                  <Typography className={classes.label}>
                  Unit:
                  </Typography>
                  <Typography variant="body2" style={{ fontSize: "14px" }}>
                    {ele?.locationDetails?.locationName}
                  </Typography>
                </div>
                <div className={classes.row}>
                  <Typography className={classes.label}>
                  Department:
                  </Typography>
                  <Typography variant="body2" style={{ fontSize: "14px" }}>
                    {ele?.entityDetails?.entityName}
                  </Typography>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        )
      }
        </>
      )}
    </>
  );
};

export default HiraTab;
