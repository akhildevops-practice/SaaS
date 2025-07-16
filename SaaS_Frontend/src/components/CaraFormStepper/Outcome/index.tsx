import {
  IconButton,
  makeStyles,
  Typography,
  useMediaQuery,
} from "@material-ui/core";

import { Col, Form, Input, Row, Select, Upload } from "antd";

import type { UploadProps } from "antd";
import { useSnackbar } from "notistack";
import CrossIcon from "assets/icons/BluecrossIcon.svg";

import { useEffect, useState } from "react";

import { API_LINK } from "config";
import axios from "apis/axios.global";

import dayjs from "dayjs";

import { validateTitle } from "utils/validateInput";

const { Dragger } = Upload;
const { Option } = Select;
const { TextArea } = Input;

const useStyles = (matches: any) =>
  makeStyles((theme) => ({
    root: {
      width: "100%",
      "& .MuiAccordionDetails-root": {
        display: "block",
      },
    },
    heading: {
      fontSize: theme.typography.pxToRem(15),
      flexBasis: "33.33%",
      flexShrink: 0,
    },
    label: {
      verticalAlign: "middle",
    },
    submitBtn: {
      backgroundColor: "#003566 !important",
      height: "36px",
      color: "#fff",
      alignItems: "center",
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
        background: "white !important",
        backgroundColor: "white !important",
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
        backgroundColor: "white !important",
      },
      "& .ant-select-disabled .ant-select-arrow": {
        display: "none",
      },
    },
    filename: {
      fontSize: theme.typography.pxToRem(12),
      color: theme.palette.primary.light,
      textOverflow: "ellipsis",
      overflow: "hidden",
      width: "160px",
      whiteSpace: "nowrap",
      cursor: "pointer",
      "&:hover": {
        cursor: "pointer", // Change cursor to pointer on hover
      },
    },
    secondaryHeading: {
      fontSize: theme.typography.pxToRem(15),
      color: theme.palette.text.secondary,
    },
    uploadSection: {
      width: matches ? "460px" : "200px", // Adjust the width as needed
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
    previewFont: {
      fontSize: theme.typography.pxToRem(13),
      color: theme.palette.primary.light,
      textDecoration: "none",
      fontWeight: 600,
      marginLeft: theme.typography.pxToRem(20),
    },
    form__section1: {
      // border: "0.5rem solid #F7F7FF",
      // borderRadius: "10px",
      padding: "1rem 1.5rem",
      [theme.breakpoints.down("sm")]: {
        padding: "1rem",
      },
      margin: "1rem 0",
      minWidth: "100%",
    },
    labelStyle: {
      "& .ant-input-lg": {
        border: "1px solid #dadada",
      },
      "& .ant-form-item .ant-form-item-label > label": {
        color: "#003566",
        fontWeight: "bold",
        letterSpacing: "0.8px",
        // Add any other styles you want to apply to the <label> element
      },
    },
  }));
type Props = {
  uploadFileError?: any;
  setUploadFileError?: any;

  formData?: any;
  setFormData?: any;
  isEdit?: any;
  readMode?: boolean;

  setOutcome: any;
  refForCapaFormOutComeTab2?: any;
  refForCapaFormOutComeTab3?: any;
  refForCapaFormOutComeTab4?: any;
};
const Outcome = ({
  formData,
  setFormData,
  isEdit,
  readMode,

  refForCapaFormOutComeTab2,
  refForCapaFormOutComeTab3,
  refForCapaFormOutComeTab4,
}: Props) => {
  const matches = useMediaQuery("(min-width:786px)");
  const classes = useStyles(matches)();

  const [fileList, setFileList] = useState<any>([]);
  const { enqueueSnackbar } = useSnackbar();
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [uploadFileError, setUploadFileError] = useState<boolean>(false);
  const loggedInUser = JSON.parse(sessionStorage.getItem("userDetails") as any);

  const [click, setClick] = useState<boolean>(false);
  const [initialFileList, setInitialFileList] = useState([]);
  // useEffect(() => {
  //   console.log("formdata in caroutcome", formData);
  // }, []);
  const [CaraOutcomeform] = Form.useForm();
  useEffect(() => {
    if (isEdit === false) {
      CaraOutcomeform?.resetFields();
    } else {
      CaraOutcomeform.setFieldsValue({
        correctiveAction: formData?.correctiveAction,
        actualCorrectiveAction: formData?.actualCorrectiveAction,
        correctedDate: formData?.correctedDate
          ? formData?.correctedDate
          : dayjs().format("YYYY-MM-DD"),
        attachments: formData?.attachments,
      });
    }
  }, [isEdit]);
  // console.log("formdata in co", formData);

  useEffect(() => {
    if (formData?.attachments) {
      setFileList(formData?.attachments);
      setInitialFileList(formData?.attachments);
    }
  }, []);
  useEffect(() => {
    handleFileChange(fileList);
  }, [fileList]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;

    // Perform validation
    validateTitle(null, value, (error) => {
      if (error) {
        // Handle the validation error (e.g., set an error state or show a message)
        console.error(error);
        // You can set an error state if needed
        // setError(error);
      } else {
        // Update form data if no error
        setFormData((prevFormData: any) => ({
          ...prevFormData,
          [name]: value,
        }));
      }
    });
  };
  const uploadFileprops: UploadProps = {
    action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
    multiple: true,
    beforeUpload: () => false,
    onRemove: (file) => {
      const updatedFileList = formData.files.filter(
        (item: any) => item.uid !== file.uid
      );
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        attachments: updatedFileList,
      }));
    },
    onChange({ file, fileList }) {
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        attachments: fileList,
      }));
    },
  };
  const arraysAreEqual = (array1: any, array2: any) => {
    if (array1?.length !== array2?.length) {
      return false;
    }

    for (let i = 0; i < array1?.length; i++) {
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
  };

  const handleDateChange = (e: any) => {
    const selectedDate = dayjs(e.target.value);

    if (selectedDate.isAfter(dayjs(), "day")) {
      setFormData({
        ...formData,
        correctedDate: dayjs().format("YYYY-MM-DD"),
      });
    } else {
      setFormData({
        ...formData,
        correctedDate: e.target.value,
      });
    }
  };
  const clearFile = async (data: any) => {
    try {
      // console.log("data in clearfile", data);

      const updatedFileList = formData.files.filter(
        (item: any) => item.uid !== data.uid
      );
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        files: updatedFileList,
      }));
    } catch (error) {
      console.error("Error in clearFile:", error);
      return error;
    }
  };

  const handleUpload = (file: any) => {
    return false; // Prevent default upload action
  };
  const viewObjectStorageDoc = async (link: any) => {
    const response = await axios.post(`${API_LINK}/api/documents/viewerOBJ`, {
      documentLink: link,
    });
    return response.data;
  };

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

  return (
    <Form
      form={CaraOutcomeform}
      layout="vertical"
      // initialValues={{

      // }}
      //disabled={formData?.status === "OPEN" || !formData?.status}
      rootClassName={classes.labelStyle}
      style={{ margin: "20px 50px" }}
      /* other props */
    >
      <div>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item
              label={`Actual Corrective Action :`}
              name="actualCorrectiveAction"
              style={{
                paddingBottom: "2rem",
                fontSize: "15px",
                fontWeight: "bold",
                color: "#003566",
                paddingTop: "10px",
              }}
              className={classes.disabledInput}
              rules={[
                {
                  required: true,
                },
                {
                  validator: validateTitle,
                },
              ]}
            >
              {/* <div ref={refForCapaFormOutComeTab2}> */}
              <TextArea
                rows={4}
                name="actualCorrectiveAction"
                onChange={(e) => handleInputChange(e)}
                value={formData?.actualCorrectiveAction}
                disabled={
                  readMode ||
                  formData?.status === "Open" ||
                  formData?.status === "Analysis_In_Progress" ||
                  formData?.status === "Draft" ||
                  formData?.status === "Closed" ||
                  formData?.status === "Accepted" ||
                  formData?.status === "Rejected" ||
                  formData?.status === ""
                }
              />
              {/* </div> */}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={matches ? 12 : 24}>
            <Form.Item
              label={`Corrective Action Date:`}
              name="correctedDate"
              style={{
                paddingBottom: "2rem",
                fontSize: "15px",
                fontWeight: "bold",
                color: "#003566",
                paddingTop: "10px",
              }}
              className={classes.disabledInput}
            >
              {/* <div ref={refForCapaFormOutComeTab3}> */}
              <Input
                name="correctedDate"
                size="large"
                onChange={handleDateChange}
                value={dayjs(formData.correctedDate).format("YYYY-MM-DD")}
                type="date"
                disabled={
                  readMode ||
                  formData?.status === "Open" ||
                  formData?.status === "Analysis_In_Progress" ||
                  formData?.status === "Draft" ||
                  formData?.status === "Closed" ||
                  formData?.status === "Accepted" ||
                  formData?.status === "Rejected" ||
                  formData?.status === ""
                }
                max={dayjs().format("YYYY-MM-DD")} // Set max attribute to current date
              />
              {/* </div> */}
            </Form.Item>
          </Col>
        </Row>
      </div>
      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Form.Item
            // name="fileList"
            help={uploadFileError ? "Please upload a file!" : ""}
            validateStatus={uploadFileError ? "error" : ""}
            style={{ marginBottom: "-10px" }}
          >
            {/* <div ref={refForCapaFormOutComeTab4}> */}
            <Dragger
              accept=".pdf,.png,.jpeg,.jpg,.docx,.bmp,.tif,.tiff,.webp"
              name="fileList"
              {...uploadFileprops}
              className={`${classes.uploadSection} ant-upload-drag-container`}
              showUploadList={false}
              fileList={formData.attachments}
              multiple
            >
              {/* <p className="ant-upload-drag-icon">
                  <InboxIcon />
                </p> */}
              <p className="ant-upload-text">Upload Files</p>
            </Dragger>
            {/* </div> */}
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
                disabled={
                  readMode ||
                  formData?.status === "Open" ||
                  formData?.status === "Analysis_In_Progress" ||
                  formData?.status === "Draft" ||
                  formData?.status === "Closed" ||
                  formData?.status === "Accepted" ||
                  formData?.status === "Rejected"
                }
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
          formData.attachments?.length > 0 &&
          formData.attachments?.map((item: any) => (
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
                disabled={
                  readMode ||
                  formData?.status === "Open" ||
                  formData?.status === "Analysis_In_Progress" ||
                  formData?.status === "Draft" ||
                  formData?.status === "Closed" ||
                  formData?.status === "Accepted" ||
                  formData?.status === ""
                }
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
  );
};

export default Outcome;
