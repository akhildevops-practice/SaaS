import useStyles from "./style";
import Table from "antd/es/table";
interface Data {
  labels: string[];
  counts: number[];
  documentStates: string[];
}

interface RowData {
  key: any;
  Dept: any;
  draft?: any;
  in_review?: any;
  in_approval?: any;
  send_for_edit?: any;
}

type props = {
  deptData?: any;
  activeTab?: any;
  deptStatusData?: any;
  newData?: any;
  filterQuery?: any;
  setFilterQuery?: any;
  inWorkFlowTable?: any;
  locationId?: any;
  locationIdNew?: any;
};

const InWorkFlowTable = ({
  deptData,
  activeTab,
  deptStatusData,
  newData,
  filterQuery,
  setFilterQuery,
  inWorkFlowTable,
  locationId,
  locationIdNew,
}: props) => {
  const classes = useStyles();

  const columns = [
    {
      title: `Unit`,
      dataIndex: "locationName",
      key: "locationName",
      width: 200,
    },

    {
      title: `Dept/Vertical`,
      dataIndex: "entityName",
      key: "entityName",
      width: 200,
    },
    {
      title: "Section",
      dataIndex: "sectionName",
      key: "sectionName",
      width: 200,
      render: (_: any, dataNew: any) => dataNew?.sectionName || "",
    },
    {
      title: "Doctype Name",
      dataIndex: "docTypeName",
      key: "docTypeName",
      width: 210,
      render: (_: any, dataNew: any) => dataNew?.docTypeName || "",
    },
    {
      title: "Draft",
      dataIndex: "DRAFT",
      key: "DRAFT",
      width: 60,

      render: (text: any, record: any) => record?.DRAFT || 0,
      onCell: (record: any) => ({
        onClick: () => {
          setFilterQuery({
            status: "DRAFT",
            type: record?.docTypeId,
            entityId: record?.entityId,
            sectionId: record?.section,
          });
        },
      }),
    },
    {
      title: "In Review",
      dataIndex: "IN_REVIEW",
      key: "IN_REVIEW",
      width: 100,

      render: (text: any, record: any) => record?.IN_REVIEW || 0,
      onCell: (record: any) => ({
        onClick: () => {
          setFilterQuery({
            status: "IN_REVIEW",
            type: record?.docTypeId,
            entityId: record?.entityId,
            sectionId: record?.section,
          });

          // Here you can use the ids as needed
        },
      }),
    },
    {
      title: "In Approval",
      dataIndex: "IN_APPROVAL",
      key: "IN_APPROVAL",
      width: 100,
      render: (text: any, record: any) => record?.IN_APPROVAL || 0,
      onCell: (record: any) => ({
        onClick: () => {
          setFilterQuery({
            status: "IN_APPROVAL",
            type: record?.docTypeId,
            entityId: record?.entityId,
            sectionId: record?.section,
          });

          // Here you can use the ids as needed
        },
      }),
    },
    {
      title: "Send For Edit",
      dataIndex: "SEND_FOR_EDIT",
      key: "SEND_FOR_EDIT",
      width: 100,
      render: (text: any, record: any) => record?.SEND_FOR_EDIT || 0,
      onCell: (record: any) => ({
        onClick: () => {
          setFilterQuery({
            status: "SEND_FOR_EDIT",
            entityId: record?.entityId,
            type: record?.docTypeId,
            sectionId: record?.section,
          });

          // Here you can use the ids as needed
        },
      }),
    },
    {
      title: "Published",
      dataIndex: "Published",
      key: "PUBLISHED",
      width: 100,

      render: (text: any, record: any) => record?.PUBLISHED || 0,
      onCell: (record: any) => ({
        onClick: () => {
          setFilterQuery({
            status: "PUBLISHED",
            entityId: record?.entityId,
            type: record?.docTypeId,
            sectionId: record?.section,
          });

          // const ids = record.data.SEND_FOR_EDIT.id;
          // newData(ids);
          // Here you can use the ids as needed
        },
      }),
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "PUBLISHED",
      width: 60,

      render: (text: any, record: any) => {
        const published = Number(record?.PUBLISHED || 0);
        const sendForEdit = Number(record?.SEND_FOR_EDIT || 0);
        const inApproval = Number(record?.IN_APPROVAL || 0);
        const inReview = Number(record?.IN_REVIEW || 0);
        const draft = Number(record?.DRAFT || 0);

        return sendForEdit + inApproval + inReview + draft + published;
        // + published;
      },
      onCell: (record: any) => ({
        onClick: () => {
          setFilterQuery({
            entityId: record?.entityId,
            sectionId: record?.section,
            type: record?.docTypeId,
          });

          // const ids = record.data.SEND_FOR_EDIT.id;
          // newData(ids);
          // Here you can use the ids as needed
        },
      }),
    },
  ];

  // Render the table
  return (
    <div
      style={{
        // width: "620px",
        // height: "230px",
        width: "100%",
        height: "100%",
        marginTop: "10px",
        overflow: "auto",
        // backgroundColor: "red",
      }}
      className={classes.tableContainer}
    >
      <Table
        dataSource={deptStatusData || []}
        columns={columns}
        pagination={false}
        className={`${classes.documentTable} ${classes.centerAlignedCell}`}
        scroll={{ y: inWorkFlowTable === false ? 160 : 400 }}
        // scroll={{ y: 180 }}
      />
      {/* <div style={{ marginLeft: "10px" }}>
        <Tooltip title="Click to Download Excel">
          <FileExcelTwoTone onClick={exportToExcel} />
        </Tooltip>
      </div> */}
    </div>
  );
};

export default InWorkFlowTable;
