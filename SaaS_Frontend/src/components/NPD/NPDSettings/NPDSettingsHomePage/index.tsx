import { Button, Table } from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./styles";
import axios from "apis/axios.global";
import { AiOutlineEdit } from "react-icons/ai";

const NPDSettingsHomePage = () => {
  const navigate = useNavigate();
  const classes = styles();

  const [tableData, setTableData] = useState([]);
  const [selectedRowId, setSelectedRowId] = useState(); // State for storing the selected row's _id

  console.log("selectedRowId", selectedRowId);
  useEffect(() => {
    DepartmentTableData();
  }, []);

  const DepartmentTableData = async () => {
    let result;
    try {
      result = await axios.get("/api/configuration/getAllNpdConfig");
      const formattedData = result?.data.map((item: any) => ({
        key: item._id,
        department: item.dptData,
        PIC: item.picData.map((pic: any) => pic.firstname).join(", "),
        reviewers: item.reviewersData
          .map((reviewer: any) => reviewer.firstname)
          .join(", "),
        approvers: item.approverData
          .map((approver: any) => approver.firstname)
          .join(", "),
        notification: item.notificationData
          .map((notif: any) => notif.firstname)
          .join(", "),
        escalation: item.escalationListData
          .map((escalation: any) => escalation.firstname)
          .join(", "),
      }));
      setTableData(formattedData);
    } catch (error) {}
    // console.log("tableData444", result);
  };

  const columns = [
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
    },
    {
      title: "PIC",
      dataIndex: "PIC",
      key: "PIC",
    },
    {
      title: "Evidence Reviewers",
      dataIndex: "reviewers",
      key: "reviewers",
    },
    {
      title: "Evidence Approvers",
      dataIndex: "approvers",
      key: "approvers",
    },
    {
      title: "Notification Group",
      dataIndex: "notification",
      key: "notification",
    },
    {
      title: "Escalation Group",
      dataIndex: "escalation",
      key: "escalation",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <div style={{ display: "flex", gap: "10px" }}>
          <Button
            icon={<AiOutlineEdit />}
            onClick={() => {
              setSelectedRowId(record.key); // Store the selected row's _id
              console.log("record.key", record.key);
              // editData(record.key);
              navigate(`/NPDdepartmentForm/${record?.key}`);
              // navigate(`/NPDSteeper/${item?._id}`);
            }}
          />
          {/* <Button icon={<DeleteOutlined />} /> */}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            padding: "20px",
            gap: "30px",
          }}
        >
          <Button
            style={{
              backgroundColor: "#2874A6",
              fontWeight: 600,
              color: "white",
              fontSize: "18px",
              border: "2px solid #2874A6",
            }}
          >
            Activity
          </Button>
          <Button
            onClick={() => {
              navigate("/NPDTab2");
            }}
            style={{
              fontWeight: "bold",
              color: "black",
              fontSize: "18px",
              border: "2px solid #2874A6",
            }}
          >
            Configuration
          </Button>
        </div>
        <div style={{ padding: "20px" }}>
          <Button
            onClick={() => {
              navigate("/NPD");
            }}
            style={{ border: "2px solid #2874A6", fontWeight: "bold" }}
          >
            Exit
          </Button>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          padding: "20px",
        }}
      >
        <div
          style={{
            fontSize: "16px",
            fontWeight: 600,
            padding: "10px",
          }}
        >
          Department wise Activity Mapping
        </div>
        <Button
          onClick={() => {
            navigate(`/NPDdepartmentForm`);
          }}
          style={{
            backgroundColor: "#0A4764",
            color: "white",
            fontWeight: "bold",
          }}
        >
          Add Department
        </Button>
      </div>

      <div className={classes.tableContainer}>
        <Table
          dataSource={tableData}
          columns={columns}
          pagination={false}
          className={classes.documentTable}
        />
      </div>
    </div>
  );
};

export default NPDSettingsHomePage;
