import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles<Theme>((theme: Theme) => ({
  mainPageContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    marginTop: "100px",
  },
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
  tabContainer: {
    width: "100%",
    marginTop: "40px",
    display: "flex",
    justifyContent: "start",
  },
  tabsWrapper: {
    "& .ant-tabs-nav": {
      marginLeft: "-5%",
    },
    "& .ant-tabs-ink-bar": {
      display: "none !important", // Hides the bottom blue active line
    },
    "& .ant-tabs-nav-list": {
      display: "flex",
      gap: "5px", // Adjust spacing between tabs
      padding: "0px 0px",
      borderRadius: "8px",
      border: "1px solid  white",
    },
    // ".ant-tabs-card.ant-tabs-top >.ant-tabs-nav .ant-tabs-tab": {
    //   borderRadius: "8px 8px",
    // },
    "&.ant-tabs-card.ant-tabs-top >.ant-tabs-nav .ant-tabs-tab": {
      borderRadius: "8px 8px 0px 0px",
      textAlign: "center",
    },

    "& .ant-tabs-tab": {
      backgroundColor: "#d4d0d0 !important",
      color: "black !important",
      // padding: "8px 16px",
      borderRadius: "8px 8px 0px 0px",
      width: "112px",
      height: "43px",
      display: "flex",
      justifyContent: "center",
    },
    "&.ant-tabs .ant-tabs-tab+.ant-tabs-tab": {
      margin: "0px 0px 0px 0px",
    },
    "& .ant-tabs-tab-btn": {
      letterSpacing: "0.8px",
      fontSize: "14px",
      fontWeight: 600,
      fontFamily: "Poppins",
    },
    "& .ant-tabs-tab-active": {
      backgroundColor: "#003059 !important",
    },
    "& .ant-tabs-tab-active div": {
      color: "white !important",
      fontWeight: "500",
    },
  },

  // tabsWrapper: {
  //   height: " 100%",
  //   "& .ant-tabs-nav": {
  //     width: "150px" /* Adjust tab width */,
  //   },
  //   "&.ant-tabs-tab": {
  //     textAlign: "left" /* Align text to left */,
  //   },
  //   "& .ant-tabs-tab-active": {
  //     backgroundColor: "#003059 !important",
  //   },
  // },
  parentdiv: {
    // border: "1px solid #c0c0c0",
    // border: "1px solid black",
    width: "80vw",
    // paddingLeft: "11vw",
    margin: "-20px 0px 0px 0px",
    // marginLeft: "10%",
  },
  form: {
    width: "85%",
    "& .ant-form-item-label > label": {
      // Correctly targeting the label inside Form.Item
      fontWeight: "bold",
      fontSize: "14px",
      color: "#003566",
    },
  },
  is_isNot: {
    width: "91%",
    display: "flex",
    justifyContent: "space-evenly",
    gap: "35%",
    fontSize: "30px",
    fontWeight: "bold",
    letterSpacing: "0.8px",
    lineHeight: 0.69,
  },
  tabPane: {
    width: "100%",
    border: "1px solid #c0c0c0",
    marginLeft: "10%",
    padding: "20px 5% 20px 5% ",
    marginTop: "-17px",
    borderRadius: "15px",
  },
  formContainer: {
    width: "100%",
  },
  input: {
    width: "80%",
    "&.ant-input-disabled": {
      color: "black !important",
      WebkitTextFillColor: "black !important", // for Safari
      backgroundColor: "white !important",
    },
  },
  p: {
    // margin: "0px 0px",
  },
}));

export default useStyles;
