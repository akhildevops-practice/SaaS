import { Tabs, Space, Button, Drawer, Modal, Radio } from "antd";
import { FormControl, InputLabel, MenuItem, Select } from "@material-ui/core";

import { useEffect, useState } from "react";
import useStyles from "../commonDrawerStyles";
import { makeStyles, useMediaQuery } from "@material-ui/core";
import axios from "../../../apis/axios.global";


import { Select as AntSelect } from "antd";

import { Form, Input, Row, Col, Upload } from "antd";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
// import { Select, MenuItem } from "@material-ui/core";
import { IconButton, TextField, Typography, Grid } from "@material-ui/core";

import { useSnackbar } from "notistack";

import { API_LINK } from "../../../config";

import getAppUrl from "../../../utils/getAppUrl";
import type { UploadProps } from "antd";
import CrossIcon from "../../../assets/icons/BluecrossIcon.svg";

import checkRoles from "../../../utils/checkRoles";

import { TableCell } from "@material-ui/core";
import { getAgendaForOwner, getMeetingById } from "apis/mrmmeetingsApi";

import { updateActionPoint } from "apis/mrmActionpoint";
import getYearFormat from "utils/getYearFormat";

import ReferencesTabMrm from "./ReferencesTabMrm";
import { useRecoilState } from "recoil";
import { referencesData } from "recoil/atom";
import { isValid, validateTitle } from "utils/validateInput";

const drawerWidth = 600;
const nestedWidth = 600;
const nestedHeight = 200;

const useStylesClass = (matches: any) =>
  makeStyles((theme) => ({
    formTextPadding: {
      paddingBottom: theme.typography.pxToRem(10),
      fontSize: theme.typography.pxToRem(14),
      color: "#003566",
      marginBottom: 0,
    },
    asterisk: {
      color: "red",
      verticalAlign: "end",
    },
    labelStyle: {
      "& .ant-input-lg": {
        border: "1px solid #dadada",
      },
      "& .ant-form-item .ant-form-item-label > label": {
        color: "#003566",
        fontWeight: "bold",
        letterSpacing: "0.8px",
      },
    },
    disabledInput: {
      "& .ant-input[disabled], & .ant-input[disabled]:not([type='textarea'])": {
        // border: "none",
        backgroundColor: "white !important",
        color: "black",
        marginBottom: 0,
      },
    },

    disabledSelect: {
      "& .ant-select-disabled .ant-select-selector": {
        backgroundColor: "white",
        background: "white !important",
        color: "black",
        // border: "none",
      },
      "& .ant-select-disabled .ant-select-selection-item": {
        color: "black",
      },
      "& .ant-select-disabled .ant-select-arrow": {
        display: "none",
      },
    },
    disabledTextField: {
      "& .MuiInputBase-root.Mui-disabled": {
        // border: "none",
        backgroundColor: "White !important",
        color: "black",
      },
    },

    disabledMultiSelect: {
      "& .ant-select-disabled.ant-select-multiple .ant-select-selector": {
        backgroundColor: "White !important",
        // border: "none",
      },
      "& .ant-select-disabled.ant-select-multiple .ant-select-selection-item": {
        color: "black",
        background: "White !important",
      },
      "& .ant-select-disabled .ant-select-arrow": {
        display: "none",
      },
    },
    label: {
      verticalAlign: "middle",
    },

    drawerPaper: {
      width: drawerWidth,
      flexShrink: 0,
      "& .MuiDrawer-paper": {
        width: drawerWidth,
        boxSizing: "border-box",
      },
    },
    textField: {
      width: "100%",
      height: "36px",
      color: "#EAECEE",
      fontSize: "14px",
      textAlign: "center",
      display: "flex",
      justifyContent: "center",
      borderRadius: "6px",
      paddingTop: "0px",
      paddingBottom: "0px",
      paddingLeft: "2px",
      paddingRight: "2px",
      "& .MuiInputBase-input": {
        fontSize: "14px",
      },
      border: "1px solid #EAECEE",
      "& .MuiInput-underline": {
        "&:before": {
          borderBottom: "none",
        },
        "&:after": {
          borderBottom: "none",
        },
        "&:hover:not(.Mui-disabled):before": {
          borderBottom: "none",
        },
      },
    },
    Dropdowm: {
      width: "100%",
      height: "35px",
      borderRadius: "3px",
      padding: "0px",
      border: "1px solid #EAECEE",
      "& .MuiInput-underline": {
        "&:before": {
          borderBottom: "none",
        },
        "&:after": {
          borderBottom: "none",
        },
        "&:hover:not(.Mui-disabled):before": {
          borderBottom: "none",
        },
      },
    },
    submitBtn: {
      backgroundColor: "#003566 !important",
      height: "36px",
      color: "#fff",
    },

    drawerPaperSub: {
      width: nestedWidth,
      height: nestedHeight,
      flexShrink: 0,
      "& .MuiDrawer-paper": {
        width: nestedWidth,
        height: nestedHeight,
        boxSizing: "border-box",
      },
    },
    documentTable: {
      "&::-webkit-scrollbar-thumb": {
        borderRadius: "10px",
        backgroundColor: "grey",
      },
    },
    tableContainer: {
      marginTop: "1%",
      maxHeight: "calc(60vh - 14vh)", // Adjust the max-height value as needed
      overflowY: "auto",
      overflowX: "hidden",
      // fontFamily: "Poppins !important",
      "& .ant-table-wrapper .ant-table.ant-table-bordered > .ant-table-container > .ant-table-summary > table > tfoot > tr > td":
        {
          borderInlineEnd: "none",
        },
      "& .ant-table-thead .ant-table-cell": {
        backgroundColor: "#E8F3F9",
        // fontFamily: "Poppins !important",
        color: "#00224E",
      },
      "& span.ant-table-column-sorter-inner": {
        color: "#00224E",
        // color: ({ iconColor }) => iconColor,
      },
      "& span.ant-tag": {
        display: "flex",
        width: "89px",
        padding: "5px 0px",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: "10px",
        color: "white",
      },
      "& .ant-table-wrapper .ant-table-thead>tr>th": {
        position: "sticky", // Add these two properties
        top: 0, // Add these two properties
        zIndex: 2,
        // padding: "12px 16px",
        fontWeight: 600,
        fontSize: "14px",
        padding: "6px 8px !important",
        // fontFamily: "Poppins !important",
        lineHeight: "24px",
      },
      "& .ant-table-tbody >tr >td": {
        // borderBottom: ({ tableColor }) => `1px solid ${tableColor}`, // Customize the border-bottom color here
        borderBottom: "black",
        padding: "4px 8px !important",
      },
      // '& .ant-table-wrapper .ant-table-container': {
      //     maxHeight: '420px', // Adjust the max-height value as needed
      //     overflowY: 'auto',
      //     overflowX: 'hidden',
      // },
      "& .ant-table-body": {
        // maxHeight: '150px', // Adjust the max-height value as needed
        // overflowY: 'auto',
        "&::-webkit-scrollbar": {
          width: "8px",
          height: "10px", // Adjust the height value as needed
          backgroundColor: "#e5e4e2",
        },
        "&::-webkit-scrollbar-thumb": {
          borderRadius: "10px",
          backgroundColor: "grey",
        },
      },
      "& tr.ant-table-row": {
        cursor: "pointer",
        transition: "all 0.1s linear",
      },
    },
    uploadSection: {
      width: matches ? "100%" : "100%", // Adjust the width as needed
      height: "100px", // Adjust the height as needed

      padding: "20px", // Adjust the padding as needed
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      "& .ant-upload-list-item-name": {
        color: "blue !important",
      },
    },
  }));

const { TextArea } = Input;
const { Dragger } = Upload;

type Props = {
  open: any;
  onClose: () => void;
  setAgendaData: any;
  agendaData: any;
  addNew: boolean;
  setFormData: any;
  formData: any;
  edit?: any;
  dataSourceFilter: any;
  actionRowData: any;
  valueById: any;
  data: any;
  year: any;
  readMode: any;
  setLoadActionPoint: any;
  handleCloseDrawer?: any;
  moduleName?: any;
  inboxDrawer?: any;
  handleEditDrawerOpen?: any;
  setMrmActionPointAdd?: any;
};

const AddActionPoint = ({
  open,
  onClose,
  setAgendaData,
  agendaData,
  addNew,
  edit,
  dataSourceFilter,
  actionRowData,
  valueById,
  data,
  year,
  readMode,
  setLoadActionPoint,
  handleCloseDrawer,
  moduleName,
  inboxDrawer,
  handleEditDrawerOpen,
  setMrmActionPointAdd,
}: Props) => {
  const matches = useMediaQuery("(min-width:786px)");
  const smallScreen = useMediaQuery("(min-width:450px)");

  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isMR = checkRoles("MR");

  const [uploadFileError, setUploadFileError] = useState<boolean>(false);
  const [firstForm] = Form.useForm();
  // const [suggestions, setSuggestions] = useState([]);
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  // const mrmStyles = useStylesMrm();
  const realmName = getAppUrl();
  const [formData, setFormData] = useState<any>({});
  const [agendaValuesFind, setagendaValuesFind] = useState<any[]>(["None"]);
  const [currentYear, setCurrentYear] = useState<any>();
  const [refsData] = useRecoilState(referencesData);
  const orgId = sessionStorage.getItem("orgId");

  const [userOptions, setUserOptions] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const [status, setStatus] = useState<boolean>(true);
  const classes = useStyles();

  const [selectDropValues, setSelectedDropValues] = useState<any>(
    actionRowData?.additionalInfo?.agenda
  );
  const [commnetValue, setCommentValue] = useState<any>();
  const [openModalForComment, setopenModalForComment] = useState(false);
  const userDetail = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const [editTrue, setEditTrue] = useState(true);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [initialFileList, setInitialFileList] = useState([]);
  // const [click, setClick] = useState<boolean>(false);
  // const [change, setChange] = useState<boolean>(false);
  const [activityDate, setActivityDate] = useState(new Date());
  const [meetingData, setMeetingData] = useState({});
  const [commentError, setCommentError] = useState("");

  const validateComment = (value: any) => {
    let error = "";
    validateTitle(null, value, (validationError) => {
      if (validationError) {
        error = validationError;
      }
    });
    return error;
  };

  useEffect(() => {
    getyear();
    getUserOptions();
    getMeetingData();
  }, []);
  useEffect(() => {
    // console.log("actionrowdata", actionRowData);
    setFormData({
      meetingId: actionRowData?.additionalInfo?.meetingId?._id,
      mrmId: actionRowData?.additionalInfo?.mrmId,
      organizationId: actionRowData?.organizationId,
      status: actionRowData?.status,
      agendaid: actionRowData?.additionalInfo?.agendaid,
      agenda: actionRowData?.additionalInfo?.agenda,
      description: actionRowData?.description,
      actionPoint: actionRowData?.title,
      owner: actionRowData?.owner,
      targetDate: actionRowData?.targetDate?.substring(0, 10),
      decisionPoint: actionRowData?.additionalInfo?.decisionPoint,
      files: actionRowData?.additionalInfo?.files,
      locationId: actionRowData?.locationId,
      assignedBy: actionRowData?.assignedBy,
      year: year,
      source: "MRM",
      referenceId: actionRowData?.referenceId,
      additionalInfo: actionRowData?.additionalInfo,
      comments: actionRowData?.comments,
    });
    firstForm.setFieldsValue({
      // _id: actionRowData._id,
      meetingId: actionRowData?.meetingId?._id,
      mrmId: actionRowData?.mrmId,
      organizationId: actionRowData?.organizationId,
      referenceId: actionRowData?.referenceId,
      assignedBy: actionRowData?.assignedBy,
      status: actionRowData?.status,
      agendaid: actionRowData?.additionalInfo?.agendaid,
      agenda: actionRowData?.additionalInfo?.agenda,
      description: actionRowData?.description,
      actionPoint: actionRowData?.title,
      owner: actionRowData?.owner,
      targetDate: actionRowData?.targetDate?.substring(0, 10),
      decisionPoint: actionRowData?.additionalInfo?.decisionPoint,
      files: actionRowData?.additionalInfo?.files,
      locationId: actionRowData?.locationId,
      year: year,
      source: "MRM",
      comments: actionRowData?.comments ? actionRowData?.comments : undefined,
    });
    setSelectedDropValues(actionRowData?.additionalInfo?.agenda);
    setFileList(actionRowData?.additionalInfo?.files);
    setInitialFileList(actionRowData?.additionalInfo?.files);
    setDrawer({
      mode: "edit",
      open: false,
      clearFields: true,
      toggle: false,
      data: { id: actionRowData?._id },
    });
    setStatus(actionRowData?.status);
  }, [actionRowData]);
  const getyear = async () => {
    const currentyear = await getYearFormat(new Date().getFullYear());
    setCurrentYear(currentyear);
  };

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    try {
      if (actionRowData) {
        getAgendaForOwner(actionRowData?.additionalInfo?.mrmId).then(
          (response: any) => {
            setagendaValuesFind(response?.data);
          }
        );
        getMeetingData();
      }
    } catch (err) {
      // enqueueSnackbar(err, {
      //   variant: "success",
      // });
    }
  }, [actionRowData]);
  const getMeetingData = async () => {
    // console.log("inside get meetingdata");
    try {
      if (actionRowData?.referenceId) {
        getMeetingById(actionRowData?.referenceId).then((response: any) => {
          // console.log("meetingdata", response?.data);
          setMeetingData(response?.data);
        });
      }
    } catch (error) {}
  };
  const handleLinkClick = async (item: any) => {
    const finalLink =
      process.env.REACT_APP_IS_OBJECT_STORAGE === "false"
        ? item?.url
        : await viewObjectStorageDoc(item?.url);
    const anchor = document.createElement("a");
    anchor.href = finalLink || "#";
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.click();
    // Your custom logic for link click goes here
    // event.preventDefault();
  };
  const viewObjectStorageDoc = async (link: any) => {
    const response = await axios.post(`${API_LINK}/api/documents/viewerOBJ`, {
      documentLink: link,
    });
    return response.data;
  };

  const handleCommentSubmit = async (value: string) => {
    if (!!value && value !== "") {
      try {
        setFormData({ ...formData, comments: value });
        enqueueSnackbar(`Note Added Successfully`, { variant: "success" });
        setEditTrue(false);
        setopenModalForComment(false);
        actionPointSubmitClose();
        //await handleSubmitForm("Send for Edit", true);
      } catch (err: any) {
        // enqueueSnackbar(`Request Failed, Code: ${err.response.status}`, {
        //   variant: "success",
        // });
      }
    } else {
      enqueueSnackbar(`Enter a closure note`, { variant: "warning" });
    }
  };
  const uploadAuditReportAttachments = async (files: any) => {
    const locationName = userDetail?.location?.locationName;
    const formDataFiles = new FormData();
    const oldData = [];
    const newData = [];

    for (const file of files) {
      if (file?.url) {
        oldData.push(file);
      } else {
        newData.push(file);
      }
    }
    newData.forEach((file: any) => {
      const fileToAdd = file.originFileObj || file;
      // console.log("fileToAdd content:", fileToAdd);
      formDataFiles.append("files", fileToAdd);
    });

    const id = "MRM";
    let res: any;
    let comdinedData;
    try {
      if (newData.length > 0) {
        res = await axios.post(
          `${API_LINK}/api/mrm/objectStore/${id}?realm=${realmName}&locationName=${locationName}`,
          formDataFiles,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            params: {
              id: id,
            },
          }
        );
      }
      if (res?.data?.length > 0) {
        comdinedData = res?.data;
      }

      if (oldData.length > 0) {
        comdinedData = oldData;
      }

      if (oldData?.length > 0 && res?.data?.length > 0) {
        comdinedData = [...res.data, ...oldData];
      }
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        // Custom alert message for 404 error
        alert(
          "Your Organization has exceeded the licensed attachments - Please reach ProcessRidge to activate additional licenses. Action Item will be saved without attachment"
        );
      } else {
        console.error("Error uploading data:", error);
        alert("An error occurred while uploading files. Please try again.");
      }
      return null;
    }
    return comdinedData;
  };
  const actionPointSubmitClose = async () => {
    // addSelectedFiles(fileList);
    const uploadAttachement =
      formData?.files?.length > 0
        ? await uploadAuditReportAttachments(formData?.files)
        : [];
    const newPayload = {
      organizationId: formData.organizationId,
      status: formData?.status,
      locationId: formData.locationId,

      year: currentYear,
      referenceId: formData?.referenceId,
      targetDate: formData?.targetDate,
      description: formData?.description,
      title: formData?.actionPoint,
      comments: formData.comments,
      source: "MRM",
      additionalInfo: {
        decisionPoint: formData.decisionPoint,
        actionPoint: formData?.actionPoint,
        agenda: formData.agenda,
        decision: formData.decisionPoint,
        files: uploadAttachement,
        meetingId: formData?.additionalInfo?.meetingId,
        mrmId: formData?.additionalInfo?.mrmId,
        activityDate: activityDate,
        meetingType: formData?.additionalInfo?.meetingType,
        meetingTypeId: formData?.additionalInfo?.meetingTypeId,
        meetingName: formData?.additionalInfo?.meetingName,
      },
      //files: fileList,
      owner: formData?.owner,
      assignedBy: formData?.assignedBy,
    };
    const isValidTitle = isValid(newPayload?.additionalInfo?.actionPoint);
    if (!isValidTitle.isValid) {
      enqueueSnackbar(
        `Please enter valid actionpoint!!${isValidTitle.errorMessage}`,
        {
          variant: "error",
        }
      );
      return;
    }
    const isValidDecision = isValid(newPayload?.additionalInfo?.decisionPoint);
    if (!isValidDecision.isValid) {
      enqueueSnackbar("Please enter valid decision!!", {
        variant: "error",
      });
      return;
    }
    if (newPayload.description) {
      const isValidDescription = isValid(newPayload?.description);
      if (!isValidDescription.isValid) {
        enqueueSnackbar("Please enter valid description!! ", {
          variant: "error",
        });
        return;
      }
    }
    // if (
    //   formData?.status === false &&
    //   (formData?.comments === "" || formData?.comments === undefined)
    // ) {
    //   enqueueSnackbar("Please Add Closure Notes", {
    //     variant: "error",
    //   });
    //   setopenModalForComment(true);
    //   return;
    // }
    if (
      newPayload.additionalInfo?.agenda &&
      newPayload.additionalInfo?.decisionPoint &&
      newPayload.additionalInfo?.actionPoint &&
      newPayload.targetDate &&
      newPayload.owner
    ) {
      updateActionPoint(actionRowData?._id, newPayload)
        .then(async (response: any) => {
          // console.log()
          try {
            let formattedReferences: any = [];
            //console.log("refsdata", refsData);
            if (refsData && refsData.length > 0) {
              formattedReferences = refsData.map((ref: any) => ({
                refId: ref.refId,
                organizationId: orgId,
                type: ref.type,
                name: ref.name,
                comments: ref.comments,
                createdBy: userDetail.firstName + " " + userDetail.lastName,
                updatedBy: null,
                link: ref.link,
                refTo: actionRowData?._id,
              }));
            }
            // console.log("refs");
            const refs = await axios.put("/api/refs/bulk-update", {
              refs: formattedReferences,
              id: actionRowData._id,
            });
            if (formData?.status === false) {
              const mail = await axios.get(
                `/api/mrm/handleMailForActionItems/${response.data?._id}`
              );
              if (mail?.status === 200) {
                enqueueSnackbar("Email sent successfully", {
                  variant: "success",
                });
                // return;
              }
            }
            //console.log("refs after update", refs);
          } catch (error) {
            enqueueSnackbar("Error creating References", {
              variant: "error",
            });
          }
          if (response.status === 200 || response.status === 201) {
            enqueueSnackbar(`Action Point Updated successfully!`, {
              variant: "success",
            });

            if (moduleName && moduleName === "INBOX") {
              handleCloseDrawer();
            } else {
              onClose();
              firstForm.resetFields();
              setUserOptions([]);
              firstForm.setFieldsValue({ owner: [] });
              // setUserOptions([]);
              setFileList([]);
              setFormData({});
              setCommentValue(undefined);

              setLoadActionPoint(true);
            }
          }
        })
        .catch((error: any) => {
          console.log("error in update", error);
          enqueueSnackbar("error updating data");
        });
    } else {
      enqueueSnackbar("Please fill all the required fields", {
        variant: "error",
      });
    }
  };

  useEffect(() => {
    firstForm.resetFields();

    // setAgendaData({
    //   agenda: "",
    //   decisionPoints: "",
    //   owner: [],
    // });

    setFileList([]);
  }, [addNew]);

  const uploadFileprops: UploadProps = {
    action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
    multiple: true,
    beforeUpload: () => false,
    onChange({ file, fileList }) {
      //setFileList(fileList);
      setFormData({
        ...formData,
        files: fileList,
      });
    },
  };

  const getUserOptions = async () => {
    await axios
      .get(`/api/riskregister/users/${userDetail?.organizationId}`)
      .then((res) => {
        //  console.log("res from users", res);
        if (res.data && res.data.length > 0) {
          const ops = res?.data?.map((obj: any) => ({
            id: obj.id,
            name: obj.username,
            avatar: obj.avatar,
            email: obj.email,
            username: obj.username,
            value: obj.id,
            label: obj.email,
            fullname: obj.firstname + " " + obj.lastname,
          }));
          setUserOptions(ops);
        } else {
          setUserOptions([]);
        }
      })
      .catch((err) => console.error(err));
  };

  const clearFile = async (data: any) => {
    try {
      // console.log("data in clearfile", data);

      if (data && data?.uid) {
        setFileList((previousFiles: any) => {
          const newFileList = previousFiles?.filter(
            (item: any) => item.uid !== data.uid
          );
          // console.log("fileList after update", newFileList);
          return newFileList;
        });

        // setFormData((prevFormData: any) => {
        //   const newAttachments = prevFormData?.additionalInfo?.files?.filter(
        //     (item: any) => item?.uid !== data?.uid
        //   );
        //   console.log("formData after clearing", newAttachments);
        //   setFileList(newAttachments);
        //   return {
        //     ...prevFormData,
        //     files: newAttachments,
        //   };
        // });

        // Assuming data.uid is a valid identifier for your file
        // let result = await axios.post(`${API_LINK}/api/mrm/attachment/delete`, {
        //   path: data.uid,
        // });
        // return result;
      }
    } catch (error) {
      console.error("Error in clearFile:", error);
      return error;
    }
  };

  const classStylse = useStylesClass(matches)();

  const [drawer, setDrawer] = useState<any>({
    mode: "edit",
    open: false,
    clearFields: true,
    toggle: false,
    data: { id: actionRowData?._id },
  });

  const tabs = [
    {
      label: "Action Point",
      key: 1,
      children: (
        <>
          <Form
            form={firstForm}
            layout="vertical"
            // onValuesChange={(changedValues, allValues) => {
            //   setFormData(allValues);
            // }}
          >
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Grid
                  item
                  sm={12}
                  md={5}
                  className={classStylse.formTextPadding}
                >
                  <strong>
                    <span className={classStylse.asterisk}>*</span>{" "}
                    <span className={classStylse.label}>Agenda: </span>
                  </strong>
                </Grid>
                <Form.Item
                  // label="Agenda"
                  name="agenda"
                  // tooltip="This is a required field"
                  rules={[{ required: true, message: "Please Select agenda!" }]}
                  className={classes.disabledInput}
                >
                  {/* {isGeneralUser ? ( */}
                  <>
                    <Input
                      value={actionRowData?.additionalInfo?.agenda}
                      defaultValue={actionRowData?.additionalInfo?.agenda}
                      disabled={true}
                    />
                  </>
                  {/* ) : ( */}
                  <></>
                  {/* )} */}
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Grid
                  item
                  sm={12}
                  md={5}
                  className={classStylse.formTextPadding}
                >
                  <strong>
                    <span className={classStylse.asterisk}>*</span>{" "}
                    <span className={classStylse.label}>Decision Points: </span>
                  </strong>
                </Grid>
                <Form.Item
                  // label="Decision Points"
                  name="decisionPoint"
                  // tooltip="This is a required field"
                  rules={[
                    { required: false, message: "Please add decision points!" },
                  ]}
                  className={classes.disabledInput}
                  style={{ marginBottom: 0 }}
                >
                  <TextArea
                    autoSize={{ minRows: 4 }}
                    value={formData?.additionalInfo?.decisionPoint}
                    disabled={true}
                    name="decisionPoint"
                    // onChange={(e: any) => {
                    //   handleChange(e);
                    // }}

                    defaultValue={formData?.decisionPoint}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Grid
                  item
                  sm={12}
                  md={5}
                  className={classStylse.formTextPadding}
                >
                  <strong>
                    <span className={classStylse.asterisk}>*</span>{" "}
                    <span className={classStylse.label}>Action Item: </span>
                  </strong>
                </Grid>
                <Form.Item
                  // label="Action Point"
                  name="actionPoint"
                  // tooltip="This is a required field"
                  rules={[{ validator: validateTitle }]}
                  className={classes.disabledInput}
                >
                  <TextArea
                    autoSize={{ minRows: 2 }}
                    value={formData?.actionPoint}
                    disabled={true}
                    name="actionPoint"
                    onChange={(e: any) => {
                      handleChange(e);
                    }}
                    defaultValue={formData?.actionPoint}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Grid
                  item
                  sm={12}
                  md={6}
                  className={classStylse.formTextPadding}
                >
                  <strong>
                    <span className={classStylse.asterisk}>*</span>{" "}
                    <span className={classStylse.label}>
                      Responsible Person:
                    </span>
                  </strong>
                </Grid>
                <Form.Item
                  // label="Owner"
                  name="owner"
                  // tooltip="This is a required field"

                  rules={[{ required: true, message: "Please Select Owner!" }]}
                >
                  <AntSelect
                    showSearch
                    placeholder="Select Owner(s)"
                    style={{
                      width: "100%",
                      fontSize: "12px", // Reduce font size for selected items
                    }}
                    mode="multiple"
                    options={userOptions || []}
                    onChange={(selectedAttendees: any) => {
                      const selectedUsers = selectedAttendees
                        ?.map((userId: any) =>
                          userOptions?.find(
                            (user: any) => user.value === userId
                          )
                        )
                        .filter(Boolean);

                      setFormData({
                        ...formData,
                        owner: selectedUsers || [], // Ensure that an empty array is set if no attendees are selected
                      });
                    }}
                    size="large"
                    defaultValue={formData?.owner || []} // Set default value to an empty array if no attendees are selected
                    filterOption={(input: any, option: any) =>
                      option?.label
                        ?.toLowerCase()
                        .indexOf(input?.toLowerCase()) >= 0
                    }
                    // disabled={readStatus}
                    listHeight={200}
                  />
                </Form.Item>
              </Col>
              <Col span={10}>
                <Grid
                  item
                  sm={12}
                  md={4}
                  className={classStylse.formTextPadding}
                >
                  <strong>
                    <span className={classStylse.asterisk}>*</span>
                    <span className={classStylse.label}>Target Date: </span>
                  </strong>
                </Grid>
                <Form.Item
                  // label="Due Date: "
                  name="targetDate"
                  rules={[{ required: true, message: "Please Select Date!" }]}
                  className={classes.disabledTextField}
                >
                  <TextField
                    name="targetDate"
                    type="date"
                    className={classStylse.textField}
                    value={formData?.targetDate}
                    disabled={readMode}
                    onChange={(e) => {
                      handleChange(e);
                    }}
                    defaultValue={formData?.targetDate?.substring(0, 10)}
                    style={{
                      backgroundColor: readMode === true ? "white" : "#F5F5F5",
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={16}>
                <Form.Item
                  // name="fileList"
                  help={uploadFileError ? "Please upload a file!" : ""}
                  validateStatus={uploadFileError ? "error" : ""}
                  style={{ marginBottom: "-10px" }}
                >
                  <Dragger
                    accept=".pdf,.png,.jpeg,.jpg,.docx,.bmp,.tif,.tiff,.webp"
                    name="fileList"
                    {...uploadFileprops}
                    className={`${classStylse.uploadSection} ant-upload-drag-container`}
                    showUploadList={false}
                    fileList={formData?.files}
                    multiple
                    // disabled={formData.status === "CA PENDING"}
                  >
                    {/* <p className="ant-upload-drag-icon">
                <InboxIcon />
              </p> */}
                    <p className="ant-upload-text">Select Files</p>
                  </Dragger>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              {uploadLoading ? (
                <div>Please wait while documents get uploaded</div>
              ) : (
                formData?.files &&
                formData?.files?.length > 0 &&
                formData?.files?.map((item: any) => (
                  <div
                    style={{
                      display: "flex",
                      marginLeft: "10px",
                      alignItems: "center",
                    }}
                    key={item.uid}
                  >
                    <Typography
                      className={classes.filename}
                      onClick={() => handleLinkClick(item)}
                    >
                      {item?.name}
                    </Typography>

                    <IconButton
                      onClick={() => {
                        // console.log("item click");
                        clearFile(item);
                      }}
                    >
                      <img src={CrossIcon} alt="" />
                    </IconButton>
                  </div>
                ))
              )}
            </Row>
            {formData?.comments && (
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Grid
                    item
                    sm={12}
                    md={5}
                    className={classStylse.formTextPadding}
                  >
                    <strong>
                      <span className={classStylse.label}>Closure Notes: </span>
                    </strong>
                  </Grid>

                  <TextArea
                    autoSize={{ minRows: 2 }}
                    value={formData?.comments}
                    // name="statuscomment"
                    disabled={true}
                    onChange={(e: any) => {
                      handleChange(e);
                    }}
                    defaultValue={formData?.comments}
                  />
                </Col>
              </Row>
            )}
          </Form>
        </>
      ),
    },
    {
      label: "References",
      key: 3,
      children: (
        <div style={{ position: "absolute" }}>
          <ReferencesTabMrm drawer={drawer} readMode={readMode} />
        </div>
      ),
    },
  ];
  const handleClose = async () => {
    firstForm.resetFields();
    firstForm.setFieldsValue({ owner: [] });
    // setUserOptions([]);
    setFileList([]);
    setFormData({});

    setLoadActionPoint(true);

    setStatus(true);
    onClose();
  };
  // for mobile tab select design

  const [selectedValue, setSelectedValue] = useState("ActionPoint");
  // console.log("selectedValue", selectedValue);
  const handleDataChange = (e: any) => {
    setSelectedValue(e.target.value);
  };
  // console.log("formdata", formData);
  return (
    <Drawer
      open={moduleName === "INBOX" ? inboxDrawer.open : open}
      onClose={moduleName === "INBOX" ? handleCloseDrawer : handleClose}
      placement="right"
      title={
        matches ? (
          <div>{readMode === true ? "Action Point" : "Edit Action Point"}</div>
        ) : (
          ""
        )
      }
      width={matches ? "50%" : "90%"}
      closeIcon={
        <img
          src={CloseIconImageSvg}
          alt="close-drawer"
          style={{ width: "36px", height: "38px", cursor: "pointer" }}
        />
      }
      maskClosable={false}
      headerStyle={{ backgroundColor: "#E8F3F9", color: "black" }}
      extra={
        <TableCell>
          <Space
            style={{
              display: "flex",
              flexDirection: smallScreen ? "row" : "column",
            }}
          >
            <div style={{ display: smallScreen ? "flex-end" : "flex" }}>
              <a
                href="#"
                style={{
                  textDecoration: "underline",
                  color: "black",
                  fontFamily: "bold",
                  fontSize: "14px",
                }}
                onClick={(e) => {
                  e.preventDefault(); // Prevent the default behavior of the anchor tag
                  handleEditDrawerOpen(meetingData, "ReadOnly");
                }}
              >
                Click to view MoM
              </a>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {readMode === false && (
                <Button
                  className={classes.submitBtn}
                  type="primary"
                  onClick={() => {
                    actionPointSubmitClose();
                  }}
                  style={{
                    fontSize: smallScreen ? "14px" : "12px",
                    padding: smallScreen ? "4px 15px" : "2px 10px",
                  }}
                >
                  Update
                </Button>
              )}
            </div>
          </Space>
        </TableCell>
      }
    >
      {/* <div style={{ display: "grid", gap: "5px" }}> */}
      <div className={classes.tabsWrapper} style={{ padding: "10px" }}>
        {matches ? (
          <div style={{ display: "grid", gap: "5px" }}>
            <div
              className={classes.tabsWrapper}
              style={{ position: "relative" }}
            >
              <Tabs
                type="card"
                items={tabs as any}
                animated={{ inkBar: true, tabPane: true }}
                // tabBarStyle={{backgroundColor : "green"}}
              />

              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  padding: "10px",
                  display: "flex",
                  flexDirection: "row",
                  gap: "10px",
                  alignItems: "center",
                }}
              >
                <div>Action Item Status:</div>
                <Radio.Group
                  value={formData.status}
                  disabled={readMode}
                  onChange={(e) => {
                    setFormData({ ...formData, status: e.target.value });
                    if (e.target?.value === false) {
                      setShowReasonModal(true);

                      setopenModalForComment(true);
                    }
                  }}
                >
                  <Radio value={true}>Open</Radio>
                  <Radio value={false}>Closed</Radio>
                </Radio.Group>
              </div>
              {showReasonModal && (
                <div>
                  <Modal
                    title={
                      <>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "2px",
                          }}
                        >
                          Enter Closure Notes ?
                        </div>
                        <div style={{ paddingTop: "10px" }}>
                          <TextArea
                            rows={4}
                            onChange={(e) => {
                              const value = e.target.value;
                              const error = validateComment(value);

                              if (error) {
                                setCommentError(error); // Set error if validation fails
                              } else {
                                setCommentError(""); // Clear error if validation passes
                                setCommentValue(value); // Update comment value
                              }
                            }}
                            value={commnetValue}
                          ></TextArea>
                          {commentError && (
                            <div style={{ color: "red" }}>{commentError}</div>
                          )}{" "}
                        </div>
                      </>
                    }
                    // icon={<ErrorIcon />}
                    open={openModalForComment}
                    onOk={() => setopenModalForComment(false)}
                    onCancel={() => {
                      // setOpenModal(false);
                      setopenModalForComment(false);
                    }}
                    footer={[
                      <Button
                        key="submit"
                        type="primary"
                        style={{ backgroundColor: "#003059" }}
                        onClick={() => {
                          setopenModalForComment(false);
                        }}
                      >
                        Cancel
                      </Button>,
                      <Button
                        key="submit"
                        type="primary"
                        style={{ backgroundColor: "#003059" }}
                        disabled={readMode}
                        onClick={async () => {
                          await handleCommentSubmit(commnetValue);
                        }}
                      >
                        Submit
                      </Button>,
                    ]}
                    // okText="Yes"
                    okType="danger"
                    // cancelText="No"
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <FormControl
              variant="outlined"
              size="small"
              fullWidth
              //  className={classes.formControl}
              style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <InputLabel>Menu List</InputLabel>
              <Select
                label="Menu List"
                value={selectedValue}
                onChange={handleDataChange}
              >
                <MenuItem value={"ActionPoint"}>
                  <div
                    style={{
                      backgroundColor:
                        selectedValue === "ActionPoint" ? "#3576BA" : "white",
                      textAlign: "center",
                      padding: "5px 10px",
                      borderRadius: "5px",
                      color:
                        selectedValue === "ActionPoint" ? "white" : "black",
                    }}
                  >
                    {" "}
                    Action Point
                  </div>
                </MenuItem>

                <MenuItem value={"Reference"}>
                  <div
                    style={{
                      backgroundColor:
                        selectedValue === "Reference" ? "#3576BA" : "white",
                      textAlign: "center",
                      padding: "5px 10px",
                      borderRadius: "5px",
                      color: selectedValue === "Reference" ? "white" : "black",
                    }}
                  >
                    References
                  </div>
                </MenuItem>
              </Select>
            </FormControl>
          </div>
        )}

        {matches ? (
          ""
        ) : (
          <div style={{ marginTop: "15px" }}>
            {selectedValue === "ActionPoint" ? (
              <div>
                <Form
                  form={firstForm}
                  layout="vertical"
                  onValuesChange={(changedValues, allValues) => {
                    setFormData(allValues);
                  }}
                >
                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <Grid
                        item
                        sm={12}
                        md={5}
                        className={classStylse.formTextPadding}
                      >
                        <strong>
                          <span className={classStylse.asterisk}>*</span>{" "}
                          <span className={classStylse.label}>Agenda: </span>
                        </strong>
                      </Grid>
                      <Form.Item
                        // label="Agenda"
                        name="agenda"
                        // tooltip="This is a required field"
                        rules={[
                          { required: true, message: "Please Select agenda!" },
                        ]}
                        className={classes.disabledInput}
                      >
                        {/* {isGeneralUser ? ( */}
                        <>
                          <Input
                            value={actionRowData?.additionalInfo?.agenda}
                            defaultValue={actionRowData?.additionalInfo?.agenda}
                            disabled={readMode}
                          />
                        </>
                        {/* ) : ( */}
                        <></>
                        {/* )} */}
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <Grid
                        item
                        sm={12}
                        md={5}
                        className={classStylse.formTextPadding}
                      >
                        <strong>
                          <span className={classStylse.asterisk}>*</span>{" "}
                          <span className={classStylse.label}>
                            Decision Points:{" "}
                          </span>
                        </strong>
                      </Grid>
                      <Form.Item
                        // label="Decision Points"
                        name="decisionPoint"
                        // tooltip="This is a required field"
                        rules={[
                          {
                            required: false,
                            message: "Please add decision points!",
                          },
                        ]}
                        className={classes.disabledInput}
                        style={{ marginBottom: 0 }}
                      >
                        <TextArea
                          autoSize={{ minRows: 4 }}
                          value={formData?.additionalInfo?.decisionPoint}
                          disabled={true}
                          name="decisionPoint"
                          onChange={(e: any) => {
                            handleChange(e);
                          }}
                          defaultValue={formData?.decisionPoint}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <Grid
                        item
                        sm={12}
                        md={5}
                        className={classStylse.formTextPadding}
                      >
                        <strong>
                          <span className={classStylse.asterisk}>*</span>{" "}
                          <span className={classStylse.label}>
                            Action Item:{" "}
                          </span>
                        </strong>
                      </Grid>
                      <Form.Item
                        // label="Action Point"
                        name="actionPoint"
                        // tooltip="This is a required field"
                        rules={[
                          {
                            required: true,
                            message: "Please add action points!",
                          },
                        ]}
                        className={classes.disabledInput}
                      >
                        <TextArea
                          autoSize={{ minRows: 2 }}
                          value={formData?.actionPoint}
                          disabled={readMode}
                          name="actionPoint"
                          onChange={(e: any) => {
                            handleChange(e);
                          }}
                          defaultValue={formData?.actionPoint}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={[16, 16]}>
                    <Col span={matches ? 12 : 24}>
                      <Grid
                        item
                        sm={12}
                        md={6}
                        className={classStylse.formTextPadding}
                      >
                        <strong>
                          <span className={classStylse.asterisk}>*</span>{" "}
                          <span className={classStylse.label}>
                            Responsible Person:
                          </span>
                        </strong>
                      </Grid>
                      <Form.Item
                        // label="Owner"
                        name="owner"
                        // tooltip="This is a required field"

                        rules={[
                          { required: true, message: "Please Select Owner!" },
                        ]}
                      >
                        <AntSelect
                          showSearch
                          placeholder="Select Owner(s)"
                          style={{
                            width: "100%",
                            fontSize: "12px", // Reduce font size for selected items
                          }}
                          mode="multiple"
                          options={userOptions || []}
                          onChange={(selectedAttendees: any) => {
                            const selectedUsers = selectedAttendees
                              ?.map((userId: any) =>
                                userOptions?.find(
                                  (user: any) => user.value === userId
                                )
                              )
                              .filter(Boolean);

                            setFormData({
                              ...formData,
                              owner: selectedUsers || [], // Ensure that an empty array is set if no attendees are selected
                            });
                          }}
                          size="large"
                          defaultValue={formData?.owner || []} // Set default value to an empty array if no attendees are selected
                          filterOption={(input: any, option: any) =>
                            option?.label
                              ?.toLowerCase()
                              .indexOf(input?.toLowerCase()) >= 0
                          }
                          // disabled={readStatus}
                          listHeight={200}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={matches ? 10 : 24}>
                      <Grid
                        item
                        sm={12}
                        md={4}
                        className={classStylse.formTextPadding}
                      >
                        <strong>
                          <span className={classStylse.asterisk}>*</span>
                          <span className={classStylse.label}>Due Date: </span>
                        </strong>
                      </Grid>
                      <Form.Item
                        // label="Due Date: "
                        name="targetDate"
                        rules={[
                          { required: true, message: "Please Select Date!" },
                        ]}
                        className={classes.disabledTextField}
                      >
                        <TextField
                          name="targetDate"
                          type="date"
                          className={classStylse.textField}
                          value={formData?.targetDate}
                          disabled={readMode}
                          onChange={(e) => {
                            handleChange(e);
                          }}
                          defaultValue={formData?.targetDate?.substring(0, 10)}
                          style={{
                            backgroundColor:
                              readMode === true ? "white" : "#F5F5F5",
                          }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <Grid
                        item
                        sm={12}
                        md={5}
                        className={classStylse.formTextPadding}
                      >
                        <strong>
                          {/* <span className={classStylse.asterisk}>*</span>{" "} */}
                          <span className={classStylse.label}>
                            Details of action point:{" "}
                          </span>
                        </strong>
                      </Grid>
                      <Form.Item
                        // label="Description"
                        name="description"
                        // tooltip="This is a required field"
                        // rules={[
                        //   {
                        //     required: false,
                        //     message: "Please add action point description!",
                        //   },
                        // ]}
                        className={classes.disabledInput}
                      >
                        <TextArea
                          autoSize={{ minRows: 2 }}
                          value={formData?.description}
                          name="description"
                          disabled={readMode}
                          onChange={(e: any) => {
                            handleChange(e);
                          }}
                          defaultValue={formData?.description}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={[16, 16]}>
                    <Col span={16}>
                      <Form.Item
                        // name="fileList"
                        help={uploadFileError ? "Please upload a file!" : ""}
                        validateStatus={uploadFileError ? "error" : ""}
                        style={{ marginBottom: "-10px" }}
                      >
                        <Dragger
                          accept=".pdf,.png,.jpeg,.jpg,.docx,.bmp,.tif,.tiff,.webp"
                          name="fileList"
                          {...uploadFileprops}
                          className={`${classStylse.uploadSection} ant-upload-drag-container`}
                          showUploadList={false}
                          fileList={formData?.files}
                          multiple
                          // disabled={formData.status === "CA PENDING"}
                        >
                          {/* <p className="ant-upload-drag-icon">
                <InboxIcon />
              </p> */}
                          <p className="ant-upload-text">Select Files</p>
                        </Dragger>
                      </Form.Item>
                    </Col>
                    {/* <Col span={24}>
                <Tooltip title="Upload files">
                  <Button
                    type="primary"
                    href="#"
                    onClick={() => {
                      setClick(true);
                      addSelectedFiles(fileList);
                    }}
                    className={classes.submitBtn}
                    style={{
                      display: "flex",
                      textAlign: "center",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    Upload Files
                  </Button>
                </Tooltip>
              </Col> */}
                    {/* <Col span={24}>
          <strong>
            <span
              style={{
                color: "red",
                fontSize: "10px",
              }}
            >
              {!!fileList.length
                ? "!!Click on Upload files button to upload"
                : ""}
            </span>
          </strong>
        </Col> */}
                  </Row>
                  <Row>
                    {uploadLoading ? (
                      <div>Please wait while documents get uploaded</div>
                    ) : (
                      formData?.files &&
                      formData?.files?.length > 0 &&
                      formData?.files?.map((item: any) => (
                        <div
                          style={{
                            display: "flex",
                            marginLeft: "10px",
                            alignItems: "center",
                          }}
                          key={item.uid}
                        >
                          <Typography
                            className={classes.filename}
                            onClick={() => handleLinkClick(item)}
                          >
                            {item?.name}
                          </Typography>

                          <IconButton
                            onClick={() => {
                              // console.log("item click");
                              clearFile(item);
                            }}
                          >
                            <img src={CrossIcon} alt="" />
                          </IconButton>
                        </div>
                      ))
                    )}
                  </Row>
                  {formData.comments && (
                    <Row gutter={[16, 16]}>
                      <Col span={24}>
                        <Grid
                          item
                          sm={12}
                          md={5}
                          className={classStylse.formTextPadding}
                        >
                          <strong>
                            <span className={classStylse.label}>
                              Closure Notes:{" "}
                            </span>
                          </strong>
                        </Grid>

                        <TextArea
                          autoSize={{ minRows: 2 }}
                          value={formData?.comments}
                          // name="statuscomment"
                          disabled={true}
                          onChange={(e: any) => {
                            handleChange(e);
                          }}
                          defaultValue={formData?.comments}
                        />
                      </Col>
                    </Row>
                  )}
                </Form>
              </div>
            ) : (
              ""
            )}

            {selectedValue === "Reference" ? (
              <div style={{ marginTop: "15px" }}>
                <ReferencesTabMrm drawer={drawer} readMode={readMode} />
              </div>
            ) : (
              ""
            )}
          </div>
        )}
      </div>
      {/* </div> */}
    </Drawer>
  );
};

export default AddActionPoint;
