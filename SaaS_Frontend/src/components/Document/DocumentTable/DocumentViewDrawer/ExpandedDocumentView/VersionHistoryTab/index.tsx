import { Table } from "antd";
import { useState } from "react";
import useStyles from "./style";
const VersionHistoryTab = ({ formData }: { formData: any }) => {
  const classes = useStyles();
  const [tableData, setTableData] = useState<any>(formData.DocumentVersions);
  const columns = [
    {
      title: "Issue - Version",
      dataIndex: "versionName",
      key: "versionName",
      render: (_: any, record: any) => (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          {record.issueNumber} - {record.currentVersion}
        </div>
      ),
    },
    {
      title: "By",
      dataIndex: "by",
      key: "by",
    },
    {
      title: "Approved Date",
      dataIndex: "approvedDate",
      key: "approvedDate",
    },
    {
      title: "Link",
      dataIndex: "versionLink",
      key: "versionLink",
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
        // scroll={{ y: 200, x: 100 }}
        // pagination={false}
      />
    </div>
  );
};

export default VersionHistoryTab;
