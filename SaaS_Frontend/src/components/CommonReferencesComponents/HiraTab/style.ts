import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles<Theme>((theme: Theme) => ({
  tableContainer: {
    "& .ant-table-wrapper .ant-table.ant-table-bordered > .ant-table-container > .ant-table-summary > table > tfoot > tr > td":
      {
        borderInlineEnd: "none",
      },
    "& .ant-table-thead .ant-table-cell": {
      backgroundColor: "#E8F3F9",
      color: "#00224E",
    },

    "& .ant-table-wrapper .ant-table-thead>tr>th": {
      position: "sticky", // Add these two properties
      top: 0, // Add these two properties
      zIndex: 2,
      fontWeight: 600,
      fontSize: "15px",
      padding: "6px 8px !important",
      lineHeight: "24px",
    },
    "& .ant-table-tbody >tr >td": {
      borderBottom: "black",
      padding: "4px 8px !important",
    },
    "& .ant-table-wrapper .ant-table-container": {
      maxHeight: "200px", // Adjust the max-height value as needed
      overflowY: "auto",
      overflowX: "hidden",
    },
    "& .ant-table-body": {
      maxHeight: "200px", // Adjust the max-height value as needed
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
        transform: "scale(1.01)",

        "& td.ant-table-cell": {
          backgroundColor: "white !important",
        },
      },
    },
    "& .ant-table-wrapper .ant-table-filter-trigger":{
      fontSize : "16px !important"
    },
  },
  card: {
    maxWidth: 350,
    borderRadius: 10,
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
    fontSize:"14px"
  },
  CardHeader: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#E0ECFF",
    // padding: theme.spacing(2),
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  content: {
    padding: theme.spacing(2),
  },
  label: {
    fontWeight: 600,
    display: "inline-block",
    minWidth: "120px",
    fontSize:"14px"
  },
  row: {
    display: "flex",
    alignItems: "flex-start",
    marginBottom: theme.spacing(1),
    alignContent:"center"
  },
  pagination: {
    // float : "right",
    position: "relative", // Changed from fixed to relative
    marginTop: "12px", // Added margin-top to create space between the table and pagination
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "inherit",
    padding: theme.spacing(1),
  },
}));

export default useStyles;
