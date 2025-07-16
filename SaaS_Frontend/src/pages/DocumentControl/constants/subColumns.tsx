import { Tooltip, Tag, Dropdown } from "antd";
import { ColumnsType } from "antd/es/table";
import { makeStyles } from "@material-ui/core/styles";
import { GoKebabHorizontal } from "react-icons/go";
import getSessionStorage from "utils/getSessionStorage";

const useCustomStyles = makeStyles(() => ({
  statusTag: {
    width: "103px",
    height: "36px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "8px 16px",
    borderRadius: "20px",
    backgroundColor: "rgba(3, 105, 161, 0.15)",
    fontWeight: 500,
    color: "#03496D",
    fontSize: "14px",
    textTransform: "capitalize",
  },
}));

function formatDate(inputDate: any) {
  if (inputDate != null) {
    const date = new Date(inputDate);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }
  return "";
}

export const getActionMenuItems = (record: any, userDetails: any) => {
  const state = record?.documentState;
  const userId = userDetails?.id;
  const canReview = record?.reviewers?.includes(userId);
  const canApprove = record?.approvers?.includes(userId);
  const hasCreateAccess = record?.hasCreateAccess;
  const workflowDetails = record?.workflowDetails;

  const items = [
    ...(hasCreateAccess ? [{ key: "edit", label: "Edit Document" }] : []),
    ...(state === "DRAFT" && hasCreateAccess && workflowDetails === "default"
      ? [{ key: "sendForReview", label: "Send for Review" }]
      : []),
    ...(state === "IN_REVIEW" || state === "IN_APPROVAL"
      ? [{ key: "sendForEdit", label: "Send for Edit" }]
      : []),
    ...(state === "Sent_For_Edit" &&
    hasCreateAccess &&
    workflowDetails === "default"
      ? [{ key: "sendForReview", label: "Send for Review" }]
      : []),
    ...(state === "IN_REVIEW" && canReview
      ? [{ key: "sendForApproval", label: "Send for Approval" }]
      : []),
    ...(state === "IN_APPROVAL" && canApprove
      ? [{ key: "approve", label: "Approve" }]
      : []),
    ...(state === "PUBLISHED" && (canReview || canApprove || hasCreateAccess)
      ? [{ key: "ammend", label: "Ammend" }]
      : []),
    ...(hasCreateAccess
      ? [
          {
            key: "delete",
            label: <span style={{ color: "red" }}>Delete Document</span>,
          },
        ]
      : []),
  ];

  return items;
};

export const createSubColumns = ({
  toggleDocViewDrawer,
  classes,
  handleEditProcessDoc,
  handleDocumentAction,
  handleDeleteDocument,
}: {
  toggleDocViewDrawer: any;
  classes: any;
  handleEditProcessDoc: any;
  handleDocumentAction: any;
  handleDeleteDocument: any;
}): ColumnsType<any> => {
  const antClasses = useCustomStyles();
  const userDetails = getSessionStorage();

  const statusMap: Record<string, { label: string; color: string }> = {
    DRAFT: { label: "Draft", color: "#e6f7ff" },
    IN_REVIEW: { label: "In Review", color: "#d9f7be" },
    IN_APPROVAL: { label: "In Approval", color: "#fff1b8" },
    PUBLISHED: { label: "Published", color: "#f6ffed" },
    Sent_For_Edit: { label: "Sent for Edit", color: "#fff2e8" },
    OBSOLETE: { label: "Obsolete", color: "#f9f0ff" },
  };

  return [
    {
      title: "Doc Number",
      dataIndex: "documentNumbering",
      key: "documentNumbering",
      width: 120,
      render: (_: any, record: any) => record.documentNumbering || "",
    },
    {
      title: "Doc Title",
      dataIndex: "documentName",
      key: "documentName",
      width: 250,
      render: (_: any, record: any) => {
        const title = record.documentName || "";
        const isTruncated = title.length > 25;
        const displayTitle = isTruncated ? `${title.slice(0, 25)}...` : title;

        return (
          <Tooltip title={title}>
            <div
              className={classes.clickableField}
              onClick={() => toggleDocViewDrawer(record)}
              style={{
                textDecorationLine: "underline",
                cursor: "pointer",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {displayTitle}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "Version",
      dataIndex: "version",
      width: 150,
      key: "version",
      render: (_: any, record: any) => {
        const versionType = record?.docTypeDetails?.versionType;
        const issueNumberStr = record?.issueNumber ?? "";
        const currentVersionStr = record?.currentVersion ?? "";

        let displayValue = "";

        if (versionType === "Numeric") {
          const issueNumberNum = parseInt(issueNumberStr);
          const currentVersionNum = parseFloat(currentVersionStr);

          const totalVersion = issueNumberNum + currentVersionNum;
          const decimalPart = totalVersion.toString().split(".")[1] || "0";

          displayValue = `${issueNumberStr}.${decimalPart}`;
        } else {
          displayValue = `${issueNumberStr} - ${currentVersionStr}`;
        }

        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {displayValue}
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "documentState",
      key: "documentState",
      width: 150,
      render: (_: any, record: any) => {
        const { label, color } = statusMap[record.documentState] || {
          label: record.documentState,
          color: "#f0f0f0",
        };

        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Tag
              style={{
                backgroundColor: color,
                borderRadius: "20px",
                padding: "4px 12px",
                fontWeight: 500,
                color: "#000",
                textTransform: "capitalize",
              }}
            >
              {label}
            </Tag>
          </div>
        );
      },
    },
    {
      title: "Published Date",
      dataIndex: "approvedDate",
      key: "approvedDate",
      width: 180,
      render: (_: any, record: any) =>
        record?.approvedDate ? formatDate(record.approvedDate) : "",
    },
    {
      title: "Action",
      key: "actions",
      width: 150,
      render: (_: any, record: any) => {
        const items = getActionMenuItems(record, userDetails);
        if (record.isVersion) return null;
        if (!items?.length) return null;

        return (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Dropdown
              menu={{
                items,
                onClick: ({ key }) => {
                  switch (key) {
                    case "edit":
                      handleEditProcessDoc(record);
                      break;
                    case "sendForReview":
                      handleDocumentAction(
                        `/api/documents/updateDocumentForReview/${record._id}`,
                        "IN_REVIEW",
                        record
                      );
                      break;
                    case "sendForEdit":
                      handleDocumentAction(
                        `/api/documents/updateDocumentForSendForEdit/${record._id}`,
                        "Sent_For_Edit",
                        record
                      );
                      break;
                    case "sendForApproval":
                      handleDocumentAction(
                        `/api/documents/updateDocumentForApproval/${record._id}`,
                        "IN_APPROVAL",
                        record
                      );
                      break;
                    case "approve":
                      handleDocumentAction(
                        `/api/documents/updateDocumentForPublishedState/${record._id}`,
                        "PUBLISHED",
                        record
                      );
                      break;
                    case "amend":
                      handleEditProcessDoc(record);
                      break;
                    case "delete":
                      handleDeleteDocument(record._id);
                      break;
                    default:
                      break;
                  }
                },
              }}
              trigger={["click"]}
              placement="bottomLeft"
            >
              <GoKebabHorizontal size={20} style={{ cursor: "pointer" }} />
            </Dropdown>
          </div>
        );
      },
    },
  ];
};
