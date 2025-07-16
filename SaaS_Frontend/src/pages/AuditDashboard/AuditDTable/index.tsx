import Table from "antd/es/table";
import styles from "./styles";
import { useEffect } from "react";
interface AuditData {
  key: string;
  auditName: string;
  auditNumber: string;
  unit: string;
  system: string;
}
interface AuditSubTableData {
  key: string;
  findingType: any;
  findings: any;
  department: any;
  system: any;
  clause: any;
}
type props = {
  auditTableData?: any;
};

const AuditDTable = ({ auditTableData }: props) => {
  const classes = styles();

  const columns = [
    {
      title: "Audit Name",
      dataIndex: "auditName",
      key: "auditName",
      width: 350,
    },
    {
      title: "Audit Number",
      dataIndex: "auditNumber",
      key: "auditNumber",
    },
    {
      title: "Func/Unit",
      dataIndex: "unit",
      key: "unit",
    },
    {
      title: "System",
      dataIndex: "system",
      key: "system",
    },
  ];

  const subColumns = [
    {
      title: "Finding Type",
      dataIndex: "findingType",
      key: "findingType",

      width: 350,

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
      title: "Department",
      dataIndex: "department",
      key: "department",
    },
    {
      title: "Audit Name",
      dataIndex: "auditName",
      key: "auditName",
    },
    {
      title: "System",
      dataIndex: "system",
      key: "system",
    },
    {
      title: "Clause",
      dataIndex: "clause",
      key: "clause",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Pending With",
      dataIndex: "pendingWith",
      key: "pendingWith",
    },
    {
      title: "Auditor",
      dataIndex: "auditor",
      key: "auditor",
    },
    {
      title: "Auditee",
      dataIndex: "auditee",
      key: "auditee",
    },
  ];

  const dataSource: AuditData[] = auditTableData?.response.map(
    (audit: any, index: number) => ({
      key: index.toString(),
      auditName: audit.auditName,
      auditNumber: audit.auditNumber,
      unit: audit.location.locationName,
      system:
        audit.system && audit.system.length > 0
          ? audit.system.map((s: any) => s.name).join(", ")
          : undefined,
      findingData: audit?.listOfFindings?.map((item: any) => ({
        department: audit?.auditedEntity?.entityName,
        auditName: audit?.auditName,
        system:
          audit.system && audit.system.length > 0
            ? audit.system.map((s: any) => s.name).join(", ")
            : undefined, // <-- Use the correct property name
        findingType: item?.type, // <-- Use the correct property name
        findings: item?.comment, // <-- Use the correct property name
        clause: item?.clause[0]?.clauseNumber, // <-- Use the correct property name
        status: item?.status,
        pendingWith: item?.currentlyUnder,
        auditor:
          audit.auditors && audit.auditors.length > 0
            ? audit.auditors.map((s: any) => s.username).join(", ")
            : undefined,
        auditee:
          audit.auditees && audit.auditees.length > 0
            ? audit.auditees.map((s: any) => s.username).join(", ")
            : undefined,
        id: item._id,
      })),
    })
  );

  useEffect(() => {
    const newRowElement = document?.querySelector(".new-row");
    if (newRowElement && dataSource?.length > 0) {
      newRowElement?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [dataSource]);

  const rowExpandable = (record: any) => {
    // Check if the subtable data exists for the record
    return record.findingData && record.findingData.length > 0;
  };

  return (
    <>
    <div
      style={{
        // width: "40vw", marginRight: "20px",
        backgroundColor: "#F8F9F9",
        margin: "20px 30px",
      }}
      className={classes.tableContainer}
    >
      <Table
        dataSource={dataSource}
        columns={columns}
        className={classes.documentTable}
        // rowClassName={(record, index) => {
        //   return "new-row";
        // }}
        expandable={{
          expandedRowRender: (record: any) => (
            <Table
              columns={subColumns}
              bordered
              dataSource={record.findingData}
              pagination={false}
              style={{
                margin: "10px 10px",
              }}
            />
          ),
          rowExpandable: rowExpandable,
        }}
      />
      {/* <div className="new-row"></div> */}
    </div>
    </>
  );
};

export default AuditDTable;
