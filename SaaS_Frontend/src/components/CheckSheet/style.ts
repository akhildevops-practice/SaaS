import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  tabsWrapper: {
    margin: "15px 0px 10px 10px",
    "& .ant-tabs-tab": {
      backgroundColor: "#e3e8f9 !important",
      color: "black !important",
      borderRadius: "5px",
      padding:"8px 0",
       margin :"0 0 0 20px !important"
    },
    "& .ant-tabs-tab-btn": {
      letterSpacing: "0.6px",
      padding: "0px 20px",
      fontWeight: "bold",
    },
    ".ant-tabs .ant-tabs-tab":{
      padding:"8px 0"
    },
    ".ant-tabs .ant-tabs-tab+.ant-tabs-tab" :{
      margin :"0 0 0 20px !important"
    },
    "& .ant-tabs-tab-active": {
      backgroundColor: "#003566 !important",
    },
    "& .ant-tabs-tab-active div": {
      color: "white !important",
      fontWeight: "bold",
    },
  },
}));

export default useStyles;
