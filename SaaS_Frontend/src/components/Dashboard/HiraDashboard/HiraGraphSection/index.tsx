import { Paper, useMediaQuery } from "@material-ui/core";
import HiraHazardTypeChart from "./HiraHazardTypeChart";
import HiraConditionChart from "./HiraConditionChart";
import { useState } from "react";
import getSessionStorage from "utils/getSessionStorage";
// import HiraRiskMeterChart from "./HiraRiskMeterChart";
import HiraRiskLevelChart from "./HiraRiskLevelChart";
import HiraConsolidatedCountTableChart from "./HiraConsolidatedCountTableChart";
// import HiraScoreTrendChart from "./HiraScoreTrendChart";
import { AiOutlineArrowsAlt } from "react-icons/ai";

import { Button, message, Modal, Skeleton, Tag } from "antd";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import HiraTopTen from "./HiraTopTen";
import HiraTableSection from "../HiraTableSection";
import { AiOutlineFileExcel } from "react-icons/ai";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import RiskLevelInfoPopover from "./RiskLevelInfoPopover";
type Props = {
  formData: any;
  hazardGraphData?: any;
  conditionGraphData?: any;
  hiraAverageRiskScore?: any;
  topTenRiskTableData?: any;
  hiraRiskLevelData?: any;
  significanHiraGraphData?: any;
  tableFilters?: any;
  setTableFilters?: any;
  consolidatedCountTableData?: any;
  tags?: any;
  graphLoaders?: any;
  showTableModal?: any;
  setShowTableModal?: any;
  allHiraTableData?: any;
  handleChangePageNewForAll?: any;
  paginationForAll?: any;
  showTotalForAll?: any;
  allHiraTableDataLoading?: any;
  getHiraWithStepsWithFiltersForExcel?: any;
  isPrimaryFilter?: any;
};
const backgroundColors = [
  "#21618C",
  "#DC5F00",
  "#686D76",
  "#C73659",
  "#373A40",
  "#f0cb28",
  "#699eb0",
  "#b4a97e",
  "#CCC5A8",
  "#DBDB46",
  "#6b85fa",
  "#6b85fa",
  "#BDE0FE",
  "#FFD6A5",
  "#FFADAD",
  "#9BF6FF",
  "#CAFFBF",
  "#A0C4FF",
];

const HiraGraphSection = ({
  formData,
  hazardGraphData,
  conditionGraphData,
  hiraAverageRiskScore,
  topTenRiskTableData,
  hiraRiskLevelData,
  significanHiraGraphData,
  tableFilters,
  setTableFilters,
  graphLoaders,
  consolidatedCountTableData = [],
  tags,
  showTableModal = false,
  setShowTableModal,
  allHiraTableData = [],
  handleChangePageNewForAll,
  paginationForAll,
  showTotalForAll,
  allHiraTableDataLoading = false,
  getHiraWithStepsWithFiltersForExcel,
  isPrimaryFilter = false,
}: Props) => {
  const matches = useMediaQuery("(min-width:820px)");
  const smallScreen = useMediaQuery("(min-width:450px)");
  const userDetails = getSessionStorage();
  console.log("checkfilter tablemodal:", showTableModal);

  const [isModalOpenForHazard, setIsModalOpenForHazard] = useState(false);

  const showModalForHazard = () => {
    setIsModalOpenForHazard(true);
  };
  const handleOkForHazard = () => {
    setIsModalOpenForHazard(false);
  };

  const handleCancelForHazard = () => {
    setIsModalOpenForHazard(false);
  };

  const [isModalOpenForCondition, setIsModalOpenForCondition] = useState(false);

  const showModalForCondition = () => {
    setIsModalOpenForCondition(true);
  };
  const handleOkForCondition = () => {
    setIsModalOpenForCondition(false);
  };

  const handleCancelForCondition = () => {
    setIsModalOpenForCondition(false);
  };

  //  for top 10 risk table  RiskTable

  const [isModalOpenForRiskTable, setIsModalOpenForRiskTable] = useState(false);
  const [top10Risks, setTop10Risks] = useState(false);

  const showModalForRiskTable = () => {
    setIsModalOpenForRiskTable(true);
    setTop10Risks(true);
  };
  const handleOkForRiskTable = () => {
    setIsModalOpenForRiskTable(false);
    setTop10Risks(false);
  };

  const handleCancelForRiskTable = () => {
    setIsModalOpenForRiskTable(false);
    setTop10Risks(false);
  };

  const getStatusText = (status: string = ""): string => {
    switch (status) {
      case "DRAFT":
        return "DRAFT";
      case "IN_REVIEW":
        return "IN REVIEW";
      case "IN_APPROVAL":
        return "IN APPROVAL";
      case "APPROVED":
        return "APPROVED";
      case "REJECTED":
        return "REJECTED";
      default:
        return "N/A";
    }
  };

  const exportToExcel = async () => {
    const { list: hiraList } = await getHiraWithStepsWithFiltersForExcel(
      isPrimaryFilter,
      false
    );

    if (!hiraList || hiraList.length === 0) {
      message.warning("No HIRA data to export.");
      return;
    }

    const dataForExcel = hiraList.map((item: any) => ({
      "Hira No.": item.prefixSuffix || "N/A",
      "Job Title": item.jobTitle || "N/A",
      "Routine/Non Routine": item.riskTypeDetails?.name || "N/A",
      Condition: item.conditionDetails?.name || "N/A",
      "Dept/Vertical": item.entityDetails?.entityName || "N/A",
      Area: item.areaDetails?.name || item.area || "N/A",
      Section: item.sectionDetails?.name || item.section || "N/A",
      Version: item.currentVersion ?? 0,
      Status: getStatusText(item.workflowStatus),
      Creator: item.createdByDetails
        ? `${item.createdByDetails?.firstname || ""} ${
            item.createdByDetails?.lastname || ""
          }`.trim()
        : "N/A",
      Reviewers:
        item.reviewersDetails
          ?.map((r: any) => `${r.firstname} ${r.lastname}`)
          .join(", ") || "N/A",
      Approvers:
        item.approversDetails
          ?.map((a: any) => `${a.firstname} ${a.lastname}`)
          .join(", ") || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);

    // Set all columns to width 30
    worksheet["!cols"] = new Array(Object.keys(dataForExcel[0]).length).fill({
      wch: 30,
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "HIRA Data");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "binary",
    });

    const s2ab = (s: string) => {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
      return buf;
    };

    const data = new Blob([s2ab(excelBuffer)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(data, "HIRA_Data.xlsx");
  };

  const exportConsolidatedToExcel = () => {
    if (!consolidatedCountTableData?.length) {
      message.warning("No consolidated data to export.");
      return;
    }

    const excelData: any[] = [];

    consolidatedCountTableData.forEach((location: any) => {
      location.entityGroupedCount?.forEach((entity: any) => {
        if (entity.sectionWiseData?.length > 0) {
          entity.sectionWiseData.forEach((section: any) => {
            excelData.push({
              "Corp Func/Unit": location.locationName,
              "Dept/Vertical": entity.entityName,
              "Section Name": section.sectionName || "N/A",
              Draft: section.DRAFT ?? 0,
              "In Workflow": section.inWorkflow ?? 0,
              Approved: section.APPROVED ?? 0,
              Total: section.total ?? 0,
            });
          });
        } else {
          // If no section data, add entity-level row
          excelData.push({
            "Corp Func/Unit": location.locationName,
            "Dept/Vertical": entity.entityName,
            "Section Name": "N/A",
            Draft: entity.DRAFT ?? 0,
            "In Workflow": entity.inWorkflow ?? 0,
            Approved: entity.APPROVED ?? 0,
            Total: entity.total ?? 0,
          });
        }
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set all columns to width 30
    worksheet["!cols"] = new Array(Object.keys(excelData[0]).length).fill({
      wch: 20,
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "HIRA Consolidated");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "binary",
    });

    const s2ab = (s: string) => {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
      return buf;
    };

    const data = new Blob([s2ab(excelBuffer)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(data, "HIRA_Consolidated_Report.xlsx");
  };

  return (
    <>
      <Modal
        title=""
        open={showTableModal?.hazard}
        width={"auto"}
        footer={null}
        onCancel={() =>
          setShowTableModal({
            ...showTableModal,
            hazard: false,
          })
        }
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{
              width: "30px",
              height: "38px",
              cursor: "pointer",
              marginTop: "-5px",
            }}
          />
        }
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "12px 20px",
          }}
        >
          <Button
            type="primary"
            onClick={exportToExcel}
            icon={<AiOutlineFileExcel />}
          >
            Download Excel
          </Button>
        </div>

        <HiraTableSection
          allHiraTableData={allHiraTableData}
          handleChangePageNewForAll={handleChangePageNewForAll}
          paginationForAll={paginationForAll}
          showTotalForAll={showTotalForAll}
          allHiraTableDataLoading={allHiraTableDataLoading}
        />
      </Modal>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start", // Changed to flex-start to align items from the start
          flexWrap: "wrap",
          padding: "15px 0",
          // backgroundColor: "#f8f9f9",
          marginTop: "3px",
          marginLeft: "15px",
          marginRight: "15px",
        }}
      >
        <Paper
          elevation={0}
          style={{
            position: "relative",
            width: matches ? "47%" : "100%",
            height: "320px",
            margin: matches ? " 0px 15px" : "30px 5px",
            padding: matches ? "10px" : "5px",
            display: "flex",
            justifyContent: "center",
            backgroundColor: "#fff",
            borderRadius: "12px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          }}
        >
          <div style={{ display: "flex", width: "100%", height: "100%" }}>
            {/* Left Legends */}
            <div
              style={{
                width: "25%",
                padding: "10px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                overflowY: "auto",
                justifyContent: "center",
                maxHeight: "280px",
                alignSelf: "center",
              }}
            >
              {hazardGraphData
                ?.slice(0, Math.ceil(hazardGraphData.length / 2))
                .map((item: any, index: number) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "11px",
                      fontFamily: "Poppins",
                      cursor: "pointer",
                    }}
                    title={`${item.hazardName}: ${item.count}`}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        minWidth: "8px",
                        minHeight: "8px",
                        backgroundColor: backgroundColors[index],
                        borderRadius: "2px",
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.hazardName}
                    </span>
                  </div>
                ))}
            </div>

            {/* Chart */}
            <div style={{ width: "50%", height: "100%" }}>
              {graphLoaders?.hazardGraph ? (
                <Skeleton active />
              ) : (
                <HiraHazardTypeChart
                  hazardGraphData={hazardGraphData}
                  tableFilters={tableFilters}
                  setTableFilters={setTableFilters}
                  tags={tags}
                  isModalView={false}
                />
              )}
            </div>

            {/* Right Legends */}
            <div
              style={{
                width: "25%",
                padding: "10px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                overflowY: "auto",
                justifyContent: "center",
                maxHeight: "280px",
                alignSelf: "center",
              }}
            >
              {hazardGraphData
                ?.slice(Math.ceil(hazardGraphData.length / 2))
                .map((item: any, index: number) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "11px",
                      fontFamily: "Poppins",
                      cursor: "pointer",
                    }}
                    title={`${item.hazardName}: ${item.count}`}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        minWidth: "8px",
                        minHeight: "8px",
                        backgroundColor:
                          backgroundColors[
                            index + Math.ceil(hazardGraphData.length / 2)
                          ],
                        borderRadius: "2px",
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.hazardName}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {matches ? (
            <div
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                cursor: "pointer",
              }}
            >
              <AiOutlineArrowsAlt onClick={showModalForHazard} />
            </div>
          ) : null}
        </Paper>
        <Paper
          elevation={3}
          style={{
            position: "relative",
            width: matches ? "47%" : "100%", // Adjusted width to fit two papers per row
            height: "320px",
            margin: matches ? " 0px 15px" : "30px 5px",
            padding: matches ? "10px" : "5px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            backgroundColor: "#fff",
            borderRadius: "12px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "10px",
            }}
          >
            {tags?.length ? (
              <>
                {tags?.map((tag: any, index: any) => (
                  <Tag color={tag.color} key={index}>
                    {tag.tagName}
                  </Tag>
                ))}
              </>
            ) : (
              <></>
            )}
          </div>
          <Modal
            title=""
            open={showTableModal?.condition}
            width={"auto"}
            footer={null}
            onCancel={() =>
              setShowTableModal({
                ...showTableModal,
                condition: false,
              })
            }
            closeIcon={
              <img
                src={CloseIconImageSvg}
                alt="close-drawer"
                style={{
                  width: "30px",
                  height: "38px",
                  cursor: "pointer",
                  marginTop: "-5px",
                }}
              />
            }
          >
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                padding: "12px 20px",
              }}
            >
              <Button
                type="primary"
                onClick={exportToExcel}
                icon={<AiOutlineFileExcel />}
              >
                Download Excel
              </Button>
            </div>
            <HiraTableSection
              allHiraTableData={allHiraTableData}
              handleChangePageNewForAll={handleChangePageNewForAll}
              paginationForAll={paginationForAll}
              showTotalForAll={showTotalForAll}
              allHiraTableDataLoading={allHiraTableDataLoading}
            />
          </Modal>
          <div style={{ display: "flex", width: "100%", height: "100%" }}>
            {/* Chart */}
            <div style={{ width: "70%", height: "100%" }}>
              {graphLoaders?.conditionGraph ? (
                <Skeleton active />
              ) : (
                <HiraConditionChart
                  conditionGraphData={conditionGraphData}
                  tableFilters={tableFilters}
                  setTableFilters={setTableFilters}
                  tags={tags}
                  isModalView={false}
                />
              )}
            </div>

            {/* Right Legends */}
            <div
              style={{
                width: "30%",
                padding: "10px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                overflowY: "auto",
                justifyContent: "center",
                maxHeight: "280px",
                alignSelf: "center",
              }}
            >
              {conditionGraphData?.map((item: any, index: number) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    fontSize: "14px",
                    fontFamily: "Poppins",
                    cursor: "pointer",
                  }}
                  title={`${item.conditionName}: ${item.count}`}
                >
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      minWidth: "12px",
                      minHeight: "12px",
                      backgroundColor: backgroundColors[index],
                      borderRadius: "4px",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      fontWeight: 500,
                    }}
                  >
                    {item.conditionName}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {matches ? (
            <div
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                cursor: "pointer",
              }}
            >
              <AiOutlineArrowsAlt onClick={showModalForCondition} />
            </div>
          ) : null}
        </Paper>
        <Paper
          elevation={3}
          style={{
            position: "relative", // Required for absolute children
            width: matches ? "47%" : "100%",
            height: "360px",
            margin: matches ? "30px 15px" : "30px 5px",
            padding: matches ? "10px" : "5px",
            display: "flex",
            justifyContent: "center",
            backgroundColor: "#fff",
            borderRadius: "12px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 1,
            }}
          >
            <RiskLevelInfoPopover />
          </div>
          {graphLoaders?.riskLevelGraph ? (
            <Skeleton active />
          ) : (
            <HiraRiskLevelChart riskLevels={hiraRiskLevelData} tags={tags} />
          )}
        </Paper>

        <Paper
          elevation={3}
          style={{
            position: "relative",
            width: matches ? "47%" : "100%", // Mainta in width consistent with other Papers
            height: "360px", // Set a fixed height
            overflow: "hidden", // Make it scrollable
            margin: matches ? "30px 15px" : "30px 5px",
            padding: matches ? "10px 10px 20px 10px" : "5px",
            display: "flex",
            backgroundColor: "#fff",
            borderRadius: "12px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          }}
        >
          <Modal
            title=""
            open={showTableModal?.topTen}
            width={"auto"}
            footer={null}
            onCancel={() =>
              setShowTableModal({
                ...showTableModal,
                topTen: false,
              })
            }
            closeIcon={
              <img
                src={CloseIconImageSvg}
                alt="close-drawer"
                style={{
                  width: "30px",
                  height: "38px",
                  cursor: "pointer",
                  marginTop: "-5px",
                }}
              />
            }
          >
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                padding: "12px 20px",
              }}
            >
              <Button
                type="primary"
                onClick={exportToExcel}
                icon={<AiOutlineFileExcel />}
              >
                Download Excel
              </Button>
            </div>
            <HiraTableSection
              allHiraTableData={allHiraTableData}
              handleChangePageNewForAll={handleChangePageNewForAll}
              paginationForAll={paginationForAll}
              showTotalForAll={showTotalForAll}
              allHiraTableDataLoading={allHiraTableDataLoading}
            />
          </Modal>
          <HiraTopTen
            topTenRiskTableData={topTenRiskTableData}
            tags={tags}
            top10Risks={top10Risks}
            tableFilters={tableFilters}
            setTableFilters={setTableFilters}
          />

          {matches ? (
            <div
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                cursor: "pointer",
              }}
            >
              <AiOutlineArrowsAlt onClick={showModalForRiskTable} />
            </div>
          ) : null}
        </Paper>
        <Paper
          elevation={3}
          style={{
            position: "relative",
            width: "100%", // Maintain width consistent with other Papers
            height: "400px", // Set a fixed height
            overflow: "auto", // Make it scrollable
            margin: matches ? "15px" : "15px 5px",
            padding: matches ? "10px" : "10px 5px",
            display: "flex",
            flexDirection: "column", // Ensures button and table stack correctly
            justifyContent: "flex-start",
            backgroundColor: "#fff",
            borderRadius: "12px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          }}
        >
          {/* Button container - Right Aligned */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end", // Align button to the right
              padding: "12px 20px",
            }}
          >
            <Button
              type="primary"
              onClick={exportConsolidatedToExcel}
              icon={<AiOutlineFileExcel />}
            >
              Download Excel
            </Button>
          </div>

          {/* Table below */}
          <div style={{ flex: 1, overflow: "auto" }}>
            <HiraConsolidatedCountTableChart
              consolidatedCountTableData={consolidatedCountTableData}
            />
          </div>
        </Paper>

        {/* ---------------// modals------------------ */}

        <Modal
          // title="Filter By Unit"
          open={isModalOpenForHazard}
          onOk={handleOkForHazard}
          onCancel={handleCancelForHazard}
          width="90vw"
          style={{ display: "flex", justifyContent: "center" }}
          footer={null}
          closeIcon={
            <img
              src={CloseIconImageSvg}
              alt="close-drawer"
              style={{
                width: "30px",
                height: "38px",
                cursor: "pointer",
                marginTop: "-5px",
              }}
            />
          }
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            {tags?.length ? (
              <>
                {tags?.map((tag: any, index: any) => (
                  <Tag color={tag.color} key={index}>
                    {tag.tagName}
                  </Tag>
                ))}
              </>
            ) : (
              <></>
            )}
          </div>
          <div
            style={{
              width: "60vw",
              height: "55vh",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "520px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div style={{ display: "flex", width: "100%" }}>
                <div style={{ width: "70%", height: "620px" }}>
                  <HiraHazardTypeChart
                    hazardGraphData={hazardGraphData}
                    tableFilters={tableFilters}
                    setTableFilters={setTableFilters}
                    isModalView={true}
                  />
                </div>
                <div
                  style={{
                    width: "30%",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    overflowY: "auto",
                    justifyContent: "center",
                    maxHeight: "400px",
                    alignSelf: "center",
                  }}
                >
                  {hazardGraphData?.map((item: any, index: number) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        fontSize: "16px",
                        fontFamily: "Poppins",
                        cursor: "pointer",
                      }}
                      title={`${item.hazardName}: ${item.count}`}
                    >
                      <div
                        style={{
                          width: "16px",
                          height: "16px",
                          minWidth: "16px",
                          minHeight: "16px",
                          backgroundColor: backgroundColors[index],
                          borderRadius: "4px",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontWeight: 500,
                        }}
                      >
                        {item.hazardName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Modal>

        <Modal
          open={isModalOpenForCondition}
          onOk={handleOkForCondition}
          onCancel={handleCancelForCondition}
          width="90vw"
          style={{ display: "flex", justifyContent: "center" }}
          footer={null}
          closeIcon={
            <img
              src={CloseIconImageSvg}
              alt="close-drawer"
              style={{
                width: "30px",
                height: "38px",
                cursor: "pointer",
                marginTop: "-5px",
              }}
            />
          }
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            {tags?.length ? (
              <>
                {tags?.map((tag: any, index: any) => (
                  <Tag color={tag.color} key={index}>
                    {tag.tagName}
                  </Tag>
                ))}
              </>
            ) : (
              <></>
            )}
          </div>
          <div
            style={{
              width: "60vw",
              height: "55vh",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "520px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div style={{ display: "flex", width: "100%" }}>
                {/* Left Legends */}
                <div
                  style={{
                    width: "25%",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    overflowY: "auto",
                    justifyContent: "center",
                    maxHeight: "620px",
                    alignSelf: "center",
                  }}
                >
                  {conditionGraphData
                    ?.slice(0, Math.ceil(conditionGraphData?.length / 2))
                    .map((item: any, index: number) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "16px",
                          fontSize: "16px",
                          fontFamily: "Poppins",
                          cursor: "pointer",
                        }}
                        title={`${item.conditionName}: ${item.count}`}
                      >
                        <div
                          style={{
                            width: "16px",
                            height: "16px",
                            minWidth: "16px",
                            minHeight: "16px",
                            backgroundColor: backgroundColors[index],
                            borderRadius: "4px",
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            fontWeight: 500,
                          }}
                        >
                          {item.conditionName}
                        </span>
                      </div>
                    ))}
                </div>

                {/* Chart */}
                <div style={{ width: "50%", height: "620px" }}>
                  <HiraConditionChart
                    conditionGraphData={conditionGraphData}
                    tableFilters={tableFilters}
                    setTableFilters={setTableFilters}
                    isModalView={true}
                  />
                </div>

                {/* Right Legends */}
                <div
                  style={{
                    width: "25%",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    overflowY: "auto",
                    justifyContent: "center",
                    maxHeight: "620px",
                    alignSelf: "center",
                  }}
                >
                  {conditionGraphData
                    ?.slice(Math.ceil(conditionGraphData?.length / 2))
                    .map((item: any, index: number) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "16px",
                          fontSize: "16px",
                          fontFamily: "Poppins",
                          cursor: "pointer",
                        }}
                        title={`${item.conditionName}: ${item.count}`}
                      >
                        <div
                          style={{
                            width: "16px",
                            height: "16px",
                            minWidth: "16px",
                            minHeight: "16px",
                            backgroundColor:
                              backgroundColors[
                                index + Math.ceil(conditionGraphData?.length / 2)
                              ],
                            borderRadius: "4px",
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            fontWeight: 500,
                          }}
                        >
                          {item.conditionName}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </Modal>

        <Modal
          // title="Filter By Unit"
          open={isModalOpenForRiskTable}
          onOk={handleOkForRiskTable}
          onCancel={handleCancelForRiskTable}
          width="90vw"
          style={{ display: "flex", justifyContent: "center" }}
          footer={null}
          closeIcon={
            <img
              src={CloseIconImageSvg}
              alt="close-drawer"
              style={{
                width: "30px",
                height: "38px",
                cursor: "pointer",
                marginTop: "-5px",
              }}
            />
          }
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            {tags?.length ? (
              <>
                {tags?.map((tag: any, index: any) => (
                  <Tag color={tag.color} key={index}>
                    {tag.tagName}
                  </Tag>
                ))}
              </>
            ) : (
              <></>
            )}
          </div>
          <div style={{ width: "1200px" }}>
            <HiraTopTen
              topTenRiskTableData={topTenRiskTableData}
              top10Risks={top10Risks}
            />
          </div>
        </Modal>
      </div>
    </>
  );
};

export default HiraGraphSection;
