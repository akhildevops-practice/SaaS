import React, { useEffect, useState } from "react";
import axios from "../../apis/axios.global";
//mui
import { Tooltip, Paper } from "@material-ui/core";
import { Input, Table, Select, Popconfirm, Pagination, Button } from "antd";
import { TextField } from "@material-ui/core";
import { MdCheckBox } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { MdPeopleOutline } from "react-icons/md";
import useStyles from "./MRMKeyAgenda.style";
import { AiOutlineFilter, AiFillFilter } from "react-icons/ai";
import { Autocomplete } from "@material-ui/lab";
import getAppUrl from "../../utils/getAppUrl";
import { useRecoilValue } from "recoil";
import { debounce } from "lodash";
import { useSnackbar } from "notistack";
import { ColumnsType } from "antd/es/table";
import { MdSearch } from "react-icons/md";
import checkRoles from "../../utils/checkRoles";
import getYearFormat from "utils/getYearFormat";
import { ReactComponent as CustomDeleteICon } from "../../assets/documentControl/Delete.svg";
import { ReactComponent as CustomEditIcon } from "assets/documentControl/Edit.svg";
import { MdAddCircleOutline } from "react-icons/md";
import { MdCheckCircleOutline } from "react-icons/md";
import { MdPeople } from "react-icons/md";
import { orgFormData } from "../../recoil/atom";

import MrmAgendaCreate from "./Drawer/MrmAgendaCreate";

import type { PaginationProps } from "antd";
import { isValid } from "utils/validateInput";
import AddParticipantsModal from "./Components/AddParticipantsModal";

const { TextArea } = Input;
const { Option } = Select;

let typeAheadValue: string;
let typeAheadType: string;

export interface IKeyAgenda {
  _id: string;
  name: string;
  description: string;
  owner: any;
  applicableSystem: any;
}

const allOption = { id: "All", locationName: "All" };

type Props = {
  setAddKeyAgenda?: any;
  addKeyAgenda?: boolean;
  refForMRMSettings2?: any;
  refForMRMSettings3?: any;
  refForMRMSettings4?: any;
  refForMRMSettings5?: any;
  refForMRMSettings6?: any;
};

const MRMKeyAgenda = ({
  setAddKeyAgenda,
  addKeyAgenda,
  refForMRMSettings2,
  refForMRMSettings3,
  refForMRMSettings4,
  refForMRMSettings5,
  refForMRMSettings6,
}: Props) => {
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [systemData, setSystemData] = useState<any[]>([]);
  const [suggestions, setSuggestions] = React.useState([]);

  const [currentYear, setCurrentYear] = useState<any>();
  const [showModal, setShowModal] = useState(false);
  const [meetingType, setMeetingType] = useState<any>(null);
  const [agenda, setAgenda] = useState<any[]>([]);
  const [locationOptions, setLocationOptions] = useState<any>([]);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [isFilterOwner, setfilterOwner] = useState<boolean>(false);
  const [rowIndex, setRowIndex] = useState<any>();

  interface DrawerState {
    right: boolean;
  }
  const [state, setState] = React.useState<DrawerState>({
    right: false,
  });
  const [userOptions, setUserOptions] = useState([]);
  const realmName = getAppUrl();
  const userDetail = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isMR = checkRoles("MR");
  // const isGeneralUser = checkRoles("GENERAL-USER");
  // // console.log("ismr", isMR);
  // const showData = isOrgAdmin || isMR;
  // console.log("showdata", showData);
  const [searchValue, setSearchValue] = useState<string>("");
  const orgData = useRecoilValue(orgFormData);
  const [filterList, setFilterList] = useState<any>([]);
  const organizationId =
    sessionStorage.getItem("orgId") !== null &&
    sessionStorage.getItem("orgId") !== "null"
      ? sessionStorage.getItem("orgId")
      : (orgData && orgData.organizationId) ||
        (orgData && orgData.id) ||
        undefined;

  // const showHyperLink = !isOrgAdmin && !isMR;
  const { enqueueSnackbar } = useSnackbar();
  const orgId = sessionStorage.getItem("orgId");

  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedData, setSelectedData] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<any>("");
  const [buttonStatus, setButtonStatus] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [pageType, setPageType] = useState<any>(1);
  const [rowsPerPageType, setRowsPerPageType] = useState(10);
  const [countType, setCountType] = useState<number>(0);
  const [selectedLocation, setSelectedLocation] = useState<any[]>([
    userDetail?.location?.id,
  ]);
  const [locationsAdded, setLocationsAdded] = useState<any[]>([]);
  const [selectedFilterLocation, setSelectedFilterLocation] = useState<any[]>(
    []
  );
  const [selectedLocationState, setSelectedLocationState] = useState<any[]>([
    userDetail?.location?.id,
  ]);

  const showTotalType: PaginationProps["showTotal"] = (total) =>
    `Total ${total} items`;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const handlePaginationType = async (page: any, pageSize: any) => {
    const userInfo = await axios.get("/api/user/getUserInfo");
    setPageType(page);
    setRowsPerPageType(pageSize);
    // getKeyAgendaValues(selectedLocation, currentYear);
  };
  useEffect(() => {
    const data = ["All"];
    getyear();
    setSelectedLocation([userDetail?.location]);
    getLocationOptions();
    // GetSystems(data);
    getUserInfo();
    getUserOptions();
    fetchFilterList();
  }, []);
  useEffect(() => {
    getUserOptions();
    GetSystems(locationsAdded);
  }, [locationsAdded, addKeyAgenda, buttonStatus]);
  useEffect(() => {
    const data = ["All"];

    if (currentYear) {
      getLocationOptions();

      getUserInfo();
      getKeyAgendaValues(
        selectedLocation.length ? selectedLocation : ["All"],
        currentYear
      );
    }
  }, [meetingType]);
  // console.log("locatopn", locationOptions);
  useEffect(() => {
    if ((isOrgAdmin || isMR) && addKeyAgenda) {
      const newData = {
        organizationId: orgId,
        creator: userDetail?.id,
        name: "",
        description: "",
        owner: [],
        applicableSystem: [],
        applicableLocation: [],
        location: [],
        // applicableLocation: selectedLocation.includes("All")
        //   ? []
        //   : [...selectedLocation],
        // location: selectedLocation.includes("All") ? [] : [...selectedLocation],
        Status: false,
      };
      // console.log("newData", newData);
      setDataSource([newData, ...dataSource]);
      setAddKeyAgenda(false);
    }
  }, [addKeyAgenda]);

  useEffect(() => {
    setReRender(true);
    if (selectedLocation != undefined && !!currentYear)
      getKeyAgendaValues(selectedLocation, currentYear);
  }, [pageType, rowsPerPageType, isFilterOwner]);
  useEffect(() => {
    setReRender(true);
    if (!!selectedLocation && !!currentYear) {
      getKeyAgendaValues(
        selectedLocation.length ? selectedLocation : ["All"],
        currentYear
      );
    }
  }, [selectedLocation]);
  // const OBJECTIVE_NAME_REGEX =
  //   /^[\u0000-\u007F\u0080-\uFFFFa-zA-Z0-9$&*()\-/\.,\?&%!#@€£$`'"\~]+$/; // Allows letters, numbers, and specific symbols, but does not include < and >
  // const isValid = (
  //   value: string | undefined | null,
  //   regex: RegExp
  // ): boolean => {
  //   if (!value || typeof value !== "string" || value.trim().length === 0) {
  //     return false; // Empty or invalid input
  //   }

  //   const sanitizedValue = value.trim();

  //   // Define regex pattern for allowed characters
  //   const TITLE_REGEX =
  //     /^[\u0000-\u007F\u0080-\uFFFFa-zA-Z0-9$&*()\-/\.,\?&%!#@€£`'"\~]+$/;

  //   // Check for disallowed characters
  //   const DISALLOWED_CHARS = /[<>]/;

  //   // Check for more than two consecutive special characters
  //   const MORE_THAN_TWO_CONSECUTIVE_SPECIAL_CHARS =
  //     /[\/\-\.\$\€\£\?\&\*\(\)\%\#\!\@\`\'\"\~]{3,}/;

  //   // Check if the title starts with a special character
  //   const STARTS_WITH_SPECIAL_CHAR =
  //     /^[\/\-\.\$\€\£\?\&\*\(\)\%\#\!\@\`\'\"\~]/;

  //   if (DISALLOWED_CHARS.test(sanitizedValue)) {
  //     return false; // Invalid characters found
  //   }

  //   if (MORE_THAN_TWO_CONSECUTIVE_SPECIAL_CHARS.test(sanitizedValue)) {
  //     return false; // Too many consecutive special characters
  //   }

  //   if (STARTS_WITH_SPECIAL_CHAR.test(sanitizedValue)) {
  //     return false; // Starts with a special character
  //   }

  //   return TITLE_REGEX.test(sanitizedValue); // Check against allowed characters
  // };
  // console.log("addkeyagenda", addKeyAgenda, buttonStatus);
  const getUserOptions = async () => {
    try {
      if (
        (addKeyAgenda === false || isEdit === true) &&
        locationsAdded.length > 0
      ) {
        let res;
        // console.log("addkeyagenda", addKeyAgenda, buttonStatus);
        // console.log("addkeyagenda", addKeyAgenda, buttonStatus);
        const ids: string[] =
          locationsAdded.length > 0
            ? locationsAdded.map((location) => location?.id)
            : userDetail?.location?.id;
        // console.log("ids", ids);
        res = await axios.get(
          `/api/mrm/getUsersForLocations?orgId=${userDetail.organizationId}&location=${ids}`
        );

        // console.log("Response from users", res);

        const users = res.data;

        if (users && users.length > 0) {
          const ops = users.map((obj: any) => ({
            id: obj.id,
            name: obj.username,
            avatar: obj.avatar,
            email: obj.email,
            username: obj.username,
            value: obj.id,
            label: obj.email,
            fullname: `${obj.firstname} ${obj.lastname}`,
          }));
          setUserOptions(ops);
        } else {
          setUserOptions([]);
        }
      } else {
        const res = await axios.get(
          `/api/riskregister/users/${userDetail?.organizationId}`
        );
        const users = res.data;

        if (users && users.length > 0) {
          const ops = users.map((obj: any) => ({
            id: obj.id,
            name: obj.username,
            avatar: obj.avatar,
            email: obj.email,
            username: obj.username,
            value: obj.id,
            label: obj.email,
            fullname: `${obj.firstname} ${obj.lastname}`,
          }));
          setUserOptions(ops);
        } else {
          setUserOptions([]);
        }
      }
    } catch (err) {
      console.error("Error fetching user options:", err);
      // Optionally handle the error (e.g., set an error state, show a message, etc.)
    }
  };

  const fetchFilterList = async () => {
    try {
      // console.log("fetchfilterlist called");
      const response = await axios.get(`api/keyAgenda/getColumnFilterlist`);

      setFilterList(response?.data || []);
    } catch (error) {
      // console.log("error", error);
    }
  };
  const handlerEdit = (data: any) => {
    if (
      isOrgAdmin ||
      isMR
      // (isMR &&
      //   data.location.includes(userDetail.location.id) &&
      //   data.location &&
      //   Array.isArray(data.location))
    ) {
      setButtonStatus(true);
      setSelectedId(data?._id);
      const dataUpdate = dataSource?.map((item: any) => ({
        ...item,
        Status: item._id !== data?._id,
      }));
      setDataSource(dataUpdate);
    } else {
      enqueueSnackbar(`Edit Option Is not Available!`, {
        variant: "error",
      });
    }
  };
  //console.log("selectedlocation", selectedLocation);
  const handlerOpenMrmPopup = (record: any) => {
    if (
      !(
        (isOrgAdmin || isMR)
        // (isMR &&
        //   selectedLocation &&
        //   Array.isArray(selectedLocation) &&
        //   selectedLocation.some(
        //     (location) => location.id === userDetail?.location?.id
        //   ))
      )
    ) {
      enqueueSnackbar(`You are not authorized to add agenda!`, {
        variant: "error",
      });
      setOpenDrawer(false);
    }

    setSelectedData(record);
    setOpenDrawer(true);
  };
  const handlerCloseMrmPopup = () => {
    setOpenDrawer(false);
    getKeyAgendaValues(
      selectedLocation.length ? selectedLocation : ["All"],
      currentYear
    );
  };

  const navigate = useNavigate();
  const classes = useStyles();

  const [reRender, setReRender] = useState(false);

  const getyear = async () => {
    const currentyear = await getYearFormat(new Date().getFullYear());
    setCurrentYear(currentyear);
  };

  const getUserInfo = async () => {
    const userInfo = await axios.get("/api/user/getUserInfo");
    const data = ["All"];
    if (userInfo.status === 200) {
      if (
        userInfo?.data &&
        userInfo?.data?.locationId &&
        userInfo.data.locationId
      ) {
        setSelectedLocation([userInfo.data.location]);
        setSelectedLocationState([userInfo.data.location]);
        getKeyAgendaValues([userInfo.data.location], currentYear);
      } else {
        getKeyAgendaValues(data, currentYear);
        setSelectedLocation([allOption]);
        setSelectedLocationState([allOption]);
      }
    }
  };

  const columns: ColumnsType<IKeyAgenda> = [
    {
      title: "Meeting Type",
      dataIndex: "name",
      // width: '24%',
      width: 220,
      // fixed: 'left',
      render: (_: any, data: any, index: number) => (
        <Input
          placeholder="Meeting Type"
          value={data?.name}
          onChange={(event) =>
            handleChangeKeyagenda(event.target.value, data, index)
          }
          disabled={data?.Status}
          style={{
            color: data?.Status ? "black " : "",
            // backgroundColor: "white",
          }}
          className={classes.disabledInput}
        />
      ),
    },

    {
      title: "Applicable Unit",
      dataIndex: "applicableUnit",
      width: 200,
      render: (_: any, data: any, index: number) => {
        let dataLocations;
        if (isOrgAdmin) {
          // Include all options along with locationOptions
          dataLocations = [allOption, ...locationOptions];
        } else if (isMR) {
          // Filter locationOptions based on userDetail.additionalUnit
          dataLocations = locationOptions.filter((location: any) =>
            userDetail.additionalUnits?.includes(location.id)
          );
        } else {
          // Default case if neither condition is true
          dataLocations = locationOptions;
        }

        return (
          <Autocomplete
            multiple
            id="location-autocomplete-unit"
            // placeholder="Select Location"
            options={dataLocations}
            disabled={data?.Status}
            getOptionLabel={(option) => option?.locationName || ""}
            getOptionSelected={(option, value) => option?.id === value?.id}
            size="small"
            value={data?.applicableLocation}
            className={classes.disabledInput}
            onChange={(e, value) => {
              handleLocationState(value, data, index);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                size="small"
                fullWidth
                disabled={data?.Status}
                InputLabelProps={{ shrink: false }}
                InputProps={{
                  ...params.InputProps,
                  className: data?.Status ? classes.muiAutoComplete : undefined,
                }}
              />
            )}
          />
        );
      },
      filterIcon: (filtered: any) =>
        selectedFilterLocation?.length > 0 ? (
          <AiFillFilter style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <AiOutlineFilter style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }: any) => (
        <div style={{ padding: 8 }}>
          {filterList?.map((item: any) => (
            <div key={item.id}>
              <label style={{ display: "flex", alignItems: "center" }}>
                <input
                  type="checkbox"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (e.target.checked) {
                      setSelectedFilterLocation([
                        ...selectedFilterLocation,
                        value,
                      ]);
                    } else {
                      setSelectedFilterLocation(
                        selectedFilterLocation.filter(
                          (key: any) => key !== value
                        )
                      );
                    }
                  }}
                  value={item.id}
                  checked={selectedFilterLocation.includes(item.id)} // Check if the checkbox should be checked
                  style={{ width: "16px", height: "16px", marginRight: "5px" }}
                />
                {item.locationName}
              </label>
            </div>
          ))}
          <div style={{ marginTop: 8 }}>
            <Button
              type="primary"
              disabled={selectedFilterLocation.length === 0}
              onClick={() => {
                setfilterOwner(!isFilterOwner);
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
                setSelectedFilterLocation([]);
                setfilterOwner(!isFilterOwner);
                confirm();
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      ),
    },

    {
      title: "Description",
      dataIndex: "description",
      width: 240,
      render: (_: any, data: any, index: number) => (
        <TextArea
          autoSize
          placeholder="Add Description"
          onChange={(e) => handleDescription(e.target.value, data, index)}
          // onBlur={() => handleUpdateKeyAgendaChanges(data)}
          value={data?.description}
          disabled={data?.Status}
          style={{
            color: data?.Status ? "black " : "",
            // backgroundColor: "white",
          }}
          className={classes.disabledInput}
        />
      ),
    },
    {
      title: "Owners",
      dataIndex: "owner",
      width: 300,
      render: (_: any, data: any, index: number) => (
        <Select
          showSearch
          placeholder="Select Owner(s)"
          style={{
            width: "100%",
            fontSize: "12px", // Reduce font size for selected items
          }}
          mode="multiple"
          options={userOptions || []}
          value={data?.owner?.map((user: any) => user.value) || []}
          onChange={(selectedAttendees) => {
            const selectedUsers = selectedAttendees
              .map((userId: any) =>
                userOptions.find((user: any) => user.value === userId)
              )
              .filter(Boolean);

            handleChangeOwners(selectedUsers, data, index);
          }}
          filterOption={(input: any, option: any) =>
            option?.label?.toLowerCase().indexOf(input?.toLowerCase()) >= 0
          }
          size="large"
          disabled={data?.Status}
          dropdownStyle={{ maxHeight: 200 }}
          defaultValue={data?.owner?.map((user: any) => user.value) || []}

          // defaultValue={data?.owner || []}
        >
          {userOptions?.map((option: any) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "System",
      dataIndex: "applicableSystem",
      width: 200,
      // fixed: 'right',
      render: (_: any, data: any, index: number) => (
        <Select
          mode="multiple"
          allowClear
          style={{
            width: "100%",
            ...(data?.Status && { color: "black" }),
          }}
          className={classes.disabledMultiSelect}
          placeholder="Please select"
          onChange={(event) => handleChangeSystem(event, data, index)}
          // onBlur={() => handleAdd(data)}
          value={data?.applicableSystem || []}
          disabled={data?.Status}
        >
          {systemData?.length &&
            systemData?.map((data) => {
              return (
                <Option
                  value={data?.id}
                  label={data?.name}
                  key={data?.id}
                  style={{
                    color: data?.Status ? "black " : "",
                    backgroundColor: "white",
                  }}
                >
                  {data?.name}
                </Option>
              );
            })}
        </Select>
      ),
    },
    {
      title: "Action",
      dataIndex: "keyagenda",
      width: 150,
      // fixed: "right",
      render: (_: any, record: any, index: number) => {
        // console.log("record", record);
        if (
          !(
            isOrgAdmin ||
            (isMR &&
              record.applicableLocation.length > 0 &&
              // Check if applicableLocation contains an additional unit
              (record.applicableLocation.some((location: any) =>
                userDetail?.additionalUnits?.includes(location.id)
              ) ||
                // If additionalUnits is empty or user is MR, check if location matches the user's location.id
                (userDetail?.additionalUnits?.length === 0 &&
                  record.applicableLocation.some(
                    (location: any) => location.id === userDetail?.location?.id
                  ))))
          )
        ) {
          return null;
        }
        setRowIndex(index);
        return (
          <div style={{ display: "flex", gap: "5px" }}>
            {record?._id === undefined ? (
              <>
                <Tooltip title="Add Meeting Type" placement="bottom">
                  <div>
                    <MdCheckCircleOutline
                      onClick={() => {
                        handleAddKeyAgenda(record);
                      }}
                      style={{ height: "22px", color: "#1677ff" }}
                    />
                  </div>
                </Tooltip>
              </>
            ) : (
              <></>
            )}
            {record?._id !== undefined &&
            (isOrgAdmin ||
              (isMR &&
                record.applicableLocation.length > 0 &&
                // Check if applicableLocation contains an additional unit
                (record.applicableLocation.some((location: any) =>
                  userDetail?.additionalUnits?.includes(location.id)
                ) ||
                  // If additionalUnits is empty or user is MR, check if location matches the user's location.id
                  (userDetail?.additionalUnits?.length === 0 &&
                    record.applicableLocation.some(
                      (location: any) =>
                        location.id === userDetail?.location?.id
                    ))))) ? (
              <>
                {buttonStatus && record?._id === selectedId ? (
                  <>
                    {" "}
                    <MdCheckBox
                      onClick={() => {
                        handleUpdateKeyAgendaChanges(record);
                      }}
                      style={{ fontSize: "18px", color: "blue" }}
                    />{" "}
                  </>
                ) : (
                  <div ref={refForMRMSettings4}>
                    {" "}
                    <CustomEditIcon
                      onClick={() => {
                        setIsEdit(true);
                        setLocationsAdded(record?.applicableLocation);
                        handlerEdit(record);
                      }}
                      style={{ height: "18px" }}
                    />
                  </div>
                )}
                <Tooltip title="Add Agenda" placement="bottom">
                  <div ref={refForMRMSettings6}>
                    <MdAddCircleOutline
                      onClick={() => {
                        handlerOpenMrmPopup(record);
                      }}
                      style={{
                        color: record.agendas?.length > 0 ? "#1677ff" : "",
                        fontSize: "20px",
                        cursor: "pointer",
                      }}
                    />
                  </div>
                </Tooltip>
                <Popconfirm
                  placement="top"
                  title={"Are you sure to delete Meeting Type"}
                  onConfirm={() => isOrgAdmin && handleDelete(record, index)}
                  okText="Yes"
                  cancelText="No"
                  disabled={!isOrgAdmin}
                >
                  <div ref={refForMRMSettings5}>
                    {isOrgAdmin && <CustomDeleteICon width={18} height={18} />}
                  </div>
                </Popconfirm>

                <Tooltip title="Add Intended Participants">
                  <div>
                    {record?.participants?.length > 0 ? (
                      <MdPeople
                        style={{
                          color: "#1677ff",
                          fontSize: "25px",
                          cursor: "pointer",
                          paddingLeft: "5px",
                        }}
                        onClick={() => {
                          setSelectedRow(record); // Set the selected row
                          // setParticipants(record?.participants || []); // Set existing participants if available
                          setIsModalVisible(true); // Open the modal
                        }}
                      />
                    ) : (
                      <MdPeopleOutline
                        style={{
                          // color:
                          //   record?.participants?.length > 0 ? "#1677ff" : "",
                          fontSize: "25px",
                          cursor: "pointer",
                          paddingLeft: "5px",
                        }}
                        onClick={() => {
                          setSelectedRow(record); // Set the selected row
                          // setParticipants(record?.participants || []); // Set existing participants if available
                          setIsModalVisible(true); // Open the modal
                        }}
                      />
                    )}
                  </div>
                </Tooltip>
              </>
            ) : (
              <></>
            )}
          </div>
        );
      },
    },
  ];

  // const toggleDrawer =
  //   (anchor: any, open: any, record: any, index: any) => (event: any) => {
  //     if (
  //       event.type === "keydown" &&
  //       (event.key === "Tab" || event.key === "Shift")
  //     ) {
  //       return;
  //     }
  //     setMeetingType(record._id);
  //     setState({ ...state, [anchor]: open });
  //   };

  const handleTextChange = (e: any) => {
    getSuggestionList(e.target.value, "normal");
  };

  const handleChangeOwners = (data: any, values: any, index: number) => {
    const newData = { ...values };
    newData.owner = [...data];
    const newDataSource = [...dataSource];
    newDataSource[index] = newData;
    setDataSource(newDataSource);
  };

  const handleLocationState = (data: any, values: any, index: any) => {
    // console.log("data", data);
    const newData = { ...values };

    // Check if "All" is in the data
    if (data.some((item: any) => item.id === "All")) {
      newData.location = ["All"]; // Keep only "All"
      newData.applicableLocation = [{ id: "All", locationName: "All" }]; // Optionally clear applicableLocation
    } else {
      newData.location = data.map((item: any) => item.id); // Set to the array of IDs
      newData.applicableLocation = [...data];
    }

    const newDataSource = [...dataSource];
    newDataSource[index] = newData;
    setDataSource(newDataSource);
    setLocationsAdded(data);
  };

  const handleChangeSystem = (data: any, values: any, index: number) => {
    const newData = { ...values };
    newData.applicableSystem = [...data];
    const newDataSource = [...dataSource];
    newDataSource[index] = newData;
    setDataSource(newDataSource);
    // if (newData.applicableSystem.length > 1) {
    //   handleUpdateKeyAgendaChanges(newData);
    // } else {
    //   if (
    //     newData?.name.length &&
    //     newData?.owner.length &&
    //     newData?.applicableSystem.length
    //   ) {
    //     handleAddKeyAgenda(newData);
    //   } else {
    //     if (newData?.owner.length && newData?.name.length) {
    //       enqueueSnackbar(`Please select atleast one system!`, {
    //         variant: "error",
    //       });
    //     }
    //   }
    // }
  };

  const handleDelete = async (record: any, id: number) => {
    try {
      if (record?._id) {
        const res = await axios.delete(`/api/keyagenda/${record?._id}`);
        if (res.status === 200 || res.status === 201) {
          enqueueSnackbar(`Data deleted successfully!`, {
            variant: "success",
          });
        }
      }
      const newSourceData = [...dataSource];

      if (id > -1) {
        // only splice array when item is found
        newSourceData.splice(id, 1); // 2nd parameter means remove one item only
        setDataSource(newSourceData);
      }
    } catch (error: any) {
      //enqueueSnackbar(error.message, { variant: "error" });
    }
  };

  const handleUpdateKeyAgendaChanges = async (data: any) => {
    // console.log("data in update", data);
    const isValidTitle = isValid(data?.name);
    if (!isValidTitle.isValid || data?.name === "") {
      enqueueSnackbar(`${isValidTitle.errorMessage}`, {
        variant: "error",
      });
    } else if (data?.owner.length === 0) {
      enqueueSnackbar(`Please add meeting type Owner!`, {
        variant: "error",
      });
    } else if (data?.applicableSystem.length === 0) {
      enqueueSnackbar(`Please add meeting type System!`, {
        variant: "error",
      });
    } else if (data?.location.length === 0) {
      enqueueSnackbar(`Please add atleast one unit!`, {
        variant: "error",
      });
    } else if (isMR && data.location && data.location.includes("All")) {
      enqueueSnackbar(
        "You are not allowed to create meeting type for All locations",
        {
          variant: "error",
        }
      );
      return;
    } else {
      if (selectedId) {
        const payload = {
          name: data?.name,
          description: data?.description,
          owner: data?.owner,
          applicableSystem: data?.applicableSystem,
          applicableLocation: data?.applicableLocation,
          location: data?.location,
        };
        if (
          payload.name &&
          payload.owner.length > 0 &&
          payload.applicableSystem.length > 0
        ) {
          const res = await axios.patch(
            `/api/keyagenda/${selectedId}`,
            payload
          );

          if (res.status === 200 || res.status === 201) {
            const updatedData = dataSource?.map((item: any) => {
              if (item._id === selectedId) {
                return {
                  ...item,
                  Status: true,
                };
              }
              return item;
            });
            setDataSource(updatedData);
            enqueueSnackbar(`Data Updated successfully!`, {
              variant: "success",
            });
          }
          setReRender(true);
          setButtonStatus(false);
          setLocationsAdded([]);
          setIsEdit(false);
        }
      } else {
        const payload = {
          name: data?.name,
          description: data?.description,
          owner: data?.owner,
          applicableSystem: data?.applicableSystem,
        };
        if (
          payload.name &&
          payload.owner.length > 0 &&
          payload.applicableSystem.length > 0
        ) {
          const res = await axios.patch(`/api/keyagenda/${data?._id}`, payload);
          if (res.status === 200 || res.status === 201) {
            const updatedData = dataSource?.map((item: any) => {
              if (item._id === data?._id) {
                return {
                  ...item,
                  Status: true,
                };
              }
              return item;
            });
            setDataSource(updatedData);
            enqueueSnackbar(`Data Updated successfully!`, {
              variant: "success",
            });
          }
          setReRender(true);
          setButtonStatus(false);
          setLocationsAdded([]);
          setIsEdit(false);
        }
      }
    }
  };

  const getKeyAgendaValues = async (data: any, currentYear: any) => {
    try {
      //get api
      let res: any;
      if (selectedLocation.length > 0) {
        if (data.includes("All") || data.length === 0) {
          const payload = {
            orgId: orgId,
            currentYear: currentYear,
            page: pageType,
            limit: rowsPerPageType,
            filteredLocations: selectedFilterLocation,
          };

          res = await axios.get("/api/keyagenda/getkeyAgendaByOrgId", {
            params: payload,
          });
          setReRender(false);
        } else {
          const locationValues = [...data].map((option: any) => option.id);
          const payloadData = {
            orgId: orgId,
            locationId: locationValues,
            currentYear: currentYear,
            page: pageType,
            limit: rowsPerPageType,
            filteredLocations: selectedFilterLocation,
          };

          res = await axios.get(
            "/api/keyagenda/getkeyAgendaByUnitWithoutFilter",
            {
              params: payloadData,
            }
          );
          setReRender(false);
        }
      }
      if (res.status === 200 || res.status === 201) {
        const data = res.data.keyAgenda;
        const meetingTypeData: any = [];
        data.map((item: any) => {
          meetingTypeData.push({
            ...item,
            Status: true,
          });
        });
        setDataSource(meetingTypeData);
        setCountType(res?.data?.count);
      }
    } catch (error) {
      console.log(error);
      // enqueueSnackbar(`!`, {
      //   variant: "error",
      // });
    }
  };

  const handleChangeKeyagenda = (data: any, values: any, index: number) => {
    // Validate the title
    validateTitle(null, data, (error) => {
      if (error) {
        enqueueSnackbar(error, {
          variant: "error",
        });
        return; // Stop further execution if there is an error
      }

      // Proceed with updating the state if validation is successful
      const newData = { ...values, name: data };
      const newDataSource = [...dataSource];
      newDataSource[index] = newData;
      setDataSource(newDataSource);

      // Uncomment and adjust the following code as needed for additional logic
      // if (values._id) {
      //     handleUpdateKeyAgendaChanges(newData);
      // } else {
      //     if (
      //         newData?.name &&
      //         newData?.owner.length > 0 &&
      //         newData?.applicableSystem.length > 0
      //     ) {
      //         // handleAddKeyAgenda(newData);
      //     } else {
      //         if (newData?.owner.length && newData?.applicableSystem.length) {
      //             enqueueSnackbar(`Please add key agenda name!`, {
      //                 variant: "error",
      //             });
      //         }
      //     }
      // }
    });
  };

  const handleDescription = (data: any, values: any, index: number) => {
    validateTitle(null, data, (error) => {
      if (error) {
        enqueueSnackbar(error, {
          variant: "error",
        });
        return; // Stop further execution if there is an error
      }
      const newData = { ...values };
      newData.description = data;
      const newDataSource = [...dataSource];
      newDataSource[index] = newData;
      setDataSource(newDataSource);
      // if (values?._id) {
      //   handleUpdateKeyAgendaChanges(newData);
      // } else {
      //   if (
      //     newData?.name &&
      //     newData?.owner.length > 0 &&
      //     newData?.applicableSystem.length > 0
      //   ) {
      //     handleAddKeyAgenda(newData);
      //   }
      // }
    });
  };

  const getData = async (value: string, type: string) => {
    try {
      const res = await axios.get(
        `api/user/doctype/filterusers/${realmName}/${"allusers"}?email=${value}`
      );
      setSuggestions(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const debouncedSearch = debounce(() => {
    getData(typeAheadValue, typeAheadType);
  }, 400);

  const getSuggestionList = (value: any, type: string) => {
    typeAheadValue = value;
    typeAheadType = type;
    debouncedSearch();
  };

  const GetSystems = async (locationId: any) => {
    let encodedSystems: any;
    const ids: string[] =
      locationsAdded.length > 0
        ? locationsAdded.map((location) => location.id)
        : userDetail.location.id;
    // console.log("ids in", ids);
    if (ids?.includes("All")) {
      encodedSystems = encodeURIComponent(JSON.stringify(ids));
    } else if (ids?.length === 0) {
      encodedSystems = encodeURIComponent(JSON.stringify(locationId));
    } else {
      // const locationIdValues = [...locationId].map((option: any) => option.id);
      encodedSystems = encodeURIComponent(JSON.stringify(ids));
    }

    const { data } = await axios.get(
      `api/systems/displaySystemsForGivenLocation/${encodedSystems}`
    );
    // console.log("data", data);
    setSystemData([...data]);
  };

  const getLocationOptions = async () => {
    await axios(`/api/mrm/getLocationsForOrg/${realmName}`)
      .then((res) => {
        setLocationOptions(res.data);
      })
      .catch((err) => console.error(err));
  };

  const handleAdd = async (data?: any) => {
    if (data?._id) {
      handleUpdateKeyAgendaChanges(data);
    } else if (data) {
      if (
        data?.name.length &&
        data?.applicableSystem.length > 0 &&
        data?.owner.length > 0
      ) {
        handleAddKeyAgenda(data);
      }
      //add row
      const newData = {
        organizationId: orgId,
        creator: userDetail?.id,
        name: "",
        description: "",
        owner: [],
        applicableSystem: [],
        applicableLocation: selectedLocation.includes("All")
          ? []
          : [...selectedLocation],
        location: selectedLocation.includes("All") ? [] : [...selectedLocation],
        Status: false,
      };
      setDataSource([...dataSource, newData]);
    } else {
      const newData = {
        organizationId: orgId,
        creator: userDetail?.id,
        name: "",
        description: "",
        owner: [],
        applicableSystem: [],
        applicableLocation: [...selectedLocation],
        location: [...selectedLocation],
        Status: false,
      };
      setDataSource([...dataSource, newData]);
    }
  };
  const validateTitle = (
    rule: any,
    value: string,
    callback: (error?: string) => void
  ) => {
    const TITLE_REGEX =
      /^[\u0000-\u007F\u0080-\uFFFFa-zA-Z0-9$&*()\-/\.,\?&%!#@€£`'"\~]+$/;
    const DISALLOWED_CHARS = /[<>]/;
    const MORE_THAN_TWO_CONSECUTIVE_SPECIAL_CHARS =
      /[\/\-\.\$\€\£\?\&\*\(\)\%\#\!\@\`\'\"\~\,\s]{3,}/;
    const STARTS_WITH_SPECIAL_CHAR =
      /^[\/\-\.\$\€\£\?\&\*\(\)\%\#\!\@\`\'\"\~]/;

    // Trim the value to handle cases with leading/trailing spaces
    const trimmedValue = value.trim();

    if (trimmedValue.length === 0) {
      callback();
    } else if (DISALLOWED_CHARS.test(trimmedValue)) {
      callback("Invalid text. Disallowed characters are < and >.");
    } else if (MORE_THAN_TWO_CONSECUTIVE_SPECIAL_CHARS.test(trimmedValue)) {
      callback(
        "Invalid text. No more than two consecutive special characters are allowed."
      );
    } else if (STARTS_WITH_SPECIAL_CHAR.test(trimmedValue)) {
      callback("Invalid text. Text should not start with a special character.");
    } else if (!TITLE_REGEX.test(trimmedValue)) {
      callback(
        "Invalid text. Allowed characters include letters, numbers, commas, slashes, hyphens, dots, and currency symbols."
      );
    } else {
      callback();
    }
  };

  // const handleLocation = (event: any, values: any) => {
  //   let getAllLocationIds: any = [];
  //   if (values.find((option: any) => option.id === "All")) {
  //     setSelectedLocation([allOption]);
  //     getAllLocationIds = ["All"];
  //   } else {
  //     const allValues = values.filter((option: any) => option.id !== "All");
  //     setSelectedLocation([...allValues]);
  //     getAllLocationIds = [...allValues];
  //   }
  //   getKeyAgendaValues([...getAllLocationIds], currentYear);
  //   // GetSystems([...getAllLocationIds]);
  // };

  const handleAddKeyAgenda = async (payload: any) => {
    const isValidTitle = isValid(payload?.name);
    // console.log("isValidTitlte", isValidTitle);
    if (!isValidTitle.isValid || payload?.name === "") {
      enqueueSnackbar(`${isValidTitle.errorMessage}`, {
        variant: "error",
      });
    } else if (payload?.owner.length === 0) {
      enqueueSnackbar(`Please add key agenda Owner!`, {
        variant: "error",
      });
    } else if (payload?.applicableSystem.length === 0) {
      enqueueSnackbar(`Please add key agenda System!`, {
        variant: "error",
      });
    } else if (payload?.location.length === 0) {
      enqueueSnackbar(`Please add atleast one unit`, {
        variant: "error",
      });
    } else {
      try {
        const newPayload = { ...payload };
        if (Array.isArray(newPayload.location)) {
          if (newPayload.location.length > 0) {
            const firstElementType = typeof newPayload.location[0];

            if (firstElementType === "object" && firstElementType !== null) {
              // Extract IDs into an array of strings
              const idsArray = newPayload.location.map((item: any) =>
                String(item.id)
              );
              // console.log("Array of IDs:", idsArray);
              newPayload.location = idsArray;
            }
          }
        }
        if (
          isMR &&
          newPayload.location &&
          newPayload.location.includes("All")
        ) {
          enqueueSnackbar(
            "You are not allowed to create meeting type for All locations",
            {
              variant: "error",
            }
          );
          return;
        }
        const res = await axios.post("/api/keyagenda", newPayload);
        setSelectedId(res.data._id);
        if (res.status === 200 || res.status === 201) {
          enqueueSnackbar(`Meeting Type Added Successfully!`, {
            variant: "success",
          });
        }
        setReRender(true);
        getKeyAgendaValues(selectedLocation, currentYear);
      } catch (error) {
        enqueueSnackbar(`!`, {
          variant: "error",
        });
      }
    }
  };

  const handleCheck = async () => {
    // console.log("searchvalue", searchValue);
    const newPayload = {
      search: searchValue,
      orgId: orgId,
      page: pageType,
      limit: rowsPerPageType,
    };
    const data = ["All"];
    //setSelectedLocation([]);
    if ((!!searchValue && searchValue !== undefined) || searchValue !== "") {
      try {
        const res = await axios.get("/api/keyagenda/search", {
          params: newPayload,
        });
        if (res.status === 200 || res.status === 201) {
          const data = res.data;

          const DataAction: any = [];
          data.map((item: any) => {
            DataAction.push({
              ...item,
              Status: true,
            });
          });
          //console.log("data in search,", DataAction);
          setDataSource(DataAction);
          setCountType(DataAction?.length);
          setReRender(false);
          // setSystemData(data?.applicableSystem)
          // GetSystems(data);
          // setSuggestions(DataAction.owner)
        }
      } catch (error) {
        enqueueSnackbar("Something went wrong", { variant: "error" });
      }
    } else {
      getKeyAgendaValues(selectedLocation, currentYear);
    }
  };

  const handleSearchChange = (e: any) => {
    e.preventDefault();
    if (
      e.target.value === "" ||
      e.target.value === null ||
      e.target.value === undefined
    ) {
      // getAllReports();
      setSearchValue("");
    } else {
      setSearchValue(e.target.value);
    }
  };

  const handleClickDiscard = () => {
    setSearchValue("");
    // getKeyAgendaValues([userDetail.location.id], currentYear);
  };

  const createHandler = () => {
    setAddKeyAgenda(true);
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        <div className={classes.topSectionLeft}>
          <>
            {/* <Grid item xs={12} md={2}>
              <Typography color="primary" className={classes.searchBoxText}>
                <strong>Select Units</strong>
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <div className={classes.locSearchBox}>
                <FormControl variant="outlined" size="small" fullWidth>
                  <div
                    className={classes.locSearchBox}
                    ref={refForMRMSettings2}
                  >
                    <Autocomplete
                      multiple
                      id="location-autocomplete"
                      options={[allOption, ...locationOptions]}
                      getOptionLabel={(option) => option?.locationName || ""}
                      getOptionSelected={(option, value) =>
                        option?.id === value?.id
                      }
                      size="small"
                      value={selectedLocation}
                      onChange={handleLocation}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          size="small"
                          // label="Units"
                          fullWidth
                          InputLabelProps={{ shrink: false }}
                        />
                      )}
                    />
                  </div>
                </FormControl>
              </div>
            </Grid> */}
            {/* <div ref={refForMRMSettings3}>
              <YearComponent
                currentYear={currentYear}
                setCurrentYear={setCurrentYear}
              />
            </div> */}
          </>
        </div>
        <Paper
          style={{
            width: "285px",
            // height: "33px",
            float: "right",
            // margin: "11px",
            // borderRadius: "20px",
            // border: "1px solid #dadada",
            overflow: "hidden",
          }}
          component="form"
          data-testid="search-field-container"
          elevation={0}
          variant="outlined"
          className={classes.root}
          onSubmit={(e) => {
            e.preventDefault();
            handleCheck();
          }}
        >
          {/* <TextField
            // className={classes.input}
            name={"search"}
            value={searchValue}
            placeholder={"Search"}
            onChange={handleSearchChange}
            inputProps={{
              "data-testid": "search-field",
            }}
            InputProps={{
              disableUnderline: true,
              startAdornment: (
                <InputAdornment position="start" className={classes.iconButton}>
                  <img src={MdSearch} alt="search" />
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
            value={searchValue}
            placeholder="Search Meeting Type"
            onChange={
              // Check if the input has been cleared
              handleSearchChange
            }
            // prefix={<MdSearch />}
            suffix={
              <Button
                type="text"
                // className={classes.searchIcon}
                icon={<MdSearch />} // Use MdSearch as the suffix button
                onClick={() => handleSearchChange}
              />
            }
          />
        </Paper>
      </div>
      <div className={classes.tableContainer}>
        <Table
          // className={classes.tableContainer}
          className={classes.documentTable}
          rowClassName={() => "editable-row"}
          bordered
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          // scroll={{ x: 700, }}
        />
        <div className={classes.pagination}>
          <Pagination
            size="small"
            current={pageType}
            pageSize={rowsPerPageType}
            total={countType}
            showTotal={showTotalType}
            showSizeChanger
            showQuickJumper
            onChange={(page, pageSize) => {
              handlePaginationType(page, pageSize);
            }}
          />
        </div>
      </div>
      <div>
        <MrmAgendaCreate
          open={openDrawer}
          onClose={handlerCloseMrmPopup}
          meetingType={meetingType}
          selectedData={selectedData}
        />
      </div>
      <div>
        <AddParticipantsModal
          visible={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            getKeyAgendaValues(selectedLocation, currentYear);
          }}
          // onSave={handleAddParticipants}
          userOptions={userOptions}
          selectedRow={selectedRow}
          setSelectedRow={setSelectedRow}
        />
      </div>
    </>
  );
};

export default MRMKeyAgenda;
