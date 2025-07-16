//react,reactrouter
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

//antd
import { Form, Input, Row, Col, Select } from "antd";

//components
import AutoComplete from "components/AutoComplete";

//antd constants
const { TextArea } = Input;

type Props = {
  addModalOpen?: any;
  setAddModalOpen?: any;
  fetchRisks?: any;
  fetchAspImps?: any;
  riskId?: any;
  formType?: string;
  formData?: any;
  setFormData?: any;
  activityNew?: any;
  setActivityNew?: any;
  setIdentityDateNew?: any;
  referencesNew?: any;
  setReferencesNew?: any;
  handleRiskFormCreated?: any;
  existingRiskConfig?: any;
  riskRegisterData?: any;
  preMitigation?: any;
  setPreMitigation?: any;
  preScore?: any;
  setPreScore?: any;
  locationWiseUsers?: any;

  scoreData?: any;
  setScoreData?: any;
  score?: any;
  setScore?: any;
  isPreOrPost?: any;
  setIsPreOrPost?: any;
};

const CreateRiskFormTab = ({
  addModalOpen,
  setAddModalOpen,
  fetchRisks,
  fetchAspImps,
  riskId,
  formType,
  formData,
  setFormData,
  activityNew,
  setActivityNew,
  setIdentityDateNew,
  referencesNew,
  setReferencesNew,
  handleRiskFormCreated,
  existingRiskConfig,
  riskRegisterData,
  preMitigation,
  setPreMitigation,
  preScore,
  setPreScore,
  locationWiseUsers,

  scoreData,
  setScoreData,
  score,
  setScore,
  isPreOrPost,
  setIsPreOrPost,
}: Props) => {
  const params = useParams<any>();
  const [conditionOptions, setConditionOptions] = useState<any>([]);
  const [riskTypeOptions, setRiskTypeOptions] = useState<any>([]);
  const [impactOptions, setImpactOptions] = useState<any>([]);

  const [firstForm] = Form.useForm();

  useEffect(() => {
    const conditionOptions = existingRiskConfig?.condition?.map(
      (config: any) => ({
        label: config.name,
        value: config._id,
      })
    );

    const riskTypeOptions = existingRiskConfig?.riskType?.map(
      (config: any) => ({
        label: config.name,
        value: config._id,
      })
    );
    const riskImpactOptions = existingRiskConfig?.impactType?.map(
      (config: any) => ({
        label: config.name,
        value: config._id,
      })
    );
    setConditionOptions(conditionOptions);
    setRiskTypeOptions(riskTypeOptions);
    setImpactOptions(riskImpactOptions);

    // console.log("checkrisk in create risk form", params);

    if (params.riskcategory === "HIRA") {
      if (!!riskId && formType === "edit") {
        // console.log("checkrisk condition matched for HIRA");

        setValuesInHiraForm();
      }
    }

    if (params.riskcategory === "AspImp") {
      if (!!riskId && formType === "edit") {
        setValuesInAspImpForm();
      }
    }
  }, [addModalOpen, formType]);

  useEffect(() => {
    if (handleRiskFormCreated) {
      handleRiskFormCreated(firstForm);
    }
  }, [firstForm, handleRiskFormCreated]);

  // useEffect(() => {
  //   console.log("checkrisk tab 1 form data in tab 1", formData);
  // }, [formData]);

  // useEffect(() => {
  //   console.log("checkrisk precore in create risk form", preScore);
  // }, [preScore]);

  const setValuesInHiraForm = async () => {
    try {
      // const res = await axios.get(`/api/riskregister/${riskId}`);

      console.log(
        "check in setValuesInHiraForm riskRegisterData",
        riskRegisterData
      );

      const risk = {
        jobTitle: riskRegisterData?.jobTitle,
        section: riskRegisterData?.section,
        area: riskRegisterData?.area,
        riskType: riskRegisterData?.riskType
          ? riskRegisterData.riskType?._id
          : undefined, // routine/non routine
        condition: riskRegisterData?.condition
          ? riskRegisterData.condition?._id
          : undefined, //associated hazard
        impactType: riskRegisterData?.impactType
          ? riskRegisterData.impactType._id
          : undefined, //impact
        jobBasicStep: riskRegisterData?.jobBasicStep,
        existingControl: riskRegisterData?.existingControl,
        assesmentTeam: riskRegisterData?.assesmentTeam,
        // activity: res.data.activity,/
        // description: res.data.description,
      };
      // setActivityNew(res.data.activity);

      console.log("check this userlocation", locationWiseUsers);

      firstForm.setFieldsValue({
        jobTitle: risk.jobTitle,
        area: risk.area,
        section: risk.section,
        riskType: risk.riskType,
        condition: risk.condition,
        impactType: risk.impactType,
        jobBasicStep: risk.jobBasicStep,
        existingControl: risk.existingControl,
        // description: res.data.description,
      });
      setFormData({
        ...formData,
        jobTitle: risk.jobTitle || "",
        area: risk.area || "",
        assesmentTeam: risk?.assesmentTeam || [],
        section: risk.section,
        riskType: risk.riskType,
        condition: risk.condition,
        impactType: risk.impactType,
        jobBasicStep: risk.jobBasicStep,
        existingControl: risk.existingControl,
        // description: res.data.description || "",
      });
    } catch (error) {
      console.log("error", error);
    }
  };

  const setValuesInAspImpForm = async () => {
    try {
      const aspImpData = {
        jobTitle: riskRegisterData?.jobTitle,
        section: riskRegisterData?.section,
        activity: riskRegisterData?.activity,

        riskType: riskRegisterData?.riskType
          ? riskRegisterData.riskType?._id
          : undefined, // Aspect Type
        specificEnvAspect: riskRegisterData?.specificEnvAspect,

        impactType: riskRegisterData?.impactType
          ? riskRegisterData.impactType._id
          : undefined, //Enviromental Impact Type
        specificEnvImpact: riskRegisterData?.specificEnvImpact,

        condition: riskRegisterData?.condition
          ? riskRegisterData.condition?._id
          : undefined, //associated hazard
        assesmentTeam: riskRegisterData?.assesmentTeam,

        existingControl: riskRegisterData?.existingControl,
      };

      firstForm.setFieldsValue({
        jobTitle: aspImpData.jobTitle,
        section: aspImpData.section,
        activity: aspImpData.activity,

        riskType: aspImpData.riskType,
        specificEnvAspect: aspImpData.specificEnvAspect,

        impactType: aspImpData.impactType,
        specificEnvImpact: aspImpData.specificEnvImpact,

        condition: aspImpData.condition,
        assesmentTeam: aspImpData.assesmentTeam,

        existingControl: aspImpData.existingControl,
        // description: res.data.description,
      });
      setFormData({
        ...formData,
        jobTitle: aspImpData.jobTitle || "",
        activity: aspImpData.activity || "",
        assesmentTeam: aspImpData?.assesmentTeam || [],
        section: aspImpData.section,
        riskType: aspImpData.riskType,
        condition: aspImpData.condition,
        impactType: aspImpData.impactType,
        existingControl: aspImpData.existingControl,
        specificEnvAspect: aspImpData.specificEnvAspect,
        specificEnvImpact: aspImpData.specificEnvImpact,
        // description: res.data.description || "",
      });
    } catch (error) {
      console.log("error", error);
    }
  };

  return (
    <>
      {params.riskcategory === "HIRA" ? (
        <>
          <Form
            form={firstForm}
            layout="vertical"
            initialValues={{
              jobTitle: formData?.jobTitle || "",
            }}
            onValuesChange={(changedValues, allValues) => {
              // console.log("checkrisk changed values", changedValues);
              // console.log("checkrisk all values", allValues);
              setFormData({ ...formData, ...changedValues });
            }}
          >
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Form.Item
                  label="Job Title: "
                  name="jobTitle"
                  rules={[
                    { required: true, message: "Please Input Your Job Title!" },
                  ]}
                >
                  <Input
                    // value={formData?.jobTitle || ""}
                    placeholder="Enter Job Title"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Form.Item label="Basic Step of the Job: " name="jobBasicStep">
                  <Input
                    placeholder="Enter Basic Step of the Job"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item label="Area: " name="area">
                  <Input placeholder="Enter Area" size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Section: " name="section">
                  <Input placeholder="Enter Section" size="large" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item label="Routine/Non Routine: " name="riskType">
                  <Select
                    placeholder="Select Routine/Non Routine"
                    options={riskTypeOptions}
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Associated Hazard: " name="condition">
                  <Select
                    placeholder="Select Associated Hazard"
                    options={conditionOptions}
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item label="Impact: " name="impactType">
                  <Select
                    placeholder="Select Impact"
                    options={impactOptions}
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Assesment Team: " name="assesmentTeam">
                  <AutoComplete
                    suggestionList={locationWiseUsers ? locationWiseUsers : []}
                    name=""
                    keyName="assesmentTeam"
                    formData={formData}
                    disabled={false}
                    labelKey="label"
                    setFormData={setFormData}
                    multiple={true}
                    getSuggestionList={() => {}}
                    defaultValue={
                      formData?.assesmentTeam?.length
                        ? formData.assesmentTeam
                        : []
                    }
                    type="RA"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Form.Item label="Exisitng Control: " name="existingControl">
                  <TextArea
                    rows={4}
                    placeholder="Enter Exisitng Control"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </>
      ) : (
        <>
          <Form
            form={firstForm}
            layout="vertical"
            initialValues={{
              jobTitle: formData?.jobTitle || "",
            }}
            onValuesChange={(changedValues, allValues) => {
              // console.log("checkrisk changed values", changedValues);
              // console.log("checkrisk all values", allValues);
              setFormData({ ...formData, ...changedValues });
            }}
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  label="Job Title: "
                  name="jobTitle"
                  rules={[
                    { required: true, message: "Please Input Your Job Title!" },
                  ]}
                >
                  <Input
                    // value={formData?.jobTitle || ""}
                    placeholder="Enter Job Title"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Section: " name="section">
                  <Input placeholder="Enter Section" size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Form.Item label="Activity: " name="activity">
                  <Input placeholder="Enter Activity" size="large" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Form.Item label="Aspect Type: " name="riskType">
                  <Select
                    placeholder="Select Aspect Type"
                    options={riskTypeOptions}
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Form.Item
                  label="Specific Environmental Aspect: "
                  name="specificEnvAspect"
                >
                  <Input
                    placeholder="Enter Specific Environmental Aspect"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Form.Item
                  label="Environmental Impact Type: "
                  name="impactType"
                >
                  <Select
                    placeholder="Select Environmental Impact Type"
                    options={impactOptions}
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Form.Item
                  label="Specific Environmental Impact: "
                  name="specificEnvImpact"
                >
                  <Input
                    placeholder="Enter Specific Environmental Impact"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item label="Condition: " name="condition">
                  <Select
                    placeholder="Select condition"
                    options={conditionOptions}
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Assesment Team: " name="assesmentTeam">
                  <AutoComplete
                    suggestionList={locationWiseUsers ? locationWiseUsers : []}
                    name=""
                    keyName="assesmentTeam"
                    formData={formData}
                    disabled={false}
                    labelKey="label"
                    setFormData={setFormData}
                    multiple={true}
                    getSuggestionList={() => {}}
                    defaultValue={
                      formData?.assesmentTeam?.length
                        ? formData.assesmentTeam
                        : []
                    }
                    type="RA"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Form.Item label="Exisitng Control: " name="existingControl">
                  <TextArea
                    rows={4}
                    placeholder="Enter Exisitng Control"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </>
      )}
    </>
  );
};

export default CreateRiskFormTab;
