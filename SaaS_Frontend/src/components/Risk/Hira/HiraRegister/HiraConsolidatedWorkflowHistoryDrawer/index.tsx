//react, reactouter
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

//material-ui
import {
  makeStyles,
  Theme,
} from "@material-ui/core";
//antd
import { Space, Table, Tag, Typography } from "antd";

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
  consolidatedWorkflowHistoryDrawer?: any;
  handleConsolidatedCloseWorkflowHistoryDrawer?: any;
  riskConfig?: any;
};

const HiraConsolidatedWorkflowHistoryDrawer = ({
  consolidatedWorkflowHistoryDrawer,
  handleConsolidatedCloseWorkflowHistoryDrawer,
  riskConfig,
}: Props) => {
  const classes = useStyles();
  const params = useParams<any>();
  const userDetails = getSessionStorage();
  const navigate = useNavigate();
  const [workflowHistoryTableData, setWorkflowHistoryTableData] = useState<any>(
    []
  );

  useEffect(() => {
    if (
      !!consolidatedWorkflowHistoryDrawer?.open &&
      !!consolidatedWorkflowHistoryDrawer?.data &&
      !!consolidatedWorkflowHistoryDrawer?.data?.workflow?.length
    ) {
      console.log(
        "checkrisk history in hiraworkflowhistorydrawer",
        consolidatedWorkflowHistoryDrawer?.data?.workflow
      );

      setWorkflowHistoryTableData(
        consolidatedWorkflowHistoryDrawer?.data?.workflow
      );
    }
  }, [consolidatedWorkflowHistoryDrawer?.open]);

  const handleOpenHistoryPage = (record: any) => {
    console.log(
      "checkrisk record in handleOpenHistoryPage",
      consolidatedWorkflowHistoryDrawer?.data
    );
    const latestOngoingWorkflow = consolidatedWorkflowHistoryDrawer?.data?.workflow?.find(
      (workflow:any) => workflow?.cycleNumber === record?.cycleNumber
    )
    console.log("checkrisk9 latestOngoingWorkflow in handleOpenHistoryPage in revision history table", latestOngoingWorkflow);
    
    navigate(`/risk/riskregister/HIRA/revisionHistory/${riskConfig?._id}/${latestOngoingWorkflow?.hiraId}/${record.cycleNumber}`);
  };

  const columns = [
    {
      title: "Revision Number",
      dataIndex: "cycleNumber",
      key: "cycleNumber",
      render: (text: string, record: any) => (
        <Typography.Link
          onClick={() => handleOpenHistoryPage(record)}
          style={{ textDecoration: "underline" }}
        >
          {record?.cycleNumber ? record?.cycleNumber - 1 : text}
        </Typography.Link>
      ),
    },
    {
      title: `${riskConfig?.primaryClassification}`,
      dataIndex: "jobTitle",
      key: "jobTitle",
      render: (text: string, record: any) => (
        <span>
          {console.log("checkrisk record in jobtitle", record)}
          
          {record?.jobTitle || "N/A"}
        </span>
      ),
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      // responsive: ["md"],
      render: (_: any, record: any) => {
        if (record.status === "IN_REVIEW") {
          return (
            <Space size={[0, 8]} wrap>
              {" "}
              <Tag color="#50C878">IN REVIEW</Tag>
            </Space>
          );
        } else if (record.status === "IN_APPROVAL") {
          return (
            <Space size={[0, 8]} wrap>
              <Tag color="#7CB9E8">IN APPROVAL</Tag>
            </Space>
          );
        } else if (record.status === "APPROVED") {
          return (
            <Space size={[0, 8]} wrap>
              <Tag color="#6699CC">APPROVED</Tag>
            </Space>
          );
        } else {
          return (
            <Space size={[0, 8]} wrap>
              <Tag color="#CCCCFF">{record.status}</Tag>
            </Space>
          );
        }
      },
    },
    {
      title: "Reason for Revision",
      dataIndex: "reason",
      key: "reason",
      render: (text: string, record: any) => (
        <span>{record?.reason || "N/A"}</span>
      ),
    },
    {
      title: "Last Updated At",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (text: string) => (
        <span>{moment(text).format("DD-MM-YYYY HH:mm")}</span>
      ),
    },
  ];

  return (
      <div className={classes.root}>
        <div className={classes.tableWrapper}>
          <Table
            columns={columns}
            dataSource={workflowHistoryTableData}
            pagination={false}
          />
        </div>
      </div>
  );
};

export default HiraConsolidatedWorkflowHistoryDrawer;
