import { useEffect, useState } from "react";
import DocumentDcount from "./DocumentDCount";
import DocumentDashBoardCharts from "./DocumentDashBoardCharts";
import axios from "apis/axios.global";
import { BiReset } from "react-icons/bi";
import { Tooltip, makeStyles, Theme, useMediaQuery } from "@material-ui/core";
import {
  Modal,
  Table,
  Button as AndTdButton,
  Select as AntdSelect,
  Breadcrumb,
  message,
  Tag,
} from "antd";
import { AiOutlineFileExcel } from "react-icons/ai";
import getAppUrl from "utils/getAppUrl";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import { MdRotateLeft } from "react-icons/md";
import { ReactComponent as FilterIcon } from "assets/documentControl/Filter.svg";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import LeaderBoard from "./LeaderBoard";
import SecondaryButton from "components/ReusableComponents/SecondaryButton";

const useStyles = makeStyles((theme: Theme) => ({
  formControl: {
    minWidth: "100%",
  },
  container: {
    border: "1px solid #666666",
    borderRadius: "5px",
    "& .ant-picker-suffix .anticon-calendar": {
      color: "#4096FF" /* Change the color of the default icon */,
    },
    "& .ant-select-arrow": {
      color: "#4096FF", // Change the color of the default icon
    },
  },
  tableContainer: {
    width: "100%",
    overflowx: "scroll",
    // fontFamily: "Poppins !important",
    "& .ant-table-wrapper .ant-table.ant-table-bordered > .ant-table-container > .ant-table-summary > table > tfoot > tr > td":
      {
        borderInlineEnd: "none",
      },
    // overflowY: "hidden",
    // overflowX: "hidden !important",
    "& .ant-table-thead .ant-table-cell": {
      // backgroundColor: ({ headerBgColor }) => headerBgColor,
      // color: ({ tableColor }) => tableColor,
      backgroundColor: "#E8F3F9",
      borderBottom: "1px solid #003059",
      // fontFamily: "Poppins !important",
      color: "#00224E",
    },
    "& span.ant-table-column-sorter-inner": {
      color: "#00224E",
      // color: ({ iconColor }) => iconColor,
    },
    "& span.ant-tag": {
      display: "flex",
      width: "89px",
      padding: "5px 0px",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: "10px",
      color: "white",
    },
    "& .ant-table-wrapper .ant-table-thead>tr>th": {
      position: "sticky", // Add these two properties
      top: 0, // Add these two properties
      zIndex: 2,
      // padding: "12px 16px",
      fontWeight: 600,
      fontSize: "14px",
      padding: "6px 8px !important",
      // fontFamily: "Poppins !important",
      lineHeight: "24px",
    },
    "& .ant-table-tbody >tr >td": {
      // borderBottom: ({ tableColor }) => `1px solid ${tableColor}`, // Customize the border-bottom color here
      borderBottom: "1px solid #f0f0f0",
      padding: "4px 8px !important",
    },
    // "& .ant-table-wrapper .ant-table-container": {
    //   maxHeight: ({
    //     isGraphSectionVisible,
    //   }: {
    //     isGraphSectionVisible: boolean;
    //   }) => (isGraphSectionVisible ? "160px" : "420px"), // Adjust the max-height value as needed
    //   [theme.breakpoints.up("lg")]: {
    //     maxHeight: ({
    //       isGraphSectionVisible,
    //     }: {
    //       isGraphSectionVisible: boolean;
    //     }) => (isGraphSectionVisible ? "160px" : "420px"), // Adjust the max-height value as needed for large screens
    //   },
    //   [theme.breakpoints.up("xl")]: {
    //     maxHeight: ({
    //       isGraphSectionVisible,
    //     }: {
    //       isGraphSectionVisible: boolean;
    //     }) => (isGraphSectionVisible ? "600px" : "1000px"), // Adjust the max-height value as needed for extra large screens
    //   },
    //   overflowY: "auto",
    //   overflowX: "hidden",
    // },
    "& .ant-table-body": {
      maxHeight: "150px", // Adjust the max-height value as needed
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
    "& tr.ant-table-row": {
      // borderRadius: 5,
      cursor: "pointer",
      transition: "all 0.1s linear",

      "&:hover": {
        backgroundColor: "white !important",
        boxShadow: "0 1px 5px 0px #0003",
        // transform: "scale(1.01)",

        "& td.ant-table-cell": {
          backgroundColor: "white !important",
        },
      },
    },
  },
  documentTable: {
    "&::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "grey",
    },
    width: "100%", // Adjust the width as needed
    overflowX: "auto", // Add horizontal scroll if needed
    "& .ant-table": {
      minWidth: "100%", // Ensure table fills container width
    },
    "& .ant-table-body": {
      maxWidth: "100%", // Ensure table body fills container width
    },
    // "& .ant-table-pagination": {
    //   display: "none", // Hide default pagination
    // },
  },
  centerAlignedCell: {
    textAlign: "center",
    "&.ant-table-body ": {
      padding: "0px",
    },
    "&.ant-table-wrapper .ant-table-tbody>tr>td": {
      padding: "5px 8px",
    },

    "&.custom-pagination .ant-pagination": {
      fontSize: "12px" /* Adjust the font size as needed */,
    },

    /* Reduce the size of the pagination number */
    " &.custom-pagination .ant-pagination-item ": {
      fontSize: "12px",
    },

    /* Reduce the size of the pagination arrows */
    "& .custom-pagination .ant-pagination-item-link": {
      fontSize: "12px" /* Adjust the font size as needed */,
    },

    /* Reduce the size of the pagination size changer */
    "&.custom-pagination .ant-pagination-options ": {
      fontSize: "12px" /* Adjust the font size as needed */,
    },
  },

  table: {
    // border: "1px solid grey",
    // textAlign: "center",
    borderTopLeftRadius: "0px", // Remove top-left border-radius
    borderTopRightRadius: "0px",

    "& .ant-table-thead > tr > th": {
      backgroundColor: "#ccffff", // Change background color of header
      color: "black", // Change text color of header
      //   borderBottom: "1px solid black", // Add bottom border to header
      borderRadius: "none",
      borderTopLeftRadius: "0px", // Remove top-left border-radius
      borderTopRightRadius: "0px",
      // textAlign: "center",
    },
    "& .ant-table-tbody > tr > td": {
      borderBottom: "1px solid #d9d9d9",
      padding: "8px 10px",
      // textAlign: "center",
    },
    // "& .ant-table-tbody > tr:last-child > td": {
    //   borderBottom: "none",
    // },
  },
}));

function arrayToQueryString(key: any, array: any) {
  if (array && array.length > 0) {
    return array
      .map((item: any) => `${key}[]=${encodeURIComponent(item)}`)
      .join("&");
  }
  return "";
}

const generateDocumentQueryString = (
  selectedEntity: string[],
  selectedLocation: string,
  userDetails: any,
  defaultFilter: boolean = false
): string => {
  let queryParts: string[] = [];

  if (!defaultFilter) {
    // Handle entity (array)
    if (Array.isArray(selectedEntity) && selectedEntity[0] !== "All") {
      queryParts.push(arrayToQueryString("entityIds", selectedEntity));
    }

    // Handle location (string)
    if (selectedLocation && selectedLocation !== "All") {
      queryParts.push(arrayToQueryString("locationIds", [selectedLocation]));
    }
  } else {
    queryParts.push(arrayToQueryString("entityIds", [userDetails?.entity?.id]));
    queryParts.push(
      arrayToQueryString("locationIds", [userDetails?.location?.id])
    );
  }

  queryParts.push(`organizationId=${userDetails?.organizationId}`);
  return queryParts.join("&");
};

const DocumentDashBoard = () => {
  const matches = useMediaQuery("(min-width:820px)");
  const userDetail = JSON.parse(sessionStorage.getItem("userDetails") || "{}");

  const [activeTab, setActiveTab] = useState(0);
  const classes = useStyles();

  const [businessType, setBusinessType] = useState([]);
  const [business, setBusiness] = useState([]);
  const [functionData, setFunctionData] = useState([]);
  const [location, setLocation] = useState<any>([]);
  const [entity, setEntity] = useState<any>([]);
  const [type, setType] = useState("activeuser");
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [filterField, setFilterField] = useState<any>({
    location: userDetail.locationId,
    entity: [userDetail.entityId],
  });

  // console.log("filterField", filterField);

  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // header components states
  const [noOfDocs, setNoOfDocs] = useState<any>();
  const [noOfMyDept, setNoOfMyDept] = useState<any>();
  const [noOfNewDocs, setNoOfNewDocs] = useState<any>();
  const [noOfNewMyDept, setNoOfNewMyDept] = useState<any>();
  const [noOfRevisedDocs, setNoOfRevisedDocs] = useState<any>();
  const [noOfRevisedMyDept, setNoOfRevisedMyDept] = useState<any>();
  const [dueRevision, setDueRevision] = useState<any>();
  const [dueRevisionMyDept, setDueRevisionMyDept] = useState<any>();
  const [inWorkFlowCountMyLoc, setInWorkFlowCountMyLoc] = useState<any>();
  const [inWorkFlowCountMyDept, setInWorkFlowCountMyDept] = useState<any>();
  const [totalDocsMyLoc, setTotalDocsMyLoc] = useState<any>();
  const [totalDocsMyDept, setTotalDocsMyDept] = useState<any>();
  const [totalDocs, setTotalDocs] = useState<any>();
  const [totalTypeData, setTotalTypeData] = useState<any>();
  const [revisedCurrentYear, setRevisedCurrentYear] = useState<any>();
  const [yearDataPublished, setYearDataPublished] = useState<any>();
  const [revisedOverDue, setRevisedOverDue] = useState<any>();
  const [inWorkFlowData, setInWorkFlowData] = useState<any>();
  const [statusData, setStatusData] = useState<any>([]);
  const [typeData, setTypeData] = useState<any>([]);
  const [systemData, setSystemData] = useState<any>([]);
  const [departmentTableData, setDepartmentTableData] = useState<any>([]);
  const [documentdata, setDocumentData] = useState<any>([]);
  const [deptData, setDeptData] = useState<any>([]);
  const [locationData, setLocationData] = useState<any>([]);
  const [secTableData, setSecTableData] = useState<any>([]);
  const [secondModal, setSecondModal] = useState<any>(false);
  const [monthData, setMonthData] = useState<any>([]);
  const [docTypeData, setDocTypeData] = useState<any>([]);
  const [documentTypeData, setDocumentTypeData] = useState<any>([]);
  const [order, setOrder] = useState(false);
  const [filterQuery, setFilterQuery] = useState<any>();
  const [leaderBoardData, setLeaderBoardData] = useState<any>({});

  const realmName = getAppUrl();

  const { Option } = AntdSelect;
  // useEffect(() => {
  //   fetchDataForOptions();
  //   if (userDetail.userType === "globalRoles") {
  //     const loc = userDetail?.additionalUnits?.includes("All")
  //       ? "All"
  //       : userDetail?.additionalUnits[0]?.id;
  //     setFilterField({
  //       location: loc,
  //       entity: ["All"],
  //     });
  //   } else {
  //     setFilterField({
  //       location: userDetail.locationId,
  //       entity: [userDetail.entityId],
  //     });
  //   }
  // }, []);

  // useEffect(() => {
  //   fetchLocationData();
  //   // fetchEntityData();
  //   chartData();
  // }, [activeTab]);

  const renderTooltipText = (text: string, width = 100) => (
    <Tooltip title={text}>
      <div style={{ width }}>
        <div
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {text}
        </div>
      </div>
    </Tooltip>
  );

  const columns = [
    {
      title: "Doc Number",
      dataIndex: "docNumber",
      key: "docNumber",
      width: 120,
      render: (_: any, record: any) =>
        renderTooltipText(
          record.docNumber ? record?.docNumber : record?.documentNumbering,
          100
        ),
    },
    {
      title: "Doc Title",
      dataIndex: "documentName",
      key: "documentName",
      width: 300,
      render: (_: any, record: any) => {
        const title = record.documentName || "";
        const isTruncated = title.length > 25;
        const displayTitle = isTruncated ? `${title.slice(0, 25)}...` : title;

        return (
          <Tooltip title={title}>
            <div
              // className={classes.clickableField}
              // onClick={() => toggleDocViewDrawer(record)}
              style={{
                textDecorationLine: "underline",
                cursor: "pointer",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "240px", // Adjust width if needed
              }}
            >
              {displayTitle}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "Doc Type",
      dataIndex: "docTypeName",
      key: "docTypeName",
      // width: 120,
    },
    {
      title: "Department/Vertical",
      dataIndex: "entityName",
      key: "entityName",
      // width: 120,
    },
    {
      title: "Corp Func/Unit",
      dataIndex: "locationName",
      key: "locationName",
      // width: 120,
    },
    {
      title: "Version",
      dataIndex: "version",
      width: 150,
      key: "version",
      render: (_: any, record: any) => (
        <div
        // style={{
        //   display: "flex",
        //   alignItems: "center",
        //   justifyContent: "center",
        // }}
        >
          {record.issueNumber} - {record.currentVersion}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "documentState",
      key: "documentState",
      width: 150,
      render: (_: any, record: any) => {
        const statusMap: Record<string, { label: string; color: string }> = {
          DRAFT: { label: "Draft", color: "#e6f7ff" },
          IN_REVIEW: { label: "In Review", color: "#d9f7be" },
          IN_APPROVAL: { label: "In Approval", color: "#fff1b8" },
          PUBLISHED: { label: "Published", color: "#f6ffed" },
          Sent_For_Edit: { label: "Sent for Edit", color: "#fff2e8" },
          OBSOLETE: { label: "Obsolete", color: "#f9f0ff" },
        };

        const { label, color } = statusMap[record.documentState] || {
          label: record.documentState,
          color: "#f0f0f0",
        };

        return (
          <div
          // style={{
          //   display: "flex",
          //   alignItems: "center",
          //   justifyContent: "center",
          // }}
          >
            <Tag
              style={{
                backgroundColor: color,
                borderRadius: "20px",
                padding: "2px 12px",
                fontWeight: 500,
                color: "#000",
                textTransform: "capitalize",
                whiteSpace: "normal", //  Allows text to wrap
                wordBreak: "break-word", //Ensures long words break
                textAlign: "center", // Optional: Center-align wrapped text
                // minWidth : "100px",
                // width : "170px",
                maxWidth: "170px", // Optional: Control width to force wrap
                display: "inline-block",
              }}
            >
              {label}
            </Tag>
          </div>
        );
      },
    },

    {
      title: "Published Date",
      dataIndex: "approvedDate",
      key: "approvedDate",
      width: 180,
      render: (_: any, record: any) => {
        if (!record?.approvedDate) return "";

        const date = new Date(record.approvedDate);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
        const year = date.getFullYear();

        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {`${day}-${month}-${year}`}
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    getLocationOptions();
    getDepartmentOptions(userDetail?.location?.id);

    getDocumentDashboardCounts(true);
    getDocumentChartDataBySystem(true);
    getDocumentChartDataByStatus(true);
    getDocumentChartDataByDocType(true);
    if (filterField?.entity?.includes("All")) {
      getDocumentChartDataByDepartment(true);
    }
    if (filterField?.location === "All") {
      getDocumentChartDataByLocation(true);
    }
  }, []);

  useEffect(() => {
    if (filterQuery) {
      setCurrent(1);
      setPageSize(10);
      getFilteredDocumentTableData(
        filterField?.entity,
        filterField?.location,
        userDetail,
        1,
        10,
        filterQuery
      );
    }
  }, [filterQuery]);

  // const columns: any = [
  //   {
  //     title: "Name",
  //     dataIndex: "documentName",
  //     width: "250px",
  //     key: "documentName",
  //     render: (_: any, record: any, index: any) => {
  //       return (
  //         <div
  //           style={{
  //             textDecorationLine: "underline",
  //             cursor: "pointer",
  //             width: "250px",
  //           }}
  //           onClick={() => {
  //             const url = `${
  //               process.env.REACT_APP_SERVER_MODE === "true"
  //                 ? `https://${REDIRECT_URL}`
  //                 : `http://${realmName}.${REDIRECT_URL}`
  //             }/processdocuments/processdocument/viewprocessdocument/${
  //               record?.id
  //             }`;

  //             window.open(url, "_blank");
  //           }}
  //         >
  //           <Tooltip title={record.documentName}>
  //             <span style={{ width: "100%" }}> {record.documentName}</span>
  //           </Tooltip>
  //         </div>
  //       );
  //     },
  //   },
  //   ...(activeTab !== 9 && activeTab !== 14 && activeTab !== 8
  //     ? [
  //         {
  //           title: "Document Number",
  //           dataIndex: "documentNumbering",
  //           width: "200px",
  //           sortOrder: order ? "ascend" : "descend",
  //           showSorterTooltip: false,
  //           onHeaderCell: () => ({
  //             onClick: handleSorterClick,
  //           }),
  //           sorter: true, // This enables the sort icon
  //           key: "documentNumbering",
  //         },
  //       ]
  //     : []),
  //   ...(activeTab === 9 || activeTab === 14 || activeTab === 8
  //     ? [
  //         {
  //           title: "Pending with",
  //           dataIndex: "pendingWith",
  //           key: "pendingWith",
  //           render: (_: any, record: any) => {
  //             return (
  //               <MultiUserDisplay data={record.pendingWith} name="email" />
  //             );
  //           },
  //         },
  //       ]
  //     : []),
  //   {
  //     title: "Status",
  //     dataIndex: "documentState",
  //     width: "200px",
  //     key: "documentState",
  //   },
  //   {
  //     title: "Unit Name",
  //     dataIndex: "creatorLocation",
  //     width: "200px",
  //     key: "creatorLocation",
  //     render: (text: any, record: any, index: any) =>
  //       record?.creatorLocation?.locationName || "",
  //   },
  //   {
  //     title: "Dept/Vertical Name",
  //     dataIndex: "creatorEntity",
  //     width: "200px",
  //     key: "creatorEntity",
  //     render: (text: any, record: any, index: any) =>
  //       record?.creatorEntity?.entityName || "",
  //   },
  // ];

  const [exportDatas, setExportData] = useState<any[]>([]);
  const [unitOption, setUnitOption] = useState(userDetail.entityId);
  const [locationOption, setLocationOption] = useState(userDetail.locationId);
  // console.log("unitOption", unitOption, locationOption);

  const fetchData = () => {
    getDocumentDashboardCounts(false);
    getDocumentChartDataBySystem(false);
    getDocumentChartDataByStatus(false);
    getDocumentChartDataByDocType(false);
    if (filterField?.entity?.includes("All")) {
      getDocumentChartDataByDepartment(false);
    }
    if (filterField?.location === "All") {
      getDocumentChartDataByLocation(false);
    }
    setUnitOption(filterField.entity[0]);
    setLocationOption(filterField.location);
  };

  const handleResetFilter = () => {
    getDocumentDashboardCounts(true);
    getDocumentChartDataBySystem(true);
    getDocumentChartDataByStatus(true);
    getDocumentChartDataByDocType(true);
  };

  const getLocationOptions = async () => {
    try {
      const res = await axios.get(
        `/api/riskregister/getAllLocation/${userDetail?.organizationId}`
      );

      if (res.status === 200 || res.status === 201) {
        //console.log("checkrisk res in getAllLocation", res);
        if (res?.data?.data && !!res.data.data.length) {
          setLocation([
            ...[{ id: "All", locationName: "All" }],
            ...res?.data?.data?.map((item: any) => ({
              ...item,
              value: item.id,
              label: item.locationName,
            })),
          ]);
        } else {
          setLocation([]);
          message.warning("No Locations Found");
        }
      } else {
        // setJobTitleOptions([]);
        message.error("Error in fetching getAllLocation");
      }
    } catch (error) {
      // //console.log("checkrisk error in fetching all job title", error);
    }
  };

  const getDepartmentOptions = async (locationId: any = "") => {
    try {
      const res = await axios.get(
        `/api/riskregister/getAllDepartmentsByLocation/${locationId}`
      );

      if (res.status === 200 || res.status === 201) {
        //console.log("checkrisk res in getAllDepartmentsByLocation", res);
        if (res?.data?.data && !!res.data.data.length) {
          setEntity([
            ...[{ id: "All", entityName: "All" }],
            ...res?.data?.data?.map((item: any) => ({
              ...item,
              value: item.id,
              label: item.entityName,
            })),
          ]);
        } else {
          setEntity([]);
          message.warning("No Departments Found");
        }
      } else {
        // setJobTitleOptions([]);
        message.error("Error in fetching getAllDepartmentsByLocation");
      }
    } catch (error) {
      // //console.log("checkrisk error in fetching all job title", error);
    }
  };

  const getDocumentDashboardCounts = async (defaultFilter: boolean = false) => {
    try {
      const queryString = generateDocumentQueryString(
        filterField?.entity,
        filterField?.location,
        userDetail,
        defaultFilter // set to true if you want to use default user entity/location
      );

      const res = await axios.get(
        `/api/dashboard/docDashboardCounts?${queryString}`
      );
      if (res?.data) {
        setLeaderBoardData({
          ...res?.data,
          totalDocuments: res?.data?.totalDocuments,
          totalPublishedDocuments: res?.data?.totalPublishedDocuments,
          publishedThisYear: res?.data?.publishedThisYear,
          inWorkflow: res?.data?.inWorkflow,
        });
      }
    } catch (error) {
      message.error("Error in fetching Document Dashboard Counts");
    }
  };

  const getDocumentChartDataBySystem = async (
    defaultFilter: boolean = false
  ) => {
    try {
      const queryString = generateDocumentQueryString(
        filterField?.entity,
        filterField?.location,
        userDetail,
        defaultFilter
      );

      const res = await axios.get(
        `/api/dashboard/docChartDataBySystem?${queryString}`
      );

      if (res?.data) {
        setSystemData(res.data); // assuming you have a state setter like this
      }
    } catch (error) {
      message.error("Error in fetching System-wise Document Data");
    }
  };

  const getDocumentChartDataByStatus = async (
    defaultFilter: boolean = false
  ) => {
    try {
      const queryString = generateDocumentQueryString(
        filterField?.entity,
        filterField?.location,
        userDetail,
        defaultFilter
      );

      const res = await axios.get(
        `/api/dashboard/docChartDataByStatus?${queryString}`
      );

      if (res?.data) {
        setStatusData(res.data); // assuming you have a state setter like this
      }
    } catch (error) {
      message.error("Error in fetching Status-wise Document Data");
    }
  };

  const getDocumentChartDataByDocType = async (
    defaultFilter: boolean = false
  ) => {
    try {
      const queryString = generateDocumentQueryString(
        filterField?.entity,
        filterField?.location,
        userDetail,
        defaultFilter
      );

      const res = await axios.get(
        `/api/dashboard/docChartDataByDocType?${queryString}`
      );

      if (res?.data) {
        setTypeData(res.data); // assuming you have a state setter like this
      }
    } catch (error) {
      message.error("Error in fetching Status-wise Document Data");
    }
  };

  const getDocumentChartDataByDepartment = async (
    defaultFilter: boolean = false
  ) => {
    try {
      const queryString = generateDocumentQueryString(
        filterField?.entity,
        filterField?.location,
        userDetail,
        defaultFilter
      );

      const res = await axios.get(
        `/api/dashboard/docChartDataByDepartment?${queryString}`
      );

      if (res?.data) {
        setDeptData(res.data); // assuming you have a state setter like this
      }
    } catch (error) {
      message.error("Error in fetching Status-wise Document Data");
    }
  };

  const getDocumentChartDataByLocation = async (
    defaultFilter: boolean = false
  ) => {
    try {
      const res = await axios.get(
        `/api/dashboard/docChartDataByLocation/${userDetail?.organizationId}`
      );

      if (res?.data) {
        // console.log("res",res?.data);
        setLocationData(res.data);
        // setDeptData(res.data); // assuming you have a state setter like this
      }
    } catch (error) {
      message.error("Error in fetching Status-wise Document Data");
    }
  };

  const getFilteredDocumentTableData = async (
    selectedEntity: string[],
    selectedLocation: string,
    userDetails: any,
    page: number,
    pageSize: number,
    filters?: {
      system?: string[];
      status?: string;
      type?: string;
      entityId?: string;
      locationId?: string;
    }
  ) => {
    try {
      // Base query from entity, location, and user
      let queryString = generateDocumentQueryString(
        selectedEntity,
        selectedLocation,
        userDetails,
        false
      );

      // Append filter (only one key should be present)
      if (filters) {
        if (
          filters.system &&
          Array.isArray(filters.system) &&
          filters.system.length > 0
        ) {
          queryString += `&${arrayToQueryString("system", filters.system)}`;
        } else if (filters.status) {
          queryString += `&status=${encodeURIComponent(filters.status)}`;
        } else if (filters.type) {
          queryString += `&type=${encodeURIComponent(filters.type)}`;
        } else if (filters.entityId) {
          queryString += `&entityId=${encodeURIComponent(filters.entityId)}`;
        } else if (filters.locationId) {
          queryString += `&locationId=${encodeURIComponent(
            filters.locationId
          )}`;
        }
      }

      queryString += `&page=${page}&limit=${pageSize}`;

      // Make GET request
      const res = await axios.get(
        `/api/dashboard/filteredDocumentList?${queryString}`
      );
      if (res?.data?.data?.length) {
        setSecTableData(res?.data?.data);
        setCount(res?.data?.count);
        setSecondModal(true);
      } else {
        setSecTableData([]);
        setCount(0);
      }
    } catch (error) {
      console.error("Error fetching filtered document table data", error);
      message.error("Failed to fetch document table data");
      return null;
    }
  };

  // console.log("leaderBoardData",leaderBoardData
  const defaultChartData = async () => {
    try {
      let name, type;
      // if (activeTab === 0) {
      name = "totalPublished";
      type = "myDept";
      // }
      setActiveTab(0);
      // const encodedLoc = filterField?.location
      //   ?.map((value: any) => {
      //     return `location[]=${value}`;
      //   })
      //   .join("&");
      // const encodedEntity = filterField?.entity
      //   ?.map((value: any) => {
      //     return `entity[]=${value}`;
      //   })
      //   .join("&");
      // location: userDetail.locationId,
      // entity: userDetail.entityId,
      if (
        // filterField?.entity !== undefined &&
        filterField?.location !== undefined
      ) {
        const res = await axios.get(
          `api/dashboard/dashboardData?name=${name}&type=${type}&entity[]=${userDetail.entityId}&location[]=${userDetail.locationId}`
        );
        setDocTypeData(res?.data?.chartData?.docTypeData || []);
        setNoOfMyDept(res?.data?.leaderBoard?.totalPublishedByDept || 0);
        setNoOfDocs(res?.data?.leaderBoard?.totalPublishedByLoc || 0);
        setNoOfNewMyDept(res?.data?.leaderBoard?.yearPublishedByDept || 0);
        setNoOfNewDocs(res?.data?.leaderBoard?.yearPublishedByLoc || 0);
        setNoOfRevisedMyDept(
          res?.data?.leaderBoard?.revisedCurrentYearByDept || 0
        );
        setNoOfRevisedDocs(
          res?.data?.leaderBoard?.revisedCurrentYearByloc || 0
        );
        setDueRevisionMyDept(res?.data?.leaderBoard?.revisedOverDueDept || 0);
        setDueRevision(res?.data?.leaderBoard?.revisedOverDueLoc || 0);
        setInWorkFlowCountMyDept(res?.data?.leaderBoard?.inWorkFlowDept || 0);
        setInWorkFlowCountMyLoc(res?.data?.leaderBoard?.inWorkFlowLoc || 0);
        setStatusData(res?.data?.chartData?.type || []);
        setTypeData(res?.data?.chartData?.doctypeData || []);
        setSystemData(res?.data?.chartData?.systemData || []);
        setDepartmentTableData(res?.data?.chartData?.deptStatusData || []);
        setDocumentData(res?.data?.chartData?.tableData || []);
        setType(res?.data?.leaderBoard?.type);
        setTotalTypeData(res?.data?.leaderBoard?.totalPublished || 0);
        setRevisedCurrentYear(res?.data?.leaderBoard?.revisedCurrentYear || 0);
        setYearDataPublished(res?.data?.leaderBoard?.yearPublished || 0);
        setRevisedOverDue(res?.data?.leaderBoard?.revisedOverDue || 0);
        setInWorkFlowData(res?.data?.leaderBoard?.inWorkFlow || 0);
        setTotalDocsMyLoc(res?.data?.leaderBoard?.totalDocByLoc || 0);
        setTotalDocsMyDept(res?.data?.leaderBoard?.totalDocByDept || 0);
        setTotalDocs(res?.data?.leaderBoard?.totalDoc || 0);
        setDeptData(res?.data?.chartData?.deptData || []);
        setMonthData(res?.data?.chartData?.monthData || []);
        setDocumentTypeData(res?.data?.docTypeData || []);
      }
    } catch (err) {}
  };

  // mobile view filter moda.

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const exportToExcel = () => {
    if (!exportDatas || exportDatas.length === 0) {
      return;
    }

    // Convert dataSource into an array format suitable for Excel
    const worksheetData = exportDatas.map((item: any) => ({
      Name: item.documentName || "",
      "Document Number": item.documentNumbering || "",
      "Pending With":
        item.pendingWith?.map((user: any) => user.email).join(", ") || "",
      Status: item.documentState || "",
      "Unit Name": item.creatorLocation?.locationName || "",
      "Dept/Vertical Name": item.creatorEntity?.entityName || "",
    }));

    // Create a new worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Table Data");

    // Convert the workbook to a binary format
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "binary",
    });

    // Function to create a Blob and trigger download
    const s2ab = (s: string) => {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < s.length; i++) {
        view[i] = s.charCodeAt(i) & 0xff;
      }
      return buf;
    };

    // Create Blob and trigger download
    const data = new Blob([s2ab(excelBuffer)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(data, "Table_Data.xlsx");
  };

  //------------------------------

  return (
    <div style={{ width: "100%" }}>
      {matches ? (
        <div
          style={{
            width: "100%",
            fontSize: "20px",
            color: "black !important",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
              marginLeft: "16px",
            }}
          >
            <p style={{ fontSize: "14px", fontWeight: 600 }}>
              Total # of Documents :
            </p>
            <p
              style={{
                fontSize: "42px",
                fontWeight: 600,
                color: "#003059",
                margin: "0px 0px",
                padding: "0px 0px",
              }}
            >
              {leaderBoardData?.totalDocuments || 0}
            </p>
          </div>
          <div style={{ display: "flex", marginRight: "16px" }}>
            <Breadcrumb separator="  ">
              <Breadcrumb.Item>
                <span style={{ color: "black" }}>Unit:</span>

                <AntdSelect
                  showSearch
                  allowClear
                  placeholder="Select Unit"
                  // onClear={() => setSelectedLocation(undefined)}
                  value={filterField?.location || ""}
                  style={{
                    width: 200,
                    marginLeft: 8,
                    border: "1px solid black",
                    borderRadius: "5px",
                  }}
                  onChange={(value) => {
                    setFilterField({
                      ...filterField,
                      location: value,
                      entity: [],
                    });
                  }}
                  optionFilterProp="children"
                  filterOption={(input, option: any) => {
                    // Match the input with the locationName instead of id
                    const locationName =
                      location.find((loc: any) => loc.id === option.value)
                        ?.locationName || "";
                    return locationName
                      .toLowerCase()
                      .includes(input.toLowerCase());
                  }}
                >
                  {location.map((obj: any) => (
                    <Option key={obj.id} value={obj.id}>
                      {obj.locationName}
                    </Option>
                  ))}
                </AntdSelect>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <span>Department:</span>

                <AntdSelect
                  showSearch
                  allowClear
                  disabled={filterField.location === "All" ? true : false}
                  mode="multiple"
                  // onClear={() => setSelectedEntity(undefined)}
                  placeholder="Select Department"
                  value={filterField?.entity || []}
                  style={{
                    width: 350,
                    marginLeft: 8,
                    border: "1px solid black",
                    borderRadius: "5px",
                  }}
                  onChange={(value) => {
                    if (value.includes("All")) {
                      setFilterField({ ...filterField, entity: ["All"] });
                    } else {
                      setFilterField({ ...filterField, entity: value });
                    }
                  }}
                  optionFilterProp="children"
                  filterOption={(input, option: any) => {
                    // Match the input with the locationName instead of id
                    const locationName =
                      entity.find((loc: any) => loc.id === option.value)
                        ?.entityName || "";
                    return locationName
                      .toLowerCase()
                      .includes(input.toLowerCase());
                  }}
                >
                  {entity.map((obj: any) => (
                    <Option key={obj.id} value={obj.id}>
                      <span
                        style={{
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                        }}
                      >
                        {obj.entityName}
                      </span>
                    </Option>
                  ))}
                </AntdSelect>
              </Breadcrumb.Item>
            </Breadcrumb>
            <div style={{ margin: "0px 12px 0px 14px" }}>
              <SecondaryButton
                type="primary"
                onClick={() => {
                  fetchData();
                }}
                buttonText="Apply"
              />
            </div>

            <AndTdButton
              type="text"
              onClick={() => {
                setFilterField({
                  location: userDetail.locationId,
                  entity: [userDetail.entityId],
                });
                setUnitOption(userDetail.entityId[0]);
                setLocationOption(userDetail.locationId);
                handleResetFilter();
                setOpen(false);
              }}
              style={{
                display: "flex",
                justifyContent: "center",
                height: "32px",
                fontSize: "14px",
                fontFamily: "Roboto",
                alignItems: "center",
                gap: "6px",
                padding: "5px 0px",
              }}
            >
              <BiReset style={{ fontSize: "24px" }} />
              Reset
            </AndTdButton>
          </div>
        </div>
      ) : null}

      <div style={{ width: "100%", marginTop: "5px" }}>
        {/* <DocumentDcount
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          getDataForNoDocs={[]}
          noOfDocs={noOfDocs}
          noOfMyDept={noOfMyDept}
          noOfNewDocs={noOfNewDocs}
          noOfNewMyDept={noOfNewMyDept}
          noOfRevisedDocs={noOfRevisedDocs}
          noOfRevisedMyDept={noOfRevisedMyDept}
          dueRevision={dueRevision}
          dueRevisionMyDept={dueRevisionMyDept}
          inWorkFlowCountMyLoc={inWorkFlowCountMyLoc}
          inWorkFlowCountMyDept={inWorkFlowCountMyDept}
          totalTypeData={totalTypeData}
          revisedCurrentYear={revisedCurrentYear}
          yearDataPublished={yearDataPublished}
          revisedOverDue={revisedOverDue}
          inWorkFlowData={inWorkFlowData}
          type={type}
          totalDocsMyLoc={totalDocsMyLoc}
          totalDocsMyDept={totalDocsMyDept}
          totalDocs={totalDocs}
        /> */}

        <LeaderBoard leaderBoardData={leaderBoardData} />

        <DocumentDashBoardCharts
          setActiveTab={setActiveTab}
          activeTab={activeTab}
          statusData={statusData}
          typeData={typeData}
          systemData={systemData}
          departmentTableData={departmentTableData}
          documentdata={documentdata}
          deptData={deptData}
          locationData={locationData}
          setSecTableData={setSecTableData}
          secTableData={secTableData}
          setSecondModal={setSecondModal}
          // newData={newData}
          monthData={monthData}
          docTypeData={docTypeData}
          documentTypeData={documentTypeData}
          filterQuery={filterQuery}
          setFilterQuery={setFilterQuery}
          entity={entity}
          location={location}
          entityId={filterField?.entity}
          locationId={filterField?.location}
          unitOption={unitOption}
        />

        <Modal
          title=""
          visible={secondModal}
          width={"100%"}
          footer={null}
          zIndex={2000}
          onCancel={() => {
            setSecondModal(false);
          }}
          closeIcon={
            <img
              src={CloseIconImageSvg}
              alt="close-drawer"
              style={{
                width: "30px",
                height: "38px",
                cursor: "pointer",
              }}
            />
          }
        >
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "end",
                marginRight: "20px",
                marginBottom: "10px",
              }}
            >
              {/* <AndTdButton
                type="primary"
                onClick={exportToExcel}
                icon={<AiOutlineFileExcel />}
              >
                Download Excel
              </AndTdButton> */}
              <SecondaryButton
                type="primary"
                onClick={exportToExcel}
                buttonText="Download Excel"
                icon={<AiOutlineFileExcel />}
              />
            </div>
            <div className={classes.tableContainer}>
              <Table
                dataSource={secTableData}
                columns={columns}
                pagination={{
                  current: current,
                  pageSize: pageSize,
                  total: count,
                  showSizeChanger: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} documents`,
                  pageSizeOptions: ["10", "20", "30"],
                  onChange: (page, pageSizeNew) => {
                    setCurrent(page);
                    setPageSize(pageSizeNew);
                    getFilteredDocumentTableData(
                      filterField?.entity,
                      filterField?.location,
                      userDetail,
                      page,
                      pageSizeNew,
                      filterQuery
                    );
                    // Add your logic to handle page change if needed
                  },
                }}
                // style={{width:'900%'}}
                className={classes.documentTable}
              />
            </div>
          </>
        </Modal>
      </div>

      {matches ? (
        ""
      ) : (
        <div
          style={{
            paddingTop: "3px",
            position: "absolute",
            top: 82,
            right: 30,
          }}
        >
          <FilterIcon
            style={{ width: "24px", height: "24px" }}
            onClick={showModal}
          />
        </div>
      )}

      {/* // Mobile view Modal for filters */}
      <Modal
        title={
          <div
            style={{
              backgroundColor: "#E8F3F9",
              padding: "8px",
              borderTopLeftRadius: "8px",
              borderTopRightRadius: "8px",
            }}
          >
            Filter By
          </div>
        }
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        // className={classes.modal}
        footer={null}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{
              width: "30px",
              height: "30px",
              cursor: "pointer",
              padding: "0px",
              margin: "7px 15px 0px 0px",
            }}
          />
        }
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: "20px",
            // marginTop: "20px",
            // border: "1px solid rgba(19, 171, 155, 0.5)",
            // borderRadius: "12px",
            // padding: "20px",
            // margin: "20px 20px 10px 20px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              width: "100%",
            }}
          >
            <span style={{ color: "black" }}>Unit:</span>

            <AntdSelect
              showSearch
              allowClear
              placeholder="Select Unit"
              // onClear={() => setSelectedLocation(undefined)}
              value={filterField?.location || ""}
              style={{
                width: "100%",

                border: "1px solid black",
                borderRadius: "5px",
              }}
              onChange={(value) => {
                setFilterField({
                  ...filterField,
                  location: value,
                  entity: [],
                });
              }}
              optionFilterProp="children"
              filterOption={(input, option: any) => {
                // Match the input with the locationName instead of id
                const locationName =
                  location.find((loc: any) => loc.id === option.value)
                    ?.locationName || "";
                return locationName.toLowerCase().includes(input.toLowerCase());
              }}
            >
              {location.map((obj: any) => (
                <Option key={obj.id} value={obj.id}>
                  {obj.locationName}
                </Option>
              ))}
            </AntdSelect>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              width: "100%",
            }}
          >
            <span>Department:</span>

            <AntdSelect
              showSearch
              allowClear
              disabled={filterField.location === "All" ? true : false}
              mode="multiple"
              // onClear={() => setSelectedEntity(undefined)}
              placeholder="Select Department"
              value={filterField?.entity || []}
              style={{
                width: "100%",

                border: "1px solid black",
                borderRadius: "5px",
              }}
              onChange={(value) => {
                if (value.includes("All")) {
                  setFilterField({ ...filterField, entity: ["All"] });
                } else {
                  setFilterField({ ...filterField, entity: value });
                }
              }}
              optionFilterProp="children"
              filterOption={(input, option: any) => {
                // Match the input with the locationName instead of id
                const locationName =
                  entity.find((loc: any) => loc.id === option.value)
                    ?.entityName || "";
                return locationName.toLowerCase().includes(input.toLowerCase());
              }}
            >
              {entity.map((obj: any) => (
                <Option key={obj.id} value={obj.id}>
                  <span
                    style={{
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                    }}
                  >
                    {obj.entityName}
                  </span>
                </Option>
              ))}
            </AntdSelect>
          </div>

          <div
            style={{
              display: "flex",
              gap: "20px",
              justifyContent: "flex-start",
              width: "100%",
            }}
          >
            <AndTdButton
              type="primary"
              onClick={() => {
                fetchData();
              }}
              style={{
                width: "70px",
                backgroundColor: "rgb(0, 48, 89)",
                marginLeft: "5px",
                height: "28px",
                lineHeight: "16px",
              }}
            >
              Apply
            </AndTdButton>
            <AndTdButton
              type="text"
              onClick={() => {
                setFilterField({
                  location: userDetail.locationId,
                  entity: [userDetail.entityId],
                });
                handleResetFilter();
                setOpen(false);
              }}
              style={{
                width: "40px",
                display: "flex",
                justifyContent: "center",
                height: "32px",
              }}
              icon={<MdRotateLeft />}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DocumentDashBoard;
