import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles<Theme>((theme: Theme) => ({
  IsNotContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
  },
  textContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  disabledInput: {
    "&.ant-input-disabled": {
      backgroundColor: "white !important",
      color: "black !important",
      WebkitTextFillColor: "black !important", // helps for Safari
      opacity: 1, // remove greying effect
    },
  },

  IsNotText: {
    fontSize: "36px",
    fontWeight: "bold",
    letterSpacing: "0.8px",
    lineHeight: 0.61,
    fontFamily: "Poppins",
    margin: "20px 0px",
  },
  text: {
    fontSize: "16px",
    fontWeight: 600,
    letterSpacing: "0.8px",
    lineHeight: 1.38,
    fontFamily: "Poppins",
    margin: "0px 0px",
    width: "550px",
    textAlign: "center",
  },
  checkbox: {
    "& .ant-checkbox-inner": {
      width: "24px", // Increase width
      height: "24px", // Increase height
      borderRadius: "2px", // Reduce border radius
      transform: "scale(1.1)", // Slightly enlarge the checkbox
      display: "flex",
      alignItems: "center", // Vertically center checkmark
      justifyContent: "center", // Horizontally center checkmark
    },
    "& .ant-checkbox-checked .ant-checkbox-inner::after": {
      textAlign: "center",
      marginLeft: "2px",
    },
    "& .ant-checkbox-checked .ant-checkbox-inner": {
      backgroundColor: "#003059", // Change background when checked
      borderColor: "#003059", // Change border when checked
    },
    // Unchecked + disabled
    "& .ant-checkbox-disabled .ant-checkbox-inner": {
      borderColor: "black !important",
      backgroundColor: "white !important",
    },
    // Checked + disabled: background and tick color
    "& .ant-checkbox-disabled.ant-checkbox-checked .ant-checkbox-inner": {
      backgroundColor: "#003059 !important",
      borderColor: "#003059 !important",
    },
    "& .ant-checkbox-disabled.ant-checkbox-checked .ant-checkbox-inner::after":
      {
        borderColor: "white !important", // white tick
      },
  },
}));

export default useStyles;
