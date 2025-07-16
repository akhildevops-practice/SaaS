//react - recoil
import { useState, useEffect } from "react";
import { useRecoilState } from "recoil";
import {
  globalSearchDocumentsResult,
  moduleNamesAtom,
} from "recoil/atom";

//material-ui
import { Box, Card, CardContent, CircularProgress, Typography, useMediaQuery, Checkbox } from "@material-ui/core";
//notistack
import { useSnackbar } from "notistack";
import { Pagination } from "antd";
import type { PaginationProps } from "antd";
//antd
import { Button, Table,  } from "antd";
import type { ColumnsType } from "antd/es/table";

//styles
import useStyles from "./style";

//utils
import getSessionStorage from "utils/getSessionStorage";

//components
import {
  AiOutlineFilter,
  AiFillFilter,
} from "react-icons/ai";
import axios from "apis/axios.global";
const ROWS_PER_PAGE = 10;

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
  documentTableData: any;
  searchValue?: string;
  selected?: any;
  setSelected?: any;
  isModalVisible?: boolean;
  locationOptions?: any;
  departmentOptions?: any;
  getAllDepartmentsByOrgAndUnitFilter?: any;
};

function DocumentsTab({
  documentTableData = [],
  searchValue = "",
  selected,
  setSelected,
  isModalVisible,
  locationOptions = [],
  departmentOptions = [],
  getAllDepartmentsByOrgAndUnitFilter,
}: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const matches = useMediaQuery("(min-width:786px)");
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState<number>(0);
  const [dataLength, setDataLength] = useState(0);
  const [page, setPage] = useState(1);
  const [tableKey, setTableKey] = useState(Date.now());
  const { enqueueSnackbar } = useSnackbar();
  const [pageSize, setPageSize] = useState<number>(100); // Default page size is 100

  const iconColor = "#380036";
  const [docViewDrawer, setDocViewDrawer] = useState({
    open: false,
    data: {},
  });

  const [drawer, setDrawer] = useState<any>({
    mode: "create",
    open: false,
    clearFields: true,
    toggle: false,
    data: {},
  });

  const [globalSearchDocuments, setGlobalSearchDocuments] = useRecoilState<any>(
    globalSearchDocumentsResult
  );
  const [moduleNames, setModuleNames] = useRecoilState(moduleNamesAtom);
  const [selectedFilters, setSelectedFilters] = useState<any>([]);
  const [selectedEntityFilters, setSelectedEntityFilters] = useState<any>([]);

  const [filterDropdownVisible, setFilterDropdownVisible] = useState<any>(false);
  const [filterSearch, setFilterSearch] = useState<string>("");
  const [entityFilterSearch, setEntityFilterSearch] = useState<string>("");

  const classes = useStyles();

  const orgId = sessionStorage.getItem("orgId");
  const userDetails = getSessionStorage();

  const totalCount =
  moduleNames.find((module) => module.name === "Documents")?.count || 0;

  useEffect(() => {
    // console.log("checke useeffeft called", documentTableData);
    setIsLoading(true);
    setSelectedFilters([userDetails?.location?.id]);
    setSelectedEntityFilters([userDetails?.entity?.id]);
    setData(documentTableData);
    setCount(totalCount);
    setIsLoading(false);
  }, [searchValue, documentTableData]);

  useEffect(() => {
    setTableKey(Date.now());
  }, [isModalVisible]);


  const updateModuleCount = (nameToUpdate:any, newCount:any) => {
    setModuleNames((prevModuleNames) =>
      prevModuleNames.map((module) =>
        module.name === nameToUpdate ? { ...module, count: newCount } : module
      )
    );
  };

  const fetchTableData = async (page: number=1, pageSize: number=100, reset:any=false) => {
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
      if (reset) {
        const locationQuery = arrayToQueryString("locationFilter", [userDetails?.location?.id]);
        queryStringParts.push(locationQuery);
        const entityQuery = arrayToQueryString("entityFilter", [userDetails?.entity?.id]);
        queryStringParts.push(entityQuery);
      } else {
        if (selectedFilters?.length) {
          const locationQuery = arrayToQueryString("locationFilter", selectedFilters);
          queryStringParts.push(locationQuery);
        }
        if (selectedEntityFilters?.length) {
          const entityQuery = arrayToQueryString("entityFilter", selectedEntityFilters);
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
        `api/globalsearch/getDocSearchResultWithFilter?${queryString}`
      );
  
      if (res?.status === 200) {
        console.log("Response in document tab:", res);
        setData(res?.data?.data || []);
        setCount(res?.data?.count || 0); 
        updateModuleCount("Documents", res?.data?.count || 0);
      }
    } catch (error) {
      console.error("Error fetching table data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePaginationChange = (page: number, pageSize?: number) => {
    const localPageSize = pageSize || 100; // Default to 100 if undefined
    setPage(page); // Update current page
    setPageSize(localPageSize); // Update page size
  
    // Pass local values to fetchTableData
    fetchTableData(page, localPageSize, false);
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
  

   const toggleDocViewDrawer = (record: any = {}) => {
    setDocViewDrawer({
      ...drawer,
      open: !docViewDrawer.open,
      data: {
        ...record,
      },
    });
  };

  const columns: ColumnsType<any> = [
    {
      title: "Document Number",
      dataIndex: "documentNumbering",
      key: "documentNumbering",
      render: (_: any, record: any) => record.documentNumbering,
      // width: 100,
    },
    {
      title: "Document Name",
      dataIndex: "documentName",
      key: "documentName",
      // width: 100,
      // sorter: (a, b) => a.documentName - b.documentName,
      render: (_: any, record: any) => (
        <div
          style={{
            textDecorationLine: "underline",
            cursor: "pointer",
          }}
        >
          <div
            className={classes.clickableField}
            onClick={() => toggleDocViewDrawer(record)}
          >
            {record.documentName}
          </div>
        </div>
      ),
    },
    {
      title: "Document Type",
      dataIndex: "documentType",
      key: "documentType",
      // width: 100,
      render: (_: any, record: any) => record.documentType,
      // sorter: (a, b) => a.docType - b.docType,
    },
    {
      title: "Issue - Version",
      dataIndex: "version",
      key: "version",
      // width: 100,
      render: (_: any, record: any) => (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          {record.issueNumber} - {record.version}
        </div>
      ),
      // sorter: (a, b) => a.version - b.version,
    },
    {
      title: "Unit",
      dataIndex: "location",
      key: "location",
      render: (_: any, record: any) => record?.location,
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
      dataIndex: "department",
      key: "department",
      render: (_: any, record: any) => record?.department,
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

  const rowClassName = (record: any, index: number) => {
    return index % 2 === 0
      ? classes.alternateRowColor1
      : classes.alternateRowColor2;
  };


  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      const formattedSelectedRows = selectedRows.map((row: any) => ({
        ...row,
        type: "Document",
        id: row._id,
        refId: row._id,
        name: row.documentName,
        comments: "Enter Comments Here...",
        link: row.documentLink,
      }));

      const newSelected = [...selected];
      newSelected.push(...formattedSelectedRows);

      setSelected && setSelected(newSelected);
    },
  };

  const handleCardSelection = (ele: any) => {
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
            type: "Document",
            id: ele._id,
            refId: ele._id,
            name: ele.documentName,
            comments: "Enter Comments Here...",
            link: ele.documentLink,
          },
        ];
      }
    });
  };

  


  return (
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
        <div style={{ overflow: "hidden !important" }}>
          {/* {page >= 1 && dataLength >= ROWS_PER_PAGE ? (
            <SimplePaginationController
              count={count}
              page={page}
              rowsPerPage={ROWS_PER_PAGE}
              handleChangePage={handleChangePage}
              move="flex-start"
            />
          ) : page > 1 ? (
            <SimplePaginationController
              count={count}
              page={page}
              rowsPerPage={ROWS_PER_PAGE}
              handleChangePage={handleChangePage}
              move="flex-start"
            />
          ) : (
            <></>
          )} */}
          {matches ? (
          <div data-testid="custom-table" className={classes.tableContainer}>
            <Table
              key={tableKey}
              columns={columns}
              dataSource={data}
              pagination={false}
              size="middle"
              rowKey={"id"}
              rowSelection={{
                // type: selectionType,
                ...rowSelection,
              }}
              className={classes.documentTable}
              rowClassName={rowClassName}
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
          )
          : 
          (
            <div style={{display:"grid", gap:"10px"}}>
            {data?.map((ele: any) => (
              <Card className={classes.card} key={ele?.id}>
                <Box className={classes.CardHeader}>
                  <Checkbox
                    color="primary"
                    checked={selected?.some((item:any) => item?.id === ele?._id)}
                    onChange={() => handleCardSelection(ele)}
                  />
                  <Typography
                    variant="body1"
                    style={{ fontWeight: 600, fontSize: "14px" }}
                  >
                    {ele?.documentName}
                  </Typography>
                </Box>
                <CardContent className={classes.content}>
                  <div className={classes.row}>
                    <Typography className={classes.label}>
                    Document Number:
                    </Typography>
                    <Typography variant="body2" style={{ fontSize: "14px" }}>
                      {ele?.documentNumbering}
                    </Typography>
                  </div>
                  <div className={classes.row}>
                    <Typography className={classes.label}>
                    Document Type:
                    </Typography>
                    <Typography variant="body2" style={{ fontSize: "14px" }}>
                      {ele?.documentType}
                    </Typography>
                  </div>
                  <div className={classes.row}>
                    <Typography className={classes.label}>Issue - Version	:</Typography>
                    <Typography variant="body2" style={{ fontSize: "14px" }}>
                    {ele.issueNumber} - {ele.version}
                    </Typography>
                  </div>
                  <div className={classes.row}>
                    <Typography className={classes.label}>
                    Unit:
                    </Typography>
                    <Typography variant="body2" style={{ fontSize: "14px" }}>
                      {ele?.location}
                    </Typography>
                  </div>
                  <div className={classes.row}>
                    <Typography className={classes.label}>
                    Department:
                    </Typography>
                    <Typography variant="body2" style={{ fontSize: "14px" }}>
                      {ele?.department}
                    </Typography>
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default DocumentsTab;
