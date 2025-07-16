import React, { useEffect, useState } from "react";
import {
  CircularProgress,
  debounce,
  IconButton,
  makeStyles,
  TextField,
} from "@material-ui/core";
import {
  Button,
  Col,
  Descriptions,
  Drawer,
  Form,
  Input,
  Modal,
  Popover,
  Radio,
  Row,
  Select,
  Space,
} from "antd";
import useStyles from "./styles";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import TextArea from "antd/es/input/TextArea";
import {
  createDiscussionItem,
  createRiskPredictionItems,
  getAllNPDListDrop,
  updateDelayedItem,
  updateMinutesOfMeeting,
  updateRiskOldParentIdItem,
} from "apis/npdApi";
import axios from "apis/axios.global";
import { Autocomplete } from "@material-ui/lab";
import { getAllUsersApi } from "apis/npdApi";
import { useSnackbar } from "notistack";
import { generateUniqueId } from "utils/uniqueIdGenerator";
import MyEditor from "components/NPD/Editor";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import { MdClose, MdInfo,  MdStorage,} from "react-icons/md"
import EditImgIcon from "assets/documentControl/Edit.svg";
import getSessionStorage from "utils/getSessionStorage";
import { getUserInfo } from "apis/socketApi";

var typeAheadValue: string;
var typeAheadType: string;

type Props = {
  drawer?: any;
  setDrawer?: any;
  drawerDelayedType?: any;
  delayedFormData?: any;
  setDelayedFormData?: any;
  setFetchAllApiDelayedStatus?: any;
};

const useStylesDate = makeStyles((theme) => ({
  dateInput: {
    border: "1px solid #bbb",
    paddingLeft: "5px",
    paddingRight: "5px",
    borderRadius: "5px",
    "& .MuiInput-underline:before": {
      borderBottom: "none", // Remove the bottom border
    },
    "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
      borderBottom: "none", // Remove the hover border
    },
    "& .MuiInput-underline:after": {
      borderBottom: "none", // Remove the focus border
    },
  },
  autoCompleteStyles: {
    "&.ant-select-single.ant-select-show-arrow .ant-select-selection-item": {
      color: "black",
    },
    "&.css-1a9jshs-MuiInputBase-input-MuiOutlinedInput-input.Mui-disabled": {
      opacity: "1",
      color: "black",
      webkitTextFillColor: "black",
    },
    "& .Mui-disabled": {
      opacity: "1 !important", // Ensure no opacity reduction
      color: "black !important", // Ensure text remains black
      WebkitTextFillColor: "black !important", // For Safari
      backgroundColor: "#f0f0f0", // Optional: visually differentiate
    },
  },
  root: {
    "& .MuiInput-underline:before": {
      borderBottom: "none", // Remove the bottom border
    },
    "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
      borderBottom: "none", // Remove the hover border
    },
    "& .MuiInput-underline:after": {
      borderBottom: "none", // Remove the focus border
    },
    "&.ant-select-single.ant-select-show-arrow .ant-select-selection-item": {
      color: "black",
    },
    "&.css-1a9jshs-MuiInputBase-input-MuiOutlinedInput-input.Mui-disabled": {
      opacity: "1",
      color: "black",
    },
    "&.ant-drawer .ant-drawer-body": {
      padding: "14px",
    },
    "&.ant-form-item": {
      marginBottom: "12px",
    },
  },
  summaryRoot: {
    display: "flex",
    padding: "0px 16px",
    minHeight: 30,

    fontSize: "17px",
    "& .MuiAccordionSummary-content": {
      margin: 0,
    },
    "&.MuiAccordionSummary-content .Mui-expanded": {
      margin: "5px 0px",
      minHeight: "10px",
    },
    "&.MuiButtonBase-root .MuiAccordionSummary-root .Mui-expanded": {
      minHeight: "10px",
    },
    "&.MuiAccordionSummary-root": {
      minHeight: "30px",
    },
  },
  headingRoot: {
    minHeight: 30,
    "&.MuiAccordionSummary-content .Mui-expanded": {
      margin: "10px 0px",
      minHeight: "30px",
    },
    "&.MuiAccordionSummary-root.Mui-expanded": {
      minHeight: "30px",
      margin: "10px 0px",
    },
  },
  formItemRoot: {
    "&.ant-drawer .ant-drawer-body": {
      padding: "14px !important",
    },
    "&.ant-form-item": {
      marginBottom: "12px !important",
    },
    "&.ant-col ant-form-item-label": {
      padding: "0px 0px 0px !important",
    },
    "&:where(.css-dev-only-do-not-override-zg0ahe).ant-form-vertical .ant-form-item:not(.ant-form-item-horizontal) .ant-form-item-label":
      {
        padding: "0px",
      },
  },
}));

const MomInfoDelayedItemDrawerIndex = ({
  drawer,
  setDrawer,
  drawerDelayedType,
  delayedFormData,
  setDelayedFormData,
  setFetchAllApiDelayedStatus,
}: Props) => {
  const classes = useStyles();
  const classesDate = useStylesDate();
  const [investForm] = Form.useForm();
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const [npdList, setNpdList] = useState<any>([]);
  const [impactTypes, setImpactTypes] = useState<any>([]);
  const [riskTypes, setRiskTypes] = useState<any>([]);
  const [getAllUserData, setGetAllUserData] = useState<any>([]);
  const todayDate = new Date().toISOString().split("T")[0];
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const uniqueId = generateUniqueId(22);
  const [openStatus, setOpenStatus] = useState(false);
  const [riskData, setRiskData] = useState<any>([]);
  const [riskTypesHistory, setRiskTypesHistory] = useState<any>([]);
  const [pa, setPa] = useState<any>([]);
  const userDetail = getSessionStorage();
  useEffect(() => {
    getProjectAdmins();
    dropDownValueNpdList();
    getConfigData();
    getAllUsersInformation("", "");
  }, []);
  const [userInfo, setUserInfo] = useState<any>();
  const [openRiskHistory, setOpenRiskHistory] = useState(false);
  const [riskForm, setRiskForm] = useState({
    id: uniqueId,
    currentScore: delayedFormData?.riskPrediction,
    newScore: "",
    reason: "",
    status: false,
    cratedBy: userInfo?.username,
    cratedById: userInfo?.id,
    createdOn: todayDate,
  });
  useEffect(() => {
    try {
      getUserInfo()
        .then((response: any) => {
          setUserInfo(response.data);
        })
        .catch((e: any) => console.log(e));
    } catch (err) {
      console.log("err", err);
    }
  }, []);

  useEffect(() => {
    if (drawerDelayedType === "edit" || drawerDelayedType === "read") {
      investForm.setFieldsValue({
        id: delayedFormData?._id,
        npdId: delayedFormData?.npdId,
        selectedDptId: delayedFormData?.selectedDptId,
        delayedItem: delayedFormData?.delayedItem,
        delayedItemDescription: delayedFormData?.delayedItemDescription,
        criticality: delayedFormData?.criticality,
        impact: delayedFormData?.impact,
        riskPrediction: delayedFormData?.riskPrediction,
        status: delayedFormData?.status,
        report: delayedFormData?.report,
        actionPlans: delayedFormData?.actionPlans,
        actionPlansIds: delayedFormData?.actionPlansIds,
        buttonStatus: delayedFormData?.buttonStatus,
        addButtonStatus: delayedFormData?.addButtonStatus,
        pic: delayedFormData?.pic,
        targetDate: delayedFormData?.targetDate,
        notes: delayedFormData?.notes,
      });
      let newData: any = delayedFormData?.riskHistory?.reverse();

      setRiskData(newData);
    } else if (drawerDelayedType === "create") {
      investForm.setFieldsValue({
        npdId: delayedFormData?.npdId,
      });
    }
  }, [drawerDelayedType, delayedFormData]);

  const handleCloseModal = () => {
    setDrawer(false);
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const getProjectAdmins = async () => {
    const result = await axios.get(`/api/configuration`);
    console.log("result", result);
    // console.log("result?.data in reg npd nav bar", result.data);
    if (result?.data[0]?.pmUserData) {
      setPa(result?.data[0]?.pmUserData);
    }
  };

  const openRiskHistoryTable = () => {
    setOpenRiskHistory(true);
  };
  const closeRiskHistoryTable = () => {
    setOpenRiskHistory(false);
  };

  const getConfigData = async () => {
    const data = await axios.get(`/api/configuration`);
    const projectTypeData = data?.data[0]?.riskConfig[0]?.map((value: any) => {
      let data = {
        value: value?.riskScoring,
        label: `${value?.riskScoring}-${value?.riskLevel}`,
      };
      return data;
    });
    setRiskTypes(projectTypeData);
    const projectTypeDataHistory = data?.data[0]?.riskConfig[0]?.map(
      (value: any) => {
        let data = {
          value: value?.riskScoring,
          label: value?.riskScoring,
        };
        return data;
      }
    );
    setRiskTypesHistory(projectTypeDataHistory);
    const rankTypeData = data?.data[0]?.impactArea[0]?.map((value: any) => {
      let data = {
        value: value,
        lable: value,
      };
      return data;
    });
    setImpactTypes(rankTypeData);
  };

  const dropDownValueNpdList = () => {
    getAllNPDListDrop()?.then((response: any) => {
      setNpdList(response?.data);
    });
  };

  const getOptionLabel = (option: any) => {
    if (option && option?.email) {
      return option?.email;
    } else {
      return "";
    }
  };

  const handleTextChange = (e: any) => {
    getSuggestionList(e.target.value, "normal");
  };

  const getSuggestionList = (value: any, type: string) => {
    typeAheadValue = value;
    typeAheadType = type;
    debouncedSearch();
  };

  const debouncedSearch = debounce(() => {
    getAllUsersInformation(typeAheadValue, typeAheadType);
  }, 400);

  const getAllUsersInformation = (value: string, type: string) => {
    try {
      getAllUsersApi().then((response: any) => {
        setGetAllUserData(response?.data);
      });
    } catch (e) {
      console.log("error", e);
    }
  };

  const handleSubmitForm = () => {
    let payLoad = {
      ...delayedFormData,
      buttonStatus: true,
      currentVersion: true,
      riskHistory: riskData,
    };
    let dataDiscussionItem: any;
    updateDelayedItem(delayedFormData.id, payLoad).then(
      async (response: any) => {
        dataDiscussionItem = response?.data;
        if (response.status === 200 || response.status === 201) {
          // getAllMomDataTable(delayedFormData.momId);
          if (dataDiscussionItem?.criticality === "High") {
            await updateRiskOldParentIdItem(dataDiscussionItem?._id).then(
              (response: any) => {
                if (response.status === 200 || response.status === 201) {
                  let payloadRisk = {
                    npdId: dataDiscussionItem?.npdId,
                    momId: dataDiscussionItem?.momId,
                    selectedDptId: dataDiscussionItem?.selectedDptId,
                    riskType: "timeLine",
                    itemId: dataDiscussionItem?._id,
                    delayedItemGanttId: dataDiscussionItem?.delayedItemId,
                    itemType: "delayedItem",
                    itemNameDescription:
                      dataDiscussionItem?.delayedItemDescription,
                    itemName: dataDiscussionItem?.delayedItem,
                    criticality: dataDiscussionItem?.criticality,
                    impact: dataDiscussionItem?.impact,
                    riskPrediction: dataDiscussionItem?.riskPrediction,
                    status: dataDiscussionItem?.status,
                    targetDate: dataDiscussionItem?.targetDate,
                    pic: dataDiscussionItem?.pic,
                    report: dataDiscussionItem?.report,
                    riskCreatedDate: todayDate,
                    currentVersion: true,
                    riskHistory: dataDiscussionItem?.riskHistory,
                  };
                  createRiskPredictionItems(payloadRisk).then(
                    (response: any) => {
                      if (
                        response?.status === 201 ||
                        response?.status === 200
                      ) {
                        enqueueSnackbar(`Data Updated SuccessFully`, {
                          variant: "success",
                        });
                        setFetchAllApiDelayedStatus(true);
                        setDrawer(false);
                      }
                    }
                  );
                }
              }
            );
          } else {
            enqueueSnackbar(`Data Updated SuccessFully`, {
              variant: "success",
            });
            setFetchAllApiDelayedStatus(true);
            setDrawer(false);
          }
        }
      }
    );
  };

  const handleSubmitAndNew = () => {
    let payload = {
      ...delayedFormData,
      momId: delayedFormData?.momId,
      createdOn: todayDate,
      buttonStatus: true,
      addButtonStatus: true,
    };
    createDiscussionItem(payload).then((response: any) => {
      if (response?.status === 201 || response?.status === 200) {
        let payloadData = {
          npdIds: delayedFormData?.npdIds,
        };
        updateMinutesOfMeeting(delayedFormData.momId, payloadData).then(
          (response: any) => {
            if (response?.status === 201 || response?.status === 200) {
              enqueueSnackbar(`Data Saved SuccessFully`, {
                variant: "success",
              });
              setFetchAllApiDelayedStatus(true);
              investForm.setFieldsValue({
                npdId: delayedFormData?.npdId,
                selectedDptId: "",
                discussedItem: "",
                criticality: "",
                impact: [],
                riskPrediction: "",
                status: "",
                report: "",
                buttonStatus: false,
                pic: [],
                targetDate: "",
              });
              setDelayedFormData({
                ...delayedFormData,
                id: uniqueId,
                selectedDptId: "",
                discussedItem: "",
                criticality: "",
                impact: [],
                riskPrediction: "",
                status: "",
                report: "",
                actionPlans: [],
                actionPlansIds: [],
                buttonStatus: false,
                addButtonStatus: false,
                pic: [],
                targetDate: "",
              });
            }
          }
        );
      }
    });
  };

  const addRiskRow = (item: any) => {
    if (riskData?.length === 0 || riskData == undefined) {
      let data = {
        id: uniqueId,
        currentScore: delayedFormData?.riskPrediction,
        newScore: "",
        reason: "",
        status: false,
      };
      setRiskData([...riskData, data]);
    } else {
      let data = {
        id: uniqueId,
        currentScore: item,
        newScore: "",
        reason: "",
        status: false,
      };
      setRiskData([...riskData, data]);
    }
  };

  const closeModelStatus = () => {
    setOpenStatus(false);
  };
  const openModelStatus = () => {
    setOpenStatus(true);
  };
  const addValuesRiskData = (item: any, type: any, value: any) => {
    if (type === "newScore") {
      const updateData = riskData?.map((ele: any) => {
        if (ele.id === item.id) {
          return {
            ...ele,
            [type]: value,
          };
        }
        return ele;
      });
      setRiskData(updateData);
      setDelayedFormData({
        ...delayedFormData,
        riskHistory: updateData,
        riskPrediction: value,
      });
    } else {
      const updateData = riskData?.map((ele: any) => {
        if (ele.id === item.id) {
          return {
            ...ele,
            [type]: value,
          };
        }
        return ele;
      });
      setRiskData(updateData);
    }
  };

  const submitDataRow = () => {
    // console.log("submit risk data", riskForm, riskData);
    let updateData = {
      ...riskForm,
    };
    let newRiskData = Array.isArray(riskData) ? riskData : [];
    const updateDataByNew = [...newRiskData, updateData];
    // console.log("updateDataByNew", updateDataByNew);
    setRiskData(updateDataByNew);
    // const projectTypeData = data?.data[0]?.riskConfig[0]?.map((value: any) => {
    //   let data = {
    //     value: value?.riskScoring,
    //     label: `${value?.riskScoring}-${value?.riskLevel}`,
    //   };
    //   return data;
    // });
    let payLoad = {
      ...delayedFormData,
      buttonStatus: true,
      riskPrediction: riskForm?.newScore,
      riskHistory: updateDataByNew,
    };
    //set the formdata to immediately reflect on the form
    setDelayedFormData({
      ...delayedFormData,
      riskPrediction: riskForm?.newScore,
      riskHistory: updateDataByNew,
    });
    updateDelayedItem(delayedFormData?.id, payLoad).then(
      async (response: any) => {
        if (response.status === 200 || response.status === 201) {
          await updateRiskOldParentIdItem(delayedFormData?.id);
          let payloadRisk = {
            npdId: delayedFormData?.npdId,
            momId: delayedFormData?.momId,
            selectedDptId: delayedFormData?.selectedDptId,
            riskType: "timeLine",
            itemId: delayedFormData?.id,
            itemType: "delayedItem",
            itemName: delayedFormData?.delayedItem,
            itemNameDescription: delayedFormData?.delayedItemDescription,
            criticality: delayedFormData?.criticality,
            impact: delayedFormData?.impact,
            riskPrediction: riskForm?.newScore,
            status: delayedFormData?.status,
            targetDate: delayedFormData?.targetDate,
            pic: delayedFormData?.pic,
            report: delayedFormData?.report,
            riskCreatedDate: todayDate,
            currentVersion: true,
            riskHistory: updateDataByNew,
          };
          createRiskPredictionItems(payloadRisk).then((response: any) => {
            if (response?.status === 201 || response?.status === 200) {
              enqueueSnackbar(`Data Updated SuccessFully`, {
                variant: "success",
              });
              setFetchAllApiDelayedStatus(true);
              // setDrawer(false);
            }
          });
          setOpenStatus(false);
        }
      }
    );
  };

  return (
    <div>
      <div className={classes.drawer}>
        <Drawer
          title={
            drawerDelayedType === "create"
              ? "Add Delayed Item"
              : "TimeLine Risk"
          }
          placement="right"
          open={drawer}
          closeIcon={
            <img
              src={CloseIconImageSvg}
              alt="close-drawer"
              style={{ width: "30px", height: "30px", cursor: "pointer" }}
            />
          }
          // closable={false}
          onClose={handleCloseModal}
          className={classes.drawer}
          width={"45%"}
          //   rootStyle={{padding:"14px"}}
          extra={
            <div style={{ display: "flex" }}>
              <IconButton
                aria-label="more"
                aria-controls="long-menu"
                aria-haspopup="true"
                onClick={handleSubmitForm}
              >
                <Button
                  color="primary"
                  style={{
                    backgroundColor: "#003566",
                    color: "white",
                  }}
                  disabled={!pa.some((item: any) => item.id === userDetail.id)}
                >
                  Submit
                  {/* <ArrowForwardIosIcon style={{ fontSize: "14px" }} /> */}
                </Button>
              </IconButton>
              {/* <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
        >
          <MenuItem onClick={handleSubmitForm}>Submit</MenuItem>
          <MenuItem onClick={handleSubmitAndNew}>Save & Add New</MenuItem>
        </Menu> */}
            </div>
          }
        >
          {isLoading ? (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </div>
          ) : (
            <>
              <div>
                <Form
                  form={investForm}
                  layout="vertical"
                  /* other props */
                  className={classesDate.formItemRoot}
                >
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Form.Item
                        label={<span style={{ fontSize: "12px" }}>NPD: </span>}
                        name="npdId"
                        rules={[
                          {
                            required: true,
                            message: "Please Select NPD!",
                          },
                        ]}
                        style={{ marginBottom: "15px" }}
                      >
                        <Select
                          value={delayedFormData.npdId}
                          placeholder="Select Dpt"
                          style={{
                            width: "100%",
                            color: "black",
                          }}
                          onChange={(e: any) => {
                            setDelayedFormData({
                              delayedFormData: e,
                            });
                          }}
                          options={npdList}
                          disabled
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label={
                          <span style={{ fontSize: "12px" }}>Department: </span>
                        }
                        name="selectedDptId"
                        rules={[
                          {
                            required: true,
                            message: "Please Select Department!",
                          },
                        ]}
                        style={{ marginBottom: "15px" }}
                      >
                        <Select
                          value={delayedFormData?.selectedDptId}
                          placeholder="Select Dpt"
                          style={{
                            width: "100%",
                            color: "black",
                          }}
                          onChange={(e: any) => {
                            setDelayedFormData({
                              ...delayedFormData,
                              selectedDptId: e,
                            });
                          }}
                          options={delayedFormData?.dropDptValue}
                          disabled
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <Form.Item
                        label={
                          <span style={{ fontSize: "12px" }}>
                            Delayed Item Title:{" "}
                          </span>
                        }
                        name="delayedItem"
                        rules={[
                          {
                            required: true,
                            message: "Please Enter Discussed items!",
                          },
                        ]}
                        style={{ marginBottom: "15px" }}
                      >
                        <Input
                          // rows={3}
                          // maxLength={500000}
                          value={delayedFormData.delayedItem}
                          placeholder="Enter Discussion Item"
                          style={{
                            width: "100%",
                            color: "black",
                          }}
                          onChange={(e: any) => {
                            setDelayedFormData({
                              ...delayedFormData,
                              delayedItem: e.target.value,
                            });
                          }}
                          disabled
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <Form.Item
                        label={<span style={{ fontSize: "12px" }}>PIC: </span>}
                        name="pic"
                        rules={[
                          {
                            required: true,
                            message: "Please Select PIC!",
                          },
                        ]}
                        style={{ marginBottom: "15px" }}
                      >
                        <Autocomplete
                          multiple={true}
                          size="small"
                          id="tags-outlined"
                          className={classesDate.autoCompleteStyles}
                          options={getAllUserData}
                          style={{
                            width: "100%",
                            padding: "0px",
                            color: "black",
                          }}
                          getOptionLabel={getOptionLabel}
                          value={delayedFormData?.pic || []}
                          filterSelectedOptions
                          disabled
                          onChange={(e: any, value: any) => {
                            setDelayedFormData({
                              ...delayedFormData,
                              pic: value,
                            });
                            investForm.setFieldsValue({ pic: value });
                          }}
                          renderInput={(params: any) => (
                            <TextField
                              {...params}
                              variant="outlined"
                              placeholder="Select PIC"
                              size="small"
                              onChange={handleTextChange}
                              InputLabelProps={{
                                shrink: false,
                              }}
                            />
                          )}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <Form.Item
                        label={
                          <span style={{ fontSize: "12px" }}>
                            Delayed Items Description:{" "}
                          </span>
                        }
                        name="delayedItemDescription"
                        rules={[
                          {
                            required: false,
                            message: "Please Enter Discussed items!",
                          },
                        ]}
                        style={{ marginBottom: "15px" }}
                      >
                        <TextArea
                          rows={3}
                          maxLength={500000}
                          value={delayedFormData.delayedItemDescription}
                          placeholder="Enter Discussion Item Description"
                          style={{
                            width: "100%",
                            color: "black",
                          }}
                          onChange={(e: any) => {
                            setDelayedFormData({
                              ...delayedFormData,
                              delayedItemDescription: e.target.value,
                            });
                          }}
                          disabled={delayedFormData.buttonStatus}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  {/* <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Form.Item
                        label={
                          <span style={{ fontSize: "12px" }}>
                            Criticality:{" "}
                          </span>
                        }
                        name="criticality"
                        rules={[
                          {
                            required: true,
                            message: "Please Select Criticality!",
                          },
                        ]}
                        style={{ marginBottom: "15px" }}
                      >
                        <Select
                          value={delayedFormData?.criticality}
                          placeholder="Select Criticality"
                          style={{
                            width: "100%",
                            color: "black",
                          }}
                          // size="large"
                          onChange={(e: any) => {
                            if (e === "High") {
                              setDelayedFormData({
                                ...delayedFormData,
                                criticality: e,
                                report: "yes",
                              });
                            } else {
                              setDelayedFormData({
                                ...delayedFormData,
                                criticality: e,
                              });
                            }
                          }}
                          options={[
                            { value: "High", label: "High" },
                            {
                              value: "Normal",
                              label: "Normal",
                            },
                            //   { value: "Medium", label: "Medium" },
                          ]}
                          disabled={delayedFormData?.buttonStatus}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label={
                          <span style={{ fontSize: "12px" }}>Report: </span>
                        }
                        name="report"
                        rules={[
                          {
                            required: true,
                            message: "Please Select Report!",
                          },
                        ]}
                        style={{ marginBottom: "15px" }}
                      >
                        <div style={{ display: "flex" }}>
                          <Radio.Group
                            onChange={(e: any) => {
                              setDelayedFormData({
                                ...delayedFormData,
                                report: e.target.value,
                              });
                            }}
                            value={delayedFormData?.report}
                            disabled={delayedFormData?.buttonStatus}
                            style={{ display: "flex" }}
                          >
                            <Radio value={"yes"}>Yes</Radio>
                            <Radio value={"no"}>No</Radio>
                          </Radio.Group>
                        </div>
                      </Form.Item>
                    </Col>
                  </Row> */}
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Form.Item
                        label={
                          <span style={{ fontSize: "12px" }}>Impact: </span>
                        }
                        name="impact"
                        rules={[
                          {
                            required: true,
                            message: "Please Select Impact!",
                          },
                        ]}
                        style={{ marginBottom: "15px" }}
                      >
                        <Select
                          mode="multiple"
                          value={delayedFormData?.impact}
                          placeholder="Select Impact"
                          style={{
                            width: "100%",
                            color: "black",
                          }}
                          // size="large"
                          onChange={(e: any) => {
                            setDelayedFormData({
                              ...delayedFormData,
                              impact: e,
                            });
                          }}
                          options={impactTypes}
                          disabled={delayedFormData.buttonStatus}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label={
                          <span style={{ fontSize: "12px" }}>
                            Risk Prediction:{" "}
                          </span>
                        }
                        name="riskPrediction"
                        rules={[
                          {
                            required: true,
                            message: "Please Select Risk Prediction	!",
                          },
                        ]}
                        style={{ marginBottom: "15px" }}
                      >
                        <Row
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            gap: "2px",
                          }}
                        >
                          <Select
                            value={delayedFormData?.riskPrediction}
                            placeholder="Select RiskPrediction"
                            style={{
                              width: "80%",
                              color: "black",
                            }}
                            // size="large"
                            onChange={(e: any) => {
                              setDelayedFormData({
                                ...delayedFormData,
                                riskPrediction: e,
                              });
                            }}
                            options={riskTypes}
                            disabled={delayedFormData?.buttonStatus}
                          />
                          <IconButton
                            style={{ padding: "0px", margin: "0px" }}
                            onClick={() => {
                              openModelStatus();
                            }}
                          >
                            <img
                              src={EditImgIcon}
                              style={{
                                width: "17px",
                                height: "17px",
                              }}
                            />
                          </IconButton>
                          <IconButton
                            style={{ padding: "0px", margin: "0px" }}
                            onClick={() => {
                              openRiskHistoryTable();
                            }}
                          >
                            <MdStorage style={{ color: "blue" }} />
                          </IconButton>
                        </Row>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[16, 16]}>
                    {/* <Col span={12}>
                      <Form.Item
                        label={
                          <span style={{ fontSize: "12px" }}>
                            Target Date:{" "}
                          </span>
                        }
                        name="targetDate"
                        rules={[
                          {
                            required: true,
                            message: "Please Select Target Date!",
                          },
                        ]}
                        style={{ marginBottom: "15px" }}
                      >
                        <Input value={moment(delayedFormData?.targetDate).format('DD-MM-YYYY')} disabled />
                        <TextField
                          style={{
                            width: "250px",
                            height: "33px",
                          }}
                          className={classesDate.dateInput}
                          id="plan"
                          type="date"
                          value={delayedFormData?.targetDate}
                          onChange={(e: any) => {
                            setDelayedFormData({
                              ...delayedFormData,
                              targetDate: e.target.value,
                            });
                          }}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          disabled={delayedFormData.buttonStatus}
                        />
                      </Form.Item>
                    </Col> */}
                    <Col span={12}>
                      <Form.Item
                        label={
                          <span style={{ fontSize: "12px" }}>
                            Risk Status:{" "}
                          </span>
                        }
                        name="status"
                        rules={[
                          {
                            required: true,
                            message: "Please Select Status!",
                          },
                        ]}
                        style={{ marginBottom: "15px" }}
                      >
                        <div style={{ display: "flex" }}>
                          <Radio.Group
                            onChange={(e: any) => {
                              setDelayedFormData({
                                ...delayedFormData,
                                status: e.target.value,
                              });
                            }}
                            value={delayedFormData?.status}
                            disabled={delayedFormData?.buttonStatus}
                            style={{ display: "flex" }}
                          >
                            <Radio value={"Open"}>Open</Radio>
                            <Radio value={"Close"}>Close</Radio>
                          </Radio.Group>
                        </div>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <Form.Item
                        label={
                          <span style={{ fontSize: "12px" }}>Notes: </span>
                        }
                        name="notes"
                        rules={[
                          {
                            required: true,
                            message: "Please Enter Discussed items Notes!",
                          },
                        ]}
                        style={{ marginBottom: "15px" }}
                      >
                        <MyEditor
                          formData={delayedFormData}
                          setFormData={setDelayedFormData}
                          title={"delayedItemNotes"}
                          mode={delayedFormData?.buttonStatus}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </div>
            </>
          )}
        </Drawer>
      </div>
      <div>
        <Modal
          title={"Risk History"}
          open={openStatus}
          onCancel={closeModelStatus}
          footer={
            <>
              <Button
                style={{
                  color: "#fff",
                  backgroundColor: "#0E497A",
                }}
                onClick={() => {
                  submitDataRow();
                }}
              >
                Submit
              </Button>
            </>
          }
          width="900px"
          closeIcon={
            <MdClose
              style={{
                color: "#fff",
                backgroundColor: "#0E497A",
                borderRadius: "3px",
              }}
            />
          }
        >
          <div>
            {/* <Paper>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead
                    style={{
                      backgroundColor: "#E8F3F9",
                      color: "#00224E",
                    }}
                  >
                    <TableRow>
                      <TableCell
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                          width:"100px"
                        }}
                        align="center"
                      >
                        Current Score
                      </TableCell>
                      <TableCell
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                          width:"100px"
                        }}
                        align="center"
                      >
                        
                        <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    New Score
                                    <Popover
                                      content={
                                        <div
                                          style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "3px",
                                          }}
                                        >
                                          <span>1-Delay/Issue;No Action</span>
                                          <span>
                                            2-Delay/Issue;Action and impact
                                            available
                                          </span>
                                          <span>
                                            3-Delay/Issue;Action available no
                                            impact
                                          </span>
                                          <span>
                                            4--Activities in progress with
                                            minors issues
                                          </span>
                                          <span>
                                            5-All Activities are as per plan; no
                                            issues
                                          </span>
                                        </div>
                                      }
                                      title={null}
                                    >
                                      <MdInfo style={{ color: "red" }} />
                                    </Popover>
                                  </div>
                      </TableCell>
                      <TableCell
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                          // width:"300px"
                        }}
                        // align="center"
                      >
                        Reason
                      </TableCell>
                      <TableCell
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                          width:"30px"
                        }}
                        align="center"
                      >
                        Actions
                        {riskData?.length === 0 || riskData === undefined ? 
                        <Tooltip title="Add Row" color="#808b96">
                         <Button
                          style={{ height: "20px", width:"20px" }}
                          type="dashed"
                          icon={<PlusOutlined />}
                          onClick={() => {
                            addRiskRow(discussionFormData?.riskPrediction);
                          }}
                        /> 
                        </Tooltip>
                        :""}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {riskData?.map((ele: any, index:any) => {
                      return (
                        <TableRow>
                          <TableCell style={{padding:"5px"}}>
                            <Select
                              value={ele.currentScore}
                              placeholder="Select RiskPrediction"
                              style={{
                                width: "100%",
                                color: "black",
                              }}
                              // size="large"
                              onChange={(e: any) => {
                                addValuesRiskData( ele,
                                  'currentScore',
                                  e);
                              }}
                              options={riskTypesHistory}
                              disabled
                            />
                          </TableCell>
                          <TableCell style={{padding:"5px"}}>
                            <Select
                              value={ele.newScore}
                              placeholder="Select RiskPrediction"
                              style={{
                                width: "100%",
                                color: "black",
                              }}
                              // size="large"
                              onChange={(e: any) => {
                                addValuesRiskData( ele,
                                  'newScore',
                                  e);
                              }}
                              options={riskTypesHistory}
                              disabled={ele?.status}
                            />
                          </TableCell>
                          <TableCell style={{padding:"5px"}}>
                            <TextArea
                              rows={1}
                              placeholder="Enter Reason"
                              maxLength={500000}
                              value={ele.reason}
                              style={{
                                width: "100%",
                                color: "black",
                              }}
                              onChange={(e: any) => {
                                addValuesRiskData( ele,
                                  'reason',
                                  e.target.value);
                              }}
                              disabled={ele?.status}
                            />
                          </TableCell>
                          <TableCell style={{padding:"5px"}} align="center">
                            <Row
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                gap: "5px",
                              }}
                            >
                              {ele.status === false ? <Tooltip title="Submit Data" color="#808b96">
                              <IconButton
                                style={{ padding: "0px", margin: "0px" }}
                                onClick={()=>{
                                  submitDataRow(ele);
                                }}
                              >
                                <CheckBoxIcon />
                              </IconButton>
                              </Tooltip> :""}
                              {index === riskData?.length - 1 ?  
                               <Tooltip title="Add Row" color="#808b96">
                               <IconButton
                                 style={{ padding: "0px", margin: "0px" }}
                                 onClick={() => {
                                   addRiskRow(ele.newScore);
                                 }}
                               >
                                 <AddBoxIcon />
                               </IconButton>
                               </Tooltip>
                               :""}
                            </Row>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper> */}
            <div
              style={{ backgroundColor: "#fff", borderRadius: "0px" }}
              className={classes.descriptionLabelStyle}
            >
              <Form layout="vertical">
                <Descriptions
                  bordered
                  size="small"
                  style={{ width: "832px" }}
                  column={{
                    xxl: 2, // or any other number of columns you want for xxl screens
                    xl: 2, // or any other number of columns you want for xl screens
                    lg: 2, // or any other number of columns you want for lg screens
                    md: 1, // or any other number of columns you want for md screens
                    sm: 2, // or any other number of columns you want for sm screens
                    xs: 2, // or any other number of columns you want for xs screens
                  }}
                >
                  <Descriptions.Item label="Current Score :">
                    <Form.Item
                      // name="type"
                      rules={[
                        {
                          required: true,
                          message: "Type",
                        },
                      ]}
                      style={{ marginBottom: 0 }}
                    >
                      <Select
                        value={riskForm?.currentScore}
                        placeholder="Select RiskPrediction"
                        style={{
                          width: "100%",
                          color: "black",
                        }}
                        // size="large"
                        onChange={(e: any) => {
                          setRiskForm({
                            ...riskForm,
                            currentScore: e,
                          });
                        }}
                        options={riskTypesHistory}
                        disabled
                      />
                    </Form.Item>
                  </Descriptions.Item>
                  <Descriptions.Item label="New Score :">
                    <Form.Item
                      // name="type"
                      rules={[
                        {
                          required: true,
                          message: "Type",
                        },
                      ]}
                      style={{ marginBottom: 0 }}
                    >
                      <Select
                        value={riskForm?.newScore}
                        placeholder="Select New Score"
                        style={{
                          width: "100%",
                          color: "black",
                        }}
                        // size="large"
                        onChange={(e: any) => {
                          setRiskForm({
                            ...riskForm,
                            newScore: e,
                            cratedBy: userInfo?.username,
                            cratedById: userInfo?.id,
                          });
                        }}
                        options={riskTypesHistory}
                      />
                    </Form.Item>
                  </Descriptions.Item>
                  <Descriptions.Item span={12} label="Reason :">
                    <Form.Item
                      // name="type"
                      rules={[
                        {
                          required: true,
                          message: "Type",
                        },
                      ]}
                      style={{ marginBottom: 0 }}
                    >
                      <TextArea
                        rows={2}
                        placeholder="Enter Reason"
                        maxLength={500000}
                        value={riskForm?.reason}
                        style={{
                          width: "100%",
                          color: "black",
                        }}
                        onChange={(e: any) => {
                          setRiskForm({
                            ...riskForm,
                            reason: e.target.value,
                          });
                        }}
                      />
                    </Form.Item>
                  </Descriptions.Item>
                  {/* <Descriptions.Item  label="Created By :">
                          <Form.Item
                            // name="type"
                            rules={[
                              {
                                required: true,
                                message: "Type",
                              },
                            ]}
                            style={{ marginBottom: 0 }}
                          >
                          <Input disabled value={riskForm?.cratedBy} />
                            </Form.Item>
                        </Descriptions.Item>
                        <Descriptions.Item  label="Created On :">
                          <Form.Item
                            // name="type"
                            rules={[
                              {
                                required: true,
                                message: "Type",
                              },
                            ]}
                            style={{ marginBottom: 0 }}
                          >
                          <Input disabled value={riskForm?.createdOn} />
                            </Form.Item>
                        </Descriptions.Item> */}
                </Descriptions>
              </Form>
            </div>
          </div>
        </Modal>
        <Modal
          title={"Risk History"}
          open={openRiskHistory}
          onCancel={closeRiskHistoryTable}
          footer={null}
          width="900px"
          closeIcon={
            <MdClose
              style={{
                color: "#fff",
                backgroundColor: "#0E497A",
                borderRadius: "3px",
              }}
            />
          }
        >
          <div>
            <Paper>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead
                    style={{
                      backgroundColor: "#E8F3F9",
                      color: "#00224E",
                    }}
                  >
                    <TableRow>
                      {/* <TableCell
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                          width:"100px"
                        }}
                        align="center"
                      >
                        Current Score
                      </TableCell> */}
                      <TableCell
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                          width: "100px",
                        }}
                        align="center"
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          New Score
                          <Popover
                            content={
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "3px",
                                }}
                              >
                                <span>1-Delay/Issue;No Action</span>
                                <span>
                                  2-Delay/Issue;Action and impact available
                                </span>
                                <span>
                                  3-Delay/Issue;Action available no impact
                                </span>
                                <span>
                                  4--Activities in progress with minors issues
                                </span>
                                <span>
                                  5-All Activities are as per plan; no issues
                                </span>
                              </div>
                            }
                            title={null}
                          >
                            <MdInfo style={{ color: "red" }} />
                          </Popover>
                        </div>
                      </TableCell>
                      <TableCell
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                          width: "500px",
                        }}
                        align="center"
                      >
                        Reason
                      </TableCell>
                      <TableCell
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                          // width:"300px"
                        }}
                        align="center"
                      >
                        Updated By
                      </TableCell>
                      <TableCell
                        style={{
                          color: "#00224E",
                          fontWeight: "bold",
                          padding: "5px",
                          fontSize: "13px",
                          // width:"300px"
                        }}
                        align="center"
                      >
                        Updated On
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {riskData &&
                      riskData?.map((ele: any, index: any) => {
                        return (
                          <TableRow>
                            {/* <TableCell style={{
                              padding: "5px",
                              borderRight: "1px solid rgba(104, 104, 104, 0.1)",
                              borderBottom:
                                "1px solid rgba(104, 104, 104, 0.1)",
                              fontSize: "12px",
                            }}
                            align="center">
                            {ele.currentScore}
                          </TableCell> */}
                            <TableCell
                              style={{
                                padding: "5px",
                                borderRight:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                borderBottom:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                fontSize: "12px",
                              }}
                              align="center"
                            >
                              {ele.newScore}
                            </TableCell>
                            <TableCell
                              style={{
                                padding: "5px",
                                borderRight:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                borderBottom:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                fontSize: "12px",
                              }}
                              // align="center"
                            >
                              {ele.reason}
                            </TableCell>
                            <TableCell
                              style={{
                                padding: "5px",
                                borderRight:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                borderBottom:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                fontSize: "12px",
                              }}
                              align="center"
                            >
                              {ele?.cratedBy}
                            </TableCell>
                            <TableCell
                              style={{
                                padding: "5px",
                                borderRight:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                borderBottom:
                                  "1px solid rgba(104, 104, 104, 0.1)",
                                fontSize: "12px",
                              }}
                              align="center"
                            >
                              {ele?.createdOn}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default MomInfoDelayedItemDrawerIndex;