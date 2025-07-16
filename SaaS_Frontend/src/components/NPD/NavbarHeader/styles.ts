import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  buttonsMainContainer: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0px 0px 0px 0px",
  },
  buttonsSubContainer: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
    padding: "10px 10px 10px 10px",
  },
  buttonActive: {
    backgroundColor: "#2874A6",
    color: "#fff",
  },
  button: {
    backgroundColor: "#fff",
    color: "black",
  },
  buttonContainer: {
    display: "flex",
    gap: "7px",
    width: "160px",
    height: "35px",
    // justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    paddingLeft: "5px",
    paddingRight: "10px",
    fontSize:"16px",
    border:"1px solid black",
    borderRadius: "5px",
    fontWeight:"normal"
  },
 buttonContainerActive: {
    display: "flex",
    gap: "7px",
    backgroundColor: "#0A4764",
    color: "#ffff",
    width: "160px",
    height: "35px",
    borderRadius: "5px",
    fontWeight:"bold",
    // justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    paddingLeft: "5px",
    paddingRight: "10px",
    fontSize:"16px"
  },
}));

export default useStyles;
