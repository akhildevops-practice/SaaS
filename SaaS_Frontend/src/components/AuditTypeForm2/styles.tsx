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
}));

export default useStyles;
