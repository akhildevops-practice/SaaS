// RiskReadOnlyTable.tsx
import React from "react";
import {
  makeStyles,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@material-ui/core";
import moment from "moment";

const useStyles = makeStyles((theme) => ({
  tableContainer: {
    maxHeight: 600,
    marginTop: theme.spacing(2),
  },
}));

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
    | null;
  width?: string;
  options?: { value: any; label: string }[];
  render?: (_: any, record: any) => React.ReactNode;
}

interface RowData {
  id: string;
  [key: string]: any;
}

interface Props {
  data: any;
  existingRiskConfig: any;
  options: {
    riskSourceOptions: any;
    userOptions: any;
  };
}

export default function RiskStepsViewTable({
  data,
  existingRiskConfig,
  options,
}: Props) {
  const classes = useStyles();

  // 1) Build probability & severity select-labels
  const probabilityOptions = (existingRiskConfig?.probabilityLabels || []).map(
    (lbl: string, i: number) => ({ value: i + 1, label: `${i + 1} – ${lbl}` })
  );
  const severityOptions = (existingRiskConfig?.severityLabels || []).map(
    (lbl: string, i: number) => ({ value: i + 1, label: `${i + 1} – ${lbl}` })
  );

  // console.log("checkrisk8 in risk steps view table existingRiskConfig", existingRiskConfig);

  // 2) Helpers to define columns
  const conditionalColumn = (
    key: string,
    label: string,
    inputType: Column["inputType"],
    opts?: { value: any; label: string }[],
    width = "200px"
  ): Column => ({ key, label, inputType, options: opts, width });

  const dateColumn = (key: string, label: string, width = "150px"): Column => ({
    key,
    label,
    inputType: "date",
    width,
    render: (_: any, rec: any) =>
      rec[key] ? moment(rec[key], "YYYY-MM-DD").format("DD-MM-YYYY") : "",
  });

  // 3) Computed score columns (read-only)
  const computedColumns: Column[] = [
    {
      key: "preMitigationScore",
      label: "L*I",
      inputType: null,
      width: "150px",
      render: (_: any, rec: any) => {
        const p = rec.likelihood;
        const s = rec.impact;
        const pw = +existingRiskConfig.probabilityWeightage;
        const sw = +existingRiskConfig.severityWeightage;
        if ([p, s, pw, sw].some((x) => !Number.isFinite(+x) || x === 0))
          return "";
        return String(p * pw * (s * sw));
      },
    },
    {
      key: "postMitigationScore",
      label: "AL*AI",
      inputType: null,
      width: "150px",
      render: (_: any, rec: any) => {
        const p = rec.actualLikelihood;
        const s = rec.actualImpact;
        const pw = +existingRiskConfig.probabilityWeightage;
        const sw = +existingRiskConfig.severityWeightage;
        if ([p, s, pw, sw].some((x) => !Number.isFinite(+x) || x === 0))
          return "";
        return String(p * pw * (s * sw));
      },
    },
  ];

  // 4) Build the flat columns array
  const columns: any[] = [
    {
      key: "sNo",
      label: `Risk No.`,
      inputType: "number",
      width: "80px",
    },
    dateColumn("regDate", "Risk Date"),
    conditionalColumn(
      "riskSource",
      "Source",
      "select",
      options.riskSourceOptions
    ),
    ...(existingRiskConfig?.riskTypeOptions?.length
      ? [
          conditionalColumn(
            "riskType",
            "Type of Risk",
            "select",
            existingRiskConfig.riskTypeOptions
          ),
        ]
      : []),
    {
      key: "jobBasicStep",
      label: existingRiskConfig?.secondaryClassification,
      inputType: "textarea",
      width: "300px",
    },
    {
      key: "riskDetailedScenario",
      label: "Risk Detailed Scenario",
      inputType: "textarea",
      width: "300px",
    },
    {
      key: "riskOwner",
      label: "Risk Owner",
      inputType: "textarea",
      width: "300px",
    },
    {
      key: "existingControl",
      label: "Existing Controls",
      inputType: "textarea",
      width: "200px",
    },
    ...(existingRiskConfig?.riskConditionOptions?.length
      ? [
          conditionalColumn(
            "riskCondition",
            "Risk Condition",
            "select",
            existingRiskConfig.riskConditionOptions
          ),
        ]
      : []),
    conditionalColumn(
      "impactType",
      "What is Affected?",
      existingRiskConfig?.impactTypeFormat === "dropdown" ? "select" : "text",
      existingRiskConfig?.impactTypeOptions
    ),
    {
      key: "likelihood",
      label: "Likelihood",
      inputType: "select",
      options: probabilityOptions,
      width: "120px",
    },
    {
      key: "impact",
      label: "Impact",
      inputType: "select",
      options: severityOptions,
      width: "120px",
    },
    computedColumns[0],

    ...(existingRiskConfig?.showExistingTargetRiskLevels
      ? [
          {
            key: "existingRiskRatingId",
            label: "Existing Risk Rating",
            inputType: null,
            width: "200px",
            render: (_: any, rec: any) => {
              // rec.existingRiskRatingId comes from riskDetails
              const id = rec.existingRiskRatingId;
              const opt = existingRiskConfig?.riskRatingRanges?.find(
                (o: any) => o._id === id
              );
              return opt?.description ?? "";
            },
          },
          conditionalColumn(
            "targetRiskRatingId",
            "Target Risk Rating",
            "select",
            existingRiskConfig.targetRiskRatingOptions
          ),
        ]
      : []),

    ...(existingRiskConfig?.existingKeyControlOptions?.length
      ? [
          conditionalColumn(
            "existingKeyControlId",
            "Existing Key Control Effectiveness",
            "select",
            existingRiskConfig.existingKeyControlOptions
          ),
        ]
      : []),
    ...(existingRiskConfig?.currentControlEffectivenessOptions?.length
      ? [
          conditionalColumn(
            "currentControlEffectivenessId",
            "Current Control Effectiveness",
            "select",
            existingRiskConfig.currentControlEffectivenessOptions
          ),
        ]
      : []),

      {
        key: "residualRiskAccepted",
        label: "Residual Risk Accepted?",
        inputType: "checkbox",
        width: "180px",
      },
    ...(existingRiskConfig?.riskManagementDecisionOptions?.length
      ? [
          conditionalColumn(
            "riskManagementDecisionId",
            "Risk Management Decision",
            "select",
            existingRiskConfig.riskManagementDecisionOptions
          ),
        ]
      : []),

    {
      key: "requireRiskTreatment",
      label: "Require Further Risk Treatment?",
      inputType: "checkbox",
      width: "180px",
    },
    {
      key: "additionalControlDescription",
      label: "Description of Additional Controls",
      inputType: "textarea",
      width: "250px",
    },
    dateColumn("targetDate", "Target Date"),
    {
      key: "actualLikelihood",
      label: "Actual Likelihood",
      inputType: "select",
      options: probabilityOptions,
      width: "120px",
    },
    {
      key: "actualImpact",
      label: "Actual Impact",
      inputType: "select",
      options: severityOptions,
      width: "120px",
    },
    computedColumns[1],
    ...(existingRiskConfig?.actualRiskRatingOptions?.length
      ? [
          conditionalColumn(
            "actualRiskRatingId",
            "Actual Risk Rating",
            "select",
            existingRiskConfig.actualRiskRatingOptions
          ),
        ]
      : []),
    {
      key: "monitoringDetails",
      label: "Monitoring Details",
      inputType: "textarea",
      width: "250px",
    },
    dateColumn("nextReviewDate", "Next Review Date"),
    {
      key: "responsibility",
      label: "Responsibility",
      inputType: null,
      width: "200px",
      render: (_: any, rec: any) => {
        // raw array of selected user‐IDs
        const raw: any[] = Array.isArray(rec.responsibility)
          ? rec.responsibility
          : [];
        // find each label in your options.userOptions
        const labels = raw
          .map(id => {
            const opt = options.userOptions.find((o: any) => o.value === id);
            return opt?.label;
          })
          .filter(Boolean) // drop any unmatched
          .join(", ");
        return labels;
      },
    },
    
  ].filter(Boolean);

  // 5) Generic cell renderer
  const renderCell = (row: RowData, col: Column) => {
    const v = row[col.key];
    if (col.inputType === "checkbox") {
      return v ? "Yes" : "No";
    }
    if (col.inputType === "select") {
      const opt = col.options?.find((o) => o.value === v);
      return opt ? opt.label : "";
    }
    return v == null ? "" : String(v);
  };

  return (
    <TableContainer component={Paper} className={classes.tableContainer}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            {columns.map((c) => (
              <TableCell
                key={c.key}
                style={{ width: c.width, fontWeight: "bold" }}
              >
                {c.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row: any) => (
            <TableRow key={row.id} hover>
              {columns.map((col) => (
                <TableCell key={`${row.id}-${col.key}`}>
                  {col.render ? col.render(null, row) : renderCell(row, col)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
