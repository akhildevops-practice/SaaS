//react
import { useState, useEffect } from "react";

//recoil-atom
import { useRecoilState } from "recoil";
import { moduleNamesAtom, globalSearchClausesResult } from "recoil/atom";
import {
  AiOutlineFilter,
  AiFillFilter,
} from "react-icons/ai";
//antd
import { Button, Table } from "antd";
import { Pagination } from "antd";
import type { PaginationProps } from "antd";
//material-ui
import CircularProgress from "@material-ui/core/CircularProgress";

//styles
import useStyles from "./style";
import axios from "apis/axios.global";

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
  aspectImpactTableData: any;
  locationOptions: any;
  searchValue: any;
};

const AspectImpactTab = ({
  aspectImpactTableData = [],
  locationOptions = [],
  searchValue=""
}: Props) => {
  const [tableData, setTableData] = useState<any>([]);
  const [count, setCount] = useState<any>(0);
  const [isLoading, setIsLoading] = useState<any>(false);
  const [page, setPage] = useState<any>(1);
  const [pageSize, setPageSize] = useState<number>(100); // Default page size is 100

  const [moduleNames, setModuleNames] = useRecoilState(moduleNamesAtom);
  const [globalSearchClauses, setGlobalSearchClauses] = useRecoilState<any>(
    globalSearchClausesResult
  );
  const [selectedFilters, setSelectedFilters] = useState<any>([]);
  const [filterDropdownVisible, setFilterDropdownVisible] =
    useState<any>(false);
  const [filterSearch, setFilterSearch] = useState<string>("");
  const classes = useStyles();

  const totalCount =
  moduleNames.find((module) => module.name === "AspectImpact")?.count || 0;

  useEffect(()=>{
    setSelectedFilters(locationOptions.map((item: any) => item.id));
    setCount(totalCount);
  },[])

  useEffect(() => {
    console.log("checkrisk aspectImpactTableData in aspectImpactTableData tab-->", aspectImpactTableData);

    setTableData(aspectImpactTableData);
  }, [aspectImpactTableData]);

  const updateModuleCount = (nameToUpdate:any, newCount:any) => {
    setModuleNames((prevModuleNames) =>
      prevModuleNames.map((module) =>
        module.name === nameToUpdate ? { ...module, count: newCount } : module
      )
    );
  };


  const fetchTableData = async (page: number=1, pageSize: number=100, reset:any) => {
    try {
      setIsLoading(true);
      const queryParams: any = {
        organizationId: sessionStorage.getItem("orgId"),
        searchQuery: searchValue,
        filter: true,
        page, // Current page
        limit: pageSize, // Page size
      };

      const queryStringParts: any = [];
      if (selectedFilters?.length && !reset) {
        const locationQuery = arrayToQueryString("location", selectedFilters);
        queryStringParts.push(locationQuery);
      }

      for (const [key, value] of Object.entries(queryParams) as [string, any][]) {
        queryStringParts.push(
          `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
        );
      }

      const queryString = queryStringParts.join("&");
      const res = await axios.get(
        `api/globalsearch/getAspImpSearchResultWithFilter?${queryString}`
      );

      if (res?.status === 200) {
        setTableData(res?.data?.data);
        setCount(res?.data?.count || 0); 
        updateModuleCount("AspectImpact", res?.data?.count || 0);
      }
    } catch (error) {
      console.error("Error fetching table data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyFilter = async (reset = false) => {
    fetchTableData(1, 100, reset);
  };

  const handleResetFilter = () => {
    setSelectedFilters(locationOptions.map((item: any) => item.id)); 
    handleApplyFilter(true);
  };

  const handlePaginationChange = (pageParam: number, pageSizeParam?: number) => {
    setPage(pageParam);
    setPageSize(pageSizeParam || 100); // Update page size if changed
    fetchTableData(pageParam, pageSizeParam || 100, false);
  };

  const columns = [
    {
      title: "Stage",
      dataIndex: "jobTitle",
      key: "jobTitle",
      render: (_: any, record: any) => record?.jobTitle,
    },
    {
      title: "Activity",
      dataIndex: "activity",
      key: "activity",
      // render: (_: any, record: any) => record?.activity,
    },
    {
      title : "Unit",
      dataIndex : "locationDetails",
      key : "locationDetails",
      render : (_: any, record: any) => record?.locationDetails?.locationName,
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
            style={{
              padding: "8px",
              maxHeight: "300px", // Fixed height for the dropdown
              overflowY: "auto", // Enable vertical scrolling
              border: "1px solid #d9d9d9", // Optional: Add border for visual clarity
              backgroundColor: "#fff", // Ensure consistent background
              borderRadius: "4px", // Optional: Rounded corners
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Add subtle shadow for better visual
            }}
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
              {/* Select All Option */}
              <div style={{ marginBottom: "8px" }}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFilters(locationOptions.map((item: any) => item.id)); // Select all
                      } else {
                        setSelectedFilters([]); // Deselect all
                      }
                    }}
                    style={{ marginRight: "8px" }}
                  />
                  Select All
                </label>
              </div>
    
              {/* Individual Options */}
              {locationOptions
                .filter((item: any) =>
                  item.locationName
                    .toLowerCase()
                    .includes(filterSearch.toLowerCase())
                )
                .map((item: any) => (
                  <div key={item.id} style={{ marginBottom: "4px" }}>
                    <label style={{ display: "flex", alignItems: "center" }}>
                      <input
                        type="checkbox"
                        checked={selectedFilters.includes(item.id)}
                        onChange={(e) => {
                          const value = item.id;
                          if (e.target.checked) {
                            setSelectedFilters((prev: any) => [...prev, value]);
                          } else {
                            setSelectedFilters((prev: any) =>
                              prev.filter((filter: any) => filter !== value)
                            );
                          }
                        }}
                        style={{ marginRight: "8px" }}
                      />
                      {item.locationName}
                    </label>
                  </div>
                ))}
            </div>
    
            {/* Apply and Reset Buttons */}
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
                  handleApplyFilter();
                  confirm();
                }}
                disabled={selectedFilters.length === 0}
                style={{
                  backgroundColor: "#E8F3F9",
                  color: "black",
                }}
              >
                Apply
              </Button>
              {!allSelected && (
                <Button onClick={handleResetFilter} style={{ marginLeft: "8px" }}>
                  Reset
                </Button>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title : "Department",
      dataIndex : "entityDetails",
      key : "entityDetails",
      render : (_: any, record: any) => record?.entityDetails?.entityName
    }
    // {
    //   title: "Description",
    //   dataIndex: "description",
    //   key: "description",
    //   render: (_: any, record: any) => record?.description,
    // },
    // {
    //   title: "System",
    //   dataIndex: "systemName",
    //   key: "systemName",
    //   render: (_: any, record: any) => record.systemName,
    // },
    // {
    //   title: "Units Applicable",
    //   dataIndex: "applicable_locations",
    //   key: "applicable_locations",
    //   render: (_: any, record: any) =>
    //     record.applicable_locations?.map((item: any, index: number) => (
    //       <span key={index}>
    //         {item.id}
    //         {index !== record.applicable_locations.length - 1 ? "," : ""}
    //       </span>
    //     )),
    // },
  ];


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
          <div
            data-testid="clause-table"
            className={classes.clauseTableContainer}
          >
            <Table
              columns={columns}
              dataSource={tableData}
              pagination={false}
              size="middle"
              rowKey={"_id"}
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
        </>
      )}
    </>
  );
};

export default AspectImpactTab;
