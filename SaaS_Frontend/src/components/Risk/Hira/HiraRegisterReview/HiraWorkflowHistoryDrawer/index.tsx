//react, reactouter
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

//material-ui
import {
  makeStyles,
  Theme,
} from "@material-ui/core";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
//antd
import { Drawer, Table } from "antd";

//utils
import getSessionStorage from "utils/getSessionStorage";

//thirdparty libs
import moment from "moment";

const useStyles = makeStyles((theme: Theme) => ({
  drawer: {
    "& .ant-drawer-header": {
      backgroundColor: "aliceblue",
      textAlign: "center",
      padding: "10px 20px",
      borderBottom: "none",
    },
    "& .ant-drawer-body": {
      overflowY: "hidden",
    },
    // "& .ant-drawer-content": {
    borderBottomRightRadius: "10px",
    borderBottomLeftRadius: "10px",
    // },
  },
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: theme.spacing(2),
  },
  comment: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(2),
  },
  avatar: {
    marginRight: theme.spacing(2),
  },
  commentText: {
    flexGrow: 1,
    padding: theme.spacing(1),
    backgroundColor: theme.palette.grey[100],
    borderRadius: theme.shape.borderRadius,
  },
  inputBox: {
    display: "flex",
    alignItems: "center",
    marginTop: "auto",
    padding: theme.spacing(2),
  },
  input: {
    flexGrow: 1,
    marginRight: theme.spacing(2),
  },
  tableWrapper: {
    "& .ant-table-wrapper .ant-table-thead>tr>th": {
      position: "sticky", // Add these two properties
      top: 0, // Add these two properties
      zIndex: 2,
      padding: "8px 16px",
      fontWeight: 600,
      fontSize: "13px",
      background: "#E8F3F9",
    },
    // "& .ant-table-wrapper .ant-table-container": {
    //   maxHeight: "150px", // Adjust the max-height value as needed
    //   overflowY: "auto",
    // },
    // "& .ant-table-body": {
    //   maxHeight: "150px", // Adjust the max-height value as needed
    //   overflowY: "auto",
    //   "&::-webkit-scrollbar": {
    //     width: "8px",
    //     height: "10px", // Adjust the height value as needed
    //     backgroundColor: "#e5e4e2",
    //   },
    //   "&::-webkit-scrollbar-thumb": {
    //     borderRadius: "10px",
    //     backgroundColor: "grey",
    //   },
    // },
  },
}));

type Props = {
  workflowHistoryDrawer?: any;
  handleCloseWorkflowHistoryDrawer?: any;
  riskConfig?: any;
};

function getObjectWithLargestCycleNumber(workflow: any) {
  return workflow.reduce(
    (max: any, obj: any) => (obj.cycleNumber > max.cycleNumber ? obj : max),
    workflow[0]
  );
}

const HiraWorkflowHistoryDrawer = ({
  workflowHistoryDrawer,
  handleCloseWorkflowHistoryDrawer,
  riskConfig,
}: Props) => {
  const classes = useStyles();
  const params = useParams<any>();
  const userDetails = getSessionStorage();
  const [workflowHistoryTableData, setWorkflowHistoryTableData] = useState<any>(
    []
  );

  useEffect(() => {
    if (
      !!workflowHistoryDrawer?.open &&
      !!workflowHistoryDrawer?.data &&
      !!workflowHistoryDrawer?.data?.workflow?.length
    ) {
      console.log(
        "checkrisk7 workflowHistoryDrawer.data in useEffect",
        workflowHistoryDrawer?.data
      );

      if (workflowHistoryDrawer?.cycleToFind >= 0) {
        // Find the workflow object whose status is not "APPROVED"
        const activeWorkflow = workflowHistoryDrawer.data.workflow.find(
          (workflowItem: any) =>
            workflowItem.cycleNumber ===
            workflowHistoryDrawer?.cycleToFind
        );

        if (activeWorkflow && activeWorkflow.workflowHistory.length > 0) {
          console.log(
            "Active workflow history:",
            activeWorkflow.workflowHistory
          );
          setWorkflowHistoryTableData(activeWorkflow.workflowHistory);
        } else {
          // Handle case where there is no active workflow or no history
          setWorkflowHistoryTableData([]);
          console.log("No active workflow or no history found.");
        }
      } else {
        const objectWithLargestCycleNumber = getObjectWithLargestCycleNumber(
          workflowHistoryDrawer.data.workflow
        );
        if (
          objectWithLargestCycleNumber &&
          objectWithLargestCycleNumber.workflowHistory.length > 0
        ) {
          console.log(
            "Active workflow history:",
            objectWithLargestCycleNumber.workflowHistory
          );
          setWorkflowHistoryTableData(
            objectWithLargestCycleNumber.workflowHistory
          );
        } else {
          // Handle case where there is no active workflow or no history
          setWorkflowHistoryTableData([]);
          console.log("No active workflow or no history found.");
        }
      }
    }
  }, [workflowHistoryDrawer]);

  const columns = [
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
    },
    {
      title: "By",
      dataIndex: "user",
      key: "user",
      render: (_: any, record: any) => (
        <span>{record?.byUser?.firstname + " " + record?.byUser?.lastname}</span>
      ),
    },
    {
      title: "Date",
      dataIndex: "datetime",
      key: "datetime",
      render: (text: string) => (
        <span>{moment(text).format("DD-MM-YYYY HH:mm")}</span>
      ),
    },
  ];

  return (
    <Drawer
      title={`${riskConfig?.primaryClassification} Workflow History`}
      open={workflowHistoryDrawer.open}
      closable={true}
      onClose={handleCloseWorkflowHistoryDrawer}
      // height={250}
      className={classes.drawer}
      // style={{ overflow: "hidden" }}
      width="30%"
      maskClosable={false}
      closeIcon={
        <img
          src={CloseIconImageSvg}
          alt="close-drawer"
          style={{ width: "36px", height: "38px", cursor: "pointer" }}
        />
      }
      // getContainer={false} // Append this drawer to the first drawer
    >
      <div className={classes.root}>
        <div className={classes.tableWrapper}>
          <Table
            columns={columns}
            dataSource={workflowHistoryTableData}
            // scroll={{ y: 150 }}
            pagination={false}
          />
        </div>
      </div>
    </Drawer>
  );
};

export default HiraWorkflowHistoryDrawer;
