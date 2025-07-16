import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Row,
  Col,
  Select,
  Upload,
} from "antd";

import axios from "../../../apis/axios.global";
import { useSnackbar } from "notistack";
import MyEditor from "../Editor";
import {
  makeStyles,
  TextField,
  Typography,
  IconButton,
  Grid,
} from "@material-ui/core";
import { debounce } from "lodash";

import type { UploadProps } from "antd";

import CrossIcon from "../../../assets/icons/BluecrossIcon.svg";

import AutoComplete from "components/AutoComplete";

import TextArea from "antd/es/input/TextArea";
import { validateTitle } from "utils/validateInput";

const { Option } = Select;
const { Dragger } = Upload;

type Props = {
  formData?: any;
  setFormData?: any;
  data: any;
  index: any;
  valueById: any;
  year: any;
  setUpload?: any;
};
let typeAheadValue: string;
let typeAheadType: string;

const useStyles = makeStyles((theme) => ({
  formTextPadding: {
    paddingBottom: theme.typography.pxToRem(10),
    fontSize: theme.typography.pxToRem(14),
    color: "#003566",
  },

  submitBtn: {
    backgroundColor: "#003566 !important",
    height: "20px",
    color: "#fff",
  },
  asterisk: {
    color: "red",
    verticalAlign: "end",
  },
  labelStyle: {
    "& .ant-input-lg": {
      border: "1px solid #dadada",
    },
    "& .ant-form-item .ant-form-item-label > label": {
      color: "#003566",
      fontWeight: "bold",
      letterSpacing: "0.8px",
    },
  },

  label: {
    verticalAlign: "middle",
  },

  root: {
    width: "100%",
    "& .MuiAccordionDetails-root": {
      display: "block",
    },
  },
  uploadSection: {
    width: "600px", // Adjust the width as needed
    height: "100px", // Adjust the height as needed

    padding: "20px", // Adjust the padding as needed
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    "& .ant-upload-list-item-name": {
      color: "blue !important",
    },
  },

  filename: {
    fontSize: theme.typography.pxToRem(12),
    color: theme.palette.primary.light,
    textOverflow: "ellipsis",
    overflow: "hidden",
    width: "160px",
    whiteSpace: "nowrap",
  },
  dateField: {
    marginTop: "-8px",
  },
  textField: {
    // marginLeft: theme.spacing(1),
    // marginRight: theme.spacing(1),
    width: "100%",
    height: "30px",
    color: "#EAECEE",
    fontSize: "14px",
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
    borderRadius: "6px",
    paddingTop: "0px",
    paddingBottom: "0px",
    paddingLeft: "2px",
    paddingRight: "2px",
    "& .MuiInputBase-input": {
      fontSize: "14px",
    },

    border: "1px solid #EAECEE",
    "& .MuiInput-underline": {
      "&:before": {
        borderBottom: "none",
      },
      "&:after": {
        borderBottom: "none",
      },
      "&:hover:not(.Mui-disabled):before": {
        borderBottom: "none",
      },
    },
  },
}));

const MeetingAgenda = ({
  formData,
  setFormData,
  data,
  index,
  valueById,
  year,
  setUpload,
}: Props) => {
  const [firstForm] = Form.useForm();
  const previousData = { ...formData };

  const [uploadFileError, setUploadFileError] = useState<any>(false);

  const [fileList, setFileList] = useState<any[]>([]);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [documentForm] = Form.useForm();
  const classes = useStyles();
  const [suggestions, setSuggestions] = React.useState([]);
  const orgId = sessionStorage.getItem("orgId");
  const userInfo = JSON.parse(sessionStorage.getItem("userDetails") as string);
  const { enqueueSnackbar } = useSnackbar();
  const [selectedDate, setSelectedDate] = useState("");
  const [initialFileList, setInitialFileList] = useState([]);
  const [click, setClick] = useState<boolean>(false);

  const handleChange = (e: any) => {
    // console.log("e in handle change", e);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  // console.log("data in meeting creating", data);
  useEffect(() => {
    handleFileChange(fileList);
  }, [fileList]);
  // console.log("data.allData?.value", data.allData);
  useEffect(() => {
    if (data.allData?.value?.date) {
      //this functionality was given to inherit scheuduled date to meeting date
      const dateStr = data?.allData?.value?.date[0]?.date;
      const timeStr = data?.allData?.value?.date[0]?.from;

      const [hours, minutes] = timeStr?.split(":")?.map(Number);
      const date = new Date(dateStr);

      date.setHours(hours);
      date.setMinutes(minutes);
      const timestamp = date.toISOString();

      firstForm.setFieldsValue({
        period: data?.allData?.value?.period,
        meetingName: data?.allData?.value?.meetingName,
        venue: data?.allData?.value?.venue,
        participants: data?.allData?.value?.attendees,
        meetingType: data?.allData?.value?.meetingType,
        meetingdate: formatMeetingDate(timestamp),
      });
      setFormData({
        ...formData,
        period: data?.allData?.value?.period,
        createdBy: userInfo?.id,
        organizationId: data?.allData?.value?.organizationId,
        meetingSchedule: valueById,
        // venue:data?.allData?.value?.venue,
        // participants:data?.allData?.value?.attendees,
        meetingName: data?.allData?.value?.meetingName,
        meetingType: data?.allData?.value?.meetingType,
        meetingdate: formatMeetingDate(timestamp),
        year: year,
        locationId: data?.allData?.value?.unitId,
      });
      setFileList(formData?.attachments);

      setInitialFileList(formData?.attachments);
    }
  }, [data]);

  const uploadFileprops: UploadProps = {
    action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
    multiple: true,
    beforeUpload: () => false,
    onChange({ file, fileList }) {
      // setFileList(fileList);
      setFormData({
        ...formData,
        attachments: fileList,
      });
    },
  };
  //console.log("formdata", formData);

  const formatMeetingDate = (meetingDate: any) => {
    const date = new Date(meetingDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Add leading 0 if needed
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };
  const arraysAreEqual = (array1: any, array2: any) => {
    if (array1?.length !== array2?.length) {
      return false;
    }

    for (let i = 0; i < array1.length; i++) {
      // Deep comparison of array elements
      if (JSON.stringify(array1[i]) !== JSON.stringify(array2[i])) {
        return false;
      }
    }

    return true;
  };
  const handleFileChange = async (fileList: any) => {
    const fileschanged = !arraysAreEqual(fileList, initialFileList);
    // console.log("filechanges value", fileschanged);
    if (fileschanged && !click) {
      // console.log("inside if if handlefilechange");
      setUpload(false);
      // setAnalysis(true);
      // setOutcomeUpload(true);
    } else {
      setUpload(true);
      // setAnalysis(true);
      // setOutcomeUpload(true);
    }
  };

  const clearFile = async (data: any) => {
    try {
      if (data && data?.uid) {
        setFormData((prevFormData: any) => {
          const newAttachments = prevFormData?.attachments?.filter(
            (item: any) => item?.uid !== data?.uid
          );

          return {
            ...prevFormData,
            attachments: newAttachments,
          };
        });
      }
    } catch (error) {
      console.error("Error in clearFile:", error);
      return error;
    }
  };

  const [userOptions, setUserOptions] = useState([]);

  const getUserOptions = async (value: any, type: string) => {
    await axios
      .get(
        `/api/documents/filerValue?searchLocation=&searchBusinessType=&searchEntity=&searchSystems=&searchDoctype=&searchUser=${value}`
      )
      .then((res) => {
        const ops = res?.data?.allUser?.map((obj: any) => ({
          id: obj?.id,
          name: obj?.username,
          avatar: obj?.avatar,
          email: obj?.email,
          username: obj?.username,
        }));
        setUserOptions(ops);
      })
      .catch((err) => console.error(err));
  };
  const getSuggestionListUser = (value: any, type: string) => {
    typeAheadValue = value;
    typeAheadType = type;
    debouncedSearchUser();
  };

  const debouncedSearchUser = debounce(() => {
    getUserOptions(typeAheadValue, typeAheadType);
  }, 50);
  // console.log("data in create meeting tab", data);

  return (
    <>
      <Form
        form={firstForm}
        layout="vertical"
        onValuesChange={(changedValues, allValues) =>
          setFormData({ ...formData, allValues, changedValues })
        }
        initialValues={formData}
      >
        <Row gutter={[16, 16]}>
          <Col span={12}>
            {" "}
            {/* Adjusted span from 16 to 12 */}
            <Grid item sm={12} md={5} className={classes.formTextPadding}>
              <strong>
                <span className={classes.asterisk}>*</span>{" "}
                <span className={classes.label}>MoM : </span>
              </strong>
            </Grid>
            <Form.Item
              name="meetingName"
              rules={[{ validator: validateTitle }]}
            >
              <Input
                placeholder="Meeting Title"
                name="meetingName"
                value={formData.meetingName}
                onChange={(e) => {
                  const updatedMeetingName = e.target.value;
                  setFormData({ ...formData, meetingName: updatedMeetingName });
                  // Update the form field directly
                  firstForm.setFieldsValue({ meetingName: updatedMeetingName });
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            {" "}
            {/* Adjusted span from 8 to 12 */}
            <Grid item sm={12} md={5} className={classes.formTextPadding}>
              <strong>
                <span className={classes.asterisk}>*</span>{" "}
                <span className={classes.label}>Meeting Date: </span>
              </strong>
            </Grid>
            <Form.Item
              rules={[{ required: true, message: "Please Select Date!" }]}
              name="meetingdate"
            >
              <TextField
                fullWidth
                className={classes.textField}
                disabled={false}
                type="datetime-local"
                // name="meetingdate"
                placeholder="Meeting Date"
                // value={formData?.meetingdate}
                onChange={(e) => {
                  // handleChange(e);
                  setFormData({ ...formData, meetingdate: e.target.value });
                }}
                size="small"
                required
                inputProps={{
                  max:
                    new Date().toISOString().split("T")[0] + // Get current date
                    "T" +
                    new Date()
                      .toLocaleTimeString("en-US", { hour12: false })
                      .slice(0, -3), // Get current time
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={16}>
            <Grid item sm={12} md={5} className={classes.formTextPadding}>
              <strong>
                <span className={classes.asterisk}>*</span>{" "}
                <span className={classes.label}> Meeting Venue: </span>
              </strong>
            </Grid>
            <Form.Item name="venue" rules={[{ validator: validateTitle }]}>
              <Input
                placeholder=" Meeting Venue"
                name="venue"
                defaultValue={formData?.venue}
                value={formData?.venue}
                onChange={(e) => {
                  handleChange(e);
                }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Grid item sm={12} md={5} className={classes.formTextPadding}>
              <strong>
                {/* <span className={classes.asterisk}>*</span>{" "} */}
                <span className={classes.label}>Period: </span>
              </strong>
            </Grid>
            <Form.Item name="Period">
              <Input
                value={data?.allData?.value?.period || formData?.period}
                disabled={true}
                // name="period"
                placeholder={data?.allData?.value?.period || formData?.period}
                defaultValue={formData?.period || data?.allData?.value?.period}
              />
            </Form.Item>
          </Col>
        </Row>
        {/* <Row gutter={[16, 16]}>
          <Col span={16}>
            <Grid item sm={12} md={5} className={classes.formTextPadding}>
              <strong>
                <span className={classes.asterisk}>*</span>{" "}
                <span className={classes.label}> Meeting Venue: </span>
              </strong>
            </Grid>
            <Form.Item>
              <Input
                placeholder=" Meeting Venue"
                name="venue"
                defaultValue={formData?.venue}
                value={formData?.venue}
                onChange={(e) => {
                  handleChange(e);
                }}
              />
            </Form.Item>
          </Col>
        </Row> */}
        <Row>
          <Col span={24}>
            <Grid item sm={12} md={5} className={classes.formTextPadding}>
              <strong>
                <span className={classes.label}>
                  List of Scheduled Internal Participants:{" "}
                </span>
              </strong>
            </Grid>
            <Form.Item name="attendees">
              <Input
                value={
                  data?.allData?.value?.attendees
                    ? data?.allData?.value?.attendees
                        .map((att: any) => att?.fullname)
                        .join(", ")
                    : ""
                }
                disabled={true}
                placeholder={
                  data?.allData?.value?.attendees
                    ? data?.allData?.value?.attendees
                        .map((att: any) => att.username)
                        .join(", ")
                    : ""
                }
                defaultValue={
                  data?.allData?.value?.attendees
                    ? data?.allData?.value?.attendees
                        .map((att: any) => att.username)
                        .join(", ")
                    : ""
                }
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Grid item sm={12} md={5} className={classes.formTextPadding}>
              <strong>
                <span className={classes.label}>
                  List of Scheduled External Participants:{" "}
                </span>
              </strong>
            </Grid>
            <Form.Item name="externalattendees">
              <Input
                value={
                  data?.allData?.value?.externalattendees
                    ? data?.allData?.value?.externalattendees.join(", ")
                    : ""
                }
                disabled={true}
                placeholder={
                  data?.allData?.value?.externalattendees
                    ? data?.allData?.value?.externalattendees.join(", ")
                    : ""
                }
                defaultValue={
                  data?.allData?.value?.externalattendees
                    ? data?.allData?.value?.externalattendees.join(", ")
                    : ""
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Grid item sm={12} md={5} className={classes.formTextPadding}>
              <strong>
                <span className={classes.asterisk}>*</span>{" "}
                <span className={classes.label}>
                  List of Internal Attendees:{" "}
                </span>
              </strong>
            </Grid>
            <Form.Item
              // label="List of Participants "
              // name="date"
              // tooltip="This is a required field"

              rules={[{ required: true, message: "Please Select Attendees!" }]}
            >
              <AutoComplete
                suggestionList={userOptions ? userOptions : []}
                name=""
                keyName="participants"
                labelKey="name"
                formData={formData}
                setFormData={setFormData}
                getSuggestionList={getSuggestionListUser}
                defaultValue={
                  formData?.participants
                    ? formData?.participants
                    : data?.allData?.value?.attendees
                }
                type="RA"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Grid item sm={12} md={5} className={classes.formTextPadding}>
              <strong>
                {/* <span className={classes.asterisk}>*</span>{" "} */}
                <span className={classes.label}>
                  List of External Attendees:{" "}
                </span>
              </strong>
            </Grid>
            <Form.Item
              name="externalparticipants"
              rules={[{ validator: validateTitle }]}
            >
              <TextArea
                rows={1}
                autoSize={{ minRows: 1, maxRows: 6 }}
                placeholder="External Attendees"
                size="large"
                name="externalparticipants"
                style={{
                  fontSize: "14px",
                  marginBottom: "10px",
                  padding: "10px",
                }}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  const namesArray = e.target.value
                    .split(",")
                    .map((name) => name.trim()); // Split by commas and trim whitespace
                  setFormData({
                    ...formData,
                    ["externalparticipants"]: namesArray,
                  });
                }}
                value={formData?.externalparticipants?.join(", ") || ""} // Join array elements with commas for display
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Grid item sm={12} md={5} className={classes.formTextPadding}>
              <strong>
                <span className={classes.asterisk}>*</span>{" "}
                <span className={classes.label}>Minutes of Meeting: </span>
              </strong>
            </Grid>
            <Form.Item
              name="minutesofMeeting"
              // rules={[{ validator: validateTitle }]}
            >
              <MyEditor
                formData={formData}
                setFormData={setFormData}
                title="descriptionMrm"
                readStatus={undefined}
                readMode={undefined}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={16}>
            <Form.Item
              // name="fileList"
              help={uploadFileError ? "Please upload a file!" : ""}
              validateStatus={uploadFileError ? "error" : ""}
              style={{ marginBottom: "-10px" }}
            >
              <Dragger
                accept=".pdf,.png,.jpeg,.jpg,.docx,.bmp,.tif,.tiff,.webp"
                name="fileList"
                {...uploadFileprops}
                className={`${classes.uploadSection} ant-upload-drag-container`}
                showUploadList={false}
                fileList={fileList}
                multiple
                // disabled={formData.status === "CA PENDING"}
              >
                {/* <p className="ant-upload-drag-icon">
                <InboxIcon />
              </p> */}
                <p className="ant-upload-text">Select files</p>
              </Dragger>
            </Form.Item>
          </Col>
          {/* <Col span={24}>
            <Tooltip title="Upload files">
              <Button
                type="primary"
                href="#"
                onClick={() => {
                  setClick(true);
                  addSelectedFiles(fileList);
                }}
                className={classes.submitBtn}
                style={{
                  display: "flex",
                  textAlign: "center",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                Upload Files
              </Button>
            </Tooltip>
          </Col> */}
          {/* <Col span={24}>
          <strong>
            <span
              style={{
                color: "red",
                fontSize: "10px",
              }}
            >
              {!!fileList.length
                ? "!!Click on Upload files button to upload"
                : ""}
            </span>
          </strong>
        </Col> */}
        </Row>
        <Row>
          {uploadLoading ? (
            <div>Please wait while documents get uploaded</div>
          ) : (
            formData?.attachments &&
            formData?.attachments?.length > 0 &&
            formData?.attachments?.map((item: any) => (
              <div
                style={{
                  display: "flex",
                  marginLeft: "10px",
                  alignItems: "center",
                }}
                key={item.uid}
              >
                <Typography className={classes.filename}>
                  <a
                    href={`${item?.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item?.name}
                  </a>
                </Typography>

                <IconButton
                  onClick={() => {
                    // console.log("item click");
                    clearFile(item);
                  }}
                >
                  <img src={CrossIcon} alt="" />
                </IconButton>
              </div>
            ))
          )}
        </Row>
      </Form>
    </>
  );
};

export default MeetingAgenda;
