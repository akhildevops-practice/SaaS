import { Button, Modal, Table } from "antd";
import React, { useEffect, useState } from "react";
import styles from "./style";
import axios from "apis/axios.global";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import { AiOutlineFileExcel } from "react-icons/ai";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import SecondaryButton from "components/ReusableComponents/SecondaryButton";

type props = {
  allChartData?: any;
  auditFindingTable?: any;
};

const AuditFindingsTable = ({ allChartData, auditFindingTable }: props) => {
  const [ncTableId, setNcTableId] = useState([]);
  const [ncTableData, setNcTableData] = useState<string[]>([]);

  useEffect(() => {
    getTableDataBySystem();
  }, [ncTableId]);

  const getTableDataBySystem = async () => {
    const response = await axios.get(
      `/api/audits/tableNcData?id[]=${ncTableId.join("&id[]=")}`
    );
    setNcTableData(response.data);
  };

  const classes = styles();
  const [selectedCell, setSelectedCell] = useState(null);

  const getCellStyle = (record: any) => {
    return {
      cursor: "pointer",
      backgroundColor: record.key === selectedCell ? "red" : "transparent",
    };
  };

  const columns = [
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      width: 150,
      render: (text: any, record: any, index: any) => {
        const currentDepartment = text;
        const rowIndex = dataSource.findIndex(
          (item: any) => item.department === currentDepartment
        );
        const rowCount = dataSource.filter(
          (item: any) => item.department === currentDepartment
        ).length;
        const isFirstDepartment = index === rowIndex;

        return {
          children: text,
          props: {
            rowSpan: isFirstDepartment ? rowCount : 0,
          },
        };
      },
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Open",
      dataIndex: "open",
      key: "open",
      width: 70,
      onCell: (record: any) => ({
        onClick: () => {
          // Log the record object to check its structure and contents
          const openIds = record.openIds;
          setNcTableId(openIds);
          showModal();
        },
        style: getCellStyle(record),
      }),
    },
    {
      title: "Accepted",
      dataIndex: "accepted",
      key: "accepted",
      onCell: (record: any) => ({
        onClick: () => {
          setNcTableId(record.acceptedIds);
          showModal();
        },
      }),
    },
    {
      title: "Auditor Review",
      dataIndex: "review",
      key: "review",
      onCell: (record: any) => ({
        onClick: () => {
          setNcTableId(record.reviewIds);
          showModal();
        },
      }),
    },
    {
      title: "Verified",
      dataIndex: "verified",
      key: "verified",
      onCell: (record: any) => ({
        onClick: () => {
          setNcTableId(record.verifiedIds);
          showModal();
        },
      }),
    },
    {
      title: "Removed",
      dataIndex: "removed",
      key: "removed",
      onCell: (record: any) => ({
        onClick: () => {
          setNcTableId(record.removedIds);
          showModal();
        },
      }),
    },

    {
      title: "Rejected",
      dataIndex: "rejected",
      key: "rejected",
      onCell: (record: any) => ({
        onClick: () => {
          setNcTableId(record.rejectedIds);
          showModal();
        },
      }),
    },

    {
      title: "Closed",
      dataIndex: "closed",
      key: "closed",
      onCell: (record: any) => ({
        onClick: () => {
          setNcTableId(record.closedIds);
          showModal();
        },
      }),
    },
  ];

  const dataSource = allChartData?.findingData?.flatMap((department: any) =>
    department.data.flatMap((item: any) => {
      // Extract the ids array from each property
      const openIds = item.open.ids;
      const acceptedIds = item.accepted.ids;
      const reviewIds = item.auditorReview.ids;
      const verifiedIds = item.verfied.ids;
      const removedIds = item.removed.ids;
      const rejectedIds = item.rejected.ids;
      const closedIds = item.closed.ids;

      // Create a new object with the required properties including the ids arrays
      return [
        {
          ...item,
          department: department.name,
          type: item.type,
          open: item.open.count,
          openIds: openIds, // Include the open ids array
          accepted: item.accepted.count,
          acceptedIds: acceptedIds, // Include the accepted ids array
          review: item.auditorReview.count,
          reviewIds: reviewIds, // Include the review ids array
          verified: item.verfied.count,
          verifiedIds: verifiedIds, // Include the verified ids array
          removed: item.removed.count,
          removedIds: removedIds, // Include the removed ids array
          rejected: item.rejected.count,
          rejectedIds: rejectedIds, // Include the rejected ids array
          closed: item.closed.count,
          closedIds: closedIds, // Include the closed ids array
        },
      ];
    })
  );

  //model

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
    // handleFilterClick();
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const ncTableModelcolumns = [
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (text: any, record: any) => (
        <div onClick={() => window.open(`/audit/nc/${record.id}`, "_blank")}>
          {text}
        </div>
      ),
    },
    {
      title: "Findings",
      dataIndex: "findings",
      key: "findings",
    },
    {
      title: "AuditName",
      dataIndex: "auditName",
      key: "auditName",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
  ];

  const dataSourceNCModelTable = Array.isArray(ncTableData)
    ? ncTableData.map((item: any) => ({
        type: item.type,
        findings: item.id,
        auditName: item.audit.auditName,
        status: item.status,
        id: item._id,
      }))
    : [];

  const exportToExcel = () => {
    if (!dataSource || dataSource.length === 0) {
      return;
    }

    // Convert dataSource into an array format suitable for Excel
    const worksheetData = dataSource.map((item: any) => ({
      Department: item.department || "",
      Type: item.type || "",
      Open: item.open || 0,
      Accepted: item.accepted || 0,
      Review: item.review || 0,
      Verified: item.verified || 0,
      Removed: item.removed || 0,
      Rejected: item.rejected || 0,
      Closed: item.closed || 0,
    }));

    // Create a new worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Table Data");

    // Convert the workbook to a binary format
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "binary",
    });

    // Function to create a Blob and trigger download
    const s2ab = (s: string) => {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < s.length; i++) {
        view[i] = s.charCodeAt(i) & 0xff;
      }
      return buf;
    };

    // Create Blob and trigger download
    const data = new Blob([s2ab(excelBuffer)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(data, "Table_Data.xlsx");
  };

  const exportNcTableToExcel = () => {
    if (!dataSourceNCModelTable || dataSourceNCModelTable.length === 0) {
      console.error("No data available to export");
      return;
    }

    // Convert data into a format suitable for Excel
    const worksheetData = dataSourceNCModelTable.map((item: any) => ({
      Type: item.type || "",
      Findings: item.findings || "",
      AuditName: item.auditName || "",
      Status: item.status || "",
    }));

    // Create a worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "NC Table Data");

    // Convert workbook to binary format
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "binary",
    });

    // Function to create a Blob and trigger download
    const s2ab = (s: string) => {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < s.length; i++) {
        view[i] = s.charCodeAt(i) & 0xff;
      }
      return buf;
    };

    // Create Blob and trigger download
    const data = new Blob([s2ab(excelBuffer)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(data, "NC_Table_Data.xlsx");
  };

  const data = [
    {
      key: "1-1",
      department: "Production and Manufacturing",
      type: 12,
      open: 0,
      accepted: 0,
      reviewed: 0,
      verified: 0,
      removed: 12,
      rejected: 0,
      closed: 0,
      rowSpan: 4,
    },
    {
      key: "1-2",
      department: "",
      type: 0,
      open: 145,
      accepted: 145,
      reviewed: 145,
      verified: 12,
      removed: 0,
      rejected: 0,
      closed: 12,
      rowSpan: 0,
    },
    {
      key: "1-3",
      department: "",
      type: 0,
      open: 0,
      accepted: 12,
      reviewed: 0,
      verified: 0,
      removed: 12,
      rejected: 0,
      closed: 0,
      rowSpan: 0,
    },
    {
      key: "1-4",
      department: "",
      type: 0,
      open: 145,
      accepted: 0,
      reviewed: 145,
      verified: 0,
      removed: 0,
      rejected: 145,
      closed: 0,
      rowSpan: 0,
    },
    {
      key: "2-1",
      department: "Production and Manufacturing",
      type: 0,
      open: 0,
      accepted: 0,
      reviewed: 0,
      verified: 0,
      removed: 0,
      rejected: 0,
      closed: 0,
      rowSpan: 2,
    },
    {
      key: "2-2",
      department: "",
      type: 0,
      open: 0,
      accepted: 0,
      reviewed: 0,
      verified: 0,
      removed: 0,
      rejected: 0,
      closed: 0,
      rowSpan: 0,
    },
  ];

  const columnsAntd = [
    {
      title: "Department",
      dataIndex: "department",
      render: (text: any, row: any) => ({
        children: text,
        props: { rowSpan: row.rowSpan },
      }),
    },
    {
      title: "Type",
      dataIndex: "type",
    },
    {
      title: "Open",
      dataIndex: "open",
    },
    {
      title: "Accepted",
      dataIndex: "accepted",
    },
    {
      title: "Auditor Reviewed",
      dataIndex: "reviewed",
    },
    {
      title: "Verified",
      dataIndex: "verified",
    },
    {
      title: "Removed",
      dataIndex: "removed",
    },
    {
      title: "Rejected",
      dataIndex: "rejected",
    },
    {
      title: "Closed",
      dataIndex: "closed",
    },
  ];

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "end",
          marginRight: "20px",
          marginBottom: "10px",
        }}
      >
        <SecondaryButton
          type="primary"
          onClick={exportToExcel}
          buttonText="Download Excel"
          icon={<AiOutlineFileExcel />}
        />
      </div>

      {/* <div className={classes.tableContainer}>
        <Table
          dataSource={dataSource}
          columns={columns}
          className={`${classes.documentTable} ${classes.centerAlignedCell}`}
        ></Table>
      </div> */}
      <Modal
        // title="Apply Filter Here"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Ok"
        width="90vw"
        style={{ marginTop: "20px " }}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{
              width: "30px",
              height: "38px",
              cursor: "pointer",
            }}
          />
        }
      >
        <div
          style={{
            display: "flex",
            justifyContent: "end",
            marginRight: "20px",
            paddingBottom: "10px",
          }}
        >
          {/* <Button
            type="primary"
            onClick={exportNcTableToExcel}
            icon={<AiOutlineFileExcel />}
          >
            Download Excel
          </Button> */}
          <Button
            type="primary"
            onClick={exportNcTableToExcel}
            icon={<AiOutlineFileExcel style={{ fontSize: 16 }} />}
            style={{
              backgroundColor: "#00224E",
              borderColor: "#00224E",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: 500,
              textTransform: "none",
              padding: "0 16px",
              height: "32px",
            }}
          >
            Download Excel
          </Button>
        </div>
        <div className={classes.tableContainerss}>
          <Table
            dataSource={dataSourceNCModelTable}
            columns={ncTableModelcolumns}
            className={classes.documentTabless}
            scroll={{ y: 160 }}
          ></Table>
        </div>
      </Modal>
      <div className={classes.tableHeader}>
        <Table
          // dataSource={data}
          // columns={columnsAntd}
          dataSource={dataSource}
          columns={columns}
          bordered
          // pagination={true}
        />
      </div>
    </>
  );
};

export default AuditFindingsTable;
