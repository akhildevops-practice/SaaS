import { useEffect, useState } from "react";
import {
  Button,
  message,
  Modal,
  Pagination,
  PaginationProps,
  Table,
} from "antd";
import useStyles from "./styles";
import axios from "apis/axios.global";
import { useSnackbar } from "notistack";
import getSessionStorage from "utils/getSessionStorage";
import { IconButton } from "@material-ui/core";
import checkRole from "utils/checkRoles";
import { ReactComponent as CustomEditICon } from "assets/documentControl/Edit.svg";
import { ReactComponent as CustomDeleteICon } from "assets/documentControl/Delete.svg";
import Workflow from "./Workflow";
type Props = {};

const DocumentWorkflow = ({}: Props) => {
  const { enqueueSnackbar } = useSnackbar();
  const userDetails = getSessionStorage();
  const classes = useStyles();

  const [tableData, setTableData] = useState<any>([]);
  const [page, setPage] = useState<any>(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [count, setCount] = useState<number>();
  const showTotal: PaginationProps["showTotal"] = (total) =>
    `Total ${total} items`;
  const isOrgAdmin = checkRole("ORG-ADMIN");
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>("");
  const [actionType, setActionType] = useState<any>(null);

  useEffect(() => {
    if (
      actionType === "Create" ||
      actionType === "Edit" ||
      actionType === "View"
    ) {
      setIsWorkflowModalOpen(true);
    }
  }, [actionType]);

  useEffect(() => {
    if (isWorkflowModalOpen === false) {
      getTableData();
    }
  }, [isWorkflowModalOpen, page, rowsPerPage]);

  const getTableData = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/global-workflow/getGlobalWorkflowTableData?page=${page}&limit=${rowsPerPage}`
      );
      setTableData(response.data.tableData);
      setCount(response.data.totalCount);
    } catch (error) {
      console.error("Error fetching upload status:", error);
    }
  };

  const handlePagination = (page: any, pageSize: any = rowsPerPage) => {
    setPage(page);
    setRowsPerPage(pageSize);
  };

  const handleDeleteWorkflow = async (id: any) => {
    try {
      const result = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/global-workflow/deleteGlobalWorkflow/${id}`
      );
      enqueueSnackbar(result.data.responseMessage, {
        variant: "success",
      });
      getTableData();
    } catch (error: any) {
      if (!error.response) {
        message.error(error);
        enqueueSnackbar("Something went wrong. Please try again later", {
          variant: "error",
        });
      } else {
        const { data } = error.response;
        message.error(data.message);
        enqueueSnackbar(data.message, { variant: "error" });
      }
    }
  };

  const columns: any = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: 300,
      render: (_: any, record: any) => (
        <div
          style={{
            textDecorationLine: "underline",
            cursor: "pointer",
            width: 500,
          }}
        >
          <div
            className={classes.clickableField}
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            onClick={() => {
              setSelectedWorkflow(record._id);
              setActionType("View");
            }}
          >
            {record.title}
          </div>
        </div>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      render: (_: any, record: any) => (
        <>
          {isOrgAdmin && (
            <>
              <IconButton
                onClick={() => {
                  setSelectedWorkflow(record._id);
                  setActionType("Edit");
                }}
                style={{ padding: "10px" }}
              >
                <CustomEditICon width={20} height={20} />
              </IconButton>
              <IconButton
                onClick={() => {
                  handleDeleteWorkflow(record._id);
                }}
                style={{ padding: "10px" }}
              >
                <CustomDeleteICon width={20} height={20} />
              </IconButton>
            </>
          )}
        </>
      ),
    },
  ];

  return (
    <>
      <div style={{ textAlign: "right" }}>
        <Button
          style={{ backgroundColor: "#0E497A", color: "#FFFFFF" }}
          onClick={() => setActionType("Create")}
        >
          Create
        </Button>
      </div>
      <Modal
        open={isWorkflowModalOpen}
        onCancel={() => {
          setIsWorkflowModalOpen(false);
          setActionType(null);
        }}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        width={"75%"}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        footer={null}
      >
        <Workflow
          selectedWorkflow={selectedWorkflow}
          setSelectedWorkflow={setSelectedWorkflow}
          actionType={actionType}
          setActionType={setActionType}
          setIsWorkflowModalOpen={setIsWorkflowModalOpen}
        />
      </Modal>
      <div className={classes.tableContainer} style={{ marginTop: "20px" }}>
        <div>
          <Table
            columns={columns}
            dataSource={tableData}
            rowKey="_id"
            className={classes.tableContainer}
            pagination={false}
          />
        </div>
        <div className={classes.pagination}>
          <Pagination
            size="small"
            current={page}
            pageSize={rowsPerPage}
            total={count}
            showTotal={showTotal}
            showSizeChanger
            showQuickJumper
            onChange={(page: any, pageSize: any) => {
              handlePagination(page, pageSize);
            }}
          />
        </div>
      </div>
    </>
  );
};

export default DocumentWorkflow;
