import { makeStyles } from "@material-ui/core/styles";

const useStyles2 = makeStyles((theme) => ({
  root: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F8F9F9",
    "& .where(.css-dev-only-do-not-override-htwhyh).ant-card .ant-card-body": {
      padding: "0px",
    },
  },
  table: {
    width: "560px",
  },
  firstDiv: {
    width: "99%",
    margin: "auto",
    height: "55px",
    padding: "10px",
    backgroundColor: "#fff",

    // boxShadow:"0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 8px 0 rgba(0, 0, 0, 0.19)",
  },
  secondDiv: {
    width: "20%",
    height: "100%",
  },
  threeDiv: {
    width: "100%",
    margin: "auto",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    backgroundColor: "#F8F9F9",
  },
  cardDiv: {
    width: "213px",
    height: "80px",
  },
  paperStyle: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "visible",
    width: "30%",
  },
  btnSection: {
    paddingTop: theme.typography.pxToRem(20),
    // paddingRight: theme.typography.pxToRem(50),
    // paddingBottom: theme.typography.pxToRem(10),
    display: "flex",
    justifyContent: "flex-end",
  },
  content: {
    // paddingTop: theme.typography.pxToRem(10),
    // paddingRight: theme.typography.pxToRem(0),
    // padding: "20px 30px 20px 30px",
  },
  title: {
    marginTop: theme.typography.pxToRem(10),
    marginLeft: theme.typography.pxToRem(15),
    color: "black",
    fontSize: "16px",
    fontWeight: 600,
  },
  topFilterCount: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  navTopArea: {
    width: "auto",
    display: "flex",
    justifyContent: "flex-start",
    backgroundColor: "#e8f3f9",
    borderRadius: "2px 2px 0 0",
    borderBottom: "2px solid #EFEFEF",
  },
  subCard: {
    width: "100%",
    height: "100%",
  },
  subCardTwo: {
    width: "100%",
    height: "90px",
  },
  iconAction: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    paddingLeft: "10px",
    paddingRight: "10px",
    cursor: "pointer",
    paddingBottom: "7px",
    width: "100px",
  },
  descriptionLabelStyle: {
    "& .ant-descriptions-item-label": {
      color: "#003566 !important",
      fontWeight: "bold",
      letterSpacing: "0.8px",
      // Add any other styles you want to apply to the label inside Descriptions.Item
    },
    "& .ant-form-item .ant-form-item-label > label": {
      color: "#003566",
      fontWeight: "bold",
      letterSpacing: "0.8px",
      // Add any other styles you want to apply to the label inside Form.Item
    },
    "& .ant-input-lg": {
      border: "1px solid #dadada",
    },
  },
  pagination: {
    // position: "fixed",
    // bottom: "3px",
    right: "0",
    display: "flex",
    justifyContent: "flex-end",
    fontSize: "12px",
    alignItems: "center",
    // backgroundColor: "inherit",
    padding: "5px",
  },
  buttonContainer: {
    display: "flex",
    gap: "7px",
    width: "150px",
    height: "35px",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
  },
  buttonContainerActive: {
    display: "flex",
    gap: "7px",
    backgroundColor: "rgb(53, 118, 186)",
    color: "#ffff",
    width: "150px",
    height: "35px",
    borderRadius: "5px",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
  },
  buttonTabContainer: {
    display: "flex",
    gap: "7px",
    width: "150px",
    height: "40px",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    border: "1px solid grey",
    borderRadius: "5px 5px 0px 0px",
  },
  buttonTabContainerActive: {
    display: "flex",
    gap: "7px",
    backgroundColor: "#003566 !important",
    color: "#ffff",
    width: "150px",
    height: "40px",
    borderRadius: "5px 5px 0px 0px",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
  },
  buttonsMainContainer: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0px 0px 0px 0px",
  },
  buttonsSubContainer: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    padding: "10px 0px 10px 0px",
  },
  documentTable: {
    "&::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "grey",
    },
  },
  subTableContainer: {
    margin: "10px 0px",
    "& span.ant-table-column-sorter-inner": {
      color: "#380036",
      backgroundColor: "white !important",
    },
  },
  tableContainer: {
    marginTop: "1%",
    maxHeight: "calc(80vh - 14vh)", // Adjust the max-height value as needed
    // overflowY: "scroll",
    // overflowX: "scroll",
    // scrollbarWidth: "thin", // For Firefox
    borderRadius: "8px",
    // "&::-webkit-scrollbar": {
    //   width: "12px",
    // },
    // "&::-webkit-scrollbar-thumb": {
    //   backgroundColor: "darky",
    //   borderRadius: "6px",
    // },
    // "&::-webkit-scrollbar-track": {
    //   backgroundColor: "lightgrey",
    //   borderRadius: "6px",
    // },

    // fontFamily: "Poppins !important",
    "&.ant-table-container": {
      overflowX: "auto",
      "& span.ant-table-column-sorter-inner": {
        color: "#380036",
        // color: ({ iconColor }) => iconColor,
      },
      "&::-webkit-scrollbar": {
        width: "5px",
        height: "10px",
        backgroundColor: "white",
      },
      "&::-webkit-scrollbar-thumb": {
        borderRadius: "10px",
        backgroundColor: "grey",
      },
    },
    "& .ant-table-wrapper .ant-table.ant-table-bordered > .ant-table-container > .ant-table-summary > table > tfoot > tr > td":
      {
        borderInlineEnd: "none",
      },
    "& .ant-table-thead .ant-table-cell": {
      backgroundColor: "#E8F3F9",
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
      borderBottom: "black",
      padding: "4px 8px !important",
    },
    // '& .ant-table-wrapper .ant-table-container': {
    //     maxHeight: '420px', // Adjust the max-height value as needed
    //     overflowY: 'auto',
    //     overflowX: 'hidden',
    // },
    "& .ant-table-body": {
      // maxHeight: '150px', // Adjust the max-height value as needed
      // overflowX: 'auto',
      "&::-webkit-scrollbar": {
        width: "5px",
        height: "10px", // Adjust the height value as needed
        backgroundColor: "#e5e4e2",
      },
      "&::-webkit-scrollbar-thumb": {
        borderRadius: "10px",
        backgroundColor: "grey",
      },
    },
    "& tr.ant-table-row": {
      cursor: "pointer",
      transition: "all 0.1s linear",
    },
  },
  DropDwonScroll: {
    maxHeight: "180px",
    overflowY: "scroll",
    borderRadius: "5px",
    boxShadow:
      "0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)",
    backgroundColor: "#ffffff",
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
  iconButton: {
    paddingLeft: "1rem",
  },
}));

export default useStyles2;
