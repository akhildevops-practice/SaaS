import React, { useEffect, useState } from "react";

import {
  Breadcrumb,
  Button,
  Checkbox,
  Select,
  Tabs,
  Tag,
  Tooltip,
} from "antd";
import TabPane from "antd/es/tabs/TabPane";
import { makeStyles } from "@material-ui/core/styles";
import axios from "apis/axios.global";
import { useSnackbar } from "notistack";
import { MdOutlineWarning } from 'react-icons/md';
import Table, { ColumnsType } from "antd/es/table";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import getAppUrl from "utils/getAppUrl";
import CapaNewChart from "./CapaNewChart";

const useStyles = makeStyles(() => ({
  tableHeader: {
    padding: "10px !important", // Set padding for table header cells
    borderBottom: "1px solid #ddd", // Add a dim border to header
  },
  highlightRow: {
    backgroundColor: "#d9d9d9",
    fontWeight: "bold",
  },
  cellHighlight: {
    backgroundColor: "#FFEB3B", // Change to your desired color
    color: "black",
    fontWeight: "bold", // Bold font for last row cell
  },
  tableContainerScrollable: {
    marginBottom: "20px", // Adjust the value as needed
    maxHeight: "calc(85vh - 20vh)", // Adjust the max-height value as needed
    overflowY: "auto",

    "&::-webkit-scrollbar": {
      width: "8px",
      height: "10px", // Adjust the height value as needed
      backgroundColor: "#e5e4e2",
    },
    "&::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "grey",
    },
  },
  checkbox: {
    "& .ant-checkbox-inner": {
      border: "2px solid rgba(0, 0, 0, 0.6)", // Darker border with opacity
      borderRadius: "4px", // Optional: make the checkbox border rounded
    },
    "& .ant-checkbox-checked .ant-checkbox-inner": {
      borderColor: "#1890FF", // Blue border when checked
    },
    "& .ant-checkbox:hover .ant-checkbox-inner": {
      borderColor: "rgba(0, 0, 0, 0.8)", // Darker border on hover
    },
  },

  tabsWrapper: {
    "& .ant-tabs-tab": {
      backgroundColor: "white !important",
      color:
        "#000 !important" /* Fixed the color value (black should be "#000") */,
      margin: "0 !important",
      borderRadius: "0px",
      paddingTop: "10px",
      textAlign: "left !important" /* Keep the text left-aligned */,
      fontSize: "14px",
      outline: "none !important",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      height: "50px",
    },

    "& .ant-tabs-tab-btn": {
      letterSpacing: "0.6px",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      textAlign: "left !important",
      height: "100%",
      width: "100%",
    },

    "& .ant-tabs-tab-active": {
      backgroundColor: "#F0F0F0 !important",
      // borderLeft: "3px solid #003536",
      outline: "none !important",
      boxShadow: "none !important",
    },

    "& .ant-tabs-tab-active div": {
      color: "#003536 !important",
      fontWeight: "600",
      outline: "none !important",
    },

    "& div.ant-tabs-tab": {
      padding: "5px !important",
    },

    "& .ant-tabs-nav": {
      borderBottom: "none !important",
    },

    "& .ant-tabs-ink-bar": {
      backgroundColor: "#003536", // Ink bar color
      height: "2px !important", // Thickness of the ink bar
      bottom: "0", // Ensure it's at the bottom of the tabs
      transition: "transform 0.3s ease", // Smooth transition
      left: "0", // Align it horizontally under the tab
      right: "0", // Make it span the entire width of the tab bar
    },

    "& .ant-tabs-tab:focus, .ant-tabs-tab:active, .ant-tabs-tab-focus": {
      outline: "none !important",
      boxShadow: "none !important",
    },

    // Specifically remove any focus-related styles applied by Ant Design
    "& .ant-tabs-tab:focus-visible": {
      outline: "none !important",
      boxShadow: "none !important",
      color: "none !important",
    },
  },
  tab: {
    color: "black",
    fontWeight: "normal", // Inactive tabs will not be bold
  },
  activeTab: {
    backgroundColor: "#000", // Active tab will have black background
    color: "white", // Active tab will have white text
    fontWeight: "bold", // Active tab will be bold
  },
  tableContainer: {
    // Table Header Styles
    // "& .ant-table-thead > tr > th": {
    //   backgroundColor: "#E8F3F9", // Set the table header background color to yellow
    // },
    "& .ant-table-thead .ant-table-cell": {
      // backgroundColor: ({ headerBgColor }) => headerBgColor,
      // color: ({ tableColor }) => tableColor,
      backgroundColor: "#E8F3F9",
      borderBottom: "1px solid #003059",
      padding: "4px 12px",
      // fontFamily: "Poppins !important",
      color: "#00224E",
    },
    // Table Body Styles
    "& .ant-table-tbody > tr > td": {
      // border: "0.5px solid #E6E8EA", // Add a border around each table body cell
      padding: "2px 12px", // Adjust the padding as needed
      height: "50px", // Set the height of the table cells
    },
    // "& tr.ant-table-row:nth-child(odd)": {
    //   backgroundColor: "#F5F5F5", // Odd row color
    // },
    // "& tr.ant-table-row:nth-child(even)": {
    //   backgroundColor: "#FFFFFF", // Even row color
    // },
  },
  tableCell: {
    padding: "10px !important", // Set padding for table body cells
    borderBottom: "1px solid #ddd", // Add border to the body cells
  },
}));
const CapaReportModal = () => {
  const userInfo = JSON.parse(sessionStorage.getItem("userDetails") as string);
  const [activeTab, setActiveTab] = useState("1");
  const navigate = useNavigate();
  const classes = useStyles();
  const [locationOptions, setLocationOptions] = useState<any>([]);
  const [departmentOptions, setDepartmentOptions] = useState<any>([]);
  const [selectedLocation, setSelectedLocation] = useState<any>(
    userInfo?.locationId
  );
  const [selectedEntity, setSelectedEntity] = useState<any>(
    userInfo?.entity?.id
  );
  const { enqueueSnackbar } = useSnackbar();
  const realmName = getAppUrl();
  const [disableDept, setDisableDept] = useState<any>(false);
  const [allOption, setAllOption] = useState("");
  const [allDepartmentOption, setAllDepartmentOption] = useState("");
  const [tableData, setTableData] = useState([]);
  const [checked, setChecked] = useState<boolean>(false);
  const [detailedData, setDetailedData] = useState<any[]>([]);
  const [editData, setEditData] = useState<any>({});
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [readMode, setReadMode] = useState<boolean>(false);
  const [showTable, setShowTable] = useState<boolean>(false);
  const [selectedCell, setSelectedCell] = useState<any>(null);

  const [drawer, setDrawer] = useState<any>({
    mode: "create",
    data: {},
    open: false,
  });
  const location = useLocation();
  const [selectedCapaIds, setSelectedCapaIds] = useState<any[]>([]);

  useEffect(() => {
    getLocationOptions();
    getDepartmentOptions(userInfo?.location?.id);
  }, []);
  useEffect(() => {
    if (location.pathname.includes("/caraactionitemview")) {
      const stateData = JSON.parse(
        sessionStorage.getItem("newTabState") || "{}"
      );
      // console.log("stateData", stateData);
      setIsEdit(stateData.isEdit);
      setEditData(stateData.editData);

      setDrawer(stateData.drawer);

      setReadMode(stateData.readMode);
    }
  }, [location]);
  // console.log("tableData", tableData);
  useEffect(() => {
    if (selectedLocation !== "All") {
      getDepartmentOptions(selectedLocation);
    }
  }, [selectedLocation]);
  useEffect(() => {
    if (activeTab === "1" && selectedLocation !== "All")
      getDepartmentwiseDataForChart();
    else if (activeTab === "1" && selectedLocation === "All") {
      getDataForAllUnit();
    }
  }, [selectedEntity, selectedLocation, checked]);
  useEffect(() => {
    if (!!selectedCapaIds && showTable) {
      getCapaTableData();
    }
  }, [showTable, selectedCapaIds]);

  const getDepartmentwiseDataForChart = async () => {
    const entityParam = selectedEntity === undefined ? "All" : selectedEntity;
    // console.log("checked", checked);
    let result;
    const url =
      selectedEntity === "All" || selectedEntity === undefined
        ? `/api/cara/getDeptwiseChartData?locationId[]=${selectedLocation}&checked=${checked}`
        : `/api/cara/getDeptwiseChartData?locationId[]=${selectedLocation}&entityId[]=${entityParam}&checked=${checked}`;

    result = await axios.get(url);

    if (result.status === 200 || result.status === 201) {
      setTableData(result?.data?.deptwiseData);
    }
  };
  //   console.log("selectedLocation", selectedLocation);
  const getDataForAllUnit = async () => {
    // console.log("api called");

    const result = await axios.get(
      `/api/cara/getLocationwiseChartData?locationId[]=All&checked=${checked}`
    );
    // setAllLocationData(result?.data);
    setTableData(result?.data);
  };
  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
  };

  //   const handleClose = () => {
  //     setReportModalOpen(false);
  //     setAllOption("");
  //   };
  const getCapaTableData = async () => {
    try {
      const response = await axios.get(
        `/api/cara/getCapaDataforIds?ids[]=${selectedCapaIds.join("&ids[]=")}`
      );
      //   console.log("response?.data", response.data);
      if (response?.data) {
        setDetailedData(response?.data);
      }
    } catch (error) {
      setDetailedData([]);
    }
  };
  const getStatusColor = (status: any) => {
    switch (status) {
      case "Open":
        return "#FF4D4F";
      case "Accepted":
        return "#1890FF";
      case "Rejected":
        return "#ffe6e6";
      case "Analysis_In_Progress":
        return "#FFEB3B";
      case "Outcome_In_Progress":
        return "#81C784";
      case "Draft":
        return "#e6f2ff";
      case "Sent_For_Approval":
        return "#009933";
      case "Closed":
        return "#009933";
      default:
        return "";
    }
  };
  const getNewStatusColor = (status: any) => {
    switch (status) {
      case "Open":
        return "#FF4D4F";
      case "Accepted":
        return "#1890FF";
      case "Rejected":
        return "#1890FF";
      case "Analysis_In_Progress":
        return "#FFEB3B";
      case "Outcome_In_Progress":
        return "#81C784";
      case "Draft":
        return "#FF4D4F";
      case "Sent_For_Approval":
        return "#009933";
      case "Closed":
        return "#009933";
      default:
        return "";
    }
  };
  const getStatus = (status: any) => {
    switch (status) {
      case "Open":
        return "Pending Response";
      case "Accepted":
        return "Action Agreed";
      case "Rejected":
        return "#ffe6e6";
      case "Analysis_In_Progress":
        return "To Be Followed Up";
      case "Outcome_In_Progress":
        return "To be closed After Validation";
      case "Draft":
        return "#e6f2ff";
      case "Sent_For_Approval":
        return "Validated and dropped";
      case "Closed":
        return "Validated and dropped";
      default:
        return "";
    }
  };
  //   console.log("tableData", tableData);
  //   console.log("selectedkey", selectedCell);
  const columns: ColumnsType<any> = [
    {
      title: allOption === "All" ? "Unit Name" : "Entity",
      dataIndex: allOption === "All" ? "locationName" : "deptName",
      key: "name",
      width: 150,
      render: (text: any, record: any) => (
        <span
          style={{
            backgroundColor:
              selectedCell?.id === record && selectedCell?.type === "name"
                ? "#FF4D4F"
                : "transparent",
            color:
              selectedCell?.id === record && selectedCell?.type === "name"
                ? "white"
                : "black",
            padding: "5px",
            cursor: "pointer",
            borderRadius: "3px",
          }}
          onClick={() => handleCellClick(record, "name")}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Pending Response",
      dataIndex: "pendingCount",
      key: "pendingCount",
      align: "center",
      onHeaderCell: () => ({
        style: {
          backgroundColor: "#FF4D4F",
          color: "white",
          padding: "5px", // Adjust padding here
          borderBottom: "1px solid #ccc", // Dim border
          boxShadow: "0 1px 0 rgba(0,0,0,0.1)", // Dim shadow effect
        },
      }),
      render: (text: any, record: any) => (
        <span
          onClick={() => handleCellClick(record, "pendingCount")}
          style={{
            backgroundColor:
              selectedCell?.id === record &&
              selectedCell?.type === "pendingCount"
                ? "#FF4D4F"
                : "transparent",
            color:
              selectedCell?.id === record &&
              selectedCell?.type === "pendingCount"
                ? "white"
                : "black",
            padding: "5px",
            cursor: "pointer",
            borderRadius: "50%", // Ensures the element is a circle
            width: "30px", // Set width and height equal to form a perfect circle
            height: "30px", // Make sure height is the same as width
            textAlign: "center", // Centers text horizontally
            lineHeight: "30px", // Centers text vertically within the circle
            display: "inline-flex", // Ensures the item behaves like a circle
            justifyContent: "center", // Centers the content horizontally
            alignItems: "center", // Centers the content vertically
          }}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Action Agreed",
      dataIndex: "acceptedCount",
      key: "acceptedCount",
      align: "center",
      onHeaderCell: () => ({
        style: {
          backgroundColor: "#1890FF",
          color: "white",
          padding: "5px", // Adjust padding here
          borderBottom: "1px solid #ccc", // Dim border
          boxShadow: "0 1px 0 rgba(0,0,0,0.1)", // Dim shadow effect
        },
      }),
      render: (text: any, record: any) => (
        <span
          onClick={() => handleCellClick(record, "acceptedCount")}
          style={{
            backgroundColor:
              selectedCell?.id === record &&
              selectedCell?.type === "acceptedCount"
                ? "#1890FF"
                : "transparent",
            color:
              selectedCell?.id === record &&
              selectedCell?.type === "acceptedCount"
                ? "white"
                : "black",
            padding: "5px",
            cursor: "pointer",
            borderRadius: "50%", // Ensures the element is a circle
            width: "30px", // Set width and height equal to form a perfect circle
            height: "30px", // Make sure height is the same as width
            textAlign: "center", // Centers text horizontally
            lineHeight: "30px", // Centers text vertically within the circle
            display: "inline-flex", // Ensures the item behaves like a circle
            justifyContent: "center", // Centers the content horizontally
            alignItems: "center", // Centers the content vertically
          }}
        >
          {text}
        </span>
      ),
    },
    {
      title: "To be followed up",
      dataIndex: "wipCount",
      key: "wipCount",
      align: "center",
      onHeaderCell: () => ({
        style: {
          backgroundColor: "#FFEB3B",
          color: "black",
          padding: "5px ", // Adjust padding here
          borderBottom: "1px solid #ccc", // Dim border
          boxShadow: "0 1px 0 rgba(0,0,0,0.1)", // Dim shadow effect
        },
      }),
      render: (text: any, record: any) => (
        <span
          onClick={() => handleCellClick(record, "wipCount")}
          style={{
            backgroundColor:
              selectedCell?.id === record && selectedCell?.type === "wipCount"
                ? "#FFEB3B"
                : "transparent",
            color:
              selectedCell?.id === record && selectedCell?.type === "wipCount"
                ? "white"
                : "black",
            padding: "5px",
            cursor: "pointer",
            borderRadius: "50%", // Ensures the element is a circle
            width: "30px", // Set width and height equal to form a perfect circle
            height: "30px", // Make sure height is the same as width
            textAlign: "center", // Centers text horizontally
            lineHeight: "30px", // Centers text vertically within the circle
            display: "inline-flex", // Ensures the item behaves like a circle
            justifyContent: "center", // Centers the content horizontally
            alignItems: "center", // Centers the content vertically
          }}
        >
          {text}
        </span>
      ),
    },
    {
      title: "To be closed After Validation",
      dataIndex: "outcomeCount",
      key: "outcomeCount",
      align: "center",
      onHeaderCell: () => ({
        style: {
          backgroundColor: "#81C784",
          color: "black",
          padding: "5px", // Adjust padding here
          borderBottom: "1px solid #ccc", // Dim border
          boxShadow: "0 1px 0 rgba(0,0,0,0.1)", // Dim shadow effect
        },
      }),
      render: (text: any, record: any) => (
        <span
          onClick={() => handleCellClick(record, "outcomeCount")}
          style={{
            backgroundColor:
              selectedCell?.id === record &&
              selectedCell?.type === "outcomeCount"
                ? "#81C784"
                : "transparent",
            color:
              selectedCell?.id === record &&
              selectedCell?.type === "outcomeCount"
                ? "white"
                : "black",
            padding: "5px",
            cursor: "pointer",
            borderRadius: "50%",
            width: "30px",
            height: "30px",
            textAlign: "center",
            lineHeight: "30px",
            display: "inline-flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Validated and dropped",
      dataIndex: "completedCount",
      key: "completedCount",
      align: "center",
      onHeaderCell: () => ({
        style: {
          backgroundColor: "#009933",
          color: "white",
          padding: "5px", // Adjust padding here
          borderBottom: "1px solid #ccc", // Dim border
          boxShadow: "0 1px 0 rgba(0,0,0,0.1)", // Dim shadow effect
        },
      }),
      render: (text: any, record: any) => (
        <span
          onClick={() => handleCellClick(record, "completedCount")}
          style={{
            backgroundColor:
              selectedCell?.id === record &&
              selectedCell?.type === "completedCount"
                ? "#009933"
                : "transparent",
            color:
              selectedCell?.id === record &&
              selectedCell?.type === "completedCount"
                ? "white"
                : "black",

            padding: "5px",
            cursor: "pointer",
            borderRadius: "50%",
            width: "30px",
            height: "30px",
            textAlign: "center",
            lineHeight: "30px",
            display: "inline-flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Grand Total",
      dataIndex: "totalCount",
      key: "totalCount",
      align: "center",
      onHeaderCell: () => ({
        style: { backgroundColor: "#9E9E9E", color: "white", padding: "5px" },
      }),
      render: (text: any, record: any) => (
        <span
          onClick={() => handleCellClick(record, "totalCount")}
          style={{
            backgroundColor:
              selectedCell?.id === record && selectedCell?.type === "totalCount"
                ? "#9E9E9E"
                : "transparent",
            color:
              selectedCell?.id === record && selectedCell?.type === "totalCount"
                ? "white"
                : "black",
            padding: "5px",
            cursor: "pointer",
            borderRadius: "50%",
            width: "30px",
            height: "30px",
            textAlign: "center",
            lineHeight: "30px",
            display: "inline-flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {text}
        </span>
      ),
    },
  ];
  const getFooter = () => {
    const totals = {
      pendingCount: 0,
      acceptedCount: 0,
      wipCount: 0,
      outcomeCount: 0,
      completedCount: 0,
      totalCount: 0,
    };

    tableData.forEach((record: any) => {
      totals.pendingCount += record.pendingCount;
      totals.acceptedCount += record.acceptedCount;
      totals.wipCount += record.wipCount;
      totals.outcomeCount += record.outcomeCount;
      totals.completedCount += record.completedCount;
      totals.totalCount += record.totalCount;
    });

    return (
      <tr style={{ backgroundColor: "#f5f5f5", fontWeight: "bold" }}>
        <td
          style={{
            textAlign: "right",
            padding: "5px",
            fontWeight: "bold",
            width: "100px",
          }}
        >
          Total
        </td>
        <td
          style={{
            backgroundColor: "#FF4D4F",
            color: "white",
            padding: "5px", // Adjust padding here
            borderBottom: "1px solid #ccc", // Dim border
            boxShadow: "0 1px 0 rgba(0,0,0,0.1)",
            textAlign: "center",
            width: "250px",
          }}
        >
          {totals.pendingCount}
        </td>
        <td
          style={{
            backgroundColor: "#1890FF",
            color: "white",
            padding: "5px", // Adjust padding here
            borderBottom: "1px solid #ccc", // Dim border
            boxShadow: "0 1px 0 rgba(0,0,0,0.1)",
            width: "200px",
            textAlign: "center",
          }}
        >
          {totals.acceptedCount}
        </td>
        <td
          style={{
            backgroundColor: "#FFEB3B",
            color: "black",
            padding: "5px ", // Adjust padding here
            borderBottom: "1px solid #ccc", // Dim border
            boxShadow: "0 1px 0 rgba(0,0,0,0.1)",
            textAlign: "center",
            width: "250px",
          }}
        >
          {totals.wipCount}
        </td>
        <td
          style={{
            backgroundColor: "#81C784",
            color: "black",
            padding: "5px", // Adjust padding here
            borderBottom: "1px solid #ccc", // Dim border
            boxShadow: "0 1px 0 rgba(0,0,0,0.1)",
            textAlign: "center",
            width: "400px",
          }}
        >
          {totals.outcomeCount}
        </td>
        <td
          style={{
            backgroundColor: "#009933",
            color: "white",
            padding: "5px", // Adjust padding here
            borderBottom: "1px solid #ccc", // Dim border
            boxShadow: "0 1px 0 rgba(0,0,0,0.1)",
            textAlign: "center",
            width: "300px",
          }}
        >
          {totals.completedCount}
        </td>
        <td
          style={{
            backgroundColor: "#9E9E9E",
            color: "white",
            padding: "5px",
            textAlign: "center",
            width: "205px",
          }}
        >
          {totals.totalCount}
        </td>
      </tr>
    );
  };
  const ageingColumns: ColumnsType<any> = [
    {
      title: "Duration of Open Points",
      dataIndex: "noofdays",
      key: "noofdays",
    },
    {
      title: "Pending Response",
      dataIndex: "pendingCount",
      key: "pendingCount",
      align: "center",
      onHeaderCell: () => ({
        style: {
          backgroundColor: "#FF4D4F",
          color: "white",
          padding: "5px", // Adjust padding here
          borderBottom: "1px solid #ccc", // Dim border
          boxShadow: "0 1px 0 rgba(0,0,0,0.1)", // Dim shadow effect
        },
      }),
      render: (text: any, record: any) => (
        <span
          //   onClick={() => handleCellClick(record, "pendingCount")}
          style={{}}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Action Agreed",
      dataIndex: "acceptedCount",
      key: "acceptedCount",
      align: "center",
      onHeaderCell: () => ({
        style: {
          backgroundColor: "#1890FF",
          color: "white",
          padding: "5px", // Adjust padding here
          borderBottom: "1px solid #ccc", // Dim border
          boxShadow: "0 1px 0 rgba(0,0,0,0.1)", // Dim shadow effect
        },
      }),
      render: (text: any, record: any) => (
        <span
          onClick={() => handleCellClick(record, "acceptedCount")}
          style={{}}
        >
          {text}
        </span>
      ),
    },
    {
      title: "To be followed up",
      dataIndex: "wipCount",
      key: "wipCount",
      align: "center",
      onHeaderCell: () => ({
        style: {
          backgroundColor: "#FFEB3B",
          color: "black",
          padding: "5px ", // Adjust padding here
          borderBottom: "1px solid #ccc", // Dim border
          boxShadow: "0 1px 0 rgba(0,0,0,0.1)", // Dim shadow effect
        },
      }),
      render: (text: any, record: any) => (
        <span
          onClick={() => handleCellClick(record, "wipCount")}
          style={{
            alignItems: "center", // Centers the content vertically
          }}
        >
          {text}
        </span>
      ),
    },
    {
      title: "To be closed After Validation",
      dataIndex: "outcomeCount",
      key: "outcomeCount",
      align: "center",
      onHeaderCell: () => ({
        style: {
          backgroundColor: "#81C784",
          color: "black",
          padding: "5px", // Adjust padding here
          borderBottom: "1px solid #ccc", // Dim border
          boxShadow: "0 1px 0 rgba(0,0,0,0.1)", // Dim shadow effect
        },
      }),
      render: (text: any, record: any) => (
        <span
          onClick={() => handleCellClick(record, "outcomeCount")}
          style={{}}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Validated and dropped",
      dataIndex: "completedCount",
      key: "completedCount",
      align: "center",
      onHeaderCell: () => ({
        style: {
          backgroundColor: "#009933",
          color: "white",
          padding: "5px", // Adjust padding here
          borderBottom: "1px solid #ccc", // Dim border
          boxShadow: "0 1px 0 rgba(0,0,0,0.1)", // Dim shadow effect
        },
      }),
      render: (text: any, record: any) => (
        <span
          onClick={() => handleCellClick(record, "completedCount")}
          style={{}}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Grand Total",
      dataIndex: "totalCount",
      key: "totalCount",
      align: "center",
      onHeaderCell: () => ({
        style: { backgroundColor: "#9E9E9E", color: "white", padding: "5px" },
      }),
      render: (text: any, record: any) => (
        <span onClick={() => handleCellClick(record, "totalCount")} style={{}}>
          {text}
        </span>
      ),
    },
  ];
  const deptwiseData = [
    {
      deptName: "Entity1",
      noofdays: "3 days",
      totalCount: 8,
      acceptedCount: 1,
      approvalCount: 0,
      pendingCount: 1,
      wipCount: 0,
      completedCount: 5,
      rejectedCount: 0,
      outcomeCount: 0,
      completionPercentage: 71.43,
      pendingIds: ["67d182c78ce4c5655bb892c9"],
      completedIds: [
        "67d12fec1bb8984ac54a09b0",
        "67d135b5b60da40025bcefdc",
        "67d13718b60da40025bcf067",
        "67d137b0b60da40025bcf0ee",
        "67d13889b60da40025bcf157",
      ],
      wipIds: [],
      rejectedIds: [],
      acceptedIds: ["67d1c2e4f642357d83d4efe1"],
      approvalIds: [],
      outcomeIds: [],
    },
    {
      deptName: "Entity2",
      noofdays: "1 week",
      totalCount: 10,
      acceptedCount: 3,
      approvalCount: 2,
      pendingCount: 1,
      wipCount: 2,
      completedCount: 2,
      rejectedCount: 0,
      outcomeCount: 0,
      completionPercentage: 60.0,
      pendingIds: ["67d182c78ce4c5655bb892c9"],
      completedIds: ["67d12fec1bb8984ac54a09b0", "67d135b5b60da40025bcefdc"],
      wipIds: ["67d13718b60da40025bcf067", "67d137b0b60da40025bcf0ee"],
      rejectedIds: [],
      acceptedIds: [
        "67d1c2e4f642357d83d4efe1",
        "67d1c2e4f642357d83d4efe2",
        "67d1c2e4f642357d83d4efe3",
      ],
      approvalIds: ["67d1c2e4f642357d83d4efe4", "67d1c2e4f642357d83d4efe5"],
      outcomeIds: [],
    },
    {
      deptName: "Entity3",

      totalCount: 10,
      noofdays: "2 weeks",
      acceptedCount: 3,
      approvalCount: 2,
      pendingCount: 1,
      wipCount: 2,
      completedCount: 2,
      rejectedCount: 0,
      outcomeCount: 0,
      completionPercentage: 60.0,
      pendingIds: ["67d182c78ce4c5655bb892c9"],
      completedIds: ["67d12fec1bb8984ac54a09b0", "67d135b5b60da40025bcefdc"],
      wipIds: ["67d13718b60da40025bcf067", "67d137b0b60da40025bcf0ee"],
      rejectedIds: [],
      acceptedIds: [
        "67d1c2e4f642357d83d4efe1",
        "67d1c2e4f642357d83d4efe2",
        "67d1c2e4f642357d83d4efe3",
      ],
      approvalIds: ["67d1c2e4f642357d83d4efe4", "67d1c2e4f642357d83d4efe5"],
      outcomeIds: [],
    },
    {
      deptName: "Entity4",
      noofdays: "3 weeks",
      totalCount: 1,
      acceptedCount: 5,
      approvalCount: 2,
      pendingCount: 1,
      wipCount: 2,
      completedCount: 2,
      rejectedCount: 0,
      outcomeCount: 0,
      completionPercentage: 60.0,
      pendingIds: ["67d182c78ce4c5655bb892c9"],
      completedIds: ["67d12fec1bb8984ac54a09b0", "67d135b5b60da40025bcefdc"],
      wipIds: ["67d13718b60da40025bcf067", "67d137b0b60da40025bcf0ee"],
      rejectedIds: [],
      acceptedIds: [
        "67d1c2e4f642357d83d4efe1",
        "67d1c2e4f642357d83d4efe2",
        "67d1c2e4f642357d83d4efe3",
      ],
      approvalIds: ["67d1c2e4f642357d83d4efe4", "67d1c2e4f642357d83d4efe5"],
      outcomeIds: [],
    },
    {
      deptName: "Entity6",
      totalCount: 2,
      noofdays: "4 weeks",
      acceptedCount: 3,
      approvalCount: 2,
      pendingCount: 5,
      wipCount: 2,
      completedCount: 2,
      rejectedCount: 0,
      outcomeCount: 0,
      completionPercentage: 60.0,
      pendingIds: ["67d182c78ce4c5655bb892c9"],
      completedIds: ["67d12fec1bb8984ac54a09b0", "67d135b5b60da40025bcefdc"],
      wipIds: ["67d13718b60da40025bcf067", "67d137b0b60da40025bcf0ee"],
      rejectedIds: [],
      acceptedIds: [
        "67d1c2e4f642357d83d4efe1",
        "67d1c2e4f642357d83d4efe2",
        "67d1c2e4f642357d83d4efe3",
      ],
      approvalIds: ["67d1c2e4f642357d83d4efe4", "67d1c2e4f642357d83d4efe5"],
      outcomeIds: [],
    },
    {
      deptName: "Grand Total",
      totalCount: 2,
      noofdays: "Grand Total",
      acceptedCount: 8,
      approvalCount: 0,
      pendingCount: 15,
      wipCount: 0,
      completedCount: 13,
      rejectedCount: 0,
      outcomeCount: 0,
      completionPercentage: 60.0,
      pendingIds: ["67d182c78ce4c5655bb892c9"],
      completedIds: ["67d12fec1bb8984ac54a09b0", "67d135b5b60da40025bcefdc"],
      wipIds: ["67d13718b60da40025bcf067", "67d137b0b60da40025bcf0ee"],
      rejectedIds: [],
      acceptedIds: [
        "67d1c2e4f642357d83d4efe1",
        "67d1c2e4f642357d83d4efe2",
        "67d1c2e4f642357d83d4efe3",
      ],
      approvalIds: ["67d1c2e4f642357d83d4efe4", "67d1c2e4f642357d83d4efe5"],
      outcomeIds: [],
    },
    // Add more entities as needed
  ];

  const detailedColumns = [
    {
      title: "Red Flags",
      dataIndex: "title",
      key: "title",
      render: (_: any, data: any, index: number) => (
        <>
          <Tooltip title={data?.title}>
            <div
              style={{
                textDecoration: "underline",
                cursor: "pointer",
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 2, // Limits to 2 lines
                overflow: "hidden", // Hides the overflowed content
                textOverflow: "ellipsis", // Adds ellipsis when overflow
                width: "150px", // Fixed width
              }}
              onClick={() => {
                // navigate(`/cara`, {
                //   state: {
                //     editData: actionItemCapaData,
                //     isEdit: true,
                //     readMode: true,
                //     drawer: {
                //       mode: "edit",
                //       data: { ...actionItemCapaData, id: drawerdata?.referenceId },
                //       open: true,
                //     },
                //   },
                // });
                let url;
                if (
                  process.env.REACT_APP_REDIRECT_URL?.includes(
                    "adityabirla.com"
                  )
                ) {
                  url = `${process.env.REACT_APP_REDIRECT_URL}/caractionitemview`;
                } else {
                  url = `https://${realmName}.${process.env.REACT_APP_REDIRECT_URL}/caraactionitemview`;
                }
                const stateData = {
                  editData: data,
                  isEdit: true,
                  readMode: true,
                  drawer: {
                    mode: "edit",
                    data: {
                      ...data,
                      id: data?._id,
                    },
                    open: true,
                  },
                };

                sessionStorage.setItem(
                  "newTabState",
                  JSON.stringify(stateData)
                );
                setTimeout(() => {
                  window.open("/caraactionitemview", "_blank");
                }, 700); // Adjust the delay as needed
              }}
              //   onClick={() => {

              //     // setIsEdit(true);
              //     // setEditData(data);
              //     // setDrawer({
              //     //   mode: "edit",
              //     //   data: { ...data, id: data?._id },
              //     //   open: true,
              //     // });
              //     // setReadMode(true);
              //   }}
              //   ref={refForcapa6}
            >
              {data?.title}
            </div>
          </Tooltip>
        </>
      ),
      //   width: 350,
    },
    {
      title: "Location",
      dataIndex: "unit",
      key: "unit",

      render: (_: any, data: any, index: number) => (
        <span>{data.locationDetails?.locationName}</span>
      ),
    },
    {
      title: "Responsible Entity",
      dataIndex: "entityId",
      key: "entity",

      render: (_: any, data: any, index: number) => (
        <span>{data.entityId?.entityName}</span>
      ),
    },

    // {
    //   title: "Origin",
    //   dataIndex: "origin",
    //   key: "origin",
    //   render: (_: any, data: any, index: number) => (
    //     <span>{data.origin?.deviationType}</span>
    //   ),
    // },

    {
      title: "Registered By",
      dataIndex: "registered",
      key: "registered",
      render: (_: any, data: any, index: number) => (
        <span>{data.registeredBy?.username}</span>
      ),
    },
    {
      title: "Owner",
      dataIndex: "caraOwner",
      key: "caraOwner",
      render: (_: any, data: any, index: number) => (
        <span>{data?.caraOwner?.name}</span>
      ),
    },

    {
      title: "Date of Report",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: any, data: any, index: number) => {
        if (data?.createdAt) {
          const formattedTargetDate =
            data?.createdAt instanceof Date
              ? data?.createdAt.toLocaleDateString("en-GB") // If it's already a Date object
              : new Date(data?.createdAt).toLocaleDateString("en-GB"); // If it's a string, convert to Date
          return formattedTargetDate;
        } else {
          return "NA";
        }
      },
    },

    {
      title: "Target Date",
      dataIndex: "targetDate",
      width: 100,
      render: (text: any, data: any, index: number) => {
        if (data?.targetDate) {
          const currentDate = new Date();
          const targetDate = new Date(data.targetDate);

          // Compare dates and if target date is less than current date, indicate only "Delayed" in red
          if (targetDate < currentDate) {
            const formattedTargetDate = targetDate.toLocaleDateString("en-GB"); // Adjust the locale accordingly
            return (
              <span>
                {formattedTargetDate}
                <Tooltip title="Target Date has exceeded the current date">
                  <MdOutlineWarning
                    style={{ color: "red", marginLeft: "5px" }}
                  />
                </Tooltip>
              </span>
            );
          } else {
            // Format target date as "dd/mm/yyyy"
            const formattedTargetDate = targetDate.toLocaleDateString("en-GB"); // Adjust the locale accordingly
            return <span>{formattedTargetDate}</span>;
          }
        } else {
          return "NA";
        }
      },
    },
    {
      title: "To be followed With",
      dataIndex: "pendingWith",
      width: 180,
      render: (_: any, data: any, index: number) => (
        <>
          <div>
            {data?.status === "Open" &&
              data?.deptHead &&
              data?.deptHead?.length > 0 && (
                <p>
                  {data?.deptHead
                    ?.map((head: any) => head?.firstname + " " + head?.lastname)
                    .join(", ")}
                </p>
              )}

            {data?.status === "Accepted" && <p>{data?.caraOwner?.name}</p>}
            {data?.status === "Analysis_In_Progress" &&
              (data?.rootCauseAnalysis ? (
                data?.deptHead?.length > 0 && (
                  <p>
                    {data?.deptHead
                      .map(
                        (head: any) => head?.firstname + " " + head?.lastname
                      )
                      .join(", ")}
                  </p>
                )
              ) : (
                <p>
                  {data?.caraOwner?.firstname + " " + data?.caraOwner?.lastname}
                </p>
              ))}

            {data?.status === "Outcome_In_Progress" &&
              (data?.actualCorrectiveAction ? (
                data?.deptHead?.length > 0 && (
                  <p>
                    {data?.deptHead
                      .map(
                        (head: any) => head?.firstname + " " + head?.lastname
                      )
                      .join(", ")}
                  </p>
                )
              ) : (
                <p>
                  {data?.caraOwner?.firstname + " " + data?.caraOwner?.lastname}
                </p>
              ))}
            {data?.status === "Rejected" && (
              <p>
                {data?.registeredBy?.firstname +
                  " " +
                  data?.registeredBy?.lastname}
              </p>
            )}
          </div>
        </>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (_: any, data: any, index: number) => (
        <>
          <Tag
            style={{
              backgroundColor: getNewStatusColor(data.status),
              color:
                data?.status === "Closed" ||
                data?.status === "Sent_For_Approval"
                  ? "white"
                  : "black",
              width: "150px",
              textAlign: "center",
            }}
          >
            {getStatus(data.status)}
          </Tag>
        </>
      ),
    },
    {
      title: "No of Days",
      dataIndex: "noofDays",
      key: "number",
      render: (text: any, data: any, index: number) => {
        const currentDate = new Date();
        const createdAt = new Date(data?.createdAt);

        // Normalize the time to ignore hours, minutes, and seconds for both dates
        currentDate.setHours(0, 0, 0, 0); // Set to midnight
        createdAt.setHours(0, 0, 0, 0); // Set to midnight
        if (data?.status !== "Closed") {
          // Calculate the difference in days (milliseconds since epoch)
          const dayDifference = Math.floor(
            (currentDate.getTime() - createdAt.getTime()) /
              (1000 * 60 * 60 * 24)
          ); // in days

          // If day difference is more than 30, calculate months instead
          if (dayDifference > 30) {
            // Calculate the difference in months
            const monthDifference =
              currentDate.getMonth() -
              createdAt.getMonth() +
              12 * (currentDate.getFullYear() - createdAt.getFullYear());

            // Calculate remaining days after extracting months
            const remainingDays = dayDifference - monthDifference * 30;

            // If the difference is 1 month or more, return months and days
            return `${monthDifference} month${
              monthDifference > 1 ? "s" : ""
            } ${remainingDays} day${remainingDays !== 1 ? "s" : ""}`;
          }

          // If day difference is less than 30, return days
          return `${dayDifference} day${dayDifference !== 1 ? "s" : ""}`;
        } else {
          return "-"; // If the status is "Closed", return a dash or whatever is appropriate.
        }
      },
    },
  ];

  const getLocationOptions = async () => {
    try {
      const res = await axios.get(
        `/api/riskregister/getAllLocation/${userInfo?.organizationId}`
      );

      if (res.status === 200 || res.status === 201) {
        if (res?.data?.data && !!res?.data?.data?.length) {
          setLocationOptions([
            ...[{ value: "All", label: "All" }],
            ...res?.data?.data?.map((item: any) => ({
              ...item,
              value: item.id,
              label: item.locationName,
            })),
          ]);
        } else {
          setLocationOptions([]);
          enqueueSnackbar("No Locations Found", {
            variant: "warning",
          });
        }
      } else {
        // setJobTitleOptions([]);
        enqueueSnackbar("Error in fetching getAllLocation", {
          variant: "error",
        });
      }
    } catch (error) {}
  };

  const getDepartmentOptions = async (locationId: any = "") => {
    try {
      const res = await axios.get(
        `/api/riskregister/getAllDepartmentsByLocation/${locationId}`
      );

      if (res.status === 200 || res.status === 201) {
        if (res?.data?.data && !!res?.data?.data?.length) {
          setDepartmentOptions([
            ...[{ value: "All", label: "All" }],
            ...res?.data?.data?.map((item: any) => ({
              ...item,
              value: item.id,
              label: item.entityName,
            })),
          ]);
        } else {
          setDepartmentOptions([]);
          enqueueSnackbar("No Departments Found", {
            variant: "warning",
          });
        }
      } else {
        // setJobTitleOptions([]);
        enqueueSnackbar("Error in fetching getAllDepartmentsByLocation", {
          variant: "error",
        });
      }
    } catch (error) {
      // console.log("checkrisk error in fetching all job title", error);
    }
  };

  const handleLocationChange = (value: any) => {
    if (value !== "All") {
      setSelectedLocation(value);
      setSelectedEntity(undefined);
      getDepartmentOptions(value);
      setDisableDept(false);
      setAllOption("");
    } else {
      setSelectedLocation("All");
      setAllOption("All");
      setSelectedEntity(undefined);
      setDisableDept(true);
    }
    setShowTable(false);
  };
  const handleCellClick = async (id: any, type: string) => {
    setShowTable(true);
    if (
      selectedCell &&
      selectedCell.record === id &&
      selectedCell.type === type
    ) {
      setSelectedCell(null); // Deselect if the same cell is clicked again
    } else {
      setSelectedCell({ id, type }); // Set new selected cell
    }
    try {
      //   console.log("id,type", id, type);
      if (type === "pendingCount") {
        setSelectedCapaIds(id.pendingIds);
      } else if (type === "acceptedCount") {
        setSelectedCapaIds(id?.acceptedIds);
      } else if (type === "wipCount") {
        setSelectedCapaIds(id?.wipIds);
      } else if (type === "outcomeCount") {
        setSelectedCapaIds(id?.outcomeIds);
      } else if (type === "completedCount") {
        setSelectedCapaIds(id?.completedIds);
      } else if (type === "totalCount") {
        const allIds = [
          ...(id?.pendingIds || []),
          ...(id?.outcomeIds || []),
          ...(id?.wipIds || []),
          ...(id?.approvalIds || []),
          ...(id?.completedIds || []),
          ...(id?.rejectedIds || []),
        ];

        setSelectedCapaIds(allIds);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleDepartmentChange = (value: any) => {
    setSelectedEntity(value);
    setShowTable(false);
  };
  return (
    // <Modal
    //   visible={isReportModalOpen}
    //   onCancel={handleClose}
    //   footer={null}
    //   width={1500}
    // >
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "flex-start",
          width: "100%",
          top: "20px",
        }}
      >
        <Button
          style={{
            margin: "10px",
            backgroundColor: "#003059",
            color: "white",
            padding: "10px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          onClick={() => navigate("/cara")}
        >
          Back
        </Button>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        className={classes.tabsWrapper}
      >
        <TabPane tab="Status Summary" key="1">
          {/* <h3>Status Summary</h3> */}
          <Breadcrumb separator="  ">
            <Breadcrumb.Item>
              <span style={{ color: "black" }}>Unit:</span>
              <Select
                showSearch
                allowClear
                placeholder="Select Unit"
                onClear={() => setSelectedLocation(undefined)}
                value={selectedLocation}
                style={{
                  width: 280,
                  marginLeft: 8,
                  border: "1px solid black",
                  borderRadius: "5px",
                }}
                onChange={handleLocationChange}
                optionFilterProp="children"
                filterOption={(input: any, option: any) =>
                  (option?.children ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {locationOptions.map((option: any) => (
                  <Select.Option key={option.value} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <span style={{ color: "black" }}>Entity:</span>
              <Select
                showSearch
                allowClear
                onClear={() => setSelectedEntity(undefined)}
                disabled={disableDept}
                placeholder="Select Department"
                value={selectedEntity}
                style={{
                  width: 320,
                  marginLeft: 8,
                  border: "1px solid black",
                  borderRadius: "5px",
                }}
                onChange={handleDepartmentChange}
                optionFilterProp="children"
                filterOption={(input: any, option: any) =>
                  (option?.children ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {departmentOptions.map((option: any) => (
                  <Select.Option key={option.value} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Checkbox
                //   checked={formData?.executiveApprovalRequired}
                onChange={() => setChecked(!checked)}
                className={classes.checkbox}
                style={{
                  marginRight: "20px",
                  marginTop: "3px",

                  padding: "5px",
                }}
              >
                Show Only High Priority
              </Checkbox>
            </Breadcrumb.Item>
          </Breadcrumb>
          <div style={{ marginTop: "20px" }}>
            <Table
              columns={columns}
              dataSource={tableData}
              //   rowKey="departmentName"
              pagination={false}
              rowClassName={(record, index) =>
                index === tableData?.length - 1 ? classes.highlightRow : ""
              }
              components={{
                header: {
                  cell: (props: any) => (
                    <th
                      {...props}
                      className={classes.tableHeader} // Apply custom header styles
                    />
                  ),
                },
                body: {
                  cell: (props: any) => (
                    <td
                      {...props}
                      className={classes.tableCell} // Apply custom cell styles
                    />
                  ),
                },
              }}
              // footer={getFooter}
            />
          </div>
          {showTable && (
            <div style={{ marginTop: "10px" }}>
              <Table
                columns={detailedColumns}
                dataSource={detailedData}
                className={classes.tableContainer}
                //   rowKey="departmentName"
                pagination={false}
              />
            </div>
          )}
        </TabPane>

        <TabPane tab="Ageing Summary" key="2">
          {/* <h3>Ageing Summary</h3> */}
          <Breadcrumb separator="  ">
            <Breadcrumb.Item>
              <span style={{ color: "black" }}>Unit:</span>
              <Select
                showSearch
                allowClear
                placeholder="Select Unit"
                onClear={() => setSelectedLocation(undefined)}
                value={selectedLocation}
                style={{
                  width: 280,
                  marginLeft: 8,
                  border: "1px solid black",
                  borderRadius: "5px",
                }}
                onChange={handleLocationChange}
                optionFilterProp="children"
                filterOption={(input: any, option: any) =>
                  (option?.children ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {locationOptions.map((option: any) => (
                  <Select.Option key={option.value} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <span style={{ color: "black" }}>Entity:</span>
              <Select
                showSearch
                allowClear
                onClear={() => setSelectedEntity(undefined)}
                disabled={disableDept}
                placeholder="Select Department"
                value={selectedEntity}
                style={{
                  width: 320,
                  marginLeft: 8,
                  border: "1px solid black",
                  borderRadius: "5px",
                }}
                onChange={handleDepartmentChange}
                optionFilterProp="children"
                filterOption={(input: any, option: any) =>
                  (option?.children ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {departmentOptions.map((option: any) => (
                  <Select.Option key={option.value} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            </Breadcrumb.Item>
            {/* <Breadcrumb.Item>
              <Checkbox
                //   checked={formData?.executiveApprovalRequired}
                onChange={() => setChecked(!checked)}
                className={classes.checkbox}
                style={{
                  marginRight: "20px",
                  marginTop: "3px",

                  padding: "5px",
                }}
              >
                Show Only High Priority
              </Checkbox>
            </Breadcrumb.Item> */}
          </Breadcrumb>
          <div style={{ marginTop: "10px" }}>
            <Table
              columns={ageingColumns}
              dataSource={deptwiseData}
              rowClassName={(record, index) =>
                index === deptwiseData?.length - 1 ? classes.highlightRow : ""
              }
              //   rowKey="departmentName"
              pagination={false}
              components={{
                header: {
                  cell: (props: any) => (
                    <th
                      {...props}
                      className={classes.tableHeader} // Apply custom header styles
                    />
                  ),
                },
                body: {
                  cell: (props: any) => (
                    <td
                      {...props}
                      className={classes.tableCell} // Apply custom cell styles
                    />
                  ),
                },
              }}
            />
          </div>
        </TabPane>
        <TabPane tab="Chart" key="3">
          <div
            style={{
              width: "100%",
              height: "100vh",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "50%",
                height: "60vh",
                border: "1px solid black",
                padding: "20px",
                borderRadius: "8px",
              }}
            >
              <CapaNewChart
                selectedEntity={selectedEntity}
                selectedLocation={selectedLocation}
                tableData={tableData}
              />
            </div>
          </div>
        </TabPane>
      </Tabs>
    </>
    // </Modal>
  );
};

export default CapaReportModal;
