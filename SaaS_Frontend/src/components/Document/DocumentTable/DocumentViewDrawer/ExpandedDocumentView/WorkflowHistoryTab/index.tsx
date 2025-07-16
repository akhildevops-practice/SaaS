import { Table } from "antd";
import { useState } from "react";
import useStyles from "./style";

const WorkflowHistoryTab = ({ formData }: { formData: any }) => {
  const classes = useStyles();
  const [tableData, setTableData] = useState<any>(
    formData.DocumentWorkFlowHistory
  );
  const columns = [
    {
      title: "Action",
      dataIndex: "actionName",
      key: "actionName",
    },
    {
      title: "By",
      dataIndex: "actionBy",
      key: "actionBy",
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
    },
  ];
  const rowClassName = (record: any, index: number) => {
    return index % 2 === 0
      ? classes.alternateRowColor1
      : classes.alternateRowColor2;
  };
  return (
    <div className={classes.tableWrapper}>
      <Table
        columns={columns}
        dataSource={tableData}
        rowClassName={rowClassName}
        // scroll={{ y: 150 }}
        // pagination={false}
      />
    </div>
  );
};

export default WorkflowHistoryTab;
