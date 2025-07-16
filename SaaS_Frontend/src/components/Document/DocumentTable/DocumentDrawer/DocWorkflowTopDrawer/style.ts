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
}));

export default useStyles;
