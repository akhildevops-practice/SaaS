import { makeStyles, Theme } from "@material-ui/core/styles";
export interface StyleProps {
  appHeaderColor: string;
}
const useStyles = makeStyles<Theme, StyleProps>((theme) => ({
  root: {
    backgroundColor: "#115B8C",
    color: theme.textColor.black,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    display: "none",
    [theme.breakpoints.up("sm")]: {
      display: "block",
    },
  },
  divider: {
    height: theme.typography.pxToRem(23),
    borderRadius: theme.typography.pxToRem(0),
    borderRight: "1px solid #FFFFFF",
    paddingRight: theme.typography.pxToRem(20),
  },
  orgNameTextSection: {
    position: "absolute",
    marginLeft: theme.typography.pxToRem(60),
    marginBottom: theme.typography.pxToRem(4),
    borderLeft: "1px solid #fff",
  },
  orgNameText: {
    fontSize: theme.typography.pxToRem(13),
    marginLeft: theme.typography.pxToRem(10),
    color: "#fff",
  },
  badge: {
    "& .MuiBadge-badge": {
      right: -5,
      top: -5,
      width: 1,
      height: 20,
    },
  },
  popover_btn: {
    marginLeft: theme.typography.pxToRem(22),
    padding: 4,
  },
  avatar: {
    color: theme.textColor.primary,
    backgroundColor: "white",
    fontSize: theme.typography.pxToRem(13),
  },
  logout: {
    backgroundColor: theme.textColor.white,
    padding: "1rem",
    position: "relative",
    marginTop: theme.typography.pxToRem(10),
    "&::before": {
      backgroundColor: "white",
      content: '""',
      display: "block",
      position: "absolute",
      width: 12,
      height: 12,
      top: -6,
      transform: "rotate(45deg)",
      left: "calc(90%)",
    },
  },
  logout_header: {
    minWidth: "250px",
    display: "flex",
    gap: "1rem",
    alignItems: "center",
    paddingBottom: "1rem",
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
