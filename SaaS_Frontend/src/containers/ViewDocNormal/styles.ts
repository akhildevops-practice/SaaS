import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  accordionStyle: {
    paddingLeft: theme.typography.pxToRem(16),
    paddingBottom: theme.typography.pxToRem(8),
    "& .MuiAccordionDetails-root": {
      padding: "8px 4px 16px !important",
    },
  },
}));

export default useStyles;
