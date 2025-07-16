//react - recoil
import React from "react";
import { useState, useEffect } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  drawerData,
  processDocFormData,
  globalSearchDocumentsResult,
  moduleNamesAtom,
} from "recoil/atom";
import { useLocation } from "react-router-dom";
import {
  AiOutlineFilter,
  AiFillFilter,
} from "react-icons/ai";
//material-ui
import {
  Box,
  CircularProgress,
} from "@material-ui/core";
import { MdKeyboardArrowDown } from 'react-icons/md';
import { MdChevronRight } from 'react-icons/md';

//notistack
import { useSnackbar } from "notistack";
import { Pagination } from "antd";
import type { PaginationProps } from "antd";

//antd
import { Button, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";

//styles
import useStyles from "./style";

//utils
import getAppUrl from "utils/getAppUrl";
import checkRole from "utils/checkRoles";
import axios from "apis/axios.global";

//components
import DocumentViewDrawer from "components/Document/DocumentTable/DocumentViewDrawer";
import DocumentDrawer from "components/Document/DocumentTable/DocumentDrawer";

//assets
import getSessionStorage from "utils/getSessionStorage";
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
  locationOptions?: any;
  searchValue?: string;
};

function DocumentsTab({ documentTableData = [], locationOptions=[],  searchValue = "", }: Props) {
  const setFormData = useSetRecoilState(processDocFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  // const [searchValues, setSearch] = useState<any>({
  //   searchQuery: "",
  // });
  // const [searchValue, setSearchValue] = useState<any>({});
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState<number>(0);
  const [dataLength, setDataLength] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(100); // Default page size is 100

  const [deleteDoc, setDeleteDoc] = useState<any>();

  const { enqueueSnackbar } = useSnackbar();
  const realmName = getAppUrl();
  const isOrgAdmin = checkRole("ORG-ADMIN");
  const [expandedRows, setExpandedRows] = useState<any>([]);
  const [hoveredRow, setHoveredRow] = useState(null);

  const iconColor = "#380036";
  const [docViewDrawer, setDocViewDrawer] = useState({
    open: false,
    data: {},
  });
  const [drawerDataState, setDrawerDataState] = useRecoilState(drawerData);

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
  const locationState = useLocation();

  const classes = useStyles();

  const orgId = sessionStorage.getItem("orgId");
  const userDetails = getSessionStorage();
  const [selectedFilters, setSelectedFilters] = useState<any>([]);
  const [filterDropdownVisible, setFilterDropdownVisible] =
    useState<any>(false);
  const [filterSearch, setFilterSearch] = useState<string>("");
 
  
  const totalCount =
  moduleNames.find((module) => module.name === "Documents")?.count || 0;
  useEffect(()=>{
    setSelectedFilters(locationOptions.map((item: any) => item.id));
    setCount(totalCount);
  },[])

  useEffect(()=>{
    setData(documentTableData);
  },[documentTableData])

  // useEffect(() => {
  //   console.log("in document tab glbalSearchDocumentsResult useEffect", globalSearchDocuments);
  //   if (globalSearchDocuments?.data?.length > 0) {
  //     setData(globalSearchDocuments.data)
  //     setCount(globalSearchDocuments?.data_length)
  //   } else {
  //     setData([])
  //     setCount(0)
  //   }

  // }, [moduleNames, globalSearchDocumentsResult, globalSearchClausesResult]);

  useEffect(() => {
    if (locationState.state && locationState.state.drawerOpenEditMode) {
      // Open the drawer
      setDrawer({
        ...drawer,
        open: !drawer.open,
        mode: "edit",
        toggle: true,
        clearFields: false,
        data: { ...drawer?.data, id: drawerDataState?.id },
      });
    } else if (locationState.state && locationState.state.drawerOpenAddMode) {
      setDrawer({
        ...drawer,
        open: !drawer.open,
        clearFields: false,
        toggle: true,
        mode: "create",
        data: { ...drawer?.data, id: null },
      });
    }
  }, [locationState]);



  const toggleDocViewDrawer = (record: any = {}) => {
    setDocViewDrawer({
      ...drawer,
      open: !docViewDrawer.open,
      data: {
        ...record,
      },
    });
    // navigate(
    //   `http://${realmName}.${process.env.REACT_APP_REDIRECT_URL}/processdocuments/processdocument/viewprocessdocument/${record.id}`
    // );
  };

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
      if (selectedFilters?.length && !reset) {
        const locationQuery = arrayToQueryString("locationFilter", selectedFilters);
        queryStringParts.push(locationQuery);
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


  

  const handleApplyFilter = async (reset = false) => {
    fetchTableData(1, 100, reset);
  };

  const handleResetFilter = () => {
    setSelectedFilters(locationOptions.map((item: any) => item.id)); 
    handleApplyFilter(true);
  };

  const columns: ColumnsType<any> = [
    {
      title: "Document Number",
      dataIndex: "documentNumbering",
      key: "documentNumbering",
      render: (_: any, record: any) => record.documentNumbering,
    },
    {
      title: "Document Name",
      dataIndex: "documentName",
      key: "documentName",
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
          {/* <a
            href={`http://${realmName}.${process.env.REACT_APP_REDIRECT_URL}/processdocuments/processdocument/viewprocessdocument/${record.id}`}
            target="_blank"
            rel="noreferrer"
            className={classes.clickableField}
          >
            old {record.documentName}
          </a> */}
        </div>
      ),
    },
    {
      title: "Document Type",
      dataIndex: "docType",
      key: "docType",
      render: (_: any, record: any) => record.documentType,
      // sorter: (a, b) => a.docType - b.docType,
    },
    {
      title: "Issue - Version",
      dataIndex: "version",
      key: "version",
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
      render: (_: any, record: any) => record.location,
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
      // sorter: (a, b) => a.location - b.location,
    },

    {
      title: "Document Status",
      dataIndex: "status",
      key: "status",
      render: (_: any, record: any) => {
        if (record.status === "APPROVED") {
          return (
            <Tag
              style={{ backgroundColor: "#7cbf3f" }}
              key={record.status}
              className={classes.statusTag}
            >
              {record.status}
            </Tag>
          );
        } else if (record.status === "For Review") {
          return (
            <Tag
              style={{ backgroundColor: "#F2BB00" }}
              key={record.status}
              className={classes.statusTag}
            >
              In Review
            </Tag>
          );
        } else if (record.status === "Review Complete") {
          return (
            <Tag
              style={{ backgroundColor: "#F2BB00" }}
              key={record.status}
              className={classes.statusTag}
            >
              {record.status}
            </Tag>
          );
        } else if (record.status === "For Approval") {
          return (
            <Tag
              style={{ backgroundColor: "#FB8500" }}
              key={record.status}
              className={classes.statusTag}
            >
              {/* {record.docStatus} */}
              In Approval
            </Tag>
          );
        } else if (record.status === "AMEND") {
          return (
            <Tag
              style={{ backgroundColor: "#D62DB1" }}
              color="yellow"
              key={record.status}
            >
              {record.status}
            </Tag>
          );
        } else if (record.status === "PUBLISHED") {
          return (
            <Tag
              style={{ backgroundColor: "#7CBF3F" }}
              key={record.status}
              className={classes.statusTag}
            >
              {record.status}
            </Tag>
          );
        } else if (record.status === "DRAFT") {
          return (
            <Tag
              style={{ backgroundColor: "#0075A4" }}
              key={record.status}
              className={classes.statusTag}
            >
              {record.status}
            </Tag>
          );
        } else if (record.status === "Send For Edit") {
          return (
            <Tag
              style={{ backgroundColor: "#0075A4" }}
              key={record.status}
              className={classes.statusTag}
            >
              {record.status}
            </Tag>
          );
        } else if (record.status === "Obsolete") {
          return (
            <Tag color="#003566" key={record.status}>
              {record.docStatus}
            </Tag>
          );
        } else return record.status;
      },
      // filterIcon: (filtered: any) => (
      //   <MdFilterList
      //     style={{ fill: iconColor, width: "0.89em", height: "0.89em" }}
      //   />
      // ),
      // filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => {
      //   return (
      //     <div style={{ padding: 8, width: "max-content" }}>
      //       <Checkbox.Group
      //         style={{ width: "100%" }}
      //         onChange={(checkedValues) => onChange(checkedValues)}
      //       >
      //         <Col>
      //           <Row>
      //             <Checkbox value="DRAFT">Draft</Checkbox>
      //           </Row>
      //           <Row>
      //             <Checkbox value="IN_REVIEW">In Review</Checkbox>
      //           </Row>
      //           <Row>
      //             <Checkbox value="IN_APPROVAL">In Approval</Checkbox>
      //           </Row>
      //           <Row>
      //             <Checkbox value="PUBLISHED">Published</Checkbox>
      //           </Row>
      //           <Row>
      //             <Checkbox value="OBSOLETE">Obsolete</Checkbox>
      //           </Row>
      //         </Col>
      //       </Checkbox.Group>
      //     </div>
      //   );
      // },
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      render: (_: any, record: any) => record.department,
      // sorter: (a, b) => a.department - b.department,
    },
   
  
  ];

  const handleMouseEnter = (record: any) => {
    setHoveredRow(record.id);
  };

  const handleMouseLeave = () => {
    setHoveredRow(null);
  };

  const handleFetchDocuments = () => {
    // fetchDocuments();
  };

  const rowClassName = (record: any, index: number) => {
    return index % 2 === 0
      ? classes.alternateRowColor1
      : classes.alternateRowColor2;
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
        <>
          {/* <Box
            style={{
              width: "100%",
              backgroundColor: "#E8F3F9",
              height: "54 px",
            }}
            // className={classes.graphContainer}
          >
            <SearchBar
              placeholder="Search Document"
              name="searchQuery"
              values={searchValues}
              handleChange={handleSearchChange}
              handleApply={handleApply}
              endAdornment={true}
              handleClickDiscard={handleClickDiscard}
            />
          </Box> */}
          {/* <br /> */}
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
          <div data-testid="custom-table" className={classes.tableContainer}>
            <Table
              columns={columns}
              dataSource={data}
              pagination={false}
              size="middle"
              rowKey={"id"}
              // bordered
              expandedRowKeys={expandedRows}
              onExpandedRowsChange={setExpandedRows}
              expandable={{
                expandIcon: ({ expanded, onExpand, record }: any) => {
                  if (record.children && record.children.length > 0) {
                    return expanded ? (
                      <MdKeyboardArrowDown
                        className={classes.groupArrow}
                        onClick={(e: any) => onExpand(record, e)}
                      />
                    ) : (
                      <MdChevronRight
                        className={classes.groupArrow}
                        onClick={(e: any) => onExpand(record, e)}
                      />
                    );
                  }
                  return null;
                },
              }}
              className={classes.documentTable}
              rowClassName={rowClassName}
              onRow={(record) => ({
                onMouseEnter: () => handleMouseEnter(record),
                onMouseLeave: handleMouseLeave,
              })}
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
          
          <div>
            {!!drawer.open && (
              <DocumentDrawer
                drawer={drawer}
                setDrawer={setDrawer}
                handleFetchDocuments={handleFetchDocuments}
              />
            )}
          </div>
          <div>
            {!!docViewDrawer.open && (
              <DocumentViewDrawer
                docViewDrawer={docViewDrawer}
                setDocViewDrawer={setDocViewDrawer}
                toggleDocViewDrawer={toggleDocViewDrawer}
                handleFetchDocuments={handleFetchDocuments}
              />
            )}
          </div>
        </>
      )}
    </>
  );
}

export default DocumentsTab;
