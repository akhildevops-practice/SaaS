import { useEffect, useRef, useState } from "react";
import {
  Select,
  Button as AntButton,
  Input,
  Table,
  Button,
  Modal,
  DatePicker,
  Radio,
  Form,
  Descriptions,
  Space,
  Drawer,
  Tooltip,
  Divider,
  InputNumber,
  Upload,
  Tabs,
} from "antd";
import axios from "apis/axios.global";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import useStyles from "./style";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  IconButton,
} from "@material-ui/core";
import {
  MdChangeCircle,
  MdExpandMore,
  MdOutlineDriveFolderUpload,
} from "react-icons/md";
import DataTypeforTableCells from "../DataTypeforTableCells";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import { useSnackbar } from "notistack";
import getSessionStorage from "utils/getSessionStorage";
import AuditTrailDrawer from "components/AuditTrailDrawer";
import SignatureComponent from "components/ReusableComponents/SignatureComponent";
import React from "react";
import TextArea from "antd/es/input/TextArea";
import { LuSignature } from "react-icons/lu";
import { FcSignature } from "react-icons/fc";
import CustomMultiSelect from "components/ReusableComponents/CustomMultiSelect";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import TabPane from "antd/es/tabs/TabPane";
import { FaRegFilePdf } from "react-icons/fa";
import printJS from "print-js";
const { Option } = Select;

const RunTime = () => {
  const classes = useStyles();
  const { urlId } = useParams<{ urlId: any }>();
  const navigate = useNavigate();
  const location: any = useLocation();
  const [form] = Form.useForm();
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState<any>();
  const userInfo = JSON.parse(sessionStorage.getItem("userDetails") as string);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState();
  const [templateList, setTemplateList] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempColumn, setTempColumn] = useState<any>(null);
  const [signModalOpen, setSignModalOpen] = useState<Boolean>(false);
  const [clickedCell, setClickedCell] = useState({
    rowIndex: null,
    value: "",
    index: null,
  });
  const [selectedCellDatatypes, setSelectedCellDatatypes] =
    useState<any>(clickedCell);
  const [expanded, setExpanded] = useState(true);
  const [inputCount, setInputCount] = useState<any>(4);
  const [mode, setMode] = useState<any>(true);
  const userDetails = getSessionStorage();
  const [nextStage, setNextStage] = useState(false);
  const [auditTrailData, setAuditTrailData] = useState<any>();
  const [auditTrailDrawer, setAuditTrailDrawer] = useState<any>({
    open: false,
    data: {},
  });
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [updateWorkflow, setUpdateWorkflow] = useState<any>([]);
  const [signatureHandler, setSignatureHandler] = useState<() => void>(
    () => () => {}
  );
  const formDataRef = useRef(formData);
  const digiSignCommentRef = useRef("");
  const [digiSignComment, setDigiSignComment] = useState<any>("");
  const [mergeEnabled, setMergeEnabled] = useState(true);
  const pdfRefFormHeader = useRef<HTMLDivElement>(null);
  const pdfRefFormContent = useRef<HTMLDivElement>(null);
  const pdfRefTableContents = useRef<Array<HTMLDivElement | null>>([]);
  const [logo, setLogo] = useState<any>(null);
  const [hideDisplaysForPDF, setHideDisplayForPDF] = useState(false);
  const [pdfExportOrientation, setPdfExportOrientation] =
    useState<any>("portrait");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewFile, setPreviewFile] = useState<{
    url: string;
    name: string;
  } | null>(null);

  const [pdfExportModal, setPdfExportModal] = useState(false);

  const reportHtmlFormatG = `
  <div>
    <style>
      * {
          font-family: "poppinsregular", sans-serif !important;
        }
  </style>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
    <tr>
      <td style="width : 100px; border: 1px solid black; padding: 8px; text-align: left;">
        ${
          logo
            ? `<img src="${logo}" alt="Hindalco Logo" width="100px" height="100px" />`
            : ""
        }
      </td>
      <td colspan="3" style="text-align : center; margin : auto; font-size : 22px; font-weight : 600; letter-spacing : 0.6px; border: 1px solid black; padding: 8px;">
        ${title}
      </td>
    </tr>
  </table>`;
  //----------consoles----------------

  console.log("formData", formData);
  // console.log("inputs", inputs);
  // console.log("newDataSource", newDataSource);
  // console.log("selectedId", selectedId);
  // console.log("clickedCell", clickedCell);
  // console.log("isModalOpen", isModalOpen);
  // console.log("templateList", templateList);
  // console.log("urlId", urlId);
  // console.log("mode", mode)

  //---------useeffects-------------------

  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  useEffect(() => {
    setMode(location?.state?.mode);
  }, [location?.state?.mode]);

  useEffect(() => {
    getTemplates();
    getLogo();
  }, []);

  useEffect(() => {
    if (nextStage === true) {
      submitData();
    }
  }, [nextStage]);

  useEffect(() => {
    if (formData && updateWorkflow.length > 0) {
      setNextStage(true);
    }
  }, [updateWorkflow]);

  useEffect(() => {
    if (auditTrailData) {
      setAuditTrailDrawer({
        ...auditTrailDrawer,
        open: !auditTrailDrawer.open,
      });
    }
  }, [auditTrailData]);

  useEffect(() => {
    if (selectedCellDatatypes) {
      const updatedFormData = {
        ...formData,
        tableFieldsContents: formData?.tableFieldsContents?.map(
          (table: any) => {
            if (table.tableId === selectedCellDatatypes.tableId) {
              return {
                ...table,
                tableContent: table?.tableContent?.map(
                  (row: any, rowIdx: any) => {
                    if (rowIdx === selectedCellDatatypes.rowIndex) {
                      return {
                        ...row,
                        cells: row.cells.map((cell: any, cellIdx: any) => {
                          if (cell.id === selectedCellDatatypes.cellId) {
                            return {
                              ...cell,
                              datatype: selectedCellDatatypes.dataType,
                              dataOptions: selectedCellDatatypes.dataOptions,
                              toleranceType:
                                selectedCellDatatypes.toleranceType,
                              toleranceValue:
                                selectedCellDatatypes.toleranceValue,
                            };
                          }
                          return cell;
                        }),
                      };
                    }
                    return row;
                  }
                ),
              };
            }
            return table;
          }
        ),
      };

      setFormData(updatedFormData);
    }
  }, [selectedCellDatatypes]);

  // Reset the values whenever clickedCell changes
  useEffect(() => {
    setSelectedCellDatatypes(clickedCell);
  }, [clickedCell]);

  //calling table Data from the api
  useEffect(() => {
    getTableData();
  }, [selectedId, urlId]);

  // Update formData when title changes
  useEffect(() => {
    setFormData((prevFormData: any) => ({
      ...prevFormData,
      title,
    }));
  }, [title]);

  useEffect(() => {
    if (hideDisplaysForPDF) {
      handleDownloadPDF();
    }
  }, [hideDisplaysForPDF]);

  //---------------functions--------------------

  const getTemplates = async () => {
    const res = await axios.get(
      "api/auditchecksheet/getAuditChecksheetTemplates"
    );
    setTemplateList(res.data);
  };
  const onclose = () => {
    setSignModalOpen(false);
    setDigiSignComment("");
  };

  //----------to target and store the table cell value -------------
  const handleInputChangeValue = (
    tableId: any,
    cellId: any,
    newValue: any,
    type: any
  ) => {
    setFormData((prevFormData: any) => {
      const updatedFormData = { ...prevFormData };

      // Find the target table using tableId
      const targetTableIndex = updatedFormData.tableFieldsContents.findIndex(
        (table: any) => table.tableId === tableId
      );
      if (targetTableIndex === -1) return prevFormData;

      const targetTable = updatedFormData.tableFieldsContents[targetTableIndex];

      // Update the matching cell based on cellId
      const updatedTableContent = targetTable.tableContent.map((row: any) => {
        const updatedCells = row.cells.map((cell: any) => {
          if (cell.id === cellId) {
            switch (type) {
              case "entityType":
                return { ...cell, entityId: newValue };
              case "range-min":
                return { ...cell, min: newValue };
              case "range-max":
                return { ...cell, max: newValue };
              default:
                return { ...cell, value: newValue };
            }
          }
          return cell;
        });

        return { ...row, cells: updatedCells };
      });

      // Assign the updated content back to the table
      updatedFormData.tableFieldsContents[targetTableIndex] = {
        ...targetTable,
        tableContent: updatedTableContent,
      };

      return updatedFormData;
    });
  };

  const getTableData = async () => {
    try {
      const endpoint = urlId
        ? `api/auditchecksheet/getAuditChecksheetById/${urlId}`
        : `/api/auditchecksheet/getAuditChecksheetTemplateDetails/${selectedId}`;

      const result = await axios.get(endpoint);

      let workflow = null;
      if (result.data.workflowId && result.data.workflowId !== "none") {
        workflow = urlId
          ? result.data.workflowDetails
          : (
              await axios.get(
                `/api/global-workflow/getGlobalWorkflowForTranscation/${result.data.workflowId}`
              )
            )?.data;
      }

      setTitle(result?.data?.title);

      if (urlId) {
        setInputCount(result?.data?.formLayout);
        setFormData({
          ...result.data,
        });
      } else {
        setInputCount(result?.data?.formLayout);
        setFormData((prevFormData: any) => ({
          ...prevFormData,
          tableFieldsContents: result.data.tableFields,
          formHeaderContents: result.data.formHeader,
          workflowDetails: workflow
            ? { ...workflow, workflowHistory: [] }
            : "none", // Only set if fetched
          status: "draft",
        }));
      }
    } catch (error) {
      console.error("Error fetching table data", error);
    }
  };

  //--------final submit of data-----------
  const submitData = async () => {
    const latestFormData = formDataRef.current;
    if (urlId) {
      const filteredFormHeaderContents =
        latestFormData?.formHeaderContents?.map((item: any) => {
          if (item.datatype === "entityType" || item.datatype === "appFields") {
            const { options, ...rest } = item;
            return {
              ...rest,
              valueId: uuidv4(),
            };
          } else {
            return {
              ...item,
              valueId: uuidv4(),
            };
          }
        });
      const filteredTableFieldsContents =
        latestFormData?.tableFieldsContents?.map((table: any) => {
          if (table.tableId) {
            const updatedTableContent = table.tableContent.map((item: any) => {
              const updatedCells = item?.cells?.map((content: any) => {
                if (
                  content.datatype === "entityType" ||
                  content.datatype === "appFields"
                ) {
                  const { options, ...rest } = content;
                  return rest;
                }
                return content;
              });

              return {
                row: item.row,
                cells: updatedCells,
              };
            });

            return {
              ...table,
              tableContent: updatedTableContent,
            };
          } else if (table.sectionId) {
            const updatedSectionContent = table.sectionContent.map(
              (item: any) => {
                if (
                  item.datatype === "entityType" ||
                  item.datatype === "appFields"
                ) {
                  const { options, ...rest } = item;
                  return rest;
                }
                return item;
              }
            );
            return {
              ...table,
              sectionContent: updatedSectionContent,
            };
          }
        });

      const updatedWorkflow =
        latestFormData?.workflowDetails !== "none"
          ? latestFormData?.workflowDetails?.workflow?.map((stage: any) => ({
              ...stage,
              status: stage?.status || "pending", // Add default status if not present
            }))
          : "none";
      const cleanWorkflow =
        updatedWorkflow !== "none"
          ? cleanWorkflowDetails({
              ...latestFormData?.workflowDetails,
              workflow: updatedWorkflow,
            })
          : "none";

      const finalFormData = {
        ...latestFormData,
        formHeaderContents: filteredFormHeaderContents,
        tableFieldsContents: filteredTableFieldsContents,
        workflowDetails: cleanWorkflow,
      };
      const response = await axios.patch(
        `/api/auditchecksheet/updateAuditCheckSheet/${urlId}`,
        finalFormData
      );
      if (response.status === 200 || response.status === 201) {
        enqueueSnackbar(`Updated successfully!`, {
          variant: "success",
        });
        setNextStage(false);
        navigate("/checksheet");
      }
    } else {
      const filteredFormHeaderContents =
        latestFormData?.formHeaderContents?.map((item: any) => {
          if (item.datatype === "entityType" || item.datatype === "appFields") {
            const { options, ...rest } = item;
            return {
              ...rest,
              valueId: uuidv4(),
            };
          } else {
            return {
              ...item,
              valueId: uuidv4(),
            };
          }
        });
      const filteredTableFieldsContents =
        latestFormData?.tableFieldsContents?.map((table: any) => {
          if (table.tableId) {
            const updatedTableContent = table.tableContent.map((item: any) => {
              const updatedCells = item?.cells?.map((content: any) => {
                if (
                  content.datatype === "entityType" ||
                  content.datatype === "appFields"
                ) {
                  const { options, ...rest } = content;
                  return rest;
                }
                return content;
              });

              return {
                row: item.row,
                cells: updatedCells,
              };
            });

            return {
              ...table,
              tableContent: updatedTableContent,
            };
          } else if (table.sectionId) {
            const updatedSectionContent = table.sectionContent.map(
              (item: any) => {
                if (
                  item.datatype === "entityType" ||
                  item.datatype === "appFields"
                ) {
                  const { options, ...rest } = item;
                  return rest;
                }
                return item;
              }
            );
            return {
              ...table,
              sectionContent: updatedSectionContent,
            };
          }
        });

      let updatedWorkflow;
      let cleanWorkflow;
      if (latestFormData.workflowDetails !== null) {
        updatedWorkflow =
          latestFormData.workflowDetails !== "none"
            ? latestFormData.workflowDetails.workflow.map((stage: any) => ({
                ...stage,
                status: stage.status || "pending",
              }))
            : "none";
        cleanWorkflow =
          updatedWorkflow !== "none"
            ? cleanWorkflowDetails({
                ...latestFormData?.workflowDetails,
                workflow: updatedWorkflow,
              })
            : "none";
      }

      const finalFormData = {
        title:
          templateList?.find((item: any) => item._id === selectedId)?.title +
          " - " +
          dayjs().format("DD/MM/YYYY HH:mm:ss"),
        auditChecksheetTemplateId: selectedId,
        formHeaderContents: filteredFormHeaderContents,
        formHeaderTitle: latestFormData.formHeaderTitle,
        tableFieldsContents: filteredTableFieldsContents,
        formLayout: inputCount,
        type: "new",
        ...(latestFormData.workflowDetails !== null
          ? {
              workflowDetails: cleanWorkflow,
            }
          : {}),
        status: latestFormData.status,
        createdBy: userInfo.id,
      };

      const response = await axios.post(
        `/api/auditchecksheet/createAuditChecksheet`,
        finalFormData
      );
      setNextStage(false);
      navigate("/checksheet");
    }
  };

  const handleMarkDone = async (index: any) => {
    const latestFormData = formDataRef.current;
    if (index === "draft" || latestFormData.workflowDetails === "none") {
      let digiSign;
      if (userDetails?.organization?.digitalSignature === true) {
        try {
          digiSign = await axios.post(
            `/api/user/signDocument?userId=${
              userDetails?.id
            }&docId=${urlId}&action=${"Created"}&comment=${
              digiSignCommentRef.current
            }`
          );
          digiSign = digiSign.data;
        } catch (error) {}
      }
      setFormData({
        ...latestFormData,
        status:
          latestFormData.workflowDetails !== "none"
            ? latestFormData.workflowDetails.workflow[0].stage
            : "PUBLISHED",
        workflowDetails:
          latestFormData.workflowDetails !== "none"
            ? {
                ...latestFormData.workflowDetails,
                workflowHistory: [
                  {
                    actionBy: userDetails.id,
                    actionName: "Created",
                    actionDateAndTime: new Date().toISOString(),
                    digiSign,
                  },
                ],
              }
            : "none",
      });
      setUpdateWorkflow("draft");
    } else {
      const updatedWorkflow = [...latestFormData.workflowDetails.workflow];
      const stageAction = updatedWorkflow[index]?.stage;
      let digiSign;
      if (userDetails?.organization?.digitalSignature === true) {
        try {
          digiSign = await axios.post(
            `/api/user/signDocument?userId=${
              userDetails?.id
            }&docId=${urlId}&action=${stageAction + " Complete"}&comment=${
              digiSignCommentRef.current
            }`
          );
          digiSign = digiSign.data;
        } catch (error) {}
      }

      const updatedOwnerSettings = updatedWorkflow[index]?.ownerSettings.map(
        (group: any[]) =>
          group.map((condition: any) => {
            if (
              condition.status === "pending" &&
              Array.isArray(condition.selectedUsers) &&
              (condition.ifUserSelect
                ? condition.actualSelectedUsers.some(
                    (user: any) => user === userDetails.id
                  )
                : condition.type === "User Of" ||
                  condition.type === "Global Role Of"
                ? condition.selectedUsers.some(
                    (user: any) => user === userDetails.id
                  )
                : condition.selectedUsers.some(
                    (user: any) => user.id === userDetails.id
                  ))
            ) {
              return {
                ...condition,
                status: "complete",
                completedBy: [
                  {
                    userId: userDetails.id,
                    completedDate: new Date().toISOString(),
                  },
                ],
              };
            }
            return condition;
          })
      );

      const anyGroupFullyComplete = updatedOwnerSettings.some((group: any[]) =>
        group.every((condition: any) => condition.status === "complete")
      );
      const stageStatus = anyGroupFullyComplete ? "complete" : "pending";
      updatedWorkflow[index] = {
        ...updatedWorkflow[index],
        ownerSettings: updatedOwnerSettings,
        status: stageStatus,
        completedAt: anyGroupFullyComplete ? new Date().toISOString() : "",
      };

      const checksheetStatus = updatedWorkflow.every(
        (item: any) => item.status === "complete"
      )
        ? "PUBLISHED"
        : updatedWorkflow.find((item: any) => item?.status === "pending")
            ?.stage;

      setFormData({
        ...latestFormData,
        status: checksheetStatus,
        workflowDetails: {
          ...latestFormData.workflowDetails,
          workflow: updatedWorkflow,
          workflowHistory: [
            ...latestFormData.workflowDetails.workflowHistory,
            {
              actionBy: userDetails.id,
              actionName:
                latestFormData?.workflowDetails.workflow[index].stage +
                " Complete",
              actionDateAndTime: new Date().toISOString(),
              digiSign,
            },
          ],
        },
      });
      setUpdateWorkflow(updatedWorkflow);
    }
  };

  const firstPendingStageIndex =
    formDataRef?.current?.status === "draft"
      ? "draft"
      : formDataRef?.current?.workflowDetails !== "none"
      ? formDataRef?.current?.workflowDetails?.workflow?.findIndex(
          (stage: any) => stage.status === "pending"
        )
      : "none";

  // Step 2: Check if the user is allowed to act on that stage
  const isUserAllowedInStage = (() => {
    if (
      formDataRef?.current?.status === "draft" ||
      formDataRef?.current?.workflowDetails === "none"
    ) {
      if (urlId) {
        return formDataRef.current?.createdBy === userDetails.id;
      } else {
        return true;
      }
    }
    const stage =
      formDataRef?.current?.workflowDetails?.workflow[firstPendingStageIndex];
    if (!Array.isArray(stage?.ownerSettings)) return false;

    return stage.ownerSettings.some(
      (group: any) =>
        Array.isArray(group) &&
        group.some(
          (condition) =>
            condition.status === "pending" &&
            (condition.ifUserSelect
              ? (condition.actualSelectedUsers || []).some(
                  (user: any) => user === userDetails.id
                )
              : (condition.selectedUsers || []).some(
                  (user: any) => user.id === userDetails.id
                ))
        )
    );
  })();
  const [expandedStages, setExpandedStages] = useState<number[]>([]);

  const toggleStage = (index: number) => {
    setExpandedStages((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleDataTypeModalOpenAndClose = () => {
    setIsModalOpen(false);
    setClickedCell({
      rowIndex: null,
      value: "",
      index: null,
    });
  };

  const handlePDFExportModalSubmit = () => {
    setHideDisplayForPDF(true);
    setPdfExportModal(false);
  };

  const handlePDFExportModalCancel = () => {
    setPdfExportModal(false);
  };

  const handleTemplateChange = (value: any) => {
    setSelectedId(value);
  };

  const handleFormHeaderChange = (e: any, index: any, type: any) => {
    // Create a copy of the inputs array to avoid mutating state directly
    const updatedInputs = [...formData.formHeaderContents];

    // Add the new field 'value' to the specified index
    if (type === "entityType") {
      updatedInputs[index] = {
        ...updatedInputs[index],
        entityId: e,
      };
    } else if (type === "appFields") {
      updatedInputs[index] = {
        ...updatedInputs[index],
        value: e,
      };
    } else if (type === "range-min") {
      updatedInputs[index] = {
        ...updatedInputs[index],
        min: e.target.value,
      };
    } else if (type === "range-max") {
      updatedInputs[index] = {
        ...updatedInputs[index],
        max: e.target.value,
      };
    } else if (type === "dateSelection") {
      updatedInputs[index] = {
        ...updatedInputs[index],
        value: e,
      };
    } else if (type === "multiValue") {
      updatedInputs[index] = {
        ...updatedInputs[index],
        value: e,
      };
    } else if (type === "email") {
      updatedInputs[index] = {
        ...updatedInputs[index],
        value: e.target.value,
      };
    } else {
      updatedInputs[index] = {
        ...updatedInputs[index],
        value: e.target.value,
      };
    }

    setFormData((prevFormData: any) => ({
      ...prevFormData,
      formHeaderContents: updatedInputs,
    }));
  };

  const handleAccordionChange = () => {
    setExpanded(!expanded);
  };

  const toggleAuditTrailDrawer = async (data: any = {}) => {
    const res = await axios.get(
      `api/auditchecksheet/getAuditCheckSheetAuditTrail/${formData._id}`
    );
    setAuditTrailData(res.data);
  };

  const isValidEmail = (value: any) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleWorkflowUserChange = (
    value: any,
    ifUserSelect: boolean,
    stageIndex: number,
    groupIndex: number,
    condIndex: number
  ) => {
    const updatedWorkflow = [...formData.workflowDetails.workflow];

    // Clone the nested structure safely
    const updatedOwnerSettings = updatedWorkflow[stageIndex].ownerSettings.map(
      (group: any[], gIndex: number) => {
        if (gIndex !== groupIndex) return group;

        return group.map((condition: any, cIndex: number) => {
          if (cIndex !== condIndex) return condition;

          return ifUserSelect
            ? { ...condition, actualSelectedUsers: value }
            : {
                ...condition,
                selectedUsers: value,
              };
        });
      }
    );

    updatedWorkflow[stageIndex].ownerSettings = updatedOwnerSettings;

    setFormData({
      ...formData,
      workflowDetails: {
        ...formData.workflowDetails,
        workflow: updatedWorkflow,
      },
    });
  };

  const cleanWorkflowDetails = (workflowDetails: any) => {
    const workflow = workflowDetails?.workflow?.map((stage: any) => {
      // Clean completedBy
      if (Array.isArray(stage.completedBy) && stage.completedBy.length > 0) {
        stage.completedBy = stage.completedBy.map((user: any) => ({
          userId: user.userId,
          completedDate: user.completedDate,
        }));
      }

      // Clean ownerSettings (array of OR-groups with AND conditions)
      const cleanedOwnerSettings = (stage.ownerSettings || []).map(
        (group: any[]) =>
          group.map((condition: any) => {
            const { userList, selectedUsers = [], ...rest } = condition;

            if (
              condition.type === "Named Users" ||
              condition.type === "PIC Of" ||
              condition.type === "Manager Of" ||
              condition.type === "Head Of" ||
              condition.type === "User Of" ||
              condition.type === "Global Role Of"
            ) {
              return {
                ...rest,
                selectedUsers: selectedUsers.map((user: any) =>
                  typeof user === "object" && user !== null ? user.id : user
                ),
              };
            }

            // For "User Of" or other types
            return {
              ...rest,
              selectedUsers: selectedUsers.map((user: any) => user), // remove this map if you want full user objects
            };
          })
      );

      return {
        ...stage,
        ownerSettings: cleanedOwnerSettings,
      };
    });

    return {
      ...workflowDetails,
      workflow,
    };
  };

  const setComment = (val: string) => {
    digiSignCommentRef.current = val;
    setDigiSignComment(val);
  };

  const getLogo = async () => {
    const response = await axios.get(`/api/location/getLogo`);
    setLogo(response.data);
  };

  const stringToDOM = (htmlString: string): HTMLElement => {
    const template = document.createElement("template");
    template.innerHTML = htmlString.trim();
    return template.content.firstChild as HTMLElement;
  };

  const replaceTextareasWithDivs = (container: HTMLElement) => {
    const textareas = container.querySelectorAll("textarea");
    textareas.forEach((textarea) => {
      const div = document.createElement("div");
      div.textContent = textarea.value;

      // Match TextArea display but safe for table cells
      div.style.whiteSpace = "pre-wrap";
      div.style.wordBreak = "break-word";
      div.style.border = "1px solid #d9d9d9";
      div.style.borderRadius = "6px";
      div.style.padding = "6px 11px";
      div.style.minHeight = "32px";
      div.style.fontFamily = "inherit";
      div.style.fontSize = "14px";
      div.style.color = "black";
      div.style.width = "100%";
      div.style.boxSizing = "border-box";
      div.style.display = "block";
      div.style.background = "white"; // optional

      // Ensure no layout breaking
      div.style.overflowWrap = "break-word";
      div.style.maxWidth = "100%";

      textarea.parentNode?.replaceChild(div, textarea);
    });
  };

  // const handleDownloadPDF = () => {
  //   const HEADER_MARGIN_MM = 5;
  //   const FOOTER_MARGIN_MM = 5;

  //   const tempContainer = document.createElement("div");
  //   tempContainer.style.padding = "20px";
  //   tempContainer.style.background = "#fff";
  //   tempContainer.style.boxSizing = "border-box";

  //   const topSpacer = document.createElement("div");
  //   topSpacer.style.height = `${HEADER_MARGIN_MM}mm`;
  //   tempContainer.appendChild(topSpacer);

  //   const formHeaderClone = pdfRefFormHeader.current;
  //   if (formHeaderClone) {
  //     const clone = formHeaderClone.cloneNode(true) as HTMLElement;
  //     clone.style.marginBottom = "20px";
  //     tempContainer.appendChild(clone);
  //   }

  //   const formContentClone = pdfRefFormContent.current;
  //   if (formContentClone) {
  //     const clone = formContentClone.cloneNode(true) as HTMLElement;
  //     clone.style.marginBottom = "20px";
  //     tempContainer.appendChild(clone);
  //   }

  //   pdfRefTableContents.current.forEach((ref) => {
  //     if (ref) {
  //       const clone = ref.cloneNode(true) as HTMLElement;
  //       clone.style.marginBottom = "20px";
  //       tempContainer.appendChild(clone);
  //     }
  //   });

  //   const bottomSpacer = document.createElement("div");
  //   bottomSpacer.style.height = `${FOOTER_MARGIN_MM}mm`;
  //   tempContainer.appendChild(bottomSpacer);

  //   document.body.appendChild(tempContainer);
  //   replaceTextareasWithDivs(tempContainer);

  //   // ✅ Pass HTML string, not DOM node
  //   printJS({
  //     type: "raw-html",
  //     printable: tempContainer.outerHTML,
  //     style: `
  //       body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
  //       textarea, .text-area-like {
  //         white-space: pre-wrap;
  //         word-break: break-word;
  //         border: 1px solid #ccc;
  //         border-radius: 6px;
  //         padding: 6px 11px;
  //       }
  //       table { border-collapse: collapse; width: 100%; }
  //       td, th { border: 1px solid #ccc; padding: 8px; text-align: left; }
  //     `,
  //     documentTitle: formData.title ?? "report",
  //   });

  //   document.body.removeChild(tempContainer); // Cleanup
  //   setHideDisplayForPDF(false)
  // };

  const handleDownloadPDF = async () => {
    const HEADER_MARGIN_MM = 5;
    const FOOTER_MARGIN_MM = 5;

    // Create a temporary container
    const tempContainer = document.createElement("div");
    tempContainer.style.padding = "20px";
    tempContainer.style.background = "#fff";
    tempContainer.style.boxSizing = "border-box";

    // Optional: Add empty top space so content renders away from header
    const topSpacer = document.createElement("div");
    topSpacer.style.height = `${HEADER_MARGIN_MM}mm`;
    tempContainer.appendChild(topSpacer);

    // Clone all relevant content
    const formHeaderClone = pdfRefFormHeader.current;
    if (formHeaderClone) {
      const clone = formHeaderClone.cloneNode(true) as HTMLElement;
      clone.style.marginBottom = "20px";
      tempContainer.appendChild(clone);
    }

    const formContentClone = pdfRefFormContent.current;
    if (formContentClone) {
      const clone = formContentClone.cloneNode(true) as HTMLElement;
      clone.style.marginBottom = "20px";
      tempContainer.appendChild(clone);
    }

    pdfRefTableContents.current.forEach((ref) => {
      if (ref) {
        const clone = ref.cloneNode(true) as HTMLElement;
        clone.style.marginBottom = "20px";
        tempContainer.appendChild(clone);
      }
    });

    // Add empty bottom spacer
    const bottomSpacer = document.createElement("div");
    bottomSpacer.style.height = `${FOOTER_MARGIN_MM}mm`;
    tempContainer.appendChild(bottomSpacer);

    document.body.appendChild(tempContainer); // Add temporarily to DOM
    replaceTextareasWithDivs(tempContainer); // Replace textarea for full text rendering
    const uploadedImages = tempContainer.querySelectorAll(
      ".pdf-uploaded-image"
    );
    uploadedImages.forEach((img) => {
      (img as HTMLElement).style.width = "100%";
      (img as HTMLElement).style.height = "200px";
    });

    const canvas = await html2canvas(tempContainer, {
      scale: 1,
      useCORS: true,
      scrollY: -window.scrollY,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
      compress: true, // 👈 compress PDF
    });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const canvasPageHeight =
      (pdfHeight - HEADER_MARGIN_MM - FOOTER_MARGIN_MM) *
      (canvas.width / pdfWidth);

    let position = 0;
    let pageNum = 1;
    const totalPages = Math.ceil(canvas.height / canvasPageHeight);

    while (position < canvas.height) {
      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = Math.min(canvasPageHeight, canvas.height - position);

      const ctx = pageCanvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(
          canvas,
          0,
          position,
          canvas.width,
          pageCanvas.height,
          0,
          0,
          canvas.width,
          pageCanvas.height
        );
      }

      const pageImgData = pageCanvas.toDataURL("image/jpeg", 0.6);

      if (pageNum > 1) pdf.addPage();

      // Render image starting at HEADER_MARGIN
      pdf.addImage(
        pageImgData,
        "JPEG",
        0,
        HEADER_MARGIN_MM,
        pdfWidth,
        (pageCanvas.height * pdfWidth) / canvas.width,
        undefined,
        "FAST"
      );

      // Add footer with page number
      pdf.setFontSize(5);
      pdf.text(`${pageNum} / ${totalPages}`, pdfWidth / 2, pdfHeight - 1.5, {
        align: "right",
      });

      position += canvasPageHeight;
      pageNum++;
    }

    pdf.save(formData.title ? formData.title + ".pdf" : "report.pdf");

    document.body.removeChild(tempContainer);
    setHideDisplayForPDF(false);
  };

  return (
    <div style={{ marginBottom: "50px" }}>
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          // padding: "20px",
          padding: "0px 20px",
          marginTop: "20px",
        }}
      >
        <div>
          {urlId ? (
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <label
                style={{
                  fontSize: "18px",
                  color: "#003059",
                  fontWeight: "bold",
                }}
              >
                Form Title :{" "}
              </label>
              <p
                style={{
                  fontSize: "18px",

                  fontWeight: "bold",
                }}
              >
                {title}
              </p>
            </div>
          ) : (
            <div>
              <label
                style={{
                  fontSize: "18px",
                  color: "#003059",
                  fontWeight: "bold",
                }}
              >
                Forms Templates :{" "}
              </label>
              <Select style={{ width: 220 }} onChange={handleTemplateChange}>
                {templateList?.map((option: any) => (
                  <Option value={option._id} label={option.title}>
                    {option.title}
                  </Option>
                ))}
              </Select>
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "end",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <Tooltip title={"Export to PDF"}>
            <IconButton
              onClick={() => setPdfExportModal(true)}
              style={{ padding: "10px", color: "red" }}
            >
              <FaRegFilePdf width={20} height={20} />
            </IconButton>
          </Tooltip>

          {formData?.workflowDetails === null ||
          formData?.workflowDetails === undefined ? null : (
            <Tooltip title="Workflow">
              <MdChangeCircle
                onClick={() => setDrawerVisible(true)}
                style={{ fontSize: "30px", cursor: "pointer" }}
              />
            </Tooltip>
          )}

          <Button
            onClick={toggleAuditTrailDrawer}
            style={{
              backgroundColor: "#003059",
              color: "white",
            }}
          >
            Audit Trail
          </Button>

          <div>
            {!!auditTrailDrawer.open && (
              <AuditTrailDrawer
                auditTrailDrawer={auditTrailDrawer}
                setAuditTrailDrawer={setAuditTrailDrawer}
                toggleAuditTrailDrawer={toggleAuditTrailDrawer}
                auditTrailData={!!auditTrailData && auditTrailData}
              />
            )}
          </div>

          {isUserAllowedInStage && (
            <AntButton
              type="primary"
              onClick={() => submitData()}
              style={{
                backgroundColor: "#003059",
                color: "white",
              }}
            >
              Save
            </AntButton>
          )}

          {formData?.workflowDetails &&
            firstPendingStageIndex !== -1 &&
            firstPendingStageIndex !== undefined &&
            isUserAllowedInStage &&
            formData.status !== "PUBLISHED" &&
            (formData.status === "draft" ? (
              <div>
                <Button
                  style={{
                    backgroundColor: "#003059",
                    color: "white",
                  }}
                  onClick={() => {
                    if (userDetails?.organization?.digitalSignature === true) {
                      setSignatureHandler(() => () => handleMarkDone("draft"));
                      setSignModalOpen(true);
                    } else {
                      handleMarkDone("draft");
                    }
                  }}
                >
                  {formData.workflowDetails === "none"
                    ? "PUBLISH"
                    : "Send to " + formData.workflowDetails.workflow[0].stage}
                </Button>
              </div>
            ) : (
              <div>
                <Button
                  style={{
                    backgroundColor: "#003059",
                    color: "white",
                  }}
                  onClick={() => {
                    if (userDetails?.organization?.digitalSignature === true) {
                      setSignatureHandler(
                        () => () => handleMarkDone(firstPendingStageIndex)
                      );
                      setSignModalOpen(true);
                    } else {
                      handleMarkDone(firstPendingStageIndex);
                    }
                  }}
                >
                  {firstPendingStageIndex <
                    formData.workflowDetails.workflow.length - 1 && (
                    <>
                      Send to{" "}
                      {
                        formData.workflowDetails.workflow[
                          firstPendingStageIndex + 1
                        ].stage
                      }
                    </>
                  )}
                  {firstPendingStageIndex ===
                    formData.workflowDetails.workflow.length - 1 && (
                    <>
                      Complete{" "}
                      {
                        formData.workflowDetails.workflow[
                          firstPendingStageIndex
                        ].stage
                      }
                    </>
                  )}
                </Button>
              </div>
            ))}

          <Button
            onClick={() => {
              navigate("/checksheet");
            }}
            style={{
              backgroundColor: "#003059",
              color: "white",
            }}
          >
            Back
          </Button>
        </div>
      </div>

      {/* <Accordion style={{ marginTop: "20px" }} className={classes.headingRoot}>
        <AccordionSummary
          expandIcon={<MdExpandMore />}
          aria-controls="panel1a-content"
          id="panel1a-header"
          className={classes.summaryRoot}
        >
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Typography className={classes.heading}>Workflow</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails className={classes.headingRoot}>
        </AccordionDetails>
      </Accordion> */}

      {/* <Accordion
        style={{ marginTop: "20px" }}
        className={classes.headingRoot}
        expanded={expanded}
        onChange={handleAccordionChange}
      >
        <AccordionSummary
          expandIcon={<MdExpandMore />}
          aria-controls="panel1a-content"
          id="panel1a-header"
          className={classes.summaryRoot}
        >
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
            ref={pdfRefFormHeader}
          >
            <Typography className={classes.heading}>
              {formData?.formHeaderTitle}
            </Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails className={classes.headingRoot}>
          <div style={{ padding: "20px" }}>
           
            <div>
              <div className={classes.descriptionLabelStyle}>
                <Form layout="vertical" form={form}>
                  <Descriptions
                    bordered
                    size="small"
                    column={{
                      xxl: inputCount,
                      xl: inputCount,
                      lg: inputCount,
                      md: 1,
                      sm: inputCount,
                      xs: inputCount,
                    }}
                  >
                    {formData &&
                      formData.formHeaderContents &&
                      formData.formHeaderContents?.map(
                        (input: any, index: any) => (
                         

                          <Descriptions.Item
                            label={
                              <>
                                <strong style={{ color: "red" }}>*</strong>{" "}
                                {input.attributeName}:{" "}
                              </>
                            }
                          >
                            <Form.Item
                              rules={[
                                {
                                  required: true,
                                  message: "Please select a project type",
                                },
                              ]}
                              style={{ marginBottom: 0 }}
                            >
                              {(() => {
                                if (input.datatype === "entityType") {
                                  return (
                                    <Select
                                      style={{
                                        width: "100%",
                                        color: "black",
                                      }}
                                      value={input.entityId}
                                      onChange={(e) =>
                                        handleFormHeaderChange(
                                          e,
                                          index,
                                          "entityType"
                                        )
                                      }
                                      disabled={mode}
                                    >
                                      {input?.options?.map((option: any) => (
                                        <Option
                                          key={option.id}
                                          value={option.id}
                                        >
                                          {option.name}
                                        </Option>
                                      ))}
                                    </Select>
                                  );
                                } else if (input.datatype === "appFields") {
                                  return (
                                    <Select
                                      style={{
                                        width: "100%",
                                        color: "black",
                                      }}
                                      value={input.value}
                                      disabled={mode}
                                      onChange={(e) =>
                                        handleFormHeaderChange(
                                          e,
                                          index,
                                          "appFields"
                                        )
                                      }
                                    >
                                      {input?.options?.map((field: any) => (
                                        <Option key={field} value={field}>
                                          {field}
                                        </Option>
                                      ))}
                                    </Select>
                                  );
                                } else if (input.datatype === "text") {
                                  return (
                                    <Input
                                      style={{
                                        width: "100%",
                                        color: "black",
                                      }}
                                      placeholder="Enter text"
                                      value={input.value}
                                      disabled={mode}
                                      onChange={(e) =>
                                        handleFormHeaderChange(e, index, "text")
                                      }
                                    />
                                  );
                                } else if (input.datatype === "number") {
                                  return (
                                    <Input
                                      type="number"
                                      style={{
                                        width: "100%",
                                        color: "black",
                                      }}
                                      placeholder="Enter number"
                                      value={input.value}
                                      disabled={mode}
                                      onChange={(e) =>
                                        handleFormHeaderChange(
                                          e,
                                          index,
                                          "number"
                                        )
                                      }
                                    />
                                  );
                                } else if (input.datatype === "range") {
                                  return (
                                    <div
                                      style={{ display: "flex", gap: "10px" }}
                                    >
                                      <Input
                                        type="number"
                                        style={{ width: 90 }}
                                        placeholder="Min"
                                        value={input.min || ""}
                                        disabled={mode}
                                        onChange={(e) =>
                                          handleFormHeaderChange(
                                            e,
                                            index,
                                            "range-min"
                                          )
                                        }
                                      />
                                      <span>-</span>
                                      <Input
                                        type="number"
                                        style={{ width: 90 }}
                                        placeholder="Max"
                                        value={input.max || ""}
                                        disabled={mode}
                                        onChange={(e) =>
                                          handleFormHeaderChange(
                                            e,
                                            index,
                                            "range-max"
                                          )
                                        }
                                      />
                                    </div>
                                  );
                                } else if (input.datatype === "currentDate") {
                                  return (
                                    <Input
                                      value={input.value}
                                      style={{
                                        width: "100%",
                                        color: "black",
                                      }}
                                      placeholder="Enter text"
                                      disabled={true}
                                    />
                                  );
                                } else if (input.datatype === "dateSelection") {
                                  return (
                                    <DatePicker
                                      style={{
                                        width: "100%",
                                        color: "black",
                                      }}
                                      value={
                                        input.value
                                          ? dayjs(input.value, "DD/MM/YYYY")
                                          : null
                                      }
                                      onChange={(date, dateString) =>
                                        handleFormHeaderChange(
                                          dateString,
                                          index,
                                          "dateSelection"
                                        )
                                      }
                                      disabled={mode}
                                      format={"DD/MM/YYYY"}
                                    />
                                  );
                                } else if (input.datatype === "multiValue") {
                                  return (
                                    <Select
                                      style={{
                                        width: "100%",
                                        color: "black",
                                      }}
                                      value={input.value}
                                      disabled={mode}
                                      onChange={(e) =>
                                        handleFormHeaderChange(
                                          e,
                                          index,
                                          "multiValue"
                                        )
                                      }
                                    >
                                      {input?.dataOptions?.map((field: any) => (
                                        <Option key={field} value={field}>
                                          {field}
                                        </Option>
                                      ))}
                                    </Select>
                                  );
                                } else if (input.datatype === "yesNo") {
                                  return (
                                    <Radio.Group
                                      style={{ width: 200, color: "black" }}
                                      value={input.value}
                                      buttonStyle="solid"
                                      disabled={mode}
                                      onChange={(e) =>
                                        handleFormHeaderChange(
                                          e,
                                          index,
                                          "yesNo"
                                        )
                                      }
                                    >
                                      <Radio.Button type="primary" value="yes">
                                        Yes
                                      </Radio.Button>
                                      <Radio.Button value="no">No</Radio.Button>
                                    </Radio.Group>
                                  );
                                } else if (input.datatype === "@user") {
                                  return (
                                    <Input
                                      value={input.value}
                                      style={{
                                        width: "100%",
                                        color: "black",
                                      }}
                                      placeholder="Enter text"
                                      disabled={true}
                                    />
                                  );
                                } else if (input.datatype === "email") {
                                  const emailValid = isValidEmail(input.value);
                                  return (
                                    <Input
                                      type="email"
                                      style={{
                                        width: "100%",
                                        color: "black",
                                        border: emailValid
                                          ? "2px solid green"
                                          : "2px solid red",
                                        backgroundColor: emailValid
                                          ? "rgba(0, 0, 0, 0.04)"
                                          : "rgba(255, 0, 0, 0.1)",
                                      }}
                                      placeholder="Enter email"
                                      value={input.value}
                                      disabled={mode}
                                      onChange={(e) =>
                                        handleFormHeaderChange(
                                          e,
                                          index,
                                          "email"
                                        )
                                      }
                                    />
                                  );
                                } else {
                                  return (
                                    <Input
                                      style={{
                                        width: "100%",
                                        color: "black",
                                      }}
                                      placeholder="Enter text"
                                      value={input.value}
                                      disabled={mode}
                                      onChange={(e) =>
                                        handleFormHeaderChange(e, index, "text")
                                      }
                                    />
                                  );
                                }
                              })()}
                            </Form.Item>
                          </Descriptions.Item>

                         
                        )
                      )}
                  </Descriptions>
                </Form>
              </div>
            </div>
          </div>
        </AccordionDetails>
      </Accordion> */}

      {formData?.tableFieldsContents?.map((tableObj: any, index: number) => {
        if (tableObj.tableId) {
          const { tableId, ...rest } = tableObj;
          const tableKey = Object.keys(rest).find((key) =>
            key.startsWith("tableHeader")
          );
          const tableHeader = rest[tableKey!];

          const allowedStages = tableObj.workflowStages;
          let isEditable = false;

          if (
            formData?.workflowDetails !== null &&
            formData?.workflowDetails &&
            formData?.workflowDetails !== "none"
          ) {
            if (allowedStages === undefined) {
              // ✅ New condition for undefined allowedStages
              if (formData?.createdBy === userInfo.id || !urlId) {
                isEditable = true;
              }
            } else if (
              Array.isArray(allowedStages) &&
              formData?.workflowDetails?.workflow &&
              formData?.status
            ) {
              const currentStatus = formData.status.trim().toLowerCase();
              const normalizedAllowedStages = allowedStages.map((s: string) =>
                s.trim().toLowerCase()
              );

              if (normalizedAllowedStages.includes(currentStatus)) {
                const stageObj = formData.workflowDetails.workflow.find(
                  (stage: any) =>
                    stage.stage?.trim().toLowerCase() === currentStatus
                );

                if (!stageObj) {
                  // console.warn(⚠️ No matching stage object for "${currentStatus}");
                } else {
                  const ownerType = stageObj?.ownerSettings?.type;
                  const selectedUserIds =
                    stageObj?.ownerSettings?.selectedUsers?.map(
                      (user: any) => user.id
                    ) || [];

                  if (selectedUserIds.includes(userInfo.id)) {
                    isEditable = true;
                  } else {
                  }
                }
              } else {
                // console.warn("❌ Current status is NOT in allowed stages");
              }
            }
          } else {
            if (urlId === undefined) {
              isEditable = true;
            } else if (String(formData?.createdBy) === String(userInfo.id)) {
              isEditable = true;
            }
          }

          const columns = tableHeader.map((attr: any, colIndex: number) => {
            return {
              title: () => (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Input
                      type="text"
                      value={
                        tempColumn && tempColumn.id === attr.id
                          ? tempColumn.attributeName
                          : attr.attributeName
                      }
                      onChange={(e) => {
                        const newVal = e.target.value;
                        if (tempColumn?.id === attr.id) {
                          setTempColumn({
                            ...tempColumn,
                            attributeName: newVal,
                          });
                        } else {
                          setTempColumn({ id: attr.id, attributeName: newVal });
                        }
                      }}
                      placeholder="Enter column name"
                      // style={{
                      //   marginRight: "8px",
                      //   width: "100%",
                      //   backgroundColor: "blue",
                      //   color: "red",
                      //   WebkitTextFillColor: "red", // Required for some browsers like Chrome
                      //   opacity: 1, // Prevents dimming in disabled mode
                      // }}
                      disabled={true}
                      className={classes.headerInput}
                    />
                  </div>
                </>
              ),
              dataIndex: attr.attributeName.toLowerCase().replace(/\s+/g, "_"),
              ...(attr.width ? { width: attr.width } : {}),
              render: (text: any, record: any, rowIndex: any) => {
                const columnName = attr.attributeName;
                const cell = record.cells.find(
                  (c: any) => c.columnName === columnName
                );
                const specificationCell = record.cells.find(
                  (c: any) => c.columnType === "specification"
                );
                const dataTypeSpecification = specificationCell
                  ? specificationCell.datatype
                  : "";
                const remarksCell = record.cells.find(
                  (c: any) => c.columnType === "remarks"
                );
                const dataTypeRemaks = remarksCell ? remarksCell.datatype : "";

                return (
                  <div style={{ display: "flex", gap: "10px" }}>
                    {cell && cell.columnType === "value" ? (
                      (() => {
                        if (urlId && mode === true) {
                          // if (dataType === "numberRange") {
                          //   return (
                          //     <div style={{ display: "flex", gap: "10px" }}>
                          //       <Input
                          //         value={cell.min}
                          //         type="number"
                          //         style={{ width: 90, color: "black" }}
                          //         placeholder="Min"
                          //         disabled={true}
                          //       />
                          //       <span>-</span>
                          //       <Input
                          //         value={cell.max}
                          //         type="number"
                          //         style={{ width: 90, color: "black" }}
                          //         placeholder="Max"
                          //         disabled={true}
                          //       />
                          //     </div>
                          //   );
                          // } else
                          if (dataTypeSpecification === "currentDate") {
                            return (
                              <Input
                                value={cell.value}
                                style={{ width: 200, color: "black" }}
                                //disabled={true}
                              />
                            );
                          } else if (dataTypeSpecification === "number") {
                            const upperLimit =
                              specificationCell?.value +
                              Number(specificationCell?.toleranceValue?.max);
                            const lowerLimit =
                              specificationCell.value -
                              Number(specificationCell?.toleranceValue?.min);
                            const isInRange =
                              cell?.value >= lowerLimit &&
                              cell?.value <= upperLimit;
                            return (
                              <>
                                <Input
                                  type="number"
                                  value={cell.value}
                                  onChange={(e) =>
                                    handleInputChangeValue(
                                      tableId,
                                      cell.id,
                                      e.target.value,
                                      "number"
                                    )
                                  }
                                  style={{
                                    width: "100%",
                                    color: "black",
                                    border:
                                      specificationCell.toleranceType ===
                                        "tolerance" && cell.value
                                        ? `${
                                            isInRange
                                              ? "1px solid #d9d9d9"
                                              : "2px solid red"
                                          }`
                                        : "1px solid #d9d9d9",
                                    backgroundColor:
                                      specificationCell.toleranceType ===
                                        "tolerance" && cell.value
                                        ? isInRange
                                          ? "rgba(0, 0, 0, 0.04)" // Light green (in range)
                                          : "rgba(255, 0, 0, 0.1)" // Light red (out of range)
                                        : "rgba(0, 0, 0, 0.04)", // Default background
                                  }}
                                  placeholder="Enter number"
                                  //disabled={true || !isEditable}
                                />
                              </>
                            );
                          } else if (dataTypeSpecification === "numberRange") {
                            const upperLimit = specificationCell?.maxValue;
                            const lowerLimit = specificationCell?.minValue;
                            const isInRange =
                              cell?.value >= lowerLimit &&
                              cell?.value <= upperLimit;
                            return (
                              <>
                                <Input
                                  type="number"
                                  value={cell.value}
                                  onChange={(e) =>
                                    handleInputChangeValue(
                                      tableId,
                                      cell.id,
                                      e.target.value,
                                      "number"
                                    )
                                  }
                                  style={{
                                    width: "100%",
                                    color: "black",
                                    border: isInRange
                                      ? "1px solid #d9d9d9"
                                      : "2px solid red",
                                    backgroundColor: isInRange
                                      ? "rgba(0, 0, 0, 0)" // Light green (in range)
                                      : "rgba(255, 0, 0, 0.1)", // Light red (out of range)
                                  }}
                                  placeholder="Enter number"
                                  //disabled={true || !isEditable}
                                />
                              </>
                            );
                          } else {
                            return (
                              <Input.TextArea
                                autoSize={{ minRows: 1 }}
                                value={cell.value}
                                style={{ color: "black", width: "100%" }}
                                //disabled={true || !isEditable}
                              />
                            );
                          }
                        } else {
                          if (dataTypeSpecification === "entityType") {
                            return (
                              <Select
                                style={{ width: "100%", color: "black" }}
                                onChange={(e) =>
                                  handleInputChangeValue(
                                    tableId,
                                    cell.id,
                                    e,
                                    "entityType"
                                  )
                                }
                                //disabled={mode || !isEditable}
                                value={cell.entityId}
                              >
                                {specificationCell?.options?.map(
                                  (option: any) => (
                                    <Option value={option.id}>
                                      {option.name}
                                    </Option>
                                  )
                                )}
                              </Select>
                            );
                          } else if (dataTypeSpecification === "appFields") {
                            return (
                              <Select
                                style={{ width: "100%", color: "black" }}
                                onChange={(e) =>
                                  handleInputChangeValue(
                                    tableId,
                                    cell.id,
                                    e,
                                    "appFields"
                                  )
                                }
                                //disabled={location?.state?.mode || !isEditable}
                                value={cell.value}
                              >
                                {specificationCell?.options?.map(
                                  (field: any) => (
                                    <Option key={field} value={field}>
                                      {field}
                                    </Option>
                                  )
                                )}
                              </Select>
                            );
                          } else if (dataTypeSpecification === "text") {
                            return (
                              <Input.TextArea
                                autoSize={{ minRows: 1 }}
                                value={cell.value}
                                onChange={(e) =>
                                  handleInputChangeValue(
                                    tableId,
                                    cell.id,
                                    e.target.value,
                                    "text"
                                  )
                                }
                                style={{ width: "100%", color: "black" }}
                                placeholder="Enter text"
                                //disabled={mode || !isEditable}
                              />
                            );
                          } else if (dataTypeSpecification === "number") {
                            const upperLimit =
                              specificationCell?.value +
                              Number(specificationCell?.toleranceValue?.max);
                            const lowerLimit =
                              specificationCell.value -
                              Number(specificationCell?.toleranceValue?.min);
                            const isInRange =
                              cell?.value >= lowerLimit &&
                              cell?.value <= upperLimit;
                            return (
                              <>
                                <Input
                                  type="number"
                                  value={cell.value}
                                  onChange={(e) =>
                                    handleInputChangeValue(
                                      tableId,
                                      cell.id,
                                      e.target.value,
                                      "number"
                                    )
                                  }
                                  style={{
                                    width: "100%",
                                    color: "black",
                                    border:
                                      specificationCell.toleranceType ===
                                        "tolerance" && cell.value
                                        ? `2px solid ${
                                            isInRange ? "#ccc" : "red"
                                          }`
                                        : "1px solid #ccc",
                                    backgroundColor:
                                      specificationCell.toleranceType ===
                                        "tolerance" && cell.value
                                        ? isInRange
                                          ? "transparent" // Light green (in range)
                                          : "rgba(255, 0, 0, 0.1)" // Light red (out of range)
                                        : "transparent", // Default background
                                  }}
                                  placeholder="Enter number"
                                  //disabled={mode || !isEditable}
                                />
                              </>
                            );
                          } else if (dataTypeSpecification === "numberRange") {
                            const upperLimit = specificationCell?.maxValue;
                            const lowerLimit = specificationCell?.minValue;
                            const isInRange =
                              cell?.value >= lowerLimit &&
                              cell?.value <= upperLimit;
                            return (
                              <>
                                <Input
                                  type="number"
                                  value={cell.value}
                                  onChange={(e) =>
                                    handleInputChangeValue(
                                      tableId,
                                      cell.id,
                                      e.target.value,
                                      "number"
                                    )
                                  }
                                  style={{
                                    width: "100%",
                                    color: "black",
                                    border: isInRange
                                      ? "1px solid #d9d9d9"
                                      : "2px solid red",
                                    backgroundColor: isInRange
                                      ? "rgba(0, 0, 0, 0)" // Light green (in range)
                                      : "rgba(255, 0, 0, 0.1)", // Light red (out of range)
                                  }}
                                  placeholder="Enter number"
                                  disabled={mode || !isEditable}
                                />
                              </>
                            );
                          } else if (dataTypeSpecification === "currentDate") {
                            return (
                              <Input
                                value={cell.value}
                                style={{ width: "100%", color: "black" }}
                                placeholder="Enter text"
                                disabled={true || !isEditable}
                              />
                            );
                          } else if (
                            dataTypeSpecification === "dateSelection"
                          ) {
                            return (
                              <DatePicker
                                value={
                                  cell.value
                                    ? dayjs(cell.value, "DD/MM/YYYY")
                                    : null
                                }
                                style={{ width: "100%", color: "black" }}
                                format={"DD/MM/YYYY"}
                                onChange={(date, dateString) =>
                                  handleInputChangeValue(
                                    tableId,
                                    cell.id,
                                    dateString,
                                    "dateSelection"
                                  )
                                }
                                //disabled={mode || !isEditable}
                              />
                            );
                          } else if (dataTypeSpecification === "multiValue") {
                            return (
                              <Select
                                value={cell.value}
                                style={{ width: "100%", color: "black" }}
                                onChange={(e) =>
                                  handleInputChangeValue(
                                    tableId,
                                    cell.id,
                                    e,
                                    "multiValue"
                                  )
                                }
                                //disabled={mode || !isEditable}
                              >
                                {specificationCell?.dataOptions?.map(
                                  (field: any) => (
                                    <Option key={field} value={field}>
                                      {field}
                                    </Option>
                                  )
                                )}
                              </Select>
                            );
                          } else if (dataTypeSpecification === "yesNo") {
                            return (
                              <Radio.Group
                                value={cell.value}
                                style={{ width: 200 }}
                                buttonStyle="solid"
                                onChange={(e) =>
                                  handleInputChangeValue(
                                    tableId,
                                    cell.id,
                                    e.target.value,
                                    "yesNo"
                                  )
                                }
                                //disabled={mode || !isEditable}
                              >
                                <Radio.Button value="yes">Yes</Radio.Button>
                                <Radio.Button value="no">No</Radio.Button>
                              </Radio.Group>
                            );
                          } else if (dataTypeSpecification === "email") {
                            const emailValid = isValidEmail(cell.value);
                            return (
                              <Input
                                type="email"
                                style={{
                                  width: "100%",
                                  color: "black",
                                  border: emailValid
                                    ? "2px solid green"
                                    : "2px solid red",
                                  backgroundColor: emailValid
                                    ? "rgba(0, 0, 0, 0.04)"
                                    : "rgba(255, 0, 0, 0.1)",
                                }}
                                placeholder="Enter email"
                                value={cell.value}
                                //disabled={mode}
                                onChange={(e) =>
                                  handleInputChangeValue(
                                    tableId,
                                    cell.id,
                                    e.target.value,
                                    "email"
                                  )
                                }
                              />
                            );
                          } else if (dataTypeSpecification === "image") {
                            return (
                              <div
                                style={{
                                  width: "100%",
                                  display: "flex",
                                  gap: "10px",
                                  alignItems: "center",
                                }}
                              >
                                {cell?.value && (
                                  <img
                                    className="pdf-uploaded-image"
                                    src={cell.value}
                                    onClick={() => {
                                      setPreviewImage(cell.value);
                                      setIsPreviewVisible(true);
                                    }}
                                    alt="uploaded"
                                    style={{
                                      width: "30px",
                                      height: "30px",
                                      objectFit: "fill",
                                      // marginBottom: "5px",
                                      borderRadius: "4px",
                                      border: "1px solid #d9d9d9",
                                    }}
                                  />
                                )}
                                <Upload
                                  accept="image/*"
                                  showUploadList={false}
                                  beforeUpload={(file) => {
                                    const reader = new FileReader();
                                    reader.onload = (e) => {
                                      const base64 = e.target?.result as string;
                                      handleInputChangeValue(
                                        tableId,
                                        cell.id,
                                        base64,
                                        "image"
                                      );
                                    };
                                    reader.readAsDataURL(file);
                                    return false; // Prevent automatic upload
                                  }}
                                >
                                  <Button
                                    size="small"
                                    style={{
                                      display: hideDisplaysForPDF
                                        ? "none"
                                        : "inline",
                                    }}
                                  >
                                    Upload Image
                                  </Button>
                                </Upload>
                              </div>
                            );
                          } else {
                            return (
                              <TextArea
                                autoSize={{ minRows: 1 }}
                                value={cell.value}
                                onChange={(e) =>
                                  handleInputChangeValue(
                                    tableId,
                                    cell.id,
                                    e.target.value,
                                    "text"
                                  )
                                }
                                style={{ width: "100%", color: "black" }}
                                placeholder="Enter text"
                                //disabled={mode || !isEditable}
                              />
                            );
                          }
                        }
                      })()
                    ) : cell &&
                      cell.columnType === "specification" &&
                      cell.datatype === "numberRange" ? (
                      <>
                        <Input
                          type="number"
                          value={cell?.minValue || ""}
                          disabled={
                            (cell && cell.columnType !== "value") || !isEditable
                          }
                          style={{
                            color: "black",
                          }}
                        />
                        _
                        <Input
                          type="number"
                          value={cell?.maxValue || ""}
                          disabled={
                            (cell && cell.columnType !== "value") || !isEditable
                          }
                          style={{
                            color: "black",
                          }}
                        />
                        <span style={{ fontSize: "14px" }}>
                          {specificationCell.dataOptions}
                        </span>
                      </>
                    ) : cell && cell.columnType === "remarks" ? (
                      (() => {
                        if (urlId && mode === true) {
                          return (
                            <Input
                              value={cell.value}
                              style={{ color: "black" }}
                              //disabled={true || !isEditable}
                            />
                          );
                        } else {
                          if (dataTypeRemaks === "text") {
                            return (
                              <TextArea
                                autoSize={{ minRows: 1 }}
                                value={cell.value}
                                onChange={(e) =>
                                  handleInputChangeValue(
                                    tableId,
                                    cell.id,
                                    e.target.value,
                                    "text"
                                  )
                                }
                                style={{ width: "100%", color: "black" }}
                                placeholder="Enter text"
                                //disabled={mode || !isEditable}
                              />
                            );
                          } else if (dataTypeRemaks === "yesNo") {
                            return (
                              <Radio.Group
                                value={cell.value}
                                buttonStyle="solid"
                                style={{ width: 200 }}
                                onChange={(e) =>
                                  handleInputChangeValue(
                                    tableId,
                                    cell.id,
                                    e.target.value,
                                    "yesNo"
                                  )
                                }
                                //disabled={mode || !isEditable}
                              >
                                <Radio.Button value="yes">Yes</Radio.Button>
                                <Radio.Button value="no">No</Radio.Button>
                              </Radio.Group>
                            );
                          }
                        }
                      })()
                    ) : (
                      <>
                        <div style={{ position: "relative", width: "100%" }}>
                          <TextArea
                            autoSize={{ minRows: 1, maxRows: 10 }}
                            value={cell ? cell.value : ""}
                            disabled={
                              (cell && cell.columnType !== "value") ||
                              !isEditable
                            }
                            style={{
                              color: "black",
                            }}
                          />
                          {specificationCell &&
                            (specificationCell.datatype === "number" ||
                              specificationCell.datatype === "numberRange") &&
                            cell.columnType !== "none" &&
                            cell.columnType !== "label" && (
                              <span
                                style={{
                                  position: "absolute",
                                  right: 8,
                                  top: 8,
                                  fontSize: "14px",
                                  color: "#595959",
                                  background: "#fff",
                                  paddingLeft: 4,
                                }}
                              >
                                {specificationCell.dataOptions}{" "}
                                {specificationCell.toleranceType ===
                                  "tolerance" &&
                                  `(-${specificationCell?.toleranceValue?.min}/+${specificationCell?.toleranceValue?.max})`}
                              </span>
                            )}
                        </div>
                        {/* {specificationCell &&
                  (specificationCell.datatype === "number" ||
                    specificationCell.datatype === "numberRange") &&
                  cell.columnType !== "none" &&
                  cell.columnType !== "label" && (
                    <span style={{ fontSize: "14px" }}>
                      {specificationCell.dataOptions}{" "}
                      {specificationCell.toleranceType === "tolerance" &&
                        `( +${specificationCell?.toleranceValue?.max}, -${specificationCell?.toleranceValue?.min} )`}
                    </span>
                  )} */}
                      </>
                    )}
                  </div>
                );
              },
              onCell: (_record: any, rowIndex: number) => {
                if (!mergeEnabled) return {};

                const cell = tableObj.tableContent[rowIndex]?.cells.find(
                  (c: any) => c.columnName === attr.attributeName
                );
                if (!cell) return {};

                const mergedGroups = tableObj.mergedCells || [];

                for (const group of mergedGroups) {
                  const groupIds = group.mergedIds;
                  if (!groupIds.includes(cell.id)) continue;

                  const groupRowIndexes = tableObj.tableContent
                    .map((row: any, idx: any) => {
                      const match = row.cells.find((c: any) =>
                        groupIds.includes(c.id)
                      );
                      return match ? idx : null;
                    })
                    .filter((i: any) => i !== null);

                  const firstIndex = groupRowIndexes[0];
                  if (rowIndex === firstIndex) {
                    return { rowSpan: groupRowIndexes.length };
                  } else if (groupRowIndexes.includes(rowIndex)) {
                    return { rowSpan: 0 };
                  }
                }

                return {};
              },
            };
          });

          return (
            <Accordion key={tableId} defaultExpanded>
              <AccordionSummary
                expandIcon={<MdExpandMore />}
                aria-controls={`panel-${index}-content`}
                id={`panel-${index}-header`}
                className={classes.summaryRoot}
              >
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "start",
                  }}
                >
                  <Input
                    style={{ width: "40%", marginLeft: "15px" }}
                    // onChange={(e) => handleChangeTableHeaderTitle(e.target.value,tableId)}
                    value={tableObj.tableHeaderTitle}
                    disabled={true}
                    className={classes.tableHeaderInput}
                  />
                </div>
              </AccordionSummary>

              <AccordionDetails>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    gap: "20px",
                  }}
                  ref={(el) => (pdfRefTableContents.current[index] = el)}
                >
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "end",
                    }}
                  >
                    <div
                      style={{
                        width: "fit-content",
                        display: hideDisplaysForPDF ? "none" : "flex",
                        justifyContent: "end",
                        // gap: "10px",
                        alignItems: "center",
                        paddingLeft: "20px",
                      }}
                    >
                      <label
                        style={{
                          fontWeight: "bold",
                          color: "#003566",
                          width: "100px",
                        }}
                      >
                        Stage Owner :{" "}
                      </label>
                      <Select
                        mode="multiple"
                        allowClear
                        defaultValue={tableObj.workflowStages}
                        disabled={true}
                        className={classes.worflowStageSelect}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      width: "100%",
                    }}
                    className={classes.tableContainer}
                  >
                    <Table
                      columns={columns}
                      dataSource={tableObj.tableContent || []}
                      pagination={false}
                      rowKey={(record, rowIndex) => `row-${rowIndex}`}
                    />
                  </div>
                </div>
              </AccordionDetails>
            </Accordion>
          );
        } else if (tableObj.sectionId) {
          return (
            <div
              key={tableObj.sectionId}
              style={{
                display: "flex",
                flexWrap: "wrap",
                // justifyContent: "space-between",
                gap: "5px",
                margin: "0px 5px",
              }}
              ref={(el) => (pdfRefTableContents.current[index] = el)}
            >
              {tableObj.sectionContent?.map((field: any) => {
                const getAdjustedWidth = (
                  width: string | undefined
                ): string => {
                  if (!width) return "100%";

                  switch (width) {
                    case "100%":
                      return "97%";
                    case "50%":
                      return "48.5%";
                    case "30%":
                    case "31%":
                    case "32%":
                    case "33%":
                      return `${parseFloat(width) - 1}%`;
                    default:
                      return width;
                  }
                };

                const commonStyle = {
                  width: getAdjustedWidth(field.width),
                  margin: "0px 5px",
                };

                // TEXT field (used as heading)
                if (field.id === "Text") {
                  return (
                    <pre
                      key={field.uniqueId}
                      style={{
                        ...commonStyle,
                        marginBottom: "5px",
                        fontSize: `${field.fontSize || 14}px`,
                        textAlign: field.textAlign || "start",
                        fontWeight: field.fontWeight || "normal",
                      }}
                    >
                      {field.value}
                    </pre>
                  );
                }

                // IMAGE field
                if (field.id === "Image") {
                  return (
                    <img
                      key={field.uniqueId}
                      src={field?.properties?.imageUrl || field.imageUrl}
                      alt="SectionImage"
                      style={{
                        width: field.width
                          ? `${Math.max(parseInt(field.width) - 1, 1)}%`
                          : "100%",
                        height: field.height || "auto",
                        objectFit: "fill",
                        display: "block",
                      }}
                    />
                  );
                }

                // MULTIPLE TYPES field
                if (field.id === "MultipleTypes") {
                  if (field.datatype === "currentDate" && !field.runtimeValue) {
                    field.runtimeValue = dayjs().format("DD/MM/YYYY");
                  }
                  if (field.datatype === "@user" && !field.runtimeValue) {
                    field.runtimeValue = userInfo.id;
                    field.displayName = userInfo.fullName;
                  }
                  const handleChange = (value: any, type: string) => {
                    setFormData((prev: any) => {
                      const updatedSections = prev.tableFieldsContents.map(
                        (item: any) => {
                          if (item.sectionId !== tableObj.sectionId)
                            return item;
                          return {
                            ...item,
                            sectionContent: item.sectionContent.map(
                              (f: any) => {
                                if (f.uniqueId === field.uniqueId) {
                                  if (type === "range-min") {
                                    return { ...f, min: value };
                                  } else if (type === "range-max") {
                                    return { ...f, max: value };
                                  } else {
                                    return { ...f, runtimeValue: value };
                                  }
                                }
                                return f;
                              }
                            ),
                          };
                        }
                      );

                      return {
                        ...prev,
                        tableFieldsContents: updatedSections,
                      };
                    });
                  };

                  return (
                    <div
                      key={field.uniqueId}
                      style={{
                        ...commonStyle,
                        display: "flex",
                        alignItems: "center",
                        gap: 8, // spacing between label and input
                        marginBottom: 12,
                      }}
                    >
                      <label
                        style={{
                          fontSize: "14px",
                          // fontWeight: "bold",
                          whiteSpace: "nowrap", // keeps the label in one line
                          minWidth: 100, // adjust as needed
                        }}
                      >
                        {field.value}
                      </label>
                      <div style={{ flex: 1 }}>
                        {(() => {
                          switch (field.datatype) {
                            case "text":
                              return (
                                <Input
                                  value={field.runtimeValue || ""}
                                  onChange={(e) =>
                                    handleChange(e.target.value, "text")
                                  }
                                  disabled={mode}
                                />
                              );
                            case "number":
                              return (
                                <Input
                                  type="number"
                                  value={field.runtimeValue || ""}
                                  onChange={(e) =>
                                    handleChange(e.target.value, "number")
                                  }
                                  disabled={mode}
                                />
                              );
                            case "range":
                              return (
                                <div style={{ display: "flex", gap: 10 }}>
                                  <Input
                                    type="number"
                                    placeholder="Min"
                                    value={field.min || ""}
                                    onChange={(e) =>
                                      handleChange(e.target.value, "range-min")
                                    }
                                    disabled={mode}
                                    style={{ width: 90 }}
                                  />
                                  <span>-</span>
                                  <Input
                                    type="number"
                                    placeholder="Max"
                                    value={field.max || ""}
                                    onChange={(e) =>
                                      handleChange(e.target.value, "range-max")
                                    }
                                    disabled={mode}
                                    style={{ width: 90 }}
                                  />
                                </div>
                              );
                            case "dateSelection":
                              return (
                                <DatePicker
                                  value={
                                    field.runtimeValue
                                      ? dayjs(field.runtimeValue, "DD/MM/YYYY")
                                      : null
                                  }
                                  onChange={(date, dateString) =>
                                    handleChange(dateString, "dateSelection")
                                  }
                                  format="DD/MM/YYYY"
                                  disabled={mode}
                                  style={{ width: "100%" }}
                                />
                              );
                            case "multiValue":
                              return (
                                <Select
                                  value={field.runtimeValue || ""}
                                  onChange={(val) =>
                                    handleChange(val, "multiValue")
                                  }
                                  disabled={mode}
                                  style={{ width: "100%" }}
                                >
                                  {(Array.isArray(field.dataOptions)
                                    ? field.dataOptions
                                    : field.dataOptions?.split(",")
                                  )?.map((option: any) => (
                                    <Select.Option key={option} value={option}>
                                      {option}
                                    </Select.Option>
                                  ))}
                                </Select>
                              );
                            case "yesNo":
                              return (
                                <Radio.Group
                                  value={field.runtimeValue || ""}
                                  onChange={(e) =>
                                    handleChange(e.target.value, "yesNo")
                                  }
                                  disabled={mode}
                                >
                                  <Radio.Button value="yes">Yes</Radio.Button>
                                  <Radio.Button value="no">No</Radio.Button>
                                </Radio.Group>
                              );
                            case "email":
                              const emailValid = isValidEmail(
                                field.runtimeValue || ""
                              );
                              return (
                                <Input
                                  type="email"
                                  value={field.runtimeValue || ""}
                                  onChange={(e) =>
                                    handleChange(e.target.value, "email")
                                  }
                                  disabled={mode}
                                  style={{
                                    border: emailValid
                                      ? "2px solid green"
                                      : "2px solid red",
                                    backgroundColor: emailValid
                                      ? "rgba(0, 0, 0, 0.04)"
                                      : "rgba(255, 0, 0, 0.1)",
                                  }}
                                />
                              );
                            case "@user":
                              return (
                                <Input
                                  value={field.displayName || ""}
                                  disabled={true}
                                />
                              );
                            case "currentDate":
                              return (
                                <Input
                                  value={field.runtimeValue}
                                  disabled={true}
                                />
                              );
                            case "entityType":
                              return (
                                <Select
                                  value={field.runtimeValue || ""}
                                  onChange={(val) =>
                                    handleChange(val, "entityType")
                                  }
                                  disabled={mode}
                                  style={{ width: "100%" }}
                                >
                                  {field?.options?.map((option: any) => (
                                    <Select.Option value={option.id}>
                                      {option.name}
                                    </Select.Option>
                                  ))}
                                </Select>
                              );
                            case "appFields":
                              return (
                                <Select
                                  value={field.runtimeValue || ""}
                                  onChange={(val) =>
                                    handleChange(val, "appFields")
                                  }
                                  disabled={mode}
                                  style={{ width: "100%" }}
                                >
                                  {field?.options?.map((option: any) => (
                                    <Select.Option key={option} value={option}>
                                      {option}
                                    </Select.Option>
                                  ))}
                                </Select>
                              );
                            default:
                              return (
                                <Input
                                  value={field.runtimeValue || ""}
                                  onChange={(e) =>
                                    handleChange(e.target.value, "text")
                                  }
                                  disabled={mode}
                                />
                              );
                          }
                        })()}
                      </div>
                    </div>
                  );
                }

                // ATTACHMENT field (File Upload)
                if (field.id === "Attachment") {
                  const handleFileChange = (info: any) => {
                    if (info.file.status === "done") {
                      const fileName = info.file.name;
                      const fileUrl =
                        info.file.response?.url ||
                        URL.createObjectURL(info.file.originFileObj);

                      setFormData((prev: any) => {
                        const updatedSections = prev.tableFieldsContents.map(
                          (item: any) => {
                            if (item.sectionId !== tableObj.sectionId)
                              return item;
                            return {
                              ...item,
                              sectionContent: item.sectionContent.map(
                                (f: any) => {
                                  if (f.uniqueId === field.uniqueId) {
                                    return {
                                      ...f,
                                      fileName,
                                      fileUrl,
                                    };
                                  }
                                  return f;
                                }
                              ),
                            };
                          }
                        );

                        return {
                          ...prev,
                          tableFieldsContents: updatedSections,
                        };
                      });
                    }
                  };

                  return (
                    <div
                      key={field.uniqueId}
                      style={{
                        ...commonStyle,
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 12,
                      }}
                    >
                      <label
                        style={{
                          fontSize: "14px",
                          fontWeight: "bold",
                          whiteSpace: "nowrap",
                          minWidth: 100,
                        }}
                      >
                        {field.value}
                      </label>

                      <div style={{ flex: 1 }}>
                        <Upload
                          name="file"
                          showUploadList={false}
                          onChange={handleFileChange}
                          customRequest={({ file, onSuccess }) => {
                            setTimeout(() => {
                              onSuccess && onSuccess("ok");
                            }, 1000);
                          }}
                          disabled={mode}
                        >
                          <Button
                            icon={<MdOutlineDriveFolderUpload />}
                            disabled={mode}
                          >
                            Click to Upload
                          </Button>
                        </Upload>

                        {field.fileName && field.fileUrl && (
                          <div style={{ marginTop: 8 }}>
                            {/* <a
                              href={field.fileUrl}
                              download={field.fileName}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: "#1890ff",
                                textDecoration: "underline",
                              }}
                            >
                              {field.fileName}
                            </a> */}
                            <a
                              onClick={() => {
                                setPreviewFile({
                                  url: field.fileUrl,
                                  name: field.fileName,
                                });
                                setPreviewVisible(true);
                              }}
                              style={{
                                color: "#1890ff",
                                textDecoration: "underline",
                                cursor: "pointer",
                              }}
                            >
                              {field.fileName}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                if (field.id === "Space") {
                  return (
                    <div style={{ ...commonStyle, marginBottom: "30px" }}></div>
                  );
                }

                return null;
              })}
            </div>
          );
        }

        return null;
      })}

      <Drawer
        title="Workflow"
        placement="right"
        width={900}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        <Tabs defaultActiveKey="1" type="card">
          <TabPane tab="Workflow Details" key="1">
            <div style={{ padding: "20px" }}>
              {formData?.workflowDetails &&
                formData?.workflowDetails !== "none" && (
                  <div>
                    <h2>{formData?.workflowDetails?.title}</h2>

                    {formData?.workflowDetails.workflow.map(
                      (stage: any, index: any) => {
                        return (
                          <div
                            key={index}
                            style={{
                              marginBottom: "10px",
                              paddingLeft: "10px",
                            }}
                          >
                            <h4>
                              {stage.stage}
                              {" : "}
                              <span
                                style={{
                                  color:
                                    stage.status === "complete"
                                      ? "green"
                                      : "orange",
                                }}
                              >
                                {stage.status === "complete"
                                  ? "Completed"
                                  : stage.status}
                                {/* {showTick && (
                              <Button
                                type="link"
                                icon={<AiFillCheckCircle />}
                                onClick={() => handleMarkDone(index)}
                              />
                            )} */}
                              </span>
                            </h4>

                            <Space
                              direction="vertical"
                              style={{ width: "100%" }}
                            >
                              {/* {stage.ownerSettings?.type === "Named Users" &&
                            stage.ownerSettings.selectedUsers?.map(
                              (user: any, idx: any) => (
                                <Input
                                  key={idx}
                                  value={`${user?.firstname || ""} ${
                                    user?.lastname || ""
                                  }`}
                                  readOnly
                                />
                              )
                            )}
                          {stage.ownerSettings?.type === "Dept PIC" &&
                            stage.ownerSettings.selectedUsers?.map(
                              (user: any, idx: any) => (
                                <Input
                                  key={idx}
                                  value={`${user?.firstname || ""} ${
                                    user?.lastname || ""
                                  }`}
                                  readOnly
                                />
                              )
                            )}
                          {stage.ownerSettings?.type === "Dept Manager" && (
                            <Input
                              value={`${
                                stage.ownerSettings.selectedUsers?.firstname ||
                                ""
                              } ${
                                stage.ownerSettings.selectedUsers?.lastname ||
                                ""
                              }`}
                              readOnly
                            />
                          )}
                          {stage.ownerSettings?.type === "Dept User" && (
                            <Select
                              style={{ width: "100%", color: "black" }}
                              value={stage.ownerSettings?.selectedUsers}
                              onChange={(value) =>
                                handleDeptUserChange(value, index)
                              }
                              disabled={mode}
                            >
                              {stage.ownerSettings?.userList?.map(
                                (option: any) => (
                                  <Option key={option.id} value={option.id}>
                                    {option.firstname + option.lastname}
                                  </Option>
                                )
                              )}
                            </Select>
                          )} */}
                              {stage.ownerSettings?.map(
                                (group: any[], groupIndex: number) => (
                                  <div
                                    key={groupIndex}
                                    style={{
                                      margin: "10px 0",
                                      borderLeft: "2px dashed #ccc",
                                      paddingLeft: "10px",
                                    }}
                                  >
                                    <p
                                      style={{
                                        fontStyle: "italic",
                                        color: "#888",
                                      }}
                                    >
                                      Group {groupIndex + 1}
                                    </p>
                                    <Space
                                      direction="vertical"
                                      style={{ width: "100%" }}
                                    >
                                      {group.map(
                                        (condition: any, condIndex: number) => {
                                          const isFixedType =
                                            condition.type === "Named Users" ||
                                            condition.type === "PIC Of" ||
                                            condition.type === "Manager Of" ||
                                            condition.type === "Head Of";

                                          const isUserOf =
                                            condition.type === "User Of";

                                          const isGlobalRoleOf =
                                            condition.type === "Global Role Of";

                                          const ifUserSelect =
                                            condition.ifUserSelect;

                                          const typeStatusColor =
                                            condition.status === "complete"
                                              ? "green"
                                              : "orange";
                                          const typeStatusText =
                                            condition.status === "complete"
                                              ? "Complete"
                                              : "Pending";

                                          return (
                                            <div key={condIndex}>
                                              <CustomMultiSelect
                                                label={
                                                  <>
                                                    {condition.type}{" "}
                                                    <span
                                                      style={{
                                                        color: typeStatusColor,
                                                      }}
                                                    >
                                                      ({typeStatusText})
                                                    </span>
                                                  </>
                                                }
                                                placeholder={condition.type}
                                                options={
                                                  condition.type ===
                                                    "User Of" ||
                                                  condition.type ===
                                                    "Global Role Of"
                                                    ? condition.userList
                                                    : condition.selectedUsers
                                                }
                                                selectedValues={
                                                  ifUserSelect
                                                    ? condition.actualSelectedUsers
                                                    : condition.selectedUsers
                                                }
                                                onChange={
                                                  isUserOf ||
                                                  isGlobalRoleOf ||
                                                  ifUserSelect
                                                    ? (val) =>
                                                        handleWorkflowUserChange(
                                                          val,
                                                          condition.ifUserSelect,
                                                          index,
                                                          groupIndex,
                                                          condIndex
                                                        )
                                                    : undefined
                                                }
                                                disabled={
                                                  isFixedType && !ifUserSelect
                                                    ? true
                                                    : formData.workflowDetails !==
                                                        "default" &&
                                                      formData.workflowDetails !==
                                                        "none"
                                                    ? false
                                                    : false
                                                }
                                              />
                                            </div>
                                          );
                                        }
                                      )}
                                    </Space>
                                  </div>
                                )
                              )}
                            </Space>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
            </div>
          </TabPane>
          <TabPane tab="Workflow History" key="2">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "160px 40px 1fr",
                gap: "10px",
                // padding: "20px",
              }}
            >
              <h2 style={{ gridColumn: "3 / 4", marginBottom: "24px" }}>
                Workflow History
              </h2>

              {formData?.workflowDetails !== "none" ? (
                formData?.workflowDetails?.workflowHistory?.map(
                  (stage: any, index: number) => {
                    const isExpanded = expandedStages.includes(index);
                    const timestamp = stage?.actionDateAndTime;
                    const isLast =
                      index ===
                      formData?.workflowDetails?.workflowHistory?.length - 1;

                    return (
                      <React.Fragment key={index}>
                        {/* Column 1: Timestamp */}
                        <div
                          style={{
                            width: "80px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "12px",
                              fontWeight: "bold",
                              textAlign: "center",
                              whiteSpace: "pre-line",
                            }}
                          >
                            {new Date(timestamp).toLocaleDateString()}
                            {"\n"}
                            {new Date(timestamp).toLocaleTimeString()}
                          </div>

                          <div
                            style={{
                              width: "12px",
                              height: "12px",
                              borderRadius: "50%",
                              backgroundColor: "#003059",
                              margin: "8px 0",
                            }}
                          ></div>

                          {!isLast && (
                            <div
                              style={{
                                width: "2px",
                                backgroundColor: "#ccc",
                                flexGrow: 1,
                                minHeight: "60px",
                              }}
                            />
                          )}
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            position: "relative",
                          }}
                        ></div>

                        <div
                          style={{
                            position: "relative", // enable absolute positioning of the icon
                            display: "flex",
                            flexDirection: "column",
                            border: "1px solid #ddd",
                            borderRadius: "6px",
                            background: "white",
                            boxShadow: "0 2px 8px #00000040",
                            transition: "box-shadow 0.3s ease-in-out",
                            padding: "10px",
                            marginBottom: "16px",
                          }}
                        >
                          {/* Expand/Collapse Icon only for organization with digital signature*/}
                          {userDetails?.organization?.digitalSignature ===
                            true && (
                            <span
                              onClick={() => toggleStage(index)}
                              style={{
                                cursor: "pointer",
                                position: "absolute",
                                top: "10px",
                                right: "10px",
                                fontSize: "32px",
                                width: "32px",
                                height: "32px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                // borderRadius: "50%",
                                // backgroundColor: "#f0f0f0",
                                // border: "1px solid #ccc",
                                // transform: isExpanded
                                //   ? "rotate(180deg)"
                                //   : "rotate(0deg)",
                                // transition: "transform 0.3s ease",
                              }}
                              title={isExpanded ? "Collapse" : "Expand"}
                            >
                              <LuSignature />
                            </span>
                          )}

                          {/* Row: Stage Info + Signature */}
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                            }}
                          >
                            {/* Stage Info (Left) */}
                            <div style={{ flex: 1, marginRight: "20px" }}>
                              <p
                                style={{
                                  fontSize: "16px",
                                  fontWeight: "bold",
                                  marginBottom: "8px",
                                }}
                              >
                                {stage.actionName}
                              </p>

                              <Space
                                direction="vertical"
                                style={{
                                  width: "100%",
                                  marginTop: "5px",
                                  fontSize: "14px",
                                }}
                              >
                                {stage.actionByName}
                              </Space>
                            </div>

                            {/* Signature (Right) */}
                            {isExpanded &&
                              stage?.digiSign?.personalSignature && (
                                <div
                                  style={{
                                    width: "320px",
                                    paddingLeft: "20px",
                                    border: "1px solid #ccc",
                                    borderRadius: "6px",
                                    backgroundColor: "#fff",
                                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: "13px",
                                      color: "#000",
                                      fontWeight: 500,
                                      marginBottom: "8px",
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      padding: "8px 12px 0",
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontSize: "16px",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      Digital Signature
                                    </span>
                                    <span style={{ fontSize: "14px" }}>
                                      {new Date(
                                        stage.digiSign?.signedAt
                                      ).toLocaleString()}
                                    </span>
                                  </div>

                                  <div style={{ padding: "0 12px 8px" }}>
                                    <img
                                      src={stage?.digiSign?.personalSignature}
                                      alt="Signature"
                                      style={{
                                        width: "100%",
                                        height: "auto",
                                        display: "block",
                                        borderRadius: "4px",
                                      }}
                                    />
                                  </div>

                                  <Divider style={{ margin: "0 12px 12px" }} />
                                </div>
                              )}
                          </div>

                          {/* Comments Section (below entire row) */}
                          {isExpanded && stage.digiSign?.comment && (
                            <div
                              style={{
                                color: "#333",
                                marginTop: "12px",
                              }}
                            >
                              <strong>Comments:</strong>
                              <br /> {stage?.digiSign?.comment}
                            </div>
                          )}
                        </div>
                      </React.Fragment>
                    );
                  }
                )
              ) : (
                <div></div>
              )}
            </div>
          </TabPane>
        </Tabs>
      </Drawer>

      <Modal
        title="Basic Modal"
        open={isModalOpen}
        onOk={handleDataTypeModalOpenAndClose}
        onCancel={handleDataTypeModalOpenAndClose}
      >
        <DataTypeforTableCells
          clickedCell={clickedCell}
          selectedCellDatatypes={selectedCellDatatypes}
          setSelectedCellDatatypes={setSelectedCellDatatypes}
        />
      </Modal>

      <SignatureComponent
        userData={userDetails}
        action={null}
        onClose={onclose}
        open={signModalOpen}
        handleMarkDone={signatureHandler}
        index={firstPendingStageIndex}
        comment={digiSignComment}
        setComment={setComment}

        // onSave={onSave}
      ></SignatureComponent>

      <Modal
        title="PDF Export"
        open={pdfExportModal}
        onOk={handlePDFExportModalSubmit}
        onCancel={handlePDFExportModalCancel}
      >
        <Select
          style={{ width: 250 }}
          options={[
            { value: "portrait", label: "Portrait" },
            { value: "landscape", label: "Landscape" },
          ]}
          onChange={(value) => setPdfExportOrientation(value)}
          value={pdfExportOrientation}
        />
      </Modal>

      <Modal
        visible={isPreviewVisible}
        footer={null}
        onCancel={() => setIsPreviewVisible(false)}
        centered
        width={700}
      >
        <img
          alt="preview"
          style={{
            width: "100%",
            height: "auto",
            borderRadius: 8,
            marginTop: "20px",
          }}
          src={previewImage || ""}
        />
      </Modal>

      <Modal
        open={previewVisible}
        footer={null}
        title={previewFile?.name}
        onCancel={() => setPreviewVisible(false)}
        width="80%"
        style={{ top: 20 }}
        bodyStyle={{ padding: 0, height: "80vh" }}
        destroyOnClose
      >
        {previewFile?.url &&
          (() => {
            const name = previewFile.name.toLowerCase();
            const encodedUrl = encodeURIComponent(previewFile.url);

            if (name.endsWith(".pdf")) {
              return (
                <iframe
                  src={previewFile.url}
                  style={{ width: "100%", height: "100%", border: "none" }}
                  title="PDF Preview"
                />
              );
            } else if (/\.(jpg|jpeg|png|gif|webp|svg)$/.test(name)) {
              return (
                <img
                  src={previewFile.url}
                  alt="Preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              );
            } else if (/\.(mp3|wav|ogg)$/.test(name)) {
              return (
                <audio controls style={{ width: "100%" }}>
                  <source src={previewFile.url} />
                  Your browser does not support the audio element.
                </audio>
              );
            } else if (/\.(mp4|webm|mov|ogg)$/.test(name)) {
              return (
                <video controls style={{ width: "100%", height: "100%" }}>
                  <source src={previewFile.url} />
                  Your browser does not support the video tag.
                </video>
              );
            } else if (/\.(txt|csv|log|json)$/.test(name)) {
              return (
                <iframe
                  src={previewFile.url}
                  style={{ width: "100%", height: "100%", border: "none" }}
                  title="Text Preview"
                />
              );
            } else if (/\.(doc|docx|xls|xlsx|ppt|pptx)$/.test(name)) {
              // Use Microsoft Office Online Viewer
              return (
                <iframe
                  src={`https://view.officeapps.live.com/op/view.aspx?src=${encodedUrl}`}
                  style={{ width: "100%", height: "100%", border: "none" }}
                  title="Office File Preview"
                />
              );
            } else {
              return (
                <div style={{ padding: 20 }}>
                  Preview not supported.{" "}
                  <a
                    href={previewFile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Click here to download or open the file.
                  </a>
                </div>
              );
            }
          })()}
      </Modal>
    </div>
  );
};

export default RunTime;
