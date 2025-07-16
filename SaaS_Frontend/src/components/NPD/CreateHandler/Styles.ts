import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  createButton: {
    display: "flex",
    gap: "7px",
    width: "auto",
    height: "32px",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A4764",
    color: "#fff",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
    padding: "1px 15px",
    fontWeight: 600,
  },
  main_container: {
    display: "flex",
    justifyContent: "end",
    gap: "15px",
    alignItems: "center",
    marginRight: "10px",
  },
}));

export default useStyles;
