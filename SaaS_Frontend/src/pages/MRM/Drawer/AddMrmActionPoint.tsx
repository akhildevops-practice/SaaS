import {
  Tabs,
  Space,
  Button,
  Drawer,
  Select,
  Radio,
  Table,
} from "antd";

import { useEffect, useState } from "react";
import useStyles from "../commonDrawerStyles";
import { makeStyles, useMediaQuery } from "@material-ui/core";
import axios from "../../../apis/axios.global";

import { Form, Input, Row, Col, Upload } from "antd";

import { Select as AntSelect } from "antd";
import { MenuItem } from "@material-ui/core";
import { IconButton, TextField, Typography, Grid } from "@material-ui/core";

//notistack
import { useSnackbar } from "notistack";

import { API_LINK } from "../../../config";

import getAppUrl from "../../../utils/getAppUrl";
import type { UploadProps } from "antd";
import CrossIcon from "../../../assets/icons/BluecrossIcon.svg";

import { TableCell } from "@material-ui/core";
import { getAgendaDecisionForOwner } from "apis/mrmmeetingsApi";

import { createActionPoint } from "apis/mrmActionpoint";
import getYearFormat from "utils/getYearFormat";
import ReferencesTabMrm from "./ReferencesTabMrm";

import { useRecoilState, useResetRecoilState } from "recoil";
import { referencesData } from "recoil/atom";

import CloseIconImageSvg from "assets/documentControl/Close.svg";
import { isValid, validateTitle } from "utils/validateInput";
const drawerWidth = 800;
const nestedWidth = 600;
const nestedHeight = 200;

const useStylesClass = makeStyles((theme) => ({
  formTextPadding: {
    paddingBottom: theme.typography.pxToRem(10),
    fontSize: theme.typography.pxToRem(14),
    color: "#003566",
  },
  disabledInput: {
    "& .ant-input[disabled], & .ant-input[disabled]:not([type='textarea'])": {
      border: "none",
      backgroundColor: "white",
      color: "black",
    },
  },
  submitBtn: {
    backgroundColor: "#003566 !important",
    height: "36px",
    color: "#fff",
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
  year: any;
  setLoadActionPoint: any;
  setMrmActionPointAdd: any;
};

const AddActionPoint = ({
  open,
  onClose,
  setAgendaData,
  agendaData,
  addNew,
  edit,
  dataSourceFilter,
  year,
  setLoadActionPoint,
  setMrmActionPointAdd,
}: Props) => {
  const [uploadFileError, setUploadFileError] = useState<boolean>(false);
  const [firstForm] = Form.useForm();

  const [fileList, setFileList] = useState<any[]>([]);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);

  const realmName = getAppUrl();
  const [formData, setFormData] = useState<any>({});
  const [agendaValuesFind, setagendaValuesFind] = useState<any>([]);
  const [currentYear, setCurrentYear] = useState<any>();
  const [refsData] = useRecoilState(referencesData);
  const resetFindings = useResetRecoilState(referencesData);
  const orgId = sessionStorage.getItem("orgId");

  const [userOptions, setUserOptions] = useState([]);
  const [status, setStatus] = useState<boolean>(true);
  const matches = useMediaQuery("(min-width:786px)");
  const classes = useStyles();

  const { enqueueSnackbar } = useSnackbar();
  const userDetail = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const [activityDate, setActivityDate] = useState(new Date());

  const [addedActionItems, setAddedActionItems] = useState<any[]>([]);
  const [filteredActionItems, setFilteredActionItems] = useState([]);
  useEffect(() => {
    getyear();
    getUserOptions();
  }, []);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    getyear();
    getUserOptions();
    if (dataSourceFilter) {
      setFormData({
        meetingId: dataSourceFilter?._id,
        mrmId: dataSourceFilter?.meetingSchedule?._id,
        organizationId: dataSourceFilter?.meetingSchedule?.organizationId,
        status: status,
        locationId: dataSourceFilter?.meetingSchedule?.unitId,
        currentYear: currentYear,
        year: year,
        // owner: [],
      });
    }
  }, [dataSourceFilter]);

  const getyear = async () => {
    const currentyear = await getYearFormat(new Date().getFullYear());
    // console.log("curent year in ap", currentyear);
    setCurrentYear(currentyear);
  };

  useEffect(() => {
    if (dataSourceFilter) {
      getAgendaDecisionForOwner(
        dataSourceFilter?.meetingSchedule?._id,
        dataSourceFilter?._id
      ).then((response: any) => {
        setagendaValuesFind(response?.data);
      });
      // console.log("agendadecisionresult", agendaValuesFind);
    }
  }, [dataSourceFilter]);

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
  // console.log("dataSourceFilter in add action point", dataSourceFilter);
  // const createActionPointSubmit = async () => {
  //   // addSelectedFiles(fileList);
  //   let uploadAttachement =
  //     formData?.files?.length > 0
  //       ? await uploadAuditReportAttachments(formData?.files)
  //       : [];
  //   const newPayload = {
  //     // ...formData,
  //     //meetingId: dataSourceFilter?._id,
  //     // mrmId: dataSourceFilter?.meetingSchedule?._id,
  //     organizationId: dataSourceFilter?.meetingSchedule?.organizationId,
  //     status: status,
  //     // entityId: userDetail.entityId,
  //     locationId: dataSourceFilter?.meetingSchedule?.unitId,
  //     entityId: dataSourceFilter?.meetingSchedule?.entityId,
  //     //currentYear: currentYear,
  //     year: currentYear,
  //     referenceId: dataSourceFilter?._id,
  //     targetDate: formData?.targetDate,
  //     description: formData?.description,
  //     title: formData?.actionPoint,
  //     source: "MRM",
  //     additionalInfo: {
  //       // ...formData,
  //       decisionPoint: formData?.decisionPoint,
  //       actionPoint: formData?.actionPoint,
  //       agenda: formData.agenda,
  //       decision: formData.decisionPoint,
  //       agendaid: formData?.agendaid,
  //       files: uploadAttachement,
  //       meetingId: dataSourceFilter._id,
  //       meetingName: dataSourceFilter?.meetingName,
  //       mrmId: dataSourceFilter?.meetingSchedule?._id,
  //       activityDate: activityDate,
  //       meetingType: dataSourceFilter?.meetingType?.name,
  //       meetingTypeId: dataSourceFilter?.meetingType?._id,
  //     },
  //     //files: fileList,
  //     owner: formData?.owner,
  //     assignedBy: userDetail?.id,
  //   };
  //   // console.log("click", formData?.agenda);
  //   // if (click === false && change === true) {
  //   //   enqueueSnackbar("Please Click on Upload Files to Submit", {
  //   //     variant: "error",
  //   //   });
  //   //   return;
  //   // }
  //   const isValidTitle = isValid(newPayload?.additionalInfo?.actionPoint);
  //   if (!isValidTitle.isValid) {
  //     enqueueSnackbar(
  //       `Please enter valid actionpoint${isValidTitle.errorMessage}`,
  //       {
  //         variant: "error",
  //       }
  //     );
  //     return;
  //   }
  //   const isValidDecision = isValid(newPayload?.additionalInfo?.decisionPoint);
  //   if (!isValidDecision.isValid) {
  //     enqueueSnackbar(
  //       "Please enter valid decision!! only currency,alpahanumericals,floating point and special characters(-,/,$,+) are allowed",
  //       {
  //         variant: "error",
  //       }
  //     );
  //     return;
  //   }
  //   if (!!newPayload.description) {
  //     const isValidDescription = isValid(newPayload?.description);
  //     if (!isValidDescription.isValid) {
  //       enqueueSnackbar(
  //         "Please enter valid description!! only currency,alpahanumericals,floating point and special characters(-,/,$,+) are allowed",
  //         {
  //           variant: "error",
  //         }
  //       );
  //       return;
  //     }
  //   }
  //   if (
  //     newPayload.additionalInfo?.agenda &&
  //     newPayload.additionalInfo?.decisionPoint &&
  //     newPayload.additionalInfo?.actionPoint &&
  //     newPayload.targetDate &&
  //     newPayload.owner?.length > 0
  //   ) {
  //     createActionPoint(newPayload).then(async (response: any) => {
  //       if (response.status === 200 || response.status === 201) {
  //         try {
  //           let formattedReferences: any = [];

  //           if (refsData && refsData.length > 0) {
  //             formattedReferences = refsData.map((ref: any) => ({
  //               refId: ref.refId,
  //               organizationId: orgId,
  //               type: ref.type,
  //               name: ref.name,
  //               comments: ref.comments,
  //               createdBy: userDetail.firstName + " " + userDetail.lastName,
  //               updatedBy: null,
  //               link: ref.link,
  //               refTo: response.data._id,
  //             }));
  //           }
  //           const refs = await axios.post(
  //             "/api/refs/bulk-insert",
  //             formattedReferences
  //           );
  //           // console.log("formattedReferences", formattedReferences);
  //         } catch (error) {
  //           enqueueSnackbar("Error creating References", {
  //             variant: "error",
  //           });
  //         }
  //         try {
  //         } catch (error) {
  //           enqueueSnackbar("Error Adding Attachments", {
  //             variant: "error",
  //           });
  //         }
  //         const newActionItem = {
  //           agenda: formData.agenda,
  //           decision: formData.decisionPoint,
  //           actionPoint: formData.actionPoint,
  //           owner: formData.owner,
  //           targetDate: formData.targetDate,
  //         };
  //         setAddedActionItems((prevItems) => [...prevItems, newActionItem]);
  //         enqueueSnackbar(`Action Point Added successfully!`, {
  //           variant: "success",
  //         });
  //       }
  //       // console.log("response", response);
  //       firstForm.resetFields();
  //       firstForm.setFieldsValue({ owner: [] });
  //       // setUserOptions([]);
  //       setFileList([]);
  //       setFormData({});
  //       resetFindings();
  //       setLoadActionPoint(true);
  //     });
  //   } else {
  //     enqueueSnackbar(`Please add all the required fields!`, {
  //       variant: "error",
  //     });
  //   }
  // };
  const createActionPointSubmit = async () => {
    const uploadAttachement =
      formData?.files?.length > 0
        ? await uploadAuditReportAttachments(formData?.files)
        : [];
    const newPayload = {
      organizationId: dataSourceFilter?.meetingSchedule?.organizationId,
      status: status,
      locationId: dataSourceFilter?.meetingSchedule?.unitId,
      entityId: dataSourceFilter?.meetingSchedule?.entityId,
      year: currentYear,
      referenceId: dataSourceFilter?._id,
      targetDate: formData?.targetDate,
      description: formData?.description,
      title: formData?.actionPoint,
      source: "MRM",
      additionalInfo: {
        decisionPoint: formData?.decisionPoint,
        actionPoint: formData?.actionPoint,
        agenda: formData.agenda,
        decision: formData.decisionPoint,
        agendaid: formData?.agendaid,
        files: uploadAttachement,
        meetingId: dataSourceFilter._id,
        meetingName: dataSourceFilter?.meetingName,
        mrmId: dataSourceFilter?.meetingSchedule?._id,
        activityDate: activityDate,
        meetingType: dataSourceFilter?.meetingType?.name,
        meetingTypeId: dataSourceFilter?.meetingType?._id,
      },
      owner: formData?.owner,
      assignedBy: userDetail?.id,
    };

    // Validation logic
    const isValidTitle = isValid(newPayload?.additionalInfo?.actionPoint);
    if (!isValidTitle.isValid) {
      enqueueSnackbar(
        `Please enter valid actionpoint${isValidTitle.errorMessage}`,
        { variant: "error" }
      );
      return;
    }
    const isValidDecision = isValid(newPayload?.additionalInfo?.decisionPoint);
    if (!isValidDecision.isValid) {
      enqueueSnackbar(
        "Please enter valid decision!! only currency, alpahanumericals, floating point, and special characters(-,/,$,+) are allowed",
        { variant: "error" }
      );
      return;
    }
    if (newPayload.description) {
      const isValidDescription = isValid(newPayload?.description);
      if (!isValidDescription.isValid) {
        enqueueSnackbar(
          "Please enter valid description!! only currency, alpahanumericals, floating point, and special characters(-,/,$,+) are allowed",
          { variant: "error" }
        );
        return;
      }
    }

    if (
      newPayload.additionalInfo?.agenda &&
      newPayload.additionalInfo?.decisionPoint &&
      newPayload.additionalInfo?.actionPoint &&
      newPayload.targetDate &&
      newPayload.owner?.length > 0
    ) {
      createActionPoint(newPayload).then(async (response: any) => {
        if (response.status === 200 || response.status === 201) {
          // Formatting references
          try {
            let formattedReferences: any = [];
            if (refsData && refsData.length > 0) {
              formattedReferences = refsData.map((ref) => ({
                refId: ref.refId,
                organizationId: orgId,
                type: ref.type,
                name: ref.name,
                comments: ref.comments,
                createdBy: userDetail.firstName + " " + userDetail.lastName,
                updatedBy: null,
                link: ref.link,
                refTo: response.data._id,
              }));
            }
            const refs = await axios.post(
              "/api/refs/bulk-insert",
              formattedReferences
            );
          } catch (error) {
            enqueueSnackbar("Error creating References", { variant: "error" });
          }
          const mail = await axios.get(
            `/api/mrm/handleMailForActionItems/${response.data?._id}`
          );
          if (mail?.status === 200) {
            enqueueSnackbar("Email sent successfully", {
              variant: "success",
            });
            // return;
          }

          try {
            const actionitems = await axios.get(
              `api/mrm/getUniqueActionPoints?referenceid=${dataSourceFilter?._id}&agenda=${formData.agenda}&decision=${formData.decisionPoint}`
            );
            // Add the new action item to the state
            if (actionitems?.data) {
              setAddedActionItems(actionitems?.data);
            }
          } catch (error) {}

          enqueueSnackbar(`Action Point Added successfully!`, {
            variant: "success",
          });
        }

        firstForm.resetFields();
        firstForm.setFieldsValue({ owner: [] });
        setFileList([]);
        setFormData({});
        resetFindings();
        setLoadActionPoint(true);
      });
    } else {
      enqueueSnackbar(`Please add all the required fields!`, {
        variant: "error",
      });
    }
  };

  const handleClose = async () => {
    firstForm.resetFields();
    firstForm.setFieldsValue({ owner: [] });
    // setUserOptions([]);
    setFileList([]);
    setFormData({});
    resetFindings();
    setLoadActionPoint(true);
    // setMrmActionPointAdd(false);
    setStatus(true);
    setAddedActionItems([]);
    onClose();
  };

  const actionPointSubmitClose = async () => {
    // addSelectedFiles(fileList);
    const uploadAttachement =
      formData?.files?.length > 0
        ? await uploadAuditReportAttachments(formData?.files)
        : [];
    const newPayload = {
      ...formData,
      //meetingId: dataSourceFilter?._id,
      // mrmId: dataSourceFilter?.meetingSchedule?._id,
      organizationId: dataSourceFilter?.meetingSchedule?.organizationId,
      status: status,
      // entityId: userDetail.entityId,
      locationId: dataSourceFilter?.meetingSchedule?.unitId,
      entityId: dataSourceFilter?.meetingSchedule?.entityId,
      //currentYear: currentYear,
      year: currentYear,
      referenceId: dataSourceFilter?._id,
      targetDate: formData?.targetDate,
      description: formData?.description,
      title: formData?.actionPoint,
      source: "MRM",
      additionalInfo: {
        ...formData,
        agenda: formData.agenda,
        decision: formData.decisionPoint,
        agendaid: formData?.agendaid,
        files: uploadAttachement,
        meetingId: dataSourceFilter._id,
        meetingName: dataSourceFilter.meetingName,
        mrmId: dataSourceFilter?.meetingSchedule?._id,
        meetingType: dataSourceFilter?.meetingType?.name,
        meetingTypeId: dataSourceFilter?.meetingType?._id,
      },
      //files: fileList,
      owner: formData?.owner,
      assignedBy: userDetail?.id,
      activityDate: activityDate,
    };
    const isValidTitle = isValid(newPayload?.additionalInfo?.actionPoint);
    if (!isValidTitle.isValid) {
      enqueueSnackbar("Please enter valid actionpoint!! ", {
        variant: "error",
      });
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
        enqueueSnackbar(
          "Please enter valid description!! only currency,alpahanumericals,floating point and special characters(-,/,$,+) are allowed",
          {
            variant: "error",
          }
        );
        return;
      }
    }
    if (
      newPayload.agenda &&
      newPayload.decisionPoint &&
      newPayload.actionPoint &&
      newPayload.targetDate &&
      newPayload.owner?.length > 0
    ) {
      createActionPoint(newPayload).then(async (response: any) => {
        if (response?.status === 200 || response?.status === 201) {
          try {
            let formattedReferences: any = [];

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
                refTo: response.data._id,
              }));
            }
            const refs = await axios.post(
              "/api/refs/bulk-insert",
              formattedReferences
            );
            const mail = await axios.get(
              `/api/mrm/handleMailForActionItems/${response.data?._id}`
            );
            if (mail?.status === 200) {
              enqueueSnackbar("Email sent successfully", {
                variant: "success",
              });
              // return;
            }
            //console.log("formattedReferences", formattedReferences);
          } catch (error) {
            enqueueSnackbar("Error creating References", {
              variant: "error",
            });
          }
          enqueueSnackbar(`Action Point Added successfully!`, {
            variant: "success",
          });
        }
        onClose();
        firstForm.resetFields();
        firstForm.setFieldsValue({ owner: [] });
        setUserOptions([]);
        setFileList([]);
        setFormData({});
        resetFindings();
        setLoadActionPoint(true);
      });
    } else {
      enqueueSnackbar(`Please fill all the required!`, {
        variant: "error",
      });
    }
  };

  const onStatusChange = (checked: boolean) => {
    setFormData({ ...formData, status: status });
  };

  const uploadFileprops: UploadProps = {
    action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
    multiple: true,
    beforeUpload: () => false,
    onChange({ file, fileList }) {
      // setFileList(fileList);
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
        // console.log("res from users", res);
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
        // setFileList((previousFiles: any) => {
        //   const newFileList = previousFiles?.filter(
        //     (item: any) => item.uid !== data.uid
        //   );
        //   console.log("fileList after update", newFileList);
        //   return newFileList;
        // });

        setFormData((prevFormData: any) => {
          const newAttachments = prevFormData?.files?.filter(
            (item: any) => item?.uid !== data?.uid
          );
          // console.log("formData after clearing", newAttachments);

          return {
            ...prevFormData,
            files: newAttachments,
          };
        });

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
  const classStylse = useStylesClass();

  const [drawer, setDrawer] = useState<any>({
    mode: "create",
    open: false,
    clearFields: true,
    toggle: false,
    data: {},
  });
  const handleAgendaChange = (event: any) => {
    const selectedAgendaValue = event;
    const selectedAgendaObj = agendaValuesFind.find(
      (item: any) => item.agenda === selectedAgendaValue
    );

    setFormData((prevFormData: any) => ({
      ...prevFormData,
      agenda: selectedAgendaValue,
      agendaid: selectedAgendaObj?.id,
      status: true,
      decisionPoint: "",
    }));
  };

  const handleDecisionChange = (event: any) => {
    const selectedDecision = event;
    setFormData((prevFormData: any) => ({
      ...prevFormData,
      decisionPoint: selectedDecision,
    }));
  };

  const tabs = [
    {
      label: "Action Point",
      key: 1,
      children: (
        <div>
          <Form
            form={firstForm}
            layout="vertical"
            // onValuesChange={(changedValues, allValues) =>
            //   setFormData(allValues)
            // }
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
                  name="agenda"
                  rules={[{ required: true, message: "Please Select agenda!" }]}
                >
                  <Select
                    className={classStylse.Dropdowm}
                    placeholder="Please select key agenda"
                    value={formData.agenda}
                    onChange={handleAgendaChange}
                    style={{
                      width: "100%",
                      // paddingLeft: "10px",
                      borderBottom: "none",
                    }}
                  >
                    {Array.isArray(agendaValuesFind) &&
                      agendaValuesFind.length > 0 &&
                      agendaValuesFind.map((item, index) => (
                        <Select.Option
                          key={index}
                          value={item.agenda}
                          style={{ width: "90%" }}
                        >
                          {item.agenda}
                        </Select.Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {formData.agenda && (
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
                    name="decisionPoint"
                    rules={[{ validator: validateTitle }]}
                  >
                    <Select
                      value={formData.decisionPoint}
                      onChange={handleDecisionChange}
                      style={{
                        width: "100%",
                        // paddingLeft: "10px",
                        borderBottom: "none",
                      }}
                    >
                      {agendaValuesFind
                        .filter((item: any) => item.agenda === formData.agenda) // Filter selected agenda
                        .map((item: any) =>
                          item?.decisions?.map((decision: any, index: any) => (
                            <MenuItem key={index} value={decision.decision}>
                              {decision.decision}
                            </MenuItem>
                          ))
                        )}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            )}

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
                >
                  <TextArea
                    autoSize={{ minRows: 2 }}
                    value={formData?.actionPoint}
                    name="actionPoint"
                    onChange={(e: any) => {
                      handleChange(e);
                    }}
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
                  {/* <AutoComplete
                    suggestionList={userOptions ? userOptions : []}
                    keyName="owner"
                    labelKey="name"
                    name="owner"
                    formData={formData}
                    setFormData={setFormData}
                    getSuggestionList={getSuggestionListUser}
                    defaultValue={
                      formData?.owner?.length ? formData?.owner : []
                    }
                    //onChange={handleChangeOwners as (value: any) => void}
                    type="RA"
                  /> */}
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
              <Col span={11}>
                <Grid
                  item
                  sm={12}
                  md={5}
                  className={classStylse.formTextPadding}
                >
                  <strong>
                    <span className={classStylse.asterisk}>*</span>{" "}
                    <span className={classStylse.label}>Target Date: </span>
                  </strong>
                </Grid>
                <Form.Item
                  // label="Due Date: "
                  name="targetDate"
                  rules={[{ required: true, message: "Please Select Date!" }]}
                >
                  <TextField
                    id="date"
                    name="targetDate"
                    type="date"
                    className={classStylse.textField}
                    value={formData.targetDate}
                    onChange={(e) => {
                      handleChange(e);
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* <Row gutter={[16, 16]}>
              <Col span={24}>
                <Grid
                  item
                  sm={12}
                  md={5}
                  className={classStylse.formTextPadding}
                >
                  <strong>
                
                    <span className={classStylse.label}>
                      Details of action point:{" "}
                    </span>
                  </strong>
                </Grid>
                <Form.Item
                 
                  name="description"
                 
                  rules={[
                    {
                      validator: validateTitle,
                    },
                  ]}
                >
                  <TextArea
                    autoSize={{ minRows: 2 }}
                    value={formData?.description}
                    name="description"
                    onChange={(e: any) => {
                      handleChange(e);
                    }}
                  />
                </Form.Item>
              </Col>
            </Row> */}
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
                    className={`${classes.uploadSection} ant-upload-drag-container`}
                    showUploadList={false}
                    fileList={fileList}
                    multiple
                    // disabled={formData.status === "CA PENDING"}
                  >
                    {/* <p className="ant-upload-drag-icon">
                <InboxIcon />
              </p> */}
                    <p className="ant-upload-text">Select files</p>
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
                    <Typography className={classes.filename}>
                      <a
                        href={`${item?.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item?.name}
                      </a>
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
            {addedActionItems?.length > 0 && (
              <>
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <h4 style={{ color: "#00224e", textAlign: "center" }}>
                      Existing Action Items for the selected Agenda and Decision
                    </h4>
                  </Col>
                </Row>
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Table
                      columns={[
                        {
                          title: "Agenda",
                          key: "agenda",
                          render: (text, record) =>
                            record.additionalInfo?.agenda,
                        },
                        {
                          title: "Decision Point",
                          key: "decision",
                          render: (text, record) =>
                            record.additionalInfo?.decisionPoint,
                        },
                        {
                          title: "Action Item",
                          key: "actionPoint",
                          render: (text, record) =>
                            record.additionalInfo?.actionPoint,
                        },
                        {
                          title: "Owner",
                          key: "owner",
                          render: (text, record) => {
                            return record.owner
                              ?.map((owner: any) => owner?.fullname)
                              .join(", ");
                          },
                        },
                        {
                          title: "Target Date",
                          key: "targetDate",
                          render: (text, record) => record?.targetDate,
                        },
                      ]}
                      dataSource={addedActionItems}
                      rowKey="_id"
                      pagination={false}
                      style={{
                        borderCollapse: "collapse",
                      }}
                      components={{
                        header: {
                          cell: (props: any) => (
                            <th
                              {...props}
                              style={{
                                backgroundColor: "#e8f3f9",
                                color: "#00224e",
                                fontWeight: "bold",
                              }}
                            />
                          ),
                        },
                      }}
                    />
                  </Col>
                </Row>
              </>
            )}
          </Form>
        </div>
      ),
    },
    {
      label: "References",
      key: 3,
      children: (
        <div>
          <ReferencesTabMrm drawer={drawer} readMode={undefined} />
        </div>
      ),
    },
  ];

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      placement="right"
      title="Create Action Point"
      width={900}
      maskClosable={false}
      closeIcon={
        <img
          src={CloseIconImageSvg}
          alt="close-drawer"
          style={{ width: "36px", height: "38px", cursor: "pointer" }}
        />
      }
      headerStyle={{ backgroundColor: "#E8F3F9", color: "black" }}
      extra={
        <TableCell>
          <Space>
            <Button
              className={classes.submitBtn}
              type="primary"
              onClick={() => {
                actionPointSubmitClose();
              }}
            >
              Submit
            </Button>
            <Button
              className={classes.submitBtn}
              type="primary"
              onClick={() => {
                //addSelectedFiles(fileList);
                createActionPointSubmit();
              }}
            >
              Submit & Add
            </Button>
          </Space>
        </TableCell>
      }
    >
      <div style={{ display: "grid", gap: "5px" }}>
        <div
          className={classes.tabsWrapper}
          style={{ padding: "10px", position: "relative" }}
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
              // disabled={readSt}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
            >
              <Radio value={true}>Open</Radio>
              <Radio value={false}>Closed</Radio>
            </Radio.Group>
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default AddActionPoint;
