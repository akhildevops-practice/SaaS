import { useEffect, useState } from "react";
import useStyles from "../commonDrawerStyles";
import { useMediaQuery } from "@material-ui/core";
import axios from "../../../apis/axios.global";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Row,
  Col,
  DatePicker,
  Select,
  Upload,
} from "antd";
import { Autocomplete } from "@material-ui/lab";
import {
  Avatar,
  IconButton,
  ListItemAvatar,
  ListItemText,
  TextField,
  MenuItem,
  Typography,
} from "@material-ui/core";
import { MdInbox } from 'react-icons/md';
//notistack
import { useSnackbar } from "notistack";
import moment from "moment";
import { API_LINK } from "../../../config";
import { debounce } from "lodash";
import getAppUrl from "../../../utils/getAppUrl";
import type { UploadProps } from "antd";
import CrossIcon from "../../../assets/icons/BluecrossIcon.svg";
import checkRoles from "../../../utils/checkRoles";

const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;

let typeAheadValue: string;
let typeAheadType: string;

type Props = {
  openActionPointDrawer: any;
  setOpenActionPointDrawer: any;
  setAgendaData: any;
  agendaData: any;
  addNew: boolean;
  setFormData: any;
  formData: any;
  edit?: any;
};

const AddActionPoint = ({
  openActionPointDrawer,
  setOpenActionPointDrawer,
  setAgendaData,
  agendaData,
  addNew,
  formData,
  setFormData,
  edit,
}: Props) => {
  const modalData = openActionPointDrawer?.data;
  const checkOwner = openActionPointDrawer?.checkOwner;
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isMR = checkRoles("MR");

  const showData = isOrgAdmin || isMR;
  const [uploadFileError, setUploadFileError] = useState<boolean>(false);
  const [firstForm] = Form.useForm();
  const [suggestions, setSuggestions] = useState([]);
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);

  const realmName = getAppUrl();

  useEffect(() => {
    firstForm.resetFields();

    setAgendaData({
      agenda: "",
      decisionPoints: "",
      owner: [],
    });

    setFileList([]);
  }, [addNew]);

  useEffect(() => {
    if (edit) {
      firstForm.setFieldsValue({
        keyagenda: modalData?.agenda,
        decisionpoints: modalData?.decisionPoint,
        actionpoints: modalData?.actionPoint,
        date: moment(modalData?.dueDate),
        owner: modalData?.owner,
        description: modalData?.description,
      });
      setAgendaData({
        agenda: modalData?.agenda,
        decisionPoints: modalData?.decisionPoint,
        owner: modalData?.owner,
      });
      if (modalData?.files && modalData.files.length) {
        setFileList(modalData.files);
        firstForm.setFieldsValue({ documentLink: modalData.files });
        setFormData({ ...formData, files: modalData.files });
      }
    }
  }, []);

  const navigate = useNavigate();

  const orgId = sessionStorage.getItem("orgId");
  const userId = sessionStorage.getItem("user_info");

  const { enqueueSnackbar } = useSnackbar();

  const classes = useStyles();
  const isSmallScreen = useMediaQuery("(max-width:600px)");

  const handleKeyAgenda = (value: any) => {
    const newData = modalData?.value?.keyAgendaId[value];
    setAgendaData(newData);
    // firstForm.setFieldsValue({ decisionpoints: newData?.decisionPoints });
    setFormData({ ...formData, owner: newData?.owner });
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

  const uploadFileprops: UploadProps = {
    action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
    multiple: false,
    beforeUpload: () => {
      return false;
    },
    onChange({ file, fileList }) {
      if (
        file.status !== "uploading" &&
        file.status !== "removed" &&
        file.status !== "error"
      ) {
        addSelectedFile(file.originFileObj || file, file, fileList);
      }
    },
  };

  const addSelectedFile = async (
    file: any,
    addedFile: any,
    addedFileList: any
  ) => {
    setUploadLoading(true);

    const formDataFile = new FormData();
    formDataFile.append("file", file);
    const res = await axios.post(
      `${API_LINK}/api/mrm/attachment/action-point`,
      formDataFile
    );
    if (res.status === 200 || res.status === 201) {
      let previousFiles: any = addedFileList;
      previousFiles =
        previousFiles.length &&
        previousFiles.map((item: any) =>
          item.uid === file.uid
            ? { ...item, url: res.data.path, name: res.data.name }
            : { ...item }
        );
      setFileList(previousFiles);
      setFormData({ ...formData, files: previousFiles });
      firstForm.setFieldsValue({ documentLink: previousFiles });
      setUploadLoading(false);
    }
  };

  const handleChangeOwners = (value: any) => {
    setAgendaData({ ...agendaData, owner: value });
    setFormData({ ...formData, owner: value });
  };

  const clearFile = async (data: any) => {
    try {
      let previousFiles: any = fileList;
      previousFiles =
        previousFiles.length &&
        previousFiles.filter((item: any) => item.uid !== data.uid);
      setFileList(previousFiles);
      setFormData({ ...formData, files: previousFiles });
      if (data && data?.url) {
        const result = await axios.post(`${API_LINK}/api/mrm/attachment/delete`, {
          path: data.url,
        });
        return result;
      }
    } catch (error) {
      return error;
    }
  };

  return (
    <>
      <div className={classes.title}>{`Action Item for ${
        modalData?.value?.meetingName || ""
      }`}</div>
      <br />
      <Form
        form={firstForm}
        layout="vertical"
        onValuesChange={(changedValues, allValues) => setFormData(allValues)}
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item
              label="Agenda"
              name="keyagenda"
              // tooltip="This is a required field"
              rules={[{ required: true, message: "Please Select keyagenda!" }]}
            >
              <Select
                allowClear
                style={{ width: "100%" }}
                placeholder="Please select key agenda"
                onChange={handleKeyAgenda}
                disabled={edit ? true : false}
              >
                {modalData?.value?.keyAgendaId.map(
                  (item: any, index: number) => {
                    return (
                      <Option value={index} key={index}>
                        {item?.agenda}
                      </Option>
                    );
                  }
                )}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item
              label="Decision Points"
              name="decisionpoints"
              // tooltip="This is a required field"
              rules={[
                { required: false, message: "Please add decision points!" },
              ]}
            >
              <TextArea
                disabled={showData ? false : checkOwner ? false : true}
                autoSize={{ minRows: 4 }}
                value={agendaData?.decisionPoints}
              />
            </Form.Item>
          </Col>
        </Row>
        <hr />
        <Row gutter={[16, 16]}>
          <Col span={14}>
            <Form.Item
              label="Action Point"
              name="actionpoints"
              // tooltip="This is a required field"
              rules={[{ required: true, message: "Please add action points!" }]}
            >
              <TextArea
                autoSize={{ minRows: 2 }}
                disabled={showData ? false : checkOwner ? false : true}
              />
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item label="Owner">
              {suggestions && (
                <Autocomplete
                  key={`owner`}
                  multiple={true}
                  options={suggestions}
                  onChange={(e, value) => {
                    handleChangeOwners(value);
                  }}
                  // style={{width : '300px'}}
                  getOptionLabel={(option: any) => {
                    return option["email"];
                  }}
                  getOptionSelected={(option, value) => option.id === value.id}
                  limitTags={2}
                  size="small"
                  value={agendaData?.owner}
                  // defaultValue={data?.owner}
                  filterSelectedOptions
                  disabled={showData ? false : checkOwner ? false : true}
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
                        // label={'Owners'}
                        placeholder={"Owners"}
                        onChange={handleTextChange}
                        disabled={showData ? false : checkOwner ? false : true}
                        size="small"
                      />
                    );
                  }}
                />
              )}
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={14}>
            <Form.Item
              label="Description"
              name="description"
              // tooltip="This is a required field"
              rules={[
                {
                  required: false,
                  message: "Please add action point description!",
                },
              ]}
            >
              <TextArea
                autoSize={{ minRows: 2 }}
                disabled={showData ? false : checkOwner ? false : true}
              />
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item
              label="Due Date: "
              name="date"
              // tooltip="This is a required field"
              rules={[{ required: true, message: "Please Select Date!" }]}
            >
              <DatePicker
                style={{ width: "100%" }}
                disabled={showData ? false : checkOwner ? false : true}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item
              name="documentLink"
              label={
                fileList.length ? "Change Uploaded File" : "Attach File: "
              }
              help={uploadFileError ? "Please upload a file!" : ""}
              validateStatus={uploadFileError ? "error" : ""}
            >
              <Dragger
                accept=".pdf,.png,.jpeg,.jpg,.docx,.bmp,.tif,.tiff,.webp"
                name="documentLink"
                {...uploadFileprops}
                className={classes.uploadSection}
                showUploadList={false}
                disabled={showData ? false : checkOwner ? false : true}
                fileList={fileList}
              >
                <p className="ant-upload-drag-icon">
                  <MdInbox />
                </p>
                <p className="ant-upload-text">
                  Click or drag file to this area to upload
                </p>
              </Dragger>
            </Form.Item>

            {uploadLoading ? (
              <div>Please wait while document gets uploaded </div>
            ) : (
              fileList &&
              fileList.length > 0 &&
              fileList.map((item: any) => (
                <div
                  style={{
                    display: "flex",
                    marginLeft: "10px",
                    alignItems: "center",
                  }}
                >
                  <Typography className={classes.filename}>
                    <a
                      href={`${API_LINK}${item?.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item?.name}
                    </a>
                  </Typography>

                  <IconButton onClick={() => clearFile(item)}>
                    <img src={CrossIcon} alt="" />
                  </IconButton>
                </div>
              ))
            )}
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default AddActionPoint;
