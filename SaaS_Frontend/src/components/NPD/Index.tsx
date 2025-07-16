import React, { useEffect, useState } from "react";
import NavbarIndex from "./NavbarHeader/Index";
import {
  createStyles,
  withStyles,
  TableCell as CustomCell,
  TableRow as CustomRow,
  TableContainer,
  Theme,
  Table,
  TableHead,
  TableBody,
  IconButton,
  Paper,
  Box,
  Collapse,
  Menu,
  TextField,
} from "@material-ui/core";
import { TableCell, TableRow } from "@material-ui/core";
  import {
    AiOutlineAim,
    AiOutlineEdit,
    AiOutlineFilter,
    AiFillFilter,
    AiOutlineUnorderedList,
    AiOutlineDelete,
  } from "react-icons/ai";
  import { FaRegChartBar } from "react-icons/fa";

import {
  Badge,
  Button,
  Input,
  Modal,
  Pagination,
  PaginationProps,
  Popover,
  Tag,
  Tooltip,
  Checkbox,
  DatePicker,
  Popconfirm,
  Space,
} from "antd";

import axios from "apis/axios.global";
import { Link, useNavigate } from "react-router-dom";
import { MdClose } from 'react-icons/md';
import {
  deleteNpdData,
  getAllDiscussedAndDelayedItemByNpd,
  getByIdActionPlansByNPDIdAll,
  getByIdDiscussionItemItemsAll,
} from "apis/npdApi";
import moment from "moment";
import { MdEventAvailable } from 'react-icons/md';
import useStyles from "./styles";
import { MdRemoveCircleOutline } from 'react-icons/md';
import { MdAddCircle } from 'react-icons/md';
import { MdAttachment } from 'react-icons/md';
import { MdOutlineListAlt } from 'react-icons/md';

import MultiUserDisplay from "components/MultiUserDisplay";
import { useSnackbar } from "notistack";
import getSessionStorage from "utils/getSessionStorage";

const { RangePicker } = DatePicker;

const NPDMainIndex = () => {
  const StyledTableCell = withStyles((theme: Theme) =>
    createStyles({
      head: {
        backgroundColor: "#E8F3F9",
        color: "#00224E",
        height: "50px",
        fontSize: 14,
        padding: "8px",
        fontWeight: 900,
        position: "relative", // Add position relative to enable absolute positioning of the icon
      },
      body: {
        fontSize: 12,
        color: "black",
      },
    })
  )(CustomCell);

  const StyledTableRow = withStyles((theme: Theme) =>
    createStyles({
      root: {
        height: "40px",
        fontSize: 12,
        "&:nth-of-type(odd)": {
          backgroundColor: "#F8F9F9",
          height: "40px",
          fontSize: 12,
        },
      },
    })
  )(CustomRow);

  const classes = useStyles();
  const userDetail = getSessionStorage();
  const [tableData, setTableData] = useState<any>([]);
  const navigate = useNavigate();
  const [pageAction, setPageAction] = useState<any>(1);
  const [pageLimitAction, setPageLimitAction] = useState<any>(10);
  const [countAction, setCountAction] = useState<number>(0);
  const [openStatus, setOpenStatus] = useState(false);
  const [actionPlansData, setActionPlansData] = useState<any>([]);
  const [openRowData, setOpenRowData] = useState<any>();
  const [expandedRows, setExpandedRows] = useState<any>({});
  const [responseDpt, setResponseDpt] = useState<any[]>([]);
  const [picFilter, setPicFilter] = useState<any[]>([]);
  const [targetDateFilter, setTargetDateFilter] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<any[]>([]);
  const [filterColumnDpt, setFilterColumnDpt] = useState(false);
  const [filterColumnPic, setFilterColumnPic] = useState(false);
  const [filterColumnDate, setFilterColumnDate] = useState(false);
  const [filterColumnStatus, setFilterColumnStatus] = useState(false);
  const [anchorEl1, setAnchorEl1] = React.useState<null | HTMLElement>(null);
  const [anchorEl2, setAnchorEl2] = React.useState<null | HTMLElement>(null);
  const [anchorEl3, setAnchorEl3] = React.useState<null | HTMLElement>(null);
  const [anchorEl4, setAnchorEl4] = React.useState<null | HTMLElement>(null);
  const [anchorEl5, setAnchorEl5] = React.useState<null | HTMLElement>(null);
  const [optionListByFilter, setOptionListFilter] = useState<any>();
  const { enqueueSnackbar } = useSnackbar();
  const [pageNpd, setPageNpd] = useState<any>(1);
  const [pageLimitNpd, setPageLimitNpd] = useState<any>(10);
  const [countNpd, setCountNpd] = useState<number>(0);
  const [pa, setPa] = useState<any>([]);
  const [openMomModel, setOpenMomModel] = useState(false);
  const [momData, setMomData] = useState<any>([]);
  const [criticalityFilter, setCriticalityFilter] = useState<any[]>([]);
  const [filterColumnCriticality, setFilterColumnCriticality] = useState(false);
  const [pageMom, setPageMom] = useState<any>(1);
  const [pageLimitMom, setPageLimitMom] = useState<any>(10);
  const [countMom, setCountMom] = useState<number>(0);
  const [hasMounted, setHasMounted] = useState(false);
  const [popoverProjectTypeVisible, setPopoverProjectTypeVisible] =
    useState(false);
  const [projectTypeFilterOptions, setProjectTypeFilterOptions] = useState<any>(
    []
  );
  const [selectedProjectTypeFilter, setSelectedProjectTypeFilter] =
    useState<any>([]);
  const [popoverCustomerVisible, setPopoverCustomerVisible] = useState(false);
  const [customerFilterOptions, setCustomerFilterOptions] = useState<any>([]);
  const [selectedCustomerFilter, setSelectedCustomerFilter] = useState<any>([]);
  const [popoverStatusVisible, setPopoverStatusVisible] = useState(false);
  const statusFilterOptions = [
    "Draft",
    "Registered",
    "Work in Progress",
    "Completed",
  ];
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<any>([]);

  const openMomModelStatus = (data: any) => {
    setOpenRowData(data);
    setOpenMomModel(true);
    getAllMomDataTable(data?._id, "");
  };

  useEffect(() => {
    getAllMomDataTable(openRowData?._id, "");
  }, [pageMom, pageLimitMom]);

  const closeMomModelStatus = () => {
    setOpenMomModel(false);
  };
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // fetchData();
    getProjectAdmins();
    getCustomerOptions();
    setHasMounted(true);
  }, []);

  useEffect(() => {
    fetchData();
  }, [pageNpd, pageLimitNpd, searchTerm]);

  useEffect(() => {
    if (
      hasMounted &&
      selectedProjectTypeFilter.length === 0 &&
      !popoverProjectTypeVisible
    ) {
      fetchData();
    }
  }, [selectedProjectTypeFilter]);

  useEffect(() => {
    if (
      hasMounted &&
      selectedCustomerFilter.length === 0 &&
      !popoverCustomerVisible
    ) {
      fetchData();
    }
  }, [selectedCustomerFilter]);

  useEffect(() => {
    if (
      hasMounted &&
      selectedStatusFilter.length === 0 &&
      !popoverStatusVisible
    ) {
      fetchData();
    }
  }, [selectedStatusFilter]);

  //search functionalities
  const handleChange = (event: any) => {
    setSearchTerm(event.target.value);
  };
  // const handleKeyDown = async (event: any) => {
  //   if (event.key === "Enter") {
  //     event.preventDefault();
  //     fetchData();
  //   }
  // };
  const handleEditClick = (item: any) => {
    // console.log("Clearing readState from sessionStorage...");
    localStorage.removeItem("readState");

    // Navigate to the edit page
    navigate(`/NPDSteeper/${item?._id}`);
  };
  const fetchData = async () => {
    const result = await axios.get(
      `api/npd/getAllNPD?skip=${pageNpd}&limit=${pageLimitNpd}&searchTerm=${searchTerm}&projectTypeFilter=${selectedProjectTypeFilter}&customerFilter=${selectedCustomerFilter}&statusFilter=${selectedStatusFilter}`
    );
    setTableData(result?.data?.data);
    setCountNpd(result?.data?.total);
  };

  const showTotalNpd: PaginationProps["showTotal"] = (total) =>
    `Total ${total} items`;

  const handlePaginationNpd = (page: any, pageSize: any) => {
    setPageNpd(page);
    setPageLimitNpd(pageSize);
    // getActionPoints();
  };
  const getAllMomDataTable = async (id: any, condition: any) => {
    try {
      const payload = {
        skip: pageMom,
        limit: pageLimitMom,
        status: condition ? statusFilter : "",
        criticality: condition ? criticalityFilter : "",
      };
      const response = await getAllDiscussedAndDelayedItemByNpd(id, payload);
      const initialData = response?.data?.data || [];
      const fullData = await Promise.all(
        initialData.map(async (item: any) => {
          const responseData = await getByIdDiscussionItemItemsAll(item?._id);
          return {
            ...item,
            actionPlans: responseData?.data || [],
          };
        })
      );
      setMomData(fullData);
      setCountMom(response?.data?.total);
    } catch (error) {
      console.error("Error fetching MOM data:", error);
    }
  };

  const openModelStatus = (item: any) => {
    setOpenRowData(item);
    const payload = {
      skip: pageAction,
      limit: pageLimitAction,
      responseDpt: responseDpt,
      pic: picFilter,
      targetDate: targetDateFilter,
      status: statusFilter,
    };
    getByIdActionPlansByNPDIdAll(item?._id, payload).then((response: any) => {
      setActionPlansData(response?.data?.data);
      setOpenStatus(true);
      setCountAction(response?.data?.total);
    });
    dataByFilterOptions(item);
  };

  useEffect(() => {
    filterByNpdListActions(openRowData, false);
  }, [pageAction, pageLimitAction]);

  console.log("pageAction===>", pageAction);

  const filterByNpdListActions = (item: any, condition: any) => {
    const payload = {
      skip: pageAction,
      limit: pageLimitAction,
      responseDpt: condition ? responseDpt : "",
      pic: condition ? picFilter : "",
      targetDate: condition ? targetDateFilter : "",
      status: condition ? statusFilter : "",
    };
    getByIdActionPlansByNPDIdAll(item?._id, payload).then((response: any) => {
      setActionPlansData(response?.data?.data);
      // setOpenStatus(true);
      setCountAction(response?.data?.total);
    });
  };

  const dataByFilterOptions = async (item: any) => {
    const getDataByFilter = await axios.get(
      `api/npd/filterListActionPointsByNpd/${item?._id}`
    );
    setOptionListFilter(getDataByFilter?.data);
  };

  const closeModelStatus = () => {
    setOpenStatus(false);
  };

  const showTotalAction: PaginationProps["showTotal"] = (total) =>
    `Total ${total} items`;

  const showTotalMom: PaginationProps["showTotal"] = (total) =>
    `Total ${total} items`;

  const handlePaginationAction = (page: any, pageSize: any) => {
    setPageAction(page);
    setPageLimitAction(pageSize);
    // getActionPoints();
  };

  const handlePaginationMom = (page: any, pageSize: any) => {
    setPageMom(page);
    setPageLimitMom(pageSize);
    // getActionPoints();
  };

  const toggleRow = (rowId: any) => {
    setExpandedRows((prevState: any) => ({
      ...prevState,
      [rowId]: !prevState[rowId],
    }));
  };
  const getProjectAdmins = async () => {
    try {
      const result = await axios.get(`/api/configuration`);
      // console.log("result?.data in reg npd nav bar", result.data);
      if (result?.data[0]?.pmUserData) {
        setPa(result?.data[0]?.pmUserData);
      }
      if (result?.data[0]?.projectTypes) {
        setProjectTypeFilterOptions(
          result?.data[0]?.projectTypes.map((item: any) => ({
            id: item.id,
            name: item.type,
          }))
        );
      }
    } catch (error) {}
  };

  const getCustomerOptions = async () => {
    const result = await axios.get(`/api/configuration/getAllCustomer`);
    if (result?.data) {
      setCustomerFilterOptions(
        result?.data?.map((item: any) => ({
          id: item?.id,
          name: item?.entityName,
        }))
      );
    }
  };

  const handleClick = () => {
    localStorage.setItem("readState", JSON.stringify(true));
  };
  const handleClickListItem1 = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl1(event.currentTarget);
  };
  const handleClickListItem2 = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl2(event.currentTarget);
  };
  const handleClickListItem3 = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl3(event.currentTarget);
  };
  const handleClickListItem4 = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl4(event.currentTarget);
  };

  const handleClickListItem5 = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl5(event.currentTarget);
  };

  const deleteNpd = (data: any) => {
    try {
      deleteNpdData(data?._id).then((response: any) => {
        if (response?.status === 200 || response?.status === 201) {
          enqueueSnackbar(`Data Deleted SuccessFully`, {
            variant: "success",
          });
          fetchData();
        }
      });
    } catch (err) {
      console.log(err);
    }
  };

  const statusList: any = [
    {
      value: "Open",
      label: "Open",
    },
    {
      value: "Close",
      label: "Close",
    },
  ];

  const criticalityList: any = [
    {
      value: "High",
      label: "High",
    },
    {
      value: "Normal",
      label: "Normal",
    },
  ];

  const convertTo12HourFormat = (dateTime: string) => {
    const [date, timePart] = dateTime.split("T"); // Split date and time
    const [hour, minute] = timePart.split(":"); // Split hour and minute
    let hourNumber = parseInt(hour, 10);
    const ampm = hourNumber >= 12 ? "PM" : "AM";
    hourNumber = hourNumber % 12 || 12;
    const formattedTime = `${hourNumber}:${minute} ${ampm}`;
    const formattedDate = new Date(date).toLocaleDateString();
    return `${formattedDate}, ${formattedTime}`;
  };

  const handleProjectTypeFilterChange = (type: string) => {
    setSelectedProjectTypeFilter((prev: any) =>
      prev.includes(type)
        ? prev.filter((item: any) => item !== type)
        : [...prev, type]
    );
  };

  const handleProjectTypeFilterReset = () => {
    setSelectedProjectTypeFilter([]);
    setPopoverProjectTypeVisible(false);
  };

  const handleProjectTypeFilterApply = () => {
    fetchData();
    setPopoverProjectTypeVisible(false);
  };

  const handlePopoverProjectTypeFilterVisibleChange = (visible: boolean) => {
    setPopoverProjectTypeVisible(visible);
  };

  const projectTypeFilterContent = (
    <div>
      <div style={{ marginBottom: "10px" }}>
        {projectTypeFilterOptions.map((item: any) => (
          <div>
            <Checkbox
              checked={selectedProjectTypeFilter.includes(item.id)}
              onChange={() => handleProjectTypeFilterChange(item.id)}
            >
              {item.name}
            </Checkbox>
          </div>
        ))}
      </div>
      <Space>
        <Button size="small" onClick={handleProjectTypeFilterApply}>
          Apply
        </Button>
        <Button
          type="primary"
          size="small"
          onClick={handleProjectTypeFilterReset}
        >
          Reset
        </Button>
      </Space>
    </div>
  );

  const handleCustomerFilterChange = (type: string) => {
    setSelectedCustomerFilter((prev: any) =>
      prev.includes(type)
        ? prev.filter((item: any) => item !== type)
        : [...prev, type]
    );
  };

  const handleCustomerFilterReset = () => {
    setSelectedCustomerFilter([]);
    setPopoverCustomerVisible(false);
  };

  const handleCustomerFilterApply = () => {
    fetchData();
    setPopoverCustomerVisible(false);
  };

  const handlePopoverCustomerFilterVisibleChange = (visible: boolean) => {
    setPopoverCustomerVisible(visible);
  };

  const customerFilterContent = (
    <div>
      <div style={{ marginBottom: "10px" }}>
        {customerFilterOptions.map((item: any) => (
          <div>
            <Checkbox
              checked={selectedCustomerFilter.includes(item.id)}
              onChange={() => handleCustomerFilterChange(item.id)}
            >
              {item.name}
            </Checkbox>
          </div>
        ))}
      </div>
      <Space>
        <Button size="small" onClick={handleCustomerFilterApply}>
          Apply
        </Button>
        <Button type="primary" size="small" onClick={handleCustomerFilterReset}>
          Reset
        </Button>
      </Space>
    </div>
  );

  const handleStatusFilterChange = (type: string) => {
    setSelectedStatusFilter((prev: any) =>
      prev.includes(type)
        ? prev.filter((item: any) => item !== type)
        : [...prev, type]
    );
  };

  const handleStatusFilterReset = () => {
    setSelectedStatusFilter([]);
    setPopoverStatusVisible(false);
  };

  const handleStatusFilterApply = () => {
    fetchData();
    setPopoverStatusVisible(false);
  };

  const handlePopoverStatusFilterVisibleChange = (visible: boolean) => {
    setPopoverStatusVisible(visible);
  };

  const statusFilterContent = (
    <div>
      <div style={{ marginBottom: "10px" }}>
        {statusFilterOptions.map((item: any) => (
          <div>
            <Checkbox
              checked={selectedStatusFilter.includes(item)}
              onChange={() => handleStatusFilterChange(item)}
            >
              {item}
            </Checkbox>
          </div>
        ))}
      </div>
      <Space>
        <Button size="small" onClick={handleStatusFilterApply}>
          Apply
        </Button>
        <Button type="primary" size="small" onClick={handleStatusFilterReset}>
          Reset
        </Button>
      </Space>
    </div>
  );

  return (
    <div>
      {/* <NavbarIndex /> */}
      <div
        style={{
          display: "flex",
          justifyContent: "end",
          width: "100%",
          marginRight: "20px",
        }}
      >
        <Input
          placeholder="Search NPD"
          style={{
            width: "250px",
            paddingRight: "20px",
            border: "1px solid black",
          }}
          value={searchTerm}
          onChange={handleChange}
          // onKeyDown={handleKeyDown}
        />
      </div>
      <div style={{ paddingTop: "20px" }}>
        <Paper>
          <TableContainer>
            <Table aria-label="customized table">
              <TableHead>
                <TableRow style={{ fontWeight: "900" }}>
                  <StyledTableCell align="center">NPD No</StyledTableCell>
                  <StyledTableCell align="center">
                    <div style={{display:"flex", justifyContent:"center", alignItems:"center"}}>
                    Project Type
                    <Popover
                      content={projectTypeFilterContent}
                      trigger="click"
                      placement="bottom"
                      open={popoverProjectTypeVisible}
                      onOpenChange={handlePopoverProjectTypeFilterVisibleChange}
                    >
                      <Tooltip title="Filter">
                        {selectedProjectTypeFilter?.length === 0 ? (
                          <AiOutlineFilter
                            style={{
                              fontSize: "18px",
                              cursor: "pointer",
                              marginLeft: "10px",
                              paddingTop:"2px"
                            }}
                          />
                        ) : (
                          <AiFillFilter
                            style={{
                              fontSize: "18px",
                              cursor: "pointer",
                              marginLeft: "10px",
                              paddingTop:"2px"
                            }}
                          />
                        )}
                      </Tooltip>
                    </Popover>
                    </div>
                  </StyledTableCell>
                  <StyledTableCell align="center">Project Name</StyledTableCell>
                  <StyledTableCell align="center">
                  <div style={{display:"flex", justifyContent:"center", alignItems:"center"}}>
                    Customer
                    <Popover
                      content={customerFilterContent}
                      trigger="click"
                      placement="bottom"
                      open={popoverCustomerVisible}
                      onOpenChange={handlePopoverCustomerFilterVisibleChange}
                    >
                      <Tooltip title="Filter">
                        {selectedCustomerFilter?.length === 0 ? (
                          <AiOutlineFilter
                            style={{
                              fontSize: "18px",
                              cursor: "pointer",
                              marginLeft: "10px",
                               paddingTop:"2px"
                            }}
                          />
                        ) : (
                          <AiFillFilter
                            style={{
                              fontSize: "18px",
                              cursor: "pointer",
                              marginLeft: "10px",
                               paddingTop:"2px"
                            }}
                          />
                        )}
                      </Tooltip>
                    </Popover>
                    </div>
                  </StyledTableCell>
                  <StyledTableCell align="center">NPD Owner</StyledTableCell>
                  <StyledTableCell align="center">
                  <div style={{display:"flex", justifyContent:"center", alignItems:"center"}}>
                    Status
                    <Popover
                      content={statusFilterContent}
                      trigger="click"
                      placement="bottom"
                      open={popoverStatusVisible}
                      onOpenChange={handlePopoverStatusFilterVisibleChange}
                    >
                      <Tooltip title="Filter">
                        {selectedStatusFilter?.length === 0 ? (
                          <AiOutlineFilter
                            style={{
                              fontSize: "18px",
                              cursor: "pointer",
                              marginLeft: "10px",
                               paddingTop:"2px"
                            }}
                          />
                        ) : (
                          <AiFillFilter
                            style={{
                              fontSize: "18px",
                              cursor: "pointer",
                              marginLeft: "10px",
                               paddingTop:"2px"
                            }}
                          />
                        )}
                      </Tooltip>
                    </Popover>
                    </div>
                  </StyledTableCell>
                  <StyledTableCell align="center">Actions</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableData?.map((item: any, index: number) => (
                  <StyledTableRow key={index}>
                    <StyledTableCell component="th" scope="row" align="center">
                      {/* {item.npdNo} */}
                      <Link
                        to={`/NPDSteeper/${item?._id}`}
                        onClick={handleClick}
                        style={{
                          textDecoration: "underline",
                          color: "blue",
                          cursor: "pointer",
                        }}
                      >
                        {item?.npdNo}
                      </Link>
                    </StyledTableCell>
                    <StyledTableCell component="th" scope="row" align="center">
                      {item?.projectTypeData?.label || item?.projectType}
                    </StyledTableCell>
                    <StyledTableCell component="th" scope="row" align="center">
                      {item.projectName}
                    </StyledTableCell>
                    <StyledTableCell component="th" scope="row" align="center">
                      {/* {item.customer} */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <MultiUserDisplay
                          data={item.customer}
                          name={"entityName"}
                        />
                      </div>
                    </StyledTableCell>
                    <StyledTableCell component="th" scope="row" align="center">
                      {item.createdBy}
                    </StyledTableCell>
                    <StyledTableCell component="th" scope="row" align="center">
                      <Tag
                        color={
                          item.status === "Registered"
                            ? "#a4f4b1"
                            : item.status === "Completed"
                            ? "#e7d1fa"
                            : item.status === "New"
                            ? "#fcd1b6"
                            : item.status === "Delayed"
                            ? "#fecdcd"
                            : item.status === "Work in Progress"
                            ? "#fdf6b4"
                            : "#cdd2fe"
                        }
                        style={{ color: "black" }}
                      >
                        {item.status}
                      </Tag>
                    </StyledTableCell>
                    <StyledTableCell component="th" scope="row" align="center">
                      <div
                        style={{
                          display: "flex",
                          gap: "15px",
                          justifyContent: "center",
                        }}
                      >
                        {pa.some((item: any) => item.id === userDetail.id) && (
                          <>
                            {" "}
                            <IconButton
                          onClick={() => {
                            handleEditClick(item);
                            // sessionStorage.removeItem("readState");
                            // navigate(`/NPDSteeper/${item?._id}`);
                          }}
                        >
                            <Tooltip title="Edit">
                              <AiOutlineEdit
                                style={{ fontSize: "18px", cursor: "pointer" }}
                                
                              />
                            </Tooltip>
                            </IconButton>
                            <Tooltip title="Delete">
                              <Popconfirm
                                placement="top"
                                title={"Are you sure  to Delete"}
                                onConfirm={() => deleteNpd(item)}
                                okText="Yes"
                                cancelText="No"
                              >
                                <IconButton
                                  style={{ padding: "0px", margin: "0px" }}
                                >
                                  <AiOutlineDelete
                                    style={{
                                      fontSize: "18px",
                                      cursor: "pointer",
                                    }}
                                  />
                                </IconButton>
                              </Popconfirm>
                            </Tooltip>
                          </>
                        )}

                        <IconButton
                          onClick={() => {
                            navigate(`/GanttIndex/${item?._id}`);
                          }}
                        >
                          <Tooltip title="Gantt Chart">
                            <FaRegChartBar
                              style={{ fontSize: "18px", cursor: "pointer" }}
                            />
                          </Tooltip>
                        </IconButton>
                        <Tooltip title="MoM">
                          <IconButton
                            style={{ padding: "0px", margin: "0px" }}
                            onClick={() => {
                              openMomModelStatus(item);
                            }}
                          >
                            <AiOutlineUnorderedList
                              style={{ fontSize: "18px", cursor: "pointer" }}
                            />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Action Items">
                          <IconButton
                            style={{ padding: "0px", margin: "0px" }}
                            onClick={() => {
                              openModelStatus(item);
                            }}
                          >
                            <AiOutlineAim
                              style={{ fontSize: "18px", cursor: "pointer" }}
                            />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </div>
      <div className={classes.pagination}>
        <Pagination
          size="small"
          current={pageNpd}
          pageSize={pageLimitNpd}
          total={countNpd}
          showTotal={showTotalNpd}
          showSizeChanger
          showQuickJumper
          onChange={(page, pageSize) => {
            handlePaginationNpd(page, pageSize);
          }}
        />
      </div>
      <div>
        <Modal
          title={`Action Plans for ${openRowData?.projectName}`}
          open={openStatus}
          onCancel={closeModelStatus}
          footer={null}
          width="1250px"
          closeIcon={
            <MdClose
              style={{
                color: "#fff",
                backgroundColor: "#0E497A",
                borderRadius: "3px",
              }}
            />
          }
        >
          <div>
            <Paper>
              <TableContainer
                component={Paper}
                variant="outlined"
                style={{ width: "1200px" }}
              >
                <Table>
                  <TableHead
                    style={{
                      backgroundColor: "#E8F3F9",
                      color: "#00224E",
                    }}
                  >
                    <TableRow>
                      <TableCell
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                          width: "20px",
                        }}
                        align="center"
                      ></TableCell>
                      <TableCell
                        align="center"
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                          maxWidth: "346px",
                          minWidth: "346px",
                        }}
                      >
                        Action Plan
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                          minWidth: "125px",
                          display: "flex",
                          gap: "4px",
                          alignItems: "center",
                        }}
                      >
                        <span>Responsible Dept.</span>
                        <IconButton
                          style={{ padding: "0px", margin: "0px" }}
                          onClick={(e: any) => {
                            handleClickListItem1(e);
                            setFilterColumnDpt(!filterColumnDpt);
                          }}
                        >
                          {responseDpt?.length === 0 ? (
                            <AiOutlineFilter />
                          ) : (
                            <AiFillFilter />
                          )}
                          <Menu
                            anchorEl={anchorEl1}
                            open={filterColumnDpt}
                            anchorOrigin={{
                              vertical: "bottom",
                              horizontal: "left",
                            }}
                            transformOrigin={{
                              vertical: "top",
                              horizontal: "left",
                            }}
                          >
                            {optionListByFilter?.dptList?.map((item: any) => (
                              <Box
                                key={item.id}
                                style={{
                                  padding: "0px 10px",
                                  fontSize: "12px",
                                  display: "flex",
                                  gap: "7px",
                                }}
                              >
                                <Checkbox
                                  checked={responseDpt?.includes(item.id)}
                                  onClick={(event) => event.stopPropagation()}
                                  onChange={() => {
                                    const value = item.id;
                                    if (responseDpt?.includes(value)) {
                                      setResponseDpt(
                                        responseDpt.filter(
                                          (key: any) => key !== value
                                        )
                                      );
                                    } else {
                                      setResponseDpt([...responseDpt, value]);
                                    }
                                  }}
                                />
                                {item.name}
                              </Box>
                            ))}
                            <Box
                              style={{
                                display: "flex",
                                gap: "5px",
                                marginTop: "5px",
                                paddingLeft: "5px",
                                paddingRight: "5px",
                              }}
                            >
                              <Button
                                style={{
                                  color: "#fff",
                                  backgroundColor: "#003566",
                                }}
                                onClick={() => {
                                  filterByNpdListActions(openRowData, true);
                                }}
                              >
                                Apply
                              </Button>
                              <Button
                                onClick={() => {
                                  filterByNpdListActions(openRowData, false);
                                  setResponseDpt([]);
                                }}
                              >
                                Reset
                              </Button>
                            </Box>
                          </Menu>
                        </IconButton>
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                          minWidth: "100px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <span>PIC</span>
                          <IconButton
                            style={{ padding: "0px", margin: "0px" }}
                            onClick={(e: any) => {
                              handleClickListItem2(e);
                              setFilterColumnPic(!filterColumnPic);
                            }}
                          >
                            {picFilter?.length === 0 ? (
                              <AiOutlineFilter />
                            ) : (
                              <AiFillFilter />
                            )}
                            <Menu
                              anchorEl={anchorEl2}
                              open={filterColumnPic}
                              anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "left",
                              }}
                              transformOrigin={{
                                vertical: "top",
                                horizontal: "left",
                              }}
                            >
                              {optionListByFilter?.picList?.map((item: any) => (
                                <Box
                                  key={item.id}
                                  style={{
                                    padding: "0px 10px",
                                    fontSize: "12px",
                                    display: "flex",
                                    gap: "7px",
                                  }}
                                >
                                  <Checkbox
                                    checked={picFilter?.includes(item.id)}
                                    onClick={(event) => event.stopPropagation()}
                                    onChange={() => {
                                      const value = item.id;
                                      if (picFilter?.includes(value)) {
                                        setPicFilter(
                                          picFilter.filter(
                                            (key: any) => key !== value
                                          )
                                        );
                                      } else {
                                        setPicFilter([...picFilter, value]);
                                      }
                                    }}
                                  />
                                  {item.name}
                                </Box>
                              ))}
                              <Box
                                style={{
                                  display: "flex",
                                  gap: "5px",
                                  marginTop: "5px",
                                  paddingLeft: "5px",
                                  paddingRight: "5px",
                                }}
                              >
                                <Button
                                  style={{
                                    color: "#fff",
                                    backgroundColor: "#003566",
                                  }}
                                  onClick={() => {
                                    filterByNpdListActions(openRowData, true);
                                  }}
                                >
                                  Apply
                                </Button>
                                <Button
                                  onClick={() => {
                                    filterByNpdListActions(openRowData, false);
                                    setPicFilter([]);
                                  }}
                                >
                                  Reset
                                </Button>
                              </Box>
                            </Menu>
                          </IconButton>
                        </div>
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                          minWidth: "100px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <span>Target Date</span>
                          <IconButton
                            style={{ padding: "0px", margin: "0px" }}
                            onClick={(e: any) => {
                              handleClickListItem3(e);
                              setFilterColumnDate(!filterColumnDate);
                            }}
                          >
                            {targetDateFilter?.length === 0 ? (
                              <AiOutlineFilter />
                            ) : (
                              <AiFillFilter />
                            )}
                            <Menu
                              anchorEl={anchorEl3}
                              open={filterColumnDate}
                              anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "left",
                              }}
                              transformOrigin={{
                                vertical: "top",
                                horizontal: "left",
                              }}
                              disableAutoFocus
                              disableEnforceFocus
                              onClose={() => {
                                setFilterColumnDate(false);
                              }}
                              MenuListProps={{
                                onClick: (event) => event.stopPropagation(),
                              }}
                            >
                              <Box
                                style={{
                                  paddingLeft: "5px",
                                  paddingRight: "5px",
                                }}
                              >
                                {/* <RangePicker
                style={{ width: "250px" }}
                className={classes.datePickerStyles}
                // value={defaultValues}
                format="DD-MM-YYYY"
                // onClick={(event: any) => {
                //   event.stopPropagation(); 
                // }}
                onChange={(e: any, dateStrings: any) => {
                  setTargetDateFilter(dateStrings);
                }}
              /> */}
                                <TextField
                                  style={{
                                    width: "120px",
                                    height: "33px",
                                  }}
                                  // className={ClassesDate.dateInput}
                                  id="plan"
                                  type="date"
                                  value={targetDateFilter}
                                  onChange={(e: any) => {
                                    // valuesAddOnStatusHandler(
                                    //   ele,
                                    //   "date",
                                    //   e.target.value
                                    // );
                                    setTargetDateFilter(e.target.value);
                                  }}
                                  InputLabelProps={{
                                    shrink: true,
                                  }}
                                  // disabled={ele.buttonStatus}
                                />
                              </Box>
                              <Box
                                style={{
                                  display: "flex",
                                  gap: "5px",
                                  marginTop: "5px",
                                  paddingLeft: "5px",
                                  paddingRight: "5px",
                                }}
                              >
                                <Button
                                  style={{
                                    color: "#fff",
                                    backgroundColor: "#003566",
                                  }}
                                  onClick={() => {
                                    filterByNpdListActions(openRowData, true);
                                  }}
                                >
                                  Apply
                                </Button>
                                <Button
                                  onClick={() => {
                                    setTargetDateFilter([]);
                                    filterByNpdListActions(openRowData, false);
                                  }}
                                >
                                  Reset
                                </Button>
                              </Box>
                            </Menu>
                          </IconButton>
                        </div>
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                          maxWidth: "346px",
                          minWidth: "346px",
                        }}
                      >
                        Associated discussed item
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <span>Status</span>
                          <IconButton
                            style={{ padding: "0px", margin: "0px" }}
                            onClick={(e: any) => {
                              handleClickListItem4(e);
                              setFilterColumnStatus(!filterColumnStatus);
                            }}
                          >
                            {statusFilter?.length === 0 ? (
                              <AiOutlineFilter />
                            ) : (
                              <AiFillFilter />
                            )}
                            <Menu
                              anchorEl={anchorEl4}
                              open={filterColumnStatus}
                              anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "left",
                              }}
                              transformOrigin={{
                                vertical: "top",
                                horizontal: "left",
                              }}
                              style={{
                                paddingLeft: "5px",
                                paddingRight: "5px",
                              }}
                              onClose={() => setAnchorEl4(null)}
                            >
                              {statusList?.map((item: any) => (
                                <Box
                                  key={item.value}
                                  style={{
                                    padding: "0px 10px",
                                    fontSize: "12px",
                                    display: "flex",
                                    gap: "7px",
                                  }}
                                >
                                  <Checkbox
                                    checked={statusFilter?.includes(item.value)}
                                    onClick={(event) => event.stopPropagation()}
                                    onChange={() => {
                                      const value = item.value;
                                      if (statusFilter?.includes(value)) {
                                        setStatusFilter(
                                          statusFilter.filter(
                                            (key: any) => key !== value
                                          )
                                        );
                                      } else {
                                        setStatusFilter([
                                          ...statusFilter,
                                          value,
                                        ]);
                                      }
                                    }}
                                  />
                                  {item.label}
                                </Box>
                              ))}
                              <Box
                                style={{
                                  display: "flex",
                                  gap: "5px",
                                  marginTop: "5px",
                                  paddingLeft: "5px",
                                  paddingRight: "5px",
                                }}
                              >
                                <Button
                                  style={{
                                    color: "#fff",
                                    backgroundColor: "#003566",
                                  }}
                                  onClick={() => {
                                    filterByNpdListActions(openRowData, true);
                                  }}
                                >
                                  Apply
                                </Button>
                                <Button
                                  onClick={() => {
                                    filterByNpdListActions(openRowData, false);
                                    setStatusFilter([]);
                                  }}
                                >
                                  Reset
                                </Button>
                              </Box>
                            </Menu>
                          </IconButton>
                        </div>
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                          width: "20px",
                        }}
                      ></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {actionPlansData?.map((ele: any) => {
                      const isRowExpanded = expandedRows[ele?._id];
                      return (
                        <>
                          <TableRow>
                            <TableCell
                              align="center"
                              style={{
                                padding: "5px",
                                fontSize: "12px",
                                borderRight:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                borderBottom:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                height: "32px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "row",
                                  gap: "5px",
                                  alignItems: "center",
                                }}
                                key={ele._id}
                              >
                                {ele?.statusProgressData?.length === 0 ? (
                                  <div style={{ width: "24px" }}>{""}</div>
                                ) : (
                                  <IconButton
                                    aria-label="expand row"
                                    size="small"
                                    onClick={() => toggleRow(ele._id)}
                                  >
                                    {isRowExpanded ? (
                                      <MdRemoveCircleOutline
                                        style={{
                                          fontSize: "18px",
                                          color: "#0E497A",
                                          backgroundColor: "#F8F9F9",
                                          borderRadius: "50%",
                                        }}
                                      />
                                    ) : (
                                      // <Badge
                                      //   count={item?.subtask?.length}
                                      //   size="small"
                                      // >
                                      <Tooltip title={"Status Progress Data"}>
                                        <MdAddCircle
                                          style={{
                                            fontSize: "18px",
                                            color: "#0E497A",
                                            backgroundColor: "#F8F9F9",
                                            borderRadius: "50%",
                                          }}
                                        />
                                      </Tooltip>
                                      // </Badge>
                                    )}
                                  </IconButton>
                                )}
                              </div>
                            </TableCell>
                            <TableCell
                              // align="center"
                              style={{
                                padding: "5px",
                                fontSize: "12px",
                                borderRight:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                borderBottom:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                height: "32px",
                                wordWrap: "break-word",
                                whiteSpace: "normal",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                              }}
                            >
                              {ele?.actionPlanName}
                            </TableCell>
                            <TableCell
                              align="center"
                              style={{
                                padding: "5px",
                                fontSize: "12px",
                                borderRight:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                borderBottom:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                height: "32px",
                              }}
                            >
                              {ele?.selectedDptData?.entityName}
                            </TableCell>
                            <TableCell
                              align="center"
                              style={{
                                padding: "5px",
                                fontSize: "12px",
                                borderRight:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                borderBottom:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                height: "32px",
                              }}
                            >
                              {ele?.pic?.username}
                            </TableCell>
                            <TableCell
                              align="center"
                              style={{
                                padding: "5px",
                                fontSize: "12px",
                                borderRight:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                borderBottom:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                height: "32px",
                              }}
                            >
                              {moment(ele?.targetDate).format("DD-MM-YYYY")}
                            </TableCell>
                            <TableCell
                              // align="center"
                              style={{
                                padding: "5px",
                                fontSize: "12px",
                                borderRight:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                borderBottom:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                height: "32px",
                                wordWrap: "break-word",
                                whiteSpace: "normal",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                              }}
                            >
                              {ele?.discussionItemData}
                            </TableCell>
                            <TableCell
                              align="center"
                              style={{
                                padding: "5px",
                                fontSize: "12px",
                                borderRight:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                borderBottom:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                height: "32px",
                              }}
                            >
                              <Tag
                                style={{ width: "auto" }}
                                color={
                                  ele.status === "Open"
                                    ? "red"
                                    : ele.status === "Close"
                                    ? "green"
                                    : ""
                                }
                              >
                                {ele.status}
                              </Tag>
                            </TableCell>
                            <TableCell
                              align="center"
                              style={{
                                padding: "5px",
                                fontSize: "12px",
                                borderRight:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                borderBottom:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                height: "32px",
                              }}
                            >
                              <Tooltip title={"Mom Link"}>
                                <IconButton
                                  style={{ padding: "0px", margin: "0px" }}
                                  onClick={() => {
                                    navigate(
                                      `/MeetingCreatingIndex/${ele?.momId}`
                                    );
                                  }}
                                >
                                  <MdEventAvailable
                                    style={{ color: "#00224E" }}
                                  />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell
                              style={{ paddingBottom: 0, paddingTop: 0 }}
                              colSpan={7}
                            >
                              <Collapse
                                in={isRowExpanded}
                                timeout="auto"
                                unmountOnExit
                              >
                                <Box margin={1} marginLeft={4}>
                                  <Paper>
                                    <TableContainer
                                      component={Paper}
                                      variant="outlined"
                                    >
                                      <Table>
                                        <TableHead
                                          style={{
                                            backgroundColor: "#E8F3F9",
                                            color: "#00224E",
                                          }}
                                        >
                                          <TableRow>
                                            <TableCell
                                              style={{
                                                color: "#00224E",
                                                fontWeight: "bold",
                                                padding: "5px",
                                                fontSize: "13px",
                                                maxWidth: "346px",
                                                minWidth: "346px",
                                              }}
                                              align="center"
                                            >
                                              Status Description
                                            </TableCell>
                                            <TableCell
                                              style={{
                                                color: "#00224E",
                                                fontWeight: "bold",
                                                padding: "5px",
                                                fontSize: "13px",
                                                minWidth: "100px",
                                              }}
                                              align="center"
                                            >
                                              Date
                                            </TableCell>
                                            <TableCell
                                              style={{
                                                color: "#00224E",
                                                fontWeight: "bold",
                                                padding: "5px",
                                                fontSize: "13px",
                                                width: "140px",
                                              }}
                                              align="center"
                                            >
                                              Updated By
                                            </TableCell>
                                            <TableCell
                                              style={{
                                                color: "#00224E",
                                                fontWeight: "bold",
                                                padding: "5px",
                                                fontSize: "13px",
                                              }}
                                              align="center"
                                            >
                                              Attachments
                                            </TableCell>
                                            <TableCell
                                              style={{
                                                color: "#00224E",
                                                fontWeight: "bold",
                                                padding: "5px",
                                                fontSize: "13px",
                                                width: "100px",
                                              }}
                                              align="center"
                                            >
                                              Status
                                            </TableCell>
                                          </TableRow>
                                        </TableHead>
                                        <TableBody>
                                          {ele?.statusProgressData?.map(
                                            (item: any, index: any) => {
                                              return (
                                                <TableRow>
                                                  <TableCell
                                                    // align="center"
                                                    style={{
                                                      padding: "5px",
                                                      fontSize: "12px",
                                                      borderRight:
                                                        "1px solid rgba(104, 104, 104, 0.1)",
                                                      borderBottom:
                                                        "1px solid rgba(104, 104, 104, 0.1)",
                                                      height: "32px",
                                                    }}
                                                  >
                                                    {item?.description}
                                                  </TableCell>
                                                  <TableCell
                                                    align="center"
                                                    style={{
                                                      padding: "5px",
                                                      fontSize: "12px",
                                                      borderRight:
                                                        "1px solid rgba(104, 104, 104, 0.1)",
                                                      borderBottom:
                                                        "1px solid rgba(104, 104, 104, 0.1)",
                                                      height: "32px",
                                                    }}
                                                  >
                                                    {moment(item?.date).format(
                                                      "DD-MM-YYYY"
                                                    )}
                                                  </TableCell>
                                                  <TableCell
                                                    align="center"
                                                    style={{
                                                      padding: "5px",
                                                      fontSize: "12px",
                                                      borderRight:
                                                        "1px solid rgba(104, 104, 104, 0.1)",
                                                      borderBottom:
                                                        "1px solid rgba(104, 104, 104, 0.1)",
                                                      height: "32px",
                                                    }}
                                                  >
                                                    {item?.updatedBy?.username}
                                                  </TableCell>
                                                  <TableCell
                                                    align="center"
                                                    style={{
                                                      padding: "5px",
                                                      fontSize: "12px",
                                                      borderRight:
                                                        "1px solid rgba(104, 104, 104, 0.1)",
                                                      borderBottom:
                                                        "1px solid rgba(104, 104, 104, 0.1)",
                                                      height: "32px",
                                                    }}
                                                  >
                                                    <Popover
                                                      content={
                                                        <div>
                                                          {item?.attachments?.map(
                                                            (
                                                              eles: any,
                                                              index: any
                                                            ) => {
                                                              return (
                                                                <div
                                                                  style={{
                                                                    display:
                                                                      "flex",
                                                                    gap: "10px",
                                                                  }}
                                                                >
                                                                  <MdAttachment
                                                                    style={{
                                                                      color:
                                                                        "#003566",
                                                                      fontSize:
                                                                        "18px",
                                                                    }}
                                                                  />
                                                                  <a
                                                                    href={
                                                                      eles?.documentLink
                                                                    }
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                  >
                                                                    {
                                                                      eles.fileName
                                                                    }
                                                                  </a>
                                                                  {/* <Popconfirm
                                              placement="top"
                                              title={
                                                "Are you sure to delete Data"
                                              }
                                              onConfirm={() => {
                                                // fileDeleteHandler(
                                                //   index,
                                                //   item.id,
                                                //   "Design"
                                                // );
                                              }}
                                              okText="Yes"
                                              cancelText="No"
                                            >
                                              <IconButton
                                                style={{
                                                  margin: "0",
                                                  padding: "0px",
                                                }}
                                              >
                                                <img
                                                  src={DeleteIcon}
                                                  style={{
                                                    height: "16px",
                                                    width: "16px",
                                                  }}
                                                />
                                              </IconButton>
                                            </Popconfirm> */}
                                                                </div>
                                                              );
                                                            }
                                                          )}
                                                        </div>
                                                      }
                                                      title={null}
                                                    >
                                                      <Badge
                                                        count={
                                                          item?.attachments
                                                            ?.length
                                                        }
                                                        size="small"
                                                      >
                                                        <MdOutlineListAlt
                                                          style={{
                                                            color: "#003566",
                                                            cursor: "pointer",
                                                          }}
                                                        />
                                                      </Badge>
                                                    </Popover>
                                                  </TableCell>
                                                  <TableCell
                                                    align="center"
                                                    style={{
                                                      padding: "5px",
                                                      fontSize: "12px",
                                                      borderRight:
                                                        "1px solid rgba(104, 104, 104, 0.1)",
                                                      borderBottom:
                                                        "1px solid rgba(104, 104, 104, 0.1)",
                                                      height: "32px",
                                                    }}
                                                  >
                                                    <Tag
                                                      style={{ width: "auto" }}
                                                      color={
                                                        item.status === "Open"
                                                          ? "red"
                                                          : item.status ===
                                                            "Close"
                                                          ? "green"
                                                          : ""
                                                      }
                                                    >
                                                      {item.status}
                                                    </Tag>
                                                  </TableCell>
                                                </TableRow>
                                              );
                                            }
                                          )}
                                        </TableBody>
                                      </Table>
                                    </TableContainer>
                                  </Paper>
                                </Box>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        </>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
            <div className={classes.pagination}>
              <Pagination
                size="small"
                current={pageAction}
                pageSize={pageLimitAction}
                total={countAction}
                showTotal={showTotalAction}
                showSizeChanger
                showQuickJumper
                onChange={(page, pageSize) => {
                  handlePaginationAction(page, pageSize);
                }}
              />
            </div>
          </div>
        </Modal>
        <Modal
          title={`Minutes of Meeting for ${openRowData?.projectName}`}
          open={openMomModel}
          onCancel={closeMomModelStatus}
          footer={null}
          width="1250px"
          closeIcon={
            <MdClose
              style={{
                color: "#fff",
                backgroundColor: "#0E497A",
                borderRadius: "3px",
              }}
            />
          }
        >
          <div>
            <Paper>
              <TableContainer
                component={Paper}
                variant="outlined"
                // style={{ width: "1200px" }}
              >
                <Table>
                  <TableHead
                    style={{
                      backgroundColor: "#E8F3F9",
                      color: "#00224E",
                    }}
                  >
                    <TableRow>
                      <TableCell
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                          width: "20px",
                        }}
                        align="center"
                      ></TableCell>
                      {/* <TableCell
                        align="center"
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                          maxWidth: "140px",
                          minWidth: "140px",
                        }}
                      >
                        Meeting Title
                      </TableCell> */}
                      <TableCell
                        align="center"
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                          // maxWidth: "346px",
                          // minWidth: "346px",
                        }}
                      >
                        Meeting Date
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                          // maxWidth: "300px",
                          // minWidth: "300px",
                        }}
                      >
                        Discussed Items
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <span>Criticality</span>
                          <IconButton
                            style={{ padding: "0px", margin: "0px" }}
                            onClick={(e: any) => {
                              handleClickListItem5(e);
                              setFilterColumnCriticality(
                                !filterColumnCriticality
                              );
                            }}
                          >
                            {criticalityFilter?.length === 0 ? (
                              <AiOutlineFilter />
                            ) : (
                              <AiFillFilter />
                            )}
                            <Menu
                              anchorEl={anchorEl5}
                              open={filterColumnCriticality}
                              anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "left",
                              }}
                              transformOrigin={{
                                vertical: "top",
                                horizontal: "left",
                              }}
                              style={{
                                paddingLeft: "5px",
                                paddingRight: "5px",
                              }}
                              onClose={() => setAnchorEl5(null)}
                            >
                              {criticalityList?.map((item: any) => (
                                <Box
                                  key={item.value}
                                  style={{
                                    padding: "0px 10px",
                                    fontSize: "12px",
                                    display: "flex",
                                    gap: "7px",
                                  }}
                                >
                                  <Checkbox
                                    checked={criticalityFilter?.includes(
                                      item.value
                                    )}
                                    onClick={(event) => event.stopPropagation()}
                                    onChange={() => {
                                      const value = item.value;
                                      if (criticalityFilter?.includes(value)) {
                                        setCriticalityFilter(
                                          criticalityFilter.filter(
                                            (key: any) => key !== value
                                          )
                                        );
                                      } else {
                                        setCriticalityFilter([
                                          ...criticalityFilter,
                                          value,
                                        ]);
                                      }
                                    }}
                                  />
                                  {item.label}
                                </Box>
                              ))}
                              <Box
                                style={{
                                  display: "flex",
                                  gap: "5px",
                                  marginTop: "5px",
                                  paddingLeft: "5px",
                                  paddingRight: "5px",
                                }}
                              >
                                <Button
                                  style={{
                                    color: "#fff",
                                    backgroundColor: "#003566",
                                  }}
                                  onClick={() => {
                                    getAllMomDataTable(openRowData?._id, true);
                                  }}
                                >
                                  Apply
                                </Button>
                                <Button
                                  onClick={() => {
                                    getAllMomDataTable(openRowData?._id, false);
                                    setCriticalityFilter([]);
                                  }}
                                >
                                  Reset
                                </Button>
                              </Box>
                            </Menu>
                          </IconButton>
                        </div>
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                          // maxWidth: "346px",
                          // minWidth: "346px",
                        }}
                      >
                        Impact
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                          // maxWidth: "346px",
                          // minWidth: "346px",
                        }}
                      >
                        Risk Prediction
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                          // maxWidth: "346px",
                          // minWidth: "346px",
                        }}
                      >
                        Target Date
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <span>Status</span>
                          <IconButton
                            style={{ padding: "0px", margin: "0px" }}
                            onClick={(e: any) => {
                              handleClickListItem4(e);
                              setFilterColumnStatus(!filterColumnStatus);
                            }}
                          >
                            {statusFilter?.length === 0 ? (
                              <AiOutlineFilter />
                            ) : (
                              <AiFillFilter />
                            )}
                            <Menu
                              anchorEl={anchorEl4}
                              open={filterColumnStatus}
                              anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "left",
                              }}
                              transformOrigin={{
                                vertical: "top",
                                horizontal: "left",
                              }}
                              style={{
                                paddingLeft: "5px",
                                paddingRight: "5px",
                              }}
                              onClose={() => setAnchorEl4(null)}
                            >
                              {statusList?.map((item: any) => (
                                <Box
                                  key={item.value}
                                  style={{
                                    padding: "0px 10px",
                                    fontSize: "12px",
                                    display: "flex",
                                    gap: "7px",
                                  }}
                                >
                                  <Checkbox
                                    checked={statusFilter?.includes(item.value)}
                                    onClick={(event) => event.stopPropagation()}
                                    onChange={() => {
                                      const value = item.value;
                                      if (statusFilter?.includes(value)) {
                                        setStatusFilter(
                                          statusFilter.filter(
                                            (key: any) => key !== value
                                          )
                                        );
                                      } else {
                                        setStatusFilter([
                                          ...statusFilter,
                                          value,
                                        ]);
                                      }
                                    }}
                                  />
                                  {item.label}
                                </Box>
                              ))}
                              <Box
                                style={{
                                  display: "flex",
                                  gap: "5px",
                                  marginTop: "5px",
                                  paddingLeft: "5px",
                                  paddingRight: "5px",
                                }}
                              >
                                <Button
                                  style={{
                                    color: "#fff",
                                    backgroundColor: "#003566",
                                  }}
                                  onClick={() => {
                                    getAllMomDataTable(openRowData?._id, true);
                                  }}
                                >
                                  Apply
                                </Button>
                                <Button
                                  onClick={() => {
                                    getAllMomDataTable(openRowData?._id, false);
                                    setStatusFilter([]);
                                  }}
                                >
                                  Reset
                                </Button>
                              </Box>
                            </Menu>
                          </IconButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {momData?.map((item: any) => {
                      const isRowExpanded = expandedRows[item?._id];
                      return (
                        <>
                          <TableRow>
                            <TableCell
                              align="center"
                              style={{
                                padding: "5px",
                                fontSize: "12px",
                                borderRight:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                borderBottom:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                height: "32px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "row",
                                  gap: "5px",
                                  alignItems: "center",
                                }}
                                key={item._id}
                              >
                                {item?.actionPlans?.length === 0 ? (
                                  <div style={{ width: "24px" }}>{""}</div>
                                ) : (
                                  <IconButton
                                    aria-label="expand row"
                                    size="small"
                                    onClick={() => toggleRow(item._id)}
                                  >
                                    {isRowExpanded ? (
                                      <MdRemoveCircleOutline
                                        style={{
                                          fontSize: "18px",
                                          color: "#0E497A",
                                          backgroundColor: "#F8F9F9",
                                          borderRadius: "50%",
                                        }}
                                      />
                                    ) : (
                                      // <Badge
                                      //   count={item?.subtask?.length}
                                      //   size="small"
                                      // >
                                      <Tooltip title={"Status Progress Data"}>
                                        <MdAddCircle
                                          style={{
                                            fontSize: "18px",
                                            color: "#0E497A",
                                            backgroundColor: "#F8F9F9",
                                            borderRadius: "50%",
                                          }}
                                        />
                                      </Tooltip>
                                      // </Badge>
                                    )}
                                  </IconButton>
                                )}
                              </div>
                            </TableCell>
                            {/* <TableCell
                              // align="center"
                              style={{
                                padding: "5px",
                                fontSize: "12px",
                                borderRight:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                borderBottom:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                height: "32px",
                                width: "100px", 
                                wordWrap: "break-word", 
                                whiteSpace: "normal", 
                                overflow: "hidden", 
                                textOverflow: "ellipsis", 
                                display: "-webkit-box", 
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical", 
                              }}
                            >
                              {item?.momTitle}
                            </TableCell> */}
                            <TableCell
                              align="center"
                              style={{
                                padding: "5px",
                                fontSize: "12px",
                                borderRight:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                borderBottom:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                height: "32px",
                              }}
                            >
                              {moment(item?.createdAt)?.format("DD-MM-YYYY")}
                            </TableCell>
                            <TableCell
                              // align="center"
                              style={{
                                padding: "5px",
                                fontSize: "12px",
                                borderRight:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                borderBottom:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                height: "32px",
                                maxWidth: "300px",
                                minWidth: "300px",
                                // wordWrap: "break-word",
                                // whiteSpace: "normal",
                                // overflow: "hidden",
                                // textOverflow: "ellipsis",
                                // display: "-webkit-box",
                                // WebkitLineClamp: 2,
                                // WebkitBoxOrient: "vertical",
                              }}
                            >
                              {item?.discussedItem}
                            </TableCell>
                            <TableCell
                              align="center"
                              style={{
                                padding: "5px",
                                fontSize: "12px",
                                borderRight:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                borderBottom:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                height: "32px",
                              }}
                            >
                              <Tag
                                style={{ width: "auto" }}
                                color={
                                  item.criticality === "High"
                                    ? "red"
                                    : item.criticality === "Normal"
                                    ? "green"
                                    : ""
                                }
                              >
                                {item.criticality}
                              </Tag>
                            </TableCell>
                            <TableCell
                              align="center"
                              style={{
                                padding: "5px",
                                fontSize: "12px",
                                borderRight:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                borderBottom:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                height: "32px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <MultiUserDisplay
                                  data={item.impact}
                                  name={"name"}
                                />
                              </div>
                            </TableCell>
                            <TableCell
                              align="center"
                              style={{
                                padding: "5px",
                                fontSize: "12px",
                                borderRight:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                borderBottom:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                height: "32px",
                              }}
                            >
                              {item.riskPrediction}
                            </TableCell>
                            <TableCell
                              align="center"
                              style={{
                                padding: "5px",
                                fontSize: "12px",
                                borderRight:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                borderBottom:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                height: "32px",
                              }}
                            >
                              {moment(item.targetDate).format("DD-MM-YYYY")}
                            </TableCell>
                            <TableCell
                              align="center"
                              style={{
                                padding: "5px",
                                fontSize: "12px",
                                borderRight:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                borderBottom:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                height: "32px",
                              }}
                            >
                              <Tag
                                style={{ width: "auto" }}
                                color={
                                  item.status === "Open"
                                    ? "red"
                                    : item.status === "Close"
                                    ? "green"
                                    : ""
                                }
                              >
                                {item.status}
                              </Tag>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell
                              style={{ paddingBottom: 0, paddingTop: 0 }}
                              colSpan={7}
                            >
                              <Collapse
                                in={isRowExpanded}
                                timeout="auto"
                                unmountOnExit
                              >
                                <Box margin={1} marginLeft={4}>
                                  <Paper>
                                    <TableContainer
                                      component={Paper}
                                      variant="outlined"
                                    >
                                      <Table>
                                        <TableHead
                                          style={{
                                            backgroundColor: "#E8F3F9",
                                            color: "#00224E",
                                          }}
                                        >
                                          <TableRow>
                                            <TableCell
                                              style={{
                                                color: "#00224E",
                                                fontWeight: "bold",
                                                padding: "5px",
                                                fontSize: "13px",
                                                maxWidth: "346px",
                                                minWidth: "346px",
                                              }}
                                              align="center"
                                            >
                                              Action Plan
                                            </TableCell>
                                            <TableCell
                                              style={{
                                                color: "#00224E",
                                                fontWeight: "bold",
                                                padding: "5px",
                                                fontSize: "13px",
                                                // maxWidth: "346px",
                                                // minWidth: "346px",
                                              }}
                                              align="center"
                                            >
                                              PIC
                                            </TableCell>
                                            <TableCell
                                              style={{
                                                color: "#00224E",
                                                fontWeight: "bold",
                                                padding: "5px",
                                                fontSize: "13px",
                                                width: "90px",
                                                // maxWidth: "346px",
                                                // minWidth: "346px",
                                              }}
                                              align="center"
                                            >
                                              Target Date
                                            </TableCell>
                                            <TableCell
                                              style={{
                                                color: "#00224E",
                                                fontWeight: "bold",
                                                padding: "5px",
                                                fontSize: "13px",
                                                // maxWidth: "346px",
                                                // minWidth: "346px",
                                              }}
                                              align="center"
                                            >
                                              Status
                                            </TableCell>
                                          </TableRow>
                                        </TableHead>
                                        <TableBody>
                                          {item?.actionPlans?.map(
                                            (ele: any) => {
                                              return (
                                                <TableRow>
                                                  <TableCell
                                                    // align="center"
                                                    style={{
                                                      padding: "5px",
                                                      fontSize: "12px",
                                                      borderRight:
                                                        "1px solid rgba(104, 104, 104, 0.1)",
                                                      borderBottom:
                                                        "1px solid rgba(104, 104, 104, 0.1)",
                                                      height: "32px",
                                                      // width: "346px",
                                                      wordWrap: "break-word",
                                                      whiteSpace: "normal",
                                                      overflow: "hidden",
                                                      textOverflow: "ellipsis",
                                                      display: "-webkit-box",
                                                      WebkitLineClamp: 2,
                                                      WebkitBoxOrient:
                                                        "vertical",
                                                    }}
                                                  >
                                                    {ele?.actionPlanName}
                                                  </TableCell>
                                                  <TableCell
                                                    align="center"
                                                    style={{
                                                      padding: "5px",
                                                      fontSize: "12px",
                                                      borderRight:
                                                        "1px solid rgba(104, 104, 104, 0.1)",
                                                      borderBottom:
                                                        "1px solid rgba(104, 104, 104, 0.1)",
                                                      height: "32px",
                                                    }}
                                                  >
                                                    {ele?.pic?.username}
                                                  </TableCell>
                                                  <TableCell
                                                    align="center"
                                                    style={{
                                                      padding: "5px",
                                                      fontSize: "12px",
                                                      borderRight:
                                                        "1px solid rgba(104, 104, 104, 0.1)",
                                                      borderBottom:
                                                        "1px solid rgba(104, 104, 104, 0.1)",
                                                      height: "32px",
                                                    }}
                                                  >
                                                    {moment(
                                                      ele?.targetDate
                                                    ).format("DD-MM-YYYY")}
                                                  </TableCell>
                                                  <TableCell
                                                    align="center"
                                                    style={{
                                                      padding: "5px",
                                                      fontSize: "12px",
                                                      borderRight:
                                                        "1px solid rgba(104, 104, 104, 0.1)",
                                                      borderBottom:
                                                        "1px solid rgba(104, 104, 104, 0.1)",
                                                      height: "32px",
                                                    }}
                                                  >
                                                    <Tag
                                                      style={{ width: "auto" }}
                                                      color={
                                                        item.status === "Open"
                                                          ? "red"
                                                          : item.status ===
                                                            "Close"
                                                          ? "green"
                                                          : ""
                                                      }
                                                    >
                                                      {item.status}
                                                    </Tag>
                                                  </TableCell>
                                                </TableRow>
                                              );
                                            }
                                          )}
                                        </TableBody>
                                      </Table>
                                    </TableContainer>
                                  </Paper>
                                </Box>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        </>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
            <div className={classes.pagination}>
              <Pagination
                size="small"
                current={pageMom}
                pageSize={pageLimitMom}
                total={countMom}
                showTotal={showTotalMom}
                showSizeChanger
                showQuickJumper
                onChange={(page, pageSize) => {
                  handlePaginationMom(page, pageSize);
                }}
              />
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default NPDMainIndex;
