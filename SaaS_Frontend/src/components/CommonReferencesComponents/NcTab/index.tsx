//react
import { useState, useEffect } from "react";

//recoil-atom
import { useRecoilState } from "recoil";
import { moduleNamesAtom, globalSearchClausesResult } from "recoil/atom";

//antd
import { Button, Pagination, Table } from "antd";
import type { PaginationProps } from "antd";
import {
  AiOutlineFilter,
  AiFillFilter,
} from "react-icons/ai";

//material-ui
import CircularProgress from "@material-ui/core/CircularProgress";

//styles
import useStyles from "./style";
import getAppUrl from "utils/getAppUrl";
import axios from "apis/axios.global";
import getSessionStorage from "utils/getSessionStorage";

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
  ncTableData: any;
  selected?: any;
  setSelected?: any;
  searchValue?: string;
  locationOptions?: any;
  departmentOptions?: any;
  getAllDepartmentsByOrgAndUnitFilter?: any;
};

const NcTab = ({
  ncTableData = [],
  selected,
  setSelected,
  searchValue = "",
  locationOptions = [],
  departmentOptions = [],
  getAllDepartmentsByOrgAndUnitFilter,
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
  const [selectedEntityFilters, setSelectedEntityFilters] = useState<any>([]);

  const [filterDropdownVisible, setFilterDropdownVisible] =
    useState<any>(false);
  const [filterSearch, setFilterSearch] = useState<string>("");
  const [entityFilterSearch, setEntityFilterSearch] = useState<string>("");

  const classes = useStyles();
  const realmName = getAppUrl();
  const userDetails = getSessionStorage();

  const totalCount =
    moduleNames.find((module) => module.name === "NC")?.count || 0;

  useEffect(() => {
    // console.log("nc table data in nc tab-->", ncTableData);
    setSelectedFilters([userDetails?.location?.id]);
    setSelectedEntityFilters([userDetails?.entity?.id]);
    setCount(totalCount);
    setTableData(ncTableData);
  }, [ncTableData, searchValue]);

  const updateModuleCount = (nameToUpdate: any, newCount: any) => {
    setModuleNames((prevModuleNames) =>
      prevModuleNames.map((module) =>
        module.name === nameToUpdate ? { ...module, count: newCount } : module
      )
    );
  };

  const fetchTableData = async (
    page: number = 1,
    pageSize: number = 100,
    reset: any = false
  ) => {
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

      // Add location filter if applied
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
      const res = await axios.get(
        `api/globalsearch/getNcSearchResultWithFilter?${queryString}`
      );
      // console.log("checkrr res data in nc tab-->", res?.data);

      if (res?.status === 200) {
        const formattedNcData = res?.data?.data?.map((item: any) => ({
          ...item,
          _id: item._id,
          id: item.id,
          clause: item?.clause?.[0]?.clauseName,
          auditName: item?.audit?.auditName,
          systemName: item?.audit?.system?.name,
          severity: item?.severity,
        }));
        setTableData(formattedNcData);
        setCount(res?.data?.count || 0); // Set the total count for pagination
        updateModuleCount("NC", res?.data?.count || 0);
      }
    } catch (error) {
      console.error("Error fetching table data:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
  

  const handlePaginationChange = (
    pageParam: number,
    pageSizeParam?: number
  ) => {
    setPage(pageParam);
    setPageSize(pageSizeParam || 100); // Update page size if changed
    fetchTableData(pageParam, pageSizeParam || 100, false);
  };

  const columns = [
    {
      title: "NC Title",
      dataIndex: "id",
      key: "id",
      render: (_: any, record: any) => record?.id || "",
    },
    {
      title: "Cluase Number",
      dataIndex: "clause",
      key: "clause",
      render: (_: any, record: any) => record?.clause || "",
    },
    {
      title: "Audit Name",
      dataIndex: "auditName",
      key: "auditName",
      render: (_: any, record: any) => record?.auditName || "",
    },
    {
      title: "System",
      dataIndex: "systemName",
      key: "systemName",
      render: (_: any, record: any) => record.systemName || "",
    },
    {
      title: "Severity",
      dataIndex: "severity",
      key: "severity",
      render: (_: any, record: any) => record.severity || "",
    },
    {
      title: "Unit",
      dataIndex: "locationDetails",
      key: "locationDetails",
      render: (_: any, record: any) => record?.locationDetails?.locationName,
      filterIcon: () =>
        selectedFilters.length > 0 ? (
          <AiFillFilter size={16} style={{ color: "black", fontSize : "16px !important" }} />
        ) : (
          <AiOutlineFilter size={16} style={{ fontSize : "16px !important"}} />
        ),
      filterDropdown: ({ confirm }: { confirm: any }) => {
        const allSelected =
          locationOptions.length > 0 &&
          selectedFilters.length === locationOptions.length;
    
        return (
          <div style={{ padding: "8px", maxHeight: "300px", overflowY: "auto" }}>
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
              {/* Select All Checkbox */}
              <label>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => {
                    const updatedFilters = e.target.checked
                      ? locationOptions.map((item: any) => item.id) // Select all
                      : []; // Deselect all
                    setSelectedFilters(updatedFilters);
                    getAllDepartmentsByOrgAndUnitFilter(updatedFilters); // Fetch departments for selected units
                  }}
                  style={{ marginRight: "8px" }}
                />
                Select All
              </label>
    
              {/* Individual Unit Checkboxes */}
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
                            if (!Array.isArray(prev)) prev = [];
                            return e.target.checked
                              ? [...prev, value] // ✅ Keep previous selections and add new one
                              : prev.filter((filter: any) => filter !== value); // ✅ Remove only the deselected value
                          });
    
                          getAllDepartmentsByOrgAndUnitFilter([
                            ...selectedFilters.filter((filter: any) => filter !== value), // ✅ Remove deselected value before passing
                            ...(e.target.checked ? [value] : []), // ✅ Add selected value only if checked
                          ]);
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
          <AiFillFilter size={16} style={{ color: "black", fontSize : "16px !important" }} />
        ) : (
          <AiOutlineFilter  size={16} style={{ fontSize : "16px !important"}} />
        ),
      filterDropdown: ({ confirm }: { confirm: any }) => {
        const allSelected =
          departmentOptions.length > 0 &&
          selectedEntityFilters.length === departmentOptions.length;

        return (
          <div
            style={{ padding: "8px", maxHeight: "300px", overflowY: "auto" }}
          >
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
                    if (e.target.checked) {
                      setSelectedEntityFilters(
                        departmentOptions.map((item: any) => item.id)
                      );
                    } else {
                      setSelectedEntityFilters([]);
                    }
                  }}
                  style={{ marginRight: "8px" }}
                />
                Select All
              </label>
              {departmentOptions
                .filter((item: any) =>
                  item.entityName
                    .toLowerCase()
                    .includes(entityFilterSearch.toLowerCase())
                )
                .map((item: any) => (
                  <div key={item.id} style={{ marginBottom: "4px" }}>
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedEntityFilters.includes(item.id)}
                        onChange={(e) => {
                          const value = item.id;
                          setSelectedEntityFilters((prev: any) => {
                            if (!Array.isArray(prev)) prev = [];
                            return e.target.checked
                              ? [...prev, value]
                              : prev.filter((filter: any) => filter !== value);
                          });
                        }}
                        style={{ marginRight: "8px" }}
                      />
                      {item.entityName}
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
                  handleApplyFilter();
                  confirm();
                }}
                disabled={selectedEntityFilters.length === 0}
              >
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
      let baseUrl = "";
      if (process.env.REACT_APP_REDIRECT_URL?.includes("adityabirla.com")) {
        baseUrl = `https://${process.env.REACT_APP_REDIRECT_URL}/audit/nc/`;
      } else if (process.env.REACT_APP_REDIRECT_URL?.includes("goprodle")) {
        baseUrl = `http://${realmName}.${process.env.REACT_APP_REDIRECT_URL}/audit/nc/`;
      } else {
        baseUrl = `https://${realmName}.${process.env.REACT_APP_REDIRECT_URL}/audit/nc/`;
      }
      const formattedSelectedRows = selectedRows.map((row: any) => ({
        ...row,
        type: "NC",
        id: row._id,
        refId: row._id,
        name: row.id,
        comments: "Enter Comments Here...",
        link: `${baseUrl}${row._id}`,
      }));

      const newSelected = [...selected];
      newSelected.push(...formattedSelectedRows);
      // console.log("check new selected", newSelected);
      // Add newly selected rows, checking for duplicates
      //   formattedSelectedRows.forEach((row: any) => {
      //     if (
      //       !newSelected.some(
      //         (selectedRow: any) =>
      //           selectedRow.id === row.id && selectedRow.type === "Clause"
      //       )
      //     ) {
      //       newSelected.push(row);
      //     }
      //   });
      //   console.log("check formatted selected", formattedSelectedRows);

      // Remove deselected rows
      //   newSelected = newSelected.filter((row: any) =>
      //     formattedSelectedRows.some(
      //       (selectedRow: any) => selectedRow.id === row.id
      //     )
      //   );

      setSelected && setSelected(newSelected);
      // console.log(
      //   `selectedRowKeys: ${selectedRowKeys}`,
      //   "selectedRows: ",
      //   selectedRows
      // );
    },
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
          <div data-testid="nc-table" className={classes.tableContainer}>
            <Table
              columns={columns}
              dataSource={tableData}
              pagination={false}
              size="middle"
              rowKey={"id"}
              rowSelection={{ ...rowSelection }}
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

export default NcTab;
