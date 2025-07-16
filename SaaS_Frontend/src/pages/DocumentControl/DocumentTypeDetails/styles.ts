import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  pagination: {
    position: "relative", // Changed from fixed to relative
    marginTop: "20px", // Added margin-top to create space between the table and pagination
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "inherit",
    padding: theme.spacing(1),
  },
  tableContainer: {
    // Table Header Styles
    // "& .ant-table-thead > tr > th": {
    //   backgroundColor: "#E8F3F9", // Set the table header background color to yellow
    // },
    "& .ant-table-thead .ant-table-cell": {
      // backgroundColor: ({ headerBgColor }) => headerBgColor,
      // color: ({ tableColor }) => tableColor,
      backgroundColor: "#E8F3F9",
      borderBottom: "1px solid #003059",
      padding: "4px 12px",
      // fontFamily: "Poppins !important",
      color: "#00224E",
    },
    // Table Body Styles
    "& .ant-table-tbody > tr > td": {
      // border: "0.5px solid #E6E8EA", // Add a border around each table body cell
      padding: "2px 12px", // Adjust the padding as needed
      height: "50px", // Set the height of the table cells
    },
    // "& tr.ant-table-row:nth-child(odd)": {
    //   backgroundColor: "#F5F5F5", // Odd row color
    // },
    // "& tr.ant-table-row:nth-child(even)": {
    //   backgroundColor: "#FFFFFF", // Even row color
    // },
  },
  topSection: {
    display: "flex",
    justifyContent: "space-between",
  },
  textSection: {
    fontSize: theme.typography.pxToRem(15),
    [theme.breakpoints.up("sm")]: {
      fontSize: theme.typography.pxToRem(20),
    },
    [theme.breakpoints.down("xs")]: {
      width: 500,
    },
    paddingTop: 10,
  },
  emptyTableImg: {
    display: "flex",
    justifyContent: "center",
  },
  emptyDataText: {
    fontSize: theme.typography.pxToRem(14),
    color: theme.palette.primary.main,
  },
  loader: {
    height: "60vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  topSectionLeft: {
    width: "40%",
    [theme.breakpoints.down("sm")]: {
      width: "60%",
    },
    display: "flex",
    justifyContent: "space-even",
  },
  locSearchBox: {
    // border: "1px solid black",
    // borderRadius: "5px",
    width: "100%",
    [theme.breakpoints.down("sm")]: {
      marginTop: theme.typography.pxToRem(10),
    },
  },
  searchBoxText: {
    marginTop: theme.typography.pxToRem(10),
    fontSize: theme.typography.pxToRem(13),
  },
  dialogBtnSection: {
    [theme.breakpoints.down("sm")]: {
      marginTop: theme.typography.pxToRem(40),
    },
  },
  fabButton: {
    backgroundColor: theme.palette.primary.light,
    color: "#fff",
    margin: "0 5px",
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    },
  },
}));

export default useStyles;
