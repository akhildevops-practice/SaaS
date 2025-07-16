import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  heading: {
    fontSize: "18px",
    fontWeight: 600,
  },
  headerInput: {
    height: "45px",
    "&.ant-input[disabled]": {
      backgroundColor: "#EFF8FF !important",
      color: "black ",
      WebkitTextFillColor: "black !important", // for Chrome/Safari
      opacity: "1 !important",
      fontWeight: "bold",
    },
  },
  tableHeaderInput: {
    "&.ant-input[disabled]": {
      backgroundColor: " #eff8ff !important",
      color: "black !important",
      WebkitTextFillColor: "#036 !important", // for Chrome/Safari
      opacity: "1 !important",
      border: "1px solid #eff8ff",
      fontWeight: "bold !important",
    },
  },
  worflowStageSelect: {
    "&.ant-select-disabled .ant-select-selector": {
      border: "none !important",
      backgroundColor: "transparent !important",
      boxShadow: "none !important",
    },
    "& .ant-select-arrow": {
      display: "none !important",
    },
    "& .ant-select-selection-item": {
      backgroundColor: "transparent !important",
      fontSize: "14px !important",
      fontWeight: "bold !important",
      border: "none !important",
      padding: "2px 0px 0px 3px",
    },
    "& .ant-select-selection-item-content": {
      color: "#003566 !important",
      fontWeight: "bold !important",
    },
  },
  descriptionLabelStyle: {
    "& .ant-descriptions-item-label": {
      color: "#003566 !important",
      fontWeight: "bold",
      letterSpacing: "0.8px",
      // Add any other styles you want to apply to the label inside Descriptions.Item
    },
    "& .ant-form-item .ant-form-item-label > label": {
      color: "#003566",
      fontWeight: "bold",
      letterSpacing: "0.8px",
      // Add any other styles you want to apply to the label inside Form.Item
    },
    "& .ant-input-lg": {
      border: "1px solid #dadada",
    },
  },
  tableContainer: {
    // "&.ant-table-cell": {
    //   maxWidth: "200px",
    // },
    // width: "1000px",
    margin: "auto",
    marginTop: "1%",
    // maxHeight: "calc(80vh - 14vh)", // Adjust the max-height value as needed
    overflowY: "auto",
    overflowX: "hidden",
    paddingRight: "10px",
    // fontFamily: "Poppins !important",
    "& .ant-table-wrapper .ant-table.ant-table-bordered > .ant-table-container > .ant-table-summary > table > tfoot > tr > td":
      {
        borderInlineEnd: "none",
      },
    "& .ant-table-thead .ant-table-cell": {
      // textAlign: "center",
      backgroundColor: "white",
      // fontFamily: "Poppins !important",
      color: "black",
    },
    "& span.ant-table-column-sorter-inner": {
      color: "black",
      // color: ({ iconColor }) => iconColor,
    },
    "& span.ant-tag": {
      display: "flex",
      width: "89px",
      padding: "5px 0px",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: "10px",
      color: "black",
    },
    "& .ant-table-wrapper .ant-table-thead>tr>th": {
      position: "sticky", // Add these two properties
      top: 0, // Add these two properties
      zIndex: 2,
      // padding: "12px 16px",
      fontWeight: 600,
      fontSize: "14px",
      padding: "6px 2px !important",
      // fontFamily: "Poppins !important",
      lineHeight: "24px",
    },
    "& .ant-table-tbody >tr >td": {
      maxWidth: "200px",
      // borderBottom: ({ tableColor }) => `1px solid ${tableColor}`, // Customize the border-bottom color here
      // borderBottom: "1px solid #cccccc",
      padding: "5px 3px !important",
      // textAlign: "center",
    },

    "& .ant-table-body": {
      border: "1px solid #cccccc",
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
  table: {
    borderSpacing: 0,
    // border: "1px solid #ddd",
    "& th, & td": {
      position: "relative",
      transition: "background-color 0.2s",
      "&:hover": {
        backgroundColor: "#f0f0f0",
      },
      "&:last-child": {
        borderRight: "none",
      },
    },
  },
  cellCenter: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  clickableCell: {
    cursor: "pointer",
  },
  greyBackground: {
    backgroundColor: "grey",
  },
  tableRow: {
    "& td": {
      // minHeight: "60px",
    },
  },
  cellContent: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  dateInput: {
    border: "1px solid #bbb",
    paddingLeft: "5px",
    paddingRight: "5px",
    borderRadius: "5px",
    "& .MuiInput-underline:before": {
      borderBottom: "none", // Remove the bottom border
    },
    "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
      borderBottom: "none", // Remove the hover border
    },
    "& .MuiInput-underline:after": {
      borderBottom: "none", // Remove the focus border
    },
  },
  root: {
    "&.MuiAccordionDetails-root": {
      padding: "8px 16px 16px",
      // display:"flex"
    },
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
  summaryRoot: {
    display: "flex",
    padding: "0px 16px",
    minHeight: 30,

    fontSize: "17px",
    "& .MuiAccordionSummary-content": {
      margin: 0,
    },
    "&.MuiAccordionSummary-content .Mui-expanded": {
      margin: "5px 0px",
      minHeight: "10px",
    },
    "&.MuiButtonBase-root .MuiAccordionSummary-root .Mui-expanded": {
      minHeight: "10px",
    },
    "&.MuiAccordionSummary-root": {
      minHeight: "30px",
      backgroundColor: "#eff8ff",
    },
  },
  headingRoot: {
    minHeight: 30,
    "&.MuiAccordionSummary-content .Mui-expanded": {
      margin: "10px 0px",
      minHeight: "30px",
    },
    "&.MuiAccordionSummary-root.Mui-expanded": {
      minHeight: "30px",
      margin: "10px 0px",
    },
    "&.MuiAccordionDetails-root": {
      padding: "8px 16px 16px",
      // display:"flex"
      display: "block",
    },
  },
  selectEmpty: {
    padding: "0px",
    "& .MuiSelect-root MuiSelect-select MuiSelect-selectMenu MuiInputBase-input MuiInput-input":
      {
        padding: "0px",
      },
  },
}));

export default useStyles;
