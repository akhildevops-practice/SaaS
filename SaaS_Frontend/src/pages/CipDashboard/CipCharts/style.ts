import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = (smallScreen: any, matches: any) =>
  makeStyles<Theme>((theme: Theme) => ({
    filterMainContainer: {
      display: "flex",
      justifyContent: "space-between",
      backgroundColor: "#FFFFFF",
      marginTop: "20px",
    },
    textContainer: {
      display: "flex",
      flexDirection: "column",
      flex: "1",
      alignItems: "center",
      justifyContent: "center",
      padding: "10px",
    },
    paper: {
      width: smallScreen ? "170px" : "30vw",
      textAlign: "center",
      borderRadius: "5px",
      family: "'Poppins', sans-serif",
      border: "1px solid  #b3b3b3",
      boxShadow: "0 0 6px 0 rgba(0, 0, 0, 0.25)",
    },
    count: {
      fontSize: smallScreen ? "30px" : "20px",
      color: "#212121",
      margin: "0px 0px -8px 0px",
      fontWeight: "bold",
      padding: smallScreen ? "5px 30px" : "5px 12px",
      family: "'Poppins', sans-serif",
    },
    text: {
      fontWeight: 600,
      margin: "0px 0px 5px 0px",
      fontSize: "12px",
      family: "'Poppins', sans-serif",
      color: "#737373",
      padding: "5px",
    },
    chartMainContainer: {
      display: "flex",
      flexDirection: matches ? "row" : "column",
      alignItems: "center",
      justifyContent: "space-evenly",
      backgroundColor: "#FFFFFF",
      padding: "10px",
    },
    //for count section
    card: {
      backgroundColor: "#fff",
      borderRadius: "12px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
      padding: "20px",
      textAlign: "center",
      height: "100%",
    },
    number: {
      fontSize: "1.875rem",
      fontWeight: 700,
      color: "#2563EB",
      marginBottom: "4px",
    },
    label: {
      fontSize: "0.75rem",
      color: "#6B7280",
    },
  }));

export default useStyles;
