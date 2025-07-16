import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = (matches: any) =>
  makeStyles<Theme>((theme: Theme) => ({
    parentDiv: {
      display: "flex",
      flexWrap: "wrap",
      flexDirection: "row",
      justifyContent: "space-evenly",
      padding: "5px 0px",
      height: "fit-content",
      fontFamily: "poppinsregular, sans-serif",
      marginTop: "5px",
    },
    container: {
      border: "1px solid #666666",
      // borderRadius: "5px",
      "& .ant-picker-suffix .anticon-calendar": {
        color: "#4096FF" /* Change the color of the default icon */,
      },
      "& .ant-select-arrow": {
        color: "#4096FF", // Change the color of the default icon
      },
    },
    tagStyle1: {
      backgroundColor: "#f50", // Red
      color: "white",
      borderRadius: "4px",
      padding: "5px 10px",
      marginRight: "8px",
      cursor: "pointer",
    },
    tagStyle2: {
      backgroundColor: "#2db7f5", // Blue
      color: "white",
      borderRadius: "4px",
      padding: "5px 10px",
      marginRight: "8px",
      cursor: "pointer",
    },
    closeIcon: {
      color: "white",
      marginLeft: "8px",
    },
    paper: {
      display: "flex",
      justifyContent: "space-evenly",
      // width:"15vw",
      // height: "90px",
      height: "fit-content",
      // background: "#e0e0eb",
      background: "white",
      cursor: "pointer",
      // borderRadius: "5px",
      family: "'Poppins', sans-serif",
      // border: "0.5px solid #b3a087",
      // borderRadius: "0px !important",
      padding: "3px",
      border: "1px solid #b3b3b3",
      borderRadius: "5px",
    },
    papercontainers: {
      // textAlign: "center",
      width: "100%",
      // borderRadius: "5px",
      paddingRight: "6px",
      // paddingLeft: "5px",
      // width:"fit-container",
    },
    papermaincontain: {
      width: matches ? "15vw" : "200px",

      // textAlign: "center",
    },
    headingname: {
      fontWeight: 600,
      margin: "8px 0px 0px 0px ",
      fontSize: "12px",
      family: "'Poppins', sans-serif",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      // color: "black",
      // writingMode : "vertical-rl",
      // textOrientation : "mixed",
      // transform : "rotate(180deg)",
      // borderLeft : "1px solid",
    },
    headingnumber1: {
      margin: " 0px 0px -15px 0px",
      fontWeight: 600,
      fontSize: "30px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: " poppinsregular, sans-serif !important",
      // color: "#2b87cb !important",
    },
    headingnumber: {
      margin: " 0px 0px -15px 0px",
      fontWeight: 600,
      fontSize: "30px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "0px 0px 0px 0px ",
      fontFamily: " poppinsregular, sans-serif !important",
      // color: "#2b87cb !important",
    },
    headingText: {
      // fontWeight:600,
      whiteSpace: "pre",
      fontSize: "15px",
      margin: "0px",
      marginBottom: "5px",
      textAlign: "center",
      fontFamily: " poppinsregular, sans-serif !important",
      fontWeight: "bold",
    },
    divider: {
      margin: "10px 0px",

      background: "#afc2d0",
    },
    active: {
      // backgroundColor: "#005580",
      backgroundColor: "#873e8d",
      color: "white",
    },
    filterForm: {
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "start",
      gap: "10px",
      marginBottom: "20px", // Space below the form
    },
    formItem: {
      minWidth: "250px", // Ensuring each field has enough room to display properly
      maxWidth: "350px", // Maximum width to prevent overly wide fields
      flexGrow: 1, // Allows fields to grow to use available space
    },
  }));
export default useStyles;
