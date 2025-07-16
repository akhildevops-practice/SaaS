import { makeStyles, Theme } from "@material-ui/core/styles";
export interface StyleProps {
  isGraphSectionVisible: boolean;
  matches?: any;
}
const useStyles = makeStyles<Theme, StyleProps>((theme: Theme) => ({
  alternateRowColor1: {
    backgroundColor: "#ffffff", // change as per your need
  },
  alternateRowColor2: {
    backgroundColor: "#f7f7f7", // change as per your need
  },
  pagination: {
    width: ({ matches }) => (matches ? "" : "85%"),
    position: "fixed",
    bottom: "3px",
    right: "0",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: ({ matches }) => (matches ? "inherit" : "white"),
    zIndex: 5,
    padding: theme.spacing(1),
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
      borderBottom: "1px solid #003059",
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
      borderBottom: "1px solid #f0f0f0",
      padding: "4px 8px !important",
    },
    "& .ant-table-wrapper .ant-table-container": {
      maxHeight: ({
        isGraphSectionVisible,
      }: {
        isGraphSectionVisible: boolean;
      }) => (isGraphSectionVisible ? "25vh" : "65vh"), // Adjust the max-height value as needed
      // [theme.breakpoints.up("lg")]: {
      //   maxHeight: ({
      //     isGraphSectionVisible,
      //   }: {
      //     isGraphSectionVisible: boolean;
      //   }) => (isGraphSectionVisible ? "33vh" : "65vh"), // Adjust the max-height value as needed for large screens
      // },
      [theme.breakpoints.up("xl")]: {
        maxHeight: ({
          isGraphSectionVisible,
        }: {
          isGraphSectionVisible: boolean;
        }) => (isGraphSectionVisible ? "45vh" : "70vh"), // Adjust the max-height value as needed for extra large screens
      },
      overflowY: "auto",
      overflowX: "scroll",
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

      // "&:hover": {
      //   backgroundColor: "white !important",
      //   boxShadow: "0 1px 5px 0px #0003",
      //   transform: "scale(1.01)",

      //   "& td.ant-table-cell": {
      //     backgroundColor: "white !important",
      //   },
      // },
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
  CIPTable: {
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
  locSearchBox: {
    width: "100%",
    [theme.breakpoints.down("sm")]: {
      marginTop: theme.typography.pxToRem(10),
    },
    "& .MuiOutlinedInput-root": {
      borderRadius: "16px",
    },
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
  NavDivider: {
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
  modal: {
    "&.ant-modal .ant-modal-content": {
      padding: "0px 0px 10px 0px",
    },
  },
  summaryRoot: {
    display: "flex",
    padding: "0px 16px",
    minHeight: 30,

    fontSize: "17px",
    "& .MuiAccordionSummary-content": {
      margin: 0,
    },
    "&.MuiAccordionSummary-content .Mui-expanded": {
      margin: "5px 0px",
      minHeight: "10px",
    },
    "&.MuiButtonBase-root .MuiAccordionSummary-root .Mui-expanded": {
      minHeight: "10px",
    },
    "&.MuiAccordionSummary-root": {
      minHeight: "30px",
    },
  },
  headingRoot: {
    minHeight: 30,
    "&.MuiAccordionSummary-content .Mui-expanded": {
      margin: "10px 0px",
      minHeight: "30px",
    },
    "&.MuiAccordionSummary-root.Mui-expanded": {
      minHeight: "30px",
      margin: "10px 0px",
    },
  },
}));

export default useStyles;
