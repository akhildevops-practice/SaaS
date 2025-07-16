  import { makeStyles } from "@material-ui/core/styles";
// import chatBackground from "assets/images/chatbg.png";
const useStyles = makeStyles((theme) => ({
  chatLayout: {
    // height: "90vh",
    display: "flex",
    flexDirection: "column",
    // background: '#748a97 !important', // Your desired background color
  },
  labelStyle: {
    "& .ant-input-lg": {
      border: "1px solid #dadada",
    },
    "& .ant-form-item .ant-form-item-label > label": {
      color: "#003566",
      fontWeight: "bold",
      letterSpacing: "0.8px",
      // Add any other styles you want to apply to the <label> element
    },
  },
  chatContent: {
    flex: 1,
    overflow: "auto",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
  },
  botMessage: {
    display: "flex",
    alignItems: "flex-end",
    marginBottom: "10px",
  },
  userMessage: {
    display: "flex",
    alignItems: "flex-end",
    flexDirection: "row-reverse",
    marginBottom: "24px",
  },
  avatar: {
    margin: "0 10px",
  },
  messageContentContainer: {
    maxWidth: "60%",
    padding: "10px 20px",
    borderRadius: "20px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 2px rgba(0, 0, 0, 0.05)",
    position: "relative",
    border: "1px solid #d9d9d9",
  },
  messageContent: {
    fontSize: "16px",
    lineHeight: "1.4",
    color: "#595959", // Match the text color to your design
    whiteSpace: "pre-wrap", /* This will respect new lines and spaces in the content */
    wordWrap: "break-word", /* Ensures long text does not overflow */
  },
  timestamp: {
    fontSize: "12px",
    position: "absolute",
    bottom: "-20px",
    right: "10px",
    color: "grey",
  },
  inputContainer: {
    display: "flex",
    padding: "10px",
    background: "#fff",
  },
  inputField: {
    marginRight: "10px",
    borderRadius: "20px",
    border: "1px solid #d9d9d9",
    padding: "5px 15px",
  },
  sendButton: {
    borderRadius: "20px",
  },
}));

export default useStyles;
