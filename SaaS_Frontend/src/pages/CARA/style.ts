import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles<Theme>((theme: Theme) => ({
  root: {
    overflowY: "hidden",
    height: "100vh",
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
  modalCloseIcon: {
    "&.custom-modal .ant-modal-close": {
      display: "none",
    },
  },
}));

export default useStyles;
