//react, react-router
import { useEffect } from "react";

//antd
import { Col, Form, Input, Row, Upload } from "antd";
import type { UploadProps } from "antd";

//material-ui
import { makeStyles } from "@material-ui/core";
import { MdInbox } from 'react-icons/md';

//antd constants
const { Dragger } = Upload;


const useStyles = makeStyles((theme) => ({
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
  drawer?: any;
  fileList?: any;
  setFileList?: any;
  existingUploadedFiles?: any;
};
const AttachmetsTab = ({
  drawer,
  fileList,
  setFileList,
  existingUploadedFiles,
}: Props) => {
  const classes = useStyles();

  console.log("fileList", fileList);

  useEffect(() => {
    if (existingUploadedFiles && existingUploadedFiles.length > 0) {
      const formattedFileList = existingUploadedFiles.map((file:any, index:any) => ({
        uid: `-1${index}`, // Unique identifier for each file
        name: file.attachmentName, // Name to display in the list
        status: 'done', // Mark as already uploaded
        url: file.attachmentUrl, // URL to access the file
      }));
      setFileList(formattedFileList); // Set the fileList state with the formatted list
    }
  }, [existingUploadedFiles, setFileList]);

  const uploadProps: UploadProps = {
    multiple: true, // Set to true to allow multiple file uploads
    beforeUpload: () => false,
    onChange({ file, fileList }) {
      if (
        file.status !== "uploading" &&
        file.status !== "removed" &&
        file.status !== "error"
      ) {
        setFileList(fileList); // Set the entire file list instead of a single file
      }
    },
    onRemove: (file) => {
      // if (!!existingFiles && existingFiles.length > 0) {
      //   setExistingFiles((prevState: any) =>
      //     prevState.filter((f: any) => f.uid !== file.uid)
      //   ); // Update the existingFiles state to remove the specific fil
      // }
      setFileList((prevState: any) =>
        prevState.filter((f: any) => f.uid !== file.uid)
      ); // Remove the specific file from the list
    },
    // fileList: formData?.file && formData.file.uid ? [formData.file] : [],
  };

  return (
    <Form layout="vertical" rootClassName={classes.labelStyle}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Form.Item name="uploader" style={{ display: "none" }}>
            <Input />
          </Form.Item>
          <Form.Item name="attachments" label={"Attach File: "}>
            <Dragger
              name="attachments"
              {...uploadProps}
              className={classes.uploadSection}
              multiple
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
        </Col>
      </Row>
    </Form>
  );
};

export default AttachmetsTab;
