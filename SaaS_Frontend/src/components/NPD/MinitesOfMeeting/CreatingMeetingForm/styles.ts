import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    backgroundColor: "#F1F1F2",
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
  buttonNpd:{
    width:"130px",
  },
  activeButton:{
 backgroundColor:"#003566",
 color:"#fff",
 width:"130px",
  },
  descriptionLabelStyle : {
    "& .ant-descriptions-item-label": {
      color: "#003566 !important",
      fontWeight: "bold",
      letterSpacing: "0.8px",
      // Add any other styles you want to apply to the label inside Descriptions.Item
    },
    "& .ant-form-item .ant-form-item-label > label": {
      color: "#003566",
      fontWeight: "bold",
      letterSpacing: "0.8px",
      // Add any other styles you want to apply to the label inside Form.Item
    },
    "& .ant-input-lg": {
      border: "1px solid #dadada",
    },
  },
  uploadSection: {
    "& .ant-upload-list-item-name": {
      color: "blue !important",
    },
    "&.ant-upload-wrapper .makeStyles-uploadSection-53 .css-dev-only-do-not-override-zg0ahe" :{
      display:"flex",
      gap:"5px"
    }
  },
  buttonContainerActive: {
    backgroundColor: "#00224E",
    color: "#ffff",
    borderRadius:"6px 6px 0px 0px"
  },
  buttonContainer: {
   backgroundColor:"#fff",
   color: "#00224E",
   borderRadius:"6px 6px 0px 0px"
  },
  pagination: {
    // position: "fixed",
    bottom: "3px",
    right: "0",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "inherit",
    padding: theme.spacing(1),
  },
}));

export default useStyles;