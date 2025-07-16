import {
  useState,
  useEffect,
  useMemo,
  // useCallback, useRef
} from "react";
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
  // FormControl,
  // InputLabel,
  // Select,
  MenuItem,
  InputBase,
  Switch,
  Button,
  Popover,
  Divider,
  Grid,
  TextField,
  Menu,
  ListItemIcon,
  InputAdornment,
} from "@material-ui/core";
import {
  useReactTable,
  ColumnOrderState,
  SortingState,
  getCoreRowModel,
  getExpandedRowModel,
  getGroupedRowModel,
  // getPaginationRowModel,
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
import { MdArrowBack } from 'react-icons/md';
import { MdArrowForward } from 'react-icons/md';
import { MdArrowDownward } from 'react-icons/md';
import { MdArrowUpward } from 'react-icons/md';
import { MdViewWeek } from 'react-icons/md';
import { MdReorder } from 'react-icons/md';
import { MdViewDay } from 'react-icons/md';
import { MdViewAgenda } from 'react-icons/md';
import { MdSearch } from 'react-icons/md';
import CustomMoreMenu from "../../newComponents/CustomMoreMenu";
import useStyles from "./styles";
import { IKpiReportTemplateCategorySchema } from "../../../schemas/kpiReportTemplateSchema";

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void;
  }
}

type Props = {
  columns: ColumnDef<any, any>[];
  data: IKpiReportTemplateCategorySchema[];
  setData: React.Dispatch<
    React.SetStateAction<IKpiReportTemplateCategorySchema[]>
  >;
  handleBlur: (row: any, updatedKpiTarget?: any) => any; // required
  kpiOptions: { value: string; label: string }[];
  krakpiOptions: { value: string; label: string }[];
  fetchTargetValue?: any;
  selectedKpi?: any;
  // columnVisibility: any;
  // setColumnVisibility: React.Dispatch<React.SetStateAction<any>>;
  actions?: {
    label: string;
    icon: JSX.Element;
    handler: (x: any) => any;
  }[];
};

let BLUR_FUNCTION: (row: any) => any = () => {};
let KPI_OPTIONS: { value: string; label: string }[] = [];
let fetchTarget: any = () => {};
let kpivalue: any;

// let DATA: any[] = [];

const defaultColumn: Partial<ColumnDef<any>> = {
  cell: function Cell({ getValue, row: { index }, column: { id }, table }) {
    const initialValue = getValue();
    // We need to keep and update the state of the cell normally
    const [value, setValue] = useState<any>(initialValue);
    const [kpiValue, setKpiValue] = useState<any>(kpivalue);
    const [targetValue, setTargetValue] = useState<any>();

    const classes = useStyles();

    // When the input is blurred, we'll call our table meta's updateData function
    const onBlur = () => {
      console.log("index,id,value", index, id, value);
      table.options.meta?.updateData(index, id, value);
      console.log("table.options", table.options.data);
    };
    const handleTargetBlur = (newValue: any) => {
      console.log("index value", newValue, index);
      table.options.meta?.updateData(index, id, newValue);
    };
    const handleChange = async (newKpi: any) => {
      setValue(newKpi);
      console.log("value in handlechage", newKpi);

      // Fetch target value asynchronously
      const newTarget = await fetchTarget(newKpi);

      // Log the fetched target value
      console.log("newTarget", newTarget);

      // Set targetValue state immediately after fetching
      setTargetValue(newTarget);

      console.log("targetValue", targetValue);
    };

    useEffect(() => {
      // BLUR_FUNCTION(DATA[index]);
      BLUR_FUNCTION(table.options.data[index]);
    }, [table.options.data[index][id], value]);

    // If the initialValue is changed external, sync it up with our state
    useEffect(() => {
      setValue(initialValue);
    }, [initialValue]);

    if (id === "kpi") {
      // return (
      //   <Autocomplete
      //     fullWidth
      //     size="small"
      //     style={{ fontSize: "0.85rem" }}
      //     options={KPI_OPTIONS}
      //     getOptionLabel={(option: { label: string; value: string }) =>
      //       option.label
      //     }
      //     getOptionSelected={(option, value) => true}
      //     disableClearable
      //     value={value.value ? value : null}
      //     onChange={(e, newVal) => handleChange(newVal)}
      //     onBlur={onBlur}
      //     renderInput={(params) => (
      //       <TextField
      //         {...params}
      //         variant="outlined"
      //         placeholder="Search KPI"
      //       />
      //     )}
      //   />
      // );
      return (
        <TextField
          fullWidth
          size="small"
          style={{ fontSize: "0.85rem" }}
          variant="outlined"
          placeholder="Search KPI"
          value={kpiValue}
          onChange={handleChange}
          onBlur={onBlur}
        />
      );
    }

    // if (id === "kpiTarget") {
    //   return (
    //     <>
    //       {console.log("targetValue", value)}

    //       <InputBase
    //         fullWidth
    //         className={classes.dataCell}
    //         value={value as string}
    //         onChange={(e) => setValue(e.target.value)}
    //         onBlur={onBlur}
    //       />
    //     </>
    //   );
    // }

    if (
      id === "kpiTargetType" ||
      id === "description" ||
      id === "uom" ||
      id === "value" ||
      id === "comments" ||
      id === "variance" ||
      id === "score" ||
      id === "monthlyAvg" ||
      id === "annualAvg" ||
      id === "mtd" ||
      id === "ytd" ||
      id === "ratio"
    ) {
      return (
        <Typography className={classes.bodyCell}>{value as string}</Typography>
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

// function useSkipper() {
//   const shouldSkipRef = useRef(true);
//   const shouldSkip = shouldSkipRef.current;

//   // Wrap a function with this to skip a pagination reset temporarily
//   const skip = useCallback(() => {
//     shouldSkipRef.current = false;
//   }, []);

//   useEffect(() => {
//     shouldSkipRef.current = true;
//   });

//   return [shouldSkip, skip] as const;
// }

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

function KpiReportTemplateDesignTable({
  columns,
  data,
  setData = () => {},
  handleBlur = () => {},
  kpiOptions,
  krakpiOptions,
  // columnVisibility,
  // setColumnVisibility,
  fetchTargetValue,
  selectedKpi,
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

  const [columnVisibility, setColumnVisibility] = useState({});
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);

  const memoizedCols = useMemo<ColumnDef<any, any>[]>(() => columns, [columns]);
  const memoizedData = useMemo(() => data, [data]);

  // const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();
  const classes = useStyles();

  BLUR_FUNCTION = handleBlur;
  KPI_OPTIONS = krakpiOptions.length > 0 ? krakpiOptions : kpiOptions;
  // DATA = memoizedData;
  fetchTarget = fetchTargetValue;
  const isAction = actions.length !== 0;
  kpivalue = selectedKpi;
  console.log("kpivalue,selectedKpi", kpivalue, selectedKpi);
  // default table parameters along with grouping
  const tableParameters: any = {
    columns: memoizedCols,
    data: memoizedData,
    state: {
      columnVisibility,
      columnOrder,
      globalFilter,
      sorting,
    },
    getCoreRowModel: getCoreRowModel(),
    // getPaginationRowModel: getPaginationRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
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

    defaultColumn: defaultColumn,
    // autoResetPageIndex,
    // Provide our updateData function to our table meta
    meta: {
      updateData: (rowIndex: number, columnId: number, value: any) => {
        // Skip page index reset until after next rerender
        // skipAutoResetPageIndex();
        console.log("rowIndex and columnID", rowIndex, columnId, value);
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

  const table = useReactTable(tableParameters);

  // useEffect(() => {
  //   // table.setColumnOrder(memoizedCols.map((obj: any) => obj.accessorKey));
  //   table
  //     .getAllLeafColumns()
  //     .filter((obj: any) => hiddenColumns.includes(obj.id))
  //     .forEach((obj: any) =>
  //       setColumnVisibility((prev) => ({
  //         ...prev,
  //         [obj.id]: false,
  //       }))
  //     );
  // }, []);

  return (
    <TableContainer
      style={{
        border: "1px solid #3335",
        borderRadius: 3,
        margin: "auto",
        width: table.getCenterTotalSize(),
        minWidth: "99%",
        overflowX: "hidden",
        overflowY: "auto",
      }}
    >
      {/* toolbar */}
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
            <Grid container alignItems="center" justifyContent="space-between">
              {table
                .getAllLeafColumns()
                .filter((obj: any) =>
                  obj.columnDef.header
                    .toLowerCase()
                    .includes(colTitleSearch.toLowerCase())
                )
                .map((column: any) => {
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
                        disabled={
                          column.columnDef.accessorKey === "kpi" ||
                          column.columnDef.accessorKey === "kpiTargetType" ||
                          column.columnDef.accessorKey === "target" ||
                          column.columnDef.accessorKey === "value" ||
                          column.columnDef.accessorKey === "comments"
                        }
                      />
                      <Typography component="p" style={{ fontSize: "0.85rem" }}>
                        {column.columnDef.header}
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
                    if (
                      obj.id !== "kpi" &&
                      obj.id !== "kpiTargetType" &&
                      obj.id !== "target" &&
                      obj.id !== "value" &&
                      obj.id !== "comments"
                    ) {
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
                    setColumnVisibility((prev: any) => ({
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

      <Table
        style={{
          border: "2px solid transparent",
          minWidth: 500,
          overflowX: "scroll",
        }}
      >
        <TableHead>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              style={{ backgroundColor: "#f7f7ff" }}
            >
              {headerGroup.headers.map((header) => (
                <TableCell
                  key={header.id}
                  colSpan={header.colSpan}
                  className={classes.colName}
                  style={{
                    position: "relative",
                    width: header.getSize(),
                    borderRight: "1px solid #0002",
                    paddingLeft: 3,
                  }}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    style={{ marginRight: 3 }}
                  >
                    {header.isPlaceholder ? null : (
                      <>
                        <Box>
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

                        <CustomMoreMenu
                          options={[
                            ...(header.column.getCanSort()
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
                                    icon: <MdArrowUpward fontSize="small" />,
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
                            ...(table
                              .getState()
                              .columnOrder.indexOf(header.column.id) === 0
                              ? [
                                  {
                                    label: "Move Right",
                                    handleClick: () => {
                                      const currIndex = table
                                        .getState()
                                        .columnOrder.indexOf(header.column.id);

                                      for (let i = 0; i < COL_COUNT; i++) {
                                        if (i === currIndex) {
                                          const temp =
                                            table.getState().columnOrder[i + 1];
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
                                    icon: <MdArrowForward fontSize="small" />,
                                  },
                                ]
                              : table
                                  .getState()
                                  .columnOrder.indexOf(header.column.id) ===
                                COL_COUNT - 1
                              ? [
                                  {
                                    label: "Move Left",
                                    handleClick: () => {
                                      const currIndex = table
                                        .getState()
                                        .columnOrder.indexOf(header.column.id);

                                      for (let i = 0; i < COL_COUNT; i++) {
                                        if (i === currIndex - 1) {
                                          const temp =
                                            table.getState().columnOrder[i];
                                          table.setColumnOrder((prev) =>
                                            prev.map((str, j) => {
                                              if (j === i)
                                                return header.column.id;
                                              return str;
                                            })
                                          );
                                          table.setColumnOrder((prev) =>
                                            prev.map((str, j) => {
                                              if (j === i + 1) return temp;
                                              return str;
                                            })
                                          );
                                          break;
                                        }
                                      }
                                    },
                                    icon: <MdArrowBack fontSize="small" />,
                                  },
                                ]
                              : [
                                  {
                                    label: "Move Left",
                                    handleClick: () => {
                                      const currIndex = table
                                        .getState()
                                        .columnOrder.indexOf(header.column.id);

                                      for (let i = 0; i < COL_COUNT; i++) {
                                        if (i === currIndex - 1) {
                                          const temp =
                                            table.getState().columnOrder[i];
                                          table.setColumnOrder((prev) =>
                                            prev.map((str, j) => {
                                              if (j === i)
                                                return header.column.id;
                                              return str;
                                            })
                                          );
                                          table.setColumnOrder((prev) =>
                                            prev.map((str, j) => {
                                              if (j === i + 1) return temp;
                                              return str;
                                            })
                                          );
                                          break;
                                        }
                                      }
                                    },
                                    icon: <MdArrowBack fontSize="small" />,
                                  },
                                  {
                                    label: "Move Right",
                                    handleClick: () => {
                                      const currIndex = table
                                        .getState()
                                        .columnOrder.indexOf(header.column.id);

                                      for (let i = 0; i < COL_COUNT; i++) {
                                        if (i === currIndex) {
                                          const temp =
                                            table.getState().columnOrder[i + 1];
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
                                    icon: <MdArrowForward fontSize="small" />,
                                  },
                                ]),
                          ]}
                        />
                      </>
                    )}
                  </Box>
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
                  className={classes.bodyCell}
                  style={{
                    borderRight: "1px solid #0002",
                    padding:
                      tableDensity === "compact"
                        ? "5px 3px"
                        : tableDensity === "comfortable"
                        ? "14px 3px"
                        : "10px 3px",
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
                    disabled={row.id === "0"}
                  />
                </TableCell>
              ) : (
                <TableCell />
              )}
              <TableCell>
                <Divider absolute style={{ bottom: 0, left: 0, right: 0 }} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Box className={classes.footer}>
        <Box display="flex" alignItems="center" justifyContent="center">
          {/* <Box>
            <IconButton
              size="small"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <SkipPreviousIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeftIcon />
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
              <SkipNextIcon />
            </IconButton>
          </Box> */}

          <Box marginLeft={2}>
            {/* <Typography component="p">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </Typography> */}
            <Typography component="p" style={{ fontSize: "0.85rem" }}>
              {table.getPrePaginationRowModel().rows.length - 1} rows
            </Typography>
          </Box>
        </Box>

        {/* <FormControl variant="outlined" size="small">
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
        </FormControl> */}
      </Box>
    </TableContainer>
  );
}

export default KpiReportTemplateDesignTable;
