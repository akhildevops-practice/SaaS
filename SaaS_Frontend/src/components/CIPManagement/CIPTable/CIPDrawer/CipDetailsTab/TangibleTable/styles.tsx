import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
  table: {
    backgroundColor: "#FFFFFF",
    borderRadius: "9px",
    width: "100%",
    "& thead th": {
      padding: theme.spacing(2),
      backgroundColor: "#F7F7FF",
      color: theme.palette.primary.main,
      zIndex: 0,
    },
  },
  actionButtonTableCell: {
    fontSize: theme.typography.pxToRem(12),
    textAlign: "center",
    paddingTop: theme.spacing(0.1),
    paddingBottom: theme.spacing(0.1),
    height: theme.typography.pxToRem(2),
    borderBottom: "1px solid rgba(104, 104, 104, 0.1);",
    borderRight: "1px solid rgba(104, 104, 104, 0.1);",
    wordWrap: "break-word",
    maxWidth: "200px",
  },
  tableHeaderColor: {
    color: theme.palette.primary.main,
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
    fontSize: theme.typography.pxToRem(12),
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
  tableContainer: {
    marginTop: "1%",
    maxHeight: "calc(70vh - 14vh)", // Adjust the max-height value as needed
    overflowY: "auto",
    overflowX: "hidden",
    // fontFamily: "Poppins !important",
    "& .ant-table-wrapper .ant-table.ant-table-bordered > .ant-table-container > .ant-table-summary > table > tfoot > tr > td":
      {
        borderInlineEnd: "none",
      },
    "& .ant-table-thead .ant-table-cell": {
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
  documentTable: {
    "&::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "grey",
    },
  },
  firDivContainer:{
    display:"flex", 
    gap:"10px", 
    width:"800px" 
  },
  secondDivContainer:{
    display:"grid", 
    gap:"10px", 
    width:"400px"
  }
}));
