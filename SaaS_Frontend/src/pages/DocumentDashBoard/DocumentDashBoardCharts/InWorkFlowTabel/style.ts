import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles<Theme>((theme: Theme) => ({
  tableContainer: {
    // fontFamily: "Poppins !important",
    "& .ant-table-wrapper .ant-table.ant-table-bordered > .ant-table-container > .ant-table-summary > table > tfoot > tr > td":
      {
        // borderInlineEnd: "none",
      },

    "& .ant-table-thead .ant-table-cell": {
      boxSizing: "border-box", // Add this line
      backgroundColor: "#E8F3F9",
      border: "2px solid #CECECE",
      color: "#00224E",
      borderRadius: "0px",
      textAlign: "center",
      padding: "5px 8px",
    },
    "& span.ant-table-column-sorter-inner": {
      color: "#00224E",
      textAlign: "center",
    },
    "& span.ant-tag": {
      display: "flex",
      width: "89px",
      padding: "5px 0px",
      justifyContent: "center",
      alignItems: "center",

      color: "white",
    },
    "& .ant-table-wrapper .ant-table-thead>tr>th": {
      border: "2px solid #CECECE",
      // position: "sticky", // Add these two properties
      // top: 0, // Add these two properties

      fontWeight: 600,
      fontSize: "13px",
      padding: "6px 8px !important",
      textAlign: "center",
    },
    "& .ant-table-tbody >tr >td": {
      fontSize: "13px",
      // padding: "4px 8px !important",
      border: "1px solid #CECECE",
      textAlign: "center",
    },

    "& .ant-table-body": {
      // padding: "0px 8px", // Add padding to the right side
      border: "1px solid #CECECE",
      // maxHeight: "150px", // Adjust the max-height value as needed
      // overflowY: "auto",
      // "&::-webkit-scrollbar": {
      //   width: "8px",
      //   height: "10px",
      //   backgroundColor: "#e5e4e2",
      // },
      // "&::-webkit-scrollbar-thumb": {
      //   borderRadius: "0px",
      //   backgroundColor: "grey",
      // },
    },
    "& tr.ant-table-row": {
      borderRadius: 0,
      //   cursor: "pointer",
      transition: "all 0.1s linear",
    },
  },
  documentTable: {
    "&::-webkit-scrollbar-thumb": {
      //   borderRadius: "10px",
      backgroundColor: "red",
    },
    evenRow: {
      backgroundColor: "red", // Example color for even row
    },
    oddRow: {
      backgroundColor: "black", // Example color for odd row
    },
  },
  centerAlignedCell: {
    textAlign: "center",
    "&.ant-table-body ": {
      padding: "0px",
    },
    "&.ant-table-wrapper .ant-table-tbody>tr>td": {
      padding: "5px 8px",
    },

    "&.custom-pagination .ant-pagination": {
      fontSize: "12px" /* Adjust the font size as needed */,
    },

    /* Reduce the size of the pagination number */
    " &.custom-pagination .ant-pagination-item ": {
      fontSize: "12px",
    },

    /* Reduce the size of the pagination arrows */
    "& .custom-pagination .ant-pagination-item-link": {
      fontSize: "12px" /* Adjust the font size as needed */,
    },

    /* Reduce the size of the pagination size changer */
    "&.custom-pagination .ant-pagination-options ": {
      fontSize: "12px" /* Adjust the font size as needed */,
    },
  },
}));
export default useStyles;
