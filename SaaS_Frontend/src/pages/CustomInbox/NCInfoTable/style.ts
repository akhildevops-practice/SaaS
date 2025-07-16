import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  auditTrailTable: {
    "& .ant-table": {
      paddingLeft: "50px",
      width: "350px", // Set the width as per your requirement
      height: "100px",
      position: "relative",
      display: "flex", // Set the height as per your requirement
    },
    "& .ant-table-thead .ant-table-cell": {
      backgroundColor: "aliceblue",
      color: "#003566",
      padding: "5px 5px !important",
      textAlign: "left",
    },
    "& .ant-table-tbody tr.ant-table-row": {
      borderRadius: 5,
      cursor: "pointer",
    },
    "& td.ant-table-cell": {
      padding: "5px 5px !important",
      textAlign: "left",
    },
  },
}));

export default useStyles;
