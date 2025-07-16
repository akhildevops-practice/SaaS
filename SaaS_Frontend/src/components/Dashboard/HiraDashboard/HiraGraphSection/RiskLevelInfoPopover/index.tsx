import { Popover, Typography } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";

const RiskLevelInfoPopover = () => {
  const content = (
    <div style={{ width: "400px", fontSize: 12 }}>
      <div style={{ display: "flex", border: "1px solid #ccc", fontWeight: "bold", background: "#f5f5f5" }}>
        <div style={{ width: "60px", padding: "6px", borderRight: "1px solid #ccc" }}>Score</div>
        <div style={{ width: "100px", padding: "6px", borderRight: "1px solid #ccc" }}>Risk Level</div>
        <div style={{ flex: 1, padding: "6px" }}>Guideline</div>
      </div>

      {/* Extreme Risk */}
      <div style={{ display: "flex", borderLeft: "1px solid #ccc", borderRight: "1px solid #ccc", borderBottom: "1px solid #ccc" }}>
        <div style={{ width: "60px", backgroundColor: "#f44336", color: "#fff", padding: "6px", textAlign: "center" }}>
          15-25
        </div>
        <div style={{ width: "100px", padding: "6px", borderLeft: "1px solid #ccc" }}>Extreme Risks</div>
        <div style={{ flex: 1, padding: "6px", borderLeft: "1px solid #ccc" }}>
          Activity should not proceed in current form.<br />
          Immediate Risk Control Measures are required to reduce the risk to at least Medium Level.<br />
          <b>Management review is required before work commences.</b>
        </div>
      </div>

      {/* High Risk */}
      <div style={{ display: "flex", borderLeft: "1px solid #ccc", borderRight: "1px solid #ccc", borderBottom: "1px solid #ccc" }}>
        <div style={{ width: "60px", backgroundColor: "#ff9800", color: "#000", padding: "6px", textAlign: "center" }}>
          8-12
        </div>
        <div style={{ width: "100px", padding: "6px", borderLeft: "1px solid #ccc" }}>High Risks</div>
        <div style={{ flex: 1, padding: "6px", borderLeft: "1px solid #ccc" }}>
          Activity should be modified or Control Measures are required to reduce the risk to at least Medium Level.
        </div>
      </div>

      {/* Medium Risk */}
      <div style={{ display: "flex", borderLeft: "1px solid #ccc", borderRight: "1px solid #ccc", borderBottom: "1px solid #ccc" }}>
        <div style={{ width: "60px", backgroundColor: "#ffeb3b", color: "#000", padding: "6px", textAlign: "center" }}>
          4-6
        </div>
        <div style={{ width: "100px", padding: "6px", borderLeft: "1px solid #ccc" }}>Medium Risks</div>
        <div style={{ flex: 1, padding: "6px", borderLeft: "1px solid #ccc" }}>
          Activity can operate subject to existing operational and management control.
        </div>
      </div>

      {/* Low Risk */}
      <div style={{ display: "flex", border: "1px solid #ccc" }}>
        <div style={{ width: "60px", backgroundColor: "#4caf50", color: "#fff", padding: "6px", textAlign: "center" }}>
          1-3
        </div>
        <div style={{ width: "100px", padding: "6px", borderLeft: "1px solid #ccc" }}>Low Risks</div>
        <div style={{ flex: 1, padding: "6px", borderLeft: "1px solid #ccc" }}>
          No Action is required, unless escalation of risk is possible.
        </div>
      </div>
    </div>
  );

  return (
    <Typography.Text>
      Score Guideline
      <Popover placement="right" title={null} content={content} trigger={["click", "hover"]}>
        <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer", paddingLeft: "2px" }} />
      </Popover>
    </Typography.Text>
  );
};

export default RiskLevelInfoPopover;
