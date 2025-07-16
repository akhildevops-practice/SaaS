import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles<Theme>((theme: Theme) => ({
  // ".highlighted-row" : {
  //   backgroundColor: "yellow !important"
  // },
  disabledInput: {
    "& .ant-input[disabled]": {
      // border: "none",
      backgroundColor: "white !important",
      color: "black",
    },
  },

  searchIcon: {
    "& .ant-btn": {
      height: "23px",
      padding: "2px 12px",
    },
  },

  disabledSelect: {
    "& .ant-select-disabled .ant-select-selector": {
      backgroundColor: "white !important",
      background: "white !important",
      color: "black",
      border: "none",
    },
    "& .ant-select-disabled .ant-select-selection-item": {
      color: "black",
    },
    "& .ant-select-disabled .ant-select-arrow": {
      display: "none",
    },
  },

  disabledMultiSelect: {
    "& .ant-select-disabled.ant-select-multiple .ant-select-selector": {
      backgroundColor: "#F5F5F5 !important",
      // border: "none",
    },
    "& .ant-select-disabled.ant-select-multiple .ant-select-selection-item": {
      color: "black",
      background: "#F5F5F5 !important",
    },
    "& .ant-select-disabled .ant-select-arrow": {
      display: "none",
    },
  },

  // customDisabledSelect: {
  //   "&.ant-select-disabled .ant-select-selector": {
  //     color: "black !important",
  //     opacity: '1 !important',
  //     backgroundColor: "#f5f5f5 !important", // Or any other background color you prefer
  //   },
  // },
  customDisabledSelect: {
    "&.ant-select-disabled": {
      "& .ant-select-selector": {
        color: "black !important",
        opacity: "1 !important",
        backgroundColor: "#f5f5f5 !important", // Or any other background color you prefer
      },
      "& .ant-select-selection-item": {
        color: "black !important",
      },
      "& .ant-select-selection-placeholder": {
        color: "black !important",
      },
    },
  },
  modalBox: {
    "& .ant-modal-header": {
      textAlign: "center",
    },
  },
  hazardSelectStyle: {
    width: "100%",
    minWidth: "180px",
    maxWidth: "250px", // Set a maximum width
    overflow: "hidden", // Hide overflow
    textOverflow: "ellipsis", // Show ellipsis for overflow
    whiteSpace: "nowrap", // No wrapping of text to a new line
  },
  tableContainer: {
    height : "100%",
    marginRight: "10px",
    "& .ant-table-container": {
    
      // overflowX: "auto",
      // [theme.breakpoints.down("md")]: {
      // "& .ant-table-container": {
      overflowX: "auto", // Ensure scrolling is available on small screens
      // Add any additional styles needed for small screens
      // },
      // },
      // overflowY: "auto",
      // // minHeight: "25vh", // Adjust the max-height value as needed
      // maxHeight: "25vh", // Adjust the max-height value as needed
      // "@media (min-width: 1370px)": {
      //   maxHeight: "40vh", // Adjust the max-height value as needed for screens 1250px and above
      // },
      "& span.ant-table-column-sorter-inner": {
        color: "#380036",
        // color: ({ iconColor }) => iconColor,
      },
      "&::-webkit-scrollbar": {
        width: "5px",
        height: "10px", // Adjust the height value as needed
        backgroundColor: "white",
      },
      "&::-webkit-scrollbar-thumb": {
        borderRadius: "10px",
        backgroundColor: "grey",
      },
    },
    "& .ant-table-wrapper .ant-table-container": {
    maxHeight: "55vh", // Fixed height for the table
    overflowY: "auto", // Enable vertical scrolling
    },
    "& .ant-table-body": {
    maxHeight: "30vh", // Fixed height for the table body
    overflowY: "auto", // Ensure vertical scrolling
    "&::-webkit-scrollbar": {
      width: "8px",
      backgroundColor: "#e5e4e2",
    },
    "&::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "grey",
    },
  },
    "& .ant-table-wrapper .ant-table-thead>tr>th": {
      // position: "sticky", // Add these two properties
      // top: 0, // Add these two properties
      // zIndex: 2,
      // padding: "12px 16px",
      fontWeight: 600,
      fontSize: "14px",
      // padding: "6px 8px !important",
      // fontFamily: "Poppins !important",
      // lineHeight: "24px",

      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      position: "sticky",
      top: 0,
      zIndex: 10,
      padding: "6px 8px !important",
      lineHeight: "24px",
    },
    "& .ant-table-wrapper .ant-table-thead > tr > th:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before, .ant-table-wrapper .ant-table-thead > tr > td:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before":
      {
        // backgroundColor: ({ tableColor }) => tableColor,
        backgroundColor: "#e9e9e9",
      },

    "& tr.ant-table-row": {
      borderRadius: 5,
      // cursor: "pointer",
      // transition: "all 0.1s linear",

      "&:hover": {
        // backgroundColor: "white !important",
        // boxShadow: "0 1px 5px 0px #0003",
        // transform: "scale(1.01)",

        "& td.ant-table-cell": {
          backgroundColor: "white !important",
        },
      },
    },

    "& .ant-table-fixed-right, .ant-table-fixed-left": {
      overflow: "hidden !important", // Hide the overflow in fixed columns
    },

    // Add this to ensure the fixed column cell doesn't overlap the sticky header
    "& .ant-table-fixed-right .ant-table-cell, .ant-table-fixed-left .ant-table-cell":
      {
        borderTop: "1px solid #f0f0f0", // Same color as your table borders
      },

    "& .ant-table-tbody >tr >td": {
      // borderBottom : "black",
      borderInlineEnd: "none",
      verticalAlign: "top !important",
      padding : "2px 4px !important",
      borderBottom: `1px solid #f0f0f0`, // Customize the border-bottom color here
    },
    "& .ant-table-row.ant-table-row-level-1": {
      backgroundColor: "rgba(169,169,169, 0.1)",
    },
    "& .ant-table-thead .ant-table-cell": {
      // backgroundColor: ({ headerBgColor }) => headerBgColor,
      // color: ({ tableColor }) => tableColor,
      backgroundColor: "#E8F3F9",
      // fontFamily: "Poppins !important",
      color: "#00224E",
    },

    [theme.breakpoints.down("xs")]: {
      "& .ant-table-row:first-child": {
        width: "100%",
      },
    },
  },
  allHiraTableContainer: {
    "& .ant-table-container": {
      // overflowX: "auto",
      // [theme.breakpoints.down("md")]: {
      // "& .ant-table-container": {
      overflowX: "auto", // Ensure scrolling is available on small screens
      // Add any additional styles needed for small screens
      // },
      // },
      // overflowY: "auto",
      // // minHeight: "25vh", // Adjust the max-height value as needed
      // maxHeight: "25vh", // Adjust the max-height value as needed
      // "@media (min-width: 1370px)": {
      //   maxHeight: "40vh", // Adjust the max-height value as needed for screens 1250px and above
      // },
      "& span.ant-table-column-sorter-inner": {
        color: "#380036",
        // color: ({ iconColor }) => iconColor,
      },
      "&::-webkit-scrollbar": {
        width: "5px",
        height: "10px", // Adjust the height value as needed
        backgroundColor: "white",
      },
      "&::-webkit-scrollbar-thumb": {
        borderRadius: "10px",
        backgroundColor: "grey",
      },
    },
    "& .ant-table-wrapper .ant-table-thead>tr>th": {
      // position: "sticky", // Add these two properties
      // top: 0, // Add these two properties
      // zIndex: 2,
      // padding: "12px 16px",
      fontWeight: 600,
      fontSize: "14px",
      // padding: "6px 8px !important",
      // fontFamily: "Poppins !important",
      // lineHeight: "24px",

      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      position: "sticky",
      top: 0,
      zIndex: 10,
      padding: "6px 8px !important",
      lineHeight: "24px",
    },
    "& .ant-table-wrapper .ant-table-thead > tr > th:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before, .ant-table-wrapper .ant-table-thead > tr > td:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before":
      {
        // backgroundColor: ({ tableColor }) => tableColor,
        backgroundColor: "#e9e9e9",
      },

    "& tr.ant-table-row": {
      borderRadius: 5,
      // cursor: "pointer",
      // transition: "all 0.1s linear",

      "&:hover": {
        // backgroundColor: "white !important",
        // boxShadow: "0 1px 5px 0px #0003",
        // transform: "scale(1.01)",

        "& td.ant-table-cell": {
          backgroundColor: "white !important",
        },
      },
    },

    "& .ant-table-fixed-right, .ant-table-fixed-left": {
      overflow: "hidden !important", // Hide the overflow in fixed columns
    },

    // Add this to ensure the fixed column cell doesn't overlap the sticky header
    "& .ant-table-fixed-right .ant-table-cell, .ant-table-fixed-left .ant-table-cell":
      {
        borderTop: "1px solid #f0f0f0", // Same color as your table borders
      },

    "& .ant-table-tbody >tr >td": {
      // borderBottom : "black",
      borderInlineEnd: "none",
      verticalAlign: "top !important",
      padding: "4px 6px !important", 
      borderBottom: `1px solid #f0f0f0`, // Customize the border-bottom color here
      wordWrap: "break-word", // Allow headers to wrap text if necessary
    },
    "& .ant-table-row.ant-table-row-level-1": {
      backgroundColor: "rgba(169,169,169, 0.1)",
    },
    "& .ant-table-thead .ant-table-cell": {
      // backgroundColor: ({ headerBgColor }) => headerBgColor,
      // color: ({ tableColor }) => tableColor,
      backgroundColor: "#E8F3F9",
      // fontFamily: "Poppins !important",
      color: "#00224E",
      wordWrap: "break-word", // Allow headers to wrap text if necessary
    },

    [theme.breakpoints.down("xs")]: {
      "& .ant-table-row:first-child": {
        width: "100%",
      },
    },
  },
  
  pagination: {
    position: "relative", // Changed from fixed to relative
    marginTop: "20px", // Added margin-top to create space between the table and pagination
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "inherit",
    padding: theme.spacing(1),
  },
  
  labelStyle: {
    "& .ant-input-lg": {
      border: "1px solid #dadada",
    },
    "& .ant-form-item .ant-form-item-label > label": {
      color: "#003566",
      fontWeight: "bold",
      letterSpacing: "0.8px",
      // Add any other styles you want to apply to the <label> element
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

  descriptionItemStyle: {
    "& .ant-descriptions-item-label": {
      color: "#003566 !important",
      fontWeight: "bold",
      letterSpacing: "0.8px",
      // Add any other styles you want to apply to the label inside Descriptions.Item
    },
  },

  riskTable: {
    maxHeight: "60vh", // Adjust the max-height value as needed
    overflowY: "auto",
    // overflowX: "auto",
    // "&::-webkit-scrollbar": {
    //   width: "5px",
    //   height: "10px", // Adjust the height value as needed
    //   backgroundColor: "white",
    // },
    // "&::-webkit-scrollbar-thumb": {
    //   borderRadius: "10px",
    //   backgroundColor: "grey",
    // },
    // "& .ant-table-tbody": {
    //   maxHeight: "150px", // Adjust the max-height value as needed
    //   overflowY: "auto",
    // },
  },
  expandIcon: {
    float: "left",
  },
  collapseIcon: {
    float: "left",
  },
  visibilityModal: {
    "& .ant-modal .ant-modal-content": {
      padding: "7px 20px",
    },
  },
  //below for exported report
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableCell: {
    border: "1px solid black",
    padding: "10px",
    textAlign: "left",
    wordWrap: "break-word",
  },
  headerRow: {
    backgroundColor: "yellow",
    color: "black",
    textAlign: "center",
    fontWeight: "bold",
  },
  noBorder: {
    border: "none",
  },
  flexContainer: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
  },
  flexItem: {
    flex: 1,
    textAlign: "center", // If you want to center the text
  },
  NavDivider: {
    height: "1.4em",
    background: "gainsboro",
  },
  companyLogo: {
    display: "block",
    margin: "0 auto 10px", // Centers the image and adds space below
    width: "100px", // Adjust the width as necessary
  },
  homePageTagStyle: {
    width: "108px",
    height: "31px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    justifyItems: "center",
    fontSize: "medium",
    cursor: "default",
  },
  historyIcon: {
    // fill: "#0E497A",
    width: "30px",
    height: "30px",
    cursor: "pointer",
    // marginRight: "27px",
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
  docNavText: {
    fontSize: "16px",
    fontWeight : 600,
    letterSpacing : "0.6px",
    // letterSpacing: "0.3px",
    // lineHeight: "24px",
    // textTransform: "capitalize",
    // marginLeft: "5px",
  },
  docNavIconStyle: {
    // width: "23.88px",
    // height: "20px",
    width: "22px",
    height: "25px",
    // paddingRight: "6px",
    cursor: "pointer",
    // marginLeft: "4x",
  },
  formItem: {
    flexGrow: 1,
    minWidth: "200px", // Minimum width to ensure responsiveness
    maxWidth: "300px", // Maximum width to prevent overflow
  },
  ellipsisSelect: {
    '& .ant-select-selection-item': {
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    }
  },
  fetchButton: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#003566",
    color: "white",
    padding: "0 12px",
  },
  formRow: {
    display: "flex",
    flexDirection: "row",
    gap: "10px",
    alignItems: "center",
    flexWrap: "nowrap",
  }
}));

export default useStyles;
