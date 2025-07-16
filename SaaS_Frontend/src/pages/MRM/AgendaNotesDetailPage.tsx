import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Row,
  Col,
  Button,
  Spin,
} from "antd";
import getAppUrl from "../../utils/getAppUrl";
import axios from "../../apis/axios.global";
import { useSnackbar } from "notistack";
import { Autocomplete } from "@material-ui/lab";
import MenuItem from "@material-ui/core/MenuItem";
import {
  Avatar,
  ListItemAvatar,
  ListItemText,
  TextField,
  makeStyles,
  Collapse,
} from "@material-ui/core";
import { API_LINK } from "../../config";
import { debounce } from "lodash";
import { AiOutlinePlusCircle } from "react-icons/ai";
import ArrowDropDown from "../../assets/TeamDropdown.svg";
import checkRoles from "../../utils/checkRoles";

type Props = {
  formData?: any;
  setFormData?: any;
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
const AgendaNotesDetailPage = ({ formData, setFormData }: Props) => {
  const [firstForm] = Form.useForm();
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isMR = checkRoles("MR");

  const showData = isOrgAdmin || isMR;

  const [dataSource, setDataSource] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [suggestions, setSuggestions] = React.useState([]);
  const [collapseDiv, setCollapseDiv] = useState(true);
  const [totalAttendees, setTotalAttendees] = useState<any>([]);
  const [documentForm] = Form.useForm();
  const classes = useStyles();

  const orgId = sessionStorage.getItem("orgId");
  const realmName = getAppUrl();
  const { enqueueSnackbar } = useSnackbar();

  console.log("formdata ", formData);
  useEffect(() => {
    setLoading(true);
    const newData = { ...formData };
    let newDataSource: any = [],
      newAttendes: any = [],
      attendeesName: any = [];

    const datavalues = newData?.dataValue
      ? newData.dataValue
      : newData?.keyadendaDataValues
      ? newData.keyadendaDataValues
      : [];
    if (datavalues && datavalues.length) {
      for (let i = 0; i < datavalues.length; i++) {
        const newValue = datavalues[i];

        newDataSource.push({
          agenda: newValue?.agenda || newValue?.name,
          keyagendaId: newValue?._id,
          owner: newValue?.owner,
          decisionPoints: newValue?.decisionPoints
            ? newValue.decisionPoints
            : "",
        });

        if (newData?.attendees && newData.attendees.length) {
          newAttendes = [...newData.attendees];
        } else {
          for (let j = 0; j < newValue?.mrmData?.participants.length; j++) {
            const newAttendeValue = newValue?.mrmData?.participants[j];
            if (!attendeesName.includes(newAttendeValue?.id)) {
              attendeesName.push(newAttendeValue?.id);
              newAttendes.push(newAttendeValue);
            }
          }
        }
      }
    }

    setTotalAttendees([...newAttendes]);
    setDataSource(newDataSource);
    setLoading(false);
    setFormData({
      ...formData,
      attendees: newAttendes,
      dataValue: newDataSource,
    });
  }, []);

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
    console.log("Received values of form:", values);
  };

  const toggleDiv = () => {
    setCollapseDiv(!collapseDiv);
  };

  const addData = () => {
    const newSource: any = [...dataSource];
    newSource.push({
      agenda: "",
      keyagendaId: "",
      owner: [],
      decisionPoints: "",
    });

    setDataSource(newSource);
  };

  const handleAttendees = (values: any) => {
    setFormData({ ...formData, attendees: values });
  };

  const handlechangeOwner = (value: any, key: number) => {
    const newDatasource = [...dataSource];
    newDatasource[key].owner = [...value];

    setDataSource(newDatasource);
    setFormData({ ...formData, dataValue: newDatasource });
  };

  const removeData = (index: number) => {
    const newDatasource = [...dataSource];
    if (index > -1) {
      // only splice array when item is found
      newDatasource.splice(index, 1); // 2nd parameter means remove one item only
      setDataSource(newDatasource);
    }
  };

  const handleKeyAgenda = (value: any, key: number) => {
    console.log("value in handle", value);
    const newDatasource = [...dataSource];
    if (!dataSource || key < 0 || key >= dataSource.length) {
      console.error("Invalid dataSource or key");
      return;
    }

    //console.log("newDatasource in agenda", newDatasource);
    newDatasource[key].agenda = value;

    setDataSource(newDatasource);
    setFormData({ ...formData, dataValue: newDatasource });
  };

  const handleDecisionPoints = (value: any, key: number) => {
    const newDatasource = [...dataSource];
    newDatasource[key].decisionPoints = value;

    setDataSource(newDatasource);
    setFormData({ ...formData, dataValue: newDatasource });
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
          <Collapse in={collapseDiv}>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Form.List name="users" initialValue={dataSource}>
                  {(fields, { add, remove }) => (
                    <>
                      {fields?.map(({ key, name, ...restField }) => (
                        <>
                          {/* <Space key={key} style={{ display: 'flex'}} align="baseline"> */}
                          <Row gutter={[16, 16]} key={key}>
                            <Col span={12}>
                              <Form.Item
                                {...restField}
                                name={[name, "agenda"]}
                                label="Agenda"
                                rules={[
                                  { required: true, message: "Enter Agenda" },
                                ]}
                              >
                                <Input
                                  placeholder="Agenda"
                                  onBlur={(e: any) =>
                                    handleKeyAgenda(e.target?.value, key)
                                  }
                                  disabled={showData ? false : true}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item {...restField} name={[name, "owner"]}>
                                <label>Agenda Owners</label>
                                <Autocomplete
                                  key={`owner_${key}`}
                                  multiple={true}
                                  options={suggestions}
                                  getOptionLabel={(option: any) => {
                                    return option["email"];
                                  }}
                                  getOptionSelected={(option, value) =>
                                    option.id === value.id
                                  }
                                  limitTags={2}
                                  size="small"
                                  disabled={showData ? false : true}
                                  onChange={(e, value) =>
                                    handlechangeOwner(value, key)
                                  }
                                  defaultValue={
                                    dataSource &&
                                    dataSource.length &&
                                    dataSource[key] &&
                                    dataSource[key]?.owner
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
                                        disabled={showData ? false : true}
                                        InputLabelProps={{ shrink: false }}
                                      />
                                    );
                                  }}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                          {/* </Space> */}
                          {/* <Row gutter={[16, 16]}>

                                                        <Col span={20}>
                                                            <Form.Item
                                                                {...restField}
                                                                label='Decision Points'
                                                                name={[name, 'decisionPoints']}
                                                                rules={[{ required: true, message: 'Enter decision points' }]}
                                                            >

                                                                <TextArea autoSize={{ minRows: 2 }} onBlur={(e) => handleDecisionPoints(e.target.value, key)} />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={4}>

                                                            <MinusCircleOutlined style={{ marginTop: '80%' }} onClick={() => { remove(name); removeData(name) }} />
                                                        </Col>

                                                    </Row> */}
                        </>
                      ))}
                      <Form.Item>
                        <Button
                          type="dashed"
                          onClick={() => {
                            add();
                            addData();
                          }}
                          block
                          icon={<AiOutlinePlusCircle />}
                        >
                          Add Agenda
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
              </Col>
            </Row>
          </Collapse>

          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item label="Attendees: " name="attendees">
                {/* <label>Attendees</label>     */}
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
          </Row>

          {/* <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Form.Item label="Meeting Minutes">
                                <MyEditor formData={formData} setFormData={setFormData} title="mom" />
                            </Form.Item>
                        </Col>
                    </Row> */}
        </Form>
      )}
    </>
  );
};

export default AgendaNotesDetailPage;
