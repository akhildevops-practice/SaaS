import { ChangeEvent, useEffect, useState } from "react";
import {
  Table,
  Modal,
  Pagination,
  PaginationProps,
  Dropdown,
  MenuProps,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { MdDescription } from "react-icons/md";
import { MdSearch } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { MdClose } from "react-icons/md";
import CustomMoreMenu from "../../../components/newComponents/CustomMoreMenu";
import { useStyles } from "./styles";
import axios from "../../../apis/axios.global";
import "gantt-task-react/dist/index.css";
import ObjectiveDrawer from "../Objective/KraRegister/CreateObjectiveForm/ObjectiveDrawer";
import { useSnackbar } from "notistack";
import { MdExpandMore } from "react-icons/md";
import {
  AiOutlineFilter,
  AiFillFilter,
  AiOutlineArrowsAlt,
} from "react-icons/ai";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@material-ui/core";
import { Select as MuiSelect } from "@material-ui/core";
import Button from "antd/lib/button";
import YearComponent from "components/Yearcomponent";
import { Autocomplete } from "@material-ui/lab";
import getAppUrl from "utils/getAppUrl";
import SearchBar from "components/SearchBar";
import getYearFormat from "utils/getYearFormat";
import { formatDashboardQuery } from "utils/formatDashboardQuery";
import getSessionStorage from "utils/getSessionStorage";
import {
  MdOutlinePermContactCalendar,
  MdPermContactCalendar,
} from "react-icons/md";
import checkRoles from "utils/checkRoles";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import checkRole from "utils/checkRoles";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import React from "react";
import { ReactComponent as FilterIcon } from "assets/documentControl/Filter.svg";
import DepartmentSelector from "components/ReusableComponents/DepartmentSelector";

const ObjectiveTable = () => {
  const matches = useMediaQuery("(min-width:820px)");
  const smallScreen = useMediaQuery("(min-width:450px)");
  // console.log("smallScreen", smallScreen);
  const [tableData, setTableData] = useState<any[]>([]);
  // console.log("tableData", tableData);
  const [modalData, setModalData] = useState<any[]>([]);
  // const [searchText, setSearchText] = useState<any>();
  // const [searchedColumn, setSearchedColumn] = useState<any>();
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [selectedDept, setSelectedDept] = useState<any>({});
  const [kraModal, setKraModal] = useState<any>({
    open: false,
    mode: "create",
    data: {},
  });
  const [hoveredRow, setHoveredRow] = useState(null);
  const [formType, setFormType] = useState<string>("create");
  const [read, setRead] = useState<boolean>(true);
  const [ObjectiveId, setObjectiveId] = useState<any>("");
  // const [changeVisibilityModalOpen, setChangeVisibilityModalOpen] =
  //   useState<boolean>(false);
  const classes = useStyles();
  // const [user, setUser] = useState<any[]>([]);
  //  const [currentUser, setCurrentUser] = useState<string>();
  // const [currentId, setCurrentId] = useState<string>();
  //  const [objEntity, setObjEntity] = useState([]);
  // const [objLocation, setObjLocation] = useState([]);
  // const [OwnersList, setOwnerList] = useState([]);
  // const [readers, setReaders] = useState<any>();
  // const [readersTypeOptions, setReadersTypeOptions] = useState([]);
  const [graphOpen, setGraphOpen] = useState<boolean>(false);
  const [currentYear, setCurrentYear] = useState<any>();
  const navigate = useNavigate();
  const [expandedRows, setExpandedRows] = useState<any>([]);
  // const [firstForm] = Form.useForm();

  const { enqueueSnackbar } = useSnackbar();
  const [locationNames, setLocationNames] = useState<Location[]>([]);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [count, setCount] = useState<number>();
  const realmName = getAppUrl();
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const allOption = { id: "All", locationName: "All" };
  const userDetails = getSessionStorage();
  const [openAction, setOpenAction] = useState(false);
  const [deptId, setDeptId] = useState<string>(userDetails?.entity?.id);
  const [deptOptions, setDeptOptions] = useState<any[]>([]);
  const [modalDeptOptions, setModalDeptOptions] = useState<any[]>([]);
  const [funcOptions, setFuncOptions] = useState<any[]>([]);
  const [funcId, setFuncId] = useState<string>();
  const isMr = checkRole("MR") && !!userDetails?.location?.id;
  const isMCOE = checkRoles("ORG-ADMIN");
  const locationstate = useLocation();
  const [filterList, setFilterList] = useState<any>([]);
  const [selectedScopetype, setselectedScopetype] = useState<any>([]);
  const [isFilterScopetype, setfilterScopetype] = useState<boolean>(false);
  const [heads, setHeads] = useState<any[]>([]);
  const [selectedObjectives, setSelectedObjectives] = useState<any>([]);
  const [modalPage, setModalPage] = useState(1);
  const [modalRowsPerPage, setModalRowsPerPage] = useState(10);
  const [modalCount, setModalCount] = useState<number>();
  const [searchModalText, setSearchModalText] = useState<any>();
  const [modalDeptId, setModalDeptId] = useState<string>(
    userDetails?.entity?.id
  );

  const [drawer, setDrawer] = useState<any>({
    mode: "create",
    open: false,
    clearFields: true,
    toggle: false,
    data: {},
  });
  // const [kraDrawer, setKraDrawer] = useState<any>({
  //   mode: "create",
  //   open: false,
  //   clearFields: true,
  //   toggle: false,
  //   data: {},
  // });
  const [selectedLocation, setSelectedLocation] = useState<any>({
    id: userDetails.location?.id,
    locationName: userDetails.location?.locationName,
  });
  const [showFilters, setShowFilters] = useState<any>(false);
  const [selectedModalLocation, setSelectedModalocation] = useState<any>({
    id: userDetails.location?.id,
    locationName: userDetails?.location?.locationName,
  });
  const allDeptOption = { id: "All", entityName: "All" };
  const noneDeptOption = { id: "None", entityName: "None" };
  const allFuncOption = { id: "All", name: "All" };
  const [selectedObjective, setSelectedObjective] = useState<any>({
    id: "All",
    ObjectiveName: "All",
  });
  const [searchQuery, setsearchQuery] = useState<any>({
    searchQuery: "",
  });
  const [selectedOption, setSelectedOption] = useState("Department");
  // console.log("selectedOption", selectedOption);
  const [selectedOrigin, setselectedOrigin] = useState<any>([]);
  const [isFilterOrigin, setfilterOrigin] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);
  const isMR = checkRoles("MR");
  const [selectAll, setSelectAll] = React.useState(false);
  const [modalWidth, setModalWidth] = useState(1000);
  const [orginal, setOriginal] = useState<boolean>(true);
  const [owners, setOwners] = useState<any>([]);

  const handleSelectAllObjectives = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectAll(event.target.checked);
    if (event.target.checked) {
      setSelectedObjectives(modalData.map((obj) => obj._id));
    } else {
      setSelectedObjectives([]);
    }
  };

  const handleChange = (event: any) => {
    // console.log("change99", event.target.value);
    setSelectedOption(event.target.value);
    if (event === "Unit") {
      setDeptId("");
    }
  };

  const showTotal: PaginationProps["showTotal"] = (total) =>
    `Total ${total} items`;
  const showModalTotal: PaginationProps["showTotal"] = (total) =>
    `Total ${total} items`;

  useEffect(() => {
    if (locationstate?.pathname?.includes("/objective/objectivedrawer")) {
      // console.log("Inside useEffect for drawer");

      const stateData = JSON.parse(
        sessionStorage.getItem("newTabState") || "{}"
      );

      if (
        stateData.drawer &&
        stateData.drawer.data &&
        stateData.drawer.data.id
      ) {
        setObjectiveId(stateData.drawer.data.id);
        setFormType("edit");
        setAddModalOpen(true);
        setDrawer(stateData.drawer);
        // setDrawer({
        //   ...drawer,
        //   open: true,
        //   data: { id: stateData.drawer.data.id },
        //   mode: "edit",
        //   clearFields: true,
        //   toggle: false,
        // });
      } else {
        console.warn("Invalid stateData format:", stateData);
      }
    }
  }, [locationstate]);
  useEffect(() => {
    if (userDetails?.entityId) {
      fetchInitialDepartment(userDetails.entityId);
    }
  }, [userDetails?.entityId]);
  useEffect(() => {
    if (modalVisible == true) {
      fetchModalData();
      getModalDepartmentOptions();
    }
  }, [
    modalPage,
    modalRowsPerPage,
    modalVisible,
    selectedModalLocation,
    modalDeptId,
    searchModalText,
  ]);
  // console.log("isFilterScopetype", isFilterScopetype);
  let url: any;
  if (
    (isFilterScopetype && selectedScopetype?.length > 0) ||
    (isFilterOrigin && selectedOrigin?.length > 0)
  ) {
    url = formatDashboardQuery(`/api/objective/getAllObjectMaster`, {
      page: 1,
      limit: 10,
      // locationId: selectedLocation?.id,
      year: currentYear,
      // deptId: deptId,
      // scopeType: selectedOption,
      selectedScopetype: selectedScopetype ? selectedScopetype : [],
      selectedParent: selectedOrigin ? selectedOrigin : [],
    });
  } else {
    url = formatDashboardQuery(`/api/objective/getAllObjectMaster`, {
      page: page,
      limit: rowsPerPage,
      locationId: selectedLocation?.id,
      // ? selectedLocation?.id
      // : userDetails.location?.id,
      year: currentYear,
      deptId: deptId,
      scopeType: selectedOption,
      selectedScopetype: selectedScopetype ? selectedScopetype : [],
    });
  }
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
      console.error("Failed to fetch initial department:", error);
    }
  };
  const fetchFilterList = async () => {
    try {
      const response = await axios.get(
        `api/objective/getFilterListForObjectives`
      );
      // console.log("response.data", response.data);
      setFilterList(response?.data);
    } catch (error) {
      console.log("error", error);
    }
  };
  //function to get table data for action modal
  const fetchModalData = async () => {
    try {
      const response = await axios.get(
        `api/objective/getObjectivesForCopy?page=${modalPage}&limit=${modalRowsPerPage}&locationId=${
          selectedModalLocation.id
        }&entityId=${
          modalDeptId ? modalDeptId : ""
        }&year=${currentYear}&searchText=${
          searchModalText ? searchModalText : ""
        }`
      );
      // console.log("response.data", response.data);
      if (response.data?.data) {
        setModalData(response?.data?.data);
        setModalCount(response?.data?.length);
      }
    } catch (error) {}
  };
  const handleDeleteObjective = async (record: any) => {
    const confirmDelete = window.confirm(
      "Deleting this objective will also remove its linkage from KPIs. Are you sure you want to proceed?"
    );

    if (!confirmDelete) {
      // User cancelled the deletion
      return;
    }
    await axios
      .delete(`/api/objective/deleteObjectMaster/${record._id}`)
      .then(() => {
        fetchObjectives(url);
        enqueueSnackbar(`Operation Successfull`, { variant: "success" });
      })
      .catch((err) => {
        enqueueSnackbar(`Could not delete record`, {
          variant: "error",
        });
        console.error(err);
      });
  };

  const getYear = async () => {
    const currentyear = await getYearFormat(new Date().getFullYear());
    setCurrentYear(currentyear);
  };

  // const handleCloseObjective = async (record: any) => {
  //   try {
  //     const res = await axios.put(`/api/objective/update/${record._id}`, {
  //       ObjectiveStatus: "CLOSED",
  //     });
  //     fetchObjectives(url);
  //     if (res.status === 200 || res.status === 201) {
  //       enqueueSnackbar("Objective Closed Successfully", {
  //         variant: "success",
  //       });
  //     }
  //   } catch (error) {
  //     console.log("error in handleCloseObjective ->>", error);
  //   }
  // };

  // const handleSearch = (selectedKeys: any, confirm: any, dataIndex: any) => {
  //   confirm();
  //   setSearchText(selectedKeys[0]);
  //   setSearchedColumn(dataIndex);
  // };

  const handleSearchChange = (e: any) => {
    e.preventDefault();
    setSearchModalText(e.target.value);
  };
  // const handleReset = (clearFilters: any, confirm: any, close: any) => {
  //   clearFilters();
  //   setSearchText("");
  //   confirm();
  //   close();
  // };

  const getLocationNames = async () => {
    try {
      const res = await axios.get(
        `api/location/getLocationsForOrg/${realmName}`
      );

      setLocationNames(res.data);
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleMouseEnter = (record: any) => {
    setHoveredRow(record._id);
  };

  const handleMouseLeave = () => {
    setHoveredRow(null);
  };
  //department filter functions

  const getDepartmentOptions = async () => {
    try {
      if (selectedLocation?.id) {
        // console.log("unitId", unitId);
        const result = await axios(
          `/api/cara/getEntitiesForLocation/${selectedLocation?.id}`
        );

        setDeptOptions(result?.data);
      }
    } catch (error) {
      enqueueSnackbar("Error fetching Entities", { variant: "error" });
    }
  };
  const getModalDepartmentOptions = async () => {
    try {
      if (selectedModalLocation?.id) {
        // console.log("unitId", unitId);
        const result = await axios(
          `/api/objective/getEntitiesBasedOnRole/${selectedModalLocation?.id}`
        );

        setModalDeptOptions(result?.data);
      }
    } catch (error) {
      enqueueSnackbar("Error fetching Entities", { variant: "error" });
    }
  };

  const getFunctionOptions = async () => {
    try {
      if (selectedLocation?.id) {
        // console.log("unitId", selectedLocation);

        const result = await axios(
          `/api/business/getFunctionBySingleLocation/${selectedLocation?.id}`
        );
        // console.log("result.data", result.data);

        setFuncOptions(result?.data);
      }
    } catch (error) {
      // enqueueSnackbar("Error fetching functions", { variant: "error" });
    }
  };
  const handleDepartment = (event: any, values: any) => {
    // console.log("selected department", values);
    if (values && values?.id) {
      setDeptId(values?.id);
    } else {
      setDeptId("");
    }
  };
  const getDeptSelectedItem = () => {
    const item = [allDeptOption, ...deptOptions].find((opt: any) => {
      if (opt.id === deptId) return opt;
    });
    return item || {};
  };

  const handleModalDepartment = (event: any, values: any) => {
    // console.log("selected department", values);
    if (values && values?.id) {
      setModalDeptId(values?.id);
    } else {
      setModalDeptId("");
    }
  };
  const getModalDeptSelectedItem = () => {
    const item = [allDeptOption, noneDeptOption, ...modalDeptOptions].find(
      (opt: any) => {
        if (opt.id === modalDeptId) return opt;
      }
    );
    return item || {};
  };
  const getDHForEntity = async () => {
    try {
      if (deptId !== "All") {
        const head = await axios.get(
          `/api/cara/getDeptHeadForEntity/${deptId}`
        );
        // console.log("head.data", head.data);
        if (head.data.length > 0) {
          setHeads(head.data);
        }
      } else {
        setHeads([]);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleFunction = (event: any, values: any) => {
    // console.log("selected department", values);
    if (values && values?.id) {
      setFuncId(values?.id);
    } else {
      setFuncId("");
    }
  };
  const getFuncSelectedItem = () => {
    const item = [allFuncOption, ...funcOptions].find((opt: any) => {
      if (opt.id === deptId) return opt;
    });
    return item || {};
  };
  const handleSelectionChange = (selectedRowKeys: any, selectedRows: any) => {
    // console.log("selectedrows", selectedRows);
    const selectedObjIds = selectedRows.map((row: any) => row._id);
    setSelectedObjectives(selectedObjIds);
  };
  // console.log("selectecd obj", selectedObjectives);
  const subColumns: ColumnsType<any> = [
    {
      title: "Goal Title",
      dataIndex: "goalTitle",
      key: "kra",
      width: 180,
      render: (_: any, record: any) => (
        <div
          onClick={() => handleEditKra(record)}
          style={{
            textDecorationLine: "underline",
            cursor: "pointer",
          }}
        >
          <span style={{ color: "green" }}>{record?.KraName || ""}</span>
        </div>
      ),
    },

    {
      title: "Target Type",
      dataIndex: "goalTargetType",
      key: "kra",
      width: 180,
      render: (_: any, record: any) => record?.TargetType || "",
    },
    {
      title: "Goal Target",
      dataIndex: "goalTarget",
      key: "kra",
      width: 180,
      render: (_: any, record: any) => record?.Target || "",
    },
    {
      title: "Unit Of Measurement",
      dataIndex: "goalUOM",
      key: "kra",
      width: 180,
      render: (_: any, record: any) => record?.UnitOfMeasure || "",
    },
    {
      title: "Associated Kpis",
      dataIndex: "associatedKpis",
      key: "kra",
      width: 180,
      render: (s_: any, record: any) => {
        // console.log("record", record);
        const items: MenuProps["items"] = [];
        record?.associatedKpis?.map((item: any, index: any) => {
          items.push({
            key: item?.kpiName,
            label: (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                }}
                onClick={() => {
                  navigate(`/dashboard/kpi`, {
                    state: {
                      locationId: selectedLocation?.id,
                      entityId: deptId,
                      kpiId: item?._id,
                      kpiName: item?.kpiName,
                      minDate: new Date("2023-04-01"),
                      maxDate: new Date(),
                    },
                  });
                  // handlerOpenCertifiModal(item);
                }}
              >
                {item?.kpiName}
              </div>
            ),
            // icon: <AttachFileIcon style={{ fontSize: "18px" }} />,
          });
        });
        return (
          <>
            <Dropdown
              menu={{ items }}
              // overlayClassName={classes.DropDwonScroll}
            >
              <a onClick={(e) => e.preventDefault()}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    width: "auto",
                    paddingLeft: "5px",
                    paddingRight: "5px",
                    justifyContent: "space-between",
                    height: "30px",
                    backgroundColor: "#F4F6F9",
                    borderRadius: "5px",
                    color: "black",
                  }}
                >
                  <span
                    style={{
                      width: "150px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {record?.associatedKpis[0]?.kpiName}
                  </span>
                  <MdExpandMore style={{ color: "#B2BABB" }} />
                </div>
              </a>
            </Dropdown>
          </>
        );
      },
    },
  ];

  const handleClick = (record: any) => {
    // console.log("record", record);

    const canSetRead =
      record.Owner === userDetails.id ||
      (isMR
        ? userDetails.location?.id === record?.locationId ||
          (userDetails.additionalUnits?.length > 0 &&
            userDetails.additionalUnits.includes(record?.locationId))
        : false) ||
      isUserHead ||
      isOrgAdmin ||
      owners.some((owner: any) => owner.id === userDetails.id);
    // console.log("cansetread", canSetRead);
    if (canSetRead) {
      // console.log("inside if");
      handleEdit(record?._id);
      setRead(true);
    } else {
      // console.log("else");
      setRead(false);
      handleEdit(record?._id);
    }
  };
  // console.log("read in objtable", read);
  const generateYearOptions = () => {
    const current = new Date().getFullYear();
    // console.log("type of currentyear", typeof currentYear, currentYear);

    const nextYear = current + 1;

    switch (userDetails?.organization?.fiscalYearFormat) {
      case "YYYY":
        return `${nextYear}`;
      case "YYYY-YY+1":
        return `${(nextYear % 100) + 1}`;
      case "YY-YY+1":
        return `${nextYear % 100}-${(nextYear + 1) % 100}`;

      default:
        // Default to YYYY format
        return `${nextYear}`;
    }
  };
  const handleExpandModal = () => {
    // setModalVisible(true);
    setOriginal(!orginal);
    if (orginal) {
      // console.log("inside if");
      setModalWidth(1000);
    } else {
      setModalWidth(1200);
    }
  };
  const handleCopy = async () => {
    try {
      const year = generateYearOptions();
      const result = await axios.get(
        `api/kpi-definition/createObjCopy?ids=${selectedObjectives}&year=${year}`
      );
      if (result.status === 200 || result.status === 201) {
        enqueueSnackbar("selected Objectives have been copied successfuly", {
          variant: "success",
        });
      }
    } catch (err) {
      console.log(err);
      enqueueSnackbar("Copying objectives failed", { variant: "error" });
    }
  };
  const modalColumns: ColumnsType<any> = [
    {
      title: "Objective Name",
      dataIndex: "ObjectiveName",
      key: "ObjectiveName",
      render: (text, record: any) => {
        // if (record.type) {
        //   // If the current row has children, return text without the expand icon
        //   return (
        //     <div
        //       style={{
        //         display: "flex",
        //         justifyContent: "space-between",
        //       }}
        //     >
        //       <div
        //         onClick={() => handleEditKra(record)}
        //         style={{
        //           textDecorationLine: "underline",
        //           cursor: "pointer",
        //         }}
        //       >
        //         <span style={{ color: "green", paddingLeft: "60px" }}>
        //           {" "}
        //           {text}
        //         </span>
        //       </div>
        //       {hoveredRow === record._id && (
        //         <div
        //           style={{
        //             paddingRight: "10px",
        //             color: "#636363",
        //             cursor: "pointer",
        //           }}
        //           onClick={() => handleEditKra(record)}
        //         >
        //           <ExpandIcon /> <span>Open</span>
        //         </div>
        //       )}
        //     </div>
        //   );
        // }
        // Otherwise, return text with the expand icon
        return (
          <div
            onClick={() => {
              handleEdit(record?._id);
              setRead(record.EditerAccess);
            }}
            style={{
              textDecorationLine: "underline",
              cursor: "pointer",
            }}
          >
            {record?.ObjectiveName}
          </div>
        );
      },
      width: 300,
    },
    {
      title: "Objective Type",
      dataIndex: "ScopeType",
      key: "ScopeType",
      render: (_: any, record: any) => record?.ScopeType,
    },
    {
      title: "Obj For",
      dataIndex: "ScopeDetails",
      key: "ScopeDetails",
      render: (_: any, record: any) => record?.ScopeDetails?.name,
    },
    {
      title: "Parent Objective",
      dataIndex: "parentObjectiveDetails",
      key: "parentObjectiveDetails",
      render: (_: any, record: any) => {
        return (
          <div
          // onClick={() => handleEdit(record?.parentObjectiveDetails?._id)}
          // style={{
          //   textDecorationLine: "underline",
          //   cursor: "pointer",
          // }}
          >
            {record?.parentObjectiveDetails?.ObjectiveName}
          </div>
        );
      },
    },

    {
      title: "Unit",
      dataIndex: "locationName",
      key: "locationName",
      render: (_: any, record: any) => record.locationName,
      // sorter: (a, b) => a.entityName?.length - b.entityName?.length,
      // sortDirections: ["descend", "ascend"],
    },
    {
      title: "Entity",
      dataIndex: "entityName",
      key: "entityName",
      render: (_: any, record: any) => record.entityName,
      // sorter: (a, b) => a.entityName?.length - b.entityName?.length,
      // sortDirections: ["descend", "ascend"],
    },
  ];
  const columns: ColumnsType<any> = [
    {
      title: "Objective Title",
      dataIndex: "ObjectiveName",
      key: "ObjectiveName",
      render: (text, record: any) => {
        // if (record.type) {
        //   // If the current row has children, return text without the expand icon
        //   return (
        //     <div
        //       style={{
        //         display: "flex",
        //         justifyContent: "space-between",
        //       }}
        //     >
        //       <div
        //         onClick={() => handleEditKra(record)}
        //         style={{
        //           textDecorationLine: "underline",
        //           cursor: "pointer",
        //         }}
        //       >
        //         <span style={{ color: "green", paddingLeft: "60px" }}>
        //           {" "}
        //           {text}
        //         </span>
        //       </div>
        //       {hoveredRow === record._id && (
        //         <div
        //           style={{
        //             paddingRight: "10px",
        //             color: "#636363",
        //             cursor: "pointer",
        //           }}
        //           onClick={() => handleEditKra(record)}
        //         >
        //           <ExpandIcon /> <span>Open</span>
        //         </div>
        //       )}
        //     </div>
        //   );
        // }
        // Otherwise, return text with the expand icon
        return (
          <div
            onClick={() => handleClick(record)}
            // onClick={handleClick(record)}
            style={{
              textDecorationLine: "underline",
              cursor: "pointer",
            }}
          >
            {record?.ObjectiveStatus === "Save As Draft" && (
              <Tooltip title="In Draft">
                <MdDescription
                  style={{
                    verticalAlign: "middle",

                    color: "#339933",
                    fontSize: "20px",
                  }}
                />
              </Tooltip>
            )}{" "}
            {record?.ObjectiveName}
          </div>
        );
      },
      width: 300,
    },
    {
      title: "Objective Type",
      dataIndex: "ScopeType",
      key: "ScopeType",
      render: (_: any, record: any) => record?.ScopeType,
      filterIcon: (filtered: any) =>
        isFilterScopetype ? (
          <AiFillFilter style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <AiOutlineFilter style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }: any) => {
        const uniqueStatusSet = new Set(filterList?.scopeType);

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
                        setselectedScopetype([...selectedScopetype, value]);
                      } else {
                        setselectedScopetype(
                          selectedScopetype.filter(
                            (selected: any) => selected !== value
                          )
                        );
                      }
                    }}
                    value={status}
                    checked={selectedScopetype.includes(status)}
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
                disabled={selectedScopetype.length === 0}
                onClick={() => {
                  setfilterScopetype(!isFilterScopetype);

                  // handlePagination(1, 10);
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
                  setselectedScopetype([]);

                  setfilterScopetype(!isFilterScopetype);
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
      title: "Obj For",
      dataIndex: "ScopeDetails",
      key: "ScopeDetails",
      render: (_: any, record: any) => record?.ScopeDetails?.name,
    },
    {
      title: "Parent Objective",
      dataIndex: "parentObjectiveDetails",
      key: "parentObjectiveDetails",
      render: (_: any, record: any) => {
        return (
          <div
            onClick={() => {
              handleEdit(record?.parentObjectiveDetails?._id);
              setRead(record.EditerAccess);
            }}
            style={{
              textDecorationLine: "underline",
              cursor: "pointer",
            }}
          >
            {record?.parentObjectiveDetails?.ObjectiveName}
          </div>
        );
      },
      // filterIcon: (filtered: any) =>
      //   isFilterOrigin ? (
      //     <AiFillFilter style={{ fontSize: "16px", color: "black" }} />
      //   ) : (
      //     <AiOutlineFilter style={{ fontSize: "16px" }} />
      //   ),
      // filterDropdown: ({ confirm, clearFilters }: any) => {
      //   return (
      //     <div
      //       style={{
      //         padding: 8,
      //         maxHeight: 200, // Set the maximum height of the container
      //         overflowY: "auto", // Enable vertical scrolling
      //       }}
      //     >
      //       {filterList?.parentObj?.map((item: any) => (
      //         <div key={item._id}>
      //           <label style={{ display: "flex", alignItems: "center" }}>
      //             <input
      //               type="checkbox"
      //               onChange={(e) => {
      //                 const value = e.target.value;
      //                 if (e.target.checked) {
      //                   setselectedOrigin([...selectedOrigin, value]);
      //                 } else {
      //                   setselectedOrigin(
      //                     selectedOrigin.filter((key: any) => key !== value)
      //                   );
      //                 }
      //               }}
      //               value={item._id}
      //               checked={selectedOrigin.includes(item._id)}
      //               style={{
      //                 width: "16px",
      //                 height: "16px",
      //                 marginRight: "5px",
      //               }}
      //             />
      //             {item?.ObjectiveName}
      //           </label>
      //         </div>
      //       ))}
      //       <div style={{ marginTop: 8 }}>
      //         <Button
      //           type="primary"
      //           disabled={selectedOrigin.length === 0}
      //           onClick={() => {
      //             setfilterOrigin(!isFilterOrigin);
      //             // handlePagination(1, 10);
      //           }}
      //           style={{
      //             marginRight: 8,
      //             backgroundColor: "#E8F3F9",
      //             color: "black",
      //           }}
      //         >
      //           Apply
      //         </Button>
      //         <Button
      //           onClick={() => {
      //             setselectedOrigin([]);
      //             // fetchDocuments();
      //             setfilterOrigin(!isFilterOrigin);
      //             confirm();
      //           }}
      //         >
      //           Reset
      //         </Button>
      //       </div>
      //     </div>
      //   );
      // },
    },
    {
      title: "Obj Owner",
      dataIndex: "OwnerName",
      key: "OwnerName",
      render: (_: any, record: any) => record.OwnerName,
    },
    {
      title: "Unit",
      dataIndex: "locationName",
      key: "locationName",
      render: (_: any, record: any) => record.locationName,
      // sorter: (a, b) => a.entityName?.length - b.entityName?.length,
      // sortDirections: ["descend", "ascend"],
    },
    {
      title: "Entity",
      dataIndex: "entityName",
      key: "entityName",
      render: (_: any, record: any) => record.entityName,
      // sorter: (a, b) => a.entityName?.length - b.entityName?.length,
      // sortDirections: ["descend", "ascend"],
    },

    {
      title: "Created On",
      dataIndex: "createdAt",
      width: 200,
      render: (_: any, record: any) => (
        <>{moment(record?.createdAt).format("DD-MM-YYYY")}</>
      ),
    },

    // {
    //   title: "Status",
    //   dataIndex: "Status",
    //   key: "Status",
    //   render: (_: any, record: any) => {
    //     if (record.Status === "OPEN") {
    //       return (
    //         <Tag
    //           style={{
    //             backgroundColor: "#7CBF3F",
    //             color: "#ffffff",
    //             padding: "5px 25px",
    //             borderRadius: "10px",
    //           }}
    //           key={record.Status}
    //         >
    //           {record.Status}
    //         </Tag>
    //       );
    //     } else if (record.Status === "CLOSED") {
    //       return (
    //         <Tag
    //           style={{
    //             backgroundColor: "#ea2525",
    //             color: "#ffffff",
    //             padding: "5px 25px",
    //             borderRadius: "10px",
    //           }}
    //           key={record.Status}
    //         >
    //           {record.Status}
    //         </Tag>
    //       );
    //     }
    //   },
    // },
    // {
    //   title: "Closed On",
    //   dataIndex: "closedOn",
    //   key: "closedOn",
    //   render: (_: any, record: any) => {
    //     if (record?.Status === "CLOSED" && record?.ModifiedDate) {
    //       const modifiedDate = new Date(record?.ModifiedDate);
    //       const formattedDate = modifiedDate.toLocaleDateString("en-GB");

    //       return formattedDate;
    //     } else {
    //       return "NA";
    //     }
    //   },
    // },
    {
      title: "Created By",
      dataIndex: "createdBy",
      key: "createdBy",
      render: (_: any, record: any) => record?.createdBy?.username,
    },

    {
      title: "Action",
      fixed: "right",
      dataIndex: "action",
      key: "action",
      render: (_: any, record: any) => {
        const filteredActions = actions
          .filter((obj) => {
            // console.log("obj", obj);
            // Conditionally exclude "Add Goal" action when record status is "CLOSED"
            // if (obj.label === "Add Goal" && isClosed) {
            //   return false;
            // }
            // Conditionally exclude "Delete Objective" action if the user is not an org admin
            if (obj.label === "Delete Objective" && !isOrgAdmin) {
              return false;
            }
            // Conditionally exclude "Close Objective" action if the status is closed
            // if (obj.label === "Close Objective" && (isClosed || !isOwner)) {
            //   return false;
            // }
            return true;
          })
          .map((obj) => ({
            ...obj,
            handleClick: () => obj.handler(record),
          }));

        return (
          filteredActions.length > 0 && (
            <CustomMoreMenu
              options={filteredActions}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            />
          )
        );
      },
    },
  ];

  const handleEditKra = (record: any) => {
    // console.log("record in editkra", record);
    setKraModal({
      ...kraModal,
      data: {
        ...record,
      },
      open: !kraModal.open,
      mode: "edit",
    });
    // setKraDrawer({
    //   ...kraDrawer,
    //   open: !kraDrawer.open,
    //   mode: "edit",
    //   data: { id: record },
    // });
  };

  // const toggleCommentsModal = (record: any) => {
  //   setCommentsModal({
  //     ...commentsModal,
  //     data: {
  //       ObjectiveId: record?._id,
  //     },
  //     open: !commentsModal.open,
  //   });
  // };

  // const toggleReviewModal = (record: any) => {
  //   setReviewModal({
  //     ...reviewModal,
  //     data: { ...record },
  //     open: !reviewModal.open,
  //   });
  // };

  // const toggleKraModal = (record: any) => {
  //   // console.log("record in toffle", record);
  //   const updatedData = tableData.map((item) =>
  //     item._id === record._id
  //       ? { ...item, highlight: true }
  //       : { ...item, highlight: false }
  //   );
  //   setTableData(updatedData);
  //   setKraModal({
  //     ...kraModal,
  //     data: {
  //       ...kraModal?.data,
  //       ObjectiveId: record._id,
  //       objectiveCategories: record?.objectiveCategories,
  //       objective: record?.ObjectiveName,
  //     },
  //     open: !kraModal.open,
  //   });
  //   setKraDrawer({ ...kraDrawer, open: !kraDrawer.open, mode: "create" });
  // };
  // console.log("selected option", selectedOption);
  const actions = [
    // {
    //   label: "Add Goal",
    //   handler: toggleKraModal,
    //   icon: <AddIcon style={{ color: "#F5874F" }} />,
    // },
    // {
    //   label: "Change Visibility",
    //   handler: () => {
    //     setChangeVisibilityModalOpen(true);
    //   },
    //   icon: <VisibilityIcon />,
    // },
    // {
    //   label: "Send for Review",
    //   handler: toggleReviewModal,
    //   icon: <RateReviewIcon />,
    // },
    // {
    //   label: "Close Objective",
    //   handler: handleCloseObjective,
    //   icon: <MdClose />,
    // },
    {
      label: "Delete Objective",
      handler: handleDeleteObjective,
      icon: <MdDelete />,
    },
  ];

  const handleEdit = (record: any) => {
    // console.log("recordEdit", record);
    setObjectiveId(record);
    setFormType("edit");
    setAddModalOpen(true);

    setDrawer({
      ...drawer,
      open: !drawer.open,
      data: { id: record },
      mode: "edit",
    });
  };
  const isUserHead = heads.some((head) => head.id === userDetails.id);
  const handleButtonClick = () => {
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setOriginal(true);
  };
  const fetchObjectives = async (url: any) => {
    try {
      const response = await axios.get(url);
      setCount(response?.data?.length);
      // console.log("count", response?.data?.data);
      const tblData = response.data?.data?.map((obj: any) => ({
        _id: obj._id || "",
        ObjectiveId: obj._id,
        ObjectiveName: obj.ObjectiveName || "",
        ObjectiveStatus: obj.ObjectiveStatus || "",
        entityName: obj.entityName || "",
        locationName: obj.locationName || "",
        locationId: obj.locationId,
        Description: obj.Description || "",
        ModifiedDate: obj.ModifiedDate || "",
        ModifiedBy: obj.ModifiedBy || "",
        ObjectivePeriod: obj.ObjectivePeriod || "",
        Status: obj.ObjectiveStatus || "",
        createdAt: obj.createdAt || "",
        ParentObjective: obj.ParentObjective || "",
        ReviewComments: obj.ReviewComments || "",
        Readers: obj.Readers || "",
        Owner: obj.Owner || "",
        OwnerName: obj.OwnerName || "",
        ReviewList: obj.ReviewList || "",
        ReadersList: obj.ReadersList || "",
        OwnerShipType: obj.OwnerShipType || "",
        OwnershipEntity: obj.OwnershipEntity || "",
        Scope: obj.Scope || "",
        Goals: obj.Goals || "",
        ScopeDetails: obj.ScopeDetails || {},
        ScopeType: obj.ScopeType,
        // locationId: obj.locationId || "",
        MilestonePeriod: obj.MilestonePeriod || "",
        parentObjectiveDetails: obj.parentObjectiveDetails || "",
        createdBy: obj.createdBy,
        EditerAccess: obj.EditerAccess,

        kraList: obj.kra?.map((child: any) => ({
          ...child,
          _id: child._id,

          ObjectiveName: obj.ObjectiveName,
          Target: child.Target,
          TargetType: child.TargetType,
          UnitOfMeasure: child.UnitOfMeasure,
          StartDate: child.StartDate,
          EndDate: child.EndDate,
          KraProgress: child.Status,
          Description: child.Comments,
          OwnerName: child.UserName,
          KpiReportId: child.KpiReportId,
          ObjectiveId: child.ObjectiveId,
          KraName: child.KraName,
          objectiveCategories: child.objectiveCategories,
          associatedKpis: child.associatedKpis,
          type: true,
        })),
      }));

      setTableData(tblData);
    } catch (error) {
      console.log(error);
    }
  };

  const rowClassName = (record: any) => {
    return record.highlight ? "highlighted-row" : "";
  };

  useEffect(() => {
    // setSelectedLocation({
    //   id: userDetails?.location?.id,
    //   locationName: userDetails?.location?.locationName,
    // });
    // getAllUser();
    // getEntityForObj();
    getDepartmentOptions();
    getFunctionOptions();
    // getLocationforobj();
    getYear();
    fetchFilterList();
    // fetchObjectives(url);
    getLocationNames();
    getObjOwnersList();
  }, []);

  useEffect(() => {
    if (!!selectedLocation?.id && selectedLocation.id !== undefined) {
      getFunctionOptions();
      getDepartmentOptions();
      getDHForEntity();
    }
    if (
      !!currentYear &&
      !!selectedLocation?.id &&
      selectedLocation.id !== undefined
    ) {
      fetchObjectives(url);
    }
  }, [selectedLocation, deptId]);

  useEffect(() => {
    if (openAction === true) {
      const myurl = formatDashboardQuery(`/api/objective/myObjectives`, {
        page: page,
        limit: rowsPerPage,
        locationId: selectedLocation?.id,
        // deptId:deptId,
        year: currentYear,
      });
      fetchObjectives(myurl);
    } else {
      if (
        !!currentYear &&
        !!selectedLocation?.id &&
        selectedLocation.id !== undefined
      ) {
        fetchObjectives(url);
      }
    }
  }, [
    currentYear,
    openAction,
    selectedLocation,
    deptId,
    selectedOption,
    isFilterScopetype,
    isFilterOrigin,
  ]);

  // const Readers = [
  //   { value: 0, label: "Organization" },
  //   { value: 1, label: "Location(s)" },
  //   { value: 2, label: "Entity(s)" },
  //   { value: 3, label: "User(s)" },
  // ];

  // const getAllUser = async () => {
  //   await axios(`/api/objective/getAllUser`)
  //     .then((res) => {
  //       setUser(res.data.allUsers);
  //       setCurrentUser(res.data.activeUser.username ?? "");
  //       setCurrentId(res.data.activeUser.id ?? "");
  //       setOwnerList(
  //         res.data.allUsers.map((obj: any) => ({
  //           value: obj.id,
  //           label: obj.username,
  //           // email: obj.email,
  //           // avatar: obj.avatar,
  //         }))
  //       );
  //     })
  //     .catch((err) => console.error(err));
  // };

  // const getEntityForObj = async () => {
  //   await axios(`/api/objective/getDepartmentForObjectiveMaster`)
  //     .then((res) => {
  //       setObjEntity(
  //         res.data.map((obj: any) => ({
  //           value: obj.id,
  //           label: obj.entityName,
  //         }))
  //       );
  //     })
  //     .catch((err) => console.error(err));
  // };

  // const getLocationforobj = async () => {
  //   await axios(`/api/objective/getLocationForObjectiveMaster`)
  //     .then((res) => {
  //       setObjLocation(
  //         res.data.map((obj: any) => ({
  //           value: obj.id,
  //           label: obj.locationName,
  //         }))
  //       );
  //     })
  //     .catch((err) => console.error(err));
  // };
  const rowSelection = {
    onChange: handleSelectionChange,
    selectedRowKeys: selectedObjectives, // Pass selectedKPIs here
  };
  // useEffect(() => {
  //   if (readers === 1) {
  //     setReadersTypeOptions(objLocation);
  //   } else if (readers === 2) {
  //     setReadersTypeOptions(objEntity);
  //   } else {
  //     setReadersTypeOptions(OwnersList);
  //   }
  // }, [readers]);

  // const putVisibility = async (visibilityData: any) => {
  //   try {
  //     const res = await axios.put(
  //       `/api/objective/update/${ObjectiveId}`,
  //       visibilityData
  //     );
  //     fetchObjectives(url);
  //   } catch (error) {
  //     console.log("error", error);
  //   }
  // };

  const handleChangeList = async (event: any, values: any) => {
    setPage(1);
    setRowsPerPage(10);
    setSelectedLocation(values);
    setSelectedDept({});
    if (values?.id === "All") {
      setDeptId(values?.id);
      setSelectedDept({ ...{ id: "All", name: "All" }, type: "All" });
    } else {
      setSelectedDept(null);
    }
  };
  const handleChangeModalList = async (event: any, values: any) => {
    setModalPage(1);
    setModalRowsPerPage(10);
    setSelectedModalocation(values);
  };

  // const handleChangeObjective = async (event: any, values: any) => {
  //   setPage(1);
  //   setRowsPerPage(10);
  //   // console.log("values", values);
  //   if (values) {
  //     setSelectedObjective(values);
  //   } else {
  //     setSelectedObjective({
  //       id: "All",
  //       ObjectiveName: "All",
  //     });
  //   }
  // };

  const handleClickDiscard = async () => {
    setPage(1);
    setRowsPerPage(10);
    fetchObjectives(url);
  };
  const handleModalDiscard = () => {
    setSearchModalText("");
    fetchModalData();
  };
  const handleSearchChangeNew = (e: any) => {
    e.preventDefault();
    setsearchQuery({
      searchQuery: e.target.value,
    });
  };
  const getObjOwnersList = async () => {
    try {
      let result;
      if (selectedLocation.id !== "All" && deptId !== "All")
        result = await axios.get(
          `/api/kpi-definition/getObjOwners?locationId=${selectedLocation.id}&entityId=${deptId}`
        );
      // console.log("result", result?.data);
      if (result?.data?.owner?.length > 0) {
        setOwners(result?.data?.owner);
      } else {
        setOwners([]);
      }
    } catch (error) {
      console.log("error");
    }
  };
  // console.log("selectedObjective", owners);
  const handleTableSearch = () => {
    setPage(1);
    setRowsPerPage(10);
    const url = `api/objective/searchObjectMaster?text=${searchQuery.searchQuery}&ObjectivePeriod=${currentYear}`;
    fetchObjectives(url);
  };

  const handleChangePageNew = (page: any, pageSize: any = rowsPerPage) => {
    setPage(page);
    setRowsPerPage(pageSize);
    const changeUrl = formatDashboardQuery(
      `/api/objective/getAllObjectMaster`,
      {
        page: page,
        limit: rowsPerPage,
        locationId: selectedLocation.id,
        year: currentYear,
        deptId: deptId,
        scopeType: selectedOption,
        selectedScopetype: [],
      }
    );
    fetchObjectives(changeUrl);
  };
  const handleModalPageChange = (page: any, pageSize: any = rowsPerPage) => {
    setModalPage(page);
    setModalRowsPerPage(pageSize);
  };

  // const expandIcon = ({ expanded, onExpand, record }: any) => {
  //   const icon = expanded ? <MinusCircleOutlined /> : <PlusCircleOutlined />;
  //   // console.log("record in expand", record.children);
  //   if (record?.kraList?.length > 0) {
  //     return <a onClick={(e) => onExpand(record, e)}>{icon}</a>;
  //   }
  //   return null;
  // };

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

  const shouldDisplayButton =
    isMr ||
    isMCOE ||
    isUserHead ||
    owners.some((owner: any) => owner.id === userDetails.id) ||
    userDetails?.userType === "globalRoles";

  return (
    <>
      {matches ? (
        ""
      ) : (
        <div style={{ position: "absolute", top: "85px", right: "60px" }}>
          <FilterIcon
            style={{ width: "24px", height: "24px" }}
            onClick={showModal}
          />
        </div>
      )}

      <div className={classes.root}>
        {/* <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            // marginTop: "20px",
          }}
        >
          {matches ? (
            <>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "50%",
                }}
              >
                <div className={classes.SearchBox}>
                  <FormControl variant="outlined" size="small" fullWidth>
                    <div style={{ width: "170px" }}>
                      <Autocomplete
                        // multiple
                        id="location-autocomplete"
                        // className={classes.inputRootOverride}
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
                        onChange={(event, values) => {
                          handleChangeList(event, values);
                        }}
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
                </div>
                <div className={classes.SearchBox}>
                  <div style={{ width: "160px" }}>
                    <FormControl variant="outlined" size="small" fullWidth>
                      <InputLabel htmlFor="select">Objective Type</InputLabel>
                      <MuiSelect
                        // labelId="select-label"
                        id="select"
                        value={selectedOption}
                        onChange={handleChange}
                        label="Select Scope type" // Ensures label works with Select component
                        style={{
                          borderRadius: "10px",
                          width: "100%",
                        }}
                      >
                        <MenuItem value="Department">Department</MenuItem>
                        <MenuItem value="Unit">Unit</MenuItem>
                      </MuiSelect>
                    </FormControl>
                  </div>
                </div>
                {selectedOption === "Department" && (
                  <div className={classes.SearchBox}>
                    <FormControl variant="outlined">
                      <div
                        style={{
                          width: "250px",
                          paddingTop: "8px",
                          paddingLeft: "5px",
                        }}
                      >
                        <DepartmentSelector
                          locationId={selectedLocation?.id}
                          selectedDepartment={selectedDept}
                          onSelect={(dept, type) => {
                            setSelectedDept({ ...dept, type });
                            setDeptId(dept?.id);
                          }}
                          onClear={() => setSelectedDept(null)}
                        />
                      </div>
                    </FormControl>
                  </div>
                )}

                {selectedOption === "Function" && (
                  <div className={classes.SearchBox}>
                    <FormControl variant="outlined">
                      <div style={{ width: "170px" }}>
                        <Autocomplete
                          disablePortal
                          id="combo-box-demo"
                          options={[allFuncOption, ...funcOptions]}
                          onChange={handleFunction}
                          value={getFuncSelectedItem()}
                          getOptionLabel={(option) => option.name || ""}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              variant="outlined"
                              size="small"
                              label="Function"
                              fullWidth
                            />
                          )}
                        />
                      </div>
                    </FormControl>
                  </div>
                )}
                <div>
                  {((isMR
                    ? userDetails?.location?.id === selectedLocation?.id ||
                      (userDetails.additionalUnits?.length > 0 &&
                        userDetails.additionalUnits?.includes(
                          selectedLocation?.id
                        ))
                    : false) ||
                    isUserHead ||
                    isMCOE ||
                    owners?.some(
                      (owner: any) => owner?.id === userDetails?.id
                    )) && (
                    <Tooltip title="Copy Objectives For next year">
                      <Button
                        // variant="contained"
                        style={{
                          marginLeft: "20px",
                          backgroundColor: "#003059",
                          color: "white",
                        }}
                        color="primary"
                        onClick={handleButtonClick}
                      >
                        Copy Objectives
                      </Button>
                    </Tooltip>
                  )}
                </div>
              </div>
            </>
          ) : (
            " "
          )}
          
          {matches ? (
            <div
              style={{
                display: "flex",
                // justifyContent: "end",
                marginRight: "100px",
              }}
            >
              <YearComponent
                currentYear={currentYear}
                setCurrentYear={setCurrentYear}
              />
            </div>
          ) : (
            ""
          )}

          <div
            style={
              matches
                ? {
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }
                : {
                    width: "100%",
                    display: "flex",
                    justifyContent: smallScreen ? "flex-end" : "center",
                  }
            }
          >
            <div
              style={
                matches
                  ? {}
                  : { position: "absolute", top: "70px", right: "10px" }
              }
            >
              <Tooltip title="My Objectives">
                <IconButton
                  onClick={() => {
                    setOpenAction(!openAction);
                  }}
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
                      style={{ color: "#444", height: "31px", width: "30px" }}
                    />
                  )}
                </IconButton>
              </Tooltip>
            </div>

            <div>
              <SearchBar
                placeholder="Search Objectives"
                name="searchQuery"
                values={searchQuery}
                handleChange={handleSearchChangeNew}
                handleApply={handleTableSearch}
                endAdornment={true}
                handleClickDiscard={() => {
                  setsearchQuery({
                    searchQuery: "",
                  });
                  handleClickDiscard();
                }}
              />
            </div>
          </div>
        </div> */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            padding: "12px 0px",
            width: "100%",
          }}
        >
          {/* Left Section: Search + Filter Toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flex: 1,
            }}
          >
            <div>
              <SearchBar
                placeholder="Search Objectives"
                name="searchQuery"
                values={searchQuery}
                handleChange={handleSearchChangeNew}
                handleApply={handleTableSearch}
                endAdornment={true}
                handleClickDiscard={() => {
                  setsearchQuery({ searchQuery: "" });
                  handleClickDiscard();
                }}
              />
            </div>
            <div
              className={classes.filterButton}
              onClick={() => setShowFilters(!showFilters)}
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                border: "1px solid #ccc",
                padding: "4px 10px",
                borderRadius: "5px",
                background: "#f8f8f8",
              }}
            >
              {showFilters ? (
                <AiFillFilter size={18} />
              ) : (
                <AiOutlineFilter size={18} />
              )}
              <span style={{ marginLeft: "6px" }}>
                {showFilters ? "Hide Filters" : "Show Filters"}
              </span>
            </div>
          </div>

          {/* Right Section: Year + My Objectives */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              flex: 1,
              justifyContent: "end",
            }}
          >
            <Tooltip title="My Objectives">
              <IconButton onClick={() => setOpenAction(!openAction)}>
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
                    style={{ color: "#444", height: "31px", width: "30px" }}
                  />
                )}
              </IconButton>
            </Tooltip>
            {matches && shouldDisplayButton ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Tooltip title="Create Objective">
                  <Button
                    // size="medium"
                    className={classes.buttonStyle}
                    onClick={() => {
                      setObjectiveId("");
                      setFormType("create");
                      setAddModalOpen(true);
                      setDrawer({ ...drawer, open: !drawer.open });
                    }}
                  >
                    Create
                  </Button>
                </Tooltip>
              </div>
            ) : (
              ""
            )}
          </div>
        </div>

        {/* Filters Row */}
        {showFilters && (
          <div
            style={{
              display: "flex",
              gap: "20px",
              padding: "12px 24px",
              backgroundColor: "#f9fafb",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              marginBottom: "16px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {/* Unit/Corp Func */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                width: "290px",
              }}
            >
              <label
                style={{
                  fontWeight: 500,
                  fontSize: "14px",
                  color: "#374151",
                  width: "75px",
                }}
              >
                Unit:
              </label>
              <Autocomplete
                options={
                  Array.isArray(locationNames)
                    ? [allOption, ...locationNames]
                    : [allOption]
                }
                getOptionLabel={(option) => option.locationName || ""}
                value={selectedLocation}
                onChange={handleChangeList}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    variant="outlined"
                    fullWidth
                    placeholder="Select Unit"
                  />
                )}
                fullWidth
              />
            </div>

            {/* Objective Type */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                width: "290px",
              }}
            >
              <label
                style={{
                  fontWeight: 500,
                  fontSize: "14px",
                  color: "#374151",
                  width: "100px",
                }}
              >
                Objective Type:
              </label>
              <FormControl variant="outlined" size="small" fullWidth>
                <MuiSelect
                  id="select"
                  value={selectedOption}
                  onChange={handleChange}
                  label="Objective Type"
                  style={{ borderRadius: "10px" }}
                >
                  <MenuItem value="Department">Department</MenuItem>
                  <MenuItem value="Unit">Unit</MenuItem>
                </MuiSelect>
              </FormControl>
            </div>

            {/* Department or Function based on selectedOption */}
            {/* {selectedOption === "Department" && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  width: "290px",
                }}
              >
                <label
                  style={{
                    fontWeight: 500,
                    fontSize: "14px",
                    color: "#374151",
                    width: "92px",
                  }}
                >
                  Department:
                </label>
                <Autocomplete
                  options={[allDeptOption, ...deptOptions]}
                  getOptionLabel={(option) => option.entityName || ""}
                  value={getDeptSelectedItem()}
                  onChange={handleDepartment}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      variant="outlined"
                      fullWidth
                      placeholder="Select Department"
                    />
                  )}
                  fullWidth
                />
              </div>
            )} */}
            {selectedOption === "Department" && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  width: "300px",
                }}
              >
                <label
                  style={{
                    fontWeight: 500,
                    fontSize: "14px",
                    color: "#374151",
                    width: "92px",
                  }}
                >
                  Entity:
                </label>

                <DepartmentSelector
                  locationId={selectedLocation?.id}
                  selectedDepartment={selectedDept}
                  onSelect={(dept, type) => {
                    setSelectedDept({ ...dept, type }), setDeptId(dept?.id);
                  }}
                  onClear={() => setSelectedDept(null)}
                />
              </div>
            )}

            {selectedOption === "Function" && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  width: "290px",
                }}
              >
                <label
                  style={{
                    fontWeight: 500,
                    fontSize: "14px",
                    color: "#374151",
                    width: "92px",
                  }}
                >
                  Function:
                </label>
                <Autocomplete
                  options={[allFuncOption, ...funcOptions]}
                  getOptionLabel={(option) => option.name || ""}
                  value={getFuncSelectedItem()}
                  onChange={handleFunction}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      variant="outlined"
                      fullWidth
                      placeholder="Select Function"
                    />
                  )}
                  fullWidth
                />
              </div>
            )}

            {/* Copy Objectives Button */}
            <div>
              {((isMR
                ? userDetails?.location?.id === selectedLocation?.id ||
                  (userDetails.additionalUnits?.length > 0 &&
                    userDetails.additionalUnits?.includes(selectedLocation?.id))
                : false) ||
                isUserHead ||
                isMCOE ||
                owners?.some(
                  (owner: any) => owner?.id === userDetails?.id
                )) && (
                <Tooltip title="Copy Objectives For next year">
                  <Button
                    style={{
                      backgroundColor: "#003059",
                      color: "white",
                    }}
                    onClick={handleButtonClick}
                  >
                    Copy Objectives
                  </Button>
                </Tooltip>
              )}
            </div>
            <YearComponent
              currentYear={currentYear}
              setCurrentYear={setCurrentYear}
            />
          </div>
        )}

        {/* <div style={{ marginTop: "5px" }}>
          <Col span={24}> */}
        {matches ? (
          <div style={{ display: graphOpen ? "flex" : "", marginTop: "10px" }}>
            <div
              className={classes.tableContainerScrollable}
              style={{ paddingTop: graphOpen ? "42px" : "" }}
            >
              {tableData && tableData?.length > 0 ? (
                <Table
                  className={classes.tableContainer}
                  columns={columns}
                  dataSource={tableData}
                  size="middle"
                  pagination={false}
                  // rowKey={"_id"}
                  // bordered
                  expandedRowKeys={expandedRows}
                  onExpandedRowsChange={setExpandedRows}
                  expandable={{
                    //   expandIcon: ({ expanded, onExpand, record }: any) => {
                    //     if (record.children && record.children.length > 0) {
                    //       return expanded ? (
                    //         <KeyboardArrowDownRoundedIcon
                    //           className={classes.groupArrow}
                    //           onClick={(e: any) => onExpand(record, e)}
                    //         />
                    //       ) : (
                    //         <ChevronRightRoundedIcon
                    //           className={classes.groupArrow}
                    //           onClick={(e: any) => onExpand(record, e)}
                    //         />
                    //       );
                    //     }
                    //     return null;
                    //   },
                    // }}
                    rowExpandable: (record) => record?.kraList?.length,
                    expandedRowRender: (record: any) => {
                      return (
                        <Table
                          className={classes.subTableContainer}
                          style={{
                            width: 1200,
                            paddingBottom: "20px",
                            paddingTop: "20px",
                          }}
                          columns={subColumns}
                          rowKey={"_id"}
                          bordered
                          dataSource={
                            record?.kraList?.length > 0 ? record?.kraList : []
                          }
                          pagination={false}
                        />
                      );
                    },
                    //expandIcon,
                  }}
                  rowKey={"_id"}
                  // className={classes.objectiveTable}
                  rowClassName={rowClassName}
                  onRow={(record) => ({
                    onMouseEnter: () => handleMouseEnter(record),
                    onMouseLeave: handleMouseLeave,
                  })}
                />
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
                    handleChangePageNew(page, pageSize);
                  }}
                />
              </div>
            </div>

            <Modal
              visible={modalVisible}
              onCancel={handleModalClose}
              // onOk={handleUpdateOwners}
              footer={null}
              width={modalWidth}
              // style={{ maxHeight: "350px" }}
              maskClosable={true}
              className={classes.customModal}
              closeIcon={
                <img
                  src={CloseIconImageSvg}
                  alt="close-drawer"
                  style={{ width: "36px", height: "38px", cursor: "pointer" }}
                />
              }
            >
              <div
                style={{
                  display: "flex",
                  alignItems: matches ? "center" : "flex-start",
                  paddingTop: "15px",
                  paddingBottom: "15px",
                  flexDirection: matches ? "row" : "column",
                  gap: "15px",
                }}
              >
                <h4 style={{ margin: 2 }}>
                  Copy Objectives For Year : {""}
                  {generateYearOptions()}
                </h4>
                <div
                  style={{
                    display: "flex",
                    flexDirection: smallScreen ? "row" : "column",
                    gap: smallScreen ? "0px" : "15px",
                  }}
                >
                  <FormControl
                    variant="outlined"
                    size="small"
                    style={{ width: "220px", marginLeft: "10px" }}
                  >
                    <Autocomplete
                      id="location-autocomplete"
                      options={
                        Array.isArray(locationNames) ? locationNames : []
                      }
                      getOptionLabel={(option) => option.locationName || ""}
                      getOptionSelected={(option, value) =>
                        option.id === value.id
                      }
                      value={selectedModalLocation}
                      onChange={(event, values) =>
                        handleChangeModalList(event, values)
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          size="small"
                          label="Unit"
                          fullWidth
                        />
                      )}
                    />
                  </FormControl>
                  <FormControl
                    variant="outlined"
                    style={{ width: "220px", marginLeft: "10px" }}
                  >
                    <Autocomplete
                      disablePortal
                      id="combo-box-demo"
                      options={
                        (isMR
                          ? userDetails.location?.id === selectedLocation?.id ||
                            (userDetails.additionalUnits?.length > 0 &&
                              userDetails.additionalUnits?.includes(
                                selectedLocation?.id
                              ))
                          : false) || isMCOE
                          ? [allDeptOption, noneDeptOption, ...modalDeptOptions]
                          : modalDeptOptions
                      }
                      onChange={handleModalDepartment}
                      value={getModalDeptSelectedItem()}
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
                  </FormControl>
                </div>
              </div>

              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: smallScreen ? "row" : "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectAll}
                        onChange={handleSelectAllObjectives}
                        color="primary"
                        style={{ marginRight: "10px", fontWeight: "bold" }}
                      />
                    }
                    label={
                      <span style={{ fontWeight: "bold" }}>Select All</span>
                    }
                  />
                </div>
                <div>
                  <TextField
                    fullWidth
                    name="search"
                    value={searchModalText}
                    placeholder="Search Objective"
                    onChange={handleSearchChange}
                    style={{
                      width: smallScreen ? "350px" : "90%",
                      marginRight: "10px",
                      // marginLeft: "20px",
                    }}
                    InputProps={{
                      style: {
                        fontWeight: "bold",
                        fontSize: "15px",
                        marginBottom: "5px",
                      },
                      startAdornment: (
                        <InputAdornment
                          position="start"
                          className={classes.iconButton}
                        >
                          <MdSearch />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <>
                          {searchModalText && (
                            <InputAdornment position="end">
                              <IconButton onClick={handleModalDiscard}>
                                <MdClose fontSize="small" />
                              </IconButton>
                            </InputAdornment>
                          )}
                        </>
                      ),
                    }}
                  />
                </div>
                <div
                  style={
                    smallScreen
                      ? {}
                      : {
                          position: "absolute",
                          right: "20px",
                          marginTop: "5px",
                        }
                  }
                >
                  <Button
                    // variant="contained"
                    style={{
                      // marginLeft: matches ? "300px" : "10px",
                      maxHeight: "35px",
                    }}
                    color="primary"
                    onClick={handleCopy}
                  >
                    Copy
                  </Button>
                </div>
              </div>
              <div
                className={classes.tableContainer}
                style={{ marginTop: "10px" }}
              >
                <Table
                  columns={modalColumns}
                  dataSource={modalData}
                  pagination={false}
                  rowSelection={{
                    type: "checkbox",
                    ...rowSelection,
                  }}
                  rowKey="_id"
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  paddingTop: "10px",
                }}
              >
                <Pagination
                  size="small"
                  current={modalPage}
                  pageSize={modalRowsPerPage}
                  total={modalCount}
                  showTotal={showModalTotal}
                  showSizeChanger
                  showQuickJumper
                  onChange={(page, pageSize) => {
                    handleModalPageChange(page, pageSize);
                  }}
                />
                {matches ? (
                  <Tooltip title="Click to Expand/Shrink">
                    <AiOutlineArrowsAlt
                      style={{
                        fontSize: "24px",
                        cursor: "pointer",
                        paddingLeft: "10px",
                      }}
                      onClick={handleExpandModal}
                    />
                  </Tooltip>
                ) : (
                  ""
                )}
              </div>
            </Modal>
            {/* {graphOpen === true && tableData && tableData?.length > 0 && (
                <div style={{ width: "65%" }}>
                  <GanttChart fetchObjectives={fetchObjectives} url={url} />
                </div>
              )} */}
          </div>
        ) : (
          ""
        )}

        {matches ? (
          ""
        ) : (
          <>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-evenly",
                // height: "100vh",
                // overflowY: "scroll",
              }}
            >
              {tableData?.map((record: any) => (
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
                    onClick={() => handleClick(record)}
                    style={{
                      padding: "3px 10px",
                      backgroundColor: "#9fbfdf",
                      borderRadius: "2px",
                      cursor: "pointer",
                      fontWeight: 600,
                      // color: "white",
                    }}
                  >
                    {record?.ObjectiveName}
                  </p>
                  {/* <p>Objective Type : {record?.ScopeType}</p> */}
                  <p>Obj For : {record?.ScopeDetails?.name}</p>
                  {/* <p>
                    Parent Objective:{" "}
                    <span
                      onClick={() => {
                        handleEdit(record?.parentObjectiveDetails?._id);
                        setRead(record.EditerAccess);
                      }}
                      style={{
                        textDecorationLine: "underline",
                        cursor: "pointer",
                      }}
                    >
                      {" "}
                      {record?.parentObjectiveDetails?.ObjectiveName}
                    </span>
                  </p> */}
                  <p>Obj Owner : {record.OwnerName}</p>
                  <p>Unit : {record.locationName}</p>
                  {/* <p>Dept:{record.entityName}</p>
                  <p>
                    Created On:
                    {<>{moment(record?.createdAt).format("DD-MM-YYYY")}</>}
                  </p> */}
                </div>
              ))}
            </div>
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
                  handleChangePageNew(page, pageSize);
                }}
              />
            </div>
          </>
        )}

        {/* </Col>
        </div> */}
        {/* <Input
                size="middle"
                placeholder="Search Objective"
                onChange={(event: any) => setSearch(event.target.value)}
                prefix={<MdSearch />}
              /> */}
        <div className={classes.modalBox}>
          {!!drawer.open && (
            <ObjectiveDrawer
              addModalOpen={addModalOpen}
              setAddModalOpen={setAddModalOpen}
              fetchObjectives={fetchObjectives}
              ObjectiveId={ObjectiveId}
              formType={formType}
              tableData={tableData}
              setTableData={setTableData}
              drawer={drawer}
              setDrawer={setDrawer}
              url={url}
              currentYear={currentYear}
              read={read}
            />
          )}
        </div>
        <div>
          {/* {!!kraModal.open && (
            <KraDrawer
              kraModal={kraModal}
              setKraModal={setKraModal}
              fetchObjectives={fetchObjectives}
              tableData={tableData}
              setTableData={setTableData}
              kraDrawer={kraDrawer}
              setKraDrawer={setKraDrawer}
              url={url}
            />
          )} */}
        </div>

        {/* {!!commentsModal.open && (
          <CommentsModal
            commentsModal={commentsModal}
            setCommentsModal={setCommentsModal}
            fetchObjectives={fetchObjectives}
          />
        )} */}
        {/* {!!reviewModal.open && (
          <ReviewModal
            reviewModal={reviewModal}
            setReviewModal={setReviewModal}
          />
        )} */}
        {/* {!!changeVisibilityModalOpen && (
          <Modal
            title="Set Visibility"
            centered
            open={changeVisibilityModalOpen}
            onOk={() => {
              let url = formatDashboardQuery(
                `/api/objective/getAllObjectMaster`,
                {
                  year: currentYear,
                  page: page,
                  limit: rowsPerPage,
                  locationId: selectedLocation,
                }
              );
              putVisibility(formData);
              fetchObjectives(url);
              setChangeVisibilityModalOpen(false);
              return null;
            }}
            onCancel={() => setChangeVisibilityModalOpen(false)}
            style={{ minWidth: "50%" }}
            className={classes.modal}
          >
            <Form
              layout="vertical"
              form={firstForm}
              onValuesChange={(changedValues, allValues) =>
                setFormData(allValues)
              }
            >
              <div style={{ padding: "5px" }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Readers Type: " name="Readers">
                      <Select
                        defaultValue={"Select Readers Type"}
                        placeholder="Select Readers Type"
                        options={Readers}
                        onChange={(value) => setReaders(value)}
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Readers : " name="ReadersList">
                      <Select
                        aria-label="Select Readers"
                        defaultValue={"Select Readers"}
                        placeholder="Select Readers"
                        options={readersTypeOptions}
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            </Form>
          </Modal>
        )} */}
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
        className={classes.modal2}
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
          // className={classes.SearchBox}
        >
          <FormControl variant="outlined" size="small" fullWidth>
            <div style={{ width: "100%" }}>
              <Autocomplete
                // multiple
                id="location-autocomplete"
                // className={classes.inputRootOverride}
                options={
                  Array.isArray(locationNames)
                    ? [allOption, ...locationNames]
                    : [allOption]
                }
                getOptionLabel={(option) => option.locationName || ""}
                getOptionSelected={(option, value) => option.id === value.id}
                value={selectedLocation}
                onChange={(event, values) => {
                  handleChangeList(event, values);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    size="small"
                    label="Unit"
                    fullWidth
                  />
                )}
              />
            </div>
          </FormControl>

          <div style={{ width: "100%" }}>
            <FormControl variant="outlined" size="small" fullWidth>
              <InputLabel htmlFor="select">Objective Type</InputLabel>
              <MuiSelect
                // labelId="select-label"
                id="select"
                value={selectedOption}
                onChange={handleChange}
                label="Select Scope type" // Ensures label works with Select component
                style={{
                  // borderRadius: "10px",
                  width: "100%",
                }}
              >
                <MenuItem value="Department">Department</MenuItem>
                <MenuItem value="Unit">Unit</MenuItem>
              </MuiSelect>
            </FormControl>
          </div>

          {selectedOption === "Department" && (
            <FormControl variant="outlined" size="small" fullWidth>
              <div style={{ width: "100%" }}>
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
          )}

          {selectedOption === "Function" && (
            <FormControl variant="outlined" size="small" fullWidth>
              <div style={{ width: "100%" }}>
                <Autocomplete
                  disablePortal
                  id="combo-box-demo"
                  options={[allFuncOption, ...funcOptions]}
                  onChange={handleFunction}
                  value={getFuncSelectedItem()}
                  getOptionLabel={(option) => option.name || ""}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      size="small"
                      label="Function"
                      fullWidth
                    />
                  )}
                />
              </div>
            </FormControl>
          )}
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {((isMR
              ? userDetails.location?.id === selectedLocation?.id ||
                (userDetails.additionalUnits?.length > 0 &&
                  userDetails.additionalUnits?.includes(selectedLocation?.id))
              : false) ||
              isUserHead ||
              isMCOE) && (
              <Tooltip title="Copy Objectives For next year">
                <Button
                  // variant="contained"
                  style={{
                    // marginLeft: "10px",
                    backgroundColor: "#003059",
                    color: "white",
                  }}
                  color="primary"
                  onClick={handleButtonClick}
                >
                  Copy Objectives
                </Button>
              </Tooltip>
            )}
            <YearComponent
              currentYear={currentYear}
              setCurrentYear={setCurrentYear}
            />
          </div>
          {/* <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "start",
            }}
          >
           
          </div> */}
        </div>

        {/* </div> */}
      </Modal>
    </>
  );
};

export default ObjectiveTable;
