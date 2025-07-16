import React, { useEffect, useState } from "react";
import useStyles from "./styles";
import {
  Badge,
  Button,
  Checkbox,
  Pagination,
  PaginationProps,
  Popover,
  Tag,
  Tooltip,
} from "antd";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { getAllActionPlans } from "apis/npdApi";
import {
  Box,
  Collapse,
  IconButton,
  InputAdornment,
  Menu,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@material-ui/core";

import {
  AiOutlineFilter,
  AiFillFilter,
} from "react-icons/ai";

import axios from "apis/axios.global";
import { MdRemoveCircleOutline } from 'react-icons/md';
import { MdAddCircle } from 'react-icons/md';
import { MdAttachment } from 'react-icons/md';
import { MdOutlineListAlt } from 'react-icons/md';
import { MdAccountCircle } from 'react-icons/md';
import { getUserInfo } from "apis/socketApi";
import { MdSearch } from 'react-icons/md';
import { MdClose } from 'react-icons/md';

const ActionPlan = () => {
  const classes = useStyles();
  const [data, setData] = useState<any[]>([]);
  const navigate = useNavigate();
  const [pageAction, setPageAction] = useState<any>(1);
  const [pageLimitAction, setPageLimitAction] = useState<any>(10);
  const [countAction, setCountAction] = useState<number>(0);
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
  const [optionListByFilter, setOptionListFilter] = useState<any>();
  const [expandedRows, setExpandedRows] = useState<any>({});
  const [userInfo, setUserInfo] = useState<any>();
  const [searchActionPointValue, setActionPointSearchValue] =
    useState<string>("");

  useEffect(() => {
    getAllDataActionItems("");
    dataByFilterOptions();
  }, []);

  useEffect(() => {
    getAllDataActionItems(true);
  }, [pageAction, pageLimitAction, searchActionPointValue]);

  useEffect(() => {
    try {
      getUserInfo()
        .then((response: any) => {
          setUserInfo(response.data);
        })
        .catch((e: any) => console.log(e));
    } catch (err) {
      console.log("err", err);
    }
  }, []);

  useEffect(() => {
    getAllDataActionItems(true);
  }, [filterColumnPic === true]);

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

  const getAllDataActionItems = (condition: any) => {
    try {
      const payload = {
        skip: pageAction,
        limit: pageLimitAction,
        search: searchActionPointValue,
        responseDpt: condition ? responseDpt : "",
        pic: condition ? picFilter : "",
        targetDate: condition ? targetDateFilter : "",
        status: condition ? statusFilter : "",
      };
      getAllActionPlans(payload).then((response: any) => {
        setData(response?.data?.data);
        setCountAction(response?.data?.total);
      });
    } catch (err) {
      console.log(err);
    }
  };

  const dataByFilterOptions = async () => {
    const getDataByFilter = await axios.get(
      `api/npd/filterListActionPointsAll`
    );
    setOptionListFilter(getDataByFilter?.data);
  };

  const showTotalType: PaginationProps["showTotal"] = (total: any) =>
    `Total ${total} items`;

  const handlePaginationType = (page: any, pageSize: any) => {
    setPageAction(page);
    setPageLimitAction(pageSize);
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

  const toggleRow = (rowId: any) => {
    setExpandedRows((prevState: any) => ({
      ...prevState,
      [rowId]: !prevState[rowId],
    }));
  };

  const handleActionPointSearchChange = (e: any) => {
    setPageAction(1);
    setPageLimitAction(10);
    e.preventDefault();
    setActionPointSearchValue(e.target.value);
  };

  const handleClickDiscard = () => {
    setActionPointSearchValue("");
  };

  return (
    <div>
      {/* <NavbarIndex /> */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          paddingTop: "20px",
          paddingBottom: "20px",
        }}
      >
        {/* <Button
          onClick={() => {
            navigate("/NPDNavbar");
          }}
        >
          Exit
        </Button> */}
        <Paper
          style={{
            width: "285px",
            height: "33px",
            float: "right",
            margin: "0px",
            //   borderRadius: "20px",
            border: "1px solid #dadada",
            overflow: "hidden",
          }}
          component="form"
          data-testid="search-field-container"
          elevation={0}
          variant="outlined"
          className={classes.root}
          onSubmit={(e) => {
            e.preventDefault();
            //   handleCheck("mrm");
          }}
        >
          <TextField
            // className={classes.input}
            name={"search"}
            value={searchActionPointValue}
            placeholder={"Search"}
            onChange={handleActionPointSearchChange}
            inputProps={{
              "data-testid": "search-field",
            }}
            InputProps={{
              disableUnderline: true,
              startAdornment: (
                <InputAdornment position="start" className={classes.iconButton}>
                  <MdSearch />
                </InputAdornment>
              ),
              endAdornment: (
                <>
                  {searchActionPointValue && (
                    <InputAdornment position="end">
                      <IconButton onClick={handleClickDiscard}>
                        <MdClose fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  )}
                </>
              ),
            }}
          />
        </Paper>
        <Button
          className={
            filterColumnPic === false
              ? classes?.buttonNpd
              : classes.activeButton
          }
          onClick={() => {
            if (filterColumnPic === false) {
              setFilterColumnPic(true);
              setPicFilter([userInfo?.id]);
              //   getAllDataActionItems(true);
            } else {
              setFilterColumnPic(false);
              getAllDataActionItems(false);
              setPicFilter([]);
            }
            // setFilterColumnPic(true);
            // setPicFilter([userInfo?.id]);
            // getAllDataActionItems(true);
          }}
          icon={<MdAccountCircle />}
        >
          My Action Items
        </Button>
      </div>
      <div className={classes.tableContainer}>
        <Paper>
          <TableContainer component={Paper} variant="outlined">
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
                    style={{
                      color: "#00224E",
                      fontWeight: "bold",
                      padding: "5px",
                      fontSize: "13px",
                      width: "50px",
                    }}
                    align="center"
                  >
                    Sl No.
                  </TableCell>
                  <TableCell
                    style={{
                      color: "#00224E",
                      fontWeight: "bold",
                      padding: "5px",
                      fontSize: "13px",
                      //   width: "400px",
                    }}
                    align="center"
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
                      minWidth: "100px",
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
                        <AiOutlineFilter style={{
                          fontSize: "19px",
                          cursor: "pointer",
                          marginLeft: "10px",
                          paddingTop:"2px"
                        }}/>
                      ) : (
                        <AiFillFilter style={{
                          fontSize: "19px",
                          cursor: "pointer",
                          marginLeft: "10px",
                          paddingTop:"2px"
                        }}/>
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
                              getAllDataActionItems(true);
                            }}
                          >
                            Apply
                          </Button>
                          <Button
                            onClick={() => {
                              getAllDataActionItems(false);
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
                    style={{
                      color: "#00224E",
                      fontWeight: "bold",
                      padding: "5px",
                      fontSize: "13px",
                      width: "140px",
                    }}
                    align="center"
                  >
                    PIC
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
                          <AiOutlineFilter style={{
                            fontSize: "19px",
                            cursor: "pointer",
                            marginLeft: "10px",
                            paddingTop:"2px"
                          }} />
                        ) : (
                          <AiFillFilter style={{
                            fontSize: "19px",
                            cursor: "pointer",
                            marginLeft: "10px",
                            paddingTop:"2px"
                          }}/>
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
                                getAllDataActionItems(true);
                              }}
                            >
                              Apply
                            </Button>
                            <Button
                              onClick={() => {
                                setTargetDateFilter([]);
                                getAllDataActionItems(false);
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
                    style={{
                      color: "#00224E",
                      fontWeight: "bold",
                      padding: "5px",
                      fontSize: "13px",
                      //   width: "400px",
                    }}
                    align="center"
                  >
                    Associated NPD
                  </TableCell>
                  <TableCell
                    style={{
                      color: "#00224E",
                      fontWeight: "bold",
                      padding: "5px",
                      fontSize: "13px",
                      //   width: "400px",
                    }}
                    align="center"
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
                      width: "90px",
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
                          <AiOutlineFilter style={{
                            fontSize: "19px",
                            cursor: "pointer",
                            marginLeft: "10px",
                            paddingTop:"2px"
                          }} />
                        ) : (
                          <AiFillFilter style={{
                            fontSize: "19px",
                            cursor: "pointer",
                            marginLeft: "10px",
                            paddingTop:"2px"
                          }} />
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
                                    setStatusFilter([...statusFilter, value]);
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
                                getAllDataActionItems(true);
                              }}
                            >
                              Apply
                            </Button>
                            <Button
                              onClick={() => {
                                getAllDataActionItems(false);
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
                {data?.map((item: any, index: any) => {
                  const isRowExpanded = expandedRows[item._id];
                  return (
                    <>
                      <TableRow>
                        <TableCell
                          align="center"
                          style={{
                            padding: "5px",
                            fontSize: "12px",
                            borderRight: "1px solid rgba(104, 104, 104, 0.1)",
                            borderBottom: "1px solid rgba(104, 104, 104, 0.1)",
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
                            {item?.statusProgressData?.length === 0 ? (
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
                        <TableCell
                          align="center"
                          style={{
                            padding: "5px",
                            fontSize: "12px",
                            borderRight: "1px solid rgba(104, 104, 104, 0.1)",
                            borderBottom: "1px solid rgba(104, 104, 104, 0.1)",
                            height: "32px",
                          }}
                        >
                          {index + 1}
                        </TableCell>
                        <TableCell
                          // align="center"
                          style={{
                            padding: "5px",
                            fontSize: "12px",
                            borderRight: "1px solid rgba(104, 104, 104, 0.1)",
                            borderBottom: "1px solid rgba(104, 104, 104, 0.1)",
                            height: "32px",
                            maxWidth: "400px",
                            minWidth: "400px", // Set a limit for the width
                            overflow: "hidden", // Hide the overflowed content
                            textOverflow: "ellipsis", // Show three dots when content overflows
                            whiteSpace: "nowrap",
                            // textDecoration: "underLine",
                            cursor: "pointer",
                            // color: "blue",
                          }}
                        >
                          {item?.actionPlanName}
                        </TableCell>
                        <TableCell
                          align="center"
                          style={{
                            padding: "5px",
                            fontSize: "12px",
                            borderRight: "1px solid rgba(104, 104, 104, 0.1)",
                            borderBottom: "1px solid rgba(104, 104, 104, 0.1)",
                            height: "32px",
                          }}
                        >
                          {item?.deptData}
                        </TableCell>
                        <TableCell
                          align="center"
                          style={{
                            padding: "5px",
                            fontSize: "12px",
                            borderRight: "1px solid rgba(104, 104, 104, 0.1)",
                            borderBottom: "1px solid rgba(104, 104, 104, 0.1)",
                            height: "32px",
                          }}
                        >
                          {item?.pic?.username}
                        </TableCell>

                        <TableCell
                          align="center"
                          style={{
                            padding: "5px",
                            fontSize: "12px",
                            borderRight: "1px solid rgba(104, 104, 104, 0.1)",
                            borderBottom: "1px solid rgba(104, 104, 104, 0.1)",
                            height: "32px",
                          }}
                        >
                          {moment(item?.targetDate)?.format("DD-MM-YYYY")}
                        </TableCell>
                        <TableCell
                          align="center"
                          style={{
                            padding: "5px",
                            fontSize: "12px",
                            borderRight: "1px solid rgba(104, 104, 104, 0.1)",
                            borderBottom: "1px solid rgba(104, 104, 104, 0.1)",
                            height: "32px",
                          }}
                        >
                          {item?.npdName}
                        </TableCell>
                        <TableCell
                          // align="center"
                          style={{
                            padding: "5px",
                            fontSize: "12px",
                            borderRight: "1px solid rgba(104, 104, 104, 0.1)",
                            borderBottom: "1px solid rgba(104, 104, 104, 0.1)",
                            height: "32px",
                            maxWidth: "400px",
                            minWidth: "400px", // Set a limit for the width
                            overflow: "hidden", // Hide the overflowed content
                            textOverflow: "ellipsis", // Show three dots when content overflows
                            whiteSpace: "nowrap",
                            // textDecoration: "underLine",
                            cursor: "pointer",
                          }}
                        >
                          {item?.itemName}
                        </TableCell>
                        <TableCell
                          align="center"
                          style={{
                            padding: "5px",
                            fontSize: "12px",
                            borderRight: "1px solid rgba(104, 104, 104, 0.1)",
                            borderBottom: "1px solid rgba(104, 104, 104, 0.1)",
                            height: "32px",
                          }}
                        >
                          <Tag
                            style={{ width: "auto" }}
                            color={
                              item.status === "Open"
                                ? "#fc808a"
                                : item.status === "Close"
                                ? "#5e9c65"
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
                                      {item?.statusProgressData?.map(
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
                                                                display: "flex",
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
                                                                {eles.fileName}
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
                                                      item?.attachments?.length
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
                                                      ? "#fc808a"
                                                      : item.status === "Close"
                                                      ? "#5e9c65"
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
      </div>
      <div className={classes.pagination}>
        <Pagination
          size="small"
          current={pageAction}
          pageSize={pageLimitAction}
          total={countAction}
          showTotal={showTotalType}
          showSizeChanger
          showQuickJumper
          onChange={(page, pageSize) => {
            handlePaginationType(page, pageSize);
          }}
        />
      </div>
    </div>
  );
};

export default ActionPlan;
