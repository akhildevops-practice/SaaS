import { useState, useEffect } from "react";
import useStyles from "./styles";
import {
  AiOutlinePlusCircle,
  AiOutlineFilter,
  AiFillFilter,
} from "react-icons/ai";
import { MdOutlineTransferWithinAStation } from "react-icons/md";
import {
  Box,
  CircularProgress,
  Typography,
  Tooltip,
  Avatar,
  IconButton,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
} from "@material-ui/core";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import { useLocation, useNavigate } from "react-router-dom";
import MultiUserDisplay from "components/MultiUserDisplay";
import getAppUrl from "utils/getAppUrl";
import axios from "apis/axios.global";
import { useRecoilState } from "recoil";
import { MdOutlineAssignmentLate } from "react-icons/md";
import { userFormData } from "recoil/atom";
import ConfirmDialog from "components/ConfirmDialog";
import checkActionsAllowed from "utils/checkActionsAllowed";
import FilterDrawer from "components/FilterDrawer";
import SearchBar from "components/SearchBar";
import EmptyTableImg from "assets/EmptyTableImg.svg";
import checkRoles from "utils/checkRoles";
import { useSnackbar } from "notistack";
import DropDownFilter from "components/DropDownFilter";
import { API_LINK } from "config";
import Table, { ColumnsType } from "antd/es/table";
import { ReactComponent as CustomDeleteICon } from "assets/documentControl/Delete.svg";
import { ReactComponent as CustomEditICon } from "assets/documentControl/Edit.svg";
import { MdOutlineHighlightOff } from "react-icons/md";
import { MdOutlineFindReplace } from "react-icons/md";
import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  Modal,
  Pagination,
  PaginationProps,
  Row,
  Select,
  Upload,
  UploadProps,
} from "antd";
import { formatDashboardQuery } from "utils/formatDashboardQuery";
import * as XLSX from "xlsx";
import { MdGetApp } from "react-icons/md";
import { MdInbox } from "react-icons/md";
import { saveAs } from "file-saver";
import { MdPublish } from "react-icons/md";

import checkRole from "utils/checkRoles";

type Props = { type: boolean };

const fields = ["fname", "email", "role", "location", "entity"];
const headers = ["FullName", "Email", "Roles", "Unit", "Department"];

const dropDownFilter = [
  { name: "Active", value: "true" },
  { name: "In Active", value: "false" },
];

function UserMaster({ type = true }: Props) {
  const matches = useMediaQuery("(min-width:822px)");
  const [data, setData] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const orgName = getAppUrl();
  const locationNav = useLocation();

  const [formData, setFormData] = useRecoilState(userFormData);
  const [deleteLoc, setDeleteLoc] = useState<any>();
  const [open, setOpen] = useState(false);
  const [rerender, setRerender] = useState(false);
  const [searchValue, setSearchValue] = useState<any>({});
  const [count, setCount] = useState<number>();
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const userdetails: any = sessionStorage.getItem("userDetails");
  const userid: any = JSON.parse(userdetails).id;
  const userInfo = JSON.parse(userdetails);
  const [isGraphSectionVisible, setIsGraphSectionVisible] = useState(false);
  const classes = useStyles({
    isGraphSectionVisible: isGraphSectionVisible,
  });
  const [listlocation, setListLoction] = useState([]);
  const [listEntity, setListEntity] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const showTotal: PaginationProps["showTotal"] = (total) =>
    `Total ${total} items`;
  const [searchValues, setSearch] = useState<any>({ searchQuery: "" });
  const organizationId = sessionStorage.getItem("orgId") || "";
  const isAdmin = checkRoles("admin");
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isMr = checkRole("MR");
  const isLocAdmin = checkRoles("LOCATION-ADMIN");
  const [isFilterType, setfilterType] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<any>();
  const [selectedEntity, setSelectedEntity] = useState<any>([]);
  const [importModel, setImportModel] = useState<any>({
    open: false,
  });
  const [fileList, setFileList] = useState<any>([]);

  //sate variables for transfer modal
  const userDetails = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [users, setUsers] = useState<any>([]);
  const [units, setUnits] = useState<any>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<any>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedDeptUsers, setSelectedDeptUsers] = useState<any>([]);
  const [selectedAssignedUsers, setSelectedAssignedUsers] = useState<any>([]);
  const [depts, setDepts] = useState<any>([]);
  const [selectedDeptUser, setSelectedDeptUser] = useState<any>(null);
  const [selectedDeptUnit, setSelectedDeptUnit] = useState<any>(null);
  const [isDialogVisible, setIsDialogVisible] = useState(false);

  useEffect(() => {
    if (selectedLocation !== undefined && selectedLocation !== "undefined") {
      fetchEntityData();
    }
  }, [selectedLocation]);
  useEffect(() => {
    getPendingTransferUsers();
  }, []);
  //call this api only when assignn modal is visible
  useEffect(() => {
    if (assignModalVisible === true) {
      getAllEntities();
    }
  }, [assignModalVisible]);
  //call the apis only when modal is opened
  useEffect(() => {
    if (transferModalVisible === true) {
      getAllLocations();
      getUsersOfLocation();
    }
  }, [transferModalVisible]);

  const handleTransferModalButtonClick = () => {
    setTransferModalVisible(true);
  };
  const handleTransferModalClose = () => {
    setTransferModalVisible(false);
    setSelectedUsers([]);
    getPendingTransferUsers();
  };
  const showDialog = () => {
    setIsDialogVisible(true); // Show the dialog
  };

  const handleDialogOk = () => {
    setIsDialogVisible(false);
    handleSubmit();
  };

  const handleDialogCancel = () => {
    setIsDialogVisible(false);
  };

  const handleAssignModalButtonClick = () => {
    setAssignModalVisible(true);
  };
  const handleAssignModalClose = () => {
    setAssignModalVisible(false);
    setSelectedAssignedUsers([]);
    getPendingTransferUsers();
    const url = formatDashboardQuery(`/api/user/allusers/${orgName}`, {
      ...searchValue,
      location: selectedLocation,
      entity: selectedEntity,
      page: 1,
      limit: rowsPerPage,
    });
    getData(url);
  };

  const fetchEntityData = async () => {
    const encodedLocation = selectedLocation
      ?.map((value: any) => {
        return `location[]=${value}`;
      })
      .join("&");
    const data = await axios.get(
      `/api/user/getEntityByLocation?${encodedLocation}`
    );
    setListEntity(data?.data);
  };
  const getUsersOfLocation = async () => {
    try {
      const result = await axios.get(
        `api/objective/getAllUserForLocation/${userDetails?.locationId}`
      );
      if (result?.data) {
        setUsers(result?.data?.allUsers);
      }
    } catch (error) {
      setUsers([]);
      console.log("error", error);
    }
  };
  const getPendingTransferUsers = async () => {
    try {
      const result = await axios.get(
        `api/user/getPendingForActionUsers/${userDetails.locationId}`
      );
      if (result?.data) {
        setSelectedDeptUsers(result?.data);
      }
    } catch (error) {}
  };
  const getAllLocations = async () => {
    try {
      const result = await axios.get(
        `/api/riskregister/getAllLocation/${userDetails.organizationId}`
      );
      if (result?.data?.data) {
        const filteredUnits = result.data.data.filter(
          (unit: any) => unit.id !== userDetails.locationId
        );
        setUnits(filteredUnits);
      }
    } catch (error) {
      setUnits([]);
    }
  };
  const handleDelegation = () => {
    navigate("user/userDelegation");
  };
  const getAllEntities = async () => {
    try {
      const res = await axios.get(`/api/entity/${userDetails?.locationId}`);
      if (res?.data) {
        setDepts(res?.data);
      }
    } catch (error) {}
  };
  const handleAddUserRow = () => {
    // Check if both user and unit are selected
    if (selectedUser && selectedUnit) {
      // Check if the user with the selected unit already exists in selectedUsers
      const isDuplicate = selectedUsers.some(
        (user: any) =>
          user.userId === selectedUser.id && user.toUnit === selectedUnit.id
      );

      if (isDuplicate) {
        return;
        // Prevent adding a duplicate
      }

      // Add the selected user and unit to the state
      setSelectedUsers([
        ...selectedUsers,
        {
          username: selectedUser.username,
          userId: selectedUser.id,
          locationName: selectedUnit.locationName,
          fromUnit: selectedUser.locationId,
          toUnit: selectedUnit.id,
          status: "pending",
          transferredBy: userDetails?.id,
          initiatedOn: new Date(),
          completedOn: null,
          organizationId: userDetails?.organizationId,
        },
      ]);

      // Optionally, reset the selection after adding
      setSelectedUser(null);
      setSelectedUnit(null);
    } else {
      enqueueSnackbar("Please select both a user and a unit.", {
        variant: "error",
      });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await axios.post(`/api/user/transferUser`, {
        selectedUsers,
      });
      handleTransferModalClose();
      setSelectedUsers([]);
      const url = formatDashboardQuery(`/api/user/allusers/${orgName}`, {
        ...searchValue,
        location: selectedLocation,
        entity: selectedEntity,
        page: 1,
        limit: rowsPerPage,
      });
      getData(url);
    } catch (error) {
      console.error("Transfer failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleRemoveUser = (index: any) => {
    const updatedUsers = [...selectedUsers];
    updatedUsers.splice(index, 1); // Remove user from the selectedUsers array
    setSelectedUsers(updatedUsers); // Update the state
  };

  // Function to handle submit action
  const handleAssignSubmit = async () => {
    // API call to submit the entire form data
    // console.log("Submit Data:", selectedAssignedUsers);
    if (selectedAssignedUsers?.length > 0) {
      try {
        const res = await axios.put(
          `/api/user/updateTransferredUser`,
          selectedAssignedUsers
        );
        if (res.status === 200) {
          handleAssignModalClose();
          selectedAssignedUsers([]);
          // getPendingTransferUsers();
          const url = formatDashboardQuery(`/api/user/allusers/${orgName}`, {
            ...searchValue,
            location: selectedLocation,
            entity: selectedEntity,
            page: 1,
            limit: rowsPerPage,
          });
          getData(url);
        }
      } catch (error) {}
    }
    // Example: await submitApiCall(selectedUsers);
  };

  const columns: ColumnsType<any> = [
    {
      title: "Full Name",
      dataIndex: "fname",
      key: "fname",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Roles",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Unit",
      dataIndex: "location",
      key: "location",
      render: (_: any, record: any) => {
        if (record?.userType !== "globalRoles") {
          return record?.location?.locationName; // Return the locationName
        } else {
          // <MultiUserDisplay name="location" data={record?.location} />;
          return record?.location;
        }
      },
      // filterIcon: (filtered: any) => (
      //   <AiFillFilter style={{ fontSize: "16px", color: "black" }} />
      // ) : (
      //   <AiOutlineFilter style={{ fontSize: "16px" }} />
      // ),
      filterIcon: (filtered: any) =>
        selectedLocation?.length > 0 ? (
          <AiFillFilter style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <AiOutlineFilter style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }: any) => {
        // Create a set to store unique names

        return (
          <div>
            <div style={{ padding: 8 }}>
              <Button
                type="primary"
                disabled={selectedLocation.length === 0}
                onClick={() => {
                  // let url = formatDashboardQuery(`/api/dashboard/`, {
                  //   ...searchValues,
                  //   documentTypes: selectedLocation,
                  //   page: page,
                  //   limit: rowsPerPage,
                  // });
                  // fetchDocuments(url);
                  const url = formatDashboardQuery(
                    `/api/user/allusers/${orgName}`,
                    {
                      ...searchValue,
                      location: selectedLocation,
                      entity: selectedEntity,
                      page: 1,
                      limit: rowsPerPage,
                    }
                  );
                  getData(url);
                  // setSelectedEntity([])
                  setfilterType(true);
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
                  sessionStorage.setItem(
                    "selectedLocationNew",
                    JSON.stringify([])
                  );
                  // let url = formatQuery(
                  //   `/api/user/allusers/${orgName}`,
                  //   {},
                  //   [
                  //     { name: "page", value: page },
                  //     { name: "limit", value: rowsPerPage },
                  //   ],
                  //   true
                  // );
                  const url = formatDashboardQuery(
                    `/api/user/allusers/${orgName}`,
                    {
                      ...searchValue,
                      page: 1,
                      limit: rowsPerPage,
                    }
                  );
                  getData(url);
                  setfilterType(false);
                  confirm();
                }}
              >
                Reset
              </Button>
            </div>
            <div style={{ padding: 8, overflowY: "scroll", height: "300px" }}>
              {listlocation.map((item: any) => (
                <div key={item.id}>
                  <label style={{ display: "flex", alignItems: "center" }}>
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        const value = e.target.value;
                        if (e.target.checked) {
                          setSelectedLocation([...selectedLocation, value]);
                          sessionStorage.setItem(
                            "selectedLocationNew",
                            JSON.stringify([...selectedLocation, value])
                          );
                        } else {
                          setSelectedLocation(
                            selectedLocation.filter((key: any) => key !== value)
                          );
                          sessionStorage.setItem(
                            "selectedLocationNew",
                            JSON.stringify([
                              ...selectedLocation.filter(
                                (key: any) => key !== value
                              ),
                            ])
                          );
                        }
                      }}
                      value={item.id}
                      checked={selectedLocation.includes(item.id)} // Check if the checkbox should be checked
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
      title: "Dept/Vertical",
      dataIndex: "entity",
      key: "entity",
      filterIcon: (filtered: any) =>
        selectedEntity?.length > 0 ? (
          <AiFillFilter style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <AiOutlineFilter style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }: any) => {
        // Create a set to store unique names

        return (
          <div>
            <div style={{ padding: 8 }}>
              <Button
                type="primary"
                disabled={selectedLocation?.length === 0}
                onClick={() => {
                  // let url = formatDashboardQuery(`/api/dashboard/`, {
                  //   ...searchValues,
                  //   documentTypes: selectedLocation,
                  //   page: page,
                  //   limit: rowsPerPage,
                  // });
                  // fetchDocuments(url);
                  const url = formatDashboardQuery(
                    `/api/user/allusers/${orgName}`,
                    {
                      ...searchValue,
                      entity: selectedEntity,
                      location: selectedLocation,
                      page: 1,
                      limit: rowsPerPage,
                    }
                  );
                  getData(url);
                  // setSelectedEntity([])
                  setfilterType(true);
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
                  setSelectedEntity([]);
                  // let url = formatQuery(
                  //   `/api/user/allusers/${orgName}`,
                  //   {},
                  //   [
                  //     { name: "page", value: page },
                  //     { name: "limit", value: rowsPerPage },
                  //   ],
                  //   true
                  // );
                  sessionStorage.setItem(
                    "selectedEntityNew",
                    JSON.stringify([])
                  );

                  const url = formatDashboardQuery(
                    `/api/user/allusers/${orgName}`,
                    {
                      ...searchValue,
                      location: selectedLocation,
                      page: 1,
                      limit: rowsPerPage,
                    }
                  );
                  getData(url);
                  setfilterType(false);
                  confirm();
                }}
              >
                Reset
              </Button>
            </div>
            <div style={{ padding: 8, overflowY: "scroll", height: "300px" }}>
              {listEntity.map((item: any) => (
                <div key={item.id}>
                  <label style={{ display: "flex", alignItems: "center" }}>
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        const value = e.target.value;
                        if (e.target.checked) {
                          setSelectedEntity([...selectedEntity, value]);
                          sessionStorage.setItem(
                            "selectedEntityNew",
                            JSON.stringify([...selectedEntity, value])
                          );
                        } else {
                          setSelectedEntity(
                            selectedEntity.filter((key: any) => key !== value)
                          );
                          sessionStorage.setItem(
                            "selectedEntityNew",
                            JSON.stringify([
                              ...selectedEntity.filter(
                                (key: any) => key !== value
                              ),
                            ])
                          );
                        }
                      }}
                      value={item.id}
                      checked={selectedEntity?.includes(item?.id)} // Check if the checkbox should be checked
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
            </div>
          </div>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      dataIndex: "access",
      width: 150,
      render: (_: any, record: any) =>
        record.access && (
          <>
            <IconButton
              onClick={() => {
                handleEditUser(record);
              }}
              className={classes.actionButtonStyle}
              data-testid="action-item"
            >
              <CustomEditICon width={18} height={18} />
            </IconButton>
            <Divider type="vertical" className={classes.NavDivider} />
            {record.access && (
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
  const modalColumns = [
    {
      title: "User Name",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Transfer to Unit",
      dataIndex: "locationName",
      key: "locationName",
    },
    {
      title: "Action",
      key: "action",
      render: (text: any, record: any, index: any) => (
        <Tooltip title="Click to remove">
          <Button
            icon={<MdOutlineHighlightOff />}
            onClick={() => handleRemoveUser(index)}
            size="small"
          />
        </Tooltip>
      ),
    },
  ];
  const assignModalColumns = [
    {
      title: "User",
      key: "user",
      render: (text: any, record: any, index: any) => (
        <Input
          defaultValue={record.userDetails?.username}
          disabled
          width={"350px"}
          // onBlur={(e:any) => {
          //   const updatedUsers = [...selectedUsers];
          //   updatedUsers[index].username = e.target.value;
          //   setSelectedUsers(updatedUsers);
          // }}
        />
      ),
    },
    {
      title: "Department",
      key: "dept",
      render: (text: any, record: any, index: any) => (
        <Select
          // defaultValue={record?.entityId} // Assuming record has dept with an id
          onChange={(value) => {
            // console.log("record", record);
            const updatedUsers = [...selectedAssignedUsers];

            // Ensure that you correctly update both fields
            updatedUsers[index] = {
              ...updatedUsers[index],
              // Spread the existing properties
              _id: record?._id,
              userId: record?.userDetails?.id, // Assign userId
              entityId: depts.find((dept: any) => dept.id === value)?.id, // Find the correct department and assign entityId
            };

            setSelectedAssignedUsers(updatedUsers); // Update the state
          }}
          style={{ width: "400px" }}
        >
          {depts.map((dept: any) => (
            <Select.Option key={dept.id} value={dept.id}>
              {dept.entityName}
            </Select.Option>
          ))}
        </Select>
      ),
    },

    // {
    //   title: "Action",
    //   key: "action",
    //   render: (text: any, record: any, index: any) => (
    //     <Tooltip title="Click to confirm">
    //       <Button
    //         icon={<CheckOutlined />}
    //         onClick={() => handleConfirmUser(record)}
    //         type="primary"
    //       />
    //     </Tooltip>
    //   ),
    // },
  ];
  // console.log("assigneddeptuser", selectedAssignedUsers);

  const importUsers = async () => {
    try {
      const XLSX = require("xlsx");
      const formData = new FormData();
      formData.append("file", fileList[0].originFileObj);
      formData.append("orgName", orgName);
      const response = await axios.post(
        `${API_LINK}/api/user/importuser`,
        formData
      );
      if (response.data.success) {
        const headers = Object.keys(response.data.invalidUsers[0]);
        const invalidSheet = XLSX.utils.aoa_to_sheet(
          response.data.invalidUsers,
          { header: headers }
        );
        const invalidWorkbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(
          invalidWorkbook,
          invalidSheet,
          "invalid Users"
        );
        const excelBinaryString = XLSX.write(invalidWorkbook, {
          bookType: "xlsx",
          type: "binary",
        });
        const blob = new Blob([s2ab(excelBinaryString)], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
        });
        saveAs(blob, "InvalidUsers.xlsx");
        enqueueSnackbar(`Some Users Failed Please Check InvalidUsers`, {
          variant: "warning",
        });
      }
      if (response.data.wrongFormat) {
        exportUsers(true);
      } else {
        enqueueSnackbar(`Users Import Successful`, {
          variant: "success",
        });
      }
      // let url = formatQuery(
      //   `/api/user/allusers/${orgName}`,
      //   {},
      //   [
      //     { name: "page", value: page },
      //     { name: "limit", value: rowsPerPage },
      //   ],
      //   true
      // );
      const url = formatDashboardQuery(`/api/user/allusers/${orgName}`, {
        ...searchValue,
        location: selectedLocation,
        page: page,
        limit: rowsPerPage,
      });
      getData(url);
    } catch (error) {
      console.log("error in uploading attachments", error);
    }
  };

  const exportUsers = async (bool: boolean) => {
    const url = formatDashboardQuery(`/api/user/allusers/${orgName}`, {
      ...searchValue,
      location: selectedLocation,
      page: 1,
      limit: 1000000000,
    });
    const response = await getDataForExport(url);
    let requiredData: any[] = [];
    if (data.length === 0 || bool) {
      requiredData = [
        {
          UserName: "username1",
          FirstName: "firstname1",
          LastName: "lastname1",
          Email: "f1.l1@gmail.com",
          LocationName: "Location1",
          DepartmentName: "Department1",
        },
        {
          UserName: "username2",
          FirstName: "firstname2",
          LastName: "lastname2",
          Email: "f2.l2@gmail.com",
          LocationName: "Location2",
          DepartmentName: "Department2",
        },
        {
          UserName: "Required",
          FirstName: "Required",
          LastName: "Required",
          Email: "Required",
          LocationName: "Required",
          DepartmentName:
            "Required (IGNORE THIS ROW WHEN CREATING USER IMPORT)",
        },
      ];
    } else {
      for (const element of response) {
        requiredData.push({
          Username: element.userName,
          FirstName: element.firstName,
          LastName: element.lastName,
          Email: element.email,
          Roles: element.role.props.data
            .map((dataRole: { role: any }) => dataRole.role)
            .join(", "),
          Location: element.location.locationName
            ? element.location.locationName
            : "N/A",
          Entity: element.entity,
        });
      }
    }
    const sheet = XLSX.utils.json_to_sheet(requiredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Users");
    const excelBinaryString = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "binary",
    });
    const blob = new Blob([s2ab(excelBinaryString)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    if (data.length === 0 || bool) {
      saveAs(blob, "UsersTemplate.xlsx");
      if (bool) {
        enqueueSnackbar(`Wrong Template Please View UsersTemplate`, {
          variant: "error",
        });
      }
    } else {
      enqueueSnackbar(`Export Departments Successful`, {
        variant: "success",
      });
      saveAs(blob, "Users.xlsx");
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
    try {
      const res = await axios.get(url);
      if (res?.data?.data) {
        // console.log(res?.data?.data);
        setCount(res.data.length);
        const values = res?.data?.data?.map((item: any) => {
          const initials = item.username
            ?.split(" ")
            ?.map((name: any) => name[0])
            ?.slice(0, 2)
            ?.join("");

          // Map the roles and replace 'MR' with 'IMSC' and 'ORG-ADMIN' with 'MCOE'
          const mappedRoles = item?.assignedRole?.map((role: any) => {
            if (role.role === "MR") {
              return {
                ...role,
                role: userDetails?.organization?.applicationAdminTitle
                  ? userDetails?.organization?.applicationAdminTitle
                  : "IMSC",
              };
            } else if (role.role === "ORG-ADMIN") {
              return {
                ...role,
                role: userDetails?.organization?.orgAdminTitle
                  ? userDetails?.organization?.orgAdminTitle
                  : "MCOE",
              };
            }
            return role;
          });
          // console.log("mappedRoles", mappedRoles);
          let locations;

          if (item?.userType === "globalRoles") {
            locations =
              item?.additionalUnits && Array.isArray(item?.additionalUnits)
                ? item?.additionalUnits

                    .map((unit: any) => unit?.locationName)
                    .join(", ") || "N/A"
                : "N/A";
          } else {
            locations = item?.location ? item?.location : "N/A";
          }
          return {
            firstName: item.firstname,
            lastName: item.lastname,
            fname: (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  alignItems: "center",
                }}
              >
                <Avatar
                  src={`${API_LINK}/${item.avatar}`}
                  alt="profile"
                  style={{ height: "28px", width: "28px" }}
                >
                  {initials}
                </Avatar>{" "}
                <div
                  style={{
                    marginLeft: "5%",
                  }}
                >
                  {item.firstname} {item.lastname}
                </div>
              </div>
            ),
            // fname:
            //   (
            // <Avatar
            //   alt="Avatar"
            //   src={
            //     item.avatart === null
            //       ? avatar
            //       : `${API_LINK}/${item.avatar}`
            //   }
            //   style={{ cursor: "pointer" }}
            // />
            //   <div>what </div>
            // ) && item.firstname + " " + item.lastname,
            email: item.email,
            // role: item.assignedRole ? (
            //   <MultiUserDisplay name="role" data={item.assignedRole} />
            // ) : item.roleName ? (
            //   <MultiUserDisplay name="role.roleName" data={item.assignedRole} />
            // ) : (
            //   "N/A"
            // ),
            role: mappedRoles ? (
              <MultiUserDisplay name="role" data={mappedRoles} />
            ) : (
              "N/A"
            ),
            location: locations,
            section: item?.section?.name ? item?.section?.name : "N/A",
            entity: item.entity?.entityName ? item?.entity?.entityName : "N/A",
            businessType: item?.businessType?.name
              ? item?.businessType?.name
              : "N/A",
            id: item.id,
            access: item.access,
            isAction: checkActionsAllowed(item.username, ["Delete"]).concat(
              checkActionsAllowed(item.access, ["Edit", "Delete"], true)
            ),
            userName: item.username,
            userType: item?.userType,
          };
        });
        setData(values);
      }
      setIsLoading(false);
    } catch (err) {
      enqueueSnackbar(`Error While Fetching Data`, { variant: "error" });
      setIsLoading(false);
    }
  };

  const getDataForExport = async (url: any) => {
    try {
      const res = await axios.get(url);
      if (res?.data?.data) {
        const values = res?.data?.data.map((item: any) => {
          return {
            firstName: item.firstname,
            lastName: item.lastname,
            email: item.email,
            role: item.assignedRole ? (
              <MultiUserDisplay name="role" data={item.assignedRole} />
            ) : item.roleName ? (
              <MultiUserDisplay name="role.roleName" data={item.assignedRole} />
            ) : (
              "N/A"
            ),
            location: item?.location ? item?.location : "N/A",
            entity: item.entity?.entityName ? item?.entity?.entityName : "N/A",
            userName: item.username,
          };
        });
        return values;
      }
    } catch (err) {
      enqueueSnackbar(`Error While Fetching Data`, { variant: "error" });
      setIsLoading(false);
    }
  };

  const handleEditUser = (data: any) => {
    navigate(`/master/user/newuser/${data.id}`);
  };

  const handleOpen = (val: any) => {
    setOpen(true);
    setDeleteLoc(val);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = async () => {
    handleClose();
    setIsLoading(true);
    try {
      const res = await axios.delete(`api/user/${deleteLoc.id}/${orgName}`);
      // const result = await axios.post(`/api/audit-trial/createAuditTrial`, {
      //   moduleType: "USER",
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
    if (e.target.name === "query") {
      sessionStorage.setItem("searchUserText", e.target.value);
    }
    setSearchValue({
      ...searchValue,
      [e.target.name]: e.target.value,
    });
  };
  // console.log("searchText", searchValue);
  const handleApply = () => {
    // console.log("inside handleapply", searchValue);
    setPage(1);
    // const url = formatQuery(
    //   `/api/user/allusers/${orgName}`,
    //   { ...searchValue, page: 1, limit: rowsPerPage },
    //   ["query", "page", "limit"]
    // );
    sessionStorage.setItem("userPage", "1");
    const url = formatDashboardQuery(`/api/user/allusers/${orgName}`, {
      ...searchValue,
      location: selectedLocation,
      page: page,
      limit: rowsPerPage,
    });
    getData(url);
  };

  const handleDiscard = () => {
    // let url = formatQuery(
    //   `/api/user/allusers/${orgName}`,
    //   {},
    //   [
    //     { name: "page", value: page },
    //     { name: "limit", value: rowsPerPage },
    //   ],
    //   true
    // );
    const url = formatDashboardQuery(`/api/user/allusers/${orgName}`, {
      // ...searchValue,
      location: selectedLocation,
      page: page,
      limit: rowsPerPage,
    });
    getData(url);
    setPage(1);
    sessionStorage.setItem("userPage", "1");
    setSearchValue({
      query: "",
      locationName: "",
      departmentName: "",
      user: "",
      businessType: "",
      byRole: "",
      status: "",
    });
  };

  const handleChangePage = (page: any, pageSize: any = rowsPerPage) => {
    setPage(page);
    sessionStorage.setItem("userPage", page);
    sessionStorage.setItem("userRows", pageSize);
    setRowsPerPage(pageSize);
    const url = formatDashboardQuery(`/api/user/allusers/${orgName}`, {
      ...searchValue,
      location: selectedLocation,
      entity: selectedEntity,
      page: page,
      limit: pageSize,
    });
    getData(url);
  };
  // listlocation
  useEffect(() => {
    getLocationList();
  }, []);

  useEffect(() => {
    // let url = formatQuery(
    //   `/api/user/allusers/${orgName}`,
    //   {},
    //   [
    //     { name: "page", value: page },
    //     { name: "limit", value: rowsPerPage },
    //   ],
    //   true
    // );

    const locationData: any = sessionStorage.getItem("selectedLocationNew");
    const locData: any = JSON.parse(locationData);

    const entityData: any = sessionStorage.getItem("selectedEntityNew");
    const entData: any = JSON.parse(entityData);

    const searchText: any = sessionStorage.getItem("searchUserText");
    const userPage = sessionStorage.getItem("userPage");
    const userRow = sessionStorage.getItem("userRows");
    let searchData = {};
    if (searchText !== undefined && searchText !== "") {
      searchData = { query: searchText };
      setSearchValue({
        query: searchText,
      });
    }
    if (userPage !== null && userPage !== "" && userPage !== undefined) {
      setPage(parseInt(userPage));
    }

    if (userRow !== null && userRow !== "" && userRow !== undefined) {
      setRowsPerPage(parseInt(userRow));
    }

    // sessionStorage.setItem(
    //   "selectedEntityNew",
    //   JSON.stringify([...selectedEntity.filter((key: any) => key !== value)])
    // );

    if (locData === null) {
      setSelectedLocation([userInfo.locationId]);
      sessionStorage.setItem(
        "selectedLocationNew",
        JSON.stringify([userInfo.locationId])
      );
    } else {
      setSelectedLocation(locData);
      setSelectedEntity(entData?.length > 0 ? entData : []);
      setSelectedEntity(entData?.length > 0 ? entData : []);
    }
    let url;

    if (searchText !== undefined && searchText !== "") {
      url = formatDashboardQuery(`/api/user/allusers/${orgName}`, {
        ...searchData,
        entity: entData?.length > 0 ? entData : undefined,
        location: locData === null ? [userInfo.locationId] : locData,
        page:
          userPage !== null && userPage !== "" && userPage !== undefined
            ? parseInt(userPage)
            : page,
        limit:
          userRow !== null && userRow !== "" && userRow !== undefined
            ? parseInt(userRow)
            : rowsPerPage,
      });
    } else {
      url = formatDashboardQuery(`/api/user/allusers/${orgName}`, {
        ...searchValue,
        entity: entData?.length > 0 ? entData : undefined,

        location: locData === null ? [userInfo.locationId] : locData,
        page:
          userPage !== null && userPage !== "" && userPage !== undefined
            ? parseInt(userPage)
            : page,
        limit:
          userRow !== null && userRow !== "" && userRow !== undefined
            ? parseInt(userRow)
            : rowsPerPage,
      });
    }

    getData(url);
  }, [rerender]);

  const getLocationList = async () => {
    const res = await axios.get(`/api/location/getAllLocationList`);
    setListLoction(res.data);
  };

  const rowClassName = (record: any, index: number) => {
    return index % 2 === 0
      ? classes.alternateRowColor1
      : classes.alternateRowColor2;
  };

  const handleClickDiscard = () => {};
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
          placeholder="By Full Name"
          name="user"
          handleChange={handleSearchChange}
          values={searchValue}
          handleApply={handleApply}
        />
        <SearchBar
          placeholder="By Role"
          name="byRole"
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
        <SearchBar
          placeholder="By Department"
          name="departmentName"
          handleChange={handleSearchChange}
          values={searchValue}
          handleApply={handleApply}
        />
        <SearchBar
          placeholder="By Location"
          name="locationName"
          handleChange={handleSearchChange}
          values={searchValue}
          handleApply={handleApply}
        />
        <DropDownFilter
          handleApply={handleApply}
          values={searchValue}
          placeholder="By Status"
          optionList={dropDownFilter}
          handleChange={handleSearchChange}
          name="status"
        />
      </FilterDrawer>

      <Box
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        style={{ paddingBottom: "10px" }}
      >
        {isMr && matches && (
          <Tooltip title="Delegate">
            <Button
              style={{
                backgroundColor: "white",
                marginRight: "20px",
                color: "black",
                display: "inline-flex", // Ensures that icon and text are inline
                alignItems: "center", // Vertically aligns the icon and text
              }}
              color="primary"
              onClick={handleDelegation}
            >
              <MdOutlineFindReplace style={{ marginRight: "8px" }} />
              Delegate
            </Button>
          </Tooltip>
        )}
        {isMr && matches && (
          <Tooltip title="Transfer Users">
            <Button
              style={{
                backgroundColor: "white",
                marginRight: "20px",
                color: "black",
                display: "inline-flex", // Ensures that icon and text are inline
                alignItems: "center", // Vertically aligns the icon and text
              }}
              color="primary"
              onClick={handleTransferModalButtonClick}
            >
              <MdOutlineTransferWithinAStation style={{ marginRight: "8px" }} />
              Transfer
            </Button>
          </Tooltip>
        )}
        {isMr && matches && selectedDeptUsers?.length > 0 && (
          <Tooltip title="Assign Department">
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                position: "relative",
                marginRight: "20px",
              }}
            >
              <Button
                style={{
                  backgroundColor: "white",
                  marginRight: "20px",
                  color: "black",
                  display: "inline-flex", // Ensures that icon and text are inline
                  alignItems: "center", // Vertically aligns the icon and text
                }}
                color="primary"
                onClick={handleAssignModalButtonClick}
              >
                <MdOutlineAssignmentLate style={{ marginRight: "8px" }} />
                Assign
              </Button>

              <div
                style={{
                  position: "absolute",
                  top: "-5px",
                  right: "-5px",
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  backgroundColor: "green",
                  color: "white",
                  fontSize: "12px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontWeight: "bold",
                }}
              >
                {selectedDeptUsers.length}
              </div>
            </div>
          </Tooltip>
        )}
        {isOrgAdmin && matches && (
          <Tooltip title="Export Users">
            <MdGetApp
              onClick={() => exportUsers(false)}
              className={classes.downloadIcon}
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
          <Tooltip title="Import Users">
            <MdPublish
              onClick={() => setImportModel({ open: true })}
              style={{
                position: "relative",
                top: "-3px",
                right: "10px",
                fontSize: "30px",
                color: "#0E497A",
                paddingLeft: "5px",
              }}
            />
          </Tooltip>
        )}
        {importModel.open && (
          <Modal
            title="Import Users"
            open={importModel.open}
            onCancel={() => setImportModel({ open: false })}
            onOk={() => {
              importUsers();
              setImportModel({ open: false });
            }}
          >
            <Form.Item name="attachments" label={"Attach File: "}>
              <Upload
                name="attachments"
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
            </Form.Item>
          </Modal>
        )}
        <SearchBar
          placeholder="Search User"
          name="query"
          values={searchValue}
          handleChange={handleSearchChange}
          handleApply={handleApply}
          endAdornment={true}
          handleClickDiscard={handleDiscard}
        />
      </Box>

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
      ) : data ? (
        <>
          <div data-testid="custom-table" className={classes.tableContainer}>
            {/* <CustomTable
              header={headers}
              fields={fields}
              data={data}
              isAction={isAdmin || isOrgAdmin || isLocAdmin}
              actions={[
                {
                  label: "Edit",
                  icon: <EditIcon fontSize="small" />,
                  handler: handleEditUser,
                },
                {
                  label: "Delete",
                  icon: <DeleteIcon fontSize="small" />,
                  handler: handleOpen,
                },
              ]}
            /> */}
            <Modal
              title="Transfer Users"
              visible={transferModalVisible}
              onCancel={handleTransferModalClose}
              footer={null}
              width={900}
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
              <Row gutter={16} style={{ marginTop: "30px" }}>
                <Col span={11}>
                  <Select
                    showSearch
                    placeholder="Select a User"
                    optionFilterProp="children"
                    allowClear
                    value={selectedUser?.id}
                    style={{ width: "100%" }}
                    onChange={(value) => {
                      const user = users.find((user: any) => user.id === value);
                      setSelectedUser(user); // Update selected user state
                    }}
                  >
                    {users.map((user: any) => (
                      <Select.Option key={user.id} value={user.id}>
                        {user?.username}
                      </Select.Option>
                    ))}
                  </Select>
                </Col>
                <Col span={11}>
                  <Select
                    showSearch
                    placeholder="Select a Unit"
                    optionFilterProp="children"
                    style={{ width: "100%" }}
                    value={selectedUnit?.id}
                    allowClear
                    onChange={(value) => {
                      const unit = units.find((unit: any) => unit.id === value);
                      setSelectedUnit(unit);
                    }}
                  >
                    {units.map((unit: any) => (
                      <Select.Option key={unit.id} value={unit.id}>
                        {unit.locationName}
                      </Select.Option>
                    ))}
                  </Select>
                </Col>
                <Col span={2}>
                  <Tooltip title="Add user to transfer list" placement="top">
                    <Button
                      type="primary"
                      style={{ backgroundColor: "#1677ff" }}
                      icon={<AiOutlinePlusCircle />}
                      onClick={handleAddUserRow}
                    ></Button>
                  </Tooltip>
                </Col>
              </Row>

              <div className={classes.tableContainer}>
                <Table
                  dataSource={selectedUsers}
                  columns={modalColumns}
                  rowKey={(record) => record?.userId}
                  pagination={false}
                  style={{ marginTop: 20 }}
                  className={classes.documentTable}
                />
              </div>

              <Row justify="end" style={{ marginTop: 20 }}>
                <Button
                  type="primary"
                  loading={isSubmitting}
                  style={{ background: "#1677ff", color: "white" }}
                  onClick={showDialog}
                >
                  Transfer
                </Button>
              </Row>
            </Modal>
            <Dialog open={isDialogVisible} onClose={handleDialogCancel}>
              <DialogTitle>Confirm Transfer</DialogTitle>
              <DialogContent>
                <p>
                  Please complete the delegation process for the users before
                  proceeding. Once transferred delegation is not possible. Do
                  you still want to proceed?
                </p>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleDialogCancel} color="primary">
                  No
                </Button>
                <Button onClick={handleDialogOk} color="primary">
                  Yes
                </Button>
              </DialogActions>
            </Dialog>

            <Modal
              title="Assign Department for Users"
              visible={assignModalVisible}
              onCancel={handleAssignModalClose}
              footer={null}
              width={700}
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
              <div className={classes.tableContainer}>
                <Table
                  dataSource={selectedDeptUsers}
                  columns={assignModalColumns}
                  rowKey={(record) => record?.id}
                  pagination={false}
                  style={{ marginTop: 20 }}
                  className={classes.documentTable}
                />
              </div>

              <Row justify="end" style={{ marginTop: 20 }}>
                <Button
                  type="primary"
                  loading={isSubmitting}
                  style={{ backgroundColor: "#003059" }}
                  onClick={handleAssignSubmit}
                >
                  Assign
                </Button>
              </Row>
            </Modal>
            <Table
              dataSource={data}
              pagination={false}
              columns={columns}
              size="middle"
              rowKey={"id"}
              className={classes.locationTable}
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
                  handleChangePage(page, pageSize);
                }}
              />
            </div>
          </div>
          <ConfirmDialog
            open={open}
            handleClose={handleClose}
            handleDelete={handleDelete}
          />
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
            Let’s begin by adding a user
          </Typography>
        </>
      )}
    </>
    // </div>
  );
}

export default UserMaster;
