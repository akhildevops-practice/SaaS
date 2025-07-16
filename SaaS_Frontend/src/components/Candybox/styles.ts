import { makeStyles, createStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) =>
  createStyles({
    candyBoxContainer: {
      width: 250,
      maxHeight: 250,
      padding: 10,
      overflowY: "scroll",
      "&::-webkit-scrollbar": {
        width: 4,
        borderRadius: 50,
      },
      "&::-webkit-scrollbar-track": {
        backgroundColor: "transparent",
        borderRadius: 50,
      },
      "&::-webkit-scrollbar-thumb": {
        backgroundColor: "#bbb",
        borderRadius: 50,
      },
    },

    candyBoxButton: {
      display: "block",
      padding: 0,
      margin: "auto",
    },

    candyLabel: {
      textTransform: "capitalize",
      margin: 0,
      padding: 0,
      fontSize: "0.7rem",
      lineHeight: 1,
    },
    arrow: {
      position: "absolute",
      top: 3,
      left: 200,
      width: 20,
      height: 20,
      content: '""',
      background: "white",
      transform: "rotate(45deg) translate(-50%, 0)",
    },
    leftSideText: {
      color: "#FFF",
      textShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
      fontSize: "12px",
      fontFamily: "Poppins !important",
      fontWeight: 700,
      textTransform: "uppercase",
      padding : "1px",
    },
  })
);
