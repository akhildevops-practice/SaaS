import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  tableContainer: {
    width: "100%",
    // maxHeight: theme.typography.pxToRem(20)
    paddingTop: theme.typography.pxToRem(20),
  },
  root: {
    width: "100%",
    maxHeight: "calc(76vh - 12vh)", // Adjust the max-height value as needed
    overflowY: "auto",
    overflowX: "hidden",
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
  topSection: {
    display: "flex",
    justifyContent: "space-between",
  },
  newTableContainer: {
    marginTop: "1%",
    // fontFamily: "Poppins !important",
    "& .ant-table-wrapper .ant-table.ant-table-bordered > .ant-table-container > .ant-table-summary > table > tfoot > tr > td":
      {
        borderInlineEnd: "none",
      },

    // overflowY: "hidden",
    // overflowX: "hidden !important",
    "& .ant-table-thead .ant-table-cell": {
      // backgroundColor: ({ headerBgColor }) => headerBgColor,
      // color: ({ tableColor }) => tableColor,
      backgroundColor: "#E8F3F9",
      padding: "4px 8px !important",
      // fontFamily: "Poppins !important",
      color: "#00224E",
    },
    "& span.ant-table-column-sorter-inner": {
      color: "#00224E",
      // color: ({ iconColor }) => iconColor,
    },
    "& span.ant-tag": {
      display: "flex",
      width: "105px",
      padding: "5px 0px",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: "10px",
      color: "white",
      letterSpacing: "0.5px",
    },
    // "& .ant-table-wrapper .ant-table-thead>tr>th": {
    //   position: "sticky", // Add these two properties
    //   top: 0, // Add these two properties
    //   zIndex: 2,
    //   // padding: "12px 16px",
    //   fontWeight: 600,
    //   fontSize: "14px",
    //   padding: "4px 10px !important",
    //   // fontFamily: "Poppins !important",
    //   lineHeight: "24px",
    // },

    "& .ant-table-tbody >tr >td": {
      // borderBottom: ({ tableColor }) => `1px solid ${tableColor}`, // Customize the border-bottom color here
      borderBottom: "1px solid #f0f0f0",
      padding: "4px 8px !important",
    },
    "& .ant-table-wrapper .ant-table-container": {
      maxHeight: "420px",
      overflowY: "auto",
      overflowX: "hidden",
    },
    "& .ant-table-body": {
      maxHeight: "150px", // Adjust the max-height value as needed
      overflowY: "auto",
      overflowX: "hidden",
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
    "& tr.ant-table-row": {
      // borderRadius: 5,
      cursor: "pointer",
      transition: "all 0.1s linear",

      "&:hover": {
        backgroundColor: "white !important",
        boxShadow: "0 1px 5px 0px #0003",
        transform: "scale(1.01)",

        "& td.ant-table-cell": {
          backgroundColor: "white !important",
        },
      },
    },
    "& .ant-table-wrapper .ant-table-content  .ant-table-thead>tr>th": {
      padding: "4px 10px !important",
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
  textSection: {
    fontSize: theme.typography.pxToRem(15),
    [theme.breakpoints.up("sm")]: {
      fontSize: theme.typography.pxToRem(20),
    },
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
    display: "flex",
    justifyContent: "center",
  },
  searchContainer: {
    marginTop: "25px",
    maxWidth: "100vw",
  },
  filterButtonContainer: {
    [theme.breakpoints.down("sm")]: {
      position: "fixed",
      bottom: theme.typography.pxToRem(50),
      right: theme.typography.pxToRem(20),
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
