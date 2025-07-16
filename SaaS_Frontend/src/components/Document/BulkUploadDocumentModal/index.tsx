import { makeStyles } from "@material-ui/core/styles";
import { useLocation } from "react-router-dom";

//icons

import { Select, Checkbox, Row, Col, Button, message } from "antd";
import { useMediaQuery } from "@material-ui/core";
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
  bulkUploadModel?: any;
  bulkUploadConfirmModel?: any;
  setBulkUploadConfirmModel?: any;
  setBulkUploadModel?: any;
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

const BulkUploadDocumentModal = ({
  bulkUploadModel,
  bulkUploadConfirmModel,
  setBulkUploadConfirmModel,
  setBulkUploadModel,
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
  const [isUploading, setIsUploading] = useState(false);
  const [selectedSystems, setSelectedSystems] = useState<any>(null);
  const [docStateChecked, setDocStateChecked] = useState<any>(true);
  const [docStateOptions, setDocStateOptions] = useState<any>([
    {
      name: "DRAFT",
    },
    {
      name: "PUBLISHED",
    },
    {
      name: "Initiate Workflow",
    },
  ]);
  const [selectedDocState, setSelectedDocState] = useState<any>(null);
  const [selectWorkflow, setSelectWorkflow] = useState<any>(true);
  const [docNumberChecked, setDocNumberChecked] = useState<any>(true);
  const classes = useStyles();

  const [fileListState, setFileListState] = useState<any>([]);
  const realmName = getAppUrl();
  const { enqueueSnackbar } = useSnackbar();

  const [openPicker] = useDrivePicker();
  const [accessToken, setAccessToken] = useState<any>(null);
  const [googleData, setGoogleData] = useState<any>();
  const [activeModules, setActiveModules] = useState<string[]>([]);
  useEffect(() => {
    getGoogleDtls();
    getActiveModules();
  }, []);
  // console.log("active modules", activeModules);
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
  const getActiveModules = async () => {
    await axios(`/api/organization/getAllActiveModules/${realmName}`)
      .then((res) => {
        setActiveModules(res.data.activeModules);
      })
      .catch((err) => console.error(err));
  };
  const CLIENT_ID = googleData?.clientId;
  const API_KEY = googleData?.clientSecret;
  const SCOPES = "https://www.googleapis.com/auth/drive.file";

  // useEffect(() => {
  //   console.log(
  //     "checkdocnew useEffect[filelist] in module header",
  //     fileListState
  //   );
  // }, [fileListState]);

  useEffect(() => {
    if (!!bulkUploadModel.open) {
      startBulkUpload();
      setFileListState && setFileListState([]);
    }
  }, [bulkUploadModel.open]);

  const uploadProps: UploadProps = {
    multiple: true, // Set to true to allow multiple file uploads
    beforeUpload: () => false,
    onChange({ file, fileList }) {
      if (
        file.status !== "uploading" &&
        file.status !== "removed" &&
        file.status !== "error"
      ) {
        // console.log("checkdocnew fileList in uploadprops", fileList);

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
  // console.log("formData?.documentType", formData?.document_type);
  const handleDocTypeChange = (value: any) => {
    setFormData({
      ...formData,
      ["document_type"]: value,
      // systems: [],
    });
    // setSystemsChecked(true);
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
  const handleDocStatusSelect = (e: any) => {
    setSelectedDocState(e.target.checked);
  };
  const handleWorkflowSelect = (e: any) => {
    setSelectWorkflow(e.target.checked);
  };

  useEffect(() => {
    if (docTypeChecked) {
      axios
        .get(`/api/doctype/getUserAccessibleDoctypes/${userDetails?.entityId}`)
        .then((res) => {
          // Handle the response here
          setDocTypeOptions(res.data?.data);
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
        docType: formData?.document_type,
        documentState: formData?.documentState,
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
        let bulkUploadDocRes;
        if (activeModules?.includes("AI_FEATURES")) {
          bulkUploadDocRes = await axios.post(
            `${process.env.REACT_APP_PY_URL}/pyapi/bulkUpload`,
            finalFormData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
        } else {
          bulkUploadDocRes = await axios.post(
            `${process.env.REACT_APP_PY_URL}/pyapi/percipereBulkUpload`,
            finalFormData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
        }

        showLoader(
          "Job has been initiated, Document(s) will be available in My Documents . Check Document Settings for Job Status"
        );
        setTimeout(() => {
          hideLoader();
        }, 6000);

        // if (
        //   bulkUploadDocRes.data?.uploaded?.length > 0 ||
        //   bulkUploadDocRes.data?.failed?.length > 0
        // ) {
        //   const uploaded = bulkUploadDocRes.data?.uploaded || [];
        //   const failed = bulkUploadDocRes?.data?.failed || [];

        //   // Create detailed summary message
        //   let summaryMessage = "Bulk Upload Results:\n\n";

        //   if (uploaded.length > 0) {
        //     // Group uploaded documents by status
        //     const statusGroups = uploaded.reduce((acc: any, doc: any) => {
        //       const status = doc.document_state || "UNKNOWN";
        //       if (!acc[status]) acc[status] = [];
        //       acc[status].push(doc);
        //       return acc;
        //     }, {});

        //     summaryMessage += "✅ Successfully Processed:\n";
        //     Object.keys(statusGroups).forEach((status) => {
        //       const count = statusGroups[status].length;
        //       summaryMessage += `   • ${count} document(s) in ${status} state\n`;

        //       // Add details for DRAFT documents
        //       if (status === "DRAFT") {
        //         const draftsWithReasons = statusGroups[status].filter(
        //           (doc: any) => doc.reason
        //         );
        //         if (draftsWithReasons.length > 0) {
        //           summaryMessage += `     (${draftsWithReasons.length} with validation notes)\n`;
        //         }
        //       }
        //     });
        //     summaryMessage += "\n";
        //   }

        //   if (failed.length > 0) {
        //     summaryMessage += `❌ Failed to Process: ${failed.length} document(s)\n\n`;
        //   }

        //   summaryMessage += "Would you like to download detailed reports?";

        //   // Show confirmation dialog
        //   const userWantsReports = window.confirm(summaryMessage);

        //   if (userWantsReports) {
        //     // Generate combined report
        //     const combinedReport = generateCombinedReport(uploaded, failed);
        //     downloadReport(combinedReport, "bulk_upload_complete_report.txt");

        //     // Show success message
        //     enqueueSnackbar("Complete report downloaded successfully!", {
        //       variant: "success",
        //     });
        //   } else {
        //     // Just show basic success message
        //     if (uploaded.length > 0) {
        //       enqueueSnackbar(
        //         `${uploaded.length} document(s) processed successfully.`,
        //         { variant: "success" }
        //       );
        //     }
        //     if (failed.length > 0) {
        //       enqueueSnackbar(
        //         `${failed.length} document(s) failed to upload.`,
        //         { variant: "error" }
        //       );
        //     }
        //   }
        // }
      } catch (error) {
        // console.error("Error uploading files:", error);
        enqueueSnackbar("Error during bulk upload. Please try again.", {
          variant: "error",
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Helper function to generate combined report
  const generateCombinedReport = (uploaded: any[], failed: any[]) => {
    let report = "BULK UPLOAD COMPLETE REPORT\n";
    report += "=".repeat(50) + "\n\n";
    report += `Generated on: ${new Date().toLocaleString()}\n`;
    report += `Total Files Processed: ${uploaded.length + failed.length}\n`;
    report += `Successfully Processed: ${uploaded.length}\n`;
    report += `Failed: ${failed.length}\n\n`;

    // SUCCESS SECTION
    if (uploaded.length > 0) {
      report += "✅ SUCCESS SECTION\n";
      report += "=".repeat(50) + "\n\n";

      // Group by status
      const statusGroups = uploaded.reduce((acc: any, doc: any) => {
        const status = doc.document_state || "UNKNOWN";
        if (!acc[status]) acc[status] = [];
        acc[status].push(doc);
        return acc;
      }, {});

      Object.keys(statusGroups).forEach((status) => {
        report += `\n${status} DOCUMENTS (${statusGroups[status].length}):\n`;
        report += "-".repeat(30) + "\n";

        statusGroups[status].forEach((doc: any, index: number) => {
          report += `${index + 1}. File: ${doc.file}\n`;
          report += `   Status: ${doc.document_state || "Unknown"}\n`;
          if (doc.reason) {
            report += `   Note: ${doc.reason}\n`;
          }
          report += "\n";
        });
      });
    }

    // FAILURE SECTION
    if (failed.length > 0) {
      report += "\n" + "❌ FAILURE SECTION\n";
      report += "=".repeat(50) + "\n\n";

      failed.forEach((item: any, index: number) => {
        report += `${index + 1}. File: ${item.file}\n`;
        report += `   Error: ${item.reason || "Unknown error"}\n`;
        report += "-".repeat(40) + "\n";
      });
    }

    report += "\n" + "=".repeat(50) + "\n";
    report += "END OF REPORT\n";

    return report;
  };

  // Helper function to download report
  const downloadReport = (content: string, filename: string) => {
    // Generate timestamp in format: YYYY-MM-DD_HH-MM-SS
    const now = new Date();
    const timestamp = now
      .toISOString()
      .replace(/:/g, "-") // Replace colons with hyphens
      .replace(/\..+/, "") // Remove milliseconds
      .replace("T", "_"); // Replace T with underscore

    // Extract filename without extension and extension
    const lastDotIndex = filename.lastIndexOf(".");
    const nameWithoutExt = filename.substring(0, lastDotIndex);
    const extension = filename.substring(lastDotIndex);

    // Create timestamped filename
    const timestampedFilename = `${nameWithoutExt}_${timestamp}${extension}`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = timestampedFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // const bulkUpload = async () => {
  //   const location = locationOptions.find(
  //     (item: any) => item.id === selectedLocation
  //   );
  //   const department = departmentOptions.find(
  //     (item: any) => item.id === selectedDepartment
  //   );
  //   let finalFormData: any;
  //   if (docTypeChecked) {
  //     finalFormData = toFormData({
  //       ...formData,
  //       documentNumbering: docNumberChecked,
  //       location: location.locationName,
  //       department: department.entityName,
  //       realmName: realmName,
  //       entityId: userDetails?.entity?.id,
  //       locationId: userDetails?.location?.id,
  //       organizationId: userDetails?.organizationId,
  //       createdBy: userDetails?.id,
  //     });
  //     // finalFormData.append(
  //     //   "docTypeOptions",
  //     //   JSON.stringify(
  //     //     docTypeOptions.map((item: any) => ({
  //     //       documentTypeName: item?.documentTypeName,
  //     //       applicable_systems: item?.applicable_systems,
  //     //     }))
  //     //   )
  //     // );
  //   } else {
  //     finalFormData = toFormData({
  //       ...formData,
  //       documentNumbering: docNumberChecked,
  //       location: location.locationName,
  //       department: department.entityName,
  //       realmName: realmName,
  //       organizationId: userDetails?.organizationId,
  //       entityId: userDetails?.entity?.id,
  //       locationId: userDetails?.location?.id,
  //       createdBy: userDetails?.id,
  //     });
  //   }
  //   if (fileListState.length > 0) {
  //     fileListState.forEach((file: any) => {
  //       finalFormData.append("files", file.originFileObj);
  //     });
  //     try {
  //       enqueueSnackbar("Bulk Upload In Progress", {
  //         variant: "info",
  //       });
  //       // showLoader("Processing Documents...");
  //       const bulkUploadDocRes: any = await axios.post(
  //         `${process.env.REACT_APP_PY_URL}/pyapi/percipereBulkUpload`,
  //         finalFormData,
  //         {
  //           headers: {
  //             "Content-Type": "multipart/form-data",
  //           },
  //         }
  //       );
  //       // console.log("bulkUploadres", bulkUploadDocRes);
  //       showLoader(
  //         "Job has been initiated, Document(s) will be available in My Documents . Check Document Settings for Job Status"
  //       );
  //       setTimeout(() => {
  //         hideLoader();
  //       }, 1000);
  //       if (
  //         bulkUploadDocRes.data?.uploaded?.length > 0 ||
  //         bulkUploadDocRes.data?.failed?.length > 0
  //       ) {
  //         const uploaded = bulkUploadDocRes.data?.uploaded || [];
  //         const failed = bulkUploadDocRes?.data?.failed || [];

  //         if (uploaded.length > 0) {
  //           enqueueSnackbar(
  //             `${uploaded.length} document(s) uploaded successfully.`,
  //             { variant: "success" }
  //           );
  //         }

  //         if (failed.length > 0) {
  //           enqueueSnackbar(
  //             `${failed.length} document(s) failed to upload. Downloading error report...`,
  //             { variant: "error" }
  //           );

  //           // Generate and download the failure report
  //           const failedText = failed
  //             .map(
  //               (item: any) => `File: ${item.file}\nError: ${item?.reason}\n`
  //             )
  //             .join("\n---\n");

  //           const blob = new Blob([failedText], { type: "text/plain" });
  //           const url = URL.createObjectURL(blob);

  //           const a = document.createElement("a");
  //           a.href = url;
  //           a.download = "bulk_upload_failed_report.txt";
  //           document.body.appendChild(a);
  //           a.click();
  //           document.body.removeChild(a);
  //           URL.revokeObjectURL(url);
  //         }
  //       }

  //       // console.log("Files uploaded successfully");
  //     } catch (error) {
  //       console.error("Error uploading files:", error);
  //     } finally {
  //       setIsUploading(false);
  //     }
  //   }
  // };

  const handleSignIn = () => {
    return new Promise((resolve, reject) => {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (response: any) => {
          // console.log("Callback Response:", response); // Log the response
          if (response.error) {
            message.error("Failed to get access token");
            reject(response.error);
          } else {
            setAccessToken(response.access_token);
            // console.log("Access Token:", response.access_token); // Log the access token
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
      // console.log(
      //   "checkdocnew file object in data converteer onedrive picker",
      //   fileObject
      // );

      const fileData = {
        uid: file.id,
        name: file.name,
        status: "done",
        url: URL.createObjectURL(blob),
        originFileObj: fileObject,
      };
      // console.log(
      //   "checkdocnew fileData in data converteer onedrive picker",
      //   fileData
      // );

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
                  // console.log(
                  //   "checkdocnew dataPromises in onedrive picker",
                  //   dataPromises
                  // );

                  const uploadedFiles = await Promise.all(dataPromises);
                  // console.log(
                  //   "checkdocnew uploadedFiles in onedrive picker",
                  //   uploadedFiles
                  // );

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
              // console.log("File picking canceled");
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
        // console.log("checkdocnew openPicker callbackfunction DATA---<", data);

        if (data.action === "picked" && data.docs.length > 0) {
          const dataPromises = data.docs.map((selectedFile: any) =>
            setDataFromGoogle(selectedFile, accessToken)
          );
          const uploadedFiles = await Promise.all(dataPromises);
          //outlook.prodlelabs.com/processdocuments/processdocument
          // console.log(
          //   "checkdocnew openPicker callbackfunction uploadedFiles---<",
          //   uploadedFiles
          // );

          setFileListState((prevData: any) => [...prevData, ...uploadedFiles]);
        }
      },
    });
  };
  const handleBulkUploadConfirm = () => {
    if (isUploading) return;

    bulkUpload();
    setBulkUploadConfirmModel({ open: false });
    setBulkUploadModel({ open: false });
  };

  return (
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
            setBulkUploadModel({ open: false });
          }}
        >
          <div style={{ display: "grid", gap: "5px", padding: "20px" }}>
            {/* Department and Unit Section */}
            <div style={{ display: "flex", gap: "40px", marginBottom: "5px" }}>
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
            </div>
            <h3>Select for AI Suggestion</h3>
            {/* Document Options Section */}
            <div style={{ display: "flex", gap: "40px", marginBottom: "20px" }}>
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
  );
};

export default BulkUploadDocumentModal;
