import React, { useEffect, useState } from "react";
import { Table, Select, Button, Space } from "antd";
import { AiOutlineDelete,AiOutlinePlusCircle } from "react-icons/ai";

import style from "./styles";

type Props = {
  projectAdminsUsers?: any;
  pm?: string[]; // Array of strings to store IDs
  setSelectedProjectAdminsId?: (ids: string[]) => void; // Function to update IDs
  configurationData?: any;
};

const ProjectAdminsTable = ({
  projectAdminsUsers = [],
  pm = [],
  setSelectedProjectAdminsId,
  configurationData,
}: Props) => {
  const classes = style();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (configurationData && configurationData[0]?.pmUserData?.length > 0) {
      const initialData = configurationData[0].pmUserData.map((user: any) => ({
        key: user.id,
        firstName: user.firstname,
        username: user.username,
        email: user.email,
      }));
      setData(initialData);

      // Set the initial selected IDs from configurationData
      const initialIds = configurationData[0].pmUserData.map(
        (user: any) => user.id
      );
      if (setSelectedProjectAdminsId) {
        setSelectedProjectAdminsId(initialIds);
      }
    } else {
      // If no data from API, show the first row to add new data
      addNewRow();
    }
  }, [configurationData]); // Depend only on configurationData

  const addNewRow = () => {
    const newRow = {
      key: `new-${Date.now()}`, // Temporary key for new rows
      firstName: "",
      username: "",
      email: "",
    };
    setData((prevData) => [...prevData, newRow]);
  };

  const handleSelectChange = (value: string, key: string) => {
    const selectedUser = projectAdminsUsers.find(
      (user: any) => user.id === value
    );

    if (selectedUser) {
      setData((prevData) =>
        prevData.map((item) =>
          item.key === key
            ? {
                ...item,
                firstName: selectedUser.firstname,
                username: selectedUser.username,
                email: selectedUser.email,
                key: selectedUser.id, // Update the key to the selected user's ID
              }
            : item
        )
      );

      // Update pm with the new value, preserving previous IDs
      if (setSelectedProjectAdminsId) {
        const updatedIds = [
          ...pm.filter((id) => data.some((item) => item.key === id)), // Retain previous IDs that are still in the table
          value,
        ];
        setSelectedProjectAdminsId(Array.from(new Set(updatedIds))); // Ensure unique IDs
      }
    }
  };

  const deleteRecord = (key: string) => {
    setData((prevData) => prevData.filter((item) => item.key !== key));

    // Remove the deleted record's ID from the selected IDs
    if (setSelectedProjectAdminsId) {
      const remainingIds = pm.filter((id) => id !== key);
      setSelectedProjectAdminsId(remainingIds);
    }
  };

  const columns = [
    {
      title: "First Name",
      dataIndex: "firstName",
      render: (_: any, record: any) => (
        <Select
          style={{ width: 200 }}
          onChange={(value: string) => handleSelectChange(value, record.key)}
          value={record.firstName || undefined} // Show placeholder if empty
          showSearch // Enable search feature
          placeholder="Select a user" // Optional: placeholder for the search box
          filterOption={
            (input, option: any) =>
              option.children.toLowerCase().includes(input.toLowerCase()) // Filter based on the option's text
          }
        >
          {projectAdminsUsers?.map((user: any) => (
            <Select.Option key={user.id} value={user.id}>
              {user.firstname}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Username",
      dataIndex: "username",
      render: (text: any) => text || "", // Show "N/A" if no username
    },
    {
      title: "Email Address",
      dataIndex: "email",
      render: (text: any) => text || "", // Show "N/A" if no email
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Button
            icon={<AiOutlineDelete />}
            onClick={() => deleteRecord(record.key)}
          />
          <Button icon={<AiOutlinePlusCircle />} onClick={addNewRow} />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ width: "70%", display: "flex", justifyContent: "start" }}>
      <div className={classes.tableContainer}>
        <Table
          dataSource={data}
          columns={columns}
          rowClassName="editable-row"
          pagination={false}
          className={classes.documentTable}
        />
      </div>
    </div>
  );
};

export default ProjectAdminsTable;
