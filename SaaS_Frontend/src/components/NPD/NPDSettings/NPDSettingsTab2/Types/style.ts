import { makeStyles } from "@material-ui/core/styles";

const useStyles: any = makeStyles((theme) => ({
  ul: {
    display: "flex",
    width: "70%",
    justifyContent: "space-evenly",
    alignItems: "center",
    listStyle: "none",
    fontSize: "20px",
    // backgroundColor: "#8cb3d9",
    height: "50px",
    padding: "0px",
    margin: "0px",
    color: "black",
  },
  mainContainer: {
    width: "70%",
  },
  container: {
    width: "70%",
    display: "flex",
    justifyContent: "start",
    alignItems: "center",
    flexDirection: "column",
    marginBottom: "40px",
  },
  heading: {
    fontSize: "16px",
    fontWeight: 600,
    // textDecoration: "underline",
  },
  list: {
    fontSize: "13px",
    fontWeight: "bold",
    color: "black",
    "&:hover": {
      color: "#cc0052",
      textDecoration: "underline",
    },
  },

  listContainer: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    marginLeft: "-10px",
    backgroundColor: "#8cb3d9",
  },
  iconSelect :{
    "&.ant-select .ant-select-arrow" : {
      display: "none",
    }
  }
}));

export default useStyles;
