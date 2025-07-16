import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  tableContainer: {
    // "&.ant-table-cell": {
    //   maxWidth: "200px",
    // },
    // width: "1000px",
    margin: "auto",
    marginTop: "1%",
    // maxHeight: "calc(80vh - 14vh)", // Adjust the max-height value as needed
    overflowY: "auto",
    overflowX: "hidden",
    paddingRight: "10px",
    // fontFamily: "Poppins !important",
    "& .ant-table-wrapper .ant-table.ant-table-bordered > .ant-table-container > .ant-table-summary > table > tfoot > tr > td":
      {
        borderInlineEnd: "none",
      },
    "& .ant-table-thead .ant-table-cell": {
      // textAlign: "center",
      backgroundColor: "#e8f3f9",
      // fontFamily: "Poppins !important",
      color: "#003059",
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
      maxWidth: "200px",
      // borderBottom: ({ tableColor }) => `1px solid ${tableColor}`, // Customize the border-bottom color here
      // borderBottom: "1px solid #cccccc",
      padding: "5px 8px !important",
      // textAlign: "center",
    },

    "& .ant-table-body": {
      border: "1px solid white",
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
  table: {
    borderSpacing: 0,
    // border: "1px solid #ddd",
    "& th, & td": {
      position: "relative",
      transition: "background-color 0.2s",
      "&:hover": {
        backgroundColor: "#f0f0f0",
      },
      "&:last-child": {
        borderRight: "none",
      },
    },
  },
}));

export default useStyles;
