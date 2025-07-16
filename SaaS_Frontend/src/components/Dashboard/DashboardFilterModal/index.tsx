import {
  Modal,
  Form,
  Button,
  Select,
  Row,
  Col,
  Tooltip,
  DatePicker,
} from "antd";
import useStyles from "./styles";
import dayjs from "dayjs";
const { RangePicker } = DatePicker;
type Props = {
  filterModal?: any;
  handleOk?: any;
  handleCancel?: any;
  selectedJobTitle?: any;
  selectedBusinessType?: any;
  selectedFunction?: any;
  selectedBusiness?: any;
  selectedLocation?: any;
  selectedEntity?: any;
  jobTitleOptions?: any;
  locationOptions?: any;
  businessTypeOptions?: any;
  businessOptions?: any;
  functionOptions?: any;
  departmentOptions?: any;
  formData?: any;
  setFormData?: any;
  selectedDateRange?: any;
  handleDateChange?: any;
  handleJobTitleChange?: any;
  handleStreamOnChange?: any;
  handleBusinessOptionChange?: any;
  handleFunctionOptionChange?: any;
  handleLocationChange?: any;
  handleDepartmentChange?: any;
  filterForm?: any;
};

const DashboardFilterModal = ({
  filterModal,
  handleOk,
  handleCancel,
  selectedJobTitle,
  selectedBusinessType,
  selectedFunction,
  selectedBusiness,
  selectedLocation,
  selectedEntity,
  jobTitleOptions,
  locationOptions,
  businessTypeOptions,
  businessOptions,
  functionOptions,
  departmentOptions,
  formData,
  setFormData,
  selectedDateRange,
  handleDateChange,
  handleJobTitleChange,
  handleStreamOnChange,
  handleBusinessOptionChange,
  handleFunctionOptionChange,
  handleLocationChange,
  handleDepartmentChange,
  filterForm,
}: Props) => {
  const classes = useStyles();
  return (
    <>
      <Modal
        title={"Filter By"}
        open={filterModal.open}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="" // Set to empty string to hide "Ok" button
        cancelText=""
        footer={null}
      >
        <div
          style={{
            backgroundColor: "#F8F9F9",
            border: "1px solid #89d5cd",
            padding: "10px",
            borderRadius: "10px",
          }}
        >
          <Form
            // layout="vertical"
            // style={{ width: "100%" }}
            form={filterForm}
            // rootClassName={classes.labelStyle}
            // initialValues={{
            //   locationId: userDetails?.location?.id,
            //   entityId: userDetails?.entity?.id,
            // }}
            onValuesChange={(changedValues, allValues) => {
              // console.log("checkrisk changed values", changedValues);
              console.log("checkrisk all values", allValues);
              console.log(
                "checkrisk onchange hiraheader form called",
                changedValues
              );

              setFormData({
                ...formData,
                ...changedValues,
              });
            }}
            layout="vertical"
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
                    format="DD-MM-YYYY"
                    className={classes.container}
                    style={{ width: "100%" }}
                    value={[
                      selectedDateRange?.fromDate
                        ? dayjs(selectedDateRange?.fromDate)
                        : null,
                      selectedDateRange?.toDate
                        ? dayjs(selectedDateRange?.toDate)
                        : null,
                    ]}
                    onChange={handleDateChange}
                    // disabled={
                    //   disableFieldsForOtherUsers ||
                    //   (!isDraft && auditFinaliseDateModal?.mode === "edit")
                    // }
                    // disabledDate={disabledRangeDate} // Add this line
                  />
                </Form.Item>
              </Col>
              <Col span={11}>
                <Form.Item name="jobTitle" label="JobTitle">
                  <Select
                    mode="multiple"
                    showSearch
                    allowClear
                    style={{ width: "100%" }}
                    placeholder="Select Job Title"
                    className={classes.container}
                    optionFilterProp="children"
                    filterOption={(input: any, option: any) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    // style={{ width: "100%" }}
                    value={selectedJobTitle || ""}
                    onChange={(value) => handleJobTitleChange(value)}
                    listHeight={200}
                    maxTagCount={4} // Display only up to 4 tags
                    maxTagTextLength={10} // Limit tag text length to 10 characters
                  >
                    {jobTitleOptions.map((option: any) => (
                      <Select.Option key={option.value} value={option.value}>
                        <Tooltip title={option.label} placement="right">
                          <div
                            style={{
                              textOverflow: "ellipsis",
                              overflow: "hidden",
                              whiteSpace: "nowrap",
                              maxWidth: "300px",
                            }}
                          >
                            {option.label}
                          </div>
                        </Tooltip>
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
                <Form.Item
                  // label="Streams"
                  // className={classes.formItem}
                  name="businessTypes"
                  label="Business Type"
                  // style={{ minWidth: "220px", maxWidth: "350px" }}
                >
                  <Select
                    mode="multiple"
                    showSearch
                    allowClear
                    placeholder="Select Streams"
                    className={classes.container}
                    value={selectedBusinessType}
                    // style={{ width: "100%" }}
                    onChange={handleStreamOnChange}
                    optionFilterProp="children"
                    filterOption={(input: any, option: any) =>
                      option?.children
                        ?.toLowerCase()
                        ?.indexOf(input?.toLowerCase()) >= 0
                    }
                  >
                    {businessTypeOptions.map((option: any) => (
                      <Select.Option key={option.value} value={option.value}>
                        <Tooltip title={option.label} placement="right">
                          <div
                            style={{
                              textOverflow: "ellipsis",
                              overflow: "hidden",
                              whiteSpace: "nowrap",
                              maxWidth: "300px",
                            }}
                          >
                            {option.label}
                          </div>
                        </Tooltip>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={11}>
                <Form.Item
                  // label="Business"
                  name="business"
                  label="Business"
                  // className={classes.formItem}
                  // style={{ minWidth: "220px", maxWidth: "350px" }}
                >
                  <Select
                    mode="multiple"
                    showSearch
                    allowClear
                    placeholder="Select Business"
                    // style={{ width: "100%" }}
                    value={selectedBusiness}
                    className={classes.container}
                    onChange={handleBusinessOptionChange}
                    optionFilterProp="children"
                    filterOption={(input: any, option: any) =>
                      option?.children
                        ?.toLowerCase()
                        ?.indexOf(input?.toLowerCase()) >= 0
                    }
                  >
                    {businessOptions.map((option: any) => (
                      <Select.Option key={option.value} value={option.value}>
                        {option.label}
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
                <Form.Item
                  // label="Business"
                  name="function"
                  label="Function"
                  // className={classes.formItem}
                  // style={{ minWidth: "220px", maxWidth: "350px" }}
                >
                  <Select
                    mode="multiple"
                    showSearch
                    allowClear
                    placeholder="Select Functions"
                    // style={{ width: "100%" }}
                    value={selectedFunction}
                    className={classes.container}
                    onChange={handleFunctionOptionChange}
                    optionFilterProp="children"
                    filterOption={(input: any, option: any) =>
                      option?.children
                        ?.toLowerCase()
                        ?.indexOf(input?.toLowerCase()) >= 0
                    }
                  >
                    {functionOptions.map((option: any) => (
                      <Select.Option key={option.value} value={option.value}>
                        {option.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={11}>
                <Form.Item
                  label="Corp Func/Unit"
                  name="unit"
                  // className={classes.formItem}
                  // style={{ minWidth: "220px", maxWidth: "350px" }}
                >
                  <Select
                    mode="multiple"
                    showSearch
                    allowClear
                    placeholder="Select Corp Func/Unit"
                    // style={{ width: "100%" }}
                    value={selectedLocation}
                    className={classes.container}
                    onChange={(value: any) => handleLocationChange(value)}
                    optionFilterProp="children"
                    filterOption={(input: any, option: any) =>
                      option?.children
                        ?.toLowerCase()
                        ?.indexOf(input?.toLowerCase()) >= 0
                    }
                  >
                    {locationOptions.map((option: any) => (
                      <Select.Option key={option.value} value={option.value}>
                        <Tooltip title={option.label} placement="right">
                          <div
                            style={{
                              textOverflow: "ellipsis",
                              overflow: "hidden",
                              whiteSpace: "nowrap",
                              maxWidth: "300px",
                            }}
                          >
                            {option.label}
                          </div>
                        </Tooltip>
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
                <Form.Item
                  label="Dept/Vertical"
                  name="entity"
                  // style={{ minWidth: "220px", maxWidth: "350px" }}

                  // className={classes.formItem}
                >
                  <Select
                    mode="multiple"
                    showSearch
                    allowClear
                    placeholder="Select Dept/Vertical"
                    className={classes.container}
                    // style={{ width: "100%" }}
                    value={selectedEntity}
                    onChange={(value: any) => handleDepartmentChange(value)}
                    optionFilterProp="children"
                    filterOption={(input: any, option: any) =>
                      option?.children
                        ?.toLowerCase()
                        ?.indexOf(input?.toLowerCase()) >= 0
                    }
                  >
                    {departmentOptions.map((option: any) => (
                      <Select.Option key={option.value} value={option.value}>
                        <Tooltip title={option.label} placement="right">
                          <div
                            style={{
                              textOverflow: "ellipsis",
                              overflow: "hidden",
                              whiteSpace: "nowrap",
                              maxWidth: "300px",
                            }}
                          >
                            {option.label}
                          </div>
                        </Tooltip>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={11}>
                <Form.Item label=" ">
                  <Button type="primary" onClick={handleOk}>
                    Apply
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </Modal>
    </>
  );
};

export default DashboardFilterModal;
{
  /* <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                onClick={handleClickFetch}
                // ref={ref1}
                // style={{
                //   display: "flex",
                //   alignItems: "center",
                //   backgroundColor: "#003566",
                //   color: "white",
                //   marginRight: "5px",
                // }}
              >
                Fetch
              </Button>
            </Form.Item> */
}
