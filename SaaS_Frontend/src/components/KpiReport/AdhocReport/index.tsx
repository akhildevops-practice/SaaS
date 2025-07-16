import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Grid,
  TextField,
  Paper,
  Typography,
  Tooltip,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  useMediaQuery,
} from "@material-ui/core";

import { DatePicker } from "antd";

import { IKpiReportSchema } from "../../../schemas/kpiReportSchema";
import { makeStyles } from "@material-ui/core/styles";
import axios from "../../../apis/axios.global";
import { dateToLongDateFormat } from "utils/dateFormat";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import AdhocReportDesignContainer from "./DesignContainer";
import { useSnackbar } from "notistack";
import moment from "moment";
import dayjs from "dayjs";
import { isValid } from "utils/validateInput";

const useStyles = (smallScreen: any) =>
  makeStyles((theme) => ({
    label: {
      paddingTop: theme.spacing(1), // Adjust padding top as needed
      fontWeight: "bold",
      paddingBottom: theme.spacing(1),
    },
    tabLabel: {
      textAlign: "left",
    },
    tabs: {
      "&.PrivateTabIndicator-colorPrimary-78 ": {
        backGround: "white",
      },
      boxShadow: "grey",
    },
    root: {
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
    tab: {
      textTransform: "none", // Preserve original text casing
      textAlign: "left", // Align text to the left
      paddingLeft: theme.spacing(1), // Add left padding for better appearance
      paddingRight: theme.spacing(1),
      color: "#00224e",
      // marginBottom: theme.spacing(1),
      // borderRadius: "5px",
      "& .MuiTab-wrapper": {
        flexDirection: "unset", // Ensure label alignment is not affected by flexbox
        justifyContent: "flex-start",
        // Align label to the start of the tab
      },
    },
    indicator: {
      backgroundColor: "#00224e",
      height: "100%",
      width: "5px",
      position: "absolute",
      left: 0, // Position the indicator at the left
      bottom: 0, // Align it at the bottom if it's a bottom indicator
    },
    fabButton: {
      backgroundColor: theme.palette.primary.light,
      color: "#fff",
      margin: "0 5px",
      "&:hover": {
        backgroundColor: theme.palette.primary.main,
      },
    },
    draftButton: {
      backgroundColor: theme.palette.primary.light,
      color: "white",
      marginLeft: smallScreen ? 9 : 0,
      // width: smallScreen ? 87 : 60,

      "&:hover": {
        backgroundColor: theme.palette.primary.main,
      },

      [theme.breakpoints.down("sm")]: {
        width: 0,
      },
    },
    disabledTextField: {
      "& .MuiInputBase-root.Mui-disabled": {
        border: "white",
        backgroundColor: "white",
        color: "black",
        // marginBottom: "20px",
      },
    },
    disabledCategoryField: {
      "& .MuiInputBase-root.Mui-disabled": {
        backgroundColor: "white",
        color: "#003059",
        fontSize: "20px",
        fontWeight: "bold",
        borderBottom: "none",
        boxShadow: "none",
      },
      "& .MuiInput-underline:before": {
        borderBottom: "none !important",
      },
      "& .MuiInput-underline:after": {
        borderBottom: "none !important",
      },
    },

    disabledMuiSelect: {
      "& .Mui-disabled": {
        backgroundColor: "white",
        color: "black",
        border: "none",
        "& .MuiSelect-icon": {
          display: "none",
        },
      },
    },

    deleteButton: {
      backgroundColor: theme.palette.error.main,
      color: "white",
      width: 87,

      "&:hover": {
        backgroundColor: theme.palette.error.dark,
      },

      [theme.breakpoints.down("sm")]: {
        width: 0,
      },
    },
    modifiedText: {
      [theme.breakpoints.down("sm")]: {
        fontSize: "0.85rem",
      },
      paddingRight: "30px",
    },
    imgContainer: {
      display: "flex",
      justifyContent: "center",
    },
    emptyDataText: {
      fontSize: theme.typography.pxToRem(14),
      color: theme.palette.primary.main,
    },
    categoryContainer: {
      margin: "10px 0",
      padding: 10,
      // boxShadow: "#ddd",
      // border: "1px solid black",
      // backgroundColor: "#f0f5f5",
      overflowX: "scroll",
      overflowY: "auto",
      // maxHeight: "200px",
    },
    tableContainerScrollable: {
      marginBottom: "20px", // Adjust the value as needed
      maxHeight: "calc(76vh - 20vh)", // Adjust the max-height value as needed
      overflowY: "auto",
      "&::-webkit-scrollbar": {
        width: "8px",
        height: "10px", // Adjust the height value as needed
        backgroundColor: "#e5e4e2",
      },
      "&::-webkit-scrollbar-thumb": {
        borderRadius: "10px",
        backgroundColor: "grey",
      },
    },
  }));
// reportValues={reportValues}
// locationOptions={locationOptions}
// sourceOptions={sourceOptions}
// userOptions={userOptions}
// reportReaderOptions={reportReaderOptions}
// readerLevelOptions={readerLevelOptions}
// entityOptions={entityOptions}

type Props = {
  reportValues?: any;
  setReportValues?: any;
  //   reportStatus?: any;
  //   locationOptions: any;
  //   sourceOptions: any;
  //   userOptions: any;
  //   reportReaderOptions: any;
  //   readerLevelOptions: any;
  //   entityOptions: any;
  currentYear?: any;
};

function AdhocReport({
  reportValues,
  setReportValues,
  //   reportStatus,

  currentYear,
}: Props) {
  const matches = useMediaQuery("(min-width:820px)");
  const smallScreen = useMediaQuery("(min-width:450px)");
  const classes = useStyles(smallScreen)();
  const [activeKey, setActiveKey] = useState<string[]>([]);
  const userDetails = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const [reportStatus, setReportStatus] = useState("DRAFT");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const [selectedOption, setSelectedOption] = useState<any>();
  const [disabledMonths, setDisabledMonths] = useState<any>([]);
  const [openMissingCommentsModal, setOpenMissingCommentsModal] =
    useState(false);
  const [missingComments, setMissingComments] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);

  const [adhocreportValues, setAdhocReportValues] = useState<IKpiReportSchema>({
    location: "", // Need to set this based on logged-in user's location
    entity: "",
    sources: [],
    runDate: new Date(),
    active: false,
    kpiReportInstanceName: "", // Need to set this based on frequency + location + entity
    reportFrequency: "", // Need to set this based on location.state.selectedOption
    schedule: "",
    updatedBy: "",
    updatedAt: dateToLongDateFormat(new Date()),
    readersLevel: "",
    reportReaders: [],
    emailRecipients: [],
    reportEditors: [],
    year: "",
    yearFor: "",
    semiAnnual: "",
    businessUnitFieldName: "",
    entityFieldName: "",

    categories: [], // Need to set this based on API call
  });
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const getCurrentMonth = () => {
    const currentMonthIndex = new Date().getMonth(); // getMonth() returns 0-11
    return months[currentMonthIndex];
  };
  const location: any = useLocation();
  const { pathname } = useLocation();
  const [read, setRead] = useState<boolean>(false);
  const [formValues, setFormValues] = useState(adhocreportValues);
  const openFrom = useMemo(() => {
    if (pathname.includes("generatereportfromtemplate")) return "template";
    else if (pathname.includes("adhocreport")) {
      if (pathname.match(/\/adhocreport\/\w+/)) return "edit";
      else return "create";
    }
  }, [pathname]);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  // const [selectedQuarter, setSelectedQuarter] = useState("");
  const [selectedFiscalYear, setSelectedFiscalYear] = useState(
    location?.state?.currentYear
  );
  const [selectedDate, setSelectedDate] = useState<any>(new Date());
  const today = new Date();
  const fiscalStartMonth =
    userDetails.organization.fiscalYearQuarters === "April - Mar" ? 3 : 0;
  interface ActiveTabs {
    [key: string]: string;
  }

  const [selectedTab, setSelectedTab] = useState(0); // State variable to manage the active tab index

  const handleTabChange = (event: any, newValue: any) => {
    setSelectedTab(newValue); // Update active tab index
  };

  // Function to get the current quarter index (0 for Q1, 1 for Q2, etc.)
  const getCurrentQuarterIndex = (date: any, fiscalStartMonth: any) => {
    const month = date.getMonth();
    const adjustedMonth = (month - fiscalStartMonth + 12) % 12;
    return Math.floor(adjustedMonth / 3);
  };
  const getDisabledMonth = async () => {
    const currentDate = new Date();
    const currentMonthIndex = currentDate.getMonth(); // 0-based index for the current month
    const currentYear = currentDate.getFullYear();

    // Fiscal year starts in April and ends in March
    const calculateFiscalYear = (month: number, year: number) => {
      if (month >= 3) {
        // From April (index 3) onwards
        return `${year.toString().slice(2)}-${(year + 1).toString().slice(2)}`;
      } else {
        // Before April, i.e. from January to March
        return `${(year - 1).toString().slice(2)}-${year.toString().slice(2)}`;
      }
    };

    // Get the current fiscal year based on the current month and year
    const currentFiscalYear = calculateFiscalYear(
      currentMonthIndex,
      currentYear
    );

    const parseFiscalYear = (fiscalYearStr: string) => {
      const [startYearSuffix, endYearSuffix] = fiscalYearStr?.split("-");
      const startYear = parseInt(`20${startYearSuffix}`, 10);
      const endYear = parseInt(`20${endYearSuffix}`, 10);
      return { startYear, endYear };
    };

    const audityear = selectedFiscalYear; // The selected fiscal year (e.g., "24-25")
    let disabled: any = [];

    const fiscalYearData = parseFiscalYear(audityear);

    if (fiscalYearData) {
      const { startYear, endYear } = fiscalYearData;
      const fiscalMonths = [
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
        "January",
        "February",
        "March",
      ];
      // If the selected fiscal year is the same as the current fiscal year
      if (audityear === currentFiscalYear) {
        const currentFiscalMonthIndex = (currentMonthIndex - 3 + 12) % 12; // Adjust current month to fiscal year index (0 = April)
        disabled = fiscalMonths?.slice(currentFiscalMonthIndex + 1); // Disable months from the current month onward in the fiscal year
      }
      // If the selected fiscal year is a future fiscal year (e.g., 25-26)
      else if (audityear > currentFiscalYear) {
        // Disable all months for the future fiscal year
        disabled = months;
      }
      // If the selected fiscal year is a past fiscal year (e.g., 23-24)
      else if (audityear < currentFiscalYear) {
        // Enable all months for the past fiscal year
        disabled = [];
      }
    }

    // Update the disabled months state
    setDisabledMonths(disabled);
  };

  // Get the current quarter name
  const getCurrentQuarter = (fiscalStartMonth: any) => {
    const currentQuarterIndex = getCurrentQuarterIndex(today, fiscalStartMonth);
    return fiscalQuarters[currentQuarterIndex];
  };
  function getHalfYear(
    date: Date,
    fiscalYearStart: string,
    selectedFiscalHalf: string
  ): string {
    const newDate = new Date(date); //converting to date as it coming as string
    const month = newDate?.getMonth(); // 0 = January, 11 = December
    //console.log("fiscalyearstart", fiscalYearStart);

    let firstHalf: string;
    let secondHalf: string;

    if (fiscalYearStart === "April - Mar") {
      firstHalf = "April - September";
      secondHalf = "October - March";
    } else {
      firstHalf = "January - June";
      secondHalf = "July - December";
    }

    // Determine the fiscal month relative to the fiscal year start
    const fiscalMonth =
      (month - (fiscalYearStart === "April - Mar" ? 3 : 0) + 12) % 12;

    // Determine if the current month falls within the first or second half
    const isInFirstHalf =
      fiscalYearStart === "April - Mar"
        ? month >= 3 && month <= 8 // April to September
        : month >= 0 && month <= 5; // January to June

    const isInSecondHalf =
      fiscalYearStart === "April - Mar"
        ? month >= 9 || month <= 2 // October to March
        : month >= 6 && month <= 11; // July to December

    // Return the correct half-year option based on the selectedFiscalHalf
    if (selectedFiscalHalf === "First Half") {
      return isInFirstHalf ? firstHalf : secondHalf;
    } else if (selectedFiscalHalf === "Second Half") {
      return isInSecondHalf ? secondHalf : firstHalf;
    } else {
      throw new Error("Unsupported fiscal half selection");
    }
  }

  const fiscalQuarters = generateFiscalQuarterOptions(
    userDetails.organization.fiscalYearQuarters
  );
  function generateFiscalYearOptions(fiscalYearFormat: string): string[] {
    const currentYear = new Date().getFullYear();
    // console.log("fisclayearformat", fiscalYearFormat);
    const options: string[] = [];

    switch (fiscalYearFormat) {
      case "YYYY":
        for (let i = 0; i < 5; i++) {
          options.push((currentYear - i).toString());
        }
        break;

      case "YY-YY+1":
        for (let i = 0; i < 5; i++) {
          const startYear = currentYear - i;
          const endYear = startYear + 1;
          options.push(
            `${startYear.toString().slice(-2)}-${endYear.toString().slice(-2)}`
          );
        }
        break;

      case "YYYY-YY+1":
        for (let i = 0; i < 5; i++) {
          const startYear = currentYear - i;
          const endYear = startYear + 1;
          options.push(`${startYear}-${endYear.toString().slice(-2)}`);
        }
        break;

      case "YY+1":
        for (let i = 0; i < 5; i++) {
          options.push((currentYear - i + 1).toString().slice(-2));
        }
        break;

      default:
        throw new Error("Invalid fiscal year format");
    }
    // console.log("fiscal yearoptions", options);
    return options;
  }
  function generateFiscalQuarterOptions(fiscalYearQuarter: string): string[] {
    if (fiscalYearQuarter === "April - Mar") {
      return ["April - June", "July - Sept", "Oct - Dec", "Jan - Mar"];
    } else if (fiscalYearQuarter === "Jan - Dec") {
      return ["Jan - Mar", "April - June", "July - Sept", "Oct - Dec"];
    } else {
      throw new Error("Invalid fiscal year quarter format");
    }
  }
  function generateFiscalHalvesOptions(fiscalYearQuarter: string): string[] {
    try {
      if (fiscalYearQuarter === "April - Mar") {
        return ["April - September", "October - March"];
      } else if (fiscalYearQuarter === "Jan - Dec") {
        return ["January - June", "July - August"];
      } else {
        return [];
      }
    } catch (error) {
      throw new Error("Invalid fiscal year quarter format");
    }
  }
  function getDefaultHalfYearOption(
    date: Date,
    fiscalYearQuarter: string
  ): string {
    const month = date.getMonth(); // 0 = January, 11 = December
    let startMonth: number;

    // Determine start month based on fiscal year format
    switch (fiscalYearQuarter) {
      case "April - Mar":
        startMonth = 3; // April (0-based index)
        break;
      case "Jan - Dec":
        startMonth = 0; // January (0-based index)
        break;
      default:
        throw new Error("Unsupported fiscal year start format");
    }

    // Calculate fiscal month relative to the start of the fiscal year
    const fiscalMonth = (month - startMonth + 12) % 12;

    // Determine the default option based on the fiscal month
    if (fiscalYearQuarter === "April - Mar") {
      return fiscalMonth < 6 ? "April - September" : "October - March";
    } else if (fiscalYearQuarter === "Jan - Dec") {
      return fiscalMonth < 6 ? "January - June" : "July - December";
    } else {
      throw new Error("Unsupported fiscal year start format");
    }
  }

  // Initialize the selectedQuarter state with the current quarter name
  const [selectedQuarter, setSelectedQuarter] = useState(
    getCurrentQuarter(fiscalStartMonth)
  );
  const fiscalYears = generateFiscalYearOptions(
    userDetails.organization.fiscalYearFormat
  );
  const [selectedHalfYear, setSelectedHalfYear] = useState(
    getDefaultHalfYearOption(
      new Date(),
      userDetails.organization.fiscalYearQuarters
    )
  );
  const fiscalHalves = generateFiscalHalvesOptions(
    userDetails?.organization?.fiscalYearQuarters
  );
  const getLastDayOfMonth = (month: string, year: number): Date => {
    const monthIndex = monthNameToNumber(month) - 1; // Convert to zero-based index
    return new Date(year, monthIndex + 1, 0); // The `0` will give the last day of the month
  };

  const getLastDayOfQuarter = (
    quarter: string,
    fiscalYearQuarter: string,
    fiscalYearStart: number
  ): Date => {
    // console.log("selected quarter", quarter);
    const quarterIndex = fiscalQuarters.findIndex((q) => q === quarter);
    if (quarterIndex === -1) {
      throw new Error("Invalid quarter selected");
    }

    // Determine if fiscal year starts in April or not
    const isFiscalYearAprilStart = fiscalYearQuarter === "April - Mar";

    // Calculate the start month of the quarter
    const startMonth =
      (quarterIndex * 3 + (isFiscalYearAprilStart ? 3 : 0)) % 12;

    // Calculate the end month of the quarter
    const endMonth = (startMonth + 2) % 12;

    // Calculate the year of the end month
    let endYear = fiscalYearStart;
    if (isFiscalYearAprilStart) {
      if (startMonth <= 2) {
        // Jan-Mar of next calendar year
        endYear += 1;
      }
    } else {
      if (endMonth < startMonth) {
        // Wraps around the new calendar year
        endYear += 1;
      }
    }

    // Get the last day of the quarter
    const lastDay = new Date(endYear, endMonth + 1, 0);
    // console.log("last day", lastDay);
    return lastDay;
  };
  const getLastDayOfHalfYear = (
    halfYear: string,
    fiscalYearQuarter: string,
    fiscalYearStart: number
  ): Date => {
    // Determine if fiscal year starts in April or not
    const isFiscalYearAprilStart = fiscalYearQuarter === "April - Mar";
    // console.log("half year", selectedHalfYear);
    // Define start and end months for each half-year
    let startMonth: number;
    let endMonth: number;

    if (isFiscalYearAprilStart) {
      if (halfYear === "April - September") {
        startMonth = 3; // April
        endMonth = 8; // September
      } else if (halfYear === "October - March") {
        startMonth = 9; // October
        endMonth = 2; // March of next year
      } else {
        throw new Error("Unsupported fiscal half-year format");
      }
    } else if (fiscalYearQuarter === "Jan - Dec") {
      if (halfYear === "January - June") {
        startMonth = 0; // January
        endMonth = 5; // June
      } else if (halfYear === "July - December") {
        startMonth = 6; // July
        endMonth = 11; // December
      } else {
        throw new Error("Unsupported fiscal half-year format");
      }
    } else {
      throw new Error("Unsupported fiscal year start format");
    }

    // Calculate the year of the end month
    let endYear = fiscalYearStart;
    if (isFiscalYearAprilStart) {
      if (endMonth < startMonth) {
        // If the end month is before the start month, it means the half-year spans across calendar years
        endYear += 1;
      }
    } else {
      if (endMonth < startMonth) {
        // If the end month is before the start month, it means the half-year spans across calendar years
        endYear += 1;
      }
    }

    // Get the last day of the half-year
    const lastDay = new Date(endYear, endMonth + 1, 0);
    console.log("Last day of half-year:", lastDay);
    return lastDay;
  };

  const getLastDayOfFiscalYear = (
    startMonth: string,
    startYear: number,
    endYear: number
  ): Date => {
    const endMonth = startMonth === "April" ? "March" : "December";
    const year = endMonth === "March" ? endYear : startYear;
    return getLastDayOfMonth(endMonth, year);
  };
  const getFullYear = (year: number): number => {
    return year < 100 ? 2000 + year : year;
  };
  const monthNameToNumber = (monthName: string): number => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months.indexOf(monthName) + 1; // +1 to make January = 1, February = 2, etc.
  };

  const generateReportRunDate = (
    selectedOption: string,
    selectedDate: Date,
    selectedMonth: string, // This is the selected month as a string (e.g., "January", "February")
    selectedFiscalYear: string
  ) => {
    //  console.log("selected month", selectedFiscalYear, selectedMonth);
    const getAdjustedFiscalYearForYYFormat = (
      selectedMonth: any,
      fiscalYear: any
    ) => {
      let [startYear, endYear] = fiscalYear.split("-").map(Number);

      // Handle the two-digit fiscal years (e.g., '24-25' should be treated as '2024-2025')
      startYear = startYear < 100 ? 2000 + startYear : startYear;
      endYear = endYear < 100 ? 2000 + endYear : endYear;

      // Convert selectedMonth (string) to number for comparison
      const selectedMonthNumber = monthNameToNumber(selectedMonth);

      // Adjust for fiscal year starting in April
      if (selectedMonthNumber < 4) {
        // January to March
        // If the selected month is in Jan-Mar, adjust to the next year's fiscal end year
        endYear = endYear + 1;
      } else {
        endYear = startYear;
      }

      // For months April to December, no adjustment needed, stay in current fiscal year
      return { startYear, endYear }; // Return adjusted fiscal years
    };

    // Helper function to adjust fiscal year for 'YYYY' format
    const getAdjustedFiscalYearForYYYYFormat = (
      selectedMonth: any,
      fiscalYear: any
    ) => {
      const startYear = fiscalYear;
      const endYear = fiscalYear;

      return { startYear, endYear };
    };

    // If the report frequency is Daily
    if (
      selectedOption === "Daily" ||
      adhocreportValues?.reportFrequency === "Daily"
    ) {
      return new Date(selectedDate);
    }

    // Handle fiscal year format 'April-March' (i.e., the fiscal year starts in April)
    if (userDetails.organization?.fiscalYearQuarters === "April - Mar") {
      console.log("inside if");
      let { startYear, endYear } = getAdjustedFiscalYearForYYFormat(
        selectedMonth,
        selectedFiscalYear
      );
      console.log("start year", startYear, endYear);
      // Convert selectedMonth (string) to number for further comparison
      const selectedMonthNumber = monthNameToNumber(selectedMonth);
      console.log("selectedonthnumber", selectedMonthNumber);
      // If the selected month is between January and March, adjust the end year to next year
      if (selectedMonthNumber < 4) {
        // Jan-Mar
        endYear = startYear + 1; // End year should be in the next calendar year (e.g., Jan 2025 in fiscal year 2024-25)
      }

      console.log(
        "Adjusted fiscal year for April-March format:",
        startYear,
        endYear
      );

      // Monthly Report
      if (
        selectedOption === "Monthly" ||
        adhocreportValues?.reportFrequency === "Monthly"
      ) {
        return getLastDayOfMonth(selectedMonth, endYear);
      }

      // Quarterly Report
      if (
        selectedOption === "Quarterly" ||
        adhocreportValues?.reportFrequency === "Quarterly"
      ) {
        return getLastDayOfQuarter(
          selectedQuarter,
          userDetails?.organization.fiscalYearQuarters,
          startYear
        );
      }

      // Half-Yearly Report
      if (
        selectedOption === "Half-Yearly" ||
        adhocreportValues?.reportFrequency === "Half-Yearly"
      ) {
        return getLastDayOfHalfYear(
          selectedHalfYear,
          userDetails?.organization.fiscalYearQuarters,
          startYear
        );
      }

      // Yearly Report
      if (
        selectedOption === "Yearly" ||
        adhocreportValues?.reportFrequency === "Yearly"
      ) {
        return getLastDayOfFiscalYear(selectedMonth, startYear, endYear);
      }
    }

    // Handle fiscal year format 'YYYY' (Standard Calendar Year)
    else if (userDetails.organization?.fiscalYearFormat === "YYYY") {
      // Adjust fiscal year for 'YYYY' format
      const { startYear, endYear } = getAdjustedFiscalYearForYYYYFormat(
        selectedMonth,
        selectedFiscalYear
      );

      console.log("Adjusted fiscal year for YYYY format:", startYear, endYear);

      // Monthly Report
      if (
        selectedOption === "Monthly" ||
        adhocreportValues?.reportFrequency === "Monthly"
      ) {
        return getLastDayOfMonth(selectedMonth, startYear);
      }

      // Quarterly Report
      if (
        selectedOption === "Quarterly" ||
        adhocreportValues?.reportFrequency === "Quarterly"
      ) {
        return getLastDayOfQuarter(
          selectedQuarter,
          userDetails?.organization.fiscalYearQuarters,
          startYear
        );
      }

      // Half-Yearly Report
      if (
        selectedOption === "Half-Yearly" ||
        adhocreportValues?.reportFrequency === "Half-Yearly"
      ) {
        return getLastDayOfHalfYear(
          selectedHalfYear,
          userDetails?.organization.fiscalYearQuarters,
          startYear
        );
      }

      // Yearly Report
      if (
        selectedOption === "Yearly" ||
        adhocreportValues?.reportFrequency === "Yearly"
      ) {
        return getLastDayOfFiscalYear(selectedMonth, startYear, endYear);
      }
    }

    return null;
  };

  // console.log("openfrom value", openFrom);
  useEffect(() => {
    if (location.state?.from) {
      setRead(true);
    }
  }, [location.state]);
  const [kpiOptions, setKpiOptions] = useState<
    { value: string; label: string }[]
  >([]);
  useEffect(() => {
    // getKpiValues();
    if (openFrom === "edit") getSelectedReportInstance();
  }, [kpiOptions]);
  const getSelectedReportInstance = async () => {
    await axios(`/api/kpi-report/getSelectedReportInstance/${id}`)
      .then(async (res: any) => {
        setReportStatus(res?.data?.result?.reportStatus);

        setSelectedOption(res?.data?.result?.reportFrequency);
        setSelectedFiscalYear(res.data.result?.yearFor);

        setAdhocReportValues({
          location: res.data.result.location,
          entity: res.data.result.entity,
          sources: res.data.tempData?.result?.sourceId,
          active: res.data.tempData?.result?.active,
          kpiReportInstanceName: res.data.result?.kpiReportInstanceName,
          reportFrequency: res.data.result?.reportFrequency,
          schedule: res.data.tempData?.result?.schedule,
          year: res.data.result.year,
          yearFor: res.data.result?.yearFor,
          runDate: res.data.result.runDate,
          updatedBy: res.data.result.reportRunBy,
          updatedAt: dateToLongDateFormat(new Date(res.data.result.updatedAt)),
          readersLevel: res.data.tempData?.result?.readersLevel,
          reportReaders: res.data.tempData?.result?.readers,
          emailRecipients: res.data.tempData?.result?.emailShareList,
          reportEditors: res?.data?.tempData?.result?.reportEditors,
          businessUnitFieldName: res.data.tempData?.result?.businessUnitFilter,
          entityFieldName: res?.data?.tempData?.result?.entityFilter,
          semiAnnual: res?.data.result?.semiAnnual
            ? res.data?.result?.semiAnnual
            : "",
          categories: res.data.result.catInfo.map((obj: any) => {
            return {
              catInfo: {
                _id: obj.kpiReportCategoryId,
                ObjectiveCategory: obj.kpiReportCategoryName,
                kpiInfo: obj.kpiInfo.map((kpiObj: any) => {
                  return {
                    ...kpiObj,
                    //   kpi: kpiOptions?.filter(
                    //     (o: { value: any }) => o?.value === kpiObj?.kpiId
                    //   )[0],
                    kpiTargetType: kpiObj.kpiTargetType,
                    kpiMinimumTarget: kpiObj.kpiMinimumTarget,
                    kpiOperationalTarget: kpiObj?.kpiOperationalTarget,
                  };
                }),
              },
              catId: obj.kpiReportCategoryId,
              catName: obj.kpiReportCategoryName,
              columnsArray: obj.columnsArray,
              kpiInfo: obj.kpiInfo.map((kpiObj: any) => {
                return {
                  ...kpiObj,
                  //   kpi: kpiOptions?.filter(
                  //     (o: { value: any }) => o?.value === kpiObj?.kpiId
                  //   )[0],
                  kpiTargetType: kpiObj.kpiTargetType,
                  kpiMinimumTarget: kpiObj.kpiMinimumTarget,
                  kpiOperationalTarget: kpiObj?.kpiOperationalTarget,
                };
              }),
            };
          }),
        });
        if (res.data.result.reportFrequency === "Daily") {
          const date = new Date(res.data.result.runDate);
          const formattedDate: any = moment(date).format("DD/MM/YYYY");
          setSelectedDate(date);
        } else if (res.data.result.reportFrequency === "Monthly") {
          const date = new Date(res.data.result.runDate);
          const monthIndex = date.getMonth();
          // console.log("monthindex", monthIndex);
          const monthName = months[monthIndex];
          // console.log("monthname", monthName);
          setSelectedMonth(monthName);
        } else if (res.data.result.reportFrequency === "Quarterly") {
          const date = res.data.result.runDate;
          const quarter = await getFiscalQuarter(date, res.data.result.yearFor);
          const quartername = fiscalQuarters[quarter - 1];
          // console.log("quarter and quartername", quarter, quartername);
          setSelectedQuarter(quartername);
        } else if (res.data.result.reportFrequency === "Half-Yearly") {
          setSelectedHalfYear(res.data.result?.semiAnnual);
        }
        // setSelectedFiscalYear(res.data.result.reportFor);
      })
      .catch((err) => console.error(err));
  };
  // console.log("adhocreportvaluesforedit", adhocreportValues);
  useEffect(() => {
    if (openFrom !== "edit") {
      const fetchData = async () => {
        try {
          if (location.state) {
            setSelectedOption(location?.state.selectedOption);
            let option;
            if (location?.state?.selectedOption === "Monthly") {
              option = selectedMonth;
            } else if (location?.state?.selectedOption === "Quarterly") {
              option = selectedQuarter;
            } else if (location?.state?.selectedOption === "Half-Yearly") {
              option = selectedHalfYear;
            } else {
              option = "Daily";
            }
            //console.log("option", option);
            const response = await axios.get(
              `api/kpi-definition/getAllKpiForaLocationDept/${location.state.selectedOption}/${option}/${location.state.entity}`
            );
            // console.log("response data", response.data);
            // const categories = response.data;

            // setAdhocReportValues((prevState) => ({
            //   ...prevState,
            //   categories: categories,
            // }));
            //to sort category names
            const data = response.data;

            // console.log("response data", response?.data);
            const categories = data.map((category: any) => ({
              ...category,
              kpiInfo: category.kpiInfo, // Associate kpiInfo with each category
            }));

            // Sort categories by 'ObjectiveCategory'
            const sortedCategories = categories.sort((a: any, b: any) => {
              const categoryA = a.catInfo.ObjectiveCategory.toUpperCase(); // Convert to upper case for case-insensitive comparison
              const categoryB = b.catInfo.ObjectiveCategory.toUpperCase();
              if (categoryA < categoryB) return -1;
              if (categoryA > categoryB) return 1;
              return 0;
            });

            // Update state with sorted categories
            setAdhocReportValues((prevState) => ({
              ...prevState,
              categories: sortedCategories,
            }));
            const runDate =
              location.state.selectedOption &&
              (selectedDate ||
                selectedMonth ||
                selectedFiscalYear ||
                selectedHalfYear)
                ? generateReportRunDate(
                    location.state.selectedOption,
                    selectedDate,
                    selectedMonth,
                    selectedFiscalYear
                  )
                : new Date();

            const da: any = {
              yearFor: selectedFiscalYear,
              runDate: runDate,
              reportFrequency: location.state.selectedOption,
            };
            const params = new URLSearchParams(da).toString();
            // console.log("selected", location.state.selectedOption);
            const res = await axios.get(
              `/api/kpi-report/getAdhocReportInstanceForUniqueCheck?${params}`
            );
            if (res.data?.response?.status === 409 || res.status === 409) {
              enqueueSnackbar(
                `A report already exists for the selected ${
                  location.state.selectedOption === "Monthly"
                    ? selectedMonth
                    : location.state.selectedOption === "Quarterly"
                    ? selectedQuarter
                    : selectedHalfYear
                }. Please change the selection and start entrying`,
                { variant: "error" }
              );
              setIsLoading(false);
              return;
            }
            // const instanceName = await generateReportInstanceName(
            //   userDetails.entity?.entityName,
            //   userDetails.location?.locationName,
            //   location.state.selectedOption,
            //   new Date(),
            //   `${location.state.currentYear}`
            // );

            // setAdhocReportValues((prevState) => ({
            //   ...prevState,
            //   location: userDetails.locationId,
            //   entity: userDetails.entityId,
            //   reportFrequency: location.state.selectedOption,
            //   kpiReportInstanceName: instanceName,
            // }));
          }
        } catch (error) {
          console.error("Error fetching categories:", error);
        }
      };

      fetchData();
    }
  }, [
    openFrom,
    selectedHalfYear,
    selectedMonth,
    selectedQuarter,
    selectedFiscalYear,
  ]);
  useEffect(() => {
    if (openFrom !== "edit") {
      getDisabledMonth();
    }
  }, [selectedFiscalYear]);
  useEffect(() => {
    if (openFrom !== "edit") {
      const reportName = async () => {
        const instanceName = await generateReportInstanceName(
          userDetails.entity?.entityName,
          userDetails.location?.locationName,
          location.state.selectedOption,
          new Date(),
          `${location.state.currentYear}`
        );

        setAdhocReportValues((prevState) => ({
          ...prevState,
          location: userDetails.locationId,
          entity: userDetails.entityId,
          reportFrequency: location.state?.selectedOption,
          kpiReportInstanceName: instanceName,
          // categories: adhocreportValues.categories,
        }));
      };
      reportName();
    }
  }, [
    selectedMonth,
    selectedFiscalYear,
    selectedDate,
    selectedQuarter,
    selectedHalfYear,
  ]);
  async function generateReportInstanceName(
    entityName: any,
    locationName: any,
    reportFrequency: any,
    today: any,
    currentyear: any
  ) {
    let instanceName = `${reportFrequency}_${entityName}_${locationName}` + " ";

    const frequency = reportFrequency?.toUpperCase();
    switch (frequency) {
      case "DAILY":
        if (selectedDate) {
          // console.log("selected date", selectedDate);
          today = new Date(selectedDate);
          currentyear = selectedFiscalYear ? selectedFiscalYear : currentyear;
        }
        instanceName += `for ${formatDate(today, "ddMMyyyy")}_${currentyear}`;
        break;
      case "MONTHLY":
        const monthName = today.toLocaleString("default", { month: "long" });
        instanceName += ` for ${selectedMonth ? selectedMonth : monthName}_${
          selectedFiscalYear ? selectedFiscalYear : currentyear
        } `;
        break;
      case "QUARTERLY":
        let quarter = await getQuarter(today);
        if (!!selectedQuarter && selectedQuarter !== "") {
          // let [startYear, endYear] = selectedFiscalYear.split("-").map(Number);
          // console.log("startyear", startYear, selectedFiscalYear);
          // startYear = getFullYear(startYear);
          // endYear = getFullYear(endYear);
          // today = getLastDayOfQuarter(
          //   selectedQuarter,
          //   userDetails.organization.fiscalYearQuarters,
          //   startYear
          // );
          const quarterIndex = fiscalQuarters.findIndex(
            (q) => q === selectedQuarter
          );
          quarter = quarterIndex + 1;
        }
        // console.log("quarterinrepname", quarter);
        instanceName += `for Q${quarter}_${
          selectedFiscalYear ? selectedFiscalYear : currentyear
        }`;
        break;

      case "YEARLY":
        instanceName += `for ${currentyear}`;
        break;
      case "HALF-YEARLY":
        // const fiscalYearStart = userDetails.organization?.fiscalYearQuarters; // Replace this with actual fiscal year start information
        // const fiscalHalfYear = getHalfYear(
        //   today,
        //   fiscalYearStart,
        //   selectedHalfYear
        // );
        instanceName += `for ${currentyear}`;
        break;

      default:
        break;
    }

    return instanceName;
  }
  function formatDate(date: any, format: any) {
    const options = {
      day: "2-digit",
      month: "long",
      year: "numeric",
    };
    return date.toLocaleDateString(undefined, options).replace(/ /g, "");
  }

  async function getQuarter(date: any) {
    // console.log("getquarter", location.state.currentYear, selectedFiscalYear);
    try {
      const result = await axios.get(
        `/api/kpi-report/computefiscalyearquarters/${
          selectedFiscalYear ? selectedFiscalYear : location.state.currentYear
        }`
      );
      if (result && result.status === 200) {
        const quarters = result.data;
        const currentDate = new Date(date); // This gets the current date and time
        const currentDay = currentDate.getDate(); // Get the day of the month
        const currentMonth = currentDate.getMonth() + 1; // Months are zero-based, so add 1
        const currentYear = currentDate.getFullYear(); // Get the year

        // Ensure leading zeros for single-digit days and months
        const dayString =
          currentDay < 10 ? "0" + currentDay : currentDay.toString();
        const monthString =
          currentMonth < 10 ? "0" + currentMonth : currentMonth.toString();

        const repdate: any = `${dayString}/${monthString}/${currentYear}`;
        console.log("repdate", repdate);
        let period;

        for (let i = 0; i < quarters.length; i++) {
          const qStartDate = quarters[i].startDate;
          const qEndDate = quarters[i].endDate;

          const d1 = qStartDate.split("/");
          const d2 = qEndDate.split("/");
          const c = repdate.split("/");

          const from = new Date(d1[2], parseInt(d1[1]) - 1, d1[0]).getTime(); // Convert to timestamp
          const to = new Date(d2[2], parseInt(d2[1]) - 1, d2[0]).getTime(); // Convert to timestamp
          const check = new Date(c[2], parseInt(c[1]) - 1, c[0]).getTime(); // Convert to timestamp

          if (check >= from && check <= to) {
            period = quarters[i].quarterNumber;

            break; // Exit the loop once the quarter is found
          }
        }
        console.log("period", period);
        return period;
      } else {
        console.error("Failed to fetch quarters data");
        return null; // or handle the error appropriately
      }
    } catch (error) {
      console.error("Error fetching quarters data:", error);
      return null; // or handle the error appropriately
    }
  }

  const handleDateChange = (date: any) => {
    const selectedDayjs = dayjs(date);
    setSelectedDate(date || new Date());

    const currentYear = location.state.currentYear;
    const startYear =
      userDetails.organization?.fiscalYearFormat === "YY-YY+1"
        ? parseInt(currentYear?.split("-")[0])
        : currentYear;

    const fullYear: any =
      userDetails.organization?.fiscalYearFormat === "YY-YY+1"
        ? startYear < 30
          ? `20${startYear}`
          : `19${startYear}`
        : currentYear;
    // console.log("start year and currentyear", startYear, currentYear, fullYear);
    const selectedyear = selectedDayjs.year().toString();
    if (selectedyear < fullYear) {
      // console.log("inside if");
      enqueueSnackbar("Please select a fiscal year from the dropdown.", {
        variant: "warning",
      });
    }
  };
  async function getFiscalQuarter(dateFor: any, yearFor: any) {
    const ndate = new Date(dateFor);
    const date: any = ndate.toLocaleDateString("en-GB");
    const kpimonth = ndate.getMonth();
    const year = ndate.getFullYear();
    // let adate = new Date(date).getTime();

    // console.log("date,month,year", date, kpimonth, year);
    const result = await axios.get(
      `/api/kpi-report/computefiscalyearquarters/${
        selectedFiscalYear ? selectedFiscalYear : yearFor
      }`
    );
    // console.log("result", result);
    const quarters = result.data;
    //console.log("quarters", quarters);
    let period;
    // console.log('date inside else while writing', date);
    for (let i = 0; i < quarters.length; i++) {
      //  //////////////console.log('inside for');
      // const dateobj = new Date(date);

      const qStartDate = quarters[i].startDate;
      //  console.log('qstartdate', qStartDate);
      ////////////////console.log(quarters[i].endDate);

      const qEndDate = quarters[i].endDate;
      //  console.log('qenddate', qEndDate);

      const d1 = qStartDate.split("/");
      const d2 = qEndDate.split("/");
      const c = date.split("/");

      const from = new Date(+d1[2], +d1[1] - 1, +d1[0]); // using unary plus to convert string to number
      const to = new Date(+d2[2], +d2[1] - 1, +d2[0]);
      const check = new Date(+c[2], +c[1] - 1, +c[0]);
      // console.log("check,from,to", from, to, check);
      if (check >= from && check <= to) {
        period = quarters[i].quarterNumber;
        // console.log('period inside if', period);
      }
    }
    return period;
  }
  const cols = [
    {
      header: "KPI",
      accessorKey: "kpi",
      size: 250,
    },
    {
      header: "UoM",
      accessorKey: "uom",
      size: 200,
    },
    {
      header: "PnB Target",
      accessorKey: "kpiTarget",
      size: 200,
    },
    {
      header: "Operational Target",
      accessorKey: "kpiOperationalTarget",
      size: 200,
    },
    {
      header: "Value *",
      accessorKey: "kpiValue",
      size: 200,
    },
    {
      header: "Comments",
      accessorKey: "kpiComments",
      size: 200,
    },
  ];
  // console.log("adjhocreportvalues", adhocreportValues);
  const handleBack = () => {
    // setActiveStep((prevActiveStep: number) => prevActiveStep - 1);
    // setActiveTab("3")
    navigate("/kpi", { state: { redirectToTab: "KPI Entry" } });
  };
  const handleWriteToKpiDetailTable = async (instanceId: string) => {
    await axios
      .post(`/api/kpi-report/writeToKpiDetailTable/${instanceId}`, {})
      .catch((err) => console.error(err));
  };
  const handleSendMail = async (instanceId: string) => {
    await axios
      .get(`/api/kpi-report/sendReportMail/${instanceId}`, {})
      .catch((err) => console.error(err));
  };
  const handleCreate = async (status: string) => {
    setIsLoading(true);
    const isValidTitle = isValid(adhocreportValues?.kpiReportInstanceName);
    if (!isValidTitle.isValid) {
      enqueueSnackbar(
        `Please enter a valid title ${isValidTitle.errorMessage}`,
        { variant: "error" }
      );
      return;
    }
    // Enhanced function to check if a value is a valid number (including floating-point numbers)
    const isNumeric = (value: any) => {
      if (value === null || value === undefined) {
        return false;
      }
      // Return false if the value is not a string or number, or if it contains invalid characters
      if (typeof value !== "number" && typeof value !== "string") {
        return false;
      }

      const trimmedValue = String(value).trim();

      // Check if the trimmed value matches a numeric format with optional decimal and sign
      return /^-?\d+(\.\d+)?$/.test(trimmedValue);
    };

    // Validate if all kpiInfo objects have valid numeric values
    const allKpisHaveValues = adhocreportValues.categories.every((cat: any) =>
      cat.kpiInfo.every(
        (kpiObj: any) =>
          isNumeric(kpiObj.kpiValue) && isNumeric(kpiObj.kpiTarget)
      )
    );

    if (!allKpisHaveValues) {
      enqueueSnackbar(
        `Some KPIs have invalid values. Please correct them before saving.`,
        { variant: "error" }
      );
      setIsLoading(false);
      return; // Exit the function if validation fails
    }

    const kpisMissingComments: any = [];
    const invalidComments: any = [];
    adhocreportValues.categories.forEach((cat: any) => {
      cat.kpiInfo.forEach((kpiObj: any) => {
        // console.log("kpiObj", kpiObj);

        const kpiValue = parseFloat(kpiObj.kpiValue);
        const kpiTarget = parseFloat(kpiObj.kpiTarget);
        const kpiMinTarget: any = kpiObj.kpiMinimumTarget
          ? parseFloat(kpiObj.kpiMinimumTarget)
          : undefined;
        // console.log("kpi mintarget", kpiMinTarget);

        // Check if kpiComments field is missing or empty
        const commentsMissing =
          !kpiObj.hasOwnProperty("kpiComments") ||
          kpiObj.kpiComments === undefined ||
          kpiObj.kpiComments === null ||
          kpiObj.kpiComments.trim() === "";
        if (kpiObj.kpiComments && typeof kpiObj.kpiComments === "string") {
          const commentError: any = isValid(kpiObj.kpiComments);
          // console.log("comments err", commentError);
          if (!commentError.isValid) {
            invalidComments.push({
              category: cat.catInfo?.ObjectiveCategory,
              kpiId: kpiObj._id,
              kpiName: kpiObj.kpiName,
              error: commentError.errorMessage,
            });
          }
        }

        if (
          isNumeric(kpiObj.kpiValue) &&
          isNumeric(kpiObj.kpiTarget) &&
          kpiValue < kpiTarget &&
          commentsMissing &&
          (kpiObj.kpiTargetType === "Increase" ||
            kpiObj.kpiTargetType === "Maintain")
        ) {
          kpisMissingComments.push({
            category: cat.catInfo?.ObjectiveCategory,
            kpiId: kpiObj._id,
            kpiName: kpiObj.kpiName,
          });
        } else if (
          isNumeric(kpiObj.kpiValue) &&
          isNumeric(kpiObj.kpiTarget) &&
          kpiValue > kpiTarget &&
          commentsMissing &&
          kpiObj.kpiTargetType === "Decrease"
        ) {
          kpisMissingComments.push({
            category: cat.catInfo?.ObjectiveCategory,
            kpiId: kpiObj._id,
            kpiName: kpiObj.kpiName,
          });
        } else if (
          kpiObj.kpiTargetType === "Range" &&
          isNumeric(kpiObj.kpiValue) &&
          isNumeric(kpiObj.kpiTarget) &&
          isNumeric(kpiObj.kpiMinimumTarget) &&
          (kpiValue > kpiTarget || kpiValue < kpiMinTarget) &&
          commentsMissing
        ) {
          kpisMissingComments.push({
            category: cat.catInfo?.ObjectiveCategory,
            kpiId: kpiObj._id,
            kpiName: kpiObj.kpiName,
          });
        }
      });
    });

    if (kpisMissingComments.length > 0) {
      setMissingComments(kpisMissingComments);
      setOpenMissingCommentsModal(true);
      setIsLoading(false);
      return; // Exit if there are missing comments
    }
    if (invalidComments.length > 0) {
      // If there are invalid comments, you can alert the user or handle it accordingly
      const errorMessages = invalidComments.map(
        (comment: any) =>
          `Invalid comment for KPI ${comment.kpiName}: ${comment.error}`
      );
      enqueueSnackbar(errorMessages.join("\n"), { variant: "error" });
      setIsLoading(false);
      return; // Exit if there are invalid comments
    }
    // Set the report status to "DRAFT" if any kpiValue is missing or invalid
    const finalStatus = allKpisHaveValues ? status : "DRAFT";

    const runDate =
      selectedOption &&
      (selectedDate || selectedMonth || selectedFiscalYear || selectedHalfYear)
        ? generateReportRunDate(
            selectedOption,
            selectedDate,
            selectedMonth,
            selectedFiscalYear
          )
        : new Date();
    // console.log("adhocreportvalues", adhocreportValues);
    const temp = {
      kpiReportInstanceName: adhocreportValues.kpiReportInstanceName,
      kpiReportTemplateId: "",
      reportStatus: finalStatus,
      organization: userDetails.organizationId,
      runDate: runDate,
      year: location.state.currentYear,
      yearFor: selectedFiscalYear || location.state.currentYear,
      reportFrequency: adhocreportValues?.reportFrequency,
      location: userDetails.locationId,
      entity: userDetails.entityId,
      semiAnnual:
        selectedOption === "Half-Yearly"
          ? selectedHalfYear
            ? selectedHalfYear
            : ""
          : null,
      catInfo: adhocreportValues.categories?.map((cat: any) => ({
        kpiReportCategoryId: cat.catInfo._id,
        kraId: cat.catInfo?._id,
        kpiReportCategoryName: cat.catInfo?.ObjectiveCategory,
        columnsArray: [
          "kpiId",
          "kpiTargetType",
          "kpiTarget",
          "minimumTarget",
          "weightage",
          "kpiValue",
          "kpiComments",
          "kpiOperationalTarget",
        ],
        kpiInfo: cat.kpiInfo?.map((kpiObj: any) => ({
          ...kpiObj,
          kpiId: kpiObj._id,
          kpiTargetType: kpiObj.kpiTargetType,
          kpiMinimumTarget: kpiObj?.kpiMinimumTarget,
          kpiOperationalTarget: kpiObj.kpiOperationalTarget
            ? kpiObj.kpiOperationalTarget
            : "",
        })),
      })),
    };

    try {
      const res = await axios.post(
        `/api/kpi-report/createAdhocReportInstance`,
        temp
      );

      if (res.data?.response?.status === 409 || res.status === 409) {
        enqueueSnackbar(
          `A report already exists for the selected month and year..!!`,
          { variant: "error" }
        );
        setIsLoading(false);
        return;
      } else {
        if (finalStatus === "SUBMIT") {
          await handleWriteToKpiDetailTable(res.data._id);
          await handleSendMail(res.data._id);
          enqueueSnackbar(
            `Successfully created! Records will appear shortly in the dashboard. Please wait a moment for the results to load`,
            { variant: "success" }
          );
        } else if (!allKpisHaveValues) {
          enqueueSnackbar(
            `Some KPIs do not have valid values. The report has been saved as a draft.`,
            { variant: "info" }
          );
        } else {
          enqueueSnackbar(`The report has been saved as a draft.`, {
            variant: "success",
          });
        }
        navigate("/kpi", { state: { redirectToTab: "KPI Entry" } });
      }
    } catch (err) {
      console.error(err);
      enqueueSnackbar(`Could not create report`, { variant: "error" });
    } finally {
      setIsLoading(false); // Ensure loading state is reset in both success and error cases
    }
  };

  // const handleCreate = async (status: string) => {
  //   setIsLoading(true);
  //   const temp = {
  //     kpiReportInstanceName: adhocreportValues.kpiReportInstanceName,
  //     kpiReportTemplateId: "",
  //     reportStatus: status,
  //     organization: userDetails.organizationId,
  //     runDate: new Date(),
  //     year: location.state.currentYear,
  //     reportFrequency: adhocreportValues?.reportFrequency,

  //     location: userDetails.locationId,
  //     entity: userDetails.entityId,
  //     catInfo: adhocreportValues.categories.map((cat: any) => ({
  //       kpiReportCategoryId: cat.catInfo._id,
  //       kraId: cat.catInfo?._id,
  //       kpiReportCategoryName: cat.catInfo?.ObjectiveCategory,
  //       columnsArray: [
  //         "kpiId",
  //         "kpiTargetType",
  //         "kpiTarget",
  //         "minimumTarget",
  //         "weightage",
  //         "kpiValue",
  //         "kpiComments",
  //       ],
  //       kpiInfo: cat.kpiInfo?.map((kpiObj: any) => ({
  //         ...kpiObj,
  //         kpiId: kpiObj._id,
  //         kpiTargetType: kpiObj.kpiTargetType,
  //       })),
  //     })),
  //   };
  //   console.log("temp in create", temp);

  //   await axios
  //     .post(`/api/kpi-report/createAdhocReportInstance`, temp)
  //     .then((res) => {
  //       if (status === "SUBMIT") {
  //         handleWriteToKpiDetailTable(res.data._id);
  //         handleSendMail(res.data._id);
  //       }
  //       setIsLoading(false);
  //       enqueueSnackbar(`Successfully created`, {
  //         variant: "success",
  //       });
  //       navigate("/kpi", { state: { redirectToTab: "KPI Reports" } });
  //     })
  //     .catch((err) => {
  //       console.error(err);
  //       setIsLoading(false);
  //       enqueueSnackbar(`Could not create report`, {
  //         variant: "error",
  //       });
  //     });
  // };

  // const handleUpdate = async (status: string) => {
  //   setIsLoading(true);
  //   const temp = {
  //     kpiReportInstanceName: adhocreportValues.kpiReportInstanceName,
  //     kpiReportTemplateId: "",
  //     reportStatus: status,
  //     reportFrequency: adhocreportValues.reportFrequency,
  //     organization: userDetails.organizationId,
  //     year: adhocreportValues.year,
  //     catInfo: adhocreportValues.categories.map((cat: any) => ({
  //       kpiReportCategoryId: cat.catInfo?._id,
  //       kpiReportCategoryName: cat.catInfo?.ObjectiveCategory,
  //       columnsArray: [
  //         "kpiId",
  //         "kpiTargetType",
  //         "kpiTarget",
  //         "minimumTarget",
  //         "weightage",
  //         "kpiValue",
  //         "kpiComments",
  //       ],
  //       kpiInfo: cat.kpiInfo.map((kpiObj: any) => ({
  //         ...kpiObj,
  //         kpiId: kpiObj.kpiId,
  //         kpiTargetType: kpiObj.kpiTargetType,
  //       })),
  //     })),
  //   };

  //   await axios
  //     .put(`/api/kpi-report/updateadhocReportInstance/${id}`, temp)
  //     .then((res) => {
  //       if (status === "SUBMIT") {
  //         handleWriteToKpiDetailTable(id!);
  //         handleSendMail(id!);
  //       }

  //       setIsLoading(false);
  //       enqueueSnackbar(`Successfully updated`, {
  //         variant: "success",
  //       });
  //       navigate("/kpi", { state: { redirectToTab: "KPI Reports" } });
  //     })
  //     .catch((err) => {
  //       console.error(err);
  //       setIsLoading(false);
  //       enqueueSnackbar(`Could not update report`, {
  //         variant: "error",
  //       });
  //     });
  // };
  const handleUpdate = async (status: string) => {
    setIsLoading(true);
    const isValidTitle = isValid(adhocreportValues?.kpiReportInstanceName);
    if (!isValidTitle.isValid) {
      enqueueSnackbar(
        `Please enter a valid title ${isValidTitle.errorMessage}`,
        { variant: "error" }
      );
      return;
    }
    const isNumeric = (value: any) => {
      if (value === null || value === undefined) {
        return false;
      }
      // Return false if the value is not a string or number, or if it contains invalid characters
      if (typeof value !== "number" && typeof value !== "string") {
        return false;
      }

      const trimmedValue = String(value).trim();

      // Check if the trimmed value matches a numeric format with optional decimal and sign
      return /^-?\d+(\.\d+)?$/.test(trimmedValue);
    };

    // Validate if all kpiInfo objects have valid numeric values
    const allKpisHaveValues = adhocreportValues.categories.every((cat: any) =>
      cat.kpiInfo.every(
        (kpiObj: any) =>
          isNumeric(kpiObj.kpiValue) && isNumeric(kpiObj.kpiTarget)
      )
    );

    if (!allKpisHaveValues) {
      enqueueSnackbar(
        `Some KPIs have invalid values. Please correct them before saving.`,
        { variant: "error" }
      );
      setIsLoading(false);
      return; // Exit the function if validation fails
    }
    const kpisMissingComments: any = [];
    adhocreportValues.categories.forEach((cat: any) => {
      cat.kpiInfo.forEach((kpiObj: any) => {
        // console.log("kpiObj", kpiObj);
        const kpiValue = parseFloat(kpiObj.kpiValue);
        const kpiTarget = parseFloat(kpiObj.kpiTarget);
        const kpiMinTarget: any = kpiObj.kpiMinimumTarget
          ? parseFloat(kpiObj.kpiMinimumTarget)
          : undefined;
        // Check if kpiComments field is missing or empty
        const commentsMissing =
          !kpiObj.hasOwnProperty("kpiComments") ||
          kpiObj.kpiComments === undefined ||
          kpiObj.kpiComments === null ||
          kpiObj.kpicomments === "" ||
          kpiObj.kpiComments.trim() === "";

        if (
          isNumeric(kpiObj.kpiValue) &&
          isNumeric(kpiObj.kpiTarget) &&
          kpiValue < kpiTarget &&
          commentsMissing &&
          (kpiObj.kpiTargetType === "Increase" ||
            kpiObj.kpiTargetType === "Maintain")
        ) {
          kpisMissingComments.push({
            category: cat.catInfo?.ObjectiveCategory,
            kpiId: kpiObj._id,
            kpiName: kpiObj.kpiName,
          });
        } else if (
          isNumeric(kpiObj.kpiValue) &&
          isNumeric(kpiObj.kpiTarget) &&
          kpiValue > kpiTarget &&
          commentsMissing &&
          kpiObj.kpiTargetType === "Decrease"
        ) {
          kpisMissingComments.push({
            category: cat.catInfo?.ObjectiveCategory,
            kpiId: kpiObj._id,
            kpiName: kpiObj.kpiName,
          });
        } else if (
          kpiObj.kpiTargetType === "Range" &&
          isNumeric(kpiObj.kpiValue) &&
          isNumeric(kpiObj.kpiTarget) &&
          isNumeric(kpiObj.kpiMinimumTarget) &&
          (kpiValue > kpiTarget || kpiValue < kpiMinTarget) &&
          commentsMissing
        ) {
          // console.log("insid 3 conditon");
          kpisMissingComments.push({
            category: cat.catInfo?.ObjectiveCategory,
            kpiId: kpiObj._id,
            kpiName: kpiObj.kpiName,
          });
        }
      });
    });

    // Check if all KPIs have comments
    if (kpisMissingComments.length > 0) {
      // const missingCommentsDetails = kpisMissingComments
      //   .map((kpi: any) => `Category: ${kpi.category}, KPI: ${kpi.kpiName}`)
      //   .join(",");

      // enqueueSnackbar(
      //   `The following KPIs are missing comments: ${missingCommentsDetails}. Please add comments before submitting.`,
      //   {
      //     variant: "warning",
      //     autoHideDuration: 2000,
      //   }
      // );

      setMissingComments(kpisMissingComments);
      setOpenMissingCommentsModal(true);
      setIsLoading(false);
      return; // Stop execution

      // setIsLoading(false);
      // return; // Stop execution
    }
    // Set the report status to "DRAFT" if any kpiValue is missing
    const finalStatus = allKpisHaveValues ? status : "DRAFT";

    const temp = {
      kpiReportInstanceName: adhocreportValues.kpiReportInstanceName,
      kpiReportTemplateId: "",
      reportStatus: finalStatus,
      runDate: adhocreportValues.runDate,
      reportFrequency: adhocreportValues.reportFrequency,
      organization: userDetails.organizationId,
      year: adhocreportValues.year,
      yearFor: selectedFiscalYear
        ? selectedFiscalYear
        : adhocreportValues.yearFor,
      semiAnnual: selectedHalfYear
        ? selectedHalfYear
        : adhocreportValues.semiAnnual,
      catInfo: adhocreportValues.categories.map((cat: any) => ({
        kpiReportCategoryId: cat.catInfo?._id,
        kpiReportCategoryName: cat.catInfo?.ObjectiveCategory,
        columnsArray: [
          "kpiId",
          "kpiTargetType",
          "kpiTarget",
          "minimumTarget",
          "weightage",
          "kpiValue",
          "kpiComments",
        ],
        kpiInfo: cat.kpiInfo.map((kpiObj: any) => ({
          ...kpiObj,
          kpiId: kpiObj.kpiId,
          kpiTargetType: kpiObj.kpiTargetType,
        })),
      })),
    };

    await axios
      .put(`/api/kpi-report/updateadhocReportInstance/${id}`, temp)
      .then((res) => {
        if (finalStatus === "SUBMIT") {
          handleWriteToKpiDetailTable(id!);
          handleSendMail(id!);
          enqueueSnackbar(`Successfully updated`, {
            variant: "success",
          });
        } else if (!allKpisHaveValues) {
          enqueueSnackbar(
            `Some KPIs do not have valid values. The report has been saved as a draft.`,
            { variant: "info" }
          );
        } else if (finalStatus === "DRAFT") {
          enqueueSnackbar(`The report has been saved as a draft.`, {
            variant: "success",
          });
        }

        setIsLoading(false);
        navigate("/kpi", { state: { redirectToTab: "KPI Entry" } });
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
        enqueueSnackbar(`Could not update report`, {
          variant: "error",
        });
      });
  };

  const handleDelete = async () => {
    await axios
      .delete(`/api/kpi-report/deleteSelectedReportInstance/${id}`)
      .then(() => {
        setIsLoading(false);
        enqueueSnackbar(`Successfully deleted`, {
          variant: "success",
        });
        navigate("/kpi", { state: { redirectToTab: "KPI Entry" } });
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
        enqueueSnackbar(`Could not delete report`, {
          variant: "error",
        });
      });
  };
  const disableFutureDates = (current: any) => {
    // `current` is a Moment.js object representing the date to check
    return current && current > moment().endOf("day");
  };
  return (
    <>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        style={{ padding: smallScreen ? "10px" : "5px" }}
      >
        <Button
          variant="contained"
          disableElevation
          className={classes.draftButton}
          onClick={handleBack}
          // disabled={openFrom === "template"}
        >
          Back
        </Button>

        <Box>
          <Button
            variant="contained"
            disableElevation
            className={classes.deleteButton}
            onClick={handleDelete}
            disabled={openFrom === "template" || read}
          >
            Delete
          </Button>
          <Button
            variant="contained"
            disableElevation
            disabled={read}
            className={classes.draftButton}
            onClick={
              openFrom === "edit"
                ? () => handleUpdate("DRAFT")
                : () => handleCreate("DRAFT")
            }
          >
            Draft
          </Button>
          <Tooltip
            title="Once submitted, the record will be saved permanently"
            arrow
          >
            <Button
              variant="contained"
              disableElevation
              disabled={read}
              className={classes.draftButton}
              onClick={
                openFrom === "edit"
                  ? () => handleUpdate("SUBMIT")
                  : () => handleCreate("SUBMIT")
              }
            >
              Submit
            </Button>
          </Tooltip>
        </Box>
      </Box>

      <Typography variant="subtitle1" className={classes.label}>
        Report generated for
      </Typography>

      <div
        style={{
          display: "flex",
          flexDirection: matches ? "row" : "column",
          justifyContent: "space-between",
          alignItems: matches ? "center" : "start",
          gap: matches ? "0px" : "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: smallScreen ? "row" : "column",
            justifyContent: "center",
            // alignItems: "center",
            gap: smallScreen ? "0px" : "10px",
          }}
        >
          <div>
            {(selectedOption === "Monthly" ||
              adhocreportValues.reportFrequency === "Monthly") && (
              <FormControl
                variant="outlined"
                size="small"
                style={{ marginRight: "10px", width: "200px" }}
              >
                <InputLabel>Month</InputLabel>
                <Select
                  value={selectedMonth}
                  label="Month"
                  disabled={read || openFrom === "edit"}
                  className={classes.disabledMuiSelect}
                  onChange={(e: any) => setSelectedMonth(e.target.value)}
                >
                  {months.map((month: any) => (
                    <MenuItem
                      key={month}
                      value={month}
                      disabled={disabledMonths.includes(month)}
                    >
                      {month}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            {(selectedOption === "Quarterly" ||
              adhocreportValues.reportFrequency === "Quarterly") && (
              <FormControl
                variant="outlined"
                size="small"
                style={{ marginRight: "10px", width: "200px" }}
              >
                <InputLabel>Quarter</InputLabel>
                <Select
                  value={selectedQuarter}
                  label="Month"
                  disabled={read || openFrom === "edit"}
                  className={classes.disabledMuiSelect}
                  onChange={(e: any) => setSelectedQuarter(e.target.value)}
                >
                  {fiscalQuarters.map((month: any) => (
                    <MenuItem key={month} value={month}>
                      {month}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            {(selectedOption === "Daily" ||
              adhocreportValues.reportFrequency === "Daily") && (
              <FormControl
                variant="outlined"
                size="small"
                style={{ marginRight: "10px", width: "200px" }}
              >
                <DatePicker
                  picker="date"
                  disabled={read || openFrom === "edit"}
                  format="DD/MM/YYYY"
                  value={selectedDate ? dayjs(selectedDate) : null}
                  onChange={handleDateChange}
                  // onChange={(date: any) => setSelectedDate(date || new Date())}
                  // onClose={
                  //     setSelectedDate(new Date()) // Set to current date

                  // }
                  disabledDate={disableFutureDates}
                />
              </FormControl>
            )}
            {(selectedOption === "Half-Yearly" ||
              adhocreportValues.reportFrequency === "Half-Yearly") && (
              <FormControl
                variant="outlined"
                size="small"
                style={{ marginRight: "10px", width: "250px" }}
              >
                <InputLabel>Semi Annual</InputLabel>
                <Select
                  value={selectedHalfYear}
                  label="Month"
                  disabled={read || openFrom === "edit"}
                  className={classes.disabledMuiSelect}
                  onChange={(e: any) => setSelectedHalfYear(e.target.value)}
                >
                  {fiscalHalves.map((month: any) => (
                    <MenuItem key={month} value={month}>
                      {month}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </div>
          <div>
            <FormControl
              variant="outlined"
              size="small"
              style={{ marginRight: "10px", width: "200px" }}
            >
              <InputLabel>Fiscal Year</InputLabel>
              <Select
                value={
                  selectedFiscalYear
                    ? selectedFiscalYear
                    : adhocreportValues.yearFor
                }
                label="Year"
                disabled={read || openFrom === "edit"}
                className={classes.disabledMuiSelect}
                onChange={(e: any) => setSelectedFiscalYear(e.target.value)}
              >
                {fiscalYears.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </div>
        <TextField
          variant="outlined"
          size="small"
          label="Report Instance Name"
          style={{ width: smallScreen ? "500px" : "97%", border: "none" }}
          disabled={read || openFrom === "edit"}
          className={classes.disabledTextField}
          value={adhocreportValues.kpiReportInstanceName} // Set the value to the current report instance name
          onChange={(e) => {
            // Update the report instance name in state when the user types in the TextField
            setAdhocReportValues((prevState) => ({
              ...prevState,
              kpiReportInstanceName: e.target.value,
            }));
          }}
        />
        {matches ? (
          <Typography component="p" className={classes.modifiedText}>
            Modified on <strong>{adhocreportValues?.updatedAt}</strong>
          </Typography>
        ) : (
          ""
        )}
      </div>

      <div className={classes.tableContainerScrollable}>
        {/* {adhocreportValues?.categories.map((cat: any) => {
          // console.log("console.log", cat); // Log cat value here
          return (
            <Paper
              key={cat.catId}
              elevation={0}
              className={classes.categoryContainer}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    // variant="outlined"
                    size="small"
                    name="catName"
                    //   label="Category"
                    className={classes.disabledCategoryField}
                    value={
                      cat.catInfo?.ObjectiveCategory
                        ? cat.catInfo?.ObjectiveCategory
                        : cat.catName
                    }
                    required
                    disabled
                  />
                </Grid>

                <Grid item xs={12} style={{ overflowX: "scroll" }}>
                  <AdhocReportDesignContainer
                    reportValues={adhocreportValues}
                    setReportValues={setAdhocReportValues}
                    catId={cat.catInfo?._id ? cat.catInfo?._id : cat.catId}
                    cols={cols}
                    reportStatus={reportStatus}
                    read={read}
                    selectedOption={
                      !!selectedOption
                        ? selectedOption
                        : adhocreportValues.reportFrequency
                    }
                  />
                </Grid>
              </Grid>
            </Paper>
          );
        })} */}

        <Box
          sx={{
            display: "flex",
            flexDirection: smallScreen ? "row" : "column",
            paddingTop: "10px",
          }}
        >
          {/* Vertical Tabs */}
          <Paper
            elevation={0}
            style={{
              marginRight: smallScreen ? "20px" : "0px",
              paddingTop: smallScreen ? "20px" : "10px",
              backgroundColor: "white",
            }}
            // sx={{
            //   minWidth: "100px",
            //   paddingTop: "20px",
            //   marginRight: "20px",
            //   color: "grey",
            //   // background: grey,
            // }}
          >
            <Tabs
              orientation="vertical"
              variant="scrollable"
              value={selectedTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              classes={{ root: classes.root, indicator: classes.indicator }}
              aria-label="tabs"
            >
              {adhocreportValues?.categories.map((cat, index) => (
                <Tab
                  key={index}
                  label={cat.catInfo?.ObjectiveCategory || cat.catName}
                  className={classes.tab}
                  style={{
                    // borderRadius: "5px",
                    fontWeight: selectedTab === index ? "bold" : "normal",
                    // fontSize: "15px",
                    color: selectedTab === index ? "#000000" : "#000000",
                    whiteSpace: "normal",
                    textAlign: "left",
                    paddingLeft: "12px",
                    minWidth: "100px",

                    background: selectedTab === index ? "#b3d9ff" : "#F5F5F5",
                  }}
                />
              ))}
            </Tabs>
          </Paper>

          {/* AdhocReportDesignContainer */}
          <Paper
            elevation={2}
            className={classes.categoryContainer}
            style={{
              marginRight: "20px",
              // paddingTop: "40px",
              // backgroundColor: "#f2f2f2",
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <AdhocReportDesignContainer
                  reportValues={adhocreportValues}
                  setReportValues={setAdhocReportValues}
                  catId={
                    adhocreportValues.categories[selectedTab]?.catInfo?._id ||
                    adhocreportValues.categories[selectedTab]?.catId
                  }
                  cols={cols}
                  reportStatus={reportStatus}
                  read={read}
                  selectedOption={
                    selectedOption || adhocreportValues?.reportFrequency
                  }
                />
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </div>
      <Dialog
        open={openMissingCommentsModal}
        onClose={() => setOpenMissingCommentsModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          The following KPIs have values lower than their targets. Please add
          comments for these KPIs:
        </DialogTitle>
        <DialogContent>
          {missingComments.length === 0 ? (
            <Typography>No missing comments.</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ fontWeight: "bold" }}>
                      <strong>Category</strong>
                    </TableCell>
                    <TableCell style={{ fontWeight: "bold" }}>
                      <strong>KPI</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {missingComments.map((kpi: any) => (
                    <TableRow key={kpi.kpiId}>
                      <TableCell>{kpi.category}</TableCell>
                      <TableCell>{kpi.kpiName}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenMissingCommentsModal(false)}
            color="primary"
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default AdhocReport;
