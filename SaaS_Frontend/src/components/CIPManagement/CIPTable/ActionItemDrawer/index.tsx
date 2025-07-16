import {
  Col,
  Form,
  Input,
  Row,
  Drawer,
  Switch,
  Upload,
  Space,
  Button,
} from "antd";
import React, { useEffect, useState } from "react";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import useStyles from "./style";
import {
  CircularProgress,
  Grid,
  Typography,
  useMediaQuery,
} from "@material-ui/core";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  actionItemData,
  activityUpdateData,
  auditCreationForm,
  cipActionItemData,
  orgFormData,
} from "recoil/atom";
import AutoComplete from "components/AutoComplete";
import { debounce } from "lodash";
import axios from "apis/axios.global";
import type { UploadProps } from "antd";
import { MdInbox } from 'react-icons/md';
import { MdDelete } from 'react-icons/md';
import ActivityUpdateTable from "../CIPDrawer/StakeHolders/ActionItem/ActivityUpdateTable";
import { createActionPoint, updateActionPoint } from "apis/mrmActionpoint";
import getYearFormat from "utils/getYearFormat";
import { useSnackbar } from "notistack";
import checkRole from "utils/checkRoles";
import getAppUrl from "utils/getAppUrl";
import { API_LINK } from "config";

type Props = {
  actionItemDrawer?: any;
  setActionItemDrawer?: any;
  handleFetchCips?: any;
  deletedId?: any;
  isGraphSectionVisible?: any;
  inboxDrawer?: any;
  moduleName?: any;
  actionRowData?: any;
  handleCloseDrawer?: any;
};

const ActionItemDrawer = ({
  actionItemDrawer,
  setActionItemDrawer,
  handleFetchCips,
  deletedId,
  isGraphSectionVisible,
  inboxDrawer,
  moduleName,
  actionRowData,
  handleCloseDrawer,
}: Props) => {
  const matches = useMediaQuery("(min-width:822px)");
  const smallScreen = useMediaQuery("(min-width:450px)");
  const [actionDrawerSize, setActionItemDrawerSize] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useRecoilState(cipActionItemData);
  const [actionItemForm] = Form.useForm();
  const [user, setUser] = useState([]);
  const [template, setTemplate] = useRecoilState<any>(auditCreationForm);
  const HeadersData = ["Activity Comments", "Activity Performed Date"];
  const FieldsData = ["comments", "date"];
  const [currentYear, setCurrentYear] = useState<any>();
  const [switchState, setSwitchState] = useState(formData.status);
  const orgData = useRecoilValue(orgFormData);
  const [activityUpdate, setActivityUpdate] =
    useRecoilState(activityUpdateData);
  const organizationId =
    sessionStorage.getItem("orgId") !== null &&
    sessionStorage.getItem("orgId") !== "null"
      ? sessionStorage.getItem("orgId")
      : (orgData && orgData.organizationId) ||
        (orgData && orgData.id) ||
        undefined;
  const userInfo = JSON.parse(sessionStorage.getItem("userDetails") as string);
  const classes = useStyles({
    isGraphSectionVisible: isGraphSectionVisible,
  });
  const { TextArea } = Input;
  const { Dragger } = Upload;
  const [drawerDataState, setDrawerDataState] = useRecoilState(actionItemData);
  const { enqueueSnackbar } = useSnackbar();
  const [urls, setUrls] = useState([]);
  const isOrgAdmin = checkRole("ORG-ADMIN");
  const [uploadFileError, setUploadFileError] = useState<any>(false);
  const realmName = getAppUrl();
  const [buttonDisable, setButtonDisable] = useState(false);
  const [buttonCreate, setButtonCreate] = useState(false);
  const [dataById, setDataById] = useState<any>();

  useEffect(() => {
    getyear();
    buttonStatesUpdate();
    if (actionItemDrawer?.data?.owner?.username === userInfo?.username) {
      setButtonDisable(false);
      setButtonCreate(true);
    }
    if (actionItemDrawer?.data?.owner?.username !== userInfo?.username) {
      setButtonDisable(true);
    }

    if (actionItemDrawer.mode === "create") {
      setButtonDisable(true);
      setButtonCreate(false);
    }
  }, []);

  const buttonStatesUpdate = async () => {
    try {
      const result = await axios(
        `/api/cip/getCIPById/${actionItemDrawer.data.referenceId}`
      );
      setDataById(result.data);
      if (
        result.data.status === "Closed" ||
        result.data.status === "Complete" ||
        result.data.status === "InVerification" ||
        result.data.status === "Drop CIP"
      ) {
        setButtonCreate(true);
      }
      if (actionItemDrawer.mode === "edit") {
        if (result.data.createdBy?.name === userInfo?.fullName) {
          setButtonCreate(false);
          setButtonDisable(false);
        }
        if (result.data.createdBy?.name !== userInfo?.fullName) {
          setButtonCreate(true);
        }
      }
    } catch (e) {
      console.log("error", e);
    }
  };

  console.log("actionItemDrawer", actionItemDrawer);

  const dataSendBy = async () => {
    const dataFilByTable = actionItemDrawer?.tableSub?.filter(
      (item: any) => item.referenceId === actionItemDrawer?.data.referenceId
    );

    const dataAction = dataFilByTable?.map((item: any) => item.status);

    const finalCallData = dataAction?.every((value: any) => value === false);

    // if (finalCallData) {
    //   return await axios.put(`/api/cip/${actionItemDrawer?.data.referenceId}`, {
    //     status: "Complete",
    //   });
    // }
  };
  console.log("formData", formData);

  useEffect(() => {
    console.log("actionrosdata", actionItemDrawer);

    if (
      deletedId ||
      actionItemDrawer?.mode === "edit" ||
      moduleName === "INBOX"
    ) {
      // console.log("inside second if", actionItemDrawer?.data);
      // setDrawerDataState({
      //   ...drawerDataState,
      //   id: deletedId ? deletedId : actionItemDrawer?.data?.id,
      //   data: actionItemDrawer?.data,
      //   formMode: "edit",
      // });

      setFormData(actionItemDrawer?.data);
      //  console.log("formdata in regular edit", formData);
      setActivityUpdate(actionItemDrawer?.data?.additionalInfo?.activityUpdate);
    } else
      setFormData({
        cipId: "",
        title: "",
        description: "",
        owner: "",
        startDate: "",
        endDate: "",
        status: "true",
        attachments: [],
        activityUpdate: [],
        locationId: "",
      });
  }, [deletedId, actionItemDrawer?.open]);

  const handleCloseModal = () => {
    setActionItemDrawer({
      ...actionItemDrawer,
      open: !actionItemDrawer.open,
      data: {},
    });
    setTemplate([]);
    setActivityUpdate([]);
  };

  const handleInputChange = (e: any) => {
    const isValid = validateInput(e.target.value, "text");
    if (isValid === true) {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
  };
  console.log("formdata outside", formData);
  let typeAheadValue: string;
  let typeAheadType: string;

  const getSuggestionListUser = (value: any, type: string) => {
    typeAheadValue = value;
    typeAheadType = type;
    debouncedSearchUser();
  };

  const debouncedSearchUser = debounce(() => {
    getUser(typeAheadValue, typeAheadType);
  }, 50);

  const getUser = async (value: string, type: string) => {
    try {
      const res = await axios.get(
        `/api/documents/filerValue?searchLocation=&searchBusinessType=&searchEntity=&searchSystems=&searchDoctype=&searchUser=${value}`
      );
      const ops = res?.data?.allUser?.map((obj: any) => ({
        id: obj.id,
        username: obj.username,
        locationName: obj.location.locationName,
        locationid: obj.location.id,
      }));
      setUser(ops);
    } catch (err) {
      console.log(err);
      // enqueueSnackbar(`Error While Fetching Data`, { variant: "error" });
    }
  };

  const getyear = async () => {
    const currentyear = await getYearFormat(new Date().getFullYear());
    setCurrentYear(currentyear);
  };

  const uploadProps: UploadProps = {
    multiple: true,
    beforeUpload: () => false,
    fileList: template?.files || [],
    onRemove: (file) => {
      const updatedFileList = template.files.filter(
        (item: any) => item.uid !== file.uid
      );
      setTemplate((prevTemplate: any) => ({
        ...prevTemplate,
        files: updatedFileList,
      }));
    },
    onChange({ file, fileList }) {
      if (
        file.status !== "uploading" &&
        file.status !== "removed" &&
        file.status !== "error"
      ) {
        setTemplate((prevTemplate: any) => ({
          ...prevTemplate,
          files: fileList,
        }));
      }
    },
  };

  const uploadAttachments = async (files: any) => {
    try {
      const locationName = isOrgAdmin ? "" : userInfo?.location?.locationName;

      const newFormData = new FormData();
      files.forEach((file: any) => {
        newFormData.append("files", file.originFileObj, file.name);
      });

      const response = await axios.post(
        `/api/audits/addAttachMentForAudit?realm=${realmName}&locationName=${locationName}`,
        newFormData
      );
      // setUrls(response?.data);
      // setFormData({
      //   ...formData,
      //   attachments: response?.data,
      // });
      if (response?.status === 200 || response?.status === 201) {
        return {
          isFileUploaded: true,
          urls: response?.data,
        };
      } else {
        return {
          isFileUploaded: false,
          urls: [],
        };
      }
    } catch (error) {}
  };

  const handleDeleteFile = async (url: string) => {
    try {
      const trimmedUrl = url.replace(`${process.env.REACT_APP_API_URL}`, "");
      const data = {
        path: trimmedUrl,
      };
      const response = await axios.post(`/api/audits/attachment/delete`, data);
      if (response.status === 200 || response.status === 201) {
        const updatedUrls = formData.attachments.filter(
          (item: any) => item.documentLink !== url
        );
        setFormData(() => ({
          ...formData,
          additionalInfo: { attachments: updatedUrls },
        }));
      }
    } catch (error) {
      console.log("error in deleting file", error);
    }
  };

  const actionData: any = {
    isAction: true,
    actions: [
      {
        label: "Edit",
        icon: "icon",
        handler: () => console.log("handler"),
      },
    ],
  };

  console.log("formData===>", formData);

  const handleSubmit = async () => {
    if (
      formData.title &&
      formData.owner &&
      formData.startDate &&
      formData.endDate !== ""
    ) {
      let uploadAttachement;
      if (!!template?.files && template?.files?.length > 0) {
        uploadAttachement = await uploadAttachments(template?.files);
      }

      setFormData({
        ...formData,
        additionalInfo: {
          attachments: [
            ...(formData?.additionalInfo?.attachments || []), // Keep existing attachments (if any)
            ...(uploadAttachement?.urls || []), // Append attachments from uploadAttachement (if any)
          ],
          ...activityUpdate,
        },
      });

      setUploadFileError(false);

      if (actionItemDrawer?.mode === "edit") {
        updateActionPoint(actionItemDrawer?.data?._id, {
          ...formData,
          additionalInfo: {
            attachments: [
              ...(formData?.additionalInfo?.attachments || []), // Keep existing attachments (if any)
              ...(uploadAttachement?.urls || []), // Append attachments from uploadAttachement (if any)
            ],
            activityUpdate: [
              // ...formData?.additionalInfo?.activityUpdate,
              ...activityUpdate,
            ],
          },
        }).then(async (response: any) => {
          if (response.status === 200) {
            if (moduleName === "INBOX") {
              handleCloseDrawer();
            } else {
              handleCloseModal();
              handleFetchCips();
            }
            enqueueSnackbar("Action item edited succesfully", {
              variant: "success",
            });
          } else {
            if (moduleName === "INBOX") {
              handleCloseDrawer();
            } else {
              handleCloseModal();
              handleFetchCips();
            }
            enqueueSnackbar("Error updating action item", {
              variant: "error",
            });
          }
          if (actionItemDrawer?.data?.owner?.username === userInfo.username) {
            dataSendBy();
          }
        });
      } else {
        const res = await createActionPoint({
          ...formData,
          additionalInfo: {
            attachments: uploadAttachement?.urls || [],
            activityUpdate: activityUpdate,
          },
          organizationId: organizationId,
          source: "CIP",
          year: currentYear,
          referenceId: actionItemDrawer?.data?.id,
          locationId: actionItemDrawer?.data?.location?.id,
        });
        if (actionItemDrawer?.data?.owner?.username === userInfo.username) {
          dataSendBy();
        }
        handleCloseModal();
        handleFetchCips();
      }
    } else {
      enqueueSnackbar("Please Fill Required Fields", {
        variant: "error",
      });
    }
  };

  const handleLinkClicks = async (item: any) => {
    const finalLink =
      process.env.REACT_APP_IS_OBJECT_STORAGE === "false"
        ? item?.url
        : await viewObjectStorageDoc(item?.url);
    const anchor = document.createElement("a");
    anchor.href = finalLink || "#";
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.click();
  };

  const viewObjectStorageDoc = async (link: any) => {
    const response = await axios.post(`${API_LINK}/api/documents/viewerOBJ`, {
      documentLink: link,
    });
    return response.data;
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
    <div>
      <Drawer
        title={
          matches ? (
            <div>
              {actionItemDrawer?.mode === "create"
                ? "Add Action Item"
                : "Edit Action Item"}
            </div>
          ) : (
            ""
          )
        }
        maskClosable={false}
        placement="right"
        //  open={moduleName === "INBOX" ? inboxDrawer.open : open}

        open={actionItemDrawer?.open}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{ width: "36px", height: "38px", cursor: "pointer" }}
          />
        }
        // closable={false}
        onClose={moduleName === "INBOX" ? handleCloseDrawer : handleCloseModal}
        className={classes.drawer}
        // width={}
        // width={isSmallScreen ? "85%" : "45%"}
        width={matches ? "45%" : "90%"}
        style={{ transform: "none !important" }}
        extra={
          <>
            <Space>
              <div
                style={{ display: "flex", gap: "5px", alignItems: "center" }}
              >
                <span>Status :{""}</span>
                <Switch
                  checked={formData.status}
                  style={{
                    backgroundColor: formData.status ? "#003566" : "",
                    width: "70px",
                  }}
                  disabled={buttonDisable}
                  className={classes.switch}
                  checkedChildren={"Open"}
                  unCheckedChildren={"Close"}
                  onChange={() => {
                    setFormData({
                      ...formData,
                      status: !formData.status,
                    });
                    setSwitchState(!switchState);
                  }}
                />
              </div>
              <Button
                onClick={() => {
                  handleCloseModal();
                  setFormData({});
                }}
                className={classes.cancelBtn}
                style={{
                  fontSize: smallScreen ? "14px" : "12px",
                  padding: smallScreen ? "" : "0px 5px",
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                type="primary"
                className={classes.submitBtn}
                disabled={
                  formData.title &&
                  formData.owner &&
                  formData.startDate &&
                  formData.endDate !== ""
                    ? false
                    : true
                }
                style={{
                  fontSize: smallScreen ? "14px" : "12px",
                  padding: smallScreen ? "" : "0px 5px",
                }}
              >
                Submit
              </Button>
            </Space>
          </>
        }
      >
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </div>
        ) : (
          <>
            <div
              className={classes.tabsWrapper}
              style={{ position: "relative" }}
            >
              <Form
                form={actionItemForm}
                layout="vertical"
                initialValues={{
                  title: formData?.title,
                  description: formData?.description,
                  owner: formData?.owner,
                  startDate: formData?.startDate,
                  endDate: formData?.endDate,
                  status: formData?.status,
                  additionalInfo: formData?.additionalInfo,
                }}
                rootClassName={classes.labelStyle}
                // disabled={disableFormFields}
              >
                <Row gutter={[16, 16]}>
                  <Col span={matches ? 12 : 24}>
                    <Form.Item
                      label="ActionItem: "
                      name="title"
                      rules={[
                        {
                          required: true,
                          message: "Please Enter Action Item Name!",
                        },
                        {
                          validator: validateField("text").validator,
                        },
                      ]}
                    >
                      <Input
                        name="title"
                        placeholder="Enter Action Item Name"
                        size="large"
                        onChange={(e: any) => handleInputChange(e)}
                        value={formData?.title}
                        disabled={buttonCreate}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={matches ? 12 : 24}>
                    <Form.Item
                      label="Owner: "
                      name="owner"
                      rules={[
                        {
                          required: true,
                          message: "Please select a user!",
                        },
                      ]}
                    >
                      <AutoComplete
                        suggestionList={user}
                        name={"Owner Name"}
                        keyName={"owner"}
                        formData={formData}
                        setFormData={setFormData}
                        getSuggestionList={getSuggestionListUser}
                        labelKey="username"
                        multiple={false}
                        defaultValue={formData?.owner}
                        disabled={buttonCreate}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={[16, 16]}>
                  <Col span={matches ? 12 : 24}>
                    <Form.Item
                      label="Start Date: "
                      name="startDate"
                      rules={[
                        {
                          required: true,
                          message: "Please Enter Start Date!",
                        },
                      ]}
                    >
                      <Input
                        name="startDate"
                        type="date"
                        size="large"
                        onChange={(e: any) => handleInputChange(e)}
                        value={formData?.startDate}
                        disabled={buttonCreate}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={matches ? 12 : 24}>
                    <Form.Item
                      label="Target Date: "
                      name="endDate"
                      rules={[
                        {
                          required: true,
                          message: "Please Enter Target Date!",
                        },
                      ]}
                    >
                      <Input
                        name="endDate"
                        type="date"
                        size="large"
                        onChange={(e: any) => handleInputChange(e)}
                        value={formData?.endDate}
                        disabled={buttonCreate}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col span={matches ? 20 : 24}>
                    <Form.Item
                      label="Description "
                      name="description"
                      rules={[
                        {
                          required: false,
                          message: "Please Enter description!",
                        },
                        {
                          validator: validateField("text").validator,
                        },
                      ]}
                    >
                      <TextArea
                        rows={1}
                        autoSize={{ minRows: 1, maxRows: 6 }}
                        placeholder="Enter description"
                        size="large"
                        name="description"
                        onChange={(e: any) => handleInputChange(e)}
                        value={formData?.description}
                        disabled={
                          buttonDisable || dataById?.status === "Closed"
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <ActivityUpdateTable
                  header={HeadersData}
                  fields={FieldsData}
                  data={activityUpdate}
                  setData={setActivityUpdate}
                  isAction={actionData.isAction}
                  actions={actionData.actions}
                  addFields={true}
                  label={"Add Item"}
                  buttonAction={buttonDisable}
                  dataId={dataById?.status}
                  disabled={dataById?.status === "Closed"}
                />
                <Row gutter={[16, 16]} style={{ marginBottom: "30px" }}>
                  <Col span={4}></Col>
                </Row>
                <Row
                  gutter={[16, 16]}
                  style={{ height: "auto", marginBottom: "30px" }}
                >
                  <Col span={24}>
                    <Form.Item name="uploader" style={{ display: "none" }}>
                      <Input />
                    </Form.Item>
                    <Dragger
                      name="files"
                      {...uploadProps}
                      disabled={buttonDisable || dataById?.status === "Closed"}
                    >
                      <div style={{ textAlign: "center" }}>
                        <MdInbox style={{ fontSize: "36px" }} />
                        <p className="ant-upload-text">
                          Click or drag files here to upload
                        </p>
                      </div>
                    </Dragger>
                    <Grid item sm={12} md={4}></Grid>
                    <Grid item sm={12} md={8} className={classes.formBox}>
                      {!!formData?.additionalInfo?.attachments &&
                        !!formData?.additionalInfo?.attachments?.length && (
                          <div>
                            <Typography
                              variant="body2"
                              style={{
                                marginTop: "16px",
                                marginBottom: "8px",
                              }}
                            >
                              Uploaded Files:
                            </Typography>

                            {formData?.additionalInfo?.attachments?.map(
                              (item: any, index: number) => (
                                <div
                                  key={index}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginBottom: "8px",
                                  }}
                                >
                                  <Typography
                                    className={classes.filename}
                                    onClick={() => handleLinkClicks(item)}
                                  >
                                    {/* File {index + 1} */}
                                    {item.name}
                                  </Typography>
                                  <div
                                    style={{
                                      cursor: "pointer",
                                      marginRight: "8px",
                                    }}
                                    onClick={() =>
                                      handleDeleteFile(item.documentLink)
                                    }
                                  >
                                    <MdDelete style={{ fontSize: "18px" }} />
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        )}
                    </Grid>
                  </Col>
                </Row>
              </Form>
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
};

export default ActionItemDrawer;
