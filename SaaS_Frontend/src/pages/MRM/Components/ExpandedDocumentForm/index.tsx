import { makeStyles } from "@material-ui/core";
import {
  Col,
  Form,
  Input,
  Row,
  Select,
  Upload,
} from "antd";
import type { UploadProps } from "antd";

//mui
import { MdExpandMore } from 'react-icons/md';
import { MdInbox } from 'react-icons/md';
import { useState } from "react";
const { TextArea } = Input;
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
}));

const ExpandedDocumentForm = () => {
  const classes = useStyles();
  const [expanded, setExpanded] = useState<any>(false);
  const handleChange = (panel: any) => (event: any, isExpanded: any) => {
    setExpanded(isExpanded ? panel : false);
  };
  const StyledExpandMoreIcon = ({ rotate }: { rotate: number }) => {
    const iconStyle = {
      transform: `rotate(${rotate}deg)`,
      transition: "transform 0.3s ease-in-out",
    };

    return <MdExpandMore style={iconStyle} />;
  };
  const uploadProps: UploadProps = {
    action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
    onChange({ file, fileList }) {
      if (file.status !== "uploading") {
        console.log(file, fileList);
      }
    },
    defaultFileList: [],
  };
  return (
    <Form
      // form={firstForm}
      layout="vertical"
      // onValuesChange={(changedValues, allValues) => setFormData(allValues)}
    >
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Form.Item label="Name: " name="name" required>
            <Input placeholder="Enter Document Name" size="large" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Form.Item label="System: " name="system" required>
            <Select
              placeholder="Select System"
              mode="multiple"
              // options={entityOptions}
              size="large"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Document Type: " name="docType" required>
            <Select
              placeholder="Select Doc Type"
              // options={entityOptions}
              size="large"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Form.Item
            label="Reason for Creation/Amendment*: "
            name="reasonOfCreation"
          >
            <TextArea rows={1} placeholder="Enter Reason" size="large" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Form.Item label="Description: " name="description">
            <TextArea
              rows={1}
              placeholder="Enter Document Description"
              size="large"
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Form.Item label="Document Tags: " name="tags" required>
            <Select
              mode="multiple"
              allowClear
              placeholder="Please select"
              // defaultValue={["a10", "c12"]}
              size="large"
              // onChange={handleChange}
              // options={options}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Clauses: " name="tags">
            <Select
              mode="multiple"
              allowClear
              size="large"
              placeholder="Please select"
              // defaultValue={["abc", "xyz"]}
              // onChange={handleChange}
              // options={options}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Form.Item label="Attach File: " required>
            <Dragger
              accept=".pdf,.png,.jpeg,.jpg,.docx,.bmp,.tif,.tiff,.webp"
              {...uploadProps}
            >
              <p className="ant-upload-drag-icon">
                <MdInbox />
              </p>
              <p className="ant-upload-text">
                Click or drag file to this area to upload
              </p>
              <p className="ant-upload-hint">
                Support for a single file upload. Strictly prohibited from
                uploading company data or other banned files.
              </p>
            </Dragger>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default ExpandedDocumentForm;
