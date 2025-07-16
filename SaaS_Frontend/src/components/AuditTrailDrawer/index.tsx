// antd
import { Drawer, Row, Table, Select } from "antd";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import { PlusCircleOutlined, MinusCircleOutlined } from "@ant-design/icons";
// styles
import useStyles from "./style";
import { useState, useEffect } from "react";

type Props = {
  auditTrailDrawer: any;
  setAuditTrailDrawer: any;
  toggleAuditTrailDrawer: any;
  auditTrailData: any;
};

const AuditTrailDrawer = ({
  auditTrailDrawer,
  setAuditTrailDrawer,
  toggleAuditTrailDrawer,
  auditTrailData,
}: Props) => {
  const classes = useStyles();
  const [filterType, setFilterType] = useState<string>("All");
  const [formFieldOptions, setFormFieldOptions] = useState<any[]>([]);

  const columns = [
    {
      title: "Action By",
      dataIndex: "actionBy",
      key: "actionBy",
    },
    {
      title: "Action Type",
      dataIndex: "actionType",
      key: "actionType",
    },
    {
      title: "Date and Time",
      dataIndex: "dateTime",
      key: "dateTime",
    },
  ];

  const subColumns: any = [
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Field",
      dataIndex: "field",
      key: "field",
    },
    {
      title: "Previous Value",
      dataIndex: "previousValue",
      key: "previousValue",
      align: "left",
    },
    {
      title: "Current Value",
      dataIndex: "currentValue",
      key: "currentValue",
      align: "left",
    },
  ];

  const formatDate = (isoString: any) => {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  const formatData = () => {
    return auditTrailData
      .filter((data: any) =>
        filterType === "All" ? true :
        data.actionType === "update" && data.changes?.some((change: any) =>
          formFieldOptions.includes(filterType) ? change.attributeName === filterType : change.type === filterType
        )
      )
      .map((data: any, index: any) => ({
        key: `row_${index}`,
        actionBy: data?.responsibleUserName,
        actionType:
          data?.actionType === "insert"
            ? "Create"
            : data?.actionType === "update"
            ? "Update"
            : "Delete",
        dateTime: formatDate(data?.timestamp),
        auditData: data || "",
      }));
  };

  const expandIcon = ({ expanded, onExpand, record }: any) => {
    const icon = expanded ? <MinusCircleOutlined /> : <PlusCircleOutlined />;
    if (record?.auditData?.changes?.length > 0) {
      return <a onClick={(e) => onExpand(record, e)}>{icon}</a>;
    }
    return null;
  };

  const transformAuditData = (changes: any[]) => {
    if (!changes) return [];
    return changes
      .filter((change) =>
        filterType === "All"
          ? true
          : formFieldOptions.includes(filterType)
          ? change.attributeName === filterType
          : change.type === filterType
      )
      .map((change) => ({
        key: change.id || change.attributeName,
        field: change.attributeName,
        previousValue: change.beforeValue,
        currentValue: change.afterValue,
        type: change.type,
      }));
  };

  useEffect(() => {
    const formFields = auditTrailData.flatMap((data: any) =>
      (data.changes || [])
        .filter((change: any) => change.type === "Form Fields")
        .map((change: any) => change.attributeName)
    );
    setFormFieldOptions([...new Set(formFields)]);
  }, [auditTrailData]);

  const data = formatData();

  return (
    <Drawer
      title={"Audit Trail"}
      placement="top"
      open={auditTrailDrawer}
      closable={true}
      onClose={toggleAuditTrailDrawer}
      height={700}
      style={{ overflow: "hidden" }}
      maskClosable={false}
      closeIcon={
        <img
          src={CloseIconImageSvg}
          alt="close-drawer"
          style={{ width: "36px", height: "38px", cursor: "pointer" }}
        />
      }
      getContainer={false}
    >
      <Row gutter={[16, 16]}>
        <Select
          defaultValue="All"
          style={{ width: 200, marginBottom: 16 }}
          onChange={(value) => setFilterType(value)}
          options={[
            { value: "All", label: "All" },
            { value: "Status", label: "Status" },
            { value: "Form Fields", label: "Form Fields" },
            { value: "Table Content", label: "Table Content" },
            ...formFieldOptions.map((field) => ({
              value: field,
              label: field,
            })),
          ]}
        />
        <Table
          columns={columns}
          dataSource={data}
          tableLayout="fixed"
          className={classes.auditTrailTable}
          pagination={false}
          expandable={{
            expandedRowRender: (record: any) => {
              const auditData = record.auditData || {};
              const subTableData = transformAuditData(auditData.changes);
              return subTableData.length ? (
                <Table
                  className={classes.subTableContainer}
                  style={{
                    width: 1200,
                    paddingBottom: "20px",
                    paddingTop: "20px",
                  }}
                  columns={subColumns}
                  bordered
                  dataSource={subTableData}
                  pagination={false}
                />
              ) : null;
            },
            expandIcon,
          }}
        />
      </Row>
    </Drawer>
  );
};

export default AuditTrailDrawer;