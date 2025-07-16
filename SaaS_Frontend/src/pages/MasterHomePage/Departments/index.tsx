import { useState, useEffect } from "react";
import useStyles from "./styles";
import {
  CircularProgress,
  Typography,
  Tooltip,
  Box,
  IconButton,
  useMediaQuery,
} from "@material-ui/core";
import { AiOutlineFilter, AiFillFilter } from "react-icons/ai";
import { useLocation, useNavigate } from "react-router-dom";
import getAppUrl from "utils/getAppUrl";
import axios from "apis/axios.global";
import { useSetRecoilState } from "recoil";
import { deptFormData } from "recoil/atom";
import FilterDrawer from "components/FilterDrawer";
import SearchBar from "components/SearchBar";
import ConfirmDialog from "components/ConfirmDialog";
import EmptyTableImg from "assets/EmptyTableImg.svg";
import checkRoles from "utils/checkRoles";
import { ReactComponent as CustomDeleteICon } from "assets/documentControl/Delete.svg";
import { ReactComponent as CustomEditICon } from "assets/documentControl/Edit.svg";
import { Button, Divider, Pagination, PaginationProps, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { formatDashboardQuery } from "utils/formatDashboardQuery";
import { API_LINK } from "config";
import { Modal, Upload, Form } from "antd";
import type { UploadProps } from "antd";
import { MdInbox } from "react-icons/md";
import { MdPublish } from "react-icons/md";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { MdGetApp } from "react-icons/md";
import MultiUserDisplay from "components/MultiUserDisplay";
import { useSnackbar } from "notistack";

type Props = {
  type: boolean;
  entityType?: any;
};

const fields = [
  // "entityType  ",
  "entityName",
  // "entityId",
  "location",
  "createdAt",
  // "businessType",
];
const headers = [
  // "Entity Type",
  "Department Name",
  "Unit",
  "Created At",
  // "Business Unit",
];

function Departments({ type = true, entityType }: Props) {
  const matches = useMediaQuery("(min-width:822px)");
  const [data, setData] = useState<any>();
  const setFormData = useSetRecoilState(deptFormData);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rerender, setRerender] = useState(false);
  const [deleteLoc, setDeleteLoc] = useState<any>();
  const [deletedData, setDeletedData] = useState<any>({});
  const [deleteCondition, setDeleteCondition] = useState(true);
  const [searchValue, setSearchValue] = useState<any>({});
  const [count, setCount] = useState<number>();
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const userdetails: any = sessionStorage.getItem("userDetails");
  const userid: any = JSON.parse(userdetails).id;
  const userInfo = JSON.parse(userdetails);
  const [isGraphSectionVisible, setIsGraphSectionVisible] = useState(false);
  const classes = useStyles({
    isGraphSectionVisible: isGraphSectionVisible,
  });
  // console.log("checke entityType", entityType);

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isFilterUnit, setfilterUnit] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<any>();
  const showTotal: PaginationProps["showTotal"] = (total) =>
    `Total ${total} items`;
  const [searchValues, setSearch] = useState<any>({ searchQuery: "" });
  const navigate = useNavigate();
  const organizationId = sessionStorage.getItem("orgId") || "";
  const [importDepartmentModel, setImportDepartmentModel] = useState<any>({
    open: false,
  });
  const [entityTypeName, setEntityTypeName] = useState<any>("");
  const [fileList, setFileList] = useState<any>([]);
  const orgName = getAppUrl();
  const { enqueueSnackbar } = useSnackbar();
  const [locationList, setLocationList] = useState<any>([]);

  let isOrgAdmin = checkRoles("ORG-ADMIN");

  const location = useLocation();
  const columns: ColumnsType<any> = [
    {
      title: `${entityTypeName}`,
      dataIndex: "entityName",
      key: "entityName",
    },
    {
      title: "Unit",
      dataIndex: "location",
      key: "location",
      render: (_: any, record: any) => {
        return record.location.locationName; // Return the locationName
      },
      filterIcon: (filtered: any) =>
        selectedLocation?.length > 0 ? (
          <AiFillFilter style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <AiOutlineFilter style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }: any) => {
        // Create a set to store unique names
        const uniqueNames = new Set();

        // Iterate through allAuditPlanDetails and add unique names to the set
        data?.forEach((item: any) => {
          const name = {
            id: item.location.id,
            locationName: item.location.locationName,
          };

          uniqueNames.add(name);
        });

        // Convert the set back to an array for rendering
        const uniqueNamesArray = Array.from(uniqueNames);
        const seen = new Set();

        // Create an array to store the unique items
        const uniqueData: any[] = [];

        // Loop through the data array, check for duplicates, and exclude empty objects
        uniqueNamesArray.forEach((item: any) => {
          if (Object.keys(item).length > 0) {
            if (item.id !== undefined) {
              // Check if the object is not empty
              const itemString = JSON.stringify(item); // Convert the object to a string for comparison
              if (!seen.has(itemString)) {
                seen.add(itemString);
                uniqueData.push(item);
              }
            }
          }
        });
        return (
          <div>
            <div style={{ padding: 8 }}>
              <Button
                type="primary"
                disabled={selectedLocation?.length === 0}
                onClick={() => {
                  setPage(1);
                  sessionStorage.setItem("entityPage", "1");

                  const url = formatDashboardQuery(
                    `/api/entity/all/${orgName}/${entityType}`,
                    {
                      ...searchValue,
                      location: selectedLocation,
                      page: 1,
                      limit: rowsPerPage,
                    }
                  );
                  getData(url);
                  setfilterUnit(true);
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
                  setSelectedLocation([]);
                  // let url = formatQuery(
                  //   `/api/entity/all/${orgName}`,
                  //   { page: page, limit: rowsPerPage },
                  //   ["page", "limit"]
                  // );
                  sessionStorage.setItem(
                    "selectedLocation",
                    JSON.stringify([])
                  );

                  let url = formatDashboardQuery(
                    `/api/entity/all/${orgName}/${entityType}`,
                    {
                      ...searchValue,
                      page: page,
                      limit: rowsPerPage,
                    }
                  );
                  getData(url);
                  setfilterUnit(false);
                  confirm();
                }}
              >
                Reset
              </Button>
            </div>
            <div style={{ padding: 8, overflowY: "auto", height: "250px" }}>
              {locationList.map((item: any) => (
                <div key={item.id}>
                  <label style={{ display: "flex", alignItems: "center" }}>
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        const value = e.target.value;
                        if (e.target.checked) {
                          setSelectedLocation([...selectedLocation, value]);
                          sessionStorage.setItem(
                            "selectedLocation",
                            JSON.stringify([...selectedLocation, value])
                          );
                        } else {
                          setSelectedLocation(
                            selectedLocation?.filter(
                              (key: any) => key !== value
                            )
                          );
                          sessionStorage.setItem(
                            "selectedLocation",
                            JSON.stringify([
                              ...selectedLocation?.filter(
                                (key: any) => key !== value
                              ),
                            ])
                          );
                        }
                      }}
                      value={item.id}
                      checked={selectedLocation?.includes(item.id)} // Check if the checkbox should be checked
                      style={{
                        width: "16px",
                        height: "16px",
                        marginRight: "5px",
                      }}
                    />

                    {item.locationName}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );
      },
    },

    {
      title: "Created On",
      dataIndex: "createdAt",
      key: "createdAt",
    },

    {
      title: `${entityTypeName}` + " " + "Head",
      dataIndex: "entityHead",
      render: (_: any, record: any) => {
        if (record?.entityHead?.length > 0) {
          return <MultiUserDisplay data={record?.entityHead} name="email" />;
        } else {
          return "";
        }
      },
    },

    {
      title: "Action",
      key: "action",
      width: 150,
      render: (_: any, record: any) =>
        // (isOrgAdmin ||
        record.access && (
          <>
            <IconButton
              onClick={() => {
                handleEditDept(record);
              }}
              className={classes.actionButtonStyle}
              data-testid="action-item"
            >
              <CustomEditICon width={18} height={18} />
            </IconButton>
            <Divider type="vertical" className={classes.NavDivider} />
            {isOrgAdmin && (
              <IconButton
                onClick={() => {
                  handleOpen(record);
                }}
                className={classes.actionButtonStyle}
                data-testid="action-item"
              >
                <CustomDeleteICon width={18} height={18} />
              </IconButton>
            )}
          </>
        ),
    },
  ];

  const exportDepartments = async (bool: boolean) => {
    let requiredData: any[] = [];
    const url = formatDashboardQuery(
      `/api/entity/all/${orgName}/${entityType}`,
      {
        ...searchValue,
        location: selectedLocation,
        page: 1,
        limit: 10000000,
      }
    );
    const response = await getDataForExport(url);
    if (data.length === 0 || bool) {
      requiredData = [
        {
          Unit: "Location1",
          DepartmentName: "Department1",
          DepartmentID: "DepID1 (MAX 6 Characters)",
          Function: "Function1",
          DepartmentHeads: "user1@gmail.com",
          Description: "Department Template",
        },
        {
          Unit: "Location2",
          DepartmentName: "Department2",
          DepartmentID: "DepID2 (MAX 6 Characters)",
          Function: "Function1",
          DepartmentHeads: "user1@gmail.com,user2@gmail.com",
          Description: "Department Template",
        },
        {
          Unit: "Required",
          DepartmentName: "Required",
          DepartmentID: "Required",
          Function: "Not Required",
          DepartmentHeads: "Not Required",
          Description:
            "Not Required (IGNORE THIS ROW WHEN CREATING DEPARTMENT IMPORT)",
        },
      ];
    } else {
      for (const element of response) {
        const usersIds = element.users;
        let usersEmails = "";
        if (usersIds.length !== 0) {
          const response = await axios.post(
            `${API_LINK}/api/entity/getUsersNames`,
            { usersIds }
          );
          usersEmails = response.data.usersEmails;
        }
        requiredData.push({
          Unit: element.location.locationName,
          DepartmentName: element.entityName,
          DepartmentID: element.entityId,
          Function: element.functionName,
          DepartmentHeads: usersEmails,
          Description: element.description,
          section:element?.sectionData?.map((item:any)=>item?.name).join(' , '),
          totalSection:element?.sectionData?.length
        });
      }
    }
    const sheet = XLSX.utils.json_to_sheet(requiredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Departments");
    const excelBinaryString = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "binary",
    });
    const blob = new Blob([s2ab(excelBinaryString)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    if (data.length === 0 || bool) {
      saveAs(blob, "DepartmentsTemplate.xlsx");
      if (bool) {
        enqueueSnackbar(`Wrong Template Please View DepartmentTemplate`, {
          variant: "error",
        });
      }
    } else {
      enqueueSnackbar(`Export Departments Successful`, {
        variant: "success",
      });
      saveAs(blob, "Departments.xlsx");
    }
  };

  const getLocationFilterList = async () => {
    const response = await axios.get(`/api/location/getAllLocationList`);
    setLocationList(response.data);
  };

  const importDepartment = async () => {
    try {
      const XLSX = require("xlsx");
      const formData = new FormData();

      formData.append("file", fileList[0].originFileObj);
      formData.append("orgName", orgName);

      const response = await axios.post(
        `${API_LINK}/api/entity/importEntity`,
        formData
      );
      if (response.data.success) {
        const headers = Object.keys(response.data.invalidDepartments[0]);
        const invalidSheet = XLSX.utils.aoa_to_sheet(
          response.data.invalidDepartments,
          { header: headers }
        );
        const invalidWorkbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(
          invalidWorkbook,
          invalidSheet,
          "Invalid Departments"
        );
        const excelBinaryString = XLSX.write(invalidWorkbook, {
          bookType: "xlsx",
          type: "binary",
        });
        const blob = new Blob([s2ab(excelBinaryString)], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
        });
        saveAs(blob, "InvalidDepartments.xlsx");
        enqueueSnackbar(
          `Some Departments Failed Please Check InvalidDepartments`,
          {
            variant: "warning",
          }
        );
      }
      if (response.data.wrongFormat) {
        exportDepartments(true);
      } else {
        enqueueSnackbar(`Departments Import Successful`, {
          variant: "success",
        });
      }
      // let url = formatQuery(
      //   `/api/entity/all/${orgName}`,
      //   { page: page, limit: rowsPerPage },
      //   ["page", "limit"]
      // );
      let url = formatDashboardQuery(
        `/api/entity/all/${orgName}/${entityType}`,
        {
          ...searchValue,
          location: selectedLocation,
          page: page,
          limit: rowsPerPage,
        }
      );
      getData(url);
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

  const uploadProps: UploadProps = {
    multiple: false, // Set to true to allow multiple file uploads
    beforeUpload: () => false,
    onChange({ file, fileList }) {
      if (
        file.status !== "uploading" &&
        file.status !== "removed" &&
        file.status !== "error"
      ) {
        setFileList(fileList); // Set the entire file list instead of a single file
      }
    },
    onRemove: (file) => {
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

  const getData = async (url: any) => {
    setIsLoading(true);
    // console.log("checke url in getdata", url);

    try {
      const res = await axios.get(url);
      if (res?.data?.data) {
        setCount(res.data.length);
        const values = res?.data?.data.map((item: any) => ({
          entityType: item.entityType ? item.entityType.name : "-",
          entityName: item?.entityName ?? "-",
          entityTypeId: item?.entityTypeId ?? "-",
          createdAt: new Date(item?.createdAt).toDateString() ?? "-",
          location: item?.location ?? "-",
          businessType: item?.businessType?.name ?? "-",
          entityId: item?.entityId ?? "-",
          description: item?.description ?? "-",
          id: item?.id ?? "-",
          entityHead: item?.entityHead,
          access: item.access,
          functionName: item.function ? item.function.name : "N/A",
          users: item.users,
        }));
        setData(values);
        setIsLoading(false);
      }
    } catch (err) {
      enqueueSnackbar(`Error While Fetching Data`, { variant: "error" });
      setIsLoading(false);
    }
  };

  const getDataForExport = async (url: any) => {
    try {
      const res = await axios.get(url);
      if (res?.data?.data) {
        const values = res?.data?.data.map((item: any) => ({
          entityType: item.entityType ? item.entityType.name : "-",
          entityName: item?.entityName ?? "-",
          entityTypeId: item?.entityTypeId ?? "-",
          createdAt: new Date(item?.createdAt).toDateString() ?? "-",
          location: item?.location ?? "-",
          businessType: item?.businessType?.name ?? "-",
          entityId: item?.entityId ?? "-",
          description: item?.description ?? "-",
          id: item?.id ?? "-",
          entityHead: item?.entityHead,
          access: item.access,
          functionName: item.function ? item.function.name : "N/A",
          sectionData:item?.sectionData||[],
          users: item.users,
        }));
        return values;
      }
    } catch (err) {
      enqueueSnackbar(`Error While Fetching Data`, { variant: "error" });
      setIsLoading(false);
    }
  };

  const handleEditDept = (data: any) => {
    navigate(`/master/department/newdepartment/${data.id}`, {
      state: {
        id: entityType,
        name: entityType,
        key: entityType,
      },
    });
  };

  const deleteDataEntity = async (dataNew: any) => {
    try {
      const entityData = await axios.get(
        `api/entity/getEntityUsedData/${dataNew?.id}`
      );
      setDeletedData(entityData?.data);
      if (
        entityData?.data?.documentCount === 0 &&
        entityData?.data?.auditCount === 0 &&
        entityData?.data?.hiraCount === 0 &&
        entityData?.data?.caraCount === 0
      ) {
        setDeleteCondition(true);
      } else {
        setDeleteCondition(false);
      }
    } catch (err) {}
  };

  const handleOpen = (val: any) => {
    setOpen(true);
    setDeleteLoc(val);
    deleteDataEntity(val);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = async () => {
    handleClose();
    setIsLoading(true);
    try {
      const res = await axios.delete(`api/entity/${deleteLoc.id}`);
      // const result = await axios.post(`/api/audit-trial/createAuditTrial`, {
      //   moduleType: "DEPARTMENT",
      //   actionType: "DELETE",
      //   transactionId: deleteLoc.id,
      //   actionBy: userid,
      // });
      enqueueSnackbar(`Operation Successful`, { variant: "success" });
      setIsLoading(false);
      setRerender(!rerender);
    } catch (err) {
      enqueueSnackbar(`Error ${err}`, {
        variant: "error",
      });
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: any) => {
    e.preventDefault();
    sessionStorage.setItem("entitySearch", e.target.value);
    setSearchValue({
      ...searchValue,
      [e.target.name]: e.target.value,
    });
  };

  const handleApply = () => {
    setPage(1);
    sessionStorage.setItem("entityPage", "1");
    let url = formatDashboardQuery(`/api/entity/all/${orgName}/${entityType}`, {
      ...searchValue,
      location: selectedLocation,
      page: 1,
      limit: rowsPerPage,
    });
    getData(url);
  };

  const handleDiscard = () => {
    // let url = formatQuery(
    //   `/api/entity/all/${orgName}`,
    //   { page: page, limit: rowsPerPage },
    //   ["page", "limit"]
    // );
    sessionStorage.setItem("entitySearch", "");
    const url = formatDashboardQuery(
      `/api/entity/all/${orgName}/${entityType}`,
      {
        ...searchValue,
        location: selectedLocation,
        page: page,
        limit: rowsPerPage,
      }
    );
    getData(url);
    setPage(1);
    sessionStorage.setItem("entityPage", "1");
    setSearchValue({
      query: "",
      entityName: "",
      locationName: "",
      businessType: "",
      entityType: "",
    });
  };

  const handleChangePage = (page: any) => {
    setPage(page);
    sessionStorage.setItem("entityPage", page);

    // let url = formatQuery(
    //   `/api/entity/all/${orgName}`,
    //   { ...searchValue, page: page, limit: rowsPerPage },
    //   [
    //     "departmentName",
    //     "locationName",
    //     "businessType",
    //     "entityType",
    //     "page",
    //     "limit",
    //   ]
    // );
  };

  const handleChangePageNew = (page: any, pageSize: any = rowsPerPage) => {
    setPage(page);
    sessionStorage.setItem("entityPage", page);
    setRowsPerPage(pageSize);
    sessionStorage.setItem("entityRow", pageSize);
    let url = formatDashboardQuery(`/api/entity/all/${orgName}/${entityType}`, {
      ...searchValue,
      location: selectedLocation,
      page: page,
      limit: pageSize,
    });
    getData(url);
  };
  useEffect(() => {
    const locationData: any = sessionStorage.getItem("selectedLocation");
    const searchData: any = sessionStorage.getItem("entitySearch");

    const locData: any = JSON.parse(locationData);
    const entityPageData = sessionStorage.getItem("entityPage");
    const entityRowsPage = sessionStorage.getItem("entityRow");

    if (
      entityPageData !== undefined &&
      entityPageData !== "" &&
      entityPageData !== null
    ) {
      setPage(parseInt(entityPageData));
    }

    if (
      entityRowsPage !== undefined &&
      entityRowsPage !== "" &&
      entityRowsPage !== null
    ) {
      setRowsPerPage(parseInt(entityRowsPage));
    }
    const searchDataNew = { query: searchData };
    if (searchData !== undefined && searchData !== "" && searchData !== null) {
      setSearchValue({
        query: searchData,
      });
    }
    if (locData === null) {
      setSelectedLocation([userInfo.locationId]);
      sessionStorage.setItem(
        "selectedLocation",
        JSON.stringify([userInfo.locationId])
      );
    } else {
      setSelectedLocation(locData);
    }
    let url;

    if (searchData !== undefined && searchData !== "" && searchData !== null) {
      url = formatDashboardQuery(`/api/entity/all/${orgName}/${entityType}`, {
        ...searchDataNew,
        location: locData === null ? [userInfo.locationId] : locData,
        page:
          entityPageData !== undefined &&
          entityPageData !== "" &&
          entityPageData !== null
            ? parseInt(entityPageData)
            : page,
        limit:
          entityRowsPage !== undefined &&
          entityRowsPage !== "" &&
          entityRowsPage !== null
            ? parseInt(entityRowsPage)
            : rowsPerPage,
      });
    } else {
      url = formatDashboardQuery(`/api/entity/all/${orgName}/${entityType}`, {
        ...searchValue,
        location: locData === null ? [userInfo.locationId] : locData,
        page:
          entityPageData !== undefined &&
          entityPageData !== "" &&
          entityPageData !== null
            ? parseInt(entityPageData)
            : page,
        limit:
          entityRowsPage !== undefined &&
          entityRowsPage !== "" &&
          entityRowsPage !== null
            ? parseInt(entityRowsPage)
            : rowsPerPage,
      });
    }
    // formatQuery(
    //   `/api/entity/all/${orgName}`,
    //   { page: page, limit: rowsPerPage },
    //   ["page", "limit"]
    // );

    // if (isOrgAdmin || isAdmin || isLocAdmin) getData(url);
    // if (isMR || isEntityHead || isAuditor || isGeneralUser)
    //   navigate(`/master/department/newdepartment`);
    getData(url);
    getLocationFilterList();
  }, [rerender]);
  useEffect(() => {
    if (!!entityType) {
      getEntityTypeName();
    }
  }, [entityType]);
  const getEntityTypeName = async () => {
    try {
      const entityTypeName = await axios.get(
        `/api/organization/getEntityTypeById/${entityType}`
      );
      if (entityTypeName?.data) {
        setEntityTypeName(entityTypeName?.data?.name);
      }
    } catch (error) {}
  };

  // const rowClassName = (record: any, index: number) => {
  //   return index % 2 === 0
  //     ? classes.alternateRowColor1
  //     : classes.alternateRowColor2;
  // };

  // const handleClickDiscard = () => {};
  console.log("entityType", entityType);
  return (
    // <div className={classes.root}>
    <>
      <FilterDrawer
        open={filterOpen}
        setOpen={setFilterOpen}
        resultText={count ? `Showing ${count} Result(s)` : `No Results Found`}
        handleApply={handleApply}
        handleDiscard={handleDiscard}
      >
        <SearchBar
          placeholder="By Entity Name"
          name="entityName"
          handleChange={handleSearchChange}
          values={searchValue}
          handleApply={handleApply}
        />
        {isOrgAdmin && (
          <SearchBar
            placeholder="By Location"
            name="locationName"
            handleChange={handleSearchChange}
            values={searchValue}
            handleApply={handleApply}
          />
        )}
        <SearchBar
          placeholder="By Entity Type"
          name="entityType"
          handleChange={handleSearchChange}
          values={searchValue}
          handleApply={handleApply}
        />
        <SearchBar
          placeholder="By Business Units"
          name="businessType"
          handleChange={handleSearchChange}
          values={searchValue}
          handleApply={handleApply}
        />
      </FilterDrawer>
      <ConfirmDialog
        open={open}
        handleClose={handleClose}
        handleDelete={handleDelete}
        disabled={!deleteCondition}
        text={`${deletedData?.documentCount}-${deletedData?.auditCount}-${deletedData?.hiraCount}-${deletedData?.caraCount}`}
      />
      <>
        <Box display="flex" justifyContent="flex-end" alignItems="center">
          {isOrgAdmin && matches && (
            <Tooltip title="Export Departments">
              <MdGetApp
                onClick={() => exportDepartments(false)}
                style={{
                  position: "relative",
                  top: "-1px",
                  right: "15px",
                  fontSize: "30px",
                  color: "#0E497A",
                }}
              />
            </Tooltip>
          )}
          {isOrgAdmin && matches && (
            <Tooltip title="Import Departments">
              <MdPublish
                onClick={() => setImportDepartmentModel({ open: true })}
                style={{
                  position: "relative",
                  top: "-3px",
                  right: "10px",
                  fontSize: "30px",
                  color: "#0E497A",
                }}
              />
            </Tooltip>
          )}
          {importDepartmentModel.open && (
            <Modal
              title="Import Departments"
              open={importDepartmentModel.open}
              onCancel={() => setImportDepartmentModel({ open: false })}
              onOk={() => {
                importDepartment();
                setImportDepartmentModel({ open: false });
              }}
            >
              <Form.Item name="attachments" label={"Attach File: "}>
                <Upload
                  name="attachments"
                  {...uploadProps}
                  className={classes.buttonColor}
                  fileList={fileList}
                >
                  <p className="ant-upload-drag-icon">
                    <MdInbox />
                  </p>
                  <p className="ant-upload-text">
                    Click or drag file to this area to upload
                  </p>
                </Upload>
              </Form.Item>
            </Modal>
          )}
          <SearchBar
            placeholder={`Search ${entityTypeName}`}
            name="query"
            values={searchValue}
            handleChange={handleSearchChange}
            handleApply={handleApply}
            endAdornment={true}
            handleClickDiscard={handleDiscard}
          />
        </Box>

        {isLoading ? (
          <div className={classes.loader}>
            <CircularProgress />
          </div>
        ) : data && data ? (
          <>
            <div data-testid="custom-table" className={classes.tableContainer}>
              {/* <CustomTable
                header={headers}
                fields={fields}
                data={data}
                isAction={isOrgAdmin ? true : false}
                actions={[
                  {
                    label: "Edit",
                    icon: <EditIcon fontSize="small" />,
                    handler: handleEditDept,
                  },
                  {
                    label: "Delete",
                    icon: <DeleteIcon fontSize="small" />,
                    handler: handleOpen,
                  },
                ]}
              /> */}
              <Table
                dataSource={data}
                pagination={false}
                columns={columns}
                size="middle"
                rowKey={"id"}
                className={classes.departmentTable}
                // rowClassName={rowClassName}
              />
              {/* <SimplePaginationController
                count={count}
                page={page}
                rowsPerPage={10}
                handleChangePage={handleChangePage}
              /> */}
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
          </>
        ) : (
          <>
            <div className={classes.imgContainer}>
              <img
                src={EmptyTableImg}
                alt="No Data"
                height="400px"
                width="300px"
              />
            </div>
            <Typography align="center" className={classes.emptyDataText}>
              Let’s begin by adding a department
            </Typography>
          </>
        )}
      </>
    </>
    // </div>
  );
}

export default Departments;
