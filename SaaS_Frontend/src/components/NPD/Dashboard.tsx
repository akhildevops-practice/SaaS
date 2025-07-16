import React, { useState } from "react";
import useStyles from "./styles";
import useStyles2 from "./Risk/warrantyStyles";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Pagination,
  PaginationProps,
  Row,
  Space,
  Segmented,
} from "antd";
import { MdCached } from 'react-icons/md';
import { MdFilterList } from 'react-icons/md';
import { MdDateRange } from 'react-icons/md';
import { MdWatchLater } from 'react-icons/md';
import { MdDonutLarge } from 'react-icons/md';
import { MdBallot } from 'react-icons/md';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Legend,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { createStyles, Theme, withStyles } from "@material-ui/core";
import { MdHome } from 'react-icons/md';
import { useNavigate } from "react-router-dom";

const { RangePicker } = DatePicker;

const NPDDashboardIndex = () => {
  const Classes = useStyles();
  const classesPagi = useStyles2();
  const [selectedRequestDate, setSelectedRequestDate] = useState<any>([]);
  const [tickValues, setTickValues] = useState<any[]>([]);
  const [modelTablePage, setModelTablePage] = useState(1);
  const [pageAction, setPageAction] = useState<any>(1);
  const [pageLimitAction, setPageLimitAction] = useState<any>(10);
  const [alignValue, setAlignValue] = useState<any>("NPD Summary");
  const navigate = useNavigate();

  const handlePaginationAction = (page: any, pageSize: any) => {
    setPageAction(page);
    setPageLimitAction(pageSize);
  };

  const showTotalAction: PaginationProps["showTotal"] = (total) =>
    `Total ${total} items`;

  const handlePaginationModelTable = (page: any, pageSize: any) => {
    setModelTablePage(page);
  };
  const totalNpd = [
    {
      name: "DNJP",
      value: 2,
    },
    {
      name: "Toyota",
      value: 3,
    },
    {
      name: "Renault",
      value: 6,
    },
    {
      name: "Suzuki",
      value: 4,
    },
  ];

  const COLORSTWO = ["#85C1E9", "#48C9B0", "#F7DC6F", "#F98B86"];
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
    payload,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        style={{ fontSize: "10px", textAlign: "center" }}
      >
        {payload.value}
      </text>
    );
  };
  const totalParts = [
    {
      name: "2024",
      DNJP: 5,
      Toyota: 5,
      Renault: 5,
      Suzuki: 5,
    },
  ];
  const month = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const monthWise = [
    {
      name: "Jan",
      DNJP: 4,
      Toyota: 3,
      Renault: 2,
      Suzuki: 4,
    },
    {
      name: "Feb",
      DNJP: 1,
      Toyota: 2,
      Renault: 4,
      Suzuki: 2,
    },
    {
      name: "Mar",
      DNJP: 1,
      Toyota: 4,
      Renault: 1,
      Suzuki: 2,
    },
    {
      name: "Apr",
      DNJP: 4,
      Toyota: 5,
      Renault: 2,
      Suzuki: 1,
    },
  ];

  const thisMonth = [
    {
      name: "DNJP",
      DNJP: 2,
    },
    {
      name: "Toyota",
      Toyota: 3,
    },
    {
      name: "Renault",
      Renault: 4,
    },
    {
      name: "Suzuki",
      Suzuki: 3,
    },
  ];

  const StyledTableCell = withStyles((theme: Theme) =>
    createStyles({
      head: {
        backgroundColor: "#030A54",
        color: theme.palette.common.white,
      },
      body: {
        fontSize: 13,
      },
    })
  )(TableCell);

  const StyledTableRow = withStyles((theme: Theme) =>
    createStyles({
      root: {
        "&:nth-of-type(odd)": {
          backgroundColor: theme.palette.action.hover,
        },
      },
    })
  )(TableRow);

  const tableData = [
    {
      name: "NPD34C1",
      one: "12",
      two: "23",
      three: "34",
      four: "23",
      five: "22",
    },
    {
      name: "NPD34C2",
      one: "12",
      two: "23",
      three: "34",
      four: "23",
      five: "22",
    },
    {
      name: "NPD34C3",
      one: "12",
      two: "23",
      three: "34",
      four: "23",
      five: "22",
    },
    {
      name: "NPD34C4",
      one: "12",
      two: "23",
      three: "34",
      four: "23",
      five: "22",
    },
  ];
  return (
    <div style={{ backgroundColor: "#F8F9F9" }}>
      {/* <div>
        <NavbarIndex />
      </div> */}
      <div style={{ paddingTop: "10px" }}>
        <Card
          //   hoverable
          className={Classes.firstDiv}
          style={{ padding: "0px" }}
          bodyStyle={{ padding: "5px" }}
        >
          <Space
            wrap
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Segmented
              defaultValue="NPD Summary"
              style={{ marginBottom: 8, background: "#5DADE2", color: "#fff" }}
              onChange={(value) => setAlignValue(value)}
              options={["NPD Summary"]}
              size="large"
            />
            <Row style={{ display: "flex", gap: "20px" }}>
              <Col>
                <MdHome
                  style={{
                    fontSize: "30px",
                    color: "#21618C",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    navigate("/mainpage-management");
                  }}
                />
              </Col>
              <Col style={{ paddingRight: "20px" }}>
                {" "}
                <Button
                  onClick={() => {
                    navigate("/NPD");
                  }}
                >
                  NPD Module
                </Button>
              </Col>
            </Row>
          </Space>
        </Card>
      </div>
      <div
        style={{ paddingTop: "15px", paddingLeft: "8px", paddingRight: "8px" }}
      >
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div style={{ display: "flex", gap: "10px" }}>
            <div>
              <RangePicker
                style={{ width: "100%" }}
                className={Classes.datePickerStyles}
                //value={defaultValues}
                format="DD-MM-YYYY"
                onChange={(e: any, dateStrings: any) => {
                  setSelectedRequestDate(dateStrings);
                }}
              />
            </div>
            <Button
              icon={<MdCached />}
              style={{ backgroundColor: "#2874A6", color: "#fff" }}
            ></Button>
            <Button
              icon={<MdFilterList />}
              style={{ backgroundColor: "#2874A6", color: "#fff" }}
            ></Button>
          </div>
        </div>
        <div style={{ paddingTop: "18px" }}>
          <Row
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "17px",
              width: "100%",
            }}
          >
            <Col>
              {" "}
              <div
                style={{
                  backgroundColor: "#fff",
                  width: "213px",
                  height: "80px",
                  boxShadow: "0px 2px 2px 0px rgba(0,0,0,0.1)",
                  transition: "0.3s",
                  borderRadius: "4px",
                  // display:"flex",
                  // justifyContent:"center",
                  // alignItems:"center"
                  padding: "10px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-around",
                    // paddingTop: "5px",
                  }}
                >
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      backgroundColor: "#FDECE9",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: "50%",
                    }}
                  >
                    <MdBallot
                      style={{ fontSize: "30px", color: "#FD4225" }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "1px",
                      flexDirection: "column",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "18px",
                        color: "#FC4D10",
                        fontWeight: "bold",
                        // height: "30px",
                        textAlign: "center",
                        paddingTop: "10px",
                      }}
                    >
                      120
                    </span>
                    <strong style={{ color: "grey" }}>Total</strong>
                  </div>
                </div>
              </div>
            </Col>
            <Col>
              {" "}
              <div
                style={{
                  backgroundColor: "#fff",
                  width: "213px",
                  height: "80px",
                  boxShadow: "0px 2px 2px 0px rgba(0,0,0,0.1)",
                  transition: "0.3s",
                  borderRadius: "4px",
                  // display:"flex",
                  // justifyContent:"center",
                  // alignItems:"center"
                  padding: "10px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-around",
                    // paddingTop: "5px",
                  }}
                >
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      backgroundColor: "#F5EEF8",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: "50%",
                    }}
                  >
                    <MdDateRange
                      style={{ fontSize: "30px", color: "#884EA0" }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "1px",
                      flexDirection: "column",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "18px",
                        color: "#FC4D10",
                        fontWeight: "bold",
                        // height: "30px",
                        textAlign: "center",
                        paddingTop: "10px",
                      }}
                    >
                      20
                    </span>
                    <strong style={{ color: "grey" }}>For This Year</strong>
                  </div>
                </div>
              </div>
            </Col>
            <Col>
              {" "}
              <div
                style={{
                  backgroundColor: "#fff",
                  width: "213px",
                  height: "80px",
                  boxShadow: "0px 2px 2px 0px rgba(0,0,0,0.1)",
                  transition: "0.3s",
                  borderRadius: "4px",
                  // display:"flex",
                  // justifyContent:"center",
                  // alignItems:"center"
                  padding: "10px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-around",
                    // paddingTop: "5px",
                  }}
                >
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      backgroundColor: "#FDE9FA",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: "50%",
                    }}
                  >
                    <MdDonutLarge
                      style={{ fontSize: "30px", color: "#F919D7" }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "1px",
                      flexDirection: "column",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "18px",
                        color: "#FC4D10",
                        fontWeight: "bold",
                        // height: "30px",
                        textAlign: "center",
                        paddingTop: "10px",
                      }}
                    >
                      15
                    </span>
                    <strong style={{ color: "grey" }}>In Progress</strong>
                  </div>
                </div>
              </div>
            </Col>
            <Col>
              {" "}
              <div
                style={{
                  backgroundColor: "#fff",
                  width: "213px",
                  height: "80px",
                  boxShadow: "0px 2px 2px 0px rgba(0,0,0,0.1)",
                  transition: "0.3s",
                  borderRadius: "4px",
                  // display:"flex",
                  // justifyContent:"center",
                  // alignItems:"center"
                  padding: "10px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-around",
                    // paddingTop: "5px",
                  }}
                >
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      backgroundColor: "#FCEDEF",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: "50%",
                    }}
                  >
                    <MdWatchLater
                      style={{ fontSize: "30px", color: "#FA274B" }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "1px",
                      flexDirection: "column",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "18px",
                        color: "#FC4D10",
                        fontWeight: "bold",
                        // height: "30px",
                        textAlign: "center",
                        paddingTop: "10px",
                      }}
                    >
                      03
                    </span>
                    <strong style={{ color: "grey" }}>Delayed</strong>
                  </div>
                </div>
              </div>
            </Col>
            <Col>
              {" "}
              <div
                style={{
                  backgroundColor: "#fff",
                  //   width: "243px",
                  height: "80px",
                  boxShadow: "0px 2px 2px 0px rgba(0,0,0,0.1)",
                  transition: "0.3s",
                  borderRadius: "4px",
                  // display:"flex",
                  // justifyContent:"center",
                  // alignItems:"center"
                  padding: "10px",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    // paddingTop: "5px",
                    gap: "3px",
                  }}
                >
                  <strong
                    style={{
                      color: "grey",
                      fontSize: "15px",
                      textAlign: "center",
                    }}
                  >
                    Activity Risk Rating
                  </strong>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-around",
                      borderTop: "1px solid #7FB3D5",
                      paddingTop: "5px",
                    }}
                  >
                    <div
                      style={{
                        width: "81px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRight: "1px solid #85C1E9",
                        // backgroundColor:"#FCEDEF"
                      }}
                    >
                      {" "}
                      <span
                        style={{
                          fontSize: "18px",
                          color: "#FC0324",
                          fontWeight: "bold",
                          // height: "30px",
                          textAlign: "center",
                          paddingTop: "10px",
                        }}
                      >
                        20
                      </span>
                    </div>
                    <div
                      style={{
                        width: "81px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRight: "1px solid #85C1E9",
                      }}
                    >
                      {" "}
                      <span
                        style={{
                          fontSize: "18px",
                          color: "#FC4D10",
                          fontWeight: "bold",
                          // height: "30px",
                          textAlign: "center",
                          paddingTop: "10px",
                        }}
                      >
                        40
                      </span>
                    </div>
                    <div
                      style={{
                        width: "81px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "18px",
                          color: "green",
                          fontWeight: "bold",
                          // height: "30px",
                          textAlign: "center",
                          paddingTop: "10px",
                        }}
                      >
                        60
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
        <div style={{ paddingTop: "20px", paddingBottom: "20px" }}>
          <Row
            style={{
              display: "flex",
              gap: "11px",
              paddingTop: "10px",
              justifyContent: "space-around",
            }}
          >
            <Col
              style={{
                border: "1px solid #F2F3F4",
                backgroundColor: "#fff",
                borderRadius: "5px",
                // boxShadow:"0px 2px 2px 2px rgba(0, 0, 0, .1)"
              }}
            >
              <h1
                style={{
                  margin: "0",
                  textAlign: "center",
                  borderBottom: "1px solid #F2F3F4",
                }}
              >
                Year Wise Total NPD
              </h1>

              <BarChart
                width={380}
                height={250}
                data={totalParts}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
                barSize={30}
                layout="vertical"
                // onClick={handleYearClick}
              >
                <XAxis
                  type="number"
                  tick={{ fontSize: 10 }}
                  ticks={tickValues}
                  // ticks={tickValues}
                />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }}>
                  <Label value="Years" angle={-90} position="insideLeft" />
                </YAxis>
                <Tooltip />
                <Legend />
                <CartesianGrid strokeDasharray="3 3" />
                <Bar
                  dataKey="DNJP"
                  stackId="a"
                  // shape={customBarShape}
                  fill="#85C1E9"
                  // background={{ fill: "#eee" }}
                  // label={renderCustomBarLabel}
                />
                <Bar
                  dataKey="Toyota"
                  stackId="a"
                  // shape={customBarShape}
                  fill="#48C9B0"
                  // background={{ fill: "#eee" }}
                  //   label={{ position: "right" }}
                />
                <Bar
                  dataKey="Renault"
                  stackId="a"
                  // shape={customBarShape}
                  fill="#F7DC6F"
                  // background={{ fill: "#eee" }}
                  //   label={{ position: "right" }}
                />
                <Bar
                  dataKey="Suzuki"
                  stackId="a"
                  // shape={customBarShape}
                  fill="#F98B86"
                  // background={{ fill: "#eee" }}
                  label={{ position: "right" }}
                />
              </BarChart>
            </Col>
            <Col
              style={{
                border: "1px solid #F2F3F4",
                backgroundColor: "#fff",
                borderRadius: "5px",
                // boxShadow:"0px 2px 2px 2px rgba(0, 0, 0, .1)"
              }}
            >
              <h1
                style={{
                  margin: "0",
                  textAlign: "center",
                  borderBottom: "1px solid #F2F3F4",
                }}
              >
                Month Wise Total NPD
              </h1>
              <BarChart
                width={380}
                height={250}
                data={monthWise}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
                barSize={30}
                //   onClick={handleMonthClick}
                // onClick={handleTotalHoursClick}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} ticks={tickValues}>
                  <Label value="No.s" angle={-90} position="insideLeft" />
                </YAxis>
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="DNJP"
                  stackId="a"
                  // shape={customBarShape}
                  fill="#85C1E9"
                  // background={{ fill: "#eee" }}
                  //   label={{ position: "center" }}
                />
                <Bar
                  dataKey="Toyota"
                  stackId="a"
                  // shape={customBarShape}
                  fill="#48C9B0"
                  // background={{ fill: "#eee" }}
                  //   label={{ position: "center" }}
                />
                <Bar
                  dataKey="Renault"
                  stackId="a"
                  // shape={customBarShape}
                  fill="#F7DC6F"
                  // background={{ fill: "#eee" }}
                  //   label={{ position: "center" }}
                />
                <Bar
                  dataKey="Suzuki"
                  stackId="a"
                  // shape={customBarShape}
                  fill="#F98B86"
                  // background={{ fill: "#eee" }}
                  //   label={{ position: "center", color: "#fff" }}
                />
              </BarChart>
            </Col>
            <Col
              style={{
                border: "1px solid #F2F3F4",
                backgroundColor: "#fff",
                borderRadius: "5px",
                position: "relative",
                // boxShadow:"0px 2px 2px 2px rgba(0, 0, 0, .1)"
              }}
            >
              <h1
                style={{
                  margin: "0",
                  textAlign: "center",
                  borderBottom: "1px solid #F2F3F4",
                }}
              >
                Supplier Wise
              </h1>
              <PieChart width={380} height={250}>
                <Pie
                  data={totalNpd}
                  // cx={200}
                  // cy={200}
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  // onClick={handleStatusClick}
                >
                  {totalNpd.map((entry: any, index: any) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORSTWO[index % COLORSTWO.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend align="center" />
              </PieChart>
            </Col>
          </Row>
          <Row
            style={{
              display: "flex",
              gap: "11px",
              paddingTop: "10px",
              justifyContent: "space-around",
            }}
          >
            <Col
              style={{
                border: "1px solid #F2F3F4",
                backgroundColor: "#fff",
                borderRadius: "5px",
                // boxShadow:"0px 2px 2px 2px rgba(0, 0, 0, .1)"
              }}
            >
              <h1
                style={{
                  margin: "0",
                  textAlign: "center",
                  borderBottom: "1px solid #F2F3F4",
                }}
              >
                This Month Total NPD
              </h1>
              <BarChart
                width={570}
                height={250}
                data={thisMonth}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
                barSize={30}
                //   onClick={handleMonthClick}
                // onClick={handleTotalHoursClick}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} ticks={tickValues}>
                  <Label value="No.s" angle={-90} position="insideLeft" />
                </YAxis>
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="DNJP"
                  stackId="a"
                  // shape={customBarShape}
                  fill="#85C1E9"
                  // background={{ fill: "#eee" }}
                  //   label={{ position: "center" }}
                />
                <Bar
                  dataKey="Toyota"
                  stackId="a"
                  // shape={customBarShape}
                  fill="#48C9B0"
                  // background={{ fill: "#eee" }}
                  //   label={{ position: "center" }}
                />
                <Bar
                  dataKey="Renault"
                  stackId="a"
                  // shape={customBarShape}
                  fill="#F7DC6F"
                  // background={{ fill: "#eee" }}
                  //   label={{ position: "center" }}
                />
                <Bar
                  dataKey="Suzuki"
                  stackId="a"
                  // shape={customBarShape}
                  fill="#F98B86"
                  // background={{ fill: "#eee" }}
                  //   label={{ position: "center" }}
                />
              </BarChart>
            </Col>
            <Col
              style={{
                border: "1px solid #F2F3F4",
                backgroundColor: "#fff",
                borderRadius: "5px",
                padding: "0px 10px 0px 10px",
                // boxShadow:"0px 2px 2px 2px rgba(0, 0, 0, .1)"
              }}
            >
              <h1
                style={{
                  margin: "0",
                  textAlign: "center",
                  borderBottom: "1px solid #F2F3F4",
                }}
              >
                Activities -Risk Rating
              </h1>
              <TableContainer style={{ paddingTop: "2px" }}>
                <Table style={{ width: "540px" }} aria-label="customized table">
                  <TableHead>
                    <TableRow style={{ height: "35px" }}>
                      <StyledTableCell
                        align="center"
                        style={{ fontSize: "13px" }}
                      >
                        NPD
                      </StyledTableCell>
                      <StyledTableCell
                        align="center"
                        style={{ fontSize: "13px" }}
                      >
                        Risk L-1
                      </StyledTableCell>
                      <StyledTableCell
                        align="center"
                        style={{ fontSize: "13px" }}
                      >
                        Risk L-2
                      </StyledTableCell>
                      <StyledTableCell
                        align="center"
                        style={{ fontSize: "13px" }}
                      >
                        Risk L-3
                      </StyledTableCell>
                      <StyledTableCell
                        align="center"
                        style={{ fontSize: "13px" }}
                      >
                        Risk L-4
                      </StyledTableCell>
                      <StyledTableCell
                        align="center"
                        style={{ fontSize: "13px" }}
                      >
                        Risk L-5
                      </StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tableData?.map((row: any) => (
                      <StyledTableRow key={row.name} style={{ height: "35px" }}>
                        <StyledTableCell
                          component="th"
                          scope="row"
                          align="center"
                        >
                          {row.name}
                        </StyledTableCell>
                        <StyledTableCell
                          align="center"
                          //   onClick={() => handleTableClick(row.name, "Jan")}
                        >
                          {row.one}
                        </StyledTableCell>
                        <StyledTableCell
                          align="center"
                          //   onClick={() => handleTableClick(row.name, "Feb")}
                        >
                          {row.two}
                        </StyledTableCell>
                        <StyledTableCell
                          align="center"
                          //   onClick={() => handleTableClick(row.name, "Mar")}
                        >
                          {row.three}
                        </StyledTableCell>
                        <StyledTableCell
                          align="center"
                          //   onClick={() => handleTableClick(row.name, "Mar")}
                        >
                          {row.four}
                        </StyledTableCell>
                        <StyledTableCell
                          align="center"
                          //   onClick={() => handleTableClick(row.name, "Mar")}
                        >
                          {row.five}
                        </StyledTableCell>
                      </StyledTableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <div className={classesPagi.pagination}>
                <Pagination
                  size="small"
                  current={modelTablePage}
                  pageSize={10}
                  total={tableData?.length}
                  showTotal={showTotalAction}
                  onChange={(page, pageSize) => {
                    handlePaginationModelTable(page, pageSize);
                  }}
                />
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default NPDDashboardIndex;
