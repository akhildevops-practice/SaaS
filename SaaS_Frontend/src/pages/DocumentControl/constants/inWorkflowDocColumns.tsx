import { Tooltip, Button, Divider, Tag } from "antd";
import { AiFillFilter, AiOutlineFilter } from "react-icons/ai";
import { IconButton } from "@material-ui/core";
import { ColumnsType } from "antd/es/table";
import { ReactComponent as CustomEditIcon } from "assets/documentControl/Edit.svg";
import { ReactComponent as CustomDeleteICon } from "assets/documentControl/Delete.svg";
import MultiUserDisplay from "components/MultiUserDisplay";

interface props {
  filterOptions: {
    docType: any[];
    system: any[];
    status: any[];
    entityId: any[];
    section: any[];
  };
  selectedFilters: {
    docType: string[];
    system: string[];
    status: string[];
    entityId: string[];
    section: string[];
  };
  setSelectedFilters: (updated: any) => void;
  searchValues: { [key: string]: string };
  setSearchValues: (updated: any) => void;
  confirmFilter: () => void;
  resetFilter: () => void;
  toggleDocViewDrawer: (record: any) => void;
  handleEditProcessDoc: (record: any) => void;
  handleOpen: (id: string) => void;
  fetchDocuments: () => void;
  matches: boolean;
  iconColor: string;
  classes: any;
  tabFilter: string;
  // refElementForAllDocument3?: React.RefObject<any>;
}

export const createInWorkflowDocColumns = ({
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
  // refElementForAllDocument3,
}: props): ColumnsType<any> => {
  const renderFilterDropdown =
    (key: keyof typeof filterOptions, labelKey = "name") =>
    ({ confirm }: { confirm: any }) => {
      const allOptions = filterOptions[key] || [];
      const selected = selectedFilters[key] || [];
      const search = searchValues[key] || "";

      return (
        <div style={{ padding: 8, maxHeight: 300, overflowY: "auto" }}>
          <input
            type="text"
            placeholder={`Search ${key}`}
            value={search}
            onChange={(e) =>
              setSearchValues((prev: any) => ({
                ...prev,
                [key]: e.target.value,
              }))
            }
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
              checked={
                allOptions.length > 0 &&
                selected.length === allOptions.length
              }
              onChange={(e) => {
                const updated = e.target.checked
                  ? allOptions.map((item: any) => item.id)
                  : [];
                setSelectedFilters((prev: any) => ({
                  ...prev,
                  [key]: updated,
                }));
              }}
              style={{ marginRight: 8 }}
            />
            Select All
          </label>
          {allOptions
            .filter((item: any) =>
              (item[labelKey] || "")
                .toLowerCase()
                .includes(search.toLowerCase())
            )
            .map((item: any) => (
              <div key={item.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={selected.includes(item.id)}
                    onChange={(e) => {
                      const updated = e.target.checked
                        ? [...selected, item.id]
                        : selected.filter((id) => id !== item.id);
                      setSelectedFilters((prev: any) => ({
                        ...prev,
                        [key]: updated,
                      }));
                    }}
                    style={{ marginRight: 8 }}
                  />
                  {item[labelKey]}
                </label>
              </div>
            ))}
          <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between" }}>
            <Button
              type="primary"
              disabled={selected.length === 0}
              onClick={() => {
                confirm();
                confirmFilter();
              }}
            >
              Apply
            </Button>
            <Button onClick={() => resetFilter()}>Reset</Button>
          </div>
        </div>
      );
    };

  const renderTooltipText = (text: string, width = 100) => (
    <Tooltip title={text}>
      <div style={{ width }}>
        <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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
      render: (_: any, record: any) => renderTooltipText(record.docNumber, 80),
    },
    {
      title: "Title",
      dataIndex: "documentName",
      key: "documentName",
      width: 250,
      render: (_: any, record: any, index: number) => {
        const content = (
          <div
            className={classes.clickableField}
            onClick={() => toggleDocViewDrawer(record)}
            // ref={index === 0 ? refElementForAllDocument3 : undefined}
            style={{
              whiteSpace: "normal",
              overflow: "hidden",
              textOverflow: "ellipsis",
              textDecorationLine: "underline",
              cursor: "pointer",
              width: 130,
            }}
          >
            {record.documentName}
          </div>
        );
        return record.action ? (
          <Tooltip title={record.documentName}>{content}</Tooltip>
        ) : (
          <Tooltip title={record.documentName}>
            <>{record.documentName}</>
          </Tooltip>
        );
      },
    },
    {
      title: "Document Type",
      dataIndex: "docType",
      width: 150,
      render: (_: any, record: any) => renderTooltipText(record.docType, 100),
      filterIcon: () =>
        selectedFilters.docType?.length > 0 ? (
          <AiFillFilter style={{ color: "black" }} />
        ) : (
          <AiOutlineFilter />
        ),
      filterDropdown: renderFilterDropdown("docType"),
    },
    {
      title: "System",
      dataIndex: "system",
      width: 50,
      render: (_, record) => <MultiUserDisplay data={record.system} name="name" />,
      filterIcon: () =>
        selectedFilters.system?.length > 0 ? (
          <AiFillFilter style={{ color: "black" }} />
        ) : (
          <AiOutlineFilter />
        ),
      filterDropdown: renderFilterDropdown("system"),
    },
    {
      title: "Issue - Version",
      dataIndex: "version",
      key: "version",
      render: (_: any, record: any) => (
        <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
          {record.issueNumber} - {record.version}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "docStatus",
      key: "docStatus",
      render: (_: any, record: any) => (
        <Tag className={classes.statusTag}>{record.docStatus}</Tag>
      ),
      ...(tabFilter !== "distributedDoc" && {
        filterIcon: () =>
          selectedFilters.status?.length > 0 ? (
            <AiFillFilter style={{ color: "black" }} />
          ) : (
            <AiOutlineFilter />
          ),
        filterDropdown: renderFilterDropdown("status"),
      }),
    },
    {
      title: "Pending with",
      dataIndex: "pendingWith",
      key: "pendingWith",
      render: (_, record) => <MultiUserDisplay data={record.pendingWith} name="email" />,
    },
    {
      title: "Dept/Vertical",
      dataIndex: "department",
      key: "department",
      width: 100,
      render: (_: any, record: any) => renderTooltipText(record.department, 100),
      filterIcon: () =>
        selectedFilters.entityId?.length > 0 ? (
          <AiFillFilter style={{ color: "black" }} />
        ) : (
          <AiOutlineFilter />
        ),
      filterDropdown: renderFilterDropdown("entityId", "name"),
    },
    {
      title: "Corp Func/Unit",
      dataIndex: "location",
      key: "location",
      width: 150,
      render: (_: any, record: any) => renderTooltipText(record.location, 100),
    },
    {
      title: "Section",
      dataIndex: "sectionName",
      key: "sectionName",
      filterIcon: () =>
        selectedFilters.section?.length > 0 ? (
          <AiFillFilter style={{ color: "black" }} />
        ) : (
          <AiOutlineFilter />
        ),
      filterDropdown: renderFilterDropdown("section", "name"),
    },
    {
      title: "Action",
      dataIndex: "isAction",
      key: "isAction",
      width: 100,
      render: (_: any, record: any) =>
        !record.isVersion && (
          <>
            {record.editAcess && matches && (
              <IconButton
                className={classes.actionButtonStyle}
                onClick={() => handleEditProcessDoc(record)}
                style={{ color: iconColor }}
              >
                <CustomEditIcon width={18} height={18} />
              </IconButton>
            )}
            <Divider type="vertical" className={classes.docNavDivider} />
            {record.deleteAccess && (
              <IconButton
                className={classes.actionButtonStyle}
                onClick={() => handleOpen(record.id)}
                style={{ color: iconColor }}
              >
                <CustomDeleteICon width={18} height={18} />
              </IconButton>
            )}
          </>
        ),
    },
  ];
};
