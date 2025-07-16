import { makeStyles, Theme } from "@material-ui/core/styles";
import { MdExpandMore, MdPermContactCalendar } from "react-icons/md";
import ModuleHeader from "../../components/Navigation/ModuleHeader";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { FaUserGroup } from "react-icons/fa6";
import { GiStarShuriken } from "react-icons/gi";
import {
  AiOutlineWarning,
  AiOutlineFund,
  AiOutlineFilter,
  AiFillFilter,
  AiOutlinePlusCircle,
  AiOutlineMinusCircle,
} from "react-icons/ai";
import checkRole from "utils/checkRoles";
import { roles } from "utils/enums";
import { ReactComponent as FilterIcon } from "../../assets/documentControl/Filter.svg";
import CloseIconImageSvg from "../../assets/documentControl/Close.svg";
import { useNavigate } from "react-router-dom";
import CaraDrawer from "components/CaraDrawer";
import HindalcoLogoSvg from "assets/logo/HindalcoLogoSvg.svg";

import {
  Pagination,
  PaginationProps,
  Popconfirm,
  Table,
  Tag,
  Tour,
  TourProps,
  Button,
  Modal,
  Input,
} from "antd";
import { ColumnsType } from "antd/es/table";

import axios from "apis/axios.global";

import { MdOutlinePictureAsPdf } from "react-icons/md";

import { ReactComponent as OrgSettingsIcon } from "assets/moduleIcons/module-setting.svg";
import { ReactComponent as SelectedTabArrow } from "assets/icons/SelectedTabArrow.svg";
import { ReactComponent as CAPAIcon } from "assets/appsIcon/Corrective & Preventive action.svg";
import {
  Box,
  Tooltip,
  Grid,
  FormControl,
  TextField,
  Paper,
  IconButton,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@material-ui/core";
import { MdSearch } from "react-icons/md";
import { Autocomplete } from "@material-ui/lab";
import YearComponent from "components/Yearcomponent";
import getYearFormat from "utils/getYearFormat";
import { MdForum } from "react-icons/md";
import getAppUrl from "utils/getAppUrl";

import { ReactComponent as CustomEditIcon } from "assets/documentControl/Edit.svg";
import { ReactComponent as CustomDeleteICon } from "assets/documentControl/Delete.svg";
import { API_LINK } from "config";
import { useSnackbar } from "notistack";
import checkRoles from "utils/checkRoles";
import { MdOutlinePermContactCalendar } from "react-icons/md";
import printJS from "print-js";

import CaraActionitemDrawer from "components/CaraDrawer/CaraActionitemDrawer";
import { useMediaQuery } from "@material-ui/core";
import { useRecoilState } from "recoil";
import { caraRegistrationForm } from "recoil/atom";
import CapaChatModal from "components/CapaChatModal";
const useStyles = makeStyles<Theme>((theme: Theme) => ({
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
  root: {
    width: "100%",
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
  documentTable: {
    // overflowX: "auto",
    // "&::-webkit-scrollbar": {
    //   width: "5px",
    //   height: "10px", // Adjust the height value as needed
    //   backgroundColor: "white",
    // },
    height: "100%",
    "&::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "grey",
    },
  },
  textIconContainer: {},

  docNavIconStyle: {
    width: "21px",
    height: "22px",
    // fill : "white",
    // paddingRight: "6px",
    cursor: "pointer",
  },
  docNavDivider: {
    top: "0.54em",
    height: "1.5em",
    background: "black",
  },
  pagination: {
    position: "fixed",
    bottom: "3px",
    right: "0",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "inherit",
    padding: theme.spacing(1),
  },
  docNavText: {
    fontSize: "16px",
    letterSpacing: "0.3px",
    lineHeight: "24px",
    textTransform: "capitalize",
    marginLeft: "5px",
    fontWeight: 600,
  },
  docNavRightFlexBox: {
    display: "flex",
    flexDirection: "row",
    alignItems: "left",
    marginLeft: "auto",
  },
  selectedTab: {
    color: "#334D6E",
  },
  header: {
    display: "flex",
    alignItems: "left",
  },
  moduleHeader: {
    color: "#000",
    fontSize: "24px",
    // fontFamily: "Poppins, sans-serif",
    lineHeight: "24px",
    paddingLeft: "6px",
  },
  modal: {
    "&.ant-modal .ant-modal-content": {
      padding: "0px 0px 10px 0px",
    },
  },
  summaryRoot: {
    display: "flex",
    padding: "0px 16px",
    minHeight: 30,

    fontSize: "17px",
    "& .MuiAccordionSummary-content": {
      margin: 0,
    },
    "&.MuiAccordionSummary-content .Mui-expanded": {
      margin: "5px 0px",
      minHeight: "10px",
    },
    "&.MuiButtonBase-root .MuiAccordionSummary-root .Mui-expanded": {
      minHeight: "10px",
    },
    "&.MuiAccordionSummary-root": {
      minHeight: "30px",
    },
  },
  headingRoot: {
    minHeight: 30,
    "&.MuiAccordionSummary-content .Mui-expanded": {
      margin: "10px 0px",
      minHeight: "30px",
    },
    "&.MuiAccordionSummary-root.Mui-expanded": {
      minHeight: "30px",
      margin: "10px 0px",
    },
  },
}));
const CaraHomePage = () => {
  const matches = useMediaQuery("(min-width:822px)");
  const smallScreen = useMediaQuery("(min-width:450px)");
  const [collapseLevel, setCollapseLevel] = useState(0);
  const [value, setValue] = useState(0);
  const [searchValue, setSearchValue] = useState<string>("");
  const location = useLocation();
  // const [currentModuleName, setCurrentModuleName] = useState("CAPA Management");
  const [acitveTab, setActiveTab] = useState<any>("1");
  // const [drawer, setDrawer] = useState<boolean>(false);

  const [readMode, setReadMode] = useState<boolean>(false);
  const allOption = { id: "All", locationName: "All" };
  const allDeptOption = { id: "All", entityName: "All" };
  const [expandDataValues, setExpandDataValues] = useState<any>(
    location.state?.dataValues ?? {}
  );
  const [openAction, setOpenAction] = useState(false);
  // const [optionsData, setOptionsData] = useState<any>([]);
  const [dataSource, setDataSource] = useState<any>([]);
  const [formdata, setformdata] = useRecoilState(caraRegistrationForm);
  // console.log("dataSource", dataSource);
  // const [kpis, setKpis] = useState<any>([]);
  // const [system, setSystems] = useState<any>([]);
  // const [users, setUsers] = useState<any>([]);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [drawer, setDrawer] = useState<any>({
    mode: "create",
    data: {},
    open: false,
  });
  const [isUpload, setUpload] = useState<boolean>(false);
  const [editData, setEditData] = useState<any>({});
  const loggedInUser = JSON.parse(sessionStorage.getItem("userDetails") as any);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const orgId = sessionStorage.getItem("orgId");
  const navigate = useNavigate();
  const classes = useStyles();
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const [activeModules, setActiveModules] = useState<any>([]);
  const [unitId, setUnitId] = useState<string>(loggedInUser?.location?.id);
  const [locationOptions, setLocationOptions] = useState<any[]>([]);
  const [deptId, setDeptId] = useState<string>(loggedInUser?.entity?.id);
  const [deptOptions, setDeptOptions] = useState<any[]>([]);
  const [currentYear, setCurrentYear] = useState<any>();
  const [approvalRequired, setApprovalRequired] = useState<boolean>(false);
  const [approver, setApprover] = useState<any>({});
  const realmName = getAppUrl();
  const { enqueueSnackbar } = useSnackbar();
  const [count, setCount] = useState<number>(0);
  const isMr = checkRole(roles.MR);
  const isGeneral = checkRole(roles.GENERALUSER);
  const [chatModalOpen, setChatModalOpen] = useState<boolean>(false);
  const [pdfData, setPdfData] = useState<any>({});
  const [actionPointsPdfData, setActionPointsPdfData] = useState<any>();
  const [selectedData, setSelectedData] = useState<any>();
  const [actionItemData, setActionItemData] = useState<any[]>([]);
  const [actionItemDrawer, setActionItemDrawer] = useState<boolean>(false);
  const [actionItemRecordData, setActionItemRecordData] = useState<any>({});

  const [filterList, setFilterList] = useState<any>([]);
  const [read, setRead] = useState<boolean>(true);
  const [selectedEntity, setselectedEntity] = useState<any>([]);
  const [isFilterEntity, setfilterEntity] = useState<boolean>(false);
  const [selectedUnit, setselectedUnit] = useState<any>([]);
  const [isFilterUnit, setfilterUnit] = useState<boolean>(false);
  const [selectedOrigin, setselectedOrigin] = useState<any>([]);
  const [isFilterOrigin, setfilterOrigin] = useState<boolean>(false);
  const [selectedOwner, setselectedOwner] = useState<any>([]);
  const [isFilterOwner, setfilterOwner] = useState<boolean>(false);
  const [selectedStatus, setselectedStatus] = useState<any>([]);
  const [isFilterStatus, setfilterStatus] = useState<boolean>(false);
  const [logo, setLogo] = useState<any>(null);

  const getLogo = async () => {
    const realm = getAppUrl();
    const response = await axios.get(`/api/organization/${realm}`);
    setLogo(response.data.logoUrl);
  };

  // useEffect(() => {
  //   getyear();
  //   getLocationOptions();
  // }, [currentYear]);
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
        return "Draft";
      case "Sent_For_Approval":
        return "Validated and dropped";
      case "Closed":
        return "Validated and dropped";
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
  const handleLocation = (event: any, values: any) => {
    // console.log("selected location", values);
    if (values && values?.id) {
      setUnitId(values?.id);
    }
    if (values?.id === "All") {
      setDeptId(values?.id);
    }
    // const url = `api/cara/getAllCara?orgid=${loggedInUser.organizationId}&currentYear=${currentYear}&locationId=${unitId}&page=${page}&limit=10`;
    // getData(url);
  };
  const expandIcon = ({ expanded, onExpand, record }: any) => {
    const icon = expanded ? <AiOutlineMinusCircle /> : <AiOutlinePlusCircle />;
    const match = record.actionItem;
    if (match?.length > 0) {
      return <a onClick={(e) => onExpand(record, e)}>{icon}</a>;
    }
    return null;
  };

  const handleDepartment = (event: any, values: any) => {
    //console.log("selected department", values);
    if (values && values?.id) {
      setDeptId(values?.id);
    }
    // const url = `api/cara/getAllCara?orgid=${loggedInUser.organizationId}&currentYear=${currentYear}&locationId=${unitId}&page=${page}&limit=10`;
    // getData(url);
  };
  // console.log("selected location", unitId);
  const getyear = async () => {
    const currentyear = await getYearFormat(new Date().getFullYear());
    setCurrentYear(currentyear);
  };
  const getWorkflowConfig = async () => {
    try {
      const result = await axios.get(
        `/api/cara/getWorkflowConfig/${loggedInUser.organizationId}`
      );
      //   console.log("getworkflowconfig", result?.data);
      if (result?.data) {
        setApprovalRequired(result?.data?.executiveApprovalRequired);
        setApprover(result?.data?.executive);
      }
    } catch (error) {
      // console.log("error", error);
    }
  };
  const getLocationOptions = async () => {
    await axios(`/api/location/getLocationsForOrg/${realmName}`)
      .then((res) => {
        setLocationOptions(res?.data);
      })
      .catch((err) => console.error(err));
  };
  // const getActionITemData = async () => {
  //   try {
  //     const actionItems: any = await axios.get(
  //       `/api/actionitems/getActionItemForSource?source=CAPA&orgId=${orgId}&page=${page}&limit=${limit}&unitId=${loggedInUser.locationId}&currentYear=${currentYear}`
  //     );
  //     // console.log("actionitems", actionItems);
  //     if (actionItems.length > 0) {
  //       setActionItemData(actionItems);
  //     }
  //   } catch (error) {
  //     enqueueSnackbar(`Error fetching action items`, { variant: "error" });
  //   }
  // };
  const getDepartmentOptions = async () => {
    try {
      if (unitId) {
        // console.log("unitId", unitId);
        const result = await axios(
          `/api/cara/getEntitiesForLocation/${unitId}`
        );

        setDeptOptions(result?.data);
      }
    } catch (error) {
      enqueueSnackbar("Error fetching entities", { variant: "error" });
    }
  };
  // const getOriginData = async () => {
  //   try {
  //     let res = await axios.get(`/api/cara/getAllDeviationType`);
  //     if (res?.data) {
  //       // const val = res?.data.map((item: any) => {
  //       //   return {
  //       //     deviationType: item.deviationType,
  //       //     organizationId: item.organizationId,
  //       //     id: item._id,
  //       //     description: item.description,
  //       //   };
  //       // });
  //       // console.log("optionsdata", res?.data);
  //       setOptionsData(res?.data);
  //     }
  //   } catch (err) {
  //     enqueueSnackbar(`Error While Fetching Data`, { variant: "error" });
  //   }
  // };
  const fetchFilterList = async () => {
    try {
      // console.log("fetchfilterlist called");
      const response = await axios.get(
        `api/cara/getFilterListForCapa?unitId=${unitId}&entityId=${deptId}`
      );
      // console.log("filterresponse", response.data);
      setFilterList(response?.data);
    } catch (error) {
      console.log("error", error);
    }
  };
  const getSelectedItem = () => {
    const item = [allOption, ...locationOptions].find((opt: any) => {
      if (opt.id === unitId) return opt;
    });
    // console.log("item", item);

    return item || {};
  };
  // console.log("unitId", unitId);
  // console.log("locationOptions", locationOptions);
  const getDeptSelectedItem = () => {
    const item = [allDeptOption, ...deptOptions].find((opt: any) => {
      if (opt.id === deptId) return opt;
    });
    return item || {};
  };
  // const checkAdvanceOrBasic = async (locationId: any) => {
  //   const result = await axios.get(
  //     `api/cara/getRcaSettingsForLocation/${locationId}`
  //   );
  //   if (result.status === 200 || result.status === 201) {
  //     if (result.data === "Advanced") {
  //       return true;
  //     } else {
  //       return false;
  //     }
  //   }
  //   // console.log("checkAdvanceOrBasic", result);
  // };
  const handleSearchChange = (e: any) => {
    e.preventDefault();
    setSearchValue(e.target.value);
    if (
      e.target.value === "" ||
      e.target.value == undefined ||
      e.target.value === null
    ) {
      const url = `api/cara/getAllCara?orgid=${loggedInUser.organizationId}&currentYear=${currentYear}&locationId=${unitId}&entityId=${deptId}&page=${page}&limit=${limit}`;
      getData(url);
    }
  };
  const handleEditActionItem = (data: any) => {
    // console.log("data", data);
    const isActiveUserOwner = data?.owner.some(
      (user: any) => user.id === loggedInUser.id
    );
    // console.log("isActiveUSer", isActiveUserOwner);
    if (isActiveUserOwner) {
      setRead(false);
      setActionItemDrawer(true);
      setActionItemRecordData(data);
    } else {
      setRead(true);
      setActionItemDrawer(true);
      setActionItemRecordData(data);
    }
  };
  const handleDelete = async (data: any) => {
    const id = data?._id;
    // console.log("data in delete", data?._id);

    try {
      const res = await axios.delete(`${API_LINK}/api/cara/deleteCara/${id}`);
      if (res.status === 200) {
        enqueueSnackbar(`Deleted CAPA Successfully!`, {
          variant: "success",
        });
        const url = `api/cara/getAllCara?orgid=${loggedInUser.organizationId}&currentYear=${currentYear}&locationId=${unitId}&entityId=${deptId}&page=${page}&limit=${limit}`;
        getData(url);
      }
    } catch (error) {
      enqueueSnackbar(`Error in deleting CAPA! `, {
        variant: "error",
      });
    }
  };
  const handleCloseDrawer = () => {
    setActionItemDrawer(false);
  };
  const getStatusColor = (status: any) => {
    switch (status) {
      case "Open":
        return "#b3d9ff";
      case "Accepted":
        return "#ccffe6";
      case "Rejected":
        return "#ffe6e6";
      case "Analysis_In_Progress":
        return "#ffffcc";
      case "Outcome_In_Progress":
        return "#ffffb3";
      case "Draft":
        return "#e6f2ff";
      case "Sent_For_Approval":
        return "#00b33c";
      case "Closed":
        return "#ccccff";
      default:
        return "";
    }
  };

  const handlePagination = (pagevalue: any, size: any) => {
    setPage(pagevalue);
    setLimit(size);
    // const url = `api/cara/getAllCara?orgid=${loggedInUser.organizationId}&currentYear=${currentYear}&locationId=${unitId}&entityId=${deptId}&page=${pagevalue}&limit=${size}`;
    // getData(url);
  };
  const subRowColumns: ColumnsType<any> = [
    {
      title: "Corrective Action",
      dataIndex: "title",
      key: "title",
      render: (_: any, record: any) => (
        // record.action ? (
        <Tooltip title={record.title}>
          <div
            style={{
              textDecorationLine: "underline",
              cursor: "pointer",
              width: 130,
            }}
          >
            <div
              className={classes.clickableField}
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              onClick={() => {
                handleEditActionItem(record);
              }}
            >
              {record.title}
            </div>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Target Date",
      dataIndex: "targetDate",
      key: "targetDate",
      render: (_: any, record: any) => record.targetDate || "",
    },
    {
      title: "Responsible Person",
      dataIndex: "owner",
      render: (_: any, record: any) => (
        <div
          style={{
            width: 100,
          }}
        >
          <div
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {record?.owner?.map((owner: any, index: number) => (
              <div key={index}>{owner?.username}</div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (_: any, record: any) => {
        if (record?.status === true) {
          return (
            <Tag
              style={{ backgroundColor: "#7cbf3f" }}
              key={record.status}
              className={classes.statusTag}
            >
              Open
            </Tag>
          );
        } else {
          return (
            <Tag
              style={{ backgroundColor: "#FF0000" }}
              key={record.status}
              className={classes.statusTag}
            >
              Closed
            </Tag>
          );
        }
      },
    },
  ];
  const showTotal: PaginationProps["showTotal"] = (total: any) =>
    `Total ${total} items`;
  const columns: any = [
    {
      title: "Problem Statement",
      dataIndex: "title",
      width: 150,
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
                setIsEdit(true);
                setEditData(data);
                navigate(`/cara/caraForm/${data._id}`, {
                  state: { readMode: true },
                });
                // setDrawer({
                //   mode: "edit",
                //   data: { ...data, id: data?._id },
                //   open: true,
                // });
                setReadMode(true);
              }}
              ref={refForcapa6}
            >
              {data.highPriority === true ? (
                <AiOutlineWarning
                  style={{ color: "red", marginRight: "5px" }}
                ></AiOutlineWarning>
              ) : (
                ""
              )}{" "}
              {data?.title}
            </div>
          </Tooltip>
        </>
      ),
    },

    {
      title: "Origin",
      dataIndex: "origin",
      width: 80,
      render: (_: any, record: any) => (
        <div
          style={{
            width: 100,
          }}
        >
          <div
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {record?.origin?.deviationType}
          </div>
        </div>
      ),
      filterIcon: (filtered: any) =>
        isFilterOrigin ? (
          <AiFillFilter style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <AiOutlineFilter style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }: any) => {
        return (
          <div
            style={{
              padding: 8,
              maxHeight: 200, // Set the maximum height of the container
              overflowY: "auto", // Enable vertical scrolling
            }}
          >
            {filterList?.origin?.map((item: any) => (
              <div key={item._id}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setselectedOrigin([...selectedOrigin, value]);
                      } else {
                        setselectedOrigin(
                          selectedOrigin.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={item._id}
                    checked={selectedOrigin.includes(item._id)}
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "5px",
                    }}
                  />
                  {item?.deviationType}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                type="primary"
                disabled={selectedOrigin.length === 0}
                onClick={() => {
                  setfilterOrigin(!isFilterOrigin);
                  handlePagination(1, 10);
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
                  setselectedOrigin([]);
                  // fetchDocuments();
                  setfilterOrigin(!isFilterOrigin);
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

    ,
    // {
    //   title: "Type",
    //   dataIndex: "type",
    //   width: 50,
    //   render: (_: any, data: any, index: number) => (
    //     <>
    //       <div>{data?.type}</div>
    //     </>
    //   ),
    // },

    // {
    //   title: "Deviation From",
    //   dataIndex: "deviationFromDate",
    //   width: 100,
    //   render: (_: any, data: any, index: number) => (
    //     <>
    //       <div>
    //         {data?.startDate
    //           ? moment(data?.startDate).format("DD-MM-YYYY")
    //           : "N/A"}
    //       </div>
    //     </>
    //   ),
    // },
    // Table.EXPAND_COLUMN,
    // {
    //   title: "Deviation To",
    //   dataIndex: "deviationToDate",
    //   width: 100,
    //   render: (_: any, data: any, index: number) => (
    //     <div>
    //       {data?.endDate ? moment(data.endDate).format("DD-MM-YYYY") : "N/A"}
    //     </div>
    //   ),
    // },
    // {
    //   title: "Description",
    //   dataIndex: "description",
    //   width: 250,
    // },
    {
      title: "Unit/Corp Func",
      dataIndex: "locationId",
      width: 100,
      render: (_: any, record: any) => (
        <div
          style={{
            width: 100,
          }}
        >
          <div
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {record?.locationDetails?.locationName}
          </div>
        </div>
      ),
      filterIcon: (filtered: any) =>
        isFilterUnit ? (
          <AiFillFilter style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <AiOutlineFilter style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }: any) => {
        return (
          <div
            style={{
              padding: 8,
              maxHeight: 200, // Set the maximum height of the container
              overflowY: "auto", // Enable vertical scrolling
            }}
          >
            {filterList?.location?.map((item: any) => (
              <div key={item.id}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setselectedUnit([...selectedUnit, value]);
                      } else {
                        setselectedUnit(
                          selectedUnit.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={item.id}
                    checked={selectedUnit.includes(item.id)}
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "5px",
                    }}
                  />
                  {item?.locationName}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                type="primary"
                disabled={selectedUnit.length === 0}
                onClick={() => {
                  setfilterUnit(!isFilterUnit);
                  handlePagination(1, 10);
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
                  setselectedUnit([]);
                  // fetchDocuments();
                  setfilterUnit(!isFilterUnit);
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
      title: "Registered By",
      dataIndex: "registeredBy",
      width: 100,
      render: (_: any, data: any, index: number) => (
        <>
          <div>
            {data?.registeredBy?.firstname && data?.registeredBy.lastname
              ? data?.registeredBy?.firstname +
                " " +
                data?.registeredBy?.lastname
              : null}
          </div>
        </>
      ),
    },

    {
      title: "CAPA Owner",
      dataIndex: "caraOwner",
      width: 100,
      render: (_: any, record: any) => (
        <div
          style={{
            width: 100,
          }}
        >
          <div
          // style={{
          //   whiteSpace: "nowrap",
          //   overflow: "hidden",
          //   textOverflow: "ellipsis",
          // }}
          >
            {record?.caraOwner?.firstname
              ? record?.caraOwner?.firstname + " " + record.caraOwner.lastname
              : null}
          </div>
        </div>
      ),
      filterIcon: (filtered: any) =>
        isFilterOwner ? (
          <AiFillFilter style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <AiOutlineFilter style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }: any) => {
        return (
          <div
            style={{
              padding: 8,
              maxHeight: 200, // Set the maximum height of the container
              overflowY: "auto", // Enable vertical scrolling
            }}
          >
            {filterList?.owner?.map((item: any) => (
              <div key={item.id}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setselectedOwner([...selectedOwner, value]);
                      } else {
                        setselectedOwner(
                          selectedOwner.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={item.id}
                    checked={selectedOwner.includes(item.id)}
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "5px",
                    }}
                  />
                  {item?.username}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                type="primary"
                disabled={selectedOwner.length === 0}
                onClick={() => {
                  setfilterOwner(!isFilterOwner);
                  handlePagination(1, 10);
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
                  setselectedOwner([]);
                  // fetchDocuments();
                  setfilterOwner(!isFilterOwner);
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
      title: "Responsible Entity",
      dataIndex: "entityId",
      width: 100,
      render: (_: any, record: any) => (
        <div
          style={{
            width: 100,
          }}
        >
          <div
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {record?.entityId?.entityName}
          </div>
        </div>
      ),
      filterIcon: (filtered: any) =>
        isFilterEntity ? (
          <AiFillFilter style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <AiOutlineFilter style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }: any) => {
        return (
          <div
            style={{
              padding: 8,
              maxHeight: 200, // Set the maximum height of the container
              overflowY: "auto", // Enable vertical scrolling
            }}
          >
            {filterList?.entity?.map((item: any) => (
              <div key={item.id}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setselectedEntity([...selectedEntity, value]);
                      } else {
                        setselectedEntity(
                          selectedEntity.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={item.id}
                    checked={selectedEntity.includes(item.id)}
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "5px",
                    }}
                  />
                  {item?.entityName}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                type="primary"
                disabled={selectedEntity.length === 0}
                onClick={() => {
                  setfilterEntity(!isFilterEntity);
                  handlePagination(1, 10);
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
                  setselectedEntity([]);
                  // fetchDocuments();
                  setfilterEntity(!isFilterEntity);
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
      title: "Created Date",
      dataIndex: "createdAt",
      width: 100,
      render: (text: any, data: any, index: number) => {
        // console.log("data.createdAt", data?.createdAt);

        if (data?.createdAt) {
          const createdAtDate = new Date(data?.createdAt); // Ensure it's a Date object

          // Format the date to dd-mm-yyyy
          const day = String(createdAtDate.getDate()).padStart(2, "0");
          const month = String(createdAtDate.getMonth() + 1).padStart(2, "0"); // Months are 0-based, so we add 1
          const year = createdAtDate.getFullYear();

          const formattedDate = `${day}-${month}-${year}`;

          return <span>{formattedDate}</span>;
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
                  <AiOutlineWarning
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
      title: "Pending With",
      dataIndex: "pendingWith",
      width: 100,
      render: (_: any, data: any, index: number) => (
        <>
          <div>
            {data?.status === "Open" && (
              <p>
                {/* {data?.deptHead
                  ?.map((head: any) => head?.firstname + " " + head?.lastname)
                  .join(", ")} */}
                {data.caraCoordinator?.username}
              </p>
            )}

            {data?.status === "Accepted" &&
              (data?.rootCauseAnalysis ? (
                // data?.deptHead?.length > 0 && (
                <p>
                  {/* {data?.deptHead
                      .map(
                        (head: any) => head?.firstname + " " + head?.lastname
                      )
                      .join(", ")} */}
                  {data.caraCoordinator?.username}
                </p>
              ) : (
                // )
                <p>
                  {data?.caraOwner?.firstname + " " + data?.caraOwner?.lastname}
                </p>
              ))}
            {data?.status === "Analysis_In_Progress" &&
              (data?.rootCauseAnalysis ? (
                // data?.deptHead?.length > 0 && (
                //   <p>
                //     {data?.deptHead
                //       .map(
                //         (head: any) => head?.firstname + " " + head?.lastname
                //       )
                //       .join(", ")}
                //   </p>
                // )
                <p>{data.caraCoordinator?.username}</p>
              ) : (
                <p>
                  {data?.caraOwner?.firstname + " " + data?.caraOwner?.lastname}
                </p>
              ))}

            {data?.status === "Outcome_In_Progress" &&
              (data?.actualCorrectiveAction ? (
                data?.caraCoordinator ? (
                  <p>{data?.caraCoordinator?.username}</p>
                ) : (
                  data?.deptHead?.length > 0 && (
                    <p>
                      {data?.deptHead
                        .map(
                          (head: any) => head?.firstname + " " + head?.lastname
                        )
                        .join(", ")}
                    </p>
                  )
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
            {data?.status == "Sent_For_Approval" && approvalRequired && (
              <p>{approver?.fullname}</p>
            )}
          </div>
        </>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 40,
      render: (_: any, data: any, index: number) => (
        <>
          <Tag
            style={{
              backgroundColor: getStatusColor(data.status),
              color: "black",
              width: "150px",
              textAlign: "center",
            }}
            ref={refForcapa7}
          >
            {data?.status}
            {/* {getStatus(data?.status)} */}
          </Tag>
        </>
      ),
      filterIcon: (filtered: any) =>
        isFilterStatus ? (
          <AiFillFilter style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <AiOutlineFilter style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }: any) => {
        const uniqueStatusSet = new Set(filterList?.status);

        const uniqueStatus = Array.from(uniqueStatusSet);
        return (
          <div
            style={{
              padding: 8,
              maxHeight: 200, // Set the maximum height of the container
              overflowY: "auto", // Enable vertical scrolling
            }}
          >
            {uniqueStatus.map((status: any, index: any) => (
              <div key={index}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value: any = status;
                      if (e.target.checked) {
                        setselectedStatus([...selectedStatus, value]);
                      } else {
                        setselectedStatus(
                          selectedStatus.filter(
                            (selected: any) => selected !== value
                          )
                        );
                      }
                    }}
                    value={status}
                    checked={selectedStatus.includes(status)}
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "5px",
                    }}
                  />
                  {status}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                type="primary"
                disabled={selectedStatus.length === 0}
                onClick={() => {
                  setfilterStatus(!isFilterStatus);
                  handlePagination(1, 10);
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
                  setselectedStatus([]);

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
      title: "Actions",
      dataIndex: "actions",
      width: 50,
      render: (_: any, data: any, index: number) => (
        <>
          <div style={{ display: "flex", alignItems: "left" }}>
            {((data?.registeredBy?.id === loggedInUser?.id &&
              data?.status === "Draft") ||
              data?.caraOwner?.id === loggedInUser?.id ||
              data?.caraCoordinator?.id === loggedInUser?.id ||
              (data.status === "Sent_For_Approval" &&
                loggedInUser.id === approver?.id) ||
              (data?.deptHead?.some(
                (owner: any) => owner?.id === loggedInUser?.id
              ) &&
                data?.status !== "Rejected") ||
              (data?.status === "Rejected" &&
                data?.registeredBy?.id === loggedInUser?.id)) && (
              <IconButton
                style={{ padding: "0px" }}
                onClick={() => {
                  setIsEdit(true);
                  setEditData(data);
                  setReadMode(false);
                  navigate(`/cara/caraForm/${data._id}`);
                  //  console.log("data for edit in cara home", data);
                  // setDrawer({
                  //   mode: "edit",
                  //   data: { ...data, id: data?._id },
                  //   open: true,
                  // });
                }}
                ref={refForcapa8}
              >
                <Tooltip title="Update CAPA" placement="bottom">
                  <CustomEditIcon
                    style={{
                      marginRight: "2px",
                      fontSize: "15px",
                      height: "20px",
                    }}
                  />
                </Tooltip>
              </IconButton>
            )}

            {isOrgAdmin && (
              // <IconButton onClick={() => handleDelete(data)} ref={refForcapa9}>
              //   <Popconfirm
              //     placement="bottom"
              //     title={"Are you sure to delete Cara"}
              //     onConfirm={() => {
              //       // console.log("data in handledelte", data);
              //       handleDelete(data);
              //     }}
              //     okText="Yes"
              //     cancelText="No"
              //     // disabled={showData ? false : true}
              //   >
              //     <Tooltip title="Delete CAPA">
              //       <CustomDeleteICon
              //         style={{
              //           fontSize: "15px",
              //           marginRight: "2px",
              //           height: "20px",
              //         }}
              //       />
              //     </Tooltip>
              //   </Popconfirm>
              // </IconButton>
              <Popconfirm
                placement="bottom"
                title={"Are you sure to delete Cara?"}
                onConfirm={() => {
                  handleDelete(data); // Call the delete function only when confirmed
                }}
                okText="Yes"
                cancelText="No"
              >
                <Tooltip title="Delete CAPA">
                  <IconButton ref={refForcapa9}>
                    <CustomDeleteICon
                      style={{
                        fontSize: "15px",
                        marginRight: "2px",
                        height: "20px",
                      }}
                    />
                  </IconButton>
                </Tooltip>
              </Popconfirm>
            )}

            {data?.status === "Closed" && (
              <IconButton
                onClick={() => {
                  data?.analysisLevel === "Advanced"
                    ? handleAdvancedPdfDownload(data)
                    : handlePdfDownload(data);
                  // handlePdfClick(data);
                }}
              >
                <Tooltip title="Download Pdf" placement="bottom">
                  <MdOutlinePictureAsPdf
                    style={{ marginRight: "4px", fontSize: "22px" }}
                  />
                </Tooltip>
              </IconButton>
            )}
          </div>
        </>
      ),
    },
  ];

  const createHandler = (record: any = {}) => {
    // setDrawer({ mode: "create", data: {}, open: true });
    navigate("/caraForm");
    setActiveTab("1");
    setReadMode(false);
  };
  const handlePdfDownload = async (data: any) => {
    // try {
    if (data?._id) {
      const res = await axios.get(
        `/api/actionitems/getActionItemForReference/${data?._id}`
      );
      // console.log("res?.data", data);
      setActionPointsPdfData(res?.data);
    }
    // console.log("datta and actionpointpdfdata", data, actionPointsPdfData);
    const realm = realmName.toUpperCase();
    const createdAt = new Date("2024-02-08T00:55:13.629+00:00");

    const day = createdAt.getDate();
    const month = createdAt.getMonth() + 1;
    const year = createdAt.getFullYear();

    const formattedDay = String(day).padStart(2, "0");
    const formattedMonth = String(month).padStart(2, "0");

    const formattedDate = `${formattedDay} -${formattedMonth}- ${year}`;

    if (data && actionPointsPdfData) {
      const tableHeaderStyle = "color: #003566;";
      const tableBg = "background-color: #D5F5E3;";
      const tableTitles =
        "color: #003566; font-size: 12px !important; font-weight: 900;";
      const headers =
        "text-align: center; margin: auto; font-size: 22px; font-weight: 600; letter-spacing: 0.6px; color: #003566;";
      let consolidated = `<html>
    <head>
      <title>Complaint Ivestigation Report</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
       <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300&display=swap" rel="stylesheet">
      <style>
        * {
          font-family: 'Poppins', sans-serif;
        }

        table {
          border-collapse: collapse;
          width: 100%;
          margin-bottom: 20px;
        }
        td,
        th {
          border: 1px solid black;
          padding: 8px;
          text-align: left;
          font-size: 15px !important;
        },
      </style>
    </head>
    <body>
     <div>
     <table>
     <tr>
       <td style="width: 100px;">
       ${
         logo
           ? `<img src="${logo}" alt="Hindalco Logo" width="100px" height="100px" />`
           : ""
       }
       </td>
       <td colspan="3"  style="${headers}">
         ${realm}<br />
         Compliant Investigation Report<br/>
         
       </td>
     </tr>
     <tr>
       <td colspan="1" style="${tableTitles}>
         <b style="font-size: 15px !important;"> Title</b> 
       </td>
       <td colspan="3">${data?.title}</td>
     </tr>
     <tr>
       <td colspan="1" style="${tableTitles}>
         <b style="font-size: 15px !important;">  Created At </b> : 
       </td>
       <td colspan="1">${formattedDate}
        </td>
        <td colspan="1" style="${tableTitles}>
   <b style="font-size: 15px !important;"> Registered By </b>
 </td>
 
 <td colspan="1">
 ${data?.registeredBy?.username}
 </td>
     </tr>
     <tr>
     <td colspan="1" style="${tableTitles}>
       <b style="font-size: 15px !important;">Responsible Unit </b>
     </td>
     
     <td colspan="1">
     ${data?.locationDetails?.locationName}
     </td>
     <td colspan="1" style="${tableTitles}>
     <b style="font-size: 15px !important;"> Responsible Entity </b>
    </td>
    
    <td colspan="1">
    ${data?.entityId?.entityName}
    </td>
     </tr>

     <tr>
     <td colspan="1" style="${tableTitles}>
       <b style="font-size: 15px !important;">Report Number </b> 
     </td>
     <td colspan="3">${data?.serialNumber}</td>
   </tr>
  


 <tr>
 <td colspan="1" style="${tableTitles}>
 <b style="font-size: 15px !important;"> Problem Description </b>
</td>
<td colspan="3">
${data?.description}
</td>
</tr>
<tr>
<td colspan="1" style="${tableTitles}>
<b style="font-size: 15px !important;"> Intermittent Containment Action </b>
</td>
<td colspan="3">
${data?.containmentAction}
</td>
</tr>
<tr>
<td colspan="1" style="${tableTitles}>
<b style="font-size: 15px !important;"> Root Cause </b>
</td>
<td colspan="3">
${data?.rootCauseAnalysis}
</td>
</tr>
</table>




`;

      // Conditionally render Possible Outcomes table
      if (
        data?.man ||
        data?.machine ||
        data?.method ||
        data?.measurement ||
        data?.material ||
        data?.environment
      ) {
        consolidated += `
      
        <td colspan="1">
        <b style="font-size: 15px !important;"> Possible Outcomes: </b>
        </td>
    

       
    <table>
    <tbody>
    
      <tr>
        <td colspan="1" style="${tableTitles}">
          <b style="font-size: 15px !important;"> Man: </b>
        </td>
        <td colspan="3">
          ${data?.man ? data?.man : ""}
        </td>
      </tr>
      <tr>
        <td colspan="1" style="${tableTitles}">
          <b style="font-size: 15px !important;"> Machine: </b>
        </td>
        <td colspan="3">
          ${data?.machine ? data?.machine : ""}
        </td>
      </tr>
      <tr>
        <td colspan="1" style="${tableTitles}">
          <b style="font-size: 15px !important;"> Method: </b>
        </td>
        <td colspan="3">
          ${data?.method ? data?.method : ""}
        </td>
      </tr>
      <tr>
        <td colspan="1" style="${tableTitles}">
          <b style="font-size: 15px !important;"> Measurement: </b>
        </td>
        <td colspan="3">
          ${data?.measurement ? data?.measurement : ""}
        </td>
      </tr>
      <tr>
        <td colspan="1" style="${tableTitles}">
          <b style="font-size: 15px !important;"> Material: </b>
        </td>
        <td colspan="3">
          ${data?.material ? data?.material : ""}
        </td>
      </tr>
      <tr>
        <td colspan="1" style="${tableTitles}">
          <b style="font-size: 15px !important;"> Environment: </b>
        </td>
        <td colspan="3">
          ${data?.environment ? data?.environment : ""}
        </td>
      </tr>
    </tbody>
  </table>
 
  `;
      }

      if (data?.why1) {
        consolidated += `
        <table>
        <tbody>
          <tr>
            <td colspan="1" style="${tableTitles}">
              <b style="font-size: 15px !important;"> Why: </b>
            </td>
          </tr>
          <tr>
            <td colspan="1" style="${tableTitles}">
              <b style="font-size: 15px !important;"> Why1: </b>
            </td>
            <td colspan="3">
              ${data?.why1 ? data?.why1 : ""}
            </td>
          </tr>
          <tr>
            <td colspan="1" style="${tableTitles}">
              <b style="font-size: 15px !important;"> Why2: </b>
            </td>
            <td colspan="3">
              ${data?.why2 ? data?.why2 : ""}
            </td>
          </tr>
          <tr>
            <td colspan="1" style="${tableTitles}">
              <b style="font-size: 15px !important;"> Why3: </b>
            </td>
            <td colspan="3">
              ${data?.why3 ? data?.why3 : ""}
            </td>
          </tr>
          <tr>
            <td colspan="1" style="${tableTitles}">
              <b style="font-size: 15px !important;"> Why4: </b>
            </td>
            <td colspan="3">
              ${data?.why4 ? data?.why4 : ""}
            </td>
          </tr>
          <tr>
            <td colspan="1" style="${tableTitles}">
              <b style="font-size: 15px !important;"> Why5: </b>
            </td>
            <td colspan="3">
              ${data?.why5 ? data?.why5 : ""}
            </td>
          </tr>
        </tbody>
      </table>`;
      }

      consolidated += `<table>
      
      

 <table>
 <thead>
  <tr style="${tableBg}">
  <th style="${tableHeaderStyle}">Corrective Action</th>
 
  <th colspan="3" style="${tableHeaderStyle}">Description</th>
  <th style="${tableHeaderStyle}">Responsible Person</th>
  <th style="${tableHeaderStyle}">Target Date</th>
  </tr>
  <div>
  </thead>
  <tbody>
  ${actionPointsPdfData?.map(
    (item: any) => `<tr>
  <td>${item?.title}</td>
  <td  colspan="3" >${item?.description}</td>

  <td>${item?.owner?.map((item: any) => item?.username)}</td>
  <td>${item?.targetDate?.split("-")[2]?.split("T")[0]}-${
      item?.targetDate?.split("-")[1]
    }-${item?.targetDate?.split("-")[0]}</td>
 </tr> `
  )}
  </tbody>
  </div>
</table>
<table>
<tr>
<td colspan="1" style="${tableTitles}>
<b style="font-size: 15px !important;"> Actual Corrective Action </b>
</td>
<td colspan="3">
${data?.actualCorrectiveAction}
</td>
</tr>
<tr>
<td colspan="1" style="${tableTitles}>
<b style="font-size: 15px !important;"> Correction Date </b>
</td>
<td colspan="3">
${data?.correctedDate}
</td>
</tr>
</table>

     </div>
    </body>
  </html>`;
      printJS({
        type: "raw-html",
        printable: consolidated,
      });
    }
    // } catch (error) {
    //   enqueueSnackbar(`Action points could not be found`, { variant: "error" });
    // }
  };
  const handleAdvancedPdfDownload = async (data: any) => {
    // try {
    if (data?._id) {
      let res = await axios.get(
        `/api/actionitems/getActionItemForReference/${data?._id}`
      );
      // console.log("res?.data", data);
      setActionPointsPdfData(res?.data);
    }
    const analysisData: any = await axios.get(
      `/api/cara/getAnalysisForCapa/${data?._id}`
    );

    const createdAt = new Date("2024-02-08T00:55:13.629+00:00");

    const day = createdAt.getDate();
    const month = createdAt.getMonth() + 1;
    const year = createdAt.getFullYear();

    const formattedDay = String(day).padStart(2, "0");
    const formattedMonth = String(month).padStart(2, "0");

    const formattedDate = `${formattedDay} -${formattedMonth}- ${year}`;

    if (data && actionPointsPdfData) {
      const tableHeaderStyle = "color: #003566;";
      const tableBg = "background-color: #D5F5E3;";
      const tableTitles =
        "color: #003566; font-size: 12px !important; font-weight: 900;";
      const headers =
        "text-align: center; margin: auto; font-size: 22px; font-weight: 600; letter-spacing: 0.6px; color: #003566;";
      let consolidated = `<html>
    <head>
      <title>PROBLEM SOLVING 8D
SUMMARY SHEET</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
       <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300&display=swap" rel="stylesheet">
      <style>
        * {
          font-family: 'Poppins', sans-serif;
        }

        table {
          border-collapse: collapse;
          width: 100%;
          margin-bottom: 20px;
        }
        td,
        th {
          border: 1px solid black;
          padding: 8px;
          text-align: left;
          font-size: 15px !important;
        },
      </style>
    </head>
    <body>
     <div>
     <table>
     <tr>
       <td style="width: 100px;">
         <img src="${HindalcoLogoSvg}" alt="Hindalco Logo" width="100px" height="100px" />
       </td>
       <td colspan="3"  style="${headers}">
         HINDALCO INDUSTRIES LIMITED<br />
         PROBLEM SOLVING 8D
SUMMARY SHEET<br/>
         
       </td>
     </tr>
     <tr>
       <td colspan="1" style="${tableTitles}>
         <b style="font-size: 15px !important;"> Title</b> 
       </td>
       <td colspan="3">${data?.title}</td>
     </tr>
     <tr>
       <td colspan="1" style="${tableTitles}>
         <b style="font-size: 15px !important;">  Created At </b> : 
       </td>
       <td colspan="1">${formattedDate}
        </td>
        <td colspan="1" style="${tableTitles}>
   <b style="font-size: 15px !important;"> Registered By </b>
 </td>
 
 <td colspan="1">
 ${data?.registeredBy?.username}
 </td>
     </tr>
     <tr>
     <td colspan="1" style="${tableTitles}>
       <b style="font-size: 15px !important;">Responsible Unit </b>
     </td>
     
     <td colspan="1">
     ${data?.locationDetails?.locationName}
     </td>
     <td colspan="1" style="${tableTitles}>
     <b style="font-size: 15px !important;"> Responsible Entity </b>
    </td>
    
    <td colspan="1">
    ${data?.entityId?.entityName}
    </td>
     </tr>

     <tr>
     <td colspan="1" style="${tableTitles}>
       <b style="font-size: 15px !important;">Report Number </b> 
     </td>
     <td colspan="3">${data?.serialNumber}</td>
   </tr>
  


 <tr>
 <td colspan="1" style="${tableTitles}>
 <b style="font-size: 15px !important;"> Problem Description </b>
</td>
<td colspan="3">
${data?.description}
</td>
</tr>

</table>




`;

      // Is/Is-Not Table
      consolidated += `
  <h3 style="margin-top:20px;">Is / Is Not Analysis</h3>
  <table border="1" cellspacing="0" cellpadding="6" width="100%">
    <thead>
      <tr style="${tableBg}">
        <th style="${tableHeaderStyle}">Question</th>
        <th style="${tableHeaderStyle}">Answer</th>
      </tr>
    </thead>
    <tbody>
      ${Object.entries(analysisData?.data?.isIsNot || {})
        .filter(([_, value]) => Array.isArray(value) && value.length > 0)
        .map(([key, value]) => {
          const rows = (value as any[])
            .map(
              (item) => `
                <tr>
                  <td>${item?.question || "-"}</td>
                  <td>${item?.answer || "-"}</td>
                </tr>
              `
            )
            .join("");

          return `
            <tr>
              <th colspan="2" style="background:#ddd">${key.toUpperCase()}</th>
            </tr>
            ${rows}
          `;
        })
        .join("")}
    </tbody>
  </table>`;
      // Fishbone Table
      consolidated += `
       <h3 style="margin-top:20px;">Fishbone Analysis</h3>
      <table>
        <thead>
          <tr style="${tableBg}">
            <th style="${tableHeaderStyle}">Category</th>
            <th style="${tableHeaderStyle}">Description</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(analysisData?.data?.fishBone || {})
            .filter(([key]) => key !== "_id")
            .map(([category, items]: any) => {
              const checkedItems = items
                .filter((item: any) => item.checked)
                .map((item: any) => item.textArea)
                .filter((val: string) => val)
                .join(", ");

              return checkedItems
                ? `<tr>
                     <td>${category}</td>
                     <td>${checkedItems}</td>
                   </tr>`
                : "";
            })
            .join("")}
        </tbody>
      </table>`;

      consolidated += `
       <h3 style="margin-top:20px;">Root Cause Analysis</h3>
    <table>
      <thead>
        <tr  style="${tableBg}">
          <th style="${tableHeaderStyle}">Why Level</th>
          <th style="${tableHeaderStyle}">Answer</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(analysisData?.data?.rootCause || {})
          .filter(([key]) => key !== "_id")
          .map(
            ([whyKey, whyValues]: any) => `
              <tr>
                <td>${whyKey}</td>
                <td>${whyValues.filter((v: string) => v).join(", ") || "-"}</td>
              </tr>
            `
          )
          .join("")}
      </tbody>
    </table>`;
      consolidated += `
       <h3 style="margin-top:20px;">Corrective Actions</h3>
  <table>
    <thead>
      <tr style="${tableBg}">
        <th style="${tableHeaderStyle}">Cause</th>
        <th style="${tableHeaderStyle}">Corrective Action</th>
          <th>Remarks</th>
      </tr>
    </thead>
    <tbody>
      ${data?.outcome
        ?.filter((item: any) => item.applicable)
        .map(
          (item: any) => `
          <tr>
            <td>${item.cause || "-"}</td>
            <td>${item.correctiveAction || "-"}</td>
             <td>${item.remarks || "-"}</td>
          </tr>
        `
        )
        .join("")}
    </tbody>
  </table>`;

      consolidated += `<table>
      
      
 <h3 style="margin-top:20px;">Action Items</h3>
 <table>
 <thead>
  <tr style="${tableBg}">
  <th style="${tableHeaderStyle}">Corrective Action</th>
 
  <th colspan="3" style="${tableHeaderStyle}">Description</th>
  <th style="${tableHeaderStyle}">Responsible Person</th>
   <th  colspan="3"  style="${tableHeaderStyle} ">Status</th>
  <th  colspan="3" style="${tableHeaderStyle}">Target Date</th>
  </tr>
  <div>
  </thead>
  <tbody>
  ${actionPointsPdfData?.map(
    (item: any) => `<tr>
  <td>${item?.title}</td>
  <td  colspan="3" >${item?.description ? item?.description : "NA"}</td>

  <td>${item?.owner?.map((item: any) => item?.username)}</td>
  <td  colspan="3" >${item?.status === true ? "Open" : "Closed"}</td>
  <td>${item?.targetDate?.split("-")[2]?.split("T")[0]}-${
      item?.targetDate?.split("-")[1]
    }-${item?.targetDate?.split("-")[0]}</td>
 </tr> `
  )}
  </tbody>
  </div>
</table>
<table>
<tr>
<td colspan="1" style="${tableTitles}>
<b style="font-size: 15px !important;"> One Point Lesson</b>
</td>
<td colspan="3">
${data?.onePointLesson}
</td>
</tr>
<tr>
<td colspan="1" style="${tableTitles}>
<b style="font-size: 15px !important;"> Correction Date </b>
</td>
<td colspan="3">
${data?.correctedDate}
</td>
</tr>
</table>

     </div>
    </body>
  </html>`;
      printJS({
        type: "raw-html",
        printable: consolidated,
      });
    }
    // } catch (error) {
    //   enqueueSnackbar(`Action points could not be found`, { variant: "error" });
    // }
  };

  useEffect(() => {
    getLogo();
    getyear();
    getWorkflowConfig();
    getLocationOptions();
    getActiveModules();
    // getAllKpis();
    // getOriginData();
    fetchFilterList();
    // GetSystems(loggedInUser?.locationId);
    // getAllUserByEntities();
  }, []);
  useEffect(() => {
    fetchFilterList();
  }, [unitId, deptId]);

  useEffect(() => {
    if (location.pathname.includes("/caraactionitemview")) {
      // setIsEdit(location.state.isEdit);
      // setEditData(location.state.editData);

      // setDrawer(location.state.drawer);

      // setReadMode(location.state.readMode);
      const stateData = JSON.parse(
        sessionStorage.getItem("newTabState") || "{}"
      );
      // console.log("stateData", stateData);
      // setIsEdit(stateData.isEdit);
      // setEditData(stateData.editData);

      // setDrawer(stateData.drawer);
      navigate(`/cara/caraForm/${stateData.editData?._id}`);

      setReadMode(stateData.readMode);
    }
  }, [location]);
  useEffect(() => {
    if (!!currentYear && !!unitId && !!deptId) {
      const url = `api/cara/getAllCara?orgid=${loggedInUser.organizationId}&currentYear=${currentYear}&locationId=${unitId}&entityId=${deptId}&page=${page}&limit=${limit}`;
      getData(url);
    }
  }, [
    unitId,
    currentYear,
    deptId,
    actionItemDrawer,
    isFilterEntity,
    isFilterOrigin,
    isFilterOwner,
    isFilterStatus,
    isFilterUnit,
  ]);

  // useEffect(() => {
  //   if (!!currentYear) {
  //     const url = `api/cara/getAllCara?orgid=${loggedInUser.organizationId}&currentYear=${currentYear}&locationId=${unitId}&entityId=${deptId}&page=${page}&limit=${limit}`;
  //     getData(url);
  //   }
  // }, [page, limit]);
  useEffect(() => {
    if (!!currentYear && !openAction && unitId && deptId) {
      const url = `api/cara/getAllCara?orgid=${loggedInUser.organizationId}&currentYear=${currentYear}&locationId=${unitId}&entityId=${deptId}&page=${page}&limit=${limit}`;
      getData(url);
    } else if (!!currentYear && openAction) {
      const url = `api/cara/myCapa?orgid=${loggedInUser.organizationId}&currentYear=${currentYear}&locationId=${unitId}&entityId=${deptId}&page=${page}&limit=${limit}`;
      getData(url);
    }
  }, [openAction, page, limit]);
  useEffect(() => {
    if (unitId) {
      getDepartmentOptions();
      // GetSystems(unitId);
    }
  }, [unitId]);
  const getData = async (url: string) => {
    try {
      const queryParams: any = {
        orgid: loggedInUser.organizationId,
        currentYear: currentYear,
        locationId: unitId,
        entityId: deptId,
        page: page,
        limit: limit,
      };

      // Add additional query parameters if they exist
      if (selectedUnit) {
        queryParams.selectedUnit = selectedUnit; // Renaming selectedLocation to selectedUnit
      }
      if (selectedEntity) {
        queryParams.selectedEntity = selectedEntity;
      }
      if (selectedStatus) {
        queryParams.selectedStatus = selectedStatus;
      }
      if (selectedOwner) {
        queryParams.selectedOwner = selectedOwner;
      }
      if (selectedOrigin) {
        queryParams.selectedOrigin = selectedOrigin;
      }

      let testurl;

      // Construct the URL with query parameters
      if (!openAction && !!unitId && !!deptId) {
        testurl = `api/cara/getAllCara`;
      } else {
        testurl = `api/cara/myCapa`;
      }

      // Append query parameters to the URL
      const queryString = Object.keys(queryParams)
        .map((key) => {
          if (Array.isArray(queryParams[key])) {
            // If the value is an array, create multiple key-value pairs
            return queryParams[key]
              .map(
                (value: any) =>
                  `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
              )
              .join("&");
          } else {
            // If the value is not an array, create a single key-value pair
            return `${encodeURIComponent(key)}=${encodeURIComponent(
              queryParams[key]
            )}`;
          }
        })
        .join("&");

      testurl += `?${queryString}`;

      // Fetch data from the constructed URL
      const data = await axios.get(testurl);

      if (data?.data) {
        const dataSrc = data?.data?.data?.map((el: any, index: number) => {
          return {
            key: (index + 1).toString(),
            ...el,
          };
        });

        setDataSource(dataSrc);
        setCount(data?.data?.count);
      }
    } catch (error) {
      // Handle errors
    }
  };
  // const handlePdfClick = async (data: any) => {
  //   const check = await checkAdvanceOrBasic(data?.locationId);
  //   check ? handleAdvancedPdfDownload(data) : handlePdfDownload(data);
  // };
  //chat handler
  const toggleChatModal = () => {
    setChatModalOpen(!chatModalOpen);
  };

  const handleSearch = async (searchValue: string) => {
    const newPayload = {
      text: searchValue,
      orgId: orgId,
      page: page,
      limit: limit,
      locationId: unitId,
      entityId: deptId,
    };
    try {
      //locationId=${unitId}&entityId=${deptId}
      const res = await axios.get("/api/cara/searchCapa", {
        params: newPayload,
      });
      setDataSource(res?.data?.data);
      setCount(res?.data?.count);
    } catch (error) {
      enqueueSnackbar(`CAPA search failed!`, {
        variant: "error",
      });
      return error;
    }
  };
  const getActiveModules = async () => {
    await axios(`/api/organization/getAllActiveModules/${realmName}`)
      .then((res) => {
        setActiveModules(res.data.activeModules);
      })
      .catch((err) => console.error(err));
  };
  // const getAllKpis = async () => {
  //   try {
  //     let res = await axios.get(`api/kpi-definition/getAllKpi`);
  //     if (res.data) {
  //       setKpis(res.data);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };
  const handleClickDiscard = () => {
    setSearchValue("");
    const url = `api/cara/getAllCara?orgid=${loggedInUser.organizationId}&currentYear=${currentYear}&locationId=${unitId}&entityId=${deptId}&page=${page}&limit=${limit}`;
    getData(url);
  };
  // const GetSystems = async (locationId: any) => {
  //   let encodedSystems: any;
  //   if (locationId === "All") {
  //     encodedSystems = encodeURIComponent(JSON.stringify(locationId));
  //   } else {
  //     encodedSystems = encodeURIComponent(JSON.stringify(locationId));
  //   }
  //   const { data } = await axios.get(
  //     `api/systems/displaySystemsForGivenLocation/${encodedSystems}`
  //   );
  //   if (data && data.length > 0) {
  //     setSystems([...data]);
  //   }
  // };
  // const getAllUserByEntities = async () => {
  //   try {
  //     let entityId = JSON.parse(window.sessionStorage.getItem("userDetails")!);
  //     let data = await axios.get(
  //       `/api/cara/getAllUsersOfEntity/${entityId.entityId}`
  //     );
  //     if (data?.data) {
  //       //console.log(data?.data?.otherUsers, "users");
  //       setUsers(data?.data?.otherUsers);
  //     }
  //   } catch (error) {}
  // };

  // useEffect(() => {
  //   const url = `api/cara/getAllCara?orgid=${loggedInUser.organizationId}&locationId=${loggedInUser.location.id}&page=${page}&limit=10`;
  //   getData(url);
  // }, [unitId]);
  // useEffect(() => {
  //   if (!drawer) {
  //     const url = `api/cara/getAllCara?orgid=${loggedInUser.organizationId}&currentYear=${currentYear}&locationId=${unitId}&entityId=${deptId}&page=${page}&limit=10`;
  //     getData(url);
  //   }
  // }, [drawer]);

  // help tour

  const refForcapa1 = useRef(null);
  const refForcapa2 = useRef(null);
  const refForcapa3 = useRef(null);
  const refForcapa4 = useRef(null);
  const refForcapa5 = useRef(null);
  const refForcapa6 = useRef(null);
  const refForcapa7 = useRef(null);
  const refForcapa8 = useRef(null);
  const refForcapa9 = useRef(null);

  const [openTourForCapa, setOpenTourForCapa] = useState<boolean>(false);

  const stepsForCapa: TourProps["steps"] = [
    {
      title: "CAPA Details",
      description: "",

      target: () => refForcapa1.current,
    },
    {
      title: "Unit",
      description: " ",
      target: () => refForcapa2.current,
    },
    {
      title: "Entity",
      description: "",
      target: () => refForcapa3.current,
    },
    {
      title: "Year",
      description: "",

      target: () => refForcapa4.current,
    },
    {
      title: "My Capa Icon",
      description: " ",
      target: () => refForcapa5.current,
    },
    {
      title: "Hyper Link",
      description: "",
      target: () => refForcapa6.current,
    },
    {
      title: "Status",
      description: "",

      target: () => refForcapa7.current,
    },
    // ...(isOrgAdmin || isMr
    //   ? [
    {
      title: "Edit",
      description: " ",
      target: () => refForcapa8.current,
    },
    //   ]
    // : []),
    ...(isOrgAdmin
      ? [
          {
            title: "Delete",
            description: "",
            target: () => refForcapa9.current,
          },
        ]
      : []),
  ];

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
  //report modal states
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const showReportModal = () => {
    setIsReportModalOpen(true);
  };

  const handleReportOk = () => {
    setIsReportModalOpen(false);
  };

  const handleReportCancel = () => {
    setIsModalOpen(false);
  };
  return (
    <>
      <Box
        sx={{ width: "100%", bgcolor: "background.paper", marginTop: "10px" }}
      >
        <div className={classes.tabWrapper}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              {/* CAPA Details Tab */}
              <div
                onClick={() => {
                  setValue(0);
                  navigate("/mrm/cara");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "4px 10px",
                  cursor: "pointer",
                  borderRadius: "5px",
                  position: "relative",
                  backgroundColor: value === 0 ? "#3576BA" : "",
                }}
                ref={refForcapa1}
              >
                <CAPAIcon
                  className={classes.docNavIconStyle}
                  stroke={value === 0 ? "white" : ""}
                />
                <span
                  className={`${classes.docNavText} ${
                    value === 0 ? classes.selectedTab : ""
                  }`}
                  style={{
                    marginLeft: "5px",
                    color: value === 0 ? "white" : "black",
                  }}
                >
                  CAPA Details
                </span>
                {value === 0 && (
                  <SelectedTabArrow
                    style={{
                      position: "absolute",
                      bottom: -13,
                      left: "53%",
                      transform: "translateX(-50%)",
                      width: 13,
                      height: 11,
                    }}
                  />
                )}
              </div>

              {/* Settings Icon (when matches === true) */}
              {matches && (isOrgAdmin || isMr) && (
                <div
                  onClick={() => {
                    navigate("/cara/settings");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "4px 10px",
                    cursor: "pointer",
                    borderRadius: "5px",
                    position: "relative",
                    backgroundColor: value === 6 ? "#3576BA" : "",
                  }}
                >
                  <OrgSettingsIcon className={classes.docNavIconStyle} />
                  <span
                    className={`${classes.docNavText} ${
                      value === 6 ? classes.selectedTab : ""
                    }`}
                    style={{
                      marginLeft: "5px",
                      color: value === 6 ? "white" : "black",
                    }}
                  >
                    Settings
                  </span>
                  {value === 6 && (
                    <SelectedTabArrow
                      style={{
                        position: "absolute",
                        bottom: -13,
                        left: "53%",
                        transform: "translateX(-50%)",
                        width: 13,
                        height: 11,
                      }}
                    />
                  )}
                </div>
              )}
            </div>

            {matches ? (
              <ModuleHeader
                moduleName="CAPA Management"
                createHandler={createHandler}
                filterHandler={false}
                configHandler={false}
                showSideNav={true}
              />
            ) : (
              <div style={{ display: "flex", gap: "15px" }}>
                {/* Filter Icon */}

                <div style={{ paddingTop: "3px" }}>
                  <FilterIcon
                    style={{ width: "24px", height: "24px" }}
                    onClick={showModal}
                  />
                </div>
                {activeModules?.includes("AI_FEATURES") && (
                  <div>
                    <Tooltip title="Chat With CAPA" color="blue">
                      {/* <MdForum
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
                      /> */}
                      <Button
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: "10px",
                          fontWeight: "bold",
                          borderRadius: "20px",
                          padding: "5px 20px",
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
                        }}
                        onClick={() => {
                          setChatModalOpen(true);
                        }}
                      >
                        <GiStarShuriken
                          style={{ fontSize: "22px", color: "#ff6600" }}
                        />
                        AI Chat
                      </Button>
                    </Tooltip>
                  </div>
                )}
                {/* My CAPA Icon */}
                <div style={{ paddingTop: "3px" }}>
                  <AiOutlineFund
                    style={{
                      cursor: "pointer",
                      // marginTop: "12px",
                      width: "40px",
                      height: "40px",
                      padding: "1px",
                      marginRight: "8px",

                      fill: "rgb(0, 48, 89)",
                    }}
                    onClick={() => navigate("/cara/caraReport")}
                  />
                </div>
                <div style={{ padding: "0px" }}>
                  <Tooltip title="My CAPA">
                    <IconButton
                      onClick={() => {
                        setOpenAction(!openAction);
                      }}
                      ref={refForcapa5}
                      style={{ padding: "0px" }}
                    >
                      {openAction ? (
                        <MdPermContactCalendar
                          style={{
                            color: "rgb(53, 118, 186)",
                            height: "31px",
                            width: "30px",
                          }}
                        />
                      ) : (
                        <MdOutlinePermContactCalendar
                          style={{
                            color: "#444",
                            height: "31px",
                            width: "30px",
                          }}
                        />
                      )}
                    </IconButton>
                  </Tooltip>
                </div>
              </div>
            )}
          </div>
        </div>
      </Box>
      <div className={classes.calenderView}>
        {value === 0 && (
          <div
            style={{
              display: "flex",
              width: "100%",
              alignItems: "center",

              justifyContent: matches ? "space-between" : "end",
            }}
          >
            {matches ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  marginTop: "20px",
                  padding: "0px 10px",
                }}
                className={classes.SearchBox}
              >
                <FormControl variant="outlined">
                  <div
                    style={{
                      width: "200px",
                      paddingRight: "20px",
                    }}
                    ref={refForcapa2}
                  >
                    <Autocomplete
                      disablePortal
                      id="combo-box-demo"
                      options={[allOption, ...locationOptions]}
                      onChange={handleLocation}
                      value={getSelectedItem()}
                      getOptionLabel={(option) => option.locationName || ""}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          size="small"
                          label="Unit/Corp Func"
                          fullWidth
                        />
                      )}
                    />
                  </div>
                </FormControl>
                <div className={classes.SearchBox}>
                  <FormControl variant="outlined">
                    <div
                      style={{
                        width: "250px",
                        paddingLeft: "20px",
                      }}
                      ref={refForcapa3}
                    >
                      <Autocomplete
                        disablePortal
                        id="combo-box-demo"
                        options={[allDeptOption, ...deptOptions]}
                        onChange={handleDepartment}
                        value={getDeptSelectedItem()}
                        getOptionLabel={(option) => option.entityName || ""}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="outlined"
                            size="small"
                            label="Dept/Vertical"
                            fullWidth
                          />
                        )}
                      />
                    </div>
                  </FormControl>
                </div>

                <div
                  style={{
                    paddingLeft: "20px",
                  }}
                  ref={refForcapa4}
                >
                  <Grid>
                    <YearComponent
                      currentYear={currentYear}
                      setCurrentYear={setCurrentYear}
                    />
                  </Grid>
                </div>
              </div>
            ) : (
              ""
            )}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "end",
              }}
            >
              {matches ? (
                <div style={{ display: "flex", gap: "15px" }}>
                  {/* <div style={{ paddingTop: "3px" }}>
                    <FilterIcon
                      style={{ width: "24px", height: "24px" }}
                      onClick={showModal}
                    />
                  </div> */}
                  {activeModules?.includes("AI_FEATURES") && (
                    <div>
                      <Tooltip title="Chat With CAPA" color="blue">
                        <Button
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "10px",
                            fontWeight: "bold",
                            borderRadius: "20px",
                            padding: "5px 20px",
                            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
                          }}
                          onClick={() => {
                            setChatModalOpen(true);
                          }}
                        >
                          <GiStarShuriken
                            style={{ fontSize: "22px", color: "#ff6600" }}
                          />
                          AI Chat
                        </Button>
                      </Tooltip>
                    </div>
                  )}
                  {/* <div style={{ paddingTop: "3px" }}>
                    <Tooltip title="Show Report">
                      <AiOutlineFund
                        style={{
                          cursor: "pointer",
                          fontSize: "20px",
                          padding: "1px",
                          marginRight: "8px",
                          fill: "rgb(0, 48, 89)",
                        }}
                        onClick={() => navigate("/cara/caraReport")}
                      />
                    </Tooltip>
                  </div> */}
                  <div style={{ padding: "0px" }}>
                    <Tooltip title="My CAPA">
                      <Button
                        onClick={() => {
                          setOpenAction(!openAction);
                        }}
                        ref={refForcapa5}
                        style={{
                          padding: "5px 10px",
                          backgroundColor: openAction
                            ? "rgb(53, 118, 186)"
                            : "#f5f5f5",
                          color: openAction ? "white" : "#444",
                          border: "1px solid #ccc",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <FaUserGroup />
                        My CAPA
                      </Button>
                    </Tooltip>
                  </div>
                </div>
              ) : (
                <div style={{ paddingTop: "3px" }}>
                  <FilterIcon
                    style={{ width: "24px", height: "24px" }}
                    onClick={showModal}
                  />
                </div>
              )}
              <Paper
                style={{
                  width: "285px",
                  // height: "33px",
                  float: "right",
                  margin: "11px",
                  //borderRadius: "20px",
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
                  handleSearch(searchValue);
                }}
              >
                {/* <TextField
                  // className={classes.input}
                  name={"search"}
                  value={searchValue}
                  placeholder={"Search CAPA"}
                  onChange={handleSearchChange}
                  inputProps={{
                    "data-testid": "search-field",
                  }}
                  InputProps={{
                    disableUnderline: true,
                    startAdornment: (
                      <InputAdornment
                        position="start"
                        // className={classes.iconButton}
                      >
                        <img
                          src={MdSearch}
                          alt="search"
                          style={{
                            paddingLeft: "10px",
                            fontWeight: "bold",
                            color: "black",
                          }}
                        />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <>
                        {searchValue && (
                          <InputAdornment position="end">
                            <IconButton onClick={handleClickDiscard}>
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        )}
                      </>
                    ),
                  }}
                /> */}
                <Input
                  size="small"
                  style={{ marginRight: "20px" }}
                  allowClear
                  placeholder="Search CAPA"
                  onChange={
                    // Check if the input has been cleared
                    handleSearchChange
                  }
                  // prefix={<MdSearch />}
                  suffix={
                    <Button
                      type="text"
                      className={classes.searchIcon}
                      icon={<MdSearch />} // Use MdSearch as the suffix button
                      onClick={() => handleSearchChange}
                    />
                  }
                />
              </Paper>
            </div>
          </div>
        )}
      </div>

      {/* // filters for mobile view only */}

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
        className={classes.modal}
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
          className={classes.SearchBox}
        >
          <FormControl variant="outlined">
            <div
              style={{
                width: "200px",
                // paddingRight: "20px",
              }}
              ref={refForcapa2}
            >
              <Autocomplete
                disablePortal
                id="combo-box-demo"
                options={[allOption, ...locationOptions]}
                onChange={handleLocation}
                value={getSelectedItem()}
                getOptionLabel={(option) => option.locationName || ""}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    size="small"
                    label="Unit/Corp Func"
                    fullWidth
                  />
                )}
              />
            </div>
          </FormControl>
          <div className={classes.SearchBox}>
            <FormControl variant="outlined">
              <div
                style={{
                  width: "200px",
                  // paddingLeft: "20px",
                }}
                ref={refForcapa3}
              >
                <Autocomplete
                  disablePortal
                  id="combo-box-demo"
                  options={[allDeptOption, ...deptOptions]}
                  onChange={handleDepartment}
                  value={getDeptSelectedItem()}
                  getOptionLabel={(option) => option.entityName || ""}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      size="small"
                      label="Entity"
                      fullWidth
                    />
                  )}
                />
              </div>
            </FormControl>
          </div>

          <div
            style={{
              width: "200px",
              display: "flex",
              justifyContent: "start",
              padding: "0px",
              margin: "0px",
            }}
            ref={refForcapa4}
          >
            <Grid>
              <YearComponent
                currentYear={currentYear}
                setCurrentYear={setCurrentYear}
              />
            </Grid>
          </div>
        </div>
      </Modal>

      {matches ? (
        <>
          {" "}
          {dataSource && dataSource?.length > 0 ? (
            <div
              className={classes.tableContainerScrollable}
              style={{ marginTop: "15px", padding: "0px 10px" }}
            >
              <Table
                className={classes.tableContainer}
                rowClassName={() => "editable-row"}
                bordered
                dataSource={dataSource}
                columns={columns}
                pagination={false}
                expandable={{
                  expandedRowRender: (record: any) => {
                    const matchingActionPoints = record?.actionItem;
                    setSelectedData(record);
                    return (
                      <Table
                        className={classes.subTableContainer}
                        style={{ width: 900, paddingBottom: "20px" }}
                        columns={subRowColumns}
                        bordered
                        dataSource={matchingActionPoints}
                        pagination={false}
                      />
                    );
                  },
                  expandIcon,
                }}
              />
              <div className={classes.pagination}>
                <Pagination
                  size="small"
                  current={page}
                  pageSize={limit}
                  total={count}
                  showTotal={showTotal}
                  showSizeChanger
                  showQuickJumper
                  onChange={(page: any, pageSize: any) => {
                    handlePagination(page, pageSize);
                  }}
                />
              </div>
            </div>
          ) : (
            <div className={classes.tableContainer}>
              <Table
                bordered
                columns={columns}
                dataSource={[]} // Empty dataSource array
                pagination={false}
              />

              <Typography align="center" className={classes.emptyDataText}>
                No records found.
              </Typography>
            </div>
          )}
        </>
      ) : (
        ""
      )}

      {matches ? (
        ""
      ) : (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-evenly",
            paddingBottom: "60px",
          }}
        >
          {dataSource?.map((item: any) => (
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
                onClick={() => {
                  // console.log("data in undeline", item);
                  setIsEdit(true);
                  setEditData(item);
                  setDrawer({
                    mode: "edit",
                    data: { ...item, id: item?._id },
                    open: true,
                  });

                  setReadMode(true);
                }}
                style={{
                  padding: "3px 10px",
                  backgroundColor: getNewStatusColor(item?.status),
                  borderRadius: "2px",
                  cursor: "pointer",
                }}
              >
                {item?.title}
              </p>
              <p>Origin : {item?.origin?.deviationType}</p>
              <p>Unit : {item?.locationDetails?.locationName}</p>
              {/* <p>
                Registered By :{" "}
                {item?.registeredBy?.firstname && item?.registeredBy.lastname
                  ? item?.registeredBy?.firstname +
                    " " +
                    item?.registeredBy?.lastname
                  : null}{" "}
              </p> */}
              {/* <p>
                CAPA Owner :{" "}
                {item?.caraOwner?.firstname
                  ? item?.caraOwner?.firstname + " " + item.caraOwner.lastname
                  : null}
              </p> */}
              <p>Status : {item?.status}</p>
              <p>Responsible Entity : {item?.entityId?.entityName}</p>

              {item.actionItem.length > 0 ? (
                <Accordion className={classes.headingRoot}>
                  <AccordionSummary
                    expandIcon={<MdExpandMore style={{ padding: "3px" }} />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    className={classes.summaryRoot}
                    style={{ margin: "0px", height: "10px" }}
                  >
                    Action Items
                  </AccordionSummary>
                  <AccordionDetails
                    className={classes.headingRoot}
                    style={{ display: "flex", flexDirection: "column" }}
                  >
                    {item?.actionItem?.map((data: any) => (
                      <div>
                        <p
                          onClick={() => {
                            handleEditActionItem(data);
                          }}
                          style={{
                            textDecorationLine: "underline",
                            cursor: "pointer",
                            margin: "5px 3px",
                          }}
                        >
                          {data?.title}
                        </p>
                      </div>
                    ))}
                  </AccordionDetails>
                </Accordion>
              ) : (
                ""
              )}

              {/* <p>
                Target Date:{" "}
                {item?.targetDate
                  ? (() => {
                      const currentDate = new Date();
                      const targetDate = new Date(item.targetDate);
                      const formattedTargetDate =
                        targetDate.toLocaleDateString("en-GB");

                      if (targetDate < currentDate) {
                        return (
                          <span>
                            {formattedTargetDate}
                            <Tooltip title="Target Date has exceeded the current date">
                              <AiOutlineWarning
                                style={{ color: "red", marginLeft: "5px" }}
                              />
                            </Tooltip>
                          </span>
                        );
                      } else {
                        return <span>{formattedTargetDate}</span>;
                      }
                    })()
                  : "NA"}
              </p> */}
              {/* <p>
                Pending With :
                {
                  <span>
                    {item?.status === "Open" && item?.deptHead?.length > 0 && (
                      <span>
                        {item?.deptHead
                          ?.map(
                            (head: any) =>
                              head?.firstname + " " + head?.lastname
                          )
                          .join(", ")}
                      </span>
                    )}

                    {item?.status === "Accepted" &&
                      (item?.rootCauseAnalysis ? (
                        item?.deptHead?.length > 0 && (
                          <span>
                            {item?.deptHead
                              .map(
                                (head: any) =>
                                  head?.firstname + " " + head?.lastname
                              )
                              .join(", ")}
                          </span>
                        )
                      ) : (
                        <span>
                          {item?.caraOwner?.firstname +
                            " " +
                            item?.caraOwner?.lastname}
                        </span>
                      ))}
                    {item?.status === "Analysis_In_Progress" &&
                      (item?.rootCauseAnalysis ? (
                        item?.deptHead?.length > 0 && (
                          <span>
                            {item?.deptHead
                              .map(
                                (head: any) =>
                                  head?.firstname + " " + head?.lastname
                              )
                              .join(", ")}
                          </span>
                        )
                      ) : (
                        <span>
                          {item?.caraOwner?.firstname +
                            " " +
                            item?.caraOwner?.lastname}
                        </span>
                      ))}

                    {item?.status === "Outcome_In_Progress" &&
                      (item?.actualCorrectiveAction ? (
                        item?.deptHead?.length > 0 && (
                          <span>
                            {item?.deptHead
                              .map(
                                (head: any) =>
                                  head?.firstname + " " + head?.lastname
                              )
                              .join(", ")}
                          </span>
                        )
                      ) : (
                        <span>
                          {item?.caraOwner?.firstname +
                            " " +
                            item?.caraOwner?.lastname}
                        </span>
                      ))}
                    {item?.status === "Rejected" && (
                      <span>
                        {item?.registeredBy?.firstname +
                          " " +
                          item?.registeredBy?.lastname}
                      </span>
                    )}
                  </span>
                }
              </p> */}
            </div>
          ))}
        </div>
      )}

      <CaraDrawer
        handleDrawer={() => {
          setDrawer({ mode: "create", data: {}, open: false });
          setIsEdit(false);
          setEditData({});
          setformdata({
            title: "",
            comments: "",
            referenceAttachments: [],
            kpiId: "",
            type: "",
            referenceComments: "",
            startDate: "",
            entity: "",
            location: "",
            containmentAction: "",
            systems: [],
            analysisLevel: "",

            files: [],
            endDate: "",
            registeredBy: "",
            status: "",
            caraOwner: {},
            caraCoordinator: "",
            coordinator: "",
            serialNumber: "",
            entityId: "",
            systemId: [],
            origin: "",
            locationId: "",
            organizationId: "",
            deptHead: [],
            description: "",
            date: {},
            year: "",
            attachments: [],
            registerfiles: [],
            correctiveAction: "",
            targetDate: "",
            correctedDate: "",
            kpiReportLink: "",
            rootCauseAnalysis: "",
            actualCorrectiveAction: "",
            man: "",
            machine: "",
            environment: "",
            material: "",
            method: "",
            measurement: "",
            why1: "",
            why2: "",
            why3: "",
            why4: "",
            why5: "",
            impact: [],
            impactType: "",
            highPriority: false,
          });
        }}
        activeTab={"1"}
        setActiveTab={setActiveTab}
        drawerType={"create"}
        drawer={drawer}
        setDrawer={setDrawer}
        expandDataValues={expandDataValues}
        mrm={true}
        isEdit={isEdit}
        editData={editData}
        setIsEdit={setIsEdit}
        readMode={readMode}
        isUpload={isUpload}
        setUpload={setUpload}
        getData={getData}
      />
      {actionItemDrawer && (
        <CaraActionitemDrawer
          openmodal={actionItemDrawer}
          setOpen={setActionItemDrawer}
          drawerdata={actionItemRecordData}
          drawer={drawer}
          moduleName={"INBOX"}
          handleCloseDrawer={handleCloseDrawer}
          read={read}
          setDrawer={setDrawer}
          setReadMode={setReadMode}
          setEditData={setEditData}
          setIsEdit={setIsEdit}
        />
      )}

      <Tour
        open={openTourForCapa}
        onClose={() => setOpenTourForCapa(false)}
        steps={stepsForCapa}
      />
      {chatModalOpen && (
        <CapaChatModal
          chatModalOpen={chatModalOpen}
          toggleChatModal={toggleChatModal}
        />
      )}
      {/* {isReportModalOpen && (
        <CapaReportModal
          // isReportModalOpen={isReportModalOpen}
          // setReportModalOpen={setIsReportModalOpen}
        ></CapaReportModal>
      )} */}
    </>
  );
};

export default CaraHomePage;
