import { useState, useEffect, ChangeEvent } from "react";
import {
  Button,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemSecondaryAction,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
  Dialog,
  DialogActions,
  DialogTitle,
  Chip,
} from "@material-ui/core";
import { MdDelete } from "react-icons/md";
import KpiDefinitionTable from "components/KpiDefinitionTable";
import { MdOutlineCancel } from "react-icons/md";
import { Autocomplete } from "@material-ui/lab";
import ConfirmDialog from "components/ConfirmDialog";
import { useSnackbar } from "notistack";
import { makeStyles } from "@material-ui/core/styles";
import axios from "apis/axios.global";
import checkRole from "utils/checkRoles";
import { roles } from "utils/enums";
import checkRoles from "utils/checkRoles";
import { MdInbox } from "react-icons/md";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { Drawer, Form, Modal, Upload, UploadProps } from "antd";
import { API_LINK } from "config";
import { PaginationProps } from "antd";
import getAppUrl from "utils/getAppUrl";
import { Select as AntSelect } from "antd";
import { MdClose } from "react-icons/md";
import React from "react";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
// import SelectKPI from "pages/CARA/KPIIntegration/SelectKPI";
import MonitoringRules from "./MonitoringRules";
import { isValid } from "utils/validateInput";
import DepartmentSelector from "components/ReusableComponents/DepartmentSelector";

const useStyles = makeStyles((theme) => ({
  fabButton: {
    backgroundColor: theme.palette.primary.light,
    color: "#fff",
    margin: "0 5px",
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    },
  },
  customModal: {
    "& .ant-modal-close": {
      color: "rgb(0, 48, 89);",
      fontSize: "20px",
    },
    "& .ant-modal-close:hover": {
      color: "rgb(0, 48, 89);",
    },
  },
  iconButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
  downloadIcon: {
    fill: "#0E497A",
    cursor: "pointer",
    width: "32px",
    height: "40px",
    // marginRight: "30px",
  },
  uploadSection: {
    "& .ant-upload-list-item-name": {
      color: "blue !important",
    },
  },
  imgContainer: {
    display: "flex",
    justifyContent: "center",
  },
  emptyDataText: {
    fontSize: theme.typography.pxToRem(14),
    color: theme.palette.primary.main,
  },
  tableContainerScrollable: {
    marginBottom: "20px",
    maxHeight: "calc(76vh - 20vh)",
    overflowY: "auto",
    overflowX: "auto",
    "&::-webkit-scrollbar": {
      width: "8px",
      height: "10px",
      backgroundColor: "#e5e4e2",
    },
    "&::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "grey",
    },
    antTableCell: {
      padding: "4px!important", // Adjust the padding to reduce row height
    },
  },
  tableContainer: {
    maxHeight: "calc(76vh - 20vh)",
    overflowX: "hidden",
    overflowY: "auto",

    "& .ant-table-wrapper .ant-table.ant-table-bordered > .ant-table-container > .ant-table-summary > table > tfoot > tr > td":
      {
        borderInlineEnd: "none",
      },

    "& .ant-table-thead .ant-table-cell": {
      backgroundColor: "#E8F3F9",
      borderBottom: "1px solid #003059",
      color: "#00224E",
    },
    "& span.ant-table-column-sorter-inner": {
      color: "#00224E",
    },
    "& span.ant-tag": {
      display: "flex",
      width: "60px",
      padding: "5px 0px",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: "10px",
      color: "white",
    },
    "& .ant-table-wrapper .ant-table-thead > tr > th": {
      position: "sticky",
      top: 0,
      zIndex: 2,
      fontWeight: 600,
      fontSize: "14px",
      padding: "6px 8px !important",
      lineHeight: "24px",
    },
    "& .ant-table-tbody > tr > td": {
      borderBottom: "1px solid #f0f0f0",
      padding: "6px !important",
    },
    "& .ant-table-body": {
      maxHeight: "200px",
      overflowY: "auto",
      overflowX: "hidden",
      "&::-webkit-scrollbar": {
        width: "5px !important",
        height: "10px !important",
        backgroundColor: "white",
      },
      "&::-webkit-scrollbar-thumb": {
        borderRadius: "5px !important",
        backgroundColor: "grey",
      },
    },
    "& tr.ant-table-row": {
      cursor: "pointer",
      transition: "all 0.1s linear",
      "&:hover": {
        backgroundColor: "white !important",
        boxShadow: "0 1px 0px #0003",
        transform: "scale(1.01)",
        "& td.ant-table-cell": {
          backgroundColor: "white !important",
        },
      },
    },
  },
  drawer: {
    "& .ant-drawer-right>.ant-drawer-content-wrapper": {
      transform: "translateX(-4px) !important",
      width: "400px !important",
      // transform : ({detailsDrawer}) => detailsDrawer ? "translateX(0px) !important" : "none"
    },
    "& .ant-drawer-wrapper-body": {
      // backgroundColor : "#F0F8FF !important"
    },
    "& .ant-drawer-header": {
      backgroundColor: "#e8f3f9",
      borderBottom: "1px solid rgb(0,0,0,0.20)",
      padding: "10px 7px",
      "& .ant-drawer-header-title .anticon anticon-close": {
        color: "white",
      },
      "& .ant-btn-default": {
        backgroundColor: "#e8f3f9",
        borderColor: "#0e497a",
        "& svg": {
          color: "#0e497a",
        },
      },
    },
  },
}));

function KpiDefinition() {
  const [filters, setFilters] = useState<any>({
    kpiLocations: "",
    kpiEntity: "",
    source: "",
  });
  const loggedInUser = JSON.parse(sessionStorage.getItem("userDetails") as any);
  const [locationOptions, setLocationOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [unitOptions, setUnitOptions] = useState<
    { value: string; type: string; typeId: string }[]
  >([]);
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
  const [unitId, setUnitId] = useState<string>(loggedInUser?.location?.id);
  const [deptId, setDeptId] = useState<string>(loggedInUser?.entity?.id);
  const [deptName, setDeptName] = useState<string>(
    loggedInUser?.entity?.entityName
  );
  const [deptOptions, setDeptOptions] = useState<any[]>([]);
  const [sourceOptions, setSourceOptions] = useState<
    { value: "Manual"; label: "Manual" }[]
  >([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [modalData, setModalData] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isManual, setIsManual] = useState(false);
  const [deleteKpi, setDeleteKpi] = useState<any>();
  const [emptyRow, setEmptyRow] = useState<boolean>(false);
  const [searchText, setSearchText] = useState("");
  const isAdmin = checkRole(roles.admin);
  const isOrgAdmin = checkRole(roles.ORGADMIN);
  const isLocAdmin = checkRole(roles.LOCATIONADMIN);
  const isMr = checkRole(roles.MR);
  const isGeneral = checkRole(roles.GENERALUSER);
  const [importModel, setImportModel] = useState<any>({
    open: false,
  });
  const [fileList, setFileList] = useState<any>([]);
  const [kraData, setKraData] = useState<any[]>([]);
  const [heads, setHeads] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [existingKpi, setExistingKPI] = useState<any>({});
  const [temp, setTemp] = useState<any>({});
  const [importHistoricModel, setImportHistoricModel] = useState<any>({
    open: false,
  });
  const [modalTargetData, setModalTargetData] = useState<
    Record<string, string>
  >({});
  const uploadProps: UploadProps = {
    multiple: false,
    beforeUpload: () => false,
    onChange({ file, fileList }) {
      if (
        file.status !== "uploading" &&
        file.status !== "removed" &&
        file.status !== "error"
      ) {
        setFileList(fileList);
      }
    },
    onRemove: (file: any) => {
      // if (!!existingFiles && existingFiles.length > 0) {
      //   setExistingFiles((prevState: any) =>
      //     prevState.filter((f: any) => f.uid !== file.uid)
      //   ); // Update the existingFiles state to remove the specific fil
      // }
      setFileList((prevState: any) =>
        prevState.filter((f: any) => f.uid !== file.uid)
      ); // Remove the specific file from the list
    },
    // fileList: formData?.file && formData.file.uid ? [formData.file] : [],
  };
  // console.log("filters,unitID,deptID", unitId, deptId, filters.source);
  const cols = [
    {
      header: "KPI Title *",
      accessorKey: "kpiName",
    },
    // {
    //   header: "Description",
    //   accessorKey: "description",
    // },
    {
      header: "Dept/Vertical",
      accessorKey: "entityName",
    },
    {
      header: "UoM *",
      accessorKey: "unitOfMeasure",
    },
    {
      header: "Frequency",
      accessorKey: "frequency",
    },

    {
      header: "TargetType",
      accessorKey: "targetType",
    },

    {
      header: "PnB Target",
      accessorKey: "kpiTarget",
    },
    {
      header: "Minimum Target",
      accessorKey: "kpiMinimumTarget",
    },
    {
      header: "OP*(Applicable?)",
      accessorKey: "op",
    },
    {
      header: "Summary Type",
      accessorKey: "displayType",
    },

    {
      header: "Category",
      accessorKey: "category",
    },

    {
      header: "Associated Objectives",
      accessorKey: "objectiveId",
    },
    {
      header: "Type",
      accessorKey: "type",
    },

    {
      header: "API Query",
      accessorKey: "query",
    },

    // {
    //   header: "UnitType",
    //   accessorKey: "unitType",
    // },
    // {
    //   header: "KPI ID",
    //   accessorKey: "kpiId",
    // },
  ];
  const shouldDisplayMinimumTarget = tableData?.some(
    (item) => item?.kpiTargetType === "Range"
  );
  const cols1: any = [
    {
      header: "KPI Title *",
      accessorKey: "kpiName",
    },
    //removed to adjust space
    // {
    //   header: "Description",
    //   accessorKey: "description",
    // },
    {
      header: "Dept/Vertical",
      accessorKey: "entityName",
    },
    {
      header: "UoM *",
      accessorKey: "unitOfMeasure",
    },
    {
      header: "Frequency",
      accessorKey: "frequency",
    },

    {
      header: "TargetType",
      accessorKey: "targetType",
    },

    {
      header: "PnB Target",
      accessorKey: "kpiTarget",
    },
    {
      header: "Minimum Target",
      accessorKey: "kpiMinimumTarget",
    },
    {
      header: "OP*(Applicable?)",
      accessorKey: "op",
    },
    {
      header: "Summary Type",
      accessorKey: "displayType",
    },
    {
      header: "Category",
      accessorKey: "category",
    },

    {
      header: "Associated Objectives",
      accessorKey: "objectiveId",
    },

    // {
    //   header: "UnitType",
    //   accessorKey: "unitType",
    // },
    // {
    //   header: "KPI ID",
    //   accessorKey: "kpiId",
    // },
  ];
  // console.log("filters.source", filters.source);
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const isMCOE = checkRoles("ORG-ADMIN");
  const isMR = checkRoles("MR");
  const userDetail = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const allOption = { value: "All", label: "All" };
  const [update, setUpdate] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [count, setCount] = useState<number>();
  const showTotal: PaginationProps["showTotal"] = (total) =>
    `Total ${total} items`;
  const allDeptOption = { id: "All", entityName: "All" };
  const realmName = getAppUrl();
  const [selectedDept, setSelectedDept] = useState<any>({});
  useEffect(() => {
    getLocationOptions();
    getDepartmentOptions();
    getUnitOptions();
    getAllKra();
    getKpiData();
  }, []);
  useEffect(() => {
    if (userDetail?.entityId) {
      fetchInitialDepartment(userDetail?.entityId);
    }
  }, [userDetail?.entityId]);
  useEffect(() => {
    // setFilters((prev: any) => ({ ...prev, source: "" }));
    getSourceOptions();
    getDepartmentOptions();
  }, [unitId]);
  // console.log("kraoptions in defintion page", kraData);
  const getLocationOptions = async () => {
    await axios(`/api/location/getLocationsForOrg/${realmName}`)
      .then((res) => {
        setLocationOptions(res?.data);
      })
      .catch((err) => console.error(err));
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
      console.error("Failed to fetch initial department:", error);
    }
  };
  // console.log("locationOptions on select", filters.kpiLocations);
  const handleDepartment = (event: any, values: any) => {
    //console.log("selected department", values);
    if (values && values?.id) {
      setDeptId(values?.id);
      setDeptName(values?.entityName);
    }
    setEmptyRow(false);
    // const url = `api/cara/getAllCara?orgid=${loggedInUser.organizationId}&currentYear=${currentYear}&locationId=${unitId}&page=${page}&limit=10`;
    // getData(url);
  };
  const getDeptSelectedItem = () => {
    const item = [allDeptOption, ...deptOptions].find((opt: any) => {
      if (opt.id === deptId) return opt;
    });
    return item || {};
  };
  const getSourceOptions = async () => {
    await axios(`/api/kpi-definition/getSource?location=${unitId}`)
      .then((res: any) =>
        setSourceOptions(
          res?.data?.map((obj: any) => ({
            value: obj.id,
            label: obj.sourceName,
          }))
        )
      )
      .catch((err: any) => console.error(err));
  };
  const getUnitOptions = async () => {
    await axios(`/api/kpi-definition/getAllUom`)
      .then((res: any) => {
        res.data?.result?.forEach((ut: any) => {
          ut.unitOfMeasurement.forEach((u: string) => {
            setUnitOptions((prev) => [
              ...prev,
              {
                value: u,
                type: ut.unitType,
                typeId: ut.id,
              },
            ]);
          });
        });
      })
      .catch((err: any) => console.error(err));
  };
  const getAllKra = async () => {
    try {
      const res = await axios.get("/api/objective/AllObjectives");
      if (res.status === 200 || res.status === 201) {
        if (res.data?.result.length > 0) {
          setKraData(
            res.data?.result?.map((kraObj: any) => ({
              id: kraObj._id,
              kraName: kraObj.ObjectiveCategory,
              value: kraObj._id,
              type: kraObj.ObjectiveCategory,
              // typeId: ut.id,
            }))
          );
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getKpiData = async (page: number = 1, pageSize: number = 10) => {
    if (filters.source) {
      // page=${page}&pageSize=${pageSize}&
      await axios(
        `/api/kpi-definition/getKpiBySource/${filters.source}?locationId=${unitId}&entityId=${deptId}&searchText=${searchText}`
      )
        .then((res: any) => {
          // console.log("res.data.data", res.data.data);
          setTableData(
            res.data?.data?.map((obj: any) => ({
              kpiId: obj._id,
              type: obj.kpiType,
              kpiName: obj?.kpiName,
              targetType: obj?.kpiTargetType,
              category: obj?.categoryId,
              frequency: obj?.frequency,
              entityName: obj.entityId?.entityName,
              displayType: obj?.displayType,
              kpiTarget: obj.kpiTarget,
              kpiMinimumTarget: obj?.kpiMinimumTarget,
              description: obj.kpiDescription,
              query: obj.apiEndPoint,
              unitOfMeasure: obj.uom,
              owner: obj?.owner,
              // category: obj.categoryId,
              unitType: unitOptions?.filter(
                (ut) => ut.typeId === obj.unitTypeId
              )[0]?.type,
              unitTypeId: obj.unitTypeId,
              objectiveId: obj?.objectiveId,
              op: obj?.op,
            }))
          );
          setCount(res?.data?.count);
        })
        .catch((err: any) => console.error(err));
    } else {
      setTableData([]);
      setSearchValue("");
    }
  };
  const getKpiDataForModal = async (
    page: number = 1,
    pageSize: number = 10
  ) => {
    if (filters.source) {
      await axios(
        `/api/kpi-definition/getKpiBySource/${filters.source}?page=${page}&pageSize=${pageSize}&locationId=${unitId}&entityId=${deptId}&searchText=${searchValue}`
      )
        .then((res: any) => {
          setModalData(
            res.data?.data?.map((obj: any) => ({
              kpiId: obj._id,
              type: obj.kpiType,
              kpiName: obj.kpiName,
              targetType: obj.kpiTargetType,
              category: obj.categoryId,
              frequency: obj.frequency,
              displayType: obj.displayType,
              kpiTarget: obj.kpiTarget,
              description: obj.kpiDescription,
              query: obj.apiEndPoint,
              unitOfMeasure: obj.uom,
              owner: obj?.owner,
              // category: obj.categoryId,
              unitType: unitOptions?.filter(
                (ut) => ut.typeId === obj.unitTypeId
              )[0]?.type,
              unitTypeId: obj.unitTypeId,
            }))
          );
          setModalCount(res?.data?.count);
        })
        .catch((err: any) => console.error(err));
    } else {
      setModalData([]);
      setSearchValue("");
    }
  };
  const exportKpis = async (bool: boolean) => {
    const response: any = await getAllKpisForExport();
    const requiredData: any[] = [];

    for (const element of response) {
      requiredData.push({
        kpiName: element.kpiName,
        kpiType: element.kpiType,
        kpiTargetType: element.kpiTargetType,
        kpiDescription: element.kpiDescription,
        locationId: element.location.join(", "),
        sourceId: element.source,
        uom: element.uom,
        displayType: element.displayType,
        apiEndPoint: element.apiEndPoint,
        // : element.role.props.data
        //   .map((dataRole: { role: any }) => dataRole.role)
        //   .join(", "),
        // Location: element.location.locationName
        //   ? element.location.locationName
        //   : "N/A",
        // Entity: element.entity,
      });
    }
    const sheet = XLSX.utils.json_to_sheet(requiredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Kpis");
    const excelBinaryString = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "binary",
    });
    const blob = new Blob([s2ab(excelBinaryString)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    if (tableData.length === 0 || bool) {
      saveAs(blob, "Kpis.xlsx");
      if (bool) {
        enqueueSnackbar(`Wrong Template Please View KpiTemplate`, {
          variant: "error",
        });
      }
    } else {
      enqueueSnackbar(`Export KPIs Successful`, {
        variant: "success",
      });
      saveAs(blob, "KPIs.xlsx");
    }
  };
  const getAllKpisForExport = async () => {
    const result = await axios.get(`/api/kpi-definition/getAllKpisForExport`);
    // console.log("result", result);
    return result.data;
  };
  const handleChangePage = (pageNumber: any, pageSize: any = rowsPerPage) => {
    // console.log("checkrisk pageSize", pageSize);
    setPage(pageNumber);
    setRowsPerPage(pageSize);

    getKpiData(pageNumber, pageSize);
  };

  const addEmptyRow = () => {
    setTableData((prev) => [
      {
        type: "GET",
        kpiName: "",
        targetType: "Increase",
        kpiFrequency: "",
        category: "",
        entityId: "",
        frequency: "",
        displayType: "",
        kpiTarget: "",
        description: "",
        query: "",
        unitOfMeasure: "",
        unitType: "",
        unitTypeId: "",
        kpiId: "",
        op: false,
        id: generateUniqueId(),
      },
      ...prev,
    ]);
  };
  const removeEmptyRow = () => {
    getKpiData(page, rowsPerPage);
    setEmptyRow(false);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
    // setOpen(true);
    handleDuplicateNameCreate();
  };
  const handleClose = () => {
    setOpenDialog(false);
    // return;
  };
  const getHistoricImportTemplate = async () => {
    const res = await axios.get(
      `/api/kpi-definition/getAllKpiForaLocationDeptForImport`
    );
    // console.log("res.data", res.data);
    let data = [];
    if (res.data) {
      data = res?.data?.map((item: any) => [
        item.location || "", // Location
        item.entity || "", // Department
        item.category || "", // Category
        item.kpiName || "", // KpiName
        "", // Apr-23 Target
        "", // Apr-23 Actual
        "", // May-23 Target
        "", // May-23 Actual
        "", // Jun-23 Target
        "", // Jun-23 Actual
        "", // Jul-23 Target
        "", // Jul-23 Actual
        "", // Aug-23 Target
        "", // Aug-23 Actual
        "", // Sep-23 Target
        "", // Sep-23 Actual
        "", // Oct-23 Target
        "", // Oct-23 Actual
        "", // Nov-23 Target
        "", // Nov-23 Actual
        "", // Dec-23 Target
        "", // Dec-23 Actual
        "", // Jan-24 Target
        "", // Jan-24 Actual
      ]);
    } else {
      // Sample data
      data = [
        [
          "a1",
          "e1",
          "Customer Centricity",
          "CPP MIS",
          30,
          30,
          31,
          31,
          30,
          30,
          31,
          31,
          31,
          31,
          30,
          30,
          31,
          31,
          30,
          30,
          31,
          31,
        ],
        [
          "a1",
          "e1",
          "Customer Centricity",
          "CBM Compliance",
          100,
          100,
          100,
          100,
          100,
          100,
          100,
          100,
          100,
          100,
          100,
          100,
          100,
          100,
          100,
          100,
          100,
          100,
        ],
        [
          "a1",
          "e1",
          "Cost",
          "Services",
          "",
          "",
          "",
          "",
          "",
          "",
          7.9,
          3.73,
          5,
          3,
          3.9,
          3.54,
          4.8,
          3.45,
          "",
          "",
          4.3,
          3.57,
        ],
      ];
    }

    const headers = [
      "Location",
      "Department",
      "Category",
      "KpiName",
      "Apr-23 Target",
      "Apr-23 Actual",
      "May-23 Target",
      "May-23 Actual",
      "Jun-23 Target",
      "Jun-23 Actual",
      "Jul-23 Target",
      "Jul-23 Actual",
      "Aug-23 Target",
      "Aug-23 Actual",
      "Sep-23 Target",
      "Sep-23 Actual",
      "Oct-23 Target",
      "Oct-23 Actual",
      "Nov-23 Target",
      "Nov-23 Actual",
      "Dec-23 Target",
      "Dec-23 Actual",
      "Jan-24 Target",
      "Jan-24 Actual",
    ];

    // Convert data to a worksheet
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // Create a new workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "KPIs");

    // Generate Excel file
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });

    // Save the file
    const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
    saveAs(blob, "KPIHistoricData_Template.xlsx");
  };
  const importHistoricKpis = async () => {
    try {
      const XLSX = require("xlsx");
      const formData = new FormData();
      formData.append("file", fileList[0].originFileObj);
      // console.log("import kpi called", formData);
      const response = await axios.post(
        `${API_LINK}/api/kpi-report/importReport`,
        formData
      );
      // console.log("response", response);
      if (response.data.success) {
        const headers = Object.keys(response.data.invalidKpis[0]);
        const invalidSheet = XLSX.utils.aoa_to_sheet(
          response.data.invalidKpis,
          { header: headers }
        );
        const invalidWorkbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(
          invalidWorkbook,
          invalidSheet,
          "Invalid Kpis"
        );
        const excelBinaryString = XLSX.write(invalidWorkbook, {
          bookType: "xlsx",
          type: "binary",
        });
        const blob = new Blob([s2ab(excelBinaryString)], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
        });
        saveAs(blob, "InvalidKpis.xlsx");
        enqueueSnackbar(`Some Kpis Failed Please Check InvalidKpis`, {
          variant: "warning",
        });
      }
      if (response.data.wrongFormat) {
        exportKpis(true);
      } else {
        enqueueSnackbar(`Kpis Imported Successfully`, {
          variant: "success",
        });
      }

      //   getKpiData(page, rowsPerPage);
    } catch (error) {
      console.log("error in uploading attachments", error);
    }
  };
  const getImportTemplate = () => {
    const headers = [
      "kpiName",
      "kpiDescription",
      "kpiTarget",
      "kpiTargetType",
      "locationId",
      "sourceId",
      "uom",
      "kpiType",
      "apiEndPoint",
      "kpiMinimumTarget",
      "entityId",
      "categoryId",
      "frequency",
    ];

    const data = [
      [
        "kpi1",
        "excelimport",
        900,
        "Increase",
        "a1",
        "Manual",
        "secs",
        "MANUAL",
        "",
        "",
        "e1",
        "Objective Category1",
        "",
      ],
      [
        "kpi2",
        "excelimport",
        900,
        "Decrease",
        "a1",
        "Manual",
        "secs",
        "MANUAL",
        "",
        "",
        "e1",
        "Objective Category1",
        "",
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "KPIs");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });
    const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
    saveAs(blob, "KPIMasterImportTemplate.xlsx");
  };
  const handleProceed = () => {
    // Handle the logic for proceeding here
    // console.log("table data in proceed", tableData);
    setOpenDialog(false);

    handleDuplicateCreate();
  };
  const handleChange = (e: any) => {
    // console.log("e", e);
    setFilters((prev: any) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setEmptyRow(false);
    if (e.target.name === "source" && e.target.value === "Manual") {
      setIsManual(true);
    }

    // console.log("filters on change", filters);
  };

  const handleLocation = (event: any, values: any) => {
    if (values && values?.id) {
      setUnitId(values?.id);
      setSelectedDept(null);
    }
    if (values?.id === "All") {
      setDeptId(values?.id);
      setSelectedDept({ ...{ id: "All", name: "All" }, type: "All" });
    }
  };
  // for autocomplete
  const handleChangeAdvance = (name: string, newValue: any[]) => {
    setFilters((prev: any) => ({
      ...prev,
      [name]: newValue,
    }));
  };
  const generateUniqueId = () => "_" + Math.random().toString(36).substr(2, 9);
  const handleSelectAll = (name: string, options: any[]) => {
    setFilters((prev: any) => ({
      ...prev,
      [name]: options.map((obj) => obj.value),
    }));
  };
  const handleSelectNone = (name: string) => {
    setFilters((prev: any) => ({ ...prev, [name]: [] }));
  };
  // const handleBlur = (row: any, index: number, modalData: any) => {
  //   console.log("row", row);
  //   const rowId = row.id || row.kpiId; // Use either existing ID or temporary ID

  //   if (!rowId) {
  //     console.error("Row ID is missing, cannot proceed with update");
  //     return;
  //   }

  //   // Update only the current page's data in tableData
  //   const newTableData = tableData.map((obj: any) => {
  //     if (obj.id === rowId) {
  //       // Use unique identifier for matching
  //       return {
  //         ...obj,
  //         unitType:
  //           unitOptions.find((unit) => unit.value === row.unitOfMeasure)
  //             ?.type || "",
  //         unitTypeId:
  //           unitOptions.find((unit) => unit.value === row.unitOfMeasure)
  //             ?.typeId || "",
  //         modalData, // Include modalData in the update
  //       };
  //     }
  //     return obj;
  //   });

  //   console.log("newTableData after map:", newTableData);

  //   // Proceed with your existing logic for handling the update or creation of the KPI
  //   const updatedRow = newTableData.find((item: any) => item.id === rowId);
  //   console.log("updatedRow:", updatedRow);

  //   if (!updatedRow) {
  //     console.error("updatedRow is undefined, cannot proceed with update");
  //     return;
  //   }

  //   if (updatedRow.kpiId) {
  //     if (
  //       isAdmin ||
  //       isOrgAdmin ||
  //       (isMR && userDetail.location.id === unitId) ||
  //       isMCOE ||
  //       isUserHead ||
  //       isUserSelected
  //     ) {
  //       if (
  //         updatedRow.kpiName &&
  //         updatedRow.category &&
  //         updatedRow.unitOfMeasure &&
  //         updatedRow.frequency
  //       ) {
  //         handleUpdate(updatedRow);
  //       } else {
  //         enqueueSnackbar("All fields are required for updating KPI.", {
  //           variant: "error",
  //         });
  //         getKpiData(page, rowsPerPage); // Re-fetch the data
  //       }
  //     } else {
  //       enqueueSnackbar("You are not allowed to edit KPI", {
  //         variant: "error",
  //       });
  //     }
  //   } else if (
  //     updatedRow.kpiName &&
  //     updatedRow.unitOfMeasure &&
  //     updatedRow.unitTypeId &&
  //     updatedRow.frequency &&
  //     updatedRow.category
  //   ) {
  //     if (
  //       isAdmin ||
  //       isOrgAdmin ||
  //       isLocAdmin ||
  //       isMr ||
  //       isMCOE ||
  //       isUserHead ||
  //       isUserSelected
  //     ) {
  //       handleCreate(updatedRow);
  //     } else {
  //       enqueueSnackbar("You are not allowed to create KPI", {
  //         variant: "error",
  //       });
  //     }
  //   }

  //   // Finally, update the current page's tableData
  //   setTableData(newTableData);
  // };

  // const handleBlur = (row: any, index: number, modalData: any) => {
  //   // console.log("inhandleblur", row, index);

  //   // Extract target data for different periods

  //   // Validate target data
  //   // if (!targets || !Array.isArray(targets) || targets.length === 0) {
  //   //   enqueueSnackbar(
  //   //     "Please provide target values for the required periods.",
  //   //     {
  //   //       variant: "error",
  //   //     }
  //   //   );
  //   //   return;
  //   // }

  //   const newTableData = tableData.map((obj: any) => {
  //     if (obj.kpiId === row.kpiId) {
  //       const t = unitOptions.find((unit) => unit.value === row.unitOfMeasure);
  //       return {
  //         ...row,
  //         unitType: t ? t.type : "",
  //         unitTypeId: t ? t.typeId : "",
  //       };
  //     }
  //     return obj;
  //   });

  //   setTableData(newTableData);
  //   const newRow = newTableData[index];

  //   // Augment newRow with targets
  //   const augmentedRow = {
  //     ...newRow,
  //     modalData,
  //   };

  //   if (augmentedRow.kpiId) {
  //     if (
  //       isAdmin ||
  //       isOrgAdmin ||
  //       (isMR &&
  //         (userDetail?.additionalUnits?.length > 0
  //           ? userDetail?.additionalUnits?.includes(unitId)
  //           : userDetail.location.id === unitId)) ||
  //       isMCOE ||
  //       isUserHead ||
  //       isUserSelected
  //     ) {
  //       if (
  //         augmentedRow.kpiName &&
  //         augmentedRow.category &&
  //         augmentedRow.unitOfMeasure &&
  //         augmentedRow.frequency
  //       ) {
  //         const isValidTitle = isValid(augmentedRow.kpiName);
  //         if (!isValidTitle.isValid) {
  //           enqueueSnackbar("Please enter valid kpi name ", {
  //             variant: "error",
  //           });
  //           return;
  //         }
  //         handleUpdate(augmentedRow);
  //       } else {
  //         enqueueSnackbar("All fields are required for updating KPI.", {
  //           variant: "error",
  //         });
  //         getKpiData(page, rowsPerPage);
  //       }
  //     } else {
  //       enqueueSnackbar("You are not allowed to edit KPI", {
  //         variant: "error",
  //       });
  //     }
  //   } else if (
  //     augmentedRow.kpiName &&
  //     augmentedRow.unitOfMeasure &&
  //     augmentedRow.unitTypeId &&
  //     augmentedRow.frequency &&
  //     augmentedRow.category
  //   ) {
  //     if (
  //       isAdmin ||
  //       isOrgAdmin ||
  //       isLocAdmin ||
  //       isMr ||
  //       isMCOE ||
  //       isUserHead ||
  //       isUserSelected
  //     ) {
  //       const isValidTitle = isValid(augmentedRow.kpiName);
  //       if (!isValidTitle.isValid) {
  //         enqueueSnackbar("Please enter valid kpi name !!", {
  //           variant: "error",
  //         });
  //         return;
  //       }
  //       handleCreate(augmentedRow);
  //     } else {
  //       enqueueSnackbar("You are not allowed to create KPI", {
  //         variant: "error",
  //       });
  //     }
  //   }
  // };
  const handleBlur = (row: any, index: number, modalData: any) => {
    console.log(
      "handle blur called row,index,row",
      row,
      index,
      modalData,
      update
    );
    // Check if frequency or targetType has changed

    const newTableData = tableData.map((obj: any) => {
      if (obj.kpiId === row.kpiId) {
        const t = unitOptions.find((unit) => unit.value === row.unitOfMeasure);
        return {
          ...row,
          unitType: t ? t.type : "",
          unitTypeId: t ? t.typeId : "",
        };
      }
      return obj;
    });

    setTableData(newTableData);
    const newRow = newTableData[index];
    // console.log("newRow", newRow);

    // Augment newRow with modalData
    const augmentedRow = {
      ...newRow,
      modalData,
    };

    if (augmentedRow.kpiId) {
      if (
        isAdmin ||
        isOrgAdmin ||
        (isMR &&
          (userDetail?.additionalUnits?.length > 0
            ? userDetail?.additionalUnits?.includes(unitId)
            : userDetail.location.id === unitId)) ||
        isMCOE ||
        isUserHead ||
        isUserSelected
      ) {
        if (
          augmentedRow.kpiName &&
          augmentedRow.category &&
          augmentedRow.unitOfMeasure &&
          augmentedRow.frequency
        ) {
          const isValidTitle = isValid(augmentedRow.kpiName);
          if (!isValidTitle.isValid) {
            enqueueSnackbar("Please enter valid KPI name.", {
              variant: "error",
            });
            return;
          }
          handleUpdate(augmentedRow);
        } else {
          enqueueSnackbar("All fields are required for updating KPI.", {
            variant: "error",
          });
          getKpiData(page, rowsPerPage);
        }
      } else {
        enqueueSnackbar("You are not allowed to edit KPI", {
          variant: "error",
        });
      }
    } else if (
      augmentedRow.kpiName &&
      augmentedRow.unitOfMeasure &&
      augmentedRow.unitTypeId &&
      augmentedRow.frequency &&
      augmentedRow.category
    ) {
      if (
        isAdmin ||
        isOrgAdmin ||
        isLocAdmin ||
        isMr ||
        isMCOE ||
        isUserHead ||
        isUserSelected
      ) {
        const isValidTitle = isValid(augmentedRow.kpiName);
        if (!isValidTitle.isValid) {
          enqueueSnackbar("Please enter valid KPI name!", {
            variant: "error",
          });
          return;
        }
        handleCreate(augmentedRow);
      } else {
        enqueueSnackbar("You are not allowed to create KPI", {
          variant: "error",
        });
      }
    }
  };

  const handleCreate = async (row: any) => {
    // console.log("row", row);
    const temp = {
      kpiType: row.type,
      kpiName: row.kpiName,
      kpiTargetType: row.targetType,
      unitTypeId: row.unitTypeId,
      kpiTarget: row.kpiTarget ? row.kpiTarget : "",
      uom: row.unitOfMeasure,
      sourceId: filters.source,
      apiEndPoint: row.query,
      kpiDescription: row.description,
      locationId: unitId,
      entityId: deptId,
      category: row.category,
      frequency: row.frequency,
      kpiMinimumTarget: row.kpiMinimumTarget,
      displayType: row.displayType ? row.displayType : "AVERAGE",
      op: row.op,
    };

    setTemp(temp);

    await axios
      .post(`/api/kpi-definition/createKpi`, temp)
      .then(async (response: any) => {
        // console.log("response", response);
        if (response.data?.response?.status === 409) {
          enqueueSnackbar("KPI name already exists for this location", {
            variant: "error",
          });

          setOpenDialog(true);

          setExistingKPI({
            //   {
            kpiId: response.data.response.data._id,
            type: response.data.response.data.kpiType,
            kpiName: response.data.response.data?.kpiName,
            targetType: response.data.response.data?.kpiTargetType,
            category: response.data.response.data?.categoryId,
            frequency: response.data.response.data?.frequency,
            entityName: response.data.response.data.entityId?.entityName,

            kpiTarget: response.data.response.data.kpiTarget,
            kpiMinimumTarget: response.data.response.data?.kpiMinimumTarget,
            description: response.data.response.data.kpiDescription,
            query: response.data.response.data.apiEndPoint,
            unitOfMeasure: response.data.response.data.uom,
            owner: response.data.response.data?.owner,
            displayType: response.data.response.data?.displayType,
            // category: response.data.data.categoryId,
            unitType: unitOptions?.filter(
              (ut) => ut.typeId === response.data.response.data.unitTypeId
            )[0]?.type,
            unitTypeId: response.data.response.data.unitTypeId,
            //   },
          });
          return;
        } else {
          // console.log("response.data.", response.data);
          try {
            await axios.post(
              `/api/kpi-definition/createPeriodWiseRecord/${response.data?._id}`,
              row.modalData
            );
          } catch (error) {
            console.log(
              "couldn't update data in period wise collection",
              error
            );
          }
          getKpiData(page, rowsPerPage).then(() => addEmptyRow());
          setModalTargetData({});
        }
      })
      .catch((err: any) => {
        // console.log("inside catch", err);
        // enqueueSnackbar("enter valid kpi target", { variant: "error" });
        console.error(err);
      });
    // getKpiData(page, rowsPerPage).then(() => addEmptyRow());
  };
  const handleDuplicateCreate = async () => {
    // console.log("temp in kpi", existingKpi);
    const newtemp = {
      kpiType: existingKpi.type,
      kpiName: existingKpi.kpiName,
      kpiTargetType: existingKpi.targetType,
      unitTypeId: existingKpi.unitTypeId,
      kpiTarget: existingKpi.kpiTarget,
      uom: existingKpi.unitOfMeasure,
      sourceId: filters.source,
      apiEndPoint: existingKpi.query,
      kpiDescription: existingKpi.description,
      locationId: unitId,
      entityId: deptId,
      category: existingKpi.category,
      frequency: existingKpi.frequency,
      kpiMinimumTarget: existingKpi.kpiMinimumTarget,
      displayType: existingKpi.displayType,
      op: existingKpi.op,
    };
    await axios
      .post(`/api/kpi-definition/createDuplicateKpi`, newtemp)
      .then((response: any) => {
        // console.log("inside then", response.status);
        // enqueueSnackbar("Kpi with the same name created", {
        //   variant: "Success",
        // });
        getKpiData(page, rowsPerPage).then(() => addEmptyRow());
      })
      .catch((err: any) => {
        if (err.response.status === 409) {
          enqueueSnackbar(
            "KPI name already exists for this department!!Use a different name",
            {
              variant: "error",
            }
          );
        } else enqueueSnackbar("An error occured", { variant: "error" });
        console.error(err);
      });
    getKpiData(page, rowsPerPage).then(() => addEmptyRow());
  };

  const handleDuplicateNameCreate = async () => {
    // console.log("temp in kpi", temp);

    await axios
      .post(`/api/kpi-definition/createDuplicateKpi`, temp)
      .then((response: any) => {
        // console.log("inside then", response.status);
        // enqueueSnackbar("Kpi with the same name created", {
        //   variant: "Success",
        // });
        getKpiData(page, rowsPerPage).then(() => addEmptyRow());
      })
      .catch((err: any) => {
        if (err.response.status === 409) {
          enqueueSnackbar(
            "KPI name already exists for this department!!Use a different name",
            {
              variant: "error",
            }
          );
        } else enqueueSnackbar("An error occured", { variant: "error" });
        console.error(err);
      });
    getKpiData(page, rowsPerPage).then(() => addEmptyRow());
  };

  const handleUpdate = async (row: any) => {
    if (deptId !== "All") {
      const temp = {
        kpiType: row.type,
        kpiName: row.kpiName,
        kpiTargetType: row.targetType,
        unitTypeId: row.unitTypeId,
        uom: row.unitOfMeasure,
        kpiTarget: row.kpiTarget,
        sourceId: filters.source,
        apiEndPoint: row.query,
        kpiDescription: row.description,
        locationId: unitId,
        entityId: deptId,
        category: row.category,
        frequency: row.frequency,
        kpiMinimumTarget: row.kpiMinimumTarget,
        displayType: row.displayType,
        op: row.op,
      };
      // console.log("inside update", temp);
      await axios
        .put(`/api/kpi-definition/updateKpi/${row.kpiId}`, temp)
        .then(async () => {
          await axios.post(
            `/api/kpi-definition/updatePeriodWiseRecord/${row.kpiId}`,
            row.modalData
          );
          getKpiData();
          setEmptyRow(false);
          setModalTargetData({});
          setUpdate(false);
        })
        .catch((err: any) => {
          // console.log("err", err);
          if (err.response.data.message.includes("Unique constraint failed"))
            enqueueSnackbar("KPI name exists", { variant: "error" });
          else enqueueSnackbar("An error occured", { variant: "error" });
          console.error(err);
        });
    } else {
      enqueueSnackbar(
        "Selected department is All!! Please select a particular department and update",
        { variant: "error" }
      );
      getKpiData();
    }
  };

  const handleConfirmOpen = (row: any) => {
    if (row.kpiId) {
      setDeleteKpi(row);
      setDialogOpen(true);
    } else {
      removeEmptyRow();
    }
  };
  const getSelectedItem = () => {
    const item = [allOption, ...locationOptions].find((opt: any) => {
      if (opt.id === unitId) return opt;
    });
    // console.log("item", item);

    return item || {};
  };
  const importKpis = async () => {
    try {
      const XLSX = require("xlsx");
      const formData = new FormData();
      formData.append("file", fileList[0].originFileObj);

      const response = await axios.post(
        `${API_LINK}/api/kpi-definition/import`,
        formData
      );
      // console.log("response", response);
      if (response.data.success) {
        const headers = Object.keys(response.data.invalidKpis[0]);
        const invalidSheet = XLSX.utils.aoa_to_sheet(
          response.data.invalidKpis,
          { header: headers }
        );
        const invalidWorkbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(
          invalidWorkbook,
          invalidSheet,
          "Invalid Kpis"
        );
        const excelBinaryString = XLSX.write(invalidWorkbook, {
          bookType: "xlsx",
          type: "binary",
        });
        const blob = new Blob([s2ab(excelBinaryString)], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
        });
        saveAs(blob, "InvalidKpis.xlsx");
        enqueueSnackbar(`Some Kpis Failed Please Check InvalidKpis`, {
          variant: "warning",
        });
      }
      if (response.data.wrongFormat) {
        exportKpis(true);
      } else {
        enqueueSnackbar(`Kpis Imported Successfully`, {
          variant: "success",
        });
      }

      getKpiData(page, rowsPerPage);
    } catch (error) {
      console.log("error in uploading attachments", error);
    }
  };
  function s2ab(s: string) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
      view[i] = s.charCodeAt(i) & 0xff;
    }
    return buf;
  }

  const handleDelete = async () => {
    await axios
      .delete(`/api/kpi-definition/deleteKpi/${deleteKpi.kpiId}`)
      .then(() => {
        enqueueSnackbar(`KPI deleted`, { variant: "success" });
        getKpiData(page, rowsPerPage);
        setEmptyRow(false);
      })
      .catch((err: any) => {
        enqueueSnackbar(`An error occured`, { variant: "error" });
        console.error(err);
      });
    setDialogOpen(false);
  };

  //usestates and respective for Add owners functionality, need to open a modal to assign owners for respective KPIs
  const [modalVisible, setModalVisible] = useState(false);

  const [userOptions, setUserOptions] = useState([]);
  const [selectedOwners, setSelectedOwners] = useState([]);
  const [selectedKPIs, setSelectedKPIs] = useState<any>([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const [modalKey, setModalKey] = useState(0);
  const [selectAll, setSelectAll] = React.useState(false);
  const [modalPage, setModalPage] = useState(1);
  const [modalRowsPerPage, setModalRowsPerPage] = useState(10);
  const [modalCount, setModalCount] = useState<number>();
  const [defaultOwners, setDefaultOwners] = useState([]);

  const [ownerModalVisible, setOwnerModalVisible] = useState(false);
  const [objOwnerModalVisible, setObjOwnerModalVisible] = useState(false);
  useEffect(() => {
    // Filter modalData to get the KPIs that match the selected KPI IDs
    const selectedKpiData = modalData.filter((kpi) =>
      selectedKPIs.includes(kpi.kpiId)
    );

    // Extract owners from the selected KPIs and remove duplicates
    const owners: any = selectedKpiData.flatMap((kpi) => kpi?.owner);
    // console.log("Owners:", owners);

    // Extract unique owner values and remove undefined elements
    const uniqueOwnerValues: any = [
      ...new Set(owners?.map((owner: any) => owner?.value)),
    ].filter((value) => value !== undefined);

    setSelectedOwners(owners);
    setDefaultOwners(uniqueOwnerValues);
  }, [selectedKPIs, modalData]);
  // console.log("selectedKPIs and defaultowners", defaultOwners, selectedKPIs);
  const handleModalChangePage = (
    pageNumber: any,
    pageSize: any = rowsPerPage
  ) => {
    // console.log("checkrisk pageSize", pageSize);
    setModalPage(pageNumber);
    setModalRowsPerPage(pageSize);

    getKpiDataForModal(pageNumber, pageSize);
  };

  const handleSelectAllKPI = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectAll(event.target.checked);
    if (event.target.checked) {
      // If "Select All" is checked, set all KPIs as selected
      setSelectedKPIs(modalData.map((kpi) => kpi.kpiId));
    } else {
      // If "Select All" is unchecked, clear all selections
      setSelectedKPIs([]);
    }
  };

  useEffect(() => {
    getKpiData(page, rowsPerPage);
    // getKpiDataForModal();
    getUserOptions();
    getDHForEntity();
    if (
      unitId !== "" &&
      unitId !== "All" &&
      deptId !== "" &&
      deptId !== "All"
    ) {
      getSelectowners();
      getSelectObjowners();
    }
  }, [filters.source, unitId, deptId, searchText]);
  // Function to refresh the modal
  const refreshModal = () => {
    setModalKey((prevKey) => prevKey + 1);
  };
  const handleButtonClick = () => {
    setModalVisible(true);
  };
  //handlers for obj modal
  const handleObjOwnerModalButtonClick = () => {
    setObjOwnerModalVisible(true);
  };
  const handleObjOwnerModalClose = () => {
    setObjOwnerModalVisible(false);
  };
  //handlers for kpi modal
  const handleOwnerModalButtonClick = () => {
    setOwnerModalVisible(true);
  };
  const handleOwnerModalClose = () => {
    setOwnerModalVisible(false);
  };
  const handleModalClose = () => {
    setModalVisible(false);
    setSearchValue("");
  };
  const handleOwnerSelectChange = (value: any) => {
    setSelectedOwners(value);
  };

  const handleKPISelectChange = (selectedRowKeys: any) => {
    setSelectedKPIs(selectedRowKeys);
  };
  const handleSelectionChange = (selectedRowKeys: any, selectedRows: any) => {
    // Extract the kpiId from the selected rows and update state
    // console.log("selectedrows", selectedRows);
    const selectedKpiIds = selectedRows.map((row: any) => row.kpiId);
    setSelectedKPIs(selectedKpiIds);
  };
  // console.log("selectedkpis", selectedKPIs, selectedOwners);
  const removeOwner = (kpiId: any, ownerFullname: any) => {
    const newData = modalData.map(async (item) => {
      // console.log("item", item, kpiId);
      if (item.kpiId === kpiId) {
        // return {
        //   ...item,
        //   owner: item.owner.filter(
        //     (owner: any) => owner.username !== ownerFullname
        //   ),
        // };
        const temp = {
          ...item,
          owner: item.owner.filter((owner: any) => owner.id !== ownerFullname),
        };
        await axios
          .put(`/api/kpi-definition/updateKpi/${item.kpiId}`, temp)
          .then(() => {
            // setModalVisible(false);
            // getKpiDataForModal();
          })
          .catch((err: any) => {
            console.log("error", err);
          });
      }
      return item;
    });
    setModalData(newData);
  };
  // console.log("selected Owners", selectedOwners);
  const getUniqueOwners = (owners: any) => {
    const uniqueOwners: any = [];
    const ownerIds = new Set();

    owners.forEach((owner: any) => {
      if (!ownerIds.has(owner.id)) {
        ownerIds.add(owner.id);
        uniqueOwners.push(owner);
      }
    });

    return uniqueOwners;
  };
  const handleUpdateOwners = async () => {
    // console.log(
    //   "handle update owners called selectedKpis",
    //   selectedKPIs,
    //   selectedOwners
    // );
    const uniqueOwners = getUniqueOwners(selectedOwners);
    selectedKPIs.forEach(async (kpiId: any) => {
      // Find the selected KPI err.response.data.dataect
      // console.log("selected kpi", kpiId);
      // console.log("tableData", modalData);
      const selectedKPI = modalData?.find((item) => item.kpiId === kpiId);
      // console.log("selectedkpi", selectedKPI);
      // If the selected KPI is found
      if (selectedKPI) {
        const temp = {
          ...selectedKPI,
          owner: uniqueOwners,
        };
        await axios
          .put(`/api/kpi-definition/updateKpi/${selectedKPI.kpiId}`, temp)
          .then(() => {
            // getKpiDataForModal();
          })
          .catch((err: any) => {
            console.log("error", err);
          });
      }
    });

    setModalRowsPerPage(10);
    setModalPage(1);
    setSelectedKPIs([]);
    setSelectedOwners([]);
    getKpiDataForModal();
  };
  const handleOwnersChange = (selectedAttendees: any) => {
    // console.log("selected attendees", selectedAttendees);
    const selectedUsers = selectedAttendees
      ?.map((userId: any) =>
        userOptions?.find((user: any) => user.value === userId)
      )
      .filter(Boolean); // Ensure no undefined values
    setSelectedOwners(selectedUsers);

    // Update the defaultOwnerValues to reflect changes in the select component
    setDefaultOwners(selectedAttendees);
  };

  const columns = [
    {
      title: "KPI Title",
      dataIndex: "kpiName",
      key: "kpiName",
    },
    // {
    //   title: "Target",
    //   dataIndex: "kpiTarget",
    //   key: "kpiTarget",
    // },
    {
      title: "Author(s)",
      dataIndex: "owner",
      key: "owner",
      render: (_: any, record: any) => (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {record?.owner?.map((owner: any, index: any) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "2px",
                border: "1px solid #d9d9d9",
                borderRadius: "4px",
                background: "#f5f5f5",
              }}
            >
              <span>{owner.username}</span>
              <MdOutlineCancel
                style={{
                  marginLeft: 8,
                  cursor: "pointer",
                  color: "black",
                  fontSize: "medium",
                }}
                onClick={() => removeOwner(record.kpiId, owner.id)}
              />
            </div>
          ))}
        </div>
      ),
    },
  ];
  const handleSearchChange = (e: any) => {
    e.preventDefault();
    setSearchValue(e.target.value);
  };
  const handleKPISelect = (selectedKPI: any) => {
    // Check if the selected KPI is already in the selectedKPIs array
    const alreadySelected = selectedKPIs?.find(
      (kpi: any) => kpi.kpiId === selectedKPI.kpiId
    );

    // If it's not selected, add it to the array, otherwise remove it
    if (!alreadySelected) {
      setSelectedKPIs([...selectedKPIs, selectedKPI]);
    } else {
      setSelectedKPIs(
        selectedKPIs.filter((kpi: any) => kpi.kpiId !== selectedKPI.kpiId)
      );
    }
  };
  // console.log("searchvalues", searchValue);
  const data = [
    {
      key: "1",
      kpiName: "KPI 1",
      target: "100",
      owner: "Owner 1",
    },
    {
      key: "2",
      kpiName: "KPI 2",
      target: "200",
      owner: "Owner 2",
    },
    // Add more data objects for additional KPIs
  ];
  // console.log("tableData", tableData);
  const handleClickDiscard = () => {
    setSearchValue("");
    getKpiData();
  };
  const rowSelection = {
    onChange: handleSelectionChange,
    selectedRowKeys: selectedKPIs, // Pass selectedKPIs here
  };
  const getUserOptions = async () => {
    await axios
      .get(
        `/api/kpi-definition/users?orgId=${userDetail?.organizationId}&deptId=${deptId}`
      )
      .then((res) => {
        // console.log("res from users", res);
        if (res.data && res.data?.length > 0) {
          const ops = res?.data?.map((obj: any) => ({
            id: obj.id,
            name: obj.username,
            avatar: obj.avatar,
            email: obj.email,
            username: obj.username,
            value: obj.id,
            label: obj.username,
            fullname: obj.firstname + " " + obj.lastname,
          }));
          setUserOptions(ops);
        } else {
          setUserOptions([]);
        }
      })
      .catch((err) => console.error(err));
  };
  const handleRemoveOwner = async (ownerToRemove: any) => {
    // console.log("handle remove owner called", ownerToRemove);
    // Map over selectedKPIs to update KPIs
    const updatedKPIs = selectedKPIs.map(async (selectedKPI: any) => {
      // If the selected KPI's owner includes the ownerToRemove
      // console.log("selectedKPI in remove", selectedKPI);
      if (
        selectedKPI.owner.some((owner: any) => owner.id === ownerToRemove.id)
      ) {
        // Create a new array of owners excluding the ownerToRemove
        const updatedOwners = selectedKPI.owner.filter(
          (owner: any) => owner.id !== ownerToRemove.id
        );
        // console.log("updatedowners", updatedOwners);
        // Update the KPI on the server with the updated owner array
        try {
          const response = await axios.put(
            `/api/kpi-definition/updateKpi/${selectedKPI.kpiId}`,
            {
              ...selectedKPI,
              owner: updatedOwners,
            }
          );
          // console.log("KPI updated successfully:", response.data);
          getKpiDataForModal();
          return response.data; // Return the updated KPI
        } catch (error) {
          // console.error("Error updating KPI:", error);
          throw error; // Throw error to handle it as needed
        }
      }
      // If the ownerToRemove is not found, return the original selected KPI
      return selectedKPI;
    });

    // Update selectedKPIs state with the updated KPIs
  };

  const isUserHead = heads.some((head) => head.id === userDetail.id);
  // console.log("deptID", deptId, isUserHead);

  const getDHForEntity = async () => {
    if (deptId !== "All") {
      const head = await axios.get(`/api/cara/getDeptHeadForEntity/${deptId}`);
      // console.log("head.data", head.data);
      if (head.data.length > 0) {
        setHeads(head.data);
      }
    } else {
      setHeads([]);
    }
  };

  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [modalId, setModalId] = useState<any>();
  const [selectedOwnerIds, setSelectedOwnerIds] = useState<any>([]);
  const [isObjEdit, setIsObjEdit] = useState<boolean>(false);
  const [objModalId, setObjModalId] = useState<any>();
  const [selectedObjOwnerIds, setSelectedObjOwnerIds] = useState<any>([]);
  // const [search, setSearch] = useState("");
  const [owners, setOWners] = useState<any>([]);
  const [objOwners, setObjOwners] = useState<any>([]);
  const isUserSelected = owners.some(
    (owner: any) => owner.id === userDetail.id
  );
  const isObjUserSelected = objOwners.some(
    (owner: any) => owner.id === userDetail.id
  );
  // console.log("isuserselected", isUserSelected);
  const getSelectowners = async () => {
    const result = await axios.get(
      `/api/kpi-definition/getOwners?locationId=${unitId}&entityId=${deptId}`
    );
    // console.log("result", result);
    if (result.data._id) {
      setSelectedOwnerIds(result.data.owner);
      setOWners(result.data.owner);
      setModalId(result.data._id);
      setIsEdit(true);
    } else {
      setModalId("");
      setSelectedOwnerIds([]);
      setIsEdit(false);
    }
  };
  const getSelectObjowners = async () => {
    const result = await axios.get(
      `/api/kpi-definition/getObjOwners?locationId=${unitId}&entityId=${deptId}`
    );
    // console.log("result", result);
    if (result.data._id) {
      setSelectedObjOwnerIds(result.data.owner);
      setObjOwners(result.data.owner);
      setObjModalId(result.data._id);
      setIsObjEdit(true);
    } else {
      setObjModalId("");
      setSelectedObjOwnerIds([]);
      setIsObjEdit(false);
    }
  };
  // console.log("selectedOwnerIDs", selectedOwnerIds, isEdit, modalId);
  // Handle removing owner from the list
  const handleAddCreateOwner = (value: any) => {
    // console.log("value", value);
    const selectedOwner: any = userOptions.find(
      (owner: any) => owner.id === value
    );
    if (
      selectedOwner &&
      !selectedOwnerIds.some((o: any) => o.id === selectedOwner.id)
    ) {
      setSelectedOwnerIds([...selectedOwnerIds, selectedOwner]);
    }
  };

  // Handle removing owner from the list
  const handleRemoveCreateOwner = (id: any) => {
    setSelectedOwnerIds(
      selectedOwnerIds.filter((owner: any) => owner.id !== id)
    );
  };
  const handleAssignOwners = async () => {
    if (isEdit) {
      await handleUpdateCreateOwners(selectedOwnerIds);
    } else {
      await handleCreateOwners(selectedOwnerIds);
    }
  };
  //handlers for adding and removing obj owners
  const handleAddCreateObjOwner = (value: any) => {
    // console.log("value", value);
    const selectedOwner: any = userOptions.find(
      (owner: any) => owner.id === value
    );
    if (
      selectedOwner &&
      !selectedObjOwnerIds.some((o: any) => o.id === selectedOwner.id)
    ) {
      setSelectedObjOwnerIds([...selectedObjOwnerIds, selectedOwner]);
    }
  };

  // Handle removing owner from the list
  const handleRemoveCreateObjOwner = (id: any) => {
    setSelectedObjOwnerIds(
      selectedObjOwnerIds.filter((owner: any) => owner.id !== id)
    );
  };

  // Handle assigning owners

  // Create new owners
  const handleCreateOwners = async (owners: any) => {
    try {
      const payload = {
        locationId: unitId,
        entityId: deptId,
        createdBy: userDetail.id,
        owner: owners,
      };
      const result = await axios.post(
        `/api/kpi-definition/createOwners`,
        payload
      );
      if (result.status === 201 || result.status === 200) {
        enqueueSnackbar("KPI creators have been successfully added", {
          variant: "success",
        });
        handleOwnerModalClose();
      }
    } catch (error) {
      console.error("Failed to create owners", error);
      enqueueSnackbar("Failed to create KPI creators", { variant: "error" });
    }
  };

  // Update existing owners
  const handleUpdateCreateOwners = async (owners: any) => {
    try {
      const payload = {
        locationId: unitId,
        entityId: deptId,
        createdBy: userDetail.id,
        owner: owners,
      };
      const result = await axios.put(
        `/api/kpi-definition/updateOwners/${modalId}`,
        payload
      );
      if (result.status === 200) {
        enqueueSnackbar("KPI creators have been successfully updated", {
          variant: "success",
        });
        handleOwnerModalClose();
      }
    } catch (error) {
      console.error("Failed to update owners", error);
      enqueueSnackbar("Failed to update KPI creators", { variant: "error" });
    }
  };

  const filteredOwners = userOptions.filter((owner: any) =>
    selectedOwnerIds.some((selected: any) => selected.id === owner.id)
  );

  //handlers for objective creators similar to kpi
  // Handle assigning owners

  const handleAssignObjOwners = async () => {
    if (isObjEdit) {
      await handleUpdateCreateObjOwners(selectedObjOwnerIds);
    } else {
      await handleCreateObjOwners(selectedObjOwnerIds);
    }
  };

  // Create new owners
  const handleCreateObjOwners = async (owners: any) => {
    try {
      const payload = {
        locationId: unitId,
        entityId: deptId,
        createdBy: userDetail.id,
        owner: owners,
      };
      const result = await axios.post(
        `/api/kpi-definition/createObjOwners`,
        payload
      );
      if (result.status === 201 || result.status === 200) {
        enqueueSnackbar("Obj creators have been successfully added", {
          variant: "success",
        });
        handleObjOwnerModalClose();
      }
    } catch (error) {
      console.error("Failed to create owners", error);
      enqueueSnackbar("Failed to create Objective creators", {
        variant: "error",
      });
    }
  };

  // Update existing owners
  const handleUpdateCreateObjOwners = async (owners: any) => {
    try {
      const payload = {
        locationId: unitId,
        entityId: deptId,
        createdBy: userDetail.id,
        owner: owners,
      };
      const result = await axios.put(
        `/api/kpi-definition/updateObjOwners/${objModalId}`,
        payload
      );
      if (result.status === 200) {
        enqueueSnackbar("Objective creators have been successfully updated", {
          variant: "success",
        });
        handleObjOwnerModalClose();
      }
    } catch (error) {
      console.error("Failed to update owners", error);
      enqueueSnackbar("Failed to update Objective creators", {
        variant: "error",
      });
    }
  };

  const filteredObjOwners = userOptions.filter((owner: any) =>
    selectedObjOwnerIds.some((selected: any) => selected.id === owner.id)
  );
  const isButtonDisabled =
    // !(isMR && userDetail.additionalUnits.length > 0
    //   ? userDetail.additionalUnits?.includes(unitId)
    //   : userDetail.location.id === unitId)
    !(isMR
      ? userDetail.location.id === unitId ||
        (userDetail.additionalUnits.length > 0 &&
          userDetail.additionalUnits.includes(unitId))
      : false) &&
    !isUserHead &&
    !isMCOE;

  const isCreateButtonDisabled =
    !(isMR
      ? userDetail.location.id === unitId ||
        (userDetail.additionalUnits.length > 0 &&
          userDetail.additionalUnits.includes(unitId))
      : false) &&
    !isUserHead &&
    !isMCOE &&
    !isUserSelected;

  const [open, setOpen] = useState(false);

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };
  return (
    <>
      {isMR &&
        userDetail.additionalUnits.length > 0 &&
        userDetail.additionalUnits?.includes(unitId) &&
        deptId !== "All" && (
          <Tooltip title="Click to Set Rules">
            <div
              style={{
                position: "absolute",
                top: "5px",
                right: "20px",
                cursor: "pointer",
                border: "2px solid #003059",
                borderRadius: "8px",
                padding: "3px 15px",
                fontWeight: "bold",
                color: "#003059",
              }}
              onClick={showDrawer}
            >
              Monitoring Rules
            </div>
          </Tooltip>
        )}
      <Drawer
        title="Monitoring Rules"
        onClose={onClose}
        open={open}
        width="75%"
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{ width: "30px", height: "32px", cursor: "pointer" }}
          />
        }
        className={classes.drawer}
      >
        <MonitoringRules unitId={unitId} deptId={deptId} />
      </Drawer>

      <ConfirmDialog
        open={dialogOpen}
        handleClose={() => setDialogOpen(false)}
        handleDelete={handleDelete}
      />

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Grid container alignItems="center" justifyContent="space-between">
            {/* <Grid item style={{ paddingTop: "15px" }}>
              <Typography color="primary" variant="h6">
                KPI Definition
              </Typography>
            </Grid> */}

            {importModel.open && (
              <Modal
                title="Import Kpis"
                open={importModel.open}
                onCancel={() => setImportModel({ open: false })}
                onOk={() => {
                  importKpis();
                  setImportModel({ open: false });
                }}
              >
                <Form.Item name="file" label={"Attach File: "}>
                  <Upload
                    name="file"
                    {...uploadProps}
                    className={classes.uploadSection}
                    fileList={fileList}
                  >
                    <p className="ant-upload-drag-icon">
                      <MdInbox />
                    </p>
                    <p className="ant-upload-text">
                      Click or drag file to this area to upload
                    </p>
                  </Upload>
                  <a href="#" onClick={getImportTemplate}>
                    SampleTemplate
                  </a>
                </Form.Item>
              </Modal>
            )}
            <Grid
              container
              item
              spacing={1} // Adjust spacing between items
              alignItems="center" // Align items vertically
              justify="flex-end"
              // style={{ paddingTop: "15px", width: "150px", display: "flex" }}
            >
              {(isOrgAdmin && deptId !== "All") ||
              (isUserSelected && deptId !== "All") ||
              (isUserHead && deptId !== "All") ||
              (isMR && userDetail.additionalUnits?.length > 0
                ? userDetail.additionalUnits?.includes(unitId)
                : userDetail.location?.id === unitId && deptId !== "All") ? (
                !filters.source ? (
                  <Button
                    variant="contained"
                    color="primary"
                    style={{
                      width: "50px",
                      marginRight: "20px",
                    }}
                    disabled
                  >
                    Create
                  </Button>
                ) : (
                  <Tooltip title="Add KPI">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        if (!emptyRow) {
                          addEmptyRow();
                          setEmptyRow(true);
                        }
                      }}
                      style={{
                        width: "50px",
                        marginRight: "20px",
                      }}
                      disabled={isCreateButtonDisabled}
                    >
                      Create
                    </Button>
                  </Tooltip>
                )
              ) : null}
            </Grid>
          </Grid>
        </Grid>

        <Grid container spacing={2} alignItems="center">
          {/* Unit/Corp Func Selector */}
          <Grid item xs={12} md={3}>
            <Autocomplete
              disablePortal
              id="combo-box-demo"
              options={[allOption, ...locationOptions]}
              onChange={handleLocation}
              value={getSelectedItem()}
              getOptionLabel={(option: any) => option.locationName || ""}
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
          </Grid>

          {/* Entity Selector with Label */}
          <Grid item xs={12} md={3}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <label
                style={{
                  fontWeight: 500,
                  fontSize: "14px",
                  color: "#374151",
                  width: "70px",
                }}
              >
                Entity:
              </label>
              <div style={{ flex: 1 }}>
                <DepartmentSelector
                  locationId={unitId}
                  selectedDepartment={selectedDept}
                  onSelect={(dept, type) => {
                    setSelectedDept({ ...dept, type });
                    setDeptId(dept?.id);
                  }}
                  onClear={() => setSelectedDept(null)}
                />
              </div>
            </div>
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12} md={4}>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {unitId !== "All" && deptId !== "All" && (
                <>
                  <Tooltip title="Assign Creators">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleOwnerModalButtonClick}
                    >
                      Master/Entry Creators
                    </Button>
                  </Tooltip>

                  <Tooltip title="Assign Objective Creators">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleObjOwnerModalButtonClick}
                    >
                      Objective Creators
                    </Button>
                  </Tooltip>
                </>
              )}
            </div>
          </Grid>
          {/* Source Selector */}
          <Grid item xs={12} md={2}>
            <FormControl variant="outlined" fullWidth size="small">
              <InputLabel>Source</InputLabel>
              <Select
                name="source"
                label="Source"
                value={filters?.source}
                onChange={handleChange}
              >
                {sourceOptions.map((obj) => (
                  <MenuItem key={obj.value} value={obj.value}>
                    {obj.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* <Modal
          title="KPI Report Creators"
          visible={modalVisible}
          onCancel={handleModalClose}
       
          footer={null}
          width={1300}
         
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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              getKpiData();
            }}
            style={{ display: "flex" }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectAll}
                  onChange={handleSelectAllKPI}
                  color="primary"
                  style={{ marginRight: "10px", fontWeight: "bold" }}
                />
              }
              label={<span style={{ fontWeight: "bold" }}>Select All</span>}
            />
            <TextField
              fullWidth
              name="search"
              value={searchValue}
              placeholder="Search KPI"
              onChange={handleSearchChange}
              style={{ width: 350, marginRight: "10px", marginLeft: "20px" }}
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
                    <img src={SearchIcon} alt="search" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <>
                    {searchValue && (
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
            <div style={{ marginRight: "30px" }}></div>
            <AntSelect
              showSearch
              placeholder="Select Owner(s)"
              style={{
                width: "400px",
                fontSize: "12px",
              }}
              mode="multiple"
              options={userOptions || []}
              onChange={handleOwnersChange} // Handle changes here
              size="large"
              value={defaultOwners} // Use value to reflect the selected owners
              filterOption={(input: any, option: any) =>
                option?.label?.toLowerCase().indexOf(input?.toLowerCase()) >= 0
              }
              listHeight={200}
            />
            <Button
              variant="contained"
              style={{ marginLeft: "20px", maxHeight: "35px" }}
              color="primary"
              onClick={handleUpdateOwners}
              disabled={isButtonDisabled}
            >
              Assign
            </Button>
          </form>
          <div className={classes.tableContainer}>
            <Table
              columns={columns}
              
              dataSource={modalData}
              pagination={false}
              rowSelection={{
                type: "checkbox",
                ...rowSelection,
              }}
              rowKey="kpiId"
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              backgroundColor: "inherit",
              paddingTop: "10px",
            }}
          >
            <div
              style={{
                textAlign: "left",
                paddingRight: "600px",
                font: "bold",
              }}
            >
             
              <span style={{ fontWeight: "bold", fontSize: "16px" }}>
                {selectedKPIs.length}/{modalData?.length} KPIs selected{" "}
              </span>
            </div>
            <Pagination
              size="small"
              current={modalPage}
              pageSize={modalRowsPerPage}
              total={modalCount}
              showTotal={showTotal}
              showSizeChanger
              showQuickJumper
              onChange={(page, pageSize) => {
                handleModalChangePage(page, pageSize);
              }}
            />
          </div>
        </Modal> */}
        <Modal
          title="KPI Master/Entry Creators"
          visible={ownerModalVisible}
          onCancel={handleOwnerModalClose}
          // onOk={handleUpdateOwners}
          footer={null}
          width={800}
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
          <div style={{ marginBottom: "20px" }}>
            <AntSelect
              showSearch
              placeholder="Select an owner"
              onChange={handleAddCreateOwner}
              value={selectedOwnerIds}
              // renderValue={(selected) => selected ? selected : <em>Select an owner</em>}
              style={{ width: "100%" }}
              allowClear
              options={userOptions.map((owner: any) => ({
                value: owner.id,
                label: owner.name,
              }))}
              filterOption={(input, option: any) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
            />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <Typography>Selected Creators</Typography>
            <List>
              {filteredOwners.map((owner: any) => (
                <ListItem key={owner.id}>
                  <Chip label={owner.username} />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      disabled={isButtonDisabled}
                      onClick={() => handleRemoveCreateOwner(owner.id)}
                    >
                      <MdClose />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </div>
          <div style={{ textAlign: "right" }}>
            {/* <Button
              onClick={handleOwnerModalClose}
              style={{ marginRight: "10px" }}
            >
              Close
            </Button> */}
            <Button
              variant="contained"
              color="primary"
              onClick={handleAssignOwners}
              disabled={isButtonDisabled}
            >
              {isEdit ? "Update" : "Assign"}
            </Button>
          </div>
        </Modal>

        <Modal
          title="Objective Creators"
          visible={objOwnerModalVisible}
          onCancel={handleObjOwnerModalClose}
          // onOk={handleUpdateOwners}
          footer={null}
          width={800}
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
          <div style={{ marginBottom: "20px" }}>
            <AntSelect
              showSearch
              placeholder="Select an owner"
              onChange={handleAddCreateObjOwner}
              value={selectedObjOwnerIds}
              // renderValue={(selected) => selected ? selected : <em>Select an owner</em>}
              style={{ width: "100%" }}
              allowClear
              options={userOptions.map((owner: any) => ({
                value: owner.id,
                label: owner.name,
              }))}
              filterOption={(input, option: any) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
            />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <Typography>Selected Objective Creators</Typography>
            <List>
              {filteredObjOwners.map((owner: any) => (
                <ListItem key={owner.id}>
                  <Chip label={owner.username} />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      disabled={isButtonDisabled}
                      onClick={() => handleRemoveCreateObjOwner(owner.id)}
                    >
                      <MdClose />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </div>
          <div style={{ textAlign: "right" }}>
            {/* <Button
              onClick={handleOwnerModalClose}
              style={{ marginRight: "10px" }}
            >
              Close
            </Button> */}
            <Button
              variant="contained"
              color="primary"
              onClick={handleAssignObjOwners}
              disabled={isButtonDisabled}
            >
              {isObjEdit ? "Update" : "Assign"}
            </Button>
          </div>
        </Modal>
        {/* 
        <Grid item xs={12} md={4}>
          <FormControl variant="outlined" fullWidth size="small">
            <InputLabel>Source</InputLabel>
            <Select
              name="source"
              label="Source"
              value={filters?.source}
              onChange={handleChange}
            >
              {sourceOptions.map((obj) => (
                <MenuItem key={obj.value} value={obj.value}>
                  {obj.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid> */}

        <Grid item xs={12}>
          {/* <Typography style={{ padding: "10px", fontSize: "12px" }}>
            *- Operating Plan
          </Typography> */}
          <div style={{ padding: "5px" }}>
            {tableData.length ? (
              <>
                <div className={classes.tableContainerScrollable}>
                  <KpiDefinitionTable
                    columns={filters.source === "Manual" ? cols1 : cols}
                    data={tableData}
                    setData={setTableData}
                    handleBlur={handleBlur}
                    unitOptions={unitOptions}
                    kraOptions={kraData}
                    source={filters?.source === "Manual" ? true : false}
                    searchText={searchText}
                    setSearchText={setSearchText}
                    modalTargetData={modalTargetData}
                    setModalTargetData={setModalTargetData}
                    update={update}
                    setUpdate={setUpdate}
                    actions={
                      isAdmin ||
                      isOrgAdmin ||
                      (isMR &&
                        (userDetail.additionalUnits?.length > 0
                          ? userDetail.additionalUnits?.includes(unitId)
                          : userDetail.location.id === unitId))
                        ? [
                            {
                              label: "Delete",
                              icon: <MdDelete />,
                              handler: handleConfirmOpen,
                            },
                          ]
                        : []
                    }
                  />
                </div>
                {/* <div className={classes.pagination}>
                  <Pagination
                    size="small"
                    current={page}
                    pageSize={rowsPerPage}
                    total={count}
                    showTotal={showTotal}
                    showSizeChanger
                    showQuickJumper
                    onChange={(page, pageSize) => {
                      handleChangePage(page, pageSize);
                    }}
                  />
                </div> */}
              </>
            ) : (
              <>
                <KpiDefinitionTable
                  columns={filters.source === "Manual" ? cols1 : cols}
                  data={tableData}
                  setData={setTableData}
                  handleBlur={handleBlur}
                  unitOptions={unitOptions}
                  kraOptions={kraData}
                  source={filters?.source === "Manual" ? true : false}
                  searchText={searchText}
                  setSearchText={setSearchText}
                  modalTargetData={modalTargetData}
                  setModalTargetData={setModalTargetData}
                  update={update}
                  setUpdate={setUpdate}
                  actions={
                    isAdmin ||
                    isOrgAdmin ||
                    (isMR &&
                      (userDetail.additionalUnits?.length > 0
                        ? userDetail.additionalUnits?.includes(unitId)
                        : userDetail.location.id === unitId))
                      ? [
                          {
                            label: "Delete",
                            icon: <MdDelete />,
                            handler: handleConfirmOpen,
                          },
                        ]
                      : []
                  }
                />
                {/* <div className={classes.imgContainer}>
                  <img src={EmptyTableImg} alt="No Data" width="300px" />
                </div>
                <Typography align="center" className={classes.emptyDataText}>
                  No rows matched selected filters
                </Typography> */}
              </>
            )}
          </div>
        </Grid>
      </Grid>
      <div>
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>
            KPI name already exists in this Unit!!
            <br></br>Proposed Name - {existingKpi.kpiName}-{deptName}
          </DialogTitle>
          {/* <DialogContent>
            <p>
              Click "Use same" to duplicate this kpi for selected department
              (or) Click "Create New" to create a new KPI with different target
            </p>
            <p>
              <strong>Name:</strong> {existingKpi.kpiName}
            </p>
            <p>
              <strong>Description:</strong> {existingKpi.description}
            </p>
            <p>
              <strong>Department:</strong> {existingKpi.entityName}
            </p>
            <p>
              <strong>Frequency:</strong> {existingKpi.frequency}
            </p>
            <p>
              <strong>Target Type:</strong> {existingKpi.targetType}
            </p>
            <p>
              <strong>Target:</strong> {existingKpi.kpiTarget}
            </p>
          </DialogContent> */}
          <DialogActions>
            {/* <Button onClick={handleCloseDialog} color="primary">
              Create new
            </Button>
            <Button onClick={handleProceed} color="primary">
              Use same
            </Button> */}
            <Button onClick={handleClose} color="primary">
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </>
  );
}

export default KpiDefinition;
