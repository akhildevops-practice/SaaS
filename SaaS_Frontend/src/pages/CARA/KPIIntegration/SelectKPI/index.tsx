import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Button,
  Select,
  Space,
  Col,
  Row,
  InputNumber,
  Form,
} from "antd";
import useStyles from "./style";

const { Option } = Select;

const SelectKPI = () => {
  const classes = useStyles();
  const [uomOptions, setUomOptions] = useState<any[]>([]);
  const [submittedData, setSubmittedData] = useState<any>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const [form] = Form.useForm();
  const [deviationType, setDeviationType] = useState<string | undefined>();

  useEffect(() => {
    // Extract unique UOM values from submittedData
    const uniqueUOMs = Array.from(
      new Set(submittedData.map((item: any) => item.uom))
    );

    // Set UOM options based on the data
    if (uniqueUOMs.length === 1) {
      setUomOptions([uniqueUOMs[0], "percentage"]);
    } else {
      setUomOptions(["percentage"]);
    }
  }, [submittedData]);

  useEffect(() => {
    form.setFieldsValue({
      occurrences: selectedRowKeys.length ? 1 : undefined,
    });
  }, [selectedRowKeys, form]);

  const [data, setData] = useState([
    {
      key: "1",
      title: "KPI 1",
      uom: "Kg",
      category: "Category 1",
      objective: "Objective 1",
      frequency: "Monthly",
    },
    {
      key: "2",
      title: "KPI 2",
      uom: "Kg",
      category: "Category 2",
      objective: "Objective 2",
      frequency: "Quarterly",
    },
    {
      key: "3",
      title: "KPI 3",
      uom: "cm",
      category: "Category 3",
      objective: "Objective 3",
      frequency: "Yearly",
    },
    {
      key: "4",
      title: "KPI 2",
      uom: "Kg",
      category: "Category 4",
      objective: "Objective 2",
      frequency: "Quarterly",
    },
    {
      key: "5",
      title: "KPI 3",
      uom: "grams",
      category: "Category 5",
      objective: "Objective 3",
      frequency: "Yearly",
    },
    // Add more rows as needed
  ]);

  const handleRowSelectionChange = (selectedKeys: any) => {
    setSelectedRowKeys(selectedKeys);
  };

  const handleSubmit = () => {
    // Filter data based on selectedRowKeys
    const selectedRows = data.filter((row) =>
      selectedRowKeys.includes(row.key)
    );
    setSubmittedData(selectedRows);
    console.log("Selected Data:", JSON.stringify(selectedRows, null, 2)); // Debugging
  };

  const columns = [
    { title: "KPI Title", dataIndex: "title" },
    { title: "UoM", dataIndex: "uom" },
    { title: "Category", dataIndex: "category" },
    { title: "Objective Title", dataIndex: "objective" },
    { title: "Report Frequency", dataIndex: "frequency" },
  ];

  const onFinish = (values: any) => {
    console.log("Form Values:", values);
  };

  const handleValuesChange = (changedValues: any) => {
    if (changedValues.deviationType) {
      setDeviationType(changedValues.deviationType);
      if (changedValues.deviationType === "range") {
        form.setFieldsValue({ value: [undefined, undefined], uom: undefined });
      } else if (changedValues.deviationType === "target") {
        form.setFieldsValue({ value: undefined, uom: undefined });
      } else {
        form.setFieldsValue({ value: undefined, uom: undefined });
      }
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onValuesChange={handleValuesChange}
          style={{ width: "100%", margin: "0px 10px 20px 10px" }}
          className={classes.form}
          initialValues={{ occurrences: 1 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Deviation Type" name="deviationType">
                <Select
                  placeholder="Select Trigger Type"
                  disabled={!selectedRowKeys.length}
                >
                  <Option value="range">Range</Option>
                  <Option value="fixed">Fixed</Option>
                  <Option value="target">Target</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Value" name="value">
                {deviationType === "range" ? (
                  <Space>
                    <Input
                      placeholder="Min Value"
                      disabled={!selectedRowKeys.length}
                    />
                    <Input
                      placeholder="Max Value"
                      disabled={!selectedRowKeys.length}
                    />
                  </Space>
                ) : (
                  <Input
                    placeholder="Value"
                    disabled={
                      deviationType === "target" || !selectedRowKeys.length
                    }
                  />
                )}
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="UOM" name="uom">
                <Select
                  placeholder="Select UOM"
                  disabled={
                    deviationType === "target" || !selectedRowKeys.length
                  }
                >
                  {uomOptions.map((uom, index) => (
                    <Option key={index} value={uom}>
                      {uom}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="# of Occurrences for the Trigger"
                name="occurrences"
              >
                <InputNumber
                  min={1}
                  style={{ width: "100%" }}
                  disabled={!selectedRowKeys.length}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
      <div style={{ width: "100%", display: "flex", justifyContent: "end" }}>
        <Input.Search
          placeholder="Search"
          style={{ marginBottom: "20px", width: "40%" }}
        />
      </div>
      <div className={classes.tableContainer} style={{ marginTop: "10px" }}>
        <Table
          rowKey="key"
          columns={columns}
          dataSource={data}
          rowSelection={{
            type: "checkbox",
            selectedRowKeys,
            onChange: handleRowSelectionChange,
          }}
          pagination={false}
          className={classes.documentTable}
        />
      </div>

      <Button
        onClick={handleSubmit}
        style={{
          marginTop: "30px",
          backgroundColor: "#005299",
          color: "white",
        }}
      >
        Set
      </Button>
    </div>
  );
};

export default SelectKPI;
