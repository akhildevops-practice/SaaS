import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles<Theme>((theme: Theme) => ({
  root: {
    overflowY: "hidden",
    height: "100vh",
  },
  actionButtonStyle: {
    minWidth: 10,
    padding: "4px",
    color: "black",
  },
  drawer: {
    "& .ant-drawer-right>.ant-drawer-content-wrapper": {
      transform: "translateX(-4px) !important",
      width: "400px !important",
      // transform : ({detailsDrawer}) => detailsDrawer ? "translateX(0px) !important" : "none"
    },
    "& .ant-drawer-wrapper-body": {
      // backgroundColor : "#F0F8FF !important"
    },
    "& .ant-drawer-header": {
      backgroundColor: "#e8f3f9",
      borderBottom: "1px solid rgb(0,0,0,0.20)",
      padding: "10px 7px",
      "& .ant-drawer-header-title .anticon anticon-close": {
        color: "white",
      },
      "&.ant-drawer-title": {
        fontWeight: 600,
        fontSize: "16px",
      },
      "& .ant-btn-default": {
        backgroundColor: "#e8f3f9",
        borderColor: "#0e497a",
        "& svg": {
          color: "#0e497a",
        },
      },
    },
  },
  tableContainer: {
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
      borderBottom: "1px solid #003059",
      // fontFamily: "Poppins !important",
      color: "#00224E",
    },
    "& span.ant-table-column-sorter-inner": {
      color: "#00224E",
      // color: ({ iconColor }) => iconColor,
    },
    "& span.ant-tag": {
      display: "flex",
      width: "89px",
      padding: "5px 0px",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: "10px",
      color: "white",
    },
    "& .ant-table-wrapper .ant-table-thead>tr>th": {
      position: "sticky", // Add these two properties
      top: 0, // Add these two properties
      zIndex: 2,

      // padding: "12px 16px",
      fontWeight: 600,
      fontSize: "14px",
      padding: "6px 8px !important",
      // fontFamily: "Poppins !important",
      lineHeight: "24px",
    },
    "& .ant-table-tbody >tr >td": {
      // borderBottom: ({ tableColor }) => `1px solid ${tableColor}`, // Customize the border-bottom color here
      borderBottom: "1px solid #f0f0f0",
      padding: "4px 8px !important",
    },
    "& .ant-table-wrapper .ant-table-container": {
      maxHeight: ({
        isGraphSectionVisible,
      }: {
        isGraphSectionVisible: boolean;
      }) => (isGraphSectionVisible ? "25vh" : "65vh"), // Adjust the max-height value as needed
      // [theme.breakpoints.up("lg")]: {
      //   maxHeight: ({
      //     isGraphSectionVisible,
      //   }: {
      //     isGraphSectionVisible: boolean;
      //   }) => (isGraphSectionVisible ? "33vh" : "65vh"), // Adjust the max-height value as needed for large screens
      // },
      [theme.breakpoints.up("xl")]: {
        maxHeight: ({
          isGraphSectionVisible,
        }: {
          isGraphSectionVisible: boolean;
        }) => (isGraphSectionVisible ? "45vh" : "70vh"), // Adjust the max-height value as needed for extra large screens
      },
      overflowY: "auto",
      overflowX: "hidden",
    },
    "& .ant-table-body": {
      maxHeight: "150px", // Adjust the max-height value as needed
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
  },
  tabWrapper: {
    // backgroundColor: "#efefef",
    // boxShadow: "-3px 1px 4px 2px rgba(0,0,0,0.15)",
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

  textIconContainer: {},

  docNavIconStyle: {
    width: "21px",
    height: "22px",
    // fill : "white",
    // paddingRight: "6px",
    cursor: "pointer",
  },
  docNavDivider: {
    top: "0.54em",
    height: "1.5em",
    background: "black",
  },
  docNavText: {
    fontSize: "16px",
    letterSpacing: "0.3px",
    lineHeight: "24px",
    textTransform: "capitalize",
    marginLeft: "5px",
  },
  docNavRightFlexBox: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
  },
  docNavInnerFlexBox: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: "6px 4px",
    "& .ant-input": {
      background: "#E8F3F9 !important",
    },
  },
  divderRightSide: {
    top: "0.1em",
    height: "1.5em",
    background: "gainsboro",
  },
  docNavTextRightSide: {
    // fontFamily: "Poppins",
    fontWeight: 500,
    fontSize: "14px",
    lineHeight: "24px",
    color: "#000000 ",
    paddingLeft: "5px",
  },
  graphContainer: {
    boxShadow: "0px 7px 9px 5px rgba(0,0,0,0.1)",
    // height: "155px",
    borderRadius: "15px 15px 15px 15px",
  },
  graphTitleBox: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: "28px",
    padding: "2px",
    // minHeight: "30px",
    fontWeight: 700,
    fontSize: "14px",
    lineHeight: "24px",
    color: "#000000 ",
    borderRadius: "15px 15px 0px 0px",
    // background: "#FFF",
    boxShadow: "-2px 3px 3px 0px rgba(0, 0, 0, 0.15)",
    letterSpacing: "0.4px",
  },
  graphGridContainer: {
    paddingTop: "6px !important",
    paddingBottom: "6px !important",
    height: "260px",
    // paddingLeft: "20px",
    // paddingRight: "22px",
  },
  graphBox: {
    height: "250px", // Update this line to increase the height to 250px
    width: "100%",
    // width: 448,
    borderRadius: 15,
    border: "1px solid #f3f0f0",
    boxShadow: "5px 5px 10px 0px rgba(0, 0, 0, 0.15)",
    // backgroundColor: "#ADD8E6", // Add a background color to see the boxes (use a color according to your design)
    // Applying 'left' and 'top' doesn't make sense in this context.
    // 'left' and 'top' are usually used for positioning elements absolutely.
    // In a grid system, the placement is handled by the grid itself.
    [theme.breakpoints.down("sm")]: {
      width: "100%", // You can make boxes responsive by setting their width to 100% on smaller screens
    },
  },
  graphSection: {
    transition: "max-height 0.3s ease-out, opacity 0.2s ease-out",
    overflow: "hidden",
    maxHeight: "500px", // You can set this to a max height that your content won't exceed
    opacity: 1,
  },

  collapsed: {
    maxHeight: 0,
    opacity: 0,
  },
  selectedTab: {
    color: "#334D6E",
  },
  header: {
    display: "flex",
    alignItems: "center",
  },
  moduleHeader: {
    color: "#000",
    fontSize: "24px",
    // fontFamily: "Poppins, sans-serif",
    lineHeight: "24px",
    paddingLeft: "6px",
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
}));

export default useStyles;
