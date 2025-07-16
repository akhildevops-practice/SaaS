import { Drawer, Row, Table } from "antd";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import useStyles from "./style";
type Props = {
  peopleDrawer: any;
  setPeopleDrawer: any;
  togglePeopleDrawer: any;
  formData: any;
};

const PeopleDrawer = ({
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
    const { approversDetails, reviewersDetails, createdByDetails } = formData;

    const creatorData =
      createdByDetails?.firstname + " " + createdByDetails?.lastname;

    const reviewerData = reviewersDetails.map(
      (item: any) => item.firstname + " " + item.lastname
    );

    const approverData = approversDetails.map(
      (item: any) => item.firstname + " " + item.lastname
    );

    const maxRowCount = Math.max(reviewerData.length, approverData.length);
    const rows = [];

    for (let i = 0; i < maxRowCount; i++) {
      rows.push({
        key: `row_${i}`,
        creator: i === 0 ? creatorData : "", // Only show creator in first row
        reviewer: reviewerData[i] || "",
        approver: approverData[i] || "",
      });
    }

    console.log("rows", rows);
    return rows;
  };

  const data = formatData();
  console.log("data", data);
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
          dataSource={data}
          tableLayout="fixed"
          className={classes.auditTrailTable}
          pagination={false}
        />
      </Row>
    </Drawer>
  );
};

export default PeopleDrawer;
