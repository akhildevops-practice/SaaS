import React, { useEffect, useState } from "react";
import { Form, Input, Row, Col, Select, Upload } from "antd";
import axios from "../../../apis/axios.global";

import MyEditor from "../Editor";
import {
  makeStyles,
  TextField,
  Typography,
  IconButton,
  Grid,
  useMediaQuery,
} from "@material-ui/core";
import { debounce } from "lodash";
import { API_LINK } from "../../../config";
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
  editDataMeeting: any;
  readMode: any;
  setUpload: any;
};
let typeAheadValue: string;
let typeAheadType: string;

const useStyles = (matches: any) =>
  makeStyles((theme) => ({
    formTextPadding: {
      paddingBottom: theme.typography.pxToRem(10),
      fontSize: theme.typography.pxToRem(14),
      color: "#003566",
    },
    submitBtn: {
      backgroundColor: "#003566 !important",
      height: "36px",
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
    disabledTextField: {
      "& .MuiInputBase-root.Mui-disabled": {
        // border: "none",
        backgroundColor: "white !important",
        color: "black",
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
    root: {
      width: "100%",
      "& .MuiAccordionDetails-root": {
        display: "block",
      },
    },
    uploadSection: {
      width: matches ? "600px" : "100%", // Adjust the width as needed
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

const MeetingEditingTab = ({
  formData,
  setFormData,
  data,
  index,
  editDataMeeting,
  readMode,
  setUpload,
}: Props) => {
  const matches = useMediaQuery("(min-width:786px)");
  const [firstForm] = Form.useForm();

  const [uploadFileError, setUploadFileError] = useState<any>(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);

  const classes = useStyles(matches)();

  const userInfo = JSON.parse(sessionStorage.getItem("userDetails") as string);

  const [initialFileList, setInitialFileList] = useState([]);

  const [selectedDate, setSelectedDate] = useState();

  const [access, setAccess] = useState<boolean>(false);

  useEffect(() => {
    editDataMeeting?.createdBy?.id === userInfo?.id
      ? setAccess(true)
      : setAccess(false);
    setFormData({
      ...formData,
      meetingdate: editDataMeeting?.meetingdate,
      period: data?.meetingSchedule?.period,
      createdBy: editDataMeeting?.createdBy?.id,
      organizationId: data?.organizationId,
      meetingName: data?.meetingName,
      venue: data?.venue,
      attachments: data?.attachments,
      participants: editDataMeeting?.participants,
      externalparticipants: editDataMeeting?.externalparticipants,
      minutesofMeeting: data.minutesofMeeting,
      meetingSchedule: editDataMeeting?.meetingSchedule?._id,
      locationId: editDataMeeting?.locationId,
    });
    firstForm.setFieldsValue({
      meetingdate: editDataMeeting?.meetingdate,
      period: data?.meetingSchedule?.period,
      createdBy: editDataMeeting?.createdBy?.id,
      organizationId: data?.organizationId,
      meetingName: data?.meetingName,
      venue: data?.venue,
      attachments: data?.attachments,
      participants: editDataMeeting?.participants,
      externalparticipants: editDataMeeting?.externalparticipants,
      minutesofMeeting: data.minutesofMeeting,
      meetingSchedule: editDataMeeting?.meetingSchedule?._id,
      locationId: editDataMeeting?.locationId,
    });
    setFileList(data?.attachments);
    setInitialFileList(data?.attachments);
  }, [data, editDataMeeting]);
  // console.log("access", access);
  const viewObjectStorageDoc = async (link: any) => {
    const response = await axios.post(`${API_LINK}/api/documents/viewerOBJ`, {
      documentLink: link,
    });
    return response.data;
  };
  // console.log("data i  editmeeting", data);
  const handleLinkClick = async (item: any) => {
    const finalLink =
      process.env.REACT_APP_IS_OBJECT_STORAGE === "false"
        ? item?.url
        : await viewObjectStorageDoc(item?.url);
    const anchor = document.createElement("a");
    anchor.href = finalLink || "#";
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.click();
    // Your custom logic for link click goes here
    // event.preventDefault();
  };
  // const validateTitle = (
  //   rule: any,
  //   value: string,
  //   callback: (error?: string) => void
  // ) => {
  //   // Define regex pattern for allowed characters
  //   // const normalizedValue = value.trim().replace(/\s+/g, " ");
  //   const TITLE_REGEX =
  //     /^[\u0000-\u007F\u0080-\uFFFFa-zA-Z0-9$&*()\-/\.,\?&%!#@€£`'"\~]+$/; // Allows letters, numbers, and specific symbols, but does not include < and >

  //   // Check for disallowed characters
  //   const DISALLOWED_CHARS = /[<>]/;

  //   // Check for more than two consecutive special characters
  //   const MORE_THAN_TWO_CONSECUTIVE_SPECIAL_CHARS =
  //     /[\/\-\.\$\€\£\?\&\*\(\)\%\#\!\@\`\'\"\~\,\s]{3,}/;

  //   // Check if the title starts with a special character
  //   const STARTS_WITH_SPECIAL_CHAR =
  //     /^[\/\-\.\$\€\£\?\&\*\(\)\%\#\!\@\`\'\"\~]/;

  //   if (!value || value.trim().length === 0) {
  //     callback("Text value is required.");
  //   } else if (DISALLOWED_CHARS.test(value)) {
  //     callback("Invalid text. Disallowed characters are < and >.");
  //   } else if (MORE_THAN_TWO_CONSECUTIVE_SPECIAL_CHARS.test(value)) {
  //     callback(
  //       "Invalid text. No more than two consecutive special characters are allowed."
  //     );
  //   } else if (STARTS_WITH_SPECIAL_CHAR.test(value)) {
  //     callback("Invalid text. Text should not start with a special character.");
  //   } else if (!TITLE_REGEX.test(value)) {
  //     callback(
  //       "Invalid text. Allowed characters include letters, numbers, commas, slashes, hyphens, dots, and currency symbols."
  //     );
  //   } else {
  //     callback();
  //   }
  // };

  const handlerVenue = (e: any) => {
    setFormData({
      ...formData,
      venue: e.target.value,
    });
  };
  const handlerMeeting = (e: any) => {
    setFormData({
      ...formData,
      meetingName: e.target.value,
    });
  };

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

  const clearFile = async (data: any) => {
    try {
      // console.log("data in clearfile", data);

      if (data && data?.uid) {
        setFormData((prevFormData: any) => {
          const newAttachments = prevFormData?.attachments?.filter(
            (item: any) => item?.uid !== data?.uid
          );
          // console.log("formData after clearing", newAttachments);

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

  const handleDateChange = (e: any) => {
    setFormData({
      ...formData,
      meetingdate: e.target.value,
    });
    setSelectedDate(e.target.value);
  };

  const [userOptions, setUserOptions] = useState([]);

  const getUserOptions = async (value: any, type: string) => {
    await axios
      .get(
        `/api/documents/filerValue?searchLocation=&searchBusinessType=&searchEntity=&searchSystems=&searchDoctype=&searchUser=${value}`
      )
      .then((res) => {
        const ops = res?.data?.allUser?.map((obj: any) => ({
          id: obj.id,
          name: obj.username,
          avatar: obj.avatar,
          email: obj.email,
          username: obj.username,
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
        <Row
          gutter={[16, 16]}
          style={{ display: "flex", flexDirection: matches ? "row" : "column" }}
        >
          <Col span={matches ? 12 : 24}>
            <Grid item sm={12} md={5} className={classes.formTextPadding}>
              <strong>
                <span className={classes.asterisk}>*</span>
                <span className={classes.label}>MoM : </span>
              </strong>
            </Grid>
            <Form.Item
              name="meetingName"
              rules={[{ validator: validateTitle }]}
              className={classes.disabledInput}
            >
              <Input
                value={formData?.meetingName}
                defaultValue={formData?.meetingName}
                placeholder="Meeting Title"
                name="meetingName"
                disabled={readMode || !access}
                onBlur={(e) => {
                  handlerMeeting(e);
                }}
              />
            </Form.Item>
          </Col>
          <Col span={matches ? 12 : 24}>
            <Grid item sm={12} md={5} className={classes.formTextPadding}>
              <strong>
                <span className={classes.asterisk}>*</span>
                <span className={classes.label}>Meeting Date: </span>
              </strong>
            </Grid>
            <Form.Item
              name="meetingdate"
              rules={[{ required: true, message: "Please Select Date!" }]}
              className={classes.disabledTextField}
            >
              <TextField
                fullWidth
                className={classes.textField}
                disabled={readMode || !access}
                type="datetime-local"
                name="meetingdate"
                value={formData?.meetingdate.replace(" ", "T")}
                onChange={(e) => {
                  handleDateChange(e);
                }}
                size="small"
                required
                inputProps={{
                  max:
                    new Date().toISOString().split("T")[0] +
                    "T" +
                    new Date()
                      .toLocaleTimeString("en-US", { hour12: false })
                      .slice(0, -3),
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row
          gutter={[16, 16]}
          style={{ display: "flex", flexDirection: matches ? "row" : "column" }}
        >
          <Col span={matches ? 16 : 24}>
            <Grid item sm={12} md={5} className={classes.formTextPadding}>
              <strong>
                <span className={classes.asterisk}>*</span>{" "}
                <span className={classes.label}> Meeting Venue: </span>
              </strong>
            </Grid>
            <Form.Item
              name="venue"
              rules={[{ validator: validateTitle }]}
              className={classes.disabledInput}
            >
              <Input
                value={formData?.venue}
                defaultValue={formData?.venue}
                placeholder="Meeting Venue"
                name="venue"
                disabled={readMode || !access}
                onBlur={(e) => {
                  handlerVenue(e);
                }}
              />
            </Form.Item>
          </Col>
          <Col span={matches ? 8 : 24}>
            <Grid item sm={12} md={5} className={classes.formTextPadding}>
              <strong>
                {/* <span className={classes.asterisk}>*</span>{" "} */}
                <span className={classes.label}>Period: </span>
              </strong>
            </Grid>
            <Form.Item name="period" className={classes.disabledInput}>
              <Input
                value={formData?.period}
                disabled={true}
                name="period"
                placeholder={formData?.period}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Grid item sm={12} md={5} className={classes.formTextPadding}>
              <strong>
                <span className={classes.label}>
                  List of Scheduled Internal Participants:{" "}
                </span>
              </strong>
            </Grid>
            <Form.Item name="attendees" className={classes.disabledInput}>
              <Input
                value={
                  data?.meetingSchedule?.attendees
                    ? data?.meetingSchedule?.attendees
                        .map((att: any) => att?.username)
                        .join(", ")
                    : ""
                }
                disabled={true}
                placeholder={
                  data?.meetingSchedule?.attendees
                    ? data?.meetingSchedule?.attendees
                        .map((att: any) => att.username)
                        .join(", ")
                    : ""
                }
                defaultValue={
                  data?.meetingSchedule?.attendees
                    ? data?.meetingSchedule?.attendees
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
            <Form.Item
              name="externalattendees"
              className={classes.disabledInput}
            >
              <Input
                value={
                  data?.meetingSchedule?.externalattendees
                    ? data?.meetingSchedule?.externalattendees.join(", ")
                    : ""
                }
                disabled={true}
                placeholder={
                  data?.meetingSchedule?.externalattendees
                    ? data?.meetingSchedule?.externalattendees.join(", ")
                    : ""
                }
                defaultValue={
                  data?.meetingSchedule?.externalattendees
                    ? data?.meetingSchedule?.externalattendees.join(", ")
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
              name="participants"
              // tooltip="This is a required field"
              rules={[{ required: true, message: "Please Select Attendees!" }]}
            >
              <AutoComplete
                suggestionList={userOptions ? userOptions : []}
                name="participants"
                keyName="participants"
                labelKey="name"
                formData={formData}
                setFormData={setFormData}
                disabled={readMode || !access}
                getSuggestionList={getSuggestionListUser}
                defaultValue={
                  editDataMeeting && editDataMeeting?.participants?.length
                    ? editDataMeeting?.participants
                    : []
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
                disabled={readMode || !access}
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
                {/* <span className={classes.asterisk}>*</span>{" "} */}
                <span className={classes.label}>Minutes of Meeting: </span>
              </strong>
            </Grid>
            <Form.Item
            // name="minutesofMeeting"
            // rules={[{ validator: validateTitle }]}
            >
              <MyEditor
                formData={formData}
                setFormData={setFormData}
                title="descriptionMrm"
                // data={data}
                readMode={readMode}
                readStatus={undefined}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={matches ? 16 : 24}>
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
                fileList={formData?.attachments}
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
                <Typography
                  className={classes.filename}
                  onClick={() => handleLinkClick(item)}
                >
                  {item?.name}
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

export default MeetingEditingTab;
