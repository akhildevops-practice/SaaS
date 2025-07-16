import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  unitColumn: {
    fontWeight: "bold",
  },
  unitColumn2: {
    textAlign: "center",
    width: "40px",
    fontWeight: "bold",
  },
  header: {
    backgroundColor: "#D9EAD3",
    fontWeight: "bold",
    textAlign: "center",
  },
  tableContainer: {
    "& .ant-table-container": {
      // overflowX: "auto",
      marginTop: "2%",
      overflowY: "hidden",
      "& span.ant-table-column-sorter-inner": {
        color: "#380036",
      },
      "&::-webkit-scrollbar": {
        width: "5px",
        height: "10px", // Adjust the height value as needed
        backgroundColor: "white",
      },
      "&::-webkit-scrollbar-thumb": {
        borderRadius: "10px",
        backgroundColor: "grey",
      },
    },
    "& .ant-table-wrapper .ant-table-thead>tr>th": {
      padding: "8px 12px !important",
      fontWeight: 500,
      fontSize: "13px",
      backgroundColor: "#D9EAD3",
      textAlign: "center",
    },
    "& .ant-table-cell": {
      // backgroundColor : '#f7f7ff'
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
      borderBottom: `1px solid #f0f0f0`, // Customize the border-bottom color here
      padding: "5px 6px",
    },
    "& .ant-table-row.ant-table-row-level-1": {
      backgroundColor: "rgba(169,169,169, 0.1)",
    },
    "& .ant-table-thead .ant-table-cell": {
      padding: "4px 6px !important",
      backgroundColor: "#D9EAD3",
      borderBottom: "1px solid #003059",
      color: "#00224E",
      textAlign: "center",
    },
  },
}));

export default useStyles;
