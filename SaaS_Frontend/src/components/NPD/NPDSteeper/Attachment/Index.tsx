import React, { useState } from 'react'
import useStyles from "../styles";
import { Descriptions, Form, UploadProps} from "antd";
import Dragger from 'antd/es/upload/Dragger';
import { MdInbox } from 'react-icons/md';
import { MdClear } from 'react-icons/md';
import Typography from "@material-ui/core/Typography";
import { IconButton } from '@material-ui/core';


const AttachmentIndex = () => {
const classes:any = useStyles();
const [fileList, setFileList] = useState<any[]>([]);
const [uploadLoading, setUploadLoading] = useState<boolean>(false);

const uploadFileprops: UploadProps = {
    action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
    multiple: true,
    beforeUpload: () => false,
    onChange({ file, fileList }) {
      setFileList(fileList);
      // setFormData({ ...formData, attachFiles: fileList });
    },
  };

  const clearFile = async (data: any) => {
    try {
      if (data && data?.uid) {
        setFileList((previousFiles) =>
          previousFiles?.filter((item: any) => item.uid !== data.uid)
        );
        //  console.log("filelist after update", fileList);
        // setFormData((prevFormData: any) => ({
        //   ...prevFormData,
        //   attachments: prevFormData?.attachments?.filter(
        //     (item: any) => item.uid !== data.uid
        //   ),
        // }));

        // Assuming data.uid is a valid identifier for your file
        // let result = await axios.post(`${API_LINK}/api/mrm/attachment/delete`, {
        //   path: data.uid,
        // });
        // return result;
      }
    } catch (error) {
      return error;
    }
  };

  return (
    <div>
    <div className={classes.descriptionLabelStyle}>
        <Form layout="vertical">
          <Descriptions
            bordered
            size="small"
            // style={{width:"800px"}}
            column={{
              xxl: 2,
              xl: 2,
              lg: 2,
              md: 1,
              sm: 2,
              xs: 2,
            }}
          >
             <Descriptions.Item span={12} label="Approval Evidence: ">
              <Form.Item
                // name="type"
                rules={[
                  {
                    required: true,
                    message: "Approval Evidence",
                  },
                ]}
                style={{ marginBottom: 0 }}
              >
                <div>
                <Dragger
                accept=".pdf,.png,.jpeg,.jpg,.docx,.bmp,.tif,.tiff,.webp,.xlsx, .ppt"
                name="fileList"
                {...uploadFileprops}
                className={classes.uploadSection}
                showUploadList={false}
                fileList={fileList}
                multiple
                style={{ width: "550px" }}
                // disabled={readModeButton}
              >
                <p className="ant-upload-drag-icon">
                  <MdInbox />
                </p>
                <p className="ant-upload-text">
                  Click or drag files to this area to upload
                </p>
              </Dragger>
              {uploadLoading ? (
                <div>Please wait while documents get uploaded</div>
              ) : (
                fileList &&
                fileList?.length > 0 &&
                fileList?.map((item: any) => (
                  <div
                    style={{
                      display: "flex",
                      marginLeft: "10px",
                      alignItems: "center",
                    }}
                    key={item.uid}
                  >
                    <Typography className={classes.filename}>
                      {item?.name}
                    </Typography>

                    <IconButton onClick={() => clearFile(item)}>
                      <MdClear style={{ fontSize: "15px" }} />
                    </IconButton>
                  </div>
                ))
              )}
                </div>
              </Form.Item>
            </Descriptions.Item>
            <Descriptions.Item span={12} label="Feasibility study: ">
              <Form.Item
                // name="type"
                rules={[
                  {
                    required: true,
                    message: "Feasibility study",
                  },
                ]}
                style={{ marginBottom: 0 }}
              >
                <div>
                <Dragger
                accept=".pdf,.png,.jpeg,.jpg,.docx,.bmp,.tif,.tiff,.webp,.xlsx, .ppt"
                name="fileList"
                {...uploadFileprops}
                className={classes.uploadSection}
                showUploadList={false}
                fileList={fileList}
                multiple
                style={{ width: "550px" }}
                // disabled={readModeButton}
              >
                <p className="ant-upload-drag-icon">
                  <MdInbox />
                </p>
                <p className="ant-upload-text">
                  Click or drag files to this area to upload
                </p>
              </Dragger>
              {uploadLoading ? (
                <div>Please wait while documents get uploaded</div>
              ) : (
                fileList &&
                fileList?.length > 0 &&
                fileList?.map((item: any) => (
                  <div
                    style={{
                      display: "flex",
                      marginLeft: "10px",
                      alignItems: "center",
                    }}
                    key={item.uid}
                  >
                    <Typography className={classes.filename}>
                      {item?.name}
                    </Typography>

                    <IconButton onClick={() => clearFile(item)}>
                      <MdClear style={{ fontSize: "15px" }} />
                    </IconButton>
                  </div>
                ))
              )}
                </div>
              </Form.Item>
            </Descriptions.Item>
            <Descriptions.Item span={12} label="Others: ">
              <Form.Item
                // name="type"
                rules={[
                  {
                    required: true,
                    message: "Others",
                  },
                ]}
                style={{ marginBottom: 0 }}
              >
                <div>
                <Dragger
                accept=".pdf,.png,.jpeg,.jpg,.docx,.bmp,.tif,.tiff,.webp,.xlsx, .ppt"
                name="fileList"
                {...uploadFileprops}
                className={classes.uploadSection}
                showUploadList={false}
                fileList={fileList}
                multiple
                style={{ width: "550px" }}
                // disabled={readModeButton}
              >
                <p className="ant-upload-drag-icon">
                  <MdInbox />
                </p>
                <p className="ant-upload-text">
                  Click or drag files to this area to upload
                </p>
              </Dragger>
              {uploadLoading ? (
                <div>Please wait while documents get uploaded</div>
              ) : (
                fileList &&
                fileList?.length > 0 &&
                fileList?.map((item: any) => (
                  <div
                    style={{
                      display: "flex",
                      marginLeft: "10px",
                      alignItems: "center",
                    }}
                    key={item.uid}
                  >
                    <Typography className={classes.filename}>
                      {item?.name}
                    </Typography>

                    <IconButton onClick={() => clearFile(item)}>
                      <MdClear style={{ fontSize: "15px" }} />
                    </IconButton>
                  </div>
                ))
              )}
                </div>
              </Form.Item>
            </Descriptions.Item>
            </Descriptions>  
            </Form>
            </div>  
    </div>
  )
}

export default AttachmentIndex;