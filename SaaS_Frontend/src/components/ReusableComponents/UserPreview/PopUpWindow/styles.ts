import { makeStyles, Theme } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: "fixed",
    bottom: 20,
    right: 20,
    width: "70%",
    height: 400,
    backgroundColor: "white",
    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)",
    borderRadius: 10,
    padding: 10,
  },
  headerStyles: {
    fontWeight: "bold",
    fontSize: 18,
    borderBottom: "1px solid #e0e0e0",
    paddingBottom: 10,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#E8F3F9",
  },
  closeButton: {
    backgroundColor: "#003059",
    borderRadius: "10px",
    padding: "5 0 5 0",
  },
}));
