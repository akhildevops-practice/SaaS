import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
  form: {
    padding: theme.typography.pxToRem(20),
    borderRadius: theme.typography.pxToRem(10),
    backgroundColor: "#FFFFFF",
    minHeight: "100%",
  },
  formTextPadding: {
    padding: theme.typography.pxToRem(14),
    fontSize: theme.typography.pxToRem(13),
  },
  formBox: {
    width: "100%",
    paddingBottom: theme.typography.pxToRem(25),
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
    marginLeft: "30px",
  },
  textfield: {
    "& .MuiOutlinedInput-root": {
      // '& fieldset': {
      //   borderColor: 'gray',
      // },
      // '&:hover fieldset': {
      //   borderColor: 'gray',
      // },
      // '&.Mui-focused fieldset': {
      //   borderColor: 'gray',
      // },
      "&.Mui-disabled": {
        color: "black",
        backgroundColor: "white",
        "& fieldset": {
          // border: "none",
          // backgroundColor: "white",
        },
      },
    },
    "& .Mui-disabled": {
      color: "black",
      borderColor: "none",
    },
  },
  label: {
    color: "#003566",
    fontFamily: "poppinsregular, sans-serif !important",
    fontSize: "14px",
  },
  labelStart: {
    color: "red",
  },
}));

export default useStyles;
