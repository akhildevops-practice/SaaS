import { makeStyles, createStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) =>
  createStyles({
    button__group: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    back__button: {
      color: theme.palette.primary.light,
    },
    form__section: {
      border: "0.875rem solid #F7F7FF",
      borderRadius: "10px",
      padding: "2rem 3rem",
      [theme.breakpoints.down("sm")]: {
        padding: "1rem",
      },
      margin: "1rem 0",
    },

    label: {
      fontSize: theme.typography.pxToRem(13),
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "center",
      height: "100%",
    },
    button__container: {
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "center",
      gap: "1rem",
      height: "100%",
    },
    filename: {
      fontSize: theme.typography.pxToRem(12),
      color: theme.palette.primary.light,
      textOverflow: "ellipsis",
      overflow: "hidden",
      width: "160px",
      whiteSpace: "nowrap",
    },
    attachButton: {
      backgroundColor: theme.palette.primary.light,
      color: theme.textColor.white,
      "&:hover": {
        backgroundColor: theme.palette.primary.main,
      },
    },
    file__button: {
      color: "red",
      "& button": {
        backgroundColor: theme.palette.primary.light,
      },
    },
    docProof: {
      fontSize: theme.typography.pxToRem(13),
      color: theme.palette.primary.light,
      textOverflow: "ellipsis",
      overflow: "hidden",
      width: "200px",
      whiteSpace: "nowrap",
      textDecoration: "underline",
    },
  })
);

export default useStyles;
