import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    backgroundColor: "#F1F1F2",
  },
  selectorTitleDiv :{
    display:"flex",
    gap:"15px",
  },
  subSelectorDiv:{
    display:"flex",
    gap:"3px",
    alignItems:"center"
  },
  backButton:{
    backgroundColor:"#003566",
    color:"#fff"
  },
  divMainContainer:{
    display:"flex",
    justifyContent:"space-between",
    alignItems:"center",
    paddingTop:"15px",
  },
  pagination: {
    // position: "fixed",
    // bottom: "3px",
    right: "0",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "inherit",
    padding: theme.spacing(1),
  },
  iconButton: {
    paddingLeft: "1rem",
  },
}));

export default useStyles;