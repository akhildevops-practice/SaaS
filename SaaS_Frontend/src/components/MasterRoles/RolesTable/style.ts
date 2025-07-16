import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  tableContainer: {
    overflowY: "auto",
    "& .ant-table-tbody >tr >td": {
      borderBottom: `1px solid black`, // Customize the border-bottom color here
    },
    "& .ant-table-wrapper .ant-table-thead>tr>th": {
      padding: "10px 16px",
      fontWeight: 500,
      fontSize: "13px",
      // backgroundColor: "aliceblue",
    },
    "& :where(.css-dev-only-do-not-override-15rg2km).ant-table-wrapper .ant-table-tbody >tr.ant-table-row:hover>th, :where(.css-dev-only-do-not-override-15rg2km).ant-table-wrapper .ant-table-tbody >tr.ant-table-row:hover>td, :where(.css-dev-only-do-not-override-15rg2km).ant-table-wrapper .ant-table-tbody >tr >th.ant-table-cell-row-hover>td.ant-table-cell-row-hover":
      {
        background: "none !important  ",
      },
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

  listWrapper: {
    maxHeight: "200px",
    overflowY: "auto",
    // boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
    "&::-webkit-scrollbar": {
      width: "10px",
      backgroundColor: "white",
    },
    "&::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "grey",
    },
  },
}));

export default useStyles;
