import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
  table: {
    backgroundColor: "white",
    borderRadius: "9px",
    width: "100%",
    "& thead th": {
      padding: theme.spacing(2),
      backgroundColor: "#E8F3F9",
      color: "#00224E",
      fontFamily: "Poppins !important",
      zIndex: 0,
    },
  },
  card: {
    backgroundColor: "#fff",
    padding: "1px",
    borderRadius: "8px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    marginTop: "2px",
  },
  actionButtonTableCell: {
    display: "flex", // Ensures icons are in a row
    alignItems: "center", // Vertically center the icons
    justifyContent: "flex-end", // Align icons to the right
    gap: "6px", // Minimal spacing between icons
    textAlign: "right", // Align text/icons to the right
    height: theme.typography.pxToRem(40),
    borderBottom: "1px solid rgba(16, 7, 7, 0.1)",
    borderRight: "1px solid rgba(104, 104, 104, 0.1)",
    // width: "100px",
    // padding: "4px",
  },

  tableHeaderColor: {
    color: theme.palette.primary.main,
  },
  newTableContainer: {
    marginTop: "1%",
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
      padding: "4px 8px !important",
      fontFamily: "Poppins !important",
      color: "#00224E",
    },
    "& span.ant-table-column-sorter-inner": {
      color: "#00224E",
      // color: ({ iconColor }) => iconColor,
    },
    "& span.ant-tag": {
      display: "flex",
      width: "105px",
      padding: "5px 0px",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: "10px",
      color: "white",
      letterSpacing: "0.5px",
    },
    // "& .ant-table-wrapper .ant-table-thead>tr>th": {
    //   position: "sticky", // Add these two properties
    //   top: 0, // Add these two properties
    //   zIndex: 2,
    //   // padding: "12px 16px",
    //   fontWeight: 600,
    //   fontSize: "14px",
    //   padding: "4px 10px !important",
    //   // fontFamily: "Poppins !important",
    //   lineHeight: "24px",
    // },

    "& .ant-table-tbody >tr >td": {
      // borderBottom: ({ tableColor }) => `1px solid ${tableColor}`, // Customize the border-bottom color here
      backgroundColor: "white",
      borderBottom: "1px solid #f0f0f0",
      padding: "4px 8px !important",
    },

    "& .ant-table-wrapper .ant-table-container": {
      maxHeight: "420px",
      overflowY: "auto",
      overflowX: "auto",
    },
    "& .ant-table-body": {
      maxHeight: "150px", // Adjust the max-height value as needed
      overflowY: "auto",
      // overflowX: "scroll",
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
    "& .ant-table-wrapper .ant-table-content  .ant-table-thead>tr>th": {
      padding: "4px 10px !important",
    },
  },

  tableHead: {
    backgroundColor: "#E8F3F9",
  },
  tableHeaderCell: {
    color: "#00224E",
    backgroundColor: "#E8F3F9",
    padding: "4px 8px !important",
    fontFamily: "Poppins !important",
  },

  tableCell: {
    fontSize: theme.typography.pxToRem(12),
    paddingTop: theme.spacing(0.1),
    paddingBottom: theme.spacing(0.1),
    paddingLeft: theme.spacing(2), //removing for testing
    paddingRight: theme.spacing(2), //removing for testing
    height: theme.typography.pxToRem(2),
    borderBottom: "1px solid rgba(104, 104, 104, 0.1);",
    borderRight: "1px solid rgba(104, 104, 104, 0.1);",
    wordWrap: "break-word",
    maxWidth: "200px",
  },
  tableCellWithoutAction: {
    fontSize: theme.typography.pxToRem(12),
    height: theme.typography.pxToRem(10),
    borderBottom: "1px solid rgba(104, 104, 104, 0.1);",
    borderRight: "1px solid rgba(104, 104, 104, 0.1);",
  },
  root: {
    padding: 0,
  },
  editField: {
    fontSize: theme.typography.pxToRem(16),
    width: "100%",
    borderBottom: "0.5px solid black",
  },
  addField: {
    width: "100%",
    borderRadius: "6px",
    fontSize: theme.typography.pxToRem(12),
  },
  addFieldButton: {
    display: "flex",
    margin: "auto",
    maxWidth: "100px",
  },
  buttonCell: {
    fontSize: theme.typography.pxToRem(12),
    paddingTop: theme.spacing(0.1),
    paddingBottom: theme.spacing(0.1),
    paddingLeft: theme.spacing(2), //removing for testing
    paddingRight: theme.spacing(2), //removing for testing
    height: theme.typography.pxToRem(2),
    borderBottom: "1px solid rgba(104, 104, 104, 0.1);",
    borderRight: "1px solid rgba(104, 104, 104, 0.1);",
  },
}));
