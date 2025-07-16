import { Table } from "antd";
import { useState } from "react";
import useStyles from "./style";

const AttachmentHistoryTab = ({ formData }: { formData: any }) => {
  const classes = useStyles();
  const [tableData, setTableData] = useState<any>(formData?.attachmentHistory);
  const tabledata = formData?.attachmentHistory?.map((item: any) => {
    const updatedAtDate = new Date(item.updatedAt);
    const formattedDate = updatedAtDate.toLocaleDateString("en-GB");
    const urlParts = item.attachment.split("/");

    // Get the last part of the URL, which is the document name with extension
    const documentNameWithExtension = urlParts[urlParts.length - 1];
    return {
      ...item,
      updatedAt: formattedDate,
      attachment: documentNameWithExtension,
    };
  });

  const columns = [
    {
      title: "Uploaded By",
      dataIndex: "updatedBy",
      key: "updatedBy",
    },
    {
      title: "Attachment",
      dataIndex: "attachment",
      key: "attachment",
    },
    {
      title: "Uploaded Date",
      dataIndex: "updatedAt",
      key: "upatedAt",
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

export default AttachmentHistoryTab;
