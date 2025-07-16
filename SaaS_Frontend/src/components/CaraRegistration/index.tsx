import {
  IconButton,
  makeStyles,
  Typography,
  useMediaQuery,
} from "@material-ui/core";

import {
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  Button,
  Upload,
  Modal,
  Radio,
  Table,
  Spin,
  Tabs,
} from "antd";

import type { UploadProps, RadioChangeEvent } from "antd";

import { useEffect, useState } from "react";

import { API_LINK } from "config";
import axios from "../../apis/axios.global";

import TextArea from "antd/es/input/TextArea";
import { useSnackbar } from "notistack";
import { getEntityByLocationId } from "apis/entityApi";
import CrossIcon from "../../assets/icons/BluecrossIcon.svg";

import moment from "moment";
import dayjs from "dayjs";
import SuggestionModal from "./SuggestionModal";
import { MdNoteAdd } from "react-icons/md";
import { referencesData } from "recoil/atom";
import getSessionStorage from "utils/getSessionStorage";

import getAppUrl from "utils/getAppUrl";
import { validateDescription, validateTitle } from "utils/validateInput";

import { showLoader, hideLoader } from "components/GlobalLoader/loaderState"; // Import the functions to control loader
import { MdCheckBox } from "react-icons/md";
import { useRecoilState } from "recoil";
import DepartmentSelector from "components/ReusableComponents/DepartmentSelector";
const { Dragger } = Upload;
const { Option } = Select;
const { TabPane } = Tabs;

const useStyles = makeStyles((theme) => ({
  disabledInput: {
    "& .ant-input[disabled], & .ant-input[disabled]:not([type='textarea'])": {
      backgroundColor: "white",
      color: "black",

      // border: "none",
    },
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

  disabledSelect: {
    "& .ant-select-disabled .ant-select-selector": {
      backgroundColor: "white",
      background: "white !important",
      color: "black",

      // border: "none",
    },
    "& .ant-select-disabled .ant-select-selection-item": {
      color: "black",
      backgroundColor: "white",
    },
    "& .ant-select-disabled .ant-select-arrow": {
      display: "none",
    },
    "& .ant-select-disabled .ant-select-selection-item span": {
      color: "black !important", // Enforcing the color on the span element
    },
    // "&.ant-select-selector": {
    //   backgroundColor: "white",
    // },
  },

  disabledMultiSelect: {
    "& .ant-select-disabled.ant-select-multiple .ant-select-selector": {
      backgroundColor: "white !important",
      // border: "none",
    },
    "& .ant-select-disabled.ant-select-multiple .ant-select-selection-item": {
      color: "black",
      background: "white !important",

      // border: "none",
    },
    "& .ant-select-disabled .ant-select-arrow": {
      display: "none",
    },
  },
  root: {
    width: "100%",
    "& .MuiAccordionDetails-root": {
      display: "block",
    },
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
  caraData?: any;
  claimData?: any;
  suppliers?: any;
  claimsList?: any;
  formData?: any;
  setFormData?: any;
  open?: any;
  setOpen?: any;
  submitted?: boolean;
  setSubmitted?: any;
  readMode?: boolean;
  setFormStatus?: (formStatus: string) => void;
  setRejectEdit?: any;
  refForCapaForm2?: any;
  refForCapaForm3?: any;
  refForCapaForm4?: any;
  refForCapaForm5?: any;
  refForCapaForm6?: any;
  refForCapaForm7?: any;
  refForCapaForm8?: any;
  tableData?: any;
  setTableData?: any;
  // refsData?: any;
};
const CaraRegistration = ({
  drawer,
  setDrawer,
  handleDocFormCreated,
  uploadFileError,
  setUploadFileError,
  disableFormFields,
  disableDocType,
  formData,
  setFormData,
  isEdit,
  caraData,
  claimData,
  suppliers,
  claimsList,
  open,
  setOpen,
  submitted,
  setSubmitted,
  setFormStatus,
  readMode,
  setRejectEdit,
  refForCapaForm2,
  refForCapaForm3,
  refForCapaForm4,
  refForCapaForm5,
  refForCapaForm6,
  refForCapaForm7,
  refForCapaForm8,
  tableData,
  setTableData,
}: // refsData,
Props) => {
  const classes = useStyles();

  const [systems, setSystems] = useState<any>([]);
  const [optionsData, setOptionsData] = useState<any>([]);
  const [users, setUsers] = useState([]);
  const [entityUsers, setEntityUsers] = useState([]);
  const [entities, setEntities] = useState([]);
  const [selectedDept, setSelectedDept] = useState<any>({});
  const [kpis, setKpis] = useState([]);

  const [investForm] = Form.useForm();
  const [caraOwnerForm] = Form.useForm();
  const [value, setValue] = useState(1);
  const { enqueueSnackbar } = useSnackbar();

  const { RangePicker } = DatePicker;
  const [kpiSelect, setKpiSelect] = useState<any>(false);
  const [currentYear, setCurrentYear] = useState<any>();
  // const [reOpen, setReOpen] = useState<any>(false);
  // const [location, setLocation] = useState([]);
  const loggedInUser = JSON.parse(sessionStorage.getItem("userDetails") as any);
  const [selectedLocation, setSelectedLocation] = useState<any>({
    id: loggedInUser?.location?.id,
    locationName: loggedInUser?.location?.locationName,
  });
  const matches = useMediaQuery("(min-width:786px)");
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);

  const [locationOptions, setLocationOptions] = useState<any>([]);
  const [isModalVisible, setIsModalVisible] = useState<any>(false);
  const [currentField, setCurrentField] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<any>([
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book",
    "t has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum",
  ]);
  const [capaRelevantDocs, setCapaRelevantDocs] = useState<any>([]);
  const [capaDocsModal, setCapaDocsModal] = useState<boolean>(false);
  const [refData, setRefData] = useRecoilState(referencesData);
  const userDetails = getSessionStorage();
  const [activeModules, setActiveModules] = useState<any>([]);
  const [capaAISuggestionModal, setCapaAISuggestionModal] =
    useState<any>(false);
  const [capaAISuggestion, setCapaAISuggestion] = useState<any>();
  const [suggestionModalOpen, setSuggestionModalOpen] = useState<any>(true);
  const [containmentActionField, setContainmentActionField] = useState(true);
  const [rootCauseField, setRootCauseField] = useState(true);
  const [manField, setManField] = useState(true);
  const [machineField, setMachineField] = useState(true);
  const [materialField, setMaterialField] = useState(true);
  const [environmentField, setEnvironmentField] = useState(true);
  const [methodField, setMethodField] = useState(true);
  const [measurementField, setMeasurementField] = useState(true);
  const [why1Field, setWhy1Field] = useState(true);
  const [why2Field, setWhy2Field] = useState(true);
  const [why3Field, setWhy3Field] = useState(true);
  const [why4Field, setWhy4Field] = useState(true);
  const [why5Field, setWhy5Field] = useState(true);
  const realmName = getAppUrl();
  const [commentError, setCommentError] = useState("");

  //for capa ai suggestion modal
  const [addedRowsCapaDocs, setAddedRowsCapaDocs] = useState<any>({});

  const toggleAdded = (record: any) => {
    setAddedRowsCapaDocs((prev: any) => ({
      ...prev,
      [record.key]: !prev[record.key],
    }));
  };

  const validateComment = (value: any) => {
    let error = "";
    validateTitle(null, value, (validationError) => {
      if (validationError) {
        error = validationError;
      }
    });
    return error;
  };

  const showAISuggestions = async () => {
    if (formData?.status === "Open" || formData?.status === "Accepted") {
      setCapaAISuggestionModal(true);
      axios
        .post(`${process.env.REACT_APP_PY_URL}/pyapi/capaAISuggestions`, {
          query: {
            problemStatement: formData.title,
            problemDescription: formData.description,
            containmentAction: formData.containmentAction || "",
            rootCauseAnalysis: formData.rootCauseAnalysis || "",
            correctiveAction: formData.correctiveAction || "",
            man: formData.man || "",
            machine: formData.machine || "",
            environment: formData.environment || "",
            material: formData.material || "",
            method: formData.method || "",
            measurement: formData.measurement || "",
            why1: formData.why1 || "",
            why2: formData.why2 || "",
            why3: formData.why3 || "",
            why4: formData.why4 || "",
            why5: formData.why5 || "",
            preferedTechnique: "Any",
          },
        })
        .then((response) => {
          const obj = JSON.parse(response.data);
          setCapaAISuggestion(obj);
          setSuggestionModalOpen(false);
        });
    }
  };

  // useEffect(() => {
  //   if (
  //     drawer?.open &&
  //     suggestionModalOpen &&
  //     activeModules?.includes("AI_FEATURES")
  //   ) {
  //     if (
  //       formData.containmentAction === "" ||
  //       formData.containmentAction === null ||
  //       formData.containmentAction === undefined
  //     ) {
  //       setContainmentActionField(true);
  //     } else {
  //       setContainmentActionField(false);
  //     }

  //     if (
  //       formData.rootCauseAnalysis === "" ||
  //       formData.rootCauseAnalysis === null ||
  //       formData.rootCauseAnalysis === undefined
  //     ) {
  //       setRootCauseField(true);
  //     } else {
  //       setRootCauseField(false);
  //     }

  //     if (
  //       formData.man === "" ||
  //       formData.man === null ||
  //       formData.man === undefined
  //     ) {
  //       setManField(true);
  //     } else {
  //       setManField(false);
  //     }

  //     if (
  //       formData.machine === "" ||
  //       formData.machine === null ||
  //       formData.machine === undefined
  //     ) {
  //       setMachineField(true);
  //     } else {
  //       setMachineField(false);
  //     }

  //     if (
  //       formData.material === "" ||
  //       formData.material === null ||
  //       formData.material === undefined
  //     ) {
  //       setMaterialField(true);
  //     } else {
  //       setMaterialField(false);
  //     }

  //     if (
  //       formData.environment === "" ||
  //       formData.environment === null ||
  //       formData.environment === undefined
  //     ) {
  //       setEnvironmentField(true);
  //     } else {
  //       setEnvironmentField(false);
  //     }

  //     if (
  //       formData.method === "" ||
  //       formData.method === null ||
  //       formData.method === undefined
  //     ) {
  //       setMethodField(true);
  //     } else {
  //       setMethodField(false);
  //     }

  //     if (
  //       formData.measurement === "" ||
  //       formData.measurement === null ||
  //       formData.measurement === undefined
  //     ) {
  //       setMeasurementField(true);
  //     } else {
  //       setMeasurementField(false);
  //     }

  //     if (
  //       formData.why1 === "" ||
  //       formData.why1 === null ||
  //       formData.why1 === undefined
  //     ) {
  //       setWhy1Field(true);
  //     } else {
  //       setWhy1Field(false);
  //     }

  //     if (
  //       formData.why2 === "" ||
  //       formData.why2 === null ||
  //       formData.why2 === undefined
  //     ) {
  //       setWhy2Field(true);
  //     } else {
  //       setWhy2Field(false);
  //     }

  //     if (
  //       formData.why3 === "" ||
  //       formData.why3 === null ||
  //       formData.why3 === undefined
  //     ) {
  //       setWhy3Field(true);
  //     } else {
  //       setWhy3Field(false);
  //     }

  //     if (
  //       formData.why4 === "" ||
  //       formData.why4 === null ||
  //       formData.why4 === undefined
  //     ) {
  //       setWhy4Field(true);
  //     } else {
  //       setWhy4Field(false);
  //     }

  //     if (
  //       formData.why5 === "" ||
  //       formData.why5 === null ||
  //       formData.why5 === undefined
  //     ) {
  //       setWhy5Field(true);
  //     } else {
  //       setWhy5Field(false);
  //     }
  //     // showAISuggestions();
  //   }
  // }, [formData]);
  // console.log("formdata in capa", formData);
  useEffect(() => {
    // getyear();
    // console.log("use 1", formData?.entity);
    getActiveModules();
    if (drawer.open) {
      if (isEdit === false) {
        investForm.resetFields();
        caraOwnerForm.resetFields();
      }
    } else if (!drawer?.open) {
      setCapaAISuggestion(undefined);
      setSuggestionModalOpen(true);
      setContainmentActionField(true);
    }
  }, [isEdit, drawer?.open]);
  useEffect(() => {
    if (open) {
      getAllUserByEntities();
    }
  }, [open]);
  // console.log("formdata in cara", formData);
  useEffect(() => {
    if (drawer?.open) {
      if (isEdit) {
        // console.log("formdata in useeffect isedit inside", formData);
        if (formData?.origin?._id) {
          investForm.setFieldsValue({
            origin: formData?.origin?._id || "",
          });
        }
        if (formData?.kpiId) {
          investForm.setFieldsValue({ kpiId: formData?.kpiId });
        }
        if (formData?.locationId) {
          investForm.setFieldsValue({ locationId: formData?.locationId });
          // investForm.setFieldsValue({ location: formData?.locationId });
        }
        if (formData?.highPriority) {
          investForm.setFieldsValue({ highPriority: formData?.highPriority });
        }
        if (formData?.impact) {
          investForm.setFieldsValue({ impact: formData?.impact });
        }
        if (formData?.impactType) {
          investForm.setFieldsValue({ impactType: formData?.impactType });
        }
        if (formData?.serialNumber) {
          investForm.setFieldsValue({
            serialNumber: formData?.serialNumber,
          });
        }

        if (formData?.description) {
          investForm.setFieldsValue({ description: formData?.description });
        }
        if (formData?.title) {
          investForm.setFieldsValue({ title: formData?.title });
        }
        if (formData?.registeredBy) {
          investForm.setFieldsValue({
            registeredBy: formData?.registeredBy?.username,
          });
        }
        if (formData?.caraCoordinator) {
          investForm.setFieldsValue({
            caraCoordinator: formData?.caraCoordinator?.id,
            coordinator: formData?.coordinator,
          });
        }
        if (formData?.entity) {
          investForm.setFieldsValue({ entity: formData?.entity });
        }
        const systemValues = formData?.systems?.map((system: any) => system);
        investForm.setFieldsValue({ systems: systemValues });

        if (formData?.startDate && formData?.endDate) {
          const formattedStartDate = moment(formData?.startDate).format(
            "DD-MM-YYYY"
          );
          const formattedEndDate = moment(formData?.endDate).format(
            "DD-MM-YYYY"
          );
          investForm.setFieldsValue({
            startDate: formattedStartDate,
            endDate: formattedEndDate,
          });
        }
        if (formData?.caraOwner) {
          investForm.setFieldsValue({ caraOwner: formData?.caraOwner });
        }
        if (formData?.status) {
          if (formData?.status === "Accepted") {
            setValue(1);
          } else if (formData?.status === "Rejected") {
            setValue(2);
            setRejectEdit(true);
            investForm.setFieldsValue({ comments: "" });
          }
        }
      }
    }
  }, [drawer?.open, isEdit, formData]);
  useEffect(() => {
    if (formData?.entity) {
      getAllUserForEntity(formData?.entity);
    }
  }, [formData?.entity]);
  useEffect(() => {
    getAllUserByEntities();
  }, [open]);

  const uploadFileprops: UploadProps = {
    action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
    multiple: true,
    beforeUpload: () => false,
    onRemove: (file) => {
      const updatedFileList = formData.registerfiles.filter(
        (item: any) => item.uid !== file.uid
      );
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        registerfiles: updatedFileList,
      }));
    },
    onChange({ file, fileList }) {
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        registerfiles: fileList,
      }));
    },
  };
  const getActiveModules = async () => {
    await axios(`/api/organization/getAllActiveModules/${realmName}`)
      .then((res) => {
        setActiveModules(res.data.activeModules);
      })
      .catch((err) => console.error(err));
  };
  // console.log("users", users);
  const onChange = (e: RadioChangeEvent) => {
    setValue(e.target.value);
    const status = e.target.value === 1 ? "Accepted" : "Rejected";

    setFormData({
      ...formData,

      status: status,
    });

    // console.log(e.target.value, "formData...Detail");
  };
  // console.log(systems, "formData...Detail");
  const handleDateRange = (values: any) => {
    if (!values || !Array.isArray(values)) {
      // Handle the case where values is not defined or not an array

      enqueueSnackbar("select a valid date range", { variant: "error" });
      return;
    }
    const [start, end] = values; // Destructure values to get the start and end moments
    const startDate = start?.format("YYYY-MM-DD");
    const endDate = end?.format("YYYY-MM-DD");
    const date = {
      startDate: startDate,
      endDate: endDate,
    };

    setFormData({
      ...formData,
      date: date,
      startDate: startDate,
      endDate: endDate,
    });
  };
  // console.log("users", users);
  useEffect(() => {
    getAllKpis();
    getData();
    getAllLocations();
    fetchSystemNames();
    getAllEntities();
    // getAllUserByEntities();
  }, [selectedLocation]);

  // console.log("formdata in cara registeration and isedit", formData, isEdit);

  const getAllEntities = async () => {
    try {
      // console.log("location", selectedLocation);
      const data = await getEntityByLocationId(selectedLocation?.id);
      // console.log(data, "entities");
      if (data?.data) {
        setEntities(
          data.data?.map((item: any) => ({
            ...item,
            label: item.entityName,
            value: item.id,
          }))
        );
      }
    } catch (error) {}
  };

  const getAllUserByEntities = async () => {
    try {
      // console.log("get all users called", formData?.entity);
      //let entityId = JSON.parse(window.sessionStorage.getItem("userDetails")!);
      const data = await axios.get(
        `/api/cara/getAllUsersOfEntity/${formData?.entity}`
      );

      if (data?.data) {
        // console.log(data?.data?.otherUsers, "users");

        // Combine both arrays with unique users while preserving order
        const userMap = new Map();
        (data?.data?.deptHead || []).forEach((user: any) =>
          userMap.set(user.id, user)
        );
        (data?.data?.otherUsers || []).forEach((user: any) =>
          userMap.set(user.id, user)
        );

        const combinedUsers: any = Array.from(userMap.values());
        setUsers(combinedUsers);
        // console.log("combined users", combinedUsers);
        // Set default value for caraOwner if not already set
        // if (
        //   !formData?.caraOwner &&
        //   combinedUsers?.length > 0 &&
        //   !!combinedUsers
        // ) {
        //   setFormData({ ...formData, caraOwner: combinedUsers[0]?.id });
        // }
      }
    } catch (error) {}
  };
  // console.log("entity users", entityUsers);
  const getAllUserForEntity = async (entity: any) => {
    try {
      const data = await axios.get(`/api/cara/getAllUsersOfEntity/${entity}`);

      if (data?.data) {
        // Combine both arrays with unique users while preserving order
        const userMap = new Map();

        // Adding deptHead users
        (data?.data?.deptHead || []).forEach((user: any) =>
          userMap.set(user.id, { value: user.id, label: user.username })
        );

        // Adding otherUsers
        (data?.data?.otherUsers || []).forEach((user: any) =>
          userMap.set(user.id, { value: user.id, label: user.username })
        );

        // Convert the map to an array
        const combinedUsers: any = Array.from(userMap.values());

        // Set the combined users in state
        setEntityUsers(combinedUsers);
        // setUsers(combinedUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const getData = async () => {
    try {
      const res = await axios.get(`/api/cara/getAllDeviationType`);
      if (res?.data) {
        setOptionsData(res?.data?.data);
      }
    } catch (err) {
      enqueueSnackbar(`Error While Fetching Data`, { variant: "error" });
    }
  };
  const hideModal = (val: string) => {
    if (val === "Accepted" && formData.status === "Accepted") {
      setSubmitted(true);
      if (setFormStatus) {
        setFormStatus("Submitted");
      }
    } else if (formData.status === "Rejected") {
      if (setFormStatus) {
        setFormStatus("Rejected");
      }
    }
    setOpen(false);
  };

  const handleKpiName = (e: any) => {
    setFormData({
      ...formData,
      kpiId: e,
    });
  };

  const [error, setError] = useState("");
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    validateDescription(null, value, (error) => {
      if (error) {
        // Handle the validation error (e.g., set an error state or show a message)
        console.error(error);
        setError(error);
      } else {
        // Only update form data if there are no validation errors
        setError("");
        setFormData((prevFormData: any) => ({
          ...prevFormData,
          [name]: value,
        }));
      }
    });
  };

  const clearFile = async (data: any) => {
    try {
      const updatedFileList = formData.registerfiles.filter(
        (item: any) => item.uid !== data.uid
      );
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        registerfiles: updatedFileList,
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
  const viewObjectStorageDoc = async (link: any) => {
    const response = await axios.post(`${API_LINK}/api/documents/viewerOBJ`, {
      documentLink: link,
    });
    return response.data;
  };

  const getAllKpis = async () => {
    try {
      const res = await axios.get(`api/kpi-definition/getAllKpi`);
      if (res.data) {
        setKpis(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  // const parselocation: any = (data: any) => {
  //   let locations: any = [];
  //   data?.map((item: any) => {
  //     locations.push({
  //       locationName: item.locationName,
  //       id: item.id,
  //     });
  //   });

  //   return locations;
  // };
  const GetSystems = async (locationId: any) => {
    let encodedSystems: any;
    if (locationId === "All") {
      encodedSystems = encodeURIComponent(JSON.stringify(locationId));
    } else {
      encodedSystems = encodeURIComponent(JSON.stringify(locationId));
    }
    const { data } = await axios.get(
      `api/systems/displaySystemsForGivenLocation/${encodedSystems}`
    );
    setSystems([
      ...data?.map((item: any) => ({
        ...item,
        label: item.name,
        value: item.id,
      })),
    ]);
    //console.log("systems", systems);
  };
  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const fetchSystemNames = async () => {
    try {
      const locationData = JSON.parse(
        window.sessionStorage.getItem("userDetails")!
      );
      const encodedLoc = encodeURIComponent(
        JSON.stringify([locationData.location.id])
      );
      GetSystems(selectedLocation?.id);

      // setSystems(response);
    } catch (error) {
      console.log({ error });
      enqueueSnackbar("Something went wrong while fetching system types1!", {
        variant: "error",
      });
    }
  };
  // const getSuggestionListLocation = (value: any, type: string) => {
  //   typeAheadValue = value;
  //   typeAheadType = type;
  //   debouncedSearchLocation();
  // };

  // const debouncedSearchLocation = debounce(() => {
  //   getLocation(typeAheadValue, typeAheadType);
  // }, 50);

  const getAllLocations = async () => {
    try {
      const res = await axios.get(
        `/api/riskregister/getAllLocation/${loggedInUser?.organizationId}`
      );

      if (res.status === 200 || res.status === 201) {
        // console.log("checkrisk res in getAllDepartments", res);
        if (res?.data?.data && !!res.data.data.length) {
          setLocationOptions(
            res?.data?.data?.map((item: any) => ({
              ...item,
              value: item.id,
              label: item.locationName,
            }))
          );
        } else {
          setLocationOptions([]);
          enqueueSnackbar("No Departments Found", {
            variant: "warning",
          });
        }
      } else {
        // setJobTitleOptions([]);
        enqueueSnackbar("Error in fetching getAllDepartments", {
          variant: "error",
        });
      }
    } catch (error) {
      // console.log("checkrisk error in fetching all job title", error);
    }
  };

  const showModal = (field: string) => {
    setCurrentField(field);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

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

  const handleSearchCapaInDoc = async () => {
    try {
      const body = {
        query: formData?.description,
        top_k: 1,
      };
      console.log("body in search capa in doc", body);
      setAddedRowsCapaDocs({});
      showLoader("Searching For Relevant Docs...");
      const res = await axios.post(
        `${process.env.REACT_APP_PY_URL}/pyapi/searchCapaInDoc`,
        body
      );
      console.log("res in search capa in doc", res);
      if (res?.status === 200 || res?.status === 201) {
        if (res?.data?.length) {
          setCapaRelevantDocs(res?.data);
          setCapaDocsModal(true);
          hideLoader();
        } else {
          enqueueSnackbar("No relevant documents found", {
            variant: "warning",
          });
        }
      } else {
        enqueueSnackbar("Error in fetching relevant documents", {
          variant: "error",
        });
      }
    } catch (error) {
      console.log("error in search capa in doc", error);
    }
  };

  const handleCreateFlaggedDocRefToRefTable = async (record: any) => {
    if (formData?._id) {
      const refObj: any = {
        refId: record?.docId,
        organizationId: userDetails?.organizationId,
        type: "Document",
        comments: "Enter Your Comment Here",
        name: record?.docName,
        createdBy: userDetails?.firstName + " " + userDetails?.lastName,
        updatedBy: null,
        link: record?.docUrl,
        refTo: formData?._id,
        refToModule: "CAPA",
        isFlagged: false,
      };
      const refResponse = await axios.post("/api/refs/bulk-insert", [refObj]);
      if (refResponse?.status === 200 || refResponse?.status === 201) {
        enqueueSnackbar(`Reference created successfully`, {
          variant: "success",
        });
        toggleAdded(record);
      } else {
        enqueueSnackbar(`Error in creating reference`, {
          variant: "error",
        });
        return;
      }
    } else {
      enqueueSnackbar(`Error in creating reference, capa id not found!`, {
        variant: "error",
      });
      return;
    }
  };

  const handleAddReference = (record: any) => {
    console.log("checkcapanew in handleaddreference", record);
    setRefData([
      ...refData,
      {
        name: record?.docName,
        refId: record?.docId,
        type: "Document",
        comments: "Enter Your Comment Here",
        createdBy: userDetails?.firstName + " " + userDetails?.lastName,
        updatedBy: null,
        link: record?.docUrl,
      },
    ]);
    setTableData([
      ...tableData,
      {
        name: record?.docName,
        refId: record?.docId,
        type: "Document",
        comments: "Enter Your Comment Here",
        createdBy: userDetails?.firstName + " " + userDetails?.lastName,
        updatedBy: null,
        link: record?.docUrl,
      },
    ]);
    handleCreateFlaggedDocRefToRefTable(record);
  };

  const columns = [
    {
      title: "Doc Name",
      dataIndex: "docName",
      key: "docName",
      width: 50,
      // render: (_: any, record: any) => (
      //   <div
      //     style={{
      //       verticalAlign: "top", // Align text to the top
      //       // display: "block", // Make the content behave like a block element
      //     }}
      //   >
      //     {record?.selectedRiskType?.name || "N/A"}
      //   </div>
      // ),
    },
    {
      title: "Similarity",
      dataIndex: "similarity",
      key: "similarity",
      width: 50,
      render: (_: any, record: any) => (
        <>{record?.similarity.toFixed(2) * 100 + "%"}</>
      ),
    },
    {
      title: "text",
      dataIndex: "text",
      key: "text",
      width: 300,
      render: (_: any, record: any) => (
        <div
          style={{
            width: "100%",
            height: "120px",
            overflowY: "auto",
            border: "1px solid black",
          }}
        >
          {record?.text}
        </div>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 50,
      render: (_: any, record: any) => (
        <>
          {addedRowsCapaDocs[record.key] ? (
            <MdCheckBox />
          ) : (
            <Button
              type="text"
              icon={<MdNoteAdd />}
              onClick={() => handleAddReference(record)}
            />
          )}
        </>
      ),
    },
  ];

  const aiModalAccept = (field: any, text: any) => {
    if (field) {
      setFormData({
        ...formData,
        [field]: text,
      });
      investForm?.setFieldsValue({
        [field]: text,
      });
    }
  };

  return (
    <>
      <Form
        layout="vertical"
        form={investForm}
        //initialValues={{ entityId: formData?.entityId?.entityName }}
        initialValues={{
          locationId: loggedInUser?.location?.id,
          //  caraOwner: loggedInUser.id,
        }}
        onValuesChange={(changedValues, allValues) =>
          setFormData({ ...formData, ...changedValues })
        }
        rootClassName={classes.labelStyle}
      >
        {/* <Button
        type="dashed"
        style={{
          marginBottom: "10px",
        }}
      >
        {formData?.status ?? "Form Status"}
      </Button> */}

        <Row gutter={[12, 12]}>
          <Col span={24}>
            <Form.Item
              label="Problem Statement" // Ant Design will automatically add the asterisk here for required fields
              name="title"
              rules={[
                {
                  required: true, // Ensures the field is required, so the asterisk will appear
                },
                {
                  validator: validateTitle,
                },
              ]}
              className={classes.disabledInput}
              style={{ marginBottom: 0, paddingTop: "10px" }}
            >
              {/* Wrapper div for the label and the warning icon */}

              {/* Input component */}
              <Input
                placeholder="Enter CAPA title"
                size="large"
                name="title"
                onChange={(e: any) => handleChange(e)}
                value={formData?.title}
                defaultValue={formData?.title}
                required={true}
                disabled={
                  readMode ||
                  formData?.status === "Open" ||
                  formData?.status === "Accepted" ||
                  formData?.status === "Outcome_In_Progress" ||
                  formData?.status === "Analysis_In_Progress" ||
                  formData?.status === "Closed"
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Row
          gutter={[12, 12]}
          style={{
            display: "flex",
            flexDirection: matches ? "row" : "column",
            gap: "0px",
          }}
        >
          <Col span={matches ? 12 : 24}>
            <Form.Item
              label="Type:"
              name="type"
              rules={[
                {
                  required: true,
                },
              ]}
              className={classes.disabledSelect}
              style={{ paddingTop: "10px" }}
            >
              {/* <div ref={refForCapaForm3}> */}
              <Select
                placeholder="Select Type"
                size="large"
                value={formData?.type}
                disabled={true}
                defaultValue="Manual"
              >
                <Option value="manual" label="Manual" key="manual">
                  Manual
                </Option>
                <Option value="system" label="System" key="system">
                  System
                </Option>
              </Select>
              {/* </div> */}
            </Form.Item>
          </Col>
          <Col span={matches ? 12 : 24}>
            <Form.Item
              label="Origin:"
              name="origin"
              rules={[
                {
                  required: true,
                },
              ]}
              className={classes.disabledSelect}
              style={{ paddingTop: "10px" }}
            >
              {/* <div ref={refForCapaForm4}> */}
              <Select
                placeholder="Select Origin"
                onSelect={(value: string) => {
                  const selectedOption = optionsData.find(
                    (option: any) => option._id === value
                  );
                  const isKpiSelected: boolean =
                    selectedOption &&
                    selectedOption.deviationType?.toLowerCase().includes("kpi");
                  // console.log("iskpiselected", isKpiSelected, selectedOption);
                  setKpiSelect(isKpiSelected);
                  setFormData({
                    ...formData,
                    origin: value,
                  });
                }}
                size="large"
                value={formData?.origin}
                disabled={
                  readMode ||
                  formData?.status === "Open" ||
                  formData?.status === "Accepted" ||
                  formData?.status === "Outcome_In_Progress" ||
                  formData?.status === "Analysis_In_Progress" ||
                  formData?.status === "Closed"
                }
              >
                {optionsData?.map((option: any) => (
                  <Option
                    value={option._id}
                    label={option.deviationType}
                    key={option._id}
                  >
                    {option?.deviationType}
                  </Option>
                ))}
              </Select>
              {/* </div> */}
            </Form.Item>
          </Col>
        </Row>
        {(kpiSelect || formData?.kpiId) && (
          <Form.Item
            label={` Kpi Name :`}
            name="kpiId"
            className={classes.disabledSelect}
          >
            <Select
              placeholder="Select Kpi Name"
              onChange={handleKpiName}
              size="large"
              value={formData?.kpiId}
              disabled={
                readMode ||
                formData?.status === "Open" ||
                formData?.status === "Accepted" ||
                formData?.status === "Outcome_In_Progress" ||
                formData?.status === "Analysis_In_Progress" ||
                formData?.status === "Closed"
              }
            >
              {kpis &&
                kpis?.length > 0 &&
                kpis?.map((kpi: any) => {
                  return (
                    <Option value={kpi?._id} label={kpi?.kpiName} key={kpi?.id}>
                      {kpi.kpiName}
                    </Option>
                  );
                })}
            </Select>
          </Form.Item>
        )}
        {(kpiSelect || formData.kpiId) && (
          <Col span={24}>
            <Form.Item label="Deviation From: ">
              <RangePicker
                format="DD-MM-YYYY"
                value={[
                  formData?.startDate ? dayjs(formData?.startDate) : null,
                  formData?.endDate ? dayjs(formData?.endDate) : null, // Static end date
                ]}
                onChange={handleDateRange}
                disabled={
                  readMode ||
                  formData?.status === "Open" ||
                  formData?.status === "Accepted" ||
                  formData?.status === "Outcome_In_Progress" ||
                  formData?.status === "Analysis_In_Progress" ||
                  formData?.status === "Closed"
                }
                // disabled={readStatus}
              />
            </Form.Item>
          </Col>
        )}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item
              label={
                // activeModules?.includes("AI_FEATURES") && isEdit ? (
                //   <div
                //     style={{
                //       display: "flex",
                //       justifyContent: "flex-start",
                //       alignItems: "flex-end",
                //     }}
                //   >
                //     Description{" "}
                //     <Tooltip title="AI Suggestion">

                //       <Button
                //         type="text"
                //         icon={<AiIcon />}
                //         onClick={() => handleSearchCapaInDoc()}
                //       />
                //     </Tooltip>
                //   </div>
                // ) : (
                <>Description</>
                // )
              }
              name="description"
              className={classes.disabledInput}
              // style={{ marginBottom: 0, paddingTop: "10px" }}

              rules={[
                {
                  validator: validateDescription,
                },
              ]}
            >
              {/* <div ref={refForCapaForm5}> */}
              <TextArea
                rows={6} // Increase the number of rows to adjust the height
                autoSize={{ minRows: 3, maxRows: 6 }} // You can adjust minRows and maxRows as per your preference
                placeholder="Enter Description"
                size="large"
                name="description"
                onChange={(e: any) => handleInputChange(e)}
                value={formData?.description}
                defaultValue={formData?.description}
                required={true}
                disabled={
                  readMode ||
                  formData?.status === "Open" ||
                  formData?.status === "Accepted" ||
                  formData?.status === "Outcome_In_Progress" ||
                  formData?.status === "Analysis_In_Progress" ||
                  formData?.status === "Closed"
                }
              />
              {error && <p style={{ color: "red", margin: "0" }}>{error}</p>}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={10}>
            <Form.Item
              label={
                // activeModules?.includes("AI_FEATURES") && isEdit ? (
                //   <div
                //     style={{
                //       display: "flex",
                //       justifyContent: "flex-start",
                //       alignItems: "flex-end",
                //     }}
                //   >
                //     Description{" "}
                //     <Tooltip title="AI Suggestion">

                //       <Button
                //         type="text"
                //         icon={<AiIcon />}
                //         onClick={() => handleSearchCapaInDoc()}
                //       />
                //     </Tooltip>
                //   </div>
                // ) : (
                <>Impact Type</>
                // )
              }
              name="impactType"
              className={classes.disabledInput}
              // style={{ marginBottom: 0, paddingTop: "10px" }}
            >
              {/* <div ref={refForCapaForm5}> */}
              <Input
                name="impactType"
                value={formData?.impactType}
                defaultValue={formData?.impactType}
                required={true}
                disabled={true}
              />
              {error && <p style={{ color: "red", margin: "0" }}>{error}</p>}
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item
              label={<>Impact</>}
              name="impact"
              className={classes.disabledInput}
              // style={{ marginBottom: 0, paddingTop: "10px" }}
            >
              {/* <div ref={refForCapaForm5}> */}
              <Input
                name="impact"
                value={formData?.impact?.join(", ")}
                defaultValue={formData?.impact?.join(", ")}
                required={true}
                disabled={true}
              />
              {error && <p style={{ color: "red", margin: "0" }}>{error}</p>}
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              label={<>Priority</>}
              name="highPriority"
              className={classes.disabledInput}
            >
              <Input
                name="highPriority"
                value={formData?.highPriority ? "High" : "Normal"}
                defaultValue={formData?.highPriority ? "High" : "Normal"}
                required={true}
                disabled={true} // Keep the input disabled
              />
              {error && <p style={{ color: "red", margin: "0" }}>{error}</p>}
            </Form.Item>
          </Col>
        </Row>
        {/* <Row gutter={[16, 16]}>
        <Col span={12}>
          <Form.Item label={`Unit :`}>
            <Input
              name="locationId"
              size="large"
              onChange={(e) => handleInputChange(e)}
              value={
                formData?.locationId?.locationName
                  ? formData?.locationId?.locationName
                  : loggedInUser?.location.id
              }
              // defaultValue={loggedInUser?.location?.locationName}
              type="text"
              disabled={true}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item label={`Registered By:`} name="registeredBy">
            <Input
              name="registeredBy"
              size="large"
              //onChange={(e) => handleInputChange(e)}
              value={
                isEdit
                  ? formData?.registeredBy?.username
                  : loggedInUser?.username
              }
              // defaultValue={
              //   isEdit
              //     ? formData?.registeredBy?.firstname
              //     : userDetails?.firstname
              // }
              type="text"
              disabled={true}
            />
          </Form.Item>
        </Col>
      </Row> */}
        <Row
          gutter={[16, 16]}
          style={{
            display: "flex",
            flexDirection: matches ? "row" : "column",
            gap: "0px",
          }}
        >
          <Col span={matches ? 12 : 24}>
            <Form.Item
              label="Responsible Unit:"
              // name="entityId"
              name="locationId"
              rules={[
                {
                  required: true,
                },
              ]}
              className={classes.disabledSelect}
            >
              {/* <div ref={refForCapaForm6}> */}
              <Select
                showSearch
                // placeholder="Filter By Unit"
                placeholder="Select Unit"
                optionFilterProp="children"
                //defaultValue={selectedLocation.id}
                filterOption={(input: any, option: any) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                // style={{ width: "100%" }}
                size="large"
                value={selectedLocation}
                options={locationOptions || []}
                disabled={
                  readMode ||
                  formData?.status === "Open" ||
                  formData?.status === "Accepted" ||
                  formData?.status === "Outcome_In_Progress" ||
                  formData?.status === "Analysis_In_Progress" ||
                  formData?.status === "Closed"
                }
                onChange={(e: any, value: any) => {
                  // console.log("value in auto", value.id);
                  // setFormData((prevFormData: any) => ({
                  //   ...prevFormData,
                  //   // location: value,
                  //   locationId: value.id,
                  // }));
                  setSelectedLocation({
                    id: value?.id,
                    locationName: value?.locationName,
                  });
                }}
              />
              {/* </div> */}
            </Form.Item>
            {/* <Form.Item
            label="Unit:"
            // name="systemId"
            name="locationId"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <AutoComplete
              suggestionList={location}
              name={"Unit"}
              keyName={"locationName"}
              formData={formData}
              setFormData={setFormData}
              getSuggestionList={getSuggestionListLocation}
              labelKey={"locationName"}
              disabled={
                readMode ||
                formData?.status === "OPEN" ||
                formData?.status === "ACCEPTED" ||
                formData?.status === "CA PENDING" ||
                formData?.status === "CLOSED"
              }
              defaultValue={
                // edit ?
                formData?.locationId
                //  : formData?.locationName
              }
              handleChangeFromForm={(e: any, value: any) => {
                console.log("value in auto", value.id);
                setFormData((prevFormData: any) => ({
                  ...prevFormData,
                  // location: value,
                  locationId: value.id,
                }));
                setSelectedLocation({
                  id: value?.id,
                  locationName: value?.locationName,
                });
              }}
              multiple={false}
            />
          </Form.Item> */}
          </Col>
          <Col span={matches ? 12 : 24}>
            <Form.Item
              label="Responsible Entity:"
              // name="entityId"
              name="entity"
              rules={[
                {
                  required: true,
                },
              ]}
              className={classes.disabledSelect}
            >
              {/* <div ref={refForCapaForm7}> */}
              {/* <Select
                placeholder="Responsible Entity"
                onChange={(e: any) => {
                  // console.log("e", e);
                  setFormData((prevData: any) => ({
                    ...prevData,
                    entity: e,
                    coordinator: undefined,
                    caraCoordinator: undefined,
                  }));
                  investForm.setFieldsValue({
                    // caraCoordinator: formData?.caraCoordinator?.id,
                    coordinator: undefined,
                  });
                  // console.log("formdata in handlechange", formdata);
                  getAllUserForEntity(e);
                }}
                size="large"
                value={formData?.entity}
                disabled={
                  readMode ||
                  formData?.status === "Open" ||
                  formData?.status === "Accepted" ||
                  formData?.status === "Outcome_In_Progress" ||
                  formData?.status === "Analysis_In_Progress" ||
                  formData?.status === "Closed"
                }
              >
                {entities &&
                  entities.length > 0 &&
                  entities.map((entity: any) => (
                    <Option
                      key={entity.id}
                      value={entity.value}
                      label={entity.id}
                    >
                      {entity.entityName}
                    </Option>
                  ))}
              </Select> */}
              {/* </div> */}
              <DepartmentSelector
                locationId={formData?.locationId}
                selectedDepartment={selectedDept}
                onSelect={(dept, type) => {
                  setSelectedDept({ ...dept, type }),
                    setFormData((prevData: any) => ({
                      ...prevData,
                      entity: dept?.id,
                      coordinator: undefined,
                      caraCoordinator: undefined,
                    }));
                  investForm.setFieldsValue({
                    // caraCoordinator: formData?.caraCoordinator?.id,
                    coordinator: undefined,
                  });
                }}
                onClear={() => setSelectedDept(null)}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={matches ? 12 : 24}>
            <Form.Item
              label="Responsible Person :"
              name="coordinator"
              rules={[
                {
                  required: true,
                },
              ]}
              className={classes.disabledSelect}
            >
              <Select
                placeholder="Responsible Person"
                onChange={(value) => {
                  // When a value is selected, update formData with the user ID
                  setFormData((prevData: any) => ({
                    ...prevData,
                    caraCoordinator: value,
                    coordinator: value, // Store only the user ID
                  }));
                }}
                size="large"
                value={formData?.caraCoordinator} // Make sure the value is user.id
                disabled={
                  readMode ||
                  formData?.status === "Open" ||
                  formData?.status === "Accepted" ||
                  formData?.status === "Outcome_In_Progress" ||
                  formData?.status === "Analysis_In_Progress" ||
                  formData?.status === "Closed"
                }
                showSearch // Enables search functionality in the dropdown
                optionFilterProp="label" // Search will be performed on `label`, which is the username
                filterOption={(input: any, option: any) => {
                  // Custom filter function to search by the label (username)
                  return option?.label
                    .toLowerCase()
                    .includes(input.toLowerCase());
                }}
              >
                {entityUsers?.map((user: any) => (
                  <Option
                    key={user.value}
                    value={user.value}
                    label={user.label}
                  >
                    {user.label}{" "}
                    {/* This is what will be displayed in the dropdown */}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={matches ? 12 : 24}>
            <Form.Item
              label="System:"
              // name="systemId"
              name="systems"
              // rules={[
              //   {
              //     required: true,
              //   },
              // ]}
              className={classes.disabledSelect}
            >
              {/* <div ref={refForCapaForm8}> */}
              <Select
                placeholder="Select systems"
                onChange={(selectedValues: any) =>
                  setFormData((prevData: any) => ({
                    ...prevData,
                    systems: selectedValues,
                  }))
                }
                size="large"
                value={formData?.systems}
                mode="multiple"
                disabled={
                  readMode ||
                  formData?.status === "Open" ||
                  formData?.status === "Accepted" ||
                  formData?.status === "Outcome_In_Progress" ||
                  formData?.status === "Analysis_In_Progress" ||
                  formData?.status === "Closed"
                }
              >
                {systems &&
                  systems?.length > 0 &&
                  systems?.map((system: any) => (
                    <Option
                      key={system?.id}
                      value={system?.id}
                      label={system?.id}
                    >
                      {system?.name}
                    </Option>
                  ))}
              </Select>
              {/* </div> */}
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
                className={`${classes.uploadSection} ant-upload-drag-container`}
                showUploadList={false}
                fileList={formData.registerfiles}
                multiple
                disabled={
                  readMode ||
                  formData?.status === "Accepted" ||
                  formData?.status === "Outcome_In_Progress" ||
                  formData?.status === "Analysis_In_Progress" ||
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
            formData.registerfiles &&
            formData?.registerfiles?.length > 0 &&
            formData?.registerfiles?.map((item: any) => (
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

        <Modal
          title="Accepted Status?"
          open={open}
          onOk={() => {
            if (value === 1 && submitted) {
              setFormData({
                ...formData,
                status: "Accepted",
              });
              //investForm.setFieldsValue({ ...formData, status: "ACCEPTED" });
              // console.log("formData...Detail");
            } else if (value === 2) {
              setFormData({
                ...formData,
                status: "Rejected",
              });
            }
            hideModal("Accepted");
          }}
          onCancel={() => hideModal("Rejected")}
          okText="Submit"
          style={{
            marginLeft: "auto", // Adjust the left margin as needed
            marginRight: "25px", // Center the modal horizontally if needed
          }}
          centered={false}
        >
          <Form
            layout="vertical"
            form={caraOwnerForm}
            initialValues={{
              caraOwner: loggedInUser.id,
              comments: "",
              radioStatus: 2,
            }}
          >
            <Radio.Group
              onChange={onChange}
              value={value}
              name="radioStatus"
              style={{
                marginTop: "6%",
              }}
              disabled={readMode || formData?.status === "CLOSED"}
            >
              <Radio value={1}>Accepted</Radio>
              <Radio value={2}>Rejected</Radio>
            </Radio.Group>
            <Form.Item
              label="Comments"
              name="comments"
              rules={[
                {
                  required: true,
                },
                {
                  validator: validateTitle,
                },
              ]}
              style={{
                marginTop: "6%",
              }}
              className={classes.disabledInput}
            >
              <TextArea
                rows={6} // Increase the number of rows to adjust the height
                autoSize={{ minRows: 3, maxRows: 6 }} // You can adjust minRows and maxRows as per your preference
                placeholder="Enter Comments"
                size="large"
                name="comments"
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  const value = e.target.value;
                  const error = validateComment(value);

                  if (error) {
                    setCommentError(error); // Set error if validation fails
                  } else {
                    setCommentError(""); // Clear error if validation passes
                    setFormData({
                      ...formData,
                      comments: value, // Update comments in formData
                    });
                  }
                }}
                value={formData?.comments}
                //defaultValue={formData?.comments}
                required={true}
                disabled={readMode || formData?.status === "Closed"}
              />
              {commentError && (
                <div style={{ color: "red" }}>{commentError}</div>
              )}{" "}
              {/* Display error message */}
            </Form.Item>
            {value === 1 && submitted && (
              <>
                <Form.Item
                  label="CAPA Owner"
                  name="caraOwner"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                  className={classes.disabledSelect}
                >
                  <Select
                    placeholder="CAPA Owner"
                    onSelect={(value) => {
                      const ownerId =
                        typeof value === "object" ? value?.key : value;

                      //  console.log("value in capa owner", value);
                      setFormData({ ...formData, caraOwner: ownerId });
                    }}
                    size="large"
                    value={formData?.caraOwner ? formData?.caraOwner : users[0]}
                    disabled={readMode || formData?.status === "Closed"}
                  >
                    {users &&
                      users.length > 0 &&
                      users?.map((user: any) => (
                        <Option value={user.id} key={user.id}>
                          {formData?.deptHead &&
                          formData?.deptHead?.some(
                            (deptHeadUser: any) => deptHeadUser?.id === user?.id
                          ) ? (
                            <span>
                              <span role="img" aria-label="star">
                                ⭐
                              </span>{" "}
                              {user?.username}
                            </span>
                          ) : (
                            user.username
                          )}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </>
            )}
          </Form>
        </Modal>
      </Form>
      <SuggestionModal
        open={isModalVisible}
        onCancel={handleCancel}
        onAccept={handleAccept}
        aiSuggestions={aiSuggestions}
      />
      <Modal
        open={capaDocsModal}
        onCancel={() => setCapaDocsModal(false)}
        title="Relevant Documents"
        footer={null}
        width={650}
      >
        <div style={{ height: "400px", width: "600px", overflowY: "auto" }}>
          <Table
            dataSource={capaRelevantDocs}
            columns={columns}
            pagination={false}
            style={{ height: "100%", width: "100%" }}
          />
        </div>
      </Modal>
      <Modal
        title="CAPA AI Suggestion"
        open={capaAISuggestionModal}
        onCancel={() => {
          setCapaAISuggestionModal(false);
        }}
        width="850px"
        footer={null}
      >
        {capaAISuggestion ? (
          <Tabs defaultActiveKey="1">
            <>
              <TabPane tab="Corrective/Containment Action" key="1">
                <p>
                  <strong>Correction/Containment Action:</strong>{" "}
                  {capaAISuggestion.containmentAction}
                </p>
                {containmentActionField ? (
                  <Button
                    type="primary"
                    onClick={() => {
                      setContainmentActionField(false);
                      aiModalAccept(
                        "containmentAction",
                        capaAISuggestion.containmentAction
                      );
                    }}
                  >
                    Accept
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    style={{ background: "red" }}
                    onClick={() => {
                      setContainmentActionField(true);
                      aiModalAccept("containmentAction", "");
                    }}
                  >
                    Remove
                  </Button>
                )}
              </TabPane>
              <TabPane tab="Root Cause Analysis" key="2">
                <p>
                  <strong>Root Cause Analysis:</strong>{" "}
                  {capaAISuggestion.rootCause}
                </p>
                {rootCauseField ? (
                  <Button
                    type="primary"
                    onClick={() => {
                      setRootCauseField(false);
                      aiModalAccept(
                        "rootCauseAnalysis",
                        capaAISuggestion.rootCause
                      );
                    }}
                  >
                    Accept
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    style={{ background: "red" }}
                    onClick={() => {
                      setRootCauseField(true);
                      aiModalAccept("rootCauseAnalysis", "");
                    }}
                  >
                    Remove
                  </Button>
                )}
              </TabPane>
              <TabPane tab="Techniques" key="3">
                {capaAISuggestion.possibleCauses ? (
                  <div>
                    <p>
                      <strong>Best Approach: Possible Cause</strong>
                    </p>
                    <p>
                      <strong>Man:</strong>{" "}
                      {capaAISuggestion?.possibleCauses?.Man}
                    </p>
                    {manField ? (
                      <Button
                        type="primary"
                        onClick={() => {
                          setManField(false);
                          aiModalAccept(
                            "man",
                            capaAISuggestion?.possibleCauses?.Man
                          );
                        }}
                      >
                        Accept
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        style={{ background: "red" }}
                        onClick={() => {
                          setManField(true);
                          aiModalAccept("man", "");
                        }}
                      >
                        Remove
                      </Button>
                    )}
                    <p>
                      <strong>Material:</strong>{" "}
                      {capaAISuggestion?.possibleCauses?.Material}
                    </p>
                    {materialField ? (
                      <Button
                        type="primary"
                        onClick={() => {
                          setMaterialField(false);
                          aiModalAccept(
                            "material",
                            capaAISuggestion?.possibleCauses?.Material
                          );
                        }}
                      >
                        Accept
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        style={{ background: "red" }}
                        onClick={() => {
                          setMaterialField(true);
                          aiModalAccept("material", "");
                        }}
                      >
                        Remove
                      </Button>
                    )}
                    <p>
                      <strong>Method:</strong>{" "}
                      {capaAISuggestion?.possibleCauses?.Method}
                    </p>
                    {methodField ? (
                      <Button
                        type="primary"
                        onClick={() => {
                          setMethodField(false);
                          aiModalAccept(
                            "method",
                            capaAISuggestion?.possibleCauses?.Method
                          );
                        }}
                      >
                        Accept
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        style={{ background: "red" }}
                        onClick={() => {
                          setMethodField(true);
                          aiModalAccept("method", "");
                        }}
                      >
                        Remove
                      </Button>
                    )}
                    <p>
                      <strong>Machine:</strong>{" "}
                      {capaAISuggestion?.possibleCauses?.Machine}
                    </p>
                    {machineField ? (
                      <Button
                        type="primary"
                        onClick={() => {
                          setMachineField(false);
                          aiModalAccept(
                            "machine",
                            capaAISuggestion?.possibleCauses?.Machine
                          );
                        }}
                      >
                        Accept
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        style={{ background: "red" }}
                        onClick={() => {
                          setMachineField(true);
                          aiModalAccept("machine", "");
                        }}
                      >
                        Remove
                      </Button>
                    )}
                    <p>
                      <strong>Measurement:</strong>{" "}
                      {capaAISuggestion?.possibleCauses?.Measurement}
                    </p>
                    {measurementField ? (
                      <Button
                        type="primary"
                        onClick={() => {
                          setMeasurementField(false);
                          aiModalAccept(
                            "measurement",
                            capaAISuggestion?.possibleCauses?.Measurement
                          );
                        }}
                      >
                        Accept
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        style={{ background: "red" }}
                        onClick={() => {
                          setMeasurementField(true);
                          aiModalAccept("measurement", "");
                        }}
                      >
                        Remove
                      </Button>
                    )}
                    <p>
                      <strong>Environment:</strong>{" "}
                      {capaAISuggestion?.possibleCauses?.Environment}
                    </p>
                    {environmentField ? (
                      <Button
                        type="primary"
                        onClick={() => {
                          setEnvironmentField(false);
                          aiModalAccept(
                            "environment",
                            capaAISuggestion?.possibleCauses?.Environment
                          );
                        }}
                      >
                        Accept
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        style={{ background: "red" }}
                        onClick={() => {
                          setEnvironmentField(true);
                          aiModalAccept("environment", "");
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ) : (
                  <div>
                    <p>
                      <strong>Best Approach: Why Why</strong>
                    </p>
                    <p>
                      <strong>Why1:</strong> {capaAISuggestion?.whyWhy?.why1}
                    </p>
                    {why1Field ? (
                      <Button
                        type="primary"
                        onClick={() => {
                          setWhy1Field(false);
                          aiModalAccept("why1", capaAISuggestion?.whyWhy?.why1);
                        }}
                      >
                        Accept
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        style={{ background: "red" }}
                        onClick={() => {
                          setWhy1Field(true);
                          aiModalAccept("why1", "");
                        }}
                      >
                        Remove
                      </Button>
                    )}
                    <p>
                      <strong>Why2:</strong> {capaAISuggestion?.whyWhy?.why2}
                    </p>
                    {why2Field ? (
                      <Button
                        type="primary"
                        onClick={() => {
                          setWhy2Field(false);
                          aiModalAccept("why2", capaAISuggestion?.whyWhy?.why2);
                        }}
                      >
                        Accept
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        style={{ background: "red" }}
                        onClick={() => {
                          setWhy2Field(true);
                          aiModalAccept("why2", "");
                        }}
                      >
                        Remove
                      </Button>
                    )}
                    <p>
                      <strong>Why3:</strong> {capaAISuggestion?.whyWhy?.why3}
                    </p>
                    {why3Field ? (
                      <Button
                        type="primary"
                        onClick={() => {
                          setWhy3Field(false);
                          aiModalAccept("why3", capaAISuggestion?.whyWhy?.why3);
                        }}
                      >
                        Accept
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        style={{ background: "red" }}
                        onClick={() => {
                          setWhy3Field(true);
                          aiModalAccept("why3", "");
                        }}
                      >
                        Remove
                      </Button>
                    )}
                    <p>
                      <strong>Why4:</strong> {capaAISuggestion?.whyWhy?.why4}
                    </p>
                    {why4Field ? (
                      <Button
                        type="primary"
                        onClick={() => {
                          setWhy4Field(false);
                          aiModalAccept("why4", capaAISuggestion?.whyWhy?.why4);
                        }}
                      >
                        Accept
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        style={{ background: "red" }}
                        onClick={() => {
                          setWhy4Field(true);
                          aiModalAccept("why4", "");
                        }}
                      >
                        Remove
                      </Button>
                    )}
                    <p>
                      <strong>Why5:</strong> {capaAISuggestion?.whyWhy?.why5}
                    </p>
                    {why5Field ? (
                      <Button
                        type="primary"
                        onClick={() => {
                          setWhy5Field(false);
                          aiModalAccept("why5", capaAISuggestion?.whyWhy?.why5);
                        }}
                      >
                        Accept
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        style={{ background: "red" }}
                        onClick={() => {
                          setWhy5Field(true);
                          aiModalAccept("why5", "");
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                )}
              </TabPane>
            </>
          </Tabs>
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100px",
            }}
          >
            <Spin size="large" />
          </div>
        )}
      </Modal>
    </>
  );
};

export default CaraRegistration;
