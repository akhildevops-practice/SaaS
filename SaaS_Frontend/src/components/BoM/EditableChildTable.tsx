import React, { useState, useEffect } from "react";
import { Table, Input, Select, Row, Col } from "antd";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { ReactComponent as CustomDeleteICon } from "assets/documentControl/Delete.svg";
import useStyles from "./styles";
import { AiOutlinePlusCircle } from "react-icons/ai";

import axios from "apis/axios.global";
const { Option } = Select;

type Props = {
  selectedEntities?: any;
  setSelectedEntities?: any;
  locations?: any;
  handleSaveEntity?: any;
  dataSource?: any;
  setDataSource?: any;
};

const EditableChildTable = ({
  selectedEntities = [],
  setSelectedEntities,
  locations,
  handleSaveEntity,
  dataSource,
  setDataSource,
}: Props) => {
  const [newRow, setNewRow] = useState({
    id: "",
    entityName: "",
    entityId: "",
    location: "",
    users: [],
    parentEntityId: { entityName: "" },
    familyId: "",
  });
  const classes = useStyles();
  const [locationUsers, setLocationUsers] = useState<any>({}); // Track users per location

  useEffect(() => {
    if (selectedEntities && selectedEntities.length > 0) {
      setDataSource(selectedEntities);
    }
  }, [selectedEntities]);
  console.log("dataSource", dataSource);
  useEffect(() => {
    // Fetch users for locations already set in dataSource when it changes
    dataSource.forEach((row: any) => {
      if (row.locationId && !locationUsers[row.locationId]) {
        // Fetch users for this location if not already fetched
        getAllUser(row.locationId);
      }
    });
  }, [dataSource, locationUsers]); // Fetch users for locations that need it

  const getAllUser = async (locationId: string) => {
    if (!locationId) return; // If no location, return early.
    try {
      const res = await axios(
        `/api/objective/getAllUserForLocation/${locationId}`
      );
      const users =
        res.data?.allUsers?.map((obj: any) => ({
          id: obj.id,
          value: obj.id,
          label: obj.username,
        })) || [];

      // Store users for this specific locationId in state
      setLocationUsers((prevState: any) => ({
        ...prevState,
        [locationId]: users, // Update users for the specific location
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (value: any, key: any, index: any) => {
    const newData = [...dataSource];
    newData[index][key] = value;
    setDataSource(newData);

    if (key === "location") {
      getAllUser(value);
    }
  };

  const addRow = () => {
    if (newRow.entityName || newRow.entityId || newRow.location) {
      const updatedDataSource = [...dataSource, { ...newRow }];
      setDataSource(updatedDataSource);
      // Clear new row inputs
      setNewRow({
        id: "",
        entityName: "",
        entityId: "",
        location: "",
        users: [],
        parentEntityId: { entityName: "" },
        familyId: "",
      });
    } else {
      alert("Please fill in at least the Entity Name or Entity ID.");
    }
  };

  const saveRow = (record: any) => {
    console.log("row values", record);
    const existingIndex = dataSource.findIndex(
      (item: any) => item.entityId === record.entityId
    );
    if (existingIndex !== -1) {
      // Update existing row
      handleSaveEntity({ ...dataSource[existingIndex], ...record });
    } else {
      handleSaveEntity(record);
    }
    setNewRow({
      id: "",
      entityName: "",
      entityId: "",
      location: "",
      users: [],
      parentEntityId: { entityName: "" },
      familyId: "",
    });
  };

  const handleRemoveEntity = (entityId: string) => {
    setSelectedEntities(
      selectedEntities.filter((entity: any) => entity.id !== entityId)
    );
    setDataSource(dataSource.filter((entity: any) => entity.id !== entityId));
  };

  const columns = [
    {
      title: "Entity Name",
      dataIndex: "entityName",
      render: (text: any, record: any, index: any) => (
        <Input
          value={text}
          onChange={(e) => handleChange(e.target.value, "entityName", index)}
        />
      ),
    },
    {
      title: "Entity ID",
      dataIndex: "entityId",
      render: (text: any, record: any, index: any) => (
        <Input
          value={record.entityId}
          onChange={(e) => handleChange(e.target.value, "entityId", index)}
        />
      ),
    },
    {
      title: "Location",
      dataIndex: "location",
      render: (text: any, record: any, index: any) => (
        <Select
          placeholder="Select location"
          allowClear
          value={record.locationId}
          onChange={(value) => handleChange(value, "location", index)}
        >
          {locations?.map((location: any) => (
            <Option key={location.id} value={location.id}>
              {location.locationName}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Owners",
      dataIndex: "users",
      render: (text: any, record: any, index: any) => {
        const usersForLocation = locationUsers[record.locationId] || [];

        return (
          <Select
            placeholder="Select Owners"
            allowClear
            value={record.users}
            mode="multiple"
            onChange={(value) => handleChange(value, "users", index)}
          >
            {usersForLocation?.map((user: any) => (
              <Option key={user.id} value={user.id}>
                {user.label}
              </Option>
            ))}
          </Select>
        );
      },
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_: any, record: any) => (
        <>
          <CustomDeleteICon
            onClick={() => handleRemoveEntity(record?.id)}
            style={{ fontSize: "15px", cursor: "pointer" }}
          />
          <AiOutlineCheckCircle
            onClick={() => saveRow(record)} // Save changes for the row
            style={{ fontSize: "20px", cursor: "pointer" }}
          />
        </>
      ),
    },
  ];

  return (
    <Row gutter={24} style={{ alignItems: "center" }}>
      <Col span={24} style={{ textAlign: "right", marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col>
            <Input
              placeholder="Entity Name"
              value={newRow.entityName}
              onChange={(e) =>
                setNewRow({ ...newRow, entityName: e.target.value })
              }
            />
          </Col>
          <Col>
            <Input
              placeholder="Entity ID"
              value={newRow.entityId}
              onChange={(e) =>
                setNewRow({ ...newRow, entityId: e.target.value })
              }
            />
          </Col>
          <Col>
            <Select
              placeholder="Select location"
              allowClear
              value={newRow.location}
              onChange={(value) => {
                setNewRow({ ...newRow, location: value });
                getAllUser(value); // Fetch users for new location
              }}
            >
              {locations?.map((location: any) => (
                <Option key={location.id} value={location.id}>
                  {location.locationName}
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Select
              placeholder="Select Owners"
              allowClear
              value={newRow.users}
              mode="multiple"
              onChange={(value: any) => {
                const selectedOwners = locationUsers[newRow.location]?.filter(
                  (user: any) => value.includes(user?.value)
                );
                setNewRow({ ...newRow, users: selectedOwners });
              }}
            >
              {locationUsers[newRow.location]?.map((user: any) => (
                <Option key={user.id} value={user.id}>
                  {user.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <AiOutlineCheckCircle
              onClick={() => saveRow(newRow)} // Save new row
              style={{ fontSize: "20px", cursor: "pointer" }}
            />
          </Col>
          <Col>
            <AiOutlinePlusCircle
              style={{
                marginTop: "10px",
                cursor: "pointer",
              }}
              onClick={addRow}
            />
          </Col>
        </Row>
      </Col>
      <Col span={24} className={classes.tableWrapper}>
        <Table
          className={classes.tableContainer}
          dataSource={dataSource}
          columns={columns}
          rowKey={(record) => record.entityId || Math.random().toString()} // Unique key for rows
          pagination={false}
        />
      </Col>
    </Row>
  );
};

export default EditableChildTable;
