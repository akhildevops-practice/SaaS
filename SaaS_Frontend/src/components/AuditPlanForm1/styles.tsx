import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  form: {
    padding: "0 40px 20px 40px",
    borderRadius: theme.typography.pxToRem(10),
    backgroundColor: "#FFFFFF",
    minHeight: "100%",
    "& .PrivateNotchedOutline-root-4068 MuiOutlinedInput-notchedOutline.element.style":
      {
        border: "none",
      },
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
  formControl: {
    minWidth: "100%",
    "& .PrivateNotchedOutline-root-4068 MuiOutlinedInput-notchedOutline.element.style":
      {
        border: "none",
      },
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

    // "&:hover": {
    //   border: "1px solid black",
    // },

    // "&:focus": {
    //   border: `2px solid ${theme.palette.primary.main}`,
    //   marginTop: theme.typography.pxToRem(18),
    // },
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
  // asterisk: {
  //   color: "red",
  //   display: "inline-flex",
  //   verticalAlign: "middle",
  //   marginRight: theme.spacing(0.5),
  //   fontSize:
  // },
  // asterisk: {
  //   color: "red",
  //   padding: "0",
  //   backgroundColor: "yellow",

  // display: "inline-flex",
  // justifyContent: "center",
  // alignItems: "center",
  // display: "inline-flex",
  // alignItems: "center",
  // marginRight: theme.spacing(1),
  // fontSize: "1.5rem",
  // },
  asterisk: {
    color: "red",
    verticalAlign: "end",
  },
  label: {
    verticalAlign: "middle",
  },

  textField: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "gray",
      },
      "&:hover fieldset": {
        borderColor: "gray",
      },
      "&.Mui-focused fieldset": {
        borderColor: "gray",
      },
      "&.Mui-disabled": {
        color: "black",
        backgroundColor: "white",
        border: "none !important",
        "& fieldset": {
          border: "none !important",
        },
      },
    },
    "& .Mui-disabled": {
      color: "black",
      border: "none !important",
      borderColor: "none",
    },
    "& .PrivateNotchedOutline-root-4068 MuiOutlinedInput-notchedOutline.element.style":
      {
        border: "none",
      },
  },
}));

export default useStyles;
