import { Tooltip, Button, Divider, Tag, Dropdown, message } from "antd";
import { AiFillFilter, AiOutlineFilter } from "react-icons/ai";
import { IconButton } from "@material-ui/core";
import { ColumnsType } from "antd/es/table";
import { ReactComponent as CustomEditIcon } from "assets/documentControl/Edit.svg";
import { ReactComponent as CustomDeleteICon } from "assets/documentControl/Delete.svg";
import MultiUserDisplay from "components/MultiUserDisplay"; // or wherever it's from
import { GoKebabHorizontal } from "react-icons/go";
import getSessionStorage from "utils/getSessionStorage";

import { makeStyles } from "@material-ui/core/styles";
import { useState } from "react";

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
interface props {
  filterOptions: {
    docType: any[];
    system: any[];
    status: any[];
    locationId: any[];
    entityId: any[];
    section: any[];
    myRole: any[];
  };
  selectedFilters: {
    docType: string[];
    system: string[];
    status: string[];
    locationId: string[];
    entityId: string[];
    section: string[];
    myRole: string[];
  };
  setSelectedFilters: (updated: any) => void;
  searchValues: {
    [key: string]: string;
  };
  setSearchValues: (updated: any) => void;
  confirmFilter: (updated: any) => void;
  resetFilter: () => void;
  toggleDocViewDrawer: (record: any) => void;
  handleEditProcessDoc: (record: any) => void;
  handleOpen: (id: string) => void;
  fetchDocuments: () => void;
  matches: boolean;
  iconColor: string;
  classes: any;
  tabFilter: string;
  handleDocumentAction: any;
  handleDeleteDocument: any;
  handleDigiSignAndSubmit: any;
  //   refElementForAllDocument3?: React.RefObject<any>;
}

type ActionHandlers = {
  handleEditProcessDoc: any;
  handleDocumentAction: any;
  handleOpen: any;
};

export const getActionMenuItems = (record: any, userDetails: any) => {
  const state = record?.documentState;
  const userId = userDetails?.id;
  const canReview = record?.reviewers?.includes(userId);
  const canApprove = record?.approvers?.includes(userId);
  const hasCreateAccess = record?.hasCreateAccess;
  const workflowDetails = record?.workflowDetails;

  if (
    workflowDetails !== "default" &&
    workflowDetails !== "none" &&
    state !== "PUBLISHED"
  ) {
    const currentStage = workflowDetails.workflow.find(
      (item: any) => item.stage === record.documentState
    );
    let hasEditAccess = false;
    if (currentStage) {
      hasEditAccess = currentStage?.ownerSettings?.some((group: any[]) =>
        group.some((condition: any) =>
          condition?.selectedUsers?.includes(userId)
        )
      );
    }

    const itemsMap = new Map<string, { key: string; label: React.ReactNode }>();

    if (record.createdBy.id === userId) {
      itemsMap.set("edit", { key: "edit", label: "Edit Document" });
      itemsMap.set("delete", {
        key: "delete",
        label: <span style={{ color: "red" }}>Delete Document</span>,
      });
    }

    if (hasEditAccess) {
      itemsMap.set("edit", { key: "edit", label: "Edit Document" });
    }

    return Array.from(itemsMap.values());
  }

  // If document is PUBLISHED, only show Amend and Delete (based on access)
  if (state === "PUBLISHED") {
    const items = [];

    if (canReview || canApprove || hasCreateAccess) {
      items.push({ key: "amend", label: "Amend" });
    }

    if (hasCreateAccess) {
      items.push({
        key: "delete",
        label: <span style={{ color: "red" }}>Delete Document</span>,
      });
    }

    return items;
  }

  // Else: return original logic for all other states
  const items = [
    ...(hasCreateAccess ? [{ key: "edit", label: "Edit Document" }] : []),
    ...(state === "DRAFT" && hasCreateAccess && workflowDetails === "default"
      ? [{ key: "sendForReview", label: "Send for Review" }]
      : []),
    ...((state === "IN_REVIEW" && canReview) ||
    (state === "IN_APPROVAL" && canApprove)
      ? [{ key: "sendForEdit", label: "Send for Edit" }]
      : []),
    ...(state === "Sent_For_Edit" &&
    hasCreateAccess &&
    workflowDetails === "default"
      ? [{ key: "sendForReview", label: "Send for Review" }]
      : []),
    ...(state === "IN_REVIEW" && canReview && workflowDetails === "default"
      ? [{ key: "sendForApproval", label: "Complete Review" }]
      : []),
    ...(state === "IN_APPROVAL" && canApprove && workflowDetails === "default"
      ? [{ key: "approve", label: "Approve" }]
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

export const createMyDocCOlumns = ({
  filterOptions,
  selectedFilters,
  setSelectedFilters,
  searchValues,
  setSearchValues,
  confirmFilter,
  resetFilter,
  toggleDocViewDrawer,
  handleEditProcessDoc,
  handleOpen,
  fetchDocuments,
  matches,
  iconColor,
  classes,
  tabFilter,
  handleDocumentAction,
  handleDeleteDocument,
  handleDigiSignAndSubmit,
}: // refElementForAllDocument3,
props): ColumnsType<any> => {
  const renderTooltipText = (text: string, width = 100) => (
    <Tooltip title={text}>
      <div style={{ width }}>
        <div
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {text}
        </div>
      </div>
    </Tooltip>
  );

  const userDetails = getSessionStorage();

  return [
    {
      title: "Doc Number",
      dataIndex: "docNumber",
      key: "docNumber",
      width: 120,
      render: (_: any, record: any) =>
        renderTooltipText(
          record.docNumber ? record?.docNumber : record?.documentNumbering,
          100
        ),
    },
    {
      title: "Doc Title",
      dataIndex: "documentName",
      key: "documentName",
      width: 300,
      render: (_: any, record: any) => {
        const title = record.documentName || "";
        const isTruncated = title.length > 50;
        // console.log("checkdoc8 isTruncated", isTruncated);
        const displayTitle = isTruncated ? `${title.slice(0, 50)}...` : title;

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
                maxWidth: "240px", // Adjust width if needed
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
        const statusMap: Record<string, { label: string; color: string }> = {
          DRAFT: { label: "Draft", color: "#e6f7ff" },
          IN_REVIEW: { label: "In Review", color: "#d9f7be" },
          IN_APPROVAL: { label: "In Approval", color: "#fff1b8" },
          PUBLISHED: { label: "Published", color: "#f6ffed" },
          Sent_For_Edit: { label: "Sent for Edit", color: "#fff2e8" },
          OBSOLETE: { label: "Obsolete", color: "#f9f0ff" },
        };

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
                padding: "2px 12px",
                fontWeight: 500,
                color: "#000",
                textTransform: "capitalize",
                whiteSpace: "normal", //  Allows text to wrap
                wordBreak: "break-word", //Ensures long words break
                textAlign: "center", // Optional: Center-align wrapped text
                // minWidth : "100px",
                // width : "170px",
                maxWidth: "170px", // Optional: Control width to force wrap
                display: "inline-block",
              }}
            >
              {label}
            </Tag>
          </div>
        );
      },
      ...(tabFilter !== "distributed" && {
        filterIcon: () =>
          selectedFilters.status?.length > 0 ? (
            <AiFillFilter style={{ color: "black" }} />
          ) : (
            <AiOutlineFilter />
          ),
        filterDropdown: ({ confirm }: { confirm: () => void }) => {
          const key = "status";
          const labelKey = "name";

          const allOptions =
            tabFilter === "inWorkflow"
              ? (filterOptions.status || []).filter((item: any) =>
                  ["IN_REVIEW", "IN_APPROVAL", "Sent_For_Edit"].includes(
                    item.id
                  )
                )
              : filterOptions.status || [];

          let localSelected = [...selectedFilters[key]];
          let localSearch = searchValues[key] || "";

          const getFilteredOptions = () =>
            allOptions.filter((item: any) =>
              (item[labelKey] || "")
                .toLowerCase()
                .includes(localSearch.toLowerCase())
            );

          const isAllSelected = () => {
            const filtered = getFilteredOptions();
            return (
              filtered.length > 0 &&
              filtered.every((item) => localSelected.includes(item.id))
            );
          };

          const onCheckboxChange = (id: string, checked: boolean) => {
            if (checked) {
              if (!localSelected.includes(id)) {
                localSelected = [...localSelected, id];
              }
            } else {
              localSelected = localSelected.filter((val) => val !== id);
            }
            // Update parent state immediately
            setSelectedFilters((prev: any) => ({
              ...prev,
              [key]: localSelected,
            }));
          };

          const onSelectAllChange = (checked: boolean) => {
            const filteredOptions = getFilteredOptions();
            if (checked) {
              // Add all filtered options to selection
              filteredOptions.forEach((item) => {
                if (!localSelected.includes(item.id)) {
                  localSelected.push(item.id);
                }
              });
            } else {
              // Remove all filtered options from selection
              localSelected = localSelected.filter(
                (id) => !filteredOptions.some((item) => item.id === id)
              );
            }
            // Update parent state immediately
            setSelectedFilters((prev: any) => ({
              ...prev,
              [key]: localSelected,
            }));
          };

          const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            localSearch = e.target.value;
            // Update parent state immediately
            setSearchValues((prev: any) => ({
              ...prev,
              [key]: localSearch,
            }));
          };

          const onApply = () => {
            setSelectedFilters((prev: any) => ({
              ...prev,
              [key]: localSelected,
            }));
            setSearchValues((prev: any) => ({
              ...prev,
              [key]: localSearch,
            }));
            confirm();
          };

          const onReset = () => {
            localSelected = [];
            localSearch = "";
            // Update parent state immediately
            setSelectedFilters((prev: any) => ({
              ...prev,
              [key]: [],
            }));
            setSearchValues((prev: any) => ({
              ...prev,
              [key]: "",
            }));
            confirm();
          };

          const filteredOptions = getFilteredOptions();

          return (
            <div style={{ padding: 8, maxHeight: 300, overflowY: "auto" }}>
              <input
                type="text"
                value={localSearch}
                placeholder="Search status"
                onChange={onSearchChange}
                style={{
                  width: "100%",
                  marginBottom: 8,
                  padding: 8,
                  border: "1px solid #d9d9d9",
                  borderRadius: "4px",
                }}
              />
              <label style={{ display: "block", marginBottom: 8 }}>
                <input
                  type="checkbox"
                  checked={isAllSelected()}
                  onChange={(e) => onSelectAllChange(e.target.checked)}
                  style={{ marginRight: 8 }}
                />
                Select All
              </label>
              {filteredOptions.map((item: any) => (
                <div key={item.id} style={{ marginBottom: 4 }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={localSelected.includes(item.id)}
                      onChange={(e) =>
                        onCheckboxChange(item.id, e.target.checked)
                      }
                      style={{ marginRight: 8 }}
                    />
                    {item[labelKey]}
                  </label>
                </div>
              ))}
              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Button type="primary" onClick={onApply}>
                  Apply
                </Button>
                <Button onClick={onReset}>Reset</Button>
              </div>
            </div>
          );
        },

        filteredValue: null,
      }),
    },
    {
      title: "Pending With",
      dataIndex: "pendingWith",
      key: "pendingWith",
      width: 150,
      render: (_, record) => {
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MultiUserDisplay
              data={record?.pendingWith?.map(
                (item: any) => item.firstname + " " + item.lastname
              )}
              name="pendingWith"
            />
          </div>
        );
      },
    },
    {
      title: "Published Date",
      dataIndex: "approvedDate",
      key: "approvedDate",
      width: 180,
      render: (_: any, record: any) => {
        if (!record?.approvedDate) return "";

        const date = new Date(record.approvedDate);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
        const year = date.getFullYear();

        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {`${day}-${month}-${year}`}
          </div>
        );
      },
    },

    {
      title: "Action",
      key: "actions",
      width: 150,
      render: (_: any, record: any) => {
        const userId = getSessionStorage()?.id;
        const items = getActionMenuItems(record, userDetails);
        if (record.isVersion) return null;
        if (!items?.length) return null;
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Dropdown
              menu={{
                items,
                onClick: ({ key }) => {
                  switch (key) {
                    case "edit":
                      handleEditProcessDoc(record);
                      break;
                    case "sendForReview":
                      if (userDetails?.organization?.digitalSignature) {
                        handleDigiSignAndSubmit(
                          `/api/documents/updateDocumentForReview/${record._id}`,
                          "IN_REVIEW",
                          record
                        );
                      } else {
                        handleDocumentAction(
                          `/api/documents/updateDocumentForReview/${record._id}`,
                          "IN_REVIEW",
                          record
                        );
                      }
                      break;
                    case "sendForEdit":
                      if (userDetails?.organization?.digitalSignature) {
                        handleDigiSignAndSubmit(
                          `/api/documents/updateDocumentForSendForEdit/${record._id}`,
                          "Sent_For_Edit",
                          record
                        );
                      } else {
                        handleDocumentAction(
                          `/api/documents/updateDocumentForReview/${record._id}`,
                          "IN_REVIEW",
                          record
                        );
                      }
                      break;
                    case "sendForApproval":
                      if (userDetails?.organization?.digitalSignature) {
                        handleDigiSignAndSubmit(
                          `/api/documents/updateDocumentForApproval/${record._id}`,
                          "IN_APPROVAL",
                          record
                        );
                      } else {
                        handleDocumentAction(
                          `/api/documents/updateDocumentForApproval/${record._id}`,
                          "IN_APPROVAL",
                          record
                        );
                      }
                      break;
                    case "approve":
                      if (userDetails?.organization?.digitalSignature) {
                        handleDigiSignAndSubmit(
                          `/api/documents/updateDocumentForPublishedState/${record._id}`,
                          "PUBLISHED",
                          record
                        );
                      } else {
                        handleDocumentAction(
                          `/api/documents/updateDocumentForPublishedState/${record._id}`,
                          "PUBLISHED",
                          record
                        );
                      }
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
