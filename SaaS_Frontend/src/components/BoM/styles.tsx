import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  panelHeader: {
    backgroundColor: "#f0f0f0", // Default background color
    color: "white", // Text color for the header
    padding: "10px", // Padding for the header
    fontWeight: "bold", // Make text bold
    borderRadius: "8px", // Apply border radius
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    transition: "background-color 0.3s",
    "& .ant-collapse-header": {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      paddingRight: "10px",
    },

    // Target the collapse expand icon inside the header
    "& .ant-collapse-expand-icon": {
      height: "22px",
      display: "flex",
      alignItems: "center",
      paddingInlineEnd: "3px",
    },

    // Optional: Add hover effect for the header
    "&:hover": {
      backgroundColor: "#e0e0e0", // Change background on hover
    },
  },
  uploadWrapper: {
    "& .ant-upload.ant-upload-select": {
      height: "auto !important",
      minHeight: "40px",
    },
    "& .ant-upload-wrapper .ant-upload-picture-card .ant-avatar": {
      width: "40px !important",
      height: "40px !important",
    },
    "& .ant-upload-wrapper .ant-upload-text": {
      fontSize: "12px !important",
    },
  },
  scrollableSection: {
    maxHeight: "500px", // Set max height for scrollable area
    overflowY: "auto", // Enable vertical scrolling
    marginTop: "16px", // Add space before the scrollable area
  },
  tableContainer: {
    // Table Header Styles
    // "& .ant-table-thead > tr > th": {
    //   backgroundColor: "#E8F3F9", // Set the table header background color to yellow
    // },
    "& .ant-table-thead .ant-table-cell": {
      // backgroundColor: ({ headerBgColor }) => headerBgColor,
      // color: ({ tableColor }) => tableColor,
      backgroundColor: "#E8F3F9",
      borderBottom: "1px solid #003059",
      padding: "4px 12px",
      // fontFamily: "Poppins !important",
      color: "#00224E",
    },
    // Table Body Styles
    "& .ant-table-tbody > tr > td": {
      // border: "0.5px solid #E6E8EA", // Add a border around each table body cell
      padding: "2px 12px", // Adjust the padding as needed
      height: "50px", // Set the height of the table cells
    },
    // "& tr.ant-table-row:nth-child(odd)": {
    //   backgroundColor: "#F5F5F5", // Odd row color
    // },
    // "& tr.ant-table-row:nth-child(even)": {
    //   backgroundColor: "#FFFFFF", // Even row color
    // },
  },
  uploadIcon: {
    fontSize: "24px",
  },
  uploadText: {
    fontSize: "14px",
  },
  panelHeaderHovered: {
    backgroundColor: "#e0e0e0", // Hover background color
  },
  tableWrapper: {
    maxHeight: "400px", // Set a maximum height
    overflowY: "auto", // Add vertical scrollbar
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    marginBottom: "8px",
  },
  listText: {
    flex: 1,
  },
  formItem: {
    marginBottom: "8px !important", // Reduce the bottom margin of the form items
  },
  colPadding: {
    padding: "0 !important", // Remove padding for the columns
  },
  selectWrapper: {
    display: "flex",
    alignItems: "center",
  },
}));

export default useStyles;
