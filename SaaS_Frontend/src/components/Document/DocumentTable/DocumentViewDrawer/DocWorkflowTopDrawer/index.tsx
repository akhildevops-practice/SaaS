import { Drawer, Row, Table } from "antd";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
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
  // console.log("docData in docworkflowtopdrawer", docData);
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
      title: "Reviewer(s)",
      dataIndex: "reviewer",
      key: "reviewer",
    },
    {
      title: "Approver(s)",
      dataIndex: "approver",
      key: "approver",
    },
  ];

  const customWorkflowColumns =
    docData?.docTypeDetails?.workflowId !== "default" &&
    docData?.docTypeDetails?.workflowId !== "none"
      ? docData?.workflowDetails?.workflow.map((item: any) => ({
          title: item.stage,
          dataIndex: item.stage.toLowerCase(),
          key: item.stage.toLowerCase(),
        }))
      : [];

  const formatUser = (user: any) =>
    user ? `${user?.firstname || ""} ${user?.lastname || ""}`.trim() : "";

  const customWorkflowData: any =
    docData?.docTypeDetails?.workflowId !== "default" &&
    docData?.docTypeDetails?.workflowId !== "none"
      ? [
          docData?.workflowDetails?.workflow.reduce((acc: any, item: any) => {
            const userNames = item.ownerSettings
              .flatMap((group: any[]) =>
                group.flatMap((condition: any) => {
                  if (condition.ifUserSelect) {
                    return (
                      condition.actualSelectedUsers?.map((userId: any) => {
                        const userDtls = condition.selectedUsers.find(
                          (item: any) => item.id === userId
                        );
                        return `${userDtls.firstname} ${userDtls.lastname}`;
                      }) || []
                    );
                  } else {
                    return (
                      condition.selectedUsers?.map(
                        (user: any) => `${user.firstname} ${user.lastname}`
                      ) || []
                    );
                  }
                })
              )
              .filter(Boolean); // Remove any null/undefined names

            acc[item.stage.toLowerCase()] = userNames.join(", ");
            return acc;
          }, {}),
        ]
      : [];

  const defaultWokflowPeopleDetails = [
    {
      creator:
        docData?.createdByDetails?.firstname +
        " " +
        docData?.createdByDetails?.lastname,
      reviewer: docData?.reviewersDetails
        ?.map((reviewer: any) => reviewer?.firstname + " " + reviewer?.lastname)
        .join(", "),
      approver: docData?.approversDetails
        ?.map((approver: any) => approver?.firstname + " " + approver?.lastname)
        .join(", "),
    },
  ];

  // console.log("defaultWokflowPeopleDetails", defaultWokflowPeopleDetails);

  return (
    <Drawer
      title="Document Workflow Team"
      placement="top"
      open={peopleDrawer.open}
      closable
      onClose={handleCloseDrawer}
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
      getContainer={false}
    >
      <Row gutter={[16, 16]}>
        <Table
          //columns={columns}
          columns={
            docData?.docTypeDetails?.workflowId === "default" ||
            docData?.docTypeDetails?.workflowId === "none"
              ? columns
              : customWorkflowColumns
          }
          dataSource={
            docData?.docTypeDetails?.workflowId === "default"
              ? defaultWokflowPeopleDetails
              : docData?.docTypeDetails?.workflowId === "none"
              ? []
              : customWorkflowData
          }
          tableLayout="fixed"
          className={classes.auditTrailTable}
          pagination={false}
        />
      </Row>
    </Drawer>
  );
};

export default DocWorkflowTopDrawer;
