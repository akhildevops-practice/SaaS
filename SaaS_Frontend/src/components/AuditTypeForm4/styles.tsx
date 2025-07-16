import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
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
  select: {
    "& .MuiSelect-select.Mui-disabled": {
      backgroundColor: "white", // Set your desired background color
      color: "black",
    },
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
    "& .ant-input[disabled], & .ant-input[disabled]:not([type='textarea'])": {
      backgroundColor: "white",
      color: "black",

      // border: "none",
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
    width: "100%",
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
    maxWidth: "150px",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  inputButton: {
    width: "200px",
  },
  mainContainerDiv: {
    paddingTop: "10px",
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
  checkbox: {
    "& .ant-checkbox-inner": {
      backgroundColor: "#f5f5f5", // Background color for the checkbox
      borderColor: "black", // Border color for the checkbox
    },
    "& .ant-checkbox-checked .ant-checkbox-inner": {
      backgroundColor: "white", // Background color for the checked state
      borderColor: "black", // Border color for the checked state
    },
    "& .ant-checkbox-checked .ant-checkbox-inner::after": {
      borderColor: "black", // Color of the tick mark
    },
    "& .ant-checkbox-disabled.ant-checkbox-checked .ant-checkbox-inner": {
      backgroundColor: "white", // Background color for disabled checked state
      borderColor: "black", // Border color for disabled checked state
    },
    "& .ant-checkbox-disabled.ant-checkbox-checked .ant-checkbox-inner::after":
      {
        borderColor: "black", // Color of the tick mark in disabled checked state
      },
  },
}));

export default useStyles;
