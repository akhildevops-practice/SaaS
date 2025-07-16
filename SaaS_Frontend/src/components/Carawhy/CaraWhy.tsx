import {
  IconButton,
  makeStyles,
  Typography,
  debounce,
  useMediaQuery,
} from "@material-ui/core";

import {
  Col,
  Row,
  Form,
  Input,
  Select,
  Button,
  Upload,
  Modal,
  Popconfirm,
  Avatar,
  Tooltip,
  Radio,
} from "antd";

import type { UploadProps } from "antd";

import { Switch, Table } from "antd";

import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";

import { API_LINK } from "config";
import axios from "apis/axios.global";

import { capaTableFormSchemaState } from "recoil/atom";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import dayjs from "dayjs";
import { useSnackbar } from "notistack";
import CrossIcon from "../../assets/icons/BluecrossIcon.svg";
import { MdDelete, MdEdit, MdOutlineInfo, MdSearch, MdOutlineContactSupport } from "react-icons/md";
import getAppUrl from "utils/getAppUrl";

import { generateUniqueId } from "utils/uniqueIdGenerator";
import getSessionStorage from "utils/getSessionStorage";

import { Tabs } from "antd";
import { Select as AntSelect } from "antd";
import { ReactComponent as StarSvg } from "assets/icons/StarSvg.svg";

import SuggestionModal from "../CaraRegistration/SuggestionModal/index";
import { validateTitle } from "utils/validateInput";

const { TabPane } = Tabs;

// import { debounce } from "lodash";

const { Dragger } = Upload;
const { Option } = Select;
const { TextArea } = Input;

const useStyles = (matches: any) =>
  makeStyles((theme) => ({
    root: {
      width: "100%",
      "& .MuiAccordionDetails-root": {
        display: "block",
      },
    },
    disabledInput: {
      "& .ant-input[disabled], & .ant-input[disabled]:not([type='textarea'])": {
        // border: "none",
        backgroundColor: "white !important",
        color: "black",
      },
    },

    disabledSelect: {
      "& .ant-select-disabled .ant-select-selector": {
        backgroundColor: "white !important",
        background: "white !important",
        color: "black",
        // border: "none",
      },
      "& .ant-select-disabled .ant-select-selection-item": {
        color: "black",
        backgroundColor: "white !important",
      },
      "& .ant-select-disabled .ant-select-arrow": {
        display: "none",
      },
    },

    disabledMultiSelect: {
      "& .ant-select-disabled.ant-select-multiple .ant-select-selector": {
        backgroundColor: "white !important",
        // border: "none",
      },
      "& .ant-select-disabled.ant-select-multiple .ant-select-selection-item": {
        color: "black",
        background: "white !important",
      },
      "& .ant-select-disabled .ant-select-arrow": {
        display: "none",
      },
    },

    tabsWrapper: {
      "& .ant-tabs-tab": {
        backgroundColor: "#F0F0F0 !important",
        color:
          "#000 !important" /* Fixed the color value (black should be "#000") */,
        margin: "0 !important",
        borderRadius: "0px",
        paddingTop: "10px",
        textAlign: "left !important" /* Keep the text left-aligned */,
        fontSize: "14px",
        outline: "none !important",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        height: "50px",
      },

      "& .ant-tabs-tab-btn": {
        letterSpacing: "0.6px",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        textAlign: "left !important",
        height: "100%",
        width: "100%",
      },

      "& .ant-tabs-tab-active": {
        backgroundColor: "white !important",
        borderLeft: "3px solid #003536",
        outline: "none !important",
        boxShadow: "none !important",
      },

      "& .ant-tabs-tab-active div": {
        color: "#003536 !important",
        fontWeight: "600",
        outline: "none !important",
      },

      "& div.ant-tabs-tab": {
        padding: "5px !important",
      },

      "& .ant-tabs-nav": {
        borderBottom: "none !important",
      },

      "& .ant-tabs-ink-bar": {
        backgroundColor: "transparent !important",
        height: "0px !important",
      },

      "& .ant-tabs-tab:focus, .ant-tabs-tab:active, .ant-tabs-tab-focus": {
        outline: "none !important",
        boxShadow: "none !important",
      },

      // Specifically remove any focus-related styles applied by Ant Design
      "& .ant-tabs-tab:focus-visible": {
        outline: "none !important",
        boxShadow: "none !important",
        color: "none !important",
      },
    },

    customFileInput: {
      display: "flex",
      alignItems: "center",
      cursor: "pointer",
      overflow: "hidden",
      position: "relative",
      "& input": {
        width: "100%",
        height: "100%",
        opacity: "0",
        position: "absolute",
        top: "0",
        left: "0",
      },
    },
    customFileInputSpan: {
      marginLeft: "8px",
    },

    label: {
      verticalAlign: "middle",
    },
    filename: {
      fontSize: theme.typography.pxToRem(12),
      color: theme.palette.primary.light,
      textOverflow: "ellipsis",
      overflow: "hidden",
      width: "160px",
      cursor: "pointer",
      "&:hover": {
        cursor: "pointer", // Change cursor to pointer on hover
      },
      whiteSpace: "nowrap",
    },

    formTextPadding: {
      paddingBottom: theme.typography.pxToRem(10),
      fontSize: theme.typography.pxToRem(14),
      color: "#003566",
    },
    submitBtn: {
      backgroundColor: "#003566 !important",
      height: "36px",
      color: "#fff",
      alignItems: "center",
    },
    heading: {
      fontSize: theme.typography.pxToRem(15),
      flexBasis: "33.33%",
      flexShrink: 0,
    },
    secondaryHeading: {
      fontSize: theme.typography.pxToRem(15),
      color: theme.palette.text.secondary,
    },
    uploadSection: {
      width: matches ? "460px" : "200px", // Adjust the width as needed
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
    previewFont: {
      fontSize: theme.typography.pxToRem(13),
      color: theme.palette.primary.light,
      textDecoration: "none",
      fontWeight: 600,
      marginLeft: theme.typography.pxToRem(20),
    },
    form__section1: {
      // border: "0.5rem solid #F7F7FF",
      // borderRadius: "10px",
      padding: "1rem 1.5rem",
      [theme.breakpoints.down("sm")]: {
        padding: "1rem",
      },
      margin: "1rem 0",
      minWidth: "100%",
    },
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
type Props = {
  drawer?: any;
  setDrawer?: any;
  handleDocFormCreated?: any;
  uploadFileError?: any;
  setUploadFileError?: any;
  disableFormFields?: any;
  disableDocType?: any;
  isEdit?: any;
  claimData?: any;
  suppliers?: any;
  claimsList?: any;
  formData?: any;
  setFormData?: any;
  open?: any;
  setOpen?: any;
  submitted?: boolean;
  setSubmitted?: any;
  investForm?: any;
  readMode?: boolean;
  isUpload?: boolean;
  setUpload?: any;
  isAnalysis?: boolean;
  setAnalysis?: any;
  // setOutcomeUpload?: any;
  refForCapaFormAnalyse2?: any;
  refForCapaFormAnalyse3?: any;
  refForCapaFormAnalyse4?: any;
  refForCapaFormAnalyse5?: any;
  refForCapaFormAnalyse6?: any;
  refForCapaFormAnalyse7?: any;
  refForCapaFormAnalyse8?: any;
  refForCapaFormAnalyse9?: any;

  refForCapaFormAnalyse10?: any;
  refForCapaFormAnalyse11?: any;
  refForCapaFormAnalyse12?: any;
  refForCapaFormAnalyse13?: any;
  refForCapaFormAnalyse14?: any;
  refForCapaFormAnalyse15?: any;
  refForCapaFormAnalyse16?: any;
  refForCapaFormAnalyse17?: any;
  showAISuggestions?: any;
};
const CaraWhy = ({
  formData,
  setFormData,
  investForm,
  readMode,
  isUpload,
  setUpload,
  isAnalysis,
  setAnalysis,
  // setOutcomeUpload,
  drawer,
  isEdit,
  refForCapaFormAnalyse2,
  refForCapaFormAnalyse3,
  refForCapaFormAnalyse4,
  refForCapaFormAnalyse5,
  refForCapaFormAnalyse6,
  refForCapaFormAnalyse7,
  refForCapaFormAnalyse8,
  refForCapaFormAnalyse9,
  refForCapaFormAnalyse10,
  refForCapaFormAnalyse11,
  refForCapaFormAnalyse12,
  refForCapaFormAnalyse13,
  refForCapaFormAnalyse14,
  refForCapaFormAnalyse15,
  showAISuggestions,
}: Props) => {
  const matches = useMediaQuery("(min-width:786px)");
  const classes = useStyles(matches)();

  const [fileList, setFileList] = useState<any>([]);

  const [uploadLoading, setUploadLoading] = useState<boolean>(false);

  const [uploadFileError, setUploadFileError] = useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar();

  const [initialFileList, setInitialFileList] = useState([]);
  const [click, setClick] = useState<boolean>(false);
  const [Carawhyform] = Form.useForm();
  const [userOptions, setUserOptions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState<any>(false);
  const [activeModules, setActiveModules] = useState<string[]>([]);
  const [reRankingType, setReRankingType] = useState(1);

  const userInfo = getSessionStorage();

  const realmName = getAppUrl();
  useEffect(() => {
    // getYear();
    getAllActionItemReference();
    getUserOptions();
  }, []);
  useEffect(() => {
    if (!!drawer?.open) {
      // getData();
      if (isEdit === false) {
        Carawhyform?.resetFields();
      } else {
        Carawhyform.setFieldsValue({
          rootCauseAnalysis: formData?.rootCauseAnalysis,
          targetDate: formData?.targetDate,
          correctiveAction: formData?.correctiveAction,
          containmentAction: formData?.containmentAction,
          why1: formData?.why1,
          why2: formData?.why2,
          why3: formData?.why3,
          why4: formData?.why4,
          why5: formData?.why5,
          man: formData?.man,
          machine: formData?.machine,
          method: formData?.method,
          measurement: formData?.measurement,
          material: formData?.material,
          environment: formData?.environment,
        });
      }
    }
  }, [isEdit, drawer.open, formData]);
  useEffect(() => {
    // investForm?.resetFields();
    if (formData?.files && formData?.files?.length > 0) {
      setFileList(formData.files);
      setInitialFileList(formData.files);
    }
  }, []);

  useEffect(() => {
    if (!!fileList) handleFileChange(fileList);
  }, [fileList]);

  const [error, setError] = useState("");
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;

    // Perform validation
    validateTitle(null, value, (error) => {
      if (error) {
        // Handle the validation error (e.g., set an error state or show a message)
        console.error(error);
        // You can set an error state if needed
        setError(error);
      } else {
        // Update form data if no error
        setError("");
        setFormData((prevFormData: any) => ({
          ...prevFormData,
          [name]: value,
        }));
      }
    });
  };

  const uploadFileprops: UploadProps = {
    action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
    multiple: true,
    beforeUpload: () => false,
    onRemove: (file) => {
      const updatedFileList = formData.files.filter(
        (item: any) => item.uid !== file.uid
      );
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        files: updatedFileList,
      }));
    },
    onChange({ file, fileList }) {
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        files: fileList,
      }));
    },
  };

  const arraysAreEqual = (array1: any, array2: any) => {
    if (array1?.length !== array2?.length) {
      return false;
    }

    for (let i = 0; i < array1?.length; i++) {
      // Deep comparison of array elements
      if (JSON.stringify(array1[i]) !== JSON.stringify(array2[i])) {
        return false;
      }
    }

    return true;
  };
  const handleFileChange = async (fileList: any) => {
    const fileschanged = !arraysAreEqual(fileList, initialFileList);
    if (fileschanged && !click) {
      setUpload(false);
      setAnalysis(true);
      // setOutcomeUpload(true);
    } else {
      setUpload(true);
      setAnalysis(true);
      // setOutcomeUpload(true);
    }
  };
  // const validateTitle = (
  //   rule: any,
  //   value: string,
  //   callback: (error?: string) => void
  // ) => {
  //   // Define regex pattern for allowed characters
  //   const TITLE_REGEX =
  //     /^[\u0000-\u007F\u0080-\uFFFFa-zA-Z0-9$&*()\-/\.,\?&%!#@€£`'"\~]+$/; // Allows letters, numbers, and specific symbols, but does not include < and >

  //   // Check for disallowed characters
  //   const DISALLOWED_CHARS = /[<>]/;

  //   // Check for more than two consecutive special characters
  //   const MORE_THAN_TWO_CONSECUTIVE_SPECIAL_CHARS =
  //     /[\/\-\.\$\€\£\?\&\*\(\)\%\#\!\@\`\'\"\~]{3,}/;

  //   // Check if the title starts with a special character
  //   const STARTS_WITH_SPECIAL_CHAR =
  //     /^[\/\-\.\$\€\£\?\&\*\(\)\%\#\!\@\`\'\"\~]/;

  //   if (!value || value.trim().length === 0) {
  //     callback("Text value is required.");
  //   } else if (DISALLOWED_CHARS.test(value)) {
  //     callback("Invalid text. Disallowed characters are < and >.");
  //   } else if (MORE_THAN_TWO_CONSECUTIVE_SPECIAL_CHARS.test(value)) {
  //     callback(
  //       "Invalid text. No more than two consecutive special characters are allowed."
  //     );
  //   } else if (STARTS_WITH_SPECIAL_CHAR.test(value)) {
  //     callback("Invalid text. Text should not start with a special character.");
  //   } else if (!TITLE_REGEX.test(value)) {
  //     callback(
  //       "Invalid text. Allowed characters include letters, numbers, commas, slashes, hyphens, dots, and currency symbols."
  //     );
  //   } else {
  //     callback();
  //   }
  // };
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
      const updatedFileList = formData.files.filter(
        (item: any) => item.uid !== data.uid
      );
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        files: updatedFileList,
      }));
    } catch (error) {
      return error;
    }
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

  //modem data

  const uniqueId = generateUniqueId(22);
  // const [capaTableData, setCapaTableData] = useRecoilState(capaSubTableDataState);
  const [capaTableData, setCapaTableData] = useState<any[]>([]);
  const [capaFormData, setCapaFormData] = useRecoilState(
    capaTableFormSchemaState
  );
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  // const HeadersData = ["Activity Comments", "Activity Date"];
  // const FieldsData = ["comments", "date"];

  const [editId, setEditId] = useState<any>();
  const [buttonHide, setButtonHide] = useState(false);
  const [buttonAddCheck, setButtonAddCheck] = useState(false);
  // const [activityTableForm,setActivityTableForm,] = useState<any>({activeComents:"",activityDate:"",id:""});
  // const[activityTableData,setActivityTableData] = useState<any[]>([]);
  // const ResetFormData = useResetRecoilState(capaTableFormSchemaState);
  // const [modalCommentState, setModalCommentState] = useState(false);
  const userDetail = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const [firstForm] = Form.useForm();

  // const [activityUpdate, setActivityUpdate] =
  //   useRecoilState(activityUpdateData);

  //functions

  // const modalOpenHandler = (data: any) => {
  //   setOpen(true);
  //   setCapaFormData({
  //     title: data?.title,
  //     owner: data?.owner,
  //     targetDate: data?.targetDate,
  //     description: data?.description,
  //     activityComments: data?.activityComments,
  //     activityDate: data?.activityDate,
  //     id: data?.id,
  //     // status:data?.status,
  //     buttonStatus: false,
  //     mode: "edit",
  //     verifierStatus: false,
  //   });
  // };

  const debouncedSearch = debounce(() => {
    getData(typeAheadValue, typeAheadType);
  }, 400);

  // console.log("fromData", formData);
  const getData = async (value: string = "", type: string = "") => {
    try {
      let res = await axios.get(
        `api/user/doctype/filterusers/${realmName}/${"allusers"}`
      );
      setSuggestions(res.data);
    } catch (err) {
      console.log(err);
    }
  };
  // const getYear = async () => {
  //   const currentyear = await getYearFormat(new Date().getFullYear());
  //   setCurrentYear(currentyear);
  // };

  const handleTextChange = (e: any) => {
    getSuggestionList(e.target.value, "normal");
  };

  const tableDeleteHandler = async (data: any) => {
    const deleteData = capaTableData.filter(
      (item: any) => item._id !== data._id
    );
    setCapaTableData(deleteData);
    const result = await axios.delete(
      API_LINK + `/api/actionitems/deleteActionITem/${data._id}`
    );
  };

  const tableEditHandler = async (data: any) => {
    // setButtonHide(true);
    setEditId(data._id);
    setOpen(true);
    setButtonAddCheck(false);

    firstForm.setFieldsValue({
      title: data.title,
      // owner: data.owner,

      targetDate: data.targetDate,
      description: data.description,
      status: data.status,
      activityComments: data.activityComments,
      activityDate: data.activityDate,
    });

    setCapaFormData({
      title: data.title,
      owner: data.owner,
      // .map((item:any)=>item.id),
      targetDate: data.targetDate,
      description: data.description,
      id: data._id,
      activityComments: data.activityComments,
      activityDate: data.activityDate,
      status: data.status,
      buttonStatus: false,
      mode: "edit",
      verifierStatus: false,
    });

    // const result = await axios.patch(
    //       API_LINK +
    //         `/api/actionitems/updateActionItem/${data?._id}`
    //     )
    //     console.log("update<<<<<<<<",result)

    //    const getActionItemReferenceUpdate = async(data:any)=>{
    //   // console.log("reference api====")

    //  const result = await axios.update(
    //     API_LINK +
    //       `/api/actionitems/updateActionItem/${data?._id}`
    //   )
    //   // setCapaTableData(result.data)

    // }
  };
  const addHandlerTable = () => {
    setCapaFormData({
      title: "",
      owner: [],
      targetDate: "",
      description: "",
      activityComments: "",
      activityDate: "",
      actionItemStatus: "",
      id: uniqueId,
      mode: "create",
      // status:true,
      verifierStatus: false,
      referenceId: formData._id,
      locationId: userInfo.locationId,
      organizationId: userInfo.organizationId,
      source: "CAPA",
    });
    setButtonAddCheck(false);
    setOpen(true);
    // ResetFormData()
    firstForm.resetFields();
  };

  const viewHandlerInfo = (data: any) => {
    // console.log("data in view", data);

    const editData = capaTableData?.map((item: any) => {
      if (item._id === data._id) {
        return { ...item, buttonStatus: true };
      }
      return item;
    });
    setCapaTableData(editData);
    setCapaFormData({
      title: data.title,
      owner: data.owner,
      targetDate: data?.targetDate,
      description: data?.description,
      id: data._id,
      activityComments: data?.activityComments,
      activityDate: data?.activityDate,
      status: data.status,
      verifierStatus: true,
      mode: "view",
      buttonStatus: true,
    });
    firstForm.setFieldsValue({
      title: data.title,
      owner: data.owner,

      targetDate: data.targetDate,
      description: data.description,
      status: data.status,
      activityComments: data.activityComments,
      activityDate: data.activityDate,
    });
    setOpen(true);
    setButtonAddCheck(true);
  };

  // const actionData: any = {
  //   isAction: true,
  //   actions: [
  //     {
  //       label: "MdEdit",
  //       icon: "icon",
  //       handler: () => console.log("handler"),
  //     },
  //   ],
  // };
  // console.log("capaformdata", capaFormData);

  const TableDataAddHandler = async (data: any) => {
    // console.log("tabledata", capaFormData);
    if (capaFormData.mode === "create") {
      if (
        capaFormData.title === "" ||
        capaFormData.title === undefined ||
        capaFormData.owner.length <= 0 ||
        capaFormData.targetDate === ""
      ) {
        enqueueSnackbar("You must enter all fields!", { variant: "error" });
        return;
      } else {
        if (
          capaTableData
            ?.map((item: any) => item.title)
            .includes(capaFormData.title)
        ) {
          enqueueSnackbar("You cannot have a duplicate title!", {
            variant: "error",
          });
          return;
        }

        let payload = {
          ...capaFormData,
          status: true,
          buttonStatus: true,
        };
        // setCapaTableData([...capaTableData, payload]);
        // setFormData({
        //   ...formData,
        //   tangibleBenefits: capaTableData,
        // });
        const result = await axios.post(
          API_LINK + "/api/actionitems/createActionItem",
          payload
        );
        if (result.status === 200 || result.status === 201) {
          enqueueSnackbar(`Data Added successfully!`, {
            variant: "success",
          });
          setButtonAddCheck(false);
          setOpen(false);
        }

        getAllActionItemReference();

        // ResetFormData();
      }
    }
    if (capaFormData.mode === "edit") {
      if (
        capaFormData?.title === "" ||
        capaFormData?.title === undefined ||
        capaFormData.owner?.length <= 0 ||
        capaFormData?.targetDate === ""
      ) {
        enqueueSnackbar("You must enter all fields!", { variant: "error" });
        return;
      }
      let payload = {
        ...capaFormData,
        buttonStatus: true,
      };

      const updateData = capaTableData?.map(async (item: any) => {
        const result = await axios.patch(
          API_LINK + `/api/actionitems/updateActionItem/${capaFormData?.id}`,
          payload
        );
        if (item._id === editId) {
          return {
            ...item,
            ...payload,
          };
        }
        return item;
      });
      setCapaTableData(updateData);
      setButtonHide(false);
      setOpen(false);

      // ResetFormData();
      // firstForm.resetFields();

      // console.log("update<<<<<<<<",result)

      getAllActionItemReference();
      enqueueSnackbar(`Data Updated successfully!`, {
        variant: "success",
      });
    }
  };

  const getAllActionItemReference = async () => {
    // console.log("reference api====");

    const result = await axios.get(
      API_LINK + `/api/actionitems/getActionItemForReference/${formData?._id}`
    );
    // console.log("data", result?.data, formData?._id);
    setCapaTableData(result.data);
  };

  //   for delete

  // const getActionItemReferenceDelete = async(data:any)=>{
  //   console.log("reference api====")

  //  const result = await axios.get(
  //     API_LINK +
  //       `/api/actionitems/deleteActionITem/${data._id}`
  //   )
  //   // setCapaTableData(result.data)

  // }

  //   for update

  // console.log("aaaaaaaaaaaaaaa",formData)

  var typeAheadValue: string;
  var typeAheadType: string;

  const getSuggestionList = (value: any, type: string) => {
    typeAheadValue = value;
    typeAheadType = type;
    debouncedSearch();
  };

  //For Action iteam table data

  // console.log("tableData:::::::::::", capaTableData);

  const Columns = [
    {
      title: "ActionItems",
      dataIndex: "ActionItems",
      key: "ActionItems",
      width: 80,
      render: (_: any, data: any, index: number) => {
        return (
          <div
            style={{
              width: "120px !important",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <span>{data?.title}</span>
          </div>
        );
      },
    },
    {
      title: "Owner",
      dataIndex: "Owner",
      key: "Owner",
      width: 60,
      render: (_: any, data: any, index: number) => {
        return (
          <div
            style={{
              width: "80px",
            }}
          >
            {/* {data?.owner} */}
            {data?.owner?.map((item: any) => item?.username)}
          </div>
        );
      },
    },

    {
      title: "Target Date",
      dataIndex: "Target Date",
      key: "Target Date",
      width: 80,
      render: (_: any, data: any, index: number) => {
        return <div>{data?.targetDate}</div>;
      },
    },

    {
      title: "Action",
      dataIndex: "Action",
      key: "Action",
      width: 80,
      render: (_: any, data: any, index: number) => {
        return (
          <div style={{ display: "flex", gap: "10px", width: "40px" }}>
            <MdOutlineInfo
              onClick={() => {
                viewHandlerInfo(data);
              }}
            />
            <IconButton
              disabled={
                data?.verifierStatus ||
                readMode ||
                formData?.status === "Open" ||
                formData?.status === "Outcome_In_Progress" ||
                formData?.status === "Draft" ||
                formData?.status === "Closed"
              }
              style={{ padding: "0px" }}
            >
              <MdEdit
                style={{ fontSize: "20px" }}
                onClick={() => {
                  tableEditHandler(data);
                }}
              />
            </IconButton>
            <Popconfirm
              placement="top"
              title={"Are you sure to delete Data"}
              onConfirm={() => tableDeleteHandler(data)}
              okText="Yes"
              cancelText="No"
              // disabled={data?.verifierStatus}
              disabled={
                data?.verifierStatus ||
                readMode ||
                formData?.status === "Open" ||
                formData?.status === "Outcome_In_Progress" ||
                formData?.status === "Draft" ||
                formData?.status === "Closed"
              }
            >
              <MdDelete style={{ fontSize: "20px" }} />
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  const viewObjectStorageDoc = async (link: any) => {
    const response = await axios.post(`${API_LINK}/api/documents/viewerOBJ`, {
      documentLink: link,
    });
    return response.data;
  };

  const handleOpenModal = async (field: any) => {
    const formatFormData = {
      title: formData.title,
      description: formData.description,
      containmentAction: formData.containmentAction,
      rootCauseAnalysis: formData.rootCauseAnalysis,
      correctiveAction: formData.correctiveAction,
      man: formData.man,
      machine: formData.machine,
      environment: formData.environment,
      material: formData.material,
      method: formData.method,
      measurement: formData.measurement,
      why1: formData.why1,
      why2: formData.why2,
      why3: formData.why3,
      why4: formData.why4,
      why5: formData.why5,
      reRankingType: reRankingType
    };
    const response = await axios.post(
      `${process.env.REACT_APP_PY_URL}/pyapi/capaSuggestions`,
      formatFormData
    );
    // const suggestionsDtls = response.data.map((item: any) =>
    //   JSON.parse(item.text)
    // );
    const suggestions = response.data.map((item: any) => item[field]);
    setAiSuggestions(suggestions);
    setCurrentField(field);
    setIsModalVisible(true);
  };

  const [aiSuggestions, setAiSuggestions] = useState<any>([]);

  const [currentField, setCurrentField] = useState<string | null>(null);

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleAccept = (text: string) => {
    if (currentField) {
      setFormData({
        ...formData,
        [currentField]: text,
      });
      investForm?.setFieldsValue({
        [currentField]: text,
      });
    }
    setIsModalVisible(false);
  };

  useEffect(() => {
    getActiveModules();
  }, []);

  const getActiveModules = async () => {
    await axios(`/api/organization/getAllActiveModules/${realmName}`)
      .then((res) => {
        setActiveModules(res.data.activeModules);
      })
      .catch((err) => console.error(err));
  };

  return (
    <>
      <Form
        form={Carawhyform}
        layout="vertical"
        // initialValues={{
        //   // rootCauseAnalysis: formData?.rootCauseAnalysis,
        //   rootCauseAnalysis: "abcd",
        //   correctiveAction: formData?.correctiveAction,
        //   targetDate: formData?.targetDate ? formData?.targetDate : "",
        //   files: formData?.files,
        // }}
        // disabled={formData?.status === "OPEN" || !formData?.status}
        rootClassName={classes.labelStyle}
        /* other props */
        style={{ width: "100%" }}
      >
        <Tabs
          defaultActiveKey="1"
          tabPosition={matches ? "left" : "top"}
          className={classes.tabsWrapper}
          style={{ display: matches ? "flex" : "grid" }}

          //animated={{ inkBar: true, tabPane: true }}
        >
          <TabPane
            tab={
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  marginRight: "10px",
                }}
              >
                <MdOutlineContactSupport
                  style={{ marginRight: 5, height: "20px" }}
                />
                Why Why
              </span>
            }
            key="3"
          >
            <div>
              <div style={{ display: "flex", justifyContent: "end" }}>
                <div>
                  {activeModules?.includes("AI_FEATURES") ? (
                    <Tooltip title="AI Suggestion">
                      <IconButton
                        style={{
                          fill: "#0E497A",
                          cursor: "pointer",
                          width: "28px",
                          height: "37px",
                          marginRight: "30px",
                          marginTop: "-12px",
                        }}
                      >
                        <Button
                          type="text"
                          icon={<StarSvg />}
                          onClick={() => showAISuggestions("Why Why")}
                        />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    ""
                  )}
                </div>
              </div>

              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Form.Item
                    label={
                      <>
                        {`Why1: `}
                        {activeModules?.includes("AI_FEATURES") && (
                          <Tooltip title="Suggestions">
                            <IconButton
                              style={{ padding: 0, margin: 0 }}
                              onClick={() => handleOpenModal("why1")}
                            >
                              <MdSearch />
                            </IconButton>
                          </Tooltip>
                        )}
                      </>
                    }
                    //label="Why1: "
                    name="why1"
                    className={classes.disabledInput}
                    style={{ paddingTop: "10px", marginBottom: 0 }}
                    rules={[
                      {
                        validator: validateTitle,
                      },
                    ]}
                  >
                    <TextArea
                      rows={2}
                      name="why1"
                      placeholder="Enter Why1"
                      size="large"
                      onChange={(e) => handleInputChange(e)}
                      value={formData?.why1}
                      disabled={
                        readMode ||
                        formData?.status === "Open" ||
                        formData?.status === "Outcome_In_Progress" ||
                        formData?.status === "Draft" ||
                        formData?.status === "Closed" ||
                        formData?.status === "Rejected"
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Form.Item
                    label={
                      <>
                        {`Why2: `}
                        {activeModules?.includes("AI_FEATURES") && (
                          <Tooltip title="Suggestions">
                            <IconButton
                              style={{ padding: 0, margin: 0 }}
                              onClick={() => handleOpenModal("why2")}
                            >
                              <MdSearch />
                            </IconButton>
                          </Tooltip>
                        )}
                      </>
                    }
                    //label="Why2: "
                    name="why2"
                    className={classes.disabledInput}
                    style={{ paddingTop: "10px", marginBottom: 0 }}
                    rules={[
                      {
                        validator: validateTitle,
                      },
                    ]}
                  >
                    <TextArea
                      rows={2}
                      name="why2"
                      placeholder="Enter Why2"
                      size="large"
                      onChange={(e) => handleInputChange(e)}
                      value={formData?.why2}
                      disabled={
                        readMode ||
                        formData?.status === "Open" ||
                        formData?.status === "Outcome_In_Progress" ||
                        formData?.status === "Draft" ||
                        formData?.status === "Closed" ||
                        formData?.status === "Rejected"
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Form.Item
                    label={
                      <>
                        {`Why3: `}
                        {activeModules?.includes("AI_FEATURES") && (
                          <Tooltip title="Suggestions">
                            <IconButton
                              style={{ padding: 0, margin: 0 }}
                              onClick={() => handleOpenModal("why3")}
                            >
                              <MdSearch />
                            </IconButton>
                          </Tooltip>
                        )}
                      </>
                    }
                    //label="Why3: "
                    name="why3"
                    className={classes.disabledInput}
                    style={{ paddingTop: "10px", marginBottom: 0 }}
                    rules={[
                      {
                        validator: validateTitle,
                      },
                    ]}
                  >
                    <TextArea
                      rows={2}
                      name="why3"
                      placeholder="Enter Why3"
                      size="large"
                      onChange={(e) => handleInputChange(e)}
                      value={formData?.why3}
                      disabled={
                        readMode ||
                        formData?.status === "Open" ||
                        formData?.status === "Outcome_In_Progress" ||
                        formData?.status === "Draft" ||
                        formData?.status === "Closed" ||
                        formData?.status === "Rejected"
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Form.Item
                    label={
                      <>
                        {`Why4: `}
                        {activeModules?.includes("AI_FEATURES") && (
                          <Tooltip title="Suggestions">
                            <IconButton
                              style={{ padding: 0, margin: 0 }}
                              onClick={() => handleOpenModal("why4")}
                            >
                              <MdSearch />
                            </IconButton>
                          </Tooltip>
                        )}
                      </>
                    }
                    //label="Why4: "
                    name="why4"
                    className={classes.disabledInput}
                    style={{ paddingTop: "10px", marginBottom: 0 }}
                    rules={[
                      {
                        validator: validateTitle,
                      },
                    ]}
                  >
                    <TextArea
                      rows={2}
                      name="why4"
                      placeholder="Enter Why4"
                      size="large"
                      onChange={(e) => handleInputChange(e)}
                      value={formData?.why4}
                      disabled={
                        readMode ||
                        formData?.status === "Open" ||
                        formData?.status === "Outcome_In_Progress" ||
                        formData?.status === "Draft" ||
                        formData?.status === "Closed" ||
                        formData?.status === "Rejected"
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Form.Item
                    label={
                      <>
                        {`Why5: `}
                        {activeModules?.includes("AI_FEATURES") && (
                          <Tooltip title="Suggestions">
                            <IconButton
                              style={{ padding: 0, margin: 0 }}
                              onClick={() => handleOpenModal("why5")}
                            >
                              <MdSearch />
                            </IconButton>
                          </Tooltip>
                        )}
                      </>
                    }
                    //label="Why5: "
                    name="why5"
                    className={classes.disabledInput}
                    style={{ paddingTop: "10px", marginBottom: 0 }}
                    rules={[
                      {
                        validator: validateTitle,
                      },
                    ]}
                  >
                    <TextArea
                      rows={2}
                      name="why5"
                      placeholder="Enter Why5"
                      size="large"
                      onChange={(e) => handleInputChange(e)}
                      value={formData?.why5}
                      disabled={
                        readMode ||
                        formData?.status === "Open" ||
                        formData?.status === "Outcome_In_Progress" ||
                        formData?.status === "Draft" ||
                        formData?.status === "Closed" ||
                        formData?.status === "Rejected"
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </TabPane>

          <TabPane tab="Possible Causes" key="2">
            <div style={{ display: "flex", justifyContent: "end" }}>
              <div>
                {activeModules?.includes("AI_FEATURES") ? (
                  <Tooltip title="AI Suggestion">
                    <IconButton
                      style={{
                        fill: "#0E497A",
                        cursor: "pointer",
                        width: "28px",
                        height: "37px",
                        marginRight: "30px",
                        marginTop: "-12px",
                      }}
                    >
                      <Button
                        type="text"
                        icon={<StarSvg />}
                        onClick={() => showAISuggestions("Possible Causes")}
                      />
                    </IconButton>
                  </Tooltip>
                ) : (
                  ""
                )}
              </div>
            </div>
            <div>
              <Row
                gutter={[16, 16]}
                style={{
                  display: "flex",
                  flexDirection: matches ? "row" : "column",
                }}
              >
                <Col span={matches ? 12 : 24}>
                  <Form.Item
                    label={
                      <>
                        {`Man: `}
                        {activeModules?.includes("AI_FEATURES") && (
                          <Tooltip title="Suggestions">
                            <IconButton
                              style={{ padding: 0, margin: 0 }}
                              onClick={() => handleOpenModal("man")}
                            >
                              <MdSearch />
                            </IconButton>
                          </Tooltip>
                        )}
                      </>
                    }
                    //label="Man: "
                    name="man"
                    className={classes.disabledInput}
                    style={{ paddingTop: "10px", marginBottom: 0 }}
                    rules={[
                      {
                        validator: validateTitle,
                      },
                    ]}
                  >
                    <TextArea
                      rows={2}
                      name="man"
                      placeholder="Enter MAN"
                      size="large"
                      onChange={(e) => handleInputChange(e)}
                      value={formData?.man}
                      disabled={
                        readMode ||
                        formData?.status === "Open" ||
                        formData?.status === "Outcome_In_Progress" ||
                        formData?.status === "Draft" ||
                        formData?.status === "Closed" ||
                        formData?.status === "Rejected"
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={matches ? 12 : 24}>
                  <Form.Item
                    label={
                      <>
                        {`Machine: `}
                        {activeModules?.includes("AI_FEATURES") && (
                          <Tooltip title="Suggestions">
                            <IconButton
                              style={{ padding: 0, margin: 0 }}
                              onClick={() => handleOpenModal("machine")}
                            >
                              <MdSearch />
                            </IconButton>
                          </Tooltip>
                        )}
                      </>
                    }
                    //label="Machine: "
                    name="machine"
                    className={classes.disabledInput}
                    style={{ paddingTop: "10px", marginBottom: 0 }}
                    rules={[
                      {
                        validator: validateTitle,
                      },
                    ]}
                  >
                    <TextArea
                      rows={2}
                      name="machine"
                      placeholder="Enter MACHINE"
                      size="large"
                      onChange={(e) => handleInputChange(e)}
                      value={formData?.machine}
                      disabled={
                        readMode ||
                        formData?.status === "Open" ||
                        formData?.status === "Outcome_In_Progress" ||
                        formData?.status === "Draft" ||
                        formData?.status === "Closed" ||
                        formData?.status === "Rejected"
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row
                gutter={[16, 16]}
                style={{
                  display: "flex",
                  flexDirection: matches ? "row" : "column",
                }}
              >
                <Col span={matches ? 12 : 24}>
                  <Form.Item
                    label={
                      <>
                        {`Environment: `}
                        {activeModules?.includes("AI_FEATURES") && (
                          <Tooltip title="Suggestions">
                            <IconButton
                              style={{ padding: 0, margin: 0 }}
                              onClick={() => handleOpenModal("environment")}
                            >
                              <MdSearch />
                            </IconButton>
                          </Tooltip>
                        )}
                      </>
                    }
                    //label="Environment: "
                    name="environment"
                    className={classes.disabledInput}
                    style={{ paddingTop: "10px", marginBottom: 0 }}
                    rules={[
                      {
                        validator: validateTitle,
                      },
                    ]}
                  >
                    <TextArea
                      rows={2}
                      name="environment"
                      placeholder="Enter Environment"
                      size="large"
                      onChange={(e) => handleInputChange(e)}
                      value={formData?.environment}
                      disabled={
                        readMode ||
                        formData?.status === "Open" ||
                        formData?.status === "Outcome_In_Progress" ||
                        formData?.status === "Draft" ||
                        formData?.status === "Closed" ||
                        formData?.status === "Rejected"
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={matches ? 12 : 24}>
                  <Form.Item
                    label={
                      <>
                        {`Method: `}
                        {activeModules?.includes("AI_FEATURES") && (
                          <Tooltip title="Suggestions">
                            <IconButton
                              style={{ padding: 0, margin: 0 }}
                              onClick={() => handleOpenModal("method")}
                            >
                              <MdSearch />
                            </IconButton>
                          </Tooltip>
                        )}
                      </>
                    }
                    //label="Method: "
                    name="method"
                    className={classes.disabledInput}
                    style={{ paddingTop: "10px", marginBottom: 0 }}
                  >
                    <TextArea
                      rows={2}
                      name="method"
                      placeholder="Enter Method"
                      size="large"
                      onChange={(e) => handleInputChange(e)}
                      value={formData?.method}
                      disabled={
                        readMode ||
                        formData?.status === "Open" ||
                        formData?.status === "Outcome_In_Progress" ||
                        formData?.status === "Draft" ||
                        formData?.status === "Closed" ||
                        formData?.status === "Rejected"
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row
                gutter={[16, 16]}
                style={{
                  display: "flex",
                  flexDirection: matches ? "row" : "column",
                }}
              >
                <Col span={matches ? 12 : 24}>
                  <Form.Item
                    label={
                      <>
                        {`Measurement: `}
                        {activeModules?.includes("AI_FEATURES") && (
                          <Tooltip title="Suggestions">
                            <IconButton
                              style={{ padding: 0, margin: 0 }}
                              onClick={() => handleOpenModal("measurement")}
                            >
                              <MdSearch />
                            </IconButton>
                          </Tooltip>
                        )}
                      </>
                    }
                    //label="Measurement: "
                    name="measurement"
                    className={classes.disabledInput}
                    style={{ paddingTop: "10px", marginBottom: 0 }}
                    rules={[
                      {
                        validator: validateTitle,
                      },
                    ]}
                  >
                    <TextArea
                      rows={2}
                      name="measurement"
                      placeholder="Enter Measurement"
                      size="large"
                      onChange={(e) => handleInputChange(e)}
                      value={formData?.measurement}
                      disabled={
                        readMode ||
                        formData?.status === "Open" ||
                        formData?.status === "Outcome_In_Progress" ||
                        formData?.status === "Draft" ||
                        formData?.status === "Closed" ||
                        formData?.status === "Rejected"
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={matches ? 12 : 24}>
                  <Form.Item
                    label={
                      <>
                        {`Material: `}
                        {activeModules?.includes("AI_FEATURES") && (
                          <Tooltip title="Suggestions">
                            <IconButton
                              style={{ padding: 0, margin: 0 }}
                              onClick={() => handleOpenModal("material")}
                            >
                              <MdSearch />
                            </IconButton>
                          </Tooltip>
                        )}
                      </>
                    }
                    //label="Material: "
                    name="material"
                    className={classes.disabledInput}
                    style={{ paddingTop: "10px", marginBottom: 0 }}
                  >
                    <TextArea
                      rows={2}
                      name="material"
                      placeholder="Enter Material"
                      size="large"
                      onChange={(e) => handleInputChange(e)}
                      value={formData?.material}
                      disabled={
                        readMode ||
                        formData?.status === "Open" ||
                        formData?.status === "Outcome_In_Progress" ||
                        formData?.status === "Draft" ||
                        formData?.status === "Closed" ||
                        formData?.status === "Rejected"
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </TabPane>
          <TabPane tab="Analysis" key="1">
            <div style={{ display: "flex", justifyContent: "end" }}>
              <div>
                {activeModules?.includes("AI_FEATURES") ? (
                  <>
                    <Radio.Group
                      onChange={(e) => {
                        setReRankingType(e.target.value)
                      }}
                      value={reRankingType}
                      options={[
                        { value: 1, label: 'WeightedRanker' },
                        { value: 2, label: 'RRFRanker' },
                        { value: 3, label: 'LLM Reranking'}
                      ]}
                    />
                    <Tooltip title="AI Suggestion">
                      <IconButton
                        style={{
                          fill: "#0E497A",
                          cursor: "pointer",
                          width: "28px",
                          height: "37px",
                          marginRight: "30px",
                          marginTop: "-12px",
                        }}
                      >
                        <Button
                          type="text"
                          icon={<StarSvg />}
                          onClick={() => showAISuggestions("Any")}
                        />
                      </IconButton>
                    </Tooltip>
                  </>
                ) : (
                  ""
                )}
              </div>
            </div>

            {/* <div ref={refForCapaFormAnalyse2}> */}
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Form.Item
                  label={
                    <>
                      {`Correction/Containment Action :`}
                      {activeModules?.includes("AI_FEATURES") && (
                        <Tooltip title="Suggestions">
                          <IconButton
                            style={{ padding: 0, margin: 0 }}
                            onClick={() => handleOpenModal("containmentAction")}
                          >
                            <MdSearch />
                          </IconButton>
                        </Tooltip>
                      )}
                    </>
                  }
                  name="containmentAction"
                  style={{
                    //paddingBottom: "2rem",
                    fontSize: "15px",
                    fontWeight: "bold",
                    color: "#003566",
                    marginBottom: 0,
                    paddingTop: "10px",
                  }}
                  className={classes.disabledInput}
                  rules={[
                    {
                      validator: validateTitle,
                    },
                  ]}
                >
                  {/* <div ref={refForCapaFormAnalyse3}> */}
                  <TextArea
                    rows={2}
                    name="containmentAction"
                    onChange={(e) => handleInputChange(e)}
                    value={formData?.containmentAction}
                    disabled={
                      readMode ||
                      formData?.status === "Open" ||
                      formData?.status === "Outcome_In_Progress" ||
                      formData?.status === "Draft" ||
                      formData?.status === "Closed" ||
                      formData?.status === "Rejected"
                    }
                  />
                  {/* </div> */}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Form.Item
                  label={
                    <>
                      {`Root Cause Analysis :`}
                      {activeModules?.includes("AI_FEATURES") && (
                        <Tooltip title="Suggestions">
                          <IconButton
                            style={{ padding: 0, margin: 0 }}
                            onClick={() => {
                              handleOpenModal("rootCauseAnalysis");
                            }}
                          >
                            <MdSearch />
                          </IconButton>
                        </Tooltip>
                      )}
                    </>
                  }
                  name="rootCauseAnalysis"
                  style={{
                    //  paddingBottom: "2rem",
                    fontSize: "15px",
                    fontWeight: "bold",
                    color: "#003566",
                    marginBottom: 0,
                    paddingTop: "10px",
                  }}
                  className={classes.disabledInput}
                  rules={[
                    {
                      validator: validateTitle,
                    },
                  ]}
                >
                  {/* <div ref={refForCapaFormAnalyse4}> */}
                  <TextArea
                    rows={2}
                    name="rootCauseAnalysis"
                    onChange={(e) => handleInputChange(e)}
                    value={formData?.rootCauseAnalysis}
                    disabled={
                      readMode ||
                      formData?.status === "Open" ||
                      formData?.status === "Outcome_In_Progress" ||
                      formData?.status === "Draft" ||
                      formData?.status === "Closed" ||
                      formData?.status === "Rejected"
                    }
                  />
                  {/* </div> */}
                </Form.Item>
              </Col>
            </Row>

            <Row
              gutter={[16, 16]}
              style={{
                display: "flex",
                flexDirection: matches ? "row" : "column",
              }}
            >
              <Col span={matches ? 12 : 24}>
                <Form.Item
                  label={
                    <>
                      {`Planned Corrective Action :`}
                      {activeModules?.includes("AI_FEATURES") && (
                        <Tooltip title="Suggestions">
                          <IconButton
                            style={{ padding: 0, margin: 0 }}
                            onClick={() => handleOpenModal("correctiveAction")}
                          >
                            <MdSearch />
                          </IconButton>
                        </Tooltip>
                      )}
                    </>
                  }
                  name="correctiveAction"
                  style={{
                    // paddingBottom: "2rem",
                    fontSize: "15px",
                    fontWeight: "bold",
                    color: "#003566",
                    marginBottom: 0,
                    paddingTop: "10px",
                  }}
                  className={classes.disabledInput}
                  rules={[
                    {
                      validator: validateTitle,
                    },
                  ]}
                >
                  {/* <div ref={refForCapaFormAnalyse5}> */}
                  <TextArea
                    rows={2}
                    name="correctiveAction"
                    onChange={(e) => handleInputChange(e)}
                    value={formData?.correctiveAction}
                    disabled={
                      readMode ||
                      formData?.status === "Open" ||
                      formData?.status === "Outcome_In_Progress" ||
                      formData?.status === "Draft" ||
                      formData?.status === "Closed" ||
                      formData?.status === "Rejected"
                    }
                  />
                  {/* </div> */}
                </Form.Item>
              </Col>

              <Col span={matches ? 12 : 24}>
                <Form.Item
                  label={`Target Date:`}
                  name="targetDate"
                  style={{
                    paddingBottom: "2rem",
                    fontSize: "15px",
                    fontWeight: "bold",
                    color: "#003566",
                    marginBottom: 0,
                    paddingTop: "10px",
                  }}
                  className={classes.disabledInput}
                >
                  {/* <div ref={refForCapaFormAnalyse6}> */}
                  <Input
                    name="targetDate"
                    size="large"
                    onChange={(e: any) => {
                      setFormData({
                        ...formData,
                        targetDate: e.target.value,
                      });
                    }}
                    disabled={
                      readMode ||
                      formData?.status === "Open" ||
                      formData?.status === "Outcome_In_Progress" ||
                      formData?.status === "Draft" ||
                      formData?.status === "Closed" ||
                      formData?.status === "Rejected"
                    }
                    value={
                      formData?.targetDate
                        ? dayjs(formData?.targetDate).format("DD-MM-YYYY")
                        : undefined
                    }
                    type="date"
                  />
                  {/* </div> */}
                </Form.Item>
              </Col>
            </Row>
            {/* </div> */}

            {/* // table for action iteams */}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px",
              }}
            >
              <strong>Add Action Item</strong>
              <Button
                onClick={() => {
                  addHandlerTable();
                }}
                disabled={
                  readMode ||
                  formData?.status === "Open" ||
                  formData?.status === "Outcome_In_Progress" ||
                  formData?.status === "Draft" ||
                  formData?.status === "Closed" ||
                  formData?.status === "Rejected"
                }
                // onClick={() => setOpen(true)}
                type="primary"
                // ref={refForCapaFormAnalyse7}
              >
                Add
              </Button>
            </div>

            <div>
              <Table
                // className={classform.documentTable}
                rowClassName={() => "editable-row"}
                bordered
                columns={Columns}
                style={{ width: "auto", overflow: "scroll" }}
                dataSource={capaTableData}
                pagination={false}
              />
            </div>

            <Modal
              title="Add Action Item"
              centered
              // open={modalCommentState}
              open={open}
              onOk={() => setOpen(false)}
              onCancel={() => setOpen(false)}
              footer={[
                <Button
                  key="submit"
                  type="primary"
                  onClick={() => {
                    TableDataAddHandler(capaFormData._id);
                  }}
                  disabled={buttonAddCheck}
                  // ref={refForCapaFormAnalyse12}
                >
                  {/* Submit */}
                  {capaFormData.mode === "create" ? "Submit" : "Update"}
                </Button>,
              ]}
              width={800}
              closeIcon={
                <img
                  src={CloseIconImageSvg}
                  alt="close-drawer"
                  style={{ width: "36px", height: "38px", cursor: "pointer" }}
                />
              }
            >
              <Form
                form={firstForm}
                layout="vertical"

                // rootClassName={classes.labelStyle}
                // disabled={disableFormFields}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "end",
                    gap: "5px",
                    alignItems: "center",
                    marginTop: "10px",
                  }}
                >
                  <span>Status :{""}</span>
                  <Switch
                    checked={capaFormData.status}
                    style={{
                      backgroundColor: capaFormData.status ? "#003566" : "",
                      width: "70px",
                    }}
                    // className={classes.switch}
                    checkedChildren={"Open"}
                    unCheckedChildren={"Close"}
                    onChange={(e) => {
                      setCapaFormData({
                        ...capaFormData,
                        status: !capaFormData.status,
                      });
                      // console.log("statuss====", e);
                    }}
                    disabled={capaFormData.buttonStatus}
                  />
                </div>

                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Form.Item
                      label="Action Item: "
                      name="title"
                      rules={[
                        {
                          required: true,
                          message: "Please Enter Action Item Name!",
                        },

                        {
                          validator: validateTitle,
                        },
                      ]}
                      className={classes.disabledInput}
                      style={{ paddingTop: "10px", marginBottom: 0 }}
                    >
                      {/* <div ref={refForCapaFormAnalyse8}> */}
                      <Input
                        name="title"
                        placeholder="Enter Action Item Name"
                        size="large"
                        onChange={(e: any) => {
                          setCapaFormData({
                            ...capaFormData,
                            ["title"]: e.target.value,
                          });
                        }}
                        value={capaFormData?.title}
                        disabled={capaFormData.buttonStatus}
                      />
                      {/* </div> */}
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Form.Item
                      label="Responsible Person: "
                      name="owner"
                      rules={[
                        {
                          required: true,
                          message: "Please select a user!",
                        },
                      ]}
                      style={{ paddingTop: "10px", marginBottom: 0 }}
                    >
                      <AntSelect
                        showSearch
                        placeholder="Select Owner(s)"
                        style={{
                          width: "100%",
                          // paddingTop: "10px",
                          // marginBottom: 0,
                          fontSize: "12px", // Reduce font size for selected items
                        }}
                        className={classes.disabledInput}
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

                          setCapaFormData({
                            ...capaFormData,
                            owner: selectedUsers || [], // Ensure that an empty array is set if no attendees are selected
                          });
                        }}
                        size="large"
                        defaultValue={capaFormData?.owner || []} // Set default value to an empty array if no attendees are selected
                        filterOption={(input: any, option: any) =>
                          option?.label
                            ?.toLowerCase()
                            .indexOf(input?.toLowerCase()) >= 0
                        }
                        // disabled={readStatus}
                        listHeight={200}
                      />
                      {/* <Autocomplete

                  multiple={true}
                  options={suggestions}
                  getOptionLabel={(option: any) => {
                    return option["email"];
                  }}
                  getOptionSelected={(option, value) => option.id === value.id}
                  limitTags={1}
                  size="small"
                  onChange={(e, value) => {
                    console.log("autocomplete>>>>>>>>",value)
                    selectReviewReviewHandler("owner", value);
                  }}
                  value={capaFormData?.owner}
                  disabled={capaFormData.buttonStatus}
                  // disabled={tableForm.buttonStatus}
                  filterSelectedOptions
                  renderOption={(option) => {
                    return (
                      <>
                        <div>
                          <MenuItem key={option.id}>
                            <ListItemAvatar>
                              <Avatar>
                                <Avatar src={`${API_LINK}/${option.avatar}`} />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={option.email}
                              secondary={option.email}
                            />
                          </MenuItem>
                        </div>
                      </>
                    );
                  }}
                  renderInput={(params) => {
                    return (
                      <TextField
                        {...params}
                        variant="outlined"
                        placeholder={"Owner"}
                        onChange={handleTextChange}
                        size="small"
                        // disabled={showData ? false : true}
                        InputLabelProps={{ shrink: false }}
                      />
                    );
                  }}
                /> */}
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      label="Target Date: "
                      name="targetDate"
                      rules={[
                        {
                          required: true,
                          message: "Please Enter Target Date!",
                        },
                      ]}
                      className={classes.disabledInput}
                      style={{ paddingTop: "10px", marginBottom: 0 }}
                    >
                      {/* <div ref={refForCapaFormAnalyse10}> */}
                      <Input
                        name=" targetDate"
                        type="date"
                        size="large"
                        onChange={(e: any) => {
                          setCapaFormData({
                            ...capaFormData,
                            ["targetDate"]: e.target.value,
                          });
                        }}
                        value={capaFormData?.endDate}
                        disabled={capaFormData.buttonStatus}
                      />
                      {/* </div> */}
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col span={4}></Col>
                  <Col span={24}>
                    <Form.Item
                      label="Description "
                      name="description"
                      rules={[
                        {
                          required: false,
                          message: "Please Enter description!",
                        },

                        {
                          validator: validateTitle,
                        },
                      ]}
                      className={classes.disabledInput}
                      style={{ paddingTop: "10px", marginBottom: 0 }}
                    >
                      {/* <div ref={refForCapaFormAnalyse11}> */}
                      <TextArea
                        rows={1}
                        autoSize={{ minRows: 1, maxRows: 6 }}
                        placeholder="Enter description"
                        size="large"
                        name="description"
                        onChange={(e: any) => {
                          setCapaFormData({
                            ...capaFormData,
                            ["description"]: e.target.value,
                          });
                        }}
                        value={capaFormData?.description}
                        disabled={capaFormData.buttonStatus}
                      />
                      {/* </div> */}
                    </Form.Item>
                  </Col>
                </Row>
                {/* <ActivityUpdateTable
            header={HeadersData}
            fields={FieldsData}
            data={activityUpdate}
            setData={setActivityUpdate}
            isAction={actionData.isAction}
            actions={actionData.actions}
            addFields={true}
            label={"Add Item"}
            disabled={true}
          
      
          /> */}
                <Row gutter={[16, 16]} style={{ marginBottom: "30px" }}>
                  <Col span={4}></Col>
                </Row>
                <Row
                  gutter={[16, 16]}
                  style={{ height: "auto", marginBottom: "30px" }}
                ></Row>
              </Form>
            </Modal>

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
                    fileList={formData.files}
                    multiple
                    disabled={
                      readMode ||
                      formData?.status === "Open" ||
                      formData?.status === "Outcome_In_Progress" ||
                      formData?.status === "Draft" ||
                      formData?.status === "Closed"
                    }
                  >
                    {/* <p className="ant-upload-drag-icon">
                <InboxIcon />
              </p> */}
                    <p className="ant-upload-text">Upload Files</p>
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
                formData.files &&
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
                      {/* <a
                      href={`${item?.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleLinkClick(item)}
                    > */}
                      {item?.name}
                      {/* </a> */}
                    </Typography>

                    <IconButton
                      disabled={
                        readMode ||
                        formData?.status === "Open" ||
                        formData?.status === "Outcome_In_Progress" ||
                        formData?.status === "Draft" ||
                        formData?.status === "Closed"
                      }
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
          </TabPane>
        </Tabs>
      </Form>
      <SuggestionModal
        open={isModalVisible}
        onCancel={handleCancel}
        onAccept={handleAccept}
        aiSuggestions={aiSuggestions}
      />
    </>
  );
};

export default CaraWhy;