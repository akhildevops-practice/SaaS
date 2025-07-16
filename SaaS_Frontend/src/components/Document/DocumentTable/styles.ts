import { makeStyles, Theme } from "@material-ui/core/styles";

export interface StyleProps {
  matches: boolean;
}
const useStyles = makeStyles<Theme, StyleProps>((theme: Theme) => ({
  alternateRowColor1: {
    backgroundColor: "#ffffff", // change as per your need
  },
  alternateRowColor2: {
    backgroundColor: "#f7f7f7", // change as per your need
  },
  pagination: {
    position: "fixed",
    bottom: "3px",
    right: "0",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "inherit",
    zIndex: 5,
    padding: theme.spacing(1),
  },
  "& .MuiOutlinedInput-input": {
    fontSize: "14px",
    backgroundColor: "blue",
  },
  tableContainer: {
    "& .ant-table-wrapper .ant-table.ant-table-bordered > .ant-table-container > .ant-table-summary > table > tfoot > tr > td": {
      borderInlineEnd: "none",
    },
    "& .ant-table-thead .ant-table-cell": {
      backgroundColor: "#E8F3F9",
      borderBottom: "1px solid #003059",
      color: "#00224E",
      textAlign: "center", // ✅ NEW: center align header cell content
    },
    "& span.ant-table-column-sorter-inner": {
      color: "#00224E",
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
      position: "sticky",
      top: 0,
      zIndex: 2,
      fontWeight: 600,
      fontSize: "14px",
      padding: "6px 8px !important",
      lineHeight: "24px",
      textAlign: "center", // ✅ NEW: ensures center alignment
    },
    "& .ant-table-tbody >tr >td": {
      borderBottom: "1px solid #f0f0f0",
      padding: "4px 8px !important",
    },
    "& .ant-table-wrapper .ant-table-container": {
      maxHeight: ({ isGraphSectionVisible }: { isGraphSectionVisible: boolean }) =>
        isGraphSectionVisible ? "25vh" : "65vh",
      [theme.breakpoints.up("xl")]: {
        maxHeight: ({ isGraphSectionVisible }: { isGraphSectionVisible: boolean }) =>
          isGraphSectionVisible ? "45vh" : "70vh",
      },
      overflowY: "auto",
      overflowX: ({ matches }: { matches: boolean }) => (matches ? "hidden" : "scroll"),
    },
    "& .ant-table-body": {
      maxHeight: "150px",
      overflowY: "auto",
      "&::-webkit-scrollbar": {
        width: "8px",
        height: "10px",
        backgroundColor: "#e5e4e2",
      },
      "&::-webkit-scrollbar-thumb": {
        borderRadius: "10px",
        backgroundColor: "grey",
      },
    },
    "& tr.ant-table-row": {
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
  filterFieldRowMobile: {
    display: "flex",
    flexDirection: "column",
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
