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
  Tooltip,
  Button,
} from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import { MdInsertDriveFile } from 'react-icons/md';
import { useSnackbar } from "notistack";
import {
  useReactTable,
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  RowData,
  getFilteredRowModel,
  FilterFn,
} from "@tanstack/react-table";
import { rankItem } from "@tanstack/match-sorter-utils";
import { MdChevronRight } from 'react-icons/md';
import { MdChevronLeft } from 'react-icons/md';
import { MdSkipNext } from 'react-icons/md';
import { MdSkipPrevious } from 'react-icons/md';
import { MdSearch } from 'react-icons/md';
import CustomMoreMenu from "../newComponents/CustomMoreMenu";
import useStyles from "./styles";
import { Modal } from "antd";
import axios from "apis/axios.global";
import getAppUrl from "utils/getAppUrl";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import { MdOutlineContentCopy } from "react-icons/md";
import { AiOutlineAim } from "react-icons/ai";
import getSessionStorage from "utils/getSessionStorage";
declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void;
  }
}

type Props = {
  columns: ColumnDef<any, any>[];
  data: any[];
  setData: React.Dispatch<React.SetStateAction<any>>;
  handleBlur: (row: any, index: number, modalTargetData: any) => any;
  unitOptions: { value: string; type: string; typeId: string }[];
  kraOptions: any;
  source?: any;
  searchText?: any;
  setSearchText?: any;
  modalTargetData?: any;
  setModalTargetData?: any;
  update?: any;
  setUpdate?: any;
  actions?: {
    label: string;
    icon: JSX.Element;
    handler: (x: any) => any;
  }[];
};
let BLUR_FUNCTION: (
  row: any,
  index: number,
  targetModalData: any
) => any = () => {};
let UNITS: { value: string; type: string; typeId: string }[] = [];
let CATEGORIES: { value: string; type: string }[] = [];
let isManualOption: false;
let settingUpdate: (row: any) => any = () => {};

let handleModalOpen: (objectiveId: any) => any = () => {};
let handleModalClose: () => any = () => {};
let handleTargetModalClose: () => any = () => {};
let handleTargetModalOpen: (row: any, index: any) => any = () => {};
let handleSetTargetType: (row: any, index: any) => any = () => {};
let handleSetTargetOptions: (frequency: any) => any = () => {};
const kraIdMap = CATEGORIES?.reduce((map: any, { kraName, id }: any) => {
  map[kraName] = id;
  return map;
}, {});
const userDetail = getSessionStorage();

const defaultColumn: Partial<ColumnDef<any>> = {
  cell: function Cell({ getValue, row: { index }, column: { id }, table }) {
    const initialValue = getValue();

    // We need to keep and update the state of the cell normally
    const [value, setValue] = useState<any>(initialValue);
    const [selectedFrequency, setSelectedFrequency] = useState<any>();
    const [targetOptions, setTargetOptions] = useState<any>();
    // const [isTargetModalOpen, setIsTargetModalOpen] = useState<any>();
    const classes = useStyles();

    // When the input is blurred, we'll call our table meta's updateData function
    const onBlur = async () => {
      console.log("onblur in default column", id);

      table.options.meta?.updateData(index, id, value);
    };

    // If the initialValue is changed external, sync it up with our state
    useEffect(() => {
      setValue(initialValue);
    }, [initialValue]);

    // Function to handle frequency change
    const handleFrequencyChange = (
      event: React.ChangeEvent<{ value: unknown }>
    ) => {
      const newValue = event.target.value as string;
      setValue(newValue);
      setSelectedFrequency(newValue);

      if (["MONTHLY", "QUARTERLY", "HALF-YEARLY"].includes(newValue)) {
        handleSetTargetOptions(newValue);
      }
      // onBlur();
    };

    if (id === "targetType") {
      return (
        <FormControl
          fullWidth
          size="small"
          variant="outlined"
          className={`${classes.selectType} ${value}`}
        >
          <Select
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              handleSetTargetType(e.target.value, index);
            }}
            onBlur={onBlur}
            style={{ fontSize: "0.8rem", color: "black" }}
          >
            <MenuItem value="Increase">INCREASE({">"})</MenuItem>
            <MenuItem value="Decrease">DECREASE({"<"})</MenuItem>
            <MenuItem value="Maintain">MAINTAIN({"="})</MenuItem>
            <MenuItem value="Range">
              RANGE({">"}
              {"="}
              {"<"})
            </MenuItem>
          </Select>
        </FormControl>
      );
    }

    if (id === "frequency") {
      return (
        <FormControl
          fullWidth
          size="small"
          variant="outlined"
          className={`${classes.selectFrequency} ${value}`}
        >
          <Select
            value={value}
            onChange={handleFrequencyChange}
            onBlur={onBlur}
            style={{
              fontSize: "0.8rem",
              color: "black",
              minWidth: "60px",
              maxWidth: "120px",
            }}
          >
            <MenuItem value="DAILY">DAILY</MenuItem>
            <MenuItem value="MONTHLY">MONTHLY</MenuItem>
            <MenuItem value="QUARTERLY">QUARTERLY</MenuItem>
            <MenuItem value="HALF-YEARLY">HALF-YEARLY</MenuItem>
            {/* <MenuItem value="YEARLY">YEARLY</MenuItem> */}
          </Select>
        </FormControl>
      );
    }
    if (id === "op") {
      return (
        <>
          <Tooltip title="Check if OP is required">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => setValue(e.target.checked)}
              onBlur={onBlur}
              id="toggle"
              style={{
                backgroundColor: "#fff",
                border: "2px solid #ccc",
                width: "14px",
              }}
            />
          </Tooltip>
          <label htmlFor="toggle">
            <span className="slider"></span>
          </label>
        </>
      );
    }
    if (id === "kpiTarget") {
      const frequency = table.options.data[index]?.frequency;
      // console.log("frequency", frequency);
      // Render based on frequency
      return (
        <div>
          {frequency === "DAILY" || frequency === "YEARLY" ? (
            <InputBase
              fullWidth
              style={{ maxWidth: "100px" }}
              classes={{ root: classes.inputBase }}
              value={value as string}
              onChange={(e) => setValue(e.target.value)}
              onBlur={onBlur}
              // placeholder={`Enter target for ${frequency}`}
            />
          ) : (
            <Tooltip title="Set Targets">
              <IconButton
                onClick={() =>
                  handleTargetModalOpen(table.options.data[index], index)
                }
              >
                <AiOutlineAim />
              </IconButton>
            </Tooltip>
          )}
        </div>
      );
    }

    if (id === "displayType") {
      return (
        <FormControl
          fullWidth
          size="small"
          variant="outlined"
          style={{ fontSize: "0.8rem" }}
        >
          <Select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={onBlur}
            style={{
              fontSize: "0.8rem",
              color: "black",
              minWidth: "60px",
              maxWidth: "100px",
            }}
          >
            <MenuItem value="AVERAGE">AVERAGE</MenuItem>
            <MenuItem value="SUM">SUM</MenuItem>
          </Select>
        </FormControl>
      );
    }
    // const [selectedValue, setSelectedValue] = useState(value); // Unconditionally call useState

    if (id === "type") {
      let defaultValue = value;
      // console.log("isManualoption", isManualOption);
      if (isManualOption) {
        defaultValue = "MANUAL";
      }

      return (
        <FormControl
          fullWidth
          size="small"
          variant="outlined"
          className={`${classes.selectCell} ${value}`}
        >
          <Select
            value={isManualOption ? "MANUAL" : value}
            disabled={isManualOption}
            style={{ fontSize: "0.8rem", color: "white", maxWidth: "70px" }}
            onChange={(e) => setValue(e.target.value)}
            onBlur={onBlur}
          >
            <MenuItem value="GET">GET</MenuItem>
            <MenuItem value="POST">POST</MenuItem>
            <MenuItem value="PATCH">PATCH</MenuItem>
            <MenuItem value="MANUAL">MANUAL</MenuItem>
          </Select>
        </FormControl>
      );
    }

    if (id === "unitOfMeasure") {
      return (
        <Autocomplete
          fullWidth
          size="small"
          style={{ fontSize: "0.8rem", minWidth: 100 }}
          options={UNITS}
          getOptionLabel={(option) => option.value}
          getOptionSelected={(option, val) => option.value === val.value}
          disableClearable
          value={UNITS.filter((obj) => obj.value === value)[0] ?? null}
          onChange={(e, newVal) => setValue(newVal.value)}
          onBlur={onBlur}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              placeholder="Select unit"
            />
          )}
        />
      );
    }
    if (id === "category") {
      return (
        <Autocomplete
          fullWidth
          size="small"
          style={{ fontSize: "0.8rem", minWidth: 200 }}
          options={CATEGORIES}
          getOptionLabel={(option) => option.type}
          getOptionSelected={(option, val) => option.value === val.value}
          disableClearable
          value={
            CATEGORIES.filter((obj: any) => obj.value === value)[0] ?? null
          }
          onChange={(e, newVal) => setValue(newVal.value)}
          onBlur={onBlur}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              style={{ fontSize: "0.8rem", minWidth: 150 }}
              placeholder="Select category"
            />
          )}
        />
      );
    }

    if (id === "unitType" || id === "kpiId" || id === "entityName")
      return (
        <Typography className={classes.dataCell}>{value as string}</Typography>
      );
    if (id === "kpiMinimumTarget") {
      if (table.options.data[index]?.targetType === "Range") {
        return (
          <InputBase
            // fullWidth
            className={classes.dataCell}
            style={{ maxWidth: "100px" }}
            value={value as string}
            onChange={(e) => setValue(e.target.value)}
            onBlur={onBlur}
          />
        );
      } else {
        // Return an empty cell or null to hide the column
        return null;
      }
    }
    if (id === "kpiName" || id === "description") {
      return (
        <InputBase
          fullWidth
          multiline
          // style={{ maxWidth: "500px" }}
          classes={{ input: classes.kpinput }}
          value={value as string}
          onChange={(e) => setValue(e.target.value)}
          onBlur={onBlur}
        />
      );
    }
    if (id === "objectiveId") {
      const rowData = table.options.data[index];
      // console.log("rowdata", rowData);
      return (
        <Tooltip title="View Objectives">
          <IconButton onClick={() => handleModalOpen(rowData)}>
            <MdInsertDriveFile style={{ fontSize: "18px", color: "#003059" }} />
          </IconButton>
        </Tooltip>
      );
    }

    return (
      <InputBase
        // fullWidth
        style={{ maxWidth: "50px" }}
        classes={{ root: classes.dataCell }}
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

function KpiDefinitionTable({
  columns,
  data,
  setData,
  handleBlur,
  unitOptions,
  kraOptions,
  source,
  searchText,
  setSearchText,
  modalTargetData,
  setModalTargetData,
  update,
  setUpdate,
  actions = [],
}: Props) {
  const memoizedCols = useMemo<ColumnDef<any, any>[]>(() => columns, [columns]);
  // console.log("memorizedCols", memoizedCols);
  const memoizedData = useMemo(() => data, [data]);
  // console.log("kraOptions in defintion table", kraOptions);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [targetOptions, setTargetOptions] = useState<string[]>([]);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [targetType, setTargetType] = useState<any>();
  // const [modalTargetData, setModalTargetData] = useState<
  //   Record<string, string>
  // >({});
  const [modalData, setModalData] = useState([]);
  const [row, setRow] = useState();
  const [index, setIndex] = useState<any>();
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const kraIdMap = kraOptions?.reduce((map: any, { kraName, id }: any) => {
    map[kraName] = id;
    return map;
  }, {});
  const [drawer, setDrawer] = useState<any>({
    mode: "edit",
    open: true,
    // clearFields: true,
    toggle: false,
    data: {},
  });
  const realmName = getAppUrl();
  // const [targetModalData, setTargetModalData] = useState(() => {
  //   // Initialize modal data with existing values if they are available
  //   const initialData: any = {};
  //   targetOptions.forEach((option: any) => {
  //     initialData[option] = ""; // or set default values if available
  //   });
  //   return initialData;
  // });
  const handleInputChange = (option: any, value: any) => {
    // console.log("option", option, value);
    setModalTargetData((prevData: any) => ({
      ...prevData,
      [option]: value,
    }));
  };

  // State to store the copy source
  const [copySource, setCopySource] = useState("");

  //copy to all functionality
  const handleCopyToAll = () => {
    if (copySource) {
      if (targetType === "Range") {
        //same functionality but field name is different
        const valueToCopy = modalTargetData[copySource] || "";
        if (copySource.includes("minTarget")) {
          targetOptions.forEach((option) => {
            handleInputChange(`${option}minTarget`, valueToCopy);
            handleInputChange(`${option}`, valueToCopy);
          });
        } else {
          targetOptions.forEach((option) => {
            handleInputChange(`${option}minTarget`, valueToCopy);
            handleInputChange(`${option}`, valueToCopy);
          });
        }
      } else {
        const valueToCopy = modalTargetData[copySource] || "";
        targetOptions.forEach((option) => {
          handleInputChange(option, valueToCopy);
        });
      }
    }
  };
  const validateTargetData = (
    data: Record<string, string>,
    targetType: string
  ): string[] => {
    const errors: string[] = [];

    for (const [key, value] of Object.entries(data)) {
      // Check if targetType is "Range" and the current key is "minTarget"
      if (targetType === "Range" && key.endsWith("minTarget")) {
        const optionName = key.replace("minTarget", ""); // Get the base name
        const targetValue = data[optionName]; // Get the corresponding target value

        // Validate minTarget
        if (value === null || value === undefined || value.trim() === "") {
          errors.push(
            `Minimum target value for ${optionName} is missing or empty.`
          );
        } else if (typeof value === "string" && !/^\d+(\.\d+)?$/.test(value)) {
          errors.push(
            `Invalid minimum target value for ${optionName}: ${value}`
          );
        }

        // Validate target corresponding to minTarget
        if (
          targetValue === null ||
          targetValue === undefined ||
          targetValue.trim() === ""
        ) {
          errors.push(`Target value for ${optionName} is missing or empty.`);
        } else if (
          typeof targetValue === "string" &&
          !/^\d+(\.\d+)?$/.test(targetValue)
        ) {
          errors.push(`Invalid target value for ${optionName}: ${targetValue}`);
        }

        // Ensure minTarget <= target
        if (parseFloat(value) > parseFloat(targetValue)) {
          errors.push(
            `Minimum target for ${optionName} cannot be greater than target.`
          );
        }
      }
      // Skip minTarget validation for other target types
      else if (!key.endsWith("minTarget")) {
        // Validate targets (only for non-minTarget keys)
        if (value === null || value === undefined || value.trim() === "") {
          errors.push(`Target value for ${key} is missing or empty.`);
        } else if (typeof value === "string" && !/^\d+(\.\d+)?$/.test(value)) {
          errors.push(`Invalid target value for ${key}: ${value}`);
        }
      }
    }

    return errors;
  };

  const handleSubmit = () => {
    console.log("handleSubmit", targetType, modalTargetData);
    const validationErrors = validateTargetData(modalTargetData, targetType);

    if (validationErrors.length > 0) {
      enqueueSnackbar(`${validationErrors}`, { variant: "error" });
      return; // Stop submission
    } else {
      handleBlur(row, index, modalTargetData);
      setIsTargetModalOpen(false);
    }

    // Close the modal after submission
    // clearTargetModalData();
  };

  // useEffect(() => {
  //   getObjectiveList;
  // }, [objectives, isModalOpen]);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalTargetData({});
    // Any additional logic you want to perform on modal close
  };

  // console.log("userDetail", userDetail);
  const handleSetTargetOption = (frequency: any) => {
    // console.log("frequency", frequency);
    switch (frequency) {
      case "MONTHLY":
        if (userDetail?.organization?.fiscalYearQuarters === "Jan - Dec") {
          setTargetOptions([
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ]);
        } else {
          setTargetOptions([
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
            "Jan",
            "Feb",
            "Mar",
          ]);
        }

        break;
      case "QUARTERLY":
        setTargetOptions(["Q1", "Q2", "Q3", "Q4"]);
        break;
      case "HALF-YEARLY":
        setTargetOptions(["H1", "H2"]);
        break;
      default:
        setTargetOptions([]);
    }
  };
  const handleTargetCloseModal = () => {
    setIsTargetModalOpen(false);
    setModalTargetData({});
    setTargetType(undefined);
  };
  const getObjectiveList = async (objectives: any) => {
    const result: any = []; // Initialize an empty array to store results

    // console.log("objectiveid", objectives);

    if (objectives?.length > 0) {
      for (const obj of objectives) {
        try {
          const { data } = await axios.get(
            `api/objective/getObjectMasterById/${obj}`
          );
          if (data) {
            result.push(data);
          }
        } catch (error) {
          console.error("Error fetching objective:", error);
          // Optionally handle or log the error here
        }
      }
      setModalData(result); // Set modal data with accumulated results after all iterations
    } else {
      setModalData([]); // If no objectives, set modal data to an empty array
    }
  };
  const handleOpenModal = (objectiveId: any) => {
    // console.log("objective id", objectiveId);
    // setObjectives(objectiveId?.objectiveId);
    getObjectiveList(objectiveId?.objectiveId);
    setIsModalOpen(true);
    // Any additional logic you want to perform on modal open
  };

  const handleTargetOpenModal = async (row: any, index: any) => {
    setIsTargetModalOpen(true);
    setRow(row);
    setIndex(index);
    setTargetType(row?.targetType);

    if (row._id || row.kpiId) {
      const res = await axios.get(
        `api/kpi-definition/getPeriodTargetForKpi/${row.kpiId}/${row.frequency}`
      );
      console.log("res,data", res.data);
      if (res.data) {
        setModalTargetData(res.data);
        handleSetTargetOption(row.frequency);

        // setTargetOptions(Object.keys(res.data));
      }
    }
  };
  const handleSetTargetTypeOption = async (row: any, index: any) => {
    console.log("row in handleset", row);
    setTargetType(row);
  };
  const handleSettingTargetData = async (row: any) => {
    console.log("function called", row);
    if (row._id || row.kpiId) {
      const res = await axios.get(
        `api/kpi-definition/getPeriodTargetForKpi/${row.kpiId}/${row.frequency}`
      );
      console.log("res,data", res.data);
      if (res.data) {
        setModalTargetData(res.data);
      }
    }
  };
  BLUR_FUNCTION = handleBlur;
  UNITS = unitOptions;
  CATEGORIES = kraOptions;
  handleModalClose = handleCloseModal;
  handleModalOpen = handleOpenModal;
  handleTargetModalClose = handleTargetCloseModal;
  handleTargetModalOpen = handleTargetOpenModal;
  handleSetTargetType = handleSetTargetTypeOption;
  handleSetTargetOptions = handleSetTargetOption;
  isManualOption = source;

  const handleChange = () => {
    console.log("inside handle change");
    setUpdate(true);
  };
  settingUpdate = handleSettingTargetData;
  // console.log("ismodal", isModalOpen);
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

    getPaginationRowModel: getPaginationRowModel(),
    defaultColumn: defaultColumn,
    // autoResetPageIndex,
    // debugTable: true,
    // Provide our updateData function to our table meta
    meta: {
      updateData: async (rowIndex: number, columnId: string, value: any) => {
        // Skip page index reset until after next rerender
        // skipAutoResetPageIndex();
        console.log("table", columnId, rowIndex);
        const newData = data.map((row: any, index: number) => {
          if (index === rowIndex) {
            return {
              ...data[rowIndex]!,
              [columnId]: value,
            };
          }
          return row;
        });
        const row = table.options.data[rowIndex];
        if (columnId !== "frequency" && row?.kpiId && row?.frequency) {
          try {
            const res = await axios.get(
              `api/kpi-definition/getPeriodTargetForKpi/${row?.kpiId}/${row?.frequency}`
            );
            // console.log("res,data", res?.data);
            if (res?.data) {
              BLUR_FUNCTION(newData[rowIndex], rowIndex, res.data);
            } else {
              BLUR_FUNCTION(newData[rowIndex], rowIndex, modalTargetData);
            }
          } catch (error) {}
        } else if (columnId === "frequency" && row?.kpiId && row?.frequency) {
          BLUR_FUNCTION(newData[rowIndex], rowIndex, modalTargetData);
          enqueueSnackbar("Frequency changed!! Please set targets again", {
            variant: "success",
          });
        } else {
          BLUR_FUNCTION(newData[rowIndex], rowIndex, modalTargetData);
        }
        //modalTargetData=
      },
    },
  });
  const handleClick = (objective: any) => {
    // console.log("handleclick called", objective);
    const url = `http://${
      process.env.REACT_APP_REDIRECT_URL?.includes("adityabirla.com")
        ? process.env.REACT_APP_REDIRECT_URL
        : `${realmName}.${process.env.REACT_APP_REDIRECT_URL}`
    }/objective/objectivedrawer`;
    // console.log("url", url);
    const stateData = {
      // editData: objective.result,
      // isEdit: true,
      // readMode: true,
      open: true,

      drawer: {
        open: true,
        mode: "edit",
        data: {
          id: objective.result._id,
        },
        clearFields: true,
        toggle: false,
      },
    };

    sessionStorage.setItem("newTabState", JSON.stringify(stateData));
    setTimeout(() => {
      window.open(url, "_blank");
    }, 800);
  };
  console.log("targetType", targetType, targetOptions);
  const half = Math.ceil(targetOptions?.length / 2);
  const firstHalf = targetOptions?.slice(0, half);
  const secondHalf = targetOptions?.slice(half);
  return (
    <TableContainer
      style={{
        border: "1px solid #3335",
        borderRadius: 3,
        margin: "auto",
      }}
    >
      <Grid
        container
        alignItems="center"
        justifyContent="flex-end"
        style={{ margin: "5px 0" }}
      >
        <Typography
          style={{ padding: "10px", fontSize: "12px", marginRight: "20px" }}
        >
          * = Operating Plan
        </Typography>

        <TextField
          fullWidth
          name="search"
          value={searchText ?? ""}
          onChange={(e) => setSearchText(e.target.value)}
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
      <Table className={classes.tableContainer}>
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
              {isAction && (
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
      {isModalOpen && (
        <Modal
          title="Associated Objectives"
          open={isModalOpen}
          footer={false}
          onCancel={handleCloseModal}
          maskClosable={true}
          onOk={handleCloseModal}
          centered={true}
          style={{ overflowX: "auto", overflowY: "auto" }}
          closeIcon={
            <img
              src={CloseIconImageSvg}
              alt="close-drawer"
              style={{ width: "36px", height: "38px", cursor: "pointer" }}
            />
          }
        >
          {/* {console.log("modaldata", modalData)} */}
          <ol>
            {modalData?.map((objective: any, index) => (
              <li key={objective?.result?._id}>
                <a
                  href="#"
                  style={{
                    textDecoration: "underline",
                    color: "black",
                    // fontWeight: "bold", // 'bold' instead of 'bold' for fontWeight
                    fontSize: "14px",
                    display: "block", // Ensures each link is on a new line
                    padding: "5px 0", // Adds padding between links
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    handleClick(objective);
                  }}
                >
                  {objective?.result?.ObjectiveName}
                </a>
              </li>
            ))}
          </ol>
        </Modal>
      )}
      {/* 
      {isTargetModalOpen && (
        <Modal
          title={`Set Targets Here`}
          open={isTargetModalOpen}
          width={750}
          bodyStyle={{
           
            overflowY: "auto", 
          }}
          footer={null}
          onCancel={() => {
            setIsTargetModalOpen(false);
            setModalTargetData({});
          }}
          maskClosable={true}
          centered={true}
          closeIcon={
            <img
              src={CloseIconImageSvg}
              alt="close-drawer"
              style={{ width: "36px", height: "38px", cursor: "pointer" }}
            />
          }
        >
          <div>
            <Box
             
              style={{
                marginTop: "20px",
                display: "flex",
                justifyContent: "center",
              }}
            >
            
              <Box
                display="flex"
                flexWrap="wrap"
               
              >
                {firstHalf.map((option) => (
                  <Box
                    key={option}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    flex="1 1 auto"
                    maxWidth="100px"
                    style={{ margin: "0 8px 8px 0" }} 
                  >
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        backgroundColor: "#e8f3f9",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        marginBottom: "8px",
                        height: "30px",
                      }}
                    >
                      <Typography
                        variant="body2"
                        style={{ margin: 0, lineHeight: "40px" }} 
                      >
                        {option}
                      </Typography>
                    </Box>
                    <InputBase
                      className={classes.inputBase}
                      value={modalTargetData[option] || ""}
                      onChange={(e) =>
                        handleInputChange(option, e.target.value)
                      }
                      onFocus={() => setCopySource(option)}
                    
                    />
                  </Box>
                ))}
              </Box>

              
              <Box
                display="flex"
                flexWrap="wrap"
              
              >
                {secondHalf.map((option) => (
                  <Box
                    key={option}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    flex="1 1 auto"
                    maxWidth="100px"
                    style={{ margin: "0 8px 8px 0" }} 
                  >
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        backgroundColor: "#e8f3f9",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        marginBottom: "8px",
                        height: "30px", 
                      }}
                    >
                      <Typography
                        variant="body2"
                        style={{ margin: 0, lineHeight: "40px" }} 
                      >
                        {option}
                      </Typography>
                    </Box>

                    <InputBase
                     
                      className={classes.inputBase}
                      value={modalTargetData[option] || ""}
                      onChange={(e) =>
                        handleInputChange(option, e.target.value)
                      }
                      onFocus={() => setCopySource(option)}
                      
                    />
                  </Box>
                ))}
              </Box>
              <div>
                <Tooltip title="Copy to All">
                  <IconButton
                    onClick={handleCopyToAll}
                    style={{ padding: "0px" }}
                  >
                    <CopyOutlined />
                  </IconButton>
                </Tooltip>
              </div>
            </Box>

            <div style={{ textAlign: "right", paddingTop: "10px" }}>
            
              <Button
                color="primary"
                onClick={handleSubmit}
                variant="contained"
              >
                Submit
              </Button>
            </div>
          </div>
        </Modal>
      )} */}
      {isTargetModalOpen && (
        <Modal
          title={`Set Targets Here`}
          open={isTargetModalOpen}
          width={750}
          bodyStyle={{
            overflowY: "auto",
          }}
          footer={null}
          onCancel={() => {
            setIsTargetModalOpen(false);
            setModalTargetData({});
          }}
          maskClosable={true}
          centered={true}
          closeIcon={
            <img
              src={CloseIconImageSvg}
              alt="close-drawer"
              style={{ width: "36px", height: "38px", cursor: "pointer" }}
            />
          }
        >
          <div>
            <Box
              style={{
                marginTop: "20px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              {/* First Row */}
              <Box display="flex" flexWrap="wrap">
                {firstHalf.map((option) => {
                  return (
                    <Box
                      key={option}
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      flex="1 1 auto"
                      maxWidth="100px"
                      style={{ margin: "0 8px 8px 0" }}
                    >
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        style={{
                          width: "100%",
                          backgroundColor: "#e8f3f9",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          marginBottom: "8px",
                          height: "30px",
                        }}
                      >
                        <Typography
                          variant="body2"
                          style={{ margin: 0, lineHeight: "40px" }}
                        >
                          {option}
                        </Typography>
                      </Box>

                      {targetType === "Range" ? (
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          width="100%"
                        >
                          <>
                            <InputBase
                              className={classes.rangeInputBase}
                              value={
                                modalTargetData[`${option}minTarget`] || ""
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  `${option}minTarget`,
                                  e.target.value
                                )
                              }
                              onFocus={() =>
                                setCopySource(`${option}minTarget`)
                              }
                              placeholder={`min`}
                            />
                            <InputBase
                              className={classes.rangeInputBase}
                              value={modalTargetData[`${option}`] || ""}
                              onChange={(e) =>
                                handleInputChange(`${option}`, e.target.value)
                              }
                              onFocus={() => setCopySource(`${option}`)}
                              placeholder={`max`}
                            />
                          </>
                        </Box>
                      ) : (
                        <InputBase
                          className={classes.inputBase}
                          value={modalTargetData[option] || ""}
                          onChange={(e) =>
                            handleInputChange(option, e.target.value)
                          }
                          onFocus={() => setCopySource(option)}
                          // placeholder={`Set target for ${option}`}
                        />
                      )}
                    </Box>
                  );
                })}
              </Box>

              {/* Second Row */}
              <Box display="flex" flexWrap="wrap">
                {secondHalf.map((option) => {
                  return (
                    <Box
                      key={option}
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      flex="1 1 auto"
                      maxWidth="100px"
                      style={{ margin: "0 8px 8px 0" }}
                    >
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        style={{
                          width: "100%",
                          backgroundColor: "#e8f3f9",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          marginBottom: "8px",
                          height: "30px",
                        }}
                      >
                        <Typography
                          variant="body2"
                          style={{ margin: 0, lineHeight: "40px" }}
                        >
                          {option}
                        </Typography>
                      </Box>

                      {targetType === "Range" ? (
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          width="100%"
                        >
                          <>
                            <InputBase
                              className={classes.rangeInputBase}
                              value={
                                modalTargetData[`${option}minTarget`] || ""
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  `${option}minTarget`,
                                  e.target.value
                                )
                              }
                              onFocus={() =>
                                setCopySource(`${option}minTarget`)
                              }
                              placeholder={`min`}
                            />
                            <InputBase
                              className={classes.rangeInputBase}
                              value={modalTargetData[`${option}`] || ""}
                              onChange={(e) =>
                                handleInputChange(`${option}`, e.target.value)
                              }
                              onFocus={() => setCopySource(`${option}`)}
                              placeholder={`max`}
                            />
                          </>
                        </Box>
                      ) : (
                        <InputBase
                          className={classes.inputBase}
                          value={modalTargetData[option] || ""}
                          onChange={(e) =>
                            handleInputChange(option, e.target.value)
                          }
                          onFocus={() => setCopySource(option)}
                          // placeholder={`Set target for ${option}`}
                        />
                      )}
                    </Box>
                  );
                })}
              </Box>

              <div>
                <Tooltip title="Copy to All">
                  <IconButton
                    onClick={handleCopyToAll}
                    style={{ padding: "0px" }}
                  >
                    <MdOutlineContentCopy />
                  </IconButton>
                </Tooltip>
              </div>
            </Box>

            <div style={{ textAlign: "right", paddingTop: "10px" }}>
              <Button
                color="primary"
                onClick={handleSubmit}
                variant="contained"
              >
                Submit
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <Box className={classes.footer}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          paddingBottom="15px"
        >
          <Box marginRight={1}>
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

          <Box marginRight={1}>
            <Typography component="p" style={{ fontSize: "0.9rem" }}>
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </Typography>
            <Typography component="p" style={{ fontSize: "0.75rem" }}>
              {table.getPrePaginationRowModel().rows.length} rows
            </Typography>
          </Box>
        </Box>

        <FormControl
          variant="outlined"
          size="small"
          style={{ marginRight: "5px" }}
        >
          <InputLabel>Rows</InputLabel>
          <Select
            variant="outlined"
            label="Rows"
            className={classes.rows}
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

export default KpiDefinitionTable;
