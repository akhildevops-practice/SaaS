import { Table } from "antd";
import { useState } from "react";
import useStyles from "./style";

const RefernceTab = ({ formData }: { formData: any }) => {
  const classes = useStyles();
  const [tableData, setTableData] = useState<any>(formData?.attachmentHistory);
  const tabledata = formData?.ReferenceDocuments?.map((item: any) => {
    // Get the last part of the URL, which is the document name with extension
    return {
      name: item.name,
      type: item.type,
      documentLink: item.documentLink,
    };
  });
  const columns = [
    {
      title: "Document Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Target Link",
      dataIndex: "documentLink",
      key: "documentLink",
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
        dataSource={tabledata}
        rowClassName={rowClassName}
        // scroll={{ y: 150 }}
        // pagination={false}
      />
    </div>
  );
};

export default RefernceTab;
