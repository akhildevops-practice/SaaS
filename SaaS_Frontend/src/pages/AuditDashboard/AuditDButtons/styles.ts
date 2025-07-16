import { makeStyles } from "@material-ui/core/styles";

const useStyles = (mediumScreen: any) =>
  makeStyles((theme) => ({
    main_container: {
      width: mediumScreen ? "300px" : "100%",
      borderRadius: "5px",
      // height: "100px",
    },
    paper: {
      width: mediumScreen ? "300px" : "100%",
      borderRadius: "5px",
      height: "75px",
      display: "flex",
      justifyContent: "center",
      cursor: "pointer",
      border: "1px solid  #b3b3b3",
    },
    heading: {
      textAlign: "center",
    },
    headingText: {
      margin: "0px 0px 5px 0px",
      fontSize: "15px",
      fontFamily: "poppinsregular, sans-serif !important",
      fontWeight: "bold",
    },
    buttons: {
      display: "flex",
      justifyContent: "center",
      width: "100%",
      // backgroundColor: "#ffe6e6",
      // gap: "10px",
    },
    divider: {
      margin: "10px 0px",

      background: "#afc2d0",
    },
    count: {
      width: mediumScreen ? "149px" : "95%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      // fontSize: "40px",
      margin: "0px 0px",
      padding: "0px",
      borderRadius: "5px",
    },
    text: {
      width: mediumScreen ? "149px" : "95%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      textAlign: "center",
      margin: "0px 0px",
      padding: "0px",
      borderRadius: "5px",
    },
    textcontent: {
      margin: "3px 0px",
      fontSize: "13px",
    },
    countNumber: {
      margin: "0px 0px ",
      fontSize: mediumScreen ? "30px" : "22px",
      fontWeight: "bold",
    },
    active: {
      // backgroundColor: "#cc6699",
      backgroundColor: "#3576BA",
      color: "white",
    },
    
  }));

export default useStyles;
