//react, react router
import { useEffect, useState } from "react";
//antd
import { Button, Form, Row, Col, Modal } from "antd";
//utils
import axios from "apis/axios.global";
import getAppUrl from "utils/getAppUrl";
//styles
import useStyles from "./style";
import { useSnackbar } from "notistack";
import getSessionStorage from "utils/getSessionStorage";
import AutoComplete from "components/AutoComplete";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  changeWorkflowPeopleModal: any;
  setChangeWorkflowPeopleModal: any;
  hiraData: any;
  reloadAllHiraTableData: any;
};

const ChangeReviewerApproverModal = ({
  changeWorkflowPeopleModal,
  setChangeWorkflowPeopleModal,
  hiraData,
  reloadAllHiraTableData,
}: Props) => {
  const [reviewerOptions, setReviewerOptions] = useState<any>([]);
  const [approverOptions, setApproverOptions] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [workflowFormData, setWorkflowFormData] = useState<any>({
    reviewers: [],
    approvers: [],
  }); //for storing form data

  const [hideReviewerField, setHideReviewerField] = useState<boolean>(false);

  const classes = useStyles();
  const realmName = getAppUrl();
  const location = useLocation();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const userDetails = getSessionStorage();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    setIsLoading(true);
    console.log(
      "checkrisknew changeWorkflowPeopleModal",
      changeWorkflowPeopleModal,
      hiraData
    );
    if (hiraData?.workflowStatus === "IN_APPROVAL") {
      setHideReviewerField(true);
    }

    Promise.all([fetchingReviewerList(), fetchApproverList()])
      .then(([reviewerData, approverData]) => {
        setIsLoading(false); // Stop loading when both promises are resolved

        if (reviewerData?.length === 0 && approverData?.length === 0) {
          enqueueSnackbar("No reviewers and approvers found", {
            variant: "warning",
          });
        } else if (reviewerData?.length === 0) {
          enqueueSnackbar("No reviewers found", { variant: "warning" });
        } else if (approverData?.length === 0) {
          enqueueSnackbar("No approvers found", { variant: "warning" });
        }

        console.log("checkrisk reviewers in .then", reviewerOptions);
        console.log("checkrisk approvers in .then", approverOptions);
      })
      .catch((error) => {
        console.error("checkrisk Error fetching data:", error);
        setIsLoading(false); // Also stop loading in case of error
      });
  }, [changeWorkflowPeopleModal]);

  useEffect(() => {
    console.log("checkrisknew workflowFormData", workflowFormData);
  }, [workflowFormData]);

  const fetchingReviewerList = async () => {
    try {
      const targetCycleNumber = hiraData?.currentVersion + 1;
      const workflowObject = hiraData?.workflow?.find(
        (workflow: any) => workflow.cycleNumber === targetCycleNumber
      );
      const res = await axios.get(`/api/roles/workFlowDistributionReviewer`);
      // console.log("fetch reviwer list", res);
      const data = res?.data || [];
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
        }));
        setReviewerOptions(userOptions);
        const selectedReviewers = userOptions.filter((user: any) =>
          workflowObject?.reviewers?.includes(user.id)
        );

        setWorkflowFormData((prevFormData: any) => ({
          ...prevFormData,
          reviewers: selectedReviewers,
        }));
        return userOptions;
      } else {
        setReviewerOptions([]);
      }
      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const fetchApproverList = async () => {
    try {
      const targetCycleNumber = hiraData?.currentVersion + 1;
      const workflowObject = hiraData?.workflow?.find(
        (workflow: any) => workflow.cycleNumber === targetCycleNumber
      );
      const res = await axios.get(`/api/roles/workFlowDistributionApprover`);
      const data = res?.data || [];
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
        }));
        setApproverOptions(userOptions);
        const selectedApprovers = userOptions.filter((user: any) =>
          workflowObject?.approvers?.includes(user.id)
        );

        setWorkflowFormData((prevFormData: any) => ({
          ...prevFormData,
          approvers: selectedApprovers,
        }));
        return userOptions;
      } else {
        setApproverOptions([]);
      }
      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const handleSubmitForm = async (values: any) => {
    try {
      console.log("checkrisknew values in handleSubmitForm", values);
      let dataObject: any = {
        updatedBy: userDetails?.id,
      };
      if (hiraData?.workflowStatus === "IN_APPROVAL") {
        dataObject = {
          ...dataObject,
          approvers: workflowFormData?.approvers,
        };
        const res = await axios.put(
          `/api/riskregister/hira/changeApprover/${hiraData?._id}`,
          dataObject
        );
        console.log("checkrisknew res in handleSubmitForm", res);
        if (res?.status === 200 || res?.status === 201) {
          enqueueSnackbar("Approver updated successfully", {
            variant: "success",
          });
          reloadAllHiraTableData();
          setChangeWorkflowPeopleModal(false);
        } else {
          enqueueSnackbar("Failed to update Approver", {
            variant: "error",
          });
          setChangeWorkflowPeopleModal(false);
        }
      }
      if (hiraData?.workflowStatus === "IN_REVIEW") {
        dataObject = {
          ...dataObject,
          reviewers: workflowFormData?.reviewers,
          approvers: workflowFormData?.approvers,
        };
        const res = await axios.put(
          `/api/riskregister/hira/changeReviewerApprover/${hiraData?._id}`,
          dataObject
        );
        console.log("checkrisknew res in handleSubmitForm", res);
        if (res?.status === 200 || res?.status === 201) {
          enqueueSnackbar("Reviewer and Approver updated successfully", {
            variant: "success",
          });
          reloadAllHiraTableData();
          setChangeWorkflowPeopleModal(false);
        } else {
          enqueueSnackbar("Failed to update Reviewer and Approver", {
            variant: "error",
          });
          setChangeWorkflowPeopleModal(false);
        }
      }
    } catch (error) {
      enqueueSnackbar("Failed to Reviewer/Approver", {
        variant: "error",
      })
      console.log(error);
    }
  };

  const handleCloseModal = () => {
    setChangeWorkflowPeopleModal(false);
  };

  return (
    <Modal
      title={`Change Reviewer and Approver`}
      centered
      open={changeWorkflowPeopleModal}
      onCancel={handleCloseModal}
      footer={null}
      width={500}
      className={classes.modal}
    >
      <div>
        <Form
          form={form}
          layout="vertical"
          className={classes.formBox}
          onFinish={handleSubmitForm}
          onValuesChange={(changedValues, allValues) =>
            setWorkflowFormData({ ...workflowFormData, ...changedValues })
          }
        >
          <div style={{ padding: "5px" }}>
            <Row
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                paddingLeft: "20px",
              }}
            >
              <>
                {!hideReviewerField && (
                  <Col>
                    <Form.Item label="Change Reviewer*: " name="reviewers">
                      <AutoComplete
                        suggestionList={reviewerOptions ? reviewerOptions : []}
                        name=""
                        keyName="reviewers"
                        formData={workflowFormData}
                        disabled={false}
                        labelKey="label"
                        setFormData={setWorkflowFormData}
                        multiple={true}
                        getSuggestionList={() => {}}
                        defaultValue={workflowFormData?.reviewers || []}
                        type="RA"
                      />
                    </Form.Item>
                  </Col>
                )}

                <Col>
                  <Form.Item label="Change Approver*: " name="approvers">
                    <AutoComplete
                      suggestionList={approverOptions ? approverOptions : []}
                      name=""
                      keyName="approvers"
                      formData={workflowFormData}
                      disabled={false}
                      labelKey="label"
                      setFormData={setWorkflowFormData}
                      multiple={true}
                      getSuggestionList={() => {}}
                      defaultValue={workflowFormData?.approvers || []}
                      type="RA"
                    />
                  </Form.Item>
                </Col>
              </>
            </Row>
            <Row
              style={{
                justifyContent: "end",
              }}
            >
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Update
                </Button>
              </Form.Item>
            </Row>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default ChangeReviewerApproverModal;
