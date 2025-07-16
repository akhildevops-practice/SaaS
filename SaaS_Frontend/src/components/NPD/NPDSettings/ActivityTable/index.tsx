import React, { useState, useEffect } from "react";
import { Table, Input, Button, Tooltip } from "antd";

import {
  AiOutlineEyeInvisible,
  AiOutlineEye,
  AiOutlineDelete,
  AiOutlineMinusCircle,
  AiOutlinePlusCircle,
} from "react-icons/ai";
import styles from "./style";

interface SubActivity {
  key: number;
  subActivity: string;
}

interface Evidence {
  key: number;
  id: string; // Add unique ID field
  evidenceName: string; // Store evidence name
}

interface ActivityData {
  key: number;
  activity: string;
  subActivities: SubActivity[];
  evidence: Evidence[];
  addingEvidence: boolean;
  showSubRows: boolean;
  showEvidence: boolean;
}

type Props = {
  setFormattedData?: any;
  formattedData?: any;
  editFormData?: any;
};

const ActivityTable = ({
  formattedData,
  setFormattedData,
  editFormData,
}: Props) => {
  const classes = styles();
  const [data, setData] = useState<ActivityData[]>([]);

  // Initialize data from editFormData
  useEffect(() => {
    if (editFormData) {
      const formattedData = editFormData.map((item: any) => ({
        key: Number(item.id),
        activity: item.activity,
        subActivities: item.subActivity.map((sub: any) => ({
          key: Number(sub.id),
          subActivity: sub.title,
        })),
        evidence: item.evidence.map((ev: any) => ({
          key: Number(ev.id),
          id: ev.id,
          evidenceName: ev.evidenceName,
        })),
        addingEvidence: false,
        showSubRows: true,
        showEvidence: false,
      }));
      setData(formattedData);
    }
  }, [editFormData]);

  useEffect(() => {
    const handleResizeObserverError = (event: any) => {
      event.preventDefault();
    };
    window.addEventListener("error", handleResizeObserverError);

    return () => {
      window.removeEventListener("error", handleResizeObserverError);
    };
  }, []);

  const addRow = () => {
    setData([
      ...data,
      {
        key: Date.now(),
        activity: "",
        subActivities: [],
        evidence: [],
        addingEvidence: false,
        showSubRows: true,
        showEvidence: false,
      },
    ]);
  };

  const deleteRow = (index: number) => {
    const newData = [...data];
    newData.splice(index, 1);
    setData(newData);
  };

  const updateActivity = (index: number, value: string) => {
    const newData = [...data];
    newData[index].activity = value;
    setData(newData);
  };

  const addSubActivity = (index: number) => {
    const newData = [...data];
    newData[index].subActivities.push({ key: Date.now(), subActivity: "" });
    setData(newData);
  };

  const updateSubActivity = (
    index: number,
    subIndex: number,
    value: string
  ) => {
    const newData = [...data];
    newData[index].subActivities[subIndex].subActivity = value;
    setData(newData);
  };

  const deleteSubActivity = (index: number, subIndex: number) => {
    const newData = [...data];
    newData[index].subActivities.splice(subIndex, 1);
    setData(newData);
  };

  const addEvidence = (index: number) => {
    const newData = [...data];
    newData[index].addingEvidence = true;
    newData[index].evidence.push({
      key: Date.now(),
      id: generateUniqueId(), // Generate unique ID for evidence
      evidenceName: "", // Initialize evidence name
    });
    setData(newData);
  };

  const updateEvidence = (index: number, evIndex: number, value: string) => {
    const newData = [...data];
    newData[index].evidence[evIndex].evidenceName = value; // Update evidence name
    setData(newData);
  };

  const deleteEvidence = (index: number, evIndex: number) => {
    const newData = [...data];
    newData[index].evidence.splice(evIndex, 1);
    setData(newData);
  };

  const toggleSubRows = (index: number) => {
    const newData = [...data];
    newData[index].showSubRows = !newData[index].showSubRows;
    if (newData[index].showSubRows) {
      newData[index].showEvidence = false;
    }
    setData(newData);
  };

  const toggleEvidence = (index: number) => {
    const newData = [...data];
    newData[index].showEvidence = !newData[index].showEvidence;
    if (newData[index].showEvidence) {
      newData[index].showSubRows = false;
    }
    setData(newData);
  };

  const generateUniqueId = () => {
    return `id-${Math.random().toString(36).substr(2, 9)}`;
  };

  const formatData = () => {
    const formatted = data.map((activity) => ({
      activity: activity.activity,
      id: String(activity.key),
      evidence: activity.evidence.map((ev) => ({
        id: ev.id, // Include unique ID
        evidenceName: ev.evidenceName, // Include evidence name
      })),
      subActivity: activity.subActivities.map((sub) => ({
        title: sub.subActivity,
        id: String(sub.key),
      })),
    }));
    setFormattedData(formatted);
  };

  useEffect(() => {
    formatData();
  }, [data]);

  const columns = [
    {
      title: "Activity",
      dataIndex: "activity",
      key: "activity",
      width: "700px",
      render: (_: any, record: ActivityData, index: number) => (
        <div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <Tooltip
              title={
                record.showSubRows ? "Hide Sub-Activity" : "Show Sub-Activity"
              }
              color="purple"
            >
              <Button
                type="dashed"
                icon={
                  record.showSubRows ? (
                    <AiOutlineEyeInvisible />
                  ) : (
                    <AiOutlineEye />
                  )
                }
                onClick={() => toggleSubRows(index)}
                style={{ marginBottom: "10px" }}
              />
            </Tooltip>
            <Input
              value={record.activity}
              onChange={(e) => updateActivity(index, e.target.value)}
              placeholder="Enter activity"
              style={{ marginBottom: "10px" }}
            />
            <Tooltip title="Add Sub-Activity" color="purple">
              <Button
                type="dashed"
                icon={<AiOutlinePlusCircle />}
                onClick={() => addSubActivity(index)}
                style={{ marginBottom: "10px" }}
              ></Button>
            </Tooltip>
            <Tooltip title="Delete Activity" color="magenta">
              <Button
                type="dashed"
                icon={<AiOutlineMinusCircle />}
                onClick={() => deleteRow(index)}
                style={{ marginBottom: "10px" }}
              />
            </Tooltip>
          </div>
          {record.showSubRows &&
            record.subActivities.map((sub, subIndex) => (
              <div
                key={sub.key}
                style={{
                  display: "flex",
                  gap: "10px",
                  paddingLeft: "20px",
                  marginBottom: "10px",
                  alignItems: "center",
                  marginLeft: "50px",
                }}
              >
                <Input
                  value={sub.subActivity}
                  onChange={(e) =>
                    updateSubActivity(index, subIndex, e.target.value)
                  }
                  placeholder="Enter sub activity"
                  style={{ width: "400px" }}
                />
                <Button
                  icon={<AiOutlineDelete />}
                  onClick={() => deleteSubActivity(index, subIndex)}
                />
              </div>
            ))}
        </div>
      ),
    },
    {
      title: "Evidences",
      dataIndex: "evidence",
      key: "evidence",
      width: "600px",
      render: (_: any, record: ActivityData, index: number) => (
        <div>
          {record.showEvidence ? (
            <Button
              type="dashed"
              icon={<AiOutlineEyeInvisible />}
              onClick={() => toggleEvidence(index)}
              style={{ marginBottom: "10px", marginLeft: "10px" }}
            >
              Hide Evidences
            </Button>
          ) : (
            <Button
              type="dashed"
              icon={<AiOutlineEye />}
              onClick={() => toggleEvidence(index)}
              style={{ marginBottom: "10px" }}
            >
              View Applicable Evidences
            </Button>
          )}
          {record.showEvidence &&
            record.evidence.map((ev, evIndex) => (
              <div
                key={ev.key}
                style={{
                  display: "flex",
                  gap: "10px",
                  paddingLeft: "20px",
                  marginBottom: "10px",
                }}
              >
                <Input
                  value={ev.evidenceName}
                  onChange={(e) =>
                    updateEvidence(index, evIndex, e.target.value)
                  }
                  placeholder="Enter evidence"
                  style={{ width: "400px" }}
                />
                <Button
                  icon={<AiOutlineDelete />}
                  onClick={() => deleteEvidence(index, evIndex)}
                />
              </div>
            ))}
          {record.showEvidence && (
            <div style={{ marginTop: "10px" }}>
              <Button
                type="dashed"
                icon={<AiOutlinePlusCircle />}
                onClick={() => addEvidence(index)}
              >
                Add Evidence
              </Button>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className={classes.main_container}>
      <div style={{ width: "87%" }}>
        <Button
          // type="primary"
          onClick={addRow}
          style={{
            marginBottom: "20px",
            backgroundColor: "#0A4764",
            color: "white",
          }}
        >
          Add Activity
        </Button>
      </div>

      <div className={classes.tableContainer}>
        <Table
          dataSource={data}
          columns={columns}
          pagination={false}
          className={classes.documentTable}
        />
      </div>
    </div>
  );
};

export default ActivityTable;
