import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  disabledInput: {
    "&.ant-input-disabled .ant-input[disabled]":{
      color: "black !important",
    },
    "&.ant-select-multiple .ant-select-selection-item-content ":{
      color: "black !important",
    },
    // "& .ant-input-disabled, & .ant-select-disabled, & .ant-select-disabled .ant-select-selector, & .ant-select-multiple.ant-select-lg .ant-select-selection-item-content, & .MuiInputBase-input.Mui-disabled":
    //   {
    //     color: "black !important",
    //   },
  },
muiAutoComplete:{
  "& input.Mui-disabled": {
    color: "black !important",
  },
  "& .MuiAutocomplete-input": {
    color: "black !important",
  },
  "& .MuiInputBase-input.Mui-disabled": {
    WebkitTextFillColor: "#000000",
  },
  '& .MuiInputBase-root.Mui-disabled': {
    backgroundColor: '#f0f0f0',
  },
},
  disabledSelect: {
    "& .ant-select-disabled .ant-select-selector": {
      backgroundColor: "#F5F5F5 !important",
      background: "#F5F5F5 !important",
      color: "black",
      // border: "none",
    },
    "& .ant-select-disabled .ant-select-selection-item": {
      color: "black",
    },
    "& .ant-select-disabled .ant-select-arrow": {
      display: "none",
    },
  },

  disabledMultiSelect: {
    "&.ant-select-multiple .ant-select-selection-item-content ":{
      color: "black !important",
    },
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
  fabButton: {
    fontSize: theme.typography.pxToRem(12),
    backgroundColor: theme.palette.primary.light,
    color: "#fff",
    margin: "0 5px",
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    },
  },
  loader: {
    display: "flex",
    justifyContent: "center",
  },
  imgContainer: {
    display: "flex",
    justifyContent: "center",
  },
  emptyDataText: {
    fontSize: theme.typography.pxToRem(14),
    color: theme.palette.primary.main,
  },
  documentTable: {
    "&::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "grey",
    },
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
    "&.ant-input[disabled]": {
      color: "black",
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
  locSearchBox: {
    width: "100%",
    [theme.breakpoints.down("sm")]: {
      marginTop: theme.typography.pxToRem(10),
    },
  },

  searchBoxText: {
    marginTop: theme.typography.pxToRem(10),
    fontSize: "16px",
    fontWeight: "normal",
  },
  topSectionLeft: {
    width: "60%",
    [theme.breakpoints.down("sm")]: {
      width: "60%",
    },
    display: "flex",
    alignItems: "center",
  },
  mrmtext: {
    fontSize: "17px",
    marginLeft: "8px",
    cursor: "pointer",
  },

  icon: {
    cursor: "pointer",
    fontSize: "20px",
  },
  root: {
    width: "100%",
    height: "100%",
    // maxHeight: 'calc(76vh - 2vh)', // Adjust the max-height value as needed
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
  input: {
    width: "100%",
  },
  resize: { fontSize: theme.typography.pxToRem(14) },
  iconButton: {
    paddingLeft: "1rem",
  },
  form: {
    padding: theme.typography.pxToRem(20),
    borderRadius: theme.typography.pxToRem(10),
    backgroundColor: "#FFFFFF",
    minHeight: "100%",
  },
  formTextPadding: {
    paddingBottom: theme.typography.pxToRem(10),
    fontSize: theme.typography.pxToRem(14),
    color: "#003566",
  },
  formBox: {
    minWidth: "90%",
    paddingBottom: theme.typography.pxToRem(25),
  },
  formControl: {
    minWidth: "100%",
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },

  formComment: {
    // fontFamily: theme.typography.fontFamily,
    fontSize: "14px",
    minWidth: "100%",
    minHeight: theme.typography.pxToRem(58),
    // marginTop: theme.typography.pxToRem(20),
    padding: theme.typography.pxToRem(10),
    border: "1px solid #bbb",
    borderRadius: 5,
    outline: "none",
  },

  labelStyle: {
    "& .ant-input-lg": {
      border: "1px solid #dadada",
    },
    "& .ant-form-item .ant-form-item-label > label": {
      color: "#003566",
      fontWeight: "bold",
      letterSpacing: "0.8px",
    },
  },
  asterisk: {
    color: "red",
    verticalAlign: "end",
  },
  label: {
    verticalAlign: "middle",
  },
  tableHeaderColor: {
    color: theme.palette.primary.main,
  },
  menuFont: {
    fontSize: "13px",
  },
  testLabel: {
    fontSize: "14px",
  },
  addFieldButton: {
    display: "flex",
    margin: "auto",
    maxWidth: "100px",
  },
  AddContentContainerCection: {
    display: "flex",
    justifyContent: "space-around",
  },
  editField: {
    fontSize: theme.typography.pxToRem(12),
    width: "95%",
    borderBottom: "0.5px solid black",
  },
  actionButtonTableCell: {
    // fontSize: theme.typography.pxToRem(12),
    // textAlign: "center",
    // paddingTop: theme.spacing(0.1),
    // paddingBottom: theme.spacing(0.1),
    // height: theme.typography.pxToRem(2),
    // borderBottom: "1px solid rgba(104, 104, 104, 0.1);",
    // borderRight: "1px solid rgba(104, 104, 104, 0.1);",
    // wordWrap: "break-word",
    maxWidth: "140px",
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  inputButton: {
    width: "100%",
  },
  tableHederValues: {
    width: "100%",
  },
  mainContainerDiv: {
    paddingTop: "10px",
  },
  ulContainer: {
    display: "flex",
    justifyContent: "center",
    fontWeight: "bolder",
    textAlign: "center",
    alignItems: "center",
    alignContent: "center",
    alignSelf: "center",
  },
  tableDataHeader: {
    height: "10px",
  },
  tablePositionRow: {
    display: "flex",
    justifyContent: "space-between",
    border: "1px solid #F4F6F6",
    backgroundColor: "#F8F9F9",
    position: "relative",
    width: "569px",
  },
  tablePositionCell: {
    color: "#1677ff",
    position: "absolute",
    right: "-60px",
    backgroundColor: "#F8F9F9",
  },
}));

export default useStyles;
