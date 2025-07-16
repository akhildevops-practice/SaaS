import { makeStyles, Theme } from "@material-ui/core/styles";

const useStylesMrm = makeStyles<Theme>((theme: Theme) => ({
  TabHeaderPageButtons: {
    display: "flex",
    justifyContent: "space-between",
    paddingLeft: "20px",
    paddingRight: "20px",
    backgroundColor: "#e8f3f9",
    height: "40px",
    alignItems: "center",
  },
  disabledInput: {
    "& .ant-input[disabled], & .ant-input[disabled]:not([type='textarea'])": {
      // border: "none",
      backgroundColor: "#F5F5F5 !important",
      color: "black",
    },
  },

  disabledSelect: {
    "& .ant-select-disabled .ant-select-selector": {
      backgroundColor: "#F5F5F5 !important",
      background: "#F5F5F5 !important",
      color: "black",
      // border: "none",
    },
    "& .ant-select-disabled .ant-select-selection-item": {
      color: "black",
    },
    "& .ant-select-disabled .ant-select-arrow": {
      display: "none",
    },
  },
  disabledTextField: {
    "& .MuiInputBase-root.Mui-disabled": {
      // border: "none",
      backgroundColor: "#F5F5F5 !important",
      color: "black",
    },
  },

  disabledMultiSelect: {
    "& .ant-select-disabled.ant-select-multiple .ant-select-selector": {
      backgroundColor: "#F5F5F5 !important",
      // border: "none",
    },
    "& .ant-select-disabled.ant-select-multiple .ant-select-selection-item": {
      color: "black",
      background: "#F5F5F5 !important",
    },
    "& .ant-select-disabled .ant-select-arrow": {
      display: "none",
    },
  },
}));

export default useStylesMrm;
