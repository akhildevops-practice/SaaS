//antd
import { Drawer, Row, Table } from "antd";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
//styles
import useStyles from "./style";

type Props = {
  peopleDrawer: any;
  setPeopleDrawer: any;
  togglePeopleDrawer: any;
  docData: any;
};

const DocWorkflowTopDrawer = ({
  peopleDrawer,
  setPeopleDrawer,
  togglePeopleDrawer,
  docData,
}: Props) => {
  const classes = useStyles();
  console.log("formdata in docworklowtopdrawer",   docData);

  const handleCloseDrawer = () => {
    setPeopleDrawer({
      ...peopleDrawer,
      open: !peopleDrawer.open,
      data: {},
    });
  };
  const columns = [
    {
      title: "Creator",
      dataIndex: "creator",
      key: "creator",
    },
    {
      title: "Reviewer",
      dataIndex: "reviewer",
      key: "reviewer",
    },
    {
      title: "Approver",
      dataIndex: "approver",
      key: "approver",
    },
  ];



  return (
    <Drawer
      title={"Document Workflow Team"}
      placement="top"
      open={peopleDrawer}
      closable={true}
      onClose={togglePeopleDrawer}
      height={250}
      className={classes.docDetailsDrawer}
      style={{ overflow: "hidden" }}
      maskClosable={false}
      closeIcon={
        <img
          src={CloseIconImageSvg}
          alt="close-drawer"
          style={{ width: "36px", height: "38px", cursor: "pointer" }}
        />
      }
      // width="100%"
      getContainer={false} // Append this drawer to the first drawer
    >
      <Row gutter={[16, 16]}>
        <Table
          columns={columns}
          dataSource={[
            {
              creator:
                docData?.createdByDetails?.creatorDetails?.firstname +
                " " +
                docData?.createdByDetails?.creatorDetails?.lastname,
              reviewer: docData?.reviewersDetails
                ?.map(
                  (reviewer: any) =>
                    reviewer?.reviewerDetails?.firstname +
                    " " +
                    reviewer?.reviewerDetails?.lastname
                )
                .join(", "),
              approver: docData?.approversDetails
                ?.map(
                  (approver: any) =>
                    approver?.approverDetails?.firstname +
                    " " +
                    approver?.approverDetails?.lastname
                )
                .join(", "),
            },
          ]}
          tableLayout="fixed"
          className={classes.auditTrailTable}
          pagination={false}
        />
      </Row>
    </Drawer>
  );
};

export default DocWorkflowTopDrawer;
