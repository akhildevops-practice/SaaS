//react
import { useState, useEffect } from "react";

//recoil-atom
import { useRecoilState } from "recoil";
import { moduleNamesAtom, globalSearchClausesResult } from "recoil/atom";

//antd
import { Table, Pagination, Button } from "antd";
import type { PaginationProps } from "antd";

//material-ui
import CircularProgress from "@material-ui/core/CircularProgress";
import { AiOutlineFilter, AiFillFilter } from "react-icons/ai";
//styles
import useStyles from "./style";
import axios from "apis/axios.global";
import getSessionStorage from "utils/getSessionStorage";
import {
  Box,
  Card,
  CardContent,
  Checkbox,
  Typography,
  useMediaQuery,
} from "@material-ui/core";
const showTotal: PaginationProps["showTotal"] = (total) =>
  `Total ${total} items`;

type Props = {
  capaData?: any;
  selected?: any;
  setSelected?: any;
  searchValue?: string;
  locationOptions?: any;
  departmentOptions?: any;
  getAllDepartmentsByOrgAndUnitFilter?: any;
};

function arrayToQueryString(key: any, array: any) {
  if (array && array.length > 0) {
    return array
      .map((item: any) => `${key}[]=${encodeURIComponent(item)}`)
      .join("&");
  }
  return "";
}

const CapaTab = ({
  capaData = [],
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

  const userDetails = getSessionStorage();

  const [moduleNames, setModuleNames] = useRecoilState(moduleNamesAtom);
  const [globalSearchClauses, setGlobalSearchClauses] = useRecoilState<any>(
    globalSearchClausesResult
  );
  const [selectedFilters, setSelectedFilters] = useState<any>([]);
  const [selectedEntityFilters, setSelectedEntityFilters] = useState<any>([]);

  const [filterDropdownVisible, setFilterDropdownVisible] =
    useState<any>(false);
  const [entityFilterSearch, setEntityFilterSearch] = useState<string>("");
  const [filterSearch, setFilterSearch] = useState<string>("");
  const matches = useMediaQuery("(min-width:786px)");
  const classes = useStyles();
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const totalCount =
    moduleNames.find((module) => module.name === "CAPA")?.count || 0;

  useEffect(() => {
    // console.log("checkrisk capaData in capaData tab-->", capaData);
    setSelectedFilters([userDetails.locationId]);
    setSelectedEntityFilters([userDetails?.entity?.id]);
    setCount(totalCount);
    setTableData(capaData);
  }, [capaData, searchValue]);

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
    reset: any
  ) => {
    try {
      const queryParams: any = { 
        organizationId: sessionStorage.getItem("orgId"),
        searchQuery: searchValue,
        filter: true,
        page, // Current page
        limit: pageSize, // Page size
      }
      const queryStringParts: any = [];
      if (reset) {
        const locationQuery = arrayToQueryString("location", [
          userDetails?.location?.id,
        ]);
        queryStringParts.push(locationQuery);
        const entityQuery = arrayToQueryString("entity", [
          userDetails?.entity?.id,
        ]);
        queryStringParts.push(entityQuery);
      } else {
        if (selectedFilters?.length) {
          const locationQuery = arrayToQueryString("location", selectedFilters);
          queryStringParts.push(locationQuery);
        }
        if (selectedEntityFilters?.length) {
          const entityQuery = arrayToQueryString(
            "entity",
            selectedEntityFilters
          );
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
        `api/globalsearch/getCapaSearchResultWithFilter?${queryString}`
      );
      if (res?.status === 200) {
        setTableData(res?.data?.data);
        setCount(res?.data?.count);
        updateModuleCount("CAPA", res?.data?.count || 0);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleApplyFilter = async (reset = false, isLocationApply = false) => {
    if (!reset) {
      getAllDepartmentsByOrgAndUnitFilter(selectedFilters); // Fetch departments based on selected units
    }
    if (isLocationApply) {
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
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (_: any, record: any) => record?.title,
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
                            ...selectedFilters.filter(
                              (filter: any) => filter !== value
                            ), // ✅ Remove deselected value before passing
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
      const formattedSelectedRows = selectedRows.map((row: any) => ({
        ...row,
        type: "CAPA",
        id: row._id,
        refId: row._id,
        name: row.title,
        comments: "Enter Comments Here...",
        // link: `http://${realmName}.${process.env.REACT_APP_REDIRECT_URL}/audit/nc/${row._id}`,
      }));
      const newSelected = [...selected];
      newSelected.push(...formattedSelectedRows);
      setSelected && setSelected(newSelected);
    },
  };

  const handleCardSelection = (ele: any) => {
    setSelected((prevSelected: any) => {
      const isAlreadySelected = prevSelected.some(
        (item: any) => item.id === ele._id
      );

      if (isAlreadySelected) {
        // Remove from selection
        return prevSelected.filter((item: any) => item.id !== ele._id);
      } else {
        // Add to selection
        return [
          ...prevSelected,
          {
            ...ele,
            type: "CAPA",
            id: ele._id,
            refId: ele._id,
            name: ele.title,
            comments: "Enter Comments Here...",
            // link: "",
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
            <div data-testid="clause-table" className={classes.tableContainer}>
              <Table
                columns={columns}
                dataSource={tableData}
                pagination={false}
                size="middle"
                rowKey={"_id"}
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
          ) : (
            <div style={{ display: "grid", gap: "10px" }}>
              {tableData?.map((ele: any) => (
                <Card className={classes.card} key={ele?.id}>
                  <Box className={classes.CardHeader}>
                    <Checkbox
                      color="primary"
                      checked={selected?.some(
                        (item: any) => item?.id === ele?._id
                      )}
                      onChange={() => handleCardSelection(ele)}
                    />
                    <Typography
                      variant="body1"
                      style={{ fontWeight: 600, fontSize: "14px" }}
                    >
                      {ele?.title}
                    </Typography>
                  </Box>
                  <CardContent className={classes.content}>
                    <div className={classes.row}>
                      <Typography className={classes.label}>Unit:</Typography>
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
          )}
        </>
      )}
    </>
  );
};

export default CapaTab;
