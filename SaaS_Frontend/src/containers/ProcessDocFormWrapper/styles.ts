import { makeStyles } from "@material-ui/core/styles";


const useStyles = makeStyles((theme) => ({
  paper: {
    backgroundColor: "#FFFFFF",
    borderRadius: theme.typography.pxToRem(10),
    height: "100%",
  },
  btn: {
    marginBottom: theme.typography.pxToRem(10),
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
  },
  headerMobile: {
    display: "block",
  },
  discardBtn: {
    color: theme.palette.primary.light,
    border: `1px solid ${theme.palette.primary.light}`,
    width: theme.typography.pxToRem(87),
    height: theme.typography.pxToRem(34),
  },
  commentsIcon: {
    fill: "#0E497A",
    cursor: "pointer",
    width: "28px",
    height: "37px",
    // marginRight: "30px",
  },

  imIcon: {
    fill: "#0E497A",
    cursor: "pointer",
    width: "28px",
    height: "37px",
    // marginRight: "30px",
  },

  submitBtn: {
    backgroundColor: theme.palette.primary.light,
    color: "#fff",
    width: theme.typography.pxToRem(87),
    height: theme.typography.pxToRem(34),
    marginLeft: theme.typography.pxToRem(10),
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    },
  },
  mobViewBtnSection: {
    display: "flex",
    justifyContent: "center",
    marginTop: theme.typography.pxToRem(20),
  },
  submitBtnMobile: {
    backgroundColor: theme.palette.primary.light,
    color: "#fff",
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    },
  },
  formContainer: {
    zIndex: 0,
    marginTop: theme.typography.pxToRem(20),
    backgroundColor: "#F7F7FF",
    borderRadius: theme.typography.pxToRem(10),
  },
  formInfoSection: {
    border: "1px solid #6E7DAB",
    // color: "#6E7DAB",
    borderRadius: theme.typography.pxToRem(5),
    paddingTop: theme.typography.pxToRem(7),
    paddingLeft: theme.typography.pxToRem(7),
    paddingRight: theme.typography.pxToRem(7),
    paddingBottom: theme.typography.pxToRem(8),
    // height: theme.typography.pxToRem(20),
    marginRight: theme.typography.pxToRem(10),
  },
  formInfoSectionMobile: {
    border: "1px solid #6E7DAB",
    color: "#6E7DAB",
    borderRadius: theme.typography.pxToRem(5),
    paddingTop: theme.typography.pxToRem(7),
    paddingLeft: theme.typography.pxToRem(7),
    paddingRight: theme.typography.pxToRem(7),
    paddingBottom: theme.typography.pxToRem(8),
    // height: theme.typography.pxToRem(20),
    textAlign: "center",
    marginBottom: theme.typography.pxToRem(10),
  },
  starIcon: {
    color: "#FF0000",
    // marginRight: "30px",
    width: "32px",
    height: "35px",
    cursor: "pointer",
  },
  visibilityIcon: {
    cursor: "pointer"
  },
  compareIcon: {
    cursor: "pointer"
  },
}));

export default useStyles;
