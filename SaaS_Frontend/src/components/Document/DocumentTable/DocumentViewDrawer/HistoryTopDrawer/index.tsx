//react
import { useEffect, useState } from "react";

//material-ui
import { makeStyles, Theme } from "@material-ui/core/styles";

//antd
import { Drawer, Space, Table, Tabs } from "antd";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import { useMediaQuery } from "@material-ui/core";
import React from "react";
import { LuSignature } from "react-icons/lu";
import getSessionStorage from "utils/getSessionStorage";
import moment from 'moment';
const useStyles = (matches: any) =>
  makeStyles((theme: Theme) => ({
    drawer: {
      "& .ant-drawer-header": {
        backgroundColor: "aliceblue",
        textAlign: "center",
        padding: "10px 20px",
        borderBottom: "none",
      },
      // "& .ant-drawer-body": {
      //   overflowY: "hidden",
      // },
      // "& .ant-drawer-content": {
      borderBottomRightRadius: "10px",
      borderBottomLeftRadius: "10px",
      // },
    },
    tabsWrapper: {
      "& .ant-tabs-tab": {
        padding: "14px 9px",
        backgroundColor: "#F3F6F8",
        color: "#0E497A",
        fontSize: matches ? "14px" : "10px",
        fontWeight: 600,
        letterSpacing: "0.8px",
      },
      "& .ant-tabs .ant-tabs-tab": {
        padding: "14px 9px",
        backgroundColor: "#F3F6F8",
        color: "#0E497A",
        fontSize: matches ? "14px" : "10px",
        fontWeight: 600,
        letterSpacing: "0.8px",
      },
      "& .ant-tabs-tab-active": {
        padding: "14px 9px",
        backgroundColor: "#006EAD !important",
        color: "#fff !important",
        fontSize: matches ? "14px" : "10px",
        fontWeight: 600,
        letterSpacing: "0.8px",
      },
      "& .ant-tabs-tab-active div": {
        color: "white !important",
        fontWeight: 600,
        fontSize: matches ? "14px" : "10px",
        letterSpacing: "0.8px",
      },
      "& .ant-tabs .ant-tabs-tab+.ant-tabs-tab": {
        margin: "0 0 0 25px",
      },
    },
    tableWrapper: {
      "& .ant-table-wrapper .ant-table-thead>tr>th": {
        position: "sticky", // Add these two properties
        top: 0, // Add these two properties
        zIndex: 2,
        padding: "8px 16px",
        fontWeight: 600,
        fontSize: matches ? "13px" : "11px",

        background: "#E8F3F9",
      },
      "& .ant-table-wrapper .ant-table-tbody>tr>td": {
        fontSize: matches ? "13px" : "10px",
      },
      "& .ant-table-wrapper .ant-table-container": {
        maxHeight: matches ? "150px" : "300px", // Adjust the max-height value as needed
        overflowY: "auto",
      },
      "& .ant-table-body": {
        maxHeight: matches ? "150px" : "300px", // Adjust the max-height value as needed
        overflowY: "auto",
        "&::-webkit-scrollbar": {
          width: "8px",
          height: "10px", // Adjust the height value as needed
          backgroundColor: "#e5e4e2",
        },
        "&::-webkit-scrollbar-thumb": {
          borderRadius: "10px",
          backgroundColor: "grey",
        },
      },
    },
  }));

type Props = {
  historyDrawer: any;
  setHistoryDrawer: any;
  toggleHistoryDrawer: any;
  formData: any;
  workflowHistoryTableData?: any;
  attachmentHistoryTableData?: any;
};

const HistoryTopDrawer = ({
  historyDrawer,
  setHistoryDrawer,
  toggleHistoryDrawer,
  formData,
  workflowHistoryTableData,
  attachmentHistoryTableData,
}: Props) => {
  const matches = useMediaQuery("(min-width:786px)");
  const classes = useStyles(matches)();

  const tabs = [
    {
      label: "Version History",
      key: 1,
      children: <VersionHistory formData={formData} versionData={historyDrawer?.data?.documentVersions} />,
    },
    {
      label: "Workflow History",
      key: 2,
      children: <WorkflowHistory tableData={workflowHistoryTableData} />,
    },
    {
      label: "Attachment History",
      key: 3,
      children: <AttachmentHistory formData={attachmentHistoryTableData} />,
    },
  ];
  return (
    <Drawer
      title={"Document History"}
      placement="top"
      open={historyDrawer.open}
      closable={true}
      onClose={toggleHistoryDrawer}
      height={matches ? "100%" : 550}
      className={classes.drawer}
      maskClosable={false}
      closeIcon={
        <img
          src={CloseIconImageSvg}
          alt="close-drawer"
          style={{ width: "36px", height: "38px", cursor: "pointer" }}
        />
      }
      style={{ overflow: "hidden", overflowY: "hidden" }}
      // width="100%"
      getContainer={false} // Append this drawer to the first drawer
    >
      <Tabs
        defaultActiveKey="1"
        type="card"
        items={tabs as any}
        animated={{ inkBar: true, tabPane: true }}
        rootClassName={classes.tabsWrapper}
      />
    </Drawer>
  );
};

const VersionHistory = ({ formData, versionData=[] }: { formData: any, versionData:any }) => {
  const matches = useMediaQuery("(min-width:786px)");
  const classes = useStyles(matches)();
  const [tableData, setTableData] = useState<any>([]);
  let formattedData = [];
  if(versionData?.length > 0) {
   formattedData = versionData?.map((item:any)=>{
    if(item?.documentState === "OBSOLETE" && item?.currentVersion && item?.issueNumber) {
      return {
        ...item,
        versionName: item?.currentVersion+"-"+item?.issueNumber,
        // by: item?.userDetails?.firstname + " " + item?.userDetails?.lastname,
        approvedDate: item?.approvedDate,
        // versionLink: item?.versionLink,
      }
    }
  })
}
  


  const columns = [
    {
      title: "Issue - Version",
      dataIndex: "versionName",
      key: "versionName",
      // render: (_: any, record: any) => (
      //   <div
      //     style={{
      //       display: "flex",
      //       justifyContent: "flex-start",
      //       alignItems: "center",
      //     }}
      //   >
      //     {record.issueNumber} - {record.currentVersion}
      //   </div>
      // ),
    },
    // {
    //   title: "By",
    //   dataIndex: "by",
    //   key: "by",
    // },
    {
      title: "Approved Date",
      dataIndex: "approvedDate",
      key: "approvedDate",
      render: (_: any, record: any) => (
        <div>
          {moment(record.approvedDate).format("DD-MM-YYYY")}
        </div>
      ),
    },
    // {
    //   title: "Link",
    //   dataIndex: "versionLink",
    //   key: "versionLink",
    // },
  ];
  return (
    <div className={classes.tableWrapper}>
    { !!formattedData?.length ? <Table columns={columns} dataSource={formattedData} pagination={false} /> : <div></div>}
    </div>
  );
};

const WorkflowHistory = ({ tableData }: { tableData: any[] }) => {
  const matches = useMediaQuery("(min-width:786px)");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const userDetails = getSessionStorage();

  const toggleExpand = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };
  // const classes = useStyles(matches)();

  // const formattedData = (tableData || []).map((item, index) => {
  //   const date = new Date(item.createdAt);
  //   const formattedDate = `${date.getDate().toString().padStart(2, "0")}-${(
  //     date.getMonth() + 1
  //   )
  //     .toString()
  //     .padStart(2, "0")}-${date.getFullYear()}`;

  //   return {
  //     key: index,
  //     actionName: item.actionName || "N/A",
  //     actionBy:
  //       item.userDetails?.firstname || item.userDetails?.lastname
  //         ? `${item.userDetails?.firstname || ""} ${
  //             item.userDetails?.lastname || ""
  //           }`.trim()
  //         : item.userDetails?.username || "Unknown User",
  //     createdAt: formattedDate,
  //   };
  // });

  // const columns = [
  //   {
  //     title: "Action",
  //     dataIndex: "actionName",
  //     key: "actionName",
  //   },
  //   {
  //     title: "By",
  //     dataIndex: "actionBy",
  //     key: "actionBy",
  //   },
  //   {
  //     title: "Date",
  //     dataIndex: "createdAt",
  //     key: "createdAt",
  //   },
  // ];
  return (
    // <div className={classes.tableWrapper}>
    //   <Table columns={columns} dataSource={formattedData} pagination={false} />
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "32px",
        padding: "20px",
        overflowY: "auto",
        maxHeight: "100%",
      }}
    >
      {tableData.map((stage: any, index: number) => {
        const timestamp = stage?.digiSign?.signedAt || stage.createdAt;
        const isLast = index === tableData.length - 1;
        const isOrgSignatureEnabled =
          userDetails?.organization?.digitalSignature === true;
        const isExpanded = expandedIndex === index;

        return (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "16px",
              marginBottom: "32px",
            }}
          >
            {/* Timeline Column */}
            <div
              style={{
                width: "80px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  textAlign: "center",
                  whiteSpace: "pre-line",
                }}
              >
                {new Date(timestamp).toLocaleDateString()}
                {"\n"}
                {new Date(timestamp).toLocaleTimeString()}
              </div>

              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: "#003059",
                  margin: "8px 0",
                }}
              ></div>

              {!isLast && (
                <div
                  style={{
                    width: "2px",
                    backgroundColor: "#ccc",
                    flexGrow: 1,
                    minHeight: "60px",
                  }}
                />
              )}
            </div>

            {/* Stage Info Box */}
            {/* Combined Info Row: Stage Info + Optional Digital Signature */}
            <div
              style={{
                flex: 1,
                borderRadius: "8px",
                background: "#fff",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                padding: "20px",
                position: "relative",
                display: "flex",
                justifyContent: "space-between",
                gap: "20px",
              }}
            >
              {/* Expand Icon */}
              {isOrgSignatureEnabled && (
                <div
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    cursor: "pointer",
                    color: "#003059",
                  }}
                  onClick={() => toggleExpand(index)}
                >
                  <LuSignature size={22} title="Toggle Digital Signature" />
                </div>
              )}

              {/* Left: Stage Info */}
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0 }}>{stage.actionName}</h4>
                <Space direction="vertical" style={{ marginTop: "8px" }}>
                  {stage.userDetails.firstname +
                    " " +
                    stage.userDetails.lastname}
                  <div style={{ fontSize: "13px", color: "#444" }}>
                    {stage.userDetails?.roles?.join(", ")}
                  </div>
                </Space>

                {/* Comment Section */}
                {stage?.digiSign?.comment && (
                  <div
                    style={{
                      marginTop: "16px",
                      paddingTop: "12px",
                      borderTop: "1px solid #eee",
                      color: "#333",
                    }}
                  >
                    <strong>Comments:</strong> {stage?.digiSign?.comment}
                  </div>
                )}
              </div>

              {/* Right: Digital Signature */}
              {isExpanded &&
                isOrgSignatureEnabled &&
                stage?.digiSign?.personalSignature && (
                  <div
                    style={{
                      minWidth: "240px",
                      maxWidth: "280px",
                      backgroundColor: "#f9f9f9",
                      borderRadius: "8px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      padding: "16px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: "bold",
                        marginBottom: "10px",
                        textAlign: "center",
                      }}
                    >
                      Digital Signature
                      {new Date(stage?.digiSign?.signedAt).toLocaleString()}
                    </div>
                    <img
                      src={stage?.digiSign?.personalSignature}
                      alt="Signature"
                      style={{
                        width: "100%",
                        height: "auto",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                      }}
                    />
                  </div>
                )}
            </div>
          </div>
        );
      })}
    </div>
    // </div>
  );
};

const AttachmentHistory = ({ formData }: { formData: any[] }) => {
  const matches = useMediaQuery("(min-width:786px)");
  const classes = useStyles(matches)();

  const tabledata = formData?.map((item: any) => {
    const updatedAtDate = new Date(item?.updatedAt);
    const formattedDate = updatedAtDate.toLocaleDateString("en-GB");
    const urlParts = item?.updatedLink?.split("/");
    const documentNameWithExtension = urlParts?.[urlParts.length - 1];
    return {
      ...item,
      updatedAt: formattedDate,
      attachment: documentNameWithExtension,
      uploadedBy:
        item?.updatedByDetails?.firstname +
        " " +
        item?.updatedByDetails?.lastname,
    };
  });

  const columns = [
    {
      title: "Uploaded By",
      dataIndex: "uploadedBy",
      key: "uploadedBy",
    },
    {
      title: "Attachment Name",
      dataIndex: "attachment",
      key: "attachment",
    },
    {
      title: "Date",
      dataIndex: "updatedAt",
      key: "updatedAt",
    },
  ];

  return (
    <div className={classes.tableWrapper}>
      <Table
        columns={columns}
        dataSource={tabledata}
        pagination={false}
        rowKey={(record) => record._id}
      />
    </div>
  );
};

export default HistoryTopDrawer;
