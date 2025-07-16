import React, { useEffect, useState } from "react";
import { Select, Table, Switch, Checkbox, Button, Menu, Tooltip } from "antd";
import axios from "apis/axios.global";
import DashboardFilters from "./DashboardFilters";
import useStyles from "./style";
import { Divider } from "@material-ui/core";
import { MdCached } from "react-icons/md";
const { Option } = Select;

const ChecksheetDashboard = () => {
  const classes = useStyles();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [templateList, setTemplateList] = useState<any[]>([]);
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [filterIds, setFilterIds] = useState<string[]>([]);
  const [columnIds, setColumnIds] = useState<string[]>([]);
  const [numericFunction, setNumericFunction] = useState<any>([]);
  const [menuVisible, setMenuVisible] = useState(true);
  const [buttonValue, setButtonValue] = useState("formHeader");
  const [sheetValue, setSheetValue] = useState<any>();

  // console.log("dataSource", dataSource);
  // console.log("filterIds", filterIds);
  // console.log("columnIds", columnIds);

  const handleTemplateChange = (e: any, value: any) => {
    setSelectedId(e);
    setSheetValue(value);
  };

  // const onSearch = (value: string) => {
  //   console.log("search:", value);
  // };

  const filterOption: any = (
    input: string,
    option?: { label: string; value: string }
  ) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  useEffect(() => {
    getTemplates();
  }, []);

  useEffect(() => {
    if (selectedId) {
      getTableData();
    }
  }, [selectedId]);

  const getTemplates = async () => {
    try {
      const res = await axios.get(
        "api/auditchecksheet/getAuditChecksheetTemplates"
      );
      const data = res?.data?.map((ele: any) => ({
        label: ele?.title,
        value: ele?._id,
      }));
      setTemplateList(data);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const getTableData = async () => {
    const result = await axios.get(
      `/api/auditchecksheet/getAuditChecksheetTemplateDetails/${selectedId}`
    );
    const tableHeader = result.data.tableHeader?.map((ele: any) => ({
      ...ele,
      type: "tableHeader",
    }));
    const formHeader = result.data.formHeader?.map((ele: any) => ({
      ...ele,
      type: "formHeader",
    }));
    // Combine tableHeader and formHeader into a single data source
    const combinedData = [
      ...tableHeader.filter((item: any) => item.rowFieldType !== "value"),
      ...formHeader,
    ];
    setDataSource(combinedData);
  };

  const handleFilterSwitchChange = (checked: boolean, id: string) => {
    setFilterIds((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id)
    );
  };

  const handleColumnSwitchChange = (checked: boolean, id: string) => {
    setColumnIds((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id)
    );
  };

  const columns = [
    {
      title: "Attribute Name",
      dataIndex: "attributeName",
      key: "attributeName",
      render: (text: any, record: any) => <span>{record.attributeName}</span>,
    },
    {
      title: "Show as filter",
      dataIndex: "showAsFilter",
      key: "showAsFilter",
      width: 100,
      render: (text: any, record: any) => (
        <Switch
          checked={filterIds.includes(record.id)}
          onChange={(checked) => handleFilterSwitchChange(checked, record.id)}
        />
      ),
    },
    {
      title: "Show as Column",
      dataIndex: "showAsColumn",
      key: "showAsColumn",
      width: 100,
      render: (text: any, record: any) => (
        <Switch
          checked={columnIds.includes(record.id)}
          onChange={(checked) => handleColumnSwitchChange(checked, record.id)}
        />
      ),
    },
  ];

  const numericCalculations = (e: any, type: any) => {
    if (e.target.checked) {
      setNumericFunction((item: any) => {
        if (item) {
          return [...item, type];
        } else {
          return [type];
        }
      });
    } else {
      setNumericFunction(numericFunction.filter((item: any) => item !== type));
    }
  };
  // console.log("dataSource", dataSource);

  const menu = (
    <Menu
      style={{ padding: "10px", backgroundColor: "#F7F7FF", width: "450px" }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: "10px",
          borderRadius: "4px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: "8px",
          }}
        >
          <div style={{ display: "flex", gap: "8px" }}>
            <label
              style={{
                fontSize: "16px",
                color: "#003059",
                fontWeight: "bold",
              }}
            >
              CS Template:
            </label>
            <Select
              style={{ width: 250 }}
              onChange={(e: any, value: any) => {
                handleTemplateChange(e, value);
              }}
              placeholder="Select Form"
              showSearch
              optionFilterProp="children"
              // onSearch={onSearch}
              filterOption={filterOption}
              options={templateList}
              getPopupContainer={(triggerNode) => triggerNode.parentNode}
            />
          </div>
          <Tooltip title="Reset Button">
            <Button
              type="text"
              style={{
                border: "1px solid red",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={() => {
                setFilterIds([]);
                setColumnIds([]);
                setNumericFunction([]);
              }}
            >
              <MdCached style={{ color: "red" }} />
            </Button>
          </Tooltip>
        </div>

        <div style={{ paddingTop: "10px", borderTop: "1px dashed grey" }}>
          <Checkbox
            checked={numericFunction.includes("Summation")}
            onChange={(e) => numericCalculations(e, "Summation")}
          >
            Summation
          </Checkbox>
          <Checkbox
            checked={numericFunction.includes("Mean")}
            onChange={(e) => numericCalculations(e, "Mean")}
          >
            Mean
          </Checkbox>
          <Checkbox
            checked={numericFunction.includes("Deviation")}
            onChange={(e) => numericCalculations(e, "Deviation")}
          >
            Deviation
          </Checkbox>
          <Checkbox
            checked={numericFunction.includes("Yield")}
            onChange={(e) => numericCalculations(e, "Yield")}
          >
            Yield
          </Checkbox>
        </div>
        <div style={{ display: "flex", gap: "15px", paddingTop: "15px" }}>
          <Button
            // icon={<SnippetsOutlined />}
            onClick={() => {
              setButtonValue("formHeader");
            }}
            className={
              buttonValue === "formHeader"
                ? classes.buttonContainerActive
                : classes.buttonContainer
            }
          >
            FormHeaders
          </Button>
          <Button
            // icon={<SnippetsOutlined />}
            onClick={() => {
              setButtonValue("tableHeader");
            }}
            className={
              buttonValue === "tableHeader"
                ? classes.buttonContainerActive
                : classes.buttonContainer
            }
          >
            TableHeaders
          </Button>
        </div>
        <Divider style={{ margin: "0px 0px", color: "#00224E" }} />
        <div className={classes.tableContainer}>
          <Table
            dataSource={
              selectedId
                ? dataSource?.filter((ele: any) => ele?.type === buttonValue)
                : []
            }
            columns={columns}
            rowKey="attributeName"
            pagination={false}
            scroll={
              dataSource && dataSource.length > 0
                ? { x: "max-content", y: 250 }
                : undefined
            }
          />
        </div>
      </div>
    </Menu>
  );

  return (
    <div
      style={{
        display: "flex",
        padding: "0px 10px",
        height: "fit-content",
        justifyContent: "space-between",
      }}
    >
      <div style={{ width: "100%" }}>
        <DashboardFilters
        // filterIds={filterIds}
        // selectedId={selectedId}
        // numericFunction={numericFunction}
        // sheetValue={sheetValue}
        />
      </div>
      {/* <div>
        <Tooltip title="Filters">
          <Dropdown
            overlay={menu}
            trigger={["click"]}
            visible={menuVisible} // Control visibility
            onVisibleChange={(visible) => setMenuVisible(visible)}
          >
            <Button
              icon={<MdFilterList />}
              style={{ backgroundColor: "#2874A6", color: "#fff" }}
            ></Button>
          </Dropdown>
        </Tooltip>
      </div> */}
    </div>
  );
};

export default ChecksheetDashboard;
