import React, { useState } from "react";
import {
  Form,
  Input,
  Select,
  InputNumber,
  Row,
  Col,
  Drawer,
} from "antd";
import SelectKPI from "./SelectKPI";

const { TextArea } = Input;
const { Option } = Select;

const KPIIntegration = () => {
  const [uomOptions, setUomOptions] = useState<any[]>([]);

  const onFinish = (values: any) => {
    console.log("Form Values:", values);
  };

  const [open, setOpen] = useState(false);

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  // useEffect(() => {
  //   // Extract unique UOM values from submittedData
  //   const uniqueUOMs = Array.from(
  //     new Set(submittedData.map((item: any) => item.uom))
  //   );

  //   // Set UOM options based on the data
  //   if (uniqueUOMs.length === 1) {
  //     setUomOptions([uniqueUOMs[0], "percentage"]);
  //   } else {
  //     setUomOptions(["percentage"]);
  //   }
  // }, [submittedData]);

  return (
    <div>
      {/* <div style={{ width: "97%", display: "flex", justifyContent: "end" }}>
        <Button
          style={{
            marginTop: "20px",
            backgroundColor: "#003059",
            color: "white",
          }}
          onClick={showDrawer}
        >
          Select KPI
        </Button>
      </div> */}
      <div>
        <Form
          layout="vertical"
          onFinish={onFinish}
          style={{ width: "95%", margin: "30px 40px 30px 30px" }}
        >
          {/* First Row */}
          {/* <Form.Item
            label="Source"
            name="source"
            // rules={[{ required: true, message: "Please enter the source!" }]}
          >
            <Input placeholder="Source" disabled style={{ width: "50%" }} />
          </Form.Item> */}

          {/* Second Row */}
          <Form.Item
            label="Description"
            name="description"
            // rules={[{ required: true, message: "Please enter the description!" }]}
          >
            <TextArea
              rows={4}
              placeholder="Description"
              style={{ width: "50%" }}
            />
          </Form.Item>

          {/* Third Row */}
          <Row gutter={16}>
            {/* <Col span={8}>
              <Form.Item
                label="Select KPI's"
                name="kpis"
                // rules={[{ required: true, message: "Please select KPI's!" }]}
              >
                <Select placeholder="Select KPI's">
                  {submittedData?.map((item: any) => (
                    <Option key={item.key} value={item.key}>
                      {item.title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col> */}
            <Col span={8}>
              <Form.Item
                label="Trigger Type"
                name="triggerType"
                // rules={[
                //   { required: true, message: "Please select the trigger type!" },
                // ]}
              >
                <Select placeholder="Select Trigger Type">
                  <Option value="range">Range</Option>
                  <Option value="fixed">Fixed</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Value"
                name="value"
                // rules={[{ required: true, message: "Please enter the value!" }]}
              >
                <Input placeholder="Value" />
              </Form.Item>
            </Col>
          </Row>

          {/* Fourth Row */}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="UOM"
                name="uom"
                // rules={[{ required: true, message: "Please select the UOM!" }]}
              >
                <Select placeholder="Select UOM">
                  {uomOptions.map((uom, index) => (
                    <Option key={index} value={uom}>
                      {uom}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="# of Occurrences for the Trigger"
                name="occurrences"
                // rules={[
                //   {
                //     required: true,
                //     message: "Please enter the number of occurrences!",
                //   },
                // ]}
              >
                <InputNumber
                  placeholder="# of Occurrences"
                  min={1}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="In Days"
                name="inDays"
                // rules={[
                //   { required: true, message: "Please enter the number of days!" },
                // ]}
              >
                <InputNumber
                  placeholder="In Days"
                  min={1}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item> */}
        </Form>
      </div>
      <Drawer title="Select KPI" onClose={onClose} open={open} width="60%">
        <SelectKPI />
      </Drawer>
    </div>
  );
};

export default KPIIntegration;
