import { Table } from "antd";
import React from "react";
import styles from "./style";

type Props = {
  api?: any;
};

const ConsolidatedTable = ({ api }: Props) => {
  const classes = styles();

  const getBackgroundColor = (score: number) => {
    switch (score) {
      case 5:
        return "#00cc44";
      case 4:
        return "#00ff80";
      case 3:
        return "#ffcc00";
      case 2:
        return "#ffdd99";
      case 1:
        return "#ff704d";
      case 0:
        return "#ff1a1a";
      default:
        return "transparent";
    }
  };

  const renderCellWithBackground = (score: number, displayValue: number) => (
    <div
      style={{
        backgroundColor: getBackgroundColor(score),

        borderRadius: "4px",
        width: "70px",
        height: "30px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {displayValue}
    </div>
  );

  const columns = [
    {
      title: "Unit",
      dataIndex: "locationName",
      key: "locationName",
      className: classes.unitColumn,
      width: "220px",
    },
    {
      title: "Document",
      dataIndex: "documents",
      key: "documents",
      render: (record: any) =>
        renderCellWithBackground(record.score, record.score),
      className: classes.unitColumn2,
    },
    {
      title: "HIRA",
      dataIndex: "hira",
      key: "hira",
      render: (record: any) =>
        renderCellWithBackground(record.score, record.score),
      className: classes.unitColumn2,
    },
    {
      title: "Objective & KPI",
      dataIndex: "objAndKpi",
      key: "objAndKpi",
      render: (record: any) =>
        renderCellWithBackground(record.score, record.score),
      className: classes.unitColumn2,
    },
    {
      title: "Average",
      dataIndex: "average",
      key: "average",
      render: (_: any, record: any) => {
        const documentScore = record.documents?.score || 0;
        const hiraScore = record.hira?.score || 0;
        const aspImpScore = record.aspImp?.score || 0;
        const objAndKpiScore = record.objAndKpi?.score || 0;
        const average =
          (documentScore + hiraScore + aspImpScore + objAndKpiScore) / 4;
        const roundedAverage = Math.round(average);
        return renderCellWithBackground(
          roundedAverage,
          Number(average.toFixed(2))
        );
      },
      className: classes.unitColumn2,
    },
  ];

  return (
    <div style={{ width: "45%", marginBottom: "50px", marginLeft: "10px" }}>
      <Table
        dataSource={api}
        columns={columns}
        className={classes.tableContainer}
        pagination={false}
        scroll={{ y: 500 }}
      />
    </div>
  );
};

export default ConsolidatedTable;
