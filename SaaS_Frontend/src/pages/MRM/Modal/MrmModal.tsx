import React, { useState, useEffect } from "react";
import { Modal } from "antd";
import { Table, Checkbox } from "antd";
import useStyles from "../styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import axios from "../../../apis/axios.global";
import getAppUrl from "../../../utils/getAppUrl";
import { useSnackbar } from "notistack";
import { documentTypeFormData } from "../../../recoil/atom";
import { useRecoilState } from "recoil";


import { debounce } from "lodash";
import checkRoles from "../../../utils/checkRoles";
import getYearFormat from "utils/getYearFormat";
import YearComponent from "components/Yearcomponent";
import { getOrganizationData } from "apis/orgApi";
import { currentAuditYear } from "recoil/atom";

interface mrmProps {
  openModal?: any;
  handleCloseModal?: any;
}
let typeAheadValue: string;
let typeAheadType: string;

let addMonthyColumns: any = [];
function MrmModal({ openModal, handleCloseModal }: mrmProps) {
  const [tableColumns, setTableColumns] = useState([]);
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [units, setUnits] = useState<any[]>([]);
  const [systemData, setSystemData] = useState<any[]>([]);
  const [selectedSystem, setSelectedSystem] = useState<any[]>([]);
  const [suggestions, setSuggestions] = React.useState([]);
  const [formData, setFormData] = useRecoilState(documentTypeFormData);
  const [loading, setLoading] = useState<boolean>(false);
  const [settings, setSettings] = useState<string>("");

  const [currentYear, setCurrentYear] = useState<any>();

  const orgId = sessionStorage.getItem("orgId");

  const classes = useStyles();
  const realmName = getAppUrl();
  const { enqueueSnackbar } = useSnackbar();
  const [auditYear, setAuditYear] = useRecoilState<any>(currentAuditYear);
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isMR = checkRoles("MR");

  const showData = isOrgAdmin || isMR;

  useEffect(() => {
    getyear();
    getHeaderData();
  }, []);

  const getyear = async () => {
    const currentyear = await getYearFormat(new Date().getFullYear());
    setCurrentYear(currentyear);
  };
  const getHeaderData = () => {
    getOrganizationData(realmName).then((response: any) => {
      setAuditYear(response?.data?.auditYear);
    });
  };
  const monthsColumns = [
    {
      title: "Apr",
      dataIndex: "mrmData",
      key: "mrmData",
      render: (_: any, data: any, index: any) => (
        <Checkbox
          disabled={showData ? false : true}
          onChange={(event) => handleCheckBox(event, data, index, 0)}
          key="april"
          checked={data?.mrmData?.mrmPlanData && data?.mrmData?.mrmPlanData[0]}
        />
      ),
    },
    {
      title: "May",
      dataIndex: "mrmData",
      key: "mrmData",
      render: (_: any, data: any, index: any) => (
        <Checkbox
          disabled={showData ? false : true}
          onChange={(event) => handleCheckBox(event, data, index, 1)}
          checked={data?.mrmData?.mrmPlanData && data?.mrmData?.mrmPlanData[1]}
        />
      ),
    },
    {
      title: "June",
      dataIndex: "mrmData",
      key: "mrmData",
      render: (_: any, data: any, index: any) => (
        <Checkbox
          disabled={showData ? false : true}
          onChange={(event) => handleCheckBox(event, data, index, 2)}
          checked={data?.mrmData?.mrmPlanData && data?.mrmData?.mrmPlanData[2]}
        />
      ),
    },
    {
      title: "July",
      dataIndex: "mrmData",
      key: "mrmData",
      render: (_: any, data: any, index: any) => (
        <Checkbox
          disabled={showData ? false : true}
          onChange={(event) => handleCheckBox(event, data, index, 3)}
          checked={data?.mrmData?.mrmPlanData && data?.mrmData?.mrmPlanData[3]}
        />
      ),
    },
    {
      title: "Aug",
      dataIndex: "mrmData",
      key: "mrmData",
      render: (_: any, data: any, index: any) => (
        <Checkbox
          disabled={showData ? false : true}
          onChange={(event) => handleCheckBox(event, data, index, 4)}
          checked={data?.mrmData?.mrmPlanData && data?.mrmData?.mrmPlanData[4]}
        />
      ),
    },
    {
      title: "Sep",
      dataIndex: "mrmData",
      key: "mrmData",
      render: (_: any, data: any, index: any) => (
        <Checkbox
          disabled={showData ? false : true}
          onChange={(event) => handleCheckBox(event, data, index, 5)}
          checked={data?.mrmData?.mrmPlanData && data?.mrmData?.mrmPlanData[5]}
        />
      ),
    },
    {
      title: "Oct",
      dataIndex: "mrmData",
      key: "mrmData",
      render: (_: any, data: any, index: any) => (
        <Checkbox
          disabled={showData ? false : true}
          onChange={(event) => handleCheckBox(event, data, index, 6)}
          checked={data?.mrmData?.mrmPlanData && data?.mrmData?.mrmPlanData[6]}
        />
      ),
    },
    {
      title: "Nov",
      dataIndex: "mrmData",
      key: "mrmData",
      render: (_: any, data: any, index: any) => (
        <Checkbox
          disabled={showData ? false : true}
          onChange={(event) => handleCheckBox(event, data, index, 7)}
          checked={data?.mrmData?.mrmPlanData && data?.mrmData?.mrmPlanData[7]}
        />
      ),
    },
    {
      title: "Dec",
      dataIndex: "mrmData",
      key: "mrmData",
      render: (_: any, data: any, index: any) => (
        <Checkbox
          disabled={showData ? false : true}
          onChange={(event) => handleCheckBox(event, data, index, 8)}
          checked={data?.mrmData?.mrmPlanData && data?.mrmData?.mrmPlanData[8]}
        />
      ),
    },
    {
      title: "Jan",
      dataIndex: "mrmData",
      key: "mrmData",
      render: (_: any, data: any, index: any) => (
        <Checkbox
          disabled={showData ? false : true}
          onChange={(event) => handleCheckBox(event, data, index, 9)}
          checked={data?.mrmData?.mrmPlanData && data?.mrmData?.mrmPlanData[9]}
        />
      ),
    },
    {
      title: "Feb",
      dataIndex: "mrmData",
      key: "mrmData",
      render: (_: any, data: any, index: any) => (
        <Checkbox
          disabled={showData ? false : true}
          onChange={(event) => handleCheckBox(event, data, index, 10)}
          checked={data?.mrmData?.mrmPlanData && data?.mrmData?.mrmPlanData[10]}
        />
      ),
    },
    {
      title: "Mar",
      dataIndex: "mrmData",
      key: "mrmData",
      render: (_: any, data: any, index: any) => (
        <Checkbox
          disabled={showData ? false : true}
          onChange={(event) => handleCheckBox(event, data, index, 11)}
          checked={data?.mrmData?.mrmPlanData && data?.mrmData?.mrmPlanData[11]}
        />
      ),
    },
  ];

  const columns = [
    {
      title: "Meeting Type",
      dataIndex: "name",
      key: "name",
      render: (_: any, data: any) => <>{data?.name}</>,
    },
    {
      title: "Owners",
      dataIndex: "owner",
      key: "owner",
      render: (_: any, data: any) => (
        <>
          {data?.owner?.map((item: any) => {
            return <div>{item?.username}</div>;
          })}
        </>
      ),
    },
    // {
    //   title: "Participants",
    //   dataIndex: "mrmData",
    //   key: "mrmData",
    //   // title: 'Owners',
    //   // dataIndex: 'owner',
    //   width: 300,
    //   render: (_: any, data: any, index: number) =>
    //     suggestions && (
    //       <Autocomplete
    //         key={`participant_${index}`}
    //         multiple={true}
    //         options={suggestions}
    //         onChange={(e, value) => {
    //           handleChangeParticipants(value, data, index);
    //         }}
    //         // style={{width : '300px'}}
    //         getOptionLabel={(option: any) => {
    //           return option["email"];
    //         }}
    //         getOptionSelected={(option, value) => option.id === value.id}
    //         limitTags={2}
    //         size="small"
    //         value={formData[`participant_${index}`]}
    //         defaultValue={data?.mrmData?.participants}
    //         disabled={showData ? false : true}
    //         filterSelectedOptions
    //         renderOption={(option) => {
    //           return (
    //             <>
    //               <div>
    //                 <MenuItem key={option.id}>
    //                   <ListItemAvatar>
    //                     <Avatar>
    //                       <Avatar src={`${API_LINK}/${option.avatar}`} />
    //                     </Avatar>
    //                   </ListItemAvatar>
    //                   <ListItemText
    //                     primary={option.value}
    //                     secondary={option.email}
    //                   />
    //                 </MenuItem>
    //               </div>
    //             </>
    //           );
    //         }}
    //         renderInput={(params) => {
    //           return (
    //             <TextField
    //               {...params}
    //               variant="outlined"
    //               // label={'participants'}
    //               placeholder={"participants"}
    //               onChange={handleTextChange}
    //               size="small"
    //               disabled={showData ? false : true}
    //               InputLabelProps={{ shrink: false }}
    //             />
    //           );
    //         }}
    //       />
    //     ),
    // },
  ];

  if (settings && settings.length) {
    if (settings === "Jan - Dec") {
      const newData = monthsColumns.splice(0, 9);
      addMonthyColumns = [...columns, ...monthsColumns, ...newData];
    } else {
      addMonthyColumns = [...columns, ...monthsColumns];
    }
  }

  const handleTextChange = (e: any) => {
    getSuggestionList(e.target.value, "normal");
  };

  const getSuggestionList = (value: any, type: string) => {
    typeAheadValue = value;
    typeAheadType = type;
    debouncedSearch();
  };

  const debouncedSearch = debounce(() => {
    getData(typeAheadValue, typeAheadType);
  }, 400);

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

  const handleChangeParticipants = (data: any, values: any, index: number) => {
    const newData = { ...values };
    if (newData.mrmData) {
      newData.mrmData.participants = [...data];
    }
    const newDataSource = [...dataSource];
    newDataSource[index] = newData;
    setDataSource(newDataSource);
  };

  useEffect(() => {
    getUnits();
    orgdata();
  }, []);

  useEffect(() => {
    if (currentYear) {
      getKeyAgendaValues(selectedUnit, selectedSystem);
    }
  }, [currentYear]);
  useEffect(() => {
    console.log("selected systems", selectedSystem);
    getKeyAgendaValues(selectedUnit, selectedSystem);
  }, [selectedSystem]);

  console.log("audityear in mrmmodal", auditYear);

  const orgdata = async () => {
    const response = await axios.get(`/api/organization/${realmName}`);
    console.log("response from org", response);
    if (response.status === 200 || response.status === 201) {
      setSettings(response?.data?.fiscalYearQuarters);
    }
  };
  const getUnits = async () => {
    setLoading(true);
    await axios(`/api/mrm/getLocationsForOrg/${realmName}`)
      .then((res) => {
        setUnits(res?.data);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        console.error(err);
      });
  };

  const getKeyAgendaValues = async (units: any, data: any) => {
    try {
      setLoading(true);
      //get api
      console.log("data of system in get", data);
      const payload = {
        orgId: orgId,
        unitId: [units],
        applicationSystemID: [data],
        currentYear: currentYear,
      };
      const res = await axios.get("/api/keyagenda/getkeyAgendaMRMByUnit", {
        params: payload,
      });
      if (res.status === 200 || res.status === 201) {
        const data = res.data;
        const keyAgendaData: any = [];
        data?.map((item: any) => {
          if ("mrmData" in item) {
            keyAgendaData.push(item);
          } else {
            keyAgendaData.push({
              ...item,
              mrmData: {
                participants: [],
                mrmPlanData: [
                  false,
                  false,
                  false,
                  false,
                  false,
                  false,
                  false,
                  false,
                  false,
                  false,
                  false,
                  false,
                ],
              },
            });
          }
        });
        setDataSource(keyAgendaData);
        setLoading(false);
      }
      // getkeyAgendaMRMByUnit
    } catch (error) {
      console.log(error);
      setLoading(false);
      // enqueueSnackbar(`!`, {
      //   variant: "error",
      // });
    }
  };

  // const handleCheckBox = (
  //   event: any,
  //   values: any,
  //   index: number,
  //   key: number
  // ) => {
  //   const newObj = { ...values };
  //   if (newObj.mrmData && newObj.mrmData.mrmPlanData) {
  //     newObj.mrmData.mrmPlanData[key] = event?.target?.checked;
  //   }
  //   const newDataSource = [...dataSource];
  //   newDataSource[index] = newObj;
  //   setDataSource(newDataSource);
  // };
  const handleCheckBox = (
    event: any,
    values: any,
    index: number,
    key: number
  ) => {
    setDataSource((prevDataSource) => {
      const newDataSource = [...prevDataSource];
      const newObj = { ...values };

      if (newObj.mrmData && newObj.mrmData.mrmPlanData) {
        newObj.mrmData.mrmPlanData[key] = event?.target?.checked;
      }

      newDataSource[index] = newObj;
      return newDataSource;
    });
  };

  const handleOk = () => {
    if (showData) {
      const updateArray: any = [];
      const addArray: any = [];

      const newdataSource = [...dataSource];
      newdataSource.map((item) => {
        if (item?.mrmData?._id) {
          delete item.mrmData?.keyAgendaId;
          updateArray.push({ ...item.mrmData, fiscalYear: settings });
        } else {
          addArray.push({
            ...item.mrmData,
            keyAgendaId: item?._id,
            unitId: selectedUnit,
            momPlanYear: auditYear,
            organizationId: orgId,
            currentYear: currentYear,
            fiscalYear: settings,
          });
        }
      });

      if (addArray.length) {
        addMRMData(addArray);
      }

      if (updateArray.length) {
        updateMRMData(updateArray);
      }
    }
    handleCloseModal();
  };

  const addMRMData = async (data: any) => {
    try {
      const res = await axios.post("/api/mrm", data);
      if (res.status === 200 || res.status === 201) {
        enqueueSnackbar(`Data Added Successfully!`, {
          variant: "success",
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const updateMRMData = async (data: any) => {
    try {
      console.log("data in update mrm", data);
      const res = await axios.patch(`/api/mrm`, data);
      if (res.status === 200 || res.status === 201) {
        enqueueSnackbar(`Data Added Successfully!`, {
          variant: "success",
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleChangeUnit = (event: React.ChangeEvent<{ value: any }>) => {
    setSelectedUnit(event.target.value as string);
    if (selectedSystem && selectedSystem.length) {
      getKeyAgendaValues(event.target.value, selectedSystem);
    } else {
      getApplicationSystems(event.target.value);
    }
  };

  // const handleChangeSystem = (event: React.ChangeEvent<{ value: any }>) => {
  //   setSelectedSystem(event.target.value as string);
  //   getKeyAgendaValues(selectedUnit, event.target.value);
  // };
  const handleChangeSystem = (event: React.ChangeEvent<{ value: any }>) => {
    setSelectedSystem(event.target.value);
    console.log("selected systems", selectedSystem);
    getKeyAgendaValues(selectedUnit, selectedSystem);
  };

  const getApplicationSystems = async (locationId: any) => {
    const encodedSystems = encodeURIComponent(JSON.stringify(locationId));
    const { data } = await axios.get(
      `api/systems/displaySystemsForGivenLocation/${encodedSystems}`
    );
    setSystemData([...data]);
  };

  return (
    <>
      <Modal
        title="MRM Plan"
        open={openModal?.open}
        onOk={handleOk}
        onCancel={handleCloseModal}
        width="90vw"
        bodyStyle={{ overflowX: "auto", maxHeight: "calc(100vh - 150px)" }}
        okText={"Submit"}
        className={classes.scroll}
      >
        <div style={{ display: "flex" }}>
          <FormControl
            variant="outlined"
            className={classes.formControl}
            size="small"
          >
            <InputLabel id="demo-simple-select-outlined-label">
              Units
            </InputLabel>
            <Select
              labelId="demo-simple-select-outlined-label"
              id="demo-simple-select-outlined"
              value={selectedUnit}
              onChange={handleChangeUnit}
              label="Units"
            >
              {units &&
                units.length &&
                units.map((data: any) => {
                  return (
                    <MenuItem value={data?.id} key={data?.id}>
                      {data?.locationName}
                    </MenuItem>
                  );
                })}
            </Select>
          </FormControl>
          {systemData && systemData.length > 0 && (
            <div style={{ display: "flex" }}>
              <FormControl
                variant="outlined"
                className={classes.formControl}
                size="small"
              >
                <InputLabel id="demo-simple-select-outlined-label">
                  System
                </InputLabel>
                <Select
                  labelId="demo-simple-select-outlined-label"
                  id="demo-simple-select-outlined"
                  value={selectedSystem}
                  multiple
                  onChange={handleChangeSystem}
                  label="System"
                >
                  {systemData.map((data: any) => {
                    return (
                      <MenuItem value={data?.id} key={data?.id}>
                        {data?.name}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
              {/* <FormControl variant="outlined" className={classes.formControl} size='small'> */}
              <YearComponent
                currentYear={currentYear}
                setCurrentYear={setCurrentYear}
              />
              {/* </FormControl> */}
            </div>
          )}
        </div>

        <div className={classes.tableContainer}>
          <Table
            bordered
            dataSource={dataSource}
            columns={addMonthyColumns}
            pagination={false}
            className={classes.documentTable}
            rowClassName={() => "editable-row"}
          />
        </div>
      </Modal>
    </>
  );
}

export default MrmModal;
