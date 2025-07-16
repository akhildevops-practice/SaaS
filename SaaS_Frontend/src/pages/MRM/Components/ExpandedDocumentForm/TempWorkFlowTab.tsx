import { Col, Form, Row, Select } from "antd";

const TempWorkFlowTab = () => {
  return (
    <Form
      // form={workflowForm}
      layout="vertical"
      // onValuesChange={(changedValues, allValues) => setDocFormData(allValues)}
    >
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Form.Item label="Reviewer: " name="reviewer" required>
            <Select
              showSearch
              placeholder="Search and Select Reviewer"
              // notFoundContent={
              //   fetching ? <Spin size="small" /> : "No results found"
              // }
              filterOption={(input: any, option: any) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              // onSearch={handleReviewerSearchChange}
              // onSelect={handleReviewerSelect}

              // options={options}
              size="large"
              optionLabelProp="label"
            >
              {/* {!!reviewerOptions &&
                !!reviewerOptions.length &&
                // !!showDropdown &&
                reviewerOptions?.map((option: any) => (
                  <Option
                    key={option.value}
                    value={option.value}
                    label={option.label}
                    children={<>{option.label}</>}
                  />
                ))} */}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Approver: " name="approver" required>
            <Select
              showSearch
              placeholder="Search and Select Approver"
              // notFoundContent={
              //   fetching ? <Spin size="small" /> : "No results found"
              // }
              filterOption={(input: any, option: any) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              // onSearch={handleApproverSearchChange}
              // onSelect={handleApproverSelect}
              size="large"
              optionLabelProp="label"
            >
              {/* {!!approverOptions &&
                !!approverOptions.length &&
                // !!showDropdown &&
                approverOptions?.map((option: any) => (
                  <Option
                    key={option.value}
                    value={option.value}
                    label={option.label}
                    children={<>{option.label}</>}
                  />
                ))} */}
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default TempWorkFlowTab;
