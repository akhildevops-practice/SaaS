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
  TextField,
  Popover,
  Tooltip,
  TextareaAutosize,
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

import { Input, Select, Space } from "antd";
import React from "react";

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void;
  }
}

type Props = {
  columns: ColumnDef<any, any>[];
  data: any[];
  setData: React.Dispatch<React.SetStateAction<any>>;
  handleBlur: (row: any, index: any) => any;
  canEdit?: boolean;
  isAction?: boolean;
  handleDelete: (row: any) => any;
};

let BLUR_FUNCTION: (row: any, index: any) => any = () => {};
let CAN_EDIT: boolean = false;

const defaultColumn: Partial<ColumnDef<any>> = {
  cell: function Cell({ getValue, row: { index }, column: { id }, table }) {
    const initialValue = getValue();

    // We need to keep and update the state of the cell normally
    const [value, setValue] = useState<any>(initialValue);
    const [type, setType] = useState<any>("");
    const [level, setLevel] = useState<any>("");
    const [displayColorPicker, setDisplayColorPicker] =
      useState<boolean>(false);
    const [riskIndicatorValue, setRiskIndicatorValue] = useState<any>("");
    const [anchorEl, setAnchorEl] = useState<any>(null);
    const [selectedColor, setSelectedColor] = useState<any>(null); // Default color
    const classes = useStyles();

    useEffect(() => {
      console.log("check change in riskIndicatorValue", riskIndicatorValue);
      console.log("check change in selectedColor", selectedColor);
    }, [selectedColor, riskIndicatorValue]);

    // When the input is blurred, we'll call our table meta's updateData function
    // const onBlur = () => {
    //   console.log("checkrisk onBlur id, index, value, selectedcolr", id, index, value, selectedColor);

    //   if (id === "riskLevel") {
    //     if (type !== "" && level !== "") {
    //       const sample = type + "-" + level;
    //       console.log("check in risk livele", sample);

    //       table.options.meta?.updateData(index, id, sample);
    //     }
    //   }

    //   // else if (id === "riskIndicator" && !!selectedColor) {
    //   //   console.log("checkconfig this in risk indicator value", riskIndicatorValue + "-" + selectedColor);
    //   //   const finalValue = riskIndicatorValue + "-" + selectedColor;

    //   //   table.options.meta?.updateData(index, id, finalValue);
    //   //   setSelectedColor(null)
    //   // }

    //    else {
    //     table.options.meta?.updateData(index, id, value);
    //   }
    // };

    const onBlur = () => {
      if (id === "riskLevel") {
        // ... existing code for riskLevel ...
        if (type !== "" && level !== "") {
          const sample = type + "-" + level;
          console.log("check in risk livele", sample);

          table.options.meta?.updateData(index, id, sample);
        }
      } else if (id === "riskIndicator") {
        // Extract text part from the current value (if it contains a color).
        const textPart = value.includes("-") ? value.split("-")[0] : value;

        // Combine the text part with the current color.
        const finalValue = `${textPart}-${selectedColor || "#52c41a"}`;

        // Update the value with the latest text and color.
        table.options.meta?.updateData(index, id, finalValue);
      } else {
        // For other IDs, just update the value.
        table.options.meta?.updateData(index, id, value);
      }
    };

    // const handleColorChange = (color:any) => {
    //   console.log("check color is", color);

    //   setSelectedColor(color);
    //   setAnchorEl(null);
    // };

    const handleColorChange = (color: any) => {
      console.log("checkrisk Selected color is", color);

      // Extract text part from the current value (if it contains a color).
      const textPart = value.includes("-") ? value.split("-")[0] : value;

      // Combine the text part with the new color.
      const combinedValue = `${textPart}-${color}`;

      // Set the selected color state.
      setSelectedColor(color);

      // Close the popover.
      setAnchorEl(null);

      // Update the table data with the combined value.
      table.options.meta?.updateData(index, id, combinedValue);
    };

    const handleOpenPopover = (event: any) => {
      setAnchorEl(event.currentTarget);
    };

    const handleClosePopover = () => {
      setAnchorEl(null);
    };

    // useEffect(() => {
    //   console.log("checkconfig selected color is in useEffect[value]", selectedColor,);

    // }, [selectedColor]);

    // If the initialValue is changed external, sync it up with our state
    useEffect(() => {
      setValue(initialValue);
      // console.log("check initial value is in useEffect[initialValue]", initialValue, id);

      if (id === "riskLevel" && initialValue) {
        // console.log("check initial value is", initialValue, id);

        const riskLevelValue = "" + initialValue;
        const [initialType, initialLevel] = riskLevelValue.split("-");
        // console.log("split value is", initialType, initialLevel);
        setType(initialType);
        setLevel(initialLevel);
      }
    }, [initialValue]);

    useEffect(() => {
      BLUR_FUNCTION(table.options.data[index], index);
    }, [table.options.data[index][id]]);

    if (id === "riskIndicator") {
      const [textValue, colorValue] = value.includes("-")
        ? value.split("-")
        : [value, "#52c41a"];
      return (
        <div style={{ padding: 2.5 }}>
          <TextField
            style={{ width: "200px" }}
            multiline
            maxRows={2}
            name="riskIndicator"
            value={textValue}
            variant="outlined"
            // onChange={(e) => setValue(e.target.value)}
            // onChange={(e) => setValue(`${e.target.value}-${colorValue}`)} // Combine text input with existing color
            onChange={(e) => {
              // Extract color part from the current value (if it contains a color).
              const colorPart = value.includes("-")
                ? value.split("-")[1]
                : selectedColor || "green";

              // Combine the new text input with the current color.
              setValue(`${e.target.value}-${colorPart}`);
            }}
            size="small"
            inputProps={{
              "data-testid": "riskIndicator",
            }}
            onBlur={onBlur}
            disabled={!CAN_EDIT}
            InputProps={{
              style: { fontSize: "14px", height: "50px" },
              endAdornment: (
                <Tooltip title="Select color">
                  <div
                    onClick={(e) => {
                      handleOpenPopover(e);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <div
                      style={{
                        borderRadius: "10px",
                        width: "20px",
                        height: "20px",
                        background: colorValue, // Use colorValue here
                      }}
                    />
                  </div>
                </Tooltip>
              ),
            }}
          />
          <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={handleClosePopover}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <div style={{ display: "flex", padding: "10px" }}>
              {["#52c41a", "#ffec3d", "#FF8C00", "#f5222d"].map((color) => (
                <div
                  key={color}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // setSelectedColor(color);
                    handleColorChange(color); // Call handleColorChange when a color is clicked
                    handleClosePopover();
                  }}
                  style={{
                    width: "20px",
                    height: "20px",
                    background: color,
                    margin: "0 5px",
                    cursor: "pointer",
                    borderRadius: "10px",
                  }}
                ></div>
              ))}
            </div>
          </Popover>
        </div>
      );
    }

    if (id === "riskLevel")
      return (
        <div style={{ padding: 2.5 }}>
          <Space.Compact onBlur={onBlur}>
            <Select
              defaultValue=">="
              options={[
                { value: "<", label: "<" },
                { value: "<=", label: "<=" },
                { value: ">=", label: ">=" },
                { value: ">", label: ">" },
              ]}
              value={type}
              style={{ width: "35%" }}
              onChange={(value) => setType(value)}
              onBlur={onBlur}
              disabled={!CAN_EDIT}
            />
            <Input
              defaultValue="5"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              // onChange={(e) => setRiskLevelObj({...riskLevelObj, value : e.target.value})}
              style={{ width: "45%" }}
              type="number"
              onBlur={onBlur}
              disabled={!CAN_EDIT}
            />
          </Space.Compact>
        </div>
      );
    return (
      <TextareaAutosize
        // className={classes.input}
        className={classes.dataCell}
        minRows={4}
        cols={24}
        // placeholder="Add a comment"
        value={value as string}
        onChange={(e) => setValue(e.target.value)}
        onBlur={onBlur}
      />
      // <InputBase
      //   fullWidth
      //   className={classes.dataCell}
      //   value={value as string}
      //   onChange={(e) => setValue(e.target.value)}
      //   onBlur={onBlur}

      // />
      // <div  style={{ paddingTop: "7px", paddingBottom :"8px" }}>
      //     <TextField
      //                 style={{  width : "300px", height : "40px"  }}

      //       multiline
      //       maxRows={2}
      //       value={value}
      //       variant="outlined"
      //       onChange={(e) => setValue(e.target.value)}
      //       size="small"
      //       inputProps={{
      //         "data-testid": "score5Text",
      //       }}
      //       onBlur={onBlur}
      //       disabled={!CAN_EDIT}
      //     />
      //   </div>
    );
  },
};

function RiskLevelIndicatorTable({
  columns,
  data,
  setData,
  handleBlur,
  canEdit = false,
  isAction = false,
  handleDelete,
}: Props) {
  const memoizedCols = useMemo<ColumnDef<any, any>[]>(() => columns, [columns]);
  const memoizedData = useMemo(() => data, [data]);

  const classes = useStyles();
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
              {headerGroup.headers.map((header) => (
                <TableCell
                  key={header.id}
                  colSpan={header.colSpan}
                  className={classes.colName}
                >
                  {header.isPlaceholder ? null : (
                    <>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </>
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
                <TableCell
                  {...{ key: cell.id }}
                  style={{ textAlign: "center" }}
                >
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
                    onClick={() => handleDelete(row)}
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

export default RiskLevelIndicatorTable;
