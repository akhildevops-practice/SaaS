import React, { useState, useEffect } from "react";
import { Table, Button, Select } from "antd";
import { ColumnsType } from "antd/es/table";
import { AiOutlineEdit } from "react-icons/ai";

import styles from "./styles";
import { MdOutlineCheckCircle } from 'react-icons/md';

const { Option } = Select;

interface ProjectData {
  key: string;
  projectType: string;
  reviewMeetingFrequency: string;
  meetingOccurrence: string;
  activityUpdateFrequency: string;
  updateReminderOn: string;
}

interface ProjectTrackingState {
  projectTracking: ProjectData[];
}

type Props = {
  projectTrackingData?: ProjectTrackingState;
  setProjectTrackingData?: React.Dispatch<
    React.SetStateAction<ProjectTrackingState>
  >;
  configurationData?: any;
  projectTypes?: string[];
};

const ProjectTracking = ({
  configurationData,
  projectTrackingData = { projectTracking: [] },
  setProjectTrackingData = () => {}, // Default no-op function
  projectTypes = [],
}: Props) => {
  const classes = styles();
  const [editMode, setEditMode] = useState<boolean[]>([]);

  useEffect(() => {
    if (configurationData) {
      const data = configurationData[0]?.ProjectTracking[0]?.projectTracking;
      const arrayData = Array.isArray(data) ? data : [data];
      const emptyRows = projectTypes.map((type, index) => ({
        key: index.toString(),
        projectType: type,
        reviewMeetingFrequency: "",
        meetingOccurrence: "",
        activityUpdateFrequency: "",
        updateReminderOn: "",
      }));

      // Combine API data with empty rows based on projectTypes
      const combinedData = emptyRows.map((row, index) => ({
        ...row,
        ...arrayData[index],
      }));

      setProjectTrackingData({ projectTracking: combinedData });
      setEditMode(new Array(combinedData.length).fill(true)); // Initialize with true to open in edit mode
    }
  }, [configurationData, projectTypes, setProjectTrackingData]);

  const handleSelectChange = (
    value: string,
    index: number,
    field: keyof ProjectData
  ) => {
    const newData = [...projectTrackingData.projectTracking];
    newData[index][field] = value;
    setProjectTrackingData({ projectTracking: newData });
  };

  const toggleEditMode = (index: number) => {
    const newEditMode = [...editMode];
    newEditMode[index] = !newEditMode[index];
    setEditMode(newEditMode);
  };

  const deleteRow = (index: number) => {
    const newData = projectTrackingData.projectTracking.filter(
      (_, i) => i !== index
    );
    setProjectTrackingData({ projectTracking: newData });

    const newEditMode = editMode.filter((_, i) => i !== index);
    setEditMode(newEditMode);
  };

  const columns: ColumnsType<ProjectData> = [
    {
      title: "Project Type",
      dataIndex: "projectType",
      key: "projectType",
      render: (text, record, index) => text, // Display project type as text
    },
    {
      title: "Review Meeting Frequency",
      dataIndex: "reviewMeetingFrequency",
      key: "reviewMeetingFrequency",
      render: (text, record, index) =>
        editMode[index] ? (
          <Select
            value={text}
            onChange={(value) =>
              handleSelectChange(value, index, "reviewMeetingFrequency")
            }
            style={{ width: "200px" }}
          >
            <Option value="Every Month">Every Month</Option>
            <Option value="Every Week">Every Week</Option>
          </Select>
        ) : (
          text
        ),
    },
    {
      title: "Meeting Occurrence",
      dataIndex: "meetingOccurrence",
      key: "meetingOccurrence",
      render: (text, record, index) => {
        const frequency =
          projectTrackingData.projectTracking[index].reviewMeetingFrequency;
        return editMode[index] ? (
          frequency === "Every Month" ? (
            <Select
              value={text}
              onChange={(value) =>
                handleSelectChange(value, index, "meetingOccurrence")
              }
              style={{ width: "200px" }}
            >
              {Array.from({ length: 31 }, (_, day) => (
                <Option key={day + 1} value={(day + 1).toString()}>
                  {day + 1}
                </Option>
              ))}
            </Select>
          ) : frequency === "Every Week" ? (
            <Select
              value={text}
              onChange={(value) =>
                handleSelectChange(value, index, "meetingOccurrence")
              }
              style={{ width: "200px" }}
            >
              {[
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ].map((day) => (
                <Option key={day} value={day}>
                  {day}
                </Option>
              ))}
            </Select>
          ) : null
        ) : (
          text
        );
      },
    },
    {
      title: "Activity Update Frequency",
      dataIndex: "activityUpdateFrequency",
      key: "activityUpdateFrequency",
      render: (text, record, index) =>
        editMode[index] ? (
          projectTrackingData.projectTracking[index].reviewMeetingFrequency ===
          "Every Month" ? (
            <Select
              value={text}
              onChange={(value) =>
                handleSelectChange(value, index, "activityUpdateFrequency")
              }
              style={{ width: "200px" }}
            >
              {Array.from({ length: 31 }, (_, day) => (
                <Option key={day + 1} value={(day + 1).toString()}>
                  {day + 1}
                </Option>
              ))}
            </Select>
          ) : (
            <Select
              value={text}
              onChange={(value) =>
                handleSelectChange(value, index, "activityUpdateFrequency")
              }
              style={{ width: "200px" }}
            >
              {[
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ].map((day) => (
                <Option key={day} value={day}>
                  {day}
                </Option>
              ))}
            </Select>
          )
        ) : (
          text
        ),
    },
    {
      title: "Update Reminder On",
      dataIndex: "updateReminderOn",
      key: "updateReminderOn",
      render: (text, record, index) =>
        editMode[index] ? (
          projectTrackingData.projectTracking[index].reviewMeetingFrequency ===
          "Every Month" ? (
            <Select
              value={text}
              onChange={(value) =>
                handleSelectChange(value, index, "updateReminderOn")
              }
              style={{ width: "200px" }}
            >
              {Array.from({ length: 31 }, (_, day) => (
                <Option key={day + 1} value={(day + 1).toString()}>
                  {day + 1}
                </Option>
              ))}
            </Select>
          ) : (
            <Select
              value={text}
              onChange={(value) =>
                handleSelectChange(value, index, "updateReminderOn")
              }
              style={{ width: "200px" }}
            >
              {[
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ].map((day) => (
                <Option key={day} value={day}>
                  {day}
                </Option>
              ))}
            </Select>
          )
        ) : (
          text
        ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record, index) => (
        <div>
          {editMode[index] ? (
            <Button
              icon={<MdOutlineCheckCircle />}
              onClick={() => toggleEditMode(index)}
            />
          ) : (
            <Button
              icon={<AiOutlineEdit />}
              onClick={() => toggleEditMode(index)}
            />
          )}
          {/* <Button icon={<DeleteOutlined />} onClick={() => deleteRow(index)} /> */}
        </div>
      ),
    },
  ];

  return (
    <div style={{ width: "90%", display: "flex", justifyContent: "center" }}>
      <div className={classes.tableContainer}>
        <Table
          columns={columns}
          dataSource={projectTrackingData.projectTracking}
          rowKey="key"
          pagination={false}
        />
      </div>
    </div>
  );
};

export default ProjectTracking;
