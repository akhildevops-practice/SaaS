import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    boxShadow: theme.shadows[2],
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.primary.main,
  },
  headingIndependent: {
    color: "#ffffff",
  },
  accordionContent: {
    border: "1px solid #D3D3D3",
    borderRadius: "5px",
    margin: 10,
  },

  accordionContent__noBackground: {
    display: "block",
    fontFamily: "IBM Plex Sans",
    fontSize: theme.typography.pxToRem(12),
    fontWeight: 400,
  },

  accordionHeader: {
    backgroundColor: "#F5F5F5",
    "&.Mui-expanded": {
      minHeight: 0,
    },
    "& .MuiAccordionSummary-content.Mui-expanded": {
      margin: "0px",
    },
  },
  emptyBGHeader: {
    backgroundColor: "white",
    "&.Mui-expanded": {
      minHeight: 0,
    },
    "& .MuiAccordionSummary-content.Mui-expanded": {
      margin: "0px",
    },
  },

  accordionIndependent: {
    backgroundColor: "#B3CEE2",

    borderRadius: theme.typography.pxToRem(5),
    "&.Mui-expanded": {
      minHeight: 0,
      backgroundColor: "#0E497A",
    },
    "& .MuiAccordionSummary-content.Mui-expanded": {
      margin: "0px",
      // backgroundColor: "#0E497A",
    },
  },

  accordionDetails: {
    fontSize: theme.auditFont.medium,
  },
  posted: {
    fontFamily: "inherit",
    fontSize: theme.typography.pxToRem(12),
    color: "rgba(104, 104, 104, 1)",
  },
}));

export default useStyles;
