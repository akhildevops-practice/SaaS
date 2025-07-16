import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@material-ui/core";
import {
  Typography,
  TextField,
  IconButton,
  Checkbox,
  FormControlLabel,
  Tooltip,
  Button,
  Grid,
  Box,
  Collapse,
  Divider,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@material-ui/core";
import {
  AiOutlineInfoCircle,
  AiOutlinePlus,
  AiOutlineDelete,
} from "react-icons/ai";
import { MdExpandMore } from "react-icons/md";
import TextareaAutosize from "@material-ui/core/TextareaAutosize";
import {
  Input,
  Button as AntButton,
  Modal,
  message,
  Typography as AntTypography,
} from "antd";
import { FaEdit } from "react-icons/fa";
import { FaRegWindowClose } from "react-icons/fa";
import { makeStyles } from "@material-ui/core/styles";
import checkRoles from "utils/checkRoles";
import RiskLevelIndicatorTable from "components/RiskRegister/RiskConfiguration/RiskConfifurationFormStepper/RiskConfigurationStepperForm2/RiskLevelIndicatorTable";
import getSessionStorage from "utils/getSessionStorage";
import axios from "apis/axios.global";
import { useLocation, useNavigate } from "react-router-dom";
import PrimaryButton from "components/ReusableComponents/PrimaryButton";
import { MdOutlineArrowBackIos } from "react-icons/md";
import SecondaryButton from "components/ReusableComponents/SecondaryButton";
import ScoreLabelModal from "./ScoreLabelModal";
import RiskIndicatorTable from "./RiskIndicatorTable";
import RiskRatingModal from "./RiskRatingModal";

const useStyles = makeStyles(() => ({
  titleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  matrixContainer: {
    overflowX: "auto",
    marginTop: 16,
  },
  minWidthWrapper: {
    minWidth: 900,
  },
  headerCell: {
    backgroundColor: "#1e90ff",
    color: "#fff",
    height: 52,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    marginRight: 4,
    fontWeight: 500,
    fontSize: "14px",
  },
  verticalHeaderWrapper: {
    backgroundColor: "#1e90ff",
    color: "#fff",
    padding: 16,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  verticalLabel: {
    writingMode: "vertical-rl",
    transform: "rotate(180deg)",
    textAlign: "center",
    fontWeight: 500,
    fontSize: "1rem",
    cursor: "pointer",
  },
  labelColumn: {
    display: "flex",
    flexDirection: "column",
    width: 200,
    marginRight: 4,
  },
  matrixGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: 4,
    marginBottom: 4,
  },
  matrixCell: {
    padding: 12,
    color: "#fff",
    cursor: "pointer",
    height: 80,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    fontSize: 12,
    fontWeight: 500,
    borderRadius: 4,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  labelCell: {
    backgroundColor: "#1e90ff",
    color: "#fff",
    textAlign: "center",
    height: 80,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 500,
    fontSize: 14,
    position: "relative",
    "&:hover .edit-icon": {
      opacity: 1,
    },
  },

  dialogLevel: {
    height: 32,
    borderRadius: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: "bold",
  },

  tableHeader: {
    fontSize: "1rem",
    fontWeight: "bold",
    margin: "8px",
  },
}));

const { Title } = AntTypography;

const OptionDisplayArea = ({
  label,
  options,
  onAddNew,
  onRemove,
  showDescription = false,
  tooltip,
}: any) => (
  <Box mb={2}>
    <Box display="flex" alignItems="center" mb={1}>
      <Typography
        variant="subtitle1"
        style={{
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 4, // Tailwind's `gap-1` = 4px
        }}
      >
        {label}
        {tooltip && (
          <Tooltip title={tooltip}>
            <AiOutlineInfoCircle
              fontSize="small"
              style={{ color: "#888", cursor: "pointer", marginLeft: 4 }}
            />
          </Tooltip>
        )}
      </Typography>

      <AntButton
        onClick={onAddNew}
        type="default"
        shape="circle"
        icon={<AiOutlinePlus style={{ fontSize: 12 }} />}
        size="small"
        style={{
          width: 24,
          height: 24,
          minWidth: 24,
          padding: 0,
          borderRadius: 6,
          borderColor: "#d9d9d9",
          marginLeft: 8,
        }}
      />
    </Box>
    <Box border={1} borderRadius={8} p={2} bgcolor="#f9f9f9" minHeight={100}>
      {options?.length === 0 ? (
        <Typography variant="body2" color="textSecondary" align="center">
          No options added yet. Click the + button to add options.
        </Typography>
      ) : (
        <Grid container spacing={1}>
          {options?.map((option: any) => (
            <Grid item xs={12} sm={6} md={4} key={option._id || option.tempId}>
              <Paper
                variant="outlined"
                style={{ padding: 8, position: "relative" }}
              >
                <Box display="flex" justifyContent="space-between">
                  <Box>
                    <Typography variant="subtitle2">{option.label}</Typography>
                    {showDescription && option.description && (
                      <Typography variant="caption" color="textSecondary">
                        {option.description}
                      </Typography>
                    )}
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => onRemove(option._id || option.tempId)}
                    style={{ color: "red" }}
                  >
                    <AiOutlineDelete fontSize="small" />
                  </IconButton>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  </Box>
);

const getRiskColor = (level: string) => {
  switch (level.toLowerCase()) {
    case "low":
      return "#28a745"; // green
    case "medium":
      return "#ffc107"; // yellow
    case "high":
      return "#fd7e14"; // orange
    case "critical":
      return "#dc3545"; // red
    default:
      return "#e0e0e0"; // grey
  }
};

const hasEmptyObjectInArrayS = (array: any[]) => {
  return array.some((item) => {
    return item.riskIndicator === "" && item.riskLevel === "";
  });
};

const RiskConfigurationForm = () => {
  const classes = useStyles();
  const userDetails = getSessionStorage();
  const location = useLocation();
  const navigate = useNavigate();
  const getDefaultMatrix = (probLabels: string[], sevLabels: string[]) => {
    const obj: any = {};
    probLabels.forEach((prob, pIdx) => {
      obj[prob] = {};
      sevLabels.forEach((sev, sIdx) => {
        const score = (pIdx + 1) * (sIdx + 1);
        obj[prob][sev] = {
          score,
          riskLevel:
            score <= 6
              ? "low"
              : score <= 12
              ? "medium"
              : score <= 20
              ? "high"
              : "critical",
          description: "",
        };
      });
    });
    return obj;
  };

  const [riskConfigForm, setRiskConfigForm] = useState<any>({
    riskCategory: "",
    riskTypeOptions: [],
    riskConditionOptions: [],
    currentControlOptions: [],
    impactTypeFormat: "dropdown",
    impactTypeOptions: [],
    showExistingTargetRiskLevels: false,
    primaryClassification: "",
    secondaryClassification: "",
    tertiaryClassification: "",
    probabilityAxisLabel: "Probability",
    severityAxisLabel: "Severity",
    probabilityWeightage: 1,
    severityWeightage: 1,
    probabilityLabels: ["Rare", "Unlikely", "Possible", "Likely", "Frequent"],
    severityLabels: [
      "Negligible",
      "Minor",
      "Moderate",
      "Critical",
      "Catastrophic",
    ],
    existingRiskRatingOptions: [],
    targetRiskRatingOptions: [],
    existingKeyControlOptions: [],
    actualRiskRatingOptions: [],
    currentControlEffectivenessOptions: [],
    riskManagementDecisionOptions: [],
    riskMatrix: getDefaultMatrix(
      ["Rare", "Unlikely", "Possible", "Likely", "Frequent"],
      ["Negligible", "Minor", "Moderate", "Critical", "Catastrophic"]
    ), // Will be set right after initialization

    riskLevelData: [
      {
        riskIndicator: "Low Risk",
        color: "#52c41a",
        comparator: "<=",
        value: 3,
        description: "description",
      },
      {
        riskIndicator: "Medium Risk",
        color: "#faad14",
        comparator: "<=",
        value: 9,
        description: "teasdf",
      },
      {
        riskIndicator: "High Risk",
        color: "#ff8c00",
        comparator: "<=",
        value: 12,
        description: "asdasd",
      },
      {
        riskIndicator: "Extreme Risk",
        color: "#f5222d",
        comparator: "<=",
        value: 25,
        description: "updated",
      },
    ],
    riskRatingRanges: [] as Array<{
      tempId: string;
      min: number;
      max: number;
      description: string;
    }>,
    newRiskRating: {
      min: "",
      max: "",
      description: "",
    },
  });

  const [initialConfig, setInitialConfig] = useState<any>(null);


  const [labelConfigExpanded, setLabelConfigExpanded] = useState<any>(true);

  // Dialog visibility
  const [showRiskTypeDialog, setShowRiskTypeDialog] = useState(false);
  const [showRiskConditionDialog, setShowRiskConditionDialog] = useState(false);
  const [showCurrentControlDialog, setShowCurrentControlDialog] =
    useState(false);
  const [showImpactTypeFormatDialog, setShowImpactTypeFormatDialog] =
    useState(false);
  const [showImpactTypeDialog, setShowImpactTypeDialog] = useState(false);
  const [showExistingRiskRatingDialog, setShowExistingRiskRatingDialog] =
    useState(false);
  const [showTargetRiskRatingDialog, setShowTargetRiskRatingDialog] =
    useState(false);
  const [showExistingKeyControlDialog, setShowExistingKeyControlDialog] =
    useState(false);
  const [showActualRiskRatingDialog, setShowActualRiskRatingDialog] =
    useState(false);
  const [
    showCurrentControlEffectivenessDialog,
    setShowCurrentControlEffectivenessDialog,
  ] = useState(false);
  const [
    showRiskManagementDecisionDialog,
    setShowRiskManagementDecisionDialog,
  ] = useState(false);

  const [showRiskRatingModal, setShowRiskRatingModal] = useState<any>(false);

  // --- Shared inputs for NumberSettingModal ---
  const [newNumberValue, setNewNumberValue] = useState("");
  const [newNumberDescription, setNewNumberDescription] = useState("");

  // Inputs
  const [newOptionLabel, setNewOptionLabel] = useState("");
  const [newOptionDescription, setNewOptionDescription] = useState("");
  const [newImpactTypeLabel, setNewImpactTypeLabel] = useState("");
  const [newImpactTypeDescription, setNewImpactTypeDescription] = useState("");

  const [editingProbabilityAxis, setEditingProbabilityAxis] = useState(false);
  const [editingSeverityAxis, setEditingSeverityAxis] = useState(false);
  const [tempProbabilityAxisLabel, setTempProbabilityAxisLabel] = useState("");
  const [tempSeverityAxisLabel, setTempSeverityAxisLabel] = useState("");

  const [editingLabel, setEditingLabel] = useState<{
    type: "probability" | "severity";
    index: number;
  } | null>(null);
  const [tempLabel, setTempLabel] = useState("");

  const [selectedCell, setSelectedCell] = useState<{
    prob: string;
    sev: string;
  } | null>(null);
  const [editingDescription, setEditingDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [tableDataS, setTableDataS] = useState<any>([]);
  const isMCOE = checkRoles("ORG-ADMIN") && !!userDetails?.location?.id;

  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isMR = checkRoles("MR");
  const canEdit = isOrgAdmin || isMR;
  const EMPTY_ROW_S = {
    riskIndicator: "",
    // riskColor : "",
    riskLevel: "",
    description: "",
  };
  const significanceCols = [
    {
      header: "Risk Indicator*",
      accessorKey: "riskIndicator",
    },
    {
      header: "Description*",
      accessorKey: "description",
    },
    {
      header: "Risk Level*",
      accessorKey: "riskLevel",
    },
  ];

  useEffect(() => {
    setLoading(true);
    if (location?.state?.edit) {
      getRiskConfigById();
    } else {
      createInitialRiskConfig();
    }
  }, [location?.state?.id]);

  useEffect(() => {
    if (!loading) {
      const riskLevelData = riskConfigForm?.riskLevelData as any[];
      // console.log("risk significance data", riskSignificanceData);

      if (riskLevelData?.length > 0 && canEdit) {
        if (!hasEmptyObjectInArrayS(riskLevelData)) {
          riskLevelData.push(EMPTY_ROW_S);
        }
      } else {
        if (canEdit) riskLevelData.push(EMPTY_ROW_S);
      }
      setTableDataS([...riskLevelData]);
    }
  }, [riskConfigForm]);

  // useEffect(() => {
  //   console.log("riskConfigForm", riskConfigForm);
  // }, [riskConfigForm]);

  const createInitialRiskConfig = () => {
    const probabilityLabels = [
    "Rare",
      "Unlikely",
      "Moderate",
      "Likely",
      "Almost Certain",
    ];
    const severityLabels = [
      
      "Very Low",
      "Low",
      "Medium",
      "High",
      "Very High",
    ];

    const getDefaultMatrix = (probLabels: string[], sevLabels: string[]) => {
      const obj: any = {};
      probLabels.forEach((prob, pIdx) => {
        obj[prob] = {};
        sevLabels.forEach((sev, sIdx) => {
          const score = (pIdx + 1) * (sIdx + 1);
          obj[prob][sev] = {
            score,
            riskLevel:
              score <= 6
                ? "low"
                : score <= 12
                ? "medium"
                : score <= 20
                ? "high"
                : "critical",
            description: "",
          };
        });
      });
      return obj;
    };

    setRiskConfigForm({
      riskCategory: "",
      riskTypeOptions: [],
      riskConditionOptions: [],
      currentControlOptions: [],
      impactTypeOptions: [],
      impactTypeFormat: "dropdown",
      showExistingTargetRiskLevels: false,
      primaryClassification: "",
      secondaryClassification: "",
      tertiaryClassification: "",
      probabilityAxisLabel: "Likelihood",
      severityAxisLabel: "Impact",
      probabilityWeightage: 1,
      severityWeightage: 1,
      probabilityLabels,
      severityLabels,
      riskMatrix: getDefaultMatrix(probabilityLabels, severityLabels),
      existingRiskRatingOptions: [
        {
          label: "1",
          description: "Very Low",
        },
        {
          label: "2",
          description: "Low",
        },
        {
          label: "3",
          description: "Medium",
        },
        {
          label: "4",
          description: "High",
        },
        {
          label: "5",
          description: "Very High",
        },
      ],
      targetRiskRatingOptions: [
        {
          label: "1",
          description: "Very Low",
        },
        {
          label: "2",
          description: "Low",
        },
        {
          label: "3",
          description: "Medium",
        },
        {
          label: "4",
          description: "High",
        },
        {
          label: "5",
          description: "Very High",
        },
      ],
      existingKeyControlOptions: [
        { label: "1", description: "Non-existent" },
        { label: "2", description: "Poor" },
        { label: "3", description: "Fair" },
        { label: "4", description: "Good" },
        { label: "5", description: "Very good" },
      ],
      actualRiskRatingOptions: [
        {
          label: "1",
          description: "Very Low",
        },
        {
          label: "2",
          description: "Low",
        },
        {
          label: "3",
          description: "Medium",
        },
        {
          label: "4",
          description: "High",
        },
        {
          label: "5",
          description: "Very High",
        },
      ],
      currentControlEffectivenessOptions: [
        { label: "1", description: "Non-existent" },
        { label: "2", description: "Poor" },
        { label: "3", description: "Fair" },
        { label: "4", description: "Good" },
        { label: "5", description: "Very good" },
      ],
      riskManagementDecisionOptions: [],

      riskLevelData: [
        {
          riskIndicator: "Low Risk",
          color: "#52c41a",
          comparator: "<=",
          value: 3,
          description: "description",
        },
        {
          riskIndicator: "Medium Risk",
          color: "#faad14",
          comparator: "<=",
          value: 9,
          description: "teasdf",
        },
        {
          riskIndicator: "High Risk",
          color: "#ff8c00",
          comparator: "<=",
          value: 12,
          description: "asdasd",
        },
        {
          riskIndicator: "Extreme Risk",
          color: "#f5222d",
          comparator: "<=",
          value: 25,
          description: "updated",
        },
      ],
      riskRatingRanges: [
        { tempId: crypto.randomUUID(), min:  1, max:  4, description: "1 - Very Low"  },
        { tempId: crypto.randomUUID(), min:  5, max:  8, description: "2 - Low"       },
        { tempId: crypto.randomUUID(), min:  8, max: 18, description: "3 - Medium"    },
        { tempId: crypto.randomUUID(), min: 19, max: 32, description: "4 - High"      },
        { tempId: crypto.randomUUID(), min: 33, max: 50, description: "5 - Very High" },
      ],
      newRiskRating: { min: "", max: "", description: "" },
    });

    setTableDataS([
      {
        riskIndicator: "Low Risk-#52c41a",
        riskLevel: "<=-3",
        description: "teste",
      },
      {
        riskIndicator: "Medium Risk-#ffec3d",
        riskLevel: "<=-9",
        description: "teasdf",
      },
      {
        riskIndicator: "High  Risk-#FF8C00",
        riskLevel: "<=-12",
        description: "asdasd",
      },
      {
        riskIndicator: "Extreme Risk-#f5222d",
        riskLevel: "<=-25",
        description: "updated",
      },
      EMPTY_ROW_S, // push trailing empty row for UI
    ]);

    setLoading(false);
  };

  const getRiskConfigById = async () => {
    try {
      const res = await axios.get(
        `/api/riskconfig/getconfigbyid/${location?.state?.id}`
      );

      if (res.status === 200 && res?.data?.data) {
        const data = res.data.data;

        // 1. Add trailing empty row to riskLevelData if needed
        const riskLevelData = [...(data?.riskLevelData || [])];
        if (canEdit) {
          const hasEmpty = riskLevelData.some(
            (row: any) =>
              !row.riskIndicator?.trim() ||
              !row.riskLevel?.trim() ||
              !row.description?.trim()
          );
          if (!hasEmpty) riskLevelData.push(EMPTY_ROW_S);
        }

        // 2. Set entire config object directly
        setRiskConfigForm({
          ...data,
          riskLevelData,
          newRiskRating: { min: "", max: "", description: "" },
        });

        setInitialConfig({
          ...data,
          riskLevelData,
          newRiskRating: { min: "", max: "", description: "" },
        });

        // 3. Update table state
        setTableDataS([...riskLevelData]);

        setLoading(false);
      }
    } catch (error) {
      console.error("Failed to fetch config:", error);
      setLoading(false);
    }
  };

  const updateCellDescription = (
    prob: string,
    sev: string,
    description: string
  ) => {
    setRiskConfigForm((prev: any) => ({
      ...prev,
      riskMatrix: {
        ...prev.riskMatrix,
        [prob]: {
          ...prev.riskMatrix[prob],
          [sev]: {
            ...prev.riskMatrix[prob][sev],
            description,
          },
        },
      },
    }));
  };

  const handleLabelEdit = (
    type: "probability" | "severity",
    index: number,
    newLabel: string
  ) => {
    if (!newLabel.trim()) return;

    if (type === "probability") {
      const updated = [...riskConfigForm.probabilityLabels];
      const oldLabel = updated[index];
      updated[index] = newLabel;

      const newMatrix: any = {};
      Object.entries(riskConfigForm.riskMatrix).forEach(
        ([probKey, sevMap]: any) => {
          const newKey = probKey === oldLabel ? newLabel : probKey;
          newMatrix[newKey] = sevMap;
        }
      );

      setRiskConfigForm((prev: any) => ({
        ...prev,
        probabilityLabels: updated,
        riskMatrix: newMatrix,
      }));
    } else {
      const updated = [...riskConfigForm.severityLabels];
      const oldLabel = updated[index];
      updated[index] = newLabel;

      const newMatrix: any = {};
      Object.entries(riskConfigForm.riskMatrix).forEach(
        ([probKey, sevMap]: any) => {
          newMatrix[probKey] = {};
          Object.entries(sevMap).forEach(([sevKey, cell]: any) => {
            const newSevKey = sevKey === oldLabel ? newLabel : sevKey;
            newMatrix[probKey][newSevKey] = cell;
          });
        }
      );

      setRiskConfigForm((prev: any) => ({
        ...prev,
        severityLabels: updated,
        riskMatrix: newMatrix,
      }));
    }

    setEditingLabel(null);
  };

  const addNewOption = (key: string) => {
    if (!newOptionLabel.trim()) return;

    const newEntry = {
      tempId: crypto.randomUUID(),
      label: newOptionLabel,
      ...(key === "currentControlOptions" && newOptionDescription
        ? { description: newOptionDescription }
        : {}),
    };

    setRiskConfigForm((prev: any) => ({
      ...prev,
      [key]: [...(prev[key] || []), newEntry],
    }));

    setNewOptionLabel("");
    setNewOptionDescription("");

    // Close the right dialog:
    switch (key) {
      case "riskTypeOptions":
        setShowRiskTypeDialog(false);
        break;
      case "riskConditionOptions":
        setShowRiskConditionDialog(false);
        break;
      case "currentControlOptions":
        setShowCurrentControlDialog(false);
        break;
      case "riskManagementDecisionOptions":
        setShowRiskManagementDecisionDialog(false);
        break;
    }
  };

  const removeOption = (field: string, id: string) => {
    const key = field.endsWith("Options") ? field : `${field}Options`;
    setRiskConfigForm((prev: any) => ({
      ...prev,
      [key]: Array.isArray(prev[key])
        ? prev[key].filter((item: any) => item._id !== id && item.tempId !== id)
        : [],
    }));
  };

  const addImpactType = () => {
    // console.log("checkr value", newImpactTypeLabel);
    if (!newImpactTypeLabel.trim()) return;

    const newEntry = {
      value: Date.now().toString(),
      label: newImpactTypeLabel,
      ...(newImpactTypeDescription
        ? { description: newImpactTypeDescription }
        : {}),
    };

    setRiskConfigForm((prev: any) => ({
      ...prev,
      impactTypeOptions: [...prev.impactTypeOptions, newEntry],
    }));

    setNewImpactTypeLabel("");
    setNewImpactTypeDescription("");
    setShowImpactTypeDialog(false);
  };

  const removeImpactType = (value: string) => {
    setRiskConfigForm((prev: any) => ({
      ...prev,
      impactTypeOptions: prev.impactTypeOptions.filter(
        (item: any) => item.value !== value
      ),
    }));
  };

  const addNumberSetting = (key: string) => {
    if (!newNumberValue.trim()) return;

    const newEntry = {
      tempId: crypto.randomUUID(),
      label: newNumberValue,
      description: newNumberDescription,
    };

    setRiskConfigForm((prev: any) => {
      const existing = Array.isArray(prev[key]) ? prev[key] : [];
      return {
        ...prev,
        [key]: [...existing, newEntry],
      };
    });

    setNewNumberValue("");
    setNewNumberDescription("");

    switch (key) {
      case "existingRiskRatingOptions":
        setShowExistingRiskRatingDialog(false);
        break;
      case "targetRiskRatingOptions":
        setShowTargetRiskRatingDialog(false);
        break;
      case "existingKeyControlOptions":
        setShowExistingKeyControlDialog(false);
        break;
      case "actualRiskRatingOptions":
        setShowActualRiskRatingDialog(false);
        break;
      case "currentControlEffectivenessOptions":
        setShowCurrentControlEffectivenessDialog(false);
        break;
      case "riskManagementDecisionOptions":
        setShowRiskManagementDecisionDialog(false);
        break;
    }
  };

  const filterEmptyObjectsS = (arr: any[]) => {
    return arr.filter((item: any) => {
      const isEmptyObject = item.riskIndicator === "" && item.riskLevel === "";
      return !isEmptyObject;
    });
  };

  const handleBlurS = (row: any) => {
    // console.log("checkrisk in handleBlurS, ", row);

    if (row._id) {
      if (row.riskIndicator === "" || row.riskLevel === "") {
        message.warning(`Both the fields are required`);
        handleDeleteS(row);
      } else {
        handleUpdateS(row);
      }
    } else if (!!row.riskIndicator && !!row.riskLevel) {
      // console.log("check row in handleBlurS, ", row);

      handleCreateS(row);
    }
  };

  const handleCreateS = (row: any) => {
    let significanceData = [...tableDataS] as any[];
    significanceData = filterEmptyObjectsS(significanceData);
    // console.log("significanceData", significanceData);

    const newRiskConfigData = {
      ...riskConfigForm,
      riskLevelData: significanceData,
    };
    setRiskConfigForm(newRiskConfigData);
  };

  const handleUpdateS = (row: any) => {
    const significanceData = riskConfigForm?.riskLevelData as any[];
    let newSignificanceData = significanceData.map((item) => {
      if (item._id === row._id) {
        return row;
      }
      return item;
    });
    newSignificanceData = filterEmptyObjectsS(newSignificanceData);
    const newRiskConfigData = {
      ...riskConfigForm,
      riskLevelData: newSignificanceData,
    };
    setRiskConfigForm(newRiskConfigData);
  };

  const handleDeleteS = (row: any) => {
    // console.log("checkrisk in handleDeleteS check row, ", row);
    const rowIndex = row.index;
    const newSignificanceData = tableDataS.filter(
      (item: any, index: any) => index !== rowIndex
    );
    // console.log(
    //   "checkrisk in handleDeleteS check newSignificanceData, ",
    //   newSignificanceData
    // );
    const newRiskConfigData = {
      ...riskConfigForm,
      riskLevelData: newSignificanceData,
    };
    setTableDataS(newSignificanceData);
    setRiskConfigForm(newRiskConfigData);
  };

  const handleSubmit = async () => {
    try {
      // console.log("checkrisk in handleSubmit, ", riskConfigForm);

      setLoading(true);
      // message.loading("Saving risk configuration...");
      // Construct payload
      const fullPayload = {
        ...riskConfigForm,
        primaryClassification: riskConfigForm.primaryClassification.trim(),
        secondaryClassification: riskConfigForm.secondaryClassification.trim(),
        riskCategory: riskConfigForm.riskCategory.trim(),
        riskTypeOptions: riskConfigForm.riskTypeOptions.map((option: any) => ({
          label: option.label.trim(),
          description: option.description?.trim() || "",
        })),
        riskConditionOptions: riskConfigForm.riskConditionOptions.map(
          (option: any) => ({
            label: option.label.trim(),
            description: option.description?.trim() || "",
          })
        ),
        currentControlOptions: riskConfigForm.currentControlOptions.map(
          (option: any) => ({
            label: option.label.trim(),
            description: option.description?.trim() || "",
          })
        ),
        impactTypeOptions: riskConfigForm.impactTypeOptions.map(
          (option: any) => ({
            label: option.label.trim(),
            description: option.description?.trim() || "",
          })
        ),
        createdBy: userDetails?.id,
        organizationId: userDetails?.organization?.id,
        locationId: isMCOE ? userDetails?.location?.id : null,
      };

      // Basic validation
      if (!fullPayload.riskCategory.trim()) {
        message.warning("Risk Category is required.");
        setLoading(false);
        return;
      }

      if (!fullPayload.primaryClassification.trim()) {
        message.warning("Primary Classification is required.");
        setLoading(false);
        return;
      }

      if (!fullPayload.secondaryClassification.trim()) {
        message.warning("Primary Classification is required.");
        setLoading(false);
        return;
      }

      const makeDelta = <T extends { label: string; description: string }>(
        incoming: T[],
        existing: T[] = []
      ) => incoming.filter(n =>
        !existing.some(e => e.label === n.label && e.description === n.description)
      );
  
      const payload: any = {
        ...fullPayload,
        // only new ones get sent:
        riskTypeOptions: initialConfig
          ? makeDelta(fullPayload.riskTypeOptions, initialConfig.riskTypeOptions)
          : fullPayload.riskTypeOptions,
        riskConditionOptions: initialConfig
          ? makeDelta(fullPayload.riskConditionOptions, initialConfig.riskConditionOptions)
          : fullPayload.riskConditionOptions,
        currentControlOptions: initialConfig
          ? makeDelta(fullPayload.currentControlOptions, initialConfig.currentControlOptions)
          : fullPayload.currentControlOptions,
        impactTypeOptions: initialConfig
          ? makeDelta(fullPayload.impactTypeOptions, initialConfig.impactTypeOptions)
          : fullPayload.impactTypeOptions,
      };
  

      // Clean riskLevelData
      // const filteredRiskLevels = tableDataS.filter(
      //   (row: any) =>
      //     row.riskIndicator.trim() &&
      //     row.riskLevel.trim() &&
      //     row.description.trim()
      // );

      // payload.riskLevelData = filteredRiskLevels;

      let response;

      if (riskConfigForm._id) {
        // EDIT MODE
        response = await axios.patch(
          `/api/riskconfig/updateHiraConfig/${riskConfigForm._id}`,
          payload
        );
        message.success("Risk configuration updated successfully!");
        navigate(`/risk/riskconfiguration/HIRA`);
      } else {
        // CREATE MODE
        response = await axios.post(
          `/api/riskconfig/createHiraConfig`,
          payload
        );
        message.success("Risk configuration saved successfully!");
        navigate(`/risk/riskconfiguration/HIRA`);
      }
    } catch (err: any) {
      console.error(err);
      message.error(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRiskLevelIndicator = (
    index: any,
    field: any,
    newVal: any
  ) => {
    const updated = [...riskConfigForm.riskLevelData];
    updated[index][field] = newVal;
    setRiskConfigForm((prev: any) => ({
      ...prev,
      riskLevelData: updated,
    }));
  };

  const handleDeleteRiskLevelIndicator = (index: any) => {
    setRiskConfigForm((prev: any) => ({
      ...prev,
      riskLevelData: prev.riskLevelData.filter((_: any, i: any) => i !== index),
    }));
  };

  return (
    <>
      <Box p={2} width="100%" mx="auto">
        <Box
          className={classes.titleRow}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            marginTop: "16px",
            // marginLeft: "3%",
            marginRight: "3%",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          {/* Back Button + Title */}
          <Box
            display="flex"
            alignItems="center"
            style={{ cursor: "pointer", gap: 8 }}
            onClick={() => window.history.back()}
          >
            <MdOutlineArrowBackIos style={{ fontSize: "20px" }} />
            <span
              style={{
                fontSize: "16px",
                color: "#0056b3",
                fontWeight: 500,
                marginLeft: "-9px",
              }}
            >
              Back
            </span>
            <Title
              level={3}
              style={{
                fontWeight: 600,
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              Risk Configuration Form
            </Title>
          </Box>
        </Box>
        <Card>
          <CardHeader
            title={
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography variant="h6">Risk Matrix Setup</Typography>

                <Box display="flex" alignItems="center" gridGap={2}>
                  <PrimaryButton
                    buttonText="Save Configuration"
                    onClick={handleSubmit}
                  />
                </Box>
              </Box>
            }
          />

          <CardContent>
            <Box
              border={1}
              borderRadius={8}
              borderColor="#ddd"
              p={3}
              // bgcolor="#f9f9f9"
            >
              <Box mb={2}>
                <Typography variant="subtitle1" style={{ fontWeight: 500 }}>
                  Risk Category*
                </Typography>
                <Input
                  size="large"
                  style={{ borderRadius: 6 }}
                  placeholder="Enter risk category"
                  value={riskConfigForm.riskCategory}
                  onChange={(e) =>
                    setRiskConfigForm((prev: any) => ({
                      ...prev,
                      riskCategory: e.target.value,
                    }))
                  }
                />
              </Box>

              {/* <Divider style={{ margin: "24px 0" }} /> */}
              {/* Accordion Header for Label Configuration */}
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                onClick={() => setLabelConfigExpanded(!labelConfigExpanded)}
                style={{
                  cursor: "pointer",
                  padding: "8px 0",
                  marginBottom: 16,
                  // borderTop: "1px solid #ddd",
                  // borderBottom: "1px solid #ddd",
                }}
              >
                <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                  Label Configuration
                </Typography>
                <MdExpandMore
                  size={20}
                  style={{
                    transition: "transform 0.3s ease",
                    transform: labelConfigExpanded
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                  }}
                />
              </Box>
              <Collapse in={labelConfigExpanded}>
                <Box>
                  <Box mb={2}>
                    <Grid container spacing={2}>
                      {/* Risk Type */}
                      <Grid item xs={12} md={6}>
                        <OptionDisplayArea
                          label="Risk Type"
                          options={riskConfigForm.riskTypeOptions}
                          onAddNew={() => setShowRiskTypeDialog(true)}
                          onRemove={(val: any) => removeOption("riskType", val)}
                        />
                      </Grid>

                      {/* Risk Condition */}
                      <Grid item xs={12} md={6}>
                        <OptionDisplayArea
                          label="Risk Condition"
                          options={riskConfigForm.riskConditionOptions}
                          onAddNew={() => setShowRiskConditionDialog(true)}
                          onRemove={(val: any) =>
                            removeOption("riskCondition", val)
                          }
                          tooltip="Percipere will ignore this field"
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Current Control */}
                  {/* <OptionDisplayArea
                    label="Current Control"
                    options={riskConfigForm.currentControlOptions}
                    onAddNew={() => setShowCurrentControlDialog(true)}
                    onRemove={(val: any) => removeOption("currentControl", val)}
                    showDescription={true}
                  /> */}

                  <OptionDisplayArea
                    label="Risk Management Decision"
                    options={riskConfigForm.riskManagementDecisionOptions}
                    onAddNew={() => setShowRiskManagementDecisionDialog(true)}
                    onRemove={(val: any) =>
                      removeOption("riskManagementDecisionOptions", val)
                    }
                  />

                  <OptionDisplayArea
                    label="Risk Rating Ranges"
                    options={riskConfigForm?.riskRatingRanges?.map(
                      (r: any) => ({
                        tempId: r.tempId, // ← OptionDisplayArea will use this
                        label: `${r.min} to ${r.max}`,
                        description: r.description,
                      })
                    )}
                    onAddNew={() => setShowRiskRatingModal(true)}
                    onRemove={(id: any) =>
                      setRiskConfigForm((prev: any) => ({
                        ...prev,
                        riskRatingRanges: prev?.riskRatingRanges?.filter(
                          (r: any) => r.tempId !== id // ← filter by that same tempId
                        ),
                      }))
                    }
                    showDescription
                  />

                  {/* Impact Types */}
                  <Box mb={2}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Typography
                        variant="subtitle1"
                        style={{ fontWeight: 500 }}
                      >
                        What is Affected?
                      </Typography>
                      <Tooltip title="Configure how users will specify the types of impacts from risks">
                        <AiOutlineInfoCircle
                          fontSize="small"
                          style={{ marginLeft: 4, color: "#888" }}
                        />
                      </Tooltip>
                      {/* <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setShowImpactTypeFormatDialog(true)}
                        style={{
                          marginLeft: 8,
                          padding: "2px 8px",
                          fontSize: "0.75rem",
                        }}
                      > */}
                      Format: Dropdown Menu
                      {/* {" "}
                        {riskConfigForm.impactTypeFormat === "text"
                          ? "Allow Text Entry"
                          : "Dropdown Menu"} */}
                      {/* </Button> */}
                      {riskConfigForm.impactTypeFormat === "dropdown" && (
                        <AntButton
                          onClick={() => setShowImpactTypeDialog(true)}
                          type="default"
                          shape="circle"
                          icon={<AiOutlinePlus style={{ fontSize: 12 }} />}
                          size="small"
                          style={{
                            width: 24,
                            height: 24,
                            minWidth: 24,
                            padding: 0,
                            borderRadius: 6,
                            borderColor: "#d9d9d9",
                            marginLeft: 6,
                          }}
                        />
                      )}
                    </Box>

                    <Box
                      border={1}
                      borderRadius={8}
                      p={2}
                      bgcolor="#f9f9f9"
                      minHeight={100}
                    >
                      {riskConfigForm.impactTypeFormat === "text" ? (
                        <>
                          <Typography variant="caption" color="textSecondary">
                            Format: Allow Text Entry - Users can type their own
                            impact descriptions
                          </Typography>
                          <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            disabled
                            placeholder="Users will be able to enter custom impact types here..."
                            style={{ marginTop: 8 }}
                          />
                        </>
                      ) : riskConfigForm.impactTypeOptions?.length === 0 ? (
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          align="center"
                        >
                          No dropdown options added yet. Click the + button to
                          add options.
                        </Typography>
                      ) : (
                        <Grid container spacing={1}>
                          {riskConfigForm.impactTypeOptions?.map(
                            (option: any) => (
                              <Grid
                                item
                                xs={12}
                                sm={6}
                                md={4}
                                key={option.value}
                              >
                                <Paper
                                  variant="outlined"
                                  style={{ padding: 8 }}
                                >
                                  <Box
                                    display="flex"
                                    justifyContent="space-between"
                                  >
                                    <Box>
                                      <Typography variant="subtitle2">
                                        {option.label}
                                      </Typography>
                                      {option.description && (
                                        <Typography
                                          variant="caption"
                                          color="textSecondary"
                                        >
                                          {option.description}
                                        </Typography>
                                      )}
                                    </Box>
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        removeImpactType(option?.value)
                                      }
                                    >
                                      <AiOutlineDelete fontSize="small" />
                                    </IconButton>
                                  </Box>
                                </Paper>
                              </Grid>
                            )
                          )}
                        </Grid>
                      )}
                    </Box>
                  </Box>

                  {/* Existing & Target Risk Levels */}
                  <Box mb={2}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={riskConfigForm.showExistingTargetRiskLevels}
                          onChange={(e: any) =>
                            setRiskConfigForm((prev: any) => ({
                              ...prev,
                              showExistingTargetRiskLevels: e.target.checked,
                            }))
                          }
                          color="primary"
                        />
                      }
                      label={
                        <Box display="flex" alignItems="center">
                          Show Existing & Target Risk Levels
                          <Tooltip title="Enable this to show both current and target risk level fields in risk assessments">
                            <AiOutlineInfoCircle
                              fontSize="small"
                              style={{ marginLeft: 4, color: "#888" }}
                            />
                          </Tooltip>
                        </Box>
                      }
                    />
                    {riskConfigForm.showExistingTargetRiskLevels && (
                      <>
                        <OptionDisplayArea
                          label="Existing Risk Rating"
                          options={riskConfigForm.existingRiskRatingOptions}
                          onAddNew={() => setShowExistingRiskRatingDialog(true)}
                          onRemove={(id: any) =>
                            removeOption("existingRiskRatingOptions", id)
                          }
                          showDescription
                        />
                        <OptionDisplayArea
                          label="Target Risk Rating"
                          options={riskConfigForm.targetRiskRatingOptions}
                          onAddNew={() => setShowTargetRiskRatingDialog(true)}
                          onRemove={(id: any) =>
                            removeOption("targetRiskRatingOptions", id)
                          }
                          showDescription
                        />
                      </>
                    )}
                  </Box>

                  {/* Classifications */}
                  <Box mb={3}>
                    <Grid container spacing={2}>
                      {/* Primary Classification */}
                      <Grid item xs={12} sm={6}>
                        <Typography
                          variant="subtitle1"
                          style={{ fontWeight: 500, marginBottom: 6 }}
                        >
                          Entity Function Name*
                        </Typography>
                        <Input
                          id="primary-classification"
                          size="large"
                          style={{ borderRadius: 6 }}
                          placeholder="e.g., IT Ops"
                          value={riskConfigForm.primaryClassification}
                          onChange={(e) =>
                            setRiskConfigForm((prev: any) => ({
                              ...prev,
                              primaryClassification: e.target.value,
                            }))
                          }
                        />
                      </Grid>

                      {/* Secondary Classification */}
                      <Grid item xs={12} sm={6}>
                        <Typography
                          variant="subtitle1"
                          style={{ fontWeight: 500, marginBottom: 6 }}
                        >
                          Risk Classification*
                        </Typography>
                        <Input
                          id="secondary-classification"
                          size="large"
                          style={{ borderRadius: 6 }}
                          placeholder="e.g., Risk"
                          value={riskConfigForm.secondaryClassification}
                          onChange={(e) =>
                            setRiskConfigForm((prev: any) => ({
                              ...prev,
                              secondaryClassification: e.target.value,
                            }))
                          }
                        />
                      </Grid>

                      {/* Tertiary Classification */}
                      <Grid item xs={12}>
                        <Typography
                          variant="subtitle1"
                          style={{ fontWeight: 500, marginBottom: 6 }}
                        >
                          Tertiary Classification (Sub Step)
                        </Typography>
                        <Input
                          id="tertiary-classification"
                          size="large"
                          style={{ borderRadius: 6 }}
                          placeholder="Enter sub step"
                          value={riskConfigForm.tertiaryClassification}
                          onChange={(e) =>
                            setRiskConfigForm((prev: any) => ({
                              ...prev,
                              tertiaryClassification: e.target.value,
                            }))
                          }
                        />
                      </Grid>
                    </Grid>
                  </Box>
                  <Box mb={2}>
                    <OptionDisplayArea
                      label="Existing Key Control"
                      options={riskConfigForm.existingKeyControlOptions}
                      onAddNew={() => setShowExistingKeyControlDialog(true)}
                      onRemove={(id: any) =>
                        removeOption("existingKeyControlOptions", id)
                      }
                      showDescription
                    />
                    <OptionDisplayArea
                      label="Actual Risk Rating"
                      options={riskConfigForm.actualRiskRatingOptions}
                      onAddNew={() => setShowActualRiskRatingDialog(true)}
                      onRemove={(id: any) =>
                        removeOption("actualRiskRatingOptions", id)
                      }
                      showDescription
                    />
                    <OptionDisplayArea
                      label="Current Control Effectiveness"
                      options={
                        riskConfigForm.currentControlEffectivenessOptions
                      }
                      onAddNew={() =>
                        setShowCurrentControlEffectivenessDialog(true)
                      }
                      onRemove={(id: any) =>
                        removeOption("currentControlEffectivenessOptions", id)
                      }
                      showDescription
                    />
                  </Box>
                </Box>
              </Collapse>
              {/* Risk Matrix */}
              <Box mt={4}>
                <Typography variant="h6" gutterBottom>
                  Risk Matrix
                </Typography>
                <div className={classes.matrixContainer}>
                  <div className={classes.minWidthWrapper}>
                    {/* Top row */}
                    <div style={{ display: "flex", marginBottom: 4 }}>
                      <div
                        className={classes.headerCell}
                        style={{ width: 120 }}
                      />
                      <div
                        className={classes.headerCell}
                        style={{ width: 200 }}
                      />
                      <div
                        className={classes.headerCell}
                        style={{ flex: 1, position: "relative" }}
                      >
                        {editingProbabilityAxis ? (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <Input
                              value={tempProbabilityAxisLabel}
                              onChange={(e) =>
                                setTempProbabilityAxisLabel(e.target.value)
                              }
                              style={{
                                height: 32,
                                fontSize: 14,
                                background: "#fff",
                                color: "#000",
                                width: 128,
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  setRiskConfigForm((prev: any) => ({
                                    ...prev,
                                    probabilityAxisLabel:
                                      tempProbabilityAxisLabel,
                                  }));
                                  setEditingProbabilityAxis(false);
                                } else if (e.key === "Escape") {
                                  setEditingProbabilityAxis(false);
                                }
                              }}
                              autoFocus
                            />
                            <AntButton
                              size="small"
                              icon={<FaRegWindowClose />}
                              onClick={() => setEditingProbabilityAxis(false)}
                            />
                          </div>
                        ) : (
                          <div
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              setTempProbabilityAxisLabel(
                                riskConfigForm?.probabilityAxisLabel
                              );
                              setEditingProbabilityAxis(true);
                            }}
                          >
                            {riskConfigForm?.probabilityAxisLabel}
                          </div>
                        )}
                        <div
                          style={{
                            position: "absolute",
                            right: 8,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <Input
                            type="number"
                            value={riskConfigForm?.probabilityWeightage}
                            onChange={(e) =>
                              setRiskConfigForm((prev: any) => ({
                                ...prev,
                                probabilityWeightage:
                                  Number.parseInt(e.target.value) || 1,
                              }))
                            }
                            style={{
                              width: 64,
                              textAlign: "center",
                              background: "#fff",
                              color: "#000",
                            }}
                            min="1"
                            max="10"
                          />
                          <span style={{ fontSize: "12px", color: "#fff" }}>
                            Weight
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Main matrix layout */}
                    <div style={{ display: "flex" }}>
                      {/* Vertical severity axis */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          marginRight: 4,
                        }}
                      >
                        <div
                          className={classes.verticalHeaderWrapper}
                          style={{
                            minHeight: `${
                              100 +
                              80 * riskConfigForm?.probabilityLabels?.length
                            }px`,
                            width: 120,
                          }}
                        >
                          {editingSeverityAxis ? (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <Input
                                value={tempSeverityAxisLabel}
                                onChange={(e) =>
                                  setTempSeverityAxisLabel(e.target.value)
                                }
                                style={{
                                  height: 32,
                                  fontSize: 14,
                                  background: "#fff",
                                  color: "#000",
                                  width: 112,
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    setRiskConfigForm((prev: any) => ({
                                      ...prev,
                                      severityAxisLabel: tempSeverityAxisLabel,
                                    }));
                                    setEditingSeverityAxis(false);
                                  } else if (e.key === "Escape") {
                                    setEditingSeverityAxis(false);
                                  }
                                }}
                                autoFocus
                              />
                              <AntButton
                                size="small"
                                icon={<FaRegWindowClose />}
                                onClick={() => setEditingSeverityAxis(false)}
                              />
                            </div>
                          ) : (
                            <div
                              className={classes.verticalLabel}
                              onClick={() => {
                                setTempSeverityAxisLabel(
                                  riskConfigForm?.severityAxisLabel
                                );
                                setEditingSeverityAxis(true);
                              }}
                            >
                              {riskConfigForm?.severityAxisLabel}
                            </div>
                          )}
                          <Input
                            type="number"
                            value={riskConfigForm?.severityWeightage}
                            onChange={(e) =>
                              setRiskConfigForm((prev: any) => ({
                                ...prev,
                                severityWeightage:
                                  Number.parseInt(e.target.value) || 1,
                              }))
                            }
                            style={{
                              width: 64,
                              textAlign: "center",
                              marginTop: 8,
                              background: "#fff",
                              color: "#000",
                            }}
                            min="1"
                            max="10"
                          />
                          <span style={{ fontSize: "12px", color: "#fff" }}>
                            Weight
                          </span>
                        </div>
                      </div>

                      {/* Probability labels on the left */}
                      <div className={classes.labelColumn}>
                        <div
                          className={classes.labelCell}
                          style={{ height: 100 }}
                        />
                        {riskConfigForm?.severityLabels?.map(
                          (sevLabel: any, sIdx: any) => (
                            <div
                              key={sIdx}
                              className={classes.labelCell}
                              style={{
                                whiteSpace: "nowrap",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                padding: 4,
                              }}
                            >
                              {editingLabel?.type === "severity" &&
                              editingLabel.index === sIdx ? (
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                  }}
                                >
                                  <Input
                                    value={tempLabel}
                                    onChange={(e) =>
                                      setTempLabel(e.target.value)
                                    }
                                    style={{
                                      height: 28,
                                      fontSize: 12,
                                      background: "#fff",
                                      color: "#000",
                                      width: 120,
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        handleLabelEdit(
                                          "severity",
                                          sIdx,
                                          tempLabel
                                        );
                                      } else if (e.key === "Escape") {
                                        setEditingLabel(null);
                                      }
                                    }}
                                    autoFocus
                                  />
                                  <AntButton
                                    size="small"
                                    icon={<FaRegWindowClose />}
                                    onClick={() => setEditingLabel(null)}
                                  />
                                </div>
                              ) : (
                                <div
                                  style={{ cursor: "pointer" }}
                                  onClick={() => {
                                    setEditingLabel({
                                      type: "severity",
                                      index: sIdx,
                                    });
                                    setTempLabel(sevLabel);
                                  }}
                                >
                                  {sevLabel}
                                </div>
                              )}
                            </div>
                          )
                        )}
                      </div>

                      {/* Matrix grid */}
                      <div style={{ flex: 1 }}>
                        <div className={classes.matrixGrid}>
                          {riskConfigForm?.probabilityLabels?.map(
                            (probLabel: any, pIdx: any) => (
                              <div
                                key={pIdx}
                                className={classes.labelCell}
                                style={{
                                  whiteSpace: "nowrap",
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  padding: 4,
                                }}
                              >
                                {editingLabel?.type === "probability" &&
                                editingLabel.index === pIdx ? (
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 4,
                                    }}
                                  >
                                    <Input
                                      value={tempLabel}
                                      onChange={(e) =>
                                        setTempLabel(e.target.value)
                                      }
                                      style={{
                                        height: 28,
                                        fontSize: 12,
                                        background: "#fff",
                                        color: "#000",
                                        width: 120,
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          handleLabelEdit(
                                            "probability",
                                            pIdx,
                                            tempLabel
                                          );
                                        } else if (e.key === "Escape") {
                                          setEditingLabel(null);
                                        }
                                      }}
                                      autoFocus
                                    />
                                    <AntButton
                                      size="small"
                                      icon={<FaRegWindowClose />}
                                      onClick={() => setEditingLabel(null)}
                                    />
                                  </div>
                                ) : (
                                  <div
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                      setEditingLabel({
                                        type: "probability",
                                        index: pIdx,
                                      });
                                      setTempLabel(probLabel);
                                    }}
                                  >
                                    {probLabel}
                                  </div>
                                )}
                              </div>
                            )
                          )}
                        </div>

                        {riskConfigForm?.severityLabels?.map(
                          (sev: any, sIdx: any) => (
                            <div key={sIdx} className={classes.matrixGrid}>
                              {riskConfigForm?.probabilityLabels?.map(
                                (prob: any, pIdx: any) => {
                                  const cell =
                                    riskConfigForm?.riskMatrix?.[prob]?.[sev];
                                  if (!cell) return null;

                                  const isOpen =
                                    selectedCell?.prob === prob &&
                                    selectedCell?.sev === sev;

                                  return (
                                    <React.Fragment key={`${prob}-${sev}`}>
                                      <Tooltip title={cell.description}>
                                        <div
                                          className={classes.matrixCell}
                                          style={{
                                            backgroundColor: getRiskColor(
                                              cell.riskLevel
                                            ),
                                          }}
                                          onClick={() => {
                                            setSelectedCell({ prob, sev });
                                            setEditingDescription(
                                              cell.description
                                            );
                                          }}
                                        >
                                          <div
                                            style={{
                                              fontSize: 16,
                                              fontWeight: "bold",
                                            }}
                                          >
                                            {cell.score}
                                          </div>
                                          <div
                                            style={{
                                              marginTop: 4,
                                              fontSize: 12,
                                              overflow: "hidden",
                                              textOverflow: "ellipsis",
                                              whiteSpace: "nowrap",
                                              width: "100%",
                                            }}
                                          >
                                            {cell.description}
                                          </div>
                                        </div>
                                      </Tooltip>
                                      {/* Dialog remains unchanged */}
                                      <Dialog
                                        open={isOpen}
                                        onClose={() => setSelectedCell(null)}
                                        fullWidth
                                        maxWidth="sm"
                                      >
                                        <DialogTitle>
                                          Edit Risk Description – {prob} / {sev}
                                        </DialogTitle>
                                        <DialogContent>
                                          <Box mb={2}>
                                            <Typography
                                              variant="subtitle1"
                                              gutterBottom
                                            >
                                              Risk Score: {cell.score}
                                            </Typography>
                                            <Box
                                              className={classes.dialogLevel}
                                              style={{
                                                backgroundColor: getRiskColor(
                                                  cell.riskLevel
                                                ),
                                              }}
                                            >
                                              {cell.riskLevel.toUpperCase()}
                                            </Box>
                                          </Box>
                                          <Box>
                                            <Typography variant="subtitle2">
                                              Description
                                            </Typography>
                                            <TextField
                                              fullWidth
                                              multiline
                                              rows={4}
                                              variant="outlined"
                                              value={editingDescription}
                                              onChange={(e) =>
                                                setEditingDescription(
                                                  e.target.value
                                                )
                                              }
                                            />
                                          </Box>
                                        </DialogContent>
                                        <DialogActions>
                                          <Button
                                            onClick={() =>
                                              setSelectedCell(null)
                                            }
                                          >
                                            Cancel
                                          </Button>
                                          <Button
                                            color="primary"
                                            variant="contained"
                                            onClick={() => {
                                              if (selectedCell) {
                                                updateCellDescription(
                                                  selectedCell.prob,
                                                  selectedCell.sev,
                                                  editingDescription
                                                );
                                                setSelectedCell(null);
                                              }
                                            }}
                                          >
                                            Save
                                          </Button>
                                        </DialogActions>
                                      </Dialog>
                                    </React.Fragment>
                                  );
                                }
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Box>
            </Box>
            <>
              <Typography variant="h6" className={classes.tableHeader}>
                Risk Level Indicator
              </Typography>
              <div style={{ marginTop: "10px" }}>
                <RiskIndicatorTable
                  rows={riskConfigForm.riskLevelData}
                  handleChange={handleChangeRiskLevelIndicator}
                  handleDelete={handleDeleteRiskLevelIndicator}
                />
              </div>
            </>
          </CardContent>
        </Card>
      </Box>

      <>
        {/* Risk Type Modal */}
        <Modal
          open={showRiskTypeDialog}
          onCancel={() => setShowRiskTypeDialog(false)}
          footer={null}
          centered
          width={480}
        >
          <Box textAlign="center" mb={3}>
            <Typography variant="h6" style={{ fontWeight: 600 }}>
              Add New Risk Type
            </Typography>
          </Box>
          <Box mb={2}>
            <Typography
              variant="subtitle1"
              style={{ fontWeight: 500, marginBottom: 6 }}
            >
              Risk Type Label
            </Typography>
            <Input
              size="large"
              style={{ borderRadius: 6 }}
              value={newOptionLabel}
              onChange={(e) => setNewOptionLabel(e.target.value)}
              placeholder="Enter risk type name"
            />
          </Box>
          <Box display="flex" justifyContent="flex-end" gridGap={8} mt={3}>
            <SecondaryButton onClick={() => setShowRiskTypeDialog(false)} />
            <PrimaryButton
              type="primary"
              onClick={() => addNewOption("riskTypeOptions")}
              buttonText="Add Risk Type"
            />
          </Box>
        </Modal>
        {/* Risk Condition Modal */}
        <Modal
          open={showRiskConditionDialog}
          onCancel={() => setShowRiskConditionDialog(false)}
          footer={null}
          centered
          width={480}
        >
          <Box textAlign="center" mb={3}>
            <Typography variant="h6" style={{ fontWeight: 600 }}>
              Add New Risk Condition
            </Typography>
          </Box>
          <Box mb={2}>
            <Typography
              variant="subtitle1"
              style={{ fontWeight: 500, marginBottom: 6 }}
            >
              Risk Condition Label
            </Typography>
            <Input
              size="large"
              style={{ borderRadius: 6 }}
              value={newOptionLabel}
              onChange={(e) => setNewOptionLabel(e.target.value)}
              placeholder="Enter risk condition name"
            />
          </Box>
          <Box display="flex" justifyContent="flex-end" gridGap={8} mt={3}>
            <SecondaryButton
              onClick={() => setShowRiskConditionDialog(false)}
            />
            <PrimaryButton
              type="primary"
              onClick={() => addNewOption("riskConditionOptions")}
              buttonText="Add Risk Condition"
            />
          </Box>
        </Modal>

        {/* Risk Management Decision Modal (just text) */}
        <Modal
          open={showRiskManagementDecisionDialog}
          onCancel={() => setShowRiskManagementDecisionDialog(false)}
          footer={null}
          centered
          width={480}
        >
          <Box textAlign="center" mb={3}>
            <Typography variant="h6" style={{ fontWeight: 600 }}>
              Add New Risk Management Decision
            </Typography>
          </Box>
          <Box mb={2}>
            <Typography
              variant="subtitle1"
              style={{ fontWeight: 500, marginBottom: 6 }}
            >
              Decision Label
            </Typography>
            <Input
              size="large"
              style={{ borderRadius: 6, width: "100%" }}
              value={newOptionLabel}
              onChange={(e) => setNewOptionLabel(e.target.value)}
              placeholder="Enter decision text"
            />
          </Box>
          <Box display="flex" justifyContent="flex-end" gridGap={8} mt={3}>
            <SecondaryButton
              onClick={() => setShowRiskManagementDecisionDialog(false)}
            />
            <PrimaryButton
              type="primary"
              onClick={() => {
                addNewOption("riskManagementDecisionOptions");
                setNewOptionLabel("");
                setShowRiskManagementDecisionDialog(false);
              }}
              buttonText="Add Decision"
            />
          </Box>
        </Modal>

        {/* Current Control Modal */}
        <Modal
          open={showCurrentControlDialog}
          onCancel={() => setShowCurrentControlDialog(false)}
          footer={null}
          centered
          width={480}
        >
          <Box textAlign="center" mb={3}>
            <Typography variant="h6" style={{ fontWeight: 600 }}>
              Add New Current Control
            </Typography>
          </Box>
          <Box mb={2}>
            <Typography
              variant="subtitle1"
              style={{ fontWeight: 500, marginBottom: 6 }}
            >
              Control Label
            </Typography>
            <Input
              size="large"
              style={{ borderRadius: 6 }}
              value={newOptionLabel}
              onChange={(e) => setNewOptionLabel(e.target.value)}
              placeholder="Enter control name"
            />
          </Box>
          <Box mb={2}>
            <Typography
              variant="subtitle1"
              style={{ fontWeight: 500, marginBottom: 6 }}
            >
              Description (Optional)
            </Typography>
            <Input.TextArea
              rows={4}
              style={{ borderRadius: 6 }}
              value={newOptionDescription}
              onChange={(e) => setNewOptionDescription(e.target.value)}
              placeholder="Enter control description"
            />
          </Box>
          <Box display="flex" justifyContent="flex-end" gridGap={8} mt={3}>
            <SecondaryButton
              onClick={() => setShowCurrentControlDialog(false)}
            />
            <PrimaryButton
              type="primary"
              onClick={() => addNewOption("currentControlOptions")}
              buttonText="Add Current Control"
            />
          </Box>
        </Modal>
        {/* Impact Type Modal */}
        <Modal
          open={showImpactTypeDialog}
          onCancel={() => setShowImpactTypeDialog(false)}
          footer={null}
          centered
          width={480}
        >
          <Box textAlign="center" mb={3}>
            <Typography variant="h6" style={{ fontWeight: 600 }}>
              Add
            </Typography>
          </Box>
          <Box mb={2}>
            <Typography
              variant="subtitle1"
              style={{ fontWeight: 500, marginBottom: 6 }}
            >
              Label
            </Typography>
            <Input
              size="large"
              style={{ borderRadius: 6 }}
              value={newImpactTypeLabel}
              onChange={(e) => setNewImpactTypeLabel(e.target.value)}
              placeholder="e.g., Integrity, Confidentiality, Availability"
            />
          </Box>
          <Box mb={2}>
            <Typography
              variant="subtitle1"
              style={{ fontWeight: 500, marginBottom: 6 }}
            >
              Description (Optional)
            </Typography>
            <Input.TextArea
              rows={4}
              style={{ borderRadius: 6 }}
              value={newImpactTypeDescription}
              onChange={(e) => setNewImpactTypeDescription(e.target.value)}
              placeholder="Enter impact type description"
            />
          </Box>
          <Box display="flex" justifyContent="flex-end" gridGap={8} mt={3}>
            <SecondaryButton onClick={() => setShowImpactTypeDialog(false)} />
            <PrimaryButton
              onClick={() => addImpactType()}
              type="primary"
              buttonText="Add"
            />
          </Box>
        </Modal>
        <Modal
          open={showImpactTypeFormatDialog}
          onCancel={() => setShowImpactTypeFormatDialog(false)}
          footer={null}
          centered
          width={520}
        >
          <Box textAlign="center" mb={3}>
            <Typography variant="h6" style={{ fontWeight: 600 }}>
              Select Impact Type Format
            </Typography>
          </Box>

          <Box mb={3}>
            <Box
              onClick={() =>
                setRiskConfigForm((prev: any) => ({
                  ...prev,
                  impactTypeFormat: "dropdown",
                }))
              }
              style={{
                padding: 16,
                borderRadius: 8,
                cursor: "pointer",
                border:
                  riskConfigForm.impactTypeFormat === "dropdown"
                    ? "2px solid rgb(0, 48, 89)"
                    : "1px solid #ddd",
                backgroundColor:
                  riskConfigForm.impactTypeFormat === "dropdown"
                    ? "#f0f8ff"
                    : "#fff",
                marginBottom: 12,
              }}
            >
              <Box display="flex" alignItems="center" gridGap={2}>
                <input
                  type="radio"
                  checked={riskConfigForm.impactTypeFormat === "dropdown"}
                  onChange={() =>
                    setRiskConfigForm((prev: any) => ({
                      ...prev,
                      impactTypeFormat: "dropdown",
                    }))
                  }
                />
                <Box>
                  <Typography variant="subtitle1">Dropdown Menu</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Users can select from predefined impact types (e.g.,
                    Integrity, Confidentiality, Availability)
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box
              onClick={() =>
                setRiskConfigForm((prev: any) => ({
                  ...prev,
                  impactTypeFormat: "text",
                }))
              }
              style={{
                padding: 16,
                borderRadius: 8,
                cursor: "pointer",
                border:
                  riskConfigForm.impactTypeFormat === "text"
                    ? "2px solid rgb(0, 48, 89)"
                    : "1px solid #ddd",
                backgroundColor:
                  riskConfigForm.impactTypeFormat === "text"
                    ? "#f0f8ff"
                    : "#fff",
              }}
            >
              <Box display="flex" alignItems="center" gridGap={2}>
                <input
                  type="radio"
                  checked={riskConfigForm.impactTypeFormat === "text"}
                  onChange={() =>
                    setRiskConfigForm((prev: any) => ({
                      ...prev,
                      impactTypeFormat: "text",
                    }))
                  }
                />
                <Box>
                  <Typography variant="subtitle1">Allow Text Entry</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Users can enter custom impact type descriptions in a text
                    field
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box display="flex" justifyContent="flex-end" gridGap={8}>
            <SecondaryButton
              onClick={() => setShowImpactTypeFormatDialog(false)}
            />
            <PrimaryButton
              type="primary"
              onClick={() => setShowImpactTypeFormatDialog(false)}
              buttonText="Save Format"
            />
          </Box>
        </Modal>
        {/* Existing Key Control */}
        <ScoreLabelModal
          visible={showExistingKeyControlDialog}
          title="Existing Key Control"
          value={newNumberValue}
          description={newNumberDescription}
          onChangeValue={(e: any) => setNewNumberValue(e.target.value)}
          onChangeDescription={(e: any) =>
            setNewNumberDescription(e.target.value)
          }
          onCancel={() => setShowExistingKeyControlDialog(false)}
          onAdd={() => addNumberSetting("existingKeyControlOptions")}
        />
        {/* Actual Risk Rating */}
        <ScoreLabelModal
          visible={showActualRiskRatingDialog}
          title="Actual Risk Rating"
          value={newNumberValue}
          description={newNumberDescription}
          onChangeValue={(e: any) => setNewNumberValue(e.target.value)}
          onChangeDescription={(e: any) =>
            setNewNumberDescription(e.target.value)
          }
          onCancel={() => setShowActualRiskRatingDialog(false)}
          onAdd={() => addNumberSetting("actualRiskRatingOptions")}
        />
        {/* Current Control Effectiveness */}
        <ScoreLabelModal
          visible={showCurrentControlEffectivenessDialog}
          title="Current Control Effectiveness"
          value={newNumberValue}
          description={newNumberDescription}
          onChangeValue={(e: any) => setNewNumberValue(e.target.value)}
          onChangeDescription={(e: any) =>
            setNewNumberDescription(e.target.value)
          }
          onCancel={() => setShowCurrentControlEffectivenessDialog(false)}
          onAdd={() => addNumberSetting("currentControlEffectivenessOptions")}
        />
        {/* Risk Management Decision */}
        <RiskRatingModal
          visible={showRiskRatingModal}
          value={riskConfigForm?.newRiskRating}
          onChange={(field: any, val: any) =>
            setRiskConfigForm((prev: any) => ({
              ...prev,
              newRiskRating: { ...prev.newRiskRating, [field]: val },
            }))
          }
          onCancel={() => {
            setShowRiskRatingModal(false);
            setRiskConfigForm((prev: any) => ({
              ...prev,
              newRiskRating: { min: "", max: "", description: "" },
            }));
          }}
          onAdd={() => {
            setRiskConfigForm((prev: any) => {
              const { newRiskRating, riskRatingRanges } = prev;
              const newEntry = {
                tempId: crypto.randomUUID(), // ← truthy id
                min: Number(newRiskRating.min),
                max: Number(newRiskRating.max),
                description: newRiskRating.description,
              };
              return {
                ...prev,
                riskRatingRanges: [...riskRatingRanges, newEntry],
                newRiskRating: { min: "", max: "", description: "" },
              };
            });
            setShowRiskRatingModal(false);
          }}
        />

        {/* Existing Risk Rating */}
        <ScoreLabelModal
          visible={showExistingRiskRatingDialog}
          title="Existing Risk Rating"
          value={newNumberValue}
          description={newNumberDescription}
          onChangeValue={(e: any) => setNewNumberValue(e.target.value)}
          onChangeDescription={(e: any) =>
            setNewNumberDescription(e.target.value)
          }
          onCancel={() => setShowExistingRiskRatingDialog(false)}
          onAdd={() => addNumberSetting("existingRiskRatingOptions")}
        />
        {/* Target Risk Rating */}
        <ScoreLabelModal
          visible={showTargetRiskRatingDialog}
          title="Target Risk Rating"
          value={newNumberValue}
          description={newNumberDescription}
          onChangeValue={(e: any) => setNewNumberValue(e.target.value)}
          onChangeDescription={(e: any) =>
            setNewNumberDescription(e.target.value)
          }
          onCancel={() => setShowTargetRiskRatingDialog(false)}
          onAdd={() => addNumberSetting("targetRiskRatingOptions")}
        />
      </>
    </>
  );
};

export default RiskConfigurationForm;
