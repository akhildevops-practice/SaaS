import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    "& .MuiInput-underline:before": {
      borderBottom: "none", // Remove the bottom border
    },
    "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
      borderBottom: "none", // Remove the hover border
    },
    "& .MuiInput-underline:after": {
      borderBottom: "none", // Remove the focus border
    },
    "&.ant-select-single.ant-select-show-arrow .ant-select-selection-item": {
      color: "black",
    },
    "&.css-19qh8xo-MuiInputBase-input-MuiOutlinedInput-input.Mui-disabled": {
      opacity: "1",
      color: "black",
    },
  },

  subTableContainer: {
    margin: "10px 0px",
    "& span.ant-table-column-sorter-inner": {
      color: "#380036",
      backgroundColor: "white !important",
    },
  },
  tableContainer: {
    marginTop: "1%",
    // maxHeight: "calc(70vh - 14vh)", // Adjust the max-height value as needed
    overflowY: "auto",
    overflowX: "hidden",
    "&.MuiPaper-root .MuiTableContainer-root .MuiPaper-outlined .MuiPaper-rounded":
      {
        "& .ant-table-body::-webkit-scrollbar": {
          width: "5px",
          height: "5px",
          backgroundColor: "#e5e4e2",
        },
      },
    "& .ant-table-body::-webkit-scrollbar": {
      width: "5px",
      height: "5px",
      backgroundColor: "#e5e4e2",
    },
    "& .ant-table-body::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "grey",
    },
    "& .ant-table-wrapper .ant-table.ant-table-bordered > .ant-table-container > .ant-table-summary > table > tfoot > tr > td":
      {
        borderInlineEnd: "none",
      },
    "& .ant-table-thead .ant-table-cell": {
      backgroundColor: "#E8F3F9",
      color: "#00224E",
      borderBottom: "1px solid #00224E",
    },
    "& span.ant-table-column-sorter-inner": {
      color: "#00224E",
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
    "& .ant-table-wrapper .ant-table-thead > tr > th": {
      position: "sticky",
      top: 0,
      zIndex: 2,
      fontWeight: 600,
      fontSize: "14px",
      padding: "6px 8px !important",
      lineHeight: "24px",
      textAlign: "center",
    },
    "& .ant-table-tbody > tr > td": {
      borderBottom: "black",
      padding: "8px 8px !important",
      textAlign: "center",
    },
    "& tr.ant-table-row": {
      cursor: "pointer",
      transition: "all 0.1s linear",
    },
  },
  documentTable: {
    "&::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "grey",
    },
  },

  pagination: {
    // position: "fixed",
    bottom: "3px",
    right: "0",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "inherit",
    padding: theme.spacing(1),
  },
}));

export default useStyles;
