import { useState, useEffect, useRef } from "react";
import {
  Box,
  CircularProgress,
  TextField,
  Typography,
  Tooltip,
  Grid,
  FormControl,
  Modal,
  IconButton,
  useMediaQuery,
} from "@material-ui/core";
import { MdForum } from "react-icons/md";

import { Modal as AntdModal } from "antd";

import CloseIconImageSvg from "assets/documentControl/Close.svg";
import commonGraphStyles from "pages/AuditHomePage/commonGraphStyle";
import useStyles from "./styles";
import { Link, useNavigate } from "react-router-dom";
import TableStatusAction from "components/TableStatusAction";
import { deleteNc, getMyNcSummary, getNcSummary } from "apis/ncSummaryApi";
import { ncSummaryObservationType, ncSummarySchema } from "schemas/ncSummary";
import EmptyTableIcon from "assets/EmptyTableImg.svg";
import moment from "moment";
import checkRole from "utils/checkRoles";
import { useSnackbar } from "notistack";
import { Autocomplete } from "@material-ui/lab";
import getAppUrl from "utils/getAppUrl";
import { getAllLocation } from "apis/locationApi";
import { getSystems, getSystemTypes } from "apis/systemApi";
import { getAllAuditors } from "apis/auditApi";
import { getAllClauses, ncTableSearch } from "apis/clauseApi";
import { useRecoilState, useResetRecoilState } from "recoil";
import { auditeeSectionData, ncsForm, observationData } from "recoil/atom";
import getUserId from "utils/getUserId";
import { ReactComponent as CustomEditICon } from "assets/documentControl/Edit.svg";
// import { ReactComponent as CustomDeleteICon } from "../../assets/documentControl/Delete.svg";
import { ReactComponent as CustomDeleteICon } from "../../../assets/documentControl/Delete.svg";

// import axios from "axios";
import axios from "apis/axios.global";
import React from "react";
import ActionPoint from "pages/NCSummary/Drawer/ActionPoint";
import { Table, Tag, Pagination, PaginationProps, Input } from "antd";
import {
  AiOutlinePlusCircle,
  AiOutlineMinusCircle,
  AiOutlineFilter,
  AiFillFilter,
  AiOutlineAudit,
  AiOutlineEdit,
} from "react-icons/ai";

import "./tableStyles.css";
import YearComponent from "components/Yearcomponent";
import getYearFormat from "utils/getYearFormat";
import { getNcGraphData } from "apis/dashboardApi";
import "react-alice-carousel/lib/alice-carousel.css";
import "./slider-carousel.css";
import getSessionStorage from "utils/getSessionStorage";
import { filterFields, newRoles } from "utils/enums";
import { roles } from "utils/enums";
import NcStackedBarChart from "components/NcGraphs/NcStackedBarChart";
import NcPieChart from "components/NcGraphs/NcPieChart";
import NcAgeAnalysisBarChart from "components/NcGraphs/NcAgeAnalysisBarChart";
import MultiUserDisplay from "components/MultiUserDisplay";
import NcSummaryDrawer from "components/NcSummaryForm/NcSummaryDrawer";
import { ReactComponent as CloseIcon } from "assets/documentControl/Close.svg";
import { Button } from "@material-ui/core";
import { ReactComponent as FilterIcon } from "assets/documentControl/Filter.svg";
import HindalcoLogoSvg from "assets/logo/HindalcoLogoSvg.svg";
import { MdOutlinePictureAsPdf } from "react-icons/md";
import printJS from "print-js";
import ChatComponent from "../ListChatModel";
import { formatDashboardQuery } from "utils/formatDashboardQuery";
import NcSummaryForm from "components/NcSummaryForm";

type Props = {
  graphComponent?: any;
  setGraphComponent?: any;
  refelemetForFindings2?: any;
  refelemetForFindings3?: any;
  refelemetForFindings4?: any;
  refelemetForFindings5?: any;
  refelemetForFindings6?: any;
};

const showTotal: PaginationProps["showTotal"] = (total) =>
  `Total ${total} items`;

/**
 * @description Functional component which generates the dashboard layout
 * @returns a react node
 */
function NcSummary({
  graphComponent = false,
  setGraphComponent,
  refelemetForFindings2,
  refelemetForFindings3,
  refelemetForFindings4,
  refelemetForFindings5,
  refelemetForFindings6,
}: Props) {
  const matches = useMediaQuery("(min-width:786px)");
  const smallScreen = useMediaQuery("(min-width:600px)");
  const classes = useStyles();
  const graphClasses = commonGraphStyles();
  const [isLoading, setIsLoading] = useState(false);
  const [ncObsData, setNcObsData] = useState<ncSummarySchema[]>();
  const [openDrawer, setOpenDrawer] = React.useState(false);
  const [modalData, setModalData] = React.useState({
    open: false,
    data: {},
    editMode: false,
    refresh: false,
  });
  const [chatModalOpen, setChatModalOpen] = useState<any>(false);

  const [actionPointData, setActionPointData] = useState<[]>();
  const [count, setCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openAudit, setOpenAudit] = useState(false);
  // const [rowsPerPage, setrowsPerPage] = useState<number>(25);
  const [locationListing, setLocationListing] = useState<any>([]);
  const [systemListing, setSystemListing] = useState<any>([]);
  const [subSystemListing, setSubSystemListing] = useState<any>([]);
  const [clauses, setClauses] = useState<any>([]);
  const [auditorListing, setAuditorListing] = useState<any>([]);
  const realmName = getAppUrl();
  const resetAuditee = useResetRecoilState(auditeeSectionData);
  const resetObservation = useResetRecoilState(observationData);
  const resetSummary = useResetRecoilState(ncsForm);
  const [currentYear, setCurrentYear] = useState<any>(new Date().getFullYear());
  const userId: any = getUserId();
  const [auditeeData, setAuditeeData] = useRecoilState(auditeeSectionData);
  const [auditDate, setAuditDate] = React.useState<any>();
  const [myDept, setMyDept] = useState(false);
  const [searchValue, setSearchValue] = useState<any>({
    location: "",
    auditType: "",
    systemType: "",
    auditor: "",
    from: "",
    to: "",
    clause: "",
  });
  const [searchQuery, setsearchQuery] = useState<any>({
    searchQuery: "",
  });
  const [filterOpen, setFilterOpen] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [modelVisible, setModalVisible] = useState(false);
  const [updateModelVisible, setUpdateModalVisible] = useState(false);
  const [rerender, setRerender] = useState(false);
  const [modalId, setModalId] = useState<string>("");
  const [filterList, setFilterList] = useState<any>([]);
  const [auditorModalVisible, setAuditorModalVisible] = useState(false);
  const [confirmModelVisible, setConfirmModalVisible] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const isAdmin = checkRole("admin");
  const isMR = checkRole("MR");
  const isOrgAdmin = checkRole(roles.ORGADMIN);
  const [dataid, setDataid] = useState("");
  const [activeTab, setActiveTab] = useState("1");
  const userInfo = JSON.parse(sessionStorage.getItem("userDetails") as string);
  const [selectedType, setselectedType] = useState<any>([]);
  const [isFilterType, setfilterType] = useState<boolean>(false);
  const [selectedDept, setselectedDept] = useState<any>([]);
  const [isFilterDept, setfilterDept] = useState<boolean>(false);
  const [selectedAudit, setselectedAudit] = useState<any>([]);
  const [isFilterAudit, setfilterAudit] = useState<boolean>(false);
  const [selectedSystem, setselectedSystem] = useState<any>([]);
  const [isFilterSystem, setfilterSystem] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<any>([]);
  const [isFilterStatus, setfilterStatus] = useState<boolean>(false);
  const [selectedAuditor, setselectedAuditor] = useState<any>([]);
  const [isFilterAuditor, setfilterAuditor] = useState<boolean>(false);
  const [selectedAuditee, setselectedAuditee] = useState<any>([]);
  const [isFilterAuditee, setfilterAuditee] = useState<boolean>(false);
  const [locationNames, setLocationNames] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any>([]);
  const [searchText, setSearchText] = useState(""); // State for search input
  const [auditNameList, setAuditNameList] = useState<any>([]);
  const isFirstRender = useRef(true);
  const [selectedOption, setSelectedOption] = useState("");
  const [auditTypes, setAuditTypes] = useState<any>([]);
  const [selectedAuditType, setSelectedAuditType] = useState<any>({
    id: "All",
    auditType: "All",
  });
  const [selected, setSelected] = useState(false);
  const [logo, setLogo] = useState<any>(null);
  const getLogo = async () => {
    const response = await axios.get(`/api/location/getLogo`);
    setLogo(response.data);
  };

  const reportHtmlFormatG = `
  <div>
    <style>
      * {
        font-family: "Poppins", sans-serif !important;
      }
      table {
        border-collapse: collapse;
        width: 100%;
        margin-bottom: 20px;
      }
      td, th {
        border: 1px solid black;
        padding: 8px;
        text-align: left;
      }
      .box {
        border: 1px solid black;
        padding: 10px;
        margin-top: 20px;
      }
    </style>
    
    <!-- Header Section -->
    <table>
      <tr>
        <td style="width: 100px;">
          ${
            logo
              ? `<img src="${logo}" alt="Hindalco Logo" width="100px" height="100px" />`
              : ""
          }
        </td>
        <td colspan="3" style="text-align: center; font-size: 22px; font-weight: 600; letter-spacing: 0.6px;">
          HINDALCO INDUSTRIES LIMITED<br />
          INTERNAL AUDIT REPORT
        </td>
      </tr>
      <tr>
        <td colspan="4"><b>Corp. Function/SBU/ Unit/Department Audited:</b> %LOCATION% / %ENTITY%</td>
      </tr>
      <tr>
        <td colspan="3"><b>Audit Name:</b> %AUDITNAME%</td>
        <td><b>Audit No.:</b> %AUDITNUMBER%</td>
      </tr>
      <tr>
        <td colspan="2"><b>Finding Date:</b> %FINDINGDATE%</td>
        <td colspan="2"><b>Status:</b> %STATUS%</td>
      </tr>
    </table>

    <!-- Body Section -->
    <table>
      <thead>
        <tr>
          <th width="10%">Finding</th>
          <th width="10%">Clause Number</th>
          <th>Details of Finding</th>
        </tr>
      </thead>
      <tbody>
        <!-- Add rows dynamically here -->
        <tr>
          <td>%FINDING%</td>
          <td>%CLAUSE_NUMBER%</td>
          <td>%DETAILS_OF_FINDING%</td>
        </tr>
      </tbody>
    </table>

    <!-- Root Cause Analysis -->
    <div class="box">
      <b>Root Cause Analysis:</b>
      <p>%ROOT_CAUSE_ANALYSIS%</p>
    </div>

    <!-- Correction Section -->
    <div class="box">
      <b>Planned Correction:</b>
      <p>%PLANNED_CORRECTION%</p>
      <b>Target Date:</b> %PLANNED_CORRECTION_TARGET_DATE%
    </div>

    <div class="box">
      <b>Planned Corrective Action:</b>
      <p>%PLANNED_CORRECTIVE_ACTION%</p>
      <b>Target Date:</b> %PLANNED_CORRECTIVE_ACTION_TARGET_DATE%
    </div>

    <!-- Corrective Action Section -->
    <div class="box">
      <b>Actual Correction:</b>
      <p>%ACTUAL_CORRECTION%</p>
      <b>Target Date:</b> %ACTUAL_CORRECTION_TARGET_DATE%
    </div>

    <!-- Corrective Action Section -->
    <div class="box">
      <b>Actual Corrective Action:</b>
      <p>%ACTUAL_CORRECTIVE_ACTION%</p>
      <b>Target Date:</b> %ACTUAL_CORRECTIVE_ACTION_TARGET_DATE%
    </div>

    <!-- Footer Section -->
    <table>
      <tr>
        <td colspan="2"><b>AUDITOR(s):</b> %AUDITORS%</td>
        <td colspan="2"><b>AUDITEE:</b> %AUDITEE%</td>
      </tr>
      <tr>
        <td colspan="4"><b>Date:</b> ${new Date().toLocaleDateString(
          "en-GB"
        )}</td>
      </tr>
    </table>
  </div>
`;

  useEffect(() => {
    if (!isOrgAdmin && userDetails?.userType !== "globalRoles") {
      setSelectedLocation([
        {
          id: userDetails?.location?.id,
          locationName: userDetails?.location?.locationName,
        },
      ]);
    } else if (userDetails?.userType === "globalRoles") {
      console.log("inside else if", userDetails?.additionalUnits[0]);
      if (userDetails?.additionalUnits?.includes("All")) {
        // setSelectedLocation([
        //   {
        //     id: locationNames[0].id,
        //     locationName: locationNames[0].locationName,
        //   },
        // ]);
      } else {
        setSelectedLocation([
          {
            id: userDetails?.additionalUnits[0]?.id,
            locationName: userDetails?.additionalUnits[0]?.locationName,
          },
        ]);
      }
    } else {
      setSelectedLocation([{ id: "All", locationName: "All" }]);
    }

    getyear();
    getAuditType();
    getAuditType();
    fetchFilterList();
    getAllLocations();
    getLocationNames();
    getAllSystemTypes(realmName);
    getAuditors(realmName);
    fetchNcGraphData();
    fetchNcAgeAnalysisGraphData();
    fetchStackedBarChartData();
    getLogo();
  }, []);
  useEffect(() => {
    if (rerender) {
      // setPage(1)
      setOpenAudit(false);
      setRerender(false);

      if (!isAdmin) {
        getyear();
        if (currentYear) {
          getTableData();
        }
        resetAuditee();
        resetSummary();
        resetObservation();
        // getUserDataBasedOnLocation(userId);
        setIsLoading(true);
      } else {
        setRerender(false);
        getyear();
        if (currentYear) {
          getTableData();
        }
      }
    }
  }, [!rerender]);

  useEffect(() => {
    if (isFirstRender.current) {
      // Skip the first render
      isFirstRender.current = false;
      return;
    }
    handlePagination(1, rowsPerPage);
  }, [
    isFilterType,
    !isFilterAudit,
    !isFilterAuditee,
    !isFilterAuditor,
    !isFilterStatus,
    !isFilterDept,
    !isFilterSystem,
  ]);

  useEffect(() => {
    if (!!currentYear && selectedLocation.length !== 0) {
      // setOpenAudit(false);

      getTableData();
    }
  }, [currentYear, selectedLocation, openAudit, myDept, selectedAuditType]);

  useEffect(() => {
    if (modalData?.refresh === true) {
      getTableData();
    }
  }, [modalData]);
  const handleButtonClick = (option: any) => {
    // If the same button is clicked again, deselect it
    if (selectedOption === option) {
      setSelectedOption("");
      // Reset relevant state variables
      setMyDept(false);
      setOpenAudit(false);
    } else {
      // Otherwise, select the button and update state variables accordingly
      setSelectedOption(option);
      if (option === "My Dept/Vertical") {
        setMyDept(true);
        setOpenAudit(false);
      } else if (option === "My Loc") {
        setMyDept(false);
        setOpenAudit(false);
      } else if (option === "My Findings") {
        setOpenAudit(true);
        setPage(1);
        setRowsPerPage(10);
        setNcObsData([]);
      }
    }
  };
  const handleTabChange = (key: any) => {
    setActiveTab(key);
  };
  const handleLinkClick = (record: any) => {
    // navigate(`/audit/ncsummary`);
    console.log("record in handlelinclick", record);
    setDataid(record.id);
    handleActionPoint(record.id);
  };

  const getAuditType = async () => {
    try {
      const allAuditType = { id: "All", auditType: "All" };

      const res = await axios.get(`/api/audit-settings/getAllAuditTypes`);

      setAuditTypes([allAuditType, ...res.data]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFilterList = (value: any) => {
    const filteredAuditList: any = filterList?.audit?.filter((item: any) =>
      item.name.toLowerCase().includes(value.toLowerCase())
    );
    setAuditNameList(filteredAuditList);
  };
  const fetchFilterList = async () => {
    try {
      const response = await axios.get(`/api/audits/nc/getFilterList`);
      setFilterList(response.data);
      setAuditNameList(response.data.audit);
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleClickPdfOpen = async (val: any) => {
    const result = await axios.get(`/api/audits/nc/${val.id}`);
    const plannedCorrectionDate = result?.data?.correctiveAction?.targetDate
      ? new Date(result?.data?.correctiveAction?.targetDate).toLocaleDateString(
          "en-GB"
        )
      : "";
    const plannedCorrectiveActionDate = result?.data?.correctiveAction?.date
      ? new Date(result?.data?.correctiveAction?.date).toLocaleDateString(
          "en-GB"
        )
      : "";
    const actualCorrectionDate = result?.data?.correctiveAction
      ?.actualTargetDate
      ? new Date(
          result?.data?.correctiveAction?.actualTargetDate
        ).toLocaleDateString("en-GB")
      : "";
    const actualCorrectiveActionDate = result?.data?.correctiveAction
      ?.actualDate
      ? new Date(result?.data?.correctiveAction?.actualDate).toLocaleDateString(
          "en-GB"
        )
      : "";
    const fillTemplate = reportHtmlFormatG
      .replace(
        "%AUDITORS%",
        val?.auditor?.map((item: any) => item.name).join(", ") ?? "-"
      )
      .replace(
        "%AUDITEE%",
        val?.auditees?.map((item: any) => item.name).join(", ") ?? "-"
      )
      .replace("%LOCATION%", result?.data?.audit?.location?.locationName ?? "-")
      .replace("%ENTITY%", val?.entity ?? "-")
      .replace("%AUDITNAME%", val?.auditName ?? "-")
      .replace("%AUDITNUMBER%", result?.data?.audit?.auditNumber ?? "-")
      .replace("%FINDINGDATE%", val?.ncDate ?? "-")
      .replace("%STATUS%", val?.status ?? "-")
      .replace("%FINDING%", val?.auditFindings?.findingType ?? "-")
      .replace(
        "%CLAUSE_NUMBER%",
        val?.clauseNo +
          " " +
          (val?.systemName?.map((item: any) => item.name).join(", ") ?? "-")
      )
      .replace("%DETAILS_OF_FINDING%", val?.comment ?? "-")
      .replace(
        "%ROOT_CAUSE_ANALYSIS%",
        result?.data?.correctiveAction?.whyAnalysis ?? "-"
      )
      .replace(
        "%PLANNED_CORRECTION%",
        result?.data?.correctiveAction?.correction ?? "-"
      )
      .replace("%PLANNED_CORRECTION_TARGET_DATE%", plannedCorrectionDate ?? "-")
      .replace(
        "%PLANNED_CORRECTIVE_ACTION%",
        result?.data?.correctiveAction?.comment ?? "-"
      )
      .replace(
        "%PLANNED_CORRECTIVE_ACTION_TARGET_DATE%",
        plannedCorrectiveActionDate ?? "-"
      )
      .replace(
        "%ACTUAL_CORRECTION%",
        result?.data?.correctiveAction?.actualCorrection ?? "-"
      )
      .replace("%ACTUAL_CORRECTION_TARGET_DATE%", actualCorrectionDate ?? "-")
      .replace(
        "%ACTUAL_CORRECTIVE_ACTION%",
        result?.data?.correctiveAction?.actualComment ?? "-"
      )
      .replace(
        "%ACTUAL_CORRECTIVE_ACTION_TARGET_DATE%",
        actualCorrectiveActionDate ?? "-"
      );
    printJS({
      type: "raw-html",
      printable: fillTemplate,
    });
  };

  const ncObsColumns = [
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (ncObsId: any, record: any, index: any) => {
        if (index === 0) {
          return (
            <>
              <div
                style={{
                  display: "flex", // Ensures children are placed in a row
                  alignItems: "left", // Vertically aligns items in the center
                  gap: "10px", // Adds spacing between items
                  color: "#636363",
                }}
              >
                <div
                  style={{
                    paddingRight: "10px",
                    color: "#636363",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    handleClickPdfOpen(record);
                  }}
                >
                  <MdOutlinePictureAsPdf
                    style={{
                      color: "rgba(0, 0, 0, 0.6)",
                      width: "20px",
                      height: "18px",
                    }}
                  />
                </div>
                <Link
                  to={record.ncObsId.props.to}
                  className="makeStyles-link-216"
                  ref={refelemetForFindings5}
                >
                  {record.type}
                </Link>
              </div>
            </>
          );
        }
        return (
          <>
            <div
              style={{
                display: "flex", // Ensures children are placed in a row
                alignItems: "left", // Vertically aligns items in the center
                gap: "10px", // Adds spacing between items
                color: "#636363",
              }}
            >
              <div
                style={{
                  paddingRight: "10px",
                  color: "#636363",
                }}
                onClick={() => {
                  handleClickPdfOpen(record);
                }}
              >
                <MdOutlinePictureAsPdf
                  style={{
                    color: "rgba(0, 0, 0, 0.6)",
                    width: "20px",
                    height: "18px",
                    cursor: "pointer",
                  }}
                />
              </div>
              <Link
                to={record.ncObsId.props.to}
                className="makeStyles-link-216"
              >
                {record.type}
              </Link>
            </div>
          </>
        );
      },

      filterIcon: (filtered: any) =>
        isFilterType ? (
          <AiFillFilter style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <AiOutlineFilter style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }: any) => {
        return (
          <div style={{ padding: 8, overflowY: "scroll", height: "300px" }}>
            {filterList?.typeData?.map((name: any) => (
              <div key={name}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setselectedType([...selectedType, value]);
                      } else {
                        setselectedType(
                          selectedType.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={name}
                    checked={selectedType.includes(name)} // Check if the checkbox should be checked
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "5px",
                    }}
                  />
                  {name}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                // type="primary"
                disabled={selectedType.length === 0}
                onClick={() => {
                  setfilterType(!isFilterType);
                }}
                style={{
                  marginRight: 8,
                  backgroundColor: "#E8F3F9",
                  color: "black",
                }}
              >
                Apply
              </Button>
              <Button
                onClick={() => {
                  setselectedType([]);
                  setfilterType(false);
                  confirm();
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        );
      },
    },
    {
      title: "Findings",
      dataIndex: "ncObsId",
      key: "ncObsId",
      // render: (ncObsId: any) => (
      //   <Link to={ncObsId.props.to} className="makeStyles-link-216">
      //     {ncObsId.props.children}
      //   </Link>
      // ),
    },

    {
      title: "Department",
      dataIndex: "entity",
      key: "entity",
      filterIcon: (filtered: any) =>
        selectedDept?.length > 0 ? (
          <AiFillFilter style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <AiOutlineFilter style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }: any) => {
        return (
          <div style={{ padding: 8, overflowY: "scroll" }}>
            {filterList?.deptData?.map((item: any) => (
              <div key={item.id}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setselectedDept([...selectedDept, value]);
                      } else {
                        setselectedDept(
                          selectedDept.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={item.id}
                    checked={selectedDept.includes(item.id)} // Check if the checkbox should be checked
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "5px",
                    }}
                  />
                  {item.entityName}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                // type="primary"
                disabled={selectedDept.length === 0}
                onClick={() => {
                  setfilterDept(!isFilterDept);
                }}
                style={{
                  marginRight: 8,
                  backgroundColor: "#E8F3F9",
                  color: "black",
                }}
              >
                Apply
              </Button>
              <Button
                onClick={() => {
                  setselectedDept([]);
                  setfilterDept(!isFilterDept);
                  confirm();
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        );
      },
    },
    {
      title: "Audit Name",
      dataIndex: "auditName",
      key: "auditName",
      filterIcon: (filtered: any) =>
        selectedAudit?.length > 0 ? (
          <AiFillFilter style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <AiOutlineFilter style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }: any) => {
        return (
          <div
            style={{
              padding: 8,
              overflowY: "scroll",
              height: "300px",
              width: "300px",
            }}
          >
            {/* Search input */}
            <Input
              placeholder="Search Audit Name"
              onChange={(e) => handleFilterList(e.target.value)}
              style={{ marginBottom: 8 }}
            />

            {/* Checkbox selection */}
            {auditNameList?.map((item: any) => (
              <div key={item.name}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setselectedAudit([...selectedAudit, value]);
                      } else {
                        setselectedAudit(
                          selectedAudit.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={item.id}
                    checked={selectedAudit.includes(item.id)}
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "5px",
                    }}
                  />
                  {item.name}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              {/* Apply and Reset buttons */}
              <Button
                // type="primary"
                disabled={selectedAudit.length === 0}
                onClick={() => {
                  setfilterAudit(!isFilterAudit);
                }}
                style={{
                  marginRight: 8,
                  backgroundColor: "#E8F3F9",
                  color: "black",
                }}
              >
                Apply
              </Button>
              <Button
                onClick={() => {
                  setselectedAudit([]);
                  setfilterAudit(!isFilterAudit);
                  confirm();
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        );
      },
    },
    {
      title: "System",
      dataIndex: "systemName",
      key: "systemName",
      render: (system: any) => <MultiUserDisplay data={system} name="name" />,
      filterIcon: (filtered: any) =>
        selectedSystem?.length > 0 ? (
          <AiFillFilter style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <AiOutlineFilter style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }: any) => {
        return (
          <div style={{ padding: 8, overflowY: "scroll" }}>
            {filterList?.system?.map((item: any) => (
              <div key={item.name}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setselectedSystem([...selectedSystem, value]);
                      } else {
                        setselectedSystem(
                          selectedSystem.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={item._id}
                    checked={selectedSystem.includes(item._id)} // Check if the checkbox should be checked
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "5px",
                    }}
                  />
                  {item.name}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                // type="primary"
                // disabled={selectedStatus.length === 0}
                onClick={() => {
                  setfilterSystem(!isFilterSystem);
                }}
                style={{
                  marginRight: 8,
                  backgroundColor: "#E8F3F9",
                  color: "black",
                }}
              >
                Apply
              </Button>
              <Button
                onClick={() => {
                  setselectedSystem([]);
                  setfilterSystem(!isFilterSystem);
                  confirm();
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        );
      },
    },
    {
      title: "Clause",
      dataIndex: "clauseNo",
      key: "clauseNo",
    },
    // {
    //   title: "Severity",
    //   dataIndex: "severity",
    //   key: "severity",
    //   render: (severity: any) => (
    //     <span className="makeStyles-red__exclamation-217">{severity}</span>
    //   ),
    // },
    // {
    //   title: "Status",
    //   dataIndex: "status",
    //   key: "status",
    //   // render: (status: any) => <span>{status.props.status}</span>,
    // },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (_: any, record: any) => {
        if (record.status === "OPEN") {
          return (
            <Tag
              style={{ backgroundColor: "#c9e4de", color: "black" }}
              key={record.status}
            >
              {record.status}
            </Tag>
          );
        } else if (record.status === "ACCEPTED") {
          return (
            <Tag
              style={{ backgroundColor: "#c6def1", color: "black" }}
              key={record.status}
            >
              {record.status}
            </Tag>
          );
        } else if (record.status === "REJECTED") {
          return (
            <Tag
              style={{ backgroundColor: "#edcad1", color: "black" }}
              key={record.status}
            >
              {record.status}
            </Tag>
          );
        } else if (record.status === "VERIFIED") {
          return (
            <Tag
              style={{ backgroundColor: "#dbcdf0", color: "black" }}
              key={record.status}
            >
              {record.status}
            </Tag>
          );
        } else if (record.status === "CLOSED") {
          return (
            <Tag
              style={{ backgroundColor: "#f2c6de", color: "black" }}
              key={record.status}
            >
              {record.status}
            </Tag>
          );
        } else if (record.status === "AUDITORREVIEW") {
          return (
            <Tag
              // color="#b1d1ef"
              style={{ backgroundColor: "#b1d1ef", color: "black" }}
              key={record.status}
            >
              {record.status}
            </Tag>
          );
        } else if (record.status === "IN_PROGRESS") {
          return (
            <Tag
              // color="#b1d1ef"
              style={{ backgroundColor: "#96EFFF", color: "black" }}
              key={record.status}
            >
              {record.status}
            </Tag>
          );
        } else if (record?.status === "NA") {
          return `N/A`;
        } else return record.status;
      },
      filterIcon: (filtered: any) =>
        selectedStatus?.length > 0 ? (
          <AiFillFilter style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <AiOutlineFilter style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }: any) => {
        return (
          <div style={{ padding: 8, overflowY: "scroll" }}>
            {filterList?.statusData?.map((item: any) => (
              <div key={item}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setSelectedStatus([...selectedStatus, value]);
                      } else {
                        setSelectedStatus(
                          selectedStatus.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={item}
                    checked={selectedStatus.includes(item)} // Check if the checkbox should be checked
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "5px",
                    }}
                  />
                  {item}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                // type="primary"
                disabled={selectedStatus.length === 0}
                onClick={() => {
                  setfilterStatus(!isFilterStatus);
                }}
                style={{
                  marginRight: 8,
                  backgroundColor: "#E8F3F9",
                  color: "black",
                }}
              >
                Apply
              </Button>
              <Button
                onClick={() => {
                  setSelectedStatus([]);
                  setfilterStatus(!isFilterStatus);
                  confirm();
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        );
      },
    },
    {
      title: "Pending With",
      dataIndex: "currentlyUnder",
      key: "currentlyUnder",
      render: (name: any, record: any) =>
        record?.status === "NA" ? "N/A" : newRoles[name],
    },
    {
      title: "Auditor",
      dataIndex: "auditor",
      key: "auditor",
      render: (auditor: any) => <MultiUserDisplay data={auditor} name="name" />,
      filterIcon: (filtered: any) =>
        selectedAuditor?.length > 0 ? (
          <AiFillFilter style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <AiOutlineFilter style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }: any) => {
        return (
          <div style={{ padding: 8, overflowY: "scroll", height: "300px" }}>
            {filterList?.auditor?.map((item: any) => (
              <div key={item.id}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setselectedAuditor([...selectedAuditor, value]);
                      } else {
                        setselectedAuditor(
                          selectedAuditor.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={item.id}
                    checked={selectedAuditor.includes(item.id)} // Check if the checkbox should be checked
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "5px",
                    }}
                  />
                  {item.username}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                // type="primary"
                disabled={selectedAuditor.length === 0}
                onClick={() => {
                  setfilterAuditor(!isFilterAuditor);
                }}
                style={{
                  marginRight: 8,
                  backgroundColor: "#E8F3F9",
                  color: "black",
                }}
              >
                Apply
              </Button>
              <Button
                onClick={() => {
                  setselectedAuditor([]);
                  setfilterAuditor(!isFilterAuditor);
                  confirm();
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        );
      },
    },
    {
      title: "Auditee",
      dataIndex: "auditees",
      key: "auditees",
      render: (auditees: any) => (
        <MultiUserDisplay data={auditees} name="name" />
      ),
      filterIcon: (filtered: any) =>
        selectedAuditee?.length > 0 ? (
          <AiFillFilter style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <AiOutlineFilter style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }: any) => {
        return (
          <div style={{ padding: 8, overflowY: "scroll", height: "300px" }}>
            {filterList?.auditee?.map((item: any) => (
              <div key={item.id}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setselectedAuditee([...selectedAuditee, value]);
                      } else {
                        setselectedAuditee(
                          selectedAuditee.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={item.id}
                    checked={selectedAuditee.includes(item.id)} // Check if the checkbox should be checked
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "5px",
                    }}
                  />
                  {item.username}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                // type="primary"
                disabled={selectedAuditee.length === 0}
                onClick={() => {
                  setfilterAuditee(!isFilterAuditee);
                }}
                style={{
                  marginRight: 8,
                  backgroundColor: "#E8F3F9",
                  color: "black",
                }}
              >
                Apply
              </Button>
              <Button
                onClick={() => {
                  setselectedAuditee([]);
                  setfilterAuditee(!isFilterAuditee);
                  confirm();
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        );
      },
    },
    {
      title: "Date",
      dataIndex: "ncDate",
      key: "ncDate",
    },
    {
      title: "Action",
      render: (_: any, data: any) => {
        console.log("data00", data);
        {
          return (
            <>
              {data.access && (
                <IconButton
                  onClick={() => {
                    // setId(data.id);
                    setModalData({ ...modalData, data: data, open: true });
                    setOpenDrawer(true);
                  }}
                  style={{ padding: "10px" }}
                >
                  <CustomEditICon width={20} height={20} />
                </IconButton>
              )}

              {data?.deleteAccess && (
                <IconButton
                  onClick={() => {
                    // setId(data.id);deleteNc(nc._id)
                    deleteNc(data?.id)
                      .then((response: any) => {
                        setIsLoading(true);
                        enqueueSnackbar("Deleted nc entry successfully!", {
                          variant: "success",
                        });
                        setIsLoading(false);
                        getTableData();
                      })
                      .catch((error: any) => {
                        console.log("error");
                        enqueueSnackbar("Something went wrong!", {
                          variant: "error",
                        });
                      });
                  }}
                  style={{ padding: "10px" }}
                >
                  <CustomDeleteICon width={20} height={20} />
                </IconButton>
              )}

              {/* {(data?.isUserInAuditedEntity || data?.isUserAuditee) && (
                <IconButton
                  onClick={() => {
                    // setId(data.id);
                    setDataid(data._id);
                    setOpenActionPointDrawer({
                      open: true,
                      edit: false,
                      data: {},
                    });
                    handleCloseMenu();
                  }}
                  style={{ padding: "10px" }}
                >
                  <AddCircleOutlineIcon width={20} height={20} />
                </IconButton>
              )} */}
            </>
          );
        }
      },
    },
  ];

  const subColumns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (_: any, record: any) => {
        console.log("record in nc", record);
        return (
          <div
            style={{
              textDecorationLine: "underline",
              cursor: "pointer",
            }}
          >
            <div onClick={() => handleLinkClick(record)}>{record.title}</div>
          </div>
        );
      },
    },
    {
      title: "NC Number",
      dataIndex: "ncNumber",
      key: "ncNumber",
    },
    {
      title: "Department",
      dataIndex: "entity",
      key: "entity",
    },
    {
      title: "Assignee",
      dataIndex: "assignee",
      key: "assignee",
      render: (assignee: any) => (
        <span>{assignee.map((user: any) => user.username).join(", ")}</span>
      ),
    },
    {
      title: "Comments",
      dataIndex: "comments",
      key: "comments",
    },
  ];

  const [auditorData, setAuditorData] = React.useState({
    date: "",
    comment: "",
    verficationDate: "",
    verficationAction: "",
  });

  const [openActionPointDrawer, setOpenActionPointDrawer] = useState({
    open: false,
    edit: false,
    data: {},
  });

  const [ncPieCharData, setNcPieChartData] = useState<any>({
    labels: [],
    datasets: [],
  });

  const [ncAgeAnalysisChartData, setNcAgeAnalysisChartData] = useState<any>({
    labels: [],
    datasets: [],
  });
  const [ncStackBartChartData, setNcStackBarChartData] = useState<any>({
    labels: [],
    datasets: [
      {
        label: "NC Open",
        data: [],
        backgroundColor: "#0585FC",
        stack: "NC",
      },
      {
        label: "NC Closed",
        data: [],
        backgroundColor: "#F2BB00",
        stack: "NC",
      },
      {
        label: "OFI Open",
        data: [],
        backgroundColor: "#7cbf3f",
        stack: "OFI",
      },
      {
        label: "OFI Closed",
        data: [],
        backgroundColor: "#f28e2b",
        stack: "OFI",
      },
    ],
  });

  const userDetails = getSessionStorage();
  const orgId = sessionStorage.getItem("orgId");

  const allOption = { id: "All", locationName: "All" };

  const handleChangeList = (event: any, values: any) => {
    setPage(1);
    if (values.find((option: any) => option.id === "All")) {
      setSelectedLocation([allOption]);
    } else {
      setSelectedLocation(values.filter((option: any) => option.id !== "All"));
    }
  };

  const fetchNcGraphData = async () => {
    try {
      const response: any = await getNcGraphData(
        orgId as any,
        filterFields.NC_OBS_TYPE,
        userDetails?.location?.id,
        "",
        "",
        "",
        "",
        "",
        ""
      );
      setNcPieChartData({
        labels: response?.data?.labels,
        datasets: response?.data?.dataset,
      });
    } catch (error) {
      console.log("error in fetching nc graph data - ", error);
    }
  };
  const encodedLocation = encodeURIComponent(JSON.stringify(selectedLocation));
  const fetchNcAgeAnalysisGraphData = async () => {
    try {
      const response: any = await getNcGraphData(
        orgId as any,
        filterFields.NC_AGE_ANALYSIS,
        userDetails?.location?.id,
        "",
        "",
        "",
        "",
        "",
        ""
      );
      if (response.status === 200 || response.status === 201) {
        setNcAgeAnalysisChartData(response.data);
      }
    } catch (error) {}
  };

  const fetchStackedBarChartData = async () => {
    try {
      console.log("check locaion", userDetails?.location);

      const response: any = await getNcGraphData(
        orgId as any,
        "stackBarChart",
        userDetails?.location?.id,
        "",
        "",
        "",
        "",
        "",
        ""
      );
      if (response.status === 200 || response.status === 201) {
        setNcStackBarChartData(response.data);
      }
    } catch (error) {}
  };

  const handleActionPoint = (id: any) => {
    setOpenActionPointDrawer({
      open: true,
      edit: true,
      data: { id: id },
    });
    {
      openActionPointDrawer.open && (
        <ActionPoint
          openActionPointDrawer={openActionPointDrawer}
          setOpenActionPointDrawer={setOpenActionPointDrawer}
          getActionPointData={getActionPointData}
          dataid={dataid}
        />
      );
    }
    handleCloseMenu();
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const getLocationNames = async () => {
    setIsLoading(true);
    try {
      setIsLoading(true);
      const res = await axios.get(
        `api/location/getLocationsForOrg/${realmName}`
      );

      setLocationNames(res.data);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
    data: any
  ) => {
    setAnchorEl(event.currentTarget);
    // setSelectedData({ ...data })
  };

  const isLocAdmin = checkRole("LOCATION-ADMIN");

  /**
   * @method toggleLink
   * @description Function to create a link for enabling the redirection feature upon button click on a table entry
   * @param type {ncSummaryObservationType}
   * @param linkId {string}
   * @param id {string}
   * @returns a link which is used to redirect the user
   */

  const toggleLink = (
    type: ncSummaryObservationType,
    linkId: string,
    id: string
  ) => {
    // if (type === "NC") {
    return (
      <Link to={`/audit/nc/${linkId}`} className={classes.link}>
        {id}
      </Link>
    );
    // }
    // return (
    //   <Link to={`/audit/obs/${linkId}`} className={classes.link}>
    //     {id}
    //   </Link>
    // );
  };

  /**
   * @method dataParser
   * @description Function to parse data and display it inside the table
   * @param data {any}
   * @returns the parsed table data
   */

  const handleClickDiscard = () => {
    getyear();
    setIsLoading(true);
    setsearchQuery({
      ...searchQuery,
      searchQuery: "",
    });
    getNcSummary(
      currentYear,
      myDept,
      page,
      rowsPerPage,
      "",
      selectedAuditType?.id,
      "",
      "",
      "",
      "",
      "",
      ""
    )
      .then((response: any) => {
        const parsedData = dataParser(response?.data?.nc);
        setCount(response?.data?.count);
        setPage(1);

        setNcObsData(parsedData);
        setIsLoading(false);
      })
      .catch((error) => {
        enqueueSnackbar(error.message, {
          variant: "error",
        });
        setIsLoading(false);
      });
  };

  const dataParser: any = (data: any) => {
    return data?.map((nc: any) => {
      const isUserAuditee = nc.auditees.some(
        (auditee: any) => auditee.id === userInfo?.id
      );
      const isUserInAuditedEntity = nc?.auditedEntityNew?.users?.some(
        (user: any) => user?.id === userInfo?.id
      );

      const auditors = nc?.auditors?.map((auditor: any) => ({
        name: auditor.firstname + " " + auditor.lastname,
      }));

      const auditees = nc?.auditees?.map((auditee: any) => ({
        name: auditee.firstname + " " + auditee.lastname,
      }));
      return {
        ncObsId: toggleLink(nc.type, nc._id, nc.id),
        id: nc._id,
        comment: nc.comment ?? "-",
        type: nc.type,
        entity: nc?.auditedEntityNew?.entityName,
        deleteAccess: nc?.deleteAccess,
        // ncDate: (
        //   <TableStatusAction
        //     status={moment(nc.createdAt).format("DD-MM-YYYY")}
        //     // handleEdit={() => {
        //     //   if (nc.type === "NC" || nc.type === "OFI") {
        //     //     navigate(`/audit/nc/${nc._id}`, { state: { edit: true } });
        //     //   } else {
        //     //     navigate(`/audit/obs/${nc._id}`, { state: { edit: true } });
        //     //   }
        //     // }}
        //     // Conditionally pass handleActionPoint prop
        //     {...(isUserAuditee || isUserInAuditedEntity
        //       ? {
        //           handleActionPoint: () => {
        //             setDataid(nc._id);
        //             setOpenActionPointDrawer({
        //               open: true,
        //               edit: false,
        //               data: {},
        //             });
        //             handleCloseMenu();
        //           },
        //         }
        //       : {})}
        //     handleDelete={() => {
        //       deleteNc(nc._id)
        //         .then((response: any) => {
        //           setIsLoading(true);
        //           enqueueSnackbar("Deleted nc entry successfully!", {
        //             variant: "success",
        //           });
        //           setIsLoading(false);
        //           getTableData();
        //         })
        //         .catch((error: any) => {
        //           console.log("error");
        //           enqueueSnackbar("Something went wrong!", {
        //             variant: "error",
        //           });
        //         });
        //     }}
        //     updateNc={() => {
        //       if (
        //         nc.auditFindings?.accept === true ||
        //         nc.auditFindings?.auditorVerification === true ||
        //         nc.auditFindings?.closureBy !== "None"
        //       ) {
        //         setModalId(nc._id);
        //         setUpdateModalVisible(true);
        //         return true;
        //       } else {
        //         setUpdateModalVisible(false);
        //         return false;
        //       }
        //     }}
        //     showType={
        //       nc.auditFindings?.accept === true ||
        //       nc.auditFindings?.auditorVerification === true ||
        //       nc.auditFindings?.closureBy !== "None"
        //         ? true
        //         : false
        //     }
        //     type={nc?.type}
        //     enableDelete={isMR || isLocAdmin}
        //     access={nc.access}
        //   />
        // ),
        auditName: nc?.audit?.auditName || "",
        clauseNo: nc?.clause[0]?.clauseNumber ?? "-",
        severity:
          nc.severity === "Major" ? (
            <>
              Major&nbsp;<span className={classes.red__exclamation}>!</span>
            </>
          ) : (
            nc.severity
          ),
        systemName: nc?.system,
        // auditor: nc?.audit?.auditors[0]?.email,
        auditor: auditors,
        auditees: auditees,
        status: nc.status,
        access: nc.access,
        auditFindings: nc.auditFindings,
        isUserInAuditedEntity,
        isUserAuditee,
        ncDate: moment(nc.date).format("DD-MM-YYYY"),
        currentlyUnder: nc?.currentlyUnder || "",
      };
    });
  };

  /**
   * @method sortTable
   * @description Function to sort table entries when the sort icon is clicked
   * @param field {string}
   * @param order {string}
   * @returns nothing
   */
  // const sortTable = (field: string, order: string) => {
  //   getyear();
  //   getNcSummary(
  //     currentYear,
  //     page,
  //     rowsPerPage,
  //     searchValue.location,
  //     searchValue.auditType,
  //     searchValue.auditor,
  //     searchValue.systemType,
  //     searchValue.from,
  //     searchValue.to,
  //     searchValue.clause,
  //     `${field}:${order}`
  //   )
  //     .then((response: any) => {
  //       const parsedData = dataParser(response?.data?.nc);
  //       setNcObsData(parsedData);
  //       setIsLoading(false);
  //       setCount(response?.data?.count);
  //     })
  //     .catch((error) => {
  //       console.log("error message - ", error);
  //       enqueueSnackbar(error.message, {
  //         variant: "error",
  //       });
  //     });
  // };
  const getyear = async () => {
    const currentyear = await getYearFormat(new Date().getFullYear());
    setCurrentYear(currentyear);
  };

  /**
   * @method getTableData
   * @description Function to fetch table entries from the backend
   * @param locationId {string}
   * @returns nothing
   */
  const getTableData = (locationId: string = "", type: string = "") => {
    const loc: any = locationId === "" ? searchValue.location : locationId;

    if (!openAudit) {
      getNcSummary(
        currentYear,
        myDept,
        page,
        rowsPerPage,
        encodedLocation,
        selectedAuditType?.id,
        searchValue.auditor,
        searchValue.systemType,
        searchValue.from,
        searchValue.to,
        searchValue.clause,
        "",
        type
      )
        .then((response: any) => {
          const parsedData = dataParser(response?.data?.nc);
          console.log("check parsed data in List of Findings-->", parsedData);

          setPage(page);
          setNcObsData(parsedData);
          setIsLoading(false);
          setCount(response?.data?.count);
        })
        .catch((error) => {
          console.log("error message - ", error);
          enqueueSnackbar(error.message, {
            variant: "error",
          });
        });
    } else {
      getMyNcSummary(
        currentYear,
        page,
        rowsPerPage,
        encodedLocation,
        selectedAuditType?.id,
        searchValue.auditor,
        searchValue.systemType,
        searchValue.from,
        searchValue.to,
        searchValue.clause,
        "",
        type
      )
        .then((response: any) => {
          const parsedData = dataParser(response?.data?.nc);
          console.log("check parsed data in List of Findings-->", parsedData);

          setPage(page);
          setNcObsData(parsedData);
          setIsLoading(false);
          setCount(response?.data?.count);
        })
        .catch((error) => {
          console.log("error message - ", error);
          enqueueSnackbar(error.message, {
            variant: "error",
          });
        });
    }
  };

  const getActionPointData = async () => {
    try {
      const res = await axios.get("/api/audits/getAllNcAp");

      const data = res.data.map((item: any) => {
        const isUserAssignee = item.assignee.some(
          (item: any) => item.id === userInfo?.id
        );

        return {
          id: item.id,
          ncId: item.ncId,
          ncDate: item.ncDate,
          ncNumber: item.ncNumber,
          createdBy: item.createdBy,
          title: item.title,
          organizationId: item.organizationId,
          description: item.description,
          comments: item.comments,
          createdAt: item.createdAt,
          assignee: item.assignee,
          entity: item.entity,
          status: isUserAssignee ? (
            <TableStatusAction
              status={item.status}
              type={item.type}
              handleEdit={() => {
                setDataid(item?.id);
                setOpenActionPointDrawer({
                  open: true,
                  edit: true,
                  data: {},
                });
                handleCloseMenu();
              }}
              handleDelete={async () => {
                try {
                  await axios.delete(
                    `/api/audits/deleteNcActionPointByID/${item.id}`
                  );
                  enqueueSnackbar("Deleted nc action point successfully!", {
                    variant: "success",
                  });
                  // getTableData();
                  getActionPointData();
                } catch (error) {
                  console.error(error);
                  enqueueSnackbar("Something went wrong!", {
                    variant: "error",
                  });
                }
              }}
            />
          ) : (
            item.status
          ),
        };
      });

      setActionPointData(data);
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Error fetching data!", {
        variant: "error",
      });
    }
  };

  const handleTableSearch = async () => {
    setCount(0);
    getyear();
    const userInfo = await axios.get("/api/user/getUserInfo");

    const { organizationId: organization } = userInfo?.data;
    ncTableSearch(searchQuery?.searchQuery, organization, page, rowsPerPage)
      .then((response: any) => {
        const parsedData = dataParser(response?.data?.nc);
        setPage(page);
        setNcObsData(parsedData);
        setIsLoading(false);
        setCount(response?.data?.count);
      })
      .catch((error: any) => {
        console.log("error response - ", error);
        setIsLoading(false);
      });
  };
  /**
   * @method parseLocation
   * @description Function to print system types
   * @param data {any}
   * @returns an array of system types
   */
  const parseLocation = (data: any) => {
    const systemTypes: any = [];
    data?.map((item: any) => {
      systemTypes.push({
        name: item?.locationName,
        value: item?.id,
      });
    });
    return systemTypes;
  };

  /**
   * @method parseSystemType
   * @description Function to parse audit type for listing it out on the typeahead filter
   * @param data {any}
   * @returns nothing
   */
  const parseSystemType = (data: any) => {
    const auditTypes: any = [];
    data?.map((item: any) => {
      auditTypes.push({
        name: item?.name,
        value: item?.id,
      });
    });
    return auditTypes;
  };

  /**
   * @method parseAuditors
   * @description Function to parse auditors for listing it out on the typeahead filter
   * @param data {any}
   * @returns nothing
   */
  const parseAuditors = (data: any) => {
    const auditors: any = [];
    data?.map((item: any) => {
      auditors.push({
        name: `${item?.firstname} ${item?.lastname}`,
        value: item?.id,
      });
    });
    return auditors;
  };

  /**
   * @method parseSubSystemTypes
   * @description Function to parse system types for listing it out on the typeahead filter
   * @param data {any}
   * @returns nothing
   */
  const parseSubSystemTypes = (data: any) => {
    const systemTypes: any = [];
    data?.map((item: any) => {
      systemTypes.push({
        name: item?.name,
        value: item?._id,
      });
    });
    return systemTypes;
  };

  const handleSearchChange = (e: any) => {
    // e.preventDefault();
    // setsearchQuery({
    //   ...searchQuery,
    //   [e.target.name]: e.target.value,
    // });
  };
  /**
   * @method parseClauses
   * @description Function to parse clauses when a sub system type is selected
   * @param data {any}
   * @returns nothing
   */
  const parseClauses = (data: any) => {
    const clauseList: any = [];
    data?.map((item: any) => {
      clauseList.push({
        name: item?.number,
        value: item?._id,
      });
    });
    return clauseList;
  };

  /**
   * @method getAllLocation
   * @description Function to fetch all location entries for listing them out on the location filter
   * @returns nothing
   */
  const getAllLocations = () => {
    getAllLocation(realmName).then((response: any) => {
      setLocationListing(parseLocation(response?.data));
    });
  };

  /**
   * @method getAllSystemTypes
   * @description Function to fetch all system types
   * @param realm {string}
   * @returns nothing
   */
  const getAllSystemTypes = (realm: string) => {
    getSystemTypes(realmName)
      .then((response: any) => {
        setSystemListing(parseSystemType(response?.data));
      })
      .catch((error: any) => console.log("error response - ", error));
  };

  /**
   * @method getAuditors
   * @description Function to get all auditors
   * @param realm {string}
   * @returns nothing
   */
  const getAuditors = (realm: string) => {
    getAllAuditors(realm).then((response: any) => {
      setAuditorListing(parseAuditors(response?.data));
    });
  };

  /**
   * @method getClauses
   * @description Function to fetch all clauses when a system type is selected
   * @param id {string}
   * @returns nothing
   */
  const getClauses = (id: string) => {
    getAllClauses(id).then((response: any) => {
      setClauses(parseClauses(response?.data?.clauses));
    });
  };

  /**
   * @method getAllSubSystemTypes
   * @description Function to fetch all sub system types
   * @param id {string}
   * @returns nothing
   */
  const getAllSubSystemTypes = (id: string) => {
    getSystems(id).then((response: any) => {
      setSubSystemListing(parseSubSystemTypes(response?.data));
    });
  };

  /**
   * @method handleDateChange
   * @description Function to handle data changes when the date field changes
   * @param e any
   * @returns nothing
   */
  const handleDateChange = (e: any) => {
    if (e.target.name === "documentStartDate") {
      setSearchValue({
        ...searchValue,
        from: new Date(`${e.target.value}`).toISOString(),
      });
    } else {
      setSearchValue({
        ...searchValue,
        to: new Date(`${e.target.value}`).toISOString(),
      });
    }
  };

  /**
   * @method handleApply
   * @description Function to apply filters and refetch table data according to that
   * @returns nothing
   */
  const handleApply = () => {
    setIsLoading(true);
    getyear();
    getNcSummary(
      currentYear,
      myDept,
      page,
      rowsPerPage,
      encodedLocation,
      selectedAuditType?.id,
      searchValue.auditType,
      searchValue.auditor,
      searchValue.systemType,
      searchValue.from,
      searchValue.to,
      searchValue.clause
    )
      .then((response: any) => {
        const parsedData = dataParser(response?.data?.nc);
        setCount(response?.data?.count);
        setPage(page);
        setNcObsData(parsedData);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log("error message - ", error);
        enqueueSnackbar(error.message, {
          variant: "error",
        });
        setIsLoading(false);
      });
  };

  /**
  //  * @method changePage
  //  * @description Function to change the page on the pagination controller
  //  * @param pageNumber {number}
  //  * @returns nothing
  //  */
  // const changePage = (page: any, pageSize: any = rowsPerPage) => {
  //   getyear();
  //   getNcSummary(currentYear, pageSize * (page - 1), pageSize)
  //     .then((response: any) => {
  //       const parsedData = dataParser(response?.data?.nc);
  //       setNcObsData(parsedData);
  //       setIsLoading(false);
  //       setPage(pageNumber);
  //     })
  //     .catch((error) => {
  //       console.log("error message - ", error);
  //       enqueueSnackbar(error.message, {
  //         variant: "error",
  //       });
  //     });
  // };
  const handlePagination = async (
    pageData: any,
    pageSize: any = rowsPerPage
  ) => {
    setNcObsData([]);
    setPage(pageData);
    setRowsPerPage(pageSize);
    let response;
    const columnfilterurl: any = formatDashboardQuery(
      `/api/dashboard`,
      {
        selectedDepartment: selectedDept,
        selectedAuditee: selectedAuditee,
        SelectedAuditor: selectedAuditor,
        selectedAudit: selectedAudit,
        selectedStatus,
        selectedType,
        selectedSystem,
      },
      true
    );

    if (searchQuery.searchQuery !== "") {
      const userInfo = await axios.get("/api/user/getUserInfo");

      const { organizationId: organization } = userInfo?.data;
      ncTableSearch(searchQuery?.searchQuery, organization, pageData, pageSize)
        .then((response: any) => {
          const parsedData = dataParser(response?.data?.nc);
          setCount(response?.data?.count);
          setPage(pageData);
          setNcObsData(parsedData);
          setIsLoading(false);
        })
        .catch((error) => {
          enqueueSnackbar(error.message, {
            variant: "error",
          });
          setIsLoading(false);
        });
    } else {
      if (!openAudit) {
        getNcSummary(
          currentYear,
          myDept,
          pageData,
          pageSize,
          encodedLocation,
          selectedAuditType?.id,
          searchValue.auditor,
          searchValue.systemType,
          searchValue.from,
          searchValue.to,
          searchValue.clause,
          columnfilterurl
        )
          .then((response: any) => {
            const parsedData = dataParser(response?.data?.nc);
            setCount(response?.data?.count);
            setPage(pageData);
            setNcObsData(parsedData);
            setIsLoading(false);
          })
          .catch((error) => {
            console.log("error message - ", error);
            enqueueSnackbar(error.message, {
              variant: "error",
            });
            setIsLoading(false);
          });
      } else {
        getMyNcSummary(
          currentYear,
          // myDept,
          pageData,
          pageSize,
          encodedLocation,
          selectedAuditType?.id,
          searchValue.auditor,
          searchValue.systemType,
          searchValue.from,
          searchValue.to,
          searchValue.clause
        )
          .then((response: any) => {
            const parsedData = dataParser(response?.data?.nc);
            setCount(response?.data?.count);
            setPage(pageData);
            setNcObsData(parsedData);
            setIsLoading(false);
          })
          .catch((error) => {
            console.log("error message - ", error);
            enqueueSnackbar(error.message, {
              variant: "error",
            });
            setIsLoading(false);
          });
      }
    }
    // getNcSummary(
    //   currentYear,
    //   pageSize * (page - 1),
    //   pageSize,
    //   // encodedLocation,
    //   searchValue.auditType,
    //   searchValue.auditor,
    //   searchValue.systemType,
    //   searchValue.from,
    //   searchValue.to,
    //   searchValue.clause,
    //   ""
    //   // type
    // )
    //   .then((response: any) => {
    //     const parsedData = dataParser(response?.data?.nc);
    //     console.log("check parsed data in List of Findings-->", parsedData);

    //     setPage(1);
    //     setNcObsData(parsedData);
    //     setIsLoading(false);
    //     setCount(response?.data?.count);
    //   })
    //   .catch((error) => {
    //     console.log("error message - ", error);
    //     enqueueSnackbar(error.message, {
    //       variant: "error",
    //     });
    //   });
    // getTableData();
  };

  /**
   * @method handleDiscard
   * @description Function to discard all search values from the filters
   * @returns nothing
   */

  const handleDiscard = () => {
    setIsLoading(true);
    getyear();
    setSearchValue({
      location: "",
      auditType: "",
      systemType: "",
      auditor: "",
      from: "",
      to: "",
      clause: "",
    });
    getNcSummary(
      currentYear,
      myDept,
      page,
      rowsPerPage,
      encodedLocation,
      selectedAuditType?.id,
      "",
      "",
      "",
      "",
      "",
      ""
    )
      .then((response: any) => {
        const parsedData = dataParser(response?.data?.nc);
        setCount(response?.data?.count);
        setPage(1);
        setNcObsData(parsedData);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log("error message - ", error);
        enqueueSnackbar(error.message, {
          variant: "error",
        });
        setIsLoading(false);
      });
  };

  /**
   * @method getUserData
   * @description Function to get all user information based on id
   * @returns nothing
   */
  // const getUserDataBasedOnLocation = (id: string) => {
  //   getUserInformation(id)
  //     .then((response: any) => {
  //       setSearchValue({
  //         ...searchValue,
  //         location: response?.data?.locationId,
  //       });
  //       return response?.data?.locationId;
  //     })
  //     .then((locResponse: any) => {
  //       if (!!currentYear) {
  //         getTableData(locResponse ?? "");
  //       }
  //       getActionPointData();
  //     });
  // };

  const expandIcon = ({ expanded, onExpand, record }: any) => {
    const icon = expanded ? <AiOutlineMinusCircle /> : <AiOutlinePlusCircle />;
    const match = actionPointData?.some(
      (ap: any) => ap.ncNumber === record.ncObsId.props.children
    );
    if (match) {
      return <a onClick={(e) => onExpand(record, e)}>{icon}</a>;
    }
    return null;
  };

  const handleChartDataClick = (data: any) => {
    getTableData("", data?.value);
  };

  const responsive = {
    0: { items: 1 },
    1024: { items: 1 },
  };

  const items = [
    <Grid container spacing={2} className={graphClasses.graphSection}>
      <Grid
        item
        xs={12}
        sm={4}
        md={4}
        className={graphClasses.graphGridContainer}
        style={{ paddingLeft: "22px" }}
      >
        <Box className={graphClasses.graphBox}>
          <NcPieChart
            data={ncPieCharData}
            handleChartDataClick={
              () => {}
              // handleChartDataClick
            }
          />
        </Box>
      </Grid>
      <Grid
        item
        xs={12}
        sm={4}
        md={4}
        className={graphClasses.graphGridContainer}
        style={{ paddingLeft: "10px" }}
      >
        <Box className={graphClasses.graphBox}>
          <NcStackedBarChart data={ncStackBartChartData} />
        </Box>
      </Grid>
      <Grid
        item
        xs={12}
        sm={4}
        md={4}
        className={graphClasses.graphGridContainer}
        style={{ paddingLeft: "10px", paddingRight: "10px" }}
      >
        <Box className={graphClasses.graphBox}>
          <NcAgeAnalysisBarChart data={ncAgeAnalysisChartData} />
        </Box>
      </Grid>
    </Grid>,
    <Grid container spacing={2} className={graphClasses.graphSection}>
      <Grid
        item
        xs={12}
        sm={12}
        md={12}
        className={graphClasses.graphGridContainer}
        style={{ paddingRight: "22px" }}
      >
        <Box className={graphClasses.graphBox} style={{ width: "100%" }}>
          <NcAgeAnalysisBarChart data={ncAgeAnalysisChartData} />
        </Box>
      </Grid>
    </Grid>,
  ];

  const handleUpdateModalCancel = () => {
    setUpdateModalVisible(false);
  };

  const [alignment, setAlignment] = useState("left");

  const handleClick = (newAlignment: any) => {
    setAlignment(newAlignment);
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

  return (
    <>
      <Modal
        open={updateModelVisible}
        onClose={handleUpdateModalCancel}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          height="600px !important"
          // overflow="auto" // Enable vertical scrolling
          width="1200px !important"
          mx="auto"
          my={4}
          p={3}
          style={{ backgroundColor: "#ffffff" }}
        >
          <NcSummaryForm
            modalId={modalId}
            setUpdateModelVisible={setUpdateModalVisible}
            setRerender={setRerender}
          />
        </Box>
      </Modal>

      <div className={classes.root}>
        <div className="carousel-container">
          {/* {graphComponent.open && graphComponent.activeTab === "4" && (
            <AliceCarousel
              items={items}
              responsive={responsive}
              controlsStrategy="responsive"
              autoPlay={false}
              autoPlayInterval={2000}
              infinite
              disableDotsControls
              // renderPrevButton={({ isDisabled }) => (
              //   <button disabled={isDisabled} className="cprev-button">
              //     <span
              //       style={
              //         {
              //           // fontSize: "20px",
              //         }
              //       }
              //     >
              //       <ArrowBackIosIcon />
              //     </span>
              //   </button>
              // )}
              // renderNextButton={({ isDisabled }) => (
              //   <button disabled={isDisabled} className="cnext-button">
              //     <span
              //       style={
              //         {
              //           // fontSize: "20px",
              //         }
              //       }
              //     >
              //       <ArrowForwardIosIcon />
              //     </span>
              //   </button>
              // )}
            />
          )} */}

          {/* <div className="graph-container">
            <Grid container spacing={2} className={graphClasses.graphSection}>
              <Grid
                item
                xs={12}
                sm={4}
                md={4}
                className={graphClasses.graphGridContainer}
                style={{ paddingLeft: "22px" }}
              >
                <Box className={graphClasses.graphBox}>
                  <NcPieChart
                    data={ncPieCharData}
                    handleChartDataClick={handleChartDataClick}
                  />
                </Box>
              </Grid>
              <Grid
                item
                xs={12}
                sm={4}
                md={4}
                className={graphClasses.graphGridContainer}
                style={{ paddingLeft: "10px" }}
              >
                <Box className={graphClasses.graphBox}>
                  <NcStackedBarChart data={ncStackBartChartData} />
                </Box>
              </Grid>
              <Grid
                item
                xs={12}
                sm={4}
                md={4}
                className={graphClasses.graphGridContainer}
                style={{ paddingLeft: "10px", paddingRight: "10px" }}
              >
                <Box className={graphClasses.graphBox}>
                  <NcAgeAnalysisBarChart data={ncAgeAnalysisChartData} />
                </Box>
              </Grid>
            </Grid>
          </div> */}
        </div>
        {openActionPointDrawer.open && (
          <ActionPoint
            openActionPointDrawer={openActionPointDrawer}
            setOpenActionPointDrawer={setOpenActionPointDrawer}
            getActionPointData={getActionPointData}
            dataid={dataid}
          />
        )}
        <div className={classes.rootContainer}>
          {/* <FilterDrawer
            open={filterOpen}
            setOpen={setFilterOpen}
            resultText={
              count ? `Showing ${count} Result(s)` : `No Results Found`
            }
            handleApply={handleApply}
            handleDiscard={handleDiscard}
          >
            <Autocomplete
              style={{
                background: "white",
                borderRadius: "6px",
                outline: "none",
              }}
              disabled={false}
              fullWidth
              id="combo-box-demo"
              options={locationListing}
              size="small"
              onChange={(e: any, value: any) => {
                setSearchValue({
                  ...searchValue,
                  location: value?.value,
                });
                getAllSubSystemTypes(value?.value);
              }}
              getOptionLabel={(option: any) => option?.name}
              renderInput={(params: any) => (
                <TextField
                  {...params}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon style={{ fontSize: 18, paddingLeft: 5 }} />
                      </InputAdornment>
                    ),
                  }}
                  placeholder="By Location"
                  variant="outlined"
                  size="small"
                />
              )}
            />
            <div style={{ height: "10px" }} />

            <Autocomplete
              style={{
                background: "white",
                borderRadius: "6px",
                outline: "none",
              }}
              disabled={false}
              fullWidth
              id="combo-box-demo"
              options={systemListing}
              size="small"
              onChange={(e: any, value: any) => {
                getAllSubSystemTypes(value?.value);
                setSearchValue({
                  ...searchValue,
                  auditType: value?.value,
                });
              }}
              getOptionLabel={(option: any) => option?.name}
              renderInput={(params: any) => (
                <TextField
                  {...params}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon style={{ fontSize: 18, paddingLeft: 5 }} />
                      </InputAdornment>
                    ),
                  }}
                  placeholder="By Audit Type"
                  variant="outlined"
                  size="small"
                />
              )}
            />
            <div style={{ height: "10px" }} />

            <Autocomplete
              style={{
                background: "white",
                borderRadius: "6px",
                outline: "none",
              }}
              disabled={false}
              fullWidth
              id="combo-box-demo"
              options={subSystemListing}
              size="small"
              onChange={(e: any, value: any) => {
                getClauses(value?.value);
                setSearchValue({
                  ...searchValue,
                  systemType: value?.value,
                });
                getAllSubSystemTypes(value?.value);
              }}
              getOptionLabel={(option: any) => option?.name}
              renderInput={(params: any) => (
                <TextField
                  {...params}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon style={{ fontSize: 18, paddingLeft: 5 }} />
                      </InputAdornment>
                    ),
                  }}
                  placeholder="By System Type"
                  variant="outlined"
                  size="small"
                />
              )}
            />
            <div style={{ height: "10px" }} />
            <Autocomplete
              style={{
                background: "white",
                borderRadius: "6px",
                outline: "none",
              }}
              disabled={false}
              fullWidth
              id="combo-box-demo"
              options={auditorListing}
              size="small"
              onChange={(e: any, value: any) => {
                setSearchValue({
                  ...searchValue,
                  auditor: value?.value,
                });
              }}
              getOptionLabel={(option: any) => option?.name}
              renderInput={(params: any) => (
                <TextField
                  {...params}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon style={{ fontSize: 18, paddingLeft: 5 }} />
                      </InputAdornment>
                    ),
                  }}
                  placeholder="By Auditor"
                  variant="outlined"
                  size="small"
                />
              )}
            />
            <div style={{ height: "10px" }} />

            <DatePicker
              dateFields={handleDateChange}
              searchValues={searchValue}
            />
            <Autocomplete
              style={{
                background: "white",
                borderRadius: "6px",
                outline: "none",
              }}
              disabled={false}
              fullWidth
              id="combo-box-demo"
              options={clauses}
              size="small"
              onChange={(e: any, value: any) => {
                setSearchValue({
                  ...searchValue,
                  clause: value?.value,
                });
              }}
              getOptionLabel={(option: any) => option?.name}
              renderInput={(params: any) => (
                <TextField
                  {...params}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon style={{ fontSize: 18, paddingLeft: 5 }} />
                      </InputAdornment>
                    ),
                  }}
                  placeholder="By Clause Number"
                  variant="outlined"
                  size="small"
                />
              )}
            />
            <div style={{ height: "10px" }} />
          </FilterDrawer> */}

          <>
            <Grid item xs={12}>
              <Box
                className={classes.searchContainer}
                style={{ marginTop: "10px" }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  {/* Left Side */}
                  {matches ? (
                    <>
                      <Grid container alignItems="center">
                        {/* Location Box */}{" "}
                        <Grid item xs={6} md={4}>
                          <div className={classes.locSearchBox}>
                            <Autocomplete
                              multiple
                              limitTags={1}
                              id="location-autocomplete"
                              className={classes.inputRootOverride}
                              options={
                                Array.isArray(locationNames)
                                  ? [allOption, ...locationNames]
                                  : [allOption]
                              }
                              getOptionLabel={(option) =>
                                option.locationName || ""
                              }
                              getOptionSelected={(option, value) =>
                                option.id === value.id
                              }
                              value={selectedLocation}
                              onChange={handleChangeList}
                              renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                  <div
                                    key={option.id}
                                    className={`${classes.tagContainer} ${
                                      index > 0 ? classes.hiddenTags : ""
                                    }`}
                                  >
                                    <div className={classes.tag}>
                                      {option.locationName}
                                    </div>
                                  </div>
                                ))
                              }
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  variant="outlined"
                                  onClick={() => setSelectedLocation([])}
                                  size="small"
                                  placeholder={
                                    selectedLocation.length === 0
                                      ? "Corp Func/Unit"
                                      : ""
                                  }
                                  fullWidth
                                  className={
                                    selectedLocation.length === 0
                                      ? classes.textField2
                                      : classes.textField
                                  }
                                  style={{ width: "100%" }}
                                />
                              )}
                            />
                          </div>
                        </Grid>
                        <Grid item xs={6} md={4} style={{ marginLeft: "20px" }}>
                          <div className={classes.locSearchBox}>
                            <FormControl
                              variant="outlined"
                              size="small"
                              fullWidth
                            >
                              <Autocomplete
                                // multiple
                                id="location-autocomplete"
                                className={classes.inputRootOverride} // Add this class here
                                options={auditTypes}
                                getOptionLabel={(option) =>
                                  option.auditType || ""
                                }
                                getOptionSelected={(option, value) =>
                                  option.id === value.id
                                }
                                value={selectedAuditType}
                                onChange={(e, value) => {
                                  setSelectedAuditType(value);
                                  setSelected(!!value);
                                }}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    variant="outlined"
                                    size="small"
                                    // label="Audit Type"
                                    placeholder="Audit Type "
                                    fullWidth
                                    className={
                                      selected
                                        ? classes.textField
                                        : classes.textField2
                                    }
                                  />
                                )}
                              />
                            </FormControl>
                          </div>
                        </Grid>
                        {/* Year Component */}
                        <Grid item xs={6} md={3}>
                          <div>
                            <YearComponent
                              currentYear={currentYear}
                              setCurrentYear={setCurrentYear}
                            />
                          </div>
                        </Grid>{" "}
                      </Grid>
                    </>
                  ) : (
                    ""
                  )}

                  {/* <div className="button-group">
                    <ButtonGroup>
                      <Button
                        className={classes.button_left}
                        onClick={() => handleClick("left")}
                        variant={
                          alignment === "left" ? "contained" : "outlined"
                        }
                        color={alignment === "left" ? "primary" : "default"}
                      >
                        Option 1
                      </Button>
                      <Button
                        className={classes.button_center}
                        onClick={() => handleClick("center")}
                        variant={
                          alignment === "center" ? "contained" : "outlined"
                        }
                        color={alignment === "center" ? "primary" : "default"}
                      >
                        All
                      </Button>
                      <Button
                        className={classes.button_right}
                        onClick={() => handleClick("right")}
                        variant={
                          alignment === "right" ? "contained" : "outlined"
                        }
                        color={alignment === "right" ? "primary" : "default"}
                      >
                        Option 3
                      </Button>
                    </ButtonGroup>
                  </div> */}

                  {/* Right Side */}
                  <div>
                    <Tooltip title="Chat With List of Findings" color="blue">
                      <MdForum
                        style={{
                          cursor: "pointer",
                          marginTop: "12px",
                          width: "29px",
                          height: "29px",
                          padding: "1px",
                          marginRight: "8px",

                          fill: "rgb(0, 48, 89)",
                        }}
                        onClick={() => {
                          setChatModalOpen(true);
                        }}
                      />
                    </Tooltip>
                  </div>
                  <Grid
                    container
                    style={{
                      display: "flex",

                      justifyContent: smallScreen ? "flex-end" : "center",
                    }}
                  >
                    <div
                      style={{ display: "flex" }}
                      ref={refelemetForFindings4}
                    >
                      <Grid item style={{ marginRight: "4px" }}>
                        <Button
                          style={{
                            backgroundColor:
                              selectedOption === "My Dept/Vertical"
                                ? "#003059"
                                : "",
                            color:
                              selectedOption === "My Dept/Vertical"
                                ? "white"
                                : "black",
                            borderRadius: "6px",
                            border: "1px solid black",
                            padding: "4px 15px",
                            fontSize: "14px",
                          }}
                          onClick={() => handleButtonClick("My Dept/Vertical")}
                        >
                          My Dept/Vertical
                        </Button>
                      </Grid>
                      {/* <Grid item style={{ marginRight: "4px" }}>
                        <Button
                          style={{
                            backgroundColor:
                              selectedOption === "My Loc" ? "#003059" : "",
                            color:
                              selectedOption === "My Loc" ? "white" : "black",
                            borderRadius: "10px",
                          }}
                          onClick={() => handleButtonClick("My Loc")}
                        >
                          My Loc
                        </Button>
                      </Grid> */}
                      <Grid item style={{ marginRight: "4px" }}>
                        <Button
                          style={{
                            backgroundColor:
                              selectedOption === "My Findings" ? "#003059" : "",
                            color:
                              selectedOption === "My Findings"
                                ? "white"
                                : "black",
                            borderRadius: "6px",
                            border: "1px solid black",
                            padding: "4px 15px",
                            fontSize: "14px",
                          }}
                          onClick={() => handleButtonClick("My Findings")}
                        >
                          <AiOutlineAudit style={{ marginRight: "2px" }} />
                          My Findings
                        </Button>
                      </Grid>
                    </div>
                  </Grid>

                  {/* <Tooltip title="My Findings">
                      <IconButton
                        onClick={() => {
                          setPage(1);
                          setRowsPerPage(10);
                          setNcObsData([]);
                          setOpenAudit(!openAudit);
                        }}
                        ref={refelemetForFindings4}
                      >
                        {openAudit ? (
                          <PermContactCalendar
                            style={{
                              color: "rgb(53, 118, 186)",
                              height: "31px",
                              width: "30px",
                            }}
                          />
                        ) : (
                          <PermContactCalendarOutlinedIcon
                            style={{
                              color: "#444",
                              height: "31px",
                              width: "30px",
                            }}
                          />
                        )}
                      </IconButton>
                    </Tooltip> */}
                  {/* <SearchBar
                      placeholder="Search"
                      name="searchQuery"
                      values={searchQuery}
                      handleChange={handleSearchChange}
                      handleApply={handleTableSearch}
                      endAdornment={true}
                      handleClickDiscard={handleClickDiscard}
                    /> */}
                </Box>
              </Box>
            </Grid>

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

            <AntdModal
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
                    marginTop: "-12px",
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
                  border: "1px solid rgba(19, 171, 155, 0.5)",
                  borderRadius: "12px",
                  padding: "20px",
                  margin: "20px 20px 10px 20px",
                }}
              >
                <div
                  className={classes.locSearchBox}
                  ref={refelemetForFindings2}
                >
                  <FormControl variant="outlined" size="small" fullWidth>
                    <Autocomplete
                      multiple
                      limitTags={1}
                      id="location-autocomplete"
                      className={classes.inputRootOverride} // Add this class here
                      options={
                        Array.isArray(locationNames)
                          ? [allOption, ...locationNames]
                          : [allOption]
                      }
                      getOptionLabel={(option) => option.locationName || ""}
                      getOptionSelected={(option, value) =>
                        option.id === value.id
                      }
                      value={selectedLocation}
                      onChange={handleChangeList}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <div
                            key={option.id}
                            className={`${classes.tagContainer} ${
                              index > 0 ? classes.hiddenTags : ""
                            }`}
                          >
                            <div className={classes.tag}>
                              {option.locationName}
                            </div>
                          </div>
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          size="small"
                          // label="Corp Func/Unit"
                          onClick={() => setSelectedLocation([])}
                          placeholder={
                            selectedLocation.length === 0
                              ? "Corp Func/Unit"
                              : ""
                          }
                          fullWidth
                          className={
                            selectedLocation.length === 0
                              ? classes.textField2
                              : classes.textField
                          }
                          style={{ width: "100%" }}
                        />
                      )}
                    />
                  </FormControl>
                </div>
                <div ref={refelemetForFindings3}>
                  <YearComponent
                    currentYear={currentYear}
                    setCurrentYear={setCurrentYear}
                  />
                </div>
              </div>
            </AntdModal>

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
            ) : ncObsData && ncObsData.length > 0 ? (
              <div
                className={classes.rootContainer}
                style={{ paddingTop: "0px" }}
              >
                {/* <CustomTableWithSort
                headers={headers}
                fields={fields}
                data={ncObsData}
                sortFunction={sortTable}
              />
              <SimplePaginationController
                count={count}
                page={page}
                rowsPerPage={rowsPerPage}
                handleChangePage={changePage}
              /> */}
                {/* <div className={classes.root}> */}
                {matches ? (
                  <Table
                    className={classes.newTableContainer}
                    // rowClassName={() => "editable-row"}
                    dataSource={ncObsData}
                    columns={ncObsColumns}
                    pagination={false}
                    expandable={{
                      expandedRowRender: (record: any) => {
                        const matchingActionPoints = actionPointData?.filter(
                          (ap: any) =>
                            ap.ncNumber === record?.ncObsId?.props?.children
                        );
                        return (
                          <Table
                            className={classes.subTableContainer}
                            style={{ width: 900, paddingBottom: "20px" }}
                            columns={subColumns}
                            bordered
                            dataSource={matchingActionPoints}
                            pagination={false}
                          />
                        );
                      },
                      expandIcon,
                    }}
                    rowKey={(record: any) => record?.ncObsId?.props?.children}

                    // scroll={{ x: 700, }}
                  />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "space-evenly",
                      width: "100%",
                      // height: "100vh",
                      overflowY: "scroll",
                      marginBottom: "40px",
                    }}
                  >
                    {ncObsData?.map((record: any) => (
                      <div
                        style={{
                          border: "1px solid black",
                          borderRadius: "5px",
                          padding: "5px",
                          margin: "10px",
                          width: smallScreen ? "45%" : "100%",
                        }}
                      >
                        <p
                          //  onClick={() => {
                          //   handleClickPdfOpen(record);
                          // }}
                          style={{
                            padding: "3px 10px",
                            backgroundColor: "#9FBFDF",
                            borderRadius: "2px",
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Link
                            to={record.ncObsId.props.to}
                            className="makeStyles-link-216"
                          >
                            {record.ncObsId}
                          </Link>

                          {record.access && (
                            <AiOutlineEdit
                              onClick={() => {
                                // setId(data.id);
                                setModalData({
                                  ...modalData,
                                  data: record,
                                  open: true,
                                });
                                setOpenDrawer(true);
                              }}
                            />
                          )}
                        </p>

                        <p>Type : {record.type}</p>
                        <p>Department : {record?.entity}</p>
                        <p>Status: {record?.status}</p>
                        <p>Pending With :{record?.currentlyUnder}</p>
                        <p>
                          Auditor :
                          {record?.auditor
                            ?.map((data: any) => data?.name)
                            .filter((name: any) => name) // To handle any undefined or null usernames
                            .join(", ")}{" "}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className={classes.pagination}>
                  <Pagination
                    size="small"
                    current={page}
                    pageSize={rowsPerPage}
                    total={count}
                    showTotal={showTotal}
                    showSizeChanger
                    showQuickJumper
                    onChange={(page, pageSize) => {
                      handlePagination(page, pageSize);
                      // changePage(page);
                    }}
                  />
                </div>

                {/* <Table
              // ... other attributes
              columns={actionPointColumns}
              // ... other attributes
            /> */}
                {/* </div> */}
              </div>
            ) : (
              <Box
                width="100%"
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                pt={4}
              >
                <img src={EmptyTableIcon} alt="No table found" height={400} />
                <Typography variant="body2" color="textSecondary">
                  No NC/Observation table found.
                </Typography>
              </Box>
            )}
          </>
          {/* {modalData.open && ( */}
          <div>
            <NcSummaryDrawer
              openDrawer={modalData}
              setOpenDrawer={setModalData}
              id={modalData.data}
              isInbox={false}
            ></NcSummaryDrawer>
          </div>
          {/* )} */}

          {/* {!modalData.open && (
            <div>
              <NcSummaryDrawer
                openDrawer={modalData.open}
                setOpenDrawer={setOpenDrawer}
                id={modalData.data}
              ></NcSummaryDrawer>
            </div>
          )} */}
        </div>
      </div>
      <div>
        <AntdModal
          open={chatModalOpen}
          onCancel={() => {
            console.log("Modal closed");
            setChatModalOpen(false);
          }}
          destroyOnClose
          key="modal4"
          footer={null} // No footer
          closeIcon={<CloseIcon style={{ width: "32px", height: "32px" }} />}
          className={classes.botModal}
          centered // Ensures the modal is centered
          style={{
            top: 20, // Adjust this value as needed to position the modal
            width: "730px", // Fixed width of the modal
          }}
          width={730} // Fixed width of the modal
          bodyStyle={{
            padding: "20px", // Adds padding inside the modal content area
          }}
        >
          <>
            <div className={classes.app}>
              <ChatComponent />
            </div>
          </>
        </AntdModal>
      </div>
    </>
  );
}

export default NcSummary;
