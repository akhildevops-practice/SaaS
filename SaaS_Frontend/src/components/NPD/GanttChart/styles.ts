import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  pagination: {
    // position: "fixed",
    // bottom: "3px",
    right: "0",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "inherit",
    padding: theme.spacing(1),
  },
  descriptionLabelStyle : {
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
      backgroundColor:"#F1F8E9",
      // Add any other styles you want to apply to the label inside Form.Item
    },
    "& .ant-input-lg": {
      border: "1px solid #dadada",
    },
    "&.ant-descriptions .ant-descriptions-view" :{
      width: "100%",
      borderTopLeftRadius:"0px",
      borderTopRightRadius:"0px",
      borderBottomRightRadius:"0px",
      borderBottomLeftRadius:"0px",
      /* border-radius: 8px; */
  }
  },
  tableContainer: {
    // marginTop: "1%",
    maxHeight: "calc(70vh - 14vh)", // Adjust the max-height value as needed
    overflowY: "auto",
    overflowX: "hidden",
    "&.MuiPaper-root .MuiTableContainer-root .MuiPaper-outlined .MuiPaper-rounded":{
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
    "& .ant-table-wrapper .ant-table.ant-table-bordered > .ant-table-container > .ant-table-summary > table > tfoot > tr > td": {
        borderInlineEnd: "none",
    },
    "& .ant-table-thead .ant-table-cell": {
        backgroundColor: "#E8F3F9",
        color: "#00224E",
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
    },
    "& .ant-table-tbody > tr > td": {
        borderBottom: "black",
        padding: "0px 8px !important",
    },
    "& tr.ant-table-row": {
        cursor: "pointer",
        transition: "all 0.1s linear",
    },
},
  filename: {
    fontSize: theme.typography.pxToRem(12),
    color: theme.palette.primary.light,
    textOverflow: "ellipsis",
    overflow: "hidden",
    width: "100%",
    height: "10px",
    whiteSpace: "nowrap",
  },
  uploadSection: {
    // height: "40px",
    "& .ant-upload-list-item-name": {
      color: "blue !important",
    },
    "&.ant-upload-wrapper .ant-upload-drag .ant-upload": {
      padding: "0px 0px",
    },
  },
  buttonContainerActive: {
    backgroundColor: "#00224E",
    color: "#ffff",
    borderRadius:"6px 6px 0px 0px"
  },
  buttonContainer: {
   backgroundColor:"#fff",
   color: "#00224E",
   borderRadius:"6px 6px 0px 0px"
  },
}));

export default useStyles;
