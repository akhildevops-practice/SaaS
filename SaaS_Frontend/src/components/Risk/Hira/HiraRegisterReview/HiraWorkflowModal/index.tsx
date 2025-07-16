//react, react router
import {
  useEffect,
  useState,
} from "react";
//antd
import {
  Button,
  Form,
  Input,
  Row,
  Col,
  Modal,
  Select,
} from "antd";

//material-ui

//utils
import axios from "apis/axios.global";
import getAppUrl from "utils/getAppUrl";

//styles
import useStyles from "./style";

//thirdparty libs
import { useSnackbar } from "notistack";
import getSessionStorage from "utils/getSessionStorage";
import AutoComplete from "components/AutoComplete";
import { useLocation, useNavigate } from "react-router-dom";
import getYearFormat from "utils/getYearFormat";

//antd constants
const { TextArea } = Input;
const { Option } = Select;

type Props = {
  reviewModal: any;
  setReviewModal: any;
  hiraStatus?: string;
  selectedJobTitle?: string;
  appliedFilters?: any;
  // refWorkflowForm?: any;
};

const HiraWorkflowModal = ({
  reviewModal,
  setReviewModal,
  hiraStatus = "open",
  selectedJobTitle = "",
  appliedFilters = {},
}: Props) => {
  const [searchQuery, setsearchQuery] = useState<string>("");


  const [options, setOptions] = useState<any>([]);
  const [fetching, setFetching] = useState<any>(false);
  const [reviewerOptions, setReviewerOptions] = useState<any>([]);
  const [approverOptions, setApproverOptions] = useState<any>([]);
  const [currentYear, setCurrentYear] = useState<any>();
  //loading state for fetching both reviewers and approvers
  const [isLoading, setIsLoading] = useState(false);
  const [workflowFormData, setWorkflowFormData] = useState<any>({
    reviewers: [],
    approvers: [],
  }); //for storing form data

  const [hideReviewerAndApproverField, setHideReviewerAndApproverField] =
    useState<boolean>(false);

  const classes = useStyles();
  const realmName = getAppUrl();
  const location = useLocation()
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const userDetails = getSessionStorage();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    setIsLoading(true);
    if (
      !!reviewModal?.open &&
      (reviewModal?.status === "IN_REVIEW" ||
        reviewModal?.status === "IN_APPROVAL" ||
        reviewModal?.status === "REJECTED")
    ) {
      setHideReviewerAndApproverField(true);
    } else {
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
        })
        .catch((error) => {
          setIsLoading(false); // Also stop loading in case of error
        });
    }
  }, [reviewModal, reviewModal?.status]);


  const getyear = async () => {
    const currentyear = await getYearFormat(new Date().getFullYear());
    setCurrentYear(currentyear);
    return currentyear;
  };

  const fetchingReviewerList = async () => {
    try {
      // const encodedValue = encodeURIComponent(value);
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
      // const encodedValue = encodeURIComponent(value);
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
      // console.log("checkrisk hiraInworkflow", reviewModal?.hiraInWorkflow);
      let url, hiraPageUrl;
      if (process.env.REACT_APP_REDIRECT_URL?.includes("adityabirla.com")) {
        url = `${process.env.REACT_APP_REDIRECT_URL}/risk/riskregister/HIRA/review`;
        hiraPageUrl = `${process.env.REACT_APP_REDIRECT_URL}/risk/riskregister/HIRA`;
      } else {
        url = `${realmName}.${process.env.REACT_APP_REDIRECT_URL}/risk/riskregister/HIRA/review`;
        hiraPageUrl = `${realmName}.${process.env.REACT_APP_REDIRECT_URL}/risk/riskregister/HIRA`;
      }

      const dataObject:any = {
        entityName : reviewModal?.data?.entityName,
        entityId : reviewModal?.data?.entityId,
        locationId: reviewModal?.data?.locationId,
        locationName : reviewModal?.data?.locationName,
        url: url,
        hiraPageUrl : hiraPageUrl,
        jobTitle: reviewModal?.data?.jobTitle || selectedJobTitle,
        organizationId: userDetails?.organizationId,
      }

      if (reviewModal?.status === "DRAFT") {
        // const encodedJobTitle = encodeURIComponent(reviewModal?.data?.jobTitle);
        if (!workflowFormData?.reviewers?.length) {
          enqueueSnackbar("Please Select Atleast One Reviewer!", {
            variant: "warning",
          });
          return;
        }
        if (!workflowFormData?.approvers?.length) {
          enqueueSnackbar("Please Select Atleast One Approver!", {
            variant: "warning",
          });
          return;
        }
        const data = {
          reviewers:
            workflowFormData?.reviewers?.map((item: any) => ({
              id: item.userId,
              fullName: item?.fullname,
              email: item?.email,
            })) || [],
          approvers:
            workflowFormData?.approvers?.map((item: any) => ({
              id: item.userId,
              fullName: item?.fullname,
              email: item?.email,
            })) || [],
          reviewComment: values.comment,
          reviewStartedBy: userDetails?.id,
          comments: [
            {
              commentText: values.comment,
              commentBy: userDetails?.firstname + " " + userDetails?.lastname,
              userId: userDetails?.id,
            },
          ],
          createdBy: userDetails?.id,
          reason: values?.reason || "",
          ...dataObject,
        };
        const res = await axios.put(
          `/api/riskregister/hira/startReviewFirstVersion/${reviewModal?.data?.hiraId}`,
          data
        );
        console.log("res", res);
        if (res.status === 200 || res.status === 201) {
          enqueueSnackbar(
            //   `Hira With Job Title ${reviewModal?.data?.jobTitle} Successfully Sent for Review`,
            res?.data?.message ||
              `Risk With Job Title ${reviewModal?.data?.jobTitle} Successfully Sent for Review`,
            {
              variant: "success",
              autoHideDuration: 2500,
            }
          );
          handleCloseModal();
          navigate(`/risk/riskregister/HIRA`, {
            state : {
              entityId : location?.state?.entityId,
              jobTitle : data.jobTitle,
              filters : {
                ...appliedFilters
              }
            }
          });
        }
      } else if (reviewModal?.status === "IN_REVIEW") {
        const data : any = {
          reviewCompleteComment: values.comment,
          reviewedBy: userDetails?.id,
          updatedBy: userDetails?.id,
          status : "IN_APPROVAL",
          comments: [
            {
              commentText: values.comment,
              commentBy: userDetails?.firstname + " " + userDetails?.lastname,
              userId: userDetails?.id,
            },
          ],
          ...dataObject,
        };
        const res = await axios.put(
          `/api/riskregister/hira/updateWorkflowStatus/${reviewModal?.data?.hiraId}`,
          data
        );
        if (res.status === 200 || res.status === 201) {
          enqueueSnackbar(
            //   `Hira With Job Title ${reviewModal?.data?.jobTitle} Successfully Sent for Review`,
            res?.data?.message ||
              `Risk With Job Title ${reviewModal?.data?.jobTitle} Successfully Sent for Approval`,
            {
              variant: "success",
              autoHideDuration: 2500,
            }
          );
          handleCloseModal();
          navigate(`/risk/riskregister/HIRA`, {
            state : {
              entityId : location?.state?.entityId,
              jobTitle : data.jobTitle,
              filters : {
                ...appliedFilters
              }
            }
          });
        }
      } else if (reviewModal?.status === "IN_APPROVAL") {
          const data = {
            approveComment: values.comment,
            updatedBy: userDetails?.id,
            approvedBy: userDetails?.id,
            status: "APPROVED",
            year: await getyear(),
            organizationId: userDetails?.organizationId,
            comments: [
              {
                commentText: values.comment,
                commentBy: userDetails?.firstname + " " + userDetails?.lastname,
                userId: userDetails?.id,
              },
            ],
            ...dataObject,
          };
          const res = await axios.put(
            `/api/riskregister/hira/updateWorkflowStatus/${reviewModal?.data?.hiraId}`,
            data
          );
          if (res.status === 200 || res.status === 201) {
            enqueueSnackbar(
              res?.data?.message ||
                `Risk With Job Title ${reviewModal?.data?.jobTitle} Successfully Approved`,
              {
                variant: "success",
                autoHideDuration: 2500,
              }
            );
            handleCloseModal();
            navigate(`/risk/riskregister/HIRA`, {
              state : {
                entityId : location?.state?.entityId,
                jobTitle : data.jobTitle,
                filters : {
                  ...appliedFilters
                }
              }
            });
          }
      } else if (reviewModal?.status === "REJECTED") {
          const data = {
            updatedBy: userDetails?.id,
            status: "REJECTED",
            rejectedBy: userDetails?.id,
            comments: [
              {
                commentText: values.comment,
                commentBy: userDetails?.firstname + " " + userDetails?.lastname,
                userId: userDetails?.id,
              },
            ],
            ...dataObject,
          };
          const res = await axios.put(
            `/api/riskregister/hira/updateWorkflowStatus/${reviewModal?.data?.hiraId}`,
            data
          );
          if (res.status === 200 || res.status === 201) {
            enqueueSnackbar(res?.data?.message ||
                `Risk With Job Title ${reviewModal?.data?.jobTitle} Successfully Sent Back For Edit`,
              {
                variant: "success",
                autoHideDuration: 2500,
              }
            );
            handleCloseModal();
            navigate(`/risk/riskregister/HIRA`, {
              state : {
                entityId : location?.state?.entityId,
                jobTitle : data.jobTitle,
                filters : {
                  ...appliedFilters
                }
              }
            });
          }
      } else if (reviewModal?.status === "STARTREVIEW") {
        // const encodedJobTitle = encodeURIComponent(reviewModal?.data?.jobTitle);
        if (!workflowFormData?.reviewers?.length) {
          enqueueSnackbar("Please Select Atleast One Reviewer!", {
            variant: "warning",
          });
          return;
        }
        if (!workflowFormData?.approvers?.length) {
          enqueueSnackbar("Please Select Atleast One Approver!", {
            variant: "warning",
          });
          return;
        }
        const data = {
          reviewers:
            workflowFormData?.reviewers?.map((item: any) => ({
              id: item.userId,
              fullName: item?.fullname,
              email: item?.email,
            })) || [],
          approvers:
            workflowFormData?.approvers?.map((item: any) => ({
              id: item.userId,
              fullName: item?.fullname,
              email: item?.email,
            })) || [],
          reviewComment: values.comment,
          reviewStartedBy: userDetails?.id,
          comments: [
            {
              commentText: values.comment,
              commentBy: userDetails?.firstname + " " + userDetails?.lastname,
              userId: userDetails?.id,
            },
          ],
          createdBy: userDetails?.id,
          reason: values?.reason || "",
          status : "IN_REVIEW",
          ...dataObject,
        };
        const res = await axios.put(
          `/api/riskregister/hira/startHiraReviewOfRejectedHira/${reviewModal?.data?.hiraId}`,
          data
        );
        if (res.status === 200 || res.status === 201) {
          enqueueSnackbar(
            //   `Hira With Job Title ${reviewModal?.data?.jobTitle} Successfully Sent for Review`,
            res?.data?.message ||
              `Risk With Job Title ${reviewModal?.data?.jobTitle} Successfully Sent for Review`,
            {
              variant: "success",
              autoHideDuration: 2500,
            }
          );
          handleCloseModal();
          navigate(`/risk/riskregister/HIRA`, {
            state : {
              entityId : location?.state?.entityId,
              jobTitle : data.jobTitle,
              filters : {
                ...appliedFilters
              }
            }
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  };



  const handleCloseModal = () => {
    setReviewModal({
      ...reviewModal,
      open: !reviewModal.open,
    });
    // navigate("/risk/riskregister/HIRA");
  };

  return (
    <Modal
      title={`${
          reviewModal?.status === "DRAFT"
          ? "Send for Review"
          : reviewModal?.status === "IN_REVIEW"
          ? "Finish Review"
          : reviewModal?.status === "IN_APPROVAL"
          ? "Finish Approval"
          : reviewModal?.status === "REJECTED"
          ? "Send Back For Edit"
          : reviewModal?.status === "STARTREVIEW"
          ? "Send For Review"
          : ""
      }`}
      centered
      open={reviewModal.open}
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

          // style={{marginTop : "15px"}}
        >
          <div
            style={{ padding: "5px" }}
            // ref={refWorkflowForm}
          >
            <Row
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                paddingLeft: "20px",
                // paddingRight: "10px",
              }}
            >
              {!hideReviewerAndApproverField && (
                <>
                  <Col>
                    <Form.Item
                      label="Select Reviewer*: "
                      name="reviewers"
                      // rules={[
                      //   {
                      //     required: true,
                      //     message: "Please Select Reviewer!",
                      //   },
                      // ]}
                    >
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
                  <Col>
                    <Form.Item
                      label="Select Approver*: "
                      name="approvers"
                      // rules={[
                      //   {
                      //     required: true,
                      //     message: "Please Select Approver!",
                      //   },
                      // ]}
                    >
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
              )}

              <Col>
                <Form.Item
                  label="Comment: "
                  name="comment"
                  required
                  rules={[
                    {
                      required: true,
                      message: "Please Enter Comment!",
                    },
                  ]}
                  // tooltip={{ title: 'Tooltip with customize icon', icon: <InfoIcon /> }}
                >
                  <TextArea
                    rows={3}
                    style={{ width: "422px" }}
                    placeholder="Enter Comment"
                    size="large"
                    // value={value}
                    // onChange={handleInput}
                    // onChange={(e) => setValue(e.target.value)}
                    // onKeyDown={handleKeyDown}
                  />
                </Form.Item>
              </Col>

              {!!reviewModal?.open && !!reviewModal?.data?.isRevision && (
                <Col>
                  <Form.Item
                    label="Reason For Revision: "
                    name="reason"
                    required
                    rules={[
                      {
                        required: true,
                        message: "Please Enter Reason for Revision!",
                      },
                    ]}
                    // tooltip={{ title: 'Tooltip with customize icon', icon: <InfoIcon /> }}
                  >
                    <TextArea
                      rows={3}
                      style={{ width: "422px" }}
                      placeholder="Enter Reason For Revision"
                      size="large"
                      // value={value}
                      // onChange={handleInput}
                      // onChange={(e) => setValue(e.target.value)}
                      // onKeyDown={handleKeyDown}
                    />
                  </Form.Item>
                </Col>
              )}
            </Row>
            <Row
              style={{
                // padding: "10px 10px",
                justifyContent: "end",
              }}
            >
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  // ref={refSendButton}
                >
                  {`${
                    reviewModal?.status === "DRAFT"
                      ? "Send for Review"
                      : reviewModal?.status === "IN_REVIEW"
                      ? "Send for Approval"
                      : reviewModal?.status === "IN_APPROVAL"
                      ? "Approve"
                      : reviewModal?.status === "REJECTED"
                      ? "Send Back For Edit"
                      : reviewModal?.status === "STARTREVIEW"
                      ? "Send For Review"
                      : ""
                  }`}
                </Button>
              </Form.Item>
            </Row>
          </div>
        </Form>
      </div>
      {/* {!!tourOpenForWorkflow && (
        <Tour
          open={tourOpenForWorkflow}
          onClose={() => setTourOpenForWorkflow(false)}
          steps={stepsForWorkflowTour}
          current={currentStepForWorkflow}
          indicatorsRender={(current, total) => (
            <span>
              {current + 1} / {total}
            </span>
          )}
        />
      )} */}
    </Modal>
  );
};

export default HiraWorkflowModal;
