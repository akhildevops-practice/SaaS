import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  modal: {
    "& .ant-modal-header": {
      textAlign: "center",
    },
  },
  form: {
    // padding: theme.typography.pxToRem(20),
    // borderRadius: theme.typography.pxToRem(10),
    // backgroundColor: "#FFFFFF",
    // minHeight: "100%",
  },
  formTextPadding: {
    // padding: theme.typography.pxToRem(14),
    // fontSize: theme.typography.pxToRem(13),
  },
  formBox: {
    width: "100%",
    // paddingBottom: theme.typography.pxToRem(25),
  },

  moduleformBox: {
    width: 10,
    paddingBottom: theme.typography.pxToRem(25),
  },

  accordionStyle: {
    paddingLeft: theme.typography.pxToRem(16),
    paddingBottom: theme.typography.pxToRem(8),
  },

  sendBtn: {
    fontSize: theme.typography.pxToRem(15),
    color: "#FFFFFF",
    marginRight: theme.typography.pxToRem(20),
    backgroundColor: theme.palette.primary.light,
  },
  buttonSection: {
    display: "flex",
    justifyContent: "flex-end",
    paddingTop: theme.typography.pxToRem(60),
  },
  paper: {
    position: "absolute",
    width: 30,
    backgroundColor: "green",
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    // padding: theme.spacing(2, 4, 3),
  },
  formControl: {
    minWidth: "100%",
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
}));

export default useStyles;
