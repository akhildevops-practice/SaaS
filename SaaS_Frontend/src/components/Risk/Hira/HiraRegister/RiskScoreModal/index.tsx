// src/components/RiskScoreModal.tsx
import React, { useEffect, useState } from "react";
import { Modal, Tooltip } from "antd";
import {
  CircularProgress,
  useMediaQuery,
  Box,
  Typography,
} from "@material-ui/core";
import useStyles from "./style";
import RiskMatrixViewOnly from "components/Risk/RiskRegister/RiskRegisterForm/RiskEditableTable/RiskMatrixViewOnly";

type Props = {
  preMitigationScoreModal?: any;
  toggleScoreModal?: any;
  existingRiskConfig?: any;
  selectedCell?: [number, number] | null;
  setSelectedCell?: (c: [number, number] | null) => void;
  handleSaveScore?: (mode: string, cell: [number, number]) => void;
  riskScoreModal?: any;
  handleOk?: any;
  preMitigation?: any;
  preScore?: any;
  setPreScore?: any;
  levelColor?: any;
  setLevelColor?: any;
  isAspImp?: boolean;
  isPreOrPost?: string;
};

const RiskScoreModal: React.FC<Props> = ({
  preMitigationScoreModal,
  toggleScoreModal,
  existingRiskConfig,
  selectedCell = [0, 0],
  setSelectedCell,
  handleSaveScore,
  riskScoreModal,
  handleOk,
  isPreOrPost = "pre",
}) => {
  const classes = useStyles();
  const matches = useMediaQuery("(min-width:822px)");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (preMitigationScoreModal.open && existingRiskConfig) {
      setIsLoading(false);
    }
  }, [preMitigationScoreModal.open, existingRiskConfig]);

  const onCellClick = (pIdx: number, sIdx: number) => {
    if (riskScoreModal.mode === "view") return;
    const newCell: [number, number] = [pIdx, sIdx];
    if (selectedCell && selectedCell[0] === pIdx && selectedCell[1] === sIdx) {
      setSelectedCell!(null);
    } else {
      setSelectedCell!(newCell);
      handleSaveScore!(riskScoreModal.mode, newCell);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", width: "100%" }}>
          <div>
            Score:{" "}
            {selectedCell ? (selectedCell[0] + 1) * (selectedCell[1] + 1) : "-"}
          </div>
          <div style={{ margin: "0 auto" }}>
            {selectedCell && riskScoreModal.mode === "pre"
              ? `(Impact=${selectedCell[0] + 1} * Likelihood=${
                  selectedCell[1] + 1
                })`
              : selectedCell && riskScoreModal.mode === "post"
              ? `(Actual Impact=${selectedCell[0] + 1} * Actual Likelihood=${
                  selectedCell[1] + 1
                })`
              : ""}
          </div>
        </div>
      }
      centered
      open={preMitigationScoreModal.open}
      footer={null}
      onCancel={toggleScoreModal}
      onOk={toggleScoreModal}
      width={matches ? "70%" : "100%"}
    >
      {isLoading || !existingRiskConfig ? (
        <CircularProgress />
      ) : (
        <>
          <RiskMatrixViewOnly
            config={existingRiskConfig}
            selectedCell={selectedCell}
            onCellClick={onCellClick}
          />
        </>
      )}
    </Modal>
  );
};

export default RiskScoreModal;
