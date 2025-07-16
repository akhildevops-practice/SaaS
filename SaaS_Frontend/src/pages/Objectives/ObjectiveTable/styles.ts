import { makeStyles, createStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) =>
  createStyles({
    fabButton: {
      backgroundColor: theme.palette.primary.light,
      color: "#fff",
      margin: "0 5px",
      "&:hover": {
        backgroundColor: theme.palette.primary.main,
      },
    },
    filterButton: {
      borderRadius: 8,
      padding: "6px 12px",
      border: "1px solid #0f172a",
      fontWeight: 500,
      textTransform: "none",
      display: "flex",
      alignItems: "center",
      gap: 6,
      backgroundColor: "#fff",
      color: "#0f172a",
      cursor: "pointer",
    },
    iconButton: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    customModal: {
      "& .ant-modal-close": {
        color: "rgb(0, 48, 89);",
        fontSize: "20px",
      },
      "& .ant-modal-close:hover": {
        color: "rgb(0, 48, 89);",
      },
      overflowY: "auto",
    },
    tableContainerScrollable: {
      marginBottom: "20px", // Adjust the value as needed
      maxHeight: "calc(76vh - 20vh)", // Adjust the max-height value as needed
      overflowY: "auto",
      // overflowX: "scroll",
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
    tableContainer: {
      overflowX: "scroll",
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
    groupArrow: {
      float: "left",
      cursor: "pointer",
    },
    modalBox: {
      "& .ant-modal-header": {
        textAlign: "center",
      },
    },
    SearchBox: {
      width: "60%",
      [theme.breakpoints.down("sm")]: {
        // marginTop: theme.typography.pxToRem(10),
      },
      "& .MuiOutlinedInput-root": {
        borderRadius: "10px",
      },
    },
    imgContainer: {
      display: "flex",
      justifyContent: "center",
    },
    emptyDataText: {
      fontSize: theme.typography.pxToRem(14),
      color: theme.palette.primary.main,
    },
    buttonStyle: {
      backgroundColor: "#003059",
      color: "#ffffff",
      marginRight: "1%",
      "&:hover": {
        backgroundColor: theme.palette.primary.main,
      },
    },
    // tableContainer: {
    //   "& .ant-table-thead .ant-table-cell": {
    //     // backgroundColor: `${theme.palette.primary.main} !important`,
    //     backgroundColor: "#E8F3F9",
    //     color: "#00224E !important",

    //     "& span.ant-table-column-sorter-inner": {
    //       color: "#00224E !important",
    //     },
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

    formTextPadding: {
      padding: theme.typography.pxToRem(14),
      fontSize: theme.typography.pxToRem(13),
    },
    // formBox: {
    //   width: "100%",
    //   paddingBottom: theme.typography.pxToRem(25),
    // },
    formBox: {
      marginTop: "15px",
      height: "auto",
      overflowY: "auto",
      "&::-webkit-scrollbar": {
        width: "10px",
        backgroundColor: "white",
      },
      "&::-webkit-scrollbar-thumb": {
        borderRadius: "10px",
        backgroundColor: "grey",
      },
    },
    root: {
      width: "100%",
      // maxHeight: "100%",
      maxHeight: "calc(80vh - 12vh)",
      overflowY: "auto",
      overflowX: "hidden",
      "&::-webkit-scrollbar": {
        width: "8px",
        height: "10px",
        backgroundColor: "#e5e4e2",
      },
      "&::-webkit-scrollbar-thumb": {
        borderRadius: "10px",
        backgroundColor: "grey",
      },
      // paddingTop: theme.typography.pxToRem(20),
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
    moduleformBox: {
      width: 10,
      paddingBottom: theme.typography.pxToRem(25),
    },

    sendBtn: {
      fontSize: theme.typography.pxToRem(15),
      color: "#FFFFFF",
      marginRight: theme.typography.pxToRem(20),
      backgroundColor: theme.palette.primary.light,
    },
    subTableContainer: {
      "& .ant-table-container": {
        backgroundColor: "#E8F3F9",
        // overflowX: "auto",

        // overflow: 'hidden',
        overflowY: "auto",

        "& span.ant-table-column-sorter-inner": {
          color: "#380036",
          backgroundColor: "white !important",
        },
      },
      "& .ant-table-wrapper .ant-table-thead>tr>th": {
        padding: "12px 16px",
        fontWeight: 600,
        fontSize: "14px",
        // backgroundColor: 'black !important',
      },
      "& .ant-table-cell": {
        // backgroundColor : '#f7f7ff'
      },
      "& .ant-table-wrapper .ant-table-thead > tr > th:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before, .ant-table-wrapper .ant-table-thead > tr > td:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before":
        {
          backgroundColor: "#E8F3F9",
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
        borderBottom: "1px solid #003059",
      },
    },
    form: {
      padding: theme.typography.pxToRem(20),
      borderRadius: theme.typography.pxToRem(10),
      backgroundColor: "#FFFFFF",
      minHeight: "100%",
    },
    modal: {
      "& .ant-modal-header": {
        textAlign: "center",
      },
      "&.ant-modal .ant-modal-content": {
        padding: "0px 0px 10px 0px",
      },
    },
    objectiveTable: {
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
    modal2: {
      "&.ant-modal .ant-modal-content": {
        padding: "0px 0px 10px 0px",
      },
    },
  })
);
