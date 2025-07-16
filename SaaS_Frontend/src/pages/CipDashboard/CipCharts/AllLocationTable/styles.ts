import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles<Theme>((theme: Theme) => ({
  total: {
    fontWeight: "bold",
    textAlign: "start",
  },
  table: {
    // border: "1px solid grey",
    // textAlign: "center",
    borderTopLeftRadius: "0px", // Remove top-left border-radius
    borderTopRightRadius: "0px",

    "& .ant-table-thead > tr > th": {
      backgroundColor: "#ccffff", // Change background color of header
      color: "black", // Change text color of header
      //   borderBottom: "1px solid black", // Add bottom border to header
      borderRadius: "none",
      borderTopLeftRadius: "0px", // Remove top-left border-radius
      borderTopRightRadius: "0px",
      // textAlign: "center",
    },
    "& .ant-table-tbody > tr > td": {
      borderBottom: "1px solid #d9d9d9",
      padding: "8px 10px",
      // textAlign: "center",
    },
    // "& .ant-table-tbody > tr:last-child > td": {
    //   borderBottom: "none",
    // },
  },
  tableContainer: {
    overflowX: "auto",
    marginBottom: "30px",
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
      // overflowX: "hidden",
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
        // transform: "scale(1.01)",

        "& td.ant-table-cell": {
          backgroundColor: "white !important",
        },
      },
    },
  },
  documentTable: {
    "&::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "grey",
    },
  },
  nesteddocumentTable: {
    width: "90%",
    marginLeft: "5%",
    overflowX: "scroll",
    // "& .ant-table-wrapper": {
    //   overflowX: "auto !important",
    // },
    overflowY: "hidden",
    // overflowX: "hidden !important",

    "& .ant-table-thead .ant-table-cell": {
      // backgroundColor: ({ headerBgColor }) => headerBgColor,
      // color: ({ tableColor }) => tableColor,
      backgroundColor: "#e0e0eb",
      borderBottom: "1px solid #003059",
      // fontFamily: "Poppins !important",
      color: "#00224E",
    },
  },
}));
export default useStyles;
