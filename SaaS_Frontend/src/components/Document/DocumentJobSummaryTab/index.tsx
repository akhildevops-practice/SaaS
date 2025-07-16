import { useEffect, useState } from "react";
import { Button, message, Table } from "antd";
import useStyles from "./styles";
import axios from "apis/axios.global";
import { useSnackbar } from "notistack";
import getSessionStorage from "utils/getSessionStorage";
import { MdCached } from "react-icons/md";
import moment from "moment";
import { CircularProgress } from "@material-ui/core";
type Props = {};

const DocumentJobSummaryTab = ({}: Props) => {
  const { enqueueSnackbar } = useSnackbar();
  const userDetails = getSessionStorage();
  const classes = useStyles();

  const [tableData, setTableData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // useEffect(() => {
  //   console.log("checkdocnew useEffect[tableData]", tableData);
  // }, [tableData]);

  useEffect(() => {
    // const fetchUploadStatus = async () => {
    //   try {
    //     const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/documents/getJobSummary/${userDetails?.organizationId}`);
    //     console.log("checkdocnew response of getJobSummary", response);

    //     if(response.status === 200) {
    //       if(response.data.length > 0) {
    //         setTableData(response?.data);
    //       }
    //     }

    //   } catch (error) {
    //     console.error("Error fetching upload status:", error);
    //   }
    // };
    fetchUploadStatus();
    // // Start polling every 2 seconds
    // const intervalId = setInterval(fetchUploadStatus, 3000);

    // return () => clearInterval(intervalId); // Clear interval on component unmount
  }, []);

  const fetchUploadStatus = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/documents/getJobSummary/${userDetails?.organizationId}`
      );
      // console.log("checkdocnew response of getJobSummary", response);

      if (response.status === 200) {
        if (response.data.length > 0) {
          setTableData(response?.data);
          setIsLoading(false);
        } else {
          setTableData([]);
        }
      } else {
        setTableData([]);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching upload status:", error);
      setIsLoading(false);
    }
  };

  // console.log("SELECTED TOPIC ",selectedTopic)
  const handleDownloadLog = async (record: any) => {
    try {
      const response = await axios.get(
        `/api/documents/getDocumentsForDownload/${record?.organizationId}/${record.batchId}`
      );
      const data = response?.data;

      if (!data || !Array.isArray(data)) {
        return message.error("No log data available.");
      }

      const successful = data.filter((doc: any) => doc.status === "completed");
      const failed = data.filter(
        (doc: any) =>
          doc.status === "pending" ||
          (doc.status === "failed" && doc?.isFailed === true)
      );

      // console.log("failed", failed);
      const logText = `
  Batch ID: ${record.batchId}
  
  Uploaded At: ${new Date(record.createdAt).toLocaleString()}
  -----------------------------
  
  ✅ Successfully Uploaded:
  ${successful.map((d: any) => `- ${d.fileName}`).join("\n")}
  
  ❌ Failed Uploads:
  ${failed.map((d: any) => `- ${d.fileName}: ${d.reason}`).join("\n")}
  `;

      const blob = new Blob([logText], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Upload_Log_${record.batchId}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      // console.error("Error downloading log:", error);
      message.error("Failed to generate log.");
    }
  };

  const columns = [
    {
      title: "Batch Id",
      dataIndex: "batchId",
      key: "batchId",
      render: (text: any, record: any) => record?.batchId?.slice(0, 5),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (_: any, record: any) => {
        return <div> {record?.type}</div>;
      },
    },
    {
      title: "Initiated By",
      dataIndex: "initiatedBy",
      key: "initiatedBy",
      render: (_: any, record: any) => {
        return <div>{record?.initiatedBy}</div>;
      },
    },
    {
      title: "No. of Docs",
      dataIndex: "totalDocumentsCount",
      key: "totalDocumentsCount",
      render: (_: any, record: any) => {
        return <div>{record?.totalDocumentsCount}</div>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (_: any, record: any) => {
        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            <span>{record?.status}</span>
            {record?.status === "Pending" && (
              <CircularProgress
                size={20}
                style={{ marginLeft: "10px" }}
                color="primary"
              />
            )}
          </div>
        );
      },
    },
    {
      title: "Completed Count",
      dataIndex: "processedDocumentsCount",
      key: "processedDocumentsCount",
      render: (_: any, record: any) => {
        return <div>{record?.processedDocumentsCount}</div>;
      },
    },
    {
      title: "Failed Count",
      dataIndex: "failedDocumentsCount",
      key: "failedDocumentsCount",
      render: (_: any, record: any) => {
        return <div>{record?.failedDocumentsCount}</div>;
      },
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (_: any, record: any) => {
        return (
          <div> {moment(record?.createdAt).format("DD-MM-YYYY HH:mm")}</div>
        );
      },
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_: any, record: any) => (
        <Button type="link" onClick={() => handleDownloadLog(record)}>
          Download Log
        </Button>
      ),
    },
  ];

  return (
    <>
      <div className={classes.tableContainer} style={{ marginTop: "20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "10px",
          }}
        >
          <Button type="text" icon={<MdCached />} onClick={fetchUploadStatus} />
        </div>

        <div>
          <Table
            columns={columns}
            dataSource={tableData}
            rowKey="_id"
            className={classes.tableContainer}
            pagination={false}
            loading={isLoading}
          />
        </div>
      </div>
    </>
  );
};

export default DocumentJobSummaryTab;
