import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles<Theme>((theme: Theme) => ({
  modalWrapper: {
    "& .ant-modal-root": {
      overflow: "hidden !important",
    },
  },
  header: {
    display: "flex",
    alignItems: "center",
    marginTop: "2px",
  },
  moduleHeader: {
    color: "#000",
    fontSize: "18px",
    textTransform: "capitalize",
    // fontFamily: "Poppins, sans-serif",
    lineHeight: "24px",
    paddingLeft: "6px",
  },
  tableContainer: {
    // fontFamily: "Poppins !important",
    "& .ant-table-wrapper .ant-table.ant-table-bordered > .ant-table-container > .ant-table-summary > table > tfoot > tr > td":
      {
        borderInlineEnd: "none",
      },
    // overflowY: "hidden",
    // overflowX: "hidden !important",
    "& .ant-table-thead .ant-table-cell": {
      // backgroundColor: ({ headerBgColor }) => headerBgColor,
      // color: ({ tableColor }) => tableColor,
      backgroundColor: "#E8F3F9",
      // fontFamily: "Poppins !important",
      color: "#00224E",
    },
    "& span.ant-table-column-sorter-inner": {
      color: "#00224E",
      // color: ({ iconColor }) => iconColor,
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
    "& .ant-table-wrapper .ant-table-thead>tr>th": {
      position: "sticky", // Add these two properties
      top: 0, // Add these two properties
      zIndex: 2,
      // padding: "12px 16px",
      fontWeight: 600,
      fontSize: "14px",
      padding: "6px 8px !important",
      // fontFamily: "Poppins !important",
      lineHeight: "24px",
    },
    "& .ant-table-tbody >tr >td": {
      // borderBottom: ({ tableColor }) => `1px solid ${tableColor}`, // Customize the border-bottom color here
      borderBottom: "black",
      padding: "4px 8px !important",
    },
    "& .ant-table-wrapper .ant-table-container": {
      maxHeight: "400px", // Adjust the max-height value as needed
      overflowY: "auto",
      overflowX: "hidden",
    },
    "& .ant-table-body": {
      maxHeight: "400px", // Adjust the max-height value as needed
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
  },
  searchContainer: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #ddd",
    borderRadius: "25px",
    padding: "2px 4px",
    width: "230px",
  },
  input: {
    flex: 1,
    "& .MuiOutlinedInput-notchedOutline": {
      border: "none",
    },
    "& .MuiOutlinedInput-inputMarginDense":{
      paddingTop:"5.5px",
      paddingBottom:"5.5px"
    }
  },
  iconButton: {
    padding: 6,
  },
  card: {
    borderRadius: 8,
    overflow: "hidden",
    border: "1px solid #ddd",
    "&.MuiCardContent-root":{
      padding: "8px"
  },
  "&.makeStyles-content-200":{
   padding: "0px"
  }
  },
  cardHeader: {
    backgroundColor: "#a7c4e0", // Light blue shade
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "6px",
  },
  title: {
    fontWeight: 600,
    fontSize: "14px",
    color: "#000",
  },
  deleteIcon: {
    color: "#e53935", // Red color
  },
  content: {
    padding: "8px", // Default padding
    "&:last-child": {
      paddingBottom: "8px", // Override last-child default behavior
    },
  },
  row: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(1),
  },
  label: {
    fontWeight: 600,
    marginRight: theme.spacing(1),
  },
  chip: {
    backgroundColor: "#f0f0f0",
    padding: "4px 8px",
    borderRadius: 4,
    fontSize: "12px",
    fontWeight: 500,
  },
}));

export default useStyles;
