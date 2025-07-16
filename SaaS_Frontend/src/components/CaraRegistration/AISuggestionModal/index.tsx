import React from "react";
import { Modal, Button } from "antd";

interface AISuggestionModalProps {
  open: any;
  onCancel: any;
  onAccept: any;
  aiSuggestions: any;
}

const AISuggestionModal: React.FC<AISuggestionModalProps> = ({
  open,
  onCancel,
  onAccept,
  aiSuggestions,
}) => {
  return (
    <Modal
      title="AI Suggestions"
      open={open}
      footer={null}
      onCancel={onCancel}
    >
      {aiSuggestions.map((text:any, index:any) => (
        <div key={index} style={{ marginBottom: "10px" }}>
          <p>{text}</p>
          <Button type="primary" onClick={() => {
            console.log("INDES AND TEXT ", index, text)
            onAccept(text)
          }}>
            Accept
          </Button>
        </div>
      ))}
    </Modal>
  );
};

export default AISuggestionModal;
