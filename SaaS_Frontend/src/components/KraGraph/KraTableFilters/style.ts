import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  Select: {
    border: "1px solid black",
    borderRadius: "5px",
    "& .ant-select-selection-placeholder": {
      color: "black !important",
    },
    "& .ant-select-arrow": {
      color: "black !important",
    },
  },
}));

export default useStyles;
