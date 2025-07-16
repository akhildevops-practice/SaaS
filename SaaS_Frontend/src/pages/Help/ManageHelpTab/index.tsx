import { Button, Col, Form, Input, Row, Select, Upload } from "antd";
// import Dragger from "antd/es/upload/Dragger";
import { useEffect, useRef, useState } from "react";

import { helpFormData } from "recoil/atom";
import { useRecoilState } from "recoil";
import { Theme, makeStyles } from "@material-ui/core";
import type { UploadProps } from "antd";
import { MdInbox } from 'react-icons/md';
import DraggableList from "./DraggrableList";
import axios from "apis/axios.global";
import { API_LINK } from "../../../config";
import { useSnackbar } from "notistack";

const useStyles = makeStyles<Theme>((theme: Theme) => ({
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
      backgroundColor: "#808080",
    },
  },
}));



const ManageHelpTab = () => {
  const [formData, setFormData] = useRecoilState<any>(helpFormData);
  const [helpData, setHelpData] = useState<any>(null);
  const [firstForm] = Form.useForm();
  const [fileList, setFileList] = useState<any>();
  const { Dragger } = Upload;
  const [selectedTopics, setSelectedTopics] = useState<any>([]);
  const [topicSelected, setTopicSelected] = useState<any>([]);
  const [edit, setEdit] = useState<boolean>(false)
  const [modules, setModules] = useState<any>([]);
  const isInitialRender = useRef(true);
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    setEdit(true)
    setHelpData(topicSelected)
    firstForm.setFieldsValue({ topic: topicSelected.topic })
  }, [topicSelected]);

  const handleSubmit = async () => {
    if (fileList[0] || edit) {
      const formData = new FormData();
      let response;

      if (edit) {
        formData.append("file", fileList[0]?.originFileObj);
        formData.append("topic", helpData?.topic);

        response = await axios.put(
          `${API_LINK}/api/moduleHelp/updateTopic/${helpData._id}`,
          formData
        );
      } else {
        formData.append("file", fileList[0]?.originFileObj);
        formData.append("moduleId", helpData?.moduleId);
        formData.append("topic", helpData?.topic);

        response = await axios.post(
          `${API_LINK}/api/moduleHelp/createTopic`,
          formData
        );
      }

      if (response.status === 200 || response.status === 201) {
        enqueueSnackbar("Topic created Sucessfully", {
          variant: "success",
        });
      }

      setFormData([...formData, helpData]);
      firstForm.setFieldsValue({ topic: "" })
      setFileList([])
      setEdit(false)
      getAllTopics(helpData.moduleId)
    } else {
      enqueueSnackbar("Please Attach a File", {
        variant: "warning",
      });
    }
  };

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

  const selectChange = (e: any) => {
    getAllTopics(e);
    firstForm.setFieldsValue({ topic: "" })
    setEdit(false)
    setFileList([])
  };

  const getAllTopics = async (moduleId: any = "") => {
    try {
      const response = await axios.get(
        API_LINK + `/api/moduleHelp/getTopicsByModuleId/${moduleId}`
      );
      const topicData = response.data;

      setSelectedTopics(topicData?.map((item: any, index: any) => ({
        ...item,
        id: index.toString(),
      })));
    } catch (error) {
      console.error("ERROR ", error)
    }
  };

  useEffect(() => {
    getModules();
  }, []);

  const getModules = async () => {
    try {
      const response = await axios.get(
        API_LINK + "/api/moduleHelp/getAllModules"
      );
      const modulesData = response.data;
      setModules(modulesData);
    } catch (error) {
      console.error("ERROR ", error)
    }
  };

  return (
    <>
      <div style={{ display: "flex" }}>
        <div style={{ flex: "1" }}>
          <Form
            form={firstForm}
            layout="vertical"
            rootClassName={classes.labelStyle}
            onValuesChange={(changedValues, allValues) => {
              setHelpData({ ...helpData, ...changedValues });
            }}
            // onSubmitCapture={handleSubmit}
            onFinish={handleSubmit}
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item label="Module " name="moduleId">
                  <Select
                    // value={helpData?.module}
                    // options={data}
                    value={helpData}
                    onChange={selectChange}
                  >
                    {modules.map((module: any) => (
                      <Select.Option key={module._id} value={module._id}>
                        {module.module}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Form.Item label="Topic " name="topic">
                  <Input
                    size="large"
                    value={helpData?.topic}
                  />
                </Form.Item>
              </Col>
            </Row>

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
                    //   multiple={false}
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

            <Form.Item name="submit" >
              <Button type="primary" htmlType="submit">
                {edit ? "Edit" : "Submit"}
              </Button>
            </Form.Item>
          </Form>
        </div>
        <div style={{ width: "1px", height: "67vh", backgroundColor: "grey", margin: "0px 50px" }}>

        </div>
        <div
          style={{
            flex: "1",
            // marginLeft: "100px",
            height: "66.5vh",
            overflow: "auto",
          }}
          className={classes.scroolBar}
        >
          <DraggableList
            selectedTopics={selectedTopics}
            setSelectedTopics={setSelectedTopics}
            topicSelected={topicSelected}
            setTopicSelected={setTopicSelected}
          />
        </div>
      </div>
    </>
  );
};

export default ManageHelpTab;
