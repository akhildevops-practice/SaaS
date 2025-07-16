import {
  Button,
  FormControl,
  Grid,
  makeStyles,
  TextField,
} from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import {
  Input,
  Modal,
  Table,
  TableProps,
  Tag,
  Typography,
} from "antd";
import { MdSearch } from 'react-icons/md';
import Paragraph from "antd/es/typography/Paragraph";
import axios from "apis/axios.global";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import getAppUrl from "utils/getAppUrl";
import { MdChevronLeft } from 'react-icons/md';
import { useNavigate } from "react-router-dom";
import { AiOutlineUserAdd } from "react-icons/ai";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import { Button as AntdButton } from "antd";
const useStyles = makeStyles((theme) => ({
  fabButton: {
    backgroundColor: theme.palette.primary.light,
    color: "#fff",
    margin: "0 5px",
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
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
  searchContainer: {
    maxWidth: "100vw",
    height: "68px",
    // marginBottom: "25px",
  },
  documentTable: {
    // overflowX: "auto",
    // "&::-webkit-scrollbar": {
    //   width: "5px",
    //   height: "10px", // Adjust the height value as needed
    //   backgroundColor: "white",
    // },
    "&::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "grey",
    },
  },

  docNavInnerFlexBox: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: "6px 4px",
    "& .ant-input": {
      background: "#E8F3F9 !important",
    },
  },
  divderRightSide: {
    top: "0.1em",
    height: "1.5em",
    background: "gainsboro",
  },
  docNavIconStyle: {
    width: "21.88px",
    height: "21px",
    paddingRight: "6px",
    cursor: "pointer",
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
      height: "35px", // Set the height of the table cells
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
  iconGroup: {
    // marginLeft: "auto",
    display: "flex",
    justifyContent: "center",
    width: "fit-content",
    height: "fit-content",
    // alignItems: "center",
  },
  datePickersContainer: {
    display: "flex",
    justifyContent: "space-between",
    padding: "5px",
  },
  boardContainer: {
    padding: theme.spacing(2), // Add padding around the Kanban board
    display: "flex",
    overflowX: "auto",
    backgroundColor: "#ffffff",
  },
  // #ffffff
  // #F9F6F7
  column: {
    padding: theme.spacing(1),
    minWidth: "20px",
    backgroundColor: "#f2f2f2",
    borderRadius: "4px",
    marginRight: theme.spacing(1),
  },
  columnName: {
    // marginBottom: theme.spacing(1),
    fontSize: "16px",
    // textAlign: "center",
    fontFamily: "'Poppins', sans-serif",
    fontWeight: "bold",
    padding: "0px",
    margin: "0px",
  },

  taskContainer: {
    padding: theme.spacing(2),
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)",
    marginBottom: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    alignItems: "center",
    // marginBottom: theme.spacing(1),
  },
  title: {
    marginRight: theme.spacing(1),
    // fontWeight: "bold",
    fontSize: "15px",
    paddingLeft: "4px",
    display: "inline-block",
    // textAlign: "center",
    fontFamily: "'Poppins', sans-serif",
    flexGrow: 0,
  },
  description: {
    marginBottom: theme.spacing(1),
  },
  info: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  avatar: {
    marginRight: theme.spacing(1),
  },
  tableContainerScrollable: {
    marginBottom: "20px", // Adjust the value as needed
    maxHeight: "calc(76vh - 20vh)", // Adjust the max-height value as needed
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
  locSearchBox: {
    width: "100%",
    [theme.breakpoints.down("sm")]: {
      marginTop: theme.typography.pxToRem(10),
    },
    "& .MuiOutlinedInput-root": {
      borderRadius: "4px",
    },
    padding: "4px",
  },

  locSearchBoxNew: {
    width: "100%",
    [theme.breakpoints.down("sm")]: {
      marginTop: theme.typography.pxToRem(10),
    },
    // "& .MuiOutlinedInput-root": {
    //   borderRadius: "16px",
    // },
  },
  addButton: {
    border: "none",
    // position: "absolute",
    // top: theme.spacing(1),
    // right: theme.spacing(1),
  },
  // Add this to override the styles
  inputRootOverride: {
    '& .MuiAutocomplete-inputRoot[class*="MuiOutlinedInput-root"][class*="MuiOutlinedInput-marginDense"]':
      {
        // padding: "3px 0px 1px 3px !important",
      },
  },
  textField: {
    fontSize: "14px",
    fontWeight: 600,
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#EEEEEE",
      borderRadius: "20px",
      color: "black",
      fontSize: "14px",
      fontWeight: 600,
      border: "1px solid black",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderRadius: "20px",
    },
    "& .MuiSvgIcon-root": {
      color: "black", // Change icon color
    },
  },
  textField2: {
    fontSize: "14px",
    fontWeight: 600,
    "& .MuiOutlinedInput-root": {
      backgroundColor: "white",
      borderRadius: "20px",
      color: "black",
      border: "1px solid  black",
      fontSize: "14px",
      fontWeight: 600,
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderRadius: "20px",
    },
    "& .MuiSvgIcon-root": {
      color: "black", // Change icon color
    },
  },
  tag: {
    display: "inline-block",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "100px", // Adjust the max-width as needed
  },
  tagContainer: {
    display: "flex",
    flexDirection: "row",
  },
  hiddenTags: {
    display: "none",
  },
  disabledRangePicker: {
    "& .ant-picker-input > input[disabled]": {
      color: "black", // Set text color to black
      fontSize: "12px",
    },
    "& .ant-picker-suffix": {
      color: "black !important", // Ensure icon color is black
    },
    "& .ant-picker-disabled": {
      // borderColor: "black", // Set border color to black
      // borderWidth: "1px",
      // borderStyle: "solid",
      border: "1px solid black",
    },
    "& .ant-picker-disabled .ant-picker-input input": {
      color: "black", // Ensure input text color is black when disabled
    },
    "& .ant-picker-disabled .ant-picker-suffix": {
      color: "black !important", // Ensure icon color is black when disabled
    },
  },
}));
function UserDelegation() {
  const classes = useStyles();
  const [location, setLocation] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState<any>({});
  const [user, setUser] = useState([]);
  const [tableData, setTableData] = useState<any>([]);
  const [selectedUser, setSelectedUser] = useState<any>({});
  const [selectedModalUser, setSelectedModalUser] = useState<any>({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [rolesData, setRolesData] = useState<any>([]);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<any>("");
  const realmName = getAppUrl();
  const userdetails: any = sessionStorage.getItem("userDetails");
  const userid: any = JSON.parse(userdetails).id;
  const userInfo = JSON.parse(userdetails);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  useEffect(() => {
    getLocationNames();
  }, []);

  // console.log("rolesData", rolesData);

  useEffect(() => {
    const rolesData = async () => {
      if (selectedModalUser?.id !== undefined) {
        const res = await axios.get(
          `api/user/getUserRoleById/${selectedModalUser?.id}`
        );
        setRolesData(res?.data || []);
      }
    };
    rolesData();
  }, [selectedModalUser]);

  useEffect(() => {
    setSelectedRowKeys([]);
  }, [selectedUser]);

  useEffect(() => {
    setSelectedUser({});
    setTableData([]);
    if (selectedLocation?.id !== undefined) {
      getUserData();
    }
  }, [selectedLocation]);

  const getLocationNames = async () => {
    try {
      const res = await axios.get(
        `api/location/getLocationsForOrg/${realmName}`
      );
      setLocation(res?.data || []);
    } catch (error) {}
  };
  const handleSearchChange = (e: any) => {
    console.log("e.target.value", e.target.value);
    if (
      e.target.value === "" ||
      e.target.value === null ||
      e.target.value === undefined
    ) {
      setSearchQuery("");
      loadTableData("");
    } else {
      setSearchQuery(e.target.value);
      loadTableData(e.target.value);
    }
  };

  const loadTableData = async (search: any) => {
    try {
      const result = await axios.get(
        `api/user/getUserByRoleInfoById/${selectedUser?.id}?search=${search}`
      );
      const tableDataWithKeys = result?.data?.map((item: any) => ({
        ...item,
        key: item.id,
      }));
      setTableData(tableDataWithKeys || []);
    } catch (err) {
      console.error("err", err);
    }
  };

  const getUserData = async () => {
    try {
      const res = await axios.get(
        `api/user/getAllUsersByLocation/${selectedLocation?.id}`
      );
      setUser(res?.data || []);
    } catch {}
  };

  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
  const columns = [
    {
      title: "Module",
      dataIndex: "type",
      // render: (text: string) => <a>{text}</a>,
    },
    {
      title: "title",
      dataIndex: "name",
    },
    {
      title: "Status",
      dataIndex: "status",
    },
    // {
    //   title: "Number",
    //   dataIndex: "number",
    //   // render: (text: string) => <a>{text}</a>,
    // },
    {
      title: "Ownership Type",
      dataIndex: "roles",
      render: (text: any, record: any, index: any) =>
        !!record?.roles &&
        !!record.roles?.length &&
        record.roles.map((item: any, index: any) => (
          // <div key={index}>
          <Tag
            closable={item?.isEdit}
            key={index}
            // onClose={(e) => toggleDeleteConfirmModal(e, record, item)}
          >
            {item}
          </Tag>
          // </div>
        )),
    },

    // {
    //   title: "CreatedBy",
    //   dataIndex: "creatorName",
    // },
    {
      title: "CreatedAt",
      dataIndex: "createdAt",
      render: (value: any, record: any) => formatDate(record?.createdAt),
    },
  ];

  const rowSelection: TableProps<any>["rowSelection"] = {
    onChange: (selectedRowKeys: React.Key[], selectedRows) => {
      setSelectedRowKeys(selectedRows);
    },
    getCheckboxProps: (record) => ({
      disabled: record.status === "DISABLED", // Example of conditionally disabling
      name: record.key, // Ensure key matches
    }),
  };

  const handleOwnerChange = async () => {
    try {
      const res = await axios.put(`api/user/updateRoleforOtherUser`, {
        userId: selectedModalUser,
        data: selectedRowKeys,
        id: selectedUser,
      });
      if (res.status === 200 || res.status === 201) {
        enqueueSnackbar(`sucessfully updated`, { variant: "success" });
        setSelectedModalUser({});
        loadTableData("");
        setOpen(false);
      } else {
        enqueueSnackbar(`Something Went Wrong`, { variant: "error" });
      }
    } catch {}
  };
  return (
    <>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <Button
          data-testid="single-form-wrapper-button"
          onClick={() => {
            navigate("/master", {
              state: {
                redirectToTab: "USERS",
                retain: false,
              },
            });
          }}
        >
          <MdChevronLeft fontSize="small" />
          Back
        </Button>
        <h1>User Delegation</h1>
      </div>
      <Grid container alignItems="center">
        <Grid item xs={6} md={3}>
          <div className={classes.locSearchBox}>
            <FormControl variant="outlined" size="small" fullWidth>
              <div style={{ paddingTop: "4px" }}>
                <Autocomplete
                  // multiple
                  id="location-autocomplete"
                  className={classes.inputRootOverride}
                  options={location}
                  getOptionLabel={(option: any) => option.locationName || ""}
                  getOptionSelected={(option: any, value) =>
                    option.id === value?.id
                  }
                  value={selectedLocation}
                  onChange={(e: any, value: any) => {
                    console.log("value", value);
                    // setSelectTableAuditType(value);
                    // setSelected(!!value);
                    setSelectedLocation(value);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      size="small"
                      // label="Audit type"
                      placeholder="Location"
                      fullWidth
                      // className={
                      //   selected ? classes.textField : classes.textField2
                      // }
                    />
                  )}
                />
              </div>
            </FormControl>
          </div>
        </Grid>
        <Grid item xs={6} md={3}>
          <div className={classes.locSearchBox}>
            <FormControl variant="outlined" size="small" fullWidth>
              <div style={{ paddingTop: "4px" }}>
                <Autocomplete
                  // multiple
                  id="location-autocomplete"
                  className={classes.inputRootOverride}
                  options={user || []}
                  getOptionLabel={(option: any) => option.email || ""}
                  getOptionSelected={(option: any, value: any) =>
                    option?.id === value?.id
                  }
                  value={selectedUser}
                  onChange={(e: any, value: any) => {
                    setSelectedUser(value);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      size="small"
                      // label="Corp Func/Unit"
                      placeholder="Select User"
                      fullWidth
                      // className={
                      //   selectedUnit ? classes.textField : classes.textField2
                      // }
                    />
                  )}
                />
              </div>
            </FormControl>
          </div>
        </Grid>
        <Grid item xs={6} md={3}>
          <div className={classes.locSearchBox}>
            <FormControl variant="outlined" size="small" fullWidth>
              <div style={{ paddingTop: "4px" }}>
                <Button
                  variant="contained"
                  style={{ backgroundColor: "#003059", color: "white" }}
                  disabled={selectedUser?.id !== undefined ? false : true}
                  onClick={() => {
                    loadTableData("");
                  }}
                >
                  Fetch OwnerShip
                </Button>
              </div>
            </FormControl>
          </div>
        </Grid>
      </Grid>
      <div style={{ marginTop: "40px" }}>
        <Grid
          container
          alignItems="center"
          justifyContent="space-between"
          style={{ marginBottom: "16px" }}
        >
          {/* Left Section */}
          <Grid item>
            <p>
              {selectedRowKeys?.length > 0
                ? `Selected ${selectedRowKeys.length} items`
                : null}
            </p>
          </Grid>

          {/* Right Section */}
          <Grid item>
            <Grid
              container
              alignItems="center"
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <Grid item>
                {/* <TextField
                  placeholder="Search"
                  name="searchQuery"
                  size="small"
                  variant="outlined"
                  style={{ marginRight: "10px" }}
                  // Add additional props as per your `SearchBar` implementation
                /> */}
                <Input
                  size="small"
                  style={{ marginRight: "20px" }}
                  allowClear
                  placeholder="Search Record"
                  onChange={
                    handleSearchChange
                    // Check if the input has been cleared
                    // handleSearchChange
                  }
                  // prefix={<MdSearch />}
                  suffix={
                    <AntdButton
                      type="text"
                      // className={classes.searchIcon}
                      icon={<MdSearch />} // Use MdSearch as the suffix button
                      onClick={() => handleSearchChange}
                    />
                  }
                />
              </Grid>
              <Grid item>
                {selectedRowKeys?.length > 0 && (
                  <Button
                    variant="contained"
                    style={{
                      backgroundColor: "#003059",
                      color: "white",
                    }}
                    onClick={() => {
                      setOpen(true);
                    }}
                  >
                    Change Owner
                  </Button>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <div className={classes.tableContainer}>
          <Table
            rowSelection={{ type: "checkbox", ...rowSelection }}
            columns={columns}
            dataSource={tableData}
            className={classes.documentTable}
          />
        </div>
        <Modal
          title="Confirm Ownership Transfer!!"
          open={open}
          width="800px"
          // confirmLoading={()=>}
          onCancel={() => {
            setOpen(false);
          }}
          closeIcon={
            <img
              src={CloseIconImageSvg}
              alt="close-drawer"
              style={{ width: "36px", height: "38px", cursor: "pointer" }}
            />
          }
          footer={[
            <Button
              key="cancel"
              onClick={() => {
                setOpen(false);
              }}
              style={{
                background: "#1677ff",
                // border: "1px solid black",
                color: "white",
                marginRight: "10px",
              }}
            >
              Cancel
            </Button>,
            <Button
              key="ok"
              // type="primary"
              style={{
                background: "#1677ff",
                // border: "1px solid black",
                color: "white",
              }}
              onClick={() => handleOwnerChange()}
              disabled={selectedModalUser?.id !== undefined ? false : true} // Disable button if no user is selected
            >
              OK
            </Button>,
          ]}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <Typography.Text strong style={{ marginRight: "10px" }}>
              New Owner
            </Typography.Text>

            <Button
              onClick={() => {
                setSelectedModalUser(userInfo);
              }}
              style={{
                background: "#1677ff",
                // border: "1px solid black",
                color: "white",
                marginRight: "10px",
              }}
            >
              <AiOutlineUserAdd /> Assign to Me
            </Button>

            <Autocomplete
              id="location-autocomplete"
              className={classes.inputRootOverride}
              style={{ width: 400, marginRight: "20px" }} // Set your desired width
              options={
                user.filter((item: any) => item.id !== selectedUser?.id) || []
              }
              getOptionLabel={(option: any) => option.email || ""}
              getOptionSelected={(option: any, value: any) =>
                option?.id === value?.id
              }
              value={selectedModalUser}
              onChange={(e: any, value: any) => {
                setSelectedModalUser(value);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  size="small"
                  placeholder="Select Other User"
                  fullWidth
                />
              )}
            />
          </div>

          {selectedModalUser?.id !== undefined && (
            <Paragraph style={{ marginTop: "10px" }}>
              Confirm Ownership Transfer of{" "}
              <strong>{selectedRowKeys?.length}</strong> records from{" "}
              <strong>{selectedUser?.email}</strong> to{" "}
              <strong>{selectedModalUser?.email}</strong>?
            </Paragraph>
          )}
        </Modal>
      </div>
    </>
  );
}

export default UserDelegation;
