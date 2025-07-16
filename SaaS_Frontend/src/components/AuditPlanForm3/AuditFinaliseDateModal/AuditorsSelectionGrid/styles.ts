import {
  createStyles,
  makeStyles,
  Theme,
} from "@material-ui/core/styles";

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",

    },
    pagination: {
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
      backgroundColor: "inherit",
      padding: theme.spacing(1),
    },
    iconButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    inputBox: {
      display: "flex",
      alignItems: "center",
      marginTop: "auto",
      padding: theme.spacing(2),
    },
    input: {
      flexGrow: 1,
      marginRight: theme.spacing(2),
    },
    smallColumn: {
      width: '100px', // Adjust this value as needed
    },
    actionColumn: {
      width: '50px', // Adjust this value as needed
    },
    labelContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
    },
    tableLabel: {
      fontSize: theme.typography.pxToRem(20),
      fontWeight: 600,
      marginBottom: theme.spacing(2),
      color: "#003566 !important",
      textAlign: 'left',
    },
    topText: {
      margin: theme.typography.pxToRem(10),
      marginBottom: theme.typography.pxToRem(20),
    },
    tableHeader: {
      "& .MuiTableCell-head": {
        padding: "4px 8px 3px 10px",
        whiteSpace: "nowrap",
        backgroundColor: "#E8F3F9 !important", // Set your desired background color
        color: "#003566 !important",
        textAlign: "left",
      },
    },
    buttonColor: {
      marginRight: 16,
      paddingLeft: 12,
      paddingRight: 12,
      fontSize: theme.typography.pxToRem(13),
      backgroundColor: theme.textColor.white,
      borderRadius: theme.typography.pxToRem(5),
      borderColor: theme.palette.primary.light,
      color: theme.palette.primary.light,
      [theme.breakpoints.up("sm")]: {
        paddingLeft: 18,
        paddingRight: 18,
        fontSize: theme.typography.pxToRem(13),
      },
      "&:hover": {
        backgroundColor: theme.palette.primary.light,
        color: theme.textColor.white,
      },
    },
    label: {
      fontSize: theme.typography.pxToRem(14),
      fontWeight: 600,
    },
    auditYear: {
      marginLeft: theme.typography.pxToRem(7),
    },
    paper: {
      width: "100%",
      borderRadius: 7,
      overflow: "hidden",
      marginBottom: theme.spacing(2),
      boxShadow: "0px 0px 10px rgba(0,0,0,0.2)", // Box shadow for the table
      marginRight : "10px",
    },
    table: {
      minWidth: 750,
      border: "1px solid #e0e0e0", // Border for the table
      borderRadius: 7, // Rounded corners for the table
      "& .MuiTableCell-body": {
        textAlign: "left", // Left-aligned columns
      },
    },
    visuallyHidden: {
      border: 0,
      clip: "rect(0 0 0 0)",
      height: 1,
      margin: -1,
      overflow: "hidden",
      padding: 0,
      position: "absolute",
      top: 20,
      width: 1,
    },
    formTextPadding: {
      paddingBottom: theme.typography.pxToRem(10),
      fontSize: theme.typography.pxToRem(14),
      color: "#003566",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      marginBottom: "10px", 
    },
    formBox: {
      width: "60%",
      paddingBottom: theme.typography.pxToRem(25),
    },
    dateInput: {
      marginLeft: theme.spacing(1.1),
      marginRight: theme.spacing(1.1),
      fontFamily: theme.typography.fontFamily,
      padding: theme.typography.pxToRem(10),
      border: "1px solid #bbb",
      borderRadius: 8,
      outline: "none",

      "&:hover": {
        border: "1px solid black",
      },

      "&:focus": {
        border: `2px solid ${theme.palette.primary.main}`,
      },
    },
    auditorsResultTableContainer: {
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
    
  })
);
