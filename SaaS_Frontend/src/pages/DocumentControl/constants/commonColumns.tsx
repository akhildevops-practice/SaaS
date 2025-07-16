import { Tooltip, Button, Tag } from "antd";
import { AiFillFilter, AiOutlineFilter } from "react-icons/ai";
import { ColumnsType } from "antd/es/table";
import MultiUserDisplay from "components/MultiUserDisplay";

interface props {
  filterList: {
    doctype: any[];
    system: any[];
    status: any[];
    entityId: any[];
    section: any[];
  };
  selectedFilters: any;
  setSelectedFilters: (updated: any) => void;
  confirmFilter: () => void;
  toggleDocViewDrawer: (record: any) => void;
  handleEditProcessDoc: (record: any) => void;
  handleOpen: (id: string) => void;
  matches: boolean;
  classes: any;
  iconColor: string;
  tabFilter: string;
  fetchDocuments: () => void;
}

export const createCommonDocColumns = ({
  filterList,
  selectedFilters,
  setSelectedFilters,
  confirmFilter,
  toggleDocViewDrawer,
  handleEditProcessDoc,
  handleOpen,
  matches,
  classes,
  iconColor,
  tabFilter,
  fetchDocuments,
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

  const renderSearchableFilterDropdown =
    (key: string, labelKey = "name") =>
    ({ confirm }: { confirm: any }) => {
      const allOptions = filterList[key as keyof typeof filterList] || [];
      const selected = selectedFilters[key] || [];
      const search = selectedFilters[`__search__${key}`] || "";

      const onChangeCheckbox = (id: string, checked: boolean) => {
        const updated = checked
          ? [...selected, id]
          : selected.filter((val: any) => val !== id);

        setSelectedFilters((prev: any) => ({
          ...prev,
          [key]: updated,
        }));
      };

      const onSelectAllChange = (checked: boolean) => {
        const updated = checked ? allOptions.map((item: any) => item.id) : [];
        setSelectedFilters((prev: any) => ({
          ...prev,
          [key]: updated,
        }));
      };

      const onSearchChange = (value: string) => {
        setSelectedFilters((prev: any) => ({
          ...prev,
          [`__search__${key}`]: value,
        }));
      };

      const onApply = () => {
        confirmFilter();
        confirm();
      };

      const onReset = () => {
        setSelectedFilters((prev: any) => ({
          ...prev,
          [key]: [],
          [`__search__${key}`]: "",
        }));
        confirm();
      };

      const filteredOptions = allOptions.filter((item: any) =>
        (item[labelKey] || "")
          .toLowerCase()
          .includes((search || "").toLowerCase())
      );

      const allSelected =
        filteredOptions.length > 0 &&
        filteredOptions.every((item: any) => selected.includes(item.id));

      return (
        <div style={{ padding: 8, maxHeight: 300, overflowY: "auto" }}>
          <input
            type="text"
            placeholder={`Search ${key}`}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
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
              checked={allSelected}
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
                  checked={selected.includes(item.id)}
                  onChange={(e) => onChangeCheckbox(item.id, e.target.checked)}
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
            <Button
              type="primary"
              onClick={onApply}
              disabled={selected.length === 0}
            >
              Apply
            </Button>
            <Button onClick={onReset}>Reset</Button>
          </div>
        </div>
      );
    };

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
      width: 250,
      render: (_: any, record: any) => {
        const title = record.documentName || "";
        const displayTitle =
          title.length > 25 ? `${title.slice(0, 25)}...` : title;
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
          <div style={{ display: "flex", justifyContent: "center" }}>
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
      ...(tabFilter === "favorites" && {
        filterIcon: () =>
          selectedFilters.status?.length > 0 ? (
            <AiFillFilter style={{ color: "black" }} />
          ) : (
            <AiOutlineFilter />
          ),
        filterDropdown: renderSearchableFilterDropdown("status"),
      }),
    },
    {
      title: "Published Date",
      dataIndex: "approvedDate",
      key: "approvedDate",
      width: 180,
      render: (_: any, record: any) =>
        record?.approvedDate ? (
          <div style={{ display: "flex", justifyContent: "center" }}>
            {record.approvedDate.split("T")[0]}
          </div>
        ) : (
          ""
        ),
    },
  ];
};
