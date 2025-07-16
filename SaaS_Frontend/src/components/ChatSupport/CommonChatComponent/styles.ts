import { makeStyles } from "@material-ui/core/styles";
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
      fontSize: "12px",
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
    backgroundColor: "white",
  },
  botMessage: {
    display: "flex",
    alignItems: "flex-end",
    marginBottom: "10px",
  },
  userMessage: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "end",
    flexDirection: "row-reverse",
    marginBottom: "24px",
  },
  avatar: {
    margin: "0 10px",
  },
  messageContentContainer: {
    maxWidth: "60%",
    padding: "10px 20px",
    borderRadius: "14px",
    // backgroundColor: "#fff",
    boxShadow: "0 2px 2px rgba(0, 0, 0, 0.05)",
    position: "relative",
    border: "1px solid #d9d9d9",
    backgroundColor: "#00367c",
    color: "white",
  },
  messageContentContainer2: {
    maxWidth: "60%",
    padding: "10px 20px",
    borderRadius: "14px",
    backgroundColor: "white",
    boxShadow: "0 2px 2px rgba(0, 0, 0, 0.05)",
    position: "relative",
    border: "1px solid #d9d9d9",
    marginLeft: "10px",
  },
  messageContent: {
    fontSize: "16px",
    lineHeight: "1.4",
    color: "white", // Match the text color to your design
    whiteSpace:
      "pre-wrap" /* This will respect new lines and spaces in the content */,
    wordWrap: "break-word" /* Ensures long text does not overflow */,
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
    flexDirection: "row",
    alignItems: "end",
    padding: "10px",
    backgroundColor: "white",
    justifyContent: "center",
  },
  inputField: {
    marginRight: "10px",
    borderRadius: "13px",
    border: "1px solid #d9d9d9",
    padding: "5px 15px",
  },
  sendButton: {
    borderRadius: "20px",
    backgroundColor: "rgba(0, 34, 78, 0.57)",
    marginBottom: "10px",
  },
  searchIcon: { fontSize: "20px", marginLeft: "3px", marginTop: "1px" },

  scrollContainer: {
    height: "350px",
    overflowY: "auto",
    padding: "0px 5px",
    "&::-webkit-scrollbar": {
      width: "6px",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      borderRadius: "4px",
    },
    "&::-webkit-scrollbar-track": {
      backgroundColor: "transparent",
    },
  },
}));

export default useStyles;
