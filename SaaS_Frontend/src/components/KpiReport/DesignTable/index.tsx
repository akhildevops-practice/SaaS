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
  InputBase,
  Divider,
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
import { MdArrowDownward } from 'react-icons/md';
import { MdArrowUpward } from 'react-icons/md';
import CustomMoreMenu from "../../newComponents/CustomMoreMenu";
import useStyles from "./styles";

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void;
  }
}

type Props = {
  columns: ColumnDef<any, any>[];
  data: any[];
  setData: React.Dispatch<React.SetStateAction<any[]>>;
  handleBlur: (row: any) => any; // required
  columnVisibility: any;
  setColumnVisibility: React.Dispatch<React.SetStateAction<any>>;
  actions?: {
    label: string;
    icon: JSX.Element;
    handler: (x: any) => any;
  }[];
  reportStatus: string;
};

let BLUR_FUNCTION: (row: any) => any = () => {};
let STATUS = "DRAFT";

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

    useEffect(() => {
      // BLUR_FUNCTION(DATA[index]);
      BLUR_FUNCTION(table.options.data[index]);
    }, [table.options.data[index][id]]);

    // If the initialValue is changed external, sync it up with our state
    useEffect(() => {
      setValue(initialValue);
    }, [initialValue]);

    if (id === "kpiValue" || id === "kpiComments") {
      return (
        <InputBase
          fullWidth
          className={classes.dataCell}
          value={value as string}
          onChange={(e) => setValue(e.target.value)}
          onBlur={onBlur}
          disabled={STATUS === "SUBMIT"}
        />
      );
    }

    if (id === "kpi") {
      return (
        <Typography className={classes.bodyCell}>
          {value.label as string}
        </Typography>
      );
    }

    return (
      <Typography className={classes.bodyCell}>{value as string}</Typography>
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

function KpiReportDesignTable({
  columns,
  data,
  setData = () => {},
  handleBlur = () => {},
  columnVisibility,
  setColumnVisibility,
  actions = [],
  reportStatus,
}: Props) {
  const COL_COUNT = columns.length;

  const [globalFilter, setGlobalFilter] = useState<string>("");

  const [sorting, setSorting] = useState<SortingState>([]);

  // const [columnVisibility, setColumnVisibility] = useState({});
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);

  const memoizedCols = useMemo<ColumnDef<any, any>[]>(() => columns, [columns]);
  const memoizedData = useMemo(() => data, [data]);

  // const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();
  const classes = useStyles();

  BLUR_FUNCTION = handleBlur;
  STATUS = reportStatus;

  const isAction = actions.length !== 0;

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
      }}
    >
      <Table
        style={{
          border: "2px solid transparent",
          minWidth: 500,
          // overflowX: "scroll",
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
                    padding: "5px 3px",
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
              {table.getPrePaginationRowModel().rows.length} rows
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

export default KpiReportDesignTable;
