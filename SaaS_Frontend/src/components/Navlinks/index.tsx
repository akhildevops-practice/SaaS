import { useEffect } from "react";
import ListItem from "@material-ui/core/ListItem";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";

import Link from "@material-ui/core/Link";
import { Link as RouterLink } from "react-router-dom";
import { IconButton, ListItemText } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  icon: {
    fontSize: theme.typography.pxToRem(0),
    marginLeft: theme.typography.pxToRem(0),
    marginRight: theme.typography.pxToRem(0),
  },
  iconSide: {
    fontSize: theme.typography.pxToRem(10),
    marginLeft: theme.typography.pxToRem(3),
    minWidth: theme.typography.pxToRem(37),
  },
  listItemTextMain: {
    fontSize: theme.typography.pxToRem(12),
    color: theme.textColor.white,
  },
  selectedIcon: {
    backgroundColor: "#ffffff44",
    borderRadius: 5,
  },
  listItemTextSideSub: {
    fontSize: theme.typography.pxToRem(12),
    color: theme.textColor.white,
  },
  iconSideSub: {
    marginLeft: theme.typography.pxToRem(2),
    minWidth: theme.typography.pxToRem(40),
  },
  linkLabel: {
    color: "white",
    // fontSize: "0.7rem",
    padding: "5px",
    // margin: 0,
    fontSize: "15px",
    fontWeight: 700,
    fontFamily: "Poppins !important",
  },
  leftSideText: {
    color: "#FFF",
    textShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
    fontSize: "12px",
    fontFamily: "Poppins !important",
    fontWeight: 700,
    textTransform: "uppercase",
    padding : "1px",
  },
}));

type Props = {
  text: any;
  icon: any;
  mobile?: boolean;
  sub?: boolean;
  activeTab?: any;
  setActiveTab?: any;
  handleDrawerClose?: () => void;
  setOpen?: any;
  subParent?: string;
  handleLogout?: any;
};

/**
 * This the main component that handles the routing from the Appbar
 * It handles routing for both mobile and Desktop View
 *
 */

function Navlinks({
  text,
  icon,
  activeTab,
  setActiveTab,
  mobile = false,
  sub = false,
  handleDrawerClose,
  setOpen = () => {},
  subParent,
  handleLogout,
}: Props) {
  const classes = useStyles();

  useEffect(() => {
    if (
      activeTab === "audit" ||
      activeTab === "master" ||
      // activeTab === "processdocuments" ||
      activeTab === "dashboard" ||
      activeTab === "objective" ||
      activeTab === "kpi" ||
      activeTab === "risk" ||
      activeTab === "mrm"
    )
      setOpen(true);
    else setOpen(false);
  }, [activeTab]);

  const link = text.replace(/\s+/g, "");

  if (mobile) {
    return (
      <Link
        component={RouterLink}
        to={
          sub
            ? `${subParent
                ?.replace(/\s+/g, "")
                .toLowerCase()}/${link.toLowerCase()}`
            : `/${link.toLowerCase()}`
        }
        key={text}
        style={{ textDecoration: "none", display: "block" }}
      >
        <Tooltip title={text}>
          <ListItem
            button
            key={text}
            style={{ height: 48 }}
            data-testid="expanding-sub-list-sub-item"
            onClick={() => {
              if (handleDrawerClose) {
                if (handleLogout) {
                  handleLogout();
                }
                handleDrawerClose();
              }
            }}
          >
            {/* <ListItemIcon
              className={sub ? classes.iconSideSub : classes.iconSide}
            >
              {icon}
            </ListItemIcon> */}
            <ListItemText
              classes={
                sub
                  ? { primary: classes.listItemTextSideSub }
                  : { primary: classes.listItemTextMain }
              }
              primary={text}
            />
          </ListItem>
        </Tooltip>
      </Link>
    );
  }

  if (link.toLowerCase() === activeTab.replace(/\s+/g, "").toLowerCase()) {
    if (
      text === "Process Documents" ||
      text === "Master" ||
      text === "Audit" ||
      text === "Dashboard" ||
      text === "Objective"
    ) {
      setOpen(true);
    }
    return (
      <Link
        key={text}
        component={RouterLink}
        to={`/${link.toLowerCase()}`}
        style={{ textDecoration: "none" }}
      >
        {text === "Inbox" ? (
          <Tooltip title="Inbox">
            <IconButton
              key={text}
              data-testid="link-icon-button"
              style={{ minWidth: 30, width: 30, minHeight: 30, height: 30 }}
            >
              <div className={classes.icon}>{icon}</div>
            </IconButton>
          </Tooltip>
        ) : (
          <>
            {/* <IconButton
              key={text}
              data-testid="link-icon-button"
              style={{ minWidth: 30, width: 30, minHeight: 30, height: 30 }}
            >
              <div className={classes.icon}>{icon}</div>
            </IconButton> */}

            <Typography component="p" className={classes.linkLabel}>
              {text}
            </Typography>
          </>
        )}
      </Link>
    );
  }

  return (
    <Link
      key={text}
      component={RouterLink}
      to={`/${link.toLowerCase()}`}
      onClick={() => {
        setActiveTab(text.replace(/\s+/g, "").toLowerCase());
      }}
      style={{ textDecoration: "none"}}
    >
      {text === "Inbox" ? (
        <Tooltip title="Inbox">
          <IconButton
            key={text}
            data-testid="link-icon-button"
            style={{ minWidth: 30, width: 30, minHeight: 30, height: 30, marginRight : "220px", paddingRight :"20px" }}
          >
            <div className={classes.icon}>{icon}</div>
            <span className={classes.leftSideText}>Inbox</span>
          </IconButton>
        </Tooltip>
      ) : (
        <>
          {/* <IconButton
            key={text}
            data-testid="link-icon-button"
            style={{ minWidth: 30, width: 30, minHeight: 30, height: 30 }}
          >
            <div className={classes.icon}>{icon}</div>
          </IconButton> */}

          <Typography component="p" className={classes.linkLabel}>
            {text}
          </Typography>
        </>
      )}
    </Link>
  );
}

export default Navlinks;
