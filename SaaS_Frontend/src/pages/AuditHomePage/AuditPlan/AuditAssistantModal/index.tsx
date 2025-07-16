import { ReactComponent as CloseIcon } from "assets/documentControl/Close.svg";
import {
  Button,
  DatePicker,
  InputNumber,
  Modal,
  Steps,
} from "antd";
import { TextareaAutosize } from "@material-ui/core";
const { RangePicker } = DatePicker;
const { Step } = Steps;

type Props = {
  openAssistantModal: any;
  toggleAssistantModal: any;
  assistantFormData: any;
  setAssistantFormData: any;
  currentStep: any;
  nextStep: any;
  prevStep: any;
  handleSubmit: any;
  submitLoader:any;
};

const AuditAssistantModal = ({
  openAssistantModal,
  toggleAssistantModal,
  assistantFormData,
  setAssistantFormData,
  currentStep,
  nextStep,
  prevStep,
  handleSubmit,
  submitLoader=false,
}: Props) => {
  return (
    <>
      {openAssistantModal && (
        <Modal
          open={openAssistantModal}
          onCancel={toggleAssistantModal}
          footer={null} // No footer
          closeIcon={<CloseIcon style={{ fontSize: "20px" }} />}
          centered
          style={{
            top: 20,
            width: "400px",
          }}
          width={600}
          bodyStyle={{
            padding: "20px",
          }}
        >
          <>
            {/* Steps Component */}
            <Steps current={currentStep} style={{ marginBottom: "20px" }}>
              <Step title="Audit Scope" />
              <Step title="Audit Details" />
            </Steps>

            {/* Conditional Rendering Based on Current Step */}
            {currentStep === 0 && (
              <div>
                <label htmlFor="topicTextArea">
                  Enter Audit Scope to Generate Checklist:
                </label>
                <TextareaAutosize
                  id="topicTextArea"
                  minRows={3}
                  style={{ width: "100%", marginTop: "10px" }}
                  value={assistantFormData?.auditScopePromptText}
                  onChange={(e) =>
                    setAssistantFormData({
                      ...assistantFormData,
                      auditScopePromptText: e.target.value,
                    })
                  }
                />
                <div style={{ textAlign: "right", marginTop: "20px" }}>
                  <Button type="primary" onClick={nextStep}>
                    Next
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div>
                <div style={{ marginBottom: "20px" }}>
                  <label>Audit Time:</label>
                  <RangePicker
                    // showTime={{ format: "HH:mm" }} // Enables time selection with hours and minutes
                    format="DD-MM-YYYY" // Sets the display format
                    style={{ width: "100%", marginTop: "10px" }}
                    onChange={(dates, dateStrings) =>
                      setAssistantFormData({
                        ...assistantFormData,
                        auditDateRange: dateStrings, // Stores the start and end date as an array of strings
                      })
                    }
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label>Audit Duration:</label>
                  <InputNumber
                    style={{ width: "100%", marginTop: "10px" }}
                    min={0}
                    max={100} // Set the range as needed
                    value={assistantFormData?.auditDuration}
                    onChange={(value) =>
                      setAssistantFormData({
                        ...assistantFormData,
                        auditDuration: value,
                      })
                    }
                  />
                </div>

                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Button onClick={prevStep}>Previous</Button>
                  <Button type="primary" onClick={handleSubmit} loading={submitLoader}>
                    Submit
                  </Button>
                </div>
              </div>
            )}
          </>
        </Modal>
      )}
    </>
  );
};

export default AuditAssistantModal;
