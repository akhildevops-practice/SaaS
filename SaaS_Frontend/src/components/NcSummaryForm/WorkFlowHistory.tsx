//antd
import { Drawer, Row, Table } from "antd";

//styles
import type { ColumnsType } from "antd/es/table";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import { makeStyles } from "@material-ui/core";

type Props = {
  workFlowDrawer: any;
  setWorkFlowDrawer: any;
  formData: any;
};
const useStyles = makeStyles((theme: any) => ({
  docDetailsDrawer: {
    "& .ant-drawer-header": {
      backgroundColor: "aliceblue",
      textAlign: "center",
      padding: "10px 20px",
      borderBottom: "none",
    },
    borderBottomRightRadius: "10px",
    borderBottomLeftRadius: "10px",
  },
  auditTrailTable: {
    "& .ant-table-thead .ant-table-cell": {
      backgroundColor: "aliceblue",
      color: "black",
      padding: "5px 5px !important",
      textAlign: "center",
    },
    "& .ant-table-tbody tr.ant-table-row": {
      borderRadius: 5,
      cursor: "pointer",
      // transition: "all 0.1s linear",

      "& td.ant-table-cell": {
        padding: "5px 5px !important",
        textAlign: "center",
        // borderBottom : "none !important",
        // transition: "background-color 0.1s linear",
      },
    },
  },
}));
const WorkFlowHistory = ({
  workFlowDrawer,
  setWorkFlowDrawer,
  formData,
}: Props) => {
  const classes = useStyles();

  const columns: ColumnsType<any> = [
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "By",
      dataIndex: "by",
      key: "by",
    },
    {
      title: "Comment",
      dataIndex: "comment",
      key: "comment",
    },
  ];

  // Function to format the data for the table
console.log("workflowe data",formData)
  return (
    <Drawer
      title={"Findings WorkFlow History"}
      placement="top"
      open={workFlowDrawer}
      closable={true}
      closeIcon={
        <img
          src={CloseIconImageSvg}
          alt="close-drawer"
          style={{ width: "36px", height: "38px", cursor: "pointer" }}
        />
      }
      onClose={() => {
        setWorkFlowDrawer({ open: false });
      }}
      height={200}
      className={classes.docDetailsDrawer}
      style={{ overflow: "hidden" }}
      getContainer={false}
      maskClosable={false}
    >
      <Row gutter={[16, 16]}>
        <Table
          columns={columns}
          dataSource={formData}
          tableLayout="fixed"
          className={classes.auditTrailTable}
          pagination={false}
        />
      </Row>
    </Drawer>
  );
};

export default WorkFlowHistory;
