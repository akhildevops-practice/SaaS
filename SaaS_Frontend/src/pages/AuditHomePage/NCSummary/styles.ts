import { makeStyles, createStyles } from "@material-ui/core";
// import { withStyles } from "@material-ui/core/styles";
// import MuiAccordion from "@material-ui/core/Accordion";
// import MuiAccordionSummary from "@material-ui/core/AccordionSummary";
// import MuiAccordionDetails from "@material-ui/core/AccordionDetails";

const useStyles = makeStyles((theme) =>
  createStyles({
    rootContainer: {
      // padding: "0px 10px",
      maxWidth: "100vw",
      minheight: "100vh",
      // position: "relative",
      overflowX: "scroll",
    },
    app: {
      textAlign: "center",
      marginTop: 20,
      whiteSpace: "pre-wrap",
      wordWrap: "break-word",
      height: "400px", // Fixed height of the modal content area
      overflowY: "auto",
    },
    questionBlock: {
      margin: "20px auto",
      padding: 20,
      border: "1px solid #ccc",
      borderRadius: 8,
      maxWidth: 600,
    },
    formControl: {
      marginBottom: 15,
    },
    botModal: {
      "& .ant-modal-content": {
        padding: "10px !important",
      },
      "& .ant-modal-close": {
        top: "2px !important",
        insetInlineEnd: "8px !important",
      },
      "& .ant-modal-body": {
        marginRight: "20px !important",
        padding: "10px !important",
      },
    },
    locSearchBox: {
      width: "100%",
      [theme.breakpoints.down("sm")]: {
        marginTop: theme.typography.pxToRem(10),
      },
      "& .MuiOutlinedInput-root": {
        // borderRadius: "16px",
      },
    },
    // Add this to override the styles
    inputRootOverride: {
      border: "1px solid black",
      borderRadius: "5px",
      '& .MuiAutocomplete-inputRoot[class*="MuiOutlinedInput-root"][class*="MuiOutlinedInput-marginDense"]':
        {
          // padding: "3px 0px 1px 3px !important",
        },
    },
    textField: {
      fontSize: "14px",
      fontWeight: 600,
      "& .MuiOutlinedInput-root": {
        backgroundColor: "white",
        // borderRadius: "20px",
        // color: "black",
        fontSize: "14px",
        // fontWeight: 600,
        // border: "1px solid black",
      },
      "& .MuiOutlinedInput-notchedOutline": {
        // borderRadius: "20px",
      },
      "& .MuiSvgIcon-root": {
        color: "black", // Change icon color
      },
    },
    textField2: {
      fontSize: "14px",
      fontWeight: 600,
      "& .MuiOutlinedInput-root": {
        backgroundColor: "white",
        // borderRadius: "20px",
        // color: "black",
        // border: "1px solid  black",
        fontSize: "14px",
        // fontWeight: 600,
      },
      "& .MuiOutlinedInput-notchedOutline": {
        // borderRadius: "20px",
      },
      "& .MuiSvgIcon-root": {
        color: "black", // Change icon color
      },
    },
    tag: {
      display: "inline-block",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      maxWidth: "100px", // Adjust the max-width as needed
    },
    tagContainer: {
      display: "flex",
      flexDirection: "row",
    },
    hiddenTags: {
      display: "none",
    },
    root: {
      width: "100%",
      padding: "60px 16px 16px 16px",
      maxHeight: "calc(100vh - 25vh)", // Adjust the max-height value as needed
      overflowY: "auto",
      overflowX: "hidden",
      "&::-webkit-scrollbar": {
        width: "8px",
        height: "10px", // Adjust the height value as needed
        backgroundColor: "#e5e4e2",
      },
      "&::-webkit-scrollbar-thumb": {
        borderRadius: "10px",
        backgroundColor: "grey",
      },
    },
    topContainer: {
      marginTop: "25px",
      width: "100%",
    },
    topContainerItem: {
      width: "20px",
    },
    searchContainer: {
      // marginTop: "25px",
      maxWidth: "95vw",
      height: "45px",
    },
    link: {
      color: theme.palette.primary.main,
    },
    red__exclamation: { color: theme.palette.error.main },
    filterButtonContainer: {
      [theme.breakpoints.down("xs")]: {
        position: "fixed",
        bottom: theme.typography.pxToRem(50),
        right: theme.typography.pxToRem(20),
      },
    },
    fabButton: {
      backgroundColor: theme.palette.primary.light,
      color: "#fff",
      margin: "0 5px",
      "&:hover": {
        backgroundColor: theme.palette.primary.main,
      },
    },
    pagination: {
      position: "fixed",
      bottom: "3px",
      right: "0",
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
      backgroundColor: "inherit",
      padding: theme.spacing(1),
    },
    tabWrapper: {
      backgroundColor: "#efefef",
      boxShadow: "-3px 1px 4px 2px rgba(0,0,0,0.15)",
      "& .MuiTabs-root": {
        height: "36px",
        minHeight: "36px",
      },
      "& .MuiTab-root": {
        padding: 0,
        minWidth: "auto",
      },
      "& .MuiTab-wrapper": {
        display: "flex",
        flexDirection: "row",
        // justifyContent: "space-evenly",
        paddingBottom: "14px",
      },
      "& .MuiTabs-indicator": {
        color: "#334D6E",
      },
      "& .PrivateTabIndicator-colorPrimary-57": {
        backgroundColor: "#334D6E",
      },
    },
    docNavIconStyle: {
      width: "27px",
      height: "26px",
      // paddingRight: "6px",
      cursor: "pointer",
    },
    docNavText: {
      // fontFamily: "Poppins",
      fontWeight: 600,
      fontSize: "14px",
      letterSpacing: "0.3px",
      lineHeight: "24px",
      // color: "#000",
      marginLeft: "5px",
    },
    docNavDivider: {
      top: "0.54em",
      height: "1.5em",
      background: "black",
    },
    selectedTab: {
      color: "#334D6E",
    },
    tableContainer: {
      "& .ant-table-container": {
        // overflowX: "auto",
        marginTop: "2%",
        overflowY: "hidden",
        "& span.ant-table-column-sorter-inner": {
          color: "#380036",
        },
        "&::-webkit-scrollbar": {
          width: "5px",
          height: "10px", // Adjust the height value as needed
          backgroundColor: "white",
        },
        "&::-webkit-scrollbar-thumb": {
          borderRadius: "10px",
          backgroundColor: "grey",
        },
      },
      "& .ant-table-wrapper .ant-table-thead>tr>th": {
        padding: "8px 16px !important",
        fontWeight: 500,
        fontSize: "13px",
        backgroundColor: "#E8F3F9",
      },
      "& .ant-table-cell": {
        // backgroundColor : '#f7f7ff'
      },
      "& .ant-table-wrapper .ant-table-thead > tr > th:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before, .ant-table-wrapper .ant-table-thead > tr > td:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before":
        {
          backgroundColor: "black",
        },

      "& tr.ant-table-row": {
        borderRadius: 5,
        cursor: "pointer",
        transition: "all 0.1s linear",

        "&:hover": {
          backgroundColor: "white !important",
          boxShadow: "0 1px 5px 0px #0003",
          transform: "scale(1.01)",

          "& td.ant-table-cell": {
            backgroundColor: "white !important",
          },
        },
      },
      "& .ant-table-tbody >tr >td": {
        borderBottom: `1px solid #f0f0f0`, // Customize the border-bottom color here
      },
      "& .ant-table-row.ant-table-row-level-1": {
        backgroundColor: "rgba(169,169,169, 0.1)",
      },
      "& .ant-table-thead .ant-table-cell": {
        padding: "8px 16px !important",
        backgroundColor: "#E8F3F9",
        borderBottom: "1px solid #003059",
        color: "#00224E",
      },

      [theme.breakpoints.down("xs")]: {
        "& .ant-table-row:first-child": {
          width: "100%",
        },
      },
    },
    newTableContainer: {
      marginTop: "1%",
      // fontFamily: "Poppins !important",
      "& .ant-table-wrapper .ant-table.ant-table-bordered > .ant-table-container > .ant-table-summary > table > tfoot > tr > td":
        {
          borderInlineEnd: "none",
        },

      // overflowY: "hidden",
      // overflowX: "hidden !important",
      "& .ant-table-thead .ant-table-cell": {
        // backgroundColor: ({ headerBgColor }) => headerBgColor,
        // color: ({ tableColor }) => tableColor,
        backgroundColor: "#E8F3F9",
        padding: "4px 8px !important",
        // fontFamily: "Poppins !important",
        color: "#00224E",
      },
      "& span.ant-table-column-sorter-inner": {
        color: "#00224E",
        // color: ({ iconColor }) => iconColor,
      },
      "& span.ant-tag": {
        display: "flex",
        width: "105px",
        padding: "5px 0px",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: "10px",
        color: "white",
        letterSpacing: "0.5px",
      },
      // "& .ant-table-wrapper .ant-table-thead>tr>th": {
      //   position: "sticky", // Add these two properties
      //   top: 0, // Add these two properties
      //   zIndex: 2,
      //   // padding: "12px 16px",
      //   fontWeight: 600,
      //   fontSize: "14px",
      //   padding: "4px 10px !important",
      //   // fontFamily: "Poppins !important",
      //   lineHeight: "24px",
      // },

      "& .ant-table-tbody >tr >td": {
        // borderBottom: ({ tableColor }) => `1px solid ${tableColor}`, // Customize the border-bottom color here
        borderBottom: "1px solid #f0f0f0",
        padding: "4px 8px !important",
      },
      "& .ant-table-wrapper .ant-table-container": {
        maxHeight: "420px",
        overflowY: "auto",
        overflowX: "auto",
      },
      "& .ant-table-body": {
        maxHeight: "150px", // Adjust the max-height value as needed
        overflowY: "auto",
        // overflowX: "scroll",
        "&::-webkit-scrollbar": {
          width: "8px",
          height: "10px", // Adjust the height value as needed
          backgroundColor: "#e5e4e2",
        },
        "&::-webkit-scrollbar-thumb": {
          borderRadius: "10px",
          backgroundColor: "grey",
        },
      },
      "& tr.ant-table-row": {
        // borderRadius: 5,
        cursor: "pointer",
        transition: "all 0.1s linear",

        "&:hover": {
          backgroundColor: "white !important",
          boxShadow: "0 1px 5px 0px #0003",
          transform: "scale(1.01)",

          "& td.ant-table-cell": {
            backgroundColor: "white !important",
          },
        },
      },
      "& .ant-table-wrapper .ant-table-content  .ant-table-thead>tr>th": {
        padding: "4px 10px !important",
      },
    },
    subTableContainer: {
      "& .ant-table-container": {
        backgroundColor: "white !important",
        // overflowX: "auto",

        // overflow: 'hidden',
        overflowY: "auto",

        "& span.ant-table-column-sorter-inner": {
          color: "#380036",
          backgroundColor: "white !important",
        },
      },
      "& .ant-table-wrapper .ant-table-thead>tr>th": {
        padding: "12px 16px",
        fontWeight: 600,
        fontSize: "14px",
        // backgroundColor: 'black !important',
      },
      "& .ant-table-cell": {
        // backgroundColor : '#f7f7ff'
      },
      "& .ant-table-wrapper .ant-table-thead > tr > th:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before, .ant-table-wrapper .ant-table-thead > tr > td:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before":
        {
          backgroundColor: "black",
        },

      "& tr.ant-table-row": {
        borderRadius: 5,
        cursor: "pointer",
        transition: "all 0.1s linear",
      },
      "& .ant-table-tbody >tr >td": {
        borderBottom: `1px solid black`,
        // Customize the border-bottom color here
        backgroundColor: "white !important",
      },
      "& .ant-table-row.ant-table-row-level-1": {
        backgroundColor: "rgba(169,169,169, 0.1)",
      },
      "& .ant-table-thead .ant-table-cell": {
        backgroundColor: "rgb(239, 239, 239) !important",
        color: "black",
        borderBottom: "1px solid #003059",
      },
    },
    button__group: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
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
      },
      "& .ant-tabs-tab-active": {
        backgroundColor: "#003566 !important",
      },
      "& .ant-tabs-tab-active div": {
        color: "white !important",
        fontWeight: "500",
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
    buttongroup: {
      display: "flex",
      fontSize: "10px",
    },

    button_left: {
      // borderRadius: "25px",
      padding: "3px 20px",
      fontSize: "10px",
    },
    button_right: {
      // borderRadius: "25px",
      padding: "3px 20px",
      fontSize: "10px",
    },

    button_center: {
      // width: "100px",
      // height: "100px",
      // border: "1px solid black",
      borderRadius: "50%",

      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "10px",
    },
  })
);

export default useStyles;
