//react
import { useState, useEffect, useMemo } from "react";

//mui
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  InputBase,
  TextField,
} from "@material-ui/core";
import { MdDelete } from 'react-icons/md';
//tanstack
import {
  useReactTable,
  ColumnDef,
  getCoreRowModel,
  flexRender,
  RowData,
  getFilteredRowModel,
} from "@tanstack/react-table";

//utils
import useStyles from "./styles";

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void;
  }
}

type Props = {
  columns: ColumnDef<any, any>[];
  data: any[];
  setData: React.Dispatch<React.SetStateAction<any>>;
  handleBlur: (row: any) => any;
  canEdit?: boolean;
  isAction?: boolean;
  handleDelete: (row: any) => any;
  headerValues: any;
  setHeaderValues: React.Dispatch<React.SetStateAction<any>>;
  riskConfigData: any;
  setRiskConfigData: React.Dispatch<React.SetStateAction<any>>;
};

let BLUR_FUNCTION: (row: any) => any = () => {};
let CAN_EDIT: boolean = false;

const defaultColumn: Partial<ColumnDef<any>> = {
  cell: function Cell({ getValue, row: { index }, column: { id }, table }) {
    const initialValue = getValue();

    // We need to keep and update the state of the cell normally
    const [value, setValue] = useState<any>(initialValue);

    const classes = useStyles();

    // When the input is blurred, we'll call our table meta's updateData function
    const onBlur = () => {
      table.options.meta?.updateData(index, id, value);
    };

    // If the initialValue is changed external, sync it up with our state
    useEffect(() => {
      setValue(initialValue);
    }, [initialValue]);

    useEffect(() => {
      BLUR_FUNCTION(table.options.data[index]);
    }, [table.options.data[index][id]]);

    if (id === "criteriaType")
      return (
        <div style={{ padding: 1 }}>
          <TextField
            style={{ width: "200px" }}
            multiline
            maxRows={2}
            name="criteriaType"
            value={value}
            variant="outlined"
            onChange={(e) => setValue(e.target.value)}
            size="small"
            inputProps={{
              "data-testid": "criteriaType",
            }}
            onBlur={onBlur}
            disabled={!CAN_EDIT}
          />
        </div>
      );
    if (id === "score1Text")
      return (
        <div style={{ padding: 1 }}>
          <TextField
            style={{ width: "180px" }}
            multiline
            maxRows={2}
            name="score1Text"
            value={value}
            variant="outlined"
            onChange={(e) => setValue(e.target.value)}
            size="small"
            inputProps={{
              "data-testid": "score1Text",
            }}
            onBlur={onBlur}
            disabled={!CAN_EDIT}
          />
        </div>
      );
    if (id === "score2Text")
      return (
        <div style={{ padding: 1 }}>
          <TextField
            style={{ width: "180px" }}
            multiline
            maxRows={2}
            name="score2Text"
            value={value}
            variant="outlined"
            onChange={(e) => setValue(e.target.value)}
            size="small"
            inputProps={{
              "data-testid": "score2Text",
            }}
            onBlur={onBlur}
            disabled={!CAN_EDIT}
          />
        </div>
      );
    if (id === "score3Text")
      return (
        <div style={{ padding: 1 }}>
          <TextField
            style={{ width: "180px" }}
            multiline
            maxRows={2}
            name="score3Text"
            value={value}
            variant="outlined"
            onChange={(e) => setValue(e.target.value)}
            size="small"
            inputProps={{
              "data-testid": "score3Text",
            }}
            onBlur={onBlur}
            disabled={!CAN_EDIT}
          />
        </div>
      );
    if (id === "score4Text")
      return (
        <div style={{ padding: 1 }}>
          <TextField
            style={{ width: "180px" }}
            multiline
            maxRows={2}
            name="score4Text"
            value={value}
            variant="outlined"
            onChange={(e) => setValue(e.target.value)}
            size="small"
            inputProps={{
              "data-testid": "score4Text",
            }}
            onBlur={onBlur}
            disabled={!CAN_EDIT}
          />
        </div>
      );
      if (id === "score5Text")
      return (
        <div style={{ padding: 1 }}>
          <TextField
            style={{ width: "180px" }}
            multiline
            maxRows={2}
            name="score5Text"
            value={value}
            variant="outlined"
            onChange={(e) => setValue(e.target.value)}
            size="small"
            inputProps={{
              "data-testid": "score5Text",
            }}
            onBlur={onBlur}
            disabled={!CAN_EDIT}
          />
        </div>
      );

    return (
      <InputBase
        fullWidth
        className={classes.dataCell}
        value={value as string}
        onChange={(e) => setValue(e.target.value)}
        onBlur={onBlur}
      />
    );
  },
};

function RiskMatrixTable({
  columns,
  data,
  setData,
  handleBlur,
  canEdit = false,
  handleDelete,
  isAction = false,
  headerValues,
  setHeaderValues,
  riskConfigData,
  setRiskConfigData,
}: Props) {
  const memoizedCols = useMemo<ColumnDef<any, any>[]>(() => columns, [columns]);
  const memoizedData = useMemo(() => data, [data]);
  
  const classes = useStyles();

  useEffect(() => {
    console.log("check header values-->", headerValues);
  }, [headerValues]);

  const handleHeaderChange = (index: number, newValue: string) => {
    const newHeaderValues = [...headerValues];
    newHeaderValues[index] = newValue;
    setHeaderValues((prev:any) => {
      const newValues = [...prev];
      newValues[index] = newValue;
      return newValues;
    });

    const newRiskConfigData = {
      ...riskConfigData,
      riskCumulativeHeader: newHeaderValues,
    };
    setRiskConfigData(newRiskConfigData);

  };
  BLUR_FUNCTION = handleBlur;
  CAN_EDIT = canEdit;

  const table = useReactTable({
    columns: memoizedCols,
    data: memoizedData,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    defaultColumn: defaultColumn,
    meta: {
      updateData: (rowIndex: number, columnId: string, value: any) => {
        setData((old: any) =>
          old.map((row: any, index: number) => {
            if (index === rowIndex) {
              return {
                ...old[rowIndex]!,
                [columnId]: value,
              };
            }
            return row;
          })
        );
      },
    },
  });

  return (
    <TableContainer
      style={{
        border: "1px solid #3335",
        borderRadius: 3,
        margin: "auto",
      }}
    >
      <Table style={{ border: "2px solid transparent" }}>
        <TableHead>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header, index) => (
                <TableCell
                  key={header.id}
                  colSpan={header.colSpan}
                  className={classes.colName}
                >
                  {header.isPlaceholder ? null : (
                    <TextField
                      value={headerValues[index]}
                      onChange={(e) =>
                        handleHeaderChange(index, e.target.value)
                      }
                      variant="outlined"
                      size="small"
                      inputProps={{ style: { backgroundColor: "white" } }}
                    />
                  )}
                </TableCell>
              ))}
              {isAction && canEdit && (
                <TableCell align="center" className={classes.colName}>
                  Actions
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableHead>

        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} className={classes.row}>
              {row.getVisibleCells().map((cell) => (
                <TableCell {...{ key: cell.id }}>
                  {cell.getIsAggregated()
                    ? // If the cell is aggregated, use the Aggregated renderer for cell
                      flexRender(
                        cell.column.columnDef.aggregatedCell ??
                          cell.column.columnDef.cell,
                        cell.getContext()
                      )
                    : cell.getIsPlaceholder()
                    ? null
                    : // For cells with repeated values, render null
                      // Otherwise, just render the regular cell
                      flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
              {isAction && canEdit && (
                <TableCell align="center" className={classes.bodyCell}>
                  <div
                    style={{ cursor: "pointer" }}
                    onClick={() => handleDelete(row.original)}
                  >
                    <MdDelete />
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default RiskMatrixTable;
