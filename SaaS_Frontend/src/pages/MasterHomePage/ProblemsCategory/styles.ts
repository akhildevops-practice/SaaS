import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  table: {
    backgroundColor: "#FFFFFF",
    borderRadius: "9px",
    width: "100%",
    "& thead th": {
      padding: theme.spacing(1),
      backgroundColor: "#D7E5F6",
      color: theme.palette.primary.main,
      zIndex: 0,
      borderBottom: "1px solid #808080;",
      textAlign:"center",
      
      "& p":{
        fontWeight:"bold",
        fontFamily:"'poppinsregular !important'",
        fontSize:"0.725rem !important"
       
      }
    },
  },
  tableHeaderColor: {
    color: theme.palette.primary.main,
  },
  tableCell: {
    fontSize: theme.typography.pxToRem(12),
    paddingLeft: theme.spacing(1), //removing for testing
    paddingRight: theme.spacing(1), //removing for testing
    height: theme.typography.pxToRem(10),
    borderBottom: "1px solid rgba(104, 104, 104, 0.1);",
    borderRight: "1px solid rgba(104, 104, 104, 0.1);",
    alignContent:"center",
    minWidth:"170px",
    textAlign:"center"
  },
  claimCell:{
    fontSize: theme.typography.pxToRem(12),
    paddingLeft: theme.spacing(1), //removing for testing
    paddingRight: theme.spacing(1), //removing for testing
    height: theme.typography.pxToRem(10),
    borderBottom: "1px solid rgba(104, 104, 104, 0.1);",
    borderRight: "1px solid rgba(104, 104, 104, 0.1);",
    alignContent:"center",
    minWidth:"80px",
  },
  partCell:{
    fontSize: theme.typography.pxToRem(12),
    paddingLeft: theme.spacing(1), //removing for testing
    paddingRight: theme.spacing(1), //removing for testing
    height: theme.typography.pxToRem(10),
    borderBottom: "1px solid rgba(104, 104, 104, 0.1);",
    borderRight: "1px solid rgba(104, 104, 104, 0.1);",
    alignContent:"center",
    minWidth:"200px"
  },
  tableCellWithoutAction: {
    fontSize: theme.typography.pxToRem(12),
    paddingLeft: theme.spacing(2), //removing for testing
    paddingRight: theme.spacing(2),
    height: theme.typography.pxToRem(10),
    borderBottom: "1px solid rgba(104, 104, 104, 0.1);",
    borderRight: "1px solid rgba(104, 104, 104, 0.1);",
  },
  root: {
    padding: 0,
  },
  tableContainer: {
    width: "100%",
    // maxHeight: theme.typography.pxToRem(20)
    paddingTop: theme.typography.pxToRem(20),
  },
  imgContainer: {
    display: "flex",
    justifyContent: "center",
  },
  emptyDataText: {
    fontSize: theme.typography.pxToRem(14),
    color: theme.palette.primary.main,
  },
  loader: {
    display: "flex",
    justifyContent: "center",
  },
  filterButtonContainer: {
    [theme.breakpoints.down("sm")]: {
      position: "fixed",
      bottom: theme.typography.pxToRem(50),
      right: theme.typography.pxToRem(20),
    },
  },
  fabButton: {
    fontSize: theme.typography.pxToRem(12),
    backgroundColor: theme.palette.primary.light,
    color: "#fff",
    margin: "0 5px",
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    },
  },
  smallDatePicker: {
    '& .MuiInputBase-input': {
      padding: '5px', // Adjust the padding as needed to make it smaller
      fontSize: '12px', // Adjust the font size as needed to make it smaller
      width: '100px',
      '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
        appearance: 'none',
        margin: 0,
      }, // Adjust the width as needed to make it smaller
    },
    '& .MuiSvgIcon-root': {
      // display: 'none', // Hide the calendar icon
    },
  },
  iconButton:{
      width:"10px !important",
      marginRight:"2px"
    
  }
  
}));

export default useStyles;
