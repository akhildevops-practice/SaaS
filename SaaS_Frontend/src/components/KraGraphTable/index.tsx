import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
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
  Tooltip,
  Divider,
  TextField,
  Grid,
  Button,
  Popover,
  InputAdornment,
  Switch,
  TableFooter,
} from "@material-ui/core";
import {
  useReactTable,
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  GroupingState,
  flexRender,
  RowData,
  getFilteredRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  FilterFn,
} from "@tanstack/react-table";
import { MdChevronRight } from 'react-icons/md';
import { MdExpandMore } from 'react-icons/md';
import { MdChevronLeft } from 'react-icons/md';
import { MdSkipNext } from 'react-icons/md';
import { MdSkipPrevious } from 'react-icons/md';
import CustomMoreMenu from "../newComponents/CustomMoreMenu";
import useStyles from "./styles";
import { rankItem } from "@tanstack/match-sorter-utils";
import { MdAddBox } from 'react-icons/md';
import { MdCancel } from 'react-icons/md';
import { MdArrowDownward } from 'react-icons/md';
import { MdArrowUpward } from 'react-icons/md';
import { MdViewWeek } from 'react-icons/md';
import { MdSearch } from 'react-icons/md';
import React from "react";

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void;
  }
}

type Props = {
  columns: ColumnDef<any, any>[];
  data: any[];
  actions?: {
    label: string;
    icon: JSX.Element;
    handler: (x: any) => any;
  }[];
  rowGrouping?: string[];
  enableCustomRowGrouping?: boolean;
  // following props are for showing toolbar
  showToolbar?: boolean;
  hiddenColumns?: string[];
  footerGroups?: any[];
  reportDates: any[];
};

const BLUR_FUNCTION: (row: any) => any = () => {};
const UNITS: { value: string; type: string; typeId: string }[] = [];

interface CellObject {
  id: string;
  label: string;
  value: string;
}

const defaultColumn: Partial<ColumnDef<any>> = {
  cell: function Cell({ getValue, row: { index }, column: { id }, table }) {
    const initialValue = getValue();

    // We need to keep and update the state of the cell normally
    const [value, setValue] = useState<any>(initialValue);

    // If the initialValue is changed external, sync it up with our state
    useEffect(() => {
      setValue(initialValue);
    }, [initialValue]);

    useEffect(() => {
      BLUR_FUNCTION(table.options.data[index]);
    }, [table.options.data[index][id]]);

    // for (let i = 0; i < table.options.data.length; i++) {
    for (let j = 0; j < table.options.data[index].cellValue.length; j++) {
      for (
        let k = 0;
        k < table.options.data[index].cellValue[j].values.length;
        k++
      ) {
        if (id === table.options.data[index].cellValue[j].columnName) {
          return (
            <span>
              <span style={{ color: "red" }}>
                {table.options.data[index].cellValue[j].values[k].value}
              </span>
              -Val
              <br />
              <span style={{ color: "green" }}>
                {table.options.data[index].cellValue[j].values[k].target}
              </span>
              -Tar
              <br />
              {table.options.data[index].cellValue[j].values[k].average ? (
                <>
                  <span style={{ color: "#F8B33E" }}>
                    {table.options.data[index].cellValue[j].values[k].average}
                  </span>
                  -Avg
                  <br />
                </>
              ) : (
                ""
              )}
              {table.options.data[index].cellValue[j].values[k].percentage}- Per
            </span>
          );
        }
      }
    }

    return <>{value as string}</>;
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

function KraReportTable({
  columns,
  data,
  actions = [],
  rowGrouping = [],
  enableCustomRowGrouping = false,
  showToolbar = false,
  footerGroups,
  hiddenColumns = [],
  reportDates,
}: Props) {
  const memoizedCols = useMemo<ColumnDef<any, any>[]>(() => columns, [columns]);
  const memoizedData = useMemo(() => data, [data]);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [colsAnchorEl, setColsAnchorEl] = useState<HTMLButtonElement | null>(
    null
  );
  const [columnVisibility, setColumnVisibility] = useState({});
  const [colTitleSearch, setColTitleSearch] = useState<string>("");
  const [grouping, setGrouping] = useState<GroupingState>(rowGrouping);
  const classes = useStyles();
  const [tableDensity, setTableDensity] = useState<string>("standard");

  const isAction = actions.length !== 0;

  const table = useReactTable({
    columns: memoizedCols,
    data: memoizedData,

    state: {
      globalFilter,
      columnVisibility,
      grouping,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getExpandedRowModel: getExpandedRowModel(),
    globalFilterFn: fuzzyFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onGroupingChange: setGrouping,
    getPaginationRowModel: getPaginationRowModel(),
    defaultColumn: defaultColumn,
    getGroupedRowModel: getGroupedRowModel(),
  });

  return (
    <TableContainer
      style={{
        border: "1px solid #3335",
        borderRadius: 3,
        margin: "auto",
      }}
    >
      {/* toolbar */}
      {showToolbar && (
        <>
          {/* column hiding popover */}
          <Popover
            open={Boolean(colsAnchorEl)}
            anchorEl={colsAnchorEl}
            onClose={() => setColsAnchorEl(null)}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
          >
            <Box className={classes.popoverContainer}>
              <TextField
                name="colTitleSearch"
                label="Find column"
                placeholder="Column title"
                fullWidth
                size="small"
                style={{ marginBottom: 17 }}
                value={colTitleSearch}
                onChange={(e) => setColTitleSearch(e.target.value)}
              />
              <Grid
                container
                alignItems="center"
                justifyContent="space-between"
              >
                {table
                  .getAllLeafColumns()
                  .filter((obj: any) =>
                    obj.columnDef.header
                      .toLowerCase()
                      .includes(colTitleSearch.toLowerCase())
                  )
                  .map((column:any) => {
                    return (
                      <Grid
                        key={column.id}
                        item
                        xs={6}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-start",
                        }}
                      >
                        <Switch
                          color="primary"
                          size="small"
                          checked={column.getIsVisible()}
                          onChange={column.getToggleVisibilityHandler()}
                        />{" "}
                        <Typography
                          component="p"
                          style={{ fontSize: "0.85rem" }}
                        >
                          {column?.columnDef?.header}
                        </Typography>
                      </Grid>
                    );
                  })}
              </Grid>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                marginTop={1.7}
              >
                <Button
                  className={classes.toolbarButton}
                  onClick={() =>
                    table.getAllLeafColumns().forEach((obj: any) => {
                      if (obj.id !== "year" && obj.id !== "monthName") {
                        setColumnVisibility((prev: any) => ({
                          ...prev,
                          [obj.id]: false,
                        }));
                      }
                    })
                  }
                >
                  Hide All
                </Button>
                <Button
                  className={classes.toolbarButton}
                  onClick={() =>
                    table.getAllLeafColumns().forEach((obj: any) =>
                      setColumnVisibility((prev) => ({
                        ...prev,
                        [obj.id]: true,
                      }))
                    )
                  }
                >
                  Show All
                </Button>
              </Box>
            </Box>
          </Popover>

          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item>
              <Button
                className={classes.toolbarButton}
                startIcon={<MdViewWeek />}
                color="primary"
                onClick={(e) => setColsAnchorEl(e.currentTarget)}
              >
                Columns
              </Button>
            </Grid>
            <Grid item>
              <TextField
                fullWidth
                name="search"
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
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
        </>
      )}
      <Table style={{ border: "2px solid transparent", overflow: "hidden" }}>
        <TableHead>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} style={{ background: "#003059" }}>
              {headerGroup.headers.map((header) => (
                <TableCell
                  key={header.id}
                  colSpan={header.colSpan}
                  className={classes.colName}
                  style={{ width: header.getSize() }}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    {header.isPlaceholder ? null : (
                      <>
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          {enableCustomRowGrouping &&
                          header.column.getCanGroup() ? (
                            <>
                              {header.column.getIsGrouped() ? (
                                <Tooltip title="Remove Group">
                                  <IconButton
                                    onClick={header.column.getToggleGroupingHandler()}
                                    size="small"
                                  >
                                    <MdCancel
                                      fontSize="small"
                                      color="error"
                                    />
                                  </IconButton>
                                </Tooltip>
                              ) : (
                                <Tooltip title="Add Group">
                                  <IconButton
                                    onClick={header.column.getToggleGroupingHandler()}
                                    size="small"
                                  >
                                    <MdAddBox
                                      fontSize="small"
                                      color="primary"
                                    />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </>
                          ) : null}
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}

                          {header.column.getIsSorted() && (
                            <Tooltip title="Unsort">
                              <IconButton
                                size="small"
                                onClick={() => header.column.clearSorting()}
                              >
                                {{
                                  asc: <MdArrowUpward fontSize="small" />,
                                  desc: <MdArrowDownward fontSize="small" />,
                                }[header.column.getIsSorted() as string] ??
                                  null}
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </>
                    )}
                  </Box>
                </TableCell>
              ))}
              {isAction && (
                <TableCell align="center" className={classes.colName}>
                  Action
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableHead>

        <TableBody style={{ padding: "0 10px !important" }}>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} className={classes.row}>
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  {...{ key: cell.id }}
                  className={classes.bodyCell}
                  style={{
                    padding:
                      tableDensity === "compact"
                        ? "5px 3px 10px 10px"
                        : tableDensity === "comfortable"
                        ? "14px 3px 10px 10px"
                        : "10px 3px 10px 12px",
                  }}
                >
                  {cell.getIsGrouped() ? (
                    <>
                      <IconButton
                        onClick={row.getToggleExpandedHandler()}
                        size="small"
                        style={{
                          cursor: row.getCanExpand() ? "pointer" : "normal",
                        }}
                      >
                        {row.getIsExpanded() ? (
                          <MdExpandMore fontSize="small" />
                        ) : (
                          <MdChevronRight fontSize="small" />
                        )}
                      </IconButton>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}{" "}
                      ({row.subRows.length})
                    </>
                  ) : cell.getIsAggregated() ? (
                    // If the cell is aggregated, use the Aggregated renderer for cell
                    flexRender(
                      cell.column.columnDef.aggregatedCell ??
                        cell.column.columnDef.cell,
                      cell.getContext()
                    )
                  ) : cell.getIsPlaceholder() ? null : (
                    // For cells with repeated values, render null
                    // Otherwise, just render the regular cell
                    flexRender(cell.column.columnDef.cell, cell.getContext())
                  )}
                </TableCell>
              ))}
              {isAction && !row.getIsGrouped() ? (
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
              ) : null}
              <TableCell>
                <Divider absolute style={{ bottom: 0, left: 0, right: 0 }} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableCell
                  key={header.id}
                  colSpan={header.colSpan}
                  style={{
                    width: header.getSize(),
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    padding: "10px 10px",
                    color: "black",
                    textAlign: "center",
                    // borderBottom: "2px Solid #002B50",
                    // borderTop: "2px Solid #002B50",
                  }}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    {header.isPlaceholder ? null : (
                      <>
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          {enableCustomRowGrouping &&
                          header.column.getCanGroup() ? (
                            <>
                              {header.column.getIsGrouped() ? (
                                <Tooltip title="Remove Group">
                                  <IconButton
                                    onClick={header.column.getToggleGroupingHandler()}
                                    size="small"
                                  >
                                    <MdCancel
                                      fontSize="small"
                                      color="error"
                                    />
                                  </IconButton>
                                </Tooltip>
                              ) : (
                                <Tooltip title="Add Group">
                                  <IconButton
                                    onClick={header.column.getToggleGroupingHandler()}
                                    size="small"
                                  >
                                    <MdAddBox
                                      fontSize="small"
                                      color="primary"
                                    />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </>
                          ) : null}
                          {flexRender(
                            header.column.columnDef.footer,
                            header.getContext()
                          )}

                          {header.column.getIsSorted() && (
                            <Tooltip title="Unsort">
                              <IconButton
                                size="small"
                                onClick={() => header.column.clearSorting()}
                              >
                                {{
                                  asc: <MdArrowUpward fontSize="small" />,
                                  desc: <MdArrowDownward fontSize="small" />,
                                }[header.column.getIsSorted() as string] ??
                                  null}
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </>
                    )}
                  </Box>
                </TableCell>
              ))}
              {isAction && (
                <TableCell align="center" className={classes.colName}>
                  Action
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableFooter>
      </Table>

      <Box className={classes.footer}>
        {/* pagination */}
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
  );
}

export default KraReportTable;
