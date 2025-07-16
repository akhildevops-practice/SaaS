import { useEffect, useState } from "react";
import {
  Table,
  Input,
  Button,
  Select,
  Col,
  Row,
  InputNumber,
  Form,
  notification,
  Switch,
  Checkbox,
} from "antd";
import { AiOutlineCloseCircle } from "react-icons/ai";
import useStyles from "./style";
import axios from "apis/axios.global";
import { Pagination, PaginationProps } from "antd";
import { InputAdornment, TextField, Tooltip } from "@material-ui/core";
import { MdSearch } from 'react-icons/md';
const { Option } = Select;

type Props = {
  deptId?: any;
  unitId?: any;
};

const MonitoringRules = ({ deptId, unitId }: Props) => {
  const loggedInUser = JSON.parse(sessionStorage.getItem("userDetails") as any);
  const createdBy = loggedInUser?.id;
  const organizationId = loggedInUser?.organizationId;
  const classes = useStyles();
  const [uomOptions, setUomOptions] = useState<any[]>(["percentage"]);
  const [submittedData, setSubmittedData] = useState<any>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<any[]>([]);
  const [deleteRowIds, setDeleteRowIds] = useState<any>();
  const [form] = Form.useForm();
  const [deviationType, setDeviationType] = useState<string>();
  const [data, setData] = useState<any[]>([]);
  const [searchData, setSearchData] = useState();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const showTotal: PaginationProps["showTotal"] = (total) =>
    `Total ${total} items`;
  const [count, setCount] = useState<number>();
  const [modalCount, setModalCount] = useState<number>();
  const [formData, setFormData] = useState<any>({});
  const [isToggled, setIsToggled] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [seletedUoms, setSelectedUoms] = useState<any[]>([]);
  const [forAllData, setForAllData] = useState<any[]>([]);
  const [isChecked, setIsChecked] = useState(false);
  const [getData, setGetData] = useState<any>();
  console.log("getData", getData);

  useEffect(() => {
    const checkIfAllSame = (arr: any[]) => {
      return arr.every((val) => val === arr[0]);
    };

    if (seletedUoms.length > 0 && checkIfAllSame(seletedUoms)) {
      const commonValue = seletedUoms[0];
      setUomOptions(["percentage", commonValue]);
    } else {
      setUomOptions(["percentage"]);
    }
  }, [seletedUoms]);

  useEffect(() => {
    form.setFieldsValue({
      occurrences: selectedRowKeys.length ? 1 : undefined,
    });
  }, [selectedRowKeys, form]);

  useEffect(() => {
    getTableData();
  }, [unitId, deptId, searchText, isToggled]);

  const getTableData = async (page: number = 1, pageSize: number = 10) => {
    const result = await axios.get(
      `/api/kpi-definition/getKpiByLocDept?locationId=${unitId}&entityId=${deptId}&page=${page}&pageSize=${pageSize}&searchText=${
        searchText ? searchText : ""
      }&filter=${isToggled}`
    );

    console.log("result99999", result);

    const formattedData = result?.data?.data?.map(
      (item: any, index: number) => ({
        key: item?._id,
        title: item?.kpiName,
        uom: item?.uom,
        category: item?.categoryId.ObjectiveCategory,
        objective: item?.objectiveId,
        frequency: item?.frequency,
        deviationtype: item?.kpiRules?.deviationType,
        minValue: item?.kpiRules?.valueFrom,
        maxValue: item?.kpiRules?.valueToMonitor,
        selecteduom: item?.kpiRules?.uom,
        occurrences: item?.kpiRules?.deviationOccurencesToAllow,
      })
    );

    setData(formattedData);
    setCount(result?.data?.count);

    const res = await axios.get(
      `/api/kpi-definition/getKpiByLocDept?locationId=${unitId}&entityId=${deptId}`
    );

    const formattedDataForAll = res?.data?.data?.map(
      (item: any, index: number) => ({
        key: item?._id,
        title: item?.kpiName,
        uom: item?.uom,
        category: item?.categoryId?.ObjectiveCategory,
        objective: item?.objectiveId,
        frequency: item?.frequency,
        deviationtype: item?.kpiRules?.deviationType,
        minValue: item?.kpiRules?.valueFrom,
        maxValue: item?.kpiRules?.valueToMonitor,
        selecteduom: item?.kpiRules?.uom,
        occurrences: item?.kpiRules?.deviationOccurencesToAllow,
      })
    );
    setForAllData(formattedDataForAll);
  };

  useEffect(() => {
    handleRowSelectionChange(selectedRowKeys);
  }, [isChecked, selectedRowKeys]);

  const handleRowSelectionChange = (selectedKeys: any) => {
    if (isChecked === false) {
      setSelectedRowKeys(selectedKeys);

      const selectedRows = data?.filter((row) =>
        selectedKeys?.includes(row?.key)
      );
      const selectedRowIds = selectedRows?.map((row) => row?.key);
      setSelectedIds(selectedRowIds);

      const selected = selectedRows?.map((row) => row?.uom);
      setSelectedUoms(selected);
    } else {
      const allRowIds = forAllData?.map((item) => item?.key);
      console.log("allRowIds", allRowIds);
      setSelectedIds(allRowIds);

      const selected2 = forAllData?.map((row) => row?.uom);
      setSelectedUoms(selected2);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        deviationType: values?.deviationType,
        valueToMonitor: values?.maxvalue,
        valueFrom: values?.deviationType === "Fixed" ? null : values?.minvalue,
        uom: values?.uom,
        deviationOccurencesToAllow: values?.occurrences,
        createdBy: createdBy,
        organizationId: organizationId,
      };

      await axios.post(
        `/api/kpi-definition/createMonitoringRulesForKpi?kpiIds=${selectedIds.join(
          ","
        )}`,
        payload
      );

      notification.success({
        message: "Success",
        description: "Configuration data submitted successfully",
      });

      setFormData(payload);
      getTableData();
      setSelectedIds([]);
      setSelectedUoms([]);
      setSelectedRowKeys([]);
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Error in submitting configuration data",
      });
      console.error("Error in submitting configuration data:", error);
    }
  };

  useEffect(() => {
    if (selectedIds?.length > 0) {
      getMonitoringData();
    }
  }, [selectedIds]);

  const getMonitoringData = async () => {
    const result = await axios.get(
      `api/kpi-definition/getMonitoringRulesForKpi/${selectedIds.join(",")}`
    );

    const monitoringData = result?.data;

    form.setFieldsValue({
      deviationType: monitoringData?.deviationType,
      maxvalue: monitoringData?.valueToMonitor,
      minvalue: monitoringData?.valueFrom,
      uom: monitoringData?.uom,
      occurrences: monitoringData?.deviationOccurencesToAllow,
    });
    setGetData(result?.data?.deviationType);
    setDeviationType(monitoringData?.deviationType);
  };

  const handleDelete = (record: any) => {
    setDeleteRowIds(() => [record.key]);

    if (isToggled === false) {
      axios
        .delete(`/api/kpi-definition/deleteMonitoringRulesForKpi/${record.key}`)
        .then(() => {
          notification.success({
            message: "Success",
            description: "KPI deleted successfully",
          });
          getTableData();
        })
        .catch((error) => {
          notification.error({
            message: "Error",
            description: "Error in deleting KPI",
          });
          console.error("Error in deleting KPI:", error);
        });
      setIsToggled(false);
      // getTableData();
    }
  };

  const onFinish = (values: any) => {};

  const handleValuesChange = (changedValues: any) => {
    if (changedValues.deviationType) {
      setDeviationType(changedValues.deviationType);
      if (changedValues.deviationType === "Range") {
        form.setFieldsValue({ value: [undefined, undefined], uom: undefined });
      } else if (changedValues.deviationType === "Target") {
        form.setFieldsValue({ value: undefined, uom: undefined });
      } else {
        form.setFieldsValue({ value: undefined, uom: undefined });
      }
    }
  };

  const handleChangePage = (pageNumber: any, pageSize: any = rowsPerPage) => {
    setPage(pageNumber);
    setRowsPerPage(pageSize);
    getTableData(pageNumber, pageSize);
  };

  const handleToggle = (checked: boolean) => {
    setIsToggled(checked);
    // getTableData();
  };

  const handleCheckboxChange = (e: any) => {
    setIsChecked(e.target.checked);
    setSelectedIds([]);
  };

  const columns = [
    { title: "KPI Title", dataIndex: "title" },
    { title: "UoM", dataIndex: "uom" },
    // { title: "Category", dataIndex: "category" },
    // { title: "Objective Title", dataIndex: "objective" },
    { title: "Report Frequency", dataIndex: "frequency" },

    { title: "Deviation Type", dataIndex: "deviationtype" },

    {
      title: "Min Value",
      dataIndex: "minValue",
      className: classes.tablecolumn,
    },
    {
      title: "Max Value",
      dataIndex: "maxValue",
      className: classes.tablecolumn,
    },

    { title: "Selected UOM", dataIndex: "selecteduom" },
    {
      title: "Occurrences",
      dataIndex: "occurrences",
      className: classes.tablecolumn,
    },

    {
      title: "Actions",
      dataIndex: "actions",
      render: (_: any, record: any) => (
        <div style={{ textAlign: "center" }}>
          <Tooltip title={"Remove Rules"}>
            <Button
              type="text"
              icon={<AiOutlineCloseCircle />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: " 0px 20px 20px 20px " }}>
      <Button
        htmlType="submit"
        onClick={() => handleSubmit()}
        disabled={!selectedIds.length}
        style={{
          position: "absolute",
          top: "12px",
          right: "40px",
          backgroundColor: "#003059",
          color: "white",
          fontWeight: "bold",
        }}
      >
        Submit
      </Button>

      <div>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onValuesChange={handleValuesChange}
          style={{ width: "100%", margin: "0px 10px 0px 10px" }}
          className={classes.form}
          initialValues={{ occurrences: 1 }}
        >
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                label="Deviation Type"
                name="deviationType"
                style={{ color: "#00224E" }}
              >
                <Select
                  placeholder="Select Trigger Type"
                  disabled={!selectedIds.length}
                >
                  <Option value="Range">Range</Option>
                  <Option value="Fixed">Fixed</Option>
                  <Option value="Target">Target</Option>
                </Select>
              </Form.Item>
            </Col>

            {/* <Col span={6}>
            {deviationType === "Range" || getData === "Range" ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "10px",
                  }}
                >
                  <Form.Item label="Value" name="minvalue">
                    <Input
                      placeholder="Min Value"
                      disabled={!selectedIds.length}
                      onChange={(e: any) => e.target.value}
                    />
                  </Form.Item>
                  <Form.Item label=" " name="maxvalue">
                    <Input
                      placeholder="Max Value"
                      disabled={!selectedIds.length}
                      onChange={(e: any) => e.target.value}
                    />
                  </Form.Item>
                </div>
              ) : (
                <Form.Item label="Value" name="maxvalue">
                  <Input
                    placeholder="Value"
                    disabled={deviationType === "Target" || !selectedIds.length}
                  />
                </Form.Item>
              )}
            </Col> */}
            <Col span={6}>
              {getData === "Range" ? (
                deviationType === "Range" && getData === "Range" ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "10px",
                    }}
                  >
                    <Form.Item label="Value" name="minvalue">
                      <Input
                        placeholder="Min Value"
                        disabled={!selectedIds.length}
                        onChange={(e: any) => e.target.value}
                      />
                    </Form.Item>
                    <Form.Item label=" " name="maxvalue">
                      <Input
                        placeholder="Max Value"
                        disabled={!selectedIds.length}
                        onChange={(e: any) => e.target.value}
                      />
                    </Form.Item>
                  </div>
                ) : (
                  <Form.Item label="Value" name="maxvalue">
                    <Input
                      placeholder="Value"
                      disabled={
                        deviationType === "Target" || !selectedIds.length
                      }
                    />
                  </Form.Item>
                )
              ) : deviationType === "Range" || getData === "Range" ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "10px",
                  }}
                >
                  <Form.Item label="Value" name="minvalue">
                    <Input
                      placeholder="Min Value"
                      disabled={!selectedIds.length}
                      onChange={(e: any) => e.target.value}
                    />
                  </Form.Item>
                  <Form.Item label=" " name="maxvalue">
                    <Input
                      placeholder="Max Value"
                      disabled={!selectedIds.length}
                      onChange={(e: any) => e.target.value}
                    />
                  </Form.Item>
                </div>
              ) : (
                <Form.Item label="Value" name="maxvalue">
                  <Input
                    placeholder="Value"
                    disabled={deviationType === "Target" || !selectedIds.length}
                  />
                </Form.Item>
              )}
            </Col>

            <Col span={6}>
              <Form.Item label="UOM" name="uom">
                <Select
                  placeholder="Select UOM"
                  disabled={deviationType === "Target" || !selectedIds.length}
                >
                  {uomOptions.map((uom, index) => (
                    <Option key={index} value={uom}>
                      {uom}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label="# of Occurrences for the Trigger"
                name="occurrences"
              >
                <InputNumber
                  min={1}
                  style={{ width: "100%" }}
                  disabled={!selectedIds.length}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          paddingBottom: "20px",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: "20px" }}>
          <div>
            <span
              style={{
                marginRight: "10px",
                color: "#00224E",
                fontWeight: "bold",
                fontSize: "12px",
              }}
            >
              KPI's with Rules
            </span>
            <Switch checked={isToggled} onChange={handleToggle} />
            <span
              style={{
                marginLeft: "10px",
                color: "#00224E",
                fontWeight: "bold",
                fontSize: "12px",
              }}
            >
              KPI's without Rules
            </span>
          </div>
          <div style={{ marginLeft: "10px" }}>
            <Checkbox
              checked={isChecked}
              onChange={handleCheckboxChange}
              style={{
                marginLeft: "10px",
                color: "#00224E",
                fontWeight: "bold",
                fontSize: "13px",
              }}
            >
              Select All KPI's
            </Checkbox>
          </div>
        </div>
        <TextField
          fullWidth
          name="search"
          value={searchText ?? ""}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 400 }}
          placeholder="Search By Kpi Title"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <MdSearch />
              </InputAdornment>
            ),
          }}
        />
      </div>
      <div className={classes.tableContainer}>
        <Table
          rowSelection={{
            type: "checkbox",
            selectedRowKeys,
            onChange: handleRowSelectionChange,
            getCheckboxProps: () => ({
              disabled: isChecked === true, // Disable checkbox when isChecked is true
            }),
          }}
          columns={columns}
          dataSource={data}
          pagination={false}
          className={classes.documentTable}
        />
      </div>

      <div className={classes.pagination}>
        <Pagination
          size="small"
          current={page}
          pageSize={rowsPerPage}
          total={count}
          showTotal={showTotal}
          showSizeChanger
          showQuickJumper
          onChange={(page, pageSize) => {
            handleChangePage(page, pageSize);
            // getTableData();
          }}
        />
      </div>
    </div>
  );
};

export default MonitoringRules;
