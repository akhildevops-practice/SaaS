import { Button, Table } from "antd";
import styles from "./styles";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { AiOutlineFileExcel } from "react-icons/ai";
import SecondaryButton from "components/ReusableComponents/SecondaryButton";
type Props = {
  chartDataForAlllocation?: any;
  cipAllDepartmentData?: any;
  allOption?: any;
  showModalCharts?: any;
  setSelectedCipIdForAllDepartment?: any;
};

const AllLocationTable = ({
  chartDataForAlllocation,
  cipAllDepartmentData,
  allOption,
  showModalCharts,
  setSelectedCipIdForAllDepartment,
}: Props) => {
  const classes = styles();

  const handleCellClick = (record: any, columnKey: string) => {
    let ids: string[] = [];

    switch (columnKey) {
      case "draftCount":
        ids = [...(record.draftIds || []), ...(record.editIds || [])];
        break;
      case "editCount":
        ids = record.editIds || [];
        break;
      case "inReviewCount":
        ids = record.inReviewIds || [];
        break;
      case "inApprovalCount":
        ids = record.inApprovalIds || [];
        break;
      case "approvedCount":
        ids = record.approvedIds || [];
        break;
      case "inProgressCount":
        ids = record.inProgressIds || [];
        break;
      case "completeCount":
        ids = record.completeIds || [];
        break;
      case "inVerificationCount":
        ids = record.inVerificationIds || [];
        break;
      case "closedCount":
        ids = record.closedIds || [];
        break;
      case "cancelledCount":
        ids = record.cancelledIds || [];
        break;
      case "droppedCount":
        ids = record.droppedIds || [];
        break;
      // case "totalCount": // If you want to include a total count logic
      //   ids = [
      //     ...(record.draftIds || []),
      //     ...(record.editIds || []),
      //     ...(record.inReviewIds || []),
      //     ...(record.inApprovalIds || []),
      //     ...(record.approvedIds || []),
      //     ...(record.inProgressIds || []),
      //     ...(record.completeIds || []),
      //   ];
      //   break;
      default:
        ids = [];
    }

    setSelectedCipIdForAllDepartment(ids);
    showModalCharts();
  };

  const exportToExcel = () => {
    // Get the displayed data
    const displayedData =
      allOption === "All" ? chartDataForAlllocation : cipAllDepartmentData;

    // Define headers and corresponding keys
    const headers = [
      allOption === "All" ? "Unit Name" : "Departments",
      "Draft",
      "Edit",
      "In Review",
      "In Approval",
      "Approved",
      "In Progress",
      "Complete",
    ];

    // Define the required columns
    const selectedColumns = [
      allOption === "All" ? "locationName" : "deptName",
      "draftCount",
      "editCount",
      "inReviewCount",
      "inApprovalCount",
      "approvedCount",
      "inProgressCount",
      "completeCount",
    ];

    // Convert data into a 2D array format for Excel
    const filteredData = displayedData.map((item: any) =>
      selectedColumns.map((key) => item[key])
    );

    // Combine headers and data
    const worksheetData = [headers, ...filteredData];

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Data");

    // Generate binary string
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "binary",
    });

    // Convert binary string to Blob
    const s2ab = (s: string) => {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < s.length; i++) {
        view[i] = s.charCodeAt(i) & 0xff;
      }
      return buf;
    };

    const data = new Blob([s2ab(excelBuffer)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(data, "Filtered_Data.xlsx");
  };

  const columns = [
    ...(allOption === "All"
      ? [{ title: "Unit Name", dataIndex: "locationName", key: "locationName" }]
      : [{ title: "Department Name", dataIndex: "deptName", key: "deptName" }]),

    {
      title: "Draft",
      //dataIndex: "draftCount",
      key: "draftCount",
      render: (record: any) => record.draftCount + record.editCount,
      onCell: (record: any) => ({
        onClick: () => handleCellClick(record, "draftCount"),
        style: { cursor: "pointer" },
      }),
    },
    // {
    //   title: "Edit",
    //   dataIndex: "editCount",
    //   key: "editCount",
    //   onCell: (record: any) => ({
    //     onClick: () => handleCellClick(record, "editCount"),
    //     style: { cursor: "pointer" },
    //   }),
    // },
    {
      title: "In Review",
      dataIndex: "inReviewCount",
      key: "inReviewCount",
      onCell: (record: any) => ({
        onClick: () => handleCellClick(record, "inReviewCount"),
        style: { cursor: "pointer" },
      }),
    },
    {
      title: "In Approval",
      dataIndex: "inApprovalCount",
      key: "inApprovalCount",
      onCell: (record: any) => ({
        onClick: () => handleCellClick(record, "inApprovalCount"),
        style: { cursor: "pointer" },
      }),
    },
    {
      title: "Approved",
      dataIndex: "approvedCount",
      key: "approvedCount",
      onCell: (record: any) => ({
        onClick: () => handleCellClick(record, "approvedCount"),
        style: { cursor: "pointer" },
      }),
    },
    {
      title: "In Progress",
      dataIndex: "inProgressCount",
      key: "inProgressCount",
      onCell: (record: any) => ({
        onClick: () => handleCellClick(record, "inProgressCount"),
        style: { cursor: "pointer" },
      }),
    },
    {
      title: "Complete",
      dataIndex: "completeCount",
      key: "completeCount",
      onCell: (record: any) => ({
        onClick: () => handleCellClick(record, "completeCount"),
        style: { cursor: "pointer" },
      }),
    },
    {
      title: "In Verification",
      dataIndex: "inVerificationCount",
      key: "inVerificationCount",
      onCell: (record: any) => ({
        onClick: () => handleCellClick(record, "inVerificationCount"),
        style: { cursor: "pointer" },
      }),
    },
    {
      title: "Closed",
      dataIndex: "closedCount",
      key: "closedCount",
      onCell: (record: any) => ({
        onClick: () => handleCellClick(record, "closedCount"),
        style: { cursor: "pointer" },
      }),
    },
    {
      title: "Cancelled",
      dataIndex: "cancelledCount",
      key: "cancelledCount",
      onCell: (record: any) => ({
        onClick: () => handleCellClick(record, "cancelledCount"),
        style: { cursor: "pointer" },
      }),
    },
    {
      title: "Dropped",
      dataIndex: "droppedCount",
      key: "droppedCount",
      onCell: (record: any) => ({
        onClick: () => handleCellClick(record, "droppedCount"),
        style: { cursor: "pointer" },
      }),
    },
    {
      title: "Total Count",
      dataIndex: "totalCount",
      key: "totalCount",
      onCell: (record: any) => ({
        onClick: () => handleCellClick(record, "totalCount"),
        style: { cursor: "pointer" },
      }),
    },
  ];

  const expandedColumns = [
    {
      title: "Department Name",
      dataIndex: "entityName",
      key: "entityName",
    },
    {
      title: "Draft",
      //dataIndex: "draftCount",
      key: "draftCount",
      render: (record: any) => record.draftCount + record.editCount,
      onCell: (record: any) => ({
        onClick: () => handleCellClick(record, "draftCount"),
        style: { cursor: "pointer" },
      }),
    },
    {
      title: "In Review",
      dataIndex: "inReviewCount",
      key: "inReviewCount",
      onCell: (record: any) => ({
        onClick: () => handleCellClick(record, "inReviewCount"),
        style: { cursor: "pointer" },
      }),
    },
    {
      title: "In Approval",
      dataIndex: "inApprovalCount",
      key: "inApprovalCount",
      onCell: (record: any) => ({
        onClick: () => handleCellClick(record, "inApprovalCount"),
        style: { cursor: "pointer" },
      }),
    },
    {
      title: "Approved",
      dataIndex: "approvedCount",
      key: "approvedCount",
      onCell: (record: any) => ({
        onClick: () => handleCellClick(record, "approvedCount"),
        style: { cursor: "pointer" },
      }),
    },
    {
      title: "In Progress",
      dataIndex: "inProgressCount",
      key: "inProgressCount",
      onCell: (record: any) => ({
        onClick: () => handleCellClick(record, "inProgressCount"),
        style: { cursor: "pointer" },
      }),
    },
    {
      title: "Complete",
      dataIndex: "completeCount",
      key: "completeCount",
      onCell: (record: any) => ({
        onClick: () => handleCellClick(record, "completeCount"),
        style: { cursor: "pointer" },
      }),
    },
    {
      title: "In Verification",
      dataIndex: "inVerificationCount",
      key: "inVerificationCount",
      onCell: (record: any) => ({
        onClick: () => handleCellClick(record, "inVerificationCount"),
        style: { cursor: "pointer" },
      }),
    },
    {
      title: "Closed",
      dataIndex: "closedCount",
      key: "closedCount",
      onCell: (record: any) => ({
        onClick: () => handleCellClick(record, "closedCount"),
        style: { cursor: "pointer" },
      }),
    },
    {
      title: "Cancelled",
      dataIndex: "cancelledCount",
      key: "cancelledCount",
      onCell: (record: any) => ({
        onClick: () => handleCellClick(record, "cancelledCount"),
        style: { cursor: "pointer" },
      }),
    },
    {
      title: "Dropped",
      dataIndex: "droppedCount",
      key: "droppedCount",
      onCell: (record: any) => ({
        onClick: () => handleCellClick(record, "droppedCount"),
        style: { cursor: "pointer" },
      }),
    },
    {
      title: "Total Count",
      dataIndex: "totalCount",
      key: "totalCount",
      onCell: (record: any) => ({
        onClick: () => handleCellClick(record, "totalCount"),
        style: { cursor: "pointer" },
      }),
    },
  ];

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "end",
          marginRight: "0px",
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

      <div className={classes.tableContainer}>
        <Table
          dataSource={
            allOption === "All" ? chartDataForAlllocation : cipAllDepartmentData
          }
          columns={columns}
          rowKey={(record) => record.locationName}
          bordered
          pagination={false}
          {...(allOption === "All"
            ? {
                expandable: {
                  expandedRowRender: (record) => (
                    <div className={classes.nesteddocumentTable}>
                      <Table
                        dataSource={record.entities}
                        columns={expandedColumns}
                        rowKey={(entity) => entity.entityId}
                        pagination={false}
                        bordered
                        size="small"
                      />
                    </div>
                  ),
                  rowExpandable: (record) =>
                    record.entities && record.entities.length > 0,
                },
              }
            : {})}
          className={classes.documentTable}
        />
      </div>
    </>
  );
};

export default AllLocationTable;
