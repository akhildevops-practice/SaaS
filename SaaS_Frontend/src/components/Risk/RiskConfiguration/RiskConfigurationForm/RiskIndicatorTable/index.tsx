import React from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  TextareaAutosize,
  InputBase,
  makeStyles,
} from "@material-ui/core";
import { MdDelete } from "react-icons/md";

const useStyles = makeStyles((theme) => ({
  tableContainer: {
    width: "100%",
    overflowX: "auto",
  },
  table: {
    minWidth: 650,
    borderCollapse: "separate",
    borderSpacing: "0 8px",
  },
  headCell: {
    fontWeight: 600,
    backgroundColor: "#fff",
    padding: theme.spacing(1, 2),
  },
  row: {
    backgroundColor: "#fff",
  },
  cell: {
    padding: theme.spacing(1, 2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    verticalAlign: "middle",
  },
  // dot + label container
  indicatorWrap: {
    display: "flex",
    alignItems: "center",
    "& > $dot": {
      marginLeft: theme.spacing(1),
    },
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: "50%",
    flexShrink: 0,
  },
  selectIndicator: {
    minWidth: 200,
  },
  textarea: {
    width: "100%",
    fontFamily: theme.typography.fontFamily,
    fontSize: "0.875rem",
    padding: theme.spacing(1),
    borderColor: theme.palette.primary.main,
    borderRadius: 4,
    "&:focus": {
      outline: "none",
      borderColor: theme.palette.primary.dark,
    },
  },
  comparatorWrap: {
    display: "flex",
    alignItems: "center",
    "& > *": {
      marginRight: theme.spacing(1),
    },
    width: "100%",
  },
  compSelect: {
    minWidth: 80,
  },
  valueInput: {
    flex: 1,
    padding: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 4,
  },
}));

// just the four colours: you can reorder or rename as needed
const COLOR_OPTIONS = ["#52c41a", "#faad14", "#ff8c00", "#f5222d"];

// the four comparators
const OPERATOR_OPTIONS = ["<", "<=", ">=", ">"];

type Props = {
  rows: any[]; // your riskConfigForm.riskLevelData
  handleChange: (idx: number, field: string, val: any) => void;
  handleDelete: (idx: number) => void;
};

export default function RiskIndicatorTable({
  rows,
  handleChange,
  handleDelete,
}: Props) {
  const classes = useStyles();

  // only keep rows that actually have a riskIndicator
  const validRows = rows?.filter(
    (r) => r.riskIndicator && r.riskIndicator.trim() !== ""
  );

  return (
    <Paper className={classes.tableContainer} elevation={0}>
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell className={classes.headCell}>Risk Indicator*</TableCell>
            <TableCell className={classes.headCell}>Description*</TableCell>
            <TableCell className={classes.headCell}>Risk Level*</TableCell>
            <TableCell className={classes.headCell}>Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {validRows?.map((row, idx) => (
            <TableRow key={idx} className={classes.row}>
              {/* --- 1) Risk Indicator --- */}
              <TableCell className={classes.cell}>
                <FormControl fullWidth>
                  <Select
                    value={row.color || ""} // guard against undefined
                    onChange={(e: any) =>
                      handleChange(idx, "color", e.target.value)
                    }
                    displayEmpty
                    className={classes.selectIndicator}
                    renderValue={(selected: any) => (
                      <div className={classes.indicatorWrap}>
                        {row.riskIndicator}
                        <span
                          className={classes.dot}
                          style={{ backgroundColor: selected }}
                        />
                      </div>
                    )}
                    MenuProps={{
                      getContentAnchorEl: null,
                      anchorOrigin: {
                        vertical: "bottom",
                        horizontal: "left",
                      },
                    }}
                  >
                    {COLOR_OPTIONS.map((col) => (
                      <MenuItem key={col} value={col}>
                        <span
                          className={classes.dot}
                          style={{ backgroundColor: col }}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </TableCell>

              {/* --- 2) Description --- */}
              <TableCell className={classes.cell}>
                <TextareaAutosize
                  rowsMin={3}
                  className={classes.textarea}
                  value={row.description}
                  onChange={(e: any) =>
                    handleChange(idx, "description", e.target.value)
                  }
                />
              </TableCell>

              {/* --- 3) Risk Level: comparator + value --- */}
              <TableCell className={classes.cell}>
                <div className={classes.comparatorWrap}>
                  <FormControl className={classes.compSelect}>
                    <Select
                      value={row.comparator || OPERATOR_OPTIONS[0]}
                      onChange={(e: any) =>
                        handleChange(idx, "comparator", e.target.value)
                      }
                    >
                      {OPERATOR_OPTIONS.map((op) => (
                        <MenuItem key={op} value={op}>
                          {op}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <InputBase
                    type="number"
                    className={classes.valueInput}
                    value={row?.value}
                    onChange={(e: any) =>
                      handleChange(idx, "value", Number(e.target.value))
                    }
                    placeholder="0"
                  />
                </div>
              </TableCell>

              {/* --- 4) Actions --- */}
              <TableCell className={classes.cell}>
                <IconButton onClick={() => handleDelete(idx)}>
                  <MdDelete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
