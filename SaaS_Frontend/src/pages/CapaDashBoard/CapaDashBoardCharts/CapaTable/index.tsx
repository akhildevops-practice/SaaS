import { Button, Table } from "antd";
import styles from "./styles";
import { ColumnsType } from "antd/es/table/interface";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { AiOutlineFileExcel } from "react-icons/ai";
import SecondaryButton from "components/ReusableComponents/SecondaryButton";
type Props = {
  newChartData?: any;
  alllocationData?: any;
  allOption?: any;
  setSelectedCapaIds?: any;
  showModalCharts?: any;
};

const CapaTable = ({
  newChartData,
  alllocationData,
  allOption,
  setSelectedCapaIds,
  showModalCharts,
}: Props) => {
  const classes = styles();

  const handleCellClick = (record: any, columnKey: string) => {
    let ids: string[] = [];
    switch (columnKey) {
      case "totalCount": // Grand Total: Combine all IDs
        ids = [
          ...(record.pendingIds || []),
          ...(record.completedIds || []),
          ...(record.wipIds || []),
          ...(record.rejectedIds || []),
        ];
        break;
      case "pendingCount":
        ids = record.pendingIds || [];
        break;
      case "completedCount":
        ids = record.completedIds || [];
        break;
      case "wipCount":
        ids = record.wipIds || [];
        break;
      case "rejectedCount":
        ids = record.rejectedIds || [];
        break;
      default:
        ids = [];
    }
    setSelectedCapaIds(ids);
    showModalCharts();
  };

  const exportToExcel = () => {
    // Define the data source
    const displayedData = allOption === "All" ? alllocationData : newChartData;

    // Define headers and corresponding keys
    const headers = [
      allOption === "All" ? "Unit Name" : "Departments",
      "Grand Total",
      "Completed",
      "Pending",
      "Sum of WIP",
      "Rejected",
      "Percentage Completion",
    ];

    const selectedColumns = [
      allOption === "All" ? "locationName" : "deptName",
      "totalCount",
      "completedCount",
      "pendingCount",
      "wipCount",
      "rejectedCount",
      "completionPercentage",
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

  const columns: ColumnsType<any> = [
    {
      title: allOption === "All" ? "Unit Name" : "Departments",
      dataIndex: allOption === "All" ? "locationName" : "deptName",
      key: "name",
    },
    {
      title: "Grand Total",
      dataIndex: "totalCount",
      key: "totalCount",
      align: "center",
      onCell: (record) => ({
        onClick: () => handleCellClick(record, "totalCount"),
        style: { cursor: "pointer" },
      }),
    },
    {
      title: "Completed",
      dataIndex: "completedCount",
      key: "completedCount",
      align: "center",
      onCell: (record) => ({
        onClick: () => handleCellClick(record, "completedCount"),
        style: { cursor: "pointer" },
      }),
    },
    {
      title: "Pending",
      dataIndex: "pendingCount",
      key: "pendingCount",
      align: "center",
      onCell: (record) => ({
        onClick: () => handleCellClick(record, "pendingCount"),
        style: { cursor: "pointer" },
      }),
    },
    {
      title: "Sum of WIP",
      dataIndex: "wipCount",
      key: "wipCount",
      align: "center",
      onCell: (record) => ({
        onClick: () => handleCellClick(record, "wipCount"),
        style: { cursor: "pointer" },
      }),
    },
    {
      title: "Rejected",
      dataIndex: "rejectedCount",
      key: "rejectedCount",
      align: "center",
      onCell: (record) => ({
        onClick: () => handleCellClick(record, "rejectedCount"),
        style: { cursor: "pointer" },
      }),
    },
    {
      title: "Percentage Completion",
      dataIndex: "completionPercentage",
      key: "completionPercentage",
      align: "center",
      render: (text: any) => {
        const value = parseFloat(text);
        return isNaN(value) ? "0.00%" : `${value.toFixed(2)}%`;
      },
    },
  ];

  const departmentColumns: ColumnsType<any> = [
    {
      title: "Department Name",
      dataIndex: "departmentName",
      key: "departmentName",
    },
    {
      title: "Grand Total",
      dataIndex: "totalCount",
      key: "totalCount",
      align: "center",
      onCell: (record) => ({
        onClick: () => handleCellClick(record, "totalCount"),
        style: { cursor: "pointer" },
      }),
    },
    {
      title: "Completed",
      dataIndex: "completedCount",
      key: "completedCount",
      align: "center",
      onCell: (record) => ({
        onClick: () => handleCellClick(record, "completedCount"),
        style: { cursor: "pointer" },
      }),
    },
    {
      title: "Pending",
      dataIndex: "pendingCount",
      key: "pendingCount",
      align: "center",
      onCell: (record) => ({
        onClick: () => handleCellClick(record, "pendingCount"),
        style: { cursor: "pointer" },
      }),
    },
    {
      title: "Sum of WIP",
      dataIndex: "wipCount",
      key: "wipCount",
      align: "center",
      onCell: (record) => ({
        onClick: () => handleCellClick(record, "wipCount"),
        style: { cursor: "pointer" },
      }),
    },
    {
      title: "Rejected",
      dataIndex: "rejectedCount",
      key: "rejectedCount",
      align: "center",
      onCell: (record) => ({
        onClick: () => handleCellClick(record, "rejectedCount"),
        style: { cursor: "pointer" },
      }),
    },
  ];

  const expandedRowRender = (record: any) => {
    if (!record.departmentwiseData || record.departmentwiseData.length === 0) {
      return (
        <p style={{ textAlign: "center", margin: 0 }}>
          No department data available
        </p>
      );
    }
    return (
      <div className={classes.nesteddocumentTable}>
        <Table
          columns={departmentColumns}
          dataSource={record.departmentwiseData}
          rowKey="departmentName"
          pagination={false}
          style={{ marginTop: "5px" }}
        />
      </div>
    );
  };

  console.log("alllocationData", alllocationData);

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
          dataSource={allOption === "All" ? alllocationData : newChartData}
          columns={columns}
          rowKey={allOption === "All" ? "locationName" : "deptName"}
          pagination={false}
          {...(allOption === "All"
            ? {
                expandable: {
                  expandedRowRender,
                  rowExpandable: (record) =>
                    record.locationName !== "Grand Total",
                },
              }
            : {})}
          className={classes.documentTable}
        />
      </div>
    </>
  );
};

export default CapaTable;
