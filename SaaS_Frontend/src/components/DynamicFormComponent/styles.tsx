import { makeStyles, createStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) =>
  createStyles({
    rootContainer: {
      // padding: `0 ${theme.typography.pxToRem(200)}`,
      maxWidth: "1080px",
      margin: "0 auto",
    },
    questionContainer: {
      padding: "clamp(1rem, 70px, 2rem)",
      border: `1px solid ${theme.palette.primary.main}`,
      borderRadius: "10px",
      background: "white",
    },
    questionHeader: {
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "center",
      paddingBottom: "2rem",
      gap: "1.5rem",
    },
    sectionHeader: {
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "center",
      gap: "1.5rem",
    },

    sectionContainer: {
      padding: "clamp(1rem, 70px, 2rem)",
      borderTop: `1px solid ${theme.palette.primary.main}`,
      borderRadius: "10px",
    },
    text: {
      fontSize: theme.auditFont.medium,
      color: theme.palette.primary.main,
    },
  })
);
