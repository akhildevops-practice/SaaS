//react, react-router
import { useEffect, useState } from "react";

//antd
import {
  Col,
  DatePicker,
  DatePickerProps,
  Form,
  Row,
  Select,
} from "antd";

//styles
import useStyles from "./styles";

//components
import ControlMeasuresEditorField from "components/RiskRegister/ControlMeasureDrawer/ControlMeasureDetailsTab/ControlMeasuresEditorField";
//thirdparty libs
import dayjs from "dayjs";
import moment from "moment";

type Props = {
  mitigationModal?: any;
  setMitigationModal?: any;
  fetchRisks?: any;
  fetchAspImps?: any;
  setStatusNew?: any;
  setTargetDateNew?: any;
  setCommentsNew?: any;
  formData?: any;
  setFormData?: any;
  commentsNew?: any;
  setReferencesNew?: any;
  handleMitigationFormCreated?: any;

  existingRiskConfig?: any;
  postMitigation?: any;
  setPostMitigation?: any;
  postScore?: any;
  setPostScore?: any;
  levelColor?: any;
  setLevelColor?: any;
  isFormDisabled?: any;
};

const ControlMeasureDetailsTab = ({
  mitigationModal,
  setMitigationModal,
  fetchRisks,
  fetchAspImps,
  setCommentsNew,
  setFormData,
  setStatusNew,
  setTargetDateNew,
  formData,
  commentsNew,
  setReferencesNew,
  handleMitigationFormCreated,

  existingRiskConfig,
  postMitigation,
  setPostMitigation,
  postScore,
  setPostScore,
  levelColor,
  setLevelColor,
  isFormDisabled = false,
}: Props) => {
  const [mitigationStage, setMitigationStage] = useState<any>();

  const classes = useStyles();
  const [mitigationForm] = Form.useForm();

  useEffect(() => {
    if (handleMitigationFormCreated) {
      handleMitigationFormCreated(mitigationForm);
    }
  }, [mitigationForm, handleMitigationFormCreated]);

  useEffect(() => {
    if (mitigationModal.mode === "edit") {
      mitigationForm.setFieldsValue({
        title: mitigationModal.data.title,
        stage: mitigationModal.data.stage || undefined,
        status: mitigationModal.data.status == "OPEN" ? true : false,
        targetDate: mitigationModal.data.targetDate
          ? dayjs(mitigationModal.data.targetDate, "YYYY/MM/DD")
          : undefined,
      });
      setFormData({
        ...formData,
        title: mitigationModal.data.title,
        stage: mitigationModal.data.stage || undefined,
        status: mitigationModal.data.status == "OPEN" ? true : false,
        targetDate: mitigationModal.data.targetDate
          ? moment.utc(mitigationModal.data.targetDate).format("YYYY/MM/DD")
          : undefined,
      });
      setTargetDateNew(
        moment.utc(mitigationModal.data.targetDate).format("YYYY/MM/DD")
      );
      setCommentsNew(mitigationModal.data.comments || "");
      setReferencesNew(mitigationModal.data.references);
    }
  }, [mitigationModal]);

  const onTargetDateChange: DatePickerProps["onChange"] = (
    date,
    dateString
  ) => {
    setTargetDateNew(dateString);
  };

  return (
    <>
      <Form
        layout="vertical"
        className={classes.formBox}
        form={mitigationForm}
        initialValues={{ status: true }}
        onValuesChange={(changedValues, allValues) => setFormData(allValues)}
      >
        {/* <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item
              label="Additional Control Measure Title: "
              name="title"
              tooltip="This is a required field"
              rules={[
                {
                  required: true,
                  message:
                    "Please Input Your Additional Control Measure Title!",
                },
              ]}
            >
              <Input
                placeholder="Enter Additional Control Measure Title"
                size="large"
                disabled={isFormDisabled}
              />
            </Form.Item>
          </Col>
        </Row> */}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item label="Additional Control Measures: " required>
              <ControlMeasuresEditorField
                comments={commentsNew}
                setComments={setCommentsNew}
                isFormDisabled={isFormDisabled}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item
              label="Additional Control Measure Stage: "
              name="stage"
              rules={[{ required: true, message: "Please Select Stage!" }]}
            >
              <Select
                aria-label="Select Mitigation Stage"
                placeholder="Select Stage"
                value={mitigationStage}
                onChange={(value: any) => setMitigationStage(value)}
                options={[
                  { value: "Planned", label: "Planned" },
                  { value: "Ongoing", label: "Ongoing" },
                  { value: "Completed", label: "Completed" },
                ]}
                size="large"
                disabled={isFormDisabled}
              />
            </Form.Item>
          </Col>
          {!!mitigationStage && mitigationStage !== "Completed" && (
            <Col span={12}>
              <Form.Item label="Target Date: " name="targetDate">
                <DatePicker
                  format="DD/MM/YYYY"
                  onChange={onTargetDateChange}
                  size="large"
                  disabled={isFormDisabled}
                />
              </Form.Item>
            </Col>
          )}
        </Row>
      </Form>
    </>
  );
};

export default ControlMeasureDetailsTab;
