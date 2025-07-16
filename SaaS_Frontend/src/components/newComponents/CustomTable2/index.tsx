import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Tooltip,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputBase,
  Switch,
  Button,
  Popover,
  Grid,
  TextField,
  Menu,
  ListItemIcon,
  InputAdornment,
} from "@material-ui/core";
import {
  useReactTable,
  GroupingState,
  ColumnOrderState,
  SortingState,
  getCoreRowModel,
  getExpandedRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  RowData,
  ColumnDef,
  FilterFn,
} from "@tanstack/react-table";
import { rankItem } from "@tanstack/match-sorter-utils";
import { MdChevronRight } from 'react-icons/md';
import { MdExpandMore } from 'react-icons/md';
import { MdChevronLeft } from 'react-icons/md';
import { MdSkipNext } from 'react-icons/md';
import { MdSkipPrevious } from 'react-icons/md';
import { MdAddBox } from 'react-icons/md';
import { MdCancel } from 'react-icons/md';
import { MdArrowBack } from 'react-icons/md';
import { MdArrowForward } from 'react-icons/md';
import { MdArrowDownward } from 'react-icons/md';
import { MdArrowUpward } from 'react-icons/md';
import { MdViewWeek } from 'react-icons/md';
import { MdReorder } from 'react-icons/md';
import { MdViewDay } from 'react-icons/md';
import { MdViewAgenda } from 'react-icons/md';
import { MdSearch } from 'react-icons/md';
import CustomMoreMenu from "../CustomMoreMenu";
import useStyles from "./styles";
import { useTheme } from "@material-ui/core";

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void;
  }
}

type Props = {
  columns: ColumnDef<any, any>[];
  data: any[];

  // following props for inline editing
  editable?: boolean; // required
  setData?: React.Dispatch<React.SetStateAction<any>>; // required
  handleBlur?: (row: any) => any; // required

  // following props for row grouping
  rowGrouping?: string[]; // required
  enableCustomRowGrouping?: boolean; // optional

  // following props are for column ordering
  enableColumnOrdering?: boolean;

  // following props are for column sorting
  enableColumnSorting?: boolean;

  // following props are for column resizing
  enableColumnResizing?: boolean;

  // following props are for showing toolbar
  showToolbar?: boolean;

  // following props are for default hidden columns
  hiddenColumns?: string[];

  // following props for last column action buttons
  actions?: {
    label: string;
    icon?: JSX.Element;
    handler: (x: any) => any;
  }[];
};

let BLUR_FUNCTION: (row: any) => any = () => {};

let DATA: any[] = [];

const defaultColumn: Partial<ColumnDef<any>> = {
  cell: function Cell({ getValue, row: { index }, column: { id }, table }) {
    const initialValue = getValue();
    // We need to keep and update the state of the cell normally
    const [value, setValue] = useState(initialValue);

    const classes = useStyles();

    // When the input is blurred, we'll call our table meta's updateData function
    const onBlur = () => {
      table.options.meta?.updateData(index, id, value);
    };

    useEffect(() => {
      BLUR_FUNCTION(DATA[index]);
    }, [table.options.data[index][id]]);

    // If the initialValue is changed external, sync it up with our state
    useEffect(() => {
      setValue(initialValue);
    }, [initialValue]);

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

function CustomTable2({
  columns,
  data,
  editable = false,
  setData = () => {},
  handleBlur = () => {},
  rowGrouping = [],
  enableCustomRowGrouping = false,
  enableColumnOrdering = false,
  enableColumnSorting = false,
  enableColumnResizing = false,
  showToolbar = false,
  hiddenColumns = [],
  actions = [],
}: Props) {
  const COL_COUNT = columns.length;

  const [colsAnchorEl, setColsAnchorEl] = useState<HTMLButtonElement | null>(
    null
  );
  const [colTitleSearch, setColTitleSearch] = useState<string>("");

  const [densityAnchorEl, setDensityAnchorEl] =
    useState<HTMLButtonElement | null>(null);
  const [tableDensity, setTableDensity] = useState<string>("standard");

  const [globalFilter, setGlobalFilter] = useState<string>("");

  const [sorting, setSorting] = useState<SortingState>([]);

  const [grouping, setGrouping] = useState<GroupingState>(rowGrouping);

  const [columnVisibility, setColumnVisibility] = useState({});
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);

  const memoizedCols = useMemo<ColumnDef<any, any>[]>(() => columns, [columns]);
  const memoizedData = useMemo(() => data, [data]);

  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();
  const classes = useStyles();

  const theme = useTheme();

  BLUR_FUNCTION = handleBlur;
  DATA = memoizedData;

  const isAction = actions.length !== 0;

  // default table parameters along with grouping
  let tableParameters: any = {
    columns: memoizedCols,
    data: memoizedData,
    state: {
      grouping,
      columnVisibility,
      columnOrder,
      globalFilter,
      sorting,
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onGroupingChange: setGrouping,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    globalFilterFn: fuzzyFilter,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    // debugTable: true,
    // debugHeaders: true,
    // debugColumns: true,
  };

  if (editable) {
    tableParameters = {
      ...tableParameters,
      defaultColumn: defaultColumn,
      autoResetPageIndex,
      // Provide our updateData function to our table meta
      meta: {
        updateData: (rowIndex: number, columnId: number, value: any) => {
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
    };
  }

  const table = useReactTable(tableParameters);

  useEffect(() => {
    table.setColumnOrder(memoizedCols.map((obj: any) => obj.accessorKey));
    table
      .getAllLeafColumns()
      .filter((obj: any) => hiddenColumns.includes(obj.id))
      .forEach((obj: any) =>
        setColumnVisibility((prev) => ({
          ...prev,
          [obj.id]: false,
        }))
      );
  }, []);

  return (
    <div data-testid="custom-table" className={classes.tableContainer}>
      <TableContainer
        // style={{
        //   border: "1px solid #3335",
        //   borderRadius: 3,
        //   margin: "auto",
        //   width: enableColumnResizing ? table.getCenterTotalSize() : "",
        // }}
        className={classes.tableContainer}
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
                      table.getAllLeafColumns().forEach((obj: any) =>
                        setColumnVisibility((prev) => ({
                          ...prev,
                          [obj.id]: false,
                        }))
                      )
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
            {/* row density menu */}
            <Menu
              anchorEl={densityAnchorEl}
              keepMounted
              open={Boolean(densityAnchorEl)}
              onClose={() => setDensityAnchorEl(null)}
            >
              <MenuItem
                onClick={() => {
                  setTableDensity("compact");
                  setDensityAnchorEl(null);
                }}
              >
                <ListItemIcon>
                  <MdReorder color="primary" />
                </ListItemIcon>
                <Typography color="primary" variant="inherit">
                  Compact
                </Typography>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setTableDensity("standard");
                  setDensityAnchorEl(null);
                }}
              >
                <ListItemIcon>
                  <MdViewDay color="primary" />
                </ListItemIcon>
                <Typography color="primary" variant="inherit">
                  Standard
                </Typography>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setTableDensity("comfortable");
                  setDensityAnchorEl(null);
                }}
              >
                <ListItemIcon>
                  <MdViewAgenda color="primary" />
                </ListItemIcon>
                <Typography color="primary" variant="inherit">
                  Comfortable
                </Typography>
              </MenuItem>
            </Menu>

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
                {!editable && (
                  <Button
                    className={classes.toolbarButton}
                    startIcon={
                      tableDensity === "comfortable" ? (
                        <MdViewAgenda />
                      ) : tableDensity === "compact" ? (
                        <MdReorder />
                      ) : (
                        <MdViewDay />
                      )
                    }
                    color="primary"
                    onClick={(e) => setDensityAnchorEl(e.currentTarget)}
                  >
                    Density
                  </Button>
                )}
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
        <div data-testid="custom-table" className={classes.tableContainer}>
          <Table
            style={{ border: "2px solid transparent", overflow: "hidden" }}
          >
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  style={{ background: "#E8F3F9" }}
                >
                  {headerGroup.headers.map((header) => (
                    <TableCell
                      key={header.id}
                      colSpan={header.colSpan}
                      className={classes.colName}
                      style={
                        enableColumnResizing &&
                        !(
                          columnOrder.indexOf(header.id) ===
                          memoizedCols.length - 1
                        )
                          ? {
                              position: "relative",
                              width: header.getSize(),
                              borderRight: "1px solid #0002",
                              paddingLeft: 3,
                            }
                          : enableColumnResizing
                          ? {
                              position: "relative",
                              width: header.getSize(),
                            }
                          : {
                              width: header.getSize(),
                            }
                      }
                    >
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        style={enableColumnResizing ? { marginRight: 3 } : {}}
                      >
                        {header.isPlaceholder ? null : (
                          <>
                            <Box>
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
                                      desc: (
                                        <MdArrowDownward fontSize="small" />
                                      ),
                                    }[header.column.getIsSorted() as string] ??
                                      null}
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>

                            {enableColumnOrdering || enableColumnSorting ? (
                              <CustomMoreMenu
                                options={[
                                  ...(enableColumnSorting &&
                                  header.column.getCanSort()
                                    ? [
                                        {
                                          label: "Ascending",
                                          handleClick: () => {
                                            const colSortObj = sorting.filter(
                                              (obj) => obj.id === header.id
                                            )[0];
                                            if (colSortObj) {
                                              setSorting((prev: any) =>
                                                prev.map((obj: any) => {
                                                  if (obj.id === header.id)
                                                    return {
                                                      id: obj.id,
                                                      desc: false,
                                                    };
                                                  return obj;
                                                })
                                              );
                                            } else {
                                              setSorting((prev: any) => [
                                                ...prev,
                                                {
                                                  id: header.id,
                                                  desc: false,
                                                },
                                              ]);
                                            }
                                          },
                                          icon: (
                                            <MdArrowUpward fontSize="small" />
                                          ),
                                        },
                                        {
                                          label: "Descending",
                                          handleClick: () => {
                                            const colSortObj = sorting.filter(
                                              (obj) => obj.id === header.id
                                            )[0];
                                            if (colSortObj) {
                                              setSorting((prev: any) =>
                                                prev.map((obj: any) => {
                                                  if (obj.id === header.id)
                                                    return {
                                                      id: obj.id,
                                                      desc: true,
                                                    };
                                                  return obj;
                                                })
                                              );
                                            } else {
                                              setSorting((prev: any) => [
                                                ...prev,
                                                {
                                                  id: header.id,
                                                  desc: true,
                                                },
                                              ]);
                                            }
                                          },
                                          icon: (
                                            <MdArrowDownward fontSize="small" />
                                          ),
                                        },
                                      ]
                                    : []),
                                  ...(enableColumnOrdering
                                    ? table
                                        .getState()
                                        .columnOrder.indexOf(
                                          header.column.id
                                        ) === 0
                                      ? [
                                          {
                                            label: "Move Right",
                                            handleClick: () => {
                                              const currIndex = table
                                                .getState()
                                                .columnOrder.indexOf(
                                                  header.column.id
                                                );

                                              for (
                                                let i = 0;
                                                i < COL_COUNT;
                                                i++
                                              ) {
                                                if (i === currIndex) {
                                                  const temp =
                                                    table.getState()
                                                      .columnOrder[i + 1];
                                                  table.setColumnOrder((prev) =>
                                                    prev.map((str, j) => {
                                                      if (j === i) return temp;
                                                      return str;
                                                    })
                                                  );
                                                  table.setColumnOrder((prev) =>
                                                    prev.map((str, j) => {
                                                      if (j === i + 1)
                                                        return header.column.id;
                                                      return str;
                                                    })
                                                  );
                                                  break;
                                                }
                                              }
                                            },
                                            icon: (
                                              <MdArrowForward fontSize="small" />
                                            ),
                                          },
                                        ]
                                      : table
                                          .getState()
                                          .columnOrder.indexOf(
                                            header.column.id
                                          ) ===
                                        COL_COUNT - 1
                                      ? [
                                          {
                                            label: "Move Left",
                                            handleClick: () => {
                                              const currIndex = table
                                                .getState()
                                                .columnOrder.indexOf(
                                                  header.column.id
                                                );

                                              for (
                                                let i = 0;
                                                i < COL_COUNT;
                                                i++
                                              ) {
                                                if (i === currIndex - 1) {
                                                  const temp =
                                                    table.getState()
                                                      .columnOrder[i];
                                                  table.setColumnOrder((prev) =>
                                                    prev.map((str, j) => {
                                                      if (j === i)
                                                        return header.column.id;
                                                      return str;
                                                    })
                                                  );
                                                  table.setColumnOrder((prev) =>
                                                    prev.map((str, j) => {
                                                      if (j === i + 1)
                                                        return temp;
                                                      return str;
                                                    })
                                                  );
                                                  break;
                                                }
                                              }
                                            },
                                            icon: (
                                              <MdArrowBack fontSize="small" />
                                            ),
                                          },
                                        ]
                                      : [
                                          {
                                            label: "Move Left",
                                            handleClick: () => {
                                              const currIndex = table
                                                .getState()
                                                .columnOrder.indexOf(
                                                  header.column.id
                                                );

                                              for (
                                                let i = 0;
                                                i < COL_COUNT;
                                                i++
                                              ) {
                                                if (i === currIndex - 1) {
                                                  const temp =
                                                    table.getState()
                                                      .columnOrder[i];
                                                  table.setColumnOrder((prev) =>
                                                    prev.map((str, j) => {
                                                      if (j === i)
                                                        return header.column.id;
                                                      return str;
                                                    })
                                                  );
                                                  table.setColumnOrder((prev) =>
                                                    prev.map((str, j) => {
                                                      if (j === i + 1)
                                                        return temp;
                                                      return str;
                                                    })
                                                  );
                                                  break;
                                                }
                                              }
                                            },
                                            icon: (
                                              <MdArrowBack fontSize="small" />
                                            ),
                                          },
                                          {
                                            label: "Move Right",
                                            handleClick: () => {
                                              const currIndex = table
                                                .getState()
                                                .columnOrder.indexOf(
                                                  header.column.id
                                                );

                                              for (
                                                let i = 0;
                                                i < COL_COUNT;
                                                i++
                                              ) {
                                                if (i === currIndex) {
                                                  const temp =
                                                    table.getState()
                                                      .columnOrder[i + 1];
                                                  table.setColumnOrder((prev) =>
                                                    prev.map((str, j) => {
                                                      if (j === i) return temp;
                                                      return str;
                                                    })
                                                  );
                                                  table.setColumnOrder((prev) =>
                                                    prev.map((str, j) => {
                                                      if (j === i + 1)
                                                        return header.column.id;
                                                      return str;
                                                    })
                                                  );
                                                  break;
                                                }
                                              }
                                            },
                                            icon: (
                                              <MdArrowForward fontSize="small" />
                                            ),
                                          },
                                        ]
                                    : []),
                                ]}
                              />
                            ) : null}
                          </>
                        )}
                      </Box>

                      {enableColumnResizing ? (
                        <Box
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={`${classes.resizer} ${
                            header.column.getIsResizing() ? "isResizing" : ""
                          }`}
                        />
                      ) : null}
                    </TableCell>
                  ))}
                  {isAction && (
                    <TableCell
                      align="center"
                      className={classes.colName}
                      style={{ width: 0 }}
                    >
                      Actions
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
                      className={editable ? "" : classes.bodyCell}
                      style={{
                        ...(editable
                          ? {}
                          : {
                              padding:
                                tableDensity === "compact"
                                  ? "5px 3px"
                                  : tableDensity === "comfortable"
                                  ? "14px 3px"
                                  : "10px 3px",
                            }),
                        ...(!(
                          columnOrder.indexOf(cell.column.id) ===
                          memoizedCols.length - 1
                        ) && enableColumnResizing
                          ? {
                              borderRight: "1px solid #0002",
                            }
                          : {}),
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
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Box
          className={classes.footer}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* pagination  */}
          <Box display="flex" alignItems="right" justifyContent="center">
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
            </Box>

            <Box marginLeft={2}>
              <Typography component="p">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </Typography>
              <Typography component="p" style={{ fontSize: "0.85rem" }}>
                {table.getPrePaginationRowModel().rows.length} rows
              </Typography>
            </Box>
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
    </div>
  );
}

export default CustomTable2;
