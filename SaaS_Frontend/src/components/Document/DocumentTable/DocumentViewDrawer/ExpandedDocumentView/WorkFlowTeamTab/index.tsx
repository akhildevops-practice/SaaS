//antd
import { Row, Table } from "antd";

//styles
import useStyles from "./style";

type Props = {
  peopleDrawer: any;
  setPeopleDrawer: any;
  togglePeopleDrawer: any;
  formData: any;
};

const DocWorkflowTopDrawer = ({
  peopleDrawer,
  setPeopleDrawer,
  togglePeopleDrawer,
  formData,
}: Props) => {
  const classes = useStyles();
  console.log("formdata", formData);
  const rows = [
    {
      title: "Creator",
      dataIndex: "creator",
      key: "creator",
    },
    {
      title: "Reviewer(S)",
      dataIndex: "reviewer",
      key: "reviewer",
    },
    {
      title: "Approver(S)",
      dataIndex: "reviewer",
      key: "reviewer",
    },
  ];

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

  // Function to format the data for the table
  const formatData = () => {
    const { AdditionalDocumentAdmins } = formData;

    const creatorData = AdditionalDocumentAdmins?.filter(
      (user: any) => user.type === "CREATOR"
    )?.map((user: any, index: any) => ({
      key: `creator_${index}`,
      creator: `${user?.firstname} ${user?.lastname}`,
    }));

    const reviewerData = AdditionalDocumentAdmins?.filter(
      (user: any) => user.type === "REVIEWER"
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

  const data = formatData();
  return (
    <Row gutter={[16, 16]}>
      <Table
        columns={columns}
        dataSource={data}
        tableLayout="fixed"
        className={classes.auditTrailTable}
        pagination={false}
      />
    </Row>
  );
};

export default DocWorkflowTopDrawer;
