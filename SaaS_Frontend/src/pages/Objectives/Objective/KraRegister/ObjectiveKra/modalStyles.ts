import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  modal: {
    "& .ant-modal-header": {
      textAlign: "center",
    },
  },
  formBox: {
    marginTop: "15px",
    height: "400px",
    // minHeight: "400px",
    overflowY: "auto",
    "&::-webkit-scrollbar": {
      width: "10px",
      backgroundColor: "white",
    },
    "&::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "grey",
    },
  },
  gridWrapper: {
    "&. MuiGrid-item": {
      margin: "auto",
    },
  },
  root: {
    flexGrow: 1,
    maxWidth: 752,
    backgroundColor: "white",
    padding: "10px",
  },
  demo: {
    "& .MuiListItem-giutters": {
      paddinRight: "0px",
    },
    "& .MuiListItem-root": {
      paddingTop: "0px",
    },
  },
  scrollableList: {
    maxHeight: "200px", // Set the height according to your needs
    overflowY: "auto",
    "&::-webkit-scrollbar": {
      width: "10px",
      backgroundColor: "white",
    },
    "&::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "grey",
    },
  },
  title: {
    margin: theme.spacing(4, 0, 2),
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
}));

export default useStyles;
