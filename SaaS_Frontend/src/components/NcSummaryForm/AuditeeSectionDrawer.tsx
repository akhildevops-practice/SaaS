import { useRef, useState } from "react";


import { MdInbox } from 'react-icons/md';

//antd
import {
  Col,
  Form,
  Input,
  Row,
  Button,
} from "antd";
import type { UploadProps } from "antd";
import { TextField, makeStyles, useMediaQuery } from "@material-ui/core";
import Dragger from "antd/es/upload/Dragger";
import TextArea from "antd/es/input/TextArea";
import moment from "moment";
import Webcam from "react-webcam";
import { AiOutlineCamera } from "react-icons/ai";
const useStyles = makeStyles((theme: any) => ({
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
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  uploadSection: {
    "& .ant-upload-list-item-name": {
      color: "blue !important",
    },
  },
  chips: {
    display: "flex",
    flexWrap: "wrap",
  },
  chip: {
    margin: 2,
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
  dateInput: {
    border: "1px solid #bbb",
    paddingLeft: "10px",
    paddingRight: "10px",
    borderRadius: "5px",
    "& .MuiInput-underline:before": {
      borderBottom: "none", // Remove the bottom border
    },
    "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
      borderBottom: "none", // Remove the hover border
    },
    "& .MuiInput-underline:after": {
      borderBottom: "none", // Remove the focus border
    },
  },
}));

type Props = {
  auditeeData?: any;
  setAuditeeData?: any;
  disabled?: any;
  auditDate?: any;
  template?: any;
  setTemplate?: any;
  refForListOfFindingsForm2?: any;
  refForListOfFindingsForm3?: any;
  refForListOfFindingsForm4?: any;
  refForListOfFindingsForm5?: any;
  refForListOfFindingsForm6?: any;
  refForListOfFindingsForm7?: any;
  refForListOfFindingsForm8?: any;
  refForListOfFindingsForm9?: any;
  refForListOfFindingsForm10?: any;
  refForListOfFindingsForm11?: any;
};

const AuditeeSectionDrawer = ({
  auditeeData,
  setAuditeeData,
  disabled,
  auditDate,
  template,
  setTemplate,
  refForListOfFindingsForm2,
  refForListOfFindingsForm3,
  refForListOfFindingsForm4,
  refForListOfFindingsForm5,
  refForListOfFindingsForm6,
  refForListOfFindingsForm7,
  refForListOfFindingsForm8,
  refForListOfFindingsForm9,
  refForListOfFindingsForm10,
  refForListOfFindingsForm11,
}: Props) => {
  const matches = useMediaQuery("(min-width:822px)");
  const smallScreen = useMediaQuery("(min-width:450px)");
  const classes = useStyles();

  const [auditeeForm] = Form.useForm();
  const auditeeChangeHandler = (e: any) => {
    setAuditeeData({
      ...auditeeData,
      [e.target.name]: e.target.value,
    });
  };

  const uploadProps: UploadProps = {
    multiple: true,
    beforeUpload: () => false,
    fileList: template?.files || [],
    onRemove: (file) => {
      const updatedFileList = template.files.filter(
        (item: any) => item.uid !== file.uid
      );
      setAuditeeData((prevTemplate: any) => ({
        ...prevTemplate,
        proofDocuments: updatedFileList,
      }));
    },
    onChange({ file, fileList }) {
      if (
        file.status !== "uploading" &&
        file.status !== "removed" &&
        file.status !== "error"
      ) {
        setAuditeeData((prevTemplate: any) => ({
          ...prevTemplate,
          proofDocument: fileList,
        }));
      }
    },
  };

  //---------------------------------camera---------------------------------

  const [file, setFile] = useState<any>(null);
  const [capturedImage, setCapturedImage] = useState<any>(null);
  const [isCameraOpen, setIsCameraOpen] = useState<any>(false);
  const webcamRef = useRef<any>(null);

  const handleFileChange = (info: any) => {
    if (info.file.status === "done") {
      setFile(info.file.originFileObj);
      setCapturedImage(null); // Clear captured image if a new file is uploaded
    }
  };

  const handleCapture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    setFile(null); // Clear uploaded file if a new photo is taken
    setIsCameraOpen(false);
  };
  return (
    <Form
      form={auditeeForm}
      layout="vertical"
      rootClassName={classes.labelStyle}
    >
      <Row gutter={[16, 16]}>
        <Col span={matches ? 12 : 24}>
          <Form.Item label="Planned Date Of Correction:">
            <TextField
              disabled={disabled}
              name="targetDate"
              type="date"
              size="small"
              value={auditeeData?.targetDate}
              onChange={auditeeChangeHandler}
              className={classes.dateInput}
              inputProps={{
                style: {
                  fontSize: "14px", // Set the desired font size here
                },

                min: moment(auditDate).format("YYYY-MM-DD"),
              }}
              ref={refForListOfFindingsForm2}
              style={{ width: "90%" }}
            />
          </Form.Item>
        </Col>
        <Col span={matches ? 12 : 24}>
          <Form.Item label="Planned Correction:">
            <div ref={refForListOfFindingsForm3}>
              <TextArea
                name="correction"
                value={auditeeData?.correction}
                onChange={auditeeChangeHandler}
                disabled={disabled}
                rows={3}
              ></TextArea>
            </div>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={matches ? 12 : 24}>
          <Form.Item label="Planned Date Of Corrective Action:">
            <TextField
              disabled={disabled}
              name="date"
              type="date"
              size="small"
              value={auditeeData?.date}
              onChange={auditeeChangeHandler}
              className={classes.dateInput}
              inputProps={{
                style: {
                  fontSize: "14px", // Set the desired font size here
                },

                min: moment(auditDate).format("YYYY-MM-DD"),
              }}
              ref={refForListOfFindingsForm4}
              style={{ width: "90%" }}
            />
          </Form.Item>
        </Col>
        <Col span={matches ? 12 : 24}>
          <Form.Item label="Planned Corrective Action:">
            <div ref={refForListOfFindingsForm5}>
              <TextArea
                name="comment"
                disabled={disabled}
                value={auditeeData?.comment}
                onChange={auditeeChangeHandler}
                rows={3}
              ></TextArea>
            </div>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Form.Item label="Root Cause Analysis:">
            <div ref={refForListOfFindingsForm6}>
              <TextArea
                rows={4}
                onChange={auditeeChangeHandler}
                disabled={disabled}
                name="whyAnalysis"
                value={auditeeData?.whyAnalysis}
              ></TextArea>
            </div>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={matches ? 12 : 24}>
          <Form.Item label="Actual Date Of Correction:">
            <TextField
              className={classes.dateInput}
              name="actualTargetDate"
              type="date"
              size="small"
              disabled={disabled}
              value={auditeeData?.actualTargetDate}
              onChange={auditeeChangeHandler}
              inputProps={{
                style: {
                  fontSize: "14px", // Set the desired font size here
                },

                max: moment(new Date()).format("YYYY-MM-DD"),
              }}
              ref={refForListOfFindingsForm7}
              style={{ width: "90%" }}
            />
          </Form.Item>
        </Col>
        <Col span={matches ? 12 : 24}>
          <Form.Item label="Actual Correction:">
            <div ref={refForListOfFindingsForm8}>
              <TextArea
                onChange={auditeeChangeHandler}
                name="actualCorrection"
                disabled={disabled}
                value={auditeeData?.actualCorrection}
                rows={3}
              ></TextArea>
            </div>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={matches ? 12 : 24}>
          <Form.Item label="Actual Date Of Corrective Action :">
            <TextField
              className={classes.dateInput}
              name="actualDate"
              type="date"
              size="small"
              value={auditeeData?.actualDate}
              disabled={disabled}
              onChange={auditeeChangeHandler}
              inputProps={{
                style: {
                  fontSize: "14px", // Set the desired font size here
                },
                max: moment(new Date()).format("YYYY-MM-DD"),
              }}
              ref={refForListOfFindingsForm9}
              style={{ width: "90%" }}
            />
          </Form.Item>
        </Col>
        <Col span={matches ? 12 : 24}>
          <Form.Item label="Actual Corrective Action:">
            <div ref={refForListOfFindingsForm10}>
              <TextArea
                name="actualComment"
                value={auditeeData?.actualComment}
                disabled={disabled}
                onChange={auditeeChangeHandler}
                rows={4}
              ></TextArea>
            </div>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ paddingTop: "50px" }}>
        <Col span={24}>
          <Form.Item
            name="uploader"
            style={{ display: "none" }} // Hide this input
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="documentLink"
            label={"Attach File"}
            //   label={
            //     formData.file !== "" ? "Change Uploaded File" : "Attach File: "
            //   }
            //   help={uploadFileError ? "Please upload a file!" : ""}
            //   validateStatus={uploadFileError ? "error" : ""}
          >
            <div ref={refForListOfFindingsForm11}>
              <Dragger
                accept=".pdf,.png,.jpeg,.jpg,.docx,.bmp,.tif,.tiff,.webp"
                name="documentLink"
                {...uploadProps}
                disabled={disabled}
                fileList={auditeeData?.proofDocument}
                multiple
                className={classes.uploadSection}
              >
                <p className="ant-upload-drag-icon">
                  <MdInbox />
                </p>
                <p className="ant-upload-text">
                  Click or drag file to this area to upload
                </p>
              </Dragger>
            </div>
          </Form.Item>
        </Col>
      </Row>
      {matches ? (
        ""
      ) : (
        <div>
          <div style={{ marginBottom: "16px" }}>
            <Button
              icon={<AiOutlineCamera />}
              onClick={() => setIsCameraOpen(!isCameraOpen)}
              style={{ marginLeft: "8px" }}
            >
              Use Camera
            </Button>
          </div>

          {isCameraOpen && (
            <div>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                style={{ marginBottom: "16px" }}
              />
              <Button onClick={handleCapture}>Capture Photo</Button>
            </div>
          )}

          {capturedImage && (
            <div>
              <h3>Captured Image:</h3>
              <img
                src={capturedImage}
                alt="Captured"
                style={{ maxWidth: "100%" }}
              />
            </div>
          )}

          {file && (
            <div>
              <h3>Uploaded File:</h3>
              <p>{file.name}</p>
            </div>
          )}
        </div>
       )}
    </Form>
  );
};

export default AuditeeSectionDrawer;
