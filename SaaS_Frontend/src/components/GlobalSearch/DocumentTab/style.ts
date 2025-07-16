import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles<Theme>((theme: Theme) => ({
  pagination: {
    // float : "right",
    position: "relative", // Changed from fixed to relative
    marginTop: "12px", // Added margin-top to create space between the table and pagination
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "inherit",
    padding: theme.spacing(1),
  },
  alternateRowColor1: {
    backgroundColor: "#ffffff", // change as per your need
  },
  alternateRowColor2: {
    backgroundColor: "#f7f7f7", // change as per your need
  },
  tableContainer: {
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
      // fontFamily: "Poppins !important",
      color: "#00224E",
    },
    "& span.ant-table-column-sorter-inner": {
      color: "#00224E",
      // color: ({ iconColor }) => iconColor,
    },
    "& span.ant-tag": {
      display: "flex",
      width: "89px",
      padding: "5px 0px",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: "10px",
      color: "white",
    },
    "& .ant-table-wrapper .ant-table-thead>tr>th": {
      position: "sticky", // Add these two properties
      top: 0, // Add these two properties
      zIndex: 2,
      // padding: "12px 16px",
      fontWeight: 600,
      fontSize: "14px",
      padding: "6px 8px !important",
      // fontFamily: "Poppins !important",
      lineHeight: "24px",
    },
    "& .ant-table-tbody >tr >td": {
      // borderBottom: ({ tableColor }) => `1px solid ${tableColor}`, // Customize the border-bottom color here
      borderBottom: "black",
      padding: "4px 8px !important",
    },
    "& .ant-table-wrapper .ant-table-container": {
      minHeight: "500px", // Adjust the min-height value as needed
      maxHeight: "500px", // Adjust the max-height value as needed
      overflowY: "auto",
      overflowX: "hidden",
    },
    "& .ant-table-body": {
      maxHeight: "150px", // Adjust the max-height value as needed
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
  shortenText: {
    width: 250,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  clickableField: {
    cursor: "pointer",
    color: "#000",
  },
  filterButtonContainer: {
    [theme.breakpoints.down("sm")]: {
      position: "fixed",
      bottom: theme.typography.pxToRem(50),
      right: theme.typography.pxToRem(20),
    },
  },
  fabButton: {
    fontSize: theme.typography.pxToRem(12),
    backgroundColor: theme.palette.primary.light,
    color: "#fff",
    margin: "0 5px",
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    },
  },
  filtersContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    // margin: "30px 0",

    [theme.breakpoints.down("xs")]: {
      display: "block",
    },
  },
  filterField: {
    minWidth: 120,
    width: "100%",
    marginBottom: 7,
  },
  documentTable: {
    // overflowX: "auto",
    // "&::-webkit-scrollbar": {
    //   width: "5px",
    //   height: "10px", // Adjust the height value as needed
    //   backgroundColor: "white",
    // },
    "&::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "grey",
    },
  },
  groupArrow: {
    float: "left",
    cursor: "pointer",
  },
  boxStyle: {
    width: "100%",
    padding: "5px",
  },
  actionButtonStyle: {
    minWidth: 10,
    padding: "4px",
    color: "black",
  },
  filterWhere: {
    paddingLeft: "13px",
    fontSize: "15px",
  },
  filterFieldRow: {
    display: "flex",
    flexDirection: "row",
    width: "100% ",
  },
  docNavDivider: {
    height: "1.4em",
    background: "gainsboro",
  },
  dottedDividerStyle: {
    border: "none",
    borderTop: "1px dashed #C4C4C4",
    margin: "10px 0",
  },
  publishedDateContainer: {
    paddingLeft: "5px",
    paddingBottom: "15px",
    fontSize: "14px",
    fontWeight: "bold",
  },
  topSection: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100% ",
  },
  filterDate: {
    display: "flex",
    flexDirection: "column",
    width: "100% ",
  },
  filterBody: {
    border: "1px solid rgba(19, 171, 155, 0.5)",
    borderRadius: "12px",
    padding: "20px",
  },
}));

export default useStyles;
