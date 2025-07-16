import React, { useEffect } from "react";
import { Modal, Button } from "antd";
import TextareaAutosize from "@material-ui/core/TextareaAutosize";

type Props = {
  isModalVisible?: any;
  setIsModalVisible?: any;
  formValues?: any;
  handleConfigFormChange?: any;
  handleConfigFormSubmit?: any;
};

const PromptsConfigModal = ({
  isModalVisible,
  setIsModalVisible,
  formValues,
  handleConfigFormChange,
  handleConfigFormSubmit,
}: Props) => {
  useEffect(() => {
    console.log("checkclause in useEffect formValues", formValues);
  }, [formValues]);

  return (
    <>
      <Modal
        title="Prompts"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        // onOk={handleConfigFormChange}
        footer={[
          <Button key="submit" type="primary" onClick={handleConfigFormSubmit}>
            Submit
          </Button>,
        ]}
        bodyStyle={{
          maxHeight: "400px",
          overflowY: "auto",
          paddingRight: "8px",
        }} // Fixed height with scroll
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <span>Prompt For Claude Model:</span>
          <TextareaAutosize
            minRows={4}
            placeholder="Prompt For Claude Model"
            value={formValues.claude_model_prompt}
            onChange={(e) =>
              handleConfigFormChange(e, "claude_model_prompt")
            }
          />
          <span>Prompt For Added Clauses:</span>
          <TextareaAutosize
            minRows={4}
            placeholder="Prompt For Added Clauses"
            value={formValues.identify_added_clauses}
            onChange={(e) =>
              handleConfigFormChange(e, "identify_added_clauses")
            }
          />
          <span>Prompt For Modified Clauses:</span>
          <TextareaAutosize
            minRows={4}
            placeholder="Prompt For Modified Clauses"
            value={formValues.identify_modified_clauses}
            onChange={(e) =>
              handleConfigFormChange(e, "identify_modified_clauses")
            }
          />
          <span>Prompt For Removed Clauses:</span>
          <TextareaAutosize
            minRows={4}
            placeholder="Prompt For Removed Clauses"
            value={formValues.identify_removed_clauses}
            onChange={(e) =>
              handleConfigFormChange(e, "identify_removed_clauses")
            }
          />
          <span>Json Formatting For Added Clauses:</span>
          <TextareaAutosize
            minRows={4}
            placeholder="Prompt For Json Formatting For Added Clauses"
            value={formValues.json_added_clauses}
            onChange={(e) => handleConfigFormChange(e, "json_added_clauses")}
          />
          <span>Json Formatting For Modified Clauses:</span>
          <TextareaAutosize
            minRows={4}
            placeholder="Prompt For Json Formatting For Modified Clauses"
            value={formValues.json_modified_clauses}
            onChange={(e) => handleConfigFormChange(e, "json_modified_clauses")}
          />
          <span>Json Formatting For Removed Clauses:</span>
          <TextareaAutosize
            minRows={4}
            placeholder="Prompt For Json Formatting For Removed Clauses"
            value={formValues.json_removed_clauses}
            onChange={(e) => handleConfigFormChange(e, "json_removed_clauses")}
          />
        </div>
      </Modal>
    </>
  );
};

export default PromptsConfigModal;
