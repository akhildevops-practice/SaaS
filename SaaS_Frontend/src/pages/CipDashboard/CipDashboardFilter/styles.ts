import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  container: {
    border: "1px solid #666666",
    borderRadius: "5px",
    "& .ant-picker-suffix .anticon-calendar": {
      color: "#4096FF" /* Change the color of the default icon */,
    },
    "& .ant-select-arrow": {
      color: "#4096FF", // Change the color of the default icon
    },
  },
  // autocomplete: {
  //   "&.MuiOutlinedInput-input": {
  //     padding: "0px 18px",
  //   },
  // },
}));

export default useStyles;
