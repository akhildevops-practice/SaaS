import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = (matches: any, smallScreen: any) =>
  makeStyles<Theme>((theme: Theme) => ({
    parentDiv: {
      display: "flex",
      flexWrap: "wrap",
      flexDirection: "row",
      justifyContent: "space-evenly",
      padding: "5px 0px",
      height: "fit-content",
      fontFamily: "poppinsregular, sans-serif",
    },
    paper: {
      display: "flex",
      justifyContent: "space-evenly",
      // width:"15vw",
      height: "fit-content",
      // background: "#e0e0eb",
      background: "white",
      cursor: "pointer",
      borderRadius: "5px",
      family: "'Poppins', sans-serif",
      border: "1px solid  #b3b3b3",
    },
    papercontainers: {
      textAlign: "center",
      width: "100%",
      borderRadius: "5px",
      // display: "flex",
      // justifyContent: "space-between",
      // marginRight: "35px",
      // gap: "30px",
      // width:"fit-container",
    },
    papermaincontain: matches
      ? {
          width: "15vw",
          textAlign: "center",
        }
      : {
          width: smallScreen ? "30vw" : "90%",
          textAlign: "center",
        },
    headingname: {
      fontWeight: 600,
      margin: "0px 0px 5px 0px",
      fontSize: "12px",
      family: "'Poppins', sans-serif",
      color: "#737373",
    },
    headingnumber: {
      margin: "0px 0px -5px 0px",
      padding: "0px 0px 0px 0px",
      fontWeight: 600,
      fontSize: "30px",
      color: "#212121",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
      family: "'Poppins', sans-serif",
      // marginRight: "35px",
    },

    headingText: {
      fontSize: "15px",
      margin: "0px",
      marginBottom: "5px",
      textAlign: "center",
      fontFamily: "poppinsregular, sans-serif !important",
      fontWeight: "bold",
    },
    divider: {
      margin: "10px 0px",

      background: "#afc2d0",
    },
    active: {
      backgroundColor: "#055C96",
      // backgroundColor: "#873e8d",
      color: "white",
    },
  }));
export default useStyles;
