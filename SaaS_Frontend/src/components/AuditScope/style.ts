import { makeStyles, createStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) =>
  createStyles({
    formTextPadding: {
      padding: theme.typography.pxToRem(14),
      color: "#003566",
      fontFamily: "poppinsregular, sans-serif !important",
      fontSize: "14px",
    },
    container: {
      maxWidth: 400,
      margin: "auto",
      padding: 16,
    },
    textField: {
      width: "100%",
      marginBottom: 16,
    },
    textType:{
      fontSize:"14px",
      fontWeight:"bold"
    },
    searchContainer: {
      display: "flex",
      alignItems: "center",
      border: "1px solid #ddd",
      borderRadius: "25px",
      padding: "2px 4px",
      width: "230px",
    },
    input: {
      flex: 1,
      "& .MuiOutlinedInput-notchedOutline": {
        border: "none",
      },
      "& .MuiOutlinedInput-inputMarginDense":{
        paddingTop:"5.5px",
        paddingBottom:"5.5px"
      }
    },
    iconButton: {
      padding: 6,
    },
  })
);

export default useStyles;
