import { Tooltip } from "antd";
import { ColumnsType } from "antd/es/table";

interface props {
  filterOptions: {
    docType: any[];
    system: any[];
    status: any[];
    locationId: any[];
    entityId: any[];
    section: any[];
  };
  selectedFilters: {
    docType: string[];
    system: string[];
    status: string[];
    locationId: string[];
    entityId: string[];
    section: string[];
  };
  setSelectedFilters: (updated: any) => void;
  searchValues: {
    [key: string]: string;
  };
  setSearchValues: (updated: any) => void;
  confirmFilter: () => void;
  resetFilter: () => void;
  toggleDocViewDrawer: (record: any) => void;
  handleEditProcessDoc: (record: any) => void;
  handleOpen: (id: string) => void;
  fetchDocuments: () => void;
  matches: boolean;
  classes: any;
  iconColor: string;
}

export const createAllDocColumns = ({
  filterOptions,
  selectedFilters,
  setSelectedFilters,
  searchValues,
  setSearchValues,
  confirmFilter,
  resetFilter,
  toggleDocViewDrawer,
  classes,
}: props): ColumnsType<any> => {
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

  return [
    {
      title: "Doc Number",
      dataIndex: "docNumber",
      key: "docNumber",
      width: 120,
      render: (_: any, record: any) =>
        renderTooltipText(record?.documentNumbering, 100),
    },
    {
      title: "Doc Title",
      dataIndex: "documentName",
      key: "documentName",
      width: 250,
      render: (_: any, record: any) => {
        const title = record.documentName || "";
        const isTruncated = title.length > 50;
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
                maxWidth: "240px",
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
      title: "Next Revision Due Date",
      dataIndex: "nextRevisionDate",
      key: "nextRevisionDate",
      width: 180,
      render: (_: any, record: any) => {
        if (!record?.nextRevisionDate) return "";

        const date = new Date(record.nextRevisionDate);
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
  ];
};
