import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  grow: {},
  root: {
    backgroundColor: theme.palette.primary.main,
    color: theme.textColor.black,
    height: theme.typography.pxToRem(89),
  },
  fullList: {
    width: "auto",
    height: "100vh",
    backgroundColor: theme.palette.primary.light,

    display: "flex",
    flexDirection: "column",
    justifyContent: "start",
  },
  title: {
    [theme.breakpoints.up("sm")]: {
      display: "block",
    },
  },
  logoMargin: {
    marginTop: theme.typography.pxToRem(35),
  },
  navTopArea: {
    width: "auto",
    display: "flex",
    justifyContent: "space-between",
    paddingLeft: theme.typography.pxToRem(20),
    paddingRight: theme.typography.pxToRem(4),
    height: theme.typography.pxToRem(89),
  },
  orgNameTextSection: {
    position: "absolute",
    marginLeft: theme.typography.pxToRem(60),
    marginBottom: theme.typography.pxToRem(4),
    borderLeft: "1px solid #fff",
    top: theme.typography.pxToRem(32),
  },
  orgNameText: {
    fontSize: theme.typography.pxToRem(13),
    marginLeft: theme.typography.pxToRem(6),
    color: "#fff",
  },
  avatar: {
    color: theme.textColor.primary,
    backgroundColor: "white",
    fontSize: theme.typography.pxToRem(13),
  },
  logout: {
    backgroundColor: "transparent",
    padding: "1rem",
    color: theme.textColor.white,
    // position: "fixed",
    // bottom: 0,
  },
  logout_header: {
    minWidth: "200px",
    display: "flex",
    gap: "1rem",
    alignItems: "center",
    paddingBottom: "1rem",
  },
  logout_subtitle: {
    opacity: "0.5",
  },
  logout_button: {
    backgroundColor: theme.palette.primary.light,
  },
  logout_input: {
    display: "none",
  },
  logout_divider: {
    marginTop: "-1rem",
    marginBottom: "0.5rem",
  },
  logout_upload: {
    position: "relative",
  },

  camera_img_container: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "white",
    height: "20px",
    width: "20px",
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    border: "1px solid rgba(0, 0, 0, 0.15)",
  },
  camera_icon: {
    padding: 2,
    borderRadius: "100%",
    width: "15px",
  },
}));

export default useStyles;
