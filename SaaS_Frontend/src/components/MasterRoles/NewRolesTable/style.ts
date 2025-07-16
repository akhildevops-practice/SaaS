import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  tableContainer: {
    overflowY: "auto",
    // "& .ant-table-tbody >tr >td": {
    //   borderBottom: `1px solid black`, // Customize the border-bottom color here
    // },

    "& .ant-table-wrapper .ant-table-thead > tr > th:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before, .ant-table-wrapper .ant-table-thead > tr > td:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before":
      {
        backgroundColor: "black",
      },
    "& .ant-table-wrapper .ant-table-thead>tr>th": {
      padding: "10px 16px",
      fontWeight: "bold",
      fontSize: "14px",
      backgroundColor: "#E8F3F9",
      borderBottom: "1px solid #003059",

      // color : "black",
    },
    "& :where(.css-dev-only-do-not-override-15rg2km).ant-table-wrapper .ant-table-tbody >tr.ant-table-row:hover>th, :where(.css-dev-only-do-not-override-15rg2km).ant-table-wrapper .ant-table-tbody >tr.ant-table-row:hover>td, :where(.css-dev-only-do-not-override-15rg2km).ant-table-wrapper .ant-table-tbody >tr >th.ant-table-cell-row-hover>td.ant-table-cell-row-hover":
      {
        background: "none !important  ",
      },
    "& .ant-table-wrapper .ant-table-tbody>tr>td": {
      padding: "8px 14px !important",
    },
  },
  root: {
    width: "100%",
    // maxHeight: "calc(76vh - 12vh)", // Adjust the max-height value as needed
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
    paddingTop: theme.typography.pxToRem(20),
  },
  scrollableDiv: {
    maxHeight: "200px",
    overflowY: "auto",
    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    maxWidth: "270px",
    "&::-webkit-scrollbar": {
      width: "10px",
      backgroundColor: "#e5e4e2",
    },
    "&::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "grey",
    },
  },

  popover: {
    "& .ant-popover-content": {
      width: "300px !important",
    },
    "& .ant-popover-inner": {
      width: "300px !important",
    },
  },
}));

export default useStyles;
