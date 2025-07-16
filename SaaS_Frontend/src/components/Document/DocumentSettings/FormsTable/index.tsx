import React, { useState, useEffect } from "react";
import { Table, Button, Tooltip, message, Pagination, Modal } from "antd";
import type { PaginationProps } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { IconButton } from "@material-ui/core";
import useStyles from "./styles";
import axios from "apis/axios.global";
import getSessionStorage from "utils/getSessionStorage";

interface Form {
  _id: string;
  formTitle: string;
  fields: any[];
  organizationId?: string;
  createdAt: string;
  updatedAt: string;
}

const showTotal: PaginationProps["showTotal"] = (total) =>
  `Total ${total} items`;

const FormsTable: React.FC = () => {
  const navigate = useNavigate();
  const classes = useStyles();
  const userDetails = getSessionStorage();

  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [formToDelete, setFormToDelete] = useState<string | null>(null);

  const fetchForms = async (currentPage: number, limit: number) => {
    setLoading(true);
    try {
      const response = await axios.get("/api/documentforms", {
        params: {
          page: currentPage,
          limit,
          organizationId: userDetails?.organizationId,
          sortBy: "createdAt",
          sortOrder: "desc",
        },
      });

      const { data, pagination } = response.data;
      setForms(data);
      setPagination((prev) => ({ ...prev, total: pagination.total }));
    } catch (error) {
      console.error("Error fetching forms:", error);
      message.error("Failed to fetch forms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms(pagination.current, pagination.pageSize);
  }, [pagination.current, pagination.pageSize]);

  const handleAdd = () => {
    navigate("/processdocuments/formbuilder");
  };

  const handleEdit = (formId: string) => {
    navigate(`/processdocuments/formbuilder/${formId}`);
  };

  const handleView = (formId: string) => {
    navigate(`/processdocuments/formbuilder/${formId}`, {
      state : {
        isReadOnly : true
      }
    });
  };

  const showDeleteModal = (formId: string) => {
    setFormToDelete(formId);
    setDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    if (!formToDelete) return;
    
    try {
      await axios.delete(`/api/documentforms/${formToDelete}`);
      message.success("Form deleted successfully");
      fetchForms(pagination.current, pagination.pageSize); // Refresh the list
    } catch (error) {
      message.error("Failed to delete form");
    } finally {
      setDeleteModalVisible(false);
      setFormToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
    setFormToDelete(null);
  };

  const handleChangePage = (page: number, pageSize: number) => {
    // console.log("checkriske page", page, pageSize);
    setPagination((prev) => ({ ...prev, current: page, pageSize: pageSize }));
    // getHiraWithSteps(selectedHiraId, page, pageSize);
  };

  const columns = [
    {
      title: "Form Title",
      dataIndex: "formTitle",
      key: "formTitle",
      onCell: (record: Form) => ({
        onClick: () => handleView(record._id),
      }),
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_: any, record: Form) => (
        <>
          <Tooltip title="Edit Form">
            <IconButton
              onClick={() => handleEdit(record._id)}
              style={{ padding: "10px" }}
            >
              <EditOutlined style={{ fontSize: "20px" }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Form">
            <IconButton
              onClick={() => showDeleteModal(record._id)}
              style={{ padding: "10px" }}
            >
              <DeleteOutlined
                style={{ fontSize: "20px", color: "rgb(0, 48, 89)" }}
              />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          style={{ backgroundColor: "rgb(0, 48, 89)" }}
        >
          Add Form
        </Button>
      </div>
      <div className={classes.tableContainer}>
        <Table
          dataSource={forms}
          columns={columns}
          pagination={false}
          loading={loading}
          rowKey="_id"
        />
      </div>
      <div className={classes.pagination}>
        <Pagination
          size="small"
          current={pagination?.current}
          pageSize={pagination?.pageSize}
          total={pagination?.total}
          showTotal={showTotal}
          showSizeChanger
          showQuickJumper
          onChange={(page, pageSize) => {
            handleChangePage(page, pageSize);
          }}
        />
      </div>
      
      {/* Delete Confirmation Modal */}
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

export default FormsTable;
