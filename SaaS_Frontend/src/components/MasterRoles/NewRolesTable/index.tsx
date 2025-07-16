import {
  Col,
  Select,
  Form,
  Table,
  Tag,
  Row,
  Tooltip,
  Popover,
  Button,
  Spin,
  Modal,
  Input,
} from "antd";
import { MdAddCircle } from "react-icons/md";
import { MdSearch } from "react-icons/md";
import { useEffect, useState } from "react";
import useStyles from "./style";
import axios from "apis/axios.global";
import getAppUrl from "utils/getAppUrl";
import { debounce } from "lodash";
import { MdError } from "react-icons/md";
import checkRoles from "utils/checkRoles";
import { getUserInfo } from "apis/socketApi";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import { useMediaQuery } from "@material-ui/core";
const { Option } = Select;
const NewRolesTable = () => {
  const matches = useMediaQuery("(min-width:822px)");
  const [locations, setLocations] = useState<any>([]);
  const userDetails = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const [roles, setRoles] = useState<any>([
    {
      label: userDetails?.organization?.orgAdminTitle || "MCOE",
      value: "ORG-ADMIN",
    },
    {
      label:
        userDetails?.organization?.applicationAdminTitle || "IMS Coordinator",
      value: "MR",
    },
    {
      label: "Reviewer",
      value: "REVIEWER",
    },
    {
      label: "Approver",
      value: "APPROVER",
    },
    {
      label: "Auditor",
      value: "AUDITOR",
    },
    {
      label: "All",
      value: null,
    },
  ]);

  const [tableData, setTableData] = useState<any>([]);
  const [openPopOver, setOpenPopOver] = useState<any>(false);
  const [options, setOptions] = useState<any>([]);
  const [fetching, setFetching] = useState<any>(false);
  const [searchQuery, setsearchQuery] = useState<any>(undefined);
  const [selectedUnit, setSelectedUnit] = useState<any>(undefined);
  const [selectedRole, setSelectedRole] = useState<any>(undefined);
  const [searchUser, setSearchUser] = useState<any>(undefined);
  const [selectedUsers, setSelectedUsers] = useState<any>([]);
  const [locationId, setLocationId] = useState();
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<any>({
    open: false,
    data: {},
  });
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isMr = checkRoles("MR");
  const [searchForm] = Form.useForm();
  const classes = useStyles();
  const orgName = getAppUrl();
  const columns = [
    {
      title: "Full Name",
      dataIndex: "user",
      key: "user",
      width: 150,
      render: (text: any, record: any) =>
        record.firstName + " " + record.lastName,
    },
    {
      title: "Email",
      dataIndex: "user",
      key: "useremail",
      render: (text: any, record: any) => record.email,
      width: 150,
    },
    {
      title: "Unit",
      dataIndex: "location",
      key: "location",
      width: 150,
      render: (text: any, record: any) =>
        record.unitName ? record.unitName : "N/A",
    },
    {
      title: "Dept/Vertical",
      dataIndex: "department",
      key: "entity",
      width: 150,
      render: (text: any, record: any) =>
        record.entityName ? record.entityName : "N/A",
    },
    {
      title: "Roles Assigned  ",
      dataIndex: "role",
      key: "role",
      width: 200,
      render: (text: any, record: any, index: any) =>
        !!record.roles &&
        !!record.roles.length &&
        record.roles.map((item: any, index: any) => (
          // <div key={index}>
          <Tag
            closable={item.isEdit}
            key={index}
            onClose={(e) => toggleDeleteConfirmModal(e, record, item)}
          >
            {roleLookup[item.roleName]}
          </Tag>
          // </div>
        )),
    },
  ];

  //function to display roles readanle name , like Unit Admin instead of LOCATION-ADMIN
  const roleLookup = roles.reduce((acc: any, role: any) => {
    acc[role.value] = role.label;
    return acc;
  }, {});

  const getInfo = async () => {
    await getUserInfo().then((res: any) => {
      setLocationId(res.data.locationId);
    });
  };
  useEffect(() => {
    getLocations();
    if (isMr) {
      getInfo();
    }
  }, []);
  useEffect(() => {
    if (searchUser) {
      getAssignedRolesByFilter(selectedRole?.value, selectedUnit?.value);
    }
  }, [searchUser]);

  const getLocations = async () => {
    try {
      const res = await axios.get("/api/roles/getLocations");
      setLocations(
        res.data?.map((item: any) => ({
          label: item.locationName,
          value: item.id,
        }))
      );
    } catch (error) {
      console.log("erroro", error);
    }
  };
  const handleSearchUserChange = (e: any) => {
    // e.preventDefault();
    console.log("searchvalue", e.target.value, selectedRole, selectedUnit);

    if (
      e.target.value === "" ||
      e.target.value == undefined ||
      e.target.value === null
    ) {
      // getAssignedRolesByFilter(selectedRole?.value, selectedUnit?.value);
      setSearchUser(undefined);
    } else {
      setSearchUser(e.target.value);
      // getAssignedRolesByFilter(selectedRole?.value, selectedUnit?.value);
    }
  };

  const getAssignedRolesByFilter = async (
    roleId: any = "",
    unitId: any = ""
  ) => {
    try {
      if ((!!roleId && !!unitId) || (roleId === null && !!unitId)) {
        const res = await axios.get(
          `/api/roles/getUserBasedOnFilter/${roleId}/${unitId}/${searchUser}`
        );
        if (res.status === 200 || res.status === 201) {
          if (!!res.data && !!res.data.length) {
            setTableData(res.data);
          } else {
            setTableData(res.data);
          }
          console.log("/getUserBasedOnFilter : success");
        } else {
          console.log("/getUserBasedOnFilter : failed");
        }
      }
    } catch (error) {
      console.log("erorr in getting assinged role based on filter", error);
    }
  };

  const fetchUserList = async (value = "") => {
    try {
      setFetching(true);
      // console.log("selectedRole", selectedRole);
      const encodedValue = encodeURIComponent(value);
      let url = `api/riskregister/getuserlist?search=${encodedValue}&location=${selectedUnit?.value}`;
      if (selectedRole.value === "MR") {
        console.log("inside if");
        url = `api/riskregister/getuserlist?search=${encodedValue}`;
      }
      const res = await axios.get(url);

      if (!!res.data && res.data.length > 0) {
        const userOptions = res.data.map((user: any) => ({
          value: user.id,
          label: user.email,
          email: user.email,
          fullname: user.firstname + " " + user.lastname,
        }));
        setFetching(false);
        return userOptions;
      } else {
        setFetching(false);
        setsearchQuery(undefined);
        setOptions([]);
      }
    } catch (error) {
      setFetching(false);
      console.log(error);
    }
  };

  const debouncedFetchUsers = debounce(async (value: any) => {
    const newOptions = await fetchUserList(value);
    setOptions(!!newOptions && newOptions);
  }, 500);

  const handleSearchChange = async (value: any) => {
    setsearchQuery(value);
    debouncedFetchUsers(value);
  };
  const handleSelect = (value: any, option: any) => {
    const selectedOption = {
      label: option.label,
      value: option.value,
    };
    setSelectedUsers([...selectedUsers, selectedOption]);
  };
  const handleUnitSelect = (value: any, option: any) => {
    setSelectedUnit(option);
    getAssignedRolesByFilter(selectedRole?.value || "", value);
  };
  const handleRoleSelect = (value: any, option: any) => {
    setSelectedRole(option);
    getAssignedRolesByFilter(value, selectedUnit?.value || "");
  };

  const handleAssignUsers = async () => {
    try {
      const orgId = sessionStorage.getItem("orgId");
      const rolesIdArray = [selectedRole.value];
      const usersArray = selectedUsers.map((obj: any) => obj.value);
      // console.log("selectedunit", selectedUnit.value);
      const createRoleObj = {
        orgId: orgId,
        unitId: selectedUnit.value,
        roleId: rolesIdArray,
        users: usersArray,
      };
      const res = await axios.post("/api/roles/createRoles", createRoleObj);
      if (res.status === 200 || res.status === 201) {
        console.log("roles created : Success");
        setSelectedUsers([]);
        hide();
        getAssignedRolesByFilter(selectedRole?.value, selectedUnit?.value);
      }
    } catch (error) {
      console.log("error in assigninig roles", error);
    }
  };

  const handleDeleteRole = async () => {
    try {
      const { roleTableId, userId, rolesData } = deleteConfirmModal.data;
      if (!!roleTableId && !!userId) {
        const bodyObject = {
          users: userId,
          rolesData,
          selectedUnit: selectedUnit?.value,
        };
        const res = await axios.patch(
          `/api/roles/updateRolesById/${roleTableId}`,
          bodyObject
        );
        if (res.status === 200 || res.status === 201) {
          console.log("/updateRolesById : success", res);
          toggleDeleteConfirmModal();
          getAssignedRolesByFilter(selectedRole?.value, selectedUnit?.value);
        }
      }
    } catch (error) {
      console.log("/updateRolesById : error", error);
    }
  };
  const hide = () => {
    searchForm.resetFields();
    setOpenPopOver(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // prevent the popover from closing when clicking outside
      return;
    }
    setOpenPopOver(newOpen);
  };

  const checkIfRoleCanBeAssigned = () => {
    // if (!selectedRole?.value || !selectedUnit?.value) return false;
    // if (selectedRole?.label === "All") return false;
    // if (!!selectedRole?.value && selectedUnit?.value) return true;
    if (isOrgAdmin) {
      if (
        selectedRole?.value &&
        selectedUnit?.value !== "All" &&
        selectedRole?.value !== "AUDITOR"
      ) {
        return true;
      } else {
        return false;
      }
    } else if (
      isMr &&
      userDetails?.additionalUnits?.includes(selectedUnit?.value)
    ) {
      if (
        selectedRole?.value !== "ORG-ADMIN" &&
        //  ( selectedUnit?.value === locationId || userDetails?.additionalUnits?.includes(selectedUnit?.value))&&
        selectedRole?.value !== "MR" &&
        selectedUnit?.value !== "All" &&
        selectedRole?.label !== "All" &&
        selectedRole?.value !== "AUDITOR" &&
        (selectedRole?.value === "REVIEWER" ||
          selectedRole?.value === "APPROVER")
      ) {
        return true;
      } else {
        return false;
      }
    }
  };
  // console.log("checkIfRoleCanBeAssigned", checkIfRoleCanBeAssigned());
  const toggleDeleteConfirmModal = (
    e: any = null,
    data: any = {},
    item: any = {}
  ) => {
    // console.log("event data",e.target.value)
    if (e) e.preventDefault();
    setDeleteConfirmModal({
      ...deleteConfirmModal,
      open: !deleteConfirmModal.open,
      data: { ...data, rolesData: item },
    });
  };
  return (
    <div className={classes.root}>
      <Form layout="vertical">
        <Row
          gutter={[16, 16]}
          align="middle"
          style={{ display: "flex", flexWrap: "wrap" }}
        >
          {/* Select Corp Func / Unit */}
          <Col span={matches ? 6 : 8}>
            {" "}
            {/* Reduced span */}
            <Form.Item label="Select Corp Func / unit" name="unit">
              <Select
                showSearch
                placeholder="Select unit"
                optionFilterProp="children"
                filterOption={(input: any, option: any) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={locations}
                onSelect={handleUnitSelect}
              />
            </Form.Item>
          </Col>

          {/* Select Role */}
          <Col span={matches ? 6 : 8}>
            {" "}
            {/* Reduced span */}
            <Form.Item label="Select Role: " name="role">
              <Select
                showSearch
                placeholder="Select Role"
                optionFilterProp="children"
                filterOption={(input: any, option: any) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={roles}
                onSelect={handleRoleSelect}
              />
            </Form.Item>
          </Col>

          {/* Assign Role Button */}
          <Col
            span={matches ? 6 : 8}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between", // Make sure elements are aligned horizontally
            }}
          >
            <Tooltip title="Assign Role">
              {checkIfRoleCanBeAssigned() ? (
                <Popover
                  content={
                    <>
                      <div
                        style={{
                          width: "500px",
                          display: "flex",
                          flexDirection: "column",
                          minHeight: "90px",
                          position: "relative",
                        }}
                      >
                        <img
                          src={CloseIconImageSvg}
                          alt="close-drawer"
                          style={{
                            width: "34px",
                            height: "30px",
                            position: "absolute",
                            top: "0px",
                            right: "0px",
                            cursor: "pointer",
                          }}
                          onClick={() => hide()}
                        />
                        <div style={{ marginBottom: "10px" }}>
                          Assign the Role of{" "}
                          <b>
                            {!!selectedRole && selectedRole?.label
                              ? selectedRole.label
                              : "N/A"}
                          </b>{" "}
                          to{" "}
                          <Form
                            form={searchForm}
                            style={{
                              display: "inline-block",
                              width: "calc(100% - 200px)",
                            }}
                          >
                            <Form.Item name="users" noStyle>
                              <Select
                                showSearch
                                mode="multiple"
                                placeholder="Search and Add User"
                                notFoundContent={
                                  fetching ? (
                                    <Spin size="small" />
                                  ) : (
                                    "No results found"
                                  )
                                }
                                filterOption={(input: any, option: any) =>
                                  (option?.label ?? "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                                }
                                onSearch={handleSearchChange}
                                onSelect={handleSelect}
                                size="middle"
                                optionLabelProp="label"
                                style={{ width: "100%" }}
                              >
                                {!!options &&
                                  options.length > 0 &&
                                  options.map((option: any) => (
                                    <Select.Option
                                      key={option.value}
                                      value={option.value}
                                      label={option.label}
                                    >
                                      {option.label}
                                    </Select.Option>
                                  ))}
                              </Select>
                            </Form.Item>
                          </Form>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span>
                            at{" "}
                            <b>
                              {!!selectedUnit && selectedUnit?.label
                                ? selectedUnit.label
                                : "N/A"}
                            </b>{" "}
                            Unit
                          </span>
                          <Button type="primary" onClick={handleAssignUsers}>
                            Assign
                          </Button>
                        </div>
                      </div>
                    </>
                  }
                  trigger="click"
                  placement="bottom"
                  open={openPopOver}
                  onOpenChange={handleOpenChange}
                  className={classes.popover}
                >
                  <Button>
                    <MdAddCircle />
                  </Button>
                </Popover>
              ) : (
                <span>Cannot assign role</span>
              )}
            </Tooltip>
          </Col>

          {/* Search Field */}
          <Col
            span={matches ? 6 : 8}
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: "0px",
            }}
          >
            {!!selectedRole && !!selectedUnit && (
              <Input
                size="small"
                style={{ marginRight: "20px", flex: 1 }}
                allowClear
                placeholder="Search User"
                value={searchUser}
                onChange={handleSearchUserChange}
                suffix={
                  <Button
                    type="text"
                    icon={<MdSearch />}
                    onClick={() => handleSearchUserChange}
                  />
                }
              />
            )}
          </Col>
        </Row>
      </Form>

      {/* </div> */}
      <div className={classes.tableContainer} style={{ marginTop: "10px" }}>
        <Table dataSource={tableData} columns={columns} />
      </div>
      <div>
        <Modal
          title={
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "2px",
              }}
            >
              <MdError />{" "}
              <span style={{ padding: "5px" }}>
                This will remove{" "}
                {roleLookup[deleteConfirmModal?.data?.roles?.[0]]} Role of{" "}
                {deleteConfirmModal?.data?.firstName +
                  " " +
                  deleteConfirmModal?.data?.lastName}{" "}
                at {selectedUnit?.label} Unit
              </span>
            </div>
          }
          // icon={<MdError />}
          open={deleteConfirmModal.open}
          onOk={() => handleDeleteRole()}
          onCancel={() => toggleDeleteConfirmModal()}
          // okText="Yes"
          okType="danger"
          // cancelText="No"
        />
      </div>
    </div>
  );
};

export default NewRolesTable;

/**
 * 
 * 
 *   const getAlllRoles = async () => {
    const res = await axios.get(`/api/roles/getAllRoleNames`);
    const staticRoles = [
      {
        label: "Reviewer",
        value: "Reviewer",
      },
      {
        label: "Approver",
        value: "Approver",
      },
    ];
    setRoles([
      ...res.data?.map((item: any) => ({
        label: item.roleName,
        value: item.id,
      })),
      ...staticRoles,
    ]);
  };
 */
