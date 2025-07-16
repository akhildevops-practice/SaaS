import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  fabButton: {
    backgroundColor: theme.palette.primary.light,
    color: "#fff",
    margin: "0 5px",
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    },
  },
  // boardContainer: {
  //   padding: theme.spacing(2), // Add padding around the Kanban board
  //   display: "flex",
  //   justifyContent: "center", // Center content horizontally
  //   alignItems: "center", // Center content vertically
  //   overflowX: "auto",
  //   alignItems="flex-start"
  // },
  boardContainer: {
    padding: theme.spacing(1), // Add padding around the Kanban board
    display: "flex",
    alignItems: "flex-start", // Align content to the top
    // overflowX: 'auto',
  },
  column: {
    padding: theme.spacing(2),
    width: "300px",
    backgroundColor: "#f9f9f9",
    borderRadius: "5px",
    marginRight: theme.spacing(2),
  },
  columnName: {
    marginBottom: theme.spacing(1),
    textAlign: "center",
    fontSize: "17px",
    fontWeight: 600,
  },
  header: {
    display: "flex",
    alignItems: "center",
    // marginBottom: theme.spacing(1),
    borderRadius: "5px",
  },

  title: {
    // marginRight: theme.spacing(1),
    fontSize: "15px",
    fontWeight: "bold",
    padding: "0px 8px",
    // flexGrow: 1,
  },
  rightEnd: {
    marginLeft: 'auto', // Ensures the div is pushed to the right
  },
  taskContainer: {
    // padding: theme.spacing(2),
    backgroundColor: "#ffffff",
    borderRadius: "5px",
    // boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)",
    marginBottom: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
  },
  tableContainer: {
    // Table Header Styles
    "& .ant-table-thead .ant-table-cell": {
      // backgroundColor: ({ headerBgColor }) => headerBgColor,
      // color: ({ tableColor }) => tableColor,
      backgroundColor: "#E8F3F9",
      borderBottom: "1px solid #003059",
      // fontFamily: "Poppins !important",
      color: "#00224E",
    },

    // Table Body Styles
    "& .ant-table-tbody > tr > td": {
      borderBottom: "1px solid #f0f0f0",
      // border: "0.5px solid #E6E8EA", // Add a border around each table body cell
      padding: "2px", // Adjust the padding as needed
      height: "50px", // Set the height of the table cells
    },
    // "& tr.ant-table-row:nth-child(odd)": {
    //   backgroundColor: "#F5F5F5", // Odd row color
    // },
    // "& tr.ant-table-row:nth-child(even)": {
    //   backgroundColor: "#FFFFFF", // Even row color
    // },
  },
  imgContainer: {
    display: "flex",
    justifyContent: "center",
  },
  emptyDataText: {
    fontSize: theme.typography.pxToRem(14),
    color: theme.palette.primary.main,
  },
  topSectionLeft: {
    width: "40%",
    [theme.breakpoints.down("sm")]: {
      width: "60%",
    },
    display: "flex",
    justifyContent: "space-even",
  },
  searchContainer: {
    maxWidth: "100vw",
    // marginBottom: "25px",
  },

  topSection: {
    display: "flex",
    justifyContent: "space-between",
  },
  locSearchBox: {
    width: "100%",
    [theme.breakpoints.down("sm")]: {
      marginTop: theme.typography.pxToRem(10),
    },
    "& .MuiOutlinedInput-root": {
      borderRadius: "16px",
    },
  },
  customArrow: {
    color: "black",
  },
  customPopper: {
    zIndex: 1500, // Adjust zIndex as needed
  },
  customTooltip: {
    backgroundColor: "white",
    color: "black",
  },
  audittypeSearchBox: {
    width: "100%",
    [theme.breakpoints.down("sm")]: {
      marginTop: theme.typography.pxToRem(10),
    },
    "& .MuiOutlinedInput-root": {
      borderRadius: "16px",
    },
  },
  pagination: {
    position: "fixed",
    bottom: "3px",
    right: "0",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "inherit",
    padding: theme.spacing(1),
  },
  // Add this to override the styles
  inputRootOverride: {
    '& .MuiAutocomplete-inputRoot[class*="MuiOutlinedInput-root"][class*="MuiOutlinedInput-marginDense"]':
      {
        // padding: "3px 0px 1px 3px !important",
      },
  },

  searchBoxText: {
    marginTop: theme.typography.pxToRem(10),
    fontSize: theme.typography.pxToRem(13),
  },
  filterButton: {
    position: "absolute",
    top: 137,
    right: 90,
    backgroundColor: theme.palette.primary.light,
    color: "#fff",

    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    },
    [theme.breakpoints.down("sm")]: {
      position: "fixed",
      top: "auto",
      bottom: 50,
      right: 20,
      zIndex: 1,
    },
  },
  root: {
    width: "100%",
    // maxHeight: "calc(76vh - 12vh)",
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
    paddingTop: theme.typography.pxToRem(20),
  },

  mobileView: {
    width: "100%",
    height: "100%",
    padding: "0px",
    "&::-webkit-scrollbar": {
      width: "8px",
      height: "10px", // Adjust the height value as needed
      backgroundColor: "#e5e4e2",
    },
    "&::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "grey",
    },
    paddingTop: theme.typography.pxToRem(20),
  },
  auditScheduleCalendarWrapper: {
    width: "100%",
    height: "240px",
    overflow: "auto",
    [theme.breakpoints.up("sm")]: {
      height: "65vh",
    },
    [theme.breakpoints.up("lg")]: {
      height: "70vh",
    },
  },
  textField: {
    fontSize: "14px",
    fontWeight: 600,
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#EEEEEE",
      borderRadius: "20px",
      color: "black",
      fontSize: "14px",
      fontWeight: 600,
      border: "1px solid black",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderRadius: "20px",
    },
    "& .MuiSvgIcon-root": {
      color: "black", // Change icon color
    },
  },
  textField2: {
    fontSize: "14px",
    fontWeight: 600,
    "& .MuiOutlinedInput-root": {
      backgroundColor: "white",
      borderRadius: "20px",
      color: "black",
      border: "1px solid  black",
      fontSize: "14px",
      fontWeight: 600,
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderRadius: "20px",
    },
    "& .MuiSvgIcon-root": {
      color: "black", // Change icon color
    },
  },
  tag: {
    display: "inline-block",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    paddingLeft: "10px",
    // maxWidth: "100px", // Adjust the max-width as needed
  },
  tagContainer: {
    display: "flex",
    flexDirection: "row",
  },
  hiddenTags: {
    display: "none",
  },

  textField11: {
    fontSize: "14px",
    fontWeight: 600,
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#E8F3F9",
      borderRadius: "20px",
      color: "black",
      fontSize: "14px",
      fontWeight: 600,
      border: "1px solid black",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderRadius: "20px",
    },
    "& .MuiSvgIcon-root": {
      color: "black", // Change icon color
    },
  },
  textField211: {
    fontSize: "14px",
    fontWeight: 600,
    "& .MuiOutlinedInput-root": {
      backgroundColor: "white",
      borderRadius: "20px",
      color: "black",
      border: "1px solid black",
      fontSize: "14px",
      fontWeight: 600,
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderRadius: "20px",
    },
    "& .MuiSvgIcon-root": {
      color: "black", // Change icon color
    },
  },
  tag11: {
    display: "inline-block",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  hiddenTag: {
    display: "none",
  },
  month: {
    borderRadius: "50%",
    border: "1px solid #8c8c8c",
    backgroundColor: "white",
    color: "#8c8c8c",
    // padding: "10px",
    fontWeight: 600,
    width: "45px",
    height: "45px",
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  monthSelectedFromAPI: {
    borderRadius: "50%",
    border: "1px solid black",
    backgroundColor: "#b3b3cc",
    cursor: "pointer",
    color: "black",
    fontWeight: 600,
    width: "45px",
    height: "45px",
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  monthClicked: {
    borderRadius: "50%",
    border: "1px solid black",
    backgroundColor: "#993366",
    cursor: "pointer",
    color: "white",
    fontWeight: 600,
    width: "45px",
    height: "45px",
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
}));

export default useStyles;
