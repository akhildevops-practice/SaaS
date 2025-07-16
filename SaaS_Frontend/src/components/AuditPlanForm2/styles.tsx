import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  form: {
    padding: theme.typography.pxToRem(20),
    borderRadius: theme.typography.pxToRem(10),
    backgroundColor: "#FFFFFF",
    minHeight: "100%",
  },
  formTextPadding: {
    paddingBottom: theme.typography.pxToRem(12),
    fontSize: theme.typography.pxToRem(14),
    color: "#003566",
  },
  formBox: {
    minWidth: "90%",
    paddingBottom: theme.typography.pxToRem(25),
  },
  formComment: {
    fontFamily: theme.typography.fontFamily,
    width: "100%",
    minHeight: theme.typography.pxToRem(100),
    marginTop: theme.typography.pxToRem(20),
    padding: theme.typography.pxToRem(10),
    border: "1px solid #bbb",
    borderRadius: 5,
    outline: "none",

    "&:hover": {
      border: "1px solid black",
    },

    "&:focus": {
      border: `2px solid ${theme.palette.primary.main}`,
      marginTop: theme.typography.pxToRem(18),
    },
  },
  formControl: {
    minWidth: "100%",
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
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
}));

export default useStyles;
