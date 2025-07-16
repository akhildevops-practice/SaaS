//react, reactrouter
import { useEffect, useState } from "react";

//antd
import { Modal } from "antd";

//material-ui
import { CircularProgress } from "@material-ui/core";

//styles
import useStyles from "./style";

type Props = {
  //new
  preMitigationScoreModal?: any;
  toggleScoreModal?: any;
  existingRiskConfig?: any;

  preMitigation?: any;
  setPreMitigation?: any;
  preScore?: any;
  setPreScore?: any;
  scoreData?: any;
  setScoreData?: any;
  score?: any;
  setScore?: any;
  levelColor?: any;
  setLevelColor?: any;
  isPreOrPost?: any;
  setIsPreOrPost?: any;
};

const getComparisonFunction = (operator: any) => {
  switch (operator) {
    case "<":
      return (a: any, b: any) => a < b;
    case ">":
      return (a: any, b: any) => a > b;
    case "<=":
      return (a: any, b: any) => a <= b;
    case ">=":
      return (a: any, b: any) => a >= b;
    default:
      return () => false;
  }
};

const PreMitigationScoreModal = ({
  preMitigationScoreModal,
  toggleScoreModal,
  existingRiskConfig,
  preMitigation,
  setPreMitigation,
  preScore,
  setPreScore,
  scoreData,
  setScoreData,
  score,
  setScore,
  isPreOrPost,
  setIsPreOrPost,
  levelColor,
  setLevelColor,
}: Props) => {
  const classes = useStyles();
  const [selectedCell, setSelectedCell] = useState<any>(null);
  const [tableData, setTableData] = useState<any>([]);
  const [scoreLegends, setScoreLegends] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<any>(false);

  useEffect(() => {
    // console.log(
    //   "checkrisk pre mitigation data in pre mitigation-->",
    //   preMitigation,
    //   preScore
    // );
    setIsLoading(true);
    setTableData(constructTableData(preMitigation));
  }, [preMitigation]);

  useEffect(() => {
    console.log("check tableData in pre mitigation-->", tableData);
    if (!!tableData && !!tableData.length) {
      const maxScore = tableData.reduce((max: any, row: any) => {
        const rowMax = Math.max(...row.values);
        return rowMax > max ? rowMax : max;
      }, 0);
      const relevantRiskLevels = existingRiskConfig?.riskIndicatorData?.filter(
        (level: any) => {
          const [, riskValue] = level.riskLevel
            .match(/([<>]=?)(-?\d+)/)
            .slice(1);
          return Number(riskValue) <= maxScore;
        }
      );
      setScoreLegends(relevantRiskLevels);
      setIsLoading(false);
    }
  }, [tableData]);

  // useEffect(() => {
  //   console.log("check selected cell-->", selectedCell);
  // }, [selectedCell]);

  const handleCellClick = (rowIndex: any, colIndex: any) => {
    if (
      selectedCell &&
      selectedCell[0] === rowIndex &&
      selectedCell[1] === colIndex
    ) {
      setSelectedCell(null); // Deselect the cell if it was already selected
    } else {
      if ((rowIndex + 1) * (colIndex + 1) < 5) {
        setLevelColor("green");
      } else if ((rowIndex + 1) * (colIndex + 1) < 10) {
        setLevelColor("yellow");
      } else if ((rowIndex + 1) * (colIndex + 1) < 15) {
        setLevelColor("orange");
      } else if ((rowIndex + 1) * (colIndex + 1) < 25) {
        setLevelColor("red");
      }

      setSelectedCell([rowIndex, colIndex]); // Otherwise, select the new cell
      // console.log(
      //   "checkrisk handleClellclick",
      //   (rowIndex + 1) * (colIndex + 1)
      // );

      setPreScore((rowIndex + 1) * (colIndex + 1));
    }
  };

  const getRiskColor = (value: any) => {
    for (let i = 0; i < existingRiskConfig?.riskIndicatorData.length; i++) {
      const [operator, riskValue] =
        existingRiskConfig?.riskIndicatorData[i].riskLevel.split("-");
      const compare = getComparisonFunction(operator);
      // console.log("check if condtion", value, riskValue);

      if (compare(value, Number(riskValue))) {
        return existingRiskConfig?.riskIndicatorData[i].color;
      }
    }
    return "white"; // default color if no risk level matches
  };

  const constructTableData = (cumulativeData: any) => {
    return cumulativeData?.map((item: any, index: number) => {
      console.log("check item in construct table data-->", item);

      const rowIndex = index + 1;
      return {
        label: item?.criteriaType,
        values: [1, 2, 3, 4, 5].map((colIndex) => rowIndex * colIndex),
        texts: [
          item?.score1Text,
          item?.score2Text,
          item?.score3Text,
          item?.score4Text,
          item?.score5Text,
        ],
      };
    });
  };

  return (
    <>
      <Modal
        title={`Score : ${preScore}`}
        centered
        open={preMitigationScoreModal.open}
        onCancel={toggleScoreModal}
        onOk={toggleScoreModal}
        width={"60%"}
      >
        {isLoading ? (
          <CircularProgress />
        ) : (
          <div
            style={{ display: "flex", alignItems: "flex-start", width: "100%" }}
          >
            <table style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th colSpan={6} style={{ textAlign: "center" }}>
                    Scoring
                  </th>
                </tr>
                <tr>
                  {/* <th style={{ width: "50px", textAlign: "center" }}> </th> */}
                  {existingRiskConfig?.riskCumulativeHeader?.map(
                    (header: any, index: any) => (
                      <th
                        key={index}
                        style={{ width: "50px", textAlign: "center" }}
                      >
                        {header}
                      </th>
                    )
                  ) ||
                    ["1", "2", "3", "4", "5"].map((header: any, index: any) => (
                      <th
                        key={index}
                        style={{ width: "50px", textAlign: "center" }}
                      >
                        {header}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row: any, rowIndex: number) => (
                  <tr key={rowIndex}>
                    {/* First cell in each row will contain the static data. */}
                    <td style={{ textAlign: "center" }}>{row.label}</td>
                    {row.values.map((cellValue: any, colIndex: any) => {
                      const cellValue1 = (rowIndex + 1) * (colIndex + 1);
                      const cellColor = getRiskColor(cellValue1);
                      const isSelected =
                        selectedCell &&
                        selectedCell[0] === rowIndex &&
                        selectedCell[1] === colIndex;
                      return (
                        <td
                          key={colIndex}
                          style={{
                            backgroundColor: cellColor,
                            width: "50px",
                            height: "50px",
                            textAlign: "center",
                            cursor: "pointer",
                            border: isSelected ? "2px solid black" : "none", // Add this line for border
                          }}
                          onClick={() => handleCellClick(rowIndex, colIndex)}
                          title={row.texts[colIndex]} // Adding tooltip here
                        >
                          <div
                            style={{
                              backgroundColor: isSelected ? `white` : cellColor,
                              border: `12px solid ${cellColor}`,
                              borderRadius: "50%",
                            }}
                          >
                            {cellValue1}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                marginLeft: "20px", // Adding some margin between the table and the legends div
              }}
            >
              {scoreLegends?.map((level: any, index: any) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    margin: "5px 0",
                  }}
                >
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      backgroundColor: level.color,
                      marginRight: "10px",
                    }}
                  ></div>
                  <span>{`Score ${level.riskLevel.split("-").join("")}`}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};
export default PreMitigationScoreModal;
