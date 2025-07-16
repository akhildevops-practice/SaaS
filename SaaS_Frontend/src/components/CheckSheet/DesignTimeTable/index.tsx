import React, { useEffect, useState } from "react";
import { Button, message, Modal, Table, Tooltip } from "antd";
import { AiOutlineEdit } from "react-icons/ai";
import axios from "apis/axios.global";
import { useNavigate } from "react-router-dom";
import useStyle from "./style";
import { MdOutlineDeleteForever, MdPostAdd } from "react-icons/md";

const DesignTimeTable = () => {
  const classes = useStyle();
  const navigate = useNavigate();
  const [tableList, setTableList] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  useEffect(() => {
    getListOfTables();
  }, []);

  const getListOfTables = async () => {
    const res = await axios.get(
      "api/auditchecksheet/getAuditChecksheetTemplates"
    );
    setTableList(res.data);
  };

  const handleEditClick = (id: string) => {
    setSelectedId(id);
    navigate(`/checksheets/${id}`);
    // Perform additional actions here if needed
  };

  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `/api/auditchecksheet/deleteAuditChecksheetForm/${selectedId}`
      );
      setDeleteModalVisible(false);
      message.success("Form deleted successfully");
      getListOfTables();
    } catch (error) {
      message.error("Failed to delete form");
    }
  };

  const copyTemplateData = async (id: any) => {
    try {
      await axios.post(
        `/api/auditchecksheet/copyAuditChecksheetForm/${id}`
      );
      getListOfTables()
    } catch (err) {
      message.error("Failed to Copy Template");
    }
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Created By",
      dataIndex: "createdBy",
      key: "createdBy",
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) => new Date(text).toLocaleDateString(), // Show only the date
    },
    {
      title: "Actions",
      dataIndex: "_id",
      key: "actions",
      render: (_id: string) => (
        <div style={{ display: "flex", gap: "20px" }}>
          <Tooltip title="Edit">
            <AiOutlineEdit
              style={{ cursor: "pointer" }}
              onClick={() => handleEditClick(_id)}
            />
          </Tooltip>
          <Tooltip title="Make a Copy">
            <MdPostAdd
              style={{ padding: "0px", margin: "0px", fontSize: "18px" }}
              onClick={() => {
                copyTemplateData(_id);
              }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <MdOutlineDeleteForever
              style={{ cursor: "pointer" }}
              onClick={() => {
                setSelectedId(_id);
                setDeleteModalVisible(true);
              }}
            />
          </Tooltip>
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
          justifyContent: "end",
          padding: "0px 20px 0px 0px",
          alignItems: "center",
        }}
      >
        <Button
          onClick={() => {
            navigate(`/checksheets`);
          }}
          style={{ backgroundColor: "#003059", color: "white" }}
        >
          Create
        </Button>
      </div>
      <div className={classes.tableContainer}>
        <Table
          dataSource={tableList}
          columns={columns}
          rowKey="_id"
          pagination={false}
          scroll={{ y: 520 }}
        />
      </div>
      <Modal
        title="Delete Form"
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={handleCancelDelete}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to delete this form?</p>
      </Modal>
    </div>
  );
};

export default DesignTimeTable;
