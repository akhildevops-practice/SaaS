import { Drawer, Row, Table } from "antd";
import useStyles from "./style";
import CloseIconImageSvg from "assets/documentControl/Close.svg";

type Props = {
  auditTrailDrawer: any;
  setAuditTrailDrawer: any;
  toggleAuditTrailDrawer: any;
};

const AuditTrailDrawer = ({
  auditTrailDrawer,
  setAuditTrailDrawer,
  toggleAuditTrailDrawer,
}: Props) => {
  const classes = useStyles();
  const columns = [
    {
      title: "User",
      dataIndex: "user",
      key: "user",
    },
    {
      title: "Action Performed",
      dataIndex: "action",
      key: "action",
    },
    {
      title: "Date/Time",
      dataIndex: "datetime",
      key: "datetime",
    },
  ];
  const data:any = [
    // {
    //   key: "1",
    //   user: "John Doe",
    //   action: "Updated profile",
    //   datetime: "2023-05-18 12:00:00",
    // },
    // {
    //   key: "2",
    //   user: "Jane Doe",
    //   action: "Uploaded a document",
    //   datetime: "2023-05-18 13:00:00",
    // },
  ];

  const handleCloseDrawer = () => {
    setAuditTrailDrawer({
      ...auditTrailDrawer,
      open: !auditTrailDrawer.open,
      data: {},
    });
  };

  return (
    <Drawer
      title={"Audit Trail"}
      placement="top"
      maskClosable={false}
      closeIcon={
        <img
          src={CloseIconImageSvg}
          alt="close-drawer"
          style={{ width: "36px", height: "38px", cursor: "pointer" }}
        />
      }
      open={auditTrailDrawer}
      closable={true}
      onClose={toggleAuditTrailDrawer}
      height={250}
      className={classes.docDetailsDrawer}
      style={{ overflow: "hidden" }}
      // width="100%"
      getContainer={false} // Append this drawer to the first drawer
    >
      <Row gutter={[16, 16]}>
        <Table
          columns={columns}
          dataSource={data}
          tableLayout="fixed"
          className={classes.auditTrailTable}
          pagination={false}
        />
      </Row>
    </Drawer>
  );
};

export default AuditTrailDrawer;
