import { makeStyles } from "@material-ui/core/styles";

const useStyles: any = makeStyles((theme) => ({
  root: {
    width: "100%",
  },

  backButton: {
    backgroundColor: "#F1F8FD",
    color: "#0E497A",
    width: theme.typography.pxToRem(110),
    height: theme.typography.pxToRem(38),
    display: "flex",
    gap: "3px",
    alignItems: "center",
  },
  nextButton: {
    backgroundColor: "#0E497A",
    color: "#FFFFFF",
    width: theme.typography.pxToRem(87),
    height: theme.typography.pxToRem(38),
    marginLeft: theme.typography.pxToRem(10),
    minHeight: "32px",
    "&:hover": {
      backgroundColor: "#0E497A",
      color: "#FFFFFF",
    },
    display: "flex",
    gap: "5px",
    alignItems: "center",
    marginRight: "20px",
  },
  draftButton: {
    backgroundColor: "#0E497A",
    color: "#FFFFFF",
    // width: theme.typography.pxToRem(87),
    height: theme.typography.pxToRem(38),
    marginLeft: theme.typography.pxToRem(10),
    minHeight: "32px",
    "&:hover": {
      backgroundColor: "#0E497A",
      color: "#FFFFFF",
    },
    width: "140px",
    display: "flex",
    gap: "5px",
    alignItems: "center",
    marginRight: "20px",
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  formButtonsContainer: {
    display: "flex",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
  },
  contentContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: "5px",
    paddingBottom: "5px",
  },
  formTextPadding: {
    paddingBottom: theme.typography.pxToRem(10),
    fontSize: theme.typography.pxToRem(14),
    color: "#003566",
  },

  submitBtn: {
    backgroundColor: "#003566 !important",
    height: "20px",
    color: "#fff",
  },
  asterisk: {
    color: "red",
    verticalAlign: "end",
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

  label: {
    verticalAlign: "middle",
  },
  mobile__order: {
    [theme.breakpoints.down("sm")]: {
      order: 2,
      // overFlow:"scroll",
      // height:"300px"
    },
  },
  first_container: {
    [theme.breakpoints.down("sm")]: {
      overflow: "scroll",
      height: "400px",
    },
    display: "flex",
  },
  formBox: {
    width: "100%",
    paddingBottom: theme.typography.pxToRem(25),
  },
  uploadSection: {
    "& .ant-upload-list-item-name": {
      color: "blue !important",
    },
  },
  filename: {
    fontSize: theme.typography.pxToRem(12),
    color: theme.palette.primary.light,
    textOverflow: "ellipsis",
    overflow: "hidden",
    width: "160px",
    whiteSpace: "nowrap",
  },
  dateInput: {
    border: "1px solid #bbb",
    minWidth: "274px",
    height: "35px",
    paddingLeft: "10px",
    paddingRight: "10px",
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
  formFirstContainer: {
    width: "1000px",
    margin: "auto",
  },
  formSecondContainer: {
    display: "flex",
    gap: "30px",
    justifyContent: "center",
  },
  formThreeContainer: {
    display: "grid",
    justifyContent: "space-between",
    width: "500px",
    gap: "25px",
  },
  reasonContainer: {
    display: "flex",
    gap: "130px",
    justifyContent: "center",
    paddingTop: "25px",
  },
  divBarContainer: {
    display: "flex",
    gap: "30px",
  },
  divBoxContainer: {
    display: "grid",
    gap: "20px",
    justifyContent: "flex-start",
  },
  fileContainer: {
    display: "grid",
    gap: "20px",
    justifyContent: "flex-start",
    paddingBottom: "40px",
    paddingTop: "20px",
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
  formControl: {
    // minWidth: "100%",
    "&.css-1h51icj-MuiAutocomplete-root .MuiOutlinedInput-root": {
      padding: "1px",
    },
  },
  tableContainer: {
    marginTop: "1%",
    maxHeight: "calc(70vh - 14vh)", // Adjust the max-height value as needed
    overflowY: "auto",
    overflowX: "hidden",
    "&.MuiPaper-root .MuiTableContainer-root .MuiPaper-outlined .MuiPaper-rounded":
      {
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
    "& .ant-table-wrapper .ant-table.ant-table-bordered > .ant-table-container > .ant-table-summary > table > tfoot > tr > td":
      {
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
}));

export default useStyles;
