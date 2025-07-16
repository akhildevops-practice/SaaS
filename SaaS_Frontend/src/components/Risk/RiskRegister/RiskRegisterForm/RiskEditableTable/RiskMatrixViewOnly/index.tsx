// src/components/RiskMatrix.tsx
import React from "react";
import { Box, Typography } from "@material-ui/core";
import { Input, Tooltip } from "antd";
import { makeStyles } from "@material-ui/core/styles";
const useStyles = makeStyles(() => ({
  titleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  matrixContainer: {
    overflowX: "auto",
    marginTop: 16,
  },
  minWidthWrapper: {
    minWidth: 900,
  },
  headerCell: {
    backgroundColor: "#1e90ff",
    color: "#fff",
    height: 52,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    marginRight: 4,
    fontWeight: 500,
    fontSize: "14px",
  },
  verticalHeaderWrapper: {
    backgroundColor: "#1e90ff",
    color: "#fff",
    padding: 16,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  verticalLabel: {
    writingMode: "vertical-rl",
    transform: "rotate(180deg)",
    textAlign: "center",
    fontWeight: 500,
    fontSize: "1rem",
    cursor: "pointer",
  },
  labelColumn: {
    display: "flex",
    flexDirection: "column",
    width: 200,
    marginRight: 4,
  },
  matrixGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: 4,
    marginBottom: 4,
  },
  matrixCell: {
    padding: 12,
    color: "#fff",
    cursor: "pointer",
    height: 56,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    fontSize: 12,
    fontWeight: 500,
    borderRadius: 4,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  labelCell: {
    backgroundColor: "#1e90ff",
    color: "#fff",
    textAlign: "center",
    height: 80,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 500,
    fontSize: 14,
    position: "relative",
    "&:hover .edit-icon": {
      opacity: 1,
    },
  },

  dialogLevel: {
    height: 32,
    borderRadius: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: "bold",
  },

  tableHeader: {
    fontSize: "1rem",
    fontWeight: "bold",
    margin: "8px",
  },
}));

interface RiskMatrixProps {
  config: any;
  selectedCell: [number, number] | null;
  onCellClick: (pIdx: number, sIdx: number) => void;
}

const RiskMatrixViewOnly: React.FC<RiskMatrixProps> = ({
  config,
  selectedCell,
  onCellClick,
}) => {
  const classes = useStyles();

  const getRiskColor = (score: number): string => {
    if (!config?.riskLevelData) return "#fff";

    for (const lvl of config.riskLevelData) {
      const { comparator, value, color } = lvl;

      if (typeof value !== "number" || !color) continue;

      let condition = false;

      switch (comparator) {
        case "<":
          condition = score < value;
          break;
        case "<=":
          condition = score <= value;
          break;
        case ">":
          condition = score > value;
          break;
        case ">=":
          condition = score >= value;
          break;
        case "=":
        case "==":
          condition = score === value;
          break;
        default:
          condition = false;
      }

      if (condition) return color;
    }

    return "#fff"; // default color if no match
  };

  return (
    <Box mt={4}>
      <div className={classes.matrixContainer}>
        <div className={classes.minWidthWrapper}>
          {/* ─── Top row ─── */}
          <div style={{ display: "flex", marginBottom: 4 }}>
            {/* blank under Severity axis */}
            <div className={classes.headerCell} style={{ width: 136 }} />
            {/* blank under Severity labels */}
            <div className={classes.headerCell} style={{ width: 184 }} />

            {/* Probability axis + weight in one cell */}
            <div
              className={classes.headerCell}
              style={{ flex: 1, position: "relative" }}
            >
              {config.probabilityAxisLabel}
              <div
                style={{
                  position: "absolute",
                  right: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Input
                  type="number"
                  value={config.probabilityWeightage}
                  readOnly
                  style={{
                    width: 48,
                    height: 24,
                    textAlign: "center",
                    border: "none",
                    background: "transparent",
                    color: "#fff",
                  }}
                />
                <span style={{ fontSize: 12, color: "#fff" }}>Weight</span>
              </div>
            </div>
          </div>

          {/* ─── Main matrix layout ─── */}
          <div style={{ display: "flex" }}>
            {/* Severity axis + weight */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginRight: 4,
              }}
            >
              <div
                className={classes.verticalHeaderWrapper}
                style={{
                  minHeight: 75 + 80 * config.severityLabels.length,
                  width: 120,
                }}
              >
                {config.severityAxisLabel}
                <Input
                  type="number"
                  value={config.severityWeightage}
                  readOnly
                  style={{
                    width: 48,
                    textAlign: "center",
                    marginTop: 8,
                    border: "none",
                    background: "transparent",
                    color: "#fff",
                  }}
                />
                <span style={{ fontSize: 12, color: "#fff" }}>Weight</span>
              </div>
            </div>

            {/* Severity labels down the left */}
            <div className={classes.labelColumn}>
              {/* placeholder for the probability‐labels row */}
              <div className={classes.labelCell} style={{ height: 100 }} />
              {config.severityLabels.map((sev: any, idx: any) => (
                <div key={idx} className={classes.labelCell}>
                  {sev}
                </div>
              ))}
            </div>

            {/* The grid: first row is probability‐labels, then each score row */}
            <div style={{ flex: 1 }}>
              {/* Probability labels */}
              <div className={classes.matrixGrid}>
                {config.probabilityLabels.map((lbl: any, i: any) => (
                  <div key={i} className={classes.labelCell}>
                    {lbl}
                  </div>
                ))}
              </div>

              {/* Score rows */}
              {config.severityLabels.map((sev: any, sIdx: any) => (
                <div
                  key={sIdx}
                  className={classes.matrixGrid}
                  style={{
                    gridTemplateColumns: `repeat(${config.probabilityLabels.length}, 1fr)`,
                  }}
                >
                  {config.probabilityLabels.map((prob: any, pIdx: any) => {
                    const cell = config.riskMatrix[prob][sev];
                    const { score, description = "" } = cell;
                    const bg = getRiskColor(score);
                    const isSel =
                      selectedCell?.[0] === pIdx && selectedCell?.[1] === sIdx;

                    // truncate to 20 chars
                    const snippet =
                      description.length > 20
                        ? description.slice(0, 20) + "…"
                        : description;

                    return (
                      <Tooltip title={description} key={`${pIdx}-${sIdx}`}>
                        <div
                          className={classes.matrixCell}
                          style={{
                            backgroundColor: bg,
                            border: isSel ? "3px solid #000" : undefined,
                            cursor: "pointer",
                          }}
                          onClick={() => onCellClick(pIdx, sIdx)}
                        >
                          <div style={{ fontSize: 16, fontWeight: "bold" }}>
                            {score}
                          </div>
                          {description && (
                            <div
                              style={{
                                marginTop: 4,
                                fontSize: 12,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                width: "100%",
                              }}
                            >
                              {snippet}
                            </div>
                          )}
                        </div>
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Box>
  );
};

export default RiskMatrixViewOnly;
