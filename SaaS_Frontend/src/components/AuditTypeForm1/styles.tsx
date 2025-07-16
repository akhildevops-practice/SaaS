import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  form: {
    padding: theme.typography.pxToRem(20),
    borderRadius: theme.typography.pxToRem(10),
    backgroundColor: "#FFFFFF",
    minHeight: "100%",
  },
  formTextPadding: {
    // paddingBottom: theme.spacing(1.25), // 10px
    fontSize: "0.875rem", // 14px
    color: "#003566",
    display: "flex",
    alignItems: "center",
    // gap: theme.spacing(0.5), // Better spacing between text and checkbox

    // [theme.breakpoints.down("sm")]: {
    //   flexDirection: "column",
    //   alignItems: "flex-start",
    //   gap: theme.spacing(0.25),
    // },
  },

  checkboxRoot: {
    transition: "all 0.3s ease",

    "&:hover": {
      backgroundColor: "rgba(0, 53, 102, 0.1)",
      borderRadius: 4,
    },

    "&:focus": {
      outline: "2px solid #003566",
    },

    "&.Mui-disabled": {
      color: "rgba(0, 53, 102, 0.4)",
    },
  },

  strongText: {
    fontWeight: 600,
    letterSpacing: "0.5px",
  },
  textField: {
    "& .MuiInputBase-root.Mui-disabled": {
      backgroundColor: "white", // Set your desired background color
      color: "Black",
    },
  },
  select: {
    "& .MuiSelect-select.Mui-disabled": {
      backgroundColor: "white", // Set your desired background color
      color: "black",
    },
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
  formContainer: {
    display: "flex",
    flexDirection: "column",
    padding: "1px 15px",
    border: "2px Solid #DFDFDF",
    borderRadius: "5px",
    marginTop: "32px",
    width: "90%",
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
    color: "#003566",
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
    color: "#003566",
  },
  cellContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    width: "90%",
  },
}));

export default useStyles;
