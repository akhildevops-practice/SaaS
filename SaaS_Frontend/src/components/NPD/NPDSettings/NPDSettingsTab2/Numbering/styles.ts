import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  documentTable: {
    fontSize: "11px",
    "&::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "grey",
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
    // marginTop: "1%",
    // height:"fit-content",
    // maxHeight: "calc(80vh - 14vh)", // Adjust the max-height value as needed
    // overflowY: "hidden",
    // overflowX: "hidden",
    // fontFamily: "Poppins !important",
    "& .ant-table-wrapper .ant-table.ant-table-bordered > .ant-table-container > .ant-table-summary > table > tfoot > tr > td":
      {
        borderInlineEnd: "none",
      },
    "& .ant-table-thead .ant-table-cell": {
      textAlign: "center",
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
    // '& .ant-table-wrapper .ant-table-container': {
    //     maxHeight: '420px', // Adjust the max-height value as needed
    //     overflowY: 'auto',
    //     overflowX: 'hidden',
    // },
    "& .ant-table-body": {
      // maxHeight: '150px', // Adjust the max-height value as needed
      // overflowY: 'auto',
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
      cursor: "pointer",
      transition: "all 0.1s linear",
    },
  },
  iconAction: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    paddingLeft: "10px",
    paddingRight: "10px",
    cursor: "pointer",
    paddingBottom: "7px",
    width: "165px",
    fontSize: "12px",
  },
  DropDwonScroll: {
    maxHeight: "180px",
    overflowY: "scroll",
    borderRadius: "5px",
    boxShadow:
      "0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)",
    backgroundColor: "#ffffff",
  },
  tabsWrapper: {
    "& .ant-tabs-tab": {
      backgroundColor: "#e3e8f9 !important",
      color: "black !important",
    },
    "& .ant-tabs-tab-btn": {
      letterSpacing: "0.6px",
    },
    "& .ant-tabs-tab-active": {
      backgroundColor: "#003566 !important",
    },
    "& .ant-tabs-tab-active div": {
      color: "white !important",
      fontWeight: "500",
    },
  },
  autocomplete: {
    width: "250px",
    height: "45px",
    padding: "0px !important",
    "&.css-1xnbq41-MuiAutocomplete-root .MuiOutlinedInput-root": {
      padding: "3px !important",
    },
  },
  textField: {
    padding: "0px !important",
  },
  inputStye: {
    "&.ant-select-selector": {
      height: "32px",
      borderRadius: "5px",
    },
    "&.ant-select-single.ant-select-show-arrow .ant-select-selection-item": {
      color: "black",
    },
    "&.css-19qh8xo-MuiInputBase-input-MuiOutlinedInput-input.Mui-disabled": {
      opacity: "1",
      color: "black",
    },
  },
}));

export default useStyles;
