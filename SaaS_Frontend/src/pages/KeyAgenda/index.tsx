import React, { useEffect, useState } from "react";
import axios from "../../apis/axios.global";
//mui
import {
  Box,
  Typography,
  Grid,
  FormControl,
  MenuItem,
  Paper,
  InputAdornment,
  IconButton,
} from "@material-ui/core";
import { Input, Table, Select, Popconfirm } from "antd";
import {
  Avatar,
  ListItemAvatar,
  ListItemText,
  TextField,
} from "@material-ui/core";
import { useNavigate } from "react-router-dom";
import useStyles from "./styles";
import "./tableStyles.css";
import { Autocomplete } from "@material-ui/lab";
import getAppUrl from "../../utils/getAppUrl";
import { documentTypeFormData } from "../../recoil/atom";
import { useRecoilState } from "recoil";
import { debounce } from "lodash";
import { useSnackbar } from "notistack";
import { ColumnsType } from "antd/es/table";
import { API_LINK } from "../../config";
import "./new.css";
import ModuleHeader from "components/Navigation/ModuleHeader";
import checkRoles from "../../utils/checkRoles";
import SearchIcon from "../../assets/SearchIcon.svg";
import { MdClose } from 'react-icons/md';
import YearComponent from "components/Yearcomponent";
import getYearFormat from "utils/getYearFormat";
import { ReactComponent as MRMLogo } from "../../assets/MRM/mrm.svg";
import { ReactComponent as CustomDeleteICon } from "../../assets/documentControl/Delete.svg";

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

const KeyAgenda = () => {
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [systemData, setSystemData] = useState<any[]>([]);
  const [suggestions, setSuggestions] = React.useState([]);
  const [formData, setFormData] = useRecoilState(documentTypeFormData);
  const [currentYear, setCurrentYear] = useState<any>();

  const [locationOptions, setLocationOptions] = useState<any>([]);

  const [selectedLocation, setSelectedLocation] = useState<any[]>([]);

  const realmName = getAppUrl();
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isMR = checkRoles("MR");

  const showData = isOrgAdmin || isMR;
  const [searchValue, setSearchValue] = useState<string>("");

  // const showHyperLink = !isOrgAdmin && !isMR;
  const { enqueueSnackbar } = useSnackbar();
  const orgId = sessionStorage.getItem("orgId");
  const userDetail = JSON.parse(sessionStorage.getItem("userDetails") || "{}");

  const navigate = useNavigate();
  const classes = useStyles();

  useEffect(() => {
    getyear();
  }, []);

  useEffect(() => {
    const data = ["All"];

    if (currentYear) {
      getLocationOptions();
      GetSystems(data);
      getUserInfo();
      getKeyAgendaValues(
        selectedLocation.length ? selectedLocation : ["All"],
        currentYear
      );
    }
  }, [currentYear]);

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
        getKeyAgendaValues([userInfo.data.location], currentYear);
      } else {
        getKeyAgendaValues(data, currentYear);
        setSelectedLocation([allOption]);
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
          disabled={showData ? false : true}
        />
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
          onBlur={() => handleUpdateKeyAgendaChanges(data)}
          value={data?.description}
          disabled={showData ? false : true}
        />
      ),
    },
    {
      title: "Owners",
      dataIndex: "owner",
      width: 300,
      render: (_: any, data: any, index: number) =>
        suggestions && (
          <Autocomplete
            key={`owner_${index}`}
            multiple={true}
            options={suggestions}
            onChange={(e, value) => {
              handleChangeOwners(value, data, index);
            }}
            // style={{width : '300px'}}
            getOptionLabel={(option: any) => {
              return option["email"];
            }}
            getOptionSelected={(option, value) => option.id === value.id}
            limitTags={2}
            size="small"
            value={formData[`owner_${index}`]}
            defaultValue={data?.owner}
            filterSelectedOptions
            disabled={showData ? false : true}
            renderOption={(option) => {
              return (
                <>
                  <div>
                    <MenuItem key={option.id}>
                      <ListItemAvatar>
                        <Avatar>
                          <Avatar src={`${API_LINK}/${option.avatar}`} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={option.value}
                        secondary={option.email}
                      />
                    </MenuItem>
                  </div>
                </>
              );
            }}
            renderInput={(params) => {
              return (
                <TextField
                  {...params}
                  variant="outlined"
                  label={"Owners"}
                  placeholder={"Owners"}
                  onChange={handleTextChange}
                  size="small"
                  disabled={showData ? false : true}
                />
              );
            }}
          />
        ),
    },
    {
      title: "System",
      dataIndex: "applicableSystem",
      width: 300,
      // fixed: 'right',
      render: (_: any, data: any, index: number) => (
        <Select
          mode="multiple"
          allowClear
          style={{ width: "100%" }}
          placeholder="Please select"
          onChange={(event) => handleChangeSystem(event, data, index)}
          onBlur={() => handleAdd(data)}
          defaultValue={data?.applicableSystem || []}
          disabled={showData ? false : true}
        >
          {systemData.length &&
            systemData.map((data) => {
              return (
                <Option value={data?.id} label={data?.name} key={data?.id}>
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
      width: 50,
      fixed: "right",

      render: (_: any, record: any, index: number) => (
        <Popconfirm
          placement="top"
          title={"Are you sure to delete meeting type"}
          onConfirm={() => showData && handleDelete(record, index)}
          okText="Yes"
          cancelText="No"
          disabled={showData ? false : true}
        >
          <CustomDeleteICon width={18} height={18} />

          {/* <DeleteIcon style={{ cursor: "pointer" }} /> */}
        </Popconfirm>
      ),
    },
  ];

  const handleTextChange = (e: any) => {
    getSuggestionList(e.target.value, "normal");
  };

  const handleChangeOwners = (data: any, values: any, index: number) => {
    const newData = { ...values };
    newData.owner = [...data];
    const newDataSource = [...dataSource];
    newDataSource[index] = newData;
    setDataSource(newDataSource);
    if (values?._id && newData.owner.length) {
      handleUpdateKeyAgendaChanges(newData);
    } else {
      // if (
      //   newData?.name.length &&
      //   newData?.owner.length &&
      //   newData?.applicableSystem.length
      // ) {
      //   handleAddKeyAgenda(newData);
      // } else {
      if (newData?.applicableSystem.length && newData?.name.length) {
        enqueueSnackbar(`Please select atleast one owner!`, {
          variant: "error",
        });
        //}
      }
    }
  };

  const handleChangeSystem = (data: any, values: any, index: number) => {
    const newData = { ...values };
    console.log("newdata", newData);
    newData.applicableSystem = [...data];
    const newDataSource = [...dataSource];
    newDataSource[index] = newData;
    setDataSource(newDataSource);
    if (values?._id && newData.applicableSystem.length) {
      handleUpdateKeyAgendaChanges(newData);
    } else {
      if (
        newData?.name.length &&
        newData?.owner.length &&
        newData?.applicableSystem.length
      ) {
        //handleAddKeyAgenda(newData);
      } else {
        if (newData?.owner.length && newData?.name.length) {
          enqueueSnackbar(`Please select atleast one system!`, {
            variant: "error",
          });
        }
      }
    }
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
      enqueueSnackbar(error.message, { variant: "error" });
    }
  };

  const handleUpdateKeyAgendaChanges = async (data: any) => {
    if (data?._id) {
      const payload = {
        name: data?.name,
        description: data?.description,
        owner: data?.owner,
        applicableSystem: data?.applicableSystem,
      };
      const res = await axios.patch(`/api/keyagenda/${data?._id}`, payload);
      if (res.status === 200 || res.status === 201) {
      }
    }
  };

  const getKeyAgendaValues = async (data: any, currentYear: any) => {
    try {
      //get api
      let res: any;
      if (data.includes("All") || data.length === 0) {
        const payload = {
          orgId: orgId,
          currentYear: currentYear,
        };

        res = await axios.get("/api/keyagenda/getkeyAgendaByOrgId", {
          params: payload,
        });
      } else {
        const locationValues = [...data].map((option: any) => option.id);
        const payloadData = {
          orgId: orgId,
          locationId: locationValues,
          currentYear: currentYear,
        };

        res = await axios.get("/api/keyagenda/getkeyAgendaByUnit", {
          params: payloadData,
        });
      }
      if (res.status === 200 || res.status === 201) {
        const data = res.data;
        setDataSource(data);
      }
    } catch (error) {
      console.log(error);
      enqueueSnackbar(`!`, {
        variant: "error",
      });
    }
  };

  const handleChangeKeyagenda = (data: any, values: any, index: number) => {
    const newData = { ...values };
    newData.name = data;
    const newDataSource = [...dataSource];
    newDataSource[index] = newData;
    setDataSource(newDataSource);

    if (values?._id && newData.name.length) {
      handleUpdateKeyAgendaChanges(newData);
    } else {
      if (
        newData?.name.length &&
        newData?.owner.length &&
        newData?.applicableSystem.length
      ) {
        handleAddKeyAgenda(newData);
      } else {
        if (newData?.owner.length && newData?.applicableSystem.length) {
          enqueueSnackbar(`Please add meeting type name!`, {
            variant: "error",
          });
        }
      }
    }
  };

  const handleDescription = (data: any, values: any, index: number) => {
    const newData = { ...values };
    newData.description = data;
    const newDataSource = [...dataSource];
    newDataSource[index] = newData;
    setDataSource(newDataSource);

    if (values?._id) {
      handleUpdateKeyAgendaChanges(newData);
    } else {
      if (
        newData?.name.length &&
        newData?.owner.length &&
        newData?.applicableSystem.length
      ) {
        handleAddKeyAgenda(newData);
      }
    }
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
    if (locationId.includes("All") || locationId.length === 0) {
      encodedSystems = encodeURIComponent(JSON.stringify(locationId));
    } else {
      const locationIdValues = [...locationId].map((option: any) => option.id);
      encodedSystems = encodeURIComponent(JSON.stringify(locationIdValues));
    }
    const { data } = await axios.get(
      `api/systems/displaySystemsForGivenLocation/${encodedSystems}`
    );
    setSystemData([...data]);
  };

  const getLocationOptions = async () => {
    await axios(`/api/location/getLocationsForOrg/${realmName}`)
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
        data?.applicableSystem.length &&
        data?.owner.length
      ) {
        // Validation passed, proceed with adding key agenda
        // handleAddKeyAgenda(data);
      } else {
        // Validation failed, enqueue a snackbar
        enqueueSnackbar(
          "Validation failed. Please provide all required fields.",
          {
            variant: "error",
          }
        );
      }
      //add row
      // const newData = {
      //   organizationId: orgId,
      //   creator: userDetail?.id,
      //   name: "",
      //   description: "",
      //   owner: [],
      //   applicableSystem: [],
      //   location: selectedLocation.includes("All") ? [] : [...selectedLocation],
      // };
      // setDataSource([...dataSource, newData]);
    } else {
      const newData = {
        organizationId: orgId,
        creator: userDetail?.id,
        name: "",
        description: "",
        owner: [],
        applicableSystem: [],
        location: [...selectedLocation],
      };
      setDataSource([...dataSource, newData]);
    }
  };

  const handleLocation = (event: any, values: any) => {
    let getAllLocationIds: any = [];
    if (values.find((option: any) => option.id === "All")) {
      setSelectedLocation([allOption]);
      getAllLocationIds = ["All"];
    } else {
      const allValues = values.filter((option: any) => option.id !== "All");
      setSelectedLocation([...allValues]);
      getAllLocationIds = [...allValues];
    }
    getKeyAgendaValues([...getAllLocationIds], currentYear);
    GetSystems([...getAllLocationIds]);
  };

  const handleAddKeyAgenda = async (payload: any) => {
    try {
      const newPayload = { ...payload };
      let locations = newPayload?.location;
      locations = locations.map((item: any) => item.id);
      newPayload.location = locations;
      console.log("payload in adding keyagenda", newPayload);
      const res = await axios.post("/api/keyagenda", newPayload);
      if (res.status === 200 || res.status === 201) {
        enqueueSnackbar(`Meeting Type Added Successfully!`, {
          variant: "success",
        });
      }
    } catch (error) {
      console.log(error);
      enqueueSnackbar(`!`, {
        variant: "error",
      });
    }
  };

  const createHandler = (record: any = {}) => {
    handleAdd();
  };

  const configHandler = () => {
    // navigate("/processdocuments/documenttype");
  };

  const filterHandler = () => {
    // navigate("/processdocuments/documenttype");
  };

  const handleCheck = async () => {
    const newPayload = {
      search: searchValue,
      orgId: orgId,
    };
    const res = await axios.get("/api/keyagenda/search", { params: newPayload });
    if (res.status === 200 || res.status === 201) {
      const data = res.data;
      setDataSource(data);
    }
  };

  const handleSearchChange = (e: any) => {
    e.preventDefault();
    setSearchValue(e.target.value);
  };

  const handleClickDiscard = () => {
    setSearchValue("");
    getKeyAgendaValues(selectedLocation, currentYear);
  };

  return (
    <>
      {/* <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography color="primary" variant="h6">
          Key Agenda Master
        </Typography>
      </Box> */}
      <ModuleHeader
        moduleName="Meeting Type"
        createHandler={createHandler}
        configHandler={configHandler}
        filterHandler={filterHandler}
        showSideNav={true}
      />
      <Box display="flex" justifyContent="flex-end" alignItems="center">
        <MRMLogo
          // className={classes.icon}
          style={{ width: "25px", height: "40px", cursor: "pointer" }}
          onClick={() => navigate("/mrm/mrm")}
        />
        <div
          className={classes.mrmtext}
          style={{ marginRight: "15px" }}
          onClick={() => navigate("/mrm/mrm")}
        >
          MRM
        </div>
      </Box>

      <div
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        <div className={classes.topSectionLeft}>
          <>
            <Grid item xs={12} md={2}>
              <Typography color="primary" className={classes.searchBoxText}>
                <strong>Select Units</strong>
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <div className={classes.locSearchBox}>
                <FormControl variant="outlined" size="small" fullWidth>
                  <div className={classes.locSearchBox}>
                    <Autocomplete
                      multiple
                      id="location-autocomplete"
                      options={[allOption, ...locationOptions]}
                      getOptionLabel={(option) => option.locationName || ""}
                      getOptionSelected={(option, value) =>
                        option.id === value.id
                      }
                      value={selectedLocation}
                      onChange={handleLocation}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          size="small"
                          label="Units"
                          fullWidth
                        />
                      )}
                    />
                  </div>
                </FormControl>
              </div>
            </Grid>
            <YearComponent
              currentYear={currentYear}
              setCurrentYear={setCurrentYear}
            />
          </>
        </div>
        <Paper
          style={{
            width: "285px",
            height: "33px",
            float: "right",
            margin: "11px",
            borderRadius: "20px",
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
            handleCheck();
          }}
        >
          <TextField
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
      </div>
    </>
  );
};

export default KeyAgenda;
