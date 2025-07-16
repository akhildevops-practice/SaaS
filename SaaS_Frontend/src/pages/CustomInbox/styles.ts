import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "120vh",
    fontFamily: "IBM Plex Sans",
    fontSize: theme.typography.pxToRem(16),
    display: "inline-flex",
    height: "120vh",
  },
  descriptionItemStyle: {
    "& .ant-descriptions-item-label": {
      color: "#003566 !important",
      fontWeight: "bold",
      letterSpacing: "0.8px",
      // Add any other styles you want to apply to the label inside Descriptions.Item
    },
  },
  paper: {
    backgroundColor: "#FFFFFF",
    borderRadius: theme.typography.pxToRem(10),
    height: "100%",
    width: "1000%",
  },
  btn: {
    marginBottom: theme.typography.pxToRem(10),
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
  },
  container: {
    backgroundColor: theme.palette.background.paper,
    overflow: "hidden",
    overflowY: "scroll",
    marginTop: "7px",
    maxHeight: "760px",
    display: "block",
    // border: "10px solid #f7f7ff",
    borderRadius: "8px",
    padding: 0,
  },
  topSection: {
    display: "flex",
    justifyContent: "space-between",
    width: 300,
  },
  textSection: {
    fontSize: theme.typography.pxToRem(16),
    [theme.breakpoints.up("sm")]: {
      fontSize: theme.typography.pxToRem(16),
    },
    [theme.breakpoints.down("xs")]: {
      width: 500,
    },
  },
  loader: {
    height: "60vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  topSectionLeft: {
    marginRight: 30,
    width: "100%",
    paddingLeft: "5px",
  },
  locSearchBox: {
    width: "175px",
    textAlign: "left",
    margin: theme.typography.pxToRem(10),
  },
  searchBoxText: {
    margin: theme.typography.pxToRem(10),
    fontSize: theme.typography.pxToRem(17),
  },
  listContainer: {
    width: "250px",
    marginTop: "10px",
    maxHeight: "760px",
    height: "100%",
    display: "block",
    overflowY: "scroll",
    overflowX: "hidden",
    border: "10px solid #f7f7ff",
    borderRadius: "5px",
    paddingRight: 100,
  },

  singleListItem: {
    padding: "10px",
    borderBottom: "0.02px #999999 solid",
  },

  accordionStyle: {
    paddingLeft: theme.typography.pxToRem(16),
    paddingBottom: theme.typography.pxToRem(8),
  },

  inboxGridContainer: {
    position: "absolute",
    top: 90,
    right: 20,
  },

  docWrapperContainer: {
    paddingLeft: theme.typography.pxToRem(20),
    top: 0,
  },

  divider: {
    position: "relative",
    minWidth: "2px",
    maxwidth: "2px",
    backgroundColor: "#000",
    display: "inline-block",
  },

  loading: {
    display: "flex",
    justifyContent: "center",
    marginTop: "100%",
  },

  resizeStyle: {
    width: "20px",
    height: "1000",
    borderLeft: "5px solid rgba(255, 255, 255, 0)",
    borderRight: "20px solid rgba(255, 255, 255, 0)",
    cursor: "col-resize",
    background: "black",
    opacity: 0.2,
    zIndex: 1,
    MozBoxSizing: "border-box",
    WebkitBoxSizing: "border-box",
    boxSizing: "border-box",
    MozBackgroundClip: "padding",
    WebkitBackgroundClip: "padding",
    backgroundClip: "padding-box",
  },

  tableContainer: {
    "& .ant-table-container": {
      overflowX: "auto",// Ensure scrolling is available on small screens
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
      fontWeight: 600,
      fontSize: "14px",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      position: "sticky",
      top: 0,
      zIndex: 10,
      padding: "6px 8px !important",
      lineHeight: "24px",
    },
    "& .ant-table-wrapper .ant-table-thead > tr > th:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before, .ant-table-wrapper .ant-table-thead > tr > td:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before":
    {
      backgroundColor: "#e9e9e9",
    },

    "& tr.ant-table-row": {
      borderRadius: 5,
      "&:hover": {
        "& td.ant-table-cell": {
          backgroundColor: "white !important",
        },
      },
    },

    "& .ant-table-fixed-right, .ant-table-fixed-left": {
      overflow: "hidden !important", // Hide the overflow in fixed columns
    },

    // Add this to ensure the fixed column cell doesn't overlap the sticky header
    "& .ant-table-fixed-right .ant-table-cell, .ant-table-fixed-left .ant-table-cell":
    {
      borderTop: "1px solid #f0f0f0", // Same color as your table borders
    },

    "& .ant-table-tbody >tr >td": {
      borderInlineEnd: "none",
      verticalAlign: "top !important",
      borderBottom: `1px solid #f0f0f0`, // Customize the border-bottom color here
    },
    "& .ant-table-row.ant-table-row-level-1": {
      backgroundColor: "rgba(169,169,169, 0.1)",
    },
    "& .ant-table-thead .ant-table-cell": {
      backgroundColor: "#E8F3F9",
      color: "#00224E",
    },

    [theme.breakpoints.down("xs")]: {
      "& .ant-table-row:first-child": {
        width: "100%",
      },
    },
  },
  descriptionLabelStyle: {
    width: "90%",
    marginBottom: "5px",
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
  disabledInput: {
    "& .ant-input[disabled]": {
      border: "none",
      backgroundColor: "white",
      color: "black",
    },
  },

  disabledSelect: {
    "& .ant-select-disabled .ant-select-selector": {
      backgroundColor: "white !important",
      background: "white !important",
      color: "black",
      border: "none",
    },
    "& .ant-select-disabled .ant-select-selection-item": {
      color: "black",
    },
    "& .ant-select-disabled .ant-select-arrow": {
      display: "none",
    },
  },
  pagination: {
    position: 'fixed',
    bottom: '3px',
    right: '5px',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'inherit',
    padding: theme.spacing(1),
  },
}));

export default useStyles;
