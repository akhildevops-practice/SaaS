import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputBase,
  TextField,
  Grid,
  InputAdornment,
} from "@material-ui/core";
import {
  useReactTable,
  ColumnDef,
  getCoreRowModel,
  flexRender,
  RowData,
  getFilteredRowModel,
  FilterFn,
} from "@tanstack/react-table";
import { MdChevronRight } from 'react-icons/md';
import { MdChevronLeft } from 'react-icons/md';
import { MdSkipNext } from 'react-icons/md';
import { MdSkipPrevious } from 'react-icons/md';
import CustomMoreMenu from "../newComponents/CustomMoreMenu";
import useStyles from "./styles";
import Autocomplete from "@material-ui/lab/Autocomplete";
import axios from "../../apis/axios.global";
import { MdSearch } from 'react-icons/md';
import { rankItem } from "@tanstack/match-sorter-utils";
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
  unitOptions: { value: string; type: string; typeId: string }[];
  actions?: {
    label: string;
    icon: JSX.Element;
    handler: (x: any) => any;
  }[];
};

const convertDate = (date: Date) => {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();

  return yyyy + "-" + mm + "-" + dd;
};

let BLUR_FUNCTION: (row: any) => any = () => {};
let UNITS: { value: string; type: string; typeId: string }[] = [];

const defaultColumn: Partial<ColumnDef<any>> = {
  cell: function Cell({ getValue, row: { index }, column: { id }, table }) {
    const initialValue = getValue();

    // We need to keep and update the state of the cell normally
    const [value, setValue] = useState<any>(initialValue);
    const [targetvalue, setTargetValue] = useState<any>();
    const classes = useStyles();

    // When the input is blurred, we'll call our table meta's updateData function
    const onBlur = () => {
      table.options.meta?.updateData(index, id, value);
    };
    const [user, setUser] = useState<any[]>([]);

    // If the initialValue is changed external, sync it up with our state
    useEffect(() => {
      setValue(initialValue);
    }, [initialValue]);

    useEffect(() => {
      getAllUser();
    }, []);

    useEffect(() => {
      BLUR_FUNCTION(table.options.data[index]);
    }, [table.options.data[index][id]]);

    const getAllUser = async () => {
      await axios(`/api/objective/getAllUser`)
        .then((res) => {
          setUser(
            res.data.allUsers.map((obj: any) => ({
              id: obj.id,
              value: obj.username,
            }))
          );
        })
        .catch((err) => console.error(err));
    };

    if (id === "TargetType")
      return (
        <div style={{ padding: 2.5 }}>
          <FormControl
            fullWidth
            size="small"
            variant="outlined"
            className={`${classes.selectCell}`}
          >
            <Select
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onBlur={onBlur}
            >
              <MenuItem value="+ve">+ve</MenuItem>
              <MenuItem value="-ve">-ve</MenuItem>
            </Select>
          </FormControl>
        </div>
      );

    if (id === "Status")
      return (
        <div style={{ padding: 2.5 }}>
          <FormControl
            fullWidth
            size="small"
            variant="outlined"
            className={`${classes.selectCell}`}
          >
            <Select
              value={value}
              // label="Status"
              name="Status"
              onChange={(e) => setValue(e.target.value)}
              onBlur={onBlur}
            >
              <MenuItem value="InProgress">InProgress</MenuItem>
              <MenuItem value="Open">Open</MenuItem>
              <MenuItem value="Complete">Complete</MenuItem>
              <MenuItem value="Deferred">Deferred</MenuItem>
              <MenuItem value="PartialComplete">PartialComplete</MenuItem>
            </Select>
          </FormControl>
        </div>
      );

    if (id === "StartDate") {
      return (
        <div style={{ padding: 2.5 }}>
          <input
            name="StartDate"
            className={classes.dateInput}
            type="date"
            value={value ? convertDate(value) : ""}
            onChange={(e) => setValue(e.target.valueAsDate)}
            onBlur={onBlur}
          />
        </div>
      );
    }

    if (id === "EndDate") {
      return (
        <div style={{ padding: 2.5 }}>
          <input
            name="EndDate"
            className={classes.dateInput}
            type="date"
            value={value ? convertDate(value) : ""}
            onChange={(e) => setValue(e.target.valueAsDate)}
            onBlur={onBlur}
          />
        </div>
      );
    }

    if (id === "UserName") {
      return (
        <div style={{ padding: 2.5 }}>
          <Autocomplete
            fullWidth
            size="small"
            // label=""
            style={{
              fontSize: "0.85rem",
              borderRadius: 3,
              overflow: "hidden",
              width: "150px",
            }}
            options={user}
            getOptionLabel={(option) => option.value}
            getOptionSelected={(option, val) => option.value === val.value}
            disableClearable
            value={user.filter((obj) => obj.value === value)[0] ?? null}
            onChange={(e, newVal) => setValue(newVal.value)}
            data-testid="Assignee"
            onBlur={onBlur}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="UserName"
                // label="Assignee"
                // name="Assignee"
              />
            )}
          />
        </div>
      );
    }

    if (id === "Comments") {
      return (
        <div style={{ padding: 2.5 }}>
          <TextField
            // fullWidth
            style={{ width: "275px", border: "2px Solid transparent" }}
            multiline
            rows={1}
            maxRows={4}
            // label="Comments"
            // name="Comments"
            value={value}
            variant="outlined"
            onChange={(e) => setValue(e.target.value)}
            size="small"
            inputProps={{
              "data-testid": "Comments",
            }}
            onBlur={onBlur}
            // required
          />
        </div>
      );
    }

    if (id === "UnitOfMeasure") {
      return (
        <div style={{ padding: 2.5 }}>
          <TextField
            style={{ width: "90px" }}
            // label="UOM"
            // name="UOM"
            value={value}
            variant="outlined"
            onChange={(e) => setValue(e.target.value)}
            size="small"
            inputProps={{
              "data-testid": "UOM",
            }}
            onBlur={onBlur}
            // required
          />
        </div>
      );
    }

    if (id === "KraName") {
      return (
        <div style={{ padding: 2.5 }}>
          <TextField
            // fullWidth
            style={{ width: "230px" }}
            multiline
            rows={1}
            maxRows={2}
            // label="KRA Name"
            name="KRA"
            value={value}
            variant="outlined"
            onChange={(e) => setValue(e.target.value)}
            size="small"
            inputProps={{
              "data-testid": "KRA",
            }}
            onBlur={onBlur}
            // required
          />
        </div>
      );
    }

    if (id === "Target") {
      return (
        <div style={{ padding: 2.5 }}>
          <TextField
            // fullWidth
            name="Target"
            // label="Target"
            variant="outlined"
            size="small"
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={onBlur}
            style={{ width: "85px" }}

            // required
          />
        </div>
      );
    }

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

function useSkipper() {
  const shouldSkipRef = useRef(true);
  const shouldSkip = shouldSkipRef.current;

  // Wrap a function with this to skip a pagination reset temporarily
  const skip = useCallback(() => {
    shouldSkipRef.current = false;
  }, []);

  useEffect(() => {
    shouldSkipRef.current = true;
  });

  return [shouldSkip, skip] as const;
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the itemRank info
  addMeta({
    itemRank,
  });

  // Return if the item should be filtered in/out
  return itemRank.passed;
};

function KraTable({
  columns,
  data,
  setData,
  handleBlur,
  unitOptions,
  actions = [],
}: Props) {
  const memoizedCols = useMemo<ColumnDef<any, any>[]>(() => columns, [columns]);
  const memoizedData = useMemo(() => data, [data]);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();
  const classes = useStyles();

  BLUR_FUNCTION = handleBlur;
  UNITS = unitOptions;

  const isAction = actions.length !== 0;

  const table = useReactTable({
    columns: memoizedCols,
    data: memoizedData,
    state: {
      globalFilter,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    // getPaginationRowModel: getPaginationRowModel(),
    defaultColumn: defaultColumn,
    // Provide our updateData function to our table meta
    meta: {
      updateData: (rowIndex: number, columnId: string, value: any) => {
        // Skip page index reset until after next rerender
        skipAutoResetPageIndex();
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
    <>
      <Grid
        container
        alignItems="center"
        justifyContent="space-between"
        style={{ margin: "5px 0" }}
      >
        <Grid item />
        <Grid item>
          <TextField
            fullWidth
            name="search"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            style={{ width: 400 }}
            placeholder="Search table"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MdSearch />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>
      <TableContainer style={{ paddingTop: "20px", borderRadius: "5px" }}>
        <Table style={{ border: "1px solid black" }}>
          <TableHead style={{ backgroundColor: "#0E0A42" }}>
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
                {isAction && (
                  <TableCell
                    align="center"
                    style={{ paddingRight: "5px" }}
                    className={classes.colName}
                  >
                    Action
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
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                  </TableCell>
                ))}
                {isAction ? (
                  <TableCell align="center" className={classes.bodyCell}>
                    <CustomMoreMenu
                      options={actions.map((obj) => ({
                        ...obj,
                        handleClick: () => obj.handler(row.original),
                      }))}
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                      }}
                      transformOrigin={{
                        vertical: "top",
                        horizontal: "right",
                      }}
                    />
                  </TableCell>
                ) : (
                  <TableCell />
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Box className={classes.footer}>
          {/* pagination  */}
          <Box>
            <IconButton
              size="small"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <MdSkipPrevious />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <MdChevronLeft />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <MdChevronRight />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <MdSkipNext />
            </IconButton>

            <Typography component="span" style={{ marginLeft: 10 }}>
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </Typography>
          </Box>

          {/* number of rows */}
          <FormControl variant="outlined" size="small">
            <InputLabel>Rows</InputLabel>
            <Select
              variant="outlined"
              label="Rows"
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <MenuItem key={pageSize} value={pageSize}>
                  {pageSize}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </TableContainer>
    </>
  );
}

export default KraTable;
