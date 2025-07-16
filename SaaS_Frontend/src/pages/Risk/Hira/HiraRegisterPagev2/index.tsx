//react
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import type { TourProps } from "antd";
import { MdOutlineDelete } from "react-icons/md";
import { MdChatBubbleOutline } from "react-icons/md";
import { MdChevronLeft } from "react-icons/md";
import { MdCancel } from "react-icons/md";
import ConfirmDialog from "components/ConfirmDialog";
import { MdHistory } from "react-icons/md";
import { MdPeople } from "react-icons/md";
import { MdForum } from "react-icons/md";
import { MdOutlineRecommend } from "react-icons/md";
import moment from "moment";
import { RiSidebarUnfoldLine, RiSidebarFoldLine } from "react-icons/ri";

//antd
import {
  Table,
  Space,
  Tooltip,
  Button,
  Input,
  Select,
  Tag,
  DatePicker,
  Form,
  Pagination,
  InputNumber,
  Typography,
  Descriptions,
  Modal,
  Divider,
  Tabs,
  Tour,
  Popover,
  Skeleton,
  Spin,
} from "antd";
import { FaRegFilePdf } from "react-icons/fa";
import {
  AiOutlineFileExcel,
  AiOutlineSearch,
  AiOutlineSend,
} from "react-icons/ai";
import _ from "lodash";
import {
  FormControl,
  MenuItem,
  useMediaQuery,
  Select as MuiSelect,
  InputLabel,
} from "@material-ui/core";
import type { ColumnsType } from "antd/es/table";
import type { PaginationProps } from "antd";
import { MdAssignment } from "react-icons/md";

import { MdSearch } from "react-icons/md";
import { ReactComponent as OrgSettingsIcon } from "assets/moduleIcons/module-setting.svg";
import { ReactComponent as AllDocIcon } from "assets/documentControl/All-Doc.svg";
import { ReactComponent as SignificantIcon } from "assets/icons/significantIcon.svg";
import { ReactComponent as FilterIcon } from "assets/documentControl/Filter.svg";
// import tourGuideIconImage from "assets/icons/tourGuideIcon.png";
//thirdparty libs
import { useSnackbar } from "notistack";

//utils
import getSessionStorage from "utils/getSessionStorage";
import axios from "apis/axios.global";
import { referencesData } from "recoil/atom";
import { useRecoilState } from "recoil";
import checkRoles from "utils/checkRoles";
import { roles } from "utils/enums";
import { isValid, isValidForHiraPage } from "utils/validateInput";
import getAppUrl from "utils/getAppUrl";
//assets
import { MdInfo } from "react-icons/md";
//styles
import useStyles from "./style";
import "./new.css";
import printJS from "print-js";
import HiraConsolidatedWorkflowHistoryDrawer from "components/Risk/Hira/HiraRegister/HiraConsolidatedWorkflowHistoryDrawer";
import TextArea from "antd/es/input/TextArea";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import { saveAs } from "file-saver";
import { MdCheckCircle } from "react-icons/md";
import { MdTouchApp } from "react-icons/md";
import { ReactComponent as CustomEditICon } from "assets/documentControl/Edit.svg";
import RiskScoreModal from "components/Risk/Hira/HiraRegister/RiskScoreModal";
import { Box, IconButton, CircularProgress } from "@material-ui/core";
import { ReactComponent as CustomDeleteICon } from "assets/documentControl/Delete.svg";
import HiraReferences from "components/Risk/Hira/HiraRegister/HiraReferences";
import { MdSend } from "react-icons/md";
import { MdAddCircleOutline } from "react-icons/md";
import HiraHistoryDrawerForAllView from "components/Risk/Hira/HiraRegister/HiraHistoryDrawerForAllView";
import HiraWorkflowCommentsDrawer from "components/Risk/Hira/HiraRegisterReview/HiraWorkflowCommentsDrawer";
import ChangeReviewerApproverModal from "components/Risk/Hira/HiraRegister/ChangeReviewerApproverModal";
import RiskSideNav from "./RiskSideNav";
import HiraChatModal from "components/Risk/Hira/HiraRegister/HiraChatModal";
import DepartmentSelector from "components/ReusableComponents/DepartmentSelector";

const { Option } = Select;
const showTotal: PaginationProps["showTotal"] = (total) =>
  `Total ${total} items`;

const showTotalForAll: PaginationProps["showTotal"] = (total) =>
  `Total ${total} items`;

const { RangePicker } = DatePicker;
const XLSX = require("xlsx");
const avatarUrl = "https://cdn-icons-png.flaticon.com/512/219/219986.png";

function arrayToQueryString(key: any, array: any) {
  if (array && array.length > 0) {
    return array
      .map((item: any) => `${key}[]=${encodeURIComponent(item)}`)
      .join("&");
  }
  return "";
}

function trimText(text: string) {
  return text?.length ? text?.trim() : "";
}

const getHiraStatusForPdf = (workflowStatus: any) => {
  if (workflowStatus === "DRAFT") {
    return "DRAFT";
  } else if (workflowStatus === "REJECTED") {
    return "REJECTED";
  } else if (workflowStatus === "IN_REVIEW") {
    return "IN REVIEW";
  } else if (workflowStatus === "IN_APPROVAL") {
    return "IN APPROVAL";
  } else if (workflowStatus === "APPROVED") {
    return "APPROVED";
  } else {
    return "N/A";
  }
};

const reportTemplate = (
  tableData: any,
  hiraRegisterData: any,
  status: any = "",
  createdByDetails: any = null,
  reviewedByDetails: any = null,
  approvedByDetails: any = null,
  ongoingWorkflowDetails: any = null,
  existingRiskConfig: any = null,
  logo: any
) => {
  // console.log("checkrisk6 tableDatain handleExport-->", tableData);
  // console.log("checkrisk6 approvedBydata reviewerdcbydata", approvedByDetails, reviewedByDetails);

  // console.log("checkrisk hirainworkflow handleexport", hiraInWorkflow);

  const getUniqueAssessmentTeamNames = () => {
    const namesSet = new Set();
    hiraRegisterData?.assesmentTeamData.forEach((member: any) => {
      namesSet?.add(`${member?.firstname} ${member?.lastname}`);
    });
    return Array?.from(namesSet)?.join(", ");
  };

  // console.log("checkrisk6 getUniqueAssessmentTeamNames", getUniqueAssessmentTeamNames());

  let revisionReason = null;
  if (ongoingWorkflowDetails) {
    revisionReason = ongoingWorkflowDetails?.reason || "";
  }

  let riskTypeName = "",
    conditionName = "";
  if (
    hiraRegisterData?.riskType &&
    hiraRegisterData?.condition &&
    existingRiskConfig
  ) {
    riskTypeName = existingRiskConfig?.riskType?.find(
      (risk: any) => risk?._id === hiraRegisterData?.riskType
    )?.name;
    conditionName = existingRiskConfig?.condition?.find(
      (condition: any) => condition?._id === hiraRegisterData?.condition
    )?.name;
  }

  const titleLabel = existingRiskConfig?.titleLabel || "";
  const stepLabel = existingRiskConfig?.stepLabel || "";

  // console.log("checkrisk revisionReason", revisionReason);

  // Unique assessment team names
  const uniqueAssessmentTeamNames = getUniqueAssessmentTeamNames();
  return `
  <div class="report">
    <table style="width: 100%; border-collapse: collapse; border: 1px solid black;">
      <thead style="border: 1px solid black;">
        <tr style="background-color: yellow; text-align: center;">
          <th colspan="19">HAZARD IDENTIFICATION AND RISK ASSESSMENT</th>
        </tr>
      </thead>
      <tbody>
        <tr style="text-align: left; border-bottom: 1px solid black;">
          <td colspan="19" style="border: none;">
          ${
            logo
              ? `<img src="${logo}" alt="Hindalco Logo" style="display: block; margin-left: auto; margin-right: auto; width: 100px;">`
              : ""
          }
          </td>
        </tr>
        <tr class="no-border">
          <td colspan="19" style="border: none;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="width: 50%;">Unit: ${
                  hiraRegisterData?.locationDetails?.locationName
                }</td>
                <td style="width: 50%;">Department: ${
                  hiraRegisterData?.entityDetails?.entityName
                }</td>
                <td>Date: ${moment(hiraRegisterData.createdAt).format(
                  "DD/MM/YYYY"
                )}</td>
              </tr>
              <tr>
                <td>${titleLabel}: ${hiraRegisterData.jobTitle}</td>

              </tr>
              <tr>
                <td>Risk Number: ${hiraRegisterData?.prefixSuffix || "N/A"}</td>
              </tr>
              <tr>
                <td>Area: ${
                  hiraRegisterData?.areaDetails?.name
                    ? hiraRegisterData?.areaDetails?.name
                    : hiraRegisterData?.area
                    ? hiraRegisterData?.area
                    : "N/A"
                }</td>
                <td>Routine/NonRoutine: ${riskTypeName}</td>
              </tr>
              <tr>
                <td>Assessment Team: ${uniqueAssessmentTeamNames || "N/A"}</td>
                <td>Normal/Abnormal/Emergency: ${conditionName}</td>
              </tr>
              <tr>
                <td>Status: ${status || "N/A"}</td>
              </tr>
              <tr>
                <td>Created By: ${createdByDetails?.fullname || ""}</td>
                <td>Created On: ${createdByDetails?.createdAt || ""}</td>
              </tr>
              <tr>
                <td>Reviewed By: ${reviewedByDetails?.fullname || ""}</td>
                <td>Reviewed On: ${reviewedByDetails?.reviewedOn || ""}</td>
              </tr>
              <tr>
                <td>Approved By: ${approvedByDetails?.fullname || ""}</td>
                <td>Approved On: ${approvedByDetails?.approvedOn || ""}</td>
              </tr>
              <tr>
                <td>Additional Assessment Team: ${
                  hiraRegisterData.additionalAssesmentTeam
                }</td>
                <td>Reason for Revision: ${revisionReason || ""}</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr style="border: 1px solid black">
          <th style="border: 1px solid black; padding: 5px;">SN</th>
          <th style="border: 1px solid black; padding: 5px;" colspan="2">${stepLabel}</th>
          <th style="border: 1px solid black; padding: 5px;">Risk Type</th>
          <th style="border: 1px solid black; padding: 5px;">Hazard Description</th>
          <th style="border: 1px solid black; padding: 5px;">Impact</th>
          <th style="border: 1px solid black; padding: 5px; colspan="4">Existing control measure to mitigate hazard</th>
          <th style="border: 1px solid black; padding: 5px;" colspan="3">Pre Mitigation</th>
          <th style="border: 1px solid black; padding: 5px;">Additional Control Measure</th>
          <th style="border: 1px solid black; padding: 5px;">Responsible Person</th>
          <th style="border: 1px solid black; padding: 5px;">Implementation Status</th>
          <th style="border: 1px solid black; padding: 5px;" colspan="3">Residual Score</th>
        </tr>
        <tr style="text-align: center; background-color: #f0f0f0;">
          <th></th>
          <th colspan="2"></th>
          <th></th>
          <th></th>
          <th></th>
          <th></th>
          <th style="border: 1px solid black; padding: 5px;">P</th>
          <th style="border: 1px solid black; padding: 5px;">S</th>
          <th style="border: 1px solid black; padding: 5px;">Pre Score</th>
          <th></th>
          <th></th>
          <th></th>
          <th style="border: 1px solid black; padding: 5px;">P</th>
          <th style="border: 1px solid black; padding: 5px;">S</th>
          <th style="border: 1px solid black; padding: 5px;">Post Score</th>
        </tr>
        ${tableData
          ?.map(
            (item: any, index: any) => `
          <tr>
            <td style="border: 1px solid black; padding: 5px;">${
              parseFloat(item?.subStepNo) > 1.1 ? "" : item?.sNo
            }</td>
            <td style="border: 1px solid black; padding: 5px;" colspan="2">${
              parseFloat(item?.subStepNo) > 1.1 ? "" : item?.jobBasicStep
            }</td>
            <td style="border: 1px solid black; padding: 5px;">${
              item?.hazardTypeDetails?.name
            }</td>
            <td style="border: 1px solid black; padding: 5px;">${
              item?.hazardDescription
            }</td>
            <td style="border: 1px solid black; padding: 5px;">${
              item?.impactText
            }</td>
            <td style="border: 1px solid black; padding: 5px; colspan="4">
              ${item?.existingControl}
            </td>
            <td style="border: 1px solid black; padding: 5px;">${
              item?.preProbability || ""
            }</td>
            <td style="border: 1px solid black; padding: 5px;">${
              item?.preSeverity || ""
            }</td>
            <td style="border: 1px solid black; padding: 5px;">${
              item?.preMitigationScore || ""
            }</td>
            <td style="border: 1px solid black; padding: 5px;">${
              item?.additionalControlMeasure || ""
            }</td>
            <td style="border: 1px solid black; padding: 5px;">
            ${
              item?.responsiblePersonDetails?.firstname
                ? item?.responsiblePersonDetails?.firstname +
                  " " +
                  item?.responsiblePersonDetails?.lastname
                : item?.responsiblePerson
                ? item?.responsiblePerson
                : ""
            }
            </td>
            <td style="border: 1px solid black; padding: 5px;">${
              item?.implementationStatus || ""
            }</td>
            <td style="border: 1px solid black; padding: 5px;">${
              item?.postProbability || ""
            }</td>
            <td style="border: 1px solid black; padding: 5px;">${
              item?.postSeverity || ""
            }</td>
            <td style="border: 1px solid black; padding: 5px;">${
              item?.postMitigationScore || ""
            }</td>
          </tr>
          `
          )
          .join("")}
      </tbody>
    </table>
    <p>Approved through HIIMS Software, Signature not Required!</p>
    <table style="width: 100%; border-collapse: collapse; border: 1px solid black;">
      <tbody>
        <tr style="text-align: center;">
          <td>Created By</td>
          <td>${
            createdByDetails?.fullname + "  |  " + createdByDetails?.createdAt
          }</td>
          <td>Reviewed By</td>
          <td>${
            reviewedByDetails?.fullname
              ? reviewedByDetails?.fullname +
                "  |  " +
                reviewedByDetails?.reviewedOn
              : "N/A"
          }</td>
          <td>Approved By</td>
          <td>${
            approvedByDetails?.fullname
              ? approvedByDetails?.fullname +
                "  |  " +
                approvedByDetails?.approvedOn
              : "N/A"
          }</td>
        </tr>
      </tbody>
    </table>
  </div>
`;
};

const isEmpty = (obj: any) => {
  return Object.keys(obj).length === 0;
};

const statusOptions: any = [
  {
    label: "All",
    value: "All",
  },
  {
    label: "Draft",
    value: "DRAFT",
  },
  {
    label: "In Review",
    value: "IN_REVIEW",
  },
  {
    label: "In Approval",
    value: "IN_APPROVAL",
  },
  {
    label: "Approved",
    value: "APPROVED",
  },
  {
    label: "Rejected",
    value: "REJECTED",
  },
];

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: any;
  record: any;
  index: number;
  hazardTypeOptions: any;
  locationWiseUsers: any;
  handleCopyRow: any;
  nestedRowKey: any;
  value: any;
  setValue: any;
  children: React.ReactNode;
}

const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  hazardTypeOptions = [],
  handleCopyRow,
  nestedRowKey,
  locationWiseUsers = [],
  value = null,
  setValue,
  ...restProps
}) => {
  let isNotFirstRow = false;

  if (record?.key?.includes("new_")) {
    const parts = record?.key?.split("_");
    const number = parseInt(parts[1]);
    if (!isNaN(number) && number > 0) {
      // Your condition is true
      isNotFirstRow = true;
    } else {
      // console.log("Condition is false");
      isNotFirstRow = false;
    }
  } else {
    // console.log("Condition is false");
    isNotFirstRow = false;
  }
  const handleMouseEnter = (e: any) => {
    e.target.removeAttribute("title");
  };
  // Fields that should not have the required validation
  const optionalFields = [
    "additionalControlMeasure",
    "postProbability",
    "postSeverity",
    "implementationStatus",
    "responsiblePerson",
  ];
  const hazardSelectStyle = {
    width: "100%",
    minWidth: "180px",
    maxWidth: "250px", // Set a maximum width
    // overflow: "hidden", // Hide overflow
    // textOverflow: "ellipsis", // Show ellipsis for overflow
    // whiteSpace: "nowrap", // No wrapping of text to a new line
  };
  // Input node rendering based on the column configuration
  let inputNode = <Input style={{ minWidth: "180px  !important" }} />;
  if (inputType === "number") {
    // console.log("checkrisk data index in editable cell in number input", dataIndex);

    inputNode = (
      <InputNumber size="large" style={{ minHeight: "50px" }} min={1} />
    );
    if (dataIndex === "sNo" && nestedRowKey === record?.key) {
      // console.log("checkrisk insude first column nested row");

      inputNode = <></>;
    } else {
      if (dataIndex === "sNo") {
        inputNode = (
          <InputNumber size="large" style={{ minHeight: "50px" }} min={1} />
        );
      } else {
        // console.log("checkrisknew value in editable cell", value);

        inputNode = (
          <InputNumber
            size="large"
            style={{ minHeight: "50px" }}
            min={1}
            max={5}
            precision={0}
          />
        );
      }
    }
  } else if (inputType === "select" && dataIndex === "hazardType") {
    inputNode = (
      <Select
        showSearch
        size="large"
        placeholder="Select Hazard"
        style={hazardSelectStyle}
        filterOption={(input: string, option: any) =>
          option?.children?.toLowerCase().includes(input.toLowerCase())
        }
        listHeight={200}
      >
        {hazardTypeOptions.map((option: any) => (
          <Option
            key={option.value}
            value={option.value}
            title={option.label.length > 20 ? option.label : " "}
          >
            {option.label}
          </Option>
        ))}
      </Select>
    );
  } else if (inputType === "select" && dataIndex === "responsiblePerson") {
    inputNode = (
      <Select
        showSearch
        size="large"
        placeholder="Select Person"
        options={locationWiseUsers || []}
        // style={{ width: "100%", minWidth: "180px" }}
        style={hazardSelectStyle}
        // className={classes.hazardSelectStyle}

        filterOption={(input: any, option: any) =>
          option?.label?.toLowerCase().indexOf(input?.toLowerCase()) >= 0
        }
        listHeight={200}
      />
    );
  } else if (
    inputType === "textarea" &&
    // dataIndex === "jobBasicStep" &&
    dataIndex !== "hazardType" &&
    dataIndex !== "responsiblePerson"
  ) {
    inputNode = <TextArea style={{ minWidth: "180px" }} />;
  }
  // else if (inputType === "textarea" && dataIndex === "jobBasicStep" && record?.sNo > 1) {
  //   inputNode = (
  //     <div>
  //       <TextArea style={{ minWidth: "180px" }} />
  //       <FileCopyIcon />
  //     </div>
  //   );
  // }

  return (
    <td {...restProps}>
      {editing ? (
        <div style={{ display: "flex", alignItems: "center" }}>
          {nestedRowKey === record?.key && dataIndex === "jobBasicStep" ? (
            <></>
          ) : (
            <Form.Item
              name={dataIndex}
              style={{ margin: 0, flexGrow: 1, width: "180px !important" }}
              rules={
                optionalFields.includes(dataIndex)
                  ? []
                  : [
                      {
                        required: true,
                        message: `Please Input ${title}!`,
                      },
                    ]
              }
            >
              {inputNode}
            </Form.Item>
          )}
        </div>
      ) : (
        children
      )}
    </td>
  );
};

const HiraRegisterPagev2 = () => {
  const matches = useMediaQuery("(min-width:820px)");
  const smallScreen = useMediaQuery("(min-width:450px)");
  const userDetails = getSessionStorage();
  const orgId = sessionStorage.getItem("orgId");
  const params = useParams<any>();
  const navigate = useNavigate();

  // const isMounted = useRef(true);
  const printRef = useRef<any>(null);

  printRef.current = (htmlReport: any) => {
    printJS({
      type: "raw-html",
      printable: htmlReport,
    });
  };

  const isMR = checkRoles(roles.MR);
  const isMCOE = checkRoles("ORG-ADMIN") && !!userDetails?.location?.id;
  const location = useLocation();
  // const [logo, setLogo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<any>("");
  const [collapseLevel, setCollapseLevel] = useState(0); // 0: full, 1: icons only, 2: hidden

  // const getLogo = async () => {
  //   const realm = getAppUrl();
  //   const response = await axios.get(`/api/organization/${realm}`);
  //   setLogo(response.data.logoUrl);
  // };

  // console.log("checkrisk ismr iMcoe", isMR || isMCOE ? "true1" : "false0");

  const [tableData, setTableData] = useState<any[]>([]);
  // Inside your component
  const [newRowRef, setNewRowRef] = useState<any>(null);

  const [statusFilter, setStatusFilter] = useState<any>([]);
  const [dateFilter, setDateFilter] = useState<any>("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [existingRiskConfig, setExistingRiskConfig] = useState<any>(null);

  const [search, setSearch] = useState<any>("");

  const [selectedJobTitle, setSelectedJobTitle] = useState<any>(null);

  const [selectedHiraId, setSelectedHiraId] = useState<any>("");

  const [tableDataForReport, setTableDataForReport] = useState<any[]>([]);
  const [hiraInWorkflow, setHiraInWorkflow] = useState<any>({}); //this is for the hira in workflow details

  const [
    consolidatedWorkflowHistoryDrawer,
    setConsolidatedWorkflowHistoryDrawer,
  ] = useState<any>({
    open: false,
    data: hiraInWorkflow,
  });

  const [filterForm] = Form.useForm();
  const [hiraHeaderForm] = Form.useForm();
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [departmentOptions, setDepartmentOptions] = useState<any>([]);
  const [locationOptions, setLocationOptions] = useState<any>([]);
  const [categoryOptions, setCategoryOptions] = useState<any>([]);
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  //below states for editable table
  const [hiraForm] = Form.useForm();
  const [hazardTypeOptions, setHazardTypeOptions] = useState<any>([]);
  const [hiraTableData, setHiraTableData] = useState<any>([]); // Initialize with your data
  const [editingKey, setEditingKey] = useState("");
  const [value, setValue] = useState<any>(null);
  // const isEditing = (record: any) => record?.key === editingKey;
  const isEditing = (record: any) =>
    record?.key === editingKey || record?.id === editingKey;

  const [riskTypeOptions, setRiskTypeOptions] = useState<any>([]);
  const [conditionOptions, setConditionOptions] = useState<any>([]);
  const [stepLabel, setStepLabel] = useState<any>("N/A");
  const [titleLabel, setTitleLabel] = useState<any>("N/A");

  const [locationWiseUsers, setLocationWiseUsers] = useState<any>([]);

  const [isNewJob, setIsNewJob] = useState<boolean>(false);
  const [hiraRegisterData, setHiraRegisterData] = useState<any>(null); //this will be first element of array of table data when job title is selected
  const [hiraHeaderFormData, setHiraHeaderFormData] = useState<any>(null); //this will be used to save form details of hira header
  const [isHiraHeaderExist, setIsHiraHeaderExist] = useState<any>(false); //this will be used to save form details of hira header

  const [riskScoreModal, setRiskScoreModal] = useState<any>({
    open: false,
    data: {},
  });

  const [levelColor, setLevelColor] = useState<any>("yellow");
  const [riskScore, setRiskScore] = useState<any>(0);
  const [selectedCell, setSelectedCell] = useState<any>(null);

  const [hiraReviewModal, setHiraReviewModal] = useState<any>({
    open: false,
    data: null,
  }); //this will be used to control review hira modal

  const [hiraReviewHistory, setHiraReviewHistory] = useState<any>(null); //this will be used to control review hira modal
  const [isTableDataLoaded, setIsTableDataLoaded] = useState<boolean>(false);
  const [isHiraReviewHistoryLoaded, setIsHiraReviewHistoryLoaded] =
    useState<boolean>(false);
  const [allowToAddStep, setAllowToAddStep] = useState<boolean>(false);
  // const [isUserFromSameDept, setIsUserFromSameDept] = useState<boolean>(false);
  const [disableStepBtnForDiffDept, setDisableStepBtnForDiffDept] =
    useState<boolean>(false);

  const [showDraftStatus, setShowDraftStatus] = useState<boolean>(false);

  //this object will contain the details of the hira if the hira gets changed after it is approved
  const [hiraInTrackChanges, setHiraInTrackChanges] = useState<any>(null);

  const [allHiraTableData, setAllHiraTableData] = useState<any>([]);
  const [allHiraTableLoading, setAllHiraTableLoading] =
    useState<boolean>(false);
  const [hideHeaderInAllMode, setHideHeaderInAllMode] =
    useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<any>(false); // Add this line to manage submission state
  const [showUpdateButton, setShowUpdateButton] = useState<boolean>(false);
  const [referencesDrawer, setReferencesDrawer] = useState<any>({
    open: false,
    mode: "edit",
    data: {
      id: null,
    },
  });
  //key for references tab
  const [activeKey, setActiveKey] = useState<any>("1");
  const [contentVisible, setContentVisible] = useState<any>(false);
  const [refData, setRefData] = useRecoilState(referencesData);

  //for risk score modal
  const [selectedPreCell, setSelectedPreCell] = useState<any>(null);
  const [selectedPostCell, setSelectedPostCell] = useState<any>(null);

  //for validation help text
  const [showRequireStepMessage, setShowRequireStepMessage] =
    useState<boolean>(false);

  const [locationForSelectedJob, setLocationForSelectedJob] =
    useState<any>(null);
  const [entityForSelectedJob, setEntityForSelectedJob] = useState<any>(null);

  const ref1 = useRef<any>(null);
  const ref2 = useRef<any>(null);
  const ref3 = useRef<any>(null);
  const ref4 = useRef<any>(null);
  const ref5 = useRef<any>(null);

  const ref1ForViewJob = useRef<any>(null);
  const ref2ForViewJob = useRef<any>(null);
  const ref3ForViewJob = useRef<any>(null);
  const ref4ForViewJob = useRef<any>(null);
  const ref5ForViewJob = useRef<any>(null);
  const ref6ForViewJob = useRef<any>(null);
  const ref7ForViewJob = useRef<any>(null);

  const refStartWorkflowButton = useRef<any>(null);
  const refReviseButton = useRef<any>(null);

  const [tourOpen, setTourOpen] = useState<boolean>(false);
  const [isNewJobClicked, setIsNewJobClicked] = useState<boolean>(false);
  const [tourPopoverVisible, setTourPopoverVisible] = useState<boolean>(false);
  const [isSaveClickedForNewJob, setIsSaveClickedForNewJob] =
    useState<boolean>(false);
  const [isAddStepClicked, setIsAddStepClicked] = useState<any>(false);
  const [currentStep, setCurrentStep] = useState<any>(0);

  const [tourOpenForViewJob, setTourOpenForViewJob] = useState<boolean>(false);
  const [isJobSelectedOnTour, setIsJobSelectedOnTour] =
    useState<boolean>(false);

  const [currentStepForViewJobTour, setCurrentStepForViewJobTour] =
    useState<any>(0);

  const [tourOpenForWorkflow, setTourOpenForWorkflow] =
    useState<boolean>(false);
  const [isStartButtonClickedOnTour, setIsStartButtonClickedOnTour] =
    useState<boolean>(false);

  const [currentStepForWorkflow, setCurrentStepForWorkflow] = useState<any>(0);

  const [hazardTypeTableModal, setHazardTypeTableModal] = useState<any>(false);

  const [hazardTypeTableData, setHazardTypeTableData] = useState<any>([]);
  const [entityOptionsForDeptHead, setEntityOptionsFoDeptHead] = useState<any>(
    []
  );
  const [selectedEntityForDeptHead, setSelectedEntityForDeptHead] =
    useState<any>("");

  const [selectedSectionForHeader, setSelectionForHeader] = useState<any>("");

  const [isLoggedInUserDeptHead, setIsLoggedInUserDeptHead] =
    useState<any>(false);

  const [paginationForAll, setPaginationForAll] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [hiraWorkflowCommentsDrawer, setHiraWorkflowCommentsDrawer] =
    useState<any>({
      open: false,
      data: hiraInWorkflow,
    });

  const [isLoading, setIsLoading] = useState<any>(false);
  const [areaOptions, setAreaOptions] = useState<any>([]);
  const [sectionOptions, setSectionOptions] = useState<any>([]);
  const [selectedArea, setSelectedArea] = useState<any>(undefined);
  const [selectedSection, setSelectedSection] = useState<any>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<any>("All");
  const [nestedRowKey, setNestedRowKey] = useState<any>("");

  const [hiraInWorkflowLoading, setHiraInWorkflowLoading] =
    useState<any>(false);

  const [hiraWithStepsLoading, setHiraWithStepsLoading] = useState<any>(false);
  const [hideFilters, setHideFilters] = useState<any>(false);

  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] =
    useState<any>(false);
  const [jobToBeDeleted, setJobToBeDeleted] = useState<any>(null);

  const [changeWorkflowPeopleModal, setChangeWorkflowPeopleModal] =
    useState<any>(false);
  const [selectedHiraData, setSelectedHiraData] = useState<any>(null);
  const [showExportLoader, setShowExportLoader] = useState<any>(false);
  const [activeModules, setActiveModules] = useState<any>([]);
  const [chatModalOpen, setChatModalOpen] = useState<any>(false);
  const [highlightText, setHighlightText] = useState<any>("");
  const [isLoadingForMilvus, setIsLoadingForMilvus] = useState<any>(false);
  const [isOptionsLoading, setIsOptionsLoading] = useState<any>(true);
  const [logo, setLogo] = useState<any>(null);

  const [selectedDept, setSelectedDept] = useState<any>(null);

  const getLogo = async () => {
    const response = await axios.get(`/api/location/getLogo`);
    setLogo(response.data);
  };

  const [riskScores, setRiskScores] = useState<any>({});
  const realmName = getAppUrl();

  const getActiveModules = async () => {
    await axios(`/api/organization/getAllActiveModules/${realmName}`).then(
      (res) => {
        setActiveModules(res.data.activeModules);
      }
    );
    // .catch((err) => console.error(err));
  };

  const toggleChatModal = () => {
    setChatModalOpen(!chatModalOpen);
  };

  useEffect(() => {
    console.log("checkr activetab in homepage", activeTab);
    if (!!activeTab) {
      fetchHiraConfig(activeTab);
      getHiraList(
        1,
        10,
        activeTab,
        userDetails?.location?.id,
        userDetails?.entity?.id,
        "",
        "",
        "All",
        true
      );
    }
  }, [activeTab]);

  useEffect(() => {
    getLogo();
    getActiveModules();
  }, []);

  useEffect(() => {
    if (!isLoggedInUserDeptHead) {
      getSectionOptions(userDetails?.entity?.id);
    }
  }, [isLoggedInUserDeptHead]);

  useEffect(() => {
    const newRowElement = document?.querySelector(".new-row");
    if (newRowElement) {
      newRowElement?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [hiraTableData]);

  useEffect(() => {
    const fetchInitialDepartmentData = async () => {
      await fetchInitialDepartment(userDetails?.entity?.id);
    };
    if (params && params?.riskId) {
      setHiraWithStepsLoading(true);
      switchToHiraWithStepsView(params?.riskId);
    } else {
      fetchInitialDepartmentData();
      if (location?.state?.filters) {
        switchToJobPageWithAppliedFilters(location?.state?.filters);
      } else {
        switchToJobPage();
      }
    }
  }, [params]);

  const switchToHiraWithStepsView = (hiraId: string) => {
    getHazardTypeOptions();
    fetchHiraConfig();
    getCategoryOptions();
    fetchUsersByLocation();
    setHideFilters(true);
    setSelectedHiraId(hiraId);
    setShowRequireStepMessage(false);
    setEditingKey("");
    setStepLabel(
      categoryOptions?.find((item: any) => item?.value === params?.categoryId)
        ?.basicStepLabel || "N/A"
    );
    setTitleLabel(
      categoryOptions?.find((item: any) => item?.value === params?.categoryId)
        ?.titleLabel || "N/A"
    );
    //clear all hira table data
    setAllHiraTableData([]);
    setPaginationForAll((prev) => ({ ...prev, total: 0 }));
    setHideHeaderInAllMode(false);
    setShowUpdateButton(true);
    setSearch("");
    getHiraWithSteps(hiraId, 1, 10);
  };

  // const checkIfUserIsMultiDeptHead = async () => {
  //   try {
  //     const res = await axios.get(
  //       `/api/riskregister/checkIfUserIsMultiDeptHead?orgId=${userDetails?.organizationId}&userId=${userDetails?.id}`
  //     );

  //     if (res.status === 200) {
  //       console.log(
  //         "checkrisknew res in checkIfUserIsMultiDeptHead ----->",
  //         res
  //       );
  //       if (res.data?.length) {
  //         setEntityOptionsFoDeptHead(
  //           res.data.map((item: any) => ({
  //             ...item,
  //             label: item?.entityName,
  //             value: item?.id,
  //           }))
  //         );
  //         setIsLoggedInUserDeptHead(true);
  //       } else {
  //         setEntityOptionsFoDeptHead([]);
  //         setIsLoggedInUserDeptHead(false);
  //         // getSectionOptions(userDetails?.entity?.id);
  //       }
  //     } else {
  //       setEntityOptionsFoDeptHead([]);
  //       setIsLoggedInUserDeptHead(false);
  //       // getSectionOptions(userDetails?.entity?.id);
  //     }
  //   } catch (error) {
  //     setEntityOptionsFoDeptHead([]);
  //     setIsLoggedInUserDeptHead(false);
  //     console.log("error in checkIfUserIsMultiDeptHead-->", error);
  //   }
  // };
  const handleChangePageNewForAll = (page: number, pageSize: number) => {
    setPaginationForAll((prev) => ({
      // ...prev,
      current: page,
      pageSize: pageSize,
      total: prev.total,
    }));
    getHiraList(
      page,
      pageSize,
      selectedCategory,
      selectedLocation,
      selectedEntity,
      selectedArea,
      selectedSection,
      selectedStatus,
      true
    );
  };

  const fetchInitialDepartment = async (id: string) => {
    try {
      const res = await axios.get(`/api/entity/getSelectedEntity/${id}`);
      const entity = res.data;

      setSelectedDept({
        id: entity.id,
        name: entity.entityName,
        type: entity?.entityType?.name,
      });
    } catch (error) {
      // console.error("Failed to fetch initial department:", error);
    }
  };

  const getHiraList = async (
    page: any = 1,
    pageSize: any = 10,
    category = "",
    locationId = "",
    entityId = "",
    area = "",
    section = "",
    workflowStatus = "All",
    pagination = true
  ) => {
    try {
      setAllHiraTableLoading(true);
      let query = `/api/riskregister/hira/getHiraList/${orgId}?`;
      if (pagination) {
        query += `page=${page}&pageSize=${pageSize}`;
      }
      if (category) {
        query += `&category=${category}`;
      }
      if (entityId) {
        query += `&entityId=${entityId}`;
      }
      if (locationId) {
        query += `&locationId=${locationId}`;
      }
      if (!!workflowStatus && workflowStatus !== "All") {
        query += `&workflowStatus=${workflowStatus}`;
      }
      if (search) {
        query += `&search=${search}`;
      }

      const res = await axios.get(query);
      // console.log("checkrisk3 res in getHiraList", res);

      if (res.status === 200 || res.status === 201) {
        if (!!res.data && !!res.data?.list?.length) {
          setAllHiraTableData(res.data?.list);
          setPaginationForAll((prev) => ({
            ...prev,
            total: res.data.total,
          }));
          setHideHeaderInAllMode(true);
          setAllHiraTableLoading(false);
        } else {
          setAllHiraTableData([]);
          setPaginationForAll((prev) => ({ ...prev, total: 0 }));
          setHideHeaderInAllMode(true);
          setAllHiraTableLoading(false);
        }
      } else {
        setAllHiraTableData([]);
        setPaginationForAll((prev) => ({ ...prev, total: 0 }));
        setHideHeaderInAllMode(true);
        enqueueSnackbar("Error in fetching HIRA list", {
          variant: "error",
        });
        setAllHiraTableLoading(false);
      }
    } catch (error) {
      setAllHiraTableLoading(false);
    }
  };

  const getHiraListForSemanticSearch = async (
    page: any = 1,
    pageSize: any = 10,
    locationId = "",
    entityId = "",
    area = "",
    section = "",
    workflowStatus = "All",
    pagination = true,
    hiraIds = []
  ) => {
    try {
      setAllHiraTableLoading(true);
      let query = `/api/riskregister/hira/getHiraListForSemanticSearch/${orgId}?`;

      if (pagination) {
        query += `page=${page}&pageSize=${pageSize}`;
      }
      if (entityId) {
        query += `&entityId=${entityId}`;
      }
      if (locationId) {
        query += `&locationId=${locationId}`;
      }
      if (area) {
        query += `&area=${area}`;
      }
      if (section) {
        query += `&section=${section}`;
      }
      if (!!workflowStatus && workflowStatus !== "All") {
        query += `&workflowStatus=${workflowStatus}`;
      }
      if (search) {
        query += `&search=${search}`;
      }
      if (hiraIds?.length) {
        const hiraIdsQueryString = arrayToQueryString("hiraIds", hiraIds);
        query += `&${hiraIdsQueryString}`;
      }

      const res = await axios.get(query);

      if (res.status === 200 || res.status === 201) {
        if (!!res.data && !!res.data?.list?.length) {
          setAllHiraTableData(res.data?.list);
          setPaginationForAll((prev) => ({
            ...prev,
            total: res.data.total,
          }));
          setHideHeaderInAllMode(true);
          setAllHiraTableLoading(false);
        } else {
          setAllHiraTableData([]);
          setPaginationForAll((prev) => ({ ...prev, total: 0 }));
          setHideHeaderInAllMode(true);
          setAllHiraTableLoading(false);
        }
      } else {
        setAllHiraTableData([]);
        setPaginationForAll((prev) => ({ ...prev, total: 0 }));
        setHideHeaderInAllMode(true);
        enqueueSnackbar("Error in fetching HIRA list", {
          variant: "error",
        });
        setAllHiraTableLoading(false);
      }
    } catch (error) {
      setAllHiraTableLoading(false);
    }
  };

  const getHazardTypeOptions = async () => {
    try {
      const res = await axios.get(
        `api/riskconfig/getHiraTypes?locationId=${userDetails?.location?.id}&type=hazard&orgId=${userDetails?.organizationId}&master=true`
      );
      // console.log("checkrisk res in getHazardTypeOptions", res);
      if (res.status === 200) {
        if (res?.data && !!res?.data?.data?.length) {
          const hazardTypeOptions = res?.data?.data?.map((hazard: any) => ({
            label: hazard.name,
            value: hazard._id,
          }));
          setHazardTypeOptions(hazardTypeOptions);
          setHazardTypeTableData(res?.data?.data);
        } else {
          setHazardTypeOptions([]);
          setHazardTypeTableData([]);

          enqueueSnackbar("No Risk Types found for Risk config", {
            variant: "warning",
          });
        }
      } else {
        setHazardTypeOptions([]);
        setHazardTypeTableData([]);

        enqueueSnackbar("Something went wrong while fetching Risk types", {
          variant: "error",
        });
      }
    } catch (error) {
      enqueueSnackbar("Something went wrong while fetching Risk types", {
        variant: "error",
      });
      // console.log("checkrisk error in getHiraTypesOptions ", error);
    }
  };

  const getAllAreaMaster = async (locationId: any) => {
    try {
      const res = await axios.get(
        `api/riskconfig/getAllAreaMaster?locationId=${locationId}&orgId=${userDetails?.organizationId}&master=true`
      );
      // console.log("checkrisk res in getHazardTypeOptions", res);
      if (res.status === 200) {
        if (res?.data && !!res?.data?.data?.length) {
          const hazardTypeOptions = res?.data?.data?.map((hazard: any) => ({
            label: hazard.name,
            value: hazard._id,
          }));
          setAreaOptions(hazardTypeOptions);
        } else {
          setAreaOptions([]);

          enqueueSnackbar("No Area Master found for HIRA config", {
            variant: "warning",
          });
        }
      } else {
        setAreaOptions([]);

        enqueueSnackbar("Something went wrong while fetching Area Master", {
          variant: "error",
        });
      }
    } catch (error) {
      enqueueSnackbar("Something went wrong while fetching Area Master", {
        variant: "error",
      });
      // console.log("checkrisk error in getHiraTypesOptions ", error);
    }
  };

  const fetchUsersByLocation = async () => {
    const locationId = userDetails.locationId || "";
    try {
      // setIsLoading(true);
      const res = await axios.get(
        `/api/riskregister/users/${userDetails?.organizationId}`
      );
      // console.log("checkrisk res", res);
      if (res.status === 200 || res.status === 201) {
        if (!!res.data && res.data.length > 0) {
          const userOptions = res.data.map((user: any) => ({
            userId: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            value: user.id,
            label: user.email,
            email: user.email,
            id: user.id,
            fullname: user.firstname + " " + user.lastname,
            // label : user.firstname + " " + user.lastname,
            // // name : user.firstname + " " + user.lastname,
            // value : user.id,
          }));
          setLocationWiseUsers(userOptions);
          // setIsLoading(false);
        } else {
          setLocationWiseUsers([]);
          // setIsLoading(false);
        }
      } else {
        setLocationWiseUsers([]);
        // setIsLoading(false);
      }
    } catch (error) {
      // setIsLoading(false);
      // console.log("errror in fetching users based on location", error);
    }
  };

  const getHiraWithSteps = async (
    hiraId: any,
    page: any = 1,
    pageSize: any = 10,
    searchParam = ""
  ) => {
    try {
      setHiraWithStepsLoading(true);
      let query: any = `/api/riskregister/hira/getHiraWithSteps/${hiraId}?`;
      if (page && pageSize) {
        query += `&page=${page}&pageSize=${pageSize}`;
      }
      if (searchParam) {
        query += `&search=${searchParam}`;
      }
      // console.log("checkriske query in getHiraWithSteps", query);

      const res = await axios.get(query);

      // console.log("checkrisk3 res in getHiraWithSteps", res);
      if (res?.status === 200) {
        if (res?.data?.steps && res?.data?.steps?.length) {
          const hiraDetails = res?.data?.hira;
          await fetchInitialDepartment(hiraDetails?.entityId);
          getSectionOptions(hiraDetails?.entityId);
          getAllAreaMaster(hiraDetails?.locationId);
          hiraHeaderForm?.setFieldsValue({
            jobTitle: hiraDetails?.jobTitle,
            area: hiraDetails?.area,
            category: hiraDetails?.categoryId,
            // section: hiraDetails?.section,
            riskType: hiraDetails?.riskType,
            condition: hiraDetails?.condition,
            assesmentTeam: hiraDetails?.assesmentTeam,
            additionalAssesmentTeam: hiraDetails?.additionalAssesmentTeam,
          });
          setHiraHeaderFormData({
            jobTitle: hiraDetails?.jobTitle,
            category: hiraDetails?.categoryId,
            area: hiraDetails?.area,
            // section: hiraDetails?.section,
            entity: hiraDetails?.entityId,
            riskType: hiraDetails?.riskType,
            condition: hiraDetails?.condition,
            assesmentTeam: hiraDetails?.assesmentTeam,
            additionalAssesmentTeam: hiraDetails?.additionalAssesmentTeam,
          });
          setHiraRegisterData(res?.data?.hira);

          if (hiraDetails?.workflowStatus === "DRAFT") {
            setShowDraftStatus(true);
          }

          setLocationForSelectedJob(hiraDetails?.locationDetails);
          setEntityForSelectedJob(hiraDetails?.entityDetails?.id);
          const stepsData = res?.data?.steps?.map((obj: any) => ({
            ...obj,
            id: obj?._id,
            key: obj?._id,
            sNo: obj?.sNo,
            subStepNo: obj?.subStepNo,
            isOldEntry: true,
            highlight: false,
            hazardName: obj?.hazardTypeDetails?.name,
            responsiblePersonName: obj?.responsiblePerson
              ? obj?.responsiblePersonDetails?.firstname +
                " " +
                obj?.responsiblePersonDetails?.lastname
              : "",
          }));
          setHiraTableData([...stepsData]);
          setIsTableDataLoaded(true);
          setHideHeaderInAllMode(false);
          setPagination((prev) => ({
            ...prev,
            total: res?.data?.stepsCount, // Ensure backend sends correct updated count
            current: page, // Maintain current page correctly
            pageSize: pageSize, // Maintain page size correctly
          }));

          //set Risk Scores to automatically calculate the risk scores when user is changing the score
          // Initialize risk scores
          const initialRiskScores: any = {};
          stepsData.forEach((step: any) => {
            initialRiskScores[step.key] = {
              preProbability: step.preProbability || "",
              preSeverity: step.preSeverity || "",
              preMitigationScore:
                step.preProbability && step.preSeverity
                  ? step.preProbability * step.preSeverity
                  : "",
              postProbability: step.postProbability || "",
              postSeverity: step.postSeverity || "",
              postMitigationScore:
                step.postProbability && step.postSeverity
                  ? step.postProbability * step.postSeverity
                  : "",
            };
          });
          setRiskScores(initialRiskScores);

          setHiraWithStepsLoading(false);
        }
      }
    } catch (error: any) {
      setHiraWithStepsLoading(false);
      if (error?.response) {
        // Request was made, server responded with a status code out of the range of 2xx
        // console.log("Error response data:", error.response.data);
        // console.log("Error response status:", error.response.status);
        // console.log("Error response headers:", error.response.headers);
        if (error.response.status === 404) {
          enqueueSnackbar("Risk Not Found!", {
            variant: "error",
          });
          navigate("/risk/riskregister/HIRA");
          switchToJobPage();
        }
      } else {
        enqueueSnackbar("Something went wrong while fetching Risk", {
          variant: "error",
        });
        navigate("/risk/riskregister/HIRA");
      }
    }
  };

  const getAllHiraWithStepsForExport = async (
    hiraId: any,
    page: any = 1,
    pageSize: any = 300,
    searchParam = ""
  ) => {
    try {
      setShowExportLoader(true);
      let query: any = `/api/riskregister/hira/getHiraWithSteps/${hiraId}?`;
      if (page && pageSize) {
        query += `&page=${page}&pageSize=${pageSize}`;
      }
      if (searchParam) {
        query += `&search=${searchParam}`;
      }
      const res = await axios.get(query);

      // console.log("checkrisk3 res in getHiraWithSteps", res);
      if (res?.status === 200) {
        if (res?.data?.steps && res?.data?.steps?.length) {
          const hiraDetails = res?.data?.hira;

          const stepsData = res?.data?.steps?.map((obj: any) => ({
            ...obj,
            id: obj?._id,
            key: obj?._id,
            sNo: obj?.sNo,
            subStepNo: obj?.subStepNo,
            isOldEntry: true,
            highlight: false,
            hazardName: obj?.hazardTypeDetails?.name,
            responsiblePersonName: obj?.responsiblePerson
              ? obj?.responsiblePersonDetails?.firstname +
                " " +
                obj?.responsiblePersonDetails?.lastname
              : "",
          }));
          setShowExportLoader(false);

          return {
            hira: hiraDetails,
            steps: stepsData,
          };
        }
      }
    } catch (error: any) {
      setHiraWithStepsLoading(false);
      setShowExportLoader(false);

      if (error?.response) {
        // Request was made, server responded with a status code out of the range of 2xx
        // console.log("Error response data:", error.response.data);
        // console.log("Error response status:", error.response.status);
        // console.log("Error response headers:", error.response.headers);
        if (error.response.status === 404) {
          enqueueSnackbar("Risk Not Found!", {
            variant: "error",
          });

          navigate("/risk/riskregister/HIRA");
          switchToJobPage();
        }
      } else {
        enqueueSnackbar("Something went wrong while fetching Risk", {
          variant: "error",
        });
        navigate("/risk/riskregister/HIRA");
      }
      setShowExportLoader(false);
    }
  };

  const getAllDepartmentsByLocation = async (locationId: any = "") => {
    try {
      const res = await axios.get(
        `/api/riskregister/getAllDepartmentsByLocation/${locationId}`
      );

      if (res.status === 200 || res.status === 201) {
        if (res?.data?.data && !!res.data.data.length) {
          setDepartmentOptions(
            res?.data?.data?.map((item: any) => ({
              ...item,
              value: item.id,
              label: item.entityName,
            }))
          );
        } else {
          setDepartmentOptions([]);
          // enqueueSnackbar("No Departments Found", {
          //   variant: "warning",
          // });
        }
      } else {
        // setJobTitleOptions([]);
        enqueueSnackbar("Error in fetching getAllDepartments", {
          variant: "error",
        });
      }
    } catch (error) {
      // console.log("checkrisk error in fetching all job title", error);
    }
  };

  const getCategoryOptions = async (
    isHiraPage: boolean = false
  ): Promise<
    {
      value: string;
      label: string;
      primaryClassification?: string;
      secondaryClassification?: string;
    }[]
  > => {
    try {
      const res = await axios.get(
        `/api/riskconfig/getallcategorynames/${userDetails?.organizationId}`
      );

      if (res.status === 200 || res.status === 201) {
        if (res?.data?.data && res.data.data.length > 0) {
          const mappedCategories = res.data.data.map((item: any) => ({
            ...item,
            value: item._id,
            label: item.riskCategory,
          }));

          setCategoryOptions(mappedCategories);
          setSelectedCategory(mappedCategories[0]?.value);

          // Set first category as active tab if no tab is currently active
          if (!activeTab && mappedCategories.length > 0) {
            setActiveTab(mappedCategories[0]?.value);
          }

          if (isHiraPage) {
            setTitleLabel(mappedCategories[0]?.primaryClassification || "N/A");
            filterForm?.setFieldsValue({
              category: mappedCategories[0]?.value,
            });
          }

          return mappedCategories;
        } else {
          setCategoryOptions([]);
          enqueueSnackbar("No Categories Found", { variant: "warning" });
          return [];
        }
      } else {
        enqueueSnackbar("Error in fetching getallcategorynames", {
          variant: "error",
        });
        return [];
      }
    } catch (error) {
      enqueueSnackbar("Failed to fetch categories", { variant: "error" });
      return [];
    }
  };

  const getAllLocations = async () => {
    try {
      const res = await axios.get(
        `/api/riskregister/getAllLocation/${userDetails?.organizationId}`
      );

      if (res.status === 200 || res.status === 201) {
        if (res?.data?.data && !!res.data.data.length) {
          setLocationOptions(
            res?.data?.data?.map((item: any) => ({
              ...item,
              value: item.id,
              label: item.locationName,
            }))
          );
        } else {
          setLocationOptions([]);
          enqueueSnackbar("No Departments Found", {
            variant: "warning",
          });
        }
      } else {
        // setJobTitleOptions([]);
        enqueueSnackbar("Error in fetching getAllDepartments", {
          variant: "error",
        });
      }
    } catch (error) {
      // console.log("checkrisk error in fetching all job title", error);
    }
  };

  const fetchHiraConfig = async (categoryIdParam: any = "") => {
    try {
      const categoryId = categoryIdParam || params?.categoryId;
      const res = await axios.get(
        `/api/riskconfig/getconfigbyid/${categoryId}`
      );
      // console.log("check res", res);
      if (res.status === 200 || res.status === 201) {
        if (res?.data?.data) {
          const data = res?.data?.data;
          setExistingRiskConfig({
            ...data,
            riskIndicatorData:
              data?.riskLevelData.map((item: any) => ({
                ...item,
                color: item.riskIndicator.split("-")[1],
              })) || [],
            riskTypeOptions: data?.riskTypeOptions?.map((riskType: any) => ({
              label: riskType.label,
              value: riskType._id?.toString(),
            })),
            riskConditionOptions: data?.riskConditionOptions?.map(
              (riskType: any) => ({
                label: riskType.label,
                value: riskType._id?.toString(),
              })
            ),
            impactTypeOptions: data?.impactTypeOptions?.map(
              (impactType: any) => ({
                label: impactType.label,
                value: impactType._id?.toString(),
              })
            ),
            currentControlOptions: data?.currentControlOptions?.map(
              (control: any) => ({
                label: control.label,
                value: control._id?.toString(),
              })
            ),
          });
          setStepLabel(data?.secondaryClassification || "N/A");
          setTitleLabel(data?.primaryClassification || "N/A");
        } else {
          setExistingRiskConfig(null);
        }
      }
    } catch (error) {
      // console.log("errror in fetch config", error);
    }
  };

  const handleCategoryChangeInForm = (categoryId: any) => {
    hiraHeaderForm?.setFieldsValue({
      riskType: undefined,
      condition: undefined,
    });
    fetchHiraConfig(categoryId);
  };

  const clearTableData = () => {
    setTableData([]);
    setTableDataForReport([]);
    setPagination((prev) => ({ ...prev, total: 0 }));
  };

  const getSectionOptions = async (entityId: any) => {
    try {
      const res = await axios.get(
        `api/business/getAllSectionsForEntity/${entityId}`
      );

      // console.log("checkrisk res in getHazardTypeOptions", res);
      if (res.status === 200) {
        if (res?.data && !!res?.data?.length) {
          const sectionOptions = res?.data?.map((item: any) => ({
            label: item.name,
            value: item.id,
          }));
          setSectionOptions(sectionOptions);
        } else {
          setSectionOptions([]);

          // enqueueSnackbar("No Sections found for selected Entity", {
          //   variant: "warning",
          // });
        }
      } else {
        setSectionOptions([]);

        enqueueSnackbar("Something went wrong while fetching Sections", {
          variant: "error",
        });
      }
    } catch (error) {
      enqueueSnackbar("Something went wrong while fetching Sections", {
        variant: "error",
      });
      // console.log("checkrisk error in getHiraTypesOptions ", error);
    }
  };

  const handleDepartmentChange = (value: any) => {
    setSelectedEntity(value);
    // fetchAllJobTitles(value);
    // setSelectedJobTitle("All");
    setHiraTableData([]);
    setShowRequireStepMessage(false);
    setTableDataForReport([]);
    setPagination((prev) => ({ ...prev, total: 0 }));
    filterForm.setFieldsValue({
      jobTitle: undefined,
    });
    hiraHeaderForm?.setFieldsValue({
      jobTitle: "",
      area: undefined,
      section: undefined,
      riskType: undefined,
      condition: undefined,

      entity: undefined,
      assesmentTeam: [],
      additionalAssesmentTeam: "",
    });
    getSectionOptions(value);
    //to hide the Description block for revision history
    setHiraHeaderFormData({});
    setIsTableDataLoaded(false);
    setIsHiraReviewHistoryLoaded(false);

    //to hide the Add Step button
    setAllowToAddStep(false);
    setIsHiraHeaderExist(false);
    //clear all hira table data
    setAllHiraTableData([]);
    setPaginationForAll((prev) => ({ ...prev, total: 0 }));
    setHideHeaderInAllMode(true);
  };

  const handleAreaChange = (value: any) => {
    setSelectedArea(value);
    //clear all hira table data
    setAllHiraTableData([]);
    setPaginationForAll((prev) => ({ ...prev, total: 0 }));
    setHideHeaderInAllMode(true);
  };

  const handleStatusChange = (value: any) => {
    setSelectedStatus(value);
    //clear all hira table data
    setAllHiraTableData([]);
    setPaginationForAll((prev) => ({ ...prev, total: 0 }));
    setHideHeaderInAllMode(true);
  };

  const handleLocationChange = (value: any) => {
    setSelectedLocation(value);
    setSelectedEntity("");
    setSelectedArea(undefined);
    filterForm.setFieldsValue({
      entityId: undefined,
      area: undefined,
      //  jobTitle: undefined
    });
    getAllAreaMaster(value);
    clearTableData();
    getAllDepartmentsByLocation(value);

    //clear all hira table data
    setAllHiraTableData([]);
    setPaginationForAll((prev) => ({ ...prev, total: 0 }));
    setHideHeaderInAllMode(true);
  };

  const handleCategoryChange = (value: any) => {
    // console.log("checkrisknew value in handleCategoryChange", value);

    setSelectedCategory(value);
    setActiveTab(value); // Update active tab when category changes
    getAllLocations();
    setSelectedLocation(userDetails?.locationId);
    setSelectedEntity(userDetails?.entityId);
    setSelectedArea(undefined);
    filterForm.setFieldsValue({
      locationId: userDetails?.locationId,
      entityId: userDetails?.entityId,
      area: undefined,
      //  jobTitle: undefined
    });
    // setAreaOptions([]);
    clearTableData();
    // setDepartmentOptions([]);
    setTitleLabel(
      categoryOptions?.find((item: any) => item.value === value)
        ?.primaryClassification || "N/A"
    );
    //clear all hira table data
    setAllHiraTableData([]);
    setPaginationForAll((prev) => ({ ...prev, total: 0 }));
    setHideHeaderInAllMode(true);
  };

  const handleDeleteJob = async () => {
    try {
      const hiraId = jobToBeDeleted?._id;
      const query: any = {
        workflowStatus: jobToBeDeleted?.workflowStatus,
        currentVersion: jobToBeDeleted?.currentVersion,
        jobTitle: jobToBeDeleted?.jobTitle,
        entityId: jobToBeDeleted?.entityId,
      };

      // Use arrayToQueryString to format stepIds
      const stepIdsQueryString = arrayToQueryString(
        "stepIds",
        jobToBeDeleted?.stepIds
      );

      // Convert query object to query string
      const queryString = Object.keys(query)
        .map((key) => `${key}=${encodeURIComponent(query[key])}`)
        .join("&");

      const finalQueryString = `${queryString}&${stepIdsQueryString}`;

      const res = await axios.delete(
        `/api/riskregister/hira/deleteHira/${hiraId}?${finalQueryString}`
      );

      if (res.status === 200 || res.status === 201) {
        enqueueSnackbar("Job Deleted Successfully", {
          variant: "success",
        });
        getHiraList(
          1,
          10,
          selectedCategory,
          selectedLocation,
          selectedEntity || "",
          selectedArea,
          selectedSection,
          selectedStatus,
          true
        );
        setDeleteConfirmDialogOpen(false);
      }
      setDeleteConfirmDialogOpen(false);
    } catch (error) {
      setDeleteConfirmDialogOpen(false);
    }
  };

  const handleCloseDeleteConfirmDialog = () => {
    setDeleteConfirmDialogOpen(false);
  };

  const reloadAllHiraTableData = () => {
    getHiraList(
      1,
      10,
      selectedCategory,
      selectedLocation,
      selectedEntity || "",
      selectedArea,
      selectedSection,
      selectedStatus,
      true
    );
  };

  const handleJobClickFromTable = (record: any) => {
    // console.log("checkrisk3 inside handleJobClickFromTable", record);
    navigate(`/risk/riskregister/form/${record?.categoryId}/${record?._id}`);
  };

  const handleUpdateHeader = async () => {
    try {
      await hiraHeaderForm.validateFields();

      const validateJobTitle = isValid(trimText(hiraHeaderFormData?.jobTitle));
      if (!validateJobTitle?.isValid) {
        enqueueSnackbar(
          `Please Enter Valid Title ${validateJobTitle?.errorMessage}`,
          {
            variant: "warning",
          }
        );
        return;
      }

      if (hiraHeaderFormData?.additionalAssesmentTeam) {
        const validateAdditionalAssesmentTeam = isValid(
          trimText(hiraHeaderFormData?.additionalAssesmentTeam)
        );
        if (!validateAdditionalAssesmentTeam?.isValid) {
          enqueueSnackbar(
            `Please Enter Valid Additional Assesment Team ${validateAdditionalAssesmentTeam?.errorMessage}`,
            {
              variant: "warning",
            }
          );
          return;
        }
      }
      let headerDataToBeUpdated: any = {
        jobTitle: trimText(hiraHeaderFormData?.jobTitle) || "",
        category: hiraHeaderFormData?.category || "",
        area: hiraHeaderFormData?.area || "",
        section: hiraHeaderFormData?.section || "",
        entity: hiraHeaderFormData?.entity || "",
        riskType: hiraHeaderFormData?.riskType || "",
        condition: hiraHeaderFormData?.condition || "",
        assesmentTeam: hiraHeaderFormData?.assesmentTeam || [],
        additionalAssesmentTeam:
          trimText(hiraHeaderFormData?.additionalAssesmentTeam) || "",
      };
      if (hiraRegisterData?.workflowStatus === "APPROVED") {
        headerDataToBeUpdated = {
          ...headerDataToBeUpdated,
          workflowStatus: "DRAFT",
        };
      }
      const response = await axios.put(
        `/api/riskregister/hira/updateHira/${selectedHiraId}`,
        headerDataToBeUpdated
      );
      if (response?.status === 200) {
        enqueueSnackbar("Risk Updated Successfully", {
          variant: "success",
        });
        getHiraWithSteps(
          selectedHiraId,
          pagination?.current,
          pagination?.pageSize
        );
        setIsHiraHeaderExist(true);
      } else {
        enqueueSnackbar("Something went wrong while updating Risk", {
          variant: "error",
        });
        setIsHiraHeaderExist(false);
      }
    } catch (error) {
      setIsHiraHeaderExist(false);
    }
  };

  const switchToJobPage = async () => {
    setIsOptionsLoading(true);

    try {
      const locationId = selectedLocation || userDetails?.location?.id;
      const entityId = selectedEntity || userDetails?.entity?.id;

      const [categories, locations, departments, areas] = await Promise.all([
        getCategoryOptions(true), // ✅ now returns mapped list
        getAllLocations(),
        getAllDepartmentsByLocation(locationId),
        getAllAreaMaster(locationId),
      ]);

      // console.log("checkrisk switchToJobPage categories --->", categories);

      const defaultCategory = categories?.[0]?.value || selectedCategory;

      setSelectedLocation(locationId);
      setSelectedEntity(entityId);
      setSelectedArea(selectedArea || undefined);
      setSelectedSection(selectedSection || undefined);
      setSelectedStatus(selectedStatus || "All");
      setSelectedCategory(defaultCategory);

      filterForm?.setFieldsValue({
        category: defaultCategory,
        locationId,
        entityId,
        area: selectedArea || undefined,
        section: selectedSection || undefined,
        status: selectedStatus || "All",
      });

      setTitleLabel(
        categories.find((cat: any) => cat.value === defaultCategory)
          ?.primaryClassification || "N/A"
      );

      setSelectedHiraId("");
      setHiraRegisterData({});
      setHideFilters(false);
      setSearch("");
      setHideHeaderInAllMode(true);
      setShowRequireStepMessage(false);
      setIsNewJob(false);
      setEditingKey("");
      setStepLabel("N/A");

      getHiraList(
        paginationForAll?.current || 1,
        paginationForAll?.pageSize || 10,
        defaultCategory,
        locationId,
        entityId,
        selectedArea || "",
        selectedSection || "",
        selectedStatus || "All",
        true
      );
    } catch (err) {
      // console.error("Error loading options:", err);
    } finally {
      setIsOptionsLoading(false);
    }
  };

  const switchToJobPageWithAppliedFilters = async (appliedFilters: any) => {
    setIsOptionsLoading(true);

    try {
      const locationId =
        appliedFilters?.selectedLocation || userDetails?.location?.id;
      const entityId =
        appliedFilters?.selectedEntity || userDetails?.entity?.id;

      const [categories, locations, departments, areas] = await Promise.all([
        getCategoryOptions(true),
        getAllLocations(),
        getAllDepartmentsByLocation(locationId),
        getAllAreaMaster(locationId),
      ]);

      const defaultCategory =
        appliedFilters?.selectedCategory || categories?.[0]?.value;

      setSelectedLocation(locationId);
      setSelectedEntity(entityId);
      setSelectedArea(appliedFilters?.selectedArea || undefined);
      setSelectedSection(appliedFilters?.selectedSection || undefined);
      setSelectedStatus(appliedFilters?.selectedStatus || "All");
      setSelectedCategory(defaultCategory);

      filterForm?.setFieldsValue({
        category: defaultCategory,
        locationId,
        entityId,
        area: appliedFilters?.selectedArea || undefined,
        section: appliedFilters?.selectedSection || undefined,
        status: appliedFilters?.selectedStatus || "All",
      });

      setTitleLabel(
        categories.find((cat: any) => cat.value === defaultCategory)
          ?.primaryClassification || "N/A"
      );

      setSelectedHiraId("");
      setHiraRegisterData({});
      setHideFilters(false);
      setSearch("");
      setHideHeaderInAllMode(true);
      setShowRequireStepMessage(false);
      setIsNewJob(false);
      setEditingKey("");
      setStepLabel("N/A");

      getHiraList(
        pagination?.current || 1,
        pagination?.pageSize || 10,
        defaultCategory,
        locationId,
        entityId,
        appliedFilters?.selectedArea || "",
        appliedFilters?.selectedSection || "",
        appliedFilters?.selectedStatus || "All",
        true
      );
    } catch (err) {
      // console.error("Error loading options with filters:", err);
    } finally {
      setIsOptionsLoading(false);
    }
  };

  const allHiraTableColumns: ColumnsType<any> = [
    {
      title: "Risk No.",
      dataIndex: "prefixSuffix",
      width: 180,
      key: "prefixSuffix",
      render: (text: any, record: any) =>
        record?.prefixSuffix ? record?.prefixSuffix : "N/A",
    },
    {
      title: `${titleLabel}`,
      dataIndex: "jobTitle",
      key: "jobTitle",
      width: 250, // Increased column width
      render: (text: any, record: any) => (
        <Tooltip title={text} placement="top">
          <div
            style={{
              verticalAlign: "top",
              textDecorationLine: "underline",
              cursor: "pointer",
              wordWrap: "break-word", // Allow long text to wrap within the width
              wordBreak: "break-word", // Ensure proper wrapping for long strings
              whiteSpace: "normal", // Prevent text from sticking to one line
            }}
            onClick={() => handleJobClickFromTable(record)}
          >
            <span style={{ textTransform: "capitalize" }}>{text}</span>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Entity",
      dataIndex: "entityDetails",
      width: 180,
      key: "entityDetails",
      render: (text: any, record: any) =>
        record?.entityDetails ? record?.entityDetails?.entityName : "",
    },
    {
      title: "Version",
      dataIndex: "currentVersion",
      key: "currentVersion",
      align: "center",
      render: (text: any, record: any) =>
        record?.currentVersion ? record?.currentVersion : 0,
    },
    {
      title: "Status",
      dataIndex: "workflowStatus",
      key: "workflowStatus",
      render: (text: any, record: any) => renderStatusTag(record),
    },
    {
      title: "Creator",
      dataIndex: "createdByDetails",
      key: "createdByDetails",
      render: (text: any, record: any) => (
        <div style={{ textTransform: "capitalize" }}>
          {record?.createdBy
            ? record?.createdByDetails?.firstname +
              " " +
              record?.createdByDetails?.lastname
            : "N/A"}
        </div>
      ),
    },
    {
      title: "Reviewers",
      dataIndex: "reviewersDetails",
      key: "reviewersDetails",
      render: (text: any, record: any) => (
        <div style={{ textTransform: "capitalize" }}>
          {record?.reviewersDetails
            ?.map((item: any) => item?.firstname + " " + item?.lastname)
            .join(", ") || ""}
        </div>
      ),
    },
    {
      title: "Approvers",
      dataIndex: "approversDetails",
      key: "approversDetails",
      render: (text: any, record: any) => (
        <div style={{ textTransform: "capitalize" }}>
          {record?.approversDetails
            ?.map((item: any) => item?.firstname + " " + item?.lastname)
            .join(", ") || ""}
        </div>
      ),
    },
    {
      title: "History",
      dataIndex: "action",
      fixed: "right",
      render: (_: any, record: any) => {
        return (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignContent: "center",
            }}
          >
            <Tooltip title="Workflow History">
              <MdHistory
                className={classes.historyIcon}
                style={{
                  // fill: "#0E497A",
                  cursor: "pointer",
                  width: "23px",
                  height: "22px",
                  marginRight: "5px",
                }}
                onClick={() => {
                  const hiraCategoryDetails = categoryOptions?.find(
                    (item: any) => item?.value === record?.categoryId
                  );
                  setConsolidatedWorkflowHistoryDrawer({
                    open: true,
                    data: {
                      jobTitle: record?.jobTitle,
                      workflow: record?.workflow,
                      hiraId: record?._id,
                      hiraCategoryDetails: hiraCategoryDetails,
                    },
                  });
                }}
              />
            </Tooltip>
            <Tooltip title="View Workflow Comments">
              <MdChatBubbleOutline
                style={{
                  // fill: "#0E497A",
                  cursor: "pointer",
                  width: "19px",
                  height: "22px",
                  marginRight: "5px",
                }}
                onClick={() => {
                  const latestOngoingWorkflow = record?.workflow?.slice(
                    record?.workflow?.length - 1
                  )[0];
                  setHiraWorkflowCommentsDrawer({
                    open: true,
                    data: latestOngoingWorkflow,
                  });
                }}
              />
            </Tooltip>
            {((isMR && userDetails?.locationId === record?.locationId) ||
              isMCOE) && (
              <Tooltip title={"Delete Job"}>
                <MdOutlineDelete
                  style={{
                    // fill: "#0E497A",
                    cursor: "pointer",
                    width: "23px",
                    height: "22px",
                    marginRight: "5px",
                  }}
                  onClick={() => {
                    setDeleteConfirmDialogOpen(true);
                    setJobToBeDeleted(record);
                  }}
                />
              </Tooltip>
            )}
            {((isMR && userDetails?.locationId === record?.locationId) ||
              isMCOE) &&
              (record?.workflowStatus === "IN_REVIEW" ||
                record?.workflowStatus === "IN_APPROVAL") && (
                <Tooltip title={"Change Reviewer And Approver"}>
                  <MdPeople
                    style={{
                      cursor: "pointer",
                      width: "23px",
                      height: "22px",
                      marginRight: "5px",
                    }}
                    onClick={() => {
                      setChangeWorkflowPeopleModal(true);
                      setSelectedHiraData(record);
                    }}
                  />
                </Tooltip>
              )}
          </div>
        );
      },
    },
  ];

  const configHandler = () => {
    navigate(`/risk/riskconfiguration/HIRA`);
  };
  const handleClickFetch = () => {
    getHiraList(
      1,
      10,
      activeTab,
      selectedLocation,
      selectedEntity || "",
      "",
      "",
      selectedStatus,
      true
    );
  };
  const handleChangePageNew = (page: number, pageSize: number) => {
    // console.log("checkriske page", page, pageSize);
    setPagination((prev) => ({ ...prev, current: page, pageSize: pageSize }));
    getHiraWithSteps(selectedHiraId, page, pageSize);
  };

  const handleExport = async () => {
    // if (!isMounted.current) return;
    // await new  Promise(resolve => setTimeout(resolve, 1000))
    const status = getHiraStatusForPdf(hiraRegisterData?.workflowStatus);

    let createdByDetails = null,
      reviewedByDetails = null,
      approvedByDetails = null;

    if (!hiraWithStepsLoading) {
      createdByDetails = {
        fullname:
          hiraRegisterData?.createdByUserDetails?.firstname +
            " " +
            hiraRegisterData?.createdByUserDetails?.lastname || "N/A",
        createdAt: hiraRegisterData?.hiraCreatedAt
          ? moment(hiraRegisterData?.hiraCreatedAt).format("DD/MM/YYYY HH:mm")
          : "N/A",
      };
    }
    // console.log("checkrisk6 hiraregisterdata workflow[]", hiraRegisterData?.workflow);

    // const targetCycleNumber = hiraRegisterData?.currentVersion + 1;
    const ongoingWorkflowDetails = hiraRegisterData?.workflow?.slice(
      hiraRegisterData?.workflow?.length - 1
    )[0];
    // console.log("checkrisk6 ongoingworkflowdetails---> ", ongoingWorkflowDetails);

    if (
      !!ongoingWorkflowDetails?.approvedBy &&
      !!ongoingWorkflowDetails?.approvedOn
    ) {
      // console.log("checkrisk6 approvedBy found", ongoingWorkflowDetails?.approvedBy);

      approvedByDetails = {
        fullname:
          ongoingWorkflowDetails?.approvedByUserDetails?.firstname +
            " " +
            ongoingWorkflowDetails?.approvedByUserDetails?.lastname || "N/A",
        approvedOn: ongoingWorkflowDetails?.approvedOn
          ? moment(ongoingWorkflowDetails?.approvedOn).format(
              "DD/MM/YYYY HH:mm"
            )
          : "N/A",
      };
    }
    if (
      !!ongoingWorkflowDetails?.reviewedBy &&
      !!ongoingWorkflowDetails?.reviewedOn
    ) {
      // console.log("checkrisk6 reviewedBy found", ongoingWorkflowDetails?.reviewedBy);

      reviewedByDetails = {
        fullname: ongoingWorkflowDetails?.reviewedByUserDetails
          ? ongoingWorkflowDetails?.reviewedByUserDetails?.firstname +
              " " +
              ongoingWorkflowDetails?.reviewedByUserDetails?.lastname || "N/A"
          : "N/A",
        reviewedOn: ongoingWorkflowDetails?.reviewedOn
          ? moment(ongoingWorkflowDetails?.reviewedOn).format(
              "DD/MM/YYYY HH:mm"
            )
          : "N/A",
      };
    }

    // console.log("checkrisk6 approvedBy reviewedBy", approvedByDetails, reviewedByDetails);

    const allHiraData = await getAllHiraWithStepsForExport(
      selectedHiraId,
      1,
      300,
      ""
    );

    // Calculate postMitigationScore based on the condition
    if (allHiraData?.steps && allHiraData?.steps?.length > 0) {
      allHiraData.steps = allHiraData.steps.map((step: any) => {
        return {
          ...step,
          preMitigationScore:
            step.preProbability > 0
              ? step.preProbability * step.preSeverity
              : 0,
          postMitigationScore:
            step.postProbability > 0
              ? step.postProbability * step.postSeverity
              : 0,
        };
      });
    }

    // console.log("checkrisk6 allHiraData in export--->", allHiraData);
    setShowExportLoader(false);

    const htmlReport = reportTemplate(
      allHiraData?.steps,
      hiraRegisterData,
      status,
      createdByDetails,
      reviewedByDetails,
      approvedByDetails,
      ongoingWorkflowDetails,
      existingRiskConfig,
      logo
    );

    printRef.current(htmlReport);
  };

  const handleExportToExcel = async () => {
    const ExcelJS = require("exceljs");

    const response = await axios.get(
      `/api/riskregister/hira/getHiraWithSteps/${selectedHiraId}?page=${1}&pageSize=${100}`
    );

    const tableData = response.data.steps;

    // Calculate postMitigationScore based on the condition
    const processedTableData = tableData.map((row: any) => {
      return {
        ...row,
        postMitigationScore:
          row.postProbability > 0 ? row.postProbability * row.postSeverity : 0,
      };
    });

    const status = getHiraStatusForPdf(hiraRegisterData?.workflowStatus);

    let createdByDetails = null,
      reviewedByDetails = null,
      approvedByDetails = null;

    if (!hiraWithStepsLoading) {
      createdByDetails = {
        fullname:
          hiraRegisterData?.createdByUserDetails?.firstname +
            " " +
            hiraRegisterData?.createdByUserDetails?.lastname || "N/A",
        createdAt: hiraRegisterData?.hiraCreatedAt
          ? moment(hiraRegisterData?.hiraCreatedAt).format("DD/MM/YYYY HH:mm")
          : "N/A",
      };
    }

    const ongoingWorkflowDetails = hiraRegisterData?.workflow?.slice(
      hiraRegisterData?.workflow?.length - 1
    )[0];
    // console.log("checkrisk6 ongoingworkflowdetails in export to excel---> ", ongoingWorkflowDetails);

    if (
      !!ongoingWorkflowDetails?.approvedBy &&
      !!ongoingWorkflowDetails?.approvedOn
    ) {
      // console.log("checkrisk6 approvedBy found in export to excel", ongoingWorkflowDetails?.approvedBy);

      approvedByDetails = {
        fullname:
          ongoingWorkflowDetails?.approvedByUserDetails?.firstname +
            " " +
            ongoingWorkflowDetails?.approvedByUserDetails?.lastname || "N/A",
        approvedOn: ongoingWorkflowDetails?.approvedOn
          ? moment(ongoingWorkflowDetails?.approvedOn).format(
              "DD/MM/YYYY HH:mm"
            )
          : "N/A",
      };
    }
    if (
      !!ongoingWorkflowDetails?.reviewedBy &&
      !!ongoingWorkflowDetails?.reviewedOn
    ) {
      // console.log("checkrisk6 reviewedBy found in export to excel", ongoingWorkflowDetails?.reviewedBy);

      reviewedByDetails = {
        fullname: ongoingWorkflowDetails?.reviewedByUserDetails
          ? ongoingWorkflowDetails?.reviewedByUserDetails?.firstname +
              " " +
              ongoingWorkflowDetails?.reviewedByUserDetails?.lastname || "N/A"
          : "N/A",
        reviewedOn: ongoingWorkflowDetails?.reviewedOn
          ? moment(ongoingWorkflowDetails?.reviewedOn).format(
              "DD/MM/YYYY HH:mm"
            )
          : "N/A",
      };
    }

    const getUniqueAssessmentTeamNames = () => {
      const namesSet = new Set();
      hiraRegisterData?.assesmentTeamData.forEach((member: any) => {
        namesSet?.add(`${member?.firstname} ${member?.lastname}`);
      });
      return Array.from(namesSet).join(", ");
    };

    let revisionReason = null;
    if (ongoingWorkflowDetails) {
      revisionReason = ongoingWorkflowDetails?.reason || "";
    }

    let riskTypeName = "",
      conditionName = "";
    if (
      hiraRegisterData?.riskType &&
      hiraRegisterData?.condition &&
      existingRiskConfig
    ) {
      riskTypeName = existingRiskConfig?.riskType?.find(
        (risk: any) => risk?._id === hiraRegisterData?.riskType
      )?.name;
      conditionName = existingRiskConfig?.condition?.find(
        (condition: any) => condition?._id === hiraRegisterData?.condition
      )?.name;
    }

    // Unique assessment team names
    const uniqueAssessmentTeamNames = getUniqueAssessmentTeamNames();
    const excelData = {
      tableDataForReport,
      hiraReviewHistory,
      status,
      createdByDetails,
      reviewedByDetails,
      approvedByDetails,
      hiraInWorkflow,
    };

    try {
      const workbook = new ExcelJS.Workbook();
      const response = await fetch(
        // "https://aceoffix.prodlelabs.com/Formats/HIRA_Format1.xlsx"
        process.env.REACT_APP_API_URL + "/Formats/HIRA_Format1.xlsx"
      );

      // Fetch Excel file from URL
      const buffer = await response.arrayBuffer();

      // Load the buffer into the workbook
      await workbook.xlsx.load(buffer);

      // Get the first worksheet
      const worksheet = workbook.getWorksheet("HIRA-Format");

      const cellD2 = worksheet.getCell("D2"); // Location
      cellD2.value =
        "HINDALCO, " + hiraRegisterData?.locationDetails?.locationName;

      const cellL2 = worksheet.getCell("L2"); //Ref No
      const cellL3 = worksheet.getCell("L3"); //Rev No
      cellL3.value = hiraRegisterData?.prefixSuffix;
      const cellL4 = worksheet.getCell("L4"); //Rev Date
      cellL4.value = approvedByDetails?.approvedOn;

      const cellD5 = worksheet.getCell("D5"); //Department
      cellD5.value = hiraRegisterData?.entityDetails?.entityName;

      const cellE5 = worksheet.getCell("E5"); //HIRA No
      cellE5.value += hiraRegisterData?.prefixSuffix || "N/A";

      const cellK5 = worksheet.getCell("K5"); //Date
      cellK5.value = approvedByDetails?.approvedOn
        ? approvedByDetails?.approvedOn
        : "N/A";

      const cellE6 = worksheet.getCell("E6"); //Job Title
      cellE6.value = hiraRegisterData.jobTitle;

      // const cellK6 = worksheet.getCell("K6"); //Section / Location
      // cellK6.value = hiraRegisterData?.sectionDetails?.name
      //   ? hiraRegisterData?.sectionDetails.name
      //   : hiraRegisterData?.section
      //   ? hiraRegisterData?.section
      //   : "N/A";

      //const cellK7 = worksheet.getCell("K7"); //Reference OCP (SOP/SMP) No.

      const cellE8 = worksheet.getCell("E8"); //Area
      cellE8.value = hiraRegisterData?.areaDetails?.name
        ? hiraRegisterData?.areaDetails?.name
        : hiraRegisterData?.area
        ? hiraRegisterData?.area
        : "N/A";

      const cellK7 = worksheet.getCell("K7"); //Additional assesment team.
      cellK7.value = hiraRegisterData?.additionalAssesmentTeam || "N/A";

      const cellK8 = worksheet.getCell("K8"); //Routine /NonRoutine
      cellK8.value = riskTypeName;

      const cellE9 = worksheet.getCell("E9"); //Risk assessment team members
      cellE9.value = uniqueAssessmentTeamNames || "N/A";

      const cellK9 = worksheet.getCell("K9"); //Routine /NonRoutine
      cellK9.value = conditionName;

      processedTableData.forEach((row: any, index: number) => {
        if (index !== 0) {
          const rowIndex = index + 13; // Row 13
          worksheet.spliceRows(rowIndex, 0, [{}]);
        }
        worksheet.getCell(`A${index + 13}`).value = "";
        worksheet.getCell(`B${index + 13}`).value =
          parseFloat(row?.subStepNo) > 1.1 ? "" : row.sNo;
        worksheet.getCell(`C${index + 13}`).value =
          parseFloat(row?.subStepNo) > 1.1 ? "" : row.jobBasicStep;
        worksheet.getCell(`D${index + 13}`).value = row.hazardDescription;
        worksheet.getCell(`E${index + 13}`).value = row.impactText;
        worksheet.getCell(`F${index + 13}`).value = row.existingControl;
        worksheet.getCell(`G${index + 13}`).value = row.preProbability;
        worksheet.getCell(`H${index + 13}`).value = row.preSeverity;
        worksheet.getCell(`I${index + 13}`).value = row.preMitigationScore;
        worksheet.getCell(`J${index + 13}`).value =
          row.additionalControlMeasure;
        worksheet.getCell(`K${index + 13}`).value = row
          ?.responsiblePersonDetails?.firstname
          ? row?.responsiblePersonDetails?.firstname +
            " " +
            row?.responsiblePersonDetails?.lastname
          : row?.responsiblePerson
          ? row?.responsiblePerson
          : "";
        worksheet.getCell(`L${index + 13}`).value = row.implementationStatus;
        worksheet.getCell(`M${index + 13}`).value = row.postProbability;
        worksheet.getCell(`N${index + 13}`).value = row.postSeverity;
        worksheet.getCell(`O${index + 13}`).value = row.postMitigationScore;
      });

      worksheet.getCell(`D${processedTableData.length + 14}`).value =
        createdByDetails?.fullname + "   |   " + createdByDetails?.createdAt;
      worksheet.getCell(`F${processedTableData.length + 14}`).value =
        "Reviewed by: " +
        (reviewedByDetails?.fullname ? reviewedByDetails?.fullname : "") +
        "   |   " +
        (reviewedByDetails?.reviewedOn ? reviewedByDetails?.reviewedOn : "");
      worksheet.getCell(`L${processedTableData.length + 14}`).value =
        (approvedByDetails?.fullname ? approvedByDetails?.fullname : "") +
        "   |   " +
        (approvedByDetails?.approvedOn ? approvedByDetails?.approvedOn : "");

      // Convert the workbook to a buffer
      const updatedBuffer = await workbook.xlsx.writeBuffer();

      // Convert the buffer to a Blob
      const blob = new Blob([updatedBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Trigger download
      saveAs(blob, hiraRegisterData?.jobTitle + ".xlsx");
    } catch (error) {}
  };

  function s2ab(s: string) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
      view[i] = s.charCodeAt(i) & 0xff;
    }
    return buf;
  }

  const handleStartReviewNew = () => {
    const hiraId = selectedHiraId || hiraRegisterData?._id;
    navigate(
      `/risk/riskregister/HIRA/review/${hiraRegisterData?.categoryId}/${hiraId}`,
      {
        state: {
          hiraLocationId: hiraRegisterData?.locationId,
          hiraEntityId: hiraRegisterData?.entityId,
          filters: {
            selectedCategory: params?.categoryId || selectedCategory,
            selectedLocation: selectedLocation,
            selectedEntity: selectedEntity,
            selectedArea: selectedArea,
            selectedSection: selectedSection,
            selectedStatus: selectedStatus,
          },
        },
      }
    );
  };

  const handleGoToWorkflowPageClick = () => {
    const hiraId = selectedHiraId || hiraRegisterData?._id;
    navigate(
      `/risk/riskregister/HIRA/review/${hiraRegisterData?.categoryId}/${hiraId}`,
      {
        state: {
          hiraLocationId: hiraRegisterData?.locationId,
          hiraEntityId: hiraRegisterData?.entityId,
          filters: {
            selectedCategory: params?.categoryId || selectedCategory,
            selectedLocation: selectedLocation,
            selectedEntity: selectedEntity,
            selectedArea: selectedArea,
            selectedSection: selectedSection,
            selectedStatus: selectedStatus,
          },
        },
      }
    );
  };

  const renderHiraStatusTag = () => {
    if (hiraRegisterData?.workflowStatus === "DRAFT") {
      return (
        <Space size={[0, 8]} wrap>
          <Tag className={classes.homePageTagStyle} color="#EEDC82">
            DRAFT
          </Tag>
        </Space>
      );
    } else if (hiraRegisterData?.workflowStatus === "IN_REVIEW") {
      return (
        <Space size={[0, 8]} wrap>
          {" "}
          <Tag className={classes.homePageTagStyle} color="#FFAC1C">
            IN REVIEW
          </Tag>
        </Space>
      );
    } else if (hiraRegisterData?.workflowStatus === "IN_APPROVAL") {
      return (
        <Space size={[0, 8]} wrap>
          <Tag className={classes.homePageTagStyle} color="#7CB9E8">
            IN APPROVAL
          </Tag>
        </Space>
      );
    } else if (hiraRegisterData?.workflowStatus === "APPROVED") {
      return (
        <Space size={[0, 8]} wrap>
          <Tag className={classes.homePageTagStyle} color="#00AB66">
            APPROVED
          </Tag>
        </Space>
      );
    } else if (hiraRegisterData?.workflowStatus === "REJECTED") {
      return (
        <Space size={[0, 8]} wrap>
          <Tag className={classes.homePageTagStyle} color="#EE4B2B">
            REJECTED
          </Tag>
        </Space>
      );
    } else {
      return (
        <Space size={[0, 8]} wrap>
          <Tag className={classes.homePageTagStyle} color="crimson">
            N/A
          </Tag>
        </Space>
      );
    }
  };

  const renderStatusTag = (record: any = "") => {
    // console.log("checkrisk get status callled");
    const status = record?.workflowStatus
      ? record?.workflowStatus
      : record?.status;
    if (status === "DRAFT") {
      return (
        <Space size={[0, 8]} wrap>
          <Tag
            className={matches ? classes.homePageTagStyle : ""}
            color={matches ? "#EEDC82" : ""}
          >
            DRAFT
          </Tag>
        </Space>
      );
    } else if (status === "IN_REVIEW") {
      return (
        <Space size={[0, 8]} wrap>
          {" "}
          <Tag
            className={matches ? classes.homePageTagStyle : ""}
            color={matches ? "#FFAC1C" : ""}
          >
            IN REVIEW
          </Tag>
        </Space>
      );
    } else if (status === "IN_APPROVAL") {
      return (
        <Space size={[0, 8]} wrap>
          <Tag
            className={matches ? classes.homePageTagStyle : ""}
            color={matches ? "#7CB9E8" : ""}
          >
            IN APPROVAL
          </Tag>
        </Space>
      );
    } else if (status === "APPROVED") {
      return (
        <Space size={[0, 8]} wrap>
          <Tag
            className={matches ? classes.homePageTagStyle : ""}
            color={matches ? "#00AB66" : ""}
          >
            APPROVED
          </Tag>
        </Space>
      );
    } else if (status === "REJECTED") {
      return (
        <Space size={[0, 8]} wrap>
          <Tag
            className={matches ? classes.homePageTagStyle : ""}
            color={matches ? "#EE4B2B" : ""}
          >
            REJECTED
          </Tag>
        </Space>
      );
    } else {
      return <></>;
    }
  };

  const checkIfUserCanAddSubStep = (record: any) => {
    if (!!editingKey || !!nestedRowKey) {
      return true;
    }
    // if (record?.status === "inWorkflow") {
    //   if (userDetails?.entity?.id !== record?.entityId) {
    //     if (
    //       checkIfLoggedInUserCanReview() ||
    //       checkIfLoggedInUserCanApprove() ||
    //       isLoggedInUserDeptHead
    //     ) {
    //       return false;
    //     } else {
    //       return true;
    //     }
    //   } else {
    //     if (
    //       checkIfLoggedInUserCanReview() ||
    //       checkIfLoggedInUserCanApprove() ||
    //       isLoggedInUserDeptHead
    //     ) {
    //       return false;
    //     } else {
    //       return true;
    //     }
    //   }
    // } else if (record?.status === "active") {
    //   if (
    //     userDetails?.entity?.id === record?.entityId ||
    //     isLoggedInUserDeptHead
    //   ) {
    //     if(hiraInWorkflow?.status === "REJECTED") {
    //       if(userDetails?.id === record?.createdBy){
    //         return false;
    //       } else return true
    //     }
    //   } else {
    //     return true;
    //   }
    // }
  };

  const showStartReviewButton = () => {
    if (selectedHiraId || hiraRegisterData?._id) {
      if (
        ((hiraRegisterData?.workflowStatus === "DRAFT" &&
          !hiraRegisterData?.prefixSuffix) ||
          hiraRegisterData?.workflowStatus === "REJECTED") &&
        hiraRegisterData?.entityId === userDetails?.entity?.id
      ) {
        return true;
      } else return false;
    }
    return false;
  };

  const showReviseHiraButton = () => {
    if (selectedHiraId || hiraRegisterData?._id) {
      if (
        ((hiraRegisterData?.workflowStatus === "DRAFT" &&
          !!hiraRegisterData?.prefixSuffix) ||
          hiraRegisterData?.workflowStatus === "APPROVED") &&
        hiraRegisterData?.entityId === userDetails?.entity?.id
      ) {
        return true;
      } else return false;
    }
    return false;
  };

  const showGoToWorkflowPageButton = () => {
    if (hiraRegisterData?.workflowStatus === "IN_REVIEW") {
      return true;
    } else if (hiraRegisterData?.workflowStatus === "IN_APPROVAL") {
      return true;
    } else return false;
  };

  const disableAddStepNew = () => {
    if (!!nestedRowKey || !!editingKey) {
      return true;
    }
  };

  const checkIfUserCanAddReferenceNew = () => {
    if (isNewJob) {
      return false;
    } else if (showEditStepAndDeleteStepButton()) {
      return true;
    } else return false;
  };

  const handleConsolidatedCloseWorkflowHistoryDrawer = () => {
    setConsolidatedWorkflowHistoryDrawer({
      ...consolidatedWorkflowHistoryDrawer,
      open: !consolidatedWorkflowHistoryDrawer.open,
      data: null,
    });
  };

  const handleViewClick = () => {
    setSelectedLocation(userDetails?.location?.id);
    setSelectedEntity(userDetails?.entity?.id);
    setSelectedHiraId("");
    setSelectedArea(undefined);
    getCategoryOptions();
    getAllLocations();
    getAllDepartmentsByLocation(userDetails?.location?.id);
    navigate(`/risk/riskregister/HIRA`);
    filterForm?.setFieldsValue({
      locationId: userDetails?.location?.id,
      entityId: userDetails?.entity?.id,
      area: undefined,
    });
    setHideFilters(false);
    setSearch("");
    setHideHeaderInAllMode(true);
    setShowRequireStepMessage(false);
    setIsNewJob(false);
    setEditingKey("");
    setNestedRowKey("");
    setHiraRegisterData({});
    getHiraList(
      1,
      10,
      selectedCategory,
      userDetails?.location?.id,
      userDetails?.entity?.id,
      "",
      "",
      "All",
      true
    );
  };

  // const handleCreateHandler = () => {
  //   // setIsCreateMode(true);
  //   getHazardTypeOptions();
  //   getCategoryOptions();
  //   fetchHiraConfig();
  //   fetchUsersByLocation();
  //   getSectionOptions(userDetails?.entity?.id);
  //   setHideFilters(true);
  //   setHideHeaderInAllMode(false);
  //   setIsNewJob(true);
  //   setEditingKey("");
  //   setAllowToAddStep(false);
  //   setSelectedJobTitle(null);
  //   setSelectedHiraId(null);
  //   setDisableStepBtnForDiffDept(false);
  //   !!isNewJob && setShowUpdateButton(false);
  //   setTableData([]);
  //   setHiraInWorkflow(null);
  //   setHiraTableData([]);
  //   setIsHiraHeaderExist(false);
  //   setTableDataForReport([]);
  //   setSelectedEntityForDeptHead(null);
  //   setPagination((prev) => ({ ...prev, total: 0 }));
  //   setAllHiraTableData([]);
  //   setPaginationForAll((prev) => ({ ...prev, total: 0 }));
  //   filterForm.setFieldsValue({
  //     jobTitle: "",
  //   });
  //   hiraHeaderForm?.setFieldsValue({
  //     jobTitle: "",
  //     category: undefined,
  //     area: undefined,
  //     section: undefined,
  //     riskType: undefined,
  //     condition: undefined,
  //     assesmentTeam: [],
  //     entity: userDetails?.entity?.id,
  //     additionalAssesmentTeam: "",
  //   });
  //   setHiraHeaderFormData({
  //     entity: userDetails?.entity?.id,
  //   });
  //   // Set the state to indicate that the button has been clicked
  //   setIsNewJobClicked(true);
  // };

  const handleCreateHandlerNew = () => {
    navigate(`/risk/riskregister/form/${activeTab}/${null}`);
  };

  const handleBackClick = () => {
    // console.log(
    //   "checkrisknew paginationforall in handlebackclick",
    //   paginationForAll
    // );

    navigate("/risk/riskregister/HIRA", {
      state: {
        filters: {
          selectedCategory: hiraHeaderFormData?.category,
          selectedLocation: userDetails?.locationId,
          selectedEntity: hiraHeaderFormData?.entity,
          // selectedArea: selectedArea,
          // selectedSection: selectedSection,
          // selectedStatus: selectedStatus,
        },
      },
    });
    // switchToJobPageWithAppliedFilters(filters);
  };

  const checkIfLoggedInUserCanReview = () => {
    const hiraDetails = hiraInWorkflow;
    if (hiraDetails) {
      //check if userDetails?.id is in hiraDetails?.reviewers
      const isReviewer = hiraDetails?.reviewers?.some(
        (reviewer: any) => reviewer === userDetails?.id
      );
      // console.log("checkrisk isReviewer", isReviewer);

      return isReviewer;
    }
  };

  const checkIfLoggedInUserCanApprove = () => {
    const hiraDetails = hiraInWorkflow;
    if (hiraDetails) {
      //check if userDetails?.id is in hiraDetails?.reviewers
      const isApprover = hiraDetails?.approvers?.some(
        (approver: any) => approver === userDetails?.id
      );
      return isApprover;
    }
  };

  const showEditStepAndDeleteStepButton = () => {
    if (
      hiraRegisterData?.workflowStatus === "DRAFT" &&
      hiraRegisterData?.entityId === userDetails?.entity?.id
    ) {
      return true;
    } else if (
      hiraRegisterData?.workflowStatus === "APPROVED" &&
      hiraRegisterData?.entityId === userDetails?.entity?.id
    ) {
      return true;
    } else if (isNewJob) return true;
    else {
      const targetCycleNumber = hiraRegisterData?.currentVersion + 1;
      const ongoingWorkflowDetails = hiraRegisterData?.workflow?.find(
        (item: any) => item?.cycleNumber === targetCycleNumber
      );
      if (ongoingWorkflowDetails) {
        //check for reviewer
        if (
          hiraRegisterData?.workflowStatus === "IN_REVIEW" &&
          ongoingWorkflowDetails?.reviewers?.includes(userDetails?.id)
        ) {
          return true;
        }
        //check for approver
        else if (
          hiraRegisterData?.workflowStatus === "IN_APPROVAL" &&
          ongoingWorkflowDetails?.approvers?.includes(userDetails?.id)
        ) {
          return true;
        }
        //check for creator in rejected state
        else if (
          hiraRegisterData?.workflowStatus === "REJECTED" &&
          hiraRegisterData?.entityId === userDetails?.entity?.id
        ) {
          return true;
        } else if (
          hiraRegisterData?.workflowStatus === "APPROVED" &&
          hiraRegisterData?.entityId === userDetails?.entity?.id
        ) {
          return true;
        } else return false;
      }
    }
  };

  const showAddStep = () => {
    if (!!isHiraHeaderExist && allowToAddStep) {
      return true;
    } else if (isNewJob) {
      return true;
    } else if (showEditStepAndDeleteStepButton()) {
      return true;
    } else return false;
  };
  // console.log("checkrisk5 showEditStepButton", showEditStepButton({}));

  const disableEditStep = (record: any) => {
    if (editingKey !== "") {
      return true;
    }
    if (
      record?.status === "inWorkflow" &&
      !checkIfLoggedInUserCanReview() &&
      !checkIfLoggedInUserCanApprove()
    ) {
      return true;
    } else if (
      record?.status !== "inWorkflow" &&
      record?.entityId !== userDetails?.entity?.id &&
      !isLoggedInUserDeptHead
    ) {
      return true;
    }
  };

  const canHeaderBeUpdated = () => {
    if (!!selectedHiraId || !!hiraRegisterData?._id) {
      if (
        hiraRegisterData?.workflowStatus === "DRAFT" &&
        hiraRegisterData?.entityId === userDetails?.entity?.id
      ) {
        return true;
      } else if (
        hiraRegisterData?.workflowStatus === "APPROVED" &&
        hiraRegisterData?.entityId === userDetails?.entity?.id
      ) {
        return true;
      } else {
        const targetCycleNumber = hiraRegisterData?.currentVersion + 1;
        const ongoingWorkflowDetails = hiraRegisterData?.workflow?.find(
          (item: any) => item?.cycleNumber === targetCycleNumber
        );
        if (ongoingWorkflowDetails) {
          //check for reviewer
          if (
            hiraRegisterData?.workflowStatus === "IN_REVIEW" &&
            ongoingWorkflowDetails?.reviewers?.includes(userDetails?.id)
          ) {
            return true;
          }
          //check for approver
          else if (
            hiraRegisterData?.workflowStatus === "IN_APPROVAL" &&
            ongoingWorkflowDetails?.approvers?.includes(userDetails?.id)
          ) {
            return true;
          }
          //check for creator in rejected state
          else if (
            hiraRegisterData?.workflowStatus === "REJECTED" &&
            hiraRegisterData?.entityId === userDetails?.entity?.id
          ) {
            return true;
          } else if (
            hiraRegisterData?.workflowStatus === "APPROVED" &&
            userDetails?.entity?.id === hiraRegisterData?.entityId
          ) {
            return true;
          } else return false;
        }
      }
    } else return false;
  };

  const disableHeaderFields = () => {
    if (!!selectedHiraId || !!hiraRegisterData?._id) {
      // console.log("checkrisk6 inside disableHeaderFields id is found");

      if (
        hiraRegisterData?.workflowStatus === "DRAFT" &&
        hiraRegisterData?.entityId === userDetails?.entity?.id
      ) {
        // console.log("checkrisk6 in disableHeaderFields DRAFT HIRA and logged in user is creator");
        return false;
      } else if (
        hiraRegisterData?.workflowStatus === "APPROVED" &&
        hiraRegisterData?.entityId === userDetails?.entity?.id
      ) {
        return false;
      } else {
        // console.log("checkrisk6 in disableHeaderFields DRAFT HIRA and logged in user is not creator");

        const targetCycleNumber = hiraRegisterData?.currentVersion + 1;
        const ongoingWorkflowDetails = hiraRegisterData?.workflow?.find(
          (item: any) => item?.cycleNumber === targetCycleNumber
        );
        // console.log(
        //   "checkrisk6 ongoingWorkflowDetails in disableheaderfields",
        //   ongoingWorkflowDetails
        // );
        if (ongoingWorkflowDetails) {
          // console.log("checkrisk6 in disableHeaderFields ongoingWorkflowDetails is found");

          //check for reviewer
          if (
            hiraRegisterData?.workflowStatus === "IN_REVIEW" &&
            ongoingWorkflowDetails?.reviewers?.includes(userDetails?.id)
          ) {
            // console.log("checkrisk6 in disableHeaderFields IN_REVIEW HIRA and logged in user is reviewer");
            return false;
          }
          //check for approver
          else if (
            hiraRegisterData?.workflowStatus === "IN_APPROVAL" &&
            ongoingWorkflowDetails?.approvers?.includes(userDetails?.id)
          ) {
            // console.log("checkrisk6 in disableHeaderFields IN_APPROVAL HIRA and logged in user is approver");
            return false;
          }
          //check for creator in rejected state
          else if (
            hiraRegisterData?.workflowStatus === "REJECTED" &&
            hiraRegisterData?.entityId === userDetails?.entity?.id
          ) {
            // console.log("checkrisk6 in disableHeaderFields REJECTED HIRA and logged in user is creator");
            return false;
          } else {
            return true;
          }
        }
      }
    } else if (isNewJob) {
      // console.log("checkrisk6 in disableHeaderFields NEW JOB HIRA and logged in user is creator");
      return false;
    } else return true;
  };

  // console.log("checkrisk6 canHeaderBeUpdated disableHeaderFields", canHeaderBeUpdated(), disableHeaderFields());

  const toggleScoreModal = (record: any, isPreOrPost = "") => {
    if (isPreOrPost === "pre") {
      setSelectedCell([record?.preProbability - 1, record?.preSeverity - 1]);
    } else {
      setSelectedCell([record?.postProbability - 1, record?.postSeverity - 1]);
    }
    setRiskScoreModal({
      ...riskScoreModal,
      open: !riskScoreModal.open,
      mode: isPreOrPost,
      riskId: record?.id,
    });
  };
  const handleSaveScore = (isPreOrPost: any = "", cell: any = []) => {
    if (isPreOrPost === "pre") {
      setSelectedPreCell(cell);
    } else if (isPreOrPost === "post") {
      setSelectedPostCell(cell);
    }
  };

  const handleOk = (selectedCellParam: any, isPreOrPost = "") => {
    setRiskScoreModal({
      ...riskScoreModal,
      open: !riskScoreModal.open,
    });
  };

  const toggleHiraReviewModal = () => {
    setHiraReviewModal({
      ...hiraReviewModal,
      open: !hiraReviewModal.open,
    });
  };

  const onChange = (key: any) => {
    setActiveKey(key);
    setContentVisible(true);
  };

  const getReviewedByDetails = () => {
    const latestOngoingWorkflow = hiraRegisterData?.workflow?.slice(
      hiraRegisterData?.workflow?.length - 1
    )[0];
    if (latestOngoingWorkflow?.reviewedBy) {
      return {
        reviewedBy:
          latestOngoingWorkflow?.reviewedByUserDetails?.firstname +
          " " +
          latestOngoingWorkflow?.reviewedByUserDetails?.lastname,
        reviewedOn: moment(latestOngoingWorkflow?.reviewedOn).format(
          "DD/MM/YYYY HH:mm"
        ),
      };
    } else return { reviewedBy: "N/A", reviewedOn: "N/A" };
  };

  const getApprovedByDetails = () => {
    const latestOngoingWorkflow = hiraRegisterData?.workflow?.slice(
      hiraRegisterData?.workflow?.length - 1
    )[0];
    if (latestOngoingWorkflow?.approvedBy) {
      return {
        approvedBy:
          latestOngoingWorkflow?.approvedByUserDetails?.firstname +
          " " +
          latestOngoingWorkflow?.approvedByUserDetails?.lastname,
        approvedOn: moment(latestOngoingWorkflow?.approvedOn).format(
          "DD/MM/YYYY HH:mm"
        ),
      };
    } else return { approvedBy: "N/A", approvedOn: "N/A" };
  };

  const latestOngoingWorkflow = () => {
    return hiraRegisterData?.workflow?.slice(
      hiraRegisterData?.workflow?.length - 1
    )[0];
  };

  const tabs = [
    {
      label: `${stepLabel || "N/A"}`,
      key: "1",
      children: <></>,
    },

    {
      label: "Info",
      key: "2",
      children: (
        <>
          {isTableDataLoaded &&
            selectedHiraId &&
            !isNewJob &&
            !hideHeaderInAllMode && (
              <div ref={ref5ForViewJob}>
                <Descriptions
                  bordered
                  size="small"
                  className={classes.descriptionItemStyle}
                  column={{
                    xxl: 3,
                    xl: 3,
                    lg: 2,
                    md: 2,
                    sm: 1,
                    xs: 1,
                  }}
                >
                  {!hiraWithStepsLoading && (
                    <Descriptions.Item
                      label="Created By:"
                      style={{ textTransform: "capitalize" }}
                    >
                      {hiraRegisterData?.createdByUserDetails?.firstname +
                        " " +
                        hiraRegisterData?.createdByUserDetails?.lastname ||
                        "N/A"}{" "}
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item
                    label="Reviewed By:"
                    style={{ textTransform: "capitalize" }}
                  >
                    {getReviewedByDetails()?.reviewedBy || "N/A"}
                  </Descriptions.Item>

                  <Descriptions.Item
                    label="Approved By :"
                    style={{ textTransform: "capitalize" }}
                  >
                    {getApprovedByDetails()?.approvedBy || "N/A"}
                  </Descriptions.Item>
                  {!hiraWithStepsLoading && (
                    <Descriptions.Item label="Created On : ">
                      {hiraRegisterData?.createdAt
                        ? moment(hiraRegisterData?.createdAt).format(
                            "DD/MM/YYYY HH:mm"
                          )
                        : "N/A"}
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label="Reviewed On : ">
                    {getReviewedByDetails()?.reviewedOn || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Approved On :">
                    {getApprovedByDetails()?.approvedOn || "N/A"}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            )}
        </>
      ),
    },
    {
      label: "References",
      key: "3",
      children: contentVisible ? (
        <div ref={ref6ForViewJob}>
          <HiraReferences
            drawer={referencesDrawer}
            workflowStatus={hiraRegisterData?.workflowStatus}
            checkIfUserCanAddReference={checkIfUserCanAddReferenceNew}
            hiraId={hiraRegisterData?._id}
          />
        </div>
      ) : null,
    },
    {
      label: "Revision History",
      key: "4",
      children: (
        <>
          <div ref={ref7ForViewJob}>
            <HiraConsolidatedWorkflowHistoryDrawer
              consolidatedWorkflowHistoryDrawer={{
                open: true,
                data: hiraRegisterData,
              }}
              handleConsolidatedCloseWorkflowHistoryDrawer={
                handleConsolidatedCloseWorkflowHistoryDrawer
              }
            />
          </div>
        </>
      ),
    },
  ];

  const handleCopyRow = (record: any, dataIndex: any) => {
    // Find the index of the record object in hiraTableData
    const recordIndex = hiraTableData.findIndex(
      (item: any) => item.key === record.key
    );

    // Check if there is a previous object
    if (recordIndex > 0) {
      const previousObject = hiraTableData[recordIndex - 1];
      // Update the jobBasicStep of the record object in hiraTableData
      if (dataIndex === "jobBasicStep") {
        const updatedHiraTableData = hiraTableData.map((item: any) => {
          if (item.id === record.id) {
            return {
              ...item,
              jobBasicStep: previousObject?.jobBasicStep,
            };
          }
          return item;
        });
        hiraForm.setFieldsValue({
          jobBasicStep: previousObject?.jobBasicStep,
        });
        // Update the state with the modified hiraTableData
        setHiraTableData([...updatedHiraTableData]);
      } else if (dataIndex === "hazardType") {
        const updatedHiraTableData = hiraTableData.map((item: any) => {
          if (item.id === record.id) {
            return {
              ...item,
              hazardType: previousObject?.selectedHazardType?._id,
              hazardName: previousObject?.selectedHazardType?.name,
            };
          }
          return item;
        });
        hiraForm.setFieldsValue({
          hazardType: previousObject?.selectedHazardType?._id,
          hazardName: previousObject?.selectedHazardType?.name,
        });
        // Update the state with the modified hiraTableData
        setHiraTableData([...updatedHiraTableData]);
      }
    } else {
    }
  };

  const handleTourClose = () => {
    setTourOpen(false);
    setIsNewJobClicked(false); // Reset the state when the tour is closed
  };

  const hazardTypesColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: any) => {
        let displayText = text;
        let isTruncated = false;

        if (text && text.length > 40) {
          displayText = text.substring(0, 40) + "...";
          isTruncated = true;
        }
        return isTruncated ? (
          <Tooltip title={text}>
            <div
              style={{
                verticalAlign: "top", // Align text to the top
                // display: "block", // Make the content behave like a block element
              }}
            >
              {displayText}
            </div>
          </Tooltip>
        ) : (
          <div
            style={{
              verticalAlign: "top", // Align text to the top
              // display: "block", // Make the content behave like a block element
            }}
          >
            {displayText}
          </div>
        );
      },
    },
    {
      title: "Hazard Description",
      dataIndex: "description",
      // width: 400,
      key: "description",
      render: (text: any) => {
        let displayText = text;
        let isTruncated = false;

        if (text && text.length > 40) {
          displayText = text.substring(0, 40) + "...";
          isTruncated = true;
        }
        // return
        //  isTruncated ? (
        //   <Tooltip title={text}>
        //     <div
        //       style={{
        //         verticalAlign: "top", // Align text to the top
        //         // display: "block", // Make the content behave like a block element
        //       }}
        //     >
        //       {displayText}
        //     </div>
        //   </Tooltip>
        // ) :
        return (
          <div
            style={{
              verticalAlign: "top", // Align text to the top
              // display: "block", // Make the content behave like a block element
            }}
          >
            {text}
          </div>
        );
      },
    },
  ];

  const handleSearch = async () => {
    getHiraWithSteps(
      selectedHiraId,
      pagination?.current,
      pagination?.pageSize,
      search
    );
  };

  const handleClearSearchForSteps = async () => {
    getHiraWithSteps(selectedHiraId, pagination?.current, pagination?.pageSize);
  };

  const handleClearSearchForAllJobs = async (
    page: any = 1,
    pageSize: any = 10,
    locationId = "",
    entityId = "",
    area = "",
    section = "",
    workflowStatus = "All",
    pagination: any = true
  ) => {
    try {
      setAllHiraTableLoading(true);
      let query = `/api/riskregister/hira/getHiraList/${orgId}?`;
      if (pagination) {
        query += `page=${page}&pageSize=${pageSize}`;
      }
      if (entityId) {
        query += `&entityId=${entityId}`;
      }
      if (locationId) {
        query += `&locationId=${locationId}`;
      }
      if (area) {
        query += `&area=${area}`;
      }
      if (section) {
        query += `&section=${section}`;
      }
      if (!!workflowStatus && workflowStatus !== "All") {
        query += `&workflowStatus=${workflowStatus}`;
      }
      const res = await axios.get(query);
      // console.log("checkrisk3 res in getHiraList", res);

      if (res.status === 200 || res.status === 201) {
        if (!!res.data && !!res.data?.list?.length) {
          setAllHiraTableData(res.data?.list);
          setPaginationForAll((prev) => ({
            ...prev,
            total: res.data.total,
          }));
          setHideHeaderInAllMode(true);
          setAllHiraTableLoading(false);
        } else {
          setAllHiraTableData([]);
          setPaginationForAll((prev) => ({ ...prev, total: 0 }));
          setHideHeaderInAllMode(true);
          setAllHiraTableLoading(false);
        }
      } else {
        setAllHiraTableData([]);
        setPaginationForAll((prev) => ({ ...prev, total: 0 }));
        setHideHeaderInAllMode(true);
        enqueueSnackbar("Error in fetching HIRA list", {
          variant: "error",
        });
        setAllHiraTableLoading(false);
      }
    } catch (error) {
      setAllHiraTableLoading(false);
    }
  };

  const toggleCommentsDrawer = () => {
    setHiraWorkflowCommentsDrawer({
      ...hiraWorkflowCommentsDrawer,
      open: !hiraWorkflowCommentsDrawer.open,
      data: null,
    });
  };

  // mobile view filter moda.

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOkModal2 = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // for mobile tab select design

  const [selectedValue, setSelectedValue] = useState("Steps");
  const handleDataChange = (e: any) => {
    setSelectedValue(e.target.value);
  };

  const handleAddHiraToMilvus = async () => {
    try {
      setIsLoadingForMilvus(true);
      const res = await axios.post(
        `${process.env.REACT_APP_PY_URL}/pyapi/addHiraToVectorDb`,
        {
          data: {
            hiraId: selectedHiraId,
          },
        }
      );
      // console.log("checkrisk res in handleAddHiraToMilvus", res);
      if (res?.status === 200 || res?.status === 201) {
        setIsLoadingForMilvus(false);
      }
    } catch (error) {
      setIsLoadingForMilvus(false);
    }
  };

  const handleSemanticSearch = async () => {
    try {
      const body: any = {
        query: search,
      };
      const response = await axios.post(
        `${process.env.REACT_APP_PY_URL}/pyapi/search_hira`,
        body
      );
      if (response?.status === 200 || response?.status === 201) {
        // console.log("checkai result", JSON.parse(response?.data?.response));
        const result_array = JSON.parse(response?.data?.response);
        getHiraListForSemanticSearch(
          1,
          10,
          selectedLocation,
          selectedEntity,
          selectedArea,
          selectedSection,
          "All",
          false,
          []
        );
      } else {
        enqueueSnackbar("Error in fetching search results", {
          variant: "error",
        });
      }
    } catch (error) {
      enqueueSnackbar("Error in fetching search results", {
        variant: "error",
      });
    }
  };

  const tabOptions = [
    {
      key: "risk",
      label: "Risk Management",
      icon: (
        <AllDocIcon
          style={{ width: "22px", height: "20px", marginRight: "4px" }}
        />
      ),
      onClick: handleViewClick,
      isActive: !hideFilters, // assuming active means filters are shown
    },
    {
      key: "settings",
      label: "Settings",
      icon: <OrgSettingsIcon className={classes.docNavIconStyle} />,
      onClick: configHandler,
      isVisible: isMCOE || isMR, // matches handled in render
    },
  ];

  const renderRiskTableFilterForm = () => {
    return (
      <>
        {!hideFilters && matches && (
          <Form
            layout={"inline"}
            form={filterForm}
            rootClassName={classes.labelStyle}
            initialValues={{
              locationId: userDetails?.location?.id,
              entityId: userDetails?.entity?.id,
            }}
          >
            {/* <Form.Item
              label="Category"
              name="category"
              style={{ minWidth: "190px", maxWidth: "450px" }}
            >
              <Select
                showSearch
                placeholder="Select Category"
                optionFilterProp="children"
                filterOption={(input: any, option: any) =>
                  (option?.children ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                style={{
                  width: "100%",
                  border: "1px solid black",
                  borderRadius: "5px",
                }}
                value={selectedCategory}
                onChange={(value) => handleCategoryChange(value)}
                listHeight={200}
                // dropdownRender={(menu) => (
                //   <Paper style={{ padding: "1px" }}>{menu}</Paper>
                // )}
              >
                {categoryOptions.map((option: any) => (
                  <Select.Option key={option.value} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item> */}
            <Form.Item
              label="Unit"
              name="locationId"
              style={{ minWidth: "190px", maxWidth: "450px" }}
            >
              <Select
                showSearch
                placeholder="Select Unit"
                optionFilterProp="children"
                filterOption={(input: any, option: any) =>
                  (option?.children ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                style={{
                  width: "100%",
                  border: "1px solid black",
                  borderRadius: "5px",
                }}
                value={selectedLocation}
                onChange={(value) => handleLocationChange(value)}
                listHeight={200}
                // dropdownRender={(menu) => (
                //   <Paper style={{ padding: "1px" }}>{menu}</Paper>
                // )}
              >
                {locationOptions.map((option: any) => (
                  <Select.Option key={option.value} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="Entity"
              name="entityId"
              style={{ minWidth: "200px", maxWidth: "450px" }}
            >
              {/* <Select
                showSearch
                allowClear
                placeholder="Select Area/Deparment"
                optionFilterProp="children"
                filterOption={(input: any, option: any) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                style={{
                  width: "100%",
                  border: "1px solid black",
                  borderRadius: "5px",
                }}
                value={() => {
                  if (location.pathname.includes("HIRA/")) {
                    return undefined;
                  } else {
                    return selectedEntity || undefined;
                  }
                }}
                options={departmentOptions || []}
                onChange={(value) => handleDepartmentChange(value)}
                listHeight={200}
              /> */}
              <DepartmentSelector
                locationId={selectedLocation}
                selectedDepartment={selectedDept}
                onSelect={(dept, type) => {
                  setSelectedDept({ ...dept, type });
                  handleDepartmentChange(dept?.id);
                  filterForm.setFieldsValue({
                    entityId: dept?.id,
                  });
                }}
                onClear={() => {
                  filterForm.setFieldsValue({
                    entityId: undefined,
                  });
                  setSelectedDept(null);
                  setSelectedEntity(undefined);
                }}
              />
            </Form.Item>

            {/* <Form.Item
              label="Area"
              name="area"
              style={{ minWidth: "200px", maxWidth: "450px" }}
            >
              <Select
                showSearch
                allowClear
                placeholder="Select Area"
                optionFilterProp="children"
                filterOption={(input: any, option: any) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                style={{
                  width: "100%",
                  border: "1px solid black",
                  borderRadius: "5px",
                }}
                value={selectedArea || undefined}
                options={areaOptions || []}
                onChange={(value) => handleAreaChange(value)}
                listHeight={200}
              />
            </Form.Item> */}

            {/* <Form.Item
                    label="Section"
                    name="section"
                    style={{ minWidth: "200px", maxWidth: "450px" }}
                  >
                    <Select
                      showSearch
                      allowClear
                      placeholder="Select Section"
                      optionFilterProp="children"
                      filterOption={(input: any, option: any) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      style={{
                        width: "100%",
                        border: "1px solid black",
                        borderRadius: "5px",
                      }}
                      value={selectedSection || undefined}
                      options={sectionOptions || []}
                      onChange={(value) => handleSectionChange(value)}
                      listHeight={200}
                    />
                  </Form.Item> */}

            <Form.Item
              label="Status"
              name="workflowStatus"
              style={{ minWidth: "200px", maxWidth: "450px" }}
            >
              <Select
                showSearch
                allowClear
                placeholder="Select Status"
                optionFilterProp="children"
                filterOption={(input: any, option: any) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                style={{
                  width: "100%",
                  border: "1px solid black",
                  borderRadius: "5px",
                }}
                value={selectedStatus || "All"}
                options={statusOptions || []}
                onChange={(value) => handleStatusChange(value)}
                listHeight={200}
              />
            </Form.Item>

            <Button
              type="default"
              onClick={handleClickFetch}
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#003566",
                color: "white",
                marginRight: "5px",
              }}
            >
              Fetch
            </Button>
          </Form>
        )}
      </>
    );
  };

  const renderSearchAndAiChatForAllRisks = () => {
    return (
      <>
        <div
          style={{
            display: "flex",
            gap: "10px",
            width: "100%",
          }}
        >
          {!hideFilters && (
            <div
              style={{
                display: "flex",
                gap: "10px",
                width: "100%",
                justifyContent: "flex-end",
              }}
            >
              {/* Toggle Switch for Search Mode */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "10px",
                  justifyContent: "flex-end",
                }}
              >
                {activeModules?.includes("AI_FEATURES") && (
                  <div>
                    <Tooltip title="Chat With Risk" color="blue">
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
                )}
              </div>

              <div
                style={{
                  // marginLeft: "auto",
                  display: "flex",
                  marginBottom: "10px",
                }}
              >
                <Input
                  size="small"
                  style={{
                    marginRight: "20px",
                    borderRadius: 50,
                    padding: "5px 12px",
                    border: "2px solid #d1d5db",
                    width: 320,
                  }}
                  allowClear
                  placeholder="Search Job"
                  onChange={(event) => {
                    // Check if the input has been cleared
                    if (event.target.value === "") {
                      handleClearSearchForAllJobs(
                        1,
                        10,
                        selectedLocation,
                        selectedEntity,
                        selectedArea,
                        selectedSection,
                        selectedStatus,
                        true
                      ); // Call the handleClear function when the input is cleared
                    }
                    setSearch(event.target.value);
                  }}
                  prefix={<AiOutlineSearch size={18} />}
                  suffix={
                    <AiOutlineSend
                      size={18}
                      onClick={() =>
                        getHiraList(
                          1,
                          10,
                          selectedCategory,
                          selectedLocation,
                          selectedEntity,
                          selectedArea,
                          selectedSection,
                          "All",
                          false
                        )
                      }
                    />
                  }
                />
              </div>
            </div>
          )}
        </div>
      </>
    );
  };

  const renderAllRisksTableAndPagination = () => {
    return (
      <>
        {hideHeaderInAllMode &&
          !params?.entityId &&
          !selectedHiraId &&
          !allHiraTableLoading &&
          !!categoryOptions?.length && (
            <>
              {matches ? (
                <div
                  className={classes.allHiraTableContainer}
                  id="table1"

                  // style={{  height: "300px" }}
                >
                  <Table
                    columns={allHiraTableColumns}
                    dataSource={allHiraTableData}
                    rowKey={"id"}
                    // className={classes.riskTable}
                    pagination={false}
                  />
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "space-evenly",
                    marginBottom: "30px",
                  }}
                >
                  {allHiraTableData?.map((record: any) => {
                    return (
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
                          style={{
                            padding: "3px 10px",
                            backgroundColor: "#9FBFDF",
                            borderRadius: "2px",
                            cursor: "pointer",
                          }}
                          onClick={() => handleJobClickFromTable(record)}
                        >
                          {record?.jobTitle}
                        </p>
                        <p>
                          Condition: {record?.conditionDetails?.name || "N/A"}
                        </p>
                        <p>
                          Area:{" "}
                          {record?.areaDetails
                            ? record?.areaDetails?.name
                            : record?.area
                            ? record?.area
                            : ""}
                        </p>
                        <p style={{ display: "flex", alignItems: "center" }}>
                          Status: {renderStatusTag(record)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className={classes.pagination}>
                <Pagination
                  size="small"
                  current={paginationForAll?.current}
                  pageSize={paginationForAll?.pageSize}
                  total={paginationForAll?.total}
                  showTotal={showTotalForAll}
                  showSizeChanger
                  showQuickJumper
                  onChange={(page, pageSize) => {
                    handleChangePageNewForAll(page, pageSize);
                  }}
                />
              </div>
            </>
          )}
      </>
    );
  };

  const renderRiskHeaderForm = () => {
    return (
      <>
        {(selectedHiraId || isNewJob) && (
          <div
            style={{ marginBottom: "15px" }}
            className={classes.descriptionLabelStyle}
            ref={ref2}
          >
            <Form
              form={hiraHeaderForm}
              layout="vertical"
              onValuesChange={(changedValues, allValues) => {
                setHiraHeaderFormData({
                  ...hiraHeaderFormData,
                  ...changedValues,
                });
              }}
            >
              <Descriptions
                bordered
                size="small"
                column={{
                  xxl: 3, // or any other number of columns you want for xxl screens
                  xl: 3, // or any other number of columns you want for xl screens
                  lg: 2, // or any other number of columns you want for lg screens
                  md: matches ? 2 : 1, // or any other number of columns you want for md screens
                  sm: 1, // or any other number of columns you want for sm screens
                  xs: 1, // or any other number of columns you want for xs screens
                }}
                layout={matches ? "horizontal" : "vertical"}
              >
                <Descriptions.Item label="Category : ">
                  <Form.Item
                    name="category"
                    className={classes.disabledInput}
                    style={{ marginBottom: 0 }}
                    rules={[
                      {
                        required: true,
                        message: "Please Select Risk Category!",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Select Category"
                      allowClear
                      style={{ width: "100%" }}
                      options={categoryOptions}
                      size="large"
                      disabled={disableHeaderFields()}
                      listHeight={200}
                      onChange={(value) => {
                        handleCategoryChangeInForm(value);

                        // hiraHeaderForm.setFieldsValue({ category: value });
                      }}
                    />
                  </Form.Item>
                </Descriptions.Item>
                <Descriptions.Item label={`${titleLabel}*`}>
                  <Form.Item
                    name="jobTitle"
                    rules={[
                      {
                        required: true,
                        message: "Please input your job title!",
                      },
                    ]}
                    className={classes.disabledInput}
                    style={{ marginBottom: 0 }}
                  >
                    <Input
                      placeholder={`Enter ${titleLabel}`}
                      size="large"
                      disabled={disableHeaderFields()}
                    />
                  </Form.Item>
                </Descriptions.Item>
                <Descriptions.Item label="Area* : ">
                  <Form.Item
                    name="area"
                    rules={[
                      {
                        required: true,
                        message: "Please Input Your Area!",
                      },
                    ]}
                    className={classes.disabledInput}
                    style={{ marginBottom: 0 }}
                  >
                    <Select
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input: any, option: any) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      placeholder="Select Area"
                      allowClear
                      style={{ width: "100%" }}
                      options={areaOptions}
                      disabled={disableHeaderFields()}
                      size="large"
                      listHeight={200}
                    />
                  </Form.Item>
                </Descriptions.Item>
                <Descriptions.Item label="Routine/Non Routine*:">
                  <Form.Item
                    name="riskType"
                    style={{ marginBottom: 0 }}
                    rules={[
                      {
                        required: true,
                        message: "Please Select Risk Type!",
                      },
                    ]}
                    className={classes.disabledSelect}
                  >
                    <Select
                      placeholder="Select Routine/Non Routine"
                      allowClear
                      style={{ width: "100%" }}
                      options={riskTypeOptions}
                      disabled={disableHeaderFields()}
                      size="large"
                      listHeight={200}
                    />
                  </Form.Item>
                </Descriptions.Item>
                <Descriptions.Item label="Condition*:">
                  <Form.Item
                    name="condition"
                    style={{ marginBottom: 0 }}
                    rules={[
                      {
                        required: true,
                        message: "Please Select Condition!",
                      },
                    ]}
                    className={classes.disabledSelect}
                  >
                    <Select
                      placeholder="Select Condition"
                      allowClear
                      style={{
                        width: "100%",
                      }}
                      options={conditionOptions}
                      size="large"
                      disabled={disableHeaderFields()}
                      listHeight={200}
                    />
                  </Form.Item>
                </Descriptions.Item>
                <Descriptions.Item label="Assessment Team*: ">
                  <Form.Item
                    // label="Assesment Team: "
                    className={classes.disabledMultiSelect}
                    name="assesmentTeam"
                    style={{ marginBottom: 0 }}
                    rules={[
                      {
                        required: true,
                        message: "Please Select Team!",
                      },
                    ]}
                  >
                    <Select
                      showSearch
                      placeholder="Select Team"
                      allowClear
                      style={{
                        width: "100%",
                      }}
                      mode="multiple"
                      options={locationWiseUsers || []}
                      size="large"
                      filterOption={(input, option: any) =>
                        option?.label
                          ?.toLowerCase()
                          .indexOf(input?.toLowerCase()) >= 0
                      }
                      disabled={disableHeaderFields()}
                      listHeight={200}
                    />
                  </Form.Item>
                </Descriptions.Item>
                <Descriptions.Item label="Corp Func/Unit: ">
                  <Form.Item
                    className={classes.disabledInput}
                    style={{ marginBottom: 0 }}
                    // name="unit"
                  >
                    <Input
                      // placeholder="Enter Area"
                      value={
                        isNewJob
                          ? userDetails?.location?.locationName
                          : locationForSelectedJob?.locationName
                      }
                      size="large"
                      disabled={true}
                    />
                  </Form.Item>
                </Descriptions.Item>
                <Descriptions.Item label="Entity: ">
                  {entityOptionsForDeptHead?.length && isNewJob ? (
                    <Form.Item
                      className={classes.disabledInput}
                      style={{ marginBottom: 0 }}
                      name="entity"
                      rules={[
                        {
                          required: true,
                          message: "Please Select Entity!",
                        },
                      ]}
                    >
                      <Select
                        showSearch
                        // placeholder="Filter By Area/Deparment"
                        placeholder="Select Entity"
                        optionFilterProp="children"
                        filterOption={(input: any, option: any) =>
                          (option?.label ?? "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        style={{ width: "100%" }}
                        value={selectedEntityForDeptHead}
                        options={entityOptionsForDeptHead || []}
                        onChange={(value) => {
                          setSelectedEntityForDeptHead(value);

                          hiraHeaderForm.setFieldsValue({
                            section: undefined,
                          });
                          getSectionOptions(value);
                        }}
                        size="large"
                        listHeight={200}
                      />
                    </Form.Item>
                  ) : (
                    <Form.Item
                      className={classes.disabledInput}
                      style={{ marginBottom: 0 }}
                    >
                      <Input
                        value={
                          isNewJob
                            ? userDetails?.entity?.entityName
                            : entityForSelectedJob
                        }
                        size="large"
                        disabled={true}
                      />
                    </Form.Item>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Additional Assessment Team: ">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Form.Item
                      style={{ marginBottom: 0, flex: 1 }}
                      name="additionalAssesmentTeam"
                      className={classes.disabledInput}
                    >
                      <Input
                        placeholder="Enter Additional Team Members"
                        size="large"
                        width={"100%"}
                        disabled={disableHeaderFields()}
                      />
                    </Form.Item>
                    {canHeaderBeUpdated() && (
                      <Button
                        style={{
                          backgroundColor: "#003566",
                          color: "white",
                          marginLeft: "20px", // Add some space between the input and the button
                        }}
                        type="primary"
                        onClick={handleUpdateHeader}
                      >
                        Update
                      </Button>
                    )}
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </Form>
          </div>
        )}
      </>
    );
  };

  const renderShowStepRequireMessage = () => {
    return (
      <>
        {!!showRequireStepMessage && (
          <div
            style={{
              color: "red",
              display: "flex",
              marginRight: "10px",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <>
              Please Add Atleast One Step and Click On
              <MdCheckCircle
                width={18}
                height={18}
                style={{
                  fill: "blue",
                  marginLeft: "4px",
                  marginRight: "4px",
                }}
              />
              To Submit the Job!
            </>
          </div>
        )}
      </>
    );
  };

  const renderRiskDesktopAndMobileTabsSection = () => {
    return (
      <>
        {(selectedHiraId || isNewJob) && (
          <div
            className={classes.tabsWrapper}
            style={{
              marginBottom: "10px",
              position: "relative",
              marginTop: matches ? "0px" : "30px",
            }}
          >
            {matches ? (
              <Tabs
                onChange={onChange}
                type="card"
                items={tabs}
                activeKey={activeKey}
                onTabClick={() => {
                  setContentVisible((prev: any) => !prev);
                }}
                animated={{ inkBar: true, tabPane: true }}
              />
            ) : (
              <div>
                <FormControl
                  variant="outlined"
                  size="small"
                  fullWidth
                  //  className={classes.formControl}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    width: "100%",
                  }}
                >
                  <InputLabel>Menu List</InputLabel>
                  <MuiSelect
                    label="Menu List"
                    value={selectedValue}
                    onChange={handleDataChange}
                  >
                    <MenuItem value={"Steps"}>
                      <div
                        style={{
                          backgroundColor:
                            selectedValue === "Steps" ? "#3576BA" : "white",
                          textAlign: "center",
                          padding: "5px 10px",
                          borderRadius: "5px",
                          color: selectedValue === "Steps" ? "white" : "black",
                        }}
                      >
                        {" "}
                        Steps
                      </div>
                    </MenuItem>
                    <MenuItem value={"Info"}>
                      {" "}
                      <div
                        style={{
                          backgroundColor:
                            selectedValue === "Info" ? "#3576BA" : "white",
                          textAlign: "center",
                          padding: "5px 10px",
                          borderRadius: "5px",
                          color: selectedValue === "Info" ? "white" : "black",
                        }}
                      >
                        Info
                      </div>
                    </MenuItem>
                    <MenuItem value={"References"}>
                      <div
                        style={{
                          backgroundColor:
                            selectedValue === "References"
                              ? "#3576BA"
                              : "white",
                          textAlign: "center",
                          padding: "5px 10px",
                          borderRadius: "5px",
                          color:
                            selectedValue === "References" ? "white" : "black",
                        }}
                      >
                        References
                      </div>
                    </MenuItem>
                    <MenuItem value={"History"}>
                      <div
                        style={{
                          backgroundColor:
                            selectedValue === "History" ? "#3576BA" : "white",
                          textAlign: "center",
                          padding: "5px 10px",
                          borderRadius: "5px",
                          color:
                            selectedValue === "History" ? "white" : "black",
                        }}
                      >
                        Revision History
                      </div>
                    </MenuItem>
                  </MuiSelect>
                </FormControl>
              </div>
            )}
            {matches ? (
              " "
            ) : (
              <div style={{ marginTop: "15px" }}>
                {selectedValue === "Steps" ? (
                  <div>
                    <>
                      {/* { */}
                      {/* isNewJob && ( */}
                      <Form form={hiraForm} component={false}>
                        <div
                          className={classes.tableContainer}
                          id="table1"
                          ref={ref4}
                        ></div>

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
                          {hiraTableData?.map((record: any) => (
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
                                // onClick={() => }
                                style={{
                                  padding: "3px 10px",
                                  backgroundColor: "#9FBFDF",
                                  borderRadius: "2px",
                                  cursor: "pointer",
                                }}
                              >
                                {record?.jobBasicStep}
                              </p>

                              <p>Risk Type : {record?.hazardName || "N/A"}</p>
                              <p>
                                Hazard Description :{" "}
                                {record?.hazardDescription || "N/A"}
                              </p>
                              <p>
                                P*S (Base Risk) :{" "}
                                <span
                                  onClick={() =>
                                    toggleScoreModal(record, "pre")
                                  }
                                >
                                  {record?.preSeverity *
                                    record?.preProbability || "N/A"}
                                </span>{" "}
                              </p>
                              <p>
                                Responsible Person :{" "}
                                {(!record.type &&
                                  record?.responsiblePersonName) ||
                                  ""}{" "}
                              </p>
                              <p>
                                P*S (Residual Risk) :{" "}
                                <span
                                  onClick={() =>
                                    toggleScoreModal(record, "post")
                                  }
                                >
                                  {record?.postSeverity *
                                    record?.postProbability || "N/A"}
                                </span>{" "}
                              </p>
                            </div>
                          ))}
                        </div>
                        <div className={classes.pagination}>
                          <Pagination
                            size="small"
                            current={pagination?.current}
                            pageSize={pagination?.pageSize}
                            total={pagination?.total}
                            showTotal={showTotal}
                            showSizeChanger
                            showQuickJumper
                            onChange={(page, pageSize) => {
                              handleChangePageNew(page, pageSize);
                            }}
                          />
                        </div>
                      </Form>
                      {/* )}   */}
                    </>
                  </div>
                ) : (
                  ""
                )}
                {selectedValue === "Info" ? (
                  <div>
                    <>
                      {isTableDataLoaded &&
                        selectedHiraId &&
                        !isNewJob &&
                        !hideHeaderInAllMode && (
                          <div ref={ref5ForViewJob}>
                            <Descriptions
                              bordered
                              size="small"
                              className={classes.descriptionItemStyle}
                              column={{
                                xxl: 3,
                                xl: 3,
                                lg: 2,
                                md: 2,
                                sm: 1,
                                xs: 1,
                              }}
                            >
                              {!hiraWithStepsLoading && (
                                <Descriptions.Item
                                  label="Created By:"
                                  style={{
                                    textTransform: "capitalize",
                                  }}
                                >
                                  {hiraRegisterData?.createdByUserDetails
                                    ?.firstname +
                                    " " +
                                    hiraRegisterData?.createdByUserDetails
                                      ?.lastname || "N/A"}{" "}
                                </Descriptions.Item>
                              )}
                              <Descriptions.Item
                                label="Reviewed By:"
                                style={{
                                  textTransform: "capitalize",
                                }}
                              >
                                {getReviewedByDetails()?.reviewedBy || "N/A"}
                              </Descriptions.Item>

                              <Descriptions.Item
                                label="Approved By :"
                                style={{
                                  textTransform: "capitalize",
                                }}
                              >
                                {getApprovedByDetails()?.approvedBy || "N/A"}
                              </Descriptions.Item>
                              {!hiraWithStepsLoading && (
                                <Descriptions.Item label="Created On : ">
                                  {hiraRegisterData?.createdAt
                                    ? moment(
                                        hiraRegisterData?.createdAt
                                      ).format("DD/MM/YYYY HH:mm")
                                    : "N/A"}
                                </Descriptions.Item>
                              )}
                              <Descriptions.Item label="Reviewed On : ">
                                {getReviewedByDetails()?.reviewedOn || "N/A"}
                              </Descriptions.Item>
                              <Descriptions.Item label="Approved On :">
                                {getApprovedByDetails()?.approvedOn || "N/A"}
                              </Descriptions.Item>
                            </Descriptions>
                          </div>
                        )}
                    </>
                  </div>
                ) : (
                  ""
                )}
                {selectedValue === "References" ? (
                  <div>
                    <HiraReferences
                      drawer={referencesDrawer}
                      workflowStatus={hiraRegisterData?.workflowStatus}
                      checkIfUserCanAddReference={checkIfUserCanAddReferenceNew}
                      hiraId={hiraRegisterData?._id}
                    />
                  </div>
                ) : (
                  ""
                )}
                {selectedValue === "History" ? (
                  <div>
                    <HiraConsolidatedWorkflowHistoryDrawer
                      consolidatedWorkflowHistoryDrawer={{
                        open: true,
                        data: hiraRegisterData,
                      }}
                      handleConsolidatedCloseWorkflowHistoryDrawer={
                        handleConsolidatedCloseWorkflowHistoryDrawer
                      }
                    />
                  </div>
                ) : (
                  ""
                )}
              </div>
            )}
            <div
              style={
                matches
                  ? {
                      position: "absolute",
                      top: "-4px",
                      right: "10px",
                    }
                  : {
                      position: "absolute",
                      top: "-50px",
                      left: "10px",
                    }
              }
            >
              <div
                style={{
                  display: "flex",
                }}
              >
                <Input
                  size="small"
                  style={{ marginRight: "10px" }}
                  value={search}
                  allowClear
                  placeholder="Search Step"
                  onChange={(event) => {
                    // Check if the input has been cleared
                    if (event.target.value === "") {
                      handleClearSearchForSteps(); // Call the handleClear function when the input is cleared
                    }
                    setSearch(event.target.value);
                  }}
                  prefix={<MdSearch />}
                  suffix={
                    <Button
                      type="text"
                      className={classes.searchIcon}
                      icon={<MdSend />}
                      onClick={() => handleSearch()}
                    />
                  }
                />
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  const renderRiskActionsButtons = () => {
    return (
      <>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            float: "right",
            justifyContent: "flex-end",
          }}
        >
          {hiraInWorkflowLoading ? (
            <>
              <CircularProgress />
            </>
          ) : (
            <>
              {showStartReviewButton() && (
                <Button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "#003566",
                    color: "white",
                  }}
                  onClick={handleStartReviewNew}
                  ref={refStartWorkflowButton}
                >
                  Start Review/Approval
                </Button>
              )}

              {showReviseHiraButton() && (
                <Button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "#003566",
                    color: "white",
                  }}
                  onClick={handleStartReviewNew}
                  ref={refReviseButton}
                >
                  Revise Risk
                </Button>
              )}

              {showGoToWorkflowPageButton() && (
                <Button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "#003566",
                    color: "white",
                  }}
                  onClick={handleGoToWorkflowPageClick}
                >
                  Go To Workflow Page
                </Button>
              )}
              {activeModules?.includes("AI_FEATURES") && (
                <>
                  {selectedHiraId && (
                    <Button
                      style={{
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: "#003566",
                        color: "white",
                      }}
                      icon={
                        <MdOutlineRecommend
                          style={{ width: "18px", height: "18px" }}
                        />
                      }
                      onClick={handleAddHiraToMilvus}
                      loading={isLoadingForMilvus}
                    >
                      Accept Recommendation
                    </Button>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </>
    );
  };

  const renderComponents = () => {
    return (
      <>
        {!!riskScoreModal.open && (
          <>
            <RiskScoreModal
              preMitigationScoreModal={riskScoreModal}
              toggleScoreModal={toggleScoreModal}
              existingRiskConfig={existingRiskConfig}
              selectedCell={selectedCell}
              setSelectedCell={setSelectedCell}
              handleOk={handleOk}
              handleSaveScore={handleSaveScore}
              riskScoreModal={riskScoreModal}
            />
          </>
        )}
        <ConfirmDialog
          open={deleteConfirmDialogOpen}
          handleClose={handleCloseDeleteConfirmDialog}
          handleDelete={handleDeleteJob}
          text={
            jobToBeDeleted?.currentVersion > 0
              ? "Previous Version will become active and this version will be deleted"
              : null
          }
        />

        <Modal
          title="Risk Types Info"
          centered
          open={hazardTypeTableModal}
          onCancel={() => {
            setHazardTypeTableModal(false);
          }}
          width={800}
          closeIcon={
            <img
              src={CloseIconImageSvg}
              alt="close-drawer"
              style={{ width: "36px", height: "38px", cursor: "pointer" }}
            />
          }
          footer={null}
        >
          <div style={{ height: "40vh", overflowY: "auto" }}>
            <div className={classes.tableContainer}>
              <Table
                columns={hazardTypesColumns}
                dataSource={hazardTypeTableData}
                pagination={false}
                size="small"
                rowKey={"id"}
              />
            </div>
          </div>
        </Modal>

        {chatModalOpen && (
          <HiraChatModal
            chatModalOpen={chatModalOpen}
            toggleChatModal={toggleChatModal}
          />
        )}
        {consolidatedWorkflowHistoryDrawer?.open && (
          <HiraHistoryDrawerForAllView
            consolidatedWorkflowHistoryDrawer={
              consolidatedWorkflowHistoryDrawer
            }
            handleConsolidatedCloseWorkflowHistoryDrawer={
              handleConsolidatedCloseWorkflowHistoryDrawer
            }
            riskConfig={existingRiskConfig}
          />
        )}
        {!!hiraWorkflowCommentsDrawer.open && (
          <HiraWorkflowCommentsDrawer
            commentDrawer={hiraWorkflowCommentsDrawer}
            setCommentDrawer={setHiraWorkflowCommentsDrawer}
            toggleCommentsDrawer={toggleCommentsDrawer}
          />
        )}
        {!!changeWorkflowPeopleModal && (
          <ChangeReviewerApproverModal
            changeWorkflowPeopleModal={changeWorkflowPeopleModal}
            setChangeWorkflowPeopleModal={setChangeWorkflowPeopleModal}
            hiraData={selectedHiraData}
            reloadAllHiraTableData={reloadAllHiraTableData}
          />
        )}
      </>
    );
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100vh",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <RiskSideNav
          activeTab={activeTab}
          setActiveTab={(tabKey: string) => {
            setActiveTab(tabKey);
            // If it's not the settings tab, update the selected category and filters
            if (tabKey !== "settings") {
              handleCategoryChange(tabKey);
            }
          }}
          collapseLevel={collapseLevel}
          isSettingsAccess={isMCOE || isMR}
          onSettingsClick={configHandler}
          categoryOptions={categoryOptions}
        />
        <div
          style={{
            position: "absolute", // <- Makes it float above content
            top: 4,
            left: collapseLevel === 2 ? 0 : collapseLevel === 1 ? 60 : 88,
            zIndex: 10,
            // backgroundColor: "#fff",
            // border: "1px solid #ccc",
            // borderRadius: "50%",
            width: 55,
            height: 55,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            // boxShadow: "0 0 4px rgba(0,0,0,0.1)",
            cursor: "pointer",
            transition: "left 0.3s ease",
          }}
          onClick={() => setCollapseLevel((prev) => (prev + 1) % 3)}
        >
          {collapseLevel === 2 ? (
            <RiSidebarUnfoldLine size={24} />
          ) : (
            <RiSidebarFoldLine size={24} />
          )}
        </div>
        <div
          style={{
            flex: 1,
            marginLeft: "10px",
            overflow: "auto",
          }}
        >
          {/* 1. Render the full row wrapper */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              marginTop: "10px",
              bgcolor: "background.paper",
            }}
          >
            {/* 3. MIDDLE: Back button if hideFilters */}
            {hideFilters && (
              <Button
                onClick={handleBackClick}
                style={{
                  marginLeft: "10px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <MdChevronLeft fontSize="small" />
                Back
              </Button>
            )}

            {/* 4. RIGHT: All other buttons/icons */}
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                marginRight: "15px",
              }}
            >
              {(selectedHiraId || hiraRegisterData?._id) && matches && (
                <>
                  <Tooltip title={"Export to PDF"}>
                    <IconButton
                      onClick={handleExport}
                      style={{ padding: "10px", color: "red" }}
                    >
                      <FaRegFilePdf width={20} height={20} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={"Export to Excel"}>
                    <IconButton
                      onClick={handleExportToExcel}
                      style={{ padding: "10px", color: "green" }}
                    >
                      <AiOutlineFileExcel width={20} height={20} />
                    </IconButton>
                  </Tooltip>
                </>
              )}
              {!hideFilters && matches && (
                <>
                  <Button
                    type="default"
                    onClick={handleCreateHandlerNew}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      backgroundColor: "#003566",
                      color: "white",
                      marginRight: "5px",
                    }}
                  >
                    Create
                  </Button>
                  {/* <Button
                    type="default"
                    onClick={() => navigate("/risk/riskregister/HIRA/import")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      backgroundColor: "#003566",
                      color: "white",
                      marginRight: "5px",
                    }}
                  >
                    Import
                  </Button> */}
                </>
              )}
              <div style={{ marginRight: "10px" }}>
                <Tooltip title="Risk Types Info!" color="blue">
                  <IconButton
                    aria-label="help"
                    onClick={() => setHazardTypeTableModal(true)}
                  >
                    <MdInfo style={{ fill: "#003566" }} />
                  </IconButton>
                </Tooltip>
              </div>
              {!matches && !selectedHiraId && (
                <FilterIcon
                  style={{ width: "24px", height: "24px", marginTop: "3px" }}
                  onClick={showModal}
                />
              )}
              {selectedHiraId && matches && (
                <>
                  <div style={{ marginRight: "20px" }}>
                    <span style={{ fontWeight: "bold" }}>Risk Number: </span>
                    {hiraRegisterData?.prefixSuffix || "N/A"}
                  </div>
                  <div ref={ref2ForViewJob}>{renderHiraStatusTag()}</div>
                </>
              )}
            </div>
          </Box>

          {matches ? (
            ""
          ) : (
            <div style={{ width: "100%", marginTop: "5px" }}>
              <span style={{ fontWeight: "bold" }}>Risk Number: </span>
              {hiraRegisterData?.prefixSuffix || "N/A"}
            </div>
          )}
          {isLoading || isOptionsLoading ? (
            <Box
              width={350}
              height={150}
              display="flex"
              justifyContent="center"
              alignItems="center"
              style={{ margin: "auto" }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Space
                direction="vertical"
                size="small"
                style={{ display: "flex", marginTop: "20px" }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {renderRiskTableFilterForm()}

                  {renderRiskActionsButtons()}

                  {renderSearchAndAiChatForAllRisks()}
                </div>
                <>
                  {hiraWithStepsLoading ? (
                    <Skeleton active />
                  ) : (
                    <>
                      {renderRiskHeaderForm()}

                      {renderShowStepRequireMessage()}

                      {renderRiskDesktopAndMobileTabsSection()}
                    </>
                  )}
                </>
              </Space>
              {showExportLoader && (
                <Box
                  width={350}
                  height={150}
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  style={{ margin: "auto" }}
                >
                  <CircularProgress />
                </Box>
              )}
              {renderAllRisksTableAndPagination()}
            </>
          )}

          {renderComponents()}
        </div>
      </div>
    </>
  );
};

export default HiraRegisterPagev2;

/**
 * bug fix commit
 */
