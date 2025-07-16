//react, react-router, recoil
import { useEffect, useState, useRef } from "react";
import { processDocFormData } from "recoil/atom";
import { useRecoilState } from "recoil";

//material-ui
import { makeStyles } from "@material-ui/core";

//antd

import { Col, Form, Row, Select } from "antd";

//utils
import axios from "apis/axios.global";

//components
import AutoComplete from "components/AutoComplete";

type Props = {
  drawer?: any;
  setDrawer?: any;
  handleDocFormCreated?: any;
  workFlowForm?: any;
  setWorkFlowForm?: any;
  handleWorkFlowFormCreated?: any;
  // isWorkflowValid?: any;
  // setIsWorkflowValid?: any;
  disableFormFields?: any;
  selectedReviewerFormData: any;
  setSelectedReviewerFormData: any;
  selectedApproverFormData: any;
  setSelectedApproverFormData: any;
  isEdit?: any;
};

const { Option } = Select;

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

interface Distrubution {
  id: string;
  name: string;
}
interface ReadAccess {
  id: string;
  name: string;
}
const WorkFlowTab = ({
  drawer,
  setDrawer,
  handleDocFormCreated,
  workFlowForm,
  setWorkFlowForm,
  handleWorkFlowFormCreated,
  // isWorkflowValid,
  // setIsWorkflowValid,
  disableFormFields,
  selectedReviewerFormData,
  setSelectedReviewerFormData,
  selectedApproverFormData,
  setSelectedApproverFormData,
  isEdit,
}: Props) => {
  const [formData, setFormData] = useRecoilState(processDocFormData);
  const [suggestions, setSuggestions] = useState<any>([]);
  const [reviewerOptions, setReviewerOptions] = useState<any>([]);
  const [fetchingReviewer, setFetchingReviewer] = useState<any>(false);
  const [distributionOption, setDistributionOptions] = useState<Distrubution[]>(
    []
  );
  const [readAccessOption, setReadAccessOptions] = useState<ReadAccess[]>([]);
  const [locationOption, setLocationOption] = useState([]);
  const [selectedReviewer, setSelectedReviewer] = useState<any>();
  const [distValue, setDistValue] = useState(false);
  const [approverOptions, setApproverOptions] = useState<any>([]);
  const [fetchingApprover, setFetchingApprover] = useState<any>(false);
  const [selectedApprover, setSelectedApprover] = useState<any>();
  const [readValue, setReadValue] = useState(false);
  const [userOptions, setUserOptions] = useState([]);
  const [entityOption, setEntityOption] = useState([]);
  const [workflowForm] = Form.useForm();
  const isInitialRender = useRef(true);
  const readRender = useRef(true);
  const classes = useStyles();
  const userDetails = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  useEffect(() => {
    getLocationOptions();
    getUserOptions();
    fetchingReviewerList();
    fetchApproverList();
    getDepartmentOptions();
  }, []);
  useEffect(() => {
    if (handleWorkFlowFormCreated) {
      handleWorkFlowFormCreated(workflowForm);
    }
  }, [workflowForm, handleWorkFlowFormCreated]);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    if (formData.distributionList === "All Users") {
      setDistributionOptions([{ id: "All Users", name: "All Users" }]);
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        distributionUsers: [{ id: "All Users", name: "All Users" }], // Reset to an empty array
      }));
      setDistValue(true);
    } else if (formData.distributionList === "All in Units(S)") {
      setDistributionOptions(locationOption);
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        distributionUsers: [], // Reset to an empty array
      }));
      setDistValue(false);
    } else if (formData.distributionList === "Respective Unit") {
      const locationFilterData = locationOption.filter(
        (value: any) => value.id === userDetails.locationId
      );
      setDistributionOptions(locationOption);
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        distributionUsers: locationFilterData, // Reset to an empty array
      }));
      setDistValue(false);
    } else if (formData.distributionList === "Respective Department") {
      const entityFilterData = entityOption.filter(
        (value: any) => value.id === userDetails.entityId
      );
      setDistributionOptions(entityOption);
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        distributionUsers: entityFilterData, // Reset to an empty array
      }));
      setDistValue(false);
    } else if (formData.distributionList === "Selected Users") {
      setDistributionOptions(userOptions);
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        distributionUsers: [], // Reset to an empty array
      }));
      setDistValue(false);
    } else {
      setDistributionOptions(entityOption);
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        distributionUsers: [], // Reset to an empty array
      }));
      setDistValue(false);
    }
  }, [formData.distributionList]);
  useEffect(() => {
    if (readRender.current) {
      readRender.current = false;
      return;
    }
    if (formData.readAccess === "All Users") {
      setReadAccessOptions([{ id: "All Users", name: "All Users" }]);
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        readAccessUsers: [{ id: "All Users", name: "All Users" }], // Reset to an empty array
      }));
      setReadValue(true);
    } else if (formData.readAccess === "All in Units(S)") {
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        readAccessUsers: [],
      }));
      setReadValue(false);
      setReadAccessOptions(locationOption);
    } else if (formData.readAccess === "Selected Users") {
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        readAccessUsers: [],
      }));
      setReadValue(false);
      setReadAccessOptions(userOptions);
    } else {
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        readAccessUsers: [],
      }));
      setReadValue(false);
      setReadAccessOptions(entityOption);
    }
  }, [formData.readAccess]);

  useEffect(() => {
    if (!isEdit) {
      if (formData.distributionList === "Respective Unit") {
        const locationFilterData = [
          {
            id: userDetails.locationId,
            name: userDetails.location.locationName,
          },
        ];
        setDistributionOptions(locationOption);
        setFormData((prevFormData: any) => ({
          ...prevFormData,
          distributionUsers: locationFilterData, // Reset to an empty array
        }));
        setDistValue(false);
      } else if (formData.distributionList === "Respective Department") {
        const entityFilterData = [
          { id: userDetails.entityId, name: userDetails.entity.entityName },
        ];
        setDistributionOptions(entityOption);
        setFormData((prevFormData: any) => ({
          ...prevFormData,
          distributionUsers: entityFilterData, // Reset to an empty array
        }));
        setDistValue(false);
      }
    }
  }, []);
  const getLocationOptions = async () => {
    await axios("/api/kpi-definition/getAllLocations")
      .then((res) => {
        const ops = res.data.map((obj: any) => ({
          id: obj.id,
          name: obj.locationName,
        }));
        setLocationOption(ops);
      })
      .catch((err) => console.error(err));
  };

  const getUserOptions = async () => {
    await axios(`/api/kpi-report/getAllUsers`)
      .then((res) => {
        const ops = res.data.map((obj: any) => ({
          id: obj.id,
          name: obj.username,
          avatar: obj.avatar,
        }));
        setUserOptions(ops);
      })
      .catch((err) => console.error(err));
  };

  const getDepartmentOptions = async () => {
    await axios(`/api/entity`)
      .then((res) => {
        const ops = res.data.map((obj: any) => ({
          id: obj?.id,
          name: obj?.entityName,
        }));
        setEntityOption(ops);
      })
      .catch((err) => console.error(err));
  };
  const distributeAccess = [
    "None",
    "All Users",
    "All in Units(S)",
    "All in Department(S)",
    "Selected Users",
    "Respective Department",
    "Respective Unit",
  ];
  const readAccess = [
    "All Users",
    "All in Units(S)",
    "All in Department(S)",
    "Selected Users",
  ];
  const getObjectById = (arr: any, id: any) => {
    return arr.find((item: any) => item.userId === id);
  };

  const fetchingReviewerList = async () => {
    try {
      setFetchingReviewer(true);
      // const encodedValue = encodeURIComponent(value);
      const res = await axios.get(`/api/roles/workFlowDistributionReviewer`);
      // console.log("fetch reviwer list", res);

      if (!!res.data && res.data.length > 0) {
        const userOptions = res.data.map((user: any) => ({
          userId: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          value: user.id,
          label: user.email,
          email: user.email,
          id: user.id,
          fullname: user.firstname + " " + user.lastname,
          avatar: user.avatar,
        }));
        setFetchingReviewer(false);
        setReviewerOptions(userOptions);
        return userOptions;
      } else {
        setFetchingReviewer(false);
        setReviewerOptions([]);
      }
    } catch (error) {
      setFetchingReviewer(false);
      console.log(error);
    }
  };

  const fetchApproverList = async () => {
    try {
      setFetchingApprover(true);
      // const encodedValue = encodeURIComponent(value);
      const res = await axios.get(`/api/roles/workFlowDistributionApprover`);

      if (!!res.data && res.data.length > 0) {
        const userOptions = res.data.map((user: any) => ({
          userId: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          value: user.id,
          label: user.email,
          email: user.email,
          id: user.id,
          fullname: user.firstname + " " + user.lastname,
          avatar: user.avatar,
        }));
        setFetchingApprover(false);
        setApproverOptions(userOptions);
        return userOptions;
      } else {
        setFetchingApprover(false);
        setApproverOptions([]);
      }
    } catch (error) {
      setFetchingApprover(false);
      console.log(error);
    }
  };

  // const debouncedFetchReviewer = debounce(async (value: any) => {
  //   const newOptions = await fetchingReviewerList(value);
  //   setReviewerOptions(!!newOptions && newOptions);
  // }, 500);

  // const debouncedFetchApprover = debounce(async (value: any) => {
  //   const newOptions = await fetchApproverList(value);
  //   setApproverOptions(!!newOptions && newOptions);
  // }, 500);

  // const handleReviewerSearchChange = async (value: any) => {
  //   debouncedFetchReviewer(value);
  // };

  // const handleApproverSearchChange = async (value: any) => {
  //   debouncedFetchApprover(value);
  // };
  const handleApproverSelect = (value: any, option: any) => {
    const selectedOption = {
      label: option.label,
      value: option.value,
    };
    const selectedObject = getObjectById(approverOptions, selectedOption.value);
    setFormData({
      ...formData,
      ["approvers"]: option,
    });
    // setSelectedApproverFormData([{ ...selectedObject }]);
  };

  const handleDistributionList = (value: string) => {
    setFormData((prevFormData: any) => ({
      ...prevFormData,
      distributionList: value,
      distributionUsers: [],
    }));
  };
  const handleReadAccess = (value: string) => {
    setFormData((prevFormData: any) => ({
      ...prevFormData,
      readAccess: value,
      readAccessUsers: [],
    }));
  };

  const handleDistributionUser = (value: any, option: any) => {};

  const getOptionSelected = (option: any, selectedValues: any) => {
    return selectedValues?.indexOf(option?.id) !== -1;
  };

  const customFilterOption = (input: any, option: any) => {
    // Log the input and option values

    const optionValue = option.props.value.toString(); // Convert the option value to a string
    return optionValue.includes(input);
  };

  return (
    <Form
      form={workflowForm}
      layout="vertical"
      // onValuesChange={(changedValues, allValues) => setDocFormData(allValues)}
      initialValues={{
        reviewers: formData?.reviewers,
        approvers: formData?.approvers,
      }}
      rootClassName={classes.labelStyle}
      // disabled={disableFormFields}
      // style={{ display: hidden ? "none" : "block" }} // Add this line
    >
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Form.Item
            label="Reviewer: "
            name="reviewers"
            rules={[
              {
                required: true,
                message: "Please Select Reviewer!",
              },
            ]}
          >
            <AutoComplete
              suggestionList={reviewerOptions ? reviewerOptions : []}
              name=""
              keyName="reviewers"
              formData={formData}
              disabled={false}
              labelKey="label"
              setFormData={setFormData}
              multiple={true}
              getSuggestionList={() => {}}
              defaultValue={
                formData?.reviewers?.length ? formData.reviewers : []
              }
              type="RA"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Approver: "
            name="approvers"
            rules={[
              {
                required: true,
                message: "Please Select Approver!",
              },
            ]}
          >
            <AutoComplete
              suggestionList={approverOptions ? approverOptions : []}
              name=""
              keyName="approvers"
              formData={formData}
              disabled={false}
              labelKey="label"
              setFormData={setFormData}
              multiple={true}
              getSuggestionList={() => {}}
              defaultValue={
                formData?.approvers?.length ? formData.approvers : []
              }
              type="RA"
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Form.Item label="Distribution List: ">
            <Select
              showSearch
              placeholder="Search and Select Distribution List"
              onSelect={handleDistributionList}
              defaultValue={formData.distributionList}
              value={formData.distributionList}
              size="large"
            >
              {distributeAccess.map((option) => (
                <Option key={option} value={option} label={option}>
                  {option}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        {formData.distributionList !== "None" && (
          <Col span={12}>
            <Form.Item
              label="Distribution Users: "
              name="distributionUsers"
              rules={[
                {
                  required: false,
                  message: "Please Select distributionUsers!",
                },
              ]}
            >
              {formData.distributionList === "All in Units(S)" && (
                <AutoComplete
                  suggestionList={locationOption ? locationOption : []}
                  name=""
                  keyName="distributionUsers"
                  formData={formData}
                  disabled={false}
                  labelKey="name"
                  setFormData={setFormData}
                  multiple={true}
                  getSuggestionList={() => {}}
                  defaultValue={
                    formData?.distributionUsers?.length
                      ? formData.distributionUsers
                      : []
                  }
                  type="RA"
                />
              )}
              {formData.distributionList === "Selected Users" && (
                <AutoComplete
                  suggestionList={userOptions ? userOptions : []}
                  name=""
                  keyName="distributionUsers"
                  formData={formData}
                  disabled={false}
                  labelKey="name"
                  setFormData={setFormData}
                  multiple={true}
                  getSuggestionList={() => {}}
                  defaultValue={
                    formData?.distributionUsers?.length
                      ? formData.distributionUsers
                      : []
                  }
                  type="RA"
                />
              )}
              {formData.distributionList === "All in Department(S)" && (
                <AutoComplete
                  suggestionList={entityOption ? entityOption : []}
                  name=""
                  keyName="distributionUsers"
                  formData={formData}
                  disabled={false}
                  labelKey="name"
                  setFormData={setFormData}
                  multiple={true}
                  getSuggestionList={() => {}}
                  defaultValue={
                    formData?.distributionUsers?.length
                      ? formData.distributionUsers
                      : []
                  }
                  type="RA"
                />
              )}
              {formData.distributionList === "Respective Department" && (
                <AutoComplete
                  suggestionList={entityOption ? entityOption : []}
                  name=""
                  keyName="distributionUsers"
                  formData={formData}
                  disabled={true}
                  labelKey="name"
                  setFormData={setFormData}
                  multiple={true}
                  getSuggestionList={() => {}}
                  defaultValue={
                    formData?.distributionUsers?.length
                      ? formData.distributionUsers
                      : []
                  }
                  type="RA"
                />
              )}
              {formData.distributionList === "Respective Unit" && (
                <AutoComplete
                  suggestionList={locationOption ? locationOption : []}
                  name=""
                  keyName="distributionUsers"
                  formData={formData}
                  disabled={true}
                  labelKey="name"
                  setFormData={setFormData}
                  multiple={true}
                  getSuggestionList={() => {}}
                  defaultValue={
                    formData?.distributionUsers?.length
                      ? formData.distributionUsers
                      : []
                  }
                  type="RA"
                />
              )}
              {formData.distributionList === "All Users" && (
                <AutoComplete
                  suggestionList={
                    [{ id: "All Users", name: "All Users" }]
                  }
                  name=""
                  keyName="distributionUsers"
                  formData={formData}
                  disabled={true}
                  labelKey="name"
                  setFormData={setFormData}
                  multiple={true}
                  getSuggestionList={() => {}}
                  defaultValue={
                    formData?.distributionUsers?.length
                      ? formData.distributionUsers
                      : []
                  }
                  type="RA"
                />
              )}
            </Form.Item>
          </Col>
        )}
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Form.Item
            label="Read Access: "
            name="readAccess"
            rules={[
              {
                required: false,
                message: "Please Select Read Access Options!",
              },
            ]}
          >
            <Select
              showSearch
              placeholder="Search and Select Read Access Options"
              onSelect={handleReadAccess}
              defaultValue={formData.readAccess}
              value={formData.readAccess}
              size="large"
            >
              {readAccess.map((option) => (
                <Option key={option} value={option} label={option}>
                  {option}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        {formData.readAccess !== "None" && (
          <Col span={12}>
            <Form.Item
              label="Read Access Users: "
              name="readAccessUsers"
              rules={[
                {
                  required: false,
                  message: "Please Select Read Access Users!",
                },
              ]}
            >
              {formData.readAccess === "All in Units(S)" && (
                <AutoComplete
                  suggestionList={locationOption ? locationOption : []}
                  name=""
                  keyName="readAccessUsers"
                  formData={formData}
                  disabled={false}
                  labelKey="name"
                  setFormData={setFormData}
                  multiple={true}
                  getSuggestionList={() => {}}
                  defaultValue={
                    formData?.readAccessUsers?.length
                      ? formData.readAccessUsers
                      : []
                  }
                  type="RA"
                />
              )}
              {formData.readAccess === "Selected Users" && (
                <AutoComplete
                  suggestionList={userOptions ? userOptions : []}
                  name=""
                  keyName="readAccessUsers"
                  formData={formData}
                  disabled={false}
                  labelKey="name"
                  setFormData={setFormData}
                  multiple={true}
                  getSuggestionList={() => {}}
                  defaultValue={
                    formData?.readAccessUsers?.length
                      ? formData.readAccessUsers
                      : []
                  }
                  type="RA"
                />
              )}
              {formData.readAccess === "All in Department(S)" && (
                <AutoComplete
                  suggestionList={entityOption ? entityOption : []}
                  name=""
                  keyName="readAccessUsers"
                  formData={formData}
                  disabled={false}
                  labelKey="name"
                  setFormData={setFormData}
                  multiple={true}
                  getSuggestionList={() => {}}
                  defaultValue={
                    formData?.readAccessUsers?.length
                      ? formData.readAccessUsers
                      : []
                  }
                  type="RA"
                />
              )}
              {formData.readAccess === "All Users" && (
                <AutoComplete
                  suggestionList={
                    [{ id: "All Users", name: "All Users" }]
                  }
                  name=""
                  keyName="readAccessUsers"
                  formData={formData}
                  disabled={true}
                  labelKey="name"
                  setFormData={setFormData}
                  multiple={true}
                  getSuggestionList={() => {}}
                  defaultValue={
                    formData?.readAccessUsers?.length
                      ? formData.readAccessUsers
                      : []
                  }
                  type="RA"
                />
              )}
            </Form.Item>
          </Col>
        )}
      </Row>
    </Form>
  );
};

export default WorkFlowTab;
