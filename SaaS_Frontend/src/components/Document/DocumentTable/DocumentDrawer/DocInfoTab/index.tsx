import { useLocation } from "react-router-dom";
import { useRecoilState } from "recoil";
import {
  processDocFormData,
  drawerData,
  moduleNamesAtom,
  globalSearchClausesResult,
  globalSearchDocumentsResult,
} from "recoil/atom";

//antd
import {
  Col,
  Form,
  Input,
  Row,
  Select,
  Upload,
  Modal,
  Menu,
  message,
} from "antd";
import type { UploadProps } from "antd";

//material-ui
// import { Chip, MenuItem, makeStyles } from "@material-ui/core";
import { MdInbox } from "react-icons/md";
import { MdAttachFile } from "react-icons/md";
//components
import ReferencesResultPage from "pages/ReferencesResultPage";
// import { Select as MUISelect } from "@material-ui/core";
import { Select as MUISelect, MenuItem, makeStyles } from "@material-ui/core";
import CommonReferencesTab from "components/CommonReferencesComponents/CommonReferencesTab";
import axios from "apis/axios.global";

import { API_LINK } from "config";
import { useEffect, useRef, useState } from "react";
import { isValid } from "utils/validateInput";
import setDataFromGoogle from "./GoogleLoginComponent";
import useDrivePicker from "react-google-drive-picker";
import { MdLaptop } from "react-icons/md";

import { AiOutlineGoogle, AiOutlineWindows } from "react-icons/ai";
// import { GoogleLogin } from "react-google-login";
// import GoogleLoginComponent from "./GoogleLoginComponent";

const useStyles = makeStyles((theme: any) => ({
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
  chips: {
    display: "flex",
    flexWrap: "wrap",
  },
  chip: {
    margin: 2,
  },
  labels: {
    padding: "0px 0px 0px 0px !important",
    "&::where(.css-dev-only-do-not-override-ph9edi).ant-form-vertical .ant-form-item-label, :where(.css-dev-only-do-not-override-ph9edi).ant-col-24.ant-form-item-label, :where(.css-dev-only-do-not-override-ph9edi).ant-col-xl-24.ant-form-item-label":
      {
        padding: "0px !important",
      },
    "&.ant-col ant-form-item-label css-dev-only-do-not-override-ph9edi": {
      padding: "0px !important",
    },
  },
  labelStyle: {
    "& .ant-input-lg": {
      border: "1px solid #dadada",
    },

    "& .ant-form-item .ant-form-item-label > label": {
      color: "#003566",
      fontWeight: "bold",
      letterSpacing: "0.8px",
      padding: "0px 0px 0px 0px",
      // Add any other styles you want to apply to the <label> element
    },
    // "& :where(.css-dev-only-do-not-override-ph9edi).ant-form-vertical .ant-form-item-label":
    //   {
    //     padding: "0px 0px 0px",
    //   },
  },
  select: {
    "&:where(.css-dev-only-do-not-override-ph9edi).ant-select:not(.ant-select-customize-input) .ant-select-selector":
      {
        // border: "none",
        color: "black",
        backgroundColor: "white",
        // paddingTop: "0px",
      },
    "&:where(.css-dev-only-do-not-override-ph9edi).ant-input-disabled, :where(.css-dev-only-do-not-override-ph9edi).ant-input[disabled] ":
      {
        backgroundColor: "white",
      },
    // "&:where(.css-dev-only-do-not-override-ph9edi).ant-form-vertical .ant-form-item-label":
    //   {
    //     padding: "0px 0px 0px",
    //   },
  },
  materialSelect: {
    // "& .MuiOutlinedInput-notchedOutline": {
    //   border: "none",
    // },
    "& .MuiOutlinedInput-input": {
      padding: "12px 14px 8px 14px",
    },
  },
  // label: {
  //   padding: "0px 0px 0px 0px",
  // },
}));

const { TextArea } = Input;
const { Dragger } = Upload;
const { Option } = Select;

type Props = {
  drawer?: any;
  setDrawer?: any;
  handleDocFormCreated?: any;
  uploadFileError?: any;
  setUploadFileError?: any;
  disableFormFields?: any;
  disableDocType?: any;
  isEdit?: any;
  activeTabKey?: any;
};
const DocInfoTab = ({
  drawer,
  setDrawer,
  handleDocFormCreated,
  uploadFileError,
  setUploadFileError,
  disableFormFields,
  disableDocType,
  isEdit,
  activeTabKey,
}: Props) => {
  const classes = useStyles();
  const location = useLocation();
  const [expanded, setExpanded] = useState<any>(false);
  const [formData, setFormData] = useRecoilState(processDocFormData);
  const [drawerDataState, setDrawerDataState] = useRecoilState(drawerData);
  const [systems, setSystems] = useState([]);
  const [fileList, setFileList] = useState<any>([]);
  const [documentForm] = Form.useForm();
  const isInitialRender = useRef(true);
  const [searchValue, setSearchValue] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("");
  const [selectedData, setSelectedData] = useState<any>([]);
  const [selected, setSelected] = useState<any>([]);
  const [documentTableData, setDocumentTableData] = useState<any>([]);
  const [clauseTableData, setClauseTableData] = useState<any>([]);
  const [clauseData, setClauseData] = useState<any>([]);
  const [ncData, setNcData] = useState<any>([]);
  const [moduleNames, setModuleNames] = useRecoilState(moduleNamesAtom);
  const [sections, setSections] = useState([]);
  const [entity, setEntity] = useState([]);

  const [globalSearchClauses, setGlobalSearchClauses] = useRecoilState(
    globalSearchClausesResult
  );
  const [globalSearchDocuments, setGlobalSearchDocuments] = useRecoilState(
    globalSearchDocumentsResult
  );
  const [isLoading, setIsLoading] = useState<any>(true);
  const orgId = sessionStorage.getItem("orgId");
  const [openPicker] = useDrivePicker();
  const [accessToken, setAccessToken] = useState<any>(null);
  const [driveFiles, setDriveFiles] = useState<any>([]);
  const userDetails = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const labelColStyles = {
    color: "red",
    fontWeight: "bold",
  };
  const [googleData, setGoogleData] = useState<any>();

  useEffect(() => {
    setFormData({ ...formData, entityId: userDetails.entityId });
  }, []);
  useEffect(() => {
    if (drawer?.clearFields === true) {
      documentForm.setFieldsValue({
        documentName: "",
        doctypeName: undefined,
        systems: [],
        reasonOfCreation: "",
        description: "",
        tags: [],
        section: "",
      });
    }
  }, [drawer?.mode]);

  useEffect(() => {
    if (selected && selected.length > 0) {
      const filteredData = selected.reduce((unique: any, item: any) => {
        return unique.findIndex(
          (uniqueItem: any) =>
            uniqueItem.refId === item.refId && uniqueItem.type === item.type
        ) < 0
          ? [...unique, item]
          : unique;
      }, []);

      setSelectedData(filteredData);
    }
  }, [selected]);

  // useEffect(() => {
  //   console.log("checkdoc formData in doc details tab  --->", formData);
  // }, [formData]);

  useEffect(() => {
    if (handleDocFormCreated) {
      handleDocFormCreated(documentForm);
    }
  }, [documentForm, handleDocFormCreated]);

  useEffect(() => {
    const GetSystems = async () => {
      try {
        setFormData &&
          setFormData({ ...formData, systems: [], docsClassification: "" });
        setSystems([]);
        formData?.docTypes?.map((value: any) => {
          if (value.documentTypeName === formData.doctypeName) {
            // console.log("testted", value);
            setSystems(value.applicable_systems);
          }
        });
      } catch (err) {
        console.log("Error:", err);
      }
    };
    GetSystems();
    getEntity();
  }, [formData.doctypeName]);
  // console.log("inside doc ifo", formData);
  useEffect(() => {
    // console.log("systems is updated");
    formData?.docTypes?.map((value1: any) => {
      // console.log("value1", value1);
      // console.log("formData docTypeName", formData.doctypeName);
      if (
        isInitialRender.current &&
        (isEdit || drawerDataState?.formMode === "edit")
      ) {
        // console.log(
        //   "checkdoc in if in useEffect[doctypeId]",
        //   value1
        // );
        isInitialRender.current = false;
        if (value1.documentTypeName === formData.doctypeName) {
          for (const appSystems of value1.applicable_systems) {
            if (formData?.systems?.includes(appSystems.id)) {
              setFormData({
                ...formData,
                docsClassification: value1.document_classification,
                doctypeId: value1.id,
              });
            }
          }
        }
      } else {
        // console.log(
        //   "checkdoc in else in useEffect[doctypeId]",
        //   value1,
        //   value1.distributionList,
        //   value1.distributionUsers,
        // );
        if (value1.documentTypeName === formData.doctypeName) {
          for (const appSystems of value1.applicable_systems) {
            if (formData?.systems?.includes(appSystems.id)) {
              if (formData.distributionList === "Respective Unit") {
                const locationFilterData = [
                  {
                    id: userDetails.locationId,
                    name: userDetails.location.locationName,
                  },
                ];
                setFormData({
                  ...formData,
                  distributionUsers: locationFilterData,
                  distributionList: value1.distributionList,
                  readAccess: value1.readAccess,
                  readAccessUsers: value1.readAccessUsers,
                  docsClassification: value1.document_classification,
                  doctypeId: value1.id,
                });
              } else if (
                formData.distributionList === "Respective Department"
              ) {
                const entityFilterData = [
                  {
                    id: userDetails.entityId,
                    name: userDetails.entity.entityName,
                  },
                ];
                setFormData({
                  ...formData,
                  distributionUsers: entityFilterData,
                  distributionList: value1.distributionList,
                  readAccess: value1.readAccess,
                  readAccessUsers: value1.readAccessUsers,
                  docsClassification: value1.document_classification,
                  doctypeId: value1.id,
                });
              } else {
                setFormData({
                  ...formData,
                  distributionUsers: value1.distributionUsers,
                  distributionList: value1.distributionList,
                  readAccess: value1.readAccess,
                  readAccessUsers: value1.readAccessUsers,
                  docsClassification: value1.document_classification,
                  doctypeId: value1.id,
                });
              }
              // console.log("checkdoc insside if syststsm", value1);
            }
          }
        }
      }
    });
  }, [formData.doctypeName, formData.systems]);

  useEffect(() => {
    if (!isEdit) setFormData({ ...formData, entityId: userDetails.entityId });
    getGoogleDtls();
  }, []);

  const getGoogleDtls = async () => {
    try {
      const result = await axios.get(`api/google/getGoogleDtls`);
      if (result.data) {
        const gooData = {
          _id: result?.data?._id,
          clientId: atob(result?.data?.clientId),
          clientSecret: atob(result?.data?.clientSecret),
        };
        setGoogleData(gooData);
      } else {
        setGoogleData([]);
      }
    } catch (error: any) {
      if (!error.response) {
        message.error(error);
      } else {
        message.error(error.response);
      }
    }
  };

  useEffect(() => {
    GetSections();
  }, [formData.entityId]);

  useEffect(() => {
    // Override the default message event listener to add a type check
    const originalAddEventListener = window.addEventListener;

    // Replace the addEventListener method with our custom logic
    window.addEventListener = (type: any, listener: any, options: any) => {
      if (type === "message") {
        const wrappedListener = (e: any) => {
          // Ensure e.data is a string before proceeding
          if (typeof e.data === "string") {
            listener(e); // Call the original listener
          } else {
            console.warn("Non-string message data intercepted:", e.data);
          }
        };
        originalAddEventListener.call(window, type, wrappedListener, options);
      } else {
        originalAddEventListener.call(window, type, listener, options);
      }
    };
  }, []);
  const CLIENT_ID = googleData?.clientId;
  const API_KEY = googleData?.clientSecret;
  const SCOPES = "https://www.googleapis.com/auth/drive.file";

  const OneDrivePicker: any = () => {
    const dataConverter = async (file: any) => {
      const response = await axios.get(
        file["@microsoft.graph.downloadUrl"],

        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          responseType: "blob",
        }
      );

      const blob = response.data;

      // Convert the blob to a File object
      const fileObject = new File([blob], file.name, { type: blob.type });

      // Mimic the structure used in onChange
      const fileData = {
        uid: file.id,
        name: file.name,
        status: "done",
        url: URL.createObjectURL(blob),
        originFileObj: fileObject,
      };

      return fileData;
    };

    const handlePicker = () => {
      try {
        // Ensure OneDrive SDK is available
        if (typeof window.OneDrive !== "undefined") {
          const odOptions = {
            clientId: "b7ff3df0-1302-40f7-9f12-ac31e3aa617c",
            action: "share",
            multiSelect: false,
            openInNewWindow: true,
            success: async (files: any) => {
              try {
                console.log("Files picked:", files);
                if (files.value && files.value.length > 0) {
                  const data = await dataConverter(files.value[0]);
                  setFormData((prevData: any) => ({
                    ...prevData,
                    file: data.originFileObj,
                  }));
                } else {
                  console.warn("No files were selected");
                }
              } catch (error) {
                console.error("Error in file processing:", error);
              }
            },
            cancel: () => {
              console.log("File picking canceled");
            },
            error: (error: any) => {
              console.error("Error from OneDrive picker:", error);
            },
          };

          // Open OneDrive picker
          try {
            window.OneDrive.open(odOptions);
          } catch {
            alert(
              "OneDrive integration failed to load. Please try again later."
            );
          }
        } else {
          // Handle case when OneDrive SDK isn't loaded
          console.error("OneDrive SDK is not loaded");
          alert("OneDrive integration failed to load. Please try again later.");
        }
      } catch (error) {
        // Handle any unexpected errors
        console.error("Error initializing OneDrive picker:", error);
      }
    };

    handlePicker();
  };
  const handleSignIn = () => {
    return new Promise((resolve, reject) => {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (response: any) => {
          console.log("Callback Response:", response); // Log the response
          if (response.error) {
            message.error("Failed to get access token");
            reject(response.error);
          } else {
            setAccessToken(response.access_token);
            console.log("Access Token:", response.access_token); // Log the access token
            resolve(response.access_token);
          }
        },
      });
      client.requestAccessToken({ prompt: "consent" });
    });
  };
  const handleSignInAndOpenPicker = async () => {
    try {
      // If accessToken is not available, sign in and get it
      if (!accessToken) {
        const token: any = await handleSignIn();
        setAccessToken(token);
        openDrivePicker(token); // Call openPicker after obtaining the token
      } else {
        // If accessToken is available, directly open the picker
        openDrivePicker(accessToken);
      }
    } catch (error) {
      console.error("Error during sign-in and picker:", error);
      message.error("Failed to authenticate or open picker");
    }
  };

  const openDrivePicker = (token: string) => {
    // Open the picker with single file selection after getting the access token
    openPicker({
      clientId: CLIENT_ID,
      developerKey: API_KEY,
      viewId: "DOCS",
      showUploadView: true,
      showUploadFolders: true,
      supportDrives: true,
      multiselect: false, // Single file selection
      customScopes: [
        "https://www.googleapis.com/auth/drive.readonly",
        "https://www.googleapis.com/auth/drive",
      ],
      token: token, // Use the access token here

      callbackFunction: async (data: any) => {
        if (data.action === "picked" && data.docs.length > 0) {
          const selectedFile = data.docs[0]; // Get the selected file

          // Use the token to process the file
          const docData: any = await setDataFromGoogle(selectedFile, token);
          setFormData({ ...formData, file: docData.originFileObj });
        }
      },
    });
  };

  const triggerFileInput = () => {
    document.getElementById("file-input")?.click();
  };

  const menu = (
    <Menu>
      <Menu.Item key="local" icon={<MdLaptop />} onClick={triggerFileInput}>
        Upload from Local Device
      </Menu.Item>
      <Menu.Item
        key="google"
        icon={<AiOutlineGoogle />}
        onClick={handleSignInAndOpenPicker}
      >
        Upload from Google Drive
      </Menu.Item>
      <Menu.Item
        key="onedrive"
        icon={<AiOutlineWindows />}
        onClick={OneDrivePicker}
      >
        Upload from OneDrive
      </Menu.Item>
    </Menu>
  );

  const GetSections = async () => {
    try {
      const sectionsResponse: any = await axios.get(
        `api/business/getAllSectionsForEntity/${formData?.entityId}`
      );
      setSections(sectionsResponse?.data);
    } catch (err) {
      console.log("Error:", err);
    }
  };

  const handleLoginFailure = (response: any) => {};
  const getEntity = async () => {
    try {
      const entityData = await axios.get("api/documents/getEntityForDocument");
      setEntity(entityData.data);
    } catch (err) {}
  };
  const handleDocTypeChange = async (value: any, option: any) => {
    setFormData({
      ...formData,
      ["doctypeName"]: value,
      systems: [],
    });

    formData?.docTypes.map((item: any) => {
      // console.log("inside map=>", value);

      if (item.documentTypeName === value) {
        // console.log("testted", item);
        setSystems(item.applicable_systems);
      }
    });
  };

  const handleSystemsChange = (value: any, option: any) => {
    setFormData({
      ...formData,
      ["systems"]: value,
    });
  };
  const handleSectionChange = (value: any, option: any) => {
    setFormData({
      ...formData,
      section: value,
      sectionName: option.label,
    });
  };
  const handleTagsChange = (value: any, option: any) => {
    // console.log("value, option in handleSystemsChange", value, option);
    setFormData({
      ...formData,
      ["tags"]: value,
    });
  };

  const uploadProps: UploadProps = {
    multiple: false,
    beforeUpload: () => false, // Prevent file from being uploaded immediately.
    onChange({ file, fileList }) {
      // console.log("file in onChange-->", file);

      setUploadFileError(false);
      setFormData({ ...formData, file: file });
      setFileList([file]); // Save file in state.
      documentForm.setFieldsValue({ uploader: file });
      // console.log("file after Adding", file);
    },
    onRemove: (file) => {
      setFileList((prevState: any) => []);
      setFormData({ ...formData, file: "" });
      // console.log("file after removing", file);
    },
    fileList: formData?.file && formData.file.uid ? [formData.file] : [],
  };

  // const uploadProps: UploadProps = {
  //   multiple: true,
  //   beforeUpload: () => false, // Prevent file from being uploaded immediately.
  //   onChange({ file, fileList }) {
  //     if (
  //       file.status !== "uploading" &&
  //       file.status !== "removed" &&
  //       file.status !== "error"
  //     ) {
  //       setUploadFileError(false);
  //       setDriveFiles((prevData: any) => ([
  //         ...prevData,
  //         file,
  //       ]));
  //       setFileList(fileList); // Save file list in state.
  //       documentForm.setFieldsValue({ uploader: fileList });
  //     }
  //   },
  //   onRemove: (file) => {
  //     setFileList((prevState: any) => prevState.filter((f: any) => f.uid !== file.uid));
  //     setFormData((prevData: any) => ({
  //       ...prevData,
  //       files: prevData.files.filter((f: any) => f.uid !== file.uid),
  //     }));
  //     setDriveFiles((prevData: any) => prevData.filter((f: any) => f.uid !== file.uid));
  //   },
  //   fileList: driveFiles && driveFiles.length > 0 ? driveFiles : [],
  // };

  // const uploadProps: UploadProps = {
  //   multiple: true,
  //   beforeUpload: () => false, // Prevent file from being uploaded immediately.
  //   onChange({ file, fileList }) {
  //     if (
  //       file.status !== "uploading" &&
  //       file.status !== "removed" &&
  //       file.status !== "error"
  //     ) {
  //       setUploadFileError(false);
  //       setDriveFiles((prevData: any) => ([
  //         ...prevData,
  //         file,
  //       ]));
  //       setFileList(fileList); // Save file list in state.
  //       documentForm.setFieldsValue({ uploader: fileList });
  //     }
  //   },
  //   onRemove: (file) => {
  //     setFileList((prevState: any) => prevState.filter((f: any) => f.uid !== file.uid));
  //     setFormData((prevData: any) => ({
  //       ...prevData,
  //       files: prevData.files.filter((f: any) => f.uid !== file.uid),
  //     }));
  //     setDriveFiles((prevData: any) => prevData.filter((f: any) => f.uid !== file.uid));
  //   },
  //   fileList: driveFiles && driveFiles.length > 0 ? driveFiles : [],
  // };

  //Validation for fileType
  const validateFile = (file: any) => {
    const notAllowedExtensions = [".xlsx"];
    const fileExtension = file.name.split(".").pop().toLowerCase();

    if (notAllowedExtensions.includes(fileExtension)) {
      // Show an error message or perform any other action
      return false;
    }

    // Return true to allow the upload
    return true;
  };

  const handleInputChange = async (e: any) => {
    // console.log("handleDocumentChange ", e.target.name, e.target.value);
    if (e.target.name === "documentName") {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handlePressEnter = (event: any) => {
    if (event.key === "Enter") {
      // console.log("press enter", searchValue);
      redirectToGlobalSearch();
    }
  };

  const redirectToGlobalSearch = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleClickSearch = () => {
    // console.log("click search", searchValue);
    redirectToGlobalSearch();
  };

  const viewObjectStorageDoc = async (link: any) => {
    const response = await axios.post(`${API_LINK}/api/documents/viewerOBJ`, {
      documentLink: link,
    });
    return response.data;
  };

  const sampleData = entity.find(
    (value: any) => value.id === formData.entityId
  );

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
    async validator(_: any, value: any) {
      try {
        // Assume `validateInput` can return a Promise for asynchronous validation
        const result = await isValid(value);
        if (result.isValid === true) {
          return Promise.resolve(); // Validation passed
        }
        return Promise.reject(new Error(result.errorMessage)); // Validation failed with a message
      } catch (error) {
        return Promise.reject(new Error("Validation error occurred"));
      }
    },
  });

  return (
    <>
      <Modal
        title={
          <div
          // className={classes.header}
          >
            {/* <img
              src={HindalcoLogoSvg}
              height={"50px"}
              width={"70px"}
              style={{ marginRight: "15px" }}
            /> */}

            <span
            // className={classes.moduleHeader}
            >
              Search Results
            </span>
          </div>
        }
        width={800}
        style={{ top: 100, right: 250 }}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        // closeIcon={
        //   <img
        //     src={CloseIconImageSvg}
        //     alt="close-drawer"
        //     style={{ width: "36px", height: "38px", cursor: "pointer" }}
        //   />
        // }
        footer={false}
        bodyStyle={{ overflow: "hidden" }}

        // className={classes.modalWrapper}
      >
        <ReferencesResultPage
          searchValue={searchValue}
          selected={selectedData}
          setSelected={setSelected}
          isModalVisible={isModalVisible}
          activeTab={activeTab}
          systems={formData.systems}
        />
      </Modal>
      <Form
        form={documentForm}
        layout="vertical"
        initialValues={{
          documentName: formData?.documentName,
          doctypeName: formData?.doctypeName,
          section: formData?.section || undefined,
          reasonOfCreation: formData?.reasonOfCreation,
          description: formData?.description,
          tags: formData?.tags,
          entityId: formData?.entityId || undefined,
          systems: formData.systems || [],
        }}
        rootClassName={classes.labelStyle}
        // disabled={['RETIRE_INREVIEW','RETIRE_INAPPROVE','RETIRE'].includes(formData?.documentState)?true:false}
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item
              label="Title: "
              name="documentName"
              rules={[
                {
                  required: true,
                  message: "Please Enter Document Name!",
                },
                validateField("text"), // Use the custom validator
              ]}
              className={classes.labels}
            >
              <Input
                name="documentName"
                placeholder="Enter Document Name"
                size="large"
                disabled={
                  ["RETIRE_INREVIEW", "RETIRE_INAPPROVE", "RETIRE"].includes(
                    formData?.documentState
                  )
                    ? true
                    : formData.currentVersion === "A"
                    ? formData.status === "PUBLISHED"
                      ? true
                      : false
                    : true
                }
                onChange={(e: any) => handleInputChange(e)}
                value={formData?.documentName}
                style={{
                  // border: drawer?.mode === "edit" ? "none" : undefined,
                  color: "black",
                  backgroundColor: "white",
                  // paddingTop: drawer?.mode === "edit" ? "0px" : undefined,
                }}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item
              label="Document Type: "
              name="doctypeName"
              rules={[
                {
                  required: true,
                  message: "Please select a document type!",
                },
              ]}
              className={classes.labels}
            >
              <Select
                placeholder="Select Doc Type"
                onChange={handleDocTypeChange}
                size="large"
                disabled={
                  ["RETIRE_INREVIEW", "RETIRE_INAPPROVE", "RETIRE"].includes(
                    formData?.documentState
                  )
                  // ? true
                  // : drawer?.mode === "edit" || disableDocType
                }
                value={undefined}
                className={drawer?.mode === "edit" ? classes.select : ""}
              >
                {formData?.docTypes?.map((option: any) => (
                  <Option
                    key={option.documentTypeName}
                    value={option.documentTypeName}
                    label={option.documentTypeName}
                  >
                    {option.documentTypeName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="System: "
              name="systems"
              className={classes.labels}
              rules={[
                {
                  required: true,
                  message: "Please select a system",
                },
              ]}
            >
              <MUISelect
                fullWidth
                variant="outlined"
                multiple
                // disabled={
                //   ["RETIRE_INREVIEW", "RETIRE_INAPPROVE", "RETIRE"].includes(
                //     formData?.documentState
                //   )
                //     ? true
                //     : formData.currentVersion === "A"
                //     ? formData.status === "PUBLISHED"
                //       ? true
                //       : false
                //     : true
                // }
                value={formData?.systems || []}
                onChange={(e) => {
                  handleSystemsChange(e.target.value, "");
                }}
                style={{ color: "black" }}
                className={
                  drawer?.mode === "edit" ? classes.materialSelect : ""
                }
                // input={<OutlinedInput notched={false} />}
                // inputProps={{
                //   style: {
                //     border: "none",
                //     padding: 0,
                //   },
                // }}
                // MenuProps={{
                //   PaperProps: {
                //     style: {
                //       border: "none",
                //     },
                //   },
                // }}
              >
                {systems?.map((option: any, index: any) => (
                  <MenuItem key={option.id} value={option?.id}>
                    {option?.name}
                  </MenuItem>
                ))}
              </MUISelect>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item
              label="Dept/Vertical: "
              rules={[
                {
                  required: true,
                  message: "Please select a Entity!",
                },
              ]}
              className={classes.labels}
            >
              {entity.find(
                (value: any) =>
                  value?.id === formData?.entityId ||
                  formData.entityId === null ||
                  formData.entityId === undefined
              ) ? (
                <Select
                  placeholder="Select Entity:"
                  size="large"
                  value={formData.entityId}
                  showSearch
                  disabled={
                    ["RETIRE_INREVIEW", "RETIRE_INAPPROVE", "RETIRE"].includes(
                      formData?.documentState
                    )
                      ? true
                      : formData.currentVersion === "A"
                      ? formData.status === "new" || formData.status === "DRAFT"
                        ? false
                        : true
                      : true
                  }
                  optionFilterProp="children"
                  //defaultValue={selectedLocation.id}
                  filterOption={(input: any, option: any) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  onChange={(value) => {
                    setFormData({ ...formData, entityId: value });
                  }}
                  className={drawer?.mode === "edit" ? classes.select : ""}
                >
                  {!!entity &&
                    !!entity.length &&
                    entity?.map((option: any, index: number) => (
                      <Option
                        key={index}
                        value={option?.id}
                        label={option?.entityName}
                      >
                        {option?.entityName}
                      </Option>
                    ))}
                </Select>
              ) : (
                <Input
                  value={formData?.entityName}
                  disabled={true}
                  size="large"
                ></Input>
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Section: "
              name="section"
              className={classes.labels}
            >
              <Select
                placeholder="Select Section"
                size="large"
                value={undefined}
                showSearch
                optionFilterProp="children"
                // className={drawer?.mode === "edit" ? classes.select : ""}
                disabled={
                  ["RETIRE_INREVIEW", "RETIRE_INAPPROVE", "RETIRE"].includes(
                    formData?.documentState
                  )
                    ? true
                    : false
                }
                //defaultValue={selectedLocation.id}
                filterOption={(input: any, option: any) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                onChange={handleSectionChange}
              >
                {!!sections &&
                  !!sections.length &&
                  sections?.map((option: any, index: number) => (
                    <Option key={index} value={option?.id} label={option?.name}>
                      {option?.name}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item
              label="Reason for Creation/Amendment*: "
              name="reasonOfCreation"
              rules={[
                {
                  required: false,
                  message: "Please Enter Reason!",
                },
                validateField("text"),
              ]}
              className={classes.labels}
            >
              <TextArea
                rows={1}
                autoSize={{ minRows: 1, maxRows: 6 }}
                placeholder="Enter Reason"
                size="large"
                name="reasonOfCreation"
                disabled={
                  ["RETIRE_INREVIEW", "RETIRE_INAPPROVE", "RETIRE"].includes(
                    formData?.documentState
                  )
                    ? true
                    : formData.status === "PUBLISHED"
                    ? true
                    : false
                }
                onChange={(e: any) => handleInputChange(e)}
                value={formData?.reasonOfCreation}
                style={{
                  // border: drawer?.mode === "edit" ? "none" : undefined,
                  color: "black",
                  backgroundColor: "white",
                  // padding: "5px 11px 5px 11px ",
                }}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item
              label="Previous amendment reason: "
              name="description"
              className={classes.labels}
            >
              <TextArea
                name="description"
                autoSize={{ minRows: 1, maxRows: 6 }}
                rows={1}
                placeholder="Enter Document Description"
                onChange={(e: any) => handleInputChange(e)}
                size="large"
                disabled={true}
                value={formData?.description}
                style={{
                  // border: drawer?.mode === "edit" ? "none" : undefined,
                  color: "black",
                  backgroundColor: "white",
                  // padding: "3px 11px ",
                  // paddingTop: drawer?.mode === "edit" ? "0px" : undefined,
                }}
              />
            </Form.Item>
          </Col>
        </Row>
        {/* <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item label="Document Tags: " name="tags">
              <Select
                mode="tags"
                size="large"
                style={{ width: "100%" }}
                placeholder="Add Tag By Pressing Enter"
                dropdownStyle={{ display: "none" }}
                onChange={handleTagsChange}
                value={formData?.tags}
              />
            </Form.Item>
          </Col>
        </Row> */}

        <div
          style={{
            height: "auto",
            maxHeight: "250px",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <CommonReferencesTab
                clauseSearch={true}
                drawer={drawer}
                activeTabKey={activeTabKey}
                systems={formData.systems}
              />
            </Col>
          </Row>
        </div>
        <Row gutter={[16, 16]} style={{ paddingTop: "50px" }}>
          <Col span={24}>
            <Form.Item
              name="uploader"
              style={{ display: "none" }} // Hide this input
            >
              <Input />
            </Form.Item>
            <p>
              NOTE: You can upload any file type, but the default viewer
              supports only PDF, DOCX, JPG, and PNG. To view DOC, XLS, XLSX, PPT
              and PPTX files, use Aceoffix. For all other formats, a native
              viewer is required.
            </p>
            {/* <Form.Item
              name="documentLink"
              label={
                formData.file !== "" ? "Change Uploaded File" : "Attach File: "
              }
              help={uploadFileError ? "Please upload a file!" : ""}
              validateStatus={uploadFileError ? "error" : ""}
            >
              <div onClick={(e) => e.preventDefault()}>
                <Dragger
                  accept=".pdf,.png,.jpeg,.jpg,.docx,.bmp,.tif,.tiff,.webp"
                  {...uploadProps}
                  fileList={fileList}
                  className="uploadSection"
                >
                  <div>
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">
                      Click or drag file to this area to upload
                    </p>
                    <Dropdown overlay={menu} placement="bottomCenter">
                      <Button
                        type="primary"
                        icon={<CloudUploadOutlined />}
                        style={{ marginTop: "10px" }}
                        onClick={(e) => {}}
                      >
                        Upload
                      </Button>
                    </Dropdown>
                  </div>
                </Dragger>
              </div>

              {(drawer?.mode === "edit" ||
                drawerDataState?.formMode === "edit") &&
                !!formData.documentLink && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                      backgroundColor: "#f0f0f0",
                      padding: "5px",
                      borderRadius: "5px",
                      marginTop: "5px",
                    }}
                    onClick={async () => {
                      if (process.env.REACT_APP_IS_OBJECT_STORAGE === "true") {
                        const url = await viewObjectStorageDoc(
                          formData.documentLink
                        );
                        window.open(url, "_blank");
                      } else {
                        window.open(formData.documentLink, "_blank");
                      }
                    }}
                  >
                    <PaperClipOutlined style={{ color: "#003059" }} />
                    <span
                      style={{
                        marginLeft: "5px",
                        color: "#003059",
                        fontWeight: "bold",
                      }}
                    >
                      Download
                    </span>
                  </div>
                )}
            </Form.Item> */}
            <Form.Item
              name="documentLink"
              label={
                formData.file !== "" ? "Change Uploaded File" : "Attach File: "
              }
              help={uploadFileError ? "Please upload a file!" : ""}
              validateStatus={uploadFileError ? "error" : ""}
            >
              <Dragger
                accept=".pdf,.png,.jpeg,.jpg,.docx,.bmp,.tif,.tiff,.webp"
                name="documentLink"
                {...uploadProps}
                className={classes.uploadSection}
              >
                <p className="ant-upload-drag-icon">
                  <MdInbox />
                </p>
                <p className="ant-upload-text">
                  Click or drag file to this area to upload
                </p>
              </Dragger>
              {(drawer?.mode === "edit" ||
                drawerDataState?.formMode === "edit") &&
                !!formData.documentLink && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                      backgroundColor: "#f0f0f0",
                      padding: "5px",
                      borderRadius: "5px",
                      marginTop: "5px",
                    }}
                    onClick={async () => {
                      if (process.env.REACT_APP_IS_OBJECT_STORAGE === "true") {
                        const url = await viewObjectStorageDoc(
                          formData.documentLink
                        );
                        window.open(url, "_blank");
                      } else {
                        window.open(formData.documentLink, "_blank");
                      }
                    }}
                  >
                    <MdAttachFile style={{ color: "#003059" }} />
                    <span
                      style={{
                        marginLeft: "5px",
                        color: "#003059",
                        fontWeight: "bold",
                      }}
                    >
                      Download
                    </span>
                  </div>
                )}
              {/* <div>
                <h2>Upload Document from Google Drive</h2>
                <GoogleLoginComponent
                  onSuccess={handleLoginSuccess}
                  onFailure={handleLoginFailure}
                />
                {token && <p>Access Token: {token}</p>}
              </div> */}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default DocInfoTab;
