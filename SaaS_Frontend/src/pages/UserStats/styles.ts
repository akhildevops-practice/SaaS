import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles<Theme>((theme: Theme) => ({
  pagination: {
    position: "fixed",
    bottom: "3px",
    right: "0",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "inherit",
    padding: theme.spacing(1),
  },
  tableContainer: {
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
}));

export default useStyles;
