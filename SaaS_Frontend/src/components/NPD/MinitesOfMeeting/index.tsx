import React, { useEffect, useState } from "react";
import {
  Button,
  Input,
  Select,
  Checkbox,
  Row,
  Tooltip,
  Pagination,
  PaginationProps,
} from "antd";
import moment from "moment";

import "react-big-calendar/lib/css/react-big-calendar.css";

import { DatePicker } from "antd";

import useStyles from "./styles";
import {
  Box,
  IconButton,
  Menu,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import { useNavigate } from "react-router-dom";

import { getAllMinutesOfMeeting, getAllNPDListDrop } from "apis/npdApi";
import { MdPictureAsPdf, MdMyLocation } from "react-icons/md";
import MultiUserDisplay from "components/MultiUserDisplay";
import EditImgIcon from "../../../assets/documentControl/Edit.svg";
import axios from "apis/axios.global";
import getSessionStorage from "utils/getSessionStorage";
import {
  AiOutlineFilter,
  AiFillFilter,
} from "react-icons/ai";

const { RangePicker } = DatePicker;

const MinutesOfMeeting = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [selectedRequestDate, setSelectedRequestDate] = useState<any>([]);
  const [momAllData, setMomAllData] = useState<any>([]);
  const defaultRequestValues = selectedRequestDate?.map((dateString: any) =>
    moment(dateString, "DD-MM-YYYY")
  );
  const [expandedRows, setExpandedRows] = useState<any>({});
  const [pa, setPa] = useState<any>([]);
  const userDetail = getSessionStorage();
  const [pageAction, setPageAction] = useState<any>(1);
  const [pageLimitAction, setPageLimitAction] = useState<any>(10);
  const [countAction, setCountAction] = useState<number>(0);
  const [picFilter, setPicFilter] = useState<any[]>([]);

  const [anchorEl1, setAnchorEl1] = React.useState<null | HTMLElement>(null);

  const [npdList, setNpdList] = useState<any>([]);
  const [selectedNpd, setSelectedNpd] = useState<any>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [associatedDeptAnchorEl1, setAssociatedDeptAnchorEl1] =
    React.useState<null | HTMLElement>(null);
  const [filterColumnAssociatedDept, setFilterColumnAssociatedDept] =
    useState(false);
  const [associatedDeptFilterOptions, setAssociatedDeptFilterOptions] =
    useState<any[]>([]);
  const [selectedAssociatedDeptFilter, setSelectedAssociatedDeptFilter] =
    useState<any[]>([]);

  useEffect(() => {
    // getAllMomData('');
    getProjectAdmins();
    dropDownValueNpdList();
    getAssociatedDepts();
  }, []);

  useEffect(() => {
    getAllMomData("");
  }, [pageAction, pageLimitAction, searchTerm]);

  const handleClickListItem2 = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl1(event.currentTarget);
  };

  const handleAssociatedDeptFilter = (event: React.MouseEvent<HTMLElement>) => {
    setAssociatedDeptAnchorEl1(event.currentTarget);
  };

  const dropDownValueNpdList = () => {
    getAllNPDListDrop()?.then((response: any) => {
      setNpdList(response?.data);
    });
  };

  const getAllMomData = (condition: any) => {
    let payload = {
      skip: pageAction,
      limit: pageLimitAction,
      searchTerm: searchTerm,
      pic: condition ? picFilter : "",
      associatedDeptFilter: condition ? selectedAssociatedDeptFilter : "",
      selectedNpd: condition ? selectedNpd : "",
      meetingDates: condition ? selectedRequestDate : "",
    };
    getAllMinutesOfMeeting(payload).then((response: any) => {
      setMomAllData(response?.data?.data);
      setCountAction(response?.data?.total);
    });
  };

  const toggleRow = (rowId: any) => {
    setExpandedRows((prevState: any) => ({
      ...prevState,
      [rowId]: !prevState[rowId],
    }));
  };
  const getProjectAdmins = async () => {
    const result = await axios.get(`/api/configuration`);
    if (result?.data[0]?.pmUserData) {
      setPa(result?.data[0]?.pmUserData);
    }
  };

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

  const showTotalType: PaginationProps["showTotal"] = (total: any) =>
    `Total ${total} items`;

  const handlePaginationType = (page: any, pageSize: any) => {
    setPageAction(page);
    setPageLimitAction(pageSize);
  };

  const handleClickDiscard = () => {
    setSearchTerm("");
  };

  const handleActionPointSearchChange = (e: any) => {
    setPageAction(1);
    setPageLimitAction(10);
    e.preventDefault();
    // setSearchTerm(e.target.value);
  };

  const handleChange = (event: any) => {
    setPageAction(1);
    setPageLimitAction(10);
    setSearchTerm(event.target.value);
  };

  const getAssociatedDepts = async () => {
    const result = await axios.get("/api/configuration/getAllNpdConfig");
    setAssociatedDeptFilterOptions(
      result.data.map((item: any) => {
        return { id: item?.deptId, name: item?.dptData };
      })
    );
  };

  return (
    <div>
      {/* <NavbarIndex /> */}
      <div className={classes.divMainContainer}>
        {/* <div>
          <Button
            className={classes.backButton}
            onClick={() => {
              navigate("/NPDNavbar");
            }}
          >
            Exit
          </Button>
        </div> */}

        <div className={classes.selectorTitleDiv}>
          <div className={classes.subSelectorDiv}>
            <strong>NPD :</strong>
            <Select
              value={npdList.find((item: any) => item.value === selectedNpd)}
              placeholder="Select NPD"
              style={{ width: "200px", color: "black" }}
              onChange={(e: any) => {
                setSelectedNpd(e);
              }}
              options={npdList}
            />
          </div>
          <div className={classes.subSelectorDiv}>
            <strong>Meeting Dates :</strong>
            <RangePicker
              style={{ width: "250px" }}
              value={defaultRequestValues}
              format="DD-MM-YYYY"
              onChange={(e: any, dateStrings: any) => {
                setSelectedRequestDate(dateStrings);
              }}
            />
          </div>
          <Button
            style={{
              color: "#fff",
              backgroundColor: "#003566",
            }}
            onClick={() => {
              setSelectedAssociatedDeptFilter([]);
              getAllMomData(true);
            }}
          >
            Apply
          </Button>
          <Button
            onClick={() => {
              setSelectedAssociatedDeptFilter([]);
              setSelectedNpd([]);
              setSelectedRequestDate([]);
              getAllMomData(false);
            }}
          >
            Reset
          </Button>
          {/* <div className={classes.subSelectorDiv}>
            <strong>Status :</strong>
            <Select
              // value={prcForm.pcrCategory}
              placeholder="Select Status"
              style={{ width: "200px", color: "black" }}
              // size="large"
              onChange={(e: any) => {
                // handlerOptionsData("pcrCategory", e);
              }}
              options={[
                { value: "Open", label: "Open" },
                { value: "Close", label: "Close" },
              ]}
            />
          </div> */}
        </div>
        <div>
          {pa.some((item: any) => item.id === userDetail.id) && (
            <Button
              className={classes.backButton}
              onClick={() => {
                navigate("/MeetingCreatingIndex");
              }}
            >
              Create MoM
            </Button>
          )}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "end",
          width: "100%",
          marginRight: "20px",
          marginTop: "20px",
        }}
      >
        <Input
          placeholder="Search Meeting"
          style={{ width: "350px", paddingRight: "20px" }}
          value={searchTerm}
          onChange={handleChange}
          // onKeyDown={handleKeyDown}
        />
      </div>
      <div style={{ paddingTop: "25px" }}>
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
                  {/* <TableCell
                    style={{
                      color: "#00224E",
                      fontWeight: "bold",
                      padding: "5px",
                      fontSize: "13px",
                      width: "20px",
                    }}
                    align="center"
                  ></TableCell> */}
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
                    }}
                    align="center"
                  >
                    Meeting Title
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
                    Start Date
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
                    End Date
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
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span>Meeting Owner</span>
                      {/* <IconButton
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
                          anchorEl={anchorEl1}
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
                          {pa?.map((item: any) => (
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
                              {item.username}
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
                                getAllMomData(true);
                              }}
                            >
                              Apply
                            </Button>
                            <Button
                              onClick={() => {
                                getAllMomData(false);
                                setPicFilter([]);
                              }}
                            >
                              Reset
                            </Button>
                          </Box>
                        </Menu>
                      </IconButton> */}
                    </div>
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
                    <span>Associated Dept.</span>
                    <IconButton
                      style={{ padding: "0px", margin: "0px" }}
                      onClick={(e: any) => {
                        handleAssociatedDeptFilter(e);
                        setFilterColumnAssociatedDept(
                          !filterColumnAssociatedDept
                        );
                      }}
                    >
                      {selectedAssociatedDeptFilter?.length === 0 ? (
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
                        anchorEl={associatedDeptAnchorEl1}
                        open={filterColumnAssociatedDept}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "left",
                        }}
                        transformOrigin={{
                          vertical: "top",
                          horizontal: "left",
                        }}
                      >
                        {associatedDeptFilterOptions?.map((item: any) => (
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
                              checked={selectedAssociatedDeptFilter?.includes(
                                item.id
                              )}
                              onClick={(event) => event.stopPropagation()}
                              onChange={() => {
                                const value = item.id;
                                if (
                                  selectedAssociatedDeptFilter?.includes(value)
                                ) {
                                  setSelectedAssociatedDeptFilter(
                                    selectedAssociatedDeptFilter.filter(
                                      (key: any) => key !== value
                                    )
                                  );
                                } else {
                                  setSelectedAssociatedDeptFilter([
                                    ...selectedAssociatedDeptFilter,
                                    value,
                                  ]);
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
                              getAllMomData(true);
                            }}
                          >
                            Apply
                          </Button>
                          <Button
                            onClick={() => {
                              getAllMomData(false);
                              setSelectedAssociatedDeptFilter([]);
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
                    }}
                    align="center"
                  >
                    Attendees
                  </TableCell>
                  {/*  <TableCell
                    style={{
                      color: "#00224E",
                      fontWeight: "bold",
                      padding: "5px",
                      fontSize: "13px",
                    }}
                  >
                    Import
                  </TableCell>
                  <TableCell
                    style={{
                      color: "#00224E",
                      fontWeight: "bold",
                      padding: "5px",
                      fontSize: "13px",
                    }}
                  >
                    Risk Prediction
                  </TableCell> */}
                  {/* <TableCell
                    style={{
                      color: "#00224E",
                      fontWeight: "bold",
                      padding: "5px",
                      fontSize: "13px",
                    }}
                    align="center"
                  >
                    Status
                  </TableCell> */}
                  <TableCell
                    style={{
                      color: "#00224E",
                      fontWeight: "bold",
                      padding: "5px",
                      fontSize: "13px",
                    }}
                    align="center"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {momAllData?.map((ele: any, i: any) => {
                  const isRowExpanded = expandedRows[ele._id];
                  return (
                    <>
                      <TableRow style={{ fontSize: "12px" }}>
                        {/* <TableCell
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
                            key={ele._id}
                          >
                            {ele?.actionPlans?.length === 0 ? (
                              <div style={{ width: "24px" }}>{""}</div>
                            ) : (
                              <IconButton
                                aria-label="expand row"
                                size="small"
                                onClick={() => toggleRow(ele._id)}
                              >
                                {isRowExpanded ? (
                                  <RemoveCircleOutlineIcon
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
                                  <AddCircleIcon
                                    style={{
                                      fontSize: "18px",
                                      color: "#0E497A",
                                      backgroundColor: "#F8F9F9",
                                      borderRadius: "50%",
                                    }}
                                  />
                                  // </Badge>
                                )}
                              </IconButton>
                            )}
                          </div>
                        </TableCell> */}
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
                          {i + 1}
                        </TableCell>
                        <TableCell
                          // align="center"
                          style={{
                            padding: "5px",
                            fontSize: "12px",
                            borderRight: "1px solid rgba(104, 104, 104, 0.1)",
                            borderBottom: "1px solid rgba(104, 104, 104, 0.1)",
                            height: "32px",
                            maxWidth: "150px", // Set a limit for the width
                            overflow: "hidden", // Hide the overflowed content
                            textOverflow: "ellipsis", // Show three dots when content overflows
                            whiteSpace: "nowrap", // Prevent text wrapping
                          }}
                        >
                          <Tooltip title={ele.meetingName}>
                            <span
                              style={{
                                display: "inline-block",
                                maxWidth: "100%",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                color: "blue",
                                cursor: "pointer",
                                textDecoration: "underline",
                              }}
                              onClick={() => {
                                navigate(`/MeetingCreatingIndex/${ele._id}`, {
                                  state: { read: true },
                                });
                              }}
                            >
                              {ele.meetingName}
                            </span>
                          </Tooltip>
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
                          {convertTo12HourFormat(ele.meetingDateForm)}
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
                          {convertTo12HourFormat(ele.meetingDateTo)}
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
                          {ele?.meetingOwner?.username}
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
                          {" "}
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <MultiUserDisplay
                              data={ele?.presentDptData?.map(
                                (item: any) => item?.entityName
                              )}
                              name={"entityName"}
                            />
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
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <MultiUserDisplay
                              data={ele?.attendees?.map(
                                (item: any) => item?.username
                              )}
                              name={"username"}
                            />
                          </div>
                        </TableCell>
                        {/* <TableCell
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
                            style={{ width: "auto", }}
                            color={
                              ele.status === "Open"
                                ? "#fd799b"
                                : ele.status === "Close"
                                ? "#79fd8d"
                               
                                : "#00FF7F"
                            }
                          >
                            {ele.status}
                          </Tag>
                        </TableCell> */}
                        <TableCell
                          align="center"
                          style={{
                            padding: "5px",
                            fontSize: "12px",
                            borderRight: "1px solid rgba(104, 104, 104, 0.1)",
                            borderBottom: "1px solid rgba(104, 104, 104, 0.1)",
                            height: "36px",
                            alignItems: "center",
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          <Row
                            style={{
                              display: "flex",
                              gap: "10px",
                              alignItems: "center",
                            }}
                          >
                            {pa.some(
                              (item: any) => item.id === userDetail.id
                            ) && (
                              <>
                                <Tooltip title="Edit MoM">
                                  <IconButton
                                    style={{ padding: "0px", margin: "0px" }}
                                    onClick={() => {
                                      navigate(
                                        `/MeetingCreatingIndex/${ele._id}`
                                      );
                                    }}
                                  >
                                    <img
                                      src={EditImgIcon}
                                      style={{ width: "17px", height: "17px" }}
                                    />
                                  </IconButton>
                                </Tooltip>
                                {/* <IconButton
                                  style={{ padding: "0px", margin: "0px" }}
                                >
                                  <img
                                    src={DeleteIcon}
                                    style={{ width: "17px", height: "17px" }}
                                  />
                                </IconButton> */}
                              </>
                            )}
                            <IconButton
                              style={{ padding: "0px", margin: "0px" }}
                            >
                              <MdMyLocation style={{ color: "#003566" }} />
                            </IconButton>
                            <IconButton
                              style={{ padding: "0px", margin: "0px" }}
                            >
                              <MdPictureAsPdf style={{ color: "red" }} />
                            </IconButton>
                          </Row>
                        </TableCell>
                      </TableRow>
                      {/* <TableRow>
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
                            
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow> */}
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

export default MinutesOfMeeting;