import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    // maxHeight: "100%",
    maxHeight: "calc(68vh - 12vh)", // Adjust the max-height value as needed
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
    paddingTop: theme.typography.pxToRem(20),
  },
  form: {
    padding: "0 40px 20px 40px",
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
    paddingBottom: theme.typography.pxToRem(15),
  },
  discardBtn: {
    fontSize: theme.typography.pxToRem(13),
    color: theme.palette.primary.light,
    marginRight: theme.typography.pxToRem(20),
  },
  buttonSection: {
    display: "flex",
    justifyContent: "flex-end",
    paddingTop: theme.typography.pxToRem(60),
  },
  formControl: {
    minWidth: "100%",
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  dateInput: {
    marginLeft: theme.spacing(1.1),
    marginRight: theme.spacing(1.1),
    fontFamily: theme.typography.fontFamily,
    padding: theme.typography.pxToRem(10),
    border: "1px solid #bbb",
    borderRadius: 5,
    outline: "none",

    "&:hover": {
      border: "1px solid black",
    },

    "&:focus": {
      border: `2px solid ${theme.palette.primary.main}`,
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
      // Add any other styles you want to apply to the <label> element
    },
  },
  autocomplete: {
    "& .MuiOutlinedInput-input": {
      fontSize: "14px !important",
      borderRadius: "8px",
    },
  },
  asterisk: {
    color: "red",
    verticalAlign: "end",
  },
  label: {
    verticalAlign: "middle",
  },
  textField: {
    "& .MuiInputBase-root.Mui-disabled": {
      backgroundColor: "white", // Set your desired background color
      color: "Black",
    },
  },
  disabledSelect: {
    "&.Mui-disabled": {
      backgroundColor: "white", // Set your desired background color
      color: "Black",
    },
  },
}));

export default useStyles;
