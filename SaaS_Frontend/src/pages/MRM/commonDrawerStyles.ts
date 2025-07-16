import { makeStyles, Theme } from "@material-ui/core/styles";
// export interface StyleProps {
//   detailsDrawer: string;
// }

const useStyles = makeStyles((theme: Theme) => ({
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 1em",
    borderBottom: "1px solid #ddd",
    backgroundColor: "#f5f5f5",
    height: "50px",
    // add other styles...
  },

  commentsIcon: {
    fill: "#0E497A",
    cursor: "pointer",
    width: "28px",
    height: "37px",
    // marginRight: "30px",
  },
  drawer: {
    "& .ant-drawer-right>.ant-drawer-content-wrapper": {
      transform: "translateX(-4px) !important",
      // width: "600px !important",
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
      "& .ant-btn-default": {
        backgroundColor: "#e8f3f9",
        borderColor: "#0e497a",
        "& svg": {
          color: "#0e497a",
        },
      },
    },
  },
  customTooltip: {
    backgroundColor: "white",
    color: " #6e7dab !important",
    border: "1px solid black",
    padding: "8px",
  },
  tabsWrapper: {
    "& .ant-tabs-tab": {
      backgroundColor: "#e3e8f9 !important",
      color: "black !important",
    },
    "& .ant-tabs-tab-btn": {
      letterSpacing: "0.6px",
    },
    "& .ant-tabs-tab-active": {
      backgroundColor: "#003566 !important",
    },
    "& .ant-tabs-tab-active div": {
      color: "white !important",
      fontWeight: "500",
    },
  },
  docDetailsDrawer: {
    "& .ant-drawer-header": {
      backgroundColor: "aliceblue",
      textAlign: "center",
      padding: "10px 20px",
      borderBottom: "none",
    },
    // "& .ant-drawer-content": {
    borderBottomRightRadius: "10px",
    borderBottomLeftRadius: "10px",
    // },
  },
  starIcon: {
    color: "#FF0000",
    marginRight: "30px",
    width: "32px",
    height: "35px",
    cursor: "pointer",
  },
  disabledInput: {
    "& .ant-input[disabled], & .ant-input[disabled]:not([type='textarea'])": {
      // border: "none",
      backgroundColor: "white",
      color: "black",
    },
  },

  disabledSelect: {
    "& .ant-select-disabled .ant-select-selector": {
      backgroundColor: "white",
      background: "#F5F5F5 !important",
      color: "black",
      // border: "none",
    },
    "& .ant-select-disabled .ant-select-selection-item": {
      color: "black",
    },
    "& .ant-select-disabled .ant-select-arrow": {
      display: "none",
    },
  },
  disabledMuiSelect: {
    "& .Mui-disabled": {
      backgroundColor: "#F5F5F5 !important",
      color: "black",
      // border: "none",
      "& .MuiSelect-icon": {
        display: "none",
      },
    },
  },
  disabledTextField: {
    "& .MuiInputBase-root.Mui-disabled": {
      // border: "none",
      backgroundColor: "#F5F5F5 !important",
      color: "black",
    },
  },

  disabledMultiSelect: {
    "& .ant-select-disabled.ant-select-multiple .ant-select-selector": {
      backgroundColor: "#F5F5F5 !important",
      // border: "none",
    },
    "& .ant-select-disabled.ant-select-multiple .ant-select-selection-item": {
      color: "black",
      background: "#F5F5F5 !important",
    },
    "& .ant-select-disabled .ant-select-arrow": {
      display: "none",
    },
  },
  auditTrailIcon: {
    fill: "#0E497A",
    cursor: "pointer",
    width: "35px",
    height: "35px",
    marginRight: "30px",
  },
  docInfoIcon: {
    // marginRight: "30px",
    width: "30px",
    height: "35px",
    cursor: "pointer",
  },
  submitBtn: {
    backgroundColor: "#003566 !important",
    height: "36px",
  },
  cancelBtn: {
    height: "36px",
    "&.hover": {
      color: "#003566 !important  ",
    },
  },
  filename: {
    fontSize: theme.typography.pxToRem(12),
    color: theme.palette.primary.light,
    textOverflow: "ellipsis",
    overflow: "hidden",
    width: "160px",
    whiteSpace: "nowrap",
  },
  title: {
    fontSize: "20px",
    fontWeight: 500,
  },
  uploadSection: {
    width: "500px", // Adjust the width as needed
    height: "100px", // Adjust the height as needed

    padding: "20px", // Adjust the padding as needed
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    "& .ant-upload-list-item-name": {
      color: "blue !important",
    },
  },
  formBox: {
    marginTop: "15px",
  },
  root: {
    flexGrow: 1,
    maxWidth: 752,
    backgroundColor: "white",
    padding: "10px",
  },
  demo: {
    "& .MuiListItem-giutters": {
      paddinRight: "0px",
    },
    "& .MuiListItem-root": {
      paddingTop: "0px",
    },
  },
  scrollableList: {
    maxHeight: "200px", // Set the height according to your needs
    overflowY: "auto",
    "&::-webkit-scrollbar": {
      width: "10px",
      backgroundColor: "white",
    },
    "&::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "grey",
    },
  },
  //   header: {
  //     display: "flex",
  //     flexDirection: "column",
  //   },
  status: {
    display: "flex",
    justifyContent: "end",
  },
  text: {
    fontSize: "16px",
    marginRight: "10px",
    marginTop: "1%",
  },
  switch: {
    marginTop: "2%",
    // backgroundColor: '#003566 !important',
  },
  expandIcon: {
    marginRight: "30px",
    width: "22px",
    height: "36px",
    cursor: "pointer",
  },
}));

export default useStyles;
