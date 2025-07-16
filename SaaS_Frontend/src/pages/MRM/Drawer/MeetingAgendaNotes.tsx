import React, { useEffect, useRef, useState } from "react";
import {
  Form,
  Select,
  Spin,
} from "antd";
import getAppUrl from "../../../utils/getAppUrl";
import axios from "../../../apis/axios.global";
import { useSnackbar } from "notistack";
import {
  TextField,
  makeStyles,
  TableCell,
  TableRow,
  TableHead,
  IconButton,
  Table,
  TableContainer,
  TableBody,
  Paper,
  Tooltip,
  useMediaQuery,
} from "@material-ui/core";
import { debounce } from "lodash";
import { AiOutlineMinusCircle } from "react-icons/ai";
import ArrowDropDown from "../../../assets/TeamDropdown.svg";
import checkRoles from "../../../utils/checkRoles";
import { getAgendaByMeetingType } from "apis/mrmagendapi";
import { ReactComponent as CreateIcon } from "../../../assets/MRM/addIcon.svg";



type Props = {
  formData?: any;
  setFormData?: any;
  mode?: any;
  scheduleData: any;
  mrmEditOptions: any;
};

let typeAheadValue: string;
let typeAheadType: string;

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    "& .MuiAccordionDetails-root": {
      display: "block",
    },
  },
  disabledInput: {
    "& .ant-input[disabled], & .ant-input[disabled]:not([type='textarea'])": {
      // border: "none",
      backgroundColor: "white !important",
      color: "black",
    },
  },

  disabledSelect: {
    "& .ant-select-disabled .ant-select-selector": {
      backgroundColor: "white !important",
      background: "white !important",
      color: "black",
      // border: "none",
    },
    "& .ant-select-disabled .ant-select-selection-item": {
      color: "black",
      backgroundColor: "white !important",
    },
    "& .ant-select-disabled .ant-select-arrow": {
      display: "none",
    },
  },

  disabledMultiSelect: {
    "& .ant-select-disabled.ant-select-multiple .ant-select-selector": {
      backgroundColor: "white !important",
      // border: "none",
    },
    "& .ant-select-disabled.ant-select-multiple .ant-select-selection-item": {
      color: "black",
      background: "white !important",
    },
    "& .ant-select-disabled .ant-select-arrow": {
      display: "none",
    },
  },
  disabledTextField: {
    "& .MuiInputBase-root.Mui-disabled": {
      // border: "none",
      backgroundColor: "white !important",
      color: "black",
    },
  },
  disabledAutocompleteTextField: {
    '& .MuiAutocomplete-inputRoot[class*="Mui-disabled"] .MuiAutocomplete-input':
      {
        // border: "none",
        backgroundColor: "white !important",
        color: "black",
      },
  },
  table: {
    backgroundColor: "#FFFFFF",
    borderRadius: "9px",
    width: "100%",
    "& thead th": {
      padding: theme.spacing(2),
      backgroundColor: "#F7F7FF",
      color: theme.palette.primary.main,
      zIndex: 0,
    },
  },
  actionButtonTableCell: {
    fontSize: theme.typography.pxToRem(12),
    textAlign: "center",
    paddingTop: theme.spacing(0.1),
    paddingBottom: theme.spacing(0.1),
    height: theme.typography.pxToRem(2),
    borderBottom: "1px solid rgba(104, 104, 104, 0.1);",
    borderRight: "1px solid rgba(104, 104, 104, 0.1);",
    wordWrap: "break-word",
    maxWidth: "200px",
  },
  tableHeaderColor: {
    color: theme.palette.primary.main,
  },
  tableCell: {
    fontSize: theme.typography.pxToRem(12),
    paddingTop: theme.spacing(0.1),
    paddingBottom: theme.spacing(0.1),
    paddingLeft: theme.spacing(2), //removing for testing
    paddingRight: theme.spacing(2), //removing for testing
    height: theme.typography.pxToRem(2),
    borderBottom: "1px solid rgba(104, 104, 104, 0.1);",
    borderRight: "1px solid rgba(104, 104, 104, 0.1);",
    wordWrap: "break-word",
    maxWidth: "300px",
  },
  tableCellWithoutAction: {
    fontSize: theme.typography.pxToRem(12),
    height: theme.typography.pxToRem(10),
    borderBottom: "1px solid rgba(104, 104, 104, 0.1);",
    borderRight: "1px solid rgba(104, 104, 104, 0.1);",
  },

  editField: {
    fontSize: theme.typography.pxToRem(12),
    width: "100%",
    borderBottom: "0.5px solid black",
  },
  addField: {
    width: "100%",
    borderRadius: "6px",
    fontSize: theme.typography.pxToRem(12),
  },
  addFieldButton: {
    display: "flex",
    margin: "auto",
    maxWidth: "100px",
  },
  buttonCell: {
    fontSize: theme.typography.pxToRem(12),
    paddingTop: theme.spacing(0.1),
    paddingBottom: theme.spacing(0.1),
    paddingLeft: theme.spacing(2), //removing for testing
    paddingRight: theme.spacing(2), //removing for testing
    height: theme.typography.pxToRem(2),
    borderBottom: "1px solid rgba(104, 104, 104, 0.1);",
    borderRight: "1px solid rgba(104, 104, 104, 0.1);",
  },
  uploadSection: {
    "& .ant-upload-list-item-name": {
      color: "blue !important",
    },
  },
  divAction: {
    display: "flex",
    alignItems: "center",
    margin: "20px 0",
  },

  line: {
    width: "49%",
    height: "1px",
    backgroundColor: "#cacaca",
  },
  last: {
    margin: "0 auto",
  },
  arrow: {
    backgroundImage: `url(${ArrowDropDown})`,
    height: "10px",
    width: "10px",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundSize: "100%",
    margin: "0 10px",
    cursor: "pointer",
    rotate: "180deg",
  },
  active: {
    rotate: "0deg",
  },
}));

const MeetingAgendaNotes = ({
  formData,
  setFormData,
  mode,
  scheduleData,
  mrmEditOptions,
}: Props) => {
  const [firstForm] = Form.useForm();
  const [dataSource, setDataSource] = useState<any>([]);
  const [agendas, setAgendas] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [suggestions, setSuggestions] = React.useState([]);
  const [collapseDiv, setCollapseDiv] = useState(true);
  const [totalAttendees, setTotalAttendees] = useState<any>([]);
  const [owners, setowners] = useState<any>([]);
  const [agendaowner, setagendowner] = useState<any>([]);
  const matches = useMediaQuery("(min-width:786px)");
  const classes = useStyles();
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isMR = checkRoles("MR");
  const isInitialRender = useRef(true);
  const showData = isOrgAdmin || isMR;
  const orgId = sessionStorage.getItem("orgId");
  const realmName = getAppUrl();
  const { enqueueSnackbar } = useSnackbar();
  const [readStatus, setReadStatus] = useState(false);
  const userInfo = JSON.parse(sessionStorage.getItem("userDetails") as string);
  useEffect(() => {
    if (mrmEditOptions === "MrmPlan") {
      agendaDataActions();
    }
    if (mrmEditOptions === "ReadOnly") {
      setReadStatus(true);
    }
    getUserOptions();
  }, [scheduleData]);

  const dataFinalActions: any[] = [];

  const agendaDataActions = () => {
    getAgendaByMeetingType(scheduleData?._id).then((response: any) => {
      if (response.data) {
        setAgendas(response.data?.result);
      }
      if (response.data && response.data.length) {
        for (let i = 0; i < response.data?.length; i++) {
          const newValue = response.data?.result[i];

          dataFinalActions.push({
            agenda: newValue?.agenda || newValue?.name,
            _id: newValue?._id,
            keyagendaId: newValue?.meetingType || "",
            owner: newValue?.owner,
            decisionPoints: newValue?.decisionPoints || "",
          });
        }
        setDataSource(dataFinalActions);
      }
    });
  };

  useEffect(() => {
    setLoading(true);
    getAgendaDataMeetingById(formData?.meetingType);
    const newData = { ...formData };

    const newDataSource: any = [],
      newAttendes: any = [],
      attendeesName: any = [];

    const datavalues = newData?.dataValue
      ? newData.dataValue
      : newData?.agendaformeetingType
      ? newData.agendaformeetingType
      : [];
    const agendavalues = newData?.dataValue;

    if (datavalues && datavalues.length) {
      for (let i = 0; i < datavalues.length; i++) {
        const newValue = datavalues[i];

        newDataSource.push({
          agenda: newValue?.agenda || newValue?.name,
          _id: newValue?._id,
          keyagendaId: newValue?.meetingType || "",
          owner: newValue?.owner,
          decisionPoints: newValue?.decisionPoints || "",
        });
      }
    }

    setDataSource(newDataSource);
    setLoading(false);
    setFormData({
      ...formData,
      // attendees: newAttendes,
      agendaformeetingType: newDataSource,
      dataValue: newDataSource,
    });
    getUserOptions();
  }, []);

  useEffect(() => {
    if (isInitialRender.current && mode === "Edit") {
      isInitialRender.current = false;
      return;
    }
  });
  const [userOptions, setUserOptions] = useState<any>([]);

  const getUserOptions = async () => {
    await axios
      .get(`/api/riskregister/users/${userInfo?.organizationId}`)
      .then((res) => {
        // console.log("res from users", res);
        if (res.data && res.data.length > 0) {
          const ops = res?.data?.map((obj: any) => ({
            id: obj.id,
            name: obj.username,
            avatar: obj.avatar,
            email: obj.email,
            username: obj.username,
            value: obj.id,
            label: obj.email,
            fullname: obj.firstname + " " + obj.lastname,
          }));
          setUserOptions(ops);
        } else {
          setUserOptions([]);
        }
      })
      .catch((err) => console.error(err));
  };
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

  const onFinish = (values: any) => {
    // console.log("Received values of form:", values);
  };

  const toggleDiv = () => {
    setCollapseDiv(!collapseDiv);
  };

  const addData = () => {
    const newAgenda = {
      agenda: "",
      keyagendaId: "",
      owner: [],
    };
    //dataSource.push(newAgenda);
    setDataSource([...dataSource, newAgenda]); // Update dataSource if needed
  };

  const handleAttendees = (values: any) => {
    setFormData({ ...formData, attendees: values });
  };

  const handlechangeOwner = (value: any, key: number) => {
    const newDatasource = [...dataSource];
    newDatasource[key].owner = [...value];
    // let newagendaowner = [];
    // newagendaowner.push({
    //   agenda: newDatasource[key].agenda,
    //   owner: newDatasource[key].agenda,
    // });
    // console.log("newagendaownerarray", newagendaowner);

    setDataSource(newDatasource);
    setAgendas(newDatasource);

    if (newDatasource && newDatasource[key]) {
      setFormData({
        ...formData,
        agendaformeetingType: newDatasource,
        dataValue: newDatasource,
        //da: newDatasource, // Include other form data here if needed
      });
    }
  };

  const getAgendaDataMeetingById = (meetingType: any) => {
    getAgendaByMeetingType(meetingType).then((response: any) => {
      if (response.data) {
        setAgendas(response.data?.result);
      }
    });
  };

  const handleKeyAgenda = (value: any, key: number) => {
    const newDatasource = [...dataSource];
    if (!dataSource || key < 0 || key >= dataSource.length) {
      console.error("Invalid dataSource or key");
      return;
    }

    // let newsource2 = [...agendas];
    const newAgendas = [...agendas];
    newDatasource[key].agenda = value;
    // newsource2[key].agenda = value;

    setDataSource(newDatasource);
    setAgendas(newAgendas);
    setFormData({
      ...formData,
      dataValue: newDatasource,
      keyadendaDataValues: newDatasource,
      agendaformeetingType: newDatasource,
    });
  };
  const handleDelete = (indexToDelete: any) => {
    // Create a copy of the dataSource array
    const updatedDataSource = [...dataSource];

    // Remove the object at the specified index
    updatedDataSource.splice(indexToDelete, 1);

    // Update the state with the modified dataSource
    setDataSource(updatedDataSource);
    setFormData({
      ...formData,
      dataValue: updatedDataSource,
    });
  };

  return (
    <>
      {" "}
      {loading ? (
        <Spin style={{ display: "flex", justifyContent: "center" }}> </Spin>
      ) : (
        <Form
          form={firstForm}
          layout="vertical"
          onValuesChange={(changedValues, allValues) =>
            setFormData({ ...formData, allValues, changedValues })
          }
          autoComplete="off"
          onFinish={onFinish}
          // initialValues={dataSource}
        >
          <div className={classes.divAction}>
            <div className={classes.line} />
            <div
              className={`${classes.arrow} ${collapseDiv && classes.active}`}
              onClick={toggleDiv}
            />
            <div className={`${classes.line} ${classes.last}`} />
          </div>

          <>
            <TableContainer component={Paper} elevation={0} variant="outlined">
              <Table stickyHeader className={classes.table}>
                <TableHead>
                  <TableRow>
                    <TableCell>Agenda</TableCell>
                    <TableCell>Agenda Owners</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataSource && dataSource.length > 0 ? (
                    dataSource?.map((val: any, i: number) => {
                      return (
                        <TableRow key={i}>
                          <TableCell style={{ width: "60%" }}>
                            <TextField
                              // disabled={showData ? false : true}
                              key="agenda"
                              name="agenda"
                              placeholder="Agenda"
                              value={val?.agenda}
                              disabled={readStatus}
                              multiline
                              style={{ width: "100%" }}
                              onChange={(e) =>
                                handleKeyAgenda(e.target.value, i)
                              }
                              className={classes.disabledTextField}
                            />
                          </TableCell>
                          <TableCell style={{ width: "40%" }}>
                            {/* <Autocomplete
                              multiple={true}
                              options={suggestions}
                              disabled={readStatus}
                              // className={classes.disabledAutocompleteTextField}
                              getOptionLabel={(option: any) => {
                                return option["email"];
                              }}
                              getOptionSelected={(option, value) =>
                                option.id === value.id
                              }
                              limitTags={2}
                              size="small"
                              onChange={(e, value) =>
                                handlechangeOwner(value, i)
                              }
                              defaultValue={
                                dataSource &&
                                dataSource.length &&
                                dataSource[i] &&
                                dataSource[i]?.owner
                              }
                              filterSelectedOptions
                              renderOption={(option) => {
                                return (
                                  <>
                                    <div>
                                      <MenuItem key={option.id}>
                                        <ListItemAvatar>
                                          <Avatar>
                                            <Avatar
                                              src={`${API_LINK}/${option.avatar}`}
                                            />
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
                                    placeholder={"Agenda Owners"}
                                    onChange={handleTextChange}
                                    size="small"
                                    //disabled={showData ? false : true}
                                    InputLabelProps={{ shrink: false }}
                                  />
                                );
                              }}
                            /> */}
                            <Select
                              mode="multiple"
                              placeholder="Select Owners"
                              style={{ width: "100%", fontSize: "12px" }}
                              options={userOptions}
                              onChange={(selectedValues) => {
                                // Find the full user objects from selected IDs
                                const selectedUsers = selectedValues
                                  .map((userId: any) =>
                                    userOptions.find(
                                      (user: any) => user.value === userId
                                    )
                                  )
                                  .filter(Boolean);

                                handlechangeOwner(selectedUsers, i);
                              }}
                              defaultValue={
                                (dataSource &&
                                  dataSource.length &&
                                  dataSource[i] &&
                                  dataSource[i]?.owner?.map(
                                    (owner: any) => owner.id
                                  )) ||
                                []
                              }
                              filterOption={(input: any, option: any) =>
                                option.label
                                  .toLowerCase()
                                  .includes(input.toLowerCase())
                              }
                              disabled={readStatus}
                              size="large"
                              dropdownStyle={{ maxHeight: 200 }}
                            />
                          </TableCell>
                          <TableCell
                          // className={classes.actionButtonTableCell}
                          >
                            <IconButton
                              // disabled={!isAuditor||isOrgAdmin}
                              onClick={() => {
                                addData();
                              }}
                            >
                              {i === dataSource.length - 1 ? (
                                <CreateIcon
                                  style={{
                                    fontSize: "15px",
                                  }}
                                />
                              ) : null}
                            </IconButton>

                            <IconButton
                              // disabled={!isLocAdmin|| !isAuditor}
                              onClick={() => {
                                handleDelete(i);
                              }}
                              style={{ fontSize: "20px" }}
                            >
                              <AiOutlineMinusCircle
                                style={{ fontSize: "16px", color: " #002b80" }}
                              />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      {/* <TableCell>
                        <TextField
                          key="agenda"
                          name="agenda"
                          placeholder="Agenda"
                          disabled={readStatus}
                          onChange={(e) =>
                            handleKeyAgenda(e.target.value, dataSource?.length)
                          }
                          // Add your onChange handler here
                        />
                      </TableCell>
                      <TableCell>
                        <Autocomplete
                          multiple
                          options={suggestions}
                          disabled={readStatus}
                          getOptionLabel={(option: any) => option.email}
                          onChange={(e, value) =>
                            handlechangeOwner(value, dataSource?.length)
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              variant="outlined"
                              placeholder="Agenda Owners"
                              size="small"
                              onChange={handleTextChange}
                              InputLabelProps={{ shrink: false }}
                            />
                          )}
                        />
                      </TableCell> */}
                      <TableCell>
                        <Tooltip title={"Add Adhoc Agenda"}>
                          <IconButton onClick={addData}>
                            <CreateIcon style={{ fontSize: "30px" }} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>

          {/* <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item label="Attendees: " name="attendees">
             
                <Autocomplete
                  key={`attendees`}
                  multiple={true}
                  options={suggestions}
                  getOptionLabel={(option: any) => {
                    return option["email"];
                  }}
                  getOptionSelected={(option, value) => option.id === value.id}
                  limitTags={2}
                  size="small"
                  onChange={(e, value) => handleAttendees(value)}
                  defaultValue={totalAttendees}
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
                        placeholder={"attendees"}
                        onChange={handleTextChange}
                        size="small"
                        InputLabelProps={{ shrink: false }}
                        disabled={showData ? false : true}
                      />
                    );
                  }}
                />
              </Form.Item>
            </Col>
          </Row> */}
        </Form>
      )}
    </>
  );
};

export default MeetingAgendaNotes;
