import { makeStyles, Theme } from "@material-ui/core/styles";
const useStyles = makeStyles<Theme>((theme: Theme) => ({
  // tableContainer: {
  //   fontFamily: "Poppins !important",
  //   "& .ant-table-thead .ant-table-cell": {
  //     backgroundColor: "#E8F3F9",
  //     color: "#00224E",
  //   },
  //   "& span.ant-table-column-sorter-inner": {
  //     color: "#00224E",
  //   },
  //   "& .ant-table-wrapper .ant-table-thead>tr>th": {
  //     padding: "12px 16px",
  //     fontWeight: 600,
  //     fontSize: "15px",
  //     lineHeight: "24px",
  //   },
  //   "& .ant-table-tbody >tr >td": {
  //     borderBottom: "black",
  //     padding: "2px",
  //   },
  //   "& tr.ant-table-row": {
  //     borderRadius: 5,
  //     cursor: "pointer",
  //     transition: "all 0.1s linear",

  //     "&:hover": {
  //       backgroundColor: "white !important",
  //       boxShadow: "0 1px 5px 0px #0003",
  //       transform: "scale(1.01)",

  //       "& td.ant-table-cell": {
  //         backgroundColor: "white !important",
  //       },
  //     },
  //   },
  // },
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
      }) => (isGraphSectionVisible ? "160px" : "420px"), // Adjust the max-height value as needed
      [theme.breakpoints.up("lg")]: {
        maxHeight: ({
          isGraphSectionVisible,
        }: {
          isGraphSectionVisible: boolean;
        }) => (isGraphSectionVisible ? "160px" : "420px"), // Adjust the max-height value as needed for large screens
      },
      [theme.breakpoints.up("xl")]: {
        maxHeight: ({
          isGraphSectionVisible,
        }: {
          isGraphSectionVisible: boolean;
        }) => (isGraphSectionVisible ? "600px" : "1000px"), // Adjust the max-height value as needed for extra large screens
      },
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
  buttonColor: {
    marginRight: 16,
    paddingLeft: 12,
    paddingRight: 12,
    fontSize: theme.typography.pxToRem(13),
    backgroundColor: theme.textColor.white,
    borderRadius: theme.typography.pxToRem(5),
    borderColor: theme.palette.primary.light,
    color: theme.palette.primary.light,
    [theme.breakpoints.up("sm")]: {
      paddingLeft: 18,
      paddingRight: 18,
      fontSize: theme.typography.pxToRem(13),
    },
    "&:hover": {
      backgroundColor: theme.palette.primary.light,
      color: theme.textColor.white,
    },
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
  formTextPadding: {
    color: "#0E0A42",
    // padding: theme.typography.pxToRem(14),
    padding: "27px 14px 14px 14px",
    fontSize: theme.typography.pxToRem(13),
  },
  formBox: {
    width: "100%",
    paddingBottom: theme.typography.pxToRem(25),
    fontFamily: "poppins",
  },
  uploadSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: theme.spacing(3),
    border: `1px dashed ${theme.palette.primary.main}`,
    backgroundColor: theme.palette.grey[100],
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.grey[200],
    },
  },
}));

export default useStyles;
