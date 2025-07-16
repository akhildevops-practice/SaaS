import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  tableContainer: {
    "& .ant-table-thead .ant-table-cell": {
      color: "black !important",
      padding: "5px 5px !important",
      textAlign: "center",
    },
    "& .ant-table-tbody tr.ant-table-row": {
      borderRadius: 5,
      cursor: "pointer",

      "& td.ant-table-cell": {
        padding: "5px 5px !important",
        textAlign: "center",
      },

      "&:hover td.ant-table-cell": {
        background: "none !important",
      },

      "&:hover": {
        background: "none !important",
      },
    },
  },
  criteriaType: {
    color: "blue",
  },
  score1: {
    background: "green",
  },
  score2: {
    backgroundColor: "yellow",
  },
  score3: {
    backgroundColor: "orange",
  },
  score4: {
    backgroundColor: "red",
  },
});

export default useStyles;
