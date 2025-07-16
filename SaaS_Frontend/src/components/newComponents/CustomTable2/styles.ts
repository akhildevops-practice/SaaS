import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  toolbarButton: {
    textTransform: "uppercase",
    color: `${theme.palette.primary.main} !important`,
    fontWeight: 600,
  },
  popoverContainer: {
    padding: "3px 13px 13px 13px",
    maxWidth: 350,
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
      maxHeight: "200px", // Adjust the max-height value as needed
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
  colName: {
    fontSize: "0.9rem",
    fontWeight: 600,
    padding: "10px 0",
    paddingLeft: "10px",
    // border: "1px solid #3335",
  },
  row: {
    position: "relative",
    borderBottom: "1px solid #aaa",

    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  bodyCell: {
    fontSize: "0.85rem",
    border: "1px solid #3335",
  },
  dataCell: {
    fontSize: "0.85rem",
    padding: 7,
    borderRadius: 1,
    minHeight: 0,

    "&:hover": {
      outline: `1px solid ${theme.palette.primary.main}`,
    },
    "&.Mui-focused": {
      outline: `2px solid ${theme.palette.primary.main}`,
    },
  },
  footer: {
    display: "flex-end",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "17px 13px 13px 13px",
    overflowX: "hidden",
    overflowY: "auto",
  },
  resizer: {
    position: "absolute",
    right: -4,
    top: 0,
    height: "100%",
    width: 7,
    background: "#0005",
    opacity: 0,
    cursor: "col-resize",
    userSelect: "none",
    touchAction: "none",

    "&:hover": {
      opacity: 1,
    },

    "&.isResizing": {
      background: theme.palette.primary.main,
      opacity: 1,
    },
  },
}));

export default useStyles;
