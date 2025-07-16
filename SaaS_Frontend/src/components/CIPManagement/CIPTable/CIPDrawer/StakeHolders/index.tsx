//react, react-router, recoil
import { useEffect, useState } from "react";
import { cipFormData } from "recoil/atom";
import { useRecoilState } from "recoil";

//material-ui
import { makeStyles, useMediaQuery } from "@material-ui/core";

//antd

import { Col, Form, Row, Select } from "antd";

//utils
import axios from "apis/axios.global";

//components
import AutoComplete from "components/AutoComplete";
import { useSnackbar } from "notistack";
import { Typography } from "antd";
import TextArea from "antd/es/input/TextArea";
const { Text, Link } = Typography;

type Props = {
  drawer?: any;
  setDrawer?: any;
  handleCipFormCreated?: any;
  workFlowForm?: any;
  setWorkFlowForm?: any;
  handleWorkFlowFormCreated?: any;
  disableFormFields?: any;
  selectedReviewerFormData: any;
  setSelectedReviewerFormData: any;
  selectedApproverFormData: any;
  setSelectedApproverFormData: any;
  isEdit?: any;
  refForcipForm19?: any;
  refForcipForm20?: any;
  refForcipForm21?: any;
  refForcipForm22?: any;
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
    },
    "& .ant-input-disabled, & .ant-select-disabled, & .ant-select-disabled .ant-select-selector, & .ant-select-multiple.ant-select-lg .ant-select-selection-item-content, & .MuiInputBase-input.Mui-disabled":
      {
        color: "black !important",
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
const StakeHolders = ({
  handleWorkFlowFormCreated,
  disableFormFields,
  isEdit,
  refForcipForm19,
  refForcipForm20,
  refForcipForm21,
  refForcipForm22,
}: Props) => {
  const matches = useMediaQuery("(min-width:786px)");
  const [formData, setFormData] = useRecoilState(cipFormData);
  const [reviewerOptions, setReviewerOptions] = useState<any>([]);
  const [fetchingReviewer, setFetchingReviewer] = useState<any>(false);
  const [locationOption, setLocationOption] = useState([]);
  const [approverOptions, setApproverOptions] = useState<any>([]);
  const [fetchingApprover, setFetchingApprover] = useState<any>(false);
  const [userOptions, setUserOptions] = useState([]);
  const [workflowForm] = Form.useForm();
  const [disabledReverAppro, setDisabledReverAppro] = useState<boolean>();
  const userDetail = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  useEffect(() => {
    getLocationOptions();
    getUserOptions();
    fetchingReviewerList();
    fetchApproverList();
    check();
  }, []);

  useEffect(() => {
    if (handleWorkFlowFormCreated) {
      handleWorkFlowFormCreated(workflowForm);
    }
  }, [workflowForm, handleWorkFlowFormCreated]);

  const getLocationOptions = async () => {
    await axios("/api/kpi-definition/getAllLocations")
      .then((res) => {
        const ops = res.data.map((obj: any) => ({
          id: obj.id,
          name: obj.locationName,
        }));
        setLocationOption(ops);
      })
      .catch((err) => {
        enqueueSnackbar("Failed to get locations details", {
          variant: "error",
        });
      });
  };

  const handlerChangeData = (name: any, e: any) => {
    const isValid = validateInput(e.target.value, "text");
    if (isValid === true) {
      setFormData({
        ...formData,
        [name]: e.target.value,
      });
    }
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
      .catch((err) => {
        enqueueSnackbar("Failed to get users details", { variant: "error" });
      });
  };

  const fetchingReviewerList = async () => {
    try {
      setFetchingReviewer(true);
      const res = await axios.get(`/api/roles/workFlowDistributionReviewer`);

      if (!!res.data && res.data.length > 0) {
        const userOptions = res.data.map((user: any) => ({
          id: user.id,
          reviewerName: user.firstname + " " + user.lastname,
          reviewerId: user.id,
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
      const res = await axios.get(`/api/roles/workFlowDistributionApprover`);

      if (!!res.data && res.data.length > 0) {
        const userOptions = res.data.map((user: any) => ({
          id: user.id,
          approverName: user.firstname + " " + user.lastname,
          approverId: user.id,
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
      enqueueSnackbar("Could not submit CIP Category", { variant: "error" });
    }
  };

  const userInfo = JSON.parse(sessionStorage.getItem("userDetails") as string);

  const check = () => {
    if (
      (userInfo?.id === formData?.createdBy?.id &&
        (formData.status === "Draft" || formData.status === "Edit")) ||
      formData.status === "Save"
    ) {
      setDisabledReverAppro(false);
    } else {
      setDisabledReverAppro(true);
    }
  };

  function validateInput(value: any, fieldType: any) {
    // Define regex patterns
    const specialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/u;
    const disallowedChars = /[<>]/u;

    // Rule: No starting with special character (non-letter and non-number)
    const startsWithSpecialChar = /^[^\p{L}\p{N}]/u.test(value);

    // Rule: No two consecutive special characters
    const consecutiveSpecialChars =
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{2,}/u.test(value);

    // Rule: Disallow < and >
    const containsDisallowedChars = disallowedChars.test(value);

    // Check rules based on field type
    if (fieldType === "text" || fieldType === "dropdown") {
      if (startsWithSpecialChar) {
        return "The input should not start with a special character or space.";
      }

      if (consecutiveSpecialChars) {
        return "No two consecutive special characters are allowed.";
      }

      if (containsDisallowedChars) {
        return "The characters < and > are not allowed.";
      }

      return true; // Passes validation for text or dropdown fields
    } else if (fieldType === "number") {
      // Rule: Only numbers are allowed
      if (!/^\d+$/u.test(value)) {
        return "Only numeric values are allowed.";
      }

      return true; // Passes validation for number fields
    }

    return "Invalid field type."; // In case an unsupported field type is passed
  }

  const validateField = (fieldType: any) => ({
    validator(_: any, value: any) {
      const result = validateInput(value, fieldType);
      if (result === true) {
        return Promise.resolve();
      }
      return Promise.reject(new Error(result));
    },
  });

  return (
    <>
      {/* <div
        style={{
          width: matches ? "40%" : "100%",
          marginLeft: "200px",
          maxWidth: "800px",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          color: "#003566",
          fontWeight: "bold",
          // letterSpacing: "0.8px",
          // justifyContent: "flex-start",
          border: "1px solid grey",
          borderRadius: "5px",
        }}
      > */}
      <Row
        gutter={[16, 16]}
        style={{
          display: "flex",
          flexDirection: matches ? "row" : "column",
          justifyContent: "center",
          // border: "1px solid grey",
          // borderRadius: "5px",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <strong style={{ whiteSpace: "nowrap" }}>
          Project Owner/Creator :{" "}
        </strong>
        <Text
          style={{
            margin: "5px",
            fontSize: "16px",

            // whiteSpace: "nowrap",
          }}
        >
          {formData?.createdBy?.name
            ? formData?.createdBy?.name
            : userDetail?.username}
        </Text>
      </Row>

      <Form
        style={{ paddingTop: "15px" }}
        form={workflowForm}
        layout="vertical"
        initialValues={{
          reviewers: formData?.reviewers,
          approvers: formData?.approvers,
          otherMembers: formData?.otherMembers,
        }}
        rootClassName={classes.labelStyle}
        disabled={disableFormFields}
      >
        <Row
          gutter={[16, 16]}
          style={{ display: "flex", flexDirection: matches ? "row" : "column" }}
        >
          <Col span={matches ? 12 : 24}>
            <Form.Item label="Project Leader(s)/Reviewer(s) " name="reviewers">
              {/* <div ref={refForcipForm19}> */}
              <AutoComplete
                suggestionList={reviewerOptions ? reviewerOptions : []}
                name="Project Leaders/Reviewers"
                keyName={"reviewers"}
                formData={formData}
                disabled={
                  disableFormFields
                    ? disableFormFields
                    : disabledReverAppro
                    ? disabledReverAppro
                    : false
                }
                labelKey={"reviewerName"}
                setFormData={setFormData}
                multiple={true}
                getSuggestionList={() => {}}
                defaultValue={
                  formData?.reviewers?.length ? formData.reviewers : []
                }
                type="RA"
              />
              {/* </div> */}
            </Form.Item>
          </Col>
          <Col span={matches ? 12 : 24}>
            <Form.Item
              label="Project Champion(s)/Approver(s) "
              name="approvers"
            >
              {/* <div ref={refForcipForm20}> */}
              <AutoComplete
                suggestionList={approverOptions ? approverOptions : []}
                name="Project Champions/Approvers"
                keyName={"approvers"}
                formData={formData}
                disabled={
                  disableFormFields
                    ? disableFormFields
                    : disabledReverAppro
                    ? disabledReverAppro
                    : false
                }
                labelKey={"approverName"}
                setFormData={setFormData}
                multiple={true}
                getSuggestionList={() => {}}
                defaultValue={
                  formData?.approvers?.length ? formData.approvers : []
                }
                type="RA"
              />
              {/* </div> */}
            </Form.Item>
          </Col>
        </Row>

        <Row
          gutter={[16, 16]}
          style={{ display: "flex", flexDirection: matches ? "row" : "column" }}
        >
          <Col span={matches ? 12 : 24}>
            <Form.Item label="Project Members " name="projectMembers">
              {/* <div ref={refForcipForm21}> */}
              <AutoComplete
                suggestionList={reviewerOptions ? reviewerOptions : []}
                name="Project Members "
                keyName={"projectMembers"}
                labelKey={"reviewerName"}
                formData={formData}
                disabled={
                  disableFormFields
                    ? disableFormFields
                    : disabledReverAppro
                    ? disabledReverAppro
                    : false
                }
                setFormData={setFormData}
                multiple={true}
                getSuggestionList={() => {}}
                defaultValue={
                  formData?.projectMembers?.length
                    ? formData.projectMembers
                    : []
                }
                type="RA"
              />
              {/* </div> */}
            </Form.Item>
          </Col>

          <Col span={matches ? 12 : 24}>
            <Form.Item
              label="Other Project Members "
              name="otherMembers"
              rules={[
                {
                  validator: validateField("text").validator,
                },
              ]}
            >
              {/* <div ref={refForcipForm22}> */}
              <TextArea
                name="otherMembers"
                placeholder="Other Project Members"
                size="large"
                value={formData?.otherMembers}
                onChange={(e) => {
                  handlerChangeData("otherMembers", e);
                }}
                style={{ backgroundColor: "white" }}
              />
              {/* </div> */}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default StakeHolders;
