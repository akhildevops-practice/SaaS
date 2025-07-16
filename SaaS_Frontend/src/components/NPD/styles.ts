import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    // width: "100%",
    backgroundColor: "#F1F1F2",
  },
  firstDiv: {
    width: "99%",
    margin: "auto",
    height: "55px",
    padding: "10px",
    backgroundColor: "#fff",

    // boxShadow:"0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 8px 0 rgba(0, 0, 0, 0.19)",
  },
  pagination: {
    // position: "fixed",
    // bottom: "3px",
    right: "0",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "inherit",
    padding: theme.spacing(1),
  },
  datePickerStyles: {
    "&.ant-picker .ant-picker-suffix": {
      color: "rgb(20 115 224)",
    },
  },
}));

export default useStyles;
