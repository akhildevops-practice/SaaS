import React, { useEffect, useState } from "react";
import { Table, Button, Modal } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useSnackbar } from "notistack";
import styles from "./style";

type Props = {
  rootAnalysisdataSource?: any;
  setRootAnalysisDataSource?: any;
  setCauseWiseData?: any;
  formData?: any;
  setformdata?: any;
  readMode?: any;
};

const RootAnalysis = ({
  rootAnalysisdataSource,
  setRootAnalysisDataSource,
  setCauseWiseData,
  formData,
  setformdata,
  readMode,
}: Props) => {
  const classes = styles();
  const { enqueueSnackbar } = useSnackbar();

  // Find the max number of causes across all whyX arrays
  const maxCauses = rootAnalysisdataSource.why1
    ? rootAnalysisdataSource.why1.length
    : 2; // Default to 2 if why1 is missing

  // Generate column names dynamically based on maxCauses
  const selectedColumns = Array.from(
    { length: maxCauses },
    (_, i) => `Cause (${i + 1})`
  );

  // Handle input change in TextArea
  const handleInputChange = (whyKey: string, index: number, value: string) => {
    setRootAnalysisDataSource((prev: any) => {
      const updatedCauses = [...prev[whyKey]];
      updatedCauses[index] = value; // Update the specific cause

      return {
        ...prev,
        [whyKey]: updatedCauses,
      };
    });
  };

  const filteredDataSource = Object.keys(rootAnalysisdataSource)
    .filter((key) => key.startsWith("why")) // Exclude `_id`
    .reduce((acc, key) => {
      acc[key] = rootAnalysisdataSource[key];
      return acc;
    }, {} as Record<string, any>);

  const tableData = Object.entries(filteredDataSource).map(
    ([whyKey, causes]: any, index) => {
      const row: Record<string, any> = {
        key: index,
        rootCause: `Why (${index + 1})`,
      };

      selectedColumns.forEach((col: any, i: any) => {
        row[col] = causes[i] || "";
      });

      return row;
    }
  );

  // useEffect(() => {
  //   setData(tableData);
  // }, tableData);

  // Define table columns
  const columns = [
    {
      title: "Root Cause",
      dataIndex: "rootCause",
      key: "rootCause",
      render: (text: any) => <strong>{text}</strong>,
    },
    ...selectedColumns.map((col, colIndex) => ({
      title: col,
      dataIndex: col,
      key: col,
      render: (_: any, record: any) => {
        const whyKey = `why${record.key + 1}`; // why1, why2, etc.
        return (
          <TextArea
            autoSize={{ minRows: 1, maxRows: 10 }}
            value={rootAnalysisdataSource[whyKey]?.[colIndex] || ""}
            onChange={(e) =>
              handleInputChange(whyKey, colIndex, e.target.value)
            }
            className={classes.textArea}
            disabled={
              readMode ||
              formData?.status === "Open" ||
              formData?.status === "Outcome_In_Progress" ||
              formData?.status === "Draft" ||
              formData?.status === "Closed" ||
              formData?.status === "Rejected" ||
              formData?.status === ""
            }
          />
        );
      },
    })),
  ];

  return (
    <>
      <div className={classes.IsNotContainer}>
        <div className={classes.textContainer}>
          <p className={classes.IsNotText}>Root Cause</p>
          <p className={classes.text}>
            Perform Why-Why for the Causes Selected
          </p>
        </div>
      </div>

      <div className={classes.tableContainer} style={{ marginTop: "20px" }}>
        <Table
          columns={columns}
          dataSource={tableData}
          pagination={false}
          bordered
          className={classes.documentTable}
        />
      </div>
    </>
  );
};

export default RootAnalysis;
