import { makeStyles, createStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      width: "100%",
      maxHeight: "calc(96vh - 15vh)", // Adjust the max-height value as needed
      // hight:"100%",
      overflowY: "auto",
      overflowX: "hidden",
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
    questionContainer: {
      padding: "2rem clamp(1rem, 70px, 2rem)",
      borderRadius: "10px",
      background: "white",
      minWidth: "82%",
      maxWidth: 900,
      position: "relative",
      border: `1px solid ${theme.palette.primary.main}`,
    },
    questionHeader: {
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "center",
      paddingBottom: "2rem",
      gap: "1.5rem",
      minWidth: "82%",
    },
    sectionHeader: {
      padding: "30px clamp(1rem, 70px, 2rem)",
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "center",
      gap: "1.5rem",
      borderTop: `10px solid ${theme.palette.primary.light}`,
      borderRadius: "10px",
      background: "white",
      boxShadow: theme.shadows[2],
      maxWidth: 900,
      minWidth: "82%",
    },

    sectionContainer: {
      padding: "clamp(1rem, 70px, 2rem)",
      borderTop: `1px solid ${theme.palette.primary.main}`,
      borderRadius: "10px",
      minWidth: "82%",
    },
    text: {
      fontSize: theme.auditFont.medium,
      color: theme.palette.primary.main,
    },
    attachButton: {
      backgroundColor: theme.palette.primary.light,
      color: theme.textColor.white,
      "&:hover": {
        backgroundColor: theme.palette.primary.main,
      },
    },
    attachButtonRight: {
      backgroundColor: theme.palette.primary.light,
      color: theme.textColor.white,
      "&:hover": {
        backgroundColor: theme.palette.primary.main,
      },
      position: "absolute",
      right: "-70px",
      top: "40%",
      display: "none",
      [theme.breakpoints.up("md")]: {
        display: "block",
      },
    },
    questionBody: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "1rem",
    },

    form: {
      padding: theme.typography.pxToRem(20),
      borderRadius: theme.typography.pxToRem(10),
      backgroundColor: "#FFFFFF",
      minHeight: "40vh",
    },
    formTextPadding: {
      padding: theme.typography.pxToRem(10),
      fontSize: theme.typography.pxToRem(13),
    },
    formBox: {
      width: "100%",
      paddingBottom: theme.typography.pxToRem(25),
    },
    discardBtn: {
      fontSize: theme.typography.pxToRem(13),
      color: theme.palette.primary.light,
      marginRight: theme.typography.pxToRem(20),
    },

    formControl: {
      minWidth: "100%",
    },
    addBtnMobileContainer: {
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "start",
      [theme.breakpoints.up("md")]: {
        display: "none",
      },
    },

    attachBtnContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      [theme.breakpoints.up("md")]: {
        alignItems: "flex-end",
      },
    },
    fileName: {
      fontSize: theme.typography.pxToRem(13),
      color: theme.palette.primary.light,
      textOverflow: "ellipsis",
      overflow: "hidden",
      width: "160px",
      whiteSpace: "nowrap",
      textAlign: "right",
    },
    checklistHeader: {
      backgroundColor: theme.textColor.white,
      padding: "clamp(1rem, 70px, 2rem)",
      marginBottom: theme.spacing(2),
      borderRadius: "10px",
    },
    headerInfo: {
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
      [theme.breakpoints.up("sm")]: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      },
      [theme.breakpoints.up("md")]: {
        justifyContent: "flex-end",
      },
    },

    headerChecklist: {
      border: "1px solid red",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    questions: {
      border: `1px solid ${theme.palette.primary.light}`,
      color: theme.palette.primary.light,
      padding:
        theme.typography.pxToRem(10) + " " + theme.typography.pxToRem(20),
      borderRadius: "5px",
      textAlign: "center",
      [theme.breakpoints.between("sm", "md")]: {
        flexGrow: 1,
      },
    },
    score: {
      textAlign: "center",
      border: "1px solid #08AE2D",
      color: theme.textColor.white,
      backgroundColor: "#08AE2D",
      padding:
        theme.typography.pxToRem(10) + " " + theme.typography.pxToRem(20),
      borderRadius: "5px",
      [theme.breakpoints.between("sm", "md")]: {
        flexGrow: 1,
      },
    },
    fabBtn: {
      position: "fixed",
      bottom: 50,
      right: 50,
      backgroundColor: theme.palette.primary.light,
      color: "#fff",
      "&:hover": {
        backgroundColor: theme.palette.primary.light,
      },
    },
    ncTag: {
      fontSize: "0.7em",
      fontWeight: "bold",
      background: "rgba(231,68,50,0.9)",
      color: "white",
      textTransform: "uppercase",
      borderRadius: "4px",
      padding: "6px",
    },
    obsTag: {
      fontSize: "0.7em",
      fontWeight: "bold",
      background: "blue",
      color: "white",
      textTransform: "uppercase",
      borderRadius: "4px",
      padding: "6px",
    },
    ofiTag: {
      fontSize: "0.7em",
      fontWeight: "bold",
      background: "green",
      color: "white",
      textTransform: "uppercase",
      borderRadius: "4px",
      padding: "6px",
    },
    scrollContainer:{
        display:"flex",
        alignItems:"center",
        gap:"10px"
    },
    scrollWrapper:{
      display:"flex",
      overFlow:"hidden",
      width:"100px",
      scrollBehavior:"smooth",
      whiteSpace:"nowrap"
    },
    scrollItem:{
      minWidth:"100px",
      padding:"10px",
      background:"lightgrey",
      border:"1px solid grey",
      textAlign:"center",
      marginRight:"5px"
    },
    scrollButton:{
      cursor:"pointer",
      padding:"5px 10px",
      fontSize:"12px",
      border:"none",
      background:"#007bff",
      color:"#fff",
      borderRadius:"5px"
    },
    disabledInput: {
      color: "black !important",
      backgroundColor: "white !important",
    },
    disabledChip: {
      backgroundColor: "white !important",
      color: "black !important",
    },
    popupIndicator: {
      color: "black !important",
    },
   mobileScreen:{
    "&.MuiAccordionDetails-root":{
      padding:"8px 8px 8px 8px"
    }
   },
   divContainer: {
    padding: "5px 0px",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: "100%",
    margin: "auto",
    fontSize: "13px",
    // backgroundColor: "#EAF3FA", 
  },
  textBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  boldText: {
    fontWeight: 600,
    fontSize: "13px",
  },
  numberText: {
    fontWeight: "bold",
    fontSize: "22px",
  },
  scoreContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  scoreText: {
    fontWeight: 600,
    fontSize: "16px",
    marginBottom: "5px", // Space between Score and Circle
    color:"#fff"
  },
  scoreCircle: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    backgroundColor: "#032D5A",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  scoreValue: {
    color: "white",
    fontWeight: "bold",
    fontSize: "18px",
  },
  uploadButton: {
    backgroundColor: "#003366",
    color: "#fff",
    // padding: theme.spacing(1, 2),
    width:"90%",
    textTransform: "none",
    "&:hover": {
      backgroundColor: "#002855",
    },
  },
  fileList: {
    marginTop: theme.spacing(2),
    borderRadius: 8,
    border: "1px solid #ddd",
    padding: theme.spacing(1),
  },
  fileItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  fileInfo: {
    display: "flex",
    alignItems: "center",
  },
  fileIcon: {
    marginRight: theme.spacing(2),
  },
  fileDetails: {
    flexGrow: 1,
  },
  })
);

export default useStyles;
