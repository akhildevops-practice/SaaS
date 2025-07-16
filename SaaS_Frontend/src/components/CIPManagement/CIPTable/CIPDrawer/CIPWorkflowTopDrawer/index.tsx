//antd
import { Drawer, Row, Table } from "antd";

//styles
import useStyles from "./style";
import type { ColumnsType } from "antd/es/table";
import MultiUserDisplay from "components/MultiUserDisplay";
import CloseIconImageSvg from "assets/documentControl/Close.svg";

type Props = {
  peopleDrawer: any;
  setPeopleDrawer: any;
  togglePeopleDrawer: any;
  formData: any;
};

const CIPWorkflowTopDrawer = ({
  peopleDrawer,
  setPeopleDrawer,
  togglePeopleDrawer,
  formData,
}: Props) => {
  const classes = useStyles();

  const columns: ColumnsType<any> = [
    {
      title: "Creator",
      dataIndex: "createdBy",
      key: "createdBy",
      render: (record: any) => <>{record.name}</>,
    },
    {
      title: "Reviewer",
      dataIndex: "reviewers",
      render: (_, record) => {
        return (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MultiUserDisplay data={record?.reviewers} name="reviewerName" />
          </div>
        );
      },
    },
    {
      title: "Approver",
      dataIndex: "approvers",
      render: (_, record) => {
        return (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MultiUserDisplay data={record?.approvers} name="approverName" />
          </div>
        );
      },
    },
  ];

  // Function to format the data for the table
  const formatData = () => {
    const { AdditionalDocumentAdmins } = formData;

    const creatorData = AdditionalDocumentAdmins?.filter(
      (user: any) => user === "createdBy"
    )?.map((user: any, index: any) => ({
      key: `creator_${index}`,
      creator: user?.name,
    }));

    const reviewerData = AdditionalDocumentAdmins?.filter(
      (user: any) => user === "reviewers"
    )?.map((user: any, index: any) => ({
      key: `reviewer_${index}`,
      reviewer: `${user?.firstname} ${user?.lastname}`,
    }));

    const approverData = AdditionalDocumentAdmins?.filter(
      (user: any) => user.type === "APPROVER"
    )?.map((user: any, index: any) => ({
      key: `approver_${index}`,
      approver: `${user?.firstname} ${user?.lastname}`,
    }));

    const maxRowCount = Math.max(
      creatorData?.length,
      reviewerData?.length,
      approverData?.length
    );

    const rows = [];
    for (let i = 0; i < maxRowCount; i++) {
      rows.push({
        key: `row_${i}`,
        creator: creatorData[i]?.creator || "",
        reviewer: reviewerData[i]?.reviewer || "",
        approver: approverData[i]?.approver || "",
      });
    }

    return rows;
  };

  return (
    <Drawer
      title={"CIP Workflow Team"}
      placement="top"
      open={peopleDrawer}
      closable={true}
      closeIcon={
        <img
          src={CloseIconImageSvg}
          alt="close-drawer"
          style={{ width: "36px", height: "38px", cursor: "pointer" }}
        />
      }
      onClose={togglePeopleDrawer}
      height={200}
      className={classes.docDetailsDrawer}
      style={{ overflow: "hidden" }}
      getContainer={false}
      maskClosable={false}
    >
      <Row gutter={[16, 16]}>
        <Table
          columns={columns}
          dataSource={[formData]}
          tableLayout="fixed"
          className={classes.auditTrailTable}
          pagination={false}
        />
      </Row>
    </Drawer>
  );
};

export default CIPWorkflowTopDrawer;
