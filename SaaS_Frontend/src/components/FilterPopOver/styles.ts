import { makeStyles, Theme } from "@material-ui/core/styles";

export interface StyleProps {
  matches: boolean;
}

const useStyles = makeStyles<Theme, StyleProps>((theme: Theme) => ({
  content: {
    // paddingTop: theme.typography.pxToRem(10),
    // paddingRight: theme.typography.pxToRem(0),
    padding: "20px 20px 20px 20px",
  },
  root: {
    "& > *": {
      margin: theme.spacing(1),
    },
    display: "flex",
    justifyContent: "flex-end",
    position: "fixed",
    bottom: 30,
    right: 10,
    opacity: 1,
    zIndex: 10,
  },
  extendedIcon: {
    marginRight: theme.spacing(1),
  },
  title: {
    marginTop: theme.typography.pxToRem(15),
    marginLeft: theme.typography.pxToRem(15),
    color: "black",
    fontSize: "20px",
    fontWeight: 600,
  },
  navTopArea: {
    width: "auto",
    display: "flex",
    justifyContent: "flex-start",
    backgroundColor: "#e8f3f9",
    borderRadius: "12px 12px 0 0",
    borderBottom: "2px solid #EFEFEF",
  },
  resultTextStyle: {
    fontSize: 12,
    padding: "12px 0px 0px 10px",
  },
  btnSection: {
    paddingTop: theme.typography.pxToRem(20),
    // paddingRight: theme.typography.pxToRem(50),
    // paddingBottom: theme.typography.pxToRem(10),
    display: "flex",
    justifyContent: "flex-end",
  },
  paperStyle: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "visible",
    width: ({ matches }) => (matches ? "30%" : "90%"),
  },
  arrowbtn: {
    color: "black",
    width: "32",
    height: "32",
  },
  topFilterCount: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  filterBtn: {
    backgroundColor: "#0E497A",
    color: "white",
    width: "100px",
    borderRadius: "5px",
    // fontSize: "18px",
    // fontWeight: "bold",
    height: "35px",
    // marginRight: "10px",
  },
}));

export default useStyles;
