import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  segmentedItem: {
    border: "2px solid #0e8aba",
    backgroundColor: "#ffffff",

    "&.ant-segmented .ant-segmented-item-selected": {
      backgroundColor: "#0e8aba !important", // Selected color
      color: "white !important", // Change text color when selected
    },
    "&.ant-segmented .ant-segmented-item-label": {
      padding: "0px 5px!important",
    },
    "&.ant-segmented .ant-segmented-item": {
      // borderRight: "1px solid grey", // Add separator to the right of each item
      padding: "0px 5px", // Adjust horizontal padding
      borderRadius: "8px",
    },

    // Remove the separator for the last segment
    "&.ant-segmented .ant-segmented-item:last-child": {
      borderRight: "none", // No border on the last item
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
  fabButton: {
    fontSize: theme.typography.pxToRem(1),
    backgroundColor: theme.palette.primary.light,
    color: "#fff",
    margin: "0 15px",
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    },
    height: "10px",
    width: "35px",
  },
  loader: {
    display: "flex",
    justifyContent: "center",
  },

  imgContainer: {
    display: "flex",
    justifyContent: "center",
  },
  emptyDataText: {
    fontSize: theme.typography.pxToRem(14),
    color: theme.palette.primary.main,
  },
  subTableContainer: {
    margin: "10px 0px",
    "& span.ant-table-column-sorter-inner": {
      color: "#380036",
      backgroundColor: "white !important",
    },
    // },
    "& .ant-table-wrapper .ant-table-thead>tr>th": {
      padding: "12px 16px",
      fontWeight: 600,
      fontSize: "14px",
      // backgroundColor: 'black !important',
    },
    "& .ant-table-cell": {
      backgroundColor: "#f7f7ff",
    },
    "& .ant-dropdown-menu": {
      maxHeight: "100px",
      overFlow: "scroll",
    },
    "& .ant-table-wrapper .ant-table-thead > tr > th:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before, .ant-table-wrapper .ant-table-thead > tr > td:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before":
      {
        backgroundColor: "black",
      },

    "& tr.ant-table-row": {
      borderRadius: 5,
      cursor: "pointer",
      transition: "all 0.1s linear",
    },
    "& .ant-table-tbody >tr >td": {
      borderBottom: `1px solid black`,
      // Customize the border-bottom color here
      backgroundColor: "white !important",
    },
    "& .ant-table-row.ant-table-row-level-1": {
      backgroundColor: "rgba(169,169,169, 0.1)",
    },
    "& .ant-table-thead .ant-table-cell": {
      backgroundColor: "rgb(239, 239, 239) !important",
      color: "black",
    },
  },
  docNavDivider: {
    top: "0.54em",
    height: "1.5em",
    background: "black",
  },
  selectedTab: {
    color: "#334D6E",
  },
  docNavText: {
    // fontFamily: "Poppins",
    fontWeight: 600,
    fontSize: "16px",
    letterSpacing: "0.3px",
    lineHeight: "24px",
    // color: "#000",
    marginLeft: "5px",
  },
  calenderView: {
    display: "flex",
    justifyContent: "end",
    marginTop: "10px",
    marginRight: "10px",
  },
  docNavIconStyle: {
    width: "27px",
    height: "26px",
    // paddingRight: "6px",
    cursor: "pointer",
    color: "black",
  },
  tabWrapper: {
    // backgroundColor: '#efefef',
    // boxShadow: '-3px 1px 4px 2px rgba(0,0,0,0.15)',

    "& .MuiTabs-root": {
      height: "36px",
      minHeight: "36px",
    },
    "& .MuiTab-root": {
      padding: 0,
      minWidth: "auto",
    },
    "& .MuiTab-wrapper": {
      display: "flex",
      flexDirection: "row",
      // justifyContent: "space-evenly",
      paddingBottom: "14px",
    },
    "& .MuiTabs-indicator": {
      color: "#334D6E",
    },
    "& .PrivateTabIndicator-colorPrimary-57": {
      backgroundColor: "#334D6E",
    },
  },
  documentTable: {
    "&::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "grey",
    },
  },
  actionSubTableContainer: {
    margin: "10px 0px",
    // maxHeight: "calc(45vh)", // Adjust the max-height value as needed
    // overflowY: "auto",
    // overflowX: "auto",
    "& span.ant-table-column-sorter-inner": {
      color: "#380036",
      backgroundColor: "white !important",
    },
    "& .ant-table-thead .ant-table-cell": {
      backgroundColor: "#DCDCDC !important",
      // fontFamily: "Poppins !important",
      color: "#00224E",
    },
    // },
    "& .ant-table-wrapper .ant-table-thead>tr>th": {
      padding: "12px 16px",
      fontWeight: 600,
      fontSize: "14px",
      // backgroundColor: 'black !important',
    },
    "& .ant-table-cell": {
      backgroundColor: "#f7f7ff",
    },
    "& .ant-dropdown-menu": {
      maxHeight: "100px",
      overFlow: "scroll",
    },
    "& .ant-table-wrapper .ant-table-thead > tr > th:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before, .ant-table-wrapper .ant-table-thead > tr > td:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before":
      {
        backgroundColor: "black",
      },

    "& tr.ant-table-row": {
      borderRadius: 5,
      cursor: "pointer",
      transition: "all 0.1s linear",
    },
    "& .ant-table-tbody >tr >td": {
      borderBottom: `1px solid black`,
      // Customize the border-bottom color here
      backgroundColor: "white !important",
    },
    "& .ant-table-row.ant-table-row-level-1": {
      backgroundColor: "rgba(169,169,169, 0.1)",
    },
    // "& .ant-table-thead .ant-table-cell": {
    //   backgroundColor: "rgb(239, 239, 239) !important",
    //   color: "black",
    // },
  },
  tableContainer: {
    marginTop: "1%",
    maxHeight: "calc(70vh - 14vh)", // Adjust the max-height value as needed
    overflowY: "auto",
    overflowX: "scroll",
    // fontFamily: "Poppins !important",
    "& .ant-table-wrapper .ant-table.ant-table-bordered > .ant-table-container > .ant-table-summary > table > tfoot > tr > td":
      {
        borderInlineEnd: "none",
      },
    "& .ant-table-thead .ant-table-cell": {
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
    // '& .ant-table-wrapper .ant-table-container': {
    //     maxHeight: '420px', // Adjust the max-height value as needed
    //     overflowY: 'auto',
    //     overflowX: 'hidden',
    // },
    "& .ant-table-body": {
      // maxHeight: '150px', // Adjust the max-height value as needed
      // overflowY: 'auto',
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
      cursor: "pointer",
      transition: "all 0.1s linear",
    },
  },
  locSearchBox: {
    width: "100%",
    [theme.breakpoints.down("sm")]: {
      marginTop: theme.typography.pxToRem(10),
    },
  },
  locSearchBox1: {
    width: "80%",
    [theme.breakpoints.down("sm")]: {
      marginTop: theme.typography.pxToRem(10),
    },
  },
  mrmtext: {
    fontSize: "17px",
    marginLeft: "8px",
    cursor: "pointer",
  },
  filename: {
    fontSize: theme.typography.pxToRem(12),
    color: theme.palette.primary.light,
    textOverflow: "ellipsis",
    overflow: "hidden",
    width: "160px",
    whiteSpace: "nowrap",
  },

  icon: {
    cursor: "pointer",
    fontSize: "20px",
  },

  scroll: {
    "&::-webkit-scrollbar": {
      width: "12px",
      backgroundColor: "#F5F5F5",
    },
    "&::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "grey",
    },

    "&::-webkit-scrollbar-track": {
      borderRadius: "10px",
      backgroundColor: "#F5F5F5",
    },
  },

  formControl: {
    margin: theme.spacing(1),
    minWidth: 320,
  },
  text: {
    fontSize: "18px",
    fontWeight: 600,
    marginLeft: "10px",
    marginTop: "10px",
    marginBottom: "0px",
  },
  input: {
    width: "100%",
  },
  resize: { fontSize: theme.typography.pxToRem(14) },
  iconButton: {
    paddingLeft: "1rem",
  },
  DropDwonScroll: {
    maxHeight: "180px",
    overflowY: "scroll",
    borderRadius: "5px",
    boxShadow:
      "0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)",
    backgroundColor: "#ffffff",
  },
  helpTourList: {
    cursor: "pointer",
    "&:hover": {
      textDecoration: "underline",
    },
  },
  labelStyle: {
    "& .ant-input-lg": {
      border: "1px solid #dadada",
    },
    "& .ant-form-item .ant-form-item-label > label": {
      color: "#003566",
      fontWeight: "bold",
      letterSpacing: "0.8px",
    },
    "& .ant-input-disabled, & .ant-select-disabled, & .ant-select-disabled .ant-select-selector, & .ant-select-multiple.ant-select-lg .ant-select-selection-item-content, & .MuiInputBase-input.Mui-disabled":
      {
        color: "black !important",
      },
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
