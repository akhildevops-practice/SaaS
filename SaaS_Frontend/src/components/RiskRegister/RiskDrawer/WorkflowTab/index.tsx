//material-ui
import { makeStyles } from "@material-ui/core";

//antd
import { Row, Col, Form } from "antd";

//components
import AutoComplete from "components/AutoComplete";


const useStyles = makeStyles((theme) => ({
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
  addModalOpen?: any;
  existingRiskConfig?: any;
  postMitigation?: any;
  setPostMitigation?: any;
  postScore?: any;
  setPostScore?: any;
  reviewerOptions?: any;
  approverOptions?: any;
  formData?: any;
  setFormData?: any;
};

const WorkflowTab = ({
  addModalOpen,
  existingRiskConfig,
  postMitigation,
  setPostMitigation,
  postScore,
  setPostScore,
  reviewerOptions,
  approverOptions,
  formData,
  setFormData,
}: Props) => {

  const classes = useStyles();
  const [workflowForm] = Form.useForm();

  return (
    <Form
      form={workflowForm}
      layout="vertical"
      initialValues={{
        riskReviewers: formData?.riskReviewers,
        riskApprovers: formData?.riskApprovers,
      }}
      rootClassName={classes.labelStyle}
      onValuesChange={(changedValues, allValues) =>
        setFormData({ ...formData, ...changedValues })
      }
    >
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Form.Item
            label="Reviewer: "
            name="reviewers"
            rules={[
              {
                required: true,
                message: "Please Select Reviewer!",
              },
            ]}
          >
            <AutoComplete
              suggestionList={reviewerOptions ? reviewerOptions : []}
              name=""
              keyName="riskReviewers"
              formData={formData}
              disabled={false}
              labelKey="label"
              setFormData={setFormData}
              multiple={false}
              getSuggestionList={() => {}}
              defaultValue={
                 formData.riskReviewers || []
              }
              type="RA"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Approver: "
            name="approvers"
            rules={[
              {
                required: true,
                message: "Please Select Approver!",
              },
            ]}
          >
            <AutoComplete
              suggestionList={approverOptions ? approverOptions : []}
              name=""
              keyName="riskApprovers"
              formData={formData}
              disabled={false}
              labelKey="label"
              setFormData={setFormData}
              multiple={false}
              getSuggestionList={() => {}}
              defaultValue={
                formData.riskApprovers || []
             }
              type="RA"
            />
          </Form.Item>
        </Col>
      </Row>

    </Form>
  );
};

export default WorkflowTab;
