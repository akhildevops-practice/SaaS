import { makeStyles, createStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) =>
  createStyles({
    rootContainer: {
      padding: "10px 10px",
      maxWidth: "100vw",
      minheight: "100vh",
      // position: "relative",
      overflowX: "hidden",
    },
    rootscroll: {
      width: "100%",
      maxHeight: "100%",
      // maxHeight: "calc(80vh - 12vh)", // Adjust the max-height value as needed
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
    root: {
      width: "100%",
      maxHeight: "calc(76vh - 12vh)", // Adjust the max-height value as needed
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
    },
    topContainer: {
      marginTop: "10px",
      width: "100%",
    },
    topContainerItem: {
      width: "20px",
    },
    searchContainer: {
      marginTop: "25px",
      maxWidth: "100vw",
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
        borderBottom: `1px solid black`, // Customize the border-bottom color here
      },
      "& .ant-table-row.ant-table-row-level-1": {
        backgroundColor: "rgba(169,169,169, 0.1)",
      },
      "& .ant-table-thead .ant-table-cell": {
        padding: "8px 16px !important",
        backgroundColor: "#E8F3F9",
        color: "black",
      },

      [theme.breakpoints.down("xs")]: {
        "& .ant-table-row:first-child": {
          width: "100%",
        },
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
      },
    },
    locSearchBox: {
      width: "100%",
      [theme.breakpoints.down("sm")]: {
        marginTop: theme.typography.pxToRem(10),
      },
      '& .MuiOutlinedInput-root': {
        borderRadius: '16px',
      },
    },
    // Add this to override the styles
    inputRootOverride: {
      '& .MuiAutocomplete-inputRoot[class*="MuiOutlinedInput-root"][class*="MuiOutlinedInput-marginDense"]':
        {
          padding: "3px 0px 1px 3px !important"
        },
    },
  })
);

export default useStyles;
