import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  form: {
    padding: theme.typography.pxToRem(20),
    borderRadius: theme.typography.pxToRem(10),
    backgroundColor: "#FFFFFF",
    minHeight: "100%",
  },
  disabledTextField: {
    "& .MuiInputBase-root.Mui-disabled": {
      border: "none",
      backgroundColor: "white",
      color: "black",
    },
  },

  disabledMuiSelect: {
    "& .Mui-disabled": {
      backgroundColor: "white",
      color: "black",
      border: "none",
      "& .MuiSelect-icon": {
        display: "none",
      },
    },
  },

  formTextPadding: {
    paddingBottom: theme.typography.pxToRem(16),
    fontSize: theme.typography.pxToRem(14),
    color: "#003566",
    paddingTop: theme.typography.pxToRem(16),
  },
  formControl: {
    minWidth: "100%",
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

export default useStyles;
