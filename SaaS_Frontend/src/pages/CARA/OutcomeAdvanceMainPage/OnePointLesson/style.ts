import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles<Theme>((theme: Theme) => ({
  mainPageContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    marginTop: "100px",
  },
  IsNotContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
  },
  textContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  IsNotText: {
    fontSize: "36px",
    fontWeight: "bold",
    letterSpacing: "0.8px",
    lineHeight: 0.61,
    fontFamily: "Poppins",
    margin: "20px 0px",
  },
  text: {
    fontSize: "16px",
    fontWeight: 600,
    letterSpacing: "0.8px",
    lineHeight: 1.38,
    fontFamily: "Poppins",
    margin: "0px 0px",
    width: "550px",
    textAlign: "center",
  },
  textArea: {
    "&.ant-input-disabled": {
      color: "black !important",
      WebkitTextFillColor: "black !important", // for Safari
    },
  },

  parentdiv: {
    // border: "1px solid #c0c0c0",
    // border: "1px solid black",
    width: "80vw",
    paddingLeft: "11vw",
    margin: "-20px 0px 0px 0px",
    // marginLeft: "10%",
  },

  tableContainer: {
    marginTop: "1%",
    // maxHeight: "calc(70vh - 14vh)", // Adjust the max-height value as needed
    overflowY: "auto",
    overflowX: "hidden",
    margin: "20px",
    padding: "10px",
    "& .ant-table": {
      borderRight: "1px solid #dadada",
      borderBottom: "1px solid #dadada", // Ensure the table itself has a border
    },
    "&.MuiPaper-root .MuiTableContainer-root .MuiPaper-outlined .MuiPaper-rounded":
      {
        "& .ant-table-body::-webkit-scrollbar": {
          width: "5px",
          height: "5px",
          backgroundColor: "#e5e4e2",
        },
      },
    "& .ant-table-body::-webkit-scrollbar": {
      width: "5px",
      height: "5px",
      backgroundColor: "#e5e4e2",
    },
    "& .ant-table-body::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "grey",
    },
    "& .ant-table-wrapper .ant-table.ant-table-bordered > .ant-table-container > .ant-table-summary > table > tfoot > tr > td":
      {
        // borderInlineEnd: "none",
        // borderBottom: "#00224E",
        padding: "20px 10px",
      },
    // "&.ant-table-wrapper .ant-table.ant-table-bordered >.ant-table-container >.ant-table-content >table":

    //   {
    //     borderRight: "1px solid #dadada",
    //   },
    "& .ant-table-thead .ant-table-cell": {
      backgroundColor: "#E8F3F9",
      color: "#00224E",
      borderBottom: "1px solid #00224E",
      padding: "20px 10px",
    },
    "& span.ant-table-column-sorter-inner": {
      color: "#00224E",
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
    "& .ant-table-wrapper .ant-table-thead > tr > th": {
      position: "sticky",
      top: 0,
      zIndex: 2,
      fontWeight: 600,
      fontSize: "14px",
      padding: "22px 8px !important",
      lineHeight: "24px",
      textAlign: "center",
      border: "1px solid #dadada",
    },
    "& .ant-table-tbody > tr > td": {
      borderBottom: "black",
      padding: "15px 10px !important",
      textAlign: "center",
      border: "1px solid #dadada",
    },
    "& tr.ant-table-row": {
      cursor: "pointer",
      transition: "all 0.1s linear",
    },
  },
  documentTable: {
    "&::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "grey",
    },
  },
}));

export default useStyles;
