import React, { useState, useEffect } from "react";
import { Table, Input, Button, Space, Tooltip } from "antd";
import { AiOutlineEdit, AiOutlinePlusCircle, AiOutlineDelete  } from "react-icons/ai";

import { MdOutlineCheckCircle } from 'react-icons/md';
import type { ColumnsType } from "antd/es/table";
import styles from "./styles";

interface DataType {
  key: string;
  riskScoring: string;
  riskLevel: string;
  indications: string;
}

type Props = {
  riskConfigurationData?: DataType[];
  configurationData?: any;
  setRiskConfigurationData?: (data: DataType[]) => void;
  impactArea?: string[];
  setImpactArea?: (data: string[]) => void;
};

const Index = ({
  configurationData,
  setRiskConfigurationData,
  riskConfigurationData = [],
  impactArea = [],
  setImpactArea,
}: Props) => {
  const classes = styles();

  const [editingKeys, setEditingKeys] = useState<string[]>([]);

  // Map API data to state
  useEffect(() => {
    if (configurationData) {
      const riskData = Array.isArray(configurationData[0]?.riskConfig?.[0])
        ? configurationData[0]?.riskConfig[0]
        : [];

      if (setRiskConfigurationData) {
        setRiskConfigurationData(riskData);
      }

      const impactData = Array.isArray(configurationData[0]?.impactArea?.[0])
        ? configurationData[0]?.impactArea[0]
        : [];

      if (setImpactArea) {
        setImpactArea(impactData);
      }
    }
  }, [configurationData, setRiskConfigurationData, setImpactArea]);

  // Ensure at least one row or input is displayed by default
  useEffect(() => {
    if (riskConfigurationData.length === 0 && setRiskConfigurationData) {
      setRiskConfigurationData([
        {
          key: "1",
          riskScoring: "",
          riskLevel: "",
          indications: "#FFFFFF",
        },
      ]);
      setEditingKeys(["1"]);
    }

    if (impactArea.length === 0 && setImpactArea) {
      setImpactArea([""]);
    }
  }, [
    riskConfigurationData,
    setRiskConfigurationData,
    impactArea,
    setImpactArea,
  ]);

  // Handle adding new input field
  const addInput = () => {
    if (setImpactArea) {
      setImpactArea([...impactArea, ""]);
    }
  };

  // Handle removing an input field
  const removeInput = (index: number) => {
    if (setImpactArea) {
      setImpactArea(impactArea.filter((_, i) => i !== index));
    }
  };

  // Handle input change
  const handleInputChange = (
    value: string,
    key: string,
    field: keyof DataType
  ) => {
    if (setRiskConfigurationData) {
      setRiskConfigurationData(
        riskConfigurationData?.map((item) =>
          item.key === key ? { ...item, [field]: value } : item
        )
      );
    }
  };

  // Toggle edit mode
  const toggleEditMode = (key: string) => {
    if (editingKeys.includes(key)) {
      setEditingKeys(editingKeys.filter((k) => k !== key));
    } else {
      setEditingKeys([...editingKeys, key]);
    }
  };
  const removeRow = (key: string) => {
    const updatedRiskConfigurationData = riskConfigurationData.filter(
      (item) => item.key !== key
    );

    const updatedEditingKeys = editingKeys.filter((editKey) => editKey !== key);
    // console.log("riskConfig after update", updatedRiskConfigurationData);
    if (setRiskConfigurationData) {
      setRiskConfigurationData(updatedRiskConfigurationData);
      setEditingKeys(updatedEditingKeys);
    }
  };
  console.log("riskConfig after update", riskConfigurationData);
  // Add a new row
  const addRow = () => {
    const newKey = (riskConfigurationData.length + 1).toString();
    if (setRiskConfigurationData) {
      setRiskConfigurationData([
        ...riskConfigurationData,
        {
          key: newKey,
          riskScoring: "",
          riskLevel: "",
          indications: "#FFFFFF",
        },
      ]);
      setEditingKeys([...editingKeys, newKey]);
    }
  };

  // Columns for the table
  const columns: ColumnsType<DataType> = [
    {
      title: "Risk Scoring",
      dataIndex: "riskScoring",
      key: "riskScoring",
      render: (text, record) => (
        <Input
          value={text}
          disabled={!editingKeys.includes(record.key)}
          onChange={(e) =>
            handleInputChange(e.target.value, record.key, "riskScoring")
          }
          style={{ backgroundColor: "white" }}
        />
      ),
    },
    {
      title: "Risk Level",
      dataIndex: "riskLevel",
      key: "riskLevel",
      render: (text, record) => (
        <Input
          value={text}
          disabled={!editingKeys.includes(record.key)}
          onChange={(e) =>
            handleInputChange(e.target.value, record.key, "riskLevel")
          }
          style={{ backgroundColor: "white" }}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          {editingKeys.includes(record.key) ? (
            <>
              <Tooltip title="Save">
                <Button
                  icon={<MdOutlineCheckCircle />}
                  onClick={() => toggleEditMode(record.key)}
                />
              </Tooltip>
              <Tooltip title="Delete">
                <Button
                  icon={<AiOutlineDelete />}
                  onClick={() => removeRow(record?.key)}
                />
              </Tooltip>
            </>
          ) : (
            <>
              <Tooltip title="Edit">
                <Button
                  icon={<AiOutlineEdit />}
                  onClick={() => toggleEditMode(record.key)}
                />
              </Tooltip>
              <Tooltip title="Delete">
                <Button
                  icon={<AiOutlineDelete />}
                  onClick={() => removeRow(record?.key)}
                />
              </Tooltip>
              {riskConfigurationData.length - 1 ===
                riskConfigurationData.findIndex(
                  (item) => item.key === record.key
                ) && <Button icon={<AiOutlinePlusCircle />} onClick={addRow} />}
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ width: "60%", marginLeft: "100px" }}>
      {/* Table Section */}
      <div
        style={{ flex: 3, marginBottom: "30px" }}
        className={classes.tableContainer}
      >
        <Table
          columns={columns}
          dataSource={riskConfigurationData}
          pagination={false}
          rowKey="key"
          className={classes.documentTable}
        />
      </div>
      <div style={{ marginBottom: "20px", flex: 1 }}>
        <p style={{ fontSize: "14px", color: "#00224E", fontWeight: "bold" }}>
          Impact Areas
        </p>
        {impactArea.map((input, index) => (
          <div
            key={index}
            style={{
              marginBottom: "10px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Input
              value={input}
              onChange={(e) => {
                const newInputs = [...impactArea];
                newInputs[index] = e.target.value;
                if (setImpactArea) {
                  setImpactArea(newInputs);
                }
              }}
              style={{ marginRight: "10px" }}
            />
            <Button
              icon={<AiOutlinePlusCircle />}
              onClick={addInput}
              style={{ marginRight: "10px" }}
            />
            {impactArea.length > 1 && (
              <Button
                icon={<AiOutlineDelete />}
                onClick={() => removeInput(index)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Index;
