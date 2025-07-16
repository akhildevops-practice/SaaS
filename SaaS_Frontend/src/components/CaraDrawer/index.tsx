import { Tabs, Drawer, Space, Button, Modal, Spin } from "antd";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  Tooltip,
} from "@material-ui/core";
import { useEffect, useState } from "react";
import useStyles from "../../pages/MRM/commonDrawerStyles";
import { useMediaQuery, Typography } from "@material-ui/core";
import axios from "../../apis/axios.global";

import DocInfoIconImageSvg from "../../assets/documentControl/Info.svg";

import CloseIconImageSvg from "assets/documentControl/Close.svg";
//notistack
import { useSnackbar } from "notistack";
import {
  MdTransferWithinAStation,
  MdChat,
  MdOutlineExpandMore,
  MdOutlineWarning,
} from "react-icons/md";
import CaraRegistration from "components/CaraRegistration";

import { caraRegistrationForm, referencesData } from "recoil/atom";

import { useRecoilState } from "recoil";

import CaraDetailsDrawer from "./CaraDetailsDrawer";
import CaraWhy from "components/Carawhy/CaraWhy";

import getYearFormat from "utils/getYearFormat";
import CaraOutcome from "components/Carawhy/CaraOutcome";
import CommonReferencesTab from "components/CommonReferencesComponents/CommonReferencesTab";
import CommentsDrawer from "components/CIPManagement/CIPTable/CIPDrawer/CommentsDrawer";
import dayjs from "dayjs";
import getAppUrl from "utils/getAppUrl";
import { API_LINK } from "config";
import CaraOwnerModal from "./caraOwnerModal";
import { isValid } from "utils/validateInput";
const { TabPane } = Tabs;

type Props = {
  drawer: any;
  readMode: boolean;
  setActiveTab?: any;
  setDrawer: (drawer: any) => void;
  handleDrawer?: any;
  expandDataValues?: any;
  mrm?: boolean;
  activeTab?: any;
  drawerType?: string;
  isEdit?: boolean;
  editData?: any;
  setIsEdit?: (edit: boolean) => void;
  setUpload?: any;
  isUpload?: boolean;
  getData?: any;
  handleCloseDrawer?: any;
  moduleName?: any;
  getCapaResponse?: any;
};

const CaraDrawer = ({
  drawer,
  handleDrawer,
  expandDataValues,
  mrm,
  isEdit,
  editData,
  setIsEdit,
  setDrawer,
  readMode,
  isUpload,
  setUpload,
  getData,
  activeTab,
  setActiveTab,
  handleCloseDrawer,
  moduleName,
  getCapaResponse,
}: Props) => {
  // const [auditeeData, setAuditeeData] = useRecoilState(auditeeSectionData);

  // const [referencesNew, setReferencesNew] = useState<any>([]);
  const [open, setOpen] = useState(false);
  const [detailsDrawer, setDetailsDrawer] = useState<any>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [formStatus, setFormStatus] = useState<string>("Open");
  const [deptHead, setDeptHead] = useState<any>([]);
  const [openModalForOwner, setOpenModalForOwner] = useState<any>(false);
  const [caraData, setCaraData] = useState<any>({});

  const [formdata, setformdata] = useRecoilState(caraRegistrationForm);
  const [items, setItems] = useState<any>([]);
  const [clickedMenuItem, setClickedMenuItem] = useState<boolean>(false);
  // const showData = isOrgAdmin || isMR;
  // const navigate = useNavigate();
  const [commnetValue, setCommentValue] = useState("");
  const orgId = sessionStorage.getItem("orgId");
  const userDetail = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const [refsData] = useRecoilState(referencesData);
  const { enqueueSnackbar } = useSnackbar();
  const [currentYear, setCurrentYear] = useState<any>();
  const classes = useStyles();
  const smallScreen = useMediaQuery("(min-width:450px)");
  // const [initialFileList, setInitialFileList] = useState([]);
  // const [initialAttachmentList, setInitialAttachmentList] = useState([]);
  // const [isOutcomeUpload, setOutcomeUpload] = useState<boolean>(false);
  const [isAnalysis, setAnalysis] = useState<boolean>(false);
  const [isOutcome, setOutcome] = useState<boolean>(false);
  const [isRejectEdit, setRejectEdit] = useState<boolean>(false);

  const [commentsLoader, setCommentsLoader] = useState(false);
  const [capaOwnerData, setCapaOwnerData] = useState<any>([]);
  const [anchorEl, setAnchorEl] = useState(null);
  //console.log("isEdit", isEdit);
  const [comments, setComments] = useState<any>([]);
  const [ownerFormSubmit, setOwnerFormSubmit] = useState(false);
  const [ownerChange, setOwnerChange] = useState(false);
  const [commentDrawer, setCommentDrawer] = useState<any>({
    open: false,
    data: {},
  });
  const [selectedItem, setSelectedItem] = useState("");
  const loggedInUser = JSON.parse(sessionStorage.getItem("userDetails") as any);
  const [openValidationDialog, setOpenValidationDialog] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const matches = useMediaQuery("(min-width:786px)");

  const realmName = getAppUrl();
  const CapaStateIdentifier: any = {
    "Save As Draft": "Draft",
    "Approve Analysis": "Outcome_In_Progress",
    "Submit Capa": "Open",
    "Close Capa": "Closed",
    ACCEPT: "Accepted",
    REJECT: "Rejected",
    "Outcome In Progress": "Outcome_In_Progress",
    "Submit Analysis": "Analysis_In_Progress",
    "Submit Outcome": "Outcome_In_Progress",
    "Send For Approval": "Sent_For_Approval",
  };

  const [openDialog, setOpenDialog] = useState(false);
  const [newStatus, setNewStatusOption] = useState<any>();
  const [isOutcomeConfirm, setOutcomeConfirm] = useState(false);

  const [suggestionModal, setSuggestionModal] = useState<boolean>(false);
  const [suggestionData, setSuggestionData] = useState<any>([]);
  const [refTableData, setRefTableData] = useState<any>([]);
  const [capaTotalAISuggestionModal, setCapaTotalAISuggestionModal] =
    useState<any>(false);
  const [
    capaPossibleCausesAISuggestionModal,
    setCapaPossibleCausesAISuggestionModal,
  ] = useState<any>(false);
  const [capaWhyWhyAISuggestionModal, setCapaWhyWhyAISuggestionModal] =
    useState<any>(false);
  const [capaAISuggestion, setCapaAISuggestion] = useState<any>();
  const [suggestionModalOpen, setSuggestionModalOpen] = useState<any>(true);
  const [activeModules, setActiveModules] = useState<string[]>([]);
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

  // const handleOpenDialog = () => {
  //   setOpenDialog(true);
  // };

  // const handleCloseDialog = () => {
  //   setOpenDialog(false);
  //   handleDrawer();
  //   // setOpen(true);
  // };

  // const handleProceed = async () => {
  //   // Handle the logic for proceeding here
  //   console.log("handleProcced called");
  //   setOpenDialog(false);
  //   setOutcomeConfirm(true);
  //   console.log("option", option, isOutcomeConfirm);
  //   await handleSubmit(option, true);
  // };

  const handleProceed = async () => {
    // console.log("handleProceed called");

    // Close the dialog
    setOpenDialog(false);

    // Set the outcome confirmation state
    setOutcomeConfirm(true);
    // console.log("New Outcome Confirm State: true");
    await new Promise((resolve) => setTimeout(resolve, 0));
    // Call handleSubmit directly
    await handleSubmit(newStatus, true);
  };

  useEffect(() => {
    if (!!drawer.open) {
      getyear();
      // getRealmLicenseCount();

      if (drawer?.mode === "create") {
        // Logic for "create" mode
        const defaultButtonOptions = ["Save As Draft", "Submit Capa"];
        const newItems = defaultButtonOptions?.map((item: any, index: any) => ({
          key: (index + 1).toString(),
          label: item,
        }));
        setItems([...defaultButtonOptions]);

        // Reset the form data for "create" mode
        setformdata({
          title: "",
          kpiId: "",
          type: "",
          startDate: "",
          comments: "",
          files: [],
          registerfiles: [],
          endDate: "",
          registeredBy: "",
          caraCoordinator: "",
          coordinator: "",
          analysisLevel: "",
          referenceComments: "",
          status: "",
          serialNumber: "",
          caraOwner: {},
          entityId: "",
          systemId: [],
          containmentAction: "",
          location: "",
          origin: "",
          locationId: "",
          organizationId: "",
          deptHead: [],
          description: "",
          date: {},
          entity: "",
          systems: [],
          year: "",
          attachments: [],
          correctiveAction: "",
          targetDate: "",
          correctedDate: "",
          kpiReportLink: "",
          rootCauseAnalysis: "",
          actualCorrectiveAction: "",
          referenceAttachments: [],
          man: "",
          machine: "",
          environment: "",
          material: "",
          method: "",
          measurement: "",
          why1: "",
          why2: "",
          why3: "",
          why4: "",
          why5: "",
          impact: [],
          impactType: "",
          highPriority: false,
        });
      } else if (isEdit && editData?._id) {
        // Logic for "edit" mode
        getcarabyid();
        getDeptHead();

        setformdata({
          ...formdata,
          serialNumber: formdata?.serialNumber,
          status: formdata?.status,
          comments: formdata?.comments,
          caraOwner: formdata?.caraOwner,
        });
      }
    }
  }, [drawer?.open, isEdit]);
  // console.log("drawer.opn", drawer);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    handleDrawer();
    // setOpen(true);
  };

  // const handleProceed = async () => {
  //   // Handle the logic for proceeding here
  //   console.log("handleProcced called");
  //   setOpenDialog(false);
  //   setOutcomeConfirm(true);
  //   console.log("option", option, isOutcomeConfirm);
  //   await handleSubmit(option, true);
  // };

  // const handleProceed = async () => {
  //   // console.log("handleProceed called");

  //   // Close the dialog
  //   setOpenDialog(false);

  //   // Set the outcome confirmation state
  //   setOutcomeConfirm(true);
  //   // console.log("New Outcome Confirm State: true");
  //   await new Promise((resolve) => setTimeout(resolve, 0));
  //   // Call handleSubmit directly
  //   await handleSubmit(newStatus, true);
  // };

  // useEffect(() => {
  //   getyear();

  //   if (drawer?.mode === "create") {
  //     // console.log("checkdoc drawer opened in create mode", drawer);
  //     const defaultButtonOptions = ["Save As Draft", "Submit Capa"];
  //     const newItems = defaultButtonOptions?.map((item: any, index: any) => ({
  //       key: (index + 1).toString(),
  //       label: item,
  //     }));
  //     setItems([...defaultButtonOptions]);
  //     setformdata({
  //       title: "",
  //       kpiId: "",
  //       type: "",
  //       startDate: "",
  //       comments: "",
  //       files: [],
  //       registerfiles: [],
  //       endDate: "",
  //       registeredBy: "",
  //       caraCoordinator: "",
  //       coordinator: "",
  //       status: "",
  //       serialNumber: "",
  //       caraOwner: {},
  //       entityId: "",
  //       systemId: [],
  //       containmentAction: "",
  //       location: "",
  //       origin: "",
  //       locationId: "",
  //       organizationId: "",
  //       deptHead: [],
  //       description: "",
  //       date: {},
  //       entity: "",
  //       systems: [],
  //       year: "",
  //       attachments: [],
  //       correctiveAction: "",
  //       targetDate: "",
  //       correctedDate: "",
  //       kpiReportLink: "",
  //       rootCauseAnalysis: "",
  //       actualCorrectiveAction: "",
  //     });
  //   } else if (isEdit && editData?._id) {
  //     getcarabyid();
  //     getDeptHead();
  //   }
  // }, [drawer?.open]);
  // // console.log("drawer", drawer, isEdit, formdata);
  // useEffect(() => {
  //   if (isEdit) {
  //     if (editData?._id) {
  //       getcarabyid();
  //       getDeptHead();
  //     }

  //     setformdata({
  //       ...formdata,
  //       serialNumber: formdata?.serialNumber,
  //       status: formdata?.status,
  //       comments: formdata?.comments,
  //       caraOwner: formdata?.caraOwner,
  //     });
  //     // getDeptHead();
  //   }
  // }, [isEdit]);

  const getyear = async () => {
    const currentyear = await getYearFormat(new Date().getFullYear());
    setCurrentYear(currentyear);
  };
  const toggleCommentsDrawer = (data: any = {}) => {
    setCommentDrawer({
      ...commentDrawer,
      open: !commentDrawer.open,
      data: { ...data },
    });
    getComments();
  };
  const toggleCapaOwnerModal = (data: any = {}) => {
    setOpenModalForOwner(!openModalForOwner);
    getCapaOwnerDetails();
  };
  // console.log("formddata", formdata);
  const getCapaOwnerDetails = async () => {
    try {
      const result = await axios.get(
        `/api/cara/getCapaOwnerEntry/${editData._id}`
      );
      if (result?.data) {
        setCapaOwnerData(result?.data);
      } else {
        setCapaOwnerData([]);
      }
    } catch (error) {
      console.log("error", error);
    }
  };
  const handleCommentSubmit = async (value: string) => {
    setCommentsLoader(true);
    if (value && editData?._id) {
      try {
        let res = await axios.post("/api/cara/createCapaComments", {
          caraId: editData?._id,
          userId: userDetail?.id,
          commentBy: userDetail?.firstname + " " + userDetail?.lastname,
          commentText: value,
        });
        setCommentsLoader(false);
        enqueueSnackbar(`Comment Added Successfully`, { variant: "success" });
        getComments();
      } catch (err: any) {
        enqueueSnackbar(`Request Failed, Code: ${err.response.status}`, {
          variant: "success",
        });
        setCommentsLoader(false);
      }
      setCommentValue("");
    } else {
      enqueueSnackbar(`Enter a comment`, { variant: "warning" });
    }
  };
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
    setClickedMenuItem(false); // Reset flag when opening the menu
  };

  // Handle closing the menu
  const handleClose = () => {
    // Only reset form data if the menu item has been clicked
    if (clickedMenuItem) {
      setAnchorEl(null);
      setClickedMenuItem(false); // Reset the clicked flag
      // Reset form data here (as per your original implementation)
      setformdata({
        title: "",
        kpiId: "",
        analysisLevel: "",
        registerfiles: [],
        coordinator: "",
        type: "",
        startDate: "",
        location: "",
        serialNumber: "",
        comments: "",
        files: [],
        endDate: "",
        registeredBy: "",
        status: "",
        caraOwner: {},
        entityId: "",
        systemId: [],
        containmentAction: "",
        entity: "",
        systems: [],
        origin: "",
        locationId: "",
        organizationId: "",
        deptHead: [],
        description: "",
        date: {},

        referenceComments: "",

        year: "",
        attachments: [],
        correctiveAction: "",
        targetDate: "",
        correctedDate: "",
        kpiReportLink: "",
        rootCauseAnalysis: "",
        actualCorrectiveAction: "",
        referenceAttachments: [],
        caraCoordinator: "",
        man: "",
        machine: "",
        environment: "",
        material: "",
        method: "",
        measurement: "",
        why1: "",
        why2: "",
        why3: "",
        why4: "",
        why5: "",
        impact: [],
        impactType: "",
        highPriority: false,
      });
    } else {
      setAnchorEl(null);
    }
  };

  // Handle menu item click and submission
  const onMenuClick = (e: any) => {
    setClickedMenuItem(true); // Mark the menu item clicked
    handleSubmit(e); // Call your form submission logic
  };

  const getComments = async () => {
    setCommentsLoader(true);
    try {
      let res: any = await axios.get(
        `/api/cara/getCapaCommentsById/${editData?._id}`
      );
      setComments(res.data);
      setCommentsLoader(false);
    } catch (err) {
      enqueueSnackbar(
        `Could not get Comments, Check your internet connection`,
        { variant: "error" }
      );
      setCommentsLoader(false);
    }
  };

  const showAISuggestions = async (preferedTechnique: any) => {
    setCapaAISuggestion(null);
    if (formdata?.status === "Open" || formdata?.status === "Accepted") {
      if (
        formdata.containmentAction === "" ||
        formdata.containmentAction === null ||
        formdata.containmentAction === undefined
      ) {
        setContainmentActionField(true);
      } else {
        setContainmentActionField(false);
      }

      if (
        formdata.rootCauseAnalysis === "" ||
        formdata.rootCauseAnalysis === null ||
        formdata.rootCauseAnalysis === undefined
      ) {
        setRootCauseField(true);
      } else {
        setRootCauseField(false);
      }

      if (
        formdata.man === "" ||
        formdata.man === null ||
        formdata.man === undefined
      ) {
        setManField(true);
      } else {
        setManField(false);
      }

      if (
        formdata.machine === "" ||
        formdata.machine === null ||
        formdata.machine === undefined
      ) {
        setMachineField(true);
      } else {
        setMachineField(false);
      }

      if (
        formdata.material === "" ||
        formdata.material === null ||
        formdata.material === undefined
      ) {
        setMaterialField(true);
      } else {
        setMaterialField(false);
      }

      if (
        formdata.environment === "" ||
        formdata.environment === null ||
        formdata.environment === undefined
      ) {
        setEnvironmentField(true);
      } else {
        setEnvironmentField(false);
      }

      if (
        formdata.method === "" ||
        formdata.method === null ||
        formdata.method === undefined
      ) {
        setMethodField(true);
      } else {
        setMethodField(false);
      }

      if (
        formdata.measurement === "" ||
        formdata.measurement === null ||
        formdata.measurement === undefined
      ) {
        setMeasurementField(true);
      } else {
        setMeasurementField(false);
      }

      if (
        formdata.why1 === "" ||
        formdata.why1 === null ||
        formdata.why1 === undefined
      ) {
        setWhy1Field(true);
      } else {
        setWhy1Field(false);
      }

      if (
        formdata.why2 === "" ||
        formdata.why2 === null ||
        formdata.why2 === undefined
      ) {
        setWhy2Field(true);
      } else {
        setWhy2Field(false);
      }

      if (
        formdata.why3 === "" ||
        formdata.why3 === null ||
        formdata.why3 === undefined
      ) {
        setWhy3Field(true);
      } else {
        setWhy3Field(false);
      }

      if (
        formdata.why4 === "" ||
        formdata.why4 === null ||
        formdata.why4 === undefined
      ) {
        setWhy4Field(true);
      } else {
        setWhy4Field(false);
      }

      if (
        formdata.why5 === "" ||
        formdata.why5 === null ||
        formdata.why5 === undefined
      ) {
        setWhy5Field(true);
      } else {
        setWhy5Field(false);
      }
      if (preferedTechnique === "Any") {
        setCapaTotalAISuggestionModal(true);
        setCapaPossibleCausesAISuggestionModal(false);
        setCapaWhyWhyAISuggestionModal(false);
      }
      if (preferedTechnique === "Possible Causes") {
        setCapaTotalAISuggestionModal(false);
        setCapaPossibleCausesAISuggestionModal(true);
        setCapaWhyWhyAISuggestionModal(false);
      }
      if (preferedTechnique === "Why Why") {
        setCapaTotalAISuggestionModal(false);
        setCapaPossibleCausesAISuggestionModal(false);
        setCapaWhyWhyAISuggestionModal(true);
      }
      axios
        .post(`${process.env.REACT_APP_PY_URL}/pyapi/capaAISuggestions`, {
          query: {
            problemStatement: formdata.title,
            problemDescription: formdata.description,
            containmentAction: formdata.containmentAction || "",
            rootCauseAnalysis: formdata.rootCauseAnalysis || "",
            correctiveAction: formdata.correctiveAction || "",
            man: formdata?.man || "",
            machine: formdata?.machine || "",
            environment: formdata?.environment || "",
            material: formdata?.material || "",
            method: formdata?.method || "",
            measurement: formdata?.measurement || "",
            why1: formdata?.why1 || "",
            why2: formdata?.why2 || "",
            why3: formdata?.why3 || "",
            why4: formdata?.why4 || "",
            why5: formdata?.why5 || "",
            preferedTechnique: preferedTechnique,
          },
        })
        .then((response) => {
          const obj = JSON.parse(response.data);
          setCapaAISuggestion(obj);
          setSuggestionModalOpen(false);
        });
    }
  };

  const tabs = [
    {
      label: "CAPA Registration",
      key: "1",
      children: (
        <CaraRegistration
          drawer={drawer}
          formData={formdata}
          setFormData={setformdata}
          isEdit={isEdit}
          caraData={caraData}
          open={open}
          setOpen={setOpen}
          submitted={submitted}
          setSubmitted={setSubmitted}
          setFormStatus={setFormStatus}
          readMode={readMode}
          setRejectEdit={setRejectEdit}
          tableData={refTableData}
          setTableData={setRefTableData}
          // refsData={refsData}
        />
      ),
      // disabled: formdata?.status != "OPEN",
    },
    {
      label: "Analyse",
      key: "2",
      children: (
        <>
          <CaraWhy
            formData={formdata}
            setFormData={setformdata}
            readMode={readMode}
            isUpload={isUpload}
            setUpload={setUpload}
            isAnalysis={isAnalysis}
            setAnalysis={setAnalysis}
            // setOutcomeUpload={setOutcomeUpload}
            drawer={drawer}
            showAISuggestions={showAISuggestions}
          />
        </>
      ),
      disabled: formdata?.status === "" || formdata?.status === undefined,
    },
    {
      label: "Outcome",
      key: "3",
      children: (
        <>
          <CaraOutcome
            formData={formdata}
            setFormData={setformdata}
            readMode={readMode}
            // setOutcomeUpload={setOutcomeUpload}
            setUpload={setUpload}
            setAnalysis={setAnalysis}
            setOutcome={setOutcome}
            drawer={drawer}
          />
        </>
      ),
      disabled: formdata?.status === "" || formdata?.status === undefined,
    },
    {
      label: "Reference",
      key: 4,
      children: (
        <div>
          <CommonReferencesTab
            drawer={drawer}
            capaForAi={true}
            tableData={refTableData}
            setTableData={setRefTableData}
          />
        </div>
      ),
      // disabled: formdata?.status !== "ACCEPTED",
    },
  ];
  const toggleDetailsDrawer = (data: any = {}) => {
    setDetailsDrawer({
      ...detailsDrawer,
      open: !detailsDrawer.open,
      data: { ...data },
    });
  };
  const getDeptHead = async () => {
    try {
      // console.log("callling depthead");
      const entityid = editData?.entityId?.id || editData?.entityId;
      const result = await axios.get(
        `/api/cara/getDeptHeadForEntity/${entityid}`
      );
      //console.log("result", result?.data);
      setDeptHead(result?.data);
    } catch (error) {
      // enqueueSnackbar("Error Fetching Department Head!!", { variant: "error" });
    }
  };
  const getStatus = (status: any) => {
    switch (status) {
      case "Draft":
        return "Draft";
      case "Open":
        return "Pending Response";
      case "Accepted":
        return "Action Agreed";
      case "Rejected":
        return "#ffe6e6";
      case "Analysis_In_Progress":
        return "To Be Followed Up";
      case "Outcome_In_Progress":
        return "To be closed After Validation";
      case "Draft":
        return "#e6f2ff";
      case "Sent_For_Approval":
        return "Validated and dropped";
      case "Closed":
        return "Validated and dropped";
      default:
        return "";
    }
  };
  const getcarabyid = async () => {
    try {
      // console.log("getcarbyid", editData._id);
      const result = await axios.get(`/api/cara/getCaraById/${editData?._id}`);
      const buttonOptionsResponse = await axios.get(
        `/api/cara/getStatusOptionForCapa/${editData?._id}`
      );
      const newItems = buttonOptionsResponse?.data?.map(
        (option: any, index: any) => {
          return { key: (index + 1).toString(), label: option };
        }
      );
      const tempNewItems = newItems?.map((item: any) => item.label);

      const NewmenuItems = tempNewItems?.map((item: any, index: any) => (
        <MenuItem key={index + 1} onClick={() => onMenuClick(item)}>
          {item}
        </MenuItem>
      ));
      // console.log("new menu items in check user permissions", NewmenuItems);
      setItems([...tempNewItems]);

      if (result?.data) {
        setformdata({
          ...result?.data,
          entity: result?.data?.entityId?.id,
          systems: result?.data?.systemId?.map((item: any) => item?._id),
          impact: result?.data.impact,
          impactType: result?.data?.impactType,
          highPriority: result?.data?.highPriority,
          coordinator: result?.data?.caraCoordinator?.id,
        });
      }
    } catch (error) {
      // enqueueSnackbar("Error fetching record for cara", { variant: "error" });
    }
  };
  // console.log("setupload value in drawer", isUpload);
  const uploadData = async (files: any) => {
    let formDataFiles = new FormData();
    let oldData = [];
    let newData = [];

    for (let file of files) {
      if (file?.url) {
        oldData.push(file);
      } else {
        newData.push(file);
      }
    }

    newData.forEach((file: any) => {
      const fileToAdd = file.originFileObj || file;
      formDataFiles.append("files", fileToAdd);
    });

    const id = "CAPA";
    let res: any;
    let comdinedData;

    try {
      if (newData.length > 0) {
        res = await axios.post(
          `${API_LINK}/api/mrm/objectStore/${id}?realm=${realmName}&locationName=${loggedInUser?.location?.locationName}`,
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
          "Your Organization has exceeded the licensed attachments - Please reach ProcessRidge to activate additional licenses"
        );
      } else {
        // Handle other errors
        console.error("Error uploading data:", error);
        alert("An error occurred while uploading files. Please try again.");
      }
      return null; // Return null or handle the error accordingly
    }

    return comdinedData;
  };

  const validateAnalysis = () => {
    const { containmentAction, rootCauseAnalysis, correctiveAction } =
      formdata || {};

    // Ensure that formdata has the fields and check if at least one is not empty
    if (
      (containmentAction && containmentAction.trim() !== "") ||
      (rootCauseAnalysis && rootCauseAnalysis.trim() !== "") ||
      (correctiveAction && correctiveAction.trim() !== "")
    ) {
      return true; // At least one field is filled
    }

    return false; // None of the fields are filled
  };

  const handleSubmit = async (option: string, submit = false) => {
    try {
      let data;

      const title = isValid(formdata?.title);
      // console.log("option", option);
      if (!title.isValid) {
        enqueueSnackbar(`Please enter valid title ${title.errorMessage} `, {
          variant: "error",
        });
        return;
      }
      // console.log("submit status",submitstatus)

      if (!!formdata?.description) {
        const title = isValid(formdata?.description);
        // console.log("option", option);
        if (!title.isValid) {
          enqueueSnackbar(
            `Please enter valid description ${title.errorMessage}`,
            { variant: "error" }
          );
          return;
        }
      }
      let filesData, attachmentData, registerfilesdata;
      // if (
      //   licenseDetails?.addedDocs >= licenseDetails?.authorizedDocs &&
      //   (formdata?.files?.length > 0 ||
      //     formdata?.attachments?.length > 0 ||
      //     formdata?.registerfiles?.length > 0)
      // ) {
      //   filesData = [];
      //   attachmentData = [];
      //   registerfilesdata = [];
      //   alert(
      //     "Your Organization has exceeded the licensed attachments - Please reach ProcessRidge to activate additional licenses. CAPA will be saved without attachment"
      //   );
      // } else {
      filesData =
        formdata?.files?.length > 0 ? await uploadData(formdata.files) : [];

      attachmentData =
        formdata?.attachments?.length > 0
          ? await uploadData(formdata.attachments)
          : [];
      registerfilesdata =
        formdata?.registerfiles?.length > 0
          ? await uploadData(formdata.registerfiles)
          : [];
      // }
      let submitstatus;
      if (option === "Submit") {
        submitstatus = formdata.status;
      } else {
        submitstatus = CapaStateIdentifier[option];
      }
      // console.log("submitstatus", submitstatus);
      if (
        formdata?.caraCoordinator === undefined ||
        (formdata?.caraCoordinator === null &&
          (submitstatus === "Draft" || "Open"))
      ) {
        enqueueSnackbar(`Please select responsible person`, {
          variant: "error",
        });
        return;
      }
      // console.log("submitstatus", submitstatus);
      if (isEdit) {
        // console.log("formdata in edit", submitstatus);

        if (
          submitstatus === "Rejected" &&
          (!formdata.comments ||
            formdata.comments.trim() === "" ||
            formdata.comments === "") &&
          isRejectEdit === false
        ) {
          // If status is REJECTED, comments must be provided
          enqueueSnackbar("Comments are mandatory for REJECTED status.", {
            variant: "error",
          });
          setOpen(true);
          return;
        } else if (submitstatus === "Rejected" && isRejectEdit === true) {
          if (formdata?.comments === "") {
            enqueueSnackbar("Comments are mandatory for REJECTED status.", {
              variant: "error",
            });
            setOpen(true);

            return;
          }
        }
        if (
          submitstatus === "Outcome_In_Progress" &&
          isOutcomeConfirm === false
        ) {
          if (submit !== true) {
            // Validate the analysis fields
            if (!validateAnalysis()) {
              setValidationMessage(
                "Please fill in at least one of the following: Containment Action, Root Cause Analysis, or Corrective Action."
              );
              setOpenValidationDialog(true); // Open the validation dialog
              return; // Stop further processing
            }

            // Open the confirmation dialog if validation passes
            setOpenDialog(true);
            setNewStatusOption(option);
            return;
          }
        }
        // console.log("submit status", submitstatus);
        if (submitstatus === "Closed") {
          if (!!formdata.actualCorrectiveAction) {
            const ca = isValid(formdata?.actualCorrectiveAction);
            if (!ca.isValid) {
              enqueueSnackbar(
                `Please enter valid corrective action ${ca.errorMessage}`,
                { variant: "error" }
              );
              return;
            }
          } else if (
            formdata?.actualCorrectiveAction === undefined ||
            formdata.actualCorrectiveAction === null ||
            formdata.actualCorrectiveAction === ""
          ) {
            enqueueSnackbar(
              `Please enter valid corrective action before submitting`,
              { variant: "error" }
            );
            return;
          }
        }
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
          }));
        }
        //   console.log("isupload in drawer", isOutcome);

        // if (isAnalysis === true && isOutcome === false) {
        //   if (
        //     isUpload === false &&
        //     (submitstatus === "Analysis_In_Progress" ||
        //       submitstatus === "Accepted")
        //   ) {
        //     enqueueSnackbar("Please click on Upload Files to Submit", {
        //       variant: "error",
        //     });
        //     return;
        //   }
        // } else if (isOutcome === true) {
        //   if (
        //     isOutcomeUpload === false &&
        //     formdata?.status === "Analysis_In_Progress"
        //   ) {

        //     enqueueSnackbar("Please click on Upload Files to Submit", {
        //       variant: "error",
        //     });
        //     return;
        //   }
        // }
        //if comments are entered for accepted or rejected status add it to the same comments collection
        if (submitstatus === "Rejected" || submitstatus === "Accepted") {
          if (!!formdata.comments && formdata.comments !== "") {
            handleCommentSubmit(formdata.comments);
          }
        }
        if (ownerChange === true) {
          // console.log("inside else if accepted", formdata?.caraOwner);

          data = await axios.patch(`/api/cara/updateCara/${editData?._id}`, {
            ...formdata,
            attachments: attachmentData,
            files: filesData,
            entityId: formdata?.entity,
            systemId: formdata?.systems,
            registerfiles: registerfilesdata,
            status: "Accepted",
            caraCoordinator: formdata?.coordinator,

            caraOwner: formdata?.caraOwner
              ? formdata?.caraOwner
              : userDetail?.id,
            refsData: formattedReferences,

            correctedDate: formdata?.correctedDate
              ? formdata?.correctedDate
              : dayjs().format("YYYY-MM-DD"),
          });
          if (data.status == 200 || data.status == 201) {
            handleClose();
            enqueueSnackbar("CAPA owner updated successfully", {
              variant: "success",
            });
            moduleName === "INBOX" ? getCapaResponse() : getData();
            // setUpload(false);

            setformdata({
              title: "",
              kpiId: "",
              registerfiles: [],
              analysisLevel: "",
              coordinator: "",
              type: "",
              startDate: "",
              location: "",
              serialNumber: "",
              comments: "",
              files: [],
              endDate: "",
              registeredBy: "",
              status: "",
              caraOwner: {},
              entityId: "",
              systemId: [],
              containmentAction: "",
              entity: "",
              systems: [],
              origin: "",
              locationId: "",
              organizationId: "",
              deptHead: [],
              description: "",
              date: {},
              year: "",
              attachments: [],
              correctiveAction: "",
              referenceComments: "",
              targetDate: "",
              correctedDate: "",
              kpiReportLink: "",
              rootCauseAnalysis: "",
              actualCorrectiveAction: "",
              caraCoordinator: "",
              referenceAttachments: [],
              man: "",
              machine: "",
              environment: "",
              material: "",
              method: "",
              measurement: "",
              why1: "",
              why2: "",
              why3: "",
              why4: "",
              why5: "",
              impact: [],
              impactType: "",
              highPriority: false,
            });
            handleDrawer();
          }
          return;
        } else {
          // console.log("inside else update", submitstatus);
          data = await axios.patch(`/api/cara/updateCara/${editData?._id}`, {
            ...formdata,
            attachments: attachmentData,
            files: filesData,
            entityId: formdata?.entity,
            systemId: formdata?.systems,
            registerfiles: registerfilesdata,
            caraCoordinator: formdata?.coordinator,
            caraOwner: formdata?.caraOwner
              ? formdata?.caraOwner
              : userDetail?.id,
            refsData: formattedReferences,
            status: submitstatus,
            correctedDate: formdata?.correctedDate
              ? formdata?.correctedDate
              : dayjs().format("YYYY-MM-DD"),
          });

          if (data.status == 200 || data.status == 201) {
            if (submitstatus === "Closed") {
              let body: any = { capaId: editData?._id };
              try {
                const response = await axios.post(
                  `${process.env.REACT_APP_PY_URL}/pyapi/capaDtlsToVB`,
                  body
                );
              } catch (error) {}
            }
            handleClose();

            enqueueSnackbar("CAPA updated successfully", {
              variant: "success",
            });

            // if (moduleName === "INBOX") {
            //   getCapaResponse();
            // }
            // {
            //   getData();
            // }
            moduleName === "INBOX" ? getCapaResponse() : getData();
            // setUpload(false);

            setformdata({
              title: "",
              kpiId: "",
              analysisLevel: "",
              coordinator: "",
              registerfiles: [],
              type: "",
              startDate: "",
              location: "",
              serialNumber: "",
              comments: "",
              files: [],
              endDate: "",
              registeredBy: "",
              status: "",
              caraOwner: {},
              entityId: "",
              systemId: [],
              containmentAction: "",
              caraCoordinator: "",
              entity: "",
              systems: [],
              origin: "",
              locationId: "",
              organizationId: "",
              deptHead: [],
              description: "",
              referenceComments: "",
              date: {},
              year: "",
              attachments: [],
              correctiveAction: "",
              targetDate: "",
              correctedDate: "",
              kpiReportLink: "",
              rootCauseAnalysis: "",
              actualCorrectiveAction: "",
              referenceAttachments: [],
              man: "",
              machine: "",
              environment: "",
              material: "",
              method: "",
              measurement: "",
              why1: "",
              why2: "",
              why3: "",
              why4: "",
              why5: "",
              impact: [],
              impactType: "",
              highPriority: false,
            });
            handleDrawer();
          }
          return;
        }
      } else {
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
          }));
        }
        const payload: any = {
          ...formdata,
          year: currentYear,
          entityId: formdata?.entity,
          locationId: formdata?.locationId
            ? formdata?.locationId
            : userDetail.location?.id,
          systemId: formdata?.systems,
          type: !formdata?.type ? "Manual" : formdata?.type,
          refsData: formattedReferences,
          registerfiles: registerfilesdata,
          status: submitstatus,
        };
        //  console.log("payload in create", payload);
        if (
          payload?.origin &&
          payload?.title &&
          payload?.systemId &&
          payload?.entityId &&
          payload?.locationId
        ) {
          data = await axios.post("/api/cara/createCara", {
            payload,
          });
          if (data.data.status === 409) {
            enqueueSnackbar(`Please add prefix and suffix for CAPA module`, {
              variant: "error",
            });
          } else if (data.data.status === 404) {
            enqueueSnackbar(
              `Department Head for the selected Entity was not found, please add to proceed`,
              {
                variant: "error",
              }
            );
          } else if (data?.status == 200 || data?.status == 201) {
            handleClose();
            enqueueSnackbar("successfully created", {
              variant: "success",
            });

            getData();
            setUpload(false);
            setformdata({
              title: "",
              kpiId: "",
              coordinator: "",
              analysisLevel: "",
              type: "",
              startDate: "",
              registerfiles: [],
              comments: "",
              files: [],
              endDate: "",
              serialNumber: "",
              registeredBy: "",
              status: "",
              containmentAction: "",
              caraOwner: {},
              entityId: "",
              caraCoordinator: "",
              systemId: [],
              origin: "",
              locationId: "",
              organizationId: "",
              deptHead: [],
              entity: "",
              systems: [],
              description: "",
              referenceComments: "",
              date: {},
              year: "",
              attachments: [],
              location: "",
              correctiveAction: "",
              targetDate: "",
              correctedDate: "",
              kpiReportLink: "",
              rootCauseAnalysis: "",
              actualCorrectiveAction: "",
              referenceAttachments: [],
              man: "",
              machine: "",
              environment: "",
              material: "",
              method: "",
              measurement: "",
              why1: "",
              why2: "",
              why3: "",
              why4: "",
              why5: "",
              impact: [],
              impactType: "",
              highPriority: false,
            });
            handleDrawer();
          }
        } else {
          enqueueSnackbar("Please fill all required fields", {
            variant: "error",
          });
        }
      }
    } catch (error: any) {
      enqueueSnackbar(error, {
        variant: "error",
      });
    }
  };

  //console.log("formdata in caradrawer", formdata, editData);
  const getStatusColor = (status: any) => {
    switch (status) {
      case "Open":
        return "#b3d9ff";
      case "Accepted":
        return "#ccffe6";
      case "Rejected":
        return "#ffe6e6";
      case "Analysis_In_Progress":
        return "#ffffcc";
      case "Outcome_In_Progress":
        return "#ffffb3";
      case "Sent_For_Approval":
        return "#00b33c";
      case "Draft":
        return "#e6f2ff";

      case "Closed":
        return "#ccccff";
      default:
        return "";
    }
  };
  const getNewStatusColor = (status: any) => {
    switch (status) {
      case "Open":
        return "#FF4D4F";
      case "Accepted":
        return "#1890FF";
      case "Rejected":
        return "#ffe6e6";
      case "Analysis_In_Progress":
        return "#FFEB3B";
      case "Outcome_In_Progress":
        return "#81C784";
      case "Draft":
        return "#e6f2ff";
      case "Sent_For_Approval":
        return "#009933";
      case "Closed":
        return "#009933";
      default:
        return "";
    }
  };

  // for mobile tab select design

  const [selectedValue, setSelectedValue] = useState("Registration");
  // console.log("selectedValue", selectedValue);
  const handleDataChange = (e: any) => {
    setSelectedValue(e.target.value);
  };

  const capaSuggestions = async () => {
    try {
      const content = {
        title: formdata.title,
        description: formdata.description,
        containmentAction: formdata.containmentAction,
        actualCorrectiveAction: formdata.actualCorrectiveAction,
      };
      const response = await axios.post(
        `${process.env.REACT_APP_PY_URL}/pyapi/capaSuggestions`,
        formdata
      );
      const jsonObject = JSON.parse(response.data.text);
      setSuggestionData(jsonObject);
      setSuggestionModal(true);
    } catch (error) {}
  };

  const getActiveModules = async () => {
    await axios(`/api/organization/getAllActiveModules/${realmName}`)
      .then((res) => {
        setActiveModules(res.data.activeModules);
      })
      .catch((err) => console.error(err));
  };

  const aiModalAccept = (field: any, text: any) => {
    if (field) {
      setformdata({
        ...formdata,
        [field]: text,
      });
    }
  };

  return (
    <Drawer
      title={matches ? <span key="title">CAPA Management</span> : ""}
      placement="right"
      open={drawer?.open}
      closable={true}
      maskClosable={false}
      closeIcon={
        <img
          src={CloseIconImageSvg}
          alt="close-drawer"
          style={{ width: "36px", height: "38px", cursor: "pointer" }}
        />
      }
      onClose={() => {
        //setformdata({});
        //  console.log(formdata);
        // handleClose();

        if (setIsEdit) {
          setIsEdit(false);
          setformdata({
            title: "",
            referenceComments: "",
            kpiId: "",
            type: "",
            analysisLevel: "",
            startDate: "",
            comments: "",
            files: [],
            registerfiles: [],
            endDate: "",
            registeredBy: "",
            caraCoordinator: "",
            coordinator: "",
            status: "",
            serialNumber: "",
            caraOwner: {},
            entityId: "",
            systemId: [],
            containmentAction: "",
            location: "",
            origin: "",
            locationId: "",
            organizationId: "",
            deptHead: [],
            description: "",
            date: {},
            entity: "",
            systems: [],
            year: "",
            attachments: [],
            correctiveAction: "",
            targetDate: "",
            correctedDate: "",
            kpiReportLink: "",
            rootCauseAnalysis: "",
            actualCorrectiveAction: "",
            referenceAttachments: [],
            man: "",
            machine: "",
            environment: "",
            material: "",
            method: "",
            measurement: "",
            why1: "",
            why2: "",
            why3: "",
            why4: "",
            why5: "",
            impact: [],
            impactType: "",
            highPriority: false,
          });
        }

        setDrawer({ mode: "create", data: {}, open: false });

        // console.log("closing....");
      }}
      className={classes.drawer}
      width={matches ? "55%" : "90%"}
      extra={
        <>
          {isEdit &&
            ((Array.isArray(deptHead) &&
              deptHead?.some((user: any) => user.id === userDetail.id)) ||
              formdata.coordinator === userDetail?.id) &&
            !(
              formdata.status === "Open" ||
              formdata?.status === "Draft" ||
              formdata?.status === "Rejected" ||
              formdata?.status === "Closed"
            ) && (
              <Tooltip title="Change CAPA Owner">
                <IconButton
                  style={{
                    padding: 0,
                    margin: 0,
                    marginRight: matches ? "30px" : "3px",
                  }}
                  disabled={drawer?.mode === "create"}
                >
                  <MdTransferWithinAStation
                    className={classes.commentsIcon}
                    onClick={toggleCapaOwnerModal}
                  />
                </IconButton>
              </Tooltip>
            )}

          {(isEdit || readMode) && (
            <Tooltip title="Add/View Comments">
              <IconButton
                style={{
                  padding: 0,
                  margin: 0,
                  marginRight: matches ? "30px" : "3px",
                }}
                disabled={drawer?.mode === "create"}
              >
                <MdChat
                  className={classes.commentsIcon}
                  onClick={toggleCommentsDrawer}
                />
              </IconButton>
            </Tooltip>
          )}

          <Modal
            title="CAPA AI Suggestion"
            open={capaTotalAISuggestionModal}
            onCancel={() => {
              setCapaTotalAISuggestionModal(false);
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
                          <strong>Why1:</strong>{" "}
                          {capaAISuggestion?.whyWhy?.why1}
                        </p>
                        {why1Field ? (
                          <Button
                            type="primary"
                            onClick={() => {
                              setWhy1Field(false);
                              aiModalAccept(
                                "why1",
                                capaAISuggestion?.whyWhy?.why1
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
                              setWhy1Field(true);
                              aiModalAccept("why1", "");
                            }}
                          >
                            Remove
                          </Button>
                        )}
                        <p>
                          <strong>Why2:</strong>{" "}
                          {capaAISuggestion?.whyWhy?.why2}
                        </p>
                        {why2Field ? (
                          <Button
                            type="primary"
                            onClick={() => {
                              setWhy2Field(false);
                              aiModalAccept(
                                "why2",
                                capaAISuggestion?.whyWhy?.why2
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
                              setWhy2Field(true);
                              aiModalAccept("why2", "");
                            }}
                          >
                            Remove
                          </Button>
                        )}
                        <p>
                          <strong>Why3:</strong>{" "}
                          {capaAISuggestion?.whyWhy?.why3}
                        </p>
                        {why3Field ? (
                          <Button
                            type="primary"
                            onClick={() => {
                              setWhy3Field(false);
                              aiModalAccept(
                                "why3",
                                capaAISuggestion?.whyWhy?.why3
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
                              setWhy3Field(true);
                              aiModalAccept("why3", "");
                            }}
                          >
                            Remove
                          </Button>
                        )}
                        <p>
                          <strong>Why4:</strong>{" "}
                          {capaAISuggestion?.whyWhy?.why4}
                        </p>
                        {why4Field ? (
                          <Button
                            type="primary"
                            onClick={() => {
                              setWhy4Field(false);
                              aiModalAccept(
                                "why4",
                                capaAISuggestion?.whyWhy?.why4
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
                              setWhy4Field(true);
                              aiModalAccept("why4", "");
                            }}
                          >
                            Remove
                          </Button>
                        )}
                        <p>
                          <strong>Why5:</strong>{" "}
                          {capaAISuggestion?.whyWhy?.why5}
                        </p>
                        {why5Field ? (
                          <Button
                            type="primary"
                            onClick={() => {
                              setWhy5Field(false);
                              aiModalAccept(
                                "why5",
                                capaAISuggestion?.whyWhy?.why5
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
          <Modal
            title="CAPA AI Suggestion"
            open={capaPossibleCausesAISuggestionModal}
            onCancel={() => {
              setCapaPossibleCausesAISuggestionModal(false);
            }}
            width="850px"
            footer={null}
          >
            {capaAISuggestion?.possibleCauses ? (
              <div>
                <p>
                  <strong>Man:</strong> {capaAISuggestion?.possibleCauses?.Man}
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
          <Modal
            title="CAPA AI Suggestion"
            open={capaWhyWhyAISuggestionModal}
            onCancel={() => {
              setCapaWhyWhyAISuggestionModal(false);
            }}
            width="850px"
            footer={null}
          >
            {capaAISuggestion?.whyWhy ? (
              <div>
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
          {readMode === true ? (
            <></>
          ) : (
            <Space>
              {formdata.status === "Open" &&
                ((Array.isArray(deptHead) &&
                  deptHead?.length > 0 &&
                  deptHead?.some((user: any) => user.id === userDetail?.id)) ||
                  formdata?.coordinator === userDetail?.id ||
                  formdata?.caraCoordinator === userDetail?.id ||
                  editData?.coordinator === userDetail?.id) && (
                  <Button
                    onClick={() => {
                      setOpen(true);
                      setSubmitted(true);
                    }}
                    className={classes.cancelBtn}
                    style={{
                      fontSize: smallScreen ? "14px" : "12px",
                      padding: smallScreen ? "4px 15px" : "2px 5px",
                    }}
                  >
                    Accept/Reject
                  </Button>
                )}
              {/* {formdata.deptHead &&
                formdata.status === "ACCEPTED" &&
                formdata.deptHead.some(
                  (user: any) =>
                    user.id === userDetail.id &&
                    formdata.correctiveAction &&
                    formdata.targetDate &&
                    formdata.rootCauseAnalysis
                ) && (
                  <Button
                    type="primary"
                    onClick={handleApprove}
                    className={classes.cancelBtn}
                  >
                    Approve
                  </Button>
                )}
              {formdata.deptHead &&
                formdata.status === "CA PENDING" &&
                formdata.deptHead.some(
                  (user: any) =>
                    user.id === userDetail.id &&
                    formdata.actualCorrectiveAction &&
                    formdata.correctedDate &&
                    formdata.rootCauseAnalysis
                ) && (
                  <Button
                    type="primary"
                    onClick={handleClosureApprove}
                    className={classes.cancelBtn}
                  >
                    Approve
                  </Button>
                )} */}
              {matches ? (
                <Button onClick={handleDrawer} className={classes.cancelBtn}>
                  Cancel
                </Button>
              ) : (
                ""
              )}

              <Button
                onClick={handleClick}
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: smallScreen ? "14px" : "12px",
                  padding: smallScreen ? "4px 15px" : "2px 5px",
                }}
                disabled={items?.length === 0}
              >
                <span
                  style={{
                    fontWeight: "bold",
                  }}
                >
                  {selectedItem || "Actions"}
                </span>
                <MdOutlineExpandMore
                  style={{
                    fill: `${items?.length === 0 ? "gray" : "#0e497a"}`,
                  }}
                />
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                {items &&
                  items.length > 0 &&
                  items?.map((item: any, index: any) => (
                    <MenuItem key={index + 1} onClick={() => onMenuClick(item)}>
                      {item}
                    </MenuItem>
                  ))}
              </Menu>
              <Tooltip title="View CAPA Details">
                <img
                  src={DocInfoIconImageSvg}
                  alt="doc-info"
                  onClick={toggleDetailsDrawer}
                  className={classes.docInfoIcon}
                  style={{ marginRight: smallScreen ? "30px" : "0px" }}
                />
              </Tooltip>
            </Space>
          )}
          {/* <Tooltip title="Expand Form">
            <Button
              // style={{ marginLeft: "8px" }}
              className={classes.expandIcon}
              onClick={() =>
                navigate("/cara/fullformview", {
                  state: { formdata: formdata, mrm: mrm },
                })
              }
            >
              <ExpandIcon />
            </Button>
          </Tooltip> */}
        </>
      }
    >
      <div>
        {!!detailsDrawer && (
          <CaraDetailsDrawer
            detailsDrawer={detailsDrawer}
            setDetailsDrawer={setDetailsDrawer}
            formData={formdata}
            toggleDetailsDrawer={toggleDetailsDrawer}
          />
        )}
      </div>
      <div>
        {formdata?.serialNumber && (
          <span
            style={{
              fontSize: "15px",
              fontWeight: "bold",
              display: "flex",
              justifyContent: "flex-end", // Align to the flex-end
              //paddingBottom: "5px", // Adjust the padding at the top
            }}
          >
            {formdata?.serialNumber}
          </span>
        )}
      </div>
      <div className={classes.tabsWrapper} style={{ position: "relative" }}>
        {matches ? (
          <Tabs
            type="card"
            items={tabs as any}
            defaultActiveKey={"1"}
            onChange={(key: string) => setActiveTab(key)}
            // activeKey={activeTab?.toString()}
            animated={{ inkBar: true, tabPane: true }}

            // tabBarStyle={{backgroundColor : "green"}}
          />
        ) : (
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
              <MenuItem value={"Registration"}>
                <div
                  style={{
                    backgroundColor:
                      selectedValue === "Registration" ? "#3576BA" : "white",
                    textAlign: "center",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    color: selectedValue === "Registration" ? "white" : "black",
                  }}
                >
                  {" "}
                  CAPA Registration
                </div>
              </MenuItem>
              <MenuItem value={"Analyse"}>
                {" "}
                <div
                  style={{
                    backgroundColor:
                      selectedValue === "Analyse" ? "#3576BA" : "white",
                    textAlign: "center",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    color: selectedValue === "Analyse" ? "white" : "black",
                  }}
                >
                  Analyse
                </div>
              </MenuItem>
              <MenuItem value={"Outcome"}>
                <div
                  style={{
                    backgroundColor:
                      selectedValue === "Outcome" ? "#3576BA" : "white",
                    textAlign: "center",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    color: selectedValue === "Outcome" ? "white" : "black",
                  }}
                >
                  Outcome
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
                  Reference
                </div>
              </MenuItem>
            </Select>
          </FormControl>
        )}

        {matches ? (
          ""
        ) : (
          <div>
            {selectedValue === "Registration" ? (
              <div>
                {" "}
                <CaraRegistration
                  drawer={drawer}
                  formData={formdata}
                  setFormData={setformdata}
                  isEdit={isEdit}
                  caraData={caraData}
                  open={open}
                  setOpen={setOpen}
                  submitted={submitted}
                  setSubmitted={setSubmitted}
                  setFormStatus={setFormStatus}
                  readMode={readMode}
                  setRejectEdit={setRejectEdit}
                />
              </div>
            ) : (
              ""
            )}

            {selectedValue === "Analyse" ? (
              <div style={{ marginTop: "10px" }}>
                <CaraWhy
                  formData={formdata}
                  setFormData={setformdata}
                  readMode={readMode}
                  isUpload={isUpload}
                  setUpload={setUpload}
                  isAnalysis={isAnalysis}
                  setAnalysis={setAnalysis}
                  // setOutcomeUpload={setOutcomeUpload}
                  drawer={drawer}
                />
              </div>
            ) : (
              ""
            )}

            {selectedValue === "Outcome" ? (
              <div>
                {" "}
                <CaraOutcome
                  formData={formdata}
                  setFormData={setformdata}
                  readMode={readMode}
                  // setOutcomeUpload={setOutcomeUpload}
                  setUpload={setUpload}
                  setAnalysis={setAnalysis}
                  setOutcome={setOutcome}
                  drawer={drawer}
                />
              </div>
            ) : (
              ""
            )}

            {selectedValue === "Reference" ? (
              <div style={{ marginTop: "10px" }}>
                {" "}
                <CommonReferencesTab drawer={drawer} />
              </div>
            ) : (
              ""
            )}
          </div>
        )}

        {matches ? (
          <>
            {" "}
            {tabs.length > 3 && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  display: "flex",
                  flexDirection: "column", // This ensures the status and icon are stacked vertically
                  alignItems: "flex-end", // Align everything to the right side
                  fontSize: "12px",
                  color: "black",
                }}
              >
                {/* Status Box */}
                <span
                  style={{
                    display: "inline-block",
                    padding: "5px",
                    marginBottom: "5px", // Adjust spacing between status and icon
                    backgroundColor: getNewStatusColor(formdata?.status),
                    color: "black",
                    borderRadius: "8px",
                    width: "100px",
                    textAlign: "center",
                  }}
                >
                  {/* {formdata?.status} */}
                  {getStatus(formdata?.status)}
                </span>

                {formdata?.highPriority && (
                  <div
                    style={{
                      marginTop: "5px",
                    }}
                  >
                    <Tooltip title="High Priority">
                      <MdOutlineWarning
                        style={{
                          color: "red",
                          height: "50px",
                          width: "35px",
                          marginRight: "70px",
                          marginBottom: "10px",
                        }}
                      />
                    </Tooltip>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          ""
        )}
      </div>
      <div>
        {!!commentDrawer.open && (
          <CommentsDrawer
            commentDrawer={commentDrawer}
            setCommentDrawer={setCommentDrawer}
            toggleCommentsDrawer={toggleCommentsDrawer}
            formData={editData}
            handleCommentSubmit={handleCommentSubmit}
            commentData={comments}
            commentsLoader={commentsLoader}
          />
        )}
      </div>
      <div>
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>Confirmation</DialogTitle>
          <DialogContent>
            Are you sure you want to proceed? Once "Outcome In Progress" is
            submitted, you cannot edit Analysis further.
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Cancel
            </Button>
            <Button onClick={handleProceed} color="primary">
              Proceed
            </Button>
          </DialogActions>
        </Dialog>
      </div>
      <div>
        <Dialog
          open={openValidationDialog}
          onClose={() => setOpenValidationDialog(false)}
        >
          <DialogTitle>Validation Required</DialogTitle>
          <DialogContent>
            <DialogContentText>{validationMessage}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setOpenValidationDialog(false)}
              color="primary"
            >
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </div>
      <div>
        <CaraOwnerModal
          formData={editData}
          capaOwnerData={capaOwnerData}
          setformdata={setformdata}
          openModalForOwner={openModalForOwner}
          setOpenModalForOwner={setOpenModalForOwner}
          readMode={readMode}
          setOwnerFormSubmit={setOwnerFormSubmit}
          handleSubmit={handleSubmit}
          setOwnerChange={setOwnerChange}
        />
      </div>
    </Drawer>
  );
};

export default CaraDrawer;
