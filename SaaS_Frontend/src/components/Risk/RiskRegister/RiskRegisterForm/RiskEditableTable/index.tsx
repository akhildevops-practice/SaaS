// RiskEditableTable.tsx
import React, { useEffect, useState } from "react";
import {
  makeStyles,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Toolbar,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Grid,
} from "@material-ui/core";
import {
  // MdSave as SaveIcon,
  MdCancel as CancelIcon,
  MdExpandMore as ExpandMoreIcon,
  MdExpandLess as ExpandLessIcon,
  MdDeleteOutline as DeleteIcon,
  MdInbox as InboxIcon,
} from "react-icons/md";
import { FiEdit as EditIcon } from "react-icons/fi";
import {
  Input,
  Select,
  DatePicker,
  message,
  Pagination,
  Checkbox,
  Tabs,
  Radio,
  Typography as AntTypography,
} from "antd";

import { Modal, Upload, Form, InputNumber, Spin } from "antd";
import type { UploadProps } from "antd/es/upload";
import TextareaAutosize from "@material-ui/core/TextareaAutosize";
import SecondaryButton from "components/ReusableComponents/SecondaryButton";
import PrimaryButton from "components/ReusableComponents/PrimaryButton";
import moment from "moment";
import { TiTick as SaveIcon } from "react-icons/ti";

import { GiCancel } from "react-icons/gi";
import dayjs from "dayjs";
import CustomMultiSelect from "components/ReusableComponents/CustomMultiSelect";
import axios from "apis/axios.global";
import getSessionStorage from "utils/getSessionStorage";
const { Option } = Select;

// --------------------
// Styles
// --------------------
const useStyles = makeStyles((theme) => ({
  pagination: {
    position: "relative", // Changed from fixed to relative
    marginTop: "20px", // Added margin-top to create space between the table and pagination
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "inherit",
    padding: theme.spacing(1),
  },
  tabsWrapper: {
    "& .ant-tabs-tab": {
      backgroundColor: "#e3e8f9 !important",
      color: "black !important",
    },
    "& .ant-tabs-tab-btn": {
      letterSpacing: "0.6px",
    },
    "& .ant-tabs-tab-active": {
      backgroundColor: "#003566 !important",
    },
    "& .ant-tabs-tab-active div": {
      color: "white !important",
      fontWeight: "500",
    },
  },
  tableContainer: {
    maxHeight: 600,
    marginTop: theme.spacing(2),
    overflowX: "auto",
    position: "relative", // <-- VERY IMPORTANT
  },

  headerCell: {
    maxWidth: 250,
    whiteSpace: "normal", // allow wrapping at whitespace
    wordBreak: "normal", // do NOT break words arbitrarily
    overflowWrap: "break-word", // wrap long words if they exceed max-width
    fontWeight: 700,
    backgroundColor: "#E8F3F9",
    color: "#00224E",
  },
  bodyCell: {
    maxWidth: 270, // cap at 250px
    whiteSpace: "normal", // allow wrapping
    wordBreak: "break-word", // break long words if needed
  },

  toolbar: {
    display: "flex",
    justifyContent: "end",
    alignItems: "center",
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  inputCell: {
    width: "100%",
    whiteSpace: "normal",
    wordBreak: "break-word",
    overflowWrap: "break-word",
  },
  formField: {
    marginBottom: theme.spacing(2),
    minWidth: 300,
  },
  actionCell: {
    textAlign: "center",
  },
  formFieldLabel: {
    marginBottom: theme.spacing(1),
    fontWeight: 700,
  },
  textarea: {
    width: "100%",
    height: "100px",
    fontSize: "1rem",
    padding: theme.spacing(1),
    borderRadius: 4,
    borderColor: theme.palette.divider,
  },
  // sticky positions for first three columns:
  sticky1: {
    position: "sticky",
    left: 0,
    minWidth: 80,
    maxWidth: 80,
    background: "#E8F3F9",
  },
  sticky2: {
    position: "sticky",
    left: 80,
    minWidth: 150,
    maxWidth: 150,
    background: "#E8F3F9",
  },
  sticky3: {
    position: "sticky",
    left: 80 + 150,
    minWidth: 300,
    maxWidth: 300,
    background: "#E8F3F9",
  },
  stickyHeader1: {
    position: "sticky",
    top: 0,
    left: 0,
    zIndex: 3,
    backgroundColor: "#E8F3F9",
    minWidth: 80,
    maxWidth: 80,
  },
  stickyHeader2: {
    position: "sticky",
    top: 0,
    left: 80,
    zIndex: 3,
    backgroundColor: "#E8F3F9",
    minWidth: 150,
    maxWidth: 150,
  },
  stickyHeader3: {
    position: "sticky",
    top: 0,
    left: 230,
    zIndex: 3,
    backgroundColor: "#E8F3F9",
    minWidth: 300,
    maxWidth: 300,
  },

  stickyLastHeader: {
    position: "sticky",
    top: 0,
    right: 0,
    zIndex: 3,
    backgroundColor: "#E8F3F9",
    minWidth: 100,
    maxWidth: 100,
    borderLeft: "2px solid #d9d9d9",
  },
  stickyBody1: {
    position: "sticky",
    left: 0,
    minWidth: 80,
    maxWidth: 80,
    backgroundColor: theme.palette.background.paper,
    zIndex: 2, // newly added
  },
  stickyBody2: {
    position: "sticky",
    left: 80,
    minWidth: 150,
    maxWidth: 180,
    backgroundColor: theme.palette.background.paper,
    zIndex: 2, // newly added
  },
  stickyBody3: {
    position: "sticky",
    left: 230, // 80 + 150
    minWidth: 300,
    maxWidth: 300,
    backgroundColor: theme.palette.background.paper,
    zIndex: 2, // newly added
  },

  stickyLastBody: {
    position: "sticky",
    right: 0,
    backgroundColor: "#ffffff",
    minWidth: 100,
    maxWidth: 100,
    borderLeft: "2px solid #d9d9d9",
    zIndex: 2, // ensure it sits above scrollable cells
  },
}));

// --------------------
// Types (use `any` or replace with your own types as needed)
// --------------------
interface Column {
  key: string;
  label: string;
  inputType:
    | "text"
    | "number"
    | "select"
    | "textarea"
    | "date"
    | "checkbox"
    | "radio"
    | "multiselect"
    | null;
  width?: string;
  options?: any;
  render?: (value: any, record: RowData) => React.ReactNode; // ← new
}

interface RowData {
  id: string;
  [key: string]: any;
}

interface RiskEditableTableProps {
  columns: Column[];
  initialData: RowData[];
  onSaveRow?: (rowId: string, newRow: RowData) => void;
  onSaveAllRows?: (allRows: RowData[]) => void;
  onTableDataChange?: (currentRows: RowData[]) => void; // <— Add this line
  onDeleteRow?: (rowId: string) => void;
  riskConfig?: any;
  options?: any;
  isCreateMode?: boolean;
  showRequireStepMessage?: boolean;
  headerIsValid?: boolean;
  setShowRequireStepMessage?: any;
  pagination?: any;
  setPagination?: any;
  handleChangePage?: any;
  refershTable?: any;
}

// --------------------
// Component
// --------------------
export default function RiskEditableTable({
  columns,
  initialData,
  onSaveRow,
  onSaveAllRows,
  onTableDataChange,
  riskConfig,
  options,
  isCreateMode,
  showRequireStepMessage,
  headerIsValid,
  setShowRequireStepMessage,
  pagination,
  setPagination,
  handleChangePage,
  onDeleteRow,
  refershTable = false,
}: RiskEditableTableProps) {
  const classes = useStyles();
  const requiredFields = new Set(["sNo", "regDate", "jobBasicStep"]);

  // Local copy of rows
  const [rows, setRows] = useState<RowData[]>(initialData);
  const [activeTab, setActiveTab] = useState<"riskInfo" | "additionalInfo">(
    "riskInfo"
  );
  const [originalRows, setOriginalRows] = useState<Record<string, RowData>>({});

  useEffect(() => {
    if (onTableDataChange) {
      // console.log("checkr8 initialData", initialData);

      onTableDataChange(initialData);
    }
  }, []); // <-- run only once, on mount

  useEffect(() => {
    // console.log("checkr8 refershTable", refershTable);
    setRows(initialData);
  }, [refershTable]);

  // useEffect(() => {
  //   console.log("checkr8 rows in editable table", rows);
  // }, [rows]);

  // Which rows are inline‐editing
  const [inlineEditRows, setInlineEditRows] = useState<{
    [id: string]: boolean;
  }>({});

  // Edit All toggle
  const [editAll, setEditAll] = useState<boolean>(false);

  // Modal state for single‐row editing
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalRowId, setModalRowId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  //for import modal
  const userDetails = getSessionStorage();
  const [importModal, setImportModal] = useState<any>({
    open: false,
  });
  const [fileList, setFileList] = useState<any>([]);
  const [isSheetLoading, setIsSheetLoading] = useState<any>(false);
  const [isImportMode, setIsImportMode] = useState<any>(false);
  const [selectedSheetName, setSelectedSheetName] = useState<any>("");
  const [selectedStepsStartingFromRow, setSelectedStepsStartingFromRow] =
    useState<any>(1);

  const uploadProps: UploadProps = {
    multiple: false,
    beforeUpload: () => false,
    onChange({ file, fileList }: any) {
      if (!["uploading", "removed", "error"].includes(file.status)) {
        setFileList(fileList);
      }
    },
    onRemove: (file: any) => {
      setFileList((prev: any) => prev.filter((f: any) => f.uid !== file.uid));
    },
  };

  const handleImportHira = async () => {
    try {
      setIsSheetLoading(true);
      const formData = new FormData();
      formData.append("file", fileList[0].originFileObj);
      formData.append("sheetName", selectedSheetName);
      formData.append("stepsStartingFromRow", selectedStepsStartingFromRow);
      formData.append("configId", riskConfig?._id);
      formData.append("organizationId", userDetails?.organizationId);
      const response = await axios.post(`/api/riskregister/import`, formData);

      // console.log("checkriskimport response", response);

      if (response?.status === 200 || response?.status === 201) {
        const filteredData = response?.data?.filter((item: any) =>
          Number.isFinite(item.sNo)
        );

        // console.log("checkriskimport filteredData", filteredData);

        if (filteredData?.length) {
          // 1) Flatten riskDetails → top level, plus assign an `id`
          const rowsWithId = filteredData?.map((r: any) => {
            const rd = r.riskDetails || {};
            return {
              ...r,
              responsibility: [],
              actualLikelihood:
                r.actualLikelihood > 0 ? r.actualLikelihood : "",
              actualImpact: r.actualImpact > 0 ? r.actualImpact : "",
              residualScore: r?.residualScore > 0 ? r?.residualScore : "",
              id: String(r.sNo),
              // flatten all of these for your table columns:
              riskType: rd.riskTypeId,
              impactType: rd.impactType?.id,
              existingRiskRatingId: rd.existingRiskRatingId,
              targetRiskRatingId: rd.targetRiskRatingId,
              existingKeyControlId: rd.existingKeyControlId,
              actualRiskRatingId: rd.actualRiskRatingId,
              currentControlEffectivenessId: rd.currentControlEffectivenessId,
              riskManagementDecisionId: rd.riskManagementDecisionId,
            };
          });

          // 2) shove them into state
          setRows(rowsWithId);
          // setPagination((prev: any) => ({ ...prev, total: rowsWithId.length }));
          // 3) open them _all_ for inline‐edit
          const editing: Record<string, boolean> = {};
          rowsWithId.forEach((r: any) => (editing[r.id] = true));
          setInlineEditRows(editing);
          setEditAll(true);

          // 4) bubble up
          onTableDataChange?.(rowsWithId);

          setIsSheetLoading(false);
          // 5) close import modal
          // setIsImportMode(false);
          setImportModal({ open: false });
          return;
        } else {
          setImportModal({ open: false });
          message.error("Error in Importing Sheet, Please Contact Admin!");
        }
      } else {
        message.error("Error in Importing Sheet, Please Contact Admin!");
      }
    } catch (error) {
      // console.log("checkriskimport error in handleImportHira", error);
    } finally {
      setIsSheetLoading(false);
    }
  };

  const addNewRow = (newRow: RowData) => {
    setRows((prev) => {
      const updated = [newRow, ...prev];
      // Notify parent that a new row has been inserted:
      if (onTableDataChange) {
        onTableDataChange(updated);
      }
      return updated;
    });
  };

  // Helper: find and update a row by id
  const updateRowById = (id: string, newValues: Partial<RowData>) => {
    setRows((prev) => {
      const updated = prev.map((r) => {
        if (r.id !== id) return r;
        // merge in the new field(s)
        const updatedRow = { ...r, ...newValues };

        // attempt to compute pre‐mitigation score
        const p = Number(updatedRow.likelihood);
        const s = Number(updatedRow.impact);
        const pw = +riskConfig.probabilityWeightage;
        const sw = +riskConfig.severityWeightage;
        if (
          Number.isFinite(p) &&
          Number.isFinite(s) &&
          Number.isFinite(pw) &&
          Number.isFinite(sw)
        ) {
          const score = p * pw * s * sw;
          // lookup the matching riskRatingRange
          const range = (riskConfig.riskRatingRanges || []).find(
            (rr: any) => score >= rr.min && score <= rr.max
          );
          if (range) {
            // inject the _id so your select column will pick up the label/description
            updatedRow.existingRiskRatingId = range._id;
          }
        }

        return updatedRow;
      });

      if (onTableDataChange) {
        onTableDataChange(updated);
      }
      return updated;
    });
  };

  // Toggle inline edit for a single row (on double‐click)
  const handleRowDoubleClick = (id: string) => {
    if (editAll || inlineEditRows[id]) return; // do nothing if already editing
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    setOriginalRows((prev) => ({ ...prev, [id]: row }));
    setInlineEditRows((prev) => ({ ...prev, [id]: true }));
  };

  // Change handler for inline input
  const handleInlineChange = (rowId: string, fieldKey: string, value: any) => {
    updateRowById(rowId, { [fieldKey]: value });
  };

  const handleInlineSave = (rowId: string) => {
    const currentRow = rows.find((r) => r.id === rowId);

    if (!headerIsValid) {
      message.error("Please Fill the Header Form First!");
      return;
    }

    if (!currentRow) return;
    const { sNo, jobBasicStep } = currentRow;
    if (!sNo || !jobBasicStep) {
      message.error(
        `S. No., ${riskConfig?.secondaryClassification} and Registration Date are required`
      );
      return;
    }

    if (currentRow.requireRiskTreatment && !isImportMode) {
      const missingFields: string[] = [];

      if (!currentRow.additionalControlDescription)
        missingFields.push("• Description of Additional Controls");
      if (!currentRow.targetDate) missingFields.push("• Target Date");
      if (!currentRow.actualLikelihood)
        missingFields.push("• Actual Likelihood");
      if (!currentRow.actualImpact) missingFields.push("• Actual Impact");
      if (!currentRow.actualRiskRatingId)
        missingFields.push("• Actual Risk Rating");
      if (!currentRow.monitoringDetails)
        missingFields.push("• Monitoring Details");
      if (!currentRow.nextReviewDate) missingFields.push("• Next Review Date");
      if (!currentRow.responsibility) missingFields.push("• Responsibility");

      if (missingFields.length > 0) {
        message.error(
          {
            content: (
              <div>
                <b>Additional Info Required:</b>
                <br />
                {missingFields.map((field, idx) => (
                  <div key={idx}>{field}</div>
                ))}
              </div>
            ),
          },
          2
        );
        return;
      }
    }

    setInlineEditRows((prev) => ({ ...prev, [rowId]: false }));
    setOriginalRows((prev) => {
      const next = { ...prev };
      delete next[rowId];
      return next;
    });
    if (onSaveRow) {
      const row = rows.find((r) => r.id === rowId)!;
      onSaveRow(rowId, row);
    }
  };

  const handleInlineCancel = (rowId: string) => {
    const original = originalRows[rowId];
    if (original) {
      setRows((prev) => prev.map((r) => (r.id === rowId ? original : r)));
    }
    setInlineEditRows((prev) => ({ ...prev, [rowId]: false }));
    setOriginalRows((prev) => {
      const next = { ...prev };
      delete next[rowId];
      return next;
    });
  };

  const handleOpenModalForNew = () => {
    // Create a temporary new row with empty values
    const newId = `temp_${Date.now()}`;
    const blank: any = { id: newId };
    columns.forEach((col) => {
      if (col.inputType !== null && col.key !== "action") {
        let defaultValue: any;
        switch (col.inputType) {
          case "checkbox":
            defaultValue = false;
            break;
          case "radio":
            defaultValue = false;
            break;
          case "number":
            defaultValue = "";
            break;
          default:
            defaultValue = "";
        }
        blank[col.key] = defaultValue;
      }
    });

    // Append the temporary row to the end of the table
    setRows((prev) => [...prev, blank]);
    setModalRowId(newId);
    setIsCreating(true);
    setModalOpen(true);
  };

  // Open modal to edit one row
  const handleOpenModal = (row: RowData) => {
    setModalRowId(row.id);
    setIsCreating(false);
    setModalOpen(true);
  };

  // Handle modal field change - directly update the row in the table
  const handleModalFieldChange = (fieldKey: string, value: any) => {
    if (!modalRowId) return;
    updateRowById(modalRowId, { [fieldKey]: value });
  };

  // Save from modal
  const handleModalSave = () => {
    if (!modalRowId) return;

    const currentRow = rows.find((r) => r.id === modalRowId);
    if (!currentRow) return;

    const { sNo, jobBasicStep, regDate } = currentRow;
    if (!sNo || !jobBasicStep || !regDate) {
      message.error(
        `S. No., ${riskConfig?.secondaryClassification} and Registration Date are required`
      );
      return;
    }
    if (currentRow.requireRiskTreatment) {
      const missingFields: string[] = [];

      if (!currentRow.additionalControlDescription)
        missingFields.push("• Description of Additional Controls");
      if (!currentRow.targetDate) missingFields.push("• Target Date");
      if (!currentRow.actualLikelihood)
        missingFields.push("• Actual Likelihood");
      if (!currentRow.actualImpact) missingFields.push("• Actual Impact");
      if (!currentRow.actualRiskRatingId)
        missingFields.push("• Actual Risk Rating");
      if (!currentRow.monitoringDetails)
        missingFields.push("• Monitoring Details");
      if (!currentRow.nextReviewDate) missingFields.push("• Next Review Date");
      if (!currentRow.responsibility) missingFields.push("• Responsibility");

      if (missingFields.length > 0) {
        message.error(
          {
            content: (
              <div>
                <b>Additional Info Required:</b>
                <br />
                {missingFields.map((field, idx) => (
                  <div key={idx}>{field}</div>
                ))}
              </div>
            ),
          },
          2
        );
        return;
      }
    }

    // Guarantee a boolean for the checkbox
    currentRow.requireRiskTreatment = !!currentRow.requireRiskTreatment;

    if (isCreating) {
      // Convert temp row to permanent row
      const permanentId = `new_${Date.now()}`;
      updateRowById(modalRowId, { id: permanentId });
      setModalRowId(permanentId);
      if (onSaveRow) onSaveRow(permanentId, { ...currentRow, id: permanentId });
    } else {
      // Just save the existing row
      if (onSaveRow) onSaveRow(modalRowId, currentRow);
    }

    setModalOpen(false);
    setIsCreating(false);
    setModalRowId(null);
  };

  // Cancel modal
  const handleModalCancel = () => {
    if (isCreating && modalRowId) {
      // Remove the temporary row if canceling new row creation
      setRows((prev) => prev.filter((r) => r.id !== modalRowId));
      if (onTableDataChange) {
        onTableDataChange(rows.filter((r) => r.id !== modalRowId));
      }
    }
    setModalOpen(false);
    setIsCreating(false);
    setModalRowId(null);
  };

  // Helper function to get options from riskConfig based on column key
  const getOptionsForColumn = (
    columnKey: string,
    fallbackOptions: { value: any; label: string }[] = []
  ) => {
    if (!riskConfig) return fallbackOptions;

    switch (columnKey) {
      case "riskType":
        return riskConfig.riskTypeOptions || [];
      case "riskCondition":
        return riskConfig.riskConditionOptions || [];
      case "impactType":
        return riskConfig.impactTypeOptions || [];
      case "currentControl":
        return riskConfig.currentControlOptions || [];
      case "riskSource":
        return options?.riskSourceOptions || [];
      case "responsiblePerson":
        return options?.userOptions || [];
      case "existingRiskRatingId":
        return (riskConfig.riskRatingRanges || []).map((rr: any) => ({
          value: rr._id,
          label: rr.description,
        }));
      case "responsibility":
        return options?.userOptions || [];

      default:
        return fallbackOptions;
    }
  };

  // Toggle Edit All mode
  const handleToggleEditAll = () => {
    const newEditAll = !editAll;
    setEditAll(newEditAll);

    if (newEditAll) {
      // Mark every row as editable
      const markAll: { [id: string]: boolean } = {};
      rows.forEach((r) => {
        markAll[r.id] = true;
      });
      setInlineEditRows(markAll);
    } else {
      // Exiting Edit All: clear inline edits
      setInlineEditRows({});
      if (onSaveAllRows) onSaveAllRows(rows);
    }
  };

  // Save All (when in Edit All)
  const handleSaveAll = () => {
    if (!headerIsValid) {
      message.error("Please Fill the Header Form First!");
      return;
    }

    const basicErrors = rows
      .map((row, index) => {
        const { sNo, jobBasicStep } = row;
        if (!sNo || !jobBasicStep) {
          return `Row ${index + 1}: S. No., ${
            riskConfig?.secondaryClassification
          } are required`;
        }
        return null;
      })
      .filter(Boolean) as string[];

    // collect additional‐info errors
    // const additionalErrors = rows.flatMap((row, index) => {
    //   if (!row.requireRiskTreatment) return [];
    //   const missing: string[] = [];
    //   if (!row.additionalControlDescription)
    //     missing.push("Description of Additional Controls");
    //   if (!row.targetDate) missing.push("Target Date");
    //   if (!row.actualLikelihood) missing.push("Actual Likelihood");
    //   if (!row.actualImpact) missing.push("Actual Impact");
    //   if (!row.actualRiskRatingId) missing.push("Actual Risk Rating");
    //   if (!row.monitoringDetails) missing.push("Monitoring Details");
    //   if (!row.nextReviewDate) missing.push("Next Review Date");
    //   if (!row.responsibility) missing.push("Responsibility");

    //   return missing.map((field) => `Row ${index+1}: ${field}`);
    // });

    // const allErrors = [...basicErrors, ...additionalErrors];
    // if (allErrors.length) {
    //   message.error(
    //     {
    //       content: (
    //         <div>
    //           {allErrors.map((err, idx) => (
    //             <div key={idx}>{err}</div>
    //           ))}
    //         </div>
    //       ),
    //     },
    //     2
    //   );
    //   return;
    // }

    setEditAll(false);
    setInlineEditRows({});
    if (onSaveAllRows) onSaveAllRows(rows);
  };

  // Cancel All (revert inline edits if desired)
  // (Note: To truly revert, you'd need to keep an original copy. Here we simply exit edit mode.)
  const handleCancelAll = () => {
    setEditAll(false);
    setInlineEditRows({});
  };

  // Render a single cell (inline or display)
  const renderCellContent = (row: RowData, col: Column) => {
    const { key: fieldKey, inputType, options = [] } = col;
    const isEditingRow = !!inlineEditRows[row.id];

    if (col.key === "existingRiskRatingId") {
      const range = riskConfig?.riskRatingRanges?.find(
        (rr: any) => rr._id === row.existingRiskRatingId
      );
      return <div style={{ width: "250px" }}>{range?.description ?? ""}</div>;
    }

    // Action column: pencil icon to open modal
    if (fieldKey === "action" && !isImportMode) {
      if (inlineEditRows[row.id]) {
        return (
          <Box display="flex" alignItems="center" gridGap={8}>
            <IconButton size="small" onClick={() => handleInlineSave(row.id)}>
              <SaveIcon style={{ fontSize: 21, color: "rgb(0, 48, 89)" }} />
            </IconButton>
            <IconButton size="small" onClick={() => handleInlineCancel(row.id)}>
              <CancelIcon style={{ fontSize: 24, color: "#CD5C5C" }} />
            </IconButton>
          </Box>
        );
      }

      return (
        <Box display="flex" alignItems="center" gridGap={1}>
          <IconButton
            size="medium"
            onClick={() => handleOpenModal(row)}
            style={{ padding: "3px" }}
          >
            <EditIcon style={{ fontSize: 21, color: "rgb(0, 48, 89)" }} />
          </IconButton>
          <IconButton
            size="medium"
            style={{ padding: "3px" }}
            onClick={() => onDeleteRow && onDeleteRow(row.id)}
          >
            <DeleteIcon style={{ fontSize: 24, color: "#CD5C5C" }} />
          </IconButton>
        </Box>
      );
    }

    if (!isEditingRow && col.render) {
      // console.log("checkr8 insice col render");

      return col.render(row[col.key], row);
    }

    if (!isEditingRow) {
      // Display mode
      // pull the raw value either from top-level or nested riskDetails
      let raw = row[fieldKey];
      if (raw == null) {
        switch (fieldKey) {
          case "riskType":
            raw = row.riskDetails?.riskTypeId;
            break;
          case "riskCondition":
            raw = row.riskDetails?.riskConditionId;
            break;
          case "currentControl":
            raw = row.riskDetails?.currentControlId;
            break;
          case "impactType":
            raw =
              row.riskDetails?.impactType?.id ??
              row.riskDetails?.impactType?.text;
            break;
          case "riskSource":
            raw = row.riskSource;
            break;
          case "regDate":
            raw = row.regDate;
            break;
          case "targetDate":
            raw = row.targetDate;
            break;
        }
      }

      if (fieldKey === "requireRiskTreatment") {
        return <div>{row.requireRiskTreatment ? "Yes" : "No"}</div>;
      }

      if (fieldKey === "residualRiskAccepted") {
        return <div>{row.residualRiskAccepted ? "Yes" : "No"}</div>;
      }

      if (inputType === "multiselect") {
        const opts = getOptionsForColumn(fieldKey, options);
        const raw: any[] = Array.isArray(row[fieldKey]) ? row[fieldKey] : [];
        const labels = opts
          .filter((o: any) => raw.includes(o.value))
          .map((o: any) => o.label)
          .join(", ");
        return <div style={{ width: "250px" }}>{labels}</div>;
      }

      if (inputType === "select") {
        const selectOptions = getOptionsForColumn(fieldKey, options);
        const found = selectOptions.find((opt: any) => opt.value === raw);
        return <div style={{ width: "250px" }}>{found?.label ?? ""}</div>;
      }
      // otherwise just render the raw value (dates or text/number)
      return <div style={{ width: "250px" }}>{raw ?? ""}</div>;
    }

    // Inline editing mode
    const commonInputProps = {
      style: { width: "100%" },
      value:
        row[fieldKey] === null || row[fieldKey] === undefined
          ? ""
          : row[fieldKey],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        if (inputType === "number") {
          handleInlineChange(row.id, fieldKey, v === "" ? "" : Number(v));
        } else {
          handleInlineChange(row.id, fieldKey, v);
        }
      },
    };

    switch (inputType) {
      case "text":
        return <Input {...commonInputProps} />;
      case "number": {
        const isSno = fieldKey === "sNo";
        return (
          <Input
            style={{ width: "100%" }}
            type="text"
            value={row[fieldKey] ?? ""}
            onKeyPress={(e) => {
              // only digits
              if (!/[0-9]/.test(e.key)) e.preventDefault();
            }}
            onChange={(e) => {
              const raw = e.target.value;
              const num = raw === "" ? "" : Number(raw);
              if (isSno) {
                // any digit(s) OK
                handleInlineChange(row.id, fieldKey, num);
              } else {
                // only allow 1–5
                if (num === "" || (num >= 1 && num <= 5)) {
                  handleInlineChange(row.id, fieldKey, num);
                }
              }
            }}
          />
        );
      }

      case "select":
        const selectOptions = getOptionsForColumn(fieldKey, options);
        // console.log("checkr fieldkey and options", fieldKey, selectOptions);

        return (
          <Select
            value={row[fieldKey]}
            onChange={(val) => handleInlineChange(row.id, fieldKey, val)}
            style={{ width: "100%" }}
          >
            {selectOptions.map((opt: { value: any; label: string }) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        );

      case "multiselect": {
        // grab whatever options belong to this column
        const opts = getOptionsForColumn(fieldKey, options);
        // ensure we have an array of selected values
        const rawValues: any[] = Array.isArray(row[fieldKey])
          ? row[fieldKey]
          : [];

        if (fieldKey === "responsibility") {
          // inline‐edit your CustomMultiSelect
          return (
            <div style={{ width: "280px" }}>
              <CustomMultiSelect
                label=""
                placeholder="Select Responsibility"
                options={opts}
                selectedValues={rawValues}
                onChange={(vals: string[]) =>
                  handleInlineChange(row.id, fieldKey, vals)
                }
                disabled={!inlineEditRows[row.id]}
                maxTagCount={2}
                showRole
              />
            </div>
          );
        }

        // if it’s *any other* multiselect, just show comma-joined labels
        const labels = opts
          .filter((o: any) => rawValues.includes(o.value))
          .map((o: any) => o.label)
          .join(", ");
        return <div>{labels}</div>;
      }

      case "textarea":
        return (
          <TextareaAutosize
            value={
              row[fieldKey] === null || row[fieldKey] === undefined
                ? ""
                : row[fieldKey]
            }
            onChange={(e: any) => {
              const v = e.target.value;
              handleInlineChange(row.id, fieldKey, v);
            }}
            rows={2}
            style={{ width: "250px" }}
          />
        );
      case "date":
        return (
          <DatePicker
            // parse the ISO string automatically
            value={
              row[fieldKey]
                ? dayjs(row[fieldKey]) // no format here
                : undefined
            }
            format="DD-MM-YYYY" // how it displays
            onChange={(date) =>
              handleInlineChange(
                row.id,
                fieldKey,
                date ? date.toISOString() : "" // store ISO again
              )
            }
            style={{ width: "160px" }}
            getPopupContainer={(trigger) => trigger.parentNode as HTMLElement}
          />
        );

      case "radio":
        return (
          <Radio.Group
            value={row[fieldKey]}
            onChange={(e) =>
              handleInlineChange(row.id, fieldKey, e.target.value)
            }
          >
            <Radio value={true}>Yes</Radio>
            <Radio value={false}>No</Radio>
          </Radio.Group>
        );

      default:
        return <div>{row[fieldKey]}</div>;
    }
  };

  const renderField = (col: Column) => {
    const val = rows.find((r) => r.id === modalRowId)?.[col.key];
    const isCheckbox = col.inputType === "checkbox";

    if (col.key === "existingRiskRatingId") {
      const val = rows.find((r) => r.id === modalRowId)?.existingRiskRatingId;
      const desc = riskConfig?.riskRatingRanges?.find(
        (rr: any) => rr._id === val
      )?.description;
      return (
        <Grid item xs={12} sm={6} md={4} key={col.key}>
          <Typography className={classes.formFieldLabel}>
            {col.label}
          </Typography>
          <Typography>{desc}</Typography>
        </Grid>
      );
    }

    return (
      <Grid item xs={12} sm={6} md={4} key={col.key}>
        {/* Label + Checkbox in one line (only for checkbox) */}
        {isCheckbox ? (
          <Box display="flex" alignItems="baseline" gridGap={1} mt={1}>
            <Typography className={classes.formFieldLabel}>
              {col.label}
            </Typography>
            <Checkbox
              checked={!!val}
              onChange={(e) =>
                handleModalFieldChange(col.key, e.target.checked)
              }
              style={{
                transform: "scale(1.3)", // increase size
                marginLeft: "12px", // spacing from label
                marginTop: "-2px", // fine-tune vertical alignment
              }}
            />
          </Box>
        ) : (
          <Typography className={classes.formFieldLabel}>
            {col.label}
            {(requiredFields.has(col.key) ||
              (activeTab === "additionalInfo" &&
                rows.find((r) => r.id === modalRowId)?.requireRiskTreatment &&
                [
                  "additionalControlDescription",
                  "monitoringDetails",
                  "nextReviewDate",
                  "responsiblePerson",
                  "targetDate",
                  "actualLikelihood",
                  "actualImpact",
                  "riskManagementDecisionId",
                  "actualRiskRatingId",
                  "currentControlEffectivenessId",
                  "residualRiskAccepted",
                  "responsibility",
                ].includes(col.key))) && <sup style={{ color: "red" }}>*</sup>}
          </Typography>
        )}

        {!isCheckbox && col.inputType === "radio" && (
          <Radio.Group
            value={val}
            onChange={(e) => handleModalFieldChange(col.key, e.target.value)}
            style={{ marginTop: 8 }}
          >
            <Radio value={true}>Yes</Radio>
            <Radio value={false}>No</Radio>
          </Radio.Group>
        )}

        {/* Inputs for other types */}
        {!isCheckbox && col.inputType === "number" && (
          <Input
            type="text"
            value={val ?? ""}
            onKeyPress={(e) => {
              if (!/[0-9]/.test(e.key)) e.preventDefault();
            }}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === "" || /^\d+$/.test(raw)) {
                handleModalFieldChange(col.key, raw === "" ? "" : Number(raw));
              }
            }}
            size="large"
            placeholder={`Enter ${col.label}`}
            style={{ borderRadius: 6, padding: "12px" }}
          />
        )}

        {!isCheckbox && col.inputType === "textarea" && (
          <TextareaAutosize
            minRows={2}
            placeholder={`Enter ${col.label.toLowerCase()}…`}
            value={val || ""}
            onChange={(e) => handleModalFieldChange(col.key, e.target.value)}
            style={{
              width: "94%",
              borderRadius: 6,
              borderColor: "#d9d9d9",
              padding: "12px",
              fontSize: "1rem",
            }}
          />
        )}

        {!isCheckbox && col.inputType === "date" && (
          <DatePicker
            value={val ? dayjs(val) : undefined}
            format="DD-MM-YYYY"
            onChange={(date) =>
              handleModalFieldChange(col.key, date?.toISOString() ?? "")
            }
            style={{ width: "100%", borderRadius: 6 }}
            getPopupContainer={(trigger) => trigger.parentNode as HTMLElement}
          />
        )}

        {!isCheckbox && col.inputType === "select" && (
          <Select
            value={val}
            onChange={(v) => handleModalFieldChange(col.key, v)}
            placeholder={`Select ${col.label}`}
            size="large"
            style={{ width: "100%", borderRadius: 6 }}
            getPopupContainer={(trigger) => trigger.parentNode as HTMLElement}
            dropdownStyle={{ zIndex: 2000 }}
          >
            {getOptionsForColumn(col.key, col.options).map((opt: any) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        )}

        {!isCheckbox && col.inputType === "multiselect" && (
          <CustomMultiSelect
            label={""}
            placeholder={`Select ${col.label}`}
            options={getOptionsForColumn(col.key, [])}
            selectedValues={val || []}
            onChange={(vals: string[]) => handleModalFieldChange(col.key, vals)}
            showRole
            // any other props you need…
          />
        )}
      </Grid>
    );
  };

  return (
    <>
      {/* Toolbar with Edit All / Save All / Cancel */}
      <Toolbar className={classes.toolbar}>
        <Box
          display="flex"
          alignItems="center"
          gridGap={2}
          justifyContent="end"
        >
          {isImportMode && Object.keys(inlineEditRows)?.length > 0 && (
            <PrimaryButton buttonText="Save All" onClick={handleSaveAll} />
          )}
          <PrimaryButton
            buttonText={`Add ${riskConfig?.secondaryClassification}`}
            onClick={() => {
              if (!headerIsValid) {
                message.error("Please Fill the Header Form First!");
                return;
              } else {
                handleOpenModalForNew();
              }
            }}
            // disabled={!headerIsValid}
          />
          <SecondaryButton
            buttonText="Import Sheet"
            onClick={() => {
              setIsImportMode(true);
              setImportModal({ open: true });
            }}
          />
        </Box>
      </Toolbar>

      {/* Table */}
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((col, idx) => {
                // pick the correct sticky header class
                const stickyCls =
                  idx === 0
                    ? classes.stickyHeader1
                    : idx === 1
                    ? classes.stickyHeader2
                    : idx === 2
                    ? classes.stickyHeader3
                    : idx === columns.length - 1
                    ? classes.stickyLastHeader
                    : "";

                return (
                  <TableCell
                    key={col.key}
                    className={`${classes.headerCell} ${stickyCls}`}
                    style={{ width: col.width || "auto" }}
                  >
                    {col.label}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row) => {
              const isEditing = !!inlineEditRows[row.id];
              return (
                <TableRow
                  key={row.id}
                  hover
                  onDoubleClick={() => handleRowDoubleClick(row.id)}
                  selected={isEditing}
                >
                  {columns.map((col, idx) => {
                    const isAction = col.key === "action";
                    // pick the correct sticky body class
                    const stickyBodyCls =
                      idx === 0
                        ? classes.stickyBody1
                        : idx === 1
                        ? classes.stickyBody2
                        : idx === 2
                        ? classes.stickyBody3
                        : isAction
                        ? classes.stickyLastBody
                        : classes.bodyCell;

                    return (
                      <TableCell
                        key={`${row.id}-${col.key}`}
                        className={`${classes.inputCell} ${stickyBodyCls} ${
                          isAction ? classes.stickyLastBody : stickyBodyCls
                        }`}
                        style={{ width: col.width || "auto" }}
                      >
                        {isAction && !isImportMode ? (
                          // action column: inline-save or edit/delete
                          isEditing ? (
                            <Box display="flex" gridGap={8}>
                              <IconButton
                                size="small"
                                style={{
                                  fontSize: 21,
                                  color: "rgb(0, 48, 89)",
                                }}
                                onClick={() => handleInlineSave(row.id)}
                              >
                                <SaveIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleInlineCancel(row.id)}
                                style={{ fontSize: 24, color: "#CD5C5C" }}
                              >
                                <CancelIcon />
                              </IconButton>
                            </Box>
                          ) : (
                            <Box display="flex" gridGap={8}>
                              <IconButton onClick={() => handleOpenModal(row)}>
                                <EditIcon />
                              </IconButton>
                              <IconButton onClick={() => onDeleteRow?.(row.id)}>
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          )
                        ) : (
                          // everything else delegates to your renderer (handles inline inputs vs read-only)
                          renderCellContent(row, col)
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {!isImportMode && (
        <div
          className={classes.pagination}
          style={{ textAlign: "right", marginTop: 8 }}
        >
          <Pagination
            size="small"
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            showTotal={(total) => `Total ${total} items`}
            showSizeChanger
            showQuickJumper
            onChange={handleChangePage}
          />
        </div>
      )}

      {/* Modal for single‐row editing */}
      <Dialog
        open={modalOpen}
        onClose={handleModalCancel}
        fullWidth
        maxWidth="lg"
        aria-labelledby="edit-row-dialog-title"
      >
        <DialogTitle id="edit-row-dialog-title">
          {isCreating
            ? `Add ${riskConfig?.secondaryClassification}`
            : `Edit ${riskConfig?.secondaryClassification}`}
        </DialogTitle>

        <DialogContent
          dividers
          style={{ overflowX: "hidden", overflowY: "auto" }}
        >
          {modalRowId && (
            <>
              <div className={classes.tabsWrapper} style={{ marginBottom: 10 }}>
                <Tabs
                  type="card"
                  activeKey={activeTab}
                  onChange={(k) => setActiveTab(k as any)}
                  animated={{ inkBar: true, tabPane: true }}
                  items={[
                    { key: "riskInfo", label: "Risk Info", children: null },
                    {
                      key: "additionalInfo",
                      label: "Additional Info",
                      children: null,
                    },
                  ]}
                />
              </div>

              <Grid container spacing={2}>
                {columns
                  .filter((col) => col.inputType && col.key !== "action")
                  .filter((col) =>
                    activeTab === "riskInfo"
                      ? ![
                          "additionalControlDescription",
                          "monitoringDetails",
                          "nextReviewDate",
                          "responsiblePerson",
                          "targetDate",
                          "actualLikelihood",
                          "actualImpact",
                          "riskManagementDecisionId",
                          "actualRiskRatingId",
                          "currentControlEffectivenessId",
                          "responsibility",
                          "residualRiskAccepted",
                        ].includes(col.key)
                      : [
                          "additionalControlDescription",
                          "monitoringDetails",
                          "nextReviewDate",
                          "responsiblePerson",
                          "targetDate",
                          "actualLikelihood",
                          "actualImpact",
                          "riskManagementDecisionId",
                          "actualRiskRatingId",
                          "currentControlEffectivenessId",
                          "responsibility",
                          "residualRiskAccepted",
                        ].includes(col.key)
                  )
                  .map(renderField)}
              </Grid>
            </>
          )}
        </DialogContent>

        <DialogActions>
          <SecondaryButton onClick={handleModalCancel} buttonText="Cancel" />
          <PrimaryButton onClick={handleModalSave} buttonText="Save" />
        </DialogActions>
      </Dialog>

      {importModal.open && (
        <Modal
          title="Import Risks"
          visible
          onCancel={() => setImportModal({ open: false })}
          width="50%"
          footer={
            <div style={{ textAlign: "right" }}>
              {fileList.length > 0 && (
                <PrimaryButton
                  buttonText="Upload File"
                  onClick={handleImportHira}
                  loading={isSheetLoading}
                />
              )}
            </div>
          }
        >
          <div
            style={{ maxHeight: "600px", overflowY: "auto", padding: "10px" }}
          >
            {/* Instructions box */}
            <div
              style={{
                backgroundColor: "#f8f9fa",
                padding: "12px",
                borderRadius: 5,
                border: "1px solid #d1d1d1",
                marginBottom: 15,
              }}
            >
              <AntTypography.Title level={5} style={{ marginBottom: 10 }}>
                📌 Please Read Before Uploading:
              </AntTypography.Title>
              <ul style={{ paddingLeft: 18, fontSize: 14 }}>
                <li>
                  Please Make Sure All the required fields are filled in the
                  sheet.
                </li>
                <li>
                  Please Enter the Exact Sheet Name to be imported. As there are
                  multiple sheets in the file.
                </li>
                <li>
                  Please Enter the Row Number from where the actual Risks are
                  starting.
                </li>
                <li>
                  Responsiblity has to be selected from the dropdown for each
                  risk once the sheet is uploaded
                </li>
              </ul>
            </div>

            <Form layout="vertical">
              {/* File Upload */}
              <Form.Item label="Attach File:">
                <Upload.Dragger
                  {...uploadProps}
                  fileList={fileList}
                  showUploadList
                >
                  <p className="ant-upload-drag-icon">
                    <InboxIcon style={{ fontSize: 40, color: "#1890ff" }} />
                  </p>
                  <p className="ant-upload-text">
                    Click or drag file to this area to upload
                  </p>
                </Upload.Dragger>
              </Form.Item>
              <>
                <Form.Item label="Sheet to be imported:">
                  <Input
                    placeholder="Enter sheet name"
                    value={selectedSheetName}
                    onChange={(e) => setSelectedSheetName(e.target.value)}
                  />
                </Form.Item>
                <Form.Item label="Risks Starting From Row:">
                  <InputNumber
                    min={1}
                    value={selectedStepsStartingFromRow}
                    onChange={(val) =>
                      setSelectedStepsStartingFromRow(val || 1)
                    }
                  />
                </Form.Item>
              </>
            </Form>
          </div>
        </Modal>
      )}
    </>
  );
}
