import { makeStyles } from "@material-ui/core/styles";
import { useLocation } from "react-router-dom";

//icons

import { Select, Checkbox, Row, Col, Button, message } from "antd";
import { useMediaQuery } from "@material-ui/core";
import { MdAddCircle } from "react-icons/md";
import { MdPermMedia } from "react-icons/md";
import { MdCollectionsBookmark } from "react-icons/md";
import { MdDescription } from "react-icons/md";
//thirdparty libs
import { useSnackbar } from "notistack";

import {
  AiOutlineInbox,
  AiOutlineGoogle,
  AiOutlineWindows,
} from "react-icons/ai";

import { Form, Modal, Upload, UploadProps, Popover } from "antd";
import useDrivePicker from "react-google-drive-picker";
import toFormData from "utils/toFormData";
import { useEffect, useState } from "react";
import getAppUrl from "utils/getAppUrl";
import axios from "apis/axios.global";
import getSessionStorage from "utils/getSessionStorage";
import { showLoader, hideLoader } from "components/GlobalLoader/loaderState"; // Import loader control functions
import setDataFromGoogle from "components/Document/DocumentTable/DocumentDrawer/DocInfoTab/GoogleLoginComponent";
const { Option } = Select;
type Props = {
  moduleName: string;
  createHandler?: any;
  filterHandler?: any;
  configHandler?: any;
  showSideNav?: boolean;
  filterDisplay?: boolean;
  searchValues?: any;
  refElementForAllDocument6?: any;
};

const useStyles = makeStyles((theme) => ({
  header: {
    display: "flex",
    alignItems: "center",
    marginTop: "2px",
  },
  uploadSection: {
    "& .ant-upload-list-item-name": {
      color: "blue !important",
    },
  },
  moduleHeader: {
    color: "#000",
    fontSize: "24px",
    textTransform: "capitalize",
    // fontFamily: "Poppins, sans-serif",
    lineHeight: "24px",
    paddingLeft: "6px",
  },
  docNavIconStyle: {
    width: "30px",
    height: "30px",
    paddingRight: "6px",
    cursor: "pointer",
  },
  docNavDivider: {
    top: "0.94em",
    height: "1.6em",
    background: "black",
  },
  docNavText: {
    // fontFamily: "Poppins",
    fontWeight: 500,
    fontSize: "14px",
    lineHeight: "24px",
    color: "#959595",
  },
  docNavRightFlexBox: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
  },
  docNavInnerFlexBox: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: "6px 4px",
    "& .ant-input": {
      background: "#E8F3F9 !important",
    },
  },
  divderRightSide: {
    top: "0.1em",
    height: "1.5em",
    background: "black",
  },
  docNavTextRightSide: {
    // fontFamily: "Poppins",
    fontWeight: 500,
    fontSize: "14px",
    lineHeight: "24px",
    color: "#000000 ",
    paddingLeft: "5px",
  },
  createButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 20px",
    cursor: "pointer",
    borderRadius: "8px",
    backgroundColor: "rgb(0, 48, 89)",
    color: "white",
    fontWeight: "bold",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "rgb(0, 70, 130)",
      boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.2)",
    },
  },
}));

const ModuleHeader = ({
  moduleName,
  createHandler,
  filterHandler,
  configHandler,
  showSideNav = false,
  searchValues,
  refElementForAllDocument6,
}: Props) => {
  const [formData, setFormData] = useState<any>([]);
  const userDetails = getSessionStorage();
  const [locationOptions, setLocationOptions] = useState<any>([]);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [departmentOptions, setDepartmentOptions] = useState<any>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [docTypeChecked, setDocTypeChecked] = useState<any>(true);
  const [docTypeOptions, setDocTypeOptions] = useState<any>([]);
  const [selectedDocType, setSelectedDocType] = useState<any>(null);
  const [systemsChecked, setSystemsChecked] = useState<any>(true);
  const [systemsOptions, setSystemsOptions] = useState<any>([]);
  const [selectedSystems, setSelectedSystems] = useState<any>(null);
  const [docStateChecked, setDocStateChecked] = useState<any>(true);
  const [docStateOptions, setDocStateOptions] = useState<any>([
    {
      name: "DRAFT",
    },
    {
      name: "PUBLISHED",
    },
  ]);
  const [selectedDocState, setSelectedDocState] = useState<any>(null);
  const [docNumberChecked, setDocNumberChecked] = useState<any>(true);
  const classes = useStyles();
  const location = useLocation();

  //to show bulk upload image loader
  const [batchId, setBatchId] = useState<any>(null);
  const [totalDocuments, setTotalDocuments] = useState<any>(0);
  const [processedDocuments, setProcessedDocuments] = useState<any>(0);

  const [uploadStatus, setUploadStatus] = useState({
    total: 0,
    processed: 0,
    failed: 0,
  });

  //popover for create in doc control
  const [popoverVisible, setPopoverVisible] = useState(false);

  // Start polling the status when batchId is available
  //  useEffect(() => {
  //   if (batchId) {
  //     showLoader(); // Show loader when batch upload starts
  //     pollStatus(batchId); // Start polling the status
  //   }
  // }, [batchId]);

  // console.log("checkcommon module header filter", filterHandler);

  const isEmptyFunction = (func: any) => {
    const funcStr = func?.toString();
    return (
      funcStr
        ?.slice(funcStr?.indexOf("{") + 1, funcStr?.lastIndexOf("}"))
        ?.trim() === ""
    );
  };

  const matches = useMediaQuery("(min-width:786px)");
  const [directCreateModel, setdirectCreateModel] = useState<any>({
    open: false,
  });
  const [bulkUploadModel, setBulkUploadModel] = useState<any>({
    open: false,
  });
  const [bulkUploadConfirmModel, setBulkUploadConfirmModel] = useState<any>({
    open: false,
  });

  const [bulkUploadModelImage, setBulkUploadModelImage] = useState<any>({
    open: false,
  });
  const [bulkUploadConfirmModelImage, setBulkUploadConfirmModelImage] =
    useState<any>({
      open: false,
    });

  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // useEffect(() => {
  //   const fetchUploadStatus = async () => {
  //     try {
  //       const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/documents/getDocProcessingStatus/${batchId}`);
  //       console.log("checkdocnew response of getDocProcessingStatus", response);

  //       const { totalDocumentsCount, processedDocumentsCount, failedDocumentsCount } = response.data;
  //       setUploadStatus({
  //         total: totalDocumentsCount,
  //         processed: processedDocumentsCount,
  //         failed: failedDocumentsCount
  //       });

  //       // Update the loader message
  //       showLoader(`${processedDocumentsCount}/${totalDocumentsCount} files processed`);

  //       // Show snackbar for any failed files
  //       if (failedDocumentsCount > 0) {
  //         enqueueSnackbar(`${failedDocumentsCount} file(s) failed to process`, { variant: "error" });
  //       }

  //       // Stop polling if all files are processed
  //       if (processedDocumentsCount + failedDocumentsCount === totalDocumentsCount) {
  //         hideLoader();
  //         clearInterval(intervalId);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching upload status:", error);
  //     }
  //   };

  //   // Start polling every 2 seconds
  //   const intervalId = setInterval(fetchUploadStatus, 2000);

  //   return () => clearInterval(intervalId); // Clear interval on component unmount
  // }, [batchId]);

  const [fileListState, setFileListState] = useState<any>([]);
  const realmName = getAppUrl();
  const { enqueueSnackbar } = useSnackbar();

  const [openPicker] = useDrivePicker();
  const [accessToken, setAccessToken] = useState<any>(null);
  const [googleData, setGoogleData] = useState<any>();

  useEffect(() => {
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

  const CLIENT_ID = googleData?.clientId;
  const API_KEY = googleData?.clientSecret;
  const SCOPES = "https://www.googleapis.com/auth/drive.file";

  useEffect(() => {
    console.log(
      "checkdocnew useEffect[filelist] in module header",
      fileListState
    );
  }, [fileListState]);

  const uploadProps: UploadProps = {
    multiple: true, // Set to true to allow multiple file uploads
    beforeUpload: () => false,
    onChange({ file, fileList }) {
      if (
        file.status !== "uploading" &&
        file.status !== "removed" &&
        file.status !== "error"
      ) {
        console.log("checkdocnew fileList in uploadprops", fileList);

        // Map through fileList to extract only originFileObj for each file
        // const originFileObjects = fileList.map((f: any) => f.originFileObj);

        // Set the state to only contain the current files without duplicates
        setFileListState(fileList);
      }
    },
    onRemove: (file) => {
      setFileListState((prevState: any) =>
        prevState.filter((f: any) => f.uid !== file.uid)
      ); // Remove the specific file from the list
    },
  };

  const startBulkUpload = async () => {
    if (userDetails?.location?.id) {
      setSelectedLocation(userDetails?.location?.id);
    }
    if (userDetails?.entity?.id) {
      setSelectedDepartment(userDetails?.entity?.id);
    }
    getAllLocations();
    getAllDepartmentsByLocation(userDetails?.location?.id);
  };

  const getAllLocations = async () => {
    try {
      const res = await axios.get(
        `/api/riskregister/getAllLocation/${userDetails?.organizationId}`
      );

      if (res.status === 200 || res.status === 201) {
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

  const getAllDepartmentsByLocation = async (locationId: any = "") => {
    try {
      const res = await axios.get(
        `/api/riskregister/getAllDepartmentsByLocation/${locationId}`
      );

      if (res.status === 200 || res.status === 201) {
        if (res?.data?.data && !!res.data.data.length) {
          setDepartmentOptions(
            res?.data?.data?.map((item: any) => ({
              ...item,
              value: item.id,
              label: item.entityName,
            }))
          );
        } else {
          setDepartmentOptions([]);
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

  const handleLocationChange = (value: any) => {
    setSelectedLocation(value);
    setSelectedDepartment("");
    getAllDepartmentsByLocation(value);
  };

  const handleDepartmentChange = (value: any) => {
    setSelectedDepartment(value);
  };

  const handleDocTypeSelect = (e: any) => {
    setDocTypeChecked(e.target.checked);
  };

  const handleDocTypeChange = (value: any) => {
    setFormData({
      ...formData,
      ["document_type"]: value,
      // systems: [],
    });
    setSystemsChecked(true);
  };

  const handleSystemSelect = (e: any) => {
    setSystemsChecked(e.target.checked);
  };

  const handleSystemsChange = (value: any) => {
    const system = systemsOptions.find((item: any) => item.name === value);
    const systemIdArray = system ? [system.id] : [];
    setFormData({
      ...formData,
      ["system"]: systemIdArray,
      // systems: [],
    });
  };

  const handleDocStateSelect = (e: any) => {
    setDocStateChecked(e.target.checked);
  };

  const handleDocStateChange = (value: any) => {
    setFormData({
      ...formData,
      ["documentState"]: value,
      // systems: [],
    });
  };

  const handleDocNumberSelect = (e: any) => {
    setDocNumberChecked(e.target.checked);
  };

  useEffect(() => {
    if (docTypeOptions) {
      axios
        .get("/api/doctype/documents/getDoctypeCreatorDetails")
        .then((res) => {
          // Handle the response here
          setDocTypeOptions(res.data.doctypes);
        })
        .catch((error) => {
          // Handle any errors here
          console.error(error);
        });
    }
  }, [docTypeChecked]);

  useEffect(() => {
    if (!systemsChecked) {
      axios
        .get("/api/doctype/documents/getDoctypeCreatorDetails")
        .then((res) => {
          if (!docTypeChecked) {
            res.data?.doctypes?.map((value: any) => {
              if (value.documentTypeName === formData.document_type) {
                setSystemsOptions(value.applicable_systems);
              }
            });
          } else {
            const combinedSystems = res.data.doctypes.reduce(
              (acc: any[], doctype: any) => {
                doctype.applicable_systems.forEach((system: any) => {
                  // Check for duplicates based on system ID
                  if (
                    !acc.some(
                      (existingSystem) => existingSystem.id === system.id
                    )
                  ) {
                    acc.push(system);
                  }
                });
                return acc;
              },
              []
            ); // <- Initialize acc as an empty array here
            setSystemsOptions(combinedSystems);
          }
        })
        .catch((error) => {
          // Handle any errors here
          console.error(error);
        });
    }
  }, [systemsChecked]);

  const directCreate = async () => {
    try {
      setFileListState([]);
      if (
        fileListState[0]?.originFileObj &&
        fileListState[0]?.originFileObj.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        enqueueSnackbar(`Document is getting prepared`, {
          variant: "info",
        });
        const fileFormData = new FormData();
        fileFormData.append("file", fileListState[0].originFileObj);
        const res = await axios.post(
          `${process.env.REACT_APP_PY_URL}/pyapi/documents/directCreate?realm=${realmName}`,
          fileFormData
        );
        const data = JSON.parse(res?.data?.entities);

        const getDocTypeId = await axios.get(
          `/api/doctype/getDocTypeByName?docType=${data?.document_type}&location=${data?.location}&department=${data?.department}&section=${data?.section}`
        );
        if (getDocTypeId?.data?.finalResult) {
          const createData = {
            documentName: data?.document_title,
            documentState: "DRAFT",
            doctypeId: getDocTypeId?.data?.finalResult?.docTypeId,
            realmName,
            locationId: getDocTypeId?.data?.finalResult?.locationId,
            entityId: getDocTypeId?.data?.finalResult?.entityId,
            systems: getDocTypeId?.data?.finalResult?.systems,
            doctypeName: data?.document_type,
            documentNumbering: "",
            reasonOfCreation: "",
            documentLink: res?.data?.filePath,
            description: "",
            approvers: "undefined",
            reviewers: "undefined",
            distributionList:
              getDocTypeId?.data?.finalResult?.docTypeDetails?.distributionList,
            distributionUsers:
              getDocTypeId?.data?.finalResult?.docTypeDetails
                ?.distributionUsers,
            locationName: data?.location,
            departmentName: "",
            readAccess:
              getDocTypeId?.data?.finalResult?.docTypeDetails?.readAccess,
            readAccessUsers:
              getDocTypeId?.data?.finalResult?.docTypeDetails?.readAccessUsers,
            docsClassification:
              getDocTypeId?.data?.finalResult?.docTypeDetails
                ?.document_classification,
            issueNumber: "",
            section: getDocTypeId?.data?.finalResult?.section,
            status: "new",
            entityName: data?.department,
            sectionName: getDocTypeId?.data?.finalResult?.sectionName,
          };

          const form = toFormData(createData);
          //form.append("file", fileListState[0].originFileObj);
          const createDoc = await axios.post(
            `api/documents?realm=${realmName}&locationName=${data.location}`,
            form
          );

          enqueueSnackbar(getDocTypeId?.data?.message, {
            variant: "success",
          });
        } else {
          enqueueSnackbar(getDocTypeId?.data?.message, {
            variant: "error",
          });
        }
      } else {
        enqueueSnackbar(`Please add a (.docx) document only`, {
          variant: "warning",
        });
      }
    } catch {
      enqueueSnackbar(
        `Could not process the document, please check the document`,
        {
          variant: "error",
        }
      );
    }
  };

  const bulkUpload = async () => {
    const location = locationOptions.find(
      (item: any) => item.id === selectedLocation
    );
    const department = departmentOptions.find(
      (item: any) => item.id === selectedDepartment
    );
    let finalFormData: any;
    if (docTypeChecked) {
      finalFormData = toFormData({
        ...formData,
        documentNumbering: docNumberChecked,
        location: location.locationName,
        department: department.entityName,
        realmName: realmName,
        entityId: userDetails?.entity?.id,
        locationId: userDetails?.location?.id,
        organizationId: userDetails?.organizationId,
        createdBy: userDetails?.id,
      });
      finalFormData.append(
        "docTypeOptions",
        JSON.stringify(
          docTypeOptions.map((item: any) => ({
            documentTypeName: item.documentTypeName,
            applicable_systems: item.applicable_systems,
          }))
        )
      );
    } else {
      finalFormData = toFormData({
        ...formData,
        documentNumbering: docNumberChecked,
        location: location.locationName,
        department: department.entityName,
        realmName: realmName,
        organizationId: userDetails?.organizationId,
        entityId: userDetails?.entity?.id,
        locationId: userDetails?.location?.id,
        createdBy: userDetails?.id,
      });
    }
    if (fileListState.length > 0) {
      fileListState.forEach((file: any) => {
        finalFormData.append("files", file.originFileObj);
      });
      try {
        enqueueSnackbar("Bulk Upload In Progress", {
          variant: "info",
        });
        showLoader("Processing Documents...");
        const bulkUploadDocRes = await axios.post(
          `${process.env.REACT_APP_PY_URL}/pyapi/percipereBulkUpload`,
          finalFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        showLoader(
          "Job has been initiated, Document(s) will be available in My Documents . Check Document Settings for Job Status"
        );
        setTimeout(() => {
          hideLoader();
        }, 2000);
        console.log("Files uploaded successfully");
      } catch (error) {
        console.error("Error uploading files:", error);
      }
    }
  };

  const bulkUploadImages = async () => {
    const location = locationOptions.find(
      (item: any) => item.id === selectedLocation
    );
    const department = departmentOptions.find(
      (item: any) => item.id === selectedDepartment
    );
    let finalFormData: any;
    if (docTypeChecked) {
      finalFormData = toFormData({
        ...formData,
        documentNumbering: docNumberChecked,
        location: location.locationName,
        department: department.entityName,
        realmName: realmName,
        organizationId: userDetails?.organizationId,
        entityId: userDetails?.entity?.id,
        locationId: userDetails?.location?.id,
        createdBy: userDetails?.id,
      });
      finalFormData.append(
        "docTypeOptions",
        JSON.stringify(
          docTypeOptions.map((item: any) => ({
            documentTypeName: item.documentTypeName,
            applicable_systems: item.applicable_systems,
          }))
        )
      );
    } else {
      finalFormData = toFormData({
        ...formData,
        documentNumbering: docNumberChecked,
        location: location.locationName,
        department: department.entityName,
        realmName: realmName,
        organizationId: userDetails?.organizationId,
        entityId: userDetails?.entity?.id,
        locationId: userDetails?.location?.id,
        createdBy: userDetails?.id,
      });
    }
    if (fileListState.length > 0) {
      fileListState.forEach((file: any) => {
        finalFormData.append("files", file.originFileObj);
      });
      try {
        enqueueSnackbar("Bulk Upload In Progress", {
          variant: "info",
        });
        // showLoader("Processing Images...");
        const bulkUploadRes = await axios.post(
          `${process.env.REACT_APP_PY_URL}/pyapi/bulkUploadImages`,
          finalFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log("checkdocnew bulkUploadRes", bulkUploadRes);

        showLoader(
          "Job has been initiated, Document(s) will be available in My Documents . Check Document Settings for Job Status"
        );
        setTimeout(() => {
          hideLoader();
        }, 2000);
        console.log("Files uploaded successfully");
      } catch (error) {
        console.error("Error uploading files:", error);
      }
    }
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

  const OneDrivePicker: any = () => {
    const dataConverter = async (file: any) => {
      const response = await axios.get(file["@microsoft.graph.downloadUrl"], {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        responseType: "blob",
      });

      const blob = response.data;
      const fileObject = new File([blob], file.name, { type: blob.type });
      console.log(
        "checkdocnew file object in data converteer onedrive picker",
        fileObject
      );

      const fileData = {
        uid: file.id,
        name: file.name,
        status: "done",
        url: URL.createObjectURL(blob),
        originFileObj: fileObject,
      };
      console.log(
        "checkdocnew fileData in data converteer onedrive picker",
        fileData
      );

      return fileData;
    };

    const handlePicker = () => {
      try {
        if (typeof window.OneDrive !== "undefined") {
          const odOptions = {
            clientId: "b7ff3df0-1302-40f7-9f12-ac31e3aa617c",
            action: "share",
            multiSelect: true,
            openInNewWindow: true,
            success: async (files: any) => {
              try {
                if (files.value && files?.value?.length > 0) {
                  const dataPromises = files?.value?.map((file: any) =>
                    dataConverter(file)
                  );
                  console.log(
                    "checkdocnew dataPromises in onedrive picker",
                    dataPromises
                  );

                  const uploadedFiles = await Promise.all(dataPromises);
                  console.log(
                    "checkdocnew uploadedFiles in onedrive picker",
                    uploadedFiles
                  );

                  setFileListState((prevData: any) => [
                    ...prevData,
                    ...uploadedFiles,
                  ]);
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

          window.OneDrive.open(odOptions);
        } else {
          console.error("OneDrive SDK is not loaded");
          alert("OneDrive integration failed to load. Please try again later.");
        }
      } catch (error) {
        console.error("Error initializing OneDrive picker:", error);
      }
    };

    handlePicker();
  };

  const handleOpenPicker = async () => {
    let token: any = accessToken;

    if (!token) {
      try {
        token = await handleSignIn();
      } catch (error) {
        console.error("Error during sign-in:", error);
        return;
      }
    }

    openPicker({
      clientId: CLIENT_ID,
      developerKey: API_KEY,
      viewId: "DOCS",
      showUploadView: true,
      showUploadFolders: true,
      supportDrives: true,
      multiselect: true,
      callbackFunction: async (data: any) => {
        console.log("checkdocnew openPicker callbackfunction DATA---<", data);

        if (data.action === "picked" && data.docs.length > 0) {
          const dataPromises = data.docs.map((selectedFile: any) =>
            setDataFromGoogle(selectedFile, accessToken)
          );
          const uploadedFiles = await Promise.all(dataPromises);
          //outlook.prodlelabs.com/processdocuments/processdocument
          console.log(
            "checkdocnew openPicker callbackfunction uploadedFiles---<",
            uploadedFiles
          );

          setFileListState((prevData: any) => [...prevData, ...uploadedFiles]);
        }
      },
    });
  };

  const triggerFileInput = () => {
    document.getElementById("file-input")?.click();
  };

  const handlePopoverClose = () => {
    setPopoverVisible(false); // Close the popover
  };
  const popoverContent = (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {/* Single Create */}
      <Button
        type="text"
        icon={<MdDescription style={{ width: "24px", height: "20px" }} />}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: "8px",
        }}
        onClick={() => {
          createHandler && createHandler();
          handlePopoverClose(); // Close the popover after click
        }}
      >
        Document
      </Button>
      {/* Bulk Upload Document */}
      <Button
        type="text"
        icon={
          <MdCollectionsBookmark style={{ width: "24px", height: "20px" }} />
        }
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: "8px",
        }}
        onClick={() => {
          startBulkUpload && startBulkUpload();
          setBulkUploadModel && setBulkUploadModel({ open: true });
          setFileListState && setFileListState([]);
          handlePopoverClose(); // Close the popover after click
        }}
      >
        Multiple Documents
      </Button>

      {/* Bulk Upload Images */}
      <Button
        type="text"
        icon={<MdPermMedia style={{ width: "24px", height: "20px" }} />}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: "8px",
        }}
        onClick={() => {
          startBulkUpload && startBulkUpload();
          setBulkUploadModelImage && setBulkUploadModelImage({ open: true });
          setFileListState && setFileListState([]);
          handlePopoverClose(); // Close the popover after click
        }}
      >
        Images
      </Button>
    </div>
  );

  return (
    <>
      {matches ? (
        <>
          {filterHandler ? (
            <>
              {" "}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  // marginLeft: "5px",
                  cursor: "pointer",
                }}
              >
                <Popover
                  content={popoverContent}
                  trigger={["click", "hover"]}
                  placement="bottomRight"
                  open={popoverVisible}
                  onOpenChange={(visible) => setPopoverVisible(visible)} // Handle visibility manually
                >
                  <Button
                    type="primary"
                    icon={
                      <MdAddCircle
                        style={{
                          marginRight: "2px",
                          width: "24px",
                          height: "20px",
                        }}
                      />
                    }
                    style={{
                      backgroundColor: "rgb(0, 48, 89)",
                      borderColor: "rgb(0, 48, 89)",
                      color: "white",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "end",
                    }}
                  >
                    Upload
                  </Button>
                </Popover>
              </div>
            </>
          ) : (
            <>
              {createHandler && (
                <Button
                  type="primary"
                  size="middle"
                  onClick={createHandler}
                  style={{
                    backgroundColor: "rgb(0, 48, 89)",
                    fontSize: "15px",
                    padding: "2px 16px",
                    letterSpacing: "0.5px",
                    marginRight: "10px",
                  }}
                >
                  Create
                </Button>
              )}
            </>
          )}
        </>
      ) : (
        <>
          <MdAddCircle
            onClick={() => {
              createHandler();
            }}
            style={{
              color: "rgb(0, 48, 89)",
              paddingTop: "5px",
              fontSize: "30px",
            }}
          />
        </>
      )}

      <>
        {bulkUploadModel.open && (
          <Modal
            title="Bulk Upload"
            open={bulkUploadModel.open}
            onCancel={() => setBulkUploadModel({ open: false })}
            onOk={() => {
              setBulkUploadConfirmModel({ open: true });
              setBulkUploadModel({ open: false });
            }}
          >
            <Row gutter={[16, 16]} justify="center">
              <Col>
                <Button
                  type="primary"
                  icon={<AiOutlineGoogle />}
                  onClick={handleOpenPicker}
                >
                  Upload from Google Drive
                </Button>
              </Col>
              <Col>
                <Button
                  type="primary"
                  icon={<AiOutlineWindows />}
                  onClick={OneDrivePicker}
                >
                  Upload from OneDrive
                </Button>
              </Col>
            </Row>
            <Row
              gutter={[16, 16]}
              style={{ paddingTop: "50px", display: "block" }}
            >
              <Col span={24}>
                <Form.Item
                  name="documentLink"
                  label={"Upload From Local Device: "}
                >
                  <div onClick={(e) => e.preventDefault()}>
                    <Upload.Dragger
                      accept=".pdf,.png,.jpeg,.jpg,.docx,.bmp,.tif,.tiff,.webp"
                      {...uploadProps}
                      fileList={fileListState}
                      className={classes.uploadSection}
                    >
                      <p className="ant-upload-drag-icon">
                        <AiOutlineInbox />
                      </p>
                      <p className="ant-upload-text">
                        Click or drag file to this area to upload
                      </p>
                    </Upload.Dragger>
                  </div>
                </Form.Item>
              </Col>
            </Row>
          </Modal>
        )}
        {bulkUploadConfirmModel.open && (
          <Modal
            title="Upload Confirmation"
            open={bulkUploadConfirmModel.open}
            onCancel={() => setBulkUploadConfirmModel({ open: false })}
            onOk={() => {
              bulkUpload();
              setBulkUploadConfirmModel({ open: false });
            }}
          >
            <div style={{ display: "grid", gap: "5px", padding: "20px" }}>
              {/* Department and Unit Section */}
              <div
                style={{ display: "flex", gap: "40px", marginBottom: "5px" }}
              >
                <div>
                  <strong>Department</strong>
                  <Select
                    showSearch
                    placeholder="Select Department"
                    optionFilterProp="children"
                    filterOption={(input, option: any) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    style={{ width: "200px", marginTop: "10px" }}
                    value={selectedDepartment}
                    options={departmentOptions || []}
                    onChange={handleDepartmentChange}
                    listHeight={200}
                  />
                </div>
                <div>
                  <strong>Unit</strong>
                  <Select
                    showSearch
                    placeholder="Select Unit"
                    optionFilterProp="children"
                    filterOption={(input, option: any) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    style={{ width: "200px", marginTop: "10px" }}
                    value={selectedLocation}
                    onChange={handleLocationChange}
                    listHeight={200}
                  >
                    {locationOptions.map((option: any) => (
                      <Select.Option key={option.value} value={option.value}>
                        {option.label}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              </div>
              <h3>Select for AI Suggestion</h3>
              {/* Document Options Section */}
              <div
                style={{ display: "flex", gap: "40px", marginBottom: "20px" }}
              >
                <div
                  style={{ display: "grid", gap: "20px", paddingRight: "20px" }}
                >
                  <Checkbox
                    style={{ paddingLeft: "8px" }}
                    defaultChecked={docTypeChecked}
                    onChange={handleDocTypeSelect}
                  >
                    <strong>Document Type</strong>
                  </Checkbox>
                  <Checkbox
                    checked={systemsChecked}
                    onChange={handleSystemSelect}
                  >
                    <strong>System</strong>
                  </Checkbox>
                  <Checkbox
                    defaultChecked={docStateChecked}
                    onChange={handleDocStateSelect}
                  >
                    <strong>Document State</strong>
                  </Checkbox>
                  <Checkbox
                    defaultChecked={docNumberChecked}
                    onChange={handleDocNumberSelect}
                  >
                    <strong>Document No</strong>
                  </Checkbox>
                </div>

                <div>
                  {!docTypeChecked && (
                    <>
                      <strong>Document Type: </strong>
                      <Select
                        placeholder="Select Doc Type"
                        onChange={handleDocTypeChange}
                        size="large"
                        style={{ width: "250px", marginBottom: "10px" }}
                        value={undefined}
                      >
                        {docTypeOptions.map((option: any) => (
                          <Option
                            key={option.documentTypeName}
                            value={option.documentTypeName}
                            label={option.documentTypeName}
                          >
                            {option.documentTypeName}
                          </Option>
                        ))}
                      </Select>
                    </>
                  )}

                  {!systemsChecked && (
                    <>
                      <strong>System: </strong>
                      <Select
                        placeholder="Select System"
                        onChange={handleSystemsChange}
                        size="large"
                        style={{ width: "250px", marginBottom: "10px" }}
                        value={undefined}
                      >
                        {systemsOptions.map((option: any) => (
                          <Option
                            key={option.name}
                            value={option.name}
                            label={option.name}
                          >
                            {option.name}
                          </Option>
                        ))}
                      </Select>
                    </>
                  )}

                  {!docStateChecked && (
                    <>
                      <strong>Document State: </strong>
                      <Select
                        placeholder="Select Doc State"
                        onChange={handleDocStateChange}
                        size="large"
                        style={{ width: "250px", marginBottom: "10px" }}
                        value={undefined}
                      >
                        {docStateOptions.map((option: any) => (
                          <Option
                            key={option.name}
                            value={option.name}
                            label={option.name}
                          >
                            {option.name}
                          </Option>
                        ))}
                      </Select>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Modal>
        )}

        {bulkUploadModelImage.open && (
          <Modal
            title="Bulk Upload Images"
            open={bulkUploadModelImage.open}
            onCancel={() => setBulkUploadModelImage({ open: false })}
            onOk={() => {
              setBulkUploadConfirmModelImage({ open: true });
              setBulkUploadModelImage({ open: false });
            }}
          >
            <Row gutter={[16, 16]} justify="center">
              <Col>
                <Button
                  type="primary"
                  icon={<AiOutlineGoogle />}
                  onClick={handleOpenPicker}
                >
                  Upload from Google Drive
                </Button>
              </Col>
              <Col>
                <Button
                  type="primary"
                  icon={<AiOutlineWindows />}
                  onClick={OneDrivePicker}
                >
                  Upload from OneDrive
                </Button>
              </Col>
            </Row>

            {/* Form content below the buttons */}
            <Row
              gutter={[16, 16]}
              style={{ paddingTop: "50px", display: "block" }}
            >
              <Col span={24}>
                <Form.Item
                  name="documentLink"
                  label={"Upload From Local Device: "}
                >
                  <div onClick={(e) => e.preventDefault()}>
                    <Upload.Dragger
                      accept=".png,.jpeg,.jpg,.webp"
                      {...uploadProps}
                      fileList={fileListState}
                      className={classes.uploadSection}
                    >
                      <p className="ant-upload-drag-icon">
                        <AiOutlineInbox />
                      </p>
                      <p className="ant-upload-text">
                        Click or drag file to this area to upload
                      </p>
                    </Upload.Dragger>
                  </div>
                </Form.Item>
              </Col>
            </Row>
          </Modal>
        )}
        {bulkUploadConfirmModelImage.open && (
          <Modal
            title="Upload Confirmation"
            open={bulkUploadConfirmModelImage.open}
            onCancel={() => setBulkUploadConfirmModelImage({ open: false })}
            onOk={() => {
              bulkUploadImages();
              setBulkUploadConfirmModelImage({ open: false });
            }}
          >
            <div style={{ display: "grid", gap: "5px", padding: "20px" }}>
              {/* Department and Unit Section */}
              <div
                style={{ display: "flex", gap: "40px", marginBottom: "5px" }}
              >
                <div>
                  <strong>Department</strong>
                  <Select
                    showSearch
                    placeholder="Select Department"
                    optionFilterProp="children"
                    filterOption={(input, option: any) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    style={{ width: "200px", marginTop: "10px" }}
                    value={selectedDepartment}
                    options={departmentOptions || []}
                    onChange={handleDepartmentChange}
                    listHeight={200}
                  />
                </div>
                <div>
                  <strong>Unit</strong>
                  <Select
                    showSearch
                    placeholder="Select Unit"
                    optionFilterProp="children"
                    filterOption={(input, option: any) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    style={{ width: "200px", marginTop: "10px" }}
                    value={selectedLocation}
                    onChange={handleLocationChange}
                    listHeight={200}
                  >
                    {locationOptions.map((option: any) => (
                      <Select.Option key={option.value} value={option.value}>
                        {option.label}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              </div>
              <h3>Select for AI Suggestion</h3>
              {/* Document Options Section */}
              <div
                style={{ display: "flex", gap: "40px", marginBottom: "20px" }}
              >
                <div
                  style={{ display: "grid", gap: "20px", paddingRight: "20px" }}
                >
                  <Checkbox
                    style={{ paddingLeft: "8px" }}
                    defaultChecked={docTypeChecked}
                    onChange={handleDocTypeSelect}
                  >
                    <strong>Document Type</strong>
                  </Checkbox>
                  <Checkbox
                    checked={systemsChecked}
                    onChange={handleSystemSelect}
                  >
                    <strong>System</strong>
                  </Checkbox>
                  <Checkbox
                    defaultChecked={docStateChecked}
                    onChange={handleDocStateSelect}
                  >
                    <strong>Document State</strong>
                  </Checkbox>
                  <Checkbox
                    defaultChecked={docNumberChecked}
                    onChange={handleDocNumberSelect}
                  >
                    <strong>Document No</strong>
                  </Checkbox>
                </div>

                <div>
                  {!docTypeChecked && (
                    <>
                      <strong>Document Type: </strong>
                      <Select
                        placeholder="Select Doc Type"
                        onChange={handleDocTypeChange}
                        size="large"
                        style={{ width: "250px", marginBottom: "10px" }}
                        value={undefined}
                      >
                        {docTypeOptions.map((option: any) => (
                          <Option
                            key={option.documentTypeName}
                            value={option.documentTypeName}
                            label={option.documentTypeName}
                          >
                            {option.documentTypeName}
                          </Option>
                        ))}
                      </Select>
                    </>
                  )}

                  {!systemsChecked && (
                    <>
                      <strong>System: </strong>
                      <Select
                        placeholder="Select System"
                        onChange={handleSystemsChange}
                        size="large"
                        style={{ width: "250px", marginBottom: "10px" }}
                        value={undefined}
                      >
                        {systemsOptions.map((option: any) => (
                          <Option
                            key={option.name}
                            value={option.name}
                            label={option.name}
                          >
                            {option.name}
                          </Option>
                        ))}
                      </Select>
                    </>
                  )}

                  {!docStateChecked && (
                    <>
                      <strong>Document State: </strong>
                      <Select
                        placeholder="Select Doc State"
                        onChange={handleDocStateChange}
                        size="large"
                        style={{ width: "250px", marginBottom: "10px" }}
                        value={undefined}
                      >
                        {docStateOptions.map((option: any) => (
                          <Option
                            key={option.name}
                            value={option.name}
                            label={option.name}
                          >
                            {option.name}
                          </Option>
                        ))}
                      </Select>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Modal>
        )}
      </>
    </>
  );
};

export default ModuleHeader;

{
  /* {directCreateModel.open && (
          <Modal
            title="Direct Create"
            open={directCreateModel.open}
            onCancel={() => setdirectCreateModel({ open: false })}
            onOk={() => {
              directCreate();
              setdirectCreateModel({ open: false });
            }}
          >
            <Form.Item name="attachments" label={"Attach File: "}>
              <Upload
                name="attachments"
                {...uploadProps}
                //className={classes.buttonColor}
                fileListState={fileListState}
              >
                <p className="ant-upload-drag-icon">
                  <InboxIcon />
                </p>
                <p className="ant-upload-text">
                  Click or drag file to this area to upload
                </p>
              </Upload>
            </Form.Item>
          </Modal>
        )} */
}

{
  /* <Tooltip title="Direct Create">
              <NoteAddIcon
                onClick={() => setdirectCreateModel({ open: true })}
                style={{
                  fontSize: "30px",
                  color: "rgb(0, 48, 89)",
                  marginRight: "20px",
                  marginBottom: "5px"
                }}
              />
            </Tooltip> */
}
