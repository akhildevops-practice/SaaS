import React, { useState, useEffect } from "react";
import { Table, Input, Tag, Space, Button, message } from "antd";
import { AiOutlinePlusCircle, AiOutlineEdit, AiOutlineDelete  } from "react-icons/ai";
// import axios from "axios";
import useStyles from "./style";
import checkRole from "utils/checkRoles";
import axios from "apis/axios.global";

interface DataType {
  key: string;
  impactType: string;
  impact: string[];
  impactInput: string;
  editable: boolean;
}

const ImpactTable: React.FC = () => {
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(false);
  const classes = useStyles();
  const isOrgAdmin = checkRole("ORG-ADMIN");
  const isMR = checkRole("MR");
  // Fetch data from API
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/audit-settings/getAllImpact`);
      setData(
        response.data.map((item: any) => ({
          key: item._id,
          id: item?._id,
          impactType: item.impactType,
          impact: item.impact || [],
          impactInput: "",
          editable: false,
        }))
      );
    } catch (error) {
      message.error("Failed to fetch data");
    }
    setLoading(false);
  };

  // Save data to API (Update or Add)
  const saveData = async (record: any) => {
    setLoading(true);
    try {
      if (record.key.startsWith("new")) {
        // Create new entry
        const response = await axios.post(`/api/audit-settings/createImpact`, {
          impactType: record.impactType,
          impact: record.impact,
        });
      } else {
        // Update existing entry
        await axios.put(`/api/audit-settings/updateImpact/${record?.id}`, {
          impactType: record.impactType,
          impact: record.impact,
        });
      }
      message.success("Data saved successfully");
      fetchData();
    } catch (error) {
      message.error("Failed to save data");
    }
    setLoading(false);
  };

  // Delete data from API
  const deleteData = async (record: any) => {
    setLoading(true);
    try {
      await axios.delete(`/api/audit-settings/deleteImpact/${record?.id}`);
      setData((prevData) =>
        prevData.filter((item) => item.key !== record?.key)
      );
      message.success("Data deleted successfully");
      fetchData();
    } catch (error) {
      message.error("Failed to delete data");
    }
    setLoading(false);
  };

  // Toggle edit mode
  const toggleEdit = (key: string) => {
    setData((prevData) =>
      prevData.map((item) =>
        item.key === key ? { ...item, editable: !item.editable } : item
      )
    );
  };

  // Handle impact type change
  const handleImpactTypeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string
  ) => {
    setData((prevData) =>
      prevData.map((item) =>
        item.key === key ? { ...item, impactType: e.target.value } : item
      )
    );
  };

  // Handle impact input change
  const handleImpactInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string
  ) => {
    setData((prevData) =>
      prevData.map((item) =>
        item.key === key ? { ...item, impactInput: e.target.value } : item
      )
    );
  };

  // Add impact to list
  const handleImpactEnter = (key: string) => {
    setData((prevData) =>
      prevData.map((item) =>
        item.key === key && item.impactInput.trim()
          ? {
              ...item,
              impact: [...item.impact, item.impactInput],
              impactInput: "",
            }
          : item
      )
    );
  };

  // Remove impact tag
  const handleRemoveTag = (key: string, index: number) => {
    setData((prevData) =>
      prevData.map((item) =>
        item.key === key
          ? { ...item, impact: item.impact.filter((_, i) => i !== index) }
          : item
      )
    );
  };

  // Add new row
  const addRow = () => {
    setData((prevData) => [
      ...prevData,
      {
        key: `new-${Date.now()}`,
        impactType: "",
        impact: [],
        impactInput: "",
        editable: true,
      },
    ]);
  };

  // Table columns
  const columns = [
    {
      title: "Impact Type",
      dataIndex: "impactType",
      key: "impactType",
      width: 300,
      render: (_: any, record: DataType) =>
        record.editable ? (
          <Input
            value={record.impactType}
            placeholder="Enter impact type"
            onChange={(e) => handleImpactTypeChange(e, record.key)}
            style={{ width: "100%", padding: "6px 12px", borderRadius: "6px" }}
          />
        ) : (
          <span>{record.impactType || "-"}</span>
        ),
    },
    {
      title: "Impact",
      dataIndex: "impact",
      key: "impact",
      width: 600,
      render: (_: any, record: DataType) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "5px",
              maxWidth: "100%",
            }}
          >
            {record.impact.length > 0 &&
              record.impact.map((tag, index) => (
                <Tag
                  key={index}
                  closable={record.editable}
                  onClose={() => handleRemoveTag(record.key, index)}
                  style={{
                    backgroundColor: "#e6f7ff",
                    color: "#000",
                    border: "1px solid #91d5ff",
                    padding: "5px 10px",
                    borderRadius: "4px",
                    width: "auto",
                    maxWidth: "100%",
                    wordBreak: "break-word",
                  }}
                >
                  {tag}
                </Tag>
              ))}
          </div>

          {record.editable && (
            <Input
              value={record.impactInput}
              placeholder="Enter impact & press Enter"
              onChange={(e) => handleImpactInputChange(e, record.key)}
              onPressEnter={() => handleImpactEnter(record.key)}
              suffix={<AiOutlinePlusCircle style={{ color: "#1890ff" }} />}
              style={{
                width: "100%",
                padding: "6px 12px",
                borderRadius: "6px",
              }}
            />
          )}
        </div>
      ),
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (_: any, record: DataType) => (
        <Space>
          <Button
            icon={<AiOutlineEdit />}
            onClick={() => {
              if (record?.editable) {
                saveData(record);
              } else {
                toggleEdit(record.key);
              }
            }}
            type="primary"
          >
            {record.editable ? "Save" : "Edit"}
          </Button>
          <Button
            icon={<AiOutlineDelete />}
            onClick={() => deleteData(record)}
            type="default"
            danger
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          paddingBottom: "10px",
        }}
      >
        {(isOrgAdmin || isMR) && (
          <Button
            onClick={addRow}
            style={{ backgroundColor: "#0E497A", color: "#ffffff" }}
          >
            Add
          </Button>
        )}
      </div>
      <div data-testid="custom-table" className={classes.tableContainer}>
        <Table
          columns={columns}
          dataSource={data}
          className={classes.documentTable}
          pagination={false}
          loading={loading}
        />
      </div>
    </>
  );
};

export default ImpactTable;
