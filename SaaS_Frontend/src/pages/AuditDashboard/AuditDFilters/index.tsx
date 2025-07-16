import { Button, Col, DatePicker, Form, Row, Select } from "antd";
import React, { useEffect, useState } from "react";
import styles from "./styles";
import type { SelectProps } from "antd";
import axios from "apis/axios.global";
import { MdCheckBoxOutlineBlank } from 'react-icons/md';
import { MdCheckBox } from 'react-icons/md';
import { AiOutlineReload } from "react-icons/ai";

type props = {
  setAllChartData?: any;
  selectedUnits?: any;
  setSelectedUnits?: any;
  selectedAuditType?: any;
  setSelectedAuditType?: any;
  getChartData?: any;
  setSelectedDateRange?: any;
  setFormData?: any;
  formData?: any;
};

const AuditDFilters = ({
  setAllChartData,
  selectedUnits,
  setSelectedUnits,
  selectedAuditType,
  setSelectedAuditType,
  getChartData,
  setSelectedDateRange,
  setFormData,
  formData,
}: props) => {
  const classes = styles();
  const userInfo = JSON.parse(sessionStorage.getItem("userDetails") as string);

  const [userLocation, setUserLocation] = useState([]);
  const [userEntity, setUserEntity] = useState<string[]>([]);

  useEffect(() => {
    setUserLocation(userInfo.location);
    setUserEntity([userInfo.entity.entityName]);
  }, []);

  const [selectedBusiness, setSelectedBusiness] = useState(["All"]);

  const [units, setUnits] = useState([]);


  const options: SelectProps["options"] = [];

  for (let i = 10; i < 36; i++) {
    options.push({
      label: i.toString(36) + i,
      value: i.toString(36) + i,
    });
  }
  const { RangePicker } = DatePicker;

  useEffect(() => {
    getAuditType();

    getFunctions();
    getBusiness();
    getStream();
    // getChartData();
    // getEntity();
    // getUnits();
  }, []);
  const [auditType, setAuditType] = useState([]);

  const getAuditType = async () => {
    const response = await axios.get("/api/audits/getAllAuditType");

    setAuditType(response?.data);
  };
  const [selectedFunction, setSelectedFunction] = useState(["All"]);

  const [selectedBusinessType, setSelectedBusinessType] = useState(["All"]);

  const getUnits = async () => {
    const response = await axios.get(
      `/api/audits/getAllLocationForSeletedFunction?functionData[]=${selectedFunction.join(
        "&selectedFunction[]="
      )}&business[]=${selectedBusiness.join(
        "&business[]="
      )}&businessType[]=${selectedBusinessType.join(
        "&selectedBusinessType[]="
      )}`
    );

    setUnits(response?.data);
  };
  const [entity, setEntity] = useState([]);
  const getEntity = async () => {
    const response = await axios.get(
      `/api/audits/getAllEntityForLocation?location[]=${selectedUnits.join(
        "&location[]="
      )}`
    );

    setEntity(response?.data);
  };

  const [functions, setFunctions] = useState([]);
  const getFunctions = async () => {
    const response = await axios.get("/api/audits/getAllFunction");

    setFunctions(response?.data);
  };

  const [business, setBusiness] = useState([]);
  const getBusiness = async () => {
    const response = await axios.get("/api/audits/getAllBusiness");

    setBusiness(response?.data);
  };

  const [stream, setStream] = useState([]);
  const getStream = async () => {
    const response = await axios.get("/api/audits/getAllBusinessType");

    setStream(response?.data);
  };

  const icon = <MdCheckBoxOutlineBlank fontSize="small" />;
  const checkedIcon = <MdCheckBox fontSize="small" />;

  const handleAutocompleteChange = (event: any, value: any) => {
    setFormData({ ...formData, function: value });
  };

  const handleChangeBusiness = (value: any) => {
    setSelectedBusiness(value); // Store selected business IDs
  };

  const handleChangeunits = (value: any) => {
    setSelectedUnits(value);
  };

  const handleUnitClick = () => {
    getUnits();
  };

  const handleEntityClick = () => {
    getEntity();
  };

  // const handleChangeAuditType = (value: any) => {
  //   setSelectedAuditType(value);
  // };

  const handleChangeAuditType = (selectedValues: any) => {
    if (selectedValues.includes("All")) {
      // Select all options if "All" is selected
      console.log(
        "checkdashboard handleJobTitleChange inside all",
        selectedValues
      );

      const allValues = auditType.map((option: any) => option.value);
      setSelectedAuditType(allValues);
      form.setFieldsValue({
        jobTitle: allValues,
      });
    } else if (
      selectedAuditType.length > selectedValues.length &&
      selectedAuditType.includes("All")
    ) {
      console.log(
        "checkdashboard handleJobTitleChange inside else",
        selectedValues
      );
      // If "All" was selected and any option is deselected
      setSelectedAuditType(
        selectedValues.filter((value: any) => value !== "All")
      );
    } else {
      console.log(
        "checkdashboard handleJobTitleChange inside else",
        selectedValues
      );

      setSelectedAuditType(selectedValues);
    }
  };

  const handleApplyFilter = () => {
    getChartData();
  };

  const handleDateChange = (dates: any) => {
    const formattedDates = dates?.map((date: Date) => {
      const [year, month, day] = date.toISOString().split("T")[0].split("-");
      return `${year}-${month}-${day}`;
    });
    setSelectedDateRange(formattedDates);
  };

  const handleChangeFunction = (value: any) => {
    setSelectedFunction(value);
  };

  const handleChangeBusinessType = (value: any) => {
    setSelectedBusinessType(value);
  };

  const sortedUnits = units
    .slice()
    .sort((a: any, b: any) => a.locationName.localeCompare(b.locationName));

  const sortedEntity = entity
    .slice()
    .sort((a: any, b: any) => a.entityName.localeCompare(b.entityName));
  const [form] = Form.useForm();
  const handleFormReset = () => {
    form.resetFields();
    setFormData({});
  };

  return (
    <div
      style={{
        // backgroundColor: "#F8F9F9",
        border: "1px solid #89d5cd",
        padding: "10px",
        borderRadius: "10px",
        margin: "20px 0px 20px 0px",
      }}
    >
      <Form
        form={form}
        name="auditDFilters"
        onValuesChange={(changedValues, allValues) => {
          setFormData((prevFormData: any) => ({
            ...prevFormData,
            ...changedValues,
          }));
        }}
        layout="vertical"
        //   onFinish={onFinish}
      >
        <Row
          style={{
            display: "flex",
            justifyContent: "space-around",
            marginBottom: "-15px",
          }}
        >
          <Col span={11}>
            <Form.Item name="date" label="Date-Range">
              <RangePicker
                style={{ width: "100%" }}
                className={classes.container}
                // value={[selectedDateRange[0], selectedDateRange[1]]}
                onChange={handleDateChange}
              />
            </Form.Item>
          </Col>

          <Col span={11}>
            <Form.Item name="auditType" label="Audit Type">
              <Select
                mode="multiple"
                allowClear
                placeholder="Audit Type"
                style={{ width: "100%" }}
                value={selectedAuditType}
                defaultValue={["All"]}
                className={classes.container}
                onChange={(selectedValues) => {
                  handleChangeAuditType(selectedValues);
                }}
                showSearch
                optionFilterProp="children"
                filterOption={(input: any, option: any) => {
                  return (option?.children ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase());
                }}
              >
                {auditType.length > 0 &&
                !auditType.some(
                  (item: any) => item.auditType.toLowerCase() === "all"
                ) ? (
                  <Select.Option key="all" value="All">
                    All
                  </Select.Option>
                ) : null}

                {auditType.map((item: any) => (
                  <Select.Option
                    key={item._id}
                    value={item._id}
                    // disabled={
                    //   selectedAuditType.length > 0 &&
                    //   selectedAuditType.includes("All") &&
                    //   item.auditType !== "All"
                    // }
                  >
                    {item.auditType}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        {/* <Row
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "-15px",
          }}
        >
       
        </Row> */}

        <Row
          style={{
            display: "flex",
            justifyContent: "space-around",
            marginBottom: "-15px",
          }}
        >
          <Col span={11}>
            <Form.Item name="stream" label="Business Type">
              <Select
                mode="multiple"
                allowClear
                placeholder="Business Type"
                className={classes.container}
                showSearch
                optionFilterProp="children"
                filterOption={(input: any, option: any) => {
                  return (option?.children ?? "")
                    .toLowerCase()
                    .includes(input?.toLowerCase());
                }}
                defaultValue={["All"]}
                onChange={handleChangeBusinessType}
              >
                {stream.length > 0 &&
                !stream.some(
                  (item: any) => item?.stream?.toLowerCase() === "all"
                ) ? (
                  <Select.Option key="all" value="all">
                    All
                  </Select.Option>
                ) : null}

                {stream.map((item: any) => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={11}>
            <Form.Item name="business" label="Business">
              <Select
                mode="multiple"
                allowClear
                placeholder="Business"
                onChange={handleChangeBusiness}
                className={classes.container}
                value={selectedBusiness}
                defaultValue={["All"]}
                showSearch
                optionFilterProp="children"
                filterOption={(input: any, option: any) => {
                  return (option?.children ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase());
                }}
              >
                {business.length > 0 &&
                !business.some(
                  (item: any) => item?.business?.toLowerCase() === "all"
                ) ? (
                  <Select.Option key="all" value="All">
                    All
                  </Select.Option>
                ) : null}
                {business.map((item: any) => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row
          style={{
            display: "flex",
            justifyContent: "space-around",
            marginBottom: "-15px",
          }}
        >
          <Col span={11}>
            <Form.Item name="function" label="Functions">
              <Select
                mode="multiple"
                allowClear
                placeholder="Functions"
                onChange={handleChangeFunction}
                defaultValue={["All"]}
                className={classes.container}
                showSearch
                optionFilterProp="children"
                filterOption={(input: any, option: any) => {
                  return (option?.children ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase());
                }}
              >
                {functions.length > 0 &&
                !functions.some(
                  (item: any) => item?.functions?.toLowerCase() === "all"
                ) ? (
                  <Select.Option key="all" value="all">
                    All
                  </Select.Option>
                ) : null}
                {functions?.map((item: any) => (
                  <Select.Option key={item?.id} value={item?.id}>
                    {item?.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={11}>
            <Form.Item name="Unit" label="Unit">
              <Select
                mode="multiple"
                allowClear
                placeholder="Unit"
                // defaultValue={[userLocation?.locationName]}
                // defaultValue={["shivamogga"]}
                onChange={handleChangeunits}
                className={classes.container}
                value={selectedUnits}
                onClick={handleUnitClick}
                showSearch
                optionFilterProp="children"
                filterOption={(input: any, option: any) => {
                  return (option?.children ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase());
                }}
              >
                {/* {units.some(
                  (item: any) => item.locationName === item.userLocation.locationName
                ) && (
                  <Select.Option key={userLocation.id} value={userLocation.id}>
                    {userLocation.locationName}
                  </Select.Option>
                )} */}
                {sortedUnits.map((item: any) => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.locationName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row
          style={{
            display: "flex",
            justifyContent: "space-around",
            marginBottom: "-15px",
          }}
        >
          <Col span={11}>
            <Form.Item name="entity" label="Entity">
              <Select
                mode="multiple"
                allowClear
                placeholder="Entity"
                // defaultValue={[userEntity]}
                // onChange={handleChange}
                // options={options}
                onClick={handleEntityClick}
                className={classes.container}
                showSearch
                optionFilterProp="children"
                filterOption={(input: any, option: any) => {
                  return (option?.children ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase());
                }}
              >
                {sortedEntity.map((item: any) => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.entityName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={11}>
            <Form.Item label=" ">
              <Button
                type="primary"
                onClick={handleApplyFilter}
                htmlType="submit"
              >
                Apply
              </Button>
              <Button type="link" onClick={handleFormReset}>
                <AiOutlineReload  />
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default AuditDFilters;
