import {
  Col,
  DatePickerProps,
  Form,
  Input,
  Row,
  Select,
} from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import TextArea from "antd/es/input/TextArea";
import axios from "../../../../../apis/axios.global";
import { IconButton, makeStyles, TextField } from "@material-ui/core";
import { MdClose } from 'react-icons/md';

type Props = {
  kraModal?: any;
  setKraModal?: any;
  setStatusNew?: any;
  setTargetDateNew?: any;
  setCommentsNew?: any;
  formData?: any;
  setFormData?: any;
  commentsNew?: any;
  setReferencesNew?: any;
  handleKraFormCreated?: any;
  selectedKPIs?: any;
  setSelectedKPIs?: any;
};

const useStyles = makeStyles((theme) => ({
  labelStyle: {
    "& .ant-input-lg": {
      border: "1px solid #dadada",
    },
    "& .ant-form-item .ant-form-item-label > label": {
      color: "#003566",
      fontWeight: "bold",
      letterSpacing: "0.8px",
      // Add any other styles you want to apply to the <label> element
    },
  },
}));

const KraModalForm = ({
  kraModal,
  setKraModal,
  setCommentsNew,
  setFormData,
  setStatusNew,
  setTargetDateNew,
  formData,
  commentsNew,
  setReferencesNew,
  handleKraFormCreated,
  selectedKPIs,
  setSelectedKPIs,
}: Props) => {
  const [kraForm] = Form.useForm();
  const [unitOptions, setUnitOptions] = useState([]);
  const [objectiveCategories, setObjectiveCategories] = useState([]);
  const [user, setUser] = useState<any[]>([]);
  const [initialCategories, setInitialCategories] = useState();
  const [objective, setObjectiveName] = useState<any>();
  const [kpis, setKpis] = useState([]);
  const [selectedKPI, setSelectedKPI] = useState<any>({});

  useEffect(() => {
    getAllKpis();
  }, []);
  useEffect(() => {
    console.log("formdata1", formData);
  }, []);
  useEffect(() => {
    if (handleKraFormCreated) {
      getAllUser();
      getUnitOptions();
      getObjectiveCategories();
      handleKraFormCreated(kraForm);
      getAllKpis();
      //setObjectiveName(kraModal?.data?.ObjectiveName);
    }
  }, []);
  console.log("kpis value", kpis);
  const getAllKpis = async () => {
    console.log("getallkpis called");
    try {
      const res = await axios.get(`api/kpi-definition/getAllKpi`);
      console.log("result in kpis", res?.data);
      if (res?.data) {
        setKpis(
          res?.data?.map((item: any) => ({
            ...item,
            value: item._id,
            label: item.kpiName,
          }))
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getUnitOptions = async () => {
    await axios(`/api/kpi-definition/getAllUom`)
      .then((res) => {
        const unitOptions = res.data.result.flatMap((obj: any) => {
          return obj.unitOfMeasurement.map((uom: any) => ({
            label: uom,
            value: uom,
          }));
        });
        setUnitOptions(unitOptions);
      })
      .catch((err) => console.error(err));
  };
  const getObjectiveCategories = async () => {
    await axios(`api/objective/AllObjectives`).then((res) => {
      setObjectiveCategories(
        res?.data?.result?.map((obj: any) => ({
          value: obj?._id,
          label: obj?.ObjectiveCategory,
        }))
      );
      const filteredCategories = res.data.result?.filter((obj: any) =>
        kraModal.data?.objectiveCategories?.includes(obj._id)
      );

      // Map the filtered objective categories to the format with value and label fields
      const mappedCategories = filteredCategories.map((obj: any) => ({
        value: obj._id,
        label: obj.ObjectiveCategory,
      }));
      setInitialCategories(mappedCategories);
    });
  };
  console.log("objectivename", objective);
  const getAllUser = async () => {
    await axios(`/api/objective/getAllUser`)
      .then((res) => {
        setUser(
          res.data.allUsers.map((obj: any) => ({
            id: obj.id,
            value: obj.username,
          }))
        );
      })
      .catch((err) => console.error(err));
  };
  const classes = useStyles();
  const statusList = [
    { label: "On Track", value: "OnTrack" },
    { label: "Off Track", value: "OffTrack" },
    { label: "At Risk", value: "AtRisk" },
  ];

  const target = [
    { label: "Increase", value: "Increase" },
    { label: "Decrease", value: "Decrease" },
    { label: "Maintain", value: "Maintain" },
  ];

  useEffect(() => {
    if (kraModal.mode === "edit") {
      console.log("in edit data", kraModal);
      setSelectedKPIs(kraModal?.data?.associatedKpis);
      kraForm.setFieldsValue({
        KraName: kraModal?.data?.KraName,

        Target: kraModal.data.Target,
        TargetType: kraModal.data.TargetType,
        UnitOfMeasure: kraModal.data.UnitOfMeasure,
        objective: kraModal?.data?.ObjectiveName,
        StartDate: kraModal.data.StartDate
          ? dayjs(kraModal.data.StartDate, "YYYY/MM/DD")
          : undefined,
        EndDate: kraModal.data.EndDate
          ? dayjs(kraModal.data.EndDate, "YYYY/MM/DD")
          : undefined,
        Status: kraModal.data.Status,
        Comments: kraModal.data.Comments,
        UserName: kraModal.data.UserName,
        KpiReportId: kraModal.data.KpiReportId,
        objectiveCategories: kraModal?.data?.objectiveCategories,
        description: kraModal?.data?.description,
        associatedKpis: kraModal?.data?.associatedKpis,
      });
      setSelectedKPIs(
        kraModal?.data?.associatedKpis
          ? kraModal?.data?.associatedKpis
          : selectedKPIs
      );
      // setReferences(kraModal.data.references);
    }
  }, [kraModal]);

  const onTargetDateChange: DatePickerProps["onChange"] = (
    date,
    dateString
  ) => {
    setTargetDateNew(dateString);
  };
  const handleAddClick = () => {
    if (selectedKPI?.kpiName !== "" && !!selectedKPI) {
      setSelectedKPIs((prevSelectedKPIs: any) => [
        ...prevSelectedKPIs,
        selectedKPI,
      ]);
      kraForm.setFieldsValue({ associatedKpis: selectedKPIs });
      // setFormData((prevData: any) => ({
      //   ...prevData,
      //   associatedKpis: [...prevSelectedKPIs, selectedKPI],
      // }));
      setSelectedKPI("");
    }
  };

  const handleRemoveClick = (id: any) => {
    const updatedKPIs = selectedKPIs.filter((kpi: any) => kpi._id !== id);
    setSelectedKPIs(updatedKPIs);

    kraForm.setFieldsValue({ associatedKpis: updatedKPIs });
  };
  console.log("formdata in kramodal", kraModal?.data);
  return (
    <Form
      layout="vertical"
      form={kraForm}
      initialValues={{
        status: true,

        // objectiveCategories: initialCategories,
      }}
      onValuesChange={(changedValues, allValues) => setFormData(allValues)}
      rootClassName={classes.labelStyle}
    >
      <div style={{ padding: "5px" }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Associated Objective:" name="objective">
              <Input
                size="large"
                defaultValue={kraModal?.data?.objective}
                disabled={true}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Objective Category:"
              // name="systemId"
              name="objectiveCategories"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Select
                aria-label="Select Category"
                placeholder="Select Category"
                options={objectiveCategories}
                size="large"
                // mode="multiple"
              ></Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="Goal: " name="KraName" required>
              <TextArea rows={2} placeholder="Enter Goal" size="large" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Target: " name="Target">
              <Input placeholder="Enter Target Value" size="large" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="UOM: " name="UnitOfMeasure">
              <Select
                aria-label="Select UOM"
                placeholder={"Select UOM"}
                options={unitOptions}
                size="large"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Goal Type: "
              required
              tooltip="This is a required field"
              name="TargetType"
            >
              <Select
                aria-label="Select Type"
                placeholder={"Select Type"}
                options={target}
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Associated KPIs:"
              name="associatedKpis"
              valuePropName="selectedKPIs"
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <Select
                  showSearch
                  placeholder="Select Kpi"
                  optionFilterProp="children"
                  filterOption={(input: any, option: any) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  // style={{ width: "100%" }}
                  size="large"
                  value={selectedKPI}
                  onChange={(e: any, value: any) => {
                    console.log("value in auto", formData);

                    setSelectedKPI({
                      _id: value?._id,
                      kpiName: value?.kpiName,
                    });

                    setSelectedKPIs((prevSelectedKPIs: any) => [
                      ...prevSelectedKPIs,
                      { _id: value?._id, kpiName: value?.kpiName },
                    ]);
                  }}
                  options={kpis || []}
                />
                {/* <IconButton onClick={handleAddClick}>
                  <MdAdd />
                </IconButton> */}
              </div>
            </Form.Item>
          </Col>
        </Row>
        {selectedKPIs?.map((kpi: any, index: any) => (
          <div key={index} style={{ marginTop: "8px" }}>
            <TextField
              label="Selected KPI"
              variant="outlined"
              value={kpi?.kpiName}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => handleRemoveClick(kpi?._id)}>
                    <MdClose />
                  </IconButton>
                ),
              }}
            />
          </div>
        ))}

        <Row gutter={16}></Row>
        {/* <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Start Date: " name="StartDate">
              <DatePicker
                format="YYYY/MM/DD"
                size="large"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="End Date: " name="EndDate">
              <DatePicker
                format="YYYY/MM/DD"
                size="large"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
        </Row> */}
        {/* <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="Description: " name="description">
              <TextArea
                rows={2}
                placeholder="Enter Goal Description"
                size="large"
              />
            </Form.Item>
          </Col>
        </Row> */}
        <Row gutter={16}>
          {/* <Col span={12}>
            <Form.Item label="Assignee: " name="UserName">
              <Select
                aria-label="Select Assignee"
                placeholder={"Select Assignee"}
                options={user}
                size="large"
              />
            </Form.Item>
          </Col> */}
          {/* <Col span={12}>
            <Form.Item label="Status: " name="Status">
              <Select
                aria-label="Select Status"
                placeholder={"Select Status"}
                options={statusList}
                size="large"
              />
            </Form.Item>
          </Col> */}
        </Row>
        {/* <Row>
          <Col span={24}>
            <Form.Item label="Comments: " name="Comments">
              <TextArea
                rows={4}
                placeholder="Enter KRA Comments"
                size="large"
              />
            </Form.Item>
          </Col>
        </Row> */}
      </div>
    </Form>
  );
};

export default KraModalForm;
