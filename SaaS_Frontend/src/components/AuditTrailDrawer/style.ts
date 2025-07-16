import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  docDetailsDrawer: {
    "& .ant-drawer-header": {
      backgroundColor: "aliceblue",
      textAlign: "center",
      padding: "10px 20px",
      borderBottom: "none",
    },
    borderBottomRightRadius: "10px",
    borderBottomLeftRadius: "10px",
  },
  auditTrailTable: {
    "& .ant-table-thead .ant-table-cell": {
      backgroundColor: "aliceblue",
      color: "black",
      padding: "5px 5px !important",
      textAlign: "center",
    },
    "& .ant-table-tbody tr.ant-table-row": {
      borderRadius: 5,
      cursor: "pointer",
      // transition: "all 0.1s linear",

      "& td.ant-table-cell": {
        padding: "5px 5px !important",
        textAlign: "center",
        // borderBottom : "none !important",
        // transition: "background-color 0.1s linear",
      },
    },
  },
  subTableContainer: {
    "& .ant-table-container": {
      backgroundColor: "white !important",
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
    "& .ant-table-expanded-row ant-table-expanded-row-level-1 > ant-table-cell":
      {
        paddding: "0px !important",
      },
    // "& .ant-table-row.ant-table-row-level-1": {
    //   backgroundColor: "rgba(169,169,169, 0.1)",
    // },
    // "& .ant-table-thead .ant-table-cell": {
    //   backgroundColor: "rgb(239, 239, 239) !important",
    //   color: "black",
    // },
  },
}));

export default useStyles;
