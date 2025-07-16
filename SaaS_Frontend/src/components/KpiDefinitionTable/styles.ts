import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  colName: {
    fontSize: "0.9rem",
    fontWeight: 600,
    padding: 5,
    maxWidth: "100px",
    textAlign: "center",
  },
  inputBase: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #000",
    borderRadius: "4px",
    // paddingLeft: "30px",
    height: "40px",
    fontSize: "0.9rem",
    textAlign: "center",
    "& .MuiInputBase-root": {
      textAlign: "center",
    },
    "& .MuiInputBase-input": {
      textAlign: "center",
    },
  },
  rangeInputBase: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #000",
    borderRadius: "4px",
    // paddingLeft: "30px",
    height: "40px",
    fontSize: "0.9rem",
    textAlign: "center",
    "& .MuiInputBase-root": {
      textAlign: "center",
    },
    "& .MuiInputBase-input": {
      textAlign: "center",
    },
  },
  row: {
    borderBottom: "1px solid #ddd",

    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  bodyCell: {
    fontSize: "0.85rem",
    padding: "7px",
    width: "30px",
    whiteSpace: "normal",
  },
  tableContainer: {
    "& .MuiTableCell-head": {
      backgroundColor: "#E8F3F9",
      borderBottom: "1px solid #003059",
      color: "#00224E",
      fontWeight: 600,
      fontSize: "14px",
      padding: "6px 8px !important",
      position: "sticky",
      top: 0,
      zIndex: 2,
    },
    "& .MuiTableCell-body": {
      borderBottom: "1px solid #f0f0f0",
      padding: "4px 8px !important",
    },
    "& .MuiTableSortLabel-root": {
      color: "#00224E",
    },
    "& .MuiChip-root": {
      display: "flex",
      width: "89px",
      padding: "5px 0px",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: "10px",
      color: "white",
    },
    "& .MuiTableBody-root": {
      maxHeight: "150px",
      overflowY: "auto",
      overflowx: "auto",
      "&::-webkit-scrollbar": {
        width: "8px",
        height: "10px",
        backgroundColor: "#e5e4e2",
      },
      "&::-webkit-scrollbar-thumb": {
        borderRadius: "10px",
        backgroundColor: "grey",
      },
    },
    "& .MuiTableRow-root": {
      cursor: "pointer",
      transition: "all 0.1s linear",

      "&:hover": {
        backgroundColor: "white !important",
        boxShadow: "0 1px 5px 0px #0003",
        transform: "scale(1.01)",

        "& .MuiTableCell-body": {
          backgroundColor: "white !important",
        },
      },
    },
  },
  dataCell: {
    fontSize: "0.9rem",
    // padding: 7,
    borderRadius: 1,
    minHeight: 0,
    maxwidth: "300px",
    overFlow: "auto",
    // textOverflow: "ellipsis",
    // whiteSpace: "normal",
    position: "relative",
    width: "100%",
    whiteSpace: "pre-wrap",
    // "&:hover": {
    //   outline: `1px solid ${theme.palette.primary.main}`,
    //   overflow: "visible",
    //   zIndex: 1,
    //   whiteSpace: "normal",
    //   background: "white",
    // },
    "&.Mui-focused": {
      outline: `2px solid ${theme.palette.primary.main}`,
    },
  },
  input: {
    maxWidth: "200px", // Set maxWidth on the input element as well
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  kpinput: {
    maxWidth: "500px",
    fontSize: "0.9rem",
    minHeight: "30px",
    width: "100%",
    whiteSpace: "pre-wrap",
    overflow: "auto",
    padding: "8px",
    boxSizing: "border-box",
    // border: `1px solid ${theme.palette.grey[300]}`,
    borderRadius: "4px", // Border radius
    "&:focus": {
      border: `2px solid ${theme.palette.primary.main}`, // Change border on focus
    },
  },
  selectCell: {
    borderRadius: 3,
    overflow: "hidden",

    "&.GET": {
      background: "#478eff",
    },
    "&.POST": {
      background: "#3eb848",
    },
    "&.PATCH": {
      background: "#1ed4b2",
    },
    "&.MANUAL": {
      background: "#4da6ff",
    },
    "& .MuiSelect-root.Mui-disabled": {
      color: "#666", // Change the color for disabled state
      background: "#4da6ff", // Change the background color for disabled state
    },
  },
  rows: {
    "& . MuiSelect-outlined.MuiSelect-outlined": {
      padding: "25px",
    },
    "& . MuiOutlinedInput-inputMarginDense": {
      paddingTop: "5.5px",
      paddingBottom: " 5.5px",
    },
  },
  selectType: {
    borderRadius: 3,
    overflow: "hidden",

    "&.Increase": {
      background: " #99e6ff",
    },
    "&.Decrease": {
      background: "#ccccff",
    },
    "&.Maintain": {
      background: "#ffffcc",
    },
    "&.Range": {
      background: "#ffcc99",
    },
    "& .MuiSelect-root.Mui-disabled": {
      color: "#666", // Change the color for disabled state
      background: "#4da6ff", // Change the background color for disabled state
    },
  },
  selectFrequency: {
    borderRadius: 3,
    // overflow: "hidden",

    "&.DAILY": {
      background: "#adebad",
    },
    "&.MONTHLY": {
      background: "#33cc33",
    },
    "&.QUARTERLY": {
      background: " #ffb3b3",
    },
    "&.YEARLY": {
      background: "#ffff33",
    },
    "&.HALF-YEARLY": {
      background: "#ffe680",
    },
    "& .MuiSelect-root.Mui-disabled": {
      color: "#666", // Change the color for disabled state
      background: "#4da6ff", // Change the background color for disabled state
    },
  },
  footer: {
    display: "flex",
    alignItems: "space-between",
    justifyContent: "flex-end",
    paddingTop: 17,
    overflowX: "hidden",
  },
}));

export default useStyles;
