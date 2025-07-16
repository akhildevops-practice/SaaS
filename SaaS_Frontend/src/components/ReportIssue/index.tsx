import { Theme, makeStyles } from "@material-ui/core";
import { Button, Col, Form, Row, Select, Typography } from "antd";
import TextArea from "antd/es/input/TextArea";
import Dragger from "antd/es/upload/Dragger";

import { MdInbox } from 'react-icons/md';
import { useEffect, useState } from "react";
import axios from "apis/axios.global";
import getAppUrl from "../../utils/getAppUrl";
import { useNavigate } from "react-router-dom";
import { API_LINK } from "config";
import { useSnackbar } from "notistack";
import type { UploadProps } from "antd";
import CustomAlertOk from "./CustomAlertOk";

// import Button from "@material-ui/core/Button"

const useStyles = makeStyles<Theme>((theme: Theme) => ({
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
  item: {
    marginBottom: "15px",
    color: "#003566",
    fontWeight: 600,
    fontSize: "13px",
    letterSpacing: ".8px",
    transition: "text-decoration 0.3s", // Add transition effect for smooth animation
    "&:hover": {
      textDecoration: "underline", // Add underline on hover
    },
  },
  scroolBar: {
    "&::-webkit-scrollbar": {
      width: "8px",
      height: "8px",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "#b3ccff",
    },
  },
  locSearchBox: {
    width: "100%",
    [theme.breakpoints.down("sm")]: {
      marginTop: theme.typography.pxToRem(10),
    },
  },
  searchBoxText: {
    fontSize: theme.typography.pxToRem(13),
  },
}));

const ReportIssue = () => {
  const userInfo = JSON.parse(sessionStorage.getItem("userDetails") as string);

  const classes = useStyles();
  const [formData, setFormData] = useState<any>({});
  const realmName = getAppUrl();
  const [activeModules, setActiveModules] = useState<any>();
  const uniqueModules = [...new Set(activeModules)];
  const [firstForm] = Form.useForm();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [fileList, setFileList] = useState<any>();
  const [open, setOpen] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);

  const uploadProps: UploadProps = {
    multiple: false,
    beforeUpload: () => false,
    onChange({ file, fileList }) {
      const latestFileList = fileList.slice(-1);
      setFileList(latestFileList);
    },
    onRemove: (file) => {
      setFileList([]);
    },
    fileList: fileList,
  };
  useEffect(() => {
    console.log("formdata", formData);
  }, [formData]);
  const handleFinish = async () => {
    const filedata = new FormData();
    filedata.append("attachment", fileList[0]?.originFileObj);
    filedata.append("createdBy", userInfo.id);
    filedata.append("organizationId", userInfo.organizationId);
    filedata.append("severity", formData.severity);
    filedata.append("moduleName", formData.moduleName);
    filedata.append("description", formData?.description);

    // let payload = {
    //   createdBy: userInfo.id,
    //   organizationId: userInfo.organizationId,
    //   severity: formData.severity,
    //   moduleName: formData.moduleName,
    //   description: formData.description,
    //   attachment: filedata,
    // };
    console.log("payload file", filedata);
    try {
      const result = await axios.post(
        API_LINK +
          `/api/ticketSupport/send?realm=${realmName}&locationName=${userInfo.location.locationName}`,
        filedata
      );
      if (result.status === 200 || result.status === 201) {
        enqueueSnackbar("Ticket created Sucessfully", {
          variant: "success",
        });
        setOpenAlert(true);
      }
    } catch (err) {
      console.log("Ticket Submitted");
    }

    firstForm.setFieldsValue({
      severity: "",
      moduleName: "",
      description: "",
      attachment: "",
    });
    setFileList([]);
  };

  const filterOption = (
    input: string,
    option?: { label: string; value: string }
  ) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  useEffect(() => {
    getActiveModules();
  }, []);

  const getActiveModules = async () => {
    const result = await axios(
      `/api/organization/getAllActiveModules/${realmName}`
    );
    // console.log("result", result);
    setActiveModules(result.data.activeModules);
  };

  //
  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  return (
    <>
      <CustomAlertOk open={openAlert} handleClose={handleCloseAlert} />
      <div>
        <div>
          <Form
            layout="vertical"
            rootClassName={classes.labelStyle}
            onValuesChange={(changedValues, allValues) => {
              setFormData({ ...formData, ...changedValues });
            }}
            onFinish={handleFinish}
            form={firstForm}
          >
            <div>
              <div
                style={{
                  margin: "0px",
                  display: "flex",
                  justifyContent: "space-between",

                  backgroundColor: "#E8F3F9",
                  padding: "0px 20px",
                  borderBottom: "1px solid #C0C0C0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ display: "flex", gap: "10px" }}>
                    <Typography
                      style={{
                        color: "#003566",
                        fontWeight: "bold",
                        letterSpacing: "0.8px",
                      }}
                    >
                      Created By :
                    </Typography>
                    <Typography>{userInfo.fullName}</Typography>
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <Typography
                      style={{
                        color: "#003566",
                        fontWeight: "bold",
                        letterSpacing: "0.8px",
                      }}
                    >
                      Location :
                    </Typography>
                    <Typography>{userInfo.location.locationName}</Typography>
                  </div>
                </div>
                <div
                  style={{ display: "flex", gap: "10px", alignItems: "center" }}
                >
                  <Form.Item name="submit" style={{ marginTop: "22.4px" }}>
                    <Button type="primary" htmlType="submit">
                      Submit
                    </Button>
                  </Form.Item>

                  <div>
                    <Button type="primary" onClick={() => navigate(-1)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ margin: "20px" }}>
              <Row gutter={[16, 16]}>
                <Col span={6}>
                  <Form.Item
                    label="Select Module "
                    name="moduleName"
                    rules={[
                      { required: true, message: "Please select a module" },
                    ]}
                  >
                    <Select
                      showSearch
                      placeholder="Select a Module"
                      optionFilterProp="children"
                    >
                      {uniqueModules &&
                        uniqueModules.map((module:any, index:any) => (
                          <Select.Option key={index} value={module}>
                            {module}
                          </Select.Option>
                        ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col span={6}>
                  <Form.Item
                    label="Severity"
                    name="severity"
                    rules={[
                      { required: true, message: "Please select a severity" },
                    ]}
                  >
                    <Select
                      placeholder="Select a severity"
                      options={[
                        { value: "Low", label: "Low" },
                        { value: "Medium", label: "Medium" },
                        { value: "High", label: "High" },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col span={18}>
                  <Form.Item
                    label="Briefly Describe The Issue "
                    name="description"
                    rules={[
                      { required: true, message: "Please Describe the Issue" },
                    ]}
                  >
                    <TextArea rows={10} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col span={18}>
                  <Form.Item label="Attach File: " name="attachment">
                    <Dragger
                      name="attachment"
                      {...uploadProps}
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
            </div>
          </Form>
        </div>
      </div>
    </>
  );
};

export default ReportIssue;
