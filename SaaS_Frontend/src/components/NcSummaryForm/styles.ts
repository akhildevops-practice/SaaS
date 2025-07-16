import { makeStyles, createStyles } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import MuiAccordion from "@material-ui/core/Accordion";
import MuiAccordionSummary from "@material-ui/core/AccordionSummary";
import MuiAccordionDetails from "@material-ui/core/AccordionDetails";

export const useStyles = makeStyles((theme) =>
  createStyles({
    button__group: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    // .ant-tabs-tab {
    //   border-left: none !important;
    // },
    scroll: {
      width: "100%",
      maxHeight: "calc(75vh - 12vh)", // Adjust the max-height value as needed
      overflowX: "hidden",
      overflowY: "auto",
      "&::-webkit-scrollbar": {
        width: "8px",
        height: "10px", // Adjust the height value as needed
        backgroundColor: "#e5e4e2",
      },
      "&::-webkit-scrollbar-thumb": {
        borderRadius: "10px",
        backgroundColor: "grey",
      },
      paddingTop: theme.typography.pxToRem(20),
    },
    docNavIconStyle: {
      width: "27px",
      height: "26px",
      cursor: "pointer",
    },
    back__button: {
      color: theme.palette.primary.light,
    },
    form__section: {
      // border: "0.875rem solid #F7F7FF",
      // borderRadius: "10px",
      padding: "0 3rem 0 3rem",
      [theme.breakpoints.down("sm")]: {
        padding: "1rem",
      },
      margin: "1rem 0",
      minWidth: "100%",
    },
    form__section1: {
      // border: "0.5rem solid #F7F7FF",
      // borderRadius: "10px",
      padding: "1rem 1.5rem",
      [theme.breakpoints.down("sm")]: {
        padding: "1rem",
      },
      margin: "1rem 0",
      minWidth: "100%",
    },
    multiline__label: {
      fontSize: theme.typography.pxToRem(13),
      paddingTop: theme.spacing(2),
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "start",
      height: "100%",
    },

    multiline__label1: {
      fontSize: theme.typography.pxToRem(13),
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "start",
      height: "50%",
    },
    tabsWrapper: {
      "& .ant-tabs-tab": {
        backgroundColor: "#E3E8F9 !important",
        color: "black !important",
        borderRadius: "0px",
      },
      "& .ant-tabs-tab-active": {
        backgroundColor: "#003566 !important",
      },
      "& .ant-tabs-tab-active div": {
        color: "white !important",
        fontWeight: "500",
      },
      "& .ant-tabs-card.ant-tabs-left >.ant-tabs-nav .ant-tabs-tab": {
        borderRadius: "0px 0px 0px 0px",
        marginBottom: "10px",
      },
    },

    previousButton: {
      fontSize: 14,
      fontWeight: 400,
      color: "#003566",
      background: "transparent",
      border: "1px solid #003566",
      marginRight: 8,
      "&:hover": {
        color: "white !important",
        background: "#003566 !important",
        border: "1px solid #003566 !important",
      },
    },
    uploadSection: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: theme.spacing(3),
      border: `1px dashed ${theme.palette.primary.main}`,
      backgroundColor: theme.palette.grey[100],
      cursor: "pointer",
      "&:hover": {
        backgroundColor: theme.palette.grey[200],
      },
    },
    colorFilledButton: {
      fontSize: 14,
      fontWeight: 400,
      color: "white",
      background: "#003566",
      border: "none",
      "&:hover": {
        color: "white !important",
        background: "#003566 !important",
      },
    },
    // label: {
    //   fontSize: theme.typography.pxToRem(13),
    //   display: "flex",
    //   justifyContent: "flex-start",
    //   alignItems: "center",
    //   height: "100%",
    // },
    // label1: {
    //   fontSize: theme.typography.pxToRem(13),
    //   display: "flex",
    //   justifyContent: "flex-start",
    //   alignItems: "center",
    //   height: "50%",
    // },
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
    right__section: {
      display: "none",
      [theme.breakpoints.up("md")]: {
        display: "block",
      },
    },
    fab__container: {
      zIndex: 1000,
      position: "fixed",
      right: 20,
      bottom: 30,
      display: "block",
      [theme.breakpoints.up("md")]: {
        display: "none",
      },
    },
    fab: {
      background: theme.palette.primary.light,
    },
    side__drawer: {
      width: "317px",
      padding: "1rem",
    },
    chips: {
      display: "flex",
      flexWrap: "wrap",
    },
    chip: {
      margin: 2,
    },
    input__style: {
      minHeight: 42,
      fontSize: "0.813rem",
      paddingInline: "0.5rem",
      borderRadius: "5px",
    },
    multiselect: {
      borderRadius: "5px",
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
    statusText: {
      fontWeight: "bold",
    },
    statusContainer: {
      fontSize: theme.typography.pxToRem(13),
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "center",
      height: "100%",
      // [theme.breakpoints.down("sm")]: {
      //   display: "none",
      // },
    },
    formTextPadding: {
      display: "flex",
      flexDirection: "row",
      paddingBottom: theme.typography.pxToRem(10),
      fontSize: theme.typography.pxToRem(14),
      color: "#003566",
    },
    formBox: {
      minWidth: "90%",
      paddingBottom: theme.typography.pxToRem(25),
    },
    asterisk: {
      color: "red",
      verticalAlign: "end",
    },
    label: {
      verticalAlign: "middle",
      fontSize: "14px",
      paddingLeft: "5px",
    },
    textField: {
      "& .MuiInputBase-root.Mui-disabled": {
        backgroundColor: "white", // Set your desired background color
        color: "black",
      },
    },
  })
);

export const Accordion = withStyles({
  root: {
    boxShadow: "none",
    borderRadius: "5px",
    overflow: "hidden",
    "&:not(:last-child)": {
      borderBottom: 0,
    },
    "&:before": {
      display: "none",
    },
    "&$expanded": {
      margin: "auto",
    },
  },
  expanded: {},
})(MuiAccordion);

export const AccordionSummary = withStyles((theme) => ({
  root: {
    backgroundColor: "#0E497A",
    marginBottom: -1,
    color: theme.textColor.white,
    fontSize: theme.typography.pxToRem(15),
    minHeight: 56,
    borderRadius: "5px",
    "&$expanded": {
      minHeight: 56,
    },
  },
  content: {
    "&$expanded": {
      margin: "12px 0",
    },
  },
  expanded: {},
}))(MuiAccordionSummary);

export const AccordionDetails = withStyles((theme) => ({
  root: {
    marginTop: -2,
    padding: theme.spacing(2),
    border: "1px solid rgba(104, 104, 104, 0.1)",
    borderRadius: "5px",
    boxShadow: theme.shadows[4],
  },
}))(MuiAccordionDetails);
